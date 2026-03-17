import { motion } from 'framer-motion';
import { Activity, Droplets, TrendingUp, Calendar, Heart, Zap } from 'lucide-react';

/** A sleek, floating browser mockup of the dashboard for the landing page. */
export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-5xl"
    >
      {/* Glow effect behind the card */}
      <div className="absolute -inset-4 bg-gradient-to-b from-primary/8 via-primary/4 to-transparent rounded-[2rem] blur-2xl" />

      {/* Browser frame */}
      <div className="relative rounded-2xl border border-border/60 bg-card shadow-[0_20px_60px_-12px_hsl(var(--primary)/0.15)] overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="rounded-md bg-background/80 border border-border/30 px-4 py-1 text-[10px] text-muted-foreground font-medium">
              nuzzle.health/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-5 md:p-7 bg-background/50">
          {/* Top row: Score + Key metrics */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Health score */}
            <div className="col-span-4 rounded-xl border border-border/40 bg-card p-5 flex items-center gap-5">
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke="hsl(var(--score-optimal))"
                    strokeWidth="2.5"
                    strokeDasharray="97.4"
                    strokeDashoffset={97.4 * (1 - 0.87)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-heading text-foreground">87</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Health Score</p>
                <p className="text-sm font-semibold text-score-optimal">Optimal</p>
                <p className="text-[10px] text-muted-foreground">↑ 3 pts from last visit</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="col-span-5 rounded-xl border border-border/40 bg-card p-5 space-y-2.5">
              <p className="text-xs font-semibold text-foreground">Score Breakdown</p>
              {[
                { label: 'Bloodwork', val: 92, color: 'hsl(var(--score-optimal))' },
                { label: 'Activity', val: 88, color: 'hsl(var(--score-optimal))' },
                { label: 'Weight', val: 78, color: 'hsl(var(--score-watch))' },
                { label: 'Vitals', val: 95, color: 'hsl(var(--score-optimal))' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-16">{b.label}</span>
                  <div className="flex-1 h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${b.val}%`, backgroundColor: b.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground w-6 text-right">{b.val}</span>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="col-span-3 space-y-3">
              {[
                { icon: Activity, label: 'Avg Activity', value: '54 min/day' },
                { icon: Droplets, label: 'Weight', value: '65 lbs' },
                { icon: Calendar, label: 'Last Labs', value: 'Dec 15' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-card p-3 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    <p className="text-xs font-heading text-foreground">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row: Insights */}
          <div className="grid grid-cols-2 gap-4">
            {/* Insight cards */}
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-foreground">AI Insights</p>
              </div>
              <div className="rounded-lg bg-score-watch/8 border border-score-watch/15 p-3 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3 w-3 text-score-watch" />
                  <p className="text-[11px] font-semibold text-foreground">Kidney Markers Trending Up</p>
                </div>
                <p className="text-[10px] text-muted-foreground">Creatinine +20% over 6mo. Still in range — schedule retest.</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-primary" />
                  <p className="text-[11px] font-semibold text-foreground">Activity On Track</p>
                </div>
                <p className="text-[10px] text-muted-foreground">54 min/day avg — exceeds breed guideline of 45 min.</p>
              </div>
            </div>

            {/* Weekly activity chart */}
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
              <p className="text-xs font-semibold text-foreground">This Week's Activity</p>
              <div className="flex gap-2 items-end h-20">
                {[60, 45, 75, 55, 30, 65, 50].map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${(m / 75) * 56}px`,
                        backgroundColor: `hsl(var(--primary) / ${0.25 + (m / 75) * 0.45})`,
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground font-medium">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/30">
                <span>Avg: 54 min</span>
                <span className="text-score-optimal font-medium">↑ 12% vs last week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
