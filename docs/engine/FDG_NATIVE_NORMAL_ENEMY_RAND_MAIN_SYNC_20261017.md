> 2026-10-17 현행 normal hurtE provider: I 별도 브랜치 codex/native-play-time-owner-20261017에서 callback **12/25·미13**, play_time은 el_mul 직후 동일 Services self의 arity0 Callable로 등록됐다. main/R 마지막 공통 소스는 D9이며 최신 실행 게임·자연 clock 인수는 미확인이다. 아래 이전 단계 등록 숫자와 검수 기록은 해당 시점의 이력이다.

# Typed rand main 디스크 소스 통합 — 2026-10-17

인수된 owner+등록10 누적 소스를 main·I·R에 정렬하는 계약이다. 실제 최종 HEAD/tree/parent/branch/upstream·파일 OID/SHA·적용 순서는 이 단위의 final-sync-receipt.json에 기록한다. 디스크 소스 정렬은 열린 게임·프로세스·export·PC 또는 최신 전체 게임 완료 증거가 아니다.

| 항목 | 정확한 기준 |
|---|---|
| 원 main | 3ccb310cfed339eeb3bcbedebd551c37a2993202. ref mutation 직전에 실제 원격 main을 확인하고 expectedSHA/force=false 정상 FF만 허용한다. |
| 인수 WIP | 89992841a14bc87ec2e82410263eb970b9dff1f2, tree383085826f4cf11be2534a756c91a2fa39a600cd, parent4ba746838dc194da0442a2012a94defbfecf315b. |
| 원 local | c2fb8960e5258e23fdeb3cb4e0f5277a6aa9b614 parentbf524a85a7f87630d505899d4fd91b89b92ef27f. remote899와tree는같고부모SHA가다르다. 원c2/bf/899/4ba/3ccb 및 기존W/R refs를보존한다. |
| 통합 범위 | 인수33(code3/docs30)+통합docs2 중기존PC문서1중복=최종union34(code3/docs31). 새구현0, 새Gitblob은통합docs2만. |
| 원33 보존 구별 | accepted899 tree의33 OID/size가인수cache와일치해야한다. 최종파일은인수33개중PC문서1개만통합append로달라지므로32개는OID/size그대로, PC는이전전체bytes를prefix로보존하고새통합문서1개를추가한다. |
| callback | 실제10/25·미15. eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. rand는같은Services read_normal_enemy_random_unit()->Dictionary 인자0. |
| legacy/shared | sample_native_random_unit()->float 선언0/required0. 동일World private한곳에기존counter+=1→float(randi())/4294967296.0 한벌, legacy(null)/typed(freshreceipt)가각호출단1회공유한다. optionalpublicarg안미채택·새PRNG/seed/state/cache/epoch0. |
| typed 소유/출력 | metadata-only currentMain/Services/World·Script/parents/liveTree. Services percall output witness, 실제계산뒤completion. 유효0 READY0·preloss NONE/query0·marker부재 UNKNOWN·postloss/rawreceipt/read_result·소비prefix보존. retry/rollback/fallback0. |
| 부분 지원 | 정상공식primitive의float[0,1)·완료·전후소유에대한새경계지원. unexpectedraw는UNSUPPORTED/raw보존. 상태counter와RNGstream소유별개·silentinnerfailure0·원Math.random/stream·실binary/실RNG동등미증명. |
| 기인수 검사 | owner단위정적9/첫격리30 PASS, 등록delta static7(runtime0) 인수. 이번통합에서30/41/95·원7/9·진단/행동/parse를재연하지않는다. |
| 새 경계 | 통합static단1회: base accepted33 OID/size, 통합delta2/wholeunion34, code3불변·legacy0/shared1은기인수metadata보존, I/R union실파일OID/SHA·scopedINDEXWORK·refs/upstream/기록시각만대조한다. |
| 이력 | 이전WIP의9·미등록·당시main/R미반영문구와원FAIL/scope한계/API팩은해당당시기록이다. 최신disk checkpoint는이통합문서와finalreceipt를따르며새성공으로과거wholeclean을소급하지않는다. |
| 적용/경고 | I/R exactunion의freshWORKHEAD·분리INDEXWORK·file/parent/ancestorrealpath/nonlink·각copyUTC→PRE→쓰기/FF. 상속promisor/config경고는보존·정리0, 미측정networkbytes NOT_RECORDED. |
| 비실행 범위 | GUI/browser/Godotinput/reload/restart/GET/server/save/assets/import/export0. V9scalarDict직결·producer제품copy·Worldhook·15dummy/25presence우회0. source정렬로실productcaller/fullhurtE/fullgame/PC완료를주장하지않는다. |

정확한 지원·검수 대역 한계는 [typed rand owner](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)를 따른다.

최종 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-RAND-MAIN-SOURCE-SYNC-20261017/final-sync-receipt.json


## 2026-10-17 normal hurtE el_mul 11번째 provider 등록 이력 (당시 단계; 현행은 아래 12번째 등록 표)

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 당시 등록11 단계 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표와 이 등록11 표는 해당 당시 단계 이력이다. 현재12/미13은 아래 최신 등록 표를 따른다. |
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



## 2026-10-17 play_time 등록12 — 현재 소스와 검수 범위

| id / 항목 | 현재 계약 및 확인 범위 |
|---|---|
| 필수 provider 등록 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 연결 수 |
| play_time / target / arity / 순서 | Services.get_normal_enemy_damage_provider_callbacks에 play_time: Callable(self, "read_normal_enemy_play_time") / 인자0 / 기존11 key 순서 그대로 el_mul 바로 뒤 한 entry. entry 생성 자체의 값 query0만 확인하며 기존 getter·준비 guard 전체의 순수성은 주장하지 않음 |
| owner 부분지원·실패·참조 | 기존 finite native int/float 및 safe int ±9007199254740991 부분지원 유지. raw-0·원 type/ref/prefix·postloss read_result 보존, missing/unsupported/loss는 top value 없는 NOT_READY. clock writer/setter/default0 추가 없음 |
| owner 기존 검수 | 첫 격리34case477확인(설정163·행동314) ROOT 인수 유지. 원정적17 중15통과2실패 wholefalse 및 별도2true는 서로 다른 증거이며 소급 전체PASS 합산 없음. 이번 문서 보완에서 재실행하지 않음 |
| V12 후보 / 원실패 | source3+첫parse2 ROOT 인수. 원11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL 보존. +0 의도 B2 실제 -0 및 runner 제어 한계는 해당 첫 실행의 기록 |
| V12 별도 보완 | 별도4case19행동+setup4 true·exit0는 첫actual+0와 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 첫FAIL과 소급 합산 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님 |
| source / runtime 구분 | main/R 마지막 공통 소스 D9, I 소유 브랜치는 별도. 실제 Main/State clock presence·증가·자연수명·원JS·실게임·PC 인수 미확인. V12 제품 copy·World hook·dummy13·required25 gate 우회 없음 |
| 이번 보완 | 이전32 한정 검색 누락을 새 허용 docs 검색으로 보완. 코드0·원 등록static10/owner477/V12 43·19/parse 재실행0. 명시 제외·바이너리·검색 불가 문서는 완료로 세지 않음 |
| 보존 | [문서 coverage 보완 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-REGISTRATION12-DOCS-COVERAGE-REPAIR-20261017/receipt.json>) |
