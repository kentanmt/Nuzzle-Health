import { Pet, LabResult, WeightEntry, ActivityEntry, HealthScore, Insight, CareEvent, MedicalRecord } from './types';

export const mockPet: Pet = {
  id: '1',
  name: 'Bella',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 5,
  weight: 65,
  sex: 'female',
  spayedNeutered: true,
  existingConditions: [],
  medications: [],
  allergies: [],
};

export const mockHealthScore: HealthScore = {
  overall: 86,
  category: 'optimal',
  change: 3,
  breakdown: {
    bloodwork: 88,
    weight: 75,
    activity: 80,
    age: 85,
  },
};

export const mockLabResults: LabResult[] = [
  {
    id: '1',
    petId: '1',
    date: '2025-12-15',
    vetName: 'Dr. Sarah Chen',
    labSource: 'VetPath Labs',
    markers: [
      // CBC
      { name: 'WBC', value: 10.5, unit: 'K/µL', referenceMin: 5.5, referenceMax: 16.9, category: 'cbc' },
      { name: 'RBC', value: 6.8, unit: 'M/µL', referenceMin: 5.5, referenceMax: 8.5, category: 'cbc' },
      { name: 'Hemoglobin', value: 15.2, unit: 'g/dL', referenceMin: 12, referenceMax: 18, category: 'cbc' },
      { name: 'Hematocrit', value: 45, unit: '%', referenceMin: 37, referenceMax: 55, category: 'cbc' },
      { name: 'MCV', value: 66, unit: 'fL', referenceMin: 60, referenceMax: 77, category: 'cbc' },
      { name: 'MCH', value: 22.4, unit: 'pg', referenceMin: 19.5, referenceMax: 24.5, category: 'cbc' },
      { name: 'MCHC', value: 33.8, unit: 'g/dL', referenceMin: 32, referenceMax: 36, category: 'cbc' },
      { name: 'Platelets', value: 285, unit: 'K/µL', referenceMin: 175, referenceMax: 500, category: 'cbc' },
      { name: 'Neutrophils', value: 7.2, unit: 'K/µL', referenceMin: 2.0, referenceMax: 12.0, category: 'cbc' },
      { name: 'Lymphocytes', value: 2.1, unit: 'K/µL', referenceMin: 1.0, referenceMax: 4.8, category: 'cbc' },
      { name: 'Monocytes', value: 0.5, unit: 'K/µL', referenceMin: 0.3, referenceMax: 2.0, category: 'cbc' },
      { name: 'Eosinophils', value: 0.6, unit: 'K/µL', referenceMin: 0.1, referenceMax: 1.4, category: 'cbc' },
      { name: 'Reticulocytes', value: 48, unit: 'K/µL', referenceMin: 10, referenceMax: 110, category: 'cbc' },
      // Kidney / Renal
      { name: 'BUN', value: 18, unit: 'mg/dL', referenceMin: 7, referenceMax: 27, category: 'kidney' },
      { name: 'Creatinine', value: 1.2, unit: 'mg/dL', referenceMin: 0.5, referenceMax: 1.8, category: 'kidney' },
      { name: 'SDMA', value: 11, unit: 'µg/dL', referenceMin: 0, referenceMax: 18, category: 'kidney' },
      { name: 'Phosphorus', value: 4.5, unit: 'mg/dL', referenceMin: 2.5, referenceMax: 6.8, category: 'kidney' },
      { name: 'Calcium', value: 10.2, unit: 'mg/dL', referenceMin: 7.9, referenceMax: 12.0, category: 'kidney' },
      { name: 'BUN/Creatinine Ratio', value: 15, unit: '', referenceMin: 4, referenceMax: 27, category: 'kidney' },
      // Liver / Hepatic
      { name: 'ALT', value: 42, unit: 'U/L', referenceMin: 10, referenceMax: 125, category: 'liver' },
      { name: 'AST', value: 28, unit: 'U/L', referenceMin: 0, referenceMax: 50, category: 'liver' },
      { name: 'ALP', value: 65, unit: 'U/L', referenceMin: 23, referenceMax: 212, category: 'liver' },
      { name: 'GGT', value: 5, unit: 'U/L', referenceMin: 0, referenceMax: 11, category: 'liver' },
      { name: 'Total Bilirubin', value: 0.2, unit: 'mg/dL', referenceMin: 0.0, referenceMax: 0.9, category: 'liver' },
      { name: 'Albumin', value: 3.4, unit: 'g/dL', referenceMin: 2.3, referenceMax: 4.0, category: 'liver' },
      { name: 'Total Protein', value: 6.5, unit: 'g/dL', referenceMin: 5.2, referenceMax: 8.2, category: 'liver' },
      { name: 'Globulin', value: 3.1, unit: 'g/dL', referenceMin: 2.5, referenceMax: 4.5, category: 'liver' },
      // Metabolic / Glucose
      { name: 'Glucose', value: 95, unit: 'mg/dL', referenceMin: 74, referenceMax: 143, category: 'glucose' },
      { name: 'Cholesterol', value: 225, unit: 'mg/dL', referenceMin: 110, referenceMax: 320, category: 'glucose' },
      { name: 'Triglycerides', value: 85, unit: 'mg/dL', referenceMin: 50, referenceMax: 150, category: 'glucose' },
      { name: 'Amylase', value: 620, unit: 'U/L', referenceMin: 500, referenceMax: 1500, category: 'glucose' },
      { name: 'Lipase', value: 180, unit: 'U/L', referenceMin: 100, referenceMax: 750, category: 'glucose' },
      // Thyroid
      { name: 'T4', value: 2.1, unit: 'µg/dL', referenceMin: 1.0, referenceMax: 4.0, category: 'thyroid' },
      { name: 'Free T4', value: 22, unit: 'pmol/L', referenceMin: 7, referenceMax: 40, category: 'thyroid' },
      { name: 'TSH', value: 0.28, unit: 'ng/mL', referenceMin: 0.03, referenceMax: 0.50, category: 'thyroid' },
      // Electrolytes
      { name: 'Sodium', value: 146, unit: 'mEq/L', referenceMin: 144, referenceMax: 160, category: 'electrolytes' },
      { name: 'Potassium', value: 4.6, unit: 'mEq/L', referenceMin: 3.5, referenceMax: 5.8, category: 'electrolytes' },
      { name: 'Chloride', value: 112, unit: 'mEq/L', referenceMin: 109, referenceMax: 122, category: 'electrolytes' },
      { name: 'Bicarbonate', value: 22, unit: 'mEq/L', referenceMin: 17, referenceMax: 27, category: 'electrolytes' },
      { name: 'Na/K Ratio', value: 31.7, unit: '', referenceMin: 27, referenceMax: 40, category: 'electrolytes' },
      // Urinalysis
      { name: 'Specific Gravity', value: 1.035, unit: '', referenceMin: 1.015, referenceMax: 1.045, category: 'urinalysis' },
      { name: 'pH', value: 6.5, unit: '', referenceMin: 5.5, referenceMax: 7.5, category: 'urinalysis' },
      { name: 'UPC Ratio', value: 0.15, unit: '', referenceMin: 0, referenceMax: 0.5, category: 'urinalysis' },
    ],
  },
  {
    id: '2',
    petId: '1',
    date: '2025-06-10',
    vetName: 'Dr. Sarah Chen',
    labSource: 'VetPath Labs',
    markers: [
      // CBC
      { name: 'WBC', value: 11.2, unit: 'K/µL', referenceMin: 5.5, referenceMax: 16.9, category: 'cbc' },
      { name: 'RBC', value: 6.5, unit: 'M/µL', referenceMin: 5.5, referenceMax: 8.5, category: 'cbc' },
      { name: 'Hemoglobin', value: 14.8, unit: 'g/dL', referenceMin: 12, referenceMax: 18, category: 'cbc' },
      { name: 'Hematocrit', value: 43, unit: '%', referenceMin: 37, referenceMax: 55, category: 'cbc' },
      { name: 'MCV', value: 66, unit: 'fL', referenceMin: 60, referenceMax: 77, category: 'cbc' },
      { name: 'MCH', value: 22.8, unit: 'pg', referenceMin: 19.5, referenceMax: 24.5, category: 'cbc' },
      { name: 'MCHC', value: 34.4, unit: 'g/dL', referenceMin: 32, referenceMax: 36, category: 'cbc' },
      { name: 'Platelets', value: 310, unit: 'K/µL', referenceMin: 175, referenceMax: 500, category: 'cbc' },
      { name: 'Neutrophils', value: 7.8, unit: 'K/µL', referenceMin: 2.0, referenceMax: 12.0, category: 'cbc' },
      { name: 'Lymphocytes', value: 2.3, unit: 'K/µL', referenceMin: 1.0, referenceMax: 4.8, category: 'cbc' },
      { name: 'Monocytes', value: 0.6, unit: 'K/µL', referenceMin: 0.3, referenceMax: 2.0, category: 'cbc' },
      { name: 'Eosinophils', value: 0.4, unit: 'K/µL', referenceMin: 0.1, referenceMax: 1.4, category: 'cbc' },
      { name: 'Reticulocytes', value: 55, unit: 'K/µL', referenceMin: 10, referenceMax: 110, category: 'cbc' },
      // Kidney
      { name: 'BUN', value: 16, unit: 'mg/dL', referenceMin: 7, referenceMax: 27, category: 'kidney' },
      { name: 'Creatinine', value: 1.0, unit: 'mg/dL', referenceMin: 0.5, referenceMax: 1.8, category: 'kidney' },
      { name: 'SDMA', value: 9, unit: 'µg/dL', referenceMin: 0, referenceMax: 18, category: 'kidney' },
      { name: 'Phosphorus', value: 4.2, unit: 'mg/dL', referenceMin: 2.5, referenceMax: 6.8, category: 'kidney' },
      { name: 'Calcium', value: 10.5, unit: 'mg/dL', referenceMin: 7.9, referenceMax: 12.0, category: 'kidney' },
      { name: 'BUN/Creatinine Ratio', value: 16, unit: '', referenceMin: 4, referenceMax: 27, category: 'kidney' },
      // Liver
      { name: 'ALT', value: 38, unit: 'U/L', referenceMin: 10, referenceMax: 125, category: 'liver' },
      { name: 'AST', value: 25, unit: 'U/L', referenceMin: 0, referenceMax: 50, category: 'liver' },
      { name: 'ALP', value: 58, unit: 'U/L', referenceMin: 23, referenceMax: 212, category: 'liver' },
      { name: 'GGT', value: 4, unit: 'U/L', referenceMin: 0, referenceMax: 11, category: 'liver' },
      { name: 'Total Bilirubin', value: 0.1, unit: 'mg/dL', referenceMin: 0.0, referenceMax: 0.9, category: 'liver' },
      { name: 'Albumin', value: 3.5, unit: 'g/dL', referenceMin: 2.3, referenceMax: 4.0, category: 'liver' },
      { name: 'Total Protein', value: 6.8, unit: 'g/dL', referenceMin: 5.2, referenceMax: 8.2, category: 'liver' },
      { name: 'Globulin', value: 3.3, unit: 'g/dL', referenceMin: 2.5, referenceMax: 4.5, category: 'liver' },
      // Metabolic
      { name: 'Glucose', value: 89, unit: 'mg/dL', referenceMin: 74, referenceMax: 143, category: 'glucose' },
      { name: 'Cholesterol', value: 210, unit: 'mg/dL', referenceMin: 110, referenceMax: 320, category: 'glucose' },
      { name: 'Triglycerides', value: 78, unit: 'mg/dL', referenceMin: 50, referenceMax: 150, category: 'glucose' },
      { name: 'Amylase', value: 580, unit: 'U/L', referenceMin: 500, referenceMax: 1500, category: 'glucose' },
      { name: 'Lipase', value: 165, unit: 'U/L', referenceMin: 100, referenceMax: 750, category: 'glucose' },
      // Thyroid
      { name: 'T4', value: 2.4, unit: 'µg/dL', referenceMin: 1.0, referenceMax: 4.0, category: 'thyroid' },
      { name: 'Free T4', value: 25, unit: 'pmol/L', referenceMin: 7, referenceMax: 40, category: 'thyroid' },
      { name: 'TSH', value: 0.22, unit: 'ng/mL', referenceMin: 0.03, referenceMax: 0.50, category: 'thyroid' },
      // Electrolytes
      { name: 'Sodium', value: 148, unit: 'mEq/L', referenceMin: 144, referenceMax: 160, category: 'electrolytes' },
      { name: 'Potassium', value: 4.8, unit: 'mEq/L', referenceMin: 3.5, referenceMax: 5.8, category: 'electrolytes' },
      { name: 'Chloride', value: 114, unit: 'mEq/L', referenceMin: 109, referenceMax: 122, category: 'electrolytes' },
      { name: 'Bicarbonate', value: 23, unit: 'mEq/L', referenceMin: 17, referenceMax: 27, category: 'electrolytes' },
      { name: 'Na/K Ratio', value: 30.8, unit: '', referenceMin: 27, referenceMax: 40, category: 'electrolytes' },
      // Urinalysis
      { name: 'Specific Gravity', value: 1.030, unit: '', referenceMin: 1.015, referenceMax: 1.045, category: 'urinalysis' },
      { name: 'pH', value: 6.8, unit: '', referenceMin: 5.5, referenceMax: 7.5, category: 'urinalysis' },
      { name: 'UPC Ratio', value: 0.12, unit: '', referenceMin: 0, referenceMax: 0.5, category: 'urinalysis' },
    ],
  },
];

