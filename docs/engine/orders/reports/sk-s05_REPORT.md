# sk-s05 — 학습·강화·합체·환불·일괄/추천 fixture core

**S05a~e의 독립 복사 core 구현·신규 검증 완료 / 회귀 인수는 BLOCKED.** 기존 얼음보주 회귀의 최초 종료 ERROR와 웹 추천 순서 선재1실패를 PASS로 처리하지 않는다. 다음 **SK-S06은 공용 State/main 수정이 필요하므로 사용자 지시에 따라 여기서 중지**한다. 순서안 전체가 끝난 것은 아니다.

실제 current P/G·자원/슬롯 권위에 연결하지 않았다. READY의 `applied`는 **복사된 원장 진행**이며 실제 게임 commit이 아니다. `runtime_writer=NOT_IMPLEMENTED`를 항상 반환하고, 보호 active 슬롯 변경은 실행 가능한 fixture 패치에서 제외한 **별도 제안 데이터**다. 기본 shieldFuse 전용 reset은 명시 NOT_READY/HOLD다.

## 기준·소유·제출

| 항목 | 확인 결과 |
|---|---|
| 작업 / 브랜치 / WT | `sk-s05` / `codex/sk-s05-20261020` / `~/exoduser-wt/sk-s05`. 신규 no-checkout WT 뒤 필요한 경로만 non-cone sparse checkout |
| 최신 main / 선행 | fetch와 원격 ref 대조 main `e556b617190c325ca39f5add04357f5dea5ca87e`. SK-S04 `fc24b88606317bfc20c841270741d8fb9b4de03a` 미포함이라 그 끝에서 분기. S01→S02→S03→S04→S05 순서로 인수. game.html 원본은 latest main과 byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 신규 제품 | `skill_management_source/learn.gd`, `upgrade.gd`, `fuse_commit.gd`, `refund.gd`, `batch_recommend.gd`; 전용 내부 `core_support.gd`. 각 Godot 생성 uid 포함. 기존 cost_source/CATALOG/fusion/slot 공급자 재사용·수정0 |
| 신규 테스트 | `godot/tests/test_trace_skills_s05_core.gd` + uid. 계획의 a~e 개별 파일 대신 단일 격리 suite 안에서 a~e 검사군을 분리해 실행. 실제 격리명은 최신 지시 `EXODUSER-sk-s05-Isolated-20261020` |
| docs | 본 보고서와 CHANGELOG_SYNC 최상단 허용 절만. 기존 설계/추적 문서·WORK_BOARD 등 공용 docs 변경0. 최신 main의 추적 문서는 Git밖 byte로 읽음 |
| 보호 | **native_skill_slots.gd 0줄**, 기존 tracked Godot script/module/test·project.godot·game.html **313파일 hash 불변**. main/hud/world/player/State·P2-005/기존 S01~04/QS 파일 수정0. R branch/HEAD/INDEX/WORK 불변 |
| 종료 | 정상 훅 commit·자기 branch 비강제 push·원격 SHA 일치·DONE.txt 작성 뒤 자기 sk-s05 WT만 remove --force. branch/원로그/보고서 사본 유지. 실제 SHA·수치·정리 결과는 DONE/git-final/cleanup 기록 |

## 원본 → core 계약

