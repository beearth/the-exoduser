# 다크드루이드 smooth-motion · 2026-10-12

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

## 2026-10-12 · 현재 상태 정정

**USER_REJECTED_OLD_MODEL / VISUAL FAIL — 구형 f0 모델의 현재 품질 인수는 거절됐다.** 사용자는 치마 파손과 모델 원형, 최신 검은 드루이드 자료 대신 구형 f0를 계속 리깅한 점을 지적했다. 아래 연속동작·math·12종 검사·overlay restart 성과는 역사적 기술 기록으로 보존한다. 화면내 포함을 의상 intact·승인 모델·출시 품질로 인수할 수 없다.

| 정정 항목 | 읽기 전용 진단 수치 / 정확한 경계 |
|---|---|
| 구형 source | assets/sprites/boss/boss_dark_druid_f0.png, 355×541 RGBA / SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 현재 최신 검은 모델 승인으로 기록0 |
| source 경계 | alpha≥32인 픽셀: 오른쪽 끝 열185, 바닥 끝 행14, 위/왼쪽 각2. 원화가 이미지 경계에 닿아 있으며, 완전 실루엣 원형이라고 보증하지 않음 |
| r5 구조 | 19본 /3729정점 /4680삼각형. physicalPart별 원점 복제로370 source 경계가 분리되고, 그중 외투 관련250개. 외투4본은 pelvis child이나 다른 skin weight·회전으로 접합이 벌어짐 |
| 의상 경계 | 같은 source점의 외투끼리152쌍 /외투–지팡이52쌍 /외투–장화36쌍 /외투–몸32쌍. 단일 합성 원화의 지팡이 뒤 의상 backing은 없으며 팔 socket36삼각형만 존재 |
| 변형 틈 | source-equivalent px: slam1.42초 외투끼리29.7579168386·외투–장화24.6244420536, fan1.3초 외투끼리30.5131924622. 실제 화면 픽셀이나 카메라 crop 수치가 아님 |
| UV / renderer | 원화 앞면4622tri의 bind UV는 nondegenerate. source alpha≥32 pixel-center 미포함1292px 중 y≥292는383px, 최대 연결17px. 확인한9자세 degenerate0; renderer는 abs(area)로 검사하여 winding 부호만으로 face를 버리지 않음. 큰 의상 틈을 winding cull이나 카메라 여백 문제로만 설명0 |
| 판정 정정 | camera contained·44/44 envelope·대표 frame screen-inside는 화면 배치 관측만 보존. 모델/의상 intact와 current visual 인수는 FAIL. 구형 모델 tint·보간만으로 새 검은 모델 완료 선언0 |
| 다음 자료 | 10/9 black maxSW 후보 exact 선택·모델 승인 pending. 새 file/모델 승인·rig 제작 재개·전체 완료 주장0. 기본 모델 및 역사 QA gate의 최종 코드 계약은 root가 확정 후 기록 |
| 보존 | source 이미지·기존 fixture·commit 폐기/rollback0. 수치 진단은 의상 복구나 새 모델 납품이 아님. native AI·시간·피해·Q/E·save 변경0 |

이번 단위는 기존 자기 QA의 first+r5 bridge 표시에 연속 idle와 local pose 전환을 연결하고, 리그의 정적 준비를 매 pose 계산에서 분리한다. 이전 보고/24FPS floor 기본 경로/원 fixture는 보존한다. 신규12종 증분 검사와 공개 QA 재생·사망 후 재시작은 당시 기술 기록이다. 구형 source/의상 파손에 대한 사용자 거절로 현재 모델 시각 판정은 **FAIL**이며, 신규 검사 PASS와 짧은 성능 표본을 모델 품질·전체60FPS/출시 품질 완료로 확대하지 않는다.

## 현재 계약과 보호 경계

