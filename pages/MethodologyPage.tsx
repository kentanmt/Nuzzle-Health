import { NuzzleLogo } from '@/components/NuzzleLogo';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Database, Brain, Shield, FlaskConical, Scale, Stethoscope } from 'lucide-react';

const sources = [
  { name: 'AKC Breed Standards', url: 'https://www.akc.org/dog-breeds/', desc: 'Official breed weight ranges, size classification, and group categorization for all recognized dog breeds.' },
  { name: 'UFAW Genetic Welfare Problems', url: 'https://www.ufaw.org.uk/genetic-welfare-problems/genetic-welfare-problems', desc: 'Peer-reviewed database of inherited diseases and predispositions by breed, maintained by the Universities Federation for Animal Welfare.' },
  { name: 'Banfield State of Pet Health Report', url: 'https://www.banfield.com/state-of-pet-health', desc: 'Longitudinal study covering 2.5M+ dogs and 500K+ cats annually. Used for lifespan data, disease prevalence, and senior age thresholds.' },
  { name: 'AAHA Life Stage Guidelines (2019)', url: 'https://www.aaha.org/resources/life-stage-guidelines/', desc: 'American Animal Hospital Association guidelines defining puppy, adult, mature, senior, and geriatric life stages by size class.' },
  { name: 'Merck Veterinary Manual', url: 'https://www.merckvetmanual.com/', desc: 'Reference for breed-specific disease prevalence, biomarker reference ranges, and clinical significance of lab values.' },
  { name: 'TICA / CFA Breed Profiles', url: 'https://tica.org/breeds/browse-all-breeds', desc: 'Cat breed standards including weight ranges, body type, and breed-specific health considerations.' },
  { name: 'OFA Health Testing Database', url: 'https://ofa.org/', desc: 'Orthopedic Foundation for Animals — breed health testing requirements and genetic screening recommendations.' },
];

