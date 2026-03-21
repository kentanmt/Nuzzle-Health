import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts';
import { LabResult } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarkerChartProps {
  markerName: string;
  results: LabResult[];
}

export function MarkerChart({ markerName, results }: MarkerChartProps) {
  const { data, refMin, refMax, unit, trend, latestValue, change, category } = useMemo(() => {
    const sorted = [...results]
      .filter(r => r.markers.some(m => m.name === markerName))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mapped = sorted.map((r) => {
      const marker = r.markers.find((m) => m.name === markerName);
      return {
        date: r.date,
        displayDate: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        shortDate: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: marker?.value ?? null,
      };
    }).filter(d => d.value !== null);

    const firstMarker = sorted[0]?.markers.find((m) => m.name === markerName);
    const rMin = firstMarker?.referenceMin ?? 0;
    const rMax = firstMarker?.referenceMax ?? 100;
    const u = firstMarker?.unit ?? '';
    const cat = firstMarker?.category ?? '';

    const latest = mapped.length > 0 ? mapped[mapped.length - 1].value! : 0;
    const prev = mapped.length > 1 ? mapped[mapped.length - 2].value! : latest;
    const ch = latest - prev;
    const t: 'up' | 'down' | 'stable' = ch > 0.5 ? 'up' : ch < -0.5 ? 'down' : 'stable';

    return { data: mapped, refMin: rMin, refMax: rMax, unit: u, trend: t, latestValue: latest, change: ch, category: cat };
  }, [markerName, results]);

  if (data.length === 0) return null;

  const isInRange = latestValue >= refMin && latestValue <= refMax;
  const range = refMax - refMin;
  const nearEdge = isInRange && range > 0 && (
    (latestValue - refMin) / range < 0.15 || (latestValue - refMin) / range > 0.85
  );

  const statusColor = !isInRange ? 'text-score-elevated' : nearEdge ? 'text-score-watch' : 'text-score-optimal';
  const statusBg = !isInRange ? 'bg-score-elevated/10 text-score-elevated' : nearEdge ? 'bg-score-watch/10 text-score-watch' : 'bg-score-optimal/10 text-score-optimal';
  const statusLabel = !isInRange ? (latestValue < refMin ? '↓ Below Range' : '↑ Above Range') : nearEdge ? '⚡ Near Edge' : '✓ In Range';
  const strokeColor = !isInRange ? 'hsl(var(--score-elevated))' : nearEdge ? 'hsl(var(--score-watch))' : 'hsl(var(--score-optimal))';

  const allValues = data.map(d => d.value!);
  const minVal = Math.min(...allValues, refMin);
  const maxVal = Math.max(...allValues, refMax);
  const padding = (maxVal - minVal) * 0.2 || 5;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  // Trend color depends on whether going up/down is good or bad
  const trendIsConcerning =
    (!isInRange && trend === 'up' && latestValue > refMax) ||
    (!isInRange && trend === 'down' && latestValue < refMin) ||
    (isInRange && nearEdge && trend === 'up' && latestValue > (refMin + refMax) / 2) ||
    (isInRange && nearEdge && trend === 'down' && latestValue < (refMin + refMax) / 2);
  const trendColor = data.length > 1 ? (trendIsConcerning ? 'text-score-elevated' : trend === 'stable' ? 'text-muted-foreground' : 'text-score-optimal') : 'text-muted-foreground';

  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:shadow-primary/5 transition-all hover:border-primary/20 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-foreground">{markerName}</h4>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusBg}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Ref: {refMin}–{refMax} {unit}
            {category && category !== 'other' && (
              <span className="ml-1.5 text-muted-foreground/60 capitalize">{category}</span>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`text-xl font-bold tabular-nums ${statusColor}`}>
            {latestValue}
          </span>
          <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
          {data.length > 1 && (
            <div className={`flex items-center gap-0.5 justify-end mt-0.5 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-[10px] font-medium">
                {change > 0 ? '+' : ''}{change.toFixed(1)} vs prev
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Single-point display */}
      {data.length === 1 ? (
        <div className="mt-3 space-y-2">
          <div className="h-3 bg-secondary rounded-full overflow-hidden relative">
            {/* Reference zone highlight */}
            <div
              className="absolute inset-y-0 bg-score-optimal/20 rounded-full"
              style={{
                left: `${Math.max(0, ((refMin - (minVal - padding)) / (maxVal + padding - (minVal - padding))) * 100)}%`,
                right: `${Math.max(0, 100 - ((refMax - (minVal - padding)) / (maxVal + padding - (minVal - padding))) * 100)}%`,
              }}
            />
            {/* Value marker */}
            <div
              className="absolute top-0 h-full w-1.5 rounded-full"
              style={{
                left: `${Math.min(98, Math.max(1, ((latestValue - (minVal - padding)) / (maxVal + padding - (minVal - padding))) * 100))}%`,
                backgroundColor: strokeColor,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {data[0].displayDate} · Upload more labs to see trends
          </p>
        </div>
      ) : (
        /* Multi-point chart */
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <ReferenceArea
              y1={refMin}
              y2={refMax}
              fill="hsl(var(--score-optimal))"
              fillOpacity={0.07}
            />

            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const val = d.value;
                const inRef = val >= refMin && val <= refMax;
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-left">
                    <p className="text-[10px] text-muted-foreground mb-1">{d.displayDate}</p>
                    <p className={`text-sm font-bold ${inRef ? 'text-score-optimal' : 'text-score-elevated'}`}>
                      {val} {unit}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Normal: {refMin}–{refMax} {unit}
                    </p>
                  </div>
                );
              }}
            />

            <ReferenceLine y={refMin} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={refMax} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth={1} />

            <defs>
              <linearGradient id={`grad-${markerName.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill={`url(#grad-${markerName.replace(/\s/g, '-')})`}
              dot={{ fill: strokeColor, r: 3.5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
              activeDot={{ r: 5.5, strokeWidth: 2, stroke: 'hsl(var(--card))', fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Timeline summary */}
      {data.length > 1 && (
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-border/50">
          <span className="text-[9px] text-muted-foreground/70">{data[0].shortDate}</span>
          <span className="text-[9px] text-muted-foreground/70 bg-muted/50 rounded px-1.5 py-0.5">
            {data.length} data point{data.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[9px] text-muted-foreground/70">{data[data.length - 1].shortDate}</span>
        </div>
      )}
    </div>
  );
}
