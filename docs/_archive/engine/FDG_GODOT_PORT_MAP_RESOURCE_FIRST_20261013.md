
## 2026-10-16 Git main 통합 범위

최신 웹 본편과 네이티브 부분 이식을 보존 통합한다. source pin9a4534b4의 native 계약은 최신 웹 전체의 동등성을 뜻하지 않는다. 실제 반영·실행 상태, 모듈 이송·런처·캐시 한계는 [PC·Mac·Git 통합](FDG_PC_MAC_GIT_SYNC_20261016.md)을 따른다. latest_full_game=false를 유지한다.

## 2026-10-15 native 첫 구간 플레이어 접지 연결

| 항목 | 최신 좁은 계약 |
|---|---|
| 구현 | NativePerspectiveView가 기존 player_shadow.geometry/blob_texture를 실제 Main Player·current G에 연결. stage0 기본 depth-slice blob만, source rx=2r+2(charge+6)/ry=2r*.35/alpha.38/rect2.3배; Y=-.01은 렌더 bias, terrain 높이 아님. |
| 검수 | 같은 전사/idle 원본·SFX통합본 새 비교 후 누락 수리. 새 실제 GPU 영향7/7+새 후보 entry3/3, 제품 error0/기존 Camera2DWarning각1. GPU 접지 영역 변화985픽셀 모두 darken, 정상 W12/LMB swing 추적. compile 전 publish 미완 invalid-path1 이력 유지/유효 compile1 PASS. |
| 경계 | URL/saved depthSlice·flat ellipse/stage!=0/arena·방향광/벽 그림자/전체 가림 미채택. 기존 자료의 2D/독립 producer/브라우저 preview 계약은 변경하지 않음. 전체 최신게임·전체 원본 이상 품질 미완, VISUAL VERDICT RETOUCH. |
| 새 후보 | native-review-contact-grounding-20261015/수정본_검토_실행.command, scripts49 snapshot/기존 읽기 links, 초기pause·명시 캐릭터 선택. 기존 후보/asset/PNG/통과suite/GUI 재실행0. 원본 수치·60tick·RNG·QE·nav/LOCK·2_3·foreign 보존. |

상세 geometry·source 이력·API·MAP PRODUCTION REPORT·검수 경계는 [native SSOT의 첫 접지 연결](FDG_GODOT_NATIVE_FIRST_20261013.md)을 따른다.

## 현재 원본 baked 환경 소비 복원 / 진단 벽 기본 표시 제거 — 2026-10-15

