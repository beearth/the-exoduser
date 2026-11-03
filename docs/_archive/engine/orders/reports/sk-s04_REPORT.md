# sk-s04 — 슬롯 읽기 모델·복사 미리보기 구현 보고

**SK-S04 구현·검수 완료 / 총괄 검수 대기.** 명시적 fixture/snapshot의 13슬롯 값·후보·장착 가능 여부와 복사본의 auto/repair/중복 제거 결과를 제공한다. 실제 P/G·SKILL_SLOTS·ULT_SLOT 권위 연결, 고정 Q/E/Shift/Ctrl 선택 writer, InputMap·UI·저장은 구현하지 않았다.

## 기준·의존·소유

| 항목 | 확인한 사실 |
|---|---|
| 작업 / 브랜치 / WT | `sk-s04` / `codex/sk-s04-20261020` / `~/exoduser-wt/sk-s04`. 신규 `worktree add --no-checkout -b` 후 non-cone sparse로 필요한 경로만 checkout |
| 최신 main | 명시 fetch와 원격 ls-remote 일치: `e556b617190c325ca39f5add04357f5dea5ca87e`. game.html 65692행 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; skill-forge.js 424행 SHA256 `ef68ac45d6d05805f7f088eba7a1daff2f1158fcdd6177f0a7f501ea3add11a0`. dependency WT의 두 원본도 최신 main과 byte 동일 |
| 선행 | SK-S03 `db880a18770af87bb3c72062d8144ee7243f1630`가 main에 없어 그 끝에서 분기. SK-S01→SK-S02→SK-S03 의존을 그대로 포함. 선행 카탈로그·합체 판정·원본 fusion 공급자 수정0 |
| 제품 / 테스트 | 신규 `godot/port_modules/skill_management_source/slot_rules.gd`, `godot/tests/test_trace_skills_s04_slots.gd` 및 각각 Godot 생성 `.uid` |
| docs | 본 보고서와 허용 CHANGELOG_SYNC 최상단 절만. 기존 추적 문서 SK-S04 계획행, 설계 docs·WORK_BOARD는 공용이므로 수정0. 이 보고서로 부분 구현 상태 전달 |
| 보호 | **native_skill_slots.gd 0줄**, main/hud/world/player/native_source_new_run_state/project.godot·S01/S02/S03/기존 fusion·기존 테스트 변경0. 실제 입력·P/G/저장·Q/E/blackBean·docs/2_3 불변. R branch/HEAD/INDEX/WORK 불변 |
| 종료 | 정상 훅 commit→자기 branch 비강제 push→원격 SHA 대조→Git밖 DONE.txt 작성 뒤 **자기 sk-s04 worktree만 remove --force**. branch·원로그·보고서 사본은 남김. 실제 SHA/제거 결과는 DONE.txt·git-final.json·cleanup.json에 기록 |

## 원본 → 구현 계약

