import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, PawPrint, ClipboardList, TrendingUp, LogOut, RefreshCw, Lock } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const COLORS = ['#4a7c59', '#82b59a', '#c9dfd0', '#e8f4ec'];

interface WaitlistRow {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  email: string;
  location: string | null;
  pet_name: string | null;
  species: string | null;
  breed: string | null;
  vet_name: string | null;
  utm_source: string | null;
}

interface Stats {
  // Waitlist
  totalWaitlist: number;
  totalProfiles: number;
  totalPets: number;
  recentSignups: WaitlistRow[];
  speciesBreakdown: { name: string; value: number }[];
  sourceBreakdown: { name: string; value: number }[];
  signupsByDay: { date: string; count: number }[];
  // Triage
  totalTriageSessions: number;
  triageUrgencyBreakdown: { name: string; value: number }[];
  triageBySpecies: { name: string; value: number }[];
  topSymptoms: { name: string; count: number }[];
  recentTriageSessions: any[];
  // Biomarkers
  topAbnormalMarkers: { name: string; count: number }[];
  markerStatusBreakdown: { name: string; value: number }[];
  // Health scores
  totalHealthScores: number;
  avgHealthScore: number;
  healthScoreCategoryBreakdown: { name: string; value: number }[];
  healthScoresByDay: { date: string; avg: number; count: number }[];
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-3xl font-heading text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user, loading, signIn, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const isAdmin = !loading && user?.email === ADMIN_EMAIL;
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedKnowledge = async () => {
    setSeeding(true);
    const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
    if (!OPENAI_KEY) { setSeedResult('✗ VITE_OPENAI_KEY not set in Vercel env vars'); setSeeding(false); return; }

    const CHUNKS = [
      // ── LAB REFERENCES: DOGS ──────────────────────────────────────────────
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "WBC", symptom_cluster: null, content: `WBC reference range in dogs: 5.5–16.9 x10³/μL. Leukocytosis: infection, inflammation, stress leukogram, neoplasia. Leukopenia: bone marrow suppression, parvovirus (severe neutropenia — life-threatening in young dogs), sepsis. Neutrophil left shift (bands >300/μL) = severe acute inflammation. Toxic neutrophils = sepsis or endotoxemia.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "RBC_HCT", symptom_cluster: null, content: `RBC/HCT in dogs: RBC 5.5–8.5 x10⁶/μL; HCT 37–55%; Hemoglobin 12–18 g/dL. Anemia: regenerative (reticulocytes >60k — hemolysis/hemorrhage) vs non-regenerative (CKD, bone marrow). IMHA: spherocytes, autoagglutination. Low MCV = iron deficiency or portosystemic shunt. Polycythemia HCT >60%: dehydration or polycythemia vera.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "platelets", symptom_cluster: null, content: `Platelets in dogs: 200–500 x10³/μL. Thrombocytopenia <150: bleeding risk significant <50. ITP most common in dogs. Tick-borne disease (Ehrlichia, Anaplasma), DIC, bone marrow suppression. EDTA clumping artifact — verify with blood smear.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "BUN_creatinine", symptom_cluster: null, content: `BUN 7–27 mg/dL; Creatinine 0.5–1.8 mg/dL in dogs. Pre-renal: BUN:Cr >30, USG >1.030. Renal: USG <1.030, >75% nephron loss needed. Post-renal: obstruction or rupture. Low BUN: liver failure, portosystemic shunt. SDMA detects CKD at 25–40% nephron loss.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "SDMA", symptom_cluster: null, content: `SDMA reference: <14 μg/dL dogs and cats. More sensitive early marker of GFR decline than creatinine — detects CKD at 25–40% nephron loss. IRIS recommends SDMA alongside creatinine for staging. Elevated SDMA with normal creatinine = early CKD — recheck 2–4 weeks. Not affected by muscle mass.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "ALT", symptom_cluster: null, content: `ALT reference in dogs: 12–118 U/L. Liver-specific in dogs. Mild elevation (1–3x): steroid hepatopathy, NSAIDs. Moderate (3–10x): pancreatitis, hepatitis, hepatic lipidosis. Severe (>10x): acute hepatocellular necrosis, xylitol, acetaminophen. Phenobarbital and corticosteroids are common causes.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "ALP", symptom_cluster: null, content: `ALP reference in dogs: 5–131 U/L. Marked elevation >3x with normal ALT = Cushing's or corticosteroid. Other causes: cholestasis, pancreatitis, bone disease. ALP in cats 5–75 U/L — any elevation in cats is more clinically significant.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "glucose", symptom_cluster: null, content: `Glucose in dogs: 74–143 mg/dL. Hyperglycemia: DM (fasting >200 + glucosuria), Cushing's, pancreatitis, stress. Hypoglycemia <60: insulinoma, insulin overdose, Addison's, hepatic failure, xylitol toxicity. Toy breeds at risk for juvenile hypoglycemia.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "electrolytes", symptom_cluster: null, content: `Electrolytes in dogs: Na 140–154; K 3.5–5.8; Cl 105–122 mEq/L. Na:K ratio <27:1 = Addison's hallmark. Hyperkalemia: urethral obstruction (cardiac risk K+ >6.5), AKI. Hyponatremia: Addison's first, GI loss. Hypokalemia: vomiting/diarrhea, CKD.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "thyroid_T4", symptom_cluster: null, content: `T4 reference in dogs: 1.0–4.0 μg/dL. Hypothyroidism: lethargy, weight gain, alopecia, hypercholesterolemia. At-risk: Goldens, Dobermans, Boxers, Cocker Spaniels. Confirm with fT4ed + TSH if borderline. Treatment: levothyroxine 0.02 mg/kg q12h.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "cholesterol", symptom_cluster: null, content: `Cholesterol in dogs: 110–320 mg/dL. Hypercholesterolemia: hypothyroidism (always screen T4), Cushing's, DM, nephrotic syndrome. Miniature Schnauzers: breed-specific hyperlipidemia — pancreatitis risk; low-fat diet + omega-3.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "calcium_phosphorus", symptom_cluster: null, content: `Calcium in dogs: 7.9–12.0 mg/dL. Phosphorus: 2.5–6.8 mg/dL. Hypercalcemia: malignancy (lymphoma — PTHrP), hyperparathyroidism, Addison's, Vitamin D toxicity. Hypocalcemia: eclampsia (emergency in lactating dogs), pancreatitis, hypoparathyroidism.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "bile_acids", symptom_cluster: null, content: `Bile acids in dogs: Fasting <15 μmol/L; 2hr post-prandial <25 μmol/L. Elevated bile acids = hepatic dysfunction or portosystemic shunt. Shunt profile: young dog, small body size, low BUN, low albumin, ammonium urate crystals in urine. Severe elevation (>100) post-prandial strongly suggests shunt. Phenobarbital-treated dogs: use bile acids instead of ALP/ALT for liver function.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "lipase_cPLI", symptom_cluster: null, content: `Canine pancreatitis: Spec cPL (cPLI) is the gold standard — >400 μg/L highly specific for pancreatitis. Lipase >3x reference = suspicious but non-specific. Clinical signs: vomiting, cranial abdominal pain, anorexia. At-risk breeds: Miniature Schnauzer, Yorkshire Terrier, Cocker Spaniel. Dietary fat trigger common. Treat: NPO/water only, IV fluids, antiemetics, pain management.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "coagulation", symptom_cluster: null, content: `Coagulation in dogs: PT 5.1–7.9 sec; PTT 8.6–12.9 sec; Fibrinogen 150–400 mg/dL. Prolonged PT+PTT: rodenticide (warfarin/brodifacoum) — treat with Vitamin K1 4 weeks minimum. DIC: PT prolonged + PTT prolonged + thrombocytopenia + low fibrinogen + high D-dimers. Hemophilia A (factor VIII — common in dogs): PTT prolonged, PT normal.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "albumin_protein", symptom_cluster: null, content: `Total protein dogs: 5.2–8.2 g/dL; Albumin 2.5–4.4 g/dL; Globulin 2.3–5.2 g/dL. Low albumin: PLE (protein-losing enteropathy — often with low globulin too), PLN, liver failure, vasculitis, third-spacing. Hypoalbuminemia <1.5 g/dL = edema/effusion risk. High globulin: chronic infection, ehrlichiosis, FIP (cats), multiple myeloma.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "urinalysis", symptom_cluster: null, content: `Urinalysis in dogs: USG 1.015–1.045 (well-concentrated >1.030). Isosthenuria 1.007–1.015 = impaired concentrating ability. Proteinuria: >1+ on dipstick with USG <1.020 = significant — perform UPC. Glucosuria without hyperglycemia = Fanconi syndrome (Basenjis). Struvite crystals: UTI-associated. Calcium oxalate: Miniature Schnauzers, stone-forming breeds.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "cortisol_ACTH", symptom_cluster: null, content: `Cortisol testing in dogs: ACTH stimulation test — pre and post 1h cortisol. Post >22 μg/dL = Cushing's (HAC). Post <2 μg/dL = Addison's (hypoadrenocorticism). LDDS test: cortisol at 0h, 4h, 8h — 8h cortisol >1.4 μg/dL = Cushing's. Urine cortisol:creatinine ratio (UCCR) >13.5 x10⁻⁶ screening test for Cushing's.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "dog", analyte: "troponin_cardiac", symptom_cluster: null, content: `Cardiac biomarkers in dogs: cTnI (cardiac troponin I) >0.2 ng/mL = myocardial injury. NT-proBNP >900 pmol/L = cardiac disease — useful for differentiating cardiac vs respiratory dyspnea. Holter monitor: Dobermans with >100 VPCs/24h = ARVC progression risk. Echocardiography: LA:Ao ratio >1.5 = left atrial enlargement in MVD.` },

      // ── LAB REFERENCES: CATS ──────────────────────────────────────────────
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "kidney_cats", symptom_cluster: null, content: `Kidney in cats: BUN 15–32; Creatinine 0.6–2.4; SDMA <14; Phosphorus 2.4–8.2 mg/dL. CKD most common disease in cats >10yr. IRIS staging: Stage 1 = SDMA ≥18; Stage 2 = Cr 1.6–2.8; Stage 3 = 2.9–5.0; Stage 4 = >5.0. UPC >0.4 = significant proteinuria. Monitor BP — target <160 mmHg.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "thyroid_cats", symptom_cluster: null, content: `Feline T4: 0.8–4.0 μg/dL. Hyperthyroidism most common endocrine disease in cats >10yr. Signs: weight loss + increased appetite, PU/PD, vomiting, tachycardia, hypertension. T4 >4.0 + clinical signs confirms. Recheck BUN/creatinine/SDMA 4–6 weeks post-treatment for unmasked CKD.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "glucose_cats", symptom_cluster: null, content: `Glucose in cats: 64–170 mg/dL. Stress hyperglycemia very common — can reach 250–400 mg/dL without diabetes. DM in cats: typically Type 2 (obesity, male, inactive). Fructosamine distinguishes stress (<350 normal) from DM. Many diabetic cats achieve remission with weight loss + high-protein low-carb diet.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "liver_cats", symptom_cluster: null, content: `Liver in cats: ALT 12–130; ALP 5–75; GGT 0–4; Bilirubin 0–0.4 mg/dL. Hepatic lipidosis: obese cats not eating 2+ days — fatal without tube feeding. ALP >100 in cats warrants investigation. Cholangitis often concurrent with IBD and pancreatitis (triaditis).` },
      { source: "Cornell AHDC", document_type: "lab_reference", species: "cat", analyte: "CBC_cats", symptom_cluster: null, content: `CBC in cats: WBC 4.0–15.5; RBC 4.6–10.0; HCT 28–49%; Platelets 150–600. Anemia <25% HCT causes clinical signs. Causes: CKD, IMHA, FeLV, Mycoplasma haemofelis. Heinz body anemia: acetaminophen (fatal in cats), onions, garlic. Lymphocytosis with LGL = intestinal lymphoma.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "lipase_cats", symptom_cluster: null, content: `Feline pancreatitis: Spec fPL >5.4 μg/L = consistent with pancreatitis. Often subclinical. Signs subtle: lethargy, anorexia, mild vomiting (less prominent than dogs). Triaditis = concurrent pancreatitis + IBD + cholangitis (common in cats). Ultrasound: heterogeneous pancreas, peripancreatic effusion. Treat: supportive care, antiemetics, appetite stimulants, pain control.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "urinalysis_cats", symptom_cluster: null, content: `Urinalysis in cats: USG 1.035–1.060 normal (cats concentrate well). USG <1.035 in symptomatic cat = impaired concentration — investigate CKD, hyperthyroidism, DM. Struvite and calcium oxalate most common crystals. Hematuria + dysuria without bacteria = idiopathic FLUTD (stress-related). Bacteriuria uncommon in young cats — more common in older/CKD cats.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "NT-proBNP_cats", symptom_cluster: null, content: `NT-proBNP in cats: >265 pmol/L suggests cardiac disease. Useful for distinguishing cardiac from respiratory dyspnea in emergency. HCM most common cardiac disease in cats. Maine Coon, Ragdoll, Sphynx, British Shorthair — genetic HCM screening recommended. Echocardiography: LVW >6mm in diastole = HCM. Spontaneous echocardiographic contrast ("smoke") = high thrombus risk.` },

      // ── PRE-ANALYTICAL / LAB INTERPRETATION ───────────────────────────────
      { source: "eClinPath — Cornell University", document_type: "pre_analytical", species: "both", analyte: null, symptom_cluster: null, content: `Pre-analytical factors — Hemolysis: difficult venipuncture or breed-specific high erythrocyte K+ (Akita, Shiba Inu). Elevates: potassium, AST, LDH, bilirubin, ALT. Decreases: sodium, ALP. Lipemia (TG >200): interferes with assays — fast 12h and repeat. Separate serum within 30 minutes.` },
      { source: "eClinPath — Cornell University", document_type: "pre_analytical", species: "both", analyte: null, symptom_cluster: null, content: `Greyhound and sighthound reference ranges: HCT 50–65% (physiological erythrocytosis — not polycythemia vera). Creatinine may be higher due to lean muscle mass — compare with SDMA. Platelets often mildly low (150–200). Neutrophil counts lower than other breeds. Always use breed-specific ranges for Greyhounds — standard ranges will cause over-interpretation.` },

      // ── SYMPTOMS: GI ──────────────────────────────────────────────────────
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "GI", content: `Vomiting in dogs: Acute — dietary indiscretion (self-limiting 24–48h), foreign body (Labradors, Goldens), parvovirus (young unvaccinated — emergency), pancreatitis (Schnauzers, Yorkies), AHDS (PCV >55%). Emergency: bloated abdomen + retching = GDV emergency.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "GI", content: `Vomiting in cats: Acute — hairballs, dietary, linear foreign body (string/ribbon — emergency). Chronic — hyperthyroidism (older cats), IBD/intestinal lymphoma, CKD. CRITICAL: cat not eating >48h especially if obese = hepatic lipidosis risk.` },
      { source: "HuggingFace Pet Health Symptoms / Merck Vet Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "GI", content: `Diarrhea: Small intestinal — large volume, weight loss, melena (upper GI bleed). Causes: dietary change, Giardia, parvovirus, IBD. Large intestinal — small frequent volumes, tenesmus, mucus, hematochezia (fresh blood), colitis. AHDS: bloody diarrhea + vomiting, PCV >55% — IV fluids, rapid recovery.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "GI", content: `Weight loss in dogs: Inadequate intake vs malabsorption vs increased demand. Key differentials: EPI (exocrine pancreatic insufficiency — young German Shepherds, Rough Collies; cow-pie diarrhea, ravenous appetite, low B12), IBD, intestinal lymphoma, hypoadrenocorticism, diabetes mellitus, cardiac cachexia. Evaluate: albumin, B12, folate, TLI (fasting), fecal for parasites.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "GI", content: `Weight loss in cats: Most common causes in cats >8yr: hyperthyroidism (check T4 first), CKD, DM, IBD, intestinal lymphoma. In younger cats: parasites, poor-quality diet, FIV/FeLV, GI foreign body. Small cell (low grade) lymphoma vs IBD: distinguish with intestinal biopsy — both cause chronic vomiting/weight loss/diarrhea in middle-aged+ cats.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "GI", content: `Parvovirus in dogs: Life-threatening in unvaccinated puppies 6–20 weeks. Profuse hemorrhagic vomiting and diarrhea, severe leukopenia (WBC <2.0), dehydration. Diagnosis: fecal ELISA snap test. Treatment: IV fluids, antiemetics (maropitant), antibiotics (ampicillin + fluoroquinolone), parvovirus-specific hyperimmune serum if available. Survival >80% with aggressive treatment, <10% without.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "GI", content: `Constipation and megacolon in cats: Obstipation (unable to defecate despite straining) = veterinary emergency. Risk factors: dehydration, pelvic fracture history, neuromuscular disease, obesity, long-hair breeds. Megacolon (dilated atonic colon) often end-stage. Treatment: enemas (never phosphate enemas — toxic in cats), manual decolonization under sedation, lactulose, high-fiber diet, subcutaneous fluids for hydration.` },

      // ── SYMPTOMS: URINARY / ENDOCRINE ────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "urinary", content: `Urinary signs: Male cat straining with no urine output = URETHRAL OBSTRUCTION EMERGENCY. Untreated: AKI, hyperkalemia K+ >6.5 = cardiac arrhythmia, death within 24–48h. FLUTD in cats: idiopathic cystitis (stress-related), struvite uroliths. Dogs: UTI (females), urolithiasis, prostate disease (intact males).` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "endocrine", content: `PU/PD: Dogs — DM (glucosuria + hyperglycemia), Cushing's (elevated ALP, pot-belly, alopecia, panting), CKD, pyometra (intact female), hypercalcemia. Cats — hyperthyroidism (most common cats >10yr), DM, CKD. USG >1.030 = pre-renal/endocrine; USG <1.020 = primary renal or endocrine polyuria.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "endocrine", content: `Cushing's disease (hyperadrenocorticism) in dogs: PDH (pituitary-dependent, 85%) vs ADH (adrenal tumor, 15%). Classic signs: pot-belly, muscle wasting, PU/PD, panting, bilaterally symmetric alopecia, thin skin, comedones, calcinosis cutis. Labs: elevated ALP (often >1000), mild hyperglycemia, high cholesterol, dilute urine. Breeds: Poodles, Dachshunds, Boxers, Boston Terriers. Confirm with LDDS or ACTH stim. Treatment: trilostane or mitotane.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "endocrine", content: `Addison's disease (hypoadrenocorticism) in dogs: "The great pretender" — mimics many conditions. Classic: Na:K ratio <27:1, hypoglycemia, pre-renal azotemia, bradycardia. Signs: episodic weakness/collapse, vomiting, diarrhea, waxing-waning illness. Triggered by stress. Atypical Addison's: normal electrolytes (glucocorticoid only). ACTH stim confirms. Treatment: mineralocorticoid (DOCP q25d or fludrocortisone) + glucocorticoid (prednisone).` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "endocrine", content: `Pyometra in intact female dogs: Life-threatening uterine infection. Open pyometra: vaginal discharge (often purulent). Closed pyometra: no discharge — more dangerous, abdomen distended. Signs: PU/PD, lethargy, anorexia, vomiting, elevated WBC (often >30,000). Occurs 4–8 weeks post-estrus. Treatment: emergency ovariohysterectomy. Medical management (prostaglandins) only in valuable breeding females with open pyometra. Do NOT delay surgery.` },

