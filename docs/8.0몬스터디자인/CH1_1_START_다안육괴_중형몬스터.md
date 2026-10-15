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
| 전용 로더 | `_CH1_START_MEDIUM_SHEETS`, `_ch1StartMediumImgs`, `_ch1StartMediumReady`; sheet URL은 `?v=20260905-crop-sync` cache version을 포함해 열린 인게임이 1시간 PNG 캐시를 재사용하지 않음 |
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


## GPU 시트 준비 (2026-09-29)

| id | 현행 준비 |
|---|---|
| `_ch1StartMediumImgs` | 완료된 다안육괴 시트를 `_queueCombatTextureWarmup()`가 기존 일반80장 GPU 큐에 먼저 제출. Image complete/naturalWidth 검사·중복 Set·유휴1장 업로드·180f 재검사 유지 |

첫 접근 프레임의 전체 시트 업로드를 줄인다. 몬스터 크기·행동·판정·원본 아트 변경 없음. [실측·검증 SSOT](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md).

## 2026-10-16 기존 R same-render 몹 피격 프레임 소비 통합

2026-10-08 R의 ROOT-CH1-HITFLASH-CURRENT-FRAME own10hunk 계약을 현재 main의 PM-014에 통합한다. 앞선 idle 셀 재선택·고정 크기 설명/검수는 당시 이력이며 아래 레이어 소비를 검수한 것으로 소급하지 않는다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 범위 | R h36~41/159/377/378/380의 관측·flash 소비만. 현재 일반 8dir base→walk 및 전용 중형 본체가 실제 호출한 Image/crop/rect 순서 재사용. stage/URL opt-in 한정 아님 |
| private 상태 | _enemyHFFrames Map(e→layers), _enemyHFSubmitted Set(bucket). _prepEnemyInstanced 진입에서 clear. 기존 GL 준비·일반 body reset·조기 반환 유지 |
| 기록 | hitFlash>0만 [img,sx,sy,sw,sh,x,y,w,h,bucket]. e 객체 identity로 구별. 이미지/animation/텍스처 소유권 없음 |
| GL 관측 | _queueEnemyHFFrame은 기존 queue true 뒤만 기록. nominal world rect=x−VW/2+cam.x−w/2, y−VH/2+cam.y−h/2. GL.drawArraysInstanced가 throw 없이 반환한 뒤 bucket 표시. snapshot은 표시와 _ens8GLImgs[bucket]===img 모두 필요. 실제 body 픽셀/GPU 성공 ACK 아님 |
| Canvas 관측 | _drawEnemyHFBody는 원 X.drawImage 뒤 !e._ensGLMode일 때 e.x+x/e.y+y/w/h 기록. throw는 기록 없음. queued body Canvas 중복은 flash용으로 다시 기록하지 않음 |
| flash | 실제 base→walk 순서, 별도 facing/idle/walk 재선택 없음. pop=1+.05×min(1,hitFlash/6), rect 중심 유지. GL alpha=min(1,hitFlash/6)×.8; Canvas는 기존 sa 곱함. lighter/_setBlend/save/restore 유지 |
| 중형 | 실제 img/sx/sy/fw/fh와 기존 drawH=max(240,r×7), drawW=drawH×fw/fh 기록. 원 4열×8행·방향·공격 column·스폰/반경/전투 공식 유지 |
| 수명·전투 | hitFlash 설정6/4, 고정 update의 max(0,hitFlash−sp)·죽은 적 소거 유지. 피해/HP/CC/보상/자원/시체/save 변경 없음. render는 그리기만 |
| HOLD 분리 | ENEMY_GL_2D_BODY_FALLBACK_GATE의 body 실패·fallback/stride/queue/draw 권위는 미해결·미인수 유지. 보류된 general-Image warm branch도 포함하지 않음 |
| 비용·한계 | Map/Set와 hit 중 per-layer 배열 추가, 비용 UNKNOWN. zoom/shake/native billboard pixel 정렬·base+walk 밝기·실화면 미인수. borrowed close/dispose·새 Image/fetch/RAF/timer/셰이더·맵/에셋 변경 없음 |
| 새 검수 범위 | 자기 actor/Image/Proxy/GL로 실제 본체/walk call·flash if·queue wrapper·제출 뒤 marker·reset·중형 call seam만. 전체 draw/prepare/중형 함수·실GPU/카메라/사용자 창 실행 아님. 기존 통과 검사·에셋·픽셀 proof 재실행 없음 |
