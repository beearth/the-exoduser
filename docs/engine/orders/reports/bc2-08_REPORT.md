# BC2-08 spiralBullet 큐·draw 독립 계산 보고

- 작업 `bc2-08`, 브랜치 `codex/bc2-08-20261020`, 2026-10-20.
- 판정: 원본 queue consumer와 읽기 전용 draw 요청의 독립 계산 검증. **실제 G queue push·탄 생성·피해·Main/State/저장 연결0/HOLD**. 실제 화면·플레이·성능·PC 실행은 미확인이다.
- 최신 main `823c24baee3f6c5f058ebfd7776721e86f80bd18` + 인수 BC2-07 `9a8bcb4f91f3195db57db51313366b3de44c138a`를 정상 merge한 `31da860a0ddeca5294b246d61324e7308cf280fa`에서 작성. 부모 순서 main→BC2-07, rebase/reset/force/main push0.
- 원로그 `~/exoduser-wt/_out/bc2-08/`. 최종 SHA·원격 일치·제거 결과는 외부 DONE.txt에 기록한다.

## 1. 원본 행·재사용·소유

game.html은 기준 main과 byte 동일, SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. source-verification.json/source-spiral-numbered.txt에 근거 보존. trace-boss-ch2 인수본 `ddf0549597e645b507cac672cba29df2639712c3`의 §2.4/§5.2 B2C08을 읽고 참조했다. 추적 문서 복사/수정0.

| 원본 game.html 행 | 보존한 계약 |
|---|---|
| G14333,14338,37832–37845 | **기존 BC2-03 초기화 모듈 재사용**. CH2 물리 EL.P=0, windup60/maxT240/nextShot60, arms=3+min(actorPhase,2), dir random>.5 ?1:-1, baseAng=P각, raw~~atk1.2/ELC색/src 참조·interval6·recover45. 새 factory/시작식 중복 구현0 |
| G37057 앞부분 | queue null/없음/빈 배열이면 시간/length/소비/생성0. 비어있지 않으면 원본 순서대로 windup=sb.windup\|\|0를 읽고 t+=sp. **t>=windup일 때부터** nextShot-=sp |
| G37057 발사 gate | nextShot<=0 && t>=windup && t<maxT. 해당 tick 한 번만 검사, interval로 **대입 reset**. 큰 sp를 catch-up 반복/누적 reset으로 바꾸지 않음. arms<=0도 gate를 통과하면 reset은 수행 |
| G37057 arm loop | rot=t*.04*dir, a=0..a<arms, angle=baseAng+2π*a/arms+rot. 반경15·raw velocity3.5·dmg/el/col 복사·friendlyfalse·life/ml200·sz1.5·r4·_committrue로 **spawnProj 직접** 요청 |
| G37057 뒷부분 | 발사 요청 후 t<maxT만 같은 배열의 write-index로 안정 압축. 끝에 length=W. 만료 entry의 t/nextShot 쓰기도 source 순서로 보존. 중복 ID는 동일 entry로 순차 누적 |
| G20107 | 물리 el0 && windup>0 && t<windup일 때만 전조 draw 요청. src.r\|\|12, t/windup, #ffffff/scale1/physicaltrue와 기존 _L 라벨. **draw가 t/nextShot/queue를 진행시키지 않음** |
| G16947–16994 | spawnProj의 기존 pool/정규화/밀도/속도/피해 owner는 참조만. _commit은 해당1/3 밀도 drop을 건너뛰는 표식이며 크기·속도·피해 등의 후처리 전체를 생략하는 뜻이 아님. 이 단위는 raw 요청만 반환 |

`native_ch2_boss_spiral_queue.gd`는 `begin_tick(si,snapshot,sp)`→`next_tick(token,response)`와 `draw_requests(si,snapshot,label)` API다. CH2 catalog bridge/context, BC07 packet helper·숫자/fallback helper를 수정 없이 재사용한다. tick은 미실행 spawnProj 요청마다 owner ack를 요구한다. full_tick_complete=false/executed=false, 직접 RNG0. 공통 packet helper를 위한 내부 빈 enemy/player 문맥만 있고 응답에는 actor/player 권한을 노출하지 않는다.

