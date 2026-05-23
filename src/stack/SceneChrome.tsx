import type { MemoryConfig } from "./MEMORY_CONFIGS";
import { useStackStore } from "./store";
import styles from "./SceneChrome.module.css";

type SceneChromeProps = {
  config: MemoryConfig;
};

export function SceneChrome({ config }: SceneChromeProps) {
  const memoryVisible = useStackStore((s) => s.memoryVisible);

  if (!config.stubLabel || !memoryVisible) return null;

  return (
    <p className={`${styles.stubLabel} stack-chrome-enter`}>{config.stubLabel}</p>
  );
}
