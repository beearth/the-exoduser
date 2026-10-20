> 2026-10-21 MAP11-16 제품 아트 현행: [승인 Seedream 바닥·외곽 나무 적용](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md). 아래 MAP11-15 및 이전 텍스처/성능 수치는 당시 이력이며 독립 프리뷰는 유지한다.

> 2026-10-21 MAP11-15 제품 현행: [보스룸 경계·맵 렌더 비용 보고](MAP11_FINISH_PERFORMANCE_20261021.md). R1700 충돌/Marker는 유지하고 제품 전용 뿌리·후경 숲·바닥 감쇠, 화면 밖 cull, 정적 바닥 필터 베이크, 정적 FBM 안개 캐시을 적용했다. 아래 이전 차수 수치·프리뷰는 당시 이력이며, 최신 실창 걷기 측정과 시각 판정은 연결 문서를 따른다.

> 2026-10-21 MAP11-14 현행 보충: [랜드마크·관문·제품 접합 보고](MAP11_LANDMARK_GATE_20261021.md). Main 필드는 G3/G4 RGBA로 교체, 제품zoom.70/offset(0,-180), 실제player 가림/짧은fade 연결. arena의 곡선 이중선 균열은 불규칙RGBA15fragment로 대체했다. 아래 원 검수 수치/프리뷰 상태는 해당 차수 이력이며 전체 자연전투·시각 승인 주장이 아니다.

# MAP11-01c — 바닥 생체 디테일·배우 접지·국소광 RETOUCH

STATUS=REVIEW_PENDING. 사용자/맥북총괄의 MAP11-01b `b12bf9a1` **RETOUCH**를 반영한 3차 proof다. **VISUAL VERDICT=RETOUCH / 맥북총괄 눈 검수 대기**. 원형R1700·입장zoom.65·배우 표시 크기와 원본 공격 범위는 유지했다. 사용자 지정 **같은 브랜치 codex/map11-01-20261021**에서 작업하며, 시작 최신main `45be76e49d0090316b91a6b7b383d81835e29192`와 인수된1b를 정상merge한 기준 `e71b6567cb2e545729f5ac99bf5a107409e3afbf` 위다. rebase/force/main push0, MAP11-02와 PC MAP11-03 소비자 파일 반입·변경0.

| 1x 검수 지적 / 01b | 01c 수정·눈 검수 경계 |
|---|---|
| 넓고 평평한 탁한 자주 한 톤 | 피부바닥을 저채도 갈색/회색 쪽으로 조정하고 기존 `map/props/prop_g_root.png` 2패치 + `map/ch1/floor_objects/flesh_g_0.png` 2패치를 낮은 RGBA decal로 배치. source soil RGBA 유지. 두 큰 갈래+보조 분기 균열을 init 시 곡선/taper 폭으로 저작, 암색 seam/좁은 붉은 중심/넓은 저채도 번짐. 두 적색 광원 주변의 동맥·조직 결이 이전보다 읽힘. 최초 proof의 곧고 균일한 선은 도로처럼 보여 수정했고 원로그 보존. 젖은 번짐은 기존 원화·명암의 proof이며 물리 PBR specular 구현 주장이 아님 |
| 보스/플레이어 접지 그림자 없음 | 기존 MAP-LOOK radial texture 생성 utility를 재사용해 부드러운 검은 타원2개, 보스240×66(world)/시각발밑y−22·플레이어54×19/y4, 배우 아래 draw order. 플레이어 child로 동행, 보스 clear board에서는 숨김. 원화 baked 그림자를 새로 넣거나 art원본 수정0. 실제 actor/피해 writer 변경0 |
| 밝고 낮은 대비·모서리에만 보이는 생체 숲 | ambient(.63,.60,.66)→(.31,.32,.39), 화면 vignette 추가(UI 위에는 적용0). broad rim6을 제거하고 균열2곳 red radius660/590 + player warm radius350/energy1.18, boss부근 weak cold fill1000/.38: 총4광원/3국소 pool. 기존 MAP-LOOK light·shadow·sway 재사용. outer tree feet1940~→1760~·corpsetree키600~→850~로 안쪽 silhouette가 넓게 걸치게 하되 collider/발밑은R밖. 보스 냉광은 어둠 속 몸체가 읽히도록 이동. 원형 근사는 몸체/탄막 전체 보드에서 확인하며 모든 4시점에 전체 원을 강제로 보이게 하려 줌을 되돌리지는 않음 |
| 전투 가독성 유지 | 바닥은 저채도 maroon/skin, 밝은 경고 링·점·파티클 생성0. geometry overlay는 unshaded로 진단선 대비 유지. 캐시한 tree 시각 rect에 player가 겹치면 foreground만 alpha.22까지 fade(원본 sprite refs/rect init 캐시·tick목록탐색0). 벽가 배우/발밑이 읽히는지1x 확인 대상. 실제 Q/E·적·탄·loot 동시 제품 전투는 이번 독립 proof에 연결하지 않아 완전 가독성 PASS로 승격0 |
| 캡처·전후 비교 | `_out/map11-01c/captures/` 입장/근접/벽가/클리어 1920×1080 네장 + body/탄막 두장, 각literal1x crop6장+바닥/보스접지 추가crop2장(총8). JSON에 crop좌표·줌·tick, manifest PNG SHA·추가바닥crop(170,240,640,520)/접지crop(770,430,400,300), `BOARD.html`에서 01b와 나란히 비교. 이전 `_out/map11-01b/captures/`는 보존. initial proof 별도 폴더 보존, 최종 루트와 구분 |

