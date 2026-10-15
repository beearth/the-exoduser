# FDG 활성 VFX 시트 재생 관측 — 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

`FDGRuntime.getVfxPlaybackSnapshot()`는 현재 활성 VFX 시트의 재생 상태를 새 배열로 반환한다. 제작 UI는 pause/step 후 이 API를 직접 호출해 현재 셀과 투명도를 확인할 수 있다. 구현 위치는 `engine/fdg/runtime.js`이며, 재생 셀 선택은 렌더러와 동일한 `animationFrame()`을 사용한다.

이 관측은 시뮬레이션의 활성 시트 상태다. 이미지 decode 성공, 이미지 범위 유효성, 카메라 안의 표시 또는 실제 화면 품질을 보증하지 않는다. 본편 전투·보스 phase·발사체 피해/충돌/독립 수명 계약은 추가하지 않는다. 기존 [런타임 계약](FDG_RUNTIME.md)과 [일반 맵 제작 API](FDG_PRODUCTION_RUNTIME.md)를 보존한다.

## 공개 API

| API | 반환 | 호출 효과 |
|---|---|---|
| `runtime.getVfxPlaybackSnapshot()` | `Array<VfxPlaybackSnapshot>` | 명시 호출 때만 현재 상태의 새 배열·새 레코드·새 `cell` 반환 |
| 활성 시트 없음 | `[]` | primitive 입자만 활성인 경우도 포함 |
| `setProject()` 이후 | `[]` | 이전 프로젝트의 입자는 `_applyProject()`에서 정리됨 |
| `dispose()` 이후 | `[]` | 이전 pool 레코드를 노출하지 않음 |

getter는 owner clock, animation time, accumulator, 자원, 쿨다운, 입자 age/좌표를 변경하지 않고 렌더를 호출하지 않는다. 새 `Image`, rAF, listener, timer를 만들지 않는다. `stats` getter에 자동으로 포함하지 않는다. 호출자가 반환값을 변경해도 런타임의 입자·시트와 이후 관측에 영향을 주지 않는다.

기존 `sourcePreview`의 `triggerVfx()` 반환0과 `triggerSkill()`의 `source-preview-physical-pending` 거부를 유지한다. 관측 API는 효과 발행 또는 source/read-only 소비자의 재생 활성화 경로가 아니다.

## 레코드 필드

| 필드 | 타입/단위 | 정확한 원천 및 의미 |
|---|---|---|
| `definitionId` | string | 방출 시 보존된 `particle.vfxId`; VFX 정의 id |
| `sequenceId` / `activationId` | 선택 string / integer | authored sequence가 발동한 sheet에서만 원래 sequence ID/활성화 회차를 반환. 일반 기존 방출은 두 key를 추가하지 않음 |
| `particleIndex` | integer | 활성 레코드의 pool slot `particle.index`; pool1024에서0..1023. 재사용 가능한 슬롯이며 영구 이벤트 id가 아님 |
| `src` | string | 활성 `particle.sprite.src`의 선언 경로. asset loader가 해석한 절대 URL로 변경하지 않음 |
| `age` | seconds | `particle.age`; 기존 fixed owner clock이 갱신한 경과 시간 |
| `life` | seconds | `particle.life`; 이 제작 미리보기 입자의 수명 |
| `frameIndex` | integer,0-based | `animationFrame(sprite,{loop:false},age).index` |
| `cell.sx` | source image px | 선택된 셀의 왼쪽 x |
| `cell.sy` | source image px | 선택된 셀의 위쪽 y |
| `cell.sw` | source image px | 선택된 셀의 폭 |
| `cell.sh` | source image px | 선택된 셀의 높이 |
| `frames` | integer | `floor(sprite.frames)`를1..`columns×rows`로 제한한 실제 셀 선택 수. 생략 시 atlas capacity |
| `fps` | frames/second | 유효한 양수 `sprite.fps`, 생략/비양수 시8; 렌더러와 같은 FPS 선택 |
| `alpha` | number,0..1 | 렌더러와 같은 `max(0,1-age/life)` |
| `loop` | boolean | 항상 `false`; 현행 VFX 시트 재생의 non-loop 계약 |
| `finished` | boolean | `animationFrame()`의 종료 판정. 끝 셀 유지 중에는 `true`, life가 짧아 먼저 제거된 시트는 레코드 자체가 없음 |

