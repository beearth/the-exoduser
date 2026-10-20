# map-node-9 보고서 — 기존 맵 Node 9실패 정정

대상 37개를 **28통과/9실패 → 37통과/0실패**, skip 0으로 정정했다. 분류는 (a) 낡은 기대값 2건, (b) 하니스 7건이다. 대상 9건에는 (c) 제품·데이터 결함과 (d) 보류된 미구현이 없었다. 테스트 3파일만 수정했고 제품·원본·공용 추출 도구는 변경하지 않았다. 검수 대기이며 main 병합은 맥북총괄 권한이다.

## 기준과 실행 경로

| 항목 | 실제 값 |
|---|---|
| 기준 | fetch origin/main `823c24baee3f6c5f058ebfd7776721e86f80bd18` |
| 브랜치 / 작업 폴더 | `codex/map-node-9-20261020` / `~/exoduser-wt/map-node-9` |
| 생성 | R에서 `worktree add --no-checkout -b` 후 `sparse-checkout set --no-cone --stdin`, 필요한 godot/docs/engine/test/tools·루트 소스와 원본 layout/geometry JS 2개만 수신 |
| 원본 game.html SHA-256 | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` v24.15.0 |
| 하니스 출력 | 외부 `run-node-suite.py --node-bin <절대 경로>`; subprocess 전체 stdout/stderr UTF-8 파일. OS.execute 사용0/출력 첫 조각 소비0 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/map-node-9/` (이하 L) |
| 격리 | Node VM은 기존 테스트 환경 사용, Godot/user save 접근0. 변형·baseline 사본은 L/`EXODUSER-map-node-9-Isolated-20261020/` |
| Godot | 실행0/import0. 따라서 override.cfg·사용자 디렉터리 변경0, Godot 실행 gate 대상 실행0 |
| 소유권 | WORK_BOARD의 자기 행에 테스트 3개·자기 보고서·CHANGELOG·자기 행만 등록. P3-001 공유 adapter/map.json 및 Main/State/저장·다른 담당 제품 파일 변경0 |

## 9건 전후와 첫 실패 원문

실패 원문은 Node TAP에서 가공 없이 `L/failure-01.log`…`failure-09.log`에 분리했다. 전체 stack은 `baseline-map-37.stdout.log`, 기계 판독 표는 `before-after-nine.json`이다. AssertionError 두 건의 표 셀은 Node가 출력한 첫 assertion 본문이다.

| # | 테스트명 (원문) | 첫 실패 원문 | 분류 | 전후 |
|---|---|---|---|---|
| 1 | CH1-1 overview keeps distant props visible while other stages keep their culling contract | `_moCull is not defined` | b | FAIL → PASS |
| 2 | partial source inspection preserves unknown JSON and explicit 0/1 nav without authorizing a scene | `assert.ok(result.pending.some(item => item.field === field))` | a | FAIL → PASS |
| 3 | missing/unknown source stays pending and output budgets retain 4MiB scene within 8MiB world | `assert.ok(missing.pending.some(item => item.field === 'resources.loadDrawAuthority'))` | a | FAIL → PASS |
| 4 | regions split at tile midpoint and totals come from spawn holes per quadrant | `Image is not defined` | b | FAIL → PASS |
| 5 | kills are attributed to the spawn(home) region, not the death position | `Image is not defined` | b | FAIL → PASS |
| 6 | region clears at 80% kills and shows the Hell Gothic purge banner (no showPH toast) | `Image is not defined` | b | FAIL → PASS |
| 7 | stage 0 region additionally requires its Abyssal Angler dead | `Image is not defined` | b | FAIL → PASS |
| 8 | empty region (no holes, no angler) is silently cleared at init | `Image is not defined` | b | FAIL → PASS |
| 9 | gate guard kill grants +10% only to the gate region | `Image is not defined` | b | FAIL → PASS |

