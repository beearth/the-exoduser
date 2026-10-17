# Native normal provider4 메인·R 소스 통합 (2026-10-17)

| 항목 | 계약 |
|---|---|
| main 사전값 | fresh GitHub main fe6e3ba74d4cdb169c69d0618130d719f3a0b9ac. 정상 expected SHA lease/forcefalse만 사용. |
| 채택 | 승인 WIP03e9f62a991e05e01de7e012d4b5cf80bb63d18b; local6f06006e 및 원 remote WIP ref 보존. |
| 변경 범위 | 구현 코드 추가0. 현재 문서8개만 갱신. 전체 main/R 소스 union15경로(code2/docs13). 이전13 blob 재업로드0. |
| 새 사전 보존 | 15경로×I/R30행, WORK/HEAD60슬롯=54copy+6absent. 각 copy시각/realpath/nonlink ancestor·분리 INDEX/WORK를 새 write 전에 기록. 과거 guard 기록 한계는 유지. |
| 정상 Git | source03에서 통합 문서 commit→main 정상 FF→I filtered fetch/새 tracking branch→R fresh union 재보존/로컬 I Git 객체 재사용/정상 origin fetch→merge --ff-only --no-overwrite-ignore. |
| 최종 검수 | 변경15경로의 I/R 실제 WORK bytes↔새 commit blobs 및 scoped INDEX/WORK를 새 정적검사1회. 기통과31/9/원108·105/old proof·parse·게임 실행 재연0. |
| 게임 상태 | normal hurtE/V4 caller·다른21 owner/source clock·효과 미연결. full25/full_hurtE/latest_full_game=false. 실제 열린/served 게임·PC/export·전체Main/configure 미검증. 서버/GUI/save/원 assets read/copy/import0. |

Git main/I/R 최종 동일 commit/tree와 새 정적검사 성공을 기록한 외부 final receipt로 소스 통합을 판정한다.


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

