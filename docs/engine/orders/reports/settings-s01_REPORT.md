# SETTINGS-S01 구현·검증 보고서 — 2026-10-20

**상태: 구현·최종 회귀 완료, 총괄 인수 대기.** 최신 main `9528ea35b429498fcf42fe3723008219ed0ed7e1`을 자기 브랜치에 ff merge한 뒤 신규 unit112/actual Main12와 관련 기존 회귀를 실제 실행했다. 최종 660단정·check와 계약5군에서 실패0이며 제품 기존 파일 수정0이다. 최초 실패·차단 이력은 아래에 구분해 보존한다.

## 소스·소유·변경 경계

| 항목 | 실제 값 |
| --- | --- |
| 작업ID / 브랜치 | `settings-s01` / `codex/settings-s01-20261020` |
| 작업 worktree | `/Users/fordeargamers/exoduser-wt/settings-s01` |
| fetch·생성 기준 | 최초 `origin/main=ad6ac68a2e009c4d299fe1dd2264182355ee992c`에서 새 branch/worktree 생성 |
| 최종 main 기준 | 재fetch 후 `9528ea35b429498fcf42fe3723008219ed0ed7e1`을 자기 branch에 `git merge --ff-only origin/main`. `19a713578`·P3-002 소환굴 병합 포함, rebase/force/reset 없음 |
| 사전 확인 | 최신 `WORK_BOARD.md` 및 병합된 `FDG_SOURCE_TRACE_SETTINGS_20261020.md` S01. 총괄 지시로 기존 OPT owner 협의 조건 충족, 해당 파일은 읽기만 수행 |
| 코드 신규 | `godot/scripts/native_settings_read_view.gd` |
| 테스트 신규 | `godot/tests/test_native_settings_read_view.gd` |
| 문서 | 신규 이 보고서 + 정상 커밋 훅 필수 `docs/CHANGELOG_SYNC.md`에 이번 변경9줄 추가. 기존 추적/설계 docs·WORK_BOARD 수정0 |
| 기존 제품·테스트 변경 | 0줄. Main/HUD/World/Player/hurtE/G/P owner 6파일과 `source_options_state.gd` 최종 main merge 직후/검증 종료 SHA-256 동일 |
| 보호 | `docs/2_3`·Q/E 의미/판정·저장 형식 변경0. 저장/복원/리바인딩/reset 실행 구현0 |
| R | HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017` 보존. R/game.html을 원본으로 사용하지 않음 |

테스트의 단일 source 파일은 **이 WT의 최신 main game.html**이다. 기존 OPT owner에 필드를 추가하지 않았으며 실제 owner는 35개 그대로다. 공용 파일·기존 테스트·다른 Codex WT는 수정하지 않았다. 실행 중 생성된 자기 WT의 `.godot`/UID는 Git 제출 대상이 아니다.

## 원본 근거와 총괄 판정

| 원본 파일·행 | 옮긴/검증한 계약 |
| --- | --- |
| `game.html:6311` | 초기 OPT38개 전체 비교용 reference. `parts=IS_ELECTRON?100:80`, shake80/textScale100/panelFittrue/hitStop0/sfxVol60/bgmVol60/diff5/diffV2=1/fpsCap0/autoPotThr.99/resScale100/ssaa1 등38개 모든 값을 실제 원본 literal에서 읽은 oracle와 필드별 대조 |
| `game.html:6188–6197` | BINDS 초기20개에 `irisToggle`·`bladeToggle` 포함. S01은 입력 writer를 만들지 않음 |
| `game.html:48752–48753` | reset BINDS/BINDS2는18개이며 두 toggle은 없음. 총괄 판정대로 이를 수정하지 않고 새 테스트의 source evidence4단정으로 기록. 실제 reset 구현은 S03 |
| `source_options_state.gd:8–17,55–80` | 기존35개 actual owner reference·raw 값·추가 key·누락 시 NOT_READY 계약 유지 |
| `native_source_player_initialization_services.gd:489–495` | 실제 current reader / owner getter를 새 어댑터에서 사용. 별도 current OPT 생성 없음 |
| 병합된 추적 문서 S01 | readonly default/read view, raw/추가 필드/동일ref, missing/loss NOT_READY. 이 판정을 새38필드 비교 기준으로 노출 |

## 신규 public API·정확 반환

| API/상황 | 구현 |
| --- | --- |
| `get_source_default_reference(is_electron:bool=false)` | 원본38개 비교용 새 사본 반환, parts80/100. 실제 current fallback/owner 저장소로 사용하지 않음 |
| `configure(source_owner:Object)` | `read_current_options` method를 가진 유효 Object에1회 WeakRef bind. reader 호출0, 기존 바인딩 교체/자동복구0 |
| `read_current_options_view()` | 매번 실제 reader1회; actual Dict identity/raw type/추가 key와 nested reference를 보존, 보충·clamp·coercion·current copy0 |
| 38개 키 존재 | `status=READY`, `options=<actual ref>`, expected_count38/current_count/missing_keys/extra_keys. 키 존재 확인이며 필드값 정규화·설정복원 완료 판정이 아님 |
| expected key 누락 | `status=NOT_READY`, reason=`source_settings_fields_missing`, `observed_options=<진단용 actual ref>` 및 누락 목록. 사용할 수 있는 `options` key는 없음 |
| 미바인딩/owner상실/method상실/null/비Dictionary | 구체 reason의 NOT_READY, stale `options`/진단 dict 재사용0·retry0 |

실제 Main에서는 current_count35, expected_count38, missing_keys=`[textScale,panelFit,diffV2]`, status=NOT_READY다. 이는 어댑터 검증의 예상 결과이며 실제 설정38개가 준비됐다는 뜻이 아니다. 현재 값은 diff5/parts80/sfxVol60/fpsCap0, phase=`current_pre_restore`로 관측했다. 검증을 통과시키기 위해 missing3를 실제 owner에 넣지 않았다.

## 환경·격리·최종 명령

바이너리는 지정된 원본 **`/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`**만 사용했다. 실제 버전 `4.7.2.stable.official.ed1daf0bf`. 모든 명령은 이 WT의 `--path /Users/fordeargamers/exoduser-wt/settings-s01/godot`을 사용했다.

S01 신규 Main/unit 테스트에는 `godot/override.cfg`로 `config/use_custom_user_dir=true`, `config/custom_user_dir_name="EXODUSER-settings-s01-Isolated-20261020"`을 설정했다. 새 테스트는 ProjectSettings와 실제 `OS.get_user_data_dir().get_file()`까지 확인한다. 실제 경로는 `/Users/fordeargamers/Library/Application Support/EXODUSER-settings-s01-Isolated-20261020`이다. 기존 회귀는 각 기존 guard가 요구하는 **자체 전용 격리 이름**을 아래처럼 설정하여 실행했다. 기존 guard/테스트는 변경0이다. 실행은 순차적이며 마지막에 override를 **0byte로 비웠다. 커밋 대상이 아니다.**

최종 원로그 폴더 **`~/exoduser-wt/_out/settings-s01/main-9528ea35/`**의 `runs.json`에 바이너리·전체 인수·격리 이름·exit·초 단위 시간이 있다. 아래 명령은 공통 `--headless --path <위 godot 경로>` 뒤 인수다. 모든 행 exit0, `SCRIPT ERROR:`/`ERROR:`0이다.

| 명령 | 격리 이름 (`EXODUSER-` 뒤) | 실제 수치 | 원로그 |
| --- | --- | --- | --- |
| `--script res://tests/test_native_settings_read_view.gd -- --only=unit` | `settings-s01-Isolated-20261020` | 4군112단정/0실패 | `unit.log` |
| `--script res://tests/test_native_settings_read_view.gd -- --only=actual_main` | `settings-s01-Isolated-20261020` | 1군12단정/0실패 | `actual-main.log` |
| `--script res://tests/test_contracts.gd` | `settings-s01-Isolated-20261020` | 5군 PASS/실패단정0. 총단정 수 미출력 | `contracts.log` |
| `--script res://tests/test_native_main_source_player_initialization.gd -- --only=options_context_lifecycle` | `MainSourceInitialization-Isolated-20261014` | 11단정/0실패 | `existing-options.log` |
| `--script res://tests/test_native_main_source_starter_state.gd` | `MainSourceStarter-Isolated-20261014` | 5군148check/0실패 | `starter.log` |
| `--script res://tests/test_p3003_regions.gd` | `P3003-Isolated-20261020` | 43단정/0실패 | `regions.log` |
| `--script res://tests/test_p2002a_hud.gd` | `P2002A-Isolated-20261020` | 36단정/0실패 | `hud.log` |
| `--script res://tests/test_p3002_spawn_holes.gd` | `P3002-Isolated-20261020` | 6군298단정/0실패, skipped없음 | `spawn-holes.log` |

