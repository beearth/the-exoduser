# CX-04c1 — 적 피격 처리 `hurtE` 사망부 앞쪽(디코이·도플갱어·보스 부활·일반몹 부활·On-Kill·STY-D9 침강·사망 표현·콤보·문지기) Core + oracle (2026-10-27)

담당: 단순작업2(Sonnet, 보스전 총괄 전속). 명세: 보스전 총괄 `E:/exoduser-wt/_out/pc-cx04c1/SPEC.md`. 마스터 보드 C01, 보스전 보드 CX-04c1(BX-05 보스 부활·BX-08 보스 사망/STY-D9의 상태 부분). 선행 CX-04b 조건부 인수(`c03388fb1`) + §0.1 비교 규칙 보완 커밋 `b4b00507e`.
범위: `hurtE`의 `  if(e.hp<=0){` 줄부터 `    // ═══ 지옥의 잔해 드롭 ═══` 바로 앞 줄까지(fce195067 42568~42817, 250줄). 뒤쪽(잔해 드롭~`}finally{_shBufI--}`)과 함수 전체 통합 oracle은 CX-04c2.
**standalone .NET 8 oracle 결과이며 Unity 런타임·게임 전체 판정이 아니다.** `Simulation`에는 연결하지 않았다.

## 1. 원본 (`git show fce195067:game.html`, sha256 `e096ab5c99310d9d…`, 65,767줄 — CX-04a·b와 같은 커밋본)

| 구간 | 줄 | sha256(앞 16자) |
|---|---|---|
| H3a `hurtE` 사망부 앞쪽 | 42568~42817 (시작 앵커 `  if(e.hp<=0){` = H2의 끝 앵커, 끝 앵커 `    // ═══ 지옥의 잔해 드롭 ═══` 42818) | c7529c5ac6ff3f06 |
| 같이 실행한 원문 | `_HS` 8674, `_diffSigned` 9280, `_isSi0DruidSink` 10902, `_druidSinkStart` 10903, `_r` 12525, `_isDruidFinale` 17119, `_druidFinaleReviveChance` 17128, `_eMouthXY` 20122, `safePt` 31782, **`mkEn`**(CX-02 원문) + CX-04a·b의 순수 함수·표 | |

두 앵커 모두 정확히 1줄과 일치해야 하고, 범위의 중괄호 깊이는 1(열린 `if`)이어야 한다 — export가 검사한다.

## 2. 감싸개 원문 (원문에 덧붙인 텍스트는 이것뿐)

```js
function __H3a(e,ang,noSound,opts,__h){let {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit,isBoss,finalKbM,_isRanged,_isMH,_isBB,_isMagicProj,_kbScale,_noKB}=__h;
  <원문 42568~42817줄 그대로>
return {__cont:true,_isBurnDeath,_isWhirlKill,_sinkDruid,_killAng};}return {__cont:false};}
```

원문의 `return;`은 `undefined`(조기 반환 3곳), `if(e.hp<=0)`가 거짓이면 `{__cont:false}`, 끝까지 가면 `{__cont:true,…}`. 블록 최상위 지역값은 `_isBurnDeath,_isWhirlKill,_sinkDruid,_killAng` 4개(export가 중괄호 깊이로 추출).

## 3. 새/바뀐 파일 (`unity/Assets/Exoduser/Runtime/Core/` 평면, 각 .meta 포함)

