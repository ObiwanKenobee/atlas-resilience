import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadioTower, FileText, GitCompare } from "lucide-react";
import AtlasHeader from "@/components/atlas/AtlasHeader";
import ResilienceScoreRing from "@/components/atlas/ResilienceScoreRing";
import TippingPointMeter from "@/components/atlas/TippingPointMeter";
import DimensionPanel from "@/components/atlas/DimensionPanel";
import ShockSimulator from "@/components/atlas/ShockSimulator";
import SystemStressMap from "@/components/atlas/SystemStressMap";
import BufferGauges from "@/components/atlas/BufferGauges";
import RecoveryCurves from "@/components/atlas/RecoveryCurves";
import NetworkFragilityGraph from "@/components/atlas/NetworkFragilityGraph";
import HistoricalTimeline from "@/components/atlas/HistoricalTimeline";
import PlanetaryRiskMatrix from "@/components/atlas/PlanetaryRiskMatrix";
import CityReportExport from "@/components/atlas/CityReportExport";
import ComparativeMode from "@/components/atlas/ComparativeMode";
import AlertsPanel from "@/components/atlas/AlertsPanel";
import CityDetailDrawer from "@/components/atlas/CityDetailDrawer";
import { useLiveData } from "@/hooks/useLiveData";
import type { CityData } from "@/components/atlas/SystemStressMap";
import type { NetworkNode, NetworkEdge } from "@/components/atlas/NetworkFragilityGraph";
import type { AlertEvent } from "@/components/atlas/AlertsPanel";



// ─── City core dataset ────────────────────────────────────────────────────────
const cityDataset: Record<
  string,
  {
    score: number;
    subscores: { label: string; value: number; icon: string }[];
    tippingProbability: number;
    trend: "rising" | "stable" | "falling";
  }
> = {
  nairobi: {
    score: 58,
    subscores: [
      { label: "REDUNDANCY", value: 65, icon: "⛓" },
      { label: "DIVERSITY", value: 70, icon: "🌿" },
      { label: "BUFFER CAP.", value: 38, icon: "🛡" },
      { label: "CONNECTIVITY", value: 80, icon: "🔗" },
      { label: "RECOVERY", value: 55, icon: "🔄" },
    ],
    tippingProbability: 41,
    trend: "rising",
  },
  lagos: {
    score: 44,
    subscores: [
      { label: "REDUNDANCY", value: 35, icon: "⛓" },
      { label: "DIVERSITY", value: 42, icon: "🌿" },
      { label: "BUFFER CAP.", value: 30, icon: "🛡" },
      { label: "CONNECTIVITY", value: 60, icon: "🔗" },
      { label: "RECOVERY", value: 55, icon: "🔄" },
    ],
    tippingProbability: 68,
    trend: "rising",
  },
  cairo: {
    score: 62,
    subscores: [
      { label: "REDUNDANCY", value: 60, icon: "⛓" },
      { label: "DIVERSITY", value: 55, icon: "🌿" },
      { label: "BUFFER CAP.", value: 58, icon: "🛡" },
      { label: "CONNECTIVITY", value: 75, icon: "🔗" },
      { label: "RECOVERY", value: 63, icon: "🔄" },
    ],
    tippingProbability: 32,
    trend: "stable",
  },
  mumbai: {
    score: 55,
    subscores: [
      { label: "REDUNDANCY", value: 50, icon: "⛓" },
      { label: "DIVERSITY", value: 68, icon: "🌿" },
      { label: "BUFFER CAP.", value: 42, icon: "🛡" },
      { label: "CONNECTIVITY", value: 72, icon: "🔗" },
      { label: "RECOVERY", value: 43, icon: "🔄" },
    ],
    tippingProbability: 54,
    trend: "rising",
  },
  saopaulo: {
    score: 67,
    subscores: [
      { label: "REDUNDANCY", value: 70, icon: "⛓" },
      { label: "DIVERSITY", value: 65, icon: "🌿" },
      { label: "BUFFER CAP.", value: 60, icon: "🛡" },
      { label: "CONNECTIVITY", value: 78, icon: "🔗" },
      { label: "RECOVERY", value: 62, icon: "🔄" },
    ],
    tippingProbability: 28,
    trend: "falling",
  },
  jakarta: {
    score: 39,
    subscores: [
      { label: "REDUNDANCY", value: 30, icon: "⛓" },
      { label: "DIVERSITY", value: 38, icon: "🌿" },
      { label: "BUFFER CAP.", value: 25, icon: "🛡" },
      { label: "CONNECTIVITY", value: 55, icon: "🔗" },
      { label: "RECOVERY", value: 47, icon: "🔄" },
    ],
    tippingProbability: 79,
    trend: "rising",
  },
};

