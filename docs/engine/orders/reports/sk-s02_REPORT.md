# sk-s02 — 스킬 관리 읽기 전용 카탈로그 구현 보고

**SK-S02 구현 완료 / 총괄 검수 대기. 기능 단정은 통과했으며 dependency 기반 기존 b/c 회귀의 종료 누수 ERROR는 별도 미통과로 보존했다.** 스킬 관리의 원본 정의를 조회하는 독립 모듈이며 실제 학습·강화·합체 생성·슬롯 변경·UI·시전·저장 연결은 수행하지 않았다.

## 기준·재개·소유

| 항목 | 확인 결과 |
|---|---|
| 작업 / 위치 | `sk-s02` / `codex/sk-s02-20261020` / `~/exoduser-wt/sk-s02` |
| 기존 진행분 | 재개 시작 HEAD=`4b9341fb13527c5f49a98500a4e79eb512f6a87f`, tracked INDEX/WORK clean. 신규 catalog.gd/.uid와 ignore된 신규 test를 발견·백업 후 이어서 작업. 중단 전 first parse 실패와 뒤803/0 로그도 원 위치에 보존 |
| 선행 의존 | **SK-S01 `4b9341fb13527c5f49a98500a4e79eb512f6a87f`** (`codex/sk-s01-20261020`) 위에서 분기한 기존 WT 유지. fetch 기준 main에는 아직 이 커밋이 없어 의존을 명시. 기존 SP 비용 모듈 변경0. 총괄은 SK-S01 뒤 본 커밋을 인수해야 함 |
| 원본 행 기준 | 재개 fetch 후 `origin/main=284d7faf49295b2f5061937a47ce96038032ed3c`. 최신 스킬 추적 문서 §4.2의2번을 읽고 원본을 추출. game.html 65692행·SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, dependency WT의 game.html과 byte 동일 |
| 실제 실행 소스 | **자기 WT의 SK-S01 dependency 기반 소스**. 최신 main 전체를 merge/rebase하거나 공용/PC 파일을 복사하지 않음. 최신 main 회귀 통과 주장 아님. 최신 main과 b/c/d-ice 테스트는 QA-002 등 변경으로 다름 |
| 제품 소유 | 신규 `godot/port_modules/skill_management_source/catalog.gd`, 엔진이 생성한 해당 `.uid` |
| 테스트 소유 | 신규 `godot/tests/test_trace_skills_s02_catalog.gd` 및 엔진 생성 `.uid`만. ignore 규칙 때문에 이 정확 경로를 `git add -f --`로 포함하며 ignore/hook 수정 없음 |
| docs 소유 | 이 보고서 및 `docs/CHANGELOG_SYNC.md` 최상단 새 절. 기존 추적/설계 docs·작업판은 공용/타 담당 범위로 수정0. 구현 상태는 본 보고서로 인계 |
| 보호 | main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state/project.godot·**PC 소유 native_skill_slots.gd**·기존 fusion_star_source·기존 테스트 모두0줄. R branch/HEAD/INDEX/WORK 불변. Q/E·blackBean·docs/2_3·세이브 형식 변경0 |

## 원본 데이터·API 계약

| 원본 최신 game.html | 카탈로그 소유 / 개수 |
|---|---|
| 44082~44092 `SKILL_CATS` | 카테고리9개, 원 id·이름/영문·색·순서 |
| 44094~44110 `SKILL_REC_PATH` | 추천15단계, skills 순서·fuse null·pick·설명 보존. 추천을 실행하지 않음 |
| 44111~44116 `SKILL_HIER` | 상위분류4개·cats=null/배열 보존 |
| 44118 `SKILL_ICONS` | 아이콘 정의84키, 숫자1과 문자열 alias 구분. 이미지 로딩/아이콘 renderer는 비소유 |
| 44161~44224 `SKILL_LIST` | 정의55개 전체 필드·순서, hidden/fixed/default/act/ult/noDmg/requires/reqLv 등 **없는 key는 생성하지 않음** |
| 44277~44317 `SKILL_SLOT_DEFS` | 슬롯 정의8개·skills/info 전체 원본 문자열·순서. 실제 입력 매핑/장착 판정/slot writer는 없음 |
| 44324~44357 `_FUSE_GEM_GROUPS` | 메타데이터32개: color/color2/tier/minLv/hidden. 멤버와 명시별 수13키는 기존 readonly 공급자에서 읽음 |
| 44453~44486 `_FUSE_PAIRS` | 레시피32개·멤버순서, 기존 `fusion_star_source.FUSE_PAIRS` 재사용. 별도 멤버 상수/authority를 만들지 않음 |
| 44507~44554 `_SK_MUL` | b/g 계수37개. 실제 `_skMul` 레벨 계산·affix/fuse 배율/피해를 이 모듈에서 적용하지 않음 |

