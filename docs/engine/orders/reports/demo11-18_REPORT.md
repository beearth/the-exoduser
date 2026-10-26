# DEMO11-18 — 일반 데모 합체·흡수·성급·되돌리기 owner 연결

## 기준·범위

브랜치 `codex/demo11-18-20261021`. 최신 main **`33755331b161fc953e89ff9c53271210f1374289`** + DEMO11-17 **`c698aa862a699636b192cb738b5e530849e0cd5f`**를 정상 merge한 **`85e4485dccb65519b2f3c3e8a6ee64399dc27873`**가 기준이다. CHANGELOG 충돌은 main 전체 바이트를 보존하고 의존 DEMO11-17 절만 앞에 추가해 해결했다. 부모·충돌 원문·SHA 증거는 원로그에 있다. rebase/reset/force/main push0이다.

실제 Main/State owner에서 기존 `fusion_rules`/`fuse_commit`을 재사용한다. 새 키·멤버·명칭·성급·비용 식·policy 수정0이다. UI 배치·입력 키 선점·피해·방패·이동/돌진/사슬/Q/E/분노·맵·저장·원본 에셋 변경0이다. 합체 data flag 및 선택/흡수/슬롯을 반영하는 것과 실제 합체 효과 실행 인수를 구분한다.

## 공용 변경 구역

| 파일 | 기준→최종 줄 / 내용 |
|---|---|
| `godot/scripts/main.gd` | 기존2308 뒤 최종2309–2320 **+12/-0**. read/request/undo 최소 호출3개만 추가 |
| `godot/scripts/native_source_new_run_state.gd` | 기존506 뒤 최종507–517 **+11**, 기존537 뒤 최종549–551 **+3**, 기존563 뒤 최종579–582 **+4**, 합계 **+18/-0**. 실제 demo 조회·fuse 분기·효과 HOLD 인계 packet만 추가. 기존 SP writer/XP/전투 본문 줄 교체0 |
| 신규 독립 소비자 | `native_skill_fusion.gd`는 current snapshot→허용/흡수/성급 모델 및 guarded demo preview만. readonly 별 계산은 기존 `_fuseStar` provider를 사용. 직접 원장·actor·tick·피해 실행0 |

## 원본과 문서 적용

최신 main game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. G16646/16649의 일반 demo와 허용 목록, G44608–44616 `_canFuse`, G47235–47272 `_execFuse`, G47884–47954 reset, G44644–44661 active 동기화를 사용한다. source VM 비교기는 전체를 스트리밍 해시하고 선택 범위만 메모리에 추출한다. 기존 source comparator도 그대로 재사용했다.

일반 demo 원목록은22키/registry32키다. **dimThunder/dimRush/dimBlast, stormBeam/stormBurst, holyWeak1/2/3/4, timeStep 10키를 원문 분기로 차단**한다. G61969 demo-test 전체 허용 및 G62227 forge-lab 허용 확장은 일반 데모 owner에 반입하지 않았다. actual demo boot를 State에서 읽으며 caller가 direct/demo=false 등의 필드를 넘겨 우회할 수 없다. shieldFuse는 원본 허용22키에 들어 있지만 사용자 보호 지시로 생성·전용 reset을 별도 HOLD한다.

생성비는 기존 star×3SP를 **환불보다 먼저 지불**할 수 있어야 한다. 멤버 강화 SP/악의를 환불하고 Lv1·flag·흡수 슬롯·호스트 배정·active data 제안을 같은 DEMO11-17 State 원장에 반영한다. 별은 기존 innate/fused/display provider를 사용하며 siegeGhost는 멤버2개에 star3 override라 생성9SP다. 원문 현재 canFuse는 구성원 습득만 검사하므로 삭제된 선행합체/숙련도/동급 gate를 재도입하지 않았다.

되돌리기 API의 두 번째 값은 fusion key가 아니라 **host skill**이다. 기존 reset 정책이 선택한 최대 활성 그룹과 겹친 활성 그룹 전체를 원문 순서로 환불/해제한다. 확인 전 변경0, 전체 reset의 악의 반환0, shieldFuse 전용 helper HOLD를 유지한다. 자연 시작 iceOrb 같은 지급 스킬의 원문 그룹 reset도 acquisition SP를 환급하므로 임의로 실제 지불 이력에 맞춰 환불을 clamp하지 않는다.

