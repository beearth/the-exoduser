# BC2-06 fanWave 독립 계산·원본 대조 보고

- 작업: `bc2-06` / 브랜치 `codex/bc2-06-20261020` / 2026-10-20.
- 판정: 독립 packet 계산 검증. 실제 투사체·hurtP·패링·Main/State 연결 **HOLD**. 실전·화면·성능·PC 실행 검증을 뜻하지 않는다.
- 기준 main: `249c26fad989071a94c19128e524ce0bbcb2c8c9`. 인수된 BC2-05 의존: `5957ced375eccb1d8fd62c4cc3521811ddfb8693`.
- 정상 merge: `7073a6af62ba6bea371b4452f305e1051f03ab40`. 부모 순서는 main→BC2-05이며 rebase/reset/force/main push 없음. 이 merge 이후 작성한 파일만 아래 신규 범위다.
- 원로그: `~/exoduser-wt/_out/bc2-06/`. 제출 SHA·원격 대조·정리 결과는 외부 `DONE.txt`에 기록한다.

## 1. 원본 근거와 소유 범위

`game.html`은 기준 main과 byte 동일. SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. `source-verification.json`·`source-fan-wave-numbered.txt`에 실제 byte/행을 보존했다. 전수 설계는 `FDG_SOURCE_TRACE_BOSS_CH2_20261020.md` 원격 추적 인수본 `ddf0549597e645b507cac672cba29df2639712c3` §2.3/§5.2의 6번을 참조했다. 해당 문서는 제품으로 복사·수정하지 않았다.

| 원본 행 | 정확 계약 / 이번 계산 |
|---|---|
| G9841,37757 | metadata.tele60과 실제 고정90 구분. BC2-03의 시작 계산을 참조만 한다. `_fwAng` lock·`_fwR=500`을 이번 tick에서 재설정하거나 P 방향으로 추적하지 않는다 |
| G40571–40573 | `bossFanWaveAim` 단일 상태. 이미 BC05가 st2를 감산한 스냅샷. 매 tick wind RNG `>.7`; 성공일 때만 vx→vy draw 후 입자 요청. 발사 tick에도 먼저 소비 |
| G40574–40579 | st2<=0 때만 발사. width=π*.5, radius=`_fwR\|\|500`, rawdamage=`~~(atk*2.5)`를 먼저 cache. detonate→shake15 순서의 미실행 요청 |
| G31723,40581–40585 | 원본 sqrt 거리, pd<radius·iframes<=0·not charge. atan2와 while(>π/<-π) wrap 뒤 abs(diff)<width/2. 거리/각도 동일 경계는 제외 |
| G40586–40589 | `resolve_fan_wave_contact`는 보호 범위 전체의 요청이다. raw `~~atk2.5` 뒤 element를 곱하고 다시 ToInt32·옵션 인자 생략. BC07 slash의 동일 parry×3/stunned60/poise20 recipe 재사용. KB15는 hurtP 이후 새 위치 기준 덧셈을 소유자가 수행할 계약. 실제 집행0 |
| G40593–40597 | contact 소유자 전체 readback 뒤 current x/y와 cached radius로 shQuery 요청. ordered ids+entities snapshot 필수. alive 비보스만 동일 strict sector/distance에서 KB12씩 덧셈. 중복 id는 같은 snapshot에 순서대로 누적하고 `query_write` 내역을 반환 |
| G40600 | `_fwFx={ang:current_fwAng,w:cached_width,r:cached_radius,t:0,maxT:20}`. contact 뒤 각도/위치가 달라져도 radius/damage cache를 다시 읽지 않음 |
| G40602–40604 | k0..24, angle=lock-width/2+width*k/24, speed8+u6→size3+u4→life12+u10 draw. 색 #ff8844/#ffcc44 교대. 25 입자 요청 뒤 **bossRec40**, recover20 clamp 경로로 바꾸지 않음 |
| G41373–41386,53022–53031 | 공통 bossRec 종료와 렌더 내 `_fwFx.t+=_dtSp`/maxT 제거는 기존/후속 owner. 이번 모듈에서 시계를 추가로 진행하지 않음 |

