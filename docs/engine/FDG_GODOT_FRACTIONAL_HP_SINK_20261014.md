## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# 실제 Player HP 소수점 보존과 원본 회복 sink — 2026-10-14

원본 `game.html:33352,33356~33364`는 부동소수점 HP를 보유한다. NativePlayer의 정수 HP 및 `maxi` 피해 대입은 영역/자연 회복의 소수 잔량을 다음 피해에서 잃게 했다. `hp/max_hp`를 float로 보유하고 두 피해 대입만 `maxf(0.0,hp-final_damage)`로 연결한다.

| 위치 | 현재 계약 | 보존되는 값/동작 |
|---|---|---|
| Player `hp`, `max_hp` | float, 새 실행 각각 `350.0` | 원 mkP `350/350`; 최대 HP 파생 공식은 이 수정에서 생성하지 않음 |
| 직접 피해 / 화상 피해 | 소수 HP에서 정수 `final_damage`를 빼고 `maxf` 적용 | 기존 방어 감소 상한 `.75`, 피해 cap `floor(max_hp*.33)`, 최소 피해 `max(1,floor(max_hp*.005))`, poise/Q/E/KB/DOT 분기 보존 |
| QE 명령 HP gate | `float(actualPlayer.hp)>0.0` | 양수 HP `<1`도 생존 판정; HP를 int로 잘라 명령을 거절하지 않음 |
| HUD | 기존 `roundi` 표시와 float fill ratio | 내부 회복 잔량을 표시 정수로 다시 쓰지 않음 |

실제 `native_source_resource_authority.gd`가 회복 producer의 scalar HP sink와 영역 MP/ST sink를 소유한다. World/Player가 같은 실제 actor인 기존 자원 authority 계약을 사용한다. 새 두 sink는 초기화/대입 중 재진입, pause, 유실, 다른 actor/World 및 승인된 원본 subphase 밖 호출을 거절한다. HP를 시험용 공개 setter로 변경하지 않는다.

| API | 허용 조건 / 쓰기 |
|---|---|
| `bind_native_source_regeneration_phase(phase:Object)->bool` | 실제 Player/World가 같은 dispatcher 한 개를 WeakRef로 1회 보유; provider 유실 후 재바인딩으로 우회하지 않음 |
| `commit_native_source_hp(new_hp:float)->bool` | 실제 dispatcher의 `holy_flat_hp` 또는 `hp_natural` sink 호출 안, 유한 값이며 실제 `max_hp` 이하. 실제 HP 1회 대입; 별도 min0/반올림/새 최대값 계산 없음 |
| `commit_native_holy_flat_resources(flat_result:Dictionary)->bool` | `holy_flat_mpst` 안, 원 `READY/heal`, HP 적용 true, 같은 실제 HP/최대 HP와 원 source 식별자. 원 공유 `mpst_flat_amount`를 받아 **MP→ST** 2회 동기 대입 |
| 영역 자원 cap | 각각 `min(actual mmp,mp+flat)` / `min(actual mst,st+flat)` | 원 full/overcap downclamp 유지. 유한 출력 또는 계산된 `+Inf`의 cap 지원; NaN/`-Inf` 출력은 미지원 거절 |
| 자연 ST/MP sink | 기존 `natural_regen` packet의 **ST→MP** 동기 대입 | 원본 영역의 MP→ST 순서와 서로 다른 계약; 기존 sink/packet을 영역 대입에 재사용하지 않음 |
| snapshot | `source_phase_bound`, `hp_commits`, `flat_resource_commits`, `last_source_write` | deep-copy 진단; 통계만으로 실제 Main 전체 회복 완료 승격 없음 |

원 전체 순서는 presence → 영역 HP→MP→ST → MP/ST rate 사전계산 → 자연 HP → 자연 ST→MP이다. 각 sink는 신호·await·provider 호출 없이 실제 값을 대입하며, 화면 표시는 기존 HUD 갱신 경로가 읽는다. Dispatcher의 subphase tag는 공급자 질의 중과 승인된 clock 밖에서는 빈 문자열이다.

신규 dispatcher/실제 Tree 첫6그룹88검사가 exit0/ERROR0으로 통과했다. 기존 source HP 9그룹104·영역 HP 7그룹92·이전 자원 7그룹170·Main 5그룹71 성공 검사는 재실행하지 않는다. 실제 시작 장비25/RNG, post-applyStats `hpR/mhp`, 전체 Main/복원/화면/240FPS/24장24FPS 완성을 주장하지 않는다. 신규 실행 결과는 별도 검수 기록으로 추가한다.

## 최초 실제 Tree 검증

Godot4.7.2 headless 고립 actualMain 실행 **6그룹88 PASS**, exit0/ERROR0, 9.640316458초. 첫 실행1회이며 product/fixture 수리0·성공/이전 source 검사 재연0이다.

| 그룹 | 검사 수 | 직접 관측 |
|---|---:|---|
| source_order_once | 21 | 실제 clock8에 dome/flat/rates/HP/lesson/natural 각8, HP sink16. trace=`dome→holy_flat→holy_flat_hp→holy_flat_mpst→rates_precompute→hp→hp_natural→lesson→natural→natural_resources`; ST191.95/HP252.6 |
| fractional_hp_damage | 20 | public 피해→실제 source 회복 HP250.6→public 피해2→248.6; 최대350 cap과0 사망. QE positiveHP<1 공개Q는 별도 미측정 |
| lesson_flat_continues | 11 | lesson chapter2: admitted2/flat HP·MP·ST2/natural sink0; HP250.6/ST190.4 |
| actual_clock_rejects | 12 | 실제 beforePlayer probe로 copyens/stale/dt offset/pause/duplicate 거절 시 query/reserve0. 수동physics/privateclocksetter0 |
| source_nr_stops_later | 13 | rates NR 때 이미 적용한 영역 prefix HP250.4/ST190.4 보존, rates 이후 HP/natural0, 기존.28 fallback0 |
| lifecycle_fail_closed | 11 | provider 유실 후 Player binding 유지(true), readyfalse; source/legacy 추가회복0 |

실제 SceneTree/Main/Player/World/SourceResourceAuthority와 originalFusion→Flat→HP/Natural production을 소비했다. G/INV/PASSIVES/lesson/hpR/main-init witness는 생성자 fixture이며 원 시작 장비25 및 실제 Main 파생/전체초기화 완료가 아니다. pixel/GPU/240FPS/캐릭터24장24FPS 검증은0이다.

새 UID6은 Godot ResourceUID.create_id/id_to_text로 exact 신규 script만 생성했다(metadata-only0groups/0imports/0.620797667초). stage userdata는 `EXODUSER-SourceRegenPhase-Isolated-20261014`, 기존 사용자 QA/save 파일 접근0, GUI/서버/기존 PNG 해시·복사·import0이다. 권위 기록은 E/dependency-source-player-regeneration-phase-first/tests/attempt-01-runtime-receipt.json 및 worker-test-receipt.json이다.
