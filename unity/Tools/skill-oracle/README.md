# skill-oracle (PC-B03)

Compares `Runtime/Core/Skills/SkillRules.cs` with the **original game.html functions**: `export.cjs` runs the web source in a Node VM (no hand-typed expected values) and writes `oracle.json`; `Program.cs` (.NET 8) recomputes every value with the C# rules and compares bit for bit.

| section | web source | C# |
|---|---|---|
| skMul | `_SK_MUL`, `_skMul` (37 ids x Lv1..20) | `SkillRules.SkMul` |
| cost | `stCost('giantSlam')`, `mpCost('iceOrb')` with `pAtkCost / pMeleeStCost / pMagicCost` | `StCost`, `MpCost`, `PAtkCost`, `PMeleeStCost`, `PMagicCost` |
| spikeTrap | `activateSpikeTrap`, `_spikeTrapSlowPct` | radius / damage / cooldown / slow, malice gate |
| giantSlam | `activateGiantSlam` (call arguments of `_gSlamHit`, cooldown, malice, rage 0..100 x pRage x rageDmg through `RageMalice.Slam`) | `GiantSlam*` |
| slamHit | `_gSlamHit` (damage, mini stun 60, full stun, boss poise 25 %) | `GiantSlamHitDamage`, `GiantSlamFullStun` |
| holyDome | `activateHolyDome`, the per-frame regeneration line | `HolyDome*` |
| iceOrb | `activateIceOrb` + `activateIceShatter` (bonus, blades, damage, radius, cooldown) | `IceOrb*` |
| level | `_skillUpSpCost`, `_skLvLock` | `UpgradeSpCost`, `SkillLevelLock` |

```
node export.cjs --source <game.html>     # regenerate oracle.json (--check = fail on source drift)
node run.cjs --project <unity dir> --label green
```

`unity/Tools/skill-sim-test` checks the Simulation side on top of these rules (input edges, costs, cooldowns, zones, slam / orb states, upgrade, save round trip).
Not covered by the oracle: the unified-pierce roll of the ice blades (random), the draw code (view layers follow the web render code by reading).