| id / 적용 위치 | 실제 계약과 결과 |
|---|---|
| source authority | R/game.html12025~27의 현행 phase=smoothing/root=`assets/map/ch1/production_finish`/version20260930-rotforest-97. 과거 baked_start_smoothing 문서는 제작 이력이며 현재 runtime root로 대체하지 않는다. 현재native map.json의64개도 이미 이root이므로 새복사/hash/import0. W판과혼합0. |
| World API | `get_native_baked_environment_publication()->Dictionary`(0), schema fdg.native-baked-environment.v1. 현재 actualMain/World·stage0/200²/T40/64선언·현재Node/Texture2D1026²/sourcecropRect[1,1,1024,1024]/worldrect/scale 일치 필수. 현재 admitted rows15의 실제Node/Texture/source_rect/world_rect/visible/modulate/source-over/linear, source_nodes는candidate identity만 공급. missing/queued/freed/mismatch는readyfalse/entries[]; sourceheight null/terrain_height_suppliedfalse. |
| native default | Main opt-in은collision292→height80/m_c1bw box를자동mount하지않는다. 해당massAPI는명시진단용으로유지하며정본collision/nav를렌더재료로오인하지않는다. actualsource chunks만 typedpublication으로소비, missing currentchunk는generic Sprite로fallback하지않고숨김. |
| alpha / phase | 현재chunk에만 Sprite3D ALPHA_CUT_DISABLED/source-over, region source1pxbleed제외1024core→1000world, alpha/modulate와현재Texture동일. soil/litter재료priority -100/-99 → baked -90 → 기존VFX0 순서. baked Y=-1.5는렌더pass분리값이며원본terrain/physics높이아님; 기존soil/litter Y=-2/-1.9/actorfoot0/일반ground.2/VFX.6보존. |
| live snapshot | get_snapshot.baked_environment는현재publisher와source/texture/mirror를다시확인하여queued source를cachedREADY로반환하지않는다. source owner 실제해제도readyfalse/current_source_chunk_owner_lost. 기본native_mass_geometry는not_mounted이며fullcomposition/heightterrain/latest_full_game/performance완료false유지. |
| 실패·수리 | compile1 PASS0.562초. 최초GPU7.968초: JSONfloatArray와intArray equality차이로declFAIL→실수치·finite비교수리. probe1로[1.0,1.0,1024.0,1024.0] equalityfalse확정. 다음GPU8.299초는binding15PASS이나underlay가배경을덮어VISUALFAIL→위priority수리. 새GPU8.123초에서원본가장자리표시, 새attack/lossGPU8.158초에서검기위합성·queuedpublisher/snapshot NR확인. freed-source headless1/6.389초 PASS. 제품ERROR0/기존Camera2D warning각1. |
| 새 화면 / 미완 | 기본진단mass0, 늘어진반복root와직사각계단wall제거. 원본숲가장자리/흙합성·검기실가시. 여전히큰빈바닥/작은고정Warrior, 동적ForestSway/FaceLife/hill/moat/foreground/boundary/living-shadow전체합성·전체route/이동가림·선택/스킬/전투값연결미완. 정적world-anchored2D baked를Camera3D로보인것이며새3Dterrain높이완료아님. **VISUAL VERDICT: RETOUCH**. |
| 보존/증거 | sourcegeometry/4footprint/nav/LOCK/MAP3/HPQE/coords/save/원PNG/assetselector/launcher/사용자게임창/배송불변. 옛suite/PNG/hash재연0. 외부 dependency-native-original-baked-first-20261015/source-baked-start-gpu.png 및 source-baked-attack-layer-gpu.png가새최종프레임2개. declaration/layer실패이미지·로그별도보존. |

## Native 벽 투명 검정 채움 수정 — 2026-10-15

| 항목 | 현재 코드·검수·한계 |
|---|---|
| 최소 수정 | native_perspective_view.gd `_build_mass_mesh`의 StandardMaterial3D를 TRANSPARENCY_ALPHA_SCISSOR, alpha_scissor_threshold=0.1로 변경. 이전 TRANSPARENCY_DISABLED가 버리던 실제 current texture alpha를 cutout에 사용한다. 새 shader/asset/PNG 변경 없음. |
| 원인 범위 | 기존 bound_w.png 914×1800/1,645,200픽셀 중 alpha<26 401,751개, 그중 RGB<16 399,865개. alpha 무시로 투명검정이 불투명 검정이 되는 경로를 제거. 모든 검은 영역의 동일 원인 또는 전체 source pixel parity를 주장하지 않는다. |
| 보존 | source_rect/4footprint/height80/mesh topology/UV/physics/nav/LOCK/MAP3/HP/QE/원 PNG/창 선택 launcher 불변. 사용자 및 기존 게임창 입력·재개·종료·재실행·중복 preview 생성 0. |
| 새 영향 검사 | 기존 compile fixture로 변경 영향 compile 1회 PASS/0.534초. 같은 격리 SubViewport fixture를 비대화형 hidden/unfocusable native GPU로 1회 실행/8.406초/exit0/제품ERROR0/기존Camera2D warning1; 새 1920×1080 프레임 저장0(OK). 292/51은 실행 관측값이며 기존 7/12/10/637d suite 재검사가 아니다. |
| 실제 새 화면 | 큰 순검정 채움은 새 프레임에서 보이지 않음. 중앙 바닥·플레이어 실루엣의 뚜렷한 새 절단 미관측. 외곽 계단형/사각 절단·반복 cutout·부족한 접지/가림 polish는 남음. 전체 route/이동중 가림·공개 공격/피해/이동·최신 캐릭터/24art/FPS 완료 증거 아님. |
| 증거/판정 | 외부 dependency-native-mass-alpha-first-20261015/mass-alpha-scissor-gpu.png 및 compile.log/affected-gpu.log. 새 프레임1개만 관측; 옛 PNG/asset hash/success suite 재연0. **VISUAL VERDICT: RETOUCH**. 기술 성공을 전체 visual PASS로 승격하지 않는다. |

