# DEMO11-37 — 지역 gate·보스룸·최종 사망 이후 진행 인계

기준 `origin/main ac3764bfe5476b56e2f2388b1f2d9baeff731885`. DEMO11-35 `727f6a0225b6d2b1d72df5efa5d82071b15c6b53`와 DEMO11-38 `ae49b21c202d8a75426f5098d47b71ff04ee9147` 정상 merge 결과 `e7d855b64b0e4f8daaa316a0c5bdd246b46025fe`. main 코드·35 탄·38 종료 기능 모두 보존, rebase0. MAP11-01 `3c2b1ea45bd103564f03898c5000b4f78b87844d`는 Marker 계약만 읽었으며 지형·프리뷰·에셋 merge0.

| 인터페이스 / 원본 | 실제 구현·인계 경계 |
|---|---|
| `Main.bind_native_demo_arena_provider(provider:Node2D)->bool` | 실제 World 하위 provider의 `Markers/Entry`, `Boss`, `Exit`, `Return`이 모두 Marker2D일 때 최초1회 등록. 좌표 복제·맵 지형·콜리전 변경0. 노드 교체/해제·외부 provider 거부. |
| `Main.enter_native_demo_arena(provider,spawn_options:Dictionary)->Dictionary` | P3-003 live G의 `_bossUnlocked && _fbDone && on`을 소비. P3 kill/분모/FB 계산 복제0. G41869–41914. 기존 BC02 actor spawn에 si0·Boss.global_position 명시 전달, 성공 뒤 Entry로 이동·arena 상태 전환. `room/difficulty_index/stage_diff_offset`는 실제 호출자의 원 입력 필요. 실패/재진입/중복 spawn 거부. |
| `Main.bind_native_demo_final_death_source(owner:Node,event:StringName)->bool` | 실제 Main 하위 PC36/49 owner의 신호 **`(actor:Node,stage_index:int)`** 최초1회 연결. PC는 사망·피날레·부활 대기를 모두 해소한 뒤 emit해야 한다. 여기서는 HP/poise/사망 판정·부활 집행0. 다른 actor·stage·arena 이전·해제 owner·중복 신호 거부. |
| `native_demo_encounter.gate_ready / arena_entered(actor) / arena_exit_opened(marker) / reward_ready(record)` | P3 gate_opened 실제 신호 소비. PC 최종 신호 이후 G41820–41862의 bossAlive=false·사망시각·처치 보스 기록, Boss Marker 위치 chest를 기존 State drop 레코드에 실제 추가한 뒤 출구 개방/보상 표시 인계. 신호만 보낸 mock reward ack 아님. 새 드롭 저장소0. G16721의 미개봉 상자 Infinity 축출 우선순위를 기존 저장소에 보충. |
| `Main.leave_native_demo_arena(provider)->bool` | provider가 실제 Exit 접촉을 확인한 뒤 호출하는 경계. 사망만으로 clear를 emit하지 않음. G41920–41939 SP+10·90%킬 TA·G42024–42063 순수 결과/베스트 병합. 결과 시각은 사망 snapshot, TA 시각은 출구시각. 실제 G/P writer 성공 후 `clear_recorded(result)`→기존 `Main.native_demo_boss_defeated(0)`→DEMO11-38 clear/pause→next/demoEnd. 한 번만 기록. |
| 공용 수정·보호 | 의존 merge 뒤 대비 Main **+14/−0**, 119·338–340·2995–3004. State **신규32줄(1339–1370)+기존634 한 줄 수정**, diff +33/−1. State 기존 보상 저장소·같은 G/P를 사용하며 기록 key는 JS와 같은 문자열 `"0"`. 기존 피해·패링·HP/poise·Q/E·2_3·저장 IO/형식·웹 원본·맵0줄. 진행 SP는 P.sp이며 전투 ST가 아님. |

