# snd-04 — 보이스 선택 상태

## 기준과 범위

**구현·독립 검증 완료 / 자기 브랜치 제출·검수 대상.** 원본 `_silvertailVoiceKey`의 42개 논리 key 치환·변형 선택·10초 stamp 상태를 이식했다. 기존 캐릭터·재생기·holy2 voice caller·공용 frame에는 연결하지 않는다. 실청취·실게임·PC 인수는 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / 브랜치 | `snd-04` / `codex/snd-04-20261020` |
| 실행 source | `/Users/fordeargamers/exoduser-wt/snd-04/godot` |
| fetch main | `284d7faf49295b2f5061937a47ce96038032ed3c`, 원격 main SHA와 일치 확인. `game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 선행 의존 | SND-03이 main에 없어 인수된 끝 `4203b78b81c087fe71e8b0a675eb4b49ae529cfe`에서 분기. main284d7faf가 ancestor. SND-02 catalog map 읽기, 신규 테스트의 sample prefix는 SND-03 queue phase 사용 |
| worktree 준비 | 기존 snd-04 WT 없음 확인. 최초 전체 checkout은 **No space left on device로 실패**했고 Git이 실패 WT 경로를 정리함. 남은 자기 브랜치에서 --no-checkout 생성→필요 경로만 sparse checkout→자기 빈 index를 HEAD로 초기화. 코드 편집 전 tracked INDEX/WORK 0 확인. 전체 WT 복사를 다시 시도하거나 타 작업 파일을 삭제하지 않음. 준비된 sparse WT 약558MiB |
| sparse 경로 | godot / test / sfx / docs/engine / docs/6사운드디자인, 원본 game/index HTML, AGENTS·package·gitignore·훅·docs-sync 도구·CHANGELOG 등 필요한 경로. 제외한 대형 제작 에셋/백업은 index의 skip-worktree로 보존하며 삭제 commit에 포함하지 않음. `worktree-create.log`, `worktree-sparse-create.log`, `sparse-checkout.log`, `sparse-read-tree.log` |
| 지시서 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 옛 제안 격리명 대신 사용자 지정 `EXODUSER-snd-04-Isolated-20261020` |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. 시작 tracked INDEX/WORK 0. R 코드·branch·index 수정 없음 |

## 신규 파일·API

| 파일 / API | 정확 계약 |
|---|---|
| `godot/port_modules/sound_source/voice_selector.gd` | RefCounted, class_name 없음. selector마다 별도 map 복사와 last_at Dictionary. 자체 IO·Node·오디오·OS clock/RNG·전역 캐릭터 owner 없음 |
| `_init(catalog)` | SND-02 `catalog.snapshot().voice_map`의 독립 복사. map42개를 새 하드코딩 표로 중복하지 않음. null/NOT_READY catalog는 명시적 NOT_READY |
| `select_key(key:String,character_index:int,now_ms:Callable,random_unit:Callable)` | 명시적 캐릭터 index, millisecond clock·RNG[0,1) 주입. READY/key(선택 또는 원문 passthrough), SILENT/key빈문자열/reason(repeat_block 또는 variants_exhausted), NOT_READY/reason/key빈문자열 반환. READY도 원래 빈 key면 빈 문자열을 그대로 보존 |
| `status()` | READY/mapping_count42 또는 NOT_READY/voice_catalog_unavailable 및 가능한 catalog_status 상세를 독립 복사 |
| `snapshot_last_at()` | timestamp map 깊은 복사. 반환값 변경이 다음 선택·다른 selector에 영향을 주지 않음. 외부 저장 필드로 추가하지 않음 |
| `godot/tests/test_sound_source_voice_selector.gd` | 원본 JS 71시나리오·387단계의 선택 key·stamp·clock/RNG 순서와 SND-03 queue 상태를 대조. 별도 instance 격리·snapshot 격리·null/실패 catalog의 명시적 상태 검사 |
| `godot/tests/build_sound_source_voice_selector_oracle.mjs` | 고정 main의 실제 42map·selector 함수, 실제 playSample/playVoiceDirect 본문을 Node VM에서 실행. 변형 7분기의 개수도 원문에서 추출. GDScript로 기대값을 생성하지 않음 |
| `godot/tests/fixtures/sound_source_voice_selector_oracle.json` | 출처 SHA·42map 수·7변형분기·71시나리오 결과. 테스트 데이터이며 미디어 에셋이 아님. 검토용 pretty 데이터 `_out/snd-04/source-oracle.json` |
| docs | 이 보고서와 CHANGELOG 최상단 절만. 기존 추적·공용 보드·설계 문서의 과거 이력 보존 |

공용6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd), 기존 제품·테스트·HTML·원본 에셋 자체 변경0줄이다. Q/E·blackBean Q-only·docs/2_3·세이브 형식 보존. 원본 음원 생성·변환·새 VoiceDirector 구현 없음.

## 최신 main 원본 행·선택 순서

| `game.html` 위치 | 보존 계약 |
|---|---|
| 12327–12336 | SND-02가 보존한 `_SILVERTAIL_VOICE_MAP` 42개를 읽음. 문자 대소문자·공백·logical base 그대로. voice_wakeup·이미 silvertail_*인 raw key·__proto__/toString/constructor 등 map에 없는 key는 그대로 |
| 12341 첫 두 guard | character_index≠1이면 clock/RNG 없이 원문 반환. char1도 map own key가 아니면 원문 반환. native catalog가 없을 때는 char1 NOT_READY, 다른 char passthrough guard를 앞에 유지 |
| 12337–12339 | 반복 제한 **10000ms**. 기본 last는 −Infinity, 기록된0은 유지. now−last<10000이면 빈 문자열, 9999차단/10000허용. 일반 매핑은 RNG0회. alias가 같은 mapped key면 stamp 공유 |
| 12340–12341 | grunt/parry 각3개, demon_revive/second_wind/execution/clear/fuse 각2개. 1부터 count까지 오름차순으로 now−last≥10000인 후보만 모음. 모두 소진 시 clock1회/RNG0회/새 stamp0. 후보 존재 시 floor(random×eligible_count), RNG1회·재추첨 없음 |
| 12339–12340 | stamp는 선택 때 읽은 now를 기록. RNG callback이 clock 상태를 바꿔도 다시 읽지 않음. clock rollback에서도 원본 차이 비교 그대로. clamp·추가 cooldown·폴백 voice 없음 |
| 12358–12368 | sample은 selector를 먼저 호출한 다음 gx volume·30ms dedup·jitter·queue. gx0으로 실제 소리가 버려지거나 첫30ms에 queue가 거부해도 이미 기록한 voice stamp를 되돌리지 않음. fixture에서 SND-03 phase와 원 RNG 호출 순서 대조 |
| 10065–10068 | direct 역시 같은 selector→빈 key gate→buffer gate 순서. buffer가 없어도 선택 stamp는 소모됨. 같은 selector instance를 sample/direct가 공유해야 원본과 동일하며 실제 owner 연결은 후속 |

### direct voice 우회 정책 — 문서만, backend 구현 아님

| 원본 위치 | 정확 정책 / 이번 인수 한계 |
|---|---|
| 10065–10068 | 원본 direct와 sample은 `_silvertailVoiceKey`·동일 Map 사용. 이번 테스트는 실제 JS direct의 **미존재 buffer return까지**와 native 선택 상태를 대조한다. 이미 로드된 음원 재생·direct 출력 검증 아님 |
| 10069–10073 | 원본 buffer→AudioBufferSource, rate가 truthy이고1이 아닐 때만 playbackRate 설정, gain=min(1,vol\|\|1), src→gain→destination 직결, start(). mbus/sfxVol/gx volume·queue·active node 등록 우회. **이 경로를 native에서 실행하거나 버스·음량 owner를 바꾸지 않음** |
| 후속 | 실제 direct 재생·destination/master 동등성·옵션0에서도 출력·캐릭터 owner 상실/종료·이미 존재하는 holy2 중복 caller는 후속 담당 인수 사항. 이번 선택 fixture로 실제 음향 완료를 주장하지 않음 |

API의 String key·integer character index·total finite millisecond clock·RNG[0,1) 범위를 전제한다. 비문자 입력의 JS 강제변환·callback 예외·범위 밖 RNG·재생 성공·파일 가용성은 검증 범위가 아니다. 이미 변환된 raw silvertail_* key에 원본에 없는 반복 제한을 새로 걸지 않는다.

## 검증·격리·원로그

원로그: `/Users/fordeargamers/exoduser-wt/_out/snd-04/`.

`run_godot.py`는 실행 직전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`이2 이상이면30초씩 대기한다. 모든 실행 count/시각·HEAD·argv·PID·exit·stdout/stderr SHA-256을 `.meta.json`, 출력은 `.out/.err/.engine.log`에 보존. 새 테스트는 지정 SND-04 격리명, 기존3단위는 각 USERDIR 상수 이름. override는 매번 쓰고 finally에서0byte. contracts는 USERDIR가 없어 SND-04 override를 쓰며 원 주석대로 save_report 호출0. 엔진 로그는 모두 Git 밖 `--log-file`.

