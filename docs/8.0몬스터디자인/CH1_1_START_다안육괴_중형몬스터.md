# CH1-1 START 다안 육괴 — 중형 몬스터 계약

> 상태: 구현 완료 · 2026-09-04
>
> 적용 범위: `game.html`, `G.stage === 0` (CH1-1)만. 다른 스테이지의 스폰 풀, atlas, 지도 geometry는 바꾸지 않는다.

## 목적

사용자 제공 다안·이빨·촉수 육괴를 CH1-1 시작 화면의 첫 전투 상대 2마리로 사용한다. 시작 화톳불 안에는 놓지 않고, 기존 START→북쪽 진행축과 지도 충돌을 유지한다.

## 개체·전투 표

| 항목 | 값 | 적용 위치 / 공식 |
|---|---|---|
| runtime id | `_ch1StartMedium=true` | `mkEn` 결과에 부여; 이 플래그가 전용 렌더 경로를 선택 |
| 한글명 | 다안 육괴 | `_ch1StartMediumName` |
| 수량 | 2 | `_CH1_START_MEDIUM_SPAWNS`의 2개 authored offset |
| stage | `0`만 | `_spawnCh1StartMediumEyeMasses(si)`: `si!==0` 즉시 반환 |
| 전투 몸체 | `etype 4` / Tank | 기존 중형 탱커 AI·피격·드롭·사망 처리를 재사용; 새 etype을 만들지 않음 |
| 속성 | `EL.D` | `mkEn(..., 4, false, EL.D, -1)` |
| 반경 | `32 ≤ r < 36 px` | `ETYPE_R[4]=16`; `(16 + random×2)×2` |
| HP·ATK | stage 0의 기존 비보스 Tank 공식 | `mkEn` 공용 난이도·레벨 공식 그대로. 이 encounter에는 별도 배율 없음 |
| 첫 원거리탄 | 없음 | `_firstShot=false`; Tank의 기존 근접 전투 계약은 유지 |
| 정예·희귀 | 없음 | `update()`의 기존 일반몹 정예 초기화 규칙을 따름; authored pair가 정예/희귀로 승격되지 않음 |

## 시작 배치 표

| # | 시작점 기준 tile offset | canonical 200×200 START `(100.5,185.5)`일 때 tile | 거리 (`T=40`) | 역할 |
|---|---:|---:|---:|---|
| 1 | `(-13,-18)` | `(87.5,167.5)` | 약 `888px` | 시작 화면 좌상단의 첫 접근 압박 |
| 2 | `(+13,-21)` | `(113.5,164.5)` | 약 `988px` | 시작 화면 우상단의 대칭 아닌 보조 압박 |

- 두 거리 모두 START 화톳불 안전반경 `500px`보다 크다.
- 좌표는 고정 map 절대좌표가 아니라 실제 `P.x/T`, `P.y/T`에 offset을 더한다. 그러므로 map variant에서도 맵 밖 스폰을 만들지 않는다.
- `mkEn`의 `canMv`/`safePt`가 최종 타일 충돌을 보장한다. 맵 geometry, collision, route는 변경하지 않는다.

## 소스·렌더링 표

| 용도 | 파일 | 원본 크기 | logical grid | 런타임 규칙 |
|---|---|---:|---:|---|
| runtime 정리 시트 | `img/ch1_1_eye_slime_8dir_4frame_clean.png` | `1024×2048` | `4열 frame×8행 방향`, 셀 `256×256` | 사용자 1536×1024 보드의 예시 첫 행은 제외하고, 실제 `N,NE,E,SE,S,SW,W,NW` 8행을 정확한 알파 경계로 crop; col 0=idle, col 1=attack, col 2~3=movement loop; canvas angle은 `[2,3,4,5,6,7,0,1]` 행으로 변환 |

| 항목 | 값 |
|---|---|
| 전용 로더 | `_CH1_START_MEDIUM_SHEETS`, `_ch1StartMediumImgs`, `_ch1StartMediumReady` |
| draw 함수 | `_drawCh1StartMediumEyeMass(X,e,now,alpha)` |
| 방향 추적 | `targetFacing=atan2(P.y-e.y,P.x-e.x)` (`P.hp>0`) | 일반 적 렌더러의 facing 갱신보다 먼저 반환하는 전용 경로에서도 플레이어를 즉시 바라봄; 플레이어 부재/사망 시 `e.facing` fallback |
| 표시 크기 | 세로 `drawH=max(240, r×7)`px; 실제 반경 범위에서는 `240~252px` |
| 종횡비/표시 폭 | 원본 셀 비율 보존: `drawW=drawH×(fw/fh)`; 현행 정방형 셀은 가로·세로 `240~252px` |
| 알파·crop 정리 | 32개 cell마다 체크무늬·숫자·방향명·보드 배경을 alpha 0으로 제거하고 가장 큰 연결 본체만 유지 | 각 본체의 실제 top/bottom 알파 경계를 기준으로 상하 중앙 정렬; 인접 cell·행 경계·배경 잔여 조각 없음 |
| 배치 제외 | `_prepEnemyInstanced`는 `_ch1StartMedium`을 WebGL enemy batching에서 제외 |
| 화면 draw | 일반 적 Canvas pass가 `_drawCh1StartMediumEyeMass`를 호출; generic 8dir atlas를 덮어쓰지 않음 |
| 자산 실패 | 단일 `sheet`가 준비되지 않으면 기존 generic sprite 경로로 fallback |

## 검증

| 검증 | 결과 |
|---|---|
| 단위·소스 계약 | `node --test test/ch1StartMediumEyeMass.test.js` PASS — runtime `1024×2048/4×8`, 32개 cell 각각의 단일 본체·이진 alpha·상하 중심 정렬 고정 |
| inline JavaScript | `node --test test/gameHtmlInlineSyntax.test.js` PASS |
| 브라우저 | `http://127.0.0.1:3333/game.html`, `initStage(0)` 후 2마리 alive, `sheet=true`, pageerror 없음; 플레이어 상대 방향에 따라 8방향 행 전환 |
| 시각 확인 | `captures/ch1_start_medium_8dir_base_20260904.png`: 두 다안 육괴가 서로 다른 대각 방향에서 숫자·배경·이웃 프레임 조각 없이 표시 |
