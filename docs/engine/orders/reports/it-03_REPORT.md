# IT-03 — 결정 품질 배율 인수 보고서

2026-10-20 KST · 작업ID `it-03` · **구현·지정 회귀 완료 / 총괄 검수 대기**. 기존 crystalEffects adapter의 품질 누락 보완이다. 소켓 배율/인벤 writer/세이브/실플레이 인수는 별도다.

## 기준·의존·소유

| 항목 | 실제 확인 |
|---|---|
| fetch/main | 정상 fetch와 main ref 명시 fetch 후 origin/main `284d7faf49295b2f5061937a47ce96038032ed3c`. IT-02 f7230588 ancestor 검사 exit1(main 미포함). 원격 IT-03 branch 없음 |
| 분기 | 사용자 지시대로 IT-02 끝 `f7230588f29f9dda3e8e944742bdaf6051981cde`에서 새 `~/exoduser-wt/it-03`, `codex/it-03-20261020`. IT-01 c01766e1 포함. 시작 tracked INDEX/WORK 차이0. **IT-01/IT-02 선행 의존**을 병합 담당에게 인계 |
| 지시서 | 최신 origin/main `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` §4.2 IT-03. 기존 player_crystal_resource_source/producer.gd mul 계산을 이번 단위의 명시된 수정 범위로 인수. 최신 작업판에 이 경로의 별도 진행 소유 충돌 행 없음 |
| 원본 | 위 main game.html 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. CRYSTAL_DEFS:15190~15209, CRYSTAL_STAR:15276~15282, crystalEffects:15289~15296, _qGemMul:15316 |
| 수정 범위 | 지정된 기존 producer, 신규 test_native_crystal_quality_effects.gd, 그 producer의 기존 전용 설명서(FDG_GODOT_PORT_PLAYER_CRYSTAL_RESOURCE_SOURCE_FIRST_20261013.md)의 현재 상태/공식, 이 보고서, 허용된 CHANGELOG_SYNC 최상단 절. 다른 모듈/테스트/데이터 변경0 |
| 경계 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 0줄. player_resource_parameters_source·item_quality_source·IT-02·생성기/JSON·다른 담당 파일0줄. Q/E·docs/2_3·원본 game/index·세이브 schema/복원 변경0 |
| P2-006a | 위 main tree와 분기 tree에서 native_world_drops.gd/world_drops/pickup_contract 경로 미발견. 해당 구현 이송·재작성·드랍/줍기 연결0. 보드 기록만으로 실제 파일 존재/검수 완료를 주장하지 않음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch codex/mac-live-play-time-main-20261017, HEAD dd49171c5b88e211575a41f185395d6c0a14b184. 시작·마감 tracked INDEX/WORK 차이0. R 파일/인덱스/브랜치·서버·열린 앱 조작0. fetch는 IT-02 worktree에서 실행 |

## 구현과 입력 계약

| 위치/항목 | 현재 동작 |
|---|---|
| 계산 | 기존 star_mul × (1 + enh×0.1)를 먼저 계산한 뒤 **IT-01 quality(cr.q).gem_multiplier를 곱하고**, 각 opts의 base×mul을 실행. 원본 곱셈 순서/18종×5성급/옵션 순서 유지. 품질 공식을 새로 복제하지 않음 |
| 품질 | q1→0.755, q50→1, q100→1.25. q 누락/null/0/−0→50; 이후1~100 clamp; q40.5→0.9525, 반올림0. q−1/101은1/100. 구아이템의 품질 누락은 기존 수치 그대로 |
| 정상 예 | cr_deep_well star0 enh0 q1: mp3.775/mpR0.02265; q100: mp6.25/mpR0.0375. star4 enh20은 mp113.25(q1)/187.5(q100). star2 enh3에 q누락: mp22.75/mpR0.1365, q100: mp28.4375 |
| 원래 빈 결과 | cr falsy·미등록id/성급은 q를 검사하기 전 READY_ORIGINAL_EMPTY/effects[] 그대로. 잘못된 q가 붙어 있어도 원래 [] 경로를 NOT_READY로 바꾸지 않음. legacy id 자동 마이그레이션 추가0 |
| 미지원/오류 | IT-01 subset 그대로 문자열/bool/Array/Dictionary·NaN/±Inf q는 NOT_READY, quality:reason, effects=null. adapter는 null을 넘겨 기존 SourceParameters가 crystal_effects_not_array/packet=null로 거절. 기존 SOURCE_THROW와 SOURCE_NON_FINITE enhancement 분류 유지. 전체 JS coercion 이식 아님 |
| 보존 | 기존 star 숫자문자열/enh coercion·반환 status/Array adapter 시그니처·resource/nonresource 분리·call log 유지. 새 q 필드·재료소모·RNG·캐시·스탯 writer·장착 UI·저장 IO0. SOURCE_FN은 최신 원본 행으로 갱신, 나머지 옛 행 근거는 최초 이식 이력으로 표시 |
| 홈 | socketMul 호출0, socketQ 읽기0. q100 홈을 fixture에 넣어도 결정 품질 배율만1회 적용. IT-04는 별도 배정 |

## 실제 검수·원로그