## Native CH1-1 실제 벽 메시·교전 표시 첫 연결 — 2026-10-14

| 항목 | 실제 구현·검수·미완 |
|---|---|
| MAP 저작 데이터 | native_view_walls(entries:Array,ctx={}) 1..2, native-view-mass.v1; 실제native_wall_rect_%04d/source_index/sourcekind/원4footprint와rect보존. nativecollision defaultview80/legacym_c3wall_i,l,end80/gate60, height_basis AUTHORED_NATIVE_VIEW_ONLY/source_heightnull/물리값아님. TABLE CANONICAL_NATIVE_COLLISION_RECT→m_c1bw(bound_w.png)는명시MAP 저작view재료이며원ID배정/원pixelparity아님. |
| 실제 중앙 consumer | 2026-10-15본편Main opt-in의collision mass자동mount제거;현재production_finish청크를표시. NativePerspectiveView.mount_native_map_mass_scene()는명시진단전용이며호출한경우에만sourcefloor publicgetter/292실rect/공개materialgetter로NativeViewFloor를assemble/bind. source원G.mapnull은별도fullsourcegap이며검증된nativeview메시를막는동등flag가아님. |
| 실제 메시 | validated292/START근방mesh51. 각ArrayMesh는top+4side의5quad/10triangles/30vertices+normals+UV, 실제currentTexture2D. world→XZ/저작높이→Y. 별도3Dphysics/collider추가0·기존맵/geometry/nav/HP/QE/G/P/LOCK수정0. 영역admission은같은Camera3D의지면역변환4corner bbox·최대저작height/tanPitch+40margin, 플레이어40pxcell/viewport크기변화때만재평가. |
| 실제 재료/UV | StandardMaterial3D unshaded/cullDisabled/filterLinear/textureRepeat/alpha-scissor(threshold0.1, 2026-10-15 수정). 최상면UV=(worldX/textureW,worldYground/textureH), Xnormal side=(worldZ/textureW,-height/textureH), Znormal side=(worldX/textureW,-height/textureH). rect마다0..1fullimage를반복한최초가로줄무늬는실GPUFAIL→이worldcontinuousUV로수리. PNG편집/신규asset/import/hash0. 당초opaque설정은2026-10-15alpha-scissor0.1로수정됨;원Sprite pixel동등은여전히미검증. |
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

## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

<!-- fdg-godot-ground-surface-binding-20261013:begin -->
## Godot CH1 원 바닥 자원·실제 World underlay · 2026-10-13

