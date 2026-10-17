> 2026-10-17 ENGINE WIP 현행: callback **10/25·미15**, 기존9 뒤 `rand` 인자0을 같은 Services reader로 등록했다. 아래 이전9·미등록 표시는 해당 이전 인수 단계의 이력이며, 현행 등록 상태는 이 배너와 마지막 등록 절을 따른다. main/R/served 반영·V9 scalar Dict직결·fullhurtE 완료는 아니다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.


> 현재 콜백 계약 (2026-10-17): 실제 Services 공개 map은 기존 typed4 + `parry_lesson_active` = **5개**, 아직 미연결인 필수 callback은 **20개**다. 아래 이전 단위의 map4/미연결21 및 lesson callback 미등록 표기는 당시 source/검수 이력으로 보존한다. 실제 ENEMY V5/normal hurtE caller·전체25 ready는 아직 등록/완료가 아니다. 이번 연결의 범위는 `FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md`를 따른다.

# 일반 type0 몬스터 현재 필드 소유자 — 2026-10-17

| 구분 | 현재 구현 / 한계 |
|---|---|
| 범위 | Factory `consume_atomic`가 정상 생성하는 `ch1_initial_015 / order14 / etype0 / physical / flesh_crawler / elite0 / mods[]` 한 actor |
| 기반 | integration parent `39c619f88473d153e966e09e1a15da5a399cd320`; branch `codex/mac-normal-enemy-field-owner-20261017`. R/main/served/현재 사용자 창에 적용하지 않음 |
| 구현 | 실제 actor canonical 필드·fresh current read·World 소유 invocation의 원순서 field prefix 적용. 원 full `hurtE` 결정/입력 연결은 미완 |
| 준비 상태 | `CURRENT_TYPE0_FIELDS_PARTIAL`, `full_hurtE_ready=false`, `source_clock_ready=false`. 필드 `ready=true`는 전체 피해 처리 준비가 아님 |
| v3 입력 | ENEMY v3의 `events{seq,stream,index,line}` 및 `from/적용 receipt` 네 절대 cursor 계약만 소비. v3 producer byte 채택/`decide()` 자동 호출은 이번 범위 밖 |

## 원본과 실제 생성 경로

| 원본 / 현행 접점 | 확인한 내용 |
|---|---|
| R `game.html:31120,31163–31165` | `mkEn`의 `hp/mhp`, 원 `el`, `alive/stunned/kb`, `s='idle'`, `st2=30+Math.random()*50`; 실제 고정 record의 결과를 사용하며 factory/RNG를 다시 실행하지 않음 |
| R `14333` | `EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6}`. 현재 승인 actor는 physical0. 이름 배열 `physical/fire/ice/dark/lightning/holy/earth`는 동일 enum의 기존 native 이름 |
| R `38884/40502/41376–41382` | eligible update의 `st2-=sp`; idle 접촉 후 `40+trunc(U*20)`; normal recover 만료 후 idle/`15+U*15`. 원 어택 티켓/BOSS/타 type 특수 분기는 새 구현하지 않음 |
| R `42380–42383` | alert→non-DOT recover에서 idle/st2=0 또는 idle/st2>5이면5→hp 감소 순서. source update가 소유하는 sp/전체 clock은 미연결 |
| I Factory `consume_atomic` | `_is_flesh_target` exact record→`FLESH_SCRIPT.new()`→source-derived runtime `configure(...,World)`→World의 같은 `_enemies` Array/Node 등록. spawn record는 current view 대체물이 아님 |
| 원 source hash | 이 좁은 read 시점 새 hash는 `NOT_RECORDED`. 과거 후보의 hash를 이번 read hash로 소급하지 않음 |

## 단일 필드 권위

