"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PersonId = "tara" | "dev" | "kabir";
type RoomId = "a" | "b" | "c";
type ZoneId = RoomId | "living" | "kitchen" | "hall";
type ObjectId = "catbed" | "record";
type Picked = { type: "person"; id: PersonId } | { type: "object"; id: ObjectId };
type Layout = {
  people: Record<PersonId, RoomId | null>;
  objects: Record<ObjectId, ZoneId>;
};

const PEOPLE: Record<
  PersonId,
  {
    name: string;
    role: string;
    color: string;
    quote: string;
    tells: string[];
  }
> = {
  tara: {
    name: "Tara",
    role: "Early bird · light sleeper",
    color: "coral",
    quote: "Anywhere is fine. Somewhere sunny is finer.",
    tells: ["Up at 5:30", "Needs yoga space", "Cat allergy"],
  },
  dev: {
    name: "Dev",
    role: "Midnight cook · extrovert",
    color: "mustard",
    quote: "I only use one pan. It is, admittedly, enormous.",
    tells: ["Lives in the kitchen", "Hates tiny rooms", "Always has people over"],
  },
  kabir: {
    name: "Kabir",
    role: "Night owl · cat staff",
    color: "blue",
    quote: "Chairman Meow and I come as a package deal.",
    tells: ["Plays four guitar songs", "Sleeps late", "Owns the cat"],
  },
};

const ROOMS: Record<RoomId, { name: string; letter: string; note: string }> = {
  a: { name: "Sunroom", letter: "A", note: "Morning light · roomy" },
  b: { name: "Blue room", letter: "B", note: "By the kitchen · ensuite" },
  c: { name: "Balcony room", letter: "C", note: "Quiet · far from kitchen" },
};

const INITIAL_LAYOUT: Layout = {
  people: { tara: null, dev: null, kabir: null },
  objects: { catbed: "hall", record: "c" },
};

const ADJACENT: Record<RoomId, RoomId[]> = {
  a: ["b"],
  b: ["a"],
  c: [],
};

function isAdjacent(one: RoomId | null, two: RoomId | null) {
  return !!one && !!two && ADJACENT[one].includes(two);
}

function Portrait({ person, small = false }: { person: PersonId; small?: boolean }) {
  return (
    <span className={`portrait portrait--${person} ${small ? "portrait--small" : ""}`} aria-hidden="true">
      <span className="portrait__hair" />
      <span className="portrait__head">
        <span className="portrait__eyes" />
        <span className="portrait__mouth" />
      </span>
      <span className="portrait__body" />
      {person === "tara" && <span className="portrait__bun" />}
      {person === "kabir" && <span className="portrait__headphones" />}
      {person === "dev" && <span className="portrait__glasses" />}
    </span>
  );
}

function satisfaction(layout: Layout, person: PersonId) {
  const room = layout.people[person];
  const tara = layout.people.tara;
  const kabir = layout.people.kabir;

  if (!room) return { mood: "waiting", face: "•", label: "Waiting in the hall", checks: [] as { ok: boolean; text: string }[] };

  const checks =
    person === "tara"
      ? [
          { ok: room === "a", text: "Morning sunlight" },
          { ok: room === "a", text: "Floor space for yoga" },
          { ok: !isAdjacent(room, kabir), text: "No midnight guitar next door" },
          { ok: layout.objects.catbed !== room, text: "Cat bed kept elsewhere" },
        ]
      : person === "dev"
        ? [
            { ok: room === "b", text: "A quick route to the kitchen" },
            { ok: room !== "c", text: "Not the tiniest bedroom" },
            { ok: true, text: "People pass by often" },
          ]
        : [
            { ok: room === "c", text: "Far from breakfast clatter" },
            { ok: layout.objects.catbed === room, text: "Chairman Meow nearby" },
            { ok: layout.objects.record === "living", text: "Records live in the lounge" },
            { ok: !isAdjacent(room, tara), text: "No light sleeper next door" },
          ];

  const good = checks.filter((item) => item.ok).length;
  const ratio = good / checks.length;
  if (ratio === 1) return { mood: "happy", face: "☺", label: "Completely happy", checks };
  if (ratio >= 0.66) return { mood: "mostly", face: "◡", label: "Mostly happy", checks };
  if (ratio >= 0.45) return { mood: "unsure", face: "—", label: "Something isn’t right", checks };
  return { mood: "angry", face: "⌁", label: "Major problem", checks };
}

