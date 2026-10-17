# 일반 hurtE 실제 provider 4 접점 — 2026-10-17

| 항목 | 현재 상태 |
|---|---|
| 소유 코드 | `godot/scripts/main.gd`, `godot/scripts/native_source_player_initialization_services.gd` |
| 범위 | 동일 Main/Services/Player/World/State/Resources/Providers의 장비·공격력 provider 4 Callable 제공 |
| 실행 경계 | normal hurtE 후보/호출자 제품 등록 없음. 나머지 21 owner·source clock·poise19985·KB42483·효과 미연결. full25/full_hurtE/latest_full_game=false |
| V4 | 외부 후보 4fd77588883ffe4ab360c624f9830e7c3a6daa95edd7d7e9d1cb19d04d4def33 제품 복사·등록·실행0. 최초 행동검수108중3FAIL 상태 보존; 실패3 후속은 별도 담당 |
| 사전 보존 | 정확13경로(code2/docs11)의 I/R WORK+HEAD26행, 기존12경로 물리48copy 및 신규문서 부재를 첫 코드쓰기 전에 저장. 외부 NORMAL-HURTE-PROVIDER-BINDING-20261017/prewrite-manifest.json |

## API와 원 결과

| 적용 위치/API | 정확 계약 |
|---|---|
| Main `get_native_normal_enemy_damage_provider_callbacks()->Dictionary` | 실제 live Main 및 정확 SourceInitializationServicesScript를 확인하고 현재 Services 공개 getter를 소비한다. 미준비는 `{}`이며 25 owner map을 제조하지 않는다. |
| Services `get_normal_enemy_damage_provider_callbacks(caller:Node)->Dictionary` | caller가 configure 때의 weak Main과 같고 현재 수명이 유효할 때 네 키만 반환한다. 값은 이 Services 소유 Callable이며 조회 결과/숫자 snapshot을 저장하지 않는다. |
| `eq_affix` → `read_normal_enemy_equipment_affix(id:Variant)->Dictionary` | 현재 identity 확인 뒤 기존 Main `read_native_source_equipment_affix(id)`를 소비. 원 cache/명시 무효화/partial prefix를 유지한다. |
| `u_eq` → `read_normal_enemy_unique_equipment(stat:String)->Dictionary` | 현재 bundle.formula.u_eq(stat) 원 Dictionary 그대로. 원 slot 순서/first truthy raw 검색을 재구현하지 않는다. |
| `p_atk_mul` → `read_normal_enemy_attack_multiplier()->Dictionary` | 현재 bundle.formula.p_atk_mul() 원 Dictionary 그대로. passive 공식/사전 합산 없음. |
| `melee_ref` → `read_normal_enemy_melee_reference()->Dictionary` | 현재 bundle.reference.melee_ref() 원 Dictionary 그대로. value-or-null 단축 API를 사용하지 않는다. |
| Services `_read_normal_enemy_provider(callback:String,args:Array)->Dictionary` | 매 callback 시 수명 확인→해당 단일 원 provider 호출. READY/raw value/source/reason/origin/slot/non_finite/undefined_reads를 복사·삭제·scalar 변환하지 않는다. 새 retry/cache clear/eager query/0 fallback 없음. |

| 실제 원 metadata | 반환 형식 / 소비 한계 |
|---|---|
| affix `eq_affix`214–232 | non_finite/undefined_reads 부재. READY, SOURCE_THROW, READY_PARTIAL_AFTER_SOURCE_THROW, NOT_READY와 원 value/origin/reason 보존. origin=absent_zero/value0은 명시 원 부재 결과 |
| formula `_ok`119–122 / `_fail`124–126 | non_finite는 bool, undefined_reads는 Array(default[]/failure[]). u_eq의 raw Variant/slot은 그대로 |
| formula `pass_dmg_sum`306–352 / `_passive_mul`153–157 | p_atk_mul은 같은 builder를 사용하며 undef:Array를 전달. 없는 PASSIVES 항목은 nonempty undefined_reads 및 원 NaN을 낳을 수 있다. 숫자 count0으로 정규화하지 않는다. |
| reference `_ok`378–380 / `_fail`382–383 | non_finite bool, undefined_reads 부재. 원 status/value/source/reason 유지 |
| binder와 후보 구별 | binder는 nonfinite/부분상태/raw String 등을 그대로 전달한다. V4의 finite numeric/빈undefined 부분지원 중단 규칙을 binder나 전체 원 provider에 강제하지 않는다. 실제 전체 parity 미증명 |

## 수명과 기존 context 보존