contracts 준비는 검증된 SND-03 WT의 기존 엔진 캐시1006파일을 동일 byte로 복사했다(`engine-cache-byte-copy.json`). Godot import·원본 에셋 생성/변환은0이다.

| 검증 | 실제 결과 |
|---|---|
| 첫 voice-01 | **2,435단정 / 1실패 / exit1**. 전체 선택·stamp·호출 순서 대조는 일치했으나 정수 VARIANT_COUNTS Dictionary와 JSON parse의 실수 Dictionary 직접 동등 비교가 실패. 실패 로그 보존. PASS로 세지 않음 |
| 수정 voice-02 | 테스트의 표 비교를 전체 key 집합·수치 값을 대조하는 기존 recursive comparator로 정정. 제품 모듈 수정0, 검사 수 유지. **2,435단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true·Main_booted=false·71시나리오 |
| 독립 trace 대조 | 실제71시나리오·387단계·1,459 scalar leaf 비교 **불일치0**. 수치 상대 허용오차1e−12, 최대차1.1102230246251565e−16. key 집합·순서·문자열은 정확 비교. `oracle-comparison.json` |
| fixture 재생성 | 테스트한 fixture와 재생성본 SHA256 `3b498077bf15b62b5716652a0f7036f962dfb53f50b14c0a907ff276e8726ac6` 동일. `source-oracle-rebuilt.json` |
| contracts-01 | **전체5그룹 통과 / failed_assertions0 / exit0 / stderr 비어 있음**. only=[]로 map/charge/projectile/pause_capture/damage 전부 실행 |
| policy-01 | 기존 SND-01 **1,194단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true·Main_booted=false |
| catalog-01 | 기존 SND-02 **687단정 / 0실패 / exit0 / stderr 비어 있음**, isolated=true·Main_booted=false |
| queue-01 | 기존 SND-03 **606단정 / 0실패 / exit0 / stderr 비어 있음**, 32시나리오·isolated=true·Main_booted=false. 실제 GDScript 예외 catch로 승격하지 않는 원 기존 protocol 유지 |
| 웹 기존 회귀 | audioBootLoading / audioContextResumeGate / footstepAudioPriority / kiSlashSwingSound / silvertailFemaleVoice **5파일·10tests / pass10 / fail0 / skipped0 / exit0 / stderr 비어 있음**. `web-audio.out/.err/.meta.json` |
| 실행 한도·정리 | voice-01/02는 각각count1, contracts는 count2에서30초 간격3회 대기 후count1, policy/catalog/queue는 각각count1에서 시작. 자체 Godot 순차 실행·override 최종0byte |
| 보호 범위 | 기존 tracked game.html/godot **1,318파일 SHA-256 전부 동일**, 기존 제품·테스트·원본 에셋 변경0. sparse 제외 파일의 staged 삭제0. `protected-baseline.json`, `scope-precommit.json`, 최종 `scope.json` |

