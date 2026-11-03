# BC05 — 1장 보스 phase·시계 전이 packet

## 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업·브랜치 | `bc05` / `codex/bc05-20261020` / `~/exoduser-wt/bc05`. `git worktree add --no-checkout -b` 후 필요한 경로만 non-cone sparse checkout |
| 최신 main 원본 | fetch한 `e556b617190c325ca39f5add04357f5dea5ca87e`. game.html 65,692행·SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 작업 기준과 byte 동일 |
| 선행 | BC04 `818e9b2027afa37fadbf13a6b79b885abdb95f6b`가 main에 없어 그 끝에서 분기. BC01~04 모듈·테스트 읽기 전용 |
| 시작 WORK_BOARD | 최신 main 전체 읽기. 보스 관련 TRACE-BOSS-CH1 행60은 추적 문서, BC01 행66은 catalog. 신규 phase·clock 파일과 중복 없음. 공용 수정이 필요한 다음 단위를 임의로 착수하지 않음 |
| 자기 소유 | 신규 `godot/scripts/native_ch1_boss_phase.gd`·`godot/tests/test_boss_ch1_bc05_phase.gd`와 실제 생성 UID2개, 이 보고서, 허용 CHANGELOG_SYNC 맨 위 절. 총6경로 |
| 보호 | 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state, 기존 코드/테스트·project.godot·WORK_BOARD·원본 HTML·설계 docs·Q/E·2_3·저장 형식 수정0. R HEAD/branch/INDEX/WORK와 index byte 불변 |

