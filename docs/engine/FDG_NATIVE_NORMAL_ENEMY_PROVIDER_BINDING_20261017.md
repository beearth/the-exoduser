> 2026-10-17 ENGINE WIP 현행: callback **10/25·미15**, 기존9 뒤 `rand` 인자0을 같은 Services reader로 등록했다. 아래 이전9·미등록 표시는 해당 이전 인수 단계의 이력이며, 현행 등록 상태는 이 배너와 마지막 등록 절을 따른다. main/R/served 반영·V9 scalar Dict직결·fullhurtE 완료는 아니다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


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


## 원본 stat_str 공개 연결 — 2026-10-17

| 항목 | 현행 코드와 범위 |
|---|---|
| formula / Services | 기존 STAT_STR=1.0 → 새 stat_str()->Dictionary → read_normal_enemy_strength_multiplier()->Dictionary. 인자 각각0. 원본 _ok의 READY/value(float)/non_finite/source/undefined_reads/reason을 그대로 전달한다. |
| 소유권 / 실패 | 실제 current Main/Services/Providers 검사 전후 및 formula 객체·Script·수명 동일성 검사. 소유권 실패는 NOT_READY/provider=stat_str, query 후에는 read_result 보존. 부재 numeric value/default 0·1 추가 없음. |
| callback 등록 | 기존 6개 뒤 stat_str. 현행 7/25·미18. getter는 formula/current P/domain을 eager query하지 않는다. 기존 여섯 callback·25 presence·원 query 순서 변경 없음. |
| 새 검사 / 제한 | 실제 formula script/새 reader와 정확 추출 Services graph + 명시적 holder stand-in의 첫 신규25/25 PASS, exit0·오류/leak0. full Main 자연 configure·실제 gameplay 미검증, 기존 성공 검사 재실행0. |
| 다음 연결 | 현 V5 stat_str 세 scalar 위치는 typed 미지원이라 실제 바인딩0. 기존 ENEMY V6의 세 위치 typed 처리·인수 후 실제 caller를 연결해야 한다. latest_full_game=false 유지. |

상세 API·raw 예·실패 이유·검수 한계는 [stat_str 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)을 따른다. 기존 State player_view/read_current_p 및 다른 수치·계산식·저장 계약은 변경하지 않았다.


## p_dot_pool 실제 소유자 추가 — 2026-10-17

| 항목 | 현행 소스 계약 |
|---|---|
| 원식 / API | Formula.p_dot_pool()->Dictionary(0): 기존 _container PASSIVES → 1+_passive_or0_mul(actualDict,"pDot",0.05) → 기존 _ok/_fail. 원 pDotPool @game.html:28068. 숫자·식·전역 상태 변경 없음. |
| binding 공개 검사 | Formula.is_passives_reader_bound_to(expected:Callable)->bool, Passives.is_current_passives_reader_bound_to(expected:Callable)->bool. 기존 bound/valid/Callable target·method/equality만 검사하여 추가 domain 조회·저장0. |
| 실제 bridge | Services.read_normal_enemy_dot_pool_multiplier()->Dictionary(0), 기존7 뒤 p_dot_pool. current Main/Services/Providers→같은 Formula/Passives/current_passives Callable/Script·binding을 전후 검사. Formula 1query, 정상 raw 같은 참조·원 status/metadata 유지. |
| 값 / 실패 | 유효Dict 필드 absent/null/falsy/NaN은 원 truthiness로1.0; owner 유실은1/{} 제조0. 기존 bound null→SOURCE_THROW 및 status 손실 경로 불변. invalid String/Infinity의 non_finite 보존; custom Object·전체 문자 grammar는 기존 부분 도메인 한계. context/객체·Script·binding post loss는 top NOT_READY/read_result 원 raw/최상위 numeric value0. |
| 현행 / 검수 | map8/25·미17, 25 presence 불변. 첫 신규 행동76/76+setup37/37 PASS/exit0/양로그 오류·leak0. 실제 Formula/Passives binding·정확 Services +명시 holder/current-reader stand-in 범위, 전체 State/Main·자연 수명·실전 미검증. setup bind query1/runtime query1과 실제 rawgrit/resource 부수조회未검증을 구분한다. |
| 다음 | V6 p_dot_pool scalar 전체4곳(170/173/566/570) typed 미지원·직결0. 첫 접점은170/173이다. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


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
