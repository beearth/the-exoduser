# QS-01 — 물약 정의·회복량·자동 CD 순수 계산 이식

2026-10-20 KST · QS-01 순수 모듈 및 승인된 기존 G/지역/HUD 3suite 검수 완료 / 검수 대기. 이전 실패·미실행 이력은 아래에 분리 보존한다. **순수 계산만 구현**했으며, 자동 물약 발동·HP/악의 변경·Main 연결은 하지 않았다.

## 기준·소유·변경 경로

| 항목 | 실제 결과 |
|---|---|
| 작업/브랜치 | `qs-01` / `codex/qs-01-20261020` |
| worktree | `/Users/fordeargamers/exoduser-wt/qs-01` |
| 최초 fetch 기준 | `ad6ac68a2e009c4d299fe1dd2264182355ee992c` — 요청한 최소 main SHA 포함 |
| 최신 동기화 기준 | `19a713578e478fce5e4e7231140c6ed9f8883e98`. 사용자 최신 지시로 `git fetch origin` 후 **자기 브랜치에서** `git merge --ff-only origin/main` 성공. `43aa97ffe` 소환굴 병합과 STARTER-REGIONS 정정 포함. rebase/force/reset 없음 |
| 지시 근거 | 이 기준의 `docs/engine/orders/WORK_BOARD.md` 및 `FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` §4.1 전체 확인. 신규 두 GDScript 경로에 기존 파일/담당 충돌 없음 |
| 원본 | **이 worktree의 최신 game.html**. SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; R/game.html은 원본 입력으로 사용하지 않음 |
| 신규 모듈 | `godot/port_modules/potion_recovery_source/producer.gd` 및 import가 발급한 자기 `.gd.uid` |
| 신규 테스트 | `godot/tests/test_p4001a_potion_recovery_source.gd` 및 import가 발급한 자기 `.gd.uid` |
| 신규 docs | 이 보고서. 구현 상태·원본 수치·검수 결과 기록. 후속 사용자 명시 지시로 CHANGELOG_SYNC.md 맨 위에 QS-01 절만 추가. 기존 추적 문서/설계 docs/작업판은 수정하지 않음 |
| 기존 제품/공용 | **변경 0줄**. main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state 및 기존 helper, project.godot, game.html·index.html 보존. 시작 시 기록한 11개 파일 SHA-256 대조 모두 일치, 전체 tracked 수정 목록도 비어 있음 |
| 보호 | `docs/2_3`·Q/E·세이브 형식은 보호. 수동 포션/qsAuto UI/직렬화/자동 사용 caller 추가 없음 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/qs-01/` |

## 구현 계약과 최신 원본 행

| API / 새 코드 위치 | 원본 `game.html` 행 | 그대로 이식한 내용 |
|---|---|---|
| `hp_definition()` / producer:20 | 27677~27679 | hp의 7필드: name 악의구슬 추출, emoji 👿, col #33cc66, colG #66ff99, base100, per20, desc `악의구슬을 소모해 지옥의 힘으로 회복합니다 (+100 HP)`. 매 호출 독립 Dictionary, 원본 POT/G 전역 생성 아님 |
| `pot_heal(level)` / :24 | 28072 | `lv<=0 ? 100 : lv===1 ? 150 : lv*100`. 0~10은100/150/200/300/400/500/600/700/800/900/1000. 함수에 없는 10단 clamp/반올림 없음; −1→100,11→1100,0.5→50 |
| `enhanced_heal(level,potion_power)` / :32 | 35894,35903 | `~~(potHeal('hp')*(1+potionPower))`. 기존 Formula의 `js_to_int32` 재사용. 100×1.12→112,150×1.12→168, NaN/Infinity→0, signed32 overflow 보존 |
| `auto_cooldown(...)` / :42 | 35898~35902 | 장갑/벨트 각각 unary+ 뒤 falsy0→상한0.2. pRegen은 ToNumber×0.03→상한0.3이고 `or 0` 없음. `max(6,ToInt32(420*(((1-g)-b)-r)))`. 음수 하한 clamp/수동 potionCdRed/300f/autoPotThr 항 추가 없음 |
| read-only helper | 기존 `equipment_affix_reader/producer.gd:350`와 `combat_stat_formula/producer.gd:228` | ToNumber 전용 미바인딩 인스턴스·기존 ToInt32 사용. helper 변경0. 작은 local Math.min wrapper는 NaN 전파 보존 |

| 지원 경계 | 실제 동작 |
|---|---|
| level/power | safe native int(±9007199254740991 이내)/float. NaN/Infinity도 JS Number 의미대로 계산. bool/String/null/StringName/Array/Dictionary/Object/큰 native int 등은 NOT_READY |
| 장비/pRegen | present flag와 null/bool/지원 number/String. absent는 undefined 숫자 소비(NaN), 장비만 `or 0`; pRegen absent→최종6. present=false의 raw carrier는 미접근 |
| 미지원 입력 | `{status:NOT_READY,reason,raw}`이며 `value` 키 없음. 원참조·원타입 보존, 복사·변경·숫자 fallback 없음 |
| 성공 | `{status:READY,value}`. 호출 간 계산 결과나 원본 level을 캐시하지 않음 |
| 범위 밖 | object getter/prototype·세이브 복원 coercion 전체·자동 사용 상태/clock/트리거/최대HP clamp·효과/오디오. 부분 scalar 계산 지원을 전체 JS realm 동등성으로 확대하지 않음 |

## 실행 환경·명령

Godot 실행은 아래 **원본 실행파일만** 사용했다. 버전 출력은 `4.7.2.stable.official.ed1daf0bf`다. 다른 Godot 사본/엔진 교체/서버 시작은 없다.

각 실행 전에 자기 worktree의 `godot/override.cfg`에 다음을 넣고, subprocess의 `finally`에서 빈 파일로 되돌렸다. 실행 후 0byte 확인. 제품 project.godot 수정과 override 커밋은 없다. 신규 테스트도 effective ProjectSettings 두 값과 `OS.get_user_data_dir()`의 최종 폴더명을 단정한다. 계획 문서의 옛 격리명 대신 **최신 배정의 이름**을 썼다.

```ini
[application]
config/use_custom_user_dir=true
config/custom_user_dir_name="EXODUSER-qs-01-Isolated-20261020"
```

```sh
GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot
PROJECT=/Users/fordeargamers/exoduser-wt/qs-01/godot
"$GODOT_BIN" --headless --path "$PROJECT" --script res://tests/test_p4001a_potion_recovery_source.gd
"$GODOT_BIN" --headless --path "$PROJECT" --import
"$GODOT_BIN" --headless --path "$PROJECT" --script res://tests/test_contracts.gd
"$GODOT_BIN" --headless --path "$PROJECT" --script res://tests/test_native_resource_regeneration_binding.gd
```

각 배열 인수의 실제 명령은 원로그의 `*.command.json`에 보존했다. import와 테스트는 순차 실행했으며, import는 **81.757초·exit0·stderr0**. 자기 worktree의 import 캐시/메타데이터와 신규 스크립트 UID를 생성했다. import 전후 기존 tracked 변경0 및 Godot 전역 editor_settings-4.7.tres의 SHA-256 동일을 확인했다.

## 최초 실행 결과 — ad6ac68a2 기준 이력

| 검증 | 실제 결과 | 원로그 이름 |
|---|---|---|
| 신규 QS-01 | **318단정 / 0실패**, exit0, 0.294초, stderr0. definition10/heal81/cooldown54/unsupported156/repeatability15와 격리·scene노드 불변2 | `new-01.stdout.log`, `.stderr.log`, `.result.json` |
| 원본 식 Node 대조 | Node24.15.0. 최신 원본 선언을 메모리로 발췌: 회복0~10 및 CD **18입력 / 0불일치**. 새 모듈의 실행 PASS와 별개인 원본 기대값 근거 | `source-oracle.json`(원본SHA·행·발췌 포함) |
| 필수 회귀 `test_contracts` | **5그룹 / 0실패 단정**, exit0, 4.276초, stderr0. map/charge/projectile/pause_capture/damage 전체, only=[] | `contracts-01.stdout.log`, `.stderr.log`, `.result.json` |
| 관련 회귀 자원 회복 바인딩 | **7그룹·172단정 / 0실패**, exit0, 20.445초. 생략/선택그룹 제한 없음 | `regen-01.stdout.log`, `.stderr.log`, `.result.json` |
| 회귀 경고 | 자원 회복 테스트에 Camera2D가 physics interpolation 때문에 physics process로 재지정되는 **WARNING 1건**. stderr469byte, ERROR/스크립트오류0. 경고를 숨기거나 기존 테스트/제품 수정하지 않음 | `regen-01.stderr.log` |
| 범위·원본 보존 | 기준11파일 hash 일치, 기존 tracked 변경0, override0byte, 기존 helper/공용6파일 변경0 | `baseline.json`, `after-import.json`, `scope-verification.json` |
| docs 검색 | 구현 후 docs 전체 keyword 검색 **68 matching lines / 22 paths**(본 보고서 작성 전 snapshot). 2_8 설계·추적문서 포함. 원본 게임 수치 변경0; 이번 구현/검수 상태는 이 신규 보고서가 추가 | `docs-keyword-scan.log` |

신규 테스트의 주요 결과는 다음과 같다. 모든 숫자는 실제 엔진/원본 대조 결과이며 수계산으로 기대값을 조정하지 않았다.

| 입력 | 자동 CD(f) |
|---|---|
| 장비 absent, pRegen0 | 420 |
| 장갑0.8/벨트0.9/pRegen99(각 상한 소비) | 126 |
| 장갑 String0.10/벨트 String0.20/pRegen5 | 230 |
| 장갑/벨트 junk, pRegen0 | 420 |
| 장갑−0.1/벨트0/pRegen0 | 462 |
| 장갑−6000000/벨트0/pRegen0 | 6(32bit wrap 후최소) |
| pRegen NaN/absent/junk | 각각6 |
| null/false 장비, pRegen null | 420 |
| true/false 장비, pRegen false | 336 |
| +Infinity 장비2개/pRegen0 | 252 |
| 장갑−Infinity/pRegen0 | 6 |
| 장갑0x1/벨트1e−1/pRegen String5 | 231 |
| pRegen−5 | 482 |

신규 테스트는 Main을 부팅하지 않았다. 관련 회귀는 기존 Player/World fixture와 source-clock 바인딩 범위를 실행하며, 결과 자체도 `actual_main_authority=false`다. 이 결과를 자연 피격→자동 회복·실화면·실세이브·PC 실행 인수로 승격하지 않는다.

## 제출·남은 것

- 최초 커밋 시도는 docs-sync-check의 “progress log is missing”로 거부됐다. 당시 원문·SHA·BLOCKED 기록은 보존한다.
- 후속 사용자 지시에서 `docs/CHANGELOG_SYNC.md` 기록이 작업 범위에 포함됨을 명시했다. 지정 명령 `node tools/docs-sync-check.mjs --staged`를 직접 실행해 같은 요구만 확인하고, 최상단에 `## 2026-10-20 QS-01 …` 절과 지정 표를 추가했다. 기존 내용은 바이트 단위 suffix 동일로 검증했다.
- `ALLOW_MISSING_DOCS`, `--no-verify` 등 우회는 사용하지 않는다. 변경로그/보고서를 함께 stage해 정상 검사·commit·자기 branch push 절차를 진행한다. 실제 구현 SHA는 정상 커밋 후 아래 영수증에 기록한다.
- 최종 branch SHA·원격 대조는 원로그 폴더 `DONE.txt`에 기록한다. 과거 BLOCKED 상태를 소급 삭제하지 않는다. upstream main push/병합, force/rebase/reset은 없다. 자기 branch로 origin/main을 merge한 것은 사용자 최신 지시에 따른 정상 fast-forward다.

