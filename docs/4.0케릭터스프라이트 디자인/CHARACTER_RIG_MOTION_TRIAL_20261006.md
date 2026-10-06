# 캐릭터 2.5D 리깅 움직임 기술 시험 — 2026-10-06

사용자 지시: “우리게임에 2.5케릭터 리깅까지 해서 넣을수잇냐”, “담당팀도 만들어서 한번 시도해봐 케릭터 움직임”. 캐릭터 리깅·움직임 담당 지원팀 1개가 기존 보스 GLB를 재사용한 독립 시험을 구현한다. 전사·실버테일의 외형을 이 모델로 바꾸거나 본편 플레이어 리깅을 완료한 작업이 아니다.

## 실제 적용 위치와 상태

| 항목 | 현행 계약 |
|---|---|
| 시험 진입점 | `tools/rig-motion-lab.html`, 기존 격리 정적 서버 `http://127.0.0.1:3387/tools/rig-motion-lab.html`에서 실행. 새 서버·본편 게임·빌드 실행 없음 |
| 구현 파일 | `tools/rig-motion-lab.mjs`가 로딩·WebGL·스킨 애니메이션·UI 담당. `tools/rig-motion-controller.mjs`가 입력·평면 이동·8방향·시연 상태 담당 |
| 대상 | 기존 **Vinebound Sentinel 보스 모델 · 리깅 기술 시험**. 모든 화면에 독립 시험 / 본편 미채택 표시 |
| 현재 플레이어 | 전사·실버테일은 기존 8방향 PNG 및 SpriteAnimator 경로 유지. 조사된 플레이어 리깅·부위 분리 원본 없음. 기존 명암 보정과 이번 bone rig를 구분 |
| 로컬 라이브러리 | `assets/vendor/three-r160/build/three.module.js`의 Three.js r160, 동일 import map의 `three` namespace 및 기존 `examples/jsm/loaders/GLTFLoader.js`. CDN·추가 설치 없음 |
| 렌더링 | 단일 `WebGLRenderer`, 단일 `AnimationMixer`, 단일 활성 모델. 중립 교정 바닥이며 맵/지형/전투 arena 생성이 아님 |
| 분리 범위 | 본편 `game.html`·`index.html`·`editor.html`·기존 에셋·맵 좌표·세이브·API·피해·Q/E·스킬·공격 티켓 계약 수정 없음 |
| 코드 상태 | 시험 소스 3개 작성. 두 `.mjs` 파일의 Node `--check` 각 1회 통과 |
| 검수 경계 | 담당 인계 시점에는 브라우저 미검수였으나, root가 격리3387 실제 키 입력·GLB·골격·화면11그룹과 shader/crossfade2그룹 인수를 완료했다. controller5그룹도 통과. 상세 범위는 아래 root 실제 검수 완료 표. 본편/native/청취 인수 미완료 |

기존 시스템 1차 레퍼런스: [`PLAYER_RELIEF_2_5D_20260915.md`](./PLAYER_RELIEF_2_5D_20260915.md), [`4.0케릭터스프라이트 디자인.md`](./4.0케릭터스프라이트%20디자인.md), [`5.0애니메이션파이프라인.md`](../5.0애니메이션파이프라인/5.0애니메이션파이프라인.md), [`보스_스켈레탈_애니메이션.md`](../5.0애니메이션파이프라인/보스_스켈레탈_애니메이션.md), [`BOSS_BATTLE_SETTINGS.md`](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md) §6. `drawBossBody()`의 절차 9관절 폴백과 이번 GLB의 24개 bone / skin 애니메이션은 서로 다른 경로다.

## 원자료 판독

Node에서 GLB JSON/BIN chunk, accessor, skin, animation sampler를 실제 읽었다. 바이트·해시는 원본 파일의 SHA-256이며 재생성/변환하지 않았다.

| 상태 | 원본 (`assets/3d/` 하위) | bytes | SHA-256 |
|---|---|---:|---|
| idle | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb` | 8,619,512 | `95164195fedb148334c1c5c405da2ca41f476d051c52340c59cf22bd432ee1ae` |
| walk | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Walking_withSkin.glb` | 8,426,960 | `056910533e79e78040d9fc61dc6b84d1bdaa7d51f4c3b625d000d9d3c14c3ab0` |
| run | `Meshy_AI_Vinebound_Sentinel_biped_Animation_Running_withSkin.glb` | 8,422,340 | `baf1ac05e077cbd6bcfc270e70aaa6212d799a8c807b2dc3b7427c533703c023` |

