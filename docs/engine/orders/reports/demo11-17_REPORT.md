# DEMO11-17 — K/L 학습·강화·환불 State commit

## 기준·구현

브랜치 `codex/demo11-17-20261021`. fetch main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에서 DEMO11-16 `3be8055f70bb79aee79c64254529494d24658365`를 정상 merge한 **`d4e71d79d97996dbb0662287cb2a1308d7b1de4c`**가 기준이다. CHANGELOG 충돌1개는 dependency의 추가 절만 앞에 붙이고 main 전체 바이트를 보존했다. merge-base/main SHA 증거는 원로그에 있다. rebase/reset/force/main push0이다.

Main 최소 호출 `request_native_skill_management({request_id,action,skill_id,confirmed?})`, detached `read_native_skill_management()`, 1인자 `bind_native_skill_management_handoff(Callable)`를 제공한다. action은 learn_up/minus/reset이다. SK-S01 cost·S02 catalog·S03 fusion 독해·S04 slot_rules·S05 learn/upgrade/refund를 그대로 사용한다. caller의 적용 패치는 거절하고 실제 현재 SP/악의/skill level/_fused·숫자/ULT·active data 제안만 State가 쓴다. UI 배치·K/L 키 선점·추천/합체 생성·전투 핵심·피해 경로·맵·저장·에셋 변경0이다. State의 기존 Dictionary/Array 참조를 유지해 기존 dispatcher/HUD가 같은 값을 읽는다.

## 공용 수정 구역

| 파일 | 기준→최종 줄 / 변경 범위 |
|---|---|
| `godot/scripts/main.gd` | 기존2267 뒤 최종2268–2290 **추가23/삭제0**. lazy service·request/read/bind 최소 호출만. 기존 함수 본문 무수정 |
| `godot/scripts/native_source_new_run_state.gd` | 기존488 뒤 최종489–566 **추가78/삭제0**. snapshot·policy 계산·owner/명령/재진입 검사·scope 제한 writer·최근32 commit 재시도 기록만. 기존 XP·cost·자원·피해 함수 본문 무수정 |
| 신규 독립 소비자 | `native_skill_management.gd`는 demand-driven 요청/후속 handoff/재진입·재시도만 담당한다. tick 함수0·목록 생성 API0. policy 본문·Player/World/ResourceAuthority·PC 전투 소유 파일 변경0 |

## transaction과 원문 근거

최신 main game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. source 비교기는 전체 파일을 스트리밍 해시하고 필요한 좁은 범위만 메모리에 추출한다. G3913–3931 SP 비용·환불, G28080–28085 악의구슬 할인, G47768–47816 학습/강화, G47819–47882 감소, G47884–47954 reset, G44644–44661 active 동기화를 기존 policy가 구현한다. source helper의 UI/audio/save만 외부 미집행으로 두고 resource gate/수식/ledger 원문을 실제 VM에서 실행한다. 기대값·기존 policy/테스트 수정0이다.

학습/강화는 UI 게이트를 따른다. darkPillar 예는 SP10·악의구슬50, Lv50에서 개별 강화1SP, 감소 시1SP 환불이다. 전체 reset은 SP만 반환하고 악의구슬은 반환하지 않는다. 기본 무료3종은 Lv1 유지, `shieldFuse` 전용 reset은 기존 명시 HOLD로 무변경 거절한다. 학습 때의 active 제안은 실행자를 새로 만드는 것이 아니라 P의 선택 데이터만 반영한다.

**한 transaction 실패 prefix**: 실제 원장→active 선택→slots를 반영한 뒤 최종 presentation handoff가 실패하면 `accepted:false, committed:true, status:COMMITTED_HANDOFF_FAILED` 및 반영 prefix를 반환한다. 이 경계는 원문의 최종 render/update/save(G47816/47882/47953)보다 ledger가 앞선 순서다. 이미 반영된 값을 rollback하거나 같은 요청 재시도에서 다시 차감하지 않는다. 원장 전 resource/정책/owner 거절은 committed=false·prefix=[]다. 중간 SFX 예외 등 모든 웹 helper 실패를 이식했다고 주장하지 않는다.

