# 다크드루이드 나무가시 일제발사 · first · 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

## 2026-10-12 · 현재 상태 정정

**USER_REJECTED_OLD_MODEL / VISUAL FAIL — 구형 f0 모델의 현재 품질 인수는 거절됐다.** 사용자 지적은 치마 파손·모델 원형과 최신 검은 드루이드 자료 불일치다. 아래 과거 기술 검사·카메라·재시작 기록은 보존하되, 화면 안에 들어온 본체를 온전한 의상이나 승인 모델로 인수한 것으로 읽지 않는다.

| 정정 항목 | 현재 인수 경계 |
|---|---|
| 사용한 구형 source | assets/sprites/boss/boss_dark_druid_f0.png, 355×541 RGBA, SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 최신 검은 드루이드 승인 모델로 대체해 기록하지 않음 |
| 모델 결함 | 원화 가장자리 alpha 및 r5 의상 분리 경계·변형 틈이 확인됨. camera contained / fullbody screen-inside는 의상 intact·모델 품질 PASS의 근거가 아님 |
| 보존 / 다음 인수 | 기존 이미지·fixture·commit·12종 math/bridge 검사·overlay restart 기술 성과는 이력 보존. 10/9 black maxSW 후보 exact 선택·모델 승인은 pending이며 새 모델·전체 완성 주장0 |

