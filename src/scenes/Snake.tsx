import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import type { Mesh } from "three";
import type { MemorySceneProps } from "../stack/types";
import { colors, inkMuted } from "../theme/colors";
import styles from "./Snake.module.css";

const GRID_SIZE = 16;
const CELL = 1;
const TICK = 0.15;
const APPLES_TO_WIN = 3;
const COMPLETE_DELAY = 400;
const SEGMENT_SIZE = 0.85;
const APPLE_OUTER_SIZE = SEGMENT_SIZE;
const APPLE_INNER_SIZE = 0.52;
const MAX_BODY_SEGMENTS = 5;
const BEZEL_INSET_PX = 12;
/** Match grid extent to the inner playfield (inside the CSS bezel). */
const GRID_VIEW_INSET = 0;

const INITIAL_SNAKE: [number, number][] = [
  [8, 8],
  [8, 7],
  [8, 6],
];
const INITIAL_DIR: [number, number] = [0, 1];

const COLORS = {
  snake: colors.ink,
  eyes: colors.paper,
  appleOuter: inkMuted,
  appleInner: colors.paper,
} as const;

type Vec2 = [number, number];

function toWorld(x: number, y: number): [number, number] {
  const wx = (x - GRID_SIZE / 2 + 0.5) * CELL;
  const wy = -(y - GRID_SIZE / 2 + 0.5) * CELL;
  return [wx, wy];
}

function spawnApple(snake: Vec2[]): Vec2 {
  const occupied = new Set(snake.map(([sx, sy]) => `${sx},${sy}`));
  let pos: Vec2;
  do {
    pos = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE),
    ];
  } while (occupied.has(`${pos[0]},${pos[1]}`));
  return pos;
}

function isOpposite(a: Vec2, b: Vec2): boolean {
  return a[0] === -b[0] && a[1] === -b[1];
}

function gridForwardToWorld([dx, dy]: Vec2): Vec2 {
  return [dx, -dy];
}

function directionFromKey(key: string, code: string): Vec2 | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return [0, -1];
    case "ArrowDown":
    case "s":
    case "S":
      return [0, 1];
    case "ArrowLeft":
    case "a":
    case "A":
      return [-1, 0];
    case "ArrowRight":
    case "d":
    case "D":
      return [1, 0];
    default:
      break;
  }

  switch (code) {
    case "ArrowUp":
      return [0, -1];
    case "ArrowDown":
      return [0, 1];
    case "ArrowLeft":
      return [-1, 0];
    case "ArrowRight":
      return [1, 0];
    default:
      return null;
  }
}

function PlayfieldCamera({
  frameRef,
}: {
  frameRef: RefObject<HTMLDivElement | null>;
}) {
  const { camera, gl, size } = useThree();

  const syncCamera = useCallback(() => {
    const frame = frameRef.current;
    if (!frame || !(camera instanceof THREE.OrthographicCamera)) return;

    const canvasRect = gl.domElement.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const playPx =
      Math.min(frameRect.width, frameRect.height) - BEZEL_INSET_PX * 2;

    if (playPx <= 0) return;

    camera.zoom = playPx / (GRID_SIZE + GRID_VIEW_INSET * 2);

    const frameCx = frameRect.left + frameRect.width / 2;
    const frameCy = frameRect.top + frameRect.height / 2;
    const canvasCx = canvasRect.left + canvasRect.width / 2;
    const canvasCy = canvasRect.top + canvasRect.height / 2;

    camera.position.set(
      (frameCx - canvasCx) / camera.zoom,
      -(frameCy - canvasCy) / camera.zoom,
      10,
    );
    camera.updateProjectionMatrix();
  }, [camera, frameRef, gl]);

  useLayoutEffect(() => {
    syncCamera();
    const frame = frameRef.current;
    if (!frame) return;

    const observer = new ResizeObserver(syncCamera);
    observer.observe(frame);
    observer.observe(gl.domElement);
    window.addEventListener("resize", syncCamera);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncCamera);
    };
  }, [frameRef, gl, syncCamera, size.width, size.height]);

  useFrame(syncCamera);

  return null;
}

