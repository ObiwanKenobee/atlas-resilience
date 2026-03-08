import { motion } from "framer-motion";
import { useState } from "react";

interface CityData {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  score: number;
  sectors: { name: string; status: "resilient" | "moderate" | "stressed" | "fragile" }[];
}

const cities: CityData[] = [
  {
    id: "nairobi",
    name: "Nairobi",
    region: "East Africa",
    x: 55,
    y: 52,
    score: 58,
    sectors: [
      { name: "Food System", status: "moderate" },
      { name: "Water", status: "stressed" },
      { name: "Infrastructure", status: "fragile" },
      { name: "Finance", status: "resilient" },
    ],
  },
  {
    id: "lagos",
    name: "Lagos",
    region: "West Africa",
    x: 42,
    y: 50,
    score: 44,
    sectors: [
      { name: "Energy Grid", status: "fragile" },
      { name: "Water", status: "stressed" },
      { name: "Finance", status: "moderate" },
      { name: "Health", status: "stressed" },
    ],
  },
  {
    id: "cairo",
    name: "Cairo",
    region: "North Africa",
    x: 51,
    y: 38,
    score: 62,
    sectors: [
      { name: "Water", status: "stressed" },
      { name: "Food", status: "moderate" },
      { name: "Infrastructure", status: "moderate" },
      { name: "Energy", status: "resilient" },
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "South Asia",
    x: 67,
    y: 46,
    score: 55,
    sectors: [
      { name: "Infrastructure", status: "stressed" },
      { name: "Finance", status: "resilient" },
      { name: "Health", status: "moderate" },
      { name: "Ecosystem", status: "fragile" },
    ],
  },
  {
    id: "saopaulo",
    name: "São Paulo",
    region: "South America",
    x: 27,
    y: 65,
    score: 67,
    sectors: [
      { name: "Water", status: "stressed" },
      { name: "Energy", status: "moderate" },
      { name: "Finance", status: "resilient" },
      { name: "Biodiversity", status: "fragile" },
    ],
  },
  {
    id: "jakarta",
    name: "Jakarta",
    region: "Southeast Asia",
    x: 76,
    y: 56,
    score: 39,
    sectors: [
      { name: "Coastal Flooding", status: "fragile" },
      { name: "Water", status: "fragile" },
      { name: "Energy", status: "moderate" },
      { name: "Infrastructure", status: "stressed" },
    ],
  },
];

const statusColor = {
  resilient: "hsl(var(--healthy))",
  moderate: "hsl(var(--warn))",
  stressed: "hsl(var(--stress))",
  fragile: "hsl(var(--critical))",
};

const scoreColor = (score: number) => {
  if (score >= 70) return "hsl(var(--healthy))";
  if (score >= 50) return "hsl(var(--warn))";
  if (score >= 30) return "hsl(var(--stress))";
  return "hsl(var(--critical))";
};

const SystemStressMap = ({ onSelectCity }: { onSelectCity: (city: CityData) => void }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("nairobi");

  const handleClick = (city: CityData) => {
    setSelected(city.id);
    onSelectCity(city);
  };

  return (
    <div className="card-atlas p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Planetary Resilience Map
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            System Stress Overview
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {(["resilient", "moderate", "stressed", "fragile"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor[s] }} />
              <span className="text-muted-foreground capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="relative w-full aspect-[2/1] bg-muted/20 rounded-lg border border-border overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 50">
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="50" stroke="hsl(var(--border))" strokeWidth="0.3" />
          ))}
          {[10, 20, 30, 40].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />
          ))}
        </svg>

        {/* Subtle continent outlines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 50">
          <ellipse cx="50" cy="44" rx="14" ry="6" fill="hsl(var(--foreground))" />
          <ellipse cx="50" cy="26" rx="10" ry="14" fill="hsl(var(--foreground))" />
          <ellipse cx="70" cy="28" rx="14" ry="10" fill="hsl(var(--foreground))" />
          <ellipse cx="25" cy="30" rx="8" ry="7" fill="hsl(var(--foreground))" />
          <ellipse cx="30" cy="20" rx="6" ry="5" fill="hsl(var(--foreground))" />
          <ellipse cx="85" cy="34" rx="7" ry="5" fill="hsl(var(--foreground))" />
        </svg>

        {/* Connection lines between cities */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 50">
          {cities.map((city, i) =>
            cities.slice(i + 1).map((other) => (
              <line
                key={`${city.id}-${other.id}`}
                x1={city.x}
                y1={city.y / 2}
                x2={other.x}
                y2={other.y / 2}
                stroke="hsl(var(--accent))"
                strokeWidth="0.15"
                strokeDasharray="1 2"
              />
            ))
          )}
        </svg>

        {/* City nodes */}
        {cities.map((city, i) => (
          <motion.button
            key={city.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${city.x}%`,
              top: `${city.y / 2}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.4, type: "spring" }}
            onClick={() => handleClick(city)}
            onMouseEnter={() => setHovered(city.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Pulse ring */}
            {selected === city.id && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${scoreColor(city.score)}`,
                }}
                animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {/* Main dot */}
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-background"
              style={{
                backgroundColor: scoreColor(city.score),
                boxShadow: selected === city.id ? `0 0 10px ${scoreColor(city.score)}` : undefined,
              }}
            />
            {/* Label */}
            <div
              className={`absolute left-full ml-1.5 top-1/2 -translate-y-1/2 text-[10px] font-mono whitespace-nowrap pointer-events-none transition-opacity ${
                hovered === city.id || selected === city.id ? "opacity-100" : "opacity-0"
              }`}
              style={{ color: scoreColor(city.score) }}
            >
              <div className="font-bold">{city.name}</div>
              <div className="text-muted-foreground">{city.score}/100</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* City detail strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => handleClick(city)}
            className={`text-left p-2 rounded border transition-all ${
              selected === city.id
                ? "border-accent/50 bg-accent/8"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div
              className="text-xs font-bold font-mono"
              style={{ color: scoreColor(city.score) }}
            >
              {city.score}
            </div>
            <div className="text-[10px] text-foreground leading-tight">{city.name}</div>
            <div className="text-[9px] text-muted-foreground">{city.region}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemStressMap;
export type { CityData };
