# BC08 — 1장 보스 이동3기술·idle 공통후속 packet

## 기준·중복·소유

| 항목 | 확인 |
|---|---|
| 작업 | `bc08` / `codex/bc08-20261020`, 새 `~/exoduser-wt/bc08` |
| 원본 | 시작 main `a00893ad9b93750d7ce70b90f5bd501b578daccb`, 마감 fetch 최신 main `26c050a99a711e793a6c2413395acda09b0c1614`. game.html 65,692행 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index.html 4,742행 SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. 분기본과 byte 동일 |
| 선행·기준 | 시작 당시 BC07 `edcbc480491a2b9c55abbb99fcda3dc47073583c`가 main에 없어 그 끝에서 분기. 마감 main 작업판 행76에는 BC07 병합 기록이 있으나 해당 SHA는 main ancestor가 아님. 실제 main에는 BC07 모듈/테스트의 지정 경로도 없다. latest-main-check.json에 존재 여부와 ancestor 결과를 보존했다. 시작 기준 branch를 유지하고 분기본을 검증했다. BC01~07 코드/테스트는 읽기만 함 |
| WORK_BOARD | 시작 main `docs/engine/orders/WORK_BOARD.md` 행60 TRACE-BOSS-CH1=문서, 행69 BC01=catalog. 마감판은 BC04~07 행73~76/BC01 행120 병합 기록, TRACE 행60 문서. BC08 신규 movement 모듈/test 경로 중복 없음. 작업판의 PC 통합 회귀·QA-007 기록을 이번 직접 실행 증거로 전용하지 않음 |
| 순서안 판정 | trace 순서안 행361 BC08은 신규 movement states/공용0줄, collision/flow provider 계약 필수. 실제 전투·Main 연결 없이 packet 범위 가능. 실제 피해·패링 집행/공용 연결은 구현0 |
| 자기 소유 | 신규 `godot/scripts/native_ch1_boss_movement_states.gd`·`godot/tests/test_boss_ch1_bc08_movement.gd`·실제 생성 UID2개·이 보고서·허용 CHANGELOG_SYNC 맨 위 절의6경로 |
| 불변 | 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state, 선행/타 담당 코드·기존 테스트·project.godot·WORK_BOARD·원본 HTML·설계/LOCK·Q/E·2_3·세이브 수정0. R HEAD/branch/INDEX/WORK 및 index byte 불변 |

