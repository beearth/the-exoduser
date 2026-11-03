# BC07 — 1장 보스 근접4기술 상태·hit packet

## 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업·브랜치 | `bc07` / `codex/bc07-20261020` / `~/exoduser-wt/bc07`. worktree add --no-checkout 후 필요한 경로만 non-cone sparse checkout |
| 원본 main | fetch한 `e556b617190c325ca39f5add04357f5dea5ca87e`, game.html 65,692행·SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 분기 기준의 HTML과 byte 동일. 마감 fetch main=`ad497089c7955d3e344e1488e5286e9b0ddd9092`에서도 두 HTML byte/행 동일 확인; source_receipt는 시작 검증 main을 고정 기록 |
| 선행 | BC06 `1110eec6c2deacd43c6c20dd52affff33d4e4d47`가 main에 없어 그 끝에서 분기. BC01~06 코드/테스트는 읽기만 함 |
| WORK_BOARD·중복 | 최신 main의 보스 진행행 확인. TRACE-BOSS-CH1 행60은 추적 문서, BC01 시작 행66(마감 최신판 행69)은 catalog. 마감 fetch 작업판도 재확인했고 신규 melee 상태/test 쓰기 경로 중복 없음 |
| 현재 단위 판정 | 순서안 BC07은 신규 근접 상태·hit packet/공용0줄. 실제 전투/Main 연결 없이 구현 가능. actual hurtP/QE/boss_hurtE/poise 집행 성공은 이번 범위가 아님 |
| 자기 소유6경로 | 신규 `godot/scripts/native_ch1_boss_melee_states.gd`·`godot/tests/test_boss_ch1_bc07_melee.gd`·실제 생성 UID2개·이 보고서·허용 CHANGELOG_SYNC 맨 위 절 |
| 불변 | main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state·타 담당/선행 코드·기존 테스트·project.godot·WORK_BOARD·원본·설계/LOCK·Q/E·2_3·세이브 수정0. R HEAD/branch/INDEX/WORK·index byte 불변 |

