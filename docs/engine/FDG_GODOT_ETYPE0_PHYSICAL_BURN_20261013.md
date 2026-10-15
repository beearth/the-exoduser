# FDG Godot etype0 physical burn DOT 첫 소비 — 2026-10-13

## 현재 제작 상태

정확 `order14 / ch1_initial_015 / etype0 / physical / flesh_crawler` 물리탄의 post-hit 화상을 Godot player에 연결했다. 새 고유4 기술 검사는 최초4PASS/0FAIL/exit0이며 반복0이다. 원16 초기 목록·지원3/미지원13과 원17PNG/맵/geometry는 앞선 [etype0 정본](FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md)의 고정 이력으로 보존한다. 기존 고유3/3/5·JS suite 및 이전 공개 플레이는 재실행하거나 최신 burn 지원 증거로 합산하지 않는다.

| 항목 | 현재 결과 / 경계 |
|---|---|
| 부모 checkpoint / byte backup | parent `08e5cac1c4f51f0a3e89af87b02b21f0646490a8`; 외부 `etype0-physical-burn-first/backup-before-docs/manifest.json`7paths/14 WORK+HEAD copies. 이전etype0 SSOT WORK=HEAD69998bytes, SHA `cd044dd8466961ad6e7cfd57175beb5315e3637e6acd1b557eceb0e49172eb71` |
| 제품 소유 / 백업 | motion 담당 player/physical 두 파일, `backup-before-production/manifest.json`의4copies. worker 제품/Git/UI 변경0 |
| worker 소유 | 새 `godot/tests/test_etype0_physical_burn.gd`, 이 SSOT, 이전etype0 SSOT 후속현행 한 문단만 |
| 기술 실행 | Godot `4.7.2.stable.official.ed1daf0bf`, 새4 최초PASS/0FAIL/exit0. 단일 실행에서 새 player/physical/test parse; 별도 check-only/이전 성공 재실행0 |
| 호출·자동 physics | 명시 actual native 메서드1597회 / 실제 독립fixture 자동physics17틱. 자동 pause 구간 process4frames. 별개 계수이며 public play·walltime FPS 표본 아님 |
| 새 소비 | pool48/t600/tick0/cap10, idle에서expiry선행·30..570의19pulse. raw2→physDEF2→최소HP1. 실제priority player0→physical1에서oldpulse→contact→newappend birth0 확인 |
| 현재 인간 앱 | 기존 source1 fullscreen paused 화면 유지, 새 source 미로드. launch/reload/input/live observer/HP·좌표·timer·state 주입/공개 QA report 저장0 |
| 시각 / 성능 | **VISUAL VERDICT: RETOUCH**. 새 화상 공개 교전·픽셀·전체 AI·최소 Windows1080p240 검수0 |

## 1차 문서와 실제 source 계약

| 먼저 읽은 system docs | 적용 / 충돌 정리 |
|---|---|
| `docs/8.0몬스터디자인/탄막시스템_총정리.md` §빨콩 화상 | pool×2/600틱/30틱/10스택을1차 기준으로 읽었다. 당시 총20틱·사망/부활 clear 문구는 현재 원 source와 충돌: expiry선행19회·die/fallenResolve 보존이다. 부모가 해당 원 burn 소절만 후속 source 계약으로 동기화했다 |
| `docs/8.0몬스터디자인/몬스터_공격시스템.md` §hurtP | DR/minimum/iframe 설계 기준을 읽고 현재 원 earlyguard를 우선한다. DOT는 기존 양수iframe을 우회하지 않는다. 일반 cap60iframe의 과거 문구를 새 소비의 동작으로 추정하지 않음 |
| `docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md` §hurtP | DR/최소피해 이후쉴드→HP는 전체 원게임 계약이다. 현재 Godot raw/no equipment/no player shield와 전체 쉴드/어픽스 포트를 구분 |
| 사용자 / 소유 경계 | 티켓·PixelLab·새 모델·PNG·map/collision/loader/server 변경0. 보호 `2_3` 및 marketing 수정0. 타인WIP 보존 |

