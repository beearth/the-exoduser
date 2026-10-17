> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

# 일반 적 피해 p_dot_pool 실제 typed 소유자 — 2026-10-17

현재 소스 연결은 8/25 callback·미연결17이다. 기존 V6의 p_dot_pool scalar 호출에 이 Dictionary를 직접 바인딩하지 않았다. 실제 본편·최신 실행판·전체 hurtE 완료가 아니다.

| API / 위치 | 현행 계약 |
|---|---|
| Formula.p_dot_pool()->Dictionary | 인자0. 기존 _container("PASSIVES",_passives_reader,_passives_bound,"pDot") → 실패는 같은 소유자의 _fail → 정상은 _ok(1.0+_passive_or0_mul(actualDict,"pDot",0.05),source). 새 상태·clock·기본 owner 제조 없음. |
| 원식 / 출처 | 확인된 독립 원함수 pDotPool @game.html:28068: 1+(PASSIVES.pDot\|\|0)*.05. source label은 pDotPool()=1+(PASSIVES.pDot\|\|0)*.05@game.html:28068. 기존 모든 원 수식·Q/E body 불변. |
| Formula.is_passives_reader_bound_to(expected:Callable)->bool | 기존 bound/valid 플래그와 Callable equality/get_object/get_method만 검사. 실제 reader/configure/current_status 호출0, 새 필드0. |
| Passives.is_current_passives_reader_bound_to(expected:Callable)->bool | 같은 방식으로 실제 bound current reader와 bundle의 current_passives Callable 일치를 확인. 조회·저장·clock0. |
| Services.read_normal_enemy_dot_pool_multiplier()->Dictionary | 인자0. 기존 current Main/Services/Providers owner 검사→현재 bundle.formula/passives/current_passives 및 양쪽 공개 binding 검사→Formula.p_dot_pool 1회→owner/fresh bundle/동일 Formula·Passives·reader Callable와 각각의 Script/life 및 binding 재검사. |
| pre 실패 | status NOT_READY/provider p_dot_pool/기존 owner 오류 또는 actual_normal_enemy_p_dot_pool_owner_unbound 또는 actual_normal_enemy_p_dot_pool_binding_mismatch. numeric value 폴백 없음. |
| post 실패 | context loss: actual_normal_enemy_p_dot_pool_context_lost/context_reason; 객체·Script·Callable 교체: actual_normal_enemy_p_dot_pool_owner_changed; binding 교체: actual_normal_enemy_p_dot_pool_binding_changed. 모두 provider p_dot_pool/read_result 원 Dictionary를 보존하며 최상위 value를 만들지 않는다. |
| 정상 raw | 기존 Formula의 status/value/non_finite/source/undefined_reads/reason을 복제·필터·상태변환 없이 같은 Dictionary로 반환. SOURCE_THROW/NOT_READY 역시 소유권 안정 시 원형 유지. |
| 노출 순서 | eq_affix/u_eq/p_atk_mul/melee_ref/parry_lesson_active/player_view/stat_str/p_dot_pool. 기존7 뒤 실제 Callable 1개. 전체25 presence 조건 불변. |

## 값·상태 경계

| 입력 / 조건 | 원래 지원 의미와 현재 한계 |
|---|---|
| 유효 PASSIVES Dictionary의 pDot absent/null/false/0/-0/NaN/빈 문자열 | 원 필드 truthiness fallback으로 항0·결과1.0. owner 유실을 알려진 필드 부재로 바꾼 것이 아니다. guarded absence는 undefined_reads=[]를 유지한다. |
| true / 유한 숫자 n | true는 결과1.05, 숫자는1+n×0.05. |
| 비어 있지 않은 문자열 | 기존 js_to_number를 재사용. "2"는1.1, 공백 문자열은 숫자변환0으로1, "bad"는NaN 결과/non_finite=true. NaN을 임의0이나1로 바꾸지 않는다. |
| Infinity | truthy이며 결과 non-finite 그대로. 새 clamp·전역 finite 정책 없음. |
| Array / Dictionary / Object | 모두 truthy. 기존 제한된 ToNumber: 빈 배열0·단일 숫자 배열 숫자·복수/boolean 배열 NaN, plain Dictionary는NaN. custom JS valueOf/toString/accessor/throw와 모든 문자 grammar의 일반 동등성은 미검증이다. 새 JS 해석기를 만들지 않는다. |
| reader unbound / freed | 기존 _call_reader의 NOT_READY/PASSIVES_reader_unbound 또는 PASSIVES_reader_target_freed를 기존 _fail 형식으로 보존. |
| bound reader가 null 반환 | 기존 _container가 SOURCE_THROW/원 TypeError/value null로 처리. Passives.current_status의 NR reason이 read_current_passives().value에서 사라지는 기존 경로는 이번에 고치지 않았다. |
| 기타 부적형 container | 기존 _container의 NOT_READY/PASSIVES_unsupported_shape 유지. 실제 current Passives 모듈은 부적형 원 reader를 NR/value null로 반환하므로 이 경우도 바깥 Formula에는 SOURCE_THROW가 전달될 수 있다. |

