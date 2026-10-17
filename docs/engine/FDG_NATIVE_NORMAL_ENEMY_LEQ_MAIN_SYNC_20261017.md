> 2026-10-17 ENGINE WIP 현행: callback **10/25·미15**, 기존9 뒤 `rand` 인자0을 같은 Services reader로 등록했다. 아래 이전9·미등록 표시는 해당 이전 인수 단계의 이력이며, 현행 등록 상태는 이 배너와 마지막 등록 절을 따른다. main/R/served 반영·V9 scalar Dict직결·fullhurtE 완료는 아니다.

# LEQ Main 디스크 소스 통합 — 2026-10-17

이 문서는 인수된 LEQ WIP의 정상 main·I·R 소스 정렬 계약이다. 실제 최종 HEAD/tree/branch/upstream과 적용 시각은 이 작업의 외부 final-sync-receipt.json 및 final-boundary-static.json에서 확인한다. 소스 정렬을 열린 게임 창·프로세스·export·PC 또는 최신 전체 게임 완료로 승격하지 않는다.

| 항목 | 정확한 범위 |
|---|---|
| 원 main 기준 | 71a246b8dfa3ebee21e1aedd6154442d20088d19, tree f1245b8ba6a82b761470720e46bad1993c7b5415. 통합 시작 때 원격 main을 새로 1회 확인했다. |
| 인수 WIP | GitHub e1564e9355c10a6501cf735ea609fed6ee1c0a73, parent71a246b8dfa3ebee21e1aedd6154442d20088d19, tree9b8eb2ebc75db166af659bda2d6c4f1f3437bfdd. |
| 보존 원본 | local52cbf8702966168156fab4f9bbe30f3b03771426, f83db0dc49090bfcee546d7c3aa73baabaa8d47d, 1c45217cd43ed05cc88902a79bf07e286080da50와 remotee156을 유지한다. local1c와remotee156은 tree가 같고 부모 SHA가 다르다. |
| 제품 파일 | 인수 code5+docs28=33개. 추가 통합 문서2개 중 기존 PC_MAC_GIT_SYNC가 이33에 포함되므로 전체 변경 경계는 union34개, code5+docs29다. 다른 팀/held/미인수 파일은 포함하지 않는다. |
| 현행 callback | 실제9/25·미16. eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq 순서와 같은 Services self Callable. 전체 hurtE 또는 전체 이식률9/25라는 뜻이 아니다. |
| l_eq 원계약 | actual Main별 최초 null 선언1회와 weak consumer. 첫 query에서 {}를 입력보다 먼저 설치하고17 slot·같은 actual State item 복원·첫 non-undefined/raw truthy를 유지한다. 같은 Main helper/actor 교체시 cache 유지, 옛 caller/Main 유실 거부. reset/restore/new-run 정책 추가0. |
| 검수 인수 범위 | 첫 whole fixture parse 실패·행동0·exit0/result없음 보존, first_whole_clean=false. header5줄만 고친 별도 namespace의 미실행 행동 최초1run41/41 PASS. 실제 map 추가분 static9/9(runtime0), 기존 구조9와 구분한다. 이번 통합에서 성공 suite/진단/parse 재실행0. |
| 부수조회 구별 | 새 cachehit의 metadata-only guard와 새 Callable literal 추가분의 eager query0을 구분한다. 기존 Main/Services map readiness guard 전체의 내부query0은 미입증이다. |
| 남은 한계 | full Main/configure/실State current_error·resource 내부·원JS/sourceclock/restore·자연수명·ready뒤detach·실게임/PC/성능 미검증. wrong slot/item/special 음성 검수는 명시 private writewindow 합성이다. |
| 통합 방식 | 인수e156에서 통합 docs2만 변경. 새 Git blob도 통합 docs2만 작성하고 인수33의 성공 blob을 재업로드하지 않는다. main 갱신은 expected71·force=false인 정상 fast-forward로 제한한다. |
| WORK/HEAD 보존 | I/R union34의 분리 INDEX/WORK 확인과 fresh file·realparent·ancestor nonlink 검사, 각 WORK/HEAD backup 시각을 보존한 뒤 manifest를 저장하고 쓴다. R 갱신 직전 다시 같은 union만 fresh PRE로 보존한다. |
| 초기 백업 실패 | 첫 외부 백업 시도는 잘못된 absence4 가정으로 manifest 저장 전에 AssertionError가 났다. 제품/branch 쓰기0, 첫 백업파일 보존·과거 copy시각 소급0. 새 v2에서 원 R의 새 owner 문서 부재까지 포함하여136slot/130copy/6absence를 실제 다시 기록한 후에만 진행했다. |
| 경고/전송량 | 상속 promisor/config 경고는 raw 상태로 보존하고 설정을 정리하지 않는다. 네트워크·blob 전송량 미측정값은 NOT_RECORDED이며0으로 주장하지 않는다. |
| 실행 범위 | GUI/input/reload/restart/GET/server/assets/save/import/export0. runtime 질문6 및 별도 HOLD는 유지한다. |

상세 실제 API와 부분 지원 경계는 [Main 전설 장비 캐시](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)를 따른다.

- I: /Users/fordeargamers/.codex/worktrees/sync-git-main-20261016/the-exoduser
- R: /Users/fordeargamers/Projects/exoduser-migration-20261001
- 최종 적용 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-LEQ-MAIN-SOURCE-SYNC-20261017/final-sync-receipt.json


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