[구형 source·의상 topology 정정 수치](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 기본 모델과 역사 QA 선택 gate의 최종 코드 계약은 root의 확정 기록을 따르며, 이 정정은 미확정 계획을 계약값으로 추가하지 않는다.

소유 checkout: `/Users/fordeargamers/the-exoduser`. 기존 contact live-fix `49620b90`는 인수·동결 이력이다. 이 문서는 새 나무가시 공격만 기록한다. 실제 기존 WebGPU 게임에서 준비→발사→회복과 공개 E 물리가시 반사를 확인했다. 자연 AI는 다른 공격을 선택했고 플레이어가 사망했다. 당시 RETOUCH 기록은 보존하나, 현재 구형 본체 모델 인수는 **VISUAL FAIL / USER_REJECTED_OLD_MODEL**이다. 전체 엔진·보스전 완료 PASS0.

## 실행과 공개 제어

[새 나무가시 공격 QA 열기](http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5&fdgDruidCombat=r9&fdgDruidLiveFix=contact&fdgDruidThorn=first). 기존 Node `server.cjs`의 포트3333을 사용한다. 별도 서버/본편 API 변경0.

| 순서 / 제어 | 정확한 소비 |
|---|---|
| 초기 | 자기 QA의 native Lv1 기본 캐릭터, physics pause. 기존 native 기본장비 난수로 새 실행의 HP가 달라진다 |
| 선택 | pattern `fan`, phase0, 보스 배율×0.5. `정면 340px` 또는 `옆 340px`는 명시 공개 QA placement이며 자연 이동으로 표기하지 않는다 |
| 준비·STEP | `선택 패턴 준비(정지)` → `1틱 진행`. 실제 native FSM/timer/탄 소비. `프레임 카메라 ×0.5`는 카메라만 고정 |
| 정상속도 강제 샘플 | `선택 패턴 실행` 후 공개 게임 입력. `forced-pattern`이며 자연 AI 선택이 아니다 |
| 자연 AI | 새 baseline에서 `AI 시작`, 실제 WASD/Q/E 입력. 선택 패턴 실행·HP3000·페이즈 조작을 사용하지 않은 별도 샘플 |
| 게임 포커스 | 게임 canvas를 누른 뒤 키 입력. E physical / Q magic, 기존 날개치기의 조건부 magic E 예외 유지. blackBean Q 전용/E 불가 |
| 저장 | 공개 `QA 설정 저장`만 persistent own key에 기록. actor HP/좌표/timer는 저장하지 않는다 |

## 현재 코드 계약

| id / 적용 위치 | 값 / 공식 / 제한 |
|---|---|
| gate | `_FDG_DRUID_THORN_FIRST = window._FDGDruidQaStorage.active && fdgDruidThorn=first`. 기존 host/port/path/test 격리 필요. 실제 fan은 ib=true·stage0/3·!finale·phase0/1에만 적용 |
| 발사 | 기존 `bossFanWind` st2<=0 한 native tick에서 **12발 동시 생성**. 물리 lane0/1/3/4/6/7/9/10=8발, 마법 lane2/5/8/11=4발(i%3===2). 이 범위 blackBean0 |
| 방향 | aim=atan2(P.y−e.y,P.x−e.x), fanW=π(.7+.06phase), lane angle=aim−fanW/2+fanW×i/11. phase0 폭126°, phase1 폭136.8°. 발사 후 hostile velocity 고정·타깃 추적0 |
| 준비·예고 | start/wind의 facing과 바닥 예고 aim을 같은 native atan2P로 정합. `_druidFanWindMax`에 실제 시작 st2 저장; 예고 progress=clamp(1−st2/windMax), 폭도 실제 fanW. 기본 옵션 없는 예고는 기존값 유지 |
| pool / 밀도 | `_druidThornVolley` 기본/reset false, `_druidThornLane` 기본/reset−1. 이 instance만 modulo3 drop·생성 직후 decoy/ancestor 방향 재지정 제외. 전역 drop/유도 규칙은 그대로 |
| 속도 | 입력4.4px/native f, 기존 후처리 physical5px/f(60Hz에서300px/s), magic500/60..600/60px/f(500..600px/s). magic 난수 유지. clip24FPS와 별개 |
| 피해 / 속성 | n=floor(atk×1.3), physical=floor(floor(2n)×.5), magic=floor(2n). UNIT atk103은133/266, 실제 촬영 atk46은59/118. 기존 독 wrapper EL.P/col#66dd22·실제 HP 피해시 중독+3 유지. 색/EL은 parryClass를 바꾸지 않는다 |
| 판정 / 수명 | 후처리 sz2.4·pool.r5.2. 일반탄 player 접촉 base `_pCollR=P.r+p.sz×3=P.r+7.2`, 기본 비패링 gate `_normalR=_pCollR+4=P.r+11.2`; 기존 Q/E 확장·현재/이전 플레이어 및 탄 선분 sweep 유지. nominal life/ml400, life−=sp×.667 및 magic 카메라2500px 이내 또는 실제 가시 영역+100px 이내 life 연장, 두 범위 밖에서만 원거리 정리(2026-10-31 웹 기준). 정확400tick 종료로 표기하지 않는다 |
| 시간 / cd | 기존 wind=floor(25×teleM)+extraDelay, phase0/1 base18/16native f. 발사 직후 recover45→다음 기존 update에서20 clamp. cd100 유지 |
| scope 보존 | phase2+ 기존 요청수/드랍/black slots, 피날레·다른 보스·기본 main·Q/E/poise/자원·native AI·사용자 save 권위 유지. 어택티켓0 |
| native loader | 새 gate만 bridge `?v=thorn-volley-first`, QA `?v=thorn-volley-first2`, 옵션 thornVolley:true. 기존 모듈 query는 그대로 |
| 관측 UI | aria `드루이드 나무가시 공격 QA`, title `DARK DRUID · 나무가시`, leaf 안내 physical8/E+magic4/Q·발사 후 직진·준비/발사/회복 |
| camera bounds | hostile physical 반경33 / magic31의 표시 envelope. friendly는 기존 bounds. pool.r5.2·player 접촉 base P.r+7.2/기본 gate P.r+11.2와 별개이며 카메라 envelope로 판정을 바꾸지 않는다 |

## 실제 본체·가시 저작

| 자원 / 저작 | 현재 구현 |
|---|---|
| 본체 | 구형 f0의19본·mesh·UV·weights·texture를 유지했던 당시 기술 기록이며 현재 모델 인수 FAIL. `druid-thorn-pose.js`가 기존 bridge에 runtime clip을 생성하며 원 rig JSON/기존 clip array를 수정하지 않는다 |
| clip | `dark-druid-native-thorn-fan-first`, duration1.6초, fps24, nonloop,12tracks×6keys=72keys. seconds=[0,.55,1,1.12,1.3,1.6], bind-relative 값 정본은 [FDG_RUNTIME](FDG_RUNTIME.md)의 first 부록 |
| 움직임 | pelvis/spine/chest, 왼쪽 upperArm/forearm/hand·오른쪽 upperArm/forearm, coat4. 뒤로 준비→앞으로 발사→옷자락 후행→bind 복귀. staff는 기존 leftHand 자식, feet/root/head 직접 새 track0 |
| native 소비 | 실제 wind st2를 WeakMap으로 읽어 time0..1. 발사 transition recover45에서 time1, 기존20 clamp 뒤 progress=clamp(1−min(st2,20)/20)로 time1..1.6. markers release<=1.12/follow<=1.3/recover<=1.6 |
| 중단 / 캐시 | 죽음·stunned·hitStun·nonfinite timer·다른 state에서 취소. 같은 paused pose는 clock 증가0/raster rewrite0. clipId별 pose/raster key와 변경 revision으로 기존 WebGPU consumer 사용 |
| physical 형상 | `ENGINE_AUTHORING` 목질 path, localX[-27,32] 길이59worldpx·Y±10 폭20. quad 몸체·삼각 barb2·inner ridge. 기존 GPU fill에 맞춰 각 path vertex<=4, 총5fill |
| physical 색 | bark#2b1a11, inner#a77943, ridge#dfc18b, stroke#50321a width1.5. native vx/vy 방향으로 회전 |
| magic 형상 / 색 | diamond X[-15,18]/Y±12, trailX[-30,-8]; fill#185744/outline#7de6b2 width2/core#efffd4. trail#78eac7 width3·alpha×.45 |
| 소비 / 자산 | `_druidThornVolley && !friendly`에서만 새 형상. friendly blue는 기존 렌더·유도. 새 PNG/texture/PixelLab/캐릭터 생성/mesh backend0. 본체 front mirror가 8방향 신규 모델을 뜻하지 않는다 |
| 24 구분 | 이 unit의 fps24는 clip 저작 metadata다. 24장 신규 캐릭터 bitmap 제작 또는 화면24FPS 고정을 완료했다고 표기하지 않는다 |

## 새 검사와 실제 관측

증거 루트 E: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-thorn-volley-first/`. 기존 contact/r9의 검사·영상을 새 결과로 합산하지 않는다.

| 고유 검사 / 이력 | 결과 / 범위 |
|---|---|
| pose 최초 검사 | 새 `fdgDruidThornPose.test.mjs` **3/3 PASS**,861.585708ms. 기존 rig 무변경·feet fixed·hand/staff·bind 복귀·native timer/interrupt·clip cache. 기존 suite/재실행0 |
| volley 최초 검사 | 새 `fdgDruidThornVolley.test.mjs` 최초 **5/6 PASS**. inactive stage4 기대수3 대신2인 harness assertion1FAIL, 코드 gate 오류 아님 |
| harness 수리 | scope 기대값만 실제 inactive raw8/modulo3에 맞춤, 실패한 고유그룹1/1PASS. 실패 로그 보존 |
| 신규 GPU 소비 / aim | GPU fill 수정 후 silhouette+classic 관련2PASS; 실제 facing/예고 정합 추가 뒤 신규 wind-aim1PASS. 결과 **7고유그룹 PASS**이며 최초7/7로 표기하지 않는다 |
| 현재 parse | 마지막 loader/title/aim 수정 이후 classic-only1PASS,92.311208ms(검사30.960417ms), module3개 node --check 각각exit0. 다른 accepted suite 재실행0 |
| 기술의 한계 | VM native 소비 계약과 source compile은 실제 Q hold·자연 AI fan·전체 보스전 시각 PASS가 아니다 |

| 실제 신규 자료 | 관측한 값 / 실패 포함 |
|---|---|
| final 준비 8step | native bossFanWind/st2=10, clip wind/time.444444, shots0, HP564. 새 baseline의 초기 fade 후 본체 visible |
| final 준비 17step | wind/st2=1, time.944444, shots0, HP468.209375 |
| final 발사 18step | 실제 recover45/time1/release, 새12발8/4, HP447.2125. 12 native-shot 동일 관측ms, 별도 wave 없음 |
| final 후행 26step | recover13/time1.21/follow,12발 존속, HP248.2375 |
| final 회복 38step | recover1/time1.57,12발, playerHP0/dead, bossHP21017/alive. 주변 화마귀·native field 압력이 포함되어 모든 HP 감소를 fan 피해로 귀속하지 않는다 |
| 실제 직선 추적 관측 | release18→follow26→recover38의 동일 lane12개 vx/vy 최대변화0. native boss facing/위치는 회복 중 바뀌어도 hostile ray heading은 유지. `final-numerics.json`에 계산·원자료 연결 |
| 공개 E 소비 | 새 native baseline HP597. 실제 canvas KeyE down/up→sDraw→sBash. `native-parry` inputE/impactKind physicalProjectile/physical/druidStraight=true **확실한1건**, 이후 native-reflection homing=true·friendly blue. lane6 physical 반사 확인 |
| E 조건부 별도관측 | 추가 E magic/null impact callback·주변 nonfan 반사도 원자료에 존재. 기존 wing/general 소비를 유지했으며 Q 성공으로 재분류하지 않는다 |
| 공개 Q 한계 | pause에서 Q tap 성공0. canvas 실제 Q tap도 정상속도 성공0. 도구 pressKey는 약1ms down/up라 held-Q 검수는 NOT_TESTED. 지원하지 않는 CDP Input 요청은 실제 입력0으로 기록; actor/키 상태를 console로 강제하지 않았다 |
| 정상속도 forced | full114frames / capture wall5095ms. public force fan1, HP521→125.59375000000232/pStun, bossHP21017/alive·eShield17744. native-shot12, E/Q parry0. 보스 HP 피해0이며 shield 감소3273 관측 |
| 자연 native AI | full172frames / capture wall7037ms. 강제pattern0, 선택 beanStorm→groundFissure→charge→slam→slashCombo. fan0/newthorn0·E/Q0, HP595→0/fallen, bossHP21017/alive·eShield18881. shield 감소2136·kill0. 이 결과를 자연 fan 성공으로 올리지 않는다 |
| runtime 예외 | forced/native AI screencast의 Runtime.exceptionThrown 각각0. 이것이 전체 network404/모든 console path 검증은 아니다 |
| 저장·재열기 | 공개 own save write1, fresh reopen own read1/write0/restored=true. config distance340/patternfan/phase0/scale.5. key `fdg.qa.dark-druid.encounter.r4`와 schema1/9field whitelist 유지. actor 저장0/HP3000 사용0/console HP·좌표·phase·timer 쓰기0 |
| 남긴 검수 화면 | 새 native baseline HP632, 공개 front340/camera×.5/prepared fan 뒤17step. bossFanWind/st2=1·shots0에서 물리 정지. `1틱 진행`이 실제12발을 발사한다. 새탭37 deliverable 유지, 이번에 만든 추가탭38만 정리; 사용자/동결 기존탭 변경0. E/deliverable/ready-full.png·state.json |
| 성능 범위 | 실제 renderer WebGPU. 단일 전투 observer draw 비용은 부분 CPU sample이며 GPU time/대규모 동시 몹/성능 최적화 인수로 사용하지 않는다 |

fullframes와 JSON은 E의 `final-poses/`, `public-parry/`, `normal-speed-forced/`, `native-ai/`, `save-state.json`, `reopen-state.json`에 보존한다. 파생본은 `derived/`의 fullframe GIF2개·대표PNG3개·SHA receipt를 따른다. 원본 프레임을 골라 없애거나 실패 사망 화면을 자르지 않는다. 화면 HUD와 JSON polling은 근접 자료이며 같은 capture tick이라는 보장은 없다.

| 파생 fullframe GIF | 원본 전체 장수·크기 | 실측 CDP 구간 / 인코딩 시간 | 정확한 변환 |
|---|---|---|---|
| [강제 fan 전체114장](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-thorn-volley-first/derived/normal-speed-forced-all-frames.gif) |114 / 1280×720|4.895174초 /4.940초|원 timestamp 누적10ms 양자화4.900초+마지막40ms. 84126122B|
| [자연 AI 전체172장](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-thorn-volley-first/derived/native-ai-all-frames.gif) |172 / 1280×720|6.947742초 /6.990초|누적양자화6.950초+마지막40ms. 125879931B|

마지막40ms는 각 clip의 원본 interval median을10ms로 반올림한 관례적 hold이며 마지막 이후 실측이 아니다. nativeAI13→14의 원간격1.07193ms를 GIF 최소10ms로 보존한 후 원 timestamp로 복귀, 최대 누적 phase 오차7.645ms(forced4.973ms). 삭제·추가·보간·crop·resize0, GIF 재개방 count/size/duration 및 quantized-source RGB 전프레임 검수 완료. 준비0004·발사0006·회복0010 full PNG와 SHA·원 state의 approximate 연결은 [파생본 receipt](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-thorn-volley-first/derived/thorn-capture-derivatives-receipt.json)에 기록했다. 녹화 장수·wall 시간·CDP 시간·GIF 시간·native tick·clip FPS를 구분한다.

## MAP PRODUCTION REPORT · §23

| 항목 | 이 unit의 실제 보고 |
|---|---|
| STAGE | 기존 stage0 NORMAL 드루이드 아레나의 공격 caller·본체 동작·카메라 소비 QA. 신규 맵 제작0 |
| MASTER PLAN | silhouette/region/route/sides 새저작 N/A. 기존 배치와 LOCK 유지 |
| LARGE OUTER MASS | left/right/top/south/holes 변경0·새 시각 인수 N/A |
| LARGE | 환경 asset/composite/overlap/repeat 변경0. 목질 projectile path와 기존 본체 clip만 신규 |
| MEDIUM CONNECTION | 환경 연결 변경0·N/A |
| GROUND CONNECTION | 바닥/접합 변경0·N/A. fan 바닥 예고의 actual wind·aim·폭만 동기화 |
| PLAYABLE / COMBAT | Lv1 native 캐릭터·기존 충돌 공간. 새12발·공개 E 물리반사 관측, held-Q·자연 fan 미인수. forced sample 생존하나 pStun, 자연 AI sample 사망 |
| LANDMARK / CENTER | 기존 arena/보스 중심. 새 랜드마크 제작0·N/A |
| CAMERA QA | 준비/발사/회복 fullframes·forced 정상속도·자연 AI 교전 fullframe 확인. 이동 전신·projectile bounds 기존r9 소비+새 thorn envelope. 입구/early/sides/late/exit 완주 검수 N/A |
| TECH QA | 새고유 pose3+volley7 PASS 및 최종parse. 격리 save/reopen 확인. route/collision/seam/loading 전체 gate 재검사0. runtimeexception0; 404/전체성능 완전PASS 주장은 없음 |
| FILES | own game.html, bridge, QA, new pose helper, tests2, 관련 docs. 환경/다른 팀/마케팅/Hell WIP 제외. 정확 소유 파일·SHA는 E final receipt |
| GIT | working+HEAD 외부 백업 후 소유 normal checkpoint. 코드+관련 docs만 포함. commit 해시는 E checkpoint receipt, push0/deploy0 |
| VISUAL VERDICT | **현재 본체 모델 FAIL / USER_REJECTED_OLD_MODEL**. 발사 타이밍·pointed wood/diamond·본체 준비/회복은 당시 visible 관측이며 의상 intact의 근거가 아님. 작은 brown 가시 대비·겹친 전투 text/주변field·native facing의 회복 중 좁아지는 기존 본체 투영이 남고 자연 AI fan·Q hold 인수는 없음. 자동 검사를 visual PASS로 바꾸지 않는다 |
| NEXT PASS | 잔여 **exact1 `THORN_VOLLEY_COMBAT_ACCEPTANCE`**: 현재 신규 공격의 실전 가독성 및 공개 held-Q/자연 AI fan 소비 인수. 이 unit 인수 전 멧돼지·독장판·지네 다음 확장에 착수하지 않는다 |

## 동기화·소유 checkpoint

관련 keyword로 docs 전체 `rg`와 literal `grep -r`를 모두 수행했다. 녹 orb·r4 fan 계약을 설명하는 문서에는 **기본 계약과 별도 first opt-in 예외**를 표로 동기화했다. `docs/2_3 돌진+패링+방패시스템`은 변경0. 단순 피날레 링크와 다른 checkout의 마케팅 역사 commit 목록은 이번 runtime 변경 대상이 아니며 타인 WIP를 보존한다. 전 source·관련 docs의 working/HEAD 백업·최종 hash·소유 commit 목록·새 증거 numerics는 E receipt에서 확인한다.

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · first + r5 현재 화면 후속

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| first 판정 | 후처리 sz2.4/pool.r5.2. player collision base=P.r+7.2·기본 gate=P.r+11.2 및 Q/E 확장·sweep 유지 |
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
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 화면내 배치만 당시 확인. 의상 intact·모델 품질 인수0. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위는 당시 기술 구현 기록·현재 구형 모델 인수 VISUAL FAIL / USER_REJECTED_OLD_MODEL. 당시 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
