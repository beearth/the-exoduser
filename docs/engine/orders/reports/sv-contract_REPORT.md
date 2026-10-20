# SV-CONTRACT 보고서 — 원본 세이브 5생산자 key set·타입 계약

상태: **검수 대기 — 저장 계약 및 완료된 회귀 통과, Main 회귀3종은 격리 제한으로 미검증** · 2026-10-20 KST

## 범위·소스·보호

| 항목 | 확인 결과 |
|---|---|
| 작업·브랜치 | `sv-contract` / `codex/sv-contract-20261020` |
| 작업 위치 | `/Users/fordeargamers/exoduser-wt/sv-contract` |
| 시작·최종 기준 SHA | 시작 `19a713578e478fce5e4e7231140c6ed9f8883e98`(요구한 `ad6ac68a2` ancestor exit0). 최종 기준 `f84e26ee0bbc929fb595b4c0af292b423588f325`. fetch 후 `9528ea35b429498fcf42fe3723008219ed0ed7e1`, 추가 fetch 후 `f84e26ee0bbc929fb595b4c0af292b423588f325`를 각각 자기 브랜치에 `git merge --ff-only origin/main`으로 통합(각 exit0). rebase/force 없음 |
| 배정 확인 | 원격 `WORK_BOARD.md`의 SV-CONTRACT 소유 행과 병합된 `FDG_SOURCE_TRACE_SAVE_20261020.md` §0/SV-CONTRACT·부록 C를 먼저 읽었다. 이후 작성된 로컬 trace 보충안이나 R의 뒤처진 game.html을 입력으로 사용하지 않았다 |
| 생성·커밋 대상 | `godot/tests/test_native_save_contract.gd` 1개 + 이 보고서 + 승인된 `docs/CHANGELOG_SYNC.md` 맨 위 신규 절(기존 내용 byte 보존). 제품·기존 테스트·설계 docs·WORK_BOARD 수정0. 테스트 blob=`5c0b4a8f91070efd965a35a2554947d65e3142aa` |
| 보호 | 세이브 키·형식·마이그레이션·Q/E·docs/2_3 변경·변경 제안0. Main/수집기/저장·복원 구현0 |
| 공용6파일 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 각각 변경0행. game.html/index.html/project.godot와 함께9경로가 최종 기준 HEAD와 byte 동일. 시작 대비 hud.gd/player.gd의 차이는 P2-007a main 통합분이며 자기 수정0 |
| 기준 R | branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184` 보존. 파일 수정·브랜치 전환·커밋0 |
| 실제 source | `/Users/fordeargamers/exoduser-wt/sv-contract/game.html`. SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 병합된 추적 문서 | `docs/engine/FDG_SOURCE_TRACE_SAVE_20261020.md`, SHA256=`6ed79d39a9656f2b25582b6cd6b5db133cde5a0988e2f5621fd005582d1805ec`. 읽기만 수행 |

## 최신 main 원본 행 근거

다섯 저장 **object 리터럴만** 원본에서 추출한다. dbSave 본문의 admission·공유flush·API/로컬 저장·마이그레이션·부팅은 실행하지 않는다. 아래 행은 새 WT의 실제 source scanner가 반환한 값이다.

| 생산자 | game.html 실제 행 | 펼친 key 수 | 리터럴 SHA256 |
|---|---|---|---|
| cloud | 3543–3575 | 67 | `eacc5ef2523a6a994b867da1bad63381d9573837a7d1017aca3b81884aed0754` |
| local | 63905–63931 | 67 | `c6ea12d674d1bcc5bc918742c88d19db2a4316d9d7b7b9db847c93cb4951afa3` |
| web | 64062–64088 | 67 | `c6ea12d674d1bcc5bc918742c88d19db2a4316d9d7b7b9db847c93cb4951afa3` |
| demo | 62131–62159 | 67 | `a40ac9e4ebd027f43ea35ab19d687c70a90d845d53eb53c03a529b2fd16de62e` |
| demo500 | 61996–62017 | 49 | `ba32a5362b5beb4699f5b8b336dee965a24f5a5578b7add181419d470452c1da` |

예약 helper는 game.html:51219–51221, SHA256=`971f1e0dcfb0d54890c3f0440601bedb4ce295221bdc29dc3cf0b7b9c6660551`다. 부록 C의317개 존재 필드 표현식과 현재 원본을 대조하고 union68 경로를 확인한다. player/inv/game만 한 단계 펼치며 아이템·숙련도 등 동적 내부 키를 고정 schema로 축소하지 않는다.

## 새 테스트가 검증하는 계약

- 원본 표현식·부록 C의 필드 집합·독립 고정 기대 key set을 대조한다. 기본 numeric/bool/string/null/array/object 타입은5개 통제 입력 ×5개 생산자, 실제25회 리터럴 평가에서 검사한다.
- Cloud의 ts 부재/전용 marker, Demo500의49필드 예외, game.mats0 대 G.mats, storage{}, gritCostModeV2=1, 원본 active selector 기본값을 확인한다. Q/E는 저장 문자열 관측만 한다.
- 예약큐 own-key 필터·순서·중복·260개 제한, 추가 배열 길이 보존, bagMax 문자열 원값을 검사한다. item의 알 수 없는 중첩 필드·socketQ/crystals·좌표와 JSON undefined 생략/배열null·bool/0/빈문자열을 구분한다.
- 누락키·추가키·배열→객체 타입 변형을 RAM에서 만들어 검출 여부를 확인한다. 새 저장 형식을 제품에 추가하지 않는다.
- 원본 source bytes와 통제 입력의 before/after가 동일하다. 테스트는 실제 런타임 타입 전체의 유효성 규칙을 새로 정하거나 강제하지 않는다.

테스트가 사용하는 Node 프로그램도 **새 .gd 안에 포함**된다. 실행할 때 지정 격리 userdir에 자기 임시 `.cjs`를 만들고 Node에 파일 경로로 전달한 후 삭제한다(삭제 성공 단정 포함). 사용자 슬롯·공유창고·설정·세이브 JSON에는 접근하지 않는다. 별도 제품 .js/collector 파일은 만들지 않았다.

## 실행 환경·명령

Godot는 지정 원앱 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`만 사용했으며 실제 banner는 `4.7.2.stable.official.ed1daf0bf`다. Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (`v24.15.0`), 내장 fs/vm/crypto만 사용한다. 다운로드·패키지 설치0.

