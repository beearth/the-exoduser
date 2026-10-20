> 2026-10-21 MAP11-16 제품 아트 현행: [승인 Seedream 바닥·외곽 나무 적용](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md). 아래 MAP11-15 및 이전 텍스처/성능 수치는 당시 이력이며 독립 프리뷰는 유지한다.

# MAP11-09 — 1-1 외곽 BACK/MID/FRONT 조립 · G2

> 최신 총괄 G2 판정: 필드를 감싸는 숲 링 구조 PASS. 크기·회전·명도·반전 반복, BACK 안개 깊이, 서쪽 마른 심재/동쪽 황록 하단 반사와 중앙 전투면 재질은 [MAP11-10 후속](MAP11_SURFACE_SEAM_G3G4_20261021.md)에서 반영·새 캡처 검수한다. 아래 최초 제출 수치는 이력으로 보존한다.

G1 사용자 판정은 **구조 PASS(임시 승인)**이다. 남쪽 기상→중앙 전투면→서 큰 가시 바위/동 독액 웅덩이의 두 고리→북중부 시체나무+심장제단→보스문 흐름을 인수했다. 랜드마크의 큰 실루엣이 앞 전투면을 좁아 보이게 하는 문제는 아트 단계 높이/가림 검수 대상으로 유지한다. 단일 두께 외곽 띠 문제는 이번 세 겹 조립의 검수 대상이다.

| G2 고정 시점·파일(1920×1080 및 literal 1x crop) | 의도·눈 검수 기록 |
|---|---|
| 01_start / 기상터 | START 좌우 생체 mass로 진입을 감싸고 중앙 통로를 연다. 반복되는 동일 높이 띠 대신 불규칙 수관·뿌리 실루엣 |
| 02_early / 초기 공터 | LEFT 외곽이 초기 공터의 프레임. 기존 낮은 통나무 회색 덩어리와 지나갈 면은 유지 |
| 03_main / 중앙 전투면 | 의도적으로 외곽이 화면 밖인 큰 열린 전투면. 빈 화면을 메우려고 중앙 소품을 추가하지 않음 |
| 04_west / 마른 심재 고리 | LEFT 연속 숲의 겹친 가지/뿌리와 기존 큰 회색 가시 바위 대비. 바닥/큰 바위 아트는 다음 단계 |
| 05_east / 습윤 고리 | RIGHT 숲·낮은 기존 웅덩이. 벽가에 겹치는 전경은 alpha.15까지 페이드, 통과 가능 지형을 좁히지 않음 |
| 06_landmark / 시체나무+제단 | TOP/LEFT 프레임만 추가. D01 두 회색 덩어리 위치·크기와 기존 카메라 유지. 큰 높이/가림 문제는 후속 아트 검수 기록 |
| 07_late / 북쪽 그늘 | RIGHT/TOP 숲 mass가 다음 보스문 구간의 가장자리를 형성. 열린 가운데 이동 면 유지 |
| 08_gate / 보스문 | TOP 좌우 숲으로 문을 감싸되 중앙의 문 입구는 비운다. 기존 gate 회색 frame·Marker와 provider 이름 유지 |

전체 조립09_overview와 기존 랜드마크 가림10_occlusion은 보충 캡처다. 1x는 외곽 접합/반복을 보는 영역으로 잡고, 중앙 전투면만 플레이어 중심이다. PNG 원본에서 pixel 크기를 유지한 crop이며 업스케일/후처리하지 않는다. 보충10은 기존 D01 가림 확인용이고, 신규 숲 가림은 동쪽05와 신규 headless legal wall-side probe로 따로 검증한다.

## 제작·재사용 경계

최신 fetch main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에서 MAP11-11 최종 `263498f6c58d05a278b32a7e2641af072138a3fa`를 정상 merge(FF)했다. MAP11-02/07은 그 인수 체인의 의존이다. plan MAP11-09의 07·08 중 신규 proof/생성 대신 **기존 RGBA만 쓰라는 이번 사용자 지시**를 적용했다. MagicLight/기타 AI 생성·다운로드·PNG 변환 0.

독립 `field_outer_preview.tscn`/`field_outer_preview.gd`가 G1 field_preview를 상속한다. 원본8개 회색 외곽 proxy만 표시에서 제외하고 기존 중앙·랜드마크·gate·바닥은 보존했다. compiler/provider/runtime, outer polygon·4지역·14anchor·15route·4solid, Main/State/World/제품 카메라·전투·저장은 수정하지 않는다. 새 숲은 visual-only이며 collision을 추가하거나 기존 길을 좁히지 않는다.

