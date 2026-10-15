## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

# FDG WorldProject v1 · 독립 지역 전환 / Studio v0.8

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

기준 2026-10-10. 두 CPU 입체 지형의 **ENGINE_FIXTURE** 전환·지역 상태·독립 저장을 구현했다. 실제 CH1 지역 등록0/전환0. 본편 맵·진행·세이브·PNG·nav·LOCK 변경0. 동일 World의 지도·graph·실제 waypoint 발견/활성/이동은 [v0.8 정본](FDG_WORLD_MAP_WAYPOINT.md)에 구현/인수했다. 시험 캐릭터/기하 인수이며 게임용 모델·완성 환경·GPU/native/전투/SFX 완성을 뜻하지 않는다.

## 파일 / 실행 경계

| 파일 | 책임 |
|---|---|
| `engine/fdg/world-project.js` | `worldVersion:1` 검증·강한 참조·unknown JSON 보존·독립 Store·2지역 fixture |
| `engine/fdg/world-runtime.js` | 기존 FDGRuntime 위의 출구 진입 감지·진행 입력·scene entry·capture·지역 상태. 자체 RAF/listener/timer0 |
| `engine/fdg/runtime.js` | `captureSceneState`·`enterScene`·`setSceneExits`·출구 표시. 기존 입력/60Hz/CPU terrain과 기존 scene 자원 정리 재사용 |
| `engine/fdg/map-world-pilot.js` | 실제 corrected-v2 문서2개의 참조 정규화. 원본 설명/ID/graph/height 보존, scene/arrival null 및 생산 등록0 |
| `tools/fdg-studio/world-panel.js` | 지역 전환 탭·지역/장면 참조 목록·속성·진행 관문·한걸음·World 저장/재열기·이력. 고정 DOM listener16, 별도 RAF/timer0 |
| `test/fdgWorldProject.test.mjs`·`fdgWorldRuntime.test.mjs` | 신규 검증7+소비자10=17개. getter 변경 후 관련2개 재검증은 새19개로 합산하지 않음 |
| `test/fdgMapWorldPilot.test.mjs` | 참조 보존·pending 정상 실패·필수 입력 검사 신규3개 |

같은 `server.cjs`/3333의 Studio를 사용한다. 현행 Studio 진입/CSS `?v=0.9.1`, WorldPanel/map-view `?v=0.8.3`, 변경 World core `?v=0.8.2`, 기존 runtime `?v=0.7`. 기존 project `?v=0.6`·terrain panel `?v=0.6.2`는 그대로다. 원본 게임 서버/기존 suite 재실행/새팀/외부 포맷 자동 병합0.

## 스키마 / 상수

