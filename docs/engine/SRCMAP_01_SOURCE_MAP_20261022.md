# SRCMAP-01 — Mac 동결 구현의 웹 원본 대응표

## 기준과 조사 한계

| 항목 | 고정 값 |
|---|---|
| Godot 코드 기준 | `9133e27823549ad11fcf0380fe9d38060e15099f` (원격 branch ls-remote SHA 일치) |
| 웹 코드·에셋 기준 | `d79ee3e67d7d61989d7d962c2caf9b279734272e` (`origin/main`, d79ee3e67) |
| game.html | 동결 트리 `godot/source_snapshot/game.html`, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; 웹 main game.html과 바이트 동일 |
| 선독 문서 | `d79ee3e67d7d61989d7d962c2caf9b279734272e:docs/engine/PARITY_DIFF_LIST_20261022.md`, 전체 및 §2 |
| 저장소 시작 상태 | branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`; tracked INDEX/WORK diff 없음 |

조회는 fetch/git show/git grep/git ls-tree/ls-remote 및 메모리상 바이트 비교만 수행했다. Godot·브라우저·import·실제 저장 폴더는 실행/접근하지 않았다. 실행 중 화면이나 동작의 동일성을 증명하는 보고서가 아니라 동결 소스의 계보 조사다. `원본 이식`은 표에서 범위를 한정한 동일 파일에만 부여했다. 대응 기능이 있지만 빠진 하위 층은 `원본 부분 이식`으로 표기하고 “없음”을 명시했다. 개수는 아래 ID 행 수이며 파일 수·결함 수·완료율이 아니다. Godot 경로는 별도 표기가 없으면 `godot/scripts/` 기준, game.html 행은 snapshot 기준이다.

**기준 불일치:** PC 차이표는 미커밋 index.html 23줄을 포함한 캡처이며 v17 영상을 기술한다. 커밋 d79ee3e67의 index.html:632는 `video/world_intro_v15_clean_en.mp4`다. 본 표는 사용자 지정 Git 기준을 따르며 PC 작업 사본을 읽거나 v17을 현재 참조로 간주하지 않았다. 일부 기존 문서/포트 주석의 game.html 행 번호는 옛 번호(예44459)라 현행43941과 다르다. 아래는 현행 행을 사용한다.

## MAP11

| ID | Godot 파일·노드/함수 | 기능 | 웹 원본 근거·계보 | 원본 대응물 유무·차이 | 판정 |
|---|---|---|---|---|---|
| M01 | maps/map11/product_field_view.gd:10–32; field_ground_bake.gd:4–18 | 바닥·청크 | game.html:11612–11615,11754–11762,51922 `_drawCh1StartOuter` → production_finish/chunk_{0–7}_{0–7}.png 64장; 1024 core+1px bleed, 월드 cs=G.mw*T/8 | 없음: finish33/ground/ground.json 및 field_ground_filtered.png 사용 | 신규 제작 |
| M02 | target32_scene.gd:4–34; upscale01_tiles.gd:4–40 | 첫 구역 target32 / 아레나 target30 층 | 위 M01 원본 청크와 다른 이미지. assets/maps/map11/target32/{split,bake_32b}.json, target30/split.json은 독립 source_sha256·source_foot 사용 | 없음: floor/foreground/white_tree/fog로 자체 분해 | 신규 제작 |
| M03 | assets/maps/map11/upscale01/manifest.json:1–8; tools/map11_upscale01.py:1–18 | Real-ESRGAN 업스케일 계보 | 웹 청크를 이식한 기록 아님. docs/4.1맵디자인+설정/MAP11_TARGET_FRAMES_20261021.md:1–80의 target_frames/ch1_field_corridor_target.webp, ch1_boss_arena_target.webp 원화와 x4plus; field1.5×/arena2× | 없음: 독립 목표 원화의 파생 산출물 | 신규 제작 |
| M04 | product_field_view.gd `_build_mass`, `_rgba` | 손배치 오브젝트 | game.html:17547–17640 메타,18118–18170 `_MAP_COMPOSE[0].handProps`: 고목8, m_c1tree(102,90), camp(45,100), altar(147,97), cocoon(47,50); collision/*.png | 부분: prop_corpsetree/altar/cocoon/rotforest PNG 재사용, 좌표·크기·구성은 별도 | 원본 부분 이식 |
| M05 | tour_layout.gd; tour_textures.gd; north32c_tour.gd; assets/map/map11/props/{skull_25d,tour_25d}/source_manifest.json | Tour 소품·Meshy | 웹 handProps 위 M04와 다름. manifest가 Meshy image-to-3D 및 2.5D 렌더를 명시 | 없음: 재렌더된 diffuse/normal/contact 및 별도 배치 | 신규 제작 |
| M06 | product_field_view.gd:19–21 `_build_forest`; target32_scene.gd:37–48 | 숲 경계 3층 | game.html:51923 Ch1ForestSway →51928 Ch1BorderForeground.drawBack →51929 Ch1BoundaryEdge; ch1-forest-sway.js / ch1-boundary-edge.js / ch1-border-foreground.js, production_finish/outer90_sources/rotforest_mass_0*.png | 없음: BACK/MID/FRONT 이름은 있어도 웹 경계 3종과 배치·데이터가 다름 | 원본 부분 이식 |
| M07 | product_field_view.gd `_rgba`; target32_scene.gd:43–48 | 깊이·가림 | game.html:16651–16656,18501–18574 깊이 슬라이스·footY·가림 알파 .62/고스트 .55 | 부분: 발 기준 정렬/가림 개념 존재, target32는 move_toward .20, delta*8; 원본 슬라이스 그대로 아님 | 원본 부분 이식 |
| M08 | product_scene.gd:55–60; fog_pass.gd:5–21; product_lighting.gd:34–44,118–134 | 안개 | game.html:9000–9046 FBM;52652–52699 ATMOS;55352–55373 하단/상단 안개 .28±.08·top .6·Three FBM | 부분: NativeFogGL 수정 후 world p/11000·depth 마스크·색(.12,.17,.23)로 대체 | 원본 부분 이식 |
| M09 | product_lighting.gd:15–40 | 조명 | game.html:4693–4715,55199 동적 lightmap 앰비언트 [6,16,9,.38];51939 이후 플레이어 원형 빛 | 부분: 원본 NativeLightmap 비활성; CanvasModulate(.38,.43,.52), PlayerKey radius420 energy.48 및 별도 pool | 원본 부분 이식 |
| M10 | clarity_pass.gd:3–10; clarity_pass.gdshader:7–23; native_screen_lighting.gd | 그레이딩 | game.html:51451–51453,51681–51723 multiply .18 / 상단40% screen .10 / vignette .55,55409–55413 CSS contrast/brightness | 원본 PP 체인과 1:1 대응 확인 불가; MAP11에 별도 CAS 5탭 contrast 존재 | 원본 부분 이식 |
| M11 | product_lighting.gd:38–49; arena_vignette.gdshader:3–5 | 비네트·환경광 | game.html:51690–51718,55375–55405 원본 PP+환경광+동적 비네트 | 부분: NativeEnvLight/NativeVignette 숨김, 별도 edge*.16 보라 비네트 | 원본 부분 이식 |
| M12 | product_scene.gd:62–63; boss11_camera.gd | 카메라 zoom/offset | game.html:35722–35741 평소1.0/보스.80, look-ahead v*25, .92/.85/.95 추적;11903–11908 `_clampCamToMap` | 없음: MAP11 .70 / (0,-180), 웹 카메라 계약과 다름 | 신규 제작 |
| M13 | field_recipe.gd:2–5,31–44; field_runtime.gd:33–46 | 충돌·보행 마스크 | game.html:29971–29984 `_buildCh1StartForestRLE` → CH1_1_PRODUCTION.buildRLE,30042–30050 `_cloneField11`; assets/map/ch1/production_finish/layout.js | 없음: 직접 작성한22점 outer와 원형 solids; 웹200×200 semantic tile mask 아님 | 신규 제작 |
| M14 | field_recipe.gd:15–30; field_flow.gd; field_runtime.gd:130–144 | 경로·시작/출구 | game.html:30042–30050,18118–18170 원본 맵·빈 전투공간·앵커; layout.js 보행영역 | 없음: start(0,3700), gate(0,-3750), 독립 waypoint graph/clearance96/flow | 신규 제작 |
| M15 | field_runtime.gd:59–72,91–116 | 스폰·지역 | game.html:30049–30050 원본 소환굴 보정(70,170)→(74,168);31029–31030 소환수 공식;60698 이후 지역 | 부분: count API 재사용, size .3 네 앵커·새 region 이름/좌표·total은 독립 | 원본 부분 이식 |

## 인트로 DEMO11-08

| ID | Godot 파일·노드/함수 | 기능 | 웹 원본 근거·계보 | 원본 대응물 유무·차이 | 판정 |
|---|---|---|---|---|---|
| I01 | native_demo_lobby_screen.gd:108–158 | 로비·캐릭터 생성 화면 | index.html:605–606 FDG 영상;4494 이후 title motion(현재4605);737–838 로비;870 이후 #charVisualPop(장면·3분할 무대·정보/특성/초상 CSS) | 부분: 정지 이미지·폼으로 재구성, 영상·배치 동일하지 않음 | 원본 부분 이식 |
| I02 | native_story_intro.gd `_start_segment`; native_story_intro.json segment world | 로비 시네마틱→세계의 기록 I | index.html:629–632 intro.mp4→world_intro_v15_clean_en.mp4;2354 playCinematic,2509–2550 문 영상 끝/1.5초 fade 및 WorldIntroPlayer;world-intro-player.js:4 CUTS | 없음: 로비 영상 대신 게임 시작 뒤 68,800ms p01~p17 정지 슬라이드 | 신규 제작 |
| I03 | native_story_intro.json world.cues | p01~p17·구 자막 출처 | index.html:2323–2344 CIN_LINES 레거시;assets/cutscene/prologue/p01.jpg,p01b.jpg,p02~p17.jpg,img/logo_exoduser.png | 없음: 과거 원본 이미지·문구·dur 재사용은 맞지만 현행 영상 대신 새 슬라이드 구성 | 신규 제작 |
| I04 | native_story_intro.json warrior; native_story_intro.gd:74–98 | 캐릭터 생성 직후 이야기 | index.html:3421 ExoduserCharacterStory.play;character-story-player.js:1–29 warrior_story_v23_clean.mp4 + video/subtitles/warrior_story_v23_{lang}.vtt;CUES1,5.5,…92.9초 | 없음: 생성 직후 영상 대신 game.html PROLOGUE_LINES(62598 이후)에서 warintro JPG를 추출한104,500ms 슬라이드 | 신규 제작 |
| I05 | native_story_intro.json intro.cues | 첫 진입 INTRO 이미지·자막·t/dur | game.html:62746–62820 INTRO_CUTSCENE_LINES;assets/cutscene/images/00~20.png;62910–62944 보통 INTRO, 강제 preview만 PRO | 부분: 25cue 이미지·KO/EN·시간 재사용;speaker/cam/vfx/fade/text_cfg/sfx 누락, duration84000ms는 입력대기 없는 타임라인 | 원본 부분 이식 |
| I06 | native_story_intro.gd:42–58 `_build` | 액자 화면·상하 띠 | game.html:62874–62878 전체화면 cutC,62967 이후16:9 레터박스;63055–63085 full cover 이미지 | 없음:108px/238px α.93 띠·금선·세계의 기록 I/II/III·3구간 자동연결은 독립 UI | 신규 제작 |
| I07 | native_story_intro.gd:74–98 `_select_cue` | 크로스페이드·카메라·VFX | game.html:62748–62771 컷별 fade.in300~800 등;63047–63085 alpha/zoom/pan/shake/grade/vignette;예 첫 컷800ms in/200ms out,1→1.08 | 없음: ImageTexture 즉시 교체;웹 연출 메타 적용 분기 없음 | 원본 부분 이식 |
| I08 | native_story_intro.gd:52,86 `_subtitle` | 화자명·타이핑·입력대기 | game.html:62588–62592 네메시아#c084fc/디로이#e8d4b8/핵터#fb923c;63125–63187 하단22%·speed ms/글자(예60)·대기·500ms▼;localization-data.js stories.speakers | 없음:34px 중앙 정렬 subtitle 전체 표시, 화자·색·타이핑·대기 없음 | 원본 부분 이식 |
| I09 | native_story_intro.gd:6,114–145 | 스킵·언어 | game.html:62868 Space2000ms hold;character-story-player.js:4 HOLD_MS1200, 로비 captions world-intro-subtitles.js:16–36 다국어 VTTCue | 부분:INTRO 2초 재사용;세 구간 모두2초·KO/EN만으로 제한, 캐릭터스토리1200ms 및 다국어와 다름 | 원본 부분 이식 |
| I10 | native_story_intro.gd:69–76,147–154 | BGM·음성·종료 인계 | game.html:62934–62942 fadeOut300/400ms 후 cutscene_nemesis, PRO voice;world-intro-player.js:6–23 VO1/BGM.22 및1초 duck;character-story-player.js:23 volume1 | 부분:scene music key 요청은 있으나 영상 VO/컷 sfx·페이드 타이밍 없이 구간별 BGM 및 guide 인계 | 원본 부분 이식 |

## HUD

| ID | Godot 파일·노드/함수 | 기능 | 웹 원본 근거·계보 | 원본 대응물 유무·차이 | 판정 |
|---|---|---|---|---|---|
| H01 | hud.gd:399–436 NativeHPGlobe/NativeSPGlobe ColorRect | 구슬1·2층:클립·액체 | game.html:143–290 CSS,2615–2662 DOM:liquid-wrap z5, HP#6B1020→#1E050A·MP/SP 분할액체·translateY .5~.6초 | 부분:원형 shader·색상 재현, CSS 액체 이동 애니메이션 없음 | 원본 부분 이식 |
| H02 | hud.gd:441 `_texture` | 구슬3층:유리 프레임 PNG | game.html:143–290 .globe-glass z30 inset−44 brightness.6;img/ui_globe_hp.png,ui_globe_mp.png | 부분:동일 PNG이나236.7크기/offset(-43.2,-39.6)로 이식;전체 레이아웃 동일 아님 | 원본 부분 이식 |
| H03 | hud.gd `_resource_orb` 399–442 | 구슬4층:보호막·사슬 링 | game.html:143–290,2615–2662 .globe-ring-wrap z33 HP#3399ff conic shield,MP#ffcc33 사슬+54도 눈금 | 없음:해당 생성 노드/셰이더 없음 | 원본 부분 이식 |
| H04 | hud.gd:249–266,329–338 | 구슬5층:HP/MP/SP 숫자 | game.html:2615–2662 .globe-val z35,60244 이후 updateHUD·60300–60305 자원 표기 | 부분:HP에는 생명력 라벨/여러 줄,MP/ST 표기;원본 SP와 불일치.초기516/391/306 대533/265/280은 PC 캡처값이며 본 조사 실측 아님 | 원본 부분 이식 |
| H05 | hud.gd `_resource_orb` | 구슬6층:해골 눈 | game.html:143–290 .skull-eye z50 붉은 눈 glow | 없음:독립 eye 노드/애니메이션 없음(프레임 PNG 자체와 구별) | 원본 부분 이식 |
| H06 | assets/ui/{ui_globe_hp.png,ui_globe_mp.png,ui_bar_only.png,mm_frame.png} | 공유 원본 PNG 파일4개(파일 단위) | origin/main img/동명 파일4개 | 있음:Git blob 바이트 동일;이 행은 파일 자체만 집계 | 원본 이식 |
| H07 | hud.gd:944–1051 NativeMinimap; main.gd:357–359 | 미니맵 | game.html:2585 mmWrap166/캔버스130;382–386 CSS;60173–60230 drawMM;1174 native 20frame/적30frame | 부분:미니맵 코드·프레임 존재하나 MAP11에서 hide, 자체 geometry 대체맵 없음 | 원본 부분 이식 |
| H08 | native_floating_text_adapter.gd; port_modules/floating_text/producer.gd:26–48 | 데미지 숫자 풀·바운스·상승 | game.html:43929–43938 addTxt ring40/life35,54829–54872 탄성·alpha·atlas 분기;rise .6*sp | 부분:pool/상수/바운스 이식 존재.카메라 .70·폰트·실제 발행 size 조합까지 동일 미확인 | 원본 부분 이식 |
| H09 | port_modules/number_atlas/producer.gd:19–61; native_floating_text_adapter.gd `_start_number_atlas_once` | 데미지 숫자 아틀라스 | game.html:43941–43990 _buildNumAtlas 48×56·10자리×3색·90044px Pirata One·glow12·outline3 | 부분:480×168 런타임 bake/supply 존재;Pirata One 부재로 NotoSansKR 사용,baseline/blur/AA 차이를 코드가 명시 | 원본 부분 이식 |
| H10 | hud.gd:344–351,680–745,746–875 | 스킬바·아이콘·쿨다운 | game.html:310,711–724,2589–2608 #skBar13칸;44118–44134 SKILL_ICONS/_skIcon;img/skillskin_upscaled/*.png | 부분:원본 bar·아이콘 대응/선택·cd 소모자 존재,레이아웃/숫자 표시는 Godot Control 재구성 | 원본 부분 이식 |
| H11 | native_demo11_hud_owner.gd:66–80 및 refresh_native_owners | 스킬 선택·실패 토스트 | game.html #skBar 2589–2608은 슬롯 표시;해당320×40 selection strip의 원본 대응 확인 안 됨 | 없음:Demo11OwnerHUD가 별도 strip/selection/failure 생성 | 신규 제작 |
| H12 | hud.gd 및 native_demo11_hud_owner.gd | 버프/디버프 표시 | game.html:35866–35876 BH.status 그로기/면역/출혈/독/화상/감전6프레임 갱신;플레이어 전용 버프바와는 구별 | 대응 확인 불가:위 두 스크립트 buff 검색 미검출;다른 모든 소비자 부재로 단정하지 않음 | 원본 확인 불가 |
| H13 | native_regions.gd:223–277;field_runtime.gd:91–99, native_regions.gd:299–305 | 지역명·구역명·진입/정화 배너 | game.html:333–354,2678–2679,60241 _showHudAreaTitle,60742 이후 regionBanner | 부분:원본 배너 개념/포맷 재사용;MAP11 provider의 마른 심재 고리/습윤 고리/기상터/중앙 전투면으로 이름·지역 변경 | 원본 부분 이식 |
| H14 | hud.gd:610–679,807–841 | 우상단 레벨/EXP/처치/악의·시계 | game.html:372–381,2575–2584 mmLvl;60310–60336 updateHUD | 부분:포맷과 source state 사용;224×118 재구성 및 MAP11 스폰total이 달라 처치분모 달라짐 | 원본 부분 이식 |
| H15 | hud.gd:1055–1153 | 좌측 화폐·전투력 | game.html:327,2664–2669 hudCorner;60325 이후 CP·화폐 | 부분:source state/공식 대응은 있으나 초기 장비·스탯 상태 및 화면 동일성 미검증 | 원본 부분 이식 |
| H16 | native_pets.gd 자막 루트 | 펫 자막·초상 | game.html:2587 petSubtitle/portrait/bubble;9366–9390 대화;img/crow/portrait.png,img/cat_pet/portrait.png | 부분:펫 표시 기능 존재;PC 차이표 H06의 반투명 판 차이는 실측 재확인하지 않음 | 원본 부분 이식 |

## 웹 실제 맵 렌더 구조와 미대응 지점

| 아래→위 | 웹 원본 행/함수 | MAP11 대응 |
|---|---|---|
| 청크64장 | 11612–11615,11754–11762,51922 | M01:다른 ground 청크 |
| 숲 흔들림·얼굴·나무36그루·언덕·해자 | 51923–51927 Ch1ForestSway/FaceLife/RotTrees/Hill/AltarMoat | 별도 forest/target32가 있으며 이 웹 호출 체인의 직이식 아님 |
| 경계 후면·접지 | 51928–51931 BorderForeground.drawBack/BoundaryEdge/LivingDetail | M06:다른 경계 구성 |
| 조명·데코·뒤쪽 오브젝트 | 51939 이후 point light,18501–18574 MAP_OBJS y정렬 | M04/M07/M09:이미지 일부만 재사용 |
| 아이템·ATMOS·적·VFX·플레이어·앞 슬라이스 | 52652–52699,16651–16656,18501–18574 | 개별 전투 기능은 본 조사 범위 밖;MAP11 가림 계약은 다름 |
| 플로팅 숫자 | 54829–54872 | H08/H09 포트 존재,폰트 차이 |
| PP·동적 조명·블룸·안개 | 51681–51723,55199,55335–55373 | M08–M11 원본 lightmap 일부 꺼짐·자체 대체 |
| 환경광·비네트·CSS·미니맵 | 55375–55413,60173–60230 | M11/H07 환경광·비네트·미니맵 숨김 |

## 영역별 집계

| 영역 | 원본 이식 | 원본 부분 이식 | 신규 제작 | 원본 확인 불가 | 합계 |
|---|---:|---:|---:|---:|---:|
| MAP11 | 0 | 8 | 7 | 0 | 15 |
| 인트로 DEMO11-08 | 0 | 6 | 4 | 0 | 10 |
| HUD | 1 | 13 | 1 | 1 | 16 |

## 웹 그대로 옮길 때 재사용/교체할 범위

“버려야 할 것”은 동일성 구현의 입력/기본 표시에서 제외할 범위다. 보존 파일 삭제나 변경은 수행하지 않았다.

| 영역 | 재사용 가능한 것 | 버려야 할 것 / 교체할 표시 계약 |
|---|---|---|
| MAP11 | 웹 production_finish 청크64·layout.js·composition.json,handProps와 OBJ_META,collision/floor_objects 원본 PNG,경계3종 스크립트;Godot 이미지 로딩/컬링은 별도 검토 후 재사용 가능 | 독립 field_recipe 좌표/충돌/스폰,컨셉 target_frames 파생판·target30/32·finish33·upscale01,Tour/Meshy 렌더 배치,.70/(0,-180),원본 조명 숨김/자체 조명 마스크 |
| 인트로 | 현행 로비/캐릭터 영상·자막·WorldIntroPlayer/CharacterStory 원본 타임라인,INTRO_CUTSCENE_LINES 전체 메타·00~20.png·화자 데이터,2초 INTRO 스킵 입력 개념 | 세계의 기록 I/II/III 합본 액자·띠·정지 교체·자동 대사 진행;현행 로비 영상 대용 p01~p17,기본 진입의 PRO warintro. 원본 레거시 파일 자체 삭제를 뜻하지 않음 |
| HUD | 동일 PNG4개·원본 skill 아이콘(파일별 바이트는 아래 추가 대조),source state 표시 어댑터,미니맵 코드,숫자 pool/atlas supplier 구조 | ST/생명력 다중행 표시·누락 링/눈·MAP11 미니맵 hide·별도 스킬 토스트·Pirata One 없는 글꼴 대체;수치 mismatch 원인은 로직 별도 조사 필요 |

## 증거: 파일 바이트 대조

동일 에셋이 존재해도 실제 배치·타이밍·표시가 같다는 뜻은 아니다. 아래 Git blob OID 동일은 파일 바이트 동일을 뜻한다.

| Godot 파일 | 웹 파일 | Godot blob | 웹 blob | 동일 |
|---|---|---|---|---|
| godot/assets/ui/ui_globe_hp.png | img/ui_globe_hp.png | `d8c621c9f7d1a6ceb250a9a311d7a961a9e9d6f3` | `d8c621c9f7d1a6ceb250a9a311d7a961a9e9d6f3` | 예 |
| godot/assets/ui/ui_globe_mp.png | img/ui_globe_mp.png | `d8c621c9f7d1a6ceb250a9a311d7a961a9e9d6f3` | `d8c621c9f7d1a6ceb250a9a311d7a961a9e9d6f3` | 예 |
| godot/assets/ui/ui_bar_only.png | img/ui_bar_only.png | `d1856095edd47ab3ba2baff7bcfdaba43d0ff9f2` | `d1856095edd47ab3ba2baff7bcfdaba43d0ff9f2` | 예 |
| godot/assets/ui/mm_frame.png | img/mm_frame.png | `7784267fa66eef193ba44c38bc7d05a7df34ceab` | `7784267fa66eef193ba44c38bc7d05a7df34ceab` | 예 |
| godot/assets/map/ch1/collision/rotforest_tree_01.png | assets/map/ch1/collision/rotforest_tree_01.png | `3184ebe25bb6440c2d01716a17224762e996c8de` | `3184ebe25bb6440c2d01716a17224762e996c8de` | 예 |
| godot/assets/map/ch1/collision/prop_corpsetree.png | assets/map/ch1/collision/prop_corpsetree.png | `7582d3d9f9a8f3708c417aa607248318cc8d70ac` | `7582d3d9f9a8f3708c417aa607248318cc8d70ac` | 예 |
| godot/assets/map/ch1/collision/prop_altar.png | assets/map/ch1/collision/prop_altar.png | `3bba5813b1510a1ca27ff4ff72a8db9b9d68acd2` | `3bba5813b1510a1ca27ff4ff72a8db9b9d68acd2` | 예 |
| godot/assets/map/ch1/collision/prop_cocoon.png | assets/map/ch1/collision/prop_cocoon.png | `daeb5767c6dd996fc52876dedb70ea3d54e3afcf` | `daeb5767c6dd996fc52876dedb70ea3d54e3afcf` | 예 |

## 인트로 추출 cue 전체(동결 JSON)

Godot cue에는 아래 여섯 필드만 있으며 웹 연출 필드는 없다. 시간은 ms. 웹 영상 컷/자막 시계와 구분한다.

| 구간 | id | t | dur | 에셋 | 한국어 자막 |
|---|---|---:|---:|---|---|
| world | world-0 | 0 | 3400 | assets/cutscene/prologue/p01.jpg | 우주에는 셀 수 없는 세계가 있다 |
| world | world-1 | 3400 | 3000 | assets/cutscene/prologue/p01b.jpg | 끝없는 시대, 끝없는 메타우주 |
| world | world-2 | 6400 | 3600 | assets/cutscene/prologue/p02.jpg | 그러나 지옥은 하나다 |
| world | world-3 | 10000 | 3400 | assets/cutscene/prologue/p03.jpg | 모든 세계의 악의가 한 곳으로 흘러든다 |
| world | world-4 | 13400 | 3600 | assets/cutscene/prologue/p04.jpg | 죽은 자의 세계와 지옥을 잇는 길은 단 하나뿐이다 |
| world | world-5 | 17000 | 3000 | assets/cutscene/prologue/p05.jpg | 들어온 것은 나가지 못한다 |
| world | world-6 | 20000 | 3800 | assets/cutscene/prologue/p06.jpg | 나가지 못한 영혼은 환생하지 못한다 |
| world | world-7 | 23800 | 3000 | assets/cutscene/prologue/p07.jpg | 그리고 억겁의 시간이 흐른다 |
| world | world-8 | 26800 | 3600 | assets/cutscene/prologue/p08.jpg | 고통은 살에 스며들고 살은 제 형체를 잊는다 |
| world | world-9 | 30400 | 4000 | assets/cutscene/prologue/p09.jpg | 지옥의 모든 괴물은 한때 어딘가의 누군가였다 |
| world | world-10 | 34400 | 3200 | assets/cutscene/prologue/p10.jpg | 나가는 길은 하나뿐이다 |
| world | world-11 | 37600 | 3600 | assets/cutscene/prologue/p11.jpg | 찢고 나가는 것 |
| world | world-12 | 41200 | 3400 | assets/cutscene/prologue/p12.jpg | 지옥은 시대를 묻지 않는다 |
| world | world-13 | 44600 | 4000 | assets/cutscene/prologue/p13.jpg |  |
| world | world-14 | 48600 | 3600 | assets/cutscene/prologue/p14.jpg | 검을 쥔 자도, 강철의 몸을 가진 자도 |
| world | world-15 | 52200 | 3600 | assets/cutscene/prologue/p15.jpg | 어느 현실에서 떨어졌든 도착지는 같다 |
| world | world-16 | 55800 | 3800 | assets/cutscene/prologue/p16.jpg | 오래 머문 것은 자신이 무엇이었는지 잊는다 |
| world | world-17 | 59600 | 4200 | assets/cutscene/prologue/p17.jpg | 그리고 추락은 영겁의 세월 동안 멈추지 않을 것이다... |
| world | world-18 | 63800 | 5000 | img/logo_exoduser.png |  |
| warrior | wa01 | 0 | 2500 | assets/cutscene/warintro/cin_war.jpg |  |
| warrior | wa02 | 2500 | 2500 | assets/cutscene/warintro/cin_war.jpg | 전쟁에서 살아 돌아온 한 남자. |
| warrior | wa03 | 5000 | 500 | assets/cutscene/warintro/cin_war.jpg |  |
| warrior | wa04 | 5500 | 5000 | assets/cutscene/warintro/cin_ruins.jpg | 하지만 집은 모두 불타 사라졌다. |
| warrior | wa05 | 10500 | 2500 | assets/cutscene/warintro/cin_ruins.jpg |  |
| warrior | wa06 | 13000 | 4500 | assets/cutscene/warintro/cin_throne.jpg | 이웃이자 친구였던 킬루가 그의 가문을 짓밟았다. |
| warrior | wa07 | 17500 | 2200 | assets/cutscene/warintro/cin_throne.jpg |  |
| warrior | wa08 | 19700 | 4200 | assets/cutscene/warintro/cin_throne.jpg | 아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, |
| warrior | wa09 | 23900 | 3100 | assets/cutscene/warintro/cin_throne.jpg | 끝내 못 이겨 스스로 목숨을 끊었다. |
| warrior | wa10 | 27000 | 1600 | assets/cutscene/warintro/cin_throne.jpg |  |
| warrior | wa11 | 28600 | 4400 | assets/cutscene/warintro/cin_throne.jpg | 아이들은 노예로 팔려가 어디에 있는지조차 알 수 없다. |
| warrior | wa12 | 33000 | 4000 | assets/cutscene/warintro/cin_throne.jpg | 늙은 부모는 감옥에 갇혀 굶어 죽었다. |
| warrior | wa13 | 37000 | 1800 |  |  |
| warrior | wa14 | 38800 | 4500 | assets/cutscene/warintro/cin_bystanders.jpg | 킬루 가문의 모두가 알고 있었다. |
| warrior | wa15 | 43300 | 2700 | assets/cutscene/warintro/cin_bystanders.jpg | 31명이 보고도 못 본 척했다. |
| warrior | wa16 | 46000 | 1900 |  |  |
| warrior | wa17 | 47900 | 3100 | assets/cutscene/warintro/cin_bloodbath.jpg | 그날 밤, 킬루 가문을 모두 죽였다. |
| warrior | wa18 | 51000 | 2600 | assets/cutscene/warintro/cin_bloodbath.jpg |  |
| warrior | wa19 | 53600 | 3000 | assets/cutscene/warintro/cin_torture.jpg | 칼로 킬루의 팔다리를 자르고 |
| warrior | wa20 | 56600 | 2600 | assets/cutscene/warintro/cin_torture.jpg | 불로 지혈까지 해주며 |
| warrior | wa21 | 59200 | 6000 | assets/cutscene/warintro/cin_torture.jpg | 오래오래 살려두었다. |
| warrior | wa22 | 65200 | 3000 | assets/cutscene/warintro/cin_remember.jpg | "기억하라." |
| warrior | wa23 | 68200 | 5400 | assets/cutscene/warintro/cin_remember.jpg | "그리고 지옥에서도 후회하라." |
| warrior | wa24 | 73600 | 2400 | assets/cutscene/warintro/cin_fallhell_custom.jpg | 그리고 지옥에 떨어진다. |
| warrior | wa25 | 76000 | 2900 |  |  |
| warrior | wa26 | 78900 | 3600 | assets/cutscene/warintro/emg1.jpg | "...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐." |
| warrior | wa27 | 82500 | 2300 | assets/cutscene/warintro/emg1.jpg |  |
| warrior | wa28 | 84800 | 4100 | assets/cutscene/warintro/cin_demonbattle.jpg | "지옥의 미로에는 매일 새로운 영혼이 떨어진다." |
| warrior | wa29 | 88900 | 5100 | assets/cutscene/warintro/cin_demonfight.jpg | "분노로 가득 찬 자, 억울함에 미친 자, 사랑을 잃은 자..." |
| warrior | wa30 | 94000 | 800 |  |  |
| warrior | wa31 | 94800 | 2200 | assets/cutscene/warintro/cin_nemesia_hd.jpg | "너는 왜 지옥에 왔느냐?" |
| warrior | wa32 | 97000 | 2000 | assets/cutscene/warintro/cin_nemesia_hd.jpg |  |
| warrior | wa33 | 99000 | 4000 | assets/cutscene/warintro/cin_nemesia_hd.jpg | "지옥을 탈출하라, 죄인이여." |
| warrior | wa34 | 103000 | 1500 |  |  |
| intro | 1 | 0 | 2500 | assets/cutscene/images/00.png |  |
| intro | 2 | 2500 | 1500 | assets/cutscene/images/01.png |  |
| intro | 3 | 4000 | 4500 | assets/cutscene/images/02.png | 네놈의 그 짜릿한 복수극, 감명 깊게 잘 봤다. 명작이더구나. |
| intro | 5 | 8500 | 5000 | assets/cutscene/images/03.png | 그토록 피를 묻히고도, 네놈 안의 선의는 아직 남아 있구나.<br>네가 구해야 할 이가 누구인지… 잊지는 않았겠지?<br>아직도 너를 기다리고 있다.<br>서둘러라. 너무 늦기 전에. |
| intro | 6 | 13500 | 1500 | assets/cutscene/images/04.png |  |
| intro | 7 | 15000 | 2500 | assets/cutscene/images/05.png |  |
| intro | 8 | 17500 | 3000 | assets/cutscene/images/06.png | 그 아이의 목마를 보니 망자도 정신이 드는가 보구나. |
| intro | 9 | 20500 | 2500 | assets/cutscene/images/07.png |  |
| intro | 10 | 25000 | 4500 | assets/cutscene/images/08.png | 그래, 이곳을 탈출하라. 내 친히 너를 도와주마.<br>디로이와 핵터가 너를 안내할 것이다. |
| intro | 10c | 29500 | 2500 | assets/cutscene/images/09.png | 또 보자, 망자여. |
| intro | 11 | 32000 | 3000 | assets/cutscene/images/10.png | 놀랄 거 없어. 인사나 하지. 내가 디로이. |
| intro | 12 | 33000 | 3500 | assets/cutscene/images/11.png | 내가 핵터. 우릴 여신님의 가호라고 생각하면 돼.<br>우리도 이곳을 나가야 하거든. |
| intro | 13 | 36500 | 4000 | assets/cutscene/images/12.png | 악마는 악의로 만들어진 존재야.<br>본능적으로 선의를 공격하려 들어. |
| intro | 14 | 40500 | 5500 | assets/cutscene/images/13.png | 근데 너는 좀 특이해. 선의가 강하거든.<br>악의는 일시적으로 폭발한 상태야. 그 기세도 곧 가라앉을 거야. |
| intro | 15 | 46000 | 3500 | assets/cutscene/images/14.png | 그래서 악마들이 네 냄새를 맡고 몰려들 거야. |
| intro | 16 | 49500 | 5000 | assets/cutscene/images/15.png | 여신님이 네게 무구를 내리셨어. 챙겨. |
| intro | 17 | 54500 | 5500 | assets/cutscene/images/16.png | 여신님이 보내신 투영이야. 전장의 영혼이지.<br>쇠뇌에 깃들어서 너랑 같이 싸울 거야. |
| intro | 18 | 60000 | 2500 | assets/cutscene/images/17.png |  |
| intro | 18b | 62500 | 5500 | assets/cutscene/images/18.png | 그 악의띠도 차. 폭발한 악의가 너를<br>미치게 하기 전에 정신을 잡아줄 거야. |
| intro | 19 | 65500 | 2500 | assets/cutscene/images/19.png |  |
| intro | 20 | 68000 | 2000 | assets/cutscene/images/20.png |  |
| intro | 21 | 70000 | 3500 | assets/cutscene/images/20.png | 이 인간 또 기절했네. 얼마나 안 잔 거야? |
| intro | 22 | 73500 | 4000 | assets/cutscene/images/20.png | 복수만 생각하느라 며칠을 안 먹고 안 잔 모양이야. |
| intro | 22b | 77500 | 2500 | assets/cutscene/images/20.png | 놔두면 잡아먹혀. |
| intro | 23 | 80000 | 2500 | assets/cutscene/images/20.png | 악의라도 먹여서 깨워야 해. |
| intro | 24 | 80000 | 2500 | assets/cutscene/images/12.png | ... |
| intro | 25 | 82500 | 1500 |  |  |

## 웹 영상·언어 근거

| 항목 | 고정 원본 |
|---|---|
| 로비 영상 컷 경계(초) | world-intro-player.js:4:0,4.041667,12.75,17.291667,27.791667,46.291667,56.291667,69.291667,76.291667,78.041667,80.291667,84.791667,87.791667,90.791667,95.791667,102.791667,109.291667 |
| 로비 자막 | world-intro-subtitles-data.js timings/languages → world-intro-subtitles.js:16–36 VTTCue(start,end,text),align center,size84,line−3.화자 타이핑 대신 영상 음성+동기자막 |
| 생성 스토리 | character-story-player.js:3 CUES(1,5.5,10,16,22.5,28,33.5,39,42.24,46.5,51,53.48,56.02,59.5,59.98,65,70.67,76,81.5,88,90.3333,92.9),4 HOLD_MS1200,21–29 mp4/언어별vtt.영상 내 크로스페이드 초별 값은 JS에 없으므로 확인 불가 |
| 언어 | Godot native_story_intro.gd:35–36 ko 외 en;웹 localization-data.js stories 및 WorldIntroSubtitleData.languages/언어별VTT. lang_*.js의 모든 시스템 역할까지 이식됐다고 확인하지 않음 |

## 확인 한계

- 코드상 호출/메타/파일 계보만 확인했다. Mac 실제 화면·재생·GPU 글리프 bake·충돌·스폰 성공은 미검증이다.
- PC 캡처의 수치·영상 길이·음성 실측을 이 조사에서 재측정하지 않았다. 네메시스 시간은 JSON84000ms이며 웹은 대사 입력대기 때문에 고정 재생시간이라고 할 수 없다.
- 신규 제작 판정은 사용자 지정 현행 웹 화면과 별개 제작이라는 의미다. 레거시 웹 이미지·공통 PNG를 일부 재사용한 계보는 별도로 표기했다.
- Git 원격 shorthand/promisor 설정 경고가 있었으나 fetch/show/바이트 대조와 ls-remote는 성공했다. remote-tracking branch 이름은 로컬에 없어서 동결 SHA와 ls-remote 실제 branch SHA를 직접 대조했다.

원문 근거 발췌: [EVIDENCE.md](EVIDENCE.md).

## 추가 대조 — 스킬 아이콘·웹 바닥 파일

| Godot assets/ui/skill_icons 파일 | 웹 img/skillskin_upscaled 파일 | SHA256 동일 |
|---|---|---|
| kiSlash.png | kiSlash.png | 예 |
| maliceSwipe.png | maliceSwipe.png | 예 |
| whirlwind.png | whirlwind.png | 예 |
| chargeBoost.png | chargeBoost.png | 예 |
| fireball.png | fireball.png | 예 |
| peaceShield.png | peaceShield.png | 예 |
| ghostWalk.png | ghostWalk.png | 예 |
| iceOrb.png | iceOrb.png | 예 |
| spikeTrap.png | spikeTrap.png | 예 |
| giantSlam.png | giantSlam.png | 예 |
| holyDome.png | holyDome.png | 예 |
| shieldThrow.png | shieldThrow.png | 예 |

웹 바닥은 `git show origin/main:assets/map/ch1/production_finish/chunk_x_y.png`로 64개 모두 읽었으며 PNG IHDR 크기 집계는 {(1026, 1026): 64}다. T=40(game.html:16631), mw=200(30046)이므로 청크 월드폭은200×40÷8=1000px다. 충돌 layout.js:3–11의 boundary는53점이며 buildRLE가 보행마스크를 만든다.

최종 보존 확인: HEAD·branch는 시작과 같고 tracked INDEX/WORK diff는 계속 비어 있다. 커밋·push·코드 수정·Godot 실행·import·실제 저장 폴더 접근 없음.

## PARITY-INTRO-01 현행 대응 갱신 (2026-10-22)

I02/I04는 parity_video_intro.gd의 gate/world 및 warrior로 재배치했다. I03 레거시 p01~p17과 PRO는 제품 경로에서 참조하지 않는다(파일 보존). I05~I08은 parity_intro_source.json/native_story_intro/parity_intro_canvas의 원본 메타·전체화면·화자·타이핑·입력대기로 교체했다. I09는 로비 ESC5000/전사1200/INTRO2000ms와29언어를 구분한다. 영상 움직임·mux VO/BGM 동등성 및 I10 오디오 최종 검수는 HOLD다. 세부 원본 행·차이는 [현행 계약](PARITY_INTRO_01_20261022.md)을 따른다. 위 원조사 행/집계는 조사 당시 기록으로 보존한다.
