import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a veterinary triage AI assistant for Nuzzle Health, a pet health platform. You provide thoughtful, empathetic, and medically informed symptom assessments for dogs and cats.

You will receive structured data about a pet's symptoms, follow-up answers, behavioral observations, and medical history. Your job is to analyze all of this together and produce a comprehensive triage assessment.

IMPORTANT RULES:
- You are NOT diagnosing. You are triaging — helping pet owners understand urgency and next steps.
- Always err on the side of caution. If in doubt, recommend seeing a vet.
- Be warm and empathetic — pet owners are worried. Use the pet's name.
- Be specific about WHY you're recommending what you recommend — reference the actual symptoms and answers provided.
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
- The doNotDo section is critical — warn against common dangerous home remedies (human medications, certain foods, etc).
- For monitor/home levels, provide 3-5 detailed home care steps. For vet-soon/emergency, provide 2-3 stabilization steps to do while arranging vet care.

Level definitions:
- "emergency": Life-threatening, go to ER vet NOW (GDV, urethral obstruction, respiratory distress, poisoning, seizures, uncontrolled bleeding)
- "vet-soon": See a vet within 24 hours (significant but not immediately life-threatening)
- "vet-scheduled": Schedule a vet visit this week (concerning but stable)
- "monitor": Watch closely 24-48 hours, vet if worsens (mild, pet otherwise acting normal)
- "home": Likely manageable at home with monitoring (very mild, all behavioral checks normal)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { petInfo, symptoms, followUps, behavioral, historyFlags } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a detailed prompt from the structured data
    const petName = petInfo.name || `the ${petInfo.species || "pet"}`;
    
    // Breed benchmark lookup for symptom context
    const breedBenchmarks: Record<string, { predispositions: string; screening: string }> = {
      "labrador retriever": { predispositions: "Hip dysplasia, obesity, exercise-induced collapse, PRA", screening: "Hip eval, weight monitoring" },
      "golden retriever": { predispositions: "Cancer, hip dysplasia, SAS, hypothyroidism", screening: "Cancer screening after 6, cardiac exam" },
      "german shepherd": { predispositions: "Hip dysplasia, degenerative myelopathy, EPI, GDV", screening: "Hip eval, GDV awareness" },
      "french bulldog": { predispositions: "Brachycephalic airway, IVDD, atopic dermatitis, heatstroke", screening: "Avoid overheating, spinal monitoring" },
      "bulldog": { predispositions: "Brachycephalic airway, hip dysplasia, skin fold dermatitis, heart disease", screening: "Respiratory assessment, skin fold care" },
      "cavalier king charles spaniel": { predispositions: "Mitral valve disease, syringomyelia, patellar luxation", screening: "Cardiac auscultation, echocardiogram by age 5" },
      "doberman pinscher": { predispositions: "DCM, von Willebrand disease, wobbler syndrome", screening: "Echo + Holter after age 3" },
      "boxer": { predispositions: "Aortic stenosis, ARVC, mast cell tumors", screening: "Cardiac eval, skin lump checks" },
      "great dane": { predispositions: "GDV, DCM, osteosarcoma, hip dysplasia", screening: "Gastropexy recommended, cardiac screening" },
      "dachshund": { predispositions: "IVDD, obesity, diabetes, Cushing disease", screening: "Spinal health, weight management" },
      "bernese mountain dog": { predispositions: "Histiocytic sarcoma, hip/elbow dysplasia, GDV", screening: "Cancer screening from age 4" },
      "chihuahua": { predispositions: "Patellar luxation, tracheal collapse, dental disease, MVD", screening: "Dental care, cardiac auscultation" },
      "yorkshire terrier": { predispositions: "Patellar luxation, portosystemic shunt, tracheal collapse, dental disease", screening: "Dental care, bile acids test" },
      "miniature schnauzer": { predispositions: "Pancreatitis, hyperlipidemia, diabetes, cataracts", screening: "Low-fat diet, lipid panel" },
      "maine coon": { predispositions: "HCM, hip dysplasia, SMA, PKD", screening: "Annual echocardiogram" },
      "siamese": { predispositions: "Amyloidosis, asthma, megaesophagus, PRA", screening: "Respiratory monitoring" },
      "persian": { predispositions: "PKD, brachycephalic airway, PRA, dental disease", screening: "PKD ultrasound, eye care" },
      "bengal": { predispositions: "HCM, PRA, patellar luxation", screening: "HCM screening, eye exam" },
      "ragdoll": { predispositions: "HCM, bladder stones, FIP susceptibility", screening: "HCM screening, urinalysis" },
      "domestic shorthair": { predispositions: "Obesity, dental disease, FLUTD, diabetes, CKD", screening: "Weight management, senior bloodwork from age 7" },
    };
    
    const breedKey = (petInfo.breed || "").toLowerCase().trim();
    const breedData = breedBenchmarks[breedKey] 
      || Object.entries(breedBenchmarks).find(([k]) => breedKey.includes(k) || k.includes(breedKey))?.[1]
      || null;
    
    const petDetails = [
      `Species: ${petInfo.species || "unknown"}`,
      petInfo.name ? `Name: ${petInfo.name}` : null,
      petInfo.breed ? `Breed: ${petInfo.breed}` : null,
      petInfo.age ? `Age: ${petInfo.age}` : null,
      petInfo.sex ? `Sex: ${petInfo.sex}` : null,
      petInfo.weight ? `Weight: ${petInfo.weight} lbs` : null,
      petInfo.existingConditions?.length ? `Existing conditions: ${petInfo.existingConditions.join(", ")}` : null,
      petInfo.medications?.length ? `Current medications: ${petInfo.medications.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const symptomList = symptoms.length > 0 ? symptoms.join(", ") : "None specified";

    const followUpDetails = followUps.length > 0
      ? followUps.map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
      : "No follow-up details provided";

    const behavioralNormal = behavioral.length > 0
      ? `The following are STILL NORMAL: ${behavioral.join(", ")}`
      : "Owner did not confirm any normal behaviors (concerning)";

    const behavioralAbnormal = behavioral.length < 8
      ? `Potentially abnormal (not checked as normal): behaviors not confirmed`
      : "All behavioral checks confirmed normal";

    const historyDetails = historyFlags.length > 0
      ? historyFlags.join(", ")
      : "No relevant history flags";

    const userMessage = `Please assess the following pet case:

## Pet Information
${petDetails}

${breedData ? `## Breed Health Profile
- Known predispositions: ${breedData.predispositions}
- Recommended screening: ${breedData.screening}
Consider these breed-specific risks when assessing the symptoms below.` : ""}

## Reported Symptoms
${symptomList}

## Follow-Up Details
${followUpDetails}

## Behavioral Assessment
${behavioralNormal}
${behavioralAbnormal}
Normal behaviors confirmed: ${behavioral.length} out of 8

## Medical History Flags
${historyDetails}

Please provide your triage assessment as JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to get AI assessment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response (handle potential markdown code blocks)
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Could not parse AI assessment");
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("symptom-checker error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
