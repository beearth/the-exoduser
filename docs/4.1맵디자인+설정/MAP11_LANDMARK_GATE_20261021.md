> 2026-10-21 MAP11-15 제품 현행: [보스룸 경계·맵 렌더 비용 보고](MAP11_FINISH_PERFORMANCE_20261021.md). R1700 충돌/Marker는 유지하고 제품 전용 뿌리·후경 숲·바닥 감쇠, 화면 밖 cull, 정적 바닥 필터 베이크, 정적 FBM 안개 캐시을 적용했다. 아래 이전 차수 수치·프리뷰는 당시 이력이며, 최신 실창 걷기 측정과 시각 판정은 연결 문서를 따른다.

# MAP11-14 — 랜드마크·관문·필드/아레나 시각 접합

STATUS=REVIEW_PENDING. **VISUAL VERDICT: RETOUCH — 맥북총괄 눈 검수 대기.** 새 이미지 생성/지출 0. D01 시체나무+낮은 심장 제단, D02 생체조직 강도, D03 기존 RGBA, D04 1080p120fps 목표/60fps 하한을 유지한다. 전체 1-1 자연 전투/보스 완료 인수는 이 산출로 닫지 않는다.

| 구현 계약 | 현행 수치·경계 |
|---|---|
| 기반/소유 | a5ad5e4e → 1ec7b7f3 정상 merge b731d4e7 → e8888106 정상 merge 780d5955. 원본 R의 WORK/INDEX 변경0. 의존 merge의 CHANGELOG/번역목록 충돌은 양쪽 기록 보존. 새 gameplay writer/State/피해/region/굴/저장 변경0 |
| Main 필드 | product_field_view가 field_seam_preview를 상속: MAP11-10의 연속 피부바닥·수피/불규칙 decal·BACK/MID/FRONT RGBA 숲을 제품 Main에 실제 연결. 프리뷰 actor/UI/입력/collider 설치0. 회색 proxy 대신 기존 RGBA 내부 mass 사용. provider 좌표/revision/충돌 동일 |
| D01 주랜드마크 | SplitCorpseTree foot(-250,-2700), 키650; 겹치는 rotforest_tree_07 foot(-410,-2790), 키590. 낮은 prop_altar foot(-250,-2320), 키220; 노출 고치 foot(-260,-2370), 키110. 접지 root1150×380 at(-250,-2650)/회전.10. 제단 PointLight1: radius texture128×scale6, energy.65, RGB(.65,.12,.075), shadow0. 남쪽 전투면에 새 collider0 |
| 내부 보조 mass | DryHeartwood(-1800,-550)/키1150/tree04, LowWetRootMass(2100,100)/키280/root, EarlyFallenLog(-1550,2450)/키220/root 반전. 원 texture/alpha 보존, foot 기준 z=int(y×.35). 별도 접지 방사 shadow/비충돌 |
| 관문 | 북recess는 tree04/07/02, foot(-600+i×620,-4210−(i%2)×90)/키650+i×45, i0..2; root apron(0,-4070)/키280. bone_arch 고정틀(0,-3830)/키650. 기존 ch1/collision/cage_gate.png의 철창 infill Rect(60,75,110,193)만 55px씩 양분, 키405, foot y=-3890. 닫힘 중심 x=±27.5×405/193. Gate(0,-3750)에서 거리<900이면 presentation gate_open이 초당2.5로 0→1, 양쪽 각380 이동하며 alpha=1−gate_open으로 crop 경계가 완전 열린 문에 남지 않는다. 이는 기존 gameplay lock의 승인/거부를 쓰거나 대체하지 않는 표시. 최종 gate-owner/지역 클리어 인수는 별도 |
| 가림/카메라 | 실제 Main Player를 setup 후 1회 캐시. field의 cached rect 또는 point−(0,55)와 foot 비교 시 alpha.15/초당10; arena forest는 rect/55px 머리점·foot 조건으로 alpha.22/초당8. 원복alpha1. 틱 목록생성/reflect API0. MAP11 전용 camera zoom.70/offset(0,-180), 전환 후 기존 camera reset 유지. 원 설계 프리뷰 보드 zoom은 그대로 |
| 아레나 균열 | 기존 매끈한3중 Line2D/Curve2D 균열 제거. field_decal shader(fissure=true)+기존 prop_ice_gcrack RGBA 5site×3fragment=15개. sites(-1200,520),(1050,-430),(-470,1100),(550,450),(-690,-790); part0..2 offset(part×135−100,((i+part)%3−1)×90), 크기(260+(i%3)×75,190+part×40), 회전 i×.79+part×1.1, part1 반전. 기존 root2/flesh2 decal은 유지. 공격 fissure 수치·AI와 무관한 바닥 장식 |
| 전환 | product_scene.activate_space가 유효 다른 공간을 표시할 때 black alpha.75→0/.22초 Tween. 실패 rollback도 같은 표시 경로; Player/State transport는 기존 owner만 수행. Entry/Boss/Exit/Return 및 FieldMarkers/Gate/Return 이름/좌표 계약 유지. 최소 fade이며 비동기 새 운송/문 정책 없음 |
| 실제 검수/캡처 | capture_map11_landmark_gate.gd가 실제 Main→기존 intro 완료→기존 lesson skip→field Gate 접촉→arena 이동을 실행. 4장 각1920×1080 + get_region(640,180,640,720) 무확대1x. 검수 캡처만 큰 PetSubtitleRoot를 hide; 제품 대사 UI/펫은 불변. 캡처 위치 landmark(-850,-2400), gate(0,-3500), arena는 실제 Entry, wall=arena offset+(1400,80). 강제 위치를 자연 필드 클리어/수동 플레이로 보고하지 않음 |

