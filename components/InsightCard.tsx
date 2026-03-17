import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { Insight } from '@/lib/types';

const riskConfig = {
  low: { icon: CheckCircle, label: 'Good', className: 'text-score-optimal bg-sage-light', actionBg: 'bg-sage-light hover:bg-sage-light/80 text-primary' },
  medium: { icon: Info, label: 'Watch', className: 'text-score-watch bg-terracotta-light', actionBg: 'bg-terracotta-light hover:bg-terracotta-light/80 text-score-watch' },
  high: { icon: AlertTriangle, label: 'Act', className: 'text-score-elevated bg-destructive/10', actionBg: 'bg-destructive/10 hover:bg-destructive/15 text-score-elevated' },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const config = riskConfig[insight.riskLevel];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2.5">
      {/* Header row: icon + title + risk badge */}
      <div className="flex items-center gap-2.5">
        <div className={`rounded-lg p-1.5 ${config.className} flex-shrink-0`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h4 className="font-semibold text-sm text-foreground flex-1 min-w-0 leading-snug">{insight.title}</h4>
        <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 flex-shrink-0 ${config.className}`}>
          {config.label}
        </span>
      </div>

      {/* Description - compact */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {insight.description}
      </p>

      {/* Action button - prominent and scannable */}
      <button className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${config.actionBg}`}>
        <span>{insight.action}</span>
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
      </button>
    </div>
  );
}
