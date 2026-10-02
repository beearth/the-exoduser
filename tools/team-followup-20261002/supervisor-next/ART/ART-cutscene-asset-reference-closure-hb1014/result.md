# ART — 컷신 asset→loader closure 검증 (작업ID ART-cutscene-asset-reference-closure-hb1014, 2026-10-02)

양판(`game.html`/`game-easy-test.html`)의 `_getCutsceneImg` 로더와 `INTRO_CUTSCENE_LINES`/`PROLOGUE_LINES`가
**실제로 참조하는 이미지**를 추출해, current loader의 `filename→assets/cutscene` 매핑을 그대로 적용하고
**실파일 존재·header 치수·LFS pointer·0바이트·suffix 불일치**를 검사하는 Node validator(`checks.mjs`)를 작성·실행했다.

> **결과 요약: NO-FIX.** 양판 각 **33개 고유 참조 전부**가 승인 경로에 실존하고 header가 정상이며 결손 0.
> 통제군(정상 1·누락 1)으로 validator의 **검출력**을 증명(가짜 counter 아님). 이미지 생성/교체·원화변경·Git·production **0**.
> 파일 존재는 **LOCK 미술 품질 PASS가 아니다** — ART은 asset→loader closure만 소유, STORY 전환타이머/대사 미개입.

---

## 1. 실행 영수증 (evidence — 별도 파일 없이 여기 보존)

| 항목 | 값 |
|---|---|
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0) |
| 실행 UTC / exit | 2026-10-02T10:47Z / **exit 0** (하니스 PASS) |
| `game.html` SHA256 | `8b4653f3f728…` (현재 소스; root WIP로 바뀌는 중 — 이 시점값 고정, HEAD 주장 안 함) |
| `game-easy-test.html` SHA256 | `50f9a24bb11d…` (현재 소스 시점값) |
| `checks.mjs` SHA256 | `f2d76a25fd1063dcaedcb594d3506361ade2e00763cd9ee0c74afdfb752c6e02` |
| 소유 TASK SHA256 | `303f39d1b16e6ecc6ebbbd4126305955450abc5d342aa82bb8f6b2c6d2dbba9d` |
| 제공 parent `6b865637` | 역사적 기준 — current HEAD 아님. Git 조회 0 |
| assertion | **6 PASS / 0 FAIL** |

**추출한 current loader 원문(양판 동일):**
```
img.src=filename.indexOf('/')>=0?'assets/cutscene/'+filename+'?v=20261001-warstills2':'assets/cutscene/images/'+filename+'?v=20260930-intro-lock7';
```
- slash 포함 참조 → `assets/cutscene/<filename>?v=20261001-warstills2`
- slash 없는 참조 → `assets/cutscene/images/<filename>?v=20260930-intro-lock7`
- validator는 이 매핑식을 **원문에서 정규식으로 추출(anchor)** 하고, 독립 매핑 구현과 전 참조에 대해 대조한다. 패턴이 바뀌면 하니스가 실패(숨기지 않음).

---

## 2. 참조 추출 결과

| 파일 | PROLOGUE 참조 | INTRO 참조 | 고유 합 | 결손 |
|---|---|---|---|---|
| game.html | 12 | 21 | **33** | **0** |
| game-easy-test.html | 12 | 21 | **33** | **0** |

- 양판 **loader 버전·참조 집합 동일**(parity 검사 PASS).
- PROLOGUE 12 = `warintro/*.jpg` 12종. INTRO 21 = `00.png`~`20.png` 21종(라인 재사용 포함, 고유 21).

### 2-1. PROLOGUE(warintro) — `assets/cutscene/warintro/*.jpg`
| filename | 존재 | bytes | header | ext일치 |
|---|---|---|---|---|
| cin_war.jpg | ✔ | 437452 | 2048×1152 jpeg | ✔ |
| cin_ruins.jpg | ✔ | 357793 | 1536×1024 jpeg | ✔ |
| cin_throne.jpg | ✔ | 437981 | 2048×1152 jpeg | ✔ |
| cin_bystanders.jpg | ✔ | 419144 | 1536×1024 jpeg | ✔ |
| cin_bloodbath.jpg | ✔ | 466732 | 1536×1024 jpeg | ✔ |
| cin_torture.jpg | ✔ | 372450 | 1536×1024 jpeg | ✔ |
| cin_remember.jpg | ✔ | 315062 | 2048×1152 jpeg | ✔ |
| cin_fallhell_custom.jpg | ✔ | 598626 | 2560×1440 jpeg | ✔ |
| **emg1.jpg** | ✔ | 527153 | 1536×1024 jpeg | ✔ |
| cin_demonbattle.jpg | ✔ | 404264 | 2048×1152 jpeg | ✔ |
| cin_demonfight.jpg | ✔ | 482379 | 1536×1024 jpeg | ✔ |
| cin_nemesia_hd.jpg | ✔ | 261122 | 2048×1152 jpeg | ✔ |

