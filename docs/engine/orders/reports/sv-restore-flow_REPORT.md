# SV-RESTORE-FLOW — 복원 순서·부분 실패 계산 인계

2026-10-20 KST · 작업ID `sv-restore-flow` · 브랜치 `codex/sv-restore-flow-20261020`

## 기준·범위

`git fetch origin main` 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 승인된 앞 단위가 main에 없어 SV-SHARED-READ tip `9bde0cfe8eb27da68460c678e43b4f6c1d1292eb`에서 분기했다. 선행 의존: SV-COLLECT `b8b8a8fa` → SV-TRANSPORT-READ `75c4d36e`/판정 `955f3573` → SV-RESTORE-PLAYER `c88014b6` → SV-RESTORE-ITEMS `9b5fdf46` → SV-SHARED-READ `9bde0cfe`. 앞 tip에 최신 main이 포함되어 있다.

지정한 `worktree add --no-checkout -b` 후 no-cone sparse로 필요한 텍스트·docs/port_modules/tests/data만 받았다. 약 **20MiB**이며 대형 에셋·전체 import는 없다. 이번 변경은 추적 문서 §4의 6번 **읽기·복원 순서와 부분 실패 계산만**이다. 실제 저장 쓰기·서버 호출·저장 형식·기존 마이그레이션 정책 변경은 없다.

## 변경 파일·API

| 파일 | 역할 |
|---|---|
| `godot/port_modules/save_adapter/source_restore_flow.gd` | 현재 snapshot·원본 표·보호 경계 관측으로 detached 계산. 단계별 trace와 중단 위치 반환 |
| `godot/tests/test_native_restore_flow.gd` | 지정 격리, 원본 단계별/2회 복원 대조, 불변·부분 실패·HOLD 검증 |
| `tools/sv_restore_flow_oracle.cjs` | 현재 checkout의 원문 선언·helper·복원 본문을 메모리 fixture에서 발췌 평가. 발췌 행/hash 기록 |
| `docs/CHANGELOG_SYNC.md` | 허용된 맨 위 기존 형식 절 |
| 이 보고서 | 범위·정확 계약·실제 수치·연결 HOLD 기록 |

`calculate(serialized, current, source_tables, observations={})`는 저장을 읽거나 쓰지 않고 **공급된 값**만 사용한다. `current={player,game,skill_slots,ult_slot}`는 원본 **3771행 직전**, 즉 선행 player/items/shared 계산 이후의 owner snapshot이다. 선행 모듈을 몰래 실행하거나 constructor로 대체하지 않는다. 입력 전체를 한 graph로 복사해 입력 사이 alias를 보존하고 결과는 입력과 분리한다. `plan.state`는 계산 결과, `plan.serialized`는 원문이 재바인딩한 fused/숙련도 사본의 변경 관측이다. 저장용 새 형식이나 serializer가 아니다.

`source_tables`는 `skills`(55개 id/cat/act/ult/fixed의 순서 있는 projection), `pairs`32개, `groups`32개의 구성 스킬, `slot_defs`8개, `absorbed`, `prof_cap`이다. 제품 파일에 임의 표를 등록하지 않는다. QA는 원본 선언/helper에서 추출해 공급했다. 실제 스킬·합체·성장 owner의 표 인수/연결은 HOLD이고, 표 누락·잘못된 타입은 HOLD다. 기존 player의 truthiness/문자열, items의 graph clone/JS key 순서, shared의 입증된 Number 변환만 읽기 전용 재사용했다. 기존 모듈 변경0.

## 원본 순서·값

최신 main과 `game.html/index.html/node-main.js/server.cjs` byte 동일. `game.html` SHA-256은 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원문 발췌별 정확한 행/hash와 fixture 결과는 외부 `source-oracle.json`에 있다.

