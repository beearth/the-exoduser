# 패드 전환 시 하단 스킬바 키캡 복구 — 2026-09-10

| 항목 | 원인 / 현행 계약 |
|---|---|
| 사용자 증상 | 패드 모드로 전환해도 스킬바 하단에1/2/3/4/F/Z/LMB/RMB/Shift/E/Q/Ctrl/Space 표시가 남음 |
| 원인 | `_updateSkBarKeyLabels`가 패드만 구 y=56px에 렌더하고 배경 아트 키보드 글자를 덮지 않음. 현재 하단 키보드 행은 y=121px |
| 수정 | `#skKeyBar` top121px/height18px, 모든 패드13개 키캡도 top121px, width37px/height18px/line-height18px. 배경 그라데이션 #29231f→#17130f, 패드 .5rem/KBM .55rem |
| 표시 맵 | LT+A, LT+B, LT+Y, LT+X, LT, RT, A, RS, LB, X, Y, RB, B. `_SK_SLOTS` 순서. LT+Y=Digit3, LT+X=Digit4는 기존 `_pollGamepad`의 `_LT_COMBO`와 일치하며 입력 변경 없음 |
| 키보드 복귀 | 패드13개 키캡을 제거하고 기존 RMB/E 두 리바인딩 키캡만 유지 |
| 캐시 | 모드 및 BINDS.shield/BINDS.beam을 비교, 동일하면 DOM 유지. 행이 없을 때는 캐시를 갱신하지 않아 재생성 후 복구 가능 |
| DOM | 새 리프 노드에만 textContent 설정, fragment + replaceChildren. 슬롯 아이콘/쿨다운 DOM 유지 |
| 회귀 | `test/skillBarGamepadDisplay.test.js` 3건 + `test/skillBarBindingLabels.test.js` 2건 PASS. 수정 전 위치56≠121과 행 지연 생성0≠13 실패 재현 |
| 실제 런타임 | server.cjs:3333의 게임을 별도 Chrome 컨텍스트에서 실행. 모의 Gamepad API 스틱 입력→실제 `_pollGamepad`→패드13개 라벨, 실제 KeyboardEvent→KBM2개 복귀 PASS. 슬롯 API 격리·저장 차단. `tmp/pad_hud_20260910/report.json`, pad.png/keyboard.png 육안 확인 |
| 문서 정정 | 매핑표·가이드 이미지 프롬프트의 구 LT+X=3/LT+Y=4를 실제 코드 Y=3/X=4로 일치시킴 |
| 백업 | `tmp/game.before-pad-keycaps-20260910.html`, `tmp/skillBarBindingLabels.before-pad-20260910.test.js` |

물리 컨트롤러/Steam 배포 검증은 이 로컬 회귀와 별개다. 보호된 돌진·패링 설계 문서는 변경하지 않는다.