| 파일 | 내용 |
|---|---|
| `EnemyHurt.Death.cs` **(신규)** | `EnemyHurt.DeathHead(...)` + 보조 `IsDruidFinale`·`DruidFinaleReviveChance`·`IsSi0DruidSink`·`HellOfStage`·`HolyPrisonBonus`·`SafePt`·`Rnd`(= `_r`) |
| `EnemyHurtContext.Death.cs` **(신규)** | `EnemyHurtContext`를 `partial`로 열어 사망부 전역·주입 delegate 추가, 개체 클래스(`EnemyFireZone`·`EnemySpawnHole`·`EnemyDruidSink`·`EnemyDeathSnd`·`EnemyUqZone`·`EnemyFzCtx`·`EnemyPProj`·`EnemyBossShot`·`EnemyReviveVfxOpts`·`EnemyHurtPMeta`), `DeathExit` 열거, `EnemyHurtDeathResult` |
| `EnemyHurtContext.cs` | `partial` 키워드; `EnemyHurtPlayer`에 `lv facing rage shield mshield _okSpdBuff _okSpdMul kb`; `EnemyHurtOpts._blastKill`; `EnemyUqS`에 `gwRefund csEchoUsed` |
| `EnemySpawn.Hurt.cs` | nullable 필드 추가: `_isDecoy _revived _reviveAsGhoul _bossRevJudged _bossRevived _druidTargetLocked _sinkDruid _corpseSpawned _isGateGuard`(bool?) · `_reviveX _reviveY _bossRevChance _bossRevRoll _druidAct _druidStep _druidRest _uqGwExp _fromHole`(double?) · `_fmKind`(string) |
| `unity/Tools/enemy-hurt-oracle/` | export(H3a 감싸개·스텁·케이스·chain3) · Program(H3/CH3 대조) · csproj · RedStub · run-mutants(`--file D`) · `death-mutants.cjs`(변이 486개) · `make-h3-oracle.cjs` · README · oracle.json 확장(새 폴더 아님) |

Codex 소유 파일 수정 0. `EnemyHurt.cs`·`EnemyHurt.Body.cs` 본문은 그대로.

### API

```csharp
EnemyHurtHeadResult h = EnemyHurt.Head(ctx, e, dmg, ang, noSound, opts, atkEl);          // CX-04a
EnemyHurtBodyResult b = EnemyHurt.Body(ctx, e, ang, noSound, opts, h);                    // CX-04b
EnemyHurtDeathResult d = EnemyHurt.DeathHead(ctx, e, ang, noSound, opts, b, out DeathExit exit);  // CX-04c1
// exit: NotDead(HP>0, d.__cont=false) · Decoy · Doppelganger · BossRevive (d == null: 웹의 return;) · Continue (d.__cont=true → CX-04c2로 이어짐)
```

## 4. 조기 반환 지점 (웹 `return;` 3곳 + HP 거짓)

| id | 조건 | 일어나는 일 | 난수 | 웹 줄(fce195067) |
|---|---|---|---|---|
| NotDead | `!(e.hp<=0)`(NaN 포함) | 아무것도 안 함, `{__cont:false}` | 0 | 42568 |
| Decoy | `e._isDecoy` | 티켓 해제·`alive=false`·`kills++`·`_stageKills`·`_regKill`·`_petOnKill`·입자 15·`환영 소멸!`·`shake(3)` | 0 | 42570~42573 |
| Doppelganger | `etype===87 && !_dgRevived` | `_dgRevived=true`, `hp=~~(mhp*.5)`, 쉴드 0, `alive=true`, `s='idle'`, `st2=30`, `stunned=0`, `_reviveVFX(…,'부활!',{partN:16,partSpd:5,shake:10,vfxSize:140,flash:3})` | 0 | 42575~42578 |
| BossRevive | `e.ib` 이고 확률·포인트 판정 통과(`_doRevive`) | 풀피 부활·크기 축소·순간이동·충격파·(2차부터)분노 폭발·(10%)동반부활 — 아래 §5 | 3 + 72 (+동반부활 4 + mkEn) | 42583~42690 |

디코이는 도플갱어·보스 검사보다 먼저 본다(`_isDecoy`이고 `etype 87`인 경우 디코이로 끝). 보스 `etype 87`이면 도플갱어 경로가 보스 부활보다 먼저다(케이스로 확인).

## 5. 보스 부활 판정 순서 + 난수 소비 위치

