# Native normal enemy el_mul current EL owner


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

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
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
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
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.

| owner | 새 메서드(기존 bind/guard 본문 유지) |
|---|---|
| main | is_native_source_element_context_current, _native_source_element_operand_supported, _native_source_element_strict_equal, _native_source_element_not_ready, _native_source_element_read_member, _native_source_element_match_pair, _native_source_element_finish, read_native_source_element_multiplier |
| services | _native_source_element_service_not_ready, is_native_main_element_bridge_current, read_normal_enemy_element_multiplier |
| formula | _native_source_element_formula_not_ready, _native_source_element_refs_current, el_mul |


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |

