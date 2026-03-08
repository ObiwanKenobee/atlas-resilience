import { useState } from "react";
import { motion } from "framer-motion";
import AtlasHeader from "@/components/atlas/AtlasHeader";
import ResilienceScoreRing from "@/components/atlas/ResilienceScoreRing";
import TippingPointMeter from "@/components/atlas/TippingPointMeter";
import DimensionPanel from "@/components/atlas/DimensionPanel";
import ShockSimulator from "@/components/atlas/ShockSimulator";
import SystemStressMap from "@/components/atlas/SystemStressMap";
import BufferGauges from "@/components/atlas/BufferGauges";
import RecoveryCurves from "@/components/atlas/RecoveryCurves";
import type { CityData } from "@/components/atlas/SystemStressMap";

// City dataset
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
  {
    name: "Power Grid",
    color: "hsl(var(--accent))",
    recoveryDays: 14,
    data: [
      { t: 0, val: 100 }, { t: 1, val: 22 }, { t: 3, val: 35 }, { t: 5, val: 55 },
      { t: 7, val: 68 }, { t: 10, val: 80 }, { t: 14, val: 95 }, { t: 18, val: 100 },
    ],
  },
  {
    name: "Water Systems",
    color: "hsl(198 90% 52%)",
    recoveryDays: 21,
    data: [
      { t: 0, val: 100 }, { t: 1, val: 45 }, { t: 3, val: 50 }, { t: 7, val: 62 },
      { t: 12, val: 74 }, { t: 18, val: 88 }, { t: 21, val: 96 },
    ],
  },
  {
    name: "Food Supply",
    color: "hsl(var(--warn))",
    recoveryDays: 42,
    data: [
      { t: 0, val: 100 }, { t: 1, val: 60 }, { t: 5, val: 55 }, { t: 10, val: 60 },
      { t: 18, val: 72 }, { t: 28, val: 84 }, { t: 38, val: 92 }, { t: 42, val: 100 },
    ],
  },
  {
    name: "Ecosystem",
    color: "hsl(var(--healthy))",
    recoveryDays: 90,
    data: [
      { t: 0, val: 100 }, { t: 3, val: 40 }, { t: 10, val: 42 }, { t: 21, val: 50 },
      { t: 35, val: 60 }, { t: 55, val: 74 }, { t: 75, val: 88 }, { t: 90, val: 97 },
    ],
  },
];



const Index = () => {
  const [selectedCityId, setSelectedCityId] = useState("nairobi");
  const [selectedCityLabel, setSelectedCityLabel] = useState({ name: "Nairobi", region: "East Africa" });

  const handleCitySelect = (city: CityData) => {
    setSelectedCityId(city.id);
    setSelectedCityLabel({ name: city.name, region: city.region });
  };

  const cityInfo = cityDataset[selectedCityId];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AtlasHeader />

      <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Hero row: Map full width */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
          <SystemStressMap onSelectCity={handleCitySelect} />
        </motion.div>

        {/* Primary info row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}>
            <ResilienceScoreRing
              score={cityInfo.score}
              subscores={cityInfo.subscores}
              city={selectedCityLabel.name}
              region={selectedCityLabel.region}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}>
            <TippingPointMeter
              probability={cityInfo.tippingProbability}
              trend={cityInfo.trend}
              signals={tippingSignals}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.35 }}>
            <DimensionPanel dimensions={cityDimensions(selectedCityId)} />
          </motion.div>
        </div>

        {/* Secondary row: Buffers + Recovery + Shock sim */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.45 }}>
            <BufferGauges buffers={bufferData} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <RecoveryCurves systems={recoverySystemData} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.65 }}>
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
    </div>
  );
};

export default Index;
