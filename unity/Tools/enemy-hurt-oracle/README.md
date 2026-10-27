# 적 피격 처리 앞부분 원본 대조 (CX-04a oracle)

`Runtime/Core/EnemyHurt.cs`(+ `EnemyHurtContext.cs`, `EnemySpawn.Hurt.cs`, `EnemyHurtTables.cs`, `JsMath.cs`)를 **원본 game.html `hurtE`의 앞부분(함수 첫 줄 ~ `// ═══ 데미지 → HP 직행 ═══` 앞 줄)을 그대로 실행한 결과**와 대조한다. 보고서: `docs/engine/UNITY_CX04A_ENEMY_HURT_HEAD_20261027.md`.

```powershell
# 0) 원본 입력은 로컬 main의 커밋된 game.html (워킹트리의 미커밋 편집은 줄 번호가 달라진다)
git -C G:/exoduser show HEAD:game.html > <scratch>/game.html
# 1) 원본 실행 → oracle.json (Node VM; 케이스 입력·난수 수열·결과·주입 호출 기록)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-hurt-oracle/export.cjs --source <scratch>/game.html --head <커밋 sha>
# 2) 같은 oracle.json에서 표 생성 (EnemyHurtTables.cs)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-hurt-oracle/gen-cs.cjs
# 3) RED: 아무것도 하지 않는 EnemyHurt(RedStub) → 실패해야 함
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-hurt-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label red
# 4) GREEN: 실제 EnemyHurt.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-hurt-oracle/run.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label green
# 5) 변이 검사
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-hurt-oracle/run-mutants.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity'
```

러너는 unity/main 방식이다: `DOTNET_CLI_HOME=unity/Tools/.dotnet-home`(고정), `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`. 사용자 PATH·레지스트리를 건드리는 코드는 없다.

## 감싸개 (원문에 덧붙이는 텍스트는 이것뿐)

```js
function __H1(e,dmg,ang,noSound,opts,atkEl=0){      // 원문 첫 줄에서 함수 이름만 바꿈
  <원문 둘째 줄부터 `// ═══ 데미지 → HP 직행 ═══` 앞 줄까지 그대로>
