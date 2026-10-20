> 2026-10-20 QA-001 PC 정정: 이 문서의 과거 FIRST·배송 검수 수치는 당시 이력으로 보존한다. 현재 7종 테스트의 하니스·낡은 기대값 진단, 원본 행 근거, 기준선과 영향 그룹 재검 결과는 [QA-001 PC 보고서](orders/reports/QA-001_REPORT.md)를 따른다. 게임 수치·제품 코드는 변경하지 않았다.

# FDG Godot etype0 physical flesh_crawler 첫 소비 — 2026-10-13

## 현재 제작 상태

이 단위는 고정 CH1 초기 목록의 `order14 / ch1_initial_015` 한 record를 새 Godot 소비 경로에 연결한다. 기존 원 목록16개를 다시 추출하거나 수정하지 않는다. 앞선 [factory 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md)의 medium dark2 생성·고유3 시간0 PASS와 첫 native 플레이의 고유5/공개 세션은 당시 source의 이력으로 동결한다.

후속 물리탄 burn DOT 첫 소비는 [새 burn 단위 정본](FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md)을 따른다. 현재 player/physical에는 pool48/t600/tick0/interval30/divisor20/cap10, idle에서 expiry가 앞서는19pulse, raw2→phys DEF2→HP1, player0→physical1 처리 순서가 저장됐다. 새 고유4는 최초 PASS/0FAIL/exit0이며 명시 physics 호출1597회·자동 fixture17틱·pause 관측4processframes다. 이 문서 본문·NEXT PASS의 원 config `burn_dot_ported=false/currently_ported=false`, 이전 고유3 PASS와 당시 burn 미이식 이력은 동결하여 후속 current capability와 구분한다. 기검참 hold(wWindup/Godot windup)는 literal 이동돌진 charge와 달라 물리탄의 HP·poise·burn append를 막지 않는다. 기존 인간 source1 fullscreen paused 앱은 입력/재로드0·새 source 미로드를 유지한다. fullguard/쉴드/affix/fallen/revival/retry·공개 픽셀·최저240 검증은 미완이며 VISUAL VERDICT는 RETOUCH다.

| 항목 | 현재 범위 / 상태 |
|---|---|
| 부모 checkpoint / 백업 | parent `7b62e031`; 외부 `godot-native-first/encounter-etype0-physical-first/backup-before-consumer/manifest.json`, 소유16파일 WORK+HEAD32 copies |
| 신규 consumer | 정확 `order14 / ch1_initial_015 / etype0 / physical / flesh_crawler` 한 개만 admission; 새 class/config/factory 저장 및 실제 headless 생성 검증 |
| 원 snapshot | `encounters.json`의16records·원 count/order/HP/ATK/spawn·`support.runtime_supported=false`·`runtime=null` 불변 |
| 현재 capability | 실제 world 등록3 / 미지원13: 기존 medium dark2 + 새 정확 record1. 원 snapshot의 추출 당시 지원2/미지원14와 구분 |
| 새 검사 | 새 고유3 기술 PASS. 최초1PASS/2 fixtureFAIL(3 assertions)→실패2만 수리 재실행2PASS; 통과1 및 이전 고유3/5·JS 재실행0 |
| 기존 medium / player | 기존 medium dark class·projectile·crescent 수정/재검사0. player는 기존 HP/ST/방어/포이즈/charge/Q 값·수용/DR 공식을 보존하며 선택적 4번째 native KB 인자만 연결 |
| 공개 검수 | 현재 인간 source1 fullscreen pause 앱의 입력·launch·reload·QA report 저장0; 새 consumer 공개 증거0 |
| 시각 / 성능 | VISUAL VERDICT RETOUCH; 새 픽셀·전체 AI·최소사양 Windows1080p240 검수 없음 |

서로 공유하는 작업 공간에서 class/factory/projectile 및 원 asset 회수는 다른 담당자가 소유한다. 이 문서와 신규 테스트·기존 factory 정본의 후속 상태만 이 worker가 수정한다. 타인의 WIP를 정리하거나 되돌리지 않는다.

## 1차 설계 기준과 원 경로의 범위

| 1차 문서 / 기준 | 적용 방식 |
|---|---|
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md`의 FSM·60Hz·LOS·접촉 | 실제 원 etype0 경로를 담당자가 회수한 뒤 소비한다. 일반 표의 windup8f를 현재 consumer의 원 값으로 추정하지 않음 |
| `docs/8.0몬스터디자인/몬스터_공격시스템.md`의 `_meleeET` | 밀착 접촉은 `atk×0.8`; 원 ATK31의 정수 요청24. 공통 탄막 차징60틱의 실제 분기와 분리 |
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` | 기존 CH1 8방향 atlas의 cell256×256·8열×5행; walk4프레임은 `_walkDist/128` 거리 기반. PNG 신규 생성/가공0 |
| 사용자 현재 제한 | 어택 티켓/동시공격 제한 구현0. PixelLab 캐릭터 생성0. 확정 `2_3` 문서 수정0 |

원 etype0의 idle 자연 경로는 접촉24 및 공통 물리탄60틱 charge를 소비한다. `eCircle` 티켓 조건부의 windup35→attack8/판정 잔여5→recover35를 새로운 자연 trigger로 발명하지 않는다. 부모가 요구한 연속 공격 전조 FSM은 이 원 자연 경로에 연결되지 않은 범위로 명시한다. 테스트에서 상태를 강제로 점프해 공개 지원 증거로 삼거나 공개 test-only hook을 추가하지 않는다.

### 회수된 원 피해 / 물리탄 경계

| 원 경로 | 정확 값 / 순서 | 새 기술 검증 상태 |
|---|---|---|
| idle 접촉 | `st2≤0 && d<e.r+P.r+8` → 정수 `31×0.8=24` 요청 | 실제 초기38.1067…틱을39회 갱신해 phys24 요청1 확인; 공개 접촉 증거 아님 |
| 공통 물리 발사 | 차징60틱→생성 base damage24 / size3 / life120 / speed300px/s | 별도 class의 실제 60틱 charge 완료·생성24/120/300 확인; dark 대체0 |
| 유도 | life>30 동안 helper의 `0.00109083rad/native tick` | physical `_physics_process`:69–73 소비. 새 기술 검사는 생성/접촉을 확인하며 전체 유도 궤적 공개 검수0 |
| 물리탄 실제 피해 type | 원 접촉의 `dtype='parry'` → energyDR; EDEF0일 때24. 원소 EL.P가 physical DR 분류를 뜻하지 않음 | 실제 physical→player 인자 및 피해2회 확인: HP350→302, KB `(4,0)`. 공개 플레이 HP가 아닌 독립 fixture |
| 원 enemy 방어 | native raw에 def/eDef field 없음; eRes7개는0, STRstatStr1 | 새 방어 값을 임의로 만들지 않음 |
| full shield block | eShield875가 전량 흡수→remaining damage0. HPflash/hitStun/alert/KB 및 poise/poiseR/stun 변화0; 이 damagepath의 charge cancel0 | 실제 큐100/피해100의 shield 후 remaining0 확인: shield775, HP/poise875 및 alert/hitstun/KB 불변 |
| overflow 예 | 요청1000→shield875 흡수→HP damage125. KB=`min(125×0.25,15)` | 테스트의 독립 기술 입력 예이며 공개 플레이 피해 증거가 아님 |
| poiseHit 순서 | 원 hurtE의 `opts.poiseHit`일 때만 shield 후 remaining HP damage×psM을 정수 적용. 기본psM1의 위 예는125 | 일반 weapon에 자동 poise 추가0 |
| 일반 weapon | `source='weapon'`의 damage 자체는 poiseHit flag 없음 | 별도 poise 소비와 분리 |
| poise break / charge cancel | 원 `_poiseHit`: amt≤0이면 변화0, poise≤0이면 stunned/maxStunned180. 차징 취소는 updateE의 hitStun 우선 return을 통과한 stunnedbranch에서 처리 | 코드 경로 존재; 생존 stun180 및 실제 charge cancel 실행 미검증. poiseMult7·강제 상태/HP/clock0 |

