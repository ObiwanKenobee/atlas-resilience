import { useCallback, useEffect, useRef, useState } from "react";

interface LiveMetrics {
  score: number;
  subscores: { label: string; value: number; icon: string }[];
  tippingProbability: number;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const drift = (v: number, mag = 3) => clamp(v + (Math.random() - 0.5) * mag * 2);

export const useLiveData = (
  initial: LiveMetrics,
  enabled: boolean,
  intervalMs = 2800
) => {
  const [metrics, setMetrics] = useState<LiveMetrics>(initial);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tickCount, setTickCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Reset when initial changes (city switch)
  useEffect(() => {
    setMetrics(initial);
  }, [initial.score]);

  const tick = useCallback(() => {
    setMetrics((prev) => {
      const newSubscores = prev.subscores.map((s) => ({
        ...s,
        value: Math.round(drift(s.value, 2.5)),
      }));
      const newScore = clamp(
        Math.round(newSubscores.reduce((acc, s) => acc + s.value, 0) / newSubscores.length)
      );
      const newTipping = clamp(drift(prev.tippingProbability, 2), 5, 95);
      return {
        score: newScore,
        subscores: newSubscores,
        tippingProbability: Math.round(newTipping),
      };
    });
    setLastUpdate(new Date());
    setTickCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(tick, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [enabled, tick, intervalMs]);

  return { metrics, lastUpdate, tickCount };
};
