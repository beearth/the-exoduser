# snd-07 — 독립 sample backend·admission·공간음

## 결과·의존

**독립 backend 구현·검증 완료, 자기 branch 제출 대상.** 원본 sample의 노드 한도/교체/종료와 공간음 수식을 옮기고 실제 Godot AudioStreamPlayer·Timer·격리 버스로 검증했다. Main/World/Player/State·기존 attack backend 연결0줄이다. 실제 게임 전체의 공통48개 한도 통합, master EQ/compressor·추가 sfxVol 적용, 청감/PCM/PC 인수는 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / branch | `snd-07` / `codex/snd-07-20261020` |
| 최신 main | fetch 성공 후 `e556b617190c325ca39f5add04357f5dea5ca87e`. game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 선행 / 실행 HEAD | SND-06 `72c7869bd21b5b9c9883f3a81ad4ed85ca8b7f8a`가 main에 없어 그 끝에서 분기. 최신 main은 이미 그 ancestor. 이 HEAD+신규5파일 상태로 실행. SND-01 policy/SND-02 catalog 읽기만 사용 |
| WT | `/Users/fordeargamers/exoduser-wt/snd-07`. worktree add --no-checkout -b → 필요한 경로만 sparse-checkout set --no-cone → 자기 빈 index read-tree 초기화. 웹 대형 bgm/sfx/art checkout0, 캐시 포함 약874MiB |
| R 불변 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, 시작 tracked INDEX/WORK0. fetch/worktree 관리 외 HEAD/branch/tracked INDEX/WORK 변경0 |
| 원본 지시서 / 격리 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md), 옛 제안 이름 대신 사용자 지정 `EXODUSER-snd-07-Isolated-20261020` |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/snd-07/`. 제출 SHA·원격·WT 제거 실측은 DONE.txt/submission.json |

## 신규 파일과 API

| 파일 / API | 현재 계약 |
|---|---|
| `godot/port_modules/sound_source/node_admission.gd` | 독립 RefCounted. admit/evict_lowest/register_node/finish/snapshot/active_count. active 순서·stamp·swap-pop 보존, 중지 callback은 동기 finish 수행. SND-01의 priority와 limits 재사용 |
| sample_parameters | 원본 gain/rate/pan/timeout 계산만. numeric vol/rate/duration의0·NaN은 원본 falsy 처리. gain=min(1,(vol\|\|1)×sfx_gain), pan abs>.05일 때만 clamp±1, timeout=(duration\|\|2)+.5초. pitch로 나누지 않음 |
| spatial_resolved | SND-04 치환 이후 key, 외부 last_t 사전·listener 좌표·gx 배율·clock/RNG/dispatch를 입력받음. 외부 위치/옵션/State를 찾아 연결하거나 새 owner를 만들지 않음. 원본 playSampleAt의 queue 우회 경계 |
| `godot/scripts/native_sound_backend.gd` | 신규 Node. configure(catalog,load_stream,sfx_volume,now_ms,audio_time,source_ready,mobile). 자신이 tree owner이며 독립 active 집합/unique base bus/AudioStreamPlayer/Timer를 소유 |
| 로더 | buffer miss는 catalog 원본 URL로 deferred loader 요청1개/key 후 현재 요청 폐기. READY+stream은 cache, NOT_READY/실패는 pending 해제. PENDING은 유지하고 후속 install_stream/fail_load로 비동기 완료. 어떤 완료도 과거 요청 replay0. 알 수 없는 key에 임의 파일 생성0 |
| dispatch | SND-03 dispatch와 같은 앞5인자(key,vol,rate,startTime,pan)+선택 numeric priority_override. `{ok:true,status:STARTED/DROPPED/UNLOADED_DROP}` 또는 `{ok:false,error}`. priOverride0도 유효. STARTED는 예약 start의 접수도 포함 |
| 실제 음향 자원 | per-voice gain은 AudioStreamPlayer.volume_linear, rate는 pitch_scale. pan 경로만 unique AudioEffectPanner bus를 거쳐 base unity bus→Master. 원본 mbus의 두 번째 sfxVol/EQ/comp는 SND-08 경계이며 여기서 중복 구현0 |
| 수명 / 관측 | finished·원 duration+.5초 Timer·external voice loss·source readiness loss·owner exit 모두 같은 idempotent cleanup. timer는 PROCESS_MODE_ALWAYS 상속/ignore_time_scale. 미래 절대 startTime은 audio_time과의 delay Timer로 처리, play offset으로 오인0. snapshot/voice_node 제공, history는최근64개·누적 starts/ends 별도 |
| `godot/tests/test_sound_source_backend.gd` | 원본 JS 대조와 실제 원본 MP3 decode/playing/자연 finished/실제 timeout/예약 시작/48·16 cap/owner 손실·버스 복구 검사 |
| `godot/tests/build_sound_source_backend_oracle.mjs` | 고정 main의 실제12218–12386 함수/상수 묶음을 Node VM 실행. admission 테스트는 원본 _playSampleNow/_evictLowest 전체, 공간음은 원본 playSampleAt 이후 dispatch만 대역. charIdx0으로 치환 전후 key 동일한 경계를 비교 |
| `godot/tests/fixtures/sound_source_backend_oracle.json` | 원본 JS29시나리오458단계 및 원본 MP3 byte 근거. synthetic buffer/media 대역은 제품 asset registry에 추가하지 않음 |
| docs | 이 보고서와 CHANGELOG_SYNC 최상단 절만 자기 편집. 기존 설계/추적·타인 문서/공용 보드0줄 |

공용6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd)·기존 제품/테스트·원본 HTML/에셋 자체 변경0줄. Q/E·blackBean Q-only·저장 형식·보호 문서 변경0. 원본 에셋 생성/변환/신규 복사0. 기존 MP3 파일을 읽어 메모리에서 decode했으며 PCM/WAV 출력이나 리샘플 파일을 만들지 않았다.

## 최신 main 행·보존한 값

| 원본 game.html 행 | 정확한 동작 |
|---|---|
| 12218–12245 | desktop/mobile active48/16, PROJ **5/2**, HIT3/2, STEP2. source 주석의 PROJ2보다 실제 _MAX_PROJ_NODES 값을 우선. priority는 원본 policy10/9/8/4/3/2/1/0과 분기 순서 재사용 |
| 12246–12252 | 최저 priority·동률이면 (_st\|\|0) 가장 오래된 노드. newPri>minP 또는 newPri>=SKILL10 && >=minP만 교체. 같은 VOICE9 거부, 같은 SKILL10 oldest 교체. stop→_dn 순서 |
| 12253–12260 | buffer gate 먼저, 미로드는 현재 요청 폐기. footstep count>=2면 자기 oldest를 먼저 중지/정리. 이후 override가 PROJ여서 새 요청이 cap에 막혀도 이미 수행한 STEP 정리를 되돌리지 않음 |
| 12262–12267 | pri<=PROJ일 때 PROJ 이하 count; 아니고 pri<=HIT이면 HIT 이하(PROJ 포함) count. 그 다음 전체48/16 포화 때만 eviction. footstep 기본pri3은 HIT 제한을 받지 않음 |
| 12268–12279 | rate=rate\|\|1, gain=min(1,(vol\|\|1)×sfxVol). vol0도1 fallback이며 sfxVol0은0. duration=buffer.duration\|\|2. 생성 시performance.now stamp, cleanup bool guard·count감소·swap-pop |
| 12280–12294 | pan abs>.05면 clamp±1 StereoPanner, 아니면 direct gain 경로. ended와 (duration+.5)초 timeout은 같은 guard 사용. source disconnect와 native stop/노드·bus제거는 각각 backend 수단이며 PCM 동등성은 미확인. source의 connect/start throw는 cleanup 후 전파, native는 감지한 start 실패를 cleanup 후 명시 error packet |
| 12372–12377 | 치환 후 empty key/P 없음 gate. 비skill만30ms stamp; footstep도 이 함수에서는30ms 제한. 거리/volume에서 떨어져도 이미 찍힌 stamp 유지. 독립 last_t 인자이므로 실제 queue/게임 stamp owner 연결0 |
| 12378–12385 | d=sqrt(dx²+dy²), d<=1200은1, 이후 max(0,1−(d−1200)/800). falloff<.01 drop, pan=clamp(dx/600,±.7), v=vol×falloff²×(gx<1?gx:1), v<.01 drop. rate×(.92+random×.16), start0, priOverride를 즉시 backend로 전달 |

## 실제 원본 byte·검증

| 원본/네이티브 witness | 값 |
|---|---|
| 원본 sample key / 경로 | sword_swing1 / `sfx/swing/sword_swing1.mp3` (SND-02 원문 map) |
| 기존 native 참조 | `godot/assets/sfx/attack_source/sword_swing1.mp3` |
| main 원본·native SHA256 | `43393696dee07a0cc54c20011e26824a7adae6fababfd71154c699061ac812e2` 양쪽 동일, 43,821byte |
| 실제 엔진 관측 | AudioStreamMP3 duration1.75999999046326초, driver Dummy. 실제 AudioStreamPlayer.playing·stream identity·gain/pitch·AudioEffectPanner·Timer 확인. PCM/가청 출력/청감은 검증 안 함 |

새 테스트는 지정SND-07 USERDIR, 기존 SND-01~06은 각 파일 상수 USERDIR, 상수 없는 contracts는 SND-07 override다. 매 Godot 직전 사용자 지정 pgrep count 확인,2 이상이면30초 대기. new-03-verbose는 count2→30초 후1, 나머지는 count1 시작. 실행마다 override를 쓰고 finally0byte. `.out/.err/.engine.log/.meta.json`에 실행 경로/HEAD/시각/count/PID/exit/출력SHA 보존. contracts용 엔진 캐시1006파일 동일 byte 복사만 수행(import0)했다.

| 검사 / 원로그 | 실제 결과 |
|---|---|
| new-01 / new-02-verbose | 단정1962/0이나 종료 ObjectDB WARNING 각각8/6개 잔류. **완료 보류**, clean PASS로 합산 안 함. verbose가 AudioStreamMP3/PlaybackMP3 참조를 식별. 원로그 보존 |
| new-03-verbose | 테스트 owner 제거 뒤 AudioServer mixer의 stop playback 해제를150ms drain하고 witness 참조 해제. 당시1962/0·exit0·stderr 비어 있음. 제품 stop을 지연시키거나 노드 정리를 생략하지 않음 |
| new-04-verbose / new-05 | 이후 timer time-scale·미디어 검증/실패 재시도·priority0 fixture, 예약 실제 시작 검사 보강. 각각1996/0,1998/0, exit0/stderr 비어 있음. 최종 전체 수치와 합산 안 함 |
| **new-06 최종** | **2,004단정/0실패·exit0·stderr 비어 있음**, isolated=true/Main_booted=false/nodes_left0. 비동기 PENDING/실패 완료/재시도/과거 요청 replay0까지 포함 |
| external-comparison-final.json | source JS29시나리오458단계,65,827 scalar leaf 불일치0. 수치 허용 상대오차1e−12/최대차4.440892098500626e−16. 배열 순서·key·문자열·null·boolean 정확 대조 |
| fixture 재생성 / 입력 | source-oracle.json과 rebuilt byte 동일. 최종코드/테스트/fixture는 new-06 launch보다 앞서 작성, tested-inputs-final.json의 SHA와 staged blob 대조 |
| 실제 엔진 경계 | 자연 finished1회·뒤늦은 cleanup 불변, rate.1의 timeout이 자연끝보다 먼저 정리, pan.05 미할당/.7 전달/±1 clamp, sfx0·vol0 fallback, future start 전 무음/Timer 후 playing, external voice loss, source readiness loss, owner exit. bus_count 최초1/최종1 |
| cap 테스트 범위 | 실제 원본 stream 하나+명시 priority override로48/16·VOICE9 거부/SKILL10 동일 교체·PROJ5/2·HIT 포함 검증. STEP 두 key는 테스트 전용으로 같은 stream을 주입해 admission 배선만 검사; **실제 footstep 원음 매핑/청감 검증 아님**, 제품 alias 추가0 |
| contracts | 전체5그룹/failed_assertions0/exit0/stderr 비어 있음, only=[] |
| policy / catalog / queue / voice-selector | 기존 SND01~04 각각1194/0·687/0·606/0·2435/0, exit0/stderr 비어 있음 |
| bgm-selection / bgm-lifecycle | 기존 SND05~06 각각1308/0·2400/0, exit0/stderr 비어 있음 |
| 웹 관련 회귀 | audioBootLoading/audioContextResumeGate/footstepAudioPriority 3파일7tests/pass7/fail0/skipped0/exit0/stderr 비어 있음 |
| 보존 | 기존 tracked game.html/godot **1,332파일 SHA256 전부 동일**. 공용·기존 test·asset0줄, staged삭제0, override 최종0byte |

단정·그룹·웹 tests·leaf는 서로 다른 분모라 합산하지 않는다. 알려진 선재 결함 전달 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 원문만 보존하며 전체 로비 재실행/수정/추가 판정0이다.

## 경계·제출·재현

독립 backend의 풀은 기존 Main/skill의 풀과 합산하지 않는다(`shared_game_cap=false`). 공통48상한 통합과 실제 OPT/State·자연 frame/공간 listener 연결은 후속 공용 소유 조정이 필요한 범위라 구현하지 않았다. 이번 순서안은 신규 독립 backend를 허용하므로 이 단위에 공용·State 변경 필요 없음. SND-08 이후는 자동 착수하지 않는다.

유효 string key·유한 numeric 인자/양수 pitch·원본 buffer에 대응하는 양수 길이의 읽기 전용 AudioStream·정상 callback 계약이 대상이다. 순수 계산기는 source falsy duration0→2도 대조하지만 실제 native 빈/잘못된 stream은 NOT_READY로 거부한다. 음수 gain/pitch·음수 startTime처럼 native로 동등 표현 못하는 입력은 error packet이며 묵시 clamp 재생하지 않는다. 임의 GDScript 런타임 예외 catch, 브라우저 AudioContext 해제/autoplay, fetch/decode4-worker preloader 전체,233개 미디어 이식, WebAudio panner 곡선·sample-accurate scheduling·EQ/컴프레서·청감/PCM/PC 동등성은 검증 밖이다. loader는 read-only adapter seam이며 원문 URL을 임의 native 파일명으로 바꾸는 제품 registry를 추가하지 않았다.

정확한 신규5경로+이 보고서/CHANGELOG만 stage, ignore된 새 test 하나만 경로 지정 add -f, 정상 docs pre-commit 훅을 통과시킨다. 자기 branch만 비강제 push 후 원격 SHA를 대조하고 DONE.txt를 쓴 다음 자기 snd-07 worktree만 worktree remove --force로 제거한다. branch·원격·원로그·보고서 사본 보존. git add -A/main push/push force/rebase/훅 우회0. 실제 SHA/정리/R 불변 재확인은 Git 밖 DONE/submission.json에 기록한다.

관련 docs 전체 tracked 검색80행을 docs-keyword-search.txt에 보존했다. 기존 웹 기획/추적 수치 변경 없이 이 보고서·CHANGELOG에 native 구현·검증 경계를 추가했다. 재현은 자기 branch의 새 sparse WT에서 다음 runner로 실행한다(원음은 기존 파일 참조).

```sh
node godot/tests/build_sound_source_backend_oracle.mjs ~/exoduser-wt/_out/snd-07/source-oracle.json
python3 ~/exoduser-wt/_out/snd-07/run_godot.py ~/exoduser-wt/snd-07 new-06 test_sound_source_backend EXODUSER-snd-07-Isolated-20261020
```
