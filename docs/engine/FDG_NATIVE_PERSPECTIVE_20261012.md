## Godot 실제 원근 뷰 첫 연결 — 2026-10-14

| 범위 | 구현 / 미완 |
|---|---|
| 실제 선택 | Main `mount_native_perspective_view(settings={})` 또는 명시 실행 flag `--fdg-native-perspective-first`. 기본 2D와 기존 Web artifact는 그대로다. native Camera3D/SubViewport가 현행 World/Player의 실제 Sprite2D·AnimatedSprite2D texture와 soil/litter 두 ShaderMaterial을 소비한다. |
| 물리와 입력 | world XY→Godot XZ/height→Y. 새 `native_world_to_screen`·`native_screen_to_world`가 실제 Camera3D 투영/지면 또는 지정높이 plane ray를 사용. Player 실제 mouse-aim 공급 Callable 연결. 물리·nav·맵·HP·G/P·Q/E 수치 변경0. |
| 실제 품질 경계 | 구형 Warrior/기검참/캐릭터 선택 미완이 그대로다. 24고유장수·24FPS, custom draw VFX/Canvas shader parity/labels/terrain 높이·접지shadow/가림 polish/전체route·전투/smooth motion/성능 미검수. `latest_full_game=false`. 전체 최신 버전 또는 출시완료 아님. |
| 새 검수 | headless 새projection9 PASS(6.247초), 새flag/owner5 PASS(6.073초), 새view-script-loss3 PASS(6.129초). GPU START 최초→anchor수정1→최종수정 검수3실행, 최종발접점 신규1 PASS(quad_min_height0/당시frame-bottomY7480; 실제body-anchorY7477.5는2026-10-15별도수정). 총 새의미case18, actualMain6회(기술3+새visual3). 이전 성공suite/PNG해시/asset복사/import/배송교체/인간play창 입력0. 최초layout warning1은top-left anchors로수리, 최종GPU/기술은제품ERROR0·기존Camera2D warning1씩. |
| VISUAL VERDICT | **RETOUCH** — START 원근 GPU 실제프레임 확인. 기존 캐릭터 품질·전체 맵/교전·VFX·그림자·가림은 미완. 접점 오류 첫프레임을 보존하고 최종수정은 별도 PNG로 기록. |

