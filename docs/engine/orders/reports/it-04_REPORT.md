# IT-04 — 장착 결정의 홈 배율 합산 인수 보고서

2026-10-20 KST · 작업ID `it-04` · **구현·관련 회귀 완료 / 총괄 검수 대기**. IT-01 홈 계산과 IT-03 결정 효과를 기존 자원 합산 경로에 연결한 단위다. 화면·장착 writer·세이브 인수는 별도다.

## 기준·의존·소유·복구

| 항목 | 실제 확인 |
|---|---|
| fetch/main | main ref 명시 정상 fetch 후 origin/main `284d7faf49295b2f5061937a47ce96038032ed3c`. IT-03 50d1a5a0의 ancestor 검사 exit1(main 미포함). 지시서 §4.2 IT-04와 최신 작업판 확인. 별도 resource/IT-04 활성 소유 충돌 행 미발견 |
| 분기 | 사용자 지시대로 IT-03 끝 `50d1a5a0f89becb38a2684a68576597d569a6869`에서 새 `~/exoduser-wt/it-04`, `codex/it-04-20261020`. IT-01 c01766e1·IT-02 f7230588 포함. **IT-03 및 앞 단위 선행 의존** 인계 |
| 디스크 실패 | 최초 full worktree add가 ENOSPC로 exit128. 구현 수정 전이었고 Git 자체 cleanup으로 불완전 디렉터리/등록 제거됨. 같은 새 branch를 --no-checkout→worktree-local sparse patterns→read-tree -mu HEAD로 준비, 초기 tracked INDEX/WORK 차이0 확인. 약1.6GiB. 타 worktree/R/사용자 자료 삭제0. checkout-failure.txt에 실제 실패와 회수 경계를 기록(전체 원로그를 위조한 파일 아님) |
| sparse 범위 | AGENTS·git hook/ignore/attributes·tools·godot·docs·game.html·img·engine만 실제 checkout. 대형 output/video/백업/루트 아트 사본 미배치. branch tree를 삭제/변조한 것이 아니라 sparse skip-worktree 상태이며 commit은 전체 부모 tree를 보존 |
| 원본 | 위 main game.html 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 합산27934~27939, socketMul15322~15326, 결정 효과15289~15296, 품질15316 |
| 소유 변경 | 지시된 기존 player_resource_parameters_source/producer.gd, 신규 test_native_equipped_socket_multiplier.gd, 이 대화에서 같은 아이템 담당이 작성한 기존 IT-03 test_native_crystal_quality_effects.gd의 통합 기대값8개·설명, 해당 resource 모듈의 전용 docs, 이 보고서, 허용된 CHANGELOG_SYNC 최상단 절. 총6경로 |
| 공용/타인 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 0줄. 다른 담당 모듈·테스트·JSON·장착/저장 writer 0줄. IT-01/IT-02/IT-03 결정 producer 변경0. Q/E·docs/2_3·원본 game/index 변경0 |
| P2-006a | 기준 main/분기 tree에서 native_world_drops.gd/world_drops/pickup_contract 경로 미발견. 해당 코드 인수/이송·드랍/줍기 수정0. 작업판 문구만으로 실제 파일 존재/검수 완료를 주장하지 않음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch codex/mac-live-play-time-main-20261017, HEAD dd49171c5b88e211575a41f185395d6c0a14b184. 시작·마감 tracked INDEX/WORK 차이0. 파일/인덱스/브랜치·서버·열린 앱 조작0. fetch는 IT-03 worktree에서 실행 |

## 구현 계약·원본 값

