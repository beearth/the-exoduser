# BC06 — 1장 보스 패턴 시작 command packet

## 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업·브랜치 | `bc06` / `codex/bc06-20261020`, `~/exoduser-wt/bc06`. worktree add --no-checkout 후 non-cone sparse checkout |
| 원본 | 최신 fetch main `e556b617190c325ca39f5add04357f5dea5ca87e`, game.html 65,692행·SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 분기 기준의 HTML과 byte 동일 |
| BC05 의존 | main 미편입인 `e1850171849de176ad7d5df61e2cd296705ad7b7` 끝에서 분기. BC01~05 모듈·기존 테스트 읽기 전용 |
| WORK_BOARD | 최신 main 전체 읽음. 보스 관련 TRACE-BOSS-CH1 행60은 추적 문서, BC01 행66은 catalog. 신규 start module/test 쓰기 경로 중복 없음 |
| 현재 단위 판정 | 순서안 BC06은 신규 패턴 시작 command packet/공용0줄. 실제 전투·Main 연결은 필요하지 않아 구현 진행. 그런 연결을 요구하는 후속 단위는 이번에 착수하지 않음 |
| 자기 소유6경로 | 신규 `godot/scripts/native_ch1_boss_pattern_start.gd`·`godot/tests/test_boss_ch1_bc06_start.gd`·실제 생성 UID2개·이 보고서·허용 CHANGELOG_SYNC 맨 위 절 |
| 보존 | 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state·타 담당/선행 코드·기존 테스트·project.godot·WORK_BOARD·설계/LOCK·원본·Q/E·2_3·세이브 수정0. R HEAD/branch/INDEX/WORK·index byte 불변 |

