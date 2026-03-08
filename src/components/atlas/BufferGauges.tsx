import { motion } from "framer-motion";

interface Buffer {
  label: string;
  icon: string;
  current: number;
  max: number;
  unit: string;
  dangerThreshold: number;
}

interface BufferGaugesProps {
  buffers: Buffer[];
}

const BufferGauges = ({ buffers }: BufferGaugesProps) => {
  const getColor = (current: number, max: number, threshold: number) => {
    const ratio = current / max;
    if (ratio >= threshold) return "hsl(var(--healthy))";
    if (ratio >= threshold * 0.6) return "hsl(var(--warn))";
    return "hsl(var(--critical))";
  };

  return (
    <div className="card-atlas p-6 space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Stress Buffer Capacity
        </p>
        <h3 className="text-base font-bold text-foreground mt-0.5">
          Absorption Reserves
        </h3>
      </div>

      <div className="space-y-4">
        {buffers.map((buf, i) => {
          const ratio = buf.current / buf.max;
          const color = getColor(buf.current, buf.max, buf.dangerThreshold);
          const isLow = ratio < buf.dangerThreshold * 0.6;

          return (
            <motion.div
              key={buf.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{buf.icon}</span>
                  <span className="text-xs font-medium text-foreground">
                    {buf.label}
                  </span>
                  {isLow && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-critical/15 text-critical border border-critical/20">
                      DANGER BAND
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  <span style={{ color }}>{buf.current}</span>
                  <span> / {buf.max} {buf.unit}</span>
                </span>
              </div>

              {/* Gauge bar */}
              <div className="relative h-5 rounded-md bg-muted overflow-hidden">
                {/* Danger threshold marker */}
                <div
                  className="absolute inset-y-0 w-px bg-background/60 z-10"
                  style={{ left: `${buf.dangerThreshold * 100}%` }}
                />
                <div
                  className="absolute top-0 text-[8px] font-mono text-background/70 z-10 mt-0.5"
                  style={{ left: `${buf.dangerThreshold * 100 + 1}%` }}
                >
                  MIN
                </div>

                {/* Fill */}
                <motion.div
                  className="h-full rounded-md"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                />

                {/* Current label */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-[10px] font-mono text-background/70">
                    {Math.round(ratio * 100)}% capacity
                  </span>
                </div>
              </div>

              {/* Sub text */}
              <p className="text-[10px] text-muted-foreground">
                {ratio >= buf.dangerThreshold
                  ? `${Math.round((ratio - buf.dangerThreshold) * buf.max)} ${buf.unit} above minimum threshold`
                  : `${Math.round((buf.dangerThreshold - ratio) * buf.max)} ${buf.unit} below minimum threshold`}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BufferGauges;