현재 버전 manifest의 `map.camera`는 companion Camera2D 진단이고, 새 `map.perspective_view`가 opt-in 실제 Camera3D 선택/준비/미완을 별도로 명시한다. API 상세는 `FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 표, §23 MAP PRODUCTION REPORT는 `FDG_ENGINE.md`의 같은 날짜 표를 따른다. source pin만으로 최신화했다고 표시하지 않는다.

# FDG native 원근 카메라 소비 계약 — 2026-10-12

> **맵팩 동측 가림 현행:** `fdgMapPack=first`에서 GH early body/HP를 같은 foot billboard로 연결하고, P/일반actor/기존windup을 kindactor, upright sprite를 kindoccluder로 소비한다. 선택적 `actorOcclusionCutaway`는 기본false이며 deferred queue에만 적용한다. 16분할 타원·축padding2/4/6/8px·alphacap.2/.4/.6/.8의 새 실제 관측3화면은 동측 가림 VISUAL PASS다. 중첩 convex분할 및 같은style setter 생략을 마감했고 최종31PNG/8348ms의 GH/P2화면 PASS를 확인했다. revision별검사·실제proof는 [동측 정본](FDG_MAP_PACK_EAST_VISIBILITY_20261012.md)에서 관리한다. 아래 과거 parity 판정은 해당 revision의 동결 이력이다.

`game.html`의 명시적 r4 QA 경로가 FDG 공통 world camera를 실제 native 렌더와 지면 클릭 역투영에 소비한다. 기본 native 진입과 게임 물리·AI·공격 판정·저장 계약은 유지한다. 이 문서는 카메라 소비 계약이며, 전체 엔진의 출시 완료, 신규 Druid 모델 승인, 상태별 24장 제작·24FPS 재생의 완료를 선언하지 않는다.

| 구분 | SSOT / 소비 파일 | 현재 범위 |
|---|---|---|
| 공통 수학 | `engine/fdg/world-camera.js`, [공통 world camera 계약](FDG_WORLD_CAMERA_20261012.md) | world XY / 높이 Z 투사, 지면 역투사, camera-space near clipping |
| 품질 레퍼런스 | [Git의 PoE2 reference study](../5.1임펙트디자인/POE2_REFERENCE_STUDY.md) | 지면 접점·body와 ground FX·독립 projectile 공간 일치의 학습 자료. 이 구현의 카메라 수치를 PoE2 내부 수치로 주장하지 않음 |
| native drawing adapter | `engine/fdg/native-world-projection.js` | 지면 geometry, 이미지 UV, anchor billboard, 화면 scope, 선택적 depth batch |
| native QA controller | `engine/fdg/native-perspective-qa.js` | 현재 view 소비, 임시 카메라 UI, 좌표 역변환, 표시 방향, renderer state 보고 |
| 실제 소비 지점 | `game.html` | world draw 진입/복원, floor·paint·prop culling, player·boss·일반몹 body, 독립 projectile, ground tell |
| 독립 native 씬 | `engine/fdg/ruined-forest-scene.js`, [폐허 숲길 SSOT](FDG_RUINED_FOREST_PLAYABLE_20261012.md) | `fdgScene=ruined-forest-first`에서만 별도 초기 카메라와 deferred billboard 소비 |
| 기존 QA 격리 | `engine/fdg/druid-qa-storage.js`, [native r4 QA 계약](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md) | 기존 caller 격리 조건과 자체 QA 저장 경계 유지 |
| 미완료 품질 범위 | 아래 `NATIVE_PERSPECTIVE_RENDER_PARITY` | 화면별 기존 renderer 기능의 원근 소비 일치 검수 |

## 1. 정확한 진입과 기본 native 보존

다음 조건을 모두 만족해야 `_FDGDruidQaStorage.active`가 참이 된다. 카메라는 여기에 `fdgPerspective=first`가 추가된 경우에만 설치된다.

| id | 조건 | 코드 적용 위치 / 실패 시 결과 |
|---|---|---|
| `host` | `localhost` 또는 `127.0.0.1` | `druid-qa-storage.js`; 그 외 inactive |
| `port` | 문자열 `3333` | 같은 helper; 다른 서버의 기본 게임은 활성화하지 않음 |
| `path` | `/game.html` | 같은 helper |
| `test` | `test=1` | 같은 helper |
| `testchar` | `testchar=1` | 같은 helper |
| `bosstest` | `bosstest=0` | 같은 helper |
| `qa` | `fdgDruidQa=r4` | 같은 helper |
| `excluded-query` | `editor`, `demo`, `bic`, `char`, `booth`, `mapqa`, `projectilelab`, `dropPreview`, `stage` 중 하나도 존재하지 않음 | 값에 관계없이 query 존재로 inactive |
| `perspective` | `fdgPerspective=first` | `isNativePerspectiveEntry()` 및 native module loader; 다른 값/누락이면 카메라 설치 없음 |
| `projective-texture` | storage active가 정확히 `true`이고 `fdgPerspective=first` | `_fdgProjectiveTextureGate`; 기존 GPU shader에만 선택적으로 positive W 활성화 |
| `forest-scene` | 위 projective gate + `fdgScene=ruined-forest-first` | `_FDG_RUINED_FOREST_FIRST`; 별도 씬 소비 계약은 폐허 숲길 SSOT 우선 |

카메라 진입 주소:

```text
http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first
```

독립 씬 진입 주소:

```text
http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first
```

`fdgDruidCombat=r7/r8/r9`, `fdgDruidThorn=first`, `fdgDruidSource=legacy-f0`는 이 카메라의 필수 gate가 아니다. 이 문서의 Druid GPU 스냅샷 source는 `existing-v3-camera-consumer-only`다. legacy-f0 또는 승인되지 않은 검은 SW 후보를 새 모델로 취급하지 않는다. 기존 `APPROVED_DEMON_BODY_MISSING` 상태를 카메라 구현으로 해소하지 않는다.

## 2. 공통 투사·역투사·clip 수학

카메라 설정은 `projection`, `yaw`, `pitch`, `zoom`, `distance`, `near` 여섯 필드를 소비한다. 좌표와 viewport는 유한한 숫자이며, viewport 폭·높이는 양수다.

| 필드 | 공통 기본값 | 공통 validation 범위 | native 공개 UI 범위 / step |
|---|---:|---|---|
| `projection` | `perspective` | `perspective`, `orthographic` | `원근`, `평행 비교` |
| `yaw` | `0` rad | `−π..π` | `−0.785..0.785`, `0.005` |
| `pitch` | `0.85` rad | `0.35..1.1` | `0.6..1.1`, `0.005` |
| `zoom` | `1` | `0.25..2` | `0.5..1.5`, `0.01` |
| `distance` | `1400` | `600..6000` | `900..6000`, `50` |
| `near` | `32` | `8..128` | 공개 slider 없음; 초기 camera 값 소비 |

아래 공식에서 `dx=x−center.x`, `dy=y−center.y`, `W/H=logical viewport`, `c/s=cos/sin`이다. 원본 world·actor·collision 좌표는 수정하지 않는다.

| 단계 | 공식 / 반환 계약 |
|---|---|
| yaw 회전 | `rx=dx*cos(yaw)−dy*sin(yaw)`, `ry=dx*sin(yaw)+dy*cos(yaw)` |
| camera-space | `cameraX=rx`, `cameraY=ry*sin(pitch)−z*cos(pitch)`, `depth=ry*cos(pitch)+z*sin(pitch)` |
| camera 거리 | `d=distance−depth` |
| 원근 투사 | near 내부에서 `scale=zoom*distance/max(near,d)`, `screenX=W/2+cameraX*scale`, `screenY=H/2+cameraY*scale` |
| 평행 투사 | `scale=zoom`; 화면 위치는 같은 중심 공식; height Z/pitch/yaw는 계속 소비 |
| depth key | 원근 `1/max(near,d)`, 평행 camera-space `depth`; 가까운 지면 anchor가 더 큰 key |
| near 밖 | 원근 `depth>distance−near`이면 `visible=false`; 유한한 0 화면 좌표/scale/depth 반환 |
| ground inverse | `unprojectGround(screenX,screenY)`는 `z=0` world 좌표. 원근 `u=(sx−W/2)/(zoom*distance)`, `v=(sy−H/2)/(zoom*distance)`, `den=sin(pitch)+v*cos(pitch)`, `d=distance*sin(pitch)/den`, `ry=v*d/sin(pitch)`, `rx=u*d`, yaw 역회전으로 world 복원 |
| invalid ground ray | 원근 `den<=1e−12`, 비유한 결과 또는 `d<near`이면 `null` |
| near polygon clip | camera-space `depth<=distance−near` half-plane에 Sutherland–Hodgman clipping. 공유 finite numeric UV 등은 교차 비율로 보간하고 원본 배열/정점은 변경하지 않음 |
| clip counter | adapter `clippedPolygons`는 각 `projectedPolygon()` 호출에서 camera-space polygon의 길이 또는 `x/y/depth`가 변한 경우 증가. **4정점→4정점 clipping도 포함**하며, 완전히 제거된 polygon도 변화로 집계 |
| 표시 흔들림 | `project()` 결과에 logical `shake.x/y`를 더하고, pointer inverse에서 같은 흔들림을 먼저 뺌 |
| SSAA | raw context에는 `pixelScale`을 한 번 적용. 논리 화면 vertex·pointer 좌표에 SSAA를 중복 곱하지 않음 |

`visibleBounds()`는 `mapBounds={left,top,right,bottom}` 지도 사각형을 near 및 viewport 네 면의 homogeneous half-plane과 교차한 world bbox다. viewport 위쪽이 지평선을 넘어도 지도 범위 안의 유한한 bbox를 얻는다. mapBounds가 없고 네 viewport corner 역투사가 모두 유효한 경우에는 해당 inverse bbox를 사용하며, 일부 corner가 유효하지 않으면 `null`이다.

## 3. native 입력·표시 방향·렌더 소비

| 소비 지점 | 현재 계약 | 기존 gameplay 보존 |
|---|---|---|
| native view | draw 직전의 `G.cam`, `VW/VH`, `_ssaa`, `G._camZoom`, `G.mw*T/G.mh*T` 소비 | 새 world 위치·맵 높이·collision 생성 없음 |
| effective zoom | `clamp(settings.zoom * max(0.3,nativeZoom||1),0.25,2)` | 기존 보스 camera framing의 zoom 값을 소비 |
| 지면 pointer | 매 입력 계산에서 현재 view로 projection을 새로 생성. `mouse.x=world.x−G.cam.x+VW/2`, `mouse.y=world.y−G.cam.y+VH/2` | 기존 `mouse+cam−viewport/2` aim 소비식과 native 공격 atan2 유지 |
| invalid pointer | controller `pointerValid=false`; `_syncDruidFinaleMouse()`는 target이 있을 때만 virtual mouse를 갱신 | 임의 actor 이동·공격 성공 주입 없음 |
| gamepad | `_gpActive`이면 기존 mouse sync bypass 유지 | gamepad 전용 입력 계약을 변경하지 않음; 이 기록은 gamepad 실제 교전 검수가 아님 |
| camera interpolation | 렌더는 현재 draw view, 입력은 현재 input view를 각각 소비 | 렌더 중 임시 interpolated `G.cam/P`를 영구 gameplay 값으로 저장하지 않음 |
| 표시 facing | `nativeScreenFacing()`는 actor 위치와 그 world facing의 단위 tangent를 투사한 화면 각도 | Druid/player/일반몹 sprite row·flip에만 소비; actor `facing/vx/vy` 불변 |
| world draw 진입 | `_nativePerspective.begin(X,shake)` 후 adapter context로 ground pass 소비 | gate 밖에서는 기존 zoom/translate/SSAA affine 경로 유지 |
| world reset | `_xWorld()`가 active adapter의 `resetWorld()` 소비 | active world model identity 복원; screen-mode reset과 구분 |
| floor·paint culling | `s1/e1/s2/e2`, `_fillVoidWithFloor`, map paint에 projected ground bounds 소비 | native 지도·길찾기·맵 생성 계약 변경 없음 |
| prop culling / upright | `_worldViewBounds` 소비. `_fdgUpright`가 있는 prop의 **sprite 구간**만 anchor billboard | ground patch·trap·pool·light disk를 통째로 actor billboard로 바꾸지 않음 |
| 일반몹 body | normal 8dir body 및 medium body의 sprite 구간에 `pushBillboard(e.x,e.y)` / `popBillboard()` | 바닥 그림자·telegraph·charge danger는 ground projection 유지. 맵팩의 GH early branch만 body/HP·screenFacing·finally pop 연결; 그 외 slime/early branch의 전체 parity는 미완료 |
| boss body / ground tell | boss body만 지면 anchor billboard. `_drawDruidFinaleTell`은 `withGround()`로 world model identity를 소비 | danger 반경·실제 공격 판정·AI timing 유지 |
| player / weapon | player 지면 anchor billboard 구간에서 기존 local translate/rotate/scale 및 장비 렌더를 소비 | actor 원본 UV 비율과 기존 로컬 pose 유지; 새 원화·새 pose 생성 없음 |
| 독립 thorn/poison | native projectile 위치를 별도 billboard anchor로 소비 | projectile 위치·속도·유도·피해·패링 분류 유지 |
| 씬 projectile | 폐허 숲길의 non-trap/non-mine/non-iceZone/non-blizzard projectile body를 별도 batch로 소비 | projectile phase와 ground zone 구분 유지 |
| 기존 affine GL instancing | 원근 active에서는 기존 X fallback으로 실제 VFX/적 렌더를 소비 | FX를 삭제하지 않음. gate 밖의 기존 GL instancing 경로 유지 |
| raw 복원 / HUD | world pass 끝에서 raw context 복원 후 기존 atmosphere/HUD 경로 | 부모 DOM·기본 HUD를 원근 adapter가 교체하지 않음 |

## 4. adapter state와 선택적 depth batches

| API / 상태 | 정확한 계약 |
|---|---|
| `begin(raw,options)` | camera/center/viewport/pixelScale/shake/mapBounds 소비; model identity에서 frame 시작. 중복 active begin은 오류 |
| `active` | begin 이후 true, end 이후 false인 getter |
| `context` | world scope에서 native local affine model을 별도 추적하는 Proxy. inactive/screen scope는 raw 소비 |
| `save/restore` | model·screen·role과 raw 상태를 함께 저장/복원. end가 남은 save를 정리 |
| model transforms | ground/body vertex 생성 시 native translate/rotate/scale/transform을 적용. camera 원근을 한 개의 전역 affine 행렬로 흉내 내지 않음 |
| `setTransform/resetTransform` | active에서 명시적 native transform reset은 screen scope를 시작하며 restore까지 raw 좌표 소비. world identity 복원은 `resetWorld()` |
| `pushBillboard(x,y,{kind}={})` | world 지면 anchor의 공통 projection scale로 actor local XY를 균일 확대/축소. ground pitch 때문에 body 자체를 세로로 눌러 그리지 않음. optional kindactor/occluder metadata만 cutaway 참여, 미지정은 기존 queue |
| `popBillboard()` | 이전 role 복원; 선택적 deferred batch를 pending queue로 넘김 |
| `withGround(fn)` | model identity와 ground role로 즉시 호출하고 기존 model/role을 finally 복원 |
| `deferBillboards` | begin 기본값 **false**. 폐허 숲길 opt-in만 true를 전달 |
| `actorOcclusionCutaway` | begin/controller 기본false, 맵팩 gate에서만true. deferBillboards도true일 때 kindactor보다 가까운 kindoccluder texture의 투영 영역에 타원 cap을 적용. 수치/helper/metrics/검사/실제 proof는 동측 정본 우선 |
| deferred 대상 | billboard의 projected image triangle, fill/stroke triangle, projected fillText/strokeText. Ground danger/shadow는 즉시 소비 |
| depth 정렬 | `flushBillboards()`에서 anchor projected depth 오름차순(먼→가까운); 동일 depth는 생성 sequence로 stable. 같은 batch 안의 primitive 제출 순서 유지 |
| phase | ROOT의 player/body flush 지점과 projectile phase로 기존 painter 순서를 소비. end는 남은/열린 batch까지 flush |
| style capture | 제출 당시 `globalAlpha`, `globalCompositeOperation`, `filter`, `fillStyle`, `strokeStyle`, `lineWidth`, `lineCap`, `lineJoin`, `miterLimit`, `font`, `textAlign`, `textBaseline`, `direction`, `imageSmoothingEnabled`, `imageSmoothingQuality`, `shadowBlur`, `shadowColor`, `shadowOffsetX`, `shadowOffsetY`, `lineDashOffset`, `fontKerning`, `fontStretch`, `fontVariantCaps`, `letterSpacing`, `wordSpacing`, `textRendering` 저장. `getLineDash()`가 있으면 배열 복사 |
| replay state | raw save/restore 및 명시적 style 복원. native raw.save가 일부 공개 style property를 저장하지 않아도 호출자 style을 복원 |
| queue metrics | `deferredBillboardBatches/Commands`: 제출 누계. `flushedBillboardBatches/Commands`: 재생 누계. `pendingBillboardBatches/Commands`: 현재 잔여량. 부분 batch를 두 phase에서 flush하면 flush batch 횟수는 각각 집계 |
| primitive metrics | `groundTriangles`, `textureTriangles`, `billboardTriangles`, `rejectedNonFinite`, `clippedPolygons`, `unsupportedClip` |

## 5. 기존 GPU positive W와 Canvas fallback

| 계약 | 현재 구현 |
|---|---|
| GPU 선택 | raw `projectiveTextureProjection === true`일 때 image subdivision을 생략하고 원본 planar image quad를 near clip 한 번 후 triangle fan으로 소비 |
| sink vertex | logical screen `{x,y}`, source pixel `{u,v}`, positive `w=1/projected.scale`; actor billboard는 같은 anchor scale이므로 constant W |
| native sink | 기존 `drawProjectedTriangle()` / `_getTex` / `_setTex` / `_uploadCanvasTex` / `_quad` 소비. 새 backend·offscreen 합성·새 texture system 없음 |
| 기존 버퍼 | `_FPV=11`, Float32 vertex stride `44` bytes 유지. 마지막 scalar `p2`/`r.y`에 vertex W 저장 |
| textured kind | 기존 `kind/sh=5`이며 gate가 활성이고 W>0인 경우만 W 소비. 다른 kind/기본 경로는 W=1 |
| vertex shader | 기존 WGSL/GLSL에서 clip position을 `vec4(ndc*W,0,W)`로 출력; native 기본 gate 밖에는 `W=1` 표현식을 사용 |
| UV | `_quad` 이후 source pixel UV를 `img.width/img.height`로 정규화해 덮어씀. `_quad`가 batch를 flush할 수 있으므로 write offset은 호출 이후 계산 |
| triangle index | 세 번째 vertex를 네 번째에 복제. 기존 Uint16 index 경계로 `_qCnt>=16383`에서 flush; `_MQ=65536`을 index 용량으로 취급하지 않음 |
| raster / painter | GPU perspective-correct UV 보간을 소비하지만 새 z-buffer 가림을 도입하지 않음. 선택적 body 가림은 위 native painter depth batch로 소비 |
| Canvas sink | raw clip + source→screen affine texture triangle. Canvas는 native positive W 기능을 주장하지 않음 |
| Canvas adaptive 기본 | seed `maxCellSize=512` world units, `textureTolerance=0.75` logical px, `maxTextureDepth=7`; 큰 extent가 `4` world units 이하이거나 depth 한계면 추가 분할 종료 |
| Canvas error sampling | 네 edge midpoint와 A/C diagonal midpoint의 실제 projection과 affine endpoint 평균 차이를 검사. near visibility가 섞이면 한계 안에서 분할 |
| Canvas sampling 한계 | `maxTextureError`는 accepted finite **sampled error**, 전 픽셀 품질 보장값이 아님. `textureLimitCells`는 tolerance를 넘지만 분할 한계로 수용한 셀 수 |
| legacy seed 옵션 | 명시적 `cellSize`는 `0<cellSize<=64` seed override; 기본 새 GPU path에는 CPU cell subdivision 없음 |
| Canvas path 한계 | quadratic 16구간, cubic 24구간, arc/ellipse 최대 128구간. 단일 concave polygon은 ear clipping; 서로 다른 fill subpath의 hole 규칙은 완전 재현하지 않음. active world `roundRect`는 직사각형 경로로 소비하며 radius 모양을 재현하지 않음 |
| GPU clip 한계 | 기존 GPU raw `clip()`은 no-op. `unsupportedClip`은 adapter clip 호출 수이며 실제 stencil/shape clipping 구현을 의미하지 않음 |
| deferred 한계 | clip 상태 및 미지원 직접 raw API는 재구성하지 않음. gradient·image는 객체 참조를 유지하므로 flush 전 mutable canvas 내용 변경은 parity 검수 대상 |

adapter의 sampling/culling 내부 수치도 원근 표현 계약에 포함한다.

| 적용 위치 | 현재 상수 / 조건 |
|---|---|
| raw texture on-screen 검사 | viewport 밖 허용 pad `2` logical px |
| Canvas source UV affine 계산 | determinant가 비유한 값이거나 절댓값 `<1e−10`이면 triangle 생략 |
| concave path 정리 | 연속 중복 거리 `<=1e−8` 정리, 마지막/처음 중복 거리 `<1e−8` 정리; ear convex 판정 `1e−10`, 내부 판정 허용 `−1e−9`; loop guard `정점 수²` |
| stroke segment | 길이 `<=1e−9`이면 생략; half-width는 `max(0,Number(raw.lineWidth)||1)*max(model축 길이)/2` |
| arc/ellipse sampling | `ceil(abs(sweep)*max(rx,ry)/12)`, 최소 `1`, 최대 `128` 구간 |
| quadratic / cubic | 각각 `16` / `24` 고정 구간 |
| Canvas image bounds 역행렬 | model determinant 절댓값 `>1e−12`인 경우 pre-seed local bbox로 역변환 |
| adaptive 분할 종료 | depth `<7`이고 큰 world extent `>4`일 때만 추가 분할; explicit maxTextureDepth는 정수 `0..7` |
| ground inverse 지평선 guard | `den<=1e−12`이면 null; 다른 비유한 좌표 및 near 밖도 null |

## 6. 공개 UI와 저장 경계

| 항목 | 계약 |
|---|---|
| panel | `#fdgNativePerspectivePanel`, 원근/평행 비교 selector, yaw/pitch/distance/zoom slider, `카메라 초기화` |
| control events | controller 내부 settings 변경만 수행. 최근 camera-control event 최대 `64`개 |
| status timer | `200ms` 간격으로 viewport·pointer validity 표시; `uninstall()`에서 timer와 panel 제거 |
| 초기화 | 공통 기본 + 호출자가 전달한 initialCamera로 복원. 폐허 숲길 initialCamera는 그 씬 SSOT 우선 |
| 저장 | `transient-no-storage`; native camera UI persistent write **0**. OPT·sharedStorage·native save/API를 쓰지 않음 |
| 기존 QA storage | r4 helper가 기존 자체 key `fdg.qa.dark-druid.encounter.r4`를 읽을 수 있음. memory setItem과 persistent write는 별개이며 기존 공개 QA 설정 저장 기능 자체는 이 카메라가 추가/삭제하지 않음 |
| 실제 기록 | 아래 두 ready snapshot 모두 persistent `writes=[]`, `successfulWrites=0`. 재열기 시 camera UI는 초기 camera로 복원 |

