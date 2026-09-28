# 기동불꽃 광량과 잔광 검수

| 검증 (2026-09-29) | 결과 |
|---|---|
| 회귀 검사 | chainDriveImpactVfx / zoneLightClassification / gameHtmlInlineSyntax / vfxGlInstancing: 10개 PASS |
| 실제 게임 | 분리 로컬 origin에서 Shift → 우클릭으로 착지. Lv10 반경 405, maxT 300 유지; alpha .5 / speed 4 / 섬광 .6 확인 |
| 잔광 종료 | 장판 나이 24f에서 프리셋 7 광원 0개, 장판은 활성. 실제 배경과 임팩트의 밝은 3번째 프레임 육안 확인 |

수치 및 적용 계약: [사슬기동 착지 임팩트](사슬기동_착지임팩트_실사시트_20260904.md). 검수 중 초기화 전 조작으로 검수 탭이 지연되어 새로 초기화된 게임에서 재검증했다. 사용자 기본 origin의 저장 데이터를 수정하지 않았다.