sparse 경로는 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`이다. 빈 index는 같은 HEAD의 git read-tree -mu HEAD로 초기화했다. 대용량 웹 에셋/output·node_modules는 받지 않았다. 원로그·실행 프로젝트·보고서 사본은 `~/exoduser-wt/_out/bc07/`에 두고, push·원격 SHA 대조·DONE 작성 뒤 자기 worktree만 remove --force한다. branch는 남긴다.

## 원본 상태·수치·순서

BC05가 상위 gate·st2 감소를 끝낸 snapshot을 받아 한 switch case만 진행한다. BC06의 slashCnt/idx·sweepDir/isTail·Wind 상태를 그대로 소비한다. 이 모듈에서 st2를 다시 감소시키지 않는다. Wind에서 active로 바뀌어도 같은 tick에 active case를 추가 실행하지 않는다.

| 원본 행 | 정확 계약 |
|---|---|
| 41074–41078 | bossSlashWind: 현재 P방향 facing, weaponAng=−.8+sin(st2×.3)×.3, u>.5일 때만 vx/vy 추가 draw·입자. 만료 시 bossSlash10/angle−.8/swing |
| 41079–41090 | bossSlash: progress=1−st2/10, angle=−.8+progress2.0. canMv 성공 시 **cos/sin×2.5×sp** 전진. 그 뒤 좌표로 progress>.3/<.7·d<r+Pr+300·iframe≤0·각차<1.2를 검사. 각차는 원본 signed remainder 두 번을 그대로 사용 |
| 41091–41094 | 유효 접촉일 때만 protected contact 요청. 원본 hurtP 식은 ToInt32(atk×1.5×elMul(e.el,ar().el)), KB7. parry 경로는 multiplier3/stunned60/poise20, 실제 isPWin·hurtE/doParry·bank/피해/KB는 owner 경계 |
| 41098–41108 | captured progress>.2/<.8일 때 참격 입자. 이후 실제 readback st2≤0이면 slashIdx++, cnt 미만이면 현재 P방향→bossSlash→st2=8+ToInt32(u4)→angle−.8→shake3×OPT/100→swing. 끝이면 recover25/angle0/shake5×OPT/100. phase0 cnt3·phase4 cnt9는 BC06 원본 값 |
| 41111–41118 | bossSlamWind: 현재 P방향, angle=−1.2+sin(st2×.15)×.2. d>50일 때만 canMv·cos/sin×1.5×sp 전진. u>.6일 때만2추가 draw 입자, 만료 시 bossSlam8/groggy |
| 41119–41132 | bossSlam: angle=−1.2+(1−st2/8)×2.4, st2≤0일 때 angle0·R=1000+si30+(actorPhase\|\|0)80. d<R/iframe≤0이면 contact 요청. raw 식 atk×2.2×elemental 뒤ToInt32, KB14, parry multiplier4/stunned80/poise20. R은 contact 전의 local 값 유지 |
| 41134–41141 | shockR0/shockMax=R 기록, shake14×OPT/100·hitStop=ToInt32(8×OPT/100), ring16개(각size draw)→dust10개(각5draw)→boss_meteor_hit VFX→recover40. shockMax만 썼다고 bossShock 상태/추가 충격파 피해를 생성하지 않음 |
| 41144–41148 | bossSweepWind: 현재 P방향, angle=(sweepDir\|\|1)×−1.2. u>.7일 때만2추가draw 입자, 만료 시 bossSweep14/swing |
| 41149–41162 | bossSweep: progress=1−st2/14, angle=dir×(−1.2+progress2.8), progress>.15/<.85·d<r+Pr+400·iframe≤0·각차<1.7. 유효 접촉만 요청. raw 식 atk×1.8×elemental 뒤ToInt32, KB10, parry multiplier3/stunned60/poise20 |
| 41165–41182 | progress>.1이면 바깥/안쪽 호 입자2개. 실제 readback st2≤0이면 angle0, actorPhase≥2에서 facing±.5rad 범위5개 rawatk.8/speed4/life200/size2 탄 요청→wind text→recover30/shake6×OPT/100 |
| tailSwipe 공유 | BC06의 bossSweepWind/bossSweep를 그대로 사용. isTail의 기존 값/표시명 차이는 보존하지만 판정/피해식을 따로 발명하지 않음 |

hit latch·매 공격별 hit 완료 bool을 추가하지 않았다. 다음 입력의 player.iframes≤0 여부가 원본처럼 다시 판단된다. `recover25/40/30`은 해당 active case의 종료값이며 break 뒤 같은 tick에 recover case를 또 실행하지 않는다. BC05의 recover clamp는 다음 tick에 그 case로 진입할 때 적용된다. phase/feint가 **switch 이전**에 recover로 바꾸는 경로와 구분한다.

## 보호 contact·공용 접점

| 경계·근거 | 실제 계약·미구현 |
|---|---|
| 원본 contact 41091–41094 / 41128–41131 / 41159–41162 | `resolve_boss_melee_contact`에 family·원본행·현재atk/el·원소식 provider·최종ToInt32 위치·parry 공식/multiplier/stun/poise/angle·KB 값을 넘김. 원본이 isPWin을 charge보다 먼저 검사하므로 charge라고 module이 이 요청을 생략하지 않음 |
| 보호 성공 판정 | isPWin을 로컬 false로 대체하거나 fixture true를 실제 Q/E 성공으로 세지 않음. hurtP/hurtE·parryBank/doParry·poiseHit·KB는 protected owner가 실제 순서로 해결해야 함. module은 이를 실행하지 않고 요청에 combat_verified=false, executed=false 유지 |
| 필요한 readback | contact owner가 실제 처리한 뒤 완전한 enemy_after/player_after snapshot을 반환해야 다음 입자/반복/종료로 진행. ack만 있거나 snapshot이 없으면 NOT_READY·enemy/player=null. 처리 전 snapshot을 임의 다음 상태로 보충하지 않음 |
| 실제 boss_hurtE 부재 | `godot/scripts/native_normal_enemy_hurte.gd:151`은 unported_branch_active:boss_hurtE로 ib를 거부. 이 guard를 지우거나 일반몹으로 위장하지 않음. 실제 보스 피해/부활 owner는 후속 의존이며 성공 인수 없음 |
| 실제 hurtP 공식·QE | module이 receive_damage로 바꿔 호출하거나 원소식을 선-floor하지 않음. 실제 elMul/ar/isPWin/weapon enhancement/pParryDmg·보호 성공과 피해 계산은 기존 owner 권위. 요청 metadata와 실제 집행을 구분 |
| 이동 | canMv는 실제 bool readback을 요구. 요청 전진 좌표는 원본 곱셈 순서, 성공 때만 x/y 쓰기. safePt나 XY/X/Y 대안은 이6개 원본 case에 없어 추가0 |
| UI/VFX/탄/글로벌 | SFX/poolPart/playVFXAng/탄/text는 단일 요청. 실제 helper 실행·ack 뒤 다음 source RNG를 소비. G.shake/hitStop도 global_write event일 뿐 실제 글로벌을 건드리지 않음. 탄 생존/후처리는 BC09 등 owner |
| 공용 수정 필요 여부 | 이 BC07 packet 단위에는0줄. 실제 전투/Main/공용 연결은 하지 않음. 실제 owner 채택·연결의 native 삽입 줄 수는 이번 범위에서 미확인, 임의 변경안 구현0. 필요 시 별도 배정에서 해당 위치·줄·근거를 보고하고 중단 |

| API | 반환·조건 |
|---|---|
| source_receipt | 최신 main/hash·BC06 의존·원본 범위·6 switch states, live_combat_connected/damage_or_parry_execution_verified/new_hit_latch=false |
| begin_tick(si,enemy,sp,player,options) | si0..3, six states만. 실제 numeric pose/clock/atk/el/iframe snapshot으로 독립 continuation 생성. 필요한 source option은 쓰기 위치에서 요구, 임의 OPT 기본값 없음 |
| next_tick(token,response,rng) | 원본 순서대로 owned actor/global writes·RNG event를 계산하고 다음 단일 command 전에서 정지. 직전 실제 owner ack/readback 없으면 NOT_READY. 입력은 읽기 전용 |
| READY·done | done은 현재 switch case의 packet 계산 종료다. full_tick_complete는 항상false. 실제 scene·player·global·HP·Q/E·저장 IO 없음 |
| NOT_READY | 미소유 stage/state·미지원 shape·충돌/보호/옵션 reader/ack·RNG 부재/잘못된 unit은 적용 가능한 enemy/player 없음. 소비한 실패 unit은 ledger 보존, RNG rollback 위장0 |

관련 설계/기존 추적의 값은 read-only로 확인했고 새 이식 현황은 이 보고서와 CHANGELOG만 갱신한다. docs 검색 목록은 `_out/bc07/docs-matches.txt`다. 다음 BC08은 신규 이동 상태 packet/공용0줄로 계획되어 있으나 이번에 착수하지 않았다. 실제 전투/Main/공용 연결을 요구하는 단위는 구현하지 않고 보고·중단해야 한다.

## 독립 검증·재현

신규 테스트 USERDIR은 `EXODUSER-bc07-Isolated-20261020`이고 ProjectSettings 두 값과 실제 OS 경로를 확인한다. `_out/bc07/melee-project` 사본은 최종 제출본과 byte 동일하다. 기존 회귀는 각 파일 상수 userdir을 그대로 쓰고, 상수 없는 test_contracts만 `EXODUSER-bc07-Contracts-Isolated-20261020` wrapper를 사용한다.

Node VM에서 원본41074–41183 switch case를 행 위치 그대로 감싸 실행했다. Godot 모듈로 expected를 만들지 않았다. 보호 contact는 isPWin 진입부터 해당 branch 마지막까지 별도 owner 경계로 기록하고, 원본 본문은 fixture helper로 계속 실행해 완전한 readback과 raw helper trace를 채집했다. 공식 coefficient/stun/KB는 원본 문자열과도 대조했다. 그 readback을 module에 주는 것은 owner protocol 검증이며 실제 native QE/hurtE/피해 성공의 증거가 아니다.

| 원본 oracle 표본 | 검증 |
|---|---|
| 최종652건 | si0..3×6상태×상태별 timer·normal/parry-readback/charge/iframe branch·phase0..4·옵션 값·canMv true/false |
| 엄격 경계 | progress/각차1.2·1.7/거리R 양옆·정확값·접근50 양옆, Wind RNG>.5/.6/.7. 수학적 경계의 binary float 결과도 원본 VM 기준 |
| 상대 순서 | slash 이동 뒤 cone검사, contact 후 실제 readback 좌표/st2로 입자/종료, callback 내부의 추가2draw가 끼어드는 packet 순서, slam local R 보존 |
| 반복·공유 | phase0 slash3회/phase4=9회, recover 종료값, slam R1000/1320·별도 shock 피해0, tail/sweep 공유, no-hit-latch·player iframe write 유무의 다음 요청 차이 |
| 읽기·실패 | 누락 contact/readback/충돌/옵션/RNG는 NOT_READY, unit 범위, 입력/continuation 불변, actual BC02→BC06→BC05 시계→BC07의 fixture 데이터 접점, 입력/씬/전역설정 불변 |

정수·문자열·boolean·key·순서는 정확 동등식, 비정수는 `1e-12×max(1,|expected|)` 이내다. 최종 owned 이벤트7,769개·직접 RNG3,321회·보호 contact 요청80개를 비교한다. 이80개를 적중/패링 성공으로 집계하지 않는다. 보호 body raw trace는 source-oracle.json의 responses[].trace, 입력/다음 상태/명령은 같은 oracle에 있다.

첫646건 검증 뒤 전진 계산을 원본의 cos/sin×속도×sp 순서로 맞추고 sp.3/1⁄3/1.25 표본6개를 보강했다. 처음 실행본은 initial-melee-states.gd/initial-test-melee.gd/initial-source-oracle.json으로 보존했고 최종652건을 다시 검증했다. source_oracle.mjs/source-states.js가 추출·oracle, build_test.py가 최종 테스트 전사 도구다.

```sh
cd ~/exoduser-wt/bc07
node ~/exoduser-wt/_out/bc07/source_oracle.mjs
python3 ~/exoduser-wt/_out/bc07/run_one.py bc07-review-01 ~/exoduser-wt/_out/bc07/melee-project test_boss_ch1_bc07_melee --source-game=/Users/fordeargamers/exoduser-wt/bc07/game.html
```

worktree 제거 후 재검수는 branch를 같은 sparse 경로에 먼저 복구한다. 원로그 보호를 위해 새 basename을 쓴다. 매 Godot 호출 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`,2개 이상이면30초씩 대기하고 count/시각을 *.gate.jsonl에 보존한다. 다른 프로세스/실행창 종료0. .out/.err는 stdout/stderr 원문, .engine.log는 engine, .json은 argv/cwd·gate·exit/ERROR/RESULT·시간이다.