export const mockWeightEntries: WeightEntry[] = [
  { date: '2025-01-15', weight: 62 },
  { date: '2025-03-10', weight: 63 },
  { date: '2025-05-20', weight: 64 },
  { date: '2025-07-15', weight: 64.5 },
  { date: '2025-09-10', weight: 65 },
  { date: '2025-11-20', weight: 65 },
  { date: '2025-12-15', weight: 65 },
];

export const mockActivityEntries: ActivityEntry[] = [
  { date: '2025-12-09', score: 4, minutes: 60 },
  { date: '2025-12-10', score: 3, minutes: 45 },
  { date: '2025-12-11', score: 5, minutes: 75 },
  { date: '2025-12-12', score: 4, minutes: 55 },
  { date: '2025-12-13', score: 2, minutes: 30 },
  { date: '2025-12-14', score: 4, minutes: 65 },
  { date: '2025-12-15', score: 3, minutes: 50 },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    petId: '1',
    title: 'Kidney Markers Trending Up',
    description: "Bella's creatinine has increased 20% over the past 6 months. While still within normal range, this trend may indicate early kidney stress. Consider retesting in 6 months.",
    riskLevel: 'medium',
    action: 'Schedule retest in 6 months',
    link: '#',
  },
  {
    id: '2',
    petId: '1',
    title: 'Weight Holding Steady',
    description: "Bella's weight has been stable at 65 lbs for the past 3 months. This is slightly above the ideal range for a female Golden Retriever. A 2-3 lb reduction could improve joint health.",
    riskLevel: 'low',
    action: 'Review diet plan with vet',
  },
  {
    id: '3',
    petId: '1',
    title: 'Activity Levels Good',
    description: "Bella is averaging 54 minutes of activity per day this week. This meets the recommended guidelines for her breed and age. Keep it up!",
    riskLevel: 'low',
    action: 'Maintain current routine',
  },
];

