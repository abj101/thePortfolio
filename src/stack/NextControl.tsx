import { HiArrowRight } from "react-icons/hi2";

type NextControlProps = {
  onComplete: () => void;
};

/** Always visible during play — same muted fade as escape hatch / sound. */
export function NextControl({ onComplete }: NextControlProps) {
  return (
    <button
      type="button"
      className="stack-next-btn"
      onClick={onComplete}
      aria-label="Next scene"
    >
      <HiArrowRight aria-hidden />
    </button>
  );
}
