# Lease Me Alone: Vertical Slice Reference

This file is the implementation reference for Levels 1 through 6. The source level pack is more detailed. This file keeps the rules, authored puzzle data, expected solutions, and release checks that affect the build.

## Core play loop

For each level, the player:

1. inspects the house and its room features;
2. opens roommate cards to read preferences;
3. switches to Assign mode and taps or drags every roommate into one bedroom;
4. selects **MOVE IN**;
5. watches a short household simulation;
6. sees success or a clear problem;
7. rearranges the roommates and tries again.

There is no penalty for a bad test. **MOVE IN** becomes available when all roommates have rooms. It does not require a valid or good assignment.

Room selection starts in **Inspect** mode. It must show room facts without moving anybody. Selecting a roommate switches to **Assign** mode. Every assigned roommate has a direct remove control.

When a Need fails, start the simulation as usual. Show the related conflict and the character reaction. Pause the simulation, show the failed Need, and return to arrangement mode. A bad assignment must be useful and entertaining.

## Preference and Harmony rules

There are three preference types:

| Type | Rule | Harmony weight |
| --- | --- | ---: |
| Need | Hard constraint. A level cannot complete when a Need fails. | None |
| Want | Important soft preference. | 2 |
| Like | Minor soft preference. | 1 |

For a hard-valid assignment:

```text
Harmony = round(satisfied soft-preference weight / total soft-preference weight * 100)
```

Calculate Harmony internally from Level 1. Do not show its number before **MOVE IN**. Needs always take priority over Wants and Likes.

The result reveals Harmony and shows the point effect of every Want and Like. A basic Move In result can pass below the best possible score. The result must then offer a **Best home** bonus goal.

From Level 3, shared-wall rules add soft conflicts between roommates. A Want is worth 2 points and a Like is worth 1 point, like room preferences. The rule passes when the two named roommates do not share one of the level's authored room-wall pairs.

Do not use stars, coins, XP, or a standard mobile progress bar for Harmony. Use a small, illustrated indicator that fits the watercolor art.

## Character foundation

Preferences can appear in stages. Do not show all later traits too early.

| Character | Visual and personality cues | Campaign traits |
| --- | --- | --- |
| Maya | Loose dark hair, bright oversize jumper, and a plant during a move. Her room gains plants. She is warm, creative, and dry. | Need strong daylight; Want balcony; Want plant space; Like a larger room. |
| Dev | Round glasses, bright shirt, food, cookbooks, and containers. He is social and treats cooking as his identity. | Want kitchen proximity; Like a larger room. |
| Tara | Tied hair, activewear, yoga mat, and a very tidy room. She wakes early and needs sleep. | Need quiet; Need open floor space; Want morning sun. |
| Finn | Glasses, muted bright sweater, laptop, headphones, and books. He works from home and wants distance from people. | Need a proper desk; Want distance from common areas; Like quiet. |
| Kabir | Messy hair, band shirt, guitar case, and untidy clothes. He is a charming night owl. | Need guitar setup space; Like a balcony. |

## Authored levels

### Level 1: First Night

- Target: 2–3 minutes. Difficulty: 1/5. Two roommates and two bedrooms.
- Teach dragging, room selection, room properties, Needs, and **MOVE IN**.
- Do not show Harmony.

Rooms:

| Room | Features |
| --- | --- |
| R1 Sun Room (`bedroom_sun`) | Strong daylight; not near the kitchen; medium size. Show a large sunny window. |
| R2 Galley Room (`bedroom_galley`) | Low daylight; near the kitchen; medium size. Show the kitchen outside its door. |

Level preferences:

- Maya: Need strong daylight.
- Dev: Want kitchen proximity.

Intended assignment: `Maya → R1`, `Dev → R2`.

Harmony: **100%**.

The reverse assignment fails Maya's Need. On success, Maya's plant perks up in the light and Dev goes to the fridge. End with **HOME SWEET HOME**. On failure, Maya tests the small window and the game reports her daylight Need.

Validator expectation:

```text
Assignments: 2
Hard-valid: 1
Best Harmony: 100
Best: Maya R1 / Dev R2
```

### Level 2: Early Bird

- Target: 4–5 minutes. Difficulty: 1/5. Three roommates and three bedrooms.
- Teach Want versus Need, more than one room that meets a Need, and soft-preference choice.

Rooms:

| Room | Features |
| --- | --- |
| R1 East Room | Strong daylight; morning sun; quiet; small; not near kitchen. |
| R2 Garden Room | Strong daylight; no morning sun; quiet; large; not near kitchen. |
| R3 Hall Room | Low daylight; no morning sun; not quiet; medium; near kitchen. |

Level preferences:

- Tara: Need quiet; Want morning sun.
- Maya: Want strong daylight; Like larger room.
- Dev: Like kitchen proximity.
- Finn and Dev: Like separate rooms with no shared wall.

Intended assignment: `Tara → R1`, `Maya → R2`, `Dev → R3`.

Harmony: **100%**.

The authored near-miss is `Tara → R2`, `Maya → R1`, `Dev → R3`. It meets all Needs but has **33%** Harmony. Show **They're moved in… but you can do better.** Offer **REARRANGE** and **CONTINUE**. Improvement is encouraged, not required.

