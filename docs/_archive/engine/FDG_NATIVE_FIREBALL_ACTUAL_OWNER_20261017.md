# Native 악의구 actual-owner 연결 — 2026-10-17

상태: **I 작업본 구현·신규 검수 준비 중. R/공식 main 미반영. 전체 스킬/실표시 완료 아님.**
원본은 f8a8889846e53f5c063c24f469b080c8de415b6e의 game.html이다. fireball은 화염탄이 아니라 어둠속성 기본 마법 **악의구**다.

| 항목 | 실제 연결/권위 |
|---|---|
| 입력 | 원 BINDS.beam=mouse2. native_magic=MOUSE_BUTTON_RIGHT → 기존 Player 입력 held 저장 → 기존 물리 phase 끝의 native_fireball_phase_tick |
| 입력 우선권 | 기존 이동/LMB/Q/E 처리를 먼저 실행. 기존 Q/E gate/수치/피해·패링 코드를 변경하지 않음 |
| 기기 | 실제 받아들인 InputEventMouseButton만 magic_input_kind=keyboard_mouse를 기록. 미확인 입력은 gamepad reader null, 임의 false 복구 없음. 원 browser GP 복원/지원 아님 |
| 새 source | SKILL owner-v3 15518B, SHA256 0f1637c5f56874ba7bd3705ce46cd2bedbc0855410e0e2817d5c12fa8aa73437를 자체 경로에 원형 복사. 외부 v1/v2/v3 수정 없음 |
| 외부 QA | v3 첫 parse ERROR0, 계약23/23 및 세저장소 모형12/12. 실제 현재 Actor/Resource/SourceState 검증은 별도. 두 종료 harness의 ObjectDB warning 및 resource.cpp:822 ERROR 때문에 wholeClean=false, 원인 미확정 |
| P | SourceState.read_current_p의 실제 동일 Dictionary. s는 실제 Player.state, mp는 실제 ResourceAuthority 값으로 매번 동기화됨. 사본 P/state/mp로 대체하지 않음 |
| 소유 위임 | SourceState는 정확 fireball start/finish/recover에 한해 자기 현재 P를 실제 ResourceAuthority에 위임. owns_native_fireball_fields로 리소스/동일참조 확인. 임의 필드 쓰기·Q 비용 API 재사용 없음 |
| start 사전검증 | 실제 tree/parent/owner/holder/P identity, 현재 비용·속도, source entry와 실제 actor state, MP≥cost, 실제 finish delivery 준비. 거부 시 시전 관련 MP/state/emit 변화 없음 |
| start 원 순서 | Player.state 및 P.s=magicCast → P.st2=ToInt32(14/pMagicSpd) → P.atkArc=실제 facing.angle → before=실제 MP → MP=max(0,before-cost) → P._mpBon=(before-after)×2 |
| finish 사전검증 | 실제 magicCast/st2≤0/동일 raw _mpBon, 원 payload/샘플/회수값, 실제 준비된 unparented projectile 및 실제 source void sample dispatcher/current context. 준비 전 _mpBon 변경/emit 없음 |
| finish 원 순서 | payload 보너스 계산 완료 → _mpBon=0 → 실제 World에 projectile 추가 → magic 숙련도+5 및 fireball 호환 동기화 → source sample → Player.state/P.s=magicRecover → st2=12 |
| 숙련 | 원 fireball cat=magic, cd 없음→기본5초. 원 _catProf/ _skProf가 없을 때만 해당 Dictionary 설치. 지원하지 않는 기존 shape는 commit 전에 거부 |
| 샘플 | key fireball, volume0.8, _r(1,.08)=1+(U−.5)×2×.08. 기존 World.sample_native_random_unit을 원 caller 위치에서 소비한 뒤 실제 기존 queue에서 두 번째 jitter를 소비(원 gx volume skip이면 두 번째는 없음). sample stream 미로드는 drop이며 실제 dispatcher/current context/lesson 권위 준비와 구별 |
| 실패 정책 | MP만 쓰고 P-field callback이 실패하는 구조 없음. emit 뒤 rejectable P-field callback 없음. 환불·rollback·일반 transaction 계층 없음 |
| 현재 비용 reader | pMagicCost=max(.40,1−pMagic×.04−mpCostRed−uHelmMagic), mpCost('magic')=ToInt32(10×pMagicCost). _COST_SK에는 magic이 없어 fireballLv로 비용 스케일을 새로 곱하지 않음 |
| 현재 속도 reader | pMagicSpd=(2+pMagic×.08)×(1+castSpeed+headbandCastSpd). 기존 실제 affix/formula provider 사용, 누락/비유한 값은 null |
| 피해 reader | 기존 magic_ref 및 p_magic_mul(true), 기존 fuse_star와 skillBoost. cast-start에서 미리 피해 reference/cache를 조회하지 않음 |
| helmet | 실제 current INV 필요. 그 안 helmet 없음은 원 hm()의 {} 경로만 사용. 실제 inventory 부재를 빈 장비로 숨기지 않음 |
| clock | Player phase 끝에서 기존 World dt_sp/frame을 전달. SourceState st2만 그 phase에서 감소, 같은 frame 중복 감소 거부. 새 global clock/G.on/bootstrap 쓰기 없음 |
| hold 반복 | source magicRecover st2≤0에서 held/MP gate에 따라 다음 cast 또는 idle. 기존 native Q가 아직 새 recovery 상태를 받지 못하므로 해당 Q 분기는 DEFERRED_OTHER_OWNER로 남김 |
| delivery | Main.native_fireball_delivery가 실제 World 아래에서 현재 player/state/resources와 연결되고 projectile/current lesson/sample dispatcher가 준비돼야 true. sample_loaded와 loader_bound는 별도이며 미로드는 finish 실패 조건 아님. 현재 미연결이면 start부터 거부하여 빈 MP 소비 방지 |
| 시각 경계 | 원 char1 실버테일 sheet 또는 일반 magic orb sheet의 실제 준비 guard/원형 계약 필요. native 이미지 부재를 원 false flag로 위장하거나 적 sphere/proc로 대체하지 않음. 기존 arrow atlas 질문은 이 마법 이미지 승인 아님 |
| 미연결 | 실제 projectile 비행/성장/폭발/중독, 원 시각/트레일/샘플 준비, recovery Q, 타8 magic handler, GP/자동에임. 입력·owner 코드 연결은 전체 기능 완료 아님 |
| 변경 금지 | 기존 HP/ATK/poise/QE 수식·2_3 문서·HUD/rig/보호 renderer/LAVA·저장/API/사용자 창/PC 변경 없음 |
| 새 검수 | 실제 ResourceAuthority/SourceState 전체 코드 및 새 Main/Player 변경부·phase를 own fixture에서39개 PASS. 이후 entered-case 경계 변경의 새6개 PASS, 원39개 재연 없음. Actor/World/delivery는 fixture이며 전체 Main/원 에셋/GPU/실게임은 미실행 |
| 전체 판정 | latest_full_game=false. 시전 owner 준비·후보·fixture와 현재 게임 적용/시각 품질을 구별 |

