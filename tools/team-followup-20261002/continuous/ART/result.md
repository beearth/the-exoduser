# ART 후속 — 컷신 COVER 이미지 실패 시 배경 fallback source 심사 (2026-10-02)

컷신 COVER 렌더 경로에서 이미지가 **실패/미유효**일 때 배경 처리가 안전한지 **source만으로** 인수 심사했다.
실게임 실행·camera QA·시각 PASS·에셋 생성/채택/교체·생산 적용·Git·새 fixture **전부 0**. 소유 2파일(`result.md`, `evidence.json`)만 작성.
기존 55건(claude-native-6) / 19건(project-teams) 검사 **재실행·합산 0**.

---

## 1. 현재 source 전표 (이번 세션 직접 Read, fresh SHA)

| 파일 | SHA256(현재) | 비고 |
|---|---|---|
| `game.html` | `2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94` | **직전 ART 과제 기록 `30ae8544…`와 다름** → 총괄이 UI 카드수명 가드(commit `7e69495046…`, COMMON 제공)를 순차 통합한 시점. 본 세션은 git 조회·독립 HEAD 관측 안 함, 제공 commit 출처만 기록 |
| `game-easy-test.html` | `3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a` | 직전 `9c7c25c1…`와 다름(동일 통합 영향 추정, git 미확인) |
| `assets/cutscene/warintro/emg1.jpg` | `96e5e41900c60292488bb4cd3a2becf2e98297e522143177143f0be3b31fabf1` | 1536×1024(3:2), 527153B — 기존 검수기록과 **불변** |
| `docs/11…/assets/warrior_identity_ref.png` | `3bbde9d07e9a88d0b849ef6913a3f2c78ccca57e412461f206864c788c5c7868` | 940×544, 325568B — 불변 |
| `docs/11…/assets/warrior_face_ref.png` | `b8aae22efd571298731ebee12061ef9b76ce4542e3c816af97a99d15347f0648` | 410×484, 229493B — 불변 |
| `assets/charselect/warrior_cut.png` | `58e68f5f996c31966e9109c2de421185d93d138cec4fd5600da0ca1b58debfd4` | 1223×986, 1670346B — 불변 |

**실제 심볼/행(현재 game.html):** `_cutsceneImgCache={}`(60810) · `_getCutsceneImg`(60822–60830) · `_renderIntroCutscene`(60925) · 캔버스 #000 clear(60970) · 레터박스 clip(60971) · getter 호출(60998) · **유효성 gate `if(img&&img.complete&&img.naturalWidth>0)`(60999)** · cover 산식 `imgR=img.naturalWidth/img.naturalHeight`(61017) / `dh=cw/imgR`(61021) / `drawImage`(61022).
쉬운판 game-easy-test.html: cache(59134) · getter(59146–59153) · #000 clear(59303) · gate(59332) · imgR(59350) — **구조·가드 바이트 동일**.

---

## 2. 실패/유효성 분기 × 배경 선택 표 (source 근거)

렌더 1프레임 순서: ①state guard return(60926) ②`ln.exit`→검정 페이드 return(60939–60947) ③무대사 컷 자동진행(60953) ④캔버스 sync·display(60958–60960) ⑤**전체 #000 fillRect clear(60970)** ⑥레터박스 clip+translate(60971) ⑦getter(60998) ⑧**유효성 gate(60999)** ⑨gate 통과 시에만 cover drawImage(61017–61022) ⑩grade/vignette(cw·ch 사용, img 무관) ⑪자막/나레이션(img 무관).

| # | 상태 | 실제 조건 | caller/분기 | 그리는·지우는 순서 → 배경 | 다음 프레임 상태 | 근거 행 |
|---|---|---|---|---|---|---|
| S1 | 정상 | `complete && naturalWidth>0` | 60999 = true | #000 clear → clip → **cover drawImage** | 동일, 계속 정상 | 60970,60999,61022 |
| S2 | pending(로드 중) | `complete===false` | 60999 = false → draw 스킵 | #000 clear만 → **검은 배경 + 자막** | 로드 완료 시 자동 S1 | 60999 |
| S3 | 빈 이미지 | `complete===true, naturalWidth===0` | 60999 = false → 스킵 | #000 clear만 | 캐시 동일 객체 → 계속 S3 | 60999,60824 |
| S4 | onerror(404/디코드 실패) | 실패 후 `complete===true, naturalWidth===0`. **onerror/onload 핸들러 없음**, `decode().catch` 무음 | 60999 = false → 스킵 | #000 clear만, **crash/NaN 없음** | 실패 Image 캐시 유지 | 60822–60830,60999 |
| S5 | 캐시 실패 엔트리 재사용 | `_cutsceneImgCache[filename]` 가 실패 Image 반환 | 60824 조기 반환 → 재요청 없음 | 60999 계속 false | 해당 파일 **세션 내내 검은 배경** | 60824 |
| S6 | 다음 cue 재진입 | `_cutLineIdx++` 후 다른 `ln.img` | 60998 새 파일로 getter | cue별 독립 gate | cue 독립 처리 | 60954,60998 |

---

## 3. 판정 — 확보된 guard / 변경 필요 여부

**변경 불필요(기본 판정).** 실패/미유효 이미지가 ①`drawImage`·COVER 나눗셈에 들어가거나 ②직전 배경을 오염시키는 실제 경로는 **없다**.

