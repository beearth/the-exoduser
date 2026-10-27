# CX-02 — 적 생성 `mkEn` 전체 Core + oracle (2026-10-27)

담당: 단순작업2(Sonnet, 보스전 총괄 전속). 명세: 보스전 총괄 `E:/exoduser-wt/_out/pc-cx02/SPEC.md`. 마스터 보드 C01·C03, 보스전 보드 CX-02(= BX-01 흡수). 선행 CX-01(`UNITY_CX01_ENEMY_TABLES_20261026.md`)의 `EnemyTables`/`EliteTables`를 쓴다.
범위: 적 객체의 **초기 필드 전부**를 웹과 같은 값·같은 난수 소비 순서로 만든다. AI·피해·표시 연결은 하지 않는다(다음 단위).

## 1. 원본 (game.html sha256 `d73d691989c1cb84…`, 65695줄, repo HEAD `2acaa1b80`, game.html clean)

| 원본 | 줄 | 비고 |
|---|---|---|
| `mkEn` | 31122~31365 | 본문 전체. 필드 선언(`const _e={…}`)은 oracle이 원문에서 파싱(336개 항목) |
| `_CH1_OPENING_EXCLUDED_ET` | 30994 | `{2,22,30,43}` |
| `rollElite` / `rollMods` / `rollAura` / `AURA_DEFS` | 31065 / 31073 / 31092 / 31085~31089 | Math.random 소비 |
| `_enemyHpPacing` | 31121 | |
| `_isDruidFinale`, `_druidFinaleHp` | 17056, 17059 | `_DEMO_MODE`·`_DEMO_LAST_STAGE`·`G.stage` 의존 |
| `_assignMobSkin` / `_assignBossSkin` | 23296 / 23152 | 보스 쪽은 본문이 주석뿐(할당 없음), 일반 쪽은 칸 계산만 |
| `safePt` | 31719 | `canMv`는 주입 |
| `T`, `_MOB8_TOTAL`, `_MOB8_COLS`, `BOSS_MOVES`(길이만), `ELC` | 16633, 23294, 23294, 9820~9880, 14338 | |

## 2. 새 파일 (`unity/Assets/Exoduser/Runtime/Core/` 평면, 각 .meta 포함)

| 파일 | 내용 |
|---|---|
| `EnemySpawn.cs` | 결과 데이터 `EnemySpawn`(웹 필드 이름 그대로 341개) + `EnemyVec`(`kb`) + `EnemyModT`(`modT`, 20개) |
| `EnemyFactory.cs` | `EnemySpawnContext`, `AuraDef`/`AuraDefs`, `EnemyFactory.Create(...)`와 `RollElite/RollMods/RollAura/SafePt`, `ToInt32`(JS `~~`) |
| `unity/Tools/enemy-spawn-oracle/` | export.cjs · gen-cs.cjs · Program.cs · EnemySpawnTests.csproj · run*.cjs · run-mutants.cjs · RedStub · oracle.json · README.md |

두 .cs는 **gen-cs.cjs가 oracle.json(원문 파싱 결과)에서 생성**한다. 직접 고치지 말고 생성기를 고친다.

### API

```csharp
var ctx = new EnemySpawnContext {
    PlayerLevel = P.lv, DifficultyIndex = OPT.diff, StageDiffOffset = G._stageDiffOff,
    Stage = G.stage, DemoMode = _DEMO_MODE, DemoLastStage = _DEMO_LAST_STAGE,
    CanMove = canMv /* (x,y,r)=>bool, double */, Random = Math.random /* [0,1) */ };
EnemySpawn e = EnemyFactory.Create(ctx, x, y, si, etype, ib, el /*double?*/, room /*double?*/);   // null = 웹이 null을 돌려주는 경우
```

- 전역은 읽지 않는다. `CanMove`는 명세의 `Func<float,float,float,bool>` 대신 **`Func<double,double,double,bool>`**(웹 숫자 = double이라 좌표 비트 대조를 위해). Codex 쪽 float 판정 함수는 래핑해서 넘긴다.
- `el`·`room`은 웹에서 생략되는 호출이 있어(`mkEn(x,y,si,etype,false)`) `double?`(null = `undefined`).
- 숫자 필드는 모두 `double`(JS number). `undefined` 필드(보스 전용 `_combatSt`·`_moveCDs`·`_lastMoves`·`_druidBaseAtk`, 일반 적 전용 스킨 칸 5개)는 null/nullable.
- 범위 밖 입력(`si`∉0~34, `etype`∉0~99)은 예외(웹은 NaN이 가득한 객체를 돌려줌 — 도달 경로 없음).

## 3. 필드 이름 매핑

C# 필드 이름 = 웹 필드 이름(변환 없음, 밑줄 접두 포함). 예외는 타입뿐이다.

| 웹 | C# 타입 | 비고 |
|---|---|---|
| `kb` | `EnemyVec {x,y}` | |
| `modT` | `EnemyModT` (20 필드) | 전부 0/false로 시작 |
| `eRes` | `double[]` | **웹과 같이 `EnemyTables.Eres[etype]` 행을 공유**(복사하지 않음) |
| `mods` · `_lastMoves` | `List<string>` | |
| `_moveCDs` | `double[]` (`BossMovesCount`=59칸, 보스만) | |
| `meteors` · `_mirrorBuf` · `_tsRewindHp` | `List<object>`/`List<double>` | 스폰 시 비어 있음(`_mirrorBuf`는 etype 58만 빈 목록, 그 외 null) |
| `aura` · `col` · `_combatSt` · `_twPhase` | `string` | null 가능 |
| `el` · `room` | `double?` | |
| 나머지 숫자 | `double` | 정수형 카운터도 double |
| 불리언 | `bool`(스킨 쪽 2개 `bool?`) | |

### 전체 필드표 (원문 선언 순서 = 코드 생성 순서)