정본은 부모가 인수한 `source-burn-contract-receipt.json`의 `contract.producer/consumer/damage/lifetime/guard_table`다. SHA256 `fff170049d8f8ee37f090c15110bd6d19c433f4da6f84e184fbefc5f8c231ee7`, schema `exoduser.native.etype0-physical-burn-source-contract.v1`, 원 root `/Users/fordeargamers/Projects/exoduser-migration-20261001`, reference revision `9a4534b42f74093095ebc3364a25dd104e93b379`는 부모 제공값이다. 이 worker 원 factory 재추출·Git·원 game 수정0이다.

### producer / timer 수치와 소비 위치

| id / 원 source → 새 path | 정확 값 / 순서 | 검증 / 경계 |
|---|---|---|
| 지정 consumer | record14/id `ch1_initial_015`/etype0/physical0/skin `flesh_crawler` | 새 다른 profile/몬스터/factory admission0. 앞선 원16 snapshot 불변 |
| 원35710→35712 / physical `:89–99` | 기존 generic outer hit gate→`receive_damage(24,'parry',heading,2)`→bite→redBean이며非`_druidPoison`이면`apply_native_burn(24×2)`→projectile 종료 | direct HP 성공·잔여HP 생존과 별도append. 실제 일반24/stagger 및 lethal 후600/tick0 append 확인 |
| 원 outer / Godot source gate | targetHP>0,iframes≤0,state≠literal`charge`,distance<P.r+13 / redBean true, `_druidPoison`false | literalcharge는 이동돌진 상태. full Q·lesson·special projectile/흡수 branch는 이번 미이식. 기존 priority 외 contact 수치·gate 수정0 |
| 기검참 hold 구분 | 원 R17234–35 `P.s='wWindup' && _kiChargeActive`, release R17248–53 `wSwing` / Godot`windup` | 기검참 hold는 literal 이동돌진`charge`가 아니다. HP·poise·KB 정상 영향, 일반stagger만 면역. actual2타→hold40→contact24/poise 감소1/burnappend 확인; 보호키 설계 변경0 |
| `NATIVE_BURN_MAX_STACKS` / player`:12` | 10 | 11번째append false, replace/refresh/merge/extend0. actual이전aged 타이머 보존 확인 |
| `NATIVE_BURN_DURATION_TICKS` / player`:13` | 600.0 | 원 state가 idle로 들어간 활성sp의 누적수명. walltime600/renderframes600이 아님 |
| `NATIVE_BURN_INTERVAL_TICKS` / player`:14` | 30.0 | threshold≥30에서tick=0, stack당call당최대1request. while catchup·overshoot 유지0; 비정상큰delta 실행 검수0 |
| `NATIVE_BURN_POOL_DIVISOR` / player`:15` | 20.0 | raw=`max(1,int(total/20))`. pool48의raw2; 수명19pulse와divisor20은 서로다른 값 |
| `_native_burns` / `apply_native_burn(total_damage:float)->bool``:317–325` | source이름각stack `{total:48,t:600,tick:0}` 독립append. cap10만 검사, HP/state와 별도 | source producer와 같이HP수용/생존에묶지않음. 일반JSON validator/임의finiteinput API로 과장하지 않음 |
| `get_native_burn_snapshot()->Array[Dictionary]``:327–328` / `get_snapshot().burn_stacks`:315 | array/dict deep copy | 실제 detached snapshot의t만변경해도player원timer불변 확인. actor timer/state 주입 아님 |
| 원33635→33651 / player`:231–234` | state`idle` branch에서만 `_tick_native_burns(delta×60)` | 움직이는idle도같은state, `_was_moving`는표시용. source통째globalstate/lesson/G.on parity 미검증 |
| 실제非idle | Godot`swing/recover/windup/stagger/pStun/dead`에서는burn 소비0 | 자연actualcombo/swing5+recover53·hold40/pStun240·death에서freeze확인. state 직접셋0 |
| transition→idle | recover/stagger/pStun branch가idle로바뀐 그update에는burn0,다음idle부터 | 실제stagger6의6번째transition에서도600유지확인 |
| `_tick_native_burns``:330–349` | 각원order: t-=ticks→tick+=ticks→t≤0 expiry제거→else tick≥30 tick0/actualdamage request→surviving compact | fixture599:t1/tick29/보존,600:expiry/no20th 확인. 동일enteredloop에서앞stack죽여도뒤stack시간/threshold 계속소비 |
| 연속idle/sp1 source기대 | active30/60/90/120/150/180/210/240/270/300/330/360/390/420/450/480/510/540/570:19회 | actual첫contactHP350→326 이후19acceptedDOT→307, telemetry19requests. active600만료피해0 |
| born update / process priority | player기존0 / physical `_ready`:38 `process_physics_priority=1` | 실제main에서world가player보다앞이므로새탄만뒤로처리. 자동fixture는oldburn(t571/tick29) 준비→oldpulse(t570/tick0/DOT피해1HP)→contact24→newburn600/tick0을관측 |
| local60 / global 원 clock | `_physics_process delta×60`; 원R32793 global `_gameFrame++` 이후sourceplayer→projectile소비 | 새world전체globalphase와모든actor/movement순서 동등 replay 주장0. 이두consumer의좁은dispatch관측만PASS |