| source id | actor 현재 값 / 소비 | 초기값과 수명 |
|---|---|---|
| `st2` | 새 canonical `st2:float`; 실제 `_physics_process` idle/contact/recover와 기존 `receive_damage`가 같은 필드를 읽고 씀 | source runtime `native_final.st2=38.106732717715204`에서 초기화. 기존 `_contact_ticks`는 get/set alias 하나이며 별도 타이머가 아님. 상속 type7의 기존 spelling을 보존하지만 type7 source-field readiness를 새로 승인하지 않음 |
| `el` / `element` | canonical `el:int`; `element:String`은 enum 이름 get/set alias | configure에서 기존 이름과 source JSON numeric enum이 같은지 검사 후 exact int. JSON의 numeric0이 float로 파싱될 수 있어 숫자 형식만 허용하며 불일치/미상은 `-1` unavailable |
| `mhp` / `max_hp` | canonical `mhp`, `max_hp` get/set alias | `native_final.mhp=875`. `hp`와 분리된 실제 현재 최대 체력이며 spawn snapshot을 계속 읽지 않음 |
| `hp / state / alive / global_position / radius` | 기존 actor의 같은 실제 member | 새 actor shadow record·HP 강제 테스트 setter·새 전역 시계 없음 |
| shield / poise / hit fields | 기존 `eShield/eShieldMax/eRes`, `_stun_ticks`, `_hit_flash/_hit_stun`, `poise/max_poise/_poise_regen`, `_knockback` | current read로만 관측. 미이식 optional status 수명 전체를0/absent로 간주하지 않음 |

## 공개 소유자와 source prefix

| API / 위치 | 계약 |
|---|---|
| actor `read_native_source_damage_fields(World)` | exact configured actor·current same World/Tree·parent·registry identity 확인. 매 호출 새 view에 현재값을 투영. `CURRENT_TYPE0_FIELDS_PARTIAL`/미소유 목록 반환 |
| World `read_native_normal_enemy_damage_fields(enemy)` | 실제 `_enemies`의 같은 Node만 위 actor reader로 전달. dictionary view를 Node handle로 대체하지 않음 |
| World `begin_native_normal_enemy_field_call(enemy)` | current field owner가 있고 기존 deferred poise pending=0일 때만 새 invocation. 실제 source poise가 기존 지연 요청을 몰래 소비하지 않음 |
| World `is_native_normal_enemy_field_call_current(call,enemy)` | same invocation·same actor·현재 local stack top·fresh lifetime/registry. nested 호출 중 부모는 비활성, child 종료 후 부모 복귀. 새 공격 수 제한 없음 |
| World `end_native_normal_enemy_field_call(call)` | current top만 닫고 pop. 닫힌 token/actor 이탈 뒤 적용 거부 |
| invocation `consume_prefix(packet)` | 세 stream 배열과 `events`, 4 TYPE_INT `from`이 현재 cursor와 정확히 일치해야 함. append ordinal 순서로 같은 Dictionary item을 actor에 전달; line 정렬/스킵0 |
| actor `commit_native_source_damage_field(call,item)` | active same World/current item identity와 아래 source-located write만 인정. 일반 amount 피해 API를 다시 부르지 않음 |
| 반환 | 성공 시 `ok/prefix_applied=true`, 실제 적용한 네 절대 `applied_prefix`, fresh `parent_fields`; 미소유/잘못된 입력 시 `ok/prefix_applied=false`와 정확 적용 cursor. 이미 적용한 prefix를 rollback/자동 재실행하지 않음 |

| field / source line | 적용 가능한 원 위치 / 값 |
|---|---|
| `eShield / 42347` | 현재 shield 이하의 유한 비음수 source 결과 |
| `_alerted / 42380` | literal bool true |
| `s / 42382` | 실제 recover→literal idle |
| `st2 / 42382` | 위 같은 invocation의 직전 recover→idle 뒤0, 또는 actual idle/st2>5에서5 |
| `hp / 42383` | 현재 HP 이하의 유한 source 결과. 원 kill entry 전 음수 HP prefix를 보존하며 death/보상/통지를 발명하지 않음 |
| `_hitFlash / 42394,42412` | 각각4 또는6 |
| `_hitStun / 42414` | 이 elite0 idle actor의8 |
| 기타 field / owner request / presentation | 정확 미소유 위치에서 중단. 특히 poison/freeze/poise/kill/펫/텍스트/SFX를 noop 성공으로 세지 않음 |

