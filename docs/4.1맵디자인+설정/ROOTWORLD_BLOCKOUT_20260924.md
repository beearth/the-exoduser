# CH1-1 Rootworld — 전체 블록아웃 2

> QA 전용 구현. 본편 LOCK 유지. GATE 1~2 진행 중이며 최종 아트가 아니다.

## 현행 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| 진입 | `/map/field`, stage0 + mapqa + fieldrebuild, `genFromTemplate` 유지 |
| 크기 | 200×200, T40, 8000² world |
| 생성 | `_buildDiabloField(0,200,200)` stage0 전용 polygon 분기. 다른 stageIndex의 기존 6ellipse 생성 보존 |
| 외곽 / 중앙 질량 | 34점 outer / 12점 centralMass; 타일 중심 point-in-polygon, outer 안이고 mass 밖이면 floor |
| 템플릿 통행 칸 | 13396; 이전 17071은 blockout1 이력. 비율을 설계 목표로 쓰지 않음 |
| 시작 / gate | start room `(100,181)`, boss room `(100,24)`, 반환 bossGate `(100,12)`는 메타데이터. engine은 QA에도 `_applyCh1StartNorthGate` 적용: gate y5/exit y7, x88~112/y2~35 통로 보장 |
| 나무 | `(102.5,112.5)`, scale1.12, noCol:true; 중앙 비통행 mass 위. 이전 `(101.5,68.5)`는 이력 |
| bake/cache | `20260924-blockout-2`; rootworld_outer, 8192², 64청크, core1024+bleed1, 월드청크1000 |
| NAV SHA256 | `9cadbd6831211387a0c0f27f3b765764b252cc0f3c6d00a4699b460db0b356b4` |
| 마스크 | 기존 1tile dilate / scale4 / blur5 유지. 새 NAV에 맞춰 전체 bake 후 crop. gate clearance x88~112/y2~35를 bake에도 적용. 본편 production_finish 변경 없음 |
| 보호 | 수정 전 `tmp/game.before-rootworld-blockout-20260924.html` 백업. 타세션 UI/캐릭터/적 코드 보존 |

| region role | cx,cy | rx,ry | 공간 역할 |
|---|---|---|---|
| start | 100,181 | 12,12 | 남쪽 압축된 진입 |
| combat | 62,126 | 24,25 | 서측 주 전투장 |
| travel | 70,84 | 14,18 | 북서측 이동/숨 고르기 |
| pocket | 148,112 | 23,25 | 남북 연결되는 동측 습지 예정지; 막다른 공간 아님 |
| boss | 96,42 | 26,21 | 북측 합류 전투장 |

위 region 수치는 의미/스폰 메타데이터이며 실제 경계는 polygon이다. rooms는 s `(100,181,8,8)`, c1 `(62,126,18,18)`, b `(100,24,12,12)` ellipse다.

| 소환굴 | x,y | 타입 |
|---|---|---|
| 서측 | 60,130 | M |
| 북서 | 69,86 | M |
| 북측 | 102,44 | M |
| 동측 | 151,115 | L |

기존 횃불 8개는 추가하지 않고 재배치했다. 좌표/scale: `(93,174,1.08)`, `(107,174,1.08)`, `(53,139,.88)`, `(66,103,.92)`, `(153,128,1)`, `(138,91,.9)`, `(73,68,.86)`, `(99,29,1)`. 실제 위치는 `(tile+.5)*T`. base/8frame flame/sway 계약 변경 없음. 지면 균열 장식은 기존 경로/clip 그대로이며 후속 GROUND 패스 대상이다.

## 검증 범위

- 신규 테스트 RED: 기존 중앙 `(102,112)`가 floor라 실패. 구현 후 GREEN.
- 중앙 wall, 서측/동측 하나를 각각 차단해도 다른 경로로 북측 도달, 모든 floor 연결, 모든 소환굴 접근 가능.
- 전투 clearance disk: `(62,126,r12)`, `(148,112,r9)`, `(96,42,r12)` 전부 floor.
- 10개 테스트 PASS: 지형·관문3, QA runtime2, inline syntax1, 배경선택1, bake assets3. 청크64 크기/RGBA, 선택 horizontal/vertical bleed 동일성, 새 플레이 중심 투명도 포함. 전 청크 이동/실전 성능 PASS 의미 아님.
- `tools/qa_rootworld_blockout.py`는 실제 `genFromTemplate` 이후 중앙 wall 확인 및 8카메라 floor 확인. 증거는 `captures/rootworld_blockout_20260924/`. 순간이동이며 실제 입력 종주가 아니다.
- 카메라 tile: START `(100,181)`, EARLY `(86,165)`, ARENA `(62,126)`, SIDE L `(40,122)`, SIDE R `(155,115)`, LANDMARK `(124,113)`, LATE `(80,49)`, EXIT `(100,15)`. 이전 좌표는 새 경계에서 벽이 될 수 있어 고정 전후 화질 비교로 주장하지 않는다.

