조사를 마쳤습니다. Read/Grep/Glob만 사용했고 Node 실행·runtime·UI/게임·Git쓰기는 하지 않았습니다. 아래는 소스 근거 → 논리 반례/불확실성 → 최소 후보·정책 → 검수 Gate 순서입니다.

---

## 1. 소스 근거 (실제 Read한 행·식별자)

**기존 142 하니스의 입력 경계(= 내 조사 바깥 확인용)**
- `result.md` / `evidence.json`의 `limits`: *"PASSIVES/equipment/fusion/SFX/sample/**input-reset are fixtures**; source RNG sequence only"* — 즉 기존 142검사는 dispatcher `maliceMortar` case와 `fireMaliceMortar` 비용만 추출하며 **`_clearHeldInput`·blur·visibility·pause·die는 fixture로 고정**, 실행하지 않음.
- 기존 evidence SHA(총괄 재검증 대상, 본인 재검증 아님): frozen `mortar-confirm-source-before.txt` = `044883d8…`, `game.html` = `30ae8544…`, `game-easy-test.html` = `9c7c25c1…`, `task.md` = `a4826471…`.

**조준·충전·release 수명 경로 (game.html, game-easy-test.html 동일 — 아래 easy 행번호 병기)**
- 확정 진입: `game.html:12457` (easy 대응) — `P._mmAiming=true;P._mmAimKey=keyCode;P._mmDist=150;P._mmCharging=false`
- 취소 진입: `game.html:12456` — 재입력 시 `_mmAiming=false;_mmCharging=false`
- update 조준 블록: `game.html:35217-35228` / `game-easy-test.html:34022-34031`
  - `35219/34024`: `if(_mmK&&KH[_mmK]){P._mmCharging=true;…}` — **홀드 1프레임이면 `_mmCharging=true`**
  - `35220/34025`: `const _mmRel=P._mmCharging&&_mmK&&!KH[_mmK]` — **KH만 떨어지면 release 성립(level 기반)**
  - `35221/34026`: 취소 분기는 `MBjust[2]||K['Escape']`
  - `35222/34027`: `else if(MBjust[0]||_mmRel){ … fireMaliceMortar(…) }`
- 발사 함수: `game.html:43770` `fireMaliceMortar` — 진입 즉시 `P._mmAiming=false; useMp('mortar');` (비용 재검사 없음 = 기존 142 patch 대상, **본 건과 별개**)
- 조준 인디케이터: `game.html:53852` — `if(P._mmAiming)` 동안 계속 그림

**입력 수명 경계 핸들러 (모두 `_mmAiming/_mmCharging`을 건드리지 않음)**
- `_clearHeldInput`: `game.html:12877-12885` / `game-easy-test.html:12273-12281` — `K/KH/MB/MBjust/_dashHold/_beamHold`만 0. **`_mmAiming·_mmCharging·_mmAimKey` 미초기화**
- 등록: `blur`→`_clearHeldInput` (`12886/12282`), `visibilitychange&&document.hidden`→`_clearHeldInput` (`12887/12283`)
- 루프 정지: `game.html:59894` / `game-easy-test.html:58222` — `if(document.hidden){_prevTs=0;…return}` → **hidden 동안 update 전체 미실행(상태 동결)**
- 일시정지 게이트: `update()`는 `game.html:30857`, `30881 if(G.paused)return;` — 조준 블록(35217)은 **pause로 막히지만, 플레이어 사망 상태(P.s)로는 막히지 않음**
- 사망: `die()` `game.html:42244` — `G.paused` 미설정, `_clearHeldInput` 미호출, 조준 플래그 미초기화
  - `42250` reviveOnce: 즉시 부활 `return` (초기화·pause 없음)
  - `42252` fallen: `P.s='fallen';P.iframes=9999` (pause 없음, `G.on` 유지 → update 계속)
  - `42389-42390` 진짜 사망: `P.s='dead';G.on=false;G._mmBomb=null`
- 스테이지/리스폰 리셋: `game.html:30327-30329` — 다수 `P._*/G._*` 리셋하지만 **`_mmAiming/_mmCharging/_mmAimKey` 미포함**
- 장치 전환: `gamepaddisconnected`→`_gpClearAll()` (`game.html:12980`/`easy:12376`), `_gpClearAll`은 `game.html:13034-13035`에서 `_gpInjHeld` 전 키에 **keyup 주입 후 비움**. pad→kbm 전환도 `_gpClearAll` 호출(`12982/12983`). KBM→pad 전환(`12962/12972`)은 `_gpActive`만 켜고 KH 미정리.