| 단계 / 원본 game.html 행 | 계산 계약 |
|---|---|
| skills 3771–3780 | known id만 복원, 현재의 다른 키는 유지. 기존 chargeStock/chargeRange→chargeBoost max(1,oldRange) 표현식 그대로 |
| fused 3781–3782 → mastery 3783–3789 | truthy fused 재바인딩/아니면 {}, 네 숙련도 map은 저장 truthy 값/{} 재바인딩. skProf만 상한9999(44574) 초과 시 clamp, 음수·문자열 등을 미리 floor하지 않음 |
| fusion_repair 3790–3834 | kiSlash/LMB 초기 보정→삭제된 dimHalf/galeSlash→합체 보장→Lv300 blueShot/Lv700 burstLoop→holy 체인→제거 키→dim 체인→pairs 구성 스킬. **한 번의 원래 순서**, 반복 고정점 계산 아님. 높은 스킬 레벨을 낮추지 않음 |
| active 3835–3866 / active_ct 3871–3877 | charge/quakeStride·bow 삭제타입/합체 fallback→기본 spikeTrap/holyDome/giantSlam→tech/magic/LMB→보호 Q/E 경계→Ct 정의/미습득·timeStep 보정. 숫자/bool과 문자열의 JS 엄격 비교 차이 유지 |
| 보호 경계 3867–3870 / 3879·44644–44661 | Q/E inline 및 Q/E를 포함하는 active 동기화 helper는 새 구현 대신 owner 관측 필요. 그 뒤에만 slots로 진행 |
| slots 3881–3906 / helper44226–44274 | Array 앞6칸 truthy/null, truthy ult→chainStun rename(숙련도는 기존 chainAssault 덮음)→양방향 chain 보장→미습득·흡수·fixedKick 해제→일반0–3/분노4/영역5 repair→SKILL_LIST 순서 자동 배정. 여분 슬롯·중복 보존 등 원래 동작을 수정하지 않음 |
| sanitize 3499–3530 | SP/AP/mats와 skills finite floor/하한0→보호 WingStrike 관측→fused falsy/알 수 없는 조합 제거·group 우선/pairs fallback 구성 스킬≥1. JS Math.max(+0,-0)의 +0 보존 |
| 표·흡수 근거 | SKILL_LIST44161–44223, SLOT_DEFS44277–44316, GROUPS44324–44357, PAIRS44453–44486, absorbed44618–44628. 서로 다른 source 표/host 규칙을 하나의 새 정책으로 합치지 않음 |

예를 들어 holyWeak4만 있는 입력은 원문에서 이미 지나간 holyWeak2/1 분기를 되돌아 실행하지 않는다. 반복 복원 시 추가로 달라질 수 있는 값도 **2회 각각의 원문 실행**과 대조했다. active/slots를 먼저 sanitize하거나 최종 상태만 맞춰 중간 순서 차이를 숨기지 않았다.

## 보호 경계·부분 실패

보호 계산의 세 경계는 `protected_qe`, `protected_active_sync`, `protected_wing`이다. 관측은 각 `{state:"returned"|"source_throw",before,after}` snapshot을 명시한다. before가 현재 단계 사본과 정확히 같아야 하며, after는 해당 보호 경계의 허용 leaf 외 값을 바꿀 수 없다. inline은 Q/RMB, sync는 원 helper의 active7개, WingStrike는 maliceSwipe/shieldThrow·shieldFuse·RMB 관측만 통과한다. 보호 helper를 제품 모듈에서 구현·호출하거나 실제 Q/E writer를 설치하지 않았다.