| 검증·판정 | 결과·한계 |
|---|---|
| 신규 원문/연결 | **148/0**, skip0·exit0·ERROR0. 원문 JS5함수 그대로 실행한120개 fixture의 score/rank/베스트 전체 필드 대조+실 Main/actor/State chest·중복/오류/38 clear→end. PC 최종 신호와 region/FB readiness는 명시 fixture이며 자연 사망 증거 아님. |
| 기존 직접 회귀 | 각1회 **262/0**: P3 실제9·38종료42(headless, capture 없음)·P2001C 보상45·34actor166(RNG 요청에 따른 단정 수). 기존파일 byte 무수정, skip0·ERROR0. 기능 합 **410/0**. 각 Main suite의 기존 Camera2D WARNING1 원문 보존. |
| DEMO11-35 미결 벤치 재측정1회 | **clean PASS: 260/0, exit0·skip0·ERROR/WARNING0.** 실제256탄·warmup30+물리240틱/120Hz·69120 motion calls. 단조 벽시계 mean **0.763442ms**, p95 **0.920ms**, max **1.512ms <8.333333ms**, service total183.226ms/wall span1995.397ms. 기존 bench byte무수정·재측정 정확히1회. 35의 빈색draw 오류가 이 실행에서0이며 미결 clean 판정 해소. macOS headless 서비스 예산이며 전체 Main/실창/Windows120fps 증명 아님. |
| 충돌 해소 | main과35의 CHANGELOG 양쪽 절 보존. 38과의 CHANGELOG/WORK_BOARD는 양쪽 기록, Main은 스킬음/종료 함수 모두, State는 자동물약/종료 writer 모두 보존. 병합 뒤 기능 제품 수정은 위 단위 범위만. |
| 잔여·완료 범위 | Main에 coordinator가 설치되며 실제 State/actor/종료 UI까지 독립 씬에서 확인한다. **MAP provider 설치·실제 Entry/Exit 접촉 전달과 PC36/49 최종 사망 producer는 후행**이며 자동 ready/가짜 사망 생성0. 자연 boss/source clock·전투 종주/사망·부활·상자 표시/개봉/loot·gate/입장 연출·실창/Windows 인수는 미확인. 새 맵에 이 계약만 연결한다. |

원로그 `~/exoduser-wt/_out/demo11-37/`. 새 테스트 userdir `EXODUSER-demo11-37-Isolated-20261021`, 기존 각 파일 상수(bench는35 상속). pgrep≥2이면30초 대기, 목록 생성 API tick0·새 상시 tick0. 관련 테스트 각1회, 실패만 재실행. 정상 pre-commit·경로 지정 staging·자기branch push/원격 SHA 일치·DONE 후 자기 WT 제거, R 불변 확인은 최종 DONE에 남긴다.

실패 이력은 삭제하지 않았다. 최초 import는 Main 추가 함수의 space/tab 혼용, 두 번째는 State 추가 함수의 같은 문제로 preload 실패했다(exit0만으로 통과 처리하지 않음). 해당 들여쓰기를 수정했다. 최초 신규 suite **148/120**에서 실제 연결26개와 isolation/oracle2개는 통과했으나 원문120개 비교는 Godot int/float Dictionary 타입 경계 때문에 실패했다. 하니스를 양쪽 동일 JSON 정규화로 고쳤고 전체 필드 비교·기대값/단정 수는 유지했다. 실패 재실행 전에 기록 key를 JS object와 같은 문자열0으로 명시했다. 실패한 신규 suite만 재실행해 **148/0**이며, 통과한 기존 회귀 반복0·벤치재측정1회다. 전체 최종 합은 기능410/0+벤치260/0이며 이전 실패/35 과거 수치는 합산하지 않는다.

원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`(최신 기준 main과 동일), index도 불변. 새 상시 tick0·목록 생성 API0, PC 피해/패링/HP·poise/부활/World/Player/BC actor·탄 코드는 의존 merge 결과와 byte 동일하다. 승리/clear SFX·네임카드/입장 시간 연출·실제 상자 개봉은 관련 owner의 신호 소비가 필요하며 성공으로 세지 않는다. 최종 SHA/원격 일치/DONE/WT제거/R비교는 원로그의 final-receipt.json과 DONE.txt에 기록한다.