| 기술·범위 검수 | 수치·한계 |
|---|---|
| 관련 검사 | MAP11_RESULT {"checks":35,"d05":"circular smaller","failures":0,"live_combat":false} / MAPLOOK_RESULT {"assertions":16,"failures":0}. 신규 EXODUSER-map11-01c-Isolated-20261021, 기존 MAP-LOOK은 각 파일 상수 격리명. 원래 물리rim/회피고리/Marker/원본extent 검사 수 유지, 변경된 실제light4 기대 및 contact2/decal4/pool3 검사를 추가. 기존 검사는 약화0. 통과 suite 반복0. 최종 신규/캡처ERROR·WARNING0; 회귀ERROR0·미수정main.gd:261 Camera2D WARNING1 원문보존 |
| 120fps 예산 벤치1회 | 600physics tick@60Hz/warm120, 벽시계10.000049s/render5131/평균513.10fps/p95≤2.24ms/p99≤2.36ms/평균draw74.33. 1920×1080/M5 Pro24GB/Godot4.7.2/OpenGL compatibility/uncapped·vsyncOFF. 120fps=8.33ms/60하한. 맵CPU1.25ms/GPU3ms는 목표이며 실제GPU timer없음. driver CPU는 전체맵CPU아님. 01b 참고501.48fps/p95≤2.36ms와 작업별 별도측정이지 같은시각 A/B나 제품FPS보장 아님. 전체전투/PC 미측정 |
| 원본·공용 보호 | **Main0/State0/World0/factory0/Player0/hud0/project설정0줄**, 공용 파일별 수정 줄 범위 없음. 원본 game.html/BC01~10/이동·패링·방패·분노·hurtE/hurtP/docs2_3/저장0. scene Marker/geometry R1700/physics rim·source r15/r44·boss높이620.4·시각scale2.5·camera board 수치 불변. source tide1750은rim50밖, fissure2304+691.2는1295.2밖 그대로 |
| 틱·실행 | own tick get_method_list/get_script_method_list/get_children/keys/경로목록생성 API0. Tree refs와visualrect는 최초캐시, curve/width/texture 초기화, fade는캐시순회·수치갱신뿐. 매Godot exactpgrep≥2이면30초 대기, 매실행격리override 후0byte. 실제 사용자 저장 접근0. AI이미지/아트 생성0·기존RGBA byte불변 |