| 필드 / 상수 | 값·검증 / 적용 위치 |
|---|---|
| `WORLD_VERSION` / `worldVersion` | 정확1. 일반 `schemaVersion:1` FDGProject와 별도 문서 |
| `id` / `WORLD_LIMITS.idLength` | 비어 있지 않은1..120자·제어문자/예약키 제외. scene/area/entrance/exit/transition/progress ID도 동일 |
| `name`, area.name/stageRef, scene.name/sourceRef | 비어 있지 않은 문자열. `stageRef`는 출처 참조 문자열이며 `areaKey`를 대체하지 않음 |
| `scope` | `ENGINE_FIXTURE` 또는 `MAP_PILOT` |
| `.scenes[]` / limits.scenes | 0..8, `{id,name,project:FDGProject\|null,sourceRef?}`. nonnull은 validateProject geometry=false |
| `.areas[]` / limits.areas | 1..16, `{areaKey,name,stageRef,sceneId,entrances,exits}`. sceneId는 등록 scene ID 또는 null |
| `.entrances[]` / limits.entrances | 지역당0..16, `{id,position:[X,Y,Z]\|null,camera:{x,y,follow}\|null}` |
| `.exits[]` / limits.exits | 지역당0..16, `{id,position:[X,Y,Z]\|null,radius,transitionId}` |
| `.transitions[]` / limits.transitions | 0..32, `{id,from:{areaKey,exitId},to:{areaKey,entranceId},gateKey,enabled}` |
| 참조 | from/exit·to/entrance는 실제 등록 항목을 가리켜야 함. exit.transitionId와 transition.from은 양방향 일치. gateKey는 progress의 키 또는 null |
| 좌표 / worldSize / maxHeight | XYZ finite, X/Y0..8000px, Z0..1024px. camera x/y0..8000·follow boolean |
| radius / minPortalRadius / maxPortalRadius | 8..160px |
| `.progress` / limits.progress | 최대32키·각 boolean. gateKey=null이면 관문 없이 enabled만 검사 |
| `.state.activeAreaKey` | 등록된 areaKey |
| `.state.regions[areaKey]` | 등록 지역별 `{visits,data,actorPosition?,camera?}`. visits 0..Number.MAX_SAFE_INTEGER 정수, data 유한 plain JSON |
| unknown JSON / 검사 상한 | 보존. 예약키 `__proto__/prototype/constructor`, symbol/accessor/non-enumerable/비평범 객체/순환/sparse array/NaN/Infinity 제외. depth64·검사 항목1,000,000 상한 |
| `WORLD_LIMITS.fileBytes` | compact UTF-8 JSON 최대8×1024²=8,388,608 bytes. 파일 import와 저장 복원 raw byte에도8MiB 상한 |
| `WORLD_LIMITS.history` | 최근80개의 변경, 유효하고 JSON이 달라진 작업만 기록 |
| `WORLD_LIMITS.portalHeightTolerance` | 실제 actor Z와 exit Z 차이≤16px, XY 거리²≤radius²+1e−9. Z 허용에도1e−9 오차 |
| `WORLD_LIMITS.events` | runtime 최근32 event. sequence/type/result·transition/from/to 등, 자체 timer 없음 |

Store getter와 runtime world/capture/events는 독립 복제다. `change/replace/undo/redo`는 변경 boolean을 반환한다. invalid 또는 동일 JSON은 history/Signals를 바꾸지 않는다. Store의 changed는 `{project,label}`이다. 필드 미확정 null은 구조상 허용하고 런타임 진입에서 정상 실패시킨다.

## 실제 전환 / 수명

| API / 순서 | 계약 |
|---|---|
| `WorldRuntime.open({restore:true})` | active 지역의 scene/첫 entrance 검사. 저장 actorPosition이 있으면 actor/camera 복원·visits 유지. 없으면 entrance 도착·visits+1. 시작 시 이미 출구 안이면 latch하여 자동 왕복 방지 |
| `observe()` | 같은 FDGRuntime.onStats/render에서 호출. outside→inside 실제 이동 edge만 전환. busy/disposed/not-open/outside-exit/latched 결과를 구분 |
| 실패 전 검사 | disabled→gate-closed→unresolved-scene→unsupported-scene/invalid-scene→unresolved-arrival→visit-limit 등. 단위별 detail 제공. 미해결 대상은 source pause/release/active/방문 commit 전에 거절 |
| 지원 scene | 이 단위는 terrainScene CPU geometry만. null/이미지 sprite/rigScene source는 정상 실패. 이미지 preload·lease·실패 복구/제품 포맷 bridge는 후속 |
| 성공 순서 | busy 잠금→owner.pause→source scene/actor/camera capture를 후보 world에 기록→owner.enterScene(target,{arrival,camera})→target state capture→activeAreaKey/target visits+1→latch→world commit/onChange/onStatus. 먼저 유효성 확인 후 기존 source terrain buffers/meshes를 정리하고 target consumer 초기화 |
| `FDGRuntime.enterScene` | 유한 XYZ·카메라·프로젝트·arrival 원형 타일 통과를 setProject 이전 검사. target actor arrival 입력·기존 setProject/load/정리·camera clamp 소비·정지 표시. entrance 배치는 정상 진입 API이며 시험체를 출구로 teleport하는 검증이 아님 |
| `captureSceneState()` | `{project,actorPosition:[x,y,z],camera}`. 현재 terrain/rig 시간·기하·unknown metadata capture. World는 자체 프로젝트 state와 분리하여 기록 |
| `walk(direction)` | 공개 한걸음→같은 owner.walkTerrain keys/step/update. .1초·6×1/60틱, 기본 speed156에서15.6px. onStats가 먼저 기록한 gate rejection/transition을 중복 latched 결과로 덮지 않음 |
| 진행 / 지역 상태 | `setProgress(key,bool)`·`setRegionData(areaKey,data)`는 capture 후 갱신·onChange, busy 때 거부. 관문 변경은 latch를 리셋하지 않으므로 출구 밖→재접근 필요 |
| 정상 왕복 | 새 지역마다 지정된 entrance로 입장. 이전 지역에서 마지막으로 떠난 좌표는 그 지역 state에 보존하지만 왕복의 arrival로 대체하지 않음 |
| busy / dispose | pending 1개. open/observe/walk/progress 변경 중복 차단. dispose는 generation을 폐기·owner/callback 참조 정리·늦은 completion의 world commit/callback 차단. 이미 owner에 위임된 async entry 취소/rollback 보장은 없음 |
| owner 수명 | World 자체 input/RAF/timer0. FDGRuntime만 입력·시간·resize/렌더 소유. pagehide 실제 종료 panel/controller/store 정리; BFCache에서는 기존 owner pause/resume 처리 |
| 출구 표시 | setSceneExits 최대16·radius8..160. CPU terrain XYZ 투영, radius×zoom·세로sin(pitch); overlay stroke2px/font11px·보이는 출구당Canvas calls2·open#76c3b0/closed#dfbb79. scene 교체/dispose 시 제거. depth collision/생산 portal mesh가 아님 |

