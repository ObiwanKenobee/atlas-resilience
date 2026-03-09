import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Globe } from "lucide-react";

interface CityPoint {
  id: string;
  name: string;
  score: number;
  tipping: number;
  region: string;
}

interface PlanetaryRiskMatrixProps {
  cities: CityPoint[];
  selectedCityId: string;
  onSelectCity: (id: string) => void;
}

const QUADRANTS = [
  {
    id: "safe",
    label: "SAFE ZONE",
    desc: "High resilience, low collapse risk",
    x: [0, 50],
    y: [60, 100],
    color: "hsl(var(--healthy))",
    bg: "hsl(158 65% 42% / 0.06)",
  },
  {
    id: "watch",
    label: "WATCH LIST",
    desc: "Moderate resilience, stress accumulating",
    x: [50, 100],
    y: [60, 100],
    color: "hsl(var(--warn))",
    bg: "hsl(38 95% 55% / 0.06)",
  },
  {
    id: "emergency",
    label: "EMERGENCY",
    desc: "Fragile — urgent intervention needed",
    x: [0, 50],
    y: [0, 60],
    color: "hsl(var(--stress))",
    bg: "hsl(25 90% 52% / 0.06)",
  },
  {
    id: "collapse",
    label: "COLLAPSE IMMINENT",
    desc: "High risk — system near critical transition",
    x: [50, 100],
    y: [0, 60],
    color: "hsl(var(--critical))",
    bg: "hsl(0 75% 58% / 0.08)",
  },
];

const getQuadrant = (tipping: number, score: number) => {
  if (tipping < 50 && score >= 60) return QUADRANTS[0];
  if (tipping >= 50 && score >= 60) return QUADRANTS[1];
  if (tipping < 50 && score < 60) return QUADRANTS[2];
  return QUADRANTS[3];
};

const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: CityPoint;
  selected?: boolean;
  onClick?: (id: string) => void;
}) => {
  const { cx = 0, cy = 0, payload, selected, onClick } = props;
  if (!payload) return null;
  const q = getQuadrant(payload.tipping, payload.score);
  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={() => onClick?.(payload.id)}
    >
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={18}
          fill="none"
          stroke={q.color}
          strokeWidth={1.5}
          opacity={0.4}
          style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={selected ? 8 : 6}
        fill={q.color}
        fillOpacity={selected ? 0.9 : 0.65}
        stroke={q.color}
        strokeWidth={1.5}
        style={{ filter: selected ? `drop-shadow(0 0 6px ${q.color})` : undefined }}
      />
      <text
        x={cx + 10}
        y={cy - 8}
        fontSize={9}
        fontFamily="Space Mono"
        fill="hsl(var(--foreground))"
        opacity={0.85}
      >
        {payload.name}
      </text>
    </g>
  );
};

const CustomTooltipMatrix = ({ active, payload }: { active?: boolean; payload?: { payload: CityPoint }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const q = getQuadrant(d.tipping, d.score);
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs font-mono shadow-xl space-y-1">
      <div className="text-foreground font-bold">{d.name}</div>
      <div className="text-muted-foreground">{d.region}</div>
      <div className="flex gap-3 mt-1">
        <span>Score: <span style={{ color: q.color }}>{d.score}</span></span>
        <span>Risk: <span style={{ color: q.color }}>{d.tipping}%</span></span>
      </div>
      <div className="mt-1 font-bold" style={{ color: q.color }}>{q.label}</div>
    </div>
  );
};

const PlanetaryRiskMatrix = ({ cities, selectedCityId, onSelectCity }: PlanetaryRiskMatrixProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const content = (
    <div className={`card-atlas flex flex-col ${isExpanded ? "fixed inset-4 z-50 overflow-auto" : ""}`}
      style={isExpanded ? { background: "hsl(var(--card))" } : {}}
    >
      <div className="p-5 flex items-start justify-between border-b border-border">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Planetary Risk Matrix
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            Tipping Probability vs Resilience Score
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="text-xs font-mono px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
        >
          {isExpanded ? "⊠ COLLAPSE" : "⊞ FULL SCREEN"}
        </button>
      </div>

      <div className={`p-5 ${isExpanded ? "flex-1" : ""}`}>
        {/* Quadrant background labels */}
        <div className={`relative ${isExpanded ? "h-[480px]" : "h-72"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, left: -10, bottom: 16 }}>
              <defs>
                {QUADRANTS.map((q) => (
                  <linearGradient key={q.id} id={`quad-${q.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={q.color} stopOpacity={0.06} />
                    <stop offset="100%" stopColor={q.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
              <XAxis
                type="number"
                dataKey="tipping"
                domain={[0, 100]}
                name="Tipping Probability"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" }}
                label={{ value: "Tipping Probability (%)", position: "insideBottom", offset: -6, style: { fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" } }}
              />
              <YAxis
                type="number"
                dataKey="score"
                domain={[20, 100]}
                name="Resilience Score"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" }}
                label={{ value: "Score", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" } }}
              />
              {/* Quadrant dividers */}
              <ReferenceLine x={50} stroke="hsl(var(--border))" strokeWidth={1.5} strokeDasharray="6 3" />
              <ReferenceLine y={60} stroke="hsl(var(--border))" strokeWidth={1.5} strokeDasharray="6 3" />
              <Tooltip content={<CustomTooltipMatrix />} />
              <Scatter
                data={cities}
                shape={(props: { cx?: number; cy?: number; payload?: CityPoint }) => (
                  <CustomDot
                    {...props}
                    selected={props.payload?.id === selectedCityId}
                    onClick={onSelectCity}
                  />
                )}
              >
                {cities.map((c) => (
                  <Cell
                    key={c.id}
                    fill={getQuadrant(c.tipping, c.score).color}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Quadrant overlay labels */}
          <div className="absolute inset-0 pointer-events-none" style={{ padding: "16px 24px 32px 32px" }}>
            <div className="grid grid-cols-2 gap-0 h-full">
              {["SAFE ZONE", "WATCH LIST", "EMERGENCY", "COLLAPSE\nIMMINENT"].map((label, i) => {
                const colors = [
                  "hsl(var(--healthy))",
                  "hsl(var(--warn))",
                  "hsl(var(--stress))",
                  "hsl(var(--critical))",
                ];
                const positions = [
                  "self-start justify-self-start",
                  "self-start justify-self-end",
                  "self-end justify-self-start",
                  "self-end justify-self-end",
                ];
                return (
                  <div key={label} className={`flex ${positions[i]}`}>
                    <span
                      className="text-[8px] font-mono font-bold opacity-40 whitespace-pre-line text-center leading-tight"
                      style={{ color: colors[i] }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* City summary strip — scrollable to handle 12 cities */}
      <div className="px-5 pb-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2">
        {cities.map((c) => {
          const q = getQuadrant(c.tipping, c.score);
          const isSel = c.id === selectedCityId;
          return (
            <button
              key={c.id}
              onClick={() => onSelectCity(c.id)}
              className={`text-left p-2 rounded border transition-all text-xs ${isSel ? "border-accent/50 bg-accent/8" : "border-border hover:border-muted-foreground/30"}`}
            >
              <div className="font-bold font-mono" style={{ color: q.color }}>{c.score}</div>
              <div className="text-foreground leading-tight">{c.name}</div>
              <div className="text-[9px] font-mono" style={{ color: q.color }}>{q.label.split(" ")[0]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {content}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PlanetaryRiskMatrix;
