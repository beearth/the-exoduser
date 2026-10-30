# PC-A13 능력치 창 (`#statPanel`) Unity 이식 — 2026-10-26

기준: 웹 `G:/exoduser/stat-panel-ui.js` · `stat-panel-ui.css` · `growth-tree-*.css` · `ui-refinement.css` (웹 HEAD `1770c2698`, stat-panel-ui.js 마지막 커밋 `2cc7bdfdc`). 베이스 `d5f32ff57`. 원칙: UI는 웹 그대로, **정의=웹에서 추출 / 상태=Unity에서 읽고 없으면 "미이식"**.

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeStatPanel.cs` | 창 전체(IMGUI 1920x1080 설계 공간). 캡처 진입 `--unity-stat-panel-capture <out>` 포함 |
| 신규 | `unity/Assets/Exoduser/Resources/Data/stat_panel_web.json` | 트리 정의(노드 31 · 랭크 별 260 · 연결 · 길 6 · 효과 공식 문구 · 노트). 출처·추출 시각 기록 |
| 신규 | `unity/Assets/Exoduser/Resources/Art/ui/stat/` (38개) | `stat_base.png`(웹 창 정지 이미지: 틀·기사 부조·빈 컨트롤 모양), `node_{passive,major,stat}_{base,selected}.png`(웹 노드 틀), `glyph_*.png`(웹 글리프 31종, 흰색 선) |
| 신규 | `unity/Tools/stat-panel-web/` | `cap_stat_assets.cjs`(웹 정의·정지 이미지·노드 틀·글리프 추출), `build_stat_json.cjs`, `mk_cmp.py` |
| 신규 patch | `docs/engine/unity_patches/A13_nativegame_stat_panel.patch` | NativeGame 열기 연결(누적 7번째). 기존 6개 다음 순서로 7개 모두 `git apply --check`·적용 통과 |

생성 이미지 없음: 모든 이미지는 웹 화면/요소 캡처이거나 웹 SVG 글리프 렌더.

## 2. 추출 데이터 요약

| 항목 | 값 |
|---|---|
| 노드 | 31 (패시브 26 + 능력치 STR/DEX/INT/LCK/GRIT) |
| 랭크 별(constellation) | 260 (패시브 26 × 10), 연결 260 |
| 총 노드 수 | 265 |
| 길별 총계 | 맹공과 반격 51 · 비전과 마력 31 · 탄도와 약점 51 · 침식과 사냥 40 · 생존과 회복 51 · 인간과 악마 41 |
| 연결 | 관절 5(origin/spine/neck/leftShoulder/rightShoulder) + 노드 부모 연결, 랭크 별 연결 |
| 랭크 비용 | 1,1,1,2,2,2,3,3,3,5 AP (정의) |

## 3. 동작 (구현)

| 항목 | 웹 동작 | Unity |
|---|---|---|
| 노드 선택 | 클릭 → 분석판 전환, 경로 강조 | 동일. 능력치 노드는 "능력치 분석" |
| 랭크 별 선택 | 해당 랭크 선택, `Lv. N · c AP` | 동일 |
| 길 필터 | 7개 버튼, 선택 시 노드·힌트 필터 | 동일 (선택 노드가 길에 없으면 길의 첫 노드) |
| 하위 탭 | 전체/습득/변경 중 | 동일 규칙. Unity에는 투자가 없으므로 습득·변경 중은 빈 결과(웹 안내 문구 표시) |
| 검색 | 이름·설명·효과 문구 포함 검색 | 구현(단순 부분 문자열 필터, 웹과 같은 대상 문자열). 검색 중 J/K/TAB/G 단축키 무시, ESC는 포커스 해제 |
| 확대/축소 | − / 100% / +, 휠(±0.15), 1~2.5, 100%에서 이동 초기화 | 동일 |
| 트리 드래그 | 이동(±500·scale, ±400·scale 한계), 4px 이내 이동은 클릭 | 동일 |
| 분석판 스크롤 | 내용이 넘치면 휠 스크롤 | 동일 (썸 표시) |
| 닫기 | `[J]` 버튼 · J · ESC | 동일 |

모양만 있고 동작 없음(가짜 동작 금지): 자동 투자 예약 / 환불 계획 / 전체 환불 계획 / 계획 취소 / 변경 적용 / 현재 전투 능력치 ↗ / 노드 마우스오버 미리보기 툴팁.

## 4. "미이식" 표 (상태 값)

| 위치 | 웹 | Unity |
|---|---|---|
| 계획 후 AP 값 | 0 | 미이식 |
| 길 카운터 "n / 총" (7줄) | 0 / 51 등 | – / 총(총계는 정의) |
| 제목 카운터 | 265 / 265 | 전체 탭: 보이는 노드 정의 합 / 265 (웹 계산식 그대로, 정의 기반). 습득·변경 중 탭: – / 265 |
| 분석판 투자 레벨 / 직접 투자량 | 0 | 미이식 (최대치 "/ 10"은 정의) |
| 레벨 눈금(pips) | 채움 없음 | 빈 눈금 10개(정의 개수) |
| 기여 표 현재 / 다음 | 수치 | 미이식 (행 이름·공식 문구는 정의) |
| 노드 레벨 배지 | 선택 노드에만 숫자 | 선택 노드에만 "–" |
| 자동 투자 예약 버튼 | `· 1 AP` | `· 미이식` |
| 버튼 아래 안내 | 현재 AP 0 · 예상 레벨 1 | 현재 AP 미이식 · 예상 레벨 미이식 |
| 능력치 노드 SP 줄 | SP 상태 문구 | 현재 SP 미이식 |
| 학습/변경 중 판정 | 상태 | 투자 없음 → 빈 결과 |

웹 문구 정의라서 유지한 것: "AP가 부족해도 예약할 수 있습니다…", 하단 안내문, 노드 노트(`notes`), 힌트 문구. (예약 기능이 아직 동작하지 않는다는 점은 이 문서에서만 밝힘.)

## 5. 열기 연결 (NativeGame patch)

`A13_nativegame_stat_panel.patch` — NativeGame.cs만 수정:

| 변경 | 내용 |
|---|---|
| 필드/생성/리셋 | `NativeStatPanel stats`, `statsWasRunning` |
| `OnPanelRequested("statPanel")` | 다른 창 닫고 통계 창 토글. 설정/인벤토리/스킬 요청 시 통계 창 닫기 |
| `SetStats(bool)` | 열면 `Running=false`, 닫으면 복원 + 클릭 해제 펜스 (스킬 창과 동일 방식) |
| Update | 통계 창이 열려 있으면 ESC(검색 포커스면 포커스만 해제), K→스킬, TAB→인벤토리, 그 외 `HandleKeys` |
| OnGUI | `stats.Draw` |
| `HandlePanelHotkeys` | 검색 입력 중에는 G/J/F10 무시 |

## 6. 검증

| 검사 | 결과 |
|---|---|
| inventory-navigation | 35/35 PASS (1회) |
| inventory-oracle | 892 checks / 0 failures (1회) |
| Win64 빌드 (patch 7개 적용 상태) | errors 0 |
| 능력치 창 캡처 (`--unity-stat-panel-capture`) | 기본·노드(패시브/능력치)·길 필터·습득 탭·125% 확대 6장 |

비교 이미지: `E:/exoduser-wt/_out/pc-a13/cmp/` — `stat_cmp.jpg`, `stat_cmp_node.jpg`, `stat_cmp_node_stat.jpg`, `stat_cmp_path.jpg`, `stat_cmp_tab_learned.jpg`, `stat_cmp_zoom125.jpg`, 1x 크롭 `stat_crop_{left,tree,right,bottom}.jpg`.

## 7. 남은 차이

| 항목 | 내용 |
|---|---|
| 글꼴 | 웹 Noto Sans/Serif KR·Georgia → Unity는 NotoSansKR·나눔명조(숫자 모양 약간 다름) |
| 노드 마우스오버 | 웹은 미리보기 툴팁·이름 라벨, Unity 미구현 |
| 별(랭크) 모양 | 웹 CSS 원/마름모를 절차 그리기로 재현, 미세한 번짐·광택 차이 |
| 키보드 노드 이동 | 웹 방향키 이동 미이식 |
| 언어 | 정지 이미지 안의 제목·부제·고정 문구는 한국어 고정 (영어 전환 미이식) |
| 이모지 | 없음 (벡터 글리프/절차 도형) |

2026-10-30 PC 현행 시각 자산·은빛 팔레트·Linear 글자 보정은 [Unity UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 기능·저장·미이식 범위와 위 검수 이력은 유지하며, 현재 원화의 실제 Player 결과는 해당 문서의 정확 후보 영수증으로 구분한다.
