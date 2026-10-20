# P3-001 PC — pit_poison 타원 충돌 계약

2026-10-20. 상태: **구현·기술 검증 완료 / 총괄 검수·커밋 대기**. 실창 시각 검수·원격 보존 완료를 뜻하지 않는다.

## ① 원본 근거와 적용 범위

| 항목 | 이 worktree의 원본 행 | 값 / 소비 |
|---|---|---|
| 원본·브랜치 | `game.html`, 기준 HEAD `f1df29a86dc3966bab87a7f4910ae6819e167294` | `codex/p3-001-pc-20261020`; 원본 game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 동측 웅덩이 배치 | `game.html:18166` | tile `[162,139]`; `(tile+.5)×40` → 그림 기준점 `[6500,5580]` |
| 충돌 메타 | `game.html:18407` | `sz:200,collision:true,colW:80,colH:58,colOy:7` |
| 반경 / offset | `game.html:31686`, `31711` | scale1에서 X/Y 반경 `[80,58]`; colOy를 Y에 한 번 적용 → collider 중심 `[6500,5587]`; 제곱합 `<1` |
| 이동 검사 | `game.html:31712` | 기존 네 모서리 `canMv` 그대로. Q/E·입력·세이브 변경0 |
| 추출 기본 장면 | `game.html:4746–4747`, `30271` | 빈 URL query/비활성 QA storage에서 두 원본 initializer를 그대로 평가. 독립 QA scene gate false |
| Godot 실제 소비 | `world.gd:3123–3139`, `3186–3189`, `3199–3204` | 기존 분석식·128점 내접 물리 다각형·네 모서리 이동 소비. 이 공용 파일 수정0줄 |

`applyMapSourceHandColliderDelta`는 이전 원80 계약을 거부하고 명시 타원 계약을 받는다. resolution의 finalMeta/colW/colH/colOy/colliderDim과 addedCollider가 모두 80/58/7에 일치해야 한다. `effectiveWorld`는 offset 전 `[6500,5580]`이며 canonical에만 +7을 적용한다. 기존 v6 prefix13(원11·타원2), corpse2 비충돌, PARTIAL/전체수 UNKNOWN, 불변 snapshot, 재적용 거부는 유지한다. 추가 후 subset14=원11·타원3이다.

Godot 전체 prop collider19는 원15·타원4다. `map.json`의 pit collider1, pit metadata의 colW/colH/colOy, 범위별 출처 `source.collider_updates`만 변경했다. 그림 배치36개·지형40000타일·기존 다른 collider18개·hill·시작/출구·기존 PNG는 그대로다. 기존 `source.root/game_sha256`은 전체 base 추출의 출처로 보존하고 이번 pit 갱신의 source/exporter SHA와 행은 별도 update에 기록했다. 세이브 스키마 변경이 아니다.

## ② 변경 파일 / 소유권

| 변경 파일 | 내용 |
|---|---|
| `engine/fdg/map-source-adapter.js` | 명시 타원 gate·primitive·binding·inspection·분류 수 동기화 |
| `godot/tools/export_world.mjs` | 현재 원본에 추가된 scene gate의 미정의 ReferenceError 수정. VM에 빈 query/비활성 storage 환경을 주고 원본 initializer 두 개를 평가 |
| `godot/data/map.json` | pit 전용 재추출값 및 범위별 SHA 출처 인수 |
| `test/fdgNativeHandColliderDelta.test.mjs` | 타원 통과·4방향 sweep·옛 북쪽 원형 띠 개방·잘못된 축/offset/중심/분류 수 거부 |
| `test/fdgNativePitPoisonSource.test.mjs` (신규) | 실제 웹 AST의 배치/metadata와 Godot 데이터 비교·원본 PNG byte 비교 |
| `godot/tests/test_p3001_pit_poison.gd` (신규) | 실제 World·실제 물리 body/128점 shape·분석식·이동·direct-space 조회 |
| `docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` | MAP-021 결정/현재 검증 상태 |
| `docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` | MAP-021 Godot 연동·범위 밖 보류 |
| `docs/engine/FDG_HAND_COLLIDER_DELTA_V7.md` | 최신 schema/수치·과거 원형 검증 분리 |
| `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` | map payload SHA·분류 수·범위별 출처 |
| `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md` | P3-001 상태와 공통 충돌 계약 행 |
| `docs/engine/FDG_ENGINE.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_INTEGRATION_INTERFACE.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_MAP_SOURCE_SCENE.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_OPTIMIZATION_STUDIO_20261010.md` | 공통 pit 계약 행·기존 시점 검증 분리 |
| `docs/engine/FDG_QA_20261010.md` | 공통 pit 계약 행·기존 시점 검증 분리 |
| `docs/engine/FDG_RUNTIME.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_SOURCE_SCENE_EXECUTION.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_SOURCE_VISUAL_PREVIEW.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_TERRAIN_SCENE.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_WORLD_MAP_WAYPOINT.md` | 공통 pit 계약 행 |
| `docs/engine/FDG_WORLD_TRANSITION.md` | 공통 pit 계약 행 |
| `docs/engine/orders/WORK_BOARD.md` | 사용자 PC 재배정·소유권·검수 대기 |
| `docs/engine/orders/reports/P3-001_REPORT.md` (본 보고서) | 근거·실행·보류·Git 상태 |