| snapshot·경계 | 계약 |
|---|---|
| null / queue | null은 G 동작 없음. queue는 ids 배열 + entries 사전. 실제 G 포인터가 아닌 자기 소유 사본이다. ids는 순서/중복 참조를 보존하며 제외된 entry도 원본 쓰기 대조용 사전에 보존 |
| 필드 | x/y/t/maxT/nextShot/interval/arms/dir/baseAng/dmg/el finite 숫자, col 문자열. windup 누락/null/0은0 fallback. arms 절댓값<=64 지원, 실제 CH2 3~5 외의 분수/0/음수도 source loop 경계 fixture로 다룸 |
| sp·stage | finite sp, CH2 catalog si4..9만. source의 로컬 for(si)는 queue index이며 stage와 혼동하지 않음. 강제 queue fixture는 실제 해금/등록을 뜻하지 않음 |
| 불변·ack | 입력 queue/entry/src/continuation 깊은 사본 불변. owner ack 없으면 NOT_READY, chapter/hash/version/커서/rotation guard. 실제 탄 성공/밀도 결과를 ack로 꾸미지 않음 |
| draw | 기존 localization owner의 label 문자열만 받음. 표시 대상이 없으면 라벨 reader도 필요 없음. 표시 대상인데 label 누락/잘못된 src.r snapshot이면 NOT_READY. 새 게임 텍스트·그리기·시계·RNG 실행0 |

## 2. 원본 VM 대조와 경계

필수 --node-bin 및 --source-game 절대경로. OS.execute 출력은 모두 join하고 진단만 하며, Node가 자기 userdir의 새 UTF-8 bc2-08-원본-fixture.json을 기록해 Godot가 읽는다. 기존 파일 삭제·source hash·Node exit·새 파일·JSON 확인, source 없는 fallback PASS0.

Node는 제품 GD를 읽지 않고 G37057 소비문·G20107 draw문·G37832–37845 초기화 case를 그대로 VM 실행한다. 원문 G14333/14338 enum/색도 사용한다. queue/entry Proxy가 원문 쓰기·압축·spawnProj 인자를 관측한다. **VM의 G는 테스트 전용 메모리 객체**이며 실제 게임 G/저장/서버를 쓰지 않는다. source spawnProj/draw helper는 기록 stub일 뿐 실제 집행이 아니다. source consumer/draw에 Math.random 호출이 생기면 오라클이 즉시 실패한다. 실제 spawnProj 내부 난수 소비는 fixture cursor로만 모사한다.

| 실측 | 값 |
|---|---:|
| consumer 상황 / event | 2,904 / 13,743 |
| raw spawn 요청 / 요청 없는 상황 | 2,267 / 2,363 |
| entry/length 쓰기조차 없는 상황 | 3 (absent/null/empty) |
| source 초기화 재사용 fixture | 20 |
| 반복 draw 대조 | tick 전후 queue 각2회 + 별도 src.r/색/경계 48상황 각2회 |
| consumer/draw 직접 난수 / 실제 G 쓰기 | 0 / 0 |
| 신규 최종 검사 / 실패 / skip | **102,151 / 0 / 0** |
| 기존 회귀 / 실패 | **362,201 / 0** |
| 최종 양성 합계 | **464,352 / 0** |

초기 consumer-only positive-01은 **43,589/0**이었다. 사용자 draw 경계 요구를 G20107의 읽기 전용 요청으로 추가해 positive-02에서 최종 재검했다. 이전 원로그/fixture/제품·테스트 사본은 consumer-only-*와 source-fixture-consumer-only.json에 보존했으며 중복 통과 합산0. 기존 회귀는 코드/기대값 무수정이며 새 모듈 변경과 독립이다.

원문 초기화20개(5 actor phase×4 dir draw)를 기존 BC2-03 API로 비교한 뒤 그 queue payload를 그대로 신규 소비 API에 전달했다. 이후 8개 연속 timeline은 시작부터 만료까지 원문 상태를 이어서 소비한다.

| sp | arms | 첫 발사 t | 만료까지 tick | 총 raw 탄 요청 |
|---:|---:|---:|---:|---:|
| 0.5 | 3 | 119.5 | 480 | 63 |
| 0.5 | 5 | 119.5 | 480 | 105 |
| 1 | 3 | 119 | 240 | 63 |
| 1 | 5 | 119 | 240 | 105 |
| 2 | 3 | 118 | 120 | 63 |
| 2 | 5 | 118 | 120 | 105 |
| 60 | 3 | 60 | 4 | 9 |
| 60 | 5 | 60 | 4 | 15 |

따라서 sp1 첫 발사는 t119, 전조 끝 t60 즉시 발사로 단순화하지 않는다. sp가 크더라도 tick당 한 volley만 처리하며 t>=maxT에서 쏘지 않는다. step0에서도 이미 발사 gate가 열린 legacy snapshot은 요청을 낼 수 있으므로 sp0을 일괄 no-op 처리하지 않는다. draw는 반복해도 t/nextShot을 소비하지 않는다.