배열 순서는 현재 particle active-list 순서다. 입자 제거 시 pool의 active-list 순서가 바뀔 수 있으므로 UI는 배열 순서를 영구 식별자로 사용하지 않는다. `cell`은 source crop이며 화면 scale·anchor·카메라 변환이 적용된 목적지 사각형이 아니다.

## 재생 및 수량 계약

| 항목 | 현행 값/공식 | 적용 |
|---|---|---|
| fixed simulation step | `1/60` seconds | 기존 owner clock; API 호출은 step을 만들지 않음 |
| 셀 tick | `floor(age×fps+1e-9)` | `animationFrame()`의 기존 epsilon 보존 |
| non-loop 셀 | `min(frames-1,tick)` | 마지막 셀 유지; API가 loop 설정을 바꾸지 않음 |
| 종료 판정 | `tick>=frames` | 마지막 셀에 처음 진입한 시점과 clip 완료 시점은 다름 |
| source crop | `sx=(frameIndex%columns)×sw`, `sy=floor(frameIndex/columns)×sh` | 기존 렌더러와 동일 |
| 입자 수량 `count` | 방출할 입자 수 | 프레임 수가 아님. 기존 일반 방출은 첫 입자1개가 sheet를 보유하고 나머지는 primitive 보조 입자. r4 sequence 정의는 count1 |
| life 제거 | `age+1e-9>=life` | 제거된 입자는 snapshot에서 제외; `life<frames/fps`면 시트가 끝나기 전에 종료 가능 |
| 기존 pool |1024 slots | 추가 pool·particle 생성 규칙 없음 |

생산자 메타데이터의 game-frame `cooldown:110` 또는 `life:200`을 이 API의 seconds 값으로 승격하지 않는다. 제작 미리보기의 독립 시간값과 source provenance는 어댑터에서 구분해야 한다. snapshot은 이미 활성화된 제작 입자의 실제 seconds 값을 그대로 관측한다.

## 2026-10-11 v0.19 관측 API 동결 검증

| 항목 | 결과 |
|---|---|
| 변경 파일 | `engine/fdg/runtime.js`의 새 공개 메서드1개 |
| 새 검증 파일 | `test/fdgSpritePlaybackRuntime.test.mjs` |
| 백업 | `tmp/fdg-sprite-playback-runtime-20261011/runtime.js.before` |
| docs 전체 검색 | `rg -n -i 'animationFrame\|spritePool\|VFX.*(시트\|재생\|snapshot)\|getVfxPlaybackSnapshot\|nonloop\|non.loop\|particleIndex\|definitionId' docs/` 및 literal `grep -r -n -E` 검색 수행 |
| 검색 로그 | `tmp/fdg-sprite-playback-runtime-20261011/docs-rg.log`, `docs-grep.log` |
| 신규 전용 첫 실행 | `node --test test/fdgSpritePlaybackRuntime.test.mjs` — **4/4 PASS**, fail0 |
| 기존 suite/종주/PNG 재검수 | 실행0 |
| source/native 계약 | 기존 차단 유지; 새 전투·phase·발사체 계약 없음 |

| 신규 검증 | 확인한 실제 조건 |
|---|---|
| 렌더와 관측 일치 | synthetic640px 셀·6×4·24frames·16FPS·life1.5초에서 row 전환의 실제 `drawImage` crop/alpha와 snapshot이 일치 |
| 수량과 프레임 구분 | synthetic `count:7`에서 활성 입자7개·시트 관측1개·프레임24개 |
| 관측 사본 및 owner 보존 | array/record/cell 모두 독립; 반환값 변경 후 재호출 값 보존; clock/resource/particle/Image/rAF/listener 변화0 |
| non-loop 끝 셀 | synthetic life2.25초 시트는24/16=1.5초 이후 frame23 유지·`finished:true`·`loop:false`; life에서 제거 |
| 정의·인스턴스 | 두 활성 방출의 `definitionId`와 서로 다른 pool slot·각 age/frame 보존 |
| 교체/해제 | primitive-only는 빈 배열; `setProject()`/`dispose()` 후 이전 시트0·listener/rAF/asset 정리 |
| source 발행 차단 | guard-only sentinel에서 기존 발행 거부 유지; source consumer/PNG를 재검사하지 않음 |

