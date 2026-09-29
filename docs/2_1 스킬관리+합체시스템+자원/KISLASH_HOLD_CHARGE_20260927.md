# 기검참 3타 홀드 충전 — 2026-09-27

좌클릭 기검참 콤보의 3타 입력을 계속 누르면 준비 자세로 기를 모은다. 버튼을 놓을 때 3타 검기와 근접 스윙이 한 번 나간다. 1·2타는 기존처럼 즉시 발사한다. 일반 게임과 쉬운 테스트 화면에 같은 입력·피해·VFX를 적용한다.

| 항목 | 코드·수치 | 적용 위치 |
|---|---|---|
| 입력 | `P.activeLMBSk==='kiSlash'`, `_cresStep===2`, `_cresComboT>0`에서 좌클릭 3타 입력 시 `wWindup`; `isHeld('weapon')`인 동안 대기, 해제 시 `wSwing`·발사 | `game.html`, `game-easy-test.html`의 idle 및 bowRecover 취소 경로 |
| 충전 시간 | `_kiChargeT += sp`, 60f=1초, 180f에서 상한. 연속 홀드 시 더 기다릴 수 있지만 배율은 더 늘지 않음 | `_updateKiSlashThirdCharge` |
| 검기 피해 | `floor(meleeRef × 7 × statStr × pAtkMul × _skMul('kiSlash') × M)`; 충전 단계 `T=min(3,floor(chargeFrames/60))`, `M=2^T`. 0~59f=1배, 60~119f=2배, 120~179f=4배, 180f 이상=8배. 무충전·1·2타는 1배 | `_kiSlashHoldTier`, `_kiSlashHoldMultiplier`, `_fireKiSlashCrescent` → `spawnCrescent` |
| 검기 크기·판정 | 피해 배율과 별개로 `chargeScale=1+T×0.4`; 기본 반경120px → 120/168/216/264px. 기본 비행폭252px → 252/352.8/453.6/554.4px. 1·2타 반경55px·비행폭192px 유지 | `spawnCrescent`, `_drawRadiantKiSlash`, `renderCrescents` 폴백 |
| 명중 섬광 | 3타 명중 시 627px 원본 프레임을 `184×chargeScale/627`로 재생. 단계별 표시폭 184/257.6/331.2/404.8px, 4프레임×3f. 시트 로딩 실패 시 `ice_slash` 크기 `1.25×chargeScale`. 1·2타 명중광은 140px, 폴백 크기 0.9 유지 | `_playKiSlashHit` |
| 3단 완료 신호 | 충전값이 180f에 처음 도달할 때 `sword_parry` 금속 충돌음 1회(`vol=.72`, `rate=1.08`)와 캐릭터 중심 `ki_slash_hit_2` 백열 섬광 1회(`scale=.26`, `frameTime=2`, 4프레임·8f)를 동시에 재생. 명중 시트 미로드 시 `parry_impact`(`scale=.85`, `frameTime=1`) 폴백. 1·2단에는 기존 `scarecrow_charge`(`vol=.35`, `rate=1`)를 유지. 180f 상한으로 계속 홀드해도 반복하지 않으며 해제 발사음은 별도 | `_updateKiSlashThirdCharge`, `playSample`, `playVFXAng` |
| 비용·거리·소리 | ST10+(Lv−1)×2를 3타 입력 시 한 번 소모. 기본 이동거리350px+레벨당15px, 비행속도14px/f 유지. 3타 검격음은 해제 발사 때 한 번 재생 | `useStPct('weapon')`, `_fireKiSlashCrescent` |
| 충전 중 방향 | 홀드 중 매 업데이트 `P.atkArc=P.facing`. 마우스 조준 또는 게임패드 스틱으로 바뀐 방향을 차징 검기·공격 자세에 즉시 반영하고, 해제 시 같은 방향으로 3타 검기를 발사 | 양쪽 HTML의 `_updateKiSlashThirdCharge`, `_drawKiSlashCharge`, `_fireKiSlashCrescent` |
| 취소·중단 | 충전 중 Q 보호막 진입 시 충전값·콤보 초기화. 다른 상태에서 idle로 복귀할 때 남은 충전값 초기화. 발사된 검기는 유지 | 공격 상태·idle 처리 |

충전 배율은 **검기 투사체 피해**에만 적용한다. 근접 칼날 타격, 거리, ST 소모, 1·2타 피해는 그대로다. 3타 자체의 발사 직후 기존 20f 쿨다운과 120f 콤보 타이머를 설정한다.

## 2026-09-27 충전 VFX 정비

| 항목 | 현행 연출 | 적용 위치 |
|---|---|---|
| 주 검기 | 기존 붉은 9프레임 기검참 시트의 첫 행 0~2프레임을 7f 간격으로 순환. 플레이어 몸 중심 `P.x/P.y`에 정렬하고 시전 방향으로 회전. 기본 표시 크기 `78+13×T+4×(충전f mod 40)/40`px(`_KI_HOLD_STEP=40`), T=0/1/2/3이므로 0/40/80/120f에 78/91/104/117px. 단계 사이 최대 4px 성장 후 다음 단계 경계(40f)에서 약 9px 커지며, 맥동 ±3.5%. 외광 alpha `.24+.08×T`, 본체 alpha `.58+.08×T`로 단계별 밝기도 상승. `lighter` 합성으로 2장(외광 0.96배·본체 0.82배)을 겹쳐 몸을 감싼다 | `_drawKiSlashCharge`, 플레이어 스프라이트 직후 |
| 집속 흐름 | 2026-09-27 제거. GPU 래퍼가 `quadraticCurveTo`를 제어점 경유 직선으로 처리해 검기 위아래에 긴 화살표 모양 선 2개가 나타났다. 백열 검기 시트 자체의 잔광만 사용 | `_drawKiSlashCharge`, 양쪽 HTML |
| 충전 단계 | 검기 아래 대각선 자국 3개가 완료한 40/80/120f 단계에 맞춰 암적색에서 백열색으로 점등. 약 0.67초(40f)마다 1단, 2초(120f)에 최대 3단(2026-09-29 3초→2초 단축, 배율 불변). 1·2단 충전음과 3단 완료 금속음·섬광으로 단계 차이를 표시하며, 화면에 떠오르는 충전 문구는 사용하지 않는다 | `_kiSlashHoldTier`, `_drawKiSlashCharge`, `_updateKiSlashThirdCharge` |
| 차지 보존 (2026-09-29) | 3타 홀드 차지(`_isKiCharging()`: `P.s==='wWindup'&&P._kiChargeActive`) 중 **피격 경직 면역** — `hurtP`·덫·근접 3경로 stagger 제외, 포이즈는 정상 감소해 기절(pStun) 시에만 끊김. **전격이동(bladeDash)** 사용 시 kiGather/sDraw와 동일하게 상태를 `bladeDash`로 바꾸지 않고 `_tickBladeDash`로 이동(250px/6f)만 진행 → 충전 유지·계속 누적, 키를 떼면 정상 발사 | `_isKiCharging`, `hurtP`, `activateBladeDash` |
| 폴백·합성 | 시트 로딩 전에는 같은 전방 위치에 적색 곡선 칼날을 12개 직선 구간으로 근사해 그린다. GPU 래퍼의 `quadraticCurveTo` 직선화에 의존하지 않는다. GPU/WebGL에서는 `_setBlend(true/false)`로 가산 합성, Canvas2D는 `lighter` | `_drawKiSlashCharge` |

검증: `test/kiSlashHoldCharge.test.cjs`가 두 HTML의 단계별 배율·3타 전용 피해/크기·홀드 중 무발사/해제 1회 발사·차징 중 조준 변경과 같은 방향 발사·시트 로드 시 불필요한 화살표 선이 없는지를 실행한다. `test/kiSlashSwingSound.test.js`, `test/kiSlashQCancel.test.js`, `test/basicAttackDamage.test.js`도 함께 확인한다.

실화면 검수: 로컬 `game.html?test=1`에서 3타 차징 상태로 좌클릭을 유지하고 마우스 조준을 오른쪽에서 왼쪽으로 이동했다. `P.facing`과 `P.atkArc`가 함께 바뀌며 차징 검기가 왼쪽으로 회전했고, 해제 후 검기도 왼쪽으로 발사되는 것을 확인했다. 쉬운 테스트 화면의 화면 조작은 별도로 수행하지 않았으며 동일 함수 회귀 테스트로 확인했다.

화살표 모양 선 수정 후 로컬 GPU 게임 화면을 새로고침해 2단·최대 3단 홀드를 확인했다. 백열 검기 시트와 단계 표시만 남고 검기 위아래로 뻗던 긴 분홍·흰 선은 표시되지 않았다.

몸 밀착·피해 재조정 후 로컬 GPU 화면에서 3단 180f를 유지해 차징 검기가 몸 주변에 놓이는 것을 확인했다. 브라우저 런타임의 0/60/120/180f 단계는 0/1/2/3, 피해 배율은 1/2/4/8이었다. 해제 후 충전 상태가 종료됨을 확인했다. 실제 적 대상 최대 단계 명중 피해 수치 계측은 별도 검수가 필요하다.

단계별 크기 조정 후 두 HTML의 테스트에서 60/120/180f 경계마다 차징 검기가 뚜렷하게 커지고 0→3단 표시 크기가 1.4배 이상인지 확인한다.

3단 완료 금속음·섬광 적용 후 로컬 GPU 게임 화면에서 `sword_parry` 오디오 버퍼와 `ki_slash_hit_2` 시트 로드를 확인했다. 179→180f 완료 이벤트로 캐릭터 좌표에 scale .26의 섬광 1회가 등록되는 것을 확인했고, 시각 캡처용으로 해당 브라우저 인스턴스의 VFX frameTime만 일시적으로 20으로 늘려 몸 중심 섬광을 확인했다. 실제 코드의 frameTime은 2이며, 소리의 음색은 청취 검수하지 않았다. 두 HTML의 자동 검사는 완료 이벤트의 금속음·섬광 1회와 홀드·해제 중복 방지를 검증한다.
