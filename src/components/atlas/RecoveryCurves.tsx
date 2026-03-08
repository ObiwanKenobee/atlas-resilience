import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface RecoverySystem {
  name: string;
  color: string;
  data: { t: number; val: number }[];
  recoveryDays: number;
}

interface RecoveryCurvesProps {
  systems: RecoverySystem[];
}

const RecoveryCurves = ({ systems }: RecoveryCurvesProps) => {
  // Build unified time series
  const maxT = Math.max(...systems.flatMap((s) => s.data.map((d) => d.t)));
  const timePoints = Array.from({ length: maxT + 1 }, (_, i) => i);

  const chartData = timePoints.map((t) => {
    const point: Record<string, number> = { t };
    systems.forEach((sys) => {
      const found = sys.data.find((d) => d.t === t);
      if (found) point[sys.name] = found.val;
    });
    return point;
  });

  return (
    <div className="card-atlas p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Recovery Speed Analysis
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            Post-Shock Rebound Curves
          </h3>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          Days post-disruption
        </p>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.4}
            />
            <XAxis
              dataKey="t"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" }}
              label={{
                value: "days",
                position: "insideBottomRight",
                offset: -4,
                style: { fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" },
              }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))",
                fontFamily: "Space Mono",
                fontSize: "10px",
              }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <ReferenceLine
              y={100}
              stroke="hsl(var(--healthy))"
              strokeDasharray="4 4"
              opacity={0.3}
            />
            <ReferenceLine
              y={40}
              stroke="hsl(var(--critical))"
              strokeDasharray="4 4"
              opacity={0.3}
              label={{ value: "crisis floor", style: { fill: "hsl(var(--critical))", fontSize: 8, fontFamily: "Space Mono" } }}
            />
            {systems.map((sys) => (
              <Line
                key={sys.name}
                type="monotone"
                dataKey={sys.name}
                stroke={sys.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {systems.map((sys, i) => (
          <motion.div
            key={sys.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-0.5 rounded"
                style={{ backgroundColor: sys.color }}
              />
              <span className="text-xs text-foreground">{sys.name}</span>
            </div>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: sys.color }}
            >
              {sys.recoveryDays}d
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecoveryCurves;
