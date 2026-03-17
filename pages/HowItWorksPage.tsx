import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Brain, BarChart3, Shield, Bell, Sparkles, Receipt, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NuzzleLogo } from '@/components/NuzzleLogo';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Share your pet\'s lab results',
    description: 'Upload a PDF, snap a photo, or forward your vet\'s email. Our AI reads and parses everything automatically — no manual data entry.',
    detail: 'We support lab reports, vaccine records, and vet visit notes from any clinic or reference lab.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI analyzes every marker',
    description: 'Each biomarker is compared against breed-specific, age-adjusted reference ranges. We don\'t just check if values are "in range" — we track how they\'re moving over time.',
    detail: 'A marker creeping upward, even within normal, gets flagged before it becomes a problem.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'You get a living Health Score',
    description: 'Everything rolls up into a 0–100 Health Score combining bloodwork, weight, preventive care, and age benchmarks. Broken down by category so you see exactly where to focus.',
    detail: 'The score updates every time new data comes in — building a longitudinal picture of your pet\'s health.',
  },
  {
    number: '04',
    icon: Sparkles,
    title: 'Personalized insights, plain English',
    description: 'No medical jargon. We generate clear, actionable recommendations based on your pet\'s unique profile — breed, age, history, and trends.',
    detail: 'Examples: "Bella\'s kidney markers are trending up 12% — consider retesting in 6 months" or "Weight is 5% above breed ideal."',
  },
  {
    number: '05',
    icon: Bell,
    title: 'Ongoing monitoring & alerts',
    description: 'We watch for shifts between vet visits — markers trending the wrong direction, vaccines coming due, or new risks emerging for your pet\'s breed and age.',
    detail: 'Think of it as a health co-pilot that never forgets and always watches for early warning signs.',
  },
  {
    number: '06',
    icon: Shield,
    title: 'Preventive care timeline',
    description: 'A personalized schedule of vaccines, screenings, and checkups based on your pet\'s species, breed, and age. Never miss an important appointment.',
    detail: 'We auto-surface overdue care items and upcoming milestones so nothing falls through the cracks.',
  },
];

const faqs = [
  {
    q: 'Is this a replacement for my vet?',
    a: 'No — Nuzzle is a companion to veterinary care. We help you understand your pet\'s data between visits and catch potential issues early so your vet conversations are more productive.',
  },
  {
    q: 'How do bloodwork credits work?',
    a: 'Get bloodwork done at any vet. Upload the results and receipt through the app. We credit a portion of the cost back to you — no network restrictions, no referrals needed. Pricing details coming soon.',
  },
  {
    q: 'How is the Health Score calculated?',
    a: 'The score combines bloodwork markers (vs breed-specific reference ranges), weight trends, preventive care status, and age-adjusted risk factors. Each category is weighted into a composite 0–100 score.',
  },
  {
    q: 'What happens to my pet\'s data?',
    a: 'Your data is encrypted and stored securely. We never sell or share individual pet data. You own your data and can export or delete it at any time.',
  },
  {
    q: 'Do I need to upload lab results manually?',
    a: 'You can upload a PDF, take a photo, or forward your vet\'s email to a unique inbox we generate for your pet. Direct vet lab integrations are on the roadmap.',
  },
  {
    q: 'What animals do you support?',
    a: 'Currently dogs and cats. We\'re exploring other species for future releases.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link to="/">
            <NuzzleLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">&larr; Home</Button>
            </Link>
            <Link to="/waitlist">
              <Button size="sm">Join Waitlist</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-sage-light/60 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Brain className="h-4 w-4" />
              Behind the scenes
            </div>
            <h1 className="text-4xl md:text-5xl font-heading text-foreground leading-tight">
              Health intelligence for your pet
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
              We turn raw lab results into a living health profile with trend tracking, 
              early warnings, and clear next steps — so you catch problems early, not late.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-8 md:py-16">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-8 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-sage-light flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mt-2 text-center">{step.number}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-heading text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed italic">{step.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credits callout — supporting, not primary */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border-2 border-primary/20 bg-sage-light/40 p-8 md:p-10"
          >
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-heading text-foreground">We help cover the cost of bloodwork</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nuzzle members earn credits toward their pet's bloodwork — at any vet, with no network restrictions. 
                   You get the labs done on your schedule, with your trusted vet. We handle the rest.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 font-medium text-muted-foreground">
                    <Mail className="h-3 w-3" /> Forward results or upload
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3 py-1.5 font-medium text-muted-foreground">
                    <Receipt className="h-3 w-3" /> Submit receipt for credits
                  </span>
                </div>
                <Link to="/membership">
                  <Button variant="outline" size="sm" className="gap-2 mt-1">
                    Learn about membership <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-sage-light/20">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-3xl font-heading text-foreground text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-heading text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Try our free symptom checker or join the waitlist for full access to health intelligence tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/triage">
              <Button size="lg" className="gap-2 h-12 px-8">
                Try the Symptom Checker <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/waitlist">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Join the Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <NuzzleLogo size="sm" />
          <p>&copy; {new Date().getFullYear()} Nuzzle Health. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