R에서 worktree add --no-checkout -b로 생성한 뒤 non-cone sparse 경로 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`만 받았다. 빈 index는 같은 HEAD의 read-tree -mu HEAD로 초기화했다. 대용량 웹 에셋·node_modules·output은 받지 않았다. 보고서 사본·실행 사본·원로그는 `~/exoduser-wt/_out/bc08/`, push·원격 SHA 일치·DONE 기록 뒤 자기 worktree만 remove --force하며 브랜치는 유지한다.

## 원본 행·값·실행 순서

BC05의 상위 gate·state clock 감소 뒤 snapshot을 소비한다. BC08에서 st2를 다시 감소시키지 않는다. `_bossIdleMove`는 BC09의 idle 자동탄과 BC04 AI **앞**, 공통 idle switch는 실제 AI/feint 뒤에도 상태가 idle일 때만 실행되는 별도 checkpoint다. 기존 캐시 거리 `d`를 다시 계산해 대체하지 않는다. 일반 CH1 etype0/ib=true·si0..3만 지원하며 eCharge 등 일반몹 상태를 재사용하지 않는다.

| game.html 원본 행 | 구현한 정확 계약 |
|---|---|
| 16644–16648,17054–17055,16938 | 현재 finale은 stage0과 stage3를 동시에 요구해 false. si0/3의 일반 드루이드만 normal druid, 다른 일반 보스와 구별. finale 전용18속도/96recover를 일반35/40으로 합치지 않고 이번 도달 범위에서 제외 |
| 38315–38328 | stunned>0이면 idle move 함수 반환·함수 내부 자동탄도 건너뛰고 AI 경계로 진행. phase.spdM×speed×(aSpdM\|\|1)×sp. d>200은 boost=min(2.5,1+d/300), 실제 `_ffDir` 결과가 null일 때만 P방향 fallback. XY 실패 후X, 실패 후Y를 순서대로 검사·성공한 축만 기록 |
| 38329–38341 | 50<d≤200은 orbitR=max(80,150−phase18), angle+=.015×sp×(dir\|\|1). 기존 cooldown>0이면 감소만, 아니면 u<.005에서만 방향반전/CD60. 목표각→속도×.7, XY/X/Y 순서 |
| 38342–38355 | d≤50 후퇴각+dir.4 전진 검사, 막힐 때만 직각방향 시도. 직각 XY→X→Y이며 최초 뒤쪽 시도를 직각 X/Y로 잘못 대체하지 않음 |
| 38357–38371,40450–40454 | BC08 idle_move의 다음 경계는 BC09 idle 자동탄→실제 BC04 AI/start→BC05 feint→현재 s의 switch. 이 경계를 생략한 합성 tick·임의 ACK·live 연결 없음 |
| 40483,40486–40497 | 실제 switch 진입 시 ib/etype0 idle은 speed1.6×aura×sp 공통 이동도 실행. `_sepCd>0` 감소는 보스도 해당하지만 비보스 separation 조회/쓰기·티켓은 실행하지 않음 |
| 40499–40503 | 캐시 d<r+Pr+8, iframe≤0, st2≤0이면 source hurtP(atk×.8 뒤ToInt32) 경계 요청. 원본은 이 구간에 charge/QE gate가 없음. 실제 보호 owner readback 뒤 현재 P좌표 addParts→40+ToInt32(u20) clock. module은 hurtP/HP를 실행하지 않음 |
| 40505–40517,14333–14338,30870–30872 | ib는 비보스 projCd 복구 제외. projCd<9000·기존 chargeT>0 아님일 때 projT-=sp, projT≤0 및 d<(ETYPE_RANGE[0]\|\|700)이면 projT=projCd·bean/color/class·chargeT60 예약. 실제 etype0 range400, fallback700을 별도 reader 값으로 구분. EL P0/F1/I2/D3/L4/H5/E6, dark/water/fire/normal과 physical/magic 문자열은 원본 그대로. 탄 발사·차징 countdown은 BC09 owner |
| 40664–40667 | bossChargeWind: 일반 드루이드 si0/3은 st2>18일 때만 재조준, 정확18 이하 고정. 다른 보스는 계속 조준. 만료 시 charge50·현재 facing cos/sin 벡터→charge SFX→parts8 |
| 40668–40679 | bossCharge: si0/3·frame%6==0·실제 VFX helper 존재 시 먼저 trail, 그 뒤35×sp 이동·XY→X→Y. 셋 다 막히면 shockR0/shockMax800/bossShock20→shake25×OPT/100→groggy→meteor VFX 후 즉시 break. 충돌 성공 분기는 wall 충격파로 보내지 않음 |
| 40680–40688 | 실제 이동 뒤 거리<Pr+r+80·iframe≤0이면 protected contact 경계. 원본 parry mult5, detonate stun60/그 외90·enemy KB18·poise20, 일반 raw atk2×elMul 뒤ToInt32/KB12. 이 protected body는 실제 owner 의존. readback 뒤 무조건 recover40/break, 입자 RNG를 뒤늦게 소비하지 않음. 비접촉은 u>.3일 때만 x/y/size 추가3draw 입자, st2≤0이면 recover40 |
| 40690 | JumpWind 만료 시 bossJump40→실제 번역 요청/결과→도약 text→slam SFX. 같은 tick에 active jump case를 이어 실행하지 않음 |
| 40691–40703 | Jump: trail 먼저, progress=1−st2/40. 전반 t=progress2의 .3, 후반 t=(progress−.5)2의 .3+t.7 위치. canMv가 참일 때만 이동. st2≤0이면 shockR0/max800+si50→bossShock25→shake25→groggy→flash5/#ffaa00→deathFX 순. 같은 case 안에서 shock 피해를 추가 실행하지 않음 |
| 40705–40707 | landing 실제 거리<300·iframe≤0·P.s!=charge일 때만 atk1.8×elMul 뒤ToInt32/KB15 보호 owner 요청. 이 landing body에는 isPWin 호출이 없음. 실제 피해/뒤의 shock owner는 이번 성공 인수 아님 |
| 40942–40947 | MultiDashWind 매번 P방향. u>.6일 때만 vx/vy draw, si0/3만 별도 color draw(<.5 색분기), 타 보스 #ff4488. 만료 시 cos/sin 벡터→bossMultiDash12→charge SFX |
| 40949–40965 | dash9×sp, trail 조건은 위와 동일, XY/X/Y 셋 다 막혀도 아래 로직 지속(벽 충격파 생성0). si3은 기존 poolPart 잔상 생략. 거리<Pr+r+10·iframe≤0이면 protected contact 요청, parry mult4/stun90·일반 rawatk1.3×elMul 뒤ToInt32/KB8 원본 body는 owner 의존 |
| 40966–40977,37733 | 실제 readback st2≤0일 때 idx++. cnt 미만이면 현재 P방향+(u−.5).4→벡터→10+ToInt32(u5)→shake4. 끝이면 recover25/shake8. 실제 BC06 cnt=4+ToInt32(phase1.5), phase0=4/phase4=10. 새로운 hit latch·개별 무적·피해식 없음 |

## API·provider·공용 접점

| 접점·위치 | 계약·한계 |
|---|---|
| begin_tick(si,checkpoint,enemy,sp,player,context) | `state`는6개 Charge/Jump/MultiDash Wind/active, `idle_move`는38315–38355, `idle_switch`는실제 AI 이후 idle일 때만. 입력/continuation 읽기 전용. actual scene/global/save IO 없음 |
| context.distance | idle 두 checkpoint에서 원본 캐시 d 필수. position 변화 뒤 재산출하지 않음. BC08 idle_move 결과만으로 idle_switch를 자동 호출하지 않음 |
| next_tick(token,response,rng) | 현재 source operation까지 actor/global writes·RNG event와 다음 단일 executed=false command를 반환. actual owner ACK 전에는 다음 RNG/명령으로 진행0. READY/done은 현재 checkpoint 종료이며 full_tick_complete=false |
| canMv / `_ffDir` | 이동 요청은 실제 bool 필요. flow는 명시 value=null 또는 유한x/y 필요, reader 누락을 null fallback으로 위장하지 않음. 좌표·반경 변경·임의 safePt 추가0 |
| 기존 world 의존 | 분기본 `world.gd:3219 can_move`·`:3306 get_path_direction`는 존재. 후자는 Vector2.ZERO/직접 P방향 반환과 source null 의미가 같다고 가정하지 않음. 실제 world adapter 채택·source 좌표/flow 의미 대조는 미확인. world 수정0·native owner 연결0 |
| globals/options | 실제 frame·VFX 존재 여부·필요 시 shake reader 요구. global_write는 G.shake/flash 요청 event일 뿐 전역을 실행 변경하지 않음. etype_range/element_color reader는 원본 상수 권위를 넘겨받는 값이며 임의700/색 기본값으로 생략하지 않음 |
| 보호 contact | `resolve_boss_movement_contact`가 source 범위·atk/el·raw multiplier·elemental provider·최종ToInt32·KB·parry source 범위를 전달. charge/dash의 실제 isPWin→보호 body는 owner만 처리. jump/idle에 원본에 없는 QE gate를 새로 넣지 않음 |
| contact readback | 실제 처리 뒤 완전한 enemy_after/player_after 요구. ACK만·누락/빈 snapshot·기존 actor/player top-level 필드 누락은 NOT_READY, 적용 가능한 enemy/player=null. fixture parry true/readback은 protocol 대조일 뿐 실제 QE 성공 아님 |
| 기존 boss hurtE 부재 | `native_normal_enemy_hurte.gd:151`은 ib를 unported_branch_active:boss_hurtE로 거부. guard 우회·일반몹 위장·다른 담당 파일 수정0. 실제 hurtP/hurtE/패링/poise/KB·HP 집행 인수0 |
| 공용 연결 필요 위치 | 원본40450의 bossIdleMove→bossAI와40455 switch, common update 상위38684/38884 등은 향후 dispatcher 권위가 필요. 이를 연결하는 Main/actor 삽입 native 줄 수·실제 채택 파일은 미확인. 이번 구현은 신규 packet만이며 공용 줄 제안·집행0 |
| 다음 단위 | BC09은 순서안 행362의 신규 projectile packet으로 남겨두며 미착수. 실제 전투/피해/패링 집행/Main 연결이 필요한 단위는 구현하지 않고 필요한 위치/원본 근거만 보고·중단 |

| docs read-only 대조 | 확인·불일치·경계 |
|---|---|
| trace §BC08 | 신규 모듈/테스트·공용0줄·flow/collision 계약을 따름. trace의 제안 USERDIR 대신 사용자 지정 `EXODUSER-bc08-Isolated-20261020` 사용 |
| `9적ai패턴디자인/9_적AI패턴디자인.md:336` | bossChargeWind 행의 tele/55f 요약과 현재 source active50·BC06 phase tele는 다른 값/위치. 원본40666 active50 보존, 설계 문서 수정0 |
| `8.1보스디자인바이블/BOSS_02_FOREST_NORMAL_HELL_ABERRANT.md:19` | jump ‘패링 가능’ 요약과 landing40705–40707의 isPWin 없는 body를 구분. 별도 bossShock/보호 owner의 판정은 이번 미확인. 패링 가능으로 mock 성공/새 QE 호출을 만들지 않음 |
| 마감 WORK_BOARD 행76 | BC07 main 병합 문구가 있으나 main 26c050a9에는 지정 모듈/테스트 경로가 없고 edcbc480도 ancestor가 아님. 의존 branch의 인수 SHA를 유지. 작업판 문구만으로 main 통합/PC 실행 성공을 주장하지 않음 |
| 기존 finale docs·과거 QA | 현재 stage0 AND stage3 gate의 비도달성을 옛 QA/옛 source 치환으로 덮지 않음. 일반 CH1 이동 수치를 기준으로 하며 별도 finale 전용 활성화/96recover 변경0 |

관련 docs 전체 키워드 검색 원문은 `_out/bc08/docs-matches.txt`이다. 공용·설계/LOCK 수정 금지에 따라 불일치는 이 표로만 기록하고 현재 구현 현황은 이 보고서·CHANGELOG 허용 절에만 추가했다.

## 독립 oracle·격리·재현

Node VM에서 최신 main과 byte 같은 game.html의38315–38355 idle 함수/40456–40518 원본 idle case/40664–40708·40942–40977 case 본문을 직접 실행했다. body를 Godot 구현식으로 재작성해 expected를 만들지 않았다. 원본 행을 유지하도록 빈 줄을 채우고 actor/global Proxy 쓰기·canMv/flow/helper 호출·RNG 순서를 기록했다. source-states.js/source-idle.js/source-idle-switch.js와 source_oracle.mjs/source-oracle.json을 원로그에 둔다.

보호 contact는 original isPWin 진입 또는 original hurtP 호출에서 별도 요청으로 기록하고, 원본 body를 fixture helper로 계속 실행해 완전한 readback과 raw trace를 수집한다. charge detonate/일반 parry/normal/charge immunity/iframe readback을 대조하지만 실제 native QE·hurtP/hurtE·피해/패링 성공 증거는 아니다. source raw multiplier와 parry multiplier는 원본 문자열과도 대조한다. 기존 range/color reader의 fallback 분기 테스트는 reader 입력 변형이며 실제 etype0 range가400이라는 원본 상수와 구분한다.

| 표본 | 독립 대조 |
|---|---|
| 총1,477건 | si0..3×6상태×timer·normal/parry-readback/charge/iframe·phase0..4·XYZ collision branch·VFX frame/존재 여부 |
| idle | d50/200 양옆과 정확값, approach null/flow, orbit CD>0 감소와 u<.005 반전, retreat 최초뒤쪽/직각XY/X/Y, 동일 tick 이동중첩을 checkpoint별로 대조 |
| 보호 경계 | 실제 이동 뒤의 거리·iframe gate, cached d 기반 idle contact, owner readback 좌표/st2 변경 뒤 후속분기, nested helper2draw가 끼는 RNG interleaving |
| strict·clock | 마지막18f 양옆·정확18, jump 반 진행 양옆·정확.5, 거리300/136/66 양옆, RNG>.3/.6·color<.5, sp.3/1⁄3/1.25와 native .5/1/2 |
| 연속 원본 chain | charge50f 종료(.5/1/2), jump40f 한 번 착지(.5/1/2), stunned 조기 반환3건, phase0 dash4회/phase4 10회, actual BC02→BC06→BC05→BC08 데이터 접점·st2 중복감소0 |
| 숫자 비교 | 원본 JSON 직렬화 전 정수였던 모든 actor/player/event/global 경로는 정확 비교. 비정수는1e-12×max(1,abs(expected)) 이내. 원본 비정수가 Godot JSON parser에서 정수로 반올림되더라도 정수 경로로 오분류하지 않음 |
| 실패·불변 | actual ACK/충돌 bool/flow value/보호 readback/필수 context/RNG 누락·잘못된 unit은 NOT_READY. 실패 unit ledger 보존. 입력·continuation·씬·InputMap·FPS/locale 불변 |

신규 실제 userdir은 `EXODUSER-bc08-Isolated-20261020`, 기존 회귀는 각 파일의 USERDIR 상수를 그대로 사용한다. test_contracts는 상수가 없어 `_out/bc08/contracts-project` wrapper에만 `EXODUSER-bc08-Contracts-Isolated-20261020`을 설정했다. repo project.godot은 불변이다. 실행 사본의 모든 .gd는 최종 제출 파일과 byte 대조한다.

```sh
cd ~/exoduser-wt/bc08
node ~/exoduser-wt/_out/bc08/source_oracle.mjs
python3 ~/exoduser-wt/_out/bc08/run_one.py bc08-review-01 ~/exoduser-wt/_out/bc08/movement-project test_boss_ch1_bc08_movement --source-game=/Users/fordeargamers/exoduser-wt/bc08/game.html
```

worktree 제거 후에는 같은 sparse 경로로 branch를 복구한다. 재실행 basename은 새로 지정해 기존 로그를 덮지 않는다. 모든 Godot 실행 직전 exact `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 결과가2 이상이면30초 대기 후 재검사하며 원시 count/시각은 *.gate.jsonl과 receipt에 보존한다. 타 실행창·프로세스 종료0. `.out/.err`는 stdout/stderr 원문, `.engine.log`는 engine, `.json`은 argv/cwd·gate·exit/ERROR/RESULT·시간이다.

