# ART-WA24-DELTA-CANDIDATE 결과 — 관측기 실제차이/미관측 분류 + 크롭 결함 패치

- 담당: ART / 터미널 2 (세션 `a489cbeb…` 연속). 기준 HEAD `30a204a7` 유지, Git 변경·커밋 없음.
- 중복 점검: `ART-next-*` 산출 없음 → 신규 착수(중복대기/진행중 아님).
- **기존 35PASS 보고(ART-WA24-PROBE-FIX)는 반복하지 않음.** 본 건은 신규 차원(크롭/자막/전환)과 시간축 결함을 다룬다.
- 근거: `game.html`(HEAD 30a204a7) 컷신 렌더 블록 직접 Read(라인 번호는 아래 표).
- 산출(소유 `tools/team-followup-20261001/ART/`):
  - `wa24-delta-probe.cjs` SHA256 `79193e10228007bfce1935c633156a208b719d6540b4b3b45b4889d32a1936e9`
  - `wa24-delta-probe.test.mjs` SHA256 `35ff1e1efabe83fff1e6d4ab6fb35ea82075442291a61c001e1d80cb4c589839`

## 1. 실제차이 / 미관측 분류 (판정표)

| 차원 | 엔진 진실(game.html) | 관측기/후보 현재 | 관측 가능성 | 판정 |
|---|---|---|---|---|
| **active-cut 축** | `_cutLineIdx`+`_cutLineStartMs` 기반(`:60713-60733`). `ln.t`는 보이스 동기 전용(`:60755`) | `_cutsceneStartMs + t` 기반 | 라인-인덱스 전역 읽기로 **정확 관측 가능** | **❌ 실제 버그(드리프트)** — zoom/shake/fade/경계 샘플이 엔진 실제값과 어긋남 |
| **crop** | 레터박스(16:9 클램프, `:60742-60746`) + cover(`:60796-60801`). wa24 imgR=16/9라 콘텐츠박스 cR≤16/9 → **좌우컷 분기만** | 미구현(관측 안 함) | 순수 함수로 **완전 결정적** | ⚠️ 미완료 → **본 건에서 패치+회귀 구현** |
| **transition(fade)** | `lineElapsed` 기반 fade-from-black(`:60767-60773`). 매 프레임 흑색 클리어(`:60749`) → "cross"는 명목, 실제 흑→현재컷 페이드인 | 경계 마크만, fade 값 미산출 | 라인축만 맞추면 **결정적** | ⚠️ active-cut 축 결함에 종속 → corrected 샘플러로 해소 |
| **subtitle 기하(위치·색·shake독립)** | 나레이션 경로(`:60810-60843`), shake는 이미지 save/restore 내부에만(`:60779-60802`) | source inference `applied:false` | 소스 상수로 **계산 가능** | ✅ 검증(추론 아님) |
| **subtitle 시각 가독성** | 하단 계단 대비·잘림·겹침 = 픽셀 결과 | — | **픽셀 렌더 필요** | 🔶 **UNKNOWN**(거짓 PASS 방지 fixture 구현) |

> 소스 근거: letterbox `:60742-60746` / cover `:60796-60801` / fade `:60767-60773` / active-cut `:60713-60733` / shake `:60627`(정수 ±2) / ease `:60313`(out=1-(1-t)²) / narration `:60810-60843`. wa24 라인 `:60343`(col 미지정 확인).

## 2. "가장 큰 미완료 결함 한 건" 선정과 패치

- **가장 심각(근본원인)**: active-cut **시간축 불일치**. → 전환·줌·흔들림·fade 전 샘플을 오염시키는 실제 버그. corrected 샘플러로 수정식을 제공하고 회귀로 증명.
- **가장 큰 미완료 "크롭" 결함(명시 지정 범위 + 완전 결정적·브라우저 불요)**: wa24 크롭 예측기를 신규 구현. 뷰포트 AR별 레터박스+cover 컷을 엔진식 그대로 계산해 판정.
- **근거 부족 차원(자막 시각)**: `subtitleVisualVerdict`가 픽셀 증거 없으면 **UNKNOWN** 반환(PASS 전 필요조건 명시).

### 제출 함수(모두 읽기 전용·순수, 상태 변경 0)

`predictLetterbox` · `predictCover` · `predictWa24Crop`(판정 OK_FULLFRAME/CROP_SIDE_*/CROP_TB_*) · `fadeAlpha` · `zoomAt` · `correctedSampler`(엔진축 수정) · `legacySampler`(드리프트 증명) · `subtitleGeometry` · `subtitleVisualVerdict`(UNKNOWN).