`latestResult.ok=false`인 gate rejection 후에도 opened=true이고 이동/정지는 계속 가능하다. `opened`는 open 전false·성공true·disposefalse. 모델·height·game combat 수치를 바꾸는 진행 관문이 아니며 어택 티켓을 추가하지 않았다.

## 제작 / 독립 저장

| 입력 / 동작 | 계약 |
|---|---|
| 지역 전환 탭 / `world-create` | 현재 FDG 기본/기존 terrain geometry를 복제하여 두 ENGINE_FIXTURE 장면을 생성. 본편 등록/원본 asset 복사0 |
| 지역 목록 / `world-area` | 속성 편집 대상만 선택. live active 지역을 변경하지 않음. 현재 접속 ●, 다른 지역 ⇄. World 전용 목록에는 일반 FDG 리소스를 섞지 않음 |
| 속성 | 이름/stageRef/sceneId·entrance XYZ/기본/고정/추적 camera·exit XYZ/radius·gate/enabled·지역 memo 편집. stable areaKey/참조 ID는 표시. scene 리소스 데이터는 geometry 제작/import 문서에서 제공 |
| 상태 메모 | 지역 data가 object면 기존 키 보존하고 memo 수정. object가 아니면 previousData로 보존. 실제 문자 입력 확정(change)으로 적용 |
| `fdg.studio.world.v1` | 전용 localStorage. 일반 `fdg.studio.project.v1`, 리그 키, 본편 save/slots와 분리. 페이지 시작 복원하되 World 탭 선택 때 scene 소비 |
| 저장 | pause→live scene/actor/camera capture→구조 검사→명시 저장. quota 오류 표시·JSON 대안. 별도 자동 덮어쓰기 없음 |
| import/export | `worldVersion` 자동 식별·8MiB World /4MiB FDG. World 탭 import는 World 형식만. `${world.id}.fdg-world.json`; World는 compact UTF-8 JSON과 동일 검토 dialog. 일반 FDG만 기존 pretty4MiB 초과 compact fallback. invalid import는 기존 문서 보존 |
| 재열기 | 저장 active 지역/actor/camera/progress/data/visits 복원, simulation time0초. active World 탭 재클릭은 reload하지 않아 live 위치를 보존 |
| 편집 / 플레이 | 기존 Play/정지/1틱 재사용. region 전환 뒤 정지. busy 때 걷기/저장/import/이력 비활성. 실행 중 정의 편집/진행 입력 비활성. source 탭 복귀는 World capture·controller 정리 후 일반 FDG scene 재연결 |
| 최적화 | World 탭 기존 이미지/입자6초 측정 패널 숨김·canStart=false. CPU geometry의 별도 실제 GPU/VRAM/본편 성능 인증 없음 |

## ENGINE_FIXTURE 수치 / 실제 인수

