## Native CH1-1 실제 벽 메시·교전 표시 첫 연결 — 2026-10-14

| 항목 | 실제 구현·검수·미완 |
|---|---|
| MAP 저작 데이터 | native_view_walls(entries:Array,ctx={}) 1..2, native-view-mass.v1; 실제native_wall_rect_%04d/source_index/sourcekind/원4footprint와rect보존. nativecollision defaultview80/legacym_c3wall_i,l,end80/gate60, height_basis AUTHORED_NATIVE_VIEW_ONLY/source_heightnull/물리값아님. TABLE CANONICAL_NATIVE_COLLISION_RECT→m_c1bw(bound_w.png)는명시MAP 저작view재료이며원ID배정/원pixelparity아님. |
| 실제 중앙 consumer | 2026-10-15본편Main opt-in의collision mass자동mount제거;현재production_finish청크를표시. NativePerspectiveView.mount_native_map_mass_scene()는명시진단전용이며호출한경우에만sourcefloor publicgetter/292실rect/공개materialgetter로NativeViewFloor를assemble/bind. source원G.mapnull은별도fullsourcegap이며검증된nativeview메시를막는동등flag가아님. |
| 실제 메시 | validated292/START근방mesh51. 각ArrayMesh는top+4side의5quad/10triangles/30vertices+normals+UV, 실제currentTexture2D. world→XZ/저작높이→Y. 별도3Dphysics/collider추가0·기존맵/geometry/nav/HP/QE/G/P/LOCK수정0. 영역admission은같은Camera3D의지면역변환4corner bbox·최대저작height/tanPitch+40margin, 플레이어40pxcell/viewport크기변화때만재평가. |
| 실제 재료/UV | StandardMaterial3D unshaded/cullDisabled/filterLinear/textureRepeat/opaque. 최상면UV=(worldX/textureW,worldYground/textureH), Xnormal side=(worldZ/textureW,-height/textureH), Znormal side=(worldX/textureW,-height/textureH). rect마다0..1fullimage를반복한최초가로줄무늬는실GPUFAIL→이worldcontinuousUV로수리. PNG편집/신규asset/import/hash0. opaque는이저작view메시선택이며원Sprite alpha동등아님. |
| 교전 표시 새 영향 | Main전체Canvas subtree의Sprite2D/AnimatedSprite2D를읽되자기view/SubViewport/HUDCanvasLayer는skip. Main직속검기/hit가새3Dcaller에보임. radiant.gdshader 기존hue/RGB행렬·실atlasUV·sourceTint를spatial/unshaded/additive로소비, ALBEDO출력+alpha/별도drawheight.6; 첫EMISSION-only검기비가시는영향branch수리. enemy_projectile source현재position/radius11.76/pulse getter→Y.4 PlaneMesh 지면효과로표시;trail동등미구현. |
| 새실행·실패수리 | GDScriptcompile2개신규branch0.45초씩. actualMain10=positive7·cleanup1·massGPU최초/UV수리2·VFXGPU최초/depth시도/albedo수리3·failedslashmetadata1·pausedlauncher1·snapshotloss1. 최초positive7 PASS6.415초와별개로exitresourceERROR1/RID/objectleak발견→ownedFloor.dispose호출로수리·affectedcleanup3.259초errors/leaks0. 이전7재연0. 신규VFXmirror2+snapshotloss1 PASS, 직접pause-render fixture·configure호출은public공격/피해증거아님. |
| 실GPU / 판정 | M5Pro OpenGL4.1Metal Compatibility/1920×1080. 최초mass8.548초 VISUALFAIL(striping)→UVaffected8.265초 RETOUCH; 최초VFX8.274초·depth8.235초는검기pixel미가시→failedmetadata3.168초→ALBEDO수리8.321초에서파란검기+보라구체실가시. 최종snapshotloss3.186초/pausedlaunch6.314초. 새frozen12/10/637d/oldPNG/hash/successsuite재연0. **VISUAL VERDICT: RETOUCH** — 계단형벽경계·재료polish/그림자/구Warrior/24art/최신콘텐츠/성능/전route미완. |
| 실플레이 외부막힘 | CUA getApp(Godot)첫호출이Mac locked/automaticunlock실패로중단. 수동해제요청1/다른input기술·unlock우회0/기존e498·shipping창입력0. 실제WASD/공격/자연피해/pause public검증未, rendererfixture나pausedlauncher를playable승격0. |

