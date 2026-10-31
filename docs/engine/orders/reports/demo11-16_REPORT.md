# DEMO11-16 — 실제 슬롯 dispatcher·기존 4cast 비용/쿨 단일화

## 인수 범위

브랜치 `codex/demo11-16-20261021`. **기존 4cast의 실제 슬롯 연결·비용·쿨은 구현했으며, 보호 active owner 인계와 미구현 효과는 HOLD다. 전체 active/ULT 효과 완료가 아니다.** 기준 지시서는 `codex/demo11-gap-20261021`의 `61ab71be` §3 DEMO11-16이다. 그 브랜치는 읽기만 했으며 코드/WIP 의존은 없다. ghostWalk/blackStar/lavaSummon의 효과 단위는 같은 문서의 DEMO11-82/96/97로 구분한다.

최종 기준 main은 `aa1eaea5a1fa70b31eae6fd907662ee13471c08d`다. 최초 일반 fetch가 제한된 ref 설정으로 main을 갱신하지 않아 `01051599`에서 착수한 것을 제출 전 ls-remote 대조로 발견했다. main ref를 명시 fetch하고 `git merge origin/main`의 정상 fast-forward로 수정했다. PC 메서드 캐시 최적화의 tested dependency 2파일이 달라져 최종 신규 검증만 최신 main에서 실행했다. 기존 5회귀는 01051599 기반에서 각1회이며 아래에 구분한다. rebase/reset/force/main push0이다.

Main 공개 API 및 1~4/Space/F/Ctrl/Z 실제 입력이 State의 현재 skillSlots/activeCtSk/ultSlot을 읽고 SK-S04 slot_value/can_equip·absorbed 독해를 재사용한다. 기존 4cast를 호출하고, HUD는 실제 배정에서 동일 쿨 owner를 읽는다. 비용은 현재 공급자→순수 quote→State의 악의오브 선검증→ResourceAuthority의 ST/MP 동시 선검증 후 무콜백 쓰기→악의오브 차감 한 경로다. 기존 피해 본문·hurtE/hurtP 경로·Q/E·이동/돌진/사슬/전격이동/방패/분노·맵·UI 배치·저장/에셋 변경0이다.

## 공용 변경 구역

아래는 최종 파일의 줄 범위이며 괄호는 기존 main 줄이다. 원본 diff는 `_out/demo11-16/shared-diff.patch`에 보존한다. 기존 줄 교체는 스킬 어댑터의 입력·비용·HUD에 한정하고, 나머지 공용 세 파일은 함수 추가만 했다.

| 파일 | 정확한 변경 구역·줄 수 |
|---|---|
| `godot/scripts/main.gd` | 2219–2247 추가29/삭제0. cost context reader·dispatcher 공개 API. 기존 전투 함수 무수정 |
| `godot/scripts/native_source_new_run_state.gd` | 479–488 추가10/삭제0. `commit_native_skill_dispatch_cost`만 추가. 기존 `_p/_g` 초기화·저장·다른 writer 무수정 |
| `godot/scripts/native_source_resource_authority.gd` | 185–200 추가16/삭제0. `commit_native_skill_dispatch_spend`만 추가. 기존 Q/E/피해/회복 API 무수정 |
| `godot/scripts/native_skill_slots.gd` | 추가62/삭제52. 최종2–3·31·119·147–172(기존2–4·119·147–159), 246–248/254–255/257(기존233–235/241–244/246–251), 322–323/332/334(기존316/325/327), 366–368(기존359), 529–545(기존520–536), 819–827(기존810–817). 입력/quote/commit/실제 idle 선검사/배정별 HUD만 |

## 근거·검증

최신 main game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원문 전부 출력하지 않고 스트리밍 해시와 G31960–31996/45512/46455–46456/46711 좁은 원문을 VM에서 평가했다. 선택·입력은 G12905–12923/13093–13120/13262–13301, 비용 context는 G28018/28041/28049/28065/28080–28085를 추적했다. 값·식의 상세는 [현재 계약](../../DEMO11_SKILL_DISPATCH_20261021.md)에 기록했다. Godot 비교용 정수 수송은 테스트 범위의 정확 정수이며 기대값을 제품 함수로 만들지 않았다.

| 검증 | 실제 결과·한계 |
|---|---|
| 신규, 최신 main aa1eaea5 | 393/0·SKIP0·72원문조합, 8.07초·exit0·ERROR0. 실제 Main/고정4키 포함 |
| SK-S04 회귀 (각1회, 01051599 기반) | 12,151/0·SKIP0 |
| 시작 지급/HUD·강타·가시덫/돔·얼음보주 (각1회, 01051599 기반) | 27/0·12/0·20/0·22/0. 기존5스위트 합계12,232/0 |
| 실패 보존 | Node 하니스 VM const 재선언/주석 뒤 brace 오류를 수정한 로그 보존. 신규 new-01은 G.on=false 하니스 진입 및 누락 원본 이미지2개로 단정3실패/리소스 ERROR2. 기존 intro owner begin/finish와 이미지 byte 참조 후 new-02 393/0. 제품 가드 완화0 |
| 보호·실행 | giant 피해 구간 및 physics tick/존 틱/파쇄/칼날 함수 byte 동일. 매 Godot 지정 pgrep gate·2이상30초 대기, run별 override 종료0byte. 신규 정확 격리명, 기존 각 파일 상수. UTF-8 fixture/OS.execute join/명시 node-bin·source-game. 기존 Camera2D physics interpolation 경고는 원문 보존 |

