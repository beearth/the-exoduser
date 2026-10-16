# Native 악의구 World 소비자 — 2026-10-17

상태: I WIP. 실제 World 소유 registry/phase와 새 source 소비자를 연결했다. actual clock/hurtE·fieldmob·poison owner/실 renderer·delivery는 아직 미연결이며 현재 게임 발사 완료가 아니다.

| 항목 | 실제 code / source 계약 |
|---|---|
| source | canonical f8 game.html:35176–35629 player pProjs loop,17307–17362 pool,16512 _uEq. 외부 원 flight16628B SHA6d4a16f988ce91acab70ecc26e1f574b72e0f70653eb27ccfa16484c3ca52ab3를 자체 port_modules/fireball_flight_source/producer.gd로 동일 byte 복사 |
| 실제 연결 | 기존 Main startup: World store bind 다음 World consumer bind. World가 RefCounted consumer를 소유하고 기존 advance_native_birth_phase의 enemy births 직후 호출 |
| native 순서 | 기존 managed owner phase1 → 기존 enemy projectile1 → 기존 birth2 → 같은 birth2 body의 새 player consumer → 기존 HitFX3. 새 priority Node나 world clock 생성 없음 |
| clock 구별 | World.clock_updates는 같은 native phase 재진입 방지 token일 뿐 source gc_t/dt_sp가 아님. source sp/dt_sp는 World.read_native_source_player_projectile_context 공개 actual provider가 ready/native_epoch를 명시해야 함. 현재 API는 같은 Services owner에 연결했으나 frame-entry/body 미연결로 NR |
| 원 시간 근거 | PHYS_STEP=1000/60, render loop _dtSp=1 reset 및 특정 .04 override. update는 G.slowMo=0 뒤 (slowMo>0?.35:1)*_dtSp를 사용. 기존 fxdt를 source 시간으로 동치 처리하거나 fake1을 공급하지 않음 |
| gc_t | 실제 SourceState.read_current_g()._gcT int0..20을 읽음. key 부재/미확인은 NR. 새 counter 생성·World frame 대입·Q/E counter 쓰기 없음 |
| 실제 피해 owner | World.get_native_source_fireball_bindings()->{ready,owner,bindings,hit_set_key_kind}. owner는 실제 World child/current player·source_state·source_resources 일치 필수 |
| required7 | read_enemy/elem_mul/bump_malice_weak/hurt_enemy/hit_side_effects/hurt_field_mobs/apply_fireball_poison의 valid Callable 모두 해당 실제 owner에 결합. 현재 owner API 부재는 NR. native raw receive_damage로 hurtE를 대체하지 않음 |
| source Set key | hit_set_key_kind=godot_instance_id 명시 필수. 실제 Node handle은 World.query_native_enemies 그대로 전달하고 view Dictionary로 대체하지 않음. fieldmob adapter가 같은 Set key 계약을 제공하지 못하면 NR |
| 실제 독립 reader | Main.read_native_fireball_unique_values가 실제 현재 INV.equipped를 기존 SourceLessonScript.AFFIX.SLOT_NAMES 순서로 순회. 각 stat의 첫 JS-truthy item[stat] 원값을 반환, 없으면 source0. 합산/음수 clamp/type 강제변환 없음; holder/형식불명은 null→NR |
| unique4 | _uOrbPoisonBurst/_uVortexOrbPulse/_uPoiseOrbFracture/_uParryOrbEcho. 외부 producer의 미지원 nonzero/unknown guard는 원형 유지 |
| loop 조건 | source35176은 for(i=0;i<pProjs.length;i++), 길이를 매번 다시 읽음. 동기 append는 같은 pass에서 원 i로 처리. n을 사전 캡처하거나 다음 frame으로 이동하지 않음 |
| source slot | iteration 중 retire는 _live.erase를 하지 않고 원 slot 참조를 남김. survivor는 같은 Array에서 w 위치에 쓰고 끝에서만 resize(w). 실제 raw fields Dictionary 복사/초기화 없음 |
| HIT return | candidate release callback은 같은 fields 참조/횟수만 기록. callback 후 source producer는 events.append/return만 실행하며 추가 game callback/read 없음. 반환 직후 HIT_RELEASED만 실제 retire(recycle=true), 다음 packet/callback/borrow 전에 완료 |
| DEAD remove | DEAD_DISTANCE_EXPLODED/DEAD_WALL_EXPLODED는 source35278처럼 recycle=false. release+caller 이중 return 없음 |
| 즉시 재사용 | 같은 Packet/Dictionary가 HIT 반납→다음 callback에서 borrow/reset→publish될 수 있음. publish는 issued/borrowed phase를 확인하고 오래된 array slot 참조만으로 중복 live라 판정하지 않음 |
| iteration 밖 | 기존 retire가 즉시 erase하는 기존 동작 유지. 새 begin_native_iteration/finish_native_iteration으로 열려 있을 때만 source compaction 순서 적용 |
| partial | 이미 발생한 효과/fields 보존, 성공 retire/rollback 없음. partial·unknown·release mismatch packet은 consumer 내부 WeakRef metadata로 해당 step 재실행을 막으며 input fields/HP/새clock/공격cap을 쓰지 않음. 자동 resume/보상 정책 없음 |
| NR | source step 전 NR는 효과0·packet 유지. 같은 valid native epoch에서 중복 step 없음. 미지원 다른 projectile kind는 해당 owner를 위해 동일 ref로 보존하며 이번 소비자는 갱신하지 않음 |
| 수명 | release Callable은 실제 World Node를 통해 consumer의 동기 기록으로 전달. RefCounted consumer→flight→Callable(consumer) 순환은 첫 runtime 전에 제거. 원 candidate 수리0 |
| 진단 | Main manifest fireball_world_consumer: 실제 mount/configured와 current readiness/missing/last 결과 분리. empty registry가 source clock/피해/VFX ready를 의미하지 않음 |
| 현재 미완 | World clock 공개 경로 연결/frame-entry·body 및 피해 owner 미연결→정확 NR. visual_bound=false/full_skill_complete=false, 기존 Main.native_fireball_delivery unbound 유지. gx는 Services 실제 source-global current getter 연결. actual hp/geometry/render/원 asset/전체 게임 검증 아님 |
| 새 검수 | 실제 store·consumer·원 source producer + 신규 World/Main fragments의 새 slot/즉시 reuse/append/Node배선 경계 첫31중30PASS, 실패1만교정1PASS 및 새혼합4PASS. 과거31/3/8·32/6·원flight26/identity7 suite 재연0 |

