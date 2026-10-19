# FDG 대기 → 꼬리치기 한 번 → 대기 복귀 r6

기준일: **2026-10-11, Asia/Seoul**. 승인된 [r5 꼬리치기](FDG_TAIL_READABILITY_20261011.md)에 별도의 실제 호흡 클립을 추가했다. 같은 리그·텍스처·메시·가중치를 소비하며 기존 `evaluateRig`의 T 선형 보간 / quaternion 최단 slerp와 장면의 clip crossfade를 재사용한다. 본체는 **ENGINE_AUTHORING / 보이는 표면 2.5D**, 임팩트는 **ENGINE_FIXTURE**다. native 전투·AI·상태머신·새 캐릭터·원화·숨은 텍스처·전체 3D 제작은 적용하지 않았다.

## 배송과 저작 데이터

| 항목 | 정확한 값 / 적용 위치 |
|---|---|
| builder | `tools/fdg-studio/build-hell-aberrant-idle.mjs`; `buildTailIdleScene(baseline)`은 r5 scene을 복사하고 새 idle만 추가 |
| 입력 | `tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json`; r5 원본 쓰기 0 |
| 기본 CLI 출력 | `tmp/hell-aberrant-idle-r6`; `FDG_IDLE_OUTPUT`으로 소유 산출 경로 지정. PNG 읽기 0 |
| scene | `tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json`, `hell-aberrant-tail-idle-scene-r6`, compact **824373B**, SHA256 `8dfa2dc3a233f942f523d0bf42dc54242bbd2cccba8127e8235d01ce3678416d` |
| standalone rig | `tools/fdg-studio/fixtures/hell-aberrant-tail-idle.rig.json`, `hell-aberrant-tail-idle-transition-r6`, compact **717356B**, SHA256 `dc1ad95bb1c5b28615d1b23a6a293ff6f0c1a1f3126c178d4da6f41e3b9c186b` |
| FX 없는 가져오기 자료 | E/`candidate-1/body-only-idle.fdg.json`; 같은 r6 scene에서 선택 `rigScene.sequence`만 생략 |
| clip 수 / 기존 공격 | 총 **3**; r5 `tail-swipe-loop` / `tail-swipe-once` 두 clip 전체 deepEqual 보존. 공격 3초·24FPS·20트랙 및 .900초 peak 변경 0 |
| 신규 clip | `hell-idle-breath`, `대기 · 호흡과 상체 무게 이동`, **2초 / 24FPS / loop true / 6트랙 / 트랙당 9키** |
| 변경하지 않은 모델 | 3864정점 / 4850삼각형 / 32본 / 1재질, source·UV·drawOrder·weight·mesh·skeleton·발·다리·27 cap pins·다리 뒤 꼬리 layer 유지 |
| 단위 구분 | 저작 키 9개는 이미지 24장을 뜻하지 않는다. 기존 캐릭터 sprite 24장·24FPS 목표, rig clip 24FPS, owner 60Hz를 구분 |

