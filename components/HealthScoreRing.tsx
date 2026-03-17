import { motion } from 'framer-motion';

interface HealthScoreRingProps {
  score: number;
  category: 'optimal' | 'watch' | 'elevated';
  change: number;
  size?: number;
}

const categoryColors = {
  optimal: 'hsl(var(--score-optimal))',
  watch: 'hsl(var(--score-watch))',
  elevated: 'hsl(var(--score-elevated))',
};

const categoryLabels = {
  optimal: 'Optimal',
  watch: 'Watch',
  elevated: 'Elevated Risk',
};

export function HealthScoreRing({ score, category, change, size = 200 }: HealthScoreRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={categoryColors[category]}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-heading text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Health Score
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${categoryColors[category]}20`,
            color: categoryColors[category],
          }}
        >
          {categoryLabels[category]}
        </span>
        <span className={`text-sm font-medium ${change >= 0 ? 'text-score-optimal' : 'text-score-elevated'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)} pts
        </span>
      </div>
    </div>
  );
}
