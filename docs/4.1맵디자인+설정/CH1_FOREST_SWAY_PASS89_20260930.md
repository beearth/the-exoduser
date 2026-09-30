# CH1-1 외곽 숲 배경의 미세한 흔들림 — 89차 (2026-09-30)

> 현행 배경은 bakeVersion `20260930-rotforest-95`/청크 cache key `20260930-rotforest-96`다. 89차의 변위 공식·±5px·8띠는 유지하며 95차에서는 64² mask의 청크 가장자리 4샘플에 `smoothstep(min(x,y,63−x,63−y)/4)`를 곱한다. 아래 '원본 불변' 및 시각 판정은 89차 제작 당시 기록이다. [현행 경계·원화·검수](CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md).

사용자 요구: 1-1의 **나무숲 배경 자체**가 조금씩 음산하게 흔들려야 한다. 88차의 `m_ctree13~20` 개별 나무 움직임만으로는 정적으로 구워진 외곽 숲이 움직이지 않았다. 현행 87차 피부 바닥과 88차 나무 원화·배치 위에 별도 시각 레이어를 더한다.

## 구현 계약

| 항목 | 현행값·적용 위치 |
|---|---|
| 진입 | `game.html` → `ch1-forest-sway.js?v=20260930-90` → `_drawCh1BakedSpike` 직후 `Ch1ForestSway.draw` → `_drawCh1Hill` 이전. `build-nwjs.mjs` FILES에도 포함 |
| 범위 | `G.stage===0`, 보스방 아님, `_fieldRebuildQA` 아님, source=`assets/map/ch1/production_finish`, `G.map` 존재. 타 스테이지·비교 배경은 정적 |
| 원본 | 기존 64장 `chunk_X_Y.png`의 1026×1026(1px bleed)에서 1024×1024 core를 읽는다. 원본 PNG·master·bakeVersion은 수정하지 않음 |
| 정적 보호 | 200×200 tile, `T=40`의 `G.map`에서 벽 tile=`1`만 대상으로 한다. 보행 tile은 alpha 0. 가장 가까운 비벽 tile에서 약 1.05~9 tile 떨어진 외곽 숲만 움직이고 접지 1.05 tile와 깊은 숲은 그대로 둔다. 64×64 alpha mask, 안쪽 smoothstep 1.55 tile, 바깥 smoothstep 6.5~9 tile |
| 움직임 | 각 청크를 8개 가로 띠로 나누어 `dx=3.8 sin(t×0.00055+y×0.001+x×0.00025)+1.2 sin(t×0.00031−y×0.0007+x×0.00035)` 월드픽셀. 절댓값 최대 5px, 서로 다른 높이·위상으로 느리게 흔들림. 카메라 전체 흔들림·점멸 없음 |
| 준비·메모리 | 보이는 청크만 유휴시간 generator로 8 mask행마다 양보. `requestIdleCallback` timeout 200ms, 한 회차 3ms 목표, 미지원 시 8ms timer. 준비/실패 때 기존 정적 숲을 표시. 최대 12개 1024² RGBA overlay 캔버스(이론상 약 48MiB) LRU. 한 보이는 청크당 최대 8 추가 drawImage |
| 좌표·충돌 | world chunk 1000px, 원본 배경과 동일. `G.map`, `canMv`, 나무 collider, START/EXIT, 남북 통로, 보스 조건, 전투 공터 및 피부 바닥 픽셀 데이터 변경 없음 |

배경의 정적 원본 위에 작은 변위의 동일 텍스처를 투명 합성하므로 가까운 거리에서 잔상이 보일 가능성이 있다. 숲 전체 구조 변형이나 새 프레임 원화가 아니며, 효과는 전투 시야를 가리지 않는 미세 움직임이다. 외곽 숲 원화의 재질 통일과 88차 일부 독립 나무의 접지는 다음 시각 리터치 대상으로 남는다.

## 검증