// ─── Network graph data per city ──────────────────────────────────────────────
const networkData: Record<string, { nodes: NetworkNode[]; edges: NetworkEdge[] }> = {
  nairobi: {
    nodes: [
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.85, cascadeRisk: 0.72 },
      { id: "water", label: "Water Systems", sector: "Water", dependency: 0.78, cascadeRisk: 0.68 },
      { id: "finance", label: "M-Pesa Network", sector: "Finance", dependency: 0.70, cascadeRisk: 0.55 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.65, cascadeRisk: 0.50 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.58, cascadeRisk: 0.45 },
      { id: "infra", label: "Road Network", sector: "Infrastructure", dependency: 0.60, cascadeRisk: 0.40 },
      { id: "eco", label: "Ecosystem", sector: "Ecosystem", dependency: 0.40, cascadeRisk: 0.30 },
    ],
    edges: [
      { source: "energy", target: "water", strength: 0.9 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "water", target: "food", strength: 0.75 },
      { source: "finance", target: "food", strength: 0.6 },
      { source: "infra", target: "food", strength: 0.55 },
      { source: "infra", target: "health", strength: 0.5 },
      { source: "eco", target: "water", strength: 0.45 },
      { source: "finance", target: "health", strength: 0.4 },
    ],
  },
  lagos: {
    nodes: [
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.92, cascadeRisk: 0.88 },
      { id: "water", label: "Water Supply", sector: "Water", dependency: 0.82, cascadeRisk: 0.75 },
      { id: "finance", label: "Banking", sector: "Finance", dependency: 0.65, cascadeRisk: 0.52 },
      { id: "food", label: "Markets", sector: "Food", dependency: 0.75, cascadeRisk: 0.65 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.70, cascadeRisk: 0.60 },
      { id: "port", label: "Port System", sector: "Infrastructure", dependency: 0.80, cascadeRisk: 0.70 },
    ],
    edges: [
      { source: "energy", target: "water", strength: 0.95 },
      { source: "energy", target: "health", strength: 0.9 },
      { source: "port", target: "food", strength: 0.85 },
      { source: "water", target: "food", strength: 0.7 },
      { source: "finance", target: "food", strength: 0.6 },
      { source: "port", target: "energy", strength: 0.5 },
      { source: "health", target: "water", strength: 0.5 },
    ],
  },
  cairo: {
    nodes: [
      { id: "nile", label: "Nile Water", sector: "Water", dependency: 0.95, cascadeRisk: 0.85 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.78, cascadeRisk: 0.60 },
      { id: "agri", label: "Agriculture", sector: "Food", dependency: 0.72, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.60, cascadeRisk: 0.45 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.55, cascadeRisk: 0.40 },
      { id: "canal", label: "Suez Canal", sector: "Infrastructure", dependency: 0.70, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "nile", target: "agri", strength: 0.95 },
      { source: "nile", target: "energy", strength: 0.7 },
      { source: "agri", target: "finance", strength: 0.6 },
      { source: "canal", target: "finance", strength: 0.75 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "finance", target: "health", strength: 0.45 },
    ],
  },
  mumbai: {
    nodes: [
      { id: "finance", label: "Stock Exchange", sector: "Finance", dependency: 0.90, cascadeRisk: 0.78 },
      { id: "energy", label: "Grid", sector: "Energy", dependency: 0.82, cascadeRisk: 0.65 },
      { id: "water", label: "Reservoirs", sector: "Water", dependency: 0.75, cascadeRisk: 0.70 },
      { id: "port", label: "Port", sector: "Infrastructure", dependency: 0.85, cascadeRisk: 0.68 },
      { id: "health", label: "Hospitals", sector: "Health", dependency: 0.60, cascadeRisk: 0.45 },
      { id: "eco", label: "Mangroves", sector: "Ecosystem", dependency: 0.35, cascadeRisk: 0.55 },
    ],
    edges: [
      { source: "finance", target: "energy", strength: 0.8 },
      { source: "port", target: "finance", strength: 0.85 },
      { source: "water", target: "health", strength: 0.7 },
      { source: "eco", target: "water", strength: 0.6 },
      { source: "energy", target: "health", strength: 0.75 },
      { source: "port", target: "energy", strength: 0.65 },
    ],
  },
  saopaulo: {
    nodes: [
      { id: "water", label: "Cantareira", sector: "Water", dependency: 0.88, cascadeRisk: 0.72 },
      { id: "energy", label: "Grid", sector: "Energy", dependency: 0.75, cascadeRisk: 0.55 },
      { id: "finance", label: "B3 Exchange", sector: "Finance", dependency: 0.82, cascadeRisk: 0.60 },
      { id: "agri", label: "Agribusiness", sector: "Food", dependency: 0.70, cascadeRisk: 0.50 },
      { id: "eco", label: "Atlantic Forest", sector: "Ecosystem", dependency: 0.45, cascadeRisk: 0.65 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.60, cascadeRisk: 0.40 },
    ],
    edges: [
      { source: "water", target: "agri", strength: 0.9 },
      { source: "eco", target: "water", strength: 0.8 },
      { source: "finance", target: "energy", strength: 0.7 },
      { source: "agri", target: "finance", strength: 0.65 },
      { source: "energy", target: "health", strength: 0.75 },
      { source: "water", target: "health", strength: 0.55 },
    ],
  },
  jakarta: {
    nodes: [
      { id: "flood", label: "Flood Systems", sector: "Infrastructure", dependency: 0.95, cascadeRisk: 0.92 },
      { id: "water", label: "Groundwater", sector: "Water", dependency: 0.90, cascadeRisk: 0.88 },
      { id: "energy", label: "Power Grid", sector: "Energy", dependency: 0.78, cascadeRisk: 0.70 },
      { id: "food", label: "Food Supply", sector: "Food", dependency: 0.72, cascadeRisk: 0.65 },
      { id: "finance", label: "Finance", sector: "Finance", dependency: 0.65, cascadeRisk: 0.55 },
      { id: "health", label: "Healthcare", sector: "Health", dependency: 0.60, cascadeRisk: 0.58 },
    ],
    edges: [
      { source: "flood", target: "water", strength: 0.95 },
      { source: "water", target: "food", strength: 0.9 },
      { source: "flood", target: "energy", strength: 0.85 },
      { source: "energy", target: "health", strength: 0.8 },
      { source: "finance", target: "food", strength: 0.65 },
      { source: "water", target: "health", strength: 0.75 },
    ],
  },
};

