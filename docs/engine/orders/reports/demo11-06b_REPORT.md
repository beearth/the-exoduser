# DEMO11-06b — 실제 native 저장·비보호 복원 / PC 인터페이스 대기

Mac 분할 범위 구현. 보호 3단계는 **PC 인터페이스 대기**이며 loaded 게임 시작·전체 복원 완료를 주장하지 않는다. 실제 Main에서 collector→native IO→새 Main의 실제 Player/State/INV/resource 설치를 검수한다. `--demo11-storage=on` 또는 Main meta `demo11_storage=true`에서만 연결하며 기본 OFF 경로는 보존한다. namespace는 `EXODUSER-demo11-*`만 허용하고 First는 stat 전에 거절한다.

| 구현·근거 | 적용 경계 |
|---|---|
| 기준·의존 | fetch main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4` + 06계약 `0924b94aec152e59de08e504c4e74bca64fcabd4` 정상 merge `ffb92ed268a9d1b0c295c025ee691bbabac9e487`. 05최종 `f2889355e42828780d902ac1546211f5da56f627` 포함. rebase0 |
| 원본·재사용 | main game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. G3597–3908의 Player/INV/skills·공유·슬롯, G62131–62173 demo collector/save, G62479–62517 fresh/loaded 분기, G63949–63956 globals. 기존 SV Player/INV/collector/Shared 계산, restore-flow의 모든 비보호 stage, 기존 skill/item catalog 그대로 재사용 |
| load writer | State의 `validate_native_demo11_loaded`→`commit_native_demo11_loaded_once`만 새로 추가. 같은 stopped Player/Main/State/resource claim·1회/봉인·finite cap/rate 및 전체 shape 검증 후 callback/IO/await 없는 설치. 실제 actor HP/ST/cap·baseDef/speed, 기존 MP authority `_owned`의 MP/cap/rate를 여기서만 설치하고 기존 전투 writer는 무수정. 기존 dictionary identity 보존·raw grit/reward bags/INV/XP·학습 상태·슬롯·globals 반영 |
| 공유 IO·실패 | 05 adapter에 키/폴더/값 검증용 좁은 extension point만 추가. subclass는 별도 demo_shared_local_storage의 hellcave_sharedStorage/hellcave_sharedMats만 허용. 원문 array/scalar JSON, 동일 writer lock/temp/readback/rename 사용. Shared policy의 max 악의·빈 창고만 legacy 이관·200캡을 재사용, game.storage{} 유지. 전체 계획 검증→공유 commit/readback→State commit. IO 실패는 State 미설치, 재시도는 비가산/비중복 |
| fresh/loaded·save | 저장 없음/정상 char0 메타만 fresh, 손상·player null/array·읽기 오류를 fresh로 바꾸지 않음. loaded는 신규15장비/10가방·시작 스킬·stage refill을 건너뜀. PC 대기는 actor/world/Main 정지, 부분 상태 저장 차단. Main `save_native_demo11_current`와 05 lifecycle 3초 boot/30초 auto·10초 성공 간격을 연결, 실제 공유/게임 commit 뒤 성공 ACK. 실패 event는 known false settlement라 매 tick 재시도·unknown ticket 없음 |
| PC 호출점·필드 | demo_restore_flow.prepare의 protected_qe(activeRMBSk/QSk), protected_active_sync(activeLMB/Charge/Magic/Q/Ct/Bow/RMBSk 7개 leaf), protected_wing(skills.maliceSwipe/shieldThrow·_fused.shieldFuse·activeRMBSk). callback(before state, saved)→원본 owner의 before/after/state 관측, source _handoff 검증 그대로. 없으면 PC_INTERFACE_WAIT, identity 관측 제조0. 비보호 state는 검수 가능한 정지 상태이며 보호 순서 최종 결과는 미인수. 인계 후 저장 원본에서 새 scene 재구성 및 applyStats/initStage→start 인수 필요 |
| 공용 파일 줄 범위 | Main: 새110–122/138–148/188/211–216/246–253/362/1011, 분기151/167/191–197/202–206(기존 block 들여쓰기 포함). State: 끝1227–1312만 추가. Player/resource authority/전투 피해·회복·소모 경로/World/HUD0줄. 05 adapter13추가/7삭제(원래 allowlist/형식 유지). 새 3모듈·테스트·UID 및 관련 docs만 |

DEMO11-20 XP(lv/exp/maxExp/sp/ap·초월/queue), 21 INV(bag/equipped/ossCollect·crystal/stone·dust), 16/17 skills/fused/mastery/active/skillSlots/ultSlot·G.mats를 원본 저장 필드에 포함한다. 후속 writer는 기준 main 미인수 계약이며 기존 현재 State 필드로 검수했다. 저장 시 cap/비용/XP 식을 재구현하지 않았다. char0 외 atlas 전환은 HOLD다. 비보호 stage를 보호 stage와 독립 실행한 provisional 상태를 PC 정규화가 끝난 상태로 주장하지 않는다.

| 검사(관련 스위트 각1회, 실패한 신규만 수정·재실행) | 결과 |
|---|---:|
| 실제 Main collector/저장/새 actor 복원·실패 차단 | 34/0 |
| 원본 표·legacy200/비중복·실 lifecycle boot/auto/실패 settlement/회복·cap 검증 | 32/0 |
| 별도 Godot 프로세스 actual Main 재시작 복원 | 6/0 |
| 기존 DEMO11-05 adapter | 79/0 |
| 기존 SV collector / Player / INV | 36,204/0 · 78,620/0 · 126,863/0 |
| 기존 SV restore-flow / Shared | 819,262/0 · 149,486/0 |

최신 비중복 합계 **1,210,586/0**, ERROR0. WARN2는 fresh Main 실창 구성의 기존 Camera2D physics-interpolation 경고이며 신규·집중 실행에 각1개다. 재시작/기존 회귀 WARN0. 최초 신규17/1(loaded skills invalid_graph)과 진단1/1은 native StringName 키와 기존 SV 문자열 carrier 차이를 검출했다. 기존 collector의 명시적 detach를 재사용해 해결했다. 집중 최초32/3은 oracle @f64를 raw Dictionary와 비교한 하니스 문제였고 기존 정밀 비트 decoder 방식으로 해석 경계만 수정했다. 기대값·원본·제품 표 변경0, 수정 후32/0. 실패 로그 모두 보존하고 통과 합계에 중복 가산하지 않았다.

오류 주입은 공유 writer lock·손상 player JSON·손상 공유 JSON·잘못된 resource cap의 네 종류로 제한했다. 직접 재사용한 여섯 회귀 스위트는 각각1회이며 unrelated maps/전투/전체 회귀는 실행하지 않았다. 별도 프로세스는 실제 committed lv12·HP87/ST42/MP31·가방11·정지 gate를 다시 읽었다. lifecycle 집중 검사는 명시적인 가짜 clock만 전진시켜 실제 collector/파일 commit/재시도를 검증했고 벽시계 시간 경과로 위장하지 않았다. 목록 생성 API는 touched runtime 전체0건, tick hook도 기존 lifecycle pump 호출뿐이다. 성능 수치/Performance 지표/고정 N틱 벤치는 측정하지 않았다.

잔여 경계: PC 보호 3단계·최종 loaded applyStats/initStage/start·복원 화면/전투 검수는 대기다. 여러 공유 키와 game 키 전체가 하나의 원자 transaction은 아니며, crash 후 prefix가 남으면 다음 로드의 max/empty-only 정책으로 재시도한다. 키별 rename 가시성만 검수하고 전원 차단/fsync·Windows 실제 IO·적대적 경로 동시 교체는 미확인. stale 외부 lock은 자동 삭제하지 않는다. 기존 05의 요청 receipt 수명·16MiB 한계는 유지한다.

원로그 `~/exoduser-wt/_out/demo11-06b/`. 실행마다 정확한 pgrep/2이상30초 gate, 기존 테스트는 각 상수 격리명, 신규는 EXODUSER-demo11-06b-Isolated-20261021. editor/import도 이 격리명으로만 실행하고 override는 매 실행 종료0byte. 원본 asset bytes 수정0·생성 import 메타는 커밋하지 않음. R HEAD/branch·tracked INDEX/WORK 불변, 자기 branch 일반 push/원격 SHA/DONE 뒤 자기 worktree 제거.
