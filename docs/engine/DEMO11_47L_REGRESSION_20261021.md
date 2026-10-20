# DEMO11-47l — E2E 회귀 수정

기준 `codex/demo11-47k-20261021` / `855876f4e5215df8846613bce85175b62121627f`. 별도 sparse worktree. R은 읽기 전용이며 main/PC 동기화·배포를 수행하지 않는다. SHA·원격 대조·18단계·최종 수치는 외부 `_out/DEMO11-47l/DONE.txt` 및 아래 검수 표에 기록한다.

## 변경 계약

| 경로/항목 | 변경과 보존 범위 |
|---|---|
| `enemy_projectile_physical.gd` | `_ready`의 동일 `proj_phys_mouth.png` 로드를 script preload로 이동. 피해·이동·접촉·패링·수명·HP/최종사망 코드는 무수정. |
| `native_demo11_etype_a_spawn.gd`, `main.gd` | 기존 group-A 생성자 JSON과 동일 base/walk 텍스처를 MAP11 combat owner 설치 시 준비. scheduler 안의 constructor JSON 읽기를 제거. RNG/종류·순서·공식·지원 범위 불변. 미준비 상태는 거절. |
| `native_demo11_anglers.gd` | 전체 P deep copy 대신 모델이 사용하는 x/y/r/iframes/s만 재사용 scratch에 읽음. family frame/context 재사용, World 원본 clock serial 직접 읽음. opt-in 정수 계측(calls/total/max); 목록 API·ResourceLoader 추가 없음. 실제 family/Marker·AI·PC readback 경계 보존. |
| `native_world_drops.gd` | drop/pickup 음향의 resource IO 및 AudioServer bus 변경을 deferred callback으로 이동. 원래 음향 경로·프로필·gain·로컬 RNG 및 호출 순서 유지, owner 소멸 시 거절. 게임 UI 문구 변경0. |
| `test_demo11_47h_e2e.gd` | 한 hole에서25초 대기 대신 실제 hole을7초씩 방문하며35초 관측. etype1/4 실제 natural owner만 선택. 같은 공격 cone의 다른 etype0 PC HALT 때문에 적법한 target 공격을 중단하지 않도록 enemy_id 일치 검사. 선택 target 자신의 HALT는 유지. HP/alive/RNG 쓰기0. |
| auto_potion harness | 실제 iframe/CD가 끝난 뒤 사용 횟수·mats baseline 기록. 원래 addPotion 경로로 필요할 때만 재료 준비. HP의25% 실제 hurtP 요청, CD 중 추가 피해0. 실제 uses 증가·mats 감소·CD>0 확인. 피해/회복 공식을 바꾸지 않음. |
| blocked_by | bossroom_gate=`PC_fieldboss_HP_final_readback`; boss_defeat_signal/clear/demo_end/lobby_return=`bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11`; revival=`PCI-01`. 결과 row 최상위에 저장. Python 계약 검사도 잠긴 gate 이후 PASS/누락을 거절. |
| tests | focused Mac integration 및 callback probes(설치 때만 tree 순회, tick은 정수 계측), dependency 계약5건. 기존 anglers의 Main dormant 가정을47k의 production Marker 자동 바인딩 계약으로 정정. |

## 원인과 판단

1. 앵글러가 선택 target을 대체한 경로는 없다. 기존 선택은 natural-owner etype1/4로 이미 제한돼 있었다. 실제 family wake의 공유 RNG 소비가 있는 현재 실행에서 한 hole만 기다리는 검사가 취약하며, 실제 공격 telemetry의 다른 etype0 HALT까지 중단 조건으로 처리했다. 방문/선택 ID 경계만 교정한다.
2. 47k 물약 증거는 `uses_before=3`, `uses_after=3`, `mats_before=997`, `mats_after=997`, 검사 종료HP0/추가 피해13회다. 앞 단계의 실제 자동 사용 이후 CD를 기다리지 않고 추가 피해를 준 검사였다. 회복 수식 대신 검사 전제와 타이밍을 교정한다.
3. 47j 실제 sole E2E evidence의 boss_defeat_signal에는 `contract_signal_injected=true` 및 `native_demo_boss_defeated(0)` checkpoint가 있다. 뒤 clear_count1/PASS는 이 별도 consumer 계약 입력의 결과로, 실제 gate→boss 처치 경로 복구 근거가 아니다. 이 입력을 재도입하지 않으며 후행 NOT_READY를 PC 의존으로 명시한다.

