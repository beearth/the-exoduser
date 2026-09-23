# Diablo-style Field Implementation Contract — 2026-09-23

> Status: **planning inputs implemented; game runtime wiring pending.** This document is the migration contract for replacing legacy room/corridor fields without changing the `genFromTemplate` runtime path.

## 1. Scope and non-goals

- Target: the structural feel of a continuous Diablo-style outdoor field: broad irregular traversal, exterior masses, readable combat basins, and landmark-led routing.
- This is original map work. No Diablo IV map data, assets, or source code is used.
- Current first slice: CH1-1 / `STAGES[0]`, 200×200 tiles, `T=40`, south start and north exit.
- `genFromTemplate` remains the production map generator. `genGauntlet` remains fallback only.
- Existing locked CH1-1 production art remains intact until a separately verified replacement is wired and visually approved.

## 2. Authority and pipeline

| Layer | Authority | Contract |
|---|---|---|
| Gameplay navigation | `tileRLE` decoded by the existing template pipeline | The only source of movement, pathing, spawn and safe-point topology. |
| Field blueprint | `src/diabloFieldBlueprint.js` | Produces deterministic 200×200 south-to-north open-field topology. |
| Terrain plan | `src/diabloFieldTerrain.js` | Render plan only; cannot add collision. |
| Stage plan | `src/diabloFieldStagePlan.js` | Maps field regions to landmarks, surfaces and visual rules. |
| Background streaming | 8192² master, 8×8 chunks, 1024px core + 1px bleed | Existing stream/cache lifecycle remains the runtime owner. |

## 3. CH1-1 field sequence

| Order | Role | Landmark | Surface | Route purpose |
|---:|---|---|---|---|
| 1 | start | south forecourt | wet stone | 6 o'clock arrival, clear north read |
| 2 | combat | west basin | mud and roots | first broad combat basin; no closed room |
| 3 | travel | broken causeway | frosted stone | irregular northbound connection between outer masses |
| 4 | combat | corpse-tree clearing | dead grass | central landmark and multi-angle encounter |
| 5 | pocket | altar marsh | black mud | optional visible side pocket |
| 6 | boss | north gate | cracked slate | 12 o'clock boss forecourt and exit approach |

## 4. Visual layering

| Order | ID | Must contain | Must not do |
|---:|---|---|---|
| 0 | base | continuous base albedo | create collision |
| 1 | ground | road, mud, snow, decals | obscure route readability |
| 2 | back | distant cliffs and tree masses | seal the NAV route |
| 3 | mid | prop clusters around playable space | replace NAV collision |
| 4 | front | foreground occluders and atmosphere | hide player/boss readability |

## 5. Acceptance gates before replacing CH1-1

1. `tileRLE` exposes the 6 o'clock start and a continuous 12 o'clock approach.
2. Each combat space has two or more broad kiting vectors; no rectangular room loop.
3. `isW`, pathing, spawns, safe point, exit and boss-gate behavior still use the same decoded tile map.
4. 64 streamed chunks have a 1024px core and 1px bleed; seams are visually absent at camera movement.
5. Outer cliff/tree masses and foreground art are render-only unless a deliberate, documented NAV edit accompanies them.
6. In-game camera review receives a separate visual verdict; passing automated topology tests is not visual approval.

## 6. Current verification

| Check | Result |
|---|---|
| deterministic field topology | PASS |
| 6 o'clock start and 12 o'clock approach | PASS |
| visual terrain separated from NAV | PASS |
| stage-plan region identity contract | PASS — ordered roles are `start/combat/travel/combat/pocket/boss`; duplicate `combat` roles distinguish the two encounter basins by order and landmark |
| field blueprint/stage plan/terrain/NPC test suite | PASS — 6/6 |
| game.html runtime replacement | pending — legacy production map is intentionally not overwritten before all gates pass |

