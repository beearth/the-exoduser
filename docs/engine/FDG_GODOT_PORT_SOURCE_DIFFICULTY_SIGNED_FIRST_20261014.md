## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# SOURCE DIFFICULTY SIGNED FIRST — 2026-10-14

작업 `CODEX7-GODOT-BALANCE-SOURCE-DIFFICULTY-SIGNED-FIRST-20261014`. 신규 numeric/nullish signed getter 및 기존 ROOT HP public initial caller의 새 분기 **15 PASS / 0 FAIL**. 실제 NPC current OPT reader/Main binding은 **GATE**. 기존 성공군·ROOT HP87·XP·SourceParams 재실행 0.

## 소유 및 public API

| 파일/API | 계약 |
|---|---|
| `godot/port_modules/kill_reward/source_difficulty_signed.gd` | RefCounted leaf. OPT 생성·저장·복원·cache·clock·input 없음 |
| `configure_current_opt_reader(reader:Callable)->bool` | reader 연결 유효성만 반환. 이 bool을 runtime authority READY로 표시하지 않음 |
| reader 계약 | 호출 때마다 실제 current OPT Dictionary 반환. null/비Dictionary는 authority unavailable. NPC source_options_state의 정확 public reader는 현재 checkout에서 찾지 못함; ENGINE/NPC가 실제 API를 확인해 연결해야 함 |
| `diff_signed()->Dictionary` | READY/value numeric 또는 NOT_READY/value null. ROOT HP PROVIDER_DIFF_SIGNED에 callable로 그대로 전달 |
| `godot/port_modules/kill_reward/tests/test_source_difficulty_signed_first.gd` | 신규 4 case 최초 run 전용. installed Godot headless; shared Player/Main 실행 없음 |

## 원 predicate와 숫자

canonical R `game.html:9567`:
`const _diffSigned=()=>(((typeof OPT!=='undefined'&&OPT.diff!=null)?OPT.diff:5)-5)`.

| 실제 입력/상태 | 원 결과 및 신규 계약 | 적용 |
|---|---|---|
| current OPT.diff=5 | READY 0 | 실제 reader가 반환한 OPT 값에서만 normal signed0을 생성 |
| current OPT.diff=0 | READY -5 | falsy0을 nullish로 취급하지 않음 |
| current OPT.diff=9 | READY 4 | getter는 cache하지 않고 변경된 현재값 재조회 |
| current OPT.diff=15 | READY 10 | 원처럼 clamp/range 제한을 새로 추가하지 않음 |
| 실제 OPT 존재 + diff 누락/null | source fallback5 → READY 0 | 준비된 OPT 자체와 diff 필드 미존재를 분리 |
| reader 미연결 / null / 비Dictionary | NOT_READY, value=null | source typeof OPT undefined 기본값을 미준비 authority의0으로 위장하지 않음 |
| nonnumeric diff | NOT_READY: non_numeric_diff_JS_coercion_not_ported | 원 JS subtraction의 문자열/boolean/object ToNumber 영역을 임의 parser로 대신하지 않음. numeric/nullish 이외 현재 OPT가 필요하면 기존 정확 coercion authority/API를 연결하는 별도 범위 필요 |
| numeric nonfinite | 원 numeric subtraction 값 전달 | 이 leaf에서 임의 finite 보정/0 대체 없음. 소비자의 기존 source nonfinite gate가 책임짐. 이번 신규 case에서는 nonfinite 실행하지 않음 |

Main의 NORMAL 문구, constructor diff0, unbound neutral0을 getter authority로 사용하지 않는다. 기존 OPT initializer/catalog/restore를 복제하지 않는다. G/P/stat/HP 공식을 새로 작성하지 않는다.

## actual 기존 caller의 새 affected branch

실제 기존 `player_health_parameters_source/producer.gd` public `configure(providers,health_sink)`와 `plan_initial()`를 호출했다. new getter를 `diff_signed` provider로 전달했다. 나머지 source readers는 사전에 저장한 독립 P/G/STATS/PASSIVES/INV 입력을 읽고, eq_affix/eq_implicit/lv_b는 **기존 ROOT 실제 helper 객체**의 public API를 사용했다. neutral READY 숫자 stub로 대체하지 않았다.