남은 것은 QS-02 자동 전이와 이후 State/HP authority·벨트 피해 소비·실제 후반 update 연결·효과·대장간이다. **이번 단위는 전역 POT_LV나 autoPotCd를 생성하지 않으며 자동 물약 전체 구현 완료가 아니다.** 기존 제품·테스트를 변경하지 않는 배정에 따라 다른 담당 소유 파일 수정은 없다.


## 최신 main 재검수 — 19a713578 기준

기준을 섞어 PASS를 합산하지 않는다. 위 최초 실행 기록은 보존하며 아래는 merge 후 별도 실행이다. 자기 신규 모듈의 source SHA 주석만 최신 기준으로 갱신했고 계산식·기존 제품·기존 테스트는 수정하지 않았다. merge 직전 staged/WORK patch를 원로그 폴더에 보존했다.

| 항목 | 실제 결과 | 원로그 |
|---|---|---|
| 동기화 | `origin/main=19a713578e478fce5e4e7231140c6ed9f8883e98` → 자기 브랜치 fast-forward, exit0. 신규 staged 5경로 보존. upstream main을 수정한 merge 아님 | `pre-main-sync-staged.patch`, `pre-main-sync-work.patch`, `main-sync.*` |
| 증분 import | 원본 Godot 4.7.2, exit0, 5.363초, stderr0. override 실행 후0byte | `import-02.*` |
| QS-01 재실행 | **318단정·0실패**, exit0, 0.295초, stderr0 | `new-02.*` |
| contracts 재실행 | **5그룹·0실패**, exit0, 3.022초, stderr0 | `contracts-02.*` |
| 자원 회복 재실행 | **7그룹·171단정·0실패**, exit0, 16.447초. Camera2D WARNING1, ERROR0 | `regen-02.*` |
| 단정수 이력 | 최초172/0과 이번171/0을 각각 기록. natural_modes_dome은 실제 commit 배열을 순회하며 검사(:250~260); 해당 구간의 실제 단정은75/0→74/0. 고정172를 얻기 위한 반복 실행/기대 완화 없음 | 최초/최신 `regen-*.stdout.log` |
| 실제 Main 추가 probe 첫 실행 | **8단정 중1실패**, exit1. 8프레임 뒤 G49를 부팅G48로 비교한 단정 실패. 지역 `[23,60,53,32]`, 합168, 현재지역3, HUD `0 / 32`는 관측 일치. actor 강제쓰기0. 이 실행 전체 PASS 아님 | `main-g-region-hud-probe.gd`, `main-probe-01.*` |
| 키 관측 시점 추가 probe | **3단정 중2실패**, exit1. 즉시 G48의 key 배열 정렬 순서를 비교한 검사와, 후행 추가키를 `_intro`로 예상한 검사가 실패. 실제 후행 추가키는 `_dmgPeakShow`. 제품/기존 테스트를 변경하지 않음 | `main-key-phase-probe.gd`, `main-key-phase-02.*` |
| 키 집합 진단 | 진단 전용 별도 실행(exit0), **기존 suite PASS가 아님**. `_ready` 직후 G48, boot40+region7+`_totalSpawned`와 누락0/추가0. 정렬 배열의 순서 비교가 키 집합 검사와 달랐음을 확인. 8프레임 뒤 추가키는 `_dmgPeakShow` 1개(G49); State :348의 표시값 초기화 writer 존재. 최초 실패/잘못된 `_intro` 추정은 보존 | `main-key-diagnostic.gd`, `main-keys-diagnostic-03.*` |
| 최신 G 계약 | starter checkpoint는 원본40+지역7+소환굴1=**48키**. `_totalSpawned` 원본30625. 자연 프레임이 진행한 뒤의 동적 표시키와 구분 | 최신 `test_native_main_source_starter_state.gd:10~18,98~103` |