| 항목 | 이번 계약 | 정확한 경계 |
|---|---|---|
| 선택 scope | 자기 r4 QA + first+r5에서 smoothMotion:true만 연결 | 옵션 없는 default24FPS floor 및 다른 bridge/fallback 경로 보존 |
| idle | native seconds=G.stageTime/60, 연속 seconds%idleDuration 소비 | 현재 r5 idle2초/24FPS metadata 보존. native seconds를24FPS floor하지 않는 표시 선택이며 native tick clock 수정0 |
| entry | 실제 마지막으로 표시한 localPose를 source로 wind **normalized progress0..0.25**에서 smoothstep blend | entry를0.25초로 기술하지 않음. native wind 최대값/phase marker/FSM 지연0 |
| return | attack→idle 시 마지막 표시 localPose source, **native clock0.12초** blend | native recover·attack·AI 타이머에0.12초를 더하거나 빼지 않음 |
| blend curve | p를0..1로 clamp한 smoothstep=p²×(3−2p), 기존 translation 선형 / quaternion 최단 slerp | Euler 성분 평균·mesh vertex pose 근사로 대체0. fromPose 옵션의 strict shape는 아래 API 표 |
| rasterScale | smooth 선택에서 ceil(desired×8)/8, 해상도 bucket0.25..2 | camera 미세변화가 같은 bucket이면 scale 원인 전체 reraster를 억제. 실제 pose 변화에 필요한 raster는 유지; GPU benchmark PASS0 |
| compiled evaluator | compileRigEvaluator(project) 준비 시 validation/clone/bind 정적 계산1회, frozen {evaluate} 반환 | compiled per-pose 전체 project validation만 prepare로 이동. options/fromPose 검증·결과 독립성은 매 평가 유지 |
| 원 권위 | impact marker·FSM·damage·Q/E·actor/native시간·19본·PNG/UV/weights·fixture·맵/사용자save 유지 | 표시 math/준비/캐시 접점만 변화. 원 source frame이나 모델 새생성0 |
| 미충족 | unique24 실제 캐릭터 이미지 +24FPS /1280×72060FPS 목표 | 연속 리그 sampling·compiled 평가·Q24 effect cells를 캐릭터24장/60FPS로 승격0 |

## 연구 근거와 적용 해석

