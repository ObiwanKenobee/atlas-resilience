import { motion } from "framer-motion";
import { useState } from "react";
import WorldMapBackground from "./WorldMapBackground";

interface CityData {
  id: string;
  name: string;
  region: string;
  x: number; // % of viewBox width  (0-100)
  y: number; // % of viewBox height (0-100)
  score: number;
  sectors: { name: string; status: "resilient" | "moderate" | "stressed" | "fragile" }[];
}

/**
 * Geographic → SVG percentage coordinates.
 * ViewBox: 1000 × 500  (Mercator: lon -180→180, lat 90→-90)
 *
 * x% = (lon + 180) / 360 * 100
 * y% = (90 - lat) / 180 * 100
 *
 * Lagos,    Nigeria  :  lon 3.4  lat 6.5   → x≈51.0  y≈46.4
 * Nairobi,  Kenya    :  lon 36.8 lat -1.3  → x≈60.2  y≈50.7
 * Cairo,    Egypt    :  lon 31.2 lat 30.0  → x≈58.7  y≈33.3
 * Mumbai,   India    :  lon 72.8 lat 19.1  → x≈70.2  y≈39.4
 * São Paulo,Brazil   :  lon-46.6 lat-23.5  → x≈37.1  y≈63.1
 * Jakarta,  Indonesia:  lon106.8 lat -6.2  → x≈85.2  y≈53.4
 */
const cities: CityData[] = [
  {
    id: "lagos",
    name: "Lagos",
    region: "West Africa",
    x: 51.0,
    y: 46.4,
    score: 44,
    sectors: [
      { name: "Energy Grid", status: "fragile" },
      { name: "Water", status: "stressed" },
      { name: "Finance", status: "moderate" },
      { name: "Health", status: "stressed" },
    ],
  },
  {
    id: "nairobi",
    name: "Nairobi",
    region: "East Africa",
    x: 60.2,
    y: 50.7,
    score: 58,
    sectors: [
      { name: "Food System", status: "moderate" },
      { name: "Water", status: "stressed" },
      { name: "Infrastructure", status: "fragile" },
      { name: "Finance", status: "resilient" },
    ],
  },
  {
    id: "cairo",
    name: "Cairo",
    region: "North Africa",
    x: 58.7,
    y: 33.3,
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
    x: 70.2,
    y: 39.4,
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
    x: 37.1,
    y: 63.1,
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
    x: 85.2,
    y: 53.4,
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
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Planetary Resilience Map
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            System Stress Overview
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
          {(["resilient", "moderate", "stressed", "fragile"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor[s] }} />
              <span className="text-muted-foreground capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="relative w-full aspect-[2/1] bg-background/60 rounded-lg border border-border overflow-hidden">

        {/* Real SVG world map */}
        <WorldMapBackground />

        {/* Connection arcs between cities — drawn in the same 100×50 space */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 50"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {cities.map((city, i) =>
            cities.slice(i + 1).map((other) => {
              // midpoint + slight upward curve
              const mx = (city.x + other.x) / 2;
              const my = (city.y + other.y) / 2 - 4;
              return (
                <path
                  key={`${city.id}-${other.id}`}
                  d={`M ${city.x} ${city.y / 2} Q ${mx} ${my / 2} ${other.x} ${other.y / 2}`}
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.18"
                  strokeDasharray="1 2.5"
                  opacity="0.22"
                />
              );
            })
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
                style={{ border: `2px solid ${scoreColor(city.score)}` }}
                animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            {/* Main dot */}
            <div
              className="w-3.5 h-3.5 rounded-full border-2 border-background"
              style={{
                backgroundColor: scoreColor(city.score),
                boxShadow: selected === city.id
                  ? `0 0 10px 2px ${scoreColor(city.score)}`
                  : `0 0 4px 1px ${scoreColor(city.score)}66`,
              }}
            />
            {/* Label */}
            <div
              className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 text-[10px] font-mono whitespace-nowrap pointer-events-none transition-opacity ${
                hovered === city.id || selected === city.id ? "opacity-100" : "opacity-0"
              }`}
              style={{ color: scoreColor(city.score) }}
            >
              <div className="font-bold leading-tight">{city.name}</div>
              <div className="text-muted-foreground text-[9px]">{city.score}/100</div>
            </div>
          </motion.button>
        ))}

        {/* Equator label */}
        <div
          className="absolute left-1 text-[8px] font-mono text-muted-foreground/30 pointer-events-none"
          style={{ top: "50%" }}
        >
          EQ
        </div>
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
