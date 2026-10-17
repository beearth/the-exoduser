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
