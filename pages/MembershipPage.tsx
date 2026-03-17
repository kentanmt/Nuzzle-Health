import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Heart, TrendingUp, ShieldCheck, Receipt, Stethoscope, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';
import nuzzleLogo from '@/assets/nuzzle-logo.png';

const included = [
  { icon: Receipt, text: 'Bloodwork credits — visit any vet, we help cover the cost', highlight: true },
  { icon: TrendingUp, text: 'AI-powered health score with longitudinal trend tracking' },
  { icon: ShieldCheck, text: 'Early warning alerts when markers shift' },
  { icon: Heart, text: 'Personalized insights after every lab result' },
  { icon: Stethoscope, text: 'Vet discussion guides tailored to your pet' },
  { icon: Mail, text: "Auto-ingest results — forward your vet's email, we do the rest" },
];

const steps = [
  { step: '1', title: 'Visit any vet', desc: 'Get bloodwork done at your trusted vet — no network restrictions, no referrals needed.' },
  { step: '2', title: 'Share your results', desc: 'Forward the email, snap a photo, or upload the PDF. We parse everything automatically.' },
  { step: '3', title: 'Earn credits & insights', desc: 'We credit part of your bloodwork cost and turn results into a living health profile.' },
];

export default function MembershipPage() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setJoined(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center">
          <h1 className="text-lg font-heading text-foreground">Membership</h1>
        </div>
      </header>

      <main className="container py-8 max-w-lg mx-auto space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <img src={nuzzleLogo} alt="" className="h-16 w-16 mx-auto" />
          <h2 className="text-3xl font-heading text-foreground">
            Nuzzle Pro
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            We give you credits toward your pet's bloodwork and turn the results into health intelligence — so you catch problems early, not late.
          </p>
        </motion.div>

        {/* Value callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-primary/30 bg-sage-light p-5 text-center space-y-2"
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider">The idea is simple</p>
          <p className="text-base font-heading text-foreground leading-snug">
            You get bloodwork done at <span className="text-primary">your own vet</span>. We give you credits toward the cost and make the data work for you.
          </p>
          <p className="text-xs text-muted-foreground">
            No network restrictions. No extra appointments. Just smarter pet care.
          </p>
        </motion.div>

        {/* What's included */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <p className="text-sm font-semibold text-foreground">What's included</p>
          <ul className="space-y-3">
            {included.map(({ icon: Icon, text, highlight }) => (
              <li key={text} className="flex items-start gap-3 text-sm">
                <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${highlight ? 'text-score-optimal' : 'text-primary'}`} />
                <span className={highlight ? 'font-semibold text-foreground' : 'text-foreground'}>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <p className="text-sm font-semibold text-foreground">How it works</p>
          <ol className="space-y-4">
            {steps.map(({ step, title, desc }) => (
              <li key={step} className="flex gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Why this matters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-6 space-y-3"
        >
          <p className="text-sm font-semibold text-foreground">Why this matters</p>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              Most pet owners only see bloodwork results once — at the vet visit. Then the PDF sits in an email inbox, forgotten.
            </p>
            <p>
              Nuzzle tracks every marker over time so you can see <span className="text-foreground font-medium">trends, not just snapshots</span>. A single BUN reading means nothing. Three readings over two years tells a story.
            </p>
            <p className="text-xs italic border-l-2 border-primary/20 pl-3 mt-3">
              Early detection through regular bloodwork monitoring can add <span className="text-foreground font-medium">2–4 years</span> to your dog's life.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        {joined ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-primary bg-sage-light p-6 text-center space-y-2"
          >
            <Check className="h-8 w-8 text-primary mx-auto" />
            <p className="font-semibold text-foreground">You're on the list!</p>
            <p className="text-sm text-muted-foreground">
              We'll reach out to <span className="font-medium text-foreground">{email}</span> when membership opens.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="h-12"
            />
            <Button type="submit" className="w-full h-12 gap-2" size="lg">
              Get Early Access <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Pricing announced soon. No commitment until launch.
            </p>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
