# PC 런타임 스탯 재계산·복원 handoff 계약 (2026-10-21, PC-RUNTIME-STATS)

Mac Main/State 담당(DEMO11-19 스탯 투자, DEMO11-22 장착 transaction, DEMO11-06 복원)이 **이 문서만 보고 연결**할 수 있도록 공개 API를 고정한다. 브랜치 `claude/pc-runtime-stats-20261021`. 초기화 단회 dispatcher(`native_source_player_initialization.gd`)의 pre-Tree guard는 **변경하지 않았다** — 재계산은 옆에 새로 만든 별도 owner가 담당한다.

## 1. 런타임 applyStats 재계산 (DEMO11-19·22 해제)

### 1.1 호출

```gdscript
# main = 실제 부팅된 Main (scripts/main.gd). 호출자는 Main 자신 또는 Main이 소유한 State 흐름.
var receipt: Dictionary = main.request_native_runtime_stat_refresh(mode, reason)
```

| 인자 | 값 | 원본 대응 |
|---|---|---|
| `mode` | `"apply_stats"` (`Main.NATIVE_RUNTIME_STAT_REFRESH_APPLY_STATS`) | 원본 `applyStats()` 직접 호출. 스탯/패시브 투자·리셋·예약 처리 투자(G51215·51232·51249·51267·51274). **사전 무효화·사후 clamp 없음** |
| `mode` | `"equipment_refresh"` (`Main.NATIVE_RUNTIME_STAT_REFRESH_EQUIPMENT`) | 원본 `_refreshEquipmentStats()` G16287–16292: hp/mp/st/shield 보관 → `_eqAffixCache`/`_eqStatCache`/`_lEqCache` 무효화 → applyStats 1회 → `min(new max, old current)` |
| `reason` | 임의 문자열(진단용, 예: `"stat_invest:str"`, `"equip:gloves"`) | — |

- 동기 호출. await·시그널 대기 없음. 일시정지(`get_tree().paused`) 중에도 허용(UI 투자/장착용, 클럭 미사용).
- 첫 호출 때 Main이 `source_runtime_stat_refresh`(RefCounted, `scripts/native_source_player_runtime_stat_refresh.gd`)를 1회 생성·등록한다. 부팅 순서 변경 0.
- 스탯/패시브/장비 **값 자체의 변경(STATS·PASSIVES·INV·SP/AP·raw grit 쓰기)은 호출자 책임**이다. 이 API는 그 결과를 원본 applyStats로 actor·자원·P에 반영할 뿐이다.

### 1.2 반환 receipt

| 키 | 성공(`READY`) | 실패(`NOT_READY`/`REJECTED`) |
|---|---|---|
| `status` / `ready` / `committed` | `"READY"` / `true` / `true` | `"NOT_READY"`(pass 중 실패) 또는 `"REJECTED"`(진입 거부) / `false` / `false` |
| `reason` | `""` | 실패 이유 문자열(아래 표) |
| `mode`, `caller_reason`, `pass_serial`, `source` | 호출 정보 | 동일(REJECTED는 mode/caller_reason만) |
| `before` | 실행 전 readback (아래 20필드) | 동일 |
| `after` | commit 후 readback | 실패 시 다시 읽은 값(= before, `unchanged:true`) |
| `kept` | equipment 모드의 보관값 {hp,mp,st,shield} | — |
| `committed_fields` | `{actor:[…], resources:[…], state:[…]}` | — |
| `staged_writes`, `trace` | 원본 producer write 수와 앵커 trace | — |
| `cache_invalidations` | apply_stats=1(recalcSt), equipment=2(G16289+recalcSt) | — |
| `free_refill` | 항상 `false`여야 함(hp/st/mp/shield 중 증가 여부 검사) | — |

readback 20필드: `hp mhp st mst mp mmp shield mshield hpR stR mpR speed _oocSpeed baseDef baseAtk maxPoise poise poiseR _effStats _crystalStats` (모두 `State.read_current_p()` 기준 — actor/자원 authority와 동기화된 값).

### 1.3 쓰기 대상(원본 applyStats 범위 그대로)

| owner | 필드 | 실제 저장 위치 |
|---|---|---|
| Player | hp, mhp, baseDef, speed, maxPoise, poise, poiseR | `hp`, `max_hp`, `base_def`, `_native_source_speed_per_tick`·`_movement_speed=speed*60`, `max_poise`, `poise`, `_native_source_poise_r` |
| 자원 authority | st, mst, stR, mp, mmp, mpR | Player `stamina`/`max_stamina`, authority `_owned` (regen이 읽는 stR/mpR 포함) |
| State P | _effStats, baseAtk, hpR, _oocSpeed, _crystalStats, mshield, shield | `State._p` |

