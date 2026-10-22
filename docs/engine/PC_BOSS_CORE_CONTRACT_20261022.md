# PC 보스 코어 계약 — 1-1 다크드루이드 전투 owner (2026-10-22, PC Claude)

작업 `pc-boss-core` / 브랜치 `claude/pc-boss-core-20261022` / 기준 `f9475ab1e`(Mac INTEG-9 `1c3f67a1` + PC 테스트 전제 수정).
원본 대조는 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…85e5d4`, 65,692행)만 쓴다. 루트 `game.html`은 읽지 않는다.

이 문서는 **코드보다 먼저** 쓴 설계이고, 구현 뒤 실제 결과(§9)를 덧붙였다. 표의 원본 행은 모두 스냅샷 행 번호다.

## 0. 사용자 결정(2026-10-22)과 이 문서의 범위

| 결정 | 이 작업에서의 처리 |
|---|---|
| ~~카메라 줌 ×2.5~~ | **폐기(2026-10-22 사용자 재결정, "웹을 그대로 옮긴다")**. 웹 카메라·원본 수치를 그대로 쓴다. PC의 ×2.5 미리보기 캡처(`capture_pc_boss_core.gd`)는 pc-boss-parity에서 삭제 |
| ~~보스 공간 균일 축소 S=0.4~~ | **폐기(같은 결정)**. `BOSS_SPACE_SCALE`·`native_boss_space.gd`·core 경계 변환·검증 테스트 `test_pc_boss_core_space.gd`를 pc-boss-parity에서 삭제(§7) |
| 보스 전투 owner(AI 틱·HP·포이즈·hurtE·최종 사망)는 PC | §2~§6 |
| 보스 actor·보스 투사체·BGM·표시·입력은 Mac | Mac 파일 수정 0을 원칙으로 하고, 필요한 변경은 §8 "Mac 요청"으로 남긴다 |

## 1. 1-1 보스 식별과 원본 행 색인

| 항목 | 원본 행 | 값 |
|---|---|---|
| 슬롯 | 16633–16712, 30782 | `HELL_BOSSES[0]` 다크드루이드, si0 |
| 생성 | 31120–31185, 31260–31261 | `mkEn(...,0,0,true,EL.P,0)` → **etype 0**, ib=true, el=EL.P(0), r=44, speed .5, eShield=eShieldMax=hp, revPts 200 |
| 일반 드루이드 판정 | 16938 | `_isNormalDruidBoss(e)= e.ib&&(G.stage===0||G.stage===3)&&!finale` → si0 참 |
| 피날레 | 16644–16648, 17054–17055 | `_DEMO_LAST_STAGE=0`이면서 stage3 요구 → 도달 불가. 이식하지 않음 |
| 적 업데이트 루프(보스 해당분) | 34393–34399, 34449–34455, 34459, 34477, 34488–34490, 34496–34535 | 오라 초기화 `_aAtkM/_aSpdM/_aDefM`, 공통 타이머 감소, 부활 무적 감소, T1 매 프레임 `updateE`, 사망 후 `_reviveTimer` 2차 판정 |
| updateE 앞부분(prefix) | 38584–38884 (+38885–40443의 etype별 분기: etype0/ib 해당 없음) | lesson→telegraph→벽 밀어내기→reviveIframes→저주/감전→넉백·벽충돌→hitStun/stun return→이동 판정→빙결→상태 타이머→(보스 포이즈 자연회복 없음)→d→이동 SFX→부활추적→시야 어그로→facing→공통 어그로 이동→DOT→ATK 리셋→엘리트(없음)→오라→`_tickProjCharge`→비어그로 return(보스 제외)→`_ffDir`/`st2-=sp` |
| 보스 디스패처 | 40444–40454 | frozen return→`_bossPhaseCheck`→finale(false)→idle이면 `_bossIdleMove`+`_bossAI`→feint 취소→switch |
| updateE 뒤(suffix) | 41405–41408 | `G._bossArena&&e.ib&&e.alive`면 `_pushOutWall(e)` |
| hurtE 보스 분기 | 42110–42135, 42340, 42463–42498, 42515–42625, 42641–42649, 42733–42735 | 거울방어/폭발반격(CH1 무브셋에 없음), parryBlueBean, 보스 KB ×0.05, 보스 포이즈 저항, **1차 즉시 부활**, **2차 폴백 예약**, 사망 문구 |
| 2차 부활 판정 | 34496–34535 | `_reviveTimer` 180 소진 → roll<chance면 부활(HP50%·revPts−10), 아니면 **완전 사망** |
| 클리어 poll | 41816–41838 | 30프레임마다 살아있는 보스 검색, `_reviveTimer>0`이면 유예. Godot에선 Mac37 encounter가 PCI-11 `final_death` 구독으로 대체 |
| `_poiseHit` / `_poiseReset` | 19972–20005 | 보스 `_pImmune>0` 거절, stun 90, `_pImmune=300` |
| 패링 판정/보상 | 38469, 38470–38575 | `isPWin`, `doParry` — 기존 PC M29 서비스 부분집합 재사용 |
| 보스 근접 접촉 본문 | 40500–40503, 40680–40686, 40705–40707, 40957–40965, 41088–41095, 41125–41131, 41156–41163, 41064–41070, 40846–40866 | §5 표 |
| 보스 전역 큐 tick | 37015–37052, 37067~37079(fissure/tide/seeker/poison), 37080–37126(리듬탄·ORB), 37129 | §6 |

## 2. 소유 경계

| 영역 | 소유 | 파일 | 비고 |
|---|---|---|---|
| AI 조립(prefix 요청→phase→idleMove/projectile/selector/start→feint→switch→suffix 요청) | Mac | `native_demo11_boss_actor.gd` | 수정 0. PC는 bind_owner로 응답만 공급 |
| BC01~BC10 순수 모듈(무브셋·수치) | Mac(Codex) 산출, 공용 | `native_ch1_boss_*.gd` | 수정 0. S는 경계 변환(§7)으로 적용 |
| **AI 틱 owner**(World 위상 등록·프레임 발급) | **PC** | 신규 `native_demo11_boss_core.gd` | World `register_summoned_enemy`의 phase consumer = 보스 body |
| **updateE prefix/suffix** | **PC** | 신규 `native_demo11_boss_prefix.gd`(순수 함수) + core | 원본 순서·RNG 행 그대로 |
| **보스 HP·쉴드·포이즈·스턴·부활·사망 필드** | **PC** | core의 정본 `E`(Dictionary) + 신규 `native_demo11_boss_body.gd` | actor `_enemy`는 응답(readback)으로만 갱신 |
| **플레이어→보스 피해(hurtE)** | **PC** | 기존 `native_normal_enemy_hurte.gd` 보스 분기 확장 | 근접·석궁(normalBow)·스킬이 같은 executor를 이미 호출 — 수식 복제 0 |
| **보스→플레이어 피해(접촉·전역 큐)** | **PC** | core | 기존 `player.receive_damage`/`apply_native_posthurt_knockback`, M29 서비스(isPWin·doParry 부분집합) 재사용 |
| 보스 투사체 생성·이동 | Mac | `native_demo11_boss_projectiles.gd` | `spawnProj_owner`/`_spawnBossProjectile` Mac 바인딩 유지 |
| 보스 투사체→플레이어 접촉 | **PC** | core가 `bind_protected_contact` | 기존 enemy projectile 접촉 계약(`receive_native_projectile_contact`) 재사용 |
| 최종 사망 발행(PCI-11) | **PC** | `native_final_enemy_death.gd` 보스 발행 진입점 | 1회만. Mac37 encounter가 구독(기존) |
| 보상·스테이지 클리어·출구 | Mac37/P3-003 | `native_demo11_encounter.gd` | 수정 0 |
| 표시(텔레그래프·보스 뷰·HUD·카메라) | Mac | boss11_*, map11 product, hud | 수정 0 |

## 3. 틱 순서 (한 World 물리 프레임)

| 순서 | 위치 | 내용 | 원본 |
|---|---|---|---|
| 1 | World `_physics_process` | `_native_ticks = min(delta*60,3)` (= 원본 `sp`) | 원본 고정스텝 sp |
| 2 | World `advance_native_owner_phase` → body `advance_native_phase(ticks, frame, enemies)` | 등록 순서(필드 적 뒤). body가 PC core에 틱 위임 | 34421 이후 ens 순회 |
| 3 | core `_tick_alive` | 루프 앞부분 오라 초기화·타이머 감소(34395–34397, 34449–34455, 34459) → actor `begin_tick(frame)` | |
| 4 | actor → `source_updateE_prefix` (PC 동기 응답) | prefix 순수 함수 실행, 내부 owner 요청(canMv·ffDir·LOS·hurtE 벽충돌·generic 탄 발사)은 PC가 같은 콜스택에서 처리, `through_source_line=40443`, `cached_distance=d`, `return_update` | 38584–40443 |
| 5 | actor 내부 | phase(→`phase_transition_commit` PC)·phase effects·idleMove·idle탄·selector·start·feint·switch. 각 명령은 §4 owner가 동기 ACK | 40444–41383 |
| 6 | actor → `source_updateE_suffix` (PC) | `_pushOutWall`(arena) → `enemy_after` = 정본 E | 41405–41408 |
| 7 | core | 보스 body 위치·반경을 E(월드 좌표)로 동기화 | — |
| 8 | 사망 상태 | E.alive=false면 actor AI를 돌리지 않고 `_reviveTimer` 감소·2차 판정(34496–34535). actor에는 `return_update=true` prefix로 사망 상태만 반영 | 34496 |
| 9 | World queue phase (core `advance_queue`) | 리듬탄·ORB·전역 큐(§6) | 37015–37129 |

같은 serial로 두 번 tick 하지 않는다(actor가 거절). actor의 `_physics_process` 시계는 PC가 시계 소유를 넘겨받을 때 `set_physics_process(false)`로 끈다(World `register_native_phase_consumer`와 같은 관례).

## 4. receipt 계약 (actor `bind_owner` 명령 → PC 응답)

모든 응답은 동기 Dictionary. `ack:true` 없이 다음 단계로 가지 않는다. `null`(비동기)은 쓰지 않는다.

| 명령 | 요청 핵심 | PC 응답 | 원본 |
|---|---|---|---|
| `source_updateE_prefix` | enemy, player, frame | `{ack, enemy_after, player_after, context_after, globals_after, through_source_line:40443, cached_distance, sp_after, return_update}` | 38584–40443 |
| `phase_transition_commit` | proposal(BC05 phase_transition 결과) | `{ack, enemy_after:proposal.enemy(정본 E에 반영), player_after}` — HP 하한·reviveIframes90·atk×1.3 등 보호 필드 PC commit | 38236–38259 |
| `source_updateE_suffix` | enemy, player | `{ack, enemy_after, player_after}` | 41405–41408 |
| `source_global_write` | event{field,value} | `{ack, globals_after}` — G 실제 쓰기 | 각 module `_global` |
| `hurtP` | [dmg, opts] | `{ack, player_after}` | 43415 (기존 player 경로) |
| `player_kb_add` | [kx,ky] | `{ack}` (기존 `apply_native_posthurt_knockback`) | 38289 |
| `resolve_boss_movement_contact` | descriptor(family charge/jump/dash/idle) | `{ack, enemy_after, player_after}` | 40500–40503, 40680–40686, 40705–40707, 40957–40965 |
| `resolve_boss_melee_contact` | descriptor(slash/slam/sweep) | 같음 | 41088–41095, 41125–41131, 41156–41163 |
| `resolve_boss_erupt_contact` | descriptor | 같음(`owner` pending) | 41064–41070 |
| `resolve_boss_grab_damage` / `apply_boss_player_control` | descriptor / assignments | `{ack, enemy_after, player_after}` | 40846–40866 |
| `resolve_druid_orb_contact` | orb, aoe | `{ack, …}` | 37116–37123 |
| `canMv`/`safePt`/`_ffDir` | — | actor 자체 바인딩(Mac) | 31712/31717/31897 |
| `_spawnBossProjectile`/`spawnProj_owner` | props | Mac 바인딩 | 16938–16995 |
| 표시 명령 `addTxt`·`addParts`·`poolPart`·`shake`·`playVFXAng`·`deathFX`·`_addBlastLight`·`_addTp*`·`SFX.*`·`_bossSfx`·`_reviveVFX`·`setTimeout`·`_T`·`write_enemy_fields`·`write_globals`·`append_global_queue`·`ensure_global_queue`·`atkTicketRelease` | — | 기존 adapter가 있으면 그 adapter로(예: addParts=`world.emit_native_parts`, poolPart=`emit_native_source_particle`, addTxt=NativeFloatingText, shake=G.shake 규칙). 없으면 **표시 미이식 ACK**(카운터 기록). G/E 쓰기 명령은 실제 쓰기 | 각 행 |

RNG: 게임플레이 RNG(모듈 ledger 행)는 actor가 World 공용 RNG에서 원본 순서로 소비한다. 표시 함수 내부 RNG는 기존 관례(P1-002E: "시각 FX 내부 RNG는 미이식과 함께 비소비")를 따른다 — 이식된 adapter(addParts=`emit_parts`)는 원본처럼 소비, 미이식 표시는 비소비. 이 차이는 §9 대조표에 명시한다.

## 5. 보스 피해 경로

### 5.1 플레이어 → 보스 (hurtE)

기존 `native_normal_enemy_hurte.gd`의 `ib` 정지(42124)를 원본 행 단위로 연다. 보스 body가 hurtE owner API 7종을 제공하므로 근접(`player._melee_contact`)·석궁(PCI-03 normalBow)·스킬(`native_skill_slots`)·기검참(`crescent`)이 모두 같은 executor를 탄다.

| 원본 행 | 보스 동작 | 이식 |
|---|---|---|
| 42120–42121 | reviveIframes 캡 90, 비DOT 피격마다 −1 후 return | 기존 경로(필드만 body) |
| 42124–42135 | 거울방어/폭발반격 | 1-1 무브셋에 해당 상태 없음 → 그 상태일 때만 정지(가짜 구현 0) |
| 42209/42258 | 언데드 보너스 제외 / bossSlayer·vsBossDmg | 기존 조건부 어픽스 합계 경로가 ib를 읽음 |
| 42340 | 보스 parryBlueBean = mhp×10% | opts 키 미지원(기존 정지 유지) |
| 42345–42352 | 에너지쉴드 흡수(DR 이후 쉴드→HP, DOT 제외·shieldHit 예외) | 기존 경로 그대로 — CLAUDE.md 규칙과 동일 |
| 42382 | 즉시반격(!ib) | 보스 제외(원본) |
| 42414 | 피격 경직(!ib) | 보스 제외(원본) |
| 42463–42464 | 보스 넉백 `finalKbM=0.05` | 추가 |
| 42486–42488 | `!(ib&&_pImmune>0)`, 보스 저항 ×0.2(원소)/×0.5 | 추가 |
| 19972–19983 | `_poiseHit` 보스: stun90·`_maxStunned`·`_pImmune=300` | body 포이즈 코어 |
| 42515–42625 | **1차 즉시 부활**: deaths++, revCost, `_revPts`, 확률 `2.00+si*.05-(deaths-1)*.15-suppress`, 성공 시 HP100%·shield0·phase0·recover90·maxPoise×1.5·atk×1.5·speed·patCd·r 축소·텔레포트·충격파·2차부터 분노탄 | §9에 이식 범위 기록 |
| 42641–42649 | 2차 폴백 예약 `_reviveTimer=180` | 추가 |
| 34496–34535 | 2차 판정 → 부활(HP50%) 또는 **완전 사망** | core 사망 tick |

### 5.2 보스 → 플레이어

모든 경우 원본 순서: `isPWin()` → (참) `_pd` 계산·`e.stunned`·`hurtE(e,_pd)`·`P.parryBank+=`·`doParry`·`_poiseHit(e,20)` / (거짓) `P.s!=='charge'`면 `hurtP(~~(atk*M*elMul))`·`P.kb+=`.

| family | 원본 행 | M(hurtP) | 패링 K(_pd) / stunned | KB |
|---|---|---:|---|---:|
| idle 접촉 | 40500–40503 | .8 (elMul 없음) | 패링 없음 | 0 |
| charge | 40680–40686 | 2 | 5 / 90(+kb 18), detonate면 60 | 12 |
| jump 착지 | 40705–40707 | 1.8 | 패링 없음 | 15 |
| multiDash | 40957–40965 | 1.3 | 4 / 90 | 8 |
| slash | 41088–41095 | 1.5 | 3 / 60 | 7 |
| slam | 41125–41131 | 2.2 | 4 / 80 | 14 |
| sweep | 41156–41163 | 1.8 | 3 / 60 | 10 |
| erupt | 41064–41070 | 2.2 | 4 / 60 | 14 + poison+4·webSlow≥90 |
| grab | 40846–40866 | .4 tick / 1.8 throw | 패링 불가 | 18 |

`_pd = ~~((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*K*pParryDmg())`. doParry는 M29 서비스와 같은 기존 writer 부분집합(보상·iframes25·poise+1)만 쓴다(§9 미이식 목록 유지).

## 6. 보스 전역 큐·리듬탄

| 큐 | 원본 행 | 처리 |
|---|---|---|
| 리듬탄(Q 패링 기회) | 17043–17046, 37080–37104 | BC09 `rhythm` 모드를 core가 queue phase에서 구동 |
| ORB | 37106–37126 | BC09 `orbs` 모드 구동 |
| `_chaseAoes`/`_fissures`/`_tideWaves`/`_seekerMines`/`_poisonPools`/`_lavaPools` | 37015–37052, 37067–37079, 37129 | §9 결과 표에 READY/NOT_READY 기록 |

## 7. 공간 축소 `BOSS_SPACE_SCALE` (S) — 폐기·삭제 (2026-10-22, pc-boss-parity)

사용자가 같은 날 "이식은 웹 게임을 그대로 옮기는 것"으로 기준을 다시 정하면서 카메라 줌 ×2.5와 보스 공간 축소 S=0.4를 모두 폐기했다. 원본과 다른 동작의 흔적을 남기지 않기 위해 다음을 삭제했다.

| 삭제 대상 | 내용 |
|---|---|
| `godot/scripts/native_boss_space.gd` | `BOSS_SPACE_SCALE=0.4`, 닮음 변환 `to_world_xy/to_boss_xy/len_to_world/len_to_boss/player_to_boss/player_to_world` |
| `native_demo11_boss_core.gd` | `space`·`mac_space_ready`·`effective_scale`·`_b2w/_w2b/_player_b`·`world_length`, snapshot의 `space/effective_scale/decided_scale`. 보스 정본 E 좌표 = 월드 좌표 = 원본 좌표 |
| `native_demo11_boss_body.gd` | `radius`가 `core.world_length(r)`를 거치던 것 → `E.r` 그대로 |
| `godot/tests/test_pc_boss_core_space.gd` | S 경계 변환 검증 테스트(S 자체가 없어져 검증 대상이 없음) |
| `godot/tests/capture_pc_boss_core.gd` | ×2.5 줌 미리보기 캡처(테스트 전용 canvas_transform) |

제품 동작 영향: pc-boss-core 시점에도 Mac 경계(`bind_space_transform`)가 없어서 제품 effective S는 1.0이었고 변환 함수는 입력을 그대로 돌려줬다. 그래서 삭제 전후 동작은 같다. 삭제 뒤 원본 VM oracle 재대조: prefix 400케이스·25,650 assertion 0실패, 상태·큐 500케이스·30,833 assertion 0실패, 사망 195케이스·73,251 assertion 0실패, `test_pc_boss_core` 28/0.

## 8. Mac 요청

| ID | 파일 | 요청 |
|---|---|---|
| ~~M1~~ | `native_demo11_boss_actor.gd` | **철회**(S 폐기). 공간 변환 바인딩 불필요 |
| ~~M2~~ | `boss11_visual_reader.gd` 등 | **철회**(S 폐기). 텔레그래프는 원본 상수 그대로 |
| ~~M3~~ | `native_demo11_boss_projectiles.gd` | **철회**(S 폐기) |
| M4 | `test_demo11_boss_actor.gd` | MAP11 기본 부팅에서 스폰 좌표(4020,7200)가 막혀 spawn REJECTED → 39행 `enemy.hp` Dictionary 접근 SCRIPT ERROR → quit 미호출 900초 timeout. 보스 owner 부재와 무관(§9) |

## 9. 구현 결과

(구현 후 기록 — 아래 절)
