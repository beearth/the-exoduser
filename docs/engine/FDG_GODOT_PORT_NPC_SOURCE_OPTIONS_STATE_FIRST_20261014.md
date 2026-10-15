## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# Source OPT state first — 2026-10-14

| 항목 | 현재 사실 |
|---|---|
| Task | CODEX7-GODOT-QUESTNPC-SOURCE-OPTIONS-STATE-FIRST-20261014 |
| 결과 | SOURCE PARTIAL: fresh OPT initializer + actual reference/current reader 구현. 새 headless first 4 cases PASS / FAIL 0 / exit 0 |
| Owned producer | `godot/port_modules/npc_interaction/source_options_state.gd` |
| Owned test/caller | `godot/port_modules/npc_interaction/tests/test_source_options_state_first.gd` |
| source | R `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html` L6667의 fresh `let OPT={...}` |
| 새 restore 접점 source | L49666/L49758 `if(data.opt){for(const k in data.opt)OPT[k]=data.opt[k]}`. 실제 preset/startup 전체 restore는 생산·실행하지 않음 |
| HEAD 표본 | 시작·실행 전·실행 후 `4bfbbd595c1d04e0d04dfe73c529f72c6ddf3518`; 최종 hunk 수집 시 중앙 진행으로 `7432c0912ccafae79305e16d66449e4565a1fd71`. 후자의 HEAD로 tests를 재실행하지 않음. 실행 중 연속 HEAD 감사 아님 |
| existing helper 탐색 | options/settings/config-session 관련 module/doc filename와 options getter/reader 공개 signature 검색에서 같은 initializer/current holder API를 찾지 못함. 실제 Main publisher는 ENGINE 소유 |

## 원 fresh OPT 35 fields

아래 값은 **원 initializer의 raw 값**이다. UI 정책·단위·범위·FPS 운영 정책을 새로 정하지 않는다. 모든 필드는 source `OPT.<id>` → 새 holder의 실제 Dictionary 동일 id에 들어간다. `parts`만 caller가 제공하는 원 `IS_ELECTRON` bool로 분기한다. OS를 검사하지 않으며 context가 없으면 초기화하지 않는다.

| id | source raw 값 | 타입 / 분기 |
|---|---|---|
| shake | 80 | number |
| hitStop | 0 | number |
| parts | `IS_ELECTRON ? 100 : 80` | number; 명시 bool context 필요 |
| sfxVol | 60 | number |
| bgmVol | 60 | number |
| diff | 5 | number; signed 난이도 계산은 BALANCE 소유 |
| minPickRar | 0 | number |
| minPickLvTier | 0 | number |
| fpsCap | 0 | number; port 240으로 대체하지 않음. FPS 적용 없음 |
| petAuto | true | boolean |
| bossDebug | false | boolean |
| bloom | true | boolean |
| trail | true | boolean |
| slash | true | boolean |
| postfx | true | boolean |
| deathFx | true | boolean |
| lighting | true | boolean |
| torch | true | boolean |
| ambPart | false | boolean |
| fog | true | boolean |
| bossFog | true | boolean |
| grain | true | boolean |
| autoPotThr | 0.99 | number |
| cursor | 0 | number |
| cursorSize | 50 | number |
| quality | high | String |
| resScale | 100 | number |
| ssaa | 1 | number |
| outline | true | boolean |
| bgmTrack | auto | String |
| lang | ko | String |
| crAutoFuse | -1 | number |
| crAutoEnh | -1 | number |
| showFps | false | boolean |
| atmos | 2 | number |

Godot에서는 정수 literal은 int, 0.99는 float이지만 원 JS initializer와 같은 수치를 유지한다. 반올림하거나 clamp하지 않는다. 새 instance마다 독립된 실제 mutable Dictionary를 만든다. getter는 복사본을 반환하지 않는다. source snippet 직후 `rz()` 및 canvas/renderer/OS 처리는 연결하지 않는다.

