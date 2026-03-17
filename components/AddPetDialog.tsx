import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PawPrint, Upload, FileText, X } from 'lucide-react';
import { LoginDialog } from './LoginDialog';
import { SignupDialog } from './SignupDialog';

interface AddPetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPetAdded?: () => void;
}

export function AddPetDialog({ open, onOpenChange, onPetAdded }: AddPetDialogProps) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'auth-check' | 'pet-form'>('auth-check');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);

  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    sex: '',
    spayedNeutered: false,
    existingConditions: '',
    medications: '',
    allergies: '',
  });

  // If user is logged in, go straight to pet form
  const effectiveStep = user ? 'pet-form' : step;

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (files.length === 0) {
      toast({ title: 'Please select PDF files only', variant: 'destructive' });
      return;
    }
    setPdfFiles(prev => [...prev, ...files]);
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast({ title: 'Please enter your pet\'s name', variant: 'destructive' });
      return;
    }

    setLoading(true);

    // Create pet
    const { data: pet, error: petError } = await supabase.from('pets').insert({
      user_id: user.id,
      name: form.name.trim(),
      species: form.species,
      breed: form.breed || null,
      age: form.age ? parseFloat(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      sex: form.sex || null,
      spayed_neutered: form.spayedNeutered,
      existing_conditions: form.existingConditions ? form.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
      allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
    }).select().single();

    if (petError || !pet) {
      toast({ title: 'Failed to add pet', description: petError?.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Upload PDFs
    if (pdfFiles.length > 0) {
      setUploadingPdfs(true);
      for (const file of pdfFiles) {
        const filePath = `${user.id}/${pet.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('pet-records')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('pet-records').getPublicUrl(filePath);
          await supabase.from('pet_records').insert({
            pet_id: pet.id,
            user_id: user.id,
            title: file.name.replace('.pdf', ''),
            file_name: file.name,
            file_url: filePath,
            record_type: 'lab-report',
            record_date: new Date().toISOString().split('T')[0],
          });
        }
      }
      setUploadingPdfs(false);
    }

    toast({ title: `${form.name} added! 🐾`, description: pdfFiles.length > 0 ? `${pdfFiles.length} record(s) uploaded` : undefined });
    setLoading(false);
    onOpenChange(false);
    onPetAdded?.();
    // Reset
    setForm({ name: '', species: 'dog', breed: '', age: '', weight: '', sex: '', spayedNeutered: false, existingConditions: '', medications: '', allergies: '' });
    setPdfFiles([]);
  };

  return (
    <>
      <Dialog open={open && !showLogin && !showSignup} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary" />
              {effectiveStep === 'auth-check' ? 'Sign in to add your pet' : 'Add your pet'}
            </DialogTitle>
            <DialogDescription>
              {effectiveStep === 'auth-check'
                ? 'Sign in or create an account to personalize the dashboard with your pet\'s real health data.'
                : 'Fill in your pet\'s info to see a personalized dashboard. Upload blood test PDFs to populate the Labs tab.'}
            </DialogDescription>
          </DialogHeader>

          {effectiveStep === 'auth-check' ? (
            <div className="space-y-3 mt-4">
              <Button className="w-full" size="lg" onClick={() => setShowLogin(true)}>
                Sign In
              </Button>
              <Button variant="outline" className="w-full" size="lg" onClick={() => setShowSignup(true)}>
                Create Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Pet name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Bella" required maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label>Species</Label>
                  <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Breed</Label>
                  <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="Golden Retriever" maxLength={100} />
                </div>
                <div className="space-y-1.5">
                  <Label>Age (years)</Label>
                  <Input type="number" min="0" max="30" step="0.5" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="5" />
                </div>
                <div className="space-y-1.5">
                  <Label>Weight (lbs)</Label>
                  <Input type="number" min="0" max="300" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="65" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sex</Label>
                  <Select value={form.sex} onValueChange={v => setForm(f => ({ ...f, sex: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="spayed"
                      checked={form.spayedNeutered}
                      onCheckedChange={c => setForm(f => ({ ...f, spayedNeutered: !!c }))}
                    />
                    <label htmlFor="spayed" className="text-sm cursor-pointer">Spayed/Neutered</label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Existing conditions</Label>
                <Input value={form.existingConditions} onChange={e => setForm(f => ({ ...f, existingConditions: e.target.value }))} placeholder="e.g. Hip dysplasia, allergies (comma-separated)" maxLength={500} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Medications</Label>
                  <Input value={form.medications} onChange={e => setForm(f => ({ ...f, medications: e.target.value }))} placeholder="Comma-separated" maxLength={500} />
                </div>
                <div className="space-y-1.5">
                  <Label>Allergies</Label>
                  <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="Comma-separated" maxLength={500} />
                </div>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Upload blood test results (PDF)
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handlePdfSelect}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload PDF blood test results</span>
                    <span className="text-xs text-muted-foreground">These will appear under Records</span>
                  </label>
                </div>
                {pdfFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {pdfFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-sage-light/50 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <button type="button" onClick={() => removePdf(i)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={loading || uploadingPdfs}>
                {loading ? (uploadingPdfs ? 'Uploading records...' : 'Adding pet...') : (
                  <>Add {form.name || 'Pet'} <PawPrint className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onSuccess={() => { setShowLogin(false); setStep('pet-form'); }}
        onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }}
      />
      <SignupDialog
        open={showSignup}
        onOpenChange={setShowSignup}
        onSuccess={() => { setShowSignup(false); setStep('pet-form'); }}
        onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }}
      />
    </>
  );
}
