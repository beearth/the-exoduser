# BOSS-summon-mid-loop-failure-hb1014 — 보스 소환 루프 중간 예외 뒤 중복 소환 경계 (완료)

실행: Mac Claude Code (BOSS/Claude) · 단일 세션 · cwd `/Users/fordeargamers/Projects/exoduser-migration-20261001`
실행 UTC 2026-10-02T10:45Z (19:45 KST) · `productionApplied=false` · `runtimeAccepted=false`
소유 2파일: `result.md`(이 파일) + `checks.mjs`. 별도 evidence/log/patch/fixture 파일 없음(증거는 본 result에 포함).

> **한 줄 결론:** 소환 case의 상태전이(`e.s='recover';e.st2=70;`)가 **throwable 작업(spawn 루프·SFX) 뒤에** 있어, 루프 중간에 `mkEn`/`addParts`/`SFX`가 throw하면 상태가 `bossSummonWind`(`st2<=0`)로 **고착**되고 다음 tick에 **중복 재소환**된다. 결함(제어흐름)은 소스에서 재현 확정. 단 **트리거(throw) 자체의 실게임 도달성은 환경대역이며 본 작업에서 증명하지 않았다.** 최소 memory 후보(try/finally)로 상태 안전종료를 검증했고 정상 경로 등가성도 통과. **소스 미수정** — root 반영은 아래 Gate 필요.

---

## 1. 입력·소스 고정 (실제 Read / SHA)

| 항목 | 값 |
|---|---|
| 대상 case | `case'bossSummonWind'` — `updateE()` 상태머신 |
| game.html 행 | **39442–39458** |
| game-easy-test.html 행 | **38244–38260** (양판 동일 구조) |
| **fragment sha256** (해당 17행, 양판 동일) | `8e2c0a343479a55ba637e3ed62eb0c23d97625504c7f3d17a46ed6702164ac45` |
| game.html 전체 sha256 (10:45Z 관측, 非-git) | `8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b` |
| game-easy-test.html 전체 sha256 (10:45Z) | `50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057` |
| 윈드업 설정처 | `_bossStartPattern` `case'summon'` game.html:36411 (`e.s='bossSummonWind';e.st2=tele||55`) |
| 선택 경로 | `_bossScore`/`_bossStartPattern`(AI) 또는 강제 호출. summon 무브셋 배정: si1·si3(ch1), ch2~7 base |
| checks.mjs sha256 | `e1cf8c268cdf8f7a3b7fc45f98a9646ba56d8596483d7a86faa69e4789e4b025` |
| 지정 Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0) |
| checks 실행 exit | **0** (20 PASS / 0 FAIL) |

> **source 드리프트 주의:** game.html 전체 sha256은 총괄의 UI minus-수명 가드 순차 통합으로 세션 중 계속 변했다(관측: 05:37Z `2e45ee0e` → 05:56Z `dc711864` → 10:45Z `8b4653f3`). **그러나 소환 fragment(39442–39458)는 `8e2c0a34`로 불변**이며 본 분석은 그 fragment anchor 기준이다. 타 세션 변경은 되돌리지 않았다. 총괄 제공 `6b865637`은 역사적 기준이며 현재 HEAD로 주장하지 않는다(Git 조회 0).

## 2. 실제 결함(defect) — verbatim 제어흐름

```js
if(e.st2<=0){
  const cnt=3+~~(G.stage*.5);
  for(let si=0;si<cnt;si++){
    ...
    const ne=mkEn(sx,sy,G.stage,et,false,el,e.room);  // ← throw 가능 caller
    ne.hp=~~(ne.hp*.5);ne.mhp=ne.hp;ne.eShield=0;ne.eShieldMax=0;
    ens.push(ne);                                     // 첫 spawn 은 이미 push 됨
    addParts(sx,sy,'#aa00ff',8);                      // ← throw 가능 caller
  }
  SFX.charge();addTxt(...);                           // ← throw 가능 caller
  e.s='recover';e.st2=70;   // ← 위 어느 throw 라도 이 줄에 도달 못함
}
```