| 최신 원본 행 | API / 정확한 의미 |
|---|---|
| game 44230~44237 | `is_area/is_rage/can_assign`: area=tech+act+!fixed; rage=giantSlam/giantSlam2 또는 cat rage. 등록/act/!ult/!fixed 먼저, area=5·rage=4·나머지0≤index<4. 보유·흡수·reqLv 검사와 구분 |
| game 44239~44244 | `find_auto`: 이미6칸 어디든 같은 ID 있으면−1; area→5/rage→4, 나머지0→3 첫 **null**. 빈 문자열은 auto 빈칸이 아님. 흡수/학습/reqLv 확인을 추가하지 않음 |
| game 44246~44274 | `repair_preview`: 원본 `_repairAreaSkillSlot`을 **호출자가 넘긴6칸의 복사본**에 재현. 5(F)→4(Space)의 잘못된 truthy 항목 수집/비움→0..3의 area/rage 이동→displaced 순서 재삽입. 넘친 항목은 슬롯에서 사라지고 원본 P/보유/레벨은 그대로. 유효한 일반 중복은 repair가 제거하지 않음 |
| Forge 17~24 | `read_definitions/read_model`: **1,2,3,4,F,Z,LMB,RMB,Shift,E,Q,Ctrl,Space** 순13개. F는 numeric index5, Space는4, ULT는 별도 인수. bow/T는 이13슬롯에 없으며 기존 L 팝업의 bow 탭과 별개 |
| Forge 57~61 | `slot_value`: numeric→slots[index], ult→별도 ultimate, fixed→명시적 P.active*Sk. source falsy→null, 미배정/미등록 String ID는 정정/자동 배정하지 않음 |
| Forge 62~69 | `slot_eligible`: fixed는 기존 SKILL_SLOT_DEFS skills순, ult는 registry ult순, num은 can_assign 허용순. 기존 S03 `is_absorbed`로 숨김; hidden && !level && !reqLv만 숨김. reqLv가 있는 burstLoop는 미학습/저레벨에도 후보에 보임 |
| Forge 70~75 | `can_equip`: fixed는 정의에 포함되고 미등록/학습≥1/6개 free ID면 허용; ult는 ult+학습≥1; num은 학습≥1→!is_absorbed→can_assign. **fixed canEquip 자체에는 흡수 gate가 없음**. reqLv·SP·실제 시전 gate를 새로 넣지 않음 |
| Forge 76~84 / game 44993~44996 | `equip_preview`: 숫자/ult만 **copy plan**. num은 같은ID의 모든6칸을 null로 지운 뒤 대상에 배치, ult는 별도값 교체. 거부면 입력값과 같은 복사결과. 고정슬롯은 `fixed_writer_out_of_scope` NOT_READY. refresh·dbSave·SFX 호출0 |
| game 44965~45007 | `numeric_popup_candidates`: L 선택슬롯 팝업의 canAssign→학습≥1→getAllAbsorbed 제외→fixedOnly15 제외 순서/집합. 표시/onclick/해제·저장 실행0 |
| game 46969~47083, 44322 | `fixed_popup`: 기존8정의의 L 콘텐츠 읽기 모델(fused/current/fusion_host/options/empty_locked). fused branch는 getAllAbsorbed+기존21호스트표를 제외, 일반 branch는 학습된 것만. 기본값·원본 호스트 누락/우선순위 보존. isDimBreach는 **dimBreach 한 키만** 확인 |
| game 47009~47019 | 기존 팝업 호스트표를 Forge/다른 owner의 호스트표로 합치지 않음. dimRush만 있으면 charge fused branch가 아니며, stormBurst만 있고 stormBeam/elemFuse/sixFuse가 없으면 magic 호스트는 원본대로 fireball |

`read_model`은 입력을 repair하거나 실제 owner를 새로 생성하지 않는다. Forge 86~114의 제단 staged set/recipe 배치·socket layout, confirm/equip 실행 UI는 S07 등의 후속 범위이며 이번13슬롯 조회 완료에 포함하지 않았다.

## native 경계·공용 접점

| 항목 | 계약 / 후속 연결 |
|---|---|
| 준비도 | 정상 unknown skill 판정 false/auto−1, 미배정 null은 READY/value. 상태 부재·지원 밖 carrier는 NOT_READY/reason/input(value 없음). 실제 미준비를 빈칸/0/false로 대체하지 않음 |
| 지원 입력 | String ID·해당 맵의 own String key, Array 정확6칸의 null/String(빈 문자열 포함). StringName/Object/prototype keys·숫자 slot value·다른 길이는 NOT_READY. JS prototype/getter/coercion 전체 지원은 미확인 |
| 수치 | finite int/float level, source falsy level→0. NaN을 포함한 source falsy 값은0이며, truthy 문자열/true/Infinity는 NOT_READY. can_assign은 원 비교식의 finite 숫자 지원(0.5·3.5도 일반 범위 true); 실제 equip은13개 key 중 하나라 분수 index 쓰기 없음 |
| 부분 입력 | Forge lv는 누락/원 falsy skills를0으로 읽고 free 고정값/미등록 기본기에 적용. 원 L 팝업은 P.skills 직접 읽으므로 명시 Dictionary 없으면 NR. 실제 사용하지 않는 원본 분기를 실입력 권위로 승격하지 않음 |
| 순수성 | borrowed P/skills/fused/slots 및 nested identity를 쓰지 않음. 공개 정의·read model·options·preview 배열은 새 복사. NOT_READY input은 진단용 원 입력이며 쓰기 핸들이 아님. Node/RNG/clock/State/DB/SFX/InputMap/실제 저장 접근0 |
| 후속 | S05 core가 자기 fixture의 numeric/ult plan을 소비 가능. 실제 배정/owner·refresh·저장은 S06, K/L 패널은 S07, native_skill_slots routing은 별도 담당 배정. Q/E 고정 목록의 조회를 선택변경 승인으로 해석하지 않음 |

## docs 차이·원본 내부 차이(수정0)

