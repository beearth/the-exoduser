
> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.


> 현재 콜백 계약 (2026-10-17): 실제 Services 공개 map은 기존 typed4 + `parry_lesson_active` = **5개**, 아직 미연결인 필수 callback은 **20개**다. 아래 이전 단위의 map4/미연결21 및 lesson callback 미등록 표기는 당시 source/검수 이력으로 보존한다. 실제 ENEMY V5/normal hurtE caller·전체25 ready는 아직 등록/완료가 아니다. 이번 연결의 범위는 `FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md`를 따른다.

# 일반 hurtE 실제 provider 4 접점 — 2026-10-17

| 항목 | 현재 상태 |
|---|---|
| 소유 코드 | `godot/scripts/main.gd`, `godot/scripts/native_source_player_initialization_services.gd` |
| 범위 | 동일 Main/Services/Player/World/State/Resources/Providers의 장비·공격력 provider 4 Callable 제공 |
| 실행 경계 | normal hurtE 후보/호출자 제품 등록 없음. 나머지 21 owner·source clock·poise19985·KB42483·효과 미연결. full25/full_hurtE/latest_full_game=false |
| V4 | 외부 후보 4fd77588883ffe4ab360c624f9830e7c3a6daa95edd7d7e9d1cb19d04d4def33 제품 복사·등록·실행0. 최초 행동검수108중3FAIL 상태 보존; 실패3 후속은 별도 담당 |
| 사전 보존 | 정확13경로(code2/docs11)의 I/R WORK+HEAD26행, 기존12경로 물리48copy 및 신규문서 부재를 첫 코드쓰기 전에 저장. 외부 NORMAL-HURTE-PROVIDER-BINDING-20261017/prewrite-manifest.json |

## API와 원 결과

| 적용 위치/API | 정확 계약 |
|---|---|
| Main `get_native_normal_enemy_damage_provider_callbacks()->Dictionary` | 실제 live Main 및 정확 SourceInitializationServicesScript를 확인하고 현재 Services 공개 getter를 소비한다. 미준비는 `{}`이며 25 owner map을 제조하지 않는다. |
| Services `get_normal_enemy_damage_provider_callbacks(caller:Node)->Dictionary` | caller가 configure 때의 weak Main과 같고 현재 수명이 유효할 때 네 키만 반환한다. 값은 이 Services 소유 Callable이며 조회 결과/숫자 snapshot을 저장하지 않는다. |
| `eq_affix` → `read_normal_enemy_equipment_affix(id:Variant)->Dictionary` | 현재 identity 확인 뒤 기존 Main `read_native_source_equipment_affix(id)`를 소비. 원 cache/명시 무효화/partial prefix를 유지한다. |
| `u_eq` → `read_normal_enemy_unique_equipment(stat:String)->Dictionary` | 현재 bundle.formula.u_eq(stat) 원 Dictionary 그대로. 원 slot 순서/first truthy raw 검색을 재구현하지 않는다. |
| `p_atk_mul` → `read_normal_enemy_attack_multiplier()->Dictionary` | 현재 bundle.formula.p_atk_mul() 원 Dictionary 그대로. passive 공식/사전 합산 없음. |
| `melee_ref` → `read_normal_enemy_melee_reference()->Dictionary` | 현재 bundle.reference.melee_ref() 원 Dictionary 그대로. value-or-null 단축 API를 사용하지 않는다. |
| Services `_read_normal_enemy_provider(callback:String,args:Array)->Dictionary` | 매 callback 시 수명 확인→해당 단일 원 provider 호출. READY/raw value/source/reason/origin/slot/non_finite/undefined_reads를 복사·삭제·scalar 변환하지 않는다. 새 retry/cache clear/eager query/0 fallback 없음. |

| 실제 원 metadata | 반환 형식 / 소비 한계 |
|---|---|
| affix `eq_affix`214–232 | non_finite/undefined_reads 부재. READY, SOURCE_THROW, READY_PARTIAL_AFTER_SOURCE_THROW, NOT_READY와 원 value/origin/reason 보존. origin=absent_zero/value0은 명시 원 부재 결과 |
| formula `_ok`119–122 / `_fail`124–126 | non_finite는 bool, undefined_reads는 Array(default[]/failure[]). u_eq의 raw Variant/slot은 그대로 |
| formula `pass_dmg_sum`306–352 / `_passive_mul`153–157 | p_atk_mul은 같은 builder를 사용하며 undef:Array를 전달. 없는 PASSIVES 항목은 nonempty undefined_reads 및 원 NaN을 낳을 수 있다. 숫자 count0으로 정규화하지 않는다. |
| reference `_ok`378–380 / `_fail`382–383 | non_finite bool, undefined_reads 부재. 원 status/value/source/reason 유지 |
| binder와 후보 구별 | binder는 nonfinite/부분상태/raw String 등을 그대로 전달한다. V4의 finite numeric/빈undefined 부분지원 중단 규칙을 binder나 전체 원 provider에 강제하지 않는다. 실제 전체 parity 미증명 |

