# SV-COLLECT 보고서 — 원본 저장 수집기(읽기 전용)

상태: **1번 단위 collector 구현·요청 회귀 검수 완료 / Main 저장 연결 HOLD** · 2026-10-20 KST

## 기준·소유·보호

| 항목 | 실제 계약 |
|---|---|
| 작업·브랜치 | `sv-collect` / `codex/sv-collect-20261020` |
| 위치 | `/Users/fordeargamers/exoduser-wt/sv-collect` |
| 시작 main | fetch 후 `c3cf8ce6b0cc1a5c381240260e03dff71c68af8d`에서 새 worktree·브랜치 생성 |
| 최종 검수 main | 재부팅 worktree `b887183126eccd05e06fd793b9b8cb7d889cecd6`와 미커밋 collector/test/report를 먼저 백업하고 fetch 시점 최신 origin/main `284d7faf49295b2f5061937a47ce96038032ed3c`까지 정상 fast-forward. 원본 game.html byte 동일 |
| 제품 새 파일 | `godot/port_modules/save_adapter/source_save_collector.gd` |
| 테스트 새 파일 | `godot/tests/test_native_save_collector.gd` |
| 문서 변경 | 이 보고서 및 승인된 `docs/CHANGELOG_SYNC.md` 맨 위 신규 절. 기존 CHANGELOG 본문 byte 보존 |
| 공용·타인 파일 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 각각 직접 수정0행. 기존 테스트·다른 담당 파일·WORK_BOARD 수정0 |
| 보호 | 저장 형식·저장 호출·마이그레이션·Q/E·docs/2_3 변경/변경 제안0. 수집기 설치·Main hook·슬롯/서버/실사용자 저장 IO0 |
| 재사용 기준 | main의 `test_native_save_contract.gd`를 수정 없이 preload하여 SOURCE_PROBE·실제 원본 scanner·5개 입력을 재사용. 최종 blob `5c0b4a8f91070efd965a35a2554947d65e3142aa` |

재부팅 전 작업 이력: 시작 main에 SV-CONTRACT가 없어 직전 제출 `c969c5318479bb9e1369f8f463f98dee6f5dd3f8`의 테스트를 동일 byte로 준비했다. 최종 검수 전 SV-CONTRACT main 병합을 수신했고, 같은 blob임을 확인해 통합했다. **최종 자기 diff에는 SV-CONTRACT 파일이 포함되지 않는다.** 원본 입력은 이 WT의 game.html이며 R의 뒤처진 game.html을 사용하지 않았다.

## 원본 근거·수집 경계

| 생산자 | 최신 main game.html 행 | 펼친 필드 수 | 관측된 차이(보호) |
|---|---|---|---|
| cloud | 3543–3575 | 67 | ts 없음, player._lvStatMigrated 전용, game.mats=0 |
| local | 63905–63931 | 67 | ts 외부 제공 시각, game.mats=0 |
| web | 64062–64088 | 67 | local과 동일 리터럴 계약 |
| demo | 62131–62159 | 67 | game.mats=G.mats, 실제 값·배열 순서 유지 |
| demo500 | 61996–62017 | 49 | rawgrit/유물/숙련도 추가 필드 없음, cutsceneDone=true, activeMagic 기본 arcLaser·activeQ 기본 peaceShield |
| queue helper | 51219–51221 | — | PASSIVES own key·문자열만, 중복/순서 유지·260개 상한 |

game.html SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 위5생산자 리터럴은 독립 Node VM으로 실제 원본 object 표현식만 평가한다. dbSave 본문·JSON 저장·복원·네트워크·로컬/클라우드 IO는 실행하지 않는다. 5생산자 union68 및 부록 C317표현식의 기준 계약은 기존 SV-CONTRACT 검수를 그대로 재사용한다.