## 조회·검수·후속

| 항목 | 실제 범위 |
|---|---|
| 실제 binding | Providers의 기존 SOURCE_CURRENT binding 유지. Passives.bind_combat_stat_formula는 setup에서 current_status 1회 조회 후 Formula에 같은 모듈 read_current_passives를 바인딩한다. metadata 검사 메서드는 추가 조회0. |
| raw identity | State owned PASSIVES → Readers/Providers → Passives.current_status.value → Formula container의 같은 참조. 이번은 State/Providers body 수정0. |
| 부수조회 | 실제 Providers readiness/getbundle/domain guard에는 raw_grit.current_container, State guard에는 resource readiness/parameters 검사 호출이 있다. 이번 명시 stand-in 검수로 이 내부 부수조회·동기화를0이라 주장하지 않는다. |
| 첫 신규 검사 | Godot4.7.2 headless 첫1회: 행동76/76, setup37/37 PASS, exit0/양로그 오류·leak0. 이전 통과 suite/parse 재실행0. |
| 실제 코드 범위 | 실제 Formula/Passives/Affix 코드와 실제 SOURCE_CURRENT binding을 사용. observer subclass가 실제 super.p_dot_pool을 호출해 원 raw를 기록. 정확 추출 Services와 명시적 Main/actor/holder/current-reader/Providers stand-in으로 검수. |
| 포함 경계 | 18개 값 case·raw 동일성/metadata/runtime1query, binding setup1query, map8·metadata 검사 query0, bound null의 원 SOURCE_THROW, pre owner/lost/stale binding의 query0, post context/객체/reader/Script/binding 교체의 NR와 read_result 보존. reader Script 교체 case는 교체 후 기존 counter field를 읽지 않아 그 case의 reader 카운터를 별도로 확정하지 않는다. |
| 미검증 | 실제 State getter/전체 Main configure·자연 publication/lifetime·실 HP/clock/gameplay·rawgrit/resource inner query·전체 JS coercion 도메인. metadata hooks는 명시적 fixture이며 실제 natural reentrancy 증명이 아니다. |
| 다음 consumer | 기존 V6의 p_dot_pool scalar 사용처는 전체4곳(170/173/566/570, 원42163/42164/42426/42429)이며 네 곳 모두 typed 소비가 아직 없다. 첫 접점은170/173이었다. 실제 API 인수 후 해당 원 lazy/query 위치·순서·raw/prefix/events/cursor를 보존하는 별도 후속이 필요하다. |
| 제품 한계 | unused V6 copy/가짜25 provider/실 kernel 등록/V6 Dict cast 없음. main/R 통합은 이 WIP 인수 후 별도이며 runtime/Web export/PC/실행판 교체0. latest_full_game=false/content_parity=INCOMPLETE, 기존 시각 RETOUCH 유지. |

아래 현행 문서의 과거7/18·6/19·5/20·4/21은 각 제출 시점 기록이다. 현재 source map은 이 문서의8/25·미17을 따른다. 이전 MAIN_SYNC의 pin·검사 결과는 바꾸지 않는다.


## p_dot_pool 전체 사용처 정정 — 2026-10-17

원래 확인한 첫 접점은170/173 두 곳이며, V6 전체 scalar 사용처는 아래 네 곳이다. 이전 전체2곳 표기는 범위 오류다. 코드/API/원식과 당시 검사 결과는 변경하지 않았다.

| V6 line / 원 위치 | 원래 lazy 조건과 조회 |
|---|---|
| 170 / 42163 · opts bleed | not DOT + opts.bleed truthy. bleed/시간/스택 write 후 min(10,이전스택+1)의 결과가10 미만일 때 p_dot_pool 독립 조회. |
| 173 / 42164 · opts poison | not DOT + opts.poison truthy. poison/시간/스택 write 후 결과 poisonStk가10 미만일 때 독립 조회. |
| 566 / 42426 · poisonDot 어픽스 | not DOT + 기존 typed eq_affix(poisonDot) 값>0. poison/poisonT=max(current,300)/스택 write 후 결과 poisonStk<10일 때 독립 조회. |
| 570 / 42429 · fireDot 어픽스 | not DOT + 기존 typed eq_affix(fireDot) 값>0. burnT=180/스택 write 후 결과 burnStk<10일 때 독립 조회. |

네 곳 모두 해당 pool에 p_dot_pool()×각 지점 당시의 dmg×0.10을 더한다. 어픽스 값은 양수 조건에 쓰이며 이 누적식에 추가로 곱하지 않는다. 앞뒤 단계의 dmg를 하나의 스냅샷으로 합치거나 조회를 캐시하지 않는다. 현 V6의 네 scalar 위치는 모두 typed 미전파이며, 같은 callback의 타입 전파를 네 곳 전체에 적용한 후 별도 인수해야 한다. 실제 kernel/V7 등록·Dict 직결·전체 hurtE 완료는 아직0이다.


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
| actual registry | 기존9/25·미16 유지, rand등록10은아직0. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.