| 순서 | 내용 | 수치(웹 원문 그대로) | 난수 |
|---|---|---|---|
| 1 | `e.deaths=(e.deaths||0)+1`; 피날레 드루이드면 `G._druidFinaleBoss=e` | `_isDruidFinale`=`_DEMO_MODE && stage===_DEMO_LAST_STAGE && stage===3 && ib` | |
| 2 | 지옥 단계 `_bHell=STG[stage].hell`(범위 밖 0), `_isH7=_bHell===6` | | |
| 3 | 신성력 억제 `_bSuppress=_eqAffix('antiRevive')` + holyPrison 존 안이면 `+.15+((lv\|\|1)-1)*(.15/9)`(첫 존에서 break) | 15%~30% | |
| 4 | 부활력 소모 `_revCost=10` → 억제>0이면 `+~~min(5,억제*10+2)` → 존 안 `+3` → 플레이어 풀피(`P.hp>=P.mhp`) `+2`; `_revPts=max(0,(_revPts\|\|0)-_revCost)` | 10 / +2~5 / +3 / +2 | |
| 5 | 확률 `_revCh=max(0, 2.00+stage*.05-(deaths-1)*.15-억제)` | 200%+스테이지당 5%−(n−1)×15%−억제 | |
| 6 | **판정**: `!피날레 && _revPts>0 && Math.random()<_revCh` | | **난수 ①(조건 만족 때만 1회)** |
| 7 | 문구 4분기(부활 성공 / `부활력 고갈!`(si0 드루이드는 숨김) / 피날레 `마지막 저항 판정` / 억제 `신성력 억제! (%)` / `부활 실패 (%)`(si0 + 이미 판정됨이면 숨김)) | `_revPct=~~(…*100)` | |
| 8 | **부활 성공 시**: `hp=mhp`, 쉴드 0, `_bossPhase=0`, `s='recover'`, `st2=90`, `stunned=0`, `_bossRevJudged=true`, 콤보/페인트/지연 초기화, `maxPoise=~~(×1.5)`, `poise=~~(maxPoise*.25)`, `reviveIframes=90`, `atk=~~(atk*(H7?2:1.5))`, `speed=min(speed*1.25, H7?2.0:1.6)`, `bossPatCd=max(H7?20:60, bossPatCd-30)` | | |
| 9 | 크기 축소 `_origR` 보존, `scale=max(.40,(_revPts\|\|0)/max(1,_maxRevPts\|\|150))`, `r=max(10,~~(_origR*scale))`, `▼ n%` | | |
| 10 | 순간이동: 구 위치 포탈·번개빛 → `tpAng=P.facing+π+((random−.5)*.8)`, `tpDist=80+deaths*20`; `canMv(목표,e.r)`이면 이동, 아니면 `safePt(P+cos*50, P+sin*50, e.r)`; 새 위치 포탈·`_addTpBolt`·`🔥부활!`; `_tpWarn*=0`, `_spawnT=55`, `_bossReviveVFXPending=40` | | **난수 ②(tpAng 1)** |
| 11 | `playSample('boss_revive',1.0,_r(1.0,.08))` | | **난수 ③(피치 1)** |
| 12 | 충격파: `waveR=100+deaths*30`, `waveDmg=~~(atk*(.5+deaths*.15))`, 거리<waveR && `P.iframes<=0` && `P.s!=='charge'`이면 `hurtP(waveDmg,{dtype:'magic'})`, `P.kb += cos/sin*12`, `🌊충격파!` | | |
| 13 | 입자 36개(각각 크기·수명에 난수 2) | | **난수 ④(72)** |
| 14 | `deaths>=2`: `bCnt=8+deaths*4`개 분노 투사체(짝수 인덱스 빨간 콩·호밍) + `💀 분노 폭발!` | 데미지 `~~(atk*(빨강 .8 / 그 외 .6))`, 속도 3, 수명 600, 크기 2.0/1.8 | |
| 15 | 10% 동반부활: `_killedBosses` 비어 있지 않고 `Math.random()<0.1`이면 자기 etype 뺀 목록에서 무작위 1마리 | | **난수 ⑤(10% 1, 목록이 비면 거기서 끝)** → 인덱스 1 · 각도 1 · 거리 1 → `mkEn` |
| 16 | `mkEn(x,y,G.stage,0,true,_cet,0)` → `mhp=~~(e.mhp*.4)`, `hp=mhp`, `atk=~~(e.atk*.5)`, `deaths=0`, `ens.push`, `👻 동반부활!` | | CX-02 `mkEn`이 쓰는 만큼 |
| 17 | 텍스트(`N차 부활! (×2^N)`, `HP mhp`), **return** | | |
| — | **실패 시**(`return` 하지 않고 아래로): 일반몹 부활 블록은 `!e.ib`라서 건너뜀 → 판정 블록 `if(e.ib && !_bossRevJudged)`: `_bossRevJudged=true`, `_reviveTimer=180`, `_reviveX/Y`, `_rv2Base=1.50+stage*.05`, 억제·존 합산, `_revPts<=0`이면 `chance=0, roll=1`, 아니면 `chance=피날레?…:max(0,_rv2Base-deaths*.25-억제)`, **`_bossRevRoll=Math.random()`**, `_bossRevived=true` | | **난수 ⑥(포인트가 남았을 때만 1)** |

