# CX-03a — 적 매 프레임 갱신 공통 앞부분 Core + oracle (2026-10-27)

담당: 단순작업2(Sonnet, 보스전 총괄 전속). 명세: 보스전 총괄 `E:/exoduser-wt/_out/pc-cx03a/SPEC.md`. 마스터 보드 C01, 보스전 보드 CX-03a. 선행 CX-01·CX-02(같은 브랜치 tip `9d11d4325`).
범위: 웹 `updateE`는 CX-03을 셋으로 나눈 것 중 **a** — 적 갱신 루프의 적 1마리 앞처리(L1: 화톳불 타이머·벽 끼임 구조·타이머·컬링·리시 텔레포트·4단계 티어링·`_walkDist`)와 `updateE` 맨 앞부터 DOT 직전까지(U1). 상태 값 변화와 **바깥 함수 호출 순서**만 옮긴다(이동 알고리즘·벽 판정·LOS·피해·소리·글자·파티클은 주입 함수). DOT 이후는 CX-03b/c.

## 1. 원본 (game.html sha256 `d73d691989c1cb84…`, 65695줄, repo HEAD `2acaa1b80`, 커밋된 blob)

작업 폴더의 `G:/exoduser/game.html`은 다른 세션의 미커밋 편집이 있어(`M game.html`) 줄 번호가 다르다. oracle 입력은 `git show HEAD:game.html` 사본이다(CX-02와 같은 sha, 명세의 줄 번호와 일치).

| 구간 | 줄 | sha256(앞 16자) | 내용 |
|---|---|---|---|
| L1 적 루프 앞처리 | 34415~34494 | 125fa2deb4469591 | 화톳불 타이머 → `_bf`/`_bfActive` → `G._eTierFrame++` → `_eUpdateStart` → 적마다: 시간 예산 break, 화톳불 밀어내기, 벽 끼임 구조, 타이머 감소, 컬링, 리시 텔레포트, 티어링, 화톳불 재확인, `_walkDist`. **명세의 34418 대신 화톳불 타이머 줄(34415)부터**: `_bf`·`_bfActive`가 그 줄들에서 만들어지기 때문 |
| U1 `updateE` 앞 | 38587~38721 | 46da818569d33eac | `function updateE(e,sp){`(38586) 다음 줄 ~ `// ═══ D4식 DOT` 앞 줄 |
| 의존(원문 그대로 실행) | `_isDruidFinale` 17056, `_isNormalDruidBoss` 16940, `_poiseReset` 20002~20007, `_spikeTrapSlowPct` 45508, `dst` 31725, `dst2` 31726, `_ETYPE_SFX` 32082~32085, `_ARCH_SFX` 32086~32097 | | |

L1에서 `else if(e._reviveTimer>0){`(부활 대기·판정)부터는 BX-08이라 제외했다. 죽은 적(`alive=false`)은 이번 범위에서 아무것도 하지 않는다.

## 2. 감싸개 원문 (원문에 덧붙인 텍스트는 이것뿐)

```js
// U1
function __U1(e,sp){
  <updateE 원문 38587~38721줄 그대로>
}
// U1T = 위와 같고 끝에 한 문장만 더함 (조기 반환 여부·지역변수 d를 알아내는 용도; 모든 U1 케이스에서 __U1과 상태가 같음을 export가 확인)
  return {tail:true,d:d};
// L1
function __L1(sp){
  <원문 34415~34494줄 그대로>
}   // for 닫기
}   // 함수 닫기
```

## 3. 새 파일 (`unity/Assets/Exoduser/Runtime/Core/` 평면, 각 .meta 포함)

| 파일 | 내용 |
|---|---|
| `EnemyTick.cs` | 손으로 옮긴 포트. `BeginFrame`, `Step`(L1 한 마리), `UpdateHead`(U1) |
| `EnemyTickContext.cs` | `EnemyTickContext`(전역 값 + 주입 함수 delegate), `EnemyTickFrame`, `EnemyRift`, `EnemyBonfire` |
| `EnemySpawn.Tick.cs` | `EnemySpawn`(이제 `partial`)에 더한 nullable 필드 49개 — 웹에서 `updateE`가 새로 만들거나 읽는 필드. null = `undefined`, 0과 구분 |
| `EnemyTickTables.cs` | `_ETYPE_SFX`/`_ARCH_SFX` (oracle에서 생성) |
| `JsMath.cs` | V8과 같은 비트의 `Atan2/Sin/Cos` (fdlibm 5.3 포트). 아래 §8 참고 |
| `unity/Tools/enemy-tick-oracle/` | export · gen-cs · Program · csproj · run*.cjs · run-mutants · RedStub · oracle.json · README |

