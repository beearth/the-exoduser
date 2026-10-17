> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


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
