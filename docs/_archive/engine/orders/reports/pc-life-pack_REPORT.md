# PC-LIFE-PACK — 묶음 A: PCI-01 생명주기 · PCI-11 최종 처치 · PCI-10 시체 부활 · PCI-12 recalcSt · PCI-13 펫 초상 캐시

브랜치 `claude/pc-life-pack-20261021` (origin/main `0138c5bb9`에서 시작, 구현 commit `997d3d20c`, 그 뒤 origin/main `c06184592`를 **merge**(rebase 0) → `7478b33c9`). 요청 원문: `codex/pc-iface-pack-20261021:docs/engine/PC_INTERFACE_REQUESTS_DEMO11_20261021.md` §2·§3. **공개 API 계약: [PC_LIFECYCLE_CONTRACT_20261021.md](../../PC_LIFECYCLE_CONTRACT_20261021.md)** — Mac은 이 계약만 보고 연결한다.

## 요청 → 실제 API 대응

| 요청(제안 시그니처) | 실제 | 상태 |
|---|---|---|
| PCI-01 `request_native_player_life_transition(request)` / `read_native_player_life_phase()` | 같은 이름(Main). owner `native_source_player_life.gd`. + signal `native_player_life_phase_changed` | 완료. u_d21 재점화 분노(>0)만 NOT_READY |
| PCI-11 `subscribe_native_final_enemy_death(consumer, ctx)` | 같은 이름 + `unsubscribe_…`, signal `native_enemy_final_death(actor, stage_index)`(DEMO11-37 `bind_final_death_source` 호환) | 일반 적 hurtE 완료. **보스(ib) NOT_READY** |
| PCI-10 `request_native_enemy_revive(caster, ctx)` | 같은 이름. actor writer `apply_native_enemy_corpse_revive(world)` | 완료(generic·전용 4종·type7). 그 외 actor는 NOT_READY |
| PCI-12 `request_native_recalc_st(owner, ctx)` | 같은 이름 = 기존 `request_native_runtime_stat_refresh`의 새 모드 `"recalc_st"`(기존 owner 검증·sink 재사용, 새 writer 0) | 완료 |
| PCI-13 `prepare_native_pet_portrait(who)` + `_show_bubble` 캐시 소비 | 같은 이름(NativePets 내부) + `get_native_pet_portrait_cache_snapshot()` | 완료 |

## 설계 요지

- **PCI-01**: 기존 `player.gd` HP0 블록(state="dead"+`player_died`)은 수정하지 않고, 그 terminal dead를 PC가 발급한 `death_token`으로만 인수한다. die() 직전 `P.s`는 HP0 블록이 `dead`를 쓰기 전에 나오는 `player_damage`(hp==0) 시점에 보관 — revive_once가 원본처럼 상태를 유지한다. op별 쓰기는 원본 행 그대로(iframe 120/9999/0/300만 허용하는 sink, 임의 setter 없음). 세 sink(Player/Authority/State) 사전 검증 → 동기 일괄 commit → readback, 실패 시 롤백. retry는 원본 순서(EXP 손실 → Mac 스테이지 재구성 → 리셋 → 기존 applyStats → `_refillRespawnResources`)라 `step: exp_loss|reset` 두 단계로 나눴다. 300 countdown·사망 순간 roll·UI/G 상태·저장은 Mac(`mac_followups`에 원본 행 명시).
- **PCI-11**: 발행은 실제 hurtE `_kill_pipeline`의 G42733 앵커 한 곳(42702 사망 확정·kills·regKill 뒤, 42734–42744 보스/문지기 문맥·42756 킬체인 앞). G42633 일반몹 부활 당첨이면 `revival_pending`, 아니면 `final_death`. PCI-10 부활 시 열린 토큰에 `cancel`. payload `player_life.clear_blocked`로 부활 대기 중 clear 차단 신호를 함께 준다. G 상태·clear sink 쓰기 0.
- **보스 final death 부재 사유**: PC hurtE가 `ib`에서 G42124 `unported_branch_active:boss_hurtE`로 정지하고, demo boss actor는 HP writer가 없다(`native_demo11_boss_actor.gd` 머리 주석). 보스 HP/부활 판정(G42516–42625, G34497–34530) owner가 origin/main에 없고 DEMO11-36/49 원격 브랜치도 확인되지 않았다. 들어오면 G34528 "완전 사망" 확정 지점에서 같은 `publish`를 부르면 된다.
- **PCI-10**: world 등록 배열(ens identity) 순서로 `_deadPool` 조건 평가 → 첫 후보를 같은 노드로 부활. 첫 후보에 writer가 없으면 다음 후보로 바꾸지 않고 NOT_READY. caster tick·reviveT/reviveCd는 Mac B9 소유(`next_timer` 반환).
- **PCI-12**: 기존 refresh owner에 모드 하나 추가. 캐시 3종 무효화(1회) → `run_recalc_st` → mst/st만 commit.
- **PCI-13**: 기존 코드는 TextureRect가 직전 초상 하나만 참조해 **화자가 바뀔 때마다 재로드**했다(전환/pair마다 hitch). configure 때 두 초상을 강한 참조로 보관하고 발화는 캐시 조회만.

