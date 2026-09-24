# CH1-1 v6 — 나무 디테일 레이어

사용자 요청: v5에 레이어로 디테일 추가. 원본은 보존하고 GPT Image API 편집 결과의 양쪽 나무 영역만 RGBA 레이어로 합성했다.

| 항목 | 값 |
|---|---|
| 경로 공통 | `assets/map/ch1/` |
| 원본 | `rottenwood_living_hell_v5.png` |
| 생성 소스 | `rottenwood_living_hell_v6_detail_source.png` |
| 왼쪽/오른쪽 레이어 | `rottenwood_living_hell_v6_left_layer.png`, `rottenwood_living_hell_v6_right_layer.png` |
| 합성본 | `rottenwood_living_hell_v6.png` |
| 레이어 문서 | `rottenwood_living_hell_v6_layers.svg` — v5+left+right, 같은 폴더 PNG 상대 참조 |
| 메타데이터 | `rottenwood_living_hell_v6_layers.json` |
| 전후 비교 UI | `rottenwood_living_hell_v6_review.html`, 체크박스로 각각 표시/숨김 |
| 프롬프트 | `rottenwood_living_hell_v6_prompt.txt` |
| 생성 경로 | OpenAI GPT Image API, bundled CLI edit, `gpt-image-2`, high, 2048×2048, 입력 v5 1장, 161.0초 |
| 합성 도구 | `tools/compose-ch1-v6-layers.mjs`, 기존 sharp 의존성 |
| 규격/순서 | 모든 PNG 2048×2048; v5 위 left, 그 위 right; source-over |
| 마스크 | polygon에 blur sigma12, alpha<2는 0; 각 polygon 좌표는 아래 표 및 JSON |
| 보호 범위 | 중앙 x760~1400 전 높이는 두 레이어의 유효 알파 밖. 합성 방식으로 원본 유지; 별도 픽셀 비교 테스트 미실시 |
| 사용 상태 | 원화/레이어 검토용. 게임 로더 연결·충돌·애니메이션 변경 없음. 비교 UI에서 레이어를 숨기면 v5로 복귀 |

| 레이어 | polygon 좌표(px) | 추가 내용 |
|---|---|---|
| left | 20,480 290,450 470,820 520,1230 440,1760 20,1800 | 큰 박리 껍질판, 썩은 심재, 틈 안 힘줄/황갈색 독낭, 접지 오염 |
| right | 1740,300 2020,300 2020,1820 1670,1760 1530,1420 1600,1060 1510,800 | 갈라진 목질·껍질층, 찢어진 회색 생체막, 국소 혈관 |

프롬프트는 표면 디테일 보강을 지시했으나 생성 소스 내 형태 변화가 일부 있다. 제한 영역의 교체 레이어이며, 개별 독낭/힘줄 오브젝트별 분리 레이어는 아니다. SVG는 PNG들과 함께 보관해야 한다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 정지 원화 v6 레이어.

MASTER: v5 공간 베이스 보존, 남→북 넓은 연결 전투면과 측면 독 구덩이.

OUTER MASS: LEFT/RIGHT 지정 나무 영역만 수정; TOP/SOUTH 원본 유지. 주요 외곽 공백 추가 없음.

LARGE: v5 원본+좌/우 RGBA 2장. 좌우 마스크 겹침 없음. 기존 큰 실루엣과 나무 반복은 이번 세부 패스만으로 최종 해결 판정하지 않음.

MEDIUM: 목질 틈/힘줄/막 연결 보강. 일부 생성된 뿌리 형태 변화 존재.

GROUND: 지정 외곽 접지의 그림자와 오염만 합성. 중앙 피부·동맥 원본 유지.

PLAYABLE: 중앙 넓은 면, 남북 이동, 측면 독 위협 영역 유지. 적/탄/VFX 포함 실제 가독성 미검수.

LANDMARK: 좌상 주 생체나무와 북문 원본 유지; 좌우 큰 고목의 표면 디테일 추가.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 게임 카메라 미실시. 합성 전체 이미지 육안 확인.

TECH QA: route/collision/pageerror/404/loading/performance 및 브라우저 비교 UI 실행 테스트 미실시. seam은 전체 합성 육안상 뚜렷한 사각 접합 없음. 게임 런타임 변경 없음.

FILES: v6 소스/프롬프트/좌우 레이어/합성본/SVG/JSON/비교 HTML, 합성 스크립트, 본 문서/맵디테일. unrelated/concurrent 파일 직접 수정 없음.

GIT: 이 작업 파일만 커밋 대상. push/deploy 없음.

**VISUAL VERDICT: RETOUCH** — 목질·기생 조직의 디테일은 강화됨. 실제 게임 카메라와 전투 가독성, 국소 형태/접합 추가 검토 필요.