| 판독 항목 | 실제 결과 / 적용 |
|---|---|
| 공통 구조 | skin 1개, joint 24개, mesh `char1` 1개, vertex 16,558개. `POSITION`·`NORMAL`·`TEXCOORD_0`·`JOINTS_0`·`WEIGHTS_0` 보유 |
| 공통 bind | joint 순서·이름·계층·rest translation/quaternion/scale 및 inverse bind matrices가 세 원자료에서 동일 |
| inverse bind 증거 | accessor 숫자 배열의 JSON SHA-256 `8e6f8320858861e1659ca7445c6054fb3b41a17717853d6f30cdce3369404a4c` |
| 최상위 root | idle=`target_character`, walk/run=`Armature`. 최상위 root를 애니메이션 대상 이름으로 재사용하지 않음. 동일 bone 이름에만 property binding 허용 |
| idle 선택 | `rigify_clip`, 5.5333333015441895초, 72 channels / 24개 bone. 0.06666667014360428초 `Armature\|clip0\|baselayer`는 bind clip이므로 제외 |
| walk 선택 | `Armature\|walking_man\|baselayer`, 1.0666667222976685초, 72 channels / 24개 bone |
| run 선택 | `Armature\|running\|baselayer`, 0.6666666865348816초, 72 channels / 24개 bone |
| 트랙 구성 | 24개 bone마다 translation·rotation·scale. 로더 이후 `position`·`quaternion`·`scale`에 연결 |
| source mesh Y 범위 | POSITION accessor min `3.6885627885396843e-9`, max `1.6999999284744263`. 실제 표시 배율은 로더가 계산한 skin world bounding box 기준이며 이 accessor 높이를 그대로 확대하지 않음 |

24개 joint: `Hips`, `LeftUpLeg`, `LeftLeg`, `LeftFoot`, `LeftToeBase`, `RightUpLeg`, `RightLeg`, `RightFoot`, `RightToeBase`, `Spine02`, `Spine01`, `Spine`, `LeftShoulder`, `LeftArm`, `LeftForeArm`, `LeftHand`, `RightShoulder`, `RightArm`, `RightForeArm`, `RightHand`, `neck`, `Head`, `head_end`, `headfront`.

### 실제 X/Z 이동 소유권과 접지

| 항목 | 규칙 |
|---|---|
| 월드 축 | Three.js Y가 위, X/Z가 시험 바닥 평면. 입력 위/W는 −Z, 아래/S는 +Z, 왼/A는 −X, 오른/D는 +X |
| 이동 소유권 | controller가 anchor의 X/Z만 변경. 보스 원본 클립의 Hips X/Z를 매 mixer update 이후 idle rest X/Z로 고정하여 입력 이동과 root motion이 중복되지 않음 |
| 애니메이션 보존 | Hips Y bob, 모든 bone 회전·팔다리 pose·scale 트랙 보존. 파일의 클립 데이터는 clone하여 사용하며 원본 GLB/배열은 변경하지 않음 |
| Hips 원자료 범위 | idle X −2.6171622276306152…3.5788021087646484 / Z 4.919793128967285…7.805113315582275. walk X −0.8194987773895264…3.9458298683166504 / Z 2.6327462196350098…6.285895347595215. run X −0.11755985766649246…1.0032132863998413 / Z 0.12531742453575134…5.331745147705078. source skeleton 단위이며 월드 이동량으로 적용하지 않음 |
| 배율 | 로드 직후 `Box3.setFromObject(model)`의 높이 `size.y`로 `scale=2.2/size.y`, 기존 model scale에 곱함 |
| 발 원점 | 확대 뒤 bounding box center X/Z를 원점으로, Y는 `footOffset=-box.min.y` 적용. anchor Y=0. 골격과 메시를 anchor 자식으로 표시 |
| 접지 표시 | 발 원점 금색 ring(내경 반지름 0.22 / 외경 0.237), heading 화살표 길이 0.72, 바닥 그림자 반지름 0.5 / 평면 종횡 1:0.65. 실제 IK·발 고정 제약·경사 지형 접지 미구현 |
| 한계 | source idle/walk/run 발바닥의 미끄러짐·뜸, 몸 흔들림의 시각 품질은 별도 검수 대상. ring은 anchor 기준일 뿐 정확한 양발 IK 완료 근거가 아님 |