### DOT damage / lifetime / guard 표

| 원/새 소비 | 정확 수치 / 순서 | 실제 범위 |
|---|---|---|
| 원hurtP earlyguard / `_receive_native_burn_damage`:351–353 | GodotHP≤0 / `fallen,dead` / iframes>0이면0 | source에도양수iframe guard가먼저다. 실제자연4hit→pStun240→iframe60에서첫pulse거절·tick소진확인 |
| source전체earlyguard | parry lesson / boss load / harp·dash / iceorb / ghostwalk / fallen·dead / positiveiframe | 기존Prototype이없는lesson/special/fullguard를새로포트한것아님. Q/E반사·fullguard·fallen/revival은미이식 |
| DOTclock와iframe | iframe가남아도eligibleidle에서t/tick진행. 거절pulse도tick0, 피해0 / acceptedpulse만HP감소·iframe0 | 자연iframe60의active30:iframe30/거절;active60:iframe0/acceptedHP1 확인 |
| raw physical baseline | maxHP350 / DEF2 / EDEF0 /raw2 / physicalDR=min(.75,2/(2+2500))=`0.0007993605115907274` | DOTdtypephys; 직접탄parry24는energyDEF0으로서서로다른분기 |
| 새`:356–360` cap/minHP | cap=floor(350×.33)=115; minimum=max(1,floor(350×.005))=1. raw2의floor(2×(1-DR))=1→HP1 | perstack각각적용. 실제10stack pulse는10×HP1=10(350→340), 합산raw20→19로처리하지않음 |
| acceptedDOT tail | HPwrite→iframe0; poise/poiseR/stun/stagger/KB/bite/공격cancel추가0 | raw/no equipment/private DOT helper. 일반`receive_damage`본문은producer exactbyte receipt상불변이며호출자동작변경0 |
| 각stack source정체성 | `dot:true,burn:true,src:'화상'`, defaultphys | dedicatednative_burn_pulse와player_damage packet에서표기. sourceenemy/projectile참조보관0 |
| source death/fallen | die/fallenResolve에서arrayclear0; 非idlefreeze / terminalG.onfalse소비정지. 원fallen자연reviveidle/iframes120에서도기존array유지 | Godotterminaldead에서는기존array유지·futureidle소비정지; 실제lethalposthit와mid-loopdeath 확인. fullfallen/revival/120iframe 및 retry미이식 |
| death during enteredloop | 한stackHP0→dead여도나머지stack t/tick처리계속,damage요청은deadguard거절. 다음update는idle소비0 | 실제원초기HP350에정상phys1000세회→HP8/stagger6,10burn의30thactivepulse가죽인뒤전10stack t570/tick0확인;다음60updates freeze |
| source initStage/retry clear | R32230 initStage / R63913 fieldRetry / R63914 arena/open-field retry에서`P._rbBurn=[]` | 새Godotrestart는새player의초기빈array일뿐이원진행/retry세시스템포트가아님 |
| source shield/affix/DOT scaling | 모든DR/barrier/conditionalDOT·burnDR/최소피해후player쉴드→HP | 현재player쉴드·barrier·장비·어픽스·특수guard미이식. rawDEF2/최소1기술PASS를wholehurtP동일성으로과장하지않음 |
| 원burnFX | pulse후damage거절이어도텍스트y=P.y-15-index×12,color#ff4400/life18,redparts2. append성공count텍스트y=P.y-30/life30 | 새화상text/part/HUDglobe color/FireFBF 추가0,원PNG/모델/material 변경0. 새burn픽셀미검수 |

