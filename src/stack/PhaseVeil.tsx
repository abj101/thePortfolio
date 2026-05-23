import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useStackStore } from "./store";

export const VEIL_FADE_MS = 600;

export function PhaseVeil() {
  const phase = useStackStore((s) => s.phase);
  const swapScene = useStackStore((s) => s.swapScene);
  const reducedMotion = usePrefersReducedMotion();
  const pendingSwap = useRef(false);
  const swapFallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const covered = phase === "TRANSITIONING" || phase === "LOADING";

  useEffect(() => {
    if (phase !== "TRANSITIONING") {
      pendingSwap.current = false;
      return;
    }

    pendingSwap.current = true;

    if (reducedMotion) {
      swapScene();
      pendingSwap.current = false;
      return;
    }

    swapFallback.current = window.setTimeout(() => {
      if (pendingSwap.current) {
        pendingSwap.current = false;
        swapScene();
      }
    }, VEIL_FADE_MS + 50);

    return () => {
      if (swapFallback.current !== null) {
        window.clearTimeout(swapFallback.current);
        swapFallback.current = null;
      }
    };
  }, [phase, reducedMotion, swapScene]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.propertyName !== "background-color" || !pendingSwap.current) return;

    pendingSwap.current = false;
    if (swapFallback.current !== null) {
      window.clearTimeout(swapFallback.current);
      swapFallback.current = null;
    }
    swapScene();
  };

  return (
    <div
      className={`phase-veil${covered ? " active" : ""}`}
      aria-hidden={!covered}
      onTransitionEnd={handleTransitionEnd}
    />
  );
}
