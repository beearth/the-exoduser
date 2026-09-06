# ENTER 철제 버튼 — 2026-09-06 적용

> 과거 구현 기록. 2026-09-07부터 [흑백 판화형 ENTER](ENTER_ENGRAVED_20260907.md)로 대체됐다. 아래 금속 에셋·크로마키 로더는 파일만 보존하고 현재 index.html에서 로드하지 않는다.

문 배경·영상·클릭 동작은 유지하고 버튼 이미지에만 적용했다. 프런트엔드 디자인 지침에 따라 은색 글자와 검붉은 판의 대비를 확보했으며, imagegen 내장 도구로 기존 후보의 배경을 편집했다.

| 항목 | 구현 계약 |
|---|---|
| 적용 위치 | `index.html`, `.cin-enter-btn` |
| 로더 | `cin-enter-art.js?v=20260906-forged-v1` |
| 원본 | `img/cin_enter_forged_green_v1.png?v=20260906` |
| 완료 표식 | `data-art="forged-v1"` |
| 투명화 | `neutral=max(R,B)`, `excess=G-neutral`; excess>18일 때 alpha=`round(255*(1-min(1,(excess-18)/64)))` |
| 녹색 테두리 제거 | 위 조건에서 G=`min(G,neutral+4)` |
| 처리 시점 | 원본 로드 후 canvas에서 한 번 처리, PNG data URL 디코딩 완료 후 src 교체 |
| 실패·로딩 중 | 기존 `img/cin_enter_plate.png?v=2` 유지. 녹색 원본은 DOM에 직접 표시하지 않음 |
| 배치 | left 53.5%, top 64%, translate(-50%,-50%), width min(50%,600px) |
| 맥동·클릭 | 기존 cinEnterPulse 2.8s와 클릭 핸들러 유지 |
| 검증 | 로컬 Node 서버 3333, Chromium 1440×900. 실제 로더 완료 확인, 녹색·체크무늬 없음. 클릭 후 promptHidden=true, pageerror=[] |
| 검증 화면 | `tmp/enter_remodel_ingame_test.png` |

## 최종 이미지 편집 프롬프트

내장 imagegen 모드, 기존 ENTER 후보를 입력 이미지로 사용:

> Edit only background of this ENTER game button. Replace every white/gray checkerboard area with perfectly flat pure green RGB(0,255,0) chroma-key background, including holes in chains and around ornament. Preserve exact ENTER text and all black/silver metal, red inset and demon head. No green on object, no green reflections, no checkerboard, no gradients in background. This is an opaque green-screen production asset, not transparency. Keep same composition and size.