| # | 웹 필드 | C# 타입 | 웹 초기식 |
|---|---|---|---|
| 1 | `x` | `double` | `x` |
| 2 | `y` | `double` | `y` |
| 3 | `r` | `double` | `r` |
| 4 | `hp` | `double` | `_hp` |
| 5 | `mhp` | `double` | `_hp` |
| 6 | `atk` | `double` | `_atk` |
| 7 | `baseAtk` | `double` | `_atk` |
| 8 | `speed` | `double` | `spd` |
| 9 | `baseSpd` | `double` | `spd` |
| 10 | `el` | `double?` | `el` |
| 11 | `col` | `string` | `ib?ELC[el]:_rare?_rd.col:(ETYPE_COL[etype]\|\|ELC[el])` |
| 12 | `alive` | `bool` | `true` |
| 13 | `stunned` | `double` | `0` |
| 14 | `kb` | `EnemyVec` | `{x:0,y:0}` |
| 15 | `poise` | `double` | `_hp` |
| 16 | `maxPoise` | `double` | `_hp` |
| 17 | `poiseR` | `double` | `0` |
| 18 | `ib` | `bool` | `ib` |
| 19 | `etype` | `double` | `etype` |
| 20 | `room` | `double?` | `room` |
| 21 | `lv` | `double` | `monLv` |
| 22 | `s` | `string` | `'idle'` |
| 23 | `st2` | `double` | `30+Math.random()*50` |
| 24 | `facing` | `double` | `Math.random()*Math.PI*2` |
| 25 | `elite` | `double` | `elite` |
| 26 | `mods` | `List<string>` | `mods` |
| 27 | `aura` | `string` | `elite>=2?rollAura(elite,si):null` |
| 28 | `modT` | `EnemyModT` | `{regen:0,summon:0,tp:0,chaos:0,vortex:0,lightning:0,twarp:0,cloned:false,revived:false,split:false,sentry:0,se` |
| 29 | `projCd` | `double` | `_projCd` |
| 30 | `projT` | `double` | `ib?70+Math.random()*50:180+Math.random()*120` |
| 31 | `chargeT` | `double` | `0` |
| 32 | `chargeCd` | `double` | `(etype===2\|\|etype===22)?(100+Math.random()*60):9999` |
| 33 | `dropTier` | `double` | `ib?Math.min(SI_TO_HELL[si]+1,4):_rare?Math.min(SI_TO_HELL[si]+2,4):Math.min(SI_TO_HELL[si],4)` |
| 34 | `bossPatCd` | `double` | `ib?35:9999` |
| 35 | `bossPatT` | `double` | `30+Math.random()*20` |
| 36 | `jumpX` | `double` | `0` |
| 37 | `jumpY` | `double` | `0` |
| 38 | `jumpOx` | `double` | `0` |
| 39 | `jumpOy` | `double` | `0` |
| 40 | `_bossPhase` | `double` | `0` |
| 41 | `_combatSt` | `string` | `ib?'engage':undefined` |
| 42 | `_comboSeq` | `object` | `null` |
| 43 | `_comboIdx` | `double` | `0` |
| 44 | `_moveCDs` | `double[]` | `ib?new Array(BOSS_MOVES.length).fill(0):undefined` |
| 45 | `_lastMoves` | `List<string>` | `ib?[]:undefined` |
| 46 | `_feinting` | `bool` | `false` |
| 47 | `_delaying` | `double` | `0` |
| 48 | `_dbgScores` | `object` | `null` |
| 49 | `shockR` | `double` | `0` |
| 50 | `shockMax` | `double` | `0` |
| 51 | `laserAng` | `double` | `0` |
| 52 | `laserLen` | `double` | `0` |
| 53 | `deaths` | `double` | `0` |
| 54 | `reviveIframes` | `double` | `0` |
| 55 | `meteors` | `List<object>` | `[]` |
| 56 | `_revPts` | `double` | `_dfSpawn?20:ib?(200+Math.round(si*5.882)):0` |
| 57 | `_maxRevPts` | `double` | `_dfSpawn?20:ib?(200+Math.round(si*5.882)):0` |
| 58 | `_druidBaseAtk` | `double?` | `_dfSpawn?_atk:undefined` |
| 59 | `shieldAng` | `double` | `etype===6?Math.random()*Math.PI*2:0` |
| 60 | `eShield` | `double` | `_hp` |
| 61 | `eShieldMax` | `double` | `_hp` |
| 62 | `eShieldRegenT` | `double` | `0` |
| 63 | `eRes` | `double[]` | `ETYPE_ERES[etype]\|\|[0,0,0,0,0,0,0]` |
| 64 | `_firstShot` | `bool` | `false` |
| 65 | `bleed` | `double` | `0` |
| 66 | `bleedT` | `double` | `0` |
| 67 | `bleedStk` | `double` | `0` |
| 68 | `_bleedPool` | `double` | `0` |
| 69 | `poison` | `double` | `0` |
| 70 | `poisonT` | `double` | `0` |
| 71 | `poisonStk` | `double` | `0` |
| 72 | `_poisonPool` | `double` | `0` |
| 73 | `burnT` | `double` | `0` |
| 74 | `burnStk` | `double` | `0` |
| 75 | `_burnPool` | `double` | `0` |
| 76 | `shieldBashCd` | `double` | `etype===6?(120+Math.random()*60):9999` |
| 77 | `shieldBashT` | `double` | `etype===6?(60+Math.random()*40):9999` |
| 78 | `summonCd` | `double` | `etype===7?(200+Math.random()*100):9999` |
| 79 | `summonT` | `double` | `etype===7?(100+Math.random()*60):9999` |
| 80 | `teleportCd` | `double` | `etype===7?(150+Math.random()*80):9999` |
| 81 | `teleportT` | `double` | `etype===7?(80+Math.random()*40):9999` |
| 82 | `_tpWarnT` | `double` | `0` |
| 83 | `_tpWarnMax` | `double` | `30` |
| 84 | `_tpWarnX` | `double` | `0` |
| 85 | `_tpWarnY` | `double` | `0` |
| 86 | `_tpWarnCol` | `string` | `'#aa00ff'` |
| 87 | `bombCd` | `double` | `etype===8?(100+Math.random()*50):9999` |
| 88 | `bombT` | `double` | `etype===8?(50+Math.random()*30):9999` |
| 89 | `reviveCd` | `double` | `etype===9?(300+Math.random()*120):9999` |
| 90 | `reviveT` | `double` | `etype===9?(150+Math.random()*80):9999` |
| 91 | `stealthCd` | `double` | `etype===10?(180+Math.random()*60):9999` |
| 92 | `stealthT` | `double` | `etype===10?(60+Math.random()*40):9999` |
| 93 | `_cloaked` | `bool` | `false` |
| 94 | `wombCd` | `double` | `etype===11?(240+Math.random()*80):9999` |
| 95 | `wombT` | `double` | `etype===11?(80+Math.random()*40):9999` |
| 96 | `_enraged` | `bool` | `false` |
| 97 | `webCd` | `double` | `etype===13?(120+Math.random()*40):9999` |
| 98 | `webT` | `double` | `etype===13?(40+Math.random()*20):9999` |
| 99 | `swoopCd` | `double` | `etype===14?(140+Math.random()*60):9999` |
| 100 | `swoopT` | `double` | `etype===14?(50+Math.random()*30):9999` |
| 101 | `_swoopOx` | `double` | `0` |
| 102 | `_swoopOy` | `double` | `0` |
| 103 | `_homeX` | `double` | `x` |
| 104 | `_homeY` | `double` | `y` |
| 105 | `_patrolX` | `double` | `0` |
| 106 | `_patrolY` | `double` | `0` |
| 107 | `_patrolT` | `double` | `0` |
| 108 | `_splitDone` | `bool` | `false` |
| 109 | `trapCd` | `double` | `etype===16?(200+Math.random()*60):9999` |
| 110 | `trapT` | `double` | `etype===16?(60+Math.random()*30):9999` |
| 111 | `motherCd` | `double` | `etype===17?(300+Math.random()*100):9999` |
| 112 | `motherT` | `double` | `etype===17?(100+Math.random()*50):9999` |
| 113 | `drainHeal` | `double` | `etype===18?.3:0` |
| 114 | `_iceOnHit` | `bool` | `etype>=20&&etype<=29` |
| 115 | `slamCd` | `double` | `etype===19?(200+Math.random()*80):9999` |
| 116 | `slamT` | `double` | `etype===19?(80+Math.random()*40):9999` |
| 117 | `_iceFreeze` | `double` | `etype>=20&&etype<=29?.35:0` |
| 118 | `_iceChargeCd` | `double` | `etype===22?(80+Math.random()*40):9999` |
| 119 | `_iceChargeT` | `double` | `etype===22?(40+Math.random()*20):9999` |
| 120 | `_iceSwoopCd` | `double` | `etype===27?(100+Math.random()*40):9999` |
| 121 | `_iceSwoopT` | `double` | `etype===27?(30+Math.random()*20):9999` |
| 122 | `_iceSwoopOx` | `double` | `0` |
| 123 | `_iceSwoopOy` | `double` | `0` |
| 124 | `_iceSlimeCd` | `double` | `etype===25?(120+Math.random()*40):9999` |
| 125 | `_iceSlimeT` | `double` | `etype===25?(40+Math.random()*20):9999` |
| 126 | `_iceSlamCd` | `double` | `(etype===28\|\|etype===29)?(250+Math.random()*80):9999` |
| 127 | `_iceSlamT` | `double` | `(etype===28\|\|etype===29)?(80+Math.random()*40):9999` |
| 128 | `_iceBlizzCd` | `double` | `etype===26?(180+Math.random()*60):9999` |
| 129 | `_iceBlizzT` | `double` | `etype===26?(60+Math.random()*30):9999` |
| 130 | `_wildChargeCd` | `double` | `etype===30?(60+Math.random()*30):9999` |
| 131 | `_wildChargeT` | `double` | `etype===30?(30+Math.random()*20):9999` |
| 132 | `_boulderSlamCd` | `double` | `etype===32?(200+Math.random()*60):9999` |
| 133 | `_boulderSlamT` | `double` | `etype===32?(80+Math.random()*40):9999` |
| 134 | `_poisonZoneCd` | `double` | `etype===34?(150+Math.random()*50):9999` |
| 135 | `_poisonZoneT` | `double` | `etype===34?(60+Math.random()*30):9999` |
| 136 | `_beastComboCd` | `double` | `etype===35?(120+Math.random()*40):9999` |
| 137 | `_beastComboT` | `double` | `etype===35?(50+Math.random()*30):9999` |
| 138 | `_beastRoarCd` | `double` | `etype===35?(300+Math.random()*80):9999` |
| 139 | `_beastRoarT` | `double` | `etype===35?(120+Math.random()*60):9999` |
| 140 | `_serpentZigCd` | `double` | `etype===36?(80+Math.random()*30):9999` |
| 141 | `_serpentZigT` | `double` | `etype===36?(40+Math.random()*20):9999` |
| 142 | `_predStealthCd` | `double` | `etype===37?(200+Math.random()*60):9999` |
| 143 | `_predStealthT` | `double` | `etype===37?(80+Math.random()*40):9999` |
| 144 | `_predCorpseHeal` | `double` | `etype===37?.3:0` |
| 145 | `_broodSpawnCd` | `double` | `etype===38?(180+Math.random()*60):9999` |
| 146 | `_broodSpawnT` | `double` | `etype===38?(60+Math.random()*30):9999` |
| 147 | `_broodGasCd` | `double` | `etype===38?(250+Math.random()*80):9999` |
| 148 | `_broodGasT` | `double` | `etype===38?(100+Math.random()*40):9999` |
| 149 | `_elderRoarCd` | `double` | `etype===39?(250+Math.random()*80):9999` |
| 150 | `_elderRoarT` | `double` | `etype===39?(100+Math.random()*40):9999` |
| 151 | `_elderChargeCd` | `double` | `etype===39?(150+Math.random()*50):9999` |
| 152 | `_elderChargeT` | `double` | `etype===39?(60+Math.random()*30):9999` |
| 153 | `_elderSlamCd` | `double` | `etype===39?(300+Math.random()*80):9999` |
| 154 | `_elderSlamT` | `double` | `etype===39?(120+Math.random()*60):9999` |
| 155 | `_bossOrbitAng` | `double` | `Math.random()*Math.PI*2` |
| 156 | `_bossStrafeCd` | `double` | `0` |
| 157 | `_wraithPhaseT` | `double` | `etype===40?(120+Math.random()*60):9999` |
| 158 | `_wraithPhaseCd` | `double` | `etype===40?(240+Math.random()*80):9999` |
| 159 | `_wraithPhasing` | `bool` | `false` |
| 160 | `_dkGuardCd` | `double` | `etype===41?(150+Math.random()*50):9999` |
| 161 | `_dkGuardT` | `double` | `etype===41?(80+Math.random()*40):9999` |
| 162 | `_dkGuarding` | `bool` | `false` |
| 163 | `_dkSlashCd` | `double` | `etype===41?(100+Math.random()*40):9999` |
| 164 | `_dkSlashT` | `double` | `etype===41?(40+Math.random()*20):9999` |
| 165 | `_fmAbsorbCd` | `double` | `etype===42?(180+Math.random()*60):9999` |
| 166 | `_fmSpitCd` | `double` | `etype===42?(200+Math.random()*80):9999` |
| 167 | `_fmSpitT` | `double` | `etype===42?(80+Math.random()*40):9999` |
| 168 | `_ddLungeCd` | `double` | `etype===43?(80+Math.random()*30):9999` |
| 169 | `_ddLungeT` | `double` | `etype===43?(30+Math.random()*15):9999` |
| 170 | `_torChainCd` | `double` | `etype===44?(100+Math.random()*40):9999` |
| 171 | `_torChainT` | `double` | `etype===44?(40+Math.random()*20):9999` |
| 172 | `_torBleed` | `double` | `etype===44?.4:0` |
| 173 | `_wdSwoopCd` | `double` | `etype===45?(90+Math.random()*40):9999` |
| 174 | `_wdSwoopT` | `double` | `etype===45?(30+Math.random()*15):9999` |
| 175 | `_wdSwoopOx` | `double` | `0` |
| 176 | `_wdSwoopOy` | `double` | `0` |
| 177 | `_pillarRingCd` | `double` | `etype===46?(180+Math.random()*60):9999` |
| 178 | `_pillarRingT` | `double` | `etype===46?(60+Math.random()*30):9999` |
| 179 | `_pillarAoeCd` | `double` | `etype===46?(300+Math.random()*80):9999` |
| 180 | `_pillarAoeT` | `double` | `etype===46?(80+Math.random()*40):9999` |
| 181 | `_stCloneCd` | `double` | `etype===47?(200+Math.random()*60):9999` |
| 182 | `_stCloneT` | `double` | `etype===47?(80+Math.random()*40):9999` |
| 183 | `_stTpCd` | `double` | `etype===47?(120+Math.random()*40):9999` |
| 184 | `_hpHealCd` | `double` | `etype===48?(200+Math.random()*80):9999` |
| 185 | `_hpHealT` | `double` | `etype===48?(80+Math.random()*40):9999` |
| 186 | `_hpBuffCd` | `double` | `etype===48?(250+Math.random()*80):9999` |
| 187 | `_hpProjCd` | `double` | `etype===48?(120+Math.random()*50):9999` |
| 188 | `_adPhase` | `double` | `etype===49?0:-1` |
| 189 | `_adFireCd` | `double` | `etype===49?(150+Math.random()*50):9999` |
| 190 | `_adFireT` | `double` | `etype===49?(60+Math.random()*30):9999` |
| 191 | `_adSummonCd` | `double` | `etype===49?(400+Math.random()*100):9999` |
| 192 | `_adChargeCd` | `double` | `etype===49?(200+Math.random()*60):9999` |
| 193 | `_adSlamCd` | `double` | `etype===49?(250+Math.random()*80):9999` |
| 194 | `_adSlamT` | `double` | `etype===49?(80+Math.random()*40):9999` |
| 195 | `_erraticT` | `double` | `etype===50?(30+Math.random()*30):9999` |
| 196 | `_erraticAng` | `double` | `Math.random()*Math.PI*2` |
| 197 | `_amalgCleave` | `bool` | `etype===51` |
| 198 | `_amalgSplit` | `bool` | `false` |
| 199 | `_tongueCd` | `double` | `etype===52?(160+Math.random()*60):9999` |
| 200 | `_tongueT` | `double` | `etype===52?(60+Math.random()*30):9999` |
| 201 | `_gazeCd` | `double` | `etype===53?(180+Math.random()*60):9999` |
| 202 | `_gazeT` | `double` | `etype===53?(80+Math.random()*40):9999` |
| 203 | `_gazeAng` | `double` | `0` |
| 204 | `_hangCd` | `double` | `etype===54?(200+Math.random()*60):9999` |
| 205 | `_hangT` | `double` | `etype===54?(80+Math.random()*40):9999` |
| 206 | `_hanging` | `bool` | `etype===54` |
| 207 | `_boneChargeCd` | `double` | `etype===55?(120+Math.random()*50):9999` |
| 208 | `_boneChargeT` | `double` | `etype===55?(50+Math.random()*30):9999` |
| 209 | `_boneDeath` | `bool` | `etype===55` |
| 210 | `_bloodCd` | `double` | `etype===56?(100+Math.random()*40):9999` |
| 211 | `_bloodT` | `double` | `etype===56?(40+Math.random()*20):9999` |
| 212 | `_curled` | `bool` | `etype===57` |
| 213 | `_curlTimer` | `double` | `etype===57?(300+Math.random()*120):0` |
| 214 | `_mirrorBuf` | `List<double>` | `etype===58?[]:null` |
| 215 | `_mirrorDelay` | `double` | `60` |
| 216 | `_overlordPhase` | `double` | `etype===59?0:-1` |
| 217 | `_overlordCd` | `double` | `etype===59?120:9999` |
| 218 | `_lavaBurn` | `double` | `etype>=70&&etype<=79?.4:0` |
| 219 | `_lavaPoolDeath` | `bool` | `etype===70\|\|etype===72` |
| 220 | `_volcBombCd` | `double` | `etype===71?(120+Math.random()*50):9999` |
| 221 | `_volcBombT` | `double` | `etype===71?(50+Math.random()*30):9999` |
| 222 | `_fireBatSuicide` | `bool` | `etype===73` |
| 223 | `_fireBatSwoopCd` | `double` | `etype===73?(80+Math.random()*30):9999` |
| 224 | `_fireBatSwoopT` | `double` | `etype===73?(30+Math.random()*15):9999` |
| 225 | `_fireBatSwoopOx` | `double` | `0` |
| 226 | `_fireBatSwoopOy` | `double` | `0` |
| 227 | `_obsGuardCd` | `double` | `etype===74?(100+Math.random()*40):9999` |
| 228 | `_obsGuardT` | `double` | `0` |
| 229 | `_obsGuarding` | `bool` | `false` |
| 230 | `_fsBurrowCd` | `double` | `etype===75?(140+Math.random()*50):9999` |
| 231 | `_fsBurrowT` | `double` | `0` |
| 232 | `_fsBurrowed` | `bool` | `false` |
| 233 | `_fsGrabT` | `double` | `0` |
| 234 | `_ashSwarmGrab` | `bool` | `etype===76` |
| 235 | `_lavaGiantSlamCd` | `double` | `etype===77?(200+Math.random()*80):9999` |
| 236 | `_lavaGiantSlamT` | `double` | `etype===77?(80+Math.random()*40):9999` |
| 237 | `_flPriestRevCd` | `double` | `etype===78?(300+Math.random()*100):9999` |
| 238 | `_flPriestRevT` | `double` | `etype===78?(100+Math.random()*50):9999` |
| 239 | `_flPriestBuffCd` | `double` | `etype===78?(200+Math.random()*60):9999` |
| 240 | `_dragonPhase` | `double` | `etype===79?0:-1` |
| 241 | `_dragonBreathCd` | `double` | `etype===79?(180+Math.random()*60):9999` |
| 242 | `_dragonBreathT` | `double` | `0` |
| 243 | `_dragonFlyCd` | `double` | `etype===79?(300+Math.random()*100):9999` |
| 244 | `_dragonFlyT` | `double` | `0` |
| 245 | `_dragonFlying` | `bool` | `false` |
| 246 | `_dragonMeteorCd` | `double` | `etype===79?(250+Math.random()*80):9999` |
| 247 | `_seaGrabT` | `double` | `0` |
| 248 | `_seaGrabCd` | `double` | `(etype===60\|\|etype===64)?(120+Math.random()*40):9999` |
| 249 | `_seaSpitCd` | `double` | `etype===60?(180+Math.random()*60):9999` |
| 250 | `_anglerLure` | `bool` | `etype===61` |
| 251 | `_anglerCharging` | `bool` | `false` |
| 252 | `_anglerLureCd` | `double` | `etype===61?(200+Math.random()*80):9999` |
| 253 | `_jellyParaCd` | `double` | `etype===62?(100+Math.random()*40):9999` |
| 254 | `_jellyZapCd` | `double` | `etype===62?(180+Math.random()*60):9999` |
| 255 | `_crabGuard` | `bool` | `false` |
| 256 | `_crabGuardT` | `double` | `0` |
| 257 | `_crabGuardCd` | `double` | `etype===63?(80+Math.random()*30):9999` |
| 258 | `_crabSlamCd` | `double` | `etype===63?(150+Math.random()*50):9999` |
| 259 | `_eelBurrowed` | `bool` | `false` |
| 260 | `_eelBurrowCd` | `double` | `etype===65?(100+Math.random()*40):9999` |
| 261 | `_eelBurrowT` | `double` | `0` |
| 262 | `_eelGrabT` | `double` | `0` |
| 263 | `_coralSpikeCd` | `double` | `etype===66?(120+Math.random()*40):9999` |
| 264 | `_coralProjCd` | `double` | `etype===66?(200+Math.random()*60):9999` |
| 265 | `_sirenSongCd` | `double` | `etype===67?(150+Math.random()*50):9999` |
| 266 | `_sirenDashCd` | `double` | `etype===67?(100+Math.random()*40):9999` |
| 267 | `_sirenFlee` | `bool` | `false` |
| 268 | `_levChargeCd` | `double` | `etype===68?(180+Math.random()*60):9999` |
| 269 | `_levTailCd` | `double` | `etype===68?(250+Math.random()*80):9999` |
| 270 | `_levParaCd` | `double` | `etype===68?(300+Math.random()*80):9999` |
| 271 | `_abyssPhase` | `double` | `etype===69?0:-1` |
| 272 | `_abyssTentCd` | `double` | `etype===69?(120+Math.random()*40):9999` |
| 273 | `_abyssTridCd` | `double` | `etype===69?(200+Math.random()*60):9999` |
| 274 | `_abyssWhirlCd` | `double` | `etype===69?(300+Math.random()*80):9999` |
| 275 | `_abyssSumCd` | `double` | `etype===69?(400+Math.random()*100):9999` |
| 276 | `_abyssTideCd` | `double` | `etype===69?(500+Math.random()*100):9999` |
| 277 | `_ppRushCd` | `double` | `etype===80?(60+Math.random()*40):9999` |
| 278 | `_ppSelfDestT` | `double` | `0` |
| 279 | `_tePullCd` | `double` | `etype===81?(150+Math.random()*50):9999` |
| 280 | `_teGrindT` | `double` | `0` |
| 281 | `_bpDrainCd` | `double` | `etype===82?(120+Math.random()*40):9999` |
| 282 | `_bpHealPool` | `double` | `0` |
| 283 | `_scPierce` | `bool` | `etype===83` |
| 284 | `_psCreamCd` | `double` | `etype===84?(200+Math.random()*60):9999` |
| 285 | `_psGrabCd` | `double` | `etype===84?(150+Math.random()*50):9999` |
| 286 | `_psSpawnCd` | `double` | `etype===84?(300+Math.random()*80):9999` |
| 287 | `_dkComboCd` | `double` | `etype===85?(60+Math.random()*30):9999` |
| 288 | `_dkDodgeCd` | `double` | `etype===85?(80+Math.random()*30):9999` |
| 289 | `_dkParryCd` | `double` | `etype===85?(100+Math.random()*40):9999` |
| 290 | `_iaElSwap` | `double` | `0` |
| 291 | `_iaSpearCd` | `double` | `etype===86?(100+Math.random()*40):9999` |
| 292 | `_iaBurstCd` | `double` | `etype===86?(200+Math.random()*60):9999` |
| 293 | `_dgCopied` | `bool` | `false` |
| 294 | `_dgRevived` | `bool` | `false` |
| 295 | `_jdScaleCd` | `double` | `etype===88?(180+Math.random()*60):9999` |
| 296 | `_jdPillarCd` | `double` | `etype===88?(250+Math.random()*80):9999` |
| 297 | `_jdExecCd` | `double` | `etype===88?(400+Math.random()*100):9999` |
| 298 | `_kaPhase` | `double` | `etype===89?0:-1` |
| 299 | `_kaSwordCd` | `double` | `etype===89?(100+Math.random()*40):9999` |
| 300 | `_kaTentCd` | `double` | `etype===89?(180+Math.random()*60):9999` |
| 301 | `_kaFlyCd` | `double` | `etype===89?(300+Math.random()*80):9999` |
| 302 | `_kaBeamCd` | `double` | `etype===89?(400+Math.random()*100):9999` |
| 303 | `_kaSumCd` | `double` | `etype===89?(350+Math.random()*80):9999` |
| 304 | `_kaFlyT` | `double` | `0` |
| 305 | `_kaFlying` | `bool` | `false` |
| 306 | `_isRare` | `bool` | `_rare` |
| 307 | `_rkCombo` | `double` | `0` |
| 308 | `_rkComboCd` | `double` | `0` |
| 309 | `_rkParryCd` | `double` | `0` |
| 310 | `_rkDodgeCd` | `double` | `0` |
| 311 | `_tmFleeing` | `bool` | `false` |
| 312 | `_tmHitCnt` | `double` | `0` |
| 313 | `_tmCounterCd` | `double` | `0` |
| 314 | `_mrAbsorb` | `double` | `0` |
| 315 | `_mrAbsorbMax` | `double` | `etype===92?~~(_hp*.5):0` |
| 316 | `_mcShopUsed` | `bool` | `false` |
| 317 | `_mcFleeing` | `bool` | `false` |
| 318 | `_cpPhase` | `double` | `etype===94?1:0` |
| 319 | `_tsTpCd` | `double` | `etype===95?180:9999` |
| 320 | `_tsSlowT` | `double` | `0` |
| 321 | `_tsRewindHp` | `List<double>` | `[]` |
| 322 | `_tsRewindUsed` | `bool` | `false` |
| 323 | `_grGold` | `double` | `0` |
| 324 | `_grGrowth` | `double` | `1` |
| 325 | `_grAbsorbCd` | `double` | `0` |
| 326 | `_twPhase` | `string` | `etype===97?'melee':null` |
| 327 | `_twRotT` | `double` | `etype===97?300:0` |
| 328 | `_twReviveT` | `double` | `0` |
| 329 | `_twDead` | `bool` | `false` |
| 330 | `_drTpCd` | `double` | `etype===98?120:9999` |
| 331 | `_drRiftCd` | `double` | `etype===98?300:9999` |
| 332 | `_drSumCd` | `double` | `etype===98?400:9999` |
| 333 | `_deathT` | `double` | `etype===99?1800:0` |
| 334 | `_deathSent` | `double` | `0` |
| 335 | `_deathScCd` | `double` | `etype===99?120:9999` |
| 336 | `_spawnT` | `double` | `20` |
| 337 | `_mobCh` | `double?` | `_assignMobSkin`이 스폰 뒤 채움(보스는 `undefined`) |
| 338 | `_mob8Col` | `double?` | `_assignMobSkin`이 스폰 뒤 채움(보스는 `undefined`) |
| 339 | `_mob8Row` | `double?` | `_assignMobSkin`이 스폰 뒤 채움(보스는 `undefined`) |
| 340 | `_mob8dir` | `bool?` | `_assignMobSkin`이 스폰 뒤 채움(보스는 `undefined`) |
| 341 | `_mobSkinPending` | `bool?` | `_assignMobSkin`이 스폰 뒤 채움(보스는 `undefined`) |