| 항목 | 관측 / 이번 처리 |
|---|---|
| `docs/2_1…:348~357`, 기존 L 정의/Forge 키 | 문서의 과거 우클/마법/E 설명과 Forge의 RMB=activeRMBSk·E=activeMagicSk 표기가 공존. native 입력을 재배정하지 않고 원13개 descriptor를 그대로 반환 |
| 원본 세 가지 필터 | Forge eligible는 isAbsorbed 예외를 쓰고, L popup은 getAllAbsorbed union을 사용하며, fixed canEquip은 흡수 재검사 없음. elemFuse+stormBurst(단 stormBeam 없음)의 omniBeam이 서로 다를 수 있음. 동일 규칙으로 정리하지 않고 독립 API로 보존 |
| 자동/repair/직접장착 | auto는 중복 있으면−1·null만 빈칸, repair는 truthy 전용위치 우선/유효 일반 중복 유지, equip copy는 동일ID 전칸 제거. 저장 sanitization 전체를 구현했다고 주장하지 않음 |
| 기본/호스트 누락 | L rmb default shieldBlock은 원 정의 skills에 없는 값, charge fused 판정은 상위 dim 계열 전체가 아닌 dimBreach 한 키. 원 현행을 고치지 않고 oracle로 확인 |
| 추적 문서 계획 상태 | 원 SK-S04 행은 미착수 계획이며 공용 문서 수정 권한 없음. 실제 부분 구현/API/검증 상태는 본 보고서와 CHANGELOG에 기록. 다른 단위 완료나 UI 구현으로 승격하지 않음 |

코드 변경 후 docs 전체 관련 키워드 검색 **37일치행**을 `docs-keyword-matches.txt`에 보존했다. 수치·소유 범위 추가를 본 보고서/허용 CHANGELOG에 동기화했고 원본/기존 설계/공용 파일은 수정하지 않았다.

## 실제 검증

Godot 실행마다 정확히 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 수행,2이상이면30초 대기하는 순차 runner 사용. gate 관측은 `process-gate.jsonl`. Godot4.7.2 stable(기존 검증 바이너리) headless, 실제 제품 경로는 **SK-S03 dependency 기반 자기 sparse WT**다. latest-main 전체 runtime merge/rebase나 PC 실행 검증이 아니다.

| 검사 | 실제 결과 | 실제 user folder | stderr |
|---|---|---|---|
| `test_trace_skills_s04_slots.gd` | 12151단정/0실패, exit0 | `EXODUSER-sk-s04-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_trace_skills_s01_costs.gd` | 2033단정/0실패, exit0 | `EXODUSER-sk-s01-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_trace_skills_s02_catalog.gd` | 803단정/0실패, exit0 | `EXODUSER-sk-s02-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_trace_skills_s03_fusion_rules.gd` | 15020단정/0실패, exit0 | `EXODUSER-sk-s03-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_contracts.gd` | 5검사군/0실패, exit0 | `EXODUSER-sk-s04-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_p2005a_start_skills.gd` | 27단정/0실패, exit0 | `EXODUSER-P2005A-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005b_giant_slam.gd` | 12단정/0실패, exit0 | `EXODUSER-P2005B-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005c_spike_holy.gd` | 20단정/0실패, exit0 | `EXODUSER-P2005C-Isolated-20261020` | ERROR0 / WARNING1 |
| `test_p2005d_regen_wiring.gd` | 10단정/0실패, exit0 | `EXODUSER-P2005D-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005d_ice_orb.gd` | 22단정/0실패, exit0 | `EXODUSER-P2005D-Isolated-20261020` | ERROR0 / WARNING1 |
| `test_native_main_source_starter_state.gd` | 148검사/0실패, exit0 | `EXODUSER-MainSourceStarter-Isolated-20261014` | ERROR0 / WARNING1 |
| `test_native_source_player_regeneration_phase.gd` | 88검사/0실패, exit0 | `EXODUSER-SourceRegenPhase-Isolated-20261014` | ERROR0 / WARNING9 |

