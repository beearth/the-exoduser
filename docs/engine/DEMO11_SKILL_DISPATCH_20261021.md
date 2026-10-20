# DEMO11-16 실제 슬롯 dispatcher 계약 — 2026-10-21

기준은 origin/main `aa1eaea5a1fa70b31eae6fd907662ee13471c08d`와 별도 지시서 `codex/demo11-gap-20261021`의 `61ab71be` §3 DEMO11-16 행이다. 지시서는 참조만 했으며 그 브랜치의 코드/WIP를 반입하지 않았다. 조건부 효과 ghostWalk/blackStar/lavaSummon은 같은 문서의 DEMO11-82/96/97로 구분한다.

`Main.dispatch_native_skill_slot(key)` → 실제 World/NativeSkillSlots → `native_skill_dispatch.select` → SK-S04 `slot_rules.slot_value/can_equip`, fusion absorbed 독해 → 기존 4cast 순서다. 1~4는 skillSlots[0..3], Space는[4], F는[5], Ctrl은 activeCtSk, Z는 ultSlot이다. 키 반복은 무시한다. 빈칸/미보유/부적합/흡수/paused/dead/fallen/ghostWalk/iceOrb 차단은 자원을 쓰지 않는다. Space 보주 파쇄는 슬롯 선택보다 우선하고 Ctrl 재입력 파쇄는 기존 실행자를 호출한다. 고정 4키는 새 게임의 현재 배정으로 유지된다. 실제 슬롯 변경 UI·저장·자동 repair writer는 이 단위에서 만들지 않는다.

비용은 `native_skill_dispatch.quote`에서 한 번 산출한다. 현재 passive/affix/legend 공급자는 Main의 좁은 reader로 읽으며, 공급자 미준비 시 0 폴백을 사용하지 않는다. giantSlam ST는 원문 G31960–31996의 `min(ToInt32(50*(1+.45*(lv−1))*stDisc),ToInt32(mst*.9))`, 악의는 G28080–28085의10(레슨0)이다. spikeTrap 악의5, holyDome0, iceOrb MP는 `ToInt32(50*(1+.35*(lv−1))*pMagicCost)`다.

기존 시전자들이 State의 `commit_native_skill_dispatch_cost`만 사용한다. State는 실제 owner와 악의를 검사하고 ResourceAuthority의 추가 메서드가 ST/MP 양쪽을 모두 검사한 뒤 이벤트·외부 호출 없이 함께 쓴다. 성공 뒤에만 악의를 차감한다. 기존 Q/E/회복/공격의 자원 API와 피해 경로는 변경하지 않는다. 현재 어댑터가 소유하던 쿨(gsl/gc/hd/io)을 그대로 유일 writer로 쓰고 HUD는 실제 슬롯 배정으로 이 쿨을 읽는다. giantSlam/spikeTrap 시작 쿨에 원문 G28065의 _cdRed를 반영하고 holyDome1800/iceOrb 파쇄 쿨과 기존 tick/영역 보너스는 유지한다.

**미연결 경계:** Main/Player 기존 LMB/RMB/Shift/Q/E 입력은 PC 보호 owner가 계속 소유한다. 이 경로를 공통 dispatcher로 넘기려면 PC가 현재 selection→기존 실행자 호출과 release/hold/시계 우선순위를 제공해야 한다. pStun 스킬 탈출의 poise4/poiseR0 역시 해당 owner 인터페이스가 필요해 이 dispatcher는 거절한다. 해당 입력·분노·방패·돌진·사슬·피해 경로는 수정0이다.

선택한 스킬에 현재 실행자가 없으면 `accepted:false, reason:executor_interface_required, skill, slot, protected_owner, ultimate`를 반환한다. ULT 두 종의 시전/피해를 기본 4cast로 대체하지 않는다. 조건부 DEMO11-96/97의 실제 실행자·동일 비용/쿨 인터페이스를 인수해야 ULT의 실제 효과가 연결된다. 전체 active/ULT 효과 완료로 해석하면 안 된다. 원문 `_dispatchSkillSlot`의 자동 repair/흡수 시 슬롯 writer, _addSkProf, 게임패드 autoAim·재지정 키·터렛 할인 context는 아직 인수하지 않았다. 유효한 현행 새 게임 배정/실행자 범위의 연결이다.

원문 근거: G12905–12923/12974–13020/13093–13120(선택·가드·CT), G13262–13301(입력), G28018/28041/28049/28065/28080–28085(공급자), G31960–31996(비용), G45512/46455–46456/46711(쿨). 피해는 기존 4cast가 기존 hurtE 경로를 호출하며 본문 수정0이다. 맵·UI 배치·원본 에셋 변경0이다.

검증과 공용 파일별 정확한 diff 구역은 [보고서](orders/reports/demo11-16_REPORT.md), 원로그는 `~/exoduser-wt/_out/demo11-16/`에 둔다. 헤드리스 입력 검증은 실창·사운드·PC 개편 UI 인수와 구분한다.