위 수치는 원 코드 담당의 좁은 회수 결과다. 신consumer의 실제 config/API 소비와 검증 범위는 아래 표에 구분한다. 원 record에 없는 방어 field나 새 자연 전조 trigger를 source_raw에 덧쓰지 않는다.

## 고정 원 record 수치

아래 값은 새 consumer의 데이터 저작값이 아니라 보존하는 `godot/data/encounters.json: records[14]`의 원 leaf다. 전체 native_factory/native_final/initial_timers는 원 JSON 및 이전 factory 정본의 원 leaf 표를 참조한다. 원16 snapshot을 중복 덤프하거나 재저장하지 않는다.

| 원 path | 정확 값 | 새 실제 소비 / 보존 범위 |
|---|---|---|
| `id / order / spawn_group` | `ch1_initial_015` / 14 / `gate-wave` | 정확 admission·actor identity·report 순서 |
| `etype / element / element_id` | 0 / `physical` / 0 | 새 type별 class; 기존 dark projectile 대체0 |
| `stage / level / difficulty` | 0 / 1 / `NORMAL` | 원 record 보존; 임의 밸런스 보정0 |
| `spawn_position / requested_spawn_position` | `[3888.7242834487565,244.62260903114446]` | configure의 combat-center. Vector2 저장 정밀도와 source_raw의 원 double 값을 구분 |
| `hp / native_final.mhp / attack` | 875 / 875 / 31 | 초기 실제 actor HP/max_hp/mhp/ATK |
| `radius` | 22.103927369229496 | 원 충돌반경 |
| `speed_pixels_per_tick / native_tick_rate` | 0.6128564003482461 / 60 | native tick 이동; 렌더 FPS와 분리 |
| `poise / max_poise` | 875 / 875 | 원 포이즈 |
| `poise_regen_ticks / poise_regen_fraction` | 200 / 0.15 | crawler `_physics_process`:151–155의200틱/정수131 회복. 생존 stun/실제 회복 실행 검수는 남음 |
| `native_final.eShield / eShieldMax / eShieldRegenT` | 875 / 875 / 0 | hurtE 순서에 따른 원 쉴드 흡수와 최종 HP·poise |
| `initial_idle_ticks / native_final.st2` | 38.106732717715204 | 원 초기 접촉/상태 시계 |
| `initial_projectile_ticks / native_final.projT` | 269.4780135154724 | 원 초기 발사 대기 시계 |
| `projectile_cooldown_ticks / native_final.projCd` | 240 | 원 공통 차징 사이 대기 |
| `initial_facing` | 2.6490353528754254 | 원 초기 방향 |
| `elite / mods / aura` | 0 / `[]` / null | 이 consumer의 정확 지원 범위 |
| `initial_spawn_fade_ticks / native_final._spawnT` | 20 | 원 등장 상태 보존 |
| `initial_timers.poiseR / chargeT` | 0 / 0 | 원 초기 시계 |
| `native_final.s / stunned / kb` | `idle` / 0 / `{x:0,y:0}` | 초기 상태·stun·KB |
| `aggro_range / pursuit_stop_distance / idle_movement_multiplier` | 800 / 30 / 1.6 | LOS/추적/idle 이동 원 분기 |
| `contact_extra_radius / contact_damage_multiplier` | 8 / 0.8 | 밀착 경계·정수 요청24 |
| `contact_cooldown_min_ticks / contact_cooldown_random_ticks` | 40 / 20 | 접촉 쿨다운 원 식; 실제 RNG 소비는 별도 회수 계약 |
| `hit_stun_ticks / projectile_charge_ticks / projectile_range` | 8 / 60 / 400 | 원 hit/공통 차징·사거리. 새로운 자동 공격 FSM trigger가 아님 |
| `windup_ticks / attack_ticks / recovery_ticks` | null / 8 / 35 | 원 snapshot 보존. 자연 idle 소비와 티켓 조건부 FSM 경로를 구분 |
| `factory_random_seed / rng_begin / rng_end` | 457479498 / 189 / 198 | 목록 추출 당시 seed/draw 구간; 새 Godot RNG와 동일 전체 replay 주장0 |
| `animation.skin / kind / resources_copied` | `flesh_crawler` / `native-ch1-eight-direction-atlas` / false | immutable 추출 당시 art metadata. 후속 실제 resource admission과 구분 |
| `animation.cell_size / atlas_columns / atlas_rows / column / row` | `[256,256]` / 8 / 5 / 6 / 0 | 실제 Sprite2D region/source texture 확인 |
| `animation.draw_height / native_pivot` | 154.72749158460647 / `[0.5,0.5]` | 원 body 표시 크기·중심; 신규 모델 승인 아님 |
| `animation.walk_supported / walk_frames / walk_pixels_per_frame` | true / 4 / 128 | 이동 거리 기반 frame 선택 |
| `native_final._mobCh / _mob8Col / _mob8Row` | 1 / 6 / 0 | 원 Chapter1 sprite 선택 |
| `support.runtime_supported / runtime` | false / null | 추출 당시 고정 snapshot. 후속 capability를 이 값을 수정해 표시하지 않음 |

## 준비된 config / 기존 asset 계약

`godot/data/etype0_physical_flesh_crawler.json`은 schema `exoduser.godot.etype0-physical-flesh-crawler.v1`, 29585bytes, SHA256 `f8b0a168d2c7cb39ede3a0acf4942ff73a0016f70cc58ac581b3a29a96508300`이다. 원 copy/config receipt와 새 실제 class 기술 검사 결과는 별도 증거다. 새 기술 PASS가 PNG 예술 품질 승인을 뜻하지 않는다. 원 factory16 snapshot의 `runtime=null`은 그대로이고, 새 파일의 명시적 profile만 후속 admission에서 읽는다.

원 asset17PNG/26726245bytes가 byte-identical로 복사됐다. 부모가 새17PNG headless import를1회 수행해 exit0·parse error0을 기록했다(`import-new-assets.log`, `import-new-assets-receipt.json`, GUI0); 시각 검수와 별도다. 앞선16atlas/22734844bytes에 원 `proj_phys_mouth.png` 3991401bytes를 포함한 총수다. base8/walk8 atlas에는 원40 skin의 셀이 있지만 후속 생성 지원은 정확 flesh_crawler1뿐이다. 8방향×4 이동 frame이며 24FPS/24장 신규 원화·새 모델/리깅 승인이 아니다. 이미지 재가공·좌표 수정0이다.

