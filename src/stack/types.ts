export type StackPhase =
  | "PLAYING"
  | "COMPLETING"
  | "TRANSITIONING"
  | "LOADING";

/** Scene contract — no store imports in scenes. */
export type MemorySceneProps = {
  onComplete: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
};