## 실제 실행·마감

Godot 4.7.2.stable.official.ed1daf0bf, 전 실행 headless. 최종 bc08-04는24,788단정/0실패/skip0/ERROR0, 1,477건/owned 이벤트7,791개/RNG750회/보호contact요청152개 대조. 152개는 실제 피해·패링 성공 수가 아니다. BC01~07·import·contracts suite-summary 9개는 모두 accepted=true다.

| 실행 | 단정/실패 또는 contracts 통과/실패 | 시간·프로세스·오류 | 원로그 basename |
|---|---|---|---|
| 신규 최초 | 24,750 / 6 | 0.824s / exit1 / ERROR·FAIL6 | bc08-01 |
| 최초 진단 | 24,750 / 6 | 0.873s / exit1 / ERROR·FAIL6 | bc08-diagnose-01 |
| fixture 수정 | 24,750 / 0 | 0.754s / exit0 / ERROR·FAIL0 | bc08-02 |
| 조기 반환 보강 | 24,786 / 0 | 0.763s / exit0 / ERROR0 | bc08-03 |
| 최종 readback 보강 | 24,788 / 0 | 0.751s / exit0 / ERROR0 | bc08-04 |
| BC01 회귀 | 681 / 0 | 0.175s / exit0 / ERROR·FAIL0 | bc01-regression-01 |
| BC02 회귀 | 5,257 / 0 | 0.237s / exit0 / ERROR·FAIL0 | bc02-regression-01 |
| BC03 회귀 | 31,976 / 0 | 0.346s / exit0 / ERROR·FAIL0 | bc03-regression-01 |
| BC04 회귀 | 21,899 / 0 | 1.024s / exit0 / ERROR·FAIL0 | bc04-regression-01 |
| BC05 회귀 | 18,424 / 0 | 0.553s / exit0 / ERROR·FAIL0 | bc05-regression-01 |
| BC06 회귀 | 14,099 / 0 | 0.654s / exit0 / ERROR·FAIL0 | bc06-regression-01 |
| BC07 회귀 | 14,531 / 0 | 0.446s / exit0 / ERROR·FAIL0 | bc07-regression-01 |
| test_contracts | 5 / 0 | 2.204s / exit0 / ERROR·FAIL0 | contracts-01 |
| cold import | 정상 완료 | 12.914s / exit0 / ERROR0 | import-01 |

