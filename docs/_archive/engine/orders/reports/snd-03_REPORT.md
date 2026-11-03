# snd-03 — 사운드 frame queue 순수 phase

## 기준과 범위

**구현·독립 검증 완료 / 검수 대상. 기존 Main 회귀의 종료 WARNING은 아래 보존.** 원본 `playSample`의 보이스 치환 이후 enqueue와 `_sfxFrameReset`의 큐 처리·정리 단계만 독립 계산 모듈로 구현했다. 기존 전투 큐·재생기·게임 frame에 연결하지 않는다. 실청취·실게임·PC 인수는 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / 브랜치 | `snd-03` / `codex/snd-03-20261020` |
| 실행 source | `/Users/fordeargamers/exoduser-wt/snd-03/godot` |
| 재개 확인 / 생성 | 기존 snd-03 WT가 없음을 먼저 확인. fetch 성공 후 새 WT/branch 생성. 생성 로그 `_out/snd-03/worktree-create.log` |
| 원본 main | `284d7faf49295b2f5061937a47ce96038032ed3c`, `game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 선행 의존 | main에 SND-01/02 구현이 없어 사용자 인수 SND-02 끝 `8b4ca2f279870f9501607b53c5c9e92ab3d761a9`에서 분기. main284d7faf가 ancestor임을 확인. 정책은 SND-01 `policy.gd` 재사용. SND-02 catalog는 원본처럼 enqueue 등록 gate로 사용하지 않음 |
| 지시서 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 문서의 옛 격리명보다 이번 사용자 지정 `EXODUSER-snd-03-Isolated-20261020` 우선 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. 시작 INDEX/WORK 변경 없음. R 코드·branch·index 수정 없음 |

## 신규 파일·API

| 파일 / API | 정확 계약 |
|---|---|
| `godot/port_modules/sound_source/queue_phase.gd` | RefCounted·전역 class_name 없음. static 함수 3개. Node/OS/IO/실제 clock/RNG/오디오 생성 없음 |
| `new_state()` | 독립 Dictionary. queue:Array / last_t:Dictionary / frame_t=0 / frame_counts:Dictionary / death_cd=0 / hit_cd=0 / m_sfx_playing=0 / sb_cd=0 |
| `enqueue_resolved(state,key,volume,rate,priority,gx_volume_mul,now_ms,random_unit)` | 보이스 치환을 마친 String key·numeric volume/rate/gx·bool priority. millisecond clock·단위 RNG를 Callable로 주입. QUEUED(priority bool) 또는 DROPPED(reason empty_key/gx_volume/duplicate_30ms) receipt |
| `flush(state,mobile,audio_time,active_nodes,dispatch)` | audio_time은 seconds, active_nodes는 매 live queue entry에서 읽는 int, dispatch는 5인자(key,vol,rate,time,pan) Callable. COMPLETE 또는 DISPATCH_FAILED, processed(성공 prefix)/attempted(실패 시도 포함)/failure 반환 |
| dispatch 계약 | `{ok:true}`는 원본 정상 반환, `{ok:false,error:...}`는 JS throw에 해당하는 실패. 잘못된 반환은 invalid_dispatch_result로 실패·큐 정리. **임의 GDScript 런타임 오류를 catch했다고 주장하지 않음**. clock/RNG/active reader는 total numeric callback이 전제 |
| `godot/tests/test_sound_source_queue.gd` | 원본 oracle의 매 단계 state·clock/RNG/dispatch 순서·실제 dispatch 인자·dispatch 중 정리 전 상태·실패 여부 대조. native receipt·독립 상태·잘못된 backend 반환·NaN rate 경계도 별도 검사 |
| `godot/tests/build_sound_source_queue_oracle.mjs` | 고정 main의 실제 함수 본문·상수를 Node VM에서 실행. 실제 JS throw 후 finally 상태를 수집. GDScript 구현으로 기대값을 만들지 않음 |
| `godot/tests/fixtures/sound_source_queue_oracle.json` | 32시나리오·76단계, 원본 SHA와 실제 JS 실행 결과. 오디오/이미지 에셋이 아닌 테스트 데이터. 검토용 pretty 원본은 `_out/snd-03/source-oracle.json` |
| docs | 이 보고서와 `docs/CHANGELOG_SYNC.md` 최상단 절만. 공용 작업판·타 설계·기존 추적 원문은 보존 |

공용 6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd), 기존 제품·기존 테스트·HTML·원본 에셋 변경 0줄이다. Q/E·blackBean Q-only·docs/2_3·저장 형식 보존. 원본 음원 생성·복사·변환 없음.

## 최신 main 원본 행과 보존한 순서

| 원본 `game.html` 행 | 현재 phase 계약 |
|---|---|
| 12359–12361 | 보이스 치환은 선행 owner(SND-04 이후). 여기에는 치환 결과 key 입력. 빈 key 즉시 반환. gx<1일 때만 volume 곱, 결과 .01 미만이면 clock/RNG 전에 drop. gx≥1이면 증폭하지 않음 |
| 12363–12364 | priority bool 또는 skill/footstep인 경우 30ms gate 우회. 그 외 now−(last 또는 0)<30이면 차단. 최초 key도 now<30이면 차단되는 원본 경계 보존. 허용 시 stamp를 RNG·queue 삽입 전에 기록 |
| 12365–12368 | numeric rate0/NaN은1, 이후 rate×(.92+random×.16), 허용1건당 RNG1회. priority 항목은 pri1을 저장해 unshift(LIFO), 일반은 push(FIFO). volume0은 이 단계에서1로 바꾸지 않음 |
| 12220–12224 / SND-01 정책 | desktop/mobile active 한도48/16, frame6/3, category2/1. 원본 주석의 ‘8개/다음 frame’ 대신 실제 상수·finally 동작을 따른다 |
| 12297–12304 | frame_t 증가, 양수 death_cd/hit_cd 감소, m_sfx_playing0. audio_time 한 번 읽고 모든 dispatch에 같은 seconds 값 전달. 빈 큐에서도 동일 |
| 12306–12312 | live queue 순서. entry마다 active 재조회. 일반만 node/frame/category 상한 적용. priority는 모든 상한을 우회하지만 성공 시 frame count·category count에는 포함되어 뒤 일반 항목에 영향 |
| 12313–12318 | 같은 key의 처리 수 n=0/1일 때 gain/pitch 배수1/1. n≥2는 gain=max(.08,.5^(n−1)), pitch=max(.7,1−(n−1)×.05). dispatch 성공 후에만 seen/cnt 증가. 누락 pan0. dispatch 중 추가된 queue entry도 같은 frame의 live length로 읽음 |
| 12320–12324 | 정상·상한 skip·dispatch 실패 모두 나머지 queue 전부 폐기. frame_counts의 기존 key를 삭제하지 않고 값0, 양수 sb_cd 감소. 마지막 stamp는 유지. 실패 prefix 재실행 없음 |
| 12325 | AudioContext resume는 실제 backend/frame owner의 후속 책임. 이 phase는 디바이스·resume 호출을 만들지 않음 |

`SFX_PRI`의 수치 우선순위와 enqueue의 우선 플래그는 별개다. 예컨대 voice의 분류 priority9만으로 frame queue 우회가 생기지 않는다. 카탈로그에 없는 key를 새로운 파일로 만들거나 임의 drop하지 않는다. API는 numeric 인자와 일반 own-property key 범위이며 JS prototype 특수키·문자열 수치 강제변환·실제 callback 예외/AudioContext 실패 호환성은 미지원이다.

## 검증·격리·원로그

원로그: `/Users/fordeargamers/exoduser-wt/_out/snd-03/`.

각 Godot 프로세스 직전에 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인하며 2 이상이면 30초씩 기다린다. `run_godot.py`가 대기 count/시각·HEAD·argv·PID·exit·stdout/stderr SHA-256을 `.meta.json`에 남긴다. 새 테스트의 override는 `EXODUSER-snd-03-Isolated-20261020`, 기존 정책·catalog는 각 USERDIR 상수와 동일하게 실행하고 finally에서 0byte로 비운다. contracts는 USERDIR 상수가 없으며 SND-03 격리 override를 사용하고 원 주석대로 save_report를 호출하지 않는다. 엔진 로그는 모두 Git 밖 `--log-file`.

contracts가 읽는 기존 리소스는 SND-01에서 이미 검증한 엔진 캐시1006파일을 WT의 `.godot/`에 **동일 byte**로 복사했다. 해시 일치 확인은 `engine-cache-byte-copy.json`. 원본 에셋 변환·Godot import 실행 없음.

| 검증 | 실제 결과 |
|---|---|
| 새 queue-01 | **606단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true, Main_booted=false, source_cases32. 처음 유효 실행부터 통과했으며 실패 단정 완화·skip 없음 |
| 독립 JS 대조 | 실제 원본 JS의 32시나리오·76단계와 native trace의 **2,107 scalar leaf 대조 / 불일치0**. 수치 허용오차 상대1e−12, 관측 최대차1.1102230246251565e−16. Dictionary key 집합·배열 순서·문자열·boolean은 정확 대조. `oracle-comparison.json` |
| throw prefix | desktop/mobile 각각 실패시도1/2/3, 실패 후 빈 큐 재flush, dispatch 중 추가된 항목을 포함한 finally 폐기까지 원본 **실제 JS throw** 결과와 native 명시적 실패 packet 결과 일치. GDScript 예외 catch·실제 backend 실패 검증으로 승격하지 않음 |
| fixture 재생성 | 커밋 대상 generator로 재생성한 fixture SHA-256 `f69fa3004036a1b907dadb917e8c1f51146c7232aaabb6987daafc9e06bf3aa4`, 테스트 때와 동일 byte. `source-oracle-rebuilt.json` 보존 |
| contracts-01 | **5그룹 통과 / failed_assertions0 / exit0 / stderr 비어 있음**, only=[]로 전체 map/charge/projectile/pause_capture/damage 실행. 검사 단정 수를 임의 환산하지 않음 |
| policy-01 | 기존 SND-01 테스트 **1,194단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true, Main_booted=false |
| catalog-01 | 기존 SND-02 테스트 **687단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true, Main_booted=false |
| kill-rewards-01 | 기존 `test_p2001c_kill_rewards` **45단정 / 0실패 / skipped0 / exit0 / stderr ERROR0**. 3그룹16+8+21, death_sound_dispatches1, forced_actor_fields33. **Camera2D WARNING1 + ObjectDB WARNING1(잔류 객체2개)**. 종료 clean PASS로 세지 않음. 원인 baseline 추가 실행·공용 수정 없이 해당 원로그와 한계를 보존 |
| 웹 기존 회귀 | audioBootLoading / audioContextResumeGate / footstepAudioPriority / kiSlashSwingSound / silvertailFemaleVoice, **5파일·10tests / pass10 / fail0 / skipped0 / exit0 / stderr 비어 있음**. `web-audio.out/.err/.meta.json` |
| 보호 범위 | 시작 기준 기존 tracked game.html/godot **1,314파일 SHA-256 전부 동일**. 신규4파일 외 제품·기존 테스트·음원 변경0. `protected-baseline.json`, `scope-precommit.json`, 최종 `scope.json` |
| 과부하·격리 | queue는 count2에서30초 간격6회 대기→count1 실행. contracts/policy/catalog는 각각count1. Main 회귀는 count2에서30초1회 대기→count1 실행. 자체 Godot 순차 실행, override 최종0byte |

각 실행의 대상 HEAD는 선행 SND-02 `8b4ca2f2`에 이 작업의 미커밋 신규 코드가 있는 WT다. 새 파일은 `tested-implementation-hashes.json`으로 테스트 때의 바이트를 고정하고, 제출 전 staged blob과 대조한다. 단정 수·contracts 그룹·웹 tests·독립 leaf 수는 서로 다른 분모로 기록한다. 기존 Main 종료 경고를 신규 pure phase의 clean 결과와 섞어 전체 종료 무결함을 주장하지 않는다.

재현:

```sh
node godot/tests/build_sound_source_queue_oracle.mjs ~/exoduser-wt/_out/snd-03/source-oracle.json
python3 ~/exoduser-wt/_out/snd-03/run_godot.py ~/exoduser-wt/snd-03 queue-01 test_sound_source_queue EXODUSER-snd-03-Isolated-20261020
```

docs 전체 관련 키워드 검색은 `docs-search.txt`에 보존한다. 설계의 예정·과거 구현 설명을 현재 구현으로 재해석하지 않고 이 보고서와 CHANGELOG에 이번 phase 범위만 추가한다.

## 제출·인수 한계

경로 지정 stage, 정상 pre-commit 훅, 자기 브랜치 비강제 push 후 원격 SHA 대조. `test_*` ignore에 걸리는 승인된 새 테스트만 `git add -f -- godot/tests/test_sound_source_queue.gd`. `git add -A`·main push·force·rebase·훅 우회 없음. 최종 branch/SHA/수치는 Git 밖 `DONE.txt`에 기록한다.

이번 단위의 동등성은 독립 fixture·failure packet 계약 범위다. 보이스 선택·원본 파일 재생·공유 active node 한도·자연 frame 연결·AudioContext/device·실청취·실게임·PC 실행 인수는 후속이며 SND-04를 자동 착수하지 않는다.