poise·poiseR는 원본 조건(`P.poise>4`, `P.poiseR===undefined`)이 참일 때만 써진다(런타임에는 보통 maxPoise만).

### 1.4 순서·불변식

1. 진입 검증: Main/Player/World/State/자원/providers/services/초기화 dispatcher가 **같은 실제 Main 소유**이고 Tree 안, 초기화 완료(`completed:true`), 등록된 refresh 객체가 자기 자신.
2. `State.read_current_p()`의 deep copy(overlay) 위에서 **원본 producer 6종을 pass마다 새로 생성**해 Services `_make_provider_maps`와 같은 키·같은 원본 provider 객체(affix/reference/formula/parameters·providers current readers)에 직접 묶고(전체 owner 검증은 pass 시작·commit 직전 2회 — 호출마다 Services 재검증 시 1회 ~45ms), 초기화와 같은 앵커 순서로 실행(effective → HP initial[gap: DEF early → poise init → ATK early → stR] → MP 28593/28594/_cr → HP crystal → ATK crystal → DEF crystal → hpR → MP 28606–28614 → fortify → armor → shield → recalcSt[무효화→mst/st]). 수식 복제 0.
3. 각 write는 State/Authority/Player 초기화 whitelist(kind·source·field·anchor·pass_id·before)와 Player 상수(maxPoise/poise=4, poiseR=0)로 검증.
4. equipment 모드: 4자원 `min(new max, old)`.
5. 세 sink 모두 `validate_*` 사전 검증 → 동기 일괄 commit(Player→자원→State, 사이 콜백 0) → `read_current_p` readback. 실패 시 이미 쓴 sink를 before 값으로 되돌림.
6. 성공 후에만 `Player.stats_changed`와 `native_runtime_stats_refreshed(receipt)` 시그널 발생. **시그널 처리 중 재호출은 `runtime_stat_refresh_reentrant`로 거부**된다(진행 중 pass 미오염).
7. 원본 특성 보존: apply_stats 모드는 pFortify/pVital이 있으면 중간 clamp(`P.hp=Math.min(P.hp,P.mhp)` @crystal) 때문에 만피에서 hp가 `mhp-300×fLv`로 내려간다. equipment 모드는 사후 `min(new max, old)`로 복구된다. 테스트에서 원본 JS와 일치 확인.

### 1.5 실패 reason (대표)

| reason | 의미 |
|---|---|
| `runtime_stat_refresh_reentrant` | pass/시그널 처리 중 재호출 |
| `runtime_stat_refresh_foreign_owner` | owner가 등록된 실제 Main이 아님 |
| `runtime_stat_refresh_Main_identity_changed` | Main.player/world/source_state/... 교체됨 |
| `runtime_stat_refresh_not_Main_registered` | 다른 refresh 객체가 이미 등록 |
| `runtime_stat_refresh_requires_completed_initialization` | 초기화 미완료 |
| `runtime_stat_refresh_unknown_mode:<m>` | mode 오타 |
| `health_initial_capture_not_ready:<producer reason>` 등 | 원본 producer가 NOT_READY(예: STATS.str 문자열) |
| `shield_poise:...` | 늦은 단계 실패(예: P.shield 비수치) — 앞 단계 write도 commit되지 않음 |
| `runtime_stat_refresh_sink_rejected:<sink reason>` | 세 sink 사전 검증 거부 |

### 1.6 DEMO11-19 레벨업 순서 연결 예

```gdscript
# State.apply_native_add_exp 내부(Mac 소유) — 레벨 루프 직후, heal 이전:
var invested := _process_passive_queue()          # META-05 정책 재사용 (Mac)
if invested > 0:
    var r: Dictionary = owner.request_native_runtime_stat_refresh("apply_stats", "passive_queue")
    if r.get("committed") != true: return {"applied": false, "reason": r.reason}
var heal := _resources.commit_native_level_up_heal(owner)  # 기존 43160 회복, 새 상한 기준
```
State의 `_native_add_exp_active` 중 호출해도 잠금 충돌 없음(테스트 S8: 레벨업 handoff 시그널 안에서 READY).

### 1.7 DEMO11-22 장착 연결 예

```gdscript
# 실제 INV identity 이동/검증(Mac) 성공 후 한 번만:
var r := main.request_native_runtime_stat_refresh("equipment_refresh", "equip:" + slot)
if r.get("committed") != true:
    # 원본 G16287–16292는 bag 이동 뒤 refresh. 실패 시 이동을 되돌릴지는 Mac transaction이 결정
    # (refresh 자체는 무변이 보장).
    pass
```

