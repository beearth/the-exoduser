# DEMO11-06 — 실제 복원 연결 BLOCKED / 보호 owner 인터페이스 요청

**BLOCKED: 실제 Player/INV/skills restore→start는 구현하지 않았다.** 부분 저장·부분 복원을 제품에 연결하지 않고 기존 fresh 부팅도 변경하지 않았다. 사용자 권한은 Main/State의 이 단위 범위이며 전투 핵심은 수정 금지다. 기존 모듈의 HOLD를 지우거나 fixture 관측을 제품 관측으로 쓰지 않았다.

| 기준·차단 경계 | 확인한 위치와 필요한 인계 |
|---|---|
| 소스·의존 | fetch origin/main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에 DEMO11-05 최종 `f2889355e42828780d902ac1546211f5da56f627`를 정상 merge한 `6949a2b1156fed795ce2646112ca041ad51992fe`. 부모 main→05 순서, rebase0. gap `61ab71be` DEMO11-06 행의 실제자원 writer 의존 확인 |
| 보호 복원 handoff 부재 | `source_restore_flow.gd:7,105–120`은 `protected_qe / protected_active_sync / protected_wing`의 정확한 before/after 관측 없으면 HOLD. 원본 G3867–3870(Q/RMB 복원), G3879(`_syncActiveSkAfterReset`), G3907(`_sanitizeCoreState`의 Wing 포함 후처리), G3483–3489(`_ensureBaseWingStrike`), G62493의 demo start 경계를 따른다. scripts/port_modules에 기존 fresh 시작 Wing 지급은 있으나 복원용 세 handoff 접점은 없음. PC owner가 detached state→before/after/state(returned/source_throw) 및 허용 leaf 변경을 반환하는 복원 API와 source known-key tables를 인계해야 함. identity 관측을 임의 생성하지 않음 |
| 실제 resource restore writer 부재 | `native_source_resource_authority.gd:259`의 initialization writer는 source packet/index·소유 initializer를 검증하는 최초 초기화 경로다. Q/E 비용, 레벨 회복, stage refill, regen setter는 복원 transaction 아님. `source_player_restore.gd:83–91`도 actor HP/ST·authority MP writer를 pending으로 명시. resource owner가 HP/mhp·ST/mst·MP/mmp·stR/mpR의 사전 검증→동기 일괄 commit→실제 readback을 제공해야 함. 실패 시 기존 값 유지·재진입/owner loss 거절, 새 캐릭터 생성/회복/비용 API 전용 금지. Main/State 허용만으로 resource authority 내부를 직접 쓰지 않음 |
| collector 전체 owner | `source_save_collector.gd:10,38–42,79–84`의 save_globals(QSLOTS/BAG_MAX/UPGRADES/POT_LV/SKILL_SLOTS/ULT_SLOT/_charIdx/CRYSTAL_DUST) 실제 현재 owner가 필요. State의 P.skillSlots/ultSlot만으로 나머지를 `{}`/0으로 대체하지 않음. 원본 G62131–62159 전체 literal이 수집돼야 game 저장 허용 |
| 공유 local IO | 05의 고정7키에는 공유 키가 없음. G3721–3752/48521–48553 및 `source_shared_store.gd` 계약: `hellcave_sharedStorage`/`hellcave_sharedMats`는 game payload의 storage{}와 별도 정본. 복원 transaction 경계와 위 인계가 확정되면 별도 allowlist/저장소로 구현할 수 있음. 이번에는 부분 IO adapter나 migration을 추가하지 않음 |

후속 인계가 도착하면 Main은 저장 로드/전체 계획 검증을 fresh 지급 전에 분기하고, 새 scene을 정지한 상태에서만 State·Player·INV·resource를 설치한다. 실패 scene은 폐기하고 loaded 실패를 fresh 성공으로 바꾸지 않는다. 독립 계산→전체 검증→commit→applyStats/initStage→최종 readback→start 순서를 닫아야 하며, 외부 IO의 복수 키를 단일 원자 transaction이라 주장하지 않는다. 공유 악의 max/창고 비었을 때만 1회 legacy 이관과 200캡은 기존 Shared 모듈을 재사용한다. fixture-only protected 관측으로 실제 start를 허용하지 않는다.

| 후속 State 계약(저장 대상) | 현재 기준과 복원 인수 조건 |
|---|---|
| DEMO11-20 XP | P.lv/exp/maxExp/sp/ap 및 _transLvDate/_transLvCount/_apBossCleared/_goddessGift/_passiveQueue→원본 player 키. 현재 main addExp는 기존 구현이며 20 후속은 기준 main 미인수 계약으로만 표시. META cap 식을 serializer에서 새로 만들거나 XP를 저장 시 재계산하지 않음 |
| DEMO11-21 INV | INV.bag/equipped/ossCollect, crystalBag/stoneBag/crystalDust·bagMax·upgrades·potLv·qslots. 후속 21 transaction 미인수 계약. 드랍 record/월드 오브젝트를 inventory 대신 저장하지 않음. 실제 State readback과 아이템 동적 필드 보존 필요 |
| DEMO11-16/17 skills | P.skills/_fused/_skProf/_fuseProfSec/_cardProf/_catProf, activeCharge/Bow/Tech/Magic/LMB/RMB/Q/CtSk, State P.skillSlots/ultSlot→원본 skillSlots/ultSlot. stats/passives·SP/AP·악의 G.mats도 동일 snapshot에 포함. 16/17 후속 writer는 기준 main 미인수 계약. 기존 fresh 지급 함수를 loaded 복원으로 전용하지 않음 |

검증은 원본 제한 행·실제 함수/호출점·git ancestry·보호 파일 hash 정적 점검이다. **Godot/테스트 실행0, PASS 수치 없음.** 런타임/테스트/Main/State/Player/resource/전투/저장 형식 변경0, 공용 파일별 변경 줄 범위 없음. 이번 커밋은 이 보고서·docs/15 보충 절·CHANGELOG 절만 변경한다. 사용자 First 저장 폴더 접근0, override 생성0, 틱 목록 API 추가0. 신규 격리 이름은 향후 실행 시 `EXODUSER-demo11-06-Isolated-20261021`; 이번에는 실행하지 않았다.

원로그 `~/exoduser-wt/_out/demo11-06/`: dependency-merge.log, start.json, source-boundaries.txt, runtime-audit.txt, docs-search.log, 제출/원격 확인/DONE. 자기 branch `codex/demo11-06-20261021`에 일반 push하고 원격 SHA 일치/DONE 뒤 자기 worktree를 제거한다. R HEAD/branch·tracked INDEX/WORK 불변. **이 제출은 차단 근거 인계이며 DEMO11-06 완료가 아니다.**
