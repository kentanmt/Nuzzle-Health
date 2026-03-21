import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { MarkerChart } from '@/components/MarkerChart';
import { mockLabResults } from '@/lib/mock-data';
import { usePetData } from '@/hooks/usePetData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Plus, Loader2, AlertCircle } from 'lucide-react';
import { UploadLabDialog } from '@/components/UploadLabDialog';
import type { LabResult } from '@/lib/types';

const categories = [
  { key: 'cbc', label: 'CBC' },
  { key: 'kidney', label: 'Kidney' },
  { key: 'liver', label: 'Liver' },
  { key: 'glucose', label: 'Metabolic' },
  { key: 'thyroid', label: 'Thyroid' },
  { key: 'electrolytes', label: 'Electrolytes' },
  { key: 'urinalysis', label: 'Urinalysis' },
  { key: 'other', label: 'Other' },
] as const;

type CategoryKey = typeof categories[number]['key'];

/**
 * The Gemini parser returns broad categories (cbc, chemistry, urinalysis, thyroid, other).
 * This function maps chemistry markers into more specific subcategories by marker name,
 * so users can browse kidney, liver, metabolic, and electrolyte panels separately.
 */
function resolveCategory(markerName: string, rawCategory: string): CategoryKey {
  // Already a specific known category — keep it
  if (rawCategory === 'cbc' || rawCategory === 'thyroid' || rawCategory === 'urinalysis') return rawCategory as CategoryKey;

  // Sub-classify chemistry and other by marker name
  const n = markerName.toLowerCase();
  if (['bun', 'creatinine', 'sdma', 'urea nitrogen', 'blood urea'].some(k => n.includes(k))) return 'kidney';
  if (['alt', 'ast', 'alp', 'albumin', 'bilirubin', 'ggt', 'total protein', 'globulin', 'tbili', 'dbili'].some(k => n.includes(k))) return 'liver';
  if (['glucose', 'fructosamine'].some(k => n.includes(k))) return 'glucose';
  if (['sodium', 'potassium', 'chloride', 'bicarbonate', 'calcium', 'phosphorus', 'magnesium', 'co2', 'anion gap'].some(k => n.includes(k))) return 'electrolytes';
  // Anything left over from chemistry / other goes to 'other'
  return 'other';
}

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<string>('cbc');
  const [showUpload, setShowUpload] = useState(false);
  const { pet, parsedLabs, isRealPet, loading, refetch } = usePetData();

  // Use parsed labs if available, otherwise mock
  const labsWithMarkers = parsedLabs.filter(l => l.markers && l.markers.length > 0);
  const usingMock = !isRealPet || labsWithMarkers.length === 0;
  const labResults: LabResult[] = usingMock ? mockLabResults : labsWithMarkers;
  const latestResult = labResults[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-heading text-foreground">Diagnostics</h1>
            {!isRealPet && (
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Demo</span>
            )}
            {isRealPet && parsedLabs.length > 0 && (
              <span className="text-xs bg-sage-light text-primary rounded-full px-2 py-0.5">Your pet's data</span>
            )}
            {isRealPet && parsedLabs.length === 0 && (
              <span className="text-xs bg-score-watch/10 text-score-watch rounded-full px-2 py-0.5">Processing labs...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4" /> Upload PDF
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4" /> Add Results
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-5xl mx-auto space-y-6">
        {/* Mock data disclaimer */}
        {isRealPet && usingMock && (
          <div className="rounded-xl border border-score-watch/30 bg-score-watch/5 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-score-watch flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Showing sample data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                These are demo results for illustration purposes. Upload {pet?.name || 'your pet'}'s bloodwork PDF to see their actual health score and biomarkers.
              </p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5 h-7 text-xs" onClick={() => setShowUpload(true)}>
                <Upload className="h-3 w-3" /> Upload bloodwork
              </Button>
            </div>
          </div>
        )}

        {latestResult && (
          <>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Latest Results</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestResult.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{latestResult.vetName}</p>
                  <p className="text-xs text-muted-foreground">{latestResult.labSource}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-score-optimal" />
                  <span className="text-xs text-muted-foreground">In range</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-score-watch" />
                  <span className="text-xs text-muted-foreground">Watch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-score-elevated" />
                  <span className="text-xs text-muted-foreground">Out of range</span>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex flex-wrap gap-1 h-auto bg-secondary p-1">
                {categories.map(c => {
                  const hasMarkers = latestResult.markers.some(m => resolveCategory(m.name, m.category) === c.key);
                  return (
                    <TabsTrigger
                      key={c.key}
                      value={c.key}
                      className="text-xs flex-1 min-w-[80px]"
                      disabled={!hasMarkers}
                    >
                      {c.label}
                      {!hasMarkers && <span className="ml-1 opacity-50">—</span>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map(c => {
                const markers = latestResult.markers
                  .filter(m => resolveCategory(m.name, m.category) === c.key)
                  .sort((a, b) => {
                    // Sort out-of-range markers to the top
                    const aOut = a.value < a.referenceMin || a.value > a.referenceMax;
                    const bOut = b.value < b.referenceMin || b.value > b.referenceMax;
                    if (aOut && !bOut) return -1;
                    if (!aOut && bOut) return 1;
                    return 0;
                  });
                return (
                  <TabsContent key={c.key} value={c.key} className="space-y-6 mt-4">
                    {markers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No {c.label} markers found in your results.</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                          <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{c.label} Panel — {markers.length} marker{markers.length !== 1 ? 's' : ''}</p>
                            {markers.some(m => m.value < m.referenceMin || m.value > m.referenceMax) && (
                              <span className="text-[10px] font-semibold text-score-elevated bg-score-elevated/10 rounded-full px-2 py-0.5">
                                {markers.filter(m => m.value < m.referenceMin || m.value > m.referenceMax).length} out of range
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-border">
                            {markers.map(marker => {
                              const range = marker.referenceMax - marker.referenceMin;
                              const pct = range > 0 ? ((marker.value - marker.referenceMin) / range) * 100 : 50;
                              const inRange = marker.value >= marker.referenceMin && marker.value <= marker.referenceMax;
                              const nearEdge = inRange && (pct < 15 || pct > 85);
                              return (
                                <div key={marker.name} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-foreground">{marker.name}</p>
                                      {!inRange && (
                                        <span className="text-[10px] font-semibold text-score-elevated bg-score-elevated/10 rounded-full px-1.5 py-0.5">
                                          {marker.value < marker.referenceMin ? '↓ Low' : '↑ High'}
                                        </span>
                                      )}
                                      {nearEdge && (
                                        <span className="text-[10px] font-semibold text-score-watch bg-score-watch/10 rounded-full px-1.5 py-0.5">
                                          Near edge
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Ref: {marker.referenceMin}–{marker.referenceMax} {marker.unit}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="hidden sm:block w-28 h-2.5 bg-secondary rounded-full overflow-hidden relative">
                                      <div
                                        className="absolute inset-y-0 rounded-full"
                                        style={{
                                          left: '0%',
                                          width: `${Math.min(100, Math.max(2, pct))}%`,
                                          backgroundColor: inRange ? (nearEdge ? 'hsl(var(--score-watch))' : 'hsl(var(--score-optimal))') : 'hsl(var(--score-elevated))',
                                        }}
                                      />
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                      <p className={`text-sm font-semibold ${inRange ? (nearEdge ? 'text-score-watch' : 'text-score-optimal') : 'text-score-elevated'}`}>
                                        {marker.value} {marker.unit}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {labResults.length > 1 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                              Longitudinal trends ({labResults.length} visits)
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                              {[...new Set(
                                labResults.flatMap(r => r.markers.filter(m => resolveCategory(m.name, m.category) === c.key).map(m => m.name))
                              )].map(name => (
                                <MarkerChart key={name} markerName={name} results={labResults} />
                              ))}
                            </div>
                          </div>
                        )}
                        {labResults.length === 1 && (
                          <div className="grid md:grid-cols-2 gap-4">
                            {markers.map(marker => (
                              <MarkerChart key={marker.name} markerName={marker.name} results={labResults} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </>
        )}

        {!latestResult && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No lab results available yet. Upload a blood test PDF to get started.</p>
            <Button variant="outline" className="gap-2" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4" /> Upload bloodwork PDF
            </Button>
          </div>
        )}
      </main>

      <UploadLabDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        petId={pet?.id ?? null}
        petName={pet?.name || 'your pet'}
        onSuccess={refetch}
      />

      <BottomNav />
    </div>
  );
}