| 단위 / 최신 game.html 행 | 정확한 구현·보호 경계 |
|---|---|
| 공통 / 3913~3930 | S01 SP reader 그대로 재사용: 일반1SP, 합체 base+member/star−1, cur≥9 cap(4성 이상8·2성 이상6), 습득SP+강화분 누적. 새 SP 공식/레시피 authority 생성0 |
| 악의 / 28080~28085 | registry의 정수 원가만 `0이하→0, 양수→max(1,ceil(raw×.5))`. QS-01은 latest-main potion_recovery_source에 `_malCost` API가 없으므로 새 **전용 내부** reader에 원식을 이식. QS 소유 파일/전역 할인수치 변경0; 전체 JS Number coercion 지원을 주장하지 않음 |
| S05a / 47274~47294, 47743~47748, 47768~47793 | `learn.ui_gate`는 _skCtx.canLearn의 미보유/requires/reqLv/SP/악의구슬. `preview(mode=ui)`는 구 row의 visibility도 확인, `direct`는 미학습 handler의 자원 gate만, `auto`는 _learnSkillAuto 그대로(보유/req/reqLv 재검사 없음). 이미보유 direct는 upgrade 경로이므로 명시 NR; auto는 중복 호출하면 원본처럼 Lv1·재과금 가능. 추천 caller가 중복을 막음 |
| S05a 슬롯 / 47279~47292 | chainAssault 습득→chainSlam 없을 때1 부여, 원 active 변경은 shadow에서 계산 후 제안으로 분리. getAllAbsorbed는 numeric6칸만 해제(여기서 ULT 자동 해제하지 않음). ult는 빈 경우만, 일반 act는 S04 auto 규칙. 실제 입력/소유 슬롯 쓰기0 |
| S05b / 47678~47765 | 원 _skCtx의 **62개 bool 조건과30개 선택 우선순위**로 host/group 감지(원 source에서 기계적으로 옮김). `context`는 learned/lock/fusion_key·표시SP·canUp. bladeEcho의 별도 합체 강화 분기 누락도 유지. 신규 요구조건 추가0 |
| S05b / 47794~47817 | `upgrade.preview(ui/direct)`는 max20, 일반 lock=min(20,ToInt32(P.lv/50)+1)·SP/악의, fused는 멤버 최소Lv 및 max로 처리. **표시 비용은 star override, 실제 fused 강화는 멤버수**. direct fused handler에는 player lock/minLv 재검사가 없음. ui는 context/구 row gate로 거부 가능. shieldFuse도 readonly 수치 projection만, 실제 Q/E 강화 적용 없음 |
| S05c / 47235~47272 | `fuse_commit.preview`: 기본 guarded는 S03 canFuse(full/demo)를 먼저 확인; direct는 원 _execFuse의 caller가 검사했다는 가정을 유지. **star×3 선차감 gate→멤버 강화분 환불/Lv1→fused→stormBeam 히든2종→흡수 슬롯/ULT 해제→별도 host auto표→active 동기화 제안**. 환불로 gate를 소급 통과시키지 않음 |
| S05c 원 누락 | dimRush/bladeEcho의 auto host 누락·bladeEcho 흡수[]·여러 호스트표 차이를 정리하지 않음. guarded는 이미완료/unknown을 거부하나 direct의 재호출 과금·unknown0원가 flag 생성은 원본대로 복사 projection에만 남김. 실제 shieldFuse 생성/보호 active writer는 연결하지 않음 |
| S05d / 47819~47882 | `minus_preview`: lv≤1 유지. 실제 _fused **삽입 순서**로 포함 그룹 중 멤버수가 가장 큰 첫 그룹 선택→최소Lv−1→star 비용 환불. 그룹 min1이면 no-op. 일반 minus는 SP+할인 upMat 환불, 능력 보유를 해제하지 않음 |
| S05d / 47884~47954 | `reset_preview(confirmed)`: **GEM 정의 순서** 최대그룹→실제 활성 _fused 중 스킬셋이 겹치는 모든 그룹의 생성/강화SP 환불→그룹 멤버0·slots/ULT 해제→해당 flag들만 삭제. 일반 reset은 습득+강화SP, spikeTrap/kiSlash/fireball은 습득SP 제외·Lv1 유지. 일반 reset의 악의 반환0. cancel은 원본/복사 원장 진행0 |
| S05d 보호 | 선택 그룹 shieldFuse이면 `_wingStrikeLevel/_resetWingStrikeUpgrades` 담당 코드를 새로 복제하지 않고 **HOLD_protected_base_shieldFuse_reset**. 이 NR 계약 검사 통과를 해당 reset 구현 완료로 세지 않음 |
| S05e / 47192~47233 | `batch_preview`: 활성 그룹을 멤버수 내림차순(동률은 JS stable sort의 원 순서)→전부 claimed면 skip·일부만 겹치면 원본처럼 처리→멤버수 SP 강화→미claim 습득/up 개별 강화. player lock/max20·SP·현재 upMat0의 무료 악의 gate. source에는 별도 gem minLv gate가 없음 |
| S05e / 47299~47326·44094~44110 | `recommend_preview`: 기존 **15단계** 선언순, 보유면 skip·reqLv 부족 skip·부분 진행, pick은 해당 ult 중 보유가 없을 때 첫 blackStar, demo22 canFuse 후 동일 fuse shadow core. 강화는 안 함. 반복 추천 SP/악의구슬 추가 과금0 검증 |
| shadow active / 44644~44661 | 원 sync host whitelist/기본값/RMB reset을 내부 deep copy에서 계산. finish는 input의 active8필드 값/키 부재를 fixture에 복원하고 변동만 `protected_active_proposals`로 반환. 실제 State patch/저장/QE writer가 아니다 |