## 실제 telemetry / producer receipt

| event/API | 정확 새 field / 값 | 관측 / 한계 |
|---|---|---|
| `native_burn_applied` | `total,t,tick,stack_count`; selected48/600/0 /count1..10 | actualappend19pulsefixture·2独timer·cap10으로소비 |
| `native_burn_pulse` | `index,total,t,tick,raw_amount,amount,accepted,dot,burn,src` | 정상source48:raw2/amount1/acceptedtrue/dottrue/burntrue/화상,19개actual packet확인. iframe거절amount0/acceptedfalse뒤다음pulsetrue도확인 |
| `native_burn_expired` | `index,total,t,tick` | actualactive600의 t0/tick30/1expiry event확인;추가pulse0 |
| `enemy_projectile_hit` 추가 | `burn_dot_ported:true,burn_applied,burn_pool`(48) | 실제제품contactmetadata; 모든sourceprofile지원이라는뜻아님 |
| `player_damage` DOT | `raw_amount,amount,damage_type='phys',hp,poise,iframes,charging_preserved,defence,dot=true,burn=true,src='화상'` | rawprivateDOT actualhelper. 기본directdamage tail/기존HP·ST·poise·charge/Q값변경0 |
| `player_died` DOT | `emitted_crescents_preserved:true,dot:true,burn:true,burn_stacks_retained:true` | terminaldead만. 새fallen/revival 및공개승리장면/시간주입0 |
| `production-ready-receipt.json` | player22054B/SHA`5dd8121097e11aa0274bc1cd1103fad295aebfa01456b9cf0ec92748889d3c2c`; physical6870B/SHA`e1374e85b479d7efa941fb909433313d29f722be3cf08a1ed27209802e07969a` | producer의actualREADY/bytefreeze receipt를참조;이worker제품재작성0 |
| 기존 source/config 선언 | `scope.burn_dot_ported=false`, `native_source_contract.physical_post_hit_effects.burn.currently_ported=false` | 원config생산당시snapshot불변. 새currentcode소비를그JSON수치수정으로표시하지않음;새config/helper0 |

## 새 고유 검사와 실제 실행 ledger

독립 fixture는 원 combat와 초기HP350·poise4/노드생성값을사용한다. playerHP/poise/timer/state에강제값을쓰지않고 실제publicmethod와actualclass update를호출한다. 자연 iframe60은 정상 magic10 네 hit→pStun240종료,lowHP8은정상phys1000세hit,기검참hold는정상2타/회복→세번째publicrequest→hold40으로도달했다. current인간app에는입력/observer/HP·위치·clock보정/승리를주입하지않았다.