| # | 수정 전 실패 위치 | 실제 원인·원본 근거 | 정정 내용 |
|---|---|---|---|
| 1 | `test/ch1ProductionFinish.test.js:62–66` | `game.html:51766,52292–52294` | 옛 추출 접두어는 현재 선언과 달라 start=-1. 실제 선언과 전체 보정문을 추출하고 perspective 미제공/제공을 별도 실행 |
| 2 | `test/fdgMapSourceAdapter.test.mjs:61–62` | `engine/fdg/map-source-adapter.js:365–386,429` | 옛 PENDING 7명칭이 현재 source/authoring 분리 계약과 다름. source4+authoring8 정확 집합·분류·사유·권한 거부 검사 |
| 3 | `test/fdgMapSourceAdapter.test.mjs:185` | `engine/fdg/map-source-adapter.js:153–170` | resources.loadDrawAuthority가 engineAuthored.resourceBindings로 이동. missing/unknown 각각 정확 2필드·분류·candidate null 검사 |
| 4 | `test/regionClearGate.test.js:51,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |
| 5 | `test/regionClearGate.test.js:68,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |
| 6 | `test/regionClearGate.test.js:80,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |
| 7 | `test/regionClearGate.test.js:97,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |
| 8 | `test/regionClearGate.test.js:112,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |
| 9 | `test/regionClearGate.test.js:128,41` | `game.html:60672–60793,60794,60856` | 지역 로직 다음 브라우저 화살표 초기화 new Image()까지 VM이 실행. 실제 REGION-ARROW 경계까지만 지역 로직·배너 callback 원문을 실행 |

분류 (a)는 source JSON의 누락값을 채운 것이 아니라 이미 구현된 어댑터 계약에 테스트를 맞춘 것이다. `(d)`로 바꾸거나 skip한 실패는 없다. 미제출 실행 입력은 adapter:143–150의 field/reason/classification PENDING, :154–155/:168–169의 명시 사유로 이미 표시된다. 이번 테스트는 그 PENDING을 유지하고 candidate/project/world 승격을 거부한다. 미구현 기능을 새로 구현한 것으로 보고하지 않는다.

## 기대값 전후와 검사 보존

| 옛 기대·하니스 | 새 검사·근거 |
|---|---|
| `_moCull=_mapObjectCullBounds(` 문자열에서 추출 | 실제 `_moCull=` 선언부터 `_wvl` 전까지 원문 실행. start/end 존재 검사. 원래 enabled true/false 좌우 범위 유지+상하 범위·perspective bounds 동일 참조/값 불변 추가. `_worldViewBounds` 입력은 game:51766 optional perspective.bounds()의 미제공/제공 두 상태 |
| collision.mergedRuntimeCollision | `executionData.objectColliders` + `executionData.boundaryColliders`; 원 데이터 누락을 source 입력으로 유지 |
| start.authority | source startAuthority 미제출일 때 `engineAuthored.startAuthority`; 원 runtime START를 추측하지 않는 :382–391 계약 |
| logicalHeight.physicalZ | `executionData.logicalHeight` + `engineAuthored.heightMapping`; 원 logical0..1과 엔진 환산 Z를 분리 |
| placements.instances | `executionData.placements` |
| resources.cropWorldRect | `engineAuthored.imageLayers` (원 crop/anchor를 추정하지 않음) |
| resources.loadDrawAuthority / executionContract | `engineAuthored.resourceBindings` / `engineAuthored.executionContract` |
| 옛 필드 7개 포함 여부만 확인 | 현재 fixture의 정확 12개 집합, source4/authoring8 집합·분류·모든 reason·counts·candidate null 검사. previewProject/camera/settings 등 기존 누락까지 엄격 확인 |
| missing source의 옛 resources.loadDrawAuthority | source-format-pending + engineAuthored.resourceBindings 정확 2개/분류. unknown source는 source-format-pending + engineAuthored.executionContract 정확 2개/분류. 원래 ok=false/project=null/world=null·4MiB/8MiB·임의 approved=true 무권한 유지 |
| REGION부터 fieldboss 전까지 통째 실행 | game:60794 REGION-ARROW 전까지 **전체 지역 로직·배너·_regionTick 원문** 실행. 로직 끝 존재와 Image 생성 부재 검사. 원본 배너 DOM fixture 유지, Image/결과값 위조0. 기존 6개 지역 동작 단정 전부 유지+실제 배너 클래스·SFX·pet side effect 추가 |

AST로 정적 assert 호출을 대조했다(`L/assertion-audit.json`). production 18→23(삭제0), adapter 66→75(옛 pending assertion 2개만 위 표대로 대체), region 36→43(삭제0). 3파일 합120→141이다. 동적 루프 단정 횟수와 다른 **정적 호출 수**다. 기존 RLE/START 거부 mutation10종, header/grid/unit/source 거부8종, manifest 거부7종 및 unsafe JSON·UTF-8 budget 거부 fixture는 그대로다. 테스트명37개·skip0 유지, 실패를 skip/TODO/조건부 통과 처리하지 않았다.

## 실행 수치와 변형 진단

| 실행 | 전 | 후 | 원로그 |
|---|---|---|---|
| 지정 맵 Node 5파일·37개 | 28/9, exit1 | **37/0, exit0**, skip0 | baseline-map-37 / after-map-37 / final-map-37 stdout·stderr |
| production (5) | 4/1 | 5/0 | 위 TAP |
| authored layout+geometry (17) | 17/0 | 17/0 | 위 TAP |
| adapter (8) | 6/2 | 8/0 | 위 TAP |
| region (7) | 1/6 | 7/0 | 위 TAP |
| 추가 FDG source 16파일·91개 | **88/3**, exit1 (main 원문 별도 사본) | **88/3**, exit1 (작업본), skip0 | baseline-related-source-suite / related-source-suite stdout·stderr·result.json |

검사 약화 확인은 원본을 수정하지 않고 외부 격리 사본에만 변형 후 실행했다. 각 사본은 finally에서 바이트 복원했다. 아래 예상 실패는 PASS 집계에 섞지 않는다.

| 변형 | 검출 실패 수 | 종료 |
|---|---|---|
| overview zoom 보정 무효 | 1 | 1 |
| perspective bounds 권위 제거 | 1 | 1 |
| 지역 clear 임계 .8→.9 | 2 | 1 |
| 처치 귀속 home→death | 4 | 1 |
| pending 분류 전부 SOURCE_INPUT | 2 | 1 |
| 미제출 candidate null→{} | 2 | 1 |

세부 OLD/NEW와 stdout은 `L/mutation-results.json`, 각 변형명 `.stdout.log`에 있다. 제품 소스/데이터 변경이 없어 Godot 제품 회귀는 실행하지 않았다. 이 보고서는 Godot/실플레이/PC 검증 통과를 주장하지 않는다.

## 추가 source 회귀에서 발견한 별개 선재 실패 (수정하지 않음)

이번 9건 밖의 다음 3건은 **main 원문 사본에서도 같은 테스트명·같은 오류**로 재현됐다. 확대 검사의 신규 실패0이다. 테스트·제품을 추가 수정하지 않고 OLD/NEW 제안을 남긴다.

| 위치 / 테스트 | 첫 오류와 근거 | OLD / NEW 제안 |
|---|---|---|
| test/fdgSourceReadabilityRuntime.test.mjs:62,68 · new shaded south walls reuse bounded soil UV and one cache while authored input, source height and source pending survive | `2024 !== 2208`. engine/fdg/source-preview-height-ground.js:77–81은 commands가 있으면 paint 대신 저장, :120–123은 wall commands 저장, :132는 deferred wall까지 총 triangles로 집계. 캐시의 floor 2024와 wall184 포함 total2208을 혼동 | OLD cache texture.length == totalTriangles. NEW cache floor=total−wall를 엄격 확인하고, deferred 실제 wall draw184·UV·정렬·cache 재사용을 별도 검증. 단순 기대 숫자2208→2024 교체 금지 |
| test/fdgSourceSceneContract.test.mjs:150,153 · source inputs and engine authoring pending stay classified, with no source physical Z or fixture candidate | `4 !== 6`. adapter:365–386,429의 source4/authoring7(preview 제공)과 옛6/5 차이 | OLD source6/authoring5. NEW 정확 source4+authoring7 필드 집합·분류·START/이미지 권한·후보 거부 검사. 수만 줄이지 않기 |
| test/fdgSourceSceneContract.test.mjs:178,191 · native-v2 raw-byte overlay preserves VISUAL placement207/brightness1.08 without fabricating collider/START | `assert.ok(result.sourceRequired.some(item => item.field === 'executionData.startAuthority'))` 실패. adapter:382–391은 native START 미제출 시 승인 design START를 ENGINE_AUTHORING으로 구분 | OLD executionData.startAuthority 반드시 sourceRequired. NEW engineAuthored.startAuthority PENDING+native runtime UNKNOWN+candidate 거부와 승인 설계 주입 경로를 각각 확인 |

이 3건은 WORK_BOARD에 새 제품 소유권을 주장하지 않고 후속 검토 자료로만 전달한다. 공유 exporter 2개는 사용자 금지에 따라 제안·수정 모두 이번 9건에 필요없다. CH-MAP-PIN의 main_sha 출처 버그와도 원인이 다르며, 이번 source/authoring namespace·Node 브라우저 초기화·문자열 추출 경계 문제를 SHA 핀 완화로 처리하지 않았다.

## 변경·보존·마감

| 항목 | 결과 |
|---|---|
| 수정 파일 | 테스트3 + 이 보고서 + CHANGELOG_SYNC 맨 위 절 + WORK_BOARD 자기 행 |
| 공용 추출 도구 | export_ch1_area_source.mjs / export_ch2_area_resources.mjs **0줄**, SHA-256 전후 동일 |
| 제품·원본 | engine/fdg/map-source-adapter.js / game.html / map.json / godot scripts·Main/State/저장 **0줄**. `protected-before.json`과 최종 hash 대조 |
| 원본 에셋 | 새 파일·이미지 생성/편집0; sparse readonly layout/geometry 참조. 대용량 웹 에셋 수신0 |
| docs 검색 | `rg` 관련 키워드 전체 docs 검색. L/docs-keyword-search.log. TRACE_MAPS의 옛28/9는 당시 검수 이력으로 유지, 현행 정정은 이 보고서/CHANGELOG/자기 작업판에 기록 |
| 선재 문서 상태 | 기준 main CHANGELOG_SYNC 맨 위에 이미 충돌 표식이 존재함. 타 작업 이력은 손대지 않고 이번 절만 맨 위 추가. 해당 상태를 해결했다고 주장0 |
| 제출·정리 | 정상 docs-sync pre-commit(우회0), 자기 브랜치 일반 push·원격 SHA 일치 → L/DONE.txt 작성 → 자기 worktree 제거. 실제 SHA·제거 결과는 외부 DONE/receipt에 기록 (자기 commit hash의 재귀 삽입 없음) |
| R 불변 | R 시작 branch/head·tracked INDEX/WORK 보존을 최종 receipt와 대조. main push/force/reset/rebase/add -A 0 |

MAP PRODUCTION REPORT: MASTER PLAN=기존 9실패 진단; geometry/nav/collision/placement/render 변경0; CAMERA QA/TECH 외 실창 미실행; TECH=맵37/0, 확장88/3 선재 동일; 기존 CH1 시각 FAIL은 별도 MAPLOOK 과제다. **VISUAL VERDICT: FAIL (기존 판정 유지·이번 시각 검수 미실행).**
