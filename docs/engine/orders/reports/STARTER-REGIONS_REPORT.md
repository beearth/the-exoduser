# STARTER-REGIONS — source boot G40와 현재 지역 G 키 계약 정정

- 작업ID: `starter-regions-fix`; 브랜치: `codex/starter-regions-fix-20261020`
- 기준: 시작 시 fetch한 최신 `origin/main` **`c7c910fd04559a78be0e64295a97390d01fd2d09`**. 사용자 전달 PC 기준 `e5c5e0b15`와 이 SHA 사이 관련 `game.html`·제품 scripts·해당 테스트 변경은 없다.
- worktree: `/Users/fordeargamers/exoduser-wt/starter-regions-fix`
- 결과: **동일 최신 source에서 148검사/1실패 → 148검사/0실패**, 수정 후 exit0·stderr ERROR0. 전체 5그룹을 각각 전후 한 번씩 실행했다. source 변경은 지정 테스트 1파일뿐이다.
- 작성 시각: 2026-10-20T18:45:12.056726+09:00

## 원본 근거와 판정

| 단계 | 기준 원본 `game.html` 행 | 확인 |
|---|---|---|
| 파일 초기 G literal | **16714–16718** | 정확한 40키. `native_new_run_bootstrap_source/producer.gd:124–132`가 같은 literal을 보존한다. |
| 새 게임 초기화 경로 | **63956**, **64019**, **64025** | 같은 G의 값을 갱신하고 `applyStats()` 뒤 `initStage(G.stage)`를 호출한다. |
| 지역 초기화 호출 | **31655** | `initStage`가 소환굴 확정 후 `_regionInit(si)`를 호출한다. |
| 지역 초기화 필드 | **60698–60699** | 7키를 같은 G에 추가한다. **60700**의 맵 크기 guard 이전이므로 작은 맵에서도 필드 초기화가 먼저다. |
| 실제 지역 값 생성 | **60701–60717** | 지역 중심·4지역·처치 분모·문지기 지역·현재 지역 값을 채운다. |

원본이 이 시점에 지역 필드를 쓰므로 테스트 기대를 정정했다. 이전 단정은 Main ready 후 live G를 읽으면서 file-init G40 cardinality를 요구했다. P3-003의 `main.gd:263–268` → `native_regions.gd:81–85`는 원본 지역 필드 추가에 대응한다. 제품의 지역 초기화 시점·필드를 바꾸지 않았다.

선행 진단의 Mac P3 이전 148/0·G40과 이후 148/1·G47 근거는 `codex/mac-testsweep-20261020`의 `c7f10ad6f80b07e74e3d874f23654d27d972c826` 및 `~/exoduser-wt/_out/mac-testsweep/diag/`에 보존돼 있다. 이번 수정은 새 최신 main worktree에서 다시 확인한 전후 결과이며, 선행 진단 worktree·로그를 변경하지 않았다.

## 정확한 기대 집합과 boot 보존

| 항목 | 새 검사 계약 |
|---|---|
| `BOOT_G_KEYS` | 아래 원본 40키를 정확히 열거. fresh `BOOTSTRAP.source_boot_g().values`와 snapshot의 `source_boot_inputs.g_file_init.values`가 각각 같은 키 집합이어야 한다. |
| 보존 boot packet | snapshot `g_file_init` 전체 packet이 fresh source packet과 **동등**해야 한다. 키뿐 아니라 초기 값·metadata까지 보존하는지 검사한다. |
| `REGION_INIT_G_KEYS` | `_regions`, `_regMidX`, `_regMidY`, `_regCurIdx`, `_regBannerCd`, `_regGateIdx`, `_bossClearT` 7키를 정확히 열거한다. |
| 실제 current G | `BOOT_G_KEYS + REGION_INIT_G_KEYS`와 **정확한 집합 동일성**, 합집합 47키. 누락·예기치 않은 키·같은 수의 키 치환을 거부한다. |
| `_has_exact_keys` | Dictionary 타입·동일 개수·모든 이름 포함·기대 목록의 중복 없음. 정렬에 의존하지 않아 String/StringName 키를 모두 처리한다. |
| 기존 계약 | STATS5·PAS26, 같은 G/P provider 참조 및 이후 모든 단정을 유지한다. 새 await·metadata·paused·시드 변경은 없다. |
| 검사 분모 | 기존 한 개의 combined `check()`를 더 엄격한 조건으로 교체. 전후 **148검사**, `startup_state_and_items`는 전후 **95검사**다. |

원본 boot 40키 전체(원문 순서):

