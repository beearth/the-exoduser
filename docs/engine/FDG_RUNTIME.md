## Godot 실제 원근 뷰 첫 연결 — 2026-10-14

| 범위 | 구현 / 미완 |
|---|---|
| 실제 선택 | Main `mount_native_perspective_view(settings={})` 또는 명시 실행 flag `--fdg-native-perspective-first`. 기본 2D와 기존 Web artifact는 그대로다. native Camera3D/SubViewport가 현행 World/Player의 실제 Sprite2D·AnimatedSprite2D texture와 soil/litter 두 ShaderMaterial을 소비한다. |
| 물리와 입력 | world XY→Godot XZ/height→Y. 새 `native_world_to_screen`·`native_screen_to_world`가 실제 Camera3D 투영/지면 또는 지정높이 plane ray를 사용. Player 실제 mouse-aim 공급 Callable 연결. 물리·nav·맵·HP·G/P·Q/E 수치 변경0. |
| 실제 품질 경계 | 구형 Warrior/기검참/캐릭터 선택 미완이 그대로다. 24고유장수·24FPS, custom draw VFX/Canvas shader parity/labels/terrain 높이·접지shadow/가림 polish/전체route·전투/smooth motion/성능 미검수. `latest_full_game=false`. 전체 최신 버전 또는 출시완료 아님. |
| 새 검수 | headless 새projection9 PASS(6.247초), 새flag/owner5 PASS(6.073초), 새view-script-loss3 PASS(6.129초). GPU START 최초→anchor수정1→최종수정 검수3실행, 최종발접점 신규1 PASS(quad_min_height0/당시frame-bottomY7480; 실제body-anchorY7477.5는2026-10-15별도수정). 총 새의미case18, actualMain6회(기술3+새visual3). 이전 성공suite/PNG해시/asset복사/import/배송교체/인간play창 입력0. 최초layout warning1은top-left anchors로수리, 최종GPU/기술은제품ERROR0·기존Camera2D warning1씩. |
| VISUAL VERDICT | **RETOUCH** — START 원근 GPU 실제프레임 확인. 기존 캐릭터 품질·전체 맵/교전·VFX·그림자·가림은 미완. 접점 오류 첫프레임을 보존하고 최종수정은 별도 PNG로 기록. |

현재 버전 manifest의 `map.camera`는 companion Camera2D 진단이고, 새 `map.perspective_view`가 opt-in 실제 Camera3D 선택/준비/미완을 별도로 명시한다. API 상세는 `FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 표, §23 MAP PRODUCTION REPORT는 `FDG_ENGINE.md`의 같은 날짜 표를 따른다. source pin만으로 최신화했다고 표시하지 않는다.

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

<!-- fdg-godot-floating-text-binding-20261013:begin -->
## Godot 실제 World 텍스트 연결 · 2026-10-13

| 항목 | 현재 구현·검증 / 남은 범위 |
|---|---|
| 정본·공개 API | `FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md`. 실제 World `emit_native_text(x,y,text,color,life=null,size=null,num_str=null)`, `get_native_text_snapshot`, ko identity `localize_native_text`, 기존 NotoSansKR `get_native_text_font`을 공급한다. |
| 단일 풀·시계 | 실제 World 아래 adapter/producer 한 개·ring40·z4002. dark 요청 `(x,y−20,"💜다크볼!","#cc44ff",30,22,null)`은 admission1/legacy Label0. HitFX 기존 priority3 끝에서 실제 context.dt_sp/frame/ens를 한 번 공급해 y−=.6ticks→life−=ticks. pause/중복/복사token/오류dt 거부. |
| 첫 신규 검사 | binding3 FIRST PASS /5.653511290999999초/exit0/assert0/ERROR0. 실제 dark16ticks/post16, generic44admission/40ring/실Camera zoom2→view960×540, guard9frames/37거부/pause4. 읽기검수에서 발견된 ready 타입/실제 backend상태/detach·reparent·queued삭제 guard를 수리해 신규 lifecycle1 FIRST PASS /5.107139167초/exit0/assert0/ERROR0, 전체고유4. 첫3성공 반복0; 이전 성공suite/import/Main/GUI 재실행0. |
| 현재 경계 | 실제World sink와 dark caller만 연결; detonate/shield-bash/combo 등 개별caller·full locale/reset/testbed120·원480×168 숫자atlas·공개pixel/canvas비교·최저1080p240은 미완. current Main source6/16·동결배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

<!-- fdg-godot-floating-text-binding-20261013:end -->

# FDG 미리보기 런타임 계약

> **2026-10-12 네이티브 원근 소비:** `fdgPerspective=first`를 exact r4 저장 격리 진입과 함께 지정하면 이 checkout의 `game.html`이 공통 world camera를 직접 소비한다. 기존 GPU 텍스처의 양수 W 원근 보간, 지면 역투영 입력, 캐릭터/몹/지정 props의 billboard와 depth 순서를 연결했다. `fdgScene=ruined-forest-first`는 NORMAL Lv1의 독립 폐허 숲길을 같은 게임에서 실행한다. [카메라 계약](FDG_NATIVE_PERSPECTIVE_20261012.md) · [씬 계약·실제 교전·§23](FDG_RUINED_FOREST_PLAYABLE_20261012.md). 기본 게임·stage LOCK/원PNG·전투 규칙을 새 기본으로 바꾸지 않았다. 전체 출시 품질 및 실제 캐릭터24장/24FPS는 미완료다.


> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 기본 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

> v0.19 추가 공개 관측: `getVfxPlaybackSnapshot()`은 활성 sheet의 정의/인스턴스·source crop·frame/FPS·age/life/alpha/non-loop 종료를 명시 호출 때만 독립 사본으로 반환한다. owner clock·풀·이미지·수명 규칙 변경0. [API 정본](FDG_SPRITE_PLAYBACK_RUNTIME_20261011.md), [Studio 실제 UI 검수](FDG_SPRITE_PREVIEW_20261011.md).

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

기준일: **2026-10-10, Asia/Seoul**. 구현 파일은 `engine/fdg/runtime.js`·순수 계측 `engine/fdg/profiler.js`, 기존 검증 파일은 `test/fdgRuntime.test.mjs`·`test/fdgProfiler.test.mjs`다. v0.5 선택 리그 소비자 `engine/fdg/rig-scene-runtime.js`와 새 한정 검증 `test/fdgRigSceneRuntime.test.mjs`를 연결했다. FDG Studio의 독립 Canvas2D 미리보기이며 `game.html`의 캐릭터·자원·스킬·적 AI·맵 밸런스는 변경하지 않는다. 제작 프로젝트의 데이터만 받아 실행한다. 기존 PNG 에셋을 재사용하며 캐릭터 생성 API를 호출하지 않는다. [v0.5 소비자 정본](FDG_RIG_SCENE_RUNTIME.md)에 모든 새 필드·상수·수식을 기록한다.

선행 검토: `4.0케릭터스프라이트 디자인`, `5.0애니메이션파이프라인`, `2_1 스킬관리+합체시스템+자원`, `5.1임펙트디자인`, `12퍼포먼스·최적화`의 현행 구현 계약. 충돌·카메라 작업 전 `_MAP_SSOT_INDEX.md` 및 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체를 읽었다. 보호된 `2_3 돌진+패링+방패시스템` 문서는 수정하지 않는다.

r6 조건 노트: 본문의 보편 clip/time/sequence/API 표는 node.returnTo·sequence.autoStart·entryTransitionSeconds를 미설정한 기존 기본 계약을 유지한다. 아래 r6의 명시 설정은 opt-in 확장으로 적용한다. returnTo 노드의 전환 중 setRigClip/replay는 false, sequence elapsed는 마지막 공격 시각으로 고정하고 현재 idle node time을 별도 표시하며, autoStart:false 일반 start/step은 자동 공격 회차를 만들지 않는다. 기존 표 행·r5 수치·과거 검수 이력을 변경하여 새 결과로 합산하지 않는다.

## 실행 단위와 상수

| ID / 항목 | 값 / 공식 | 적용 위치와 의미 |
|---|---|---|
| `FIXED_STEP` | `1 / 60`초 | 이동·쿨다운·회복·입자·캐릭터 애니메이션·선택 리그 clip/전환의 고정 업데이트 간격 |
| `MAX_FRAME_DELTA` | `0.25`초 | 단일 화면 프레임의 입력 시간 상한 |
| `MAX_SUBSTEPS` | `6` | 한 화면 프레임에서 최대 6번 업데이트; 초과 완전 틱은 버리고 소수 잔여 시간만 유지 |
| `MAX_PARTICLES` | `1024` | 미리보기 활성 입자 하드 상한; 요청한 풀 크기를 `1..1024`로 제한 |
| `ASSET_TIMEOUT_MS` | `8000`ms | 이미지 로딩 시간 초과 시 실패 처리·대체 표시 |
| `MAX_PIXEL_RATIO` | `2` | 논리 CSS 픽셀과 backing 픽셀 분리; DPR `1..2` |
| `EPSILON` | `1e-9` | 고정 틱·쿨다운·수명·접선 충돌의 부동소수점 오차 처리 |
| 세계 단위 | 픽셀 | 캐릭터 위치·반경·속도·스킬 사거리·VFX 속도·카메라 |
| 시간 단위 | 초 | 쿨다운·VFX 수명·애니메이션 경과 시간·`resourceRegen` |
| 타일 좌표 변환 | `(tile + 0.5) × tileSize` | START·EXIT·비주얼 오브젝트 중심/발 위치 |
| 대각선 이동 | `speed × dt / hypot(dx,dy)` | 상하좌우와 같은 전체 이동 속도 |
| 이동 분할 | `ceil(max(abs(dx),abs(dy)) / max(1,tileSize/4))` | 빠른 이동이 벽을 건너뛰지 않도록 작은 구간으로 나눔 |
| 카메라 경계 | `viewport/2 .. world−viewport/2` | 작은 맵은 세계 중심에 고정; 큰 맵은 화면을 월드 안에 유지 |
| FPS 표시 | `old×0.9 + current×0.1` | 실제 rAF 간격을 지수 평균; 게임 업데이트 빈도와 별개 |

기본 방어 값은 스키마 검증을 대신하지 않는다. Studio는 프로젝트 검증 후 런타임에 전달한다.

| 미지정 항목 | 런타임 기본 값 |
|---|---|
| `SkillSystem.resourceMax` / `resourceRegen` | `100` / `10`초당 |
| 캐릭터 `speed` / `radius` | `160`px/s / `12`px |
| `isWalkableCircle`의 `tileSize` | `40`px |
| 스프라이트 `columns` / `rows` / 셀 크기 | `1` / `1` / `1×1`px |
| 스프라이트 FPS / scale | `8` / `1` |
| 스프라이트 `anchorX` / `anchorY` | `0.5` / `1` (가운데 발 기준) |
| `animation.row` / `start` / `loop` | `0` / `0` / `true` |
| 입자 크기 / 색 / 확산각 | `4`px / `#f4bd78` / `2π`rad |
| 타깃 없는 입자 방출각 | `−π/2` |
| 타깃 없는 스킬 | 캐릭터 방향의 최대 사거리 위치 |
| 캔버스 크기 최종 폴백 | `800×600` CSS px |
| 에셋 기본 기준 경로 | `/` (서버 루트) |

## 프로젝트 소비 계약

| 데이터 | 필드 | 실행 계약 |
|---|---|---|
| 프로젝트 | `schemaVersion,id,name,map,characters,skills,vfx,preview` | schemaVersion 1의 검증된 프로젝트; 런타임은 받은 참조를 보관 |
| 맵 | `width,height,tileSize,tiles,start,exit,objects` | `tiles`는 row-major; **1만 이동 가능**, 0·2·3은 이동 불가 |
| 캐릭터 | `id,name,speed,radius,sprite,animations` | 이동 반경은 원형; 최초 START가 맞지 않으면 가장 가까운 맞는 바닥 타일에 스폰 |
| 스프라이트 | `src,frameWidth,frameHeight,columns,rows,frames,fps,scale,anchorX,anchorY` | source rectangle로 정확한 셀만 렌더; 없는 이미지/셀은 대체 표시 |
| 방향 이미지 | `sprite.directions={direction:src}` | 모든 방향을 사전 로드; `south-east`, `southeast`, `south_east` 키 형식 지원 |
| 애니메이션 | `{row,start,frames,fps,loop}` | `start`는 시작 **열**; 프레임은 다음 행으로 연속 재생 가능 |
| 스킬 | `id,name,cooldown,cost,range,vfx,damage` | 성공할 때만 비용 차감·쿨다운 시작; 사거리 밖 타깃은 원점부터 range 거리로 제한 |
| VFX | `id,name,kind,color,count,life,speed,size,spread,sprite?` | burst·ring·projectile, 생존 시간/속도는 초 기준; sprite는 선택 사항 |
| 미리보기 자원 | `preview.resourceMax,resourceRegen` | 하나의 미리보기 자원 풀; 시작 최대치, 초당 회복 |
| 기본 선택 | `preview.characterId,skillId,vfxId` | 없으면 각 배열 첫 항목 |
| 비주얼 오브젝트 | `{id,name,x,y,src,scale,layer,collision:false}` | 좌표는 TILE; 중앙 X·발 Y 앵커. `back → START/EXIT → world(리그/플레이어와 발Y 순서) → VFX → front` |
| 선택 리그 장면 v0.5 | `rigScene:{version:1,resources,nodes,camera,sequence?}` | 기존 rigVersion1 문서를 리소스로 소비. nodes WORLD 픽셀 배치·무충돌; 같은 발Y는 object→rig→player. [상한·데이터 정본](FDG_RIG_SCENE_RUNTIME.md) |

오브젝트의 시각·충돌 분리 원칙을 따른다. 첫 구현의 `map.objects`는 시각 전용이며 오브젝트 gameplay collision은 없다. 맵 geometry는 입력된 `tiles`만 사용한다. 맵 생성·production stage 수정·`genGauntlet` 호출은 하지 않는다.

## 공개 API

| API | 인수 / 반환 | 동작 |
|---|---|---|
| `new FDGRuntime(canvas,project,options)` | `options={onStats,onError,assetBase:'/'}` | Canvas2D context, 입력 리스너, 입자 풀 구성; 캔버스에 없을 때 `tabindex=0` 추가 |
| `load()` | `Promise<runtime>` | 캐릭터·방향·VFX·오브젝트 이미지를 캐시/사전 로드; 완료 후 atlas 크기 검증·화면 갱신 |
| `setProject(project)` | `Promise<runtime>` | 선택·자원·쿨다운·입자·스폰·시간을 초기화; 공통 이미지는 캐시 재사용, 삭제된 src는 캐시/대기 로딩에서 해제; 기존 리그 소비자 해제 후 serialized 리그 시간/전환/카메라로 재구성; 교체 후 pause하여 입력·RAF·accumulator 해제; clock0/paused |
| `start()` / `resume()` | `runtime` | rAF 시작; 중복 루프 생성 금지; 첫 프레임에는 경과 시간 누적 없음 |
| `pause()` / `stop()` | `runtime` | 루프 취소·입력/누적 시간 정리; 현재 캐릭터/입자/자원 상태 보존 |
| `dispose()` | 없음 | 루프·입력·리스너·ResizeObserver·로딩 타이머·이미지 캐시·리그 소비자의 노드/리소스/owner 변환 참조 정리; 반복 호출 안전 |
| `step(seconds)` | 실행된 틱 수 | 고정 시간 계산을 수동 실행; 정지/일시정지 상태에서도 호출 가능, disposed는 0 |
| `setCharacter(id)` | `boolean` | 존재하는 캐릭터로 변경; 새 반경이 맞지 않는 위치는 재스폰 |
| `setSkill(id)` | `boolean` | 존재하는 스킬 선택 |
| `setDirection(dir)` | `boolean` | 문자열은 방향 이미지 선택; 숫자는 atlas의 절대 시작 행 지정 |
| `setAnimation(name)` | `boolean` | 해당 캐릭터 애니메이션 선택; non-loop 종료 후 입력 상태의 idle/walk로 복귀 |
| `setInputEnabled(boolean)` | `runtime` | 맵 브러시 등 편집 모드에서 이동·Space·클릭 시전 해제; 해제 시 입력 정리 |
| `clearInput()` | 없음 | 이동키·포인터 타깃 삭제 |
| `triggerSkill(id?,target?)` | `{ok,reason?,skillId,skill?,origin?,target?,damage?}` | target은 WORLD PIXELS; `unknown-skill`·`cooldown`·`resource`·`disposed` 실패 원인 |
| `triggerVfx(id?,position?)` | 실제 방출 수 | 기본 선택 VFX·플레이어 위치 사용; 자원/쿨다운 미소비 |
| `getVfxPlaybackSnapshot()` | 새 array | 활성 sheet-bearing 입자만. `definitionId/particleIndex/src/age/life/frameIndex/cell/frames/fps/alpha/loop:false/finished`. age/life초, frameIndex0-based, cell source px. stats 자동 포함0·시계 진행0·setProject/dispose 후빈배열. [전체 계약](FDG_SPRITE_PLAYBACK_RUNTIME_20261011.md) |
| `setCamera(x,y)` | `runtime` | WORLD PIXELS 카메라 중심을 수동 설정/경계 제한; 추적 해제 |
| `followCharacter()` | `runtime` | 플레이어 추적 복구 |
| `getRigNodeSnapshot(id)` | 독립 node snapshot/null | 현재 XYZ skin·본 좌표·화면 정점·발 anchor·time/전환. 없는/deleted/disposed ID는 null |
| `getRigSceneSnapshot()` | `{nodes,activeNodes,resourceCount,ownedRaf:0,ownedListeners:0,disposed}` | 같은 evaluate 경로의 독립 복사. activeNodes는 visible 설정 수이며 viewport 컬링 후 수가 아님 |
| `captureRigScene()` | 새 scene/undefined | transient node time/clip/material/transition, clamp된 현재 camera X/Y/follow 및 mesh view yaw/pitch를 저장 복사에 반영. unknown metadata 유지; 미지정/disposed는 undefined |
| `setRigClip(nodeId,clipId,transitionSeconds=.25)` | boolean | 해당 리소스의 clip/null 선택, target time0. 기간0 즉시, 유한0..10초 전환 |
| `setRigMaterial(nodeId,materialId)` | boolean | 호환 색 또는 UV texture 재질 교체, time·clip·전환·XYZ 변형 유지. texture는 기존 owner assets 캐시에서 소비하며 정확 치수 검사 |
| `seekRig(nodeId,time)` | boolean | 유한 비음수 시각, loop wrap/non-loop clamp; 현재 전환 해제. 일시정지 소유자는 UI |
| `setRigView(yaw,pitch)` | boolean | radians yaw±π/pitch±π/3, 모델의 yaw/pitch 변경. viewCamera가 있으면 회전 결과를 공통 월드 카메라에 투영. camera X/Y/follow는 기존 runtime API 사용 |
| `worldToScreen(x,y,z=0)` | 화면 좌표 | 기존 평면은 `world−camera+viewport/2`의 `{x,y}`. viewCamera는 Z 포함 공통 투영 `{x,y,depth,scale,visible,distance}`. terrain 분기는 기존 Z0 지면을 투영하며 해당 consumer의 project(x,y,z,owner)가 높이를 소비. 결과 CSS 픽셀 |
| `screenToWorld(x,y)` | 좌표 또는 null | 기존 평면은 위 변환의 역함수. 공통 원근은 Z0 지면 역투영이며 지평선/near 뒤는 null; 높은 면 picking 미구현 |
| `resize()` | 없음 | CSS 크기·DPR backing 갱신, 카메라 제한·렌더 |
| `renderOnce()` | 없음 | 시뮬레이션 시간을 증가시키지 않고 화면·통계 갱신 |
| getter `project,player,camera,particles,skills,state` | 현재 상태 참조 | Studio 미리보기·검증용; 직접 변경보다 API 사용 권장 |
| getter `stats` | shallow-frozen snapshot | 아래 통계 계약 참조 |
| `animationFrame(sprite,animation,seconds,rowOverride?)` | `{index,column,row,sx,sy,sw,sh,finished}` | 시작 `row×columns+start`, `floor(seconds×fps)`, loop/non-loop·마지막 불완전 행 대응 |
| `isWalkableCircle(map,x,y,radius)` | `boolean` | 원·타일 사각형 교차, 월드 경계·0/2/3 타일 차단 |

