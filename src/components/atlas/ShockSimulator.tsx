import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, RotateCcw } from "lucide-react";

const scenarios = [
  {
    id: "crop-failure",
    label: "40% Crop Failure",
    icon: "🌾",
    sector: "Agriculture",
    description: "Rift Valley crop yield collapses due to drought",
    effects: [
      { label: "Food price surge", probability: 87, severity: "critical" as const },
      { label: "Urban migration pressure", probability: 64, severity: "high" as const },
      { label: "Microfinance default risk", probability: 52, severity: "high" as const },
      { label: "Political tension index", probability: 41, severity: "medium" as const },
      { label: "Healthcare system strain", probability: 33, severity: "medium" as const },
      { label: "Export revenue loss", probability: 78, severity: "high" as const },
    ],
    cascade: [0, 1, 3, 2, 4, 5],
  },
  {
    id: "power-outage",
    label: "Grid Collapse 48h",
    icon: "⚡",
    sector: "Energy",
    description: "Major grid failure across urban centers",
    effects: [
      { label: "Hospital backup failure", probability: 71, severity: "critical" as const },
      { label: "Supply chain disruption", probability: 83, severity: "critical" as const },
      { label: "Financial system halt", probability: 60, severity: "high" as const },
      { label: "Water pump failure", probability: 44, severity: "high" as const },
      { label: "Civil unrest probability", probability: 29, severity: "medium" as const },
      { label: "Cold chain loss (food)", probability: 55, severity: "high" as const },
    ],
    cascade: [1, 0, 3, 2, 5, 4],
  },
  {
    id: "financial-shock",
    label: "Currency Crisis −35%",
    icon: "📉",
    sector: "Finance",
    description: "Rapid currency devaluation and credit freeze",
    effects: [
      { label: "Import cost spike", probability: 91, severity: "critical" as const },
      { label: "SME loan defaults", probability: 67, severity: "high" as const },
      { label: "Inflation acceleration", probability: 84, severity: "critical" as const },
      { label: "FDI withdrawal", probability: 58, severity: "high" as const },
      { label: "Poverty rate increase", probability: 72, severity: "high" as const },
      { label: "Healthcare access drop", probability: 45, severity: "medium" as const },
    ],
    cascade: [2, 0, 1, 4, 3, 5],
  },
];

const severityColor = {
  critical: "hsl(var(--critical))",
  high: "hsl(var(--stress))",
  medium: "hsl(var(--warn))",
  low: "hsl(var(--healthy))",
};

const ShockSimulator = () => {
  const [selected, setSelected] = useState(scenarios[0]);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);

  const runSimulation = () => {
    setRunning(true);
    setRevealed([]);
    const order = selected.cascade;
    order.forEach((idx, i) => {
      setTimeout(() => {
        setRevealed((prev) => [...prev, idx]);
        if (i === order.length - 1) setRunning(false);
      }, 300 + i * 400);
    });
  };

  const reset = () => {
    setRevealed([]);
    setRunning(false);
  };

  return (
    <div className="card-atlas p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Shock Simulation Mode
          </p>
          <h3 className="text-base font-bold text-foreground mt-0.5">
            Cascade Wave Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            disabled={running}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={runSimulation}
            disabled={running}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            <span>{running ? "SIMULATING..." : "RUN SCENARIO"}</span>
          </button>
        </div>
      </div>

      {/* Scenario selector */}
      <div className="grid grid-cols-3 gap-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelected(s); reset(); }}
            className={`text-left p-3 rounded-lg border transition-all ${
              selected.id === s.id
                ? "border-accent/50 bg-accent/10"
                : "border-border hover:border-border/80 bg-muted/30"
            }`}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-xs font-bold text-foreground leading-tight">
              {s.label}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {s.sector}
            </div>
          </button>
        ))}
      </div>

      {/* Scenario description */}
      <div className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2 border-l-2 border-accent/50">
        <span className="text-foreground font-medium">Scenario: </span>
        {selected.description}
      </div>

      {/* Cascade effects */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Propagation Effects
        </p>
        <div className="space-y-2">
          {selected.effects.map((effect, i) => (
            <AnimatePresence key={`${selected.id}-${i}`}>
              {revealed.includes(i) ? (
                <motion.div
                  initial={{ opacity: 0, x: -16, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex items-center gap-3"
                >
                  <Zap
                    className="w-3 h-3 flex-shrink-0"
                    style={{ color: severityColor[effect.severity] }}
                  />
                  <span className="text-xs text-foreground flex-1">
                    {effect.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: severityColor[effect.severity] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${effect.probability}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono font-bold w-8 text-right"
                      style={{ color: severityColor[effect.severity] }}
                    >
                      {effect.probability}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 opacity-20">
                  <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                  <div className="h-1.5 rounded flex-1 bg-muted" />
                  <div className="w-8" />
                </div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {revealed.length === selected.effects.length && revealed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono text-critical bg-critical/10 border border-critical/25 rounded px-3 py-2"
        >
          ⚡ Simulation complete — {selected.effects.filter(e => e.severity === "critical").length} critical cascade paths detected
        </motion.div>
      )}
    </div>
  );
};

export default ShockSimulator;
