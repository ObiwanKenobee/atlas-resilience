import { motion } from "framer-motion";
import { Activity, Globe, AlertTriangle } from "lucide-react";

const AtlasHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
            <Globe className="w-4 h-4 text-healthy" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-healthy pulse-dot" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            ATLAS
          </h1>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Civilizational Resilience Monitor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <Activity className="w-3 h-3 text-healthy" />
          <span>LIVE FEED</span>
          <span className="text-healthy">●</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <StatusPill label="SYSTEMS" value="147" color="healthy" />
          <StatusPill label="ALERTS" value="12" color="warn" />
          <StatusPill label="CRITICAL" value="3" color="critical" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <AlertTriangle className="w-3 h-3 text-warn" />
          <span className="hidden lg:inline">
            {new Date().toISOString().slice(0, 16).replace("T", " ")} UTC
          </span>
        </div>
      </div>
    </motion.header>
  );
};

const StatusPill = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "healthy" | "warn" | "critical";
}) => {
  const colorMap = {
    healthy: "text-healthy border-healthy/30 bg-healthy/10",
    warn: "text-warn border-warn/30 bg-warn/10",
    critical: "text-critical border-critical/30 bg-critical/10",
  };
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${colorMap[color]}`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
};

export default AtlasHeader;
