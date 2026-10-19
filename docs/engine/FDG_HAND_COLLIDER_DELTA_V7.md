# FDG 수동 충돌 v7 delta 계약

2026-10-11. 같은 CH1-1 제작 장면의 원본 수동 충돌 subset에 MAP v7의 두 타입 metadata 확정을 적용한다. 후보 JSON 생성까지의 정본이며 실제 입력·설치·시각 검수는 별도 owner gate이다. 이전 v0.16 subset13 종주와 당시 검수는 동결 이력으로 보존한다.

| 항목 | 현행 계약 |
|---|---|
| 구현 | `engine/fdg/map-source-adapter.js`의 `applyMapSourceHandColliderDelta` |
| source 입력 | `MAP/ch1-1.hand-meta-two-types.delta-v7.json`; full unknown JSON 보존 |
| source completionId | `CLAUDE8-MAP-WORLD-SCHEMA-EXPORT-V4-20261010-1851-MAP-RESULT` |
| source control | `CLAUDE8-MAP-SAME-HAND-META-TWO-TYPES-V7-20261011002408` |
| 기존 입력 | 기존 FDGProject의 `sourcePreview.collisionPreview`에 이미 저장된 normalized v6 subset13. 원 v6 파일 추가 조회·재전개0 |
| 새 subset | 14 = circle12 + ellipse2; rotatedParts0 |
| 전체 충돌 수 | `fullObjectColliderCount:null`, `provenance.actualObjectColliderCount:null` → UNKNOWN |
| 적용 범위 | `coverage:'PARTIAL'`; hand-authored subset만 소비. 전체 MAP_OBJS·room/seed assembly·전투·World 전환 인수0 |
| 제작 상태 | `adoption:'UNADOPTED'`, `productionAdopted:false`, `sourcePhysicalZClaim:false`. 기존 preview RETOUCH / production FAIL 판정을 자동 승격하지 않음 |

## 원본 두 타입과 숫자

| 타입 | source 위치 | 최종 metadata | 원 배치 | FDG 충돌 소비 |
|---|---|---|---|---|
| `corpse` | source delta의 `game.html:18811` 설명 | `finalMeta.sz:40`, `col:0`, `collision:false`, `noCol:false` | 2개; tile `[124,179]`, `[78,37]` | 비충돌 제외. 시각 배치 제거·새 corpse collider 생성0 |
| `pit_poison` | source delta의 `game.html:18816` 설명 | `finalMeta.sz:200`, `collision:true`, `col:0`, `noCol:false`, `colParts:false` | 1개; `rawTile:[162,139]`, `onFloor:true` | `circle`, 중심 `[6500,5580]`, 원반경80 world px |

| 필드 / 공식 | 값 / 의미 |
|---|---|
| added source row | `oldNew.addedCollider.type:'pit_poison'`, `shape:'circle'`, `colSz:80` |
| tile → 중심 | `(rawTile + .5) × 40`; X `(162+.5)×40=6500`, Y `(139+.5)×40=5580` |
| source radius 설명 | `(colSz || (sz || 64)×.4)×scale = (200×.4)×1 = 80 px`라는 producer 설명을 그대로 보존. adapter는 제출된 `colliderDim.colSz:80`을 소비하며 scale을 다시 곱하거나 반으로 나누지 않음 |
| canonical id | `native-hand-13-pit_poison`; engine append namespace. visual85 id와의 동일성 claim0 |
| 새 canonical primitive | `{id,kind:'circle',center:[6500,5580],radius:80,nativeType:'pit_poison',nativeRawTile:[162,139],nativeDeltaControl,source,normalizationRole:'explicit-native-v7-added-circle'}` |
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
| delta numeric gate | corpse2 비충돌 metadata, pit circle/radius80/onFloor, resolution과 addedCollider의 tile/world 일치, tile-center 공식, 최종14/12circle/2ellipse/0parts/PARTIAL를 검사. unsupported shape·불일치·누락에 fallback geometry 생성0 |
| safe JSON | input/options descriptor 검사 후 clone. options는8MiB, delta/scope/project 및 출력 FDGProject는 각각4MiB. depth64, visits1,000,000; reserved/accessor/symbol/cycle/sparse/nonfinite/비plain JSON 거부. options getter 실행0 |
| 출력 검증 | 기존 `attachMapSourcePreviewCollision` → canonical collision/sourcePreview 및 `validateMapSourceOutput` 사용. 새 pit 위 actor 또는 발 반경을 포함한 현재 pose가 유효하지 않으면 candidate 반환0; actor 자동 이동0 |
| 성공 | `ok:true`는 후보 검증까지. `candidateProject`와 `sourcePreview` 제공; `project/world:null` 유지. decode/install은 runtime owner 책임 |
| 실패 | `ok:false`, `candidateProject/sourcePreview:null`; 검사 오류는 `errors`. 기존 attach의 `pending` 분류를 전달. UNKNOWN을0/빈배열로 바꾸지 않음 |
| local inspection | `oldSubsetCount:13`, `supportedSourceObjectColliderCount:14`, `circleCount:12`, `ellipseCount:2`, exact addedCollider/excludedTypes, coverage PARTIAL, full count null, sourcePhysicalZClaim false, 입력 actorPosition 및 authored scope |

