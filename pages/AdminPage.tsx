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
  totalWaitlist: number;
  totalProfiles: number;
  totalPets: number;
  recentSignups: WaitlistRow[];
  speciesBreakdown: { name: string; value: number }[];
  sourceBreakdown: { name: string; value: number }[];
  signupsByDay: { date: string; count: number }[];
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
  const { user, loading, signIn, signOut } = useAuth();
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
    setSeedResult('Seeding… this takes ~60 seconds');
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
    if (!GEMINI_KEY) { setSeedResult('✗ VITE_GEMINI_KEY not set in Vercel env vars'); setSeeding(false); return; }

    const CHUNKS = [
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
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "kidney_cats", symptom_cluster: null, content: `Kidney in cats: BUN 15–32; Creatinine 0.6–2.4; SDMA <14; Phosphorus 2.4–8.2 mg/dL. CKD most common disease in cats >10yr. IRIS staging: Stage 1 = SDMA ≥18; Stage 2 = Cr 1.6–2.8; Stage 3 = 2.9–5.0; Stage 4 = >5.0. UPC >0.4 = significant proteinuria. Monitor BP — target <160 mmHg.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "thyroid_cats", symptom_cluster: null, content: `Feline T4: 0.8–4.0 μg/dL. Hyperthyroidism most common endocrine disease in cats >10yr. Signs: weight loss + increased appetite, PU/PD, vomiting, tachycardia, hypertension. T4 >4.0 + clinical signs confirms. Recheck BUN/creatinine/SDMA 4–6 weeks post-treatment for unmasked CKD.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "glucose_cats", symptom_cluster: null, content: `Glucose in cats: 64–170 mg/dL. Stress hyperglycemia very common — can reach 250–400 mg/dL without diabetes. DM in cats: typically Type 2 (obesity, male, inactive). Fructosamine distinguishes stress (<350 normal) from DM. Many diabetic cats achieve remission with weight loss + high-protein low-carb diet.` },
      { source: "Cornell AHDC / eClinPath", document_type: "lab_reference", species: "cat", analyte: "liver_cats", symptom_cluster: null, content: `Liver in cats: ALT 12–130; ALP 5–75; GGT 0–4; Bilirubin 0–0.4 mg/dL. Hepatic lipidosis: obese cats not eating 2+ days — fatal without tube feeding. ALP >100 in cats warrants investigation. Cholangitis often concurrent with IBD and pancreatitis (triaditis).` },
      { source: "Cornell AHDC", document_type: "lab_reference", species: "cat", analyte: "CBC_cats", symptom_cluster: null, content: `CBC in cats: WBC 4.0–15.5; RBC 4.6–10.0; HCT 28–49%; Platelets 150–600. Anemia <25% HCT causes clinical signs. Causes: CKD, IMHA, FeLV, Mycoplasma haemofelis. Heinz body anemia: acetaminophen (fatal in cats), onions, garlic. Lymphocytosis with LGL = intestinal lymphoma.` },
      { source: "eClinPath — Cornell University", document_type: "pre_analytical", species: "both", analyte: null, symptom_cluster: null, content: `Pre-analytical factors — Hemolysis: difficult venipuncture or breed-specific high erythrocyte K+ (Akita, Shiba Inu). Elevates: potassium, AST, LDH, bilirubin, ALT. Decreases: sodium, ALP. Lipemia (TG >200): interferes with assays — fast 12h and repeat. Separate serum within 30 minutes.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "dog", analyte: null, symptom_cluster: "GI", content: `Vomiting in dogs: Acute — dietary indiscretion (self-limiting 24–48h), foreign body (Labradors, Goldens), parvovirus (young unvaccinated — emergency), pancreatitis (Schnauzers, Yorkies), AHDS (PCV >55%). Emergency: bloated abdomen + retching = GDV emergency.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "cat", analyte: null, symptom_cluster: "GI", content: `Vomiting in cats: Acute — hairballs, dietary, linear foreign body (string/ribbon — emergency). Chronic — hyperthyroidism (older cats), IBD/intestinal lymphoma, CKD. CRITICAL: cat not eating >48h especially if obese = hepatic lipidosis risk.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "urinary", content: `Urinary signs: Male cat straining with no urine output = URETHRAL OBSTRUCTION EMERGENCY. Untreated: AKI, hyperkalemia K+ >6.5 = cardiac arrhythmia, death within 24–48h. FLUTD in cats: idiopathic cystitis (stress-related), struvite uroliths. Dogs: UTI (females), urolithiasis, prostate disease (intact males).` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "endocrine", content: `PU/PD: Dogs — DM (glucosuria + hyperglycemia), Cushing's (elevated ALP, pot-belly, alopecia, panting), CKD, pyometra (intact female), hypercalcemia. Cats — hyperthyroidism (most common cats >10yr), DM, CKD. USG >1.030 = pre-renal/endocrine; USG <1.020 = primary renal or endocrine polyuria.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "neurological", content: `Seizures: young-middle dogs = idiopathic epilepsy (Beagles, Border Collies, Goldens). Metabolic: hypoglycemia (check glucose immediately), hepatic encephalopathy, hypocalcemia. Toxins: xylitol, organophosphates. IVDD: acute paralysis in Dachshunds, Corgis, French Bulldogs — emergency MRI if Grade V.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "respiratory", content: `Respiratory: Dogs — kennel cough (dry honking), pneumonia (fever, crackles), laryngeal paralysis (older Labs), collapsing trachea (toy breeds), BOAS (Bulldogs, Frenchies). Cats — asthma (wheezing, Siamese predisposed), pleural effusion (FIP, lymphoma, CHF). Open-mouth breathing in cats is always abnormal — emergency.` },
      { source: "Merck Veterinary Manual / Cornell Consultant", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "skin", content: `Pruritus: FAD most common (flea dirt, dorsal lumbar/tail base). Atopic dermatitis (face, feet, ears, axillae — Goldens, Labs, Bulldogs). Food allergy (non-seasonal, elimination diet 8–12 weeks). Sarcoptic mange (pinnal-pedal reflex positive). Alopecia: hypothyroidism (bilateral symmetric), Cushing's (truncal, comedones), Demodex.` },
      { source: "Merck Veterinary Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "cardiac", content: `Cardiac: Syncope vs seizure — syncope: consciousness retained, exertion-related. Cavaliers: MVD near-universal by 10yr. Dobermans: DCM — Holter + echo from age 3. Boxers: ARVC — VT + syncope. Cats with CHF: pleural effusion more common; HCM most common cause; Maine Coons, Ragdolls, Sphynx predisposed.` },
      { source: "FDA Animal & Veterinary AERS / eClinPath", document_type: "drug_interaction", species: "both", analyte: "ALT_ALP", symptom_cluster: null, content: `Drug-induced liver elevation: NSAIDs (carprofen, meloxicam): monitor ALT/ALP baseline and 2–4 weeks after starting; discontinue if ALT >3x. Phenobarbital: expect ALP and ALT elevation — assess with bile acids. Corticosteroids: marked ALP elevation in dogs. Antifungals: hepatotoxic — monitor every 30 days.` },
      { source: "FDA Animal & Veterinary AERS / eClinPath", document_type: "drug_interaction", species: "cat", analyte: "CBC", symptom_cluster: null, content: `Methimazole in cats: Heinz body hemolytic anemia, thrombocytopenia, granulocytopenia (fever + lethargy = emergency CBC). Monitor CBC + T4 + chemistry at 2 weeks, 4 weeks, then every 3–6 months. DO NOT use azathioprine in cats — fatal bone marrow suppression.` },
      { source: "WSAVA / AVMA Clinical Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `WSAVA preventive guidelines: Annual exam all dogs and cats. Senior pets: biannual exam + CBC, chemistry, urinalysis, T4 (cats). Core vaccines dogs: DA2PP + rabies (3yr intervals). Core vaccines cats: FVRCP + rabies (3yr intervals). Non-core: Leptospirosis (annual endemic areas), Bordetella, Lyme, FeLV (outdoor cats).` },
      { source: "WSAVA / AVMA Clinical Guidelines", document_type: "guideline", species: "both", analyte: null, symptom_cluster: null, content: `CKD management (IRIS): Phosphorus restriction from Stage 1. Treat hypertension if systolic >160 mmHg (amlodipine cats; ACE inhibitor dogs). Treat proteinuria UPC >0.4 cats, >0.5 dogs. Darbepoetin for anemia HCT <20% cats. Encourage water intake — wet food preferred cats.` },
      { source: "HuggingFace Pet Health Symptoms / Merck Vet Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "GI", content: `Diarrhea: Small intestinal — large volume, weight loss, melena (upper GI bleed). Causes: dietary change, Giardia, parvovirus, IBD. Large intestinal — small frequent volumes, tenesmus, mucus, hematochezia (fresh blood), colitis. AHDS: bloody diarrhea + vomiting, PCV >55% — IV fluids, rapid recovery.` },
      { source: "HuggingFace Pet Health Symptoms / Merck Vet Manual", document_type: "symptom", species: "both", analyte: null, symptom_cluster: "musculoskeletal", content: `Lameness: Acute non-weight-bearing — paw injury, fracture, cruciate rupture (drawer sign; Labs, Rottweilers). Gradual — OA/DJD (most common chronic), hip dysplasia (large breeds, bunny hopping), patellar luxation (medial small breeds). Bone pain in large dogs >5yr = osteosarcoma until proven otherwise.` },
    ];

    try {
      await supabase.from('vet_knowledge').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      let inserted = 0;
      const errors: string[] = [];
      for (const chunk of CHUNKS) {
        const embRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'models/embedding-001', content: { parts: [{ text: chunk.content }] } }) }
        );
        if (!embRes.ok) { errors.push(`Embed failed: ${await embRes.text()}`); continue; }
        const embData = await embRes.json();
        const embedding = embData.embedding.values;
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
    const [waitlistRes, profilesRes, petsRes] = await Promise.all([
      supabase.from('waitlist_signups' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('pets').select('id', { count: 'exact', head: true }),
    ]);

    const waitlist: WaitlistRow[] = (waitlistRes.data as WaitlistRow[]) ?? [];

    // Species breakdown
    const speciesMap: Record<string, number> = {};
    waitlist.forEach(w => {
      const s = w.species ?? 'Unknown';
      speciesMap[s] = (speciesMap[s] ?? 0) + 1;
    });
    const speciesBreakdown = Object.entries(speciesMap).map(([name, value]) => ({ name, value }));

    // UTM source breakdown
    const sourceMap: Record<string, number> = {};
    waitlist.forEach(w => {
      const s = w.utm_source ?? 'Direct';
      sourceMap[s] = (sourceMap[s] ?? 0) + 1;
    });
    const sourceBreakdown = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Signups by day (last 14 days)
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    waitlist.forEach(w => {
      const day = w.created_at?.slice(0, 10);
      if (day && dayMap[day] !== undefined) dayMap[day]++;
    });
    const signupsByDay = Object.entries(dayMap).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    }));

    setStats({
      totalWaitlist: waitlist.length,
      totalProfiles: profilesRes.count ?? 0,
      totalPets: petsRes.count ?? 0,
      recentSignups: waitlist.slice(0, 20),
      speciesBreakdown,
      sourceBreakdown,
      signupsByDay,
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="h-11"
              />
            </div>
            {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            <Button type="submit" className="w-full h-11" disabled={loggingIn}>
              {loggingIn ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
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
          </>
        ) : null}
      </main>
    </div>
  );
}
