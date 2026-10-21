# 1-1 맵 목표 화면 2장 — 장면 우선 제작 원칙 (2026-10-21)

> 사용자 판정: "다 컨셉 이미지는 그럴듯한데 구현하면 따로 놀고", "맵도 좀 엉성하고 아직도".
> 상위: [MAP_IMPROVEMENT_PROJECT](MAP_IMPROVEMENT_PROJECT.md) · [MAP_LOOK_GODOT_PASS1](MAP_LOOK_GODOT_PASS1_20261020.md).

## 1. 목표 화면

| 파일 | 용도 | 핵심 |
|---|---|---|
| [target_frames/ch1_field_corridor_target.webp](target_frames/ch1_field_corridor_target.webp) | 1-1 필드 통로 | 회보라 바닥·검붉은 핏줄 균열·이끼 웅덩이, 양옆 고목이 액자처럼 길을 감싸고 안쪽 차가운 빛으로 시선 유도, 깊이 안개 |
| [target_frames/ch1_boss_arena_target.webp](target_frames/ch1_boss_arena_target.webp) | 1-1 보스룸(원형 전투장) | 살덩이 바닥·핏줄·이빨 돌기, 입 달린 나무와 알주머니가 원형 경계, 둘레 안개, 위에서 비스듬히 내려다보는 2.5D 시점 |

## 2. 왜 따로 노는가 (원인)

1. 부품(나무·바닥·소품)을 각각 다른 날·다른 프롬프트로 생성 → 빛 방향·채도·그림자·그림체가 제각각.
2. 채택 판정이 부품 단독 이미지 기준 → 게임 화면에서 어울림은 나중에야 확인.
3. 땅↔나무↔안개를 잇는 접합층(접지 그림자, 뿌리 데칼, 색 보정, 높이 안개)이 비어 있음.
4. 바닥이 반복 타일 → 그림의 "한 붓으로 이어진 바닥"이 사라짐.

## 3. 원칙 — 부품 조립 → 장면 분해로 순서를 뒤집는다

| 단계 | 내용 |
|---|---|
| 장면 먼저 | 위 목표 화면처럼 장면 1장을 먼저 확정한다 |
| 층 분해(paint-over split) | 목표 그림을 바닥판(나무·소품 지우고 채움) / Y정렬 소품(둘레 나무·알주머니를 구간별로 잘라 충돌 영역과 일치) / 전경(화면 가장자리 가지, 시차 이동) / 효과(알주머니 맥박 셰이더, 핏줄 발광 마스크, 둘레 안개 입자, 입 벌림 짧은 애니메이션)로 쪼갠다 |
| 룩 고정값 | 목표 그림에서 빛 방향·팔레트(회보라+검붉은색)·색 보정 LUT·안개 색과 짙기를 뽑아 고정. 새 부품은 이 값으로 생성·보정한 뒤에만 채택 |
| 접합층 필수 | 나무마다 뿌리 데칼+접지 그림자 세트, 바닥판 위 부드러운 가장자리 데칼 |
| 판정 기준 | 부품 단독 이미지는 판정 대상이 아니다. 게임에 배치해 같은 구도로 캡처한 화면(1920×1080, 1x 크롭 포함)을 목표 그림과 나란히 놓고, 같은 장면처럼 보일 때만 완료 |

## 4. 한계와 대응

| 한계 | 대응 |
|---|---|
| 시점 고정 | 2.5D 고정 카메라 각도와 맞춰 쓴다. 각도 변경 불가 |
| 해상도(원본 폭 2000px) | 보스룸 지름에 맞춰 업스케일 후 디테일 보강(점·디더링 금지 — CLAUDE.md 8항) |
| 큰 필드는 한 장으로 못 덮음 | 필드는 구역별 바닥판 + 데칼 혼합, 구역 경계는 데칼로 이음 |

## 5. 첫 시제품 순서

1. 보스룸: 목표 그림 1장으로 바닥판·둘레·전경·효과 층 분해 → 현재 보스룸 provider(MAP11-02, R1700)에 적용 → 나란히 비교 캡처.
2. 필드: 첫 구역 1곳만 같은 방식으로 → 비교 캡처.
3. 비교 결과의 차이 목록을 이 문서 아래 표로 누적하고 하나씩 줄인다.

