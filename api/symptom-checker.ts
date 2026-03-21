import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SYSTEM_PROMPT = `You are a veterinary triage AI assistant for Nuzzle Health, a pet health platform. You provide thoughtful, empathetic, and medically informed symptom assessments for dogs and cats.

You will receive structured data about a pet's symptoms, follow-up answers, behavioral observations, medical history, AND retrieved veterinary knowledge context from authoritative sources (Cornell AHDC, eClinPath, Merck Veterinary Manual, WSAVA guidelines).

IMPORTANT RULES:
- You are NOT diagnosing. You are triaging — helping pet owners understand urgency and next steps.
- Always err on the side of caution. If in doubt, recommend seeing a vet.
- Be warm and empathetic — pet owners are worried. Use the pet's name.
- Be specific about WHY you're recommending what you recommend — reference the actual symptoms and answers provided.
- Use the retrieved veterinary knowledge context to ground your assessment in evidence-based medicine.
- Never recommend human medications.
- For cats not eating 2+ days, ALWAYS flag hepatic lipidosis risk.
- For male cats straining to urinate, ALWAYS flag urethral obstruction as emergency.
- For swollen abdomen with pacing/retching, ALWAYS flag GDV/bloat as emergency.
- For labored breathing with pale/blue gums, ALWAYS flag as emergency.

You MUST respond using the following JSON structure (no markdown, no extra text — only valid JSON):

{
  "level": "emergency" | "vet-soon" | "vet-scheduled" | "monitor" | "home",
  "urgency": "Short urgency label (e.g., 'Seek emergency care now')",
  "title": "Personalized title using pet's name",
  "description": "2-3 sentence personalized assessment explaining what you think is going on and why, referencing specific symptoms and answers",
  "possibleCauses": ["cause 1 with brief explanation", "cause 2", ...],
  "actions": ["specific action step 1", "specific action step 2", ...],
  "homeCare": {
    "summary": "A warm, reassuring 1-2 sentence overview of the at-home care plan",
    "steps": [
      {
        "title": "Short step title (e.g., 'Rest & limit activity')",
        "detail": "Specific, actionable instructions a pet owner can follow at home. Include dosages, timing, durations where appropriate. Be practical.",
        "duration": "How long to do this (e.g., '12-24 hours', 'Until vet visit', '3-5 days')"
      }
    ],
    "monitoring": ["Specific signs to watch for that mean things are getting worse and they should escalate to a vet visit"],
    "doNotDo": ["Common mistakes or dangerous home remedies to avoid (e.g., 'Do not give ibuprofen — it is toxic to dogs')"]
  },
  "warnings": ["critical warning if applicable"],
  "reasoning": "Brief internal reasoning about how you weighed the symptoms, follow-ups, behavioral signs, and history to arrive at this assessment"
}

IMPORTANT for homeCare:
- ALWAYS include homeCare, even for emergency/vet-soon cases. For emergencies, focus on stabilization while getting to the vet.
- Be specific and practical — "feed bland diet" is too vague. "Feed boiled chicken breast (no skin/bones) with plain white rice, 1/4 cup portions every 4-6 hours" is good.
- Include timing and durations for each step.
- The doNotDo section is critical — warn against common dangerous home remedies.
- For monitor/home levels, provide 3-5 detailed home care steps. For vet-soon/emergency, provide 2-3 stabilization steps.

Level definitions:
- "emergency": Life-threatening, go to ER vet NOW (GDV, urethral obstruction, respiratory distress, poisoning, seizures, uncontrolled bleeding)
- "vet-soon": See a vet within 24 hours (significant but not immediately life-threatening)
- "vet-scheduled": Schedule a vet visit this week (concerning but stable)
- "monitor": Watch closely 24-48 hours, vet if worsens (mild, pet otherwise acting normal)
- "home": Likely manageable at home with monitoring (very mild, all behavioral checks normal)`;

const breedProfiles: Record<string, { predispositions: string; screening: string }> = {
  'labrador retriever': { predispositions: 'Hip dysplasia, obesity, exercise-induced collapse, PRA', screening: 'Hip eval, weight monitoring' },
  'golden retriever': { predispositions: 'Cancer, hip dysplasia, SAS, hypothyroidism', screening: 'Cancer screening after 6, cardiac exam' },
  'german shepherd': { predispositions: 'Hip dysplasia, degenerative myelopathy, EPI, GDV', screening: 'Hip eval, GDV awareness' },
  'french bulldog': { predispositions: 'Brachycephalic airway, IVDD, atopic dermatitis, heatstroke', screening: 'Avoid overheating, spinal monitoring' },
  'bulldog': { predispositions: 'Brachycephalic airway, hip dysplasia, skin fold dermatitis, heart disease', screening: 'Respiratory assessment, skin fold care' },
  'cavalier king charles spaniel': { predispositions: 'Mitral valve disease, syringomyelia, patellar luxation', screening: 'Cardiac auscultation, echocardiogram by age 5' },
  'doberman pinscher': { predispositions: 'DCM, von Willebrand disease, wobbler syndrome', screening: 'Echo + Holter after age 3' },
  'boxer': { predispositions: 'Aortic stenosis, ARVC, mast cell tumors', screening: 'Cardiac eval, skin lump checks' },
  'great dane': { predispositions: 'GDV, DCM, osteosarcoma, hip dysplasia', screening: 'Gastropexy recommended, cardiac screening' },
  'dachshund': { predispositions: 'IVDD, obesity, diabetes, Cushing disease', screening: 'Spinal health, weight management' },
  'bernese mountain dog': { predispositions: 'Histiocytic sarcoma, hip/elbow dysplasia, GDV', screening: 'Cancer screening from age 4' },
  'chihuahua': { predispositions: 'Patellar luxation, tracheal collapse, dental disease, MVD', screening: 'Dental care, cardiac auscultation' },
  'yorkshire terrier': { predispositions: 'Patellar luxation, portosystemic shunt, tracheal collapse, dental disease', screening: 'Dental care, bile acids test' },
  'miniature schnauzer': { predispositions: 'Pancreatitis, hyperlipidemia, diabetes, cataracts', screening: 'Low-fat diet, lipid panel' },
  'maine coon': { predispositions: 'HCM, hip dysplasia, SMA, PKD', screening: 'Annual echocardiogram' },
  'siamese': { predispositions: 'Amyloidosis, asthma, megaesophagus, PRA', screening: 'Respiratory monitoring' },
  'persian': { predispositions: 'PKD, brachycephalic airway, PRA, dental disease', screening: 'PKD ultrasound, eye care' },
  'bengal': { predispositions: 'HCM, PRA, patellar luxation', screening: 'HCM screening, eye exam' },
  'ragdoll': { predispositions: 'HCM, bladder stones, FIP susceptibility', screening: 'HCM screening, urinalysis' },
  'domestic shorthair': { predispositions: 'Obesity, dental disease, FLUTD, diabetes, CKD', screening: 'Weight management, senior bloodwork from age 7' },
};

