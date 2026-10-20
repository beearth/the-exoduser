# BC09 — 1장 보스 탄 생산·탄생 수치 packet

## 기준·소유·인수 범위

| 항목 | 확인 |
|---|---|
| 작업 | `bc09` / `codex/bc09-20261020` / 신규 `~/exoduser-wt/bc09` |
| 원본 main | 시작 fetch `26c050a99a711e793a6c2413395acda09b0c1614`, 마감 fetch `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`. game.html 65,692행 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html 4,742행 SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. 시작·마감 main/분기본 byte 동일 |
| 선행 | BC08 `1b901f124bc4d1f2eaf55cb615a216abce69c634`가 main ancestor가 아니고 지정 모듈/테스트 경로도 없어 그 끝에서 분기. 마감 main에서도 동일. BC01~08은 읽기만 함 |
| WORK_BOARD | 시작·마감 `docs/engine/orders/WORK_BOARD.md` 보스/탄 진행행 확인. TRACE-BOSS-CH1 행60은 문서. BC09 신규 모듈·테스트 경로 중복 없음. 공용 작업판 수정0 |
| 순서안 | trace 행362의 BC09은 신규 탄 생산 모듈/fixture·공용0줄이며 끝난 순서안이 아님. 실제 제품 연결은 BC17. 이번에는 독립 producer와 birth math/readback packet만 구현, actual combat/Main 연결0 |
| 자기6경로 | 신규 `godot/scripts/native_ch1_boss_projectile_patterns.gd`·`godot/tests/test_boss_ch1_bc09_projectiles.gd`·실제 생성 UID2개·이 보고서·허용 CHANGELOG_SYNC 최상단 절 |
| 불변 | 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state·기존 projectile/QE owner·타 담당/선행 코드·기존 테스트·project.godot·WORK_BOARD·원본·설계/LOCK·2_3·세이브 수정0. R HEAD/branch/INDEX/WORK 및 index byte 불변 |

R에서 worktree add --no-checkout -b 후 non-cone sparse 경로 `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`만 받았다. 같은 HEAD의 read-tree -mu HEAD로 빈 index를 초기화했다. 웹 대용량 에셋/node_modules/output은 받지 않았다. 원로그·실행 사본·보고서 사본은 `~/exoduser-wt/_out/bc09/`; 정상 push·원격 SHA 일치·DONE 작성 뒤 자기 worktree만 remove --force하며 branch는 남긴다.

READY/done은 해당 독립 checkpoint의 계산/요청 종료다. **실제 탄 등록·생존·피해·Q/E·반사·전투·Main 연결 성공의 인수가 아니다.** class authority·pool snapshot·전역 drop/aggro/QA reader·실제 spawn/ORB readback이 없으면 NOT_READY다. 새로운 Q/E 분류 함수·판정·자원 writer를 만들지 않았다.

## 원본 행·수치·생산 순서