## 7. 실제 화면 스냅샷과 검사 증거

증거 루트 A:

```text
/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-native-perspective-first/
```

증거 루트 B:

```text
/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-ruined-forest-playable-first/
```

| 증거 / 장면 | 실제 관측 | 인정 범위 |
|---|---|---|
| A `gpu-first-paused.json` + `.png` | WebGPU, `1280×720`, pixelScale `1`, ready/paused, FPS `120`, draw `1.706910140801332ms`, texture triangles `56`, ground triangles `363` | 기존 v3 Druid camera consumer 한 정지 장면. natural AI 전투 FPS·전체 맵·모든 장치 성능 보장 아님 |
| 같은 snapshot camera | yaw `0`, pitch `.85`, distance `1400`, near `32`, authored zoom `1`, effective zoom `.46307730303778716`, center `(2763.5546666666664,2226.512)` | map `128×108`, T `40`의 이 카메라 snapshot |
| B `ready-fullbody.json` | WebGPU, `1280×720`, FPS `116`, draw `3.716899809168698ms`, texture `74`, ground `143`, deferred batches `11`, commands `32`, pending `0` | 폐허 숲길 시작 준비 장면. `running=false`, `completed=false`, 공격 피해·parry/dodge 기록 `0`; 실제 교전 성공 증거 아님 |
| 같은 scene camera | yaw `0`, pitch `.92`, distance `2600`, zoom `.82`, near `32`, center `(1420,2740)` | 별도 map `72×84`, T `40`, 물체 `38`, 실제 NORMAL index `5`/multiplier `1`/Lv `1` 준비 상태 |
| A `stale-first-reload.json` | 보존된 이전 fixed64 경로: texture `10340`, ground `375`, FPS `28`, draw `33.934752902646295ms` | stale reload의 이력. 최종 GPU 파일과 동일 프레임 benchmark로 비교하지 않음 |
| A `adapter-adaptive-math-receipt.json` | 단일 `5120×4320` 바닥 CPU 수학 fixture: adaptive `2382` triangles / fixed64 `4970`; max sampled error `.749589696854656px`, limitCells `0` | 실제 GPU framebuffer·전투 FPS 측정이 아닌 순수 소비 수학 fixture |
| A `yaw03-pointer-paused.json` | 별도 yaw `.3` 스냅샷: `101FPS`, draw `2.4428059664438853ms` | 회전/클릭 상태 참고; FPS 범위를 다른 장면과 합치지 않음 |
| A `orthographic-paused.json` | 별도 평행 비교 스냅샷: `105FPS`, draw `1.8974811530133828ms` | 평행 비교 장면만 |

