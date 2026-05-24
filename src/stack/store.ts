import { create } from "zustand";
import { HUB_INDEX, MEMORY_CONFIGS } from "./MEMORY_CONFIGS";
import type { StackPhase } from "./types";

type StackState = {
  currentIndex: number;
  phase: StackPhase;
  soundEnabled: boolean;
  /** Game revealed after intro text fades out; drives canvas + scene paused. */
  memoryVisible: boolean;
};

type StackActions = {
  /** Scene invokes via onComplete — starts COMPLETING; stack drives later phases. */
  advance: () => void;
  /** Escape hatch / jump; HUB_INDEX bypasses transition. */
  skipTo: (index: number) => void;
  /** PhaseVeil after fade-in — scene swap under cover. */
  swapScene: () => void;
  /** Stack internals (overlay, ActiveScene). */
  setPhase: (phase: StackPhase) => void;
  /** ActiveScene after Suspense resolve — LOADING → PLAYING. */
  signalSceneReady: () => void;
  toggleSound: () => void;
  showMemory: () => void;
  hideMemory: () => void;
};

export type StackStore = StackState & StackActions;

export const useStackStore = create<StackStore>((set, get) => ({
  currentIndex: 0,
  phase: "PLAYING",
  soundEnabled: false,
  memoryVisible: false,

  advance: () => {
    const { currentIndex, phase } = get();
    if (phase !== "PLAYING" || currentIndex >= MEMORY_CONFIGS.length) return;
    set({ phase: "COMPLETING", memoryVisible: false });
  },

  skipTo: (index) => {
    if (index === HUB_INDEX) {
      set({ currentIndex: HUB_INDEX, phase: "PLAYING", memoryVisible: false });
      return;
    }

    if (index < 0 || index >= MEMORY_CONFIGS.length) return;
    set({ currentIndex: index, phase: "PLAYING", memoryVisible: false });
  },

  swapScene: () => {
    const { currentIndex, phase } = get();
    if (phase !== "TRANSITIONING") return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= MEMORY_CONFIGS.length) {
      set({ currentIndex: HUB_INDEX, phase: "LOADING", memoryVisible: false });
      return;
    }

    set({ currentIndex: nextIndex, phase: "LOADING", memoryVisible: false });
  },

  setPhase: (phase) => set({ phase }),

  signalSceneReady: () => {
    if (get().phase === "LOADING") {
      set({ phase: "PLAYING" });
    }
  },

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  showMemory: () => set({ memoryVisible: true }),

  hideMemory: () => set({ memoryVisible: false }),
}));
