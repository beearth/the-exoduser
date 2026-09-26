# 기검참 3타 홀드 충전 — 2026-09-27

좌클릭 기검참 콤보의 3타 입력을 계속 누르면 준비 자세로 기를 모은다. 버튼을 놓을 때 3타 검기와 근접 스윙이 한 번 나간다. 1·2타는 기존처럼 즉시 발사한다. 일반 게임과 쉬운 테스트 화면에 같은 입력·피해·VFX를 적용한다.

| 항목 | 코드·수치 | 적용 위치 |
|---|---|---|
| 입력 | `P.activeLMBSk==='kiSlash'`, `_cresStep===2`, `_cresComboT>0`에서 좌클릭 3타 입력 시 `wWindup`; `isHeld('weapon')`인 동안 대기, 해제 시 `wSwing`·발사 | `game.html`, `game-easy-test.html`의 idle 및 bowRecover 취소 경로 |
| 충전 시간 | `_kiChargeT += sp`, 60f=1초, 180f에서 상한. 연속 홀드 시 더 기다릴 수 있지만 배율은 더 늘지 않음 | `_updateKiSlashThirdCharge` |
| 검기 피해 | `floor(meleeRef × 7 × statStr × pAtkMul × _skMul('kiSlash') × M)`; `M=1+min(3,floor(chargeFrames/60))`. 0~59f=1배, 60~119f=2배, 120~179f=3배, 180f 이상=4배. 무충전·1·2타는 1배 | `_fireKiSlashCrescent` → `spawnCrescent` |
| 검기 크기·판정 | 3타의 배율 `M`에 따라 `chargeScale=1+(M−1)×0.4`; 기본 반경120px → 120/168/216/264px. 기본 비행폭252px → 252/352.8/453.6/554.4px. 1·2타 반경55px·비행폭192px 유지 | `spawnCrescent`, `_drawRadiantKiSlash`, `renderCrescents` 폴백 |
| 비용·거리·소리 | ST10+(Lv−1)×2를 3타 입력 시 한 번 소모. 기본 이동거리350px+레벨당15px, 비행속도14px/f 유지. 3타 검격음은 해제 발사 때 한 번 재생 | `useStPct('weapon')`, `_fireKiSlashCrescent` |
| 취소·중단 | 충전 중 Q 보호막 진입 시 충전값·콤보 초기화. 다른 상태에서 idle로 복귀할 때 남은 충전값 초기화. 발사된 검기는 유지 | 공격 상태·idle 처리 |

충전 60/120/180f마다 붉은 충전 파티클과 단계 텍스트·효과음으로 피드백을 준다. 충전 배율은 **검기 투사체 피해**에만 적용한다. 근접 칼날 타격, 거리, ST 소모, 1·2타 피해는 그대로다. 3타 자체의 발사 직후 기존 20f 쿨다운과 120f 콤보 타이머를 설정한다.

검증: `test/kiSlashHoldCharge.test.cjs`가 두 HTML의 단계별 배율·3타 전용 피해/크기·홀드 중 무발사/해제 1회 발사를 실행한다. `test/kiSlashSwingSound.test.js`, `test/kiSlashQCancel.test.js`, `test/basicAttackDamage.test.js`도 함께 확인한다.