### 새 profile의 정확 leaf

`runtime.native_final`은 원 record14의 native_final 최상위337개 key 기록에서 이 consumer에 필요한27개 key를 값 변경 없이 선택한 묶음이다. 전체337개는 actual factory report의 `record.native_final`에 보존된다. `runtime.initial_timers`는 원 해당 묶음 전체를 보존한다. 값은 위 원 record 표 및 앞선 factory 정본의 전체 native leaf 표를 참조한다. 아래는 새 config에서 추가하거나 명시적으로 소비하는 그 밖의 leaf다. source path 배열은 원 줄 번호 목록을 그대로 config에서 참조하며 중복 덤프하지 않는다.

| path | 정확 값 | 소비 / 범위 |
|---|---|---|
| `target.id` | `"ch1_initial_015"` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.order` | `14` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.etype` | `0` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.element` | `"physical"` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.element_id` | `0` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.skin` | `"flesh_crawler"` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.elite` | `0` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.mods` | `[]` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.aura` | `null` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `target.spawn_position` | `[3888.7242834487565,244.62260903114446]` | `enemy_factory.gd` `_is_flesh_target`/`_validate_flesh_config`: exact record gate; 실제 admission 검사 |
| `runtime.id` | `"ch1_initial_015"` | `enemy_melee_flesh_crawler.gd` `_ready`:92의 identity/telemetry; `enemy_factory.gd` exact admission |
| `runtime.order` | `14` | `enemy_melee_flesh_crawler.gd` `configure`:72 source_order; actual registry 순서14 |
| `runtime.name` | `"native etype 0"` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.etype` | `0` | `enemy_melee_flesh_crawler.gd` `configure`:65 / snapshot·telemetry |
| `runtime.element` | `"physical"` | `enemy_melee_flesh_crawler.gd` `configure`:66 / snapshot; 새 projectile은 별도 physical profile |
| `runtime.element_id` | `0` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.stage` | `0` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.level` | `1` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.difficulty` | `"NORMAL"` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.spawn_position` | `[3888.7242834487565,244.62260903114446]` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.requested_spawn_position` | `[3888.7242834487565,244.62260903114446]` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.hp` | `875` | `enemy_melee_flesh_crawler.gd` `configure`:60–62 hp/max_hp/mhp; 초기875 |
| `runtime.attack` | `31` | `enemy_melee_flesh_crawler.gd` `configure`:63 및 `_physics_process`:183 contact×.8 |
| `runtime.radius` | `22.103927369229496` | `enemy_melee_flesh_crawler.gd` `configure`:64 / collider / can_move·접촉·separation |
| `runtime.speed_pixels_per_tick` | `0.6128564003482461` | `enemy_melee_flesh_crawler.gd` `_physics_process`:166/179 및 `_move_native`:199–204 |
| `runtime.native_tick_rate` | `60` | `enemy_melee_flesh_crawler.gd` `_physics_process`:130 delta×60; render refresh 시간 증폭0 |
| `runtime.poise` | `875` | `enemy_melee_flesh_crawler.gd` `configure`:77 → `_apply_poise`:307–314; shield 후 opt-in |
| `runtime.max_poise` | `875` | `enemy_melee_flesh_crawler.gd` `configure`:78 및200틱 regen; boss reset 추가0 |
| `runtime.poise_regen_ticks` | `200` | `enemy_melee_flesh_crawler.gd` `_physics_process`:153 interval200 |
| `runtime.poise_regen_fraction` | `0.15` | `enemy_melee_flesh_crawler.gd` `_physics_process`:154 floor(875×.15)=131 |
| `runtime.initial_idle_ticks` | `38.106732717715204` | `enemy_melee_flesh_crawler.gd` `configure`:79 → 접촉 countdown |
| `runtime.initial_projectile_ticks` | `269.4780135154724` | `enemy_melee_flesh_crawler.gd` `configure`:80 → idle 발사 wait |
| `runtime.projectile_cooldown_ticks` | `240` | `enemy_melee_flesh_crawler.gd` `_physics_process`:190 wait240 |
| `runtime.initial_facing` | `2.6490353528754254` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.elite` | `0` | `enemy_melee_flesh_crawler.gd` `configure`:67 / exact admission |
| `runtime.mods` | `[]` | `enemy_melee_flesh_crawler.gd` `configure`:68 / exact admission |
| `runtime.aura` | `null` | `enemy_melee_flesh_crawler.gd` `configure`:69 / exact admission |
| `runtime.initial_spawn_fade_ticks` | `20` | `enemy_melee_flesh_crawler.gd` `configure`:82 → fade20 |
| `runtime.aggro_range` | `800` | `enemy_melee_flesh_crawler.gd` `_physics_process`:160–164 거리800+LOS/방향 |
| `runtime.pursuit_stop_distance` | `30` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165 flow 이동 stop30 |
| `runtime.idle_movement_multiplier` | `1.6` | `enemy_melee_flesh_crawler.gd` `_physics_process`:179 직접 이동1.6; 기존 flow와 동시 소비 |
| `runtime.contact_extra_radius` | `8` | `enemy_melee_flesh_crawler.gd` `_physics_process`:182 접촉 +8 |
| `runtime.contact_damage_multiplier` | `0.8` | `enemy_melee_flesh_crawler.gd` `_physics_process`:183 int(31×.8)=24phys |
| `runtime.contact_cooldown_min_ticks` | `40` | `enemy_melee_flesh_crawler.gd` `_physics_process`:185 40+floor(rand×20) |
| `runtime.contact_cooldown_random_ticks` | `20` | `enemy_melee_flesh_crawler.gd` `_physics_process`:185 40..59; JS RNG 동일 주장0 |
| `runtime.hit_stun_ticks` | `8` | `enemy_melee_flesh_crawler.gd` `receive_damage`:285 idle remaining>0에8 |
| `runtime.projectile_charge_ticks` | `60` | `enemy_melee_flesh_crawler.gd` `_physics_process`:191 / `_draw` 기존 charge arc |
| `runtime.projectile_range` | `400` | `enemy_melee_flesh_crawler.gd` `_physics_process`:189 range400 |
| `runtime.windup_ticks` | `null` | `enemy_factory.gd` 원 값 보존; 자동 windup entry 없음 / null |
| `runtime.attack_ticks` | `8` | `enemy_factory.gd` 원8 metadata 보존; 조건부 melee attack 경로 미이식 |
| `runtime.recovery_ticks` | `35` | `enemy_factory.gd` 원35 metadata 보존; 자동 eCircle/티켓 entry 추가0 |
| `runtime.factory_random_seed` | `457479498` | `enemy_melee_flesh_crawler.gd` `configure`:89 Godot RNG 초기값; JS 전체 RNG replay 동일 주장0 |
| `runtime.facing` | `2.6490353528754254` | `enemy_melee_flesh_crawler.gd` `configure`:73 → 8방향 `_update_animation`:320 |
| `runtime.ai_profile` | `"native_ch1_etype0_physical_flesh_crawler_v1"` | `enemy_factory.gd` 원 record와 비교 검증 / `enemy_melee_flesh_crawler.gd` `configure` data deep clone; 해당 metadata에 별도 시스템 동작 추가0 |
| `runtime.animation.kind` | `"native-ch1-eight-direction-atlas"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.skin` | `"flesh_crawler"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.resources_copied` | `true` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.cell_size` | `[256,256]` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.atlas_columns` | `8` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.atlas_rows` | `5` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.column` | `6` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.row` | `0` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.draw_height` | `154.72749158460647` | `enemy_melee_flesh_crawler.gd` `_ready`:109–110 scale/256 및 `_draw` HP bar anchor |
| `runtime.animation.native_pivot` | `[0.5,0.5]` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.base_textures.south` | `"res://assets/enemy/atlas_ch1_8dir_south.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.south-east` | `"res://assets/enemy/atlas_ch1_8dir_south_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.east` | `"res://assets/enemy/atlas_ch1_8dir_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.north-east` | `"res://assets/enemy/atlas_ch1_8dir_north_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.north` | `"res://assets/enemy/atlas_ch1_8dir_north.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.north-west` | `"res://assets/enemy/atlas_ch1_8dir_north_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.west` | `"res://assets/enemy/atlas_ch1_8dir_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_textures.south-west` | `"res://assets/enemy/atlas_ch1_8dir_south_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.source_relative_base_textures.south` | `"img/atlas_ch1_8dir_south.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.south-east` | `"img/atlas_ch1_8dir_south_east.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.east` | `"img/atlas_ch1_8dir_east.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.north-east` | `"img/atlas_ch1_8dir_north_east.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.north` | `"img/atlas_ch1_8dir_north.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.north-west` | `"img/atlas_ch1_8dir_north_west.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.west` | `"img/atlas_ch1_8dir_west.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.source_relative_base_textures.south-west` | `"img/atlas_ch1_8dir_south_west.png"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.walk_supported` | `true` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.walk_frames` | `4` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.walk_pixels_per_frame` | `128` | `enemy_melee_flesh_crawler.gd` `_update_animation`:320–327; 실제 body1536/walk6144→6400 region 검증 |
| `runtime.animation.walk_textures.south` | `"res://assets/enemy/atlas_ch1_8dir_walk_south.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.south-east` | `"res://assets/enemy/atlas_ch1_8dir_walk_south_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.east` | `"res://assets/enemy/atlas_ch1_8dir_walk_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.north-east` | `"res://assets/enemy/atlas_ch1_8dir_walk_north_east.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.north` | `"res://assets/enemy/atlas_ch1_8dir_walk_north.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.north-west` | `"res://assets/enemy/atlas_ch1_8dir_walk_north_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.west` | `"res://assets/enemy/atlas_ch1_8dir_walk_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.walk_textures.south-west` | `"res://assets/enemy/atlas_ch1_8dir_walk_south_west.png"` | `enemy_melee_flesh_crawler.gd` `_ready`:106–108 load, `_update_animation`:320–327 방향/region; 실제 SW pair 생성 검증 |
| `runtime.animation.base_rect` | `[1536,0,256,256]` | `enemy_melee_flesh_crawler.gd` `_update_animation`:320–327; 실제 body1536/walk6144→6400 region 검증 |
| `runtime.animation.walk_frame_rects` | `[[6144,0,256,256],[6400,0,256,256],[6656,0,256,256],[6912,0,256,256]]` | `enemy_melee_flesh_crawler.gd` `_update_animation`:320–327; 실제 body1536/walk6144→6400 region 검증 |
| `runtime.animation.direction_angle_sectors` | `["east","south-east","south","south-west","west","north-west","north","north-east"]` | `enemy_melee_flesh_crawler.gd` `_update_animation`:320–327; 실제 body1536/walk6144→6400 region 검증 |
| `runtime.animation.direction_rounding` | `"round(normalize_0_to_2pi(facing)/(PI/4)) mod 8"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.base_and_walk_overlay` | `true` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.walk_frame_rule` | `"floor(_walkDist / 128) mod 4"` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.walk_distance_origin` | `0` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.native_pivot_pixels` | `[128,128]` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.anatomical_foot_pivot` | `null` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.texture_filter` | `"nearest"` | `enemy_melee_flesh_crawler.gd` `_make_sprite`:119 nearest |
| `runtime.animation.animation_time_driven` | `false` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.unique_attack_animation` | `false` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.unique_death_animation` | `false` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.animation.native_sprite_source` | `["game.html:23832","game.html:23847","game.html:54119","game.html:54129","game.html:54130","game.html:35116"]` | `enemy_factory.gd` 원 atlas 프로필 보존/고정 layout 검증; 실제 Sprite2D 소비는 cell256·방향8·거리128/4frame 경로 |
| `runtime.projectile.element` | `"physical"` | `enemy_factory.gd` fixed physical profile 및 `enemy_projectile_physical.gd` data clone 보존; 해당 metadata 전체 AI/시스템 포트 주장0 |
| `runtime.projectile.element_id` | `0` | `enemy_factory.gd` fixed physical profile 및 `enemy_projectile_physical.gd` data clone 보존; 해당 metadata 전체 AI/시스템 포트 주장0 |
| `runtime.projectile.parry_class` | `"physical"` | `enemy_projectile_physical.gd` hit/birth/end telemetry의physical 분류; full Q/E parry 미이식 |
| `runtime.projectile.native_dtype` | `"parry"` | `enemy_projectile_physical.gd` `_physics_process`:88 → player `receive_damage`:269 energyDR(parry) |
| `runtime.projectile.native_birth_position` | `"actor-center"` | `enemy_factory.gd` fixed physical profile 및 `enemy_projectile_physical.gd` data clone 보존; 해당 metadata 전체 AI/시스템 포트 주장0 |
| `runtime.projectile.base_damage` | `24` | `enemy_factory.gd` fixed profile 검증 / telemetry base24; contact_damage와 같음 |
| `runtime.projectile.contact_damage` | `24` | `enemy_projectile_physical.gd` `configure`:25 실제 damage24 |
| `runtime.projectile.size` | `3.0` | `enemy_factory.gd` fixed physical profile 및 `enemy_projectile_physical.gd` data clone 보존; 해당 metadata 전체 AI/시스템 포트 주장0 |
| `runtime.projectile.radius` | `5.2` | `enemy_projectile_physical.gd` `_ready`:47 collider5.2; 실제 player 판정은 swept radial margin |
| `runtime.projectile.contact_margin` | `13.0` | `enemy_projectile_physical.gd` `_physics_process`:85 player.r+13 swept 판정 |
| `runtime.projectile.life_ticks` | `120.0` | `enemy_projectile_physical.gd` `configure`:26 초기120 |
| `runtime.projectile.life_decay_per_tick` | `0.667` | `enemy_projectile_physical.gd` `_physics_process`:65 매 native tick .667 감소 |
| `runtime.projectile.speed_pixels_per_second` | `[300,300]` | `enemy_projectile_physical.gd` `configure`:27 고정첫값300; random speed 변형0 |
| `runtime.projectile.homing_radians_per_tick` | `0.00109083` | `enemy_projectile_physical.gd` `_physics_process`:72 turn cap .00109083×ticks |
| `runtime.projectile.homing_until_life` | `30.0` | `enemy_projectile_physical.gd` `_physics_process`:69 life>30 gate |
| `runtime.projectile.redBean` | `true` | `enemy_factory.gd` fixed profile 검증; lifetime 종료형 소비, 원 camera2500 recycle/폭발fx 미이식 |
| `runtime.projectile.homing` | `true` | `enemy_factory.gd` fixed true / `enemy_projectile_physical.gd` life>30 동안 실제 turn |
| `runtime.projectile.commit` | `true` | `enemy_factory.gd` fixed profile 검증; 새 densitydrop 계층 추가0 / global original camera 미이식 |
| `runtime.projectile.drop_exempt` | `true` | `enemy_factory.gd` fixed profile 검증; 새로운 적탄밀도삭제 경로 없음 |
| `runtime.projectile.turn_rate_comment_is_stale` | `true` | `enemy_factory.gd` fixed physical profile 및 `enemy_projectile_physical.gd` data clone 보존; 해당 metadata 전체 AI/시스템 포트 주장0 |
| `runtime.projectile.player_knockback_pixels_per_tick` | `2.0` | `enemy_projectile_physical.gd` `_physics_process`:88 → player 선택적 인자2 additive |
| `runtime.projectile.animation.texture` | `"res://assets/enemy/proj_phys_mouth.png"` | `enemy_projectile_physical.gd` `_ready`:52 원 mouth texture load |
| `runtime.projectile.animation.cell_size` | `[768,384]` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.columns` | `8` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.rows` | `3` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.row_frame_counts` | `[8,6,6]` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.flight_row` | `0` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.flight_frames` | `8` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.facing` | `"east"` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.native_pivot` | `[0.5,0.5]` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.frame_rule` | `"positive_mod((native_game_frame >> 2) + trunc(world_x * 0.03), 8)"` | `enemy_projectile_physical.gd` `_update_visual`:106 native_frame>>2+trunc(x×.03); 렌더 refresh는 frame/time 증가0 |
| `runtime.projectile.animation.height` | `67.914` | `enemy_projectile_physical.gd` `_ready`:56 scale(width/768,height/384) |
| `runtime.projectile.animation.width` | `135.828` | `enemy_projectile_physical.gd` `_ready`:56 scale(width/768,height/384) |
| `runtime.projectile.animation.draw_height_rule` | `"22.05 * (clamp(size * 1.5, 1.2, 4) * .7) * 2 * .55"` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.animation.rotation_rule` | `"atan2(vy,vx)"` | `enemy_factory.gd` fixed mouth layout 검증 / `enemy_projectile_physical.gd` `_update_visual`:106–108 row0·8cells·center·회전 |
| `runtime.projectile.source` | 20 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `runtime.eShield` | `875` | `enemy_melee_flesh_crawler.gd` `configure`:74 → `receive_damage`:270–273 실제 흡수 |
| `runtime.eShieldMax` | `875` | `enemy_melee_flesh_crawler.gd` `configure`:75 → `receive_damage`:270 흡수 gate |
| `runtime.eRes` | `[0,0,0,0,0,0,0]` | `enemy_melee_flesh_crawler.gd` `configure`:76 보존(7개0); 신규 resist/equipment 공식 추가0 |
| `runtime.native_flags.ib` | `false` | `enemy_melee_flesh_crawler.gd` `configure`:71 원 key 보존; metadata 전체를 별도 AI로 실행하지 않음 |
| `runtime.native_flags.elite` | `0` | `enemy_melee_flesh_crawler.gd` `configure`:71 원 key 보존; metadata 전체를 별도 AI로 실행하지 않음 |
| `runtime.native_flags.mods` | `[]` | `enemy_melee_flesh_crawler.gd` `configure`:71 원 key 보존; metadata 전체를 별도 AI로 실행하지 않음 |
| `runtime.native_flags.aura` | `null` | `enemy_melee_flesh_crawler.gd` `configure`:71 원 key 보존; metadata 전체를 별도 AI로 실행하지 않음 |
| `native_source_contract.source_root` | `"/Users/fordeargamers/Projects/exoduser-migration-20261001"` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.source_file` | `"game.html"` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.snapshot` | `"godot/data/encounters.json"` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.snapshot_is_frozen` | `true` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.raw_factory_not_reexecuted` | `true` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.target_native_arguments` | `[3888.7242834487565,244.62260903114446,0,0,false,0,-1]` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.factory_random_seed` | `457479498` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.rng_begin` | `189` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.rng_end` | `198` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.tick_seconds` | `0.016666666666666666` | 원 추출 receipt/JSON/seed/tick metadata 보존; 원 factory 재실행·전체 replay 주장0 |
| `native_source_contract.aggro.distance` | `800` | `enemy_melee_flesh_crawler.gd` `_physics_process`:159–176 거리/LOS/비경계 반환; config source 원 줄 참조 |
| `native_source_contract.aggro.line_of_sight_required` | `true` | `enemy_melee_flesh_crawler.gd` `_physics_process`:159–176 거리/LOS/비경계 반환; config source 원 줄 참조 |
| `native_source_contract.aggro.non_alerted_far_return_distance` | `400` | `enemy_melee_flesh_crawler.gd` `_physics_process`:159–176 거리/LOS/비경계 반환; config source 원 줄 참조 |
| `native_source_contract.aggro.source` | 2 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.movement.flow_field_multiplier` | `1.0` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.flow_field_stop_distance` | `30` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.idle_direct_multiplier` | `1.6` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.both_existing_source_moves_apply` | `true` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.separation_query_radius_multiplier` | `4.4` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.separation_extra_radius` | `4` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.separation_force_multiplier` | `1.5` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.separation_cooldown_ticks` | `3` | `enemy_melee_flesh_crawler.gd` `_physics_process`:165–180 / separation:208–225; 원 flow+direct2경로 |
| `native_source_contract.movement.source` | 4 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.normal_idle.automatic_melee_windup` | `false` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.contact_damage` | `24` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.contact_dtype` | `"phys"` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.contact_gate` | `"distance < enemy.r + player.r + 8 && player.iframes <= 0 && enemy.st2 <= 0"` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.cooldown_rule` | `"40 + trunc(random() * 20)"` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.projectile_charge_ticks` | `60` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.projectile_charge_bean` | `"normal"` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.projectile_range` | `400` | `enemy_melee_flesh_crawler.gd` `_physics_process`:177–196의 접촉/공통 charge; automatic windup 추가0 |
| `native_source_contract.normal_idle.source` | 6 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.conditional_melee.entry` | `"eCircle && distance < enemy.r + 30 && atkTicketRequest(enemy)"` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.windup_ticks` | `35` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.telegraph_ticks` | `20` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.attack_ticks` | `8` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.hit_threshold_ticks` | `5` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.hit_threshold_rule` | `"st2 <= 5 && st2 + sp > 5"` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.recovery_ticks` | `35` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.next_idle_ticks_rule` | `"15 + random() * 15"` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.new_automatic_entry_admitted` | `false` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.attack_tickets_added` | `false` | 원 eCircle/티켓 조건부 기록; 자동 entry·35→8→35 attack FSM 미이식 / 어택 티켓 추가0 |
| `native_source_contract.conditional_melee.source` | 5 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.incoming_damage.flat_def_field_exists` | `false` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.flat_edef_field_exists` | `false` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.eRes` | `[0,0,0,0,0,0,0]` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.stat_str_multiplier` | `1` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.raw_no_equipment_critical_chance` | `0` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.critical_default_multiplier` | `1.5` | 원 modifier metadata만 보존; frozen/장비 crit 상태 소비 미이식 |
| `native_source_contract.incoming_damage.stunned_nondot_multiplier` | `1.5` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.frozen_nondot_multiplier` | `1.5` | 원 modifier metadata만 보존; frozen/장비 crit 상태 소비 미이식 |
| `native_source_contract.incoming_damage.shield_absorbs_after_modifiers` | `true` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.shield_gate` | `"(!isDot \|\| opts.shieldHit) && eShieldMax > 0 && eShield > 0"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.shield_absorption_rule` | `"absorbed=min(eShield,dmg); eShield=max(0,eShield-dmg); dmg=max(0,dmg-absorbed)"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.hp_damage_is_remaining_damage` | `true` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.full_shield_absorption_hp_alert_flash_hitstun` | `false` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.hit_flash_ticks` | `6` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.hit_stun_ticks` | `8` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.hit_stun_gate` | `"remaining damage > 0 && nonboss && state idle"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.weapon_knockback_rule` | `"min(remaining_damage * .25, 15)"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.magic_knockback_scale` | `0.2` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.poise_hit_is_opt_in` | `true` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.poise_damage_rule` | `"trunc(remaining_damage * opts.poiseMult(default1)) only opts.poiseHit non-DOT"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.full_shield_absorption_poise_change` | `false` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.stun_ticks` | `180` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.poise_regen_interval_ticks` | `200` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.poise_regen_amount_rule` | `"trunc(maxPoise * .15)"` | `enemy_melee_flesh_crawler.gd` `receive_damage`:262–305 / `_apply_poise`:307–314 / regen:151–155; 현재 raw 조건 범위만 소비. 생존 stun 실행0 |
| `native_source_contract.incoming_damage.source` | 17 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.physical_post_hit_effects.burn.damage_pool` | `48` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.duration_ticks` | `600` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.interval_ticks` | `30` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.max_stacks` | `10` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.raw_tick_damage` | `2` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.native_dtype` | `"phys"` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.dot` | `true` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.native_rule` | `"remaining lifetime -= sp; tick += sp; lifetime <= 0 drops before damage; tick >= 30 resets tick to 0 and hurtP(max(1,trunc(total/20)),{dot:true,burn:true})"` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.currently_ported` | `false` | 원 post-hit burn metadata 보존; 이번 Godot burn DOT 실행 미이식 |
| `native_source_contract.physical_post_hit_effects.burn.source` | 2 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `native_source_contract.physical_post_hit_effects.bite.duration_frames` | `48` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.cycle_frames` | `16` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.max_instances` | `3` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.sheet_row` | `1` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.sheet_frames` | `6` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.size` | `36.0` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.size_rule` | `"clamp(22.05 * clamp(size*1.5,1.2,4) * .7 * 2 * .55 * .65,22,36)"` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.anchor_rule` | `"player.xy - heading * (18-bite*3,12-bite*3) + (0,-14)"` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.frame_rule` | `"min(5,floor((age mod 16)/16*6))"` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.native_pivot` | `[0.5,0.5]` | `enemy_projectile_physical.gd` `_add_bite`/`PhysicalBite`:110–164 소비; 실제 row1/47→48틱 삭제 기술 검증, 공개 픽셀0 |
| `native_source_contract.physical_post_hit_effects.bite.source` | 5 원 코드 위치; 정확 목록은 config의 이 path 참조 | 출처 metadata; 기술/공개 검수 PASS가 아님 |
| `scope.exact_record_only` | `true` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.source_snapshot_edited` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.source_model_generated_or_modified` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.new_rigging` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.source_24_unique_frames` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.source_24_fps` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.full_native_enemy_system` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.conditional_ticket_melee_auto_entry_ported` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.burn_dot_ported` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.revival_ported` | `false` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.runtime_consumer_verification` | `"pending owner implementation and new unit validation"` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |
| `scope.visual_verdict` | `"not reviewed in this source/config/byte-copy task"` | config 생산 당시의 범위 snapshot; 현재 고유3 기술 검증 결과와 분리 |

### 실제 API / 코드 수치와 미이식 경계

| 실제 소비 위치 | 정확 계약 / 값 | 검증·한계 |
|---|---|---|
| factory `_is_flesh_target` / `_validate_flesh_config` / `consume_atomic` | 정확 id/order14/type0/physical0/skin/elite0/mods[]/aura null/spawn 두 원 double 값만 지원. 원16 record의 runtime/support 값 수정0 | actual world3 nodes/13 unsupported 및 neighboring guardian29/archer1 거부 확인 |
| crawler `configure(runtime,world)` | 실제 data 독립 deep clone, runtime native_final27개 원337과 각각 같은 값. 원 initial_timers 보존, native_frame0/charge0/idle | headless admission 시간0; 전체337개는 report 원 record로 별도 보존 |
| crawler `_physics_process` | delta×60 ticks; 로직 시작 frame 증가. 원 R32793도 pause return 뒤 실제 로직 시작 전에 `_gameFrame++` | birth330/actor330 oracle. actor별 native_frame 및 shot birth 기준 local clock이고 원 전체 global phase 동일 replay 주장0 |
| crawler 이동·분리 | Godot velocity=per_tick×60. 원 direct1.6+flow1, 비alerted far400 반환, separation query4.4×r/추가4/force1.5/쿨3/거리²>.01 | actual 기술 movement/walk 확인. 원 다중 개체 집단 전투·실제 충돌 route 공개 검수0 |
| crawler walk·style | 거리²>.25로 moving; hold3틱. native_frame에 무관한 walk128px당4frame. 등장 alpha `max(0,1-spawnTicks/20)`·hitflash6으로 RGB `(1+flash/6,1,1)` | 초기 SW/이동 frame1 실제 Sprite2D 확인; 예술/alpha clipping 공개 픽셀 검수0 |
| crawler hitStun / poise | 먼저 hitStun return 후 stunned/charge cancel. hitStun8/flash6, poise≤0이면 stun180, ordinary regen200에 floor(875×.15)=131, stun 종료 즉시 boss reset0 | 생존 stun180/실제 cancel/regen 실행 미검증. 임의 poiseMult7·HP/clock/state 점프0 |
| crawler damage 수용 | alive이며 amount>0 요청만 수용. shield 후 remaining에 HP/KB 및 opt-in poise. weapon 기본poise0, 기검참 KB multiplier.5, magic KB .2 | 원 frozen/장비crit/DOT/full status 소비 전체 포트가 아님. 비양수 API 요청 거부는 원 hurtE min1 전체 계약으로 과장하지 않음 |
| crawler physics / depth | actor layer4/mask1\|2, PAUSABLE/interpolation ON, `clamp(int(y/4),-2000,4000)` | map/geometry 변경0; actual public wall contact 미관측 |
| crawler charge / HP 표시 | charge radius r+13, -π/2부터진행, arc48segments/width3/RGBA(.9,.25,.2,.85). HP bar(-48,-height/2-14,96,5), 배경(.12,.1,.1,.9)/HP(.53,.13,.18) | 첫 consumer 표시 코드이며 새 아트 승인/전체 VFX 완성 주장0 |
| physical `configure(origin,aim,profile,target,world,birth_frame=0)` | actor center / heading normalized / damage24 / life120 / speed300 / birth native_frame 저장 | actor의 실제 차징으로 생성 확인; born world값 보정0 |
| physical `_physics_process` | delta×60, 시작frame 증가→life .667감소→life≤0 종료. life>30이면 .00109083×ticks turn; x/y는 heading×300×delta. center-wall 및 segment/playerprevious-position 최소거리 판정, segment길이²≤1은endpoint거리 | raw code 경로. 새 fixture 실제 swept 접촉·visual clock 분리 확인, 전체 궤적/수명끝 공개 검수0 |
| physical player gate / callback | HP>0/iframes≤0/state≠charge 및 distance<P.r+13 → `receive_damage(24,'parry',heading,2.0)`; layer8/mask0 / 원 radial 판정 | 실제 player EDEF0·additive2×2 및 bite 확인. full Q패링·반사/장비status 미이식 |
| player `receive_damage` 선택적 인자 | `native_knockback_strength=-1.0` 기본. ≥0이면 exact strength 사용, `<0`이면 기존 clamp(finalHP/maxHP×30,1,12). 기존 HP/iframe 수용 이후 `_knockback += normalizedHeading×strength` | parry→energy_def 분기는 기존 경로이며 추가0. 기본 HP/ST/DR/poise/charge/Q 값·식 변경0, 기존 피해 검사 재실행0. 새 accepted2 packets에서 exact2 합4 확인 |
| physical depth / sprites | layer8/mask0, nearest/center. z=`clamp(int(y/4)+1,-2000,4000)`. 원 flight frame `((int(native_frame)>>2)+int(x*.03)) mod8`; cell768×384/row0/rotationheading | camera 원 global `_gameFrame` phase 전체 동일 주장0. child별 실제 clock을 기술 검증 |
| physical bite | max3(새 추가 때 첫개 삭제), age48틱 종료/16틱주기/row1 frame0..5, size36×(1-bite×.16), offset `-heading*(18-3bite,12-3bite)+(0,-14)` | 원 Sprite2D row1/47→48 수명 실제 호출 검증; max3 cap·전체 visual curve 실행 검수0 |
| physical bite style | scale=(size×2/768,size/384), rot=heading+sin(age×1.4)×.055, alpha=min(1,(48-age)/12), nearest/interpolation ON/PAUSABLE | 상수 보존 코드 경로; 원 master visual 품질 승인 아님 |
| redBean lifetime / 원 camera | 원 R35367: redBean은 life≤0에서 종료, 非redBean만camera2500 내 life1 연장. 이 etype0은 원17361–63 redBean=true | life120/.667 종료형은 맞음. 별도 원35288–90 camera2500밖 즉시recycle 및 만료 physical fx(radius60/life12/흰12part/shake3)는 이번 미이식 |
| burn / status / conditional melee | 원 burn pool48/t600/30interval/10stacks/raw2, frozen/crit modifier1.5, eCircle35→attack8/hit5→recover35 | 값은 원 metadata로 보존. burnDOT·frozen/crit·새 자연 melee 전조·티켓·revival·full native enemy system 미이식 |
| telemetry / main summary | 실제 `enemy_spawn`, `enemy_aggro`, `enemy_contact`, `enemy_charge`, `enemy_projectile_birth/hit/end`, `enemy_damage/death`, 코드상 `enemy_stagger/charge_cancel`; main `_encounter_summary`3/13 | report 원 support/runtime와 current status 별도. 현재 인간 source1 paused 앱에 소급0, actual new live report 저장0 |

### 실제 복사된 원 resource

| group / direction | resource | dimensions / bytes | 동일 원본 SHA256 |
|---|---|---|---|
| base_textures / south | `res://assets/enemy/atlas_ch1_8dir_south.png` | `[2048,1280]` / 798229 | `156e76481bc26682afe7d85c01c94477e66e1718bbe88f9d67baddbcc561da23` |
| base_textures / south-east | `res://assets/enemy/atlas_ch1_8dir_south_east.png` | `[2048,1280]` / 808193 | `ed7693ea4052cf27c4318864f6e54edc846e941a8c8e12afecf3e03c904075ba` |
| base_textures / east | `res://assets/enemy/atlas_ch1_8dir_east.png` | `[2048,1280]` / 693012 | `2b4cbc2cb2f8b33f1ce10cdce6e17b4e6b7c75fff13e0fd60787ddb3e803a81a` |
| base_textures / north-east | `res://assets/enemy/atlas_ch1_8dir_north_east.png` | `[2048,1280]` / 729568 | `b63ed215d947a6eb6b4709dc03fe169bb9482fe34814ef2a78f1a7efd3b2fff3` |
| base_textures / north | `res://assets/enemy/atlas_ch1_8dir_north.png` | `[2048,1280]` / 761588 | `7c4e569e3c7e35c50e72e0b9ecb7c8fffe3ee73e3b98be976ced6d7a34a8d252` |
| base_textures / north-west | `res://assets/enemy/atlas_ch1_8dir_north_west.png` | `[2048,1280]` / 722767 | `e48798ba3d89e7a80ee8942be10439126d57b876bcb5228888df9a289b586d69` |
| base_textures / west | `res://assets/enemy/atlas_ch1_8dir_west.png` | `[2048,1280]` / 655038 | `d14e94607e70a14c068402a6d1047e78ab0cd710d07c61c42ec090f592acc27f` |
| base_textures / south-west | `res://assets/enemy/atlas_ch1_8dir_south_west.png` | `[2048,1280]` / 804413 | `4801bd016a0804fedbfaa5d7b97eda7924cb093565d2a7864402570df6add64e` |
| walk_textures / south | `res://assets/enemy/atlas_ch1_8dir_walk_south.png` | `[8192,1280]` / 2232971 | `5de3eb47f666d60c72da13b9cee90a1544b1f325db62e9ce2624551205f58429` |
| walk_textures / south-east | `res://assets/enemy/atlas_ch1_8dir_walk_south_east.png` | `[8192,1280]` / 2174353 | `b5c16fd3b82d402e33d42cb087bdaf85aa1459b423aab9f8f654f74ea0142070` |
| walk_textures / east | `res://assets/enemy/atlas_ch1_8dir_walk_east.png` | `[8192,1280]` / 1972388 | `95acdda361d2d74add386083fc51dd44c8ea20d7883b299d1a00be618343c854` |
| walk_textures / north-east | `res://assets/enemy/atlas_ch1_8dir_walk_north_east.png` | `[8192,1280]` / 2060929 | `ebc2ba5f5f995e0c104c81829d97162d39b888ed92ffca35f016715a9396e41f` |
| walk_textures / north | `res://assets/enemy/atlas_ch1_8dir_walk_north.png` | `[8192,1280]` / 2119638 | `04471ea9d4b695cc79dd8285ce78316c4bb01749d24c4319936befa066d96538` |
| walk_textures / north-west | `res://assets/enemy/atlas_ch1_8dir_walk_north_west.png` | `[8192,1280]` / 2102807 | `6a89356bb56928a991f5e7f8dd0f0234ff0597d064af271fbe6673f3f4000e6c` |
| walk_textures / west | `res://assets/enemy/atlas_ch1_8dir_walk_west.png` | `[8192,1280]` / 2008571 | `564b5f56042aaeb73e585ff1b68ab44faaac08f2f07abc3b1431710c2f30ac58` |
| walk_textures / south-west | `res://assets/enemy/atlas_ch1_8dir_walk_south_west.png` | `[8192,1280]` / 2090379 | `2bcf554056a6cc4fa8bd250b69644d251d85366b645fb726399ec3b1b7fa50e3` |
| physical-mouth / east | `res://assets/enemy/proj_phys_mouth.png` | `[6144,1152]` / 3991401 | `4207e233848d5394648bf98829044956c53cc79ac5ebd6d08f2b1800d89b7c13` |