| 수집 대상 | 읽기 owner/API·출력 계약 |
|---|---|
| P/G/INV/STATS/PASSIVES | 기존 provider bundle의 current_p/current_g/current_inventory/current_stats/current_passives. 원본이 직접 읽는 필드가 없으면 HOLD; 이미 관측된 객체의 선택 필드는 원본 `||` default만 적용 |
| rawgrit | bundle.raw_grit.read_raw()의 ready/raw. 계산된 gritTotal이나 boot packet을 대신 쓰지 않음; unpublish 시 HOLD |
| reward bags | State.read_native_reward_bags()의 crystal/stone을 crystalBag/stoneBag로 읽음. CRYSTAL_DUST는 별도 globals owner 필수. demo500은 원본에 없는 reader를 소비하지 않음 |
| 외부 globals | save_globals Callable에서 QSLOTS/BAG_MAX/UPGRADES/POT_LV/SKILL_SLOTS/ULT_SLOT/_charIdx 및 full4경로의 CRYSTAL_DUST. owner 부재 시 상수·빈 값으로 제조하지 않음 |
| 경로별 배열 전개 | demo/demo500의 skillSlots는 원본 `[...SKILL_SLOTS]`이므로 Array만 수집; object/null은 실제 원본 TypeError와 대조해 HOLD. 문자열 iterable의 native Unicode 대응은 미검증이므로 HOLD. cloud/local/web 직접 할당은 원본대로 null/object도 보존 |
| 원본 기본값 | empty array/object의 JS truthy·0/false/null/빈문자열/NaN falsy를 구분. root/player/inv/game의 원본 속성 삽입 순서도 보존 |
| 불투명 아이템 | 가방·장착·보관 유물/강화 등 중첩 필드를 통째로 복사. 알려진 필드만 고르는 축소 schema나 새 migration 없음 |
| 반환 분리 | 반환 데이터는 deep detached copy. Godot StringName 키/값은 동일 텍스트의 문자열 캐리어. 반환 객체를 고쳐도 현재 owner 값/참조를 바꾸지 않음 |
| 미지원 native 입력 | cyclic 값·Vector2/Object 등 JSON 대응 미확인 캐리어·비문자열 key·문자열 object spread는 HOLD. 임의 필드 삭제·복구·default 제조 없음. Number 비유한 값은 수집 단계에서 보존하며 JSON encoder는 구현하지 않음 |

## API·Main에서 확인한 범위

- `current_readers(state, providers, save_globals=Callable())`: 기존 동일 Player/World의 State·Providers readiness/identity를 확인하고 읽기 Callable만 묶는다. 새 owner 생성·설치·전역 초기화 없음. 실제 Providers는 RefCounted이므로 인자 타입은 Object다.
- `collect(readers, profile, timestamp_ms=null)`: 한 synchronous pass에서 사용되는 각 reader를1회 호출한다. profile은 cloud/local/web/demo/demo500. cloud 외 시각은 caller가 명시해야 하며 수집기가 새 wall-clock을 만들지 않는다. 여러 owner의 외부 동시 트랜잭션 전체를 보장하는 API는 아니다.
- 성공 envelope의 `payload`만 기존 원본 필드 projection이며 `write_authorized=false`, `main_connected=false`다. 이 wrapper 자체를 세이브 형식으로 쓰지 않는다. 누락·owner loss·미지원 값은 **HOLD + payload=null**로 반환해 부분 수집을 완전한 저장으로 노출하지 않는다.
- 실제 Main은7개 current reader(P/G/INV/STATS/PASSIVES/rawgrit/reward bags)를 읽었다. `save_globals`가 없어 **HOLD / missing=[reader:save_globals]**였다. 실제 raw holder는 ready=true/raw=0, 장착 슬롯17개였다. P/INV 값·참조와 rawgrit 불변, Main 소멸 뒤 HOLD를 확인했다.
- queue/mastery/hellCleared 등 전체 진행 owner의 완전한 게임플레이 인수는 미확인이다. fixture의 READY나 실제 Main의 부분 읽기를 full save 완료로 해석하지 않는다. 제품 저장 호출 연결·저장/복원·마이그레이션·설치/시각 UX·PC 인수는 이번 범위 밖이다.

## 실행 환경·재현 명령

지정 원앱 Godot=`/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, 실제 banner4.7.2.stable.official.ed1daf0bf. Node=`/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` v24.15.0. 새 WT 자체 캐시만 `--headless --editor --import --path godot`로 생성(import exit0·stderr0byte); 타인 WT 캐시/설정 이송 없음.

재부팅 전 fixture-only 실행은 override를 쓰지 않았으나, 재개 후 신규 테스트는 fixture/Main 모두 아래 격리 설정을 요구하도록 바꿨다. 기존 회귀는 각 파일의 상수 격리명을 사용한다. 모든 실행 직전 전역 Godot 수를 확인하며2 이상이면30초씩 대기한다. 직접 `pgrep -f "Godot.app/Contents/MacOS/Godot"` 결과의 행 수를 세어 `| wc -l`과 같은 조건을 적용하며 `resume-20261020/process-guard.jsonl`에 기록한다. 이 작업 Godot는 순차1개다. 끝나면override.cfg를0byte로 비우고 커밋하지 않는다. 신규 collector 테스트의 Node helper는 외부 원로그 폴더에 자기 임시 .cjs를 만들고 삭제하며 사용자 저장을 읽거나 쓰지 않는다. 기존 SV-CONTRACT는 자기 격리 userdir 안에 임시 probe를 만들고 제거한다. 게임 저장 함수 실행은 둘 다0이다.

```ini
[application]
config/use_custom_user_dir=true
config/custom_user_dir_name="EXODUSER-sv-collect-Isolated-20261020"
```

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/test_native_save_collector.gd --log-file /Users/fordeargamers/exoduser-wt/_out/sv-collect/collector-main-02-engine.log -- --main --node-bin=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --artifacts-dir=/Users/fordeargamers/exoduser-wt/_out/sv-collect
```

