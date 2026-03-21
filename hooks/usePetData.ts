import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Pet, LabResult, LabMarker, VaccinationRecord, CareRecommendation } from '@/lib/types';

// ---------------------------------------------------------------------------
// Parsing prompt — comprehensive, handles diverse lab report formats
// ---------------------------------------------------------------------------
const PARSE_PROMPT = `You are a veterinary medical record parser. Extract structured data from this document.
The document may be a CBC panel, chemistry/metabolic panel, urinalysis, thyroid panel, wellness exam, vaccine record, or any combination. Handle output from IDEXX, Antech, Zoetis, in-house analyzers, and handwritten records.

## CRITICAL DEDUPLICATION RULE
Each unique marker name must appear EXACTLY ONCE in the markers array.
Many lab reports list the same test on multiple pages or in both a summary table and a detail table — output it ONLY ONCE using the value from the most detailed/prominent results section.
Common sources of duplicates to watch for: CBC panel listed on page 1 and again on page 2, chemistry values repeated in a results summary, reference ranges listed as separate rows.

## MARKER NAME NORMALIZATION
Use standard short abbreviations. If the document uses the long form, abbreviate:
- "Blood Urea Nitrogen" → "BUN"
- "Alanine Aminotransferase" or "ALT (SGPT)" → "ALT"
- "Aspartate Aminotransferase" or "AST (SGOT)" → "AST"
- "Alkaline Phosphatase" → "ALP"
- "Total Bilirubin" → "Total Bili"
- "White Blood Cells" or "Total WBC" → "WBC"
- "Red Blood Cells" → "RBC"
- "Hemoglobin" → "HGB"
- "Hematocrit" or "Packed Cell Volume" → "HCT"
- "Mean Corpuscular Volume" → "MCV"
- "Mean Corpuscular Hemoglobin" → "MCH"
- "MCHC (Mean Corpuscular Hemoglobin Concentration)" → "MCHC"
- "Platelets" or "Thrombocytes" → "Platelets"
- "Serum Symmetric Dimethylarginine" → "SDMA"
- "Total Protein" → "Total Protein"
- "Globulin" → "Globulin"
- Keep all other standard abbreviations as-is (e.g., ALB, GGT, CHOL, TRIG, Ca, Phos, Na, K, Cl, HCO3, T4)

## MISSING DATA
If any field is absent from the document, use null. Do NOT invent or estimate values.
Do NOT use 0 as a default for missing reference ranges — use null.

## REFERENCE RANGES
Extract only if explicitly shown in the document next to the marker.
- Format "X - Y" → referenceMin: X, referenceMax: Y
- Format "> X" → referenceMin: X, referenceMax: null
- Format "< X" → referenceMin: null, referenceMax: X
- If completely absent for a marker → referenceMin: null, referenceMax: null

## PATIENT VALUE EXTRACTION
Extract the actual patient result number, not the reference range value.
If value is displayed as ">X" or "<X", use the number X as the value.
Value must be a number — skip any row where you cannot determine a numeric patient value.

## STATUS FLAGS
Use document flags first: H / HIGH / ↑ / HH → "high", L / LOW / ↓ / LL → "low", critical/danger → "critical", * alone → infer from value vs ref range.
If no flag: calculate from value vs reference range if both are available.
If neither flag nor reference range: use "normal".

## CATEGORIES
- "cbc": WBC, RBC, HGB, HCT, MCV, MCH, MCHC, Platelets, Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils, Reticulocytes, Band Neutrophils
- "chemistry": BUN, Creatinine, SDMA, ALT, AST, ALP, GGT, Albumin, Total Protein, Globulin, Total Bili, Glucose, Fructosamine, Cholesterol, Triglycerides, Calcium, Phosphorus, Sodium, Potassium, Chloride, Bicarbonate, CO2, Anion Gap
- "thyroid": T4, Free T4, TSH, T3, Free T3
- "urinalysis": urine pH, Specific Gravity, Urine Protein, Urine Glucose, Ketones, Urine Bilirubin, Urine Blood, Urine WBC, Urine RBC, Urine Casts, UPC ratio
- "other": everything else

## ADAPTABILITY
- Vaccine-only records: markers array should be empty []
- Lab-only records: vaccinations array should be empty []
- Wellness exams may have both
- If care recommendations are not present, return []

Return ONLY valid JSON (no markdown, no code blocks, no explanation):
{"vet_name":string|null,"lab_source":string|null,"test_date":"YYYY-MM-DD"|null,"weight_value":number|null,"weight_unit":"lbs","markers":[{"name":string,"value":number,"unit":string,"referenceMin":number|null,"referenceMax":number|null,"status":"normal"|"high"|"low"|"critical","category":"cbc"|"chemistry"|"urinalysis"|"thyroid"|"other"}],"vaccinations":[{"name":string,"date_administered":"YYYY-MM-DD"|null,"date_due":"YYYY-MM-DD"|null,"lot_number":string|null,"manufacturer":string|null}],"care_recommendations":[{"type":"followup"|"medication"|"screening"|"diet"|"other","title":string,"description":string,"due_date":"YYYY-MM-DD"|null,"priority":"low"|"medium"|"high"}]}`;

