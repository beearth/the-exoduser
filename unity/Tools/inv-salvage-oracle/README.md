# inv-salvage-oracle

Web `salvageVal` oracle for the Unity inventory salvage port (2026-11-03).

- `export.cjs` cuts `_itemEconomyRarity` and `salvageVal` verbatim out of `game.html` and evaluates them for rarity -1..5, enh 0/1/5/20, tier 0..7 (224 rows).
- `oracle.json` is the frozen result from main `30bc2e2ceb`.
- The checks live in `unity/Tools/Tests/Program.cs` (`--salvage-only <oracle.json>`): 224-row match with `InventoryState.SalvageValue`, plus junk/single salvage behaviour.

Regenerate:

```bash
node unity/Tools/inv-salvage-oracle/export.cjs game.html unity/Tools/inv-salvage-oracle/oracle.json <main-sha>
```

Run on PC (dotnet SDK installed):

```bash
dotnet run --project unity/Tools/Tests/CoreTests.csproj -p:ExoduserProject=<abs>/unity -- --salvage-only <abs>/unity/Tools/inv-salvage-oracle/oracle.json
```

Run on a Mac without a dotnet SDK: compile `Program.cs`, `SourceMap.cs` and `Assets/Exoduser/Runtime/Core/**/*.cs` with the Roslyn bundled in Unity (`Unity.app/Contents/Resources/Scripting/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll`, references `packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0/*.dll`), add a `net8.0` runtimeconfig, and run it with the bundled `DotNetSdk/dotnet`. 2026-11-03 result: `SALVAGE_RESULT 9 checks / 0 failures`.
