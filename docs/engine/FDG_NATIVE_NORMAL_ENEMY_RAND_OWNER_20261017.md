> 2026-10-17 ENGINE WIP 현행: callback **10/25·미15**, 기존9 뒤 `rand` 인자0을 같은 Services reader로 등록했다. 아래 이전9·미등록 표시는 해당 이전 인수 단계의 이력이며, 현행 등록 상태는 이 배너와 마지막 등록 절을 따른다. main/R/served 반영·V9 scalar Dict직결·fullhurtE 완료는 아니다.

# Native typed rand 소유 경계 — 2026-10-17

현행은 ENGINE WIP다. Main·Services·World의 실제 소유 경계 코드를 작성하고 신규 격리 검수30/30·정적 보존9/9를 최초1회 통과했다. **현재 ENGINE WIP는 rand를 10번째로 등록해 실제10/25·미15이며, 같은 Services reader를 인자0으로 연결한다.** V9의 scalar _rand=float(_c(rand))에 Dictionary를 직접 전달하지 않는다. main/R/served·최신 전체 게임·실RNG 동등성 완료가 아니다.

| 파일/API | 정확한 서명·역할 |
|---|---|
| Main | is_native_source_rand_context_current(services:Variant,expected_world:Variant)->bool. 기존 actual Main/current Services/World·Script/parent metadata만 확인한다. |
| Services | is_native_main_random_bridge_current(main:Variant,expected_world:Variant)->bool. 기존 weak/current prefix와 State의 metadata-only owner predicate를 재사용하며 source dispatcher/holder Script·parent·live sameTree를 확인한다. |
| Services | read_normal_enemy_random_unit()->Dictionary. 인자0. 매호출 새 local receipt{} 하나를 만들고 World typed 경계를 단1회 호출한다. |
| Services private | _native_rand_failed_read(reason:String,receipt:Dictionary,read_result:Variant,explicit_pre_loss:bool=false)->Dictionary. 이미 관측된 raw receipt/result 참조를 유지하며 임의 value를 만들지 않는다. |
| World legacy | sample_native_random_unit()->float. 선언 인자0·required0을 유지한다. _sample_native_random_unit_with_receipt(null)을1회 호출해 같은 float를 반환한다. |
| World shared private | _sample_native_random_unit_with_receipt(completion_receipt:Variant)->float. 기존 counter+=1→동일 float(randi())/4294967296.0을 단한벌로 보유한다. 계산 완료 뒤에만 sample_result record를 쓰고 실제 값을 반환한다. |
| World typed | read_native_source_random_unit(main:Variant,services:Variant,completion_receipt:Variant)->Dictionary. receipt TYPE 먼저→empty→현재 소유 preguard→shared 구현1회→postguard→완료/지원범위를 확인한다. |

| 계약 | 현행 코드 |
|---|---|
| 기존 sampler arity | 계획의1optional/0required 변경안은 미채택했다. 기존0arg public은그대로이며 실제 연산이 private로 이동했으므로 원public body불변이라고 주장하지 않는다. 새 helper파일·PRNG·counter/seed/cache/epoch/shadow field0. |
| 원 연산/소유 | 기존 World 멤버 _native_random_draw_count += 1 이후 float(randi())/2^32. field805는명시type annotation 없음·initializer/현재값未조회. counter가World소유라는사실은underlying RNGstream/seed가World별소유라는증거가아니다. |
| 공식 primitive | Godot4.7 GlobalScope randi():int, 인자0, 정상 unsigned32bit 0..2^32-1. 정상반환에대해기존식은[0,1). 설치binary·실draw·primitive내부failure/errorchannel·원Math.random stream/seed동등은미검증이다. |
| 실제 callback | 향후 rand의args[]/arity0. V9:209/원42179 et==85&&!is_dot 이후 query, purpose/line은consumer ledger이지callbackarg가아니다. 모든입력의첫query/현재etype0의도달query가아니다. et85/type7채택0. |
| pure guard | 기존 _source_owner_error/is_source_context_ready/_native_main_service_live/get_provider_bundle/domain/OPT/INV/clock getter를 재사용하지 않는다. current weak refs·Script·parents·sameTree metadata만 검사, query간재귀/World 재호출0. |
| live 정책 | 새 enemy rand typed 경계는 live sameTree Main/World/Player/State/Resources를 요구한다. 기존 public scalar의 preTree starter경로를 live 제한으로 바꾸지 않는다. |
| receipt | Services가매호출만드는fresh local Dictionary. World는Dictionary TYPE·empty를먼저확인하고 sample_invoked=true를shared호출직전에쓴다. sample_result={completed:true,value:actualfloat}는실제계산뒤에만기록한다. persistent RNG state·cache·epoch가아니다. |
| freshness 한계 | World가검사하는것은구조적empty다. 매호출새identity는Services의local할당으로보장하는설계다. standalone World API가과거에사용됐으나빈채남은Dictionary의출처까지추적·인증한다고하지않는다. nonempty stale/prefilled marker는거부하고지우지않는다. |
| abort0 대 정상0 | scalar return0만으로성공판정0. completion이있고지원float0이면READY0, 없으면NR/UNKNOWN이며numericfallback·재draw·rollback·카운터현재값조회0. localreceipt가Services프레임에남아World typedwrapper의malformed/abort형return후에도관측sample을보존한다. |
| primitive 내부 한계 | primitive내부실패가정상모양0을반환하고caller가계속된다면witness로도정상0과구분할수없다. 지원은공식정상primitive계약범위다. 내부failure가없었다는무조건보증·원JS error동등으로승격하지않는다. |

