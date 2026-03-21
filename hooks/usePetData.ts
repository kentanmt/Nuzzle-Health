import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Pet, LabResult, LabMarker, VaccinationRecord, CareRecommendation } from '@/lib/types';

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
          markers: (lab.markers as any[] || []).map((m: any): LabMarker => ({
            name: m.name,
            value: Number(m.value),
            unit: m.unit || '',
            referenceMin: Number(m.referenceMin || m.reference_min || 0),
            referenceMax: Number(m.referenceMax || m.reference_max || 100),
            category: m.category || 'cbc',
          })),
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

  // Trigger PDF parsing for unprocessed records
  const parseUnprocessedRecords = useCallback(async () => {
    if (!user || !session?.access_token || petRecords.length === 0) return;
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
        await supabase.functions.invoke('parse-lab-pdf', {
          body: { pet_record_id: record.id },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      } catch (err) {
        console.error('Failed to parse record:', record.id, err);
      }
    }

    await fetchData();
    isParsing.current = false;
  }, [user, session, petRecords, fetchData]);

  useEffect(() => {
    if (petRecords.length > 0 && session?.access_token) {
      parseUnprocessedRecords();
    }
  }, [petRecords.length, session?.access_token, parseUnprocessedRecords]);

  // Aggregate all vaccinations from parsed labs, then deduplicate by vaccine type
  // keeping only the MOST RECENT administration per normalized vaccine name
  const rawVaccinations = parsedLabs.flatMap(l => l.vaccinations || []);
  
  // Normalize vaccine names to group equivalent vaccines
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

  // Group by normalized name and keep the most recently administered one
  const vaxByType = new Map<string, typeof rawVaccinations[0]>();
  for (const vax of rawVaccinations) {
    const key = normalizeVaxName(vax.name);
    const existing = vaxByType.get(key);
    if (!existing) {
      vaxByType.set(key, vax);
    } else {
      // Keep the one with the more recent administration date
      const existingDate = existing.dateAdministered ? new Date(existing.dateAdministered).getTime() : 0;
      const newDate = vax.dateAdministered ? new Date(vax.dateAdministered).getTime() : 0;
      if (newDate > existingDate) {
        vaxByType.set(key, vax);
      }
    }
  }
  
  // Recalculate status dynamically based on current date
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
  
  // Get weight history from parsed labs
  const weightHistory = parsedLabs
    .filter(l => l.weightValue != null)
    .map(l => ({ date: l.date, weight: l.weightValue! }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { 
    pet, petRecords, parsedLabs, loading, refetch: fetchData, isRealPet: !!pet,
    allVaccinations, allCareRecommendations, weightHistory,
  };
}