원 `receive_damage`는 기존 간이 피해 경로로 남는다. 새 source field writer는 이를 호출하지 않아 shield/HP/KB/poise 배율을 두 번 적용하지 않는다. 기존 deferred `receive_poise_damage`를 synchronous `_poiseHit`로 재사용하지 않는다. 원 KB의 사망 후 실행과 기존 alive-gated KB 차이도 연결 완료로 숨기지 않는다. 해당 source poise/KB/kill owner는 여전히 미소유다.

## 신규 검수와 한계

| 항목 | 실제 관측 |
|---|---|
| 새 검사 | 첫 **21/21 PASS**, process exit0. first stdout·Godot log 모두 ERROR/WARNING/ObjectDB/resource leak0. 수리·재실행0 |
| 실제 코드 범위 | actor actual configure/FSM/legacy damage/new field reader/writer + unchanged new invocation helper; fixture는 actor `_ready/_draw`만 억제하고 physical projectile dependency를 code-only 대역으로 둠. World는 실제 새5 method를 추출하고 나머지 서비스는 fixture |
| 확인 | 생성 필드/alias, actual idle st2 감소, hit-stun 동안 같은 st2 동결, current fresh view, shield overflow의 legacy 동일 필드, source prefix 적용 후 미소유 presentation에서 partial, stale cursor 재적용 거부, nested current-owner, pending-poise 거부, actor 이탈·잘못된 caller/필드/HP 증가/타입 거부 |
| recover / kill 한계 | recover 두 검사는 생성자 variant fixture이며 공개 정상 spawn의 자연 recover 진입 증거가 아님. kill은 source HP prefix만 적용되고 실제 kill 요청에서 중단됨을 확인 |
| 미실행 | v3 `decide()`/원37·24/29·Frame/prefix/옛 parse·전체 Main/원 asset/저장소/UI/실제 source acc clock/공용 RNG/VFX/실전 전투 미실행. 전체 게임·시각·성능·PC 최신 반영 PASS 아님 |
| 보존 | 최초8 paths I/R WORK+HEAD32 rows/24 copies + 분리 INDEX/WORK/UNTRACKED + 모든 조상 non-symlink → PRE manifest → code. 코드 후 검색 발견 관련7 docs는 own 쓰기 전 별도 extension28 copies. 최종15 paths 전체가 첫 code 전에 백업됐다는 주장은 하지 않음 |
| 사용량 | 시작 주간43% 관측, 일간UNKNOWN·공유 계정 소비. 종료 관측은 외부 receipt에 기록 |

