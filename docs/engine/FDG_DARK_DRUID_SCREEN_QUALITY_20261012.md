# 다크드루이드 화면 품질 수리 · 2026-10-12

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

## 2026-10-12 · 현재 상태 정정

**USER_REJECTED_OLD_MODEL / VISUAL FAIL — 구형 f0 모델의 현재 품질 인수는 거절됐다.** 사용자 지적은 치마 파손·모델 원형과 최신 검은 드루이드 자료 불일치다. 아래 과거 기술 검사·카메라·재시작 기록은 보존하되, 화면 안에 들어온 본체를 온전한 의상이나 승인 모델로 인수한 것으로 읽지 않는다.

| 정정 항목 | 현재 인수 경계 |
|---|---|
| 사용한 구형 source | assets/sprites/boss/boss_dark_druid_f0.png, 355×541 RGBA, SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 최신 검은 드루이드 승인 모델로 대체해 기록하지 않음 |
| 모델 결함 | 원화 가장자리 alpha 및 r5 의상 분리 경계·변형 틈이 확인됨. camera contained / fullbody screen-inside는 의상 intact·모델 품질 PASS의 근거가 아님 |
| 보존 / 다음 인수 | 기존 이미지·fixture·commit·12종 math/bridge 검사·overlay restart 기술 성과는 이력 보존. 10/9 black maxSW 후보 exact 선택·모델 승인은 pending이며 새 모델·전체 완성 주장0 |