## 저장과 원형 보존

| 저장 위치 | 보존 내용 |
|---|---|
| collisionPreview.sourceExecutionSnapshot.nativeExecutionSnapshot | 기존 v6 full source JSON과 unknown metadata를 그대로 보존 |
| collisionPreview.sourceExecutionSnapshot.baseSourceExecutionSnapshot | 기존 normalized13 source envelope 전체 보존; 기존 primitive prefix13 바이트 의미 불변 |
| collisionPreview.sourceExecutionSnapshot.nativeDeltaSnapshot | v7 full source JSON 및 unknown metadata. 원문 formatting의 exact bytes는 작업 evidence snapshot에 별도 보존 |
| collisionPreview.sourceExecutionSnapshot.nativeDeltaBinding | version1 / native-hand-meta-two-types-v7 / tileSize40 / explicit radius·scale재곱0·divide2=0 / 제외 corpse2 / coverage PARTIAL / full null / physicalZfalse |
| collisionPreview.sourceExecutionSnapshot.executionData | count14 및 원13 clone + explicit pit1. 기존 원 v6 snapshot의 count13을 덮어쓰지 않음 |
| collisionPreview.scope | 새 explicit engine authoring scope full unknown metadata |
| provenance.collisionEngineAuthoredInputSnapshot.scope | 같은 scope clone. `supportedSourceObjectColliderCount:14`로 동기화 |
| 기존 scene/project | map/nav/geometry/START/EXIT, actor XY/current camera, sourceStart, height/appearance/soil, image85, 승인 캐릭터/스킬/VFX, source/manifest/revision provenance 불변 |
| capture/reopen | 기존 runtime full scene clone 소비 및 FDG JSON 재검증 경로 사용. 이 API는 listener/RAF/image/server/fetch/eval을 생성하지 않음. actual capture/reload evidence는 owner가 별도 작성 |

## 이 단위 검증

| 확인 | 결과 / 한계 |
|---|---|
| 신규 UNIT 4개 최초 | 4/4 PASS, fail0. 첫 성공과 immutable snapshots/reopen, 새 radius80 full-foot sweep·corpse 제외, 잘못된 dims/center/flags/count/FULL/occupied actor 거부, raw safe JSON/producer mismatch/명시 scope/replay 거부 |
| 새 options 안전 보충 | getter 비실행 조건을 4번째 신규 항목에 추가한 후 affected1/1 PASS. 다른 최초3개 또는 이전 완료 suite 재실행0 |
| 현재 EXIT 조립 입력 후보 | 새 delta 최초 소비로 candidate 생성 `ok:true/errors0/pending0`; actor `[4020,300]`, camera `{x:4020,y:300,follow:true}` 및 기존 scene/project 보존. 후보 생성은 실제 설치·입력·시각 PASS가 아님 |
| 범위 | 새 v7 JSON과 현재 assembled project의 정상 입력 소비만 수행. 원 v6 파일/PNG 재조회0, 기존 종주/height/soil/image/old suite/Git 완료 검증 재실행0. shared staging/commit0 |

작업 evidence는 `engine-stage0-play-input/worker-delta`에 있다. 실제 수동14 설치·보행·재열기와 최종 visual/production 상태는 root의 해당 마감 보고를 따른다.
