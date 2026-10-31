# sk-s03 — 합체·흡수 읽기 전용 판정 구현 보고

**SK-S03 구현·검수 완료 / 총괄 검수 대기.** 명시적으로 전달받은 P snapshot에 대한 합체 가능 여부·후보·흡수·성급·숙련도 조회만 제공한다. 실제 P/G owner 연결·학습/합체 실행·SP/악의구슬 차감·장착/입력·UI·저장·Q/E writer는 미구현이다.

## 기준·의존·소유

| 항목 | 실제 확인 |
|---|---|
| 작업 / 브랜치 / WT | `sk-s03` / `codex/sk-s03-20261020` / `~/exoduser-wt/sk-s03` |
| 최신 main | 원격 main ref를 명시해 정상 fetch하고 ls-remote로 확인: `284d7faf49295b2f5061937a47ce96038032ed3c`. 첫 plain fetch는 기존 fetch 설정상 SK-S02만 갱신해 main ref를 별도로 명시했다. 원본 game.html 65692행 / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 선행 | SK-S02 `d56773aeae823e03692d9a6172cea714dc963998` (`codex/sk-s02-20261020`)가 main에 없어 그 브랜치 끝에서 분기. SK-S01 4b9341fb도 이 부모의 의존. 카탈로그·기존 fusion 공급자 수정0. 총괄은 S01→S02→S03 순서로 인수 |
| 지시서 | 최신 main `FDG_SOURCE_TRACE_SKILLS_20261020.md:177`의 SK-S03. _canFuse 4gate/demo22·선행/숙련/minLv 검사 없음·bladeEcho 흡수 누락·omniBeam 예외를 보존 |
| 작업 환경 | 최초 전체 worktree add가 대형 cinematic/video checkout에서 디스크 부족(쓰기 실패)·exit130. 자기 git 작업 PID35040만 중단했고 Git의 자동 정리 완료를 기다림. 같은 pristine branch를 `worktree add --no-checkout` 뒤 **자기 WT sparse-checkout**으로 AGENTS/game/docs/godot/훅·docs-check만 구성. `read-tree -mu HEAD`는 비어 있는 신규 WT의 index 최초 초기화에만 사용. 기존 WIP·R·타 WT 삭제/정리0, 원본 tracked tree 삭제0 |
| 제품/테스트 소유 | 신규 `godot/port_modules/skill_management_source/fusion_rules.gd`·신규 `godot/tests/test_trace_skills_s03_fusion_rules.gd` 및 각각 엔진 생성 .uid |
| docs 소유 | 이 보고서와 허용 `docs/CHANGELOG_SYNC.md` 최상단 절. 기존 설계/추적 문서·작업판은 타 담당/공용 범위이므로 수정0. 구현 상태를 본 보고서로 인계 |
| 보호 | **native_skill_slots.gd 0줄**, main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state/project.godot·기존 S01/S02·fusion_star_source·기존 테스트 변경0. R branch/HEAD/INDEX/WORK 불변. docs/2_3·Q/E/blackBean·세이브 형식 불변 |

## 원본 → 구현 계약