외부isolatedstage/고유user:// EXODUSER-Godot-MassPlay-First의 `원근_첫_시험본.command`가준비되어있다. 실행시새자기씬만초기paused로부팅, ESC로사용자가재개/정지·WASD이동·LMB공격·Spaceholdtoggle(기존native입력). 기존protectedwindow자동재개·sourceR3333/server/slots·Web/Windows배송교체·push/deploy0. 이번Git checkpoint는ENGINE ownedcode+docs이며MAP source/closure는타인untrackedWIP로격리stage에snapshot되어있어freshGit만으로완전실행된다는주장0.

## MAP draw packet 실제 연결과 미인수 경계 — 2026-10-14

| 현재 단위 | 사실 / 한계 |
|---|---|
| 새로운 실제 소비 | Main `bind_native_map_draw_owner(owner:Node)->Dictionary`(1인자), `get_native_map_draw_publication()->Dictionary`(0). NativePerspectiveView에서 exact floor_display_owner의 현재 floor_draw_packet({})를 호출하며 snapshot.map_draw에도 게시. bind는sameWorld physical descendant/sameTree/정확script/!queued 필수. |
| 실제 첫 실행 | isolated actualMain1/새negative12/12 PASS6.565초/ERROR0/기존CameraWarning1. floor_draw_packet→perspective_draw_packet+surface_packet 3신규API 최초컴파일/호출. 두 wall은 NEGATIVE_NULL_HEIGHT/NEGATIVE_TEXT_HEIGHT라는 **negative-only fixture**이며 정본floor·실맵생성·sourceheight·texture·3D visual 성공근거가 아니다. oldsuccessfulsuite/oldPNG/hash/import/새GUI/기존humanplay·ship 조작0. |
| 정확 미완 | 현재 실제sourceG.mapnull, 본편actualfloorreader/owner assemble 미설치. wallheight 미공급; 이미지world_bounds의4corners가groundfootprint라는정본없음. front/top mesh **미구현·렌더0**, contactshadow렌더0. Atlas UV와source shadow alpha/layer도미인수. 기존native map_data와ground underlay가없다는뜻이아니며fullsource floor/startup gap과구분. |
| 엄격 판정 | producer의ready.height=nonnull만으로통과하지않음. engine height는int/float·finite·>0, corners는finite Vector2×4·cross면적>0. Texture실크기>0, Sprite물리수명필수. AtlasTexture normalizedUV는미검증, nonAtlas의[0,0,1,1]만검증범위. 어떤wall도 mesh-ready로승격하지않으며 latest_full_gamefalse 유지. |
| 다음 실제 제공물 | 실제native floor_reader/provider 및wall ID별명시height·ground footprint SSOT와actualatlas/shadow Texture·sourcealpha/layer. 2D원본에3D높이가없으면새authored 3D높이정본임을구분해야한다. ENGINE는미공급값을원본값처럼보충하지않는다. old sourceG.on/cache/fullstartup 자동writer 설치0. |
| VISUAL VERDICT | **RETOUCH / 이번 단위 NOT_OBSERVED** — API와미완판정연결만. 실제GPU벽앞·윗면·접지·새맵/전투/최신콘텐츠검수0. 이전637d START RETOUCH화면을새MAP구현증거로재사용0. |

상세수명/필드는 FDG_INTEGRATION_INTERFACE.md 같은날짜표, §23의 이번단위범위는 FDG_ENGINE.md 같은날짜표를 따른다.

## Godot 실제 원근 뷰 첫 연결 — 2026-10-14

| 범위 | 구현 / 미완 |
|---|---|
| 실제 선택 | Main `mount_native_perspective_view(settings={})` 또는 명시 실행 flag `--fdg-native-perspective-first`. 기본 2D와 기존 Web artifact는 그대로다. native Camera3D/SubViewport가 현행 World/Player의 실제 Sprite2D·AnimatedSprite2D texture와 soil/litter 두 ShaderMaterial을 소비한다. |
| 물리와 입력 | world XY→Godot XZ/height→Y. 새 `native_world_to_screen`·`native_screen_to_world`가 실제 Camera3D 투영/지면 또는 지정높이 plane ray를 사용. Player 실제 mouse-aim 공급 Callable 연결. 물리·nav·맵·HP·G/P·Q/E 수치 변경0. |
| 실제 품질 경계 | 구형 Warrior/기검참/캐릭터 선택 미완이 그대로다. 24고유장수·24FPS, custom draw VFX/Canvas shader parity/labels/terrain 높이·접지shadow/가림 polish/전체route·전투/smooth motion/성능 미검수. `latest_full_game=false`. 전체 최신 버전 또는 출시완료 아님. |
| 새 검수 | headless 새projection9 PASS(6.247초), 새flag/owner5 PASS(6.073초), 새view-script-loss3 PASS(6.129초). GPU START 최초→anchor수정1→최종수정 검수3실행, 최종발접점 신규1 PASS(quad_min_height0/당시frame-bottomY7480; 실제body-anchorY7477.5는2026-10-15별도수정). 총 새의미case18, actualMain6회(기술3+새visual3). 이전 성공suite/PNG해시/asset복사/import/배송교체/인간play창 입력0. 최초layout warning1은top-left anchors로수리, 최종GPU/기술은제품ERROR0·기존Camera2D warning1씩. |
| VISUAL VERDICT | **RETOUCH** — START 원근 GPU 실제프레임 확인. 기존 캐릭터 품질·전체 맵/교전·VFX·그림자·가림은 미완. 접점 오류 첫프레임을 보존하고 최종수정은 별도 PNG로 기록. |

