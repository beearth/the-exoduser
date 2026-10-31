# 다크드루이드 NORMAL 네이티브 교전 · r4 · 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

## 2026-10-12 · 현재 상태 정정

**USER_REJECTED_OLD_MODEL / VISUAL FAIL — 구형 f0 모델의 현재 품질 인수는 거절됐다.** 사용자 지적은 치마 파손·모델 원형과 최신 검은 드루이드 자료 불일치다. 아래 과거 기술 검사·카메라·재시작 기록은 보존하되, 화면 안에 들어온 본체를 온전한 의상이나 승인 모델로 인수한 것으로 읽지 않는다.

| 정정 항목 | 현재 인수 경계 |
|---|---|
| 사용한 구형 source | assets/sprites/boss/boss_dark_druid_f0.png, 355×541 RGBA, SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 최신 검은 드루이드 승인 모델로 대체해 기록하지 않음 |
| 모델 결함 | 원화 가장자리 alpha 및 r5 의상 분리 경계·변형 틈이 확인됨. camera contained / fullbody screen-inside는 의상 intact·모델 품질 PASS의 근거가 아님 |
| 보존 / 다음 인수 | 기존 이미지·fixture·commit·12종 math/bridge 검사·overlay restart 기술 성과는 이력 보존. 10/9 black maxSW 후보 exact 선택·모델 승인은 pending이며 새 모델·전체 완성 주장0 |

