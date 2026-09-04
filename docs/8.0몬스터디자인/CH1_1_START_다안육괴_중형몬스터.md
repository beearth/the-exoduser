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
| idle / 8방향 | `img/ch1_1_medium_01_source.png` | `1254×1254` | `4×2`, 8 cells | facing을 45° 단위로 0~7 frame에 매핑 |
| 이동·공격 | `img/ch1_1_medium_02_source.png` | `1448×1086` | `8×4`, 32 cells | `floor(now/78) mod 32` frame; 이동·공격·접근·돌진에서 선택 |

| 항목 | 값 |
|---|---|
| 전용 로더 | `_CH1_START_MEDIUM_SHEETS`, `_ch1StartMediumImgs`, `_ch1StartMediumReady` |
| draw 함수 | `_drawCh1StartMediumEyeMass(X,e,now,alpha)` |
| 표시 크기 | `max(118, r×4.1)`px; 실제 반경 범위에서는 약 `131.2~147.6px` |
| 배치 제외 | `_prepEnemyInstanced`는 `_ch1StartMedium`을 WebGL enemy batching에서 제외 |
| 화면 draw | 일반 적 Canvas pass가 `_drawCh1StartMediumEyeMass`를 호출; generic 8dir atlas를 덮어쓰지 않음 |
| 자산 실패 | action이 준비되지 않으면 idle sheet를 선택하고, idle도 실패하면 기존 generic sprite 경로로 fallback |

## 검증

| 검증 | 결과 |
|---|---|
| 단위·소스 계약 | `node --test test/ch1StartMediumEyeMass.test.js` PASS |
| inline JavaScript | `node --test test/gameHtmlInlineSyntax.test.js` PASS |
| 브라우저 | `http://127.0.0.1:3333/game.html`, `initStage(0)` 후 2마리 alive, 두 시트 ready, pageerror 없음 |
| 시각 확인 | `captures/ch1_start_medium_20260904.png`: 시작 화면 좌상단·우상단에 두 다안 육괴 표시 |
