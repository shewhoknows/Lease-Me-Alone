# Lease Me Alone

This repository contains the playable vertical slice for **Flatmates**, a cozy spatial-logic puzzle game about arranging very particular people, possessions, and pets inside a shared apartment.

## Play

[Play the current private build](https://flatmates-night-owl.prateekranka.chatgpt.site)

The prototype includes:

- touch-friendly character and object placement
- room, distance, adjacency, and personality constraints
- live resident satisfaction and case notes
- undo, reset, hints, and tactile sound feedback
- a household simulation whose scenes react to the chosen layout
- Chairman Meow’s spatial behavior
- conditional results and a post-level Flat 4B group chat

## Product reference

The original creative and systems brief is preserved verbatim in [docs/FLATMATES_GAME_CONCEPT.md](docs/FLATMATES_GAME_CONCEPT.md). Treat it as the design north star for future work.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local address printed by the development server.

## Validation

```bash
npm run build
npm test
npm run lint
```

## Project structure

- `app/page.tsx` — puzzle state, placement interactions, simulation, and group chat
- `app/globals.css` — responsive dollhouse presentation and character artwork
- `app/layout.tsx` — document and social-sharing metadata
- `public/og.png` — generated social-sharing card
- `docs/FLATMATES_GAME_CONCEPT.md` — original game concept brief

## Product principles

- Cozy reasoning, never stressful execution
- People problems expressed spatially
- Characters and rooms communicate state without dashboard clutter
- Every solved puzzle should produce a tiny memorable story
