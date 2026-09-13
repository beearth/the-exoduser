# 사슬탈출 실행 후 미완료 수정

| 항목 | 확인/수정 계약 |
|---|---|
| 재현 | `BINDS.charge='mouse0'`인 저장 상태에서 자원 실습 `step3/escapeIndex1`의 물리 Shift 입력. 실제 사슬 발사/이동·poise4 회복 후에도 `P.s='pStun'`이 남아 Shift 탈출 체크 미완료 |
| 원인 | 사슬 발사기는 물리 `ShiftLeft`를 받지만 `stagger/pStun` 상태 해제는 `isJust('charge')`만 검사. 저장된 바인딩이 다르면 사슬 실행과 기절 해제 입력이 불일치 |
| 수정 | 일반/쉬운 게임의 두 상태에서 기존 `isJust('charge')` 또는 `K.ShiftLeft && (_dashHold || _harpActive || _dashActive)`를 인정. 실제 사슬이 준비/진행 중일 때만 물리 Shift로 해제 |
| 경직 | `stagger→idle`, `st2=0`. 기존 경직 해제 동작 유지 |
| 기절 | `pStun→idle`, `iframes=30`, `poise=4`, `poiseR=0`. 기존 기절 탈출 수치 유지 |
| 자원 부족 | 사슬 홀드/발사/이동이 모두 없는 물리 Shift만으로 추가 무료 탈출하지 않음. 사슬 기동력/ST 비용·사거리·티어 변경 없음 |
| 실습 완료 | 기존 `escapePressed && P.s!=='pStun' && P.poise===4` 충족. Shift 성공 체크 후90틱 뒤 전격이동 과제로 진행 |
| 자동 검증 | `tools/test-chain-escape.cjs`가 양쪽 HTML의 실제 상태 처리 코드를 추출·실행. 기본/마우스 재지정 바인딩의 경직·기절 해제 및 사슬 미준비 차단 PASS |
| 브라우저 | 실제 KeyboardEvent Shift→update→keyup→update에서 `s='idle',poise=4,escapeChecks[1]=true`, `Shift · 사슬 탈출 성공!` 확인 |

확정된 `2_3 돌진+패링+방패시스템` 문서는 수정하지 않는다. 입력 경로의 구현 불일치 수정이며 확정 설계/수치를 변경하지 않는다.