기존 회귀의 실제 전체 명령·exit·격리 이름은 각각 `.command.json`에 보존한다. 아래 `res://tests/<파일>`을 동일 지정 Godot의 `--headless --path godot --script`로 실행하며, flags는 `--` 뒤에 전달했다.

| 기존 파일 | flags·격리 |
|---|---|
| test_native_save_contract.gd | --node-bin=지정 Node / EXODUSER-sv-contract-Isolated-20261020 |
| test_contracts.gd | 전체 only=[] / Main 미부팅·override 없음 |
| test_native_source_update_clock_play_time.gd | --only=producer_stage_play_time_contract / Main 미부팅·override 없음 |
| test_native_main_source_starter_state.gd | 전체5그룹 / EXODUSER-MainSourceStarter-Isolated-20261014 |
| test_p2001c_kill_rewards.gd | 전체3그룹 / EXODUSER-P2001C-Isolated-20261020 |
| test_p1002g_kislash_hurte.gd | 전체3그룹 / EXODUSER-P1002G-Isolated-20261020 |
| Node test/balanceExpCurve.test.js | 지정 Node --test, Godot override 없음 |

## 재부팅 전 결과와 실패 이력

| 실행·원로그 접두사 | 실제 결과·해석 |
|---|---|
| parse-collector / parse-test | check-only 각각 exit0. 행동 PASS와 합산하지 않음 |
| collector-fixture-01 | **87검사 / 44실패 / exit1**. collector가 자체 dot 할당으로 생긴 StringName key를 JSON 문자열 key로 취급하지 못해 정상 입력도 HOLD. 원로그 보존 |
| collector-fixture-02 | 33,955검사 / 실패0 / exit0. StringName 캐리어 수정 후 전체40원본 대조. 이후 원본 속성 순서·완료 sentinel·Main 검증을 추가했으므로 최종본 검수 수치와 합산하지 않음 |
| collector-main-01 | 출력은34,117/0·exit0이나 **INVALID, PASS 제외**. Providers를 Node 인자로 제한해 SCRIPT ERROR, Main 그룹1단정 후 중단. 0실패 출력만으로 통과 처리하지 않음 |
| collector-main-02 (재부팅 전) | **35,786검사 / 실패0 / exit0**,40원본 projection 및 실제 Main 포함. SCRIPT ERROR0·ERROR0. Camera2D physics interpolation 경고1개는 보존 |
| save-contract-regression | **3,023검사 / 실패0 / exit0** |
| contracts-regression | **5그룹 / 실패단정0 / exit0** |
| clock-regression | **17단정 / 실패0 / exit0**, 생산자 그룹만 실행 |
| starter-regression 첫 실행 | **120초 TIMEOUT**, 앞4그룹 완료·실패0이나 전체 PASS 아님. 원로그 보존·재실행은300초 제한 |
| starter-regression-02 (재부팅 전) | 전체5그룹148검사/실패0 결과 로그 보존. 재개 후 필수 회귀 결과와 합산하지 않음 |
| rewards-regression (재부팅 전) | 전체3그룹45검사/실패0 결과 로그 보존. 재개 후 필수 회귀와 별개 |
| kislash-known-baseline (재부팅 전) | 결과 marker 없이 부팅 로그만 남아 있음. 중단된 실행이며 PASS로 세지 않고 재실행하지 않음(이번 필수 회귀 아님) |
| exp-regression | 실행 결과 파일 없음. 미실행/미확인, PASS로 세지 않음 |

| 재부팅 전 main-02 검사군 | assertions | failures |
|---|---|---|
| original_source_profiles | 34063 | 0 |
| missing_owners_and_unsupported_inputs | 39 | 0 |
| detached_read_only_and_current_values | 9 | 0 |
| actual_main_readers_and_owner_loss | 1667 | 0 |
| setup | 8 | 0 |

