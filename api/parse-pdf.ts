import { createClient } from '@supabase/supabase-js';

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { record } = req.body;
    const authHeader: string = req.headers.authorization || req.headers['Authorization'] || '';
    const accessToken = authHeader.replace('Bearer ', '').trim();

    if (!record?.id) { res.status(400).json({ error: 'record is required' }); return; }
    if (!accessToken) { res.status(401).json({ error: 'Authorization required' }); return; }

    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
    const geminiApiKey = process.env.VITE_GEMINI_KEY!;

    if (!geminiApiKey) throw new Error('GEMINI API key not configured');

    // Use user's token so RLS applies — data isolation is enforced by Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    // Skip if already parsed
    const { data: existing } = await supabase
      .from('parsed_lab_results')
      .select('id')
      .eq('pet_record_id', record.id)
      .limit(1);

    if (existing && existing.length > 0) {
      res.status(200).json({ message: 'Already parsed', id: existing[0].id });
      return;
    }

    // Download PDF from Supabase storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('pet-records')
      .download(record.file_url);

    if (fileError || !fileData) throw new Error(`Download failed: ${fileError?.message}`);

    // Convert to base64 using Node.js Buffer (efficient for large files)
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64');

    // Call Gemini with PDF inline
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
              { text: PARSE_PROMPT },
            ],
          }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini parse error:', geminiRes.status, errText);
      throw new Error(`Gemini parsing failed: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error('No content from Gemini');

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error('Failed to parse Gemini response:', rawContent);
      throw new Error('Could not parse Gemini response as JSON');
    }

    const testDate = parsed.test_date || record.record_date || null;

    const { error: insertError } = await supabase.from('parsed_lab_results').insert({
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
      weight_unit: parsed.weight_unit || 'lbs',
      raw_text: rawContent,
    });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    res.status(200).json({
      success: true,
      markers_count: (parsed.markers || []).length,
      vaccinations_count: (parsed.vaccinations || []).length,
    });
  } catch (e: any) {
    console.error('parse-pdf error:', e);
    res.status(500).json({ error: e.message || 'Unknown error' });
  }
}
