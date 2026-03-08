import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface TippingPointMeterProps {
  probability: number;
  trend: "rising" | "stable" | "falling";
  signals: {
    label: string;
    active: boolean;
    severity: "low" | "medium" | "high";
  }[];
}

const levels = [
  { label: "STABLE SYSTEM", min: 0, max: 25, color: "var(--healthy)" },
  { label: "EMERGING STRESS", min: 25, max: 50, color: "var(--warn)" },
  { label: "CRITICAL ZONE", min: 50, max: 75, color: "var(--stress)" },
  { label: "COLLAPSE LIKELY", min: 75, max: 100, color: "var(--critical)" },
];

const TippingPointMeter = ({
  probability,
  trend,
  signals,
}: TippingPointMeterProps) => {
  const getLevel = () =>
    levels.find((l) => probability >= l.min && probability < l.max) ??
    levels[levels.length - 1];

  const current = getLevel();

  return (
    <div className="card-atlas p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Tipping Point Probability
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            Critical Transition Monitor
          </h3>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border"
          style={{
            color: `hsl(${current.color})`,
            borderColor: `hsl(${current.color} / 0.3)`,
            backgroundColor: `hsl(${current.color} / 0.1)`,
          }}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>{current.label}</span>
        </div>
      </div>

      {/* Main probability bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>COLLAPSE PROBABILITY</span>
          <motion.span
            className="font-bold"
            style={{ color: `hsl(${current.color})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {probability}%
          </motion.span>
        </div>

        <div className="relative h-6 rounded-full bg-muted overflow-hidden">
          {/* Gradient fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: `linear-gradient(90deg,
                hsl(var(--healthy)) 0%,
                hsl(var(--warn)) 40%,
                hsl(var(--stress)) 65%,
                hsl(var(--critical)) 100%
              )`,
              filter: `drop-shadow(0 0 6px hsl(${current.color} / 0.6))`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${probability}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
          {/* Level markers */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute inset-y-0 w-px bg-background/40"
              style={{ left: `${pct}%` }}
            />
          ))}
        </div>

        {/* Zone labels */}
        <div className="grid grid-cols-4 text-center">
          {levels.map((l) => (
            <span
              key={l.label}
              className="text-[9px] font-mono leading-tight px-0.5"
              style={{
                color:
                  current.label === l.label
                    ? `hsl(${l.color})`
                    : "hsl(var(--muted-foreground))",
                fontWeight: current.label === l.label ? "700" : "400",
              }}
            >
              {l.label.split(" ").join("\n")}
            </span>
          ))}
        </div>
      </div>

      {/* Early warning signals */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Early Warning Signals
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {signals.map((sig, i) => (
            <motion.div
              key={sig.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              className="flex items-center gap-2.5 text-xs"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sig.active ? "pulse-dot" : ""}`}
                style={{
                  backgroundColor: sig.active
                    ? sig.severity === "high"
                      ? "hsl(var(--critical))"
                      : sig.severity === "medium"
                        ? "hsl(var(--warn))"
                        : "hsl(var(--healthy))"
                    : "hsl(var(--muted-foreground))",
                }}
              />
              <span
                className={
                  sig.active ? "text-foreground" : "text-muted-foreground"
                }
              >
                {sig.label}
              </span>
              {sig.active && (
                <span
                  className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    color:
                      sig.severity === "high"
                        ? "hsl(var(--critical))"
                        : sig.severity === "medium"
                          ? "hsl(var(--warn))"
                          : "hsl(var(--healthy))",
                    backgroundColor:
                      sig.severity === "high"
                        ? "hsl(var(--critical) / 0.12)"
                        : sig.severity === "medium"
                          ? "hsl(var(--warn) / 0.12)"
                          : "hsl(var(--healthy) / 0.12)",
                  }}
                >
                  {sig.severity.toUpperCase()}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {trend === "rising" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-2 text-xs font-mono text-warn bg-warn/10 border border-warn/20 rounded px-3 py-2"
        >
          <TrendingUp className="w-3 h-3" />
          <span>Probability trending upward — monitor closely</span>
        </motion.div>
      )}
    </div>
  );
};

export default TippingPointMeter;