## 4. 난수 소비 순서표 (`Math.random()` 호출 순서 — C# `Random()`이 같은 순서로 같은 횟수를 꺼낸다)

`literal`의 소비는 **선언 순서대로**, 조건식이 거짓이면 소비하지 않는다. 일반 적(etype 0, 비엘리트)은 9회, 보스는 etype 조건 필드에 따라 6~12회, oracle 전체 최대 19회를 쓴다.

| 순서 | 위치 | 조건 | 식 | 횟수 |
|---|---|---|---|---|
| 1 | `rollElite(si)` (literal 앞) | `!ib` 그리고 `!isRareEtype(etype)` | `roll=Math.random()` | 1 |
| 2 | `rollMods(elite,si)` (literal 앞) | `elite>0` 이고 풀·개수가 비어 있지 않음 | `공격 모디파이어 attackCount회(~~(Math.random()*attacks.length)) 뒤 일반 모디파이어 cnt-attackCount회까지(풀이 마르면 중단)` | 가변 |
| 3 | `spd` (literal 앞) | `!ib` | `(ETYPE_SPD[etype]+Math.random()*.08)*1.5 (레어는 *.05)` | 1 |
| 4 | `r` (literal 앞) | `!ib` | `ETYPE_R[etype]+Math.random()*2 (레어는 _rd.r+…)` | 1 |
| 5 | literal `st2` | 항상 | `30+Math.random()*50` | 1 |
| 6 | literal `facing` | 항상 | `Math.random()*Math.PI*2` | 1 |
| 7 | literal `aura` | `elite>=2` | `rollAura(elite,si) → pool[~~(Math.random()*pool.length)]` | 1 |
| 8 | literal projT | 항상 (보스/일반 식만 다름, 한 분기만 실행) | `ib?70+Math.random()*50:180+Math.random()*120` | 1 |
| 9 | literal `chargeCd` | `etype===2\|\|etype===22` | `(etype===2\|\|etype===22)?(100+Math.random()*60):9999` | 1 |
| 10 | literal `bossPatT` | 항상 | `30+Math.random()*20` | 1 |
| 11 | literal `shieldAng` | `etype===6` | `etype===6?Math.random()*Math.PI*2:0` | 1 |
| 12 | literal `shieldBashCd` | `etype===6` | `etype===6?(120+Math.random()*60):9999` | 1 |
| 13 | literal `shieldBashT` | `etype===6` | `etype===6?(60+Math.random()*40):9999` | 1 |
| 14 | literal `summonCd` | `etype===7` | `etype===7?(200+Math.random()*100):9999` | 1 |
| 15 | literal `summonT` | `etype===7` | `etype===7?(100+Math.random()*60):9999` | 1 |
| 16 | literal `teleportCd` | `etype===7` | `etype===7?(150+Math.random()*80):9999` | 1 |
| 17 | literal `teleportT` | `etype===7` | `etype===7?(80+Math.random()*40):9999` | 1 |
| 18 | literal `bombCd` | `etype===8` | `etype===8?(100+Math.random()*50):9999` | 1 |
| 19 | literal `bombT` | `etype===8` | `etype===8?(50+Math.random()*30):9999` | 1 |
| 20 | literal `reviveCd` | `etype===9` | `etype===9?(300+Math.random()*120):9999` | 1 |
| 21 | literal `reviveT` | `etype===9` | `etype===9?(150+Math.random()*80):9999` | 1 |
| 22 | literal `stealthCd` | `etype===10` | `etype===10?(180+Math.random()*60):9999` | 1 |
| 23 | literal `stealthT` | `etype===10` | `etype===10?(60+Math.random()*40):9999` | 1 |
| 24 | literal `wombCd` | `etype===11` | `etype===11?(240+Math.random()*80):9999` | 1 |
| 25 | literal `wombT` | `etype===11` | `etype===11?(80+Math.random()*40):9999` | 1 |
| 26 | literal `webCd` | `etype===13` | `etype===13?(120+Math.random()*40):9999` | 1 |
| 27 | literal `webT` | `etype===13` | `etype===13?(40+Math.random()*20):9999` | 1 |
| 28 | literal `swoopCd` | `etype===14` | `etype===14?(140+Math.random()*60):9999` | 1 |
| 29 | literal `swoopT` | `etype===14` | `etype===14?(50+Math.random()*30):9999` | 1 |
| 30 | literal `trapCd` | `etype===16` | `etype===16?(200+Math.random()*60):9999` | 1 |
| 31 | literal `trapT` | `etype===16` | `etype===16?(60+Math.random()*30):9999` | 1 |
| 32 | literal `motherCd` | `etype===17` | `etype===17?(300+Math.random()*100):9999` | 1 |
| 33 | literal `motherT` | `etype===17` | `etype===17?(100+Math.random()*50):9999` | 1 |
| 34 | literal `slamCd` | `etype===19` | `etype===19?(200+Math.random()*80):9999` | 1 |
| 35 | literal `slamT` | `etype===19` | `etype===19?(80+Math.random()*40):9999` | 1 |
| 36 | literal `_iceChargeCd` | `etype===22` | `etype===22?(80+Math.random()*40):9999` | 1 |
| 37 | literal `_iceChargeT` | `etype===22` | `etype===22?(40+Math.random()*20):9999` | 1 |
| 38 | literal `_iceSwoopCd` | `etype===27` | `etype===27?(100+Math.random()*40):9999` | 1 |
| 39 | literal `_iceSwoopT` | `etype===27` | `etype===27?(30+Math.random()*20):9999` | 1 |
| 40 | literal `_iceSlimeCd` | `etype===25` | `etype===25?(120+Math.random()*40):9999` | 1 |
| 41 | literal `_iceSlimeT` | `etype===25` | `etype===25?(40+Math.random()*20):9999` | 1 |
| 42 | literal `_iceSlamCd` | `etype===28\|\|etype===29` | `(etype===28\|\|etype===29)?(250+Math.random()*80):9999` | 1 |
| 43 | literal `_iceSlamT` | `etype===28\|\|etype===29` | `(etype===28\|\|etype===29)?(80+Math.random()*40):9999` | 1 |
| 44 | literal `_iceBlizzCd` | `etype===26` | `etype===26?(180+Math.random()*60):9999` | 1 |
| 45 | literal `_iceBlizzT` | `etype===26` | `etype===26?(60+Math.random()*30):9999` | 1 |
| 46 | literal `_wildChargeCd` | `etype===30` | `etype===30?(60+Math.random()*30):9999` | 1 |
| 47 | literal `_wildChargeT` | `etype===30` | `etype===30?(30+Math.random()*20):9999` | 1 |
| 48 | literal `_boulderSlamCd` | `etype===32` | `etype===32?(200+Math.random()*60):9999` | 1 |
| 49 | literal `_boulderSlamT` | `etype===32` | `etype===32?(80+Math.random()*40):9999` | 1 |
| 50 | literal `_poisonZoneCd` | `etype===34` | `etype===34?(150+Math.random()*50):9999` | 1 |
| 51 | literal `_poisonZoneT` | `etype===34` | `etype===34?(60+Math.random()*30):9999` | 1 |
| 52 | literal `_beastComboCd` | `etype===35` | `etype===35?(120+Math.random()*40):9999` | 1 |
| 53 | literal `_beastComboT` | `etype===35` | `etype===35?(50+Math.random()*30):9999` | 1 |
| 54 | literal `_beastRoarCd` | `etype===35` | `etype===35?(300+Math.random()*80):9999` | 1 |
| 55 | literal `_beastRoarT` | `etype===35` | `etype===35?(120+Math.random()*60):9999` | 1 |
| 56 | literal `_serpentZigCd` | `etype===36` | `etype===36?(80+Math.random()*30):9999` | 1 |
| 57 | literal `_serpentZigT` | `etype===36` | `etype===36?(40+Math.random()*20):9999` | 1 |
| 58 | literal `_predStealthCd` | `etype===37` | `etype===37?(200+Math.random()*60):9999` | 1 |
| 59 | literal `_predStealthT` | `etype===37` | `etype===37?(80+Math.random()*40):9999` | 1 |
| 60 | literal `_broodSpawnCd` | `etype===38` | `etype===38?(180+Math.random()*60):9999` | 1 |
| 61 | literal `_broodSpawnT` | `etype===38` | `etype===38?(60+Math.random()*30):9999` | 1 |
| 62 | literal `_broodGasCd` | `etype===38` | `etype===38?(250+Math.random()*80):9999` | 1 |
| 63 | literal `_broodGasT` | `etype===38` | `etype===38?(100+Math.random()*40):9999` | 1 |
| 64 | literal `_elderRoarCd` | `etype===39` | `etype===39?(250+Math.random()*80):9999` | 1 |
| 65 | literal `_elderRoarT` | `etype===39` | `etype===39?(100+Math.random()*40):9999` | 1 |
| 66 | literal `_elderChargeCd` | `etype===39` | `etype===39?(150+Math.random()*50):9999` | 1 |
| 67 | literal `_elderChargeT` | `etype===39` | `etype===39?(60+Math.random()*30):9999` | 1 |
| 68 | literal `_elderSlamCd` | `etype===39` | `etype===39?(300+Math.random()*80):9999` | 1 |
| 69 | literal `_elderSlamT` | `etype===39` | `etype===39?(120+Math.random()*60):9999` | 1 |
| 70 | literal `_bossOrbitAng` | 항상 | `Math.random()*Math.PI*2` | 1 |
| 71 | literal `_wraithPhaseT` | `etype===40` | `etype===40?(120+Math.random()*60):9999` | 1 |
| 72 | literal `_wraithPhaseCd` | `etype===40` | `etype===40?(240+Math.random()*80):9999` | 1 |
| 73 | literal `_dkGuardCd` | `etype===41` | `etype===41?(150+Math.random()*50):9999` | 1 |
| 74 | literal `_dkGuardT` | `etype===41` | `etype===41?(80+Math.random()*40):9999` | 1 |
| 75 | literal `_dkSlashCd` | `etype===41` | `etype===41?(100+Math.random()*40):9999` | 1 |
| 76 | literal `_dkSlashT` | `etype===41` | `etype===41?(40+Math.random()*20):9999` | 1 |
| 77 | literal `_fmAbsorbCd` | `etype===42` | `etype===42?(180+Math.random()*60):9999` | 1 |
| 78 | literal `_fmSpitCd` | `etype===42` | `etype===42?(200+Math.random()*80):9999` | 1 |
| 79 | literal `_fmSpitT` | `etype===42` | `etype===42?(80+Math.random()*40):9999` | 1 |
| 80 | literal `_ddLungeCd` | `etype===43` | `etype===43?(80+Math.random()*30):9999` | 1 |
| 81 | literal `_ddLungeT` | `etype===43` | `etype===43?(30+Math.random()*15):9999` | 1 |
| 82 | literal `_torChainCd` | `etype===44` | `etype===44?(100+Math.random()*40):9999` | 1 |
| 83 | literal `_torChainT` | `etype===44` | `etype===44?(40+Math.random()*20):9999` | 1 |
| 84 | literal `_wdSwoopCd` | `etype===45` | `etype===45?(90+Math.random()*40):9999` | 1 |
| 85 | literal `_wdSwoopT` | `etype===45` | `etype===45?(30+Math.random()*15):9999` | 1 |
| 86 | literal `_pillarRingCd` | `etype===46` | `etype===46?(180+Math.random()*60):9999` | 1 |
| 87 | literal `_pillarRingT` | `etype===46` | `etype===46?(60+Math.random()*30):9999` | 1 |
| 88 | literal `_pillarAoeCd` | `etype===46` | `etype===46?(300+Math.random()*80):9999` | 1 |
| 89 | literal `_pillarAoeT` | `etype===46` | `etype===46?(80+Math.random()*40):9999` | 1 |
| 90 | literal `_stCloneCd` | `etype===47` | `etype===47?(200+Math.random()*60):9999` | 1 |
| 91 | literal `_stCloneT` | `etype===47` | `etype===47?(80+Math.random()*40):9999` | 1 |
| 92 | literal `_stTpCd` | `etype===47` | `etype===47?(120+Math.random()*40):9999` | 1 |
| 93 | literal `_hpHealCd` | `etype===48` | `etype===48?(200+Math.random()*80):9999` | 1 |
| 94 | literal `_hpHealT` | `etype===48` | `etype===48?(80+Math.random()*40):9999` | 1 |
| 95 | literal `_hpBuffCd` | `etype===48` | `etype===48?(250+Math.random()*80):9999` | 1 |
| 96 | literal `_hpProjCd` | `etype===48` | `etype===48?(120+Math.random()*50):9999` | 1 |
| 97 | literal `_adFireCd` | `etype===49` | `etype===49?(150+Math.random()*50):9999` | 1 |
| 98 | literal `_adFireT` | `etype===49` | `etype===49?(60+Math.random()*30):9999` | 1 |
| 99 | literal `_adSummonCd` | `etype===49` | `etype===49?(400+Math.random()*100):9999` | 1 |
| 100 | literal `_adChargeCd` | `etype===49` | `etype===49?(200+Math.random()*60):9999` | 1 |
| 101 | literal `_adSlamCd` | `etype===49` | `etype===49?(250+Math.random()*80):9999` | 1 |
| 102 | literal `_adSlamT` | `etype===49` | `etype===49?(80+Math.random()*40):9999` | 1 |
| 103 | literal `_erraticT` | `etype===50` | `etype===50?(30+Math.random()*30):9999` | 1 |
| 104 | literal `_erraticAng` | 항상 | `Math.random()*Math.PI*2` | 1 |
| 105 | literal `_tongueCd` | `etype===52` | `etype===52?(160+Math.random()*60):9999` | 1 |
| 106 | literal `_tongueT` | `etype===52` | `etype===52?(60+Math.random()*30):9999` | 1 |
| 107 | literal `_gazeCd` | `etype===53` | `etype===53?(180+Math.random()*60):9999` | 1 |
| 108 | literal `_gazeT` | `etype===53` | `etype===53?(80+Math.random()*40):9999` | 1 |
| 109 | literal `_hangCd` | `etype===54` | `etype===54?(200+Math.random()*60):9999` | 1 |
| 110 | literal `_hangT` | `etype===54` | `etype===54?(80+Math.random()*40):9999` | 1 |
| 111 | literal `_boneChargeCd` | `etype===55` | `etype===55?(120+Math.random()*50):9999` | 1 |
| 112 | literal `_boneChargeT` | `etype===55` | `etype===55?(50+Math.random()*30):9999` | 1 |
| 113 | literal `_bloodCd` | `etype===56` | `etype===56?(100+Math.random()*40):9999` | 1 |
| 114 | literal `_bloodT` | `etype===56` | `etype===56?(40+Math.random()*20):9999` | 1 |
| 115 | literal `_curlTimer` | `etype===57` | `etype===57?(300+Math.random()*120):0` | 1 |
| 116 | literal `_volcBombCd` | `etype===71` | `etype===71?(120+Math.random()*50):9999` | 1 |
| 117 | literal `_volcBombT` | `etype===71` | `etype===71?(50+Math.random()*30):9999` | 1 |
| 118 | literal `_fireBatSwoopCd` | `etype===73` | `etype===73?(80+Math.random()*30):9999` | 1 |
| 119 | literal `_fireBatSwoopT` | `etype===73` | `etype===73?(30+Math.random()*15):9999` | 1 |
| 120 | literal `_obsGuardCd` | `etype===74` | `etype===74?(100+Math.random()*40):9999` | 1 |
| 121 | literal `_fsBurrowCd` | `etype===75` | `etype===75?(140+Math.random()*50):9999` | 1 |
| 122 | literal `_lavaGiantSlamCd` | `etype===77` | `etype===77?(200+Math.random()*80):9999` | 1 |
| 123 | literal `_lavaGiantSlamT` | `etype===77` | `etype===77?(80+Math.random()*40):9999` | 1 |
| 124 | literal `_flPriestRevCd` | `etype===78` | `etype===78?(300+Math.random()*100):9999` | 1 |
| 125 | literal `_flPriestRevT` | `etype===78` | `etype===78?(100+Math.random()*50):9999` | 1 |
| 126 | literal `_flPriestBuffCd` | `etype===78` | `etype===78?(200+Math.random()*60):9999` | 1 |
| 127 | literal `_dragonBreathCd` | `etype===79` | `etype===79?(180+Math.random()*60):9999` | 1 |
| 128 | literal `_dragonFlyCd` | `etype===79` | `etype===79?(300+Math.random()*100):9999` | 1 |
| 129 | literal `_dragonMeteorCd` | `etype===79` | `etype===79?(250+Math.random()*80):9999` | 1 |
| 130 | literal `_seaGrabCd` | `etype===60\|\|etype===64` | `(etype===60\|\|etype===64)?(120+Math.random()*40):9999` | 1 |
| 131 | literal `_seaSpitCd` | `etype===60` | `etype===60?(180+Math.random()*60):9999` | 1 |
| 132 | literal `_anglerLureCd` | `etype===61` | `etype===61?(200+Math.random()*80):9999` | 1 |
| 133 | literal `_jellyParaCd` | `etype===62` | `etype===62?(100+Math.random()*40):9999` | 1 |
| 134 | literal `_jellyZapCd` | `etype===62` | `etype===62?(180+Math.random()*60):9999` | 1 |
| 135 | literal `_crabGuardCd` | `etype===63` | `etype===63?(80+Math.random()*30):9999` | 1 |
| 136 | literal `_crabSlamCd` | `etype===63` | `etype===63?(150+Math.random()*50):9999` | 1 |
| 137 | literal `_eelBurrowCd` | `etype===65` | `etype===65?(100+Math.random()*40):9999` | 1 |
| 138 | literal `_coralSpikeCd` | `etype===66` | `etype===66?(120+Math.random()*40):9999` | 1 |
| 139 | literal `_coralProjCd` | `etype===66` | `etype===66?(200+Math.random()*60):9999` | 1 |
| 140 | literal `_sirenSongCd` | `etype===67` | `etype===67?(150+Math.random()*50):9999` | 1 |
| 141 | literal `_sirenDashCd` | `etype===67` | `etype===67?(100+Math.random()*40):9999` | 1 |
| 142 | literal `_levChargeCd` | `etype===68` | `etype===68?(180+Math.random()*60):9999` | 1 |
| 143 | literal `_levTailCd` | `etype===68` | `etype===68?(250+Math.random()*80):9999` | 1 |
| 144 | literal `_levParaCd` | `etype===68` | `etype===68?(300+Math.random()*80):9999` | 1 |
| 145 | literal `_abyssTentCd` | `etype===69` | `etype===69?(120+Math.random()*40):9999` | 1 |
| 146 | literal `_abyssTridCd` | `etype===69` | `etype===69?(200+Math.random()*60):9999` | 1 |
| 147 | literal `_abyssWhirlCd` | `etype===69` | `etype===69?(300+Math.random()*80):9999` | 1 |
| 148 | literal `_abyssSumCd` | `etype===69` | `etype===69?(400+Math.random()*100):9999` | 1 |
| 149 | literal `_abyssTideCd` | `etype===69` | `etype===69?(500+Math.random()*100):9999` | 1 |
| 150 | literal `_ppRushCd` | `etype===80` | `etype===80?(60+Math.random()*40):9999` | 1 |
| 151 | literal `_tePullCd` | `etype===81` | `etype===81?(150+Math.random()*50):9999` | 1 |
| 152 | literal `_bpDrainCd` | `etype===82` | `etype===82?(120+Math.random()*40):9999` | 1 |
| 153 | literal `_psCreamCd` | `etype===84` | `etype===84?(200+Math.random()*60):9999` | 1 |
| 154 | literal `_psGrabCd` | `etype===84` | `etype===84?(150+Math.random()*50):9999` | 1 |
| 155 | literal `_psSpawnCd` | `etype===84` | `etype===84?(300+Math.random()*80):9999` | 1 |
| 156 | literal `_dkComboCd` | `etype===85` | `etype===85?(60+Math.random()*30):9999` | 1 |
| 157 | literal `_dkDodgeCd` | `etype===85` | `etype===85?(80+Math.random()*30):9999` | 1 |
| 158 | literal `_dkParryCd` | `etype===85` | `etype===85?(100+Math.random()*40):9999` | 1 |
| 159 | literal `_iaSpearCd` | `etype===86` | `etype===86?(100+Math.random()*40):9999` | 1 |
| 160 | literal `_iaBurstCd` | `etype===86` | `etype===86?(200+Math.random()*60):9999` | 1 |
| 161 | literal `_jdScaleCd` | `etype===88` | `etype===88?(180+Math.random()*60):9999` | 1 |
| 162 | literal `_jdPillarCd` | `etype===88` | `etype===88?(250+Math.random()*80):9999` | 1 |
| 163 | literal `_jdExecCd` | `etype===88` | `etype===88?(400+Math.random()*100):9999` | 1 |
| 164 | literal `_kaSwordCd` | `etype===89` | `etype===89?(100+Math.random()*40):9999` | 1 |
| 165 | literal `_kaTentCd` | `etype===89` | `etype===89?(180+Math.random()*60):9999` | 1 |
| 166 | literal `_kaFlyCd` | `etype===89` | `etype===89?(300+Math.random()*80):9999` | 1 |
| 167 | literal `_kaBeamCd` | `etype===89` | `etype===89?(400+Math.random()*100):9999` | 1 |
| 168 | literal `_kaSumCd` | `etype===89` | `etype===89?(350+Math.random()*80):9999` | 1 |

