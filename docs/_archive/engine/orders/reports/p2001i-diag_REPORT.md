# p2001i-diag — 테스트 종료 ERROR·객체/리소스 수명 진단

상태: **진단 자료 확보·검수 대기 — 기준 main 비재현 / 종료 대기 제거 통제실험에서 동일 서명 재현**. 새 제품 결함 수정으로 보고하지 않는다. CH1-06은 기술 완료, 시각 FAIL은 MAPLOOK 범위이며 CH1-07 제품 연결 HOLD를 유지한다.

## 기준·소유권·실행

| 항목 | 실제 근거 |
|---|---|
| 작업·브랜치 | p2001i-diag / codex/p2001i-diag-20261020 |
| 실행 기준 | 사용자 지정 origin/main **6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d**. fetch 당시 origin/main은 b25a018ace5a3fa65c9c2476a8c3ac92509077b3까지 전진했으나, 재현 기준을 바꾸지 않고 지정 SHA에서 분기 |
| 재개 | worktree add --no-checkout·sparse-checkout 생성 후 서버 capacity 중단. 재개 시 같은 worktree의 branch/HEAD·INDEX/WORK 빈 상태 확인. 새 branch/checkout·reset0 |
| 실제 경로 | /Users/fordeargamers/exoduser-wt/p2001i-diag/godot |
| 원로그 | /Users/fordeargamers/exoduser-wt/_out/p2001i-diag/ — 실행별 stdout/stderr/engine 원문·argv·실행시간·종료값·실행 source SHA256 |
| 담당 확인 | 기준 WORK_BOARD의 P2-001l 행은 기존 PC 담당 이력이나 QA-004 행은 Mac Codex·main 병합. QA-004_REPORT:3에서 native_parry_lesson_flow.gd 종료 해제 소유 인계를 명시. 최신 origin/main 작업판도 읽기 전용 저장·대조. native_intro_key_guide_panel.gd는 P2-007a cloud-ui-polish 범위이므로 제품 수정하지 않음 |
| 이미 들어 있는 수정 | QA-004 680a2758은 기준 main의 조상. 현재 I 테스트 SHA256 **88840f7a65462a8ba2e4c4d49e28e517d5e5cb7ded8dcc6665306c25b3258238**은 QA-004 verified-i-03.test.gd와 byte 동일. 기존 종료 대기12프레임+200ms·레슨 보관 적 해제가 이미 있음 |
| 부하·격리 | 매 Godot 실행 전 지정 pgrep/wc, 2이상이면30초 대기 후 재조회. 자기 실행 직렬. 기존 6종 USERDIR 상수 사용·매회 override.cfg 작성/finally0byte. 실제 사용자창·다른 프로세스 종료0 |
| 출력·node | 하니스 --node-bin 절대 경로 인자 필수. Godot argv에도 전달. stdout/stderr는 UTF-8 파일로 전량 수집·문자열 출력. 이번 6종에는 OS.execute 신규 호출/출력 첫 조각 사용0 |

## 기준 main 6종 재현 결과

전부 **원본 테스트 byte 그대로**, `--headless --verbose`로 실행했다. ERROR는 종료값과 독립 집계하며, 결과0으로 누수 경고를 덮지 않는다.

| suite / baseline 로그 | 단정/실패 | 그룹별 단정 | exit | ERROR | ObjectDB 경고 | Leaked instance | Resource still in use |
|---|---|---|---|---|---|---|---|
| p2001i | 18/0 | 8/5/5 | 0 | 0 | 0 | 0 | 0 |
| p2007a | 115/0 | 31/22/24/30/8 | 0 | 0 | 0 | 0 | 0 |
| p2001h | 125/0 | 111/10/4 | 0 | 0 | 0 | 0 | 0 |
| p2001j | 21/0 | 11/6/4 | 0 | 0 | 0 | 0 | 0 |
| p2001k | 32/0 | 13/13/6 | 0 | 0 | 0 | 0 | 0 |
| p2001l | 66/0 | 15/22/29 | 0 | 0 | 0 | 0 | 0 |
| 합계 | **377/0** | skip0·임계값/seed 변경0 | 전부0 | **0** | **0** | **0** | **0** |

6종 모두 Camera2D physics interpolation WARNING은 원문 보존한다. 이것은 ObjectDB/리소스 누수 ERROR가 아니다. H125는 원 RNG에서 magic_elites1·rng_calls46인 실제 분모이며, 과거 H124와 조건부 매직 적 단정1개 차이를 정정/고정하지 않는다. 이번 원문 수치만 보고한다. `baseline-summary.json`과 `.result.json`·원로그가 기준이다.

## 생성 위치와 종료 경로