[docs/2_1](../../../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md)의 “성급 규칙”과 “합체 추가 시 수정 체크리스트”를 확인하고 Native18 절을 추가했다. 체크리스트1~6 데이터표는 재사용/신규등록0, 7~13 UI는 PC 대기로 변경·인수0, 14~15는 기존 upgrade policy/State 경로를 재사용한다. 실제 합체 효과 발동 검수는 보호 owner HOLD다.

## 검증

| 검사 | 실제 결과·제약 |
|---|---|
| 실제 Main 신규 | **378/0·SKIP0**. 자연 XP +18SP→성분 학습10→iceMortar 생성6 및 원문 reset. registry32키 전체의 데모 허용/금지·SP선지급·흡수·성급, 실제 합체 commit23/거절54, 겹친 그룹 undo·paused/실패prefix/재시도·외부 owner·override 거절 |
| 합체 강화 인계 집중 검사 | **7/0·SKIP/ERROR0**. siegeGhost의 실제 강화비는 member2 기준2SP(표시 star3와 다름)라는 원문 정책 및 HOLD fusion_key 확인 |
| 직접 관련 기존 회귀 (각1회) | SK-S03 **15,020/0**, SK-S04 **12,151/0**, SK-S05 **9,533/0**, DEMO11-17 **100/0**. 합계 **36,804/0**, SKIP/ERROR0 |
| 원문 JS VM | 신규 실제 합체/reset **25건/불일치0**, currency 정확50개. 기존 S05 **9,358건/불일치0**, currency 정확14,620개. 집중 강화 원장 **1건/불일치0**·currency 정확2개. 합계 신규26건/52 currency. 기대값·원본·기존테스트 무수정 |
| 실패·실행 | 최초 신규2실행은 fixture의 dot 삽입이 StringName key를 만든 것을 원문 String carrier로 수정. 정책 거절 뒤 value를 읽던 하니스 ScriptError도 보존. 중단된 자기 headless만 SIGTERM하고 override를 비웠다. gate/최종 결과·실패 로그 모두 보존. 제품 policy·validation 완화0. 별도 집중 검사에서 upgrade 인계 key 누락1실패→details.fusion_key fallback 한줄 보완→해당 집중 검사만7/0 |

378스위트와 기존4회귀 후의 제품 보정은 새 HOLD metadata의 fusion_key fallback 한줄뿐이며 수식·원장·생성/reset의 기존 key는 그대로다. 최적화 지시에 따라 실패한 집중 스위트만 재실행했다. 각 단계의 State SHA·변경 전 사본을 원로그에 보존한다.

UI/data transaction은 demand-driven이며 새 tick 함수·목록 생성 API0이다. 관련 runtime 파일/원본/기존 policy의 byte를 대조했다. 매 Godot 전 지정 pgrep로2이상이면30초 대기, 신규 `EXODUSER-demo11-18-Isolated-20261021`, 기존은 각 파일 상수, override는 run별 생성 후0byte다. 기존 Camera2D 경고는 그대로 기록했다. Node 경로/원문/log/output은 명시 인자, 비교 output은 UTF-8 원로그에만 두고 큰 JSON 통째 출력0이다.

## HOLD·호출 지점

`read_native_skill_fusion(key).value.combat_callsite`와 commit 결과 `fusion_combat_handoff`는 status=HOLD, damage_execution=false, shield_execution=false를 반환한다. 생성/강화/감소/reset의 원장 경계에서 실제 전투 owner를 호출하지 않는다. shieldFuse 생성은 `HOLD_protected_shieldFuse_commit`, 기존 전용 reset HOLD도 무변경 거절한다. 향후 PC owner의 합체 피해/방패 효과와 해제/재계산 인터페이스 인수가 필요하다. UI/SFX/저장 집행과 실창 검수도 이번 완료 범위가 아니다.

원로그 `~/exoduser-wt/_out/demo11-18/`. 정상 pre-commit·경로지정 stage→자기 branch push/remote SHA 확인→DONE 작성 뒤 자기 worktree를 제거하고 R의 HEAD/branch/INDEX/WORK를 시작과 대조한다.