### 난수 순서에서 주의할 곳 3개
1. **엘리트 판정이 맨 앞**: `rollElite`(1회)는 `spd`·`r`보다 먼저, `rollMods`의 횟수는 티어·`SI_TO_HELL`·모디파이어 풀에 따라 가변이고, `rollAura`(티어≥2)는 literal 안 `facing`과 `projT` 사이에 낀다. 보스·레어(90~99)는 이 세 함수를 아예 부르지 않는다.
2. **무조건 소비 필드가 etype 조건 필드 사이에 섞여 있다**: `st2`·`facing`·`projT`·`bossPatT`는 항상, `_bossOrbitAng`(etype 39 묶음 바로 뒤)와 `_erraticAng`(etype 50 줄 안, `_erraticT` 바로 뒤)도 **모든 etype에서** 소비한다. etype별 `cond?(a+rnd*b):9999`는 거짓이면 소비하지 않으므로 순서만 틀려도(예: etype 6 `shieldAng`은 `_druidBaseAtk` 뒤·`eShield` 앞, `shieldBashCd/T`는 그 한참 뒤 `bleed…` 다음) 이후 값이 전부 밀린다.
3. **etype 치환·좌표 이동이 소비보다 먼저**: 오프닝(si 0·비보스)의 etype 2/22/30/43 → 0 치환이 먼저라 etype 2/22의 `chargeCd` 소비가 사라지고, 비유한 좌표·`safePt` 실패는 **난수를 하나도 쓰기 전에** null을 돌려준다(소비 0). `safePt`는 시작점을 `canMv`로 한 번 더 검사하므로 `mkEn`에서의 `canMv` 호출과 합쳐 같은 점이 두 번 검사된다(oracle이 호출 목록을 대조).