## 변경 파일 (origin/main 0138c5bb9 대비, 추가/삭제 줄)

| 파일 | +/− | 비고 |
|---|---|---|
| `godot/scripts/native_source_player_life.gd` | +590 | 신규 PCI-01 |
| `godot/scripts/native_final_enemy_death.gd` | +199 | 신규 PCI-11 |
| `godot/scripts/native_enemy_corpse_revive.gd` | +167 | 신규 PCI-10 |
| `godot/scripts/main.gd` | +105/0 | 끝에 API 추가 + `_ready` 끝 1줄 |
| `godot/scripts/player.gd` | +65/0 | 끝에 life sink |
| `godot/scripts/native_source_new_run_state.gd` | +64/0 | 끝에 life P sink |
| `godot/scripts/native_source_resource_authority.gd` | +53/0 | 끝에 life 자원 sink |
| `godot/scripts/native_dedicated_enemy_hurte_owner.gd` | +38/0 | `apply_corpse_revive` |
| `godot/scripts/enemy.gd` | +30/0 | generic writer |
| `enemy_melee_flesh_crawler / tank_physical_spine_beast / tank_ice_soul_flame / archer_lightning_hive_bloater.gd` | 각 +4/0 | writer 위임 |
| `godot/scripts/native_normal_enemy_hurte.gd` | +10/0 | G42633 지역 변수 + G42733 발행 |
| `godot/scripts/native_source_player_runtime_stat_refresh.gd` | +36/−3 | **기존 줄 수정 3**: MODES/MODE_SOURCE 상수, `_run_apply_stats()` 호출 1줄 |
| `godot/scripts/native_pets.gd` | +37/−3 | **기존 줄 수정 3**: `_show_bubble` 초상 exists/load 3줄 → 캐시 조회 |
| 테스트 `test_pc_player_life/final_death/enemy_revive/recalc_st/pet_portrait_cache.gd` | +321/+185/+226/+167/+92 | 신규 |
| oracle `pc_player_life_oracle.mjs / pc_enemy_revive_oracle.mjs / pc_recalc_st_oracle.mjs` | +72/+41/+62 | 원본 함수 이름/본문 추출 VM |
| docs | 계약 +185, 2_5 +17, 본 보고서, CHANGELOG | |

Q/E 판정·패링·hurtP 분기·피해 수식·세이브 형식·docs/2_3 변경 0. 기존 테스트 수정·삭제 0. 틱 경로(`_physics_process`/`_process`) 변경 0, 목록 생성 API 호출 0.

## 검증 (격리 user dir, 매 실행 뒤 override.cfg 0byte, node=`C:/nvm4w/nodejs/node.exe`, 원로그 `G:/exoduser-wt/_out/pc-life-pack/`)

신규 테스트(merge 전 r1·merge 후 r2 각 1회, 같은 결과):

| 테스트 | 단정/실패 | ERROR | 내용 |
|---|---|---|---|
| test_pc_player_life | 101/0 | 0 | 실제 hurtP로 HP0 → 토큰·중복 HP0 무시·6 op·reviveOnce 우선/1회·roll 계약·stale/외부 actor/외부 owner/재진입(시그널 안)/request_id 중복 replay·sink 창 밖 거부·applyStats 실패 롤백·DOT/둔화 해제·로비 종료 상태. 원본 die()/_fallenResolve()/retry/lobby VM oracle 6사례 41필드 일치 |
| test_pc_final_death | 60/0 | 0 | 실제 hurtE 4처치(final/revival_pending 둘 다 자연 발생)·이벤트 1회/처치·토큰 고유·journal 순서 42732<42733<42756·final 전용 구독/시그널·중복/살아있는 actor 발행 거부·전달 중 구독 거부·fallen 중 처치 시 clear_blocked |
| test_pc_enemy_revive | 50/0 | 0 | 빈 pool SOURCE_RETURN 60·ib/etype9/_absorbed/거리150 제외·원본 순서 첫 후보·같은 identity·필드값·cancel 이벤트·caster 사망 NR 무변이·generic writer. 원본 주술사 블록(G38944) VM oracle 2사례 14필드+선택 일치 |
| test_pc_recalc_st | 49/0 | 0 | ST/mST만 commit·무료충전 0·st=min(st,mst)·stale affix 캐시 무효화·producer NOT_READY 무변이·JS `~~NaN` 의미 보존·외부 owner 거부·기존 apply_stats 모드 불변. 원본 recalcSt VM oracle 8사례 16필드 일치. 1회 약 4.2~7.5ms |
| test_pc_pet_portrait_cache | 23/0 | 0 | configure 준비 2종·재준비 무로드(같은 identity)·모르는 key 무변이·발화 캐시 identity·텍스트/opacity 불변·캐시 없는 key는 초상 무변이+대사 계속 |

