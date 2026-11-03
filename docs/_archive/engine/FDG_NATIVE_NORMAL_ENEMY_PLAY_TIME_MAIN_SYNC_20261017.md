# Native normal hurtE play_time main/I/R 소스 통합 — 2026-10-17

이 문서는 인수된 시간 owner와 열두 번째 provider 등록을 메인 소스에 통합하는 경계를 기록한다. 실제 소스 정렬과 사용자 실행판 갱신·실플레이 인수는 서로 다른 단계다. 실제 commit SHA를 선행 선언하지 않으며 현재 결과는 아래 external receipt의 main/I/R HEAD·tree·branch·upstream을 따른다.

| id / 항목 | 통합 계약과 현재 한계 |
|---|---|
| 직전 공통 인수 | D9 d9b886cac8f569d363687cfa2bec7483e084f1db. 이 값은 직전 소스 인수 이력이며 이번 현재 main/I/R 정렬 SHA는 receipt 기준 |
| owner 입력 | local0a5dea9198a65557e5ba13880c678a8de1851d4c / remote66e1260a916d330b635607f6446c16899d4ac51e, 동일 tree51b2b820f51f8351278b76383a72e0763da17cf6. 서로 다른 parent와 기존 브랜치 refs는 보존 |
| 실제 입력 범위 | D9 대비 실제 NUL42: code3/docs39. 새 통합 정본1을 더한 최종 실제 범위는 NUL·tree 목록·receipt에서 확인하며 추정 개수를 검수 결과로 대체하지 않음 |
| source3 | godot/scripts/main.gd, native_source_new_run_state.gd, native_source_player_initialization_services.gd의 인수된 내용 그대로. 새 구현·동작 수리 없음 |
| registry | Services.get_normal_enemy_damage_provider_callbacks의 실제12/25·미13. 기존11 key 순서·el_mul 뒤 play_time: Callable(self, "read_normal_enemy_play_time") 한 entry, 동일 Services self·arity0. entry 생성 자체의 값 query0이며 기존 map getter·준비 guard 전체 순수성 인증 아님 |
| owner 지원·NR | finite native int/float, safe int ±9007199254740991의 local 부분지원. raw-0/type/ref/prefix 및 postloss read_result 보존, missing/unsupported/loss는 top value 없는 NOT_READY. 원JS clock identity·자연수명·증가 증거 아님 |
| 기존 검수 | owner 첫 격리34case477확인(설정163·행동314) 인수. 원정적17 중15통과2실패 wholefalse 및 별도2true, 등록 정적10, 문서 coverage 정적7은 각각 별도 증거. 이번 통합에서 재실행하지 않음 |
| V12 후보 | source3+첫parse2 인수, 첫11case43행동true/setup signedzero1false·exit1 전체FAIL 보존. 별도4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS만 한정. 소급 합산PASS·실제 고장주입·clock/자연MainState/JS/fullgame 증명 아님 |
| Git 보존 | local/API의 실제 parent·서로 다른 SHA와 동일 최종 tree를 receipt로 확인. main은 expected D9에서 ownerremote history를 포함하는 정상 FF만 허용. 오래된 local main·owner·integration branches와 R WIP는 보존, force/reset/amend/stash 정리 없음 |
| 현재 source 사본 | I: codex/mac-native-play-time-main-20261017, R: codex/mac-live-play-time-main-20261017, 각 origin/main upstream의 실제 정렬 결과는 receipt에서 확인. 미실행·실패 시 완료로 표시하지 않음 |
| 실행판과 별개 | 사용자 열린 앱·compiled export·PC 최신 실행판·실제 clock·자연 전투·실게임 인수 미확인. build/reload/import/PC 전달·V12 제품 copy·World hook·dummy13/25 gate 우회 없음 |
| 상태 문서 | [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md), [PC·Mac 소스 정렬 기록](FDG_PC_MAC_GIT_SYNC_20261016.md) |
| 실제 최종 증거 | [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
