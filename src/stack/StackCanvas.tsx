import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ExperienceCanvas } from "../canvas/ExperienceCanvas";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { TEXT_FADE_MS } from "./TextMoment";
import { useStackStore } from "./store";

type CanvasAnim = "hidden" | "arming" | "visible" | "exiting";

type StackCanvasProps = {
  children?: ReactNode;
};

export function StackCanvas({ children }: StackCanvasProps) {
  const phase = useStackStore((s) => s.phase);
  const memoryVisible = useStackStore((s) => s.memoryVisible);
  const setPhase = useStackStore((s) => s.setPhase);
  const reducedMotion = usePrefersReducedMotion();
  const [anim, setAnim] = useState<CanvasAnim>("hidden");
  const exitPending = useRef(false);
  const exitFallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishExit = useCallback(() => {
    if (!exitPending.current) return;
    exitPending.current = false;
    if (exitFallback.current !== null) {
      window.clearTimeout(exitFallback.current);
      exitFallback.current = null;
    }
    setAnim("hidden");
    setPhase("TRANSITIONING");
  }, [setPhase]);

  useEffect(() => {
    if (!memoryVisible) {
      if (phase !== "COMPLETING") {
        setAnim("hidden");
      }
      return;
    }

    if (reducedMotion) {
      setAnim("visible");
      return;
    }

    setAnim("arming");
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => setAnim("visible"));
    });

    return () => {
      cancelAnimationFrame(outerRaf);
      if (innerRaf) cancelAnimationFrame(innerRaf);
    };
  }, [memoryVisible, phase, reducedMotion]);

  useEffect(() => {
    if (phase !== "COMPLETING") {
      exitPending.current = false;
      return;
    }

    exitPending.current = true;

    if (reducedMotion) {
      finishExit();
      return;
    }

    const startExit = window.setTimeout(() => setAnim("exiting"), 0);
    const fadeMs = TEXT_FADE_MS;
    exitFallback.current = window.setTimeout(finishExit, fadeMs + 50);

    return () => {
      window.clearTimeout(startExit);
      if (exitFallback.current !== null) {
        window.clearTimeout(exitFallback.current);
        exitFallback.current = null;
      }
      exitPending.current = false;
    };
  }, [phase, reducedMotion, finishExit]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "opacity" ||
      anim !== "exiting" ||
      !exitPending.current
    ) {
      return;
    }
    finishExit();
  };

  const wrapClass = `stack-canvas-wrap is-${anim}`;

  return (
    <div className={wrapClass} onTransitionEnd={handleTransitionEnd}>
      <ExperienceCanvas>{children}</ExperienceCanvas>
    </div>
  );
}