- 신규 **12151단정/0실패/skip0/Main0**. 61 ID×10 index, auto7배치, repair 명시6+결정적640 fixture, 합체 single32/누적32/예외 상태와 현재선택을 포함한73상태, fixed 보호·copy/순수성·미준비/미지원 경계를 검사했다. 전체 조합 전수나 실플레이 검수가 아니다.
- **원본 JS 함수/선언문 직접 발췌 실행**의 10716행과13개 descriptor 전체: 불일치0. 레시피/데이터는 원본 선언, Forge slotValue/eligible/canEquip/equip은 실제 함수 그대로. L popup도 실제 openSkSlotPop을 DOM stub에서 실행하고 값 관찰 hook만 추가했다(상수·조건·분기 변경0). 비교는 별도 Node VM, Godot 결과를 원본 기대값으로 사용하지 않음. API별 건수 `oracle-comparison.json`.
- 기존 웹 `node --test test/skillSlotEligibility.test.js test/skillForge.test.js`: **16tests/16pass/0fail/skip0, exit0**. 필요한 vendored three-r186·언어27파일만 sparse 추가. 원 테스트·support47파일과 두 원본이 pinned latest main과 byte 동일함을 대조했다. 웹 테스트 통과는 Godot UI/3D 구현 증거가 아니다.
- 기존 Godot 회귀11파일 모두 exit0/실패0/skip0/stderr ERROR0. P2005 5파일 **91단정**. b/c/d-ice는 dependency의 알려진 구 하니스 대신 **pinned latest-main QA002 테스트의 byte 동일 Git밖 사본**을 원 USERDIR 상수 그대로 실행(소스/기대값 수정0). 다른 기존 runtime 테스트는 main과 byte 동일함을 확인. S01~S03은 승인된 dependency 원본. contracts는 원 테스트 선택축소 없이 external 상속 harness에서 process-local 격리명만 설정했다.
- Camera2D warning 및 source-phase external/harness warning은 로그에 보존했다. 해당 하니스 결과를 full source authority/자연 플레이 PASS로 세지 않음. Main 회귀의 자기 override.cfg는 원래 부재로 복원, 전역 editor settings/project.godot 불변 확인.
- 원 asset/remap **949 tracked 파일 byte 동일** 확인 후 sk-s03의 파생 imported/class/uid cache만 재사용. 자기 WT import exit0/ERROR0, 신규2개 UID 생성. 신규 WT는 대형 웹 원본 자산 전체 checkout을 하지 않았고 종료 뒤 자기 WT만 제거한다.

## 실패 이력·선재 결함·미확인

| 항목 | 실제 기록 |
|---|---|
| 첫 신규 실행 | test의 class에 callv를 직접 호출한 parse error. exit0이어도 result null/stderr ERROR이므로 PASS 제외. test에 RefCounted instance를 만들어 동적 호출로 고침. `s04-first-parse-error.*` 보존 |
| 첫 독립 원본 대조 | 신규10789단정/0실패였으나 oracle가 charge popup **5행 불일치** 검출. 초기 구현이 isDimBreach를 상위 dim 합체 전체로 넓힌 오류. source44322 확인 후 dimBreach 단일키로 수정, 해당 경계2단정/누적상태/현재선택 fixture 추가. `s04-first-oracle-mismatch.*`, `oracle-first-mismatches.json` 보존. 원본/기대값 완화0 |
| sparse 도구 인수 | `sparse-checkout add --no-cone`는 현 Git에서 지원하지 않아 exit129, 파일 변경 없음. 이미 set --no-cone인 자기 WT에 정식 `add -- <정확 경로>`로 추가. 훅·검사 우회 없음 |
| 알려진 선재 결함(총괄 지시 원문) | “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)는 원문만 기록.” 이번에 로비 전체 회귀를 재실행하거나 수정하지 않았으며 PASS로 집계하지 않음. main 동일성/QA-005 진단 상태는 총괄 제공 정보, 이 작업의 독립 재검증은 미확인 |
| 미확인 | 실제 current P 권위·P2 입력 재배정·native 슬롯 배선·시전/자원차감·K/L/3D/저장·시각/청감·PC 동기화·자연 플레이 동등성. 승인 범위 내에서는 공용 수정 없이 완료 가능했음 |

인수 순서는 S01→S02→S03→S04. `~/exoduser-wt/_out/sk-s04/`에 원 stdout/stderr/engine log/meta(실제 argv·UTC·exit·시간·격리명·hash), 원본 byte·oracle 코드·실패 원문·최종 검사/commit/push/ref/cleanup/DONE을 남긴다. worktree 제거 뒤 보고서는 이 branch의 `docs/engine/orders/reports/sk-s04_REPORT.md`와 Git밖 byte 동일 사본에서 읽는다. main push/force·타인 WIP stage·git add -A·훅 우회 없음.