## 정확한 공유 public API

| API | 계약 |
|---|---|
| `new()` | OPT 미준비. constructor만으로 source default를 만들지 않음 |
| `initialize_source_boot(is_electron:Variant)->bool` | 실제 bool일 때만 source35 fields의 fresh 실체 생성, phase=`source_boot`. missing/non-bool이면 false. own OPT 또는 유효 current reader가 이미 있으면 덮어쓰지 않음 |
| `read_current_options()->Variant` | actual own/current provider Dictionary의 **동일 참조**를 매번 반환. actual OPT 부재/비Dictionary/source35 fields 부족이면 null, last status는 NOT_READY. 이전 boot 값으로 fallback하지 않음 |
| `current_reader_callable()->Callable` | `Callable(self,'read_current_options')`. BALANCE `configure_current_opt_reader(reader)`의 `Callable()->Variant(actual OPT Dictionary)` 계약에 적합 |
| `bind_current_options_reader(reader:Callable,phase:String)->bool` | 유효 reader와 세 가지 정확한 phase만 수락. owned map을 fallback으로 유지하지 않음. 연결 bool은 current OPT READY가 아님; 최초 read 전까지 NOT_READY |
| `set_current_phase(phase:String)->bool` | actual OPT 준비 시에만 caller가 current_pre_restore/current_live를 명시. restore/저장/Main publish를 실행하지 않음. 동일 OPT 참조 유지 |
| `get_last_status()->Dictionary` | 마지막 read/init 판정의 deep copy. current reader를 다시 호출하지 않음 |

| phase / status | 의미 |
|---|---|
| source_boot | 이 source initializer의 fresh 값. Main binding/production 완료가 아님 |
| current_pre_restore | caller가 restore 전으로 표시한 actual OPT. 로드된 값과 구분 |
| current_live | caller가 live로 표시한 actual current reference. Main publication 증거가 아님 |
| READY | actual Dictionary에 source35 keys가 존재한다는 adapter 판정. 전체 source/HP/renderer/설정 복원 완료가 아님 |
| READY metadata | phase, origin=`owned_source_initializer`/`injected_current_reader`, source_fields=35, current_fields=실제 key 수, phase_authority=`caller_reported_not_Main_publication` |
| NOT_READY 이유 | actual_OPT_missing / actual_OPT_not_dictionary / source_OPT_fields_missing / source_IS_ELECTRON_missing_or_not_bool / current_reader_not_yet_read |
| 부족 field 판정 | current getter의 adapter readiness. missing_fields를 표시하고 null 반환. 원 restore에 key를 채우는 새 정책이 아님 |

actual current field 값의 타입 변환·signed 계산·clamp·default 보충을 하지 않는다. 예를 들어 diff=-12.5는 그대로 반환한다. 원 in-place copy는 추가 key도 복사하므로 그 raw key를 삭제하지 않지만 source initializer field로 주장하지 않는다. BINDS/BINDS2는 별도 holder의 참조 경계를 유지하며 이 모듈은 읽거나 쓰지 않는다. lang raw 값만 반환하고 localization provider/key label을 복제하지 않는다.

caller는 이 Options instance와 주입 Callable의 owner를 강하게 참조해야 한다. Callable은 RefCounted owner를 유지하지 않는다. owner가 사라지면 getter는 null/NOT_READY가 된다. actual map을 참조하는 다른 caller의 복사본이나 이전 holder를 이 모듈이 수정하지 않는다.

## ENGINE/BALANCE 연결 예시

```gdscript
# is_electron은 원 context에서 caller가 제공. 이 모듈에 OS 판정을 추가하지 않음.
var options = SourceOptions.new()
if options.initialize_source_boot(is_electron):
    options.set_current_phase("current_pre_restore")
    var actual_opt: Dictionary = options.read_current_options()
    # ENGINE 기존 restore가 동일 actual_opt를 조작하는 접점. 여기서는 restore 미구현.
    # ENGINE이 실제 복원/boot 순서를 마친 뒤에 phase를 표시.
    # options.set_current_phase("current_live")
    # signed_provider.configure_current_opt_reader(options.current_reader_callable())
```

