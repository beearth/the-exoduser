# FDG RIFT 첫 제출물 — 최초 엔진 소비 검수

> 현행 후보는 R10이다. 아래 최초 후보/r2는 동결 이력이며 현재 판정은 마지막 R10 표를 따른다.

2026-10-10, Asia/Seoul. **기술 소비 PASS / 완성 맵 VISUAL VERDICT: FAIL.**

현재 엔진 `4ac9f2e4`의 FDG v0.5 실제 파일 import·FDGRuntime로 새 후보만 검수했다. 엔진 기능/자산/맵을 추가하지 않았다. MAP 제작 완료·production 채택·stage LOCK 일치·전체 구간 이동/전투·save/reopen·GPU/실기 성능을 승인한 보고가 아니다.

## 후보·실행·원본 보존

| 항목 | 실제 값 / 경계 |
|---|---|
| 후보 | `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/rift-first-slice.fdg.json` |
| 검수 SHA256 | `559c913ab4be2ae94d45cfc174150986e24fc4a85bebdc70af0535f16a3e3d11` |
| 크기 / ID | 121862bytes / `rift-first-slice-20261010` / schemaVersion1 |
| 제출 stage | `hell-rift`, 지옥의 틈의 자기소유 non-locked 첫 구간이라는 manifest 선언. **승인 원본/LOCK 일치 미확인** |
| 좌표 | START tile(100,193) / EXIT tile(100,43), 200×200/T40, 아래→위 유지 |
| 타일 | floor1=1192 / blocked0=38808, objects0 |
| 실제 구조 검증 | validateProject ok=true/errors0, 연결 경로267셀, BFS visited1185 |
| provenance 차이 | 제출 manifest/JSON routeVisited1182. FDG 검증기의 실제 방문수1185와 다름; 후보 값은 수정하지 않음. 승인 원본 비교/기하 변경의 증거로 해석하지 않음 |
| API 서버 | 기존 Node PID12319/server.cjs3333, cwd `/Users/fordeargamers/the-exoduser` 확인. 서버 생성/재시작/3387 접근/빌드/설치0 |
| 격리 | 제공 Playwright+설치 Chrome headless의 새 context1600×1100. 사용자 브라우저/main/project localStorage 접근·덮어쓰기0 |
| 문서 선행 | EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 전체, _MAP_SSOT_INDEX, 후보manifest. 현재repo에서hell-rift별도LOCK/sourceScene absent 확인 |
| 원본 보존 | 검수 전후 후보·manifest SHA 동일. MAP JSON/manifest·엔진코드·원PNG·ROOT R·기존 완료suite 수정/재검사0 |
| 프로젝트 저장 | freshcontext localStorage keys 전/후 모두[], 저장 버튼 사용0. 후보 save/reopen 검수는 이번 범위 아님 |

## 새 후보의 실제 소비 4개

| 확인 | 결과 / 근거 |
|---|---|
| 실제 파일 import | PASS. file-input으로 원본 bytes를 가져온 후 window.FDGStudio.project와 후보 전체 JSON deepEqual |
| 참조 로드·첫 장면 | PASS. 현재 소비 참조1개 `img/exoduser_warrior/south.png` ready1008×48, assetErrors0. 절차 VFX는 이미지 참조 없음 |
| 플레이어·카메라 | 실제 START world(4020,7740), radius15. runtime CSS1090×750, camera(4020,7625)/followtrue. 월드높이8000과 viewport하단 clamp로 cameraY는 playerY와 다름 |
| play / 충돌 / pause | PASS. 기존 UI Play, 서쪽 실제 blocked tileX97 경계x3920으로 이동; 원형반경15에 의해 playerX3940에서 정지, y7740 유지. 0.5666667초 시간진행, Pause 뒤120ms 시간/위치 고정 |
| 한 틱 | PASS. 정지 후 같은FDGRuntime Step, 시간+0.01666666666666672초 / updateSteps+1 |
| 오류 | candidate import 이후 pageerror0 / HTTP400이상·실패요청0. 참조1개 준비확인. 초기defaultStudio 전체 에셋 검수나 기존 PNG suite 재실행 아님 |
| 파일 원본 / 이력 | 입력파일·manifest 불변, runtime만 진행. 새 캐릭터/geometry/collision/자산 생성0 |

처음 검토 runner가 START 북쪽을 바로 blocked로 잘못 가정하여 충돌 기대값을 실패시켰다. 후보 타일상 북쪽은 보행 가능이었다. 엔진/후보를 변경하지 않고 서쪽의 실제 tile0 경계로 검토 조건을 고쳐 위 최종4개를 확인했다. 초기 잘못된 기대값 기록은 `report-initial-review-assumption.json`, 최종 정본은 `report.json`이다.

