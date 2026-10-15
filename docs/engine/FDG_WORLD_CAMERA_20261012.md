## 2026-10-15 native 첫 구간 플레이어 접지 연결

| 항목 | 최신 좁은 계약 |
|---|---|
| 구현 | NativePerspectiveView가 기존 player_shadow.geometry/blob_texture를 실제 Main Player·current G에 연결. stage0 기본 depth-slice blob만, source rx=2r+2(charge+6)/ry=2r*.35/alpha.38/rect2.3배; Y=-.01은 렌더 bias, terrain 높이 아님. |
| 검수 | 같은 전사/idle 원본·SFX통합본 새 비교 후 누락 수리. 새 실제 GPU 영향7/7+새 후보 entry3/3, 제품 error0/기존 Camera2DWarning각1. GPU 접지 영역 변화985픽셀 모두 darken, 정상 W12/LMB swing 추적. compile 전 publish 미완 invalid-path1 이력 유지/유효 compile1 PASS. |
| 경계 | URL/saved depthSlice·flat ellipse/stage!=0/arena·방향광/벽 그림자/전체 가림 미채택. 기존 자료의 2D/독립 producer/브라우저 preview 계약은 변경하지 않음. 전체 최신게임·전체 원본 이상 품질 미완, VISUAL VERDICT RETOUCH. |
| 새 후보 | native-review-contact-grounding-20261015/수정본_검토_실행.command, scripts49 snapshot/기존 읽기 links, 초기pause·명시 캐릭터 선택. 기존 후보/asset/PNG/통과suite/GUI 재실행0. 원본 수치·60tick·RNG·QE·nav/LOCK·2_3·foreign 보존. |

상세 geometry·source 이력·API·MAP PRODUCTION REPORT·검수 경계는 [native SSOT의 첫 접지 연결](FDG_GODOT_NATIVE_FIRST_20261013.md)을 따른다.

> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

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

## NativeWorld 실제 floor-reader·현재 원본 texture bridge — 2026-10-14

| 실제 공급 / 판정 | 정확 현재 범위 |
|---|---|
| Source public API | World `get_native_floor_view_source()->Dictionary`(0)에서 `floor_reader=Callable(world,get_native_floor_wall_packet)`(0)와 `current_texture_reader=Callable(world,get_native_current_source_object_texture)`(1/source_key:String)를 공급한다. 실제sameMain/World/player·native stage0/200×200/T40·identity transform일때만ready. |
| wall 입력 | 현행map_data.collision_rects의292개를읽는현재Array. id=native_wall_rect_%04d(sourceindex), world=[x+w/2,y+h/2], ground_footprint=원rect의4Vector2 TL/TR/BR/BL. source_rect복사/source_index/source_kind CANONICAL_NATIVE_COLLISION_RECT/heightnull/meta{}/authored_prop_idfalse/geometry_editedfalse/rot0/scale1. sourceRect의h는XY평면깊이이며GodotY wall높이가아니다. |
| authority 경계 | scope approved_native_ch1_collision_rectangles_only, source_file res://data/map.json. 새native-view wallID는기존authoredpropID가아니다. height_suppliedfalse/material_assignedfalse/full_source_floor_readyfalse. 기존sourceG.mapnull을쓰거나trueREADY로바꾸지않으며wholeoriginalfloor·최신콘텐츠완료아님. SourceLoader는원mapcoords/nav/collision을수정하지않음. |
| 현재 texture | 개별original-pipeline currentimage에서실Texture2D 반환. m_c1bw 첫소비는assets/map/ch1/collision/bound_w.png 실제resource이며mappedapprox propTexture로대체0. 이재료를새wallID에배정한계약은아직없음. original_pixel_identity_proven/processing_pixel_parity_verified/full_stage_ready는모두false; resourceavailable를rawpixel/GPU/fullOBJWait완료로해석0. |
| 첫 검수 | isolated actualMain1/새positive·guard10/10 PASS3.155초/ERROR0/기존CameraWarning1. 현native292rect전체footprint/callable/caller-copy/현texture1/unknownkey/queuedowner/G.map불변만신규검수. 기존12/9/5/3/anchor·oldsourceImageSuite/PNGhash/import/assetcopy/GUI·humanplay·shipping재연0. |
| 다음 / visual | MAP가같은ID와원footprint를보존하고 AUTHORED_NATIVE_VIEW_ONLY height 및명시material-source를공급한뒤중앙meshrenderer가실소비해야함. front/top/contactshadow렌더0·실제전투/전체route/최신모델검수0. **VISUAL VERDICT: RETOUCH / 이단위 NOT_OBSERVED**. |