## 계측 해석

47k E2E 전체 callback span max14.035ms, 예산8.333ms. 사전 focused에서 family max0.189ms, World phase max0.908ms였으나 전체38.617ms를 관측했다. callback 인접 probes에서 기존 인트로 ring 적 callback36.682ms를 관측하고 실제 투사체 `_ready`의 cold resource load를 제거했다. 변경 후 한 집중 실행은 전체5.665ms였다. 이후 별도 집중 실행의 최대20.718ms 및126.956ms도 보존한다. 후자는 Player87.282ms·펫20.315ms·World phase10.263ms 등 여러 구간에 지연이 발생했다. 외부 스케줄링/호스트 부하 가능성은 추정이며 이 수치를 삭제하거나 예산 통과로 재분류하지 않는다. family 단독 비용과 전체 callback 최대값을 혼동하지 않는다.

계측은 headless monotonic wall callback span으로 GPU·실창·PC 성능을 증명하지 않는다. 최종 E2E는 수정 후 정확히1회이며 재실행하지 않는다. 출력 전문은 외부 파일, 판정 수·성능 지표만 요약 조회한다.

## 보호 범위와 남은 일

PC 전투 이동/패링/방패/분노/hurtE/hurtP 및 readonly port 모듈, docs/2_3, 보스 최종사망·부활 무수정. 맵 비주얼 룩·조명/geometry 무수정. `EXODUSER-Godot-Native-First` 접근0, 격리 user dir만 사용. 번역 파일 변경0. Godot pgrep 확인 및 동시2개 이하. 원 gate 정책·지역80%·실제 fieldboss HP/final 및 boss source prefix 의존을 완화하지 않음. PC 인수 후 자연 처치→gate→boss→clear/로비 검증은 여전히 남는다.

## 최종 검수

**부분 완료 / 성능 목표 미달.** E2E 정확히1회: PASS12 / NOT_READY6 / FAIL0, engine ERROR0. enemy_kill·auto_potion PASS 복구. 최종 전체 physics max **14.035 → 21.343ms**, 예산8.333ms 초과. 최종 수치로 성능 완료를 주장하지 않는다. 최종 E2E 이후 제품 코드 수정/추가 E2E0.

| stage | status | blocked_by |
|---|---|---|
| isolation | PASS | — |
| new_game | PASS | — |
| character_create | PASS | — |
| intro_skip | PASS | — |
| field_MAP11 | PASS | — |
| enemy_kill | PASS | — |
| revival_interface | NOT_READY | PCI-01 |
| item_pickup | PASS | — |
| equip | PASS | — |
| auto_potion | PASS | — |
| level_up | PASS | — |
| stat_passive_invest | PASS | — |
| bossroom_gate | NOT_READY | PC_fieldboss_HP_final_readback |
| boss_defeat_signal | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| clear | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| demo_end | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| save_handoff | PASS | — |
| lobby_return | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |


| 관련 검사 | 판정 |
|---|---|
| final anglers (현재 production Marker 계약) | 1402 PASS / 0 FAIL / ERROR0 |
| potion | 2569 PASS / 0 FAIL / ERROR0 |
| world drops | 18 PASS / 0 FAIL / ERROR0 |
| final focused Mac | 9 PASS / 0 FAIL / ERROR0; 자연 etype1/4 실제 공격·처치 및 region count, 실제 hurtP 자동 물약 |
| physical construction/carrier | exit0 / ERROR0 |
| blocked_by 계약 | 5 PASS / 0 FAIL |
| 최초 anglers 검사 | 1402 중3실패;47k production Marker 자동 바인딩에 맞춰 legacy dormant/수동rebind/좌표 가정3건 정정 후1402/0 |
| 추가 A registered 기존 검사 | original_mkEn oracle 단계1실패/exit1/ERROR0; 통과로 보고하지 않음. 생성/전투 fixture까지 완료되지 않아 관련 전체 회귀 완료 아님. |
| 기존47k gate focused | checks10/0이나 SCRIPT ERROR1. 변경 source가 stack에 포함된 오류0, 원인은 별도 미해결로 남김. 최종 실제 E2E gate 검사 ERROR0과 구분. |

최종 performance 및 추가 기존 fixture 실패가 남아 있으므로 사용자 목표 전체 완료가 아니다. PC 미인수 범위와 별개로 전체21.343ms의 재현·세부원인 분리는 후속 단위가 필요하다. 이를 단순 OS 부하 또는 PC 코드 문제로 확정하지 않는다. raw 기록은 외부 파일에 전부 보존한다.

## DEMO11-47m — 단독 성능 분리 (2026-10-21)

기준 `2ebf51dd72ac3cc33caa81da1cee08d71ee7de07`, 새 브랜치 `codex/demo11-47m-20261021`. **부분 완료 / PERFORMANCE FAIL**. 전체 단독 22.007 → 30.845ms; E2E PASS11 / NOT_READY7 / FAIL0, engine ERROR0. PC 전투 코어 원인이라고 전체 초과를 단정하지 않는다.

| 분리 항목 | 근거·판정 | 조치/남은 범위 |
|---|---|---|
| 단독 physics 전체 | 기준 22.007 → 최종 30.845ms / 예산8.333ms; 양쪽 pgrep0에서 시작 | 목표 미달. 동시 Godot 오염만으로 설명 불가. 최대값을 cold loading으로 제외하지 않음 |
| 보호 Player callback | `player.gd::_physics_process` max 16.128ms, 초과 9회/4780 calls; max stage `enemy_kill` | PC 반송용. 동일 18단계 runner의 실제 이동/자연 적 공격→물약→gate대기→로비대기에서 재현. 이동/Q/E/hurtE/hurtP 구현 무수정; 내부 함수 하나를 원인으로 확정하지 않음 |
| family tick/할당 | 4마리 실제 생성 유지; family max 0.094ms / 4780calls | Mac: asleep이고 거리²>1,000,000(거리>1000)일 때 MODEL의 원래 무변경 return과 동일하게 빈 events/result 생성·변화 없는 redraw 생략. 경계1000은 기존 tick, 상태·RNG·HP·PC readback·선택·serial 보존 |
| 목록 API | Player `_world.get_enemies()`는 기존 `_enemies` 동일 배열 참조. physical `_add_bite()`의 get_nodes_in_group은 bite 생성 이벤트 경로 | 전역 목록 복사를 매틱 수행한다고 단정하지 않음; 보호 타격 경로 수정0. 계측 tree 순회는 설치 때만, 매틱 전체 tree 순회0 |
| texture/resource IO | 47L mouth texture preload, group-A configure의 constructor JSON/base/walk preload·보유 경로 유지; family sheet preload | 해당 Mac tick에 새 FileAccess/ResourceLoader 추가0. 문자열/Dictionary·source guard 할당은 존재하며 전체 할당 건수 프로파일러로 측정한 것은 아님 |
| first-use/GPU shader | headless 실행으로 GPU/실창 first-use compile 미측정. 최대 tick의 callback 밖 간격도 외부 파일에 보존 | 1회성 loading/셰이더로 재분류하거나 제외할 근거 부족. 일회성으로 판명된 spike를 로딩으로 옮겼다는 주장0 |
| 잔여 gap/지속성 | 최악 tick frame 2465, `enemy_kill`, 30.845ms. callback 경계별 start/end 및 우선순위 사이 gap 기록 | 새 노드 첫 callback은 deferred probe 설치 전일 수 있음. 엔진 내부/스케줄링/첫 callback의 미귀속 구간을 PC나 OS 단독 원인으로 확정하지 않음. Player 초과가 반복되므로 전체가 단발 로딩뿐이라는 설명은 거절 |
| 기존 A oracle 1FAIL 진단 | 47L raw `a_registered.log`와 이번 registered 모두 oracle 후 `actual_main_marker_cohort`에서 실패, `ATYPE_SETUP []` | 한 줄: 47k production MAP11 provider가 이미 bind되어 fixture의 두 번째 provider bind가 거절됨; original_mkEn oracle 실패라는 기존 요약은 raw와 불일치. fixture 미수정/FAIL 유지 |
| 기존 old47k gate SCRIPT_ERROR 진단 | options owner 미준비 시 `read_current_options()`가 Nil인데 Dictionary에 대입 | 한 줄: Mac transport의 Variant/type guard 누락. Nil→NOT_READY(`actual_options_required`)로 교정; 최종 gate10/0·SCRIPT_ERROR0; 실제 gate blocked_by 유지 |