sparse 경로는 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`이다. 빈 index는 같은 HEAD의 `git read-tree -mu HEAD`로 초기화했다. 대용량 웹 에셋/output·node_modules는 받지 않았다. 원로그·실행 프로젝트·보고서 사본은 `~/exoduser-wt/_out/bc05/`에 보존한다. push·원격 SHA 대조·DONE 기록 뒤 자기 worktree만 제거하고 브랜치는 유지한다.

## 원본 전환·시계

| game.html 행 | 정확 계약·구현 경계 |
|---|---|
| 38236–38245 | hp/mhp >.8/.6/.4/.2이면0/1/2/3, 나머지4. 경계 정확히.8은1. 새 phase가 더 클 때만 한 번 전환, 중간 phase의 강화 반복 없음. hp=max(hp,~~(mhp×ph.hp[1])) |
| 38247–38259 | reviveIframes90, atk=~~(atk×1.3),speed=min(speed×1.15,1.8+phase×.1),maxPoise=~~(maxPoise×1.2). 현재 poise/poiseR·baseAtk 불변. patCd=max(20,~~(patCd×(.9−phase×.05))). stunned0/recover45/patT10/combo null·idx0/feint false/delay0. CD 배열 존재 시0..58을0으로 쓰고 idx59/60은 유지 |
| JS `~~` | 단순 floor가 아니라 signed ToInt32. 소수는0방향 절단, 큰 값은2³² wrap. 큰 mhp/atk/maxPoise와 음수 ATK fixture도 원본과 대조. 원본 수치를 임의 보정하지 않음 |
| 38585–38592 | 레슨 gate 먼저, telegraphT>0 감소/r+20, 벽 push owner 다음 reviveIframes=max(0,old−sp), cursed 감소, shock 종료 reset. telegraph/cursed/flash 등에는 원본에 없는 clamp 추가0 |
| 38614–38635 / 20121 | KB·벽 피해 owner 뒤 bluHitCD 감소→hitStun return→stunned return. stunned cap180/maxStunned 갱신·기존 cancelProjCharge의4필드 reset. stunned/hitStun/pImmune 루프 타이머를 이곳에서 중복 감소하지 않음. numeric stunned>0 뒤 내부≤0 분기는 중간 감소/변경이 없어 도달 불가; 새 그로기 해제/poise 회복을 발명하지 않음 |
| 38771–38772 / 38875 | 상태/DoT owner 뒤 atk=baseAtk, tpFlashT>0 감소. elite/aura owner가 실제 _aAtkM을 정한 뒤, M!=1이면 atk=~~(atk×M). 이 두 체크포인트 사이를 생략해 오라를 영구 적용하지 않음 |
| 38878–38884 | 실제 projectile-charge owner 다음 flow 방향 또는 player 방향 atan2, st2−=sp. flow reader 부재와 명시 null을 구분. 일반형의 비어그로 gate는 이번 ordinary ib=true 범위에서 통과하며 다른 타입 분기 통합 아님 |
| 40445–40450 | frozen idle이면 vx/vy0·kb0 후 return. 살아있는 ib에서 phaseCheck. 현재 finale gate false 뒤 idleMove→BC04 selector는 별도 owner 경계로 남김. phase effects 완료 전 이 후속으로 진행하면 안 됨 |
| 40452–40455 | ib·feinting·상태명 endsWith Wind·st2≤0이면 recover25/feint false, addTxt 요청. 같은 tick switch에서 recover20 상한 적용 |
| 41375–41383 | bossRec에는20 clamp 없음. recover는 기존 atkTicketRelease 요청 후 st2>20을20으로 제한. 만료 시 idle·st2=3+u×5(소수 유지). 일반몹/etype90 콤보 경로 이식0, 새 attack-ticket 시스템/제한 구현0 |
| 16648 / 17054–17056 | _DEMO_LAST_STAGE=0과 finale stage3 동시 조건으로 현재 CH1 finale 도달 불가. 일반 phase 경로만 지원하며 전용 finale로 위장하지 않음 |

`BOSS_BATTLE_SETTINGS.md` §5의 phase/현재 poise 유지/텔레포트·충격파·연출 수치를 읽고 최신 main 원본 실행값을 기준으로 옮겼다. 기존 설계의 “매 프레임 상태 무관”은 updateE 상위 레슨/hitstun/stunned/freeze return을 통과한 이후다. 관련 docs 전체 검색 목록은 `_out/bc05/docs-matches.txt`, 최신 추적 문서/WORK_BOARD 읽기 사본도 원로그에 있다. 설계/LOCK 문서를 수정하지 않고 이번 이식 상태만 이 보고서와 CHANGELOG에 기록한다.

## Phase 후반부 continuation·공용 접점

`phase_transition`은 수치·상태 쓰기 뒤, 원본38271 이후 실행이 필요하다는 요청을 반환한다. 후반부는 `begin_phase_effects`→`phase_effect_step`으로 한 명령씩 생성한다. 각 실제 owner가 직전 명령을 실행·ack한 후에만 다음 원본 난수/명령을 만든다. 연출·피해·투사체 helper 내부의 RNG가 끼어들 수 있으므로 전체 난수를 미리 소비하거나 helper가 난수0이라고 가정하지 않는다. 반환 명령은 항상 executed=false이고 module은 실제 엔진/파일·전역 RNG·World·player를 수정하지 않는다.

| 원본 행 | continuation 명령·소유 접점 |
|---|---|
| 38271–38274 | aura color/출발 x,y/r\|\|20, 14개 출발입자 각각 speed4+u5·size3+u2, 중앙입자·광원 순서. poolPart 등의 실제 내부 소비/생존 판정은 기존 owner |
| 38275–38280 | P.facing+π+(u−.5)×.8,거리80+phase25. canMv 실제 bool readback, 실패 시 player 뒤50의 safePt 실제 좌표/null. 성공한 좌표 쓰기 명령 뒤 도착14입자. 임의 (0,0) safe point/충돌 성공 없음 |
| 38281–38283 | 흰 중앙입자→광원→tpFlash8 쓰기→출발/도착 연기→impact→bolt. 원본 순서 그대로 요청 |
| 38285–38290 | R=100+phase30·엄격 거리<R·iframe≤0·s!=charge에서 raw~~(atk×(.4+phase×.1)), dtype magic으로 hurtP 요청. elMul 선곱0. 실제 hurtP 완료 후 player 좌표 readback이 있어야 KB10·텍스트를 생성. helper가 실제 추가한 KB를 덮어쓰지 않고 delta 요청 |
| 38294–38297 | 8+phase4발 방사. vx/vy 각별 3+u 별도 draw, 짝수 rawatk1.5/redBean/homing true·sz1.8, 홀수 rawatk1.2/HSL/size1.5. life/ml380·friendly false·el 원본값. 홀수 redBean/homing key 없음, blackBean flag 추가0. 실제 탄 밀도/drop/피해 후처리는 _spawnBossProjectile owner |
| 38301–38302 | phase label 번역 readback→원본 색/70f 텍스트→reviveVFX 원본 옵션. 충격파 텍스트의 _T는 addTxt 인자 평가 recipe로 표현 |
| 38303–38308 | reviveVFX 뒤 실제 slowMo와 OPT.hitStop readback 요구. _HS.bossPhase=6, hitStop=~~((6+phase3)×OPT.hitStop/100), slowMo=max(actual,60+phase15)→shake14+phase4→groggy→bossSfx profile 읽기 |
| 38309–38312 / 24758–24764 | 120ms timeout 요청에 현재 profile howl·.8·_r(howlP,.12) recipe를 캡처. profile null이면 boss_howl/howl1의 .5 추첨 뒤 _r(.85,.12). timeout·실제 sample/피치 난수는 즉시 실행하지 않고 기존 SFX owner가 정해진 시점에 소비 |

| API | 결과·사용 규칙 |
|---|---|
| source_receipt | source main/hash/ranges·BC04 의존·현재 demo gate·live_tick_connected=false·damage_or_iframe_execution_verified=false |
| phase_transition(si,enemy) | READY: 다음 snapshot·write_keys·outcome·next_boundary·필요한 continuation 요청. 새 phase≤old이면 provider/stat 읽기 이전에 그대로 반환. input read-only |
| clock_step(si,checkpoint,enemy,sp,context,rng) | 레슨/telegraph/벽 뒤/KB 뒤/atk reset/aura 뒤/charge 뒤/phase dispatch/AI 뒤 feint/recovery switch의10개 독립 체크포인트. 다음 실제 owner를 next_boundary로 지정하며 전체 updateE로 묶지 않음 |
| begin_phase_effects(si,enemy,player) | 실제 전환 뒤의 actor/player snapshot으로 독립 token 생성. 필요한 필드가 없으면 NOT_READY. 원본과 입력/반환 alias 분리 |
| phase_effect_step(token,response,rng) | 직전 owner ack·읽기 결과를 받아 다음 단일 명령·다음 token·현재 enemy·그 단계 RNG ledger 반환. 마지막 done=true는 명령 stream 계산 완료이며 full_tick_complete는 항상false |
| NOT_READY | 미소유 si/phase·미지원 numeric/shape·필요 reader/ack·RNG 부재/잘못된 unit이면 enemy=null. 이미 소비된 실패 unit은 ledger로 보존. 임의 기본 player/flow/충돌/피해 성공·global 값 없음 |

실제 적용자는 write_keys 및 명령의 원본 순서만 소비해야 한다. 전체 snapshot으로 교체해 다른 owner의 피해/KB/글로벌 쓰기를 지우면 안 된다. `atkTicketRelease`는 기존 bookkeeping owner에 넘기는 요청일 뿐 새 제한이 아니다. Phase의 reviveIframes90을 기록했다고 실제 보스 hurtE 무적을 집행한 것으로 세지 않는다. 현재 공용 hurtE는 ib를 거부하므로 보스 피해/부활 owner·BC14 actor·BC17 제품 연결은 후속 의존이며 이번 공용 수정0 범위와 분리한다.

## 독립 검증·재현

신규 테스트는 `EXODUSER-bc05-Isolated-20261020`을 ProjectSettings 두 값과 실제 OS userdir로 확인한다. 제출본과 동일 byte인 `_out/bc05/phase-project` 사본에서 실행하며 Main/actor 생성0이다. 기존 회귀는 파일별 USERDIR 상수를 유지한다. 격리 상수 없는 test_contracts만 `EXODUSER-bc05-Contracts-Isolated-20261020` wrapper를 사용하고 userdir 이름 외 project 설정은 원본 그대로다.

원본 Node VM은 기대값을 Godot API로 만들지 않았다. `_bossPhaseCheck` 본문을 그대로 실행하다 첫 presentation read(e.x)에서 멈춰 scalar 전환과 phase-effects 경계를 독립 채집했다. 518개 phase 사례와 updateE 원본 행의 checkpoint별497개를 합쳐1,015건이다. 문턱 양옆/정확값·상위 phase 유지·여러 phase 점프·대형 HP ToInt32·CD부재/null/[]/61칸·sp0/.5/1/2/50·상위return·recover/bossRec·feint·실제 BC02/BC04 packet 접점을 검사한다.

별도 VM은 _bossPhaseCheck 전체 본문을 끝까지 실행하고 기존 helper 호출을 기록한다. 각 phase×8종(직접이동/safePt/실패/iframe/charge/피해 후 위치 변경/nested helper RNG/null SFX profile)의32개 fixture에서 명령2,147개·직접 난수2,528회를 비교한다. 일반 stage0..3에는 profile이 존재하며 null SFX는 원본 fallback 분기의 독립 provider probe다. nested fixture의 helper당 추가2회 소비·피해 후 위치 변화는 프로토콜 대조용 stub이며 실제 helper 동작/피해 성공으로 세지 않는다. 실제 실행은 각 owner가 책임진다.

비교는 snapshot 모든 key/값·write_keys·명령/인자/원본행·RNG tag/unit/순서·실제 callback 수와 입력 불변이다. 정수값은 정확 동등식, 비정수 수치는 `1e-12×max(1,|expected|)` 허용오차다. source_oracle.mjs/source-phase.js/source-<checkpoint>.js 및 effects_oracle.mjs/source-effects.js가 원본 추출·실행 도구, 두 oracle JSON이 기대값, build_test.py가 최종 test 전사 도구이며 add_effects_test.py는 최초 확장 이력(재실행 불필요)이다. helper fixture ack는 실제 실행 성공을 의미하지 않는다고 테스트에도 명시했다.

```sh
cd ~/exoduser-wt/bc05
node ~/exoduser-wt/_out/bc05/source_oracle.mjs
node ~/exoduser-wt/_out/bc05/effects_oracle.mjs
python3 ~/exoduser-wt/_out/bc05/run_one.py bc05-review-01 ~/exoduser-wt/_out/bc05/phase-project test_boss_ch1_bc05_phase --source-game=/Users/fordeargamers/exoduser-wt/bc05/game.html
```

마감 후 worktree는 제거하므로 재검수 시 같은 branch를 필요한 sparse 경로에 먼저 복구한다. run basename은 원로그 보호를 위해 새 이름을 쓴다. 모든 Godot 실행 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`,2개 이상이면30초씩 대기하고 `*.gate.jsonl`에 count/시각을 기록한다. 다른 프로세스/실행창 종료0이다. `.out/.err`는 stdout/stderr 원문, `.engine.log`는 engine, `.json`은 argv/cwd·gate·exit/ERROR/RESULT/시간이다.

