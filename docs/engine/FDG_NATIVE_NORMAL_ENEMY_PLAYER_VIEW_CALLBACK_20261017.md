> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.

# Normal hurtE player_view 실제 콜백 (2026-10-17)

| 항목 | 구현 |
|---|---|
| 코드 소유 | godot/scripts/native_source_player_initialization_services.gd 한파일. 기존State/Main/Providers본문 수정0. |
| map/API | 기존 eq_affix/u_eq/p_atk_mul/melee_ref/parry_lesson_active 뒤 player_view 1개추가. Callable(self,read_normal_enemy_player_view), 인자0/Variant. map6/필수미연결19. |
| wrapper | _normal_enemy_provider_error가비어있지않으면null/State호출0. 같은_state WeakRef의read_current_p를1회호출해current_p에보관하고같은prefix를재확인한다. valid면current_p그대로반환, postloss면null. |
| raw계약 | 기존공개State API의같은ownedP Dictionary 또는null만운반. readiness envelope·새status/reason정책·복사/filter/필드선별·optional0보충·숫자table/statealias·새clock환산없음. |
| 값의 원소유 | hp←actualPlayer.hp, mhp←max_hp, x/y←global_position, s←state 및기존Resource6 동기화는State기존공개getter 책임. wrapper는새actor/resource쓰기없음. source/native전체state·geometry parity를이연결로증명하지않는다. |
| 수명 | 기존현재Main/Services/actor/World/State/Resources/Providers ownership-only prefix만전후재사용. full_context_error/current5domains/OPT를추가조회하지않음. |
| 실패후보존 | getter호출중cohort가유실되면null이지만이미동기화된ownedP는그대로보존한다. Actor/Resource/P sync rollback/refund/재조회0. |
| V5 위치 | frozenV5의25presence·enemy-preflight뒤player_view preflight,42111lesson前. rawP에는hp/mhp/x/y/s 필수5와기존optional전체를보존한다. null은기존nonDictionary NR 계약에맡기며Dict모양의새미준비envelope로위장하지않음. |
| 커널 상태 | actualnormalV5/kernelcaller 미등록·제품copy0. World.get_native_source_fireball_bindings 요구hook은미구현이라는접점팩한계유지. partialenemyfields를fullknown으로승격하거나19dummy/noop/25preflight우회하지않음. |

## 사전 보존 및 새 검수

| 항목 | 증거/한계 |
|---|---|
| exact범위 | 16경로(code1/docs15)×I/R32행, WORK/HEAD64슬롯=60copy+4absent. firstcode前source/destinationancestor nonlink/realpath·분리INDEXWORK·개별copy시각과manifest저장. |
| 최초새검수 | player-view-first 최초26/FAIL0/exit0,stdio/Godot양로그 ERROR/WARNING/leak0. fixture수리/성공재연없음. old25/64/49/31/9/108/parse재연0. |
| 실제메서드/대역 | 변경Services wrapper/기존ownership helper와Main공개getter를정확추출. State.read_current_p와player/holder/provider는명시대역. State대역은필수5 sync와optionalP 참조보존만모사하며실제State본문/Resource6·fullMain/configure/자연publication을실행한증거가아님. |
| 새경계 | map6 순서/생성시P·다른domain조회0/동일Service; P reader1회/rawidentity·필수5·optionalidentity·새값·P교체/noenvelope/원null; preunconfigured/Service/State/Providers/Resources/dispatcher/World/player/ready손실은reader0; postService/World/State/Provider/actor이탈/Mainqueued는null·이미반영된ownedP보존; Mainfree뒤retainedcallback은reader0. |
| count 해석 | 26검수수/등록6/미연결19는서로다른수치다. 전체25ready/fullhurtE/게임완성은false. 실제SourceState/전체actor수명·source상태전수동등·240FPS/시각품질은미검증. |
| 보호/보존 | 기존5 callback·dispatch/ownership함수정확불변, 주석만Six로갱신. Statebody/보호controller·원RNG/clock/fullkill 조사·확대0. GUI/server/API/save/원PNG·audio read/copy/import0. W제품쓰기0. |

현재P/raw-null 계약과실caller/미구현hook의근거는 NORMAL-HURTE-PLAYER-VIEW-CONSUMER-CONTACT-20261017의ROOT인수팩을재사용한다. 새소스/문서개별pins·사전copy/시각/첫26/단1회정적·정상WIP는 NORMAL-HURTE-PLAYER-VIEW-CALLBACK-BINDING-20261017에보존한다.


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
| 다음 | V6 p_dot_pool scalar2 지점 typed 미지원·직결0. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.
