# Native typed rand 소유 경계 — 2026-10-17

현행은 ENGINE WIP다. Main·Services·World의 실제 소유 경계 코드를 작성하고 신규 격리 검수30/30·정적 보존9/9를 최초1회 통과했다. **rand는 아직 map에 등록하지 않았으며 실제9/25·미16이다.** V9의 scalar _rand=float(_c(rand))에 Dictionary를 직접 전달하지 않는다. main/R/served·최신 전체 게임·실RNG 동등성 완료가 아니다.

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
