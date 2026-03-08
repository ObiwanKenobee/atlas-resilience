import { motion } from "framer-motion";
import { Activity, Globe, AlertTriangle, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

interface AtlasHeaderProps {
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

const AtlasHeader = ({ theme, onThemeToggle }: AtlasHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-healthy" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-healthy pulse-dot" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
              ATLAS
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
              Civilizational Resilience Monitor
            </p>
          </div>
        </div>

        {/* Desktop status pills + controls */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
            <Activity className="w-3 h-3 text-healthy" />
            <span>LIVE FEED</span>
            <span className="text-healthy">●</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
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

          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <StatusPill label="CRIT" value="3" color="critical" />
          </div>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile expanded menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden px-4 pb-3 flex items-center flex-wrap gap-2 border-t border-border/50"
        >
          <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground pt-3">
            <Activity className="w-3 h-3 text-healthy" />
            <span>LIVE FEED ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <StatusPill label="SYSTEMS" value="147" color="healthy" />
            <StatusPill label="ALERTS" value="12" color="warn" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 pt-3 ml-auto">
            <AlertTriangle className="w-2.5 h-2.5 text-warn" />
            <span>{new Date().toISOString().slice(0, 16).replace("T", " ")} UTC</span>
          </div>
        </motion.div>
      )}
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
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${colorMap[color]}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
};

export default AtlasHeader;