## 실제 8카메라 결과

1280×720/DPR1에서 8곳 모두 floor0, 중앙 `(102,112)` wall1, 북쪽 `(100,7)` exit2 확인. pageerror/HTTP 오류/청크 오류 각각 0. 마지막 카메라까지 청크49 ready, 화면당 실제 draw4~10. headless 계측 maxWarm 약20.2ms/maxDraw 약0.2ms는 청크 경로 부분 계측일 뿐 전체 FPS·장시간 메모리 합격을 뜻하지 않는다.

START는 양측 경계가 들어오기 시작하지만 바닥 반복과 직선 발광 균열이 강하다. EARLY/ARENA/SIDE R/LATE는 여전히 반복 바닥이 지배하며 습지 재질 차이가 없다. SIDE L은 외곽이 보이나 crop 원근/크기가 맞지 않는다. LANDMARK는 중앙 mass 쪽 뿌리를 볼 수 있으나 주변 바닥과 분리된다. EXIT는 수정 후 북측 포털을 확인했지만 접근 카메라 상단에서 잘린다. 따라서 8카메라 시각 판정은 모두 RETOUCH이며 최종 제출 캡처로 사용하지 않는다.

관문 문제는 QA 분기만 본편의 북측 후처리에서 제외되어 boss room 입구 추정 방향을 따르던 원인이었다. 테스트에서 QA gate가 고정 y5로 설정되지 않음을 RED 확인한 뒤, 기존 helper를 QA에도 적용하고 재촬영했다. 문서를 읽고 원인을 추적하는 systematic-debugging 절차로 한 분기만 수정했다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 QA / blockout2 |
| MASTER | silhouette: 남쪽 압축/서측 release/동측 offset/북측 합류; regions: 위 5meta + 중앙mass/외곽; main route: 남→서→북; side spaces: 동측 연결 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH: 새 polygon mask에 기존 bake 재생성; major holes: 새 연결은 생겼으나 원화 crop 반복/중앙 bake 품질 미해결 |
| LARGE | source assets: 승인 master 유지; composites21/overlap/scale 기존 유지; repeated silhouette 잔여. 새 최종 원화 아님 |
| MEDIUM | connections/remaining holes: 새 경계에 맞춘 접합 재작업 필요 |
| GROUND | shadow/contamination/structure integration: 기존 타일·균열 유지, 습지 재질 미구현 |
| PLAYABLE | main arenas: 서측/북측; travel: 북서; breathing: 북서 shoulder; threat: 동측 예정; combat readability: 실전 미검증 |
| LANDMARK | primary: 중앙 비통행 질량과 기존 나무; secondary: 관문/습지 예정지; tertiary: 기존 횃불만 이동 |
| CAMERA QA | 8점 지정, 이번 캡처/판정은 후속 검증 결과 절 참조 |
| TECH QA | route: BFS PASS; collision: 중앙 template wall PASS; pageerror/404/loading: 브라우저 결과 참조; seam: 선택 경계 PASS; performance: 목표 FPS/장시간 미검증 |
| FILES | stage-owned: game.html 맵 관련 한정, builder, 재bake, tests, QA script, board, docs; concurrent/unrelated 직접 수정 없음 |
| GIT | 본 세션 변경만 분리 커밋; push/deploy 없음 |
| VISUAL VERDICT | RETOUCH. 블록아웃 진척이며 제출 수준 아님 |
| NEXT PASS | 실제 카메라에서 드러난 경계/중앙 질량을 승인 원화에 맞춰 재구성. 동일 crop 확대 반복을 최종 결과로 사용하지 않음. 작은 디테일 보류 |
