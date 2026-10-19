> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. D9는 직전 공통 소스 인수이며, 이번 main/I/R 소스 정렬은 아래 통합 정본과 단위 receipt의 실제 HEAD·tree를 기준으로 확인한다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.


> 현재 콜백 계약 (2026-10-17): 실제 Services 공개 map은 기존 typed4 + `parry_lesson_active` = **5개**, 아직 미연결인 필수 callback은 **20개**다. 아래 이전 단위의 map4/미연결21 및 lesson callback 미등록 표기는 당시 source/검수 이력으로 보존한다. 실제 ENEMY V5/normal hurtE caller·전체25 ready는 아직 등록/완료가 아니다. 이번 연결의 범위는 `FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md`를 따른다.

# Normal hurtE 레슨 active-only 실제 owner (2026-10-17)

| 항목 | 현재 범위 |
|---|---|
| 실제 코드 | godot/port_modules/parry_lesson_source/producer.gd, godot/scripts/main.gd. 기존 owner에 reader 추가; 별도 상태 producer 없음. |
| SourceLesson API | read_active_status()->Dictionary (현재582행). 같은 실제 _authority/_current/_owner_declared/_owner_ref/_witness_raw/_epoch/_origin/_source_phase/_missing_reason만 읽는다. 새 state/cache/shadow current/epoch/counter/busy flag 없음. |
| Main API | read_native_normal_enemy_lesson_status()->Dictionary (현재1988행). 기존 live Main/exact SourceLessonScript 검사 후 동일 holder를 보유해 reader1회. 반환 뒤 current Main/holder identity와 기존 public get_epoch()를 재확인한다. |
| 등록 상태 | normal hurtE의 parry_lesson_active callback/ENEMY v5 미등록. 기존 typed4 map은 그대로4. 다른21/full25/full_hurtE/sourceclock/게임 준비를 이 API로 승격하지 않는다. |

## 정확 조회와 반환

| 순서/상태 | 계약 |
|---|---|
| 입구 | 기존 epoch/authority/current/declared publisher/WeakRef를 지역 변수로 읽는다. MISSING은 NOT_READY/active생략. |
| 선언 publisher 수명 | _owner_declared=false는 정상 optional 상태다. 선언한 weak publisher가 유실되면 CURRENT와 명시 witness 모두 publisher_owner_freed/NOT_READY다. ROOT 최신 지시에 따라 witness보다 먼저 검사한다. 기존 regen reader 본문은 바꾸지 않는다. |
| 명시 witness | SOURCE_PROPERTY_UNCREATED/UNSET는 READY active=false/known_absent=true. SOURCE_PROPERTY_FALSY는 기존 recognized 타입 및 AFFIX.js_truthy가 실제 false인 published raw일 때만 READY active=false/known_absent=false. unknown을 witness로 만들지 않는다. |
| CURRENT | 실제 Dictionary 또는 유효 Object의 active 속성을 정확1회 읽는다. chapter 조회0. 읽은 뒤 기존 epoch/authority/current identity(is_same)/owner_declared/WeakRef identity와 publisher/current 생존을 확인한다. 기존 recognized 타입/AFFIX.js_truthy만 사용하며 별도 finite/문자열 coercion 정책 없음. |
| 현재 부재/falsy | 유효 현재 객체의 active 누락/null/false/0/NaN/빈String은 원 truthiness false이며 정상 비활성. 빈Array/Dictionary를 포함한 원 truthy는 활성. missing authority/current 불명과 구별한다. |
| READY | status=READY, ready=true, active=bool, known_absent=bool 및 원 authority/epoch/origin/source_phase와 source=parry_lesson_source.read_active_status. 읽기마다 새 결과만 반환하며 owner에 저장하지 않는다. |
| NOT_READY | status=NOT_READY, ready=false, reason 및 관측 entry authority/epoch/origin/source_phase/source. 최상위 active 키를 생략한다. 조회 중 context변경이면 current_epoch도 원 현재값으로 기록한다. false/0 fallback 없음. |
| Main context 변화 | actual_normal_lesson_owner_unbound / actual_normal_lesson_owner_changed / actual_normal_lesson_epoch_changed. 뒤 두 상태는 원 read_result Dictionary를 그대로 중첩 보존한다. 정상/원 NR은 원 결과를 그대로 반환한다. |
| 원자성 한계 | 기존 publication/revoke epoch 증가와 holder/owner identity·생존 경계만 검증한다. 기존 동일객체 setter는 epoch를 바꾸지 않으며 내부 다중필드 snapshot/lock/트랜잭션·임의 동시 private쓰기 원자성을 주장하지 않는다. |

