# FDG 수동 충돌 v7 delta 계약

2026-10-20 P3-001 갱신. 같은 CH1-1 제작 장면의 원본 수동 충돌 subset에 MAP v7의 두 타입 metadata 확정을 적용한다. MAP-021의 `pit_poison` 타원 계약은 이 worktree의 `game.html:18166` 배치·`18407` metadata를 따른다. 후보 JSON 생성까지의 정본이며 실제 입력·설치·시각 검수는 별도 owner gate이다. 이전 v0.16 subset13 종주와 2026-10-11 원형 v7 검수는 동결 이력으로 보존한다. 최신 검증 수치·재추출·Godot 인수 상태는 [P3-001 보고서](orders/reports/P3-001_REPORT.md)를 따른다.

| 항목 | 현행 계약 |
|---|---|
| 구현 | `engine/fdg/map-source-adapter.js`의 `applyMapSourceHandColliderDelta` |
| source 입력 | 역사 입력은 `MAP/ch1-1.hand-meta-two-types.delta-v7.json`; full unknown JSON 보존. 이 원본 파일은 저장소에 없으므로 P3-001의 최신 계약 fixture·Godot 직접 재추출과 구분 |
| 역사 source completionId | `CLAUDE8-MAP-WORLD-SCHEMA-EXPORT-V4-20261010-1851-MAP-RESULT`; 최신 재추출 producer 증거로 재사용하지 않음 |
| 역사 source control | `CLAUDE8-MAP-SAME-HAND-META-TWO-TYPES-V7-20261011002408`; 최신 재추출 producer 증거로 재사용하지 않음 |
| 기존 입력 | 기존 FDGProject의 `sourcePreview.collisionPreview`에 이미 저장된 normalized v6 subset13. 원 v6 파일 추가 조회·재전개0 |
| 새 subset | 14 = circle11 + ellipse3; rotatedParts0 |
| 전체 충돌 수 | `fullObjectColliderCount:null`, `provenance.actualObjectColliderCount:null` → UNKNOWN |
| 적용 범위 | `coverage:'PARTIAL'`; hand-authored subset만 소비. 전체 MAP_OBJS·room/seed assembly·전투·World 전환 인수0 |
| 제작 상태 | `adoption:'UNADOPTED'`, `productionAdopted:false`, `sourcePhysicalZClaim:false`. 기존 preview RETOUCH / production FAIL 판정을 자동 승격하지 않음 |

## 원본 두 타입과 숫자

| 타입 | source 위치 | 최종 metadata | 원 배치 | FDG 충돌 소비 |
|---|---|---|---|---|
| `corpse` | source delta의 `game.html:18811` 설명 | `finalMeta.sz:40`, `col:0`, `collision:false`, `noCol:false` | 2개; tile `[124,179]`, `[78,37]` | 비충돌 제외. 시각 배치 제거·새 corpse collider 생성0 |
| `pit_poison` | 현행 `game.html:18407` metadata / `18166` 배치. 역사 delta의 `18816` 표기는 당시 원형 근거 | `finalMeta:{sz:200,collision:true,colW:80,colH:58,colOy:7}`; resolution은 `col:0`, `noCol:false`, `colParts:false`, `colSz:null` | 1개; `rawTile:[162,139]`, `onFloor:true` | `ellipse`, 중심 `[6500,5587]`, X/Y반경 `[80,58]` world px, `yaw:0` |

