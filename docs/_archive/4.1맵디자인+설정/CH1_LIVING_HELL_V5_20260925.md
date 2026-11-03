# CH1-1 v5 — 외곽 나무 형태 수정

사용자 피드백: v4 사이드 나무 형태가 이상함. 작은 원뿔형 그루터기 반복, 줄기와 뿌리의 과도한 엉킴을 수정 대상으로 삼았다.

| 항목 | 값 |
|---|---|
| 입력 | `assets/map/ch1/rottenwood_living_hell_v4.png` |
| 출력 | `assets/map/ch1/rottenwood_living_hell_v5.png` |
| 규격 | 2048×2048 PNG, 불투명 정지 원화 |
| 생성 | OpenAI GPT Image API, imagegen CLI edit, `gpt-image-2`, `high`, 입력 1장, 181.0초 |
| 프롬프트 | `assets/map/ch1/rottenwood_living_hell_v5_prompt.txt` |
| 편집 방식 | 참조 이미지와 영역 보존 지시. 별도 알파 마스크 없음. 중앙 픽셀 동일성 보장 아님 |
| 변경 | 큰 속 빈 고목, 기울어진 줄기, 부러진 횡가지와 쓰러진 통나무로 외곽 실루엣 변화 |
| 보존 의도/관찰 | 피부막·동맥·넓은 중앙 면·남북 진행은 유지되나 API가 지면 세부와 좌상 랜드마크도 일부 다시 그림 |
| 사용 상태 | 원화 검토용. 런타임 연결·로딩 폴백·충돌·애니메이션 변경 없음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 정지 원화 v5.

MASTER: 중앙 넓은 피부 전투면, 남→북 진행, 측면 독 구덩이 유지.

OUTER MASS: LEFT 큰 갈라진 고목과 쓰러진 줄기; RIGHT 높은 속 빈 줄기와 횡방향 통나무; TOP 북쪽 문/죽은 숲; SOUTH 입구 양옆 부패 목질. 주요 공백 없음.

LARGE: v4 입력 1장으로 API 편집. 별도 레이어 합성 없음. 작은 원뿔형 반복은 감소했으나 일부 갈라진 줄기 형태가 유사함. 오른쪽 횡가지와 외곽 고목이 이전보다 전투면 가까이 보이는 구간 있음.

MEDIUM: 줄기→굵은 뿌리→피부 바닥 연결. 미세 뿌리의 높은 밀도는 일부 남음.

GROUND: 피부와 동맥, 습윤 접지 그림자 유지. 지면 일부 세부 재생성됨.

PLAYABLE: 중앙/남부 열린 전투면, 북쪽 연결, 측면 독 위협 공간 유지. 실제 캐릭터 크기와 전투 가독성 미검수.

LANDMARK: primary 좌상 생체나무; secondary 측면 독 구덩이와 큰 고목; tertiary 북쪽 문.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두 게임 카메라 미실시; 전체 원화 육안 검토만 수행.

TECH QA: route/collision/pageerror/404/seam/loading/performance 미실시. 게임 코드 변경 없음.

FILES: stage-owned v5 PNG/프롬프트/본 문서/맵디테일. concurrent/unrelated 수정 없음.

GIT: 위 파일만 커밋 대상. push/deploy 없음.

**VISUAL VERDICT: RETOUCH** — 반복 그루터기 개선. 외곽 근접도·잔여 뿌리 밀도·실제 전투 가독성 확인 필요. 사용자 최종 승인 아님.