위 synthetic 수치는 검증 fixture이며 본편 보스 수치나 승인 리소스의 적용 선언이 아니다. 공개 UI 연결과 실재 PNG의 시각 검수는 이 API 작업의 검증 범위에 포함하지 않는다.

## 2026-10-11 r4 선택 sequence 관측

[r4 장면 연출 정본](FDG_TAIL_SEQUENCE_20261011.md)의 optional sequence가 기존 ParticleSystem에 발행한 시트는 새 선택 `sequenceId`/`activationId`를 기록한다. 이 두 값은 이미 활성화된 입자의 원래 회차를 식별하며 `particleIndex`를 영구 이벤트 ID로 바꾸지 않는다. `getRigSequenceSnapshot().activeFx`는 같은 sequence ID의 모든 살아 있는 회차를 이 API로 관측한다.

| 항목 | 현재 계약 |
|---|---|
| ordinary sheet | 기존 레코드 모양·emit·cell·alpha·life 유지, sequenceId/activationId key 없음 |
| sequence sheet | count1/speed0, life=frames/fps. 발동한 틱 age0/frame0, 이후 같은 owner60Hz로 진행 |
| no primitive fallback | `particle.sequenceId`가 있는 authored atlas의 실제 drawImage가 실패하면 그 레코드의 primitive 대체 표시를 생략. 일반 기존 입자 fallback은 유지 |
| stop/replay/clip/seek | 살아 있는 시트는 자기 life에서 제거. clip 중단을 particle clear로 확대하지 않음 |
| 재사용 / clear | pool slot 제거/clear에서 sequenceId/activationId도 null로 정리. 장면 교체/dispose 후 이전 sheet 관측0 |
| owner/API 경계 | API 자체는 시간·이벤트·자원·Image/RAF/listener/timer를 만들거나 변경하지 않음. sequence 재생은 별도 명시 runtime API가 수행 |
| 검증 기록 | 위 v0.19의4개 검사와 synthetic 숫자는 당시 동결 이력. 새 r4 backend8개 최초 실행 PASS는 [시퀀스 정본](FDG_TAIL_SEQUENCE_20261011.md)의 별도 증거이며 기존4/14/r3검사 재실행·합산0 |

실제 fixture24frames/16FPS/life1.5초를 native cooldown110/life200 등의 game-frame 값으로 변환하거나 single-hit 판정으로 적용하지 않는다. ENGINE_FIXTURE는 작성 시퀀스의 효과 자료 권위이며 본편 전투 적용 승인이 아니다.

## r4 공개 증거·당시 캐시 (동결 이력)

[시퀀스 정본](FDG_TAIL_SEQUENCE_20261011.md)이 r4 당시 구현·자체 검수의 정본이다. 아래 수치·검사·저장·공개 자료는 동결 이력이며 r5 검증에 합산하지 않는다. backend 신규8개 최초 PASS, 처음 JS8개 구문 PASS 및 필요한 선택값 보정 뒤 panel/studio2개 구문 PASS를 별도 기록한다. 기존4/14/r3·전체 저장 suite·PNG 검수를 재실행하거나 합산하지 않았다.