거리/배율 새 설계 없이 시간59/60·239/240 전후와 동일 binary64 경계, nextShot<=0, windup 누락/null/0, arms분수/0/음수, 음수/큰 sp·interval overshoot, dir±1/0, raw dmg분수/큰값·el/색, 섞인 만료/활성/대기 queue와 중복 ID, draw t<windup/색·src.r fallback을 대조했다. 입력은 little-endian binary64로 복원하고 출력 부동소수는 기존1e-12*max(1,abs(expected)), 필드·수·순서·명령 대조를 적용한다.

## 3. 기존 회귀 무수정

| 기존 테스트 | 검사 | 실패 | 이전 검사 수 |
|---|---:|---:|---:|
| ch1_bc01_catalog | 681 | 0 | 681 |
| ch1_bc02_spawn | 5,257 | 0 | 5257 |
| ch1_bc03_utility | 31,976 | 0 | 31976 |
| ch1_bc04_selector | 21,899 | 0 | 21899 |
| ch1_bc05_phase | 18,424 | 0 | 18424 |
| ch1_bc06_start | 14,099 | 0 | 14099 |
| ch1_bc07_melee | 14,531 | 0 | 14531 |
| ch1_bc08_movement | 24,788 | 0 | 24788 |
| ch2_bc2_01_catalog | 7,169 | 0 | 7169 |
| ch2_bc2_02_reuse | 44,891 | 0 | 44891 |
| ch2_bc2_03_new_start | 25,749 | 0 | 25749 |
| ch2_bc2_04_vortex | 41,373 | 0 | 41373 |
| ch2_bc2_05_bean_rain | 35,164 | 0 | 35164 |
| ch2_bc2_06_fan_wave | 46,009 | 0 | 46009 |
| ch2_bc2_07_shield_bash | 30,191 | 0 | 30191 |
| 합계 | **362,201** | **0** | **362,201** |

BC01~08 GD/UID16개 인수 SHA-256 고정, 소계131,655/0 불변. BC2-01~07 포함15종 검사 수·조건·기대값·테스트0줄 변경. 기존 제품/CH2 테스트·oracle과 외부 검증 byte도 merge 기준으로 확인했다. BC08 등 기존 외부 인수 파일은 참조 실행만 하며 신규 제품에 끼워 넣지 않는다. 기존 userdir 상수·bc02/03 source-game을 사용했다. 모든 최종 양성 exit0/ERROR0/stderr0byte/skip0. 전체 게임·실전 회귀 PASS를 의미하지 않는다.

## 4. 결함 주입·인자 거절

신규 제품 파일만 외부 mutation-project에서 바꾸고 원문 fixture/테스트/oracle은 고정했다. 각 실제 exit1/FAIL과 원로그를 보존하고 양성 합계에서 제외한다. source fixture hash가 정상/변이 실행에서 동일하고 mutant 종료 후 제품이 복구됐는지도 대조한다.

| 주입 | 변경 | 검사 / 실패 | 판정 |
|---|---|---:|---|
| windup-clock | `if sb["t"]>=windup:` → `if true:` | 102,151 / 1,235 | exit1 / 검출 |
| expiry-strict | `sb["t"]<sb["maxT"]` → `sb["t"]<=sb["maxT"]` | 102,826 / 151 | exit1 / 검출 |
| interval-reset | `"nextShot",sb["interval"],events` → `"nextShot",sb["nextShot"]+sb["interval"],events` | 102,151 / 654 | exit1 / 검출 |
| commit | `"_commit":true` → `"_commit":false` | 102,151 / 2,808 | exit1 / 검출 |
| raw-speed | `cos(angle)*3.5` → `cos(angle)*4.0` | 102,151 / 541 | exit1 / 검출 |
| arms-count | `state["arm"]>=sb["arms"]` → `state["arm"]>=sb["arms"]-1` | 99,421 / 992 | exit1 / 검출 |
| rotation-dir | `sb["t"]*0.04*sb["dir"]` → `sb["t"]*0.04` | 102,151 / 24 | exit1 / 검출 |
| stable-trim | `ids.resize(state["write_index"])` → `ids.resize(ids.size())` | 102,151 / 202 | exit1 / 검출 |
| empty-no-write | ` or state["queue"]["ids"].is_empty()` → `` | 102,151 / 1 | exit1 / 검출 |
| draw-boundary | `sb["t"]<windup:` → `sb["t"]<=windup:` | 102,151 / 648 | exit1 / 검출 |
| draw-clock | `var source: Variant=sb.get("src")` → `sb["t"]+=1 / 				var source: Variant=sb.get("src")` | 102,151 / 5,802 | exit1 / 검출 |