### 기존 G·지역·HUD suite 실행 제약 — 승인 전 이력

다음 기존 suite는 각각 다른 격리명을 코드에서 강제한다. 최신 QS-01 배정은 Main 테스트에 `EXODUSER-qs-01-Isolated-20261020`을 지정했으므로, 이 값으로 실행하면 starter는 exit2, HUD는 전부 SKIP, 지역 actual은 isolation 단정 실패가 된다. 이를 PASS로 보고하지 않기 위해, **기존 suite를 수정하거나 격리 검사를 우회하지 않았고 실제 실행도 아직 하지 않았다**. 당시 각 suite의 기존 격리명 사용 허용을 비동기 질문으로 요청했다. 이후 명시 승인 후 실행한 결과는 아래 추가 검수 절을 따른다. 위 별도 Main probe는 기존 suite 대체가 아니다.

| 기존 파일 | 코드가 강제하는 격리명 | 상태 |
|---|---|---|
| `test_native_main_source_starter_state.gd:21,29` | `EXODUSER-MainSourceStarter-Isolated-20261014` | 승인 전 미실행(후속 실행은 아래 참조) |
| `test_p3003_regions.gd:3,63` | `EXODUSER-P3003-Isolated-20261020` | 승인 전 미실행(후속 실행은 아래 참조). core fixture의 `[8,15,15,15]`는 실제 맵의 `[23,60,53,32]`로 교체하지 않음 |
| `test_p2002a_hud.gd:8,25~32` | `EXODUSER-P2002A-Isolated-20261020` | 승인 전 미실행(후속 실행은 아래 참조) |

