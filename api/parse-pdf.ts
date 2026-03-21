import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PARSE_PROMPT = `You are a veterinary medical record parser. Extract structured data from this document.
The document may be a CBC panel, chemistry/metabolic panel, urinalysis, thyroid panel, wellness exam, vaccine record, or any combination. Handle output from IDEXX, Antech, Zoetis, in-house analyzers, and handwritten records.

## CRITICAL DEDUPLICATION RULE
Each unique marker name must appear EXACTLY ONCE in the markers array.
Many lab reports list the same test on multiple pages or in both a summary table and a detail table — output it ONLY ONCE using the value from the most detailed/prominent results section.

## MARKER NAME NORMALIZATION
Use standard short abbreviations:
- "Blood Urea Nitrogen" → "BUN", "Alanine Aminotransferase" or "ALT (SGPT)" → "ALT"
- "Aspartate Aminotransferase" or "AST (SGOT)" → "AST", "Alkaline Phosphatase" → "ALP"
- "Total Bilirubin" → "Total Bili", "White Blood Cells" → "WBC", "Red Blood Cells" → "RBC"
- "Hemoglobin" → "HGB", "Hematocrit" or "Packed Cell Volume" → "HCT"
- "Mean Corpuscular Volume" → "MCV", "Platelets" or "Thrombocytes" → "Platelets"
- Keep all other standard abbreviations as-is

## MISSING DATA
Use null for any field not present in the document. Do NOT invent reference ranges.
Do NOT use 0 as a default — use null for missing referenceMin/referenceMax.

## REFERENCE RANGES
Extract only if explicitly shown. "X - Y" → min:X max:Y. "> X" → min:X max:null. "< X" → min:null max:X. Absent → both null.

## PATIENT VALUE
Extract the actual patient result number. If ">X" or "<X" use X. Value must be numeric — skip rows where no numeric value is determinable.

## STATUS FLAGS
H/HIGH/↑/HH → "high", L/LOW/↓/LL → "low", critical/danger → "critical".
If no flag: derive from value vs ref range if available. Otherwise "normal".

## CATEGORIES
- "cbc": WBC, RBC, HGB, HCT, MCV, MCH, MCHC, Platelets, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, Reticulocytes
- "chemistry": BUN, Creatinine, SDMA, ALT, AST, ALP, GGT, Albumin, Total Protein, Globulin, Bili, Glucose, Fructosamine, Cholesterol, Triglycerides, Calcium, Phosphorus, Sodium, Potassium, Chloride, Bicarbonate, CO2, Anion Gap
- "thyroid": T4, Free T4, TSH, T3
- "urinalysis": urine pH, Specific Gravity, Urine Protein, Urine Glucose, Ketones, Urine Blood, UPC
- "other": everything else

Return ONLY valid JSON (no markdown, no code blocks):
{"vet_name":string|null,"lab_source":string|null,"test_date":"YYYY-MM-DD"|null,"weight_value":number|null,"weight_unit":"lbs","markers":[{"name":string,"value":number,"unit":string,"referenceMin":number|null,"referenceMax":number|null,"status":"normal"|"high"|"low"|"critical","category":"cbc"|"chemistry"|"urinalysis"|"thyroid"|"other"}],"vaccinations":[{"name":string,"date_administered":"YYYY-MM-DD"|null,"date_due":"YYYY-MM-DD"|null,"lot_number":string|null,"manufacturer":string|null}],"care_recommendations":[{"type":"followup"|"medication"|"screening"|"diet"|"other","title":string,"description":string,"due_date":"YYYY-MM-DD"|null,"priority":"low"|"medium"|"high"}]}`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json();
    const { record } = body;
    if (!record?.id) return new Response(JSON.stringify({ error: 'record is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const env = process.env as any;
    const supabaseUrl = env.VITE_SUPABASE_URL!;
    const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY!;
    const geminiApiKey = env.VITE_GEMINI_KEY!;

    if (!geminiApiKey) return new Response(JSON.stringify({ error: 'Server misconfigured: missing GEMINI key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    // Skip if already parsed
    const { data: existing } = await supabase.from('parsed_lab_results').select('id').eq('pet_record_id', record.id).limit(1);
    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ message: 'Already parsed', id: existing[0].id }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Download PDF from Supabase storage
    const { data: fileData, error: fileError } = await supabase.storage.from('pet-records').download(record.file_url);
    if (fileError || !fileData) throw new Error(`Download failed: ${fileError?.message}`);

    // Convert to base64 using Web API (Edge Runtime compatible)
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8Array.slice(i, i + chunkSize));
    }
    const base64Pdf = btoa(binary);

    // Call Gemini with PDF inline
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ inlineData: { mimeType: 'application/pdf', data: base64Pdf } }, { text: PARSE_PROMPT }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!geminiRes.ok) throw new Error(`Gemini parsing failed: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error('No content from Gemini');

    const parsed = JSON.parse(rawContent);
    const testDate = parsed.test_date || record.record_date || null;

    // Deduplicate and validate markers before storing
    const rawMarkers: any[] = Array.isArray(parsed.markers) ? parsed.markers : [];
    const seen = new Map<string, any>();
    for (const m of rawMarkers) {
      if (!m || typeof m.name !== 'string' || !m.name.trim()) continue;
      const value = Number(m.value);
      if (isNaN(value)) continue;
      const key = m.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, { ...m, name: m.name.trim(), value });
      } else {
        const existingHasRef = seen.get(key)!.referenceMin != null && seen.get(key)!.referenceMax != null;
        const newHasRef = m.referenceMin != null && m.referenceMax != null;
        if (!existingHasRef && newHasRef) seen.set(key, { ...m, name: m.name.trim(), value });
      }
    }
    const cleanedMarkers = Array.from(seen.values());

    const { error: insertError } = await supabase.from('parsed_lab_results').insert({
      pet_record_id: record.id, pet_id: record.pet_id, user_id: record.user_id,
      vet_name: parsed.vet_name || null, lab_source: parsed.lab_source || null,
      test_date: testDate, markers: cleanedMarkers, vaccinations: parsed.vaccinations || [],
      care_recommendations: parsed.care_recommendations || [],
      weight_value: parsed.weight_value || null, weight_unit: parsed.weight_unit || 'lbs', raw_text: rawContent,
    });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true, markers_count: (parsed.markers || []).length, vaccinations_count: (parsed.vaccinations || []).length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('parse-pdf error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