`mode=ui`는 **구 row 초기 visibility + _skCtx 수치 gate** 범위다. 기본 Forge UI의 전체 표시/제단/확인창/입력/그리기를 구현한 것이 아니다. `_execFuse`의 G.shake, SFX, voice, text, transient 선택변수, refresh/dbSave는 원장 밖 효과이므로 실행하지 않는다.

## 입력·출력 계약과 미확인

| 경계 | 계약 |
|---|---|
| fixture | 명시적 `{p,g,slots,ultimate}`. p.skills·p._fused Dictionary, p.sp/lv·g.mats 필수. slots는 정확6칸 null/String, ultimate는 명시 null/String. P/G/권위 getter를 자동 생성/호출하지 않음 |
| numeric 지원 | 스킬level은 정수0..20, SP/mats/P.lv는 finite safe integer(native int/float). String/bool/NaN/Infinity·분수 스킬레벨·StringName/prototype key·비bool fused flag·누락 상태는 NOT_READY. 원 게임 상태를 clamp/정정하지 않음 |
| JS 연산 | SP/mats는 **복사 shadow에서 double Number 연산**으로 소비하여 각 연산의 JS 반올림을 유지, 원 입력의 int/float는 변경0. 안전정수 상한 입력3개 포함, SP/악의구슬 결과 **14620개 double bit** 독립 원본과 일치. 범위 밖 전체 JS coercion·object/getter는 미확인 |
| 결과 | READY/value에 fixture, applied(복사 진행), branch, details, protected_active_proposals, runtime_writer=NOT_IMPLEMENTED. NOT_READY/reason에는 value 없음. 실패·미준비를 성공/무료처리/기본 자원으로 대체하지 않음 |
| 순수성 | 원 p/g/skills/fused/slots 및 nested identity 보존, 반환값 변경이 원 입력/카탈로그를 바꾸지 않음. 실제 Main/Node/RNG/clock/InputMap/IO/DB/actor/피해/자원 owner 호출0. 내부 _apply_shadow는 prepare한 private copy용이며 live owner용 API가 아님 |
| 남은 실제 제품 | 실제 skills/SP/mats·일반slot commit, 고정 active 승인, shieldFuse 전용 reset, full UI·save·자연 입력·시각/청감·PC 동기화는 미구현/미확인. 신규 core 통과가 게임에서 학습/합체가 된다는 증거가 아님 |

## 실제 검증·회귀 인수 상태