      // ── SYMPTOMS: RESPIRATORY ─────────────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "respiratory", content: `Respiratory: Dogs — kennel cough (dry honking), pneumonia (fever, crackles), laryngeal paralysis (older Labs), collapsing trachea (toy breeds), BOAS (Bulldogs, Frenchies). Cats — asthma (wheezing, Siamese predisposed), pleural effusion (FIP, lymphoma, CHF). Open-mouth breathing in cats is always abnormal — emergency.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "respiratory", content: `Brachycephalic Obstructive Airway Syndrome (BOAS): Affects Bulldogs, French Bulldogs, Pugs, Boston Terriers, Shih Tzus. Components: stenotic nares, elongated soft palate, hypoplastic trachea, everted laryngeal saccules. Signs: stertor, exercise intolerance, cyanosis in heat/exercise, sleep apnea. Heatstroke risk severely elevated. Surgical correction (nares, palate) improves quality of life significantly. Avoid overheating, obesity, excitement.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "respiratory", content: `Feline upper respiratory infection (URI): Herpesvirus + calicivirus most common (90%). Signs: sneezing, nasal discharge, conjunctivitis, oral ulcers (calicivirus). Herpesvirus latent — reactivates with stress. Treatment: lysine supplementation (controversial), doxycycline if Mycoplasma/Chlamydophila suspected, supportive care (nebulization, decongestants). Chronic sequelae: chronic rhinitis, corneal ulcers. Vaccination reduces severity but not infection.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "respiratory", content: `Kennel cough (infectious tracheobronchitis): Bordetella bronchiseptica + parainfluenza. Harsh honking cough, goose-honk on tracheal palpation. Typically self-limiting 1–3 weeks. Treat: rest, cough suppressants (butorphanol), antibiotics if systemic signs (doxycycline 5–7 days). Bordetella vaccine: intranasal most effective, 3-day onset. Caution: puppies, immunocompromised, brachycephalic breeds — higher pneumonia risk.` },