변경로그 기록은 이후 사용자 명시 지시로 승인됐다. 이 세 기존 suite도 이후 사용자 명시 승인으로 파일 상수에 맞는 격리명에서 실행했다. 이 절은 승인 전 상황이며, 당시 미실행을 소급 성공으로 표시하지 않는다.


## 최종 통합 기준 — 9528ea35b

후속 커밋 지시 시작 시 fetch한 `origin/main=9528ea35b429498fcf42fe3723008219ed0ed7e1`(P2-008a 포함)을 먼저 자기 브랜치에 fast-forward merge했다. source SHA 주석만 갱신했고 원본 game.html SHA-256/행과 계산식은 변하지 않았다. 최초 ad6·중간19a 실행은 위 이력으로 보존한다.

| 실제 실행 | 결과 | 로그 |
|---|---|---|
| import | exit0·5.824초·stderr0 | `import-03.*`, `final-main-sync.*` |
| QS-01 | 318단정·0실패, exit0·0.441초·stderr0 | `new-03.*` |
| contracts | 5그룹·0실패, exit0·4.127초·stderr0 | `contracts-03.*` |
| 자원 회복 | 7그룹·173단정·0실패, exit0·19.605초, Camera2D WARNING1·ERROR0 | `regen-03.*` |
| 단정수 | 자원회복의 actual commit 배열 순회 단정이 실행마다 달라172/171/173을 각 원로그로 보존. 최종 173/0을 과거 수치로 바꾸거나 합산하지 않음 | `regen-01/02/03.*` |
| 범위 | 최종 main 대비 기존 제품11경로 hash 보존, 공용6·helper·기존 테스트 수정0. 새 모듈/테스트+UID2개·이 보고서·승인된 변경로그만 commit 대상. override0byte | `baseline-final-main.json`, 최종 scope 영수증 |
| docs 검색 | 최종 코드 작성 후 docs 전체 keyword 검색 로그 보존. 원본 수치 변경0; 새 구현 상태를 보고서/변경로그로 동기화 | `docs-keyword-final-scan.log` |