## controller 상수와 입력

시험 전용 수치이며 본편 이동·공격 수치와 관계없다. `RIG_MOTION_CONFIG`가 진실 공급원이다.

| 키 | 값 | 의미 |
|---|---:|---|
| `walkSpeed` | 1.35 | 걷기 world units/초 |
| `runSpeed` | 2.8 | 달리기 world units/초 |
| `maxDelta` | 0.05 | controller와 mixer에 전달하는 프레임 dt 상한(초). 음수→0, NaN/Infinity→0 |
| `turnResponse` | 13 | shortest yaw delta에 `1−exp(−13×dt)` 보간 |
| `crossFadeSeconds` | 0.22 | Idle ↔ Walk ↔ Run `crossFadeTo` 시간(초), warp=false |
| `worldLimit` | 3.35 | 각 축 좌표 clamp −3.35…+3.35 |
| `targetHeight` | 2.2 | 로드 rest bounding box 표시 높이 |
| `demoPeriod` | 16 | 자동 순회 주기(초): 0…2 대기, 2…8 걷기, 8…14 달리기, 14…16 대기 |
| `orbitRadius` | 1.65 | 순회 목표 반지름. radial error×2를 tangent에 더해 정규화. 실제 경로는 연속 보정이며 목표 원과 완전 일치한다는 주장이 아님 |
| `rotationSpeed` | 0.55 | 제자리 자동 회전 target yaw 증가 rad/초 |
| `cameraElevation` | 50 | 카메라의 target(0,0.75,0) 기준 고도 °, 거리 12 |
| `viewHeight` | 6.8 | 정사영 세로 범위, 가로는 canvas aspect 적용, near 0.1 / far 60 |
| `pixelRatioLimit` | 2 | DPR=min(devicePixelRatio,2), antialias=true, low-power 요청 |
| `zoomMin` / `zoomMax` | 0.7 / 1.7 | UI 70…170%, step 5% |
| 본 계약 tolerance | 0.00001 | 24본 rest position/quaternion/scale/inverseBind의 숫자 비교 허용 절대 오차 |

| 입력/상태 | 동작 |
|---|---|
| WASD / 방향키 | X/Z 평면 이동. 대각선 벡터 정규화하여 가로보다 빨라지지 않음 |
| ShiftLeft / ShiftRight | 이동하면서 누르면 run. 이동 없는 Shift는 이동을 만들지 않음 |
| 8방향 | `round(atan2(vx,vz)/(π/4)) mod8`, 남·남동·동·북동·북·북서·서·남서. 몸 yaw는 목표 45° 방향까지 부드럽게 보간 |
| 이동 키 시작 | 자동 순회와 제자리 회전을 끄고 `requestedMode=idle`. 키를 떼면 idle로 돌아감 |
| 모션 버튼 | 자동 순회/회전·입력을 끄고 해당 clip만 제자리 재생. 실제 이동 거리 0 |
| 자동 순회 | 기본 true. 키 입력 시 false. mode 비교가 시작되며 캐릭터는 바닥 위를 이동 |
| 제자리 360° 회전 | 자동 순회와 입력 해제, yaw만 회전. 현재 요청 모션과 함께 외형 비교 가능 |
| Space | input이나 button에 focus가 있지 않을 때 pause/resume. key repeat는 toggle하지 않음 |
| pause/resume | 입력 해제, frame timestamp 초기화. pause 동안 RAF 0 / controller·mixer 시간 진행 0. 정지 순간 1회 화면 갱신 |
| 처음부터 시연 | X/Z/yaw/시연 시간 초기화, mixer.stopAllAction/setTime(0), idle 시작, 기본 자동 순회 true. pause 상태는 보존 |
| blur | 눌린 이동/Shift 키 전부 해제. focus 복귀 뒤 자동으로 키를 다시 누른 것으로 간주하지 않음 |
| visibilitychange | 입력 해제 및 RAF 취소/시간 초기화. hidden 동안 갱신 0. visible 복귀와 ready/unpaused 조건에서만 RAF 1개 예약 |
| pagehide | RAF 취소 / 입력 해제 / ResizeObserver disconnect |

## 로딩·정합성·실패 처리