입력 이벤트는 캔버스에만 keydown/keyup을 연결한다. Inspector를 편집할 때 이동하지 않는다. WASD/방향키는 이동, Space는 현재 스킬을 1회 시전하며 key repeat는 시전하지 않는다. 왼쪽 클릭/터치는 캔버스에 포커스를 주고 클릭의 월드 좌표에 시전한다. 이동키의 Ctrl/Alt/Meta 조합은 받지 않는다. 캔버스 blur·window blur·document hidden·pause·stop·dispose에서 입력을 비운다. 일시정지 중 프로그램 API로 시전할 수 있으며 시간은 `step` 또는 `resume`까지 진행하지 않는다.

## 스킬·입자 계산

| 시스템 / 항목 | 공식 / 값 | 구현 위치 |
|---|---|---|
| 자원 회복 | `min(resourceMax,resource+resourceRegen×dt)` | `SkillSystem.update` |
| 쿨다운 회복 | `remaining−dt`, epsilon 이하 0 | `SkillSystem.update` |
| 시전 비용 | `max(0,resource−cost)` | `SkillSystem.cast`, 검사를 통과한 성공 1회만 |
| 타깃 제한 | `origin + (target−origin)×min(1,range/distance)` | `SkillSystem.cast` |
| burst/ring 위치 | 제한된 스킬 target | `triggerSkill` |
| projectile 위치 | caster origin, origin→target 방향 | `triggerSkill` |
| burst/projectile 확산 | `aim+(random−0.5)×clamp(spread,0,2π)` | `ParticleSystem.emit` |
| 입자 이동 | `position+=velocity×dt` | `ParticleSystem.update` |
| 입자 만료 | `age+epsilon>=life` | 레코드를 free stack에 반환, active 배열 swap-remove |
| 입자 초과 | 빈 슬롯만 방출, 초과분 `dropped` 누적 | 최대 1024개의 객체를 생성 시 1회 할당·재사용 |
| 시트 중복 방지 | 방출당 첫 레코드 1개만 `sprite`, 나머지 `count−1`개는 primitives | 예: count48은 sheet1 + primitive47; 전체 budget48 |
| sprite 이동 | burst/ring은 emitter 원점 고정, projectile은 정확한 aim·속도로 이동 | 작은 primitive의 spread와 분리; 큰 시트 반복 중첩 방지 |
| ring 반경 | `size+speed×age` | 중앙 위치 유지, 방사형 arc segment |
| ring arc | 한 입자 `2π`, 여러 입자 `2π/count×0.9` | 인접 segment 사이 10% 간격 |
| ring 선 두께 | `max(1,size×0.25)`px | 절차적 대체 표시 |
| projectile 선 | 길이 `size×3`, 두께 `max(1,size)`px | 진행 방향 꼬리 |
| burst 반경 | `max(0.5,size×alpha)`px | 시간에 따라 축소 |
| 입자 alpha | `max(0,1−age/life)` | 스프라이트와 절차 표시 공통 |
| 입자 sprite | `frameWidth/Height×sprite.scale`, non-loop | FPS로 순차 재생·마지막 프레임 유지. **life가 frames/fps보다 짧으면 전체 clip 완료 전에 life에서 종료**; 사용자 life를 늘려 덮어쓰지 않음 |

| 공개 클래스 | 생성 / 메서드 / 상태 |
|---|---|
| `ParticleSystem` | `new ParticleSystem({budget:1024,random:Math.random})`; `emit(definition,position,{target,angle})`, `update(seconds)`, `clear()`; `pool`, `active`(index 배열), `free`, `count`, `budget`, `dropped` |
| `SkillSystem` | `new SkillSystem(skills,{resourceMax:100,resourceRegen:10,onCast})`; `update(seconds)`, `getState(id)`, `cast(id,origin,target)`; `definitions`, `cooldowns`(Map), `resource`, `resourceMax`, `resourceRegen`, `castCount` |
| `SkillSystem.getState` | `{id,resource,resourceMax,cooldown,cooldownRemaining,ready}`; ready는 ID 존재·쿨다운 완료·자원 충분을 모두 확인 |

피해량은 시전 결과의 metadata로만 제공한다. 적·피격·AI·패링·스킬 합체·장비 보정·HP/ST/MP 분리는 이 미리보기의 구현 범위에 포함되지 않았다. 기존 본편 수치와 공식을 덮어쓰지 않는다. 동시 공격 제한/어택 티켓은 없다.

## 렌더·오류·통계

| 항목 | 계약 |
|---|---|
| 타일 컬링 | 기존 평면은 camera viewport의 타일 범위. viewCamera는 투영 map polygon을 viewport와 clip한 뒤 지면 역변환한 map-clamped bbox 순회. 맵 전체를 보는 lens에서는 최대40000셀 후보 가능; 고정 소량 예산 보장 아님 |
| 타일 색 | 0 `#111218`, 1 `#273134`, 2 `#3b2831`, 3 `#26384a`; 배경 `#0b0e12` |
| 렌더 순서 | 배경 fill 뒤 `tiles fill/grid → BACK → 기존 START/EXIT → world/rig/player → VFX → FRONT → errors`. `_drawMap()`은 타일·격자만, `_drawMapMarkers()`는 BACK 직후·world/rig/player 전에 호출 |
| 그리드 | `#ffffff0a`, 1px stroke; `_drawMap()`에서 기존 collision 타일 표시와 함께 그림. Studio grid/route checkbox는 overview `mapCanvas` 전용이며 runtime 표시 옵션이 아님 |
| START/EXIT 표시 | 입력 `map.start` / `map.exit`, 색 `#76c3b0` / `#dfbb79`; 중심 `(tile+0.5)×tileSize`, 크기 tileSize×0.6 사각형·2px stroke, label `10px sans-serif`·center·Y−tileSize×0.4; 화면 경계 ±1타일 컬링, 보이는 표식당 drawCalls2. 별도 runtime 표시 옵션 없음 |
| 경로·휴식 표시 범위 | runtime BFS path/rest marker draw 없음. 기존 START/EXIT 합성 위치만 변경하며 회색 타일 전체 재덮기·새 표식·NPC·project field 추가 없음 |
| 캐릭터 표시 | pixel-art `imageSmoothingEnabled=false`; 원본 셀, scale·anchor 적용; 화면 밖 200px 여유에서 생략 |
| 캐릭터 그림자 | `#00000066`, 반경 `(radius,radius×0.5)` 타원 |
| 캐릭터 대체 표시 | `#b5d9d4` 본체 / `#ed70cb` 2px 외곽선 / `#172b32` 14px `?` |
| 오브젝트 컬링 | 실제 이미지 `naturalWidth/Height×scale` 경계가 화면과 교차할 때만 렌더 |
| 오브젝트 대체 표시 | 한 타일 사각형, `#ef70c9` 2px 외곽선·12px `?` |
| VFX 컬링 | 절차 반경 또는 sprite 크기 중 큰 값의 화면 여유 |
| 에셋 기준 경로 | 기본 `/`; `img/...`는 Studio URL 위치와 관계없이 `/img/...`. `assetBase` absolute URL도 지원 |
| 로딩 캐시 | 동일 src의 ready/loading은 공유; setProject에서 active error 레코드는 제거하여 새 Image로1회 재시도; retired ready/error 이미지 참조 해제·pending 타이머/핸들러/Promise 취소, stale 오류는 다음 프로젝트에 보고하지 않음; 방향 PNG 전부 preload |
| atlas 검사 | 모든 선언 프레임에 필요한 width=`min(frames,columns)×frameWidth`, height=`ceil(frames/columns)×frameHeight`; 렌더 시 선택 셀 경계도 확인 |
| 로딩 실패 | `onError(error,{source})`, src/message 중복 억제; 캐릭터/오브젝트/VFX를 절차 표시, 화면 하단 오류 수(12px `#f1a3d8`) |
| `onStats` | renderOnce 완료 시 `stats` snapshot 전달 |
| `state` | `ready` / `running` / `paused` / `stopped` / `disposed` |

| `stats` 필드 | 의미 |
|---|---|
| `fps,updateMs,renderMs` | 화면 rAF FPS, 직전 step 소요 ms, 직전 render 소요 ms |
| `frameDeltaMs` | 직전 실제 rAF timestamp 간격의 **clamp 전 ms**. 초기·첫 start/resume·blur/hidden 뒤 첫 프레임·setProject 초기값은0. pause/stop에서도0 |
| `frame,time,updateSteps` | rAF 프레임 수, 실제 시뮬레이션 초, 실제 실행 고정 틱 수 |
| `droppedSteps,droppedTime` | frame clamp·substep cap으로 버린 틱 수/초; 낮은 FPS/히치 진단 |
| `drawCalls,visibleTiles,visibleObjects` | 직전 렌더의 draw 연산 계수·컬링 후 타일/오브젝트 수; GPU 드로 콜 측정값 아님 |
| `particleCount,particles,particleBudget,particlesDropped` | 활성 수(앞 두 필드 동일)·풀 예산·예산 초과 방출 요청 누적 |
| `resource,resourceMax,cooldownRemaining,casts` | 현재 미리보기 자원·최대치·선택 스킬 남은 초·성공 시전 횟수 |
| `characterId,skillId,vfxId,state` | 선택 ID와 실행 상태 |
| `assetErrors,errors` | 중복 제거 오류 개수·`{source,message}` 배열; 스폰 오류도 포함 |
| `viewCamera,projection` | 명시 viewCamera가 있을 때만 저작 camera 6필드 독립 복사 및 현재 일반 장면 투영 이름. terrain은 별도 getTerrainSceneSnapshot().camera가 정본 |
| `groundTileCandidates,groundTextureDraws` | 명시 viewCamera가 있을 때만 일반 바닥의 bbox 후보 셀 수 및 실제 soil drawImage 성공 수. 이미지 UV seam 분할로 셀당 여러 호출 가능, GPU/VRAM 통계 아님 |

`setProject`는 time/updateSteps/droppedSteps/droppedTime/frameDeltaMs를 초기화한다. rAF frame 수는 런타임 인스턴스 전체 수명으로 누적된다. 수동 `step`·`renderOnce`는 frame/frameDeltaMs를 증가시키거나 새 측정 프레임을 만들지 않는다. 1초 히치의 frameDeltaMs는1000이며 기존 시뮬레이션은 MAX_FRAME_DELTA0.25초·최대6틱에 의해0.1초만 진행하고54틱/0.9초를 버린다. `drawCalls`는 절차 표시에서 여러 Canvas 연산을 합쳐 세는 미리보기 계수이며 WebGL/WebGPU batch 통계가 아니다.

## v0.5 선택 리그 consumer 연결

[리그 장면 런타임 정본](FDG_RIG_SCENE_RUNTIME.md)을 따른다. `rigScene`이 없으면 기존 렌더/clock/입력 경로를 사용한다. 신규 장면 제작이나 production entity/collision adapter를 추가한 기능은 아니다.

| 항목 | 현행 additive 계약 |
|---|---|
| 실행 소유 | FDGRuntime `_update(1/60)`에서 consumer.update만 호출. consumer RAF/listener/timer/image/GPU lease0, 기존 runtime RAF/입력/observer 유지 |
| 실제 계산 | 기존 `evaluateRig(resource.project,{clipId,time,materialId,blend})`. 수동 pose는 resource.project.preview.pose, math/새 모델 생성 없음 |
| 렌더/snapshot | 동일 evaluate 경로. pause/render는 시간 진행 없음, 수동 owner step도 동일 고정 틱. snapshot 호출 비용은 renderMs 구간 밖일 수 있음 |
| clip 전환 | 기본.25초, from/target 시간 동시 진행. `elapsed+1e-9>=duration`, 정확히15틱 종료. blend의 T선형/rotation slerp는 순수 math가 수행 |
| 카메라 | `_spawn` 뒤 serialized X/Y/follow 적용 후 기존 map/viewport clamp. yaw/pitch는 consumer mesh view이며 월드 카메라 움직임과 분리 |
| placement | 발 anchor=worldToScreen(worldX,worldY), heightZ를 screenY에서 직접 차감. yaw로 XZ 회전 후 pitch Y/Z 직교투영×node.scale |
| node/depth | world 발Y 오름차순, 동률 object→rig→player. 현행 합성은 tiles fill/grid→BACK→기존 START/EXIT→world/rig/player→VFX→FRONT→errors. 리그 내부 면은 삼각형 평균 projected depth 정렬 |
| Canvas 계수 | 리그 삼각형 fill+stroke=2를 기존 drawCalls에 더함. viewport 밖 projected bounds는 draw0. GPU 완료시간/VRAM/제품 FPS 측정 아님 |
| 저장·재열기 | capture는 현재 clip/material/time/transition과 실제 camera를 unknown metadata 복사에 반영. owner가 pause하여 저장하면 전환 중 같은 skinned pose로 재열기 가능 |
| 교체·삭제·수명 | setProject마다 이전 consumer dispose 후 새 구성. node/resource map와 owner 변환 참조 해제, 삭제 ID snapshot=null. runtime dispose 뒤 control/step은 inert |
| 시각·충돌 | 노드는 무충돌 시각 인스턴스. 기존 tiles·player collision·스킬/VFX 계산 그대로 |
| 새 한정 검증 | `node --test test/fdgRigSceneRuntime.test.mjs` **13/13 PASS**. v0.5에서 기존 runtime17/profiler8/rig47 및 완료 suite 재실행 없음 |

상세 node snapshot, 상한8resources/32nodes·position/scale/view/transition 범위, 투영/normal shade 공식, 수치 oracle와 v0.5 MAP PRODUCTION REPORT는 소비자 정본에 기록한다. 기존 아래 초기25개 검증 결과와 v0.5의 새13개 결과를 재실행 합계로 표시하지 않는다.

## Studio 순수 프레임 계측 — `FrameProfiler`

`engine/fdg/profiler.js`는 전달된 완료 프레임 stats만 복사하여 집계한다. DOM·rAF·타이머·현재 시각·네트워크·파일·프로젝트/설정 저장을 호출하지 않는다. `sample`은 미리 할당한 bounded record를 재사용하고, `snapshot`에서만 정렬용 복사 배열과 독립 결과 객체를 만든다. 본편 `_PERF_PROF`·`_HITCH`·성능 회귀 하네스와 연결하거나 R 제품 기반을 복제한 코드가 아니다. 출력은 **미리보기 rAF 간격·CPU 측정**이며 GPU 실행 시간·production/NW.js FPS 보장·성능 PASS 판정을 제공하지 않는다.

| export / 옵션 | 기본 값 / 범위 | 적용 계약 |
|---|---|---|
| `PROFILER_DEFAULTS` | frozen `{targetFps:60,capacity:600,warmupFrames:12}` | 미지정 옵션 기본 값 |
| `targetFps` / `MAX_PROFILER_FPS` | 60 / 유한 실수1..240 | 목표 비교 예산, 실제 rAF 속도를 제한하지 않음 |
| `capacity` / `MAX_PROFILER_CAPACITY` | 600 / 안전 정수1..10000 | 최근 수용 프레임의 재사용 링 버퍼 상한 |
| `warmupFrames` / `MAX_PROFILER_WARMUP` | 12 / 안전 정수0..10000 | 시작 뒤 유효한 running rAF를 이 횟수만큼 제외; capacity와 독립 |
| `frameBudgetMs` | `1000/targetFps` | 60FPS 목표는16.666666666666668ms |
| 잘못된 옵션 | `TypeError` 또는 `RangeError` | null/배열/숫자 옵션 객체, NaN/Infinity/문자/비정수 정수필드 거부; 범위 밖 거부 |
| 인스턴스 설정 | 읽기 전용 `targetFps,capacity,warmupFrames,frameBudgetMs` | 외부 옵션 객체 변경이 측정 중 설정/버퍼에 전파되지 않음 |

| API | 인수 / 반환 | 동작 |
|---|---|---|
| `new FrameProfiler(options?)` | 위 옵션 / profiler | 버퍼 생성; 초기 active=false, 빈 통계0 |
| `start(label='',baselineStats?)` | 문자열 / `this` | 기존 측정 완전 초기화, active=true. baseline의 유효 frame/drop 숫자만 복사; 이전 프레임·누적 drop은 현재 측정에 이월하지 않음 |
| `sample(stats)` | runtime stats / accepted boolean | 새로운 유효 running 프레임이 워밍업 이후 링에 저장되면true, 그 외false |
| `stop()` | 없음 / snapshot | active=false, 마지막 결과 보존; 반복 호출 안전 |
| `snapshot()` | 없음 / 독립 JSON 객체 | 내부 버퍼·입력 참조 없는 결과; 반환 객체를 수정해도 다음 결과에 전파되지 않음 |

| `sample` 게이트 / 카운터 | 정확한 규칙 |
|---|---|
| 실행 상태 | profiler active와 `stats.state==='running'` 둘 다 필요; ready/paused/stopped/disposed 제외 |
| 프레임 ID | 안전 정수 `frame>=0`, 마지막 관측 frame보다 커야 함. 오래된/동일 frame의 재렌더·수동 step은 측정 장수 미증가 |
| 원시 간격 | 유한 `frameDeltaMs>0`; 첫 rAF·resume의0간격은 제외 |
| CPU 값 | 유한 비음수 updateMs/renderMs 및 유한 `updateMs+renderMs`; NaN/Infinity와 합 overflow는 제외 |
| 부하·누적 값 | particleCount/drawCalls/droppedSteps 모두 비음수 안전 정수 |
| 무효 새 프레임 | 유효 frame ID는 관측한 것으로 소비. 같은 frame을 이후 유효한 재렌더로 바꾸어 수용하지 않음 |
| 워밍업 | 위 전체 게이트를 통과한 새 running frame만 remaining을1감소시키고false 반환. 중복·pause·간격0·malformed는 감소 없음 |
| 누적 drop delta | 직전 관측 유효 counter와 현재 counter의 `max(0,current−previous)`; 워밍업/제외 프레임은 합산 없이 재기준. 기준 없는 첫 counter는 합산0 |
| counter reset | 감소한 새 counter는 현재값으로 재기준하고delta0; 다른 장면의 이전 counter 부채를 이월하지 않음 |
| 수동 step counter | 동일 frame에서 증가한 counter는 합산 없이 재기준. 이후 오래된 동일 frame snapshot은 기준을 뒤로 돌리지 않음 |
| 합계 상한 | droppedSteps session 합계는 `Number.MAX_SAFE_INTEGER`에 제한 |

