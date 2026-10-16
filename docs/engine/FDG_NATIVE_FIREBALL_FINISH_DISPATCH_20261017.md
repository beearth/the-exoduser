# Native 악의구 finish / source void dispatch — 2026-10-17

상태: I WIP. source game.html 변경 없음. 현재 _gxVolMul은 실제 Services 소유 source global에 연결했으며 actual delivery는 아직 미연결이라 실제 발사·최신 게임 완료 아님.

| 항목 | 현재 source / 실제 소비자 계약 |
|---|---|
| 소유 code2 | Main 기존 queue/lesson 공개 소비, ResourceAuthority 실제 현재 P finish. SourceState current P identity와 실제 MP/state owner 위임은 유지 |
| 원 순서 | _mpBon=0 → World에 실제 준비된 projectile 추가 → _addSkProf('fireball') → playSample('fireball',.8,_r(1,.08)) → magicRecover/st2=12 |
| lesson readiness | read_guard_detail.ready는 active 아님. value는 regen용 {parry_lesson_active,chapter}. Main.source_lesson의 공개 detail/reference만 읽으며 보호 _eval/regen/chapter 계약 수정 없음 |
| CURRENT_LESSON | 유효 현재 Dictionary/Object reference의 active property만 기존 SourceLessonScript.AFFIX.js_truthy로 판별. missing active 또는 JS falsy는 정상 +5. chapter는 source 숙련 함수가 읽지 않아 chapter 전용 NR을 active로 바꾸지 않음 |
| 명시 부재 | SOURCE_PROPERTY_UNCREATED/UNSET/FALSY witness가 명시 ready일 때만 비활성. uncreated/unset는 known_absent=true. MISSING/revoked/freed/current reference 불명은 pre-emit NOT_READY |
| 숙련 정상 | 실제 P._catProf.magic=(기존수치 또는 key부재0)+5; P._skProf.fireball을 같은 합계로 동기화. missing category/skills Dictionary는 source처럼 설치. 기존 지원의 유한 수치/Dictionary domain 유지; 다른 truthy scalar shape는 미지원으로 거절 |
| 숙련 skip | active만 skip. 이때 기존 prof 구조가 잘못돼도 원 early-return처럼 해당 구조를 읽어 거절하지 않음 |
| post-emit | 실제 공개 lesson/prof 상태를 원 숙련 위치에서 재읽음. 예기치 않은 권위 손실은 partial 진단/proficiency_applied=false로 공개하며 정상 +5 완료로 세지 않음. emit 후 P-field 쓰기 callback 거절/환불·rollback 계층 없음 |
| delivery 준비 | 실제 projectile owner/prepare 필수. prof는 delivery의 임의 proficiency_ready flag가 아니라 Main 실제 lesson reader. sample은 실제 dispatcher/current context 필수이며 sample_loaded는 별도 정보 |
| sample_player | 더 이상 준비된 AudioStreamPlayer/stream!=null을 요구하지 않음. 가짜 AudioStream이나 dummy voice로 준비를 만들지 않음 |
| 실제 sample front | ResourceAuthority 현재 finish commit → Main.dispatch_native_fireball_sample(self,rate) void → 기존 _queue_native_attack_sample → 기존 render _advance_native_attack_audio |
| 원 두 RNG | 먼저 caller _r=1+(World U−.5)×2×.08, 이후 queue rate×(.92+World U×.16). 기존 실제 World.sample_native_random_unit 경유, 새 RNG/clock 없음 |
| volume skip | 실제 current gx_vol_mul<1이면 .8×mul, <.01이면 source skip. caller RNG는 이미 소비하지만 queue jitter는 소비하지 않음 |
| 현재 gx 권위 | 실제 SourceInitializationServices.read_current_sample_context(self)가 명시 boot 1회한 source-global owner의 현재 gx_vol_mul을 읽는다. Main은 같은 실제 Services script를 확인한다. owner/lifecycle 부재는 NOT_READY이고 delivery Node나 getter fallback1로 대체하지 않는다. 상세 FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md |
| key/priority | source voice map에 fireball 없음, skill key라 30ms dedup 우회/priority queue 앞 삽입. 이번 key의 category만 fireball로 분리. 원8키 큐/flush 본체 및 RNG식 유지 |
| backend drop | 새 fireball key만 stream 미로드이면 voice allocation/cap/eviction 전에 drop. 정상 finish/recover를 되돌리거나 실패로 만들지 않음 |
| loader 한계 | 원 _playSampleNow의 async fetch/decode는 이번에 이식/실행하지 않음. loader_bound=false, 실제 음원/원경로 bytes·존재/해시/import/가청 검증0. drop 처리와 음향 기능 완료는 구별 |
| 원8키 준비 | 기존 ATTACK_SAMPLE_PATHS8개의 실제 AudioStream을 전부 요구하되 추가 fireball key가 있어도 size!=8로 기존 audio 준비를 무효화하지 않음. 정상8키 backend body 변경 없음 |
| 반환 진단 | finish accepted와 proficiency_applied/skipped/partial, sample_dispatched를 구분. sample_audible_verified=false. Main manifest fireball_sample_dispatch는 실제 queue 진단/현재 readiness |
| 미완 | actual projectile/flight/collision/hurtE/source option/time·fireball loader/sample·원 시각 미연결. 준비=true/noop 완료로 숨기지 않음 |
| 검수 | 새 변경 영역의 최초 asset-free fixture32/32 및 별도 lesson 경계6/6 PASS. 첫 fixture parse 실패/수리 이력 보존. 원 owner39/6, pool31/3/8, 외부flight/identity/pose/entry suite 재연 없음 |

prewrite-manifest에 exact code2/docs9 총11path의 I/R WORK/HEAD44행(실제38copy/부재6), 부모별 realpath/nonlink 및 새 fixture namespace를 첫 product write 전 기록했다. 원3cf53bd branch 보존 후 codex/mac-fireball-finish-dispatch-20261017에서 작업한다.

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
| 현재 실제 제품 | World clock context 공개 경로는 Services까지 연결됐으나 frame-entry/body 미연결로 NR; hurtE·fieldmob·poison owner는 미연결, native fxdt를 대체값으로 쓰지 않아 NR. renderer/delivery는未, gx는 Services current getter 연결이며 최신 전체게임/실제 발사 완료가 아님 |

## Source sample globals 후속 연결 — 2026-10-17

현재 gx 권위는 native_source_sample_globals.gd를 실제 초기화 Services가 명시 boot 1회 소유한 current getter다. Main sample 소비자가 이 경로를 사용한다. 투사체 delivery/실제 발사·원음 loader·source clock/hurtE 미완은 유지한다. 첫 fixture parse 실패와 수리 후 새16 PASS의 정확 범위·수명/현재값 한계는 FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md를 따른다. 이전 검사 당시 gx 대역/미연결 이력은 현재 완료 증거로 재사용하지 않는다.