현재 버전 manifest의 `map.camera`는 companion Camera2D 진단이고, 새 `map.perspective_view`가 opt-in 실제 Camera3D 선택/준비/미완을 별도로 명시한다. API 상세는 `FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 표, §23 MAP PRODUCTION REPORT는 `FDG_ENGINE.md`의 같은 날짜 표를 따른다. source pin만으로 최신화했다고 표시하지 않는다.

## 이식판의 실제 콘텐츠 버전 진단 — 2026-10-14

| 항목 | 현재 구현과 한계 |
|---|---|
| 실제 consumer | Main `get_native_content_version_manifest()->Dictionary`(0인자), 기존 `native_factory_created.data.version_manifest`에 시작 1회. 캐릭터 실제 Warrior/SpriteFrames, SLASH_SHEET, World.map_data와 실제 Camera2D를 읽는다. |
| 버전 기준 | schema `fdg.native-content-version.v1`, revision1. baseline `e4981763fe562799f345c094102f2e284bcbe0f1`은 current compile HEAD가 아님. 전투 source pin `9a4534b42f74093095ebc3364a25dd104e93b379`만으로 최신 콘텐츠 여부를 증명하지 않는다. |
| Web/Steam | Web artifact `fdg-godot-web-native-first-20261013`/source-aligned, 문서 날짜2026-10-13. 실제 export_timestamp/native_code_checkpoint는 null/NOT_RECORDED. Steam version null/NOT_VERIFIED·parity NOT_VERIFIED·accessiblefalse. 기존 배송물에 이 새 getter가 포함됐다는 주장은 하지 않는다. |
| 실제 미완 | latest_full_gamefalse/content_parityINCOMPLETE. 현행 Warrior·기검참 radiant 시트·native_2d Camera2D/perspectivefalse, sourceG.mapnull. 최신 캐릭터 선택·원본24고유장수/24FPS·CSS5·world cache·전체startup 미완. |
| 첫 새 검증 | 격리 actualMain 1회, 신규10/10 PASS, exit0/제품오류0/기존 Camera2D warning1. 첫 실행6.282초. 이전 성공suite/PNG검사·Web재배송·사용자 play창 조작0. 이는 버전 진단 검사이며 visual PASS가 아니다. |

상세 field/owner 계약은 `docs/engine/FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 버전 진단 표를 따른다. 최신 콘텐츠 연결/Camera3D·원근 입체 구현과 실제 화면 검수는 남은 작업이다.

# FDG Godot Web 실제 플레이 첫 배송 — 2026-10-13

## 현재 제작 상태

현재 native 지원5/미이식11 소비를 Web single-thread export로 배송하는 첫 공개 플레이 gate를 관측 완료했다. 새 browser34의 공개 시작·한글 HUD·WASD 이동·Space 기검참 홀드/해제·원적 자연 공격·상호 피해/적 처치·Q 취소·Esc pause/resume를 실제 CUA 입력으로 확인했다. 동일 tab의 첫 HP6 세션을 보존한 뒤 공개 restart1회로 두 번째 세션을 검수했으며 game/HP/좌표/time/AI setter 및 JS 키 주입0이다. 새 getter 고유2 기술 검사는 최초1 PASS/1 FAIL(assertion2)→float 배열 fixture oracle만 수리→실패1 PASS로 마감했고 성공 반복0·제품 getter body 수리0이다. 두 기술 검사와 실제 browser 공개 증거를 구분하며 Windows 기술 검사/ICU/기존 headless 전투 자료를 Web 성공 근거로 가져오지 않는다. 전체 원본 게임·시각 품질·240FPS 완료는 아니다.

