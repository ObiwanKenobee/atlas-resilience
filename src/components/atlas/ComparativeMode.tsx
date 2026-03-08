import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface CityCompareData {
  id: string;
  name: string;
  region: string;
  score: number;
  subscores: { label: string; fullLabel: string; value: number; icon: string }[];
  tippingProbability: number;
  trend: "rising" | "stable" | "falling";
}

interface ComparativeModeProps {
  cityA: CityCompareData;
  cityB: CityCompareData;
  onClose: () => void;
  allCityIds: string[];
  onChangeCityA: (id: string) => void;
  onChangeCityB: (id: string) => void;
  cityNames: Record<string, string>;
}

const getColor = (v: number) => {
  if (v >= 70) return "hsl(var(--healthy))";
  if (v >= 50) return "hsl(var(--warn))";
  if (v >= 30) return "hsl(var(--stress))";
  return "hsl(var(--critical))";
};

const getLabel = (v: number) => {
  if (v >= 70) return "RESILIENT";
  if (v >= 50) return "MODERATE";
  if (v >= 30) return "STRESSED";
  return "FRAGILE";
};

const ScoreRingSmall = ({ score, color }: { score: number; color: string }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 50 50)"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="700"
        fontFamily="Space Mono" fill={color}>{Math.round(score)}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="8"
        fontFamily="Space Mono" fill="hsl(var(--muted-foreground))">/ 100</text>
    </svg>
  );
};

const ComparativeMode = ({
  cityA,
  cityB,
  onClose,
  allCityIds,
  onChangeCityA,
  onChangeCityB,
  cityNames,
}: ComparativeModeProps) => {
  // Build merged radar data
  const radarData = cityA.subscores.map((s, i) => ({
    label: s.label.split(" ")[0],
    fullLabel: s.fullLabel,
    A: Math.round(s.value),
    B: Math.round(cityB.subscores[i]?.value ?? 0),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
    >
      <motion.div
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto card-atlas"
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
              Comparative Analysis
            </p>
            <h2 className="text-lg font-bold text-foreground mt-0.5">
              {cityA.name} vs {cityB.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* City selectors */}
        <div className="grid grid-cols-2 gap-4 p-5 border-b border-border">
          {[
            { city: cityA, onChange: onChangeCityA, colorKey: "primary" },
            { city: cityB, onChange: onChangeCityB, colorKey: "accent" },
          ].map(({ city, onChange, colorKey }, i) => (
            <div key={i} className="space-y-2">
              <label className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                City {String.fromCharCode(65 + i)}
              </label>
              <select
                value={city.id}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50"
              >
                {allCityIds.map((id) => (
                  <option key={id} value={id}>{cityNames[id]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Dual score rings */}
        <div className="grid grid-cols-2 gap-0 border-b border-border">
          {[cityA, cityB].map((city, i) => {
            const c = getColor(city.score);
            return (
              <div
                key={city.id}
                className={`p-6 flex flex-col items-center gap-3 ${i === 0 ? "border-r border-border" : ""}`}
              >
                <ScoreRingSmall score={city.score} color={c} />
                <div className="text-center">
                  <div className="text-base font-bold text-foreground">{city.name}</div>
                  <div className="text-xs text-muted-foreground">{city.region}</div>
                  <div
                    className="mt-1 text-xs font-mono px-2 py-0.5 rounded inline-block border"
                    style={{ color: c, borderColor: `${c}40`, backgroundColor: `${c}14` }}
                  >
                    {getLabel(city.score)}
                  </div>
                </div>
                <div className="text-center text-xs font-mono text-muted-foreground">
                  Tipping: <span style={{ color: getColor(100 - city.tippingProbability) }}>{city.tippingProbability}%</span>
                  <span className="ml-2">• Trend: {city.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overlapping radar */}
        <div className="p-5 border-b border-border space-y-3">
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Overlapping Resilience Profile
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "Space Mono" }}
                />
                <Radar
                  name={cityA.name}
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name={cityB.name}
                  dataKey="B"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontFamily: "Space Mono",
                    fontSize: "10px",
                    color: "hsl(var(--foreground))",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-primary" />
              <span className="text-muted-foreground">{cityA.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-accent" style={{ borderTop: "2px dashed" }} />
              <span className="text-muted-foreground">{cityB.name}</span>
            </div>
          </div>
        </div>

        {/* Delta table */}
        <div className="p-5 space-y-3">
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Dimension Comparison — Who Scores Higher?
          </h3>
          <div className="space-y-1.5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 text-[10px] font-mono text-muted-foreground px-2">
              <span>DIMENSION</span>
              <span className="text-center">{cityA.name.toUpperCase().slice(0, 8)}</span>
              <span className="text-center">{cityB.name.toUpperCase().slice(0, 8)}</span>
              <span className="text-center">DELTA</span>
            </div>
            {radarData.map((row) => {
              const delta = row.A - row.B;
              const aWins = delta > 0;
              const tie = delta === 0;
              return (
                <motion.div
                  key={row.fullLabel}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center text-xs px-2 py-1.5 rounded-lg bg-muted/20 border border-border"
                >
                  <span className="text-foreground font-medium">{row.fullLabel}</span>
                  <div className="text-center">
                    <span
                      className="font-mono font-bold"
                      style={{ color: aWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                    >
                      {row.A}
                      {aWins && <span className="ml-1 text-[9px]">▲</span>}
                    </span>
                  </div>
                  <div className="text-center">
                    <span
                      className="font-mono font-bold"
                      style={{ color: !aWins && !tie ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}
                    >
                      {row.B}
                      {!aWins && !tie && <span className="ml-1 text-[9px]">▲</span>}
                    </span>
                  </div>
                  <div className="text-center flex items-center justify-center gap-1">
                    {tie ? (
                      <Minus className="w-3 h-3 text-muted-foreground" />
                    ) : aWins ? (
                      <>
                        <ArrowUp className="w-3 h-3 text-primary" />
                        <span className="font-mono font-bold text-primary">+{delta}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-3 h-3 text-accent" />
                        <span className="font-mono font-bold text-accent">{delta}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {/* Summary row */}
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center text-xs px-2 py-2 rounded-lg border border-primary/30 bg-primary/5 mt-2">
              <span className="font-bold text-foreground">COMPOSITE</span>
              <span
                className="text-center font-bold font-mono"
                style={{ color: cityA.score >= cityB.score ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              >
                {Math.round(cityA.score)}
                {cityA.score > cityB.score && <span className="ml-1 text-[9px]">▲</span>}
              </span>
              <span
                className="text-center font-bold font-mono"
                style={{ color: cityB.score > cityA.score ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))" }}
              >
                {Math.round(cityB.score)}
                {cityB.score > cityA.score && <span className="ml-1 text-[9px]">▲</span>}
              </span>
              <div className="text-center flex items-center justify-center gap-1">
                {cityA.score !== cityB.score && (cityA.score > cityB.score ? (
                  <><ArrowUp className="w-3 h-3 text-primary" /><span className="font-mono font-bold text-primary">+{Math.round(cityA.score - cityB.score)}</span></>
                ) : (
                  <><ArrowDown className="w-3 h-3 text-accent" /><span className="font-mono font-bold text-accent">{Math.round(cityA.score - cityB.score)}</span></>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComparativeMode;
