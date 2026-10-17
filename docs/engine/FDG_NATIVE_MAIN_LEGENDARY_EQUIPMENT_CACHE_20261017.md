> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

# Native Main 소유 전설 장비 조회 캐시 — 2026-10-17

현행: **SOURCE WIP / 신규 격리 행동41/41 PASS / 실게임 미검증 / 등록 9/25·미16**. 첫 신규 fixture는 parse 실패로 행동0, exit0/result.json 없음이다. 최신 전체 게임·본편 hurtE·실제 원 JS 실행·export·PC 완료 증거가 아니다.

| 항목 | 현행 계약 |
|---|---|
| source | _lEq 74B SHA256 9267e00cf75deef43452f60684b561b69184d76058d1754223e2c47de4736c01; _lEqCache=null 14B SHA256 1758cbbabde9662935c9c1c12be6195ca5be0669c0bc99342ad7dc9bbe2d2434; _lEqRebuild 459B SHA256 571f6ad4a060d7f29f4b2600bbf0d5b75181d5d1b945a0b2121b5481bae20052. 이전 인수된 정적 계약만 재사용, 원본 재독/원함수 실행0. |
| Main/source context | actual Main 인스턴스 하나를 native source-script context 하나로 대응시키는 신규 이식 설계다. 원 JS document와 기존 Main의 자연 수명이 이미 동등했다는 증거가 아니다. |
| 최초 선언 | main.gd source 필드의 private Variant _source_l_eq_cache=null 1회. actor·Formula·Services.configure/frame/new-run/restore 때문에 null 재선언하지 않는다. |
| 연결 | Main._initialize_source_player_parameters에서 Services.configure 성공 뒤 bind_main_source_legendary_cache(Main). 기존 dispatcher/new-run 호출 전에 weak Formula binding만 구성, INV 조회·복원0. _ready/UI/HUD 본문 변경0. |
| 수명 | 같은 Main에서 actor/State/Services/Providers/Formula가 교체돼도 cache/prefix 보존. 옛 identity consumer 거부. 명시적 새 binding이 성공하면 기존 cache 조회. Main 해제/ready 뒤 Tree 이탈/queued owner 거부, strong Main back-reference0. |
| lazy 순서 | null→{} 설치가 INV 조회보다 먼저다. 17 slot 순회에서 실제 State의 같은 INV/equipped[slot]/item/legendarySpecial만 사용한다. item[stat] missing일 때만 actual special.val 복원. cache는 첫 non-undefined 필드만 취한다. 합산·first-truthy 선택0. |
| slot 순서 | weapon, shield, boots, armor, helmet, bow, gloves, pants, belt, necklace, ring1, ring2, cape, bracelet, headband, ossuary, headband2. |
| defined falsy | item 필드의 null/false/0/빈 문자열/NaN은 정의된 값이다. val로 덮어쓰지 않으며 cache의 같은 stat에 뒤 slot이 들어오지 않는다. 최종 raw truthy 또는 숫자0 반환. Infinity/-Infinity·객체/배열 참조·문자열·true 등 raw truthy 값 유지. |
| cache-hit 경계 | 새 pure identity/lifecycle/claim/Script/binding guard만 실행. get_provider_bundle/_context_error/_native_main_service_live/is_source_context_ready를 부수조회0으로 추정해 재사용하지 않는다. cache hit에서 State inventory getter/legacy writer/resource·domain 조회0을 새 검수 대상으로 둔다. |
| 오류/부분 효과 | NOT_READY/SOURCE_THROW/UNSUPPORTED_OPERAND는 원 reason/raw·operand·cache_initialized/cache_prefix/partial을 명시한다. 이전 item/cache prefix 보존, retry/clear/rollback0. 후속 query는 남은 cache를 읽으며 실패한 rebuild를 replay하지 않는다. owner 자체가 없으면 numeric fallback value를 만들지 않는다. |
| native 표현 한계 | missing val의 JS undefined assignment는 해당 item[stat] operand에서 UNSUPPORTED_OPERAND로 중단, null로 대체0. Object/Array 등 ToPropertyKey, JS prototype 속성, 정확한 숫자 key 문자열화를 지원하지 못하는 operand도 raw/prefix와 함께 중단한다. |
| property key 지원 | String, null→null key, bool→true/false key, JS 정확정수 범위의 int/정수 float, ±0→0 key, NaN·±Infinity 명시 key만 지원. 비정수 float의 JS 문자열화·범위 밖 정수는 typed unsupported다. raw stat/value의 전역 String/float/finite/clamp 정책0. |
| item writer 범위 | State.restore_native_legendary_item_stat(Main,expectedINV,slot,item,special)는 실제 State owner/current-error·동일 INV/slot/item/special·Main의 현재 write window·undefined 조건을 모두 확인한다. 값 인자를 받지 않고 같은 actual special.val에서만 파생. 실패 writes0, 기존 starter-items/Q/resource/save write 권위 확대0. |
| invalidation 미소유 | 원 5개 재대입 위치는 metadata 계약만 있다. 기존 ordered affix/reference invalidation sink에 l_eq reset을 추가하지 않는다. equip/INV identity/clock/epoch/new-run/restore/hot-reload/복수 Main 동등성 정책0. |
| callback | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |

| 파일 | 새 공개 API / 인자 |
|---|---|
| main.gd | can_bind_native_source_legendary_formula(formula,services,state,providers)->bool; read_native_source_legendary_equipment(stat,formula,services,state,providers)->Dictionary; is_native_source_legendary_write_current(state,inventory,slot,item,special)->bool; source_legendary_property_key(value)->Dictionary |
| combat_stat_formula/producer.gd | configure_main_legendary_source(Main,Services,State,Providers)->bool; is_main_legendary_source_bound_to(Main,Services,State,Providers)->bool; l_eq(stat)->Dictionary; weak 참조만 보유, 독립 cache 없음. |
| native_source_player_providers.gd | get_native_main_legendary_formula(Main)->Variant。current actual Formula identity만, domain query0. |
| native_source_new_run_state.gd | is_native_main_legendary_owner_current(Main)->bool; read_native_legendary_inventory(Main,Formula,Services,Providers)->Dictionary; restore_native_legendary_item_stat(Main,expectedINV,slot,item,special)->Dictionary |
| native_source_player_initialization_services.gd | is_native_main_legendary_bridge_current(Main,State,Providers)->bool; bind_main_source_legendary_cache(Main)->bool; read_normal_enemy_legendary_equipment(stat)->Dictionary |

| 신규 검증 | 결과/한계 |
|---|---|
| 구조 보존 | 최초 static9/9: 기존5 source body/prefix, Main 정확 field·init 연결 외 보존; null 선언1/{} 설치1; 새 query에서 기존 eager guard 미사용; map8 유지. 성공 suite 재연0. |
| 첫 격리 fixture | new-impact-fixture-first 1회, exit0이나 State/Services preload parse 실패·result.json 부재·행동0. 원 stdio1500B/engine1444B 그대로 보존, 자동 재연0. harness 원인 아직 확정하지 않음. |
| fixture 계획 | exact 새 Main/Formula/Providers/State/Services 메서드와 명시적인 pre-Tree holder/setup/current-error stand-in. full Main/Services.configure/State 자연 lifecycle·resource sidequery·원 JS/current 실전/restore는 검증 범위 밖이다. |
| metadata 범위 초과 기록 | 초기 plan selector167행은 필요한 범위를 넘어 Frame field/call과 Q/E 선언·필드 및 Main876 read_native_q_parry_source의 currentOptions 할당 한 줄도 읽었다. Q-related body 한 줄에 대한 semantic 출력이 없었다고 소급하지 않는다. 실제 Q/E 실행·수정0. 기존 metadata 보존·캐시 권위에서 모두 제외. 867/1368 method label은 selector 추적값이며 lexical scope 증거0. 이후 exact source field/new method/init 경계만 작업한다. |
| 사용량 | 시작55% 기존값 재사용. 당일 기준 누적 최초값 부재로 일간 UNKNOWN. 종료 시점에만 다시 관측하며 반올림 동일값을 작업 무료·단독 소비0으로 표현하지 않는다. |


| 새 상태 필드/반환 | 초기값·정확 범위 |
|---|---|
| Main._source_l_eq_cache | Variant null, 해당 Main 생성 시 1회. 첫 lazy rebuild에서 Dictionary {} 설치 1회. |
| Main._source_l_eq_write_context | Dictionary {}, writer 호출 동안 formula/services/state/providers/inventory/slot/item/special 동일성 window를 보유하고 호출 뒤 {}로 비움. cache reset과 별개다. |
| Formula._legendary_main / _legendary_services / _legendary_state / _legendary_providers | WeakRef, 초기 미설정. configure_main_legendary_source에서만 실제 owner의 weakref를 보관. |
| Formula._legendary_source_bound | bool false, 유효한 명시 binding 뒤 true. 다른 Main으로 재binding 거부. |
| 정수 property key 경계 | -9007199254740991 이상 9007199254740991 이하의 JS 정확정수 범위. 비정수 float 문자열화 미지원은 해당 key operand에서만 판정. |
| prototype 미표현 key | __proto__, constructor, toString, toLocaleString, valueOf, hasOwnProperty, isPrototypeOf, propertyIsEnumerable, __defineGetter__, __defineSetter__, __lookupGetter__, __lookupSetter__. |
| State writer writes | 성공 writes=1, 모든 사전조건 실패/미표현 val은 writes=0. 소스 원함수의 반환값이 아니라 native 권위 검수용 metadata다. |


## 2026-10-17 검수 틀 원인 확인과 신규 행동 최초 실행