| 근거 | 확인 내용 | 이 작업에서의 해석 |
|---|---|---|
| [Godot physics interpolation introduction](https://docs.godotengine.org/en/stable/tutorials/physics/interpolation/physics_interpolation_introduction.html) | fixed physics tick과 rendered frame을 구별하고, 표시 transform 보간과 지연/예측 한계를 설명 | native 규칙·시간은 유지하면서 표시의 불필요한 양자화를 줄이는 참고. Godot의 physics interpolation fraction/전체 엔진을 구현했다는 뜻은 아님 |
| [Godot AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html) | 애니메이션 데이터와 playback/transition을 나누고 blend·OneShot·crossfade를 설명 | 마지막 표시 pose와 다음 상태를 연결하는 설계 참고. Godot dependency/새 AI state machine 도입0 |
| [Animation Mentor 12 principles tutorial](https://www.animationmentor.com/blog/tutorial-12-principles-of-animation/) | anticipation/staging/follow-through/slow-in-out/arcs 등의 제작 관찰 기준 소개 | 실제 준비→타격→회복·prop 접점·발고정 검수 방향. 특정0.25/0.12 수치를 출처가 정한 공식으로 주장0 |
| [Supergiant Games 공식 Hades II 영상](https://www.youtube.com/watch?v=-SnaCUsUF3E) | root IAB의 paused 표본36.983362/37.083361/37.18336초. 처음2표본에 접촉 spark·곡선 weapon trail, 마지막은 밝은 full-screen montage transition | 전체 회복/체중이동·authored FPS/작품 수준 품질 관측0. 새 E/reference-observation.json/3fullPNG로 한정 |

이 근거와 적용 해석은 이번 작업에서 제안한 연구/제작 방향이다. 사용자 승인 레퍼런스로 기록하지 않는다. 새로운 source PNG·frames나 native 판정 타이밍을 연구 글에 맞춰 임의 변경하지 않는다.

<!-- DARK_DRUID_SMOOTH_MOTION_API_BEGIN -->
## API / 소비 상태

| 항목 | 현재 bridge 계약 | math 최종 인수 / 한계 |
|---|---|---|
| DRUID_MOTION_CONTINUITY | frozen {entryWindFraction:0.25,returnSeconds:0.12,rasterScaleSteps:8,facingDeadZone:0.1} | normalized wind fraction과 seconds를 구별 |
| compileRigEvaluator(project) | smoothMotion===true && idleClip 존재 때 compileRigEvaluator(fanRig||rig). project validate1회 + 독립 structuredClone + Object.freeze({evaluate(options={})}) | bind quaternion/world/inverse·hierarchy·normalized influences·material/clip lookups·key quaternions를 prepare1회. 생성 뒤 원 project 수정은 compiled snapshot을 바꾸지 않음 |
| compiled evaluate(options={}) | 매 호출 options·sample/manual/variant를 검증·소비하고 world/skinning 계산 | localPose/vertices/metadata는 독립 사본. pose 계산 자체를 cache된 고정 그림으로 대체0; 전체 project validation만 prepare로 이동 |
| evaluateRig(project,options={}) | 기존 공개 API는 매 호출 전체 project validation 후 같은 prepared math를 평가 | compiled 선택을 기본 API validation 제거로 확대0 |
| localPose / fromPose | [{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}], 모든 기존 bone을 중복 없이 정확1회. 마지막 실제 value.localPose를 source로 clip변경/동일 clip restart 연결 | bind transform에 합성할 animation/manual offset이며 world/mesh/actor transform 아님. finite translation 각 abs<=10000, quaternion4 finite·norm1 오차<=RIG_POSE_QUATERNION_TOLERANCE=1e−6 |
| blend options | {fromPose,amount} 또는 기존 {fromClipId,fromTime,amount}. amount finite0..1, 두 source 형태 혼합 거부 | target manual offset 적용 후 captured fromPose와 translation선형/quaternion최단slerp. captured source에 manual 재적용0 |
| 오류 / copy | unknown clip/material/bone·invalid options·불완전/중복 fromPose·nonunit quaternion은 RigProjectValidationError. project clone 불가도 같은 오류 | localPose/vertices/metadata 출력은 새 사본. pose별 options 검증 유지·전체 project validation만 compiled prepare로 이동 |
| entry | wind에서 smoothstep(sample.progress/0.25), wind 외에는 amount1 즉시 | native impact marker/접촉 지연0 |
| return | smoothstep((nativeSeconds−startedAt)/0.12), nativeSeconds=G.stageTime/60 | 새 RAF/timer·native 회복 시간 변경0 |
| invalid / fallback | invalid/backwards clock이면 transition clear, legacy fallback이면 motion state clear | native actor clock/상태를 써서 수리하지 않음 |
| rasterScale | desiredScale=clamp(undoScale×displayScale,0.25,2), smooth이면 ceil(desiredScale×8)/8 | 같은 bucket의 camera 미세변화가 scale 원인 reraster를 만들지 않음. pose/time/facing/size 변경 raster는 필요 |
| getRenderSnapshot | 기존 cloned bounds 외 smooth 전용 motion {phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps} | authoredFps=24 metadata를 실제 renderedFPS로 해석0 |
| getDisplayedPose(actor) | 마지막 localPose를 새 배열/각 bone id·translation·rotationQuaternion 복사로 반환. uninstall 후 null | smooth 전용 관측. native 상태에 write0 |
| facingDeadZone | smooth 표시에서 abs(cos(native facing))<=0.1이면 이전 display facing 유지, 밖이면 원 cos 부호 선택 | native actor facing 미수정. 실제 좌우 flip/8방향 모델 해결 주장0 |
| loader / query | game first+r5만 smoothMotion:true, bridge/rig import query motion-continuity-20261012-final | default24FPS floor/다른 경로 보존. hysteresis/query 이전 motion-boot/fan-ready는 중간 증거 |
| QA restart cleanup | _startDruidQaChar에서 deathScreen.style.transition 원값 저장→transition='none'→classList.remove('on')/inline opacity·pointer-events 제거→void offsetWidth1회 layout flush→원 transition 복원→_drReset()·_deathDlgStop() 후 기존 QA baseline actor 초기화. native retry QA 조기분기는 note+await 공통 초기화+return | CSS #death 기본 opacity0/pointer-events none, .on opacity1/pointer-events all·다음 native death transition 보존. _drReset은50canvas 링버퍼 index/len/capturetimer 초기화이며 pending replay cancel 아님. pet dialogue stop/DOM 자식 유지/공유 저장 변경0 |
<!-- DARK_DRUID_SMOOTH_MOTION_API_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_RESULTS_BEGIN -->
## 새 검사 / 실제 재생 결과

| 구분 | 현재 상태 | 제한 |
|---|---|---|
| math 신규 검사 | 담당 신규 최초5/5 PASS987.274542ms 인수 | 새 검사 안의6legacy full-result SHA 보존·18compiled exact 비교/strict 오류/독립 사본. 구형 suite 재실행0 |
| bridge / loader 신규 검사 | root 최초6/6 PASS954.97ms, 이후 facing hysteresis 새7번째만 최초1/1 PASS752.284ms·기존6 재실행0 | _nameTopOff 기존 draw 갱신 외 native actor write0·uninstall getDisplayedPose null 포함. old21/suite 반복0 |
| 신규 합계 | math5 + root6 + 추가facing1 = 고유12종 증분 PASS | 한 command12종 최초 PASS로 쓰지 않음 |
| fan 새 재생 | 162actualframes/약3.855초, running61metrics min46/median55/max106FPS·drawmedian13.890ms | native snapshot 참고 표본이며 recording overhead 포함. 마지막98FPS를 포함해 전체60FPS 인수로 확대0 |
| slam 중간 실패 | overlay fix 전120frames/약2.256초, running45samples에서 wind/strike/recover/idle·entry/return 관측 | death overlay 잔존으로 시각 증거 INVALID. 아래 최종 visible 자료와 분리 보존, 이전 normal GIF37MB/딜레이 파생본 최종사용0 |
| restart 중간 실패 | qa-public-restart-visibility.json은 waitFor(button visible)만으로 사망 전HP433/ontrue를 촬영 | opacity0도 visible인 harness이므로 실제 사망 후 재시작 성공 검수 INVALID. 최종 #death.on 사망 경계를 확인하는 새 자료만 인수 |
| restart fade 중간 실패 | 실제HP0/G.on=false/death.on opacity1·replay 종료 뒤 첫 public restart에서 on 해제/pointer none/pet0/G.on=true였지만 death opacity0.730877 잔존 | 기존 CSS2.5초 fade로 인한 intermediate 실패. transition 임시 해제+layout flush 후 최종 public restart 관측을 별도 인수; pending replay 취소 증명0 |
| 최종 public QA restart | 실제HP0/G.on=false/death.on true/opacity1/pointer all/pet1/replay false→공개 QA 재시작→G.on=true/HP548/death.on false/opacity0/pointer none/pet0/replay false | final-qa-real-death-restart-visibility.json: 실제 사망·replay 종료 뒤 즉시 숨김 **PASS**. console actor 상태 주입0·pending replay 취소 검수0 |
| 최종 visible slam | final-visible-slam-playback.json: 원본116 JPEG1280×720,2.2741949558258057초, running observer44, wind/strike/recover/idle 및 entry/null/return 관측 | 공개 강제 패턴 QA의 실제 연속 재생. 대표 source frame17 strike근처/22 contact·recover/41 return의 screen-inside/death overlay0는 당시 배치 관측이다. 의상 intact·승인 모델 인수0, 자연 AI 전체교전 인수0 |
| 최종 camera 관측 | final-camera-observation.json: running44/44 fit.ok&&contained true, body source native-sheet-envelope+posed-render | observer envelope 검사이며116전체 frame human visual PASS/ambient 몹 crop PASS로 확대0 |
| 최종 성능 표본 | final-visible-slam-statistics.json: rolling FPS min63/median69/max119, draw median12.427905746499118/max15.098998410641348ms, update median0.2947923078451533ms | 이전 pause baseline 일부 포함+CDP 녹화 overhead+약2.27초 QA. sustained1280×72060FPS PASS0·GPU bench0. compiled/raster bucket의 독립 성능 A/B 측정0 |
| 최종 파생 / 원본 | final-visible-slam-playback.gif:640×360/25Hz/57targets×40ms=2280ms/8,630,948B. 각 target의 직전 실제 captured frame 선택·uniform downscale, 원116 JPEG/timestamps 보존 | 동일 preceding source frame이 여러 target에서 반복될 수 있는 시간 재표본. 새 pose 생성/보간0·author24images 주장0. 중간37MB GIF/딜레이 파생본 최종사용0 |
| 현재 모델 시각 정정 | **VISUAL VERDICT: FAIL / USER_REJECTED_OLD_MODEL**. final-visible-combat-paused.png와 원본 표본은 실패 이력으로 보존 | 화면내 배치·death overlay 기술 관측과 구별. 구형 source/치마 파손 모델은 인수하지 않음; 새 검은 후보 승인·true24 캐릭터 이미지 미완 |
| 당시 잔여1 기록 | WHOLE_COMBAT_VISUAL_UNIFICATION | 현재는 source 선택·모델 원형/의상 topology 불합격을 먼저 해결해야 함. 당시 잔여 묶음을 모델 인수 근거로 사용0; 전체 출시품질/fullstage/fullbattle/kill PASS0 |
| 캐릭터 / 성능 | 실제24장 캐릭터·1280×72060FPS 아직 미인수 | clip metadata24FPS/보간/효과 cells와 구별 |
| 기술 이력 / 저장 | 연속동작 engine/runtime 구현·own storage writes0는 당시 기술 기록 | 현재 구형 모델 품질 인수 FAIL. 전체 엔진·출시품질·본편 전체교전 완료 아님. 이번 새 Save/reopen roundtrip0 |
| source 기술 확인 | root syntax12units(HTML classic4/module4 +JS2/tests2) PASS 및 source diff check PASS | 새 source 확인만. 이전21종/old suite 재실행0·문서 담당 코드/테스트/브라우저 실행0 |
| 문서 책임 | 이 정본+지정13문서 append, 각 WORK/HEAD backup | 보호2_3/마케팅/타인 WIP/source/browser/tests/Git mutation0 |

새 E: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-smooth-motion-20261012. 완료 증거는 이번 단위 새 결과만 인수한다.
<!-- DARK_DRUID_SMOOTH_MOTION_RESULTS_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_REPORT_BEGIN -->
## MAP PRODUCTION REPORT · §23

| 항목 | 하위 항목 | 이번 단위 기록 |
|---|---|---|
| STAGE | stage | 기존 CH1/Dark Druid NORMAL own QA first+r5 표시 전환/평가 준비. 새 맵 production은 N/A |
| MASTER | silhouette / regions / main route / side spaces | 기존 geometry/LOCK 유지, 새 맵 설계0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 변경0·이전 맵 감사 반복0 |
| LARGE | source assets / composites / overlap / repeated silhouette | 원 PNG/19본 리그·mesh/UV/weights 유지. 새 환경 asset/composite0 |
| MEDIUM | connections / remaining holes | 기존 연결·홀 유지 |
| GROUND | shadow / contamination / structure integration | 기존 지면 표현 유지 |
| PLAYABLE | main arenas / travel space / breathing space / threat space | native 공간·판정·위험 면적·맵 nav/collision 변경0 |
| PLAYABLE | combat readability | 최종 slam 원본116frames/44observer의 wind/strike/recover/idle·entry/null/return 관측. 화면내 배치/death overlay0는 당시 기술 표본. 의상 intact·현재 모델 품질 인수 FAIL |
| LANDMARK | primary / secondary / tertiary | 변경0 |
| CAMERA QA | START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | ARENA의 own QA1280×720 표본만. 기존 safeRect left60/top90/right1050/bottom570 보존. running44/44 fit.ok&&contained, frame17/22/41 전신·지팡이 screen inside; ambient crop/fullstage/START..EXIT 전route 인수0 |
| TECH QA | route / collision | 변경0, 새 route/collision 검사0 |
| TECH QA | pageerror / 404 | 이번 단위 전체 network404/pageerror 집계 미수신·미측정. root source syntax12units/diff PASS와 구별 |
| TECH QA | seam / loading | source PNG/19본/mesh/UV/weights/fixture 유지. entry/null/return과 fullbody screen-inside만 당시 관측. 의상 변형 틈 확인으로 모델 인수 FAIL; 전방위 seam/8방향/모든 legacy clip 인수0 |
| TECH QA | performance | fan min46/median55/max106FPS·slam min63/median69/max119FPS는 짧은 native rolling 표본. pause 영향/녹화 overhead 포함, sustained60FPS/전체 GPU bench PASS0 |
| FILES | stage-owned | root bridge/game/new test, math 담당 rig.js/compiled test, 문서 담당 이 정본+13append |
| FILES | concurrent touched | 다른 담당 WIP 보존·owned delta와 원문 SHA 분리 |
| FILES | unrelated touched | 보호2_3/마케팅/source/구proof/browser/tests 변경0 |
| GIT | staged / commit / push / deploy | 문서 담당 mutation0. root가 code+docs checkpoint 별도 소유 |
| VISUAL VERDICT | PASS / RETOUCH / FAIL | **FAIL / USER_REJECTED_OLD_MODEL**. 신규12고유 검사·카메라·재시작 표본은 역사적 기술 기록이며 구형 의상 모델의 visual 인수 근거가 아님 |
| NEXT PASS | next pass | 최신 검은 후보 exact 선택·모델 승인과 의상 원형/연속 topology 확보가 먼저. 구형 f0 tint·보간으로 대체0. 기존 전체 표현·true24 이미지·1280×72060FPS 지속 목표는 미인수 |

<!-- DARK_DRUID_SMOOTH_MOTION_REPORT_END -->