## 수명과 기존 context 보존

| 위치 | 계약 |
|---|---|
| `_source_owner_error()->String` | 기존 `_context_error`의 ownership prefix를 그대로 추출. 원 configured/configuring, weak owner 생존, Main script/fields, World.player, actor·State·Resources·Providers getter identities, holder parent, 같은 Tree/removed-ready 검사를 유지한다. 기존 provider readiness 검사는 계속 수행한다. |
| 기존 `_context_error()->String` | 같은 prefix 통과 뒤 기존 current_g→current_p→current_stats→current_passives→current_inventory→OPT identity 순서 그대로. 기존 Services 소비자의 도메인 준비검사를 제거하지 않는다. |
| `_normal_enemy_provider_error()->String` | configured true, 위 원 ownership prefix, Main.source_initialization_services==self, Main._native_main_service_live()를 확인한다. 다섯 current domain 및 OPT getter를 사전 호출하지 않는다. |
| 보유된 Callable | 같은 Services를 가리킨다. Main이 Services/Providers/State/Resources/dispatcher/actor/World를 교체하면 오래된 Callable은 해당 원 공급자를 조회하기 전에 NOT_READY. provider bundle은 조회마다 현재 소유자에서 받는다. |
| 객체 수명 | Services의 Main/actor/context 참조는 기존 WeakRef. 반환 map을 Services 안에 저장하지 않아 self-Callable map 소유 cycle을 추가하지 않는다. |

| 새 미준비 reason | 조건 |
|---|---|
| actual_normal_enemy_services_replaced | 실제 Main의 현재 Services가 이 callback owner와 다름 |
| actual_normal_enemy_Main_not_live | 실제 Main tree/script/queued guard 실패 |
| actual_normal_enemy_provider_bundle_lost | identity 확인 후 현재 bundle이 비어 있음 |
| normal_enemy_provider_not_bound | 내부 dispatch의 네 이름 밖 요청 |
| unconfigured / 기존 owner error | 기존 초기화·수명 오류 이름 보존. NOT_READY는 value0/null 성공으로 변환하지 않음 |

## 새 영향 검수와 한계

| 검수 | 증거 / 한계 |
|---|---|
| 최초 contact-first | Godot4.7.2 headless, 첫31/31 PASS, exit0, stdio/Godot 양로그 ERROR/WARNING/leak0. 성공 재실행0 |
| 대상 | 실제 변경 메서드와 기존 owner/context 메서드를 정확 추출한 격리 fixture. Main script path/Tree는 fixture 안에서 실제 검증하고 State/Resources/Providers/helper/OPT/dispatcher는 명시 대역. 실제 전체 Main·Services.configure·원 helper 수식/실 domain 값 실행 아님 |
| 새 경계 | 네 키/같은 Services owner, map 생성 시 query0, 원 query1회/raw Dictionary identity, SOURCE_THROW/부분 cache 상태/raw String/NaN+undefined/NR 보존, 다음 현재 결과, Services 및 Main owner fields 교체, World/actor mismatch, holder reparent, provider NR, World 재배치, removed-ready/queued actor, Main free 후 retained callback 거절 |
| 기존 context 영향 | 같은 다섯 domain→OPT 순서 및 current_stats 첫 실패에서 정지. prefix와 tail 원 코드 보존은 별도 정적 대조 |
| 미검증 | 전체 actual Main/SourceState/ResourceAuthority/Providers.configure 수명 통합, 실제 normal hurtE caller/V4, source clock/RNG/kill/effects, 실제 인게임/PC/export/시각/성능. 테스트 통과를 최신 게임 완료로 세지 않는다. |
| 보호 범위 | 게임/브라우저/Godot GUI/서버/API/save/원 PNG·audio read/copy/import0. 보호 Q/E/BOSS/맵/렌더러/2_3 수정0 |