(값 쪽 주의: `~~`는 2^32 래핑 — etype 92 `_mrAbsorbMax`는 HP 2e11급에서 2^32로 래핑된 1965606065가 되는 케이스를 대조, `Math.round`는 반올림 올림 방식 — 대조 케이스 포함.)

## 5. 제외(표현 전용)·미이식·가정

| 항목 | 처리 |
|---|---|
| GPU 텍스처 프리핀(`if((_useGPU||_useGL)&&_ESPRITES[etype]…)_getTex`, 31163) | **표현 전용 제외** — 필드를 만들지 않는 렌더 부작용 |
| `window._noProjEtypes` 전역 설정 | 전역 객체를 만들지 않고 정적 집합 `NoProjEtypes`로 대체(값 {5,9,11,20,24,50~59}는 전 etype 대조로 검증) |
| `_assignBossSkin` | 본문이 주석뿐 → 보스는 스킨 칸 5개가 없음(null) |
| `_applyMobSkin`·아틀라스 메타·`_skinSeqIdx` | 이식 안 함(렌더 자원). `_assignMobSkin`의 스폰 시 칸 계산(`_mob8Col/_mob8Row`)만 이식 |
| `_plvMul`·`_bossLvMul`·`hp`·`atk`·`po` 지역변수 | 웹에서도 객체에 쓰이지 않음(순수 계산) → 생략 |
| 입력 범위 밖 `si`/`etype` | 예외(웹은 NaN 객체) |
| 비 0 `DifficultyIndex` 범위 밖 | 웹과 같이 `dm=1`, 레벨 오프셋 0 |
| `PlayerLevel` 0/NaN | 웹 `(P.lv||1)`과 같이 1 |
| 부동소수 | 대조 케이스 538개 전체에서 `Math.Pow`·`Math.Cos/Sin`(safePt 링)이 V8 결과와 비트 단위로 같았다(.NET 8, Windows x64). 다른 플랫폼(IL2CPP/Mac)은 미확인 |

