# CH1-1 v7 — 구역별 단조로움 개선

사용자 피드백: 맵이 너무 단조롭다. 동일 나무/독 웅덩이 반복을 줄이고 왼쪽 괴사 구덩이, 오른쪽 쓰러진 생체 고목, 북문 조직, 평평한 피부 바닥 변화로 구역을 구분했다.

| 항목 | 값 |
|---|---|
| 파일 접두 | `assets/map/ch1/rottenwood_living_hell_v7` |
| 입력 | `rottenwood_living_hell_v6.png` |
| 생성 원본 | `_source.png`, OpenAI GPT Image API / bundled CLI edit / gpt-image-2 / high / 2048×2048 / 입력 1장 / 183.5초 |
| 전체 프롬프트 | `_prompt.txt` |
| 분리 레이어 | `_ground_layer.png`, `_left_layer.png`, `_right_layer.png`, `_north_layer.png` |
| 합성본 | `.png`, 2048×2048 불투명 PNG |
| 레이어 문서/좌표 | `_layers.svg`, `_layers.json` — JSON에 각 polygon 좌표 전체 기록; SVG는 같은 폴더 PNG 상대 참조 |
| 합성 | v6→ground→left→right→north; source-over; 마스크 blur sigma20; alpha<2는 0 |
| 합성 스크립트 | `tools/compose-ch1-v7-layers.mjs` |
| 비교 페이지 | `_review.html`, 4개 구역 체크박스 표시/숨김, 모두 끄면 v6 |
| 상태 | 정지 원화 검토용. 게임 로더/충돌/이동/애니메이션 변경 없음 |

큰 구조물의 배치가 변경되는 실험 원화이므로 기존 collision과 일치한다고 주장하지 않는다. 구역별 마스크 합성은 개별 오브젝트/지면 의미 분리가 아닌 영역 교체 레이어다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 v7 구역 구분 원화.

MASTER: 남북 진행과 중앙 열린 면. LEFT 깊은 함몰, RIGHT 거대 고목 단면, NORTH 생체막 문, 중앙 넓은 피부 재질 변화.

OUTER MASS: LEFT/RIGHT 서로 다른 큰 형태. TOP 생체막과 동맥, SOUTH 원본 외곽과 바닥 연결. 좌우 대형 구조물이 안쪽으로 시각적 압박을 줌.

LARGE: v6 베이스+생성 소스 1장으로 만든 RGBA 4장. 구역 마스크 일부 중첩은 같은 소스를 source-over. 반복 웅덩이/그루터기 감소.

MEDIUM: 괴사 구덩이 절단면/고목 심재/북문 힘줄 연결. 형태와 경계는 후속 국소 검토 대상.

GROUND: 회색 피부의 넓은 밝기 변화와 동맥 유지. 바닥 대비/얼룩이 실제 전투를 방해하는지는 미검수.

PLAYABLE: 중앙 열린 면과 남북 접근은 보임. 기존보다 좌우 구조물이 커서 공간이 좁아 보이는 단점. 실제 이동 폭/충돌/전투 검수 전 승인하지 않음.

LANDMARK: 좌상 생체나무 유지, 좌측 함몰과 우측 고목 단면 추가, 북문 조직 강조.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 런타임 미실시. 전체 합성 원화 육안 검토만 수행.

TECH QA: route/collision/pageerror/404/loading/performance 미실시. seam은 전체 원화 육안상 뚜렷한 사각 경계 없음. 비교 UI 실행 테스트 미실시.

FILES: v7 이미지/프롬프트/레이어/SVG/JSON/HTML, 합성 스크립트, 본 문서/맵디테일. unrelated 직접 수정 없음.

GIT: 이 작업 파일만 커밋 대상. push/deploy 없음.

**VISUAL VERDICT: RETOUCH** — 구역 구분은 강화됨. 좌우 대형 구조물의 시각적 압박을 줄이고 실제 전투 여백 확인 필요.