| 항목 | 현재 구현·검증 / 경계 |
|---|---|
| 정본·연결 | `FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md`. actual World map-context getter→strict adapter→실 MAP provider/soil/litter/Surface 4모듈. schema `exoduser.godot.ch1-native-first.v1`, stage0/200×200/T40만 지원하며 null-bound structural flag로 ready를 대체하지 않는다. |
| 원 자원 | soil1024²/2201462B 및 litter1254²/3442139B 원 PNG2 firstcopy/sourcehash2-targethash2 byte동일·원본변형0. 실제 shader repeat1024/512는 PNG크기와 별개. 격리 실제 최초import2/6.105508917초/exit0/ERROR0·oldreimport0. new2 sidecars/converted-cache pairs만 최초publish·oldcache 덮어쓰기0/Mainimport0. |
| 실제 레이어 | world-local origin0/identity·8000². surface absolute−3002/child relative0,1→effective−3002/−3001, soil brightness.85/saturation.48, litter.76/.55/alpha.7. 기존 baked chunks−3000/groundprops−2500 및 collision/nav/STARTEXIT/source16/RNG 보존. |
| 현재 검증 | 새 actualWorld constructor binding 고유3 FIRST PASS /7.013840624999999초/exit0/assert0/ERROR0. 실제collision427/chunks15/props36 보존, groundprops0이라 해당−2500branch 관측0. invalidcontext8 및 lifecycle5에서 readyfalse/ownsurface정리/맵geometry불변. 기존 MAP soil/litter/surface/provider 성공suite·PNG·원data/old source 검증을 재실행하지 않는다. 원래 R5 missing 관측은 당시 역사이며 현재 자원 공급은 위 첫2import로 구분한다. |
| 시각·제외 | 기존chunk가 underlay를 가리는지/공개GPU canvas/원그림비교/최저1080p240는 미관측. held zones_mask·SVG·zone_weights·zoneblend 목적은 계속 보류. 이번2texture는 기존 승인 soil/litter draw만 닫는다. current Main6/16·frozen배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

아래 이전 R1~R7 기록은 각 최초 제작·검수 당시의 이력이다. 현재 자원 공급·중앙 연결은 이 표와 새 binding 정본을 우선한다.

<!-- fdg-godot-ground-surface-binding-20261013:end -->

# FDG Godot Port — MAP_RESOURCE first slice (2026-10-13)

TASK: GODOT-PORT-MAP_RESOURCE-FIRST-20261013 · team: map_resource (isolated).
OWNERSHIP: `godot/port_modules/map_resource/` (new), this doc (new), E receipt. No edit of central ENGINE (world/factory/player/shared emitters/runtimeconfig), other workers' files, original HTML/PNG/main/save, shared docs, or Git.

## Unit
Port ONE approved CH1-1 floor/environment resource — the base **soil ground material** — to a real Godot draw/material consumer, reproducing its raw HTML values 1:1. geometry / initial-16 / placement / collision / nav / camera / START / EXIT unchanged. actor / public combat-QA NOT reviewed.

## Source (read-only, R repo) — field · pointer · unit
| field | value | pointer | unit |
|---|---|---|---|
| soil file | `ground_dark_soil.png` | `composition.json#/groundMaterials/soil/file` | — |
| canonical PNG (R) | `assets/map/ch1/ground_dark_soil.png` | resolved (metadata only; not opened) | — |
| brightness | **0.85** | `#/groundMaterials/soil/brightness` | RGB multiplier (×) |
| saturation | **0.48** | `#/groundMaterials/soil/saturation` | mix toward luma (0=gray … 1=full) |
| groundTile | **1024** | `#/groundTile` (`[1024,1024]`) | world px per texture repeat |
| worldSize | **8000** | `#/worldSize` (`[8000,8000]`) | world px |
| tileSize | **40** | `layout.js CH1_1_PRODUCTION.tileSize` | world px per nav tile |

HTML semantics preserved verbatim: brightness → `RGB *= 0.85`; saturation → `mix(vec3(luma), rgb, 0.48)`; groundTile → texture repeats every 1024 world px across the 8000 world. No retune/clamp/invented value.

## Public API (`port_modules/map_resource/producer.gd`, `extends RefCounted`)
- `build_soil_spec() -> Dictionary` — frozen raw spec + source pointers (`raw_preserved:true`).
- `soil_shader_code() -> String` — `canvas_item` shader: `repeat_enable` sample → saturation mix → brightness multiply.
- `build_floor_material(texture: Texture2D = null) -> ShaderMaterial` — ShaderMaterial with uniforms `brightness/saturation/world_size/tile_world` set to the raw values; `soil_tex` bound only if a caller-supplied texture is passed (no load/import here; null allowed for headless build).
- `expected_uniforms() -> Dictionary` — the exact uniform values, for test consistency.

Isolation: the producer never opens/loads/writes the original PNG, never generates/hashes/imports a new asset, and performs no scene/geometry/nav/camera work. Texture binding is deferred to the caller (ENGINE or a scene), so no canonical-asset closure is minted here.

