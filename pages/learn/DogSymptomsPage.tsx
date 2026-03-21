import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { Button } from '@/components/ui/button';
import { ArrowRight, PawPrint, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function DogSymptomsPage() {
  useEffect(() => {
    document.title = 'My Dog Is Vomiting, Not Eating, or Lethargic: When To Worry | Nuzzle Health';
    const desc = document.querySelector('meta[name="description"]');
    const content = 'Your dog is vomiting, not eating, lethargic, or shaking — is it an emergency or wait-and-see? A plain-English guide to the most common dog symptoms and when to call your vet.';
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
            <PawPrint className="h-3 w-3" /> Dog Symptom Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-heading text-foreground leading-tight">
            My Dog Is Vomiting, Not Eating, or Lethargic — When Should I Worry?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The hardest part of being a dog owner is not knowing when something is serious. Here's a plain-English breakdown of the most common symptoms — what's usually fine, what needs a vet visit, and what's an emergency.
          </p>
        </div>

        {/* Urgency key */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center space-y-1">
            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
            <p className="font-medium text-green-800">Monitor at home</p>
            <p className="text-green-700 text-xs">Usually resolves on its own</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center space-y-1">
            <Clock className="h-4 w-4 text-amber-600 mx-auto" />
            <p className="font-medium text-amber-800">See a vet soon</p>
            <p className="text-amber-700 text-xs">Within 24–48 hours</p>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center space-y-1">
            <AlertTriangle className="h-4 w-4 text-red-600 mx-auto" />
            <p className="font-medium text-red-800">Emergency</p>
            <p className="text-red-700 text-xs">Go to a vet right now</p>
          </div>
        </div>

        {/* Symptom checker CTA */}
        <div className="rounded-2xl bg-sage-light/40 border border-primary/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">Not sure how serious your dog's symptoms are?</p>
            <p className="text-sm text-muted-foreground mt-0.5">Use Nuzzle's free AI symptom checker — describe what you're seeing and get a triage result in under 2 minutes. Free, no account needed.</p>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link to="/triage">
              Check Symptoms Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Table of contents */}
        <nav className="rounded-xl border border-border bg-card p-5 space-y-2">
          <p className="text-sm font-semibold text-foreground mb-3">Jump to a symptom</p>
          {[
            ['#vomiting', 'My dog is vomiting'],
            ['#not-eating', 'My dog is not eating'],
            ['#diarrhea', 'My dog has diarrhea'],
            ['#lethargic', 'My dog is lethargic / low energy'],
            ['#shaking', 'My dog is shaking or trembling'],
            ['#drinking-a-lot', 'My dog is drinking a lot of water'],
            ['#limping', 'My dog is limping'],
            ['#breathing', 'My dog is breathing fast or hard'],
            ['#emergency', 'Symptoms that are always an emergency'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="flex items-center gap-2 text-sm text-primary hover:underline">
              <span className="text-muted-foreground">→</span> {label}
            </a>
          ))}
        </nav>

        <hr className="border-border" />

        {/* Vomiting */}
        <section id="vomiting" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Vomiting</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vomiting is one of the most common reasons dogs go to the vet — and also one of the most common things that resolves completely on its own. The key is knowing which situation you're in.
          </p>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <p className="font-semibold text-green-800 text-sm">Usually monitor at home if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-1 ml-6">
              <li>Vomited once or twice, then seems fine and alert</li>
              <li>Ate grass and vomited (very common, usually harmless)</li>
              <li>Vomit is yellow or foamy bile in the morning (empty stomach nausea)</li>
              <li>No other symptoms — eating, drinking, normal energy</li>
            </ul>
            <p className="text-sm text-green-700 mt-2">Withhold food for a few hours, offer small amounts of water, then bland food (plain boiled chicken and rice). If they keep it down, you're likely fine.</p>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="font-semibold text-amber-800 text-sm">See a vet within 24 hours if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-6">
              <li>Vomiting multiple times in a day</li>
              <li>Not eating alongside the vomiting</li>
              <li>Acting lethargic or in pain</li>
              <li>Vomiting and also has diarrhea</li>
              <li>Puppy that isn't fully vaccinated (parvovirus risk)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-800 text-sm">Go to an emergency vet immediately if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 ml-6">
              <li>Retching without producing anything + distended belly — this is GDV (bloat), a life-threatening emergency in large breeds</li>
              <li>Blood in the vomit</li>
              <li>You suspect they ate something toxic (xylitol, chocolate, grapes, medications)</li>
              <li>Collapsed or extremely weak alongside vomiting</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Not eating */}
        <section id="not-eating" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Not Eating</h2>
          <p className="text-muted-foreground leading-relaxed">
            Dogs skip meals for all kinds of reasons — stress, a recent vaccine, a change in routine, or just being picky. But a dog that refuses to eat for more than 24–48 hours is telling you something.
          </p>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <p className="font-semibold text-green-800 text-sm">Usually okay to monitor if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-1 ml-6">
              <li>Skipped one meal but acting completely normal</li>
              <li>Recent changes in routine, new home, or new pet in the house</li>
              <li>Had a vaccine in the last 24 hours (mild appetite loss is normal)</li>
              <li>Hot weather (dogs naturally eat less in heat)</li>
              <li>Female dog in heat (hormonal appetite changes)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="font-semibold text-amber-800 text-sm">See a vet within 24–48 hours if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-6">
              <li>Not eaten for more than 24 hours (48 hours if they seem otherwise okay)</li>
              <li>Drinking much more or less water than usual</li>
              <li>Weight loss you can feel — ribs more prominent than before</li>
              <li>Drooling excessively or pawing at the mouth (dental pain, foreign object)</li>
            </ul>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-800 text-sm">Go to a vet urgently if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 ml-6">
              <li>Not eating AND vomiting, lethargic, or in obvious pain</li>
              <li>Intact female dog not eating + drinking more + vaginal discharge (pyometra — life threatening)</li>
              <li>Puppy not eating for more than 12 hours (toy breeds can develop dangerous hypoglycemia quickly)</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Diarrhea */}
        <section id="diarrhea" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Has Diarrhea</h2>
          <p className="text-muted-foreground leading-relaxed">
            Like vomiting, diarrhea is extremely common and usually resolves quickly. The type of diarrhea actually tells you a lot about where in the gut the problem is.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
              <p className="font-semibold text-foreground text-sm">Small intestine diarrhea</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Large volumes at a time</li>
                <li>No straining or urgency</li>
                <li>Possible weight loss</li>
                <li>Dark or tarry (digested blood)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">Points to: dietary indiscretion, Giardia, parvovirus, IBD</p>
            </div>
            <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
              <p className="font-semibold text-foreground text-sm">Large intestine (colitis)</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Small, frequent amounts</li>
                <li>Urgency and straining</li>
                <li>Mucus or bright red blood</li>
                <li>May go outside many times</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">Points to: colitis, stress, dietary change, parasites</p>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <p className="font-semibold text-green-800 text-sm">Usually monitor at home if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-1 ml-6">
              <li>Soft stool but formed, one or two episodes</li>
              <li>Ate something unusual recently (garbage, grass, new food)</li>
              <li>Still acting normal, drinking, and eating</li>
            </ul>
            <p className="text-sm text-green-700 mt-2">Bland diet for 2–3 days (boiled chicken and rice), probiotics (Fortiflora), make sure they stay hydrated.</p>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-800 text-sm">Go to a vet urgently if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 ml-6">
              <li>Bloody diarrhea AND vomiting together — this can be AHDS (hemorrhagic gastroenteritis), which requires IV fluids</li>
              <li>Puppy with watery, bloody diarrhea — parvovirus emergency</li>
              <li>Signs of dehydration: gums dry or sticky, skin doesn't spring back when pinched</li>
              <li>Diarrhea lasting more than 3 days</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Lethargic */}
        <section id="lethargic" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Lethargic or Low Energy</h2>
          <p className="text-muted-foreground leading-relaxed">
            A dog that's less energetic than usual is one of the vaguest — and most important — symptoms to pay attention to. Dogs are masters at hiding pain and illness. Lethargy is often their body's only outward signal that something is wrong.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One low-energy day after a lot of exercise or heat is normal. Lethargy that persists, or comes alongside other symptoms, is not.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="font-semibold text-amber-800 text-sm">See a vet if lethargy is combined with any of:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-6">
              <li>Not eating for more than 24 hours</li>
              <li>Vomiting or diarrhea</li>
              <li>Pale, white, or bluish gums (this is an emergency — go now)</li>
              <li>Difficulty breathing</li>
              <li>Distended abdomen</li>
              <li>Weakness in the back legs</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Common causes of sudden lethargy in dogs:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Infection (urinary, respiratory, skin)</li>
              <li>Pain from injury or arthritis flare</li>
              <li>Anemia (pale gums are a key sign)</li>
              <li>Hypothyroidism — especially in middle-aged Goldens, Labradors, Dobermans</li>
              <li>Heart disease</li>
              <li>Toxin ingestion</li>
              <li>Side effects from a new medication</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Shaking */}
        <section id="shaking" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Shaking or Trembling</h2>
          <p className="text-muted-foreground leading-relaxed">
            Shaking has a wide range of causes from completely harmless to life-threatening. The first thing to determine is whether your dog is shaking from a known emotional cause (cold, fear, excitement) or whether it came on suddenly with no obvious trigger.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
              <p className="font-semibold text-green-800 text-sm">Usually benign</p>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li>Cold — especially small and short-coated breeds</li>
                <li>Fear or anxiety (thunderstorms, fireworks, vet visits)</li>
                <li>Excitement</li>
                <li>Old age muscle tremors (older dogs often shake when standing)</li>
              </ul>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
              <p className="font-semibold text-red-800 text-sm">Go to a vet immediately</p>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Sudden shaking with no obvious cause</li>
                <li>Shaking + vomiting + lethargy (possible toxin)</li>
                <li>Shaking that progresses into convulsions</li>
                <li>Shaking + pale gums</li>
                <li>Possible toxin ingestion in the last few hours</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm text-foreground">
            <span className="font-medium">Know the difference between shaking and seizures.</span> Shaking: your dog is conscious, aware of you, can walk. Seizures: loss of consciousness or awareness, paddling limbs, jaw clamping, loss of bladder/bowel control. Seizures require emergency care.
          </div>
        </section>

        <hr className="border-border" />

        {/* Drinking a lot */}
        <section id="drinking-a-lot" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Drinking a Lot of Water</h2>
          <p className="text-muted-foreground leading-relaxed">
            Excessive thirst (polydipsia) almost always comes with excessive urination (polyuria). If your dog is suddenly drinking much more than usual and going outside more frequently, it's worth getting bloodwork and urine checked — this combo has a specific list of causes and almost none of them resolve on their own.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Most common causes of increased thirst in dogs:</p>
            <div className="space-y-2">
              {[
                { cause: "Diabetes mellitus", detail: "High blood glucose spills into urine, pulling water with it. Look for increased appetite alongside the thirst." },
                { cause: "Cushing's disease", detail: "Excess cortisol causes PU/PD along with a pot-belly, muscle loss, and hair thinning. Seen in Poodles, Dachshunds, Boxers." },
                { cause: "Kidney disease", detail: "Damaged kidneys can't concentrate urine, so the dog drinks more to compensate." },
                { cause: "Pyometra", detail: "In intact females, a uterine infection causes increased thirst. If your unspayed dog is also off her food and has a distended belly — emergency." },
                { cause: "Medications", detail: "Steroids (prednisone) almost always cause increased thirst and urination. Very common and expected." },
              ].map(({ cause, detail }) => (
                <div key={cause} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-medium text-foreground">{cause}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Limping */}
        <section id="limping" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Limping</h2>
          <p className="text-muted-foreground leading-relaxed">
            A sudden limp after vigorous play is often just a minor sprain — rest for 24–48 hours and most resolve. But limping has a wide range of causes, and a few of them are serious.
          </p>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
              <p className="font-semibold text-green-800 text-sm">Usually monitor 24–48 hours if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-1 ml-6">
              <li>Mild limp, still putting some weight on the leg</li>
              <li>Started after running or jumping</li>
              <li>No swelling, no obvious pain when you gently feel the leg</li>
              <li>Eating, drinking, and energy are normal</li>
            </ul>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="font-semibold text-amber-800 text-sm">See a vet within 24 hours if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-6">
              <li>Completely non-weight-bearing (holding leg up entirely)</li>
              <li>Visible swelling, heat, or a wound on the leg</li>
              <li>Limp came on gradually and has been going on for weeks</li>
              <li>Large breed dog over 5 years — bone pain in older large dogs can be osteosarcoma</li>
            </ul>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-800 text-sm">Emergency if:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 ml-6">
              <li>Leg is at an abnormal angle (fracture)</li>
              <li>Sudden paralysis or weakness in back legs, especially in Dachshunds — this is a disc herniation (IVDD) and is time-sensitive</li>
              <li>Dragging rear legs after a trauma</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Breathing */}
        <section id="breathing" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">My Dog Is Breathing Fast or Having Trouble Breathing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Heavy breathing after exercise or in heat is normal. Heavy breathing at rest, or any sign of labored breathing, is not — and tends to escalate quickly. When in doubt, this is one where you err on the side of going to the vet.
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <p className="font-semibold text-red-800 text-sm">Go to an emergency vet immediately if you see:</p>
            </div>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 ml-6">
              <li>Breathing with mouth open at rest (especially in cats — always abnormal)</li>
              <li>Blue, grey, or white gums (not getting enough oxygen)</li>
              <li>Neck extended, elbows out, clearly working to breathe</li>
              <li>Breathing fast while sleeping or resting</li>
              <li>Sudden respiratory distress in a Bulldog, French Bulldog, or Pug — their airways are already compromised</li>
            </ul>
          </div>
        </section>

        <hr className="border-border" />

        {/* Always emergency */}
        <section id="emergency" className="space-y-5">
          <h2 className="text-2xl font-heading text-foreground">Symptoms That Are Always an Emergency — Don't Wait</h2>
          <p className="text-muted-foreground leading-relaxed">
            Regardless of how your dog is otherwise acting, these symptoms always warrant an immediate vet visit:
          </p>

          <div className="rounded-lg bg-red-50 border border-red-200 p-5 space-y-3">
            {[
              "Retching without producing vomit + distended belly — GDV (bloat), can be fatal within hours",
              "Pale, white, blue, or grey gums — oxygen or circulation failure",
              "Seizure lasting more than 2 minutes, or multiple seizures in one day",
              "Collapse or sudden inability to stand",
              "Suspected poisoning — xylitol, grapes/raisins, chocolate (large amounts), rodenticide, human medications",
              "Any trauma — hit by a car, fall from height, dog attack (internal injuries may not be visible)",
              "Unable to urinate or straining with nothing coming out — urinary obstruction",
              "Sudden hind leg paralysis, especially in Dachshunds and Corgis",
              "Eye that is suddenly cloudy, red, or bulging",
            ].map((symptom) => (
              <div key={symptom} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800">{symptom}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        <div className="rounded-2xl bg-sage-light/40 border border-primary/20 p-6 space-y-3">
          <p className="font-semibold text-foreground">Still not sure if your dog needs to go in?</p>
          <p className="text-sm text-muted-foreground">Nuzzle's free symptom checker walks you through your dog's specific symptoms and gives you a triage recommendation — emergency, vet visit, or monitor at home. Takes 2 minutes. No account required.</p>
          <Button asChild className="gap-2">
            <Link to="/triage">
              Use the Free Symptom Checker <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center space-y-4">
          <PawPrint className="h-8 w-8 mx-auto opacity-80" />
          <h2 className="text-xl font-heading">Track your dog's health over time — for free</h2>
          <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
            Create a free Nuzzle account to track symptoms, upload bloodwork, and get AI-powered health insights for your dog. Catch problems earlier, worry less.
          </p>
          <Button asChild variant="secondary" size="lg" className="gap-2 mt-2">
            <Link to="/dashboard">
              Get My Dog's Free Health Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Related */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Related guides</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/learn/dog-bloodwork-explained" className="text-sm text-primary hover:underline border border-primary/20 rounded-full px-3 py-1">
              🔬 Dog Bloodwork Explained
            </Link>
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