통합 시 `profiler.start(label,runtime.stats)`로 시작 시점의 frame/drop을 지정하고 `onStats`에서 `sample(stats)`를 호출한다. baseline을 생략하면 첫 관측 전까지 완료된 프레임을 알 수 없으므로 첫 유효 새 관측을 기준으로 처리한다. 런타임을 새 인스턴스로 교체하면 새 `start`로 프레임 ID 기준을 초기화한다.

| snapshot 필드 | 값 / 공식 / 측정 범위 |
|---|---|
| `label,active,targetFps,frameBudgetMs,capacity,warmupFrames,warmupRemaining` | 현재 측정 이름·실행 여부·옵션·미소비 워밍업 수 |
| `sampleCount` | 현재 링에 남은 최근 수용 장수, 최대capacity |
| `totalSampleCount` | start 이후 수용 장수, 링에서 오래된 프레임이 빠져도 누적 |
| `metrics.frameDeltaMs/updateMs/renderMs/cpuMs` | 각 `{mean,min,max,p50,p95,p99}` ms. cpuMs=updateMs+renderMs. 빈 측정은 전부0 |
| 평균 / 분위수 | 최근 링 값을 산술 평균; 오름차순 nearest-rank `sorted[ceil(p×N)−1]`, p=0.50/0.95/0.99. 정렬은 복사 배열에만 수행 |
| `metrics.fps` | `1000/metrics.frameDeltaMs.mean`, 빈 측정0. 비현실적으로 작은 유한 양수 간격의 역수 overflow는 Number.MAX_VALUE에 제한 |
| `metrics.overBudgetFrames/overBudgetRatio` | 최근 링의 raw gap **>** frameBudgetMs 장수 / sampleCount; 정확히 같은 간격은 초과 아님, 빈 비율0 |
| `metrics.cpuOverBudgetFrames/cpuOverBudgetRatio` | 최근 링의 CPU 합 **>** frameBudgetMs 장수 / sampleCount; 빈 비율0 |
| `metrics.peakParticles/peakDrawCalls` | 최근 링에서 particleCount/drawCalls 최댓값; 오래된 peak가 빠지면 감소 가능, 빈 값0 |
| `metrics.droppedSteps` | 워밍업 이후 start 측정 전체의 수용 counter delta 합. 이 필드만 링 장수와 무관한 session 범위 |

```js
import { FrameProfiler } from './profiler.js';
const profiler = new FrameProfiler();
profiler.start('같은 장면·같은 설정', runtime.stats);
// 기존 onStats 콜백 안에서 호출; profiler가 rAF를 만들지 않음.
profiler.sample(runtime.stats);
const report = profiler.stop();
```

## 검증과 후속 범위

