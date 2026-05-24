import { Suspense, useEffect } from "react";
import { StackCanvas } from "./StackCanvas";
import { EscapeHatch } from "./EscapeHatch";
import { MEMORY_CONFIGS } from "./MEMORY_CONFIGS";
import { PhaseVeil } from "./PhaseVeil";
import { NextControl } from "./NextControl";
import { SceneChrome } from "./SceneChrome";
import { SoundToggle } from "./SoundToggle";
import { TextMoment } from "./TextMoment";
import { useStackStore } from "./store";
import type { MemorySceneProps } from "./types";

function ActiveScene() {
  const currentIndex = useStackStore((s) => s.currentIndex);
  const advance = useStackStore((s) => s.advance);
  const soundEnabled = useStackStore((s) => s.soundEnabled);
  const toggleSound = useStackStore((s) => s.toggleSound);
  const signalSceneReady = useStackStore((s) => s.signalSceneReady);
  const memoryVisible = useStackStore((s) => s.memoryVisible);
  const phase = useStackStore((s) => s.phase);

  const config = MEMORY_CONFIGS[currentIndex];
  if (!config) return null;

  const Scene = config.component;

  return (
    <Suspense fallback={null}>
      <SceneMount
        Scene={Scene}
        onComplete={advance}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        paused={!memoryVisible}
        displayed={memoryVisible || phase === "COMPLETING"}
        onReady={signalSceneReady}
      />
    </Suspense>
  );
}

type SceneMountProps = {
  Scene: (typeof MEMORY_CONFIGS)[number]["component"];
  onComplete: MemorySceneProps["onComplete"];
  soundEnabled: boolean;
  onToggleSound: MemorySceneProps["onToggleSound"];
  paused: boolean;
  displayed: boolean;
  onReady: () => void;
};

function SceneMount({
  Scene,
  onComplete,
  soundEnabled,
  onToggleSound,
  paused,
  displayed,
  onReady,
}: SceneMountProps) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Scene
      onComplete={onComplete}
      soundEnabled={soundEnabled}
      onToggleSound={onToggleSound}
      paused={paused}
      displayed={displayed}
    />
  );
}

export function StackProvider() {
  const currentIndex = useStackStore((s) => s.currentIndex);
  const advance = useStackStore((s) => s.advance);
  const soundEnabled = useStackStore((s) => s.soundEnabled);
  const toggleSound = useStackStore((s) => s.toggleSound);
  const config =
    currentIndex >= 0 && currentIndex < MEMORY_CONFIGS.length
      ? MEMORY_CONFIGS[currentIndex]
      : null;

  return (
    <div className="stack-root">
      <StackCanvas>
        {config ? <ActiveScene key={currentIndex} /> : null}
      </StackCanvas>

      <div className="stack-overlay">
        {config ? (
          <TextMoment
            key={currentIndex}
            text={config.text}
            delay={config.textDelay}
            holdDuration={config.textHold}
          />
        ) : null}
        <PhaseVeil />
        <EscapeHatch />
        <SoundToggle
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
        {config ? <NextControl onComplete={advance} /> : null}
        {config ? (
          <SceneChrome key={currentIndex} config={config} />
        ) : null}
      </div>
    </div>
  );
}
