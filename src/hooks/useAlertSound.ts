import { useRef, useCallback } from "react";

/**
 * Plays a subtle low-frequency ping using the Web Audio API
 * when a new CRITICAL alert arrives. Returns a playPing function
 * and a createContext helper (called lazily on first use to
 * satisfy browser autoplay policy).
 */
export function useAlertSound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }, []);

  const playPing = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      // Primary sine tone — low freq, deep resonance
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(220, now);           // A3
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.6); // fade down
      gain1.gain.setValueAtTime(0.0, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.9);

      // Second harmonic — softer, slightly higher
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(330, now + 0.05);    // E4
      osc2.frequency.exponentialRampToValueAtTime(165, now + 0.5);
      gain2.gain.setValueAtTime(0.0, now + 0.05);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.7);
    } catch (_) {
      // Silently fail if Web Audio API is unavailable
    }
  }, [muted, getCtx]);

  return { playPing };
}