검증 HEAD는 선행 SND-03 `4203b78b`에 이 작업의 미커밋 신규4파일이 있는 WT다. `tested-implementation-hashes.json`에 유효 voice-02 때의 바이트를 고정하고 staged blob과 대조한다. fixture 재생성 후에도 동일 해시다. 단정·contracts 그룹·웹 tests·비교 leaf는 다른 분모이며 합쳐 전체 게임 PASS로 만들지 않는다. 기존 Main·PC·실청취는 이번 실행 범위가 아니다.

재현:

```sh
node godot/tests/build_sound_source_voice_selector_oracle.mjs ~/exoduser-wt/_out/snd-04/source-oracle.json
python3 ~/exoduser-wt/_out/snd-04/run_godot.py ~/exoduser-wt/snd-04 voice-02 test_sound_source_voice_selector EXODUSER-snd-04-Isolated-20261020
```

docs 전체 관련 키워드 검색은 `docs-search.txt` 및 최종 검색 파일에 보존한다. 소리 설계의 예정/과거 이력·기존 추적 문서의 미착수 표는 원문으로 두고 이번 선택 상태 범위만 이 보고서·CHANGELOG에 추가한다.

## 제출·한계

경로 지정 stage, 정상 pre-commit 훅, 자기 브랜치 비강제 push 후 원격 SHA 대조. ignore에 걸리는 승인된 새 test 한 경로만 `git add -f -- godot/tests/test_sound_source_voice_selector.gd`. git add -A·main push·force·rebase·훅 우회0. Git 밖 DONE.txt에 최종 branch/SHA/수치를 기록한다.

독립 보이스 선택·fixture 범위까지이며 실제 재생·청감·자연 게임 호출·PC 실행 인수는 미확인이다. SND-05 이후를 자동 착수하지 않는다.
