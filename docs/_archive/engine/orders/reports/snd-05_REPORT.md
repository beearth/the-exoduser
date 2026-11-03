# snd-05 — BGM 카탈로그·순수 선곡

## 기준과 범위

**구현·독립 검증 완료 / 자기 브랜치 제출·검수 대상.** 원본 BGM의 경로 표·SI 장 매핑과 네 가지 선곡 함수, played-set/reset 상태만 이식했다. 기존 음악 재생기·stage/옵션 owner·Audio/cache/fade/lifecycle은 연결하지 않는다. 실곡 재생·청감·실게임·PC 인수는 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / 브랜치 | `snd-05` / `codex/snd-05-20261020` |
| 실행 source | `/Users/fordeargamers/exoduser-wt/snd-05/godot` (실행 당시 경로. 제출 뒤 사용자 지시대로 WT 제거) |
| 최신 main | fetch·원격 확인 `e556b617190c325ca39f5add04357f5dea5ca87e`. game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 선행 / 최신화 | 앞 단위가 main에 없어 SND-04 인수 끝 `576b152f0a2bacc70c3542e33b64c17bc4ba9ae0`에서 분기. 최신 main을 정상 merge한 `ca3f045c6d95499958391895d0dcf1e93e9e93b0`에서 구현·검증. main의 다른 담당 문서2파일 변경은 merge로만 인수. 자기 수정으로 계산하지 않음 |
| 작은 WT | 사용자 지정 worktree add --no-checkout -b→필요 경로만 sparse-checkout set --no-cone→자기 빈 index를 HEAD로 초기화. 코드 편집 전 tracked INDEX/WORK0. bgm/sfx·웹 대형 아트·백업 폴더 checkout0. godot·test·필요 docs/engine/사운드 문서·원본 HTML·훅/도구 등만. 엔진 캐시 포함 약873MiB |
| 원본 지시서 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 옛 제안 격리명 대신 이번 `EXODUSER-snd-05-Isolated-20261020` 적용 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. 시작 tracked INDEX/WORK0. R 코드·branch·index 수정0 |

## 신규 파일·API

| 파일 / API | 현재 계약 |
|---|---|
| `godot/data/sound_source_bgm.json` | 원본 tracks19풀·gameplay50, 별도 legacy_bgm_map8키, canonical si_to_hell35개. 경로 문자열·순서·중복 그대로. 미디어 생성·변환·파일 가용성 증거 아님 |
| `godot/port_modules/sound_source/bgm_catalog.gd` | RefCounted·class_name 없음. JSON 읽기·shape 검증 후 카탈로그 게시. status/snapshot/tracks_for/all_random_entries/legacy_snapshot/stage_key. 모든 반환 컬렉션 깊은 복사 |
| catalog status | READY와 pool_count19/gameplay_count50/all_random_count57/stage_count35/legacy_count8. 실패 시 NOT_READY/file_unavailable·json_invalid·shape_invalid 사유/path. 실패를 빈 정상 카탈로그로 반환하지 않음 |
| stage_key(si:int) | 유효0..34만 원본 SI_TO_HELL[si]+1의 hell1..hell7. invalid는 UNSUPPORTED/invalid_stage_index. 원본 invalid의 hellNaN을 임의 새 stage로 보정하지 않으며 그 호환성은 지원 밖 |
| `godot/port_modules/sound_source/bgm_selection.gd` | 독립 RefCounted. 생성 시 catalog의 tracks 복사. pick_random/pick_all_random/pick_act_first/pick_mixed에 RNG[0,1) Callable 주입. 자체 Node·IO·clock·RNG·재생·옵션 gate 없음 |
| 선곡 결과 | READY/src(String 또는 원본 null). 무곡 null은 정상 결과이며 NOT_READY/bgm_catalog_unavailable과 구분. 재생 성공 여부가 아님 |
| 상태 API | mark_bad(src)→1, set_last_src(src), reset_act(key), snapshot_state/status 복사. picker 자체는 last_src를 쓰지 않음. source play/onEnded가 별도로 하던 기록은 후속 lifecycle 책임 |
| `godot/tests/test_sound_source_bgm_selection.gd` | 19풀·전체57entry·35SI·legacy 별도·반환 격리·readiness와 원본 JS 46시나리오225단계의 선곡/RNG/상태 대조 |
| `godot/tests/build_sound_source_bgm_oracle.mjs` | 고정 main의 실제 BGM 객체·legacy BGM_MAP·CHAPTER_STAGES와 SI 생성 loop를 Node VM에서 실행. 제품 JSON과 원본 기대값 생성. GDScript로 기대값 생성0 |
| `godot/tests/fixtures/sound_source_bgm_oracle.json` | 실제 원문 결과와 명시적 synthetic 경계 fixture(dup/a/b/only/fallback 등). fixture는 원본 함수에도 같은 입력으로 실행하며 제품19풀에 섞지 않음. 미디어 에셋 아님 |
| docs | 이 보고서와 CHANGELOG 최상단 절만 자기 편집. 공용 보드·기존 설계/추적 원문 보존 |