- 누락/오래된 before/허용 밖 변경/비지원 leaf는 **HOLD**, 이후 단계 실행0·plan 없음이다. 보호 경계의 실제 owner 관측 없이 다음 값을 지어내지 않는다.
- 전달된 `source_throw`는 **SOURCE_THROW**, 완료된 trace와 관측된 실패 위치만 반환한다. 테스트의 경계 예외 입력은 **관측 전달 계약 시험**이며 원본에서 실제 예외가 발생했다고 주장하지 않는다.
- 비지원 Number/컨테이너를 만나면 HOLD. `partial_snapshot`은 **마지막 완료 단계**의 사본이다. 검증되지 않은 해당 단계의 scratch를 정상 복원값으로 반환하지 않는다. 보호 경계의 관측된 부분 예외는 허용 leaf까지만 담는다.
- 모든 결과 `calculation_only=true`, `partial_apply_authorized=false`, `write_authorized=false`, `storage_io=false`, `network=false`, `restore_connected=false`, `full_restore_verified=false`, `connection_status="HOLD"`이다. READY도 이 입력·관측에서의 계산만 뜻한다.
- player 없는 슬롯 메타/falsy payload는 REJECTED이며 새 게임 생성 호출 없음. truthy 비객체 player 등 잘못된 carrier는 HOLD이고 신규 메타로 바꾸지 않는다. `{player:{}}`는 원본 admission처럼 계산 가능하지만 full save 검증을 뜻하지 않는다. 원본 admission의 charIdx 선택은 이번 계산 범위 밖/보호다.
- 지원하는 skills/fused/숙련도 carrier는 plain Dictionary다. 원문에서 가능한 다른 truthy scalar/Array 형태, 순환/비JSON/StringName key, prototype 관련 key, 객체 ToPrimitive·큰 정밀 문자열/배열 Number·소수/안전정수 밖 숫자 property-key formatting 등 미입증 범위는 HOLD다. 정상 빈 객체나 저장 수리로 바꾸지 않는다. 숫자 NaN/Infinity/-0은 지원되는 계산 경로에서 원문과 대조한다.

## 실제 검증·실패 이력

Godot4.7.2/Node24.15.0. 신규 격리는 `EXODUSER-sv-restore-flow-Isolated-20261020`. 기존 회귀는 각 파일 USERDIR 그대로이며 매 실행 override.cfg를 설정하고 종료 후 **0byte**로 비웠다. 지정 pgrep predicate로 전역 count를 확인하고2일 때30초씩 대기한 기록이 있다. 자기 Godot는 순차1개, 다른 작업 프로세스 종료/조작0. 대형 에셋 import·Main 부트0.

| 실행 | 실제 결과 |
|---|---|
| oracle-setup | 원문 끝 anchor를 잘못 지정해 Node exit1. stderr 보존. anchor 수정 후 원문 추출 성공 |
| flow-attempt1 | **759,567검사/137실패, exit1**, 엔진 ERROR/경고0. 새 dict key가 StringName이 되어 합체/숙련도 key 및 다음 graph 검사가 불일치. 명시 String key로 수정 |
| flow-attempt2 / attempt3 | 각각 **781,675/1, exit1**, 엔진 ERROR/경고0. 문자열 "0"의 sanitize가 -0을 남김. attempt3의 실패 snapshot으로 비트 차이 확인 후 +0 수정 |
| flow-attempt4 | **803,090/0, exit0**, ERROR/경고0. 314 fixture의 2회 원본 평가 일치 |
| flow-verified(확장 중간) | **814,958/2, exit1**, SCRIPT ERROR2. 숫자/bool active를 추가해 Godot의 문자열 직접 비교 오류 검출. 타입을 확인하는 JS 엄격 비교로 수정. 동 실행의 회귀2종은 아래처럼 통과 |
| flow-final / flow-source-verified | 각각 **819,262/0, exit0**, ERROR/SCRIPT ERROR/경고0. **321 fixture ×2=642 원본 평가**, 매 평가12단계 상태·최종 serialized/state 대조. 마지막 실행은 보호 call 행도 원문 그대로 발췌하여 provenance 보강 |
| 기존 test_native_save_contract | **3,023/0, exit0**, ERROR/SCRIPT ERROR/경고0. 격리 EXODUSER-sv-contract-Isolated-20261020 |
| 선행 test_native_shared_store_read | **149,486/0, exit0**, ERROR/SCRIPT ERROR/경고0. 격리 EXODUSER-sv-shared-read-Isolated-20261020 |

합체32키 truthy/falsy/문자열, 299/300/699/700, mastery9999 경계/문자열/배열, 삭제 키·one-pass holy, active fallback·슬롯 정의·숫자/bool, 슬롯 길이/중복/고정/흡수/전용칸/현재 여분 슬롯, NaN/Infinity/큰 수/-0, 혼합40건, 재복원, prefix 중단·입력/표/관측 불변·교차 alias 등을 확인했다. 검사 수에는 재귀 type/key/value/비트 비교가 포함된다.