Godot `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. 원로그/명령 JSON/각 실행 override 사본/결과 JSON: `~/exoduser-wt/_out/it-03/`.

| 실행 | 결과 |
|---|---|
| 과부하 gate | 매 Godot 직전 지정된 pgrep/wc 실행. 2이상이면30초마다 재확인하고1이하에서만 시작. process-gate.jsonl에 UTC/count 기록. 자기 엔진은 순차 실행, worker_pool/max_threads=2. 타인 프로세스 종료0 |
| 격리 | 신규 EXODUSER-it-03-Isolated-20261020. effective custom setting2개와 OS.get_user_data_dir() 마지막 경로까지 단정. OUT/pure-project는 자기 worktree 소스를 symlink로 직접 읽음. Main0/user:// IO0. 매 실행 override 설정 후 finally에서0byte로 비움 |
| pure-01 | **7,731단정/0실패**,6그룹, exit0·stderr0·ERROR0. tables71, quality_boundaries39, source_matrix7560, empty_and_errors40, resource_consumer18, purity3. 18종×5성급×enh0/3/20×q8값=2160조합 포함 |
| source-comparison.json | **15,260비교/0차이**, 2,183입력/5,428효과값/원래빈결과9. compare-source.cjs가 최신 game 원문 CRYSTAL_DEFS/STAR/crystalEffects/_qGemMul을 VM에 직접 발췌 실행. 전체18테이블·5배율·옵션 순서와 **binary64 완전 일치**를 대조. native 수식을 JS로 다시 쓴 대조군 아님 |
| 자원 adapter fixture | 기존 SourceParameters.run_apply_stats를 호출. q100 mp6.25→mmp106, q1/enh20 st11.325→mst111, 원래 MP/ST 리젠 +value/60 및 cap 적용. apply_stats→invalidate→recalc 순서, null결정skip, 원래 배열 순서, 입력/중첩 참조 불변 확인. 후속 invalid q는 첫 packet 전체를 막아 fixture sink0회·부분쓰기0 |
| 구아이템 기대값 | q누락 cr_deep_well star0: mmp105/mst100/mpR0.0505로 기존 중립값 유지. 품질값이 있는 결정만 원본 품질 배율에 따라 달라짐. 실제 새 게임 초기화는 아래 관련 Main 그룹으로 별도 검수 |
| import-01 | exit0·stderr0·ERROR0. 이전 IT-02 자기 OUT 캐시를 IT-03 OUT에 **복사**한 뒤 실제 import로 갱신. 자기 godot/.godot는 새 OUT 캐시를 참조. IT-02/타인 캐시 쓰기0, 제품 project.godot 변경0 |
| it01-01 | **177/0**,6그룹, exit0·stderr0·ERROR0. 기존 파일 USERDIR EXODUSER-it-01-Isolated-20261020 그대로 |
| it02-01 | **2,205/0**,7그룹, exit0·stderr0·ERROR0. 기존 파일 USERDIR EXODUSER-it-02-Isolated-20261020 그대로 |
| contracts-01 | **5그룹/0실패**, exit0·stderr0·ERROR0. map/charge/projectile/pause_capture/damage 전체. 상수 USERDIR가 없는 기존 파일이므로 신규 작업 격리명을 사용, 실제 자기 godot 프로젝트에서 실행 |
| p2001c-01 | **40단정/0실패**, exit0·ERROR0·skipped[]·fallback=false. pure16/owner8/live16·forced_actor_fields19. 파일 상수 EXODUSER-P2001C-Isolated-20261020 사용. stderr598byte: 기존 Camera2D 경고·**ObjectDB 2 instances leaked at exit** 보존. 해당 경고 수정0 |
| initial-resources-01 | **48단정/0실패**, exit0·ERROR0. test_native_main_source_player_initialization.gd의 관련 shared_crystal_current_values 그룹만 실행. 파일 상수 EXODUSER-MainSourceInitialization-Isolated-20261014 사용. 실제 Main의 captured plan/current P/Player/Health/Attack/DEF가 같은 결정 합계를 사용함을 확인. 이번 관측은 _crystalStats 전부0, mmp/mp229·mst/st237·mpR/stR0.05(초기 장비 RNG의 해당 실행 관측값이며 고정 기대값 아님). 초기 q없는/빈결정 경로 영향없음. stderr536byte는 Camera2D 경고, 전체5그룹/실화면 인수 아님 |

순수/직접 대조와 현재 adapter 검수는 기술 범위다. 실제 화면·장착 UI·자연 플레이·성능·PC·사용자 세이브 왕복은 미검수. 새 테스트는 fixture sink에만 쓰고 live 상태에는 쓰지 않는다. 기존 회귀의 경고는 위 실제 결과와 원로그에 그대로 남겼다. 이번 실행은 실패/스킵0이며, 테스트 완료 뒤 수정은 이력 주석과 단정 설명 문구뿐이다.

## docs·Git·인계

- docs 전체 키워드 검색은 docs-keyword-paths.txt. 현재 품질 수치표와 원본 공식 일치, 과거 crystal 전용 설명서는 최신 IT-03 공식·입력 제한·보고서 링크를 추가하고 옛 행/검수 수치는 이력으로 보존. 다른 담당 설계 문서0줄.
- 수정 전 producer/전용 docs/CHANGELOG는 OUT/backup에 보존. CHANGELOG의 새 절 뒤 기존 byte 전체가 동일한지 검증한다.
- 테스트 외4경로 및 신규 테스트를 각각 지정 stage. 신규 테스트는 .gitignore의 test_*에 걸리므로 해당 파일 하나만 git add -f 사용. git add -A·hook 우회0.
- .githooks/pre-commit의 docs-sync-check를 정상 통과해 commit, 자기 codex branch만 비강제 push 후 원격 SHA 대조. main push/병합·force/reset0. 최종 SHA/수치는 OUT/DONE.txt 및 submission-receipt.json.
- 다음 작업 IT-04(홈 배율 합산)는 이번 범위에 포함하지 않았다. 총괄은 IT-01/02 선행 의존과 지정 producer의 소유 인계를 확인해 병합 검수한다.
