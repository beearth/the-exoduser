# PC-FOLLOWUPS — 석궁 필드보스 정지 해제 · PC 묶음 B/A 테스트 전제

2026-10-21~22 KST, PC Claude(전투 핵심). worktree `G:\exoduser-wt\pc-followups`, branch `claude/pc-followups-20261021`, base Mac integ6 `d5b842df7`(origin/main abc3dd442 PC 묶음 A·B + Mac PCIA/PCIB 배선 포함). 계약: [PC_COMBAT_PACK_B_CONTRACT_20261021.md §5a](../../PC_COMBAT_PACK_B_CONTRACT_20261021.md), [PC_LIFECYCLE_CONTRACT_20261021.md §7](../../PC_LIFECYCLE_CONTRACT_20261021.md).

**판정: P0 석궁 필드보스 정지 해제 완료(필드보스 피격·hitCd·최종 사망까지, 표현만 미이식) · 묶음 B 테스트 bound actor 전제 수정 완료 · 묶음 A 테스트 MAP11 전제 수정 완료.** E2E는 PASS10/NR8/FAIL0으로 Mac 기준(PASS13/NR5)보다 낮고 Mac 하니스 SCRIPT ERROR가 생겼다(§4, 원인 분석 포함). 성능은 hurtE 접촉 1회 10~14ms 스파이크가 새로 드러났다(§5, HOLD).

## 1. 항목별 상태

| 항목 | 상태 | 근거 |
|---|---|---|
| P0 석궁 `field_mob_owner_unported:_fieldBosses` 정지 해제 | **완료** | carrier가 더 이상 필드몹 존재만으로 거절하지 않음. 원본 35279 `_hurtFieldMobs`를 같은 순서로 이식(필드보스 4슬롯) — 신규 PC owner `native_field_mob_hit_owner.gd`. 실제 MAP11 부팅에서 Mac 자동 석궁 **fired 23 / hits 23 / kills 1**(앵글러 4슬롯 존재 중, 같은 구간 필드보스 적중 11회). 원본 VM 대조 3사례(비치명·hitCd 통과·치명+같은 스텝 일반 적 킬관통) 궤적·record 상태·운명·RNG 행 일치 |
| 필드보스 피해 writer | **기존 seam 사용** | 피해 = 원본 `_fmApply`의 `max(1,ToInt32(dmg))`(원본도 hurtE·elMul 없음). HP·최종 사망은 Mac family 기존 PC readback seam `bind_pc_source` 신호 `(index,hp,final_death,serial)`. 수식 복제 0 |
| NOT_READY로 남긴 부분 | 웜(`_worms`)·화마귀(`_fireDevils`)·`_fieldBoss` 단독 | **실제 접촉 스텝만** 쓰기 전에 거절. 없는 것: 두 family의 PC hit seam(`bind_hit_owner`/`apply_hit`)에 제품 PC owner 연결과 hitSet 키 계약(MAP11에는 두 family 미배치). 단독 `_fieldBoss`는 family readback이 4슬롯 배열 전제 |
| 필드보스 표현 | 미이식(기록) | 데미지 숫자 addTxt·addParts·`showPH('필드보스 처치!')`·deathFX/시체/고어 조각/임팩트/shake/flash. 고어 롤 RNG 3회는 원본 순서로 소비 |
| 묶음 B 테스트 bound actor 전제 | **완료** | Mac 생성 시 자동 bind(`world._bind_pcib_actor`)를 그대로 인정. unbound 검사는 새 actor를 만들고 자동 bind를 **명시 해제**해서 사용. 단정 약화 0(pci02 35→43: 자동 bind 토큰·재bind APPLIED·재bind 후 이중 bind 거절 등). Mac 래퍼 `test_pc_combat_pack_b_mac`(MAP11) **408/0·ERROR 0**(Mac 보고 355 중 3실패+SCRIPT ERROR 1) |
| 묶음 A 테스트 MAP11 전제 | **완료** | final_death·enemy_revive는 부팅 배치 기존 맵 적이 대상 → 테스트 안에서 Main 메타 `native_map11="off"`(= `--map11=off`)로 부팅을 명시 + 부팅 맵 단정 1개. 기본 실행(인자 없음) 60/0·51/0 |