function getHarmony(layout: Layout) {
  const placed = Object.values(layout.people).filter(Boolean).length;
  if (placed < 3) return { score: 0, label: "Three people are still negotiating" };
  const allChecks = (["tara", "dev", "kabir"] as PersonId[]).flatMap((id) => satisfaction(layout, id).checks);
  const score = Math.round((allChecks.filter((item) => item.ok).length / allChecks.length) * 100);
  return {
    score,
    label: score === 100 ? "Domestic bliss" : score >= 80 ? "Surprisingly livable" : "Deposit definitely gone",
  };
}

const SIMULATION = [
  { phase: "7:02 am", copy: "Tara unrolls her yoga mat. Dev begins a suspiciously ambitious breakfast.", actor: "tara" as PersonId },
  { phase: "8:14 am", copy: "Chairman Meow begins his daily inspection of soft furnishings.", actor: "kabir" as PersonId },
  { phase: "2:36 pm", copy: "Dev offers everybody lunch. It has somehow used seven pans.", actor: "dev" as PersonId },
  { phase: "11:48 pm", copy: "Kabir remembers a chord. Tara remembers every decision that led here.", actor: "kabir" as PersonId },
];

export default function Home() {
  const [layout, setLayout] = useState<Layout>(INITIAL_LAYOUT);
  const [history, setHistory] = useState<Layout[]>([]);
  const [picked, setPicked] = useState<Picked | null>({ type: "person", id: "tara" });
  const [hint, setHint] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ item: Picked; x: number; y: number; moved: boolean } | null>(null);
  const [simulation, setSimulation] = useState<{ step: number; done: boolean } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const placedCount = Object.values(layout.people).filter(Boolean).length;
  const harmony = useMemo(() => getHarmony(layout), [layout]);
  const selectedPerson = picked?.type === "person" ? picked.id : null;

  const makeSound = useCallback(
    (kind: "pick" | "drop" | "button" = "drop") => {
      if (!soundOn || typeof window === "undefined") return;
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = kind === "drop" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(kind === "pick" ? 260 : kind === "button" ? 360 : 180, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(kind === "drop" ? 120 : 240, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.11);
      oscillator.addEventListener("ended", () => void ctx.close());
    },
    [soundOn],
  );

  const commit = useCallback(
    (next: Layout) => {
      setHistory((items) => [...items.slice(-11), layout]);
      setLayout(next);
      makeSound("drop");
    },
    [layout, makeSound],
  );

  const place = useCallback(
    (item: Picked, zone: ZoneId) => {
      if (item.type === "person" && !(["a", "b", "c"] as ZoneId[]).includes(zone)) return;
      if (item.type === "person") {
        const room = zone as RoomId;
        const displaced = (Object.entries(layout.people) as [PersonId, RoomId | null][]).find(
          ([id, assigned]) => id !== item.id && assigned === room,
        )?.[0];
        commit({
          ...layout,
          people: { ...layout.people, [item.id]: room, ...(displaced ? { [displaced]: null } : {}) },
        });
        setPicked({ type: "person", id: item.id });
      } else {
        commit({ ...layout, objects: { ...layout.objects, [item.id]: zone } });
        setPicked(item);
      }
    },
    [commit, layout],
  );

  const handleZone = (zone: ZoneId) => {
    if (picked) place(picked, zone);
  };

  const beginPick = (event: React.PointerEvent, item: Picked) => {
    if (simulation) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    setDrag({ item, x: event.clientX, y: event.clientY, moved: false });
    setPicked(item);
    makeSound("pick");
  };

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const start = dragStart.current;
      const moved = !!start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7;
      setDrag((current) => (current ? { ...current, x: event.clientX, y: event.clientY, moved: current.moved || moved } : null));
    };
    const end = (event: PointerEvent) => {
      setDrag((current) => {
        if (current?.moved) {
          const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-dropzone]");
          const zone = target?.dataset.dropzone as ZoneId | undefined;
          if (zone) place(current.item, zone);
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
  }, [drag, place]);

  useEffect(() => {
    if (!simulation || simulation.done) return;
    const timer = window.setTimeout(() => {
      setSimulation((current) => {
        if (!current) return null;
        if (current.step >= SIMULATION.length - 1) return { ...current, done: true };
        return { step: current.step + 1, done: false };
      });
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [simulation]);

  const undo = () => {
    const previous = history.at(-1);
    if (!previous || simulation) return;
    setLayout(previous);
    setHistory((items) => items.slice(0, -1));
    makeSound("button");
  };

  const startSimulation = () => {
    if (placedCount < 3) {
      setHint("The hallway is getting awkward. Give everyone a bedroom first.");
      return;
    }
    setHint(null);
    setPicked(null);
    setSimulation({ step: 0, done: false });
    makeSound("button");
  };

  const activeSimulation = simulation ? SIMULATION[simulation.step] : null;
  const actorRoom = activeSimulation ? layout.people[activeSimulation.actor] : null;

  const objectToken = (id: ObjectId) => {
    const active = picked?.type === "object" && picked.id === id;
    return (
      <button
        type="button"
        className={`object-token ${active ? "is-picked" : ""}`}
        onPointerDown={(event) => beginPick(event, { type: "object", id })}
        aria-label={`Pick up ${id === "catbed" ? "Chairman Meow's cat bed" : "record player"}`}
      >
        <span>{id === "catbed" ? "🐈" : "♫"}</span>
        <small>{id === "catbed" ? "cat bed" : "records"}</small>
      </button>
    );
  };

  const room = (id: RoomId) => {
    const occupant = (Object.entries(layout.people) as [PersonId, RoomId | null][]).find(([, assigned]) => assigned === id)?.[0];
    const isTarget = picked?.type === "person" || picked?.type === "object";
    return (
      <div
        role="button"
        tabIndex={0}
        className={`room room--${id} ${occupant ? "is-lived-in" : ""} ${isTarget ? "is-drop-ready" : ""}`}
        data-dropzone={id}
        onClick={() => handleZone(id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleZone(id);
          }
        }}
        aria-label={`${ROOMS[id].name}${occupant ? `, occupied by ${PEOPLE[occupant].name}` : ", empty"}. Tap to place selected item.`}
      >
        <span className="room__label">
          <span>Room {ROOMS[id].letter}</span>
          <strong>{ROOMS[id].name}</strong>
          <small>{ROOMS[id].note}</small>
        </span>
        <span className="window"><i /></span>
        <span className="bed"><i /></span>
        {id === "a" && <><span className="sunbeam" /><span className="plant">♧</span><span className="rug rug--round" /></>}
        {id === "b" && <><span className="ensuite">shower<br />inside</span><span className="lamp">●</span></>}
        {id === "c" && <><span className="balcony">fresh air<br />→</span><span className="guitar">♩</span></>}
        {occupant && (
          <span className={`resident resident--${occupant}`}>
            <Portrait person={occupant} small />
            <span className={`mood-dot mood-dot--${satisfaction(layout, occupant).mood}`}>{satisfaction(layout, occupant).face}</span>
          </span>
        )}
        {layout.objects.catbed === id && objectToken("catbed")}
        {layout.objects.record === id && objectToken("record")}
      </div>
    );
  };

  return (
    <main className="game-shell">
      <header className="topbar">
        <button className="round-button" type="button" aria-label="Back to chapter map">←</button>
        <div className="level-title">
          <span>Chapter 4 · Chairman Meow</span>
          <h1>4B — The Night Owl Problem</h1>
        </div>
        <div className="topbar__actions">
          <button
            className="round-button sound-button"
            type="button"
            aria-label={soundOn ? "Mute sound" : "Turn sound on"}
            aria-pressed={soundOn}
            onClick={() => setSoundOn((value) => !value)}
          >
            {soundOn ? "♪" : "×"}
          </button>
          <button
            className="hint-button"
            type="button"
            onClick={() => setHint("TARA: I’m starting to think I’d sleep better where the sun arrives before Kabir’s guitar does.")}
          >
            <span aria-hidden="true">✦</span> Hint
          </button>
        </div>
      </header>

      <section className="game-stage">
        <div className="board-column">
          <div className="objective-note">
            <span className="objective-note__pin" />
            <span><small>HOUSEHOLD GOAL</small> Make everyone happy. Yes, everyone.</span>
            <strong>{placedCount}/3 moved in</strong>
          </div>

          <div className="apartment-wrap">
            <div className="apartment-shadow" />
            <div className={`apartment ${simulation ? "is-running" : ""}`}>
              {room("a")}
              {room("b")}
              {room("c")}

              <div
                role="button"
                tabIndex={0}
                className="common-room living-room"
                data-dropzone="living"
                onClick={() => handleZone("living")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleZone("living");
                  }
                }}
                aria-label="Living room. Tap to place a selected object."
              >
                <span className="common-room__label">LIVING ROOM</span>
                <span className="sofa"><i /><i /></span>
                <span className="coffee-table">☕</span>
                <span className="big-plant">♧</span>
                <span className="television">TONIGHT<br /><b>NOTHING</b></span>
                {layout.objects.catbed === "living" && objectToken("catbed")}
                {layout.objects.record === "living" && objectToken("record")}
              </div>

              <div
                role="button"
                tabIndex={0}
                className="common-room kitchen"
                data-dropzone="kitchen"
                onClick={() => handleZone("kitchen")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleZone("kitchen");
                  }
                }}
                aria-label="Kitchen. Tap to place a selected object."
              >
                <span className="common-room__label">KITCHEN</span>
                <span className="counter"><i /><i /><i /></span>
                <span className="fridge">DEV<br />DO NOT<br />EAT</span>
                <span className="kettle">♨</span>
                {layout.objects.catbed === "kitchen" && objectToken("catbed")}
                {layout.objects.record === "kitchen" && objectToken("record")}
              </div>

              <div
                role="button"
                tabIndex={0}
                className="hall"
                data-dropzone="hall"
                onClick={() => handleZone("hall")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleZone("hall");
                  }
                }}
                aria-label="Hallway. Tap to place a selected object."
              >
                <span>HALL</span>
                <i className="front-door">4B</i>
                {layout.objects.catbed === "hall" && objectToken("catbed")}
                {layout.objects.record === "hall" && objectToken("record")}
              </div>

              {simulation && activeSimulation && (
                <div className={`life-layer life-layer--step-${simulation.step}`} aria-live="polite">
                  <div className={`life-person life-person--${activeSimulation.actor} life-person--room-${actorRoom ?? "hall"}`}>
                    <Portrait person={activeSimulation.actor} small />
                  </div>
                  <div className="life-cat">🐈</div>
                  <div className="life-caption">
                    <small>{activeSimulation.phase}</small>
                    <p>{activeSimulation.copy}</p>
                  </div>
                </div>
              )}
            </div>

            {hint && (
              <div className="message-toast" role="status">
                <span className="message-toast__avatar">T</span>
                <p>{hint}</p>
                <button type="button" onClick={() => setHint(null)} aria-label="Dismiss hint">×</button>
              </div>
            )}

            {simulation?.done && (
              <div className="result-card" role="dialog" aria-modal="true" aria-labelledby="result-title">
                <span className="result-card__eyebrow">THE HOUSE HAS SPOKEN</span>
                <div className="result-card__house" aria-hidden="true">⌂</div>
                <h2 id="result-title">{harmony.label}</h2>
                <p>
                  {harmony.score === 100
                    ? "Against all available evidence, these people can live together."
                    : harmony.score >= 80
                      ? "A few doors will be slammed, but the group chat may survive."
                      : "Somebody has already started browsing rental listings."}
                </p>
                <div className="result-moods">
                  {(["tara", "dev", "kabir"] as PersonId[]).map((id) => (
                    <span key={id}><Portrait person={id} small /><b>{satisfaction(layout, id).face}</b></span>
                  ))}
                </div>
                <button className="primary-button" type="button" onClick={() => setSimulation(null)}>
                  Rearrange the flat
                </button>
              </div>
            )}
          </div>

          <div className="controls-row">
            <div className="quiet-controls">
              <button type="button" onClick={undo} disabled={!history.length || !!simulation}>↶ Undo</button>
              <button
                type="button"
                onClick={() => {
                  if (simulation) return;
                  setHistory((items) => [...items, layout]);
                  setLayout(INITIAL_LAYOUT);
                  setPicked({ type: "person", id: "tara" });
                }}
                disabled={!!simulation}
              >
                Start over
              </button>
            </div>
            <span className="picked-caption">
              {picked?.type === "person" ? `${PEOPLE[picked.id].name} is ready to move` : picked?.type === "object" ? `Moving the ${picked.id === "catbed" ? "cat bed" : "record player"}` : "The flat is alive"}
            </span>
            <button className="move-in-button" type="button" onClick={startSimulation} disabled={!!simulation && !simulation.done}>
              <span>Open the house</span>
              <strong>MOVE IN</strong>
              <i>→</i>
            </button>
          </div>
        </div>

        <aside className="case-panel">
          <div className="case-panel__tab">CASE NOTES</div>
          {selectedPerson ? (
            <div className="person-file">
              <div className="person-file__intro">
                <Portrait person={selectedPerson} />
                <div>
                  <span className={`status-stamp status-stamp--${satisfaction(layout, selectedPerson).mood}`}>
                    {satisfaction(layout, selectedPerson).face} {satisfaction(layout, selectedPerson).label}
                  </span>
                  <h2>{PEOPLE[selectedPerson].name}</h2>
                  <p>{PEOPLE[selectedPerson].role}</p>
                </div>
              </div>
              <blockquote>“{PEOPLE[selectedPerson].quote}”</blockquote>
              <div className="tells">
                {PEOPLE[selectedPerson].tells.map((tell, index) => <span key={tell}><b>{["◷", "⌂", "✦"][index]}</b>{tell}</span>)}
              </div>
              <div className="needs">
                <h3>{layout.people[selectedPerson] ? "How it’s going" : "What they need"}</h3>
                {(layout.people[selectedPerson]
                  ? satisfaction(layout, selectedPerson).checks
                  : selectedPerson === "tara"
                    ? [
                        { ok: true, text: "Morning sunlight" },
                        { ok: true, text: "Enough floor for yoga" },
                        { ok: false, text: "Cannot share a wall with Kabir" },
                        { ok: false, text: "Keep Chairman Meow away" },
                      ]
                    : selectedPerson === "dev"
                      ? [
                          { ok: true, text: "Close to the kitchen" },
                          { ok: true, text: "A room with elbow space" },
                          { ok: true, text: "People nearby, ideally always" },
                        ]
                      : [
                          { ok: true, text: "Far from the kitchen" },
                          { ok: true, text: "Chairman Meow nearby" },
                          { ok: true, text: "Records in the living room" },
                          { ok: false, text: "Cannot be beside a light sleeper" },
                        ]
                ).map((check) => (
                  <div className={`need ${check.ok ? "need--good" : "need--bad"}`} key={check.text}>
                    <span>{check.ok ? "✓" : "×"}</span><p>{check.text}</p>
                  </div>
                ))}
              </div>
              <div className="scribble">tap a room<br />or drag them over</div>
            </div>
          ) : (
            <div className="watching-note">
              <span>LIVE FROM 4B</span>
              <h2>Everybody is pretending this is normal.</h2>
              <p>Watch closely. The arrangement tells its own story.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="people-dock" aria-label="Potential flatmates">
        <div className="dock-label"><span>FLATMATES</span><small>pick someone up</small></div>
        {(["tara", "dev", "kabir"] as PersonId[]).map((id) => {
          const state = satisfaction(layout, id);
          const selected = picked?.type === "person" && picked.id === id;
          return (
            <button
              type="button"
              className={`person-card person-card--${id} ${selected ? "is-picked" : ""}`}
              key={id}
              onPointerDown={(event) => beginPick(event, { type: "person", id })}
              aria-label={`Pick up ${PEOPLE[id].name}. ${layout.people[id] ? `Currently in room ${layout.people[id]?.toUpperCase()}.` : "Not yet assigned."}`}
            >
              <span className="person-card__portrait"><Portrait person={id} /></span>
              <span className="person-card__copy">
                <strong>{PEOPLE[id].name}</strong>
                <small>{PEOPLE[id].role}</small>
                <i>{layout.people[id] ? `ROOM ${layout.people[id]?.toUpperCase()}` : "IN THE HALL"}</i>
              </span>
              <span className={`person-card__mood mood-dot--${state.mood}`}>{state.face}</span>
            </button>
          );
        })}
        <div className="object-drawer">
          <span>MOVEABLE THINGS</span>
          <div className="object-drawer__items">
            <button
              type="button"
              className={picked?.type === "object" && picked.id === "catbed" ? "is-picked" : ""}
              onPointerDown={(event) => beginPick(event, { type: "object", id: "catbed" })}
            >
              🐈 <small>cat bed</small>
            </button>
            <button
              type="button"
              className={picked?.type === "object" && picked.id === "record" ? "is-picked" : ""}
              onPointerDown={(event) => beginPick(event, { type: "object", id: "record" })}
            >
              ♫ <small>records</small>
            </button>
          </div>
        </div>
      </section>

      {drag?.moved && (
        <div className="drag-ghost" style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0)` }} aria-hidden="true">
          {drag.item.type === "person" ? <Portrait person={drag.item.id} /> : <span>{drag.item.id === "catbed" ? "🐈" : "♫"}</span>}
        </div>
      )}
    </main>
  );
}
