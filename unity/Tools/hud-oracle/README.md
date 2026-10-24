# UNITY-HUD-01 source-value oracle

These tools are offline tests. Unity runtime contains no JavaScript, VM, DOM or web view.

```powershell
& 'C:/nvm4w/nodejs/node.exe' unity/Tools/hud-oracle/export.cjs --source-root E:/exoduser-wt/codex-port-takeover-20261023 --dependency-root G:/exoduser
& 'C:/nvm4w/nodejs/node.exe' unity/Tools/hud-oracle/run.cjs --project E:/exoduser-wt/codex-port-takeover-20261023/unity --label hud-green-02
```

The exporter executes pinned original `updateHUD(true)`, `_hset` and `_hudReadableNumber` in a fresh offline VM with leaf DOM elements and unrelated gameplay dependencies stubbed. All three functions must match current `G:/exoduser/game.html` exactly. Fifteen scenarios retain original DOM resource transforms, strings, shield gradients and four poise eye classes. The C# runner checks the actual read-only native value adapter against those observed outputs; invalid states add explicit native guards, not source parity claims.

The exporter writes the same fixture to versioned `Tools/hud-oracle/oracle.json` and the external evidence directory. `run.cjs` reads the versioned fixture, so restored Core + Tools files can run into a fresh `--out` directory without the original source snapshot, live G: source, Acorn, an existing oracle output or other project tools. Re-exporting still requires the original source files and Acorn and rechecks current source equivalence; the checked-in fixture does not establish that a future live source is unchanged.

The default evidence directory is `I:/EXODUSER-Storage/qa/unity-hud-20261024`. .NET 8.0.301 builds into that evidence directory, then executes its DLL directly. Each run label should be unique so RED/GREEN receipts remain distinct. No artifact or cache is added under the live SSD runtime tree. This suite does not verify Unity rendering, physical input or save compatibility.