공용 `main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd` 변경 **각0줄**. 레슨·Q/E·보호 문서·원본 `game.html` 변경0. 작업 시작 시 tracked INDEX/WORK는 모두 비어 있었다. 임시 baseline 사본·도구·로그와 byte 검증한 acorn8.16.0 dependency10파일은 Git 인수 대상이 아니다.

## ③ 테스트 명령·수치·로그

로그 루트 `L=G:\exoduser-wt\codex-p3-001\_out\P3-001-pc\`. 요청된 `G:\exoduser-wt\_out\P3-001-pc\`는 샌드박스 writable root 밖이므로 이 worktree 안에 보존했다. C 드라이브에 큰 산출물 생성0. 아래 경로는 L 기준이다. 실행별 전체 명령/인수·종료코드는 대응 `.command.json`에 있다.

| 실행 | 실제 명령 / 조건 | 결과 | 원로그 |
|---|---|---|---|
| 버전 | 지정 Godot binary `--version` | `4.7.2.stable.official.ed1daf0bf` | `godot-version.out` |
| Node delta RED | `C:\nvm4w\nodejs\node.exe --test test/fdgNativeHandColliderDelta.test.mjs` | 4검사 중3실패/1통과. 원형 전용 gate가 새 타원을 거부 | `node-red.out` |
| Node delta GREEN | `C:\nvm4w\nodejs\node.exe --test --test-concurrency=1 test/fdgNativeHandColliderDelta.test.mjs` | **4/4 통과** | `node-delta-green.out` |
| Node 실제 웹/Godot RED | `C:\nvm4w\nodejs\node.exe --test test/fdgNativePitPoisonSource.test.mjs` | source/data1실패·PNG byte동일1통과. 기존 data는 circle/[6500,5580]/[80,80] | `node-source-red-after-dependency.out` |
| Node 실제 웹/Godot GREEN | `C:\nvm4w\nodejs\node.exe --test --test-name-pattern=Godot.pit.collider test/fdgNativePitPoisonSource.test.mjs` | 이전 실패1개만 **1/1 통과**. 이전에 통과한 PNG검사는 반복하지 않음 | `node-source-green.out` |
| Node 기존 collision runtime | `--test test/fdgNativeHandColliderDelta.test.mjs test/fdgSourceNativeCollisionRuntime.test.mjs test/fdgMapSourceAdapter.test.mjs` | collision runtime **4/4 통과**. broader adapter는6/8; 이 동시 실행에서 delta 파일 단위 실패1회(개별 원인 미확정), 이후 해당 delta만 단독4/4 위 확인 | `node-green.out` |
| 기존 adapter 실패 기준선 | 변경 전 HEAD adapter를 별도 파일에 추출하고 동일 테스트의 import만 baseline 사본으로 지정 | **기준선6/8**, 현행과 같은2실패. 실패는 `partial source inspection...`(:42), `missing/unknown source...`(:179)의 pending 기대값. 본 작업 범위 밖, 검사 약화/수정0 | `node-adapter-baseline.out` |
| Godot RED | 사용자 지정 Bash helper, `test_p3001_pit_poison:EXODUSER-P3-001-PC-Isolated-20261020` | 테스트 child exit1,62검사/29실패. helper 자체 exit0는 PASS로 쓰지 않음 | `godot-red/test_p3001_pit_poison.out.log`, `.err.log` |
| Godot GREEN | 지정 binary `--headless --path <worktree>/godot --log-file <L>/godot-pit-green.engine.log --script res://tests/test_p3001_pit_poison.gd` | **195/195 통과**,20 analytic points·12 four-corner positions·10 native physics points. Main0·save0 | `godot-pit-green.out`, `.err` |
| Godot 기존 map 회귀 | 같은 binary/격리/로그 조건, `--script res://tests/test_contracts.gd -- --only=map` | **map1/1**, failed_assertions0 | `godot-map-regression.out`, `.err` |