CX-02 쪽 변경: `EnemySpawn`을 `partial`로 생성(생성기 1줄), `EnemyFactory.SafePt`의 `Math.Cos/Sin`을 `JsMath`로 교체.

### API

```csharp
var f = EnemyTick.BeginFrame(ctx, sp);                       // 화톳불 타이머, G._eTierFrame++, performance.now() 한 번
for (int i = 0; i < ens.Count; i++)
    if (EnemyTick.Step(ctx, f, ens, i, sp)) break;            // true = 웹의 break (시간 예산 초과)
bool early = EnemyTick.UpdateHead(ctx, e, sp, out double d);  // true = 웹 updateE가 DOT 앞에서 return
```

`Step` 안의 `updateE(e, sp*k)` 호출은 `ctx.UpdateE` delegate로 나간다(CX-03b/c 연결 자리). 연결은 하지 않았다(Codex 파일 수정 0).

## 4. 주입 함수 표 (C#은 `EnemyTickContext` delegate, oracle은 같은 이름의 기록용 스텁)

| 웹 이름 | C# delegate | 인자 | 반환/효과 규칙(oracle) |
|---|---|---|---|
| `canMv` · `_canMvTile` | `CanMove` · `CanMoveTile` | x, y, r | 케이스 규칙 `open`/`blockAll`/`blockDisc`/`blockXge` |
| `isW` | `IsWall` | x, y, flag | `none`/`all`/`xge` |
| `hasLOS` | `HasLos` | x1,y1,x2,y2 | 케이스 불리언 |
| `_eWallStuck` | `WallStuck` | x, y | `none`/`all`/`disc` |
| `_ffMoveE` | `FlowMove` | e, sp, mul | `e.x+=sp*mul; e.y+=sp*mul*0.5` |
| `_pushOutWall` | `PushOutWall` | e | `e.x+=1.5; e.y-=0.5` |
| `_pushOutsideBonfire` | `PushOutsideBonfire` | e, bf, clearance | `e.x+=0.25; e.y+=0.125` |
| `_bonfireEnemyClearance` | `BonfireClearance` | e | `e.r*1.5+2` |
| `hurtE` | `HurtEnemy` | e, dmg | `e.hp=max(0,e.hp-dmg)` |
| `_cancelProjCharge` | `CancelProjCharge` | e | 기록만 |
| `rollDrop` · `addExp` · `_regKill` | `RollDrop` · `AddExp` · `RegKill` | e / n / e | 기록만 |
| `_bossReviveGrandVFX` | `BossReviveGrandVfx` | e, r | 기록만 |
| `updateE` (L1 안) | `UpdateE` | e, sp | 기록만 (sp 배수 확인) |
| `_T` | `Translate` | s | `s` |
| `addTxt` · `addParts` · `shake` · `SFX.block` | `AddText` · `AddParts` · `Shake` · `Block` | | 기록만 |
| `playSample` · `_r` | `PlaySample` · `RandomRate` | name,vol,rate / a,b | 기록만 / `a+b*0.5` |
| `performance.now` | `Now` | | 케이스의 `clock` 배열을 순서대로 |
| `Math.random` | `Random` | | 케이스의 `seq`를 순서대로 |

oracle 전체 기록: 주입 호출 30,688개 (canMvTile 889, r 323, playSample 323, hasLOS 154, pushOutWall 213, canMv 397, hurtE 20, T 20, addTxt 20, addParts 20, sfxBlock 20, shake 20, cancelProjCharge 247, ffMove 146, isW 14, now 521, wallStuck 21871, updateE 3535, rollDrop 106, addExp 106, regKill 106, bossReviveGrandVFX 221, bonfireClearance 698, pushOutsideBonfire 698).

## 5. 필드 변화 표

**L1 (적 1마리, `Step`)**

| 단계 | 바꾸는 값 |
|---|---|
| 화톳불(앞·뒤) | `x,y`(주입 스텁이 바꿈; 비보스만) |
| 벽 끼임 구조(중심+4코너 → 1~5칸×8방향) | `x,y,kb.x,kb.y` (타일 `G.map`≠1, 맵 범위 안) |
| 구조 실패, 비보스 | `hp=0, alive=false, s='dead'` + `G.kills++`, `G._stageKills=(…||0)+1` + rollDrop·addExp(`exp||1`)·_regKill → 이후 단계 건너뜀 |
| 구조 실패, 보스 | 6~12칸 링 → 플레이어 위치(`canMv` 참일 때) → 제자리 |
| 타이머 | `_spawnT--`, `_bossReviveVFXPending`(≤0이면 0 + grand VFX), `stunned`, `_hitStun`, `_hitFlash`(0 아래로 안 내려감), `_stunImmune`, `_pImmune`, `reviveIframes` |
| 스턴 종료(`stunned<=0` 이고 `_maxStunned` 참) | `_maxStunned=0`; 보스는 추가로 `poise=maxPoise, poiseR=0`, `_pImmune=max(…,300)`, `s='idle'`, `st2=30`, `_teleDropY=0` |
| 리시 텔레포트 | `x,y,kb,facing,_stuckT` (2500px 초과 + 알림 + 비스턴·비빙결·비보스, `canMv` 참) |
| 끝 | `_walkDist += sqrt(이동거리²)` (이동했을 때만) |
| 전역 | `G._bonfire.t -= sp`, `G._eTierFrame`(undefined→0→+1), `G.kills`, `G._stageKills` |

