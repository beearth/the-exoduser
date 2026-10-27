# CX-04b — 적 피격 처리 `hurtE` 중간부(HP 적용·onHit·경직·빙결 게이지·넉백·포이즈) Core + oracle (2026-10-27)

담당: 단순작업2(Sonnet, 보스전 총괄 전속). 명세: 보스전 총괄 `E:/exoduser-wt/_out/pc-cx04b/SPEC.md`. 마스터 보드 C01, 보스전 보드 CX-04b. 선행 CX-04a(브랜치 tip `dfe67be3b`).
범위: `hurtE`를 a/b/c로 자른 것 중 **b** — `// ═══ 데미지 → HP 직행 ═══` 줄부터 `  if(e.hp<=0){` 바로 앞 줄까지. HP 차감과 통계·5초 최고 피해·흡수 어픽스, onHit 상태이상, 즉시 반격 전환, 피해 글자·피 스플래시·피격 경직·섬광·히트스톱·임팩트, onHit DoT·lightChain·darkCurse·chainTarget, 냉기 빙결 게이지, 넉백, 포이즈(`_poiseHit`)와 그로기 폭발·충격파. 상태 값과 바깥 함수 호출 순서(난수 포함)만 옮긴다. `if(e.hp<=0){` 이후는 CX-04c.

## 1. 원본 (`git show fce195067:game.html`, sha256 `e096ab5c99310d9d…`, 65,767줄 — CX-04a와 같은 커밋본)

| 구간 | 줄 | sha256(앞 16자) |
|---|---|---|
| H2 `hurtE` 중간 | 42421~42567 (시작 앵커 줄 포함, 끝 앵커 `  if(e.hp<=0){` 42568) | 657a2b8a339e9f79 |
| 같이 실행한 원문 | `_poiseHit` 20037~20063, `_TXT_BUDGET` 25478 + CX-04a의 순수 함수·표(`elMul` `ar` `wp` `nc` `rg1` `rg2` `dst` `EL` `ELC` `ELP` `_UNDEAD_ET`) | |

시작 앵커(`// ═══ 데미지 → HP 직행 ═══`)는 정확히 1줄, 끝 앵커는 시작 뒤 첫 `  if(e.hp<=0){`. 범위 안 중괄호 깊이 0(균형)을 export가 검사한다. STY-D9은 이 범위 밖(CX-04c)이다.

## 2. 감싸개 원문 (원문에 덧붙인 텍스트는 이것뿐)

```js
function __H2(e,ang,noSound,opts,__h){let {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit}=__h;
  <원문 42421~42567줄 그대로>
return {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit,isBoss,finalKbM,_isRanged,_isMH,_isBB,_isMagicProj,_kbScale,_noKB};}
```

인계값 14개(CX-04a 반환): `dmg`, `atkEl`, `isDot`, `_shBlocked`, `kbM`, `psM`, `_isPure`, `_isArrow`, `_isGunpowder`, `_isMagicDmg`, `_cbAf`, `_cbPas`, `_isRageSk`, `_isCrit`. 추가 반환(범위 최상위 `const`, export가 추출): `isBoss`, `finalKbM`, `_isRanged`, `_isMH`, `_isBB`, `_isMagicProj`, `_kbScale`, `_noKB`. `try/finally`는 없다(`_shBufI` 증감은 H1 쪽 몫이고, 이 범위가 `shQuery`를 부를 때는 H1의 `try` 안에 있으므로 값이 증가한 상태로 기록된다). 조기 반환(`return`)은 이 범위에 없다.

## 3. 새/바뀐 파일 (`unity/Assets/Exoduser/Runtime/Core/` 평면, 각 .meta 포함)