// ─── Historical data per city ─────────────────────────────────────────────────
const historicalData: Record<string, { data: { month: string; score: number }[]; events: { month: string; label: string; severity: "critical" | "high" | "medium" }[] }> = {
  nairobi: {
    data: [
      { month: "Mar", score: 62 }, { month: "Apr", score: 64 }, { month: "May", score: 58 },
      { month: "Jun", score: 53 }, { month: "Jul", score: 51 }, { month: "Aug", score: 49 },
      { month: "Sep", score: 52 }, { month: "Oct", score: 55 }, { month: "Nov", score: 60 },
      { month: "Dec", score: 57 }, { month: "Jan", score: 56 }, { month: "Feb", score: 58 },
    ],
    events: [
      { month: "Jun", label: "Drought onset — water stress surge", severity: "high" },
      { month: "Aug", label: "Crop shortfall — 28% below average", severity: "critical" },
      { month: "Nov", label: "IMF credit facility approved", severity: "medium" },
    ],
  },
  lagos: {
    data: [
      { month: "Mar", score: 48 }, { month: "Apr", score: 50 }, { month: "May", score: 47 },
      { month: "Jun", score: 43 }, { month: "Jul", score: 40 }, { month: "Aug", score: 38 },
      { month: "Sep", score: 41 }, { month: "Oct", score: 43 }, { month: "Nov", score: 46 },
      { month: "Dec", score: 44 }, { month: "Jan", score: 43 }, { month: "Feb", score: 44 },
    ],
    events: [
      { month: "Jul", label: "Grid collapse — 48h blackout", severity: "critical" },
      { month: "Aug", label: "Flooding — 1.2M displaced", severity: "critical" },
      { month: "Nov", label: "Port workers strike resolved", severity: "medium" },
    ],
  },
  cairo: {
    data: [
      { month: "Mar", score: 60 }, { month: "Apr", score: 61 }, { month: "May", score: 63 },
      { month: "Jun", score: 65 }, { month: "Jul", score: 64 }, { month: "Aug", score: 63 },
      { month: "Sep", score: 62 }, { month: "Oct", score: 61 }, { month: "Nov", score: 63 },
      { month: "Dec", score: 64 }, { month: "Jan", score: 63 }, { month: "Feb", score: 62 },
    ],
    events: [
      { month: "May", label: "Nile flow improved — dam release", severity: "medium" },
      { month: "Sep", label: "Wheat import cost spike +22%", severity: "high" },
    ],
  },
  mumbai: {
    data: [
      { month: "Mar", score: 57 }, { month: "Apr", score: 59 }, { month: "May", score: 61 },
      { month: "Jun", score: 54 }, { month: "Jul", score: 50 }, { month: "Aug", score: 48 },
      { month: "Sep", score: 52 }, { month: "Oct", score: 54 }, { month: "Nov", score: 55 },
      { month: "Dec", score: 56 }, { month: "Jan", score: 55 }, { month: "Feb", score: 55 },
    ],
    events: [
      { month: "Jun", label: "Cyclone — coastal infrastructure damage", severity: "critical" },
      { month: "Aug", label: "Reservoir at 22% capacity", severity: "high" },
      { month: "Oct", label: "Emergency water allocation ended", severity: "medium" },
    ],
  },
  saopaulo: {
    data: [
      { month: "Mar", score: 65 }, { month: "Apr", score: 66 }, { month: "May", score: 68 },
      { month: "Jun", score: 70 }, { month: "Jul", score: 69 }, { month: "Aug", score: 67 },
      { month: "Sep", score: 66 }, { month: "Oct", score: 67 }, { month: "Nov", score: 68 },
      { month: "Dec", score: 67 }, { month: "Jan", score: 66 }, { month: "Feb", score: 67 },
    ],
    events: [
      { month: "Jun", label: "Harvest surplus — food buffer +18%", severity: "medium" },
      { month: "Sep", label: "Amazon fires — air quality crisis", severity: "high" },
    ],
  },
  jakarta: {
    data: [
      { month: "Mar", score: 42 }, { month: "Apr", score: 40 }, { month: "May", score: 41 },
      { month: "Jun", score: 38 }, { month: "Jul", score: 36 }, { month: "Aug", score: 35 },
      { month: "Sep", score: 37 }, { month: "Oct", score: 38 }, { month: "Nov", score: 40 },
      { month: "Dec", score: 39 }, { month: "Jan", score: 39 }, { month: "Feb", score: 39 },
    ],
    events: [
      { month: "Jun", label: "Coastal flooding — 3m inundation", severity: "critical" },
      { month: "Aug", label: "Groundwater subsidence accelerating", severity: "critical" },
      { month: "Nov", label: "Capital relocation plan announced", severity: "medium" },
    ],
  },
};

