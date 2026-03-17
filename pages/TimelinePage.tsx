import { BottomNav } from '@/components/BottomNav';
import { CareTimeline } from '@/components/CareTimeline';
import { mockCareEvents } from '@/lib/mock-data';
import { usePetData } from '@/hooks/usePetData';
import { Syringe, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import type { CareEvent } from '@/lib/types';

export default function TimelinePage() {
  const { petRecords, isRealPet, pet, allVaccinations, allCareRecommendations } = usePetData();

  let careEvents: CareEvent[] = mockCareEvents;

  if (isRealPet) {
    const realEvents: CareEvent[] = [];

    // Build events from uploaded records
    petRecords.forEach((record) => {
      let type: CareEvent['type'] = 'bloodwork';
      const titleLower = (record.title || '').toLowerCase();
      const typeLower = (record.record_type || '').toLowerCase();

      if (titleLower.includes('vaccin') || typeLower === 'vaccine') type = 'vaccine';
      else if (titleLower.includes('dental') || typeLower === 'dental') type = 'dental';
      else if (titleLower.includes('screen') || typeLower === 'screening') type = 'screening';
      else if (titleLower.includes('heartworm') || titleLower.includes('parasite') || typeLower === 'parasite') type = 'parasite';
      else if (titleLower.includes('blood') || titleLower.includes('lab') || typeLower === 'lab-report') type = 'bloodwork';

      const recordDate = new Date(record.record_date || record.created_at);
      const now = new Date();
      let status: CareEvent['status'] = 'completed';
      if (recordDate > now) status = 'upcoming';

      realEvents.push({
        id: record.id,
        petId: record.pet_id,
        title: record.title,
        date: record.record_date || record.created_at.split('T')[0],
        type,
        status,
      });
    });

    // Build individual vaccination events from AI-parsed data
    allVaccinations.forEach((vax, idx) => {
      // Administered event
      if (vax.dateAdministered) {
        realEvents.push({
          id: `vax-admin-${idx}`,
          petId: pet?.id || '',
          title: `${vax.name} Vaccine`,
          date: vax.dateAdministered,
          type: 'vaccine',
          status: 'completed',
        });
      }

      // Due date event
      if (vax.dateDue) {
        const dueDate = new Date(vax.dateDue);
        const now = new Date();
        const status: CareEvent['status'] = dueDate < now ? 'overdue' : 'upcoming';
        realEvents.push({
          id: `vax-due-${idx}`,
          petId: pet?.id || '',
          title: `${vax.name} Vaccine Due`,
          date: vax.dateDue,
          type: 'vaccine',
          status,
        });
      }
    });

    // Build care recommendation events
    allCareRecommendations.forEach((rec, idx) => {
      if (rec.dueDate) {
        const dueDate = new Date(rec.dueDate);
        const now = new Date();
        let type: CareEvent['type'] = 'screening';
        if (rec.type === 'retest' || rec.type === 'followup') type = 'bloodwork';
        if (rec.type === 'dental') type = 'dental';
        if (rec.type === 'vaccine_due') type = 'vaccine';

        realEvents.push({
          id: `care-${idx}`,
          petId: pet?.id || '',
          title: rec.title,
          date: rec.dueDate,
          type,
          status: dueDate < now ? 'overdue' : 'upcoming',
        });
      }
    });

    // Deduplicate by title+date
    const seen = new Set<string>();
    const deduplicated = realEvents.filter(e => {
      const key = `${e.title.toLowerCase()}-${e.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    careEvents = deduplicated.length > 0 ? deduplicated : mockCareEvents;
  }

  const overdue = careEvents.filter(e => e.status === 'overdue');
  const upcoming = careEvents.filter(e => e.status === 'upcoming');
  const completed = careEvents.filter(e => e.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-56">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container h-14 flex items-center">
          <h1 className="text-lg font-heading text-foreground">Preventative Care</h1>
          {!isRealPet && (
            <span className="ml-3 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">Demo</span>
          )}
          {isRealPet && (
            <span className="ml-3 text-xs bg-sage-light text-primary rounded-full px-2 py-0.5">{pet?.name}'s care</span>
          )}
        </div>
      </header>

      <main className="container py-6 max-w-4xl mx-auto space-y-8">
        {overdue.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-score-elevated uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue ({overdue.length})
            </h3>
            <CareTimeline events={overdue} />
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming ({upcoming.length})
            </h3>
            <CareTimeline events={upcoming} />
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completed.length})
            </h3>
            <CareTimeline events={completed} />
          </section>
        )}

        {/* Vaccination summary for real pets */}
        {isRealPet && allVaccinations.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Vaccination Records
            </h3>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {allVaccinations.map((vax, i) => {
                  const statusColor = vax.status === 'current' ? 'text-score-optimal bg-score-optimal/10' 
                    : vax.status === 'overdue' ? 'text-score-elevated bg-score-elevated/10' 
                    : 'text-score-watch bg-score-watch/10';
                  return (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-sage-light flex items-center justify-center flex-shrink-0">
                          <Syringe className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{vax.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {vax.dateAdministered && (
                              <span className="text-xs text-muted-foreground">
                                Given: {new Date(vax.dateAdministered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                            {vax.manufacturer && (
                              <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">{vax.manufacturer}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {vax.status === 'current' ? 'Current' : vax.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                        </span>
                        {vax.dateDue && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(vax.dateDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {careEvents.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No care events yet. Upload records to populate this view.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