sparse는 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`만 받았다. 빈 index는 같은 HEAD의 git read-tree -mu HEAD로 초기화했고 대용량 웹 에셋/output·node_modules는 받지 않았다. 원로그·실행 프로젝트·보고서 사본은 `~/exoduser-wt/_out/bc06/`에 보존한다. push·원격 SHA 대조·DONE 기록 뒤 자기 worktree만 remove --force하고 브랜치는 유지한다.

## 공통 전조·보호 경계

| 원본 행 | 정확 계약 |
|---|---|
| 37701–37705 | _atkParryable은 기존 _PARRYABLE_ATK Set의 id 포함 여부 읽기만. tele=ToInt32(mv.tele×phase.teleM)+extraDelay, si2만 다시 ToInt32(tele×1.4). zero이면 case별 원본 fallback을 사용, 음수 tele를 임의 clamp하지 않음 |
| 37706–37710 / 16648·17054–17056 | 현재 _DEMO_LAST_STAGE=0인데 finale는 동시에stage3을 요구해 도달 불가. finale 전용 최저전조/rest/lock 쓰기는 ordinary CH1에 복원하지 않음 |
| BC01 / 9960–9967 | 최종 CH1 합집합24개의 원본 metadata만 사용. selector가 소유하는 Set/phase gate를 start에서 새로 추가하지 않음. 강제 호출 표본과 실제 stage가 고를 수 있는 기술을 구분 |
| 14333/14338/16631 | EL.D=3, ELC7색, T40을 read-only 원본 값으로 사용. 색상 미존재 시 각 case 원본 fallback. 새 Q/E 분류/보호창/피해 집행 변경0 |
| 37714 / 16938–16939 | fan의 QA opt-in은 caller가 실제 thorn_first bool을 공급해야 함. normal druid=ib·si0/3·!finale이며 actor._bossPhase\|\|0≤1일 때만 wind max와 현재 player 방향 기록. opt-in 상태를 임의 false로 만들지 않음 |

수치의 `~~`는 signed ToInt32로 구현했다. phase 인자와 actor._bossPhase가 다른 입력도 원본대로 구분한다. 전자는 전조/멀티대시·slash 횟수, 후자는 즉시 탄·큐 생성 수량 등에 쓰인다. 현재 poise·reviveIframes·deaths·revPts·shield·baseAtk 등은 이 모듈에서 쓰지 않는다.

## 24개 시작 분기

| id | 원본 행 | 상태·수치·명령 |
|---|---|---|
| burst | 37713 | bossBurstWind, tele\|\|55, 광역발사 text/charge |
| fan | 37714 | bossFanWind, tele\|\|30, 위 opt-in 분기, 확산 text/charge. phase0=18, si2=floor(18×1.4)=25 |
| charge | 37715 | bossChargeWind, tele\|\|55, 돌진 text/charge |
| jump | 37716–37719 | 실제 canMv readback→실패 시 safePt→null이면 자기 위치. jumpX/Y/Ox/Oy, bossJumpWind, st2·telegraphT=tele\|\|34, telegraphR=r+30, text/charge |
| shock | 37722 | bossShockWind, tele\|\|45, 충격파 text/charge |
| summon | 37723 | bossSummonWind, tele\|\|55, 소환 text/magic3. child 생성은 시작 시 하지 않음 |
| grab | 37728–37729 | d<120이면 bossGrabWind, tele\|\|40, max·현재 facing 저장. d≥120이면 bossChargeWind, ToInt32(55×teleM)+extraDelay\|\|55로 **si2 1.4배를 적용하지 않는** 별도 식 |
| spin | 37730 | bossSpinWind, tele\|\|35, spinAng0, text/swing |
| mine | 37731 | bossMineWind, tele\|\|30, text/magic0 |
| multiDash | 37733 | bossMultiDashWind, tele\|\|20, dashCnt4+ToInt32(phase1.5),idx0,text |
| slashCombo | 37734 | bossSlashWind, tele\|\|20, slashCnt3+ToInt32(phase1.5),idx0/weaponAng0,text |
| slam | 37735 | bossSlamWind, tele\|\|35, weaponAng−1.2,text |
| sweep | 37736 | bossSweepWind, tele\|\|25, weaponAng−.8, u>.5이면dir1/그 외−1,text. 기존 isTail을 임의 reset하지 않음 |
| tailSwipe | 37737 | bossSweepWind, tele\|\|40, weaponAng−1.15/dir1/isTail true,text/swing |
| burrowStrike | 37750–37754 | teleOx/Oy·현재 P방향→bossDruidDive·st2/diveMax=tele\|\|50. 원본 addTxt(x,y−30,'🌿⚠',60)의 **4인자 호출**을 그대로 요청, charge. phase0 max37/phase4 max12 |
| beanStorm | 37755 | bossBeanStormWind, tele\|\|25, bsWave0/bsMaxWave3+ToInt32(phase),text/charge |
| chaseAoe | 37759–37768 | 큐 보존/append(src는 실제 boss 참조), maxCnt10/interval60/r450/delay90/rawatk2/druid flag. text/magic0 뒤 bossChargeWind·ToInt32(40×teleM)+extraDelay\|\|40,현재P방향·돌진text. 이 별도 식도 si2 1.4배 없음 |
| elemBall | 37769–37791 | 현재 P방향, 10+ToInt32(actorPhase1.5)발 rawatk3/speed6/r16/life400 부채꼴. normal druid는 magic·homing false·straight true, 타보스 homing true/parryClass 빈문자열. text/magic/addParts/shake8 뒤 recover30 |
| groundFissure | 37931–37948 | 현재 P방향, actorPhase에 따라1/2/3개. speed20/maxLen=ToInt32(max(mw\|\|50,mh\|\|42)×40×.45)/maxT140/w140/rawatk2/explR=min(750,maxLen.3). 요청 뒤 detonate/shake10/text/recover30 |
| tideWave | 37949–37963 | 2+min(actorPhase,2)개, 매 gap에 u×2π. 초기R20+i8/maxR1750/speed15/maxT120/gapSize.8/w60/rawatk1.5/hitT0. magic0/text/recover35 |
| seekerMines | 37964–37978 | **기존 facing** 기준3+min(actorPhase,2)개. offset20/v1/arm60/maxT360/r60/rawatk2/EL.D/hp1/druidMine. charge/text/recover25 |
| poisonTrail | 38013–38019 | 기존 poisonPools 큐 보존, 현재P방향 ptAng/ptT0,bossPoisonDash50,text/magic4 |
| lavaPools | 38085–38117 | si0/3이면 ib와 무관하게 원본17248–17252의 축방향120·좌우360 3점, warn55/73/91/maxT300/r150/rawatk.9, text/magic3/recover25. si1/2는 맵70% 영역8+actorPhase3번 시도·safeN=3−ToInt32(phase/3)·안전점과 엄격거리<180 제외·통과할 때만 radius draw600+u300, warn90/maxT420/rawatk1.2. text/detonate/shake15/recover35 |
| rapidMissile | 38212–38231 | 현재 P방향, 3+min(actorPhase,3)발·각offset.15·속도14+phase2·발사offset r/rawatk2/life300/sz3/homing/trail. charge/shake8/text/addParts12/recover30 |

‘탄 수’는 원본 _spawnBossProjectile에 보낸 요청 수다. 실제 drop·잔존·후처리·피해/패링 성공 수로 세지 않는다. 큐도 원본 array push payload를 생성하는 요청이며 실제 World/HUD/UI/오디오/맵에 적용하지 않는다. 기존 설계·추적 문서의 소유 경계를 유지하고 새 현황은 이 보고서와 CHANGELOG만 갱신한다. 관련 docs 검색 목록은 `_out/bc06/docs-matches.txt`다.

## API·공용 접점

| API·경계 | 계약 |
|---|---|
| source_receipt | 최신 main/hash·BC05 의존·원본 범위·24case·protected_parry_read_only=true 및 원본 Set 복사, live_start_connected/combat_execution_verified=false |
| begin_start(si,id,enemy,distance,phase,extra_delay,context) | 24개 CH1 union의 static metadata로 독립 continuation 생성. stage0..3만. 필요한 player/facing/atk/radius/색상·QA opt-in snapshot 부재/미지원 shape는 NOT_READY |
| next_start(token,response,rng) | 직전 owner ack 후 다음 명령 전까지 원본 순서의 scalar write·RNG event를 계산, 단일 command와 다음 token 반환. 마지막 done=true는 명령 계산의 종료일 뿐 full_tick_complete는 항상false |
| jump reader | canMv는 실제 bool value, safePt는 실제 좌표/null value가 필요. reader 부재와 실패/null을 구분하며 dummy 성공/좌표 생성0 |
| queue 명령 | ensure_global_queue는 원본 `if(!G.queue)G.queue=[]`를 owner가 실제 상태에서 평가. append_global_queue는 원본 payload를 추가. []/기존 데이터 보존, src의 actor_ref=boss를 실제 owner가 자기 actor identity에 바인딩해야 함 |
| UI/SFX/VFX | addTxt/_spawnBossProjectile/addParts/SFX/ shake 요청 모두 executed=false. _T 인자 recipe는 실제 번역 후 평가하고 chase의 replace는 첫 한 번만. owner 실행/ack 전 다음 단계로 진행하지 않음 |
| RNG | sweep/tide/generic lava에서 source 위치에만 주입 unit[0,1) 요청. helper 내부 난수는 실제 helper owner가 그 시점에 소비. provider 부재/잘못된 unit은 enemy=null·소비한 실패 attempt ledger 보존, rollback 위장 없음 |
| 보호·후속 | _atkParryable·normal elemBall의 원본 요청 flags만 전사. 실제 Q/E classifier·collision·hurtP/hurtE·투사체 후처리 권위 교체0. 큐 후속 tick은 BC11/12 등, 실제 보스 actor/Main은 BC14/17 의존 |

이 BC06 단위에 필요한 공용 수정은0줄이다. 실제 실행 연결의 owner/네이티브 삽입 줄 수는 이번 검수 범위에서 미확인이고 임의 Main/factory 어댑터를 만들지 않았다. 순서안 다음 BC07은 신규 근접 상태 packet/공용0줄로 정의되어 있으나 미착수다. 실제 전투·Main 연결 등 공용 쓰기를 요구하는 단위가 배정되면 필요한 위치·줄·원본 근거만 보고하고 멈춰야 한다.

## 독립 검증·재현

신규 USERDIR은 `EXODUSER-bc06-Isolated-20261020`이며 ProjectSettings 두 값과 실제 OS 경로를 검증한다. 제출본과 동일 byte인 `_out/bc06/start-project` 사본으로 실행했다. Main/actor0, 테스트의 source file read는 지정 game.html 해시 확인뿐이며 제품 모듈에는 IO가 없다. 기존 회귀는 파일별 상수 userdir을 유지하고, 상수 없는 test_contracts만 `EXODUSER-bc06-Contracts-Isolated-20261020` wrapper로 실행한다.

독립 Node VM에서 원본 _bossStartPattern 본문·MOVES/PHASES/최종Set/EL/ELC/T/normal druid·poison targets helper를 원래 행 위치 그대로 추출했다. Godot 모듈로 expected를 만들지 않았다. 24case×모든si/phase와 전조0 fallback·grab119/120·jump 세 결과·QA flag/actorPhase·원소색fallback·고정facing·큐 기존 데이터·generic lava 거리180 양옆/제외 분기를 포함한662건이다. write/명령/RNG 원본 이벤트6,607개·직접 draw1,137회를 순서·행·값까지 비교한다. 모듈의 begin/step 입력 불변, queue identity placeholder, 전역/입력/장면 불변, BC02→BC04→BC06 및 BC05 후속 recovery 계약도 검사한다.

helper stub의 추가 난수 소비와 ib=false·허용 Set 밖 CH1 union 강제 호출은 프로토콜/원본 분기의 독립 probe이며 실제 게임 선택·피해/패링 성공의 증거가 아니다. 정수·문자열·boolean·key와 순서는 정확 동등식, 비정수는 `1e-12×max(1,|expected|)` 이내 비교다. oracle는 비정수 NaN/Infinity가 기대값에 섞이면 즉시 거부한다.

원본 추출/기대값은 source_oracle.mjs/source-extract.js/source-oracle.json, 최종 테스트 전사 도구는 build_test.py다. 원본17248–17252의 닫는 괄호를 처음 추출에서 빠뜨린 준비 오류는 범위를 바로잡았다. 제품/원본 변경 없이 원본 함수 그대로 실행한다.

```sh
cd ~/exoduser-wt/bc06
node ~/exoduser-wt/_out/bc06/source_oracle.mjs
python3 ~/exoduser-wt/_out/bc06/run_one.py bc06-review-01 ~/exoduser-wt/_out/bc06/start-project test_boss_ch1_bc06_start --source-game=/Users/fordeargamers/exoduser-wt/bc06/game.html
```

worktree 제거 후 재검수 시 branch를 같은 sparse 경로에 먼저 복구한다. basename은 원로그 보호를 위해 새 이름을 쓴다. 각 Godot 호출 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`,2개 이상이면30초씩 대기하고 count/시각은 *.gate.jsonl에 보존한다. 다른 엔진/실행창 종료0이다. .out/.err는 stdout/stderr 원문, .engine.log는 engine, .json은 argv/cwd·gate·exit·ERROR·RESULT·시간이다.