캡처/로그/manifest/측정: `~/exoduser-wt/_out/map11-14/`. `captures/01_landmark.png`, `02_gate.png`, `03_arena_entry.png`, `04_arena_wall.png`와 각 `_1x.png`. 실제 새 user dir는 `EXODUSER-map11-14-Isolated-20261021`. editor import 전 project 설정도 임시 격리명으로 바꿨고, 커밋 전 원래 project.godot byte로 복원한다. override.cfg는 미커밋/제거한다. 실제 사용자 저장소 접근0. pgrep Godot2개일 때30초 대기 후1개 확인, 이후 자기 실행만 종료.

## MAP PRODUCTION REPORT

- STAGE: Godot CH1-1 / MAP11-14. MASTER: 승인 field polygon/4지역/두 고리/남start→북gate와 R1700 arena 유지. 웹1:1 이식0.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH는 MAP11-10의 BACK/MID/FRONT를 제품에 연결. 북쪽 gate sight gap/바닥 외곽 직선 접합의 최종 자연화는 RETOUCH.
- LARGE: 기존 rotforest8종·시체나무·뼈 아치/철창; 새 bitmap0. D01은 크기/겹침을 줄여 남전투면 확보. 전체 반복 실루엣 최종검수는 MAP11-16.
- MEDIUM: root shoulder/방사 접지·제단 낮은 조직. gate 주변 mass와 원경 접합 추가 아트 검수 필요.
- GROUND: field 연속피부/불규칙 RGBA; arena Line2D 균열을15fragment로 교체. arena rim의 원형 절단 경계/전체 피부 재질은 최종 아트 승인 전.
- PLAYABLE: 기존 provider/경계/회피고리·Marker 유지, 새 collider0. 시각 가림 실제 Main player로 복구. 적/탄/Q/E/loot가 겹치는 밀집 전투 미검수.
- LANDMARK: primary=북중부 시체나무+낮은 심장제단, secondary=관문, tertiary=기존 고치/뿌리. 장면 전체 전투 여백을 시각 확인.
- CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LATE는 이 단위 신규8board 검수 아님. LANDMARK/EXIT/arena ENTRY/WALL 4장·1x 직접 검수. 작은 gate infill의 원화 선명도·지역 연속감은 맥북총괄 판정 대기.
- TECH QA: 실제 Main provider ready/Marker/자동gate입장/RGBA fissure/벽가 fade 검사. pageerror/404는 웹용이라 N/A, Godot 로그 오류 별도 기록. 자연 앵글러·문지기/region-clear→입장·boss 등장/죽음/재시도/복귀·결과·demoEnd는 기존 PC final interface 미인수로 NOT_READY. gate contact 렌더 하니스를 자연 완료로 세지 않음.
- FILES: product_field_view.gd / product_scene.gd / arena_preview.gd / capture_map11_landmark_gate.gd + 관련 docs. 공용 Main/World/State 변경0; 의존 merge에 포함된 타인 정상완료는 명시한SHA만.
- GIT: 경로 지정stage·본인branch 정상push/원격SHA 대조/DONE 이후 자기worktree제거. main push/rebase/force/deploy0.
- VISUAL VERDICT: **RETOUCH**. 4장 구현/렌더 근거는 제출하되 전체 아트·전투·D04 목표 달성 완료로 보고하지 않음.
- NEXT PASS: 맥북총괄4장 눈 검수 → gate 주변 접합/필요 아트만 보완, MAP11-15/16에서 자연전투/진행/성능·양플랫폼 검수. 새 생성은 맥북총괄 담당.

## 최종 기술 표본

| 항목 | 최종 결과·한계 |
|---|---|
| 실제 Main 검사 | 22 checks / 0 failures, 자동 gate 접촉→arena, 벽가 forest4개 alpha<.5 확인. Godot ERROR0, 기존 main.gd:264 Camera2D physics interpolation WARNING1 |
| 단일 최종 GUI 표본 | macOS26.6.2 / Apple M5 Pro / 24GiB / Godot4.7.2 gl_compatibility / 1920×1080·vsync off·uncapped. 최종 소스600 render frame, arena wall 정지·기존 intro actors5. 평균 146.28fps, p95 11.875ms, p99 12.637ms, max 24.712ms |
| D04 판정 | 평균이120을 넘지만 p95가8.33ms를 초과. **120fps 목표 달성 인수 아님**. 1초 이동창 최저60·이동60초+밀집60초·환경GPU3ms/추가CPU1.25ms·Windows 미측정. 렌더 수정/캡처 가림 문제를 고친 중간표본은 review 로그에만 보존하고 최종값에 합산0 |
| 시각 판정 | LANDMARK 여백/전체주실루엣·gate opening 후 떠있는 crop조각 제거·arena wall player 확인. 북쪽 바닥/외곽·gate 재질 접합 및 실제 적/탄 전투와 부분광 깊이는 총괄 눈검수·후속아트 RETOUCH. 관문/랜드마크를 AAA 완료로 선언0 |