각 asset의 `source_sha256_before=source_sha256_after=destination_sha256`·`byte_identical=true`는 source 담당의 `asset-copy-receipt.json`을 따른다. 이 worker가 이전 PNG의 전체 alpha/oracle·원 factory 재실행·픽셀 공개 검수를 반복한 것은 아니다.

## 신규 기술 검사 결과

| 고유 단위 | 검증할 실제 소비 / 한계 | 상태 |
|---|---|---|
| `admission` | 실제 world가 원16 중 medium2+정확 record14 한 개만 생성해3/13. 원 source/full337 field report와 actual profile27개 원 값을 각각 보존; SW 원 atlas/col6 region·초기 HP875/shield875/ATK31·실제 main summary 확인 | 최초 fixtureFAIL1 assertion→해당 실패만 수리 후 PASS |
| `native_clock` | 원 LOS/거리 이동·walk128당4frame·39번째 접촉24, 초기269.478… wait→270번째 charge60→330번째 birth24/120/300. R32793 시작 frame increment: birth330. visual refresh4회에서 clock/life 증가0 및 실제 swept parry2 KB request | 최초 fixtureFAIL2 assertions→해당 실패만 수리 후 PASS |
| `shield_packet` | actual API의 fullshield100·weapon overflow225/KB15·기검참 remaining125/poise125/KB7.5. 실제 player까지 물리탄parry24 두 번→HP350→302/KB합4, 원 bite row1 및47/48틱 수명 | 최초 PASS; 재실행0 |