## 실제 실행·마감

Godot `4.7.2.stable.official.ed1daf0bf`를 사용했다. 아래 시간은 engine 실행 구간이며 pgrep 대기는 별도다. 최종 신규는 count2에서30초씩2회 대기 후 count1에서 시작했다. 최초 실패도 그대로 보존하며, 최종/기존 회귀는 모두 exit0·ERROR0·RESULT 존재·단정0 아님·실패/skip0을 확인했다.

| 검사 / 원로그 basename | 실제 결과 | exit | 오류 원문 분류 | 실행 초 |
|---|---|---:|---|---:|
| 신규 최초 / fixture 오류 / `bc06-01` | 14,077단정/2실패/skip0 | 1 | BC06_FAIL2/engine0 | 0.592 |
| 신규 최종 / `bc06-02` | 14,099단정/0실패/skip0 | 0 | 0 | 0.597 |
| BC01 기존 / `bc01-regression-01` | 681단정/0실패/skip0 | 0 | 0 | 0.199 |
| BC02 기존 / `bc02-regression-01` | 5,257단정/0실패/skip0 | 0 | 0 | 0.255 |
| BC03 기존 / `bc03-regression-01` | 31,976단정/0실패/skip0 | 0 | 0 | 0.375 |
| BC04 기존 / `bc04-regression-01` | 21,899단정/0실패/skip0 | 0 | 0 | 1.052 |
| BC05 기존 / `bc05-regression-01` | 18,424단정/0실패/skip0 | 0 | 0 | 0.48 |
| 자기 cold import / `import-01` | 정상 완료 | 0 | 0 | 12.881 |
| test_contracts / `contracts-01` | 5/5 case·failed_assertions0 | 0 | 0 | 2.173 |