## 실제 실행·마감

Godot `4.7.2.stable.official.ed1daf0bf`로 아래 검증을 실행했다. 시간은 engine 실행 구간이며 pgrep 대기는 별도다. 핵심 최초 통과 후 continuation 범위를 추가해 최종 검증을 수행했다. 최종 신규는 count2에서30초씩3회 대기한 뒤 count1에서 실행했다. 모든 Godot 실행은 exit0/ERROR0, 테스트 RESULT 존재·단정0 아님·실패/skip0이다.

| 검사 / 원로그 basename | 실제 결과 | exit | ERROR | 실행 초 |
|---|---|---:|---:|---:|
| 핵심 단계 최초(확장 전) / `bc05-01` | 9,509단정/0실패/skip0 | 0 | 0 | 0.37 |
| 신규 최종(continuation 포함) / `bc05-02` | 18,424단정/0실패/skip0 | 0 | 0 | 0.472 |
| BC01 기존 / `bc01-regression-01` | 681단정/0실패/skip0 | 0 | 0 | 0.195 |
| BC02 기존 / `bc02-regression-01` | 5,257단정/0실패/skip0 | 0 | 0 | 0.25 |
| BC03 기존 / `bc03-regression-01` | 31,976단정/0실패/skip0 | 0 | 0 | 0.363 |
| BC04 기존 / `bc04-regression-01` | 21,899단정/0실패/skip0 | 0 | 0 | 1.04 |
| 자기 cold import / `import-01` | 정상 완료 | 0 | 0 | 13.446 |
| test_contracts / `contracts-01` | 5/5 case·failed_assertions0 | 0 | 0 | 2.174 |

