# snd-02 — 원본 샘플 카탈로그

## 범위와 기준

**구현·검증 완료 / 자기 브랜치 제출·검수 대상.** SND-02는 원본 파일 경로·보이스 논리 키 치환·선언 라우팅을 서로 다른 이름공간으로 제공하는 독립 카탈로그다. 기존 게임 재생기에 연결하지 않는다. 실청취·실게임·PC 실행은 미확인이다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / 브랜치 | `snd-02` / `codex/snd-02-20261020` |
| 실행 source | `/Users/fordeargamers/exoduser-wt/snd-02/godot` |
| 재개 | 재부팅 전 WT 존재. HEAD `ea1dcd8addf28cef593901388effccde45c2c96b`, 카탈로그·JSON·ignore된 테스트 및 SND-01 보고서 2줄 미커밋 상태를 먼저 확인. `_out/snd-02/resumed-wip-20261020.tar.gz`로 보존 후 이어감 |
| 원본 main | fetch한 `284d7faf49295b2f5061937a47ce96038032ed3c`(최소 `2826b6738`·QA-002 포함). `game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| SND-01 선행 / main 반영 | `codex/snd-01-20261020`의 확정 재검증 보고서 HEAD `1533f602b73eb61da39de02d3298a7c609ad7ddf`까지 fast-forward. 이전 미검증 완료 문구 2줄은 백업에 보존 후 확정 보고서로 대체. 최신 main284d7faf가 ancestor임을 확인. 기존 WIP 신규 3파일 유지 |
| 지시서 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 문서의 예전 격리명 대신 이번 사용자 지정 `EXODUSER-snd-02-Isolated-20261020` 적용 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 관측 시 INDEX/WORK 모두 변경 없음. R에서 코드·branch·index 변경 없음 |

## 구현 파일과 원본 계약

| 파일 / API | 현재 계약 |
|---|---|
| `godot/data/sound_source_samples.json` | 원본 3개 리터럴을 별도 이름공간 `samples` / `voice_map` / `routes`로 저장. samples233개, voice_map42개, routes18개(procedural11/file7) |
| `godot/port_modules/sound_source/catalog.gd` | RefCounted, class_name 없음. 기본 JSON을 읽고 구조 검증을 마친 뒤 세 영역을 함께 게시. 오디오 파일 로딩·재생·clock/RNG·Node/autoload 없음 |
| `status()` | `READY`와 3개 count, 또는 `NOT_READY`와 실패 reason/path의 새 Dictionary |
| `snapshot()` | `READY`와 세 영역의 깊은 복사. 실패 시 status만 반환해 부분 데이터·임의 기본값을 게시하지 않음 |
| `lookup_sample(key: String)` | 정확한 원문 key의 파일 문자열. query·alias·대소문자·등록 순서 보존. 임의 경로 변환·폴백 없음 |
| `lookup_voice_mapping(key: String)` | 논리 치환 key만 제공. variant 선택·10000ms 제한·캐릭터 판정은 SND-04 이후 |
| `lookup_route(key: String)` | `SFX_MAP` 선언의 `{type, fn}` 또는 `{type, src}` 깊은 복사. procedural을 파일로 대체하지 않으며 dispatcher 사용을 주장하지 않음 |
| 없는 key | `MISSING` / namespace / 원문 key 반환. 카탈로그 자체의 `NOT_READY`와 구분 |
| `godot/tests/test_sound_source_catalog.gd` | 원본 HTML에서 전체 리터럴 key/value·순서 추출, exact lookup·alias·query·대소문자·영역 분리·깊은 복사·실패 상태·Main 미부팅 검사 |
| docs | 이 보고서와 `docs/CHANGELOG_SYNC.md` 최상단 같은 형식의 절만 갱신. 기존 추적 문서·공용 작업판·설계 변경 없음 |

| 원본 위치(고정 main) | 정확 데이터 |
|---|---|
| `game.html:10076–10331` | `_sampleFiles` 233개. 예: bullet_hit / player_projectile_impact / bean_hit → `sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1`, bow_release → `sfx/weapon/bow_releasE.wav` |
| `game.html:12327–12336` | `_SILVERTAIL_VOICE_MAP` 42개. voice_demon_revive → silvertail_demon_revive는 논리 base이며 samples 등록과 별개. voice_wakeup은 map에 없음 |
| `game.html:10359–10378` | `SFX_MAP` 18개. potion은 procedural/fn=potion, boss_intro는 file/src=sfx/boss_intro.mp3. 두 namespace에 없는 key를 새 sample로 합성하지 않음 |
| 기존 `main.gd:1901`의 `ATTACK_SAMPLE_PATHS` | 읽기만. 현재 게임의 native 경로로 원본 경로를 재작성하거나 기존 재생기를 교체하지 않음 |

공용 6파일 `main.gd`·`hud.gd`·`world.gd`·`player.gd`·`native_normal_enemy_hurte.gd`·`native_source_new_run_state.gd`, 기타 기존 제품 owner·테스트·원본 HTML·음원은 자체 변경 0줄이다. main merge에 포함된 타 담당 변경과 이 작업의 diff를 분리한다. 에셋 신규 생성·복사·변환 0. Q/E·blackBean Q-only·docs/2_3·세이브 형식 보존.

## 검증·원로그

원로그: `/Users/fordeargamers/exoduser-wt/_out/snd-02/`.

각 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인한다. 2 이상이면 30초씩 기다리고 다시 확인한 뒤 실행한다. 실행기 `run_godot.py`가 count/시각·HEAD·argv·PID·exit·stdout/stderr SHA-256을 `.meta.json`에 보존한다. 새 테스트는 지정 격리명, 기존 회귀는 각 파일 USERDIR를 `override.cfg`에 매번 쓰고 finally에서 0바이트로 비운다. 모든 엔진 로그는 `--log-file`로 Git 밖에 저장한다.

| 검증 | 실제 결과 |
|---|---|
| 새 `catalog-01` | **687단정 / 0실패 / exit0 / stderr 비어 있음**. isolated=true, effective USERDIR 일치, Main_booted=false. source counts233/42/18, 전체 key/value·원본 순서, 명시 alias/query/path case, 없는 key, READY/MISSING/NOT_READY, 깊은 복사·독립 instance 검수 |
| 기존 `policy-regression-01` | **1,194단정 / 0실패 / exit0 / stderr 비어 있음**. 기존 파일 그대로 실행, boundary60·source samples233·isolated=true·Main_booted=false. USERDIR `EXODUSER-snd-01-Isolated-20261020` |
| 원본 JS 독립 oracle | 최신 main의 실제 3리터럴을 Node VM에서 평가한 값 ↔ 신규 JSON ↔ Godot snapshot, **293개 key/value 전부 일치, 불일치0**. JSON과 원본 등록 순서도 일치. `source-oracle-latest.json`, `oracle-comparison.json` |
| 외부 비교 도구 이력 | 첫 추가 비교에서 Godot `JSON.stringify`의 기본 정렬 출력을 등록 순서로 취급해 순서 assertion 실패. 값 비교는 일치했다. 직렬화 순서 전제를 제거해 재대조했으며, 실제 Dictionary 등록 순서는 새 Godot 테스트의 별도 단정으로 확인. 제품·테스트 수정/재실행 없음 |
| 웹 사운드 회귀 | audioBootLoading / audioContextResumeGate / footstepAudioPriority / kiSlashSwingSound / silvertailFemaleVoice, **5파일·10tests / pass10 / fail0 / skipped0 / exit0**, stderr 비어 있음. 원본 HTML 동일 byte인 재개 HEAD ea1dcd8a에서 실행. `web-audio.out/.err/.meta.json` |
| 선행 지옥강타 재확인 | 별도 SND-01 WT에서 main merge 후 **12/0·exit0·skipped0·종료 ERROR0**. SND-02 WT 실행으로 합산하지 않음. [SND-01 보고서](snd-01_REPORT.md)에 P2-008a 검기 halt 및 QA-002 이전 base의 종료 ERROR·SHA 명시 |
| 소유·바이트 보존 | main 기준 제품 스크립트·game.html·godot/assets diff0. 기존 tracked 에셋 **974파일 SHA-256 전부 동일**. `latest-main-assets-baseline.json`, `scope.json` |
| 실행 한도·정리 | catalog는 count2에서 30초 간격5회 대기 후 count1에서 실행. policy는 count1에서 실행. 각 프로세스 순차 실행, override 최종0byte. 새 단위에 Godot import 실행 없음 |

두 Godot 실행의 테스트 대상 HEAD는 선행 확정본1533f602이며, 새 3파일은 아래 제출 전 해시·staged blob 일치로 확인했다. 새 테스트의 fail을 skip하거나 기대값·기존 테스트를 완화하지 않았다. 단정 수·웹 tests·선행 실행은 서로 다른 분모로 기록한다.

재현:

```sh
python3 ~/exoduser-wt/_out/snd-02/run_godot.py ~/exoduser-wt/snd-02 catalog-01 test_sound_source_catalog EXODUSER-snd-02-Isolated-20261020
python3 ~/exoduser-wt/_out/snd-02/run_godot.py ~/exoduser-wt/snd-02 policy-regression-01 test_sound_source_policy EXODUSER-snd-01-Isolated-20261020
```

코드 변경 후 docs 전체 관련 키워드 검색 결과를 `docs-search-resume.txt`에 보존했다. 기존 설계의 예정·과거 내용과 추적 문서의 미착수 표기는 타 담당 원문으로 보존하고, 이번 부분 구현의 정확한 상태를 이 보고서와 CHANGELOG 최상단에 기록했다.

## 제출·인수 한계

루트 `.gitignore`의 `test_*` 때문에 명시적으로 승인된 새 테스트 한 경로만 `git add -f -- godot/tests/test_sound_source_catalog.gd`로 등록한다. 경로 지정 stage, 정상 pre-commit 훅, 자기 브랜치 비강제 push와 원격 ref 대조를 수행한다. `git add -A`·main push·force·rebase·훅 우회 없음.

이번 단위는 원본 선언 데이터의 조회까지다. 원본 음원233개 native 복사, 캐시/재생기/큐·보이스 선택·BGM·옵션 연결·실청취 인수는 범위 밖이다. SND-03 이후를 자동 착수하지 않는다.