| 항목 | 구현 계약 |
|---|---|
| 파일 수 | idle→walk→run을 순차 로드. GLB마다 1 loadAsync 호출, 로컬 GLB 3개 / 총 25,468,812 bytes. 네트워크 헤더·라이브러리·텍스처 decode 비용은 별도 |
| 표시 gate | idle skin/mesh와 세 clip의 정합성 확인이 끝나기 전 anchor 숨김. 완료 뒤에만 controls 활성화 및 모델 표시 |
| skin 검증 | 각 GLB의 실제 SkinnedMesh 정확히 1개 / bones 정확히 24개. joint 배열의 이름/parent/rest transform/inverseBind를 비교 |
| clip 검증 | 파일별 가장 긴 유효 clip(duration≥0.1)을 선택. 모든 트랙 target bone이 허용 24개에 있고 position3/quaternion4/scale3 차원이어야 함. 값 전체 finite / 총 트랙72 / 대상24 확인. 실패 시 임의 retargeting 없음 |
| 보조 모델 해제 | walk/run은 clip.clone만 유지하고 불필요한 scene의 geometry/material/texture/skeleton 및 해당 ImageBitmap 해제. base idle 모델 보존. Three.Cache 미활성 상태의 파일별 독립 소유권 사용 |
| 실패 UI | GLB/contract/WebGL/셰이더 링크 실패를 leaf `loading-title/detail`, `metric-mode/status`에 한국어 표시. `renderer.debug.checkShaderErrors=true`, `onShaderError`에서 fail closed. 다른 전사/실버테일/프로시저럴 외형으로 성공처럼 대체하지 않음 |
| 실패 상태 | ready=false / 입력·controls 정지 / anchor 숨김 / RAF 중단. fail handler 안에서 renderer.render 호출0으로 셰이더 callback의 재귀 렌더 차단. 첫 바닥 shader 실패 시 모델 load0. 모델 첫 렌더에서 실패한 경우 성공 UI를 다시 덮어쓰지 않음. 컨텍스트 소실 뒤 새 renderer 생성·자동 재로드 없음 |
| DOM 안전 | 직접 id의 leaf만 `textContent` 교체하며 children.length===0 확인. 부모 innerHTML/textContent 교체 없음 |
| 성능 | 활성 RAF 최대1개, WebGL context1개, 이미지 readback/getImageData0. UI metric은 100ms 이상 간격으로 갱신하며 자동회전이 아닐 때 각 metric 갱신의 방향명 표시에서 controller snapshot/pressed 배열을 생성. controller.update의 평면 이동 계산은 신규 벡터/배열 없음 |

## readonly 검수 API

`window.__rigMotionLab.snapshot()`만 공개하며 object/property는 writable=false, configurable=false. debug setters, 외부 clip tick 호출, 본편 game global은 노출하지 않는다. 검수 API snapshot은 검수자가 호출할 때 생성한다. UI 방향명 갱신도 별도의 `controller.snapshot()`을 호출하여 pressed 배열을 생성한다. 따라서 전체 실행의 배열 생성이 검수 호출에만 한정되는 것은 아니다.

| 필드 | 내용 |
|---|---|
| `ready`, `error` | 실제 로딩 gate 완료 여부와 오류 message |
| `controller` | x/z/yaw/targetYaw/direction/directionLabel/mode/requestedMode/speed/paused/demo/autoRotate/elapsed/delta/inputCount/pressed |
| `frames`, `raf` | 실제 화면 렌더 횟수, pending 0/1, maxPending 0/1 |
| `clips.idle/walk/run` | 원자료 clip name, duration, effective weight, action time, running |
| `skeleton` | boneCount/meshCount/helperVisible/contractVerified/hipsXZ/restHipsXZ 및 Hips·LeftLeg·RightLeg·LeftArm의 position/quaternion |
| `model` | targetHeight / 실제 계산 scale / footOffset |
| `renderer` | 실제 drawing-buffer width/height, pixelRatio, contextLost |
| `assets` | requests(완료 시3), disposedMotionModels(완료 시2), runtime(`160`) |

실제 키보드로 이동/Shift달리기/8방향·관절 quaternion 변화를 확인한다. 전환 중 weight 양측이 0보다 큰지, 0.22초 뒤 다음 clip이 유효한지, Hips X/Z가 rest와 같고 Y·사지 rotation이 변하는지 확인한다. pause 동안 position/animation time/bone pose가 불변인지 확인한다. blur/hidden 뒤 pressed=[]과 복귀 dt clamp, restart 반복 뒤 activeRAF1을 확인한다. 모델 요청 차단 시 표시/controls/RAF가 fail closed하는지도 별도 확인한다. 이 절차는 계획이며 본 표만으로 PASS를 선언하지 않는다.