| API | 결과·지원 경계 |
|---|---|
| `read_catalog()` | `READY/source_pin/value`, 위9개 표의 깊은 복사. gem 메타데이터에 기존 공급자의 멤버·명시 star만 조립 |
| `read_skill(id)` | source `_SK_MAP`(:44225~44227)의 마지막 정의 우선 조회. 현55개id는 중복0 |
| `read_slot_definition(id)` / `read_icon_definition(id)` | 슬롯 정의 또는 원 아이콘 alias 값의 복사/스칼라 |
| `read_multiplier_definition(id)` | b/g 메타데이터의 깊은 복사. 실제 캐릭터 level 조회0 |
| `read_fusion_members(id)` / `read_gem_group(id)` | 기존 fusion 공급자의 배열·star 재사용 후 깊은 복사. null star는 **star key 없음**으로 보존. unknown id에 다른 레시피를 대입하지 않음 |
| `read_source_ranges()` | 원본9구역 이름·시작/끝 행의 깊은 복사 |
| 공통 조회 packet | 정상 발견=`READY/found:true/value`; 미등록 String/빈 문자열=`READY/found:false/value:null`. null/bool/숫자/StringName/배열/사전/Vector2는 `NOT_READY/unsupported_id_carrier/input`(value 없음), raw carrier 보존. JS 전체 coercion 동등성은 주장하지 않음 |
| 순수성 | static readonly API, configure·Node·clock·RNG·P/G/INV·FileAccess·저장·입력/오디오·스킬 시전 호출0. 반환 중첩 배열/사전을 변경해도 원표/기존 fusion 상수는 불변 |

metadata cd와 실제 cast cooldown은 구분한다. 예를 들어 maliceHunt의 원 정의 cd300과 voidScarecrow cd600을 그대로 보존했고, cd가 없는 chargeBoost에 기본 cd를 만들지 않았다. stormBeam은 override star4/멤버6을 각각 보존하며 minLv=500(timeStep)을 조회하는 것이 학습/합체 gate를 실행하는 것은 아니다.

## 실제 검증

