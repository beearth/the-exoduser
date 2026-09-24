# CH1-1 전체 구도 비교 — MASTER STUDY 01

> **최신 QA 적용:** [Rootworld blockout2](ROOTWORLD_BLOCKOUT_20260924.md). `20260924-blockout-2`는 stage0 QA 전용 34점 외곽/12점 중앙 질량과 서·동 양방향 동선을 사용한다. 템플릿 통행 13396칸, 나무 `(102.5,112.5)`, 북측 gate y5/exit y7, 시각 gate clearance x88~112/y2~35. 아래 이전 수치·미적용 설명은 당시 이력이며 본편 LOCK은 변경하지 않는다.

> 상태: GATE 1 재작업 / 설계안만 작성 / 런타임 변경 없음 / VISUAL VERDICT: RETOUCH

## 비교 산출물과 데이터 계약

| 항목 | 현행 내용 |
|---|---|
| 보드 | `http://127.0.0.1:3334/tools/rootworld-master-board.html` |
| 원화 | `assets/map/ch1/rottenwood_field_rootworld_master_v2.png` 그대로 표시; 신규 원화/편집 없음 |
| 생성기 | `tools/build_rootworld_master_board.mjs`; 현재 game.html의 `_rleEncodeGrid` / `_buildDiabloField` 함수만 추출해 stage0, 200×200 실행 |
| 현재 구조 | 템플릿 NAV 회색 표시 + 기존 `rootworld_outer/preview.png`; 실제 게임의 전체 렌더 캡처가 아님 |
| 템플릿 통행 칸 | 17071 / 40000; 품질 목표 비율이 아닌 현재 진단값 |
| NAV SHA256 | `0e57fc87cee2eb6dadbbd4c0e0382afff6c6fc0ecbbd60ff9d3b24d0abde8b59` |
| 제외 항목 | engine gate 후처리, 소환굴, 오브젝트 충돌; 도면으로 실제 통행 보증하지 않음 |
| 우측 도면 | 200×200 설계 좌표에 그린 SVG 구상; 충돌/NAV/최종 아트가 아니며 본편·QA 모두 미적용 |
| 하단 카메라 | `captures/rootworld_outer_20260924/01_START.png` ~ `08_EXIT.png`; 이전 패스 1280×720 순간이동 증거이며 재촬영/종주 증거 아님 |
| 보드 검증 | `tools/qa_rootworld_master_board.py`; 누락 페이지 RED 확인 후 GREEN. SVG 2개, 현재 NAV path, 미적용 표기, 카메라 8개, 모든 이미지 로딩, JS 오류 없음, 800px 폭 overflow 없음 |
| 보드 캡처 | `captures/rootworld_master_20260924/whole-map-board.png`; 1600×1100 viewport + fullPage |

## 전체 구성 판단

원화에서는 거대 뿌리 자체가 중심 공간을 나눈다. 현재 QA에서는 뿌리가 외곽으로 밀리고 나무 하나만 `(101.5,68.5)`에 있어 넓은 반복 바닥이 주인공이 된다. 외곽 crop의 개수를 늘려도 이 차이는 해결되지 않는다.

| 구역 | 역할·형태·방향 | 밀도 / 지면 / 연결의 수정 방향 |
|---|---|---|
| 남쪽 입구 | 남→북 진입, 압축된 비대칭 앞마당 | 양측 뿌리 밀도 높음 / 재·흙 / 서측 공터와 동측 우회로 분기 |
| 서측 전투장 | 주요 전투 여백, 입구보다 넓은 서쪽 편향 공터 | 낮은 바닥 디테일 / 회갈색 재 / 북측 회랑으로 개방 |
| 중앙 뿌리 | PRIMARY 질량; 도면 대략 x74~123, y73~151 | 비통행 개념 / 검은 뿌리 / 양쪽 경계·그림자·동선을 동시에 정의; 좌표 LOCK 아님 |
| 동측 습지 | 선택 우회·THREAT SPACE, 동쪽 확장 | 낮은 뿌리/독성 색 / 안전 가장자리 / 남북 연결. 현재 막다른 pocket을 그대로 유지하지 않음 |
| 북서 연결 | 전투 이후 BREATHING/TRAVEL SPACE | 전투장보다 좁고 방향 변화 / 뿌리 사이 흙길 / 북측 전투장 합류 |
| 북측 전투장 | 두 동선 합류·관문 전경, 열린 공간 | 관문보다 낮은 시각 우선순위 / 차가운 재 / 12시 관문 |
| 외곽 숲 | LEFT/RIGHT/NORTH/SOUTH 연속 BACK/MID 질량 | 개별 에셋 섬 금지 / 경계 확정 뒤 새 전체 master 제작 |

아직 도식의 단순한 고리 형태를 완성안으로 승인하지 않는다. 다음 블록아웃에서는 서측 넓은 combat void, 동측 비대칭 습지, 북서 breathing shoulder의 폭과 방향을 구별하고 내부 뿌리 돌출로 단순한 원형 우회 인상을 깨야 한다. 임의의 소품 scatter나 모든 영역 동일 폭 통로로 해결하지 않는다.

## MAP PRODUCTION REPORT

| 항목 | 이번 세션 결과 |
|---|---|
| STAGE | CH1-1 QA; MASTER 재검토 |
| MASTER | silhouette: 현재 연속 공터와 목표의 중앙 질량 불일치 확인; regions: 위 7역할; main route: 남→서→북; side spaces: 동측 습지 우회 구상. 모두 미적용 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH: 기존 crop bake 유지; major holes: 실제 카메라에서 환경 밀도 부족, 재설계 필요 |
| LARGE | source assets: 승인 master 및 기존 preview; composites/overlap: 변경 없음; repeated silhouette: 잔여 |
| MEDIUM | connections: 미작업; remaining holes: 기존 접합 문제 유지 |
| GROUND | shadow/contamination/structure integration: 미작업; 반복 타일과 모델 분리 잔여 |
| PLAYABLE | main arenas: 서측·관문 계획; travel/breathing/threat: 위 표; combat readability: 신규안 미검증 |
| LANDMARK | primary: 중앙 뿌리 질량 계획; secondary: 북측 관문·동측 습지; tertiary: 이번 단계 추가 없음 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 이전 8장 보드에서 비교; 신규안 실제 카메라 검증 없음 |
| TECH QA | 보드 HTTP/이미지/JS/반응형 PASS. route/collision/seam/loading/performance 게임 검증은 이번 세션 미실시 |
| FILES | stage-owned: builder/HTML/보드 QA/본 문서/목표 문서; concurrent touched: 없음; unrelated touched: 없음 |
| GIT | 본 세션 소유 파일만 커밋 대상으로 분리; push/deploy 없음 |
| VISUAL VERDICT | RETOUCH; 보드 기술 PASS가 맵 시각 PASS는 아님 |
| NEXT PASS | QA 전용 전체 블록아웃으로 비대칭 중앙 질량/두 방향 연결 구현 → 실제 8카메라 크기로 여백 검토 → 외곽 master 재제작. 작은 디테일 보류 |
