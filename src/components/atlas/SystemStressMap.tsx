import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, Map, Search, X } from "lucide-react";
import WorldMapBackground from "./WorldMapBackground";
import * as d3geo from "d3-geo";

export interface CityData {
  id: string;
  name: string;
  region: string;
  x: number; // % of container width  (0–100)
  y: number; // % of container height (0–100)
  lon: number;
  lat: number;
  score: number;
  sectors: { name: string; status: "resilient" | "moderate" | "stressed" | "fragile" }[];
}

/**
 * Mercator formula:
 *   x% = (lon + 180) / 360 * 100
 *   y% = (90 - lat) / 180 * 100
 */
const cities: CityData[] = [
  // ── Original 6 ──────────────────────────────────────────────────────
  {
    id: "lagos",
    name: "Lagos",
    region: "West Africa",
    lon: 3.4, lat: 6.5,
    x: 51.0, y: 46.4,
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
    lon: 36.8, lat: -1.3,
    x: 60.2, y: 50.7,
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
    lon: 31.2, lat: 30.0,
    x: 58.7, y: 33.3,
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
    lon: 72.8, lat: 19.1,
    x: 70.2, y: 39.4,
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
    lon: -46.6, lat: -23.5,
    x: 37.1, y: 63.1,
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
    lon: 106.8, lat: -6.2,
    x: 85.2, y: 53.4,
    score: 39,
    sectors: [
      { name: "Coastal Flooding", status: "fragile" },
      { name: "Water", status: "fragile" },
      { name: "Energy", status: "moderate" },
      { name: "Infrastructure", status: "stressed" },
    ],
  },
  // ── New 6 ─────────────────────────────────────────────────────────
  {
    // lon=90.4, lat=23.7 → x=(90.4+180)/360*100=75.1, y=(90-23.7)/180*100=36.8
    id: "dhaka",
    name: "Dhaka",
    region: "South Asia",
    lon: 90.4, lat: 23.7,
    x: 75.1, y: 36.8,
    score: 34,
    sectors: [
      { name: "Flood Risk", status: "fragile" },
      { name: "Water", status: "fragile" },
      { name: "Health", status: "stressed" },
      { name: "Infrastructure", status: "stressed" },
    ],
  },
  {
    // lon=67.0, lat=24.9 → x=(67+180)/360*100=68.6, y=(90-24.9)/180*100=36.2
    id: "karachi",
    name: "Karachi",
    region: "South Asia",
    lon: 67.0, lat: 24.9,
    x: 68.6, y: 36.2,
    score: 41,
    sectors: [
      { name: "Water", status: "fragile" },
      { name: "Energy", status: "stressed" },
      { name: "Finance", status: "moderate" },
      { name: "Infrastructure", status: "stressed" },
    ],
  },
  {
    // lon=15.3, lat=-4.3 → x=(15.3+180)/360*100=54.3, y=(90-(-4.3))/180*100=52.4
    id: "kinshasa",
    name: "Kinshasa",
    region: "Central Africa",
    lon: 15.3, lat: -4.3,
    x: 54.3, y: 52.4,
    score: 31,
    sectors: [
      { name: "Energy", status: "fragile" },
      { name: "Health", status: "fragile" },
      { name: "Water", status: "stressed" },
      { name: "Food System", status: "stressed" },
    ],
  },
  {
    // lon=-74.1, lat=4.7 → x=(-74.1+180)/360*100=29.4, y=(90-4.7)/180*100=47.4
    id: "bogota",
    name: "Bogotá",
    region: "South America",
    lon: -74.1, lat: 4.7,
    x: 29.4, y: 47.4,
    score: 53,
    sectors: [
      { name: "Ecosystem", status: "moderate" },
      { name: "Water", status: "moderate" },
      { name: "Infrastructure", status: "stressed" },
      { name: "Finance", status: "resilient" },
    ],
  },
  {
    // lon=121.0, lat=14.6 → x=(121+180)/360*100=83.6, y=(90-14.6)/180*100=41.9
    id: "manila",
    name: "Manila",
    region: "Southeast Asia",
    lon: 121.0, lat: 14.6,
    x: 83.6, y: 41.9,
    score: 46,
    sectors: [
      { name: "Typhoon Risk", status: "fragile" },
      { name: "Infrastructure", status: "stressed" },
      { name: "Water", status: "stressed" },
      { name: "Energy", status: "moderate" },
    ],
  },
  {
    // lon=3.9, lat=5.6 → x=(3.9+180)/360*100=51.1, y=(90-5.6)/180*100=46.9
    // Accra — distinct from Lagos, sits on coast of Ghana
    id: "accra",
    name: "Accra",
    region: "West Africa",
    lon: 3.9, lat: 5.6,
    x: 51.1, y: 46.9,
    score: 49,
    sectors: [
      { name: "Energy", status: "stressed" },
      { name: "Water", status: "moderate" },
      { name: "Finance", status: "moderate" },
      { name: "Health", status: "stressed" },
    ],
  },
];