필수 node-bin/source-game 누락 각각3검사/1실패 exit1로 거절했다. 음성 검출을 통과 수에 합산하지 않는다. draw-clock 변이는 caller snapshot 쓰기와 반복 draw 결과 불일치로 검출하며 실제 게임 시계를 변경하지 않는다.

## 5. 작성 범위·격리·정리

새 작성은 merge `31da860a0ddeca5294b246d61324e7308cf280fa` 이후 아래 **7경로**뿐이다. BC2-06/07 인수 체인의13경로(공통 CHANGELOG 포함)는 별도 의존 merge로 구분한다.

| 파일 | 역할 |
|---|---|
| godot/scripts/native_ch2_boss_spiral_queue.gd + .uid | 큐·draw 순수 계산 |
| godot/tests/test_boss_ch2_bc2_08_spiral_queue.gd + .uid | 신규 원본 대조·불변·거절 |
| godot/tests/bc2_08_source_oracle.cjs | 원문 VM/자기 UTF-8 fixture |
| docs/engine/orders/reports/bc2-08_REPORT.md | 이 보고 |
| docs/CHANGELOG_SYNC.md | 맨 위 기존 형식 동기화 절 |

공용6·Main/State/저장·다른 담당·기존 BC 모듈/테스트·원본·세이브형식·LOCK·보호Q/E·바이너리0줄. scope-verification.json으로 byte/R 시작 상태 확인. --no-checkout+sparse-checkout, 필요한 scripts/tests/Markdown만. merge는 충돌 없이 정상 적용됐다. 정상 pre-commit 훅·정확한 경로 stage, ignore에 걸린 자기 test GD/UID 두 경로만 명시 add-f. add-A/훅 우회0.

모든 Godot 전 지정 pgrep/wc 확인, 2 이상이면30초 대기. 자기 Godot 순차·타 Godot 종료0. 신규 EXODUSER-bc2-08-Isolated-20261020, 기존 파일 상수 userdir. 매 실행 override, finally에서0byte. argv/exit/stdout/stderr/engine/gate와 양성/의도된 음성을 execution-verification.json으로 대조했다. draw 추가 재검은 기존 회귀가 끝난 뒤 실행하고, 최종 양성 확인 후에만 변이 suite를 시작했다. 자기 branch push→원격SHA 일치→DONE 기록 후 자기 worktree만 제거하고 브랜치는 남긴다.

## 6. 실제 연결 HOLD·다음 단위

| 접점 | 필요 위치·근거 / 상태 |
|---|---|
| G queue / Main·State | G37840 생산→G37057 소비의 같은 frame phase·src identity·안정 압축 적용 권위. 실제 push/clock/clear/reset G30763/31555 등 연결HOLD |
| spawnProj / 탄·밀도 | G16947–16994의 raw _commit·pool·분류/속도/크기/피해/탄생 phase owner 재사용 필요. 기존 native_element_projectile_emitter.gd/native_projectile_birth_phase.gd/탄 kernel은 읽기 참조만. emitter RAW_KEYS에 r가 없고 지원 slice/실World 전제가 있어 이 보스 raw 요청을 지원한다고 가정하지 않음. owner 수정/우회/후처리 복제0 |
| draw / locale | G20107의 _drawShootCharge/_drawProjectileChargeLabel/_L 기존 renderer/localization owner. 계산 descriptor만 검증, 실제 draw/표시 품질/레이블 연결HOLD |
| 피해·패링·저장 | 실제 hurtP/패링/탄 hit/저장 실행0, 기존 보호 범위 그대로 |
| 다음 BC2-09 | trace §5.2 wallPush queue 계산. 이번 spiralBullet 범위까지, 다음 단위 미착수 |

관련 docs spiralBullet/_spiralBullets/_commit 전체 Markdown 검색 결과는 docs-keyword-audit.txt에 보존했다. trace C214의 전조/첫 발사 차이와 실제 spawnProj 후처리 차이를 이 보고/CHANGELOG에 보충했으며 기존 설계·수치·소유 파일은 바꾸지 않았다. 실제 화면·플레이·성능·PC 동기화는 **미확인**이다.