| 항목 | 정확한 동작 |
|---|---|
| 원래 순회 | AffixReader의 기존17슬롯 순서와 crystal 원래 ci를 유지. falsy 결정은 먼저 skip. item/ci/c를 내부 accumulate에 전달. 공개 PROVIDER_CRYSTAL_EFFECTS의 arity1과 원 c 참조·provider 키·packet/sink 시그니처 변경0 |
| 계산 순서 | **IT-01 socket(item,ci) → 기존 crystal_effects(c) → before+value×socket.multiplier**. socket은 해당 결정당1회 조회, 각 opts 효과에1회 곱함. IT-03의 star×enh×gem_quality를 복제/재적용하지 않음 |
| 홈 값 | socket1→1, socket100+gold crystal→3, socket100+silver/bronze→2. q41/silver 결정은 tier가 달라도 같은 grade로 판정. socket q 누락/짧음/null/0은1, 비Array socketQ도 원문 Array.isArray 경로대로1. IT-01 입력 지원 한계 그대로 |
| 실패 | socket 지원 상실은 socket_multiplier_not_ready@ci:reason. 기존 provider 부재/잘못된 packet는 원래 reason. 첫 실패 뒤 다음 결정 provider 호출 중단. NOT_READY/packet=null/첫 sink0회, 입력/P/인벤 변이0 |
| 수치 packet 검증 | 첫 테스트에서 provider NaN mp가 뒤 ~~에서0으로 숨겨져 dispatch되는 결함 발견. 합산 결과 finite 검사를 추가해 NaN/Inf·unknown stat·배율 곱/합 overflow를 crystal_sum_non_finite:stat로 거절. 정상 source 값에는 수치 보정0. 잘못된 외부 provider의 원래 NaN 부분쓰기는 지원하지 않는 기존 엄격 subset 경계를 유지 |
| 혼합 예 | 같은 ring1의 cr_deep_well q100/home100: mp6.25×3=18.75; q50/home100: mp5×2=10. 합계 mp28.75/mpR0.1725. ring2 cr_last_breath q1/enh20/home1: st11.325/stR0.06795. mmp/mp128, mst/st111, mpR0.052875, stR0.0511325(격리 fixture dex/int/affix/grit0) |
| 순수성 | plan은 입력/배열 길이/중첩 identity·현재 fixture P 보존, 반환값 수정이 후속 plan에 영향0. 실제 쓰기는 기존 run_apply_stats sink만. 신규 RNG·authority·timer·Input·UI·재료소모·schema/복원 변경0 |

## 검수·격리·실패 이력

엔진 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. 원로그·명령·실행별 override 사본·결과 JSON은 `~/exoduser-wt/_out/it-04/`.