const scoringRules = [
  {
    icon: FlaskConical,
    title: 'Bloodwork Score (0–100)',
    rules: [
      'Each biomarker is compared against its reference range',
      'In-range markers: 90–100 baseline',
      'BUN below range: -5 (mild kidney concern)',
      'SDMA or Creatinine elevated: -10 to -20 (kidney)',
      'ALT/ALP elevated: -10 to -15 (liver)',
      'Breed predispositions increase weighting for related markers (e.g., Cavalier + cardiac markers)',
    ],
  },
  {
    icon: Scale,
    title: 'Weight Score (0–100)',
    rules: [
      'Current weight compared to breed-specific ideal range from AKC/CFA standards',
      'Weight trend analysis: direction, magnitude, and rate of change',
      'Within breed range + stable: 90–95',
      'Outside breed range: 70–80',
      '>10% change over measurement period: 60–75',
      'Single measurement without history: assessed against breed standard only',
    ],
  },
  {
    icon: Shield,
    title: 'Preventive Care Score (0–100)',
    rules: [
      'Vaccination statuses are pre-calculated using local date math (not UTC) to prevent timezone errors',
      'Vaccines deduplicated by normalized name — only the most recent administration per type is considered',
      'All current: 90–100',
      'Each overdue vaccine: -10 to -15',
      'Due within 30 days: -3 to -5',
      'Breed-specific screening gaps (e.g., missing HCM echo for Maine Coons) factor into score',
    ],
  },
  {
    icon: Stethoscope,
    title: 'Age & Conditions Score (0–100)',
    rules: [
      'Senior age threshold is breed-specific (not generic 7yr for dogs / 10yr for cats)',
      'Giant breeds: senior at 5–6 yrs. Toy breeds: senior at 10+ yrs',
      'Each chronic condition: -10 to -20 based on severity and management',
      'Breed predispositions matching existing conditions: additional weighting',
      'Well-managed conditions with stable markers: reduced penalty',
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <NuzzleLogo size="sm" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Methodology & Sources
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl mx-auto space-y-10">
        {/* Hero */}
        <div className="space-y-3">
          <h1 className="font-heading text-3xl text-foreground">How Nuzzle Scores Your Pet's Health</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Nuzzle uses AI-powered analysis combined with veterinary reference data and breed-specific benchmarks 
            to generate personalized health scores and actionable insights. Here's exactly how it works and where 
            the data comes from.
          </p>
        </div>

        {/* AI Architecture */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl text-foreground">AI Analysis Architecture</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Health Score Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uses Google Gemini 2.5 Flash to analyze the complete pet health profile — lab biomarkers, 
                  weight history, vaccination status, breed predispositions, and existing conditions — in a single 
                  pass. Returns a structured score with per-dimension breakdowns and reasoning labels.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Symptom Triage</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uses Google Gemini 3 Flash Preview for real-time symptom assessment. Incorporates breed-specific 
                  predispositions to weight certain conditions higher (e.g., GDV risk for Great Danes presenting 
                  with bloating). Follows veterinary triage protocols with 5-level urgency classification.
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <h3 className="font-semibold text-sm text-foreground mb-2">Data Pipeline</h3>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>PDF lab reports uploaded → parsed by AI (Gemini 2.5 Flash) into structured biomarkers, vaccinations, and care recommendations</li>
                <li>Vaccinations deduplicated by normalized name, statuses recalculated against current date using local timezone math</li>
                <li>Breed benchmark data looked up from curated dataset of 30+ dog and 12+ cat breeds</li>
                <li>Weight trend analysis computed: direction, magnitude (lbs and %), and trajectory over all measurements</li>
                <li>Complete context (pet profile + labs + breed data + weight trends + conditions) sent to health AI in a single prompt</li>
                <li>AI returns structured JSON with scores, breakdowns, reasoning labels, and actionable insights</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Scoring Rules */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-foreground">Scoring Methodology</h2>
          <p className="text-sm text-muted-foreground">
            The overall health score (0–100) is computed from four weighted dimensions. Each dimension uses 
            breed-specific benchmarks when available.
          </p>
          <div className="grid gap-4">
            {scoringRules.map(({ icon: Icon, title, rules }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {rules.map((rule, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Breed Benchmarks */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl text-foreground">Breed Benchmark Dataset</h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nuzzle maintains a curated dataset covering <strong>30+ dog breeds</strong> and <strong>12+ cat breeds</strong> (including 
              mixed breeds) with the following data points per breed:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Ideal Weight Range', desc: 'Min–max in lbs, sourced from AKC/CFA breed standards' },
                { label: 'Size Classification', desc: 'Toy, Small, Medium, Large, Giant — affects senior age threshold' },
                { label: 'Senior Age Threshold', desc: 'Breed-specific age when senior care protocols begin (AAHA guidelines)' },
                { label: 'Life Expectancy', desc: 'Min–max years from Banfield longitudinal studies' },
                { label: 'Genetic Predispositions', desc: 'Inherited conditions from UFAW, OFA, and Merck databases' },
                { label: 'Screening Recommendations', desc: 'Age-appropriate tests specific to breed risks' },
              ].map(({ label, desc }) => (
                <div key={label} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              When a breed isn't found in the dataset, fuzzy matching is attempted. If no match is found, 
              species-level defaults (Mixed Breed for dogs, Domestic Shorthair for cats) are used.
            </p>
          </div>
        </section>

        {/* Data Sources */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-foreground">Data Sources & References</h2>
          <div className="space-y-3">
            {sources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{source.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{source.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 flex-shrink-0">↗ External</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="rounded-2xl border border-score-watch/30 bg-terracotta-light/20 p-6 space-y-2">
          <h2 className="font-heading text-lg text-foreground">Important Disclaimer</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nuzzle provides health monitoring and triage tools for informational purposes only. It is <strong>not a substitute 
            for professional veterinary diagnosis or treatment</strong>. Health scores and insights are generated by AI using 
            the data you provide and should be discussed with your veterinarian. Always consult a licensed veterinarian 
            for medical decisions regarding your pet's health.
          </p>
          <p className="text-xs text-muted-foreground">
            Breed benchmark data is compiled from publicly available veterinary resources and may not reflect 
            individual variation. AI-generated assessments are probabilistic and should be interpreted alongside 
            clinical judgment.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
          <h2 className="font-heading text-2xl text-foreground">Ready to See Your Pet's Health Score?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Upload your pet's lab results and get AI-powered health insights backed by breed-specific veterinary data.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/waitlist"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 bg-card/50">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <NuzzleLogo size="sm" />
          <p>© {new Date().getFullYear()} Nuzzle Health</p>
        </div>
      </footer>
    </div>
  );
}
