import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import type { MemorySceneProps } from "./types";

export type MemoryConfig = {
  id: string;
  component: LazyExoticComponent<ComponentType<MemorySceneProps>>;
  /** Dev stub label in HTML overlay — omit for real scenes. */
  stubLabel?: string;
  text: string;
  textDelay: number;
  textHold: number;
  sound: string | null;
};

export const MEMORY_CONFIGS: MemoryConfig[] = [
  {
    id: "snake",
    component: lazy(() => import("../scenes/ProofScene")),
    stubLabel: "Memory 1 — stub",
    text: "It started with my grandpa's Nokia.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-2",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 2 — stub",
    text: "Memory two — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-3",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 3 — stub",
    text: "Memory three — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-4",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 4 — stub",
    text: "Memory four — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-5",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 5 — stub",
    text: "Memory five — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-6",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 6 — stub",
    text: "Memory six — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
  {
    id: "memory-7",
    component: lazy(() => import("../scenes/MemoryStubScene")),
    stubLabel: "Memory 7 — stub",
    text: "Memory seven — coming soon.",
    textDelay: 1400,
    textHold: 4000,
    sound: null,
  },
];

export const HUB_INDEX = MEMORY_CONFIGS.length;