`cx=(map.start.x+.5)×40`, `cy=(map.start.y+.5)×40`; 현재 default4020/7420. 기존 height geometry를 두 scene으로 복제하며 source 문서는 수정하지 않는다.

| 항목 | 값 / 실제 관측 |
|---|---|
| area / stageRef / scene | engine_fixture_a / ENGINE_FIXTURE/A / scene_a, engine_fixture_b / ENGINE_FIXTURE/B / scene_b |
| entrance | 양쪽 `arrival:[cx,cy,0]`, camera null=장면 기본값 |
| A exit / transition | to_b:[cx+62.4,cy,0]·R12·a_to_b→B/arrival·fixture_gate_open=false 기본 |
| B exit / transition | to_a:[cx−62.4,cy,0]·R12·b_to_a→A/arrival·gateKey=null |
| 카메라 / 플랫폼 | 양쪽 zoom.7, A 기존 terrain yaw 보존, B yaw−.45rad. B platform color#A58CBA |
| 실제 이동 | 동쪽4걸음 X4035.6→4051.2→4066.8→4082.4: gate-closed·A방문1 유지. 안에서 관문 true+1틱이어도 전환0. 서쪽1걸음으로 나와 동쪽1걸음 재접근→B4020/7420/Z0·B방문1 |
| 실제 왕복 | B 서쪽4걸음 X4004.4→3988.8→3973.2→3957.6의 출구→A4020/7420/Z0·A방문2/B1. entry마다 clock0 |
| 저장 / 재열기 | A/B 메모 각각 `A 지역 관문 시험 완료!`/`B 지역 보관함 확인!`·gate true·visits2/1 보존. A 한걸음 후X4004.4의 저장/reload/live 복원 확인·time0초. active 탭 재클릭 X4004.4 동일 |
| 작은 창 | 685×677의 문서도685×677, World toolbar685×60·canvas685×400. 새 탭/한걸음/관문/출구 가시성 확인 후 viewport override 해제 |
| 테스트 | 새 World17개+MAP3개=20고유 PASS. getter 관련 기존 새단위2개 추가 재검증. 이전 완료 suite 재실행0 |
| 실제 입력 경계 | Node fake Canvas keydown/up와 실제 browser 한걸음 버튼 검증 분리. browser held-key 성공 주장0. 직접 player 위치 변경0 |
| export 확인 한계 | 버튼 후 내보내기 상태 표시는 확인. browser download event 대기는 timeout으로 bytes 인수 미수행. 로컬 save/reopen은 실제 확인. 최초 fill/Tab만으로 memo commit되지 않은 시도는 성공으로 세지 않고 실제 문자 입력/blur로 확인 |
| 오류 계측 | 새 기능 마지막 console error0, sceneId null 정상실패/undo→liveX4004.4 복구를 실제 확인; pageerror/404 별도 이벤트 측정은 미수행. 단순 상태/기술 PASS를 완성 환경 visual PASS로 세지 않음 |

증거 디렉터리 `/Users/fordeargamers/.codex/visualizations/fdg-world-transition-20261010`: fullbyte/부재/actualparent 백업·world-own-hunks·Node 로그·browser-movement.json·browser-save-reopen.json·world-created/gate-closed/arrived-b/roundtrip-a/world-compact 캡처·map-reference.fdg-world.json·map-normalization-result.json. §23 항목을 포함한 최종 engine-review.md를 따른다.

## MAP corrected-v2 첫 소비 / 미확정 항목