**U1 (`UpdateHead`)**

| 단계 | 바꾸는 값 |
|---|---|
| 텔레그래프 | `_telegraphT -= sp`, `_telegraphR = r+20` |
| 벽 안 | (주입) `_pushOutWall` |
| 타이머 | `reviveIframes`, `_cursed`, `_shockT`(≤0이면 0 + `_shockStk=0`), `_bluHitCD` |
| 넉백 이동 | `x,y` ← `kb*sp`; 균열 충돌(속도>2)·실벽 충돌(속도>2, `max(~~(속도*4), ~~(mhp*min(.08, 속도*.004)))`) 피해는 `hurtE`+글자·파티클·소리·흔들림 호출, `kb=0`; `kb *= .85**sp`, 가시덫 감속 `kb *= (1-pct)` |
| 스턴(조기 반환) | `stunned` 180 상한, `_maxStunned = max(최초, stunned)` (+ 종료 분기는 `stunned>0`이라 도달 불가 — 그대로 이식) |
| 이동 판정 | `_isMoving, _moveHold(3 또는 -=sp), _moveAng, _prevX, _prevY` (`_prevX||x` 거짓 판정 재현) |
| 빙결(조기 반환) | `_frozen -= sp`; 끝나면 `_frozen=0, _freezeGauge=0, _frozenImmune=보스300/일반120` |
| 디버프 | `_webSlow, _frozenImmune, _iceResDown, _iceShardRes(-=.002*sp, 0 하한), _weakT(→`_weakPhys/_weakMag/_weakPj=0`), _shockDRT(→`_shockDR=0`), _blinkWeakT(→`_blinkWeak=0`), _freezeGauge(-=sp*.3, 0 하한)` |
| 포이즈 | 비보스만: `poiseR += sp`, ≥200이면 `poise += ~~(maxPoise*.15)`(maxPoise 상한), `poiseR=0` |
| 이동 소리 | `_mSfxCd`(없으면 0, ≤0이면 소리 재생 후 `60+~~(rand*60)`, 아니면 -=sp), 전역 `_mSfxPlaying++` |
| 어그로 | `_reviveChase`(해제), `_alerted`, `facing` |
| 추적 | `x,y`(주입 `_ffMoveE` / 후퇴 직접 이동) |
| 스택 | `_wwStk, _wwStkT, _comboStk, _comboHitT, _comboDecayT` |

## 6. 조기 반환·break/continue 지점

| 위치 | 조건 | 효과 |
|---|---|---|
| U1 ① | `_lessonEnemy && window._parryLesson?.active` | 함수 전체 반환(아무것도 안 바뀜) |
| U1 ② | `_hitStun>0` (텔레그래프·벽 밀어내기·저주·감전·**넉백 이동**·`_bluHitCD` 다음) | 반환 |
| U1 ③ | `stunned>0` (`_cancelProjCharge` 호출 후) | 반환 — **`_prevX/_prevY`는 갱신하지 않음** |
| U1 ④ | `_frozen>0` (이동 판정 `_prev*` 갱신 **뒤**) | 반환, 디버프 타이머(`_webSlow` …)는 감소하지 않음 |
| U1 끝 | 위 4개에 안 걸림 | DOT 앞까지 도달. 호출자가 지역변수 `d`를 이어서 씀(`out d`) |
| L1 break | `ei%(모바일 8 : 32)==0 && ei>0 && !ib && now-start > (모바일 8 : 12)ms` | 루프 전체 종료(보스는 안 끊김) |
| L1 continue ① | `!alive` | 부활 분기(BX-08), 이번 범위 밖 |
| L1 continue ② | 벽 끼임 + 구조 실패 + 비보스 → 사망 처리 | 티어링·화톳불 재확인·`_walkDist` 건너뜀 |
| L1 continue ③ | 컬링(뷰포트 밖) | 알림 상태면 `(G._eTierFrame&7)==0`일 때 `_ffMoveE(sp*4, 0.5)`만 |