| 실행/항목 | 실제 결과 |
|---|---|
| gate/격리 | 매 Godot 전 지정 pgrep/wc 확인,2이상이면30초 간격 대기. process-gate.jsonl에 UTC/count 보존. 자기 엔진 순차, worker_pool/max_threads=2. 타인 프로세스 종료0. 매 실행 override 설정 후 finally에서0byte |
| 신규 프로젝트 | OUT/pure-project에서 자기 worktree port_modules/tests/data를 symlink로 직접 읽음. EXODUSER-it-04-Isolated-20261020의 effective 설정2개와 실제 OS userdir 끝을 단정. Main0·user:// IO0·live 쓰기0 |
| pure-01 | **1,703/4, exit1**. 잘못된 nonfinite mp provider packet의 NaN이 ~~를 거쳐0으로 숨겨짐. source 합산부 finite guard와 지원 오류 검수 추가. 원로그 보존 |
| pure-02 | **1,713/0**,5그룹, exit0·stderr0·ERROR0. mixed13/source_matrix1621/empty_legacy30/errors_atomic45/purity4.18종×5성급×crystal q3×socket q3=810조합을17슬롯에 분산, multi-home/순서/정확1회곱/원 c 참조/잘못된후속packet 부분쓰기0 포함 |
| 원본 비교 | **15,523/0**,817개 equipped 입력·18키 각각 **14,706 binary64 합계 완전 일치**. compare-source.cjs가 최신 game의 실제17슬롯 합산 loop·socketMul·crystalEffects·품질함수를 발췌 VM 실행. native 수식을 JS로 재작성한 대조군 아님 |
| 비교 첫 오류 | serializer가 JSON 객체 키를 알파벳순 정렬한 것을 insertion-order 차이로 잘못 비교하여817개 key-order 실패. 수치14,706개는 처음부터 일치. 키 집합 정렬 대조로 비교기만 수정, 첫 결과 source-comparison-01-serializer-order-failure.json 보존 |
| it03-legacy-01 | **7,731/8, exit1**. 원문 IT-03의 '홈 미적용' 7개 수치와 provider 이전 오류 reason 1개가 이번 원본 홈 적용 단계와 충돌. 원본 파일/실패 로그 보존. 다른 담당 파일을 우회한 것이 아니라 **같은 아이템 담당이 이전 단위에서 작성한 소유 테스트**를 다음 행처럼 유지보수 |
| IT-03 기대값 갱신 | 순수 결정 품질/테이블/경계 검사는 그대로. resource fixture home100을 그대로 사용해 gold 결정mp18.75·bronze enh20 st22.65, regen0.05+0.1125/60 및0.05+0.1359/60, mmp118/mst122, socket 선행 오류 reason을 검증. q없는 결정도 authored gold home은×2라 mmp110/mpR0.051로 기대. 테스트 입력·검사수·성공 조건 삭제0 |
| it03-02 | **7,731/0**,6그룹, exit0·stderr0·ERROR0. 검사 수/입력/순수 품질 검사를 보존한 채 IT-04 적용 기대값으로 전체 재실행. 기존 상수 EXODUSER-it-03-Isolated-20261020 사용 |
| it01-01 | **177/0**,6그룹, exit0·stderr0·ERROR0. 기존 USERDIR EXODUSER-it-01-Isolated-20261020 |
| it02-01 | **2,205/0**,7그룹, exit0·stderr0·ERROR0. 기존 상수 EXODUSER-it-02-Isolated-20261020 사용 |
| import-01 | exit0·stderr0·ERROR0. 이전 IT-03 자기 캐시를 새 OUT에 APFS clone(cp -cR)한 뒤 실제 import로 갱신. 자기 godot/.godot는 새 OUT 캐시 참조. 이전/타인 캐시 쓰기0·제품 project.godot 변경0 |
| contracts-02 | **5그룹/0실패**, exit0·stderr0·ERROR0. map/charge/projectile/pause_capture/damage 전체. USERDIR 상수없는 기존 파일은 작업 격리명 사용. contracts-01은 엔진 실행 전 슬롯 대기만 하다 자기 waiter를 정리했으며 검사 성공/실패로 세지 않음. 재시도 전30초 이상 대기를 유지, contracts-wait-restart.json 보존 |
| p2001c-01 | **39단정/0실패**, exit0·ERROR0·skipped[]·fallback=false. pure16/owner8/live15·forced_actor_fields16. 기존 적응형/RNG fixture라 이전 단위의40/41단정과 분모가 다름. 기존 USERDIR EXODUSER-P2001C-Isolated-20261020. stderr598byte는 Camera2D 및 **ObjectDB 4 instances leaked at exit** 경고. 경고를 해결/clean 종료라 주장하지 않음 |
| initial-resources-01 | **48단정/0실패**, exit0·ERROR0. 기존 test_native_main_source_player_initialization.gd의 관련 shared_crystal_current_values 그룹만 실행. 상수 EXODUSER-MainSourceInitialization-Isolated-20261014 사용. 실제 Main의 captured crystal plan/current P/Player/Health/Attack/DEF의 동일 값 경로 확인. 관측 _crystalStats 전부0·MP/MMP286·ST/MST256·MP/ST regen0.05(초기 장비 RNG 해당 실행값, 고정 기대값 아님). stderr536byte Camera2D 경고. 전체5그룹/자연 장착 효과/실화면 인수 아님 |

실제 Main 관련 검사와 격리 sink fixture는 서로 다른 증거다. 자연 장착·화면·실플레이·성능·PC·사용자 저장 왕복은 미검수. 회귀의 실제 경고는 위 결과/원로그에 보존했다.

## docs·Git·인계

- docs 키워드 검색은 docs-keyword-paths.txt. 전용 resource 설명서에 이번 현재 loop/API/오류 경계를 최상단 추가하고 기존 이력 byte는 보존. 기존 설계 공식·수치 변경0, 다른 담당 문서0줄.
- 수정 전 producer/전용 docs/이전 단계 자기 테스트/CHANGELOG는 OUT/backup 보존. CHANGELOG 최상단 새 절 뒤 기존 byte 동일을 확인한다.
- 정확한6경로만 stage. 신규 test는 ignore test_*에 걸려 해당 파일만 git add -f, 기존 tracked IT-03 test는 일반 경로 stage. 광역 add·타인 WIP stage·hook 우회0.
- .githooks/pre-commit docs-sync-check를 정상 통과해 commit·자기 branch만 비강제 push 후 원격 SHA 대조. main push/병합·force/reset0. SHA/수치/원격 receipt는 OUT/DONE.txt 및 submission-receipt.json.
- 다음 IT-05/인벤 UI/소켓석 mutation은 이번 범위 밖. 총괄은 IT-03 및 앞 단위 의존과 실제 branch tree에서 병합 검수한다.
