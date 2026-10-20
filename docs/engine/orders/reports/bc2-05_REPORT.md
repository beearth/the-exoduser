# BC2-05 — beanRain wind/active 순수 상태 계산

## 판정·기준·의존

**beanRain 독립 계산 모듈과 원본 대조 자료 준비.** trace-boss-ch2 §5.2의 BC2-05 범위인 wind/active, 발사 수·black/red 난수 순서·duration·옆이동만 구현했다. 실제 투사체·hurtP·패링·Main 연결은 하지 않았다.

| 항목 | 근거 |
|---|---|
| 작업·브랜치 | `bc2-05` / `codex/bc2-05-20261020` |
| 정확한 분기·의존 SHA | 사용자 지정 BC2-04 `02763cb81eab888c20f5774ed7eac03fd90250e0` 끝에서 분기. 기존 BC2-01~04와 일반화된 BC02~07 체인을 그대로 재사용 |
| fetch main과 구별 | 확인한 main은 `2c3c211ff3c9e2be4e2754d608f9f0ea963588b2`. main의 추가분은 CH3 추적 문서/CHANGELOG이며 지정 BC2-04 체인에는 미포함. 이 작업에 별도 merge하지 않았고 main 포함이라고 주장하지 않음. game/index는 최신 main과 byte 동일 |
| 추적·원본 | 인수 trace-boss-ch2 `ddf0549597e645b507cac672cba29df2639712c3` §2.3/§5.2 BC2-05. game.html41207–41231, EL.P 정의14333 및 후처리 경계16938–16957을 읽기 참조 |
| source hash | game.html65,692행/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 방식·보호 | `worktree add --no-checkout` + 필요한 경로만 non-cone sparse-checkout. 공용6·다른 담당·기존 제품/테스트·원본·씬/설정·저장/형식·바이너리 작업 diff0 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD·branch·tracked INDEX/WORK·기존 untracked 목록 보존. baseline/scope/cleanup JSON에 실제 값 기록 |

## 제품 계약과 원본 행

신규 제품은 `godot/scripts/native_ch2_boss_bean_rain.gd`(+자기UID)다. `source_receipt()`, `begin_tick(si,enemy,sp,player,options={})`, `next_tick(token,response=null,rng=Callable())`를 제공한다. BC2-02 chapter catalog/context와 BC07의 packet·ack·RNG·write/global·aim·숫자/ToInt32 helper를 직접 호출한다. 기존 파일 수정이나 공통 helper 복제는 없다.

| 원본 / 항목 | 구현된 계산 |
|---|---|
| 장·snapshot | si4~9와 `bossBeanRainWind`/`bossBeanRain`만 소유. BC07 actor/player 필드+speed/col/_brT/_brDur/actorPhase를 검증. actorPhase0~4(분수 포함), 유한 숫자만 소유. 입력·continuation을 깊게 복사 |
| BC05 시계 | **st2는 공통 BC05에서 이미 감산한 입력**. 여기서 st2를 다시 감산하지 않음. active에 필요한OPT.shake는명시options.shake로 받음. 실제 RNG singleton·시계·State를 읽거나 쓰지 않음 |
| wind41208–41210 | 현재P각으로 facing 추적. u>.4이면 별도x/y난수2개로poolPart 요청(총3draw), st2<=0이면bossBeanRain/st2=기존_brDur, SFX.charge 요청. duration을 actorPhase로 재계산하지 않음 |
| active41212–41216 | _brT+=sp 후 facing 갱신, **ToInt32(_brT)%5<sp**일 때만 발사. 음수 나머지·32bit wrap 유지. cnt=1+ToInt32(actorPhase×.3), 정상phase0~3은1발/4는2발. 주석의‘2~4발’을 채택하지 않음. 큰sp여도원문처럼if1회이며catch-up while 없음 |
| raw탄41218–41221 | 각 탄 **angle→speed→coin→x→y** draw5개. black도speed draw를소비. angle=facing+(u−.5)×1.2, 위치±7.5. **coin<.5 black / >=.5 red** |
| black 원시 필드 | 속도4.0, 피해ToInt32(atk×1.5), el=EL.P(0), life/ml400, col#00aa00, sz2, blackBean=true. redBean/homing은source undefined |
| red 원시 필드 | 속도2.2+u×2, 피해ToInt32(atk×1.8), el=actor.el, life/ml300, col#cc1100, sz1.5, redBean/homing=true. blackBean은source undefined |
| 41223 효과 | 발사루프가끝난뒤puff coin1회, u<.3이면addParts3 요청. 비발사tick에서는이draw도없음 |
| 41226–41230 이동 | speed×.5×sp, sin(_brT×.03)×.8을facing+π/2방향에곱함. **canMv XY1회만**, false이면좌표변경/축별fallback 없음. 발사·효과ack 뒤 이동계산 |
| 41231 종료 | 이동질의가끝난뒤st2<=0이면recover30, shake=3×OPT.shake/100 event. 같은switch에서recover20으로clamp하지않음 |

