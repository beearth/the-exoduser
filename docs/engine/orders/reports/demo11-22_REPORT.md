# DEMO11-22 — 일반 장착 transaction: BLOCKED / runtime refresh 인터페이스 요청

**일반 equip/unequip 제품은 미구현이다.** 현재 main의 producer/읽기 계약은 재사용 가능하지만, 실제 런타임 applyStats와 자원 보존을 수행할 인수된 commit 경로가 없다. bag만 먼저 이동시키거나 pre-Tree guard를 우회하지 않았다. Main/State 승인 범위를 넘어 실제 Player의 이동·방패에 걸친 초기화 계약을 변경하는 대신 아래 인터페이스를 요청한다. 피해 계산 변경0, 검사 약화0, 구현 완료 주장0.

| 기준·확인 대상 | 원본·현재 코드 근거 / 판정 |
|---|---|
| 기준 / 의존 | fetch origin/main **8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4** + DEMO11-21 최종 **a976680b6b7c96af8b31ddbd4f25e53eb520ea5f** 정상 merge = **ca5be9f1**. 두 SHA 모두 ancestor 확인. rebase/force0. 61ab71be의 DEMO11 gap 행127을 읽기 참조했으며 다른 미병합 코드 반입0 |
| 17slot·격자 재사용 | TI-00 native_inventory_contract.gd의 실제 State INV reader와 canonical 17slot, TI-01 native_inventory_layout.gd의 크기/카테고리/skip/grid/space 검색 재사용 가능. 원본 G15176/16174–16210. bag cap을 단순300개로 제한하면 원본과 다름 |
| equip/unequip 원본 | G16272–16286 귀걸이 자동/명시 대상, G16293–16301 reqLv 거부, G16302–16345 강화/유물 전승, G16346–16366 동일 item identity로 bag filter/old 좌표·배치, G16367–16380 unequip push→space 실패 pop→성공 equipped=null. 강화·유물이 있는 일반 장비 교체를 조용히 생략하면 원본 이식 완료가 아님 |
| 필수 refresh | **G16287–16292**: hp/mp/st/shield 보관→affix/stat/legendary cache3개 무효화→applyStats1회→각 min(new max,old current). 초기화로 자원을 새로 충전하면 안 됨. G28564–28624 및 G16933–16940의 기존 producer 재사용 대상 |
| 초기화 dispatcher 제한 | native_source_player_initialization.gd:167–174는 attempted 단회, :396–405는 새 unparented/pre-Tree actor만 허용. services.gd:123–134 configure도 pre-Tree, :573–599 write/invalidate는 pre-Tree + active initializer. runtime equip에 initialize_new_run 재호출 불가 |
| 실제 sink 제한 | State native_source_new_run_state.gd:715/758–766와 native_source_resource_authority.gd:259/285–293는 초기화 소유자·태그·중복·pre-Tree 제한. player.gd:228–268/288–326도 실제 actor 초기화 전용. Player에 speed/poise/hp, 자원 authority에 MP/ST가 나뉘어 있어 State의 P dictionary만 바꾸는 방법으로 동기화되지 않음 |
| 기존 readback 경로 | Main main.gd:1493–1545 read_native_attack_parameters는 current P.baseAtk/current INV·reference·formula를 읽음. Player player.gd:566 get_native_attack_parameters→기존 Main, :1053–1095 기존 공격 사용; :919와 :1035는 실제 base_def 사용. 따라서 INV reader 변화만으로 방어 readback 통과를 선언할 수 없음. 이 경로 모두 수정0 |
| 기존 추적 문서 | FDG_SOURCE_TRACE_INVENTORY_20261020.md §5.6(TI-04)도 runtime sink 미인수 시 실제 연결 BLOCKED, 초기화 재호출/범용 writer 신설 금지를 명시. TI-00/01 통과는 장착 완료가 아님. 권한 해석: 이번 Main/State 승인 범위로 Player의 이동·방패 초기화 계약까지 변경하는 것은 포함하지 않았으며 PC 전투 핵심·피해 경로는 그대로 보호 |

## 필요한 최소 인터페이스와 재착수 조건

아래 이름은 **제안**이며 인수된 API가 아니다. 코드 줄 수는 구현 전 **미확인**이고, 위치는 현재 의존 merge 기준이다. Main/State와 별도로 Player/자원/dispatcher owner의 계약이 먼저 필요하다. Main의 장착 함수에서 private dictionary나 actor 필드를 직접 쓰는 우회는 제안하지 않는다.