| 날짜 | 장면 | 비교 캡처 | 남은 차이 | 판정 |
|---|---|---|---|---|
| 2026-10-21 | MAP11-30 보스룸 입장: 중앙→북 경계 | `~/exoduser-wt/_out/MAP11-30/captures/compare_target_vs_game.png` | 단일 원화 층 분해 첫 시제품. floor 세로 확대·clone/반사·북 경계 잘림·mouth 배치/중복·crop 접합 잔여. 아직 같은 장면 아님 | **FAIL** |
| 2026-10-21 | 같은 구도 1x | `~/exoduser-wt/_out/MAP11-30/captures/compare_1x.png` | 전체 덩어리 호흡만, 국소 pod/입2프레임 미완. 전역 LUT 대신 source identity+legacy용 측정 curve 보관. [정확 수치·단회 검수](MAP11_30_TARGET_SPLIT_20261021.md) | FAIL / 첫 시제품 보존 |
| 2026-10-21 | MAP11-30b 보스룸 같은 입장 구도1920×1080/1x | `~/exoduser-wt/_out/MAP11-30b/captures/compare_target_vs_game.png`, `compare_1x.png` | source 1px→화면.96px/균일world2.6667로 바닥 결·타원·나무 위치를 목표 화면에 대응. BACK 중복/직선 경계 크게 감소. 잔여: 일부 feather/clone/안개 차이, 화면 foot와 unprojected collision 접촉 미검수. 알주머니 국소UV/입2자세 추가. p95 **8.734ms**, focus_lost0, 단회 유효이나8.33초과 | **RETOUCH**, 성능예산 FAIL. [정확값·검수](MAP11_30B_PROJECTION_20261021.md) |
| 2026-10-21 | MAP11-30p 같은 보스룸 성능 | `~/exoduser-wt/_out/MAP11-30p/captures/compare_target_vs_game.png`, `compare_1x.png` | 정적15층 bake/바닥패스통합·zero-alpha fog cull·미사용15texture preload제거. 화면유지 PASS(평균RGB차.008996/255). 같은조건 A9.534/B9.071, 최종p95 **8.558ms**/focus_lost0/104draw. 기존feather/clone/표시충돌접촉잔여유지 | **RETOUCH / 성능예산 FAIL**(8.33초과.228ms), 복구완료 아님. [정확값·진단](MAP11_30P_PERFORMANCE_20261021.md) |

| 2026-10-21 | MAP11-30c 축척·캐릭터 접지·바닥 | `~/exoduser-wt/_out/MAP11-30c/captures/compare_target_vs_game.png`, `near_melee.png`, `compare_1x.png`, `motion_0s_2s.png` | 웹 정면 근접48:473.105:1080 대응, zoom입장.563700169/최대.8. 공유red rim/ambient·soft AO·기존연속균열 정적합성. 실제Main live0/2초 효과 확인. p95 **7.738ms**/focus_lost0 단회(후검토 보정 경계는 보고서). 잔여: 원화결의 부드러움/overview clone·접합/자연전투 미검수 | **RETOUCH**, [측정·차이표·MAP REPORT](MAP11_30C_SCALE_INTEGRATION_20261021.md) |

| 2026-10-21 | MAP11-32 필드 START→첫 통로1920×1080/1x | `~/exoduser-wt/_out/MAP11-32/captures/compare_target_vs_game.png`, `compare_1x.png` | 원화배율1.3714285714/기존줌.70·투영.6, 고목5컷/바닥clone·600px접합/rootAO/전경/낮은안개/흰빛/핏줄. START 같은구도 대응, 북접합 clone반복·기존색차·최상단fade 차이 잔여. 관련6종237/0. 유효1회 p95 **11.676ms**/focus_lost0, 무효선행7.942ms/focus1666은 제외 | **RETOUCH / 성능 FAIL**, [정확계약·차이표·MAP REPORT](MAP11_32_FIELD_TARGET_SPLIT_20261021.md) |