최초 bc06-01의2실패는 (1) map-source-fallback의 groundFissure 표본에 player_x/y가 없어 제품이 NOT_READY로 거부한 것과 (2) 별도 explR 단정에서2304×.3의 binary floating 결과를 literal691.2와 허용오차 없이 비교한 것이다. 전자는 원본/제품 모두에 유효한 player 좌표 literal을 넣고 oracle가 NaN/Infinity를 기대값으로 허용하지 않게 했으며, 후자는 기존1e-12 오차 기준을 적용했다. 제품 .gd/원본 수치 변경0, 실패 assertion 삭제0이다. bc06-02는 같은662건 전체 및 경계 검사를 재실행해14,099/0·이벤트6,607·RNG1,137회 일치를 확인했다.

기존 회귀는 EXODUSER-bc01/02/03/04/05-Isolated-20261020의 각 파일 상수를 그대로 사용했다. 상수 없는 contracts wrapper만 전용 userdir을 사용하고 그 외 project 설정은 원본 byte 기준이다. suite-summary.json은 기존7개 실행(import 포함)의 승인 조건을 보존한다.

cold import가 만든 미추적 UID136개와 에셋 .import 메타데이터35개는 import 시작 이후 생성 시각을 확인해 원로그 import-generated-uids/·import-generated-metadata/로 옮겨 보존했다. 사전 존재 파일은 건드리지 않았고 새 소유 UID2개만 제출한다. 각 목록/해시는 같은 이름의 JSON에 있다.

