import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle, Zap, Droplets, TrendingDown, Wind, ShieldAlert, RefreshCw, Volume2, VolumeX, Rss, ExternalLink } from "lucide-react";
import { useAlertSound } from "@/hooks/useAlertSound";
import { useGeoPoliticalFeed } from "@/hooks/useGeoPoliticalFeed";

export interface AlertEvent {
  id: string;
  cityId: string;
  city: string;
  severity: "critical" | "high" | "medium" | "low";
  sector: string;
  message: string;
  timestamp: Date;
  status: "active" | "monitoring" | "resolved";
}

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  Water: <Droplets className="w-3 h-3" />,
  Energy: <Zap className="w-3 h-3" />,
  Finance: <TrendingDown className="w-3 h-3" />,
  Food: <Wind className="w-3 h-3" />,
  Infrastructure: <ShieldAlert className="w-3 h-3" />,
  Ecosystem: <Wind className="w-3 h-3" />,
  Health: <AlertTriangle className="w-3 h-3" />,
};

const SEED_ALERTS: Omit<AlertEvent, "timestamp">[] = [
  { id: "a1", cityId: "jakarta", city: "Jakarta", severity: "critical", sector: "Infrastructure", message: "Flood defence systems at 8% operational capacity — cascade imminent", status: "active" },
  { id: "a2", cityId: "jakarta", city: "Jakarta", severity: "critical", sector: "Water", message: "Groundwater subsidence rate +2.1 cm/yr — critical threshold breached", status: "active" },
  { id: "a3", cityId: "lagos", city: "Lagos", severity: "critical", sector: "Energy", message: "Grid voltage instability detected — rolling blackout risk 78%", status: "active" },
  { id: "a4", cityId: "lagos", city: "Lagos", severity: "high", sector: "Water", message: "Water treatment capacity down to 41% — contamination risk rising", status: "monitoring" },
  { id: "a5", cityId: "mumbai", city: "Mumbai", severity: "high", sector: "Water", message: "Reservoir levels at 22% — emergency rationing protocol activated", status: "active" },
  { id: "a6", cityId: "nairobi", city: "Nairobi", severity: "high", sector: "Food", message: "Crop yield projections revised -31% — food price shock likely Q2", status: "monitoring" },
  { id: "a7", cityId: "mumbai", city: "Mumbai", severity: "high", sector: "Infrastructure", message: "Coastal erosion accelerating — 3 drainage nodes compromised", status: "monitoring" },
  { id: "a8", cityId: "cairo", city: "Cairo", severity: "medium", sector: "Food", message: "Wheat import cost +22% — buffer stockpile drawdown in progress", status: "monitoring" },
  { id: "a9", cityId: "nairobi", city: "Nairobi", severity: "medium", sector: "Finance", message: "M-Pesa transaction failures +4.2% — redundancy pathways degrading", status: "monitoring" },
  { id: "a10", cityId: "saopaulo", city: "São Paulo", severity: "medium", sector: "Ecosystem", message: "Amazon fire corridor within 80km — air quality index critical", status: "active" },
  { id: "a11", cityId: "cairo", city: "Cairo", severity: "low", sector: "Energy", message: "Solar capacity additions online — grid diversity improving", status: "resolved" },
  { id: "a12", cityId: "saopaulo", city: "São Paulo", severity: "low", sector: "Finance", message: "B3 volatility index elevated — macro stress signal weak", status: "resolved" },
];

const NEW_ALERT_TEMPLATES: Omit<AlertEvent, "id" | "timestamp">[] = [
  { cityId: "jakarta", city: "Jakarta", severity: "critical", sector: "Water", message: "Saltwater intrusion detected in 6 freshwater wells", status: "active" },
  { cityId: "lagos", city: "Lagos", severity: "high", sector: "Food", message: "Market supply disruption — 3 arterial roads flooded", status: "active" },
  { cityId: "mumbai", city: "Mumbai", severity: "high", sector: "Finance", message: "Micro-credit default rate spike +8.3% — financial stress emerging", status: "monitoring" },
  { cityId: "nairobi", city: "Nairobi", severity: "medium", sector: "Health", message: "Healthcare worker shortage at 34% in periurban zones", status: "monitoring" },
  { cityId: "cairo", city: "Cairo", severity: "medium", sector: "Water", message: "Nile flow rate 12% below seasonal average", status: "monitoring" },
  { cityId: "saopaulo", city: "São Paulo", severity: "low", sector: "Energy", message: "Hydroelectric output recovering — drought buffer restoring", status: "resolved" },
];

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const SEV_STYLES = {
  critical: { text: "text-critical", bg: "bg-critical/10", border: "border-critical/30", dot: "bg-critical", label: "CRITICAL" },
  high:     { text: "text-stress",   bg: "bg-stress/10",   border: "border-stress/30",   dot: "bg-stress",   label: "HIGH" },
  medium:   { text: "text-warn",     bg: "bg-warn/10",     border: "border-warn/30",     dot: "bg-warn",     label: "MEDIUM" },
  low:      { text: "text-healthy",  bg: "bg-healthy/10",  border: "border-healthy/30",  dot: "bg-healthy",  label: "LOW" },
};