위 7개 수치 출력 suite 합계 **660단정·check/0실패**, 별도 contracts5군/실패0이다. import는 `--headless --editor --path <위 godot 경로> --import --quit`, exit0/ERROR0(`import.log`). actual-main·기존 options·starter·regions·hud·spawn-holes에는 기존 Camera2D physics interpolation WARNING가 각각1개 기록되었다. 경고를 무출력으로 보고하지 않는다.

### 최신 main의 G·지역·HUD 재확인

| 계약 | 실제 실행 근거 |
| --- | --- |
| starter G48키 | `test_native_main_source_starter_state.gd`의 BOOT40 + REGION7 + SPAWN_HOLE_INIT `_totalSpawned`1 정확 키 집합 검사 통과(`starter.log`,148/0). 원본 `_totalSpawned` 초기화는 `game.html:30625` |
| 지역 total | `regions.log`의 `P3003_RESULT.observations.actual.regions[*].total = [23,60,53,32]`, 합168. 실제 Main 초기화 소비 결과이며 상수 대입으로 보정하지 않음 |
| 시작 HUD | `hud.log`의 initial.kill_text와 `spawn-holes.log`의 kill_text_boot 모두 `0 / 32` |
| 소환굴 | `spawn-holes.log`: 14개 completed, 실제 spawn_attempts/spawned168, center_forced0, spiral_fallbacks0. 미이식 spawn158 등 기존 suite의 제한도 로그에 보존 |

