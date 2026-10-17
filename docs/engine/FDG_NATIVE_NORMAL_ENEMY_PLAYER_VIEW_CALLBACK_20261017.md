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