일반몹: 사망 시 `!ib && !_revived && !_isGhoul`이면 `revPow=(elite>0?(elite>=2?.6:.5):.5)+~~((lv||1)/100)*0.10`, 억제 합산, `finalRev=max(0,revPow-억제)`; `finalRev>0 && random<finalRev`이면 `_revived`·`_reviveTimer=elite>0?120:90`·`_reviveX/Y`, **`_reviveAsGhoul=random<0.5`**(난수 2회), 실패인데 억제>0이면 `✟ 신성력 억제!`.
이후(보스·일반 공통, 부활 못 한 경우) 처치 표현 난수: 버스트루프 사망음 `_r`(1) · 빔 화염 사망 선택(1)+`_r`(1) · 고어(`<.8` 1 + 인덱스 1 + 큰 몹이면 `<.5` 1) · 문지기 입자 30×3(90).

## 6. 주입 함수 표 (C#은 `EnemyHurtContext` delegate, oracle은 같은 이름의 기록용 스텁)

| 웹 | C# | oracle |
|---|---|---|
| `atkTicketRelease`·`_regKill`·`_petOnKill` | `AtkTicketRelease`·`RegKill`·`PetOnKill` | 기록 |
| `_reviveVFX`(안에서 `addTxt`·`poolPart`·난수를 쓰지만 이 단위에선 호출 사실과 인자만 비교) | `ReviveVfx` + `EnemyReviveVfxOpts` | 기록 |
| `playVFXAng`·`_addBlastLight`·`_addTpBolt` | `PlayVfxAng`·`AddBlastLight`·`AddTpBolt` | 기록 |
| `deathFX`(마지막 인자 `'druid_sink'`/undefined, 6번째 인자는 `_isBurnDeath` 3상태 그대로) | `DeathFx` | 기록 |
| `_spawnLargeMonsterDeathFx`·`_addCorpse`·`_addBurnCorpse`·`_addGorePiece`·`_addDeathImpact` | 각 delegate | 기록 |
| `_getPProj` | `GetPProj`(새 `EnemyPProj`) | 빈 객체 |
| `_L(ko,en)`·`_T` | `Lang`·`Translate`(웹 한국어 문구 그대로 반환) | 기록 |
| `_rageMax`·`buildMapCache`·`SFX.victory` | `RageMax`·`BuildMapCache`·`SfxVictory` | 기록 |
| `hurtP(dmg,{dtype})` | `HurtPlayerTyped` | 인자 전부 기록 |
| `_spawnBossProjectile(e,{…13키})` | `SpawnBossShot` + `EnemyBossShot`(키 전부, `redBean`/`homing`은 true 또는 undefined) | 기록 |
| `shQuery`·`hurtE`(재귀)·`addTxt`·`addParts`·`shake`·`poolPart`·`canMv`·`playSample`·`_eqAffix`·`_lEq`·`_uEq` | 기존 delegate | 기존 스텁 |
| **`mkEn`** | `MkEn` → CX-02 `EnemyFactory.Create` 그대로 호출 | **CX-02 원문 실행(기록만 덧붙임)** |

