# CH1-1 썩은 숲과 길의 재질 경계 — 95차 (2026-09-30)

## 원인과 제작 계약

사용자 캡처 `스크린샷 2026-09-30 125145.png`의 나무와 길 사이에는 긴 직선 절단면이 있었다. 화면 무늬를 생산 master에 대조한 위치는 master 좌상단 `(1766,6620)`의 1100×575 영역이다. 원인은 나무 충돌이나 경로가 아니라 `layout.js`의 53점 polygon을 그대로 숲/바닥 재질 마스크로 사용한 베이크였다. 90차의 나무 알파 감쇠만으로는 재질 경계의 직선이 남았다.

현행 콘셉트는 넓은 전투공간, 피부 같은 바닥, 꿈틀거리는 동맥, 눈·입·종양·부종이 있는 썩은 생체나무다. 53점 polygon·RLE geometry·충돌·6시 시작→12시 출구·상단 통로·중앙 전투 공터를 유지하고 **시각 재질**만 전이시킨다. 90차의 36개 외곽 나무와 손 배치 8개도 유지한다.

## 제작·런타임 값

| ID | 파일·적용 위치 | 현행 값·역할 |
|---|---|---|
| FLOOR-93 | `tools/build_ch1_material_boundary.py` → `production_finish/floor_transition93.png` → `tools/build_ch1_production_finish.mjs` | 1024² RGBA 마스크. polygon 안쪽에 9px 획을 더하고 내부/외부 Euclidean distance로 부호 거리 생성. seed `20260930`, 32² 격자/σ8/진폭3.8px와 96² 격자/σ3/진폭1.7px 노이즈 합을 ±10px 제한. `smoothstep(clamp((signed+noise+9)/18))`로 18px 전이. 숲 마스크는 역상. 시각 알파만 변경 |
| MASS-01 | `outer90_sources/rotforest_mass_01.png` | MagicLight GPT Image 2.5 sunburst 작업 `7510910518846681088`, 16:9 원본 2048×1152에서 투명 배경 분리. 연결된 눈·입·종양 나무 군락. 생성 UI 표시 200 points |
| MASS-02 | `outer90_sources/rotforest_mass_02.png` | 같은 모델 작업 `7510911429421686784`, 2048×1152 원본에서 배경 분리. 턱 공동·썩은 뿌리망의 성긴 군락. 표시 200 points. 두 생성의 표시 비용 합계 400 points; 다른 세션과 잔액을 공유하므로 실제 차감 합계로 주장하지 않음 |
| ROOT-01 | `outer90_sources/rotforest_root_bridge_01.png` | MASS-02 하단 뿌리를 추출한 1698×935 RGBA. `(2300,6870)` bake 픽셀 중심, −19° 회전·밝기 .68·알파 .75로 남서 재질 경계를 연결 |
| BAKE-95 | `outer90_sources/placements.json`, `outer90_patch.png`, `retouch-layers.json` | 고정 나무 36개 + 아래 비충돌 큰 군락 6개 + 뿌리 연결 1개. `bakeVersion=20260930-rotforest-95`, retouch 23레이어, 8192² master와 64개 1026² 청크(core1024, bleed1) |
| CACHE-96 | `game.html` | 생산 청크 cache key `20260930-rotforest-96`; 구 청크가 화면에 남지 않도록 변경 |
| SWAY-95 | `ch1-forest-sway.js` | 기존 숲 띠 변위 최대 ±5 월드픽셀, 청크당 8띠 유지. 64² 오버레이 마스크에서 `edge=smoothstep(min(x,y,63−x,63−y)/4)`를 곱해 청크 사방의 첫 4 mask 샘플(64 월드픽셀)에서 움직임을 감쇠. 인접 청크의 독립 이동이 수직 이음선을 드러내는 문제 해결. 정적 바닥·충돌은 움직이지 않음 |

큰 군락의 좌표 단위는 40px 타일이고 폭은 bake 픽셀이다. 거울상은 동일 원화 반복을 줄이기 위한 수평 반전이다.

