import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, PawPrint } from 'lucide-react';

export interface TriagePetData {
  name: string;
  species: string;
  breed: string;
  age: string;
  sex: string;
  weight: string;
}

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  petData?: TriagePetData | null;
  contextMessage?: string;
}

export function SignupDialog({ open, onOpenChange, onSuccess, onSwitchToLogin, petData, contextMessage }: SignupDialogProps) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    vetName: '',
    password: '',
    joinWaitlist: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim() || !form.password.trim() || !form.vetName.trim()) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      first_name: form.firstName,
      last_name: form.lastName,
    });

    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Update profile with location and waitlist preference
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        last_name: form.lastName || null,
        location: form.location || null,
        join_waitlist: form.joinWaitlist,
        vet_name: form.vetName || null,
      }).eq('user_id', user.id);

      // Auto-create pet from triage data if available
      if (petData?.name) {
        await supabase.from('pets').insert({
          user_id: user.id,
          name: petData.name,
          species: petData.species || 'dog',
          breed: petData.breed || null,
          age: petData.age ? parseFloat(petData.age) : null,
          sex: petData.sex || null,
          weight: petData.weight ? parseFloat(petData.weight) : null,
        });
      }
    }

    // If user opted into waitlist, also insert a waitlist_signups row for analytics
    if (form.joinWaitlist) {
      try {
        await supabase.from('waitlist_signups' as any).insert({
          first_name: form.firstName,
          last_name: form.lastName || null,
          email: form.email,
          location: form.location || null,
          pet_name: petData?.name || null,
          species: petData?.species || null,
          breed: petData?.breed || null,
          utm_source: 'signup_dialog',
          landing_page: window.location.pathname,
        });
      } catch { /* non-fatal */ }
    }

    setLoading(false);
    toast({ title: 'Account created!', description: petData?.name ? `Welcome to Nuzzle — ${petData.name}'s profile is ready! 🐾` : 'Welcome to Nuzzle 🐾' });
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {petData?.name ? `Unlock ${petData.name}'s free health dashboard` : 'Get your free pet health dashboard'}
          </DialogTitle>
          <DialogDescription>
            {contextMessage || (petData?.name
              ? `Get ${petData.name}'s personalized health score, AI insights, and biomarker tracking — 100% free`
              : "Personalized health score, AI insights, and biomarker tracking — 100% free")}
          </DialogDescription>
        </DialogHeader>

        {petData?.name && (
          <div className="flex items-center gap-3 rounded-xl bg-sage-light/50 border border-primary/20 p-3">
            <PawPrint className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-foreground">{petData.name}</span>
              <span className="text-muted-foreground">
                {' '}{petData.breed && `· ${petData.breed}`}{petData.age && ` · ${petData.age} yrs`}{petData.weight && ` · ${petData.weight} lbs`}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">Will be saved to your account automatically</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jane" required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" maxLength={100} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" required maxLength={255} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="San Francisco, CA" maxLength={200} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vetName">Veterinarian / Clinic *</Label>
            <Input id="vetName" value={form.vetName} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} placeholder="e.g. Pawsome Vet Clinic" required maxLength={200} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} maxLength={128} />
          </div>


          <div className="flex items-start gap-3 rounded-xl bg-sage-light/50 p-3">
            <Checkbox
              id="waitlist"
              checked={form.joinWaitlist}
              onCheckedChange={(checked) => setForm(f => ({ ...f, joinWaitlist: !!checked }))}
              className="mt-0.5"
            />
            <label htmlFor="waitlist" className="text-sm leading-relaxed cursor-pointer">
              <span className="font-medium">Join the Nuzzle waitlist</span>
              <br />
              <span className="text-muted-foreground text-xs">
                Be first to access proactive diagnostics, personalized health tracking, and smart insights for your pet.
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
            {loading ? 'Creating account...' : (
              <>{petData?.name ? `Unlock ${petData.name}'s Dashboard` : 'Get My Free Dashboard'} <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