최초 oracle 생성에서는 helper가 없다는 fixture를 unguarded wall-impact에 넣어 TypeError가 발생했다. fixture를 guarded 경로로 제한했고 `oracle-initial-error.txt`로 기록했다. 최초 Godot 검증 `bc08-01` 24,750단정/6실패, 진단 `bc08-diagnose-01`도 같은6실패를 보존한다. 원인은 jump st2=16의 원본 비정수 좌표109.99999999999999가 Godot JSON parser에서110으로 로드되어 정수 정확 비교로 오분류된 테스트 오류였다. 제품 movement 모듈은 두 실패 실행과 fixture 수정 통과 bc08-02 사이 byte 동일하다. 이후 마감 검토에서 stunned 조기 반환의 다음 경계 표기·idle ToInt32 metadata를 명료화하고, readback에서 기존 actor/player 필드가 빠진 경우도 거부하도록 보강했다. 보강 전 실행 사본은 review03-*.gd로 보존하고 최종 보강본은 bc08-04로 별도 검증·통과했다. 정수 경로 mask를 원본 직렬화 전 값으로 고정하고 비정수만 명시 허용오차를 적용했다. 최초 테스트/모듈·원본 기대값(initial-oracle-from-test.json) 및 진단 결과를 원로그에 보존했고 실패를 PASS로 집계하지 않는다.

