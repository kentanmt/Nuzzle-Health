import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pet_record_id } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: record, error: recErr } = await supabase
      .from("pet_records")
      .select("*")
      .eq("id", pet_record_id)
      .single();

    if (recErr || !record) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: fileData, error: dlErr } = await adminClient.storage
      .from("pet-records")
      .download(record.file_url);

    if (dlErr || !fileData) {
      console.error("Download error:", dlErr, "file_url:", record.file_url);
      return new Response(JSON.stringify({ error: "Could not download file", details: dlErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert veterinary medical record parser. Analyze this PDF document thoroughly and extract ALL available data. This could be a lab report, vaccination record, wellness exam, or any veterinary document.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "vet_name": "veterinarian name or null",
  "lab_source": "laboratory name or null",
  "test_date": "YYYY-MM-DD (extract the EXACT date from the report, not today's date) or null",
  "weight_value": number or null,
  "weight_unit": "lbs" or "kg",
  "markers": [
    {
      "name": "marker name (use standard abbreviation e.g. BUN not Blood Urea Nitrogen)",
      "value": number,
      "unit": "unit string",
      "referenceMin": number,
      "referenceMax": number,
      "category": "cbc|kidney|liver|glucose|thyroid|electrolytes|urinalysis"
    }
  ],
  "vaccinations": [
    {
      "name": "exact vaccine name (e.g. Rabies 3-Year, DHPP, DA2PP, Bordetella, Leptospirosis 4-way, Lyme, Canine Influenza H3N2/H3N8, FVRCP, FeLV)",
      "date_administered": "YYYY-MM-DD or null — extract the EXACT date from the document",
      "date_due": "YYYY-MM-DD (next due/expiration date) or null — if not stated, calculate based on standard schedules: Rabies 1yr or 3yr, DHPP/DA2PP 1-3yr, Bordetella 6-12mo, Leptospirosis 1yr, Lyme 1yr, Canine Influenza 1yr, FVRCP 1-3yr, FeLV 1yr",
      "lot_number": "string or null",
      "manufacturer": "string or null (e.g. Zoetis, Merck, Boehringer Ingelheim, Elanco)",
      "status": "current|overdue|due_soon — calculate based on due date vs today's date (${new Date().toISOString().split('T')[0]})"
    }
  ],
  "care_recommendations": [
    {
      "type": "retest|followup|diet|medication|vaccine_due|dental|screening",
      "title": "short title",
      "description": "brief recommendation",
      "due_date": "YYYY-MM-DD or null",
      "priority": "low|medium|high"
    }
  ]
}

VACCINATION PARSING RULES (CRITICAL):
- Extract EVERY individual vaccine as its own entry. Do NOT combine vaccines.
- If a vaccine certificate lists multiple vaccines, create a separate entry for each one.
- Look for: vaccine name, date given, date due/expires, lot/serial number, manufacturer.
- Common locations: vaccination certificates, wellness exam summaries, discharge summaries.
- If due date is missing, calculate it from the administration date using standard veterinary schedules.
- For combination vaccines (e.g. DHPP = Distemper + Hepatitis + Parainflo + Parvo), keep it as the combination name (DHPP or DA2PP), don't split into individual components.
- Set status based on due date vs today (${new Date().toISOString().split('T')[0]}): if due date is past → "overdue", within 30 days → "due_soon", else → "current".

CRITICAL DATE RULES:
- Extract the EXACT date printed on the lab report/document. Look for "Date:", "Report Date:", "Collection Date:", "Date of Service:", etc.
- If multiple dates exist, use the collection/test date, NOT the report print date.
- Format all dates as YYYY-MM-DD.
- For vaccine due dates: Rabies is typically due 1 or 3 years after administration. DHPP every 1-3 years. Bordetella every 6-12 months.

MARKER CATEGORIES:
- cbc: WBC, RBC, Hemoglobin (HGB), Hematocrit (HCT), MCV, MCH, MCHC, Platelets (PLT), Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, Reticulocytes, MPV, RDW
- kidney: BUN, Creatinine (CREA), SDMA, Phosphorus (PHOS), Calcium (CA), BUN/Creatinine Ratio
- liver: ALT, AST, ALP, GGT, Total Bilirubin (TBIL), Albumin (ALB), Total Protein (TP), Globulin (GLOB), A/G Ratio
- glucose: Glucose (GLU), Cholesterol (CHOL), Triglycerides (TRIG), Amylase (AMYL), Lipase (LIPA), Fructosamine
- thyroid: T4, Free T4 (fT4), TSH
- electrolytes: Sodium (NA), Potassium (K), Chloride (CL), Bicarbonate (HCO3), Na/K Ratio, Magnesium (MG), Iron (FE)
- urinalysis: Specific Gravity (USG), pH, UPC Ratio, Protein, Glucose (urine)

WEIGHT EXTRACTION:
- Look for "Weight:", "Body Weight:", "BW:", "Wt:" anywhere in the document.
- Convert to the unit found (lbs or kg).

REFERENCE RANGES:
- If range is "< X", use referenceMin=0, referenceMax=X
- If range is "> X", use referenceMin=X, referenceMax=(X*2)
- Extract EVERY marker you can find. Be thorough and precise with values.

Extract everything possible. If a section has no data, return an empty array for that field.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 12000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI parsing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";
    
    let cleanContent = rawContent.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch {
      console.error("Failed to parse AI response:", cleanContent);
      return new Response(JSON.stringify({ error: "Could not parse AI response", raw: cleanContent }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: result, error: insertErr } = await supabase
      .from("parsed_lab_results")
      .insert({
        pet_record_id: record.id,
        pet_id: record.pet_id,
        user_id: record.user_id,
        vet_name: parsed.vet_name || null,
        lab_source: parsed.lab_source || null,
        test_date: parsed.test_date || record.record_date,
        markers: parsed.markers || [],
        vaccinations: parsed.vaccinations || [],
        care_recommendations: parsed.care_recommendations || [],
        weight_value: parsed.weight_value || null,
        weight_unit: parsed.weight_unit || 'lbs',
        raw_text: cleanContent,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert error:", insertErr);
      return new Response(JSON.stringify({ error: "Failed to save results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