[구형 source·의상 topology 정정 수치](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 기본 모델과 역사 QA 선택 gate의 최종 코드 계약은 root의 확정 기록을 따르며, 이 정정은 미확정 계획을 계약값으로 추가하지 않는다.

구현 checkout: `/Users/fordeargamers/the-exoduser`. r3 본체/클립/저작 저장과 증거는 기술 이력으로 보존하며 현재 승인 모델로 인수하지 않는다. 당시 기술 범위: 저장 격리·공격 소비·실제 pause/STEP·native AI·공개 사망/retry·own 설정 저장/재열기와 내려찍기 5장 산출. 당시 RETOUCH 기록과 별개로 현재 구형 본체 모델 인수는 VISUAL FAIL / USER_REJECTED_OLD_MODEL이다. Q/E 성공 교전과 보스 처치 전 경로 인수는 남아 있다. 전체 자체 엔진 완성 또는 본편 출시 인수는 아니다.

| 경로 | 실제 권위 / 범위 |
|---|---|
| 기본 게임 | 기존 세이브·Q/E·피해·아레나·보스 FSM. 아래 NORMAL 공격 인스턴스의 명시 변경만 적용 |
| r4 QA | `http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r3`; native `game.html`을 직접 사용. 별도 game 복제/서버/전역 fetch·Storage proxy 없음 |
| r3 renderer | 기존 `fdgDruidSlam=r3` bridge를 그대로 재사용. 실제 native wind/strike/recover phase를 소비. 저작 2.6초를 native 공격 타이머로 덮어쓰지 않음 |
| 저작 화면 | r3 Studio는 동결된 독립 저작 검수. r4 네이티브 교전 영상과 구분 |

## 저장·부팅 경계

| id / key / caller | 현재 정확 계약 |
|---|---|
| `engine/fdg/druid-qa-storage.js` | 첫 support script 전에 classic 로드. `window._FDGDruidQaStorage` 별도 frozen API. 기본 inactive 초기화/호출의 실제 localStorage 접근0 |
| active | pathname `/game.html`, host `localhost` 또는 `127.0.0.1`, port `3333`, `test=1`, `testchar=1`, `bosstest=0`, `fdgDruidQa=r4` 모두 필요. `editor/demo/bic/char/booth/mapqa/projectilelab/dropPreview/stage` query가 있으면 inactive |
| 메모리 초기값 | `hellcave_sharedStorage=[]`, `hellcave_sharedMats=0`, `_charIdx=0`, `inputMode=kbm`, `hellLang=ko`. 다른 user settings/slot/창고/악의오브 import0 |
| memory API | `getItem/setItem/removeItem`은 별도 Map만 사용. native `localStorage`, `Storage.prototype`, `fetch` 객체 교체0 |
| native 저장 호출 | dbSave 원본/local/web override, startAutoSave, sharedStorage/Mats 초기화·deferred sync, settings·tier·캐릭터·input·gp·screen·preset·language·dcprof, tutorial-badges/parry-lesson 각 실제 caller에서 active 명시 분기 |
| 외부 경계 | r4 `/api/save`, `/api/load`, GET/POST `/api/mats`, reset DELETE 호출0. character save와 user reset/lobby 이동은 QA에서 return. actor snapshot을 저장했다고 표기하지 않음 |
| 유일한 persistent key | `fdg.qa.dark-druid.encounter.r4`; active 초기 read1, 공개 `QA 설정 저장`에서만 write. 자동 native saveSettings는 Map만 갱신 |
| own schema | `{schemaVersion:1,settings:{binds,binds2,opt,charIdx,inputMode,gpKeyMap,language,screen,presets}}`. 상위9필드 whitelist; actor/P/G/INV/slot/mats/storage 제외. charIdx 정수0..1, inputMode kbm/pad, JSON 유효성·prototype-key·cycle·nonfinite 방어 |
| UI settings | `opt.fdgDruidQaControls`에 scale/distance/pattern/phase를 저장. QA force 선택값이며 native actor phase/timer/position snapshot이 아님. schemaVersion1의 `opt.diff`는 현재0..10 인덱스이므로 active QA에서는 legacy `!OPT.diffV2`의 +5 변환을 건너뛴다. inactive native migration은 그대로 |
| 관측 receipt | own key reads/writes/successfulWrites, memoryOperations, notes/notesTotal/notesLimit128/ownSettingsRestored. ledger 자체가 backend ACK를 뜻하지 않음 |
| QA module | active 때 `engine/fdg/druid-encounter-qa.js?v=native-encounter-r4-frames2`를 import하여 `installDruidEncounterQa` 실행. 공개 관측 객체는 `window._FDGDruidEncounterQa` |
| 관측 API / 수명 | `snapshot()`은 ready/mode/config/paused, cameraLock 복제본, player/boss/game/projectiles, metrics/drawCpu/storage/events/states를 반환. events 최대512, states 최대256, CPU 최대240samples, HUD timer100ms. `uninstall()`은 timer·입력 listener·panel을 제거하고 자신이 설치한 wrapper가 현재 함수일 때만 원본으로 복원 |
| 보스 참조 / pool | 현재 `ens`의 `ib && alive!==false` actor를 우선 사용하여 `_btBoss`를 갱신. 현재 actor가 없을 때만 `_btBoss` 캐시 fallback. `syncBoss`는 updateE와 getter 양쪽에서 actor 교체 시 lastState/lastHp를 초기화하고 살아 있는 새 보스+플레이어를 ready로 갱신. `_resetProj` 원본 호출 뒤 WeakMap 관측을 delete하여 같은 pooled 객체의 새 세대 shot/반사를 다시 기록. 종료 event는 updateE로 전달된 actor만 관측하므로 모든 native 사망/처치 경로 coverage는 아님 |
| `_startDruidQaChar` | native mkP/defaultItems/recalcSt/applyStats/initStage(0), Lv1 기본 캐릭터. `_startTestChar`와 native retry는 active 때 이 함수로 조기 분기. retry는 death overlay의 opacity0/pointerEvents none 처리 후 새 QA actor를 만들고 return하므로 일반 EXP 손실·arena 복원 retry 분기를 실행하지 않음. 기존 testchar Lv500·전설장비·전합체 분기와 bossTest HP9999/int5000/패시브20 강화는 이 QA에서 제외 |
| QA 제어 | 초기 물리 정지, GOD=false, QA에서 사망 auto-resurrection 없음. 기존 bossTest 기둥 제거 flood-fill 미실행; 원본 native arena geometry/collision 유지 |
| public setup | 선택7패턴: slashCombo/slam/fan/elemBall/charge/poisonTrail/burrowStrike. QA 위치340px/100px/옆340px는 isW 바닥 gate. 기본 표시×1, 허용×0.5..2 step0.1; 본편 기존×4는 보존 |
| `QA 상태 + HP 3000` | player s=idle/st2=0, poison/burn/frozen=0, kb.x/kb.y=0으로 pose·해당 debuff·넉백 초기화. mhp/hp3000, mst/st500, mmp/mp500, iframes0, mshield/shield0. `qa-resources`에 poseReset=true 기록 후 HUD 갱신 |
| `QA 보스전 재시작` | observer mode=ready/lastState 빈 문자열/lastHp=null, `qa-native-restart` 기록 후 `_startDruidQaChar()` 호출. 새 native QA actor와 초기 물리 정지로 재시작하며 전투 actor snapshot을 저장하지 않음 |
| `선택 패턴 준비(정지)` | 기존 forcePattern caller1회 후 `_btFramePause=true`, `qa-force-pattern` paused=true. 선택한 native FSM의 준비 상태를 실제 STEP으로 진행하며 actor 좌표/HP/동작키 직접 작성0 |
| 검수 카메라 | `카메라 고정 / 해제`는 현재 G.cam/zoom을 로컬 복제/해제. `프레임 카메라 ×0.5`는 native 보스 x+300/y−120/zoom0.5의 로컬 cameraLock만 설정(`slam-five-poses`). game.html의 native camera 계산·clamp 후, `_syncDruidFinaleMouse()` 직전에 active cameraLock을 적용. actor/P/projectiles/QA scale 변경0; own 설정에 카메라 저장0 |
| input | native WASD·마우스·Q·E·Space 입력 사용. 현재 공개 이동 안내는 WASD 이동·방향 더블탭 / Shift 이동. 기본 physical E / magic Q; 기존 날개치기 조건부 magic E 예외 유지. blackBean은 Q 전용/E 불가 |
| 증거 구분 | 강제 패턴·HP·페이즈·위치는 `qa-*` events. `native-ai`는 공개 AI 시작 이후 기존 AI가 패턴을 고르는 구간. 강제 패턴을 정상 AI 선택이라고 표기하지 않음 |

## NORMAL 공격 소비

대상 `_isNormalDruidBoss(e)=e&&e.ib&&(G.stage===0||G.stage===3)&&!_isDruidFinale(e)`. HELL/피날레 새 확장 적용 주장은 없다. 타보스/피날레와 전역 Q/E 성공·피해·자원 공식을 보존한다.

| id | 현재 수치 / 공식 / 적용 위치 |
|---|---|
| fan 요청 수 | `floor(max(12,4+min(stage,5))*(1+(phase-1)*.12))`; phase0..4 =10/12/13/14/16. 이전 기반10의 실제8/10/11/12/13에서 증가 |
| fan 실제 잔존 | 기존 modulo3 드랍 후3..4/4/4..5/4..5/5..6. `_eProjDropCnt` 시작값에 의존; count와 실제발수를 혼동하지 않음 |
| fan 폭/class | `π*(.7+phase*.06)`rad. lane=i/(cnt−1), <.28/>.72 physical; 가운데 magic; phase>=2 && i%4===1은 blackBean magic 우선 |
| fan 피해 | 입력 physical·magic floor(atk×1.3), black floor(atk×1.5). 최종 physical floor(.5×floor(2×floor(atk×1.3))), magic floor(2×floor(atk×1.3)), black floor(2×floor(atk×1.5)). atk103 UNIT 값133/266/308 |
| fan 속도 | 입력4.4px/native f. 공용 후처리 최종 physical5, magic·black 500/60..600/60=8⅓..10px/f; rand.5 UNIT9.166666… 유지. 후보4.6 미채택 |
| fan 크기·기간 | 입력 sz physical/magic1.2, black2; 기존×2 후 sz2.4/4. r4×1.3=5.2. life/ml400f, recover45f. 렌더 크기는 hit radius와 별개 |
| 독 wrapper | 기존 `_druidPoison`가 원래 class를 보존한 후 el=EL.P/col=#66dd22. magic/black의 최종el0을 이유로 E로 재분류하지 않음. 실제HP피해의 기존 poison+3 권위 유지 |
| straight 표식 | fan/elemBall `_druidStraight`는 대상 소유자만 허용, pooled기본/reset false. spawn magic/physical forcedhoming과 hostile `(homing||blackBean)` consumer에서만 scoped 제외 |
| elemBall 예외 | NORMAL instance 명시 magic/Q 가능·homingfalse. 다른 일반 elemBall forbidden 유지. 요청 `10+floor(phase×1.5)`, 입력spd6→10.8px/f, floor(atk×3)→floor(2×floor(atk×3)), life400f·sz16→32·r16→20.8 불변 |
| Q elemBall 성공 | 기존 friendly/blueBean/parryBlueBean/homingtrue 응답. 해당 표식 instance만 elemBall=false로 내려 반사 blue 렌더 소비. friendlyblue 기존 유도에는 straight 제한 없음 |
| charge 방향 | 마지막18 native f와 charge 실행 중 전역 facing 재조준 차단. wind branch는 st2>18 동안만 재조준. 다른 보스 기존 추적 유지 |
| charge 값 | 기존 echDx/Dy, speed35×sp, duration50f, 접촉atk×2, 기본recover40f 유지. 벽충돌·기존패링·전조 FSM 보존 |
| 다른 패턴 | 기존 poisonTrail, bossDruidDive/Under/Erupt 및 return/recover 재사용. 새 전투 FSM·어택티켓0 |
| 시각 | 기존 녹색 orb 질감을 사용하며 완성된 나무 가시 아트로 표기하지 않음 |

## 기존 자산 접점

| native key | 실제 자원/형태 / 소비 |
|---|---|
| transform | boss_dark_druid_transform.png 2400×724 RGBA, 8×1, cell300×724. 직립 드루이드→낮은 네발 변신 |
| beast | boss_dark_druid_beast.png 1774×887, 4×2, cell443.5². 방향8셀의 가지뿔/해골/망토/앞발 드루이드 야수. 멧돼지 외형으로 확인되지 않음. 새24장 charge gait가 아님 |
| dive / emerge | 각1774×887,4×2,cell443.5². 다절·다족 지네 형태. dive/under/erupt는 기존 dive시트를 실제 native phase로 재생하고 under body는숨긴흙두둑. emerge는 실제 파일의 로더 누락을 등록하여 기존TelePrep/TeleWarn 준비분기와 연결; 이 등록만으로 burrow가emerge시트를썼다고 주장하지 않음 |
| SOURCE_GAP | 다크드루이드 개구리 변신 외형 시트 미확보 — PENDING_RESOURCE 1. 광역자원탐색·대체그림·새PNG·PixelLab0 |
| r3 원화 제한 | 기존 숨은 뒤쪽·겨드랑이·옷속 정본표면 gap는 동결r3의 범위 한계. r4전체교전 중단 gate로 승격하지 않음 |

## 새 검증과 실제 검수

| 항목 | 현재 결과 |
|---|---|
| 공격 소비 새 검사 | 4고유범위 PASS. 첫3/4 PASS+friendlyblue 최단각 증가를 가정한 harness1FAIL(91.424167ms); wrapped거리감소로 assertion만 수정, 실패범위1/1 PASS(50.503792ms). 각 성공범위 재실행0·old suite0 |
| 저장/helper·consumer 검사 | 12고유범위 PASS. helper5/실제 consumer7의 격리 VM 검사. 새 difficulty-loader 그룹은 실제 helper→startup→saveSettings에서 QA diff0/5/10 유지·own bytes 불변·read1/user storage/API/write0, inactive legacy0→5/marked5→5 유지. 새 그룹 첫 harness VM 배열 prototype 비교1FAIL75.275ms→plain JSON 비교로 실패범위만1/1 PASS84.558666ms. 각 성공범위 재실행0·old suite0. 실제 public input·Save/reopen·backend ACK와 별도 결과 |
| observer 새 검사 | 4고유범위 PASS: pooled 세대3shots/2reflections·중복0, actor교체 false boss damage0·uninstall, 정지 force/STEP/실제 camera gate 위치, 고정 frame camera clone/actor 좌표 불변. 최초2/2 PASS60.306875ms. controls harness top-level const 재선언1FAIL60.938375ms→실패범위만1/1 PASS45.053583ms. framing 최초1/1 PASS56.9665ms. 성공범위 재실행0·production fault0 |
| 실제 native public inputs·live GIF | slam/charge/poisonTrail/burrowStrike/fan phase2의 실제 강제 패턴 재생과 별도 native AI151frames/6.194200초. AI는 rapidMissile→burrowStrike→chaseAoe→grab을 직접 선택. 실제 E/Q·이동 입력 기록이 있으나 성공 패링은 NOT_OBSERVED. Q 탭은1ms로 held-Q 성공을 검증하지 못함. 주변 native 투사체·화상·장판이 함께 소비되므로 고립 공격 검수 아님 |
| 실제 사망 / retry | HP0/G.on=false, QA 자동 부활0. 첫 공개 retry의1×1 backup 복원으로 P/cam NaN·createRadialGradient 오류를 발견. active 조기 baseline return으로 수리 후 공개 `다시 일어서라`에서 Lv1/HP573/iframes0/128×108 arena/P2580,2580/cam2580,2420의 finite 상태 확인. 모든 보스 처치/승리 경로 인수는 남음 |
| own settings Save/reopen | 공개 Save1회→유일 key 성공쓰기1,9필드 저장. 첫 reopen에서 saved diff5→loaded10/보스HP4171031280의 legacy 재변환 오류 발견. active 변환 제외 후 추가쓰기0으로 같은 payload 재열기: diff5→5, boss21017, Lv1/HP673(기존 random gear roll), restored=true/read1/write0, scale0.5/distance340/slam/phase0 일치. 카메라 null·player HP3000/위치/전투 상태는 복원하지 않음. repaired reload network1088 captured events/37packets에서 backend/404/exception 관측0이나 한 packet truncated=true이므로 전체 네트워크 누락0 인증 아님; 실제 caller VM 격리 검사와 함께 판단 |
| framecost / HUD | r4 observer의 `snapshot().drawCpu`가 실제 native draw caller wall-clock CPU samples/mean/p95(최대240 samples)를 제공하며 `snapshot().metrics`는 native fps/updateMs/drawMs/renderer를 제공. 현재 HUD는 mode·물리정지/실행·boss/player 상태·HP·FPS·event 수·own settings 성공쓰기 수를 표시. CPU mean/p95와 updateMs/drawMs의 HUD 표시는 없음. GPU timing/독립 저작 FPS/전체 최적화 합격과 구분 |
| 실제 성능 표본 | Apple M5 Pro native AI13개 표본: 화면110..120FPS/update0.127664..0.180607ms/draw0.649800..1.037109ms. instrumented caller 관측이며 GPU 시간·Windows·전체 게임60FPS 보장 아님 |

## 내려찍기 실제 5프레임

`frames-first/` raw5장은 같은 native actor, 오른쪽 방향, 카메라{x:2880,y:2060,zoom:0.5}, QA 표시0.5로 공개 STEP을 눌러 캡처했다. native 재조준/이동은 그대로 남겨 facing0→−0.022641→−0.014758rad의 미세 변화와 boss XY 변화를 기록했다. `G.frame` counter는 UNAVAILABLE이며 STEP 누계·state/st2·관측 performance.now와 r3 bridge sample seconds를 구분한다. 5장은 새24장 시트 또는 화면/클립24FPS를 뜻하지 않는다. r3 draw의 undoScale이 QA 배율을 상쇄하여 본체 표시 높이를 유지하므로, 별도 카메라0.5로 전신을 맞췄다. frozen r3 mesh/clip/PNG 수정0.

| raw file | 포즈 의도 | STEP 누계 | native state/st2 | r3 sample s |
|---|---|---:|---|---:|
| `01-preparation-native.png` | 준비·중심 모으기 | 8 | bossSlamWind/18 | 0.3076923076923077 |
| `02-pre-impact-native.png` | 타격 직전 | 25 | bossSlamWind/1 | 0.9615384615384616 |
| `03-contact-native.png` | 실제 contact tick 직후 | 34 | recover/40 | 1.16 |
| `04-rebound-native.png` | 반동 | 39 | recover/16 | 1.448 |
| `05-recovery-native.png` | 회복 | 51 | recover/4 | 2.3120000000000003 |

contact는 실제 native bossSlam8→recover40 전이와 같은 관측 ms227369의 requested101/HP delta97을 기록했다. 다른 native 피해도 같은 틱에 있으므로 총HP 감소를 단독 slam 수치로 바꾸지 않는다. 첫 no-argument `getSnapshot()` null은 actor 인자가 빠진 관측 오류였고 `getSnapshot(window._btBoss)`로 정확히 기록했다.

`slam-five-poses-board.png`는 raw5의 동일ROI{x:300,y:100,w:420,h:420}를1:1로 배열한 파생 보드(2204×820,1290040bytes)다. 원PNG·포즈·프레임별 위치/회전/색/가림을 편집하지 않았다. `slam-native-play.gif`는 같은 cameraLock의 실제 새 forced slam 연속70 JPEG를 timestamp로 재생한다. full960×540를 전장 동일비율640×360로 축소했으며 actual CDP3.027736초/GIF3.070초/12067128bytes,10ms 양자화·마지막 미관측hold40ms를 명시한다. STEP5와 다른 반복 실행이므로 같은 전투 기록으로 합치지 않는다. 외투와 배경 대비, 손–지팡이/팔–외투 윤곽, 지팡이의 바닥 접촉 인상과 주변 UI/actor 겹침은 RETOUCH다.

| 벤치마킹 자료 | 이 단위에서 채택한 방법 / 경계 |
|---|---|
| [Blizzard Diablo IV Dec2021](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-update-december-2021) | 애니메이션과 타격/VFX 위치·방향의 연결을 읽는 기준. native 피해 tick을 유지하고 contact를 그 틱에서 검수. Diablo 비공개 코드 분석 주장0 |
| [Flare Animation.cpp](https://github.com/flareteam/flare-engine/blob/master/src/Animation.cpp), [EntityBehavior.cpp](https://github.com/flareteam/flare-engine/blob/master/src/EntityBehavior.cpp) | visual/subframe과 activeFrame의 구분, active frame에서 공격 소비. 이 게임은 기존 FSM이 sole combat clock이고 pose만 native phase를 읽음 |
| [Godot animation_blend_tree.cpp](https://github.com/godotengine/godot/blob/master/scene/animation/animation_blend_tree.cpp) | one-shot 요청/현재위치/fade/blend의 구분. 준비/복귀 blend를 참고하되 새 FSM·24FPS damage clock 추가0 |
| [PoE2 designer interview](https://butwhytho.net/2024/04/wasd-controls-to-path-of-exile-2-was-worth-it/) | 이동+공격/시전/반동 additive 설명을 참고. 2차 인터뷰 자료이며 PoE 내부 코드나 공식 영상을 직접 분석했다고 표기하지 않음 |

## MAP PRODUCTION REPORT · §23

제작가이드 v0.9 전체·_MAP_SSOT_INDEX·BOSS_BATTLE_SETTINGS·CH1_1_DRUID_BOSS_ASSIGNMENT을 따른다. 이번 단위는 기존 보스 아레나의 combat/camera QA이며 새 필드 geometry 제작이 아니다.

| §23 항목 | 실제 보고 |
|---|---|
| STAGE | native si0 boss arena, 기존3333 game.html + explicit r4 + frozen r3 renderer |
| MASTER | silhouette/regions/main route/side spaces: 기존 genBossArena 유지. 전체 필드 동선 인수0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes: 새 mass·좌표 편집0. QA pillar flood-fill 제거 분기를 제외해 원 arena 유지 |
| LARGE | source assets/composites/overlap/repeated silhouette: 기존 자산만 소비, 신규 합성/배치/원PNG0. 프레임에 주변 actor/UI 겹침 존재 |
| MEDIUM | connections/remaining holes: 접합 변경0, 전체 field hole 검수0 |
| GROUND | shadow/contamination/structure integration: 기존 바닥/그림자 유지, r3 전신 족점 확인. 신규 ground 제작0 |
| PLAYABLE | main arenas/travel/breathing/threat spaces: 기존128×108 arena; 공개 위치 fixture는 isW gate. combat readability: forced5패턴·별도 AI 확인, 패링 성공·처치 인수는 남음 |
| LANDMARK | primary/secondary/tertiary: 기존 boss 중심 유지. 새 landmark/deco0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 이번 ARENA·오른쪽 동일 방향5장만 관측. 나머지 stage route/camera 전 구간은 미검수 |
| TECH QA | route/collision: 원계약 유지/isW fixture, 전체 route 검수0. page error: retry nonfinite 오류 수리 확인. 404/loading: repaired reload 관측 error0이나 event truncation 제한. seam: 팔/외투/지팡이 RETOUCH. performance: 위 native CPU/FPS 표본이며 GPU/Windows 미측정 |
| FILES | stage-owned: game.html의 명시 r4 consumer+NORMAL 공격 hunk, helper/observer/support2/test4 및 관련docs. concurrent/unrelated 파일 수정0; 기존 타인WIP 보존 |
| GIT | 소유 code+docs+CHANGELOG_SYNC를 한 정상 checkpoint로 commit. push0/deploy0. 정확 commit은 최종receipt에 기록 |
| VISUAL VERDICT | RETOUCH. 기술 PASS를 시각 PASS로 승격하지 않음 |
| NEXT PASS | 타격 바닥 접촉·팔/외투/손–지팡이 연결과 대비, 성공 Q/E 실제 교전·처치 관측. 개구리 외형 PENDING_RESOURCE1 유지 |

증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-native-encounter-r4/`. 새키워드 전체docs rg 및 literal grep 결과를 보존하고 관련현행문서를동기화한다. 기존r3/1-1/R10/Hell 검수·source·suite·Git봉인 재확인0.

## 2026-10-11 r6 · E tap 입력의 native tick 소비

다크드루이드 격리 교전에서 발견한 초고속 E down/up 누락은 기존 E tap buffer의 시간원 결함이다. r3/r4/r5의 원본문·완료 수치·proof는 동결하고 이번 입력 소비 수리 및 검수를 새 r6 자료로 분리한다. 시간원 수리와 새 VM 검사·실제 E 및 일반 공격 입력 소비, 아래 제어된 native 패링 사례를 확인했다. 최종 자료의 GIF 시간·프레임 수를 확정했으나 전체 battle PASS0, full encounter camera FAIL, VISUAL RETOUCH이다. 잔여는 COMBAT_READABILITY 1건이며 기술 성공을 전체 시각 PASS로 승격하지 않는다.

| 접점 | r6 현재 계약 / 검수 경계 |
|---|---|
| 실제 결함 / 수리 전 이력 | 당시 keydown의 `_sdTapBuf=G.frame`은 undefined를 기록하여 `_sdTapBuf>=0` guard가 false가 되고 TTL 비교 전에 short-circuit되어 소비 불가. 수리 전 `G.frame-_sdTapBuf<=3`도 같은 잘못된 시간원을 참조하던 식이며 첫 press에서 그 차이를 실제 계산했다는 뜻이 아님. 이 행의 G.frame 기록·수식은 수리 전 이력으로 현재 게임에서는 미사용. native update 사이 E down/up 후 K latch가 이미 해제되면 tap buffer까지 소비되지 않아 입력 소실 |
| 한정 수리 | 기록과 TTL 비교의 두 시간원 참조를 실제 native tick counter `_gameFrame`으로 변경: `_sdTapBuf=_gameFrame`, `_gameFrame-_sdTapBuf<=3`. 별도 입력 clock·RAF·wall-clock·authoring FPS로 교체하지 않음 |
| TTL / 소비 | 기존 TTL3 native틱과 1회 소비 유지. down/up이 update 사이에 끝나도 유효 buffer로 sDraw에 진입하고 그다음 update의 release 경로에서 기존 sBash 발동. 성공·만료 이후 반복 소비를 새 기능으로 추가하지 않음 |
| 상태 / 패링 | 기존 sDraw→release→sBash 경로, sBash20 native틱·기존16틱 패링 window 유지. held E의 기존 native 동작·Q 입력은 변경하지 않으며 Q buffer는 추가하지 않음. 피해·패링 설계·Q/E class 규칙 변경0 |
| 새 기술 검사 | `test/fdgDruidETapBuffer.test.mjs` meaningful VM 검사 최초4/4 PASS·fail0. `E6/e-tap-buffer-test-first.log`. 과거 suite/proof 재검수0·이전 PASS 합산0 |
| 실제 E 입력 소비 | code/UI reload 후 actual E fast tap→공개 STEP1 sDraw→STEP2 sBash. down/up이 update 사이에서 끝나는 입력을 실제 native state 경로로 소비 |
| E slam 성공 / 제외 | pause/step 정면340px `e-slam-340/impact-state.json`: 관측ms77561 native-parry E/projectile:null, bossSlam→recover40; 후속8틱 상태 기록. 근접100px 첫 시도는 E가 bossSlamWind를 타격 취소한 사례이므로 Druid parry 성공에서 제외 |
| E 비유도 물리 fan | pause/step `e-physical-projectile/02-success-state` 관측ms143603: native-parry E, impactKind=physicalProjectile, class=physical, druidStraight=true, friendly blue. `03-subsequent` 관측ms158928 native-reflection homing=true. 적대 직선 소비와 반사 후 friendly 유도를 구분 |
| 남은 적대 magic 직선 | before1→step3→step6 관측에서 vx=−3.1937373020264976/vy=−9.406679454233943 유지. 보스가 맞는 동안에도 해당 hostile magic 탄이 존속. 이 적대 직선 관측을 friendly 반사탄 유도와 혼동하지 않음 |
| Q magic / black 성공 | fan proof는 normal-running의 실제 공개 Q 반복 tap 소비로 magic 및 black 성공. `q-black-close-live/final-state.json` 관측ms214654 native-parry Q black/fromRainbow=true→ms214678 native-reflection homing=true, actual raw17장. Q source 변경0·소스 force 성공 코드0·black E 금지 유지. E slam/physical fan의 pause/step 자료 및 정상 AI 패턴 선택 자료와 구분 |
| 정상 native AI 입력 혼합 | `E6/native-ai-live` actual raw133장/first→last4.550577879초, HP3000은 명시 QA fixture이며 강제 패턴0·소스 force0. 120poll의 player poses=bladeDash5/idle77/stagger8/sDraw2/sBash11/sRecover11/pStun6. Q native-parry5는 모두 magic/druidStraight=false인 주변 마법 반사이며 AI Druid E parry/native-reflection0. 보스HP21017/alive, kill 미관찰. raw 장수·poll 수·관측시간을 native tick/clip FPS로 바꾸지 않음 |
| 추가 연속 입력 / 사망 이력 | continuous tail actual raw202장/6.706461906초에서 player dead/HP0·bossHP21017/alive, kill0: FAIL. 당시 단순 좌클릭의 무기 공격 소비는 NOT_OBSERVED로 이력을 보존. 뒤의 공개 mouse hold/drag 입력 소비 성공으로 이 실패 영상·원자료를 덮어쓰지 않음 |
| 추가 일반 공격 입력 소비 | 공개 mouse hold/drag1px의 native mousedown/up 간격82ms 후 wRecover11/ST490으로 실제 공격 소비 확인. 추가 코드 수리0. 최종 mixed-held actual raw188장/6.172783852초의 raw0003은 HUD wSwing+white arc, raw0017은 wRecover이며 1280×720 PNG2장·2-panel board로 기록. 이 범위의 실제 일반 공격 소비 PASS |
| mixed-held 전투 / 카메라 한계 | E/Q parry0·boss damage0·kill0. 마지막 player pStun/HP1156.4687500000105, boss charge/HP21017/alive이며 보스가 fixed camera 밖으로 이탈: full encounter camera FAIL. 일반 공격 소비 PASS를 보스 피해·처치 또는 전체 battle PASS로 확대하지 않음 |
| 확정 GIF Q / live / tail | Q raw17장·관측0.5923521519초→GIF630ms/3117411B; live raw133장·관측4.550577879초→GIF4590ms/23505905B; tail raw202장·관측6.706461906초→GIF6750ms/32285610B. 각640×360, 마지막 미관측 hold40ms를 포함하므로 관측시간과 인코딩시간을 구분. tail 자동 병합 시도196프레임 이력 이후 최종 직접 인코딩202프레임 확인. 정본 `E6/derived/r6-derived-captures-receipt.json` |
| 최종 시각 / 잔여 | 전체 battle PASS0·VISUAL RETOUCH·full encounter camera FAIL. 잔여 exact1 `COMBAT_READABILITY`: 어두운 대비/ambient, 효과·대사 가림, 이동 중 카메라 이탈을 함께 포함. native4요건 기술 성공 및 새 VM4개 PASS를 정상 AI Druid 패링 성공·보스 처치·전경로·전체 제품 완료 PASS로 확대하지 않음. 성공 자료와 실패 영상·최종 원자료 모두 보존 |
| 문서 경계 | 관련 keyword로 docs 전체 rg와 literal grep-r 수행. 발견한 `2_1 스킬관리+합체시스템.md`의 초고속 탭 버퍼 시간원 행은 추가 소유 승인으로 `_gameFrame` 기록·TTL3 native틱 1회 소비로 동기화. 그 외 게임 계약과 `2_3 돌진+패링+방패시스템` 보호 문서는 수정하지 않음 |
| 새 자료 | `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-parry-encounter-r6/`; 이전 r3/r4/r5 증거와 분리 |

## 2026-10-11 r7 · 동적 전투 프레이밍의 별도 소비

[r7 정본](FDG_DARK_DRUID_COMBAT_FRAMING_20261011.md)은 기존 r4 storage.active에 `fdgDruidCombat=r7`을 추가한 자기 opt-in만 소비한다. r7 AI 시작은 정적 cameraLock을 해제하고 실제 body/player/근처 탄 bounds를 기존 native camera 계산 뒤 적용한다. 공개 compact 보기·r7 펫 자막 표시·HUD eShield와 native hurtE 이후 contact 관측을 한정 추가하며 r5 rig/PNG·native 판정/좌표/AI/시간/Q-E·사용자 save는 유지한다. r6의 static-camera FAIL·사망·원입력·파생본 이력은 위 본문 그대로 보존한다. 새 live camera 관측 범위 PASS, 첫 r7 사망 FAIL, 후속 쉴드 접촉·VISUAL RETOUCH/COMBAT_OVERLAP exact1은 r7 정본의 신규 표를 따른다. 전체 battle/kill PASS0이다.


## 2026-10-11 · 별도 r8 표시 가독성 소비

기존 r3/r4/r5/r6/r7 원문·수치·검사·proof는 동결 이력으로 보존한다. 새 자기 격리 QA 표시 계약의 실제 play/증거/시각 판정/정확 잔여는 [전투 표시 가독성 r8](FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md)에서 관리한다.

| 항목 | r8 scoped 계약 |
|---|---|
| 경로 | 기존 r4 자기 QA와 r5 contact rig + fdgDruidCombat=r8. 옵션 combatReadability:true/native-ai에서만 신규 표시 소비 |
| 레이블 / 투영 | hover/floating text draw-local 위치, VFX GL logical screen 변환과 독립 화마귀 native world 행렬 정합 |
| UI | leaf DARK DRUID · r8 / aria 드루이드 전투 QA r8; compact172px/max-height170px, areaTitle top12px/left285px/width330px/left alignment·native3.1초 유지 |
| 보존 | r4 memory isolation/own key, r5 rig/PNG, r6 입력/Q-E, r7 framing 옵션 유지. native 판정/좌표/AI/time·맵/save 변경0 |
| 신규 범위 | 정상 native AI 연속play1건·새 fullframe/원본PNG/§23는 별도 E8. helper 최초5PASS·synthetic consumer4checks를 전체 전투/시각 PASS로 승격0 |


<!-- DARK_DRUID_THORN_FIRST_APPENDIX_BEGIN -->
## 2026-10-11 · 다크드루이드 가시 일제발사 first opt-in

기존 본문·r9/live-fix와 이전 결과표는 해당 범위의 동결 이력으로 보존한다. 아래는 기존 자기 격리 QA에 fdgDruidThorn=first를 명시한 별도 ENGINE_AUTHORING fan 예외만 기술한다. 기본 본편·옵션 없는 QA·피날레·상위 phase 계약을 덮어쓰지 않는다.

| 항목 | first opt-in 계약 |
|---|---|
| gate / owner | window._FDGDruidQaStorage.active && fdgDruidThorn=first. 실제 발사 대상은 ib=true·si0/3·!finale·phase0/1 NORMAL 보스만 |
| native 발사 | bossFanWind의 기존 st2<=0 한 tick에서12발을 동시에 생성. 별도 wave clock/연속탄 생성0. lane0..11 중 physical0/1/3/4/6/7/9/10=8발, magic2/5/8/11=4발(i%3===2), 이 범위 blackBean0 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| local flags / 예외 | _druidThornVolley pooled 기본/reset false, _druidThornLane 기본/reset−1. 해당 flag탄만 기존 modulo3 drop 및 생성 직후 decoy/ancestor aim 재지정에서 제외. 공용 후처리 배율은 적용하며 전역 drop/decoy/seek 변경0 |
| 입력 / 최종 속도 | 입력4.4px/native tick. 기존 후처리 최종 physical5px/tick=300px/s(60Hz), magic500/60..600/60px/tick=500..600px/s. 이 값은 clip24FPS와 별개이며 신규 속도 배율0 |
| 피해 | n=floor(atk×1.3), 최종 physical=floor(floor(2n)×.5), magic=floor(2n). atk103이면 n133/physical133/magic266. native poison wrapper는 원 class 보존 후 EL.P/col#66dd22, 실제 HP 피해시 기존 poison+3 |
| 수명 / 판정 | life/ml400은 nominal native-frame metadata. 기존 감소 life−=sp×.667 및 magic의 카메라2500px 이내 또는 실제 가시 영역+100px 이내에서 life<=0→life1 연장. 원거리 정리는 두 범위 밖에서만 수행(2026-10-31 웹 기준), 정확400tick 종료/초 단위로 승격0. 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0 |
| 준비 / 회복 / cd | wind=floor(25×BOSS_PHASES[phase].teleM)+extraDelay, phase0/1의 base18/16native f(추가 delay 별도). 발사 직후 recover45, 다음 기존 보스 recover update에서20으로 clamp. 기존 fan cd100 유지. authored1.6초를 native 준비·수명·회복 시간으로 덮어쓰지 않는다 |
| 보존 | 기존 E physical/Q magic/black Q-only·반사 friendly blue 유도·피해/poise·자원 유지. phase2+의 기존 count/black/modulo3 drop·피날레·다른 보스·기본 main·사용자 save 유지 |
| module / 생성 | engine/fdg/druid-thorn-pose.js의 createDruidThornFanClip/createDruidThornFanObserver. 기존 native bridge의 thornVolley:true일 때만 generated clip과 observer를 연결, 기존 source clip/19본/mesh/UV/weights/texture 변경0 |
| clip | dark-druid-native-thorn-fan-first, 1.6초/24FPS/nonloop,12tracks×6keys. keys seconds=[0,.55,1,1.12,1.3,1.6]; markers windStart0/releaseStart1/releaseEnd1.12/followEnd1.3/recoverEnd1.6 |
| native time 소비 | begin은 실제 bossFanWind st2를 WeakMap에 저장. wind progress=clamp(1−st2/windFrames)→저작 time0..1, recover progress=clamp(1−min(st2,20)/20)→time1..1.6. time<=1.12 release/<=1.3 follow/이후 recover. 실제 발사는 native transition 한 tick이며 저작 key6개가6발/6wave를 뜻하지 않는다 |
| 수명 / 원 권위 | actor 죽음·stunned>0·_hitStun>0·finite st2 아닌 값·다른 state에서 observer 취소, 같은 paused actor sample은 새 clock 없이 같은 pose. 원 start를 먼저 호출하고 return을 보존. observer가 탄/피해/actor fields를 쓰지 않는다 |
| 좌우 / 리소스 | 기존 앞면 mirror projection과 native facing 소비,8방향 새모델 복원 아님. staff는 기존 leftHand 자식 계약을 요구. 본체 source PNG 새생성·픽셀수정·bitmap shader/backend 변경0 |
| hostile physical 아트 | _drawDruidThornShot의 ENGINE_AUTHORING 목질가시. localX[-27,32] 길이59worldpx, 최대Y±10 폭20. 몸체 quad/측면 triangular barbs/밝은 ridge, fill path당 vertex<=4로 기존 X WebGPU fill 소비 |
| physical draw-local 색 / stroke | bark#2b1a11/ridge#a77943/light#dfc18b, stroke#50321a·width1.5. 위치p.x/y 및 atan2(vy,vx) 회전으로 저작하며 native sz/r/판정과 구분 |
| hostile magic 아트 | diamond localX[-15,18]·Y±12, trailX[-30,-8]. fill#185744/stroke#7de6b2·width2/core#efffd4, trail#78eac7·width3·native alpha×.45. 기존 X path 소비, 별도 atlas/bitmap/new backend0 |
| native/friendly 제외 | _druidThornVolley && !friendly인 poison-shot caller만 새아트 선택. 다른 드루이드 독탄은 기존 녹색 orb 경로, 패링 후 friendly blue는 기존 아트/유도 소비. draw-local save/restore로 원 alpha/transform 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 첫 사본](FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 own QA 화면 표시

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| 관측 구분 | snapshot raw cameraLock 설정과 활성 getter null은 구별. contained:true만으로 native spawn alpha0인 몸 표시 PASS0 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
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
| QA restart cleanup | _startDruidQaChar에서 deathScreen.style.transition 원값 저장→none→classList.remove(on)/inline opacity·pointer-events 제거→void offsetWidth1회 flush→transition 복원→_drReset()·_deathDlgStop(). QA retry도 note+await 공통 초기화+return; CSS 기본/.on·다음 death transition·DOM 자식 보존. _drReset은50canvas 링버퍼 index/len/capturetimer 초기화이며 pending replay cancel 아님 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 화면내 배치만 당시 확인. 의상 intact·모델 품질 인수0. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위는 당시 기술 구현 기록·현재 구형 모델 인수 VISUAL FAIL / USER_REJECTED_OLD_MODEL. 당시 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->

## 2026-10-12 공통 원근 별도 소비

| 항목 | 현재 계약 |
|---|---|
| gate | 기존 exact r4 QA storage active에 `fdgPerspective=first`를 추가한다. 기본 Druid QA/일반 게임 camera는 기존 경로 |
| lens / 저장 | 공통 defaults perspective/yaw0/pitch.85/zoom1/distance1400/near32 및 기존 native zoom을 소비. 공개 lens 변경은 transient이며 own 설정 저장 버튼을 카메라 저장으로 사용하지 않는다 |
| 실제 표시 | 기본 existing-v3-camera-consumer-only, P/B 본체 billboard 및 native screen facing·ground pointer·GPU W. 거절된 legacy-f0/검정 영웅 후보 재연결0 |
| depth | 기본 Druid consumer deferBillboards=false. 독립 `fdgScene=ruined-forest-first`만 true이며 별도 4 native 몹의 씬으로 Druid 모델 인수와 구분 |
| 새 정본 | [native camera](FDG_NATIVE_PERSPECTIVE_20261012.md) / [폐허 숲길](FDG_RUINED_FOREST_PLAYABLE_20261012.md). 기존 r4/r7/r9/thorn/모션·세이브 검수 재실행0 |
| 품질 경계 | 기존 v3 방향 셀·걷기/공격4frame은 같은 source다. 원근 연결이 승인 신형 악마형 본체 또는 실제24장 캐릭터 완료를 뜻하지 않는다 |
