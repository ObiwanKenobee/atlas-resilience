import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, GitCompare, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap } from "lucide-react";
import type { CityData } from "./SystemStressMap";
import type { AlertEvent } from "./AlertsPanel";

interface CityDetailDrawerProps {
  city: CityData | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onCompare: () => void;
  alerts: AlertEvent[];
  tippingProbability: number;
  trend: "rising" | "stable" | "falling";
}

const scoreColor = (score: number) => {
  if (score >= 70) return "hsl(var(--healthy))";
  if (score >= 50) return "hsl(var(--warn))";
  if (score >= 30) return "hsl(var(--stress))";
  return "hsl(var(--critical))";
};

const tippingColor = (prob: number) => {
  if (prob < 30) return "text-healthy";
  if (prob < 55) return "text-warn";
  if (prob < 75) return "text-stress";
  return "text-critical";
};

const SEV_STYLES = {
  critical: { text: "text-critical", bg: "bg-critical/10", border: "border-critical/30", label: "CRITICAL" },
  high: { text: "text-stress", bg: "bg-stress/10", border: "border-stress/30", label: "HIGH" },
  medium: { text: "text-warn", bg: "bg-warn/10", border: "border-warn/30", label: "MED" },
  low: { text: "text-healthy", bg: "bg-healthy/10", border: "border-healthy/30", label: "LOW" },
};

const TrendIcon = ({ trend }: { trend: "rising" | "stable" | "falling" }) => {
  if (trend === "rising") return <TrendingUp className="w-3.5 h-3.5 text-stress" />;
  if (trend === "falling") return <TrendingDown className="w-3.5 h-3.5 text-healthy" />;
  return <Minus className="w-3.5 h-3.5 text-warn" />;
};

const CityDetailDrawer = ({
  city,
  isOpen,
  onClose,
  onExport,
  onCompare,
  alerts,
  tippingProbability,
  trend,
}: CityDetailDrawerProps) => {
  if (!city) return null;

  const cityAlerts = alerts
    .filter((a) => a.cityId === city.id && a.status !== "resolved")
    .sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 };
      return sev[a.severity] - sev[b.severity];
    })
    .slice(0, 2);

  const tippingClass = tippingColor(tippingProbability);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[360px] flex flex-col bg-card border-l border-border shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Score ring — tiny */}
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: scoreColor(city.score) }}
                >
                  <span
                    className="text-sm font-bold font-mono"
                    style={{ color: scoreColor(city.score) }}
                  >
                    {city.score}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground leading-tight">{city.name}</h2>
                  <p className="text-[11px] font-mono text-muted-foreground">{city.region}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {city.sectors.map((s) => (
                      <span
                        key={s.name}
                        className={`w-1.5 h-1.5 rounded-full`}
                        style={{
                          backgroundColor:
                            s.status === "resilient" ? "hsl(var(--healthy))" :
                            s.status === "moderate" ? "hsl(var(--warn))" :
                            s.status === "stressed" ? "hsl(var(--stress))" :
                            "hsl(var(--critical))",
                        }}
                        title={`${s.name}: ${s.status}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Tipping Probability */}
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                    Tipping Probability
                  </p>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={trend} />
                    <span className="text-[10px] font-mono text-muted-foreground capitalize">{trend}</span>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold font-mono ${tippingClass}`}>
                    {tippingProbability}%
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground mb-1">
                    {tippingProbability >= 75 ? "COLLAPSE RISK" :
                     tippingProbability >= 55 ? "EMERGENCY" :
                     tippingProbability >= 30 ? "WATCH LIST" : "SAFE ZONE"}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: `hsl(var(--${tippingProbability >= 75 ? "critical" : tippingProbability >= 55 ? "stress" : tippingProbability >= 30 ? "warn" : "healthy"}))` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${tippingProbability}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Sector breakdown */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
                  Sector Status
                </p>
                <div className="space-y-1.5">
                  {city.sectors.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-xs px-3 py-2 rounded border border-border bg-muted/10"
                    >
                      <span className="text-foreground/80 font-medium">{s.name}</span>
                      <span
                        className="font-mono font-bold text-[11px] capitalize"
                        style={{
                          color:
                            s.status === "resilient" ? "hsl(var(--healthy))" :
                            s.status === "moderate" ? "hsl(var(--warn))" :
                            s.status === "stressed" ? "hsl(var(--stress))" :
                            "hsl(var(--critical))",
                        }}
                      >
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top active alerts */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-warn" />
                  <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                    Active Alerts
                  </p>
                </div>
                {cityAlerts.length === 0 ? (
                  <div className="text-[11px] font-mono text-muted-foreground/60 text-center py-4 rounded border border-border border-dashed">
                    No active alerts
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cityAlerts.map((alert) => {
                      const sev = SEV_STYLES[alert.severity];
                      return (
                        <div
                          key={alert.id}
                          className={`rounded border p-3 ${sev.bg} ${sev.border}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className={`w-3 h-3 ${sev.text}`} />
                            <span className={`text-[10px] font-mono font-bold ${sev.text}`}>
                              {sev.label}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {alert.sector}
                            </span>
                          </div>
                          <p className="text-[11px] text-foreground/80 leading-tight">{alert.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex-shrink-0 p-4 border-t border-border grid grid-cols-2 gap-2">
              <button
                onClick={onExport}
                className="flex items-center justify-center gap-2 text-xs font-mono px-3 py-2.5 rounded border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                EXPORT REPORT
              </button>
              <button
                onClick={onCompare}
                className="flex items-center justify-center gap-2 text-xs font-mono px-3 py-2.5 rounded border border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 transition-all"
              >
                <GitCompare className="w-3.5 h-3.5" />
                COMPARE
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CityDetailDrawer;