headless 기술 fixture는 원 record로 독립 actor/world/target을 최초 건설하고 필요한 실제 class 메서드만 호출한다. 현재 사람의 게임 HP·좌표·시간·입력·callback·observer를 주입하거나 승리 장면을 만들지 않는다. 기술 fixture의 초기 target/경계 조건과 직접 simulation delta 호출은 공개 정상 플레이 증거와 명확히 구분한다. 이전 통과한 검사·소스 재추출·공개 보고서 저장은0이다. 첫 실행의 명시적 native 메서드524회와 실패2 재실행474회는 독립 기술 fixture 호출 수이며 실제 정상 플레이 시간·벽시계 성능 표본이 아니다.

### 실행 ledger / 보존 원본

외부 증거 root는 `godot-native-first/encounter-etype0-physical-first/`이다. 실제 Godot는 `4.7.2.stable.official.ed1daf0bf`이며 테스트가 preload한 main/factory/actor/projectile/player의 새 경로를 같은 headless 실행에서 parse했다. 별도 old suite/check-only·GUI 실행0이다.

| 실행 | 실제 결과 | 실패 원인 / 수리 범위 | raw |
|---|---|---|---|
| 새 고유3 최초 | exit1 / shield_packet1PASS, admission·native_clock2FAIL / 총3 assertions / 명시 method524회 | admission은 profile native_final27개를 원337 전체와 동일하다고 잘못 기대1. clock은 원 gameFrame 종료증가라는 잘못된 전제로 birth329·visual2assertion을 기대 | `tests/first-three.stdout.log`, `first-three.stderr.log`, `first-three-receipt.json` |
| 실패2만 수리 재실행 | exit0 / admission·native_clock2PASS / assertions0 / 명시 method474회 | 각27개 원 origin+actual profile deepclone 및 실제 reportfull337 검증 유지. 부모 회수 R32793 시작increment를 반영해 birth330 기대. 제품 수리0 | `tests/failed-two-repaired.stdout.log`, `failed-two-repaired.stderr.log`, `failed-two-repaired-receipt.json` |
| 동결 / 현재 고유 수 | 새 고유3 기술 PASS | 통과 shield_packet 반복0; 앞선 factory3/first-play5/JS 반복0·합산 최신8PASS 주장0 | `tests/contracts-ledger.json` |