Godot 실행은 모두 격리 이름 `EXODUSER-P3-001-PC-Isolated-20261020`을 사용했고 `override.cfg`는 종료 후0byte다. Main을 부팅한 테스트는 없다. 최초 helper의 user:// 로그 쓰기는 샌드박스 때문에 실패하여 후속 실행에서 `--log-file`을 L 안으로 지정했다. GREEN 양쪽 stderr에는 OS root certificate store 읽기 오류가1건씩 남는다. 테스트 assertion 실패와 구분하며, 경고 없는 실행이라고 보고하지 않는다. 실제 저장 폴더는 사용하지 않았다.

worktree에 node_modules가 없어 최초 AST 검사에서 acorn 로딩 오류가 났다(`node-source-red.out`). 기존 설치본 acorn8.16.0만 읽어 이 worktree에 byte동일 복사한 뒤 source/data 불일치를 재현했다. manifest `acorn-readonly-copy.json`; `G:\exoduser`에 쓰기0, 의존성/lockfile 변경0.

### 재추출·무관 변경 차단

| 항목 | 실측 / 산출물 |
|---|---|
| 추출 명령 | `C:\nvm4w\nodejs\node.exe <L>/reextract/tools/export_world.mjs G:\exoduser-wt\codex-p3-001 <L>/export-evidence` — exporter 원문을 별도 tools에 byte동일 복사하여 출력도 별도 폴더로 격리 |
| 최초 추출 실패 | `_FDG_RUINED_FOREST_FIRST` 미정의. `extract-run.err` 보존. 원본 기본값 평가를 추가한 뒤 exporter는 정상 종료 |
| 전체 추출 결과 | tiles40000/wallRects292/props36/propColliders19/chunks64. 원본→별도 output PNG92개 전부 byte동일. `reextract.out`, `export-evidence/export-receipt.json` |
| 전체 인수 차단 | 다른 나무4개의 texture/metadata 합8필드 및 기존 Godot 대비42청크+신규 나무4PNG 차이 발견. 범위 gate가 거부(exit1)하여 전체 map·PNG 인수0. `reextract-comparison.json`, `extract-source-default-gates.err` |
| 범위별 인수 | 재추출 pit collider1/meta만 기존 map에 반영. geometry/배치/다른 collider/원본 base 출처의 예상 외 차이0. `scoped-adoption.json`, `scoped-adopt.out` |
| map SHA256 | 이전 `ce740d386d6bc6bc80666657b2de7ba2fe7fbb94077977f7ac40832f8ad543a3` → 현행 `f575d96bd819b00fcf31b92561b63cb08f1f19f21e2d0f1e646e194ebd94bb9e` |
| tile byte SHA256 | `655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa` 전후 동일 |
| prop_colliders compact JSON SHA | `e7df9c7056742a1cd2de4e0379b16b7658024b1b8227f00e0c535c36cd651970` |
| props compact JSON SHA | `c2f9c4ecc72214e67c3ddaa9f36cbe3e4ab31731c7e224e90eb12bc330030971` |
| 코드·docs 감사 | docs 전체 `pit_poison/MAP-021` 및 구 contract 키워드 검색. `docs-keyword-scan.out`, `final-audit.json`; `git diff --check` 통과. 과거 제작 이력·백업을 현행 검증으로 바꾸지 않음 |