### 상위10 callback (최종 단독)

| callback node / script | max ms | mean ms | calls | >8.333ms | max stage |
|---|---:|---:|---:|---:|---|
| `Player | res://scripts/player.gd` | 16.128 | 4.248 | 4780 | 9 | enemy_kill |
| `KiSlash | res://scripts/crescent.gd` | 6.986 | 0.071 | 123 | 0 | enemy_kill |
| `CH1CanonicalWorld/NativeProjectileBirthPhase | res://scripts/native_projectile_birth_phase.gd` | 3.248 | 0.160 | 4780 | 0 | auto_potion |
| `CH1CanonicalWorld/NativeOwnerAndWarningPhase | res://scripts/native_world_phase.gd` | 3.215 | 0.288 | 4780 | 0 | auto_potion |
| `CH1CanonicalWorld/@Node@793 | res://scripts/native_natural_enemy_base.gd` | 1.857 | 0.035 | 4780 | 0 | auto_potion |
| `Map11Product | res://scripts/native_map11_product.gd` | 0.524 | 0.117 | 5058 | 0 | lobby_return |
| `NativeRegions | res://scripts/native_regions.gd` | 0.339 | 0.079 | 5058 | 0 | intro_skip |
| `CH1CanonicalWorld/NativePets | res://scripts/native_pets.gd` | 0.163 | 0.103 | 4780 | 0 | enemy_kill |
| `CH1CanonicalWorld/@Node@1061 | res://scripts/native_demo11_etype_a_warning_phase.gd` | 0.136 | 0.003 | 3106 | 0 | enemy_kill |
| `CH1CanonicalWorld/ch1_curtain_ring_01 | res://scripts/enemy_melee_flesh_crawler.gd` | 0.130 | 0.077 | 110 | 0 | intro_skip |


### 18단계 (기준·최종 모두 단독)

