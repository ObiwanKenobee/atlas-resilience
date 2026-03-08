import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-all ${
        isDark
          ? "border-border text-muted-foreground hover:border-accent/40 hover:text-accent"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
      }`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
      </motion.div>
      <span className="hidden sm:inline">{isDark ? "LIGHT" : "DARK"}</span>
    </button>
  );
};

export default ThemeToggle;
