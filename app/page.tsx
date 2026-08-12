"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  CHARACTERS,
  GAME_LEVELS,
  emptyAssignment,
  evaluateAssignment,
  solveLevel,
  type Assignment,
  type CharacterId,
  type GameLevel,
  type HarmonyResult,
  type Preference,
  type Room,
  type RoomFeature,
  type SimulationEvent,
} from "@/lib/game";

const FEATURE_LABELS: Record<RoomFeature, { icon: string; label: string }> = {
  daylight: { icon: "☀", label: "Daylight" },
  morningSun: { icon: "☼", label: "Morning sun" },
  quiet: { icon: "◇", label: "Quiet" },
  size: { icon: "↔", label: "Size" },
  kitchenClose: { icon: "◒", label: "Near kitchen" },
  desk: { icon: "▤", label: "Desk" },
  floorSpace: { icon: "□", label: "Open floor" },
  balcony: { icon: "♧", label: "Balcony" },
  guitarSpace: { icon: "♫", label: "Guitar space" },
  farFromCommonSpace: { icon: "⇥", label: "Away from common space" },
};

const PROP_MARKS: Record<CharacterId, string> = {
  maya: "♧",
  dev: "◒",
  tara: "▰",
  finn: "▣",
  kabir: "♪",
};

type DragState = { characterId: CharacterId; x: number; y: number; moved: boolean };
type SimulationState = {
  step: number;
  events: SimulationEvent[];
  result: HarmonyResult;
  finished: boolean;
};

type DebugFlags = {
  roomFeatures: boolean;
  characterNeeds: boolean;
  harmonyWeights: boolean;
  solutions: boolean;
};

const DEFAULT_DEBUG: DebugFlags = {
  roomFeatures: false,
  characterNeeds: false,
  harmonyWeights: false,
  solutions: false,
};

function CharacterPortrait({ characterId, small = false }: { characterId: CharacterId; small?: boolean }) {
  return (
    <span className={`avatar avatar--${characterId} ${small ? "avatar--small" : ""}`} aria-hidden="true">
      <span className="avatar__art" />
    </span>
  );
}

function preferenceWeight(preference: Preference) {
  if (preference.priority === "want") return 2;
  if (preference.priority === "like") return 1;
  return null;
}

function preferenceOrder(preference: Preference) {
  return preference.priority === "need" ? 0 : preference.priority === "want" ? 1 : 2;
}

function roomFeatureText(feature: RoomFeature, value: Room["features"][RoomFeature]) {
  const base = FEATURE_LABELS[feature];
  if (value === true) return base.label;
  if (value === false) return `No ${base.label.toLowerCase()}`;
  if (feature === "daylight") return `${String(value)} daylight`;
  if (feature === "size") return `${String(value)} room`;
  return `${base.label}: ${String(value)}`;
}

function isFeatureShown(feature: RoomFeature, value: Room["features"][RoomFeature]) {
  return value !== false && value !== undefined;
}

function preferenceIsMet(level: GameLevel, assignment: Assignment, preference: Preference) {
  const roomId = assignment[preference.characterId];
  const room = level.house.rooms.find((item) => item.id === roomId);
  return room?.features[preference.feature] === preference.value;
}

function residentFeedback(level: GameLevel, assignment: Assignment, characterId: CharacterId, result: HarmonyResult) {
  const failedNeed = result.failedNeeds.find((item) => item.characterId === characterId);
  if (failedNeed) return { icon: "×", label: failedNeed.label, tone: "bad" };
  const unmetSoft = level.preferences.find(
    (item) => item.characterId === characterId && item.priority !== "need" && !preferenceIsMet(level, assignment, item),
  );
  if (unmetSoft) return { icon: "·", label: unmetSoft.label, tone: "mixed" };
  return { icon: "☺", label: "Settled in", tone: "good" };
}