## 제출된 리소스 수치 — 현재 후보만

| ID / 경로 | 제출값 / 적용 위치 |
|---|---|
| ch-warrior | name=남전사(기술프리뷰스틸), speed320px/sec, radius15px |
| sprite | src=img/exoduser_warrior/south.png, frame48×48, columns21/rows1/frames21/fps24, scale1/anchorX.5/anchorY1 |
| animations.idle | row0/start0/frames1/fps1/looptrue |
| animations.walk | row0/start0/frames21/fps12/looptrue, 현재확정전사walk8셀/start2와불일치 |
| sk-preview-strike | name=프리뷰타격(비SSOT), cooldown1초/cost0/range120px/damage0, vfx=vfx-rift-ember |
| vfx-rift-ember | name=틈잔불, kindburst/color#c0531f/count24/life.6초/speed200px/sec/size8px/spread6.28rad, image참조없음 |
| preview | characterId=ch-warrior/skillId=sk-preview-strike/vfxId=vfx-rift-ember, resourceMax100/resourceRegen10/sec |

이값들은제출된기술후보자료이며production게임SSOT수치나품질승인으로승격하지않는다. 원본값은그대로소비·보존했다.

## 실제 첫 화면

- [런타임 첫 카메라](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/first-runtime-canvas.png) — 실제 FDGRuntime 캔버스, START 배치·타일 단색 바닥·blocked 격자·기술 캐릭터만 보임.
- [첫 런타임 UI 전체](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/first-runtime.png) — Play 상태·인스펙터·현재 노드 소비 UI.
- [가져온 후보 overview](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/imported-overview.png) — 연결된 굽은 단일 채널과267셀 경로. 완성 맵 artwork 아님.
- [구조/경로 결과](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/validation.json), [실제 소비 결과](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/report.json), [한정 재현 runner](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-first/review.mjs).

위 화면을 직접 보았다. tile0는 충돌 표현일 뿐 외곽 질량의 원화가 아니다. 전사/일부 바닥 이외는 격자와 빈 어둠이며 큰 환경 mass·접합·랜드마크가 읽히지 않는다. 소비가 성공해도 production 맵 승인으로 세지 않는다.

## 정확한 미구현·누락 / 최소 다음 조치

| 항목 | 현재 사실 | 다음 후보에 필요한 최소 조치 |
|---|---|---|
| 외곽/바닥/landmark 자료 | 후보objects0, 환경 그림 참조0. sourceScene·clean-plate/abyss/resident-atlas는 provenance 설명이고 runtime소비 필드가 아님 | MAP 소유자가 같은 구간의 실제 mass/ground/landmark 시각자료를 제작·제출하고 소비 참조를 명시. 현재 전체이미지src를 쓰는visual-only objects는 기존 계약으로 가능 |
| source/LOCK | 지정 `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json` 및 hell-rift별도LOCK이 이repo에 없음 | 승인 원본/해당stage LOCK의 접근 가능한 정본 경로를 별도 제공. ROOT R 자동copy/merge나 추측한LOCK 생성으로 해소하지 않음 |
| crop/mask | 기존map.objects는 src/scale/layer/collisionfalse, crop rectangle/mask consumer 없음. 현재objects0 JSON의import를 막는 오류는 아님 | atlas crop/mask가 필수인 실제 다음 후보라면 필드·원본·출력좌표 계약을 명시한 별도요청으로 검토. 이번 검수에서 adapter/가짜PNG 추가0 |
| 캐릭터 클립 | 후보idle start0/1셀/1FPS, walk start0/21셀/12FPS. 현재 전사 확정walk start2/8셀(기존idle2/attack8 등)과 다름. 전체21셀을걷기로해석하는근거없음 | MAP 다음revision에서기술스틸로고정할지확정walk범위를쓸지정정, 승인된기존clip의의미보존. 엔진은입력된21/12를그대로소비하며자동교정하지않음 |
| 24장/24FPS 목표 | sprite선언21셀/24FPS이나 실제animations FPS가idle1/walk12이며게임용24장확보가아님 | 기존자산에가짜셀복제나프레임의미발명0. 게임용캐릭터 제작목표와기술후보를구분 |
| UI 라벨 | overview의CH1표시는기존기술UI 고정라벨, 실제project.provenance.stage는hell-rift로보존 | stage별표시정리는별도UI작업. 후보를CH1 LOCK으로이관하는근거아님 |
| 관측 한계 | 첫카메라/START서쪽벽/기존고정틱만실행. 전체route실제주행·allcamera/combat/seam/SFX/GPU 미검수 | MAP 그림이제출된후그후보의필요camera/전투가독성·최초소비만새검수 |