## 실제 실행·마감

Godot 4.7.2.stable.official.ed1daf0bf, 전 실행 headless. 신규 최종652건은14,531단정/0실패/skip0, source events7,769/RNG3,321/contact요청80(실제 피해·패링 성공 수 아님)이다. 신규 최초와 최종 모두 통과했고 실패 로그를 생략한 실행은 없다.

| 실제 실행 | 단정/실패 또는 contracts 통과/실패 | 시간·프로세스·오류 | 원로그 basename |
|---|---|---|---|
| 신규 최초646건 | 14,438 / 0 | 0.447s / exit0 / ERROR0 | bc07-01.out/.err/.engine.log/.json |
| 신규 최종652건 | 14,531 / 0 | 0.477s / exit0 / ERROR0 | bc07-02.out/.err/.engine.log/.json |
| BC01 기존 회귀 | 681 / 0 | 0.198s / exit0 / ERROR0 | bc01-regression-01.out/.err/.engine.log/.json |
| BC02 기존 회귀 | 5,257 / 0 | 0.252s / exit0 / ERROR0 | bc02-regression-01.out/.err/.engine.log/.json |
| BC03 기존 회귀 | 31,976 / 0 | 0.379s / exit0 / ERROR0 | bc03-regression-01.out/.err/.engine.log/.json |
| BC04 기존 회귀 | 21,899 / 0 | 1.079s / exit0 / ERROR0 | bc04-regression-01.out/.err/.engine.log/.json |
| BC05 기존 회귀 | 18,424 / 0 | 0.58s / exit0 / ERROR0 | bc05-regression-01.out/.err/.engine.log/.json |
| BC06 기존 회귀 | 14,099 / 0 | 0.549s / exit0 / ERROR0 | bc06-regression-01.out/.err/.engine.log/.json |
| test_contracts | 5 / 0 | 2.178s / exit0 / ERROR0 | contracts-01.out/.err/.engine.log/.json |
| cold import | 정상 완료 | 12.701s / exit0 / ERROR0 | import-01.out/.err/.engine.log/.json |