## 2. 원본 대조 (35279 `_hurtFieldMobs`)

`pc_combat_pack_b_source_oracle.cjs`에 원문 `_fmXY/_fmCanHit`(G18628–18634), `_fmDeathFx/_fmApply`(G18677–18712), `_fbAliveCount/_fbMarkDead`(G61031–61042)를 추가 추출(앵커 assert). gameplay RNG 행에 18692/18693/18694(필드몹 고어 롤) 추가. 필드보스 record는 Godot 실제 G 슬롯 복제(+id), RNG는 Godot이 실제로 뽑은 값.

| 사례(실제 MAP11, 실제 AI로 깨운 앵글러 0) | 결과 |
|---|---|
| nonlethal(dmg50) | t12 접촉, hp 16125→16075, hitCd 8, 화살 재활용(35628). 매 틱 궤적 오차<1e-6·record hp/hitCd/alive·운명 일치 |
| hitcd_skip(같은 프레임 2번째) | hitSet 선기록 후 hitCd 거절(18700) → 피해 0·n=0 → 화살 계속 비행, t36 drop. 원본과 일치 |
| lethal + 일반 적(같은 스텝) | 필드보스 최종 사망(슬롯 null·alive false·family readback hp0) → 같은 스텝 일반 적 처치 → 킬관통(35617)이 hit=false로 되돌려 화살 계속(t36 drop). RNG 행 `[18692,18693,18694]` 일치, `_fbDone` false(다른 3마리 생존) 일치 |

일치 범위 밖(명시): 최종 사망 record의 hp 값 — 원본 음수, 이식 0(family readback이 hp<0 거부). 슬롯이 즉시 null이 되므로 이후 관측 경로 없음.

## 3. 변경 파일

| 파일 | 줄 | 기존 줄 수정 |
|---|---|---|
| `godot/scripts/native_field_mob_hit_owner.gd` (신규, +.uid) | 249 | — |
| `godot/scripts/native_player_arrow_carrier.gd` | +60/−9 | 필드몹 존재 거절 루프 제거(build_env), 35279 주석 1줄 교체, `_contact_count` 조건 1줄(필드몹 접촉 포함), 관통 continue 4곳 앞 `hit = false`(원본 `hit=false;continue` 그대로 — 필드몹 적중이 없으면 hit은 원래 false라 기존 동작 동일) |
| `godot/scripts/native_combat_pack_b.gd` | +6/−2 | `_step_view`에 `field_mob_receipt` 추가, snapshot에 owner 상태 |
| `godot/tests/pc_combat_pack_b_source_oracle.cjs` | +13/−2 | 원문 추출 3구간·앵커·RNG 행·틱별 필드보스 view(기존 사례는 `_fieldBosses` 없음 → 동작 동일) |
| `godot/tests/test_pc_combat_pack_b.gd` | +50/−11 | pci02 bound/unbound 분리, 직접 실행 때만 기존 맵 부팅 명시(상속 래퍼는 기본 MAP11 유지) |
| `godot/tests/test_pc_final_death.gd` / `test_pc_enemy_revive.gd` | +5/+5 | 기존 맵 부팅 명시 + 부팅 맵 단정 |
| `godot/tests/test_pc_followups_fieldboss.gd` (신규, +.uid) | 487 | — |
| `godot/tests/bench_pc_followups_field600.gd` (신규, +.uid) | 70 | — |
| 문서 | 계약 §5a/§11, 생명주기 계약 §7, 이 보고서, CHANGELOG_SYNC 최상단 | — |

Mac 소유 파일 수정 0(`native_demo11_anglers.gd`, `native_demo11_auto_crossbow.gd`, `test_demo11_47h_e2e.gd`, `test_pc_combat_pack_b_mac.gd`, `world.gd` 등). docs/2_3·Q/E 판정·피해 수식·세이브 형식 변경 0.

## 4. 테스트 결과 (최종 1회씩; 개발 중 반복 실행 별도 기록)