## 3. 회귀 결과 (실행 명령·exit)

```
node --check tools/team-followup-20261001/ART/wa24-delta-probe.cjs      # OK
node --check tools/team-followup-20261001/ART/wa24-delta-probe.test.mjs # OK
node tools/team-followup-20261001/ART/wa24-delta-probe.test.mjs         # exit=0 → 38 PASS / 0 FAIL
```

- 환경: Node v24.15.0 / macOS Darwin 25.6.0.
- **[A] 크롭 판정표(원자료, 실측 출력):**

| 뷰포트 | viewAR | 레터박스 | 컷 축 | 좌우 컷% | 판정 |
|---|---|---|---|---|---|
| 1920×1080 (16:9) | 1.778 | 없음 | — | 0% | `OK_FULLFRAME` |
| 2560×1080 (21:9) | 2.370 | 있음(cw1920) | — | 0%(이미지 full) | `OK_FULLFRAME` |
| 1920×1200 (16:10) | 1.600 | 없음 | 좌우 | 10.0% | `CROP_SIDE_MINOR` |
| 1024×768 (4:3) | 1.333 | 없음 | 좌우 | 25.0% | `CROP_SIDE_MAJOR` |

  → **발견: wa24는 상하컷이 구조적으로 불가(콘텐츠박스≤16:9), 좌우컷만 발생.** 상단 지옥문 눈·하단 계단/전사 발은 어떤 AR에서도 보존. 4:3 등 비16:9 창에서 **좌우 첨탑 폭이 최대 25%까지 손실**(중앙 전사는 안전). (ART-팀검토의 "상하 손실" 서술은 부정확 → 좌우 손실이 맞음. §5 docs 정정 후보.)
- **[B] 시간축 드리프트(핵심 증명):** drift 0 → 두 축 일치(공정성). drift 600ms → 같은 wa24라도 `lineElapsed` corrected=200 vs legacy=800, `fadeAlpha` 0.5 vs 1.0, `zoom` 1.0736 vs 1.0578. drift 1800ms → **legacy가 wa25로 오판정**(엔진은 wa24 재생 중).
- **[C] fade 곡선:** le 0/200/400/1200/2400 → 0/0.5/1/1/1 (fade.out 없음).
- **[D] 자막:** 색 `#d8d4cc`(뼈색, col 미지정), y=ch*0.88, shake 미적용(소스 검증), 시각 가독성 UNKNOWN.

## 4. 실행하지 않은 항목 / 남은 게이트

- **실제 브라우저/게임 렌더 미실행.** 크롭·fade·zoom 예측은 엔진 수식 기반 정적 예측이며, 실제 화면 1x 픽셀 검수(자막 가독성·점 유무·전환 깜빡임)는 **QA 종료 인계 후** 수행(게임/브라우저/서버 실행 금지 게이트). `subtitleVisualVerdict`는 그때까지 UNKNOWN.
- **production game.html 미수정**(읽기만). `wa24-observer.cjs`도 미변경 — 아래 머지 권고만 남김.
- Git add/commit/push·이미지생성·인코딩·대형빌드·새세션 없음. 타팀/공용 파일 미수정.

## 5. 인계 / docs·관측기 정정 후보 (총괄 통합용 — 공유 파일 직접 편집 안 함)

1. **관측기 머지 권고**: `wa24-observer.cjs`의 `activeCut(e=now-_cutsceneStartMs)` 샘플링을 `correctedSampler`(라인-인덱스 축)로 교체. 현재 관측기는 드리프트 시 wa24 경계/zoom/shake 샘플을 엔진과 다르게 보고할 수 있음. (본 세션은 독립 모듈로 분리 제출, 머지는 통합 담당 판단.)
2. **docs 정정 후보**(수치/서술 교정, 본 세션 미편집):
   - `.../ui03-evidence/ART-팀검토.md` 및 `MAP-ART-인수검토.md` — wa24 비16:9 크롭은 "상하 손실"이 아니라 **"좌우 손실(좌우 첨탑 폭)"**. 상하는 구조적 무크롭.
   - fade 서술 "크로스페이드" → 실제는 **라인별 fade-from-black**(매 프레임 흑색 클리어 후 현재 컷 페이드인). 전/후 컷 블렌딩 아님.
3. **다음 잔여 게이트(소유권 밖, 미실행)**: QA 종료 인계 후 실브라우저에서 (a) 좌우 크롭 실측(타깃 해상도별 첨탑 가시성), (b) 자막 가독성 UNKNOWN 해소, (c) corrected 샘플러 적용 관측기로 wa24 verdict 실측. 본 세션 종료.
