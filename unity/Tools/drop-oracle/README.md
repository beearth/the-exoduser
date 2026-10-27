# D01 world drop oracle (mkItem / rollAffixes / rollDrop equipment half / _wiPush)

Offline development tooling; JavaScript is never part of the native Player.

- `export-tables.cjs <game.html> <out.cs> <web-commit>` evaluates the original tables (AFFIX_POOL, IMPLICIT_TABLE, LEGENDARY/UNIQUE_SPECIAL, UNIQUE_ART, name tables inside mkItem, ...) and writes `Runtime/Core/DropTablesData.cs`.
- `export.cjs` slices the original `mkItem`, `rollAffixes`, the equipment half of `rollDrop` (up to the bone-part block) and `_wiPush` from `game.html` by text anchor and runs them unchanged in a Node VM with a seeded `Math.random` (mulberry32). Output `oracle.json`: 3000 mkItem, 1000 rollAffixes, 1500 rollDrop (normal/elite/mini/stage boss/chapter boss, drop bonus, min-pick filters, curse), 400 `_wiPush` cap sequences. `--mk/--drop/--push/--seed` scale it.
- `Program.cs` + `DropTests.csproj` (.NET 8; compiles `Runtime/Core/*.cs` except `NativeSettings*.cs`, which need UnityEngine) replay every case with the same seed in C# `ItemFactory` / `WorldDrop` and require: same item fields (reflection, both directions), same number of random draws, same positions, same cap eviction order.

```powershell
node unity/Tools/drop-oracle/export.cjs --source G:/exoduser/game.html --out unity/Tools/drop-oracle/oracle.json
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'; $env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE='1'; $env:DOTNET_NOLOGO='1'; $env:DOTNET_CLI_HOME='E:/exoduser-wt/_dotnet-home'
dotnet run -c Release --project unity/Tools/drop-oracle -p:ExoduserProject=<abs path to unity> -- unity/Tools/drop-oracle/oracle.json
```

Runs (2026-10-27, game.html sha256 `38d8ea2d...833a`, origin/main `156d7df64`): committed oracle 5,900 checks / 0 failures (1,937 dropped items compared field by field); large run (`--mk 60000 --drop 30000 --push 4000 --seed 77`) 114,000 checks / 0 failures (35,773 dropped items). Mutation (atk roll exponent 2 -> 1.9, base tier of grade 4 -> 1) gave 1,633 failures, so the comparison is sensitive.

Notes from building it:
- `Number.prototype.toFixed` rounds an exact tie up; .NET `ToString("F")` rounds it to even. `ItemFactory.ToFixed` reproduces the JS rule with BigInteger (first failures were `1.125 -> 1.13`, `2.25 -> 2.3`, `0.25 -> 0.3`).
- The web `base` literal of mkItem is evaluated for EVERY slot, so each mkItem consumes the bonus rolls of all 16 slots; the ring/necklace affix pre-pick is overwritten by `rollAffixes` but still consumes draws. Both are replayed.
- `rollAffixes` caches its pool per slot on first use, so `_DEMO_MODE` is effectively a build constant; the oracle resets the cache per case.
- Web quirk kept: gloves/belt `potCd[rarity]` is undefined for unique (5) -> NaN; the native bag item stores 0 (`InventoryState.TryPickup`).
- Not in this slice: bone parts, crystals and socket stones that the same web `rollDrop` rolls after the equipment loop; the pet auto-fetch (the only web auto pickup); drop/pickup sounds (WebAudio samples without a Unity counterpart yet).
