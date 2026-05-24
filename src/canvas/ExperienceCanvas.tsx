import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";

const PAPER_CLEAR = 0xf5f2ec;

type ExperienceCanvasProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Shared R3F layer for Path A memory scenes.
 * Path B (/portfolio) stays pure HTML — no canvas.
 */
export function ExperienceCanvas({ children, className }: ExperienceCanvasProps) {
  const canvasClass = ["experience-canvas", className].filter(Boolean).join(" ");

  return (
    <Canvas
      className={canvasClass}
      orthographic
      camera={{ position: [0, 0, 10], zoom: 50 }}
      tabIndex={0}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(PAPER_CLEAR), 1);
      }}
    >
      {children}
    </Canvas>
  );
}