| 파일 | 내용 |
|---|---|
| `EnemyHurt.Body.cs` **(신규)** | `EnemyHurt`를 `partial`로 바꾸고 새 파일에 `Body(...)`와 `PoiseHit(...)`를 둔다(CX-04a의 `EnemyHurt.cs`는 `partial` 키워드와 `HurtEnemy` 호출 3곳에 `, null`(atkEl 생략)만 바뀜) |
| `EnemyHurtContext.cs` | 전역·주입 추가: `StatDmgDealt/StatMaxHit`, `DmgPeak`, `DmgPeakShow`, `FlashCol/FlashT`, `NoHitStopT`, `HitStop`, `SlowMo`, `CamX/CamY/ViewW/ViewH`, `OptParts`, `DpsDmg`, `TxtPerFrame`, `ImpPerFrame`, `UqScCtx`, `UqS`, `CanMove`, `PoolPart`, `AddImpact`, `AddBoom`, `TickSkyCrusherRecharge`, `SfxGroggy`; `HurtEnemy`에 6번째 인자 `atkEl`(null=생략); 클래스 `EnemyDmgPeak`·`EnemyDmgPeakShow`·`EnemyUqScCtx`·`EnemyUqS`·`EnemyHurtBodyResult`; `EnemyHurtPlayer`에 `st`·`mst`·`s`; `EnemyHurtOpts`에 키 14개 |
| `EnemySpawn.Hurt.cs` | nullable 필드 7개: `burnPool`, `poisonPool`, `_shockMul`, `_iceDotT`, `_iceDotDmg`, `_freezeMax`, `_iceSlowed` |
| `unity/Tools/enemy-hurt-oracle/` | export · gen-cs · Program · csproj · run*.cjs · run-mutants · RedStub · oracle.json · README **확장**(새 폴더 아님) |
| `unity/Tools/verify-core.cjs` 등 | CX-04a 직후 커밋 `28a5ed940`에서 정리 완료(이번 변경 아님) |

`EnemyHurtOpts`에 추가된 키(14): `bladeShard maliceHunt iceBlade ltnChaser lightning detonate noImpact bladeOrb normalBow mhBlade blueBean noKB _lClubWall poiseHit` (기존 `maxDist`는 `double?`로 "undefined와 0 구분").

### API

```csharp
EnemyHurtHeadResult h = EnemyHurt.Head(ctx, e, dmg, ang, noSound, opts, atkEl);   // CX-04a
if (h != null) {
    EnemyHurtBodyResult b = EnemyHurt.Body(ctx, e, ang, noSound, opts, h);        // CX-04b: 14개 인계값 + 8개 지역값을 돌려줌
    // CX-04c: if(e.hp<=0){ ... } 부터 이어서
}
bool broke = EnemyHurt.PoiseHit(ctx, e, amt);                                      // 웹 _poiseHit(e, amt)
```

## 4. 주입 함수 표 (C#은 `EnemyHurtContext` delegate, oracle은 같은 이름의 기록용 스텁)

CX-04a 표(`_eqAffix` `_lEq` `_uEq` `statStr` `statCrit`… `shQuery` `addTxt` `addParts` `shake` `_T` …)와 같고, 이번에 더해진 것:

| 웹 이름 | C# delegate | 인자 | 반환/효과 규칙(oracle) |
|---|---|---|---|
| `hurtE` (재귀) | `HurtEnemy` | e,dmg,ang,noSound,opts[,atkEl] | 기록만. **6번째 인자는 호출이 줄 때만 기록**(lightChain=`EL.L`, chainTarget/staggerExplosion/충격파=`atkEl`, 벽 충돌=생략) |
| `poolPart` | `PoolPart` | x,y,vx,vy,col,sz,life[,tp,rot,grav] | 기록만 (인자 7개 또는 10개) |
| `_addImpact` | `AddImpact` | x,y,el,ang,type,isBoss,noFlash | 기록만 |
| `_addBoom` | `AddBoom` | x,y,r,dur,col | 기록만 |
| `canMv` | `CanMove` | x,y,r | 케이스 규칙 `open`/`blockAll` (기록) |
| `_tickSkyCrusherRecharge` | `TickSkyCrusherRecharge` | frames | 기록만 |
| `SFX.groggy` | `SfxGroggy` | | 기록만 |
| `_uqScCtx` / `_uqS` | `UqScCtx` / `UqS` | | 전역 객체(없을 수 있음 / 늘 있음) |

oracle 전체 기록: 주입 호출 58,439개 (parryLessonHurt 32, petOnAtk 1501, shQuery 1383, hitSfxForEtype 960, playSample 960, statStr 1400, eqAffix 36755, predBonus 1344, hunterMul 1344, statCrit 1344, addTxt 1203, hurtP 2, T 486, shake 433, doHitFlash 2, spawnBossProjectile 5, pDotPool 297, sfxBlock 26, lEq 2665, addParts 604, uEq 1309, statCritDmg 454, hurtE 160, meleeRef 56, pAtkMul 56, poolPart 3155, addImpact 309, addBoom 7, canMv 145, sfxGroggy 41, tickSkyCrusherRecharge 1).

## 5. 지역값 인계 표 (CX-04c로)

`Body`가 돌려주는 `EnemyHurtBodyResult`:

