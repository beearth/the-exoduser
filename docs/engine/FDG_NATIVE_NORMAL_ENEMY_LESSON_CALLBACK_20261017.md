
> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.

# Normal hurtE lesson callback 실제 연결 (2026-10-17)

| 항목 | 구현 |
|---|---|
| 코드 소유 | godot/scripts/native_source_player_initialization_services.gd 한 파일. 기존 Main API와 SourceLesson reader는 수정하지 않는다. |
| 공개 callback | map key parry_lesson_active → Callable(self, read_normal_enemy_parry_lesson_active), 인자0/반환Dictionary. 기존4 뒤에 추가하여 map5/미연결20. Main의 기존 공개 getter가 Services map을 그대로 소비한다. |
| 직접 연결 | 같은 실제 Main/Services/context를 기존 _normal_enemy_provider_error로 검사한 뒤 Main.read_native_normal_enemy_lesson_status() 정확1회. 이 API의 원 source authority/epoch/ready/active/reason/read_result metadata를 계산·정규화하지 않는다. |
| 사후 수명 | active getter 재진입 중 Main의 Services/World/source-owner가 교체될 수 있으므로 기존 ownership-only guard를 한 번 더 검사한다. domain/OPT 사전조회 및 chapter/controller 호출 없음. 다른4의 기존 gate/dispatch/query 본문은 변경하지 않는다. |
| 사전 유실 | 기존 {status:NOT_READY,reason:<원owner error>,provider:parry_lesson_active}; ready가 없어도 topstatus 미준비이며 activefalse를 추가하지 않는다. Main API 호출0. |
| 사후 유실 | {status:NOT_READY,ready:false,reason:actual_normal_enemy_lesson_context_lost,context_reason:<원owner error>,provider:parry_lesson_active,read_result:<원Main Dictionary>}. active는생략, 원readyactive를 raw안에보존하며 성공으로 승격하지 않는다. |
| 유효 context | Main 결과 Dictionary identity 그대로 반환. 수식/원truthiness/새field/epochcounter/cache/producer 생성 없음. |
| 등록과 실행 | 5 actual Callable 노출까지 구현. 실제 normal hurtE caller/외부 V5제품copy·등록은 아직없다. 나머지20/전체25/sourceclock/효과/fullhurtE/latestfullgame 미준비 유지. |

## 보존과 새 영향 검수

| 항목 | 기록 |
|---|---|
| 사전 scope | 정확14경로(code1/docs13)×I/R28행, WORK/HEAD56슬롯=52copy+4absent. ancestor nonlink/realpath·분리INDEX/WORK와각copy시각을 첫코드 전에 저장했다. |
| 최초 새 검수 | callback-first의첫25/FAIL0/exit0, stdio/Godot 양로그 ERROR/WARNING/leak0. 첫실행만이며 old49/31/9/108/기존suite·parse를 재연하지 않는다. |
| 실제 메서드 | 새 Services wrapper와기존5map/ownership/read-free helper, 실제 Main callback getter/lesson-status bridge를 정확추출해실행. State/Resources/Providers/lesson API는명시stand-in. fullMain/Services.configure/자연publication이나SourceLesson old49실행이아니다. |
| 조회 검증 | map생성시query0, keys기존4→lesson1 순서, 모든Callable owner같은Services, lessonMainAPI1회/다른provider·domain eager0, EQ→lesson→UE의명시호출순서 유지. |
| 전파 경계 | inactive/active/knownabsent/NR/지원밖rawstatus metadata identity, pre loss(unconfigured/Service/SourceOwner fields)/post loss(Service/World/Provider readiness), Mainholder/epoch/queued 및free뒤retainedcallback 거절. 원read_result 중첩identity보존. |
| comment-only | 첫25뒤 설명주석 Four typed inputs→Five typed callbacks 수정. 수정전code와hash·manifest 보존. 제품논리0, 성공25 재실행0. 최초fixture 전체source hash는당시값이며 현code로소급하지않고정확실행method본문동일성을별도정적확인한다. |
| 독립 V5 | 외부source/parse와lesson 경계QA는별도ROOT 인수대상이다. 그성공/보고를본단위실제25owner·완전hurtE·nativecaller증거로사용하지않고 V5제품copy0 유지한다. |
| 기존 보존 | 기존4 helper/dispatch·ownership 함수와actualMain/SourceLesson본문 불변. 새state/epochcounter·원Rbody·chapter/QEcontroller/protectedcallee조사0. GUI/server/API/save/원media read/copy/import0. |

상세경로/개별pins/사전보존/쓰기시각/첫25/단1회정적·정상WIP Git metadata는 NORMAL-HURTE-LESSON-CALLBACK-BINDING-20261017에 보존한다. 이 소스변경을 전체게임 최신 실행본으로 표시하지 않는다.


## 실제 player_view rawP 콜백 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| 등록/API | 기존5 순서뒤 player_view → Callable(currentServices,read_normal_enemy_player_view), 인자0/Variant. map6·미연결19. Main의 기존 getter delegation은 불변이다. |
| 실제 조회 | 기존 ownership-only prefix→같은 actualState.read_current_p1회→동일prefix. 유효하면원ownedP reference 그대로, 원null 또는pre/post context유실이면null. 새status/envelope/복사/filter/optional필드·기본0추가없음. |
| sync/수명 | State 기존getter가ownedP의hp/mhp/x/y/s 및기존다른필드를동기화한다는공개계약을소비한다. Actor/Resource를새로쓰지않는다. post loss 전에이미적용된ownedP sync를rollback/환불하지않는다. 다른domain/OPT/chapter/clock선조회없음. |
| 새 검수 | 실제Services wrapper/Main getter메서드+명시State/public-P sync·holder/provider 대역의첫26/26PASS,exit0·양로그 ERROR/WARNING/leak0. map0query/6키·같은Services/P1query/sameP와optional identity·freshP/원null·전후교체/보존된sync·Main유실을확인. 기존State본문·fullconfigure·자연runtime은검증하지않았다. |
| 미완 | 기존5/ownership본문불변. old25/64/49/31/9/108/parse·성공proof 재연0. V5/unusedkernelcopy·실caller·19dummy·25presence우회0. full25/fullhurtE/latestfullfalse/실게임·PC/export未 유지. |

이전 각단위의수송/시각/원실패·stand-in검수한계를소급하지않는다. 26은새검사수이며엔진전체완료율/25owner준비가아니다.
