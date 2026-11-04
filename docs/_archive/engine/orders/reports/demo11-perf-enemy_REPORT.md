# DEMO11-perf-enemy — 다수 적 비용 진단·Mac 최적화

**판정: Mac 범위 최적화·진단 제출, 전체30개체 최대8.333ms 목표 미달.** native CPU loop 평균30개체9.58%/60개체10.31% 감소. 실제 물리 callback 평균은 headless30/60에서5.22%/8.52%, 실창30/60에서6.04%/9.26% 감소했지만 최대 hitch가 남았다. 다른 사용자 Godot가 있어 단독 실행 최종 인증이 아니다.

기준: fetch한 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f`에 요청된 `99e6fe7b·d931ebe2·c6d19973·9fd31a64` 모두 ancestor로 포함하는 병합 기준 **c09196b58b5226cbe342a0242c52ae74a29fe288**. 네 커밋 octopus가 충돌하여 실패한 뒤 순차 merge로 보존 통합했다(rebase/reset/force0). Main EOF A/base/B/D 진입점(3070–3103), factory EOF 네 등록/API(681–743), projectile registry의 natural/D API(141–153,220–252)를 모두 보존하는 충돌 해소다. Main의 base-bound A 라우팅과 registry natural 우선순위를 임의로 재설계하지 않았다. 공용 최적화 diff는 이 병합 기준과 비교한다.

**측정 범위:** 동일 실제 Main/World/DEMO11-43 Marker provider/factory/common native owner/DEMO11-35 registry에 자연 **etype0 30·60개체 추가**(기존 초기9개체는 registry/충돌/분리 이웃으로 남기되 자동 AI disabled). 여러 family 혼합 및 모든 etype 지원/제품 전투 완료를 주장하지 않는다. 실맵 geometry·맵룩 기본 OFF, 보호 플레이어 피격 비용은 격리 fixture iframes로 제외한다. 보스/PC 피해/패링 스트레스나 플레이어 이동 중 flow 재구축은 이 부하 분모 밖이다. A/B/D는 해당 실제 runtime 회귀로 별도 확인했다.

warmup60 + 측정360, source sp=.5. `native CPU loop`는 360회 명시적 source phase 호출(World/AI/particle/birth/scheduler)의 처리 벽시계이며 Engine 고정 물리 callback/Player/process/GPU를 제외한다. 나머지 headless/실창은 **120Hz 설정의 실제360 physics callback**을 priority−1000/+1000 stamp로 측정하며, N틱 벽시계는 Engine/OS 대기·physics server·렌더 backpressure를 포함한다. callback stamp에는 callback 밖 PhysicsServer/GPU 실행이 모두 들어가지 않는다. 실창은 1920×1080·vsync OFF, frame 간격은 process_frame 간 실제 시간으로 GPU present/idle 영향을 포함하며 순수 GPU timer나 GPU 완료 시간은 아니다. Performance 지표0. 전후 각 조건1회, profiler는 별도 실행이며 아래 성능 값에서 제외했다.

| 경로 / 추가 개체 | 전 평균/p99/최대 ms | 후 평균/p99/최대 ms | N틱 벽시계 전→후 s |
|---|---|---|---|
| native CPU loop / 30 | 2.627/3.959/4.158 | 2.375/3.478/3.948 | 0.946→0.855 |
| native CPU loop / 60 | 5.124/7.997/8.126 | 4.595/7.197/7.394 | 1.845→1.654 |
| 실제 physics·headless / 30 | 4.238/5.394/19.836 | 4.017/4.966/18.975 | 2.997→2.993 |
| 실제 physics·headless / 60 | 6.811/9.687/25.565 | 6.231/8.842/21.185 | 3.009→3.009 |
| 실제 physics·실창 / 30 | 4.311/5.591/23.845 | 4.050/5.144/20.652 | 3.005→2.998 |
| 실제 physics·실창 / 60 | 6.886/9.825/26.656 | 6.249/8.614/23.328 | 3.278→3.048 |
| 실창 frame 간격 / 30 | 24.217/42.090/44.403 | 21.723/34.376/43.411 | 동일 실행, frame수 124→138 |
| 실창 frame 간격 / 60 | 72.818/97.847/97.847 | 65.075/87.042/87.042 | 동일 실행, frame수 45→47 |

30개체 native CPU 최대3.948ms는 예산 이내지만, **headless 전체 callback18.975ms·실창20.652ms로 목표 FAIL**이다. 60개체도 callback 최대21.185/23.328ms. N틱 벽시계가 약3초인 것은 평균적으로 설정120Hz를 유지하는 조건이지 최대 hitch 해소 또는 렌더120fps 성공이 아니다. 전후6조건의 원본 JSON·로그와 `comparison.json` 보존.

**환경:** 모든 실행 직전 요청의 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 subprocess pipe로 수행해2이상이면30초대기. 각 `*.pre-pgrep.txt`와 `godot-gate.jsonl`에 기록. 유효 matrix 직전에는 기존 사용자 PID21779가1개 있어 `uncontended=false`다. 사용자 프로세스를 종료/중단하지 않았다. 다른 작업 창의 실행 및 OS scheduling을 통제하지 못했으므로 환경 잡음을 제거한 최대치 보증/통계적 유의성 주장이 아니다. `pgrep -f`가 다른 도구의 알림 argv 속 과거 명령도 매칭하는 경우를 관측했고, 숫자 gate는 그대로 지키되 새 로그의 비Godot argv 내용은 PID만 남긴다.

Godot 기본 `servers` script profiler(원본 코드에 계측 삽입0), headless 실제30개체360틱, native calls 포함·상위512함수 한도. 아래는 전 self 순위 고정이며 post 행은 함수명으로 대응했다. 렌더/process 호출 횟수는 전후 scheduling에 따라 달라져 단순합을 전체 물리 시간으로 계산하지 않는다. 상속/super 및 native call 귀속·profiling overhead가 있어 표는 병목 위치·빈도 근거이며, raw `*.profile-raw.json`과 전체 `*-full-top.json`도 보존했다.

| 전 self 상위10: 파일:행 / 함수 | 호출 수 전→후 (360틱) | self µs/틱 전→후 |
|---|---|---|
| `native_natural_enemy_actor.gd:16 / advance_native_phase` | 10,800→10,800 | 1800.23→1501.76 |
| `world.gd:3197 / is_world_blocked` | 96,683→96,635 | 1271.30→1050.31 |
| `native_source_resource_authority.gd:602 / _current_error` | 206,190→223,308 | 827.68→866.00 |
| `native_source_resource_authority.gd:647 / _live` | 971,144→1,052,764 | 434.86→454.96 |
| `native_source_resource_authority.gd:228 / read_current_resource_parameters` | 55,277→59,443 | 234.83→252.00 |
| `native_source_new_run_state.gd:1224 / _current_error` | 51,216→55,104 | 199.96→209.30 |
| `native_source_resource_authority.gd:651 / _number` | 1,650,960→1,787,904 | 193.34→200.39 |
| `native_source_new_run_state.gd:1252 / _actual_fields_error` | 51,216→55,104 | 152.66→162.49 |
| `native_source_new_run_state.gd:1277 / _live` | 300,032→324,844 | 138.55→145.44 |
| `native_source_resource_authority.gd:98 / read_native_regen_state` | 56,717→60,883 | 127.54→134.78 |

**병목·할당 조사:** `is_world_blocked` 약97천회/360틱에서 매 collider마다 Dictionary/Array 키 읽기·Vector2 생성·나눗셈을 수행했다. `can_move`의 네 모서리 Array 생성도 약23천회/360틱(native-only profiler 기준)이었다. 이번 외곽 박스 조기 continue는 실제 타원 경계보다2배 넓게만 탈락시키고, 기존 Vector2 타원 수식/순회 순서를 그대로 둔다. live map 데이터 읽기도 유지하여 stale cache를 만들지 않는다. `can_move`는 동일 네 corner 순서의 short-circuit 호출로 Array만 없앴고, hill length 중복 호출을1회로 줄였다. Flesh 분리 이동은 기존 pow 연산을 순회 밖1회로 이동하고 자기 position을 local로 읽는다. 간격·거리식·적 순서·RNG/신호·피해 코드 변경0.

**공용 변경 범위:** 병합 기준 대비 `world.gd` **3206–3225,3237–3241 +21/−6**, `enemy_melee_flesh_crawler.gd` **249–256 +4/−2**. 후자는 Mac actor AI의 분리 계산만이며 hurtE/poise/HP/kill domain·Player 이동/피격/보호 경로를 수정하지 않았다. Main/State 및 `native_normal_enemy_hurte.gd`, 자원/QE/재생/PC owner 파일은 병합 기준 byte 동일. 원본 에셋·map.json 변경0. `baseline-files-sha256.json`·`optimization.diff`·최종 audit에 근거를 둔다.

**최대 hitch의 구체적 추적 — PC 펫 초상 cold load:** 별도 profiler의 physics 시간이 가장 큰 frame을 추출했다. 전 frame147의 physics22.261ms 중 `native_pets.gd:667::_show_bubble` 1회 self14.861ms, 후 frame172의21.470ms 중 같은 함수1회14.945ms였다. 해당 함수671–673은 발화 시점에 portrait 경로를 exists/load 동기 처리한다. 제품 파일 무수정인 별도 headless cold/warm load probe **3/0**에서 crow 최초15.735ms→강한 참조 유지 재로드4µs, cat15.305ms→4µs·실제 동일 Resource 확인. `*-slowest-profile-frame.json` 및 profiler summary의 slowest_physics_frame, `pet-portrait-probe.*`에 근거가 있다. 단순히 적 AI 전체가 느린 것으로 결론내리지 않는다. 모든 비계측 maximum sample과 일대일 timestamp 매핑을 한 것은 아니지만, 측정 구간 주요15ms hitch를 직접 관측·재현했다.

`WORK_BOARD.md` P2-004b는 native_pets 대사 테이블을 PC 소유로 명시하고, P2-004a 추적 문서26행의 원로그도 Windows `G:\exoduser-wt\_out\p2-004a`이며 show_bubble은 그 이식 commit3e9a1206(PC) 코드다. 따라서 이 파일은 수정0. **OLD** `native_pets.gd:671–673`: 발화 때마다 경로 exists→load, 사용 후 다음 초상 교체 시 resource 강한 참조가 사라질 수 있음. **NEW 제안**: `configure/_build_subtitle_panel:633–664`에서 crow/cat 두 texture를1회 로드해 모듈 강한 참조 cache에 유지하고, `_show_bubble`에서는 해당 texture만 배정. 경로 누락 시 기존 portrait 유지, 자막 위치/색/글꼴/대사 내용/trigger/RNG/쿨다운은 무변경. ~31ms 로드는 초기화로 이동하므로 기동 비용과 최초/전환/pair 대사를 PC가 검증해야 한다. 더 큰 권위 검사 최적화에 앞서 이1건을 먼저 인수하면 최대 hitch를 줄일 구체적 후보가 된다.

**PC OLD/NEW 제안(수정0):** `native_source_resource_authority.gd:602–628` `_current_error`와`:647` `_live`, `native_source_new_run_state.gd:1223–1276` 소유·자원 검증이 수십만/백만번 반복된다. OLD는 매 read_current_*마다 같은 script/tree/claim/resource 관계를 중첩 확인하고 Dictionary read view를 다시 만든다. NEW는 PC가 실제 owner transaction의 변경 revision/weak identity가 보장되는 불변 계약 부분만 캐시하고, 현재 HP/cap/state/claim/reparent 등 변할 수 있는 거부 검사와 write readback을 유지하는 읽기 계약을 제공하는 것이다. 단순한 전체 frame 결과 캐시/검사 제거는 제안하지 않는다. Mac `native_natural_enemy_base.gd:51–62`도 packet cache 앞에서 adapter.is_current→Regions._live→State.read_current_g를 호출하지만, cache를 먼저 반환하면 같은 frame의 provider/ownership 변화 거부가 약해질 수 있어 그대로 두었다.

**추가 정적 점검:** 측정 profiler 상위512에 get_method_list/get_property_list/get_signal_list 호출은 관측되지 않았다(전체 미호출 증명 아님). 기존 QE/resource/regen의 method-list 캐시는 그대로 보존. `native_element_projectile_emitter.gd:344–360` `_actor_identity`와 `native_type7_teleport.gd:148–152` `_field`에는 property-list 생성이 남아 있고 type7 advance에서도 호출된다. 이 type0 부하에는 들어가지 않아 비용 수치를 만들지 않았다. 후속 OLD/NEW: 실제 정적 actor Script별 property 존재 cache를 최초1회 구축하되 script 교체/동적 property 계약은 유지·별도 검증해야 한다. Player의 property-list는 constructor pre-Tree 경로다. packet/context Dictionary clone, actor의 state-membership Array, projectile queue keys Array는 남아 있다. 생명주기/동적 데이터 의미를 보장하지 않은 사전 할당·참조 공유는 하지 않았다. source-tree get_node는 주로 configure, spawn-hole scheduler에는 tick lookup이 남는다. profiler에 잡힌 World event forwarding은 전후56회로 신호 폭증 근거는 없었다. allocation 수를 profiler가 직접 센 것으로 주장하지 않는다.

**동치·회귀 각1회:** 기존 함수 본문을 그대로 둔 기준 fixture와 신규 기하/분리 검사 **6473/0**(random3000점×point/corner, ellipse 경계, live collider 수정, ordered60이웃/분리120사례). 기존 실제 common base **31/0**, A source mkEn90사례·실제 등록 **1952/0**, B runtime **42/0**, D runtime **29/0**, P3-002 **298/0**, 합 **8825/0**, skip0·예상 밖 ERROR0. P3 종료 ObjectDB8 경고는 원문 보존(이번 별도 원인 진단/해소 주장0), Camera2D physics interpolation 경고도 보존. 기존 테스트 userdir 상수를 사용했고 신규는 `EXODUSER-demo11-perf-enemy-Isolated-20261021`, 실제 사용자 저장 폴더0, override 실행마다 생성/종료0byte.

보조 `state_digest`는 기동 누적 RNG/clock/Engine movement scheduling을 정규화한 동치 replay가 아니며 전후 동일하지 않다. 이를 원본 동치 증거로 사용하지 않았다. 동치 근거는 변경 함수의 동일 입력·동일 순서 결과 검사와 기존 원본 oracle/실제 runtime 회귀다. 이번 최적화 구역에는 RNG·신호·피해·상태 전이 호출을 추가/삭제/이동하지 않았다. `cpu` loop를 실제 Engine 물리/렌더 replay로 위장하지 않는다.

**실행 실패 기록:** 처음 benchmark fixture의 L count를30으로 잘못 적어 실제 `_spawnHoleCount`15와 manifest 불일치→binding 실패·Nil SCRIPT ERROR가 났다. 자기 실행만 종료한 뒤 기존 count 계약에 맞춰4그룹×15로 정정했으며 실패 로그도 보존했다. 이 준비 실패와 별도 profiler 실행은 전후 유효 matrix에 포함하지 않는다. 새 하니스는 결과 요약 누락도 실패로 처리한다.

최종 일반push·원격 SHA 일치·DONE 후 자기 worktree 제거. 원로그 `~/exoduser-wt/_out/demo11-perf-enemy/`. 최종 SHA/검증/정리 상태는 외부 DONE에 기록한다. **전체30개체 max 목표 해소 및 단독 환경 재인증은 후속**, 이번 제출을120fps 제품 완료로 처리하지 않는다.
