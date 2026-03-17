import { Check, Clock, AlertCircle } from 'lucide-react';
import { CareEvent } from '@/lib/types';

const statusConfig = {
  completed: { icon: Check, label: 'Completed', className: 'bg-sage-light text-primary' },
  upcoming: { icon: Clock, label: 'Upcoming', className: 'bg-secondary text-muted-foreground' },
  overdue: { icon: AlertCircle, label: 'Overdue', className: 'bg-destructive/10 text-score-elevated' },
};

const typeLabels = {
  vaccine: '💉',
  bloodwork: '🩸',
  dental: '🦷',
  screening: '🔬',
  parasite: '🛡️',
};

export function CareTimeline({ events }: { events: CareEvent[] }) {
  const sorted = [...events].sort((a, b) => {
    const order = { overdue: 0, upcoming: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-3">
      {sorted.map((event) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        return (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <span className="text-lg">{typeLabels[event.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