## 6. Codex `Simulation.SpawnNormalEnemy`(etype 0 축약)와 웹의 차이 — 10개

`Simulation.cs:62`는 수정하지 않았다. 연결 patch는 다음 단위.

| # | 차이 | 웹 `mkEn` | Codex 축약 |
|---|---|---|---|
| 1 | 막힌 좌표 | `safePt` 링 탐색으로 가까운 빈 곳으로 이동 | 막히면 `null` |
| 2 | 스테이지 난이도 오프셋 | `G._stageDiffOff` 를 `monLv`에 더함 | 없음 |
| 3 | 레벨 계산 | `(P.lv||1)+DIFF_LV_OFF[diff]+offset` | `Level+(diff-5)*100`(표 범위에서는 같은 값) |
| 4 | 엘리트 | `rollElite`(1회) + `rollMods` + `rollAura`, `hpMul/atkMul/scaleMul`·M02·`projCd` 보정 | 전부 없음(일반만) |
| 5 | 오프닝 치환 | si 0 비보스 etype 2/22/30/43 → 0 | etype 0 고정 |
| 6 | 난수 소비 | 일반 etype 0 기준 **9회** (엘리트 아님) | **5회**(speed, radius, st2, facing, projT) — 이후 값이 전부 밀림 |
| 7 | 수 저장형 | HP·ATK·모든 값 double | HP·ATK `int` 캐스트(HP가 2^31을 넘으면 오버플로 — 예: oracle `playerLevel 5000` 레어 케이스 HP 2.27e11) |
| 8 | 위치·타이머 저장형 | double | `float`(Speed·Radius·StateTicks·Facing·ProjectileTicks) — 비트 불일치 |
| 9 | 필드 | 341개 (`projCd`·`dropTier`·`eRes`·`col`·`el`·`room`·`_homeX/Y`·스킨 칸·etype별 타이머 등) | `EnemyState` 32개(이름이 다른 것 포함) |
| 10 | 보스·레어 | `ib`(24배 HP·ATK 75+2.9·monLv·반지름 22·보스 전용 필드)·레어 90~99·보스 피날레 분기 | 없음 |