### 1.8 sink 공개 메서드(직접 호출 금지 — refresh 모듈 전용)

`Player/Authority/State.validate_native_runtime_stat_refresh(owner, refresh, fields) -> String`, `commit_native_runtime_stat_refresh(owner, refresh, fields) -> {accepted, reason?, fields}`. owner=실제 Main, refresh=Main 등록 모듈, **refresh의 동기 commit 창 안에서만** 수락. 외부 호출은 `*_not_in_commit_window`로 거부된다.

## 2. DEMO11-06 복원용 보호 handoff 3종

`scripts/native_source_protected_restore_handoff.gd` (`ExoduserNativeSourceProtectedRestoreHandoff`, static). 입력은 `source_restore_flow.gd`의 detached graph(`{player, game, skill_slots, ult_slot}`), 읽기 전용. 반환은 flow `_handoff`(:105–150) 관측 형식 그대로.

| 함수 | 원본 | 허용 leaf |
|---|---|---|
| `protected_qe(state, serialized)` | dbRestore Q/RMB 복원 4줄(G3866–3869) | player.activeRMBSk, player.activeQSk |
| `protected_active_sync(state, tables)` | `_syncActiveSkAfterReset(_getAllAbsorbed())`(G3880, G44620–44663) | active LMB/Charge/Magic/Q/Ct/Bow/RMB |
| `protected_wing(state)` | `_sanitizeCoreState`의 `_ensureBaseWingStrike(P)`(G3513, G3483–3490) | skills.maliceSwipe, skills.shieldThrow, _fused.shieldFuse, activeRMBSk |

반환: `{stage, state:"returned"|"source_throw"|"HOLD", before, after, allowed_leaves, changed_leaves, source, detached:true, live_writes:0}`. `HOLD`(입력 shape 불충분)는 `after`가 없어 flow가 관측 부재로 HOLD 처리한다. `tables`는 flow의 `source_tables`(pairs/absorbed/slot_defs) 그대로.

연결 예(Mac Main 복원 흐름):
```gdscript
var obs := {}
var r := flow.calculate(payload, current, tables, obs)
while r.status == "HOLD" and str(r.reason).begins_with("protected_owner_observation_absent:"):
    match r.failed_stage:
        "protected_qe": obs[r.failed_stage] = HANDOFF.protected_qe(r.partial_snapshot, payload)
        "protected_active_sync": obs[r.failed_stage] = HANDOFF.protected_active_sync(r.partial_snapshot, tables)
        "protected_wing": obs[r.failed_stage] = HANDOFF.protected_wing(r.partial_snapshot)
    r = flow.calculate(payload, current, tables, obs)
```

## 3. 자원 restore writer

```gdscript
var r: Dictionary = main.source_resources.commit_native_restore_resources(main, {
    "hp":…, "mhp":…, "st":…, "mst":…, "mp":…, "mmp":…, "stR":…, "mpR":…})
# → {accepted, reason, before{8}, after{8}, commits}
```
- 8필드 정확히 전부, 유한 수만. 사전 검증 → 동기 일괄 대입 → readback, 불일치 시 before 복구. 실패 시 무변이.
- 원본 dbRestore(G3618–3621)처럼 **clamp·보충 없음**(hp>mhp 허용 — 이어지는 applyStats가 clamp). 값 계산(`pd.hp||P.mhp` 등)은 `save_adapter/source_player_restore.gd`의 detached plan이 담당.
- owner=실제 Main(Player 부모, source_resources/world/player 일치), Tree 안. 재진입 거부. regen/비용/회복/새 초기화 API와 별개.
- 복원 뒤 runtime refresh(`"apply_stats"`)로 파생값을 맞추는 것은 Mac 복원 흐름 순서(복원 commit → applyStats/initStage → readback → start)에 따른다.

## 4. 범위 밖·HOLD

- 스탯/패시브/raw grit/SP/AP 쓰기, 장비 이동·귀걸이 target·reqLv·강화 전승(Mac).
- Tree 진입 전(pre-Tree) 복원 경로는 이 writer 범위 밖(현재 Main 부팅 후 Tree 안 전제).
- `_lEqCache` 무효화는 현 main recalcSt(G16426)에 맞춰 refresh 중 Main `_source_l_eq_cache=null`로 수행(producer invalidate packet은 2개 캐시만 명시).
- 틱 경로 코드 0, 목록 생성 API(get_method_list 등) 호출 0. refresh 1회 비용(Windows 개발 PC headless, 장착 모드 20회 평균) 약 15ms(15.0–15.7ms) — UI/레벨업 이벤트 경로 전용. 틱마다 호출 금지.
