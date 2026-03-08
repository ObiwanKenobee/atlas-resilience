import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface Dimension {
  label: string;
  value: number;
  fullLabel: string;
}

interface DimensionPanelProps {
  dimensions: Dimension[];
}

const getColor = (val: number) => {
  if (val >= 70) return "hsl(var(--healthy))";
  if (val >= 50) return "hsl(var(--warn))";
  if (val >= 30) return "hsl(var(--stress))";
  return "hsl(var(--critical))";
};

const descriptions: Record<string, string> = {
  Redundancy: "Backup capacity & alternative pathways",
  Diversity: "Variety & monoculture resistance",
  "Buffer Capacity": "Shock absorption & reserve depth",
  Connectivity: "Network balance & cascade risk",
  "Recovery Speed": "Time-to-rebound after disruption",
};

const DimensionPanel = ({ dimensions }: DimensionPanelProps) => {
  return (
    <div className="card-atlas p-6 space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Five Survival Traits
        </p>
        <h3 className="text-base font-bold text-foreground mt-0.5">
          Resilience Dimensions
        </h3>
      </div>

      {/* Radar chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dimensions}>
            <PolarGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono" }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))",
                fontFamily: "Space Mono",
                fontSize: "11px",
              }}
              formatter={(value: number) => [`${value}/100`, "Score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension list */}
      <div className="space-y-3">
        {dimensions.map((dim, i) => (
          <motion.div
            key={dim.fullLabel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">
                {dim.fullLabel}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: getColor(dim.value) }}
                >
                  {dim.value}
                </span>
              </div>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getColor(dim.value) }}
                initial={{ width: 0 }}
                animate={{ width: `${dim.value}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {descriptions[dim.fullLabel]}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Weakest link callout */}
      {(() => {
        const weakest = [...dimensions].sort((a, b) => a.value - b.value)[0];
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs font-mono bg-critical/10 border border-critical/25 rounded px-3 py-2 text-critical"
          >
            ⚠ Weakest link: <strong>{weakest.fullLabel}</strong> ({weakest.value}/100) — system resilience floor
          </motion.div>
        );
      })()}
    </div>
  );
};

export default DimensionPanel;
