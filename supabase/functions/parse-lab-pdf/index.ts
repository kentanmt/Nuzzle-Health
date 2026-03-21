import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PARSE_PROMPT = `You are a veterinary medical records parser. Extract all structured data from this veterinary document (lab report, vet visit summary, vaccine record, or wellness exam).

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "vet_name": "string or null",
  "lab_source": "string or null (e.g. IDEXX, Antech, Zoetis, In-house)",
  "test_date": "YYYY-MM-DD or null",
  "weight_value": number or null,
  "weight_unit": "lbs",
  "markers": [
    {
      "name": "marker name (e.g. ALT, BUN, Creatinine, WBC, HCT)",
      "value": number,
      "unit": "unit string (e.g. U/L, mg/dL, x10^3/uL)",
      "referenceMin": number or null,
      "referenceMax": number or null,
      "status": "normal or high or low or critical",
      "category": "cbc or chemistry or urinalysis or thyroid or other"
    }
  ],
  "vaccinations": [
    {
      "name": "vaccine name (e.g. Rabies, DA2PP, Bordetella, FVRCP, FeLV)",
      "date_administered": "YYYY-MM-DD or null",
      "date_due": "YYYY-MM-DD or null",
      "lot_number": "string or null",
      "manufacturer": "string or null"
    }
  ],
  "care_recommendations": [
    {
      "type": "followup or medication or screening or diet or other",
      "title": "short title max 6 words",
      "description": "specific detail from the document",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low or medium or high"
    }
  ]
}

Rules:
- Extract ALL lab markers with their numeric values and reference ranges
- If a marker is flagged H HIGH L LOW HH LL or * set status accordingly as high low or critical
- Normal means within reference range
- Convert weight to lbs if in kg (1 kg = 2.205 lbs)
- Include ALL vaccinations mentioned whether administered today or historical
- Include vet recommendations follow-up instructions and medications prescribed
- If a field is not present in the document use null
- markers array can be empty if no lab values found
- Return ONLY the JSON object nothing else`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { pet_record_id } = await req.json();
    if (!pet_record_id) throw new Error("pet_record_id is required");

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData } = await supabaseUser.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    if (!userId) throw new Error("Unauthorized");

    // Get the record
    const { data: record, error: recordError } = await supabaseService
      .from("pet_records")
      .select("*")
      .eq("id", pet_record_id)
      .eq("user_id", userId)
      .single();

    if (recordError || !record) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already parsed
    const { data: existing } = await supabaseService
      .from("parsed_lab_results")
      .select("id")
      .eq("pet_record_id", pet_record_id)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: "Already parsed", id: existing[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download PDF from storage
    const { data: fileData, error: fileError } = await supabaseService.storage
      .from("pet-records")
      .download(record.file_url);

    if (fileError || !fileData) {
      throw new Error(`Failed to download file: ${fileError?.message}`);
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Pdf = btoa(binary);

    // Send to Gemini with PDF inline
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf,
                  },
                },
                { text: PARSE_PROMPT },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini parse error:", geminiRes.status, errText);
      throw new Error(`Gemini parsing failed: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error("No content from Gemini");

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse Gemini response:", rawContent);
      throw new Error("Could not parse Gemini response as JSON");
    }

    const testDate = parsed.test_date || record.record_date || null;

    // Insert into parsed_lab_results
    const { data: insertData, error: insertError } = await supabaseService
      .from("parsed_lab_results")
      .insert({
        pet_record_id: record.id,
        pet_id: record.pet_id,
        user_id: record.user_id,
        vet_name: parsed.vet_name || null,
        lab_source: parsed.lab_source || null,
        test_date: testDate,
        markers: parsed.markers || [],
        vaccinations: parsed.vaccinations || [],
        care_recommendations: parsed.care_recommendations || [],
        weight_value: parsed.weight_value || null,
        weight_unit: parsed.weight_unit || "lbs",
        raw_text: rawContent,
      })
      .select()
      .single();

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    console.log(
      `Parsed record ${pet_record_id}: ${(parsed.markers || []).length} markers, ${(parsed.vaccinations || []).length} vaccines`
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: insertData.id,
        markers_count: (parsed.markers || []).length,
        vaccinations_count: (parsed.vaccinations || []).length,
        care_recommendations_count: (parsed.care_recommendations || []).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("parse-lab-pdf error:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