export const mockCareEvents: CareEvent[] = [
  { id: '1', petId: '1', title: 'Rabies Vaccine', date: '2025-03-15', type: 'vaccine', status: 'completed' },
  { id: '2', petId: '1', title: 'Annual Bloodwork', date: '2025-06-10', type: 'bloodwork', status: 'completed' },
  { id: '3', petId: '1', title: 'Dental Cleaning', date: '2025-09-20', type: 'dental', status: 'completed' },
  { id: '4', petId: '1', title: 'DHPP Booster', date: '2026-03-15', type: 'vaccine', status: 'upcoming' },
  { id: '5', petId: '1', title: 'Annual Bloodwork', date: '2026-06-10', type: 'bloodwork', status: 'upcoming' },
  { id: '6', petId: '1', title: 'Heartworm Test', date: '2026-01-15', type: 'parasite', status: 'overdue' },
  { id: '7', petId: '1', title: 'Dental Cleaning', date: '2026-09-20', type: 'dental', status: 'upcoming' },
  { id: '8', petId: '1', title: 'Senior Screening Panel', date: '2028-01-01', type: 'screening', status: 'upcoming' },
];

export const mockRecords: MedicalRecord[] = [
  {
    id: '1', petId: '1', title: 'Annual Wellness Exam', date: '2025-12-15',
    type: 'vet-visit', vetName: 'Dr. Sarah Chen', clinic: 'Golden Gate Vet Clinic',
    notes: 'Routine wellness exam. All vitals normal. Weight slightly above ideal — recommended slight reduction in treats and increased exercise.',
  },
  {
    id: '2', petId: '1', title: 'Complete Blood Panel Results', date: '2025-12-15',
    type: 'lab-report', vetName: 'Dr. Sarah Chen', clinic: 'VetPath Labs',
    notes: 'Full CBC, metabolic panel, thyroid, and urinalysis. All values within normal range. Creatinine trending upward — will monitor.',
    fileName: 'bella-bloodwork-dec2025.pdf',
  },
  {
    id: '3', petId: '1', title: 'Dental Cleaning', date: '2025-09-20',
    type: 'procedure', vetName: 'Dr. Mike Torres', clinic: 'Golden Gate Vet Clinic',
    notes: 'Routine dental cleaning under anesthesia. No extractions needed. Grade 1 tartar on upper molars. Recommend dental chews daily.',
  },
  {
    id: '4', petId: '1', title: 'Vaccination Record — DHPP', date: '2025-03-15',
    type: 'vaccine', vetName: 'Dr. Sarah Chen', clinic: 'Golden Gate Vet Clinic',
    notes: 'DHPP booster administered. No adverse reactions. Next booster due March 2026.',
  },
  {
    id: '5', petId: '1', title: 'Rabies Certificate', date: '2025-03-15',
    type: 'vaccine', vetName: 'Dr. Sarah Chen', clinic: 'Golden Gate Vet Clinic',
    notes: 'Rabies vaccine — 3 year. Certificate #RB-2025-4821. Expires March 2028.',
    fileName: 'rabies-cert-2025.pdf',
  },
  {
    id: '6', petId: '1', title: 'X-Ray — Left Hind Leg', date: '2024-11-05',
    type: 'imaging', vetName: 'Dr. Sarah Chen', clinic: 'Golden Gate Vet Clinic',
    notes: 'Mild limping noticed. X-ray shows no fracture or joint abnormality. Likely soft tissue strain. Recommended rest for 1 week.',
    fileName: 'bella-xray-leg-nov2024.pdf',
  },
  {
    id: '7', petId: '1', title: 'Spay Surgery', date: '2021-06-10',
    type: 'procedure', vetName: 'Dr. Lisa Park', clinic: 'Bay Area Spay & Neuter Clinic',
    notes: 'Routine ovariohysterectomy. No complications. Full recovery in 10 days.',
  },
];