기존 회귀6개·import·contracts의 suite-summary 8개가 전부 accepted=true이며 기존 테스트는 수정0. 엔진 실행 전 gate 기록은 각 receipt/게이트 로그에 있다. import가 이 worktree에서 새로 만든 미소유 UID136개·asset .import35개는 생성시각을 대조하고 `_out/bc07/import-generated-uids/`·`import-generated-metadata/`로 옮겨 원문/hash 목록을 보존했다. 제출 UID는 신규 자기 파일2개뿐이다.

기존23개 파일 hash·R HEAD/branch/INDEX/WORK 및 index byte·Godot 전역 editor_settings byte·실행 사본과 제출본 byte·CHANGELOG 기존 본문을 대조한다. 변경은 자기 소유6경로로 제한하며 공용/타 담당 파일0줄이다. 최종 정적 대조 결과는 verification.json, 정상 pre-commit docs-sync 결과는 commit.log에 보존한다. push 대상은 자기 브랜치 하나이며 원격 SHA 일치 확인·DONE 작성 후 자기 worktree만 제거한다.


선재 결함 전달 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번에는 재실행·수정하지 않았다.

실제 actor/전투·피해·패링·무적·탄 생존/후처리·UI/VFX/SFX·실전/시각/성능·PC 실행은 미인수다. 공용0줄의 독립 상태·요청·readback 계약까지만 제출한다.
