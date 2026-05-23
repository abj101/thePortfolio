import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

type ExperienceCanvasProps = {
  children?: ReactNode;
};

/**
 * Shared R3F layer for Path A memory scenes.
 * Path B (/portfolio) stays pure HTML — no canvas.
 */
export function ExperienceCanvas({ children }: ExperienceCanvasProps) {
  return (
    <Canvas
      className="experience-canvas"
      orthographic
      camera={{ position: [0, 0, 10], zoom: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      {children}
    </Canvas>
  );
}