| game.html 근거 | 보존한 계약 |
|---|---|
| 16644–16648/17054–17055 | 현재 finale은 stage0 AND stage3를 동시에 요구해 비도달. 일반 CH1 si0..3/ib=true/etype0만 지원. finale 활성화/전용 volley/회복값 변경0 |
| 16938–16945 | 보스 wrapper는 _druidPoison=ib&&si0/3, _druidStraight는 NORMAL 드루이드에만, thorn은 실제 opt-in&&NORMAL gate. ib 보스는 비보스 _emitEnemyShot 경고 emitter로 우회하지 않고 spawnProj 요청. Q/E class 계산은 이 wrapper가 하지 않음 |
| 40562–40569 | Burst 만료 시 cnt=ToInt32(max(10,6+min(si,6))×(1+(phase−1).12)), phase0 CH1 요청8발. 각2πi/cnt, 매 발 kind draw<.5 black/그 외 red, rawatk1.5/2.5, 속도4.4/4, life400, size2/1.8. 매 spawn 실제 readback 뒤 다음 발, 마지막 charge→deathFX→shake8×OPT/100→flash4/white→recover50 |
| 40646–40662 | Fan 준비의 thorn phase0/1 NORMAL만 현재 P방향 추적. 폭π(.7+phase.06), 기본NORMAL cnt=ToInt32(max(12,4+min(si,5))×(1+(phase−1).12))=[10,12,13,14,16], thorn phase0/1만12. lane<.28 또는>.72 physical, thorn은 i%3!=2 physical, phase≥2/i%4==1 black. rawatk1.3 또는black1.5, speed4.4/life400/size1.2 또는2. 원 class/straight/thorn/lane 보존. 타 보스는 kind RNG/black1.5·red2.8. 끝에 magic→parts12→recover45 |
| 41185–41205 | BeanStormWind facing→u>.5 때만 vx/vy 추가 draw 입자→만료 bossBeanStorm8/wave0. Active 만료 때 cnt=5+min(ToInt32(si.3),4)+phase; aim−spread/2+spreadi/(cnt−1)+(u−.5).15, speed2.5+u1.5, kind draw, raw black1.5/red2, life400/350. parts8→magic0→shake4→wave++; max 도달 recover25, 아니면10+ToInt32(u6). 마지막 wave에 timer RNG 추가소비0 |
| 38357–38371 | BC08 idle_move 뒤의 별도 idle 발사 checkpoint. _idleRBT=(old\|\|0)+sp; interval=max(18,40−phase5), d<1200일 때만 timer0·count1+ToInt32(phase.5)·각 jitter.5·speed draw·kind draw. raw black/red 모두atk1.5, life400/280,size2/1.5. 각 spawn 뒤 다음 draw, 끝에 parts2. 캐시 d를 새 거리로 바꾸지 않음 |
| 20121–20156,40507–40517 | generic_tick은 chargeT>0일 때만 -=sp, ≤0이면 generic_fire. fire는 현재 P방향, life=ToInt32((ETYPE_RANGE[0]\|\|600)×.3), 실제 range400→120. **spawnProj 직접** 요청이므로 독 wrapper 주입0. 발사/parts owner ACK 뒤 source cancel 4필드(T0/Col·Bean·Class null) |
| 20129–20148 | black speed4.4/raw1.5/EL.P/life400/size2; red2.8/raw2.5/EL.F/life≥200/size1.5; dark3.3/raw1/EL.D/gb; fire·water3.2/raw1.2/각 EL1·2/flag; special3/raw1/size2.5; normal3/raw.8/size1.5. 전부 _commit=true, drop만 면제이며 나머지 source 후처리 유지 |
| 37769–37791,38212–38231 | elemBall/rapidMissile의 시작 생산은 이미 BC06 소유. 그 코드를 복제하지 않고 실제 BC06 _spawnBossProjectile 요청의 지정행37779/38221만 start_request로 relay. elem count10+ToInt32(phase1.5), speed6/r16/raw3/life400; rapid count3+min(phase,3), speed14+phase2/raw2/life300/size3·trail. 실제 BC06 요청16시나리오 대조 |
| 17043–17046,37080–37105 | Rhythm은 AI/idle 여부와 독립, si0/3·bossAlive·살아있는 bossRef. phase0 interval90/count5, phase4 interval66/count9. T+=sp, interval−20≤T<interval와frame%4==0에서 warning2draw. T≥interval이면 한 번만 interval 차감(while/주기초기화 아님), 폭π(.42+phase.03), 속도6/rawToInt32((atk\|\|100).35)/life240/size2/r10/fireMagic/_typed/_druidParryVolley. 끝에 Q text→magic1→volley+1 |
| 37106–37112 | ORB은 별도 T+=sp, bossRef가 없어도 outer si0/3·bossAlive이면 T/기존 queue 갱신. 살아있는 bossRef에서90≤T<110은 집광2개, ≥110이면T0/각 aim±.14의3발, 속도6.8/r26/rawToInt32((atk\|\|100).6), y−40. 생성된 발도 같은 source update에서 이동함 |
| 37113–37126 | ORB은 t+=sp→x+=vxsp→y+=vysp, 거리<r+Pr이면 보호 contact 요청. 실제 source body가 끝나면 삭제, 아니면 strict t>460/x·y<−40/x>mwT+40/y>mhT+40에서 삭제. 원본T40·안정 compaction 순서 보존. 기존 queue를 일반 spawnProj 탄으로 치환하지 않음 |
| 37116–37123 | contact body는 실제 isPWin 호출, AOE R90/max(40,ToInt32((raw\|\|60)1.2))·hurtE(noPoise,EL.P), 입자/VFX, 패링크레딧 또는 hurtP·poison+3/webSlow≥80의 보호 owner 의존. raw27→AOE40은 요청 metadata/원본 oracle 대조이며 실제 HP·패링 인수0. ACK만·불완전 orb/player/boss readback이면 NOT_READY |

