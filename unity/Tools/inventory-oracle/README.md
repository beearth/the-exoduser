# Unity source inventory oracle

Offline development tooling. JavaScript is never included in the native Player.

`export.cjs` executes pinned original functions/tables using Acorn + Node VM. It reproduces the accepted `mkP/defaultItems` seed `0x20261024` (505 RNG draws), then continues the original ten bag-item calls (887 draws total). The ten bag items are **magic rarity1**, each carrying two original affixes; the fourth `mkItem` argument is rarity, not tier. The 15 equipped items are common rarity0. No affixes are removed to fit the implementation.

The portable `inventory-seed.json` uses a 17-slot `equipped` array in `SLOT_NAMES` order and a 10-item `bag` array, preserving raw IDs, implicit values, two-dimensional coordinates, and source item fields. `oracle.json` separately retains provenance, 27 equip/unequip outcomes, current-resource clamps, sort powers, six grid boundaries and nine level/stage/difficulty profiles. At first UI placement, original `_invAutoPlace` sorts and assigns the grid.

```powershell
& C:/nvm4w/nodejs/node.exe unity/Tools/inventory-oracle/export.cjs --project E:/exoduser-wt/codex-port-takeover-20261023/unity --dependency-root G:/exoduser --live-source G:/exoduser/game.html
& C:/nvm4w/nodejs/node.exe unity/Tools/inventory-oracle/run.cjs --project E:/exoduser-wt/codex-port-takeover-20261023/unity --label inventory-green-04
```

The SDK is pinned to installed .NET8.0.301. Package sources are empty. All build intermediates/logs/results default to `I:/EXODUSER-Storage/qa/unity-inventory-20261024/core-runs`; use a new immutable `--label` and optionally `--out` for subsequent runs. Project paths are explicit because Node resolves the Tools Junction to I:.

Initial RED: no native InventoryState existed (1 failure, actual successful test compilation). Intermediate GREEN-01 correctly rejected magic bag items under the mistaken common-only admission. GREEN-03's extended source profiles exposed missing level-derived grit bonuses (21 failures), fixed in GREEN-04 (909 checks, 0 failures).

Final pinned run: `inventory-green-06-final.json`, 909/909. `recover.cjs --project ...` copies exactly the two inventory C# files, SimulationState, and seven test inputs to a new I: directory, compares SHA256 before/after/copy, and reruns the suite. This is a manifest-based C# recovery check, not a Git tracked-tree or Unity project recovery claim.

This proves native inventory data/grid/selection/equip/sort and admitted static stat formulas. It does **not** prove Unity GUI input, final visual parity, conditional affix combat effects, item generation, world pickup, enhancement, relics, storage, or persistence. Parent integration must visibly disclose the additional-option combat limitation.