서로 다른 파일·시점·장면의 값으로 동일 프레임 성능 개선 비율을 만들지 않는다. ready 상태에서 업데이트 비용이 거의 0인 것은 정지 상태의 결과이며, 실제 natural AI 교전 중 renderer parity와 frame budget 검수가 별도로 필요하다.

| 검사 | 고유 case 수 / 상태 | 실제 범위 |
|---|---|---|
| `tests/native-world-projection.test.mjs` | **22 unique PASS**, 동결 | 투사/UV/near clip/4→4 counter/foot ratio/inverse/SSAA/state/ground immediate/deferred depth·style·save balance |
| `test/fdgNativePerspectiveIntegration.test.mjs` | **10 unique PASS**, 동결 | exact loader gate, input inverse, native sync, existing GPU sink+W contract, raw restoration, 실제 fallback seams, boss ground tell/독립탄, transient UI, screen-facing 원본 actor 불변 |
| `integration-tests/transcript-derived-summary.json` | 이력 포함 | 초기 loader/harness/oracle 실패와 수정, affected/new case만 재검사한 결과를 구분한 요약이며 raw process log라고 부르지 않음 |
| A `adapter-tests-17-pass-prior.txt`, `adapter-clip-counter-1-pass.txt`, `adapter-scene-queue-4-pass.txt` | 각각 이전 17 / 신규 1 / 신규 4 stdout | 서로 다른 검사 이력을 22 unique로 집계; 반복 실행 수를 기능 수에 합산하지 않음 |
| 폐허 숲길 추가 검사 | ROOT 소유 / 별도 씬 SSOT | 이 문서의 22+10에 임의 합산하지 않음 |