| 항목 | 실제 결과 |
|---|---|
| 실패 진단 | 원 State·Services fixture의 --check-only를 각각 1회 실행. exit0이지만 실제 parser는 이전 space 뒤 tab 사용을 State21/Services14에서 보고했다. check-only exit0을 성공으로 세지 않는다. |
| 수리 범위 | 새 new-impact-fixture-harness-repair-first에 복사. State stand-in header4줄·Services header1줄의 선행 공백만 tab으로 수정하고 독립 userdata namespace를 사용했다. actual 제품 새메서드 suffix·runner·다른 script 본문은 그대로다. 원 첫8파일·양로그·PRE를 변경하지 않았다. |
| 첫 행동 | 이전에 파싱 실패로 실행되지 못한 동일 신규 LEQ 영향 행동을 새 폴더에서 첫1run, 41/41 PASS, exit0/result존재. 양로그 각각115B, 오류/경고/leak0. 기존 성공 suite와 원 failed runner namespace 재연0. |
| 확인 범위 | fresh Main null/bind 무조회, 실제 같은 item/raw alias 복원, defined-falsy5종/17 slot/첫값, same Main actor/helper 교체 cache 유지·옛 caller 거부·hit domain0, undefined/key raw partial 및 후속 query no-replay, raw truthy7종/Infinity, ownerloss·State reason 보존, writer window/INV/slot/item/special 실패 writes0, Main 해제 weak caller 거부. |
| 검증 한계 | exact 새 5개 method graph와 명시 pre-Tree setup/holder/current-error stand-in이다. full Main/Services.configure/State 자연 수명·실제 resource 함수/원 JS/restore/실게임·V8 consumer·성능·export·PC는 검증하지 않았다. |
| 등록/게시 | 현행 8/25·미17 유지. ROOT 인수 전 l_eq map9 등록, GitHub 게시, main/R/served 반영0. source local WIP52cbf870 보존, 이번 수리에서 제품 코드 변경0. |
| 기록 | K의 failure-parser-diagnostics-manifest.json, harness-repair-prewrite-manifest.json, harness-repair-diff.txt, harness-repair-result.json과 두 진단 양로그/새 행동 양로그·result.json. 원 첫 parse 실패 이력도 별도 유지. |
| docs PRE 정정 | 첫 docs 결과-sync PRE는 Git의 기본 name-only 출력이 비ASCII 경로4개를 quote하여 잘못된 absence18개를 기록했다. **문서 쓰기 전에** 발견하고 그 manifest/백업을 그대로 보존했다. -z 정확 UTF-8 경로로 별도 v2 PRE·I/R WORK/HEAD112 slot/110 copy/새 owner 문서 R 부재2 slot을 완료한 뒤에만 문서를 갱신했다. 잘못된 PRE를 쓰기 권위로 사용하거나 소급 수리하지 않았다. |


## 2026-10-17 실제 l_eq 9번째 등록

| 항목 | 현행 |
|---|---|
| map | 기존 eq_affix→u_eq→p_atk_mul→melee_ref→parry_lesson_active→player_view→stat_str→p_dot_pool 뒤 l_eq 하나. 실제 9/25·미16. 모든 Callable의 object는 같은 Services self다. |
| route | Main.get_native_normal_enemy_damage_provider_callbacks()->Dictionary 인자0의 기존 forwarding→같은 Services.get_normal_enemy_damage_provider_callbacks(Main)→read_normal_enemy_legendary_equipment(stat:Variant)->Dictionary 인자1→Formula.l_eq(stat). V8 _le float 소비자/전체 hurtE와의 직접 연결은 하지 않았다. |
| 추가 조회 | 등록은 Callable literal 하나만 생성한다. 등록 추가분의 INV/domain/Formula eager 조회는0. **기존 Main/Services readiness guard 내부 부수조회가0이라고 검증하거나 주장하지 않는다.** 실제 map getter 전체의 query0은 미입증이다. 캐시 hit의 새 metadata-only query 경로와 map 생성 기존 guard는 구분한다. |
| 새 map 경계 검수 | 신규 delta static9/9, 실제 9key/기존8순서·self/정확메서드·stat1인자/기존 Main forwarding·나머지 Services byte 동일성 확인. runtime0, 기존41/진단/구조 static9 재연0. 동일 숫자9인 최초 구조검수와 이번 새 map 검수는 별개다. |
| 검증 한계 보완 | wrong slot/item/special 음성 검수는 runner가 명시 private writewindow를 합성했다. ready 이후 detach·자연 재진입·실 State current_error/resources 내부는 미검증이다. first_whole_clean=false, 새 행동41 통과로 원 parse 실패를 지우지 않는다. |
| 제품 범위 | 이번 source delta는 Services map의 한 줄뿐이다. 기존8/helper/dispatch/수식/수명/legacywriter 본문과 Main getter는 그대로다. 원52cbf870은 별도 codex/native-leq-main-cache-source-20261017 ref로도 보존한다. |