### 판정: `mkEn`은 주입이 아니라 원문 실행 ↔ 포트 호출
동반부활 케이스는 JS에서 `mkEn` 원문을, C#에서 `EnemyFactory.Create`를 그대로 불러 **새로 생긴 적의 모든 필드와 `canMv`·난수 소비까지** 대조한다(19마리, 전부 일치). 주입(기록만)으로 두면 "무엇이 생겼는지"를 검사할 수 없어서 원문 실행으로 했다.
순수 함수 판정: `_diffSigned`(전역 `OPT.diff`만 읽음)·`_isSi0DruidSink`·`_druidSinkStart`(`G._druidSink`만 씀)·`_druidFinaleReviveChance`·`_isDruidFinale`·`_eMouthXY`·`_r`(난수 1회)·`safePt`는 부수효과가 호출 인자/표시 상태뿐이라 **원문 실행**.

## 7. STY-D9(1-1 드루이드 침강) 웹 문서 `2_5 부활+에너지쉴드시스템` 2026-10-27 절과 대조

| 문서 항목 | 이 포트 | 일치 |
|---|---|---|
| 대상 `e.ib && !e._fmKind && G.stage===0 && !_isDruidFinale(e)` | `IsSi0DruidSink` | ✓ (피날레는 stage 3이라 stage 0 조건과 겹치지 않는다 — 변이 『finale exclusion dropped』는 동치) |
| 마지막 사망 `!(e._reviveTimer>0 && e._bossRevived && (e._bossRevRoll??1)<(e._bossRevChance\|\|0))` | `sinkDruid` | ✓ (`??`·`\|\|` 경계 변이 전부 사망) |
| 처치 순간 끈 것: 대형 사망 FX·시체(+`e._corpseSpawned=true`)·불탄 시체·고어·사망 임팩트 | `!sinkDruid` 가드, `_druidSinkStart`가 `e._sinkDruid`·`e._corpseSpawned`·`G._druidSink={x,y,r,t:0}` | ✓ |
| `deathFX`에 `'druid_sink'` | 일반 분기·버스트루프 분기 둘 다 | ✓ |
| 숨긴 문구: `부활력 고갈!`·`0/N`, `부활 실패 (xx%)`(이미 판정된 최종 사망), `💀 부활 판정 중...` | 해당 분기에서 숨김; 판정 중 문구 자리는 섬광(`_flashT=3`, `#ff4400`)만 | ✓ |
| 부활 성공 분기·비최종 사망 문구 그대로 | ✓ (si1~si3, `_fmKind` 있는 보스는 변화 없음) | ✓ |
| 문서의 "처치 즉시 `☠ 완전 사망!` else 분기(G42803)" | **도달 불가**: 사망부에서 `e.ib`이면 판정 블록이나 부활 성공이 먼저 `_bossRevJudged=true`로 만들기 때문에 `else if(e.ib&&e._bossRevJudged)`가 항상 먼저 걸린다. 이 포트는 웹 그대로 두 분기를 모두 옮겼고, 세 번째 분기(`완전 사망!`·`_flashT=6`·`_chromaT=5`)는 어떤 케이스로도 실행되지 않는다(웹과 같음) | 차이 기록 |
| 그대로 둔 것 `shake(8)`·`boss_final_death`·사망 음성 | 이 범위 밖(잔해 드롭 이후/`updateE`) | CX-04c2·사운드 |

보스전 총괄 원 명세와 웹 문서의 차이(판정 중 문구 숨김)는 문서가 채택한 대로 구현돼 있고 이 포트는 웹 코드 그대로다.

## 8. CX-04c2로 넘기는 지역값

`DeathHead`가 `Continue`로 끝나면 돌려주는 값:

| 값 | 의미 | 쓰임(잔해 드롭 이후) |
|---|---|---|
| `_isBurnDeath` | `(atkEl===EL.F\|\|opts.beam)&&!opts.explode`, **JS 3상태**(`undefined`/`false`/`true`) → `bool?` | 불탄 사망 분기 |
| `_isWhirlKill` | `P.s==='whirlwind' && !opts.detonate` | 회전참 처치 분기 |
| `_sinkDruid` | STY-D9 침강 여부 | 시체·잔해 생략 |
| `_killAng` | `ang!==undefined ? ang : atan2(e.y-P.y,e.x-P.x)` | 시체/고어 방향 |

