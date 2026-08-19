# Lease Me Alone

This repository contains the browser vertical slice for **Lease Me Alone**, a cozy spatial-logic puzzle game about matching particular roommates to the right bedrooms.

## Play

[Play the game on GitHub Pages](https://shewhoknows.github.io/Lease-Me-Alone/)

The vertical slice contains six levels:

1. **First Night** teaches room features and hard Needs.
2. **Early Bird** adds Wants and more than one hard-valid assignment.
3. **Room to Work** adds fixed desks and open floor space.
4. **Balcony Rights** shows why Needs have priority over soft preferences.
5. **Good Enough** introduces visible Household Harmony and an 85% target.
6. **Housewarming** combines all rules in the Chapter 1 finale.

The player assigns each roommate, selects **MOVE IN**, and watches the house react. A wrong answer starts a useful simulation. It has no penalty. The six levels do not yet include adjacency, relationships, movable furniture, pets, schedules, or other later campaign systems.

## Product reference

The original creative and systems brief is preserved in [docs/FLATMATES_GAME_CONCEPT.md](docs/FLATMATES_GAME_CONCEPT.md). Treat it as the design north star.

Use [docs/LEASE_ME_ALONE_VERTICAL_SLICE.md](docs/LEASE_ME_ALONE_VERTICAL_SLICE.md) as the implementation reference for Levels 1 through 6. It defines the puzzle data, Harmony results, validator checks, debug tools, excluded mechanics, and definition of done.

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
npm run build:pages
npm test
npm run lint
```

## Project structure

- `app/page.tsx` — level flow, placement interactions, simulation, progress, and developer tools
- `app/globals.css` — responsive dollhouse presentation and character artwork
- `lib/game/index.ts` — level data, preference rules, Harmony, solver, and validator
- `app/layout.tsx` — document and social-sharing metadata
- `public/og.png` — generated social-sharing card
- `docs/FLATMATES_GAME_CONCEPT.md` — original game concept brief
- `docs/LEASE_ME_ALONE_VERTICAL_SLICE.md` — six-level implementation reference

## Product principles

- Cozy reasoning, never stressful execution
- People problems expressed spatially
- Characters and rooms communicate state without dashboard clutter
- Every solved puzzle should produce a tiny memorable story