### 새 테스트에서 확인한 범위

- reference83단정: 최신 source literal의38개 값×browser/Electron, parts80/100, 사본 독립성과 InputMap/Engine cap/physics/audio bus 불변.
- raw_identity12단정: configure 시read0/매read1회, 재bind거부, actualref, zero/false·추가 null/int key/순서·nestedref 보존, holder가 교체한 새dict 관측, input/cap/hz 불변.
- missing_and_loss13단정: 미바인딩·무효owner·정확 누락3개·추가 default 없음·null/Array반환·WeakRef상실·method상실, stale fallback/retry 없음.
- reset_evidence4단정: 초기20/reset18·두toggle생략, 원본 행 기반 기록만.
- actual_main12단정: 실제 Main→Services→current owner, 35/38/누락3/NOT_READY, 동일ref/전체옵션불변, phase pre_restore·cap240/physics60/InputMap불변. 실제 owner에 테스트 field를 주입하지 않았다.

## 최초 실행 이력·남은 범위

최초 ad6ac68a2 기준 실행은 최종 main 회귀와 별도로 `_out/settings-s01/`에 보존했다.

| 과거 실행 | 실제 결과·후속 처리 |
| --- | --- |
| `unit-01.log` | exit1,112중1실패. source literal JSON float/GDScript int의 사전 전체 비교 문제였다. source38개 개별 값 비교는 통과. 제품 변경 없이 사본 독립성 단정을 shake80/38개/추가key없음으로 구체화했고 `unit-02.log`112/0 및 최종 main112/0 |
| `actual-main-01.log` / `contracts-01.log` / `web-delivery-01.log` | 각12/0·계약5군/실패0·readonly 관찰자2군/실패0. 마지막 관찰자 결과는 구 main 결과이며 최종 main 회귀 수에 합산하지 않음 |
| `existing-options-regression-01.log` | exit2, S01 이름으로 기존 초기화 테스트를 실행하여 기존 전용 격리 guard가 본문 전 거부. 단정0/PASS 아님. 최신 main 재검증에서는 기존 suite의 자체 전용 이름을 설정해11/0. guard 제거·기존 파일 수정0 |
| 최초 정상 `git commit` | exit1, `.githooks/pre-commit` → `tools/docs-sync-check.mjs --staged`가 필수 `docs/CHANGELOG_SYNC.md` 누락을 거부. 기존 보고서에는 BLOCKED로 남겼었다. 이번 제출은 해당 변경로그에 최소 실제 변경 기록을 추가하는 정상 문서 동기화 절차로 해소하며 훅 비활성화·환경변수 우회0 |