## 탄생 수치 packet·보호 class 권위

| 원본 행 / 접점 | 구현·의존·한계 |
|---|---|
| 16858–16884 actual pool | begin_birth는 실제 fresh/reset pool snapshot을 필수 입력으로 받는다. _mkProj를 새 기본값으로 위장하거나 shared pool을 실제 pop/push하지 않음. 미지정 numeric/friendly shape는 거부. pool_action none/recycle_requested/append_requested는 요청값이며 실제 node 수거/등록 성공 아님 |
| 16947–16958 | lesson active이며 _lessonShot 아니면 pool acquisition 없이 null. 실제 pool 사본→_lessonShot/_druidPoison false·_druidParryClass null→props merge→source dark scalar preparation→독 class 조회→EL.P/green→rainbow=black→최종 class 조회→ml fallback. **class는 projectile_class_authority의 실제 응답이 필수**이며 local 분류 규칙 없음 |
| 16911–16921 / class 보호 | 기존 source class 함수가 physical/magic/forbidden을 결정. 두 source 소비 경계(pre-poison/최종)에 요청하고 그 결과를 읽는다. 이후 source helper들이 이미 명시된 parryClass를 재조회하는 값은 그대로 소비. E/Q 자격·black Q-only·반사·자원·bank·입력에는 연결/변경0 |
| 16962–16970 | moving은 vx²+vy²>0. band의 특수탄 제외 목록, magic homing/QA straight 예외, titanEye 별도 physical 이동 프로필, 일반EL.P physical redBean 변환/straight homing 조건을 source 순서로 계산. class를 EL.P로 재추정하지 않음 |
| 16971–16979 | moving&&!titanEye에서만 global counter=(old+1)%3, _commit/_druidParryVolley/_druidThornVolley만 drop 면제. drop!=0이면 recycle 요청하고 배율/RNG 정규화를 더 실행하지 않음. 통과 시 sz2/r1.3/v1.8/dmg ToInt32×2, red는 dmg ToInt32×.5/v.7. 정지탄은 이동 배율0 |
| 16901–16909/16933/16980 | physical 최종300/60=5px/native tick, magic/black500/60..600/60. physical도 random draw를 생략하지 않음. sqrt/hypot의 부동소수점 차이는 명시 허용오차로 대조. unit 누락/범위 오류는 적용 가능한 projectile 없이 NOT_READY |
| 16982–16990 | actual aggro disjunction의 resolved bool reader 필수(black보다 먼저 평가되는 source 순서). black/thorn이면 target 재지정 제외, 그 외 활성 reader는 실제 target x/y 필요. source 속도를 보존한 atan2 재지정만 계산하며 world/query owner 변경0 |
| global drop readback | producer의 모든 spawnProj_owner 요청은 projectile_result(null 또는 필수 numeric/class/friendly/color snapshot), drop_before/after를 요구. counter 연속성 오류·빈 성공 dictionary·ACK만이면 NOT_READY. 임의 전역0 재시작/밀도 PASS 위장0 |
| actual 기존 emitter 결손 | 분기본 `native_element_projectile_emitter.gd:90/98–116` supports_source_actor/emit은 etype3/7 및 제한된 type21용. boss etype0 raw 소비자로 가정하지 않음. `black_bean_projectile/producer.gd:1–12/326`은 탄생 이후 소비자며 header가 birth/emitter/spawnProj 권위를 BOSS·ENGINE에 둠. 실제 boss class-provider/풀/registry 채택은 후속 의존, 이번 제품 연결0 |
| 보호 hurtE 결손 | `native_normal_enemy_hurte.gd:151` ib 거부를 우회하지 않음. ORB AOE에 보스/일반몹 HP를 새로 직접 적용하지 않음. 요청 snapshot·원본 fixture readback과 실제 피해 집행을 구분 |

## API·미확인·docs 불일치

