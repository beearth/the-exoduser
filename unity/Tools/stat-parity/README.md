# Web start-state stat parity (PC-U02, 2026-10-26)

Offline .NET check. Feeds the equipped items of two real web new-character saves into the native `InventoryState.CalculateStats` and compares max HP/MP/ST with the values the web game saved.

- `web-seeds.json`: equipped items from the web save `hellsave_demo` (ts 1792610249408 = 2026-10-22 parity capture profile, ts 1792984196279 = 2026-10-26 U-04 capture profile). The unique ossuary is left out of the seed because the native inventory does not admit it yet; its fixed `bonusMp` 150 is added to MP separately.
- Run in this folder: `dotnet run -c Release -- web-seeds.json` (SDK 8.0.301, no package sources). Exit code = number of mismatched saves.
- Result 2026-10-26: 2/2 MATCH after admitting `_iLifeHPPct`. Report: `docs/engine/UNITY_PC_STAT_PARITY_20261026.md`.