return {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit};}finally{_shBufI--}}
```

- 반환 객체의 목록은 export가 원문에서 뽑는다: 범위 안 `try{` 직후의 **최상위(중괄호 깊이 0) `const`/`let`** 과 어디에 있든 **`var`** 이름 + 범위 안에서 다시 쓰는 매개변수 `dmg`, `atkEl`. (`_ksFC`, `_lDagForce`, `_elAx` 등은 안쪽 블록 지역이라 제외.)
- 원문 `return;`(조기 반환)은 `undefined`, 범위 끝까지 가면 위 객체가 나온다. `try{`는 범위 안(원문 42181행)에서 열리고 감싸개가 `}finally{_shBufI--}}`로 닫는다 — 원문의 닫는 부분과 같은 모양.
- 앵커: 시작 `function hurtE(e,dmg,ang,noSound,opts,atkEl=0){`, 끝 `  // ═══ 데미지 → HP 직행 ═══` 둘 다 **정확히 1줄과 일치**해야 한다. 줄 범위·sha256은 `oracle.json`의 `source.anchors`.

## 같이 실행한 원문 함수(순수·읽기 전용)와 주입 함수

- 원문 그대로 실행: `elMul`, `ar`, `wp`, `nc`, `rg1`, `rg2`(`INV.equipped`를 읽기만 함), `dst`, 표 `EL`, `ELC`, `ELP`, `_UNDEAD_ET`.
- 주입(기록용 스텁): `_eqAffix`·`_lEq`·`_uEq`(케이스의 키→값 표, 없으면 0), `statStr`·`statCrit`·`statCritDmg`·`pAtkMul`·`meleeRef`·`pDotPool`·`_predBonus`·`_hunterMul`(케이스 값), `_petOnAtk`, `shQuery`(`ens` 중 반경 안, 입력 순서), `hurtE`(재귀: 기록만), `hurtP`, `_spawnBossProjectile`, `addTxt`, `addParts`, `shake`, `doHitFlash`, `playSample`, `SFX.block`, `_hitSfxForEtype`(`{key:'hit_'+et,pitch:1+et/1000}`), `_T`(항등), `window._parryLesson.hurtEnemy`, `Math.random`(고정 수열).
- 기록: 호출 순서·이름·인자(숫자 비트 단위, 적은 `ens` 색인, `opts`·투사체 객체는 키 정렬한 `[키,값]` 쌍), `_shBufI`는 `_petOnAtk`·`shQuery` 호출 때의 값을 함께 기록.

## 케이스

- 기준 적은 `mkEn`(CX-02 원문 실행)으로 만든 실제 객체 16종(etype 0·6·7·40·41·57·63·74·85·91·92·93·99, 언데드 4, 보스 si0·si3). 케이스 = 기준 적 + 덮어쓰기(`undefined` 값은 `del` 목록으로 키 삭제).
- 격자: 명세 §4 항목 전부(관문·반격류·레어몹·etype6 방패·원소 저항·방어/회피·모디파이어·감전·어픽스·전설·패시브·최소 1·이원 플래그·약화·콤보·분노·치명타·반지 폭발·스턴/빙결·에너지쉴드·정수화) + 시드 고정 무작위 650.
- 정수화: `~~`는 2^32 래핑(`EnemyFactory.ToInt32`), 케이스에 2^31 근처·3e9·−3e9·1e12 포함.

## 대조 방식 (Program.cs)

- 조기 반환 여부, 반환 객체의 모든 값(웹 이름으로 리플렉션, double 비트 단위, JS 3상태 `undefined/false/true`는 `bool?`), 적 객체 전 필드, 플레이어 `P` 전체, `G._sStats.crits`·`G.playTime`, `_shBufI`, `_hitSfxCd`, `window._btDmgLog`, 주입 호출 전체, `Math.random` 호출 횟수.
- 웹에서 `undefined`인 필드는 C#에서 null이어야 하고, JSON이 못 담는 −0은 export가 거부한다. JS `NaN`은 JSON에서 `null`로 적히므로 비교 때 "기대가 null이면 null 또는 NaN" 둘 다 통과시킨다(예: 스태미나 `P.st`가 없는 플레이어에 `stLeech`를 쓰면 `Math.min(undefined,NaN)=NaN`).

## CX-04b — 중간부(H2) 확장

`hurtE`의 `// ═══ 데미지 → HP 직행 ═══` 줄부터 `  if(e.hp<=0){` 바로 앞 줄(fce195067: 42421~42567)을 같은 방식으로 대조한다. 보고서: `docs/engine/UNITY_CX04B_ENEMY_HURT_BODY_20261027.md`.

### 감싸개 H2 (원문에 덧붙이는 텍스트는 이것뿐)

```js
function __H2(e,ang,noSound,opts,__h){let {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit}=__h;
  <앵커 줄 `// ═══ 데미지 → HP 직행 ═══`부터 `  if(e.hp<=0){` 앞 줄까지 그대로>
return {<위 14개>,isBoss,finalKbM,_isRanged,_isMH,_isBB,_isMagicProj,_kbScale,_noKB};}
```

- 14개는 CX-04a 인계값(H1 반환), 뒤 8개는 범위 최상위 `const`(export가 중괄호 깊이로 추출). `try`/`finally`는 없다(`_shBufI`는 H1 쪽).
- 시작 앵커는 H1의 끝 앵커와 같은 줄, 끝 앵커 `  if(e.hp<=0){`는 시작 뒤 첫 일치. 범위 안 중괄호 깊이가 0인지 export가 검사한다.
- 같이 실행하는 원문: `_poiseHit`, `_TXT_BUDGET`(+ H1과 같은 순수 함수·표). 주입: H1 목록 + `poolPart`, `_addImpact`, `_addBoom`, `canMv`(케이스 규칙 `open`/`blockAll`), `_tickSkyCrusherRecharge`, `SFX.groggy`, `hurtE`의 6번째 인자(atkEl, 생략 시 기록 안 함).

### 케이스 종류

- `H1`(기존) · `H2`(인계값 14개를 직접 지정한 격자 + 시드 고정 무작위 500) · `CH`(연결): **H1 케이스 각각을 H1 원문으로 돌려 나온 실제 반환값을 H2에 그대로 이어 붙인다**(H1이 조기 반환하는 케이스는 연결에서 빠진다). 연결 케이스는 H2 쪽 전역(옵션 몇 개, 카메라, 예산, 장비 키)도 무작위로 섞는다.
- 대조에 `G`의 `_sStats`(crits·dmgDealt·maxHit), `_dmgPeak`, `_dmgPeakShow`, `_flashCol`/`_flashT`, `hitStop`, `slowMo`, `_noHitStopT`, `_dpsDmg`, `_txtPerFrame`, `_uqScCtx`, `_uqS`가 더해졌다. 검사 수는 종류별로 따로 센다(`checksByKind`).

## CX-04c1 — 사망부 앞쪽(H3a) 확장

`hurtE`의 `  if(e.hp<=0){` 줄부터 `    // ═══ 지옥의 잔해 드롭 ═══` 바로 앞 줄까지(fce195067: 42568~42817)를 같은 방식으로 대조한다. 보고서: `docs/engine/UNITY_CX04C1_ENEMY_HURT_DEATH_HEAD_20261027.md`. Core: `Runtime/Core/EnemyHurt.Death.cs`(+`EnemyHurtContext.Death.cs`).

### 감싸개 H3a (원문에 덧붙이는 텍스트는 이것뿐)

```js
function __H3a(e,ang,noSound,opts,__h){let {<CX-04b 반환값 22개>}=__h;
  <앵커 `  if(e.hp<=0){` 줄부터 `// ═══ 지옥의 잔해 드롭 ═══` 앞 줄까지 그대로>
return {__cont:true,_isBurnDeath,_isWhirlKill,_sinkDruid,_killAng};}return {__cont:false};}
```

- 22개 = CX-04a 인계값 14 + CX-04b 반환값 8(`isBoss,finalKbM,_isRanged,_isMH,_isBB,_isMagicProj,_kbScale,_noKB`). 뒤의 `}`가 `if` 블록을, 마지막 `}`가 함수를 닫는다(원문의 블록은 잔해 드롭 구간에서 이어서 닫힌다).
- 원문 `return;`(디코이·도플갱어·보스 부활 성공)은 `undefined`, HP가 0 초과면 `{__cont:false}`, 끝까지 가면 `{__cont:true,…}`. 반환 지점 이름(Decoy/Doppelganger/BossRevive/Continue/NotDead)은 원문을 실행한 호출 기록에서 뽑는다(디코이=`환영 소멸!` 문구, 도플갱어=`_reviveVFX`, 나머지=보스 부활).
- 앵커 둘 다 정확히 1줄과 일치해야 하고, 범위의 중괄호 깊이는 1(열린 `if`)이어야 한다.

### 같이 실행한 원문 / 주입

- 원문 그대로: `_HS`, `_diffSigned`, `_isSi0DruidSink`, `_druidSinkStart`(`G._druidSink` 포함), `_druidFinaleReviveChance`, `_isDruidFinale`, `_r`(피치 난수 1회), `_eMouthXY`, `safePt`, **`mkEn`**(동반부활: CX-02 원문 실행 ↔ C# `EnemyFactory.Create`를 그대로 호출, 호출 인자는 기록).
- 주입(기록용 스텁): `atkTicketRelease`, `_regKill`, `_petOnKill`, `_reviveVFX`, `playVFXAng`, `_addBlastLight`, `_addTpBolt`, `deathFX`, `_spawnLargeMonsterDeathFx`, `_addCorpse`, `_addBurnCorpse`, `_addGorePiece`, `_addDeathImpact`, `_getPProj`(빈 객체), `_L`(한국어 문구 그대로 반환), `_rageMax`, `buildMapCache`, `SFX.victory`, `hurtP`(인자 전부 기록), 기존 스텁(`canMv`, `shQuery`, `hurtE`, `addTxt`, `poolPart`, `_spawnBossProjectile`, `_eqAffix`·`_lEq`·`_uEq`, `shake`, `playSample`, `_T`).
- `canMv` 규칙: `open` · `blockAll` · `firstN`(처음 N번 거짓, 그 뒤 참 — 순간이동/동반부활의 안전지점 탐색 경로).
- 범위가 읽고 쓰는 전역(`w3`): `G.stage·kills·_stageKills·combo·comboTimer·comboMax·_killedBosses·_fireZones·spawnHoles·_druidFinaleBoss·_druidSink·_gateGuard·_gateGuardKilled·bossGateOpen·_chromaT·_blDeathSndQ·_uqZoneQ·_flashT/_flashCol·hitStop·_noHitStopT`, `OPT.diff·hitStop`, `_DEMO_MODE`, `_DEMO_LAST_STAGE`, `_shDirty`, `_harpGauge`, `_HARP_GAUGE_MAX`, `_uqHitCtx`, `_uqFzCtx`, `_uqS`, `pProjs`, 플레이어 `P`(`lv·facing·rage·shield·mshield·_okSpdBuff·_okSpdMul·kb` 추가).

### 케이스 종류

- `H3`: 22개 인계값을 직접 지정한 격자(디코이·도플갱어·보스 부활 전 경로·드루이드 피날레·STY-D9 침강·일반몹 부활·킬 보상·유니크/전설 On-Kill·사망 표현·콤보·구멍·문지기) + 시드 고정 무작위 500.
- `CH3`: CX-04b 연결 케이스(`CH`)마다 **H1 → H2 → H3a를 실제 반환값으로 이어 붙인 케이스**. 연결 결과 대상이 이미 죽은 것(`[natural death]`)과, 홀수 번째 나머지는 HP를 1·3·20으로 낮춰 사망부까지 가게 한 것(`[HP forced low]`).
- 대조에 `G3`(kills·combo·druidSink·druidFinaleBoss 색인·gateGuard·queue들·spawnHoles·_shDirty·_harpGauge·_uqFzCtx·pProjs), 동반부활로 늘어난 적(`added`), 반환 지점 이름이 더해졌다.
- 변이 검사: `death-mutants.cjs`(EnemyHurt.Death.cs 변이 목록) — `node make-h3-oracle.cjs`로 H3+CH3만 담은 `oracle-h3.json`을 만든 뒤 `node run-mutants.cjs --file D --name mutation-death`.

## CX-04c2 (O-1) — 사망부 뒤쪽(H3b) + 함수 전체 체인(CH4)

`    // ═══ 지옥의 잔해 드롭 ═══` 줄부터 `if(e.hp<=0){`를 닫는 `  }` 바로 앞 줄까지(origin/main 5286c0464: 42952~43322)를 같은 방식으로 대조한다. 보고서: `docs/engine/UNITY_O1_KILLTAIL_20261028.md`. Core: `Runtime/Core/EnemyHurt.DeathTail.cs` + `EnemyHurtContext.Tail.cs`. 원본 판을 fce195067에서 5286c0464로 올리며 H1·H3a에 생긴 웹 변경 3건(치명타음 `_critSfxCd`, STY-12 `_bossLine`, `_druidSinkStart`의 효과음·`_druidFled`·`sink0`)도 C#에 반영했다.

