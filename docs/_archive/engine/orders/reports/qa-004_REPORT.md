# QA-004 — 레슨 보관 적·자식의 종료 해제 (2026-10-20)

작업ID `qa-004`, 브랜치 `codex/qa-004-20261020`. PC 총괄이 소유를 인계한 `native_parry_lesson_flow.gd`에 종료 처리만 추가해 **QA-003의 보관 적5마리·자식15개 미해제**를 수정했다. 원래 레슨 진행/스킵·restore·allows·입력·Q/E 코드는 byte 그대로다. 아래 최종 검증과 실패/중간 관측을 분리한다.

## 기준·복구·보호 범위

| 항목 | 실제 근거 |
| --- | --- |
| fetch / 최신 main | R에서 `git fetch origin` 후 `284d7faf49295b2f5061937a47ce96038032ed3c`. 기존 QA-004 worktree/브랜치 없음 확인 |
| 분기 / 의존 | 사용자 허용에 따라 QA-003 끝 **`41279ac0fbe625164c33e51f709a9b98bf6bee4d`**에서 분기. 이 커밋은 main284+인트로 종료 하니스3줄·docs다. 아직 main에 없는 QA-003 하니스를 유지하므로 **QA-003 선행 의존**을 명시한다. 다른 제품 변경을 끼워 넣지 않음 |
| 소스 경로 | `/Users/fordeargamers/exoduser-wt/qa-004/godot`, 원로그 `/Users/fordeargamers/exoduser-wt/_out/qa-004/` |
| 초기 checkout 실패 | full checkout이 output/cinematic 산출물 작성 중 `No space left on device`로 exit128. Git이 실패한 새 worktree/등록을 자동 제거하고 branch는 보존. 타 worktree·사용자 데이터 삭제0 |
| 복구 | 동일 branch/path에 `worktree add --no-checkout`, worktree-local sparse-checkout, `read-tree -mu HEAD`. godot/docs/game.html/parry-lesson.js/AGENTS/훅/동기화 checker만 포함. checkout 약922MiB, 완료 후 여유 약20GiB. common extensions.worktreeConfig는 원래true였으며 자기 worktree 설정만 사용. 기존15파일 hash 일치·tracked diff 빈 상태 확인(`checkout-recovery.json`) |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 branch `codex/mac-live-play-time-main-20261017` / HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK 빈 상태를 전후 대조 |
| 제품 편집 | **lesson owner 15줄 추가만**. 공용6파일(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state) 0줄. 공용 최소 연결·입력/피해/저장 변경 필요 없음 |
| 테스트 편집 | 신규 수명 테스트1개. 기존 H/J/K/UI는 마지막 Main.free 뒤 정리 대기6줄만 추가; I는 inherited QA-003 대기 뒤3줄 추가. L/QE/contracts/factory/source_lesson 수정0. 단정/조건/그룹/임계값/skip/seed 변경0 |

## 원인과 제품 수정

원본 `parry-lesson.js:386–407`은 `saved.ens`로 적 배열을 보관하고, `:685–700`의 finish에서 복원한다. Godot는 `world.gd:2857–2866`이 remove_child로 적을 Tree 밖에 둔 뒤 `native_parry_lesson_flow.gd`의 `_saved_enemies`가 수명을 맡는다. 기존 정상 finish는 복원 후 배열을 비우지만, owner 종료 시 부모 없는 Node를 free하는 경로가 없었다. Node 배열 참조가 없어져도 Node/자식이 자동 해제되지는 않는다.

QA-003의 actual UI verbose 증거를 byte 그대로 재사용했다(`reused-qa003-ui/`·`reused-ui-evidence.json`). source product/UI test hash가 이번 base와 같고, 적5개와 자식15개의 ObjectID가 leak 목록에 각각 일치한 진단이다. baseline UI115/0에도 리소스18(적 관련17+음성1), 객체66이 남았다. 원래 원문의17은 적 script1+8방향 base/walk texture16이며 음성은 별도다.

| 추가 위치 / 코드 | 종료 계약 |
| --- | --- |
| `native_parry_lesson_flow.gd:136–141` `_release_saved_enemies()` | 현재 보관 배열을 local로 받고 먼저 `_saved_enemies=[]`. 유효한 Node이고 parent=null인 항목만 free. Node가 자기 CollisionShape2D/Sprite2D 자식도 함께 해제 |
| `:143–144` `_exit_tree()` | owner가 Tree를 나갈 때 보관 적 해제 |
| `:146–148` `_notification(NOTIFICATION_PREDELETE)` | Tree에 들어간 적 없이 직접 free한 owner도 해제. EXIT_TREE와 중복 호출·중복 배열 항목·이미 해제된 항목에 안전 |
| 이미 복원/재부모화된 적 | parent가 있으면 새 owner가 소유하므로 해제하지 않음. 원래 finish·World restore 경로 변경0 |