### 2-2. INTRO — `assets/cutscene/images/NN.png` (00~20, 전부 존재·jpeg아닌 png 일치)
- 2048×1152: 00,01,03,04,05,06,07,08,09,10,12,13,14,17,18,19,20
- **1672×941**: 02, 11, 15, 16 (비균일 해상도 — 결손 아님, 치수 기록만). 로더는 COVER draw라 비율 차이는 §별 게임 Gate 소관, closure 자체는 정상.
- 전부 PNG 헤더 정상, LFS pointer/0바이트/suffix 불일치 **0**.

---

## 3. 통제군(control) — 검출력 증명 (가짜 PASS 방지)

| 통제 | filename | 매핑 경로 | 기대 | 관측 | 판정 |
|---|---|---|---|---|---|
| 정상참조 | `warintro/emg1.jpg` | assets/cutscene/warintro/emg1.jpg | defect 0 | defect `[]` | **PASS** |
| 누락참조(메모리 변이) | `warintro/__hb1014_absent__.jpg` | assets/cutscene/warintro/__hb1014_absent__.jpg | MISSING 검출 | `["MISSING"]` | **검출 성공** |

→ validator는 정상은 통과시키고 **없는 파일은 반드시 결손으로 잡는다** = 실제 계약을 검사(always-pass counter 아님).

**memory candidate:** 실결손 0건이므로 리맵 후보 생성 없음(`memoryCandidates=0`). (만약 content/MISSING 결손이 있었다면, 깨진 filename을 **승인·존재 확인된 에셋**으로만 리맵하는 최소 후보를 메모리에서 검증하도록 구현해 둠 — 새 이미지/원화 변경 없이.)

---

## 4. docs 동기화 인계 (root 반영용 — 공유 docs/Git 쓰기 0)

`rg`(1회) 결과:

| canonical 후보 | 현재(old) | 검증값(new/확인) | 조치 |
|---|---|---|---|
| `docs/17게임아트팀/ART_TEAM_MASTER.md` (캐시 쿼리 `?v=20261001-warstills2`) | warstills2 기록 | 라이브 로더 **slash=20261001-warstills2 / noSlash=20260930-intro-lock7** 일치 | 변경 불필요(확인). intro-lock7도 함께 명기 권고 |
| `docs/CHANGELOG_SYNC.md:25570+` | `assets/cutscene/images/1.png…19.png` (단자리·비제로패딩, 과거 목록) | 라이브는 **`00.png`~`20.png`(zero-pad, 21종)** | **불일치(정보성)**: 과거 changelog 명칭 ↔ 현재 파일명. CHANGELOG는 이력 문서라 정정 선택은 root 판단. 라이브 asset이 정본 |
| `docs/cinematic/WARINTRO_STILLS_AUDIT_20261001.md` | emg1 외 12 warintro 목록 | 12 warintro 전부 실존·header 정상 확인 | 상태 "로더 연결 정상" 주석 추가 권고 |

보호 문서 `docs/2_3…` 수정 0, LOCK/TBD/확정수치 보존, 임의 정책확정 0.

---

## 5. 실제품 Gate / 경계

| Gate | 상태 |
|---|---|
| asset→loader closure (이번) | **PASS (NO-FIX)** — 33참조×2파일 실존·header 정상, 통제 검출력 증명 |
| LOCK 미술 품질 / 신원 | **본 과제 아님** — 파일 존재는 미술 PASS 아님. emg1 얼굴 등은 이전 KEEP-HOLD/UNKNOWN 유지 |
| 실게임 COVER/카메라/자막/GPU/native/배포 | **미수행(0)** — source/fixture PASS를 실게임 PASS로 치환 안 함 |
| 비균일 INTRO png(02/11/15/16 = 1672×941) | closure 정상. 실게임 COVER상 비율 거동은 별도 Gate |

`productionApplied=false`, `runtimeAccepted=false`. 원본/후보 연결 변경 0.

---

## 6. 완료 체크
- ✅ 실제 소스 함수 전체(로더 매핑 원문 + 두 라인배열 brace-match)로 참조 재현, 독립 매핑과 대조.
- ✅ 실파일 존재/header/LFS/0바이트/suffix 검사, 통제군(정상·누락)으로 검출력 증명(PASS0 금지 준수).
- ✅ 새 파일은 **result.md + checks.mjs 2개만**, evidence는 result 내 보존. 이전 검사/지시 재실행 0.
- ✅ Git 조회 0, 이미지 생성/교체 0, production 0, 자체 다음건 배정 0.
- ✅ no-fix 결과여도 primary validator 코드 완성(§1 exit 0) + 실근거 보고.
- ✅ source byte가 root WIP로 변해도 owned anchor(정규식 추출)만 고정, 원소스 변경 0.