| API·항목 | 계약 |
|---|---|
| begin_pattern / next_pattern | mode=state/idle/generic_tick/generic_fire/rhythm/orbs/start_request. 읽기 전용 snapshot에서 continuation 생성, write/global_write/RNG와 단일 executed=false helper 요청을 source 순서로 반환. 이전 owner ACK/readback 없이 다음 발/난수 진행0 |
| prepare_boss_props | source wrapper의3개 flag만 복사·gate. actual thorn opt-in reader 필요. direct generic은 이 함수를 거치지 않음 |
| begin_birth / next_birth | actual pool/global/QA/aggro reader와 unchanged class 권위 입력을 받는 숫자 packet. 필드 사본과 counter/pool_action 반환이며 actual node/World/scene/HP/QE/저장 IO 없음. live_spawn_verified=false 유지 |
| float/undefined 표현 | raw JS의 undefined optional flag는 직렬화에서 생략, 후처리 observable flag projection은 source truthiness로 비교. numeric/class/color/life/size/radius·실제 payload 필드와 RNG/명령 순서는 별도 정확 대조. 전체 JS property enumeration/객체 identity 동일성으로 확대0 |
| 다음 단위 | BC10 control states가 순서안에 남아 있으나 미착수. actual combat/Main 연결을 요구하는 작업은 구현하지 않고 필요한 위치/원본 근거를 보고·중단. 본편 완성/BC17 연결로 확대0 |
| trace BC09 pool 행 | 순서안의17253–17260은 현재 pool 생성/reset 위치가 아님. 실제 _mkProj/_resetProj는16858–16884. 17253 이후는 homing/knockback helper 구간이므로 pool 구현 근거로 가져오지 않았고 기존 설계/추적 문서는 수정0 |
| AI/보스 문서 thorn first | `9적ai패턴디자인/9_적AI패턴디자인.md:455–470`의 gate/12발8physical4magic·명시 class·drop/aggro 예외·raw→post 배율과 일치. 기본fan [10,12,13,14,16]을 항상12로 덮지 않음 |
| ORB 주석·문서 | source37106 주석의 ‘isPWin 미체크’와 실제37116 호출을 구분. `DARK_DRUID_DEMO_FINALE_DESIGN.md:111–113`의 반사 없음/패링 크레딧 설명을 참고하되 actual 보호 owner 성공은 미인수. 새로운 패링 판정/반사 로직 추가0 |
| 실제 연결 필요 위치 | source16945/16995의 pool·projs 등록,20155 generic clock,37080–37127 독립 clock/ORB body,40450 idleMove 후속 dispatcher가 실제 owner 의존. native 삽입 줄 수/actual actor 채택 위치는 미확인. Main/world/기존 owner 쓰기0 |

관련 docs 키워드 검색 전체 원문은 `_out/bc09/docs-matches.txt`. 공용/다른 담당·설계/LOCK 수정 금지에 따라 이 보고서와 허용 CHANGELOG 절에만 수치/이식 상태·불일치를 기록했다.

## 독립 원본 oracle·테스트 하니스

Node VM은 최신 main과 byte 같은 game.html에서 producer case/function, _mkProj/_resetProj, _spawnBossProjectile/spawnProj와 **기존 원본 class 함수**를 직접 실행한다. expected는 Godot 구현에서 생성하지 않았다. source-*.js는 원본 행 padding을 유지한 실행 body이며 pool 사전 warmup loop만 함수 하니스에서 제외했다. thorn on/off는 원래 URL/storage 식이 각각 실제 true/false가 되는 두 fixture VM을 쓰며 원본 gate를 소스 치환하지 않았다.

canonical source 호출마다 actual fresh/reset pool 사본, wrapper/direct props, 원본 class 응답·소비 전 snapshot, accepted/null 결과·drop counter·정규화 RNG를 채집했다. GDScript 신규 producer의 실제 출력 props를 native birth packet에 전달해 그 숫자/flag/class projection과 RNG cursor를 원본에 대조한다. class 응답은 원본 JS fixture 권위이므로 실제 native QE/class-provider 채택이나 live 탄생 성공의 증거가 아니다. ORB body는 별도 보호 fixture 경계로 source raw helper trace와 완전한 player/orb/boss readback을 수집한다. native 코드가 body의 피해·패링을 실행한 것은 아니다.