## 다음 단계와 채택 조건

1. 완료: root의 격리3387 실제 화면·입력·골격·클립 전환 검수. 원자료 핀과 상세 증거는 아래 root 인수 표 및 외부 영수증에 보존한다.
2. 전사·실버테일용 동일 외형 mesh/skeleton/무기 sockets 또는 기존 외형을 보존한 부위 분리 rig 원본을 확보한다. 현재 시험 모델의 기술 성공을 새 플레이어 외형 제작 완료로 치환하지 않는다.
3. 본편 world→screen, 발접지/y-sort/맵 전경 가림, 공격 판정/무기 궤적/애니메이션 타이밍, WebGL 컨텍스트 수와 성능을 별도 수용한다.
4. 실제 1-1 전투·획득·보스방·사망/부활·재도전 및 화면/청취 인수를 완료하기 전 본편 플레이 가능 완료·A급 완료를 선언하지 않는다.

PixelLab 캐릭터 생성 없음. 새 외부 이미지 API·설치·보호 문서 수정 없음. 코드+관련 docs의 통합 체크포인트와 정확 원격 SHA는 root가 소유 범위를 확인하여 수행한다.


## root 실제 검수 완료 — 2026-10-06

| 범주 | 실제 결과 / 제한 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 최종 코드 핀 | `tools/rig-motion-lab.html`: 7,729B / `e9b06da2c909704abfeeec922b893f8e04644f3d2a5a85ad473126c240ceb78f`; `tools/rig-motion-lab.mjs`: 18,485B / `f8e555ce96277ac768c14d9d830574b982f6768116e13161f7bbb56732325cce`; `tools/rig-motion-controller.mjs`: 5,776B / `a3a83b5f527dbd4e46d399d3f19174787a16661e95647c040a2d26fc51c96ff9` |
| 문법 | 담당의 초기 두 모듈 각1회 및 최종 셰이더 처리 변경 뒤 root의 renderer 모듈1회 Node `--check` PASS |
| 독립 controller | 5/5 PASS, 1회. 대각선 정규화·dt상한/비유한값·pause입력해제·경계·synthetic bone signature reject 검사. 실제 게임/native 인수 아님 |
| 실제 브라우저 | 기존3387의 실제 GLB·skin·bone를 읽은 Chrome 1개/context1/page1, 순차 3회 navigation. 키 입력 걷기/Shift달리기·8방향·정지/재개·뼈대 가림 표시·확대/회전·재시작·영상·격리·missing clip 실패의 11/11 그룹 PASS |
| 검수 입력 구분 | 걷기/Shift/8방향/Space/slider는 실제 browser keyboard 입력. blur는 window 이벤트 주입. visibility 수명은 코드 리뷰 범위이며 실제 OS 창 숨김/native 인수는 하지 않음 |
| 추가 검증 | 앞의 성공 그룹 반복 없이, 최종 shader callback와 아직 측정하지 않은 crossfade만 별도 Chrome/context/page 각1개에서2/2 PASS. idle→run 50ms에 양측 weight>0, 250ms 뒤 idle0/run1. WebGL LINK_STATUS 실패 주입 뒤 ready=false/paused=true/RAF0/모델요청0/버튼비활성, 이후200ms 추가 렌더0 |
| 정상 / 실패 콘솔 | 정상 소비자 page error·warning·console error0. missing-walk 단계의 의도적 HTTP503과 Chrome network console error1은 실패 주입 근거로 보존, 복구 navigation 후 ready=true. shader 주입은 실제 하드웨어 고장 사례가 아님 |
| 수명 / 외부 접촉 | 계측한 RAF최대1, 완료 모델요청3/보조모델해제2. API·다른 게임 포트 요청·storage 쓰기0. 소스 before/after exact pins 동일. 두 Chrome 검수는 순차 종료되어 중복 heavy 실행 없음 |
| 표시 / root motion | 실제 표시scale=1.2941176557600995, footOffset=2.3207859222443567e-8. Hips X/Z가 rest에 고정되고 사지 quaternion은 변함. foot IK·보폭/미끄러짐 보정 및 맵 높이 충돌을 구현한 증거가 아님 |
| 화면 판정 | `rig-result.png`와 `rig-bones.png`를 root가 실제 시각 확인. 기존 보스의 골격 모션·발 기준 링·중립 바닥 및 독립/미채택 표시 확인. 기술 움직임 PASS; 주인공 아트/본편 가림·광원·접지 품질은 미인수 |
| 영상 | 실제 renderer canvas의 `captureStream(24)` 및 MediaRecorder VP9, 요청 녹화시간3.2초, WebM347,997B, SHA-256 `4fd21a59bc2cdf86f6ec69c95eb279ccac5281fac1b7e77b042538c28377a6d8`. 무음; 24fps는 capture 요청이며 인코딩 전 프레임별 일정성 측정값이 아님 |
| docs 전체 검색 | 최종 코드 이후 docs 전체 검색110매치/37파일, 보호2_3 매치0. 본 문서와 캐릭터 주문서·PLAYER_RELIEF·파이프라인·Three 로컬런타임·관리마스터·지속정책·CHANGELOG_SYNC의8문서 동기화. 나머지 매치의 현행 본편/보스/맵/원자료/역사 및 오더담당 자료는 계약 불변으로 보존 |
| Git 범위 | 완료 소유 코드3+docs8의11파일만 체크포인트. 다른72개 변경·기존23·보호6파일·GLB원자료는 정확 핀 보존. full local/remote SHA 및 after-status는 아래 외부 영수증에 기록 |