// ─── Static data ──────────────────────────────────────────────────────────────
const cityDimensions = (id: string) => {
  const s = cityDataset[id];
  return [
    { label: "Redund.", fullLabel: "Redundancy", value: s.subscores[0].value },
    { label: "Diversity", fullLabel: "Diversity", value: s.subscores[1].value },
    { label: "Buffer", fullLabel: "Buffer Capacity", value: s.subscores[2].value },
    { label: "Connect.", fullLabel: "Connectivity", value: s.subscores[3].value },
    { label: "Recovery", fullLabel: "Recovery Speed", value: s.subscores[4].value },
  ];
};

const tippingSignals = [
  { label: "Increasing output volatility", active: true, severity: "high" as const },
  { label: "Slower post-disturbance recovery", active: true, severity: "high" as const },
  { label: "Rising cross-sector correlation", active: false, severity: "medium" as const },
  { label: "Loss of biodiversity markers", active: true, severity: "medium" as const },
  { label: "Declining redundancy pathways", active: false, severity: "low" as const },
  { label: "Cascading micro-failures detected", active: true, severity: "high" as const },
];

const bufferData = [
  { label: "Water Reservoir", icon: "💧", current: 34, max: 100, unit: "M m³", dangerThreshold: 0.4 },
  { label: "Food Stockpile", icon: "🌾", current: 62, max: 100, unit: "days", dangerThreshold: 0.3 },
  { label: "Grid Battery Reserve", icon: "⚡", current: 55, max: 100, unit: "GWh", dangerThreshold: 0.35 },
  { label: "Financial Reserves", icon: "💰", current: 74, max: 100, unit: "B$", dangerThreshold: 0.25 },
];