별도 actual Main holder를 사용하면 `bind_current_options_reader(actual_holder_callable,"current_live")`로 연결한다. 원 OPT가 없으면 주입을 위해 fake Dictionary를 만들지 않는다. BALANCE 공개 API 문서의 reader 계약만 확인했다. BALANCE/ROOT HP 함수를 복제·호출·재검사하지 않았다. Main/HP/bundle10 binding, shared canonical sync/checkpoint는 ENGINE의 미실시 범위다.

## 새 affected first tests

| case | 실제 검사 | 결과 |
|---|---|---|
| source_boot_initializer | 새로 읽은 원 JS literal expression을 IS_ELECTRON=false/true로 격리 평가한 input35 값에 전체 field 대조. parts80/100, diff5, fpsCap0 및 독립 map identity 확인 | FIRST PASS |
| current_pre_restore_reference | source fresh→caller pre_restore marker→동일 actual Dictionary에 원 OPT copy의 **한 식**을 새 caller가 실행. diff=-12.5, lang=en, fixture_extra=null raw 유지. reinit 거부. 동일 ref의 live marker | FIRST PASS |
| late_actual_current_reader | 새 initializer의 actual maps를 공급하는 실제 owned fixture Node getter→injected reader. owner map 교체 시 diff6→-4의 최신 ref 획득. owner 해제 뒤 null/NR; boot fallback 없음 | FIRST PASS |
| missing_invalid_OPT | constructor/null platform/미정 phase/actual source map을 clear한35 keys 부족/비Dictionary raw17을 NR 처리. default 보충 없음 | FIRST PASS |

fixture source literal 평가는 원 게임 runtime 전체 실행이 아니다. pre_restore caller는 새 해당 OPT 식만 실행했다. production preset/startup restore 호출0, 전체 options restore/writer/UI/OS/FPS/windowstate 동작0, actualMain publisher0이다. Headless Godot4.7.2 run1, first4PASS/FAIL0/exit0, repair0. 이전 성공군·ROOT HP6-87·PNG/sample/source proof 재검증/재실행0. 현재 4개 성공 case도 재실행하지 않았다. nativeMain/full source/publicpixels/청취/min240은 미완이다.

각 case input은 runtime 전에 독립 byte backup을 만들고 byte equality/SHA를 보존했다. input/output-first/runtime-first/ledger-first 덮어쓰기/재생성0. script FileAccess는 own fixture 절대 path만 사용한다. 실저장·server/API·인간 UI·OS 상태에 접근하지 않았다. Godot 내부 default user directory startup은 감사하지 않았다.

W/R 허용 docs 전체를 OPT.diff/fpsCap/OPT initializer/current_pre_restore 및 새 API 이름으로 metadata 검색하고 결과를 own evidence에 보존했다. 첫 대형 metadata 출력은 truncated였고 후속 검색은 완전 출력이다. 원3.3 docs의 initializer targeted search는 일치0이다. task가 기존/shared/frozen docs 쓰기를 금지하므로 이 새 정본에 exact source35 값과 API/미연결 gap을 기록했다. 보호2_3·held/marketing 지정 files는 변경하지 않았다. Git/index/commit0. test는 `.gitignore:5:test_*`로 ignored이므로 중앙 ENGINE의 명시 포함이 필요하다.

Evidence root: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/npc_interaction/source_options_state/`. before-state.json, input-backup-manifest.json, case별 output-first.json, fixture/runtime-first.log, fixture/ledger-first.json, owned-hunk.patch, owned-receipt.json을 인계한다. 새2 `.gd`와 이 문서만 final SHA1회. 이전 source/assets/proof 재해시0.
