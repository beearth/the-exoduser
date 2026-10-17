## actualMain 소비 상태 — 2026-10-14

원 producer는 실제 SourceState/SourceResources와 providerbundle10에 연결된다. actualMain 첫고유5그룹145는 처음성공4/132+fixture SCRIPTERROR consumer만13수리재검한이력이며 원독립source 성공검사는재연하지않는다. 실제초기아이템15equip+10bag/currentrawGrit0·getter·원currentCRef/Formula/Affix를소비하지만 전체파생/applyStats/fullbootstrap/actualsave복원·투자·환불/화면·240FPS는아직미완이다. 최신중앙SSOT는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md다. 아래producer의원수치·과거검증이력은보존한다.

# Godot ITEM armor element 첫 이식 — 2026-10-13

| 항목 | 값 / 범위 |
|---|---|
| TASK | CODEX7-GODOT-ITEM-ITEM_ARMOR_ELEMENT-FIRST-20261013 |
| COMPLETION-ID | ITEM-ARMOR-ELEMENT-FIRST-20261013-75 |
| 작업 시작 실제 parent | b921fc4017703d8b37cc2a9de8fdb5781992165e |
| 제품 root | `/Users/fordeargamers/the-exoduser` — realpath 동일, 소유 경로 symlink 없음 |
| 소유 코드 | `godot/port_modules/item_armor_element/producer.gd` |
| 소유 최초 검사 | `godot/port_modules/item_armor_element/tests/test_first.gd` |
| 새 정본 문서 | 이 파일만 소유. 기존 공유 docs 수정0 |
| 생성 전 | 코드·검사·이 문서 working/HEAD 모두 부재; 이전 bytes가 없어 백업 대상 없음. 외부 before.json에 기록 |
| 변경하지 않은 영역 | 공유 player/world/factory, HTML/원 source, drop/경제/save, enum/schema/등급색, 자산/맵/보호2_3, Git index/commit |

## 원 source와 현재 수식

원 source root는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. `game.html:15066`의 EL, `15077`의 elMul, `17023`의 ar, `16802` equipItem과 `16875` unequipItem을 읽었다. source-fragments.txt는 필요한 원문만 보존하며 원자원 재해시/재import는 하지 않았다.

| id | 원 값 / 식 | 실제 API / 소비 |
|---|---|---|
| EL | P=0, F=1, I=2, D=3, L=4, H=5, E=6 | incoming int를 그대로 사용. 새 enum/임의 EL.P 장비 생성0 |
| armor identity | `ar() = INV.equipped.armor || {}` | caller가 반환하는 현재 inventory의 `equipped.armor` Dictionary 자체를 반환. id나 이름으로 재검색/복제하지 않음 |
| 장비 교체 | `INV.equipped[equipSlot]=item; item.slot=equipSlot` | armor 선택은 `equipped.armor` 키 기준. 원 `id`, `slot`, `el` 변경0, bag 검색/경제 처리0 |
| 해제 | `INV.equipped[slot]=null` | reader의 현재 armor=null이면 반환 null; defender element=null, 모든 native incoming에 1.0 |
| 약점 배율 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 각각 2 | `element_multiplier(attacker, defender)`의 동일 분기 순서 |
| 동일 속성 | `a===d && a!==EL.P` → 0.5 | numeric 동일·물리0 제외. 숫자형 float 2.0도 JS Number 2와 같은 의미 |
| 나머지 | 1 | 무장비/누락/null/문자열/bool defender는 numeric native attacker와 일치하지 않으므로 1.0. 0으로 강제 변환하지 않음 |
| 피해 caller | `game.html:35710`: `~~((p.dmg||10)*elMul(p.el,ar().el))` | 이 producer는 배율만 반환. 피해 truncation·HP·패링·poise·raw flags·탄 생명주기는 호출자 소유 |