[구형 source·의상 topology 정정 수치](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 기본 모델과 역사 QA 선택 gate의 최종 코드 계약은 root의 확정 기록을 따르며, 이 정정은 미확정 계획을 계약값으로 추가하지 않는다.

현재 작업은 자기 저장 격리 r4 + 접촉 리그 r5 + 표시 정책 r9 + 나무가시 first를 함께 선택한 QA 소비 경로의 화면 수리다. 기존 r3/r4/r5/r7/r8/r9/first 보고와 실패 자료는 동결 이력으로 보존한다. 이번 정본은 새 카메라·idle 소비·Q 접촉 표시 계약과 새 실제 검수만 기록한다. **ready/Q 장식 preview/fan 단계는 당시 기술 관측이며, 구형 f0와 치마 파손에 대한 현재 모델 인수는 VISUAL FAIL / USER_REJECTED_OLD_MODEL이다. 실제 완결 전투·24장 캐릭터·60FPS 완료 판정은 인수하지 않았다.**

## 범위와 제작 목표

| 항목 | 현재 계약 / 목표 | 상태 |
|---|---|---|
| 현재 대상 | 맵1·플레이어1·Dark Druid NORMAL의 slam + fan 실제 전투. 자기 r4 격리 활성 + r5 리그 + combat r9 + thorn first 선택 경로 | 이번 화면 검수 범위 |
| 보호 | native 좌표·AI·입력·Q/E 패링·damage·poise·타이머·탄 life/위험 면적·맵 geometry/nav/collision·원 PNG/UV/색/재질·19본·사용자 save | 표시 소비 외 변경0 |
| 몸·무기 | 목표는 전신/무기 crop0·접점 seam0. 당시 표본의 screen-inside 관측만 보존 | 의상 원형/변형 틈은 별개이며 현재 구형 모델 인수 FAIL. 전 동작 seam0/전체 화면 완료 주장0 |
| 캐릭터 프레임 | 실제로 서로 다른 캐릭터 이미지24장 + 재생24FPS | 현재 미충족. 리그 sampling FPS나 Q 효과24cell로 대체0 |
| 해상도·성능 | 1280×720에서 실제 60FPS | 목표; 측정/성능 PASS0 |
| 적용 흐름 | ENGINE_AUTHORING → shared data → main consumer → profiling/visual QA → 새 캐릭터 반영 | 작은 실제 제작 단위마다 인수 |
| MAP 선행 | MAP GUIDE v0.9 전체와 SSOT index 읽기 순서 적용. MASTER → OUTER → MEDIUM → GROUND → PLAYABLE → LANDMARK → CAMERA QA → TECH QA | 이번에는 기존 맵 구조를 유지하며 좁은 CAMERA/COMBAT/TECH 소비만 수리 |

이번 작업에서 제안한 시각 참조는 [Diablo II: Resurrected의 공식 Technical Alpha Learnings](https://news.blizzard.com/en-us/article/23695734/technical-alpha-learnings)와 [Hades II 공식 게임 페이지](https://www.supergiantgames.com/games/hades-ii/)를 참조한다. Blizzard 글은 기존 미술 성격을 보존하며 시각 요소와 UI 가독성을 개선한 사례를 설명한다. 재질·실루엣·일관된 어두운 조명 기준은 이번 작업에서 제안한 제작 방향이다. 사용자 승인 레퍼런스로 기록하지 않는다. Hades II의 준비→타격→회복·효과 가독성을 관찰 기준으로 삼는 것도 이번 작업에서 제안한 제작 방향이며, 공식 페이지가 이 설계 공식을 보장한다는 뜻은 아니다. 두 작품과 동등한 품질을 달성했다는 주장0.

## 현재 소비 접점

| id / 적용 위치 | 정확한 소비 | 변경하지 않는 계약 |
|---|---|---|
| game paused draw | 물리 정지 draw에서도 QA frame fit을 dt=0으로 호출. paused previous=undefined로 ideal center/target zoom을 즉시 소비하고, unpaused는 기존 G.cam/zoom previous smoothing 소비 | stageTime/actor/AI/projectile/physics 시간 그대로 |
| QA combat framing | combatFraming 옵션의 ready / forced-pattern / native-ai / player-dead에서 **현재 살아 있는 보스**만 fit. 이때 cameraLock getter는 null로 static lock을 우회 | 저장된 raw cameraLock 설정과 getter/snapshot은 구별. 죽은 보스 캐시를 live fit 성공으로 계산0 |
| fitDruidCombatFrame | 기존 bounds·safeRect·mapBounds 교집합, zoom-out 즉시 / zoom-in 및 center smoothing 계약 유지 | world placement / native facing / native mouse·GP 규칙 임의 변경0 |
| bridge idle loader | first + r5 loader가 idleClipId='dark-druid-slam-contact-idle-r5', getAnimationTime=()=>G.stageTime/60 제공 | 선택하지 않은 idleClipId 기본 null 및 기존 fallback 보존 |
| idle sample | 2초 loop / 24FPS. time=(floor(seconds×24)/24)%2, seconds=G.stageTime/60. finite nonnegative clock + normal stage0/3·!finale·alive·HP>0·idle·stun0 소비 | 새 RAF/timer 또는 native AI clock 변환0. walk/다른 상태/변신은 원래 fallback |
| frozenBossAlpha | paused physics + combatFraming 옵션 + ready/forced-pattern + 현재 live boss에 한해 **몸 draw alpha만1**. 그 외 native spawnAlpha 그대로 반환 | _spawnT·HP·pose·AI·physics write0. 새 ready 전신 VISIBLE 관측; 이 함수 자체는 thorn flag로 별도 gate된다고 기술하지 않음 |
| ready HUD | ready timer의 owner callback updateHUD(true)로 현재 값 갱신 | 임의 actor 상태/체력 설정0 |

### 새 Q 접촉 효과 계약

| id / 항목 | 값 / 적용 위치 | 의미와 제한 |
|---|---|---|
| module / factory | engine/fdg/druid-parry-contact.js / createDruidParryContactRenderer | 소유 QA 활성 + thorn first + combat r9 loader에서만 연결 |
| sheet | cached canvas, 6×4 / cell128 / 24개의 서로 다른 procedural effect cells | atlas 768×512. 캐릭터24장·새 PNG·새 그래픽 backend가 아님 |
| 재생 | FPS24 / world96 / visual1초 / 마지막 frame23 transparent | native ageFrames.t/60을 sampling. native pool72 유지 |
| game common boom | kind dark02일 때 새 renderer가 true를 반환하면 override. false/다른 kind는 기존 fallback | kind 자체가 Q 성공 관측의 충분조건은 아님 |
| 보호 | native Q72 / boom.r80 / E·AI·damage·reflection 규칙 그대로 | 효과의 시각 cell 수를 판정 프레임·native TTL로 승격0 |
| 공개 표시 preview | toolbar **Q 패링 효과 미리보기**는 thornFirst + previewParryContact callback 존재 조건. root callback은 기존 _dark02Impact(P.x,P.y−20)만 호출 | 장식 preview이며 native Q 성공/반사 이벤트를 만들었다고 주장0. 공개 1틱 진행으로 실제 효과를 관찰 |
| cache query | bridge / QA / Q renderer loader: v=screen-quality-20261012-final2 | 현재 새 접점 cache 갱신; frozen 보고의 query는 소급 변경0 |
| 기존 r9 | medium core0..7 및 tail/smoke 정책의 동결 보고는 이력으로 유지 | 새 dark02 반환 경로를 이전 r9 actual 적용 PASS로 소급0 |
| 미변경 legacy | physical boom 최소66 등 이번에 고치지 않은 native pool duration 유지 | 별도 scope 확대0 |

나무가시의 pool.r5.2와 player collision은 서로 다른 값이다. 후처리 sz2.4에서는 base=P.r+7.2, 일반 gate=P.r+11.2이며 기존 Q/E 확장 및 현재/이전 player·shot 선분 sweep을 유지한다. 새 시각 silhouette나 카메라 bounds로 판정을 바꾸지 않는다.

<!-- SCREEN_QUALITY_RESULTS_BEGIN -->
## 새 검수 결과

| 구분 | 새 근거 | 판정 / 한계 |
|---|---|---|
| bridge idle CPU | 신규5/5 PASS | 실제 24장 캐릭터·60FPS PASS가 아님 |
| Q renderer | 신규4/4 PASS | actual Q input/반사 성공을 증명하지 않음 |
| QA preview CPU | 고유9종 최종 PASS. 최초5/5, 확장7/7, 마지막2종 중 camera PASS/cleanup fixture FAIL 후 button1/1 수리 PASS. 마지막 단계 성공 기존7종 재실행0 | 한 번의9종 최초 ALL PASS 주장0; fixture 수리를 제품 fault로 확대0 |
| root consumer VM | 고유3종 최종 PASS. 최초2/3, fixture의 illegal return syntax만 수리한 실패1종 재실행 PASS | actual browser/visual과 별도 |
| 새 검사 합계 | idle5 + Q4 + QA preview9 + root consumer3 = 고유21종 증분 인수 | one-command21종 최초 PASS 주장0. old suite0 |
| 중간 ready 실패 | body bounds {left:2232.576,top:1643.456,right:2927.424,bottom:2680}, zoom0.4538818243 / contained:true였으나 _spawnT20 alpha0로 몸 invisible | camera-onlyafter-ready-oldalpha 중간 실패 자료 보존. contained=true를 몸 표시 PASS로 확대0 |
| 최종 ready | fixed-ready-full.png/state.json: 1280×720, ready paused, P HP654/HUD654, _spawnT20/stageTime0, idle clip time0/rasterRevision2, contained:true. 뿔/지팡이/코트/양발 전체 VISIBLE | ready frozen 표시 관측. 정상 전투·모든 pose seam0 PASS가 아님 |
| near100 fit | public QA 관측: P(2580,2280)/boss(2580,2180), actual zoom=target0.6516922274840337, ideal camera(2710.429667,2057.762), contained:true | 카메라 actual/target 일치. world 좌표를 코드에서 변경했다는 뜻이 아님 |
| 최종 ready 원본 | final-full-body-ready.png/state: near100/compact, P HP558, bossHP21017, zoom0.6516922274840337. 전신 포함 | 앞선 fixed-ready HP654 및 이후 preview/fan 피해 시점과 구별. 뿔/지팡이/코트/양발의 이 표본 포함 사실만 인수 |
| Q 장식 preview | contact-preview-frame0-full.png/state.json 및 contact-preview-samples.json, age6/16/60 full PNG. dark02 native pool t0/6/16/60, mt72/r80; sample formula frame0/2/6/23 | 실제 새 장식 효과 표시 관측. age60의 transparent tail에는 이전 큰 보라색 잔광이 보이지 않음. 작은 표시여서 서로 다른24cell 전체 pixel PASS는 미인수 |
| preview 입력 의미 | qa-contact-preview1 / native parry events0. 공개 미리보기 callback + 공개60틱으로 stageTime0→60, P HP558→509.66875 | native Q 성공/강제 Q 소비0. 다른 적/native damage로 HP 감소; 효과 preview를 전투 PASS로 승격0 |
| fan 공개 단계 | 공개 fan 준비 후18/6/15 manual step. 관측 bossFanWind st2=18/clip0 → recover45/clip1 → recover15/clip1.15 → idle st2≈5.5373/idle clip1.625 | 관측 전 단계 contained:true. root가 본 세 full PNG에서 몸/뿔/지팡이/양발 unclipped. natural AI 연속 실전이 아님 |
| fan 당시 native 상태 | P HP509.781→396.809(stagger)→136.856(pStun), bossHP21017 alive. Defeated/death 미관측 | player 피해·보스 생존 그대로 보존. kill/완결 전투 PASS0 |
| 남은 화면 | legacy projectile/ambient actor/text의 겹침 및 age60 old slashwind body fallback 잔존 | VISUAL RETOUCH. exact residual1=WHOLE_COMBAT_VISUAL_UNIFICATION |
| 미측정 | 이번 natural-AI full run / renderer instrumentation / draw log / 실제60FPS 없음 | paused render stats를 normal combat60FPS로 확대0 |
| 보호·작업 | 문서 담당 code/browser/test/Git mutation0. docs/2_3 변경0 | 이전 자료 재생·old suite·frozen 이력 재판정0 |

증거 E: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-screen-quality-fix-20261012. root가 실제 원본을 검수하고 전달한 새 facts만 인수했다. 문서 담당은 원PNG·과거 proof를 재검수하거나 source를 수정하지 않았다. 추가 최종 artifact/hash/checkpoint 목록은 root 별도 receipt에 기록한다.

**현재 모델 VISUAL VERDICT: FAIL / USER_REJECTED_OLD_MODEL.** 당시 **WHOLE_COMBAT_VISUAL_UNIFICATION 1건** 기록은 구형 source/의상 파손을 인수한 것으로 사용하지 않는다. 플레이어/보스의 화면 scale, legacy 동작, 몬스터/FX 통합, 실제24장 캐릭터와 성능 목표를 함께 인수해야 한다. 이번 ready/fan crop 수리와 장식 Q 표시를 전체 전투·전체 엔진 완료로 확대하지 않는다.
<!-- SCREEN_QUALITY_RESULTS_END -->

<!-- SCREEN_QUALITY_REPORT_BEGIN -->
## MAP PRODUCTION REPORT · §23

| 항목 | 하위 항목 | 이번 단위 기록 |
|---|---|---|
| STAGE | stage | 기존 CH1 / Dark Druid NORMAL 자기 QA. 맵 구조 변경0, 화면 소비 수리 |
| MASTER | silhouette / regions / main route / side spaces | 모두 기존 LOCK 유지. 새 맵 디자인/route 제작0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 변경0. 과거 맵 검사 재수행0 |
| LARGE | source assets / composites / overlap / repeated silhouette | 승인 PNG·리그 원자산 유지. 새 환경 composite/prop 변경0 |
| MEDIUM | connections / remaining holes | 기존 연결/홀 유지, 재판정0 |
| GROUND | shadow / contamination / structure integration | 기존 지면 표현/통합 유지 |
| PLAYABLE | main arenas / travel space / breathing space / threat space | geometry·판정·위험 면적·이동 공간 유지 |
| PLAYABLE | combat readability | 새 ready 및 fan 세 단계 뿔/지팡이/양발 unclipped. legacy projectile/ambient/text와 old slashwind body 잔존. 구형 의상 모델 현재 인수 FAIL |
| LANDMARK | primary / secondary / tertiary | 변경0 |
| CAMERA QA | START | ready frame fit 중간 alpha0 실패 보존. 앞선 fixed-ready HUD654, 최종 near100/compact P558·boss21017·zoom0.6516922274840337은 서로 다른 ready 표본이며 전신 VISIBLE/contained:true. 정상 전투 판정은 별도 |
| CAMERA QA | EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | public near100·공개 fan 단계는 actual camera fit/contained:true 관측. 나머지 전 route/전체 stage 재검수0 및 PASS0 |
| TECH QA | route / collision | 코드·geometry·player hit gate 변경0. 신규 route/collision 테스트 실행0 |
| TECH QA | pageerror / 404 | 이번 새로운 원본 화면/상태만 인수. 문서 담당은 browser/오류/전체 네트워크 계측0; 전체 404/무오류 PASS 주장0 |
| TECH QA | seam / loading | 기존 PNG/UV/19본 유지. 새 ready/fan crop 관측만으로 전 동작 seam0·전체 loading PASS 주장0 |
| TECH QA | performance | 1280×72060FPS 목표. measured PASS0 |
| FILES | stage-owned | game/QA/bridge/Q effect 접점은 root와 해당 worker 소유. 문서 담당은 이 정본 + 지정11문서 append |
| FILES | concurrent touched | 다른 작업자 WIP 유지. owned delta·원문 SHA 분리 기록 |
| FILES | unrelated touched | 문서 담당 source/browser/test/foreign WIP/보호2_3 변경0 |
| GIT | staged / commit / push / deploy | 문서 담당 실행0. checkpoint는 root 별도 소유 |
| VISUAL VERDICT | PASS / RETOUCH / FAIL | 현재 구형 모델 인수 FAIL / USER_REJECTED_OLD_MODEL. 고유21종 기술 PASS·camera contained로 대체0 |
| NEXT PASS | next pass | exact1 WHOLE_COMBAT_VISUAL_UNIFICATION: player/boss scale·legacy actions·monster FX·true24 character images·실제 성능 목표 통합 인수. native 계약/원PNG/맵 보호 |

<!-- SCREEN_QUALITY_REPORT_END -->

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
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 화면내 배치만 당시 확인. 의상 intact·모델 품질 인수0. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위는 당시 기술 구현 기록·현재 구형 모델 인수 VISUAL FAIL / USER_REJECTED_OLD_MODEL. 당시 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