| 원본 최신 game.html | 구현 / 그대로 보존한 값·순서 |
|---|---|
| 16649 | demo 허용22키·선언 순서. registry32개와 다른 집합 |
| 44487 `_getFuseKey` | `get_fuse_key`: 기존 FUSE_PAIRS 선언순 후보 탐색→완료된 key skip→상위완료 제외→elecRepent만 boneStorm 표시 선행. canFuse와 별개다. dimBlast만 true여도 chargeBoost 후보가 dimBreach인 원 누락도 보존 |
| 44488 `_isFused` | `is_fused`: registry 필터 없이 주어진 _fused[key]의 JS truthiness. unknown 자체 key가 true이면 true 가능 |
| 44490~44494 | `innate_star`: 기존32레시피/13override의 최소(star 또는 멤버수)−1, 하한1/비멤버0. 별도 멤버/성급 authority 생성0 |
| 44496~44501 | `fused_star`: **기존 fusion_star_source/producer.gd의 fuse_star를 그대로 호출**. borrowed P를 반환하는 호출 범위 closure만 제공, 알고리즘 재작성·실제 owner binding0 |
| 44560~44575 | `category_proficiency/skill_proficiency/proficiency_level/proficiency_multiplier/proficiency_cap/proficiency_maxed`: CATPROF_REQ600, SK-S02 cat 조회+meleeAttack/shieldBash=phys. 카테고리 우선·없는 cat만 legacy _skProf fallback. 레벨=JS ToInt32(sec/10), 배율1+lv×.02, cap9999 |
| 44598~44607 | `card_proficiency/card_proficiency_hms/fuse_proficiency/required_proficiency`: 구성 스킬 숙련의 최소값, unknown0; HMS는 ToInt32·JS 나머지 부호 보존. fuseProf는 cardProf 위임, 요구600은 **canFuse에 사용하지 않음** |
| 44608~44617 | `can_fuse`: 레시피 존재→demo허용→미완료→구성 스킬 level>=1 네 gate만. SP·minLv·선행합체·동급성·600초 검사/차감/수정 없음. 알려진 key라도 demo금지면 P 부재를 읽기 전에 false, 완료면 skills 부재를 읽기 전에 false |
| 44618 `_getAbsorbed` | `get_absorbed`: 정적31키 표와 배열순서의 복사. registry32개 중 **bladeEcho는 미등록이므로 []**, 새 흡수 목록을 보완하지 않음. elecRepent의 boneWall 흡수도 원표 유지 |
| 44620~44628 | `get_all_absorbed`: 기존 레시피32키 선언순→완료 그룹→각 흡수 배열순, 최초 등장만 유지. 새 정렬/상위합체 정규화0 |
| 44629~44637 | `is_absorbed`: omniBeam은 elemFuse=true && stormBeam=false이면 false. **stormBurst를 대신 검사하지 않음**. 따라서 elemFuse+stormBurst만 완료해도 get_all_absorbed에는 들어가고 is_absorbed는 false인 비대칭을 유지 |
| 44638~44641 | `fusion_names`: KO/EN 원표와 뒤에서 추가된 bladeEcho를 포함한32쌍. unknown은 원 key fallback. 실제 _L/_T/format/locale 서비스는 비소유이며 번역 완료 주장 없음 |
| 48148~48149 | `display_star`: isDemoTest면 innate, 그 외 max(innate,fused). 실제성급7도 glyph 최대6개, 색 #ffcc00. 0은 빈 text/color null. DOM/그리기·UI 연결0 |

숙련 적립 `_addSkProf/_addSkProfTick/_addCardProfTick/_addFuseProfTick`, 합체 실행 `_execFuse`, 흡수 뒤 슬롯/active 동기화는 구현하지 않았다. 이 단위의 숙련 기능은 조회·계산만이다.

## API·준비도·순수성

| 경계 | native 계약 |
|---|---|
| 호출 형태 | static 조회 함수에 **테스트/호출자가 소유한 명시적 player snapshot** 전달. 실제 State.read_current_p를 자동 호출하거나 readonly snapshot을 실제 권위로 승격하지 않음 |
| 정상 반환 | `READY/value/branch`. 정상 unknown canFuse=false, candidate=null, absorption=[], star/prof=0과 입력 부재 NOT_READY를 구분 |
| 미지원 반환 | `NOT_READY/reason/input`(value 없음). 기존 fuse_star의 결과 packet은 기존 계약 그대로 반환하며 그 NOT_READY는 value:null. 실제 미준비를 false/0으로 대체하지 않음 |
| ID·맵 지원 | String ID, own String-key Dictionary. StringName/숫자/배열·Object ID·JS Object.prototype 속성 key는 NOT_READY. JS prototype/getter/동적 coercion 전체 지원을 주장하지 않음 |
| P/필드 순서 | _isFused 등 P가 필요한 branch의 P 미준비는 NOT_READY. 숙련 함수의 원 if(!P)와 빈/미등록 레시피·후보의 조기반환은0/null 보존. _fused/_catProf/_skProf의 source falsy 값은 원0/빈map 분기로, truthy 비Dictionary는 NOT_READY |
| 숫자 지원 | 실제 읽는 skill level은 finite int/float 또는 null/누락(미학습). bool/문자열/배열/NaN/Infinity는 NOT_READY. 숙련은 source falsy→0 후 finite 숫자 지원. 사용하지 않는 후행 스킬 값은 선행 미학습 gate 뒤 검사하지 않음. 수치 clamp·보정 없음 |
| 데모 | can_fuse의 명시적 demo_mode와 P.isDemoTest는 bool native 지원. 전자는 가능 여부, 후자는 별표 표시 선택이며 서로 대체하지 않음 |
| 소유/변이 | 새 active owner·Node·clock·RNG·FileAccess·InputMap·P/G/INV/세이브·오디오/전투 writer0. 원표/반환 배열·중첩metadata는 깊은 복사, borrowed P 및 nested identity 불변. 기존 fuse_star의 자체 진단 count는 호출한 새 provider 내부에만 귀속 |