과거 계획에서 finish 순서를 emit 후 _mpBon=0으로 적은 문구는 쓰기 전에 원33641~33646과 v3 contract에 맞춰 정정했다. 실제 코드 순서는 위 표대로 _mpBon=0이 먼저다.

## 원 payload·phase 및 신규 검수 기록

| 항목 | 현재 코드/확인 |
|---|---|
| payload | spawn=P+(cos,sin)×14; speed5.5/tick; el3; r12; maxDist400+(Lv−1)×50+(helmet.bonusRange 또는0)×20 |
| 크기/폭발 | scale=1+(Lv−1)×.50; _fbR0=12/_fbRMax=ToInt32(12×scale); explR=ToInt32(80×scale); explDmg=ToInt32(dmg×.6) |
| 피해 | ToInt32(magicRef×statInt1×pMagicMul(true)×(13.2+(Lv−1)×10.56×.5)×fuseMul)+(P._mpBon 또는0) |
| source phase | 기존 Player 물리 함수 진입 상태를 capture하여 새 signal의 세 번째 인자로 전달. recover/stagger case가 끝나 idle이 됐어도 같은 tick에 idle 입력을 두 번 평가하지 않음 |
| clock 증명 | start된 frame은 SourceState phase stamp를 기록하여 같은 frame st2 감소를 거부. 다음 genuine magicCast frame부터 기존 World dt만 소비 |
| hot path | 새 magic held도 없고 entered/current magic state도 아니면 Player가 새 signal을 보내지 않음 |
| 최초 신규 기능 검사 | 별도 actual Resource/State 코드 + exact Main/Player 변경부 + v3 source,39/39 PASS |
| 새 변경 영향 검사 | 별도 phase-entry fixture6/6 PASS. 원39 및 과거23/12/81/18 재연 없음 |
| 종료 로그 | 첫39 run은 WARNING 한 줄에서 ObjectDB3 instances leaked 보고, ERROR0. 원인 미확정이며 원제품 누수로 단정하지 않음. 새 phase6 run은 WARNING/ERROR0 |
| 준비 실패 | fixture method 추출 regex 과이스케이프 re.error로 Godot 실행 전에 실패. line-prefix 추출로 자기 fixture만 수정. firstWholeClean=false |
| test userdata | 사전 선언한 FDG_ENGINE_FIREBALL_OWNER_FIXTURE_20261017_7F06 경로와 runtime OS 출력이 일치. 해당 새 테스트 이름공간 metadata만 기록, 기존 실게임 save/다른 app_userdata 내용 조회·cleanup·HOME 변경 없음. 완전 userdata 격리 독립증명 아님 |
| 현재 delivery | actual projectile/current gx source context·sample dispatcher 연결 전이므로 R에 적용된 실제 플레이 스킬이 아님 |