공용6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd), 기존 제품·테스트·HTML·원본 에셋 자체 수정0줄. Q/E·blackBean Q-only·docs/2_3·세이브 형식 보존. 원본 BGM을 native로 복사·디코드·생성·변환하거나 가청 재생하지 않았다.

## 최신 main 행·보존한 선곡 동작

| 원본 game.html 위치 | 정확 계약 |
|---|---|
| 3982–4037 | tracks19풀·gameplay50곡. hell1~7 각각1곡. all-random은 hell1..7→gameplay 순서의 **57개 entry**, unique로 줄이지 않음. Ashes of the Fallen Gate는 hell1/gameplay에서2회 가중치 유지 |
| 4054–4063 `_pickRandom` | 미존재/빈 풀·전부bad는 null/RNG0. nonbad가1entry면 바로 반환/RNG0, last와 같아도 허용. 2entry 이상이면 RNG·직전 src 재추첨 |
| 4064–4071 `_pickAllRandom` | 지정8개 key 순서로 nonbad entry를 전부 append. 중복 유지. 빈 배열이면 null/RNG0. 1entry도 RNG1회. 다수면 last와 다른 값이 나올 때까지 재추첨 |
| 4072 `_isActKey` | 정확 hell1..hell7만. 대소문자·접미문자·개행·hell01·hell0/8은 false. 원본 regex 결과와 대조 |
| 4074–4083 `_pickActFirst` | 빈/없는 arr은 played set을 새로 만들지 않고 null. nonempty면 Set 준비→미재생/nonbad만. 소진 시 actDone=true/null/RNG0. 후보 있으면 1개여도 RNG1, last 재추첨 후 Set.add(경로 중복은1개), Set.size≥현재 nonbad entry 수이면 actDone=true |
| 4085–4090 `_pickMixed` | 해당 장 원배열+gameplay 배열 후 bad 필터. 중복 유지. 빈 경우 null, 1entry도 RNG1, 다수면 last 재추첨 |
| 4094–4095 / 4154–4157 | playedSets/actDone 상태. auto 장 재입장 때 해당 key의 played set만 비우고 actDone=false. last/bad/다른 장은 유지. 첫 pickActFirst가 null이면 pickMixed. 테스트는 실제 source BGM.play와 native 선곡 segment를 대조하되 Audio는 대역이며 gate·stop/fade·autoplay 인수 아님 |
| 4208–4211 / 16633–16642 / 16658–16666 | canonical CHAPTER_STAGES의4/6/4/7/5/6/3개 stage가 각0..6장으로 매핑됨. 유효35SI의 stageKey 전부 대조. 기존 native 지역 owner를 새로 쓰거나 교체하지 않음 |
| 10381–10390 | legacy BGM_MAP title+hell0..6 explore/boss는 별도 데이터. 실제 tracks19풀과 섞거나 title을 active pool로 새 등록하지 않음. legacy bgmPlay의 전환·backend 구현0 |

재추첨에 시도 상한·dedup·대체곡을 추가하지 않았다. 주입 RNG가 계속 last를 고르거나 남은 다수 entry가 전부 같은 last인 경우 원본처럼 종료가 보장되지 않는다. 이번 테스트는 last를257회 고른 뒤 다른 곡을 고르는 **RNG258회**의 유한 trace까지 확인하며 무한 실행을 돌리지 않는다. 유효 풀/일반 missing key·String src·RNG[0,1)를 전제하며 JS prototype 특수 property·비문자 강제변환·범위 밖 RNG는 지원 밖이다.

## 검증·격리·원로그

원로그: `/Users/fordeargamers/exoduser-wt/_out/snd-05/`.