공통 인자 `--source-game=<origin/main game.html 4d911cdd…> --node-bin=C:/nvm4w/nodejs/node.exe --artifacts-dir=…`, NODE_PATH=G:/exoduser/node_modules(junction 0). 매 실행 override.cfg로 격리 userdir 지정 후 `git checkout -- godot/override.cfg`. worktree `game.html`은 title 1줄만 달라 SHA가 189899b4라 테스트 SHA 단정 기준(4d911cdd) 파일을 `_out`에 뽑아 사용(행 번호 동일).

| 테스트 | 결과 | ERROR | 비고 |
|---|---|---|---|
| **test_pc_followups_fieldboss**(신규, MAP11 기본) | **167/0** | 0 | 9그룹. 자동 석궁 fired23/hits23/kills1(55s), 원본 대조 3사례 |
| test_pc_combat_pack_b(직접, 기존 맵 명시) | 362/0 | 0 | 이전 353/0 + pci02 재구성·부팅 맵 단정 |
| test_pc_combat_pack_b_mac(Mac 래퍼, MAP11) | 408/0 | 0 | Mac 보고 3실패+SCRIPT ERROR 1 해소 |
| test_pcib_mac_calls(Mac DEMO11-48) | 31/0 | 0 | |
| test_pc_final_death / enemy_revive | 60/0 · 51/0 | 0 | 기본 실행. 단정 수는 G42633 부활 롤에 따라 60~61 |
| test_pc_player_life / recalc_st / pet_portrait_cache | 101/0 · 49/0 · 23/0 | 0 | |
| test_pc_m29_parry / pc_runtime_stat_refresh | 100/0 · 284/0 | 0 | |
| test_native_qe_binding | 155/0 | 0 | |
| test_p1002e / f / g | 기본(MAP11): 15/3 · 6/4 · 8/6 / `--map11=off`: **93/0 · 357/0 · 220/0** | 0 | 기본 실패는 base d5b842df에서도 **동일**(부팅 배치 적 전제) — 이번 변경 무관, 테스트 미수정 |
| test_native_auto_bow_spec | 361/0 | 0 | |
| demo11_boss_projectiles / projectile_auto / coordinates / draw | 29/0 · 14/0 · 4/0 · 6/0 | 0 | |
| test_boss_ch1_bc09_projectiles | 56664/0 | 0 | |
| **E2E `test_demo11_47h_e2e --demo11-storage=on`** | **PASS10 / NOT_READY8 / FAIL0**, exit0 | **SCRIPT ERROR 7507** | 아래 |

모든 Main 부팅 로그의 `Camera2D overridden to physics process mode` WARNING은 기존 그대로.

E2E 상세(1회, 결과 그대로):
- PASS: isolation·new_game·character_create·intro_skip·field_MAP11·item_pickup·equip·level_up·stat_passive_invest·save_handoff. NR: enemy_kill·auto_potion·revival_interface·bossroom_gate·boss_defeat_signal·clear·demo_end·lobby_return. Mac 기준 대비 enemy_kill·auto_potion·revival_interface가 PASS→NR.
- **enemy_kill**: 자동 석궁이 실제로 발사·명중(fired12/hits10/kills0, max_tick_us 30442). 대상 eShield875+HP875에 화살 126 → 약 14발 필요, 하니스 대기 45초 안 미처치. 하니스는 석궁 reason이 `field_mob_owner_unported:`일 때만 근접 fallback으로 가므로 이제 fallback이 일어나지 않아 NR. (Mac 하니스 판단 조건 — 수정 안 함)
- **SCRIPT ERROR 7507건 전부** `test_demo11_47h_e2e.gd:161 place_in_natural_contact` `float(enemy.get("_contact_ticks"))` = `float(null)`. etype1 자연 actor(`enemy_demo11_a_1.gd` → `enemy_archer_lightning_hive_bloater.gd`)에는 `_contact_ticks`가 없다. auto_potion(1452건)·revival_interface(6055건) 단계의 접촉 배치가 매 프레임 예외로 끝나 자연 피해가 없었다 → 두 단계 NR. 석궁 hurtE가 공유 World RNG를 소비하면서 자연 스폰 구성이 Mac 실행과 달라졌고(etype1 등장) 하니스의 null 미처리가 드러난 것으로 판단(제품 오류 아님, Mac 하니스 수정 필요 — 보고만).
- 제안(Mac): 161행 `float(enemy.get(k) if enemy.get(k)!=null else 0)`, enemy_kill은 석궁 대기 시간 초과 시에도 근접 fallback.