`native_ch2_boss_fan_wave.gd`는 `begin_tick(si,enemy,sp,player)`→`next_tick(token,response,rng)` API다. CH2 catalog bridge/context 및 BC07 `_command/_write/_draw/_distance/_aim/_or_num/_i32/_contact`를 그대로 재사용하며 공통 수식/표/패링 구현의 복제·수정0이다. 반환값은 `full_tick_complete=false`, 모든 command는 `executed=false`다.

| 입력·경계 | 계약 |
|---|---|
| 단계 | CH2 catalog가 지원하는 si4..9만. 강제 상태 fixture의 지원은 move 해금/선택 성공을 의미하지 않음 |
| snapshots | BC07 actor/player 수치 계약 + finite `_fwAng`, player.kb x/y. radius는 finite 숫자/null/누락, 0/null/누락 fallback500. 원본은 atan2 잠금이므로 정상 범위±π, 추가 wrap 검사용 ±128π까지 지원·그 밖은 NOT_READY |
| RNG | 외부 Callable의 finite [0,1). 각 원문 draw의 tag/행/값/소비 순서를 ledger에 보존. helper 내부 draw 소비는 owner/fixture cursor가 공급. 전역 RNG/시간/입출력 사용0 |
| ack | 모든 helper에 명시 ack 필요. contact는 전체 enemy_after/player_after 없이 NOT_READY. query는 순서 있는 string ids와 명시 bool alive/ib·x/y/kb 스냅샷 없이 NOT_READY |
| query alias | 같은 id의 중복 참조만 동일 대상 누적. snapshot은 조회 결과의 읽기/계산 데이터이며 실actor 전체를 덮어쓰는 API가 아니다. 실제 반영은 ordered KB 내역의 소유자 통합 계약 필요 |
| 불변 | 호출자 enemy/player/query/token 깊은 사본을 대조. 보호 owner가 갱신한 미소유 필드도 readback 그대로 보존 |

## 2. 원본 대조 하니스

새 테스트는 `EXODUSER-bc2-06-Isolated-20261020`. Node binary를 필수 `--node-bin`, 원본 절대경로를 `--source-game`으로 받는다. `OS.execute` 출력은 모두 join하고 진단에만 사용한다. Node가 자기 userdir의 새 UTF-8 `bc2-06-원본-fixture.json`을 기록하고 Godot가 읽는다. 기존 파일을 먼저 지우며 누락·원본 hash 불일치·Node 실패는 실패 처리한다. 실제 저장 폴더/서버 호출0.

오라클은 Godot 제품을 읽지 않고 원본 G31723의 dst와 G40571–40605 switch를 그대로 VM에서 실행한다. Proxy가 원본 쓰기·shQuery KB·RNG·helper 순서를 관측한다. 보호 contact는 source `isPWin`부터 shQuery 직전까지 별도 trace/readback으로 관측하며, 실제 hurtP/hurtE/패링 body는 fixture stub이다. 테스트는 raw source helper 인자/반격식/stun/poise/bank/KB 결과와 요청 recipe를 대조한 뒤 owner readback을 공급한다. source 명령 순서 대조에서는 이 보호 구간을 하나의 명령 경계로 정규화하며, descriptor의 별도 검사 없이 생략하지 않는다.

| 최종 source fixture | 실측 |
|---|---:|
| 상황 | 647 |
| 관측 event | 46,822 |
| 원문 RNG | 32,079 |
| contact / 그중 parry fixture | 208 / 78 |
| shQuery KB 쓰기 / 입자 요청 | 1,432 / 10,691 |
| 신규 검사 / 실패 / skip | **46,009 / 0 / 0** |
| 기존 회귀 / 실패 | **286,001 / 0** |
| 최종 양성 합계 | **332,010 / 0** |

