import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts';
import { LabResult } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarkerChartProps {
  markerName: string;
  results: LabResult[];
}

export function MarkerChart({ markerName, results }: MarkerChartProps) {
  const { data, refMin, refMax, unit, trend, latestValue, change } = useMemo(() => {
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

    const latest = mapped.length > 0 ? mapped[mapped.length - 1].value! : 0;
    const prev = mapped.length > 1 ? mapped[mapped.length - 2].value! : latest;
    const ch = latest - prev;
    const t: 'up' | 'down' | 'stable' = ch > 0.5 ? 'up' : ch < -0.5 ? 'down' : 'stable';

    return { data: mapped, refMin: rMin, refMax: rMax, unit: u, trend: t, latestValue: latest, change: ch };
  }, [markerName, results]);

  if (data.length === 0) return null;

  const isInRange = latestValue >= refMin && latestValue <= refMax;
  const allValues = data.map(d => d.value!);
  const minVal = Math.min(...allValues, refMin);
  const maxVal = Math.max(...allValues, refMax);
  const padding = (maxVal - minVal) * 0.15 || 5;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = isInRange 
    ? 'text-score-optimal' 
    : 'text-score-elevated';

  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:shadow-primary/5 transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{markerName}</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Normal: {refMin}–{refMax} {unit}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className={`text-lg font-bold ${isInRange ? 'text-score-optimal' : 'text-score-elevated'}`}>
              {latestValue}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          {data.length > 1 && (
            <div className={`flex items-center gap-0.5 justify-end mt-0.5 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-[10px] font-medium">
                {change > 0 ? '+' : ''}{change.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status pill */}
      <div className="mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isInRange 
            ? 'bg-score-optimal/10 text-score-optimal' 
            : 'bg-score-elevated/10 text-score-elevated'
        }`}>
          {isInRange ? 'In Range' : latestValue < refMin ? 'Below Range' : 'Above Range'}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
          {/* Shaded reference band */}
          <ReferenceArea
            y1={refMin}
            y2={refMax}
            fill="hsl(var(--score-optimal))"
            fillOpacity={0.06}
          />

          <XAxis
            dataKey="shortDate"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-[10px] text-muted-foreground mb-1">{d.displayDate}</p>
                  <p className={`text-sm font-bold ${inRef ? 'text-score-optimal' : 'text-score-elevated'}`}>
                    {val} {unit}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Ref: {refMin}–{refMax} {unit}
                  </p>
                </div>
              );
            }}
          />

          <ReferenceLine y={refMin} stroke="hsl(var(--score-watch))" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={refMax} stroke="hsl(var(--score-watch))" strokeDasharray="4 4" strokeWidth={1} />

          <defs>
            <linearGradient id={`grad-${markerName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isInRange ? 'hsl(var(--score-optimal))' : 'hsl(var(--score-elevated))'} stopOpacity={0.3} />
              <stop offset="95%" stopColor={isInRange ? 'hsl(var(--score-optimal))' : 'hsl(var(--score-elevated))'} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke={isInRange ? 'hsl(var(--score-optimal))' : 'hsl(var(--score-elevated))'}
            strokeWidth={2}
            fill={`url(#grad-${markerName})`}
            dot={{ fill: isInRange ? 'hsl(var(--score-optimal))' : 'hsl(var(--score-elevated))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Timeline summary */}
      {data.length > 1 && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">{data[0].displayDate}</span>
          <span className="text-[10px] text-muted-foreground">
            {data.length} result{data.length > 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-muted-foreground">{data[data.length - 1].displayDate}</span>
        </div>
      )}
    </div>
  );
}