| 검증 집합 | 실제 독립 대조 |
|---|---|
| producer762건 | 4si×5phase×Burst/Fan/Bean Wind·active×timer, d1200/idle주기 경계·generic7bean×7EL 및 직접 발사·range fallback, independent rhythm/ORB clock·bossAlive/bossRef gates |
| birth2,082건 | source global modulo3 순서, pool 재사용 snapshot, class 전/후 poison 변환, 이동/정지·friendly·titanEye·elemBall·commit/volley/thorn 면제·aggro/QA 분기·lesson acquisition 이전 skip |
| 연계16건 | 실제 readonly BC06 elemBall/rapidMissile 명령을 BC09 wrapper/birth packet으로 전달. 기존 start 코드의 UI/tele/명령 writer를 새로 복제하지 않음 |
| 핵심 값 | default NORMAL fan[10,12,13,14,16], thorn opt-in12; burstphase0요청8; fan raw59→physical59/magic118; stationary 무배율; generic direct 독 주입0; rhythmphase0 90/5발/life240/raw16; ORB110f/3발/raw27/AOE40 |
| 순서·경계 | producer owned events6,888개·직접 RNG2,099회·birth RNG982회. source helper 내부의 additional fixture draw2가 이어지는 cursor까지 대조. Wind u=.5 양옆, bean phase0/4 마지막wave, ORB strict460·−40·mwT+40 및 queue compaction |
| 보호8건 | 원본 ORB isPWin true/false·iframe·charge 입력의 요청/readback 대조8건. 적중/피해/패링 성공8회라는 뜻이 아님 |
| 숫자·불변 | 원본 직렬화 전 정수 path는 정확 비교, 비정수는1e-12×max(1,abs(expected)). birth x/y/vx/vy/r/sz 등 부동소수점은 해당 허용오차, dmg/el/life/ml/enum·flag·key/순서·counter는 정확 대조. 입력·continuation·씬·InputMap·FPS/locale 불변 |
| 누락·거부 | 실제 class/pool/lesson/counter/typed spawn receipt/연속성/보호 ORB readback·RNG 누락/invalid unit은 NOT_READY. source producer 요청을 실제 탄 등록으로 집계하지 않음 |

신규 USERDIR은 `EXODUSER-bc09-Isolated-20261020`이며 ProjectSettings와 실제 OS 경로를 모두 검사한다. 기존 회귀는 각 파일 상수 USERDIR, test_contracts만 상수가 없어 `EXODUSER-bc09-Contracts-Isolated-20261020` wrapper를 사용한다. repo project.godot은 불변이다. 새 GDScript 테스트는 oracle literal을 읽으며 **OS.execute·Node 실행·output[0]이 없다**. 선택적 원본 재생성 하니스 run_oracle.py는 `--node-bin`을 필수 인자로 받아 subprocess stdout/stderr **전체**를 UTF-8로 수집한다. 기존 테스트에도 OS.execute 호출이 없는 것을 확인했고 타 담당 파일 수정0. Windows 실제 실행은 미확인이다.

```sh
cd ~/exoduser-wt/bc09
python3 ~/exoduser-wt/_out/bc09/run_oracle.py --node-bin /실제/Node/실행경로 --source-game /실제/bc09/game.html
python3 ~/exoduser-wt/_out/bc09/run_one.py bc09-review-01 ~/exoduser-wt/_out/bc09/projectile-project test_boss_ch1_bc09_projectiles --source-game=/실제/bc09/game.html
```

worktree 제거 후 branch를 같은 sparse 경로에 복구한 뒤 재검수한다. 새 basename을 지정해 기존 원로그를 덮지 않는다. source_oracle.mjs/source-oracle.json, build_test.py, 초기·보강 source/test 사본과 실패 oracle은 원로그에 남긴다. 실행 사본 .gd는 최종 제출 파일과 byte 동일 대조한다.

## 실제 실행·마감

Godot 4.7.2.stable.official.ed1daf0bf, 모두 headless. 최종 신규56,664단정/0실패/skip0/ERROR0. producer762·birth2,082·BC06연계16·보호 ORB 요청8이며 live_spawn_or_QE_evidence=false다. 기존8개 회귀·import·contracts의 suite-summary 10개 모두 accepted=true.