해당 체크포인트 당시 기존 starter/지역/HUD 3suite는 미실행이었다. 19a 기준 별도 Main 관측값·probe 실패를 9528 기준 기존 suite 통과로 승격하지 않는다. 이 보고서는 QS-01 독립 계산 모듈의 검수/제출 기록이다.


## 정상 구현 체크포인트 영수증

| 항목 | 확정 결과 |
|---|---|
| 구현 SHA | `2da719dc603c3a2c57032357ef82dae474af6a3b` |
| parent / 최종 기준 main | `9528ea35b429498fcf42fe3723008219ed0ed7e1` |
| 정상 훅 | 변경로그 추가 전 직접 검사 exit1 요구 원문 보존 → 승인된 prepend 후 직접 검사 exit0 → 일반 `git commit` exit0. 다른 문서 추가 요구 없음. 우회0 |
| 실제 범위 | 신규 모듈·신규 테스트·자기UID2개·본 보고서와 CHANGELOG_SYNC의 신규11줄. 기존 변경로그 삭제0·기존 제품/공용6/기존 테스트 변경0 |
| 최종 검수 수치 | QS-01 318/0, contracts5그룹/0, 자원회복173/0. 전부 원앱4.7.2·격리실행. Camera2D WARNING1 보존 |
| 원격 확인 | 이 SHA 기록용 후속 doc-only commit까지 정상 push한 최종 branch SHA/ref 대조는 Git 밖 `DONE.txt`에 기록. report의 구현 SHA와 최종 문서 커밋 SHA는 구분 |
| 남은 검증 | 당시 G/지역/HUD 기존3suite는 미실행(후속 승인 실행 결과는 아래 참조). 이전 별도probe 실패·진단 보존. 자동 사용/runtime·실플레이 인수 미완 |