function buildFailureEvents(level: GameLevel, result: HarmonyResult): SimulationEvent[] {
  const failure = result.failedNeeds[0];
  const character = failure ? CHARACTERS[failure.characterId] : null;
  const room = failure?.roomId ? level.house.rooms.find((item) => item.id === failure.roomId) : null;
  const setup: SimulationEvent = {
    time: "0:00",
    text: "The boxes come through the door. Everyone starts to settle in.",
    tone: "warm",
  };
  if (!failure || !character) return [setup];

  const actionByFeature: Partial<Record<RoomFeature, string>> = {
    daylight: `${character.name} puts down ${character.id === "maya" ? "a tiny plant" : "a box"}, then looks at the dim window.`,
    quiet: `${character.name} tries to settle. Household noise comes straight through the wall.`,
    floorSpace: `${character.name} starts to unroll a yoga mat. It meets the bed, then the wall.`,
    desk: `${character.name} puts a laptop on the bed, types twice, and immediately regrets it.`,
    guitarSpace: `${character.name} opens the guitar case. The stand fits nowhere.`,
  };

  return [
    setup,
    {
      time: "0:03",
      characterId: failure.characterId,
      text: actionByFeature[failure.feature] ?? `${character.name} looks around ${room?.name ?? "the room"}. Something important is missing.`,
      reaction: character.id === "tara" ? "absolutely not." : character.id === "kabir" ? "Okay, tiny issue." : "…",
      tone: "tense",
    },
  ];
}

function buildNearMissEvents(level: GameLevel, assignment: Assignment, result: HarmonyResult): SimulationEvent[] {
  if (level.number === 2 && result.hardValid && result.harmony < level.authoredMaxHarmony) {
    return [
      { time: "5:30", characterId: "tara", text: "Tara checks the clock, then the dark window. Morning has not reached this room.", reaction: "😐", tone: "comic" },
      { time: "7:10", characterId: "maya", text: "Maya tries to place five plants in the small room. One waits on the floor.", reaction: "not ideal", tone: "comic" },
      { time: "7:20", characterId: "dev", text: "Dev reaches the kitchen without complaint. At least somebody is delighted.", reaction: "toast?", tone: "warm" },
    ];
  }
  if (level.number === 6 && result.hardValid && !result.passed) {
    const finnRoom = assignment.finn;
    const taraRoom = assignment.tara;
    return [
      { time: "10:00", characterId: "finn", text: `Finn starts work in ${level.house.rooms.find((room) => room.id === finnRoom)?.name ?? "his room"}. The blender starts beside the common area.`, reaction: "headphones on", tone: "comic" },
      { time: "05:31", characterId: "tara", text: `Tara wakes in ${level.house.rooms.find((room) => room.id === taraRoom)?.name ?? "her room"}. The window is still dark.`, reaction: "😐", tone: "tense" },
    ];
  }
  return level.simulation;
}

function makeAssignment(level: GameLevel, value: Record<CharacterId, string>): Assignment {
  const next = emptyAssignment(level);
  level.characterIds.forEach((id) => {
    next[id] = value[id];
  });
  return next;
}

function findInvalidAssignment(level: GameLevel): Assignment {
  const roomIds = level.house.rooms.map((room) => room.id);
  const candidates: string[][] = [];
  const visit = (used: string[], remaining: string[]) => {
    if (!remaining.length) {
      candidates.push(used);
      return;
    }
    remaining.forEach((roomId, index) => visit([...used, roomId], [...remaining.slice(0, index), ...remaining.slice(index + 1)]));
  };
  visit([], roomIds);
  for (const candidate of candidates) {
    const assignment = emptyAssignment(level);
    level.characterIds.forEach((id, index) => {
      assignment[id] = candidate[index];
    });
    if (!evaluateAssignment(level, assignment).hardValid) return assignment;
  }
  return emptyAssignment(level);
}

