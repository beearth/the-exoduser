# 일반 type0 source KB momentum owner — 2026-10-17

| 항목 | 구현 / 제한 |
|---|---|
| TASK / actual actor | `ROOT-NORMAL-ENEMY-KB-OWNER-20261017`; 정상 생성 `ch1_initial_015 / order14 / etype0 / physical / elite0 / mods[]` |
| local parent / branch | `80d5dca2a7e9d6cd298ac2144ec2e7281a469a70`; `codex/mac-normal-enemy-kb-owner-20261017` |
| 새 구현 | 같은 World/current same-actor invocation의 source `owner_requests`→actual `_knockback` 증분 적용→owner_requests/events cursor 각1 증가 |
| 전체 준비 | `full_hurtE_ready=false/source_clock_ready=false`. v3 `decide` 자동 연결/전체 피해·전투·source clock/현재 실행본 적용 완료가 아님 |

## source / current-owner 계약

| source id / 위치 | 원 계약 / 실제 연결 |
|---|---|
| `enemy.kb_add / 42482` | 캐시된 v3/ROOT 입력의 `{x:cos(ang)*kb_amt,y:sin(ang)*kb_amt}`. 이미 source producer가 계산한 증분을 받으며 consumer에서 ang/피해/KB 공식·배율을 다시 계산하지 않음 |
| authority | ROOT의 이번 TASK 및 인수된 v3 최초읽기 캐시. 이 단위 R `game.html` 재읽기/해시/producer 재추출0; 새 source hash는 `NOT_RECORDED` |
| invocation `consume_prefix(packet)` | 기존 events append순서, 같은 item Dictionary/current token 검증을 재사용. `enemy_writes` 경로 유지; `owner_requests`의 literal `enemy.kb_add`만 새 actor owner에 전달 |
| actor `commit_native_source_kb_add(owner:RefCounted,item:Dictionary)` | actual same World/Node/registry/Tree/current invocation와 `is_applying_item` identity 확인. 같은 `_knockback`에 native increment를 더함 |
| kind / line / data | literal `enemy.kb_add`, TYPE_INT line42482, Dictionary data, x/y가 각각 finite int/float이어야 함. missing/bool/String/배열을0이나숫자로 변환하지 않음 |
| current life / alive | actor/World 삭제·이탈은 거부. `alive`나 HP를 새 gate로 사용하지 않음. 원 source는 self-nested death 뒤에도 해당 요청을 보낼 수 있음 |
| vector / precision | `increment:Vector2`, `combined:Vector2`는 원 x/y 증분과 actual 현재 momentum의 합. native Vector2 정밀도·표현 범위를 사용하며 source JS double 전체 bit동등은 미주장. nonfinite/표현불가 증분 또는 합은 exact NR로 중단하며 clamp·새 balance cap 없음 |
| source formula / clock | 기존 `receive_damage`/KB API/heading normalize/스케일/15cap을 호출·재계산하지 않음. native 기존 감쇠·시계·이동 코드도 변경하지 않음 |
| cursor / metadata | 성공한 요청만 `owner_requests +=1`, `events +=1`; enemy_writes/presentation은 유지. 실패/미소유 뒤 이미 적용한 prefix는 보존. `_last_field`는 owner request 뒤 빈 값으로 갱신하여 recover field-adjacency 증거를 요청 너머로 넘기지 않음 |
| `42483 enemy.offscreen_move_if_can_move` | 여전히 미소유. canMv/geometry/좌표 이동을 실행하거나 성공으로 스킵하지 않음. 요청이 나타난 정확 위치에서 NR |

### 현재 실패 위치

| reason | 실제 의미 |
|---|---|
| `actual_source_kb_item_not_current` | 현재 actor/World/invocation/item 권위 없음 |
| `source_kb_request_outside_contract` | kind·line·data shape가 이 source 요청 범위가 아님 |
| `source_kb_increment_not_numeric_finite` | x/y 누락 또는 비수치/비유한; cast/default0 없음 |
| `source_kb_vector_not_representable` | native Vector2 increment/current momentum을 유한하게 표현할 수 없음 |
| `source_kb_sum_not_representable` | 현재 prefix를 보존하고 표현 불가능한 다음 합만 거부 |
| `source_effect_owner_unbound:owner_requests:enemy.offscreen_move_if_can_move` | 42483 좌표/geometry owner 미연결; 실제 이동0 |

## 새 검수 / 이력

| 단계 | 관측과 한계 |
|---|---|
| 첫 실행 | `combined := _knockback + increment`의 Variant 타입 추론 때문에 compilation 실패. process exit0이지만 result JSON 없음/기능 검사 완료0, **first_whole_clean=false**. 원 첫 fixture/양 raw/수리 전 actual source byte를 보존 |
| 코드 수리 | `combined:Vector2` 명시 선언 한 줄. 새 namespace/별도 repair fixture에서 아직 실행하지 못한 이번 KB 검사만 실행. 앞 통과 suite 재연0 |
| 수리 후 새 검사 | **15/15 PASS**, exit0, repair stdout·Godot 양 로그 ERROR/WARN/ObjectDB/resource leak0 |
| 새 실제 coupling | 실제 momentum에 source 증분·연속 요청 합·HP prefix 뒤 요청 적용/피해 재계산0·or/events cursor·stale/closed/lifetime 거부·비일반 vector setter·42483 정확 partial·malformed/native표현 영역 거부 |
| 사망 사례 | 실제 기존 legacy damage로 사망한 Node에 KB 요청을 적용함. 원 self-nested hurtE 본문/실전 재현을 실행했다는 증거가 아님 |
| fixture 범위 | actual actor code의 `_ready/_draw` 렌더 setup 억제, code-only physical projectile 대역. 실제 World field owner5 method 추출/나머지 World fixture. World fixture에는 geometry/canMv 구현도 두지 않았으며 physics/camera/geometry/42483 실행0 |
| 미검수 | v3 decide/fullMain/source G/공용 RNG/poise19985 tail/실제 KB 이동·충돌/시각·성능·전체 최신게임은 미완. 앞 field21/poise21+2/producer37/24/29/기존 parse·성공수송 재연0 |

## docs / 보존

| 항목 | 실제 기록 |
|---|---|
| 소유 경로 | code2 + docs15 = exact17. 이미 관련 current field/poise 문서 범위를 알아 **이번 final17 모두 첫code 전에** I/R WORK+HEAD68rows/58copies, INDEX/WORK/UNTRACKED 별도 snapshot, 모든 조상 non-symlink 확인 |
| 시간 순서 | prewrite-manifest→code-write-log→수리 전 백업/repair manifest→type-repair-write→docs 각 실제 쓰기 시각. 앞 단위 미제출시각을 소급 보충하지 않음 |
| source / 보호 | R/main/served/사용자창·asset/save·Q/E/BOSS/MAP/카메라/rig/GL/poise19985 tail 본문·기존 감쇠/clock 변경0 |
| 사용량 | ROOT가 허용한 직전 주간44 관측을 시작 경계로 재사용했으며 새 시작 조회라고 주장하지 않음. 일간UNKNOWN/공유 계정; 종료 관측과 local/GitHub WIP 결과는 외부 receipt |

새 증거 절대경로: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-ENEMY-KB-OWNER-20261017/`. 최초 실패 입력/로그와 `repair1-fixture/first.result.json`, repair1 양로그를 구분한다. Git WIP 보존은 현재 게임 실행본의 최신 반영 증거가 아니다.