| 검증 | 결과 |
|---|---|
| Node 회귀 | `test/ch1ForestSway.test.js` 2/2 PASS. 시간에 따라 실제 draw 목적지 좌표가 변하고 ±5px 이내, 보행 밴드 alpha 0, stage/boss/비교 source 폴백 확인 |
| 실제 본편 | `server.cjs`의 `http://localhost:3333/game.html?test=1&slot=demo&demo=1`을 새로고침한 Chrome 탭. JS 200 OK, `Ch1ForestSway.qa()` 로드 및 생산용 청크 렌더 확인 |
| 여덟 카메라 | START `(4020,7420)`, EARLY `(4000,6400)`, ARENA `(4000,4800)`, SIDE L `(1380,3860)`, SIDE R `(6620,3860)`, LANDMARK `(4100,3620)`, LATE `(4000,1280)`, EXIT `(4100,300)` 실화면 캡처. 시작/좌우/출구 화면은 직접 시각 확인. 외곽 좌우에서 2~4개 overlay 청크 렌더, 중앙은 대상이 없거나 적어 고정 |
| 런타임 계측 | 206 draw 표본 시점 `meanDrawMs≈0.0194ms`, `maxDrawMs≈0.2ms`, cache≤12; 이 값은 overlay draw 호출 시간만이며 전체 프레임 성능 보증은 아님. 초기/화면 이동 중에는 overlay 준비 후 정적 폴백에서 전환 |
| 로그·로딩 | QA 탭의 warning/error 0, 신규 JS HTTP 200. 새 NW.js 패키지 빌드·설치 검수는 수행하지 않음 |

## MAP PRODUCTION REPORT

| 구역 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 썩은 숲. 8구역 실루엣, START 남쪽→EXIT 북쪽, 측면 공간과 중심 전투공간 불변 |
| OUTER MASS | LEFT/RIGHT 외곽의 보행 뒤 1~9 tile 숲만 미세 흔들림. TOP/SOUTH도 같은 mask 규칙. 새 구멍 없음; 정적 원본 유지 |
| LARGE | 기존 production baked 64청크와 88차 나무 원화 사용. 합성·배치·반복 실루엣 데이터 변경 없음 |
| MEDIUM / GROUND | 나무·뿌리 접지, 피부 바닥·동맥·그림자·오염 재질 변경 없음. alpha mask로 보행면과 즉시 접지부 보호 |
| PLAYABLE | 메인 arena, 이동 공간, 숨 돌림 공간, 위협 공간과 전투 가독성 유지. 화면 전체 흔들림 없음 |
| LANDMARK | 주·보조·3차 랜드마크와 보스방 시각 계약 변경 없음 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 8개 카메라 실화면 캡처. SIDE L/R의 forest overlay 작동, 공터와 출구는 안정적. 후속 긴 전투 시각 검수 필요 |
| TECH QA | route/collision 원본 불변; 새 JS 200, QA console error 0, 좌우 스크린샷에서 눈에 띄는 청크 경계 파손 없음. 준비 중 정적 폴백. 성능은 위 overlay 국소 계측; 전체 게임 FPS 장시간 계측은 미실시 |
| FILES | `ch1-forest-sway.js`, `game.html`, `build-nwjs.mjs`, `test/ch1ForestSway.test.js`, 이 문서와 동기화 문서. 다른 작업의 `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`는 미수정 |
| GIT | 코드와 관련 docs만 별도 로컬 커밋. push·deploy·새 패키징 없음 |

**VISUAL VERDICT: RETOUCH.** 요구한 외곽 숲의 미세 움직임은 본편에서 작동한다. 전체 1-1 환경의 나무 재질 연결·개별 생체나무 접지는 추가 시각 작업이 필요하다.

**NEXT PASS:** SIDE L/R 실전 전투에서 움직임 가독성·잔상과 장시간 프레임을 재검수하고, 외곽 나무·피부 접합의 시각적 이질감을 원화 단계에서 줄인다.