복제 PNG staging은 byte 검증·receipt 보존 뒤92개/146,655,111byte를 정리 완료했다(`cleanup-receipt.json`). 재추출 map/기존 map backup·원로그·비교 영수증·baseline adapter/테스트 사본은 L에 보존한다. 기존 Godot PNG 및 사용자 실행창/localhost:3333 조작0, 새 runtime asset/import 없음.

## ④ 커밋 SHA·원격 상태

| 항목 | 상태 |
|---|---|
| 현재 브랜치 | `codex/p3-001-pc-20261020` |
| 기준/현재 HEAD | `f1df29a86dc3966bab87a7f4910ae6819e167294` |
| 신규 commit SHA | **미생성 — 커밋 대기** |
| fetch | 1회 실패: `G:/exoduser/.git/worktrees/codex-p3-001/FETCH_HEAD: Permission denied`. 최신 원격 main 확인 미완료. 재시도/권한 우회0 |
| stage | 경로 지정 `git add -- <소스/docs21개>` 1회, exit128: `Unable to create G:/exoduser/.git/worktrees/codex-p3-001/index.lock: Permission denied`. `git-stage.err`, `git-stage.command.json` 보존. INDEX는 빈 상태 유지 |
| commit/push | stage 권한 실패 뒤 추가 mutation/재시도0. commit·push 미실행, 신규 SHA 없음. 총괄이 ②의24개 경로를 인수 |
| main/원본 체크아웃 | 병합·main push·강제 push·브랜치 전환·원본 체크아웃 수정0 |

커밋 대기: 변경 파일 목록은 ②의24개 경로 전체다(소스·테스트6개+docs18개). tests3개는 `git add -f -- <각 경로>` 대상이며 override/log/backup/dependency는 커밋하지 않는다. 로컬 결과를 GitHub 백업 또는 PC/Mac/main 통합 완료로 보고하지 않는다.

## ⑤ 남은 것 / 정직 정지

- 총괄 검수·본 브랜치 커밋/push·원격 SHA 확인·main 통합은 미완료다.
- 원 v7 producer JSON(`MAP/ch1-1.hand-meta-two-types.delta-v7.json`)은 저장소에 없어 실제 producer 재발행·조립된 preview 설치/실보행은 미검증이다. adapter의 명시 fixture 검증과 Godot의 실제 원본 재추출/World 소비를 구분한다.
- 기존 adapter pending 기대값2실패는 동일 HEAD 기준선에서도 재현된다. 동시 Node runner의 delta 파일 실패1회 원인은 미확정이며 단독4/4와 원로그를 함께 남긴다.
- 범위 밖 나무·청크 에셋46차이는 인수하지 않았다. `world.gd:65`의 과거 canonical source-meta snapshot은 물리 map_data와 별개로 보존했다. 전체 최신 웹의 모든 시각/메타 이식 완료를 주장하지 않는다.
- 실창 이동·카메라·시각·전투 검수 및 전체 물리 타원 동등성은 미검증이다. 기존128점 내접 근사 자체는 변경하지 않았다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / P3-001 pit_poison 계약·데이터 이식
MASTER: silhouette/regions/main route/side spaces = 기존 base 보존
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes = 변경0, 새 시각 검수 없음
LARGE: source assets/composites/overlap/repeated silhouette = 신규 제작·인수0
MEDIUM: connections/remaining holes = 변경0, 새 시각 검수 없음
GROUND: shadow/contamination/structure integration = 변경0, 새 시각 검수 없음
PLAYABLE: arenas/travel/breathing/threat = 변경0; pit 타원 소비 검증; combat readability 미검증
LANDMARK: primary/secondary/tertiary = 변경0
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT = 실창 미검증
TECH QA: route=기존 map 계약1/1; collision=195/195; pageerror/404/seam=해당 실행 미측정
TECH QA: loading=World ready 확인; performance=미측정; 전체 physical parity=false
FILES: stage-owned=pit 계약·데이터·테스트·관련 docs; concurrent common scripts=0줄; unrelated=0
GIT: staged=권한 실패/INDEX 비어 있음; commit=미생성; push=미실행; deploy=미실행
VISUAL VERDICT: RETOUCH (기존 전체맵 판정 유지, 이번 실창 미검수; 기술 PASS로 승격0)
NEXT PASS: 총괄 Git 인수·실창 웅덩이 네 방향 접근/우회 검수; 범위 밖 시각 차이 별도 배정
```
