# 일반 type0 실제 동기 poise owner — 2026-10-17

| 항목 | 현재 범위 |
|---|---|
| TASK / 실제 actor | `ROOT-NORMAL-ENEMY-SYNC-POISE-OWNER-20261017`; 정상 Factory의 `ch1_initial_015 / order14 / etype0 / physical / elite0 / mods[]` |
| parent / branch | local parent `f6efa6fbfcf9ca3d293fba510da74dd6033cad20`, `codex/mac-normal-enemy-sync-poise-20261017` |
| 실제 연결 | 같은 World invocation의 v3 `poise_hit(call)`/42490 → 원순서 parent prefix → 같은 실제 actor poise/regen/stun/max-stun → fresh same-actor view |
| 준비 구분 | nonbreak와 원 early guard는 원 함수 반환 `false`를 정상 owner 성공으로 전달. break는 core 실제 적용 후 미소유19985에서 partial이며 원 함수의 true 반환은 미확정 |
| 전체 상태 | `full_hurtE_ready=false/source_clock_ready=false`. v3 `decide` 자동 연결·fullhurtE/공용 RNG/사운드·VFX/kill/실전/main·R 적용은 미완 |

## 확인한 source 계약

| 위치 | 일반 etype0 source / 현재 owner |
|---|---|
| R `game.html:19972–19977` | `_poiseHit`: `!e || !e.alive || amt<=0`이면 변화 없이 false. normal은 `poise-=amt`, `poiseR=0` |
| `19978–19982` | poise≤0이면0 clamp → `stunned=max(current,180)` → `_maxStunned=max(current||0,180)`; 일반에는 boss `_pImmune` 조건·300면역을 넣지 않음 |
| `19985` | core 뒤 첫 미소유는 현재 `_uqScCtx` 평가. 이 이후 unique refund/`_uqS`·SFX/text·slowMo·14 particle RNG/true 반환을 fake 완료·대체 RNG·false/null 가정으로 진행하지 않음 |
| `19995–19997` | break tail까지 끝난 경우만 true. nonbreak는 false. owner 실행 성공/실패와 boolean 반환을 별도 보존 |
| v3 `42490` | `kind=poise_hit`, `line=42490`, `amt=TYPE_INT`, `commit`의 기존 세 stream/events+4 from cursor. 부모 prefix를 먼저 실제 적용한 뒤 동기 core, 그 후 fresh parent view |
| `mkEn` / 고정 record | current source 생성 `poise=maxPoise=HP`이며 이 actor는875/875. `_maxStunned`는 생성 object에 없고 `mkEn` 해당 assignment도0, record15에서도 absent. 현재 값과 key presence를 따로 소유 |
| source read hash | 처음 sed read hash는 `NOT_RECORDED`. 후속 정확 `mkEn` AST read `2026-10-17T00:02:58.177Z`의 SHA256=`868878a1f7778219f61badd01faca00d2c199f7fa13bb7a2ff0bc49d66249999`. 이후 source 전체 catalog/보호 callee body를 읽거나 실행하지 않음 |

## 실제 공개 owner / 상태 수명

| API / 필드 | 동작 |
|---|---|
| World `get_native_normal_enemy_poise_hit(invocation)->Callable` | actual same World/current same-actor invocation만 반환. World가 self-bound Callable을 저장하지 않고 invocation도 weak World/actor만 유지 |
| invocation `poise_hit(call)` | parent prefix를 기존 `consume_prefix`로 원순서 적용. 중간 미소유 효과면 그 prefix만 보고하고 poise 실행0. 같은 `_sync` invocation에 이미 진입했으면 자동 재진입/재적용하지 않음; 새 전역 공격 제한·dedupe ID 없음 |
| actor `apply_native_source_poise_hit(owner,amount)` | current owner/callback·TYPE_INT amount·실제 필드 권위 확인. 기존 `receive_poise_damage`를 호출하지 않음 |
| early guard | 사망/amt≤0에서는 `source_body_returned=true/source_return=false/poise_core_applied=false`이며 기존 poiseR/stun/key presence 유지 |
| nonbreak | 같은 actual `poise` 감소/`_poise_regen=0`. 반환 false는 `ok=true/staggered=false`, `executed=1`, fresh `parent_view`로 전달 |
| break | 같은 poise0, `_stun_ticks=max(current,180)`, actual `_maxStunned`/presence 갱신. `ok=false/prefix_applied=true/poise_core_applied=true/core_staggered=true/source_body_returned=false`, reason=`source_poise_sky_context_unbound_19985` |
| cursor / owner core | `applied_prefix` 네 값은 parent field/effect stream 진행만 나타냄. 별도 poise core 적용은 네 cursor를 증가시키지 않음. parent cursor0이라도 core 실제 적용이 있을 수 있으며 전체 작업0/성공으로 정규화하지 않음 |
| `_maxStunned` | known absent일 때만 원 `undefined || 0`의0 사용. current 값이 미지원 shape면 해당 breaking branch를 거부. nonbreak에서는 source가 읽지 않는 stun/max-stun 권위를 요구하지 않음 |
| native 시간 소비 | 현재 native `_physics_process`가 같은 `_stun_ticks`와 regen counter를 소비하고 stun branch에서 기존 charge를 취소. 새 source clock/별도 타이머/regen 배율 없음. source acc/sp·전체 regen/reset 동등성은 미확인 |
| legacy pending | 기존 deferred poise queue를 버리거나 동기 호출로 위장하지 않음. invocation 시작 뒤 새 pending이 도착하면 positive core는 거부하고 pending 보존. source amt≤0 guard는 그보다 먼저 적용 |
| legacy break | 기존 `_apply_poise`의 정상 actor break도 같은 max-stun field/presence를 게시. 기존 deferred timing·HP/쉴드 계산·알림·그 외 actor 지원 범위는 유지 |