| 원본 필드 | 정규화 / 지원 경계 |
|---|---|
| world-connections.corrected-v2 / height-ground-nav.corrected-v2 | 정확 두 JSON만 읽기. sourceDocuments 전체 unknown/설명 보존. 외부 composition/PNG/game/nav/LOCK 자동 열기·변경0 |
| source stageId | `si0/stage0`, `si1/stage1 (_CH1S1)` 그대로 stageRef. 자체 map_reference_stage0/1은 MAP_PILOT 참조 ID이며 본편 생산 areaKey 등록이 아님 |
| source scene 문자열 / text resources | sourceRef로 보존, project:null. scene1 vista/basin 설명은 실제 리소스 manifest를 대체하지 않음 |
| source 8구역 / DERIVED graph | sourceDocuments metadata에 보존. 생산 지역·승인된 연결 edge로 등록0 |
| CH1-1 source start100.5/185.5 / exit99..101,7/gateY5 | 원본 수치를 metadata에 보존. 물리 XYZ/camera 입구 계약 미확정이라 normalized arrival null |
| CH1-2 basin100/122 | 분지 중심·설명 보존. 도착점으로 발명하지 않고 normalized arrival null |
| source 진행 | REGION→gate→exit→boss arena→bosskill→stageCleared→nextStage→si1. boss 중간 scene/관문의 실제 계약 없이 직접1-1→1-2 transition 추가0 |
| source 높이 | 기존 smoothstep0..1 반환값·147/98·legacy147/97·반경18×9·서쪽 ramp·절벽 band. 물리 단위 미확정. fixture64px/120px와 임의 환산0 |
| normalized pending | 구조 검증ok, runtime.open unresolved-scene. source owner pause/entry/capture0 및 visits0. source에 null 필드가 있었다고 잘못 보고하지 않음 |
| 다음 MAP 조건 | 정확 entrance XYZ/camera·resource manifest·bosscarena/진행 handshake·logical-height 물리단위·ground/nav 소비·역방향/재입장 규칙을 확정. 실제 MAP의 graph/minimap/waypoint 등록은 미구현(ENGINE_FIXTURE UI는 v0.8 구현) |

현재 실제 CH1 등록/전환 인수0. PENDING/null 참조만으로 생산 양방향 소비 준비 또는 완료 판정을 하지 않는다.

## v0.8 동일 지도·웨이포인트 후속

[FDG_WORLD_MAP_WAYPOINT](FDG_WORLD_MAP_WAYPOINT.md)이 optional64 waypoint/R8..160/Ztol16·진행/실제route/도착preflight·작은getViewState·map/graph UI·UTF-8 215364byte 왕복·21신규PASS의 정본이다. 이전20 및 getter2결과는 당시 기록이며 새총계로합산하지 않는다. 실제CH1등록/전환0과async owner entry cancel/rollback·imagelease미인수는 유지한다. 브라우저다운로드파일의filesystembytes는계속미인수이며 새공개textarea JSON byte왕복만별도로인수했다.


## CH1-1 source data 첫 검토 · v0.9 당시 기록

당시 원본 검토/이미지 helper만 구현했고 project/world 생성·실제CH1 렌더/이동은0이었다. 이 검사 완료기록을 다시실행하지 않는다. native revision-v2에서 기존 collider85 표기는 visual placements85로 정정됐다. 원본 논리높이0..1과 명시 엔진 환산은 별도이며, 현재 실행 구현과 미제출source는 아래 v0.14 미리보기와 별도 물리 실행 정본을 따른다.

## CH1-1 원본 이미지·흙 바닥 제작 미리보기 · v0.13 완료 동결

| 구현 / 상태 | 계약 |
|---|---|
| 실제 제작 흐름 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md): 기존3333 exact 승인 props9+soil1=10 PNG·native85 imageLayers 유지·polygon-only 이동·owner60Hz/camera·전용 저장/재열기 |
| 바닥 | 승인 soil ground_dark_soil.png 실제1024×1024 fullcrop; ENGINE_AUTHORING origin[0,0]/repeat1024×1024/opacity1·원 brightness.85/saturation.48. 원53 tile-corner×40 polygon clip 후 ground→props/actor. visible repeat 최대64, native UV UNKNOWN·나머지 mask/litter/commonSkin3 PENDING |
| 실제 결과 | 기존4020,7410에 바닥 설치→공개북쪽10px→4020,7400·camera4020,7400/followtrue·저장/다운로드JSON/reload 복원. 현재viewport 원본4/85·native 캐릭터·흙 표시. START4020,7420 유지 |
| 경계 | UNADOPTED; 실제collision/cliff/logicalHeight SOURCE_PENDING·height:null·actualObjectColliderCount:null·native anchor/crop/origin/START심볼UNKNOWN. World/스킬/VFX 차단. sourceScene 물리/production 인수는 대기 |
| 검증 / 시각 | 새ground contract 수정후4/4 + runtime 첫4/4 =8고유PASS; 첫contract helper import누락0/4 실패/수정 증거 보존. 완료13/5·15/23/16 등 이전suite 재실행0. 현재captured error0·preview VISUAL RETOUCH / production FAIL. 실전FPS/VRAM/Windows 미측정 |