| 공격＼방어 | P0 | F1 | I2 | D3 | L4 | H5 | E6 |
|---|---|---|---|---|---|---|---|
| P0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| F1 | 1 | 0.5 | 2 | 1 | 1 | 1 | 1 |
| I2 | 1 | 2 | 0.5 | 1 | 1 | 1 | 1 |
| D3 | 1 | 1 | 1 | 0.5 | 2 | 2 | 1 |
| L4 | 1 | 1 | 1 | 2 | 0.5 | 1 | 2 |
| H5 | 1 | 1 | 1 | 2 | 1 | 0.5 | 1 |
| E6 | 1 | 1 | 1 | 1 | 2 | 1 | 0.5 |

## Runtime public API와 caller

| API | 실제 동작 / 계약 |
|---|---|
| `configure_inventory_reader(reader: Callable) -> bool` | 유효 reader를 바인딩. 무효 Callable은 false이며 이전 바인딩 유지. reader는 매 조회마다 현재 inventory Dictionary를 반환해야 함 |
| `clear_inventory_reader() -> void` | 소유 바인딩 해제; 이후 neutral1 |
| `get_equipped_armor() -> Variant` | reader 실행 → 현재 equipped → armor. Dictionary면 원 identity 반환; reader 소멸/비Dictionary/없음/빈 armor면 null. 슬롯을 새로 쓰거나 ID로 객체를 바꾸지 않음 |
| `get_armor_element() -> Variant` | 현재 원 armor.el 또는 null. 물리0 fallback 없음 |
| `get_armor_identity() -> Variant` | 현재 원 armor.id 또는 null. numeric id 변환/생성 없음 |
| `get_native_element_multiplier(attacker_element_id: int) -> float` | 현재 armor를 읽어 원 elMul 식 반환 |
| `element_multiplier(attacker: int, defender: Variant) -> float` | 독립 원 상성 수식; 숫자 값 clamp/새 balance 없음 |

실제 격리 caller는 전용 test_first.gd의 `InventoryCaller`이다. constructor가 producer를 instantiate하고 `read_inventory` Callable을 configure한다. `select_armor`는 fixture inventory의 장비 identity를 교체하고 `incoming_multiplier`가 실제 producer를 호출한다. inventory/equipped Dictionary 전체 교체와 동일 id의 서로 다른 Dictionary도 현재 참조를 소비한다.

```gdscript
var armor_provider = preload("res://port_modules/item_armor_element/producer.gd").new()
armor_provider.configure_inventory_reader(read_current_inventory)
# read_current_inventory()는 실제 소유 caller의 최신 INV Dictionary를 반환한다.
var multiplier = armor_provider.get_native_element_multiplier(attacker_element_id)
```

2026-10-13 제출 당시 위 production caller 예는 ENGINE 연결용이며 공유 player에 적용하지 않았다. fixture의 숫자 id `1700000000000.25`와 armor el 1/2/3은 검사용 입력이며 live 장비 생성·save 기록이 아니다. 실제 source equipItem의 요구레벨/강화비용/결정전승/가방 이동은 이 provider의 기능이 아니다.

## 최초 검사와 미완 Gate

| 항목 | 결과 / 한계 |
|---|---|
| 실제 도구 | 기존 portable Godot 4.7.2, headless, `--path /Users/fordeargamers/the-exoduser/godot --script res://port_modules/item_armor_element/tests/test_first.gd` |
| 최초 meaningful 검사 | 75 checks, failures=[], exit0. 도구 chunk a77548. 성공 suite 반복0 |
| 검사 범위 | 무장비 7속성 neutral1·원 객체 identity·원 slot/id·같은 id 객체 교체·직접 el 변경·equipped/INV 참조 교체·무효 reader 보존·49 상성 조합·누락/잘못된 el 비강제변환·unbind |
| 격리 I/O | `--log-file`을 외부 E의 `fixture/first.log`로 지정. 테스트/provider는 user:// 및 실제 save/슬롯/API 접근0. 프로젝트 user-directory 설정 자체는 공유 config 소유여서 변경하지 않음 |
| live inventory / 2026-10-13 당시 | 당시 Godot production inventory caller 연결 없음. fixture 실행을 live inventory 소비/전체 equipment 이식으로 승격하지 않음 |
| 공유 player / 2026-10-13 당시 | 당시 no-armor neutral1만 유지했고 ENGINE 연결을 남겼다. 현재는 위2026-10-17 실제 Main/Player consumer 계약을 따른다. |
| source docs 차이 | R `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md`의 상성 강약 설명 일부는 현재 elMul과 불일치. 이 문서의 원문 분기/표를 current-value로 ENGINE에 인계; 기존 공유 문서 수정0 |
| 추가 관련 docs | W `docs/engine/FDG_INTEGRATION_INTERFACE.md`의 armor 상성1 범위; R `docs/2_7 인벤토리+장비시스템/` 및 속성/밸런스 검색 결과는 외부 docs-W/R-*.txt에 보존 |
| visual / render / audio | 렌더·실제 청취·공개 play·최저240 미검수. auto 플레이/전체게임 완료0 |
| 보호 계약 | native60·raw flags·Q/E·poise·owner 독립탄·nav LOCK 변경0. blackBean magic/Q만/E불가/Q 성공 blue 유도반사 및 공격 동시 제한 금지 유지 |