| 항목 | 현재 범위 / 경계 |
|---|---|
| parent / 백업 | 정상 Windows checkpoint `34064c58a589266492a00915fd607ea3c2fae391`. 외부 `web-playable-first/new-owned-path-absence.json`에 새 검사/SSOT HEAD·WORK 부재 기록 |
| consumer 소유 | 새 `godot/tests/test_web_delivery.gd`와 이 문서만. Web preset/builder/public HTML/observer와 공통 docs/Git은 부모·제품 담당 소유; 타인 WIP 보존 |
| runtime | 현재 원16/지원5·미이식11을 유지. 원source/맵/데이터/피해/상태/blackBean/Q·E/protected2_3 변경0. 전체AI/status/UI 완성으로 승격0 |
| 시간 / 렌더 | native60Hz/render cap240 목표. 실제 WebGL2/OpenGL ES3 Compatibility·Emscripten4.0.20 single-thread·no GDExtension·native viewport1920×1080을 console로 관측. 단일 DOM frame ms를 FPS/median/p95/GPU완료/최소Windows240 근거로 쓰지 않음 |
| 기존 인간 화면 | source1 fullscreen paused Mac Godot 및 browser31을 건드리지 않음. 이 worker GUI/input/reload/restart/server/Git0 |
| 기존 자료 동결 | Windows resource130/107/ICU/4검사 및 이식4/4/4/3/3/5·JS·원16/17PNG 재실행·재해시0. 새 artifact 리소스 검사만으로 browser ready/PASS 표시0 |
| VISUAL VERDICT | **RETOUCH** — 첫 공개 플레이 gate 관측 완료와 별개로 원화/전체 경로/전체 UI·AI/status·native LMB 장시간 홀드·성능 목표 미완 |

## source reference / public 소비 경계

| 기준 / seam | 실제 범위 / 준비 상태 |
|---|---|
| `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md` | public focus/입력 해제 규칙과 기본키 유지. Web shell focus는 브라우저 접근성·입력 전달이며 원 binding/게임시간/승리 판정 변경이 아님 |
| [Windows 첫 배송 정본](FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md) | 내부 water ResourceLoader/package 준비는 현행 source 경계 참조. 그 당시 PE/PCK/ICU PASS를 Web 실제 플레이 증거로 재사용0 |
| 현행 native Main | `Player`/`CH1CanonicalWorld`/`PerformanceCapture` child의 readonly API를 소비한다. main._toggle_pause는 save_report를 호출하므로 Web 가상 userfs/IDB와 원 native userdata/3333 저장API의 격리를 구분 |
| readonly observer | source `godot/scripts/web_delivery.gd`, stage-only autoload **실제 `res://scripts/web_delivery.gd`**. 초기 제안 alias res://web_delivery/...와 구분한다. `get_observation()->Dictionary`→DOM `window.fdgNativeObserve(JSONstring)` 전달. snapshot getter 외 field/state/입력/save setters 제공0 |
| getter | player.get_snapshot(), world.get_enemies()/get_encounter_report(), capture.live_metrics(). 현행 world에는 get_projectile_counts가 없으므로 actual crescents/enemy_projectiles의 live tree group fallback으로 정렬 완료. queued node 제외까지 새 fixture에서 확인; 공유 World/Main 수정0 |
| public shell | #start/화면 focus/WASD/LMB1·2타/Space 기검참 hold/release/Q cancel_only/Esc 공개 입력 관측. Space 접근성 토글 증거이며 native LMB 장시간 홀드와 구분. 실제 URL·버튼·CUA 증거는 아래 표 참조 |

## 신규 필요한 기술 검사 / 실제 플레이 구분

| 새 고유 그룹 | meaningful oracle / 한계 | 상태 |
|---|---|---|
| `readonly_observation_detached` | actual getter 반환 중첩 사전/배열/Vector2 JSONsafe copy·미래 snapshot 및 constructor owner 데이터 불변. 실제 tree group fallback/queued 제외·report1회cache·pause/input/report/mutation 비간섭 | 최초 FAIL2assert(float 기대 배열 타입)→fixture만 수리→해당실패1 PASS |
| `readiness_owner_boundaries` | detached/no current_scene/player-only/world-only 명시 not-ready·원factory/time/HP/state 주입0·시작/재시작/퍼즈/저장 mutation0 | 최초 PASS; 후속 재실행0 |
| JavaScript / DOM | 새 browser34의 한글 HUD/readonly DOM·공개 start/key/focus/pause를 실제 CUA로 관측. headless 기술 PASS와 별도 증거 | 실제 bridge/DOM·공개 소비 관측 완료 |
| public normal play | 새 load→공개start→WASD→Space 기검참 hold/해제→원적자연교전/상호피해·적처치→Q 취소→공개pause. observer/clock/actor주입 없이 수행 | 첫 배송의 필수 공개 gate 관측 완료; 전체 게임/시각/성능 완료 승격0 |