| 이름 | 타입 | 의미 |
|---|---|---|
| `dmg`, `atkEl` | double | CX-04a에서 받은 값 그대로(이 범위는 둘 다 바꾸지 않음) |
| `isDot` | `bool?` | `opts&&opts.dot`의 JS 3값(undefined/false/true) |
| `_shBlocked` | bool | 쉴드가 피해를 정확히 0으로 만든 경우(CX-04a에서 결정) |
| `kbM`, `psM` | double | 넉백/포이즈 배율 |
| `_isPure` | bool | |
| `_isArrow`, `_isGunpowder`, `_isMagicDmg` | `bool?` | 3값 |
| `_cbAf`, `_cbPas` | double | 약점노출 어픽스/패시브 값 |
| `_isRageSk`, `_isCrit` | bool | |
| **`isBoss`** | bool | `e.ib===true` |
| **`finalKbM`** | double | 보스 0.05, 아니면 `kbM` |
| **`_isRanged`** | bool | 빔/화살/석궁/붉은꽃/`atkEl==EL.L` — 넉백 제외 |
| **`_isMH`**, **`_isBB`**, **`_isMagicProj`**, **`_noKB`** | `bool?` | 악의사냥 / 푸른비 / 마법 투사체 / noKB (JS `opts&&…` 3값) |
| **`_kbScale`** | double | 마법 투사체 0.2, 아니면 1 |

CX-04c가 이어서 읽는 **전역·적 상태**(이 범위가 바꾼 것): 적 `hp`(음수 가능)·`_alerted`·`s`/`st2`(반격 전환)·`_hitFlash`·`_hitStun`·`burnT`/`burnPool`/`poison*`/`bleed*`/`stunned`/`_frozen`/`_freezeGauge`/`_freezeMax`/`_cursed`/`_shockT`/`_shockMul`/`_iceDot*`/`kb`/`x`·`y`(화면 밖 즉시 이동)/`poise`·`poiseR`·`_maxStunned`·`_pImmune`; 플레이어 `P.hp`·`mp`·`st`; 전역 `G._sStats`·`_dmgPeak`·`_dmgPeakShow`·`_flashCol`·`_flashT`·`hitStop`·`slowMo`·`_dpsDmg`·`_txtPerFrame`·`_uqScCtx._uqRef`·`_uqS.poiseOrbT`.

## 6. 난수 소비 지점

| 위치 | 조건 | 소비 |
|---|---|---|
| onHit 상태이상 8종 | 각 어픽스 값 >0 이고 비DOT (**값이 0이면 안 뽑음**, 단락 평가) | 어픽스마다 1회, 순서: fire → ice → light → dark → poison → bleed → stun → freeze |
| 회전참 피 | `P.s=="whirlwind"`·`!detonate`·`ang`·`OPT.parts>=40` | 파티클당 **8회**(각도, 속도, x, y, vy, 색, 크기, 수명 순), 개수는 `min(4, ~~(1+dmg*.01)*parts/100)`를 **실수 그대로** `bi<bN`으로 비교 |
| 일반 피 스플래시 | `!quiet && !overBudget && ang` | 파티클당 **8회**, 개수 `min(12, ~~(2+dmg*.04)*parts/100)` |
| darkCurse | 비DOT, 어픽스 >0 | 1회 |
| `_poiseHit` 그로기 | 포이즈가 0 이하가 될 때만 | 14회(파티클 크기) |

### 난수·넉백·텍스트 예산에서 주의할 곳 3개
1. **피 스플래시 루프 횟수는 소수 비교다.** `bN=min(12,~~(2+dmg*.04)*parts/100)`가 2.5처럼 실수일 수 있고 루프는 `bi<bN`이라 3번 돈다. 한 번 돌 때마다 난수 8개를 정해진 순서(`_ba`, `_bs`, x, y, vy, 색, 크기, 수명)로 쓰므로 `OPT.parts`나 `dmg`가 달라지면 이후 수열이 전부 밀린다. `poolPart` 인자의 평가 순서(좌→우)도 그대로다.
2. **`_overBudget`은 else 블록의 지역 const다.** `_txtPerFrame++`는 quiet 옵션이어도 매번 오르고(회전참 분기에서는 안 오름), `if(!_quiet&&!_overBudget)` 안에서는 `_overBudget`이 늘 false라 `Math.min(…,_overBudget?0:8)`은 늘 8, `if(!_overBudget)`는 늘 참이다(죽은 논리, 웹 그대로).
3. **재귀 호출은 기록만 하고 인자 모양이 제각각이다.** 벽 충돌(`_lClubWall`)은 `ang`·`atkEl`을 생략, lightChain은 `atkEl=EL.L`, chainTarget·그로기 폭발·충격파는 `atkEl` 전달, 충격파만 `Math.atan2` 각도를 쓴다(`JsMath`). 같은 적에게 다시 들어가는 `_lClubWall` 재귀는 `opts._lClubWall`로 막히지만 이번 oracle은 호출 기록만 본다(§8).

