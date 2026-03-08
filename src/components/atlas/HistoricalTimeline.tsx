import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ShockEvent {
  month: string;
  label: string;
  severity: "critical" | "high" | "medium";
}

interface HistoricalDataPoint {
  month: string;
  score: number;
  events?: ShockEvent[];
}

interface HistoricalTimelineProps {
  cityName: string;
  data: HistoricalDataPoint[];
  shockEvents: ShockEvent[];
}

const severityColor = {
  critical: "hsl(var(--critical))",
  high: "hsl(var(--stress))",
  medium: "hsl(var(--warn))",
};

const CustomTooltip = ({
  active,
  payload,
  label,
  shockEvents,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  shockEvents: ShockEvent[];
}) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value;
  const event = shockEvents.find((e) => e.month === label);
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs font-mono space-y-1 shadow-xl">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-foreground font-bold">
        Score:{" "}
        <span
          style={{
            color:
              score >= 70
                ? "hsl(var(--healthy))"
                : score >= 50
                ? "hsl(var(--warn))"
                : "hsl(var(--critical))",
          }}
        >
          {score}/100
        </span>
      </div>
      {event && (
        <div
          className="mt-1 px-2 py-1 rounded border"
          style={{
            color: severityColor[event.severity],
            borderColor: `${severityColor[event.severity]}40`,
            backgroundColor: `${severityColor[event.severity]}14`,
          }}
        >
          ⚡ {event.label}
        </div>
      )}
    </div>
  );
};

const HistoricalTimeline = ({
  cityName,
  data,
  shockEvents,
}: HistoricalTimelineProps) => {
  const minScore = Math.min(...data.map((d) => d.score));
  const maxScore = Math.max(...data.map((d) => d.score));
  const current = data[data.length - 1]?.score ?? 0;
  const yearAgo = data[0]?.score ?? 0;
  const delta = current - yearAgo;

  return (
    <div className="card-atlas p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Historical Resilience
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            12-Month Score Timeline — {cityName}
          </h3>
        </div>
        <div className="text-right space-y-0.5">
          <div className="text-xs font-mono text-muted-foreground">
            12-month delta
          </div>
          <div
            className="text-lg font-bold font-mono"
            style={{
              color:
                delta > 0
                  ? "hsl(var(--healthy))"
                  : delta < -5
                  ? "hsl(var(--critical))"
                  : "hsl(var(--warn))",
            }}
          >
            {delta > 0 ? "+" : ""}
            {delta}
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "CURRENT", value: current, sub: "score" },
          { label: "12M HIGH", value: maxScore, sub: "peak" },
          { label: "12M LOW", value: minScore, sub: "trough" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-lg px-3 py-2 border border-border text-center"
          >
            <div className="text-[10px] font-mono text-muted-foreground tracking-widest">
              {stat.label}
            </div>
            <div
              className="text-xl font-bold font-mono mt-0.5"
              style={{
                color:
                  stat.value >= 70
                    ? "hsl(var(--healthy))"
                    : stat.value >= 50
                    ? "hsl(var(--warn))"
                    : "hsl(var(--critical))",
              }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Area chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="resilGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.4}
            />
            <XAxis
              dataKey="month"
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 9,
                fontFamily: "Space Mono",
              }}
            />
            <YAxis
              domain={[20, 100]}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 9,
                fontFamily: "Space Mono",
              }}
            />
            <Tooltip
              content={
                <CustomTooltip shockEvents={shockEvents} />
              }
            />
            {/* Resilience zones */}
            <ReferenceLine
              y={70}
              stroke="hsl(var(--healthy))"
              strokeDasharray="4 4"
              strokeOpacity={0.35}
              label={{
                value: "resilient",
                style: {
                  fill: "hsl(var(--healthy))",
                  fontSize: 8,
                  fontFamily: "Space Mono",
                },
              }}
            />
            <ReferenceLine
              y={50}
              stroke="hsl(var(--warn))"
              strokeDasharray="4 4"
              strokeOpacity={0.35}
              label={{
                value: "moderate",
                style: {
                  fill: "hsl(var(--warn))",
                  fontSize: 8,
                  fontFamily: "Space Mono",
                },
              }}
            />
            {/* Shock event markers */}
            {shockEvents.map((ev) => (
              <ReferenceLine
                key={ev.month}
                x={ev.month}
                stroke={severityColor[ev.severity]}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
                label={{
                  value: "⚡",
                  position: "insideTopRight",
                  style: {
                    fill: severityColor[ev.severity],
                    fontSize: 10,
                  },
                }}
              />
            ))}
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#resilGrad)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Shock events legend */}
      {shockEvents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Annotated Shock Events
          </p>
          <div className="space-y-1">
            {shockEvents.map((ev) => (
              <div key={ev.month} className="flex items-center gap-2 text-xs">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: severityColor[ev.severity] }}
                />
                <span className="font-mono text-muted-foreground w-8">
                  {ev.month}
                </span>
                <span className="text-foreground">{ev.label}</span>
                <span
                  className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    color: severityColor[ev.severity],
                    backgroundColor: `${severityColor[ev.severity]}18`,
                  }}
                >
                  {ev.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalTimeline;