      // ── SYMPTOMS: NEUROLOGICAL ────────────────────────────────────────────
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "neurological", content: `Seizures: young-middle dogs = idiopathic epilepsy (Beagles, Border Collies, Goldens). Metabolic: hypoglycemia (check glucose immediately), hepatic encephalopathy, hypocalcemia. Toxins: xylitol, organophosphates. IVDD: acute paralysis in Dachshunds, Corgis, French Bulldogs — emergency MRI if Grade V.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "neurological", content: `Intervertebral disc disease (IVDD): Hansen Type I (chondrodystrophic breeds — Dachshund, Beagle, Shih Tzu): acute disc extrusion, often severe. Hansen Type II (large breeds): chronic disc protrusion, progressive. Grading I–V: Grade I = pain only; Grade V = no deep pain — emergency decompression within 24–48h maximizes recovery. MRI gold standard. Medical management (cage rest, steroids) for Grade I–II.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "neurological", content: `Vestibular disease: Peripheral (inner ear, CN VIII) — head tilt, nystagmus (horizontal/rotary), falling/rolling, nausea. Old dog vestibular disease most common — sudden onset but improves within 72h without treatment. Central (brainstem) — vertical nystagmus, multiple CN deficits, postural reaction deficits = MRI needed. Otitis interna: ear infection extending deep — needs aggressive antibiotics.` },

      // ── SYMPTOMS: CARDIAC ─────────────────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "cardiac", content: `Cardiac: Syncope vs seizure — syncope: consciousness retained, exertion-related. Cavaliers: MVD near-universal by 10yr. Dobermans: DCM — Holter + echo from age 3. Boxers: ARVC — VT + syncope. Cats with CHF: pleural effusion more common; HCM most common cause; Maine Coons, Ragdolls, Sphynx predisposed.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "cardiac", content: `Aortic thromboembolism (ATE) in cats: "Saddle thrombus" — sudden hind limb paralysis, cold limbs, absent femoral pulses, vocalization from pain. Associated with HCM, hyperthyroidism, cardiomyopathy. Emergency: pain management (opioids), anticoagulants (heparin, clopidogrel). Survival 33–50% with aggressive treatment. Prevention: clopidogrel (Plavix) 18.75 mg/cat daily for at-risk HCM cats.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "cardiac", content: `Congestive heart failure (CHF) in dogs: Left-sided: pulmonary edema — cough (often nocturnal), exercise intolerance, tachycardia, orthopnea. Right-sided: ascites, pleural effusion, jugular distension. Treatment: furosemide (loop diuretic), pimobendan (increases contractility + vasodilation — start when LA enlargement present), ACE inhibitor (enalapril/benazepril). Monitor body weight daily — gain >0.5 kg = fluid retention, increase diuretic.` },

      // ── SYMPTOMS: SKIN / DERMATOLOGY ─────────────────────────────────────
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "skin", content: `Pruritus: FAD most common (flea dirt, dorsal lumbar/tail base). Atopic dermatitis (face, feet, ears, axillae — Goldens, Labs, Bulldogs). Food allergy (non-seasonal, elimination diet 8–12 weeks). Sarcoptic mange (pinnal-pedal reflex positive). Alopecia: hypothyroidism (bilateral symmetric), Cushing's (truncal, comedones), Demodex.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "skin", content: `Otitis externa: Most common presentation in dogs. Predisposing factors: floppy ears (Labs, Cocker Spaniels), atopy, swimming, hypothyroidism. Pathogens: Malassezia (brown waxy discharge, sweet odor), Staphylococcus pseudintermedius (bacterial, purulent), Pseudomonas (chronic, resistant, green discharge). Cytology essential before treatment. Chronic otitis: assess for polyps, stenosis, otitis media — CT recommended.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "skin", content: `Ringworm (dermatophytosis): Microsporum canis most common in cats (often subclinical carriers), Microsporum gypseum and Trichophyton in dogs. Signs: circular alopecia, scaling, crusting — NOT always pruritic. Wood's lamp: M. canis fluoresces apple-green (50% sensitive). Culture: definitive. Treatment: itraconazole pulse therapy + topical miconazole/chlorhexidine shampoo. Zoonotic — treat environment thoroughly.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "skin", content: `Hot spots (acute moist dermatitis): Self-traumatized lesion — rapidly expanding, moist, painful, malodorous. Common in Golden Retrievers, Labs, German Shepherds. Triggered by: flea bite, matted fur, ear infection, anal gland impaction. Treatment: clip fur around lesion, clean with chlorhexidine, topical steroid-antibiotic combo (betamethasone/gentamicin), Elizabethan collar. Oral antibiotics if deep pyoderma (3–4 weeks doxycycline or cephalexin).` },

      // ── SYMPTOMS: MUSCULOSKELETAL ─────────────────────────────────────────
      { source: "HuggingFace Pet Health Symptoms / Merck Vet Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "musculoskeletal", content: `Lameness: Acute non-weight-bearing — paw injury, fracture, cruciate rupture (drawer sign; Labs, Rottweilers). Gradual — OA/DJD (most common chronic), hip dysplasia (large breeds, bunny hopping), patellar luxation (medial small breeds). Bone pain in large dogs >5yr = osteosarcoma until proven otherwise.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "musculoskeletal", content: `Cranial cruciate ligament (CCL) rupture in dogs: Most common orthopedic injury in dogs. Partial vs complete tear. Signs: acute non-weight-bearing (complete) or intermittent lameness (partial), positive cranial drawer test, joint effusion. At-risk: Labrador Retriever, Rottweiler, Newfoundland, obese dogs. Treatment: TPLO or TTA surgery recommended for dogs >15 kg — medical management high failure rate. Early OA if untreated.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "musculoskeletal", content: `Osteoarthritis (OA) management: Multimodal approach. Weight management most impactful single intervention — 6% body weight loss = significant pain reduction. NSAIDs (carprofen, meloxicam, grapiprant): most effective for acute pain. Omega-3 fatty acids EPA+DHA: 40 mg/kg/day anti-inflammatory. Joint supplements: UC-II collagen (better evidence than glucosamine/chondroitin). Adequan (polysulfated glycosaminoglycan) IM injections: disease-modifying. Physiotherapy, hydrotherapy for muscle support.` },

      // ── SYMPTOMS: EYES ────────────────────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "ophthalmology", content: `Ocular emergencies: Acute glaucoma (elevated IOP >30 mmHg) — cloudy cornea, episcleral injection, mydriasis, pain — EMERGENCY, vision lost within hours. Uveitis — miosis, aqueous flare, hypopyon — systemic disease workup (Brucella, Leptospirosis, FeLV, FIV, lymphoma, blastomycosis). Corneal ulcer — fluorescein stain positive — antibiotics (triple antibiotic or tobramycin) + atropine for spasm; no steroids. Sudden blindness — hypertensive retinopathy in cats (check BP), SARDS in dogs.` },

      // ── SYMPTOMS: DENTAL ──────────────────────────────────────────────────
      { source: "WSAVA Dental Guidelines / Merck Vet Manual", document_type: "guideline", species: "both", analyte: null, symptom_cluster: "dental", content: `Dental disease: Affects >80% of dogs and cats over age 3. Periodontal disease stages 1–4. Signs: halitosis, drooling, reluctance to eat hard food, pawing at mouth, tooth discoloration, gingival recession. Systemic effects: bacteremia — cardiac (endocarditis), renal, hepatic damage with severe periodontal disease. Professional cleaning under anesthesia + dental radiographs for staging. Home care: daily brushing gold standard, dental chews/water additives as adjuncts.` },

      // ── INFECTIOUS DISEASE ────────────────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "infectious", content: `Leptospirosis in dogs: Zoonotic bacterial infection (Leptospira serovars). Urban spread via wildlife urine (raccoons, rats), standing water. Signs: AKI (most common — elevated creatinine, BUN), hepatitis (elevated ALT/ALP), fever, uveitis, pulmonary hemorrhage (rare but fatal). Diagnosis: MAT titers (paired), PCR urine. Treatment: doxycycline (early/renal), penicillin G (during leptospiremic phase), IV fluids. Vaccine: 4-serovar (L4) annual in endemic areas.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "infectious", content: `Lyme disease in dogs: Borrelia burgdorferi via Ixodes tick (must attach >24–48h). Endemic: Northeast, Upper Midwest, Pacific coast US. Most dogs seropositive but asymptomatic. Clinical Lyme: shifting-leg lameness, fever, lymphadenopathy, lethargy. Lyme nephritis: rare but severe — protein-losing nephropathy, poor prognosis. Diagnosis: C6 antibody SNAP test → quantitative C6 if positive. Treatment: doxycycline 30 days. Prevention: tick control + Lyme vaccine in endemic areas.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "infectious", content: `Tick-borne disease panel in dogs: Ehrlichia canis (monocytic ehrlichiosis) — thrombocytopenia, pancytopenia in chronic; southeastern/southwestern US. Anaplasma phagocytophilum — thrombocytopenia, joint pain; northeastern US; same tick as Lyme. Rocky Mountain Spotted Fever (RMSF) — Rickettsia rickettsii — thrombocytopenia, vasculitis, petechiae, edema, neurological signs; can be fatal within days. All: doxycycline 7–21 days; RMSF 7 days minimum.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "infectious", content: `FIV and FeLV in cats: FIV (feline immunodeficiency virus) — transmitted via bite wounds (intact male cats highest risk); leads to immunosuppression, chronic infections, lymphoma; long latent period. FeLV (feline leukemia virus) — transmitted via saliva/mutual grooming (close contact); causes anemia, immunosuppression, lymphoma; progressive disease. Testing: SNAP combo test (antigen FeLV, antibody FIV). FeLV vaccine available (outdoor cats). No FIV cure or vaccine available in US.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "infectious", content: `Heartworm disease in dogs: Dirofilaria immitis transmitted by mosquitoes. Endemic: southeastern US, Mississippi River valley, globally. Microfilaria → L3 larvae → pulmonary arteries → adult worms. Class I: asymptomatic, incidental diagnosis. Class II: mild cough, exercise intolerance. Class III: severe, right heart disease. Class IV: caval syndrome (emergency). Treatment: melarsomine (Immiticide) injections, strict exercise restriction 8 weeks post-treatment. Prevention: monthly macrocyclic lactone (ivermectin, milbemycin).` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "infectious", content: `Heartworm disease in cats: Cats are atypical hosts — most worms die before adulthood, but dying larvae cause Heartworm Associated Respiratory Disease (HARD) — acute respiratory distress, often misdiagnosed as asthma. Antigen test often false-negative (few female worms). Diagnose: antigen + antibody test + echocardiography. NO approved treatment in cats — melarsomine fatal. Prevention is critical: selamectin, ivermectin monthly. HARD may resolve spontaneously or be fatal.` },

      // ── ONCOLOGY ─────────────────────────────────────────────────────────
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "oncology", content: `Mast cell tumor (MCT) in dogs: Most common cutaneous tumor in dogs. Highly variable behavior — grade I (benign), grade II (intermediate), grade III (aggressive). Degranulation signs: erythema, urticaria around mass (Darier's sign), GI ulcers (histamine), hypotension if manipulated. Breeds: Boxers, Bulldogs, Boston Terriers, Pugs, Golden Retrievers, Labs. Work-up: FNA cytology (mast cells + eosinophils), surgical excision with 2–3 cm margins + deep fascial plane. Histopathology grades. High-grade: lomustine + palladia.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "oncology", content: `Osteosarcoma (OSA) in dogs: Most common primary bone tumor. Large/giant breeds: Irish Wolfhound, Great Dane, Greyhound, Rottweiler, German Shepherd. Location: appendicular skeleton (distal radius, proximal humerus most common). Signs: progressive lameness, bone pain, swelling — pathological fracture if advanced. Aggressive lytic + proliferative radiographic pattern. Amputation + carboplatin chemotherapy: median survival 10–12 months; without chemo 4 months. Lung metastases 90% by death.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "oncology", content: `Lymphoma in dogs: Multicentric most common (80%) — bilateral lymphadenopathy (firm, painless lymph nodes). Mean age 6–9yr. Golden Retrievers, Boxers, Bulldogs predisposed. High-grade B-cell responds best to CHOP protocol (cyclophosphamide, doxorubicin, vincristine, prednisone) — median survival 12 months. T-cell lymphoma: shorter remission. Hypercalcemia in ~10% (mediastinal/T-cell). Alimentary lymphoma in cats: chronic vomiting/weight loss — low-grade (chlorambucil + pred: 2–3yr survival) vs high-grade (CHOP: 2–3 months).` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "oncology", content: `Splenic masses in dogs: Hemoabdomen + splenic mass in large-breed dog = splenic hemangiosarcoma until proven otherwise. German Shepherds and Golden Retrievers most affected. Acute collapse from hemoperitoneum. Emergency splenectomy — survival without chemo 1–2 months; with doxorubicin 4–6 months. Benign nodular hyperplasia and hematoma also common — "rule of two-thirds": 2/3 of splenic masses malignant in large dogs, 2/3 of malignant = hemangiosarcoma. Ultrasound + FNA (if stable) vs surgical biopsy.` },

      // ── TOXICOLOGY / EMERGENCIES ──────────────────────────────────────────
      { source: "Merck Veterinary Manual / FDA AERS", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "toxicology", content: `Common toxins — DOGS: Xylitol (gum, peanut butter) — hypoglycemia + hepatic necrosis, potentially fatal; even small amounts dangerous. Grapes/raisins — AKI, idiosyncratic (no safe dose established). Chocolate — theobromine (dark >> milk >> white); tremors, arrhythmias, seizures. Onions/garlic — Heinz body hemolytic anemia (cats more sensitive). Ibuprofen/naproxen — GI ulceration + AKI. Macadamia nuts — tremors, hyperthermia. Rodenticide (brodifacoum) — coagulopathy 3–5 days post-ingestion.` },
      { source: "Merck Veterinary Manual / FDA AERS", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "toxicology", content: `Common toxins — CATS: Lilies (Easter, Tiger, Day lily) — ALL PARTS FATAL; AKI begins 24–72h after ingestion; early emesis + IV fluids essential. Permethrin (dog flea products) — tremors, seizures, hyperthermia — emergency; methocarbamol + cooling. Acetaminophen (Tylenol) — methemoglobinemia, Heinz body anemia, hepatic necrosis; even 1 tablet fatal; treat with N-acetylcysteine IV. Essential oils (tea tree, eucalyptus) — hepatotoxic, neurotoxic. Onions, garlic — more sensitive than dogs.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "emergency", content: `GDV (Gastric Dilatation-Volvulus) in dogs: LIFE-THREATENING EMERGENCY. Large + giant breeds, deep-chested (Great Dane, German Shepherd, Standard Poodle, Weimaraner). Signs: unproductive retching, rapidly distending abdomen, hypersalivation, collapse. Cardiovascular compromise: shock within hours. Treatment: IV fluids (aggressive), gastric decompression (trocar), emergency surgery (gastropexy). Risk reduction: prophylactic gastropexy (recommended for high-risk breeds), avoid feeding immediately before/after exercise, elevated bowls controversial.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "emergency", content: `Heatstroke in dogs and cats: Core temperature >41°C (106°F). Brachycephalic breeds, heavy-coated, obese, elderly, exercising in heat most at risk. Signs: hyperthermia, panting, hypersalivation, vomiting, bloody diarrhea, collapse, seizures. Treatment: active cooling (cool [not ice cold] water, fans), IV fluids, avoid vasoconstrictive shock cooling. Complications: DIC, AKI, cerebral edema. Monitor coagulation, kidney values 24–72h. Even with treatment — significant morbidity.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "emergency", content: `Anaphylaxis in dogs and cats: Vaccine reactions, bee stings, food, medications. Dogs: primary shock organ = liver (hepatic venous engorgement) → vomiting, diarrhea, collapse. Cats: primary shock organ = lungs → bronchospasm, dyspnea. Treatment: epinephrine 0.01 mg/kg IM immediately, IV fluids, diphenhydramine, corticosteroids. Monitor 4–6h post-reaction for biphasic response. Horses: skin testing recommended before subsequent vaccine in reaction history.` },

      // ── DRUG INTERACTIONS / PHARMACOLOGY ─────────────────────────────────
      { source: "FDA Animal & Veterinary AERS / eClinPath", document_type: "drug_interaction", species: "both", analyte: "ALT_ALP", symptom_cluster: null, content: `Drug-induced liver elevation: NSAIDs (carprofen, meloxicam): monitor ALT/ALP baseline and 2–4 weeks after starting; discontinue if ALT >3x. Phenobarbital: expect ALP and ALT elevation — assess with bile acids. Corticosteroids: marked ALP elevation in dogs. Antifungals: hepatotoxic — monitor every 30 days.` },
      { source: "FDA Animal & Veterinary AERS / eClinPath", document_type: "drug_interaction", species: "cat", analyte: "CBC", symptom_cluster: null, content: `Methimazole in cats: Heinz body hemolytic anemia, thrombocytopenia, granulocytopenia (fever + lethargy = emergency CBC). Monitor CBC + T4 + chemistry at 2 weeks, 4 weeks, then every 3–6 months. DO NOT use azathioprine in cats — fatal bone marrow suppression.` },
      { source: "FDA Animal & Veterinary AERS / Merck Vet Manual", document_type: "drug_interaction", species: "both", analyte: null, symptom_cluster: null, content: `NSAID safety in dogs and cats: Never combine two NSAIDs or NSAIDs + corticosteroids (GI hemorrhage risk). Washout period: 5–7 days between NSAIDs; 2 weeks prednisone → NSAID. Cats: meloxicam at very low doses (0.025 mg/kg q48–72h) only; ibuprofen and naproxen TOXIC — even one tablet causes GI ulceration + AKI. GI protectants (omeprazole) recommended if NSAID use >2 weeks or history of GI disease. Always provide with food.` },
      { source: "FDA Animal & Veterinary AERS / Merck Vet Manual", document_type: "drug_interaction", species: "dog", analyte: null, symptom_cluster: null, content: `Seizure medications in dogs: Phenobarbital: first-line; therapeutic range 20–40 μg/mL; monitor levels 2 weeks after starting, then every 6 months; liver toxicity risk long-term. Potassium bromide: adjunct for refractory epilepsy; do NOT use in cats (severe pneumonitis). Levetiracetam (Keppra): safest hepatic profile; useful as add-on. Zonisamide: useful in cats and dogs. Drug interactions: phenobarbital induces hepatic enzymes — alters metabolism of many drugs.` },
      { source: "FDA Animal & Veterinary AERS", document_type: "drug_interaction", species: "both", analyte: null, symptom_cluster: null, content: `Flea and tick prevention safety: Isoxazolines (Bravecto, Nexgard, Simparica, Credelio) — rare neurological side effects (tremors, ataxia, seizures) — caution in pets with seizure history. Permethrin: safe in dogs, FATAL in cats — never use dog spot-ons on cats. Organophosphates: toxic to both species — avoid older flea collar formulations. Selamectin (Revolution): safe in both species, heartworm prevention + fleas. Fluralaner (Bravecto cats): 3-month protection, safe in cats.` },

      // ── PREVENTIVE CARE / GUIDELINES ──────────────────────────────────────
      { source: "WSAVA / AVMA Clinical Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `WSAVA preventive guidelines: Annual exam all dogs and cats. Senior pets: biannual exam + CBC, chemistry, urinalysis, T4 (cats). Core vaccines dogs: DA2PP + rabies (3yr intervals). Core vaccines cats: FVRCP + rabies (3yr intervals). Non-core: Leptospirosis (annual endemic areas), Bordetella, Lyme, FeLV (outdoor cats).` },
      { source: "WSAVA / AVMA Clinical Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `CKD management (IRIS): Phosphorus restriction from Stage 1. Treat hypertension if systolic >160 mmHg (amlodipine cats; ACE inhibitor dogs). Treat proteinuria UPC >0.4 cats, >0.5 dogs. Darbepoetin for anemia HCT <20% cats. Encourage water intake — wet food preferred cats.` },
      { source: "WSAVA Pain Guidelines / IVAPM", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `Pain assessment in dogs and cats: Validated scales: Glasgow Composite Pain Scale (GCPS) dogs; Feline Grimace Scale (FGS) cats. Signs of chronic pain in cats: reduced grooming, reluctance to jump, hiding, altered facial expression. Multimodal analgesia: combine NSAID + opioid + local anesthetic + adjuncts (gabapentin, amantadine for central sensitization). Gabapentin: 5–10 mg/kg BID–TID dogs; 5–10 mg/kg q8–12h cats — also anxiolytic (useful pre-hospital visits).` },
      { source: "WSAVA / AAHA Obesity Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `Obesity in dogs and cats: BCS (Body Condition Score) 1–9: ideal = 4–5. BCS 7+ = overweight; 8–9 = obese. Obesity increases risk: OA, DM, respiratory compromise, hepatic lipidosis (cats), BOAS exacerbation, reduced lifespan. Weight loss: 1–2% body weight per week maximum. Cats: never starve — hepatic lipidosis risk; reduce by 20–30% caloric restriction. Exercise + portion control + low-calorie diet + scheduled feeding (no free feeding).` },
      { source: "AAHA Senior Care Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `Senior pet health thresholds: Dogs: small breeds senior from age 9; large breeds from age 7; giant breeds from age 5. Cats: mature 7–10yr, senior 11–14yr, geriatric >15yr. Recommended diagnostics: CBC, comprehensive metabolic panel, urinalysis (including UPC if proteinuric), systolic BP, T4 (cats all seniors), fecal. Cognitive dysfunction syndrome (CDS): disorientation, altered sleep-wake cycle, house soiling, decreased interaction — similar to Alzheimer's; selegiline or environmental enrichment.` },
      { source: "AAHA Diabetes Management Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `Diabetes mellitus management: Dogs: insulin-dependent (Type 1-like); insulin: NPH or Vetsulin (porcine lente) BID with meals; fructosamine/HbA1c for monitoring; goal fructosamine 350–450 μmol/L. Cats: Type 2-like; ProZinc or glargine (Lantus) BID; high-protein low-carb diet critical; many cats achieve remission within 3–6 months — recheck glucose frequently to avoid hypoglycemia as insulin need decreases. Hypoglycemia emergency: rub corn syrup on gums, immediate vet.` },

      // ── REPRODUCTION / MISCELLANEOUS ───────────────────────────────────────
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "reproductive", content: `Pyometra in intact female dogs: Life-threatening uterine infection occurring 4–8 weeks post-estrus. Open pyometra: purulent vaginal discharge. Closed pyometra: no discharge — more dangerous, abdomen distended, toxemic. WBC often >30,000–100,000, elevated BUN/creatinine. Immediate ovariohysterectomy is treatment of choice. Delay = septicemia, uterine rupture, DIC, death. Medical management (aglepristone or PGF2α) only in valuable breeding females with open pyometra under close monitoring.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "reproductive", content: `Eclampsia (puerperal tetany) in dogs: Hypocalcemia in nursing bitches — small breeds with large litters most at risk (Chihuahua, Dachshund, Shih Tzu, Miniature Pinscher). Signs: muscle tremors, stiff gait, panting, hyperthermia, seizures, 2–4 weeks post-whelping. Emergency IV calcium gluconate (slow, cardiac monitoring). Wean puppies immediately. Prevention: do NOT supplement calcium during pregnancy (suppresses parathyroid function).` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "behavioral", content: `Anxiety and behavioral disorders in dogs and cats: Separation anxiety (dogs): destructive behavior, vocalization, elimination when alone — behavior modification + fluoxetine or trazodone. Storm/noise phobia: thundershirt, melatonin, trazodone 5 mg/kg PRN, sileo (dexmedetomidine gel sublingual). Feline idiopathic cystitis: strongly stress-related — multi-cat households, environmental change. Environmental enrichment, Feliway diffusers, anti-anxiety diets (Royal Canin Calm, Hill's c/d Stress) reduce flare frequency.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "emergency", content: `Foreign body ingestion: Dogs commonly ingest socks, underwear, corn cobs, toys, bones, stones. Small objects (<1cm in small dogs, <2cm in large dogs) may pass — monitor with serial radiographs. Linear foreign bodies (string, ribbon, tinsel — cats especially): DO NOT pull — risk of intestinal plication and perforation. Endoscopic removal if in stomach <24h. Surgery if beyond pylorus. Signs of obstruction: persistent vomiting, anorexia, abdominal pain, dehydration.` },
    ];

    try {
      await supabase.from('vet_knowledge').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      let inserted = 0;
      const errors: string[] = [];
      for (const chunk of CHUNKS) {
        const embRes = await fetch(
          'https://api.openai.com/v1/embeddings',
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` }, body: JSON.stringify({ model: 'text-embedding-3-small', input: chunk.content, dimensions: 768 }) }
        );
        if (!embRes.ok) { errors.push(`Embed failed: ${await embRes.text()}`); continue; }
        const embData = await embRes.json();
        const embedding = embData.data[0].embedding;
        const { error } = await supabase.from('vet_knowledge').insert({ ...chunk, embedding, metadata: {} });
        if (error) errors.push(error.message);
        else inserted++;
      }
      setSeedResult(errors.length ? `✓ ${inserted} seeded, ${errors.length} errors: ${errors[0]}` : `✓ Seeded ${inserted} chunks successfully!`);
    } catch (e: any) {
      setSeedResult(`✗ Seed failed: ${e.message}`);
    }
    setSeeding(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      setLoginError('Invalid email or password.');
    }
    setLoggingIn(false);
  };

  async function fetchStats() {
    setFetching(true);

    const today = new Date();
    const buildDayMap = (days = 14) => {
      const m: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        m[d.toISOString().slice(0, 10)] = 0;
      }
      return m;
    };

    const [waitlistRes, profilesRes, petsRes, triageRes, labResultsRes, healthScoresRes] = await Promise.all([
      supabase.from('waitlist_signups' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
      supabase.from('triage_sessions' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('parsed_lab_results').select('markers, test_date, pet_id'),
      supabase.from('pet_health_scores' as any).select('*').order('generated_at', { ascending: false }),
    ]);

    if (waitlistRes.error) console.error('waitlist query error:', waitlistRes.error);
    const waitlist: WaitlistRow[] = (waitlistRes.data as WaitlistRow[]) ?? [];
    const triageSessions: any[] = (triageRes.data as any[]) ?? [];
    const labResults: any[] = (labResultsRes.data as any[]) ?? [];
    const healthScores: any[] = (healthScoresRes.data as any[]) ?? [];

    // ── Waitlist ──────────────────────────────────────────
    const speciesMap: Record<string, number> = {};
    waitlist.forEach(w => { const s = w.species ?? 'Unknown'; speciesMap[s] = (speciesMap[s] ?? 0) + 1; });

    const sourceMap: Record<string, number> = {};
    waitlist.forEach(w => { const s = w.utm_source ?? 'Direct'; sourceMap[s] = (sourceMap[s] ?? 0) + 1; });

    const signupDayMap = buildDayMap(14);
    waitlist.forEach(w => { const d = w.created_at?.slice(0, 10); if (d && signupDayMap[d] !== undefined) signupDayMap[d]++; });

    // ── Triage ────────────────────────────────────────────
    const urgencyMap: Record<string, number> = {};
    triageSessions.forEach(s => { const l = s.urgency_level ?? 'unknown'; urgencyMap[l] = (urgencyMap[l] ?? 0) + 1; });

    const triageSpeciesMap: Record<string, number> = {};
    triageSessions.forEach(s => { const sp = s.species ?? 'unknown'; triageSpeciesMap[sp] = (triageSpeciesMap[sp] ?? 0) + 1; });

    const symptomCountMap: Record<string, number> = {};
    triageSessions.forEach(s => {
      const syms: string[] = Array.isArray(s.symptoms) ? s.symptoms : [];
      syms.forEach((sym: string) => { symptomCountMap[sym] = (symptomCountMap[sym] ?? 0) + 1; });
    });
    const topSymptoms = Object.entries(symptomCountMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ── Biomarkers ────────────────────────────────────────
    const abnormalMarkerMap: Record<string, number> = {};
    const statusMap: Record<string, number> = { normal: 0, high: 0, low: 0, critical: 0 };
    labResults.forEach(lr => {
      const markers: any[] = Array.isArray(lr.markers) ? lr.markers : [];
      markers.forEach((m: any) => {
        if (m.status && m.status !== 'normal') {
          abnormalMarkerMap[m.name] = (abnormalMarkerMap[m.name] ?? 0) + 1;
          if (statusMap[m.status] !== undefined) statusMap[m.status]++;
          else statusMap.critical++;
        } else {
          statusMap.normal = (statusMap.normal ?? 0) + 1;
        }
      });
    });
    const topAbnormalMarkers = Object.entries(abnormalMarkerMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    const markerStatusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // ── Health Scores ─────────────────────────────────────
    const validScores = healthScores.filter(s => s.overall_score != null);
    const avgHealthScore = validScores.length
      ? Math.round(validScores.reduce((sum, s) => sum + s.overall_score, 0) / validScores.length)
      : 0;

    const categoryMap: Record<string, number> = {};
    healthScores.forEach(s => { const c = s.category ?? 'unknown'; categoryMap[c] = (categoryMap[c] ?? 0) + 1; });

    const scoreDayMap = buildDayMap(14);
    const scoreDayCount: Record<string, number> = {};
    const scoreDaySum: Record<string, number> = {};
    Object.keys(scoreDayMap).forEach(k => { scoreDayCount[k] = 0; scoreDaySum[k] = 0; });
    validScores.forEach(s => {
      const d = (s.generated_at ?? '').slice(0, 10);
      if (scoreDayCount[d] !== undefined) { scoreDayCount[d]++; scoreDaySum[d] += s.overall_score; }
    });
    const healthScoresByDay = Object.keys(scoreDayMap).map(date => ({
      date: date.slice(5),
      avg: scoreDayCount[date] > 0 ? Math.round(scoreDaySum[date] / scoreDayCount[date]) : 0,
      count: scoreDayCount[date],
    }));

    setStats({
      totalWaitlist: waitlist.length,
      totalProfiles: profilesRes.count ?? 0,
      totalPets: petsRes.count ?? 0,
      recentSignups: waitlist.slice(0, 20),
      speciesBreakdown: Object.entries(speciesMap).map(([name, value]) => ({ name, value })),
      sourceBreakdown: Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value })),
      signupsByDay: Object.entries(signupDayMap).map(([date, count]) => ({ date: date.slice(5), count })),
      totalTriageSessions: triageSessions.length,
      triageUrgencyBreakdown: Object.entries(urgencyMap).map(([name, value]) => ({ name, value })),
      triageBySpecies: Object.entries(triageSpeciesMap).map(([name, value]) => ({ name, value })),
      topSymptoms,
      recentTriageSessions: triageSessions.slice(0, 10),
      topAbnormalMarkers,
      markerStatusBreakdown,
      totalHealthScores: healthScores.length,
      avgHealthScore,
      healthScoreCategoryBreakdown: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      healthScoresByDay,
    });
    setFetching(false);
  }

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6 p-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-sage-light flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <NuzzleLogo size="sm" />
            <p className="text-sm text-muted-foreground">Admin access only</p>
          </div>
          <Button
            className="w-full h-11 gap-3"
            variant="outline"
            onClick={() => signInWithGoogle(`${window.location.origin}/admin`)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>
          {user && !isAdmin && (
            <p className="text-xs text-destructive text-center">
              Signed in as <strong>{user.email}</strong> — not an admin account.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <NuzzleLogo size="sm" />
            <span className="text-sm font-semibold text-muted-foreground border-l border-border pl-3">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchStats} disabled={fetching} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${fetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSeedKnowledge} disabled={seeding} className="gap-1.5 text-xs">
              {seeding ? 'Seeding…' : 'Seed AI Knowledge'}
            </Button>
            {seedResult && <span className="text-xs text-muted-foreground">{seedResult}</span>}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10 max-w-6xl mx-auto space-y-10">
        {fetching && !stats ? (
          <div className="text-center py-20 text-muted-foreground">Loading data…</div>
        ) : stats ? (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ClipboardList} label="Waitlist Signups" value={stats.totalWaitlist} sub="All time" />
              <StatCard icon={Users} label="Registered Users" value={stats.totalProfiles} sub="Supabase profiles" />
              <StatCard icon={PawPrint} label="Pets Added" value={stats.totalPets} sub="Across all users" />
              <StatCard
                icon={TrendingUp}
                label="Last 7 Days"
                value={stats.signupsByDay.slice(-7).reduce((s, d) => s + d.count, 0)}
                sub="New waitlist signups"
              />
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Signups over time */}
              <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Waitlist Signups — Last 14 Days</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.signupsByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Species breakdown */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Species Breakdown</h3>
                {stats.speciesBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stats.speciesBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                        {stats.speciesBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No data yet</p>
                )}
              </div>
            </div>

            {/* Traffic sources */}
            {stats.sourceBreakdown.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Traffic Sources (UTM)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stats.sourceBreakdown} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent signups table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Recent Waitlist Signups</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Date', 'Name', 'Email', 'Pet', 'Species', 'Location', 'Vet', 'Source'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentSignups.map(row => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.first_name} {row.last_name ?? ''}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.email}</td>
                        <td className="px-4 py-2.5">{row.pet_name ?? '—'}</td>
                        <td className="px-4 py-2.5 capitalize">{row.species ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.location ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.vet_name ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.utm_source ?? 'Direct'}</td>
                      </tr>
                    ))}
                    {stats.recentSignups.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No signups yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── TRIAGE ANALYTICS ─────────────────────────────────── */}
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Symptom Checker Analytics</h2>
              <p className="text-xs text-muted-foreground">Every triage session — including anonymous users</p>
            </div>

            {/* Triage stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ClipboardList} label="Total Sessions" value={stats.totalTriageSessions} sub="All time" />
              <StatCard
                icon={TrendingUp}
                label="Emergency / Urgent"
                value={
                  (stats.triageUrgencyBreakdown.find(u => u.name === 'emergency')?.value ?? 0) +
                  (stats.triageUrgencyBreakdown.find(u => u.name === 'urgent')?.value ?? 0)
                }
                sub="High-acuity cases"
              />
              <StatCard
                icon={PawPrint}
                label="Dogs vs Cats"
                value={`${stats.triageBySpecies.find(s => s.name === 'dog')?.value ?? 0} / ${stats.triageBySpecies.find(s => s.name === 'cat')?.value ?? 0}`}
                sub="Dogs / Cats"
              />
              <StatCard
                icon={Users}
                label="Unique Symptoms"
                value={stats.topSymptoms.length}
                sub="Distinct reported symptoms"
              />
            </div>

            {/* Urgency breakdown + top symptoms */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Urgency Breakdown</h3>
                {stats.triageUrgencyBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.triageUrgencyBreakdown}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {stats.triageUrgencyBreakdown.map((entry, i) => {
                          const urgencyColors: Record<string, string> = {
                            emergency: '#dc2626',
                            urgent: '#ea580c',
                            'monitor-at-home': '#16a34a',
                            routine: '#2563eb',
                          };
                          return <Cell key={i} fill={urgencyColors[entry.name] ?? COLORS[i % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No triage sessions yet</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Top Reported Symptoms</h3>
                {stats.topSymptoms.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.topSymptoms.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No symptom data yet</p>
                )}
              </div>
            </div>

            {/* Recent triage sessions table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Recent Triage Sessions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Date', 'Pet', 'Species', 'Breed', 'Age', 'Symptoms', 'Urgency', 'Zip', 'User'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentTriageSessions.map((row: any) => (
                      <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{new Date(row.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5 font-medium">{row.pet_name ?? '—'}</td>
                        <td className="px-4 py-2.5 capitalize">{row.species ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.breed ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.age ? `${row.age} yrs` : '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground max-w-[160px] truncate">
                          {Array.isArray(row.symptoms) ? row.symptoms.slice(0, 3).join(', ') + (row.symptoms.length > 3 ? `…+${row.symptoms.length - 3}` : '') : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.urgency_level === 'emergency' ? 'bg-red-100 text-red-700' :
                            row.urgency_level === 'urgent' ? 'bg-orange-100 text-orange-700' :
                            row.urgency_level === 'monitor-at-home' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {row.urgency_level ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.zip_code ?? '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.user_id ? 'Logged in' : 'Anonymous'}</td>
                      </tr>
                    ))}
                    {stats.recentTriageSessions.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No triage sessions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── BIOMARKER ANALYTICS ───────────────────────────────── */}
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Biomarker Analytics</h2>
              <p className="text-xs text-muted-foreground">Aggregated from all uploaded lab reports</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Top abnormal markers */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Most Common Abnormal Markers</h3>
                {stats.topAbnormalMarkers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.topAbnormalMarkers.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No lab data yet</p>
                )}
              </div>

              {/* Marker status breakdown */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Marker Status Distribution</h3>
                {stats.markerStatusBreakdown.some(m => m.value > 0) ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats.markerStatusBreakdown.filter(m => m.value > 0)}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {stats.markerStatusBreakdown.map((entry, i) => {
                          const statusColors: Record<string, string> = { normal: '#16a34a', high: '#ea580c', low: '#2563eb', critical: '#dc2626' };
                          return <Cell key={i} fill={statusColors[entry.name] ?? COLORS[i % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No lab data yet</p>
                )}
              </div>
            </div>

            {/* ── HEALTH SCORE ANALYTICS ────────────────────────────── */}
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">AI Health Score Analytics</h2>
              <p className="text-xs text-muted-foreground">Gemini-generated scores stored per generation</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Total Scores Generated" value={stats.totalHealthScores} sub="All time" />
              <StatCard icon={ClipboardList} label="Avg Health Score" value={stats.avgHealthScore || '—'} sub="Out of 100" />
              <StatCard
                icon={PawPrint}
                label="Excellent / Good"
                value={
                  (stats.healthScoreCategoryBreakdown.find(c => c.name === 'Excellent')?.value ?? 0) +
                  (stats.healthScoreCategoryBreakdown.find(c => c.name === 'Good')?.value ?? 0)
                }
                sub="High-scoring pets"
              />
              <StatCard
                icon={Users}
                label="Needs Attention"
                value={
                  (stats.healthScoreCategoryBreakdown.find(c => c.name === 'Fair')?.value ?? 0) +
                  (stats.healthScoreCategoryBreakdown.find(c => c.name === 'Poor')?.value ?? 0)
                }
                sub="Fair or Poor scores"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Scores over time */}
              <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Avg Health Score — Last 14 Days</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.healthScoresByDay} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val: any) => [val || 'No data', 'Avg score']} />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Score Categories</h3>
                {stats.healthScoreCategoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={stats.healthScoreCategoryBreakdown}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {stats.healthScoreCategoryBreakdown.map((entry, i) => {
                          const catColors: Record<string, string> = { Excellent: '#16a34a', Good: '#4a7c59', Fair: '#ea580c', Poor: '#dc2626', unknown: '#94a3b8' };
                          return <Cell key={i} fill={catColors[entry.name] ?? COLORS[i % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground pt-4">No scores yet</p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