모든 Godot 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`이2 이상이면30초씩 대기한다. `run_godot.py`는 count/시각·HEAD·argv·PID·exit·stdout/stderr SHA를 `.meta.json`, 출력은 `.out/.err/.engine.log`로 보존한다. 새 테스트는 지정SND-05 격리명, 기존4단위는 각 USERDIR 상수. override는 매번 쓰고 finally0byte. contracts는 상수가 없어 SND-05 override 사용, 원 주석대로 save_report 호출0. 모든 엔진 로그는 Git 밖 --log-file.

contracts 준비는 검증된 SND-04 WT의 엔진 캐시1006파일 동일 byte 복사만 수행했다(`engine-cache-byte-copy.json`). Godot import·원본 에셋 변환0.

| 검사 | 실제 결과 |
|---|---|
| 기대값 생성 이력 | 첫 generator 실행은 act-first-reentry-hell1의 RNG=.25가 중복된 last를 다시 골라 추가 RNG가 필요해 중단. fixture 입력을 [.25,.999999]로 정정. 원본 함수·제품 코드 수정 없음. 최초 도구 stack은 세션 응답, 사유는 source-oracle-build-01-diagnostic.txt, 정상 생성 stdout/stderr는 build-02 원로그에 보존. native 테스트 실패로 섞지 않음 |
| bgm-01 | 첫 native 유효 실행 **1,308단정/0실패/exit0/stderr 비어 있음**, 46시나리오·225단계·isolated=true·Main_booted=false |
| 독립 trace 대조 | 실제46시나리오225단계/1,327scalar leaf 불일치0. 수치 상대오차 허용1e−12, 최대차5.551115123125783e−16. 경로·배열/Set 순서·Dictionary key·null·boolean은 정확 대조. oracle-comparison.json |
| 재생성 | fixture SHA256 `4a65b7ad1e71125e95613ad729bfd55e52733174b2d1cbb8de38ed2ccf95ae4d` 및 제품 JSON 모두 테스트 때와 동일 byte. source-oracle-rebuilt.json 및 tested-implementation-hashes.json |
| 웹 관련 회귀 | audioBootLoading/audioContextResumeGate **2파일·4tests/pass4/fail0/skipped0/exit0/stderr 비어 있음**. 다른 로비 suite를 이 결과에 포함하지 않음 |
| contracts-01 | 전체5그룹/failed_assertions0/exit0/stderr 비어 있음. only=[]로 map/charge/projectile/pause_capture/damage 전부 실행 |
| policy-01 | 기존 SND-01 **1,194단정/0실패/exit0/stderr 비어 있음**, isolated=true·Main_booted=false |
| catalog-01 | 기존 SND-02 **687단정/0실패/exit0/stderr 비어 있음**, isolated=true·Main_booted=false |
| queue-01 | 기존 SND-03 **606단정/0실패/exit0/stderr 비어 있음**, isolated=true·Main_booted=false |
| voice-01 | 기존 SND-04 **2,435단정/0실패/exit0/stderr 비어 있음**, isolated=true·Main_booted=false |
| 과부하·정리 | 신규bgm와contracts는 각각 count2에서30초 간격4회 대기 후count1 시작. 나머지4개도 각각count1. 자체 Godot 순차 실행. override 최종0byte |
| 보호 범위 | 기존 tracked game.html/godot **1,322파일 SHA-256 전부 동일**. 기존 제품·테스트·원본 에셋 수정0, sparse 제외 파일 staged삭제0. protected-baseline.json/scope-precommit.json 및 최종scope.json |

알려진 선재 결함 사용자 전달 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 지시대로 원문만 기록하며 재실행·원인 추가 판정·로비 수정·정상 PASS 합산을 하지 않는다.

새 테스트는 merge HEAD ca3f045c의 WT에 신규6파일이 있는 상태에서 실행했다. tested-implementation-hashes.json의 테스트 입력 바이트와 staged blob을 대조한다. 단정·contracts 그룹·웹 tests·비교 leaf는 다른 분모이며 전체 게임/로비 PASS로 합치지 않는다.

## 제출·정리·재현

경로 지정 stage·정상 pre-commit 훅·자기 브랜치 비강제 push 후 원격 SHA 일치 확인. ignore 대상 새 test만 `git add -f -- godot/tests/test_sound_source_bgm_selection.gd`. git add -A·main push·git push --force·rebase·훅 우회0.

사용자 지시의 순서대로 **push와 원격 SHA 확인→Git 밖 DONE.txt 작성→자기 snd-05 worktree만 git worktree remove --force로 제거**한다. 브랜치/원격/원로그/보고서 사본은 보존한다. 이 --force는 승인된 자기 worktree 정리용이며 push에 사용하지 않는다. 다른 담당 WT나 이전 단위 WT를 삭제하지 않는다.

WT 제거 뒤 원격 브랜치 또는 Git 밖 `snd-05_REPORT.md` 사본으로 보고서를 읽을 수 있다. 재현할 때는 남아 있는 브랜치를 새 sparse WT에 받는다. 생성·단위 실행 형태:

```sh
node godot/tests/build_sound_source_bgm_oracle.mjs ~/exoduser-wt/_out/snd-05/source-oracle.json
python3 ~/exoduser-wt/_out/snd-05/run_godot.py ~/exoduser-wt/snd-05 bgm-01 test_sound_source_bgm_selection EXODUSER-snd-05-Isolated-20261020
```

코드 변경 후 관련 docs 검색은 docs-search.txt와 최종 검색 파일에 보존한다. 실제 음악·메모리 캐시·불량 파일 감지·autoplay·장 자연 진입·청감·PC 인수는 후속 SND-06 이후이며 이번 fixture로 완료를 주장하지 않는다. 다음 단위는 자동 착수하지 않는다.