`godot/override.cfg`는 원래 없었으며 실행 동안만 아래를 적용했다. 실제 출력 userdir=`/Users/fordeargamers/Library/Application Support/EXODUSER-sv-contract-Isolated-20261020`. **완료 후0byte로 비웠고 커밋하지 않는다.** 새 테스트와 완료된 관련 회귀는 실제 Main을 부팅하지 않는다. 추가 Main 회귀3종은 아래 격리 gate에서 중단/전부 skip되어 Main 미부팅이다. test_contracts는 World/Player/HUD 계약을 자체 구성한다.

```ini
[application]
config/use_custom_user_dir=true
config/custom_user_dir_name="EXODUSER-sv-contract-Isolated-20261020"
```

다음은 WT 루트 기준 명령이다. 실제 절대 인수·exit code는 각 `.command.json`에 보존했다. 각 실행의 stdout/stderr/engine log는 별개 파일이며 재실행 결과를 합산하지 않는다.

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/test_native_save_contract.gd --log-file /Users/fordeargamers/exoduser-wt/_out/sv-contract/contract-main-f84-engine.log -- --node-bin=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/test_contracts.gd --log-file /Users/fordeargamers/exoduser-wt/_out/sv-contract/contracts-main-f84-engine.log
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/test_native_source_update_clock_play_time.gd --log-file /Users/fordeargamers/exoduser-wt/_out/sv-contract/clock-main-f84-engine.log -- --only=producer_stage_play_time_contract
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/balanceExpCurve.test.js
```

새 WT에 리소스 캐시가 없어 필수 test_contracts 실행 전에 지정 원앱으로 `--headless --editor --import --path godot`를1회 수행했다. exit0, stderr0byte. 캐시는 자기 WT의 `.godot`에만 생성했으며 다른 WT의 캐시를 복사하지 않았다. 전역 설정을 변경하는 명령은 실행하지 않았다. 최초 검수 당시 제품/공용9경로 byte와 tracked diff가 그대로임을 확인했다(이후 main UI 통합분과는 구분).

## 실제 실행 결과

| 실행 | 결과 | 해석 |
|---|---|---|
| parse | exit0 | 첫 구문 검사. 행동 PASS와 합산하지 않음 |
| contract-first | exit2, setup 실패 | macOS OS.execute에 긴 inline JS를 전달한 명령 구성에서 backtick 인용 오류. 이 실행은25회 평가·계약 검증을 완료하지 못했다. 원로그 보존 |
| contract-02 | 3,020 checks / 10 failures / exit1 | 중첩 JSON 숫자 배열을 GDScript int 리터럴 배열과 직접 비교한 테스트 오류. 원본 필드집합/기본타입 대조는 통과했으나 전체는FAIL이다. 원로그 보존 |
| contract-03 merge 전 | **3,023 checks / 0 failures / exit0** | 수정된 새 테스트의 독립 전체 실행.5profile×5case=25원본 리터럴 평가. stdout 결과 JSON·stderr0byte |
| test_contracts 전체 | **5그룹 통과 / 실패단정0 / exit0** | map·charge·projectile·pause_capture·damage. only=[]로 전체 실행. 실플레이/FPS 근거 아님 |
| 관련 Godot 시간 계약 | **17 assertions / 0 failures / exit0** | producer_stage_play_time_contract만 명시 선택. Main writer/frame 그룹은 실행하지 않았고 그 결과를 주장하지 않음 |
| 관련 EXP 복원 회귀 | **4 tests / 4 pass / 0 fail / exit0** | game.html 및 기존 easy판의 정상/구버전 EXP 경계. easy판 전수 추적을 뜻하지 않음 |

contract-02의 비교는 JSON의 단일 Number 타입으로 고쳤다. int/float 값은 정확비교하며 허용오차를 추가하지 않았다. bool/null을 Number와 구분하고 [1,100] 대 [1,101] 거부를 새 음성 단정으로 넣었다. 기대값·제품 소스·타입 계약을 완화하지 않았다.

| contract-main-f84 검사군(merge 전과 동일) | checks | failures |
|---|---|---|
| source_and_appendix | 1037 | 0 |
| key_sets_and_types | 1785 | 0 |
| producer_differences | 48 | 0 |
| defaults_and_queue | 67 | 0 |
| dynamic_items_and_json | 45 | 0 |
| read_only_and_detector_controls | 34 | 0 |
| setup·격리 임시 helper 생성/삭제/프로브 | 7 | 0 |

성공한 최종 계약·각 회귀·import의 stderr는 모두0byte, SCRIPT ERROR/ERROR/WARNING0이다. 아래 starter 격리 gate의 ERROR는 별도 실패로 보존한다. 첫 두 실패 실행과 최종 성공을 단일 누적 PASS로 계산하지 않는다.

## 최신 main 통합 후 재검증 — f84e26ee0

PC 총괄의 `19a713578` 공지 수신 후 fetch한 `9528ea35b429498fcf42fe3723008219ed0ed7e1`을 먼저 fast-forward 통합하고6실행을 검수했다. 이후 공용 원격 ref가 UI 마감 병합분으로 갱신된 것을 확인해 다시 fetch하고 **`f84e26ee0bbc929fb595b4c0af292b423588f325`를 최종 기준으로 fast-forward 통합**했다. stage2개는 외부 `pre-main-merge-*.patch`/`pre-main-f84-merge.patch`로 보존했으며 각각의 수신18/45경로와 자기 신규2파일은 충돌하지 않았다. 최종 main의 WORK_BOARD도 다시 읽었고 SV-CONTRACT 소유 범위는 그대로다. 아래는 **f84e26ee0에서 실제 재실행**한 결과이며 이전 실행과 합산하지 않는다.

P2-007a에서 추가된 font/VFX 등 새 리소스 때문에 지정 Godot로 자기 WT의 `--headless --editor --import --path godot`를 추가1회 실행했다(`import-main-f84.*`, exit0·stderr0byte). 최종 보호9경로는 최종 HEAD와 byte 동일하고 own INDEX/WORK 변경0이다. 시작 baseline 대비 hud.gd/player.gd는 인수된 main 코드 변경이며 자기 수정이 아니다. game.html/index.html/project.godot 및 나머지 공용4파일은 시작 byte와도 동일하다.

| 원로그 접두사 / 실행 | 통합 후 결과 |
|---|---|
| `contract-main-f84` / 신규 저장 계약 전체 | **3,023 checks / 실패0 / exit0**, 5생산자×5입력=25평가, Main 미부팅 |
| `contracts-main-f84` / test_contracts 전체 | **5그룹 / 실패단정0 / exit0**, only=[] |
| `clock-main-f84` / producer_stage_play_time_contract | **17 assertions / 실패0 / exit0**, Main 그룹 선택 안 함 |
| `exp-main-f84` / balanceExpCurve.test.js | **4 tests / 4 pass / 실패0 / exit0** |
| `regions-core-main-f84` / test_p3003_regions.gd `-- --only-core` | **27 assertions / 실패0 / exit0**, 테스트 소유 소환굴 fixture, Main 미부팅 |
| `regions-display-main-f84` / test_p3003_regions.gd `-- --only-display` | **7 assertions / 실패0 / exit0**, 메모리 픽셀 검사, Main 미부팅 |

Main 기준은 공지대로 **G40+지역7+`_totalSpawned`1=48키**, 지역 total **23/60/53/32(합168)**, 시작 HUD **0 / 32**로 기록한다. 원본 `game.html:30625`가 소환굴 합을 `_totalSpawned`에 기록하고, `60698–60718`이 지역7필드 및 소환굴 분면 합/현재 지역을 만들며, `60321–60322`가 현재 지역 total을 HUD 분모로 쓰는 코드 경로를 확인했다. 기존 starter 테스트 `:10–18,98–103`도 정확한40+7+1 key set이다. **이 문서에서 위 실제 Main 값의 재실측 완료를 주장하지 않는다.** 새 저장 계약의 `game`9키는 부록 C의 직렬화 리터럴이며 live G 전체48키와 다른 관측 대상이다. 보호된 저장 key set을 확장하거나 형식을 바꾸지 않았다.

지정된 SV 격리 이름으로 다음 Main 회귀도 실제 기동했으나 각 기존 테스트의 고정 격리 gate 때문에 본문은 실행하지 못했다. 기존 테스트나 격리 설정을 다른 이름으로 바꾸지 않았고 아래 exit0/0검사를 PASS로 세지 않는다.

| 원로그 접두사 / 기존 테스트 | 실제 결과·제한 |
|---|---|
| `starter-isolation-main-f84` / test_native_main_source_starter_state.gd | **exit2**, `STARTER_INVALID_ISOLATION`; 요구 이름 `EXODUSER-MainSourceStarter-Isolated-20261014`(`:21,29–32`). G48 검사 미실행 |
| `holes-isolation-main-f84` / test_p3002_spawn_holes.gd | exit0이나 **assertions0·6그룹 전부SKIP**. 요구 이름 `EXODUSER-P3002-Isolated-20261020`(`:11,44–51`). 실제168/지역/HUD 검사 미실행 |
| `hud-isolation-main-f84` / test_p2002a_hud.gd | exit0이나 **assertions0·2그룹 전부SKIP**. 요구 이름 `EXODUSER-P2002A-Isolated-20261020`(`:8,26–33`). 실제HUD 검사 미실행 |

최종 재실행 및 gate probe의 절대 명령·SHA·exit는 각각 `.command.json`, stdout/stderr와 `*-engine.log`에 보존했다. `main-f84-rerun.json`은 import·성공한6실행·gate probe3실행 목록이다. 모든 실행 후 `godot/override.cfg`는0byte다. 실제 Main 회귀를 지정 SV 격리 이름에서 실행할 수 있는 승인 범위는 **BLOCKED**이며 우회하지 않았다.

## 원로그·변경 경계·남은 것

- 원로그 루트: `~/exoduser-wt/_out/sv-contract/`. `contract-first.*`, `contract-02.*`, `contract-03.*`, `contracts-regression.*`, `clock-regression.*`, `exp-regression.*`, `import.*`, `parse.*`를 보존한다.
- `before.json` / `final-validation.json`은 최초 검수 기준 SHA·보호9경로 해시를 기록한다. `final-main-f84-validation.json`은 최종 HEAD와9경로의 byte 일치·override0byte·테스트 blob을 기록한다. `docs-search.paths`는 관련키워드 전체 Markdown 검색47경로 결과다. 설계·보호 문서는 수정하지 않았다.
- 실제 저장/복원·자동저장·API·Supabase/RLS·사용자 slot·마이그레이션 실행·Godot 저장 모듈·실창/PC 인수는 **미실행·미확인**이다. 이 결과는 원본 직렬화 리터럴의 합성 입력 계약 검사이며 저장 기능 이식 완료가 아니다.
- WORK_BOARD의 SV-CONTRACT 배정 행은 이미 main에 있다. 이번 파일 제한을 지키기 위해 공용 작업판은 수정하지 않으며 이 보고서와 최종 브랜치/SHA/DONE으로 검수 대기 결과를 전달한다.
- Git에는 새 테스트·이 보고서·승인된 CHANGELOG_SYNC 신규 절만 포함한다. 테스트는 `git add -f -- godot/tests/test_native_save_contract.gd`, 보고서는 지정경로 `git add -- …`로 처리한다. main 브랜치 push/merge·force/reset·R 커밋0(자기 브랜치로 origin/main fast-forward 통합2회). 구현 포함 커밋 SHA는 아래 제출 기록, 최종 원격 제출 SHA와 ref 대조는 `_out/sv-contract/DONE.txt`에 기록한다. 작업판은 총괄 검수 대상으로 남긴다.

## 커밋 훅 차단 이력·승인 후 해소 절차

- 최초 정상 `git commit` 2회 및 직접 hook 검사는 `docs/CHANGELOG_SYNC.md` 변경 요구로 exit1이었다. 원로그 `commit-blocker.txt`, `hook-main-f84.*`를 보존한다. 당시에는 신규 테스트·보고서만 stage했고 우회하지 않았다.
- 맥북총괄의 후속 지시로 이 작업의 CHANGELOG_SYNC 갱신이 범위에 포함됨을 확인했다. 먼저 fetch했고 `origin/main=f84e26ee0bbc929fb595b4c0af292b423588f325`; `git merge --ff-only origin/main` 결과 Already up to date였다. 새 제품/테스트 변경이 없어 같은 main에서 이미 완료한 검수를 반복하지 않았다.
- 지시 순서대로 `node tools/docs-sync-check.mjs --staged`를 직접 실행해 exit1과 위 요구를 재확인했다(`hook-direct-before-log.*`). CHANGELOG_SYNC 맨 위에 `## 2026-10-20 SV-CONTRACT …` 절·지정 표로 새 파일·원본 행·수치·범위 밖을 추가했다. 기존 내용은 `changelog-before-sv-contract.bin`과 byte 동일하게 보존했다(`changelog-prefix-proof.json`).
- 세 경로만 지정 stage하고 같은 직접 검사와 정상 pre-commit을 통과시킨다. `--no-verify`·`ALLOW_MISSING_DOCS`·hook 설정 변경은 사용하지 않는다. 다른 문서 요구가 추가로 나오면 그 원문을 보존하고 BLOCKED로 중단한다.
- 정상 commit/push 결과·구현 포함 SHA는 아래 제출 기록과 외부 DONE에 남긴다. Main 회귀3종의 격리 제한은 미검증 항목으로 유지하며 hook 처리 완료와 구분한다.