**throwable caller(생성 전/후):** `mkEn`(39451), `addParts`(39454), `SFX.charge`/`addTxt`(39456). 루프 진입~상태전이(39444–39457) 사이의 어떤 throw도 `e.s='recover'` 미실행 → `e.s='bossSummonWind'`·`st2<=0` 유지 → 다음 tick 재진입·재소환.

**도달성/환경대역 구분:**
- **제어흐름 결함**: 소스 재현 확정(§3 S2). mkEn/addParts/SFX가 throw하면 100% 재현.
- **트리거 도달성(환경대역, 미증명)**: 정상 RNG/입력에서 `mkEn`/`addParts`가 throw하는지는 본 작업이 **실게임 실행으로 증명하지 않았다**. 후보 요인(미검증): `mkEn` 내부 전역 미정의·극한 좌표·pool/alloc 실패, `addParts` pool 고갈, `SFX` audio 컨텍스트 예외, OOM. → severity는 트리거 도달성에 종속. **정상 경로에서는 결함 발현 안 함**(S1 PASS).

## 3. 재현·검수 (checks.mjs, 결정론 seed, 20/20 PASS, exit 0)

대역: `mkEn/addParts/poolPart/SFX/addTxt`는 STUB(합성). 결함은 case 자체 제어흐름이라 verbatim 재현. RNG는 mulberry32 결정론으로 소환 수/el/et/hp/room/70f trace 보존.

| 시나리오 | 설정 | 관측 | 판정 |
|---|---|---|---|
| **S1 CONTROL** (현행·정상·stage0) | throw 없음 | ens=3, hp 100→50, eShield0, room=7 전파, el∈6풀, et∈[0,2,3], `recover`/70f | 정상 계약 PASS (8건) |
| **S2 DEFECT** (현행·2번째 mkEn throw) | tick1 throw | tick1: ens=1 잔존, `e.s='bossSummonWind'`/st2=0 고착 | 결함 재현 PASS |
| | tick2 장애해소 | ens=**4**(첫 1 + 재소환 3) = **중복** | 재현 PASS |
| | 5tick 지속장애 | reentries=5, 상태 영구 고착, ens 누적 | 재현 PASS |
| **S3 FIXED** (후보 try/finally·동일 throw) | tick1 | throw 전파 유지, ens=1(부분), `recover`/70f **안전 종료** | 수정 PASS |
| | tick2 | ens=1 유지, **재소환 없음** | 수정 PASS |
| **S4 등가성** (후보·정상) | throw 없음 | 소환 수·트레이스(el/et/hp/room)·`recover`/70f 현행과 **동일** | 등가 PASS |

소환 수 공식 확인(정보성): stage0→3, 2→4, 10→8, 20→13, 34→20 (`3+⌊stage·.5⌋`).

**정상 control 없이 PASS 아님**: S1·S4가 실제 계약(소환수/HP×.5/70f/트레이스)을 검사한다. 가짜 counter 아님.

## 4. 최소 memory 후보(패치안) — 소스 미적용, root/Gate용

**후보 B (권장): 상태전이를 `try/finally`로 보장** (재시도·수량 정책 도입 0):

```js
if(e.st2<=0){
  try{
    const cnt=3+~~(G.stage*.5);
    for(let si=0;si<cnt;si++){ ...현행 동일... }
    SFX.charge();addTxt(e.x,e.y-20,cnt+_L('체 소환!',' Summoned!'),'#cc66ff',40);
  } finally {
    e.s='recover';e.st2=70;   // throw 여부와 무관하게 상태 종료
  }
}
```
- 정상 경로 **완전 불변**(finally는 try 정상종료 후 실행 → S4 등가). 실패 경로: 상태 안전종료 후 throw 재전파(삼키지 않음) → 고착·중복 제거.
- 양판 동일 적용 필요(game.html:39457 / game-easy-test.html:38259 동일 위치).