Godot4.7.2 stable 원앱 headless. 매 실행 전 정확히 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`,2이상이면30초씩 대기(`process-gate.jsonl`). 신규 suite는 격리명/실제 user path·Main0·입력불변 단정. 기존 회귀는 각 파일 상수 사용, contracts만 원 테스트 선택축소 없이 external 상속 harness에서 process-local 작업 격리명 설정.

| 검사 | 실제 결과 | 오류·판정 | 실제 user folder |
|---|---|---|---|
| `test_trace_skills_s05_core.gd` | 9533단정/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s05-Isolated-20261020` |
| `test_trace_skills_s01_costs.gd` | 2033단정/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s01-Isolated-20261020` |
| `test_trace_skills_s02_catalog.gd` | 803단정/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s02-Isolated-20261020` |
| `test_trace_skills_s03_fusion_rules.gd` | 15020단정/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s03-Isolated-20261020` |
| `test_trace_skills_s04_slots.gd` | 12151단정/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s04-Isolated-20261020` |
| `test_contracts.gd` | 5검사군/0실패, exit0 | ERROR0/WARNING0 · PASS | `EXODUSER-sk-s05-Isolated-20261020` |
| `test_p2005a_start_skills.gd` | 27단정/0실패, exit0 | ERROR0/WARNING1 · PASS | `EXODUSER-P2005A-Isolated-20261020` |
| `mainqa-test_p2005b_giant_slam.gd` | 12단정/0실패, exit0 | ERROR0/WARNING1 · PASS | `EXODUSER-P2005B-Isolated-20261020` |
| `mainqa-test_p2005c_spike_holy.gd` | 20단정/0실패, exit0 | ERROR0/WARNING1 · PASS | `EXODUSER-P2005C-Isolated-20261020` |
| `test_p2005d_regen_wiring.gd` | 10단정/0실패, exit0 | ERROR0/WARNING1 · PASS | `EXODUSER-P2005D-Isolated-20261020` |
| `mainqa-test_p2005d_ice_orb.gd` | 22단정/0실패, exit0 | ERROR1/WARNING2 · **실행 PASS 제외** | `EXODUSER-P2005D-Isolated-20261020` |
| `test_native_main_source_starter_state.gd` | 148검사/0실패, exit0 | ERROR0/WARNING1 · PASS | `EXODUSER-MainSourceStarter-Isolated-20261014` |
| `test_native_source_player_regeneration_phase.gd` | 88검사/0실패, exit0 | ERROR0/WARNING9 · PASS | `EXODUSER-SourceRegenPhase-Isolated-20261014` |

| 신규 내부 검사군 | 실제 단정 |
|---|---|
| S05a_learn | 1288단정 |
| S05b_upgrade | 5320단정 |
| S05c_fuse | 998단정 |
| S05d_refund | 1283단정 |
| S05e_batch_recommend | 495단정 |
| boundaries_purity | 147단정 |
| isolation | 2단정 |

- 신규 **9533단정/0실패/skip0/Main0**. latest main의 **21개 핵심 원 함수+원 선언/slot helper**를 Node VM에서 직접 실행한 **9358행/불일치0**, SP/mats **14620개 IEEE754 double bit 일치**. _skCtx의 selected key·batch/추천 count 관찰 hook만 추가(원 조건/수치/쓰기 순서 변경0). UI/audio/save 서비스는 no-op이며 원장만 대조. source21함수의 원문과 비교 코드 보존.
- 최초 **기존 Godot 회귀12파일 중11파일은 exit0/실패0/skip0/stderr ERROR0**. ice는22단정/0실패/exit0이어도 **ObjectDB WARNING+resource ERROR1로 실행 FAIL**. p2005a~d 단정 합91/0만을 전체 회귀 PASS로 표시하지 않음. 같은 QA002 byte 사본의 verbose 진단은22/0/exit0/ERROR0이었으나 **최초 실패를 대체/삭제하지 않았고 원인·재현성 해결은 미확인**. QA/해당 owner 후속 필요 → 회귀 인수 BLOCKED.
- b/c/d-ice는 dependency의 구 하니스 대신 **pinned latest-main QA002 테스트 byte 사본**을 Git밖에서 원 USERDIR 그대로 실행했다. 다른 기존 Main 테스트는 main과 byte 동일, S01~04는 승인된 dependency 원본. 실행 제품은 **SK-S04 기반 WT**이며 latest-main 전체 runtime 회귀 PASS가 아니다.
- 기존 웹 `node --test test/balanceSkillUpgradeCost.test.js test/skillRecommendationOrder.test.js`: **5tests/4pass/1fail/skip0, exit1**. 비용4건 PASS, 추천 순서1건은 source15단계 vs 기대14단계. 최신 main의 원본2개/테스트2개 byte 동일 확인, 선행 추적 §6에도 같은 실패가 기록돼 있음. 기존 테스트·원본·기대값 수정0. 이후 assertion 도달은 미확인, 이 전체 suite PASS 아님.
- Camera2D·regen external/harness 경고는 원 stderr에 보존. 원 asset/remap949개 byte 확인 후 기존 자기 sk-s03의 **파생 cache만** 재사용, 최종 증분 import exit0/ERROR0. 자기 override.cfg 원래 부재로 복원, 전역 editor settings/project.godot/기존 파일 hash 불변 확인. 사용자 세이브/창 제어0.

