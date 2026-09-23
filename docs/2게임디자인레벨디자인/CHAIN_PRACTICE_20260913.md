# 사슬이동 1·2·3단 순차 연습

| 항목 | 구현 계약 |
|---|---|
| 적용 위치 | `parry-lesson.js`: 1장 기초 연습 `step===4`(전체 8번째), `resource-practice.js`: 2장 `step===4`는 잠정 제외(비활성 구현 보관) |
| 입력 차단 수정 | 저장된 `BINDS.charge`가 `mouse0`인 상태에서 연습 `allowKey`가 실제 사슬 핸들러의 `ShiftLeft`를 차단하는 문제 확인. `actions()`가 `charge`를 허용할 때 물리 `ShiftLeft`도 허용. 도입·성공 대기·다른 과제에서는 기존 제한 유지. 2장 그로기 탈출 `step===3`은 네 방법을 자유 순서로 실습하며 내부 재준비 대기를 제외하고 charge를 허용. `escapeAttempt=1`, `escapePressed=true`도 기록 |
| 1단 | 왼쪽 Shift 탭, 6틱 미만 해제. 기본 최대 거리 300px, 기동력 45, ST 최대치 1% |
| 2단 | 6틱 이상 12틱 미만 해제. 60틱 기준 0.1초 이상 0.2초 미만. 기본 최대 거리 500px, 기동력 98, ST 최대치 2% |
| 3단 | 12틱 완충 자동 발사. 60틱 기준 0.2초. 기본 최대 거리 700px, 기동력 150, ST 최대치 3% |
| 수치 조회 | 시간 `_HARP_TIER_F[t]/60`, 기동력 `_HARP_GAUGE_COST[t]`, 거리 `_harpDistTier(t)`. 실전 충전 속도·거리·비용 함수 변경 없음 |
| 공통 진행 상태 | `_parryLesson.chainPractice={target,completed,gauge,flight,feedback}`. `target`은 1부터 시작, `completed`는 순서대로 완료한 단계 배열, `gauge`는 시도 시작 기동력. `flight={tier,spent,x,y,pulled,moved}`는 발사 단계·기동력 소모·발사 직후 좌표·끌려가기 여부·이동 여부 |
| 공통 함수 | `tickChainPractice()`가 실제 발사·소모·이동·종료를 확인. `updateChainPractice()`가 단계 □/✓, 목표와 시간 안내, 피드백, 기존 홀딩 게이지를 갱신 |
| 발사 판정 | `_harpActive||_dashActive`이면서 `_harpGauge<gauge`일 때 현재 `_harpTier`를 1회 기록. 키 입력·활성 플래그만으로 통과하지 않음 |
| 이동 판정 | `_dashActive` 관측 후 발사 직후 좌표 대비 거리 1px 이상이면 `moved=true`. 비행·끌려가기 모두 종료하고 `_dashHold`와 `KH.ShiftLeft`도 해제된 뒤 현재 목표와 발사 단계가 같아야 완료 |
| 진행 | 1→2→3단을 모두 수행. 비행 중 90틱 이상 지나도 과제를 넘기거나 `resetPose()`로 이동을 자르지 않음. 3단 이동 종료 후에만 기존 `completeStep()` 실행, 이후 90틱 성공 표시와 다음 과제 진행 |
| 재시도 | 잘못된 단계 발사, 취소, 벽에 막혀 1px도 이동하지 못한 경우 완료 수 유지. 목표 단계 재안내와 열린 바닥 조준 안내. 시도 종료·Shift 해제 후 다음 시도 준비 |
| 자원 | 사슬 실습 시작과 다음 시도 준비에서만 `_harpGauge=_HARP_GAUGE_MAX`, `P.st=P.mst`. 진행 중 강제 보충하지 않음. 1장 기본 자연 회복은 유지, 2장 기존 자연 회복 중단은 유지. 실제 소모량은 `flight.spent` 및 피드백으로 보존 |
| 화면 | 기존 `hint` 리프 노드에 3단 체크·현재 목표·피드백 표시, `.lesson-hint`는 `white-space:pre-line`. 기존 `holdBox/holdLabel/holdMeter` 재사용, 게이지는 `min(100,_dashHoldF/_HARP_TIER_F[3]*100)` |
| 수명 | 연습 시작, 2장 각 과제 진입, 종료/건너뛰기에서 `chainPractice=null`. 저장 객체에 포함하지 않으며 기존 HP/ST/기동력/위치 복원 유지 |
| 캐시 | 사슬 변경 당시 버전 `20260913-chain-tiers1`. 현재 일반·쉬운 게임 HTML의 `resource-practice.js`는 전격이동 5회 실습 버전 `20260913-resource-cost50` |
| 자동 검증 | `tools/test-parry-lesson.cjs`의 `exerciseChainTiers()`를 기초 연습에 적용(2단 사슬 단독 과제는 잠정 제외). 잘못된 단계·무소모·취소 제외, 비행 중 전환/보충 금지, Shift 해제 대기, 1/2/3 모두 완료, 커스텀 바인드에서 왼쪽 Shift 허용을 검사 |
| 브라우저 검증 | 로컬 Chrome의 별도 테스트 탭에서 저장된 `BINDS.charge=mouse0` 상태로 실제 `keydown`/`keyup` 핸들러와 `update()` 실행. 1/8/12틱 홀딩 시 1/2/3단 순차 이동 및 실제 기동력 45/98/150 소모, 완료 배열 `[1]`→`[1,2]`→`[1,2,3]`, 후속 E 과제 전환 확인. 콘솔 오류 없음. 테스트 탭 종료로 임시 런타임 조정 폐기 |
| 회귀 검증 | `test-resource-practice.cjs`(기초 연습 테스트 포함), `test-onboarding-settings.cjs`, `test-tutorial-mouse.cjs` 통과. 일반/쉬운 HTML 문법 및 관련 입력·저장 상태 복원 검사 포함 |

자원 실습의 최신 Q/E/Shift 묶음 안내와 관련 캐시는 [RESOURCE_SKILL_SETS_20260913.md](RESOURCE_SKILL_SETS_20260913.md)를 따른다.


## 2026-09-17 Shift 잔량 이동 현행 계약

| 항목 | 현재 동작 |
|---|---|
| 입력·소비 | 게이지>0이면 Shift 준비 가능. 실제 소비=min(잔량,1/2/3단 정규 비용45/98/150). 0이면 미발사 |
| 거리·홀드 | 단계 거리×실제 소비/정규 비용. 릴리즈·홀드 자동 발사·벽 감지·착지 재발사 공통. ST는 최대 ST×단계×1% 조건 유지 |
| 표시 | 조준선도 잔량 비례 거리. 노란 링 한 칸45는 정규1단 탭 기준이며, 한 칸 미만도 짧게 이동 가능 |
| 실습 | 완충하는 사슬 실습의 정규 비용·거리는 유지. 실전 잔량 처리에는 새 비례 이동 적용 |
| 상세·검증 | [공용 기동게이지](../2_1%20스킬관리+합체시스템+자원/전격이동_사슬기동_공용기동게이지_개편.md)의 2026-09-17 절. 이전 문서의 최소 거리/정규 비용 표기는 게이지가 충분할 때의 기준 |