`unchanged-logic-proof.json`: 이15줄을 제거하면 기존 제품 전체 bytes와 일치한다. `_start/_finish/allows/allows_native_action/_input`과 기존 Q/E 경로는 한 글자도 바꾸지 않았다. 종료 시 `_finish()`를 호출하지 않아 HP·좌표·장비/스킬 snapshot·보상·진행을 실행하지 않는다. 시험에서 active/phase/step과 관련 없는 보관 snapshot도 그대로 확인했다.

## 하니스 종료 대기와 오디오 분리

제품만 수정한 `product-only-ui`에서115/0, 잔류 리소스는18→**1**, 객체66→**2**로 줄었다. 실제 적·자식·관련17리소스는 없어졌고 남은 것은 **voice_wakeup.mp3/AudioStreamPlaybackMP3**였다. H/J/K baseline도 각각125/0·21/0·32/0이지만 같은 음성2객체/1리소스와 ERROR1이 남았다. 이를 제품 적 해제 완료로 덮거나 오디오 stop/stream=null로 숨기지 않았다.

H/J/K/UI의 `_run` 마지막 Main 해제 뒤 QA-003 방식12 process_frame을 추가했다. 첫 대기 실행 UI/H/J/K는 종료0이었으나, 추가 I 회귀 `final-i`에서 inherited12프레임만으로는 음성1리소스가 남았다. 이 실행은 실패로 보존한다. **프레임 수는 mix 정리의 실제 시간 하한을 보장하지 않았으므로**, 관련5개 테스트에 test-owned monotonic clock으로 **추가200ms 이상 process_frame 대기**를 넣었다. 기존 I의12프레임은 유지하며 테스트에서만 보강한다.

- H `test_p2001h_curtain_spawn.gd:45` / J `test_p2001j_lesson_clock.gd:44` / K `test_p2001k_lesson_practice.gd:44` / UI `test_p2007a_ui_polish.gd:58`: 각6줄의 종결 대기만 추가.
- I `test_p2001i_boot_intro.gd:47`: 기존 QA-003 대기 뒤200ms3줄만 추가.
- 추가 부분을 제거하면 각 테스트가 base의 bytes와 같다. 테스트 본문·검사 수를 고정하려는 seed·skip·가짜 성공값·제품 오디오 변경0. 세계/레슨/입력 객체는 이미 free한 뒤이며 제품 clock이나 gameplay 대기가 아니다.

200ms가 모든 장치의 완전한 오디오 수명 보장을 뜻하지는 않는다. 이번 관측 오류를 분리하여 실제 종료를 검수한 하니스 종결 처리이며, 제품 오디오 owner 전면 수정으로 보고하지 않는다.

## 수명 회귀 — RED → GREEN

신규 `test_qa004_lesson_teardown.gd`는 **실제 lesson script**와 명시적5적×(CollisionShape2D1+Sprite2D2) fixture를 사용한다. 첫 `_initialize`에서 `EXODUSER-qa-004-Isolated-20261020`을 확인하며 실제 Main/input/QE는 이 fixture에서 실행하지 않는다.

| 그룹 | 검사 | 검증 |
| --- | --- | --- |
| exit_tree_cascade | 23 | remove_child 직후5적+15자식 무효, 보관 배열 비움, active/phase/step·다른 snapshot 불변, 이후 free 중복 안전 |
| direct_free_cascade | 20 | Tree에 있는 owner 직접free가5적+15자식 해제 |
| pre_tree_free | 20 | Tree 미진입 owner free에도 PREDELETE 해제 |
| queued_free | 21 | queue_free 후 owner와5적+15자식 해제 |
| mixed_ownership | 14 | 중복/기해제/null 안전, 다른 부모에 복원된 적·자식 보존, 두 번째 종결도 중복해제 없음 |
| 합계 | **98** | 수정 전98/86실패·exit1 → 수정 후 **98/0·exit0·ERROR0·ObjectDB0·개별leak0·리소스0** |

RED fixture는 해제 실패를 단정으로 먼저 기록한 뒤 테스트 소유 잔여만 정리해 다음 그룹을 오염시키지 않는다. 따라서 RED의 ObjectDB0을 제품 수명 해결로 계산하지 않았다. 실제 UI 누수 제거는 별도의 actual Main 실행으로 확인한다.

## 최종 인수에 사용하는 실제 결과

최종 인수집합 **13회 모두 exit0·ERROR0·ObjectDB 경고0·개별leak0·리소스0**이다. 전부 `--verbose --headless`, 행의 ERROR/ObjectDB/leak/resource를 stdout·stderr 원문에서 각각 센다. Camera2D physics interpolation WARNING은 보존하며 ObjectDB 경고와 섞지 않는다.

