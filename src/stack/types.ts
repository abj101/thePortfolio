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
  /** False until intro text finishes — scene must not play or accept input. */
  paused: boolean;
  /** False during intro only; stays true through completion fade-out. */
  displayed: boolean;
};