외부 새 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-ENEMY-FIELD-OWNER-20261017/`의 prewrite/extension manifest, code/doc write log, post-code docs search, fixture/first.result.json, first.stdio.log/first.godot.log 및 local/remote preservation receipt. Git WIP 보존이 현재 게임 실행본 적용을 뜻하지 않는다.


## 2026-10-17 일반 type0 동기 poise 실제 owner 후속

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| exact actor / callback | `ch1_initial_015/order14/type0/physical`의 World current invocation→v3 `poise_hit(call)`42490→parent prefix→같은 실제 poise/regen/stun/max-stun→fresh view |
| nonbreak / break | source false 반환은 owner `ok=true/staggered=false`로 보존. break는 실제 core(poise0·stunned/maxStunned180) 적용 후 현재 `_uqScCtx`19985 미소유에서 partial/함수return未. parent4cursor와별도core적용을구분 |
| 수명 / 경계 | 기존 deferred pending 보존·재사용0. native 같은 stun/regen counter를 소비하나 source acc/regen 전체동등未; fullhurtE/source_clock_ready=false. unique/SFX/slowMo/14RNG/kill·다른 actor·Q/E/BOSS 연결완료 아님 |
| 새 영향 검수 | 첫새poise21 PASS/양로그clean→분기guard교정뒤새영향2 PASS/양로그clean. 앞field21·37/24/29·parse·수송 재연0; final전체suite단일재실행 증거아님 |
| 상세 정본 | [동기 포이즈 소유자](FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md). 이전 미소유/배송/검수 이력은 보존 |


## 2026-10-17 exact type0 source momentum owner 후속

| 항목 | 현재 구현 / 제한 |
|---|---|
| `enemy.kb_add / 42482` | 같은 World/current same-Node invocation/events순서로 producer의 계산된 `{x,y}` 증분을 actual `_knockback`에더하고 `owner_requests/events`각1증가. 피해/KB공식·배율·15cap·감쇠/clock 재계산0 |
| 수명 / 미완 | Node/World수명은검증하고새alivegate없음. `42483 offscreen_move_if_can_move`는정확NR, geometry/좌표실행0. fullhurtE/source_clock_ready=false, poise19985 tail·실전·현재실행본반영未 |
| 새 검수 | 첫type추론compile실패/기능검사0/exit0을PASS로세지않음→Vector2선언1줄수리→새KB15/15 PASS·양로그clean. 앞field21/poise21+2/37/24/29/parse/성공수송재연0 |
| 정본 | [일반 몬스터 KB 소유자](FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md). 앞 field/poise 및 배송/검수 이력을 보존하며 exact momentum 요청 범위만 갱신 |


## 일반 hurtE 실제 provider 4 Callable 접점 — 2026-10-17

| 변경 위치 | 현재 계약 |
|---|---|
| Main/Services | Main.get_native_normal_enemy_damage_provider_callbacks()는 현재 Services 소유 eq_affix/u_eq/p_atk_mul/melee_ref 네 Callable만 반환한다. 매조회 same Main/Services/actor/World/State/Resources/Providers 수명을 확인하고 기존 Main affix API 또는 current bundle의 원 Dictionary를 그대로 소비한다. 다섯 current domain/OPT eager 조회·scalar fallback·숫자 snapshot 없음. |
| 기존 context | _source_owner_error로 기존 ownership prefix만 추출하고 _context_error의 current_g→current_p→current_stats→current_passives→current_inventory→OPT 검사 순서를 유지한다. |
| 검증/미완 | 새 method-extraction/명시 holder·provider 대역 fixture 첫31/31 PASS/양로그0. 실제 전체 Main/configure/원 provider 수식·V4 caller·다른21 owner·전체 normal hurtE·게임/export/PC는 미검증/미연결이다. 후보 V4 첫108중3FAIL 이력은 별도 보존하며 제품 채택0. |

정확 API·raw status/metadata·수명 reason·검수 범위는 [FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md)를 따른다. 앞선 개별 단위의 당시 미연결/실패/검수 기록은 이력으로 유지한다.


## 실제 parry_lesson_active Callable 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| Services map | 기존 eq_affix/u_eq/p_atk_mul/melee_ref 순서 뒤 parry_lesson_active를 한 개 추가한5개. 값은 같은 Services 소유 Callable이며 `read_normal_enemy_parry_lesson_active()->Dictionary`를 가리킨다. 나머지20은 미연결이다. |
| 실제 조회 | 기존 ownership-only _normal_enemy_provider_error 통과→기존 actual Main.read_native_normal_enemy_lesson_status1회→같은 ownership prefix를 재확인한다. current5domain/OPT/chapter/guard/controller eager조회나 새원천/state 없음. 기존4 helper와 dispatch·query순서 불변. |
| 원 결과 | 정상 context면 READY/NR/지원 밖 metadata도 원 Main Dictionary reference 그대로. 조회 중 cohort 유실은 status NOT_READY/readyfalse/active생략 + actual_normal_enemy_lesson_context_lost/context_reason와 원 read_result를 보존한다. unknownfalse/scalar 변환 없음. |
| 새 검수 | 실제 새 Services/Main 메서드+명시 holder/provider/lesson API stand-in의 최초25/25PASS, exit0·양로그 ERROR/WARNING/leak0. map생성query0/다섯키순서/같은Service·lesson1회/미준비raw·전후Service/actor/World/SourceOwner교체·sourceMain교체/epoch/queued와raw중첩 보존. 25는 검사 수이며25owner ready가 아니다. |
| 검증 한계 | full Main/Services.configure/실제 SourceLesson publication/원수식/V5제품copy·caller·게임 미검증/미등록. old49/31/9/108/parse 재연0. 첫25 뒤 map설명 comment만 Four→Five로 바꿨으며 fixture 원hash는 당시값 유지·실행한 메서드본체는현재와정확대조한다. |

기존 단위의 실패·성공·원자료 시각과 자연publication 미검증 한계는 바꾸지 않는다. callback5 노출을 전체hurtE/최신게임 완료로 세지 않는다.


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


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.


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