const recoverySystemData = [
  { name: "Power Grid", color: "hsl(var(--accent))", recoveryDays: 14, data: [{ t: 0, val: 100 }, { t: 1, val: 22 }, { t: 3, val: 35 }, { t: 5, val: 55 }, { t: 7, val: 68 }, { t: 10, val: 80 }, { t: 14, val: 95 }, { t: 18, val: 100 }] },
  { name: "Water Systems", color: "hsl(198 90% 52%)", recoveryDays: 21, data: [{ t: 0, val: 100 }, { t: 1, val: 45 }, { t: 3, val: 50 }, { t: 7, val: 62 }, { t: 12, val: 74 }, { t: 18, val: 88 }, { t: 21, val: 96 }] },
  { name: "Food Supply", color: "hsl(var(--warn))", recoveryDays: 42, data: [{ t: 0, val: 100 }, { t: 1, val: 60 }, { t: 5, val: 55 }, { t: 10, val: 60 }, { t: 18, val: 72 }, { t: 28, val: 84 }, { t: 38, val: 92 }, { t: 42, val: 100 }] },
  { name: "Ecosystem", color: "hsl(var(--healthy))", recoveryDays: 90, data: [{ t: 0, val: 100 }, { t: 3, val: 40 }, { t: 10, val: 42 }, { t: 21, val: 50 }, { t: 35, val: 60 }, { t: 55, val: 74 }, { t: 75, val: 88 }, { t: 90, val: 97 }] },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Index = () => {
  const [selectedCityId, setSelectedCityId] = useState("nairobi");
  const [selectedCityLabel, setSelectedCityLabel] = useState({ name: "Nairobi", region: "East Africa" });
  const [liveMode, setLiveMode] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareCityAId, setCompareCityAId] = useState("nairobi");
  const [compareCityBId, setCompareCityBId] = useState("jakarta");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [drawerCity, setDrawerCity] = useState<CityData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<AlertEvent[]>([]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const handleCitySelect = (city: CityData) => {
    setSelectedCityId(city.id);
    setSelectedCityLabel({ name: city.name, region: city.region });
    setDrawerCity(city);
    setDrawerOpen(true);
  };

  const handleAlertsChange = useCallback((alerts: AlertEvent[]) => {
    setLiveAlerts(alerts);
  }, []);

  const cityInfo = cityDataset[selectedCityId];

  const { metrics: liveMetrics, lastUpdate, tickCount } = useLiveData(
    { score: cityInfo.score, subscores: cityInfo.subscores, tippingProbability: cityInfo.tippingProbability },
    liveMode
  );

  const displayedMetrics = liveMode ? liveMetrics : cityInfo;
  const netGraph = networkData[selectedCityId];
  const histData = historicalData[selectedCityId];

  // Data for the Planetary Risk Matrix
  const riskMatrixCities = Object.entries(cityDataset).map(([id, data]) => ({
    id,
    name: id === "saopaulo" ? "São Paulo" : id.charAt(0).toUpperCase() + id.slice(1),
    region: networkData[id] ? (
      id === "nairobi" ? "East Africa" :
      id === "lagos" ? "West Africa" :
      id === "cairo" ? "North Africa" :
      id === "mumbai" ? "South Asia" :
      id === "saopaulo" ? "South America" : "Southeast Asia"
    ) : "",
    score: data.score,
    tipping: data.tippingProbability,
  }));

  // Compare city objects
  const buildCompareCity = (id: string) => {
    const d = cityDataset[id];
    const label = id === "saopaulo" ? "São Paulo" : id.charAt(0).toUpperCase() + id.slice(1);
    const region =
      id === "nairobi" ? "East Africa" :
      id === "lagos" ? "West Africa" :
      id === "cairo" ? "North Africa" :
      id === "mumbai" ? "South Asia" :
      id === "saopaulo" ? "South America" : "Southeast Asia";
    return {
      id,
      name: label,
      region,
      score: d.score,
      subscores: d.subscores.map((s) => ({
        ...s,
        fullLabel: s.label === "REDUNDANCY" ? "Redundancy" :
          s.label === "DIVERSITY" ? "Diversity" :
          s.label === "BUFFER CAP." ? "Buffer Capacity" :
          s.label === "CONNECTIVITY" ? "Connectivity" : "Recovery Speed",
      })),
      tippingProbability: d.tippingProbability,
      trend: d.trend,
    };
  };

  const cityNameMap = Object.fromEntries(
    Object.keys(cityDataset).map((id) => [
      id,
      id === "saopaulo" ? "São Paulo" : id.charAt(0).toUpperCase() + id.slice(1),
    ])
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AtlasHeader theme={theme} onThemeToggle={() => setTheme((t) => t === "dark" ? "light" : "dark")} />

      <main className="flex-1 p-3 md:p-6 space-y-3 md:space-y-5 max-w-[1600px] mx-auto w-full">

        {/* Control toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between px-3 md:px-4 py-2.5 rounded-lg border border-border bg-card flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live feed toggle */}
            <button
              onClick={() => setLiveMode((v) => !v)}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded border transition-all ${
                liveMode
                  ? "border-healthy/50 bg-healthy/10 text-healthy"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${liveMode ? "bg-healthy pulse-dot" : "bg-muted-foreground"}`} />
              <RadioTower className="w-3 h-3" />
              <span className="hidden sm:inline">{liveMode ? "LIVE FEED ACTIVE" : "ENABLE LIVE FEED"}</span>
              <span className="sm:hidden">{liveMode ? "LIVE" : "OFFLINE"}</span>
            </button>
            <AnimatePresence>
              {liveMode && lastUpdate && (
                <motion.span
                  key={tickCount}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-mono text-muted-foreground hidden sm:inline"
                >
                  tick #{tickCount} · {lastUpdate.toLocaleTimeString()}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {/* Compare button */}
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 md:px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-accent/50 hover:text-accent transition-all"
            >
              <GitCompare className="w-3 h-3" />
              <span className="hidden sm:inline">COMPARE CITIES</span>
              <span className="sm:hidden">COMPARE</span>
            </button>
            {/* Export button */}
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 md:px-3 py-1.5 rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">EXPORT REPORT</span>
              <span className="sm:hidden">EXPORT</span>
            </button>
          </div>
        </motion.div>

        {/* Hero row: Map full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          <SystemStressMap onSelectCity={handleCitySelect} />
        </motion.div>

        {/* Alerts & Notifications panel — full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
          <AlertsPanel selectedCityId={selectedCityId} onAlertsChange={handleAlertsChange} />
        </motion.div>

        {/* Planetary Risk Matrix — full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
          <PlanetaryRiskMatrix
            cities={riskMatrixCities}
            selectedCityId={selectedCityId}
            onSelectCity={(id) => {
              const labels: Record<string, { name: string; region: string }> = {
                nairobi: { name: "Nairobi", region: "East Africa" },
                lagos: { name: "Lagos", region: "West Africa" },
                cairo: { name: "Cairo", region: "North Africa" },
                mumbai: { name: "Mumbai", region: "South Asia" },
                saopaulo: { name: "São Paulo", region: "South America" },
                jakarta: { name: "Jakarta", region: "Southeast Asia" },
              };
              setSelectedCityId(id);
              setSelectedCityLabel(labels[id]);
            }}
          />
        </motion.div>

        {/* Primary info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
            <ResilienceScoreRing
              key={`${selectedCityId}-${liveMode ? tickCount : 0}`}
              score={displayedMetrics.score}
              subscores={displayedMetrics.subscores}
              city={selectedCityLabel.name}
              region={selectedCityLabel.region}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}>
            <TippingPointMeter
              probability={displayedMetrics.tippingProbability}
              trend={cityInfo.trend}
              signals={tippingSignals}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <DimensionPanel dimensions={cityDimensions(selectedCityId)} />
          </motion.div>
        </div>

        {/* Network + Historical row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.4 }}>
            <NetworkFragilityGraph
              key={selectedCityId}
              nodes={netGraph.nodes}
              edges={netGraph.edges}
              cityName={selectedCityLabel.name}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.5 }}>
            <HistoricalTimeline
              cityName={selectedCityLabel.name}
              data={histData.data}
              shockEvents={histData.events}
            />
          </motion.div>
        </div>

        {/* Secondary row: Buffers + Recovery + Shock sim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.45 }}>
            <BufferGauges buffers={bufferData} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <RecoveryCurves systems={recoverySystemData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.65 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <ShockSimulator />
          </motion.div>
        </div>

        {/* Footer credit line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-[10px] font-mono text-muted-foreground pb-2"
        >
          ATLAS — Civilizational Resilience Monitor • Nature always chooses resilience over efficiency
        </motion.p>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showReport && (
          <CityReportExport
            cityName={selectedCityLabel.name}
            region={selectedCityLabel.region}
            score={displayedMetrics.score}
            subscores={displayedMetrics.subscores}
            tippingProbability={displayedMetrics.tippingProbability}
            trend={cityInfo.trend}
            shockEvents={histData.events}
            onClose={() => setShowReport(false)}
          />
        )}
        {showCompare && (
          <ComparativeMode
            cityA={buildCompareCity(compareCityAId)}
            cityB={buildCompareCity(compareCityBId)}
            onClose={() => setShowCompare(false)}
            allCityIds={Object.keys(cityDataset)}
            onChangeCityA={setCompareCityAId}
            onChangeCityB={setCompareCityBId}
            cityNames={cityNameMap}
          />
        )}
      </AnimatePresence>

      {/* City Detail Drawer */}
      <CityDetailDrawer
        city={drawerCity}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExport={() => { setDrawerOpen(false); setShowReport(true); }}
        onCompare={() => {
          if (drawerCity) {
            setCompareCityAId(drawerCity.id);
            setCompareCityBId(drawerCity.id === "jakarta" ? "saopaulo" : "jakarta");
          }
          setDrawerOpen(false);
          setShowCompare(true);
        }}
        alerts={liveAlerts}
        tippingProbability={cityInfo.tippingProbability}
        trend={cityInfo.trend}
      />
    </div>
  );
};

export default Index;