---

## 2. 논리 반례 후보 / 불확실성 (미실행 — Node runtime 아님)

핵심: **`_mmRel`은 level 기반**(`_mmCharging && !KH[key]`)이고, 수명 경계 이벤트는 KH만 비우고 `_mmCharging`을 남긴다. 따라서 KH가 비는 "합성 release"가 조준 블록이 다시 도는 첫 프레임에 **오래된 release로 발사**된다. 취소 분기(`Escape/RMB`)마저 `_clearHeldInput`가 `K/MBjust`를 비워 사라지므로 취소가 발사를 막지 못한다.

| id / 한글명 | 조건(전제) | 현재 분기 | 영향 | 기대 행동 |
|---|---|---|---|---|
| MM-B1 blur 즉시발사 | 충전 중(`_mmCharging=true`) + 창 blur(탭은 visible) | `blur`→`_clearHeldInput`→`KH[key]=0`, loop 계속(hidden 아님)→다음 프레임 `_mmRel=true`→`fire` | 포커스 잃는 순간 MP소모·쿨·`G._mmBomb` 생성(의도 외) | 포커스 상실 시 조준/충전 해제·무발사 |
| MM-B2 복귀발사 | 충전 중 + 탭 hidden(alt-tab/최소화) | hidden 동안 update 동결(상태 보존), 복귀 프레임에 `_mmRel=true`→`fire` | **복귀 즉시 유령 폭풍 발사** (task 지적 경로) | 복귀 시 조준 유지 아닌 해제·무발사 |
| MM-P1 언포즈발사 | 충전 중 패널(I/스킬팝/설정) 오픈 → 그 사이 조준키 keyup | pause로 블록 미실행, `_mmAiming/_mmCharging` 보존, 닫으면 `_mmRel=true`→`fire` | 패널 닫는 순간 발사 | 언포즈 시 재입력 전 무발사 |
| MM-D1 쓰러짐발사 | 충전 중 치명타→`die()` fallen | pause/clear 없음, `G.on` 유지 → 조준 블록이 `P.s==='fallen'`에도 실행, 키 유실 시 `_mmRel`→`fire` | 쓰러진 캐릭터가 폭풍 발사·MP/쿨 소모 | 사망/부활 진입에서 조준·충전 해제 |
| MM-D2 부활직후발사 | 충전 중 `die()`+`reviveOnce` 즉시부활 | 부활 `return`, 플래그 보존 → 부활 직후 `_mmRel`→`fire` | 부활 프레임 유령 발사 | 부활 시 조준 플래그 초기화 |
| MM-G1 패드해제발사 | 패드로 조준·충전 중 패드 분리 or pad→kbm 전환 | `_gpClearAll`가 `_gpInjHeld` keyup 주입→`KH[key]=0`, `_mmCharging` 잔존→`_mmRel`→`fire` | 장치 전환/분리 시 발사 | 장치 전환 시 조준·충전 해제 |
| MM-G2 패드해제 stuck | 충전 중 패드가 keyup 주입 없이 소실(엣지 유실) | `KH[key]` 참 잔류→영구 충전, release 불가 | 조준·거리 충전 고착(발사·취소 불가) | 레벨 동기화로 조준 종료 |
| MM-S1 스테이지 이월 | 조준/충전 중 스테이지 전환 | `30327-30329` 리셋이 `_mmAiming/_mmCharging` 미포함 | 다음 맵에 조준 인디케이터·발사 플래그 이월 | 맵 전환 시 초기화 |