그 밖에 CX-04c2가 알아야 할 상태: 이 단위에서 이미 `e.alive=false`, `G.kills++`, `G._stageKills++`, `G.combo`/`comboTimer`/`comboMax`, `hitStop`, `spawnHoles`, 문지기 해방(`_gateGuard=null`, `_gateGuardKilled`, `bossGateOpen`, `_shDirty`, `buildMapCache`)이 처리됐다. 입력으로는 CX-04b `Body`의 22개 값 중 `dmg`·`atkEl`과 `opts`·`ang`을 다시 쓴다.

## 9. 미이식·한계·웹에서 발견한 점 (수정하지 않음)

- **동반부활 `mkEn` 인자 순서**: 웹은 `mkEn(x,y,G.stage,0,true,_cet,0)` — 시그니처가 `mkEn(x,y,si,etype,ib,el,room)`이라 **`_cet`(이전에 처치한 보스 etype)이 etype이 아니라 `el`(속성) 자리로 간다**. etype은 항상 0. 의도가 "그 보스를 되살린다"라면 웹 버그 가능성이 있다. 포트는 웹 그대로 옮겼다. 보스전 총괄 판단 필요.
- 도달 불가 분기 `☠ 완전 사망!`(§7).
- 피날레 드루이드(`_isDruidFinale`)는 `doRevive`가 항상 거짓이라 부활 성공 블록 안의 피날레 초기화(`_druidAct=-1` 등)는 실행되지 않는다(웹 데드코드). 포트에는 그대로 있고 변이 3개는 동치로 분류.
- `_reviveVFX`·`deathFX` 등 표현 함수 내부는 이식하지 않았다(호출 인자만 대조).
- `JsMath`·`Math.Pow` 비트 일치는 .NET 8 Windows에서만 확인.
- `Simulation` 연결은 하지 않았다(CX-04 세 단위 뒤 patch + INBOX).

## 10. 검사 결과 (standalone .NET 8 oracle, Unity 런타임 판정 아님)

oracle 케이스 3,866개 = H1 960 + H2 749 + 연결 672 + **H3 1,071**(직접 격자 571 + 시드 무작위 500) + **CH3 414**(CX-04b 연결 케이스를 H1→H2→H3a 실제 반환값으로 이어 붙임: 이미 죽은 것 162 + HP를 낮춰 사망부까지 가게 한 것 252). 반환 지점 분포: Continue 907 · BossRevive 225 · Decoy 105 · Doppelganger 57 · NotDead 191. 동반부활으로 생긴 적 19마리. 케이스는 spec §4 격자 전부(디코이·도플갱어·보스 부활 지옥 단계 0~6·`deaths`·점수 경계·억제 0~양수·존 안/밖·풀피·확률 경계·1차/2차·동반부활 경계·순간이동 `canMv` 5규칙·충격파 경계·피날레·si0 침강 조합·일반몹 부활·킬 보상·유니크/전설 On-Kill·사망 표현 3분기·콤보 상한·구멍·문지기)와 전수 NaN/undefined 경계. 비유한수 꼬리표(NaN) 351개가 기록·대조에 쓰였다.

| 항목 | 결과 |
|---|---|
| §0.1 보완 커밋 | `b4b00507e` — H1·H2·연결 재기록 GREEN 2,439,085 / 0 · NaN 꼬리표 36 · 변이 4/4 사망 |
| RED (`RedStub`: 아무것도 안 하는 `Head`/`Body`/`DeathHead`) | **3,824,456 검사 중 74,150 실패**(H3 19,149 · CH3 14,705 등, 기대 실패) |
| **GREEN** | **4,225,618 checks / 0 failures** (3,866 케이스) — 표 149 · H1 1,009,730 · H2 827,434 · 연결 719,084 · **H3 1,170,095** · **CH3 499,117** · 요약 9 |
| 변이 검사(`EnemyHurt.Death.cs` 새 코드) | **486개 중 474개 사망, 생존 12개 = 전부 동치(이유 아래)**. 1차 487개(동일 문자열 변이 1개 제거) 중 30개 생존·3개 미적용·1개 컴파일 오류 → 케이스 보강(`only2` 규칙·판정 블록 양수 확률·`_tpWarn` 값·정확히 1인 크기 비율·600 경계·0/0 시체 위력·난수 정렬 수정 등)과 변이 패턴 수정 후 20개 재실행 **전부 사망** |
| 회귀 CX-01 enemy-tables-oracle | **2784 checks / 0 failures** |
| 회귀 CX-02 enemy-spawn-oracle | **204592 checks / 0 failures (538 cases)** |
| 회귀 CX-03a enemy-tick-oracle | **3246746 checks / 0 failures (1240 cases)** |
| 회귀 verify-core.cjs (이 worktree) · CoreTests 컴파일 | **36 checks / 0 failures** |
| 사용자 PATH(읽기만) | 실행 전 len=938 entries=25 dotnetEntries=2 → 실행 후 동일 |