| 마감 확인 | 결과 |
|---|---|
| 범위 | 소유6경로만 명시 stage. test_* 광역 ignore 때문에 새 test gd/uid 두 경로만 git add -f -- 사용, ignore 규칙/다른 담당 수정0 |
| byte | 시작21파일(HTML2·공용6·BC01~05·기존 테스트·AGENTS/project) SHA256 동일. 제출본/실행 사본 동일, CHANGELOG 기존 본문 보존 |
| R·전역 | R HEAD/branch/INDEX/WORK와 index byte·Godot 전역 editor_settings 사전 사본을 대조. Q/E·2_3·세이브 형식·원본 값 수정0 |
| 마감 main | e556b617을 다시 fetch·원격 대조, HTML byte/행·WORK_BOARD 보스 소유 동일 |
| 훅·Git | 실제 .githooks/pre-commit/docs-sync-check 정상 사용. no-verify/우회 환경·main/force push·git add -A 없음. 자기 branch push 후 원격 SHA 일치·DONE 기록·자기 worktree 제거, branch 유지 |
| 인계 | 최종 branch/SHA·수치·정리 결과는 _out/bc06/DONE.txt 및 verification.json. 보고서 동일 사본 bc06_REPORT.md도 원로그에 보존 |


선재 결함 전달 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번 단위에서는 재실행·수정하지 않았다.

실제 UI/SFX/VFX·탄 잔존/후처리·큐 tick·패링/피해·실전/시각/성능·PC 실행은 미인수다. 이번 판정은 신규 command packet 및 관련 기존 격리 계약에 한정한다.
