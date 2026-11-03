# W01 — 자동 석궁 탐지 spec 독립 이식

## 범위·기준

| 항목 | 근거 |
|---|---|
| 작업·브랜치 | `w01` / `codex/w01-20261020` |
| worktree | `~/exoduser-wt/w01` |
| fetch 후 기준 main | `c3cf8ce6b0cc1a5c381240260e03dff71c68af8d` |
| 구현 지시서 | 이 스레드의 추적 문서 `FDG_SOURCE_TRACE_WEAPONS_20261020.md` §8, 제출 SHA `f6b8670b02e8c19982d74c89eca07486222ce3e3`. 이번 기준 main에는 아직 없으므로 복사·수정하지 않음 |
| 원본 대조 | 위 두 SHA 사이 `game.html`·기존 catalog·기존 coercion helper 변경0 |
| 원본 해시 | game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 실행 바이너리 | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, `4.7.2.stable.official.ed1daf0bf` |
| 원로그 | `~/exoduser-wt/_out/w01/` |
| 보호 | Q/E·2_3·저장 형식·기존 테스트·공용 제품 파일·다른 담당 파일 변경0 |

W01은 `_autoBowSpec()`의 독립 계산만 공급한다. 실제 Main/current INV 획득·자동 사격·투사체·자원·clock·화면 연결은 이 단위에 포함하지 않는다. 테스트의 0실패를 실제 활 발사 완료로 해석하지 않는다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `godot/port_modules/auto_bow_spec/producer.gd` | 신규 RefCounted 계산·receipt. 기존 catalog/JS helper 재사용 |
| 같은 경로 `producer.gd.uid` | 원본 Godot가 생성한 신규 스크립트 UID |
| `godot/tests/test_native_auto_bow_spec.gd` | 신규 SceneTree 독립 테스트. 고정 oracle·변환 경계·의존 실패·불변성·지원 밖 단정 |
| 같은 경로 `test_native_auto_bow_spec.gd.uid` | 신규 테스트 UID |
| `docs/CHANGELOG_SYNC.md` | 맨 위 기존 형식의 W01 동기화 절 |
| 이 보고서 | 원본 근거·격리·실행 성적·한계 |

`main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`, `native_source_new_run_state.gd`, `native_regions.gd`, 기존 catalog/helper 및 다른 담당 파일은 변경하지 않았다. 생성 중 worktree를 너무 일찍 조회해 복사 전 파일이 삭제처럼 표시됐지만 checkout 완료 후 tracked INDEX/WORK가 깨끗함을 다시 확인했고 실제 삭제는 수행하지 않았다.

## 원본 행·수식

행 번호는 위 main SHA의 `game.html` 기준이다. 1000/13 상수만 기본 spec으로 쓰면 빈 장비의 실제 결과와 달라진다.

| 원본 | 그대로 이식한 계약 |
|---|---|
| BOWTYPES:15886–15890 | 기존 `source_item_catalog.gd:54–55`의 `bow_definition` 사용. crossbow800/22, repeater700/22, arcane840/22. 새 타입 테이블0 |
| XBOW_RANGE/SPEED:17446,17449 | 마지막 range1000/speed13 fallback |
| `_autoBowSpec`:17451–17457 | btype truthy 선택→catalog 조회→ordinary unknown은 crossbow 재조회 |
| :17454 / pBowRange:28044 | `max(220,(max(b.bowRange\|\|0,brd.range\|\|1000)+(b.bonusRange\|\|0)*12)*(1+pBow*.08))` |
| :17455 | `b.bowProjSpd\|\|brd.projSpd\|\|13`가 선택한 **raw Variant** 반환 |
| 기존 helper:312–374 | `equipment_affix_reader/producer.gd`의 js_truthy/js_property_key/js_to_number 재사용. helper 변경0 |

입력은 caller가 이미 `bw()`의 effective Dictionary를 확보했다는 계약이다. 권위 미준비와 실제 빈 장비를 같은 `{}`로 처리하는 owner를 새로 만들지 않았다. `pBow` presence를 보존하므로 키 부재는 NaN, 명시 null은0이다. Math.max의 NaN 전파를 명시 구현했고, 최종 결과 외 중간 clamp·truncation·속도 숫자화를 추가하지 않았다.