const STATUS_STYLES = {
  active:     "text-critical border-critical/40 bg-critical/10",
  monitoring: "text-warn border-warn/40 bg-warn/10",
  resolved:   "text-healthy border-healthy/40 bg-healthy/10",
};

interface AlertsPanelProps {
  selectedCityId?: string;
  /** Lifted-state setter so drawer can read top-2 city alerts */
  onAlertsChange?: (alerts: AlertEvent[]) => void;
}

// Use a ref-based counter scoped to the component mount to avoid duplicate keys
// across React StrictMode double-invocations.
const AlertsPanel = ({ selectedCityId, onAlertsChange }: AlertsPanelProps) => {
  const alertCounterRef = useRef(Date.now());
  const [alerts, setAlerts] = useState<AlertEvent[]>(() =>
    SEED_ALERTS.map((a, i) => ({
      ...a,
      timestamp: new Date(Date.now() - (SEED_ALERTS.length - i) * 47000),
    })).sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
  );
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(true);
  const [muted, setMuted] = useState(false);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { playPing } = useAlertSound(muted);

  // ─── Geopolitical live feed ────────────────────────────────────────────────
  const { events: geoEvents, loading: geoLoading, error: geoError, lastFetch: geoLastFetch, refresh: geoRefresh } = useGeoPoliticalFeed(showLiveFeed);

  // Propagate alerts up to parent when changed
  useEffect(() => {
    onAlertsChange?.(alerts);
  }, [alerts, onAlertsChange]);

  // Simulate incoming live alerts every ~8-14 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const template = NEW_ALERT_TEMPLATES[Math.floor(Math.random() * NEW_ALERT_TEMPLATES.length)];
      const newAlert: AlertEvent = {
        ...template,
        id: `live-${++alertCounterRef.current}`,
        timestamp: new Date(),
      };

      // Play ping for CRITICAL alerts
      if (newAlert.severity === "critical") {
        playPing();
      }

      setAlerts((prev) => {
        const updated = [newAlert, ...prev].slice(0, 40);
        return updated.sort((a, b) => {
          const sevDiff = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
          if (sevDiff !== 0) return sevDiff;
          return b.timestamp.getTime() - a.timestamp.getTime();
        });
      });
    }, 10000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [playPing]);

  const filtered = alerts.filter((a) => {
    const matchSev = filter === "all" || a.severity === filter;
    const matchCity = cityFilter === "all" || a.cityId === cityFilter;
    return matchSev && matchCity;
  });

  const critCount = alerts.filter((a) => a.severity === "critical" && a.status === "active").length;
  const highCount = alerts.filter((a) => a.severity === "high" && a.status !== "resolved").length;

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "resolved" as const } : a));
  };

  const timeSince = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const cities = [
    { id: "all", name: "All Cities" },
    { id: "nairobi", name: "Nairobi" },
    { id: "lagos", name: "Lagos" },
    { id: "cairo", name: "Cairo" },
    { id: "mumbai", name: "Mumbai" },
    { id: "saopaulo", name: "São Paulo" },
    { id: "jakarta", name: "Jakarta" },
  ];

  return (
    <div className="card-atlas rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border cursor-pointer select-none"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-4 h-4 text-warn" />
            {critCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-critical text-[8px] font-bold text-white flex items-center justify-center">
                {critCount}
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-foreground tracking-widest uppercase">
            Risk Alerts Feed
          </span>
          <div className="flex items-center gap-1.5">
            {critCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-critical/30 bg-critical/10 text-critical">
                {critCount} CRITICAL
              </span>
            )}
            {highCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-stress/30 bg-stress/10 text-stress">
                {highCount} HIGH
              </span>
            )}
          </div>
          {/* Live pulse */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-healthy pulse-dot" />
            <span>LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Geo Feed toggle */}
          <button
            onClick={() => setShowLiveFeed((v) => !v)}
            className={`flex items-center gap-1 p-1.5 rounded border transition-all text-[10px] font-mono ${
              showLiveFeed
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
            title={showLiveFeed ? "Hide live geo feed" : "Show live geopolitical feed"}
          >
            <Rss className="w-3 h-3" />
            <span className="hidden sm:inline">GEO FEED</span>
          </button>
          {/* Mute toggle */}
          <button
            onClick={() => setMuted((v) => !v)}
            className={`p-1.5 rounded border transition-all ${
              muted
                ? "border-muted-foreground/30 text-muted-foreground/50 hover:border-muted-foreground/60 hover:text-muted-foreground"
                : "border-warn/40 text-warn hover:border-warn/70"
            }`}
            title={muted ? "Unmute critical alert sound" : "Mute alert sound"}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] font-mono text-muted-foreground">{filtered.length} events</span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Filter bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border flex-wrap">
              {/* Severity filters */}
              <div className="flex items-center gap-1 flex-wrap">
                {(["all", "critical", "high", "medium", "low"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setFilter(sev)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono border transition-all ${
                      filter === sev
                        ? sev === "all"
                          ? "border-foreground/30 bg-foreground/10 text-foreground"
                          : `${SEV_STYLES[sev as keyof typeof SEV_STYLES]?.bg} ${SEV_STYLES[sev as keyof typeof SEV_STYLES]?.border} ${SEV_STYLES[sev as keyof typeof SEV_STYLES]?.text}`
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {sev === "all" ? "ALL" : SEV_STYLES[sev].label}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-border mx-1" />
              {/* City filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-[10px] font-mono bg-card border border-border text-muted-foreground rounded px-2 py-0.5 focus:outline-none focus:border-accent/50 cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {/* Refresh icon */}
              <button
                onClick={() => setAlerts((prev) => [...prev].sort((a, b) => {
                  const sevDiff = SEV_ORDER[a.severity] - SEV_ORDER[b.severity];
                  if (sevDiff !== 0) return sevDiff;
                  return b.timestamp.getTime() - a.timestamp.getTime();
                }))}
                className="ml-auto p-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all"
                title="Re-sort"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Alert list */}
            <div
              ref={listRef}
              className="max-h-72 overflow-y-auto divide-y divide-border/50"
            >
              <AnimatePresence>
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-[11px] font-mono text-muted-foreground">
                    No events match current filters
                  </div>
                )}
                {filtered.map((alert) => {
                  const sev = SEV_STYLES[alert.severity];
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start gap-3 px-4 py-2.5 group hover:bg-muted/20 transition-colors ${
                        alert.status === "resolved" ? "opacity-50" : ""
                      }`}
                    >
                      {/* Severity dot */}
                      <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                        <span className={`w-2 h-2 rounded-full ${sev.dot} ${alert.status === "active" ? "pulse-dot" : ""}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sev.bg} ${sev.border} ${sev.text}`}>
                            {sev.label}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground font-bold">
                            {alert.city}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70">
                            {SECTOR_ICONS[alert.sector]}
                            {alert.sector}
                          </span>
                          <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[alert.status]}`}>
                            {alert.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80 mt-0.5 leading-tight">{alert.message}</p>
                        <span className="text-[10px] font-mono text-muted-foreground/50 mt-0.5 block">
                          {timeSince(alert.timestamp)}
                        </span>
                      </div>

                      {/* Dismiss */}
                      {alert.status !== "resolved" && (
                        <button
                          onClick={() => dismiss(alert.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                          title="Mark resolved"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer summary */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span>{alerts.filter((a) => a.status === "active").length} active</span>
                <span>{alerts.filter((a) => a.status === "monitoring").length} monitoring</span>
                <span>{alerts.filter((a) => a.status === "resolved").length} resolved</span>
              </div>
              <div className="flex items-center gap-2">
                {muted && (
                  <span className="text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1">
                    <VolumeX className="w-3 h-3" />
                    SOUND OFF
                  </span>
                )}
                <span className="text-[10px] font-mono text-muted-foreground/40">
                  AUTO-REFRESH 10s
                </span>
              </div>
            </div>

            {/* ── Live Geopolitical Feed ──────────────────────────────────────── */}
            <AnimatePresence>
              {showLiveFeed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-accent/5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-accent">
                      <Rss className="w-3 h-3" />
                      <span className="font-bold tracking-widest">RELIEFWEB LIVE FEED</span>
                      {geoLoading && <span className="text-muted-foreground animate-pulse">fetching…</span>}
                      {geoLastFetch && !geoLoading && (
                        <span className="text-muted-foreground/50">
                          updated {Math.round((Date.now() - geoLastFetch.getTime()) / 1000 / 60)}m ago
                        </span>
                      )}
                    </div>
                    <button
                      onClick={geoRefresh}
                      className="p-1 rounded border border-border text-muted-foreground hover:text-foreground transition-all"
                      title="Refresh feed"
                    >
                      <RefreshCw className={`w-3 h-3 ${geoLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {geoError && (
                    <div className="px-4 py-3 text-[11px] font-mono text-muted-foreground">
                      {geoError} — showing cached alerts above
                    </div>
                  )}

                  <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
                    {geoEvents.length === 0 && !geoLoading && !geoError && (
                      <div className="py-6 text-center text-[11px] font-mono text-muted-foreground">
                        No events loaded
                      </div>
                    )}
                    {geoEvents.map((event) => {
                      const sev = SEV_STYLES[event.severity];
                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/15 transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${sev.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sev.bg} ${sev.border} ${sev.text}`}>
                                {sev.label}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground font-bold">{event.city}</span>
                              <span className="text-[10px] font-mono text-muted-foreground/70">{event.sector}</span>
                              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                                {event.source}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 mt-0.5 leading-tight line-clamp-2">{event.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-muted-foreground/50">
                                {event.publishedAt.toLocaleDateString()}
                              </span>
                              {event.url && (
                                <a
                                  href={event.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-0.5 text-[10px] font-mono text-accent/70 hover:text-accent transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  source
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsPanel;
