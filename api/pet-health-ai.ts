import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge', maxDuration: 60 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const breedBenchmarks: Record<string, any> = {
  'labrador retriever': { weight: '55–80 lbs', senior: 7, lifespan: '10–12 yrs', predispositions: 'Hip dysplasia, obesity, exercise-induced collapse, PRA', screening: 'Hip eval after age 2, weight monitoring, annual eye exam' },
  'golden retriever': { weight: '55–75 lbs', senior: 7, lifespan: '10–12 yrs', predispositions: 'Cancer (hemangiosarcoma, lymphoma), hip dysplasia, SAS, hypothyroidism', screening: 'Cancer screening after age 6, annual cardiac exam, thyroid panel' },
  'german shepherd': { weight: '50–90 lbs', senior: 7, lifespan: '9–13 yrs', predispositions: 'Hip dysplasia, degenerative myelopathy, EPI, GDV, allergies', screening: 'Hip/elbow eval by age 2, GDV awareness, fecal elastase if chronic loose stool' },
  'french bulldog': { weight: '16–28 lbs', senior: 8, lifespan: '10–12 yrs', predispositions: 'Brachycephalic airway, IVDD, atopic dermatitis, heatstroke', screening: 'Avoid overheating, spinal health monitoring, allergy plan' },
  'poodle': { weight: '40–70 lbs', senior: 8, lifespan: '12–15 yrs', predispositions: 'Hip dysplasia, PRA, Addisons, GDV, epilepsy', screening: 'Annual eye exam, Addisons signs monitoring' },
  'beagle': { weight: '20–30 lbs', senior: 8, lifespan: '12–15 yrs', predispositions: 'Obesity, epilepsy, hypothyroidism, IVDD', screening: 'Strict weight management, thyroid screening' },
  'rottweiler': { weight: '80–135 lbs', senior: 7, lifespan: '8–10 yrs', predispositions: 'Osteosarcoma, hip dysplasia, cruciate ligament disease, aortic stenosis, GDV', screening: 'Bone cancer awareness after age 5, annual cardiac screening' },
  'dachshund': { weight: '16–32 lbs', senior: 9, lifespan: '12–16 yrs', predispositions: 'IVDD, obesity, patellar luxation, diabetes, Cushing disease', screening: 'Spinal health — avoid jumping, weight management, glucose monitoring after age 7' },
  'cavalier king charles spaniel': { weight: '12–18 lbs', senior: 8, lifespan: '9–14 yrs', predispositions: 'Mitral valve disease, syringomyelia, patellar luxation', screening: 'Annual cardiac auscultation, echocardiogram by age 5' },
  'doberman pinscher': { weight: '60–100 lbs', senior: 7, lifespan: '10–12 yrs', predispositions: 'DCM, von Willebrand disease, wobbler syndrome, hypothyroidism, GDV', screening: 'Annual echo + Holter after age 3, vWD test, thyroid panel' },
  'boxer': { weight: '50–80 lbs', senior: 7, lifespan: '10–12 yrs', predispositions: 'Aortic stenosis, ARVC, mast cell tumors, hip dysplasia, GDV', screening: 'Annual cardiac eval, skin lump checks, cancer screening after age 5' },
  'great dane': { weight: '110–175 lbs', senior: 5, lifespan: '7–10 yrs', predispositions: 'GDV, DCM, osteosarcoma, hip dysplasia, wobblers', screening: 'Prophylactic gastropexy recommended, annual cardiac screening' },
  'goldendoodle': { weight: '45–75 lbs', senior: 8, lifespan: '10–15 yrs', predispositions: 'Hip dysplasia, allergies, PRA, Addisons, SAS', screening: 'Hip eval, allergy management, eye exam' },
  'bernese mountain dog': { weight: '70–115 lbs', senior: 6, lifespan: '7–10 yrs', predispositions: 'Histiocytic sarcoma, hip/elbow dysplasia, GDV, PRA, vWD', screening: 'Cancer screening from age 4, joint eval early' },
  'siberian husky': { weight: '35–60 lbs', senior: 8, lifespan: '12–14 yrs', predispositions: 'Cataracts, corneal dystrophy, hip dysplasia, hypothyroidism', screening: 'Annual eye exam, thyroid screening' },
  'chihuahua': { weight: '3–6 lbs', senior: 10, lifespan: '14–18 yrs', predispositions: 'Patellar luxation, hydrocephalus, tracheal collapse, dental disease, MVD', screening: 'Dental care critical, cardiac auscultation annually' },
  'yorkshire terrier': { weight: '4–7 lbs', senior: 10, lifespan: '13–16 yrs', predispositions: 'Patellar luxation, portosystemic shunt, tracheal collapse, dental disease', screening: 'Dental cleaning annually, bile acids test if poor growth' },
  'australian shepherd': { weight: '40–65 lbs', senior: 8, lifespan: '12–15 yrs', predispositions: 'Hip dysplasia, epilepsy, MDR1 drug sensitivity, cataracts', screening: 'MDR1 genetic test, annual eye exam, thyroid screening' },
  'corgi': { weight: '25–30 lbs', senior: 9, lifespan: '12–15 yrs', predispositions: 'IVDD, hip dysplasia, degenerative myelopathy, obesity, PRA', screening: 'Weight management crucial, spinal monitoring' },
  'pembroke welsh corgi': { weight: '25–30 lbs', senior: 9, lifespan: '12–15 yrs', predispositions: 'IVDD, hip dysplasia, degenerative myelopathy, obesity, PRA', screening: 'Weight management crucial, spinal monitoring' },
  'shih tzu': { weight: '9–16 lbs', senior: 10, lifespan: '10–16 yrs', predispositions: 'Brachycephalic airway, KCS, patellar luxation, dental disease, IVDD', screening: 'Eye/tear monitoring, dental cleaning annually' },
  'border collie': { weight: '30–55 lbs', senior: 8, lifespan: '12–15 yrs', predispositions: 'Hip dysplasia, epilepsy, CEA, MDR1 sensitivity', screening: 'MDR1 test, eye exam, joint eval' },
  'miniature schnauzer': { weight: '11–20 lbs', senior: 10, lifespan: '12–15 yrs', predispositions: 'Pancreatitis, hyperlipidemia, urolithiasis, diabetes, cataracts', screening: 'Low-fat diet, lipid panel, pancreatitis monitoring' },
  'cocker spaniel': { weight: '20–30 lbs', senior: 9, lifespan: '12–15 yrs', predispositions: 'Ear infections, cherry eye, cataracts, hypothyroidism, AIHA', screening: 'Ear cleaning biweekly, annual eye exam, thyroid panel' },
  'mixed breed': { weight: '20–70 lbs', senior: 8, lifespan: '10–14 yrs', predispositions: 'Hybrid vigor reduces breed-specific risk; dental disease, obesity common', screening: 'Standard preventive care, weight and dental monitoring' },
  'domestic shorthair': { weight: '8–11 lbs', senior: 10, lifespan: '12–18 yrs', predispositions: 'Obesity, dental disease, FLUTD, diabetes, CKD', screening: 'Weight management, dental annually, senior bloodwork from age 7, urinalysis from age 7' },
  'domestic longhair': { weight: '8–11 lbs', senior: 10, lifespan: '12–18 yrs', predispositions: 'Obesity, hairballs/GI, dental disease, CKD', screening: 'Grooming, weight monitoring, senior bloodwork from age 7' },
  'maine coon': { weight: '10–25 lbs', senior: 9, lifespan: '10–13 yrs', predispositions: 'HCM, hip dysplasia, SMA, PKD', screening: 'Annual echocardiogram for HCM, hip eval, kidney screening' },
  'ragdoll': { weight: '10–20 lbs', senior: 9, lifespan: '12–17 yrs', predispositions: 'HCM, bladder stones, FIP susceptibility', screening: 'HCM screening, urinalysis monitoring' },
  'siamese': { weight: '6–14 lbs', senior: 10, lifespan: '15–20 yrs', predispositions: 'Amyloidosis, asthma, megaesophagus, PRA, mast cell tumors', screening: 'Respiratory monitoring, liver/kidney checks' },
  'persian': { weight: '7–12 lbs', senior: 10, lifespan: '12–17 yrs', predispositions: 'PKD, brachycephalic airway, PRA, dental disease, dermatitis', screening: 'PKD ultrasound, eye care, facial fold care' },
  'bengal': { weight: '8–15 lbs', senior: 10, lifespan: '12–16 yrs', predispositions: 'HCM, PRA, patellar luxation', screening: 'HCM screening, eye exam' },
  'british shorthair': { weight: '9–17 lbs', senior: 9, lifespan: '12–17 yrs', predispositions: 'HCM, PKD, obesity, hemophilia B', screening: 'HCM screening, PKD test, weight management' },
  'sphynx': { weight: '6–12 lbs', senior: 10, lifespan: '12–15 yrs', predispositions: 'HCM, skin conditions, respiratory infections, dental disease', screening: 'HCM screening essential, weekly skin baths, dental care' },
  'scottish fold': { weight: '6–13 lbs', senior: 10, lifespan: '11–14 yrs', predispositions: 'Osteochondrodysplasia, PKD, cardiomyopathy', screening: 'Joint health monitoring, PKD screening, cardiac eval' },
};