검사는 fresh headless getter fixture에 한정하며 source Main bootstrap/기존 native user report/원factory·geometry·PNG oracle를 실행하지 않는다. 제품 getter READY 후 새2만 실행했다. 최초 raw 보존·실패1만 후속 실행·성공 반복0이다. 실제 Web artifact/browser 공개 gate의 관측은 아래 부모 CUA 증거로 별도 인수했으며 두 기술 PASS로 대체하지 않았다.

## 실제 readonly API / 새 검사 chronology

| observer leaf | 정확 현재 소비 / 경계 |
|---|---|
| `get_observation()->Dictionary` | schema `fdg-godot-web-observation-v1`, ready/paused/player/enemies/projectiles/encounter_factory/performance/frames/recent_events/storage_scope. Main child 이름과 별개로 actual scene properties player/world/capture를 읽음 |
| player whitelist | hp/max_hp/stamina/max_stamina/position/state/combo_step/charge_frames/charge_tier/accessibility_hold. 기존 public snapshot을 읽기만 하고 HP·좌표·timer·상태·입력 setters 없음 |
| enemy readonly | actual hp/max_hp/state/alive/eShield/eShieldMax/charge_ticks/etype/element·Node2D global position/id. queued/deleted nodes 제외; actor update/damage 호출0 |
| projectiles fallback | 실제 world에 get_projectile_counts가 없으면 live tree groups crescents/enemy_projectiles를 읽어 total/enemy/crescents 집계. queued nodes 제외; physics/수명/충돌 진행0 |
| factory summary | world.get_encounter_report를 actual world instance마다1회만 읽고 installed/source_count/supported_count/unsupported_count 네 scalar만 cache. full337/native records를 매0.1초 poll 복제하지 않음 |
| publish / pause | PUBLISH_INTERVAL_SECONDS=.1, PROCESS_MODE_ALWAYS. Web에서만 window.fdgNativeObserve(JSONstring)에 publish. native headless는 _ready에서 set_process(false); 위 테스트는 public getter만 호출하며 JS설치/실제 publish/telemetry연결 증거가 아님 |
| frame/event leaf | Engine drawn/process/physics는 global engine counters이며 성공한 gameplay tick 수가 아님. recent own telemetry cap25·source signals read-only. headless에서 이벤트를 주입하거나 공개 hit/승리 증거로 만들지 않음 |
| JSONsafe | Vector2/Vector2i→[x,y], Dictionary/Array recursive fresh copy. caller snapshot mutation이 owner나 미래 snapshot에 전파되지 않음 |
| storage metadata | browser_virtual_userfs/observed_web_platform는 actual OS.has_feature(web), observed_user_data_dir는 OS getter. native_usersave_access/mac_latest_session_access/original_slots_api_access=false. native headless에서는 webflags=false라 browser 격리의 실제 증거로 쓰지 않음; observer FileAccess/API/save 호출0 |
| export scope | source파일은 godot/scripts/web_delivery.gd이지만 autoload는 Web stage의 실제 res://scripts/web_delivery.gd만. 공유 project/main/player/world/capture 변경0. class_name1줄31B 제거는 export alias 충돌 preflight 정렬이며 getter body/HTML 불변; root final artifact alignment 별도 |

| actual 새 실행 / raw | 결과 / 경계 |
|---|---|
| 첫 `readonly-first-receipt.json` | exit1 /0.258650417초 /유효1 PASS(readiness)·1 FAIL(assertion2)·incomplete0·stderr0. Vector2 serializer가 float를 반환하는데 fixture의 두 기대 배열이 int라 실패 |
| fixture-only 수리 | 기대 [5,8]/[30,40]→[5.0,8.0]/[30.0,40.0]만. constructor owner 데이터/Vector2 값 변경0·producer getter body 수리0 |
| 실패1 후속 `readonly-repaired-receipt.json` | --only=readonly_observation_detached /exit0 /0.263354334초 /1 PASS/assertion0/incomplete0/stderr0. 최초 readiness 성공 재실행0 |
| 최종 새 고유2 | 최초1 PASS + 후속1 PASS. 최초2 PASS 주장0·physics method/automatic native simulation/main bootstrap/factory/report writes/GUI/sourcePNGhash/기존검사 모두0. constructor-only stub의 기술 계약이며 actual native player/combat/자료를 실행하지 않음 |
| test byte history | 최초190행/8340B/SHA `40bf15163242b2e38ba3b055d84863289287d737874c179be89c9631d8bd41ba`→현재190행/8348B/SHA `515c758d6125157f8b8882a43b8863e45461332ea5e1f375244b42c63f701355` |
| 외부 증거 | web-playable-first/tests의 readonly-first.*, readonly-repaired.*, readonly-*-runtime.log, fixture-repair-receipt.json, numeric-oracle-repair.diff. architecture-pending.json은 최초초안 이력으로 보존 |