| 배치 | 타일 X,Y | 원화 | 폭 | 수평 반전 |
|---|---:|---:|---:|---|
| MASS-01-LN | 19,82 | 01 | 2050 | 아니오 |
| MASS-02-LM | 31,125 | 02 | 2150 | 아니오 |
| MASS-02-RN | 178,82 | 02 | 2050 | 예 |
| MASS-01-RM | 162,124 | 01 | 2150 | 예 |
| MASS-01-LS | 25,172 | 01 | 2200 | 아니오 |
| MASS-02-RS | 175,172 | 02 | 2200 | 예 |

## 확인 결과

| 확인 | 결과 |
|---|---|
| 신고 위치 | `captures/ch1_rotforest90/user_boundary_pass90.jpg`와 `user_boundary_pass95.jpg`를 같은 master 좌표에서 추출해 비교. 대각선 재질 절단 대신 괴사 뿌리가 바닥으로 불규칙하게 스며드는 연결 확인 |
| 베이크 무결성 | 이전 master 대비 변경 39,432,156px, polygon 안쪽 보호 전투 바닥(경계에서 300 bake px 초과) 변경 0px, 경계측 바닥 변경 4,953,151px. 청크 core 불일치 0, geometry hash 동일, 23레이어, 36나무+6군락+1뿌리 (`tmp/ch1_rotforest90_verify.py`) |
| 움직임 회귀 | `test/ch1ForestSway.test.js`/`test/ch1SunburstTrees.test.js` 4/4 통과. 보행 타일·청크 가장자리 alpha 0, 4샘플 전이, ±5px·8띠·타 stage 정적 확인 |
| 실제 게임 | `server.cjs`의 Chrome `game.html?test=1&slot=demo&demo=1`에서 새 cache96 청크와 forest sway 로드, 동측 화면의 수직 청크선은 edge fade 뒤 사라짐. 같은 탭의 숲 레이어 6개 구축·5개 그리기, 샘플 최대 draw 0.2ms. 신고 위치와 중앙/좌우 화면은 같은 마스터 좌표와 런타임으로 확인; 긴 전투 및 신규 NW.js 패키지는 별도 미검수 |

## MAP PRODUCTION REPORT (§23)

| 항목 | 판정 |
|---|---|
| STAGE / MASTER | CH1-1 썩은 숲, 8192² production master/world8000². 53점 경계·8구역 보존 |
| OUTER MASS | LEFT·RIGHT·SOUTH 외곽에 2050~2200px 큰 생체나무 군락 6개; 기존 36나무와 연결. 중앙 침범 없음 |
| LARGE | 2종 연결 군락에 눈·턱·종양·부은 수피·뿌리망. 수평 반전과 위치 차이로 반복 완화 |
| MEDIUM | 90차 30개 작은 군락과 기존 수피를 유지하며 남서 뿌리 bridge 1개로 끊긴 재질 연결 |
| GROUND | polygon/충돌 유지. 18px 시각 마스크와 ±10px 윤곽 변동으로 길과 숲 접합. 내부 300px 이상 전투 바닥 변경 0px |
| PLAYABLE | 시작 6시→출구 12시, 상단 통로와 메인/측면 전투공간 유지; 새 collider 0 |
| LANDMARK | 중앙 랜드마크·캠프·제단 배치 불변. 외곽 눈·입은 위협 실루엣 |
| CAMERA QA | 신고 위치 `(1766,6620)`의 동일 crop 비교, 중앙 `(4020,4450)`, 좌 `(1380,3860)`, 우 `(6600,3860)` 시야 확인. 밝기·표정 가독성은 전투 중 더 검수할 여지 있음 |
| TECH QA | 64청크 core mismatch 0, geometry hash 동일, 보호 바닥 변경 0, 4/4 회귀 통과. 새 청크 키 로드와 숲 overlay 실제 게임 확인. 패키지/장시간 FPS 미검수 |
| FILES | 마스크 생성기·마스크, production builder·master/청크/preview·retouch, 2 mass·1 bridge·placements, `game.html` cache key, sway 코드·테스트, 관련 docs. 동시 작업의 다른 파일은 포함하지 않음 |
| GIT / RELEASE | 관련 파일만 선택 stage/로컬 커밋 대상. push·deploy·NW.js 새 패키징 없음 |

**VISUAL VERDICT: RETOUCH.** 신고한 직선 경계와 청크 이동선은 해당 위치에서 해소했다. 외곽 군락이 어두운 장면에서 서로 뭉쳐 읽히고, 눈꺼풀·입·종양의 개별 애니메이션은 아직 구현되지 않았다.