기존5입력×5생산자25평가와 empty_truthy/null_spreads/array_spreads 3입력×5생산자15평가를 실제 원본 VM에서 평가했다. 전체40결과의 key/type/value/배열 길이·순서 및 반환 데이터가 owner를 쓰지 않는지 비교한다. leaf 단위 비교에 따른 단정 수이며 성능·실플레이 인수 수치가 아니다. JS undefined/NaN이 포함된 기존 JSON-carrier 입력은 원본 JSON roundtrip으로 native 입력에 전달하며, 원본 JSON 결과와 비교한다.

## 재개 후 최종 검수

최종 collector와 지정 회귀 2종을 `resume-20261020/`에서 순차 재실행했다. 신규 테스트는 기존40원본 projection 외 skillSlots object/null×5프로필의10개 원본 VM 평가를 추가했다. Main의 읽기 owner·상태 불변·owner 소멸 HOLD까지 같은 실행에서 검증한다.

| 재개 후 최종 실행 | 실제 검사 | 실패 | exit | ERROR/SCRIPT ERROR |
|---|---:|---:|---:|---:|
| collector (40개 정상 원본 projection + 10개 iterable 경계 + 실제 Main) | 37871 | 0 | 0 | 0 |
| test_contracts (전체) | 5그룹 | 0 | 0 | 0 |
| test_native_save_contract (원본 그대로) | 3023 | 0 | 0 | 0 |

| 최종 collector 검사군 | assertions | failures |
|---|---:|---:|
| setup | 8 | 0 |
| original_source_profiles | 34063 | 0 |
| missing_owners_and_unsupported_inputs | 2124 | 0 |
| detached_read_only_and_current_values | 9 | 0 |
| actual_main_readers_and_owner_loss | 1667 | 0 |

collector의 Camera2D physics interpolation 경고1개를 보존했다. ObjectDB 잔존 경고는 이번3실행 모두0. 신규 테스트 actual_main_tested=true, 원본40 projection과 슬롯 경계10건 실행, Main7 reader/장착17개/rawgrit ready0/HOLD missing=[reader:save_globals]를 실제 관측했다. 모든 테스트 종료 뒤 override.cfg0byte를 확인했다. 원격 전달 전 테스트가 읽은 collector/test의 SHA-256과 현재 파일도 다시 대조했다.

재개 후 코드 보완은 demo/demo500의 SKILL_SLOTS iterable 조건1곳과 신규 테스트의 전체 격리 검사·원본 경계10평가뿐이다. 기존40건 대조와 보호 원본·테스트는 변경하지 않았다. 이번 검수는 수집기1번 단위이며 full Main save/저장 복원/제품 설치 인수로 승격하지 않는다.

## 원로그·정상 제출·남은 것

원로그 루트 `~/exoduser-wt/_out/sv-collect/`. 원본 리터럴 행·해시와40결과는 `collector-oracle.json`, 각 실행은 stdout/stderr/engine.log/command.json으로 분리한다. 재부팅 전 `before.json`, `main-merge-input.json`, `docs-search.paths`를 보존했다. 재개 후 docs 전체 검색14경로와 보호 파일 검증은 `resume-20261020/docs-sync-all-paths.txt`, `protected-files.json`에 따로 기록했다. 실패/중단/경고와 최종 성공을 합산하지 않는다.

정상 pre-commit의 `node tools/docs-sync-check.mjs --staged`를 통과한 뒤 자기 브랜치에만 비강제 push한다. 저장소의 `test_*` ignore 규칙 때문에 신규 테스트와 자기 UID 두 경로에만 명시적으로 git add -f를 사용하며 훅은 그대로 실행한다. `--no-verify`·ALLOW_MISSING_DOCS·hook 변경·main push·force push/reset 없음. R은 최초 branch/HEAD 및 tracked INDEX/WORK를 보존한다. 자기 WORK_BOARD 행은 이 보고서·브랜치·SHA/DONE으로 총괄에 전달한다.

구현 포함 SHA·원격 ref·최종 수치는 원로그 루트 DONE.txt에 기록한다. 재부팅 전 미커밋 작업은 `resume-20261020/resumed-WIP.tar.gz`, 공용6+기존계약테스트+game.html+project.godot 바이트 동일9경로는 `protected-files.json`에 보존한다. 현재 full Main save는 외부 owner 미인수로 **HOLD**이며, collector의 구현·계약 검수 완료와 분리한다.
