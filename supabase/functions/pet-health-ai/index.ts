import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getRagContext(
  markers: any[],
  species: string,
  openaiApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string> {
  try {
    if (!markers || markers.length === 0) return "";

    const outOfRange = markers.filter((m: any) => m.status && m.status !== "normal");
    const queryTerms = outOfRange.length > 0
      ? outOfRange.map((m: any) => `${m.name} ${m.status}`).join(", ")
      : markers.slice(0, 5).map((m: any) => m.name).join(", ");

    const query = `${species} lab markers: ${queryTerms} interpretation reference ranges clinical significance`;

    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({ input: query, model: "text-embedding-3-small" }),
    });

    if (!embeddingRes.ok) return "";

    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data[0].embedding;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase.rpc("match_vet_knowledge", {
      query_embedding: embedding,
      match_count: 6,
      filter_species: species === "cat" ? "cat" : "dog",
      filter_document_type: null,
    });

    if (!data || data.length === 0) return "";

    const context = (data as any[])
      .map((d) => `[${d.source}]\n${d.content}`)
      .join("\n\n---\n\n");

    return `\n\n## Retrieved Veterinary Reference Data (use to ground scoring and insights)\n${context}`;
  } catch {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = { id: claimsData.claims.sub as string };

    const { data: pets } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!pets || pets.length === 0) {
      return new Response(JSON.stringify({ error: "No pet found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pet = pets[0];

    const { data: labs } = await supabase
      .from("parsed_lab_results")
      .select("*")
      .eq("pet_id", pet.id)
      .order("test_date", { ascending: false });

    const { data: records } = await supabase
      .from("pet_records")
      .select("id, title, record_type, record_date, created_at")
      .eq("pet_id", pet.id)
      .order("created_at", { ascending: false });

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
      if (!existing) {
        vaxByType.set(key, vax);
      } else {
        const existingDate = existing.date_administered || existing.dateAdministered;
        const newDate = vax.date_administered || vax.dateAdministered;
        const existingTime = existingDate ? new Date(existingDate).getTime() : 0;
        const newTime = newDate ? new Date(newDate).getTime() : 0;
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
      const adminStr = vax.date_administered || vax.dateAdministered;
      if (adminStr) return { ...vax, status: 'current', _normalized: normalizeVaxName(vax.name) };
      return { ...vax, _normalized: normalizeVaxName(vax.name) };
    });

    const today = nowDate.toISOString().split("T")[0];

    const breedBenchmarks: Record<string, any> = {
      "labrador retriever": { weight: "55–80 lbs", senior: 7, lifespan: "10–12 yrs", predispositions: "Hip dysplasia, obesity, exercise-induced collapse, PRA", screening: "Hip eval after age 2, weight monitoring, annual eye exam" },
      "golden retriever": { weight: "55–75 lbs", senior: 7, lifespan: "10–12 yrs", predispositions: "Cancer (hemangiosarcoma, lymphoma), hip dysplasia, SAS, hypothyroidism", screening: "Cancer screening after age 6, annual cardiac exam, thyroid panel" },
      "german shepherd": { weight: "50–90 lbs", senior: 7, lifespan: "9–13 yrs", predispositions: "Hip dysplasia, degenerative myelopathy, EPI, GDV, allergies", screening: "Hip/elbow eval by age 2, GDV awareness, fecal elastase if chronic loose stool" },
      "french bulldog": { weight: "16–28 lbs", senior: 8, lifespan: "10–12 yrs", predispositions: "Brachycephalic airway, IVDD, atopic dermatitis, heatstroke", screening: "Avoid overheating, spinal health monitoring, allergy plan" },
      "poodle": { weight: "40–70 lbs", senior: 8, lifespan: "12–15 yrs", predispositions: "Hip dysplasia, PRA, Addisons, GDV, epilepsy", screening: "Annual eye exam, Addisons signs monitoring" },
      "beagle": { weight: "20–30 lbs", senior: 8, lifespan: "12–15 yrs", predispositions: "Obesity, epilepsy, hypothyroidism, IVDD", screening: "Strict weight management, thyroid screening" },
      "rottweiler": { weight: "80–135 lbs", senior: 7, lifespan: "8–10 yrs", predispositions: "Osteosarcoma, hip dysplasia, cruciate ligament disease, aortic stenosis, GDV", screening: "Bone cancer awareness after age 5, annual cardiac screening" },
      "dachshund": { weight: "16–32 lbs", senior: 9, lifespan: "12–16 yrs", predispositions: "IVDD, obesity, patellar luxation, diabetes, Cushing disease", screening: "Spinal health — avoid jumping, weight management, glucose monitoring after age 7" },
      "cavalier king charles spaniel": { weight: "12–18 lbs", senior: 8, lifespan: "9–14 yrs", predispositions: "Mitral valve disease, syringomyelia, patellar luxation", screening: "Annual cardiac auscultation, echocardiogram by age 5" },
      "doberman pinscher": { weight: "60–100 lbs", senior: 7, lifespan: "10–12 yrs", predispositions: "DCM, von Willebrand disease, wobbler syndrome, hypothyroidism, GDV", screening: "Annual echo + Holter after age 3, vWD test, thyroid panel" },
      "boxer": { weight: "50–80 lbs", senior: 7, lifespan: "10–12 yrs", predispositions: "Aortic stenosis, ARVC, mast cell tumors, hip dysplasia, GDV", screening: "Annual cardiac eval, skin lump checks, cancer screening after age 5" },
      "great dane": { weight: "110–175 lbs", senior: 5, lifespan: "7–10 yrs", predispositions: "GDV, DCM, osteosarcoma, hip dysplasia, wobblers", screening: "Prophylactic gastropexy recommended, annual cardiac screening" },
      "goldendoodle": { weight: "45–75 lbs", senior: 8, lifespan: "10–15 yrs", predispositions: "Hip dysplasia, allergies, PRA, Addisons, SAS", screening: "Hip eval, allergy management, eye exam" },
      "bernese mountain dog": { weight: "70–115 lbs", senior: 6, lifespan: "7–10 yrs", predispositions: "Histiocytic sarcoma, hip/elbow dysplasia, GDV, PRA, vWD", screening: "Cancer screening from age 4, joint eval early" },
      "siberian husky": { weight: "35–60 lbs", senior: 8, lifespan: "12–14 yrs", predispositions: "Cataracts, corneal dystrophy, hip dysplasia, hypothyroidism", screening: "Annual eye exam, thyroid screening" },
      "chihuahua": { weight: "3–6 lbs", senior: 10, lifespan: "14–18 yrs", predispositions: "Patellar luxation, hydrocephalus, tracheal collapse, dental disease, MVD", screening: "Dental care critical, cardiac auscultation annually" },
      "yorkshire terrier": { weight: "4–7 lbs", senior: 10, lifespan: "13–16 yrs", predispositions: "Patellar luxation, portosystemic shunt, tracheal collapse, dental disease", screening: "Dental cleaning annually, bile acids test if poor growth" },
      "australian shepherd": { weight: "40–65 lbs", senior: 8, lifespan: "12–15 yrs", predispositions: "Hip dysplasia, epilepsy, MDR1 drug sensitivity, cataracts", screening: "MDR1 genetic test, annual eye exam, thyroid screening" },
      "corgi": { weight: "25–30 lbs", senior: 9, lifespan: "12–15 yrs", predispositions: "IVDD, hip dysplasia, degenerative myelopathy, obesity, PRA", screening: "Weight management crucial, spinal monitoring" },
      "pembroke welsh corgi": { weight: "25–30 lbs", senior: 9, lifespan: "12–15 yrs", predispositions: "IVDD, hip dysplasia, degenerative myelopathy, obesity, PRA", screening: "Weight management crucial, spinal monitoring" },
      "shih tzu": { weight: "9–16 lbs", senior: 10, lifespan: "10–16 yrs", predispositions: "Brachycephalic airway, KCS, patellar luxation, dental disease, IVDD", screening: "Eye/tear monitoring, dental cleaning annually" },
      "border collie": { weight: "30–55 lbs", senior: 8, lifespan: "12–15 yrs", predispositions: "Hip dysplasia, epilepsy, CEA, MDR1 sensitivity", screening: "MDR1 test, eye exam, joint eval" },
      "miniature schnauzer": { weight: "11–20 lbs", senior: 10, lifespan: "12–15 yrs", predispositions: "Pancreatitis, hyperlipidemia, urolithiasis, diabetes, cataracts", screening: "Low-fat diet, lipid panel, pancreatitis monitoring" },
      "cocker spaniel": { weight: "20–30 lbs", senior: 9, lifespan: "12–15 yrs", predispositions: "Ear infections, cherry eye, cataracts, hypothyroidism, AIHA", screening: "Ear cleaning biweekly, annual eye exam, thyroid panel" },
      "mixed breed": { weight: "20–70 lbs", senior: 8, lifespan: "10–14 yrs", predispositions: "Hybrid vigor reduces breed-specific risk; dental disease, obesity common", screening: "Standard preventive care, weight and dental monitoring" },
      "domestic shorthair": { weight: "8–11 lbs", senior: 10, lifespan: "12–18 yrs", predispositions: "Obesity, dental disease, FLUTD, diabetes, CKD", screening: "Weight management, dental annually, senior bloodwork from age 7, urinalysis from age 7" },
      "domestic longhair": { weight: "8–11 lbs", senior: 10, lifespan: "12–18 yrs", predispositions: "Obesity, hairballs/GI, dental disease, CKD", screening: "Grooming, weight monitoring, senior bloodwork from age 7" },
      "maine coon": { weight: "10–25 lbs", senior: 9, lifespan: "10–13 yrs", predispositions: "HCM, hip dysplasia, SMA, PKD", screening: "Annual echocardiogram for HCM, hip eval, kidney screening" },
      "ragdoll": { weight: "10–20 lbs", senior: 9, lifespan: "12–17 yrs", predispositions: "HCM, bladder stones, FIP susceptibility", screening: "HCM screening, urinalysis monitoring" },
      "siamese": { weight: "6–14 lbs", senior: 10, lifespan: "15–20 yrs", predispositions: "Amyloidosis, asthma, megaesophagus, PRA, mast cell tumors", screening: "Respiratory monitoring, liver/kidney checks" },
      "persian": { weight: "7–12 lbs", senior: 10, lifespan: "12–17 yrs", predispositions: "PKD, brachycephalic airway, PRA, dental disease, dermatitis", screening: "PKD ultrasound, eye care, facial fold care" },
      "bengal": { weight: "8–15 lbs", senior: 10, lifespan: "12–16 yrs", predispositions: "HCM, PRA, patellar luxation", screening: "HCM screening, eye exam" },
      "british shorthair": { weight: "9–17 lbs", senior: 9, lifespan: "12–17 yrs", predispositions: "HCM, PKD, obesity, hemophilia B", screening: "HCM screening, PKD test, weight management" },
      "sphynx": { weight: "6–12 lbs", senior: 10, lifespan: "12–15 yrs", predispositions: "HCM, skin conditions, respiratory infections, dental disease", screening: "HCM screening essential, weekly skin baths, dental care" },
      "scottish fold": { weight: "6–13 lbs", senior: 10, lifespan: "11–14 yrs", predispositions: "Osteochondrodysplasia, PKD, cardiomyopathy", screening: "Joint health monitoring, PKD screening, cardiac eval" },
    };

    const breedKey = (pet.breed || "mixed breed").toLowerCase().trim();
    const speciesDefault = pet.species === "cat" ? "domestic shorthair" : "mixed breed";
    const benchmark =
      breedBenchmarks[breedKey] ||
      Object.entries(breedBenchmarks).find(([k]) => breedKey.includes(k) || k.includes(breedKey))?.[1] ||
      breedBenchmarks[speciesDefault];

    const weightHistory = (labs || [])
      .filter((l: any) => l.weight_value != null)
      .map((l: any) => ({ date: l.test_date, weight: l.weight_value, unit: l.weight_unit }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let weightTrendAnalysis = "No weight history available.";
    if (weightHistory.length >= 2) {
      const first = weightHistory[0];
      const last = weightHistory[weightHistory.length - 1];
      const changeLbs = (last.weight - first.weight).toFixed(1);
      const changePct = (((last.weight - first.weight) / first.weight) * 100).toFixed(1);
      const direction = last.weight > first.weight ? "gained" : last.weight < first.weight ? "lost" : "maintained";
      weightTrendAnalysis = `${direction} ${Math.abs(Number(changeLbs))} lbs (${Math.abs(Number(changePct))}%) over ${weightHistory.length} measurements from ${first.date} to ${last.date}. Current: ${last.weight} ${last.unit}. Breed ideal: ${benchmark?.weight || "unknown"}.`;
    } else if (weightHistory.length === 1) {
      weightTrendAnalysis = `Single measurement: ${weightHistory[0].weight} ${weightHistory[0].unit} on ${weightHistory[0].date}. Breed ideal: ${benchmark?.weight || "unknown"}.`;
    }

    const latestMarkers = labsWithMarkers[0]?.markers || [];

    // Retrieve RAG context for out-of-range markers
    const ragContext = await getRagContext(
      latestMarkers,
      pet.species || "dog",
      openaiApiKey,
      supabaseUrl,
      supabaseKey
    );

    const petContext = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      sex: pet.sex,
      spayed_neutered: pet.spayed_neutered,
      existing_conditions: pet.existing_conditions || [],
      medications: pet.medications || [],
      allergies: pet.allergies || [],
      total_records: (records || []).length,
      total_lab_results: labsWithMarkers.length,
      latest_lab_date: labsWithMarkers[0]?.test_date || null,
      latest_markers: latestMarkers,
      all_markers_history: labsWithMarkers.map((l: any) => ({
        date: l.test_date,
        vet: l.vet_name,
        markers: l.markers,
        weight_value: l.weight_value,
        weight_unit: l.weight_unit,
      })),
      vaccinations: allVaccinations,
      care_recommendations: allCareRecs,
      weight_trend_analysis: weightTrendAnalysis,
      breed_benchmark: benchmark ? {
        ideal_weight: benchmark.weight,
        senior_age: benchmark.senior,
        life_expectancy: benchmark.lifespan,
        predispositions: benchmark.predispositions,
        screening_notes: benchmark.screening,
      } : null,
    };

    const systemPrompt = `You are Nuzzle Health AI, an expert veterinary health analyst. Today's date is ${today}.

Analyze this pet's complete health profile and return a JSON response with TWO sections:

1. HEALTH SCORE: A comprehensive health score (0-100) with breakdown across 4 dimensions.
2. INSIGHTS: 3-5 personalized, actionable health insights based on real data.

You will also receive retrieved veterinary reference data from Cornell AHDC, eClinPath, Merck Veterinary Manual, and WSAVA guidelines — use this to ground your scoring and insights in evidence-based medicine.

BREED-AWARE SCORING RULES:
- Bloodwork (0-100): Analyze actual lab markers against reference ranges. Each out-of-range marker reduces the score. BUN below range = mild concern (-5). SDMA or Creatinine elevated = kidney concern (-10-20). ALT/ALP elevated = liver concern (-10-15). All in range = 90-100. If the pet has breed predispositions, pay special attention to related markers.
- Weight (0-100): Use the breed_benchmark.ideal_weight to assess whether current weight is appropriate. Use weight_trend_analysis for trajectory. Within breed range and stable = 90-95. Outside breed range = 70-80. Significant trend (>10% change) = 60-75.
- Preventive Care (0-100): CRITICAL - The vaccination data has ALREADY been deduplicated and statuses pre-calculated. TRUST the "status" field on each vaccination entry. "current" = up to date. "due_soon" = within 30 days. "overdue" = past due. Do NOT override these. All current = 90-100. Overdue = -10-15 each. Due soon = -3-5 each. Also consider breed_benchmark.screening_notes for age-appropriate screenings.
- Age & Conditions (0-100): Use breed_benchmark.senior_age to determine if pet is senior (NOT generic 7yr threshold). Each chronic condition = -10 to -20. If the pet's breed has predispositions matching their conditions, note this. If the pet is past their breed's senior_age, recommend appropriate senior screenings.

INSIGHT RULES:
- Each insight MUST be max 20 words in description, referencing a specific value or date.
- Title: max 5 words, punchy.
- Action: max 8 words, verb-first imperative.
- Include risk level: "low" (good/maintenance), "medium" (watch/action), "high" (urgent).
- CRITICAL: For vaccines, ONLY flag overdue if pre-calculated status is "overdue". Current = do NOT suggest renewal.
- Use breed predispositions to generate breed-specific screening insights.
- Prioritize: overdue vaccines > out-of-range markers > breed-specific risks > weight > condition management > preventive.
- Do NOT generate generic advice. Every insight must tie to THIS pet's actual data or breed profile.
- Use retrieved veterinary reference data to provide more accurate and specific interpretations.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this pet's health data and return ONLY valid JSON (no markdown, no code blocks):

${JSON.stringify(petContext, null, 2)}
${ragContext}

Return this exact structure:
{
  "health_score": {
    "overall": number (0-100),
    "category": "optimal" | "watch" | "elevated",
    "change": number (positive = improvement, negative = decline, 0 = stable),
    "summary": "one sentence explaining the score",
    "breakdown": {
      "bloodwork": { "score": number, "label": "short explanation" },
      "weight": { "score": number, "label": "short explanation" },
      "preventive_care": { "score": number, "label": "short explanation" },
      "age_conditions": { "score": number, "label": "short explanation" }
    }
  },
  "insights": [
    {
      "id": "unique-id",
      "title": "max 5 words, punchy",
      "description": "ONE sentence max 20 words, reference a specific value or date",
      "riskLevel": "low" | "medium" | "high",
      "action": "max 8 words, verb-first imperative",
      "category": "bloodwork" | "weight" | "vaccines" | "conditions" | "preventive"
    }
  ]
}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "{}";
    rawContent = rawContent.trim();
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI health response:", rawContent);
      return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
