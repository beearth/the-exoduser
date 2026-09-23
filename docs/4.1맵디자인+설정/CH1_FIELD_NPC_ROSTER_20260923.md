# CH1 Field NPC Roster — 2026-09-23

> Status: **data and interaction contract implemented; runtime spawn/render hookup pending.** This is a CH1-1 Diablo-style outdoor-field slice, not a replacement for existing story canon.

## Placement contract

| ID | Name | Field role | Tile position | Interaction hook | Collision |
|---|---|---|---:|---|---|
| `ch1-merchant` | 마렌 | start merchant | `(92, 176)` | `open_shop` | none |
| `ch1-survivor` | 에단 | travel survivor | `(68, 131)` | `start_rescue_hint` | none |
| `ch1-guide` | 이실라 | north-gate guide | `(106, 54)` | `show_gate_hint` | none |

## Field design rules

- NPCs are spaced south → north: arrival support, route guidance, then boss-gate story pressure.
- NPCs do not become walls. `collision: false`; the existing tile NAV remains the only movement authority.
- NPCs stand at the edge of a readable space, never in a main arena center, spawn hole, gate mouth, or projectile lane.
- The merchant is a start/breathing-space service; the survivor makes the transition leg readable; the guide frames the north gate.
- Runtime integration must render each NPC as an interactable and use the declared action hook. The current data module must not independently change `tileRLE`, `isW`, spawn, or collision.

## Validation

| Check | Result |
|---|---|
| three distinct field roles | PASS |
| south → north spatial sequence | PASS |
| NPC collision separation | PASS |
| interaction data exists for each role | PASS |
| in-game render/interact loop | pending runtime hookup |