| module reason | 조건 |
|---|---|
| authority_missing:<기존 reason> / authority_unknown | 명시 current/witness 권위 미확인 |
| publisher_owner_freed / publisher_owner_freed_during_active_read | 선언된 weak publisher 유실 |
| falsy_witness_unsupported / falsy_witness_not_falsy | published falsy raw의 지원 타입/원 truthiness 조건 불일치 |
| current_lesson_freed / current_lesson_unknown / current_lesson_freed_during_active_read | 실제 현재 참조/수명 불명 |
| active_read_context_changed | 기존 epoch/authority/current/declared-owner/WeakRef 정체성 변경 |
| active_value_unsupported_or_freed | 원 recognized 타입 밖 또는 freed active Object |
| explicit_inactive_witness / current_active | 명시 READY reason |

## 보존·검수

| 항목 | 결과와 한계 |
|---|---|
| 사전 보존 | 정확11경로(code2/docs9)×I/R22행, WORK/HEAD44슬롯=40copy+4absent. 개별복사 시각/ancestor nonlink/realpath/분리 INDEX·WORK를 첫코드 전에 저장. |
| 첫 수정 뒤 steering | ROOT가 선언된 weak publisher를 witness에도 적용하도록 확정. 첫 임시 reader 전체를 before-root-witness-owner-steering.gd로 보존하고 실제 신규 reader의 owner 검사 위치만 첫 검수 전에 이동했다. 당시검수0. optional owner는 계속 허용. |
| 최초 실행 | active-first/runner.gd의 fixture 함수 seed가 Godot 내장 seed(1arg)와 충돌해 parse 실패/exit0/result없음/기능0. PASS 아님. 첫 runner/두 raw log는 그대로 보존한다. |
| 실패 범위 수리 | active-fixture-name-repair 별도 namespace에서 fixture 함수/호출 이름만 prepare_fixture_publication_fields로 변경. 제품 변경0. 새49/FAIL0, exit0, stdio/Godot 양로그 ERROR/WARNING/leak0. 성공49/기존31·9·108/oldproof 재연0. first_whole_clean=false. |
| 실행 대상 | 실제 수정 SourceLesson script와 기존 static AFFIX truthiness. fresh 격리 fixture가 기존 publication 필드만 seed하며 원 publish/revoke/controller 본문을 호출하지 않는다. Main은 새 bridge+기존live guard 메서드 추출 fixture이고 실제 전체 Main은 아니다. 자연 publication/실제 현재 게임 owner 수명 통합은 미검증. |
| 새 경계 | missing/witness/falsy/truthy/NaN·Inf/unsupported·freed raw/current·optional/declared publisher·witness publisher유실, Object active1/chapter0, 재진입 epoch/authority/current/WeakRef 변경과 publisher free, Main holder교체/epoch변경/queued, 같은 Dictionary 값변경과 기존epoch 유지, 기존 counts 불변. |
| 계측 한계 | raw 결과의 old_protected_functions_called=0은 fixture가 선언한 호출 범위이며 protected-body 실행 추적 계측값이 아니다. 관측된 것은 active/chapter getter 수, 기존 counts 불변, 실제 결과/양로그다. 신규 경로의 직접 guard/eval/controller 호출 없음은 정적 대조로 기록한다. 보호 본문 instrumentation/열람/편집 없음. |
| 보호 범위 | _eval/기존 source module 본문과 기존 Main 메서드는 그대로 보존. regen/chapter/fireball finish의 이전 의미·검수 기록 변경0. 실제 GUI/server/API/save/original PNG·audio read/copy/import0. Q/E·BOSS·맵 변경0. |