| receipt status | 정확한 의미 |
|---|---|
| READY | 최종 range/spd가 유한 숫자. 음수 speed도 원본 결과 그대로이며 실제 발사 준비 완료 표시가 아님 |
| SOURCE_NON_FINITE | 최종 숫자 NaN/Infinity를 raw 결과로 보존. 0/220 같은 대체값을 만들지 않음 |
| SOURCE_RAW_SPEED | 문자열·배열·Dictionary 등 raw speed 보존. 동시에 range가 비유한이면 non_finite_fields에 기록 |
| SOURCE_UNSUPPORTED | prototype 상속 key12종·btype Array/Dictionary/미지원 숫자 key·Godot 전용 숫자 carrier·사용자 converter·singleton 순환 배열. 결과 range/spd=null, 이유 기록 |
| NOT_READY | null/메서드 없는 catalog, 비Dictionary 정의, 기본 crossbow 정의 부재. source fallback과 구분 |

receipt에는 기준 SHA·함수/행·raw 입력·presence·선택 catalog key·두 fallback 구분·계산 중간값·raw 결과를 기록한다. source metadata는 호출마다 deep copy다. 독립 검토에서 발견한 singleton Array 자기/상호참조는 `is_same` 방문 기록으로 거부하며 기존 helper로 무한 재귀시키지 않는다. 원본 carrier는 수정하지 않고 fixture 순환은 테스트 종료 전에 해제한다.

## 검증·격리

import 전에 `~/Library/Application Support/Godot/` 전체를 `~/exoduser-wt/_backup/godot-appsupport-20261020-w01/`로 복사하고 68개 파일의 SHA256 일치를 확인했다(`backup-verification.json`). 권한 오류·우회는 없었다.

| 실행 | 사용자 폴더·설정 |
|---|---|
| 새 W01 | **`EXODUSER-w01-Isolated-20261020`**. 최신 배정 이름을 적용하며 이전 추적 문서의 예시 이름보다 우선. Main 부팅0, test _initialize에서 설정 |
| contracts | 상수 없음. 저장소 밖 `test_contracts_isolated.gd`가 `EXODUSER-w01-Contracts-Isolated-20261020` 설정 후 원 `_initialize`를 호출. 원 테스트 변경0·Main 부팅0 |
| regen | 기존 ISOLATED_DIRECTORY `EXODUSER-SourceRegenPhase-Isolated-20261014` |
| p2001c | 기존 USERDIR `EXODUSER-P2001C-Isolated-20261020` |
| p1002g | 기존 USERDIR `EXODUSER-P1002G-Isolated-20261020` |

실제 Main 3종에만 `godot/override.cfg`를 실행 직전 해당 이름으로 설정하고 각 실행 finally에서 비웠다. 모든 실행은 headless·순차이며 engine 로그도 `_out/w01/<실행명>.godot.log`로 지정했다. 실제 저장 폴더 `EXODUSER-Godot-Native-First`·기존 게임 창·타 작업자의 worktree/log를 조작하지 않았다.