증거 root: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/item_armor_element/`. `before.json`, `source-fragments.txt`, `fixture/first.log`, `first-test-ledger.json`, `owned-receipt.json`, `own-hunk.patch`, 전체 allowed docs keyword 검색 raw가 담당 증거다. 지정 제외 문서/마케팅 capture 도구 read·검색·채택0. 새 producer와 최초 headless consumer 동작 완료이며 중앙/ROOT 인수·실게임 연결은 미완이다.


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / Player 소유 | NativeArmorElementScript는 기존 item_armor_element/producer.gd. _native_armor_element는 Player가 소유하는 RefCounted이며 bind_native_armor_inventory(reader: Callable)->bool은 유효한 무인수 reader를 한 번 바인딩한다. 무효·중복 바인딩은 false이며 기존 바인딩을 변경하지 않는다. |
| 4 / 기존 피격 소비 | get_native_element_multiplier(attacker_element_id:int)->float가 현재 provider를 위임한다. 기존 enemy_projectile_fire.gd의 실제 contact는 이 getter→int(damage×multiplier)→기존 receive_damage 요청을 그대로 사용한다. 새 피해·resource sink나 패링/탄 수명 정책은 추가하지 않는다. |
| 5 / 현재 장비 / identity | 매 조회마다 실제 SourceState.read_current_inventory의 현재 equipped.armor와 el을 읽는다. armor/INV/equipped를 복제·캐시하거나 id로 재검색하지 않는다. 같은 id의 객체 교체·동일 객체 el 변경·inventory/equipped 교체가 다음 조회에 반영된다. |
| 6 / 없음 / null / falsy | unbound·무효/소멸 reader·비Dictionary INV/equipped·누락/null/빈 armor·누락/null/문자열/bool el은 기존 producer의 neutral1 의미를 유지한다. 누락 el을 물리0으로 만들지 않는다. |
| 7 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 8 / 새 검수 | Godot4.7.2 headless의 자기격리5군/13접촉 첫 실행 통과. 실제 새 Main 바인딩3줄과 Player 변경 메서드, 변경 없는 기존 fire projectile의 contact를 소비했다. owned base37의 요청은 현재 fire armor18/ice armor74/neutral37로 관측했다. 이는 실 Player HP 손실값·실물 장착·자연 탄 생성 증거가 아니다. |
| 9 / 검수 분리 | Main 전체 startup/GPU와 Player 원화 preload를 실행하지 않았다. 격리 장면은 새 Main fragment/Player 메서드를 그대로 추출하고 기존 projectile 전체 script를 복사하되 visual lifecycle만 fixture에서 비활성화·owned contact 상태를 시드한다. 실제 Main/Player 전체 실행·configure/import/spawn·PNG/샘플·실 save/API/사용자창/PC 검증0. 옛75검사 재실행0. |
| 10 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |


## 2026-10-17 normal hurtE el_mul typed owner (WIP, registry 미등록)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| 등록 / 소비 | 실제 callback map10 / 미등록15 유지. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| 연결·미완 | actual callback10/미등록15, el_mul은 아직 callback 미등록. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.