현재 JSON을 소비하는 데 필요한 엔진 수정은 **없다**. 위 누락은 지금 후보에 없는 생산 미술/자산·원본/LOCK·클립 의미 계약이며, 이 최초 소비 검수에서 임의 확장하지 않는다.

## MAP PRODUCTION REPORT — §23

| 구분 | 항목 | 이번 관측 / 경계 |
|---|---|---|
| STAGE | 대상 | Hell Rift FIRST SLICE 외부UNADOPTED후보, 기술consumer첫검수 |
| MASTER | silhouette / regions | overview는굽은단일채널, manifest의입구/전투/출구3구간. 실제centre전투basin 미술/전투QA미실행 |
| MASTER | main route / side spaces | tileSTART(100,193)→EXIT(100,43)267셀연결. 독립side pocket·productionregion정합성미확인 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | tile0/격자로만표시, 실제환경mass없음. 단일보행연결이시각구멍없음을증명하지않음 |
| LARGE | source assets | 후보실제참조는전사시트1개뿐, 환경원화포함0 |
| LARGE | composites / overlap / repeated silhouette | 제작/배치0, 시각환경composite없음 |
| MEDIUM | connections / remaining holes | 타일경로연결만확인, 환경질량접합없음 |
| GROUND | shadow / contamination / structure integration | 기본캐릭터그림자/단색타일만, 실제바닥오염·접합·painted/bakedconsumer없음 |
| PLAYABLE | main arenas / travel space / breathing space | START기술이동·벽정지관측. 전체구간/arena/breathing평가미실행 |
| PLAYABLE | threat space / combat readability | 실제enemy/피격/projectile/parry/SFX/loot소비0, 미관측 |
| LANDMARK | primary / secondary / tertiary | 후보objects0, 실제표현없음 |
| CAMERA QA | START | 첫runtime캔버스와UI직접확인, 제출START/owner하단clamp보존 |
| CAMERA QA | EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 이번최초화면검수범위밖, 미관측 |
| TECH QA | route | 구조연결PASS267셀/visited1185; 원본stageLOCK/nav일치미확인 |
| TECH QA | collision | START서쪽tile0에radius15이동제한확인. 전구간collision/원본게임collision검수아님 |
| TECH QA | pageerror / 404 | candidate phase pageerror0/HTTP에러·requestfailed0, 현재참조image1 ready |
| TECH QA | seam / loading / performance | image1준비/첫renderPASS, productionchunk/seam/GPU/VRAM/native/FPS성능인수미실행 |
| FILES | stage-owned | E/engine-preview-first의검수script/JSON/PNG/보고서만. 후보JSON/manifest불변 |
| FILES | concurrent touched / unrelated touched | MAP 담당의제작범위불변, 기존repo의marketing/sound/backup/output변경보존 |
| GIT | staged / commit / push / deploy | 엔진code stage/commit0, 문서검수기록만별도로기록; push/deploy0 |
| VISUAL VERDICT | 완성 맵 | **FAIL** — 실제외곽/바닥/landmark 그림없음. technicalimport/runtimePASS와분리 |
| NEXT PASS | 다음 | MAP소유실제mass/ground그림과참조·LOCK/clip정정후제출. ROOT요청시그새후보의최초소비/카메라검수 |


## 새 시각 후보 — 환경 판 첫 로드·배치 검수

기존 기술 후보와 별도의 `rift-first-slice.visual.fdg.json` 최초 소비다. **구조 import PASS / 환경 로드 FAIL / 실제 이미지 정렬 NOT_OBSERVED / VISUAL VERDICT: FAIL.** 엔진 기능·MAP 원본 변경 없이 기존 v0.5에서 확인했다.