## 7. 검사 결과 (standalone .NET 8 oracle, Unity 런타임 판정 아님)

oracle 케이스 538개(null 결과 7개 · 엘리트 티어 0/1/2/3 = 303/103/73/52 · M02 포함 4개): etype 0~99 전부(A) · 티어 강제(A2) · 명세 격자 etype×ib×레벨×난이도×오프셋 회전 커버(B, 레벨 1·10·100·500·501·1000·5000, 난이도 0·5·10·범위밖, 오프셋 0·37·-900) · 티어별 엘리트(C/C2) · 오프닝 치환(D) · 드루이드 피날레 참/거짓 8종(E) · `safePt` 이동/실패·비유한 좌표(F) · `el`/`room` 생략(G).
케이스마다 비교: null 여부, **모든 필드**(웹 이름으로 리플렉션, double은 비트 단위), `Random()` 호출 횟수, `canMv` 호출 목록(좌표·반지름 비트 단위), 그리고 CX-01 표 드리프트 가드.

| 항목 | 결과 |
|---|---|
| RED (`RedStub`: 위치만 복사하는 축약) | **181,718 검사 중 178,270 실패**(기대 실패) |
| **GREEN** (생성된 EnemySpawn.cs / EnemyFactory.cs) | **204,592 checks / 0 failures** (538 케이스) |
| 변이 검사(구현을 일부러 틀림, 23개) | **22개 사망**, 1개 생존 = 동치 변이(`si*5.882`는 si 0~34에서 .5로 끝나지 않아 `Math.Round`와 `JsRound` 결과가 같음) |
| 회귀: CX-01 enemy-tables-oracle | **2,784 checks / 0 failures** |
| 회귀: `unity/Tools/Tests/CoreTests.csproj` | 새 파일 포함 `Runtime/Core/*.cs` **컴파일 성공(경고·오류 0)**. `verify-core.cjs`는 `godot/source_snapshot/game.html`을 읽는데 main에서 `godot/`가 빠져(10-27 엔진 분리) **실행 불가**(기존 환경 문제, 이번 변경과 무관) |
| 실패 처리 | 처음부터 GREEN이라 재시도 없음 |