## CH1-1 정확 높이·경사로·절벽 제작 미리보기 · v0.14 동결 이력

| 구현 / 상태 | 계약 / 실제 인수 |
|---|---|
| 정본 / 입력 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md); optional sourcePreview.heightPreview에 실제 source-v4 full envelope·nativeParams11·exactEvaluator3개를 소비. tx=worldX/40, ty=worldY/40 연속좌표; sample tile은 셀인덱스, px는 셀센터. source 논리0..1은 원본 물리Z가 아님 |
| 작성 환산 / 이동 | ENGINE_AUTHORING scale64/offset0, engineFootZ=offset+logical×scale; maxStep16/maxSlope.75. 원 polygon nav + 정확 point band + 엔진 보수적 원형발 gate, 서쪽 ramp 원 전체 포함 시 통과. actor 저장XY2·height:null 유지, 내부Z만 파생. follow cameraY=actorY−engineFootZ |
| 바닥 / 부하 | 기존 승인soil1·props9/배치85 유지. owner-local 원soil 높이 cache1720×944·2024삼각형 최초 build1회, visible frame1draw/offscreen0. 각축2048/총4194304pixels 상한, flat repeat64+cache1→groundDrawCalls65 상한; 현재 nominalRGBA6494720bytes, disposepixels0. 원53/nav/PNG 재작성0 |
| 실제 경사로 QA | 별도 QA actor4990,3940→공개동쪽10px×23=5220,3940·원식 logical0.5747500000000001/Z36.784000000000006(실제UI0.5748/36.78). offset1 편집→원논리 동일/Z37.784000000000006(실제UI37.78),0복원+20회=5420,3940·logical1/Z64·camera5420,3876/followtrue. 저장/다운로드JSON/reload 복원. START4020,7420으로부터 도달 검수0 |
| 실제 절벽 QA | 별도 동쪽6670,3940→서쪽3회6640,3940/Z0; 4번째6630 시도 source-cliff-band 차단/XY·Z 유지. 저장/JSON/reload XY6640,3940/Z0. blockedReason은 현재 이동 결과로 저장하지 않음 |
| UI / 첫 실패 | heightReady=선택heightPreview+런타임 logicalHeight/engineFootZ finite. 새project/이전runtime 설치 전환의 toFixed 오류를 수정. entry studio.js?v=0.14.1, 높이 모듈·관련 import0.14.0. 환산 편집 시 heightEngineAuthoredInputSnapshot/heightRuntimeObservation/camera도 동기화. 수정 후 해당 entry captured error0 |
| 신규 검사 | height contract 첫4/4PASS + runtime 첫2/4PASS(검사용 긴sweep·잘못된loadAssets 호출2FAIL), fixture/public load 수정 후 affected2/2PASS = 신규8고유PASS. 기존 preview13/server5/soil8/15·23·16·원9PNG/source/Git 동결 검증 재실행0 |
| 경계 / 시각 | logicalHeight/cliff SOURCE_CONSUMED, 실제 object collision SOURCE_PENDING·actualObjectColliderCount:null/UNKNOWN. sourcePhysicalZClaim:false·native UV/anchor/crop·다른ground3 PENDING. World/스킬/VFX/본편 물리/production 미인수. 절벽 장식이 캐릭터를 가림·높이 시각 가독성 보정 필요: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 새 증거 | 외부 engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-mid.png·actual-height-ramp-reopen.png·actual-height-cliff-blocked.png·실제 export2개·신규검사/ownedpatch/checkpoint/§23 engine-review.md. 60FPS/VRAM/Windows 성능 미측정 |


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
| pit_poison / 충돌 수 | native-hand-13-pit_poison circle center[6500,5580]/radius80px. 원 기존13(11circle+2ellipse)+새1circle=수동14(12circle+2ellipse). sourcePreview.status.collision SOURCE_SUBSET_CONSUMED, supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null, navScope polygon+exact-native-hill-band+source-object-subset/sourcePending=[collision-assembly]. 화면 수동 배치 충돌14영역·전체 연결 대기; 전체 count/visual85와 identity UNKNOWN |
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
