import { Html } from "@react-three/drei";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";
import dsSvg from "../assets/DSDrawn.svg?raw";
import { usePrefersReducedMotion } from "../stack/hooks/usePrefersReducedMotion";
import type { MemorySceneProps } from "../stack/types";
import styles from "./Pokemon.module.css";

const PLAYER_SPECIES = "CYNDAQUIL";
const ENEMY_SPECIES = "TOTODILE";
const RIVAL_TRAINER = "GOLD";

const PLAYER_MAX_HP = 30;
const ENEMY_MAX_HP = 18;
const TACKLE_DMG = 8;
const ENEMY_DMG_MIN = 4;
const ENEMY_DMG_MAX = 6;
const COMPLETE_DELAY = 1200;
const TYPEWRITER_SPEED = 35;
const ENEMY_TURN_DELAY = 600;
const DIALOGUE_PAUSE = 900;
const INTRO_LINE_PAUSE = 1500;

type Phase =
  | "INTRO"
  | "PLAYER_TURN"
  | "ANIMATING"
  | "ENEMY_TURN"
  | "CHECK"
  | "END";

type Move = "TACKLE" | "LEER";

type AnimTarget = "player" | "enemy";
type AnimKind = "lunge" | "flash" | "shake" | "faint";

type Anim = { target: AnimTarget; kind: AnimKind } | null;

type EndResult = "win" | "lose";

type BattleState = {
  phase: Phase;
  anim: Anim;
  dialogue: string;
  silhouettes: boolean;
  enemyHidden: boolean;
  playerHidden: boolean;
  activeMove: Move | null;
  endResult: EndResult | null;
};

const initialBattle: BattleState = {
  phase: "INTRO",
  anim: null,
  dialogue: "",
  silhouettes: false,
  enemyHidden: false,
  playerHidden: false,
  activeMove: null,
  endResult: null,
};

type BattleAction =
  | { type: "PATCH"; patch: Partial<BattleState> }
  | { type: "SET_ANIM"; anim: Anim }
  | { type: "CLEAR_ANIM" };

function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.patch };
    case "SET_ANIM":
      return { ...state, anim: action.anim };
    case "CLEAR_ANIM":
      return { ...state, anim: null };
    default:
      return state;
  }
}

function enemyDamage(): number {
  return (
    ENEMY_DMG_MIN +
    Math.floor(Math.random() * (ENEMY_DMG_MAX - ENEMY_DMG_MIN + 1))
  );
}

function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!enabled || !text) {
      setShown("");
      return;
    }
    setShown("");
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(id);
    }, TYPEWRITER_SPEED);
    return () => window.clearInterval(id);
  }, [text, enabled]);

  return shown;
}