const statusColor = {
  resilient: "hsl(var(--healthy))",
  moderate:  "hsl(var(--warn))",
  stressed:  "hsl(var(--stress))",
  fragile:   "hsl(var(--critical))",
};

const scoreColor = (score: number) => {
  if (score >= 70) return "hsl(var(--healthy))";
  if (score >= 50) return "hsl(var(--warn))";
  if (score >= 30) return "hsl(var(--stress))";
  return "hsl(var(--critical))";
};

// ─── City Search Bar ──────────────────────────────────────────────────────────
const CitySearchBar = ({
  cities,
  onSelect,
}: {
  cities: CityData[];
  onSelect: (city: CityData) => void;
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? cities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.region.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const choose = useCallback(
    (city: CityData) => {
      onSelect(city);
      setQuery("");
      setOpen(false);
    },
    [onSelect]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[cursor]) choose(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  useEffect(() => {
    setCursor(0);
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 bg-card border border-border rounded px-2.5 py-1.5 text-xs font-mono focus-within:border-accent/50 transition-all">
        <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKey}
          placeholder="Search city…"
          className="bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none w-32"
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border rounded shadow-lg min-w-[180px] overflow-hidden">
          {results.map((city, i) => (
            <button
              key={city.id}
              onMouseDown={() => choose(city)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                i === cursor ? "bg-accent/10" : "hover:bg-muted/30"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: scoreColor(city.score) }}
              />
              <div>
                <div className="text-xs font-mono font-bold text-foreground">{city.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{city.region}</div>
              </div>
              <span
                className="ml-auto text-[10px] font-mono font-bold"
                style={{ color: scoreColor(city.score) }}
              >
                {city.score}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Globe Projection ─────────────────────────────────────────────────────────
const GlobeView = ({
  cities,
  selected,
  hovered,
  onHover,
  onClick,
}: {
  cities: CityData[];
  selected: string;
  hovered: string | null;
  onHover: (id: string | null) => void;
  onClick: (city: CityData) => void;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const dragRef = useRef<{ startX: number; startY: number; rot: [number, number, number] } | null>(null);
  const W = 500, H = 500;
  const radius = 220;

  const projection = d3geo
    .geoOrthographic()
    .scale(radius)
    .translate([W / 2, H / 2])
    .rotate(rotation)
    .clipAngle(90);

  const pathGen = d3geo.geoPath().projection(projection);

  // Simple graticule
  const graticule = d3geo.geoGraticule()();

  // Sphere
  const sphere: d3geo.GeoPermissibleObjects = { type: "Sphere" };

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      rot: [...rotation] as [number, number, number],
    };
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const sensitivity = 0.3;
      setRotation([
        dragRef.current.rot[0] + dx * sensitivity,
        dragRef.current.rot[1] - dy * sensitivity,
        0,
      ]);
    },
    []
  );

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Project city lon/lat to screen coords
  const projectCity = (city: CityData) => {
    const [x, y] = projection([city.lon, city.lat]) ?? [null, null];
    if (x === null || y === null) return null;
    // Check if city is on the visible hemisphere
    const p = d3geo.geoOrthographic()
      .scale(radius)
      .translate([W / 2, H / 2])
      .rotate(rotation)
      .clipAngle(90);
    const visible = p.clipAngle();
    // Use the projection to test visibility
    const coords = projection([city.lon, city.lat]);
    if (!coords) return null;
    return { x: coords[0], y: coords[1] };
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown}
    >
      <defs>
        <radialGradient id="globeOcean" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="globeShine" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <clipPath id="globeClip">
          <path d={pathGen(sphere) ?? ""} />
        </clipPath>
      </defs>

      {/* Ocean */}
      <path
        d={pathGen(sphere) ?? ""}
        fill="url(#globeOcean)"
        stroke="hsl(var(--border))"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* Graticule */}
      <path
        d={pathGen(graticule) ?? ""}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="0.3"
        strokeOpacity="0.25"
        clipPath="url(#globeClip)"
      />

      {/* Equator */}
      <path
        d={pathGen(d3geo.geoCircle().center([0, 0]).radius(90)()) ?? ""}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="0.5"
        strokeDasharray="4 8"
        strokeOpacity="0.3"
        clipPath="url(#globeClip)"
      />

      {/* Sphere shine */}
      <path d={pathGen(sphere) ?? ""} fill="url(#globeShine)" />

      {/* City nodes */}
      {cities.map((city, i) => {
        const pos = projectCity(city);
        if (!pos) return null;
        const isSelected = selected === city.id;
        const isHovered = hovered === city.id;
        const color = scoreColor(city.score);
        return (
          <g key={city.id} clipPath="url(#globeClip)">
            {isSelected && (
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={10}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                initial={{ r: 6, opacity: 0.8 }}
                animate={{ r: 18, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
              />
            )}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isSelected || isHovered ? 7 : 5}
              fill={color}
              stroke="hsl(var(--background))"
              strokeWidth="2"
              style={{ cursor: "pointer", filter: `drop-shadow(0 0 4px ${color})` }}
              onMouseEnter={() => onHover(city.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(city)}
            />
            {(isSelected || isHovered) && (
              <text
                x={pos.x + 10}
                y={pos.y + 4}
                fill={color}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {city.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const SystemStressMap = ({ onSelectCity }: { onSelectCity: (city: CityData) => void }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("nairobi");
  const [viewMode, setViewMode] = useState<"flat" | "globe">("flat");

  const handleClick = (city: CityData) => {
    setSelected(city.id);
    onSelectCity(city);
  };

  return (
    <div className="card-atlas p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Planetary Resilience Map
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            System Stress Overview
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* City search */}
          <CitySearchBar
            cities={cities}
            onSelect={(city) => {
              setSelected(city.id);
              handleClick(city);
            }}
          />

          {/* View toggle */}
          <div className="flex items-center bg-card border border-border rounded overflow-hidden text-[10px] font-mono">
            <button
              onClick={() => setViewMode("flat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                viewMode === "flat"
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="w-3 h-3" />
              FLAT
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => setViewMode("globe")}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                viewMode === "globe"
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-3 h-3" />
              GLOBE
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
            {(["resilient", "moderate", "stressed", "fragile"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor[s] }} />
                <span className="text-muted-foreground capitalize">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map area */}
      <div
        className={`relative w-full bg-background/60 rounded-lg border border-border overflow-hidden ${
          viewMode === "globe" ? "aspect-square max-h-[500px] mx-auto" : "aspect-[2/1]"
        }`}
      >
        {viewMode === "flat" ? (
          <>
            {/* SVG world map background */}
            <WorldMapBackground />

            {/* Connection arcs — same coordinate space as city nodes (0–100 × 0–100) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {cities.map((city, i) =>
                cities.slice(i + 1).map((other) => {
                  const mx = (city.x + other.x) / 2;
                  const my = (city.y + other.y) / 2 - 6;
                  return (
                    <path
                      key={`${city.id}-${other.id}`}
                      d={`M ${city.x} ${city.y} Q ${mx} ${my} ${other.x} ${other.y}`}
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="0.25"
                      strokeDasharray="1.5 3"
                      opacity="0.2"
                    />
                  );
                })
              )}
            </svg>

            {/* City nodes — positioned using x% / y% of container */}
            {cities.map((city, i) => (
              <motion.button
                key={city.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
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
                    boxShadow:
                      selected === city.id
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
          </>
        ) : (
          /* Globe view */
          <div className="w-full h-full flex items-center justify-center p-4">
            <GlobeView
              cities={cities}
              selected={selected}
              hovered={hovered}
              onHover={setHovered}
              onClick={handleClick}
            />
          </div>
        )}

        {/* View hint */}
        {viewMode === "globe" && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground/40 pointer-events-none">
            DRAG TO ROTATE
          </div>
        )}
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