최근32 commit의 request_id+payload만 현재 실행에서 재생한다. 다른 payload로 같은 ID 사용은 거절하며 오래된 ID 재사용·저장 영속 중복 방지는 범위 밖이다. observer에는 detached receipt를 주고 그 호출 중 재진입은 원장 전에 거절한다. observer에서 후속 XP가 +3SP를 주어도 writer가 이후 SP/XP/lv/AP/자원을 덮어쓰지 않는다. UI handoff가 없으면 원장 commit과 UI/save pending을 구분한다. 실제 UI/audio/save는 실행하지 않는다.

K/L 원문에는 paused 차단이 없으므로 이 UI data transaction만 유효한 live owner에서 paused 중에도 허용한다. 기존 시전·ResourceAuthority API의 paused 가드는 바꾸지 않았다. cached replay도 live owner를 상실하면 거절한다.

## 검증·XP 순서

| 검사 | 실행 결과·한계 |
|---|---|
| 실제 Main 신규 | **100/0·SKIP/ERROR0**. 실제 새 게임 SP0→49회 실제 XP grant +147SP→학습/강화/감소/reset·슬롯/HUD 소비 원장, post-commit 실패 prefix·재진입·재시도·XP 후속 grant·paused UI·owner 상실 검사 |
| 기존 직접 관련 회귀 (각1회) | SK-S01 **2,033/0**, SK-S04 **12,151/0**, SK-S05 **9,533/0**, DEMO11-16 **393/0**. 합계 **24,110/0**, SKIP/ERROR0. 기존 테스트/기대값 무수정 |
| 원문 JS VM 비교 | SK-S05 **9,358사례/불일치0**, SP/악의 binary64 정확14,620개. 신규 실제 commit 원장 **8사례/불일치0**, currency 정확16개. Node는 명시 경로·배열 인자, source/log 스트리밍·UTF-8 출력, 큰 JSON 통째 출력0 |
| XP `726cf925` 별도 모델 | **16/0**, ERROR/SKIP0. source State 3-way 합성 충돌0, XP signal이 +3 지급 후 SP12를 보고 학습→SP2 유지, 재진입 XP 거절·동일 요청 재시도 무소비·환불 후 총12SP 확인. 제품 브랜치에 XP branch 반입0이며 실제 main 통합 완료 주장은 아님 |
| 실패 보존·격리 | 최초 신규94/0 뒤 paused 경계 추가에서96단정 중2실패 재현. 학습 전용 owner 가드 분리 후 실패 신규만 재실행. Node 추출 경계3931/47326 닫는 brace 누락 오류2회는 하니스만 교정·원로그 보존. Godot 매 실행 pgrep/2이상30초대기·신규 정확 격리명·기존 파일 상수·override 종료0byte. 기존 Camera2D 경고는 보존 |

XP 참조 full SHA는 **`726cf925e34c3e91ef226eff63c4e1599a2c6f9a`**이며 기준 main의 ancestor가 아니다. 원문+해당 State의 SP+=3이 heal/level-up signal보다 앞섬을 정적으로 확인하고, 검증용 프로젝트에만 3-way 결합해 actual Main SP 순서를 확인했다. 모델 파일·SHA·호출 순서·실행 로그는 원로그에 보존한다. 모델 실행 이후의 보정은 paused 진입 및 replay live-owner 검사뿐이며, SP writer 본문/XP 함수가 그대로임을 정적으로 대조했다. 제품 State의 XP 함수는 기준에서 바꾸지 않았다. 새 XP cap100/curve/handoff가 main에 통합됐다고 주장하지 않는다.

전투 함수·생성 에셋·UI 배치·저장 IO·신규 틱 검증은 추가하지 않았다. 헤드리스 검증은 실창/사운드/PC 개편 UI 인수와 구분한다. [2_1 스킬 문서](../../../2_1%20스킬관리+합체시스템+자원/2_1%20스킬관리+합체시스템.md)의 Native 계약과 스킬 추적/DEMO11-16 소비 접점 문서도 갱신했다. source pin 식은 재작성하지 않았다.

원로그 `~/exoduser-wt/_out/demo11-17/`. 정상 훅·경로 지정 stage→자기 branch push·remote SHA 대조→DONE 작성 후 자기 worktree를 제거하고 R의 HEAD/branch/INDEX/WORK 시작 값을 대조한다.