## 실패 이력·docs 차이(수정0)·중지 경계

| 항목 | 실제 근거 / 처리 |
|---|---|
| 첫 신규 검사 | 9293단정/1실패, chainAssault를0SP 습득 가능으로 잘못 둔 fixture. 실제 spCost10이므로 **실제0원가 chainSlash**로 교체, 원 기대값을 할인/완화하지 않음. `s05-first-fixture-failure.*`와 그 시점 원본9118행/불일치0 자료 보존 |
| 큰 정수 검증 | 추가 경계3개가 NR가 되어9533단정/3실패. safe integer 상한을 float 리터럴 하나로 비교하던 구현을 int 상수/int 분기+명시 float 변환으로 수정, 최종 전체 신규9533/0. `s05-safe-integer-boundary-failure.*` 보존. 허용오차·원본 숫자 수정0 |
| QS-01 의존 계획 | 추적 S05a의 ‘QS-01 할인 의존’과 달리 현재 main의 QS-01 API는 물약회복/CD이고 malCost 공급자가 없음(원문 byte 보존). 기존 QS 파일을 수정/임의 이송하지 않고 이번 core의 registry 정수 원가만 원28080식을 소비. 전체 공용 할인 서비스 완료 주장이 아님 |
| 표시/실차감 차이 | stormBeam 표시star4 vs apply멤버6, siegeGhost 표시3 vs apply2를 보존. source direct fused handler에 lock/minLv 재검사가 없는 점과 batch 별도 minLv 부재를 계획상 자동 보완하지 않음. 실제 UI와 handler 차이는 별도 caller 계약 |
| 현재 upMat | 현55정의 upMat은0. 원식의 일반 minus 악의구슬 환불 계산은 구현했으나 **실제 양수 upMat 스킬의 자연 실행은 미확인**. 가짜 양수 registry 값으로 제품을 바꾸지 않음 |
| 기존 ice 종료 오류 | `mainqa-test_p2005d_ice_orb.err`: `2 ObjectDB instances were leaked at exit`, `1 resources still in use at exit`. 실제 최초 실패와 verbose 재현되지 않은 진단을 각각 보존. owner 공용파일/기존 테스트 수정 불가, 오류 원인은 미확인 |
| 이전 총괄 제공 로비 이력 | 이전 배정의 로비 전체8실패/QA-005 진단 중은 이번에 재실행/수정하지 않았고 PASS에 포함하지 않음. 그 상태의 독립 최신 검증은 미확인 |
| **다음 단위 중지** | main 추적문서 **184행 SK-S06**은 실제 State skills/SP/mats/slot writer와 main configure가 필요. 정확 접점은 native_source_new_run_state.gd·main.gd(추적§5). **공용/타담당0줄 지시에 따라 SK-S06 착수0·여기서 중지**, 순서안 끝 아님. `stop-boundary.json`에 원 행/근거 보존 |

코드 작성 뒤 docs 전체 keyword 검색69일치행을 `docs-keyword-matches.txt`에 보존했다. 원본 수치·기존 설계/추적/공용 docs 수정0, 이번 부분 구현/API·실패·HOLD·다음 경계를 본 보고서와 허용 CHANGELOG에 동기화했다.

원로그 `~/exoduser-wt/_out/sk-s05/`: 실제 argv/UTC/격리명/exit/시간/hash의 *.meta.json 및 stdout/stderr/engine log, source byte·기계적 flag 변환·독립 oracle·첫 실패 원문·ice 진단·보호 대조·정상 commit/push/ref/cleanup/DONE. 제거 뒤 보고서는 branch `docs/engine/orders/reports/sk-s05_REPORT.md`와 Git밖 byte 동일 사본으로 읽는다. main push/force·타인 WIP stage·git add -A·훅 우회0.
