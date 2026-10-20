# snd-06 — 원본 BGM 전이·수명 모델

## 결과와 기준

**독립 모델 구현·검증 완료, 자기 브랜치 제출 대상.** SND-05 선곡기를 소비하는 BGM cache/전환/재생 거부/fade 모델이다. 주입한 fake media·명시 타이머·Promise 완료 순서로 원본 JS 객체와 대조했다. 실제 음악 재생·브라우저 autoplay·Godot 장치·실게임·청감·PC 인수는 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / branch | `snd-06` / `codex/snd-06-20261020` |
| 최신 main | fetch 후 `e556b617190c325ca39f5add04357f5dea5ca87e`. game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 의존 / 실행 HEAD | SND-05 `e7a87f7e558150c1a4a511432aa691184231f2fb`가 main에 없어 그 끝에서 분기. 최신 main은 이미 그 ancestor여서 추가 merge 불필요. 이 HEAD의 WT에 신규4파일을 둔 상태에서 테스트 |
| WT | `/Users/fordeargamers/exoduser-wt/snd-06`. worktree add --no-checkout -b 후 sparse-checkout set --no-cone 및 새 빈 index read-tree 초기화. 코드/테스트/필요 docs/HTML/훅만 checkout. 웹 대용량 미디어 폴더0 |
| 원본 지시서 | [사운드 추적 §4.2 SND-06](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 과거 제안 격리명 대신 사용자 지정 `EXODUSER-snd-06-Isolated-20261020` 적용 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. 시작 tracked INDEX/WORK0. R의 HEAD/branch/tracked INDEX/WORK 보존 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/snd-06/`. 제출 SHA/원격/정리 실측은 Git 밖 DONE.txt·submission.json |

## 신규 파일과 주입 계약

| 파일 / API | 구현 범위 |
|---|---|
| `godot/port_modules/sound_source/bgm_lifecycle.gd` | 독립 RefCounted, class_name/Node/미디어 IO 없음. 생성자(selection, backend, read_context, random_unit). SND-05 selector 상태를 단일 권위로 사용. 옵션·stage·컷신 owner 신규 생성0 |
| 상태 | `_cur/_cur_key/_vol=.3/_fade`, cache/LRU/pending/bound/pendingExtra. bad/last/playedSets/actDone은 SND-05 상태에 기록. snapshot_state는 컨테이너 복사, Audio/타이머는 backend의 identity handle 그대로 |
| 공개 동작 | get_audio, play, play_track, on_ended, on_interact, stop, fade_out, set_volume, enqueue_pending_extra. pendingExtra 접점은 원본 외부 push만 표현하며 listener 설치/재생을 미리 하지 않음 |
| 준비 상태 | status READY 또는 NOT_READY/dependencies_unavailable 및 누락 backend method/selector 상태. backend·selector·context reader·RNG가 없으면 미디어 호출0. 정상 무곡 null과 준비 실패를 구분 |
| backend | create_audio(src), set_interval(callback,ms), clear_interval(handle), set_timeout(callback,ms), add_listener(event,callback,passive), remove_listener(event,callback), set_legacy_volume(value). 등록 중 timer callback 동기 호출 금지, 고유 handle 필요 |
| Audio adapter | preload_mode/volume/current_time/loop, on_ended/on_error Callable(비어 있으면 없음), play(success,reject), pause/remove_src/load. preload는 GDScript 예약어라 adapter property만 preload_mode로 표기. 원본 값 auto는 보존. play 완료는 비동기로 한 번 통지 |
| 현재 context | `{bgm_track, cutscene_state?, force_cutscene?, game?:{stage,cutscene_done,on}\|null}`를 동작 시 주입 reader로 읽음. context game 키 부재는 원본 G 미선언과 구분. 외부 OPT/state 자체 수정·저장0 |
| `godot/tests/test_sound_source_bgm_lifecycle.gd` | 지정 격리·Main 미기동 검증. native fake Audio/명시 Promise settlement·listener registry·timer callback을 사용해 모든 단계의 반환/명령/모델 상태/media 상태를 대조 |
| `godot/tests/build_sound_source_bgm_lifecycle_oracle.mjs` | 고정 최신 main의 실제 `const BGM={...}` 전체를 git show로 읽어 Node VM에서 실행. 함수 본문/조건/상수 교체0. fake Audio/document/timer/Promise·RNG만 주입 |
| `godot/tests/fixtures/sound_source_bgm_lifecycle_oracle.json` | 원본 JS 실행 기대값. 실제19풀과 synthetic a/b/c 등 수명 경계 입력을 분리. synthetic 문자열은 제품 카탈로그나 실제 미디어 파일이 아님 |
| docs | 이 보고서와 CHANGELOG_SYNC 최상단 절만 직접 편집. 기존 추적/사운드 기획/공용 보드 및 다른 담당 파일0줄 |

SND-05의 catalog/selection을 읽기만 했다. 공용6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd)·기존 제품/테스트·HTML·원본 에셋 자체 수정0줄. 원본 음원 생성·변환·복사·디코드·가청 재생0. Q/E/blackBean Q-only·저장 스키마·보호 문서 변경0.

## 최신 main 행과 정확한 동작

| game.html 행 | 보존한 규칙 |
|---|---|
| 3981 / 4038–4053 | 초기 volume .3, cache 최대6. cache miss에서 Audio 생성→preload auto→onerror 등록. cache hit는 같은 Audio identity를 재사용하며 LRU 끝으로 이동 |
| 4043 | error는 src bad=1/cache/LRU 삭제. 현재 Audio와 동일하면 cur=null 후 300ms timeout으로 onEnded. key/pending/last를 지우거나 즉시 대체곡을 재생하지 않음. 오래된 error도 같은 src의 새 cache entry를 지우는 원본 순서 유지 |
| 4046–4051 | LRU6 초과 시 현재 객체와 다른 첫 항목만 pause→src 제거→load→삭제. 새로운 곡을 cur로 지정하기 전에 실행됨. 같은 경로 문자열과 객체 identity를 혼동하지 않음 |
| 4091–4105 | pending/bound/pendingExtra 초기 상태, click/keydown/pointerdown/touchstart/mousemove 5종. pending+cur이면 play; 성공 callback에서 pending=null·5종 listener 제거·bound=false. 실패는 무시. extra는 cur/pending 유무와 무관하게 FIFO로 비우며 play 거부 무시 |
| 4106–4123 | ended는 현재 key 없으면 return. auto 장이면 actDone→allRandom 또는 actFirst, null이면 allRandom. allRandom 옵션이면 이벤트 key도 전체 랜덤. 다음 src가 없으면 fade도 유지. 있으면 fade 해제/null→last→getAudio→volume/time0/onended→play.catch 무시→cur. **loop=false 재대입 없음** |
| 4124–4139 | 직접곡 stop→key=_track→last→getAudio→volume/time0/loop=true/onended 없음→play→cur. 거부 시 pending=_track 및 5종 passive listener 설치. INTRO/옵션 gate를 별도로 적용하지 않음 |
| 4140–4149 | cutscene_ 이외 key에 INTRO_CUTSCENE/forceCutscene 미완/si0 미완·게임off gate를 먼저 적용. **force도 INTRO를 우회하지 못함**. forceCutscene=true에서 G가 미선언이면 원본 try의 ReferenceError 이후 probe도 생략되는 결과 유지 |
| 4150–4151 | !force일 때 t: 옵션 잠금(이벤트 key도 차단). 특정 풀 고정이면 death/victory/forge 또는 옵션과 같은 key만 허용. force는 이 옵션 잠금만 우회 |
| 4152–4173 | stop 후 key 기록. auto 장은 해당 played set/reset→actFirst→null이면 mixed. allRandom의 death/victory/forge/cutscene_ 예외 보존. 무곡이면 key는 남음. 재생은 loop=false, death/victory의 ended만 없음. 늦은 Promise reject에는 세대/현재 Audio 검사를 추가하지 않음 |
| 4174–4186 | stop은 fade 캡처→null→clear. cur가 있을 때만 onended 해제/pause/time0/cur=null/key=''. **pending/listener/bound/extra/last/played 상태 삭제 없음**. cur가 없으면 key만 따로 지우지 않음 |
| 4187–4206 | fade step=현재 volume/(dur/50), interval **50ms**. fade handle이 다르면 즉시 무효. 현재 Audio가 다르면 자기 timer만 clear/null. 동일 cached Audio를 재시작한 뒤에도 이전 handle은 음량/재생을 바꾸지 않음. 0 도달 시 timer clear/null→onended 해제/pause/time0/동일 cur/key 정리 |
| 4207 | volume 저장→cur volume→있는 legacy gain A/B 값. 0도 그대로 전파. backend는 현재 gain만 받으며 legacy bgmPlay/2초 crossfade를 주 음악으로 승격하지 않음 |

## 검증 결과와 원로그

Godot 4.7.2 stable official을 사용했다. 매 실행 직전 사용자 지정 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인, 이번 모든 실행은 count1에서 시작했다. count2 이상이면 runner가30초씩 대기하도록 되어 있다. 자체 엔진 실행은 순차이며 count/시각/argv/PID/HEAD/exit/출력SHA를 각 `.meta.json`에 기록한다.

새 테스트는 SND-06 격리명, 기존 SND-01~05는 각 파일 USERDIR 상수를 사용했다. contracts에는 상수가 없어 SND-06 격리 override 적용. override는 실행마다 쓰고 finally0byte, 로그는 Git 밖 `--log-file` 지정. contracts 준비는 기존 검증 WT의 **엔진 캐시1006파일 동일 byte 복사**만 했으며 import0/원본 에셋 변환0이다(engine-cache-copy.json).

| 검사 / 원로그 | 실제 결과 |
|---|---|
| new-01 | **실패**: 테스트의 `var preload`가 GDScript 예약어와 충돌해 parse error. RESULT 없음, 엔진 exit0이었으나 PASS로 계산하지 않음. stdout/stderr/engine/meta 모두 보존 |
| new-02 | adapter property만 preload_mode로 정정 후 **2,400단정/0실패, exit0, stderr 비어 있음**. 원본 JS93시나리오·483단계, isolated=true/Main_booted=false/audio_nodes0 |
| external-comparison.json | native 출력 전체를 별도 Python 비교. 93시나리오483단계/20,339 scalar leaf, 불일치0. 배열·key·문자열·boolean·null 정확 대조, 수치 상대오차1e−12 이내/최대차1.6653345369377348e−16 |
| generator 재현 | fixture 재생성 byte 동일. source-oracle.json/source-oracle-rebuilt.json, tested-inputs.json. 제품 카탈로그/기존 generator 변경0 |
| 핵심 시나리오 | 19풀·7장 재입장, t잠금/force/INTRO, death/victory ended 없음, late reject/old interact success, listener5종 설치1회/해제/재설치, extra FIFO, 현재/과거 error 및300ms/새 key 참조, LRU6/현재 보존, 50/100/125/300/500/800/1000ms fade, 같은 Audio/옛 handle 무효, volume0/legacy gains, ended의 cached loop=true 보존, null 선곡 분기 |
| contracts | 전체 **5그룹/failed_assertions0/exit0/stderr 비어 있음**. only=[]로 map/charge/projectile/pause_capture/damage 전부 실행 |
| bgm-selection | 기존 SND-05 **1,308단정/0실패/exit0/stderr 비어 있음**,46시나리오225단계 |
| voice-selector | 기존 SND-04 **2,435단정/0실패/exit0/stderr 비어 있음** |
| queue | 기존 SND-03 **606단정/0실패/exit0/stderr 비어 있음** |
| catalog | 기존 SND-02 **687단정/0실패/exit0/stderr 비어 있음** |
| policy | 기존 SND-01 **1,194단정/0실패/exit0/stderr 비어 있음** |
| web-audio | audioBootLoading/audioContextResumeGate **2파일/4tests/pass4/fail0/skipped0/exit0/stderr 비어 있음** |
| 보호 범위 | 기존 tracked game.html/godot **1,328파일 SHA-256 전부 동일**. 공용·기존 테스트·에셋0줄. sparse 제외 staged삭제0, override 최종0byte |

단정 수·contracts 그룹·웹 tests·대조 leaf는 분모가 달라 합산하지 않는다. 알려진 선재 결함 사용자 전달 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 이 원문만 보존하며 로비 suite 재실행/수정/추가 판정은 하지 않았다.

## 검증 경계와 다음 접점

- **대역 범위**: Audio 필드·명령/Promise 결과/타이머 순서 모델이다. fake의 paused 상태는 settlement 시점의 대역 관측이며 HTMLMediaElement의 디코드/playing 시각 증거가 아니다. browser autoplay 차단 정책과 Godot device 오류가 동등하다고 주장하지 않는다.
- **입력 계약**: string key/src/옵션, 유효 RNG[0,1), 양수·유한 fade duration 및 정상 필드/정상 backend가 대상이다. JS object key 강제변환·prototype 특수 property·DOM setter 범위 예외·임의 GDScript 예외 catch·backend가 동기 throw하는 경우는 지원 밖이다. 재추첨 cap이나 입력 음량 보정은 추가하지 않았다.
- **callback 수명**: backend는 Audio·timer·listener·재생 완료 callback을 소유한다. 테스트는 마지막 관측 후 release_callbacks로 RefCounted 대역의 순환 참조를 해제한다. 이것을 원본 stop에 섞지 않는다. 실제 adapter/owner 종료에서 callback 해제·장치 노드 정리는 후속 SND-09 검증 사항이다.
- **공용 접점**: 이번에는 필요 없음. Main configure·자연 stage/boss/forge/death·옵션 owner 연결0줄. SND-07/후속 단위는 착수하지 않았다. 이후 공용 수정이 필요하면 사용자 지시대로 위치/필요 줄/원본 근거만 보고한다.

## 제출과 재현

정확한 자기 신규 경로4개와 보고서/CHANGELOG만 stage한다. ignore 대상 새 test 하나만 경로를 지정해 add -f 한다. 정상 pre-commit 훅과 docs-sync-check를 통과한 후 자기 branch만 비강제 push한다. git add -A/main push/push force/rebase/훅 우회0.

사용자 지정 순서: **push→원격 SHA 일치 확인→Git 밖 DONE.txt 작성→자기 snd-06 WT만 worktree remove --force**. branch/원격/원로그/보고서 사본은 남긴다. 여기서 --force는 사용자 지정 WT 정리용이다. 실제 제출 SHA/제거 결과/R 불변 재확인은 DONE.txt·submission.json에 보존한다.

WT 제거 후에는 자기 branch의 새 sparse WT에서 재현한다. 아래 runner는 매 실행 count 확인과 override 정리를 수행한다.

```sh
node godot/tests/build_sound_source_bgm_lifecycle_oracle.mjs ~/exoduser-wt/_out/snd-06/source-oracle.json
python3 ~/exoduser-wt/_out/snd-06/run_godot.py ~/exoduser-wt/snd-06 new-02 test_sound_source_bgm_lifecycle EXODUSER-snd-06-Isolated-20261020
```

관련 docs 전체 tracked keyword 검색452행은 docs-keyword-search.txt에 보존했다. 기존 웹/음향 기획과 원본 추적의 값은 바꾸지 않고 이 보고서·CHANGELOG에 native 독립 구현 상태와 검증 경계를 추가했다.