모든 명령은 `executed=false`, 전체packet은 `full_tick_complete=false`다. 일반효과/원시투사체는명시ack, 충돌은ack+bool이필요하다. helper가소비한공유난수는caller가다음RNG공급에반영한다. 자동ack·실제spawn·후처리·피해/패링 구현은없다. 의존·필드·phase·RNG·token owner/hash/path·pending·충돌bool오류는NOT_READY이며실패packet에부분actor/command를담지않는다.

### undefined와 투사체 owner 경계

원본은 `redBean/blackBean/homing`을 false가아닌 **own property의undefined**로넘긴다. JSON/Godot Dictionary에그대로옮길수없으므로미실행 `_spawnBossProjectile` command의`args[0]`에는정의된raw필드만담고, 별도 `source_undefined_fields`에원본undefined키를원문순서로기록한다. command에는`actor_ref="boss"`도명시한다. black은`[redBean,homing]`, red는`[blackBean]`이다.

이메타데이터는실제projectile props에섞지않는다. 향후owner는원본의undefined대입/reset의미를복원한뒤wrapper를소비해야한다. 현재는recipe만반환하며연결은HOLD다. source16938이후의druid flags·spawnProj·pool reset·1/3밀도·최종속도·피해×2·크기/반경·Q/E/parry classification을재구현하거나이raw값에미리곱하지않았다. 기존보호owner에의존한다.

## 원본 대조·실제 결과

새 `godot/tests/test_boss_ch2_bc2_05_bean_rain.gd`는인자`--node-bin`과`--source-game`을필수로받는다. `bc2_05_source_oracle.cjs`는전체game hash를검증하고 **원본EL정의와beanRain switch를그대로Node VM에서실행**한다. write/global/query/RNG/rawwrapper요청을계측하며기대값은GDScript제품에서생성하지않는다.

Node가자기userdir의UTF-8임시fixture파일에쓰고Godot가그파일을읽는다. stdout은기대값전송에쓰지않고진단출력만`"".join(output)`한다. 매실행fresh파일을확인한다. 난수및숫자입력은LE IEEE754 bit를hex로함께운반해.4/.5/.3경계·phase분수·32bit wrap를JSON전송에서보존한다. 숫자비교는기존1e-12상대오차, 필드/명령/행/순서/undefined메타데이터는전체대조한다.

| 정상 신규 실행 | 검사 / 실패 | 원본 fixture / event / RNG / raw탄요청 / 충돌질의 | 상태 |
|---|---:|---|---|
| new-01 | **35,164 / 0** | **1,988 / 19,275 / 8,771 / 1,138 / 1,246** | exit0·skip0·ERROR0·stderr0byte |

| fixture 군 | 수 |
|---|---:|
| stage-state-matrix | 1,800 |
| signed-int32-modulo | 96 |
| count-phase-boundary | 21 |
| black-red-boundary | 5 |
| wind-strict-gate | 10 |
| puff-strict-gate | 5 |
| duration-readback | 12 |
| raw-projectile-fields | 12 |
| aim-sideways-shake | 27 |

기본1,800상황은6stage×5actorPhase×wind/active의10시점×3sp×2충돌결과다. 추가로signed ToInt32/큰sp·phase3→4와분수cnt경계·black/red strictcoin·wind/puff strictcoin·duration0/분수/음수·el/피해wrap·aim/옆이동/shake를검사했다. helper중첩난수0/1/2/3소비와rawundefined보존도포함한다. 입력/continuation불변·필드누락·단계별잘못된난수·미지원장/state·ack누락·충돌bool·변조token은별도검사한다.

실제투사체·탄후처리·hurtP·패링·시각·성능·PC검증이아니다. fixture ack는실제owner집행성공으로세지않는다.