설정 UI/영속화/사용자 리바인딩/FPS cap 적용/Tier 자동검출/S03 reset/실물 패드/실플레이·시각 품질 검수는 미구현·미검수다. Main에 상시 장착하는 공용 배선0줄이며 S02 소비 모듈만 추가했다. 실제 owner의 missing3와 누락 시 NOT_READY는 남아 있다. 기존 owner 수정이 필요한 후속 작업은 S01 범위에서 진행하지 않는다. PC 접근·실행·동기화는 미확인이다.

## 문서 검색·보존·Git 제출

코드 작성 후 docs 전체에서 `native_settings_read_view|source_options_state|read_current_options|OPT35|irisToggle|bladeToggle`를 검색했다. 관련 SSOT `FDG_GODOT_PORT_NPC_SOURCE_OPTIONS_STATE_FIRST_20261014.md:72–83`와 병합 추적 문서 S01을 대조했다. 기존 OPT35/phase/저장·QE 설계는 그대로이며 신규 API·시험 수치·관계는 이 보고서와 필수 변경로그에 기록한다. 검색 경로 원문 `docs-keyword-paths.txt` 보존.

최신 main 병합 전 자기 staged3파일은 경로 한정 stash `83dd83e3bc5449b695ffed7e521b0c88889b25d7`로 보존하고 ff merge 후 `stash apply --index`로 복원했다. stash는 삭제하지 않았다. `main-9528ea35/start.json`·`verification.json`에 최종 main SHA, 공용6파일/OPT owner/두 HTML의 병합 직후·검증 후 동일 hash, override0byte, 원로그 hash를 기록한다. main에서 인수한 공용 파일 변경과 S01 자체 변경0을 구분한다. 최초 base 기준 hash와 최종 main 파일이 동일하다고 주장하지 않는다.

제출은 신규 제품·테스트·보고서와 필수 변경로그 **4경로**다. `git add --` 경로 지정 및 테스트만 `git add -f --`를 사용한다. 자기 branch만 정상 push하고 원격 SHA를 대조한다. main push·타 WT 수정·force·rebase·reset 없음. 기준 R의 HEAD/branch·tracked INDEX/WORK 불변을 재확인한다. 원로그·복구 자료·최종 SHA·핵심 수치는 `/Users/fordeargamers/exoduser-wt/_out/settings-s01/`와 `DONE.txt`에 보존한다.

## 구현 체크포인트 SHA

구현·테스트·위 검증 결과·필수 변경로그를 포함한 정상 커밋은 **`517825ebf017f105484fb81b01fe98f31fb8f21f`**다. 부모는 최종 기준 main `9528ea35b429498fcf42fe3723008219ed0ed7e1`이며 정상 커밋 훅을 통과했다. 이 절은 해당 구현 SHA를 기록하는 문서 후속 커밋이다. 최종 제출 ref/SHA와 원격 일치 확인은 `_out/settings-s01/DONE.txt`에 기록한다.