D03 판단: 기존 RGBA로 이번 proof/조명 검수는 가능하므로 생성하지 않았다. 다만 목질·기존 조직 패치는 전용 피부 동맥 균열 원화와 다르다. 전용 재질 품질이 필요하면 **대표 균열decal1장**을 먼저 비교하는 것이 적절하고, 그 proof 인수 뒤 부족할 때만 **젖은 피부 전이1장**을 후보로 둔다(전체세트 양산0). MagicLight 우선은 `MAP_OBJECT_SEEDREAM_PIPELINE_20260930.md`의 정책을 따르는 안이며 **현재 로그인/잔액/모델 실행가능성은 미확인**, 생성 가능한 상태였다고 주장하지 않는다. 다음은 각각500자 이하의 **미실행 초안**이다. 실제 레퍼런스·모델·잔액은 후속 생성 시 확인한다.

A — 동맥 균열:

> 2D ARPG ground decal, EXODUSER Hell Gothic rotten living forest. One asymmetric branching arterial fissure, torn desaturated skin lips, broad damp collagen and dark maroon artery, low relief, continuous large shapes readable at 1x. Isolated whole object on flat mid-gray, no terrain square. Runtime glow/shadow added later. No text, symbols, rings, dots, speckles, grain, dithering, sparkles, particles, baked lighting or shadow.

B — 필요시 젖은 전이:

> 2D ARPG ground decal matching the arterial proof. One irregular low wet-skin transition strip merging into rotten root fibers, desaturated skin and dark maroon tissue, broad continuous damp smear, subtle elongated sheen. Whole object on flat mid-gray, no upright tree or terrain square. No text, circles, dots, speckles, grain, dithering, sparkles, particles, baked glow, light or shadow.

두 초안 모두 실제 alpha/회색 matte/조직 뚫림/잔섬을 검사하고 피부색·검정 바닥의1x에서 점·스펙클·흰점·grain·dither가 보이면 탈락한다. 구운 광원/그림자/경고 링/텍스트를 넣지 않고 엔진에서 국소광을 준다. 실제 Q/E·탄·적 실화면과 명도·색·실루엣 검수 뒤만 아트 인수한다. 픽셀형 작은 점이 흩어진 기존 blood_splat은 이번 바닥 재질에 채택하지 않았다.

```text
================= MAP PRODUCTION REPORT (§23) =================
STAGE: CH1-1 arena pass3, 독립 preview
MASTER: 사용자D05 원형R1700/남entry·북exit·중앙boss/회피고리1300 유지
OUTER MASS: LEFT/RIGHT/TOP/SOUTH=기존 생체숲을 더안쪽 silhouette로;
            major holes=제품완성판정아님, 자연 외곽 연결 후속검수
LARGE: 기존8종 tree/시체나무 RGBA; overlap 확대·전체반복은후속아트
MEDIUM: 고치/저단제단 기존배치 유지, tree 시각가림 cache fade
GROUND: 기존RGBA4patch/곡선동맥균열/국소적색2pool; art접합 RETOUCH
PLAYABLE: 무기둥/동일rim·Marker/회피고리, 실제전투 가독성 미검수
LANDMARK: 북 시체나무/저단제단·중앙boss, 새로운전투오브젝트0
CAMERA QA: ENTRY/CLOSE/WALL/CLEAR+BODY/BULLETS+literal1x 눈검수;
           EARLY/SIDE/LATE 필드추가0, 1b카메라 board 수치 유지
TECH QA: 관련검사·고정N벤치위수치, error0; seam/제품loading/FPS승인 아님
FILES: maps/map11 자체leaf/shader/test·관련docs/번역등록/CHANGELOG;
       concurrent/unrelated touched=0
GIT: 경로지정stage/정상훅/같은자기branch push·remoteSHA/DONE후자기WT제거,
     deploy/main push/force/rebase=0, R HEAD/INDEX/WORK 불변
VISUAL VERDICT: RETOUCH — 개선proof 제출, 맥북총괄 시각 인수 대기
NEXT PASS: 4시점/1x·탄막 대비 검수, 필요시D03 대표균열decal proof만;
           실제Main/카메라/전투/DEMO 연결은 이번범위 밖
```
