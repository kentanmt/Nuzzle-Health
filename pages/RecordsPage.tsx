import { useState, useRef } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { mockRecords } from '@/lib/mock-data';
import { usePetData } from '@/hooks/usePetData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FileText, Stethoscope, Syringe, Scissors, ScanLine, Plus, Upload, Search, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { MedicalRecord } from '@/lib/types';

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  'vet-visit': { icon: Stethoscope, label: 'Vet Visit', color: 'text-primary bg-sage-light' },
  'lab-report': { icon: FileText, label: 'Lab Report', color: 'text-accent bg-terracotta-light' },
  'vaccine': { icon: Syringe, label: 'Vaccine', color: 'text-score-optimal bg-sage-light' },
  'procedure': { icon: Scissors, label: 'Procedure', color: 'text-primary bg-sage-light' },
  'imaging': { icon: ScanLine, label: 'Imaging', color: 'text-muted-foreground bg-secondary' },
  'prescription': { icon: FileText, label: 'Prescription', color: 'text-score-watch bg-terracotta-light/50' },
  'note': { icon: FileText, label: 'Note', color: 'text-muted-foreground bg-secondary' },
};

export default function RecordsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { user } = useAuth();
  const { pet, petRecords, parsedLabs, isRealPet, refetch } = usePetData();

  const [reparsingId, setReparsingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    recordType: 'lab-report',
    recordDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map real uploaded records to MedicalRecord format
  const realRecords: MedicalRecord[] = petRecords.map((r) => ({
    id: r.id,
    petId: r.pet_id,
    title: r.title,
    date: r.record_date || r.created_at.split('T')[0],
    type: (r.record_type as MedicalRecord['type']) || 'note',
    notes: r.notes || undefined,
    fileName: r.file_name || undefined,
  }));

  const records = isRealPet && realRecords.length > 0 ? realRecords : mockRecords;

  const filtered = records
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || (r.notes ?? '').toLowerCase().includes(search.toLowerCase()));

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, record) => {
    const year = new Date(record.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Please select a PDF file', variant: 'destructive' });
      return;
    }
    setSelectedFile(file);
    if (!uploadForm.title) {
      setUploadForm(f => ({ ...f, title: file.name.replace('.pdf', '') }));
    }
  };

  const handleUpload = async () => {
    if (!user || !pet || !selectedFile) return;
    if (!uploadForm.title.trim()) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${pet.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('pet-records')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('pet_records').insert({
        pet_id: pet.id,
        user_id: user.id,
        title: uploadForm.title.trim(),
        file_name: selectedFile.name,
        file_url: filePath,
        record_type: uploadForm.recordType,
        record_date: uploadForm.recordDate,
        notes: uploadForm.notes.trim() || null,
      });

      if (insertError) throw insertError;

      const parsableTypes = ['lab-report', 'vaccine', 'vet-visit'];
      toast({ title: 'Record uploaded! 📄', description: parsableTypes.includes(uploadForm.recordType) ? 'Records will be parsed automatically for vaccinations, labs & care data.' : undefined });
      setShowUpload(false);
      setSelectedFile(null);
      setUploadForm({ title: '', recordType: 'lab-report', recordDate: new Date().toISOString().split('T')[0], notes: '' });
      await refetch();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleReparse = async (recordId: string) => {
    if (!user) return;
    setReparsingId(recordId);
    try {
      // Delete existing parsed result for this record
      await supabase
        .from('parsed_lab_results')
        .delete()
        .eq('pet_record_id', recordId)
        .eq('user_id', user.id);

      // Re-trigger parsing
      await supabase.functions.invoke('parse-lab-pdf', {
        body: { pet_record_id: recordId },
      });

      toast({ title: 'Re-parsed successfully ✨', description: 'Lab data has been updated across all tabs.' });
      await refetch();
    } catch (err: any) {
      toast({ title: 'Re-parse failed', description: err.message, variant: 'destructive' });
    } finally {
      setReparsingId(null);
    }
  };

  // Check if a record has been parsed
  const isParsed = (recordId: string) => parsedLabs.some((l: any) => l.id && petRecords.some(r => r.id === recordId && r.record_type === 'lab-report'));

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-heading text-foreground">Records</h1>
            {!isRealPet && (
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Demo</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRealPet && (
              <Button size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4" /> Upload PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'vet-visit', 'lab-report', 'vaccine', 'procedure', 'imaging'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  filterType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {t === 'all' ? 'All' : typeConfig[t]?.label ?? t}
              </button>
            ))}
          </div>
        </div>

        {sortedYears.map(year => (
          <div key={year} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{year}</h2>
            </div>
            <div className="space-y-2">
              {grouped[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                const config = typeConfig[record.type] ?? typeConfig['note'];
                const Icon = config.icon;
                return (
                  <div key={record.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:shadow-primary/5 transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{record.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {record.vetName && (
                                <>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground">{record.vetName}</span>
                                </>
                              )}
                              {record.clinic && (
                                <>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground">{record.clinic}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{record.notes}</p>
                        )}
                        {record.fileName && (
                          <div className="mt-2 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                              <FileText className="h-3.5 w-3.5" />
                              {record.fileName}
                            </span>
                            {isRealPet && ['lab-report', 'vaccine', 'vet-visit'].includes(record.type) && (
                              <button
                                onClick={() => handleReparse(record.id)}
                                disabled={reparsingId === record.id}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                              >
                                <RefreshCw className={`h-3 w-3 ${reparsingId === record.id ? 'animate-spin' : ''}`} />
                                {reparsingId === record.id ? 'Parsing...' : 'Re-parse'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No records found</p>
            {isRealPet && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4" /> Upload your first record
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Record
            </DialogTitle>
            <DialogDescription>
              Upload a PDF record for {pet?.name || 'your pet'}. Lab reports, vaccine records, and vet visit notes will be automatically parsed to populate the Labs & Care tabs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* File picker */}
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
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
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

            {/* Title */}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={uploadForm.title}
                onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Annual Bloodwork Results"
                maxLength={200}
              />
            </div>

            {/* Record type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Record Type</Label>
                <Select value={uploadForm.recordType} onValueChange={v => setUploadForm(f => ({ ...f, recordType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab-report">Lab Report</SelectItem>
                    <SelectItem value="vet-visit">Vet Visit</SelectItem>
                    <SelectItem value="vaccine">Vaccine</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={uploadForm.recordDate}
                  onChange={e => setUploadForm(f => ({ ...f, recordDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input
                value={uploadForm.notes}
                onChange={e => setUploadForm(f => ({ ...f, notes: e.target.value }))}
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

      <BottomNav />
    </div>
  );
}