상세payload·수명은FDG_INTEGRATION_INTERFACE.md 같은날짜표, §23이단위보고는FDG_ENGINE.md 같은날짜표를따른다.

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

# FDG v0.20 · 공통 원근 카메라

기준일 2026-10-12. 목표는 우리 게임 리소스를 제작할 때 바닥·캐릭터·리그·입력을 같은 월드 시점으로 평가하는 것이다. 참조는 Git main `5e7a07716bb40e852fbf52f4060672a757b728be`의 [POE2_REFERENCE_STUDY.md](../5.1임펙트디자인/POE2_REFERENCE_STUDY.md), Git blob `fcc6dd046f3acfbd91a370d78ded9f99da1f9275`다. 원문은 byte exact로 보존한다. 지역 환경/오브젝트 조립, ground/screen 정렬과 공통 anchor 원칙을 배우며 PoE2 에셋·코드·카메라 수치를 가져오지 않는다. 이번 카메라 수치는 EXODUSER 엔진 저작 설정이다. 원문의 공격/FX 제안은 이번에 구현된 기능으로 분류하지 않는다.

## 적용 범위

| ID / 위치 | 현재 계약 |
|---|---|
| `project.viewCamera` | 일반 map+sprite+optional rigScene의 명시 카메라. 생략한 프로젝트는 기존 평면 렌더 유지. `schemaVersion:1` 유지 |
| `terrainScene.camera` | 기존 높이 시험의 명시 projection 확장. 일반 viewCamera와 동시 존재 거부. 기존 저장의 projection 생략은 직교 유지 |
| sourceScene / sourcePreview | 별도 이미지·높이·clip/cutaway 계약 유지. viewCamera 동시 존재 거부. 기존 v0.17 장면을 새 카메라 결과로 세지 않음 |
| native `game.html` | 기본 평면 경로 유지. exact r4+`fdgPerspective=first`는 공통 원근을 직접 소비하며 `fdgScene=ruined-forest-first`는 독립 실제 교전 씬이다. GPU W·billboard depth·지면 pointer 연결. [현재 native 계약](FDG_NATIVE_PERSPECTIVE_20261012.md), [씬·§23](FDG_RUINED_FOREST_PLAYABLE_20261012.md). 전체route/높이/모든 표시층 이식은 미완료 |
| 독립 `rig.html` | 기존 모델 저작 직교 카메라 유지. 일반 장면 월드 시점은 Studio에서 평가 |
| 모델 / 프레임 | 기존 PNG·리그를 소비. 원근은 결손 표면을 복원하지 않음. 승인 신형 악마형 Druid 본체 없음, 게임용 실제24장·24FPS 제작 목표 유지 |

## 데이터·수학·상한

`engine/fdg/world-camera.js`는 DOM·시간·이미지·네트워크·GPU를 소유하지 않는 순수 모듈이다. 월드 X/Y는 바닥, Z는 위쪽 높이이며 단위는 world px다.