새 실제 API를 ROOT가 인수한 뒤에만 기존 ENEMY에서 42111 parry_lesson_active의 typed ready/active/미준비 전파 계약을 최소 확장한다. 현재 V4의 bool(Dictionary) 직결은 금지하며 unknownfalse/가짜25READY로 진행하지 않는다.

외부 NORMAL-HURTE-LESSON-ACTIVE-OWNER-20261017의 prewrite-manifest, code-write-actions, steering backup/manifest, docs검색, active-first 원실패, active-fixture-name-repair 첫49 및 final receipt를 따른다. source body-read 과거hash 미기록을 이번 backup hash로 소급하지 않는다.


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


## 2026-10-17 play_time owner 소스 경계 현행

| 항목 | 상태 |
|---|---|
| 등록 | 실제 callback 12/25·미13, `play_time`은 el_mul 직후 동일 Services self의 arity0 Callable로 등록 |
| owner | Main/Services/State 신규4메서드와 Main Script weak witness 메타데이터1필드의 검증 WIP. `read_normal_enemy_play_time()` arity0, 첫 격리검수 인수됨 |
| 관측 | current native State `_g` literal `playTime` present 값 1회, pre/post 메타데이터 및 같은 G ref 확인. missing/unsupported/loss는 raw NOT_READY·top value 없음 |
| 한계 | 원JS clock·실게임 증가·V11/V12/Worldhook·main/R/실행판 반영 미확인/미인수. 당시 이전 단계 배너·숫자·QA는 이력으로 보존 |
| 상세 계약 | `docs/engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md`의 지원범위·이름·reason·raw ref/prefix 및 12/25 등록 상태를 기준으로 함 |

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | D9는 직전 공통 소스 인수이고 owner 브랜치 codex/native-play-time-owner-20261017의 이력은 보존한다. 이번 main/I/R 현재 소스 정렬은 통합 정본·receipt의 실제 HEAD·tree를 따른다. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |


## 2026-10-17 play_time main/I/R 소스 통합 체크포인트 — 현행

| 항목 | 현재 범위와 인수 한계 |
|---|---|
| 직전 인수 / 이번 소스 | 직전 공통 인수 D9(d9b886c). owner 실제 NUL diff42(code3/docs39)에 통합 정본1을 추가한 최종 범위는 실제 union NUL·tree 목록과 아래 receipt를 기준으로 확인. main/I/R의 실제 현재 HEAD·tree·branch·upstream 및 정렬 결과도 receipt 기준 |
| 코드·provider | 인수된 Main/Services/State 코드3 그대로, callback 12/25·미13. play_time은 el_mul 직후 동일 Services self·arity0, 새entry 생성의 값 query0만 확인. 기존 getter/준비 guard 전체 순수성은 인증하지 않음 |
| 값·실패·참조 | finite native int/float 부분지원·safe int ±9007199254740991·raw-0·원 type/ref/prefix·postloss read_result·NOT_READY 계약 그대로. dummy13/25 gate 우회·clock writer/default0 추가 없음 |
| 검수 분리 | 기존 owner34case477(설정163·행동314) 인수, 원17 중15통과2실패와 별도2true는 보존. V12 후보 원11case43행동true/setup signedzero1false·exit1 전체FAIL과 별도4case19행동+setup4 true의 한정 보완은 각각 유지. 원성공 검수·parse 재실행 없음 |
| 실제 실행·보류 | 이번은 소스 정렬이다. 사용자 열린 앱·compiled export·PC 실행·실제 Main/State clock·자연 전투·JS·최신 게임 인수는 미확인. V12 제품 copy·World hook·build/reload/import/PC 전달 없음 |
| 정본 / 증거 | [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) · [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