oracle: U1 케이스 891개 중 조기 반환 324, DOT 앞까지 도달 567.

## 7. 난수·시계 소비 지점 (Math.random 3곳 + performance.now)

| 위치 | 조건 | 소비 |
|---|---|---|
| L1 리시 텔레포트 | 컬링 + 비보스·비스턴·비빙결·알림·거리²>6250000 | **2회**: `Math.PI*2*random()`(각도) → `800+random()*400`(거리). 그 뒤에 `canMv` |
| U1 이동 소리 ① | 거리<1000, 비스턴·비빙결, `_mSfxCd<=0`, `_mSfxPlaying<3`, 소리 이름이 `monster_crawl`일 때만 | 1회: `random()<.5` → `monster_crawl1` |
| U1 이동 소리 ② | 소리 이름이 있을 때 | 1회: `60+~~(random()*60)` — **`playSample(…, _r(1,.15))` 호출 뒤** |
| `performance.now()` | 프레임당 1회 + 시간 예산 검사마다 | `BeginFrame`에서 먼저, 이후 `Step`이 검사 조건이 참일 때만(단축 평가) |

### 조기 반환·난수 소비에서 주의할 곳 3개
1. **U1은 넉백 이동·`hurtE`까지 한 다음에야 `_hitStun`/스턴/빙결 반환을 한다.** 스턴·피격 경직 중인 적도 밀려나고 균열·벽 충돌 피해를 받는다. 반대로 `_prevX/_prevY` 갱신은 스턴 반환 뒤라 스턴 중에는 멈추고, 빙결은 `_prev*` 갱신 뒤·디버프 타이머 감소 앞에서 반환한다.
2. **L1의 `continue`가 세 가지다**: 죽은 적 / 벽 끼임 사망(티어링·`_walkDist` 건너뜀) / 컬링(알림이면 8프레임마다 `_ffMoveE`만). 컬링된 적은 `updateE`를 안 부르므로 타이머만 줄고, 화톳불 재확인도 안 한다.
3. **난수는 두 부위에서만, 조건이 겹겹이다**: 리시 텔레포트(각도→거리 순서, 둘 다 `canMv` 앞), 이동 소리(crawl 판정 → `_r` → `playSample` → 쿨다운 순서). 소리는 `_mSfxPlaying<3`·쿨다운·거리·스턴 조건에서 하나라도 어긋나면 한 번도 안 뽑는다. `performance.now` 호출 횟수와 순서도 시간 예산 단축 평가 때문에 달라질 수 있어 함께 대조한다.

## 8. `JsMath` — 왜 필요했나

첫 GREEN에서 **3,213,657 검사 중 38 실패**가 났고 전부 `Math.Atan2/Cos/Sin`의 마지막 비트 차이였다(`facing`·`_moveAng`·리시 텔레포트 좌표). V8은 fdlibm, .NET은 C 런타임을 쓰기 때문이다. 명세대로 "차이는 그대로 보고"가 원칙이지만 이 값들이 상태 비교의 기준이라 **fdlibm 5.3을 포트한 `JsMath.Atan2/Sin/Cos`**를 추가하고, 호스트 V8의 결과 26,740개(atan2 8014, sin 9367, cos 9359; 여러 크기·4분원 경계·±1e-9 근방 포함)와 비트 단위로 대조한다. 이제 `EnemyTick`·`EnemyFactory`는 `Math.Atan2/Sin/Cos`를 쓰지 않으므로 Mac·IL2CPP에서도 같은 비트를 기대할 수 있다(그 환경 실측은 아직 없음).
`Math.Pow(.85, sp)`·`Math.Pow(1.0014, n)`(CX-02)은 .NET 그대로이며 이 환경에서는 전부 일치했다. 다른 플랫폼은 미확인.
`JsMath.Sin/Cos`는 |x| ≤ 2^19·π/2까지만 지원하고 그 위는 예외를 던진다(게임이 쓰는 각도는 훨씬 작음).

## 9. 미이식 표