신규 검증은 원문 비용/쿨 72조합, 실제 Main의 1/Space/F/Ctrl 입력, 1→3 배정·HUD 쿨 이동, 중복/쿨 차단, 보주 재입력 파쇄, ULT 미집행·무소비를 검사한다. 핵심 거부 경계는 provider/선택, 외부 owner, ST 부족, MP 부족, 악의오브 부족 5종이며 자원 일부만 먼저 소비하지 않는지 readback으로 확인한다. 테스트 소유 슬롯 재배정·쿨 reset은 격리 Main의 fixture이고 제품에 테스트 override를 넣지 않았다.

## HOLD·PC 인터페이스 요청

`native_skill_dispatch.select`는 LMB/RMB/Shift/Q/E의 현재 선택을 읽을 수 있으나 실제 입력 소유는 `player.gd:414–469`의 `handle_native_input_event` 등 PC 전투 경로에 남겨 두었다. 이 보호 경로를 재작성하지 않고 공통 selection의 skill_id와 press/hold/release를 기존 실행자로 넘기는 인계, 취소/재입력·Space 분노 공존 우선순위, pStun 탈출 poise4/poiseR0 owner 인터페이스가 필요하다. 이 요청 없이 보호 active를 연결했다고 주장하지 않는다.

실행자가 없는 선택은 `accepted:false, reason:executor_interface_required`와 skill/slot/protected_owner/ultimate를 반환하고 비용·쿨을 만들지 않는다. ULT 실제 효과는 DEMO11-96/97 실행자 인수 후 같은 계약에 연결해야 한다. 자동 slot repair/흡수 시 슬롯 writer·_addSkProf·게임패드 autoAim/재지정 키·터렛 할인 context·실창/소리/PC UI 검수는 미인수다. UI 개편과 맵 제작은 하지 않았다.

관련 P2-005A/B/C/D 및 스킬 추적 문서는 당시 인수 이력을 보존하고 현재 계약 링크를 추가했다. 원로그는 `~/exoduser-wt/_out/demo11-16/`. 정상 훅과 경로 지정 stage→자기 branch push→원격 SHA 일치→DONE(구현/HOLD 구분)→자기 worktree 제거 순서이며 R의 HEAD/브랜치/INDEX/WORK를 시작과 대조한다.

## 성능 후속 — 같은 브랜치, 2026-10-21

명시 fetch로 최신 main `aa1eaea5a1fa70b31eae6fd907662ee13471c08d`를 확인하고 이 브랜치에 `git merge origin/main`을 실행했다. a894bf49가 이미 해당 main을 부모로 갖고 있어 결과는 Already up to date였다. rebase/force/reset0이다.

PC의 [틱 검증 비용 규칙](../../../12퍼포먼스·최적화/GODOT_METHOD_LIST_TICK_COST_20261021.md) §5를 점검했다. 이번 단위 5파일(Main/State/ResourceAuthority/스킬 어댑터/순수 dispatcher)은 목록 생성 API 호출0건이다. main의 QE adapter/resource regen adapter/source regen phase는 static arity cache miss 안에서만 최초1회 get_method_list를 계산한다. 이번 후속 런타임 코드 변경0이며 보호 owner를 수정하지 않았다. 전역 property/signal API 제거 검수로 확대하지 않았고 원 검색 목록은 별도 보존했다.

동일 최신 main에서 관련6스위트를 각1회 재실행했다: 신규393/0·slot_rules12,151/0·시작/HUD27/0·강타12/0·가시덫/돔20/0·얼음보주22/0, 합계12,625/0·SKIP0·최종ERROR0. 이 후속 수치는 위 최초 검사 시점의 기존 회귀5개를 최신 main에서 다시 확인한 결과다. 재실행 실패/기대값 수정0, 실행별 override 종료0byte다. 기존 Camera2D 경고는 원문 보존했다.

고정 물리 벽시계 벤치: 실제 Main, 정상 intro owner로 G.on=true, headless, 60Hz/time_scale1, 워밍업60틱 뒤 요청300틱/실제300틱. 총 **5004.509ms**, 물리1틱 벽시계 평균 **16.6817ms**, 같은 구간 render frame **719회**, frame당 벽시계 평균 **6.9604ms**였다. Performance API 사용0이다. 엔진의 60Hz 페이싱이 포함된 값이며 순수 CPU 비용/실창 FPS/PC 동기화 성능으로 해석하지 않는다. 변경 전 대조 벤치를 이번에 실행하지 않아 인과적 전후 개선 수치를 새로 주장하지 않는다.

후속 원로그·실행 인자·정적 감사·155파일 SHA·벽시계 측정은 `~/exoduser-wt/_out/demo11-16/perf-followup/`에 보존한다. 동일 브랜치 정상 push/remote SHA 확인 뒤 기존 DONE.txt에 새 SHA와 수치를 추가한다. 보호 active 인계·조건부 ULT HOLD 상태는 그대로다.