oracle은 **실제 현재 source helper/본문**을 메모리 사본에서 평가한다. 제품의 보호 구현 완료를 주장하지 않으며, fixture에서 원문 보호 함수가 만든 before/after를 관측 계약으로 넘긴다. 슬롯·합체·sanitize의 비보호 계산은 Godot 결과와 모든 중간 단계에서 독립 대조했다. 실제 저장 writer/서버/사용자 저장 IO0. QA 출력 JSON의 binary64 태그는 테스트 전달용이며 저장 형식에 들어가지 않는다. 실패 로그를 지우거나 통과에 합산하지 않았다. 최종3종 결과는 `final-summary.json`에 모았다.

## 실제 연결 HOLD — 필요한 위치만 기록

| 필요한 인수 위치 | 상태 |
|---|---|
| `native_source_new_run_state.gd:115` initialize_new_run, :581 read_current_p/:175 read_current_g | 선행 계산 이후 **동일 live owner** snapshot/복원 writer 계약이 필요. 새 save writer·state 대입·constructor 재호출0, HOLD |
| `main.gd:137–163` source_state 초기화/bind, :176–183 refill/starting_skills | 기존 신규 실행 경로다. 저장 복원과 구분하여 선행 player/items/shared→이 flow→성장/자원 재계산 순서 인수 필요. 직접 수정0, HOLD |
| `native_source_new_run_state.gd:489–505` 신규 starting skills/고정 slots | 신규 전용 쓰기를 저장 복원에 재사용하면 저장 배치/Ct가 덮일 수 있음. 보호 Q/E·새 게임/기존 저장 분기 확인만 기록, 호출/변경0, HOLD |
| 원본 cloud62479–62517 | dbRestore false의 신규분기, loaded에도 기본 스킬/Ct iceOrb 보정, `!(saved&&saved.player)`일 때만 슬롯 강제. applyStats62511→HUD/slots→initStage62517 후 실제 표시 확인 필요, HOLD |
| 원본 local63959–64025 / web64108–64146 / demo62164–62201 | foundSave/loaded 및 fallback 차이, local은 미로드일 때만 슬롯·Ct, demo는 신규/선택 미습득일 때 Ct, web은 별도 후처리. applyStats64019/64140/62196·initStage64025/64146/62201의 실제 효과·최종 표시 미확인/HOLD |
| 보호 handoff·actual skill/fusion/mastery tables | Q/E/2_3 및 원 owner 계약 인수 전 실제 연결0. 이번 QA 관측을 실제 writer 승인으로 사용하지 않음 |

공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state), 타 담당·기존 테스트/모듈·원본4·기존 데이터·project.godot 직접 변경0. R tracked INDEX/WORK diff0. 전체 dbRestore/실제 플레이·화면/재시작·PC 동기화 완료 주장은 없다. 공용 파일 수정은 이번 순수 계산에 필요하지 않았다.

알려진 선재 결함 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 이번 전체 로비 재실행·수정·PASS 승격 없음.

관련 docs 전체 tracked 검색은 `related-all-tracked-docs-search.log`, 작업 전 근거와 source hash도 외부 보존했다. 기존 trace/설계/보호 문서·수치 변경0. root ignore test_*는 자기 신규 테스트만 명시 force-add하며 정상 pre-commit을 사용한다. 광역 add/main push/force push/훅 우회/바이너리 commit 없음.

원로그·명령·oracle·최종 summary·보고서 사본·push/원격 SHA 대조·정리 영수증은 `/Users/fordeargamers/exoduser-wt/_out/sv-restore-flow/`. 자기 브랜치 push·원격 SHA 일치·DONE.txt 기록 후 자기 worktree만 제거하고 브랜치를 유지한다. 최종 SHA와 제거 결과는 같은 폴더의 **DONE.txt**에 남긴다.