결과 파일: `E:/exoduser-wt/_out/pc-cx02/runs/{red,green}.{json,log}`, `mutation.json`, `reg-cx01.*`.

## 8. 재생성

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/export.cjs --source 'G:/exoduser/game.html'   # 원본 실행 → oracle.json
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/gen-cs.cjs                                    # oracle.json → EnemySpawn.cs / EnemyFactory.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label red
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run.cjs     --project 'E:/exoduser-wt/pc-unity-c01/unity' --label green
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-spawn-oracle/run-mutants.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity'
```

## 9. 열린 항목·다음 단계

- **연결**: `Simulation.SpawnNormalEnemy`는 이 팩토리를 쓰지 않는다. 연결(`EnemyState` 확장 또는 변환, float↔double 정책, 호출부 보스/레어/ib 경로)은 patch + PC_TO_MAC_INBOX(main·codex 두 곳)로 요청.
- **docs**: 이번 단위는 `mkEn` 값을 읽었을 뿐 docs 수치를 바꾸지 않았다. CX-01이 남긴 `몬스터_총관리.md`(RAW_R 13곳, RAW_COL[65]) 차이는 그대로(별도 지시 대기).
- **다음 단계 제안: CX-03 `updateE` 공통 처리** — 스폰된 객체가 매 프레임 거치는 공통 갱신(상태 s 전이, 넉백·스턴·포이즈 회복, eShield 재생, DOT 틱, 속도 보정). 보스 `_combatSt` 이후는 BX-02/03.