export default function Snake({
  onComplete,
  soundEnabled: _soundEnabled,
  onToggleSound: _onToggleSound,
  paused,
  displayed,
}: MemorySceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const snakeRef = useRef<Vec2[]>(INITIAL_SNAKE.map((seg) => [...seg]));
  const dirRef = useRef<Vec2>([...INITIAL_DIR]);
  const nextDirRef = useRef<Vec2>([...INITIAL_DIR]);
  const accumRef = useRef(0);
  const appleRef = useRef<Vec2>(spawnApple(INITIAL_SNAKE));
  const applesRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headRef = useRef<Mesh>(null);
  const bodyRefs = useRef<(Mesh | null)[]>([]);
  const eyeLeftRef = useRef<Mesh>(null);
  const eyeRightRef = useRef<Mesh>(null);
  const appleOuterRef = useRef<Mesh>(null);
  const appleInnerRef = useRef<Mesh>(null);

  const { gl } = useThree();
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (paused) return;

    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", "Snake playfield");
    canvas.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (doneRef.current) return;

      const next = directionFromKey(event.key, event.code);
      if (!next) return;

      event.preventDefault();
      event.stopPropagation();

      const applied = dirRef.current;
      if (isOpposite(next, applied)) return;
      nextDirRef.current = next;
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [gl, paused]);

  useEffect(() => {
    return () => {
      if (completeTimerRef.current !== null) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  const syncMeshes = () => {
    const snake = snakeRef.current;
    const head = snake[0];
    if (head && headRef.current) {
      const [hx, hy] = toWorld(head[0], head[1]);
      headRef.current.position.set(hx, hy, 0.01);
    }

    const [fwdX, fwdY] = gridForwardToWorld(dirRef.current);
    const perpX = -fwdY;
    const perpY = fwdX;
    const eyeForward = 0.18;
    const eyeSpread = 0.14;

    if (eyeLeftRef.current) {
      eyeLeftRef.current.position.set(
        fwdX * eyeForward + perpX * eyeSpread,
        fwdY * eyeForward + perpY * eyeSpread,
        0.02,
      );
    }
    if (eyeRightRef.current) {
      eyeRightRef.current.position.set(
        fwdX * eyeForward - perpX * eyeSpread,
        fwdY * eyeForward - perpY * eyeSpread,
        0.02,
      );
    }

    for (let i = 0; i < bodyRefs.current.length; i++) {
      const mesh = bodyRefs.current[i];
      const segment = snake[i + 1];
      if (!mesh) continue;
      if (!segment) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      const [bx, by] = toWorld(segment[0], segment[1]);
      mesh.position.set(bx, by, 0);
    }

    const apple = appleRef.current;
    if (appleOuterRef.current && appleInnerRef.current) {
      const [ax, ay] = toWorld(apple[0], apple[1]);
      appleOuterRef.current.position.set(ax, ay, 0.02);
      appleInnerRef.current.position.set(ax, ay, 0.03);
      const showApple = applesRef.current < APPLES_TO_WIN && !doneRef.current;
      appleOuterRef.current.visible = showApple;
      appleInnerRef.current.visible = showApple;
    }
  };

  useFrame((_, delta) => {
    if (paused) return;

    syncMeshes();

    if (doneRef.current) return;

    accumRef.current += delta;
    if (accumRef.current < TICK) return;
    accumRef.current -= TICK;

    dirRef.current = [...nextDirRef.current];
    const [dx, dy] = dirRef.current;
    const head = snakeRef.current[0];
    const newHead: Vec2 = [
      (head[0] + dx + GRID_SIZE) % GRID_SIZE,
      (head[1] + dy + GRID_SIZE) % GRID_SIZE,
    ];

    const ateApple =
      newHead[0] === appleRef.current[0] && newHead[1] === appleRef.current[1];

    snakeRef.current = [newHead, ...snakeRef.current];

    if (ateApple) {
      applesRef.current += 1;

      if (applesRef.current >= APPLES_TO_WIN) {
        doneRef.current = true;
        completeTimerRef.current = setTimeout(() => {
          onCompleteRef.current();
        }, COMPLETE_DELAY);
      } else {
        appleRef.current = spawnApple(snakeRef.current);
      }
    } else {
      snakeRef.current = snakeRef.current.slice(0, -1);
    }

    syncMeshes();
  });

  if (!displayed) return null;

  return (
    <>
      <PlayfieldCamera frameRef={frameRef} />
      <mesh ref={headRef}>
        <planeGeometry args={[SEGMENT_SIZE, SEGMENT_SIZE]} />
        <meshBasicMaterial color={COLORS.snake} />
        <mesh ref={eyeLeftRef}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color={COLORS.eyes} />
        </mesh>
        <mesh ref={eyeRightRef}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color={COLORS.eyes} />
        </mesh>
      </mesh>

      {Array.from({ length: MAX_BODY_SEGMENTS }, (_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            bodyRefs.current[index] = mesh;
          }}
          visible={false}
        >
          <planeGeometry args={[SEGMENT_SIZE, SEGMENT_SIZE]} />
          <meshBasicMaterial color={COLORS.snake} />
        </mesh>
      ))}

      <mesh ref={appleOuterRef}>
        <planeGeometry args={[APPLE_OUTER_SIZE, APPLE_OUTER_SIZE]} />
        <meshBasicMaterial color={COLORS.appleOuter} />
      </mesh>
      <mesh ref={appleInnerRef}>
        <planeGeometry args={[APPLE_INNER_SIZE, APPLE_INNER_SIZE]} />
        <meshBasicMaterial color={COLORS.appleInner} />
      </mesh>

      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className={styles.overlay}>
          <div ref={frameRef} className={styles.frame} aria-hidden="true" />
        </div>
      </Html>
    </>
  );
}