E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-idle-transition-r6/`.

`IDLE_TIMES=[0,.25,.5,.75,1,1.25,1.5,1.75,2]`, `IDLE_BREATH=[0,.146447,.5,.853553,1,.853553,.5,.146447,0]`, `IDLE_SWAY=[0,.707107,1,.707107,0,-.707107,-1,-.707107,0]`다. 각 키의 `breath=B[i]`, `sway=S[i]`를 다음과 같이 저작하고 키 사이에는 기존 보간을 적용한다. 시작·끝은 모두 bind offset이다.

| boneId | local translation XYZ (model unit) | local rotation Z (rad) |
|---|---|---|
| `spine` | `[.025×S,.032×B,0]` | `.010×S` |
| `head` | `[0,0,0]` | `−.012×S` |
| `leftArm` | `[0,0,0]` | `.018×B` |
| `leftForearm` | `[0,0,0]` | `.012×B` |
| `rightArm` | `[0,0,0]` | `−.015×B` |
| `rightForearm` | `[0,0,0]` | `−.010×B` |

모든 rotation X/Y는 0이다. root/pelvis/legs/tail에 idle track을 만들지 않는다. 상체의 작은 좌우 무게 이동과 들숨, 팔의 비대칭 완충으로 실제 mesh가 변형되므로 기존 공격의 이름만 바꾼 alias가 아니다.

## 기존 전환 소비 경로의 최소 연결

| 필드 / 접점 | 검증·실행·저장 계약 |
|---|---|
| `nodes[].returnTo` | 선택 객체 `{clipId,transitionSeconds}`. 미지정은 기존 hold 계약. clipId는 같은 리소스의 **loop true** clip, 기간 유한 **0..10초** |
| r6 returnTo | `{clipId:'hell-idle-breath',transitionSeconds:.35}`. non-loop clip 종료 경계 `time+1e−9>=duration`에서 기존 crossfade로 한 번 복귀. loop idle은 다시 복귀하지 않음 |
| `sequence.autoStart` | 선택 boolean, 미지정은 기존 true 동작. r6은 **false**: 일반 Play/step은 현재 clip을 진행하고 최초 자동 attack activation 0 |
| `sequence.entryTransitionSeconds` | 선택 유한 **0..10초**, 미지정은 기존 즉시 시작 0. r6은 **.25초** |
| explicit Replay / 공격 1회 | 현재 clip/time을 source로 공격 time0으로 진입 blend, 그 뒤 기존 sequence arm. entry **15 owner 틱 / .25초**. 추가 clock·RAF·timer 0 |
| 내부 `_changeClip` | 기존 setClip의 source clip/time·target0·transition 구성을 공통화. 자동 복귀는 수동 disarm을 호출하지 않음 |
| 자동 복귀 | attack 종료에서 idle time0·from attack 종료 pose·duration.35·elapsed0. **21 owner 틱 / .35초**, source/target 시간은 기존 owner dt로 함께 진행 |
| sequence 완료 | status completed, activation/eventCount/emittedCount/pending event 보존. returnTo 노드는 sequence elapsed를 마지막 attack time **2.9999999999999942≈3초**로 유지하며 idle node time과 별도로 표시 |
| 수동 clip / seek | 기존 sequence disarm / stopped 계약 유지. 이미 살아 있는 FX를 clear하지 않음 |
| 전환 중 재공격 | returnTo 노드의 기존 transition이 있으면 setClip/replay false·상태 불변·UI 비활성. source clip/time만 저장하는 기존 blend를 중첩하여 pose가 튀는 일을 이번 범위에서 차단 |
| 준비 gate | 기존 실제 이미지 준비 gate 유지. sequence atlas가 준비되지 않았으면 이 fixture의 idle Play/step도 기존 start/step gate에 막힘 |
| snapshot / capture | node snapshot의 returnTo 독립 복사. capture는 기존 node clip/time/transition·원본 returnTo·sequence 설정을 보존. transient activation/elapsed/event/FX는 프로젝트에 저장하지 않음 |

새 상태머신이나 native 시간 환산은 없다. setClip 기본 `.25초`, schemaVersion1/rigVersion1/rigScene.version1, epsilon1e−9, owner1/60초·max delta.25·max6substeps, pool1024, 파일 rig2MiB/scene4MiB의 기존 한계를 유지한다.

| Studio 공개 동작 | r6 동작 |
|---|---|
| 기존 preset ID | `hell-aberrant-tail-swipe-impact-r4` 유지, 표시 `지옥기형 · 대기 → 꼬리치기 → 대기`, 새 r6 fixture fetch |
| 일반 Play 재개 | autoStart:false에서는 stopped/completed라는 이유로 Replay하지 않음. 대기 재개는 대기 유지 |
| Replay 표시 | autoStart:false이면 **공격 1회**. 일반 Play와 명시 공격을 분리 |
| 자동 복귀 UI | live clip 선택값 / material 선택값 / 시간 max·value를 실제 snapshot에 동기화. 공격 표시가 idle 복귀 뒤 남지 않음 |
| Inspector | return loop clip / 복귀 전환 초 / 공격 진입 전환 초를 기존 안전한 leaf·명시 field 편집 경로로 표시·저장 |
| 최종 공개 URL | `http://127.0.0.1:3333/tools/fdg-studio/index.html?v=tail-idle-r6-final` |
| 캐시 | index module/studio→project/runtime/panel, project→scene schema, runtime→project/scene consumer, consumer/panel→scene schema는 `tail-idle-r6`; fixture fetch `tail-idle-r6-fixture`. pure rig math/texture의 r4 키는 동결 |

## 임팩트와 native 보존

| 항목 | 현재 r6 값 / 범위 |
|---|---|
| demo sequence | `hell-aberrant-tail-idle-impact-r6`, node `hell-body-node`, clip `tail-swipe-once`, startTime **.900초** |
| 기존 atlas | `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`, 640×640셀 / 6×4 / 24장 / 16FPS / 1.5초 / non-loop / anchor .5,.5 |
| 기존 가림 보정 | scale **.16**, offset **[−145,−84] world px**, 실제 destination **102.4×102.4px**. r5 값 그대로 |
| event owner | attack 시작 후 owner54틱=.900초 crossing1회, emit 직후 age0/frame0. 별도 force FX·runtime/pose/clock 강제 조작 0 |
| 독립 FX | 공격 종료·idle 전환 자체로 clear 0. 같은 instance/activation/count1을 유지하고 **90틱=1.5초** 자기 수명으로 만료. scene 교체/dispose의 기존 clear만 유지 |
| native | `.15..85 progress`, cooldown110 game frames, projectile life200, recover30 / rec50 및 원 독립탄 소비 경로 변경 0. Q/E·피해·AI·save·map/nav/LOCK·원화·숨은 면·타인 WIP 변경 0 |