function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <div className={styles.hpTrack}>
      <div className={styles.hpFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

const INFO_BOX_PATH = {
  rival: "M8 0 H100 L92 36 H0 Z",
  player: "M0 0 H92 L100 36 H8 Z",
} as const;

function BattleInfoBox({
  side,
  className,
  children,
}: {
  side: keyof typeof INFO_BOX_PATH;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <svg
        className={styles.infoBoxFrame}
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d={INFO_BOX_PATH[side]} className={styles.infoBoxPath} />
      </svg>
      <div className={styles.infoBoxInner}>{children}</div>
    </div>
  );
}

export default function Pokemon(props: MemorySceneProps) {
  return (
    <Html fullscreen style={{ pointerEvents: "auto" }}>
      <PokemonBattle {...props} />
    </Html>
  );
}

function PokemonBattle({
  onComplete,
  soundEnabled: _soundEnabled,
  onToggleSound: _onToggleSound,
  paused,
  displayed,
}: MemorySceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [battle, dispatch] = useReducer(battleReducer, initialBattle);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [enemyHp, setEnemyHp] = useState(ENEMY_MAX_HP);
  const introStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const timersRef = useRef<number[]>([]);

  onCompleteRef.current = onComplete;

  const typedDialogue = useTypewriter(
    battle.dialogue,
    battle.dialogue.length > 0,
  );

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const goEnemyTurn = useCallback(() => {
    dispatch({
      type: "PATCH",
      patch: {
        phase: "ENEMY_TURN",
        anim: null,
        activeMove: null,
      },
    });
  }, []);

  const showDialogueThen = useCallback(
    (text: string, next: () => void) => {
      dispatch({
        type: "PATCH",
        patch: { dialogue: text },
      });
      const wait =
        text.length * TYPEWRITER_SPEED + DIALOGUE_PAUSE;
      schedule(next, wait);
    },
    [schedule],
  );

  const finishPlayerMove = useCallback(
    (move: Move) => {
      if (move === "TACKLE") {
        showDialogueThen(`${PLAYER_SPECIES} used TACKLE!`, goEnemyTurn);
        return;
      }
      showDialogueThen(`${PLAYER_SPECIES} used LEER!`, () => {
        showDialogueThen(`${ENEMY_SPECIES}'s DEF fell!`, goEnemyTurn);
      });
    },
    [goEnemyTurn, showDialogueThen],
  );

  const runEnemyAttack = useCallback(() => {
    // SOUND: hit SFX
    if (reducedMotion) {
      setPlayerHp((hp) => Math.max(0, hp - enemyDamage()));
      showDialogueThen(`${ENEMY_SPECIES} used SCRATCH!`, () => {
        dispatch({ type: "PATCH", patch: { phase: "CHECK", anim: null } });
      });
      return;
    }

    dispatch({
      type: "PATCH",
      patch: {
        phase: "ANIMATING",
        anim: { target: "enemy", kind: "lunge" },
        activeMove: null,
      },
    });
  }, [reducedMotion, showDialogueThen]);

  const runEndDialogue = useCallback(
    (result: EndResult) => {
      const loserHidden =
        result === "win"
          ? { enemyHidden: true, playerHidden: false }
          : { enemyHidden: false, playerHidden: true };

      if (result === "win") {
        const faintLine = `Rival's ${ENEMY_SPECIES} fainted!`;
        dispatch({
          type: "PATCH",
          patch: {
            anim: null,
            ...loserHidden,
            dialogue: faintLine,
          },
        });
        schedule(() => {
          const winLine = `${RIVAL_TRAINER} was defeated!`;
          dispatch({ type: "PATCH", patch: { dialogue: winLine } });
          const winMs = winLine.length * TYPEWRITER_SPEED + COMPLETE_DELAY;
          schedule(() => onCompleteRef.current(), winMs);
        }, faintLine.length * TYPEWRITER_SPEED + INTRO_LINE_PAUSE);
        return;
      }

      const faintLine = `${PLAYER_SPECIES} fainted!`;
      dispatch({
        type: "PATCH",
        patch: {
          anim: null,
          ...loserHidden,
          dialogue: faintLine,
        },
      });
      schedule(() => {
        const loseLine = `${RIVAL_TRAINER} won!`;
        dispatch({ type: "PATCH", patch: { dialogue: loseLine } });
        const loseMs = loseLine.length * TYPEWRITER_SPEED + COMPLETE_DELAY;
        schedule(() => onCompleteRef.current(), loseMs);
      }, faintLine.length * TYPEWRITER_SPEED + INTRO_LINE_PAUSE);
    },
    [schedule],
  );

  const startEndSequence = useCallback(
    (result: EndResult) => {
      const loser: AnimTarget = result === "win" ? "enemy" : "player";

      if (reducedMotion) {
        dispatch({
          type: "PATCH",
          patch: { phase: "END", endResult: result, anim: null },
        });
        runEndDialogue(result);
        return;
      }

      dispatch({
        type: "PATCH",
        patch: {
          phase: "END",
          endResult: result,
          anim: { target: loser, kind: "faint" },
        },
      });
    },
    [reducedMotion, runEndDialogue],
  );

  const battleRef = useRef(battle);
  battleRef.current = battle;

  const advanceAnim = useCallback(() => {
    const { anim, activeMove, phase } = battleRef.current;

    if (phase === "END" && anim?.kind === "faint") {
      const { endResult } = battleRef.current;
      if (endResult) runEndDialogue(endResult);
      return;
    }

    if (phase !== "ANIMATING" || !anim) return;

    if (activeMove === "TACKLE") {
      if (anim.target === "player" && anim.kind === "lunge") {
        dispatch({
          type: "SET_ANIM",
          anim: { target: "enemy", kind: "flash" },
        });
        return;
      }
      if (anim.target === "enemy" && anim.kind === "flash") {
        dispatch({
          type: "SET_ANIM",
          anim: { target: "enemy", kind: "shake" },
        });
        return;
      }
      if (anim.target === "enemy" && anim.kind === "shake") {
        setEnemyHp((hp) => Math.max(0, hp - TACKLE_DMG));
        dispatch({ type: "CLEAR_ANIM" });
        finishPlayerMove("TACKLE");
      }
      return;
    }

    if (activeMove === "LEER") {
      if (anim.target === "player" && anim.kind === "lunge") {
        dispatch({
          type: "SET_ANIM",
          anim: { target: "enemy", kind: "flash" },
        });
        return;
      }
      if (anim.target === "enemy" && anim.kind === "flash") {
        dispatch({ type: "CLEAR_ANIM" });
        finishPlayerMove("LEER");
      }
      return;
    }

    if (!activeMove) {
      if (anim.target === "enemy" && anim.kind === "lunge") {
        dispatch({
          type: "SET_ANIM",
          anim: { target: "player", kind: "flash" },
        });
        return;
      }
      if (anim.target === "player" && anim.kind === "flash") {
        dispatch({
          type: "SET_ANIM",
          anim: { target: "player", kind: "shake" },
        });
        return;
      }
      if (anim.target === "player" && anim.kind === "shake") {
        setPlayerHp((hp) => Math.max(0, hp - enemyDamage()));
        dispatch({ type: "CLEAR_ANIM" });
        showDialogueThen(`${ENEMY_SPECIES} used SCRATCH!`, () => {
          dispatch({ type: "PATCH", patch: { phase: "CHECK" } });
        });
      }
    }
  }, [finishPlayerMove, runEndDialogue, showDialogueThen]);

  const startEndSequenceRef = useRef(startEndSequence);
  startEndSequenceRef.current = startEndSequence;

  const onSpriteAnimationEnd = useCallback(
    (target: AnimTarget) => (event: AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const { anim } = battleRef.current;
      if (!anim || anim.target !== target) return;
      advanceAnim();
    },
    [advanceAnim],
  );

  useEffect(() => {
    if (battle.phase !== "CHECK") return;
    if (enemyHp <= 0) {
      startEndSequenceRef.current("win");
      return;
    }
    if (playerHp <= 0) {
      startEndSequenceRef.current("lose");
      return;
    }
    dispatch({
      type: "PATCH",
      patch: {
        phase: "PLAYER_TURN",
        dialogue: `▶ What will ${PLAYER_SPECIES} do?`,
      },
    });
  }, [battle.phase, enemyHp, playerHp]);

  useEffect(() => {
    if (battle.phase !== "ENEMY_TURN" || paused) return;
    if (enemyHp <= 0) {
      startEndSequenceRef.current("win");
      return;
    }
    if (playerHp <= 0) {
      startEndSequenceRef.current("lose");
      return;
    }
    schedule(runEnemyAttack, ENEMY_TURN_DELAY);
  }, [battle.phase, paused, enemyHp, playerHp, runEnemyAttack, schedule]);

  useEffect(() => {
    if (paused || !displayed || introStartedRef.current) return;
    introStartedRef.current = true;

    schedule(() => {
      dispatch({ type: "PATCH", patch: { silhouettes: true } });
    }, 400);

    schedule(() => {
      dispatch({
        type: "PATCH",
        patch: {
          dialogue: "Rival wants to battle!",
        },
      });
    }, 700);

    const sentOutLine = `${RIVAL_TRAINER} sent out ${ENEMY_SPECIES}!`;
    schedule(() => {
      dispatch({
        type: "PATCH",
        patch: { dialogue: sentOutLine },
      });
    }, 700 + INTRO_LINE_PAUSE + sentOutLine.length * TYPEWRITER_SPEED);

    const goLine = `Go! ${PLAYER_SPECIES}!`;
    schedule(() => {
      dispatch({
        type: "PATCH",
        patch: { dialogue: goLine },
      });
    }, 700 + INTRO_LINE_PAUSE * 2 + goLine.length * TYPEWRITER_SPEED);

    const promptLine = `▶ What will ${PLAYER_SPECIES} do?`;
    schedule(() => {
      dispatch({
        type: "PATCH",
        patch: {
          phase: "PLAYER_TURN",
          dialogue: promptLine,
        },
      });
    }, 700 + INTRO_LINE_PAUSE * 3 + promptLine.length * TYPEWRITER_SPEED);
  }, [paused, displayed, schedule]);

  const pickMove = (move: Move) => {
    if (battle.phase !== "PLAYER_TURN" || paused) return;
    // SOUND: play hit SFX here for attacks

    if (reducedMotion) {
      if (move === "TACKLE") {
        setEnemyHp((hp) => Math.max(0, hp - TACKLE_DMG));
      }
      dispatch({
        type: "PATCH",
        patch: {
          phase: "ANIMATING",
          activeMove: move,
          dialogue: "",
        },
      });
      finishPlayerMove(move);
      return;
    }

    dispatch({
      type: "PATCH",
      patch: {
        phase: "ANIMATING",
        activeMove: move,
        dialogue: "",
        anim: { target: "player", kind: "lunge" },
      },
    });
  };

  const spriteClass = (
    target: AnimTarget,
    baseVisible: boolean,
  ): string => {
    const { anim, silhouettes, enemyHidden, playerHidden } = battle;
    const parts = [styles.sprite];

    if (target === "enemy") {
      parts.push(styles.spriteEnemy);
      if (silhouettes && baseVisible) parts.push(styles.spriteEnemyVisible);
      if (enemyHidden) parts.push(styles.spriteHidden);
    } else {
      parts.push(styles.spritePlayer);
      if (silhouettes) parts.push(styles.spritePlayerVisible);
      if (playerHidden) parts.push(styles.spriteHidden);
    }

    if (!anim || anim.target !== target) return parts.join(" ");

    if (anim.kind === "lunge") {
      if (target === "player" && battle.activeMove === "TACKLE") {
        parts.push(styles.spritePlayerAttack);
      }
      if (target === "enemy" && !battle.activeMove) {
        parts.push(styles.spriteEnemyAttack);
      }
      parts.push(target === "player" ? styles.lungeRight : styles.lungeLeft);
    } else if (anim.kind === "flash") {
      parts.push(styles.flash);
    } else if (anim.kind === "shake") {
      parts.push(styles.shake);
    } else if (anim.kind === "faint") {
      parts.push(
        target === "enemy" ? styles.slideOffRight : styles.slideOffLeft,
      );
    }

    return parts.join(" ");
  };

  const movesDisabled = paused || battle.phase !== "PLAYER_TURN";

  return (
    <div className={styles.root} data-displayed={displayed || undefined}>
      <div className={styles.dsShell}>
        <div
          className={styles.dsSvg}
          dangerouslySetInnerHTML={{ __html: dsSvg }}
        />

        <div
          className={`${styles.screenOverlay} ${styles.screenTopOverlay} ${styles.topScreen}`}
        >
              <div className={styles.arena}>
                <BattleInfoBox
                  side="rival"
                  className={`${styles.infoBox} ${styles.infoBoxRival}`}
                >
                  <div className={styles.infoRow}>
                    <span>{ENEMY_SPECIES}</span>
                    <span>Lv5</span>
                  </div>
                  <div className={styles.hpLabel}>HP</div>
                  <HpBar hp={enemyHp} max={ENEMY_MAX_HP} />
                </BattleInfoBox>

                <BattleInfoBox
                  side="player"
                  className={`${styles.infoBox} ${styles.infoBoxPlayer}`}
                >
                  <div className={styles.infoRow}>
                    <span>{PLAYER_SPECIES}</span>
                    <span>Lv5</span>
                  </div>
                  <div className={styles.hpLabel}>HP</div>
                  <HpBar hp={playerHp} max={PLAYER_MAX_HP} />
                </BattleInfoBox>

                <div className={`${styles.monSpot} ${styles.monSpotEnemy}`}>
                  <div
                    className={`${styles.platform} ${styles.platformEnemy} ${battle.enemyHidden ? styles.platformHidden : ""}`}
                    aria-hidden
                  />
                  <div
                    className={spriteClass("enemy", !battle.enemyHidden)}
                    onAnimationEnd={onSpriteAnimationEnd("enemy")}
                    aria-hidden
                  />
                </div>
                <div className={`${styles.monSpot} ${styles.monSpotPlayer}`}>
                  <div
                    className={`${styles.platform} ${styles.platformPlayer} ${battle.playerHidden ? styles.platformHidden : ""}`}
                    aria-hidden
                  />
                  <div
                    className={spriteClass("player", !battle.playerHidden)}
                    onAnimationEnd={onSpriteAnimationEnd("player")}
                    aria-hidden
                  />
                </div>
              </div>

              <div className={styles.dialogueBox}>
                <div className={styles.dialogueLine}>
                  <span className={styles.dialogueCaret} aria-hidden />
                  <span className={styles.dialogueText}>
                    {typedDialogue.replace(/^▶\s?/, "")}
                  </span>
                </div>
              </div>
        </div>

        <div
          className={`${styles.screenOverlay} ${styles.screenBottomOverlay} ${styles.bottomScreen}`}
        >
              <div className={styles.partyDots} aria-hidden>
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={`filled-${i}`}>●</span>
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={`empty-${i}`}>○</span>
                ))}
              </div>

              <div className={styles.moveGrid}>
                <button
                  type="button"
                  className={styles.moveBtn}
                  disabled={movesDisabled}
                  onClick={() => pickMove("TACKLE")}
                >
                  TACKLE
                </button>
                <button
                  type="button"
                  className={styles.moveBtn}
                  disabled={movesDisabled}
                  onClick={() => pickMove("LEER")}
                >
                  LEER
                </button>
              </div>
        </div>
      </div>
    </div>
  );
}
