# SKILL (claude-native-6) — mortar 입력 수명 후속검토 (실행 재현)

claude-provider/SKILL의 **입력 수명 후속검토(논리 반례 7건, 미실행)** 를 인수하여, 실제 소스
함수를 Node runtime으로 돌려 **결함 경계 "한 건"(MM-B1 blur 유령발사)을 재현**했다.
기존 142 비용검사는 **재실행하지 않음**. MP수치·합체·RNG·취소/자원 정책 **변경 0**, 생산 소스
수정 0, Git 쓰기 0.

---

## 1. 실제 소스 근거 (인수 — 본인 재검증 아님)

| 항목 | 값 |
|---|---|
| `game.html` SHA-256 | `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f` |
| `game-easy-test.html` SHA-256 | `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8` |

위 두 SHA는 provider evidence의 frozen 값과 **현재 체크아웃이 일치**함을 재확인(인수용). 기타
frozen fixture SHA(`mortar-confirm-source-before.txt`=`044883d8…`, `task.md`=`a4826471…`)는
총괄 재검증 대상으로 **본인 재실행 안 함**.

**하니스에 verbatim 복사한 실제 소스 슬라이스 (전체 게임 사본 아님):**

| 슬라이스 | game.html | game-easy-test.html | parity |
|---|---|---|---|
| `_clearHeldInput` 본문 | 12877–12885 | 12273–12281 | **byte-identical (직접 Read 확인)** |
| `blur`/`visibilitychange` 등록 | 12886–12887 | 12282–12283 | 동일 |
| mortar 조준·충전·release 블록 | 35217–35228 | 34022–34033 | **byte-identical (직접 Read 확인)** |
| mortar 조준 진입/취소(dispatch) | 12456–12457 | (easy 대응) | 동일 |

하니스 내 슬라이스 자기검증 해시(변형 방지): `SRC_CLEAR`=`1250907f…`, `SRC_AIM`=`a9c5053171…`
(checks.mjs 실행 출력 `srcHashes` 참조).

**핵심 구조(재확인):**
- 발사 판정 `_mmRel = P._mmCharging && _mmK && !KH[_mmK]` → **level 기반**(KH가 "떨어진 상태"면 성립).
- `_clearHeldInput`은 `K/KH/MB/MBjust/_dashHold…`만 0으로 하고 **`_mmAiming·_mmCharging·_mmAimKey`는 초기화하지 않음**.
- `blur`는 `_clearHeldInput`를 그대로 호출(탭 visible → 루프 계속, hidden 아님).

---

## 2. 검사 실행 결과 (Node v24.15.0, checks.mjs)

