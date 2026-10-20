# BC2-04 — vortex wind/active 순수 상태 계산

## 판정·기준

**BC2-04 계산 구현 및 원본 대조 자료 준비.** 추적 순서안 §5.2의 4번 vortex wind/active를 자체 snapshot/command 계산으로 구현했다. 새 제품1개에 범위를 한정했고, 실제 `P.kb`/`hurtP`·전투·Main/State/World 연결은 **HOLD**다. 기존 장 catalog·BC07의 상태 packet/helper·BC05의 clock 소유 계약을 재사용한다.

| 항목 | 근거 |
|---|---|
| 작업·브랜치 | `bc2-04` / `codex/bc2-04-20261020` |
| main·선행 | fetch 최신 main `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d` (6d987cb8a 이상). BC2-03은 main 미포함으로 인수 끝 `bbaed502e9b796a8cb44108da09cfcd93449e3ff`에서 분기. 이 끝은 최신 main을 이미 포함하므로 추가 merge 없음 |
| 근거 문서 | 인수 trace-boss-ch2 `ddf0549597e645b507cac672cba29df2639712c3` §5.2 4번 B2C04·§2.3 vortex·§6, BC2-02/03 보고서 및 기존 BC07/BC05 소유 경계. trace는 현재main에 없어 인수 사본을 외부 원로그에서 참조 |
| 원본 | 최신 main game.html65,692행/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index.html4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`; byte 동일 |
| worktree | `worktree add --no-checkout` + non-cone sparse-checkout. 필요한 지침/engine·보스docs/scripts/tests/game/index만 수령, 대용량 웹 에셋 없음 |
| 보호·의존 | 공용6파일·다른 담당·기존 모듈/테스트·원본·저장/형식·씬/설정·바이너리 작업 diff0. BC01~BC08·BC2-01~03 제품/테스트는 읽기 재사용 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 시작 HEAD·branch·tracked INDEX/WORK·기존 untracked 목록 보존. baseline/scope/cleanup JSON에 실제 값 보존 |

## 제품·호출 계약

제품은 `godot/scripts/native_ch2_boss_vortex.gd`(+자기UID)다. `source_receipt()`, `begin_tick(si,enemy,sp,player,options={})`, `next_tick(token,response=null,rng=Callable())`를 제공한다.

| 계약 | 구현·한계 |
|---|---|
| 장·상태 | BC2-02 catalog bridge/context를 호출하여 동일 source receipt와si4~9를 검증. `bossVortexWind`/`bossVortex`만 소유. 다른 state/장으로 범위를 넓히지 않음 |
| 공통 재사용 | BC07의 `_command/_draw/_write/_global/_distance/_aim/_options/_actor/_player/_numbers/_num/_fail`를 직접 호출. packet·ack·난수 규약·공통 수치 helper 복제0. 보호된 근접/패링 로직 호출0 |
| 시계 | **BC05가 이미 st2를 감산한 뒤**의 switch 입력을 받는다. st2/sp를 여기서 다시 감산하지 않음. active `options.now_msec`는 원본 `_now`, `options.shake`는OPT.shake에 해당하는 명시 reader. OS 시각·실제 singleton RNG를 읽지 않음 |
| 입력/출력 | BC07 snapshot 필드에 speed·_bossPhase·player.kb.x/y를 추가해 검증. 입력/continuation을 깊게 복사하고 외부 객체를 바꾸지 않음. 로컬 KB snapshot 변경은 `player_write` event로 구분 |
| 미실행 요청 | 충돌/피해/입자/음향/표시 모두 `executed=false` command. 매회 한 요청, `full_tick_complete=false`. 외부 executor/실제 actor/global에 적용0 |
| owner ack | 충돌은 명시 ack+bool, 일반 효과는 ack, 피해는 ack+전체 enemy/player readback을 요구한다(기존 BC07 필수 필드 검증 규약+추가필드 검증). caller가 실제 전체 snapshot을 제공할 의무는 그대로이며 fixture ack를 실전 성공으로 보지 않음 |
| 피해 경계 | native는 `resolve_vortex_damage` recipe에 현재atk·계수·el·`elMul(e.el,ar().el)`·**원소 배율 후 ToInt32**·options 생략 여부를 담는다. 실제 elMul/ar/hurtP를 실행하거나 HP/Q/E/방어를 재구현하지 않음 |
| readback 순서 | tick용pd는 이동 직후 계산한 원문 local을 유지. 피해 이후 player/actor는 owner readback으로 교체. tick 후 addTxt/입자 각·반경 및 fresh 폭발 거리/종료 판단, 폭발 피해 후 KB 각은 그 시점 snapshot을 사용 |
| 실패 | stage/state/snapshot/time/options/토큰 owner/hash/path/pending 오류, RNG 누락·유효범위 밖, 충돌bool·피해readback 누락, 알 수 없는 checkpoint는 NOT_READY. 자동 ack·합성 피해 성공·부분 READY 없음 |

기존 BC07 helper 이름과 반환 형식에 직접 의존한다. 향후 helper 변경 시 이번 회귀가 필요하며 기존 파일을 이 작업에서 수정하지 않았다. 새 token을 기존 BC07.next_tick에 넣어 미지원 state guard를 우회하지 않는다.

## 원본 행·수치·순서

행은 최신 main game.html이다. `source-vortex-numbered.txt`에40905~40941 전사를 보존한다.

| 원본 행 | 보존한 계산 |
|---|---|
| 40905–40907 wind | 매호출u>.5면 x/y/vx/vy4 draw 추가(합5). 각 위치 draw와속도 draw는 독립. 속도식의 `e.x-(e.x+offset)` 평가 순서도 유지. poolPart 뒤 st2<=0이면bossVortex/st2=80·SFX.charge 요청 |
| 40910–40914 이동 | player각, speed×.4×sp. canMv **XY→실패 시X→그것도 실패 시Y**, bool 결과에 맞는 좌표 필드만 기록. XY성공시축별 질의0, X성공시Y질의0 |
| 40915–40921 pull | 이동 후pd, R=180+si×5(CH2 200~225). **15<pd<R**일 때pull=3+actorPhase×1.5, player.kb 각성분에cos/sin×pull×sp×.1 누적. charge/iframe에 의해pull을 막지 않음 |
| 40924–40925 tick | **pd<40 / iframes<=0 / s!=charge / JS st2%30<sp**. 음수 나머지 부호 유지. 피해식 `~~(atk*.6*elMul(...))`, 명시options`{dtype:'magic'}`; 피해readback 후 현재P좌표 addTxt |
| 40928–40930 입자 | `_now/200+현재st2*.1` 각을 local로 보존, 3방향×매회 size draw1. 반경20+현재st2*.5, size2+u×2, 고정색·수명8. helper 내부 난수 소비는 caller가 다음 입력에 반영 |
| 40931–40936 폭발 | 현재st2<=0, 새distance<100+si×5(CH2 120~145), iframes<=0/notcharge. 피해식`~~(atk*2*elMul(...))`, **hurtP options 인수 생략**(tick의magic을 강제하지 않음). 피해readback 뒤 현재e/P각으로KB15 누적 |
| 40938–40939 종료 | addParts30 요청→shake=12×OPT.shake/100 event→SFX.groggy 요청→**recover65**. 같은 switch에서20으로clamp하거나idle로바꾸지 않음. 이후 공통BC05 recovery 소유와 분리 |

## 독립 원본 검증

`godot/tests/bc2_04_source_oracle.cjs`는 mandatory source 경로·UTF-8 출력 경로를 받고 전체game hash를 확인한다. 실제 원본dst(31723)와vortex switch(40905~40940)를 같은 행 번호의 Node VM에서 실행한다. 적/player/KB write Proxy·collision·난수·효과·피해 stub을 계측한다. 기대값은 GDScript 제품에서 만들지 않는다.

새 `godot/tests/test_boss_ch2_bc2_04_vortex.gd`는 **인자 `--node-bin`으로 받은 Node**가 자기 userdir에 쓴 UTF-8 fixture를 읽는다. stdout으로fixture/summary를 전달하지 않고 실패 진단만전체join한다. 매회 이전fixture를 지운 뒤 fresh 파일·source receipt·실제격리경로를 검사한다. RNG는 LE IEEE754 bit를 hex로 운반해 .5바로위/아래·1직전을 Godot JSON에서 보존한다.

| 실행 | 검사 / 실패 | 원본 상황 / event / RNG / 충돌질의 / 피해요청 | 상태 |
|---|---:|---|---|
| new-01(확장 전) | 40,278 / 0 | 1,274 / 15,397 / 4,398 / 1,694 / 624 | exit0·ERROR0 |
| **new-02 최종** | **41,373 / 0** | **1,304 / 15,877 / 4,488 / 1,724 / 654** | exit0·skip0·ERROR0·stderr0byte |

제품 코드는 두 실행 사이 바뀌지 않았다. 최종30상황은 입력시각0/.125/199.5/200/1e6와shake0/100/125.5를 추가한 것이다. 위 두 PASS를 중복 합산하지 않는다.

| fixture 군 | 수 |
|---|---:|
| stage-state-matrix | 864 |
| strict-distance | 234 |
| tick-modulo-normal | 27 |
| tick-modulo-charge | 27 |
| tick-modulo-iframe | 27 |
| tick-modulo-negative-iframe | 27 |
| owner-readback-iframe | 12 |
| owner-readback-shift | 12 |
| owner-readback-timer | 12 |
| owner-readback-explosion-shift | 12 |
| strict-wind-RNG | 10 |
| raw-rounding | 8 |
| particle-subtraction-order | 2 |
| time-and-shake-readers | 30 |

기본864상황은6stage×wind/active의12시점×3sp×4충돌경로다. 추가로15/40/pullR/폭발R의직전·동일·직후, 음수/0/30f 나머지, charge/iframe gate, 큰좌표 뺄셈 순서, 다양한el/ToInt32 overflow, helper중첩난수, 피해owner가좌표/KB/atk/el/st2/s/iframe을 바꾸는 readback을 다룬다. readback 뒤 payload/추가피해/KB가 실제 원문 순서인지 비교한다.

피해 fixture는 원본hurtP 호출에 전달된 실제 숫자와options인수개수도 저장한다. 테스트 driver는 미실행 recipe를 **fixture owner 계산으로만** 해석해 원본숫자와 대조하고, 원본stub의전체snapshot/cursor를 돌려준다. 실제hurtP·HP·무적·방어 성공 증거가 아니며 원래보호소유자는 미연결이다. 숫자 비교는 기존1e-12 상대오차 규약, 구조·필드·행·명령 순서는 모두 대조했다.

추가 native 경계 검사에는 미지원장/state/필드/시간, 잘못된RNG, 토큰owner/hash/path/step/pending, ack·충돌bool 누락, 피해전체readback 누락·불완전snapshot, caller입력불변, st2중복감산0을 포함한다.

필수 `--node-bin`/`--source-game` 누락도 각각3검사/1실패·exit1로 거절했다(`missing-node`, `missing-source`). skip이나기존fixture 재사용으로PASS 처리하지 않았으며정상검사합계에서제외한다.

## 기존 회귀·검출력

기존 테스트를 수정하지 않고 각상수USERDIR·source-game 절대경로로 실행했다. BC2-03 때 인수된 BC01~BC08 GD/UID16개와원격SHA/SHA256(`existing-tests.json`) 및 BC2-01~03 제품·테스트를기준끝과byte 대조했다.

| 회귀 | 검사 | 실패 | 변경 |
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
| **BC01~BC08** | **131,655** | **0** | 동일 검사 수 |
| **기존 회귀 전체** | **209,464** | **0** | BC2-01~03 포함 |

모든 최종정상 실행은 exit0·skip0·ERROR0·stderr0byte다. 전체로비/contracts/실전·시각·성능·PC 검증을 이번 PASS로 주장하지 않는다.

별도외부mutation 사본에서 새제품만바꾸고 원본oracle/테스트를유지했다. 아래는 **의도적 결함으로 테스트 실패를 기대한 실행**이며 PASS에 합산하지 않는다.

| 의도적 결함 | 검사 | 검출 실패 | exit |
|---|---:|---:|---:|
| collision-y-fallback | 40,221 | 678 | 1 |
| pull-strict | 41,373 | 24 | 1 |
| tick-modulo | 40,205 | 146 | 1 |
| owner-readback | 40,827 | 168 | 1 |
| recover-clamp | 41,373 | 622 | 1 |

일부 결함은 잘못된 추가피해요청으로 fixture readback 소진 guard에서 조기 실패하므로 단정 수가 달라진다. 테스트 파일은 그대로이며 실패 run을 정상 회귀 합계로 세지 않는다.

Y축fallback 생략, pull하한의strict>를>=로, tick 나머지<를<=로, 실제playerreadback 무시, recover65를20으로즉시clamp하는5결함을각각검출했다. mutation 파일은finally에서원래로복원했고 제품worktree/정상validation 코드는바꾸지않았다. 실패원문·비교자료 보존, 검사약화/가짜PASS 없음.

## docs 대조·HOLD·제출

보스바이블의장배정/공통복구시계와trace vortex행표를읽었고 docs의vortex 관련20행을`docs-keyword-audit.txt`에보존했다. 원본 수치·보스배정·보호설계 변경0, 기존다른소유문서수정0이며 구현상태·정확계약은이보고서와CHANGELOG맨위절에기록했다.

BC2-03의vortex시작→새vortex tick, BC05공통시계→본switch→후속recover소비, 실제canMv/hurtP/KB·particle/음향/global executor의적용과ack는 **실제Main/State/World 통합HOLD**다. 필요한위치는Main state dispatch·충돌reader·보호hurtP owner·player KB snapshot apply·효과executor이며공용6파일0줄을유지했다. 다음BC2-05(beanRain)나나머지state/queue소비는미착수다. 전체2장전투/부활/시각/성능은 **미확인**이다.

모든Godot호출전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을실행하고2이상이면30초대기했다. 자기Godot직렬1개, 신규`EXODUSER-bc2-04-Isolated-20261020`, 기존은파일상수격리명이다. override는매호출설정/finally0byte, 실제저장폴더사용0이다.

최종7파일은신규제품GD/UID·신규테스트GD/UID·source oracle CJS·이보고서·허용CHANGELOG절이다. 원로그 `~/exoduser-wt/_out/bc2-04/`에원문fixture/argv/pgrep/실행/회귀/mutation/scope·R대조/정상hook/push/remote검증을보존한다. 자기branch push→원격SHA일치→DONE작성뒤자기worktree만제거한다. 최종SHA는외부DONE/제출검증에기록한다.