## 실제 export / 공개 host — 브라우저 플레이와 구분

| leaf | 실제 artifact / source 계약 |
|---|---|
| preset / runtime | Godot4.7.2.stable.official.ed1daf0bf / Web Native Preview Single Thread / 공식 web_nothreads_release.zip. Compatibility/WebGL2·threads=false/extension=false/PWA=false·WebAssembly/WebGL2/HTTP localhost 또는HTTPS 필요. source native60/render240 값 변경0 |
| export 단계 | build-actual-first 최초 export exit0→사용하지 않는 class_name1줄31B 제거 뒤 build-source-aligned export exit0. getter body/HTML/gameplay 불변·그 과정 새 성공검사/Windows 반복0·원PNG/source16 hash0·재import0. 구형 첫package는 이력으로 보존 |
| actual source alignment | observer6066B/SHA `b03c87b86af60bf091034390cbf89f09fb5f06691b65b09338c189b9e5031ec4`; source-alignment-export-receipt.json 참조. Source와 실제 배송 artifact 일치를 공개 QA 전에 확보 |
| 최초 PCK history | index.pck121935372B/SHA `f90cd22883ff8a296dcc0bb97bb36b0079db5a897ebb251ee13e9fe6b9c33860`; 최초 HTML12301B/SHA `16e9c0ecf20daa8ec9af818cc19f3c1f78d00ae04121bc8e6a58125a5bb5a91f`. 현재 source-aligned 표와 구분 |
| 공개 URL | http://127.0.0.1:3333/output/fdg-godot-web-native-first-20261013/index.html. 기존 Node3333 서버를 재시작/설정변경하지 않고 migration checkout output의 새 symlink leaf만 actual package를 가리킴. 원 game/main/save 변경0·전체repo copy/merge0·3334 승인미확정서버 사용0 |
| actual host target | 외부 build-source-aligned/package. existing-server-static-delivery-receipt.json의 static leaf/target 및 준비시점 browser_actual_play_ready=false는 생성 당시 이력. 현행 공개 gate 완료는 별도 browser 증거로 확인 |
| MIME / 요구 | 서버 wasm Content-Type application/octet-stream; 공식 loader가 Response MIME을 정규화한다는 parent source 확인. browser34에서 실제 정상 load/start 관측; export manifest의 권장 application/wasm과 구분. single-thread 빌드 COOP/COEP requirement=false |
| public shell | #canvas1920×1080/tabindex0, #start click→Engine.startGame(canvasResizePolicy2) 완료 후 #start-layer hidden/toolbar 공개/canvas.focus. #focus·#fullscreen·canvas pointerdown focus. 공개 start/입력/Esc는 관측; Web fullscreen 동작은 이 기록에서 미검수 |
| DOM snapshot | window.fdgNativeObserve는 schema 확인 뒤 JSON.parse한 **JS caller copy**를 window.__FDG_NATIVE_QA__에 저장하고 특정 leaf ID만 표시한다. 게임 setter를 제공하지 않음. Object.freeze 설치0이며 JS 객체 freeze와 게임 readonly 관측을 혼동하지 않음 |
| UI / 입력 guard | finite number 표시·위치2decimal/ST·charge1decimal/frame ms2decimal; runtime error list cap10·최근 이벤트표시8(backend cap25와 구분). canvas focus중 WASD/Space/방향키 default scroll 방지·contextmenu 방지. 원 keyboard/gameplay 규칙 변경0 |
| 저장 / current runtime | 실제 DOM에 Web=true·user dir=/userfs/EXODUSER-Godot-Native-First가 관측됨. Main public pause의 QA report는 Web 가상 user:// 범위; IndexedDB 영속성/브라우저 재시작 후 복원은 미검수. native userdata 접근 및 원 슬롯API consumer 추가0·전체 network request 감사0·이 worker 실제 report 쓰기0 |

### 첫 공개 세션 — 미완 당시 이력 보존

