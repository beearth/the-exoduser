# BC2-03 — 2장 신규 10기술 시작 계산

## 판정·기준·소유

**신규 10기술의 순수 시작 계산과 원본 대조 자료 준비.** 4개 state 시작과 6개 지연 queue 요청을 자기 소유 파일에 구현했다. 인수된 BC2-02의 장 catalog와 BC06의 command·ack·RNG/수치 helper를 재사용했으며 기존 모듈 수정0이다. 실제 State/Main/World·전투·투사체·음향·저장 연결은 하지 않았다.

| 항목 | 확인 내용 |
|---|---|
| 작업·브랜치 | `bc2-03` / `codex/bc2-03-20261020` |
| 최신 main | fetch 결과 `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d` (요청 하한6d987cb8a 충족) |
| 선행·분기 | BC2-02는 main 미포함. 사용자 예외에 따라 인수 끝 `a3b5391c54bb62b9f784bf2acac12bfbd2747192`에서 분기, 그 뒤 최신 main을 정상 merge `1ba53dc46d3f3b4abeef492f1e6d7e1a7e0b5958`로 포함. history rewrite·main push·force 없음 |
| 추적 근거 | 인수 trace-boss-ch2 `ddf0549597e645b507cac672cba29df2639712c3`의 §5.2 3번 B2C03 및 §2.2/2.3/2.4. 추적 문서는 현재 main에 없어 승인 원본의 외부 사본을 읽기 참조 |
| worktree | `worktree add --no-checkout` + non-cone sparse-checkout. root 지침·필요한 scripts/tests·engine docs·보스 docs·game/index만 수령. 대용량 웹 에셋 없음 |
| 보호 | 공용 6파일·기존 BC01~08·BC2-01/02·기존 테스트·다른 담당·원본·씬·저장/형식·바이너리 작업 diff0. 최신 main 변경은 기준 merge와 구별 |
| 원본 | 최신 main game.html 65,692행/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index.html 4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`; 모두 byte 동일 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 시작 HEAD·branch·tracked index/work·기존 untracked 목록을 보존. baseline/scope/cleanup JSON에 실제 값 기록 |

## 제품 계약·재사용

제품 파일은 `godot/scripts/native_ch2_boss_new_start.gd` 하나(+자기 UID)다. 공개 진입점은 `source_receipt()`, `begin_start(si,id,enemy,distance,phase,extra_delay=0,context={})`, `next_start(token,response=null,rng=Callable())`다.

| 계약 | 실제 동작 |
|---|---|
| 장·입력 | BC2-02 `native_ch2_boss_catalog_bridge.gd`와 `native_boss_catalog_context.gd`의 receipt/stage/hash 검증 재사용. si4~9, 신규10 ID, 시작 phase0~4, 유한 숫자 snapshot을 받는다. actor phase는 누락/null을 원본처럼0으로 읽고0~4 범위만 소유(분수형 값은 원문 계산). 범위 밖은 NOT_READY |
| 공통 수치·효과 형식 | BC06의 `_i32/_map/_aim/_color`, `_write/_apply`, `_text/_call/_ensure/_append`, `_draw/_packet/_fail`를 호출. phase/move/색 표와 JS ToInt32·번역 recipe·command/RNG/ack 형식 복제0. 정적 helper 이름/형식에 대한 직접 의존이며 향후 BC06 변경 시 회귀 필요 |
| 시작·재개 | 자기 소유10 case만 program을 만들고 자기 runner로 해석. BC06.next_start에 미지원 ID의 합성 token을 넣어 guard를 우회하지 않음. 기존 공통22기술은 기존 BC2-02 경로 그대로 |
| 인수 경계 | enemy/context/token을 깊게 복사하고 외부 입력을 바꾸지 않음. queue의 `src:e`는 기존 계약의 `{actor_ref:"boss"}` recipe로 표현하며 실제 actor 복제/연결 없음 |
| 명령·ack | 한 번에 미실행 command1개 반환, `executed=false`, `full_tick_complete=false`. ensure/append/번역·음향·shake도 실제 집행0. 명시 `{ack:true}` 없이 재개 불가. 외부 helper가 소비한 난수는 caller가 다음 RNG 입력에 반영 |
| 실패 | 의존/입력/owner/stage/token hash·path·pc/pending 오류, RNG 누락·[0,1) 밖, 알 수 없는 operation은 NOT_READY. 내부 고정 RNG·가짜 ack·부분 성공 packet 없음 |
| phase 구분 | 인수 `phase`는 tele와 beanRain `_brDur`; enemy `_bossPhase`는 spiral arms·fire 개수·shock 방향/폭·cross 폭/파동 수. metadata.rec를 실제 recover로 대체하지 않음 |
| selector와 raw start | 원본 BC06처럼 raw start는 selector의 Set/기술 phase gate를 반복하지 않음. 아직 그 stage에서 해금 안 된 ID/phase를 강제 입력하는 fixture도 원본과 비교하되 자연 AI 선택 지원으로 확대하지 않음 |

## 원본 10기술 전사·연결 경계

행은 최신 main game.html 기준이며 `source-new10-numbered.txt`에 전사했다. 아래는 **시작 계산만**의 계약이다.

| ID / 원본 행 | 새 시작 계산 | 후속 실행 HOLD |
|---|---|---|
| vortex / 37732 | bossVortexWind, st2=tele 또는30, 기존 번역문/SFX.magic(3) 요청 | vortex wind/active·흡인/피해 |
| beanRain / 37756 | bossBeanRainWind, st2=tele 또는35, _brT0, _brDur=80+입력phase×20 | wind/active·흑/빨강탄 |
| fanWave / 37757 | bossFanWaveAim, **고정 st2=90**, 현재P각 facing/_fwAng lock, _fwR500 | sector/contact·후속bossRec40. 시작에서 recover를 새로 만들지 않음 |
| spiralBullet / 37832–37845 | facing=P각, actor phase로arms3+min(ph,2), **u>.5** 방향, ensure→append. CH2물리 windup60/maxT240/nextShot60, interval6, 원본색/raw~~atk1.2/src recipe, recover45 | queue 소비/spawnProj·밀도/_commit |
| wallPush / 38003–38012 | ensure→append 현재P각/x/y,t0/maxT60,dist0/maxDist2000,w1300/spd35,raw~~atk1.2/el/src/hitfalse, recover30 | 이동→contact→trim |
| shieldBash2 / 38048–38053 | _sbAng=P각 lock, bossSBashWind st2=tele 또는20, SFX.block 요청 | 추적wind/고정dash·접촉/패링 |
| fireRain / 38118–38133 | ensure 후 actor phase N=12+ph×4; 각 **x→y→r 난수 뒤 append**, delay30+i×6,r400+u×200,raw~~atk1.5/el/hitfalse; src필드 없음; recover40 | 폭발·명중·fade/trim |
| shockGrid / 38134–38148 | ensure→6+ph 방향 append, 각2πi/arms,len=~~(max(map)×40×.6),w250+ph×25,warn60/max210/tick0/raw~~atk1.8; recover35 | tick/범위/피해 |
| donutSlam / 38149–38160 | ensure→append inner80+r/outer~~(max(map)×40×.5),warn90/max120/raw~~atk2.5/hitfalse; recover50 | 원문 OR 범위·폭발 |
| crossWipe / 38178–38191 | ensure→append len~~(max(map)×40×.55),w350+ph×50,**rotSpd0/phase0**,warn60/max300/tick0/raw~~atk2,waves2+~~(ph/2); recover45 | wave/tick reset/범위 |

공통 map 단위T40과 fallback mw50/mh42, null/0 fallback, 시작 tele의 ToInt32와 0 fallback, player 각 고정·갱신하지 않는 facing 차이, 원본 parry 집합(신규10 중 shieldBash2만true)을 보존했다. UI/VFX/음향 문자열은 기존 원문의 recipe이며 새 실제 게임 표시·리소스가 아니다.

## 검증·실제 수치

신규 `godot/tests/test_boss_ch2_bc2_03_new_start.gd`와 `bc2_03_source_oracle.cjs`를 사용한다. Node는 인자 `--node-bin`으로 받은 실행 파일로 호출하며, `--source-game`의 전체 hash를 확인하고 원본 함수를 VM에서 실행한다. **Node가 자기 userdir의 UTF-8 임시 fixture 파일에 쓰고 Godot가 그 파일을 읽는다.** stdout은 기대 결과/summary 전달에 사용하지 않으며 실패 진단 출력만 전체join한다. fixture는 매번 기존 파일을 지우고 새로 생성했는지 확인한다. 기대값은 GDScript 제품에서 만들지 않는다.

BC06의 독립 원문 VM driver(원본 write Proxy·queue ensure/append·SFX/번역/난수 계측)를 재사용하여 신규10에 맞게 계측을 확장했다. 원본 자체는 편집하지 않았다. RNG 경계는 LE IEEE754 bit hex로 함께 보내 0.5 바로 위/아래·1 직전 값을 Godot JSON에서 손실하지 않도록 복원한다. 비교 허용오차는 기존1e-12 상대 오차 규약이며 수치 기대값을 제품값으로 치환하지 않았다.

| 신규 실행 | 검사 / 실패 | fixture / 원문 event / 원문 RNG | 실제 상태 |
|---|---:|---|---|
| new-01 | **25,749 / 0** | **845 / 14,225 / 5,640** | exit0 / skip0 / ERROR0 / stderr0byte |

| ID | fixture 수 |
|---|---:|
| beanRain | 80 |
| crossWipe | 85 |
| donutSlam | 85 |
| fanWave | 84 |
| fireRain | 85 |
| shieldBash2 | 84 |
| shockGrid | 85 |
| spiralBullet | 93 |
| vortex | 80 |
| wallPush | 84 |

기본행렬은6stage×5입력phase×10ID×2모드=600개(큐 선존재/없음·중첩 helper 난수 소비 포함)다. 나머지는 tele=0±.25, 다른 actor phase/분수/null, 고정90/60, 물리/비물리 읽기 probe, 각도 lock, map 누락/0/null/분수/음수, int32 overflow, 난수 strict 경계를 다룬다. 별도 입력·owner/RNG/ack 실패·caller snapshot 불변 검사도 포함한다. 실제 비물리 타장 보스/실전/시각/성능·PC 지원 증거로 확대하지 않는다.

### 기존 회귀 — 파일·검사 수 불변

| 기존 테스트 | 검사 | 실패 | 변경 |
|---|---:|---:|---|
| ch1_bc01_catalog | 681 | 0 | 원본 byte 유지 |
| ch1_bc02_spawn | 5,257 | 0 | 원본 byte 유지 |
| ch1_bc03_utility | 31,976 | 0 | 원본 byte 유지 |
| ch1_bc04_selector | 21,899 | 0 | 원본 byte 유지 |
| ch1_bc05_phase | 18,424 | 0 | 원본 byte 유지 |
| ch1_bc06_start | 14,099 | 0 | 원본 byte 유지 |
| ch1_bc07_melee | 14,531 | 0 | 원본 byte 유지 |
| ch1_bc08_movement | 24,788 | 0 | 원본 byte 유지 |
| ch2_bc2_01_catalog | 7,169 | 0 | 원본 byte 유지 |
| ch2_bc2_02_reuse | 44,891 | 0 | 원본 byte 유지 |
| **BC01~BC08 합계** | **131,655** | **0** | GD/UID16개 동일 byte |
| **기존 회귀 전체 합계** | **183,715** | **0** | BC2-01/02 포함 |

BC01~08 파일은 BC2-02 때 인수한 원본(파일별 원격 SHA/SHA256은 `existing-tests.json`)과 byte 일치한다. BC2-01/02 제품과 테스트도 기준 merge 대비 무수정이다. BC02/03을 포함해 source-game 절대경로를 전달하고 각 테스트의 USERDIR 상수를 썼다. 최종 기존 회귀 전부 exit0·ERROR0·stderr0byte·skip0이다. 다른 contracts/로비 전체/실제 전투를 이번 PASS로 주장하지 않는다.

### 검출력 확인 — 격리 제품 사본의 의도적 결함

아래는 실제 실패를 기대한 별도 run이며 PASS 수에 합산하지 않는다. 제품 worktree와 기준 validation 프로젝트는 바꾸지 않았다. 원본 oracle와 테스트를 유지하고 외부 mutation 사본의 새 제품 파일만 변경했다.

| 주입 결함 | 검사 | 검출 실패 | exit |
|---|---:|---:|---:|
| fan-tele | 25,749 | 168 | 1 |
| bean-actor-phase | 25,749 | 122 | 1 |
| spiral-threshold | 25,749 | 10 | 1 |
| fire-delay | 25,749 | 170 | 1 |
| queue-src | 25,749 | 354 | 1 |

fanWave90을tele로 대체, bean duration의 입력phase를actor phase로 교체, spiral의strict `>`를`>=`로 교체, fire delay6을5로 교체, src recipe를 잘못된 actor 참조로 교체한 경우를 각각 검출했다. mutation 파일은 finally에서 원본으로 돌렸다. 검사 약화/가짜PASS 없음. 초기 정상 제품 실행은 new-01에서 위0실패이며 컴파일 import도0오류다.

필수 `--node-bin`/`--source-game`을 각각 누락한 별도 실행도 각3검사/1실패·exit1로 거절했다(`missing-node`, `missing-source`). skip/기존 fixture 재사용으로 PASS 처리하지 않았으며 정상 PASS 합계에서 제외한다. 이2호출 전 global Godot count2가 관측되어30초씩3회 대기한 원문도 보존했다.

## docs 대조·제한·다음 단위

`docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`의 si4~9 점진 해금과 fanWave 후속bossRec40을 읽고, docs 전체 관련10ID 검색83행을 외부 `docs-keyword-audit.txt`에 보존했다. runtime의 상세값은 최신 main 원문과 추적 문서의 차이 표를 따랐고 원본 수치·배정 변경0이다. 보스 디자인 바이블/CH2 추적 문서의 기존 소유 내용을 바꾸지 않고 구현 상태·최소 계약을 이 보고서와 CHANGELOG 맨위절에 기록했다.

BC2-02 entry의 신규10 `pattern_start_owner_required` 응답은 수정하지 않았다. caller는 공통22는 기존 `native_ch2_boss_reuse`, 신규10은 새 `native_ch2_boss_new_start`를 명시적으로 선택해야 한다. 그 실제 selector→dispatch 연결은 **HOLD**다. 이 작업은 2장32기술 전체 전투/모든state·queue 이식 완료가 아니다.

다음 순서안 BC2-04(vortex state), 후속 beanRain/fanWave/shieldBash state·6queue 소비는 미착수다. 실제 Main/State/World actor에 snapshot 적용, 전투 RNG 시계, queue push/owner ack, SFX/피해/패링 실행이 필요하면 별도 통합 위치로 기록하고 진행하지 않는다. 현재 필요한 실제 접점은 Main의 `_bossStartPattern` dispatch 대응, State의6지연queue owner, 효과 executor의ack이며 공용6파일 수정0이다. visual/성능/실전·PC는 **미확인**이다.

## 격리·제출

모든 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인하고2이상이면30초 대기하는 runner를 재사용했다. 자기 Godot는 직렬1개, 신규 격리명 `EXODUSER-bc2-03-Isolated-20261020`, 기존은 각 파일 USERDIR다. override는 매 호출 생성/finally0byte. 실제 저장 폴더는 사용하지 않았다.

최종 변경7파일: 신규제품GD/UID, 신규테스트GD/UID, 원본oracle CJS, 이 보고서, 허용CHANGELOG_SYNC 절. 바이너리·기존 코드·기존 테스트·공용·다른 담당 변경0. `scope-verification.json`에 원본/기준/실행 사본/보호파일 hash를 대조한다. R과 다른 worktree는 보존한다.

원로그 `~/exoduser-wt/_out/bc2-03/`에 setup/merge/argv/pgrep/stdout/stderr/fixture/회귀·mutation JSON/정상hook/push/원격SHA/DONE을 보존한다. 자기 branch 정상 push→원격 일치→DONE 작성 뒤 자기 worktree만 제거한다. 최종 SHA는 외부DONE/제출검증에 기록한다.