async function getRagContext(markers: any[], species: string, openaiApiKey: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    if (!openaiApiKey || !markers || markers.length === 0) return '';
    const outOfRange = markers.filter((m: any) => m.status && m.status !== 'normal');
    const queryTerms = outOfRange.length > 0
      ? outOfRange.map((m: any) => `${m.name} ${m.status}`).join(', ')
      : markers.slice(0, 5).map((m: any) => m.name).join(', ');
    const query = `${species} lab markers: ${queryTerms} interpretation reference ranges clinical significance`;
    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: query, dimensions: 768 }),
    });
    if (!embeddingRes.ok) return '';
    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data[0].embedding;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase.rpc('match_vet_knowledge', {
      query_embedding: embedding,
      match_count: 6,
      filter_species: species === 'cat' ? 'cat' : 'dog',
      filter_document_type: null,
    });
    if (!data || data.length === 0) return '';
    const context = (data as any[]).map((d) => `[${d.source}]\n${d.content}`).join('\n\n---\n\n');
    return `\n\n## Retrieved Veterinary Reference Data (use to ground scoring and insights)\n${context}`;
  } catch {
    return '';
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) return new Response(JSON.stringify({ error: 'Authorization required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const env = process.env as any;
    const supabaseUrl = env.VITE_SUPABASE_URL!;
    const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY!;
    const geminiApiKey = env.VITE_GEMINI_KEY!;
    const openaiApiKey = env.VITE_OPENAI_KEY || '';

    if (!geminiApiKey) return new Response(JSON.stringify({ error: 'Server misconfigured: missing GEMINI key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: pets } = await supabase.from('pets').select('*').order('created_at', { ascending: false }).limit(1);
    if (!pets || pets.length === 0) return new Response(JSON.stringify({ error: 'No pet found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const pet = pets[0];

    // Fetch labs and records in parallel to save ~1-2s
    const [{ data: labs }, { data: records }] = await Promise.all([
      supabase.from('parsed_lab_results').select('*').eq('pet_id', pet.id).order('test_date', { ascending: false }),
      supabase.from('pet_records').select('id, title, record_type, record_date, created_at').eq('pet_id', pet.id).order('created_at', { ascending: false }),
    ]);

    const labsWithMarkers = (labs || []).filter((l: any) => l.markers && (l.markers as any[]).length > 0);
    const rawVaccinations = (labs || []).flatMap((l: any) => (l.vaccinations as any[]) || []);
    const allCareRecs = (labs || []).flatMap((l: any) => (l.care_recommendations as any[]) || []);

    const normalizeVaxName = (name: string): string => {
      const lower = name.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      if (lower.includes('rabies')) return 'rabies';
      if (lower.includes('da2pp') || lower.includes('dhpp') || lower.includes('dapp') || lower.includes('distemper')) return 'da2pp';
      if (lower.includes('lepto')) return 'leptospirosis';
      if (lower.includes('bordetella')) return 'bordetella';
      if (lower.includes('lyme')) return 'lyme';
      if (lower.includes('influenza')) return 'canine_influenza';
      if (lower.includes('fvrcp')) return 'fvrcp';
      if (lower.includes('felv')) return 'felv';
      return lower.replace(/\s+/g, '_');
    };

    const vaxByType = new Map<string, any>();
    for (const vax of rawVaccinations) {
      const key = normalizeVaxName(vax.name);
      const existing = vaxByType.get(key);
      if (!existing) { vaxByType.set(key, vax); } else {
        const existingTime = existing.date_administered || existing.dateAdministered ? new Date(existing.date_administered || existing.dateAdministered).getTime() : 0;
        const newTime = vax.date_administered || vax.dateAdministered ? new Date(vax.date_administered || vax.dateAdministered).getTime() : 0;
        if (newTime > existingTime) vaxByType.set(key, vax);
      }
    }

    const nowDate = new Date();
    const thirtyDaysFromNow = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const allVaccinations = Array.from(vaxByType.values()).map((vax: any) => {
      const dueStr = vax.date_due || vax.dateDue;
      if (dueStr) {
        const dueDate = new Date(dueStr);
        let status = 'current';
        if (dueDate < nowDate) status = 'overdue';
        else if (dueDate < thirtyDaysFromNow) status = 'due_soon';
        return { ...vax, status, _normalized: normalizeVaxName(vax.name) };
      }
      return { ...vax, status: 'current', _normalized: normalizeVaxName(vax.name) };
    });

    const today = nowDate.toISOString().split('T')[0];
    const breedKey = (pet.breed || 'mixed breed').toLowerCase().trim();
    const speciesDefault = pet.species === 'cat' ? 'domestic shorthair' : 'mixed breed';
    const benchmark = breedBenchmarks[breedKey] || Object.entries(breedBenchmarks).find(([k]) => breedKey.includes(k) || k.includes(breedKey))?.[1] || breedBenchmarks[speciesDefault];

    const weightHistory = (labs || []).filter((l: any) => l.weight_value != null).map((l: any) => ({ date: l.test_date, weight: l.weight_value, unit: l.weight_unit })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let weightTrendAnalysis = 'No weight history available.';
    if (weightHistory.length >= 2) {
      const first = weightHistory[0]; const last = weightHistory[weightHistory.length - 1];
      const changeLbs = (last.weight - first.weight).toFixed(1);
      const changePct = (((last.weight - first.weight) / first.weight) * 100).toFixed(1);
      const direction = last.weight > first.weight ? 'gained' : last.weight < first.weight ? 'lost' : 'maintained';
      weightTrendAnalysis = `${direction} ${Math.abs(Number(changeLbs))} lbs (${Math.abs(Number(changePct))}%) over ${weightHistory.length} measurements from ${first.date} to ${last.date}. Current: ${last.weight} ${last.unit}. Breed ideal: ${benchmark?.weight || 'unknown'}.`;
    } else if (weightHistory.length === 1) {
      weightTrendAnalysis = `Single measurement: ${weightHistory[0].weight} ${weightHistory[0].unit} on ${weightHistory[0].date}. Breed ideal: ${benchmark?.weight || 'unknown'}.`;
    }

    const latestMarkers = labsWithMarkers[0]?.markers || [];

    // Cap history to 5 most recent visits to keep payload small
    const recentLabs = labsWithMarkers.slice(0, 5);

    // Pre-compute per-marker trend summaries instead of sending raw arrays
    // Format: "MARKER_NAME: [date→value(status), ...] ref:min-max unit | trend:direction"
    const allMarkerNames = [...new Set(recentLabs.flatMap((l: any) => (l.markers as any[]).map((m: any) => m.name)))];
    const markerTrends = allMarkerNames.map(name => {
      const entries = recentLabs
        .map((l: any) => {
          const m = (l.markers as any[]).find((x: any) => x.name === name);
          if (!m) return null;
          return { date: l.test_date, value: m.value, status: m.status, refMin: m.referenceMin, refMax: m.referenceMax, unit: m.unit };
        })
        .filter(Boolean)
        .reverse(); // oldest first for trend direction
      if (entries.length === 0) return null;
      const ref = entries.find((e: any) => e.refMin != null && e.refMax != null);
      const refStr = ref ? `ref:${ref.refMin}-${ref.refMax}${ref.unit ? ' ' + ref.unit : ''}` : 'ref:unknown';
      const valStr = entries.map((e: any) => `${e.date}→${e.value}${e.status !== 'normal' ? `(${e.status})` : ''}`).join(', ');
      const first = entries[0] as any;
      const last = entries[entries.length - 1] as any;
      const trend = entries.length > 1
        ? (last.value > first.value * 1.05 ? 'rising' : last.value < first.value * 0.95 ? 'falling' : 'stable')
        : 'single';
      return `${name}: [${valStr}] ${refStr} | trend:${trend}`;
    }).filter(Boolean);

    const petContext = {
      name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, weight: pet.weight, sex: pet.sex,
      spayed_neutered: pet.spayed_neutered, existing_conditions: pet.existing_conditions || [],
      medications: pet.medications || [], allergies: pet.allergies || [],
      lab_visits: labsWithMarkers.length, latest_lab_date: labsWithMarkers[0]?.test_date || null,
      marker_trends: markerTrends,
      vaccinations: allVaccinations.map((v: any) => ({ name: v.name, administered: v.date_administered || v.dateAdministered, due: v.date_due || v.dateDue, status: v.status })),
      care_recommendations: allCareRecs.slice(0, 10).map((c: any) => ({ title: c.title, priority: c.priority, due: c.due_date })),
      weight_trend: weightTrendAnalysis,
      breed_benchmark: benchmark ? { ideal_weight: benchmark.weight, senior_age: benchmark.senior, lifespan: benchmark.lifespan, predispositions: benchmark.predispositions, screening: benchmark.screening } : null,
    };

    const systemPrompt = `You are Nuzzle Health Intelligence, an expert veterinary health analyst. Today's date is ${today}.

Analyze this pet's COMPLETE health history and return a JSON response with TWO sections:
1. HEALTH SCORE: A comprehensive health score (0-100) with breakdown across 4 dimensions.
2. INSIGHTS: 4-6 personalized, actionable insights that leverage longitudinal trends.

## LONGITUDINAL ANALYSIS (use marker_trends, not raw arrays)
marker_trends is a pre-computed list: "NAME: [date→value(status), ...] ref:min-max unit | trend:direction"
- Use trend direction (rising/falling/stable) to flag concerning or improving trajectories.
- A rising trend toward the top of range is clinically significant even if still normal.
- A previously abnormal (high/low) marker now normal = positive insight.
- Reference specific dates and values in your insights (e.g. "BUN rose from 18→26 Jan–Mar").

## SCORING RULES
- Bloodwork (0-100): Start at 95. Each out-of-range marker: -5 to -15 based on severity. Worsening trend even in range: -3 to -8. Improving trend: +2 to +5 bonus.
- Weight (0-100): Use breed_benchmark.ideal_weight + weight_trend_analysis. Within ideal = 90-95. Rapid change = -10 to -20.
- Preventive Care (0-100): TRUST the pre-calculated "status" field on each vaccination. All current = 90-100. Overdue = -10-15 each.
- Age & Conditions (0-100): Use breed_benchmark.senior_age. Senior + conditions = score accordingly.

## INSIGHT RULES
- 4-6 insights total. Each must reference ACTUAL data from this pet — no generic advice.
- Prioritize: (1) out-of-range markers with trend, (2) worsening trends even in range, (3) improving markers worth celebrating, (4) vaccine/care gaps, (5) breed-specific screening due.
- Title: 4-6 words. Description: 1-2 sentences with specific values and dates. Action: verb-first, specific.
- ONLY flag vaccines as overdue if pre-calculated status is "overdue".
- If only 1 lab visit exists, note that trends will improve with more uploads.`;

    const labCount = labsWithMarkers.length;
    const longitudinalNote = labCount > 1
      ? `${labCount} lab visits available. Use marker_trends for longitudinal analysis — identify rising/falling trajectories and flag anything clinically relevant.`
      : `1 lab visit. Analyze current values vs ref ranges and breed predispositions.`;

    // Compact JSON (no indentation) to minimize token count and latency
    const userPrompt = `${longitudinalNote}

${JSON.stringify(petContext)}

Return ONLY valid JSON:
{"health_score":{"overall":number,"category":"optimal"|"watch"|"elevated","change":number,"summary":"string","breakdown":{"bloodwork":{"score":number,"label":"string"},"weight":{"score":number,"label":"string"},"preventive_care":{"score":number,"label":"string"},"age_conditions":{"score":number,"label":"string"}}},"insights":[{"id":"string","title":"string","description":"string","riskLevel":"low"|"medium"|"high","action":"string","category":"bloodwork"|"weight"|"vaccines"|"conditions"|"preventive"}]}`;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('Gemini error:', aiResponse.status, errText);
      const status = aiResponse.status === 429 ? 429 : 500;
      const msg = aiResponse.status === 429 ? 'Rate limited, please try again later.' : 'AI analysis failed';
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    rawContent = rawContent.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const parsed = JSON.parse(rawContent);
    return new Response(JSON.stringify(parsed), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('pet-health-ai error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