| 객체·리소스 | 생성·보관 위치 (기준 main 파일:행) | 해제/판정 |
|---|---|---|
| VoiceWakeup AudioStreamPlayer | native_intro_key_guide_panel.gd:625 new → :633 패널 자식 → :635 play. :628에서 voice_wakeup.mp3 load | :634 finished→queue_free 연결. Main/가이드 부모 파괴 시 Node도 해제. AudioStreamMP3·AudioStreamPlaybackMP3의 mixer 잔여 참조와 Node 미해제는 구분 |
| 음성 원본 | 같은 파일:19 VOICE_PATH res://assets/sfx/voice/voice_wakeup.mp3 | 원본 game.html63403–63407 voice_wakeup 샘플 재생 근거. byte·재생·stream·pitch·gain 수정0 |
| 커튼5링 적 | native_intro_curtain_sequence.gd:358 CharacterBody2D new → :359 configure. enemy_melee_flesh_crawler.gd:135–147에서 shape·8방향 texture 소유 | World detach 후 레슨 보관 중에는 부모 없음. Node는 배열 참조만으로 자동 해제되지 않음 |
| 레슨 임시 보관 | world.gd:2857–2867 remove_child 후 배열 반환 → native_parry_lesson_flow.gd:758 _saved_enemies | QA-004의 :136–141 _release_saved_enemies가 parent=null인 유효 Node만 free. :143–148 EXIT_TREE/PREDELETE 적용. 복원된 타 부모 소유 적은 보존 |
| I 하니스 종료 | test_p2001i_boot_intro.gd:39–54 Main remove_child/free → 12 process_frame → monotonic200ms 이상 → 결과·quit | AudioServer mix/main-thread 정리 기회를 주는 test-owned 종료 대기. 단정·제품 clock·레슨 진행과 분리 |

## 객체 ID 대조·분류

외부 진단 복사본만 사용한다. 원본 I의18단정·USERDIR·종료 대기는 보존하고, Node 생성 signal stack·부모/ID·AudioStream/Playback ID를 기록한다. WeakRef와 문자열 ID만 보관해 진단이 소유 수명을 연장하지 않도록 했다. Main이 Tree에 있을 때만 get_path를 읽는다. 제품/테스트 저장소 본문은 변경하지 않는다.

`probe`는 **727개 Main 하위 Node 전부 해제**, AudioStreamMP3·AudioStreamPlaybackMP3 WeakRef 두 개 모두 무효·voice_cached=false를 확인했다. 당시 레슨은 idle/active=false·saved_count0으로, detached 레슨 적이 이 I 종료 오류의 원인이라는 가설을 지지하지 않는다.

다음으로 저장소 밖 동일 진단 복사본에서만 기존 하니스의 마지막 **12 process_frame+200ms**를 제거했다(`no-drain-probe`). 이 차이 외 단정18개·계측 본문이 byte 동일함을 `controlled-comparison-proof.json`으로 확인했다. **이 실행은 원문 main 재현이 아니라 의도적으로 종료 대기를 제거한 음성 통제실험**이다.

| 실행 / 의미 | 단정/실패 | ERROR | ObjectDB 경고 | 개별 leak | 리소스 행 | 관측 |
|---|---|---|---|---|---|---|
| baseline I / 기준 main 원문 | 18/0 | 0 | 0 | 0 | 0 | 8/5/5, skip0 |
| probe / 원문 대기+WeakRef 추적 | 18/0 | 0 | 0 | 0 | 0 | Node727→0·음성 두 객체→무효 |
| no-drain-probe / 대기 제거 대조 | 18/0 | **1** | **1** | **2** | **1** | Node727→0이나 음성 두 객체가 exit 직전 생존, voice_cached=true. 종료0이어도 누수 없는 PASS로 세지 않음 |
| repeat-1 / 기준 main 원문 | 18/0 | 0 | 0 | 0 | 0 | 동일18단정·skip0 |
| repeat-2 / 기준 main 원문 | 18/0 | 0 | 0 | 0 | 0 | 동일18단정·skip0 |
| probe-parse-error / 첫 진단 실패 | 미실행 | 1 (+SCRIPT ERROR1) | 0 | 0 | 0 | 외부 복사본 들여쓰기 혼용. 파일·로그 보존 후 수정. 기존 suite나 제품 실패로 세지 않으며 검증 통과에서도 제외 |

실제 음성 Node 경로는 `/root/EXODUSER/HUD/NativeIntroKeyGuide/VoiceWakeup`, ID243152196520이다. `_try_voice():633`→`_request_voice():609`→`show_step():508`→`_show_guide_panel():199`→Main._ready():281의 생성 호출 stack을 수집했다. 각 실행 내부의 ID만 비교하며 다른 실행의 동일 숫자를 같은 객체로 간주하지 않는다.