| 필드 / 상수 | 값·기본값 | 검증 / 소비 |
|---|---|---|
| `projection` | `perspective` / `orthographic`, 기본 perspective | viewCamera 6필드 모두 필수; 잘못된 모드 거부 |
| `yaw` | `−π..π`, 기본0 | 월드 수평 회전 radians |
| `pitch` | `.35..1.1`, 기본.85 | 카메라 내려보기 radians; 리그 자체 yaw/pitch와 별개 |
| `zoom` | `.25..2`, 기본1 | 중심의 px/world px |
| `distance` | `600..6000`, 기본1400 | 카메라에서 중심 지면까지 world px |
| `near` | `8..128`, 기본32 | 카메라 앞 최소 거리 world px |
| terrain 선택 필드 | projection 미지정=직교, 명시 projection의 distance/near 생략=1400/32 | projection 없이 distance/near만 있는 데이터는 거부. 새 높이 템플릿은 perspective/1400/32, 기존 yaw.45/pitch.7/zoom1 유지 |
| 프로젝트 JSON | compact UTF-8 최대4194304bytes | optional viewCamera도 기존 전체 JSON 검사에 포함, unknown JSON 메타 보존 |
| `dx,dy` | worldX−cameraX, worldY−cameraY | center X/Y는 기존 FDGRuntime 소유 |
| 회전 | rx=dx cosYaw−dy sinYaw, ry=dx sinYaw+dy cosYaw | 월드→카메라 |
| 카메라 좌표 | x=rx, y=ry sinPitch−Z cosPitch, depth=ry cosPitch+Z sinPitch | positive depth가 가까움 |
| 원근 나눗셈 | d=distance−depth; scale=zoom×distance/d | d≥near만 표시, screen=(W/2+x×scale,H/2+y×scale), projected depth=1/d |
| 직교 | scale=zoom, projected depth=camera depth | 거리로 크기가 달라지지 않음 |
| 지면 역투영 | u=(sx−W/2)/(zoom×distance), v=(sy−H/2)/(zoom×distance), d=distance sinPitch/(sinPitch+v cosPitch) | rx=u d, ry=v d/sinPitch, yaw 역회전으로 XY. 지평선 분모≤1e−12 또는 d<near는 null; pointer는 무효 입력 무시 |
| near clip | camera depth≤distance−near의 polygon clipping | 교차 정점의 모든 공통 finite numeric own attribute 선형보간(UV 포함), fan triangulation. 뒤쪽 정점을 그대로 나눠 화면 전체에 폭발시키지 않음 |
| invisible point | x/y/depth/scale0, visible:false | 유효하지 않은 깊이는 크기0의 표시 불가 값 반환 |

| API | 반환 / 소유 |
|---|---|
| `validateWorldCamera(settings,path='viewCamera')` | `{ok,errors}`. camera object/6필드/유한 범위 검사, 입력 불변 |
| `createWorldProjection(settings,center,viewport)` | 아래 순수 함수 묶음. center `{x,y}` / viewport `{width,height}` positive finite. 설정 scalar를 복사 |
| `toCamera(x,y,z=0)` | `{x,y,depth}` 카메라 좌표 |
| `projectCamera(vertex)` / `project(x,y,z=0)` | `{x,y,depth,scale,visible,distance}` 화면 CSS px / d |
| `unprojectGround(sx,sy)` | `{x,y,z:0}` 또는 null. 높은 면 raycast는 미구현 |
| `clipPolygon(vertices)` | camera-space polygon의 새 배열. 원본 좌표·속성 변경 없음 |

## 렌더·저작 연결

