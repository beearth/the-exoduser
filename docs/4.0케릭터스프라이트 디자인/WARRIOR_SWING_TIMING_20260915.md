# 전사 스윙 프레임·판정 동기화 — 2026-09-15

## 원인과 적용 범위

전사 기존 48px 공격 시트는 0~1번이 준비, 2~5번이 들어올림, 6~7번이 베기다(0 기준). 기존 일반 공격은 판정 시점에 3번을 표시하고 6~7번을 회수 구간까지 미뤘다. E는 8틱마다 한 프레임씩 재생하여 타격 시점에 1번, 종료까지 5번만 표시했다. 게임 실제 `update()`→`draw()`로 재현했다.

`game.html`, `game-easy-test.html`의 전사(`_charIdx===0`) 렌더에 `_warriorAttackFrame`을 적용한다. 원본 PNG, 전투 상태 시간, 피해·반사·패링·입력은 변경하지 않는다. 실버테일은 기존 전용 재생을 유지한다.

## 현행 계약

| 항목 | 값·공식 | 적용 위치 |
|---|---|---|
| 준비 | `min(1,floor(clamp(1-left/max(1,windupTicks))×2))` | `wWindup` |
| 준비 시간 입력 | `floor(10/(wp().spd||1))||1` | 렌더 전용 계산 |
| 공격 진행률 t | `clamp(1-left/5)` / `clamp(1-left/20)` | `wSwing` / `sBash` |
| 시작 프레임 first | 2 / 0 | `wSwing` / `sBash` |
| 타격 전 t<0.4 | `min(5,first+floor(t/0.4×(6-first)))` | 들어올림 |
| 타격 이후 | `min(7,6+floor((t-0.4)/0.6×2))` | 베기 |
| 실제 타격 시점 | 일반 공격 `left=3`, E `left=12`에 6번 표시 | 기존 판정 시간과 일치 |
| 일반 회수 시간 | `floor(16/((wp().spd||0.3)×statDex()×(1+_eqAffix('meleeAtkSpd')+_eqAffix('glovesAtkSpd'))))||1` | `wRecover` 렌더 |
| E 회수 시간 | `floor(28/pParryRmbSpd())||1` | `sRecover` 렌더 |
| 회수 진행률 r | `clamp(1-left/max(1,recoveryTicks))` | 공통 |
| 회수 프레임 | `r<0.2:7`, `r<0.55:1`, 나머지 0 | 베기 끝→검 내린 준비→대기 직전 |
| 일반 공격 방향 | 유효한 `P.atkArc`를 `_facingDir8`에 전달 | 전사 `wWindup/wSwing/wRecover` |
| E 방향 | `P.facing` 유지 | 실제 판정도 실시간 조준 방향 사용 |
| 우선순위 | 사슬 공격·사슬기동 전용 재생 다음, 공용 근접 재생 앞 | 살아 있는 전사에만 적용 |
| clamp | 0 이상 1 이하 제한 | 모든 진행률 |

## 검증·한계

| 검증 | 결과 |
|---|---|
| 회귀 재현 | 신규 테스트 6개가 수정 전 실패, 수정 후 통과 |
| 관련 자동 검사 | 스윙·이동 연속성·실버테일 공격·명암 검사 29개 통과 |
| 실제 일반 공격 업데이트 | 타격 `left=3`: 3번→6번. 회수 종료 전 0번 복귀 |
| 실제 E 업데이트 | 타격 `left=12`: 1번→6번. 공격 중 0~7번 모두 표시, 회수 종료 전 0번 복귀 |
| 인게임 시각 | 남동쪽 타격 프레임 6번의 본체·검 렌더 확인 |
| 8방향 렌더 | e/se/s/sw/w/nw/n/ne에서 E 타격 프레임 6번 확인 |
| 검수 방법 | 별도 테스트 슬롯에서 저장 차단 후 게임 업데이트·렌더를 틱 단위 진행. 연속 실시간 자연스러움의 최종 승인은 아님 |
| 남은 아트 제약 | 방향별 원본 베기 궤적·실루엣 차이, 회수 전용 그림 부재. 기존 준비 포즈 재사용으로 회수하며 완전한 관절 연결은 보장하지 않음 |

원본 프레임 접촉표: `output/warrior_swing_20260915/attack-contact.png`. 수정 전 코드 백업: 같은 폴더 `originals/`. 재생 로직 검사: `test/warriorSwingTiming.test.js`.

## 함께 확정한 공용 모션 연결

기존 작업 트리에 있던 보행·공격 연결 수정도 이번 커밋의 의존 코드로 포함한다.

| 항목 | 현행 계약 |
|---|---|
| 실제 보행 판별 | 업데이트마다 `P._walkMoving=false`, idle 이동 충돌 처리 후 실제 이동 거리 `_wdd>0`이면 true, `_walkFacing=atan2(실제 dy,실제 dx)` |
| 방향 선택 | 전사 일반 공격은 위 atkArc 규칙 우선. idle 보행은 `_walkFacing`, whirlwind는 `wwAng||0`, 나머지는 `facing` |
| 보행 렌더 | `P.s==='idle'&&P._walkMoving===true`일 때 run. 기존 256px/주기 유지 |
| 공용 공격 폴백 | `_playerMeleeProgress`: 준비 `0.2×clamp(1-left/max(1,windupTicks))`, 스윙 `0.2+0.55×clamp(1-left/5)`, 회수 `0.75+0.25×clamp(1-left/max(1,recoveryTicks))`; `min(N-1,floor(progress×N))` |
| 전용 재생 우선 | 전사는 `_warriorAttackFrame`, 실버테일 9프레임은 `SilvertailAttackRemaster.progress`가 최종 적용 |
| 실버테일 공격 중단 | HP≤0 또는 wSwing/wRecover/sBash/sRecover 이외 상태면 `_silvertailAttackPose`는 null. 시작 시각이 없고 재생 중도 아니면 null |
| 실버테일 본체 덮어쓰기 | `_silvertailAttackPose`의 본체 프레임 선택은 sBash/sRecover만 적용, LMB 전용 시간 계산 보존 |
| 통짜 본체 회전 제거 | wWindup/wSwing/wRecover/whirlwind는 원본 포즈와 방향 시트로 표현. 기존 본체 -12°→+20° 회전과 whirlwind 화면 평면 회전을 제거 |
| 검증 | `test/playerMotionContinuity.test.js` 양쪽 진입점 8개 포함, 위 29개 통과 집계에 포함 |
