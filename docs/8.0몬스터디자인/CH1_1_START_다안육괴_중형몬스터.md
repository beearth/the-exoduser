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


## 2026-10-08 현재 계약 — ROOT-CH1-HITFLASH-CURRENT-FRAME-20261008

이 절은 이번 본편 피격 효과의 현재 구현 계약이다. 앞선 2026-10-01 등의 “idle 셀 1장/고정 크기” 설명과 기존 검수는 당시 구현의 이력으로 보존한다. 현재 일반 8방향 본체는 base와 조건을 통과한 walk를 덧그리므로, flash도 같은 render에서 실제 소비한 레이어 순서를 재사용한다. 전용 CH1 중형 육괴는 자기 시트·crop·종횡비를 사용한다. 전투 수치나 hitFlash 수명 변경은 없다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 소유 / 범위 | ROOT, game.html own 10 hunks. 기존 일반 8방향 enemy pipeline 및 CH1 전용 중형 renderer. stage/URL opt-in 한정 기능이 아니다. 보스·다른 특수 renderer 전체 완료를 뜻하지 않는다. |
| 프레임 저장 | private `_enemyHFFrames: Map(e → layers)`, `_enemyHFSubmitted: Set(bucket)`. animation·이미지 resource의 소유권은 받지 않는다. |
| 초기화 | `_prepEnemyInstanced` 진입에서 두 collection을 clear한다. GL 준비 실패/비활성 조기 반환보다 먼저 실행한다. |
| 기록 Gate | `e._hitFlash>0`일 때만 `[img,sx,sy,sw,sh,x,y,w,h,bucket]`을 기록한다. Canvas 기본 bucket=-1. 현재 e 객체가 key이며 좌표가 같은 다른 e와 공유하지 않는다. |
| GL queue | `_queueEnemyHFFrame(e,...)`가 기존 queue의 true 반환 뒤에만 기록한다. 화면 중심 좌표를 nominal world rect로 복원: `x-VW*.5+G.cam.x-w/2`, `y-VH*.5+G.cam.y-h/2`. 새 zoom 보정은 없다. |
| GL 제출 | `GL.drawArraysInstanced`가 throw 없이 반환한 뒤 bucket 표식을 넣는다. flash는 submitted 표식과 `_ens8GLImgs[bucket]===img`가 모두 필요하다. queue true만으로 제출/실 GPU 업로드 성공을 선언하지 않는다. |
| Canvas body | `_drawEnemyHFBody`는 원 `X.drawImage` 호출 뒤 `!e._ensGLMode`일 때 `e.x+x,e.y+y,w,h`를 기록한다. throw면 기록하지 않는다. 기존 queued body를 flash용으로 중복 기록하지 않는다. |
| 실제 레이어 | base→walk의 실제 image/crop/rect 순서를 재사용한다. walk queue 용량 초과·텍스처 미제출·미준비는 해당 레이어를 새로 만들어 flash하지 않는다. 캡처 이후 선택 정보/위치 변경으로 crop을 재계산하지 않는다. |
| pop | `1+.05*Math.min(1,e._hitFlash/6)`. 각 rect 중심을 유지해 `x+w*(1-pop)/2,y+h*(1-pop)/2,w*pop,h*pop`. |
| alpha / blend | GL `Math.min(1,e._hitFlash/6)*.8`; Canvas는 여기에 기존 `sa`를 곱한다. 원 save/restore와 lighter/`_setBlend` 경로 유지. base+walk 겹침 밝기는 실화면 미인수다. |
| 일반 body 크기 | 기존 `Math.max(e.r*7,80)` 등 실제 선택된 rect 그대로. flash가 별도 일반 atlas idle 셀을 재선택하지 않는다. |
| 전용 중형 | `_drawCh1StartMediumEyeMass`의 실제 image/sx/sy/fw/fh와 `drawH=Math.max(240,e.r*7)`, `drawW=drawH*(fw/fh)` 재사용. 기존 4×8 선택·방향·공격 column 권한은 그대로다. |
| 불변 | 기존 hitFlash 설정 6/4, 고정 update 감쇠·사망 소거, 피해/timing/CC/보상/자원/스킨 할당/시체/PNG/scene/nav/save 변경 없음. 새 RAF/timer/Image/fetch/resize/borrowed image close/dispose 없음. |
| 비용 / 한계 | Map/Set와 hit 중 per-layer 배열이 추가된다. 성능·메모리 비용 UNKNOWN. GL 제출은 pixel ACK가 아니다. 기존 GL/Canvas body duplication, texture 실패 후 기존 _ensGLMode, parent proxy silent failure는 미해결/미인수다. zoom/shake/모든 화면 pixel 정렬·동일 canvas pixel 재쓰기 탐지·해부학 foot도 미인수다. |

