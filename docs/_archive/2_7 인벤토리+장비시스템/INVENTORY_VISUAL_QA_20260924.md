# 인벤토리 시각 QA — 2026-09-24

## 범위

기존 전체화면 인벤토리의 장비 겹침·잘림과 월드 HUD 노출을 수정했다. 기존 Higgsfield 인체도 에셋을 재사용했다. 사용자 레퍼런스 원본은 이번 대화에 없고 파일 검색에서도 확인하지 못해 재첨부를 요청했다. 따라서 레퍼런스와의 직접 일치 검증은 미완료이며, 임의 아트 생성 없이 기존 구조의 표시 문제를 보정했다.

## 실제 게임 확인

`http://localhost:3333/game.html?test=1&testchar=0`의 실제 게임에서 설정→인벤토리 탭을 직접 클릭했다. 테스트 캐릭터의 기존 장착 장비를 사용했으며 장비 수치·저장 형식은 변경하지 않았다.

| 항목 | 결과 |
|---|---|
| 수정 전 1920×959 | 1.62배 고정 확대에 의해 부츠와 전신 하단이 잘림, 장비 소켓 겹침, 배지 HUD 노출 |
| 수정 후 1920×959 | 전신·15개 소켓·가방·창고 표시. 배율은 공간 기준이며 슬롯 겹침/영역 밖 소켓0개 |
| 수정 후 1280×720 | 소켓 약54.66px. 전신·가방·창고 함께 표시, 장비 선택 시 우측 상세를 스크롤 가능 |
| 수정 후 900×800 | 세로 스택, 전체 패널 스크롤로 가방·전대·창고 접근 확인. 선택 상세는 우측 오버레이 |
| 인벤토리 HUD | petSubtitle/hud/hudCorner/globeHP/globeMP/skBar/hudTop/tutorialBadgeButton 모두 display:none 확인 |
| 닫기 | ESC로 닫은 뒤 petSubtitle/globeHP/skBar/tutorialBadgeButton 표시 복원 확인 |
| 이미지 | RGBA1664×2560, alpha0~255, 모서리alpha0. 새 API 호출 없음 |
| 회귀 | inventoryPaperdollLayout.test.cjs: 수정 전2개 실패, 수정 후2개 통과 |

## 증거

`output/inventory_visual_qa_20260924/`:

- `before-1920.png`: 수정 전 잘림·겹침
- `after-1920.png`: 최종 기본 해상도
- `after-1280.png`: 720p 전체 화면
- `detail-1280.png`: 장비 상세
- `after-900-top.png`, `after-900-storage.png`: 작은 화면 스택·스크롤

**시각 판정:** 기존 구현의 잘림·겹침·HUD 노출 보정 PASS. 사용자 레퍼런스와의 최종 디자인 일치 판정은 원본 미제공으로 보류.