## 새 검사와 실제 공개 증거

| 새 검수 | 관측된 결과 / 증거 |
|---|---|
| 전용 검사 | `test/fdgTailIdleTransition.test.mjs` **최초4/4 PASS**, fail/skip/cancel0, 2865ms. 기존4/8/4/14·r5 suite 실행/합산0. E/`first-tests-tail-idle-transition.log`, `targeted-tail-idle-transition-{receipt,metrics}.json` |
| idle 실제 변형 | 13sample에서 최대 `.0646545163006511` model = **19.39635489019533 source px**. source300px/model, placement80px/model. 발/leg/27cap drift·closure **0** |
| loop seam | t=`2−1e−6`와0의 차이 `1.1096062660021704e−7` model, t0/t2 bind pose 같음. 연속 보간 오차를 실제 표본 수치로 기록 |
| 전환 | entry15틱/return21틱 종료·t0 vertices/bones 연속·중간blend feet/cap0. 전환 중 거부된 호출은 pose/state 불변 |
| 살아 있는 FX의 수동 idle 전환 | 같은 particleIndex0·pool reference·count1·emitted1, 전환 뒤 age`.5666666666666668`, 90틱 자기 만료. 정상 자동복귀와 별도 새 검사 결과이며 native projectile 실행 검수를 뜻하지 않음 |
| 실행 초기화 검사 | capture/reload vertices·bones drift0, clock0/ready/activation0/FX0; 재로드 뒤131idle틱 stale event0, 이후 명시 Replay의 첫 crossing만 event1 |
| 구문 | 변경 JS **최초7/7 PASS**: scene runtime/schema, owner runtime/project, panel/studio, 새 builder. 새 test는 위 실행으로 별도 확인. E/`syntax-checks.json` |
| 불꽃 없는 실제 Play | 공개 Import → Play → once clip 선택 **2회** → 자동 idle 복귀 **2회**. 133 실제 CDP JPEG, GIF **960×540 / 8940ms / 20335209B**. E/`actual-idle-tail-idle-body-only.gif`, `body-playback-frames/capture.json`, `body-gif-receipt.json` |
| body 기록 clock | 마지막 수집 관측 owner `8.233333333333322`초 / idle`.5833333333333335`초; 다음 공개 Pause까지 자연 진행한 최종 owner `14.650000000000308`초 / idle`.9999999999999947`초. GIF 종료와 나중 pause 시각을 혼동하지 않음 |
| 같은 FX 실제 Play | 공개 shipping load → 일반 Play idle activation0 → 공격1회 버튼 → 자동 .900 event1 / 실제 FX → 자동 idle 복귀 completed/event1/FX0. 61 실제 JPEG, GIF **960×540 / 4890ms / 9709098B**. E/`actual-idle-tail-idle-with-impact.gif`, `fx-playback-frames/capture.json`, `fx-gif-receipt.json` |
| public pause/step | 자동 return을 관측한 뒤 공개 Pause 입력은 나중 idle`.8166666666666675` / transitionnull에서 실제 적용. ‘return blend 중 pause 성공’ 주장은 하지 않음. 이후 paused clip 선택으로 entry blend time0 생성 → 공개1틱은 node/clock/transition.elapsed 모두 정확히1/60초 증가. E/`pause-step-receipt.json` |
| public save/reopen | **1회**. once time1/60, transition `{fromClipId:'hell-idle-breath',fromTime:.8333333333333343,duration:.25,elapsed:1/60}` 보존. 두 전체 JSON deepEqual 및 **3864 실제 vertices / 32 bones pose deepEqual**. 두 export **2996047B**, resources/sequence/camera/map/preview는 shipping 깊은 일치 |
| reopen 상태 | 실제 clock0, saved node1/60·진행 중 transition 보존, sequence ready/activation0/event0/emitted0/FX0. E/`save-reopen-receipt.json`, `reopened-runtime.json`, `before-reopen-pose.json`, `reopened-pose.json` |
| reopen 이후 | 일반 Play로 saved pose에서 idle까지 진행 후 pause: owner`4.39999999999999`, idle`1.4166666666666665`, transitionnull, ready/activation0/event0/FX0. 저장 포즈를 활성 공격으로 오인한 자동 발동 0. E/`post-reopen-idle-runtime.json`, `post-reopen-idle-actual.png` |
| 브라우저 로그 | 새 shipping playback/save-reopen/post-reopen 관측 범위 warn/error **0**, E/`public-browser-warn-error-log.json`; 전체 게임/Windows/GPU 검수로 확대하지 않음 |

