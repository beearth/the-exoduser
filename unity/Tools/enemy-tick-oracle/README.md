# 적 틱 앞부분 원본 대조 (CX-03a oracle)

`Runtime/Core/EnemyTick.cs`(+ `EnemyTickContext.cs`, `EnemySpawn.Tick.cs`, `EnemyTickTables.cs`, `JsMath.cs`)를 **원본 game.html의 적 루프 앞처리(L1)와 `updateE` 앞부분(U1)을 그대로 실행한 결과**와 대조한다. 보고서: `docs/engine/UNITY_CX03A_ENEMY_TICK_HEAD_20261027.md`.

```powershell
# 0) 원본 입력은 main의 커밋된 game.html (작업 폴더의 미커밋 편집은 줄 번호가 달라진다)
git -C G:/exoduser show HEAD:game.html > <scratch>/game.html
# 1) 원본 실행 → oracle.json (Node VM; 케이스 입력·난수 수열·시계·결과·주입 호출 기록)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tick-oracle/export.cjs --source <scratch>/game.html --head <커밋 sha>
# 2) 같은 oracle.json에서 표 생성 (EnemyTickTables.cs)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tick-oracle/gen-cs.cjs
# 3) RED: 아무것도 하지 않는 EnemyTick(RedStub) → 실패해야 함
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tick-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label red
# 4) GREEN: 실제 EnemyTick.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tick-oracle/run.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity' --label green
# 5) 변이 검사
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/enemy-tick-oracle/run-mutants.cjs --project 'E:/exoduser-wt/pc-unity-c01/unity'
```

## 감싸개 (원문에 덧붙이는 텍스트는 이것뿐)

- **U1**: `function __U1(e,sp){` + `updateE`의 원문 줄(`function updateE(e,sp){` 다음 줄부터 `// ═══ D4식 DOT — 히트뎀%` 앞 줄까지) + `}`
  - `__U1T`는 같은 본문 끝에 한 문장 `return {tail:true,d:d};`만 더한 변형이다. 함수가 DOT 앞까지 끝까지 갔는지(조기 반환 여부)와 지역변수 `d`를 알아내는 용도로만 쓴다.
  - 모든 U1 케이스는 정확한 `__U1`도 한 번 더 실행하고, 상태·주입 호출·난수 사용이 `__U1T`와 다르면 export가 중단된다.
- **L1**: `function __L1(sp){` + 원문 줄(`if(G._bonfire&&G._bonfire.t>0)G._bonfire.t-=sp;`부터 적 1마리 처리의 `if(e.alive){…}` 닫는 중괄호까지; 그 뒤 `else if(e._reviveTimer>0){`(부활 대기·판정, BX-08)는 포함하지 않음) + `}`(for 닫기) + `}`(함수 닫기)
  - 끝 위치는 `else if(e._reviveTimer>0){` 줄 직전이고, 그 지점의 중괄호 깊이가 1(= for 본문)인지 export가 검사한다.
- 앵커: 첫 줄이 정확히 1줄과 일치해야 한다(`function updateE(e,sp){`, `  // ═══ D4식 DOT — 히트뎀%`, `  const _eo=_gameFrame&1;` 다음 줄 = for, …). 줄 범위·sha256은 `oracle.json`의 `source.anchors`.

## 주입(바깥) 함수 — 기록용 스텁

호출 순서·이름·인자(숫자는 비트 단위, 적은 `ens` 색인, 화톳불은 값 4개)를 모두 기록한다. 규칙은 케이스가 정하고 C# 검사에도 같은 규칙이 있다.

| 이름 | 반환/효과 규칙 |
|---|---|
| `canMv(x,y,r)` · `_canMvTile(x,y,r)` | 케이스 규칙: `open`(참) / `blockAll`(거짓) / `blockDisc`(원 안이면 거짓: `dx²+dy² >= (rad+r)²`) / `blockXge`(x≥v면 거짓) |
| `isW(x,y,flag)` | `none`(거짓) / `all`(참) / `xge`(x≥v면 참) |
| `hasLOS(x1,y1,x2,y2)` | 케이스의 불리언 |
| `_eWallStuck(x,y)` | `none` / `all` / `disc`(`dx²+dy² < rad²`) |
| `_ffMoveE(e,sp,mul)` | `e.x+=sp*mul; e.y+=sp*mul*0.5` |
| `_pushOutWall(e)` | `e.x+=1.5; e.y-=0.5` |
| `_pushOutsideBonfire(e,bf,c)` | `e.x+=0.25; e.y+=0.125` |
| `_bonfireEnemyClearance(e)` | `e.r*1.5+2` |
| `hurtE(e,d)` | `e.hp=Math.max(0,e.hp-d)` |
| `_r(a,b)` | `a+b*0.5` (난수 안 씀) |
| `_T(s)` | `s` |
| `performance.now()` | 케이스의 `clock` 배열을 순서대로 |
| `Math.random()` | 케이스의 `seq`(고정 수열)를 순서대로 |
| 그 외 | 기록만: `_cancelProjCharge`, `rollDrop`, `addExp`, `_regKill`, `_bossReviveGrandVFX`, `updateE`(L1 안), `addTxt`, `addParts`, `shake`, `SFX.block`, `playSample` |

원문 그대로 같이 실행하는 함수(= C#에서 이식한 것): `dst`, `dst2`, `_poiseReset`, `_isDruidFinale`, `_isNormalDruidBoss`, `_spikeTrapSlowPct`, `_ETYPE_SFX`, `_ARCH_SFX`, `ETYPE_RANGE`.

## 케이스

- 기준 적은 `mkEn`(CX-02 원문 실행)으로 만든 실제 객체 11종(etype0, 사거리 200/400/600/800/1000, 기어가는 소리 etype, 레어 93, 보스 si0/3/10). 케이스는 기준 적 + 덮어쓰기 필드로 정의.
- 격자: 명세 §4 항목 전부 + 시드 고정 무작위 650(U1)/260(L1).
- **사거리 300은 표에 없다**: `ETYPE_RANGE` 값은 200/400/600/800/1000뿐이라 명세의 300 자리를 200으로 검사했다.
- `JsMath`(fdlibm 포트)는 호스트 V8의 `Math.atan2/sin/cos` 결과 약 2.3만 개와 비트 단위로 대조한다(`tables.mathSamples`).

## 대조 방식 (Program.cs)

- 적 객체의 모든 필드(웹 이름으로 리플렉션, double은 비트 단위), 바뀐 전역(`G.kills`, `G._stageKills`, `G._eTierFrame`, `G._bonfire.t`, `_mSfxPlaying`), 주입 호출 전체(이름·인자), `Math.random`·`performance.now` 호출 횟수, U1의 조기 반환 여부와 지역변수 `d`.
- 웹에서 `undefined`인 필드는 C#에서 null이어야 하고, JSON이 못 담는 −0·NaN은 export가 거부한다.
