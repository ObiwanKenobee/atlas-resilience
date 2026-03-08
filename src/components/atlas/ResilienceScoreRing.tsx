import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Subscore {
  label: string;
  value: number;
  icon: string;
}

interface ResilienceScoreRingProps {
  score: number;
  subscores: Subscore[];
  city: string;
  region: string;
}

const ResilienceScoreRing = ({
  score,
  subscores,
  city,
  region,
}: ResilienceScoreRingProps) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const getColor = (val: number) => {
    if (val >= 70) return "hsl(var(--healthy))";
    if (val >= 50) return "hsl(var(--warn))";
    if (val >= 30) return "hsl(var(--stress))";
    return "hsl(var(--critical))";
  };

  const getLabel = (val: number) => {
    if (val >= 70) return "RESILIENT";
    if (val >= 50) return "MODERATE";
    if (val >= 30) return "STRESSED";
    return "FRAGILE";
  };

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = animated
    ? circumference * (1 - score / 100)
    : circumference;

  return (
    <div className="card-atlas p-6 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Composite Score
          </p>
          <h2 className="text-xl font-bold text-foreground mt-0.5">{city}</h2>
          <p className="text-xs text-muted-foreground">{region}</p>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded border"
          style={{
            color: getColor(score),
            borderColor: `${getColor(score)}40`,
            backgroundColor: `${getColor(score)}14`,
          }}
        >
          {getLabel(score)}
        </span>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Track */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            {/* Progress */}
            <motion.circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={getColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              transform="rotate(-90 90 90)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDash }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 8px ${getColor(score)}80)` }}
            />
            {/* Decorative inner ring */}
            <circle
              cx="90"
              cy="90"
              r="58"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold font-mono"
              style={{ color: getColor(score) }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground font-mono">
              / 100
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {subscores.map((sub, i) => (
          <SubscoreBar key={sub.label} sub={sub} index={i} />
        ))}
      </div>
    </div>
  );
};

const SubscoreBar = ({
  sub,
  index,
}: {
  sub: { label: string; value: number; icon: string };
  index: number;
}) => {
  const getColor = (val: number) => {
    if (val >= 70) return "hsl(var(--healthy))";
    if (val >= 50) return "hsl(var(--warn))";
    if (val >= 30) return "hsl(var(--stress))";
    return "hsl(var(--critical))";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08 }}
      className="flex items-center gap-3"
    >
      <span className="text-sm w-3">{sub.icon}</span>
      <span className="text-xs text-muted-foreground w-28 font-mono">
        {sub.label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getColor(sub.value) }}
          initial={{ width: 0 }}
          animate={{ width: `${sub.value}%` }}
          transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
        />
      </div>
      <span
        className="text-xs font-mono font-bold w-8 text-right"
        style={{ color: getColor(sub.value) }}
      >
        {sub.value}
      </span>
    </motion.div>
  );
};

export default ResilienceScoreRing;