// ---------------------------------------------------------------------------
// Post-parse cleanup: deduplicate by marker name, drop invalid rows
// ---------------------------------------------------------------------------
function cleanMarkers(rawMarkers: unknown): any[] {
  if (!Array.isArray(rawMarkers)) return [];

  const seen = new Map<string, any>();

  for (const m of rawMarkers) {
    if (!m || typeof m !== 'object') continue;
    const name = (m as any).name;
    if (typeof name !== 'string' || !name.trim()) continue;

    const value = Number((m as any).value);
    if (isNaN(value)) continue; // drop rows where value isn't numeric

    const key = name.trim().toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, { ...m as any, name: name.trim(), value });
    } else {
      // Prefer the entry that has reference ranges over one that doesn't
      const existing = seen.get(key)!;
      const existingHasRef = existing.referenceMin != null && existing.referenceMax != null;
      const newHasRef = (m as any).referenceMin != null && (m as any).referenceMax != null;
      if (!existingHasRef && newHasRef) {
        seen.set(key, { ...m as any, name: name.trim(), value });
      }
    }
  }

  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Map a raw DB marker to a typed LabMarker, null-safe on reference ranges
// ---------------------------------------------------------------------------
function mapMarker(m: any): LabMarker {
  const refMin = m.referenceMin ?? m.reference_min ?? null;
  const refMax = m.referenceMax ?? m.reference_max ?? null;
  return {
    name: m.name,
    value: Number(m.value),
    unit: m.unit || '',
    referenceMin: refMin !== null ? Number(refMin) : null,
    referenceMax: refMax !== null ? Number(refMax) : null,
    status: m.status || undefined,
    category: m.category || 'other',
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePetData() {
  const { user, session } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petRecords, setPetRecords] = useState<any[]>([]);
  const [parsedLabs, setParsedLabs] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const isParsing = useRef(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      setPet(null);
      setPetRecords([]);
      setParsedLabs([]);
      return;
    }
    setLoading(true);

    const { data: pets } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (pets && pets.length > 0) {
      const dbPet = pets[0];
      const mappedPet: Pet = {
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species as 'dog' | 'cat',
        breed: dbPet.breed || '',
        age: dbPet.age || 0,
        weight: dbPet.weight || 0,
        sex: (dbPet.sex as 'male' | 'female') || 'female',
        spayedNeutered: dbPet.spayed_neutered || false,
        existingConditions: dbPet.existing_conditions || [],
        medications: dbPet.medications || [],
        allergies: dbPet.allergies || [],
      };
      setPet(mappedPet);

      const { data: records } = await supabase
        .from('pet_records')
        .select('*')
        .eq('pet_id', dbPet.id)
        .order('created_at', { ascending: false });
      setPetRecords(records || []);

      const { data: labs } = await supabase
        .from('parsed_lab_results')
        .select('*')
        .eq('pet_id', dbPet.id)
        .order('test_date', { ascending: false });

      if (labs && labs.length > 0) {
        const mapped: LabResult[] = labs.map((lab: any) => ({
          id: lab.id,
          petId: lab.pet_id,
          date: lab.test_date || lab.created_at,
          vetName: lab.vet_name || 'Unknown',
          labSource: lab.lab_source || 'Unknown',
          weightValue: lab.weight_value ?? null,
          weightUnit: lab.weight_unit || 'lbs',
          // Deduplicate on read as a safety net for any old data already in DB
          markers: cleanMarkers(lab.markers).map(mapMarker),
          vaccinations: (lab.vaccinations as any[] || []).map((v: any): VaccinationRecord => ({
            name: v.name,
            dateAdministered: v.date_administered || v.dateAdministered || null,
            dateDue: v.date_due || v.dateDue || null,
            lotNumber: v.lot_number || v.lotNumber || null,
            manufacturer: v.manufacturer || null,
            status: v.status || 'current',
          })),
          careRecommendations: (lab.care_recommendations as any[] || []).map((c: any): CareRecommendation => ({
            type: c.type || 'followup',
            title: c.title,
            description: c.description,
            dueDate: c.due_date || c.dueDate || null,
            priority: c.priority || 'low',
          })),
        }));
        setParsedLabs(mapped);
      } else {
        setParsedLabs([]);
      }
    } else {
      setPet(null);
      setPetRecords([]);
      setParsedLabs([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Parse a single PDF record client-side (Edge Runtime timeout too short for large PDFs)
  const parsePdfRecord = useCallback(async (record: any) => {
    const geminiKey = import.meta.env.VITE_GEMINI_KEY;
    if (!geminiKey) throw new Error('VITE_GEMINI_KEY not set');

    const { data: fileData, error: fileError } = await supabase.storage
      .from('pet-records')
      .download(record.file_url);
    if (fileError || !fileData) throw new Error(`Download failed: ${fileError?.message}`);

    const buffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
    }
    const base64Pdf = btoa(binary);

    const callGemini = () => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ inlineData: { mimeType: 'application/pdf', data: base64Pdf } }, { text: PARSE_PROMPT }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      }
    );

    let geminiRes = await callGemini();
    if (geminiRes.status === 429) {
      await new Promise(r => setTimeout(r, 5000));
      geminiRes = await callGemini();
    }
    if (!geminiRes.ok) throw new Error(`Gemini failed: ${geminiRes.status}`);

    const geminiData = await geminiRes.json();
    const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) throw new Error('No content from Gemini');

    const parsed = JSON.parse(rawContent);

    // Deduplicate and validate markers before storing
    const cleanedMarkers = cleanMarkers(parsed.markers);

    await supabase.from('parsed_lab_results').insert({
      pet_record_id: record.id,
      pet_id: record.pet_id,
      user_id: record.user_id,
      vet_name: parsed.vet_name || null,
      lab_source: parsed.lab_source || null,
      test_date: parsed.test_date || record.record_date || null,
      markers: cleanedMarkers,
      vaccinations: parsed.vaccinations || [],
      care_recommendations: parsed.care_recommendations || [],
      weight_value: parsed.weight_value || null,
      weight_unit: parsed.weight_unit || 'lbs',
      raw_text: rawContent,
    });
  }, []);

  // Trigger PDF parsing for unprocessed records
  const parseUnprocessedRecords = useCallback(async () => {
    if (!user || petRecords.length === 0) return;
    if (isParsing.current) return;

    const parsableTypes = ['lab-report', 'vaccine', 'vet-visit'];
    const labRecords = petRecords.filter((r) => parsableTypes.includes(r.record_type) && r.file_url);

    const { data: existing } = await supabase
      .from('parsed_lab_results')
      .select('pet_record_id')
      .eq('user_id', user.id);

    const parsedIds = new Set((existing || []).map((e: any) => e.pet_record_id));
    const unparsed = labRecords.filter((r) => !parsedIds.has(r.id));
    if (unparsed.length === 0) return;

    isParsing.current = true;
    for (const record of unparsed) {
      try {
        await parsePdfRecord(record);
      } catch (err) {
        console.error('Failed to parse record:', record.id, err);
      }
    }

    await fetchData();
    isParsing.current = false;
  }, [user, petRecords, fetchData, parsePdfRecord]);

  useEffect(() => {
    if (petRecords.length > 0) {
      parseUnprocessedRecords();
    }
  }, [petRecords.length, parseUnprocessedRecords]);

  // Aggregate all vaccinations from parsed labs, then deduplicate by vaccine type
  // keeping only the MOST RECENT administration per normalized vaccine name
  const rawVaccinations = parsedLabs.flatMap(l => l.vaccinations || []);

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

  const vaxByType = new Map<string, typeof rawVaccinations[0]>();
  for (const vax of rawVaccinations) {
    const key = normalizeVaxName(vax.name);
    const existing = vaxByType.get(key);
    if (!existing) {
      vaxByType.set(key, vax);
    } else {
      const existingDate = existing.dateAdministered ? new Date(existing.dateAdministered).getTime() : 0;
      const newDate = vax.dateAdministered ? new Date(vax.dateAdministered).getTime() : 0;
      if (newDate > existingDate) vaxByType.set(key, vax);
    }
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const allVaccinations = Array.from(vaxByType.values()).map(vax => {
    if (vax.dateDue) {
      const dueDate = new Date(vax.dateDue);
      let status: 'current' | 'overdue' | 'due_soon' = 'current';
      if (dueDate < now) status = 'overdue';
      else if (dueDate < thirtyDaysFromNow) status = 'due_soon';
      return { ...vax, status };
    }
    return vax;
  });

  const allCareRecommendations = parsedLabs.flatMap(l => l.careRecommendations || []);

  const weightHistory = parsedLabs
    .filter(l => l.weightValue != null)
    .map(l => ({ date: l.date, weight: l.weightValue! }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    pet, petRecords, parsedLabs, loading, refetch: fetchData, isRealPet: !!pet,
    allVaccinations, allCareRecommendations, weightHistory, parsePdfRecord,
  };
}