| 항목 | 처리 |
|---|---|
| 플로우필드 `_ffMoveE`, 벽 판정 `canMv/_canMvTile/isW/_eWallStuck`, `hasLOS`, `_pushOutWall/_pushOutsideBonfire` | 주입 함수(실제 구현은 맵 이식 단위) |
| `hurtE` (CX-04), `rollDrop/addExp/_regKill`, `_cancelProjCharge`, `_bossReviveGrandVFX` | 주입 함수 |
| 글자·파티클·소리·흔들림(`addTxt/addParts/SFX.block/shake/playSample/_r/_T`) | 주입 함수(표현 전용, 호출 기록만 대조) |
| `else if(e._reviveTimer>0)` 부활 대기·판정 | BX-08 |
| 루프 앞 부분(적 700마리 상한 정리, 시체 GC, 공간 해시 리빌드, 오라·둔화·다리 부상 갱신) | 이번 L1 범위 밖(34415 이전) |
| `updateE` DOT 이후 | CX-03b/c |
| 보스 `_bossAI` | BX-02 |
| `window._parryLesson` 객체 | `ParryLessonActive` 불리언으로 축소 |

## 10. Codex `Simulation.TickEnemy`(적 틱)와의 차이 — 14개 (수정은 하지 않음)

| # | 차이 | 웹 | Codex |
|---|---|---|---|
| 1 | 시간 스텝 | `sp`(1·2·4·8·슬로모션)로 모든 감소·이동을 곱함 | 항상 1틱 |
| 2 | 루프 앞처리 | 화톳불 밀어내기·벽 끼임 구조/사망·컬링·리시 텔레포트·`_walkDist` | 없음 |
| 3 | 티어링·시간 예산 | 거리별 T1~T4, 12ms/8ms 예산 | 없음(전부 매 틱) |
| 4 | 타이머 위치 | `stunned/_hitStun/_hitFlash/_stunImmune/_pImmune/reviveIframes`를 루프에서 `sp`만큼 감소 | `HitStun/Stunned`를 1씩 감소, `_stunImmune/_pImmune/reviveIframes` 없음 |
| 5 | 스턴 종료 | 보스만 `_poiseReset`·`_pImmune=300`·idle 강제 | `MaxStunned`만 0으로 |
| 6 | 넉백 | `kb*sp` 이동, 균열 충돌·실벽 충돌 피해, `.85**sp` 감쇠, 가시덫 감속 | `kb` 그대로 이동, 막히면 0(피해는 "pending"), 고정 `.85` |
| 7 | 조기 반환 | 교습 적, 피격 경직, 스턴, 빙결 | 피격 경직, 스턴만 |
| 8 | 디버프 타이머 | 저주·감전·텔레그래프·둔화·빙결 면역·빙결 저항·얼음파편·약화·방어감소·전격 약화·빙결 게이지 | 없음 |
| 9 | 포이즈 자연회복 | 비보스만, `poiseR += sp` | 보스 포함, `PoiseRegenTicks++` |
| 10 | 이동 판정·소리 | `_isMoving/_moveHold/_moveAng`, 이동 소리(난수 2) | 없음 |
| 11 | 어그로 | 부활 추적(2배속), 시야 어그로는 `idle/recover` 상태에서만, 드루이드 돌진 조준 고정 | 상태 제한·조준 고정 없음 |
| 12 | 추적 | 사거리 등급별(≤400 밀착 / 그 외 .65~.85 유지·후퇴), 보스 2배 | 자체 이동(`MoveEnemyFallback`, 사거리 등급 없음) |
| 13 | 스택 감소 | 회전참 스택, 약점노출 스택 | 없음 |
| 14 | 수 형식·삼각함수 | double, V8 `Math.atan2` | float, .NET `Math.Atan2`(마지막 비트가 다를 수 있음) |

## 11. 검사 결과 (standalone .NET 8 oracle, Unity 런타임 판정 아님)

oracle 케이스 1240개(U1 891 · L1 349, 적 7,232마리, 난수 383회): 명세 §4 격자 전부(넉백 7종·경직/스턴/빙결·디버프 9종 경계·포이즈 199/200·이동 소리·어그로·사거리 등급×거리·스택·티어 경계 150/350/700·컬링 ±300·리시 2500·벽 끼임 1칸/5칸/보스 링/플레이어 위치/사망·시간 예산 데스크톱 32/12ms·모바일 8/8ms·`sp` 1/2/4/8/0.5/1.37) + 시드 고정 무작위 U1 650 · L1 260.
**사거리 300**은 `ETYPE_RANGE`에 없어(값은 200/400/600/800/1000) 200으로 검사했다.