| 원로그 basename | 검사/실패 | exit | ERROR | ObjectDB WARNING | Leaked instance | Resource rows | 모든 WARNING |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `green-lifetime` | 98/0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `verified-ui` | 115/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-h` | 124/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-j` | 21/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-k` | 32/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-l` | 66/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-qe` | 155/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-contracts` | 5군/0실패 | 0 | 0 | 0 | 0 | 0 | 0 |
| `final-factory` | 3군/0실패 | 0 | 0 | 0 | 0 | 0 | 0 |
| `final-source-lesson` | 30/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-i-01` | 18/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-i-02` | 18/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `verified-i-03` | 18/0 | 0 | 0 | 0 | 0 | 0 | 1 |

**검사 수 보존:** J21(11/6/4), K32(13/13/6), L66(15/22/29), QE155(11그룹)의 그룹별/총 검사 수를 수정 전 baseline과 대조한다. UI115도 원본과 같다. 실행 결과와 비교 영수증은 `assertion-count-comparison.json`에 기록한다. body/단정 bytes 보존은 별도 정적 증거다.

**H의 원래 조건부 분모:** baseline-h는125/0·magic_elites1·rng_calls46, 첫 final-h는124/0·magic_elites0·rng_calls45였다. 기존 `if elite == 1`의 mods 단정(`test_p2001h_curtain_spawn.gd:161–163`)이 매직 적마다1개 추가되므로 이 차이는 원 RNG 경로다(`h-rng-denominator.json`). H의 서로 다른 분모를 일치했다고 보고하거나 재실행으로125를 골라내지 않는다. 최종 H 수치는 위 verified-h 원문을 따른다. 검사 조건·RNG 호출·seed는 바꾸지 않았다.

## 실패·중간 관측 보존

아래는 최종 인수표와 별개다. exit0/실패0이어도 ERROR/누수가 있으면 전체 통과로 세지 않는다.

| 원로그 basename | 검사/실패 | exit | ERROR | ObjectDB WARNING | Leaked instance | Resource rows | 모든 WARNING |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `red-lifetime` | 98/86 | 1 | 86 | 0 | 0 | 0 | 0 |
| `baseline-h` | 125/0 | 0 | 1 | 1 | 2 | 1 | 2 |
| `baseline-j` | 21/0 | 0 | 1 | 1 | 2 | 1 | 2 |
| `baseline-k` | 32/0 | 0 | 1 | 1 | 2 | 1 | 2 |
| `baseline-l` | 66/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `baseline-qe` | 155/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `product-only-ui` | 115/0 | 0 | 1 | 1 | 2 | 1 | 2 |
| `final-ui` | 115/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-h` | 124/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-i` | 18/0 | 0 | 1 | 1 | 2 | 1 | 2 |
| `final-j` | 21/0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `final-k` | 32/0 | 0 | 0 | 0 | 0 | 0 | 1 |

`final-i`의 ERROR1을 뒤의 verified-i 성공으로 소급하지 않는다. 같은 보강 하니스로 I3회 실행하여 각18/0과 실제 종료 정리를 별도로 기록했다. 변경 없는 L/QE/기본 회귀의 성공은 제품 최종 source와 동일하므로 하니스 보강 뒤 불필요하게 반복하지 않았다.

## 실행·저장 격리·제출

- 매 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인, 2이상이면30초씩 대기 후0/1일 때만 시작. 각 JSON `guards`에 실제 개수/시각, `cmd`에 원앱 절대경로·자기WT·verbose·스크립트·실행 source SHA-256을 보존한다. 앱 복사·타 프로세스 강제 종료0.
- 기존 H/I/J/K/L/UI/source_lesson은 **각 파일 상수 격리명**, QE/contracts/factory처럼 상수가 없으면 `EXODUSER-qa-004-Isolated-20261020`. child 실행마다 자기 override.cfg를 만들고 finally에서0byte. 실제 사용자 save/기존 창 입력0.
- import1회 전 App Support/Godot를 자기 OUT에 복사하고 SHA-256 대조. import exit0·ERROR0·누수0. source snapshots·before15파일·기존 QA-003 원로그·실패 로그도 삭제하지 않음.
- docs 전체 관련 키워드463매칭을 `docs-keyword-search.txt`에 보존. 새 구현/실행 사실은 이 보고서와 CHANGELOG 맨 위 절에 동기화하며 QA-003의 과거 BLOCKED 이력은 덮어쓰지 않는다.
- R·공용6파일·레슨 진행/입력 allows/QE 경로·웹 원본·저장 형식·타 담당 제품 변경0. source/범위·최종 원격 ref 대조·브랜치/SHA/수치는 OUT `final-preservation.json`·`DONE.txt`에 기록한다.
- 자기 파일만 경로 지정 staging·정상 pre-commit hook·자기 브랜치 push. 새 테스트의 ignore만 명시 경로 force-add하며 훅 우회·main push·force push·git add -A·reset0. runtime cache/UID/override는 커밋 제외.

**완료 범위:** lesson owner 종료 시 보관 적·자식 수명과 지정 레슨/QE 동작·기본 회귀다. 레슨 미이식 단계 구현, 입력 정책 변경, 전투/저장 형식 수정, 실창/청감/장시간 오디오·전체 게임 완성은 이번 인수 범위 밖이다.