기술 검사 PASS는 visual PASS 또는 모델/애니메이션 승인으로 대체하지 않는다.

## 8. 하나의 scoped remaining gap

| gap id | 상태 | 닫기 위한 실제 검수 |
|---|---|---|
| `NATIVE_PERSPECTIVE_RENDER_PARITY` | **OPEN / VISUAL VERDICT: RETOUCH** | 실제 native 게임의 카메라 변경·자연 AI 교전에서 fog/burst/ambient/pose 및 각 renderer 소비가 ground/body/world anchor와 일치하는지 검수 |

이 gap 안에서 남은 확인 범위를 다음처럼 관리한다.

| parity 항목 | 현재 한계 / 필요한 근거 |
|---|---|
| fog / grading | world 종료 후 기존 atmosphere 및 별도 fog canvas 경로를 소비한다. ground inverse와 같은 원근 공간을 모든 fog 내부 camera 계산이 소비한다고 선언하지 않음 |
| burst / ambient | 독립 GL affine batching의 X fallback은 연결했으나 모든 legacy burst·별도 overlay·ambient actor early branch의 완전한 화면 일치는 미확정 |
| pose / body | 공통 foot billboard와 projected facing을 연결했지만 기존 source art의 crop/비율/pivot/pose 품질을 신규 모델 승인으로 해석하지 않음 |
| painter / phase | opt-in deferred body depth가 native phase별로 소비되는지, prop 앞뒤 이동과 projectile phase에서 가림이 일치하는 실제 교전 근거 필요 |
| clip / path | GPU clip no-op, compound hole fill 및 미지원 직접 raw API가 있는 소비 지점은 실제 화면으로 한계를 확인해야 함 |
| mutable canvas | deferred primitive의 source canvas/gradient가 제출과 flush 사이 바뀌는 경우 내용·style parity를 확인해야 함 |
| renderer 비교 | WebGPU ready 스냅샷은 확보. 동일 source·camera에서 WebGL2/Canvas2D 실제 교전 parity까지 완료한 것으로 해석하지 않음 |