## 실제 API/진단 이름

| 소유 | API/필드 |
|---|---|
| Main | get_native_fireball_bindings; read_native_fireball_p/held/gamepad_active/magic_cost/magic_speed/reference/magic_multiplier/fuse_multiplier/helmet |
| Main 동작 | apply_native_fireball_cast_start / apply_native_fireball_cast_finish / apply_native_fireball_recover_idle |
| Main delivery | native_fireball_delivery; read_native_fireball_delivery_readiness / prepare_native_fireball_delivery. 실제 player/source_state/source_resources와 World parent 일치 필요 |
| SourceState | owns_native_fireball_fields / apply_native_fireball_start / apply_native_fireball_finish / apply_native_fireball_recover_idle / advance_native_fireball_clock |
| ResourceAuthority | apply_native_fireball_start / apply_native_fireball_finish / apply_native_fireball_recover_idle / _native_fireball_context_error. 기존 _committing 재사용 |
| Player | native_magic action, _native_magic_input_kind, snapshot.magic_input_kind, native_fireball_phase_tick(ticks,frame,entered_state), 물리 진입 fireball_entered_state |
| phase | configure / advance_native / get_snapshot, WeakRef _main, source _cast, _last_frame=-1(미소비 sentinel), _last=NOT_READY 초기값 |
| SourceState phase | _native_fireball_last_phase_frame=-1(미소비 sentinel). start 성공 frame을 기록, World tick의 중복 소비 방지용이며 새 clock 아님 |
| 진단 | version manifest fireball_owner/fireball_delivery; primary.beam=mouse2, supported magic_held_deferred_owner_partial. producer_bound는 콜백 구성만 의미 |
| 상태 | CAST_STARTED/FIRED/RECOVER_IDLE/WAITING/REJECTED/DEFERRED_OTHER_OWNER/OWNER_REJECTED/NOT_READY. 새 phase는 비해당 entered-case에 DEFERRED_NATIVE_PHASE |
| payload 추가 | dist0, stagger0, kb0.005, kbMult0.1, magic=true, fireball=true. 원 flight/폭발/중독은 미연결 |
| 숫자 shape | 현재 native reader는 지원한 finite number/Dictionary만 소비. bool/string/비유한 스칼라 등 미지원 shape는 null/거부이며 중립수치 대체 없음 |