```json
[
  "on",
  "paused",
  "stage",
  "kills",
  "mats",
  "cam",
  "shake",
  "parts",
  "txts",
  "forgeOpen",
  "forgeTab",
  "forgeExpanded",
  "forgeSort",
  "rooms",
  "curRoom",
  "map",
  "mw",
  "mh",
  "hitStop",
  "slowMo",
  "stageCleared",
  "_stageDiffOff",
  "exits",
  "bossAlive",
  "_chainCnt",
  "_chainT",
  "rifts",
  "spawnHoles",
  "atkTickets",
  "maxAtkTickets",
  "_irisSz",
  "combo",
  "comboTimer",
  "comboMax",
  "stageTime",
  "_zones",
  "_curZone",
  "_zoneState",
  "_portals",
  "_playerPortalPair"
]
```

지역 7키는 boot 40과 겹치지 않는다. 외부 `verify_source_keys.mjs`에서 웹 G literal·producer G literal·테스트 상수 40개 및 웹 지역 reset의 7개·테스트 상수 7개가 **이름과 순서까지 동일**함을 확인했다. 게임 런타임을 실행하지 않고 literal만 별도 VM에서 읽었다. 원장: `source-key-comparison.json`.

## 실행 결과

| 실행 | checks / failures | 그룹 | exit | stderr ERROR 줄 | 소요 초 | 원로그 prefix |
|---|---|---:|---:|---:|---:|---|
| 원앱 import 1회 | 해당 없음 | 해당 없음 | 0 | 0 | 17.890 | `import-01` |
| 수정 전 동일 최신 소스 | **148 / 1** | 5 | 1 | 1 | 40.501 | `before` |
| 수정 후 전체 테스트 | **148 / 0** | 5 | 0 | 0 | 42.581 | `after` |
| 외부 양성·음성 검사 | **10 / 0** | 10케이스 | 0 | 0 | 1.032 | `exact-keys-probe` |

| starter 그룹 | 수정 전 checks / failures | 수정 후 checks / failures |
|---|---|---|
| `startup_state_and_items` | 95 / 1 | 95 / 0 |
| `public_actor_sync` | 8 / 0 | 8 / 0 |
| `original_provider_consumers` | 15 / 0 | 15 / 0 |
| `once_and_tree_gates` | 11 / 0 | 11 / 0 |
| `lifecycle_and_grit_loss` | 19 / 0 | 19 / 0 |

수정 전 유일 실패는 `actual G40/STATS5/PAS26 source constructors`다. 수정 후 전체 그룹 148/0이며 ERROR·SCRIPT ERROR·Parse Error 0이다. 기존 Camera2D interpolation WARNING은 보존했다. 통과 후 반복 실행하지 않았다. 이 소요 시간은 성능 측정이 아니다.

외부 probe 10케이스는 exact boot·StringName 지역 키가 섞인 exact current의 수용, boot 키 누락·동일 40개에서 이름 치환·boot에 지역 키 혼입·지역 키 누락·동일 47개에서 이름 치환·current 추가 키·중복 기대 키·비Dictionary 거부를 확인했다. 실제 Main 인스턴스·실제 상태 write는 0이며 fresh fixture copy만 변형했다. 개수만 검사하는 완화로는 이 음성 케이스들을 통과할 수 없다.

## 명령·격리·원로그