## Caller test (`port_modules/map_resource/test_producer.gd`, `extends SceneTree`)
13 assertion groups: raw spec values (brightness 0.85 / saturation 0.48 / tile 1024 / world 8000 / tile 40 / file / canonical / repeat / raw_preserved), material is a ShaderMaterial with shader present, shader contains repeat/saturation/brightness ops, uniforms equal the raw values, `expected_uniforms` consistency, source pointer is an R read-only ref.
Run: `godot4 --headless --script res://port_modules/map_resource/test_producer.gd`.
**Result: RAN — PASS (13 groups, exit 0)** on headless Godot Engine v4.7.2.stable (binary `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`), executed in an isolated E project (`…/team-port/map_resource/first-runtime/project/`) over copies of this module's own scripts only. First run, no fix needed. This is a headless/isolated proof boundary only — not a public play / visual / ≥240 FPS result / normal checkpoint.

## Raw preservation / protected boundaries
native60 / raw numbers / rawflags / poise / Q-only magic (blackBean) / E-forbidden / Q-success blue-induced reflect / owner-independent projectiles / LOCK / nav / START / EXIT — all untouched (this unit builds a floor material only). No ticket / concurrency / single-hit / invuln / win / live-HP-coord / AI-clock / observer injection / projectile deletion / difficulty reduction.

## docs keyword-sync handoff (to ENGINE; shared docs NOT edited here)
Matching ground/soil references found in allowed docs (ENGINE should reconcile path/current-value if this material is consumed centrally):
- `R/docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md` — ground/soil/skin passes (e.g. lines ~45/193/212/214/220: skin65, swamp-seep brightness, depth retouch). Current soil material contract originates from `composition.json#/groundMaterials/soil`.
- `R/docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#skin65` — production SSOT for CH1-1 ground.
Excluded from search & access per scope: `13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`, `tools/marketing_capture_studio_20261009.html/.js`.

## §23 MAP PRODUCTION REPORT
STAGE: CH1-1 / stage0 — Godot MAP_RESOURCE first slice (floor soil material port).
GROUND: contamination/soil — `ground_dark_soil.png` as a repeat-tiled (1024) ShaderMaterial, brightness 0.85 / saturation 0.48 reproduced 1:1. shadow/structure-integration unchanged (no geometry).
MASTER / OUTER / LARGE / MEDIUM / PLAYABLE / LANDMARK: unchanged — no regions/route/placement/collision/nav/camera work.
TECH QA: GDScript producer + first caller test authored and **RUN — PASS (13 groups, exit 0)** on headless Godot 4.7.2 (isolated E project, own scripts only). route/collision/pageerror/seam/performance: not exercised.
FILES: stage-owned — `godot/port_modules/map_resource/producer.gd`, `test_producer.gd`, this doc, E receipt. concurrent/unrelated touched: 0. GIT: 0 (ENGINE owns checkpoint).
VISUAL VERDICT: **NOT_OBSERVED / RETOUCH** — no render/import/Play consumed; headless proof only. Not a visual PASS; not native/combat/production completion.
NEXT PASS (ENGINE, owns central checkpoint): bind a caller-supplied `ground_dark_soil.png` Texture2D (import path to be proposed, not minted here) + place the material on the floor draw surface in a scene, then observe. Reconcile docs keyword-sync above.

## Gaps / unresolved (exact)
- Texture binding + import path for `ground_dark_soil.png` is deferred (no asset minted/hashed/imported here). Required input: an ENGINE-owned Godot import of the approved PNG (or a shared resource path) — source/target path to be proposed to ROOT/ENGINE before any copy/import.
- Test RAN — PASS on headless Godot 4.7.2 (isolated E project). GPU render / import / texture binding not exercised (headless only).
- Other ground materials (litter / commonSkin / mask `ground-zones.svg`) and `groundMaterials.collisionChanges:false` flag are out of this first-slice scope (soil only).