보스룸 외곽에서 사용한 `godot/assets/map/props/rotforest_tree_{01,04,02,07,03,11,05,06}.png` 8종을 그대로 공유한다. BACK/MID/FRONT는 outer offset850/350/60px, 간격690/510/620px, 높이 기본1320/1030/720px에 0.86–1.17 비대칭 변형을 적용한다. 전체152개(BACK48/MID59/FRONT45), LEFT42/RIGHT45/TOP34/START31. 층마다 다른 시작 phase·variant 순환, 좌우 반전, 크기와 명도 차이로 동일 실루엣 반복을 흩었다. 기본 예상 RGBA 메모리8×1024²×4≈32MiB는 mip/엔진 오버헤드 제외 산술치이며 새 PNG를 만들지 않는다.

밑동은 원본 이미지 높이.94 기준이며 모든 root z=int(foot.y×.35), 플레이어는 같은 식+1이다. 기존 map-look `_make_radial_texture`를 최초1회 캐시해 새 외곽의 접지 그림자를 부드럽게 공유한다. 기존 G1 내부 회색 proxy의 단단한 타원 그림자는 이 단위에서 수정하지 않는다. 기존 cached rect/foot 기반 occlusion을 재사용해 foreground alpha.15, 복구1.0. tick에는 reflection/목록·경로 생성 API를 호출하지 않는다. 첫 proof의 새 hard ellipse 그림자는 부드러운 cached radial로 교체했고, 초기 proof를 별도 폴더에 보존했다.

## 검증·120fps 예산

| 항목 | 결과·적용 범위 |
|---|---|
| 신규 headless | 26/0, ERROR0/WARNING0. 3층/4방향/152instance/8종 real alpha·밑동정렬·실제 합법 벽가 probe fade/복구·combat clearing·gate/LOS 확인. 마지막 변경은 새 그림자 렌더만이며 최종 GUI 실행에서 재컴파일·실행 확인 |
| 직접 회귀 | 기존 actual walk49/0, 12,003 실제 move_and_collide 호출/4지역, 파일 상수 USERDIR. 각각1회, ERROR0/WARNING0. 불필요한 전체 회귀 반복 없음 |
| G2 캡처 | 최종 ERROR0/WARNING0: 8장면+보충2, 1920×1080 10장·literal1x10장. 첫 proof는 ERROR0/WARNING0, 벤치 제외 |
| 벤치 1회 | warm120 / 물리600tick@60Hz, 8시점, 벽시계10.000054s / render14,383frame / 평균1438.29fps / p95≤1.17ms / p99≤1.66ms / 평균draw31.33. M5Pro·gl_compatibility·1920×1080. 이 독립 preview의 표본 frame time은120fps 예산 안이며 전투/제품 성능 보장이 아님. 120fps frame8.333ms/60fps 하한; map CPU1.25ms/environment GPU3ms는 계획 예산. GPU timer 없는 전체 preview 측정으로 GPU3ms 달성을 주장하지 않음 |
| 격리·원로그 | `EXODUSER-map11-09-Isolated-20261021`, headless/GUI 실제 user dir 확인. 실제 사용자 save 사용0. 실행별 pgrep≥2면30초 대기·override 실행 후0byte. 원로그 `_out/map11-09/`, captures 및 첫 proof 별도 보존 |
| 눈 검수 한계 | 8시점 확인 시 생체 실루엣/주요 동선 가독성은 G2 제출 가능. 반복 완전 제거·바닥/중앙 소품·환경광·랜드마크 아트 완성 판정 아님. **VISUAL VERDICT: RETOUCH — G2 맥북총괄 눈 검수 대기** |

## MAP PRODUCTION REPORT (§23)

MASTER PLAN/G1 구조는 사용자 임시 승인; LARGE OUTER MASS가 이번 작업이며 BACK/MID/FRONT와 동선 프레임을 조립했다. MEDIUM/GROUND/PLAYABLE은 승인 geometry 보존, LANDMARK/CENTER는 기존 blockout 보존, SMALL DETAIL/최종 조명은 다음 단계다. CAMERA QA는 고정8시점 및1x/전체·가림 보충, TECH QA는 신규/직접회귀·600tick 벤치다. G1 구조 PASS와 G2 미승인을 구분한다. 현재 제품 연결은 없으며 native field_runtime/DEMO11-37·43 계약을 변경하지 않는다. 후속은 총괄 G2 판정 후 조정하고, 랜드마크의 큰 실루엣 및 바닥/조명 아트는 별도 단위에서 검수한다.