## 7. 조기 반환

이 범위에는 `return`이 없다. `Body`는 늘 끝까지 가서 `EnemyHurtBodyResult`를 돌려준다(`dmg<=0`이면 `if(dmg > 0){…}`만 건너뛰고 넉백·포이즈 구간은 그대로 실행).

## 8. 미이식·한계

| 항목 | 처리 |
|---|---|
| `if(e.hp<=0){` 이후 사망 처리 | CX-04c |
| 장비·어픽스·전설·패시브 조회, 글자·파티클·임팩트·소리·섬광 | 주입(표현 전용, 호출 기록만 대조) |
| 같은 적에게 다시 들어가는 재귀(`_lClubWall` 벽 충돌 `hurtE(e,…)`) | **기록만**. 함수 전체를 통째로 돌리는 통합 oracle은 CX-04c에서 만든다 |
| 다른 적에게 가는 `hurtE`(lightChain·chainTarget·그로기 폭발·충격파) | 기록만 |
| `_uqScCtx`/`_uqS`가 undefined일 때 `_uqS.poiseOrbT=300` TypeError | 웹은 던짐, C#은 `NullReferenceException`(게임에서는 `_uqS`가 늘 있음; oracle은 늘 정의) |

## 9. Codex `Simulation.ApplyEnemyDamage`(HP 적용~포이즈)와 웹의 차이 — 10개 (수정은 하지 않음)

| # | 차이 | 웹 H2 | Codex |
|---|---|---|---|
| 1 | 통계 | `_sStats.dmgDealt/maxHit`, 5초 최고 피해, `_dpsDmg`, 최고 피해 표시 | `TotalDamage`/`LastHitDamage` 만 |
| 2 | 흡수·onHit | lifeLeech/manaLeech/stLeech/lifeOnHit/유니크 도끼 흡수, onHit 상태이상 8종, onHit DoT·lightChain·darkCurse·chainTarget | 없음 |
| 3 | 반격 전환 | recover→idle(st2 0), idle이고 st2>5면 5 — **비DOT·비보스만** | recover→idle, idle이고 StateTicks>5면 5 (DOT·보스 구분 없음) |
| 4 | 피격 경직 | 일반 idle 8프레임, 엘리트 4, 보스 0, 예산 안일 때만 | idle이면 항상 8 (엘리트/보스 구분 없음) |
| 5 | 표현 | 피 스플래시(난수 8개/입자)·히트스톱·섬광·임팩트·텍스트 예산 | 없음 (`HurtTicks=6`만) |
| 6 | 빙결 게이지 | `atkEl==2` 누적, 보스 30%·최대 500, 저항 디버프 | 없음 |
| 7 | 넉백 | 원거리/악의사냥/푸른비/noKB 제외, 마법 ×0.2, 보스 0.05, 전설 둔기, 화면 밖 즉시 이동 | `min(dmg*.25*배율, 15*배율)`만 (float) |
| 8 | 포이즈 | `poiseHit`·`~~(dmg*psM)`·보스 저항 0.2/0.5·staggerBns·보스 면역 | `poiseHit && damage>0`이면 `Poise -= damage` |
| 9 | 그로기 | 일반 180/보스 90 스턴, `_maxStunned`, 보스 면역 300, 슬로모션, 유니크 훅, 폭발·충격파 | 스턴 180만 (`MaxStunned`) |
| 10 | 형식 | double, `~~` 래핑, V8 삼각함수 | int/float, .NET 삼각함수 |

## 10. 검사 결과 (standalone .NET 8 oracle, Unity 런타임 판정 아님)

