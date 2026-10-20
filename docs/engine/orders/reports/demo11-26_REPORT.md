# DEMO11-26 — 수동 퀵슬롯 입력·호환 계약 조사

2026-10-21 KST. **BLOCKED — 입력 action/정책 확인 대기; 제품 구현 미완료**. 최신 main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에서 같은 날짜 브랜치를 생성하고 DEMO11-25b 최종 `a03a0cbc65e70274ded67f964c115ca1f6b9cea7`을 정상 merge했다. 의존 merge 결과가 곧 a03a0cbc이다(main이 이미 그 부모). rebase/force0. 사용자 수동 기능 배정은 인지했으나 “기존 BINDS 권위”에는 해당 action이 없어 임의 키를 추가하지 않았다.

| 접점 | 최신 원본·현재 native 근거 / 판정 |
|---|---|
| 입력 — 결정 필요 | G6188–6207 BINDS/BINDS2에는 물약/quickslot/slot1..4 action 없음. G13262–13268 Digit1..4는 skill 전용이며 빈 슬롯에서도 수동 물약을 호출하지 않음. G28622–28625 클릭도 스킬 배정 팝업. `useQuickslot` 정의 외 caller0. 기존 key를 재활용하면 입력 의미가 바뀌므로 연결할 action/키 또는 스킬 우선 fallback 정책 필요 |
| 기존 PC 입력 보호 | native `native_skill_slots.gd:120–126`의 skill_slot_1=KEY_1은 스킬 소유. Main `read_native_input_bindings`도 native default view이며 저장 BINDS/BINDS2 복원 권위가 아님. 이 파일/PC 전투 코드 수정0, 숫자키 탈취0 |
| 슬롯·count | G27680/63949의 hp1+빈3 슬롯, POT는 HP1종. 구 수동 G28202–28219는 HP일 때 count 감소/부족 gate가 아니라 G.mats1을 소모한다. count는 그대로 유지. MP/ST를 추가하거나 HP count를 차감하는 규칙을 만들면 원본과 불일치 |
| 수동 gate/산술 | G28203 idx0..3→s.type→slotCD→G.on/paused→POT lookup→mats>0→hp<mhp×.99→조건부통계→악의1. G28226–28231 CD는 장갑/벨트/pRegen **및 potionCdRed 최대.2**를 사용하고 최소6. 구 수동은 장비 raw에 unary+가 없으므로 QS-01 auto_cooldown 그대로 호출해서 결과를 같다고 할 수 없음. 회복량만 QS-01 enhanced_heal 재사용 가능 |
| 자동과 충돌 | 구 수동 G28231은 qsCooldown[idx]만 갱신, 자동 G35893–35910은 autoPotCd만 갱신. 같은 update에 HP 부족/악의가 남으면 두 경로 모두 발동 가능. 글로벌 공유 CD/한틱1회 잠금은 원본에 없음. 수동 때문에 25b의 CD/threshold/read 순서를 변경하면 안 됨 |
| HUD | G28267–28272 updateQS는 포션 슬롯을 빈 것으로 간주해 skill 우선 표시. G60307–60309 HP 안내 POT x.xs는 **앞4 hp 슬롯 qsCooldown** 중 첫 양수이며 autoPotCd가 아님. 새 수동 UI를 원본 현행과 동일하다고 주장할 수 없음 |
| 저장 인계 | G3554 `qslots:QSLOTS`, G3717–3719 기존 parser. truthy 배열은 max(4,len), null/primitive/배열 원소 또는 제거된 타입은 빈 슬롯, 허용 객체는 추가 필드/참조/원 count를 보존. native source_save_collector는 save_globals.QSLOTS를 qslots로 수집하는 기존 인계점. QSLOTS 인계를 위한 전역 전체 owner/실제 저장 호출·CD 저장 스키마 신설은 하지 않음 |

| 재개 입력·검수 경계 | 계획 |
|---|---|
| 사용자 확인 요청 | 기존 BINDS에 실제 있는 action 또는 새 action/키의 지정, 또는 “Digit1..4 스킬 우선·빈 슬롯에서만 수동 HP”라는 사용자 정책. 수동 기능을 보류하고 호환 상태/HUD/저장 인계만 할지도 확인 요청함. 아직 답변으로 취급할 결정 없음 |
| 구현 시 허용 범위 | 순수 수동 phase→State writer→기존 25b HP-only authority 재사용. Main 입력·틱 접점/State의 슬롯·CD 한정. 기존 PC skill 입력·이동/패링/방패/분노/hurtE/hurtP/docs2_3 변경0. 관련 HUD/collector의 정확 소유 접점은 확정 뒤 한정 |
| 검증 | source 숫자/읽기 순서 대조·key repeat/skill 우선·HP count 유지·독립 CD/동일틱 경계·HP99%·mats0·슬롯빈/삭제타입·저장 인계·HUD 선택순서 계획. 새 테스트 격리 `EXODUSER-demo11-26-Isolated-20261021`. 현재 Godot/실행 테스트0회이며 PASS로 보고하지 않음 |

원로그 `~/exoduser-wt/_out/demo11-26/`의 dependency.json/source-evidence.txt/fetch.log/merge.log. 현재 제품·테스트·공용·저장 변경0행. 공용 파일별 변경 줄 범위는 모두 없음. 최신 입력 결정 없이 기존 BINDS 외 키를 발명하거나 스킬 우선순위를 뒤집지 않는다.

제출 범위는 이 보고서·2_8 현황 주석·CHANGELOG_SYNC 최상단 절 3문서만이다. 입력 결정이 오기 전 수동 기능 복원/게임플레이 변경은 수행하지 않는다. docs-sync/정상 pre-commit·자기 branch push/원격 SHA·R 보호·DONE·자기 worktree 제거 결과는 외부 DONE.txt에 기록한다.
