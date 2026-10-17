# Normal lesson callback5 메인·R 소스 통합 (2026-10-17)

| 항목 | 현재 통합 계약 |
|---|---|
| fresh main | 7023c3815ce0de027fdfa766ab2bfa9996968ea0를 기대SHA로 정상 force=false FF만 수행한다. |
| 승인 소스 | local684d41c32ecfe1ba25d6e213022b5ceea5ca17a2 / remote232434f96df8c271c9816e22195ab65a507a82d0 / tree4b7bfc040671d8e0d54d0a958d31fc6a1819f0f4. code1/docs13, 원 local/remote WIP ref 보존. |
| 정확 scope | 새 구현코드0/통합문서2만 갱신. 전체 union16경로(code1/docs15). 승인된 기존14blob 재업로드0. |
| 실제 등록 | Services getter는 기존 typed4 뒤 parry_lesson_active 한 Callable을 추가한 map5/미연결20. 신규 wrapper read_normal_enemy_parry_lesson_active는 current actualMain.read_native_normal_enemy_lesson_status1회와 전후 ownership-only guard2를 사용한다. |
| 원 결과·수명 | context 유효 시 Main의 원Dictionary 그대로, context 손실 시 topNOT_READY/active생략/context_reason 및 원 read_result 보존. 새 domain5/OPT/chapter/controller 조회·state/epochcounter·scalarfalse없음. 기존4 helper/dispatch·원Main/SourceLesson본문불변. |
| 검수 이력 | callback-first 최초25/FAIL0/exit0/양로그0, 별도정적10PASS. 25는검사수이며25owner ready가아니다. 첫25뒤 Four→Five comment만수리했고원fullhash/실행메서드본문동일성을구별했다. 실제Service/Main 메서드+명시holder/provider/lessonAPI stand-in 범위로, wholeMain/configure/자연SourceLesson수명은미검증. |
| V5 독립 범위 | ROOT가 별도 source/parse 및 lesson 경계15case/행동64/setup7의첫결과를인수했다. synthetic enemy/owner에서42111 typedstop/raw보존만의결과이며 실제20owner/25ready/nativecaller를증명하지않는다. 이통합에서V5제품copy/등록0. |
| 새 사전 보존 | 16경로×I/R32행, WORK/HEAD64슬롯=58copy+6absent. 첫doc쓰기前개별copy시각/ancestor nonlink/realpath/분리INDEXWORK 저장. R은FF직전같은union만fresh보존하며foreignWIP/광범위untracked 조사0. |
| Git | 원232부모에통합문서commit→main 기대SHA/nonforce→I정상filteredfetch/새trackingbranch→R로컬I Git객체재사용/정상originfetch→merge --ff-only --no-overwrite-ignore. 기존promisor경고raw유지·config정리/원부재추정0·정확전송byte未. |
| 완료 검수 | 새변경16경로의I/R실제32파일과최종commitblob을새정적1회대조. old25/64/49/31/9/108/parse·원proof재연0. 최종pin/개별guards/결과는외부NORMAL-HURTE-LESSON-CALLBACK-MAIN-SYNC-20261017/final-receipt.json. |
| 남은 게임 연결 | 실제normal hurtE/kernel caller·미연결20 callback·전체25/sourceclock/effects/fullhurtE/latestfullgame 미완. 다음실kernel target/실caller/정확owner 근거를먼저고정하며dummy/noop/preflight우회금지. 실제opened/served/export/PC검증아님. GUI/server/API/save/원assets read/copy/import0. |

정확callback 계약과최초25의범위는 FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md를따른다. 정상Git소스정렬을최신전체게임 실행완료로표시하지않는다.


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

