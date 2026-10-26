# Web start-state stat parity (PC-U02, 2026-10-26)

Offline .NET check. Feeds the equipped items of two real web new-character saves into the native `InventoryState.CalculateStats` and compares max HP/MP/ST with the values the web game saved.

- `web-seeds.json`: equipped items from the web save `hellsave_demo` (ts 1792610249408 = 2026-10-22 parity capture profile, ts 1792984196279 = 2026-10-26 U-04 capture profile). Each save's real fixed unique ossuary (`전대의 유골함`, null fields removed) is in `equipped[15]` and admitted by the native inventory; its `bonusMp` 150 enters MP through `CalculateStats` (PC-U04b), no separate addition.
- Run in this folder: `dotnet run -c Release -- web-seeds.json` (SDK 8.0.301, no package sources). Exit code = number of mismatched saves.
- Result 2026-10-26: 2/2 MATCH after admitting `_iLifeHPPct`; 2/2 MATCH again with the ossuary admitted and no separate MP addition (PC-U04b). Report: `docs/engine/UNITY_PC_STAT_PARITY_20261026.md`.