| stage | status | before max ms | after max ms | after p95 ms | blocked_by |
|---|---|---:|---:|---:|---|
| isolation | PASS | 0.003 | 0.004 | 0.002 | — |
| new_game | PASS | 0.002 | 0.003 | 0.002 | — |
| character_create | PASS | 0.105 | 0.096 | 0.093 | — |
| intro_skip | PASS | 4.633 | 4.4 | 4.127 | — |
| field_MAP11 | PASS | 4.441 | 4.373 | 4.313 | — |
| enemy_kill | PASS | 22.007 | 30.845 | 7.67 | — |
| revival_interface | NOT_READY | 7.668 | 7.48 | 7.425 | PCI-01 |
| item_pickup | PASS | 7.231 | 7.488 | 7.419 | — |
| equip | PASS | 7.208 | 7.446 | 7.398 | — |
| auto_potion | NOT_READY | 9.716 | 10.496 | 7.533 | — |
| level_up | PASS | 4.508 | 7.495 | 4.964 | — |
| stat_passive_invest | PASS | 7.241 | 7.529 | 7.518 | — |
| bossroom_gate | NOT_READY | 7.68 | 8.105 | 8.08 | PC_fieldboss_HP_final_readback |
| boss_defeat_signal | NOT_READY | 7.712 | 8.124 | 8.113 | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| clear | NOT_READY | 7.761 | 8.209 | 8.072 | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| demo_end | NOT_READY | 7.728 | 8.259 | 8.079 | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| save_handoff | PASS | 7.837 | 8.166 | 8.07 | — |
| lobby_return | NOT_READY | 8.338 | 10.612 | 8.017 | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |


계측: monotonic wall callback span이며 CPU thread time과 다르다. 원 priority를 유지한 앞 sibling/첫 child stamp로 자식 callback을 부모 시간에서 분리한다. can_process·동일 physics frame guard, weakref·owner tree_exiting 정리, 동일 node path 재생성의 누적 max/calls를 적용한다. synthetic 검수에서 parent 약0.2ms/child 약1ms 분리·비활성·소멸·동일명 재생성 누적 PASS. 각 단계의 상위10은 `_out/DEMO11-47m/callback-top10-by-stage.md`, 원시 결과·worst tick 시간축·미귀속 간격은 같은 외부 폴더에 보존한다. 정밀 계측 전의 부모-inclusive probe값과 스테일/해제 노드 오류가 있는 진단값을 정상 callback 수치로 쓰지 않는다.

검수: anglers1402/0, focused9/0, old47k gate10/0·ERROR0, physical3PASS/0·ERROR0, blocked_by 계약5/0. registered는 oracle 다음 fixture bind FAIL1·ERROR0. Python unittest discover는 독립 실행형 테스트의 SystemExit를 오류로 해석했으므로 직접 script 실행5/0로 검수. 최초 probe metadata 식별자 오류 실행은 중단, 해제 노드 capture 오류 진단도 별도 보존. 기준 완주2회(첫 sibling-inclusive, 둘째 whole-tick 기준), 진단 완주1회, 잠정 최종1회 뒤 동일 경로 재생성 집계 누락을 고쳤고 **마지막 코드 상태의 최종 E2E는1회**다. 잠정 결과도 삭제하지 않는다. 성능 성공을 얻기 위한 재실행/최소값 선택이 아니다.

보호: PC 이동·패링·방패·분노·hurtE/hurtP·port_modules·docs/2_3·맵 비주얼/조명·번역 변경0. 직접 defeat/clear 신호 주입0; 기존 PC blocked_by6개 유지; 최종 auto_potion은 별도 NOT_READY(피해요청0, uses2→2, mats1002→1002)로 추가, PC 의존으로 덮어쓰지 않음. 실제 사용자 저장 폴더 접근0, runner·관련 검사·합성 검사 모두 전용 격리 user dir. Godot 종료 후 pgrep0에서 순차 실행, R 코드/INDEX/WORK 읽기 전용. headless 결과는 실창 시각·사운드·GPU 검수나 PC 동기화 완료가 아니다. 전체 원인 분리와8.333ms 목표는 미완료다.

47m 최종 추가 미해결: `auto_potion`은 NOT_READY, 피해요청0·uses2→2·mats1002→1002·종료cd0이다. 검사 전 HP/iframe 값이 결과에 없어 무피해 원인을 단정하지 않는다. PC blocked_by6행과 별도이며 전체 최종11 PASS/7 NOT_READY/0 FAIL을 적용한다. `.gitignore`에는 소유한47m 계측 회귀 테스트만 추적 예외로 추가했다.