| 항목 | 새 후보 실제 결과 |
|---|---|
| ID / 크기 / SHA256 | `rift-first-slice-visual-20261010` / 122638bytes / `783891c6bf5f9e92562896ed0d999ff87ba8e57b142f87d13bb6bce63ff62e1e` |
| manifest SHA256 / 상태 | `c210f8d97c7330b49d8e15aed4b1fa5898c046821b2a1058e8e3d046dd17fb1b` / UNADOPTED·production LOCK 미연결 유지 |
| 구조 / 실행 | file-input import 후 전체 JSON 일치, errors0. 이미지 실패에도 Play running=true, 대체 표시 사용 |
| 소스 | `assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png`, `assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png` 둘 다 현재 repo absent·실제 HTTP404 |
| 오브젝트 | env-abyss-depth/env-painterly-mass, 각 tile(100,100)/scale4.1667/back/collision=false. 동일 좌표의 <5타일 경고 유지 |
| 선언 치수 / 계산 경계 | manifest1920×1920에 따른 world8000.064×8000.064px, 발 앵커(4020,4020), rect(19.968,−3980.064)→(8020.032,4020). 이미지 실제 치수·알파 미관측 |
| 카메라 | START tile(100,193)/world(4020,7740)/camera(4020,7625), 진단 중간 tile(158,118)/world·camera(6340,4740), EXIT tile(100,43)/world·camera(4020,1740). 1090×750 캔버스 직접 확인 |
| 배치 한계 | 선언 사각형은 START·진단 중간점을 제외하고 EXIT를 포함. 이미지 중심으로 tile(100,100)을 해석할 수 없음. 첫 전투공간의 명시 좌표가 없어 중간점을 전투 검수로 세지 않음 |
| 오류 / 보존 | pageerror0/HTTP404 2/assetErrors2, source·manifest bytes 불변/localStorage keys[]. 타일·START·EXIT 유지, engine/MAP/PNG 변경0 |
| §23 / 증거 | [새 시각 후보 보고·MAP PRODUCTION REPORT](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-visual-first/engine-review.md), START/진단 중간/EXIT PNG와 report.json. 환경 미로드·완성맵 FAIL |
| 다음 소유 작업 | MAP이 접근 가능한 기존 PNG 정본 참조·발 앵커 기준 배치·첫 전투 좌표를 제출. ROOT R 자동 복제·추측한 파일/LOCK·MAP 자동 교정0 |
| 범위 | 기존 완료 suite/PNG/경로/충돌 재검수0, 새 서버/빌드/설치0. 문서 기록만 로컬 commit, push/deploy0 |


## r2 정본 환경 자원 최초 소비 — 실제 배치 관측

**기술 소비 PASS / VISUAL VERDICT: FAIL.** 승인 정본 두 파일만 기존3333의 새 격리 Chrome context에서 두 정확 URL로 바인딩했다. 기존 checkout 자원/서버/엔진을 수정하지 않았다.