| 대기 제거 실행 내 객체 | 진단 signed ID → unsigned ID | 종료 verbose 일치 |
|---|---|---|
| AudioStreamMP3 | -9223371793551584337 → **9223372280157967279** | Leaked instance AudioStreamMP3와 정확 일치; Resource still in use 경로 voice_wakeup.mp3 |
| AudioStreamPlaybackMP3 | -9223371793484475474 → **9223372280225076142** | Leaked instance AudioStreamPlaybackMP3와 정확 일치 |
| VoiceWakeup 및 Main 하위 Node | 추적727개 | **모두 무효**. AudioStreamPlayer Node가 고아로 남은 현상과 구분 |

ObjectID는 GDScript signed64에 modulo2^64를 적용해 verbose unsigned ID와 대조했다. `owner-id-comparison.json`이 원문/대조 모두의 생성 stack·ID·WeakRef 생존 정보를 보존한다. 대기 제거 시 남은 `Orphan StringName: FDGAttackSource_74557949386 (static: 0, total: 2)`도 원문 보존했으며, 버스 이름 생성은 main.gd:1988이다. 공용 Main을 수정하지 않았다.

종료 ERROR·누수 원문(`no-drain-probe/p2001i.stderr.log`, `.stdout.log`):

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 1 resources still in use at exit.
   at: clear (core/io/resource.cpp:817)
Leaked instance: AudioStreamPlaybackMP3:9223372280225076142 - Reference count: 1
Leaked instance: AudioStreamMP3:9223372280157967279 - Reference count: 1
Resource still in use: res://assets/sfx/voice/voice_wakeup.mp3 (AudioStreamMP3)
```

**판정:** 통제실험에서 재현한 서명은 **하니스가 AudioServer의 비동기 Playback/Stream 정리 전에 quit하는 종료 순서 문제**다. Node727개와 레슨 보관 상태가 정상 해제돼 있으므로 이 서명을 레슨 제품 Node 소유권 결함으로 판정하지 않는다. 현재 기준 main은 이미 QA-004 대기를 포함하여 원문 I3회·나머지5종·추적1회에서 ERROR/누수0이다. 별도 총괄 관측의 원문/argv가 제공되지 않아 그 관측과 동일 원인인지는 미확정이다. 200ms가 모든 장치/부하에서 보장된 상한이라고 일반화하지 않는다. 재발하면 기존 실행 source SHA·최종 대기 유무·종료 ERROR 원문을 이 ID 추적 방식으로 다시 대조한다.

## 수정·전후 비교와 제한

기준 main 재현에서는 해제되지 않은 Node/리소스를 발견하지 못했으므로 **제품·기존 테스트 수정0**이다. 음성 통제실험의 잔여2객체를 근거로 정상 원문에 불필요한 수정은 더하지 않는다. 이미 있는 QA-004 수명 수정/하니스 대기를 다시 덧붙이거나 `_finish()`·skip·allows·Q/E·음소거·stream=null로 종료를 우회하지 않는다. 근거 없는 OLD/NEW 제품 패치를 적용하지 않는다.

과거 QA-003/004의 음성 AudioStreamMP3+AudioStreamPlaybackMP3 2객체/1리소스와 detached 적5/자식15/17리소스 기록은 역사 증거로만 인용한다. 현재 기준 main의 재현 결과로 재사용하지 않는다. 현 기준 오류 부재는 모든 하드웨어·부하에서 재발하지 않는다는 보증이 아니다.

| 소유·OLD/NEW 검토 | 판단과 미적용 범위 |
|---|---|
| Mac 종료 하니스 OLD → NEW | 현재 `Main.free → 12프레임 → 200ms 이상 → quit`을 **동일하게 유지**. 대기 없는 외부 OLD 실험은 ERROR1/2leak/1resource, 현행 NEW는0/0/0. 저장소에 새 변경 없음 |
| Mac QA-004 레슨 owner OLD → NEW | `_release_saved_enemies` EXIT_TREE/PREDELETE 현행 유지. 이번 I는 보관0이고 제품 종료 해제가 이미 적용돼 중복 수정할 근거 없음 |
| 다른 담당 P2-007a 가이드 OLD → NEW | :625–635 음성 생성/재생/finished 해제 **현행 유지 제안**, 미적용. 제품 stream=null·음소거·조기stop을 넣을 필요가 현재 증거에서 없음. 다른 담당 소유 제품 패치0 |
| 지정6종 전후 | 코드/하니스 전후 SHA256 전부 동일, baseline6종377/0·종료 누수0. 코드 수정 후 전후 개선을 주장하지 않는다. 추가 원문 I2회도18/0·누수0. 조건·allows·Q/E·그룹·분모·seed 변경0 |

## 제출·보존

자기 보고서·CHANGELOG_SYNC 맨 위 절·WORK_BOARD 자기 행만 변경했다. 공용6·제품·레슨 로직·allows·Q/E·기존6종 테스트·원본·에셋 변경0. 보고서와 원로그를 남기고 자기 브랜치만 정상 훅·비강제 push, 원격 SHA 일치·DONE.txt 후 자기 worktree 제거. R branch/HEAD/INDEX/WORK 시작/종료 동일을 검증한다.
