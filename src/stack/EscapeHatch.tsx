import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { HUB_INDEX } from "./MEMORY_CONFIGS";
import { useStackStore } from "./store";

export function EscapeHatch() {
  const phase = useStackStore((s) => s.phase);
  const skipTo = useStackStore((s) => s.skipTo);
  const hidden = phase === "TRANSITIONING";

  return (
    <button
      type="button"
      className={`escape-hatch${hidden ? " hidden" : ""}`}
      onClick={() => skipTo(HUB_INDEX)}
      aria-label="Leave to portfolio"
    >
      <HiArrowRightOnRectangle className="escape-hatch__icon" aria-hidden />
      <span>Portfolio</span>
    </button>
  );
}
