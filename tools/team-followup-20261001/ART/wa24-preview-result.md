# ART-20261002-WA24-PREVIEW 결과 — wa23/24/25 독립 컷 미리보기 HTML

- 담당: ART / 터미널 2 (세션 `a489cbeb…` 연속). 기준 HEAD `30a204a7` 유지, Git 변경·커밋 없음.
- 중복 점검: `wa24-preview-task.md` 외 산출 없음 → 신규 착수. 입력초안 없음. 한 건만 진행.
- 실제 시각(UTC): 수신/첫Read 16:12:51Z · 첫Edit/착수 16:13:30Z · 검수 16:16:28Z · 완료 16:16:28Z (`wa24-preview-receipt.json`).

## 1. 산출물 (소유 `tools/team-followup-20261001/ART/wa24-preview/`)

| 파일 | SHA256 | 내용 |
|---|---|---|
| `wa24-preview/index.html` | `40bb3e1e774d8e2836b143903147e57ad3ec070fc956e572a3b0eca5317b040f` | 독립 컷 미리보기(읽기 전용 진단). 실제 원화 로드 + 엔진 변환 재현 + canonical 대조 + 3시점/뷰포트 버튼 + 실좌표/해상도 표시 |
| `wa24-preview/selfcheck.mjs` | `2cf82ce2a0532cea182af65ae0f7a12096f3899b4fd347da6c7ec1d1985083c5` | 미리보기 인라인 수식 ↔ canonical ↔ 실엔진 draw 1e-11 대조(브라우저 없이) |

## 2. 기능 (요구 충족)

- **실제 원화 사용**: `assets/cutscene/warintro/cin_remember.jpg`(wa23, 315062B), `cin_fallhell_custom.jpg`(wa24, 598626B), wa25=`img:null`→블랙. **read-only**(생성/다운로드/인코딩 0). 엔진 실제 로더 URL(`?v=20261001-warstills2`)은 정보로 표시, 로컬 로드는 쿼리 생략(file:// 호환). `?assets=` 로 경로 override 가능.
- **엔진 변환 재현**: clip→zoom(Ken Burns)→shake→cover→fade→vignette→나레이션을 game.html:60737-60807 그대로 캔버스에 그린다. `_cutShake`(:60627, 정수 ±2)·`_ease`(:60313)·fade(:60769-60773) 복제. wa24 `col` 미지정 → 뼈색 `#d8d4cc` 나레이션.
- **canonical 대조**: `wa24-finalcrop.mjs`(predictFinalCrop)의 crop 분수 공식을 **인라인 포팅**(브라우저 .cjs 혼용 회피)해, 엔진 실측 drawRect→분수와 대조하여 "일치(Δ=…)" 표시. 붉은 오버레이로 잘리는 원화 영역 시각화.
- **wa24 진입/중간/출구 3고정 버튼**: el=400 / 1200 / 2399ms. 추가로 wa23·wa25(블랙) 버튼, 뷰포트비 4종(16:9·21:9·16:10·4:3), 크롭 가이드/ fade 토글.
- **캔버스 실좌표/이미지 해상도 표시**: 뷰포트 실픽셀·AR, 캔버스 logical, 레터박스 콘텐츠박스(cw×ch,lb), 이미지 naturalW×H, zoom, shake(x,y), fadeAlpha, drawRect(클립좌표), 크롭 분수(엔진/canonical), 기하 판정.
- **새 관측기 아님**: 기존 관측기/엔진 상태 변경 없음. 순수 표시.

## 3. 검사 (실제 실행)

```
node tools/team-followup-20261001/ART/wa24-preview/selfcheck.mjs   # 13 PASS / 0 FAIL / exit=0
HTML inline <script> node --check                                   # OK (구문)
```

- **selfcheck 13 PASS**: 미리보기 인라인 수식(`canonicalFinal`, `engineFractions`) 이 4비율×3시점(12행)에서 root canonical `predictFinalCrop` **및** 실제 game.html draw 원문(UIUX fixture `actualDraw`)과 **1e-11 일치**. → 미리보기가 표시하는 crop/zoom/shake/fade 숫자가 실엔진·canonical과 동일함을 브라우저 없이 보증.
- 환경: Node v24.15.0 / Darwin 25.6.0. 게임/브라우저/서버 미실행.

## 4. 한계 / 실행하지 않은 항목

- **native 실화면 인수는 root.** 본 세션은 브라우저로 HTML 을 열지 않았다(사용자 게임 입력/리로드/닫기/계측 0). 실제 렌더 1x 화면 검수·픽셀 가독성(눈·발·자막)은 root 가 수행 — **실제 컷신 PASS 아님**, 미리보기는 기하/변환까지.
- **눈/발/자막 가독성 UNKNOWN 유지**(패널에 명시). canonical 과 동일.
- production `game.html`·`index`·`easy`·`server`·공유 docs·타팀 파일 미변경. 원화 에셋 read-only. 원 파일 before 보존(신규 파일만 생성). Git/queue/새세션/새에이전트/이미지생성/동영상인코딩/엔진상태변경/생산영상교체 0.

## 5. 인계 (소유폴더 기록)

1. **root native 인수 절차**: `wa24-preview/index.html` 을 로컬 서버(기존 3340/별 origin) 또는 file:// 로 열어, wa24 진입/중간/출구 3버튼 × 뷰포트 4종에서 실제 원화 크롭/줌/흔들림/페이드와 자막 가독성을 1x로 확인. selfcheck 로 숫자 정합은 이미 보증됨.
2. **다음 잔여 게이트**: 픽셀 가독성 UNKNOWN 해소(실화면), 실제 컷신 재생 PASS(QA 종료 인계 후). 본 한 건 종료, 인계.