직접 본 실제 화면은 idle `.550`초, entry `.050`초, release `.833`초, 공격 FX body`1.083`/age`.183` 및 body`2.000`/age`1.100`, paused entry`.017`, 재열기 같은`.017` pose, 두 번 복귀 뒤 idle`1.000`이다. JPEG 선택에 연결된 runtime 관측값은 프레임 수집 직후의 값이므로 화면의 표시 시각과 동일하다고 가정하지 않는다. 새 GIF는 실제 JPEG만 순서대로 사용하고 CDP timestamp 간격을 10ms 단위로 반올림했다. 프레임 합성·runtime 속도 변경·합성 pose 0; GIF 파일의 반복 표시와 실제 non-loop 공격/loop idle 계약을 구분한다.

**VISUAL VERDICT: PASS — 보이는 2.5D idle·진입·공격·회복 후 idle 복귀 및 기존 FX 가독성 한정.** 전체 모델은 **RETOUCH**이며 정확한 잔여는 **SOURCE_GAP 1건: 승인된 단일 정면 PNG에 없는 숨겨진 표면**이다. 이 작업으로 원화에 없는 면이나 전체 3D 완성을 주장하지 않는다.

## MAP PRODUCTION REPORT · 이번 단위의 맵 경계

맵 제작 가이드 전체를 앞선 엔진 장면 작업에서 읽은 기준을 유지하고 §23 필드를 적용한다. r6은 맵을 제작하지 않았으므로 기존 맵의 visual PASS로 이 결과를 승격하지 않는다.

```text
STAGE: ENGINE_AUTHORING idle/attack transition r6, 신규 map stage 0
MASTER: silhouette/regions/main route/side spaces = 기존 맵 유지, 신규 저작 0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes = 변경 0, 이번 검수 N/A
LARGE: source assets/composites/overlap/repeated silhouette = 맵 변경 0
MEDIUM: connections/remaining holes = 맵 변경 0
GROUND: shadow/contamination/structure integration = 맵 변경 0
PLAYABLE: main arenas/travel space/breathing space/threat space = 변경 0
PLAYABLE combat readability: native 전투 변경·인수 0; 보이는 리그 전환만 위 범위 PASS
LANDMARK: primary/secondary/tertiary = 변경 0
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT = 생산 카메라 종주 미실시
CAMERA QA scope: 기존 고정 카메라 [4150,7220], followfalse/yaw0/pitch0, 리그 [4150,7360,0] scale80 보존
TECH QA: route/collision = 200×200/40000 tiles/T40 기존 데이터 보존, native 재검수 0
TECH QA: pageerror = 공개 shipping warn/error0; 404 = 별도 전수 네트워크 감사 미실시
TECH QA: seam = 새 idle/entry/return 표본 feet/leg/27cap0; loading = 새 공개 프리셋 및 save/reopen1회
TECH QA: performance = 새 GPU/Windows/성능 벤치마크 0, 기존 CPU 소비·owner clock 재사용
FILES: stage-owned = 코드/test/배송11 + docs16; concurrent touched/unrelated touched = 0
GIT: staged/commit = 이번 27소유 경로만 정상 checkpoint, E/checkpoint-receipt.json 참조; push0/deploy0
VISUAL VERDICT: PASS(현재 보이는 동작 연결 한정) / 전체 모델 RETOUCH
NEXT PASS: SOURCE_GAP 숨은 표면 1건 유지, 이번 범위에서 새 원화/숨은 texture 제작 0
```

## 동기화와 checkpoint

관련 docs 전체 rg 및 literal `grep -r` 검색 후 같은 소유15문서와 이 정본을 맞춘다. 코드·배송·신규 test·문서의 **27개 소유 경로만** 하나의 정상 로컬 checkpoint로 저장한다. E/`backup-receipt.json`, `checkpoint-owned-paths.json`, `root-docs-search-receipt.json`, `docs-sync-receipt.json`, `checkpoint-receipt.json`에 검색·backup·파일 목록·최종 Git 결과를 기록한다. old r2/r3/r4/r5 fixture·보고·proof·검사·Git 인수 결과는 동결하며 재검사나 타인 staged/WIP 포함·reset/checkout·push는 하지 않는다.