| 새 고유 그룹 | 실제 검증 | 최초 결과 |
|---|---|---|
| `post_hit_pulse_expiry` | 실제physical hit24→pool48/t600/tick0;stagger6→idletransitionburn0;first30/last570/599retained/600expiry;19actualDOTpacket/1expiry. naturaliframeoutercontact거절·lethal뒤append/죽음freeze | PASS |
| `stack_timer_independence` | 15틱차이로birth한2stack의서로다른pulse/timer;cap10에11번째false/기존timer보존;read-onlydeepclone격리;10개raw2→perstackHP1;enteredidleloop중죽음후전stack시간처리/다음deadfreeze | PASS |
| `dot_isolation_cancel_persistence` | pStun동안freeze·자연iframe거절pulsetick소진/nextpulse수용;publiccombo2→hold40 actualcontactHP24/poise1/append후cancel;独DOT2stack보존·각pulse·acceptedKB/poise/stagger/iframe비간섭 | PASS |
| `automatic_pause_native_clock` | 독립actualSceneTree60Hz진행→pause中process4framesfreeze→resume기존수명유지. main과같은world-before-player계층에서physicalpriority1/player0 actualdispatch oldpulse→contact→birthage0 | PASS |

| 실행 / 계수 | 실제 보존 값 | 증거 / 한계 |
|---|---|---|
| 단일 새 최초 실행 |4PASS/0FAIL/failed_assertions=0/exit0,Godot4.7.2. elapsed `.802048708s` | `tests/first-four.stdout.log`, `first-four.stderr.log`, `first-four-receipt.json`. elapsed는검사프로세스길이로게임FPS/성능측정이아님 |
| 명시 actualnative methods |1597회 | 정지된 독립 fixture에서 실제 `_physics_process(1/60)` 호출1597회. 정상 publicmethod 호출은 이 계수와 별도이며 원 live global clock을 조작하지 않음 |
| 자동fixturephysics |17틱(전체) | 자동진행·resume·priority관측세구간의합계. 각구간별tick세부숫자는출력하지않았으므로추정0. process4frames는정지관측이며17tick에누적시키지않음 |
| 실패/수리/재실행 |0/0/0 | 최초4모두통과. 통과4및기존고유3/3/5/JS반복0;parser별도반복0 |
| 기존동결·분리 |GUI0/liveinputs0/forcedactorfields0/sourcefactory0 | 새기술4를이전검사와합산최신totalPASS로표시하지않음. 기존공개세션동결·현재human source1paused未loaded |

raw/receipt root는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/etype0-physical-burn-first/`다. 실제human `user://qa/latest-session.json`을덮어쓰지않았다. 새 테스트가 루트 ignore `test_*`에걸리므로부모가정확이검사파일만force-stage하고ignore규칙은수정하지않는다. workerGit/stage0이다.

## MAP PRODUCTION REPORT (§23) — 기존 geometry / 공개 화면 경계

| 항목 | 현재 결과 / 미완 |
|---|---|
| MASTER / STAGE |정확원record14물리탄burnposthit첫소비. 신규stage/factory/source목록생성0 |
| LARGE / MEDIUM / GROUND / LANDMARK |원PNG·map/geometry/collision/nav/배치/material/loader/server변경0 |
| PLAYABLE / COMBAT |burnraw기술4PASS;새live공개교전미완. 전체nativeguard·player쉴드·affix·fallen/revival/retry未포트 |
| CAMERA QA |현재인간source1fullscreenpaused화면유지·새source未로드. 새burnpixels·방향·벽/전체route공개검수0 |
| TECH QA |신규4최초PASS/0FAIL/exit0.명시1597/자동17(별개)/pause4process. 기존3/3/5및JS동결 |
| FILES / GIT |worker소유3파일freeze·타인WIP보존.부모가제품+새검사+SSOT+관련docs정상checkpoint담당;성공전commit완료표시0 |
| VISUAL VERDICT |**RETOUCH** — 새burn공개소비/화상예술품질/전체AI/원globalphase전체parity/최소Windows1080p240未검증 |
| NEXT PASS |별도승인된actualapp에서원consumer접촉/화상·독립stack/실원route검수. fullguard/쉴드/affix/fallen/revival/retry·sourceglobalclock전체동일성·최저240은별도미완단위 |