stage/time/고정각/player gate 행렬, ±π/4·반경의 전후/동일 경계, ±π 및 다회전 wrap, radius 누락/null/0/음수, 음수·32bit overflow atk, element multiplier 0/분수, helper nested draw, 중복 조회·dead/boss/범위밖 제외, 빈 조회/긴 alias 순서, contact 뒤 actor 위치·각도·radius·atk·상태 변경을 포함한다. 분기 입력/RNG는 little-endian binary64 hex로 복원한다. 출력 부동소수 비교는 기존 BC2-04 방식의 상대 허용오차 `1e-12*max(1,abs(expected))`, 명령/필드/수/순서는 정확 대조다.

## 3. 기존 회귀 무수정

BC01~08 GD/UID 16개의 기존 SHA-256과 이전 인수본을 `existing-tests.json`으로 고정했다. 실행된 기존 제품/BC2-01~05 테스트·oracle을 merge 기준의 같은 byte와 대조한다. 외부 검증 프로젝트의 BC08 등 기존 인수 자료는 참조 실행만 하며 이번 제품 커밋에 끼워 넣지 않는다. 기존 테스트 상수의 userdir를 매 실행 override로 사용하고 BC02/03에 원본 절대경로를 전달했다. 검사 수·조건·기대값·테스트 코드 수정0.

| 테스트 | 검사 | 실패 | 이전 검사 수 |
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
| 합계 | **286,001** | **0** | **286,001** |

각 최종 양성은 exit0/ERROR0/stderr0byte/skip0. BC01~BC08 소계 **131,655/0** 유지. 검수 범위는 위 13개 기존 회귀이며 무관한 전체 게임 테스트/실전 통과 주장 없음.

## 4. 결함 주입 및 실패 보존

정상 원본 fixture/테스트/oracle은 그대로 두고 외부 mutation-project의 신규 제품 한 파일만 바꾸었다. 각 검출은 실제 exit1과 원본 FAIL 로그로 확인하며 양성 통과 합계에 더하지 않는다.

| 주입 | 변경 | 실제 검사 / 실패 | 종료 / 판정 |
|---|---|---:|---|
| wind-strict | `gate["unit"]>0.7` → `gate["unit"]>=0.7` | 46,015 / 3 | 1 / 검출 |
| sector-strict | `<state["width"]/2` → `<=state["width"]/2` | 45,673 / 274 | 1 / 검출 |
| radius-strict | `<state["radius"]` → `<=state["radius"]` | 45,589 / 374 | 1 / 검출 |
| query-boss | `not fe["alive"] or fe["ib"]` → `not fe["alive"]` | 46,009 / 434 | 1 / 검출 |
| query-kb | `else sin(angle))*12` → `else sin(angle))*13` | 46,009 / 722 | 1 / 검출 |
| recovery | `"s":"bossRec","st2":40` → `"s":"recover","st2":20` | 46,009 / 804 | 1 / 검출 |
| damage-rounding | `Common._i32(e["atk"]*2.5)` → `e["atk"]*2.5` | 46,009 / 42 | 1 / 검출 |

필수 인자 누락 2종은 각각 **3검사/1실패, exit1**이며 기대한 거절이다. 실제 source/hash가 없는데 PASS하는 fallback 없음. mutant 종료 후 정상 모듈 byte를 복구하며 정상/변이 실행의 Node source fixture hash가 동일한지도 확인한다.

첫 신규 `positive-01`은 46,009검사/338실패였다. Godot JSON의 float 배열과 int 기대 배열을 `==`로 비교한 신규 하니스 오류다. 130개 normal contact×2, 78개 parry contact×1의 세 assertion에서 발생했고, 최종 actor/event 비교는 일치했다. 기존 회귀는 건드리지 않고 이 신규 세 배열을 기존 수치 comparator로 바꿨다. 최초 로그와 당시 테스트 복원본을 보존했으며, 재검 `positive-02`는 같은 검사 수 **46,009/0**이다. 실패를 PASS로 합산하지 않는다.

첫 sparse merge는 내부 복구(diff-tree)에 장시간 머물렀다. 이 작업의 Git 자식만 종료한 뒤 clean 상태 확인/인덱스 refresh, `--no-autostash -s ort --no-ff` 정상 merge로 재시도했다. 유일한 CHANGELOG 충돌은 BC2-05 상단 절+main 본문을 모두 보존했다. `merge*.log`·`merge-interruption.json` 보존, R/main/타 작업 상태 조작0.

