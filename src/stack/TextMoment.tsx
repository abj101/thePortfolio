import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useStackStore } from "./store";

/** Intro/outro + canvas reveal — keep in sync with transitions.css */
export const TEXT_FADE_MS = 1200;

type TextMomentProps = {
  text: string;
  delay: number;
  holdDuration: number;
};

export function TextMoment({ text, delay, holdDuration }: TextMomentProps) {
  const phase = useStackStore((s) => s.phase);
  const hideMemory = useStackStore((s) => s.hideMemory);
  const showMemory = useStackStore((s) => s.showMemory);
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const introRevealFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const introFadePending = useRef(false);

  const clearIntroRevealFallback = () => {
    if (introRevealFallback.current !== null) {
      window.clearTimeout(introRevealFallback.current);
      introRevealFallback.current = null;
    }
  };

  const revealMemoryAfterIntro = useCallback(() => {
    if (!introFadePending.current) return;
    introFadePending.current = false;
    clearIntroRevealFallback();
    showMemory();
  }, [showMemory]);

  useLayoutEffect(() => {
    hideMemory();
    setVisible(false);
    introFadePending.current = false;
    clearIntroRevealFallback();
  }, [hideMemory, text]);

  useEffect(() => {
    if (phase !== "PLAYING") return;

    const showDelay = reducedMotion ? 0 : delay;
    const hold = reducedMotion ? 0 : holdDuration;
    const fadeMs = reducedMotion ? 0 : TEXT_FADE_MS;

    const showTimer = window.setTimeout(() => setVisible(true), showDelay);
    const hideTimer = window.setTimeout(() => {
      introFadePending.current = true;
      setVisible(false);
      introRevealFallback.current = window.setTimeout(
        revealMemoryAfterIntro,
        fadeMs + 50,
      );
    }, showDelay + hold);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      clearIntroRevealFallback();
    };
  }, [
    phase,
    delay,
    holdDuration,
    reducedMotion,
    revealMemoryAfterIntro,
  ]);

  useEffect(() => {
    if (phase !== "COMPLETING") return;
    setVisible(false);
  }, [phase]);

  useEffect(() => {
    if (phase === "PLAYING" || phase === "COMPLETING") return;
    setVisible(false);
    hideMemory();
  }, [phase, hideMemory]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLParagraphElement>,
  ) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") {
      return;
    }

    if (phase === "PLAYING") {
      revealMemoryAfterIntro();
    }
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