## 검증

Godot `4.7.2.stable.official.ed1daf0bf`, `.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. **실행마다** `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 먼저 수행해2이상이면30초씩 대기, 정확 관측은 `process-gate.jsonl`에 있다. 다른 앱/담당 프로세스를 중지하지 않았다.

실제 실행 제품은 **SK-S02 dependency 기반 자기 sparse WT**다. latest-main 전체 제품을 merge/rebase하지 않았다. p2005b/c/d-ice는 이 dependency의 구 하니스 종료 누수/RNG가 SK-S02에서 확인됐고 최신 main QA-002가 이미 수정한 상태라, **최신 main의 해당 기존 테스트를 byte 그대로 Git밖 mainqa- 사본**으로 실행했다. 원 파일/기대값 수정0·파일 USERDIR 상수 그대로 사용. 그 외 기존 테스트는 자기 WT 원본(관련 파일이 main과 동일함을 대조). 이 결과는 latest-main 전체 제품 회귀 PASS가 아니다.

| 검사 | 실제 결과 | 실제 격리 이름 | stderr |
|---|---|---|---|
| `test_trace_skills_s03_fusion_rules.gd` | 15020단정/0실패 / exit0 | `EXODUSER-sk-s03-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_trace_skills_s01_costs.gd` | 2033단정/0실패 / exit0 | `EXODUSER-sk-s01-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_trace_skills_s02_catalog.gd` | 803단정/0실패 / exit0 | `EXODUSER-sk-s02-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_contracts.gd` | 5검사군/0실패 / exit0 | `EXODUSER-sk-s03-Isolated-20261020` | ERROR0 / WARNING0 |
| `test_p2005a_start_skills.gd` | 27단정/0실패 / exit0 | `EXODUSER-P2005A-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005b_giant_slam.gd` | 12단정/0실패 / exit0 | `EXODUSER-P2005B-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005c_spike_holy.gd` | 20단정/0실패 / exit0 | `EXODUSER-P2005C-Isolated-20261020` | ERROR0 / WARNING1 |
| `test_p2005d_regen_wiring.gd` | 10단정/0실패 / exit0 | `EXODUSER-P2005D-Isolated-20261020` | ERROR0 / WARNING1 |
| `mainqa-test_p2005d_ice_orb.gd` | 22단정/0실패 / exit0 | `EXODUSER-P2005D-Isolated-20261020` | ERROR0 / WARNING1 |
| `test_native_main_source_starter_state.gd` | 148단정/0실패 / exit0 | `EXODUSER-MainSourceStarter-Isolated-20261014` | ERROR0 / WARNING1 |
| `test_native_source_player_regeneration_phase.gd` | 88단정/0실패 / exit0 | `EXODUSER-SourceRegenPhase-Isolated-20261014` | ERROR0 / WARNING9 |

