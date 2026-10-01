읽기 전용 검토를 완료했습니다. 최종 보고드립니다.

---

## UIUX / UI03 — 밀집 전투 HUD 대비·가림 검토 보고 (읽기 전용)

### 1. 실제 Read한 증거와 정지/밀집 구분
- **밀집 전투 증거 (유효 1장)**: `mac-performance-20261001/dense-combat.png` — `측정결과.md` 기준 "밀집 기본" 조건(부활 후 seed20261001, 적 82 추가→시작 120, etype0, 반경 140~420, HP 250ms마다 100000 리필, 20초 공격, 적 수 96~133), 1280×800·DPR1·높음·WebGPU. **이것이 UI03 판정의 유일한 밀집 전투 정지프레임.**
- **밀집 전투 아님 (판정 근거 제외)**: `first-kill.png` = 사망/부활 오버레이(“빛이 꺼졌다”). `측정결과.md`가 "종료 시점 사진은 전투 성능 판정 근거로 쓰지 않는다"고 명시 → HUD 대비 판정에서 제외.
- **정지/희소 맵 샷 (map020)**: `m5-enemies.png` 등은 원거리 적 1덩어리·플레이어 단독의 카메라/줌/충돌 검수용(지역 처치 0/32). 밀집 전투 HUD 증거 아님 → 제외.

### 2. UI03 계약 (SSOT)
`UI_UX_IMPROVEMENT_PROJECT_20260930.md` UI-03(P1·전투 HUD·상태 대기): "밝고 밀집한 VFX 중 **레벨·목표·자원·상태 글자가 계속 읽히는지**… 실제 대비와 가림 측정 필요."

### 3. 재현 가능한 결함 후보 (1건) — 상단 중앙 전투 상태 스트립 저대비
**현상**: 밀집 전투 시 상단 중앙 `.hud-top`(COMBO/MAX COMBO/TIMER/DPS/MAX HIT)이 **배경판 없이 전체 opacity .58, 얇은 .72rem** 텍스트로 맵 위에 떠 있어, 밝은 VFX가 뒤를 지나면 대비가 무너진다. 특히 `#comboTimerHud`는 형제 요소와 달리 **text-shadow가 없고** 런타임에서 색을 **원색 `#ff4444/#ff8844/#ffcc44`로 덮어써** Hell Gothic 토큰(뼈색·금빛) 위반 + 대비가 가장 먼저 깨진다. (dense-combat.png 상단 중앙의 "COMBO 60 / TIMER 18.3s / MAX HIT 1.1K" 스트립)
- *부수 관찰(별건)*: 화면 중앙 플로팅 피해숫자·"LV.4"·"LEVEL UP!"·적 네임플레이트("레어…(e0) 11/3726")의 상호 가림 — 단, 이는 캔버스 전투 렌더 영역으로 총괄/VFX/ENEMY 소유와 겹쳐 UIUX 단독 소유 아님 → 이번 후보에서 분리.

### 4. 정확한 UI 소유 구역 (총괄 맵 작업과 독립 — 순수 DOM/CSS)
- `game.html:318` `.hud-top` 레이아웃(top-center, z-index:20, .72rem)
- `game.html:319` `.hud-top.on{opacity:.58}` ← 대비 핵심
- `game.html:934–940` `.hud-top{ background:none; border:none; box-shadow:none }` ← 배경판 부재 확정
- `game.html:2661–2665` `#comboHud/#comboRecord/#comboTimerHud/#dpsHud/#dmgPeakHud` 인라인 스타일(2663 `#comboTimerHud`만 text-shadow 누락)
- `game.html:58166–58174` 런타임 텍스트·색 갱신(58174 `#comboTimerHud` 원색 대입)
- 맵 캔버스/충돌 코드(총괄 소유)와 **비중첩** 확인.

### 5. 재현 조건 / 검수 기준
- **재현**: dense-baseline 조건(위 §1)으로 적 96~133·VFX 밀집 상태 유지, 상단 중앙 스트립이 밝은 적/붉은 VFX 위를 지날 때 1280×800·DPR1·1x 실크기로 관찰.
- **검수 기준**: (a) 밝은 VFX 배경에서도 COMBO/TIMER/MAX HIT/DPS 전 글자 판독 가능, (b) `#comboTimerHud` 색이 토큰 팔레트(뼈색/금빛/지옥불 포인트) 준수·형제와 동일 외곽선 처리, (c) 전 요소 동일 대비 규칙(배경 스크림 또는 text-shadow), (d) `node --check`·설정 회귀 무영향, 콘솔 오류 0, (e) 1x 스크린샷으로 기존 HUD와 동일 게임처럼 보이는지 눈 검수.

### 6. 준수 사항
파일/Git/CSS/HTML 미수정, 게임 미실행, 새 팀/에이전트 미생성, PC 미접근. Mac 경로 읽기 전용 Read/Glob/Grep만 사용. **총괄의 맵 수정과 독립**. 이 후보는 **대기(후보 식별)** 상태이며, 수정은 총괄의 순차 실행 배정 후 착수합니다.
