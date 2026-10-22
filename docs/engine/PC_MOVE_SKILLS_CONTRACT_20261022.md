# PC-MOVE-SKILLS 계약 — Shift 사슬 이동(V-02)·방향+Space 전격이동(V-01)

2026-10-22 KST, PC Claude. 기준 INTEG-10 동결 `9133e2782`, 브랜치 `claude/pc-move-skills-v2-20261022`, worktree `G:\exoduser-wt\pc-move-skills-v2`.
원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…85e5d4`, main game.html과 같음).
차이 목록 기준: [PARITY_DIFF_LIST_20261022.md](PARITY_DIFF_LIST_20261022.md) V-01·V-02. 보고서: [orders/reports/pc-move-skills_REPORT.md](orders/reports/pc-move-skills_REPORT.md).

**판정 기준**은 웹과 같은 장면을 나란히 찍어 같아 보이고 같은 거리·같은 프레임으로 움직이는가다. 테스트 PASS는 필요조건이다.

## 1. 소유·파일

| 파일 | 역할 |
|---|---|
| `godot/scripts/native_move_skills.gd` (신규) | 단일 owner. 공용 기동 게이지·사슬(harp/dash)·전격이동(bladeDash) 상태와 원본 순서 실행, 렌더(홀드 UI·사슬·머리 위 게이지·land_fire·전격 구체·잔상·전류장판 번개 기둥·악의폭풍 스프라이트) |
| `godot/scripts/player.gd` | 호출 위치만: 입력 funnel 선행 처리, S16b/iframes/switch 훅, Space 슬롯 순위, 사슬기동 중 idle 행동 차단, 대시 비행 포즈(dash-flight-v1 프레임·lift·squash), 끌림/전격 중 일반 적 통과 |
| `godot/scripts/main.gd` | owner 설치(플레이어 앞 트리 순서), `BINDS.charge='ShiftLeft'` InputMap `charge`, `read_native_input_bindings` primary/supported 갱신, `read_native_move_skills()` |
| `godot/scripts/native_source_new_run_state.gd` | `apply_native_shake_assign`(G32298 `G.shake=4×OPT.shake/100` 대입) 추가 |
| `godot/scripts/native_player_sprite_expectation.gd` | 플레이어 스프라이트 준비 검사에 `dash_<방향>` 6프레임(64px) 기대 추가 |
| 에셋 | `assets/player/dash-flight-v1.png`·`assets/player_silvertail/dash-flight-v1.png`(warrior-dash-flight.js), `assets/vfx/chain_shuriken_2.webp`(G8708), `assets/vfx/vfx_landing_fire.png`(G19338), `assets/vfx/Lightning_BasicImpact.png`(G19628, 미-import·바이트 로드), `assets/sfx/move/*.mp3` 14개(사슬·음성) — 모두 원본 바이트 그대로 복사 |
| 테스트 | `godot/tests/test_pc_move_skills.gd`, `godot/tests/pc_move_skills_source_oracle.cjs`, 캡처 `godot/tests/capture_pc_move_skills.gd` |

## 2. 원본 행 → 포트 (스냅샷 실제 행)

지시서 행 번호 중 실제와 다른 곳은 아래 실제 행으로 고쳤다(keyup 끝, 포커스 해제 함수, `_dashIframe`, 게이지 최대치, activateBladeDash 끝).

| 원본 | 내용 | 포트 |
|---|---|---|
| G6188–6206 | BINDS: up W / down S / left A / right D, bow Space, charge ShiftLeft, BINDS2 전부 null | `main._register_inputs`, `read_native_input_bindings` |
| G12851–12883 | `_HARP_TIER_F=[0,1,6,12]`, 거리 기준 300/500/700(만렙 500/800/1200)×pChargeRange, `_HARP_IFRAME=[0,8,14,24]`, `_HARP_PULL_DUR=[0,7,11,16]`, `_HARP_SPD=63`, 게이지 비용 `[0,45,98,150]`, 기본 5칸 → 225 | `HARP_*` 상수 |
| G13215 | keydown K/KH 세팅(레슨 allowKey G13208 통과 후) | `handle_key` |
| G13225–13230 | Shift: 비행/끌림 중이면 캔슬(텍스트 '캔슬'), 게이지>0이면 홀드 시작, 0이면 '충전 중...'(showPH) | `_key_shift_down` |
| G13231–13249 | 전격이동 트리거: Space 누른 채 방향(KH Space 해제), 같은 방향 250ms 더블탭, 방향 누른 채 Space(사슬기동 중 제외, 방향 순서 up→down→left→right) | `_key_blade_dash` |
| G13330–13366 | keyup: 비행/끌림 중 키업은 홀드만 리셋, 아니면 단계(holdF≥12→3, ≥6→2, 그 외 1) 발사 | `_key_shift_up`, `_fire_chain("release")` |
| G13371–13380 | `_clearHeldInput`(blur/visibilitychange): K/KH 해제·홀드 무장 해제 | `clear_held_input` ← player `NOTIFICATION_APPLICATION_FOCUS_OUT` |
| G13383–13397 | mousemove/mousedown에서 Shift 수식키 꺼짐이면 KH Shift 해제 | `handle_mouse_modifier` |
| G32155–32160 | 프레임 앞 전격이동 탈출(fallen/dead/pStun 제외) | `advance_pre` 첫 줄 |
| G32166 | 게이지 회복 `MAX×.025/60×(1+chargeBoost×.05)×pChargeGauge`(홀드·비행·끌림 중, 레슨 chapter2 제외) | `advance_pre` |
| G32168–32196 | 홀드 `_dashHoldF++`(최대 120), 단계 갱신, 3단 도달 자동 발사 | `advance_pre`, `_fire_chain("auto3")` |
| G32197–32228 | 조준선 16px 간격 `canMvBlink(r=2)` 벽 감지 → 현재 단계 자동 발사 | `_fire_chain("wall")` |
| G32229–32259 | 입력 딜레이, 비행 `min(sp, 남은거리/63)`, 사거리 끝에서 벽이면 2틱 뒤로, 꽂힘(chain_stick) → 끌림 시작(poise 4, 무적 틱 `_HARP_IFRAME`, 속도 거리/PULL_DUR) | `advance_pre` |
| G32261–32299 | 끌림: 무적 ≥2, `canMvBlink(r)` 실패 시 정지, `shQuery(P,40)` → `dst≤e.r+20` 적 1회 hurtE `{kbMult:2,poiseHit:true,poiseMult:2.0}`·kb+25·'🔱 관통!'·파티클 8·`G.shake=4` | `_dash_path_hits` |
| G32359–32507 | 착지: 무적 ≥48, landT 30, chain_land/2, shake 10/20/30, 파티클, '💥 착지!', land_fire(.35, 2, 발밑) | `_land_chain` |
| G32508–32530 | 착지 후 KH Shift 유지 → 3단 재발사(게이지 잔량 비례 거리) | `_fire_chain("refire")` |
| G32582 | `_dashIframe>0` → 무적 ≥1, 1 감소 | `advance_pre` 끝 |
| G32775 | iframes 자연 감소 | player 기존 줄(이동 훅은 그 앞/뒤) |
| G32779–32786 | 게이지 칸 수(합체 없으면 5)·`+~~extraST` 최대치, 현재값 클램프 | `advance_post_iframes` |
| G32985 | bladeDash 상태가 아니어도 `_bdMoveT>0`이면 틱(사망·기절 시 폐기) | `advance_state` |
| G33032–33039 / G33747–33754 | idle(보행 뒤)·sBlock 트리거 소비: 가능하면 발동, 아니면 '충전 중...'/'MP 부족!' | `advance_state_after_move` |
| G33943 | `case 'bladeDash'` 틱 | `advance_state` |
| G34331–34345 | stagger/pStun: Shift(isJust 또는 홀드·비행·끌림) 탈출, 전격이동 탈출(pStun은 poise 4) | `advance_state` + `player.apply_native_move_skill_escape` |
| G45343 | `_canBladeDash`: Lv≥1, 게이지 ≥31.5, MP ≥(10+(Lv−1)×5)×0.7 | `_can_blade_dash` |
| G45344–45416 | `_tickBladeDash`: 무적 ≥3, 250/6×step, x→y 축 분리 `canMvBlink`/`canMv`, 전기 잔상 파티클, 착지(chain_land .7, 파티클, 전류장판, 상태 복귀 idle/sBlock, 무적 ≥15) | `_tick_blade_dash` |
| G45418–45463 | `activateBladeDash`: 방향+대각(다른 방향키 isAct), MP·게이지 차감, '⚡ n/m', `_bdMoveT=6`, sDraw/kiGather/기검참 차징 제외 상태 bladeDash, facing, 무적 ≥15, chain_dash, 파티클 8, shake 4 | `activate_blade_dash` |

## 3. 수치 (1-1 데모 신규 런: Lv1, bladeDash 1, chargeBoost 0, PASSIVES.pCharge 0, 천 갑옷 charge 7·el 0)

| 항목 | 값 |
|---|---|
| 게이지 최대·회복 | 225(5칸×45), 0.09375/틱(2.5%/초) |
| 사슬 단계·홀드 | 1단 탭(<6f), 2단 6f~, 3단 12f 자동 발사 |
| 사슬 비용 | 게이지 min(잔량, 45/98/150), ST mst×1%×단계 |
| 사슬 거리 | 300/500/700 × min(1, 쓴 게이지/단계 비용) |
| 사슬 비행·끌림 | 63px/틱, 끌림 7/11/16틱, 꽂힌 틱에 첫 끌림 |
| 사슬 무적 | 끌림 중 ≥2 + `_dashIframe` 8/14/24틱 ≥1, 착지 ≥48 |
| 사슬 타격 | `~~((ar().charge‖10)+baseAtk)×1×1×(1+dashBoost))` = (7+15)=22, hurtE opts `{kbMult:2,poiseHit:true,poiseMult:2.0}`, el=armor.el, kb+25 |
| 전격이동 비용 | MP 7(=(10+0)×0.7), 게이지 31.5 |
| 전격이동 이동 | 6틱 × 41.667px = 250px, 실제 벽에서 정지 |
| 전격이동 무적 | 발동 ≥15 → 감소 후 14, 틱 ≥3, 착지 ≥15 |
| 전류장판 | r=min(200,120+(Lv−1)×5)=120, maxT 600, defRed 10%, dmg=~~(magicRef×pMagicMul×_skMul(bladeDash: b3.5/g2.1)) |

## 4. 프레임 순서 (Godot `player._physics_process`)

1. `advance_pre(ticks)` = G32155–32582 전부(프레임 앞 전격 탈출 → 게이지 회복 → 홀드/자동 발사 → 비행 → 끌림·타격·착지·재발사 → `_dashIframe`)
2. 기존 `iframes -= ticks` (G32775)
3. `advance_post_iframes()` (G32779–32786)
4. 기존 Q/E/자원/조준 처리
5. `advance_state(ticks)` → switch 시점 상태 반환(G32985 틱, bladeDash/stagger/pStun case)
6. 보행 속도·idle 체크포인트는 **switch 시점 상태**로 판정(착지·탈출로 같은 틱에 idle이 돼도 그 틱엔 보행 없음, G32987)
7. `move_and_slide` (끌림·전격 중에는 일반 적 layer 4 제외 — 원본은 벽만 검사, 플레이어 밀어내기는 보스만 G34349)
8. `advance_state_after_move()` (idle G33032·sBlock G33747 트리거 소비)

## 5. 입력 우선순위 (Space)

원본 keydown 순서: 레슨 allowKey → K/KH → Shift → 전격이동(방향+Space이면 `return`) → … → Space 슬롯(SKILL_SLOTS[4], 사슬기동 중 차단). Godot은 트리 역순으로 Player의 `_unhandled_input`이 먼저 받으므로 Player funnel 맨 앞에서 이동 owner가 처리하고:

- 방향+Space 트리거 → 소비(handled) — Space 슬롯 디스패치 없음
- 사슬기동 중 Space → `space_slot_blocked_during_chain_movement`(소비)
- 그 외 Space → **소비하지 않고** 실제 슬롯 owner(`NativeSkillSlots._unhandled_input`)로 넘김 (`space_slot_deferred_to_skill_slot_owner`). 분노 슬롯 자체(rage)는 여전히 미이식 → `read_native_input_bindings.unsupported`의 `space_rage_slot` 유지.

## 6. 렌더 (웹 1x 나란히 캡처로 맞춘 규칙)

| 요소 | 원본 | 포트 |
|---|---|---|
| 홀드 링·예측선·단계 | G59765–59787: 링 r22(단계색 #88ccff/#44ffaa/#ff8833 α.8), 꽉 차면 r28 맥동, 점선 1px α.25 → 끝 원 r6, 'N단' bold 36px | over 층. 단계 문자는 textBaseline 미지정(실측 'middle') → em 중앙 P.y−44 |
| 머리 위 게이지 | G54817–54828: 'cur/225' bold 22px(≥100% #44ffaa, >50% #88ccff, >20% #ffaa44, 그 외 #ff4444), 그림자 +1, 미니바 32×3 | over 층 맨 위(웹 실측: 단계 문자 위). **웹 GPU 프록시 fillText(G6104–6111)** 규칙: 아틀라스 셀 h=ceil(px×1.6)+8, 'bottom'은 셀 상단 y−h → em 중앙 y−h/2 |
| 글꼴 | 'bold Npx sans-serif' | SystemFont Arial/Malgun Gothic weight 700(Windows Chrome 실제 렌더) |
| 사슬 비행 | G59789–59863 chain_shuriken_2(높이 28, 끝 35% 수리검 회전), 꽂힘 불꽃 3 | over 층 |
| 플레이어 포즈 | dash_start(0–1)/dash_fly(2–3)/dash_land(4–5) spd 4, fly만 loop, lift −12·sin, 방향 WarriorDashFlight.direction | player `_native_dash_pose`/`_apply_native_dash_pose` |
| 전격 포즈 | `_P_ANIM_MAP.bladeDash='dodge'`=idle 프레임, MOTION.squash((12−st2)/12,.22) 발밑 고정 | 같은 함수, ez(4) 257-LUT |
| 전기 구체 | G58552–58569 | under 층(본체 아래) |
| 잔상 | G58654/58713: 8개, (0.05+0.15×i/N)×.85 | under 층 (원본 bladeDash 밝은 아틀라스 `_atlasP_bright`는 미보유 → 같은 프레임) |
| land_fire | 200²×4(2열), frameTime 2, scale .35, lighter, 발밑(P.y+r) | under_add 층 = **본체 위** 가산(웹 GL 인스턴싱 실측) |
| 번개 기둥 | G55978–55998: 화면 상단(G.cam.y−VH/2−50)→착지점, 2층(#6677ee ×1.3 α.7 / #eeeeff ×.5 α.9)×ta×flash×fade(.24), 분기 코어층 | under 층. VH는 카메라 zoom 반영(월드 단위). lineCap round는 미구현(경미) |
| 악의폭풍 | G55931–55962: Lightning 3시트 `_tintImg`(#6644ff/#7733ff/#5566ff) lighter, sc=r/60, 30틱마다 회전·뒤집기 | storm 층 셰이더(source-atop 틴트 + W3C luminosity + 가산) |
| 렌더 시계 | landT·VFX·번개 life는 draw마다 −1 | world 원본 시계 증가분(같은 틱 중복 감소 없음, 60Hz에서 원본과 같음) |

## 7. 미이식 (NOT_READY — 분기 활성 시 첫 쓰기 전 거절·기록)

- 전류장판 **피해 틱·_shockDR 방어감소**(G37413·37460–37465): 기존 hurtE 실행자가 `_shockDR` 분기(G42290)를 정지시키므로 디버프를 쓰면 이후 모든 타격이 막힌다 → 장판은 G._fireZones에 들어가 수명·렌더만, 피해 0.
- 합체·파생: chainSlash·magicBlink/dimBreach·dimBlast·기동파괴/기동불꽃/기동전폭(G32250·32276–32350·32382–32506·32549–32575), thunderGhost(G45395–45407), kiGather 사슬 변형(G33688–33699) — 1-1 신규 런 미보유.
- 유니크/전설: u_d06 `_uqMoveRefund`(warpT 0 고정), u_d07·u_n02·u_d09, `_lBootsEvade`/`_lSpearStack` — 값>0이면 거절.
- showPH 토스트: PARITY-HUD-02에서 UI 전용 native_show_ph 신호와 공용 HUD 소비자를 연결했다. 이동 판정·비용 수식은 그대로다. PARITY-HUD-02b에서 PC oracle용 `toast_unported` 원문 로그 3줄을 각 emit 바로 앞에 복구했다(충전 중... 2곳, MP 부족! 1곳). 로그 키는 유지하며 UNPORTED_BRANCHES의 showPH 제외도 유지한다.
- SFX.slash/charge/magic 합성음(WebAudio): 샘플 아님. 샘플 14개는 재생.
- 레슨 step 4/5 연습(parry-lesson.js 326–383 tickChainPractice/tickDashPractice, 게이지·MP 리필·카운트): 레슨이 step 0~3(패링 투사체 미이식)에서 정지라 도달 불가 → 기존 STEP_HALTS 유지. 행동 자체(allows 'charge'/'bow')는 레슨 잠금과 맞물려 동작.
- 패링 성공 게이지 충전(G38491 `_harpAdd`): Q 패링 owner 쪽 잔여(`harp_rage_mats_rewards`).
- 게임패드 조준·주입, `_gpVibrate`, `G._pStats._dC`, `_addSkProf`.
- 플레이어 외곽선·밝은 아틀라스(OPT.outline G58719): 기존 플레이어 렌더 범위 밖(이동 스킬 전용 아님).

## 8. Mac 요청 (HUD·표시 소유)

| ID | 요청 | 원본 | 포트 API |
|---|---|---|---|
| PMS-M1 | MP 구슬 **기동 게이지 링**(conic #ffcc33 α.95, 45칸 눈금 `--shift-cell-deg`) | G2633–2635, G60295–60299 (차이 목록 H-02) | `main.native_move_skills.read_native_move_gauge()` → {gauge, max, pct, cell_deg} |
| PMS-M2 | 스킬바 skSlot0 하단 게이지 바(≥100% #44ffaa, ≥50% #88ccff, 그 외 #ff8844) | G60314 | 같은 API |
| PMS-M3 | showPH 토스트('충전 중...' #ff8844, 'MP 부족!' #4444ff, '⚡ n/m' #44ddff) | G13229·G33036·G45449 | `native_show_ph(text,color,duration_ms)` 표시 신호 → `parity_hud_mobility.gd`; 판정/비용 로직 변경0 (PARITY-HUD-02) |
| PMS-M4 | 카메라 zoom 0.7·offset(0,−180)(M-03)과 맵 조명(M-01/M-05) — 이동 스킬 화면 크기·명암 차이의 공통 원인 | — | — |

## 9. 검증

- `test_pc_move_skills` 256/0, ERROR 0: 실제 Main + 원본 VM oracle 16 시나리오 259프레임·벽 질의 798건 좌표·종류·순서, hurtE 인자·순서, 텍스트·고정 사운드 키 순서 일치. 원본 Math.random 호출 행(12463, 13361, 32193, 32225, 32295, 32546, 45354–45356, 45371–45377, 45459)은 모두 표현 전용.
- 나란히 캡처(웹 수동 rAF 1틱 스텝 = Godot SceneTree 1틱 스텝): 사슬 1·2단과 전격이동 프레임별 위치·무적·게이지가 웹과 소수 둘째 자리까지 같다(보고서 표).


2026-10-22 PARITY-INTRO-01b: 이전 Mac PC 이동 회귀 실패는 저장 namespace와 실행 인자의 불일치였다. 인트로 분기 변경은 확인되지 않았다. Mac 공통 하니스는 PC fixture에 storage 인자가 없을 때 `--demo11-storage=off`를 명시하며 제품/E2E `on` 경로는 유지한다. [원인·계약·검증](PARITY_INTRO_01b_20261022.md).