```js
function __H3b(e,ang,noSound,opts,__h,__d){let {<CX-04b 반환값 22개>}=__h;let {_isBurnDeath,_isWhirlKill,_sinkDruid,_killAng}=__d;
  <앵커 `// ═══ 지옥의 잔해 드롭 ═══` 줄부터 `if(e.hp<=0){`를 닫는 줄 앞까지 그대로>
}
```

- 끝 앵커: `  }finally{_shBufI--}` 앞 줄이 `}`(if 닫기)여야 하고, 범위의 중괄호 깊이는 0이어야 한다. 원문은 앞쪽 지역값을 읽지 않지만 같은 이름으로 넘겨 둔다.
- 원문 그대로: `SLOT_NAMES`, `POT`(hp만 있음), `_maliceMul`, `_SFX_PRI`, `_playDruidSfx`, `RARE_ETYPE`, `ELITE_TIERS`, `isRareEtype`, `SI_TO_HELL`, `mkEn`(분열체: CX-02 원문 실행).
- 주입(기록용 스텁): `_wiPush`, `magicRef`, `statInt`, `pMagicMul`, `_skMul`, `eProjAt`, `mkItem`(`{stubItem,slot,tier,el,rarity}` 반환), `addPotion`(케이스 값 반환), `rollDrop`, `addExp`, `checkRooms`, `dbSaveNow`, `SFX.explode/magicHit/pickup`, `_bossLine`. `_spawnBossProjectile` 리터럴은 `owner:e` 같은 중첩 적·아이템까지 `{e:i}`·`{o:[…]}`로 재귀 기록한다(C# `JsObj`).
- 전역(`w4`): `G.mats`, `G._chainCnt`, `G._chainT`, `G.rifts`, `_critSfxCd`, `G._druidFled`. 대조에 `G4`가 더해졌다(모든 케이스).
- `H4`: 뒷부분 단독 격자 300 + 시드 고정 무작위 600 = 900. `CH4`: `CH3` 중 `Continue`로 끝난 케이스마다 H1 → H2 → H3a → H3b를 실제 반환값으로 이은 함수 전체 체인(202).
- 결과(5286c0464): **4,968케이스 5,755,060 검사 / 불일치 0**(H4 1,134,027 · CH4 309,621). 변이 13개 중 12개 검출(남은 1개 = 리터럴 키 순서 교환, 동치 변이).