| 소유 위치 / 추가 접점 제안 | 필요한 계약·검수 |
|---|---|
| PC/실제 actor stats sink — player.gd:228·288 부근 | 초기화 함수의 guard를 푸는 대신 장비 재계산 전용 owner/transaction tag를 받는 runtime stat commit 계약. 기존 이동·피해·Q/E 식 변경0. 변경 허용 필드와 실제 readback 정의, 실패 시 부분 commit 처리 합의. 이동 speed·방패/poise 계약은 담당 인수 필요 |
| 실제 자원 owner — native_source_resource_authority.gd:259·285 부근 | 현재 actor·world·source owner 검증 뒤 기존 producer packet의 MP/ST 최대·회복률 적용과 최종 현재값 보존/clamp 전용 commit. fresh 초기화/자원 보충 API 재사용 금지. 외부 owner·중복·재진입 거부, min(new max,old current) 입증 |
| ordered applyStats owner — initialization.gd:167 및 services.gd:573 부근 / 별도 runtime 모듈 | accepted effective/health/base-attack/defense/resource/shield producer와 기존 순서 재사용, startup 단회 API와 분리. before/after readback·준비 실패 시 bag 이동 전 거부·commit 실패 결과 명시. W01/ITEMS 식·장비 종류/요구레벨 생성 재구현0. 같은-pass capture/cohort를 현재 runtime에 연결하는 계약 필요 |
| Mac 허용 Main/State — main.gd:1493·2595 / State:184·715 부근 | 실제 INV identity 유지한 equip/unequip 진입, 17slot/레벨/귀걸이/old 위치/필요 전승 owner 검사, State transaction 승인과 source packet 적용. affix/reference 캐시 무효화 primitive 및 Main _source_l_eq_cache 무효화 연결, no yield/재진입 가드. 현재는 코드0줄 |
| 인수 후 직접 검증 | 17slot별 bag↔slot 및 동일 객체/배열 교체, reqLv 실패 무변이, 귀걸이 자동/명시 target 수명, full bag unequip 원상 유지, old 강화/유물 전승 원문 대조, cache3종 stale 제거, 네 자원 상승 시 무료 충전0/감소 시 clamp, 실제 공격 base와 Player.base_def readback. 기존 피해 실행 경로는 호출·관측만 하고 수식 수정0. 틱 목록 생성 API0, 계약 검증은 최초1회 캐시 |

별도 runtime refresh 인수 SHA가 있는지 총괄에 질의했다. 아직 확인된 인수 SHA는 없으며, 현 작업에서 해당 범용 writer를 임의로 만들지 않는다. 위 인터페이스가 main 또는 명시 의존으로 인수되면 같은 단위를 실제 transaction·Main readback 검증까지 재착수한다.

## 변경·검증 범위

제품·테스트 수정0, Main0줄·State0줄·Player0줄·자원 authority0줄·전투/저장/맵0줄이다. 변경은 이 보고서, CHANGELOG_SYNC, docs/2_7의 native 현황 보충, WORK_BOARD 자기 행뿐이다. 원본 전체/큰 JSON 덤프0. 신규 테스트는 없으므로 EXODUSER-demo11-22-Isolated-20261021은 import에만 사용하며 장착 PASS로 세지 않는다. 원로그·bounded 행 근거·입력 SHA는 ~/exoduser-wt/_out/demo11-22/에 둔다.

기존 관련 회귀를 각각1회 실행했다: **TI-00 142단정/0실패**, **TI-01 96단정/0실패**(합계238/0). 둘 다 실제 Main 장착 검수가 아닌 기존 holder/actor-fixture·읽기/격자 검수다. TI-01의 oracle92사례는 출력만 했고 별도 JS 대조를 실행하지 않았으므로 일치 PASS로 세지 않는다. import 포함 Godot3회 --verbose exit0·ERROR0·ObjectDB 누수0·resource 잔류0. 기존 파일 상수의 격리 user dir를 유지했다. 매 실행 전 지정 pgrep gate, count2 이상일 때30초씩4회 대기, override finally0byte. stdout/stderr는 외부 파일, 실패/요약만 확인했다. 틱 코드 변경/목록 생성 API 추가0, 성능 벤치/Performance 지표 사용0.

새 장착 transaction·stats 재계산·실제 공격/방어 변화 readback은 **미실행/미구현**이다. 기존 회귀 통과를 이 단위 기능 완료로 합산하지 않는다. 자기 브랜치 push·원격 SHA 확인 뒤 DONE.txt에 BLOCKED와 의존/수치를 쓰고 자기 worktree만 제거한다. R의 HEAD/branch/INDEX/WORK는 보존한다.