| 적용 위치 | 구현 |
|---|---|
| 바닥 | 일반 맵의 실제 타일 corner들을 공통 카메라에 투영. 기존 `groundSrc`를 실제 natural image 크기의 world repeat로 소비. 40px 셀에서 반복 경계를 넘으면 UV seam별 분할. 작은 면의 affine UV 근사이며 GPU perspective-correct texture가 아님 |
| 바닥 조회 예산 | 투영 map polygon→near clip→viewport clip→지면 역변환→map-clamped tile bbox. 전체 map을 보지 않는 일반 lens에서 후보를 줄이며 최대는200×200=40000셀. 고정 소량/상용 FPS 보장 아님. 반복 seam의 quad는 최대4분할, 각 quad는2 texture triangles |
| sprite / props | 실제 source 셀·비율·발 anchor 유지, 화면 크기에 투영 scale 적용. 명시 BACK/FRONT 레이어 유지 |
| 접지 그림자 | 높이0 바닥 면에 투영한 타원. 방향광의 실제 투사 그림자·수광면 계산은 미구현 |
| 리그 | 기존 LBS와 모델 yaw/pitch 평가 뒤 model X/right·Y/up·Z/front를 world X/Y/Z로 명시 변환. mesh 정점 및 near-clipped UV 삼각형 소비 |
| 리그 near 정렬 | `getProjection`·`getViewport` callback으로 같은 카메라·live CSS viewport 소비. 유효한 foot는 기존 projected anchor depth; foot만 near 뒤이면 clipped face bbox 중 viewport 겹침 면의 최대 정점 depth, 없으면0. snapshot anchorVisible/depthSource=`anchor`/`clipped-visible-geometry`/`hidden`, 저장 JSON 파생필드0 |
| 일반 장면 깊이 | world objects/rig/player를 공통 projected depth로 정렬. 동률 object→rig→player. 리그 내부는 authored layer→평균 depth→원 index의 painter 방식; 교차 리그 면의 픽셀 Z-buffer는 미구현 |
| VFX / 표식 | 기존 시간·셀·수명·풀 유지, 표시 위치/크기를 공통 카메라로 평가. 접지 그림자24segments·지면 ring FX32segments·exit ring32segments. 일반 VFX는 world 항목 뒤 기존 pass이며 물체와의 전면적 가림/전투 이벤트·socket·레이어 표준화는 미완료 |
| CPU 높이 장면 | 같은 camera/near clip과 reciprocal depth를 기존 Float32 픽셀 depth test에 사용. 기존 최대900px raster와 ImageData/배열 재사용 유지. actor는 test-body36px box+18px head, 게임용 모델 아님 |
| CPU raster 예산 | 최대900×900=810000 pixels, RGBA ImageData4bytes+Float32 depth4bytes=6480000bytes typed-array payload. GPU/VRAM 측정값 아님. 기본 geometry130+actor24=154triangles이며 near clip 후 수 변동 |
| 수명 | 기존 owner60Hz / dt1/60 / 최대6substeps / clamp.25초 유지. 공통 camera 자체 RAF/listener/timer/Image/GPU0 |
| toolbar | `world-camera-projection`: 기존 평면/원근/직교 입체. `world-camera-distance/pitch/yaw/zoom`: 거리·내려보기°·회전°·배율. 실행 중 편집 비활성. source/terrain 및 World owner active에서 toolbar 숨김·변경 차단. static change listener5개 dispose |
| 각도 저작 | UI는 degrees, 저장 radians. 일반 표시 소수2자리, pitch HTML bound는.35/1.1의 정확 degree 변환·step=any. degree/radian 끝값 오차<1e−12는 정확 bound로 보정. 리그 모델 yaw/pitch는 별도 inspector `모델 회전 · 월드 카메라와 별도` |
| 저장 | 기존 ProjectStore 이력80·저장/JSON import/export 유지. viewCamera는 프로젝트 저작 데이터, 시뮬레이션 clock과 별개 |
| 독립 진입 | `/tools/fdg-studio/index.html?authoring=perspective-r1&v=0.20`, 저장 키 `fdg.studio.perspective.r1`. 사용자의 기존 FDG/게임 save와 별도 |
| 최초 원근 작업 사본 | 기존 canonical nav/start/exit·전사/실버테일·스킬/FX를 복사. offset9곳 중 바닥 셀의8곳에 기존 나무/뼈/버섯을 배치, 간격5타일 이상·collision:false. 시체나무 source1143×1400·scale.14, 뼈/버섯 source32×32·scale.8. 신규 production geometry가 아님 |
| 공개 관측 | FDGRuntime stats의 viewCamera/projection/groundTileCandidates/groundTextureDraws는 명시 일반 viewCamera 경로에만 존재. rigScene snapshot은 공통 camera의 worldVertices/cameraVertices/screenVertices를 독립 복사. terrain snapshot은 camera/nearClippedFaces/nearCulledFaces/actorGeometry/gameCharacterModel 제공 |
| cache | 공개 진입 v=0.20, studio entry0.20.2, runtime/rig-scene-runtime/rig-scene-panel perspective-r1-c, camera panel/factory perspective-r1-b. schemaVersion 승격값이 아니며 실제 수정 모듈 로딩용 |

## 검증·시각 인수

신규30고유검사와 관련 기존25검사, 최종55고유 PASS다. 공통 수학8검사는120 camera 조합×3 ground points=360 roundtrip을 포함한다. 프로젝트3검사: 원본 nav/start/exit/characters 보존·바닥 위 props/5타일 간격·lens/중복 권위 거부·이력/JSON 확장값 보존. 나무 배율 수정 뒤 해당3만 다시 확인했다. runtime/rig 최초12는11PASS/1oracleFAIL이며 기존 LBS float 값을 정본 evaluateRig와 비교하도록 고쳐 해당1PASS; owner→rig 통합 신규1PASS와 near-hidden anchor 정렬 신규1PASS를 추가하여14고유. 최종 getViewport API/정렬 수정 후 이14만 재수행하여14/14PASS. terrain 신규5 및 관련 기존25는 첫29PASS/1FAIL, 기존 setProject의 pause 계약에 맞춰 stale RAF 기대만 고친 해당1PASS. 첫 실패 증거를 보존하며 재수행을 고유 검사 수에 중복 합산하지 않는다. 과거 native/저장/모션 suite는 재실행·합산0.