Validator expectation:

```text
Assignments: 6
Hard-valid: 2
Best: Tara R1 / Maya R2 / Dev R3, Harmony 100
Second: Tara R2 / Maya R1 / Dev R3, Harmony 33
```

### Level 3: Room to Work

- Target: 5–6 minutes. Difficulty: 2/5. Four roommates and four bedrooms.
- Introduce fixed functional features: a proper desk and usable floor space.
- Furniture stays fixed.

Rooms:

| Room | Features |
| --- | --- |
| R1 Studio | Desk; quiet; no floor space; low daylight; no morning sun; medium; not near kitchen. |
| R2 East Room | No desk; quiet; floor space; medium daylight; morning sun; medium; not near kitchen. |
| R3 Garden Room | No desk; not quiet; no floor space; strong daylight; no morning sun; large; not near kitchen. |
| R4 Galley Room | No desk; not quiet; no floor space; low daylight; no morning sun; small; near kitchen. |

Level preferences:

- Finn: Need desk; Like quiet.
- Tara: Need quiet; Need floor space; Want morning sun.
- Maya: Need strong daylight; Want larger room.
- Dev: Want kitchen proximity.

Intended assignment: `Finn → R1`, `Tara → R2`, `Maya → R3`, `Dev → R4`.

Harmony: **100%**.

This level teaches the player to match a room to a person, not to rank rooms. A failed Finn assignment shows an unusable bed workspace. A failed Tara assignment shows the yoga mat hitting the bed or wall.

Validator expectation:

```text
Assignments: 24
Hard-valid: 2
Best Harmony: 100
Second hard-valid Harmony: 38
Required Harmony: 35
```

### Level 4: Balcony Rights

- Target: 5–7 minutes. Difficulty: 3/5. Four roommates and four bedrooms.
- Teach Needs, soft room preferences, and a shared-wall conflict.
- Keep numerical Harmony hidden until Move In.

Rooms:

| Room | Features |
| --- | --- |
| R1 Balcony Room | Strong daylight; balcony; no guitar space; not quiet; no floor space; no morning sun; not near kitchen. |
| R2 Loft Room | Medium daylight; no balcony; guitar space; not quiet; floor space; no morning sun; not near kitchen. |
| R3 Galley Room | Low daylight; no balcony; no guitar space; not quiet; no floor space; near kitchen. |
| R4 East Room | Medium daylight; no balcony; no guitar space; quiet; floor space; morning sun; not near kitchen. |

Level preferences:

- Maya: Want strong daylight; Want balcony.
- Kabir: Need guitar setup space; Like balcony.
- Tara: Need quiet; Need floor space; Want morning sun.
- Dev: Like kitchen proximity.
- Maya and Tara: Like separate rooms with no shared wall.

Intended assignment: `Maya → R1`, `Kabir → R2`, `Tara → R4`, `Dev → R3`.

Best Harmony: **89%**. Kabir still gives up his balcony Like. This is intentional. On success, Kabir accepts the Loft and Maya uses the balcony. End with **COMPROMISE ACHIEVED**.

Validator expectation:

```text
Assignments: 24
Hard-valid: 2
Best Harmony: 89
Second hard-valid Harmony: 33
Required Harmony: 30
Unsatisfied at best: Kabir balcony Like
```

### Level 5: Good Enough

- Target: 6–8 minutes. Difficulty: 3/5. Four roommates and four bedrooms.
- Introduce an explicit Harmony target and several hard-valid compromises.
- Explain that no 100% assignment exists and that **85% Harmony is enough to move in.**

Rooms:

| Room | Features |
| --- | --- |
| R1 Green Room | Strong daylight; large; quiet; no morning sun; no desk; not near kitchen. |
| R2 East Room | Medium daylight; medium; quiet; morning sun; no desk; not near kitchen. |
| R3 Galley Room | Low daylight; small; not quiet; no morning sun; no desk; near kitchen. |
| R4 Box Room | Low daylight; small; quiet; no morning sun; desk; not near kitchen. Keep it cute and comfortable. |

Level preferences:

- Maya: Want strong daylight; Want a large room.
- Tara: Need quiet; Want morning sun.
- Dev: Want kitchen proximity; Like a large room.
- Finn: Need desk; Want quiet.
- Finn and Dev: Want separate rooms with no shared wall.

Intended assignment: `Maya → R1`, `Tara → R2`, `Dev → R3`, `Finn → R4`.

Maximum Harmony: **92%**. Required Harmony: **85%**. Present the result as **92% — GREAT MATCH**. Dev accepts the small room because it is near the kitchen.

If all Needs pass but Harmony is below 85%, still run **MOVE IN**. Then explain that the house is possible but is not a good match, and offer another arrangement.

Validator expectation:

```text
Assignments: 24
Hard-valid: 4
Maximum Harmony: 92
Required Harmony: 85
Best: Maya R1 / Tara R2 / Dev R3 / Finn R4
assert maxHarmony == 92
assert noArrangementCanReach(100)
```

### Level 6: Housewarming