## 5. 성능

| 측정 | 전(base d5b842df) | 후 |
|---|---|---|
| 필드 600틱 벽시계(120Hz, hole 앵커[0] 고정, `bench_pc_followups_field600.gd`) mean | 9.765 · 10.030 ms | 10.034 · 10.269 · 10.511 ms |
| p95 / max | 20.335/24.515 · 21.065/24.771 | 20.559/23.692 · 20.766/24.337 · 21.340/**36.148** |
| 구간 석궁 | fired 0(base1 reason `field_mob_owner_unported:_fieldBosses`) | fired 1 · 0 · 2 (hits 1 · 0 · 2) |
| 신규 코드 단독(GDScript 헤드리스, 20000회) | — | scan 6.1~8.6 µs/스텝(4슬롯·접촉 없음), env 2.5~5.1 µs/pass |
| MAP11 30발 동시 비행 pass(접촉 0) | 측정 불가(base는 admission 거절) | mean 3.1~4.2 ms, max 10.3~11.9 ms |

- 전후 mean 차이(+0.0~0.7ms)는 실행 간 변동 폭(±0.3ms)과 겹친다. after3의 max 36ms는 석궁 2발 명중이 있던 구간.
- **새로 드러난 비용(HOLD, 이번 변경 범위 밖)**: MAP11 자연 적 hurtE 1회 비치명 **10.1~14.6 ms**, 치명 **50~56 ms**(임시 진단, 커밋 안 함). provider 콜러블 1회 0.07~1.46 ms(melee_ref 1.46·p_dot_pool 0.95·stat_str 0.82·p_atk_mul 0.81·parry_lesson_active 0.64·u_eq 0.56·eq_affix 0.52…). hurtE가 접촉마다 이를 여러 번 부른다. 묶음 B는 이 실행자 비용을 바꾸지 않았고, 이전에는 MAP11에서 석궁이 막혀 드러나지 않았을 뿐이다. 120Hz 예산 8.333ms 대비 명중 프레임 스파이크 → 후속 최적화 과제(provider 결과 프레임 캐시 등) 권장.
- 측정 환경: Windows 개발 PC, 헤드리스, 다른 세션 Godot 2개 동시 실행. Mac·릴리스 빌드 미측정.

## 6. import·작업 환경

- `--import` 실행: pc-followups 3회(1회차 16초에 segfault로 비정상 종료 → 재실행 정상 / 마지막 1회는 신규 3파일 .uid 생성용), 전 벤치용 임시 worktree `G:\exoduser-wt\pc-followups-base`(detached d5b842df) 2회. 임시 worktree는 벤치 후 제거.
- import가 만든 미추적 파일(기존 스크립트 .uid 138개, 음향/이미지 `.import` 37개)은 커밋하지 않고 worktree에 남김. 신규 3파일 .uid만 커밋.
- 실사용 userdir 사용 0. 격리: pc-followups/pc-combat-b/pc-life-pack/pc-m29-parry/pc-runtime-stats/P1002E·F·G/w01/demo11-35/bc09/demo11-47h.

## 7. 미확인·HOLD

| 항목 | 상태 |
|---|---|
| 웜/화마귀 플레이어 탄 피격 | NOT_READY(접촉 스텝 거절). 제품 PC hit owner 연결·hitSet 키 계약 필요 |
| 필드보스 피격/처치 표현(숫자·파티클·showPH·처치 연출) | 미이식 |
| hurtE 접촉 10~56ms 스파이크 | HOLD(§5), 후속 성능 과제 |
| E2E enemy_kill/auto_potion/revival NR·SCRIPT ERROR | Mac 하니스 조건/널 처리(§4). 제품 쪽 원인 아님으로 판단했으나 Mac 재검증 필요 |
| 필드보스 4마리 전멸 → `_fbDone`/gate 실제 경로 | 이번 테스트는 1마리 처치까지만 관측(나머지 생존 `_fbDone` false). 4마리 전멸·gate 개방 미관측 |
| 실제 화면 검수 | 화면 요소 추가 0. 실창 캡처 없음 |
| Mac 측 실행 | 미실행(PC Windows만) |
