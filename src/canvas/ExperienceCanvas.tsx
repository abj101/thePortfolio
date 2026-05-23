import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import * as THREE from "three";

const PAPER_CLEAR = 0xf5f2ec;

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
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(PAPER_CLEAR), 1);
      }}
    >
      {children}
    </Canvas>
  );
}