| 새 결과 | 정확한 범위 |
|---|---|
| 공개 crossing / 자기 만료 | 53틱0.883초 event0/FX0,54틱0.900초 event1/FX1 age0/frame0(표시1/24). Stop 뒤 bound body0.900초 hold·4틱 FX0.067/셀2, 총87틱 age1.450/셀24, 총90틱1.5초 FX0. clip 변경·replay는 이미 발동한 FX를 제거하지 않음 |
| 실제 재생 | 73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms. runtime/pose/clock/frame 강제 변경·합성0, 본체3.000초 hold/FX0/자동 loop0 |
| 새 설정 저장·재열기1회 | before body1.3000000000000003초/FX age0.400/event1 →reopen visible pose1.300·ready/activation0/event0/FX0/clock0. export 전체 JSON deepEqual, resources/sequence/map/camera는 최종 fixture와 깊은 일치. transient fields 직렬화0; 보정 후 두 번째 저장 검수0 |
| 최종 cache | index 공개 URL·studio entry·rig-scene-panel=`tail-sequence-r4-complete`, runtime/schema chain=`tail-sequence-r4-final`, fixture fetch=`tail-sequence-r4-fixture-final`. cache key는 schema/engine 버전 승격이 아님 |
| 직접 관측·시각 경계 | 공개 두 수집 범위 warn/error0. 같은 승인 body+실제 atlas sequence VISUAL PASS / 전체 모델 RETOUCH, 단1개 hidden source surface SOURCE_GAP. native 시간/전투·attack ticket·full3D·Windows/GPU 인수0 |
| 증거 | `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/`의 `sequence-fixture-receipt.json`, `save-reopen-receipt.json`, `syntax-checks.json`, `public-sequence-observations.json`, `public-browser-warn-error-log.json`, `gif-receipt.json`, `actual-tail-swipe-impact-once.gif` |

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

r5는 기존 getVfxPlaybackSnapshot의 선택 sequenceId/activationId·frame0-based·count1/speed0/life=24/16 및 sequence-only primitive fallback 생략을 유지한다. body-only 검수의 FX0은 자체 scene에서 sequence를 생략한 상태이며 shipping의 FX 삭제나 native 타격 검증을 뜻하지 않는다.


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

r6는 기존 count1/speed0·sequenceId/activationId·frame0-based·sequence-only primitive fallback 생략과 기존 FX 자체 수명을 유지한다. 수동 idle 전환의 same particleIndex0/reference/count1/emitted1 보존이 살아 있는 FX의 새 증거다. 공격3초 끝 자동 idle 복귀 당시에는 정상 FX가2.4초에 이미 만료했으므로 FX0 관측을 alive-FX 보존 검사로 확대하지 않는다.

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
| VFX 경계 | 새 면 색은 리그 geometry 저작 표시이며 sequence atlas·FX frame/life/owner clock·native 전투 수치를 바꾸지 않음. r6 FX 검수와 r7 미전달 검수 결과를 합산하지 않음 |
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
| 현재 관측 대상 | 새Druidbody는 sprite frame atlas가 아닌 CPU skinned UV texture. 해당 장면 getVfxPlaybackSnapshot()=[]; 기존 활성sheet관측 API/선택 sequenceId·activationId 필드 계약 변경0 |
| sequence 상태 | `rigScene.sequence` 없음 / FX0 / `nativeCombatApplied:false`. sequence snapshot은 idnull/statusunavailable/activation0/event0/emitted0/activeFx[]. 지팡이 타격은 저작 clip이며 native 피해·독탄·Q/E·SFX·충돌·맵·본편 save에 배선하지 않음 |
| 시간 해석 | body clip24FPS는 key metadata/수동step 입력이며 scene owner60Hz에서연속평가. 새24장 sprite/GIF24FPS atlas 선언0 |
| 공개 proof | actual40CDP JPEG/GIF960×540/4290ms, 실제timestamp재생. UI entry0.25초/return0.35초 및 FX0 확인 |
| 복원/경계 | public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B; 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 현재body vs sheet | r2source1장UV/CPU LBS·10keys의연속초clip이며24장sheet제작아님. getVfxPlaybackSnapshot()=[]·getRigSequenceSnapshot().status=unavailable, API관측필드변경0 |
| 공개 시간 | actualpublic48CDP JPEG→GIF960×540/4210ms/8120063B, timestampinterval사용·합성poseframe0. 실제idle→Play→attack관측→idle복귀; prepare0.733/peak1.1/recovery1.65초 정지사진은 동일camera0/0·scale80, 실제front texture4622/authoring0 |
| noFX저장 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact |
| 인수 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
