# PC-COMBAT-KILL — 웹 맵 시작 필드 처치 0 + 보행 감속 수정 보고

2026-10-22 KST, PC Claude. 기준 Mac INTEG-13 `06f3db984`, 브랜치 `claude/pc-combat-kill-20261022`, worktree `G:\exoduser-wt\pc-boss-parity`(재사용, 새 worktree 0).
원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(sha256 `4d911cdd…`, `snapshot.cjs` 검증 후 웹 라우트로 제공). 로그·캡처 `G:/exoduser-wt/_out/pc-combat-kill/`.
원인·수정 계약 전문: [PC_COMBAT_KILL_20261022.md](../../PC_COMBAT_KILL_20261022.md).

## 1. 멈춘 지점과 원인

| 증상 | 멈춘 곳 | 원인 |
|---|---|---|
| 커튼 링·자연 etype0/5 처치 0 | `native_normal_enemy_hurte.gd` 42490 `_poise_via_source_field_call` → `World.begin_native_normal_enemy_field_call` null → `source_field_call_unavailable`. 42383 HP 쓰기 **뒤** 정지라 `hp<0, alive=true` 좀비 → `player._melee_contact`가 hp<=0 대상을 건너뜀 | flesh_crawler 계열을 무조건 v3로 보냈고 v3 domain은 `ch1_initial_015` exact actor 1종(`enemy_melee_flesh_crawler.gd` 410~412) |
| etype6 방패돌격병 피해 0 | 42136 `unported_branch_active:special_etype_6` | `SPECIAL_HIT_ETYPES`에 6 포함. 원본 hurtE의 etype6 분기는 42167~42170 방패 경감뿐 |
| E2E enemy_kill 지역 0 | `native_stage_spawn_adapter.record_actor_kill` `unbound_actor_origin` | 커튼 링은 소환굴 origin 없음. 원본 `_regKill`(60728~60731)은 스폰 위치로 귀속 |
| 보행 감속/정지 | `player.gd` move_and_slide + mask `1|4` | 원본 보행은 canMv만(G33022~33028), 일반 적 몸체 충돌 없음(보스 34349만) |

## 2. 수정

| 파일 | 소유 | 내용 |
|---|---|---|
| `godot/scripts/native_normal_enemy_hurte.gd` | PC | 42490: v3는 `_source_normal_fields_configured` actor만, 나머지 flesh_crawler는 공용 코어. 42167~42170 etype6 방패(×0.3, `🛡`) 이식·정지 목록에서 6 제거 |
| `godot/scripts/enemy_melee_flesh_crawler.gd` | PC(P1-002.F owner API) | `apply_native_normal_enemy_poise_core` 추가(공용 19973~19983 코어, v3 actor·legacy pending은 거부, `_maxStunned` 동기). **v3 exact domain 변경 0** |
| `godot/scripts/native_dedicated_enemy_hurte_owner.gd` | PC | `read_fields`에 `shieldAng` |
| `godot/scripts/player.gd` | PC | World `can_move`가 있으면 넉백(G32762 두 축 함께)·보행(G33022~33028 축 분리)을 canMv로 직접 적용. 독립 프로토타입 경로만 move_and_slide 유지 |
| `godot/scripts/native_stage_spawn_adapter.gd` | **Mac — 최소 훅** | origin 없는 비보스 처치를 스폰 위치→`provider.region_at`→`record_stage_origin_kill` 1회 |
| `godot/tests/test_pc_combat_kill.gd` | PC 신규 | 4그룹 47단정. 수정 전 코드 30실패 / 수정 후 47/0 |

피해·사망 주입, 폴백 경로, docs/2_3, 세이브 형식, 기존 테스트 변경 없음.

## 3. 웹 대비

같은 무기 공격력(비교 전용 픽스처로 웹에 Godot 롤 값 대입): atk1 → 석궁 105 / kiSlash 940 / weapon 145, 링(HP875+쉴드875) kiSlash 2타 처치 — 양쪽 동일. atk31 → kiSlash 2704 / 석궁 129, kiSlash 1타 처치 — 양쪽 동일. 수정 전 Godot은 처치 0.
보행 1.8초: 웹 298.4px(2.763/tick×108), Godot 수정 전 276.2px(적 몸체 차단 9틱), 수정 후 294.3px(2.725/tick×108, 속도 차는 시작 장비 롤).
나란히 캡처 `compare_first_hit.png`·`compare_first_kill.png`·`compare_after_fight.png` 직접 열람 — 피해 숫자(청 쉴드/백 HP)·그로기·처치 연출 동일 방식. 이름판·배너 시점·타이머는 범위 밖 차이.

## 4. 테스트 (각 1회, 예외는 표기)

pc_combat_kill 47/0(묶음 1회차 부팅 signal 11 → 재실행), pack_b 378/0, pack_b_mac 402/0, m29 101/0, final_death 61/0, enemy_revive 51/0, player_life 101/0, qe_binding 0실패, p1002e 94/0(1회차 부팅 signal 11 → 재실행·최종 94/0), p1002f 358/0, p1002g 221/0, followups_fieldboss 159/1(기준도 동일 실패), pcib_mac_calls 31/0, move_skills 256/0, boss_parity 37/2(B02 난수 — 기준도 동일 분포), skill_writers 80/0. SCRIPT ERROR 0. E2E storage on 11/7/0(기준 7/11/0), enemy_kill PASS.

## 5. Mac 요청 / 미확인

PC_COMBAT_KILL_20261022.md §7·§8.