**후보 A (대안): 상태전이를 루프 앞에 선커밋** — `e.s='recover';e.st2=70;`를 `if(e.st2<=0)` 직후·루프 전에. 단 실패 시 부분 spawn + 상태종료. 정상 경로 동일.

> **미결정 — 실패 spawn 정책(필수 Gate):** 두 후보 모두 "이미 push된 부분 spawn(1마리)을 **유지**"한다. 부분 spawn을 **버릴지/롤백할지**, 또는 실패를 **조용히 삼킬지 전파할지**는 전투·연출 정책 결정이며 **임의 확정하지 않는다**. 재시도·수량 변경도 도입하지 않았다.

## 5. docs 동기화 인계 (root 반영용 old/new)

`rg` 결과 소환 계약은 `docs/9적ai패턴디자인/9_적AI패턴디자인.md:223`에 **윈드업만** 기재("`bossSummonWind` | 소환 (55f)"). 수치·실패정책 미기재.

| 정본·행 | 현재(old) | 보강(new) | 성격 | 확정/미확정 |
|---|---|---|---|---|
| `9_적AI패턴디자인.md:223` | "소환 (55f)" | "윈드업 55f(`_bossStartPattern` tele∥55) → **소환 수 `3+⌊stage·.5⌋`**, 소환수 **HP×.5·eShield0**, el 풀 `[P,F,I,D,L,H]` 랜덤, et 풀 `[0,2,3,3,3]` 랜덤, 생성 후 **recover 70f**" | 구현 수치 보강 | 확정 |
| `BOSS_BATTLE_SETTINGS.md` §6 (summon 계약 부재) | 소환 수/HP/70f 미기재 | 위 수치 + **실패 안전성 주의**: "spawn 루프 중 throw 시 상태전이 미도달 → 고착·중복(미수정, hb1014 Gate)" | 구현/로버스트 | 확정(결함) + 정책 UNKNOWN |
| `CH1_1_BOSS_IMPACT_AUDIT_20260927.md:28,82` "summon … ens 소환수 유지" | 유지 서술 | hb1014 경계(중간 예외 고착) 교차참조 주석 | 교차참조 | 확정 |

보호 `2_3`·Q전용 blackBean 패링·어택티켓 금지·LOCK/확정수치 **미변경**. 새 설계 임의 확정 0.

## 6. 담당·Gate·한계

- **실게임 Gate(필수, 미수행):** ① `?bosstest`(summon 보스)에서 `mkEn`/`addParts`가 실제 throw하는 경로가 production에 존재하는지(도달성) 확인. ② 후보 B 적용 후 정상 소환 회귀(수·HP×.5·70f 불변) + 장애 주입 시 고착·중복 소멸. ③ game.html+easy 양판 동기. — 소스 수정·런타임 검증은 **root/감독 통합** 소관.
- **제외 범위(지시대로 미수행):** root bossdeath/respawn/roomgate, ENEMY cursor, `_skUnclick`/스킬카드 minus. burstCounter idx60(ENEMY 기배정) 무관.
- **한계:** `mkEn`/`addParts`는 STUB(대역). 실게임 throw 재현·GPU·native·청취·저장·배포 PASS **아님**. `productionApplied=false`, `runtimeAccepted=false`. source/fixture PASS를 실게임 PASS로 치환하지 않음. no-fix가 아니라 **결함 재현 + 후보 + 정상 control 완성**, 트리거 도달성만 환경대역으로 미결.
- Git 조회 0, 삭제/이동/cleanup 0, 소유 밖 쓰기 0, 새 세션/팀 0. Changes 80 시 root checkpoint·100 전 산출 중단 인지. 자체 다음 건 배정 0 — 감독 검수·통합 대기.