외부 기록은 `sync-git-main-20261016/NORMAL-HURTE-PROVIDER-BINDING-20261017/` 아래 prewrite manifest, docs-search 원시 로그/분류, contact-first 양로그/first.result.json, fixture-source-manifest를 따른다. 버전 선언/열린 게임/export 정렬 증거를 대체하지 않는다.

최초 정적 diff --check는 CHANGELOG에 새로 추가한 CRLF 행을 trailing whitespace로 판정해 실패했다. 기존 CHANGELOG byte prefix는 보존하고 이 단위의 추가분만 LF로 수리했다. 실패한 lint만 다시 확인하며 첫 기능31 PASS/성공한 정적7개는 재실행하지 않는다. 전체 최초 정적 clean=false 이력을 보존한다.


## 승인 provider4 소스 통합 / V4 실패3 후속 (2026-10-17)

| 항목 | 현재 기록 |
|---|---|
| 승인 소스 | local6f06006ea8ed1048a6562bc8f4fe1ef3ee41ab9e / remote03e9f62a991e05e01de7e012d4b5cf80bb63d18b / tree634ea60fc5c018b1bf5293346f5a999a688c8612. code2/docs11의 네 실제 Callable 접점만 통합한다. |
| 최초 V4 | 원108 중3FAIL과 통과105/원 로그 동결. 전체108 재검수 PASS로 소급하지 않는다. |
| 후속3 진단 | 같은 frozen V4·동일 A1/A2 입력의 새 행동9/FAIL0, setup 실제8/FAIL0, exit0, 양로그 ERROR/WARNING/leak0. 후보/contract/제품 코드 수정0. A1 hp100−100=0 및 A2 nested hp50−100=−50의 DEAD/normal_death_entry_42702가 원 계약이다. A1 raw32행 중 seq17 u_eq(_uAxeLeech)는 slot=''·int0·origin부재, eq31은 origin=absent_zero·0.0이므로 callback별 부재 검사가 필요했다. A2 condition→rand→재조회→weapon_el×2 순서 보존. |
| 원 자료 한계 | 후속 종료문 setup9와 실제 setup8을 구별. PRE 내부01:30:10Z와 실제 Write use01:30:07.358Z/result01:30:07.775Z 차이 보존. 결과19173B/SHA256 d91d94dcf7ca643946100eb9eb80c5e12e22001d6598e240dd8d9c72d4c55dff는 ROOT 첫 인수 캐시이며 재실행0. |
| 실제 접점 | 앞선 메서드 추출/명시 대역 첫31 PASS와 별개다. synthetic25 owner/후속9를 actual Main/Services/configure/provider 수명·원수식·전체 전투 parity로 세지 않는다. 다른21 owner·source clock·hurtE caller·효과 미연결, 실제 게임/PC/export 미검증 유지. |
| 과거 backup 한계 | 당시26행/52WORKHEAD슬롯=48copy+4absent→PRE→code기록 선행 확인. code recorded_at은 개별 실제 쓰기시각이 아니며 당시 realparent/nonlink·split INDEX/WORK 상세 flag는 NOT_RECORDED. 새 증거로 소급하지 않는다. |
| 통합 증거 | 이번 정확15경로의 새 backup·ancestor/realpath guard·분리 INDEX/WORK·main expectedSHA/forcefalse·R FF·최종pin은 NORMAL-HURTE-PROVIDER-MAIN-SYNC-20261017/final-receipt.json에 기록한다. 소스 정렬은 열린 게임/served 빌드의 최신성 증거가 아니다. |


## Normal hurtE용 chapter-free active reader (2026-10-17)

| 위치 | 현재 계약 |
|---|---|
| SourceLesson/Main | 실제 기존 SourceLesson.read_active_status()와 Main.read_native_normal_enemy_lesson_status()를 추가한다. 기존 publication/authority/current/optional weak publisher/epoch만 읽어 active1회/chapter0, 전후 identity·epoch·생존을 검증한다. 새 상태/그림자/epochcounter 없음. 선언 publisher 유실은 CURRENT와 witness 모두 NR이며 owner 미선언은 정상이다. |
| 반환/등록 | READY는 명시 active bool/known_absent와 원 authority/epoch metadata, NR은 active생략·원 reason. Main context변화는 read_result를 보존한다. 기존 regen/chapter/fireball reader는 불변. normal callback/ENEMY v5 미등록·typed4 map은4/다른21/full25/full_hurtE 미준비. |
| 검수/한계 | 첫 fixture seed 이름 충돌 parse실패/exit0·기능0 원본 보존→fixture이름만 수리한 새49 PASS/양로그0. actual SourceLesson의 fresh 필드seed와 Main 메서드추출 검수이며 자연publish/전체Main/실게임·export·PC가 아니다. old_protected_functions_called=0은 선언 scope이며 protected 계측값이 아니다. 기존31/9/108/통과검수 재연0. |

