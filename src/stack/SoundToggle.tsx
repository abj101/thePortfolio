import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
type SoundToggleProps = {
  soundEnabled: boolean;
  onToggleSound: () => void;
};

/** Always visible — not tied to memory transitions or scene remounts. */
export function SoundToggle({ soundEnabled, onToggleSound }: SoundToggleProps) {
  const SoundIcon = soundEnabled ? HiSpeakerWave : HiSpeakerXMark;

  return (
    <button
      type="button"
      className="stack-sound-toggle"
      onClick={onToggleSound}
      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
      aria-pressed={soundEnabled}
    >
      <SoundIcon aria-hidden />
    </button>
  );
}