| 필드 / 공식 | 값 / 의미 |
|---|---|
| added source row | `oldNew.addedCollider:{type:'pit_poison',shape:'ellipse',colW:80,colH:58,colOy:7,rawTile:[162,139],onFloor:true,effectiveWorld:[6500,5580]}` |
| tile → 기준 중심 | `(rawTile + .5) × 40`; X `(162+.5)×40=6500`, Y `(139+.5)×40=5580`. `effectiveWorld:[6500,5580]`는 offset 적용 전 원 배치 중심 |
| collider 중심 | `[effectiveWorld[0],effectiveWorld[1]+colOy]` = `[6500,5587]`; `colOy:7`은 world-px Y offset이며 정확히1회 적용, scale 재곱0 |
| source radii 설명 | resolution의 `colW:80/colH:58/colOy:7/colSz:null`과 `colliderDim:{colW:80,colH:58,colOy:7,unit:'px radii; colOy px offset',formula:nonempty string}`을 검증. adapter는 제출된 X/Y반경을 그대로 소비하며 scale 재곱0·반경÷2 변환0 |
| canonical id | `native-hand-13-pit_poison`; engine append namespace. visual85 id와의 동일성 claim0 |
| 새 canonical primitive | `{id,kind:'ellipse',center:[6500,5587],radii:[80,58],yaw:0,nativeType:'pit_poison',nativeRawTile:[162,139],nativeDeltaControl,source,normalizationRole:'explicit-native-v7-added-ellipse'}` |
| 원 scale | delta row에 scale 숫자가 없으므로 canonical `nativeScale` 기본값 생성0. source formula와 full metadata는 snapshot에 남음 |
| 제외 metadata | `nativeDeltaBinding.excludedTypes:[{type:'corpse',placements:2,reason:'explicit source noncollision'}]` |

## 공개 API와 검증

```js
applyMapSourceHandColliderDelta(previewProject, { delta, scope })
// { ok, errors, pending, candidateProject, sourcePreview,
//   project: null, world: null, adoption: 'UNADOPTED', inspection }
```

| 입력 / 결과 | 요구 / 경계 |
|---|---|
| previewProject | FDGProject object 또는 raw JSON string; 기존 project validator 통과 및 sourcePreview collision 필수 |
| delta | object 또는 raw JSON string; nonempty completionId/control/kind/baseRef.v6/partialStatus 및 명시 resolution/oldNew/finalHandSubset 필수. completionId는 기존 source envelope와 일치 |
| scope | 명시 `kind:'hand-authored-stage0-subset'`, `coverage:'PARTIAL'`, nonempty `source`, `authoredBy`, nonempty string `unresolved` 배열1..32. authoring 자동 생성0 |
| 기존 subset gate | kind `engine-normalized-native-hand-colliders`, embedded native/source count13, canonical circle11/ellipse2 및 `MAP_HAND_COLLIDER_BINDING`의 정확 version1/radius binding. 다른 subset·이미 적용된14·재적용은 거부 |
| delta numeric gate | corpse2 비충돌 metadata, pit ellipse/colW80/colH58/colOy7/onFloor, resolution과 addedCollider의 tile/base world 일치, tile-center 및 Y offset 공식, 최종14/11circle/3ellipse/0parts/PARTIAL를 검사. 옛 circle/radius80·unsupported shape·불일치·누락에 fallback geometry 생성0 |
| safe JSON | input/options descriptor 검사 후 clone. options는8MiB, delta/scope/project 및 출력 FDGProject는 각각4MiB. depth64, visits1,000,000; reserved/accessor/symbol/cycle/sparse/nonfinite/비plain JSON 거부. options getter 실행0 |
| 출력 검증 | 기존 `attachMapSourcePreviewCollision` → canonical collision/sourcePreview 및 `validateMapSourceOutput` 사용. 새 pit 위 actor 또는 발 반경을 포함한 현재 pose가 유효하지 않으면 candidate 반환0; actor 자동 이동0 |
| 성공 | `ok:true`는 후보 검증까지. `candidateProject`와 `sourcePreview` 제공; `project/world:null` 유지. decode/install은 runtime owner 책임 |
| 실패 | `ok:false`, `candidateProject/sourcePreview:null`; 검사 오류는 `errors`. 기존 attach의 `pending` 분류를 전달. UNKNOWN을0/빈배열로 바꾸지 않음 |
| local inspection | `oldSubsetCount:13`, `supportedSourceObjectColliderCount:14`, `circleCount:11`, `ellipseCount:3`; addedCollider는 `center:[6500,5587]`, `radii:[80,58]`, `yaw:0`, `units:'world-px'`를 제공(radius 필드 없음). exact excludedTypes, coverage PARTIAL, full count null, sourcePhysicalZClaim false, 입력 actorPosition 및 authored scope |

