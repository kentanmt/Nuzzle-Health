import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Bell, Sparkles, HeadphonesIcon, BookOpen, Receipt, Mail, Stethoscope, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { DashboardPreview } from '@/components/DashboardPreview';
import { VideoHero } from '@/components/VideoHero';
import { SignupDialog } from '@/components/SignupDialog';
import { LoginDialog } from '@/components/LoginDialog';
import { useAuth } from '@/hooks/useAuth';
import heroDog from '@/assets/hero-dog.png';

const features = [
  { icon: Receipt, title: 'Bloodwork credits', desc: "Get your pet's labs done at any vet. We give you credits toward the cost — no network, no referrals." },
  { icon: TrendingUp, title: 'Trends, not snapshots', desc: 'One blood panel means nothing alone. We track every marker over time so you catch shifts early.' },
  { icon: Sparkles, title: 'AI-powered insights', desc: "We translate lab results into plain-English recommendations tailored to your pet's breed, age, and history." },
  { icon: Mail, title: 'Zero-friction data flow', desc: "Forward your vet's email or upload a PDF. Results are parsed and added to your pet's profile automatically." },
  { icon: Bell, title: 'Early warning alerts', desc: 'Get notified when a marker starts trending in the wrong direction — before it becomes a problem.' },
  { icon: HeadphonesIcon, title: 'Expert support, always', desc: "Questions about your pet's results? Our team is here to help you understand what matters." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowSignup(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-cream/95 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <NuzzleLogo size="md" />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/how-it-works">
              <Button variant="ghost" size="sm" className="text-foreground font-medium hover:text-primary">
                How It Works
              </Button>
            </Link>
            <Link to="/triage">
              <Button variant="ghost" size="sm" className="text-foreground font-medium hover:text-primary">
                Symptom Checker
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-foreground font-medium hover:text-primary" onClick={handleDashboardClick}>
              My Pet's Health
            </Button>
            <Link to="/waitlist">
              <Button size="sm">Join Waitlist</Button>
            </Link>
          </div>

          {/* Mobile: Join Waitlist + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/waitlist">
              <Button size="sm">Join Waitlist</Button>
            </Link>
            <button
              className="p-2 rounded-md text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-cream/98 px-4 py-3 space-y-1">
            <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground font-medium">
                How It Works
              </Button>
            </Link>
            <Link to="/triage" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-foreground font-medium">
                Symptom Checker
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-foreground font-medium" onClick={() => { setMobileMenuOpen(false); handleDashboardClick(); }}>
              My Pet's Health
            </Button>
          </div>
        )}
      </header>

      {/* Video Hero */}
      <VideoHero onDashboardClick={handleDashboardClick} />

      {/* Core Value Prop — Credits + Intelligence */}
      <section className="py-16 md:py-24 bg-sage-light/30">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-4xl font-heading text-foreground">
              Turn every vet visit into<br />
              <span className="text-primary">lasting health intelligence.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Nuzzle transforms your pet's bloodwork into a living health profile — with personalized AI insights, trend tracking, and early warnings tailored to your pet's breed, age, and history.
            </p>
          </div>

          {/* How it works — 3 steps */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {[
              { step: '1', title: 'Visit any vet', desc: 'Get bloodwork done at your trusted vet. No network, no extra appointments.' },
              { step: '2', title: 'Share the results', desc: 'We instantly extract every marker, build your pet\'s health timeline, and start surfacing what matters — no manual entry needed.' },
              { step: '3', title: 'Receive your health intelligence', desc: 'Get personalized AI-powered insights, trend alerts, and recommendations tailored specifically to your pet.' },
            ].map(({ step, title, desc }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Number(step) * 0.1 }}
                className="text-center space-y-2"
              >
                <span className="inline-flex h-10 w-10 rounded-full bg-primary text-primary-foreground text-sm font-bold items-center justify-center mx-auto">
                  {step}
                </span>
                <h3 className="font-heading text-lg text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/membership">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Learn About Membership <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview — compact side-by-side layout */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
            <div className="md:col-span-2 space-y-5">
              <h2 className="text-3xl md:text-4xl font-heading text-foreground">
                Your pet's health, at a glance
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                One dashboard with everything — health scores, bloodwork trends,
                connected devices, and personalized insights. Updated automatically every time new data comes in.
              </p>
              <div className="space-y-2">
                {[
                  'AI health score with category breakdown',
                  'Longitudinal biomarker tracking',
                  'Personalized care recommendations',
                  'Activity & weight monitoring',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 h-12 px-8 text-base bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                onClick={handleDashboardClick}
              >
                See My Pet's Health <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="md:col-span-3">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Symptom Checker — redesigned inline section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-sage-light/20">
        <div className="container max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left: content */}
              <div className="p-8 md:p-10 flex flex-col justify-center space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary w-fit">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free — no account needed
                </div>
                <h3 className="text-2xl md:text-3xl font-heading text-foreground leading-tight">
                  Not sure if it's serious?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI symptom checker gives you a step-by-step care plan with specific remedies, timing, and clear signs for when to see a vet. Skip the anxiety.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Home remedies', 'Timing & dosages', 'Escalation signs', 'What NOT to do'].map(tag => (
                    <span key={tag} className="text-[11px] font-medium bg-secondary text-secondary-foreground rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/70 italic border-l-2 border-primary/20 pl-3">
                  Triage tool only — not a substitute for professional veterinary care.
                </p>
                <Link to="/triage">
                  <Button size="lg" className="gap-2 h-11 px-6">
                    Try the Symptom Checker <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Right: stylized mini preview */}
              <div className="hidden md:flex items-center justify-center bg-sage-light/30 p-6 border-l border-border">
                <div className="w-full max-w-xs space-y-3">
                  {/* Symptom input hint */}
                  <div className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] text-muted-foreground mb-1.5">Symptoms reported</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Vomiting 2x', 'Won\'t eat', 'Lethargic'].map(s => (
                        <span key={s} className="text-[9px] font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">{s}</span>
                      ))}
                    </div>
                  </div>
                  {/* Mini urgency banner */}
                  <div className="rounded-xl bg-score-watch/90 px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">⚡ Vet Visit Recommended</p>
                      <span className="text-[9px] bg-foreground/10 rounded-full px-2 py-0.5 font-semibold text-foreground">24–48 hrs</span>
                    </div>
                    <p className="text-[9px] text-foreground/70 mt-1">Persistent vomiting with appetite loss warrants professional evaluation to rule out obstruction or pancreatitis.</p>
                  </div>
                  {/* Mini care plan */}
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      At-Home Care Plan
                    </p>
                    {[
                      { title: 'Rest the stomach — no food', time: '12 hrs', detail: 'Small sips of water only' },
                      { title: 'Bland diet reintro', time: '24–48 hrs', detail: 'Boiled chicken + rice, small portions' },
                      { title: 'Monitor hydration', time: 'Ongoing', detail: 'Check gum moisture & skin elasticity' },
                      { title: 'Track vomiting frequency', time: 'Log each', detail: 'Note color, volume & timing' },
                    ].map(s => (
                      <div key={s.title} className="rounded-lg bg-background border border-border/60 px-3 py-2 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-foreground">{s.title}</span>
                          <span className="text-[9px] text-primary bg-primary/10 rounded-full px-2 py-0.5 font-medium">{s.time}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mini possible causes */}
                  <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-foreground">Possible causes to discuss with vet</p>
                    {[
                      { name: 'Dietary indiscretion', likelihood: 'Likely' },
                      { name: 'Gastritis', likelihood: 'Possible' },
                      { name: 'Pancreatitis', likelihood: 'Rule out' },
                    ].map(c => (
                      <div key={c.name} className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <div className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                          {c.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70 italic">{c.likelihood}</span>
                      </div>
                    ))}
                  </div>
                  {/* Red flags */}
                  <div className="rounded-xl border border-score-elevated/30 bg-score-elevated/5 p-3 space-y-1">
                    <p className="text-[10px] font-semibold text-score-elevated">🚨 See a vet immediately if</p>
                    {['Blood in vomit or stool', 'Dry heaving without producing anything', 'Abdomen feels hard or distended'].map(f => (
                      <p key={f} className="text-[9px] text-muted-foreground pl-3">• {f}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-16 md:py-24 bg-sage-light/10">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading text-foreground mb-4">
              Everything your pet's health needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Proactive care powered by data — from bloodwork intelligence to daily insights.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* Left column */}
            <div className="space-y-5">
              {features.slice(0, 3).map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl bg-card border border-border p-6 space-y-3 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
                >
                  <div className="h-10 w-10 rounded-xl bg-sage-light flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
            {/* Center image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="hidden md:flex items-center justify-center"
            >
              <div className="rounded-3xl overflow-hidden shadow-xl h-full">
                <img
                  src={heroDog}
                  alt="Veterinarian with a happy dog"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            {/* Right column */}
            <div className="space-y-5">
              {features.slice(3, 6).map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="rounded-2xl bg-card border border-border p-6 space-y-3 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
                >
                  <div className="h-10 w-10 rounded-xl bg-sage-light flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-sage-light/20">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading text-foreground">
            Smarter pet health starts here
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Be first in line for bloodwork credits, AI health tracking,
            and insights that help your pet live longer.
          </p>
          <Link to="/waitlist">
            <Button size="lg" className="gap-2 h-12 px-8 text-base mt-2">
              Join the Waitlist <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Methodology CTA — hidden until ready to publish */}
      {/*
      <section className="py-16 bg-muted/30">
        <div className="container text-center space-y-4 max-w-2xl mx-auto">
          <BookOpen className="h-8 w-8 text-primary mx-auto" />
          <h2 className="font-heading text-2xl text-foreground">Built on Veterinary Science</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our health scores are powered by breed-specific benchmarks from AKC, AAHA, and peer-reviewed veterinary databases. See exactly how it works.
          </p>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Read Our Methodology & Sources
          </Link>
        </div>
      </section>
      */}

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <NuzzleLogo size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/membership" className="hover:text-foreground transition-colors">Membership</Link>
            <span>&middot;</span>
            <p>&copy; {new Date().getFullYear()} Nuzzle Health</p>
          </div>
        </div>
      </footer>

      <SignupDialog
        open={showSignup}
        onOpenChange={setShowSignup}
        onSuccess={() => { setShowSignup(false); navigate('/dashboard'); }}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onSuccess={() => { setShowLogin(false); navigate('/dashboard'); }}
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
      />
    </div>
  );
}