| 실제 공개 UI 검수 | 관측 / 증거 |
|---|---|
| 실제 에셋·원근/직교 | 동일 distance900/yaw20°/pitch.85/zoom1에서 공개 select 비교. soil1024 world 반복·기존 전사·나무·버섯 표시, assetErrors0. `actual-orthographic.png` / `actual-perspective.png` |
| 원근 수치 | center4020/7420에서 near Y7660 scale1.198152465014075, far Y6940 scale.7514484041653211. yaw20° 포함 공통수학 관측; bitmap 본체가 새3D모델이 되었다는 뜻 아님. `actual-camera-before.json` |
| 이동 | 공개 paused 북쪽10px×12로 Y7420→7300. 공개 Play+북쪽 연속 입력으로 owner5.416666666666653초/325ticks, Y6540.799999999894까지 이동. 공개 입력 해제+pause 뒤 errors0/droppedSteps0. `actual-movement.json` |
| 저장·재열기 | 공개Save로 독립 fdg.studio.perspective.r1 compact UTF-8 JSON107137bytes/JS string106059code-units 저장. before/storage byte exact·SHA2563310bb1ad55b84bcd4d18beda71cf370a4210ce8c5dfbe45497c6519f19a6fe4, 기존 본편 slot/API 쓰기0. 다시 열어 full parsed project equal, 렌즈900/20°/.85/1/32 보존·clock0. public export는 이번에 실행하지 않음. `save-before.json` / `save-storage.json` / `save-reopened.json` / `save-reopen-receipt.json` |
| 실제 리그 | 공개 +시험 리그,16 XYZ정점·3bones·scale48, shared-world-camera 투영·독립 world/camera/screenVertices·depth1/900·ownedRaf/listeners0. 기존 geometry fixture이며 승인 게임 모델 아님. `actual-rig.json` / `actual-rig.png` |
| 최종 리그 API/UI | 마지막 near 정렬 수정 후 최신 module entry0.20.2/runtime-r1-c/rig-r1-c 로딩 확인. 다시 +시험리그에서 anchorVisibletrue/depthSourceanchor, 모델/월드 각도 별도 UI 확인 후 undo로 검사 노드 제거·원 사본 저장. `actual-final-loaded.json` / `actual-rig-final.json` / `.png` |
| CPU 지형 보행 | 별도 창의 공개 새높이시험·reset→서쪽6×북쪽18 한걸음: [4020,7420,0]→[3926.4000000000033,7139.199999999961,64], stairs-node·접지·blockedReasonnull·depthTesttrue·154triangles. camera.45/.7/1/perspective/1400/32, outer viewCamera 제거·errors0. `actual-terrain-stairs.json` / `.png` |
| 각도 경계 | 공개 numeric 입력+Return으로 pitch.35/1.1 정확 저장, 후보1520/450·errors0. 검사 후 undo로 .85 복원. `actual-pitch-min.json` / `actual-pitch-max.json` |
| 성능 관측 한계 | normal paused 단일 render3.0ms, 낮은 pitch 첫 render11.7ms는 해당 기기의 단일 관측. 일반 assetErrors0이며 stress/출시 FPS 보장 아님. 극단 lens 전체맵 조회·CPU texture 호출 비용은 남음 |
| 첫 화면 문제·수리 | tree 최초scale.65로 화면을 과도하게 덮어 `first-oversized-prop.png` 보존, 실제 크기 기준.14로 작업사본만 조정. 원PNG 변경0·신규 PixelLab0. 최종 `actual-perspective-final.png` |
| 검수 verdict | 공통 원근 소비와 이동/저장 기능은 해당 범위 기술 인수. 조명·공간 아트·승인 본체·본편 전체 연결을 포함하는 production VISUAL은 RETOUCH |

### MAP PRODUCTION REPORT · §23