정확 field/identity/epoch·reason·첫실패/새49 범위는 FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md를 따른다. 기존 개별 단위의 당시 상태와 실패 기록은 유지한다.


## 실제 parry_lesson_active Callable 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| Services map | 기존 eq_affix/u_eq/p_atk_mul/melee_ref 순서 뒤 parry_lesson_active를 한 개 추가한5개. 값은 같은 Services 소유 Callable이며 `read_normal_enemy_parry_lesson_active()->Dictionary`를 가리킨다. 나머지20은 미연결이다. |
| 실제 조회 | 기존 ownership-only _normal_enemy_provider_error 통과→기존 actual Main.read_native_normal_enemy_lesson_status1회→같은 ownership prefix를 재확인한다. current5domain/OPT/chapter/guard/controller eager조회나 새원천/state 없음. 기존4 helper와 dispatch·query순서 불변. |
| 원 결과 | 정상 context면 READY/NR/지원 밖 metadata도 원 Main Dictionary reference 그대로. 조회 중 cohort 유실은 status NOT_READY/readyfalse/active생략 + actual_normal_enemy_lesson_context_lost/context_reason와 원 read_result를 보존한다. unknownfalse/scalar 변환 없음. |
| 새 검수 | 실제 새 Services/Main 메서드+명시 holder/provider/lesson API stand-in의 최초25/25PASS, exit0·양로그 ERROR/WARNING/leak0. map생성query0/다섯키순서/같은Service·lesson1회/미준비raw·전후Service/actor/World/SourceOwner교체·sourceMain교체/epoch/queued와raw중첩 보존. 25는 검사 수이며25owner ready가 아니다. |
| 검증 한계 | full Main/Services.configure/실제 SourceLesson publication/원수식/V5제품copy·caller·게임 미검증/미등록. old49/31/9/108/parse 재연0. 첫25 뒤 map설명 comment만 Four→Five로 바꿨으며 fixture 원hash는 당시값 유지·실행한 메서드본체는현재와정확대조한다. |

기존 단위의 실패·성공·원자료 시각과 자연publication 미검증 한계는 바꾸지 않는다. callback5 노출을 전체hurtE/최신게임 완료로 세지 않는다.


## 실제 player_view rawP 콜백 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| 등록/API | 기존5 순서뒤 player_view → Callable(currentServices,read_normal_enemy_player_view), 인자0/Variant. map6·미연결19. Main의 기존 getter delegation은 불변이다. |
| 실제 조회 | 기존 ownership-only prefix→같은 actualState.read_current_p1회→동일prefix. 유효하면원ownedP reference 그대로, 원null 또는pre/post context유실이면null. 새status/envelope/복사/filter/optional필드·기본0추가없음. |
| sync/수명 | State 기존getter가ownedP의hp/mhp/x/y/s 및기존다른필드를동기화한다는공개계약을소비한다. Actor/Resource를새로쓰지않는다. post loss 전에이미적용된ownedP sync를rollback/환불하지않는다. 다른domain/OPT/chapter/clock선조회없음. |
| 새 검수 | 실제Services wrapper/Main getter메서드+명시State/public-P sync·holder/provider 대역의첫26/26PASS,exit0·양로그 ERROR/WARNING/leak0. map0query/6키·같은Services/P1query/sameP와optional identity·freshP/원null·전후교체/보존된sync·Main유실을확인. 기존State본문·fullconfigure·자연runtime은검증하지않았다. |
| 미완 | 기존5/ownership본문불변. old25/64/49/31/9/108/parse·성공proof 재연0. V5/unusedkernelcopy·실caller·19dummy·25presence우회0. full25/fullhurtE/latestfullfalse/실게임·PC/export未 유지. |

이전 각단위의수송/시각/원실패·stand-in검수한계를소급하지않는다. 26은새검사수이며엔진전체완료율/25owner준비가아니다.
