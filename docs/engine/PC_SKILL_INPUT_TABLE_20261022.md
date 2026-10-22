# 데모 기본 스킬 실입력 발동표 (웹 ↔ Godot) 2026-10-22

- 조건: 새 캐릭터 1-1 시작 필드, 레슨 스킵 뒤, 적 근처. 각 입력 뒤 1.4초(Ctrl 2.6초, Shift·RMB 홀드 2초) 관찰.
- 웹: Playwright 헤드리스 실키 입력(`_out/pc-input-parity/tools/web_skills.cjs`). 고정 더미 적 +160px.
- Godot: 자기 worktree 창에 OS 키·마우스 메시지(SendNotifyMessage) 실입력(`input_probe.gd --phase=skills`). 가장 가까운 자연 적 −160px.
- 원시 로그: `_out/pc-input-parity/sweep/web_skills/web_skills_log.txt`, `_out/pc-input-parity/logs/skills4.log`
- 표의 "Godot"은 수정 반영 뒤(bdc8ba4a1 + 거인강타 상태 커밋) 값이다.

| 입력 | 웹 기본 스킬 | 웹 결과 | Godot 결과(수정 전) | Godot 결과(수정 후) | 판정 |
|---|---|---|---|---|---|
| RMB 탭 | 악의구 fireball | magicCast→magicRecover, MP −9.53 | **무발동**(시전 거절 `actual_fireball_delivery_not_ready`) | magicCast→magicRecover, MP −9.53, 투사체·폭발 | 고침(P0) |
| RMB 0.9초 홀드 | 악의구 연사 | MP −29.42(3발) | 무발동 | MP −29.42(3발) | 고침 |
| LMB 탭 | 기검참 kiSlash | wSwing→wRecover, ST −9.6 | windup→swing→recover, ST −9.6~−11.1 | 같음 | 같음(상태 이름만 다름, 내부) |
| 1 | 가시덫 spikeTrap | 쿨 600 시작, 악의 −5 | 쿨 600, 악의 −5 | 같음 | 같음 |
| 2·3·4 | 빈 슬롯 | 무발동 | 무발동(`unassigned_or_unlearned`) | 같음 | 같음 |
| F | 회복의 영역 holyDome | 쿨 1800, 영역 회복 | 1회차 순회 측정에서 무발동 1회, 이후 3회 연속 발동(쿨 1800) | 발동 | 같음(1회 무발동은 재현 안 됨, 이 PC 불안정 기록) |
| Z | 빈 궁극 슬롯 | 무발동 | 무발동 | 같음 | 같음 |
| E | 칼등처내기 | sDraw→sBash→sRecover, ST 0 | 같음(1회 ST −6.2 관측, 재측정 0) | 같음 | 같음 |
| Q | 패링 | sBlock, MP 0 | sBlock(1회 MP −12: 앞 시험의 악의구 잔여 발사가 섞인 값) | sBlock, MP 0 | 같음 |
| Ctrl | 얼음보주 iceOrb | iceOrb, MP −17.17, 쿨 1124~1130 | 1회 무발동, 이후 발동 | iceOrb, MP −17.59, 쿨 1132 | 같음 |
| Space | 거인강타 giantSlam | **gSlamWindup→gSlam1→gSlamRecover**, ST −32~−37, 악의 −10, 쿨 1800 | 피해·비용·쿨은 같으나 상태 3단계 없음(즉시 idle) | gSlamWindup→gSlam1→gSlamRecover→idle | 고침(P1) |
| A+Space | 칼날이동 bladeDash | bladeDash, 278~281px | bladeDash, 290~299px | 같음 | 같음(거리 ±7%: 위치·벽 차이) |
| Shift 0.6초 | 사슬 이동 | 700px | 462~570px | 570px | **다름**(아래) |

## 거인강타 상태 수정 (PC)
- 원본 46460 `P.s='gSlamWindup';P.st2=10` → case(33949~33960) `st2` 소진마다 Windup→gSlam1(10)→gSlamRecover(12)→idle, 보행 `(P.speed+bt().spd)×sp×.35`.
- `player.gd`: `enter_native_giant_slam_state()`, `_advance_native_giant_slam_state(ticks)`, 이 상태의 보행 배율 0.35.
- `native_skill_slots.gd cast_giant_slam`: 비용 확정·쿨 설정 직후 상태 진입(피해는 원본처럼 즉시).
- 원본 activateIceOrb(46756)는 P.s를 보지 않으므로, 거인강타 상태 중 Ctrl은 얼음보주로 덮어쓴다(`cast_ice_orb`, `set_native_ice_orb_state`). 다른 상태의 기존 idle 제한은 그대로 둔다.
- 그림: 원본은 이 상태에서 `gSlam1` 애니(−18 들림)를 쓴다. Godot 플레이어 그림은 이 상태를 기본 자세로 보여 준다 → **Mac 표시 요청**.

## 남은 차이
- Shift 사슬 거리: 웹 700px, Godot 570px(같은 0.6초 홀드, 게이지 웹 205 / Godot 200, 둘 다 3단 비용 150 이상). 시험 배치가 달라(웹 더미 +160px, Godot 자연 적·벽) 충돌 정지 여부가 섞였다. 같은 빈 지형에서 재측정 필요 → 전수 목록 P1.
- Shift 뗌은 Godot이 raw input으로만 받아 메시지 주입이 안 된다. 뗌만 `Input.parse_input_event`로 넣었다.