## MAP PRODUCTION REPORT (§23) — 기존 geometry 소비 경계

| 항목 | 이번 단위의 범위 |
|---|---|
| MASTER / STAGE | CH1 초기 record14 한 consumer 연결; 새 stage 제작0 |
| LARGE / MEDIUM / GROUND / LANDMARK | 원 지도·PNG·배치·nav·collision 변경0 |
| PLAYABLE / COMBAT | 새 원 idle/접촉/물리탄/쉴드 기술 검사3PASS; 자연 전조 FSM·공개 새 교전 미완 |
| CAMERA QA | 현재 인간 source1 fullscreen pause 화면 유지; 새 방향/픽셀 공개 검수0 |
| TECH QA | 새 고유3 PASS: 최초1PASS/2 fixtureFAIL→실패2 수리PASS; 통과1 및 이전 고유3/5 재실행0 |
| FILES / GIT | 부모가 정상 owned checkpoint 담당; 이 worker Git/stage/rollback0. 다른 WIP 보존; 성공 전 commit 완료 표시0 |
| VISUAL VERDICT | **RETOUCH** — 새 consumer 실제 공개 소비·픽셀·전체 AI·최소 Windows240 미검증 |
| NEXT PASS | 별도 승인된 새 앱에서 정확 크롤러의 실제 방향·접촉·탄·wall/LOS 검수. 생존 stun/charge cancel·burnDOT·camera 경계·full Q/최저 Windows240은 별도 미완 범위 |