---

## Unit R2 — litter overlay (2026-10-13)
TASK: GODOT-PORT-MAP-LITTER-R2-20261013 · appended; prior soil content unchanged.

Port the approved `groundMaterials.litter` as a real Godot draw/material consumer — a moss-litter **overlay** drawn over the soil floor, raw values 1:1. geometry/nav/collision/initial-16/START/EXIT/camera unchanged. soil producer + its tests/receipts untouched (not re-run).

Source (read-only, R) · field · pointer · unit:
| field | value | pointer | unit |
|---|---|---|---|
| litter file | `materials/forest_moss_litter.png` | `composition.json#/groundMaterials/litter/file` | — |
| canonical PNG (R) | `assets/map/ch1/production_finish/materials/forest_moss_litter.png` | resolved (metadata only; not opened) | — |
| brightness | **0.76** | `#/groundMaterials/litter/brightness` | RGB multiplier |
| saturation | **0.55** | `#/groundMaterials/litter/saturation` | mix-to-luma 0..1 |
| tileSize | **512** | `#/groundMaterials/litter/tileSize` | world px per repeat (litter's own, ≠ soil 1024) |
| overlay alpha | **0.7** | `#/alphaFeather/groundOpacityMultiplier` | overlay opacity (`COLOR.a *=`) |
| worldSize | 8000 | `#/worldSize` | world px |

Public API (`port_modules/map_resource/litter.gd`, `extends RefCounted`): `build_litter_spec() -> Dictionary`, `litter_shader_code() -> String` (repeat → saturation mix → brightness → alpha multiply), `build_overlay_material(texture: Texture2D = null) -> ShaderMaterial`, `expected_uniforms() -> Dictionary`. Isolation: no PNG open/load/write, no asset mint/hash/import, no scene/geometry/nav/camera; texture binding deferred to caller.

Caller test (`test_litter.gd`, `extends SceneTree`): **RAN — PASS (16 groups, exit 0)** on headless Godot Engine v4.7.2.stable (binary `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`), isolated E project (`…/godot-port-map-litter-r2-20261013/project/`), litter scripts only (soil groups not re-run). First run, no fix. Headless/isolated proof only — not public play / visual / ≥240 FPS / normal checkpoint.

VISUAL VERDICT: **NOT_OBSERVED / RETOUCH** — no render/import/Play; GPU/texture-binding not exercised.
Gap: litter texture import/binding deferred — exact source `assets/map/ch1/production_finish/materials/forest_moss_litter.png` → target (ENGINE-owned Godot import path) **proposed to ENGINE only**; no copy/hash/import here.

---

## Unit R3 — zones mask/blend: ON HOLD (write denied)
TASK GODOT-PORT-MAP-ZONES-MASK-R3-20261013: the `zones_mask.gd` write was **denied by the Claude Code auto-mode classifier** (no reason). Not worked around (no alt tool/pieces/host/session). Source confirmed read-only (`groundMaterials.mask="ground-zones.svg"`, resolved `assets/map/ch1/production_finish/ground-zones.svg`; no per-zone weight array in composition.json — zones live in the SVG). Unit HELD pending user permission; nothing created.

## Unit R4 — ground surface draw consumer (2026-10-13)
TASK: GODOT-PORT-MAP-SOIL-LITTER-DRAW-R4-20261013 · appended; prior content unchanged. Separate purpose from R3 (no mask / SVG / zone_weights).

Real Node2D draw consumer that binds the approved soil producer + litter overlay materials to CanvasItems and draws them in the original pass order. geometry/collision/nav/camera/START/EXIT/main/world unchanged.

Raw pass contract (preserved 1:1):
| pass | layer | tile | brightness | saturation | alpha | z_index |
|---|---|---|---|---|---|---|
| 0 (base) | soil (producer.gd) | 1024 | 0.85 | 0.48 | — | 0 |
| 1 (over) | litter (litter.gd) | 512 | 0.76 | 0.55 | 0.7 | 1 |
world 8000×8000, tile 40px; litter composites over soil (z 0→1).

Public API (`port_modules/map_resource/ground_surface.gd`, `extends Node2D`): `build() -> Dictionary` (pure pass/spec/order), `bind_textures(soil_tex: Texture2D=null, litter_tex: Texture2D=null) -> void` (creates 2 ColorRect CanvasItem passes, assigns the two ShaderMaterials, z 0/1), `update_surface(soil_tex=null, litter_tex=null) -> void` (idempotent re-bind), `terminate() -> void` (frees pass nodes), `snapshot() -> Dictionary`. Textures caller-provided (null allowed headless); no PNG open/load/import/mint.

Caller test (`test_ground_surface.gd`, `extends SceneTree`): **RAN — PASS (12 groups, exit 0)** on headless Godot v4.7.2.stable (isolated E project `…/godot-port-map-ground-surface-r4-20261013/project/`, own module scripts only; soil/litter unit tests not re-run). First run, no fix. Headless/isolated structural proof only — not public play / visual / ≥240 FPS / normal checkpoint.

VISUAL VERDICT: **NOT_OBSERVED / RETOUCH** — no render/import/Play; GPU raster not exercised.
Gap: both soil + litter leaf-texture imports deferred — exact sources (`assets/map/ch1/ground_dark_soil.png`, `assets/map/ch1/production_finish/materials/forest_moss_litter.png`) → ENGINE-owned Godot import targets **proposed to ENGINE only**; no copy/hash/import here.

---

## Unit R5 — ground texture provider + owner wiring (2026-10-13)
TASK: GODOT-PORT-MAP-GROUND-PROVIDER-R5-20261013 · appended; prior content unchanged. zones_mask/SVG/zone_weights remain HELD (not touched).

Texture provider that loads+caches the approved soil/litter `Texture2D` from EXISTING Godot product resources, plus the owner-command body wiring the real provider into `ground_surface`. No R PNG copy/hash/import, no minted/placeholder texture reported as real. No map geometry/collision/nav/camera/main change.

**Current real-load state (observed): both resources ABSENT in the product.** `godot/assets/` currently holds ui/enemy textures only — no soil/litter. So `load_soil()`/`load_litter()` return `null` and the provider reports an exact source→target gap (not a mint).

Source→target (ENGINE import proposal; R source is read-only):
| kind | R source | proposed res:// target | status |
|---|---|---|---|
| soil | `assets/map/ch1/ground_dark_soil.png` | `res://assets/map/ch1/ground_dark_soil.png` | canonical-missing |
| litter | `assets/map/ch1/production_finish/materials/forest_moss_litter.png` | `res://assets/map/ch1/materials/forest_moss_litter.png` | canonical-missing |

Public API (`port_modules/map_resource/ground_provider.gd`, `extends RefCounted`): `source_to_target() -> Dictionary`, `load_soil()/load_litter() -> Texture2D` (ResourceLoader.exists→load+cache; null if absent, no mint), `is_available(kind) -> bool`, `gap() -> Array`, `apply_to_surface(surface) -> Dictionary` (owner-command: binds provider textures into ground_surface; missing → null bound, surface still builds 2 passes), `refresh_surface(surface) -> Dictionary`.

Caller test (`test_ground_provider.gd`, `extends SceneTree`): **RAN — PASS (16 groups, exit 0)** on headless Godot v4.7.2.stable (isolated E project `…/godot-port-map-ground-provider-r5-20261013/project/`, own module scripts only; soil/litter/ground_surface suites not re-run). First run, no fix. Verifies source→target map, canonical-missing load branch (real_load=false), gap, and owner wiring (surface still 2 passes with null textures). Headless proof only.

VISUAL VERDICT: **NOT_OBSERVED / RETOUCH** — no render/import/Play; public GPU not exercised. real texture load = false (canonical-missing).
Required ENGINE decision: import the two approved PNGs to the proposed `res://` targets (ENGINE owns import/Git). Until then the provider yields null + gap; no placeholder is ever reported as the real texture.

---