신규 최종은 원본 checkpoint1,015건(phase continuation278)·직접 recovery RNG60회, effects32건·명령2,147개·직접 RNG2,528회 대조를 포함한다. 기존 회귀의 userdir은 각 파일 상수 EXODUSER-bc01/02/03/04-Isolated-20261020을 그대로 사용했고, contracts만 상수 없는 wrapper로 격리했다. suite-summary.json에 기존6개 실행(import 포함) 승인 조건을 보존한다.

준비 단계의 첫 Node oracle은 BOSS_MOVES 선언을 아직 추출하지 않아 ReferenceError였다. 실제 원본9820–9880 선언을 추가한 뒤1,015건을 채집했고 원본/제품 수치 변경0이다. Godot 실패를 성공으로 감춘 이력이 아니며 Godot 두 신규 실행 결과는 위 표 그대로다.

cold import가 만든 미추적 UID136개와 에셋 .import 메타데이터35개는 import 시작 이후 생성 시각을 확인해 원로그의 import-generated-uids/ 및 import-generated-metadata/로 옮겨 보존했다. 사전 존재 파일은 건드리지 않았으며 자기 두 UID만 제출한다. 목록/해시는 같은 이름의 JSON에 기록했다.

| 마감 검수 | 결과 |
|---|---|
| 범위 | 소유6경로만 명시 stage. test_* 광역 ignore로 새 테스트 gd/uid 두 경로만 git add -f -- 사용, ignore 규칙 변경0. 공용/타 담당 코드0줄 |
| 보존 | 시작19파일 SHA256(HTML2·공용6·BC01~04 및 기존 테스트·AGENTS/project) 동일. 실행한 신규/회귀 사본과 제출본 byte 동일. CHANGELOG 기존 본문 보존 |
| R·전역 | R HEAD/branch/INDEX/WORK·index byte를 시작 snapshot과 대조. Godot editor_settings 전역 사본 byte 불변. Q/E·2_3·저장 형식 수정0 |
| 마감 main | e556b617 다시 fetch·원격 대조. game.html byte/행과 WORK_BOARD 보스 쓰기 소유가 시작과 동일 |
| Git | 실제 .githooks/pre-commit/docs-sync-check 정상 사용. no-verify/우회 환경·main/force push·add-A 없음. 자기 branch만 push·원격 SHA 대조·DONE 기록 뒤 자기 worktree remove --force. branch 유지 |
| 인계 | 최종 branch/SHA·수치·정리 결과는 _out/bc05/DONE.txt 및 verification.json. 제출 보고서는 branch 경로, 원로그에 bc05_REPORT.md 동일 사본 보존 |


사용자가 전달한 선재 결함 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번에는 재실행/수정하지 않았다.

이번 제출은 phase·시계 전이 및 후반 명령 stream의 독립 계약이다. 실제 hurtP/hurtE·무적·충돌·탄 생존·연출/포효·full updateE·BC14 actor/BC17 Main 연결·실전/시각/성능·PC 실행은 미인수다. 순서안 다음 BC06도 신규 pattern_start packet/공용0줄로 정의되어 있으나 이번 작업에서 착수하지 않았다. 제품 연결에 공용 쓰기가 필요하면 해당 배정에서 보고·중단해야 한다.
