import { motion } from 'framer-motion';
import { Heart, Droplets, Activity, Bone } from 'lucide-react';

const metrics = [
  { icon: Droplets, label: 'Bloodwork', value: 92, color: 'hsl(var(--score-optimal))' },
  { icon: Activity, label: 'Activity', value: 88, color: 'hsl(var(--score-optimal))' },
  { icon: Bone, label: 'Weight', value: 78, color: 'hsl(var(--score-watch))' },
  { icon: Heart, label: 'Vitals', value: 95, color: 'hsl(var(--score-optimal))' },
];

export function HeroHealthScore() {
  const score = 87;
  const strokeWidth = 8;
  const size = 120;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-5 space-y-4 w-full max-w-[280px]"
    >
      {/* Score ring */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--score-optimal))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, delay: 1.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-heading text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              {score}
            </motion.span>
            <span className="text-[9px] text-white/60 uppercase tracking-wider font-medium">
              Health Score
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">Bella's Overview</p>
          <p className="text-[10px] text-white/50">Golden Retriever · 5yr</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-score-optimal" />
            <span className="text-[10px] text-score-optimal font-medium">Optimal</span>
            <span className="text-[10px] text-white/40 ml-1">↑ 3 pts</span>
          </div>
        </div>
      </div>

      {/* Metric bars */}
      <div className="space-y-2.5 pt-1">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 0.1 }}
            className="flex items-center gap-2.5"
          >
            <m.icon className="h-3.5 w-3.5 text-white/50 flex-shrink-0" />
            <span className="text-[10px] text-white/70 w-16 flex-shrink-0">{m.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: '0%' }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1, delay: 1.8 + i * 0.1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-white/50 w-6 text-right font-medium">{m.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