- **Divide-by-zero 차단:** `imgR=naturalWidth/naturalHeight`(61017)와 `dh=cw/imgR`(61021)는 전부 gate(60999) **안쪽**. `naturalWidth===0`이면 gate가 false라 cover 산식 자체가 실행되지 않음 → `imgR=0`/`dh=Infinity` 불가. **확보된 guard.**
- **"기존 배경 유지"의 실제 의미:** 이 오버레이 캔버스는 매 프레임 `#000` fillRect(60970)로 **전체 clear**된다. 따라서 실패 시 "직전 이미지 잔상"이 남는 게 아니라 **검은 배경 + 자막/나레이션**이 fallback이다 — stale frame·잔상 오염 경로 **없음**. 이는 의도된 clear-per-frame 설계.
- **crash 차단:** onerror 미처리이나 실패 Image는 `complete=true,naturalWidth=0`가 되어 gate가 걸러내므로 예외/검은틀 깨짐 없이 조용히 스킵.
- **상상 FAIL 금지 준수:** source에 없는 전이는 넣지 않음. 위 표의 모든 전이는 실제 행에 연결됨.

**최소 후보:** 제안하지 않음. 유일한 아쉬운 지점은 S5(실패가 영구 캐시되어 네트워크 일시 실패 시 해당 컷이 세션 내내 검은 배경)인데, 해소하려면 `onerror`에서 `delete _cutsceneImgCache[filename]` 같은 **재시도/캐시 폐기 정책 추가**가 필요하다. TASK가 "재시도·캐시 폐기 정책을 임의로 추가하지 않는다"고 명시하므로 **코드 후보를 제시하지 않고 아래 UNKNOWN으로만 남긴다.**

### 남는 runtime UNKNOWN (source로 확정 불가)
- S5 영구 검은 배경이 실제 네트워크 일시 실패에서 발생/지속되는지 — 실게임 미실행.
- 검은 배경 + 자막 상태의 **가독성/연출 허용 여부**(검은 화면에 자막만) — 시각 검수 미실시.
- 정상 COVER 동작 불변 근거: cover 분기/산식(61017–61022)·gate(60999)·#000 clear(60970)는 이번 통합(SHA 변경)에도 **문구 동일** 확인 → 정상 경로 거동 불변. 단 GPU/실프레임 PASS는 주장하지 않음.

---

## 4. emg1 원본·후보 상태 + LOCK (기술 실패 처리와 **분리**)

> 본 §은 "이미지 로드 실패 처리"(§2–3)와 무관한 **아트 채택** 축이다. 혼동 금지.

| 항목 | 현재 상태 | 근거 |
|---|---|---|
| emg1 원본 채택 | **원본 유지 · 채택 보류** (교체 안 됨) | `ART_TEAM_MASTER.md:114,224`, `WARINTRO_STILLS_AUDIT_20261001.md:84,93` |
| emg1.jpg 경로/해시 | `assets/cutscene/warintro/emg1.jpg`, SHA `96e5e419…`, 1536×1024 3:2 — 불변 | §1 |
| 후보 파일 | `output/cutscene_remaster_20260930/warintro_candidates_unreviewed/`의 `emg1_candidate1_rejected.jpg`(불채택)·`emg1_candidate2_retry.jpg`(미검수) — **채택 원본 아님** | `ART_TEAM_MASTER.md:207,214` |
| 로더 참조 | `_getCutsceneImg`가 `'assets/cutscene/'+filename+'?v=20261001-warstills2'`(60826)로 **원본 emg1** 로드. 후보 폴더는 코드 미연결 | 60826 |
| 전사 캐릭터/얼굴/방어구 LOCK | **UNKNOWN 유지** — 이번 세션 새 시각 검수 0. LOCK 참조 에셋(identity/face/cut) SHA 전부 불변 | §1, `WARRIOR_DESIGN_LOCK.md` |

---

## 5. docs 반영 제안 (총괄 순차 반영용 — 공유 docs 직접 쓰기 0)

rg 검색 결과 컷신 이미지 **로드 실패 fallback 거동**을 명시한 canonical 문서가 없다(기존 문서는 cover 구도/채택만 다룸).

| canonical 문서 | section | 제안 문안(수치/심볼 정확) |
|---|---|---|
| `docs/cinematic/WARINTRO_STILLS_AUDIT_20261001.md` | "렌더 영향"(25행) 아래 **신규 행 "로드 실패 fallback"** | "`_renderIntroCutscene`는 매 프레임 `#000` 전체 clear(game.html:60970) 후, `if(img&&img.complete&&img.naturalWidth>0)`(60999) 통과 시에만 cover drawImage(61022). 실패/미유효(pending·naturalWidth0·onerror) 이미지는 gate에서 스킵 → 배경은 검정+자막, divide-by-zero(imgR=naturalWidth/…) 없음. `_getCutsceneImg`(60822)는 onerror 미처리·실패 Image 영구 캐시 → 해당 컷은 세션 내 검은 배경 지속(재시도 정책 미도입). 쉬운판 game-easy-test.html 59303/59332/59350 동일." |
| `docs/17게임아트팀/ART_TEAM_MASTER.md` | emg1 행(114/224)에 각주 | "emg1 기술 로드 실패 시에도 crash 없음(gate 60999). 아트 채택은 별건으로 원본 유지·2차 후보 미검수 유지." |

(보호 문서 `WARRIOR_DESIGN_LOCK.md`·`docs/2_3…` 변경 없음. 본 세션은 제안 문안만 인계, 직접 기록 0.)

---

## 6. 완료 Gate 체크

- ✅ 실제 실패/유효성 분기(S1–S6)와 caller(60998/60999/60824) 근거 연결.
- ✅ 기존 55/19건 재실행 0, 새 fixture 작성/실행 0, 에셋 생성/채택/교체 0, 생산 적용 0.
- ✅ camera/실게임 시각 PASS 주장 0. 원본 얼굴 LOCK 등 새 확인 없는 항목 UNKNOWN 유지.
- ✅ source SHA 시점 구분(현재 `2e45ee0e…` ≠ 직전 `30ae8544…`), git 독립 관측 안 함.
