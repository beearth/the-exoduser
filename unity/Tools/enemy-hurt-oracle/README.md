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
