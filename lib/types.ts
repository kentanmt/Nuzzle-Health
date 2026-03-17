export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: number;
  weight: number;
  sex: 'male' | 'female';
  spayedNeutered: boolean;
  existingConditions: string[];
  medications: string[];
  allergies: string[];
  avatarUrl?: string;
}

export interface LabResult {
  id: string;
  petId: string;
  date: string;
  vetName: string;
  labSource: string;
  markers: LabMarker[];
  vaccinations?: VaccinationRecord[];
  careRecommendations?: CareRecommendation[];
  weightValue?: number | null;
  weightUnit?: string;
}

export interface LabMarker {
  name: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  category: 'cbc' | 'kidney' | 'liver' | 'glucose' | 'thyroid' | 'electrolytes' | 'urinalysis';
}

export interface VaccinationRecord {
  name: string;
  dateAdministered: string | null;
  dateDue: string | null;
  lotNumber?: string | null;
  manufacturer?: string | null;
  status: 'current' | 'overdue' | 'due_soon';
}

export interface CareRecommendation {
  type: 'retest' | 'followup' | 'diet' | 'medication' | 'vaccine_due' | 'dental' | 'screening';
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface ActivityEntry {
  date: string;
  score: number;
  minutes?: number;
}

export interface HealthScore {
  overall: number;
  category: 'optimal' | 'watch' | 'elevated';
  change: number;
  breakdown: {
    bloodwork: number;
    weight: number;
    activity: number;
    age: number;
  };
}

export interface Insight {
  id: string;
  petId: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: string;
  link?: string;
}

export interface CareEvent {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: 'vaccine' | 'bloodwork' | 'dental' | 'screening' | 'parasite';
  status: 'completed' | 'upcoming' | 'overdue';
}

export interface MedicalRecord {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: 'vet-visit' | 'lab-report' | 'vaccine' | 'procedure' | 'imaging' | 'prescription' | 'note';
  vetName?: string;
  clinic?: string;
  notes?: string;
  fileName?: string;
}