prewrite-manifest의 exact code5/docs7 총12path, I/R WORK/HEAD48행(실copy28/부재20), 부모별 realpath/nonlink 및 신규 namespace를 첫 쓰기 전 기록했다. 원58b ref를 보존하고 codex/mac-fireball-world-flight-20261017에서 작업한다. 신규 module parent 부재는 가장 가까운 기존 real parent와 부재 component를 구분해 기록했다.

| 새 검수(2026-10-17) | 실제 관측 / 한계 |
|---|---|
| 첫 실행 |31중30PASS·순서 spy assertion1FAIL, exit1. parse/runtime ERROR/WARNING0. getter snapshot이 사전 clock spy를 기록했는데 trace[0]을 실제 phase 시작으로 오판한 fixture 기대 오류 |
| 실패1 전용 교정 | 제품/원31runner/result 불변. preflight trace와 actual birth boundary를 분리해1/1PASS. 동일 혼합 pass의 필수 설정은 수행했으나 기존30 assertion 재검증/재계수0 |
| 새 혼합4 | 같은 pass DEAD_DISTANCE/FLYING/HIT 순서·동일Array w-compaction/단일survivor·DEAD nonrecycle/HIT recycle·release 요청2~실retire2 사이 game callback0 모두PASS |
| source 독립 대조 | 원 _uEq 및 실제 SLOT_NAMES17과 native 순서 동일, negative 첫truthy·0/false 이후값·emptyObject identity·부재0 확인. 기존 affix suite 재연 아님 |
| 첫30 범위 | actual store/consumer/원flight 및 신규 Main/World 조각에서 sameObject return→borrow→publish/동적 append slot0·1·2/slot1 homing, same Node direct HP변경→폭발 cache1, partial 이후 재step0, source .25/.04와 fx99 분리, missing clock/owner/Set 계약·pause/outside retire 관측 |
| source / 입력 domain | 실제 Node handle만 query→producer에 유지, read_enemy view Dict는 별개. 원 Dict carrier 실패를 수정/완료로 덮지 않음. clock/damage/fieldmob/map/player/state는 fixture이며 실제 owner body/공간/HP/스프라이트/scene·원 asset 검증 아님 |
| 종료 | 새1/4 각각 exit0·stdio+Godot log ERROR/WARNING0. namespace FDG_ENGINE_FIREBALL_WORLD_FIXTURE_20261017_6C28 일치, 사용자 데이터 내용조회/cleanup0·완전 save 격리 독립증명 아님 |
| 한계 보존 | 첫 기대 오류·원31로그 때문에 wholeClean=false. candidate6d4 원형/외부26·identity7/기존pool·finish suite 재연0. 실제 GDScript owner throw 주입/소스 예외전파 동등성은 검수하지 않음 |
| 현재 실제 제품 | World clock context 공개 경로는 Services까지 연결됐으나 frame-entry/body 미연결로 NR; hurtE·fieldmob·poison owner는 미연결, native fxdt를 대체값으로 쓰지 않아 NR. renderer/delivery는未, gx는 Services current getter 연결이며 최신 전체게임/실제 발사 완료가 아님 |

## Source sample globals 후속 연결 — 2026-10-17

현재 gx 권위는 native_source_sample_globals.gd를 실제 초기화 Services가 명시 boot 1회 소유한 current getter다. Main sample 소비자가 이 경로를 사용한다. 투사체 delivery/실제 발사·원음 loader·source clock/hurtE 미완은 유지한다. 첫 fixture parse 실패와 수리 후 새16 PASS의 정확 범위·수명/현재값 한계는 FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md를 따른다. 이전 검사 당시 gx 대역/미연결 이력은 현재 완료 증거로 재사용하지 않는다.

## Source clock declaration/input authority 연결 — 2026-10-17

World.read_native_source_player_projectile_context→같은 Main/현재 Services의 신규 실제 경로를 추가했다. 실제 clock context는 frame-entry/body 未로 NR이며 dt_sp 선언1 또는 입력 수락을 gameplay sp로 사용하지 않는다. 정확 API·새16 검수/원검사 재연0/수명·scope extension은 FDG_NATIVE_SOURCE_CLOCK_INPUT_AUTHORITY_20261017.md를 따른다.