Node: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`
`fireMaliceMortar`는 **도달성 프로브**(호출 여부만 기록, MP/쿨/`G._mmBomb` 비용은 142검사 소관 —
여기선 미변경·미측정).

| id | 입력(전제) | 예상(기대 행동) | 관찰 | 판정 |
|---|---|---|---|---|
| **C0** 대조 | 조준+1프레임 홀드 후 **사용자 정상 keyup** | 발사 1회(정상 release) | `_mmCharging=true` 후 `fireCalls=1` | **PASS** (하니스 로직 진위 확인) |
| **MM-B1** | 충전 중(`_mmCharging=true`, `KH[키]=true`) **창 blur**→`_clearHeldInput`→다음 프레임 | blur 시 조준·충전 해제·**무발사(fireCalls=0)** | `KH[키]→false`, `_mmCharging` **true 잔존**, `_mmAiming` true 잔존, **`fireCalls=1`** | **FAIL (결함 재현)** |
| **MM-B1b** | 충전 중 Escape/RMB **취소 입력 + 동시 blur** | 취소가 발사 차단(fireCalls=0) | blur가 `K/MBjust`까지 비워 취소 소실 → **`fireCalls=1`** | **FAIL (취소 무력화 확인)** |

**재현된 결함 경계 (MM-B1):** 조준키를 **최소 1 update 프레임 홀드**(`_mmCharging=true`)한 뒤 창
포커스를 잃으면(`blur`), `_clearHeldInput`가 `KH[키]`만 비우고 `_mmCharging`은 남긴다. 다음
update 프레임에서 `_mmRel = _mmCharging && _mmK && !KH[_mmK] = true`가 되어 **사용자가 떼지도
않았는데 `fireMaliceMortar`가 호출**된다(= 유령 발사, 비용·쿨 소모·`G._mmBomb` 생성 경로 도달).
**MM-B1b**는 그 순간 사용자가 취소(Escape/RMB)를 눌러도 `_clearHeldInput`가 `K/MBjust`를
비워 **취소가 발사를 막지 못함**을 함께 입증.

> 재현 범위 한정: 이번 하니스는 **blur 경계(MM-B1)** 를 결정적으로 입증한다. provider 후보 중
> `_mmCharging=true` 선행(홀드 1프레임)이 필요하다는 전제도 C0/MM-B1에서 확인됨(탭=즉시떼기는
> `_mmCharging=false`라 발사 없음 — 미재현, 별 경로).

---

## 3. 미재현/UNKNOWN (실입력·실 runtime Gate 필요)

provider가 든 나머지 경로는 이번 하니스로 **결정적 재현을 하지 않음 → UNKNOWN 유지**:
- **MM-B2 (alt-tab 복귀발사)**: `visibilitychange&&hidden`→`_clearHeldInput`, 그러나 hidden 동안
  루프 동결(`if(document.hidden){…return}`)·복귀 프레임 rAF 타이밍은 **실 runtime 의존** → UNKNOWN.
- **MM-P1 (언포즈), MM-D1/D2 (사망/부활), MM-G1/G2 (패드 해제·전환), MM-S1 (스테이지 이월)**:
  각각 `G.paused`/`die()`/`_gpClearAll`/스테이지 리셋 호출 **문맥(순서·게이트)** 이 필요해 단일
  update 프레임 하니스로는 도달성 단정 불가 → **UNKNOWN (QA 실입력 Gate)**.
- 위는 결함 "부정"이 아니라 **이번 실행으로 입증하지 않았다**는 뜻. 논리 경로는 provider 분석대로
  열려 있으나, 도달성은 blur(MM-B1)만 확정.

---

## 4. 최소 미적용 후보 (직접 근거 있는 것만 — 미적용, 정책 불변)

MM-B1 직접 근거(level 기반 `_mmRel` + `_clearHeldInput`의 플래그 미초기화)가 있으므로 **방향
후보만** 제시. **적용·실입력 Gate는 QA/총괄 인계.** MP수치·합체·RNG·취소/자원 정책 변경 0.

- **후보 A (권장, 최소):** `_clearHeldInput` 말미에
  `if(typeof P!=='undefined'&&P){P._mmAiming=false;P._mmCharging=false}` 추가 → blur/visibility에서
  조준·충전 명시 해제. MM-B1/B1b 차단. 비용/합체/RNG/취소 분기 불변.
- **후보 B (보강, UNKNOWN 경로 대비):** `die()`·`reviveOnce` return 직전·스테이지 리셋(30327)에
  동일 2플래그 초기화 — 단, MM-D/S는 이번에 미재현(UNKNOWN)이므로 **QA 재현 확인 후** 적용 판단.
- **후보 C (근본, 보류):** `_mmRel`을 level 기반 → **실제 keyup 엣지**로 전환. 입력 모델 변경이라
  취소/릴리즈 정책 영향 검토 필요 → 설계 결정 보류.

> 메모리 대조: 입력 수명/`_clearHeldInput` 관련 저장 규칙은 조회 결과 **직접 상충 항목 없음**.
> 위 후보는 모두 **미적용**이며 본인 생산 소스 수정 0.

---

## 5. docs 정정표 (미적용 — 공용 docs는 총괄 순차 인수)

rg로 docs 전수 검색한 발견사항:

| docs 파일 | 현행 | 정정/보충 후보 |
|---|---|---|
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:227` | `maliceMortar` = "투척(마우스=방향, 키 홀드=거리충전, 릴리즈=투척)" — **수명 경계 제약 없음** | 제약 보충: "홀드=충전/릴리즈=발사가 **창 blur·visibilitychange에서도 `_clearHeldInput`의 KH-only 초기화 + level 기반 `_mmRel`로 합성 release 발사됨(MM-B1 실행 재현, FAIL)**. 취소(Escape/RMB)도 blur로 소실(MM-B1b)." (조작·수치 설계 변경 아님) |
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:228` | `maliceStorm` = "포격식 설치 (게임패드: 키홀드→`P._msDist` 충전, 릴리즈=발사)" | **동일 구조 경보**: mortar와 같은 홀드→release 패턴 → 같은 수명 결함 가능성. **QA 조사 대상으로 등재 권고**(이번 미검증). |
| `docs/2_1 …/SKILL03_설치확정_자원검수_20261001.md` (수명 언급 없음) | — | 말미 추가안: "2026-10-02 mortar 입력 수명 경계 **실행 재현**: 충전(`_mmCharging=true`) 중 `blur`→`_clearHeldInput`(KH만 0, `_mmAiming/_mmCharging` 잔존)→다음 프레임 `_mmRel=true`→`fireMaliceMortar` 유령발사(MM-B1 FAIL, node v24.15.0). 취소 입력도 무력화(MM-B1b). MM-B2/P1/D1/D2/G1/G2/S1은 UNKNOWN(실 runtime Gate). mortar 고유(타 조준스킬은 `MBjust` 발사). 양쪽 HTML byte-identical." |

> 위 docs 반영은 **미적용**. 공용 docs 쓰기·생산 통합은 총괄의 순차 인수.

---

## 6. 다음 Gate

1. **총괄**: 현행 SHA 재검증(위 game.html/easy SHA는 작성 시점), 후보 A 적용 여부·범위 결정,
   §5 docs 정정 반영.
2. **QA 실입력/실 runtime Gate(미수행)**: 충전 중 ① 창 blur(MM-B1 실게임 확인) ② alt-tab 복귀
   (MM-B2) ③ 패널 열고 키 떼고 닫기(MM-P1) ④ 쓰러짐/`reviveOnce`(MM-D1/D2) ⑤ 패드 분리·pad↔kbm
   (MM-G1/G2) ⑥ 스테이지 전환(MM-S1), 그리고 **maliceStorm 동일 구조** 재현 여부.
3. **actual input/장치/runtime**은 QA 후속 Gate(본인 미수행).

**수행/미수행 구분:** 실제 소스 슬라이스 verbatim 추출 + Node 하니스 실행으로 **MM-B1/B1b
재현(FAIL)·C0 대조(PASS)** 완료. MM-B2 등 6경로는 **UNKNOWN**(미재현). 생산 적용·실게임/DOM/
물리·실입력·Git쓰기·설정변경은 **수행하지 않음**.