| 단계 / 증거 | 실제 관측 / 경계 |
|---|---|
| 최초 start / DOM | 새 tab34, 위 공개 URL. 공개 start 후 canvas/map/한글 HUD, HP350/ST200·좌표4020,7420·지원5/원16/미11·Web=true 및 가상 user dir 관측 |
| 초기 키 전달 이력 | 첫 W tap(native pressKey/Playwright locator.press) 좌표 변화0. 이후 반복 공개 pressKey로 이동 관측. CUA hold/down API가 없으며 raw CDP Input은 지원하지 않아 사전 거절 후 실행 중단; 키/게임필드/clock 주입0 |
| 실제 WASD | W:4020,7420→4020,7412.20; A:4017.40,7412.20; D:4027.80,7412.20; S:4027.80,7417.40. 이후 W2500 공개 tap(약21.65초)→4027.80,7248.39. 연속 key-held 증거와 구분 |
| 첫 세션 원적 자연 소비 | eye01 자연 aggro distance799.4047→charge/projectile. DOM에서 enemy_projectile_birth base62/contact_damage_request80·enemy_projectile_hit 및 enemy_contact raw24/cooldown43·57을 관측. 원 AI/피해값 수정0 |
| 첫 세션 플레이어 피해 / pause | 실제 magic80 및 phys23, HP350→144→6 관측. 자연 전투 뒤 공개 Esc paused. 당시 AX는 HP6/350·ST200/200·idle·0틱/0단계·좌표4032.42,7270.75·활성 검기/적탄0/0·적5 각HP875. 첫 증거는 두 번째 공개 세션으로 덮어쓰지 않음 |
| 첫 세션 frame leaf | pause AX에 drawn128445·frame8.60ms/sample106460 표시. 이는 당시 DOM leaf이며 정상 교전만의 표본 요약/median/p95/GPU완료 측정/240FPS 달성 증거가 아님 |
| 도구 / 오류 경계 | readonly evaluate는 sandbox global undefined로 실패해 DOM/AX 증거를 사용. canvas locator.pressSequentially도 실패해 증거로 쓰지 않음. raw CDP Input 사전 거절1/실제 전송0. 도구 실패를 제품 runtime 오류로 대체하지 않음; AX runtime 오류 기록 없음. private state/HP/좌표/time/JS key 주입0 |
| 실제 외부 증거 | `web-playable-first/browser-natural-combat-paused.jpg` 및 `browser-natural-combat-paused-ax.txt`. 이 worker는 AX 원본을 읽기만 했으며 browser input/새 캡처0 |
| 첫 세션 당시 미완 이력 | 그 시점 플레이어 기검참 홀드/해제·적 HP 감소는 미관측이었다. 아래 두 번째 세션에서 공개 입력으로 해당 gate를 완료. 첫 세션을 단독 전체 gate 완료로 소급0 |

### 두 번째 공개 세션 — 필수 플레이 gate 마감

| leaf / 공개 입력 | 실제 관측 / 한계 |
|---|---|
| 세션 경계 | 동일 tab34에서 공개 restart1회. 첫 세션 HP6 증거 보존·두 번째 세션 native spawn4020,7420/HP350으로 시작. source/private actor/HP/time/AI setters·강제 clock/승리 주입0 |
| Space hold / tiers | 공개 1·2타 뒤 Space 토글: windup4틱→40/80/120틱, tier1/2/3·배율2/4/8. 실제 CUA getAXState tool output을 부모가 browser-public-play-proof.json에 전사; 별도 charge AX/이미지 파일0. 접근성 공개 토글이며 native LMB physical 장시간 hold 미검수 |
| tier3 release | Space 해제: kiSlash_fired charge_frames120·step3/tier3·crescent damage3763/life25frames/radius264. 제3타 최대 hold 및 해제는 부모 실제 tool output 전사로 인수; 최종 AX의 최근8개 event에 충전 이력이 남았다고 주장0·기술 fixture 자료 재사용0 |
| 자연 enemy / player damage | 공개 W 접근 후 eye01 자연 aggro distance799.0037, 원 magic80 피해로 플레이어 HP350→270. 첫 세션의 phys23 접촉 관측과 별도 세션 |
| 실제 적 피해 / 처치 | 공개 1·2타 검기 각470, 원 eye01 HP875→-65/dead 관측. 첫 검기 expired hits1·두 번째 enemy_damage470/hp-65·crescent_hit을 확인. 중간405는 875-470 계산값이며 별도 AX 직접 관측값으로 쓰지 않음. enemy_stagger180도 실제 최종 events에 표시 |
| Q / pause | 공개 Q recover 취소1회, attack_cancelled q_scope=cancel_only/emitted_crescents_preserved=true. full Q/패링/blackBean 검수로 승격0. 최종 공개 Esc paused |
| 최종 readonly AX | HP270/350·ST180.9/200·좌표4013.79,7293.24·recover·0틱/0단계·지원5/16/미11·활성 검기1/적탄0·eye01 HP-65/dead. 나머지 지원4 각HP875 |
| viewport / backend | console Godot4.7.2.stable.official.ed1daf0bf·OpenGL ES3/WebGL2 Compatibility·WebKit/WebKit WebGL·Emscripten4.0.20 single-thread/no GDExtension. native viewport1920×1080, 최종 screenshot1280×720. 실제 console5개 모두normal log·AX runtime 오류0 |
| 성능 경계 | 최종 drawn151279·frame8.20ms/sample17708. observer가 표시한 단일 decimated frame 값이며 정상 플레이 wallclock 분포/median/p95/GPU완료/FPS240 측정이 아님. cap240/native60 설정과 실측 달성을 구분 |
| 저장 격리 | actual Web=true·user dir=/userfs/EXODUSER-Godot-Native-First. Web 가상 user:// 및 가능하면IDB에 QA report; native Mac latest-session 접근/원슬롯API consumer 추가0. 전체 network request 감사와 IDB 영속성/재접속복원 실제 검수0 |
| 실제 원본 / 전사 | browser-public-play-complete-paused.jpg 및 -ax.txt, browser-console-log.json은 저장된 실제 원본. browser-public-play-proof.json은 부모 CUA tool output 전사 및 gate/미완 명세이며 charge 별도파일과 구분. worker는 AX/console/receipt를 읽기만 함. 원 Mac fullscreen paused 앱/browser31 조작0 |
| 현행 미완 | 전체 경로/벽 접촉/원화·가림·전체 UI/AI/status/미이식11·24장 원화/24FPS 제작·Web fullscreen·native LMB 장시간 hold·full Q/E/blackBean·장시간 성능·최소Windows1080p240·안개100/20 별도비교. 첫 playable gate 완료와 whole-game/visual PASS를 구분 |