명령: `node --test test/fdgProfiler.test.mjs test/fdgRuntime.test.mjs` (macOS 실제 사용 경로 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`). **25개 PASS: profiler8 + runtime17**. 기존 runtime15개에 계측 검증2개를 추가했다.

| 검증 | 기대 결과 |
|---|---|
| atlas column start·행 전환·non-loop | 정확한 source rectangle·끝 프레임 유지 |
| 쿨다운·자원·사거리 | 초 단위 계산, 실패 소비 0, 최대 거리 제한 |
| 입자 stress·만료·재사용 | 최대 1024, 정확한 수명 종료, 기존 객체 재사용 |
| 원형 collision·벽 접선 | 타일 모서리 원 교차 판정·0/2/3 차단 |
| 30/60/120FPS 대각 이동 | 각각 1초에 160px 이동 |
| 빠른 이동 벽 관통 | 6000px/s 테스트에서도 tile wall 통과 없음 |
| 1초 히치 | 6틱(0.1초) 실행, 54틱/0.9초 discarded, backlog 없음 |
| raw rAF gap / reset | 1초 히치1000ms 유지, first/resume/blur/project 교체 첫 간격0; 수동 API는 frame 미증가 |
| profiler 게이트 / reset | baseline·중복·역행·일시정지·dispose·간격0 제외, 유효 워밍업만 감소, 세션·입력·snapshot·인스턴스 격리 |
| profiler 통계 / 메모리 | nearest-rank p50/p95/p99·산술 gap FPS·CPU 합·strict budget count·최근 peaks 정확, bounded record 재사용 |
| profiler drop / malformed | 워밍업·수동 step·pause drop 제외, cumulative baseline/reset delta 정확, 옵션/NaN/Infinity/overflow 안전 |
| 입력·pause/resume·dispose | Inspector/document key 입력 미수신, blur 입력 정리, 단일 rAF, 리스너 0 |
| Space/클릭 | repeat 미시전, CSS→world 좌표 변환·자원 소비 |
| 로딩·방향·실패·DPR | 방향 preload·src 캐시, 실패 표시+onError, DPR 최대2 |
| 200×200 viewport culling | 화면 주변 타일만 렌더, 화면 밖 오브젝트 생략 |
| 프로젝트 교체의 수명 | 제거된 ready/error 이미지 캐시 해제, 공통 이미지 재사용, 취소된 pending callback이 다음 장면에 오류를 보고하지 않음 |
| 에셋 root·선언 검사 | nested Studio에서도 서버 root 경로, absolute assetBase, 현재 프레임 밖의 부족한 atlas 셀도 load 시 검출 |
| ring sheet·잘못된 셀 | 여러 행 재생, 선언/선택 셀 경계 실패 시 대체 표시 |
| VFX sheet 중복·origin·aim | count48에서 sheet1/primitive47, burst sheet 원점 고정·projectile sheet 정확한 aim |

후속 구현 계획: 본편 시스템을 별도 어댑터로 연결한 뒤 production scene serialization, 오브젝트 collision/trigger, hitbox·적 피해 적용, SFX, renderer abstraction을 단계별로 검증한다. 첫 미리보기 자원·VFX 규격을 본편 공식으로 간주하지 않는다.

## MAP PRODUCTION REPORT — runtime 기반만

| §23 항목 | 이번 범위 |
|---|---|
| STAGE | FDG preview runtime, production stage 없음 |
| MASTER | 입력 프로젝트 geometry를 표시; 실루엣·region·route·side space 제작 없음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major hole 원화 제작 없음 |
| LARGE / MEDIUM / GROUND | 기존 오브젝트 이미지 렌더만 지원; composite·overlap·connections·shadow/contamination 제작 없음 |
| PLAYABLE | tile 1 collision·원형 캐릭터 반경·고정 시간 이동; 전투 가독성은 통합 브라우저 QA 대상 |
| LANDMARK | 입력 프로젝트 오브젝트 사용, 신규 landmark 없음 |
| CAMERA QA | world/CSS 변환·viewport culling·경계 고정 단위 검증; START/EARLY/ARENA/SIDE/LANDMARK/LATE/EXIT 아트 승인 없음 |
| TECH QA | 고정 시간·collision·loading·컬링 단위 PASS. route·pageerror·404·seam·실기 성능은 Studio 통합 QA에서 별도 확인 |
| FILES | 이 작업 소유 `engine/fdg/runtime.js`, `test/fdgRuntime.test.mjs`, `docs/engine/FDG_RUNTIME.md`; 타 작업 파일 변경 없음 |
| GIT | root 통합 시 코드+docs 함께 commit; 이 worker는 commit/push/deploy 없음 |
| VISUAL VERDICT | **FAIL — production environment 완성 판정 기준**. collision/스프라이트/VFX 툴 미리보기이며 완성된 production 맵 아트가 아님. 자동 단위 PASS를 시각 PASS로 대체하지 않는다 |
| NEXT PASS | Studio 통합 화면 확인 후 별도 stage 승인·제작 가이드의 MASTER→OUTER→GROUND→PLAYABLE→LANDMARK→DETAIL→CAMERA/TECH 순서 적용 |

docs 전체 검색을 `rg`와 규칙의 `grep -r` 모두로 수행했다. 기존 master의 `AmbientParticleSystem`은 Unity/본편 환경 입자 계약이며 FDG의 독립 `ParticleSystem`과 다른 범위다. 해당 상한 80개 등 기존 수치는 유지하고 이 문서에 FDG의 1024개 하드 상한과 관계를 기록한다.

## v0.6 선택 높이 지형 소비

| 항목 | 새 계약 |
|---|---|
| 선택 분기 | optional terrainScene, rigScene과 동시 합성 거부. 없는 old project의 기존 flat 렌더/clock/이동 계약 유지 |
| 접지 / 충돌 | 기존 tile1 원 충돌+terrain bounds/회전 blocker/slope/단차/5점 support, 실제 player.z로 snap. spawn 불일치는 terrain-spawn 오류 |
| 기하 / 렌더 | world XY+height Z의 계단/경사/box, CPU 직교투영·per-pixel Float32 depth. 최대 raster 장변900, drawImage1(default geometry130+actor24삼각형). GPU 렌더 아님 |
| 공용 시간 / 입력 | 기존 fixed1/60/max6/.25, 한걸음.1초/6owner틱, paused step1/60. primitive 이동만, Space/클릭 시전 차단. consumer 자체 RAF/listener0 |
| 좌표 / 카메라 | terrain camera yaw/pitch/zoom, owner camera는 초기 bounds 중심 지정 후 기존 map viewport clamp 적용·follow=false. worldToScreen는 Z0 투영, screenToWorld는 그 평면 역변환, 높은 면 picking 미구현 |
| 파일 / 수명 | terrain-scene.js 순수 기하, terrain-runtime.js 소비자. optional 분기 sprite sources 비움, 교체/종료 raster/image/depth 참조 해제. 같은 프로젝트 capture actor unknown JSON 보존 |
| 저장 | geometry/camera/현재 actor XYZ를 같은 FDG JSON으로 저장, load 실제 높이 재계산, simulation clock는0초 재시작 |
| 새 검증 | test/fdgTerrainScene.test.mjs15 + fdgTerrainConsumer.test.mjs10 =25 PASS. 기존 runtime/profiler/rig/r9 완료 검증은 재실행 없음 |

[스키마·모든 수치/수식·UI·실제 관측·다음 Gate](FDG_TERRAIN_SCENE.md). production 1-1의 logical height1이나 1-2 전이/waypoint ID를 새 primitive64px 계약으로 대체하지 않는다.

## v0.7 독립 WorldProject 지역 전환

| API / 경계 | 현재 계약 |
|---|---|
| captureSceneState | 현재 FDG geometry/metadata 및 actorXYZ/camera 독립 복제 |
| enterScene(project,{arrival,camera}) | finiteXYZ X/Y0..8000 Z0..1024·camera·프로젝트/원형 타일 적합 검사 후 기존 setProject 자원 정리/target 초기화/도착/camera 소비·정지. 전환 시 source buffer는 기존 scene dispose로 해제 |
| setSceneExits / draw | 최대16·radius8..160·XYZ projection overlay, stroke2/font11·open#76c3b0/closed#dfbb79·보이는 표식당2Canvas calls. 기존 합성 뒤/errors 전에 추가, 기본 empty로 기존 호출수0변경. scene교체/dispose 때 clear |
| WorldRuntime | owner 위의 edge/gate/state만, 자체 RAF/listener/timer0. busy 잠금·검사→pause/capture→enterScene→active/visits/latch commit. CPU terrainScene만 지원, null/rig/sprite는 사전 정상 실패 |
| 저장/도착 | entrance camera null은 scene기본값. 복원 actor/camera가 있으면 visits유지, 일반transition은 target arrival·visits+1. clock은 entry마다0초 |
| 검증 | 새 World17+MAP3=20고유 PASS, getter후 관련2재검증. 실제 browser 한걸음 gate거절/재진입/왕복/상태재열기. 기존suite/본편재검사0 |
| 생산 경계 | 실제 CH1등록/전환0, 원본 게임/세이브/PNG/nav/LOCK0. 전체 schema/상수/API/미완료는 [FDG_WORLD_TRANSITION](FDG_WORLD_TRANSITION.md) |

## v0.8 지도·웨이포인트 소비

| API/부하 | 현재 계약 |
|---|---|
| discover/activateWaypoint | 같은지역실제XYZ·R/Ztol16, observe에서발견을출구edge보다먼저commit·activationradius내에서만활성 |
| travelWaypoint | 대상discovered/active/travelGateKeys+실제enabled/open directed route. 중간scene/arrival와최종arrival를map circle/terrainbounds/blocker/slope/support로 sourcepause/capture/entry이전검사. arrival-blocked정상실패 |
| 공용진입/수명 | 기존portal/waypoint는_enterPrepared·pending1·event32·disposegeneration·targetclock0/visits+1 공유. ownRAF/listener/timer0, asynccancel/rollback/imagelease미인수 |
| getViewState | 선언된작은계약·regions.visits만, scenes.project/region.data/unknownmetadata복제0. whole world capture는편집/변경/저장때만 |
| 지도 | 같은owner.project.terrainScene identity캐시·실제actorXYZ/camera. width/height는renderer CSS좌표, DPR canvasbacking을Z0footprint에혼합하지않음. 지도별RAF0 |
| 검증 | 새WP/schema8+runtime7+map4+arrival2=21고유PASS·UI실제걸음/저장/JSON byte왕복. 기존20/25/rig 재실행0, 실제CH1/GPU성능0 |

[모든새정의/수치/반경/라우팅/정본](FDG_WORLD_MAP_WAYPOINT.md).


## CH1-1 source data 첫 검토 · v0.9 당시 기록

당시 원본 검토/이미지 helper만 구현했고 project/world 생성·실제CH1 렌더/이동은0이었다. 이 검사 완료기록을 다시실행하지 않는다. native revision-v2에서 기존 collider85 표기는 visual placements85로 정정됐다. 원본 논리높이0..1과 명시 엔진 환산은 별도이며, v0.13 흙바닥 완료 이력과 아래 v0.14 동결 이력 계약 및 별도 물리 실행 정본을 따른다.

## CH1-1 원본 이미지·흙 바닥 제작 미리보기 · v0.13 역사 동결

| 구현 / 상태 | 계약 |
|---|---|
| 실제 제작 흐름 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md): 기존3333 exact 승인 props9+soil1=10 PNG·native85 imageLayers 유지·polygon-only 이동·owner60Hz/camera·전용 저장/재열기 |
| 바닥 | 승인 soil ground_dark_soil.png 실제1024×1024 fullcrop; ENGINE_AUTHORING origin[0,0]/repeat1024×1024/opacity1·원 brightness.85/saturation.48. 원53 tile-corner×40 polygon clip 후 ground→props/actor. visible repeat 최대64, native UV UNKNOWN·나머지 mask/litter/commonSkin3 PENDING |
| 실제 결과 | 기존4020,7410에 바닥 설치→공개북쪽10px→4020,7400·camera4020,7400/followtrue·저장/다운로드JSON/reload 복원. 현재viewport 원본4/85·native 캐릭터·흙 표시. START4020,7420 유지 |
| 경계 | UNADOPTED; 실제collision/cliff/logicalHeight SOURCE_PENDING·height:null·actualObjectColliderCount:null·native anchor/crop/origin/START심볼UNKNOWN. World/스킬/VFX 차단. sourceScene 물리/production 인수는 대기 |
| 검증 / 시각 | 새ground contract 수정후4/4 + runtime 첫4/4 =8고유PASS; 첫contract helper import누락0/4 실패/수정 증거 보존. 완료13/5·15/23/16 등 이전suite 재실행0. 현재captured error0·preview VISUAL RETOUCH / production FAIL. 실전FPS/VRAM/Windows 미측정 |

## CH1-1 exact logical-height 미리보기 · v0.14 동결 이력

| 파일 / API / 상태 | 정확 runtime 계약 |
|---|---|
| 정본 / 입력 | [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md) v0.14. 새 source-v4 full envelope의 logicalHeight.exactEvaluator3/nativeParams11·boundaryColliders.hillCliffBand를 heightPreview.sourceExecutionSnapshot에 보존. baseRef load0 |
| 순수 소비 | source-preview.js attachSourcePreviewHeight/sampleSourcePreviewHeight/canMoveSourcePreview, source-preview-height.js 독립함수. exact 문자열3개는고정 semantic binding·eval/Function/AST추정0. owner render/cache/query는검증후 validated:true·매vertex4MiB검사0 |
| 원논리식 | tx=worldX/40/ty=worldY/40 연속값. ramp[125,135] t=(tx−125)/10, half1.8+1.2t, abs(ty−98)<=half→t; 범위밖/폭밖−1. ramp>=0→r²(3−2r), else d=sqrt(((tx−147)/18)²+((ty−98)/9)²)<.84→1/그밖0; 원pointband ramp<0&&.84<=d<=1.04 |
| 원파라미터/대조 | cx147/cy98/rx18/ry9/inner.84/outer1.04/rampX0125/rampX1135/rampY98/rampHalf01.8/rampHalf13. sample label은셀인덱스·px는center. 최초6sample/340summit/166band 일치, 최초분석반복0 |
| 엔진 환산 | 원 normalized0..1 / 별도 ENGINE_AUTHORING scale64·offset0·authoredBy. engineFootZ=offset+logical×scale, 지원scale>0/offset>=0/sum<=1024. sourcePhysicalZClaim:false·원 game physical Z UNKNOWN/PENDING |
| slope/발 gate | source에slope수치없음. engine-mapped-finite-difference±1world px·0..8000 clamp·sourceSlopeClaim:false. 명시 maxStep16/maxSlope.75, 지원1..64/0..1. radius1..19·spacing<=min(10,radius)/cap16384; ellipse48회/EPS1e−7. conservative-ellipse-band-contained-ramp는foot전체 ramp포함 예외·부분포함 보수차단, exact point bandBlocks와별도 |
| consumer/internal state | SourcePreviewRuntime(scene,map,{canvasFactory})는 기존owner60Hz clock/input/asset Map 재사용. move성공시에만 player.x/y·derived player.z=engineFootZ 갱신·실패위치유지. 새RAF/listener/timer/image/GPU0 |
| actor/props/camera | 저장 actor.position XY2·정적START4020,7420, 원nav40000/바닥19438/53boundary/props85/soil1 그대로. floor·props·actor projectedY=worldY−Z, props projecteddepth 사이native actor1회. followY=worldY−Z 후 기존viewport clamp |
| snapshot | physical height:null·positionXY2 유지. heightPreview 있을때 navScope polygon+exact-native-hill-band / sourcePending ['collision'] / logicalHeight/engineFootZ/ramp/bandBlocks/sourcePhysicalZClaim:false 및 height cache통계 추가. no-height는 기존polygon-only/height:null |
| capture | provenance.heightRuntimeObservation={worldPx:현재XY,logicalHeight,engineFootZ,ramp,bandBlocks,observedBy:fdg-source-preview-height-v1,sourcePhysicalZClaim:false}. actorXY/camera와함께저장, validator현재XY/원식/작성값 재평가. actor.z삽입0 |
| 상태/수명 | logicalHeight/cliff SOURCE_CONSUMED; actual object collision UNKNOWN/SOURCE_PENDING·actualObjectColliderCount:null·UNADOPTED·productionAdopted:false. native anchor/crop/origin/START심볼/groundUV UNKNOWN·다른3재질PENDING. World/스킬/VFX차단 유지 |
| cache URL | HTML entry studio.js?v=0.14.1; Studio 내부source-panel/adapter/project/runtime/source-preview/preview-runtime/새height/height-ground `?v=0.14.0`; 별도sourceScene0.10.0/height-program0.11.0/CSS0.10.0 유지 |

| source-preview-height-ground.js | ground cache / draw / 수명 |
|---|---|
| owner-local cache | SourcePreviewHeightGround. localworld x4960/y3480/width1720/depth880·현재mappedMax64에서1720×944. 원soil의engine-projected texture이며 native geometry 수정/새PNG/회색fixture0 |
| 최초tessellation | 원40px 간격·1024 repeat UV 경계 cuts,2024 affine-textured triangles. 최초이미지에1회 build·동일이미지 frame 재사용 |
| pixel 한도 | 각축<=2048/총<=4194304pixels. 현재1623680pixels·nominalRGBA6494720bytes. Canvas CPU 메모리계수이며 GPU/VRAM/FPS 인증 아님 |
| frame submission | visible cache1draw/offscreen0. flat soil repeat<=64+heightcache<=1→groundDrawCalls<=65. owner viewport clip·source53 corner의projected ground clip·alpha/filter/finally복원 유지 |
| 관측 | groundHeightCacheBuilds/groundHeightTriangles/ownedHeightCanvases/groundHeightCacheBytes. owner-localCanvas최대1. dispose는canvas width/height0→pixels/bytes0 및image/sample/factory참조해제 |

| v0.14 검증 / 인수 | 현재 기록 |
|---|---|
| 신규pure | fdgSourceHeightContract.test.mjs 최초4/4PASS·fail0 |
| 신규runtime | 신규4개 첫2PASS/2FAIL(합성fixtureAPI 오류), 수정후affected2/2PASS→최종4고유PASS. 첫실패 로그보존·기존PASS반복0 |
| 신규합계 / 동결 | pure4+runtime4=8고유PASS. v0.12의13/5server·v0.13의8·15/23/16·source9 PNG/Git봉인 재검수0 |
| 실제ramp/작성 | 별도QA4990/3940에서동쪽10px×23→5220/3940/logicalHeight=0.5747500000000001/Z36.784000000000006. 공개offset1작성→동일논리/Z37.784000000000006,0복원후20걸음→5420/3940/logical1/Z64·followcamera5420/3876. sourceSTART부터reachability검수0 |
| 실제cliff/save/reload | 별도6670/3940→서쪽3걸음=6640/3940/Z0,4번째6630시도 source-cliff-band차단·XY/Z유지. summit5420/3940/Z64와cliff6640/3940/Z0의저장/export/reload복원·actorXY2/observation/작성snapshot 보존 |
| 실제import 오류/수정 | 첫실패시도2: 새height project/이전runtime전환의toFixed guard1회 + 같은URL JS3600s cache의구guard 재호출1회. finiteheightReady수정+entry0.14.1 후공개import/heightedit/ramp43/cliff4/save/export2/reload2 PASS·capturederror0(repairedEntryErrors[]). 최초실패보존·별도pageerror/network404/GPU/FPS 인증없음 |
| 시각/증거 | root mid/summit/reopen/cliff inspect 완료. props캐릭터가림·흙높이가독성 약함→preview VISUAL VERDICT:RETOUCH/production:FAIL. engine-stage0-height-preview/actual-height-proof.json·mid/reopen/cliff PNG·ramp/cliff exports. GPU/native FPS/완성환경/실object collision 미인수 |


## v0.15 완료 이력(동결) · 원본 미리보기 가림·높이 가독성 보정

앞의 v0.14 높이·soil·원본/검사 증거는 당시 이력으로 동결한다. 현재 수치·API 전체 정본은 [원본 제작 미리보기](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.15 표를 따른다.

| 항목 | 현행 결과·범위 |
|---|---|
| 저장 / 분류 | optional appearancePreview version1/engine-authored-readability; provenance.appearanceEngineAuthoredInputSnapshot에 전체명시작성입력. native anchor/crop/origin·실collider UNKNOWN, sourcePhysicalZClaim:false 유지 |
| actor / depth | 현재sprite frame과기존projected depth 순서. actor1회, 교차한앞장식 body ellipse 내부.24/band.62/feather8px·밖원opacity. foregroundCutawayObjects/cutawayDrawCalls 추가. actor를맨위에덧그림0 |
| terrain / cache | 원soil·원height만소비. directional light[-.45,-.65,.75], ambient.45/contrast.65·flat1normalize·brightness.55..1.2. south profiles128/32기준max96·probe.5px/rasterheight>.25px·faceopacity1/brightness.55. 신규receipt profile80/wall184/total2208/shaded329; 기존cache1·1720×944/6494720bytes·ground<=65 유지 |
| 부하 / query | props<=255draw·ground<=65, source consumer<=320(actor/배경별도). entry/관련modulev0.15.0·pureheightv0.14.0·physical/CSSv0.10.0/ASTv0.11.0 유지; GPU/native성능 claim0 |
| actual QA | 별도cliff6640/3940/Z0 actor표시→공개북쪽10px차단/좌표유지/save/export/reload. ramp5420/3940→서쪽10px×20→5220/3940/Z36.784000000000006·camera5220/3903.216/followtrue/save/export/reload. STARTreachability검수0 |
| 신규 검사 / 오류 | pure4첫PASS+runtime4첫PASS=8신규고유PASS·fail0; oldheight8/soil8·완료suite/원PNG/count/봉인반복0. 새publicUI captured error/warn[]; 처음artifact필터가번호download제외하여wrongbase선택한실패는수집만교정·기록보존 |
| 시각 / 대기 | actor 완전가림해소, 큰장식이원height경계를가려terrain가독성약함. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. native per-prop source crop/origin/pivot/depth·실제 _OBJ_META+stage0 collider인스턴스입력대기 |
| 증거 / 범위 | 외부E/engine-stage0-readability-preview의newpictures/exports/firsttests/API/patch/projection/§23보고. game/nav/sourcegeometry/LOCK/START/EXIT/본편save/PNG변경0·새reviewUI/기능/팀확장0·push/deploy0 |


## v0.16 수동 충돌 소비 완료 이력(동결) · 2026-10-11

v0.15 가림·명암과 앞선 height/soil/원본 검수는 완료 이력으로 동결한다. 이번 변경은 별도 QA 위치에서 실제 v6 수동 배치 충돌을 소비하며 전체 맵 또는 START 보행 인수가 아니다.

| 항목 | 현재 코드·수치·상태 |
|---|---|
| 원본 입력 | MAP/ch1-1.hand-colliders.execution-v6.json; handProps36 / metadata type28 / collisionEnabled13 / collider entry13. visual85와 서로 다른 집합. 전체 native collider count UNKNOWN |
| native 의미 | game.html _rebuildColObjs/isW: colSz는 원반경, colW/colH는 타원 X/Y반경. v6 row 수치는 scale 적용 완료 → 재곱셈0·/2변환0. ellipse centerY=effectiveWorldY+colOy; offset에는 scale을 곱하지 않음 |
| adapter | normalizeMapSourceHandColliders(input)→{ok,errors,pending,sourceExecutionData}; 전체 raw nativeExecutionSnapshot·unknown metadata와 MAP_HAND_COLLIDER_BINDING version1을 별도 보존. exact onFloor tile-center=(rawTile+.5)×40만 변환; off-floor snap UNKNOWN→SOURCE_INPUT, raw colParts 미전개→ENGINE_IMPLEMENTATION pending. attachMapSourcePreviewCollision(existingProject,{sourceExecutionData,scope})는 candidateProject만 반환; project/world:null, adoption UNADOPTED |
| subset contract | collisionPreview version1/native-object-collision-subset; exact canonical array/count·full source envelope·scope 보존. scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32 필수. fullObjectColliderCount:null/sourcePhysicalZClaim:false. geometry claim은 제출된 2D subset에만 한정 |
| 선택 설치 | sourcePreview.status.collision=SOURCE_SUBSET_CONSUMED; provenance.supportedSourceObjectColliderCount=13 / collisionSourceRole=native-object-world-px-subset / collisionEngineAuthoredInputSnapshot={scope}; provenance.actualObjectColliderCount:null·productionAdopted:false·nativeAnchor/Crop/Origin UNKNOWN 유지 |
| 이동·저장 | source world XY에서 기존 polygon → subset 전체 발 원 충돌 → exact cliff/height 순서. 발 radius1..19, EPS1e-7 접촉 차단, ellipse 거리48회, sweep 간격<=min(10,radius)·최대16384. 막히면 XY/Z·카메라 유지; 허용 이동은 카메라 worldY−engineZ 추적. runtime capture/JSON/reopen에 PARTIAL과 unresolved 저장; blockedReason은 재열기 시 초기화 |
| runtime/UI | navScope polygon+exact-native-hill-band+source-object-subset; sourcePending=[collision-assembly]; collisionCoverage PARTIAL/supportedSourceObjectColliderCount13/fullObjectColliderCount:null. 화면에 수동 배치 충돌 13영역 · 전체 연결 대기 · 별도 QA 배치 / production 미인수 표시 |
| cache | entry/studio/runtime/project/map-adapter/source-panel/source-preview/source-preview-runtime 및 new collision/source-scene exports v0.16.0. appearance/height-ground v0.15.0, exact height v0.14.0, 기존 physical consumer/CSS v0.10.0·AST v0.11.0·World0.8.x 유지 |
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
| 신규 검증 | pure contract 최초4/4 PASS + runtime/adapter/owner 최초4/4 PASS = 신규 고유8/8 PASS·fail0. actual circle3297→3307,7380 east10허용/다음east10차단/north10허용→3307,7370; ellipse1586.5→1596.5,4020 허용/다음east10차단/north10허용→1596.5,4010. 각각 save/export/reload·camera followtrue/Z0 보존. native rotation0만 실제 입력, 회전 ellipse/expanded box는 synthetic UNIT만 |
| 시각·잔여 | preview VISUAL VERDICT RETOUCH / production FAIL. 큰 장식의 native pivot/opaque/depth identity 미확정, 캐릭터 대비 약함. 수동13 전체 추출·렌더85와 연결을 같다고 주장하지 않음. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending을 원 snapshot에 그대로 보존 |
| 상세 SSOT·증거 | [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.16 계약·13수치·새 QA표; E/engine-stage0-collision-preview/engine-review.md(§23), 신규 first-test2개·actual-collision-ui-proof.json·actual-collision-export-proof.json·실제 캡처/exports. 별도 pageerror/404/실전 FPS/GPU/Windows 인증 claim 없음 |

## v0.16 동결 AUTHORING 이력 · DESIGN START → EXIT 실제 제작 종주 (2026-10-11)

같은 실제 CH1-1 sourcePreview에서 정상 시작 초기화 후 공개 입력으로 제작 종주를 마쳤다. 앞선 v0.16 충돌 최초8검사·별도 위치 QA 및 v0.12~v0.15 증거는 동결 이력이며 재실행·재집계하지 않았다. 이번 변경은 코드0·상태 문서만이다.

| 항목 | 실제 관측 / 인수 범위 |
|---|---|
| 시작·원본 | 기존 DESIGN START4020,7420으로 정상 초기화1회. 원 soil·visual85·height64/0·native 수동 subset13·nav·START/EXIT·배치·source snapshot 보존. 도중 위치 강제설정/teleport0 |
| 실제 입력 | Play clock0.283초 → 공개 ArrowUp 단일 press 후0.367초/변위0 → 정지0.400초. 이후 paused AUTHORING의 공개10px 이동 버튼1057회: 허용1056회/차단1회/실이동10560px. 연속 키보드 Play 보행 PASS 주장0 |
| 경사로·충돌 | START→4020,3940→4990,3940/Z0→5220,3940/원0.5748·Z36.78→5420,3940/원1·Z64→4020,3940/Z0. 직진 북쪽 입력637은4020,3860에서 native-hand-8-m_c1tree 차단/변위0. 공개 서쪽 우회 후 원 EXIT근처4020,300 도달 |
| 저장·수명 | EXIT save/JSON export/reload 후4020,300·camera4020,300/followtrue·logical0/Z0·subset13/PARTIAL 보존. actual export를 공개 import해 같은 장면 교체 경계도 확인·clock0.000초. 기존 setProject의 previous consumer dispose 및 pagehide의 owner dispose 경로를 사용; private disposed counter·listener/VRAM 누수 계측은 미실행 |
| 잔여·시각 | fullObjectColliderCount:null/actualObjectColliderCount:null·productionAdopted:false. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending 그대로. native collider↔visual85 identity/crop/origin/pivot/depth·본편 전투/스킬/VFX/보스 관문/1-2 연결 미인수. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 신규 증거 | E= /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-route-preview. actual-route-step-trace.json(1057행)·actual-route-ui-proof.json·actual-route-export-proof.json·actual-route-lifecycle-proof.json·actual-route-exit-export.fdg.json·실제 캡처·engine-review.md(§23). 신규 자동 suite0·완료 proof 재실행0·push/deploy0 |

## v0.16.1 완료 이력(동결) · 실제 Play 입력과 v7 추가 충돌 (2026-10-11)

같은 승인 CH1-1 원본 제작 미리보기에 공개 연속 방향 입력과 MAP v7 변경분만 연결했다. 이전 v0.16 AUTHORING START→EXIT1057회·collision 최초8검사·v0.12~v0.15 증거는 동결하여 재실행·재집계0이다. 이번 연속 보행 증거는 paused10px 제작 이동과 별개다.

| id / 적용 위치 | 코드 계약 / 실제 관측 / 인수 범위 |
|---|---|
| FDGRuntime.setMoveInput / moveInputDirection | setMoveInput(direction)는 문자열 west/north/south/east 또는 null만 소비. null은 clearInput, 방향은 inputEnabled+running에서만 허용하고 keyboard Set을 비운다. getter moveInputDirection은 현재 방향 또는 null. 실제 actor 위치를 즉시 바꾸지 않고 기존 owner _update(dt)의60Hz tick에서 속도156px/s로 이동. 별도 입력 timer/RAF0. 기존 keyboard WASD/방향키와 대각 정규화 유지 |
| 입력 해제 / 수명 | 같은 방향 다시 클릭·이동 해제·유효 keyboard 이동keydown·canvas/window blur·document hidden·입력disable·pause/stop/dispose는 held UI 방향을 해제한다. UI 방향keydown 전환에서는 keyboard가 이어받는다. focusin이 이동 제어영역/캔버스 밖으로 나가면 clearInput. setProject는 _applyProject 뒤 pause하여 기존RAF 취소·입력/accumulator 해제 후 asset load; 교체 후 clock0/paused. step은 해제된 입력 상태의1/60초 |
| 공개 UI / DOM | source-play-controls role group 내 source-play-west/north/south/east는 aria-pressed native button, source-input-stop은 이동 해제. running 준비된 sourcePreview에서만 방향 활성. source-input-state leaf role=status에 현재 방향/해제/일시정지 표시. source-delta-import+source-delta-file은 공개 파일선택. 4방향click+해제click+document focusin+delta open+filechange=신규 UI handler8개; 부모 컨테이너 textContent 교체0 |
| v7 추가 자료 / API | map-source-adapter.js applyMapSourceHandColliderDelta(previewProject,{delta,scope}) → ok/errors/pending/candidateProject/sourcePreview/project:null/world:null/adoption:UNADOPTED/inspection. 실행 중·4MiB 초과파일·프로젝트 변경race·중복delta·비canonical baseline·invalid data/scope는 설치 거부. 새 후보만 store.replace하며 현재 actor/camera를 capture해서 유지. 상세 계약은 FDG_HAND_COLLIDER_DELTA_V7.md |
| v6 원본 / v7 / 작성권위 | collision sourceExecutionSnapshot.nativeExecutionSnapshot은 기존 raw v6, nativeDeltaSnapshot은 전체 raw v7, baseSourceExecutionSnapshot은 기존 normalized13을 각각 보존. ENGINE_AUTHORING scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32를 별도 보존. 원본 raw13 prefix 불변; corpse2 metadata collision:false로 제외·pit_poison1만 추가. 현재metaMissing0, v6 raw의 과거missing3 기록은 유지 |
| pit_poison / 충돌 수 | **P3-001 현행 계약(2026-10-20):** 원본 game.html:18166 배치·18407 metadata의 `colW80/colH58/colOy7` → native-hand-13-pit_poison ellipse, tile[162,139]/baseWorld[6500,5580], collider center[6500,5587]/radii[80,58]px/yaw0. 기존13(11circle+2ellipse)+새1ellipse=수동14(11circle+3ellipse), scale 재곱0·반경÷2 변환0. supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null·visual85 identity UNKNOWN은 유지. 이 절의 2026-10-11 Play·원형 충돌·PASS 기록은 당시 이력이며 새 타원 검증으로 재집계하지 않는다. 최신 재추출·Godot/화면 검수의 실제 상태는 [P3-001 보고서](orders/reports/P3-001_REPORT.md)를 따른다 |
| 실제 Play 시작 / 해제 | 이전 저장 EXIT4020,300을 정상 현재 입력으로 소비하고 v7 설치 후 Play 시작. 공개남쪽 held에서 clock0.500/4020,336.4→4.733/4020,996.8, 해제5.017/4020,1002.0→30.483에도 같은XY(Play clock 계속). pause30.517·paused ArrowDown 단일press 변위0/clock동일·step30.533·resume30.767에도 방향해제/같은XY. 자동화도구 held keyboard 기능이 없어 공개 연속방향 UI로 검수했으며 연속keyboard 실보행 PASS 주장은0 |
| 실제 나무 / 경사 / 카메라 | 정상 Play 남쪽 이동4020,3381에서 native-hand-8-m_c1tree 차단·clock61.783→88.600에도 같은XY. 서쪽3682 우회 후 실제3986.8경사선 접근. [5216,3986.8] 원0.5599/Z35.83 → [5405.8,3986.8] 원1/Z64, 카메라 실제export[5405.80000000018,3922.7999999999033]/followtrue. summit save/export/reimport 같은포즈·clock0/방향null·Z64; 다시 Play 서쪽[4989.8,3986.8]/Z0으로 내려왔다 |
| 실제 신규pit 차단 / 우회 | 실제 Play [4989.8,5601.4]에서 동쪽 이동→[6409.4,5601.4] native-hand-13-pit_poison 차단. clock168.367→174.367에도 같은XY. 접촉점 북쪽도 [6409.4,5596.2]에서 원 안쪽 진입 차단. 실제 서쪽[6219.6,5596.2]→북쪽[6219.6,5338.8]→동쪽[6492.6,5338.8]/[6763,5338.8]→남쪽[6763,5596.2]로 우회·Z0. actor강제위치/teleport/합성키/BFS이동0 |
| 최종 저장 / reload / 교체 | public pause/save/export 후 actor[6763,5596.2]·Z0·수동14/PARTIAL 유지. browser reload 및 동일actual export 공개import 뒤 같은pose·camera follow·clock0.000/paused/heldnull. v6 raw+v7 raw+scope/원 nav/START/EXIT/85/soil/height/appearance/기존캐릭터 clips 보존. 실제pose/camera의 unrounded 수치는 actual-play-final-export-proof.json 참조. World·본편 save·combat 연동을 인수한 것은 아님 |
| 신규 검사 / 관측 실패 | 신규 input4/4+delta4/4=고유8/8 PASS·fail0. delta 안전보충 affected1/1은 고유검사 합계에 추가하지 않는다. old suite/proof/PNG/source/Git seal 재실행0. Play UI 첫 긴Y대기 tool timeout은 실제입력으로 북쪽복귀, 이후 짧은clock대기+finally해제로 수집; final export는 완료 후 download wait10초기한초과/reset, AX저장/내보내기 확인하고 기존Downloads(11)만 회수·반복export0. 두 관측실패receipt 보존 |
| 버전 / 캐릭터 / 범위 | Studio/CSS entry v0.16.1·studio의 runtime/adapter imports v0.16.1; project/source-panel/source-preview/source-preview-runtime/source-collision은 v0.16.0, appearance/height-ground0.15.0·exactheight0.14.0·physical0.10/AST0.11·World0.8 유지. 해당 제작클립 기본목표 실제24장+24FPS, 이번 기존클립 frames/FPS/interpolation 일괄변경0·상한24 강제0·신규캐릭터/모델/리그 생성0 |
| 시각 / 미인수 | 실제actor 이동·가림·ramp 높이·camera와 신규pit 충돌/우회 확인. soil/뿌리와 actor 대비, 경사/충돌 윤곽 가독성 약함: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. full MAP_OBJS/_nearFloor/colParts/visual↔collider identity/native crop/origin/pivot/depth/UV/원physicalZ·본편 스킬/VFX/보스관문/1-2 미인수. captured console warn/error[]는 수집범위이며 별도pageerror/network404/VRAM/GPU/실전FPS/Windows 성능인증0 |
| 증거 / 파일 소유 | E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-play-input. actual-play-ui-proof.json·ramp/final export와proof·새pit/ramp/reopen 캡처·first-tests-runtime.json·worker-delta 최초검사/patch·관측실패receipt·engine-review.md(§23). 변경소유 code5+신규test2+docs16=23파일, 코드전disk/HEAD/absence/실parent/non-symlink backup·소유 정/역byte patch·normal checkpoint 포함. 본편/원본PNG/확정문서 변경0·push/deploy0 |

다음 인수는 새 제작 UI 증가보다 동일 장면의 시각 가독성 보정과 실제 full assembly 입력 소비다. 게임 전용 스킬·VFX·성능 연결은 그 뒤 실제 화면/저장 흐름에서 검수한다.


## v0.16.2 완료 이력(동결) · 높이 옆면의 깊이 순서 수정 (2026-10-11)

| 항목 / 적용 위치 | 정확 계약·검수 범위 |
|---|---|
| 확인 원인 | source-preview-height-ground.js는 floor와 frontWalls를 동일 cache에 먼저 그렸고 source-preview-runtime.js는 그 뒤85개props와 actor를 그렸다. 이미 존재한 profile.depthY(projected-bottom-midpoint)는 painter에 쓰이지 않아 옆면의 깊이 순서가 누락됐다 |
| 변경 / API | SourcePreviewHeightGround._build는 원본soil floor만 cache1에 그림. 동일profile/UV/삼각형의 정적 commands를 _walls에 저장, depth 오름차순. visibleWalls(owner,left,top)은 localBounds viewport cull; drawWall(ctx,entry,image,left,top,{alpha,brightness,saturation})는 원본soil commands만 실행하고 finally복원·draw수 반환 |
| painter | 원 polygon clip의 projected53점은 draw마다1회계산·재사용; flat ground→projected floor cache→props와wall 두 depth배열 merge. 동depth이면 prop→wall, projected actorDepth=worldY−engineFootZ 이하를 그린 뒤 actor1회, 나머지 앞props/wall. actor/cutaway를 항상 최전면으로 강제하지 않음 |
| 색 / 투영 | floor의 기존40px+1024UV경계·높이투영·1px법선광원 그대로. wallalpha=ownerAlpha×ground.opacity×frontWalls.opacity; wallbrightness=ground.brightness×frontWalls.brightness, saturation=ground.saturation. 원본 PNG/원props native opacity/color/worldRect/sourceRect·source height/nav/evaluator 수정0 |
| 카운터 / 자원 | groundWallDrawCalls=현재viewport의실제wall drawImage수, visibleGroundWalls=현재그린wall profile수. groundDrawCalls/drawCalls에 wall포함. groundHeightTriangles는 floor+wall 정적triangle 총수, groundHeightWallTriangles는 wall정적명령 수(매프레임 수가 아님). cache1·1720×944·1623680pixels·명목RGBA6494720bytes, 신규Canvas/image/RAF/listener/timer/GPU0, dispose는 cache0×0과commands참조해제 |
| 상한 / 비용 | profiles<=96, profile당UV분할<=4cell×2triangle=8, wallcommands<=768; floor<=2024, 정적총<=2792. viewport ground<=flat64+floorcache1+wall768=833draw, props<=255, source consumer<=1088draw(actor/배경별도). v0.15의320draw는동결이력이다. 새wall은viewport에매프레임원PNG draw하며 GPU/VRAM/FPS성능인증0 |
| 현재 설정 / 권위 | R2 actorCutaway inner.14/outer.46/feather14px, terrainLighting direction[-.45,-.65,.75]/ambient.45/contrast.82/min.50/max1.2, frontWalls128/32·opacity1/brightness.55/probe.5. mapping64/0·source85·수동14/PARTIAL 그대로, full collision/physical Z/native anchor/crop/origin/UV 권위추가0 |
| 공개 QA / 이동 | 새 별도QA mid[5216,3986.8] normalized.559872→Z35.831808, 동쪽10px[5226,3986.8]→normalized.59695075/Z38.204848(공개UI38.20). summit[5405.8,3986.8] normalized1/Z64, 동쪽10px[5415.8,3986.8] normalized1/Z64·ramp−1·bandfalse. 새START종주0, Play/키보드홀드재검증0 |
| 새 저장 / 재열기 | 정상 새QAendpoint[5415.8,3986.8]·camera[5415.8,3922.8]/followtrue·clock0/input해제 공개저장/reload/JSONexport. 현재QA입력 대비 /actor/position,/camera,/provenance/heightRuntimeObservation만변경, map/native85/ground/nav/height14PARTIAL/appearance는동일. 이전R2 저장proof재실행0 |
| 신규 검증 | test/fdg-height-wall-depth.test.mjs 신규4/4 PASS·fail0/skip0. depth merge/actor1회·equal-depth prop→wall·원soil UV/scene불변·cache1/cull/dispose·throw/finally복원. 변경JS4 syntax PASS. 이전전체suite/1057/Play8/실패R1/성공R2 seals재검수0 |
| 버전 | index badge0.16.2, 최종cache key entry studio.js/runtime/source-preview-runtime0.16.2-final→height-ground0.16.2. CSS/studio adapter0.16.1·source schema/collision0.16.0·appearance0.15.0·exactheight0.14.0 유지. schema/validator/main game/server변경0 |
| 실제 시각 / 다음 접점 | 새 mid·summit·재열기·최종code PNG4 직접검수: actor존재와Z변화는확인, 이동면·경사·정상옆면은큰root props에계속묻힘. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. 현행 actorCutaway는actorFrame주변만대상, terrain projected coverage를대상으로하는전경가림소비필드가없음. 다음필요접점은 terrain coverage의가림규칙이며 임의새schema/수치/PNG생성으로완료를주장하지않음 |
| 증거 | engine-stage0-height-readability-final/ actual-height-ramp-mid.png, actual-height-ramp-summit.png, actual-height-qa-reopened.png, actual-height-qa-final.png, public-ui-trace.json, actual-height-qa-reopened-export.fdg.json, new-endpoint-consumption.json, wall-depth-test-first.log, visibility-depth-receipt.json, engine-review.md. captured warn/error[]는 수집범위, pageerror/404/seam/실전combat/Windows성능은미검수 |

## v0.17 현행 · 명시 높이 지형 노출 (2026-10-11)

이번 인수 범위는 별도 QA 위치의 높이 지형 노출 소비다. 전체 맵·본편 엔진·충돌 assembly·native physical Z 인수로 확대하지 않는다. 상세 schema/API/합성 수명은 [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 마지막 v0.17 표를 따른다. 앞선 버전의 검수·미구현 표현은 해당 버전 완료 이력이다.

| ID / 항목 | 현행 코드·수치·상태 |
|---|---|
| FDG-TEX-CONTRACT | appearancePreview.terrainCutaway는 optional 명시 ENGINE_AUTHORING. kind=projected-height-region, authority=ENGINE_AUTHORING, depthPolicy=after-region-max-projected-depth, sourcePhysicalZClaim=false, authoredBy 비공백 필수. foregroundOpacity 0..1 / featherPx >0..64 world/CSS px(zoom1). 작성 initializer SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS=opacity0.1/feather24; 자동 채움0 |
| FDG-TEX-STRICT | 필수 기존 appearance 검증·4MiB/깊이64/방문1,000,000 JSON 한계·unknown 안전 JSON 보존을 유지. attachSourcePreviewAppearance의 전체 작성 입력 snapshot이 별도 provenance에 깊은 일치해야 함. 누락·권위/단위/범위/claim 오류·snapshot 불일치 거부. 필드 absent 또는 opacity1이면 기존 렌더와 추가 exposure Canvas0 |
| FDG-TEX-REGION | 기존40px+1024UV cuts의 실제 engine height-projected raised floor triangle + south wall quad 합집합, 원53corner polygon의 같은 height 투영과 교집합. 대상 prop은 region의 최대 projectedY보다 strict 앞(entry.depth > max)일 때만. 같은 깊이·뒤쪽 제외. 이번 입력 coverage1032 / max projected depth4240 world px |
| FDG-TEX-BLEND | 원PNG의 해당 projected 영역 내부만 native opacity×(1−(1−foregroundOpacity)×maskAlpha). maskAlpha=blur(featherPx)×hard coverage; 외부 mask alpha0. hard alpha>0 row-run을 한 번 readback·같은 span 연속 row 세로병합 → disjoint union clip; inside nonzero / outside complement evenodd. floor/wall 중첩 XOR0 |
| FDG-TEX-OUTSIDE | 원PNG direct outside / source color를1회 적용한 scratch inside의2 draw. 원worldRect/sourceRect·depth/native opacity/brightness/saturation·actor1회·기존 actor ellipse3영역·wall painter 순서 보존. 브라우저 cached Path2D 및 정적 outside path, Path2D 없는 환경 rect fallback. 바깥 bbox 전체를 scratch로 대체하는 첫 구현은 폐기 |
| FDG-TEX-CACHE | owner-local floor1+mask1+scratch1=Canvas3, 새 raf/listener/timer/image/GPU 소유0. 동일 soil decode당 build1/maskbuild1/hard readback1. dispose에서3 Canvas0×0, refs/coverage/clip rect/Path2D/outside map 해제. 이번1720×944: floor6,494,720 + exposure12,989,440 =19,484,160 nominal RGBA bytes. GPU/실VRAM 인증 아님 |
| FDG-TEX-BOUND | 기존 cache≤2048 each dimension/4,194,304 pixels·floor static triangles≤2024·wall profiles≤96/commands≤768·static total≤2792 유지. source draw 최대≤1513/frame=ground≤64+floor1+wall768+85props×3actor passes×2main+85×2scratch. actor/background·build2024+mask2 draw 제외. viewport cull 먼저·mask readback/build 시만 |
| FDG-TEX-COUNTERS | snapshot: terrainCutawayMaskBuilds/terrainCutawayMaskReadbacks/terrainCutawayClipRects/terrainCutawayCoveragePolygons/terrainCutawayProjectedDepth/ownedTerrainCutawayCanvases/terrainCutawayCacheBytes. draw: terrainCutawayObjects/terrainCutawayDrawCalls/terrainCutawayScratchDrawCalls. 기존 ownedHeightCanvases는floor1·groundHeightCacheBytes는floor만; drawCalls는scratch2도 포함 |
| FDG-TEX-TEST | test/fdg-terrain-exposure.test.mjs 기존 새5개를 수정 영향으로 확인 PASS5; 신규 procedural RGBA 보존1개 PASS1. first procedural teardown은 native test backend의0크기 정규화로 assertion 실패→consumer null refs 해제 확인으로 fixture만 수정·그1개만 재실행. renderer 수정0·과거 suite/oldproof0. 수정 후JS7 syntax PASS |
| FDG-TEX-ACTUAL | 새 own project fdg-stage0-terrain-exposure-v17. paused AUTHORING/public동쪽10px×42=420px; [4980,3986.8]Z0→[5000,3986.8]Z0→[5210,3986.8]normalized0.53746875/Z34.398→[5400,3986.8]normalized1/Z64/ramp1/bandfalse. clock0/input해제·camera5400,3922.8 followtrue. DESIGN START/EXIT 종주·Play/본편 검수 아님 |
| FDG-TEX-PIXELS | 새770×371 CUA canvas enabled/disabled 동일 pose 비교. 첫 bbox 합성은 outside≥16px 30,358 중5,732픽셀 delta>2/max15로 FAIL→mask union clipping 수정. 수정 후 같은 밖30,358픽셀 changed0/maxRGBA0; inside241,329 중226,738 changed/max168. 경계8/16px 따로 분리·native opaque alpha/physical Z 증명 아님 |
| FDG-TEX-SAVE | 새 own project만 public 저장/reload/JSONexport. 최종 공개 export 전체는 before-save export와 깊은 일치, appearance↔별도 snapshot 일치. 최초 새 own QA input과 map/height/nav/visual85/metadata/hand14PARTIAL 동일(행동 position/camera/heightRuntimeObservation만 갱신). 원R2파일 쓰기0 |
| FDG-TEX-ENTRY | index badge v0.17 / studio.js 및 이번변경8개파일의 관련 dependency query0.17.1. CSS0.16.1·다른 collision/adapter/height/physical/AST/World entry들은 기존값 유지. 독립 SourcePreviewRuntime 소비만 추가, game.html/본편save/combat/START/nav/geometry/sourcePNG 권위 변경0 |
| FDG-TEX-ACCEPTANCE | 실제 revised entry/mid/summit/reopened 화면에서 위쪽soil·경사·어두운south옆면·발 높이와 외부 전경 보존 확인. **이번 높이 지형 노출 VISUAL PASS / 전체 production FAIL·UNADOPTED.** full assembly/native anchor/crop/origin/UV/물리Z·다른3재질·본편/관문/1-2·Windows/FPS/GPU는 미인수 |
| FDG-TEX-EVIDENCE | 외부 E=engine-stage0-terrain-exposure-final. actual-terrain-*.revised.png / revised.qa.png, public-ui-trace.json, actual-terrain-reopened.revised-export.fdg.json, new-save-reopen-revised-contract-proof.json, terrain-exposure revised test receipts, pixel-preservation-revised-qa.json, engine-review.md. 첫 실패 증거 보존. own8code+1test+15docs=24 checkpoint, 공유Git rollback0/oldseal 재검사0 |


## v0.18 일반 맵 제작 입력

[일반 맵 실행 정본](FDG_PRODUCTION_RUNTIME.md)의 `walkMap(direction,{distance:10})`와 실패 이미지 재시도 계약을 따른다. paused 일반 맵만 최대10px 실제 발원 충돌 이동, owner clock/자원 유지; 별도 소비자4종 거부. 기존 setMoveInput/60Hz clock 유지. [제작 작업창](FDG_PRODUCTION_WORKSPACE_20261011.md)에서 장면 정지/한틱/조합 저장과 연결한다.


## 2026-10-11 r2 완료 · UV texture 리그 현행 소비 (동결 이력)

[본체 모션 인수 정본](FDG_HELL_ABERRANT_MOTION_20261011.md)과 [texture 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md)을 따른다. 아래 수치·공개 검수·고유14개 검사·저장/교체 증거는 r2 당시의 동결 이력이다. r3 결과와 합산하거나 r3 shipping 데이터의 현행 수치로 사용하지 않는다.

| 항목 | r2 당시 결과 / 정확 범위 |
|---|---|
| 실제 산출 | 승인 지옥기형 PNG832×1248의 visible-source2.5D texture mesh3904vertices/4850triangles/32bones, 명시weights·UV/drawOrder·준비→휩쓸기→회복. ENGINE_AUTHORING/gameplayApplied:false/sourceImageModified:false |
| clip / clock | 실제 관절변형3seconds/24FPS의loop·once2clips, 첫24sample모두다름. raster24장atlas완성아님. labstep1/24s/sceneowner1/60s·.25s전환 유지, native전투110/200/.15..85/30/50gameframes값과변환0 |
| 기존 흐름 | rig.html 공개보스preset→같은RigPreview; 일반FDGscene에서는기존ownerassetscache/getImage로texture소비. 새scene부모트리/본편강제이관0 |
| 공개 검수 | 반복재생117capturedframes/약7.21seconds, 정지·한프레임·실행중clip전환·nonloop3s끝pose, rig와일반scene0.9s저장/reload/export전체JSONdeepEqual, 공개교체node1→0→1 |
| 새 기술 검사 | texture8개+motion6개=고유14개PASS. 선택점보강1개와작은회전의tailshape검사수정1개는영향검사만재실행; 반복합산0·이전완료suite재실행0 |
| cache / UI | rig-studio entrytexture-motion-r2-public; mainstudio와이번rig/runtime/project/scene-paneldependencytexture-motion-r2-final. runningstats100ms/paused즉시, source2.5D저장reopenoverlayfalse기본표시. 3600초JS/JSON캐시의oldcode소비방지 |
| 시각·잔여 | VISUAL VERDICT: RETOUCH. 원본뒤쪽몸통·다리/오른손뒤꼬리texturegap을정확히표시하면서보이는bodymotion제작완료. pixel-perfect경계/full3D/본편전투·실전24FPS/GPU성능미인수 |
| 보호 범위 | sourcePNG·main/game·R/fdg-engine·Q/E/save/nav/LOCK/서버변경0, projectileclip끝삭제0, source대기를작업전체중단조건으로확대0 |

## 2026-10-11 r3 꼬리 연결부 보정 (동결 이력)

[꼬리 연결부 r3 정본](FDG_TAIL_CONTINUITY_20261011.md)이 r3 mesh·가중치와 당시 연결부 검수의 정본이다. 위 r2 모션 보고와 기존14개 검사·저장 전체 증거는 동결 이력이며 r3에서 재실행하지 않았다. 아래 r3 수치·4개 검사·공개 재생·저장 증거도 완료 이력으로 동결하며 r4 결과와 합산하지 않는다.

| 항목 | r3 당시 결과 / 정확 범위 |
|---|---|
| shipping 데이터 | `hell-aberrant-tail-swipe-continuity-r3`, 3864정점 / 4850삼각형 / 32본 / compact UTF-8 701016bytes, 꼬리888정점. ENGINE_AUTHORING / gameplayApplied:false / sourceImageModified:false |
| 국소 저작 보정 | 실제 source pixel의 부위 분류를 교정하고 static leg cut-cap left[330,940,470,1064] / right[560,984,680,1064] 안의 앵커27개로 꼬리134정점에32px smoothstep을 적용했다. 정확 경계의 pinned27개, generic axe/torso/arm 앵커0; 자유 curl의 원래 꼬리 가중치 유지. 기존 tail9 pivot[342,980]의9개 key에 parent inverse local T/R을 bake했다. 수식·키 값·동작 지표는 정본을 따르며 일반 보간 runtime은 변경하지 않았다 |
| 보호 계약 / cache | 승인 PNG832×1248·32본·3초/24FPS clip2종·발 고정·native 전투 수치 유지. 바뀐 query는 `rig.html→rig-studio.js?v=tail-continuity-r3-final`과 `fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 두 개다. runtime dependency 및 main entry의 `texture-motion-r2-final` 유지 |
| 이번 검수 | 새 연결부 targeted4개를 최초 실행하여4/4 PASS. 공개0.650/0.900/1.400초 pose와 실제 재생108JPEG / 7.053698초, GIF7140ms / 960×540 확인. 수정 rig를0.900초에 자기 저장·재열기 정확1회: export 전체 deepEqual true, mesh/skeleton/materials/clips/provenance도 shipping과 깊은 일치. 기존14개 검사·저장 전체 재수행0 |
| 시각 / 증거 | 이번 보이는 꼬리 island 연결성 VISUAL PASS / 제품 전체 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear body와 leg/right-hand 뒤 꼬리의 독립 source surface 미확보다. full3D·본편 전투·Windows 성능 인수로 승격하지 않는다. 초기 spike 실패와 candidate2/3 RETOUCH를 포함한 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3/`, 정확 동작 지표는 `r3-posed-metrics.json` |

## 2026-10-11 같은 장면의 꼬리·임팩트 시퀀스 r4 (동결 이력)

[시퀀스 r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다. r3 mesh·weights는 재사용하고 r3의4개 검사·자료 및 r2의14개 검사·전체 저장 증거는 동결 이력으로 보존했다. 이번 단위는 같은 FDG scene owner clock의 명시 저작 연출이며 native 전투 적용이 아니다.

| 항목 | r4 당시 계약 / 증거 |
|---|---|
| authored 입력 | `fdg-hell-aberrant-tail-sequence-r4`, compact807933bytes. r3 body inline701016bytes·3864정점/4850삼각형/32본은 그대로이며 sequence ID=`hell-aberrant-tail-swipe-impact-r4`, nodeId=`hell-body-node` |
| 본체 / atlas | ENGINE_AUTHORING의 `tail-swipe-once` 3초/24FPS + 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`, 640px셀/6×4/24frames/16FPS/1.5초 non-loop. 자연치수3840×2560, scale0.25/anchor[0.5,0.5]/offset[-72,-84] world px. body·map·camera·source PNG는 그대로이며 초기 offsetY0의 하단 잘림 증거를 보존 |
| 단일 owner clock | 1/60초·max delta0.25초·max substeps6·pool1024 유지. startTime0.900초의 crossing에서 activation당1회 sheet 발동, trigger 틱 age0/frame0. pause는 전체 clock 고정, Stop은 bound node만 hold. replay/clip/seek가 이미 발동한 FX를 자르지 않으며 `age+1e-9>=frames/fps` 자기 만료. native single-hit/attack ticket·시간 환산·전투 적용0 |
| 실제 공개 관측 | 53틱0.883초/event0/FX0 →54틱0.900초/event1/FX1/age0/셀 표시1/24. 실제 재생73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms; 캡처 중 runtime/pose/clock/frame 강제 변경·합성0. 본체3.000초 끝 pose 유지·FX0·자동 loop0. 이전 FX를 보존하는 replay/clip 변경·Stop 뒤87틱 셀24/90틱 FX0은 정본의 별도 공개 기록 |
| 새 자기 저장 / 검사 | 1.3000000000000003초 본체·FX age0.400/event1에서 새 자기 저장·재열기 정확1회. before/after export 전체 JSON deepEqual true, resources/sequence/map/camera는 최종 fixture와 동일. 재열기 pose1.300/ready·activation0/event0/FX0/clock0, transient JSON field0. backend 첫8/8 PASS·첫 JS구문8/8 PASS, 선택값 보정 후 필요한 panel/studio만2/2 구문 확인; 기존4/14/전체 저장 재수행·합산0. 공개 두 수집 범위 warn/error0 |
| 최종 cache / UI | 공개 `index.html?v=tail-sequence-r4-complete`, `studio.js`·`rig-scene-panel.js` query=`tail-sequence-r4-complete`; runtime/schema chain=`tail-sequence-r4-final`; fixture fetch=`tail-sequence-r4-fixture-final`. bind→Replay 선택값은 실제 tail-swipe-once와 seek max3초를 표시, authored rewrite0. 새 저장 왕복 반복0 |
| 시각 / 정본 | 이번 승인 body+실제 atlas의 제한된 같은 장면 sequence VISUAL PASS / 전체 모델 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear/leg·right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP. full3D·본편 전투·Windows/GPU 성능으로 승격하지 않는다. 정확 API·crossing·clear·저장·시각 증거는 r4 정본과 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/` |

## 2026-10-11 꼬리치기 가독성 r5 (동결 이력)

r5의 배송·수식·검사·실제 공개 GIF·저장·시각 결과는 아래 당시 이력으로 보존한다. r6 결과와 합산하거나 이전 자료를 재실행·덮어쓰지 않는다.

[r5 가독성 정본](FDG_TAIL_READABILITY_20261011.md)을 따른다. 승인 r4 scene을 읽는 새 `tools/fdg-studio/build-hell-aberrant-readability.mjs`가 기존 키 보간으로 준비·휩쓸기·회복의 강약을 저작한다. r2/r3/r4 보고·proof·검사·저장 수치는 동결 이력으로 보존하며 재실행·새 인수 합산·이전 fixture 덮어쓰기0이다.

| 항목 | r5 당시 데이터 / 경계 |
|---|---|
| 새 shipping | `fixtures/hell-aberrant-tail-readability.fdg.json`=`hell-aberrant-tail-readability-scene-r5`, compact UTF-8 820009bytes. 별도 `.rig.json`=`hell-aberrant-tail-swipe-readability-r5`, compact713092bytes. 기존 r3 `hell-aberrant-motion.rig.json`·r4 `hell-aberrant-tail-sequence.fdg.json` 보존 |
| 메시·권위 | 3864정점/4850삼각형/32본 및 mesh/weights/skeleton/material/source PNG 보존. ENGINE_AUTHORING·nativeCombatApplied:false, 새 runtime/schema·본편 전투·맵 변경0 |
| clip key 저작 | `tail-swipe-loop`/`tail-swipe-once` 2종은 각각3초/24FPS/20tracks. spine/head/leftArm/leftForearm·tail9..15의11tracks는17keys `[0,0.2,0.45,0.6,0.65,0.72,0.78,0.84,0.9,0.98,1.08,1.25,1.4,1.6,1.8,2.4,3]`를 공유. tail0..8의9tracks는 기존9keys 유지, pelvis/다리/발 bind 유지 |
| 동작 구조 | spine→head→leftArm→leftForearm→tail9→tail10..15의 순차 저작. tail9의 key별 world pivot XY 위치 bake는 유지하고 world Z 준비·방출 회전을 보정. distal10..15 지연은 `(i-10)*0.014`초이며 기존 translation lerp/quaternion slerp 소비, 연속 runtime constraint 추가0 |
| FX 저작 / 기존 시간 계약 | sequence ID=`hell-aberrant-tail-readability-impact-r5`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640px셀/6×4/24frames/16FPS/life1.5초·최종 scale0.16·anchor[0.5,0.5]·offset[-145,-84], bound node[4150,7360] 기준 FX world center[4005,7276]·640×0.16=102.4px 사각 표시. 첫 r5 후보의 scale0.25·offset[-72,-84]는1.300초에 왼팔/도끼를 가려 기존 public inspector로 보정했다. native cooldown110/projectile life200/recoverLive30/recovery metadata50의 원래 game-frame 단위·attackWindow[0.15,0.85] phase 단위와 비환산 유지 |
| 현행 URL / cache | `index.html?v=tail-readability-r5-complete`·`studio.js` entry query=`tail-readability-r5-complete`, 새 scene fetch query=`tail-readability-r5-fixture-final`. runtime/schema=`tail-sequence-r4-final`, panel=`tail-sequence-r4-complete` 유지. 독립 `rig.html`의 기본 r3 preset은 유지하며 r5 `.rig.json`은 별도 새 저작 자료 |
| FX-disabled 실제 body | 후보1의 공개0.650/0.900/1.400초 pose와 실제 Play82JPEG/FX0를 확인한 뒤 별도 r5 fixture로 promote. GIF960×540/4210ms/12186853bytes, capture wall5141ms·합성frame0·효과합성0. sequence를 생략한 own 검수 scene이며 shipping sequence 삭제 아님 |
| 최종 FX 실제 재생 | public Play65JPEG/capture wall4752ms→GIF960×540/3860ms/10890311bytes(`actual-tail-readability-with-impact.gif`). 최종 scale0.16/offset[-145,-84]로 본체3.000초 hold/event1/FX0 자기 만료 확인. 속도·clock/frame 강제 변경·효과 합성0 |
| 신규 데이터 검사 | 새 `test/fdgTailReadability.test.mjs` 최초4/4 PASS, fail0/skip0/cancel0. 범위는 standalone↔inline 및 승인 변경만·실제 tip release/굽힘/순차 타이밍·발/27cap/key pivot/중간 drift·회복/1.8초와3초 복귀. 26개 새 r5 sample, 기존4/8/14 suite·PNG·native·기존 저장 재실행/합산0. `first-tests-tail-readability.log`·`targeted-tail-readability-receipt.json`·`targeted-tail-readability-metrics.json` 별도 증거 |
| 신규 구문 검사 | `tools/fdg-studio/studio.js`·`tools/fdg-studio/build-hell-aberrant-readability.mjs` 두 파일 최초2/2 PASS, `syntax-checks.json` 별도 증거. semantic4개와 합산하지 않고 다른 runtime/schema·기존 구문/검사 재실행0 |
| 새 자기 저장 / 재열기 | 새로운 save→export→reopen→export 전체 왕복 정확1회. before/after public pretty UTF-8 2973269bytes·전체 JSON deepEqual true. 새 rig/clips/FX scale0.16·offset[-145,-84]/map/camera 보존, transient fields0. 재열기 저장 node3.000초 pose 표시·owner clock0·ready/activation0/event0/FX0. 이전 저장 suite 재수행0 |
| 시각·증거 경계 | 이번 보이는 동작 가독성+FX 가림 보정 범위의 VISUAL VERDICT: PASS, 전체 모델은 hidden rear body 및 leg/right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP 정확히1건으로 RETOUCH 유지. 새 final tab13 warn/error0. 숨은 면 생성·full3D·native 전투·Windows/GPU 성능 승인0. 새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/`, r4와 분리한 새 구현·자체 검수의 완료 기록이며 제품/native production 인수는 별도 |

| authored key 배열 / 단위 | 같은17개 keyTimes에 대응하는 정확 값 |
|---|---|
| keyTimes / demo 초 | `[0,0.2,0.45,0.6,0.65,0.72,0.78,0.84,0.9,0.98,1.08,1.25,1.4,1.6,1.8,2.4,3]` |
| spine local Z / rad | `[0,0.025,0.08,0.1,0.1,0.075,0.015,-0.12,-0.1,-0.07,-0.04,0.025,0.03,0.01,0,0,0]` |
| head local Z / rad | `[0,-0.015,-0.045,-0.06,-0.055,-0.025,0.015,0.05,0.04,0.025,0.015,-0.01,-0.005,0,0,0,0]` |
| leftArm local Z / rad | `[0,0.005,0.045,0.09,0.11,0.11,0.075,-0.025,-0.08,-0.065,-0.025,0.025,0.015,0,0,0,0]` |
| leftForearm local Z / rad | `[0,0,0.035,0.09,0.115,0.12,0.12,0.025,-0.06,-0.07,-0.02,0.035,0.015,0,0,0,0]` |
| body4 track translation / Z축 회전(XY평면) | 각 key translation `[0,0,0]`, rotation `[0,0,localZ]` |
| tail9 authored world Z / rad | `[0,0.035,0.2,0.32,0.36,0.36,0.3,-0.1,-0.5,-0.58,-0.38,0.18,0.1,-0.035,0,0,0]` |
| tail9 key bake | `localT=R(-parentWorldZ)*(bindPivotWorldXY-parentWorldXY)-bindLocalT`; `localZ=authoredTail9WorldZ-parentWorldZ`, localT는 model-unit·Z=0, worldZ/localZ는 rad. parent는 기존 tail8이며 bind pivot source[342,980] 유지. key 위치에서 정확한 bake이며 key 사이 연속 위치 고정 constraint 아님 |
| distal i=10..15 | `d=(i-10)*0.014`초, `p=0.075+(i-10)*0.006`rad, `r=-0.10-(i-10)*0.009`rad |
| distal wave `[time,Z]` | `[[0,0],[0.2,0],[0.45+d,0.45*p],[0.65+d,p],[0.78+d,p],[0.9+d,r],[1.08+d,0.5*r],[1.25+d,0.7*p],[1.48+d,-0.2*p],[1.8,0],[2.4,0],[3,0]]`를 구간 선형 표본화하여 같은17개 key에 기록. translation `[0,0,0]`, rotation `[0,0,Z]` |

loop/once 두 clip의 track은 같은 authored 값의 깊은 복사이고 loop 플래그만 기존 계약을 따른다. source의 준비0..0.65초/휩쓸기0.65..1.08초/회복1.08..1.8초/대기1.8..3초 provenance와 native metadata는 유지한다.


새 증거 정본은 위 r5 문서와 이 증거 폴더의 `save-reopen-receipt.json`·`reopened-runtime.json`·`reopened-actual.png`·`public-browser-warn-error-log.json`·`body-gif-receipt.json`·`fx-playback-frames/capture.json`이다. `actual-tail-readability-body-only.gif`와 `actual-tail-readability-with-impact.gif`는 public Play의 실제 JPEG 재생 기록이며 합성·가상 frame0이다.

## 2026-10-11 현행 · 실제 idle와 꼬리치기 전환 r6

[r6 idle·전환 정본](FDG_TAIL_IDLE_TRANSITION_20261011.md)을 따른다. 승인 r5 scene을 복사하는 `tools/fdg-studio/build-hell-aberrant-idle.mjs`의 `buildTailIdleScene(baseline)`이 실제 작은 호흡·상체 무게 이동을 별도 clip으로 저작하고 같은 owner clock의 기존 clip 전환 경로로 idle→한 번 공격→idle을 연결한다. 기존 r2/r3/r4/r5 보고·배송·검사·proof 수치는 동결 이력이며 재실행·새 인수 합산0이다.

| 항목 | 현재 r6 계약 / 새 증거 |
|---|---|
| 배송 | `fixtures/hell-aberrant-tail-idle.fdg.json`=`hell-aberrant-tail-idle-scene-r6`, compact824373bytes. 별도 `.rig.json`=`hell-aberrant-tail-idle-transition-r6`, compact717356bytes. r5 원본과 기존 배송 fixture 덮어쓰기0 |
| 실제 idle / 모델 | 새 `hell-idle-breath`=`대기 · 호흡과 상체 무게 이동`, 2초/24FPS/loop true/상체6tracks/각9keys. 총3clips이며 r5 공격2종(각3초/24FPS/20tracks)은 전체 deepEqual. 3864정점/4850삼각형/32본/1재질·mesh/weights/UV/drawOrder/source PNG·발/다리/27cap 보존. ENGINE_AUTHORING·보이는 표면2.5D·nativeCombatApplied:false |
| 복귀 / 진입 설정 | node.returnTo=`{clipId:'hell-idle-breath',transitionSeconds:0.35}`, sequence.autoStart=false, entryTransitionSeconds=0.25. non-loop 끝 `time+1e-9>=duration`에서 기존 crossfade로 idle time0에1회 복귀. 진입15owner틱/0.25초·복귀21틱/0.35초, loop에서는 재복귀0 |
| 실행 / 거부 guard | 최초 ready·재열기 일반 Play/step은 현재 idle·저장 clip을 진행하며 activation0. completed/stopped 후 일반 Play도 새 회차를 만들지 않고 기존 완료 회차를 보존하며, ‘공격 1회’ Replay만 현재 clip/time에서 공격0초 진입 blend를 생성하고 같은 호출에서 즉시 arm. returnTo 노드에 transition이 있으면 setClip/replay false·pose/state 불변·UI clip/공격 비활성. 자동 복귀는 sequence disarm0·completed/회차/event/emitted/pending 보존, elapsed는 마지막 공격2.9999999999999942≈3초로 고정하여 idle node time과 구분 |
| FX / native | sequence ID=`hell-aberrant-tail-idle-impact-r6`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640²셀/6×4/24frames/16FPS/life1.5초·scale0.16·anchor[0.5,0.5]·offset[-145,-84]·102.4×102.4px 표시 유지. attack54틱 crossing1회·trigger age0/frame0. native cooldown110/projectile life200/recover30/rec50 game-frame·attackWindow[0.15,0.85] progress 및 비환산 유지 |
| 새 데이터 / 구문 검사 | `test/fdgTailIdleTransition.test.mjs` 최초4/4 PASS, fail/skip/cancel0,2865ms. 기존 suite/PNG/native 검사 재실행0. 변경 scene runtime/schema·owner runtime/project·panel/studio·새 builder JS 최초7/7 구문 PASS를 별도 기록하고 test4에 합산하지 않음 |
| 실제 body-only 공개 | sequence만 생략한 자체 scene의 공개 Import→Play→once 선택2회→idle 자동 복귀2회. `actual-idle-tail-idle-body-only.gif`:133실제 CDP JPEG/960×540/8940ms/20335209bytes. runtime 속도 변경·합성 pose·가상 frame0 |
| 실제 shipping 공개 | 일반 Play idle 회차0→‘공격 1회’→0.900초 event1/실제 FX→idle 복귀 completed/event1/FX0. `actual-idle-tail-idle-with-impact.gif`:61실제 JPEG/960×540/4890ms/9709098bytes. 공개 Pause는 복귀 blend 뒤 idle0.8166666666666675/transitionnull에서 적용됐다. paused clip 선택의 새 entry 뒤 공개1틱으로 node/clock/transition.elapsed가1/60초 증가한 결과를 기록 |
| 새 저장·재열기 | 전체 public save→export→reopen→export 정확1회, 양 export2996047bytes·full JSON deepEqual·실제3864vertices/32bones pose deepEqual. saved once time1/60과 transition{fromClipId:'hell-idle-breath',fromTime:0.8333333333333343,duration:0.25,elapsed:1/60}·returnTo0.35·resources/sequence/map/camera/preview 보존. reload owner0·ready/activation0/event0/emitted0/FX0. 이후 일반 Play owner4.39999999999999/idle1.4166666666666665/transitionnull·ready0/event0/FX0, 오발0 |
| 시각 / cache / 증거 | 이번 보이는 idle·진입·공격·idle복귀·FX 가독성 VISUAL VERDICT: PASS / 전체 모델 RETOUCH, 정확1건 SOURCE_GAP=단일 정면 PNG에 없는 숨은 표면. 공개 수집 warn/error0. native게임/전체3D/Windows/GPU 인수0. URL `index.html?v=tail-idle-r6-final`, Studio/owner/project/scene schema/consumer/panel graph `tail-idle-r6`, fixture `tail-idle-r6-fixture`; pure math/texture r4 cache 및 독립 lab r3 기본 preset 유지 |

새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-idle-transition-r6/`의 `first-tests-tail-idle-transition.log`, `targeted-tail-idle-transition-receipt.json`·`targeted-tail-idle-transition-metrics.json`·`syntax-checks.json`, 실제 GIF 두 개, `save-reopen-receipt.json`·`reopened-runtime.json`·`before-reopen-pose.json`·`reopened-pose.json`·`post-reopen-idle-runtime.json`·`public-browser-warn-error-log.json`이다. 구현·자체 검수 완료 범위이며 기존 native 전투·맵·source/PNG·타인 WIP의 인수를 바꾸지 않는다.

| 신규 idle 저작 상수 | 정확한 배열 / 단위 |
|---|---|
| `IDLE_TIMES` | `[0,0.25,0.5,0.75,1,1.25,1.5,1.75,2]` demo 초 |
| `IDLE_BREATH` / B | `[0,0.146447,0.5,0.853553,1,0.853553,0.5,0.146447,0]` |
| `IDLE_SWAY` / S | `[0,0.707107,1,0.707107,0,-0.707107,-1,-0.707107,0]` |
| `ATTACK_ENTRY_SECONDS` / `IDLE_RETURN_SECONDS` | 0.25 / 0.35 demo 초 |

| boneId | local translation XYZ (model-unit) | local rotation XYZ (rad) |
|---|---|---|
| spine | `[0.025*S,0.032*B,0]` | `[0,0,0.010*S]` |
| head | `[0,0,0]` | `[0,0,-0.012*S]` |
| leftArm | `[0,0,0]` | `[0,0,0.018*B]` |
| leftForearm | `[0,0,0]` | `[0,0,0.012*B]` |
| rightArm | `[0,0,0]` | `[0,0,-0.015*B]` |
| rightForearm | `[0,0,0]` | `[0,0,-0.010*B]` |

각 키의 B/S는 해당 인덱스의 저작 배열 값이다. 시작/끝 bind offset 일치, root/pelvis/legs/tail idle track0. 기존 key translation lerp/quaternion 최단 slerp로 키 사이 실제 LBS를 평가하며 9개 저작 키를24장 이미지로 해석하지 않는다.

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
| 새 제작 경로 | builder `tools/fdg-studio/build-hell-aberrant-torso.mjs`, 별도 `fixtures/hell-aberrant-torso-depth.rig.json`·`fixtures/hell-aberrant-torso-depth.fdg.json`. geometry·최종 파일 수치·cache·공개 검수 값은 아래 확정 표에 기록 |
| 범위 | 같은 r6 계열의 실제 흉곽·골반 앞면 곡률/단면/짧은 sidewall 깊이 저작. 기존 r6 원본·32본·발/다리/tail·idle→attack→idle·FX 보존 계약. 새 source art/texture·PBR·GPU backend·native 전투·맵 변경0, canonical3D 복원 인수0 |

r7 문서 백업과 신규 동기화 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-depth-r7/`에서 관리한다. 기존 r2/r3/r4/r5/r6 자료는 동결하며 새 검수 결과로 덮어쓰거나 재실행·합산하지 않는다.

### r7 geometry 확정값

| 항목 | 현재 빌더·fixture에서 확인한 값 |
|---|---|
| 저작 데이터 | `buildTorsoDepthScene(baseline)`이 승인 r6 scene을 독립 복사. rig ID=`hell-aberrant-torso-depth-r7`, scene ID=`hell-aberrant-torso-depth-scene-r7`, 이름=`지옥기형 · 흉곽과 골반 저작 두께`. 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.{rig.json,fdg.json}` |
| 메시 증분 | **3895정점/4894삼각형** = 기존3864정점/4850삼각형 + rear31정점/명시 색44면. atomic side segment22개=chest13/pelvis9; 원 front 삼각형4850·원 XY/UV/weights/layer 보존, 새 side face layer0 |
| 앞면 깊이 | torso 앞면57정점만 양의Z 저작(chest40: sourceY<632px, pelvis17). 실제 최대Z=`0.2787834444444444` model units. 원화에서 복원한 해부학 수치가 아님 |
| side·분리 | rearZ chest=`−0.18`, pelvis=`−0.12` model units. 색 chest=`#756871`, pelvis=`#665b65`; `mesh.faceColors[0..4849]`는 null, 뒤44개는 명시 색. 새 rear 정점은 대응 front XY/UV 및 weights 복사 |
| 접합·원화 | shared non-torso front Z=0. T-junction 중간점 Z를 끝점의 선형 보간으로 맞추는40개 constraint·12passes; metadata max error=`1.3877787807814457e−17` model units, source collinearity tolerance=`0.0001`px. source832×1248·300 source px/model unit·origin[500,1140] 유지 |
| 유지·권위 | 같은32본/3clips/기존1 texture material·발/다리/tail·idle→attack→idle·r6 sequence/FX/native/map 보존. `depthAuthoring.authority:'ENGINE_AUTHORING'`, `revision:'r7'`, `sourceRecovered:false`, `fullBackAuthored:false`, `sourceTextureChanged:false`, `limbsChanged:false`, `nativeCombatApplied:false`. 짧은 sidewall이며 전체 뒷면·canonical3D 완료 선언0 |
| 새 인수 상태 | geometry·최종 배송·공개 재생/카메라·자기 저장·시각 결과는 아래 새 증거로 기록. 새 syntax12/12와 최초 targeted6/6을 구분. r6·old 검사와 proof 재실행/합산0 |

ROI·단면 ring·22개 명시 side segment와 Z 수식의 정확한 표는 [리그 데이터의 r7 geometry 정의](FDG_RIG_PROJECT.md)를 따른다.

### r7 현재 배송·공개 검수 · 새 전용 검사 완료

위 r6의 ‘현행/현재’ 표기는 당시 승인 기록이며 그 데이터·수치·proof 행을 보존한다. 현재 배송은 r7의 독립 torso-depth fixture다. r7의 선택 faceColors·깊이 geometry가 있는 리그에 아래 확장을 적용하며, 필드가 없는 기존 리그는 원래 material/UV·plain shade 계약을 유지한다.

| 항목 | r7 현재 값 / 새 실제 증거 |
|---|---|
| scene 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json`, compact **859941bytes**, SHA256=`98ea7bf3399e90f4e34f3b244ec7dfa76d9bcc81ba6e5bd1598d0ba759a8a3c9` |
| rig 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json`, compact **752920bytes**, SHA256=`744a087e7e71b142846c7eee614d7c07d2dd1514bbf09cb3a55c0027ec7a6385` |
| 정면 실제 재생 | yaw0/pitch0, 공개 Play→공격1회→자동 idle. `front-playback.json`·`front-idle-attack-idle.gif`: 실제 CDP JPEG **61장**, GIF **5790ms / 960×540 / 9757923bytes**. textureDraws4850 / authoringDraws0; side의 projected area가0이므로 flat fill0. 완료 activation1/event1/emitted1/FX0 |
| 작은 오른쪽 실제 재생 | yaw+22°=`0.3839724354387525`rad, pitch6°=`0.10471975511965977`rad. `right-playback.json`·`right-depth-idle-attack-idle.gif`: 실제 JPEG **59장**, GIF **5620ms / 960×540 / 9349266bytes**. textureDraws4850 / authoringDraws44; 공개 Play→공격1회→자동 idle, 완료 activation1/event1/emitted1/FX0 |
| 좌우 화면·카메라 | `left-yaw-minus22-pitch6.png`·`right-yaw22-pitch6.png`는 실제 native UI로 yaw±22°/pitch6°를 저장 모델에 반영한 화면. DOM fill/Tab만으로 값 표시를 바꾸면 store는 변경0이므로 실제 native Up으로 commit한 값이 기준. 이전 candidate side 실험 파일은 최종 proof로 사용하지 않음 |
| 자기 저장·재열기 | public save1/reload1/export2. 두 export **3130350bytes**씩, fullJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions 전후 equal. saved idle time=`1.649999999999999`초와 실제 camera+22°/6° 보존. reload owner clock0·ready/activation0/event0/FX0. `save-reopen-receipt.json`·`saved-reopened.png` |
| 새 구문 검사 | `new-syntax.json`: 변경된12modules의 신규 구문 검사 **12/12 PASS**. 전용6개 데이터/consumer 검사와 별도 기록, old suite/proof 재실행0 |
| 새 전용 검사 | `test/fdgTorsoDepth.test.mjs` 최초 **6/6 PASS**, **1300.32ms**, fail/cancel/skip0, 재실행0. 보존된 front prefix·실제 curvature/side/T-junction·strict faceColors17무효 구성·평가 독립 복사·Scene/Preview 혼합 Canvas·9motion/owner FX/return/capture를 검증. `first-tests-torso-depth.log`·`new-tests.json`·`targeted-torso-depth-receipt.json`·`targeted-torso-depth-metrics.json` |
| 새 CPU 수치 | chest40의 Z=`0.026402068371157716..0.2787834444444444`, pelvis17=`0.046791111111111276..0.1995` model units; same-Y 최대 sagitta 각각0.2787834444444444/0.1995model. bind side 면적=`0.0003999999999999959..0.005531726674375732`model². welded/shared seam error0,9samples의 limb/worldbone/foot/27capXY/front-rearXY drift0. 검사 epsilon=`1e−7`model은 렌더 projected area epsilon1e−9와 별도 |
| synthetic와 actual 구분 | mock Scene/Preview 혼합1texture+1flat fill/Preview Image1·extraRAF0. 배송 데이터의 CPU renderer yaw0.5/pitch0.25rad는 texture4850+authoring44(chest26/pelvis18)=4894Canvasops. 위 실제 공개±22°/pitch6° 증거와 별도 좌표·검수 |
| owner 데이터 검사 | 같은 owner .9초 crossing에서 새FX age0/frame0,90틱1.5초만료,3초completed 후21틱/.35초idle복귀. faceColors4894 capture 보존; setProject 후 mock owner 기존 Image21개 수 불변·clock0/readyactivation0/FX0, dispose RAF/listener/observer 정리. 새 Image21개를 추가했다는 뜻이 아님 |
| 시각 판정 | root가 실제 새 정면·작은 좌우·공격 frame으로 이번 흉곽/골반 깊이·동작/FX 가독성 범위를 확인한 **VISUAL VERDICT: PASS**. 전체 모델 **RETOUCH**, 정확1건 **SOURCE_GAP**=원화 없는 전체 뒷면·숨은 side 표면. authoring 추정 side는 새 canonical 원화/전체3D 복원 인수가 아님 |
| cache·기본 preset | index→studio 및 rig.html→rig-studio와 현재 rig 데이터/수학/texture/Scene/Preview graph query=`torso-depth-r7`. Studio 배송 fetch=`hell-aberrant-torso-depth.fdg.json?v=torso-depth-r7-fixture`. 독립 rig lab 기본 fetch는 r3 `hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 유지. scene schema의 isLocalAsset import는 기존 `project.js?v=tail-sequence-r4-final` 유지 |
| 보호 범위 | 이번 source PNG 읽기/수정0·r6 원본 fixture 덮어쓰기0·main/native전투/main-save/LOCK/맵/타인WIP 변경0. 기존 suite·PNG·기존 proof 재검수0, Windows/GPU/본편 성능 인수0. local checkpoint는 root가 별도 기록 |
## 2026-10-11 현행 r8 · 몸통 단면 연결과 피부 톤

기존 r7·r6 데이터·검사·proof 행은 당시 동결 기록으로 보존한다. root의 r7 최종 해석은 기술 한정 인수/시각 RETOUCH다. 겨드랑이·흉곽 아래의 밝은 grey flat 패널과 약한 둥근 볼륨을 후속 저작으로 보정하며, 이전 한정 시각 PASS 기록을 새 모델 전체 인수로 읽지 않는다. 현재 제작·새 검수 정본은 root 소유 [몸통 단면 연결·톤 마감 r8](FDG_TORSO_SIDE_FINISH_20261011.md)이다.

| 현재 변경 / 정의 | r8 계약과 근거 |
|---|---|
| 저작 범위 | `tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs`의 `buildTorsoSideFinishScene(baseline)`이 동결 r7을 독립 복사. 기존 rear31정점에 sourceY별 연속 piecewise-linear factor를 적용하여 Z24개만 변경·7개 plateau 동일. 기존44side face 전부 유지하고 같은 faceColors 소비로 더 어두운 warm charcoal 10종 facewise 톤을 지정 |
| 보존 | 원3864정점 XYZ·앞면 UV/원 texture/weights/topology/layer 보존. 총3895정점/4894면·32본/3clips·발/다리/27cap/tail·idle→attack→idle·기존 sequence/FX/native/map 동일. 기존 plain renderer/consumer/backend 사용, 새 source/texture/PBR/GPU/schema 추가0 |
| 깊이·톤 | rear 실제Z chest=`−0.18..−0.12240000000000001`, pelvis=`−0.12..−0.0816` model units. source Y ring 보간 factor로 `Zr8=Zr7×factor(part,sourceY)`; 각 side face 색은 해당 front endpoint 평균 sourceY의 `toneFactor=.9+.1×factor`로 지정 base RGB를 곱하고 성분별 round. 원 source 앞면 tint가 아님 |
| 현재값의 권위 | 복사된 `provenance.depthAuthoring.rearDepthModel/sideColors`는 동결된 r7 저작 이력이며 현재 r8 값이 아니다. 실제 runtime 값은 `mesh.vertices`·`mesh.faceColors`, r8 저작 정의/배송 record는 `provenance.sideFinish`가 정본 |
| 현재 배송 | 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json`=`hell-aberrant-torso-side-finish-scene-r8`, compact867875bytes; `.rig.json`=`hell-aberrant-torso-side-finish-r8`, compact760840bytes. r7/r6 원본 덮어쓰기0 |
| 현재 cache | 변경은 index의 `studio.js?v=torso-side-finish-r8`와 Studio의 `hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture` fetch 두 key. 기존 r7 rig/Scene/Preview 소비 graph·rig.html과 독립 lab r3 기본 preset 유지 |
| 새 실제 재생·시각 | `playback.json`·`side-finish-idle-attack-idle.gif`: 실제60JPEGframes / 5540ms / 960×540 / 9416644bytes. 공개 Play→공격1회→자동 idle, activation1/event1/emitted1/종료FX0, texture4850+authoring44·side 숨김0. root가 새 `front.png`·`left-minus22-pitch6.png`·`right22-pitch6.png`의 정면/작은 좌우±22°/pitch6°와 오른쪽 실제 재생 body+FX로 밝은 패널 감소·겨드랑이/흉곽/골반 연결을 확인한 한정 VISUAL PASS. 전체 모델 RETOUCH/숨은 표면 SOURCE_GAP1 유지 |
| 새 저장·재열기 | `save-reopen-receipt.json`: public save1 / actual reload1 / export2. fullProject/fullExportJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions equal. 저장 idle=`1.5499999999999994`초/yaw22°/pitch6° 보존; after owner clock0·ready/activation0/event0/FX0, 두 export3151574bytes. 실제 r8 module 재열기는 `reopened-module.json`으로 확인; 앞 dirty candidate의 페이지 교체 실패 reload/goto는 채택 증거가 아님 |
| 새 구문·관측 | `new-syntax.json`: 실제 변경 `tools/fdg-studio/studio.js`·`build-hell-aberrant-torso-side-finish.mjs`의 **2/2 PASS**. index HTML entry 변경1개를 JS 구문 검사로 합산하지 않음. 새 공개 관측 pageErrors0, 구 proof 재조회0 |
| 새 전용 검사 | `test/fdgTorsoSideFinish.test.mjs` 최초 **4/4 PASS / 2175.09ms**, fail/cancel/skip0·재실행0. front-prefix/geometry보존·11개 독립 knot/7plateau·44톤·9motion/실제CPU소비·in-memory capture/JSON reload를 확인. `new-tests.json`·`targeted-torso-side-finish-metrics.json`·`first-tests-torso-side-finish.log`; 기존 r7의6개 및 old suite와 합산0 |
| 새 CPU 관측 | 9phase의 원3864prefix LBS/worldbones/foot/27capXY/front-rear **hierarchy-world model XY** drift0. 전체 side 면적 min=`0.00037996251032275445`/max=`0.004940618460543637`model², 최소Zspan=`0.0816`model=`24.48`source-equivalent px(투영 화면 폭 아님). ±22°yaw/+6°pitch CPU에서 texture4850+plain44=4894Canvasops, 현44색 정확 소비 |
| 색 비교의 의미 | encoded8bit RGB 가중합 `0.2126R+0.7152G+0.0722B`의 각face r8/r7 최대비=`0.33042556994644995`(<0.4), 각segment front role 톤>rear role 톤. 동결된 r7의44side 색과의 저작 수치 비교이며 원PNG/source색·physical photometry 비교가 아님 |
| 새 인수 상태 | geometry/색/배송·새 실제 재생·자기 저장/재열기·semantic4/syntax2·한정 시각 검수 완료. old suite/source PNG/proof 재검수·새 합산0. 현재 공개 데모 ID·r8배송fetch 확인은 `public-preset-ready.json`·`public-preset-ready.png`. 전체 모델 RETOUCH/단1개 SOURCE_GAP 유지, 이번 추정 단면은 원화 없는 숨은 표면을 복원한 canonical3D가 아님 |

ring·palette·색 생성·메타데이터의 정확한 정의는 [리그 프로젝트 r8 계약](FDG_RIG_PROJECT.md)에 기록한다. 새 증거와 수정 전17문서 백업은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8`에서 관리하며 이전 자료를 덮어쓰지 않는다.

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| owner / node | node position[4150,7360,0], scale80; camera[4150,7216], yaw/pitch0/0. 기존fixed1/60초/max6/clamp0.25초, 새clock/RAF/Image owner0 |
| 전환 | 기존 setRigClip 기본0.25초와 nonloop 끝→returnTo idle0.35초 crossfade 재사용. returnTo node에 transition이 진행 중이면 setRigClip/replay false·상태 유지 |
| 실제 FX/sequence | `rigScene.sequence` 없음 / FX0 / `nativeCombatApplied:false`. sequence snapshot은 idnull/statusunavailable/activation0/event0/emitted0/activeFx[]. 지팡이 타격은 저작 clip이며 native 피해·독탄·Q/E·SFX·충돌·맵·본편 save에 배선하지 않음 |
| 복원 | public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B |
| 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 기존 owner/API | 같은fixed1/60초/max6/clamp0.25초·일반setRigClip/returnTo로 진행. 단발2.4초끝에서idle복귀, transition중returnTo node setClip guard보존·sequence없음/FX0 |
| 실제 현재 pose | 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0 |
| 현행 왕복 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact |
| 인수 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.

## 2026-10-11 다크드루이드 NORMAL slam · 별도 저작과 opt-in phase bridge r3

이 r3는 별도 query/key의 새 저작·native opt-in 소비 단위다. 위 r1/r2 및 Hell의 수치·배열·배송·proof·test는 동결 이력이며 각 기존 query 계약을 보존한다. 과거18문서를 다시 갱신하거나 이전 결과와 새4그룹 검사를 합산하지 않는다.

| 항목 | 현재 r3 계약 / 한계 |
|---|---|
| observer/시계 | engine/fdg/dark-druid-slam-bridge.js: createDruidSlamPhaseObserver(markers). WeakMap begin(actor,windFrames)/sample(actor)/cancel(actor); sample={phase,progress,time,windFrames,facing} 또는 null. 원래native start먼저실행, actor/save에추적필드0·별도RAF/wallclock/공격이벤트/타이머/피해0 |
| native 시간 | native `slam` idx14: 준비=`bossSlamWind`, phase0..4 base26/22/17/14/8f+선택지연14f (`floor(35*BOSS_PHASES[phase].teleM)+extraDelay`), 원래start후실제st2를windFrames로관측. 타격=`bossSlam`8f; impact recover40할당→다음update공통20f clamp. `PHYS_STEP=1000/60`ms·피해/패링/충격파/hitStop/각도/AI/쿨다운불변 |
| pose 대응 | `DRUID_SLAM_MARKERS={windStart:0,windEnd:1,strikeEnd:1.16,recoverEnd:2.6}`초. wind p=clamp(1−st2/windFrames)→0..1; strike p=clamp(1−st2/8)→1..1.16; 같은actor의strike관측후recover p=clamp(1−min(st2,20)/20)→1.16..2.6. recover40과20의첫pose동일; 저작marker로native공격시간교체0 |
| 대상/취소 | stage0/3의e.ib NORMAL만, demo finale제외. wind/strike/strike관측된해당recover만pose소비; 다른patternstart/idle/사망/stunned/_hitStun취소. facing은정면Xmirror이며8방향실루엣복원아님 |
| 캐시/합성 | CPU ownerCanvas1 lazy. raster키actor/time/facing/dw/dh/rasterScale; u=1/(_btScaleMul\|\|1), rasterScale=clamp(u×displayScale,0.25,2), displayScale=max(hypot(a,b),hypot(c,d)) fallback1. pose/방향/크기/scale변경때만triangles1회draw→native source-over1+lighter2합성; 동일pausepose rasterrewrite0. 기존alpha/foot/nameoffset/glow/tell소비유지 |
| 수명/권한 | fallback/uninstall buffer0×0·actor참조해제. 자기wrapper가여전히설치됐을때만원함수복구; canvasFactory는좁은검사용optional. 시각필드_nameTopOff외nativeactor/gameplay/save쓰기0; nativeGPU/FPS실측0 |
| 새 검사/한계 | phase/pause/interrupt·wrapper/cache/fallback·최종손/발/IK/capture 신규4그룹첫PASS는MockCanvas+puremetrics. 실제native부팅0; 실제 native live 부팅/보스전/본편save·API접촉0. testchar는slotload만우회하며 강제dbSave→POST/api/save, hellcave_sharedStorage/hellcave_sharedMats·POST/api/mats/공용설정key가미격리되어 **BLOCKED**. 새Studio own저장왕복은별도기능검증이며 live저장gate/전투인수를통과시키지않음 |
| 현재 인수 | **VISUAL VERDICT: RETOUCH — 실제전투인수대기**. 정면2.5D저작의준비/하강/어깨접합/외투후행/idle복귀만한정PASS. 발체중이동·native실제크기/속도·player회피/피격/recover 미관측. 잔여정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

정확 geometry/weights/팔IK/키·배송/SHA·실제GIF/저장 수치는 [다크드루이드 전신 내려찍기 r3 정본](FDG_DARK_DRUID_BOSS_SLAM_20261011.md)을 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-boss-pattern-r3`; r1/r2 보고서·proof/old suites·보호2_3·native설계·marketing·타팀WIP는수정하지않았다.


## 다크드루이드 native encounter r4 · 2026-10-11

현재추가범위는 [r4 네이티브교전](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md)의저장caller명시분리·nativeFSM교전·NORMAL공격instance수리다. 기본게임과독립저작Studio,ownQA를구분하고r3리그/bridge/저장증거는동결재사용한다. 전역fetch/Storage proxy·wholegame복사·새서버0;map/Q/E/LOCK/PNG원권위유지. ownsettings key `fdg.qa.dark-druid.encounter.r4` schemaVersion1 settings9필드만공개수동Save/reopen하며nativeactor/slot/backendsave ACK아님. 새실교전검수는정본의현재상태를따른다.

> r4 최종 새 산출: native pause/STEP의 동일 camera5포즈 비교판+실제70장 내려찍기 연속GIF, observer pool/actor교체 수리, public 사망/retry finite 확인, own Save1/write1·diff5 재열기 수리. 신규20고유검사 PASS / VISUAL RETOUCH, 실제 Q/E성공·처치 전경로 미인수. stage0 fullroute/전체엔진/24장제품 완료 주장은 없음. exact state/time·저장·성능과 §23은 [r4 정본](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md).


## 2026-10-11 다크드루이드 내려찍기 접촉 동작 r5 · 별도 저작과 격리 소비

[r5 접촉 동작 정본](FDG_DARK_DRUID_SLAM_CONTACT_20261011.md)의 별도 19본 rig/scene fixture를 기존 phase observer·draw/cache와 clip 소비로 연결한다. attack `dark-druid-native-slam-contact-r5`는 2.6초·24FPS, idle은 `dark-druid-slam-contact-idle-r5`, 저작 markers는 0/1/1.16/2.6초다. 기존 phase 진행도→저작 pose 대응을 유지하며 저작 sample초/clip FPS로 native 피해 clock을 교체하지 않는다. 5장 비교의 native phase틱과 authoring sample초도 각각의 단위를 기록한다. native damage·angle·AI·Q/E·원PNG·맵은 유지한다.

native `fdgDruidSlam=r5` 소비는 exact r4 QA active에서만 새 `clipId` / `rigUrl`을 전달한다. 두 optional 값의 기본은 기존 r3다. 독립 제작 query `authoring=dark-druid-slam-contact-r5`와 own key `fdg.studio.dark-druid.slam.contact.r5`로 저작 저장을 분리한다. 기존 r3/r4의 수치·봉인·완료 기록과 원산출은 동결한다. r5의 실제 visual/test/save 검수 결과는 새 정본의 최종 검수 표에서 관리하며 이전 PASS를 새 결과에 합산하지 않는다.

최종 candidate B의 attack은 14tracks×15keys이며 1.09초 shortest-slerp 키를 추가했다. duration2.6초·24FPS와 markers0/1/1.16/2.6초는 유지한다. r5 authoring module과 두 rig/scene fixture query는 `slam-contact-r5-b`, bridge cache는 `slam-contact-r5-cache2`다. native WebGPU의 cached canvas가 이전 raster를 재사용하던 접점은 실제 r5 clip raster 작성 완료 때만 owner canvas의 `_glVer`를 1 증가시켜 갱신하며 동일 pause pose에서는 증가0이다. native clock/actor와 기본 r3 경로는 변경하지 않는다. read-only `getRenderSnapshot()`은 rigId/clipId/time/facing/rasterRevision과 새 사본의 bounds를 반환한다. 새 기술·시각·저장 검수 결과는 r5 정본의 최종 표를 따른다.

## 2026-10-11 다크드루이드 전투 프레이밍 r7 · native 카메라 한정 소비

[r7 정본](FDG_DARK_DRUID_COMBAT_FRAMING_20261011.md)의 pure `fitDruidCombatFrame`은 world bounds와 logical screen safeRect를 사용한다. dt는 기존 `_dtSp` frame-step, zoom0.3..0.8·축소즉시/확대1−.94^dt·중심1−.92^dt와 safe/map 교집합 clamp이며 불가능 시 contained:false/reason을 반환한다. exact r4 QA+r7 native-ai에서만 기존 camera clamp/lock 뒤 ok:true 값을 적용하고 현재 zoom을 기존 mouse projection caller에 소비한다. gamepad bypass·본편 camera·actor/탄 좌표·AI/판정/시간은 유지한다. combatSnapshot의 includedShots/bodySource와 death 이후 cached frame을 live 포함 판정과 구분한다. 새 기술·실교전·VISUAL RETOUCH/COMBAT_OVERLAP 1건은 r7 정본의 범위 표를 따른다.


## 2026-10-11 · r8 native 표시 투영 소비

기존 r3/r4/r5/r6/r7 원문·수치·검사·proof는 동결 이력으로 보존한다. 새 자기 격리 QA 계약과 최종 실제 결과는 [전투 표시 가독성 r8](FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md)에서 관리한다.

| 항목 | r8 scoped 계약 |
|---|---|
| frame source | beginReadabilityFrame({transform:[a,b,c,d,tx,ty],pixelScale:_ssaa,viewport:{width:VW,height:VH}}), native world transform 직후 동일 SSAA/zoom/rounded camera/shake 값 전달 |
| logical screen | projectReadabilitySprite(x,y,width,height) → {x:(a*x+c*y+tx)/s,y:(b*x+d*y+ty)/s,width:width*a/s,height:height*d/s}; s=pixelScale |
| label | placeReadabilityLabel(worldAnchor,width,height), screen [60,90,VW−230,VH−150] 역투영 viewport·body/player±100/occupied 회피. 원 G.txts/actor 변경0 |
| 관측 | combatReadability getter=옵션true && native-ai; readabilityWorldTransform 새 배열; readabilitySnapshot JSON 새 사본·moved/overflow/labels/occupied |
| fallback | pure placeCombatLabel의 {x,y,rect,moved,overflow,reason}, ok 필드0. 최대128후보/256rectangles/축별16임계좌표/5×5viewport grid/gap12worldpx; 검색 소진은 원 anchor 유지·hide/drop0 |
| 원 경로 | VFX GL 두 caller의 중심/크기 투영만 정합; Canvas fallback 원 world. backend/shader/UV/color/alpha/angle/frame/life·owner/native clock 유지 |


## 2026-10-11 · r9 자기 QA 접촉 VFX alpha 소비

이전 r8 및 기존 body/Hell/native 계약과 모든 원문·proof는 보존한다. 새 한정 표시 source/검사·실제 결과·§23는 [접촉 VFX r9](FDG_DARK_DRUID_CONTACT_VFX_20261011.md)에서 관리한다.

| 항목 | r9 scoped 계약 |
|---|---|
| 접점 | 기존 generic boom layer X.globalAlpha 1곳에 own r9 opt-in scalar 적용. 좌표/timer/actor/원boom record write0 |
| source / progress | engine/fdg/druid-contact-vfx.js, QAquery contact-vfx-r9. policy progress=ep=t/mt; 원 frame/size의 layerPhase(ep−si*.04)와 구분. 실제 WebGPU _ga→quad→WGSL src-alpha 경로, composite setter no-op·blend변경0 |
| pure API | contactVfxAlpha({active,kind,sheet,frame,progress,alpha,overlap}); finite alpha/progress0..1·integer frame0..15·exact allowlist·active/overlap true에서만 장식보정 |
| QA API | contactVfxAlpha는 current readability frame body/player±100 rect와 FX world AABB overlap만 읽어 pure helper 소비. contactVfxSnapshot readonly static config/policy+active |
| 수치 | medium core0..7 unchanged/late8..15 gain.16, kinddark secondarysmoke gain.12, latefade progress.60→1에서gain×1→.25, 끝modifier.04/.03. 원nativeAlpha에곱함 |
| UI / 보호 | r9 leaf 설명16%/12%·core8+latefade, compactmax190px. 원font/zoom/brightness 유지, nativeclock/coords/life/QE/위험·PNG/UV/색/material/맵/save 불변 |
| 새 실전 / 한계 | 정상 native play1회, recorded HP0/bossHP21017 alive·shield11501/kill0. states33의 대상 dark/dark02 layer0으로 actual 적용·감소·core 보존 NOT_OBSERVED. VISUAL RETOUCH / 정확 잔여1 COMBAT_VFX_CONTACT_OVERLAP; 새 결과·자료·§23는 r9 정본 참조 |

## dark-druid-contact-vfx-live-fix (2026-10-11)

| 접점 | 현재 계약 |
|---|---|
| game.html drawP shockField | QA storage active + fdgDruidLiveFix=contact만 opt in. _msStormImg2 및 _thunder 컬러 li0의 _fdgDruidDecorAlpha(nativeAlpha,age): ≤8 유지 / 8..16 gain1→.12 / ≥16 gain.12 |
| 보존 | 기본 게임·원 자원/crop/배치/폭/수명/피해/AI/Q-E 유지. 흰 코어/분기와 장판1/3 native |
| 인수 | 실제23 시트 draw/감소21, 새 소비검사6/6. 정상 전투 player-dead/boss-alive, E/Q callback0/0. VISUAL RETOUCH / 잔여1 COMBAT_VFX_CONTACT_OVERLAP |

전체 증거/한계/§23: `FDG_DRUID_CONTACT_VFX_LIVE_FIX.md`. 상시 telemetry 추가0, frozen r9 재검사0.


<!-- DARK_DRUID_THORN_FIRST_APPENDIX_BEGIN -->
## 2026-10-11 · 다크드루이드 가시 일제발사 first opt-in

기존 본문·r9/live-fix와 이전 결과표는 해당 범위의 동결 이력으로 보존한다. 아래는 기존 자기 격리 QA에 fdgDruidThorn=first를 명시한 별도 ENGINE_AUTHORING fan 예외만 기술한다. 기본 본편·옵션 없는 QA·피날레·상위 phase 계약을 덮어쓰지 않는다.

| 항목 | first opt-in 계약 |
|---|---|
| gate / owner | window._FDGDruidQaStorage.active && fdgDruidThorn=first. 실제 발사 대상은 ib=true·si0/3·!finale·phase0/1 NORMAL 보스만 |
| native 발사 | bossFanWind의 기존 st2<=0 한 tick에서12발을 동시에 생성. 별도 wave clock/연속탄 생성0. lane0..11 중 physical0/1/3/4/6/7/9/10=8발, magic2/5/8/11=4발(i%3===2), 이 범위 blackBean0 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| local flags / 예외 | _druidThornVolley pooled 기본/reset false, _druidThornLane 기본/reset−1. 해당 flag탄만 기존 modulo3 drop 및 생성 직후 decoy/ancestor aim 재지정에서 제외. 공용 후처리 배율은 적용하며 전역 drop/decoy/seek 변경0 |
| 입력 / 최종 속도 | 입력4.4px/native tick. 기존 후처리 최종 physical5px/tick=300px/s(60Hz), magic500/60..600/60px/tick=500..600px/s. 이 값은 clip24FPS와 별개이며 신규 속도 배율0 |
| 피해 | n=floor(atk×1.3), 최종 physical=floor(floor(2n)×.5), magic=floor(2n). atk103이면 n133/physical133/magic266. native poison wrapper는 원 class 보존 후 EL.P/col#66dd22, 실제 HP 피해시 기존 poison+3 |
| 수명 / 판정 | life/ml400은 nominal native-frame metadata. 기존 감소 life−=sp×.667 및 magic의 기존 카메라2500px 범위 안 life<=0→life1 연장/공용 제거 규칙 유지, 정확400tick 종료/초 단위로 승격0. 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0 |
| 준비 / 회복 / cd | wind=floor(25×BOSS_PHASES[phase].teleM)+extraDelay, phase0/1의 base18/16native f(추가 delay 별도). 발사 직후 recover45, 다음 기존 보스 recover update에서20으로 clamp. 기존 fan cd100 유지. authored1.6초를 native 준비·수명·회복 시간으로 덮어쓰지 않는다 |
| 보존 | 기존 E physical/Q magic/black Q-only·반사 friendly blue 유도·피해/poise·자원 유지. phase2+의 기존 count/black/modulo3 drop·피날레·다른 보스·기본 main·사용자 save 유지 |
| module / 생성 | engine/fdg/druid-thorn-pose.js의 createDruidThornFanClip/createDruidThornFanObserver. 기존 native bridge의 thornVolley:true일 때만 generated clip과 observer를 연결, 기존 source clip/19본/mesh/UV/weights/texture 변경0 |
| clip | dark-druid-native-thorn-fan-first, 1.6초/24FPS/nonloop,12tracks×6keys. keys seconds=[0,.55,1,1.12,1.3,1.6]; markers windStart0/releaseStart1/releaseEnd1.12/followEnd1.3/recoverEnd1.6 |
| native time 소비 | begin은 실제 bossFanWind st2를 WeakMap에 저장. wind progress=clamp(1−st2/windFrames)→저작 time0..1, recover progress=clamp(1−min(st2,20)/20)→time1..1.6. time<=1.12 release/<=1.3 follow/이후 recover. 실제 발사는 native transition 한 tick이며 저작 key6개가6발/6wave를 뜻하지 않는다 |
| 수명 / 원 권위 | actor 죽음·stunned>0·_hitStun>0·finite st2 아닌 값·다른 state에서 observer 취소, 같은 paused actor sample은 새 clock 없이 같은 pose. 원 start를 먼저 호출하고 return을 보존. observer가 탄/피해/actor fields를 쓰지 않는다 |
| 좌우 / 리소스 | 기존 앞면 mirror projection과 native facing 소비,8방향 새모델 복원 아님. staff는 기존 leftHand 자식 계약을 요구. 본체 source PNG 새생성·픽셀수정·bitmap shader/backend 변경0 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 첫 사본](FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
### 저작 fan clip의 source key 값

각 rotation은 model Z radians이며 key 순서[0,.55,1,1.12,1.3,1.6]seconds다. 아래 값은 bind-relative authoring offset, native actor angle/이동값이 아니다. 미표기 translation은 모든 key[0,0,0]; 기존 staff/boot/head clip track을 새로 만들지 않는다.

| boneId | rotationZ6개 | translation6개(model XYZ) |
|---|---|---|
| pelvis | [0,.012,.025,−.035,−.008,0] | [[0,0,0],[−.008,−.008,0],[−.015,−.015,0],[.018,−.012,0],[.006,0,0],[0,0,0]] |
| spine | [0,.015,.035,−.045,−.01,0] | [[0,0,0],[−.006,.006,0],[−.014,.012,0],[.035,−.014,0],[.008,0,0],[0,0,0]] |
| chest | [0,.015,.025,−.025,−.005,0] | 모든 key[0,0,0] |
| leftUpperArm | [0,−.28,−.5,.62,.16,0] | 모든 key[0,0,0] |
| leftForearm | [0,.08,.1,.2,−.08,0] | 모든 key[0,0,0] |
| leftHand | [0,.05,.1,−.55,−.12,0] | 모든 key[0,0,0] |
| rightUpperArm | [0,−.04,−.12,.3,.06,0] | 모든 key[0,0,0] |
| rightForearm | [0,−.08,−.2,.25,.04,0] | 모든 key[0,0,0] |
| coatLeft | [0,.01,.025,−.015,−.09,0] | 모든 key[0,0,0] |
| coatRight | [0,−.008,−.02,.012,.075,0] | 모든 key[0,0,0] |
| coatFront | [0,.005,.012,−.006,−.045,0] | 모든 key[0,0,0] |
| coatBack | [0,−.008,−.018,.01,.06,0] | 모든 key[0,0,0] |

<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 camera / native-clock idle / Q effect 소비

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| clock | paused fit dt0는 native update를 진행하지 않음. 새 Q sampling은 native pool TTL·판정 clock 변환0 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · smooth-motion 현재 계약

이전 본문/보고는 날짜가 있는 동결 이력이다. 이번 first+r5 표시 계산·전환·QA restart 범위만 추가한다.

| 항목 | 이번 정확 계약 / 관측 경계 |
|---|---|
| opt-in / query | first+r5 smoothMotion:true && idleClip 존재. bridge/rig import motion-continuity-20261012-final; default24FPS floor·다른 bridge/fallback 보존 |
| idle / 전환 | native G.stageTime/60 연속 idle. 마지막 표시 localPose를 source로 entry wind normalized progress0..0.25 smoothstep(0.25초가 아님), return native clock0.12초. wind 외 blend amount1 즉시·impact/FSM 지연0 |
| prepared 평가 | compileRigEvaluator(project) full project validate1회+독립 structuredClone, bind quaternion/world/inverse·hierarchy·influences·lookups·key quaternion prepare1회, frozen{evaluate(options={})}. 매 evaluate options 검증/sample/world/skinning·독립 결과 사본. 기존 evaluateRig 매-call project validation 유지 |
| pose / 표시 cache | localPose=[{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}]는 bind transform에 합성할 offset. smooth rasterScale=ceil(clamp(desired,.25,2)×8)/8; 같은 bucket의 scale 원인 reraster 억제. facingDeadZone=.1 display hysteresis, native facing 미수정·8방향 완성0 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 전신·지팡이 안전 확인. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위 구현 완료·전체VISUAL RETOUCH. 정확 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