| 항목 | 실제 r2 결과 / 범위 |
|---|---|
| 입력 / SHA256 | rift-first-slice.visual.r2.fdg.json122903bytes / `a765784dcf1d5928e790aee63079bf0c4fcc61f45d1da3ae6d165500064b444a`, visual-r2.manifest.json·visual-r3-findings.manifest.json |
| 정본 참조 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png`와 같은 디렉터리의 `hell-rift-painterly-v2.png` 두 파일만 읽음 |
| 실제 로드 | 두 정확 projectSrc 요청을 정본 bytes로200 응답한 한정 fixture2bindings. 두 환경 natural1920×1920/ready/assetErrors0/pageerror0/실패요청0 |
| clip 범위 | idle start0/frames2/fps1, walk start2/frames8/fps12를 입력 그대로 보존하고 기존 loader 선택 성공. sprite FPS24는 명시 FPS를 덮어쓰지 않음. 전체 clip/게임용24장/전투 QA0 |
| 실제 사각형 | 두 판 tile(100,100)/scale4.1667/back/collision=false, decode 기반8000.064×8000.064px/발(4020,4020), rect(19.968,−3980.064)→(8020.032,4020) |
| START / 중간 | 기존 STARTcamera(4020,7625)·진단 중간camera(6340,4740), 각각1090×750 전체가 판 밖/visibleObjects0. 환경 그림 없음 |
| EXIT | 기존 camera(4020,1740), 두 판이 viewport 전체에 걸침/visibleObjects2. 실제 청회색 안개 그림이 확대되어 통로·EXIT 표식이 읽히지 않음 |
| 미관측 | 첫 전투 좌표 미제출; 진단 중간을 전투 검수로 세지 않음. 원화 전체·알파·개별 판 기여도·전체 경로/충돌·성능 미검수 |
| 원본·범위 | 입력3개/정본PNG2개 SHA 불변/localStorage[]. nav/collision/START/EXIT/두판 위치 보존, engine/MAP/PNG 변경·복사0, 기존 완료 suite 재실행0 |
| §23 / 다음 소유 | [실제 캡처·정확 finding·MAP PRODUCTION REPORT](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-rift-first-slice-20261010/engine-preview-r2-canonical-first/engine-review.md). MAP이 같은 visual-only object2개의 배치·첫 전투 metadata 수정 소유. production LOCK 미연결/UNADOPTED 유지 |

이 PASS는 격리 fixture에서의 최초 resource consumer 결과다. 엔진 checkout에 PNG를 복사하거나 일반 서버의 자원 해결을 수정한 결과가 아니다. 현재 두 판의 로드·배치 확인을 위한 엔진 기능 추가0, 문서 기록만 로컬 commit/push·deploy0.


## R10 · 공개 UI 최초 소비와 저장 왕복

| 항목 | 실제 최초 관측 / 경계 |
|---|---|
| 입력 | MAP/visual-authoring-r10/rift-first-slice.visual.r10.fdg.json·visual-r10.manifest.md; 원본 변경0 |
| 맵 | 200×200/T40·tile1=1192; START100,193/world4020,7740·restQA116,167/world4660,6700·EXIT100,43/world4020,1740 |
| 환경 | env-abyss-depth / env-painterly-mass, 각 tile95,199·scale4.36·back·collisionfalse. PNG2는1920²; bottom anchor3820,7980. 원 clip·nav·marker·상단 통로 보존 |
| exact 바인딩 | assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png 및 hell-rift-painterly-v2.png의 개별 상대 symlink2개→migration checkout의 승인 정본 같은 경로. PNG bytes 복사/수정0·디렉터리 proxy0·서버 변경/재시작0. 해당 정본 checkout이 있는 host의 제작용 바인딩 |
| 로드 | 기존3333 exact URL HEAD200/image-png 각각6350749/6892248bytes. 최초 old page는 동일src 실패캐시 재사용으로 실패, fresh page에서 실제 PNG·START발/지면 표시. HEAD만으로 visual PASS0 |
| 최초 입력 한계 | v0.17 일반map에는 공개 연속/paused방향 UI가 없어 documented ArrowUp press5회가 즉시 해제되며 변위 미관측. 당시 root 요구 종주는 INPUT_TOOL 제약, source nav 실패로 판정하지 않음 |
| 최초 pause/step | 공개pause88.400초 유지·map의stepdisabled. 새v0.18 제작 입력과 구분 |
| 저장 왕복 | 공개save/export/reload/export 후 전체 JSON deep equality: 입력==before==after. 일반맵 liveactor/camera 저장 미지원; 재열기START 복원. actual-r10-reopened-start.png에 실제 지면/발 관측 |
| 시각 | START지면 실제표시, 확대 디테일 부족 RETOUCH; scale증가의sourceY 이동을 registration불변/groundPASS로 바꾸지 않음. 남단7980..8000의20px미피복은 보존된 잔여 |
| 후속 | 사용자 최신 전용툴 제작 승인에 따른 v0.18 입력/종주 검수는 별도 아래 기록. 원본/기존 완료검사 재실행0·combat N/A 유지 |
| 증거 | 외부 engine-preview-r10-first의 exact binding/HEAD/새PNG3개/public export2개/save proof/input trace. 기존 r9 proof 재사용0 |

## 사용자 직접 승인 v0.18 입력을 통한 R10 종주

최신 인간 지시 **“시간이 좀 걸리더라고 우리게임 개발전용으로 기획잘해서 하나 만들어봐”**에 따른 전용 작업창 제작은 ROOT의 최초 R10 소비 요청과 별도 범위다. 캐릭터 참고3종·조합 저장·동시효과 측정을 R10 제작 완료나 ROOT 추가 승인으로 합산하지 않는다.

공개 입력으로 START4020,7740→restQA4660,6700→east6060,5220→EXIT4020,1740에 실제 도달했다. retained입력955/실패0, 최초109개 개별 trace는 CUA timeout으로 미보존·중간 public좌표4380,7010과 계획 index 추론만이며 retained 성공 수에 합산하지 않는다. 현재 위치에서 경로를 계획하고 공개 방향 버튼만 소비했다. forceXY/teleport/출발점/nav/원PNG 변경0. 최초 v0.17 INPUT_TOOL 제약은 새 v0.18 UI로 해소됐다.

START/restQA/east/EXIT 발·지면 실제 표시, east6060,5220 카메라 피복 관측. 세계 rightedge8005.6은 계산값이며 전체 경계 PASS를 주장하지 않는다. sourceY이동·원height미소비·남단20px·확대 blur 보완 유지. **제작 주행 기술 PASS / VISUAL RETOUCH / fullproduction FAIL·UNADOPTED**. [현재 작업창 기록](FDG_PRODUCTION_WORKSPACE_20261011.md)과 외부 E의 새 v018-실화면/trace/proof·engine-review.md(§23)을 따른다. 기존 r9/source-v17 검수 재실행0.