- 신규 **15020단정/실패0/skip0, Main0**. 32키 full/demo22, 구성원별 missing/0/.5/−1/1/2, source gate순서, 74개의 완료 상태(단일/누적/omniBeam 예외8조합), StringName·prototype·미지원/미준비·순수성/깊은복사·별표6cap 등을 검증했다. 모든2^32조합이나 자연 플레이 인수는 아니다.
- 최신 원본의 **실제18개 함수 및 필요한 원 선언문만 발췌해 Node VM에서 실행**, 명시된 같은 fixture를 넣었다. **14515행 결과·metadata 전체 불일치0**. scalar 숫자 **4786개는 IEEE754 double little-endian bit까지 완전 일치**. JSON 표시상 2.18과2.1799999999999997이 달랐던7건도 bit 일치 확인, 허용오차/공식변경/반올림 보정0.
- P2005 5파일 합 **91단정/0실패**, contracts5검사군과 별도 단정 단위를 혼합하지 않았다. S01/S02 및 기존 실제 fusion 소비자는 회귀이며 S03의 live owner 연결 증거가 아니다. source-phase의 external/harness 경고와 Camera2D 경고는 그대로 로그에 보존했다.
- 원 자원/`.import` 949파일이 SK-S02 WT와 SHA256 byte 동일한 것을 확인하고 파생 cache만 복사해 사용. 자기 WT import exit0/ERROR0, project.godot·전역 editor 설정 hash 불변. Main 회귀 때만 자기 override.cfg를 해당 원 상수 이름으로 임시 작성, finally에서 원래 **부재**로 복원. 신규/S01/S02 및 contracts harness는 process-local 격리 설정 확인. 사용자 프로필/게임 창 제어0.

## 실패 이력·미확인·인계

| 항목 | 정직한 경계·근거 |
|---|---|
| checkout 실패 | 디스크 부족으로 최초 전체 checkout 미완료·자기 작업 exit130, 자동 정리 후 sparse로 재준비. 다른 사용자/팀 파일 삭제0. 순수 신규 WT의 index 초기화 전 일시적 전체D 표시는 커밋하지 않았고 정상 sparse INDEX/WORK clean 확인 |
| 첫 신규 검사 | 출력14883/0·exit0에도 fixture의 dot 신규키 대입이 StringName 키를 만들어 _test_state_matrix:105에서 value 없는 NR packet 접근 오류 발생. **PASS 제외**. 원 stdout/stderr/meta는 `s03-first-runtime-error.*` 보존. 해당 fixture를 String 인덱스 대입으로 고치고 전체 신규 검사를 재실행. 제품의 StringName 거부를 완화하지 않음 |
| 최초 JSON 대조 | 7개의 소수 JSON 표현 차이를 원문 `oracle-first-json-number-differences.json`에 보존. exact double bits를 추가해 독립 대조했고 수치나 기대값/허용오차를 조정하지 않음 |
| 미구현/미확인 | 실제 current P authority·SP/악의/보유/슬롯 쓰기·합체 실행·K/L UI·입력/피해·세이브·자연 시전·시각/청감·PC/Mac 실플레이 동등성은 별도 후속 단위. 보호 범위와 공용 파일을 변경할 필요는 이번 단위에 없었음 |
| 다음 인수 | S03의 명시적 snapshot 계약을 S04 슬롯 read model/S05 core에서 소비 가능. 실제 owner/State/PC 슬롯 배선은 별도 소유 조정과 배정이 필요하며 이번 작업을 근거로 자동 수정하지 않음 |

코드 작성 뒤 docs 전체 keyword 검색을 수행했다(`docs-keyword-matches.txt`,48일치행). 기존 설계의 선행/동급성·성급·흡수 누락은 선행 추적 X03/04/09 등의 원본 판정을 따랐고 설계/공용 문서 수정0. 현재 부분이식의 API·상수·지원범위는 이 보고서/허용 CHANGELOG 절로 동기화했다.

원로그 `~/exoduser-wt/_out/sk-s03/`: 각 test.out/.err/.engine.log/.meta.json의 실제 argv·UTC·exit·시간·hash, `source-functions.js.txt`·`source-metadata.json`·`compare_oracle.mjs`·`oracle-comparison.json`, cache·latest main 회귀 사본 byte 근거·처음 실패 원문 보존. git 정상 pre-commit·비강제 자기 branch push·원격 ref 검증 후 `DONE.txt`에 branch/SHA/수치 인계. main push/force/reset/`git add -A`·타인 WIP stage·훅 우회 없음.
