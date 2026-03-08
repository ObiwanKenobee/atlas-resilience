import { useRef } from "react";
import { motion } from "framer-motion";
import { Download, FileText, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

interface ReportSubscore {
  label: string;
  value: number;
  icon: string;
}

interface ReportShockEvent {
  month: string;
  label: string;
  severity: "critical" | "high" | "medium";
}

interface CityReportExportProps {
  cityName: string;
  region: string;
  score: number;
  subscores: ReportSubscore[];
  tippingProbability: number;
  trend: "rising" | "stable" | "falling";
  shockEvents: ReportShockEvent[];
  onClose: () => void;
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

const generateRecommendation = (subscores: ReportSubscore[], tipping: number): string[] => {
  const sorted = [...subscores].sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const recs: string[] = [];
  if (weakest.value < 40) {
    recs.push(`Critical: ${weakest.label.toLowerCase()} at ${weakest.value}/100 — system resilience floor. Immediate investment required.`);
  }
  if (tipping > 60) {
    recs.push(`Tipping probability ${tipping}% exceeds critical threshold. Early warning signals active — pre-emptive intervention window is narrow.`);
  }
  const bufferScore = subscores.find((s) => s.label.includes("BUFFER"))?.value ?? 50;
  if (bufferScore < 45) {
    recs.push("Buffer capacity below safe margin. Build strategic reserves (water, food, energy) before next seasonal shock.");
  }
  const diversity = subscores.find((s) => s.label.includes("DIVERSITY"))?.value ?? 50;
  if (diversity < 55) {
    recs.push("Low diversity score indicates monoculture risk. Diversify supply chains and energy mix to reduce single-point failure exposure.");
  }
  if (recs.length === 0) {
    recs.push("System within acceptable parameters. Maintain current redundancy levels and continue monitoring buffer capacity trends.");
  }
  return recs;
};

const severityIcon = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
};

const CityReportExport = ({
  cityName,
  region,
  score,
  subscores,
  tippingProbability,
  trend,
  shockEvents,
  onClose,
}: CityReportExportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const recommendations = generateRecommendation(subscores, tippingProbability);

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Report card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        ref={reportRef}
      >
        <div className="card-atlas border-border">
          {/* Report header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-card to-muted/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                  Atlas Resilience Report
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Print / Save PDF
                </button>
                <button
                  onClick={onClose}
                  className="text-xs font-mono px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">{cityName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{region} · {reportDate}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-4xl font-bold font-mono" style={{ color: getColor(score) }}>
                  {score}
                </div>
                <div className="text-xs font-mono" style={{ color: getColor(score) }}>
                  {getLabel(score)} / 100
                </div>
              </div>
            </div>
          </div>

          {/* Scores section */}
          <div className="p-6 border-b border-border space-y-4">
            <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
              Resilience Dimension Scores
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {subscores.map((sub) => (
                <div key={sub.label} className="flex items-center gap-3">
                  <span className="text-sm w-4">{sub.icon}</span>
                  <span className="text-xs font-mono text-muted-foreground w-28">{sub.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sub.value}%`,
                        backgroundColor: getColor(sub.value),
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-bold w-8 text-right"
                    style={{ color: getColor(sub.value) }}
                  >
                    {Math.round(sub.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tipping point */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
                  Tipping Point Status
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${tippingProbability}%`,
                        background: "linear-gradient(90deg, hsl(var(--healthy)), hsl(var(--warn)), hsl(var(--critical)))",
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold font-mono"
                    style={{ color: getColor(100 - tippingProbability) }}
                  >
                    {tippingProbability}%
                  </span>
                </div>
              </div>
              <div
                className="text-xs font-mono px-2.5 py-1 rounded border flex items-center gap-1.5"
                style={{
                  color: getColor(100 - tippingProbability),
                  borderColor: `${getColor(100 - tippingProbability)}40`,
                  backgroundColor: `${getColor(100 - tippingProbability)}14`,
                }}
              >
                {trend === "rising" ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span>Trend: {trend.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Shock events */}
          {shockEvents.length > 0 && (
            <div className="p-6 border-b border-border space-y-3">
              <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                Recent Shock Events (12 months)
              </h3>
              <div className="space-y-1.5">
                {shockEvents.map((ev) => (
                  <div key={ev.month} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-muted-foreground w-8 flex-shrink-0">{ev.month}</span>
                    <span className="mr-1">{severityIcon[ev.severity]}</span>
                    <span className="text-foreground flex-1">{ev.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warn" />
              <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                Atlas Recommendations
              </h3>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-xs p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <span className="font-mono text-accent font-bold flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <p className="text-[10px] font-mono text-muted-foreground text-center">
              ATLAS Civilizational Resilience Monitor · Generated {reportDate} · Data reflects modeled resilience indicators
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CityReportExport;