출시 판정, 승인된 신규 Druid body, 24장 원화와 24FPS motion은 각 제작 SSOT의 별도 승인 대상이다. 이 카메라 문서의 OPEN gap을 완료로 바꾸거나 새 소스 승인으로 치환하지 않는다.

## 9. 동기화·백업 기록

| 항목 | 기록 |
|---|---|
| 문서 수정 범위 | 이 신규 문서만 작성; 동결된 코드/검사 재실행·commit 없음 |
| 작성 전 백업 | A `backup-worker/docs__engine__FDG_NATIVE_PERSPECTIVE_20261012.md.absent` |
| docs 전체 rg | A `docs-rg-native-perspective-authoring.log`, 작성 전 관련 keyword `770`행 |
| docs 전체 literal grep | A `docs-grep-native-perspective-authoring.log`, 작성 전 같은 keyword `770`행 |
| 검색어 | `fdgPerspective`, native adapter/controller 이름, remaining gap id, `createWorldProjection`, `viewCamera`, 원근/투사/billboard/homogeneous, 미승인 body 상태, 24FPS/24프레임 |
| 다른 관련 문서 | engine/runtime/interface/world-camera/기존 Druid 및 캐릭터·애니메이션·최적화 문서의 동기화는 ROOT 소유. 이 작성자는 다른 변경을 되돌리거나 보호된 `2_3 돌진+패링+방패시스템` 문서를 수정하지 않음 |