최종 신규 실행 전23회 count2를 관측해30초씩 대기했고24번째 count1에서 bc08-03을 실행했다. 뒤의 bc08-04도 새 gate count1 확인 후 실행했다. 다른 Godot 프로세스 종료/제한 우회0.

마감 정적 검사: 기존25경로 hash·원본main byte/행·R HEAD/branch/INDEX/WORK 및 index byte·editor_settings byte·실행 사본/제출본 byte·CHANGELOG 기존 본문 보존·보고서 표 구조·정확 자기 소유6경로를 대조한다. import가 자기 worktree에 새로 생성한 미소유 UID136개와asset .import35개는 생성시각 확인 후 `_out/bc08/import-generated-uids/`·`import-generated-metadata/`에 원문/hash 목록으로 옮겨 보존하며 제출 UID는 자기 신규2개뿐이다. 정적 결과 verification.json, 정상 pre-commit docs-sync 결과 commit.log, push/원격 ref 결과 push.log/remote-ref.txt, 완료/정리는 DONE.txt에 남긴다.

선재 결함 전달 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번 재실행·수정 없음.

실제 보스 actor/dispatcher·live combat·피해/패링/무적·poise/KB·탄 발사/생존·UI/VFX/SFX·실창·시각·성능·PC 실행은 미인수다. 공용0줄의 독립 이동·idle 후속 요청 계약까지만 제출한다.