증거 위치: `/Users/fordeargamers/.codex/visualizations/character-rig-motion-20261006/`.

| 근거 | 파일 |
|---|---|
| controller 실제 결과 | `controller-qa.json` |
| browser11그룹 상세/실제 입력/실패503/영상 핀 | `browser-qa/run1/raw-result.json` |
| 새 shader/crossfade2그룹 | `browser-qa/supplement/raw-result.json` |
| 시각 판정 | `root-visual-review.json` |
| 전체 검색 / 매치별 판정 | `docs-after-code-search.txt`, `docs-after-code-files.json`, `docs-disposition.json` |
| 백업/원래 변경/보호 핀 | `preflight.json`, `before-status.raw`, `before-doc-pins.json`, `before-docs/` |
| 최종 scoped Git 보존 | `git-receipt.json` (local/remote exactSHA의 최종 근거; 본문에 미래 SHA를 추정하지 않음) |

### 주인공 적용의 다음 작업 계약

| 단계 | 담당 책임 / 통과 조건 |
|---|---|
| 1. 기술 시험 | 이번에 완료: 실제24본 Idle/Walk/Run, 8방향 이동, 순차 WebGL검수와 무음 움직임 영상. 기존 보스 외형을 플레이어 승인으로 치환하지 않음 |
| 2. 주인공 원본 | 승인된 전사·실버테일의 동일 외형 mesh/skin/관절/무기 socket 또는 승인 부위 분리 원본 확보. 조사 경로에는 player GLB/FBX/Blend/PSD/Spine/Live2D 원본 없음. PixelLab 생성 금지 유지 |
| 3. 본편 시각 소비자 | 이동좌표는 기존 `P.x/y`·충돌, 이동방향은 기존 `_walkFacing`/`P.facing`, 공격상태/판정은 기존 `P.s`·`P.st2`·`hitArc` 소비. clip root motion과 animation event가 피해·이동을 새로 결정하지 않음. `_walkDist`·발 pivot·무기 socket·foreground footY·ghost pose·월드광원을 함께 맞춘 뒤 인수 |
| 4. 실제 플레이 | native1-1 시작→전투/획득→보스방→보스전 사망/부활→재도전·화면·청취·성능 인수. 이번 fixture/독립 브라우저 성공과 분리 |

담당 구성: root의 최신 수동 지시로 캐릭터 리깅·움직임 지원 담당1을 배정하여 코드3파일+문서1파일 구현을 인계받았다. 다른 지원 담당의 읽기 전용 에셋/독립 코드 리뷰를 반영했다. 기존 Codex7·Claude8 오더담당 송신 소유 및 전문15팀 구성은 유지한다. 전문팀 새 TASK/후속·새 관리 채팅·추가 Claude 실행 세션·paused 자동화/아침메일 재개0. 전팀16개가 이 시험을 동시에 실행했다는 주장은 하지 않는다.