필수 `--node-bin`/`--source-game`을각각누락한실행도각3검사/1실패·exit1로거절했다(`missing-node`, `missing-source`). skip/기존fixture재사용으로PASS 처리하지않았으며정상PASS합계에서제외한다.

## 기존 회귀 무수정

각테스트USERDIR상수와source-game절대경로/node-bin을유지했다. BC01~08 GD/UID16개의원격SHA/SHA256은`existing-tests.json`, BC2-01~04제품/테스트의기준byte대조는`scope-verification.json`에기록한다.

| 회귀 | 검사 | 실패 | 파일 |
|---|---:|---:|---|
| ch1_bc01_catalog | 681 | 0 | 동일 byte |
| ch1_bc02_spawn | 5,257 | 0 | 동일 byte |
| ch1_bc03_utility | 31,976 | 0 | 동일 byte |
| ch1_bc04_selector | 21,899 | 0 | 동일 byte |
| ch1_bc05_phase | 18,424 | 0 | 동일 byte |
| ch1_bc06_start | 14,099 | 0 | 동일 byte |
| ch1_bc07_melee | 14,531 | 0 | 동일 byte |
| ch1_bc08_movement | 24,788 | 0 | 동일 byte |
| ch2_bc2_01_catalog | 7,169 | 0 | 동일 byte |
| ch2_bc2_02_reuse | 44,891 | 0 | 동일 byte |
| ch2_bc2_03_new_start | 25,749 | 0 | 동일 byte |
| ch2_bc2_04_vortex | 41,373 | 0 | 동일 byte |
| **BC01~BC08** | **131,655** | **0** | 동일 검사 수 |
| **기존 회귀 전체** | **250,837** | **0** | BC2-01~04 포함 |

모든정상회귀는exit0·skip0·ERROR0·stderr0byte다. 이번에로비전체/contracts/실제게임을실행한것으로확대하지않는다.

## 결함 주입 검출

외부mutation사본의새제품파일만변경하고원본oracle/테스트를그대로두었다. 아래는의도적실패이며정상PASS합계에서제외한다.

| 결함 | 실제 검사 | 검출 실패 | exit |
|---|---:|---:|---:|
| count-phase | 38,620 | 1,130 | 1 |
| black-speed | 35,164 | 95 | 1 |
| coin-strict | 36,083 | 846 | 1 |
| gate-int32 | 35,109 | 10 | 1 |
| undefined-fields | 33,929 | 867 | 1 |
| collision-bool | 35,164 | 1,095 | 1 |

cnt계수.3→.5, black속도4상수제거, coin<→<=, ToInt32→int64, undefined키메타데이터제거, collision=false무시를각각검출했다. 실패제품이내는명령수와undefined필드수가달라지므로driver의단정수도달라진다. 테스트파일변경/검사약화는없으며실제수를그대로기록했다. mutation파일은finally에서원본으로복원하고worktree/정상validation제품은바꾸지않았다. 원문stdout/stderr/metadata보존,가짜PASS없음.

## 통합 HOLD·제출

BC2-03의beanRain시작→본tick, BC05clock→본switch→후속recover, 실제enemy snapshot 적용·canMv reader·projectile owner와undefined복원/후처리·효과executor ack는실제 **Main/State/전투통합HOLD**다. 실제hurtP/패링호출0이며해당보호owner에의존한다. 다음BC2-06(fanWave)은미착수다.

보스바이블·추적문서와관련키워드docs11행을읽기대조했다(`docs-keyword-audit.txt`). 원본수치/기획변경0, 구현상태/계약은이보고서와CHANGELOG맨위절에기록했다. 기존다른담당문서수정0이다.

모든Godot호출전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을실행하고2이상이면30초대기한다. 자기Godot직렬1개, 신규격리명`EXODUSER-bc2-05-Isolated-20261020`, 기존은파일상수명이다. override는매실행설정/finally0byte, 실제저장폴더사용0.

최종7파일: 신규제품GD/UID·신규테스트GD/UID·source oracle CJS·이보고서·허용CHANGELOG절. 공용6·다른담당·기존파일·원본·저장·바이너리0. 원로그 `~/exoduser-wt/_out/bc2-05/`에fixture/argv/gate/원문실행/회귀/mutation/scope·R대조/정상hook/push/remote검증을보존한다. 자기branch push→원격SHA일치→DONE작성뒤자기worktree만제거한다. 최종SHA는외부DONE/제출검증에기록한다.