### 생존 변이 12개 — 동치 이유

| 변이 | 이유 |
|---|---|
| finale: boss check dropped | `IsDruidFinale` 호출부가 전부 `e.ib` 안(또는 `IsSi0DruidSink`의 `e.ib` 뒤)이라 결과 동일 |
| finale chance: points > 0 → >= 0 | 이 식이 쓰이는 곳은 `_revPts>0`일 때뿐(0이면 『부활력 고갈』 분기가 먼저) |
| sink: finale exclusion dropped | 침강은 stage 0, 피날레는 stage 3이라 겹치지 않음 |
| revive: finale act/target lock/step reset (3개) | 피날레는 `_doRevive`가 거짓이라 부활 블록의 피날레 초기화가 실행되지 않음(웹 데드코드) |
| revive: points default 0→1 in scale | 부활 성공은 `_revPts>0`일 때뿐이라 기본값이 쓰이지 않음 |
| anger: mouth radius default 12→13 | 부활 뒤 `e.r=max(10,…)`이라 `e.r\|\|12`의 기본값이 쓰이지 않음 |
| companion: deaths not reset | `mkEn`이 이미 `deaths=0` |
| mob revive: elite > 0 → >= 0 | `elite=0`이면 두 갈래 모두 `.5` |
| combo: percent suffix always | 콤보 ≥1000이면 보너스 ≥50%라 `cbPct==0`에 도달 불가 |
| hole: missing entry check | 목록에 null 항목이 없고 범위 검사가 앞서 있음 |

결과 파일: `E:/exoduser-wt/_out/pc-cx04c1/runs/`.

## 11. 보스 부활·STY-D9에서 주의할 곳 3개

1. **난수 위치가 조건부다**: 부활 판정 난수(①)는 `!피날레 && _revPts>0`일 때만, 판정 블록 난수(⑥)는 포인트가 남았을 때만 쓰인다. 조건을 단순화하면 이후 모든 난수(순간이동·입자 72·동반부활)가 한 칸씩 밀린다.
2. **`_isBurnDeath`는 3상태**: `deathFX`에 `undefined`/`false`/`true` 그대로 넘어간다(C# `bool?`). `bool`로 줄이면 호출 기록이 달라진다.
3. **STY-D9 침강은 "표시만" 바뀐다**: 판정·보상·`G.bossAlive` 흐름은 그대로이고 `e._sinkDruid`·`e._corpseSpawned`·`G._druidSink`·문구 생략만 다르다. `_reviveTimer>0 && _bossRevived && roll<chance`가 걸려 있으면 침강이 아니다(`??1`·`||0` 기본값 포함).

## 12. 열린 항목·다음 단계

- **CX-04c2 착수에 필요한 것**: ① 이 `DeathHead`의 `Continue` 반환값(§8)과 `Body` 값으로 `// ═══ 지옥의 잔해 드롭 ═══`~`}finally{_shBufI--}`를 옮긴다 ② **함수 전체 통합 oracle**(H1→H2→H3a→H3b, `_lClubWall`·같은 적 재진입 포함) ③ 동반부활로 늘어난 적과 유니크 폭발의 `hurtE` 재귀를 통합 oracle에서 실제로 부를지 결정.
- **docs**: 이번 단위는 웹 값을 읽었을 뿐 docs 수치를 바꾸지 않았다. `mkEn` 인자 순서 의심(§9)은 보스전 총괄 판단 후 웹 쪽 수정 여부 결정.