### 현재 source-aligned Web artifact — 부모 export receipt

| 파일 | bytes / SHA256 | 단계 |
|---|---|---|
| `index.audio.position.worklet.js` | 2973 / `be33985bc7160d6bf9646f259cd86b259cd67b02ccb297ee5c44f8ac84327bc8` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.audio.worklet.js` | 7298 / `5b476a9c9ce642c0ee4256436d1bc31d9c38f868aca0f9a8e2a57c18d2dec2a3` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.html` | 12301 / `aa0cb92d805bfbea5f48fc59261d4482164b79da0c462e16adffe3848ba875b3` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.js` | 279815 / `33c94cb3175f3333b82e2a3be5e8e86f77986f0aa2042b1631f6367a4e5bb6ba` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.pck` | 121935228 / `ccecee874998679b2704253104623de3632fe174a914f6a6917bb1613511c1b1` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.png` | 21443 / `3cb4495c0b98dfbe4b663cbf2b6836473572339beb66d902367893162a70be0e` | build-source-aligned/package; actual browser play 증거 아님 |
| `index.wasm` | 39514754 / `fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0` | build-source-aligned/package; actual browser play 증거 아님 |

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 결과 / 미완 |
|---|---|
| MASTER / STAGE | 기존 source5지원/미11의 Web 공개 플레이 연결. 신규 map/record/seed/PNG 제작0 |
| LARGE / MEDIUM / GROUND / LANDMARK | geometry/collision/nav/배치/material 작업0. 원 map 유지 |
| PLAYABLE / COMBAT | source-aligned Web export exit0; 실제 공개 시작/WASD/Space 기검참40·80·120hold/해제/원적 자연 공격·상호피해·적처치/Q cancel_only/Esc pause gate 관측 완료. 전체 게임/미이식11의 parity 주장0 |
| CAMERA QA | 기존 인간 Mac 앱/browser31 유지. 새 tab34 map/HUD·최종 pause1280×720화면/1920×1080 native viewport·WebGL2 backend 관측. 전체 경로/벽/가림/원화 시각 QA 미완 |
| TECH QA | readonly getter 신규2 유효 완료(최초1 PASS/1 FAIL2assert→fixture수리·실패1 PASS). 실제 browser start/DOM/key/pause는 별도 CUA 증거. 기존 성공 재실행0·Windows 검사 수입0 |
| FILES / GIT | 이 worker test/SSOT만. 부모 정상 code+docs checkpoint 담당; 실제 성공 전 commit 완료표시0 |
| VISUAL VERDICT | **RETOUCH** — Web 첫 공개 플레이 gate 관측 완료. 원화·전체맵경로·전체UI/AI/status·native LMB 장시간 hold·최소사양240 미검증 |
| NEXT PASS | 전체 경로·실제 벽 접촉·native LMB 장시간 hold·full Q/E 및 미이식 consumer 후속 검수, 정상 플레이 성능 분포/최소사양240 측정. 새로운 승인·별도 단위 전 자동 추가 플레이/검사0 |