| status/필드 | 현행 schema |
|---|---|
| READY | status,provider=rand,source=World.sample_native_random_unit/shared_operation,reason='',value=관측rawfloat,non_finite=false,sample_invoked=true,sample_completed=true,consumption=COMPLETED,completion_receipt/raw_result/raw_call_return. raw_result는receipt.sample_result와같은참조다. |
| 지원 predicate | completion.completed가정확bool true이고value키가있으며TYPE_FLOAT·finite·0.0 이상1.0 미만. 새경계의부분지원predicate이며clamp/전역finite/coercion정책이아니다. |
| UNSUPPORTED_OPERAND | 관측완료raw의type/도메인이위지원범위밖일때. actualrawrecord와receipt·scalar diagnostic 보존, top value키생략·샘플재호출0. |
| explicit preloss | NOT_READY, sample_invoked=false/sample_completed=false/consumption=NONE. 실제preguard/receipt거부로호출전임을아는경우만. |
| 완료 marker 부재 | NOT_READY/sampler_completion_unobserved. sample_completed/consumption=UNKNOWN. sample_invoked도marker가없으면UNKNOWN을유지하며false/0/NONE로정규화하지않는다. |
| postloss/불완전 typed return | NOT_READY. raw_result·Services receipt·read_result ref를유지하며관측완료면COMPLETED, 미관측이면UNKNOWN. ownerloss를READY 또는0으로덮지않고이미소비된prefix를되돌리지않는다. |
| sampler/result 원형 | legacy반환scalar는raw_call_return 진단용이며단독성공근거가아니다. top value는검증된READY에서만존재한다. World typed raw를Services가정상시그대로전달한다. |

| 첫 검수/한계 | 결과 |
|---|---|
| 신규 정적9 | 원Main/Services prefix, World의public위임외body보존, public0arity, sharedcounter/primitive식각1, 완료기록순서, rand미등록, fixtureadaptation범위 최초확인. old구조9/map9/41/95재연0. |
| 신규 행동30 | first-owned-fixture 첫1run/foreground60초guard/exit0/result존재/30PASS0FAIL. stdio·engine각109B·오류/경고/leak0. |
| 실제 추출/대역 | 새Main/Services/World method bodies. shared method는선언alias와randi leaf한곳만owned deterministic primitive로치환. typed World body는선언alias만, 외부fixture wrapper가default0/missing completion/typedmalformedreturn을모사한다. State metadata predicate/setup·holdership은대역이다. |
| 확인 범위 | 정상0/rawref·정상최대정수formula·percall freshreceipt·preloss0query·legacy0arg Callable/preTree·marker부재UNKNOWN·일부counterprefix·postdrawowner/Tree유실·typedwrappermalformedreturn뒤rawreceipt·TYPE先/stale거부·unsupportedraw보존. |
| 검증하지 않은 것 | 실제사용자RNG/현재counter·seed조회0, fullMain/World ready/configure/실State내부·자연actor/엔진abort동등·전체caller호환/stream/JS·full25/hurtE/게임/PC/성능미검증. fixturecounter/primitive계수는명시대역값이지실제World관측값이아니다. |
| 이력 보존 | LEQ/V9의원firstparse실패·firstwholefalse·과대selector/ROOTthread범위초과·미사용badPRE등이력은이새성공으로지우거나무접근·wholeclean으로소급하지않는다. |
| 배포 | local/GitHub WIP로만보존, 최종ROOT인수전main/R/served반영0. ENEMY새TASK/V9copy/hook/16dummy/25presence우회0. |

공식메타데이터는 [Godot4.7 GlobalScope randi](https://docs.godotengine.org/en/4.7/classes/class_%40globalscope.html#class-globalscope-method-randi)를가리키며이번unit에서원engineRNG본문·현재draw를읽은것은아니다.


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