export default function Home() {
  const [levelIndex, setLevelIndex] = useState(() => {
    if (process.env.NODE_ENV === "production" || typeof window === "undefined") return 0;
    const requestedLevel = Number(new URLSearchParams(window.location.search).get("level"));
    return Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= GAME_LEVELS.length ? requestedLevel - 1 : 0;
  });
  const level = GAME_LEVELS[levelIndex];
  const [assignment, setAssignment] = useState<Assignment>(() => emptyAssignment(GAME_LEVELS[levelIndex]));
  const [history, setHistory] = useState<Assignment[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>(GAME_LEVELS[levelIndex].characterIds[0]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [completed, setCompleted] = useState<Record<number, number>>({});
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugFlags, setDebugFlags] = useState<DebugFlags>(DEFAULT_DEBUG);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const titlePressTimer = useRef<number | null>(null);

  const placedCount = level.characterIds.filter((id) => Boolean(assignment[id])).length;
  const allPlaced = placedCount === level.characterIds.length;
  const liveResult = useMemo(() => evaluateAssignment(level, assignment), [assignment, level]);
  const solverReport = useMemo(() => solveLevel(level), [level]);
  const selectedPreferences = useMemo(
    () => level.preferences.filter((item) => item.characterId === selectedCharacter).sort((a, b) => preferenceOrder(a) - preferenceOrder(b)),
    [level, selectedCharacter],
  );
  const selectedRoom = selectedRoomId ? level.house.rooms.find((item) => item.id === selectedRoomId) ?? null : null;
  const activeHint = hintIndex >= 0 ? level.hints[hintIndex % level.hints.length] : null;
  const maxUnlocked = Math.min(GAME_LEVELS.length, Math.max(1, ...Object.keys(completed).map(Number).map((number) => number + 1)));
  const currentEvent = simulation ? simulation.events[simulation.step] : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("lease-me-alone-progress-v1");
        if (stored) setCompleted(JSON.parse(stored) as Record<number, number>);
      } catch {
        // Local progress is optional.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const makeSound = useCallback(
    (kind: "pick" | "drop" | "move") => {
      if (!soundOn || typeof window === "undefined") return;
      const AudioContextType = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextType) return;
      const context = new AudioContextType();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "drop" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(kind === "pick" ? 280 : kind === "move" ? 350 : 190, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(kind === "drop" ? 125 : 230, context.currentTime + 0.09);
      gain.gain.setValueAtTime(0.035, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.11);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
      oscillator.addEventListener("ended", () => void context.close());
    },
    [soundOn],
  );

  const changeLevel = useCallback((index: number) => {
    const nextLevel = GAME_LEVELS[index];
    setLevelIndex(index);
    setAssignment(emptyAssignment(nextLevel));
    setHistory([]);
    setSelectedCharacter(nextLevel.characterIds[0]);
    setSelectedRoomId(null);
    setHintIndex(-1);
    setSimulation(null);
    setMapOpen(false);
    setDebugOpen(false);
    setDebugFlags(DEFAULT_DEBUG);
  }, []);

  const placeCharacter = useCallback(
    (characterId: CharacterId, roomId: string) => {
      if (simulation) return;
      const previousRoom = assignment[characterId];
      const occupant = level.characterIds.find((id) => id !== characterId && assignment[id] === roomId);
      const next = { ...assignment, [characterId]: roomId };
      if (occupant) next[occupant] = previousRoom ?? null;
      setHistory((items) => [...items.slice(-14), assignment]);
      setAssignment(next);
      setSelectedCharacter(characterId);
      setSelectedRoomId(roomId);
      makeSound("drop");
    },
    [assignment, level.characterIds, makeSound, simulation],
  );

  const beginDrag = (event: React.PointerEvent, characterId: CharacterId) => {
    if (simulation) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    setSelectedCharacter(characterId);
    setSelectedRoomId(null);
    setDrag({ characterId, x: event.clientX, y: event.clientY, moved: false });
    makeSound("pick");
  };

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const start = dragStart.current;
      const moved = Boolean(start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7);
      setDrag((current) => current ? { ...current, x: event.clientX, y: event.clientY, moved: current.moved || moved } : null);
    };
    const end = (event: PointerEvent) => {
      setDrag((current) => {
        if (current?.moved) {
          const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-room-id]");
          const roomId = target?.dataset.roomId;
          if (roomId) placeCharacter(current.characterId, roomId);
        }
        return null;
      });
      dragStart.current = null;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", end, { once: true });
    window.addEventListener("pointercancel", end, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [drag, placeCharacter]);

  const beginSimulation = useCallback((candidate: Assignment = assignment) => {
    const result = evaluateAssignment(level, candidate);
    if (!result.complete) return;
    const events = !result.hardValid
      ? buildFailureEvents(level, result)
      : buildNearMissEvents(level, candidate, result);
    setAssignment(candidate);
    setSelectedRoomId(null);
    setHintIndex(-1);
    setSimulation({ step: 0, events, result, finished: false });
    makeSound("move");
  }, [assignment, level, makeSound]);

  useEffect(() => {
    if (!simulation || simulation.finished) return;
    const isFinal = simulation.step >= simulation.events.length - 1;
    const levelSixPace = level.number === 6 && simulation.result.passed ? 3400 : 1900;
    const timer = window.setTimeout(() => {
      setSimulation((current) => {
        if (!current) return null;
        return isFinal ? { ...current, finished: true } : { ...current, step: current.step + 1 };
      });
    }, isFinal ? 1500 : levelSixPace);
    return () => window.clearTimeout(timer);
  }, [level.number, simulation]);

  const reset = useCallback(() => {
    setAssignment(emptyAssignment(level));
    setHistory([]);
    setSelectedCharacter(level.characterIds[0]);
    setSelectedRoomId(null);
    setHintIndex(-1);
    setSimulation(null);
  }, [level]);

  const undo = () => {
    const previous = history.at(-1);
    if (!previous || simulation) return;
    setAssignment(previous);
    setHistory((items) => items.slice(0, -1));
    makeSound("move");
  };

  const recordCompletion = (result: HarmonyResult) => {
    const next = { ...completed, [level.number]: Math.max(completed[level.number] ?? 0, result.harmony) };
    setCompleted(next);
    try {
      window.localStorage.setItem("lease-me-alone-progress-v1", JSON.stringify(next));
    } catch {
      // The game remains playable without stored progress.
    }
  };

  const continueAfterResult = () => {
    if (!simulation?.result.passed) return;
    recordCompletion(simulation.result);
    if (levelIndex < GAME_LEVELS.length - 1) changeLevel(levelIndex + 1);
    else {
      setSimulation(null);
      setMapOpen(true);
    }
  };

  const selectedCharacterData = CHARACTERS[selectedCharacter];
  const houseArt = level.house.rooms.length === 2
    ? "/art/lease-me-alone-topdown-2.png"
    : level.house.rooms.length === 3
      ? "/art/lease-me-alone-topdown-3.png"
      : "/art/lease-me-alone-topdown.png";
  const resultTitle = simulation
    ? !simulation.result.hardValid
      ? `${CHARACTERS[simulation.result.failedNeeds[0]?.characterId ?? level.characterIds[0]].name} cannot settle here.`
      : simulation.result.harmony === level.authoredMaxHarmony
        ? level.successTitle
        : level.nearMissTitle ?? "Everyone could live here. They probably shouldn't."
    : "";

  return (
    <main className="game-shell reference-ui">
      <header className="topbar">
        <button className="icon-button" type="button" onClick={() => setMapOpen(true)} aria-label="Open level map">‹</button>
        <div className="brand-lockup"><strong>Lease Me Alone</strong><span>a game about horrible people living in the same house</span></div>
        <div
          className="level-heading"
          onPointerDown={() => {
            if (process.env.NODE_ENV === "production") return;
            titlePressTimer.current = window.setTimeout(() => setDebugOpen(true), 700);
          }}
          onPointerUp={() => { if (titlePressTimer.current) window.clearTimeout(titlePressTimer.current); }}
          onPointerLeave={() => { if (titlePressTimer.current) window.clearTimeout(titlePressTimer.current); }}
        >
          <span>{level.chapter} · Level {String(level.number).padStart(2, "0")}</span>
          <h1>{level.title}</h1>
        </div>
        <div className="level-pips" aria-label={`Level ${level.number} of ${GAME_LEVELS.length}`}>
          {GAME_LEVELS.map((item) => <i key={item.id} className={`${item.number === level.number ? "is-current" : ""} ${completed[item.number] !== undefined ? "is-complete" : ""}`} />)}
        </div>
        <div className="top-actions">
          <button className="text-button" type="button" onClick={() => setHintIndex((index) => (index + 1) % level.hints.length)}>☀ Hint</button>
          <button className="icon-button" type="button" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute sound" : "Turn sound on"}>{soundOn ? "♪" : "×"}</button>
        </div>
      </header>

      <section className="game-layout">
        <section className="board-panel" aria-label={`${level.title} apartment puzzle`}>
          <div className="objective-strip">
            <div><span>HOUSEHOLD GOAL</span><strong>{level.teaching}</strong></div>
            <div className="objective-meta">
              <span>{"★".repeat(level.difficulty)}{"☆".repeat(5 - level.difficulty)}</span>
              <b>{placedCount}/{level.characterIds.length} assigned</b>
              {level.showHarmony && allPlaced && <strong className="harmony-live"><i />{liveResult.harmony}% Harmony</strong>}
            </div>
          </div>

          {level.openingCopy && <p className="opening-note">{level.openingCopy}</p>}

          <div className="house-scroll">
            <div className="house-shadow" />
            <div className={`house-plan house-plan--${level.house.rooms.length} ${level.house.rooms.length === 2 ? "house-plan--sparse" : ""} ${drag?.moved ? "is-dragging" : ""} ${simulation ? "is-simulating" : ""}`}>
              <Image className="house-watercolor" src={houseArt} alt="" fill sizes="(max-width: 940px) 760px, 70vw" priority />
              {level.house.rooms.map((room, index) => {
                const occupant = level.characterIds.find((id) => assignment[id] === room.id);
                const showFeatures = selectedRoomId === room.id || debugFlags.roomFeatures;
                const isHinted = activeHint?.focusRoomId === room.id;
                const activeActor = currentEvent?.characterId && occupant === currentEvent.characterId;
                return (
                  <button
                    type="button"
                    key={room.id}
                    data-room-id={room.id}
                    className={`bedroom bedroom--slot-${index + 1} bedroom--${room.color} ${occupant ? "is-occupied" : ""} ${selectedRoomId === room.id ? "is-selected" : ""} ${isHinted ? "is-hinted" : ""} ${activeActor ? "is-acting" : ""}`}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      if (selectedCharacter) placeCharacter(selectedCharacter, room.id);
                    }}
                    aria-label={`${room.name}. ${room.description}${occupant ? ` Occupied by ${CHARACTERS[occupant].name}.` : " Empty."}`}
                  >
                    <span className="bedroom__wash" />
                    <span className="bedroom__number">{index + 1}</span>
                    <span className="bedroom__title"><small>ROOM {index + 1}</small><strong>{room.name}</strong></span>

                    {occupant && (
                      <span className={`roommate-token ${activeActor ? "is-active" : ""}`}>
                        <CharacterPortrait characterId={occupant} small />
                        <b>{CHARACTERS[occupant].name}</b>
                        {debugFlags.characterNeeds && <em>{level.preferences.filter((item) => item.characterId === occupant && item.priority === "need").map((item) => item.icon).join(" ")}</em>}
                      </span>
                    )}

                    {showFeatures && (
                      <span className="room-feature-card">
                        <b>{room.description}</b>
                        {Object.entries(room.features)
                          .filter(([feature, value]) => isFeatureShown(feature as RoomFeature, value))
                          .map(([feature, value]) => (
                            <i key={feature}><span>{FEATURE_LABELS[feature as RoomFeature].icon}</span>{roomFeatureText(feature as RoomFeature, value)}</i>
                          ))}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="common-space" aria-label="Shared living room and kitchen"><span className="common-space__label">SHARED SPACE</span><span className="front-door">ENTRANCE</span></div>

              {simulation && currentEvent && (
                <div className={`simulation-layer simulation-layer--${currentEvent.tone ?? "warm"}`} aria-live="polite">
                  <div className="simulation-scene">
                    <div className="simulation-artboard">
                      <Image className="simulation-house-art" src="/art/lease-me-alone-cutaway.png" alt="" fill sizes="(max-width: 940px) 720px, 70vw" />
                      <div className="simulation-residents" aria-hidden="true">
                        {level.characterIds.map((characterId) => {
                          const roomId = assignment[characterId];
                          const roomIndex = Math.max(0, level.house.rooms.findIndex((room) => room.id === roomId));
                          const isSpeaking = currentEvent.characterId === characterId;
                          return (
                            <span className={`simulation-resident simulation-resident--slot-${roomIndex + 1} ${isSpeaking ? "is-speaking" : ""}`} key={characterId}>
                              <CharacterPortrait characterId={characterId} small />
                              <b>{CHARACTERS[characterId].name}</b>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`simulation-caption ${currentEvent.characterId ? "" : "simulation-caption--narration"}`} key={`${simulation.step}-${currentEvent.time}`}>
                    {currentEvent.characterId && (
                      <span className="simulation-caption__speaker">
                        <CharacterPortrait characterId={currentEvent.characterId} small />
                        <b>{CHARACTERS[currentEvent.characterId].name}</b>
                      </span>
                    )}
                    <p>{currentEvent.text}</p>
                    {currentEvent.reaction && <strong>{currentEvent.reaction}</strong>}
                  </div>
                  <div className="simulation-clock"><span>{currentEvent.time}</span><div>{simulation.events.map((_, index) => <i key={index} className={index <= simulation.step ? "is-past" : ""} />)}</div><button type="button" onClick={() => setSimulation((current) => current ? { ...current, finished: true } : null)}>Skip</button></div>
                  <button className="simulation-skip-mobile" type="button" onClick={() => setSimulation((current) => current ? { ...current, finished: true } : null)}>Skip animation</button>
                </div>
              )}
            </div>
          </div>

          <div className="board-controls">
            <div>
              <button type="button" onClick={undo} disabled={!history.length || Boolean(simulation)}>↶ Undo</button>
              <button type="button" onClick={reset} disabled={Boolean(simulation)}>Reset</button>
            </div>
            <p>{selectedCharacter ? `${CHARACTERS[selectedCharacter].name} is ready. Select a room.` : "Select a roommate."}</p>
            <button className="move-in-button" type="button" disabled={!allPlaced || Boolean(simulation)} onClick={() => beginSimulation()}>
              <span>{allPlaced ? "Open the house" : `${level.characterIds.length - placedCount} still need a room`}</span>
              <strong>MOVE IN</strong><i>→</i>
            </button>
          </div>

          {activeHint && (
            <div className="hint-note" role="status">
              <span>{activeHint.characterId ? CHARACTERS[activeHint.characterId].name.slice(0, 1) : "✦"}</span>
              <div><small>HINT {hintIndex + 1} OF 3</small><p>{activeHint.text}</p></div>
              <button type="button" onClick={() => setHintIndex(-1)} aria-label="Close hint">×</button>
            </div>
          )}
        </section>

        <aside className="case-panel">
          <div className="case-tab">ROOMMATE INFO & PREFERENCES</div>
          <div className="character-sheet">
            <div className="character-heading">
              <CharacterPortrait characterId={selectedCharacter} />
              <div><span>{selectedCharacterData.role}</span><h2>{selectedCharacterData.name}</h2><p>{selectedCharacterData.personality}</p></div>
            </div>
            <blockquote>“{selectedCharacterData.quote}”</blockquote>
            <div className="preference-key"><span><i>N</i>Need</span><span><i>W</i>Want · 2</span><span><i>L</i>Like · 1</span></div>
            <div className="preference-list">
              {selectedPreferences.map((preference) => (
                <div className={`preference preference--${preference.priority}`} key={preference.id}>
                  <b>{preference.priority}</b><span>{preference.icon}</span><p>{preference.label}</p>
                  {debugFlags.harmonyWeights && preferenceWeight(preference) && <em>{preferenceWeight(preference)} pt</em>}
                </div>
              ))}
            </div>
            <div className="sheet-note">
              <span>{PROP_MARKS[selectedCharacter]}</span>
              <p><small>MOVING WITH</small>{selectedCharacterData.prop}</p>
            </div>
            <p className="inspector-tip">Needs are required. Wants and Likes improve Harmony.</p>
          </div>

          {selectedRoom && (
            <div className="selected-room-note">
              <small>SELECTED ROOM</small><strong>{selectedRoom.name}</strong><span>{selectedRoom.description}</span>
            </div>
          )}
        </aside>
      </section>

      <section className="roommate-dock" aria-label="Roommates to assign">
        <div className="dock-intro"><span>ROOMMATES</span><strong>Drag or tap</strong><small>One person per room</small></div>
        <div className="dock-cards">
          {level.characterIds.map((characterId) => {
            const character = CHARACTERS[characterId];
            const roomId = assignment[characterId];
            const assignedRoom = roomId ? level.house.rooms.find((item) => item.id === roomId) : null;
            return (
              <button
                type="button"
                key={characterId}
                className={`roommate-card roommate-card--${character.color} ${selectedCharacter === characterId ? "is-selected" : ""}`}
                onPointerDown={(event) => beginDrag(event, characterId)}
                onClick={() => { setSelectedCharacter(characterId); setSelectedRoomId(null); }}
                aria-label={`Select ${character.name}. ${assignedRoom ? `Assigned to ${assignedRoom.name}.` : "Not assigned."}`}
              >
                <CharacterPortrait characterId={characterId} />
                <span><strong>{character.name}</strong><small>{character.role}</small><i>{assignedRoom?.name ?? "waiting with boxes"}</i></span>
                <b>{roomId ? "✓" : "+"}</b>
              </button>
            );
          })}
        </div>
      </section>

      {drag?.moved && (
        <div className="drag-ghost" style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0)` }} aria-hidden="true">
          <CharacterPortrait characterId={drag.characterId} />
          <span>{CHARACTERS[drag.characterId].name}</span>
        </div>
      )}

      {simulation?.finished && (
        <div className="modal-backdrop">
          <section className={`result-card ${simulation.result.passed ? "is-success" : "is-failure"}`} role="dialog" aria-modal="true" aria-labelledby="result-title">
            <span className="result-kicker">FEEDBACK AFTER SIMULATION</span>
            <span className="result-paperclip" aria-hidden="true">⌇</span>
            {level.showHarmony && simulation.result.hardValid && <strong className="result-score">{simulation.result.harmony}% <span>HOUSEHOLD HARMONY</span></strong>}
            <h2 id="result-title">{resultTitle}</h2>
            {!simulation.result.hardValid ? (
              <p className="need-failure"><b>{simulation.result.failedNeeds[0]?.icon}</b>{CHARACTERS[simulation.result.failedNeeds[0]?.characterId ?? level.characterIds[0]].name} needs {simulation.result.failedNeeds[0]?.label.toLowerCase()}.</p>
            ) : simulation.result.harmony < level.authoredMaxHarmony ? (
              <p>{level.number === 2 ? "Every Need is met. Continue now, or rearrange for a happier home." : "Every Need is met, but this is not the best use of the rooms."}</p>
            ) : (
              <p>{level.number === 5 ? "No 100% solution exists. This is the best possible home." : "The rooms fit the people. The tiny life of the house can begin."}</p>
            )}
            <div className="result-list">
              {level.characterIds.map((id) => {
                const feedback = residentFeedback(level, assignment, id, simulation.result);
                return <div key={id}><CharacterPortrait characterId={id} small /><b>{CHARACTERS[id].name}</b><i className={`result-tone--${feedback.tone}`}>{feedback.icon}</i><span>{feedback.label}</span></div>;
              })}
            </div>
            <div className="result-actions">
              {simulation.result.passed && <button className="primary-action" type="button" onClick={continueAfterResult}>{levelIndex === GAME_LEVELS.length - 1 ? "Chapter map" : "Continue"}</button>}
              <button type="button" onClick={() => setSimulation(null)}>{simulation.result.passed ? "Rearrange" : "Try another arrangement"}</button>
            </div>
          </section>
        </div>
      )}

      {mapOpen && (
        <div className="modal-backdrop">
          <section className="level-map" role="dialog" aria-modal="true" aria-labelledby="map-title">
            <button className="map-close" type="button" onClick={() => setMapOpen(false)} aria-label="Close level map">×</button>
            <span>CHAPTER 1 · MOVING DAY</span>
            <h2 id="map-title">Six small houses. Five large personalities.</h2>
            <p>Complete each move to open the next front door.</p>
            <div className="map-path"><i /><i /><i /></div>
            <div className="map-levels">
              {GAME_LEVELS.map((item, index) => {
                const unlocked = item.number <= maxUnlocked;
                return (
                  <button type="button" key={item.id} disabled={!unlocked} className={`${item.number === level.number ? "is-current" : ""} ${completed[item.number] !== undefined ? "is-complete" : ""}`} onClick={() => changeLevel(index)}>
                    <span className={`map-house map-house--${(index % 3) + 1}`}><i /><b>{unlocked ? item.number : "·"}</b></span>
                    <strong>{item.title}</strong><small>{completed[item.number] !== undefined ? `${completed[item.number]}% best` : unlocked ? item.target : "Locked"}</small>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {debugOpen && process.env.NODE_ENV !== "production" && (
        <aside className="debug-drawer">
          <button className="debug-close" type="button" onClick={() => setDebugOpen(false)}>×</button>
          <span>DEVELOPER MODE</span><h2>{level.number.toString().padStart(2, "0")} — {level.title}</h2>
          <dl><div><dt>Permutations</dt><dd>{solverReport.permutations}</dd></div><div><dt>Hard-valid</dt><dd>{solverReport.hardValidCount}</dd></div><div><dt>Maximum</dt><dd>{solverReport.maxHarmony}%</dd></div><div><dt>Perfect</dt><dd>{solverReport.perfectCount}</dd></div></dl>
          <p className={solverReport.warnings.length ? "has-warning" : "is-valid"}>{solverReport.warnings.length ? solverReport.warnings.join(" ") : "STATUS: VALID"}</p>
          <div className="debug-actions">
            {([
              ["roomFeatures", "SHOW ROOM FEATURES"],
              ["characterNeeds", "SHOW CHARACTER NEEDS"],
              ["harmonyWeights", "SHOW HARMONY WEIGHTS"],
              ["solutions", "SHOW ALL VALID SOLUTIONS"],
            ] as [keyof DebugFlags, string][]).map(([key, label]) => <button type="button" key={key} className={debugFlags[key] ? "is-on" : ""} onClick={() => setDebugFlags((current) => ({ ...current, [key]: !current[key] }))}>{label}</button>)}
            <button type="button" onClick={() => setAssignment(makeAssignment(level, level.intendedAssignment))}>AUTO-SOLVE</button>
            <button type="button" onClick={reset}>RESET LEVEL</button>
            <button type="button" onClick={() => beginSimulation(makeAssignment(level, level.intendedAssignment))}>PLAY SUCCESS SIMULATION</button>
            <button type="button" onClick={() => beginSimulation(findInvalidAssignment(level))}>PLAY FAILURE SIMULATION</button>
          </div>
          {debugFlags.solutions && <div className="debug-solutions">{solverReport.solutions.map((solution, index) => <p key={index}><b>{solution.result.harmony}%</b>{level.characterIds.map((id) => `${CHARACTERS[id].name} → ${level.house.rooms.find((room) => room.id === solution.assignment[id])?.name}`).join(" · ")}</p>)}</div>}
        </aside>
      )}
    </main>
  );
}
