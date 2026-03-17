import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, FileText, Loader2, X } from 'lucide-react';

interface UploadLabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string | null;
  petName: string;
  onSuccess: () => void;
}

export function UploadLabDialog({ open, onOpenChange, petId, petName, onSuccess }: UploadLabDialogProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    recordType: 'lab-report',
    recordDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Please select a PDF file', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    if (!form.title) {
      setForm(f => ({ ...f, title: file.name.replace('.pdf', '') }));
    }
  };

  const handleUpload = async () => {
    if (!user || !petId || !selectedFile) return;
    if (!form.title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${petId}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('pet-records')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('pet_records').insert({
        pet_id: petId,
        user_id: user.id,
        title: form.title.trim(),
        file_name: selectedFile.name,
        file_url: filePath,
        record_type: form.recordType,
        record_date: form.recordDate,
        notes: form.notes.trim() || null,
      });

      if (insertError) throw insertError;

      toast({ title: 'Record uploaded! 📄', description: 'Results will be parsed automatically and appear shortly.' });
      onOpenChange(false);
      setSelectedFile(null);
      setForm({ title: '', recordType: 'lab-report', recordDate: new Date().toISOString().split('T')[0], notes: '' });
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Lab Results
          </DialogTitle>
          <DialogDescription>
            Upload a PDF for {petName}. Lab reports and vet visit notes will be parsed automatically to populate biomarkers, vaccinations, and care data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>PDF File *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center gap-2 rounded-lg bg-sage-light/50 px-3 py-2.5 text-sm border border-border">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="truncate flex-1">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-muted-foreground hover:text-score-elevated transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to select a PDF file</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Annual Bloodwork Results"
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Record Type</Label>
              <Select value={form.recordType} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-report">Lab Report</SelectItem>
                  <SelectItem value="vet-visit">Vet Visit</SelectItem>
                  <SelectItem value="vaccine">Vaccine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.recordDate}
                onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes..."
              maxLength={500}
            />
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload Record</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