## 저장과 원형 보존

| 저장 위치 | 보존 내용 |
|---|---|
| collisionPreview.sourceExecutionSnapshot.nativeExecutionSnapshot | 기존 v6 full source JSON과 unknown metadata를 그대로 보존 |
| collisionPreview.sourceExecutionSnapshot.baseSourceExecutionSnapshot | 기존 normalized13 source envelope 전체 보존; 기존 primitive prefix13 바이트 의미 불변 |
| collisionPreview.sourceExecutionSnapshot.nativeDeltaSnapshot | v7 full source JSON 및 unknown metadata. 원문 formatting의 exact bytes는 작업 evidence snapshot에 별도 보존 |
| collisionPreview.sourceExecutionSnapshot.nativeDeltaBinding | version1 / native-hand-meta-two-types-v7 / tileSize40 / `addedDimensions:'explicit colW/colH=world-px radii; colOy=world-px y offset; scale multiply0/divide2=0'` / 제외 corpse2 / coverage PARTIAL / full null / physicalZfalse |
| collisionPreview.sourceExecutionSnapshot.executionData | count14 및 원13 clone + explicit pit1. 기존 원 v6 snapshot의 count13을 덮어쓰지 않음 |
| collisionPreview.scope | 새 explicit engine authoring scope full unknown metadata |
| provenance.collisionEngineAuthoredInputSnapshot.scope | 같은 scope clone. `supportedSourceObjectColliderCount:14`로 동기화 |
| 기존 scene/project | map/nav/geometry/START/EXIT, actor XY/current camera, sourceStart, height/appearance/soil, image85, 승인 캐릭터/스킬/VFX, source/manifest/revision provenance 불변 |
| capture/reopen | 기존 runtime full scene clone 소비 및 FDG JSON 재검증 경로 사용. 이 API는 listener/RAF/image/server/fetch/eval을 생성하지 않음. actual capture/reload evidence는 owner가 별도 작성 |

## 2026-10-11 원형 계약 검증 이력(동결)

아래 결과는 MAP-021 적용 전 `circle/radius80` 계약의 당시 기록이다. 현행 ellipse 계약의 PASS로 간주하거나 재집계하지 않는다. 원본 delta 파일이 저장소에 없어 과거 producer JSON을 현재 재추출했다고 주장하지 않는다. 최신 P3-001 검증은 [보고서](orders/reports/P3-001_REPORT.md)에 별도로 기록한다.

| 확인 | 결과 / 한계 |
|---|---|
| 신규 UNIT 4개 최초 | 4/4 PASS, fail0. 첫 성공과 immutable snapshots/reopen, 새 radius80 full-foot sweep·corpse 제외, 잘못된 dims/center/flags/count/FULL/occupied actor 거부, raw safe JSON/producer mismatch/명시 scope/replay 거부 |
| 새 options 안전 보충 | getter 비실행 조건을 4번째 신규 항목에 추가한 후 affected1/1 PASS. 다른 최초3개 또는 이전 완료 suite 재실행0 |
| 현재 EXIT 조립 입력 후보 | 새 delta 최초 소비로 candidate 생성 `ok:true/errors0/pending0`; actor `[4020,300]`, camera `{x:4020,y:300,follow:true}` 및 기존 scene/project 보존. 후보 생성은 실제 설치·입력·시각 PASS가 아님 |
| 범위 | 새 v7 JSON과 현재 assembled project의 정상 입력 소비만 수행. 원 v6 파일/PNG 재조회0, 기존 종주/height/soil/image/old suite/Git 완료 검증 재실행0. shared staging/commit0 |

당시 작업 evidence는 `engine-stage0-play-input/worker-delta`에 있다. 당시 실제 수동14 설치·보행·재열기와 visual/production 상태는 root의 2026-10-11 마감 기록이며, 최신 타원 실화면 검수 증거를 대신하지 않는다.