| 실행 | 단정/실패 또는 contracts 통과/실패 | 시간·프로세스·오류 | 원로그 basename |
|---|---|---|---|
| 신규 최초728건 | 53,836 / 0 | 1.682s / exit0 / ERROR·FAIL0 | bc09-01 |
| 보강 하니스 실패 | 56,662 / 8 | 1.768s / exit1 / ERROR·FAIL8 | bc09-02 |
| 신규 최종762건 | 56,664 / 0 | 1.723s / exit0 / ERROR·FAIL0 | bc09-03 |
| BC01 회귀 | 681 / 0 | 0.293s / exit0 / ERROR·FAIL0 | bc01-regression-01 |
| BC02 회귀 | 5,257 / 0 | 0.279s / exit0 / ERROR·FAIL0 | bc02-regression-01 |
| BC03 회귀 | 31,976 / 0 | 0.434s / exit0 / ERROR·FAIL0 | bc03-regression-01 |
| BC04 회귀 | 21,899 / 0 | 1.109s / exit0 / ERROR·FAIL0 | bc04-regression-01 |
| BC05 회귀 | 18,424 / 0 | 0.58s / exit0 / ERROR·FAIL0 | bc05-regression-01 |
| BC06 회귀 | 14,099 / 0 | 0.649s / exit0 / ERROR·FAIL0 | bc06-regression-01 |
| BC07 회귀 | 14,531 / 0 | 0.536s / exit0 / ERROR·FAIL0 | bc07-regression-01 |
| BC08 회귀 | 24,788 / 0 | 0.762s / exit0 / ERROR·FAIL0 | bc08-regression-01 |
| test_contracts | 5 / 0 | 2.334s / exit0 / ERROR·FAIL0 | contracts-01 |
| cold import | 정상 완료 | 13.284s / exit0 / ERROR0 | import-01 |

pre-Godot oracle 생성 오류2건(rapid case 종료행38231 누락, fixture T40 binding 누락)은 oracle-preflight-errors.txt에 기록하고 수정했다. engine 최초 bc09-01은53,836/0. 추가 bean wave chain 표본 bc09-02에서56,662/8실패를 실제 관측했다. 다음 입력 st2=0 설정이 이전 row.expected.enemy와 같은 객체를 수정한 하니스 alias 오류였다. structuredClone으로 기대값을 보존해 수정했고 최초/보강 전 oracle·실행 사본·실패 로그를 남겼다. 실패를 감지한 회귀 suite도 즉시 중단했으며 PASS로 세지 않았다. 마지막 보강에서는 actual producer props를 birth에 넘기고 빈 accepted birth snapshot도 거부했으며 최종 bc09-03이56,664/0으로 통과했다.

모든 Godot 호출 직전 exact `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`;2개 이상이면30초씩 대기한 count/시각을 *.gate.jsonl과 receipt에 보존한다. 타 프로세스/실행창 종료0. stdout/stderr 원문=.out/.err, engine=.engine.log, argv/cwd/gate/exit/ERROR/RESULT/시간=.json. 최종 신규/회귀 exit0·skip0·ERROR0, 최초 실패8은 원문 그대로 남긴다.

마감 확인은 기존27경로 hash, 원본 main byte/행, R HEAD/branch/INDEX/WORK 및 index byte, editor_settings byte, 실행 사본/제출본 byte, CHANGELOG 기존 본문, 정확 자기6경로와 보고서 표 구조다. cold import가 이 worktree에 새로 만든 미소유 UID136개·asset .import35개는 생성시각 확인 뒤 `_out/bc09/import-generated-uids/`·`import-generated-metadata/`에 원문/hash 목록으로 옮겼다. 제출 UID는 자기 신규2개뿐이다. normal pre-commit/docs-sync 우회0, 원격 자기 branch SHA 일치·DONE 작성 뒤 자기 worktree만 제거한다.

선재 결함 전달 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번에는 재실행·수정하지 않았다. 실제 탄 등록/피해/QE/반사·ORB AOE 집행·actor/World/Main 연결·실창·시각·성능·PC 실행은 미인수다. 독립 생산·탄생 숫자와 요청/readback 계약까지만 제출한다.
