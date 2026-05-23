import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useStackStore } from "./store";

export const TEXT_FADE_MS = 1200;

type TextMomentProps = {
  text: string;
  delay: number;
  holdDuration: number;
};

export function TextMoment({ text, delay, holdDuration }: TextMomentProps) {
  const phase = useStackStore((s) => s.phase);
  const setPhase = useStackStore((s) => s.setPhase);
  const hideMemory = useStackStore((s) => s.hideMemory);
  const showMemory = useStackStore((s) => s.showMemory);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const completingFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoryFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introFadePending = useRef(false);

  useEffect(() => {
    if (phase !== "PLAYING") return;

    hideMemory();
    introFadePending.current = false;

    const showDelay = reducedMotion ? 0 : delay;
    const hold = reducedMotion ? 0 : holdDuration;
    const fadeMs = reducedMotion ? 0 : TEXT_FADE_MS;

    const showTimer = window.setTimeout(() => setVisible(true), showDelay);
    const hideTimer = window.setTimeout(() => {
      introFadePending.current = true;
      setVisible(false);
    }, showDelay + hold);

    memoryFallback.current = window.setTimeout(() => {
      if (introFadePending.current) {
        introFadePending.current = false;
        showMemory();
      }
    }, showDelay + hold + fadeMs + 50);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      if (memoryFallback.current !== null) {
        window.clearTimeout(memoryFallback.current);
        memoryFallback.current = null;
      }
    };
  }, [phase, delay, holdDuration, reducedMotion, hideMemory, showMemory]);

  useEffect(() => {
    if (phase !== "COMPLETING") return;

    setVisible(false);
    hideMemory();

    const fadeMs = reducedMotion ? 0 : TEXT_FADE_MS;
    completingFallback.current = window.setTimeout(() => {
      setPhase("TRANSITIONING");
    }, fadeMs + 50);

    return () => {
      if (completingFallback.current !== null) {
        window.clearTimeout(completingFallback.current);
        completingFallback.current = null;
      }
    };
  }, [phase, reducedMotion, setPhase, hideMemory]);

  useEffect(() => {
    if (phase === "PLAYING") return;
    if (phase === "COMPLETING") return;
    setVisible(false);
    hideMemory();
  }, [phase, hideMemory]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLParagraphElement>,
  ) => {
    if (event.propertyName !== "opacity") return;

    if (phase === "COMPLETING") {
      if (completingFallback.current !== null) {
        window.clearTimeout(completingFallback.current);
        completingFallback.current = null;
      }
      setPhase("TRANSITIONING");
      return;
    }

    if (phase !== "PLAYING" || !introFadePending.current) return;

    introFadePending.current = false;
    if (memoryFallback.current !== null) {
      window.clearTimeout(memoryFallback.current);
      memoryFallback.current = null;
    }
    showMemory();
  };

  return (
    <div className="stack-text-moment-wrap" aria-live="polite">
      <p
        className={`text-moment${visible ? " visible" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {text}
      </p>
    </div>
  );
}