회귀(r1=merge 전, r2=merge 후): 아래 표. 의도된 ERROR는 test_demo11_authority의 `Native demo boot rejected: stage outside demo policy` 1건(테스트가 expected_error로 검사)뿐이다.

| 테스트 | r1 | r2 |
|---|---|---|
| test_contracts | 5그룹 PASS / 0 | 5/0 그룹 PASS |
| test_native_main_source_starter_state | 148/0 | 148/0 |
| test_native_source_player_regeneration_phase | 88/0 | 88/0 |
| test_native_qe_binding | 155/0 | 155/0 |
| test_p1002g_kislash_hurte | 220/0 | 220/0 |
| test_pc_runtime_stat_refresh | 289/0 | 291/0 |
| test_pc_protected_restore_handoff | 4830/0 | 4830/0 |
| test_demo11_boss_actor | 167/0 | 162/0 |
| test_demo11_boss_phase_readback | 28/0 | 28/0 |
| test_demo11_authority | 22/0 (expected ERROR 1) | 22/0 (ERROR 1) |
| test_p2004a_pets | 20/0 | 20/0 |
| test_p2004b_pet_dialogue | 822/0 | 822/0 |
| test_p2004b_pet_runtime | 10/0 | 10/0 |
| test_p1002e_melee_hurte | 93/0 | 93/0 |
| test_p1002f_dedicated_hurte | 357/0 | 357/0 |
| test_p2001b_death_fx | 43/0 | 43/0 |
| test_p2001c_kill_rewards | 45/0 | 45/0 |
| test_boss_ch1_bc05_phase | 18424/0 | 18424/0 |
| test_pc_m29_parry (merge로 들어온 타 세션 테스트) | — | 100/0 |

(단정 수 변동: test_pc_runtime_stat_refresh 289→291은 랜덤 스타터 소켓 수에 따른 기존 성질, test_demo11_boss_actor 167→162는 두 실행 사이 해당 테스트·actor 파일 변경이 없는 실행별 변동이며 모두 0실패·skipped 0이다.)

## 성능

- 틱 경로 새 코드 0 → 물리 300틱 벤치 **미실행**(지시 조건 미해당). hurtE 처치 이벤트에 발행 1회가 추가됐다(처치 시에만).
- PCI-13 발화 1회 비용(Windows 개발 PC headless): 기존 방식 crow→cat→crow→cat→crow = **27.6 / 29.5 / 17.8 / 17.9 / 17.4ms**(화자 전환마다 재로드). 캐시 후 = **15~65µs**, 첫 cat만 라벨 재배치로 0.44~0.65ms(1회 4.85ms 잡음 관측). configure 추가 비용 = 두 초상 cold load 합 **41~45ms**(부팅 1회; 요청서 추정 약 31ms보다 큼).
- recalcSt 1회 4.2~7.5ms(20회 평균, 이벤트 전용).

## 미확인·HOLD

- 보스(ib) final death 신호: NOT_READY(보스 HP/부활 owner 부재). 일반몹 `revival_pending` 재스폰(G34497~) 미이식 → 토큰은 PCI-10 부활 때만 cancel.
- u_d21 `_uDemonRekindle` 재점화 분노 writer 미연결(값>0이면 revive_resolve NOT_READY).
- 돌진 스톡·사슬 게이지·poison/bleed/web/trap 둔화 리셋은 Godot 대응 필드가 없어 쓰기 0.
- PCI-10 `_deadPool` 2프레임 재구성 cadence(G34391)는 즉시 평가로 대체(≤1프레임 차이 가능). 전용 actor 중 spine_beast·hive_bloater writer는 이번 실행에서 실제 부활 경로를 타지 않았다(ice_soul_flame·ice_warrior·generic은 실행 확인).
- Mac 실제 호출자(DEMO11-39 화면·countdown·roll, DEMO11-37 clear 보류/재개, B9 caster, DEMO11-29 재련) 연결은 미구현(Mac 소유). 화면 캡처 없음(신규 UI 0).
- Mac 실기 성능 미측정.
