import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, PawPrint } from 'lucide-react';

export default function DogBloodworkPage() {
  useEffect(() => {
    document.title = 'Dog Bloodwork Explained: What Every Result Means | Nuzzle Health';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'A plain-English guide to your dog\'s blood test results. Understand CBC, chemistry panel, ALT, BUN, creatinine, SDMA, and more — and what to do when values are abnormal.';
    if (desc) {
      desc.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = content;
      document.head.appendChild(meta);
    }
    return () => {
      document.title = 'Nuzzle Health – Preventative Pet Health';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16 max-w-4xl mx-auto px-4">
          <Link to="/"><NuzzleLogo size="sm" /></Link>
          <Button asChild size="sm" className="gap-2">
            <Link to="/triage">
              <PawPrint className="h-3.5 w-3.5" />
              Free Symptom Checker
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-12 space-y-10">

        {/* Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-sage-light/60 text-primary text-xs font-medium px-3 py-1 rounded-full">
            <PawPrint className="h-3 w-3" /> Dog Health Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-heading text-foreground leading-tight">
            Dog Bloodwork Explained: What Every Result Actually Means
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your vet just handed you a page of numbers and abbreviations. Here's what they all mean — in plain English — and what to do if something looks off.
          </p>
        </div>

        {/* CTA box */}
        <div className="rounded-2xl bg-sage-light/40 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">Have your dog's results in front of you?</p>
            <p className="text-sm text-muted-foreground mt-0.5">Upload the lab report and get a free AI-powered plain-English breakdown — flagged values, what they mean, and what to ask your vet.</p>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link to="/dashboard">
              Analyze My Dog's Results <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Table of contents */}
        <nav className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="text-sm font-semibold text-foreground mb-3">In this guide</p>
          {[
            ['#cbc', 'Complete Blood Count (CBC)'],
            ['#wbc', 'White Blood Cells (WBC)'],
            ['#rbc', 'Red Blood Cells, Hemoglobin & HCT'],
            ['#platelets', 'Platelets'],
            ['#chemistry', 'Chemistry Panel Overview'],
            ['#alt-alp', 'Liver Values: ALT & ALP'],
            ['#bun-creatinine', 'Kidney Values: BUN & Creatinine'],
            ['#sdma', 'SDMA — The Early Kidney Warning Sign'],
            ['#glucose', 'Glucose'],
            ['#albumin', 'Albumin & Total Protein'],
            ['#thyroid', 'Thyroid (T4)'],
            ['#abnormal', 'What To Do When Values Are Abnormal'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <span className="text-muted-foreground">→</span> {label}
            </a>
          ))}
        </nav>

        <hr className="border-border" />

        {/* CBC Section */}
        <section id="cbc" className="space-y-4">
          <h2 className="text-2xl font-heading text-foreground">Complete Blood Count (CBC)</h2>
          <p className="text-muted-foreground leading-relaxed">
            The CBC measures the cells circulating in your dog's blood — white blood cells, red blood cells, and platelets. It's one of the first tests vets run because it gives a broad picture of immune function, oxygen delivery, and clotting ability all at once.
          </p>
        </section>

        {/* WBC */}
        <section id="wbc" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">White Blood Cells (WBC)</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm">
            <span className="font-medium">Normal range in dogs:</span> <span className="text-muted-foreground">5,500–16,900 cells/μL</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            White blood cells are your dog's immune army. A high WBC (leukocytosis) usually means the body is fighting something — infection, inflammation, or stress. A low WBC (leukopenia) is more concerning and can mean bone marrow problems or a serious viral infection like parvovirus.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Common reasons for high WBC:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Bacterial infection anywhere in the body</li>
              <li>Inflammation (injury, pancreatitis, autoimmune)</li>
              <li>Stress or excitement (a "stress leukogram" — often harmless)</li>
              <li>Steroid medications</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Common reasons for low WBC:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Parvovirus (especially in puppies — requires emergency care)</li>
              <li>Sepsis or overwhelming infection</li>
              <li>Bone marrow suppression from chemotherapy or certain medications</li>
            </ul>
          </div>
        </section>

        {/* RBC */}
        <section id="rbc" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Red Blood Cells, Hemoglobin & Hematocrit (HCT)</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm space-y-1">
            <div><span className="font-medium">RBC:</span> <span className="text-muted-foreground">5.5–8.5 million/μL</span></div>
            <div><span className="font-medium">Hematocrit (HCT):</span> <span className="text-muted-foreground">37–55%</span></div>
            <div><span className="font-medium">Hemoglobin:</span> <span className="text-muted-foreground">12–18 g/dL</span></div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            These three values all measure essentially the same thing: how well your dog's blood is carrying oxygen. Low values mean anemia — your dog isn't getting enough oxygen to their tissues. This is why anemic dogs are tired, pale around the gums, and have reduced stamina.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Anemia isn't a diagnosis by itself — it's a symptom of something else. Your vet will look at whether it's "regenerative" (the body is making new red cells to compensate, meaning bleeding or destruction) or "non-regenerative" (the body has stopped producing them, meaning bone marrow or chronic disease problems).
          </p>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <span className="font-medium">Note for Greyhound owners:</span> Greyhounds and other sighthounds normally run HCT values of 50–65% — what would look like polycythemia (too many red cells) in other breeds is completely normal for them.
          </div>
        </section>

        {/* Platelets */}
        <section id="platelets" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Platelets</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm">
            <span className="font-medium">Normal range in dogs:</span> <span className="text-muted-foreground">200,000–500,000/μL</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Platelets are tiny cell fragments that help blood clot. Low platelets (thrombocytopenia) means your dog could bleed more easily than normal — you might notice unusual bruising, small red spots on the skin, or bleeding that won't stop from minor cuts.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Below 50,000 is considered a significant bleeding risk. The most common causes in dogs are immune-mediated thrombocytopenia (ITP — the immune system attacking its own platelets), tick-borne diseases like Ehrlichia and Anaplasma, and certain medications.
          </p>
          <p className="text-sm text-muted-foreground italic">
            One important caveat: platelets can artificially clump in the collection tube (especially in certain breeds), making the count look lower than it really is. Your vet can verify with a blood smear.
          </p>
        </section>

        <hr className="border-border" />

        {/* Chemistry Panel */}
        <section id="chemistry" className="space-y-4">
          <h2 className="text-2xl font-heading text-foreground">Chemistry Panel (Blood Chemistry / Metabolic Panel)</h2>
          <p className="text-muted-foreground leading-relaxed">
            The chemistry panel measures what's dissolved in the liquid part of your dog's blood — enzymes, proteins, waste products, and electrolytes. It tells your vet how well your dog's liver, kidneys, and pancreas are functioning, and whether blood sugar and protein levels are where they should be.
          </p>
        </section>

        {/* ALT / ALP */}
        <section id="alt-alp" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Liver Values: ALT & ALP</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm space-y-1">
            <div><span className="font-medium">ALT (normal in dogs):</span> <span className="text-muted-foreground">12–118 U/L</span></div>
            <div><span className="font-medium">ALP (normal in dogs):</span> <span className="text-muted-foreground">5–131 U/L</span></div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            ALT (alanine aminotransferase) is the most liver-specific value on the panel. It's released when liver cells are damaged or dying. A mild elevation (1–3x normal) is common and often caused by something minor like anti-inflammatory medications or a fatty meal. A severe elevation (10x or more) points to acute liver injury and needs prompt attention.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            ALP (alkaline phosphatase) is a bit less specific — it can come from the liver, bones, or intestines. In dogs, a markedly elevated ALP alongside a normal ALT is a classic pattern for Cushing's disease (hyperadrenocorticism) or steroid use. Both together elevated usually points to liver disease or cholestasis (bile flow problems).
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Common causes of high ALT in dogs:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>NSAIDs (carprofen, meloxicam) or other medications</li>
              <li>Pancreatitis</li>
              <li>Hepatitis or liver infection</li>
              <li>Xylitol or acetaminophen toxicity (emergency if suspected)</li>
              <li>Cushing's disease (usually ALP is higher than ALT)</li>
            </ul>
          </div>
        </section>

        {/* BUN / Creatinine */}
        <section id="bun-creatinine" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Kidney Values: BUN & Creatinine</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm space-y-1">
            <div><span className="font-medium">BUN (normal in dogs):</span> <span className="text-muted-foreground">7–27 mg/dL</span></div>
            <div><span className="font-medium">Creatinine (normal in dogs):</span> <span className="text-muted-foreground">0.5–1.8 mg/dL</span></div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            BUN (blood urea nitrogen) and creatinine are waste products that healthy kidneys filter out of the blood. When kidney function declines, these build up. Elevated BUN and creatinine together is a strong indicator of kidney disease — but by the time these values rise, your dog has already lost more than 75% of kidney function.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Not all elevated BUN/creatinine means kidney disease. "Pre-renal" causes (dehydration, not enough blood flow to the kidneys) can elevate these values temporarily and resolve with fluids. Your vet will check urine concentration alongside these values — a dilute urine with high BUN/creatinine is more worrying than concentrated urine.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">BUN/Creatinine interpretation quick guide:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li><span className="font-medium text-foreground">High BUN, normal creatinine:</span> often dehydration or high-protein diet</li>
              <li><span className="font-medium text-foreground">Both elevated + dilute urine:</span> kidney disease likely</li>
              <li><span className="font-medium text-foreground">Both elevated + concentrated urine:</span> pre-renal (dehydration, blood loss)</li>
              <li><span className="font-medium text-foreground">Low BUN:</span> liver disease or portosystemic shunt</li>
            </ul>
          </div>
        </section>

        {/* SDMA */}
        <section id="sdma" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">SDMA — The Early Kidney Warning Sign Most People Haven't Heard Of</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm">
            <span className="font-medium">Normal in dogs and cats:</span> <span className="text-muted-foreground">&lt;14 μg/dL</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            SDMA (symmetric dimethylarginine) is a newer kidney marker that's now included on most standard panels. Here's why it matters: BUN and creatinine don't rise until your dog has lost 75% of kidney function. SDMA rises when only 25–40% of function is lost — which means you have a much bigger window to intervene.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If your dog's SDMA is elevated but BUN and creatinine are still normal, your vet will likely want to recheck in 2–4 weeks. It may represent early chronic kidney disease (CKD) — catching it at this stage lets you make dietary and management changes that can slow progression significantly.
          </p>
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-foreground">
            <span className="font-medium">Unlike creatinine, SDMA isn't affected by muscle mass</span> — so it's a more reliable marker in lean or muscle-wasted dogs where creatinine might look falsely normal.
          </div>
        </section>

        {/* Glucose */}
        <section id="glucose" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Glucose (Blood Sugar)</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm">
            <span className="font-medium">Normal in dogs:</span> <span className="text-muted-foreground">74–143 mg/dL</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            High blood glucose (hyperglycemia) is the hallmark of diabetes mellitus in dogs. A fasting glucose above 200 mg/dL with glucose in the urine strongly suggests diabetes. Other causes include Cushing's disease, pancreatitis, and stress.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Low blood glucose (hypoglycemia, below 60 mg/dL) is less common but more immediately dangerous. In adult dogs it can point to an insulinoma (insulin-secreting tumor), Addison's disease, or liver failure. In toy breed puppies, juvenile hypoglycemia is common and can cause seizures — it's treated by rubbing a small amount of corn syrup on the gums and getting to a vet immediately.
          </p>
        </section>

        {/* Albumin */}
        <section id="albumin" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Albumin & Total Protein</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm space-y-1">
            <div><span className="font-medium">Albumin (normal in dogs):</span> <span className="text-muted-foreground">2.5–4.4 g/dL</span></div>
            <div><span className="font-medium">Total Protein (normal in dogs):</span> <span className="text-muted-foreground">5.2–8.2 g/dL</span></div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Albumin is the main protein in blood. It keeps fluid inside blood vessels — so when albumin drops too low (below about 1.5 g/dL), fluid leaks out into body cavities, causing swollen legs, a distended belly, or fluid around the lungs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Low albumin usually means one of three things: protein-losing enteropathy (PLE — the gut isn't absorbing protein properly), protein-losing nephropathy (PLN — the kidneys are leaking protein into urine), or liver failure (the liver makes albumin, so a failing liver makes less of it).
          </p>
        </section>

        {/* Thyroid */}
        <section id="thyroid" className="space-y-4">
          <h2 className="text-xl font-heading text-foreground">Thyroid (T4)</h2>
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm">
            <span className="font-medium">Normal T4 in dogs:</span> <span className="text-muted-foreground">1.0–4.0 μg/dL</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Dogs, unlike cats, almost always have <span className="font-medium">hypo</span>thyroidism (low thyroid) rather than hyperthyroidism. The classic signs are weight gain without a change in diet, lethargy, hair loss on the body (especially the tail — "rat tail"), cold intolerance, and thickened or darkened skin.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Breeds particularly prone to hypothyroidism include Golden Retrievers, Doberman Pinschers, Boxers, and Cocker Spaniels. It's very manageable — daily levothyroxine (the same medication humans take) brings most dogs back to normal within 4–8 weeks.
          </p>
        </section>

        <hr className="border-border" />

        {/* What to do */}
        <section id="abnormal" className="space-y-4">
          <h2 className="text-2xl font-heading text-foreground">What To Do When Values Are Abnormal</h2>
          <p className="text-muted-foreground leading-relaxed">
            A single abnormal value on its own is rarely the full story. Vets look at the entire panel together — the pattern matters more than any individual number. Here's a general guide:
          </p>
          <div className="space-y-3">
            {[
              { level: 'Mildly out of range (1–2x normal)', color: 'bg-blue-50 border-blue-200 text-blue-900', advice: 'Usually warrants monitoring. Your vet may recommend rechecking in 2–4 weeks or adjusting medications. Don\'t panic — many mild elevations resolve on their own.' },
              { level: 'Moderately out of range (2–5x normal)', color: 'bg-amber-50 border-amber-200 text-amber-900', advice: 'Worth investigating further. Your vet will likely recommend additional tests (urinalysis, ultrasound, or specific disease tests) to find the underlying cause.' },
              { level: 'Severely out of range (>5x normal or critically low)', color: 'bg-red-50 border-red-200 text-red-900', advice: 'Needs prompt attention. This level of abnormality usually indicates an active disease process that needs treatment sooner rather than later.' },
            ].map(({ level, color, advice }) => (
              <div key={level} className={`rounded-lg border px-4 py-3 text-sm ${color}`}>
                <p className="font-semibold mb-1">{level}</p>
                <p>{advice}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center space-y-4">
          <PawPrint className="h-8 w-8 mx-auto opacity-80" />
          <h2 className="text-xl font-heading">Get a free AI analysis of your dog's actual results</h2>
          <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
            Upload your dog's lab report to Nuzzle and get every value explained in plain English — what's normal, what's flagged, and specific questions to ask your vet.
          </p>
          <Button asChild variant="secondary" size="lg" className="gap-2 mt-2">
            <Link to="/dashboard">
              Analyze My Dog's Bloodwork — It's Free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Related */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Related guides</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/triage" className="text-sm text-primary hover:underline border border-primary/20 rounded-full px-3 py-1">
              🐾 Free Symptom Checker
            </Link>
            <Link to="/how-it-works" className="text-sm text-primary hover:underline border border-primary/20 rounded-full px-3 py-1">
              How Nuzzle Works
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container max-w-3xl mx-auto px-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2025 Nuzzle Health. This guide is for informational purposes only and does not replace veterinary advice.</p>
          <Link to="/"><NuzzleLogo size="sm" /></Link>
        </div>
      </footer>
    </div>
  );
}