## 2026-10-17 exact type0 현재 필드 소유자 후속

| 항목 | 현재 코드 / 검수 범위 |
|---|---|
| `ch1_initial_015 / order14 / etype0 / physical` | 실제 `enemy_melee_flesh_crawler.gd`의 `st2` canonical / `_contact_ticks` alias, `mhp` canonical / `max_hp` alias, source numeric `el` / `element` 이름 alias를 같은 actor 수명으로 통합. 별도 타이머·spawn record current 대체0 |
| 공개 source field prefix | World의 current same-Node invocation→source `events` 순서의 known shield/alert/recover-st2/HP/hit field write. 기존 `receive_damage` 재호출·doublemath0. 미소유 status/poise/KB/owner request/presentation/kill에서 exact partial. `full_hurtE_ready=false/source_clock_ready=false` |
| 첫 새 검사 | 21/21 PASS·exit0·양 로그 ERROR/WARN/leak0. actual actor methods의 렌더 setup/_draw 억제·projectile 및 기타 World 대역 fixture; full Main·source acc/RNG·실전/전체 최신/시각 PASS 아님. 이전 frozen 검수 재연0 |
| 정본 | [일반 몬스터 필드 소유자](FDG_NATIVE_NORMAL_ENEMY_FIELD_OWNER_20261017.md). 원 snapshot/support/runtime 및 옛 배송·미이식 이력은 보존하며 이 표는 새 field API만 갱신 |


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