| 항목 | 결과 |
|---|---|
| RED (`RedStub`: 아무것도 안 하는 `EnemyTick`) | **3,154,405 검사 중 21,939 실패**(기대 실패) |
| 첫 GREEN | 3,213,657 중 38 실패 — 전부 `Math.Atan2/Cos/Sin` 마지막 비트(→ `JsMath`로 해결) |
| **GREEN** | **3,246,746 checks / 0 failures** (1240 케이스) |
| 변이 검사(구현을 일부러 틀림, 87개) | 1차 74개 사망 · 13개 생존(경계값을 안 건드린 케이스 부족 + 내 빌드 오류 1개) → 생존 원인마다 경계 케이스 14개·V8 임계 인수 샘플을 추가하고 그 13개만 재실행 → 12개 추가 사망. **최종 86개 사망, 생존 1개** = 『cos kernel branch threshold changed』(상위 32비트(high word)가 0x3FD33333인 한 구간에서만 두 식이 갈리고, 두 식 모두 정확하게 계산돼 시험한 약 40개 인수에서 비트가 같음 → 실질 동치로 판단) |
| 회귀 CX-01 enemy-tables-oracle | **2,784 checks / 0 failures** |
| 회귀 CX-02 enemy-spawn-oracle (JsMath 교체·partial 후) | **204,592 checks / 0 failures** |
| 회귀 `unity/Tools/verify-core.cjs` (이 worktree, 새 Core 파일 전부 컴파일 포함) | **CORE_RESULT 36 checks / 0 failures** (map-oracle 표본 2,523) |

`verify-core.cjs`는 `godot/source_snapshot/game.html`과 `godot/data/map.json`이 필요한데 이 worktree가 sparse checkout이라 없었다. 로컬 sparse 설정에 `/godot/source_snapshot/`, `/godot/data/map.json`을 더해 실행했다(저장소 변경 아님). 명세의 "그곳에는 godot/source_snapshot이 있다"는 이 정리 뒤에야 사실이었다.

결과 파일: `E:/exoduser-wt/_out/pc-cx03a/runs/{red,green,reg-cx01,reg-cx02-green}.{json,log}`, `mutation.json`, `core-tests/`.

## 12. 열린 항목·다음 단계

- **연결**: `Simulation.TickEnemy`는 이 포트를 쓰지 않는다. 연결은 CX-03b/c 뒤 patch + PC_TO_MAC_INBOX(main·`unity/main` 두 곳).
- **CX-03b 착수에 필요한 것**: ① `hurtE`의 실제 구현(CX-04) — DOT 5종·엘리트 모디파이어 틱이 모두 `hurtE`로 피해를 준다 ② 플레이어 스탯 함수 `pDotDur()`/`pDotDmg()`(DOT 지속·배율) ③ `shQuery`(공간 해시) — 오라 ATK·모디파이어가 주변 적을 찾는다 ④ `mkEn`(CX-02, 완료) — 소환·분열 모디파이어. 이동·벽·LOS 함수는 3b에는 필요 없고 3c(상태 머신)와 실플레이 연결 때 필요하다.
- **미확인**: `JsMath`·`Math.Pow` 비트 일치는 .NET 8 Windows에서만 확인(Mac·IL2CPP는 상태 3 인수 때).
- **docs**: 이번 단위는 웹 값을 읽었을 뿐 docs 수치를 바꾸지 않았다.


## 12. C01-AI — 1-1 필드 몹 구성·AI (2026-10-27, 브랜치 claude/unity-pc-c01ai-20261027)

원본: game.html(main e72118dbd) `HELL_SPAWN`/`rollEtype`/`_spawnHoleCount`, 소환굴 갱신 블록, `updateE` DOT 이후(etype 0~29·47 분기 + `switch(e.s)`).

| 항목 | 내용 |
|---|---|
| 스폰 | 1-1 필드에는 웹과 같이 타이머 스폰이 없고 **소환굴 14개**(`godot/data/ch1_map_source/si0.json spawn_holes_final`, 총 168)가 2000px 안에서 깨어나 90프레임 뒤 `rollEtype(0)`(근접/원거리 50:50, 2·22·30·43 제외)로 순차 소환. `EnemyPools.cs`, `SpawnHoles.cs`, `Simulation.Holes.cs`. 분모 `Stage.TotalSpawned`=168(소환마다 증가 안 함) |
| AI | `EnemyAi.cs`(`UpdateBody`): 공통 앞처리·etype 5/6/7/9/10/11/12/13/14/16/17/19/22/24/25/26/27/28/29/47 스킬, idle 이동(후방 유지 15종·밀착 추적·분리력), 근접 접촉, 60f 탄막 차징(`_fireChargedProj`), 상태 eChargeWind·eCharge·eSwoop·eSlamWind·eShieldBash·eSummon·windup·attack·recover, 엘리트 M04/M29/M30. `Simulation.EnemyAi.cs`가 `EnemyTick`(L1+U1)과 연결 |
| 투사체 | 필드 탄은 `DruidBoss.SpawnProjectile`(spawnProj)·기존 비행/피격/패링 경로 재사용, 60f 경고 링(`_emitEnemyShot`) 후 발사 |
| 미이식 | 플로우필드(직선+축 슬라이드+우회), eCircle/strafe(`atkTicketRequest`가 항상 true라 웹에서도 도달 불가), 엘리트 M05/M18 피격 효과·M06/M12/M13/M15/M16/M19/M23/M24(1-1은 hell 0 모디파이어만 굴린다), 벽 끼임 구조·사망(`WallStuck` 항상 false), 패링 반격 `hurtE`(웹 41153 등 — 적 쪽 피해), 2장 이후 etype. **DOT 틱·지면 탄 효과·`elMul`·엘리트 M31/M32는 §13에서 이식** |
| oracle | `enemy-ai-oracle` 474 시나리오·56,380틱·713,918 검사 / 0 불일치(원본 `updateE` 전체를 Node VM에서 틱 단위 실행, 호출 로그·난수 소비 포함), `enemy-pool-oracle` 35단계×3시드×250 굴림 26,271 검사 / 0, `c01-field-oracle` 소환굴 5 시나리오·소환 433건 / 0 |
| 회귀 | enemy-tables 2,784, enemy-spawn 204,592, enemy-tick 3,246,746, enemy-hurt 2,439,085, druid-boss 5,421,635, player-hurt 47,559, dash-parry 146,580, shield-revive 34,821 모두 0 실패 (damage-parity·weapon-xbow 종료코드 0) |