Godot `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, `4.7.2.stable.official.ed1daf0bf`. **매 실행 전에** 사용자 지정 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 실행하고2이상이면30초씩 대기했다. 횟수/UTC/실행 대상은 `resume/process-gate.jsonl`에 보존했다. 다른 작업/앱은 중지하지 않았다.

| 검사 | 실제 결과 | 격리 이름 | stderr |
|---|---|---|---|
| `test_trace_skills_s02_catalog.gd` | 803단정 / 실패0 / exit0 | `EXODUSER-sk-s02-Isolated-20261020` | stderr ERROR0·WARNING0 |
| `test_trace_skills_s01_costs.gd` | 2033단정 / 실패0 / exit0 | `EXODUSER-sk-s01-Isolated-20261020` | stderr ERROR0·WARNING0 |
| `test_contracts.gd` | 5검사군 / 실패0 / exit0 | `EXODUSER-sk-s02-Isolated-20261020` | stderr ERROR0·WARNING0 |
| `test_p2005a_start_skills.gd` | 27단정 / 실패0 / exit0 | `EXODUSER-P2005A-Isolated-20261020` | stderr ERROR0·WARNING1 |
| `test_p2005b_giant_slam.gd` | 12단정 / 실패0 / exit0 | `EXODUSER-P2005B-Isolated-20261020` | stderr ERROR1·WARNING2 |
| `test_p2005c_spike_holy.gd` | 20단정 / 실패0 / exit0 | `EXODUSER-P2005C-Isolated-20261020` | stderr ERROR1·WARNING2 |
| `test_p2005d_regen_wiring.gd` | 10단정 / 실패0 / exit0 | `EXODUSER-P2005D-Isolated-20261020` | stderr ERROR0·WARNING1 |
| `test_p2005d_ice_orb.gd` | 22단정 / 실패0 / exit0 | `EXODUSER-P2005D-Isolated-20261020` | stderr ERROR0·WARNING1 |
| `test_native_main_source_starter_state.gd` | 148단정 / 실패0 / exit0 | `EXODUSER-MainSourceStarter-Isolated-20261014` | stderr ERROR0·WARNING1 |
| `test_native_source_player_regeneration_phase.gd` | 88단정 / 실패0 / exit0 | `EXODUSER-SourceRegenPhase-Isolated-20261014` | stderr ERROR0·WARNING9 |
| `mainqa-test_p2005b_giant_slam.gd` | 12단정 / 실패0 / exit0 | `EXODUSER-P2005B-Isolated-20261020` | stderr ERROR0·WARNING1 |
| `mainqa-test_p2005c_spike_holy.gd` | 20단정 / 실패0 / exit0 | `EXODUSER-P2005C-Isolated-20261020` | stderr ERROR0·WARNING1 |

- 신규 검사는 **803단정/0실패/skip0**, Main 부팅0. 전체55조회·32멤버·13override·원순서·정의 없는 key/null·metadata cd·nested 반환복사·StringName 등 미지원 carrier·InputMap/노드 무변경을 검사했다.
- 최신 game.html의9개 **실제 const 선언문만 Node VM에서 발췌 실행**하고 Godot 출력의 전체JSON과 독립 대조했다. **1552개 scalar/null leaf·모든 배열 순서·객체 key 집합/값·5개 Dictionary의 선언 key 순서 일치, 불일치0**. 원본 레시피32개의 gem.skills와 pairs도 전부 일치. fixture를 제품 출력에서 재생성해 통과시키지 않음.
- P2-005a~d는 **91단정/0실패**(a/b/c/d-regen/d-ice 5파일). contracts 검사군 및 별도 checks를 중복합산하지 않았다. 기존 회귀의 source fixture/강제입력은 기존 범위이며 이번 registry의 자연 발동 증거가 아님.
- 기존 회귀는 파일 상수 USERDIR/ISOLATED_DIRECTORY 그대로 사용했다. Main 검사 때만 자기 WT-local override.cfg를 임시 작성하고 finally에서 **시작 상태(파일 부재)로 정확 복원**. 신규·SK-S01은 in-process ProjectSettings만 설정. contracts에는 격리 상수가 없어 Git밖 상속 harness가 `EXODUSER-sk-s02-Isolated-20261020`을 확인한 뒤 원 `_initialize` 호출, 검사/선택범위 변경0.

## 실패 이력·증거 경계

| 단계 | 실제 이력·처리 |
|---|---|
| 중단 전 신규 new-01 | 테스트에서 `CATALOG.call()`을 class에 직접 호출한 parse 오류2개. product 실패를 숨기지 않고 원 err 보존. 기존 진행분의 new-02는 reader instance로 같은 static API를 호출해803/0. 이번 최종 검사는 별도 resume 로그 |
| 재개 원본 comparator 최초 | 보조 스크립트의 override 개수 기대를14로 잘못 적어 source 실제13과 불일치. 원본13개 key/값을 직접 확인해 정확 map으로 수정, `oracle-first-failure.txt` 보존. 제품/원본값·전체 데이터 동등성 비교를 완화하지 않음 |
| contracts 최초 실행 | import cache가0bytes여서 검기 Texture preload·파생 스크립트 오류가 발생. 검사군 출력5/0·exit0에도 오류14행을 발견해 PASS로 인정하지 않음. `test_contracts-first-cache-missing.*`로 원문 보존. 자기 WT 자원 import 후 동일 검사 재실행 결과를 위 표에 기록 |
| import 준비 | 첫 supervisor가 중단돼 exit130. 계수 명령의 셸 자체 매치를 피하도록 같은 파이프라인을 셸 stdin으로 전달하는 방식으로 고치는 과정에서, 대기 중이라고 판단한 supervisor에 SIGINT를 보냈으나 이미 import가 시작된 시점이었음. 자기 supervisor만 신호 전달. 첫 import raw 경로가 재사용돼 개별 원문은 보존되지 않았고 설명은 `import-interrupted-note.json`에 기록. 재실행 exit0/ERROR0·override 원상복구, 전역 editor 설정 hash 불변. 재실행만 정상 import로 인정 |
| 기존 b/c 종료 누수 | dependency WT 원본 b=12/0·exit0지만 자원1 잔류 ERROR, c=20/0·exit0지만 자원3 잔류 ERROR. ERROR까지 포함한 깨끗한 회귀 PASS로 부르지 않음. 최신 main QA-002의 seed·12 process_frame 청소가 추가된 b/c 테스트를 **byte 그대로 Git밖 mainqa- 사본**으로 읽어 같은 dependency 제품 소스에 추가 실행. 표의 mainqa- 두 행은 이 별도 대조이며 원 테스트 실패를 덮어쓰지 않음. 최신 main 전체 제품 회귀 PASS도 아님 |
| 미확인 | 실제55스킬 시전·학습/강화/합체 생성·소유 SP/mats write·관리 UI·HUD·저장·자연 입력·시각/청감·PC/Mac 실플레이는 이 단위에서 미구현/미검수. 카탈로그 조회를32합체 효과 완료로 산입하지 않음 |

## docs 동기화·제출

코드 변경 뒤 docs 전체 keyword 검색(`SKILL_CATS/SKILL_REC_PATH/SKILL_HIER/SKILL_ICONS/SKILL_LIST/SKILL_SLOT_DEFS/_FUSE_GEM_GROUPS/_FUSE_PAIRS/_SK_MUL/SK-S02/skill_management_source`)을 수행했다. `resume/docs-keyword-matches.txt`에170일치행 보존. 기존 설계와 최신 source의 차이는 선행 추적의 X01~X16 및 본 보고서 원표로 귀속하며 원본 수치 조정/타 담당 문서 수정0.

실제 명령은 `resume/run_godot.py`, 각 `<test>.meta.json`에 argv/UTC/exit/소요시간/실제 격리명/stdout·stderr SHA256을 기록했다. 원본 발췌는 `resume/original-declarations.js.txt`, full 비교는 `resume/source_oracle.mjs`·`oracle-comparison.json`. 과거 중단 전 로그도 `_out/sk-s02/`에 보존했다.

정상 pre-commit `.githooks/pre-commit`→docs-sync-check로 자기 경로만 커밋, 자기 브랜치 비강제 push·원격 SHA를 대조한다. 훅 우회/`git add -A`·main push/force/merge/reset 없음. 최종 branch/SHA·수치는 지정 `~/exoduser-wt/_out/sk-s02/DONE.txt`와 `resume/git-final.json`으로 인계한다.