## World pool 후속 연결 — 2026-10-17

| 항목 | 현재 I 작업 범위 |
|---|---|
| 소유 | native_player_projectile_store.gd를 기존 Main startup에서 실제 World에 바인딩. 신규/reuse 차이와 현재 pierceFlat/PASSIVES reader 보존 |
| delivery | 기존 unbound guard 유지. pool/registry API 구현만으로 악의구 projectile/proficiency/sample 준비를 true로 변경하지 않음 |
| 상세 | FDG_NATIVE_PLAYER_PROJECTILE_STORE_20261017.md. 실제 비행·피해·시각·게임 실행 미검증 |

| World store 새 검수 보충 | 계약 |
|---|---|
| source hitSet | recycle은 원 if(p._hitSet)처럼 없음/null이면 clear skip. 다음 reset은 원 clear 위치에서 prefix를 보존한 reset_refused이며 affix/passive를 읽지 않음. 다른 native shape는 지원 미확인으로 거절 |
| 인수 | field 비교3 및 새 조건부/reset 경계8PASS. 첫34중31PASS와 별도 관측, wholeClean=false. 첫 fixture parse/저장 경로 불일치 보존. 상세 engine/FDG_NATIVE_PLAYER_PROJECTILE_STORE_20261017.md |

## 2026-10-17 악의구 finish void 소비자 후속

| 항목 | 현재 I 범위 |
|---|---|
| 숙련 | 실제 Main.source_lesson 공개 detail/reference의 active만 source JS truthy로 판별. 명시 active면 skip, inactive/known-absent면 실제 P magic+5 및 fireball 호환 동기화; unknown은 pre-emit NOT_READY |
| guard 구분 | detail.ready/value의 regen chapter guard를 숙련 active로 추정하지 않음. 보호 lesson/regen 수리 없음 |
| sample | 실제 기존 queue void front로 연결. caller _r(1,.08) 후 queue .92+U×.16, 원 gx volume skip이면 후자 없음. 신규 fireball stream 미로드 drop은 voice/cap eviction 전, finish/recover 계속 |
| 현재 미완 | actual projectile unbound, sample loader_bound=false. current _gxVolMul은 실제 Services 소유 source-global current getter로 연결. missing-provider fallback1/dummyAudio/noop-ready 없음, 실제 발사/가청/최신 전체 게임 완료 아님 |
| 원8키 | 기존8 stream 필수는 유지하되 추가 fireball key 허용. 정상8 queue/flush/voice 본체·RNG 순서 불변 |
| 상세 / 검수 | docs/engine/FDG_NATIVE_FIREBALL_FINISH_DISPATCH_20261017.md. 새 영향32/32 및 별도 lesson 경계6/6 PASS, 첫 fixture 들여쓰기 parse 실패 보존/wholeClean=false, 과거 통과 suite 재연0 |

