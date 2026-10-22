# PC-COMBAT-KILL — 웹 맵 시작 필드 처치 0 + 보행 감속 (2026-10-22, PC Claude)

- worktree `G:\exoduser-wt\pc-boss-parity`(재사용, 새 worktree 0), branch `claude/pc-combat-kill-20261022`
- 기준 Mac INTEG-13 `06f3db984` (`codex/demo11-integ13-20261022`)
- 원본 대조: 고정 스냅샷 `godot/source_snapshot/game.html` (sha256 4d911cdd…, `snapshot.cjs`로 검증해 웹 라우트에 그대로 제공)
- 로그·캡처: `G:/exoduser-wt/_out/pc-combat-kill/`

## 1. 처치 0 — 멈춘 지점

INTEG-13 Main을 실제 로비→캐릭터 생성→인트로/레슨 건너뛰기로 부팅하고(데모 정책, MAP11 웹 맵, storage on 격리), 커튼 5링과 자연 적에게 실제 근접 입력(+자동 석궁)을 넣어 hurtE outcome·HP를 프레임 단위로 기록했다(`probe1.log`).

| 단계 | 관측 |
|---|---|
| 자동 석궁 1발 | eShield 875→746 (PCI-03 normalBow hurtE 정상) |
| kiSlash 검기 1타 (2998) | **eShield 746→0, HP 875→−1377, alive=true** — outcome `ok:false, halted_at:42490, reason:source_field_call_unavailable` |
| 이후 근접 13회 | `melee_contact_resolved` 13회, **hurtE 0회** — `player._melee_contact`가 `hp<=0` 대상을 건너뜀(42112/42113 가드와 같은 의미) |
| 결과 | 링 3마리가 HP 음수·alive 좀비, actor death 0, region kill 0, 플레이어 자연 사망 |

정지 경로: `crescent.gd` 19837 opts `{poiseHit:true,…}` → `native_normal_enemy_hurte.gd` 42383 HP 쓰기 **완료** → 42486 poiseHit 블록 → `_apply_poise_hit` → flesh_crawler는 `apply_native_source_poise_hit` 보유라 `_poise_via_source_field_call` → `World.begin_native_normal_enemy_field_call()`(world.gd 3503~3505) → `read_native_source_damage_fields` → `_source_normal_fields_error` = `exact_normal_factory_actor_not_owned` → null → 42490 정지(폴백 금지). 사망 블록(42500~)에 도달하지 못한다.

원인: 실행자 `native_normal_enemy_hurte.gd` `_apply_poise_hit`(1005~1012행, 수정 전)가 `apply_native_source_poise_hit`를 가진 actor(flesh_crawler 계열 전부)를 무조건 v3 field call로 보냈다. v3 domain(`enemy_melee_flesh_crawler.gd` 410~412행 `_source_normal_fields_domain_current`)은 `ch1_initial_015 / order14 / etype0 / elite0 / el0 / mods[]` exact factory actor 1종만 연다. 웹 맵(INTEG-13)의 시작 필드 적은 전부 다른 actor다 — 커튼 5링(`native_intro_curtain_sequence.gd` 308~359), Group-A 자연 소환 `enemy_demo11_a_0/a_5/a_6`, `native_natural_enemy_actor`. 기존 맵(INTEG-9/10) 근접 2회 PASS는 weapon 프로필(poiseHit:false)이 42490을 지나지 않았기 때문이고, P2-001h 테스트도 `activeLMBSk='weapon'`이라 이 경로를 밟지 않았다.

두 번째 정지: etype6(방패돌격병 a_6)은 `SPECIAL_HIT_ETYPES`에 들어 있어 42136에서 매 타 `unported_branch_active:special_etype_6`(피해 0). 원본 hurtE에서 etype6 분기는 42167~42170 방패 경감뿐이다.

## 2. 수정 (원본 그대로)