**불확실성·전제(반드시 명시):**
- 위 "발사"는 모두 **`_mmCharging=true`가 선행**해야 함 → 조준키를 **최소 1 update 프레임 홀드**(35219 통과)한 경우. **탭(즉시 떼기)로 조준만 토글**한 경우는 `_mmCharging=false`라 **발사는 없고 "조준 인디케이터/플래그 고착"만** 발생(MM-S1·stuck류).
- blur와 visibilitychange의 실제 발화 순서·rAF 스로틀 타이밍에 따라 MM-B1(즉시) vs MM-B2(복귀)가 갈림 — 둘 중 하나는 성립. 정확한 프레임 경계는 **실입력/실 runtime에서만 확정**(미실행).
- `boneWall(_bwAiming)·thunderStake(_tsAiming)` 등 타 조준스킬은 **발사 트리거가 `MBjust[0]`뿐**(35231/35242)이고 `_clearHeldInput`가 `MBjust`를 비우므로 **유령 발사는 없음**; 다만 조준 인디케이터 고착은 공유. **release 발사 결함은 `_mmRel` 구조상 mortar 고유.**
- **양쪽 HTML 동일성**: `_clearHeldInput`·blur/visibility·`_mmRel`·fallen·hidden-return 핸들러를 game.html / game-easy-test.html 양쪽에서 직접 Read해 **동일 로직 확인**. 단, 기존 "main/easy slices parity PASS"는 aim/confirm/fire/cost 슬라이스만 비교한 것으로 **이 수명 핸들러들의 parity를 보장하지 않음** — 위는 내가 양쪽을 각각 읽어 확인한 결과임.

---

## 3. 최소 미적용 후보 / 정책 (적용·실입력 Gate는 수행 안 함)

직접 결함 근거(level 기반 `_mmRel` + `_clearHeldInput`의 플래그 미초기화)가 있으므로 **최소 방향 후보**만 제시(미적용, MP수치·합체·RNG·취소정책 변경 0):

- **후보 A (권장, 최소):** `_clearHeldInput` 말미에 `if(typeof P!=='undefined'&&P){P._mmAiming=false;P._mmCharging=false}` 추가 — blur/visibility에서 조준·충전을 명시 해제. 비용/합체/RNG/취소 분기 불변.
- **후보 B (보강):** `die()`·reviveOnce `return` 직전·스테이지 리셋(30327)에 동일 2플래그 초기화 추가 → MM-D1/D2/S1 차단.
- **후보 C (근본, 보류 권장):** `_mmRel`을 level 기반에서 **실제 keyup 엣지**로 전환(예: keyup 엣지 플래그). 입력 모델 변경이므로 **취소/릴리즈 정책 영향 검토가 필요 → QA·설계 결정으로 보류.**

> 위는 **미적용 후보**이며, 실제 적용·KBM/패드 실입력 Gate는 QA 인계. 본인은 생산 소스 수정 0.

---

## 4. 검수 Gate (총괄·QA 인계)

1. **총괄**: 현행 SHA 재검증(위 기존 evidence SHA는 작성 시점 값), 후보 A/B 적용 여부·범위 결정.
2. **QA 실입력 Gate(미수행)**: 충전 중 ①창 blur ②alt-tab 복귀 ③패널 열고 키 떼고 닫기 ④쓰러짐/`reviveOnce` 부활 ⑤패드 분리·pad↔kbm 전환 ⑥스테이지 전환 — 각 경우 유령 발사/인디케이터 고착 유무를 실게임에서 확인.
3. **docs 정정 후보(미적용):**
   - `docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md` 말미 추가안:
     > *"2026-10-02 mortar 입력 수명 경계 조사(Read 전용): `_mmAiming/_mmCharging`은 blur·visibilitychange·일시정지·사망/부활(reviveOnce)·패드 해제/전환·스테이지 리셋에서 초기화되지 않는다. `_clearHeldInput`는 KH만 비우고 `_mmRel`은 level 기반이라, 충전(`_mmCharging=true`) 상태에서 위 경계 복귀·언포즈·장치해제 프레임에 오래된 release로 발사·MP소모·쿨·`G._mmBomb` 생성이 가능한 논리 경로가 있다(미실행 논리 반례 후보, 양쪽 HTML 동일). mortar 고유(타 조준스킬은 MBjust 발사라 미해당). 실입력/실 runtime 미검증, QA Gate 필요."*
   - `docs/2_1 …/2_1 스킬관리+합체시스템.md` 투척계열 입력 설명 인근: mortar의 "홀드=충전/릴리즈=발사"가 **창 포커스·일시정지·사망·장치 전환에서도 합성 release로 발사될 수 있음**을 제약으로 보충(새 조작·수치 설계 변경 아님).

**수행/미수행 구분:** 소스 Read·식별자·행번호 확인은 완료. Node 실행·실게임/DOM/물리·시각/청취 인수·생산 적용·Git쓰기는 **수행하지 않음**. 위 7개 경로는 전부 **'논리 반례 후보'**(미실행)이며 실제 입력 Gate는 QA 인계.