```text
================= MAP PRODUCTION REPORT =================
STAGE: ENGINE_AUTHORING / 공통 원근 소비. 가이드 v0.9 전체·SSOT index 선행.
MASTER
- silhouette: 기존 canonical CH1 nav 보존, 신규 production geometry 제작 없음.
- regions: 기존 project map200×200 / tile40px.
- main route: START(100,185)→EXIT(100,7), 원 nav40000값 동일.
- side spaces: 기존 사본 보존.
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 기존 맵의 외곽 구조 수정 없음, 원근 인수와 구분.
LARGE
- source assets: 기존 soil1024 / 전사·실버테일 / 시체나무1143×1400 / 뼈·버섯32×32.
- composites: 신규 합성·원PNG 수정0.
- overlap: 일반 layer→공통 depth, 실제 near clipping. ground UV repeat seam 분할.
- repeated silhouette: 저작 offset9 중 바닥8곳; 나무.14 / 뼈·버섯.8.
MEDIUM
- connections / remaining holes: 기존 production 연결·틈을 새 화면으로 인수하지 않음.
GROUND
- shadow: 지면에 투영한 접지 타원24segments. 방향광 그림자 미구현.
- contamination: 기존 soil 텍스처 소비; 이번 신규 오염 아트0.
- structure integration: 동일 월드 투영. native sourceScene/sourcePreview 높이 계약 유지.
PLAYABLE
- main arenas / travel / breathing / threat: 기존 nav 보존; 전투/몹/본편 슬롯 수정0.
- combat readability: 전사 이동의 표시·foot marker 확인. 실제 본편 전투·보스 readability 신규 인수0.
LANDMARK
- primary / secondary / tertiary: production 랜드마크 변경0. 시험 props 충돌false·간격5타일 이상.
CAMERA QA
- START:4020/7420 실제soil·전사·시체나무·버섯 전신 표시. 거리900/yaw20°/pitch.85.
- EARLY:공개paused 북쪽120px 및 Play325ticks/5.416666666666653초, foot Y6540.799999999894.
- ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: production 전체route 카메라 인수 미수행.
- 별도 높이시험:원근 CPU boxes가 계단 Z0→64 보행, higher-surface picking 미구현.
TECH QA
- route:원 map/start/exit deepEqual·5타일 spacing 관련 신규검사 PASS.
- collision:일반 소비자 기존 원/타일, terrain 기존 maxStep12/maxSlope.6 유지.
- pageerror / 404:현재 runtime errors[]·assetErrors0. 브라우저 전체network/console sweep 미실행.
- seam:1024world-repeat UV seam 분할 구현, GPU perspective-correct interpolation 미구현.
- loading:현재 원근 장면에 실제assets 로드, 첫 server 미실행 실패 후 node server.cjs3333 정상.
- performance:단일 paused render3.0ms·낮은pitch 첫11.7ms. release FPS/VRAM 인수 아님.
- tests:신규30+관련기존25=55고유 PASS. near-hidden rig를 먼 billboard가 덮던 P2 수정·실제Canvas순서/복귀/hidden/JSON검사 포함.
FILES
- stage-owned:공통camera·project·runtime·rig/terrain 소비자·Studio panels·신규tests·docs 정본/관련13문서·Gitstudy 원문.
- concurrent touched:runtime_build(수학),runtime_audit(일반/리그),composition_explorer(terrain),root(UI/검수/docs).
- unrelated touched:마케팅 문서/에셋 및 docs_backup 기존WIP 보존, 본편 game.html 미수정.
GIT
- staged / commit:본 unit의34파일(코드/검사18+docs16)만 checkpoint에 포함. 첫 hook의 CHANGELOG_SYNC 누락을 본 로그 보충으로 해결, bypass0. 실제 hash는 Git log와 외부 commit-receipt.json으로 확인.
- push / deploy:미수행. 로컬 node server.cjs3333 검수만.
VISUAL VERDICT: RETOUCH
NEXT PASS:본편 camera/높이/가림 adapter→조명·안개→공통socket/VFX layer→승인 본체와 실제24장/24FPS 모션.
```

증거 루트: `/Users/fordeargamers/.codex/visualizations/evidence/perspective-engine-20261012`. source study는 Git 원문이며 원근 카메라 math는 엔진팀 저작이다.

## 2026-10-12 후속 native 소비

위 v0.20 저작 검수55고유·원본 영상·저장 왕복은 동결한다. 새 native 단위의 adapter22/native10/scene8고유 및 자연 교전 결과는 두 새 정본을 따른다. 이번에는 game.html의 명시 소비 훅을 변경했다. 높은 면 picking/높이 물리 또는 실제 새3D캐릭터로 승격하지 않는다.