| 파일 | 변경 | 원본 |
|---|---|---|
| `godot/scripts/native_normal_enemy_hurte.gd` `_apply_poise_hit` | v3 field call은 `_source_normal_fields_configured==true`(exact actor)일 때만. 그 밖의 flesh_crawler 계열은 `apply_native_normal_enemy_poise_core`(공용 코어) | `_poiseHit` 19973~19983: 비보스면 elite/mods/el/생성 경로 무관 동일 코어 |
| `godot/scripts/enemy_melee_flesh_crawler.gd` | `apply_native_normal_enemy_poise_core` 추가 → `native_dedicated_enemy_hurte_owner.apply_poise_core`(spine/ice/hive와 같은 구현). v3 domain actor는 거부(owner 하나), legacy pending poise 있으면 거부, 그로기 시 `_maxStunned` 동기. **v3 exact domain 자체는 변경 0**(Mac 계약 단정 유지) | 19976~19982 |
| `godot/scripts/native_normal_enemy_hurte.gd` | `SPECIAL_HIT_ETYPES`에서 6 제거. 42167~42170 이식: `ang` 유한일 때 `shDiff=(ang+π)-shieldAng`(±π 정규화), `|shDiff|<π/3`면 `dmg=~~(dmg*0.3)`·`🛡`(#8888ff, life20, y−15). shieldAng 미보유면 42167 정지(쓰기 전) | 42167~42170. `SFX.block()`은 12592 `block(){void 0}` 무동작 |
| `godot/scripts/native_dedicated_enemy_hurte_owner.gd` | `read_fields`에 `shieldAng`(native_final, Group-A 생성자 31183·AI 38911 owner 값) 추가 | 42167 `e.shieldAng` |

처음에는 v3 domain을 넓혔으나(커밋 전) Mac `test_demo11_etype_a`·`test_demo11_enemy_base`의 `v3_exact_initial_domain_not_weakened`/`protected_exact_v3_domain_not_weakened` 단정과 충돌해, domain은 그대로 두고 실행자 라우팅만 바꿨다. 정지 지점 이후 폴백이 아니라, domain 밖 actor에 원래부터 맞는 owner(공용 코어)를 처음부터 고르는 것이다. 피해·사망 주입 없음.

| 파일 | 변경 | 원본 |
|---|---|---|
| `godot/scripts/native_stage_spawn_adapter.gd` (**Mac 소유 — 최소 훅, Mac 검토 요청**) | `record_actor_kill`: 소환굴 origin이 없는 비보스 actor(커튼 5링 등)를 `unbound_actor_origin`으로 버리지 않고 스폰 위치(`native_final._homeX/_homeY`, 없으면 `requested_spawn_position`, 없으면 현재 위치)를 `provider.region_at`으로 지역화해 `record_stage_origin_kill` 1회 | `_regKill` 60728~60731(보스 제외, `_homeX`=mkEn 인자 x,y 31210). 웹 실측: 커튼 5링 처치 후 `G._regions[].kills=[0,0,2,3]` |

## 3. 보행 — 원인과 수정

| 항목 | 웹 | Godot 수정 전 |
|---|---|---|
| 이동 판정 | G33022~33028 `ms=(P.speed+bt().spd)*sp`; `canMv(nx,P.y,P.r)`면 x, 이어 `canMv(P.x,ny,P.r)`면 y (축 분리) | `player.gd` `move_and_slide()`, collision_mask `1|4` |
| 넉백 | G32762 `canMv(P.x+kb.x*.5*sp, P.y+kb.y*.5*sp)` 통과 시 두 축 함께, `kb*=.65**sp` | velocity에 합산 후 move_and_slide |
| 적 몸체 | 일반 적과 몸체 충돌 없음. 보스만 34349 밀어내기 | layer 4(일반 적) 접촉에 막힘 — 커튼 링이 붙으면 거의 정지 |
| 벽 | canMv(4코너 표본, tile/hill/prop ellipse) | `NativeMapCollision` rect/원/언덕 근사 shape |

수정: `player.gd`에서 World가 `can_move`를 제공하면(제품 경로 전부) 넉백·보행을 원본 canMv 순서로 직접 적용한다. World가 없는 독립 프로토타입 경로만 기존 move_and_slide 유지. 보스 몸통 밀어내기는 기존 `native_demo11_boss_core._push_player_out_of_body`(34349, 보스 body layer 0)로 변화 없음. 사슬/전격이동 `passes_through_enemies` 분기는 canMv 경로에서 적 몸체 자체가 없으므로 의미가 같다.

남은 차이(미수정·보고): 일반 적 스크립트들의 collision_mask가 `1|2`라 **적이 이동할 때** 플레이어 몸체(layer 2)에 막힌다. 원본은 적도 플레이어 몸체와 충돌하지 않는다. 적 스크립트 다수(Mac/공동 소유)라 이번 범위에서 고치지 않았다.

## 4. 웹 대비

### 4-1. 처치 타수·피해 (같은 시작 필드·같은 커튼 5링·같은 입력 규칙)

새 게임 시작 무기·석궁 공격력은 원본도 무작위 롤(`_mkItem` atk_roll)이라 양쪽이 매번 다르다. 비교는 Godot 실행에서 굴린 값을 웹에 **비교 전용 픽스처**로 넣어 맞췄다(`INV.equipped.weapon.atk`/`bow.atk`, 로그 `fixture_weapon_atk`). 입력은 양쪽 모두 실제 이동 키 + 사거리(47+r−4) 안 idle일 때 LMB 1회, 자동 석궁은 제품 스케줄러. 웹은 `hurtE` 래핑으로 기록만(값 쓰기 없음).

| 조건 | 항목 | 웹(snapshot 4d911cdd) | Godot(수정 후) |
|---|---|---|---|
| 무기 atk 1 / 석궁 atk 1 (meleeRef 16) | 링 적 HP / eShield | 875 / 875 | 875 / 875 |
| 〃 | 자동 석궁(normalBow) | 105 (쉴드 흡수) | 105 |
| 〃 | kiSlash 검기 | 940 | 940 |
| 〃 | 근접 weapon | 145 | 145 |
| 〃 | 링 1마리 처치 | kiSlash 2타 (+석궁 0~1, weapon 0~1) | kiSlash 2타 (+석궁 0~1, weapon 0~1) |
| 〃 | 5링 전멸 | 9.56초 / 클릭 10 | 4링 5.7초·5번째 10.6초 / 클릭 22(40초 전체) |
| 무기 atk 31 / 석궁 atk 16 (meleeRef 46) | kiSlash | 2704 | 2704 |
| 〃 | 자동 석궁 | 129 | 129 |
| 〃 | 링 1마리 처치 | kiSlash 1타 (+석궁 0~1) | kiSlash 1타 (+석궁 0~2) |
| 수정 전 Godot(INTEG-13) | 링 처치 | — | **0** (kiSlash 1타 후 HP 음수 좀비, 이후 근접 무시) |

공식 대조: kiSlash `~~(meleeRef*7*statStr*pAtkMul*_skMul('kiSlash'))`, 웹 `_skMul('kiSlash')=12`; Godot 1293/1411/1528/2998 = meleeRef 22/24/26/51 × 58.8 일치. weapon `~~(((baseAtk+wAtk)+enh+15)*6*pAtkMul)+_atkBon` 일치. 석궁 `(~~(ref*.49*atkMul+28))*3` 일치.

웹에만 있는 피해: 일부 회차에 `opts={dot,shieldHit}` 90~369 피해가 `update()`에서 주기적으로 들어온다(출처 행 후보 32624 썬더스테이크 아크, **미확인**). 같은 회차 Godot 로그에는 대응 피해가 없다.

### 4-2. 나란히 캡처 (왼쪽 웹 / 오른쪽 Godot, 각 1920×1080)

`G:/exoduser-wt/_out/pc-combat-kill/compare_first_hit.png`, `compare_first_kill.png`, `compare_after_fight.png`(+`_crop1x`, `_half`), 처치 직후 프레임 `compare_v1_domainfix/compare_godot_kill_frames.png`.

- 판정(직접 열람): 양쪽 모두 첫 석궁 105 청색 숫자, 검기 적중 시 쉴드 청색·HP 백색 숫자·`그로기!`·처치 후 피 연출/시체/물약 드랍이 같은 방식으로 보인다.
- 차이(이번 범위 밖): 웹은 마우스 오버 적 이름판(`일반 Lv.1`)이 보이고 Godot 캡처에는 없다. 지역 배너/구역 제목 표시 시점, 타이머(웹 00:02 / Godot 00:07 — 부팅 경로 차이)가 다르다. 시계·RNG를 맞추지 않은 별도 실행이므로 동일 프레임 비교가 아니다.

### 4-3. 보행 (실제 W 키, 1-1 시작점 (4020,7420)에서 북쪽 1.8초)

| 항목 | 웹 | Godot 수정 전(창, 60Hz) | Godot 수정 후(창, 60Hz) |
|---|---|---|---|
| P.speed(px/tick) — 시작 장비 롤 따라 다름 | 2.763 | 2.775 | 2.725 |
| 이동한 틱 | 108 (rAF 100프레임, sp 합 108) | 109 | 109 |
| 프레임당 이동 | 2.763 일정 | 2.775, 마지막 9틱은 커튼 링 몸체(layer 4)에 막혀 ±0.7 진동 | 2.73 일정 |
| 1.8초 이동량 | **298.4px** | **276.2px** | **294.3px** |
| 이동량/(속도×틱) | 1.000 | 0.92 (적 몸체 차단) | 1.000 |

헤드리스 120Hz 측정(수정 전): 285.9px, 마지막 14틱 `ch1_curtain_ring_01/L4` 접촉. Mac에서 관측된 3.43px/1.78초는 커튼 링들이 플레이어를 둘러싼 뒤 layer-4 접촉으로 막힌 경우와 일치한다(재현 위치는 미확인). 벽: 수정 후 +x 벽 778px 지점에서 776.65px로 멈추고 `can_move` 위반 0.

## 5. 회귀 (최종 코드, 각 1회 — 예외 표기)

| 테스트 | 결과 | 비고 |
|---|---|---|
| test_pc_combat_kill (신규) | 47/0 | 수정 전 코드에서 30실패(좀비·정지·적 몸체 차단 재현). 첫 묶음 실행은 부팅 중 엔진 signal 11(world.gd:1999 이미지 onload, 테스트 코드 진입 전) → 단독 재실행 47/0 |
| test_pc_combat_pack_b | 378/0 | |
| test_pc_combat_pack_b_mac | 402/0 | |
| test_pc_m29_parry | 101/0 | |
| test_pc_final_death | 61/0 | |
| test_pc_enemy_revive | 51/0 | |
| test_pc_player_life | 101/0 | |
| test_native_qe_binding | 0실패 | |
| test_p1002e_melee_hurte | 94/0 | 첫 묶음은 부팅 signal 11(main.gd:343, 테스트 진입 전) → 재실행 94/0, 최종 묶음 94/0 |
| test_p1002f_dedicated_hurte | 358/0 | |
| test_p1002g_kislash_hurte | 221/0 | |
| test_pc_followups_fieldboss | 159/1 | `arrow_passes_through_on_hitcd(n=0):recycled`. **기준 06f3db98(내 변경 없음)도 150/1 같은 실패** — 원인 별개(§6) |
| test_pcib_mac_calls | 31/0 | |
| test_pc_move_skills | 256/0 | |
| test_pc_boss_parity | 37/2 (B02) | **기준 코드도 같은 단정이 무작위 실패**: 반복 표본 수정본 3회 중 2 PASS, 기준 3회 중 2 PASS(+기준 단독 37/1·37/2 관측). 보스 초기 facing 난수에 따라 900틱 안에 접근 못 하는 회차가 있다. body_push 경로(보스 core 34349)는 변경 0 |
| test_pc_skill_writers | 80/0 | |
| E2E `--demo11-storage=on` | **11 PASS / 7 NOT_READY / 0 FAIL**, ERROR0 | 기준선 7/11/0. enemy_kill **PASS**(공격2·actor death·region 0→1). item_pickup/equip/auto_potion 신규 PASS. level_up/stat_passive는 이번 회차 자연 사망(HP0, max_hp495)으로 NOT_READY. 참고: 커밋 전 중간판(v3 domain 확장·어댑터 훅 없음) 회차는 12/6/0 — enemy_kill만 지역 0→0으로 NOT_READY, level_up/stat_passive PASS |

추가 확인(Mac 파일 훅 영향, `--map11=off`): test_demo11_43_stage_spawn_adapter 40/0, test_demo11_etype_a 48/0, test_demo11_etype_a_registered 0실패, test_demo11_enemy_base 31/1(`thirty_actor_p99_within_120fps_budget`, 기준도 같은 1실패), test_demo11_gate_guard 3실패+SCRIPT ERROR1(기준도 동일).

## 6. 필드보스 `arrow_passes_through_on_hitcd` (INTEG-14 154/1) 판단

- 기준 06f3db98(hud-stats 없음, 내 변경 없음)에서도 150/1로 같은 단정만 실패 → PC hud-stats·이번 수정과 원인이 다르다.
- 같은 그룹의 원본 oracle 대조 `fb_fate:hitcd_skip src=…port=…`는 통과한다 = 웹 원본 실행도 같은 기하에서 화살이 `recycled`된다. 웹 맵(MAP-01/03) 기하에서 hitcd로 앵글러를 통과한 화살이 그 뒤 다른 것(벽/적)에 닿는 배치가 된 것으로 보이며, 제품 차이가 아니라 테스트의 배치 가정(통과 뒤 빈 경로) 문제로 판단한다(정확한 충돌 대상은 미확인). 테스트 수정은 하지 않았다.

## 7. Mac 요청

1. `native_stage_spawn_adapter.gd` `_record_unoriginated_kill` 최소 훅 검토·인수 — 소환굴 origin 없는 비보스 처치(커튼 5링 등)를 `_regKill` 원본대로 스폰 위치 지역에 1회 귀속. 웹 실측 `G._regions[].kills=[0,0,2,3]`(5링).
2. `native_natural_enemy_actor.gd` 1행 주석 "Exact initial v3 domain stays false" — 유지가 맞다(domain 불변). 포이즈는 이제 공용 코어 owner로 처리됨을 주석에 반영 요망.
3. 일반 적 스크립트 collision_mask `1|2`: 적이 플레이어 몸체에 막힌다. 원본은 일반 적-플레이어 몸체 충돌 없음(보스 34349만). 적 쪽 마스크 정리 여부 결정 필요.
4. `test_pc_followups_fieldboss` fb_hitcd_pass_through 배치 가정 재검토(§6).
5. `test_pc_boss_parity` B02 단정 난수 의존(기준 코드 포함) — 시드 고정 또는 판정 창 재설계.

## 8. 미확인

- Mac 실기 OS 키 3.43px 회차의 정확한 차단 원인(동일 장면 미재현; 적 몸체 차단 가설과 일치만 확인).
- 웹 전용 dot+shieldHit 주기 피해의 출처.
- 실제 사용자 창(integ10-play) 반영 여부 — 실행 중 창은 건드리지 않았다.