Godot 원앱 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`의 `4.7.2.stable.official.ed1daf0bf`만 사용했다. import 전에 `~/Library/Application Support/Godot/`를 `~/exoduser-wt/_backup/godot-appsupport-20261020-starter-regions-fix/`로 복사하고 68파일 SHA-256 일치를 확인했다(`backup-manifest.json`).

cwd는 이 worktree의 `godot/`이며, 모든 실행 전 `override.cfg`에 테스트 상수 `EXODUSER-MainSourceStarter-Isolated-20261014`를 설정하고 종료 후 0바이트로 비웠다. 실제 저장 폴더·기존 게임 창·다른 담당의 app_userdata를 실행 대상으로 사용하지 않았다.

```sh
# Godot 원앱 절대 경로로 실행, stdout/stderr는 아래 원로그 prefix로 분리
"$GODOT_BIN" --headless --path . --import
"$GODOT_BIN" --headless --path . --script res://tests/test_native_main_source_starter_state.gd
"$GODOT_BIN" --headless --path . --script /Users/fordeargamers/exoduser-wt/_out/starter-regions-fix/exact_keys_probe.gd
```

원로그는 **`~/exoduser-wt/_out/starter-regions-fix/`**다. 표의 `<prefix>.out`·`.err`·`.meta.json`에 원문, argv·cwd·PID·userdir·test source SHA-256·exit·ERROR 수·소요 시간·로그 SHA-256을 보존했다. `starter-before.gd`는 수정 전 테스트 사본이며, `run_test.py`·`exact_keys_probe.gd`·`verify_source_keys.mjs`는 저장소 밖에만 있다.

## docs 동기화 대조

코드 수정 직후 docs 전체에서 `G40`, `STATS5/PAS26`, `starter_state`, `g_file_init`, `REGION_INIT_G_KEYS` 등을 검색했고 결과를 `docs-keyword-search.txt`·`docs-keyword-search-focused.txt`에 보존했다. boot 수치·과거 검수 기록을 현재 live G 값으로 일괄 치환하지 않았다.

| 관련 문서 | 대조와 조치 |
|---|---|
| `FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md:56,68` | file-init/boot40 계약은 그대로 정확하다. 새 보고서에서 current 지역 단계와 구분한다. |
| 위 문서 `:103–109`, `FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md:74–80`, `FDG_GODOT_SOURCE_GRIT_TOTAL_GETTER_20261014.md:21–27` | 2026-10-14 FIRST 145검사 이력을 보존한다. 이번 전후 148검사는 별도 표로 기록한다. |
| `FDG_ENGINE.md:828`, `FDG_INTEGRATION_INTERFACE.md:450`, `FDG_GAME_DEVELOPMENT_PLAN.md:538` 및 관련 FIRST/changelog 기록 | Tree 진입 전 설치하는 원본 boot G40 설명은 유효하다. ready 후 지역 키 집합은 이 보고서의 새 계약을 따른다. |
| `FDG_P3_003_REGIONS_20261020.md:27–28` | 실제 동일 live G의 지역 필드 소유 계약과 일치한다. 제품·설계 변경 없음. |
| `orders/reports/QA-001_REPORT.md:105` | P3 전 PC148/0 ledger 보존. |
| `orders/reports/MAC-TESTSWEEP_REPORT.md:58,113` | 최초 Mac148/1·당시 진단 이력 보존. 사용자가 전달한 PC 후속 판정만 말미에 추가하고 새 보고서로 연결한다. |
| `orders/WORK_BOARD.md` | STARTER-REGIONS 자기 행만 진행→검수 대기로 갱신한다. |

## 변경 파일·제출 경계

| 경로 | 변경 |
|---|---|
| `godot/tests/test_native_main_source_starter_state.gd` | boot40 + 원본 지역7 정확 집합·보존 packet 검사. 제품 코드 변경 없음. |
| `docs/engine/orders/reports/STARTER-REGIONS_REPORT.md` | 원본 행·새 검사 계약·전후 결과·docs 대조·원로그 |
| `docs/engine/orders/reports/MAC-TESTSWEEP_REPORT.md` | PC 총괄 판정: type3 oracle·Windows export 전제는 Mac 결함 아님, visual9 미실행; 원본 관측값 보존 |
| `docs/engine/orders/WORK_BOARD.md` | STARTER-REGIONS 자기 행만 |
| `docs/CHANGELOG_SYNC.md` | 필수 docs-sync-check 진행로그 요구에 따른 이번 작업 entry append만. 기존 mixed newline byte 보존. |

R의 브랜치·HEAD·tracked INDEX/WORK는 시작 시와 같은 상태로 보존한다. 제품 `native_regions.gd`·main·producer·다른 테스트는 수정하지 않았다. 테스트는 `git add -f -- <정확 경로>`, docs는 경로 지정 add만 사용한다. override·로그·백업·외부 probe는 커밋하지 않는다. 자기 codex 브랜치만 비강제 push하고 main push·병합·force·reset·checkout·서버 재시작·Steam 배포는 하지 않는다.

첫 커밋 시 `.githooks`의 `tools/docs-sync-check.mjs:34–44`가 진행로그 누락을 거부했다. `ALLOW_MISSING_DOCS` 우회 없이 위 최소 변경로그 append를 포함해 정상 커밋한다.

구현 결과 커밋 SHA: **`2c61d82debf2006f19d3bd446dcc137084b44cc8`** (parent=`c7c910fd04559a78be0e64295a97390d01fd2d09`). 후속 문서 커밋은 제출 SHA 기록과 이번 append 구간의 줄바꿈만 정리한다. 최종 제출 HEAD와 원격 ref 대조는 `~/exoduser-wt/_out/starter-regions-fix/DONE.txt`·`submission.json`에 기록한다. 이번 결과는 지정 starter 테스트의 기대 정정이며 전체 게임·실창·시각 품질 검수 완료를 뜻하지 않는다.

## 총괄 병합 메모(PC Claude 2026-10-20)

병합 직전 main에 P3-002 소환굴(43aa97ffe)이 들어와 원본 30625 `G._totalSpawned` 키가 G에 추가됐다. 이 수정본 그대로는 148/1이 재발해, 정확 키 집합 검사를 유지한 채 `SPAWN_HOLE_INIT_G_KEYS=["_totalSpawned"]` 1개를 원본 행 주석과 함께 추가했다. 병합본 재실행 148/0, ASSERT_FAIL 0.
