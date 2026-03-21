import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PARSE_PROMPT = `You are a veterinary medical records parser. Extract all structured data from this veterinary document (lab report, vet visit summary, vaccine record, or wellness exam).

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "vet_name": "string or null",
  "lab_source": "string or null",
  "test_date": "YYYY-MM-DD or null",
  "weight_value": number or null,
  "weight_unit": "lbs",
  "markers": [{"name":"string","value":number,"unit":"string","referenceMin":number,"referenceMax":number,"status":"normal|high|low|critical","category":"cbc|chemistry|urinalysis|thyroid|other"}],
  "vaccinations": [{"name":"string","date_administered":"YYYY-MM-DD or null","date_due":"YYYY-MM-DD or null","lot_number":"string or null","manufacturer":"string or null"}],
  "care_recommendations": [{"type":"followup|medication|screening|diet|other","title":"string","description":"string","due_date":"YYYY-MM-DD or null","priority":"low|medium|high"}]
}

Rules:
- Extract ALL lab markers with numeric values and reference ranges
- If a marker is flagged H HIGH L LOW HH LL or * set status accordingly
- Convert weight to lbs if in kg (1 kg = 2.205 lbs)
- Include ALL vaccinations mentioned
- Return ONLY the JSON object nothing else`;

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${geminiApiKey}`,
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

    const { error: insertError } = await supabase.from('parsed_lab_results').insert({
      pet_record_id: record.id, pet_id: record.pet_id, user_id: record.user_id,
      vet_name: parsed.vet_name || null, lab_source: parsed.lab_source || null,
      test_date: testDate, markers: parsed.markers || [], vaccinations: parsed.vaccinations || [],
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