## 13. C01-FX — DOT·지면 탄·속성 상성·엘리트 M31/M32·필드 화면 (2026-10-27, 브랜치 claude/unity-pc-c01fx-20261027)

기준 원본: `git show e72118dbd:game.html`(main, 65784줄). 담당 PC 세션(C01 총괄 위임).

| 항목 | 내용 |
|---|---|
| m1-check 02 원인 | 하네스가 매번 같은 `-output` 폴더를 재사용했고, 앞선 실행이 `character-roster-v1`(M1점검)·`combat-save-v1`을 남겼다. `BeginCharacterEntry`는 `HasCombatSave(이름)`이면 "이어하기" 경로(`StartupGameplayPrepared=false`)로 가서 스토리·첫 연습 아레나를 건너뛴다 → 02 "not shown"(01 비고에 story page Idle). 이 PC의 설정·세이브가 아니라 **하네스 격리 결함**. 수정: `M1Check`가 매번 새 이름(`M1`+난수)의 신규 캐릭터를 만들고(`NativeGame.M1Check.cs`), 실행 스크립트(`E:/exoduser-wt/_out/run-c01fx-m1.ps1`)가 실행 전 출력 폴더를 비운다. 제품 코드 결함은 아님 |
| DOT | `EnemyAi.DotTick`(= updateE "D4식 DOT" + 표식·푸른비 타이머 + 냉기 DOT + 악의사냥 DOT): 출혈 50%·중독 40%·화상 60% 풀을 초당 1회 `풀/남은초×pDotDmg`로 드레인, `hurtE(dot,shieldHit[,maliceHunt],el)`은 호스트 `HurtDot` → `Simulation.ApplyEnemyDot`(실제 `EnemyHurt.Head/Body`, 쉴드→HP). L1 루프 안에서는 웹 객체가 살아 있으므로 state→web 복사 없이 그대로 사용(`inEnemyLoop`). `pDotDur/pDotDmg`는 패시브 트리 미이식이라 1 |
| 지면 탄 | `Simulation.TickFieldZones`(웹 투사체 루프의 정지탄 부분): **덫** — 28px 안·돌진 중 아님이면 소멸, 무적이 아니면 `hurtP(dmg×elMul,magic)`+넉백 8+`_trapSlowT`=120×(1−min(.5,slowRes))(속도 ×.5), 상한 50개(가장 오래된 것 제거); **빙판** — 닿으면(r+sz×3+4, 무적·돌진 아님) 얼음속성은 `_freezeSlow`=60, 어둠속성은 효과 없음, 닿으면 소멸; **눈보라** — `hurtP(dmg||5 ×elMul)`+얼음속성 `_freezeSlow`=90; 수명은 만료돼도 1로 유지(웹과 같게 닿기 전엔 사라지지 않음, 카메라 2500px 밖이면 제거). **거미줄**은 `ProjSpec.Web`/`BossProjectile.Web` — 이동탄이지만 속도대·유도 제외, 피격 시 데미지 없이 `_webSlow`=90. 그림: 덫=웹 `img/vfx/mine_trap_ward_sheet.png` 오른쪽 절반(112px, additive, -0.00018rad/ms 회전, 알파 .78+.18펄스), 빙판·눈보라=웹과 같은 3겹 원(R=sz×5, .6R, .28R, 알파 .12/.26/.46×펄스) |
| elMul | `AiHost.ElMul`/`DruidBoss.ElementMul` → `EnemyHurt.ElMul(공격속성, 방어구 el)`(`InventoryState.GetEquipped("armor").el`). 적 근접·돌진·투사체(`(dmg||10)×elMul`)·덫·눈보라 피해에 적용. 모든 속성 쌍(F-I, D-L, D-H, E-L 2배, 같은 속성 .5, P 제외)을 oracle이 대조 |
| 엘리트 | M31 번개 연사(전조 45f → 번개탄 3발 ±.24rad, 360f 주기, 850px, `_claimEliteAttack(45)`), M32 지옥 포격(600f 주기, 1100px, 플레이어 주변 3점 78/102/126f 지연, `_claimEliteAttack(126)`). 1-1 몹 풀은 hell 0 모디파이어(M01~M04·M29·M30)만 굴리므로 M31/M32는 이후 장을 위한 선이식 |
| 발견한 기존 불일치 | etype 47 분신 속성 `e.el||EL.D` — C#은 `e.el ?? EL_D`라 물리(0) 몹에서 0, 웹은 3. 수정 |
| 적 그림(필드 화면 비교에서 발견) | ① 스킨 칸: Unity는 위치 해시(`(int)(e.X*31)%40`)로 골랐고 웹은 `_mob8Col/_mob8Row`(etype×7+홈x×31) — 공장이 이미 같은 값을 굴렸으므로 그 칸을 사용, ② 에너지 쉴드 파란 아크(r+5, ±1.0rad, 5px, 25% 쐐기; 쉴드 소진 후 어두운 방패 r+4 ±0.8rad 3px)·웹식 HP바(r×2+6 폭 4px, 피해 입었거나 쉴드 줄면 표시)·정지 시 800px 안 플레이어 바라보기·스폰 20프레임 페이드인(AI 켜진 때만) 추가 |
| oracle | `enemy-ai-oracle` 692 시나리오(+218: DOT 48[출혈·중독·화상·냉기·악의사냥·표식 6 etype×8], 방어구 속성 132[etype 30×3 + 상태 7×6], 엘리트 M31/M32 단독·조합·경계 38) 124,540틱·2,323,428 검사 / **0 불일치**(원본 `updateE` 전체를 Node VM에서 틱 단위 실행, 호출 로그 `hurtE(dot)`·`zone`(+el)·`shot`(+web)·난수 소비 포함). `druid-boss-oracle` 5,421,635 / 0 (투사체 변경 후 회귀 없음) |
| Unity 런타임 | 컴파일 0. `--unity-m1-check` 14단계 전부 ok(02 포함, 최종 빌드 1회). `--unity-field-compare`(신규 캡처 모드, `NativeGame.FieldCompare.cs`) 자기점검 5/5: DOT가 실제 hurtE로 초당 HP를 깎음(100000→95166, 5초 구간), 덫(hp+shield 811→711·감속 119·소멸), 빙판(얼음속성 freeze 59), 눈보라(어둠속성 hp 711→631·freeze 0), 범위 밖 장판 유지 |
| 필드 화면 비교 | 1-1 시작 지점(4020,7420) 같은 위치에 같은 etype 24종을 같은 간격으로 배치해 웹(headless Playwright·음소거)과 나란히 캡처: `E:/exoduser-wt/_out/field-compare/`(`field-web.png`·`field-unity.png`·`compare_full_50pct.png`·`compare_crop_top_1x.png`·`compare_crop_bottom_1x.png`·`compare_zoom_row_2x.png`·`zones-web.png`·`zones-unity.png`·`compare_zones_1x.png`). **판정: 몹 그림·크기·쉴드 아크·덫·장판은 같은 게임으로 보임. 남은 차이** — (a) etype별 장식(etype 5 주황 후광, 7 리치 보라 후광, 8 주황 깜빡임 등 `_eDecor` 70여 줄) 미이식, (b) 맵 바닥의 핏줄 데칼·가장자리 가시 덩굴·비네팅(맵 총괄 영역), (c) 필드 몹 **탄 그림**: Unity는 보스용 `NativeBossView`의 초록 원이고 웹은 속성·종류별 콩/입 스프라이트 — 같은 게임으로 안 보임, 다음 단위 후보 |


## 2026-10-31 최신 원본의 이전 상태 마커 후속

현행 변경·원본 수치·검수 및 미완료 게이트는 [게임 동작 웹 대조](UNITY_GAMEPLAY_PARITY_20261031.md)를 따른다. 과거 검수 수치는 이번 Player·전체 스킬 완료 근거로 소급하지 않는다.