| 독립 입력 / 관찰 | 값 |
|---|---|
| 새 OPT | diff=7 → signed2 |
| 독립 P | lv7, hp350, mhp350 |
| 독립 G | on=true, stage3 |
| 기타 source fixture | STATS.str3, PASSIVES.pMelee0, INV.equipped 빈 Dictionary. 실제 helper들이 입력에서 어픽스/implicit 없음 및 lv_b를 산출 |
| HP public result | status READY; diff_signed2; diff_base_hp260; stg_hp272 |
| 실행 범위 | plan only. input P 무변경; dispatch_count0; shared actor sink 없음 |

이는 **새 signed getter를 소비한 기존 HP initial API** 증거다. actual Main/NPC OPT 권위, 전체 HP formula/87군, 결정/fortify/bundle10/whole phase, 실제 Player HP 적용을 다시 검증한 것이 아니다.

## 최초 ledger와 정본 sync

| case | PASS | FAIL | 새 검사 |
|---|---:|---:|---|
| current | 4 | 0 | 5/9/0/15 live 변경 및 무clamp |
| fallback | 3 | 0 | 실제 OPT missing/null diff fallback, numeric0 구분 |
| gates | 5 | 0 | unbound/null/Array 및 미이식 raw String/Dictionary diff |
| hp_initial_caller | 3 | 0 | actual existing plan_initial·새diff7 분기·P 무변경/dispatch0 |
| 합계 | **15** | **0** | 모든 최초 run exit0. repair/re-run0 |

설치 runtime `Godot4.7.2.stable.official.ed1daf0bf`. `fixture/<case>/input.json` 및 input-ledger.json을 실행 전에 exclusive 저장하고 output.json/first.log/runtime.json/result-ledger.json을 case별 분리한다. IO는 E 절대 경로, user:// IO/사용자 save/앱 입력/server/import 실행 요청0. OS userdata syscall audit는 미검증이며 override 시도0.

E: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/kill_reward/source_difficulty_signed/`.

| 인수 항목 | 실제 기록 |
|---|---|
| 첫 유효 tool | `84aed1` — 관련 docs·parent/HEAD 대상 부재 |
| source/API | `392e49`, `3ad46d`, `b939de`, `76c4a6`, `adffde`의 필요한 선언/호출부만 |
| 구현 | `ab451d`, `07eec4` |
| runtime | `0c5bbb` → `4ce4e2` |
| 시작 parent | `4bfbbd595c1d04e0d04dfe73c529f72c6ddf3518` |
| exactpath/backup | 배정된 code/test/doc working+HEAD absent, ancestor symlink 없음. 기존 bytes 없어 backup 대상 없음. 타인 편집 덮어쓰기0 |
| docs 관련 검색 | 허용 W/R docs 전체 _diffSigned/difficulty_signed/source_difficulty_signed/OPT.diff: W28/R44. 관련 current-value/API/GATE를 이 신규 정본에 기록. 제외 marketing/held/dispatch/receipt 접근0 |
| pins/hunks | 신규 소유 3파일 first SHA와 NEW own-hunk만 E owned-receipt/patch에 저장. 기존 source/helper/proof hash0 |
| Git/checkpoint | stage/commit/index 쓰기0. 코드+신규 SSOT와 ignored test를 중앙 ENGINE checkpoint에 함께 인수해야 함 |

## 정확한 남은 부족

현재 checkout의 production `source_options_state` public current OPT reader를 확인하지 못했다. 기존 ROOT HP helper 내부 `_diff_signed()`는 injected provider를 소비하는 private seam이며 OPT reader가 아니다. 새 getter는 이 부족을0/fakeDict로 채우지 않는다. 실제 reader readiness 계약 확인·Main source authority 연결·actual HP/bundle10 적용 및 shared canonical docs checkpoint는 ENGINE/NPC 소유다. 사람이 승인하지 않은 ENGINE 메시징 없이 Codex7 회신으로 인계한다.

보호 docs2_3/Q-only blackBean magic·E불가·attack ticket 금지 유지. ROOT/BUILD 예약 Player/World/HP/DEF/speed/shieldpoise/grit/SP/AP/bootstrap/starter/crystal/fusion 관련 코드 수정0.
