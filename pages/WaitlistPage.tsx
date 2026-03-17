import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Stethoscope, TrendingUp, Shield, Bell, Sparkles, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { NuzzleLogo } from '@/components/NuzzleLogo';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const benefits = [
  { icon: Stethoscope, text: 'Annual comprehensive diagnostic panel' },
  { icon: TrendingUp, text: 'Personalized health dashboard & longitudinal tracking' },
  { icon: Sparkles, text: 'Data-driven insights & recommendations' },
  { icon: Bell, text: 'Early risk detection alerts' },
  { icon: Shield, text: 'Preventative care timeline' },
  { icon: HeadphonesIcon, text: 'Telehealth & AI health concierge (coming soon)' },
];

export default function WaitlistPage() {
  const [joined, setJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', location: '',
    petName: '', breed: '', species: '', checkupFrequency: '', vetName: '',
  });

  // Capture UTM parameters from URL
  const utmData = {
    utm_source: searchParams.get('utm_source') || null,
    utm_medium: searchParams.get('utm_medium') || null,
    utm_campaign: searchParams.get('utm_campaign') || null,
    utm_content: searchParams.get('utm_content') || null,
    utm_term: searchParams.get('utm_term') || null,
    referrer: document.referrer || null,
    landing_page: window.location.href,
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('waitlist_signups' as any).insert({
        first_name: form.firstName,
        last_name: form.lastName || null,
        email: form.email,
        location: form.location || null,
        pet_name: form.petName || null,
        breed: form.breed || null,
        species: form.species || null,
        checkup_frequency: form.checkupFrequency || null,
        vet_name: form.vetName || null,
        ...utmData,
      });
      if (error) throw error;
      setJoined(true);
    } catch (err) {
      console.error('Waitlist signup error:', err);
      toast({ title: 'Something went wrong', description: 'Could not save your signup. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = form.firstName && form.email && form.vetName;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <NuzzleLogo size="md" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">← Back to Home</Button>
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left — Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-heading text-foreground leading-tight">
                Be the first to experience{' '}
                <span className="text-primary">proactive pet health</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Join the waitlist for early access to Nuzzle Health — personalized diagnostics,
                health tracking, and insights that help your pet live longer.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">What you'll get:</p>
              <ul className="space-y-3">
                {benefits.map(b => (
                  <li key={b.text} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-sage-light flex items-center justify-center">
                      <b.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground pt-1">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {joined ? (
              <div className="rounded-2xl border border-primary/30 bg-sage-light/50 p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-sage-light flex items-center justify-center mx-auto">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-heading text-foreground">You're on the list!</h3>
                <p className="text-muted-foreground">
                  We'll reach out to <span className="font-medium text-foreground">{form.email}</span> when we're ready to welcome you.
                </p>
                <Link to="/triage">
                  <Button variant="outline" className="gap-2 mt-4">
                    Try the Symptom Checker <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 space-y-5">
                <h3 className="text-xl font-heading text-foreground">Join the Waitlist</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">First Name *</label>
                    <Input
                      value={form.firstName}
                      onChange={e => handleChange('firstName', e.target.value)}
                      placeholder="Jane"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                    <Input
                      value={form.lastName}
                      onChange={e => handleChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="jane@example.com"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Location</label>
                  <Input
                    value={form.location}
                    onChange={e => handleChange('location', e.target.value)}
                    placeholder="City, State"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Pet's Name</label>
                    <Input
                      value={form.petName}
                      onChange={e => handleChange('petName', e.target.value)}
                      placeholder="Bella"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Species</label>
                    <Select value={form.species} onValueChange={v => handleChange('species', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Breed</label>
                  <Input
                    value={form.breed}
                    onChange={e => handleChange('breed', e.target.value)}
                    placeholder="Golden Retriever"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Veterinarian / Clinic *</label>
                  <Input
                    value={form.vetName}
                    onChange={e => handleChange('vetName', e.target.value)}
                    placeholder="e.g. Pawsome Vet Clinic"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">How often does your pet get checkups?</label>
                  <Select value={form.checkupFrequency} onValueChange={v => handleChange('checkupFrequency', v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Rarely / Never</SelectItem>
                      <SelectItem value="yearly">Once a year</SelectItem>
                      <SelectItem value="biannual">Twice a year</SelectItem>
                      <SelectItem value="quarterly">Every few months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={!isValid || isSubmitting} className="w-full h-12 gap-2 text-base">
                  {isSubmitting ? 'Joining…' : 'Join the Waitlist'} <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll never spam you. Unsubscribe anytime.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