- Chapter 1 finale. Target: 7–10 minutes. Difficulty: 4/5.
- Four roommates and four bedrooms.
- Add no mechanic. Test all prior reasoning.
- This apartment is the largest and strongest environment in the slice. Put the living room in the center and the bedrooms around it.

Rooms:

| Room | Features |
| --- | --- |
| R1 East Studio | Desk; quiet; floor space; morning sun; medium daylight; not far from common space; no balcony; medium; not near kitchen. |
| R2 Balcony Room | No desk; not quiet; floor space; no morning sun; strong daylight; not far from common space; balcony; large; not near kitchen. |
| R3 Galley Room | No desk; not quiet; no floor space; no morning sun; low daylight; not far from common space; no balcony; small; near kitchen. |
| R4 Back Office | Desk; quiet; floor space; no morning sun; strong daylight; far from common space; no balcony; small; not near kitchen. |

Level preferences:

- Finn: Need desk; Want distance from common areas; Like quiet.
- Tara: Need quiet; Need floor space; Want morning sun.
- Maya: Need strong daylight; Want balcony; Like a large room.
- Dev: Want kitchen proximity.
- Finn and Dev: Want separate rooms with no shared wall.

Intended assignment: `Finn → R4`, `Tara → R1`, `Maya → R2`, `Dev → R3`.

Harmony: **100%**.

The only other hard-valid assignment is `Finn → R1`, `Tara → R4`, `Maya → R2`, `Dev → R3`. Its Harmony is **50%** because Finn is beside the common space, shares a wall with Dev, and Tara has no morning sun. It reaches the basic 50% Move In goal, but not the best-home bonus.

The full success simulation lasts about 5–8 seconds. Show no more than four events. Keep Skip available. End with **HOME, FOR NOW.** and **Chapter 1 Complete**. The 50% simulation must show the most important missed preference or shared-wall conflict.

Validator expectation:

```text
Assignments: 24
Hard-valid: 2
Perfect assignments: 1
Best: Finn R4 / Tara R1 / Maya R2 / Dev R3, Harmony 100
Second: Finn R1 / Tara R4 / Maya R2 / Dev R3, Harmony 50
assert hardValidAssignments.count == 2
assert perfectAssignments.count == 1
assert maxHarmony == 100
assert secondBestHardValidHarmony == 50
```

## Hint rules

Each level has a three-step hint ladder:

1. Give an in-character clue about the important preference.
2. Pulse or highlight the related room feature or candidate rooms.
3. Show the important character-to-room match.

Hints must keep the character voice. They must not add a new rule.

## Level progression

| Level | Main lesson |
| --- | --- |
| 1. First Night | Room attributes and hard Needs. |
| 2. Early Bird | Needs versus Wants. |
| 3. Room to Work | Fixed functional features. |
| 4. Balcony Rights | Conflicting soft preferences. |
| 5. Good Enough | Optimization and visible Harmony. |
| 6. Housewarming | Combined reasoning. |

Do not add these mechanics in the vertical slice:

- room adjacency;
- relationships;
- movable furniture;
- pets;
- schedules;
- bathrooms;
- noise propagation;
- multiple floors;
- hidden information.

## Data architecture

All authored content must come from data. The minimum model contains:

```text
GameLevel
House
Room
RoomFeature
Character
Preference
Assignment
HarmonyResult
SimulationEvent
Hint
```

Do not add level-specific branches such as `if levelID == 3`. The solver, UI, simulation, and hints must read the level data.

## Required developer validator

For every level, the developer-only solver must:

1. enumerate every room permutation;
2. reject assignments that fail a Need;
3. calculate rounded Harmony for every hard-valid assignment;
4. sort hard-valid assignments by Harmony;
5. report permutation and hard-valid counts;
6. report the maximum Harmony and all perfect assignments;
7. detect accidental best-score ties;
8. verify the authored intended assignment;
9. report impossible Needs;
10. warn if an authored no-100% level can reach 100%.

All six level validator expectations in this file must have automated tests.

## Developer debug mode

In development builds, a long press on the level title opens these actions:

```text
SHOW ROOM FEATURES
SHOW CHARACTER NEEDS
SHOW HARMONY WEIGHTS
SHOW ALL VALID SOLUTIONS
AUTO-SOLVE
RESET LEVEL
PLAY SUCCESS SIMULATION
PLAY FAILURE SIMULATION
```

This menu is a development tool. It does not need player-facing art.

## Vertical slice definition of done

Do not start the full 45-level campaign until all statements below are true:

- Character dragging feels tactile.
- Room highlighting is subtle and clear.
- Character cards work without separate instructions.
- Players can quickly tell Needs from Wants.
- Watercolor rooms stay clear at iPad size.
- Bad assignments are entertaining to test.
- **MOVE IN** feels like a reward.
- Level 5 makes 92% feel successful without offering a perfect answer.
- Level 6 needs real thought but is not frustrating.
- The five characters have recognizable personalities.
- A replay is fast.
- The solver checks all six levels automatically.

The main playtest question is: does the player enjoy selecting **MOVE IN** when they think the assignment is wrong? The simulated household must be the reward. A correct assignment alone is not enough.