async function getRagContext(symptoms: string[], species: string, openaiApiKey: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    if (!openaiApiKey || symptoms.length === 0) return '';
    const query = `${species} symptoms: ${symptoms.join(', ')}`;
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
      match_count: 5,
      filter_species: species === 'dog' ? 'dog' : 'cat',
      filter_document_type: null,
    });
    if (!data || data.length === 0) return '';
    const context = (data as any[]).map((d) => `[${d.source}]\n${d.content}`).join('\n\n---\n\n');
    return `\n\n## Retrieved Veterinary Knowledge (use to ground your assessment)\n${context}`;
  } catch {
    return '';
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const body = await req.json();
    const { petInfo, symptoms, followUps, behavioral, historyFlags } = body;

    const GEMINI_API_KEY = (process.env as any).VITE_GEMINI_KEY;
    if (!GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'Server misconfigured: missing GEMINI key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const OPENAI_API_KEY = (process.env as any).VITE_OPENAI_KEY || '';
    const supabaseUrl = (process.env as any).VITE_SUPABASE_URL!;
    const supabaseKey = (process.env as any).VITE_SUPABASE_PUBLISHABLE_KEY!;

    // Fetch RAG context with a 5s timeout — never blocks Gemini call
    const ragContext = await Promise.race([
      getRagContext(symptoms, petInfo.species || 'dog', OPENAI_API_KEY, supabaseUrl, supabaseKey),
      new Promise<string>(resolve => setTimeout(() => resolve(''), 5000)),
    ]);

    const breedKey = (petInfo.breed || '').toLowerCase().trim();
    const breedData = breedProfiles[breedKey] || Object.entries(breedProfiles).find(([k]) => breedKey.includes(k) || k.includes(breedKey))?.[1] || null;

    const petDetails = [
      `Species: ${petInfo.species || 'unknown'}`,
      petInfo.name ? `Name: ${petInfo.name}` : null,
      petInfo.breed ? `Breed: ${petInfo.breed}` : null,
      petInfo.age ? `Age: ${petInfo.age}` : null,
      petInfo.sex ? `Sex: ${petInfo.sex}` : null,
      petInfo.weight ? `Weight: ${petInfo.weight} lbs` : null,
      petInfo.existingConditions?.length ? `Existing conditions: ${petInfo.existingConditions.join(', ')}` : null,
      petInfo.medications?.length ? `Current medications: ${petInfo.medications.join(', ')}` : null,
    ].filter(Boolean).join('\n');

    const symptomList = symptoms.length > 0 ? symptoms.join(', ') : 'None specified';
    const followUpDetails = followUps.length > 0 ? followUps.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') : 'No follow-up details provided';
    const behavioralNormal = behavioral.length > 0 ? `The following are STILL NORMAL: ${behavioral.join(', ')}` : 'Owner did not confirm any normal behaviors (concerning)';
    const historyDetails = historyFlags.length > 0 ? historyFlags.join(', ') : 'No relevant history flags';

    const userMessage = `Please assess the following pet case:

## Pet Information
${petDetails}

${breedData ? `## Breed Health Profile\n- Known predispositions: ${breedData.predispositions}\n- Recommended screening: ${breedData.screening}\nConsider these breed-specific risks when assessing the symptoms below.` : ''}

## Reported Symptoms
${symptomList}

## Follow-Up Details
${followUpDetails}

## Behavioral Assessment
${behavioralNormal}
Normal behaviors confirmed: ${behavioral.length} out of 8

## Medical History Flags
${historyDetails}
${ragContext}

Please provide your triage assessment as JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', response.status, errText);
      const status = response.status === 429 ? 429 : 500;
      const msg = response.status === 429 ? 'Rate limit exceeded. Please try again in a moment.' : 'Failed to get AI assessment';
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('No content in AI response');

    const parsed = JSON.parse(content);
    return new Response(JSON.stringify(parsed), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('symptom-checker error:', e);
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