## 5. 변경 파일·보호 확인

| 신규 작성 파일 | 역할 |
|---|---|
| `godot/scripts/native_ch2_boss_fan_wave.gd` + `.uid` | 독립 상태 계산 / 명시 owner 요청 |
| `godot/tests/test_boss_ch2_bc2_06_fan_wave.gd` + `.uid` | 신규 원본 대조·불변/거절 검사 |
| `godot/tests/bc2_06_source_oracle.cjs` | 원문 VM / 자기 fixture 출력 |
| `docs/engine/orders/reports/bc2-06_REPORT.md` | 이 보고 |
| `docs/CHANGELOG_SYNC.md` | 맨 위 기존 형식의 동기화 절 |

merge 의존 이력에는 BC2-05 인수 7경로가 별도로 들어간다. **작성 기준 `7073a6af62ba6bea371b4452f305e1051f03ab40` 이후 신규 7경로뿐**이다. 공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state)·기존 BC 모듈/테스트·PC/클라우드 타 담당·원본·세이브·설계 LOCK·Q/E 문서·바이너리 변경0. `scope-verification.json`으로 byte 확인한다. 새 `test_*` 경로는 기존 ignore 규칙 때문에 정확한 자기 GD/UID 두 경로만 `git add -f --`로 명시하며 전체 add/훅 우회 없음.

worktree는 --no-checkout+sparse-checkout. 이후 필요 없는 assets/문서 바이너리를 sparse에서 빼 약67MB로 축소했다. 검증은 자기 외부 최소 프로젝트에서 순차 실행했다. **매 Godot 실행 전** 지정 pgrep/wc 수를 검사해 2 이상이면 30초 대기하고, 다른 Godot는 종료하지 않았다. gate/engine/stdout/stderr/argv/exit를 매 실행 보존한다. 신규·기존 격리명은 실행마다 override하고 finally에서0byte로 비운다. `execution-verification.json`이 양성/최초 실패/의도된 음성·동시성·gate·override를 구분한다. 최종 정상 push→원격 SHA 일치→DONE 작성 뒤 자기 worktree만 제거하고 브랜치는 남긴다.

## 6. 실제 연결 HOLD / 다음 단위

| 접점 | 필요한 위치·근거 / 이번 상태 |
|---|---|
| Main/State tick | 공통 BC05 감산 후 신규 dispatcher 접점, source G40444–40454. 이 독립 API는 실제 updateE 전체가 아니며 연결0 |
| protected contact | G40586–40589. isPWin/hurtP/boss hurtE/doParry/poise/은행·player KB의 기존 owner가 recipe를 실행하고 전체 readback/내부 RNG cursor를 제공해야 한다. 무적/저항/피해 성공·Q/E 패링 실행 미확인 |
| shQuery / live enemy KB | G40593–40597. spatial query의 동일 시점·순서·실actor identity와 KB 쓰기 권위 필요. 자기 snapshot 계산만 검증, 실제 반영0 |
| 투사체·표시·음향 | fanWave 본체는 직접 투사체를 생성하지 않는다. 실제 투사체 owner 연결·helper 실행·SFX·shake·입자/렌더 `_fwFx` 시계·제거(G53022–53031)는 HOLD |
| 후속 BC2-07 | trace §5.2의 shieldBash2 wind/dash/contact 단위. 이번 지시 범위는 fanWave까지이며 다음 단위 미착수 |

관련 docs 전체 `fanWave/bossFanWaveAim/부채꼴 충격파/_fwFx` 검색 결과는 `docs-keyword-audit.txt`에 보존했다. BOSS_BATTLE_SETTINGS.md §9의 bossRec40과 원본 일치, metadata.tele60≠실제 시작90 및 렌더 시계 차이는 기존 추적 문서/이 표를 따른다. 기존 설계·밸런스 수치는 바꾸지 않았고 이식 계산의 구현 상태와 실제 연결 HOLD를 이 보고/CHANGELOG에만 보충했다. 실제 화면·플레이·성능·PC 동기화는 **미확인**이다.