## 2026-10-12 후속 · 폐허 숲길 한 씬 parity 마감

| 항목 | 현행 범위 |
|---|---|
| NATIVE_PERSPECTIVE_RENDER_PARITY | **CLOSED / VISUAL PASS — ruined-forest-first 한 씬의 관측 범위**. 위 초기 OPEN 표는 첫 consumer 인수 이력이며 모든 backend/전체 엔진을 기다리는 이 씬의 gate로 사용하지 않는다 |
| 실제 마감 | 수정 후 native NORMAL Lv1 자연 AI/ghoul/revive 종료→동쪽 공간→북쪽 통로→살아 있는 P의 실제 출구65px조건 완료. raw/§23는[씬 정본 후속](FDG_RUINED_FOREST_PLAYABLE_20261012.md#후속-route-close--현재-한-씬의-제작-마감) |
| production 변화 | 기존m_c1be54,51→65,51와m_c1bn48,12→63,12(둘scale1.7) 및같은scenecachequery2곳뿐. nativeprojection/QA/공통math/adapter/기존shader/전투규칙변경0 |
| 실제 visible 층 | 새동/북/교전프레임에서ground/body/실제shot/burst/ambient/fog의명백한가림·앞뒤·위치이탈없음. 이범위에서는추가consumer수정0 |
| 검사 경계 | 새nativekeepAR/crop+RLEfootprint검사2PASS/modulecheck/source-inverseSHA. 이전22+10+scene8 및Studio55재실행0 |
| 미확대 | 기존GPUclip/path/mutablecanvas/다른backend의구현한계는그대로기록한다. 신규source모델/24장실제캐릭터/전체엔진출시인수를의미하지않음 |