## 새 검수 / 정확한 한계

| 단계 | 실제 결과 |
|---|---|
| 첫 새 poise coupling | **21/21 PASS**, exit0, first stdout/Godot 양쪽 ERROR/WARN/ObjectDB/resource leak0. 앞선 field21/producer37/24/29/기존 parse·수송 재연0 |
| 검수 후 source 분기 검토 | nonbreak에도 stun/max-stun 권위를 요구하던 guard를 source가 읽는 breaking branch로 제한. 첫21 runtime 실패는 없었고, 최초 fixture/source/raw를 보존한 채 guard 수정 |
| 변경 영향만 추가 | 별도 새 constructor-variant fixture **2/2 PASS**, exit0, 양 로그 ERROR/WARN/leak0. unknown max-stun의 nonbreak false 성공과 그다음 실제 break의 exact NR만 확인. 첫21 전체 재실행0; final code의 전체21 단일 재실행 PASS라고 세지 않음 |
| 실제 코드 / fixture | 실제 actor configure/FSM/new atomic core/callback, 실제 World6 method 추출. actor `_ready/_draw` 렌더 setup 억제·physical projectile 및 기타 World/Player 대역. 전체 product scene/원 asset/source G acc/RNG tail/실전 검수가 아님 |
| 상태 확인 | prefix→poise→fresh view, false 반환과 NR 구분, parent4cursor/core 분리, dead/0/negative guard, regen reset·native stun179, 자연 native charge270틱 후 실제 break/다음 tick cancel, legacy pending 보존·같은 max-stun 게시, retained callback 권한 소멸 |
| constructor 한계 | high-current-stun/high-max/미지원 max 값은 생성자 variant fixture이며 원 고정 spawn 값/실제 플레이 이력으로 주장하지 않음 |
| 실제 break tail | 현재 actor stun 수치는 적용되지만 unique/SFX/slowMo/particle/full 함수 true return은 미완. 원 source damage/fullhurtE 완료 아님 |

원 `docs/8.0몬스터디자인/몬스터_공격시스템.md`의 낡은 HP×.5 표기만 확인된 일반 type0 생성 계약 HP100%로 정정한다. boss 면역·수치·Q/E·파링·ticket/밸런스·renderer/asset/save는 변경하지 않는다.

증거 절대경로: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-ENEMY-SYNC-POISE-OWNER-20261017/`. prewrite initial10/I·R40rows32copies→manifest→code, 이후 관련7docs는 own 쓰기 전 extension28copies; final17 전부 첫code전 backup이라고 보고하지 않음. 각 code/doc 쓰기 시각과 최초21/후속2 입력·결과·양로그를 따로 보존한다. 시작 주간44%, 일간UNKNOWN/공유 계정; 종료와 정상 local/GitHub WIP 보존은 외부 receipt에 기록한다. 현재 실행본을 자동 최신화하지 않는다.


## callback 내부 수명 필드

| id / 타입 | 현재 소유 / 적용 위치 |
|---|---|
| `_poise_call_entered:bool` | invocation-local `_sync` 진입 여부. 같은 호출 재실행을 막으며 새 global cap/공격 ID가 아님 |
| `_applying_poise:bool` | 실제 core 호출 중만 true. `is_applying_poise(actor)`와 World current-call 검증으로 임의 actor setter와 구별 |
| `_source_max_stunned_present:bool` / `_maxStunned:Variant` | actor의 source key presence와 현재 값. absent→0은 source OR 연산 위치만; 미소유 shape는0 변환하지 않음 |
| `_record_native_normal_stun_max(stun_time:float)->bool` | 동일 actual max-stun 필드 갱신. source atomic break와 기존 normal legacy break가 공유 |
| `get_poise_hit_callable()->Callable` | current invocation만 self-bound callback을 반환, self 필드에 보유하지 않음 |
| `source_branch_entered/executed` / `poise_core_applied` / `source_body_returned` | owner 진입·실제 core 변경·함수 반환을 각각 분리. parent `applied_prefix` 4cursor는 이 값으로 대체하지 않음 |


## 2026-10-17 exact type0 source momentum owner 후속

| 항목 | 현재 구현 / 제한 |
|---|---|
| `enemy.kb_add / 42482` | 같은 World/current same-Node invocation/events순서로 producer의 계산된 `{x,y}` 증분을 actual `_knockback`에더하고 `owner_requests/events`각1증가. 피해/KB공식·배율·15cap·감쇠/clock 재계산0 |
| 수명 / 미완 | Node/World수명은검증하고새alivegate없음. `42483 offscreen_move_if_can_move`는정확NR, geometry/좌표실행0. fullhurtE/source_clock_ready=false, poise19985 tail·실전·현재실행본반영未 |
| 새 검수 | 첫type추론compile실패/기능검사0/exit0을PASS로세지않음→Vector2선언1줄수리→새KB15/15 PASS·양로그clean. 앞field21/poise21+2/37/24/29/parse/성공수송재연0 |
| 정본 | [일반 몬스터 KB 소유자](FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md). 앞 field/poise 및 배송/검수 이력을 보존하며 exact momentum 요청 범위만 갱신 |