이번 Mac에서 사용한 headless 신규 테스트 명령과 회귀 실행 진입점은 다음과 같다. 외부 runner는 위 표의 Main 3종에만 override를 설정하고 비우며, contracts는 `--script /Users/fordeargamers/exoduser-wt/_out/w01/test_contracts_isolated.gd`를 사용한다. 전체 인수 배열·마지막 RESULT 원문·exit·시간은 각 `<실행명>.result.json`에 보존했다.

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path /Users/fordeargamers/exoduser-wt/w01/godot --log-file /Users/fordeargamers/exoduser-wt/_out/w01/w01.godot.log --script res://tests/test_native_auto_bow_spec.gd
python3 /Users/fordeargamers/exoduser-wt/_out/w01/run_validation.py contracts
python3 /Users/fordeargamers/exoduser-wt/_out/w01/run_validation.py regen
python3 /Users/fordeargamers/exoduser-wt/_out/w01/run_validation.py p2001c
python3 /Users/fordeargamers/exoduser-wt/_out/w01/run_validation.py p1002g
```

| 실행 | 마지막 RESULT의 단정/실패 | exit | stderr ERROR | WARNING | 소요 | 원로그 |
|---|---|---:|---:|---:|---:|---|
| 초기 import | 해당 없음 | 0 | 0 | 0 | 91.340s | `import.stdout.log` / `import.stderr.log` |
| test_native_auto_bow_spec | 361 / 0 | 0 | 0 | 0 | 1.850s | `w01.stdout.log` / `w01.stderr.log` |
| test_contracts | 5그룹 / failed_assertions=0 (단정 총수 미출력) | 0 | 0 | 0 | 8.453s | `contracts.stdout.log` / `contracts.stderr.log` |
| test_native_source_player_regeneration_phase | 88 / 0 | 0 | 0 | 9 | 150.019s | `regen.stdout.log` / `regen.stderr.log` |
| test_p2001c_kill_rewards | 39 / 0 | 0 | 0 | 1 | 28.865s | `p2001c.stdout.log` / `p2001c.stderr.log` |
| test_p1002g_kislash_hurte (선재 결함) | 168 / 1 | 1 | 0 | 1 | 36.209s | `p1002g.stdout.log` / `p1002g.stderr.log` |

새 테스트는 source의 고정24사례 중 지원21개를 실제 Godot 값과 대조한다. prototype `__proto__`/constructor 및 Array btype 3개는 원본 결과를 로그에 보존하되 W01이 명시적으로 지원 밖임을 단정한다. 추가 경계·진단·불변성까지 총63사례/361단정이다. 기대값은 제품 수식을 다시 계산해서 만들지 않았다.

원본 직접 평가 `source_probe.mjs`/`source-probe.json`은 최신 game.html 원문 행을 VM에 추출해 실행했다. `oracle-comparison.json`에서 지원21개의 range/raw speed 일치를 별도 확인했다. 최초359/0 로그는 `w01-initial-359.*`로 보존했고, NaN을 포함한 입력 불변 단정2개를 보강한 최종 실행이361/0이다. 제품 수식 변경이나 기존 회귀 재작성은 없었다. Main 회귀의 결과는 기존 fixture/테스트 범위이며 전체 source authority·전체 Q/E·실플레이 인수를 뜻하지 않는다.

## 선재 결함·원문

사용자 배정 및 기준 main 작업판의 P2-008a etype20 선재 결함은 별도로 기록한다. 이번 실행은168단정/1실패·exit1이며 PASS로 집계하지 않는다. 기존 테스트·적 코드·피해 집행자는 수정하지 않았다. 실패 원문은 다음과 같다.

```text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
```

전체 `P1002G_RESULT` 원문은 `p1002g.stdout.log` 마지막 줄, 마지막 RESULT 추출은 `p1002g.result.json`에 그대로 보존했다. 두 전투 회귀는 skipped=[]·3그룹 실행을 확인했다. ERROR0은 이 단정 실패가 없다는 뜻이 아니다.

## 문서 검색·제출 검사

구현 후 docs 전체에 `_autoBowSpec|auto_bow_spec|pBowRange|bowProjSpd`를 검색했다(`docs-search-after.log`). 현재 main 매칭5개는 스킬 패시브식·아이템 affix 분류·SAVE field 색인·INVENTORY 생성 필드·starter factory 필드다. 기존 값은 그대로이며 새 독립 모듈 인수 상태와 지원 범위는 이 보고서·CHANGELOG에 기록했다. 설계 문서·기존 추적 문서·다른 담당 문서는 수정하지 않았다.

제출 범위는 위6경로이며 테스트는 경로 지정 `git add -f` 대상이다. 공용·원본11경로와 기존 회귀4파일의 byte 일치·원 CHANGELOG 본문 보존·빈 override는 `precommit-audit.json`, 실행 수치는 `validation-summary.json`이 근거다. 훅 원로그는 `git-commit.log`, push 원로그는 `git-push.log`다. 최종 branch/SHA·원격 readback·경로·수치의 제출 정본은 `~/exoduser-wt/_out/w01/DONE.txt`와 `submission.json`이다. main push·merge·force·reset 없이 자체 codex 브랜치만 제출한다.
