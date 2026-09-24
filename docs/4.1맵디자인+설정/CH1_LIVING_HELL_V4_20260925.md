# CH1-1 생체지옥 원화 v4 — 2026-09-25

기준: [맵디테일](맵디테일.md). 사용자 요청으로 재생성한 정지 원화이며 게임 런타임 적용·애니메이션 완료가 아니다.

| 항목 | 값 |
|---|---|
| 출력 | `assets/map/ch1/rottenwood_living_hell_v4.png` |
| 규격 | 2048×2048 PNG, 불투명 전체맵 |
| 경로 | OpenAI GPT Image API, bundled imagegen CLI edit |
| 모델/설정 | `gpt-image-2`, quality `high`, size `2048x2048`, 이미지 입력 1개 |
| 입력 | `assets/map/ch1/rottenwood_poison_master_higgsfield_v2_wide.png` — 넓은 공간 구도 참조 |
| 전체 프롬프트 | `assets/map/ch1/rottenwood_living_hell_v4_prompt.txt` |
| 실제 결과 | API 성공, 생성 소요 216.4초. 이전 잔액 부족 상태로 단정하지 않음 |
| 의도 | 넓은 전투면 보존, 피부막·피하 동맥·괴사 목질·힘줄·독성 상처 구덩이로 재질 교체 |
| 합성/레이어 | 이번 결과는 단일 평면 이미지. 분리 레이어나 지정 영역 밖 픽셀 동일성을 보증하지 않음 |
| 사용 위치 | 원화 검토용. 게임 로더 연결 없음, 로딩 폴백/충돌 변경 없음 |
| 움직임 | 정지 이미지. 동맥 맥동·독낭 수축 애니메이션 미구현 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 원화 v4.

MASTER: 세로 진행, 중앙 넓은 연결 전투면, 남쪽 입구→북쪽 문. 좌우 독 구덩이.

OUTER MASS: LEFT 대형 썩은 생체나무/조직, RIGHT 부패 고목/독 구덩이, TOP 북쪽 문과 죽은 나무, SOUTH 열린 입구와 외곽 고목. 주요 외곽 공백 없음.

LARGE: v2 wide 구도 입력→v4 API 편집 1장. 합성 레이어 없음. 좌상단 큰 나무와 외곽 질량 유지. 일부 뾰족한 그루터기 실루엣 반복 남음.

MEDIUM: 힘줄과 뿌리가 지면 혈관에 연결. 외곽 조직의 유사 형태 반복은 후속 리터치 대상.

GROUND: 회자주 피부막·검붉은 동맥·국소 괴사·젖은 접촉 그림자. 생체 조직 접지 확인. 바닥 표면 미세 대비는 실제 플레이 화면에서 추가 판단 필요.

PLAYABLE: 중앙/남쪽/북쪽에 넓은 평면과 남북 이동 여백. 위협 공간은 측면 독 구덩이. 정지 원화에서 공간 유지 확인; 적/탄/VFX 가독성은 미검수.

LANDMARK: primary 좌상단 속 빈 생체 고목; secondary 측면 독 구덩이; tertiary 북쪽 문.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실제 게임 카메라 모두 미실시. 전체 원화 육안 검토만 수행.

TECH QA: route/collision/pageerror/404/seam/loading/performance 런타임 미실시. 게임 코드 변경 없음.

FILES: stage-owned v4 PNG/프롬프트/본 기록/맵디테일 상태. concurrent/unrelated 파일 수정 없음.

GIT: 생성 파일과 문서만 대상으로 기록. push/deploy 없음.

**VISUAL VERDICT: RETOUCH** — 피부·동맥·부패 생체목과 넓은 공간은 새 콘셉트에 부합. 그루터기 반복과 실제 전투 가독성 검토가 남아 최종 승인으로 간주하지 않는다.