| 정확 완료 source / 검수 | 값 / 실제 범위 |
|---|---|
| working game | 4113269B / SHA256 `0b423864dc59271a8a0161a2632cac415cc9b27c5aa53c6ea0e018673a6bd49e` |
| owned game | 4113084B / SHA256 `6430cbdce791414bdd6299a8de99b7115105eb6a99529a5e3a51f39b3ca83ffd` |
| foreign 보존 | game foreign185B와 설정3.3 foreign2948B 미채택. working/HEAD 각각 외부 fullbytes 선 백업, 동일 own hunk 적용, inverse exact, owned blob만 부분 stage. |
| 최초 CPU | 실제 main 함수/normal body·flash 블록 + 통제 Canvas/GL/atlas metadata. Node1/VM15/11그룹/34조건 PASS, FAIL0/setup0/미도달0/exit0, unhandled 계측0. PNG decode/GPU/Chrome/audio/save0. |
| CPU Gate | idle·base+walk·south fallback·queue 용량·texture 실패·GL throw·bucket image identity·frame clear·actor 분리·Canvas throw·전용 중형 비정사각 aspect·alpha/transform/restore. 기존 suite 재실행/clean 합산 없음. |
| source 정적 peer | 최종 own hunk Gate4 연결 확인, 신규 blocking finding0. 정적 검토는 GPU/실화면 인수가 아니다. |
| native / UI | NOT_RUN / UI_NOT_ASSESSED. 새 PNG0, 청취0, durable Save ACK0. 기존 사용자 IAB13 old-loaded source를 닫거나 재로드하지 않았고 새 코드가 적용됐다고 주장하지 않는다. |
| docs 검색 | 코드 후 새 전체 관련 검색1회: eligible text1022/Markdown818 → 42매칭경로/1839행/1898회. 현재 정본8개 정확 동기화. 42문서 전수 fullread 주장은 하지 않는다. 과거 asset 목록·역사/보호 문서는 그대로 보존한다. |
| 증거 위치 | `E/ch1-hitflash-current-frame-20261008/`: implementation-receipt, cpu-execution-receipt, cpu-result, final-source-peer, validation-receipt, visual-verdict, docs-disposition, docs-completion-receipt, remote-preservation-receipt. E는 승인된 외부 영수증 루트다. |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 전투 가독성 source consumer. MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(assets/composites/overlap/repetition), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/integration), PLAYABLE(arenas/travel/breathing/threat/readability), LANDMARK(primary/secondary/tertiary), CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT), TECH QA(route/collision/pageerror/404/seam/loading/performance), FILES/GIT의 표준 세부 항목은 위 외부 `visual-verdict.json`에 기록했다. 이번 geometry·원화·nav 변경0, 실카메라/환경 시각 QA NOT_RUN, physical relief0/확대 흐림/절벽 전경·공통 발 접지는 미완료다. GIT의 최종 staged/commit/push는 같은 단위 completion/remote 영수증을 우선하며 이 절의 검수 시점을 사후 성공으로 바꾸지 않는다.

**VISUAL VERDICT: RETOUCH.** 이번 기능의 실화면 미검수이며 통제 CPU PASS를 시각 PASS로 승격하지 않는다. 다음은 허용된 새 실제 화면의 피격 가독성·normal CH1-1 보스 개방/사망/부활/재도전·청취·실보상 save 인수다.