| 위치 | 계약 |
|---|---|
| `_source_owner_error()->String` | 기존 `_context_error`의 ownership prefix를 그대로 추출. 원 configured/configuring, weak owner 생존, Main script/fields, World.player, actor·State·Resources·Providers getter identities, holder parent, 같은 Tree/removed-ready 검사를 유지한다. 기존 provider readiness 검사는 계속 수행한다. |
| 기존 `_context_error()->String` | 같은 prefix 통과 뒤 기존 current_g→current_p→current_stats→current_passives→current_inventory→OPT identity 순서 그대로. 기존 Services 소비자의 도메인 준비검사를 제거하지 않는다. |
| `_normal_enemy_provider_error()->String` | configured true, 위 원 ownership prefix, Main.source_initialization_services==self, Main._native_main_service_live()를 확인한다. 다섯 current domain 및 OPT getter를 사전 호출하지 않는다. |
| 보유된 Callable | 같은 Services를 가리킨다. Main이 Services/Providers/State/Resources/dispatcher/actor/World를 교체하면 오래된 Callable은 해당 원 공급자를 조회하기 전에 NOT_READY. provider bundle은 조회마다 현재 소유자에서 받는다. |
| 객체 수명 | Services의 Main/actor/context 참조는 기존 WeakRef. 반환 map을 Services 안에 저장하지 않아 self-Callable map 소유 cycle을 추가하지 않는다. |

| 새 미준비 reason | 조건 |
|---|---|
| actual_normal_enemy_services_replaced | 실제 Main의 현재 Services가 이 callback owner와 다름 |
| actual_normal_enemy_Main_not_live | 실제 Main tree/script/queued guard 실패 |
| actual_normal_enemy_provider_bundle_lost | identity 확인 후 현재 bundle이 비어 있음 |
| normal_enemy_provider_not_bound | 내부 dispatch의 네 이름 밖 요청 |
| unconfigured / 기존 owner error | 기존 초기화·수명 오류 이름 보존. NOT_READY는 value0/null 성공으로 변환하지 않음 |

## 새 영향 검수와 한계

| 검수 | 증거 / 한계 |
|---|---|
| 최초 contact-first | Godot4.7.2 headless, 첫31/31 PASS, exit0, stdio/Godot 양로그 ERROR/WARNING/leak0. 성공 재실행0 |
| 대상 | 실제 변경 메서드와 기존 owner/context 메서드를 정확 추출한 격리 fixture. Main script path/Tree는 fixture 안에서 실제 검증하고 State/Resources/Providers/helper/OPT/dispatcher는 명시 대역. 실제 전체 Main·Services.configure·원 helper 수식/실 domain 값 실행 아님 |
| 새 경계 | 네 키/같은 Services owner, map 생성 시 query0, 원 query1회/raw Dictionary identity, SOURCE_THROW/부분 cache 상태/raw String/NaN+undefined/NR 보존, 다음 현재 결과, Services 및 Main owner fields 교체, World/actor mismatch, holder reparent, provider NR, World 재배치, removed-ready/queued actor, Main free 후 retained callback 거절 |
| 기존 context 영향 | 같은 다섯 domain→OPT 순서 및 current_stats 첫 실패에서 정지. prefix와 tail 원 코드 보존은 별도 정적 대조 |
| 미검증 | 전체 actual Main/SourceState/ResourceAuthority/Providers.configure 수명 통합, 실제 normal hurtE caller/V4, source clock/RNG/kill/effects, 실제 인게임/PC/export/시각/성능. 테스트 통과를 최신 게임 완료로 세지 않는다. |
| 보호 범위 | 게임/브라우저/Godot GUI/서버/API/save/원 PNG·audio read/copy/import0. 보호 Q/E/BOSS/맵/렌더러/2_3 수정0 |

외부 기록은 `sync-git-main-20261016/NORMAL-HURTE-PROVIDER-BINDING-20261017/` 아래 prewrite manifest, docs-search 원시 로그/분류, contact-first 양로그/first.result.json, fixture-source-manifest를 따른다. 버전 선언/열린 게임/export 정렬 증거를 대체하지 않는다.

최초 정적 diff --check는 CHANGELOG에 새로 추가한 CRLF 행을 trailing whitespace로 판정해 실패했다. 기존 CHANGELOG byte prefix는 보존하고 이 단위의 추가분만 LF로 수리했다. 실패한 lint만 다시 확인하며 첫 기능31 PASS/성공한 정적7개는 재실행하지 않는다. 전체 최초 정적 clean=false 이력을 보존한다.