| 새 검수(2026-10-17) | 관측과 한계 |
|---|---|
| first parse | fixture header space/source tab 혼합으로 preload 실패; --check-only로 확인 후 fixture 들여쓰기만 수리. 제품 변경0/첫 ERROR 로그 보존/wholeClean=false |
| 새 finish/queue | 변경된 실제 Main/Resource method fragments + 원 lesson 공개 module에서32/32 PASS. actor/state/backend/gx/current World RNG는 fixture. 기존8키 backend body는 새 fireball guard 아래 byte 동일, 기존 queue method도 byte 동일 |
| 새 lesson 경계 | Object inactive/active, freed current/freed publisher owner, 명시 null witness, Godot-only Vector2 active 거절6/6 PASS. 32 재연0 |
| 독립 source | 원 JS _addSkProf/playSample/_r/_playSampleNow 및 정확 finish 호출문6흐름 PASS. descriptor/P/lesson/U/이미 로드 대기중인 sample은 fixture이며 원 게임 실행/async fetch 검수 아님 |
| 순서/숫자 | 정상 given U=.25/.75의 rate=.9984, normal magic7→12/legacy fireball12, recover12. gx0은 caller draw1 후 queue jitter 없음; gx.5는gain.4. 별도 source 기대값 수정 없음 |
| 미로드 | 실제 queue 요청을 기존 flush가 소비하고 새 fireball guard가 cap/eviction 전에 drop. audible/원 decoder/async loader/음질 성공 증명 아님 |
| 종료/namespace | 마지막32와6 각각 ERROR0/WARNING0, Dummy. OS.get_user_data_dir가 FDG_ENGINE_FIREBALL_FINISH_FIXTURE_20261017_3A92로 선언과 일치. 기존 사용자 데이터 내용조회/cleanup0, 완전 save 격리 독립증명 아님 |
| 전체 미완 | 실제 fireball projectile/gx publisher/flight/원시각/sample loader·actual scene 미검증. 이전39/6/pool31·3·8/외부26/identity/pose/entry suite 재연0. 이 검사들을 게임 기능 수·이식률로 합산하지 않음 |

## 2026-10-17 악의구 actual World source consumer 후속

| 항목 | 현재 I 계약 |
|---|---|
| 실제 phase | Main store 다음 consumer bind, World 기존 birth2에서 enemy births 후/HitFX3 전 호출. 원 World clock·기존 동순위 Node 순서 불변 |
| array / slot | 원 동적 length/i/w loop. iteration 중 retire는 slot을 유지하고 마지막 resize(w)만. 같은 Dictionary HIT return→즉시 borrow/reset/publish→동일 pass append 처리 보존; iteration 밖 기존 즉시 erase 불변 |
| 회수 | release 동기 기록→step 반환 직후 HIT만 recycle=true, 거리/벽DEAD=false. 다음packet/borrow 전 완료/이중반납0. partial/unknown 효과 보존·성공회수/재실행0 |
| 실제 unique reader | 현재INV/SLOT_NAMES 첫JS-truthy item[stat] 원값. 합산·음수clamp/unknown→0 없음 |
| carrier / owner | 실제 World 동일 Node handle과별도 read_enemy view 구분. 실제 hurtE/fieldmob/poison owner 및Set key계약 미연결은NR, rawdamage 대체/noopready0 |
| clock / 미완 | source sp/dt_sp/gc_t의 실제현재권위필수, World epoch/fxdt/상수1 대입0. source clock/피해/VFX/delivery 未, gx는 Services current getter 연결·현재게임완료아님 |
| 상세 | docs/engine/FDG_NATIVE_FIREBALL_WORLD_CONSUMER_20261017.md. 새첫31중30PASS/spy기대1FAIL→실패1만교정1PASS, 새혼합4PASS·sourceunique17slot독립대조. 이전통과suite재연0 |

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
| 현재 실제 제품 | World clock context 공개 경로는 Services까지 연결됐으나 timestamp·실OPT fpsCap까지연결/첫gap_frame_callbacks body미연결로 NR; hurtE·fieldmob·poison owner는 미연결, native fxdt를 대체값으로 쓰지 않아 NR. renderer/delivery는未, gx는 Services current getter 연결이며 최신 전체게임/실제 발사 완료가 아님 |

## Source sample globals 후속 연결 — 2026-10-17

현재 gx 권위는 native_source_sample_globals.gd를 실제 초기화 Services가 명시 boot 1회 소유한 current getter다. Main sample 소비자가 이 경로를 사용한다. 투사체 delivery/실제 발사·원음 loader·source clock/hurtE 미완은 유지한다. 첫 fixture parse 실패와 수리 후 새16 PASS의 정확 범위·수명/현재값 한계는 FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md를 따른다. 이전 검사 당시 gx 대역/미연결 이력은 현재 완료 증거로 재사용하지 않는다.