## 격리명 예외 승인 후 기존 회귀 3종 — 최종 추가 검수

사용자 후속 지시가 두 요청을 모두 명시 승인했다. **새 테스트에만 작업용 격리명**, 기존 회귀에는 각 파일의 `USERDIR`/`ISOLATED_DIRECTORY`를 사용한다는 `MAC_ORDERS_20261020.md:19~26` 규칙도 확인했다. 테스트 파일·제품 파일·훅을 수정하지 않고 각 실행 직전에 `override.cfg`의 격리 이름을 바꿨으며, `finally`에서 매번 비웠다. 실제 저장 폴더 `EXODUSER-Godot-Native-First`는 사용하지 않았다.

기준 main은 fetch 결과 변동 없는 `9528ea35b429498fcf42fe3723008219ed0ed7e1`, 실제 테스트 HEAD는 `e38c083cd64a3f8d830d6579f5a7d700b083a7c2`다. 코드는 그대로이며 이후 변경은 본 보고서·변경로그뿐이다. 원본 Godot `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`을 사용했다.

| 기존 suite / 실제 격리 이름 | 실제 결과 | 시간·로그 |
|---|---|---|
| `test_native_main_source_starter_state.gd` / `EXODUSER-MainSourceStarter-Isolated-20261014` | **5그룹·148단정·0실패**, exit0. source boot G40와 current G40+지역7+소환굴1 정확 키 집합 계약 통과 | 81.503초 / `starter-approved-01.*` |
| `test_p3003_regions.gd` / `EXODUSER-P3003-Isolated-20261020` | **43단정·0실패**, exit0. core/display/actual 전체. actual 지역 total `[23,60,53,32]`, current3, 4지역 same-G 상태 확인 | 15.018초 / `regions-approved-01.*` |
| `test_p2002a_hud.gd` / `EXODUSER-P2002A-Isolated-20261020` | **2그룹·36단정·0실패·SKIP0**, exit0. initial kill_text=`0 / 32`, 처치/레벨업 갱신 계약 통과 | 16.126초 / `hud-approved-01.*` |
| 진단/한계 | 각 stderr에 Camera2D physics interpolation WARNING1(합3), **ERROR/스크립트오류0**. HUD 기존 fixture는 `forced_actor_fields=2`이며 자연 입력/실플레이 인수 아님 | 원 stderr508/367/450byte 각각 보존 |
| 무변경 | 위3개 기존 테스트의 실행 전후 SHA-256 동일. 제품·공용6파일도 기존 baseline과 동일, override0byte | `approved-suite-before.json`, `approved-suite-summary.json`, 최종 scope 영수증 |

실제 명령은 공통 `--headless --path /Users/fordeargamers/exoduser-wt/qs-01/godot --script` 뒤 다음 각 경로를 붙였다. `.command.json`에는 전체 argv와 사용한 격리명을 함께 기록했다.

```text
res://tests/test_native_main_source_starter_state.gd
res://tests/test_p3003_regions.gd
res://tests/test_p2002a_hud.gd
```

이 추가 실행은 실제로 기존 suite를 실행한 증거다. 앞선 별도 Main probe의8단정1실패·키시점 probe3단정2실패·진단-only 실행은 그대로 보존하며 합산한 단일 PASS로 바꾸지 않는다. 지역 fixture `[8,15,15,15]`도 변경하지 않았다. 신규318/0·contracts5그룹/0·자원회복173/0은 앞선 동일 코드의 실행이며 이번 doc-only 변경을 이유로 반복하지 않았다.

추가 docs 동기화는 CHANGELOG_SYNC.md 맨 위의 새 승인 후 검수 절로 기록했다. 기존 전체 내용은 byte suffix 동일, 훅 우회0. 기존 미실행으로 남았던 회귀3종은 이제 실행 완료이며, 남은 것은 QS-02 이후 런타임 자동 사용·효과·대장간·실플레이 인수다. 구현 SHA `2da719dc603c3a2c57032357ef82dae474af6a3b`는 변하지 않는다. 추가 문서 제출 SHA/ref 대조는 갱신된 `DONE.txt`에 기록한다.