oracle 케이스 2,378개 = H1 960(CX-04a) + **H2 746**(격자 246 + 시드 무작위 500) + **연결 672**(H1 케이스 960개 중 조기 반환 288개를 뺀 실제 반환값 이어 붙임). H2 격자: HP·통계·5초 최고 피해 경계, 흡수 4종(상한·injuredLeech 35% 경계·유니크 도끼), onHit 8종 × 롤 경계(0.4999999/0.5/0.5000001)·빙결 도달·immune, 반격 전환 9상태, 피해 글자·quiet 옵션 7종, 회전참 피(`parts` 0/39/40/100·`detonate`·`ang` 없음), 피 스플래시(개수 상한 12·`parts`·예산 10~13), 피격 경직 4종, 히트스톱·섬광(`noHitStopT`·`impPerFrame` 0/3/4/12/13), 임팩트(마법·noImpact·explode·보스), onHit DoT(스택 0/8/9/10·iceDot 보스/예산)·lightChain(이웃 0~3·사망·반경 120/121)·darkCurse 경계·chainTarget, 냉기 빙결 게이지(보스 500·30%·저항·정확 도달/직전·예산), 넉백(플래그 12종·lightning·DOT·보스·상한 15·kbM 0/2·전설 둔기 7종·화면 안/밖 ±300 경계·`canMv`), 포이즈(없음/있음/DOT/보스 면역/보스 저항/staggerBns/psM/경계 99.5~101/그로기 후 폭발·망치·철퇴·`_uqScCtx` 3종·훅·슬로모션).

| 항목 | 결과 |
|---|---|
| RED (`RedStub`: 아무것도 안 하는 `Head`/`Body`) | **2,277,598 검사 중 40,193 실패**(기대 실패) |
| 첫 GREEN | 2,434,087 중 34 실패 — 전부 `P.st`가 없는 플레이어에 `stLeech`를 쓸 때의 `NaN`(JSON에서 null) 비교 규칙 문제(구현 값 불일치 0) → 비교기에서 "기대 null이면 null 또는 NaN 통과"로 정리 |
| **GREEN** | **2,437,201 checks / 0 failures** (2,378 케이스) — **H1(기존) 961,797** · **H2 788,051** · **연결 687,201** · 표 149 · 요약 3 |
| 변이 검사(구현을 일부러 틀림; CX-04b 새 코드 132개) | 1차 127개 사망 · 5개 생존 → 케이스 보강 후 그 5개만 재실행 → 최종 **131개 사망, 생존 1개** = 『poiseHit boss immune check dropped』(Body 바깥의 !(isBoss && _pImmune>0) 조건이 같은 검사를 이미 하므로 Body 경로로는 도달 불가(PoiseHit만 따로 부를 때만 다름)) |
| 회귀 CX-01 enemy-tables-oracle | **2784 checks / 0 failures** |
| 회귀 CX-02 enemy-spawn-oracle | **204592 checks / 0 failures (538 cases)** |
| 회귀 CX-03a enemy-tick-oracle | **3246746 checks / 0 failures (1240 cases)** |
| 회귀 verify-core.cjs (이 worktree) · CoreTests 컴파일 | **36 checks / 0 failures** |
| 실행 전후 사용자 PATH | 변화 없음(읽기만): len=938 entries=25 dotnetEntries=2 (실행 전 len=938 entries=25 dotnetEntries=2) |

결과 파일: `E:/exoduser-wt/_out/pc-cx04b/runs/`.

## 11. 열린 항목·다음 단계

- **연결**: `Simulation.ApplyEnemyDamage`는 이 포트를 쓰지 않는다. 연결은 CX-04 세 단위 뒤 patch + PC_TO_MAC_INBOX(main·`unity/main` 두 곳).
- **CX-04c 착수에 필요한 것**: ① `Body`가 돌려준 값(`isBoss`, `dmg` 등)과 §5의 적·전역 상태를 입력으로 `if(e.hp<=0){`~함수 끝(`}finally{_shBufI--}` 포함)을 옮긴다 — **STY-D9(fce195067)** 구간 포함 ② **함수 전체 통합 oracle**(H1→H2→H3를 한 번에, `_lClubWall` 재귀 같은 같은 적 재진입 포함)을 만든다 ③ 사망 처리에서 쓰는 주입 대상(디코이·도플갱어·부활·On-Kill·장별 사망 효과, `addExp`·`rollDrop` 류) 목록 확정 ④ `EnemyHurtOpts`·`EnemySpawn` partial에 3c가 읽는 키/필드 추가 ⑤ `_uqS`/`_uqScCtx`는 3c의 일부 훅과 공유될 수 있음.
- **미확인**: `JsMath`·`Math.Pow` 비트 일치는 .NET 8 Windows에서만 확인(Mac·IL2CPP는 상태 3 인수 때).
- **docs**: 이번 단위는 웹 값을 읽었을 뿐 docs 수치를 바꾸지 않았다.
