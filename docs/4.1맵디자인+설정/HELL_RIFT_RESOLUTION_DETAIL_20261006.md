# 지옥의 틈 도착 구역 해상도 상세 v1 — 미채택 실패 후보 보존

2026-10-06. 사용자 맵 흐림 개선 지시에 따른 독립 후보다. 기존 1254² clean plate의 중앙 하단을 더 많은 원본 픽셀로 다시 그린 1024×1536 이미지를 동일 world rectangle에 겹쳤다. 세부 돌바닥은 더 선명하지만 실제 합성에서 지형 위치와 경계가 맞지 않는다. **신규 후보 VISUAL VERDICT: FAIL / 기존 전체 맵 VISUAL VERDICT: RETOUCH.** 흐림 문제 해결 완료나 본편 채택으로 계산하지 않는다.

생성 원자료와 실패 화면을 보존한다. 원본 씬·원화·nav·주민 좌표를 이 후보로 교체하지 않는다. 이 문서는 [공통 제작 가이드](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체와 [_MAP_SSOT_INDEX](_MAP_SSOT_INDEX.md)의 사용자 지시/LOCK/현행 정본 우선순위를 적용한다. 현재 독립주민 정본은 [씬 에디터 §12 및 후속](MAP_SCENE_EDITOR_20261005.md)이다.

## 1. 파일과 정확 등록 값

| 항목 | 값 |
|---|---|
| 새 PNG | `assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png` |
| PNG 실제 native 크기 | 1024×1536, 2:3, 2,877,605B |
| PNG SHA256 | `a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84` |
| 새 씬 | `assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.scene.json`, 303,063B |
| 씬 SHA256 | `2485a57883589132b9c46cc693c0fb996375cdd54279549da6fb4c7bed9068ee` |
| productionStatus | `ISOLATED_RESOLUTION_DETAIL_CANDIDATE_NOT_ADOPTED`; 씬 이름에도 같은 상태 명시 |
| 에디터 URL | `http://127.0.0.1:3387/editor.html?scene=assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.scene.json` |
| 원본 v2 씬 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, 90,767B, SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a` |
| 생성 원자료 | `/Users/fordeargamers/.codex/generated_images/01a0faa9-b453-7673-be39-98adedb4c2b3/exec-8948e044-9c01-47e3-9baa-2b38b309fd41.png`를 byte 그대로 복사. worker 비트맵 편집/리사이즈/재압축 0 |
| 새 asset/object | `arrival-detail-v1` / `obj-arrival-detail-v1` |
| asset crop | `{x:0,y:0,w:1024,h:1536}`, 원본 전체, `internal:true` |
| 레이어 | 기존 `centre`/flat/parallax1/visible. `obj-centre-1` 바로 뒤에 삽입, 새 레이어 0 |
| world x/y | `2662.5` / `3995.8333333333335` |
| world width/height | `2675` / `4004.166666666667` |
| 변형 | pivot(0,0), rotation0, flipX=false, opacity1, mask/feather 없음 |
| world 경계 | left2662.5/top3995.8333333333335/right5337.5/bottom8000. 기존 centre-1과 exact 동일 |
| 개수 | 기존6layers/14assets/14objects → 새6layers/15assets/15objects. 기존 base6/전경3/주민4/심연1 모두 유지 |
| 원본 메타 | world/walkable/start/exit/cameras/sourcePins/navigationReview/residentLayerReview/notes exact 유지 |
| 새 review | `resolutionDetailReview`에 요청 범위/native 크기/배율/원본 핀/등록 미인수 기록. 원본 residentLayerReview 변경0 |

씬의 review `visualVerdict:'RETOUCH'`는 생성·구조검수 단계의 초기 평가다. 이후 실제 합성 시각 검수에서 **FAIL**이 확정됐다. 초기 씬 파일과 browser raw의 `RETOUCH_PENDING_ROOT_IMAGE_REVIEW`는 그대로 보존하며, 현재 판정은 이 문서의 FAIL을 따른다. 실패 증거를 새 v1 출력으로 덮어쓰지 않는다.

## 2. 원본 픽셀 밀도와 남은 확대

| 항목 | X | Y |
|---|---:|---:|
| 기존 centre-1 원본 crop px | 419.30625 | 627.6531249999999 |
| 신규 native crop px | 1024 | 1536 |
| 기존 world px/source px | 6.379585326953748 | 6.379585326953749 |
| 신규 world px/source px | 2.6123046875 | 2.606879340277778 |
| 같은 world 영역에서 원본 픽셀 밀도 증가 | 2.442129112075005배 | 2.447211586813975배 |
| zoom1.2/DPR1 가정의 screen px/source px | 3.134765625 | 3.1282552083333335 |

같은 rectangle에 놓은 데이터 밀도는 약2.45배지만 여전히 확대 렌더다. 실제 화면 배율에는 `canvas.width / stage CSS width`의 실제 raster ratio가 추가되며 DPR cap을 임의로 한 번 더 곱하지 않는다. 요청은 normalized x1/3…2/3, y1/2…1였으나 기존 centre-1 world rectangle은 bleed를 포함한다. X/Y 확대 비의 비율은 `1.0020811654526534`로 약0.2081% 차이가 난다. 이는 원본과 픽셀 exact 정합을 증명하지 않는다.

등록한 rectangle은 기존 upper centre 조각과 세로 `8.333333333333485`world px 겹친다. 원래 여섯 crop은 같은 clean plate에서 왔지만, 새 이미지는 별도 재그림이어서 이 겹침과 좌우 접합에 동일 픽셀 bleed가 없다. 단순 좌표 일치나 opacity1 겹치기를 seam 해소로 계산하지 않는다.

## 3. 생성 요청과 미인수 경계

built-in imagegen에 공급한 clean plate의 **lower central third: normalized x=1/3…2/3, y=1/2…1**만 출력하도록 요청했다. 요청은 돌바닥·재·유기 뿌리의 선명한 세부를 추가하되 동일 시점/구도/길 경계/랜드마크/심연을 보존하고 사람·건물·새 다리·새 섬·HUD·문자를 추가하지 않는 것이었다. 실제 출력은 portrait2:3/native1024×1536이다.

정확한 프롬프트 전문은 root가 저장한 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resolution-detail-20261006/image-generation-prompt.txt`를 따른다. 이 요청의 layout-preserve 문구는 목표이며 **달성/인수된 사실이 아니다**. 생성본의 길·심연 위치가 원본에서 이동했고, 동일 crop 추출로 취급할 수 없다. 새 이미지는 해상도가 높은 별도 후보이며 원본 clean plate에서 정확히 추출한 조각이 아니다.

## 4. 보존·의미 검수와 실제 합성 결과

| 검수 | 실제 결과와 범위 |
|---|---|
| prewrite Git | `git status --porcelain=v1 --untracked-files=all -z`의 비어 있지 않은 NUL record72, index0. 초기 default untracked directory 묶음66과 정확 파일72를 구분해 두 raw 모두 보존 |
| 백업 | 외부 `worker-backup/original-residents-v2.scene.json` 및 `worker-baseline.json`; 새 소유3경로 absent 확인 뒤 작성 |
| 의미 검수 | 외부 `worker-verify-candidate.cjs`, 최초1회10/10 PASS. 기존 suite 재실행0/worker 브라우저0/Git쓰기0 |
| 허용 변경만 확인 | 이름/status/new review/추가asset1·object1을 제거하면 원본 JSON과 deep exact 동일. 기존14asset/14object·6layer 설정 불변 |
| JSON | 현행 MapSceneCore.validate 통과, JSON 왕복 exact, 새 PNG signature/native header/full crop/byte복사 exact |
| 보행 데이터 | world200×200/tile40/8000²; walkable40000칸/1192개. nav SHA `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179`. 시작(4020,7740)/출구(4020,1740) exact 동일. 기존 BFS/종주 재실행0 |
| 주민 | strict independent profile 유효, 원본4 anchor exact/grounding4. 하란(4660,6660), 베린(6020,5580), 네사(6300,5020), 도릭(5220,2500). 크기/pivot/crop/발·STORY 불변 |
| 원화 | painting SHA `a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4`; cleanPlate `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673`; atlas `ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38` 유지 |
| root 실제 화면 | 기존 editor3387, Chrome1launch/context1/page1, 신규2기능그룹PASS. 같은 하란camera(4660,6660)/zoom1.2 before/after, sourceExact·anchors4/grounding4·feet/nav동일/HTTP0·errors[] |
| root PNG export | 독립 후보 overview2048², 7,440,777B SHA `45817ea1a88710a37109ebd0f1b7e5bc0346689ca7f8b6d6c0b2bddc08284a80`. 기존 정본 PNG를 대체0 |
| 직접 시각 확인 | before-close/after-close/overview 세 화면 확인. 새 돌바닥의 세부 증가 확인, 하단·상단·좌우 rectangle 경계와 지형 위치 shift 확인 |
| 시각 차단1 | 생성본의 심연과 길이 원본과 달라 hard rectangle seam이 뚜렷함. 가이드§14 동일 master/bleed 및§21 환경 연결 조건 실패 |
| 시각 차단2 | 원본 clean plate 기반 south-root 전경 mask가 새 재그림 바닥과 불일치. after-close에서 큰 흐린 삼각 조각이 새 지면을 덮음. 발 앞뒤 가림/원본 source 대응 실패 |
| 기능 vs 시각 | 씬 로딩·보행 값·주민 consumer PASS는 지형 시각 일치 PASS가 아니다. 신규 합성 FAIL / 기존 맵 RETOUCH |
| 미검수 | 새지형 실제경로 정합/전투·8camera·native6단계·실청취/성능·실물폰·A급 인수0. 새 서버/게임/빌드0 |
| docs 전체검색 | `rg --line-number --ignore-case --glob '*.md' --regexp '지옥의 틈|hell.?rift|clean-plate|resident.*layer|worldPerSourcePixel|확대.*(흐림|해상도)|source.*배율|resolution.detail|arrival.detail' docs` → 작성 전585행/29문서, 외부 raw 보존. root가 관련 정본/운영 문서 동기화 소유 |
| 소유 | worker 새PNG/새JSON/본 문서3경로만. root 별도 이미지 생성/실화면 검수/관련문서/Git 소유, 전문팀 WIP/owner STATE/LOG/세이브 변경0 |

외부 근거 폴더는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resolution-detail-20261006/`다. worker 원본 pins/정확 명령/semantic result/검색 raw, root `browser-qa.json`/두 close PNG/overview/프롬프트를 함께 보존한다. 최초 실패 원자료를 삭제하거나 새 후보로 덮지 않는다.

## 5. MAP PRODUCTION REPORT — 가이드 §23

```text
================= MAP PRODUCTION REPORT =================

STAGE:
지옥의 틈 독립주민 v2의 도착 구역 해상도 상세 v1, 실패·미채택 후보 보존.

MASTER
- silhouette: 원본 값 유지. 재그림 silhouette/길 위치는 원본과 불일치.
- regions: 전체 region 재설계0; lower-central-third 한 구역만 별도 이미지.
- main route: 원본 nav1192/시작4020,7740→출구4020,1740 불변.
- side spaces: 원본 불변, 새 그림 정합 미인수.

OUTER MASS
- LEFT: 기존 서쪽 crop 유지; 후보 rectangle 좌측 seam 실패.
- RIGHT: 기존 생체 절벽 유지; 후보 우측 명암/지형 seam 실패.
- TOP: 기존 upper centre 유지; 후보 위쪽 hard boundary 실패.
- SOUTH: 도착 바닥 detail 교체 후보, 원본 전경 source 불일치.
- major holes: 새 심연/길 위치 shift. 원본 데이터 값만 유지한 상태.

LARGE
- source assets: 원본 clean plate1254² + 새1024×1536, 원본 byte 불변.
- composites: centre-1 뒤 opaque overlay1, 새layer0.
- overlap: same world rectangle2675×4004.166666666667; upper centre bleed 겹침.
- repeated silhouette: 반복 회피 인수 없음, 이번 목표는 원본 등록 유지였으나 실패.

MEDIUM
- connections: 기존6crop 연결 불변, 새overlay 연결은 hard seam으로 실패.
- remaining holes: 심연/지형 자리 차이. 단순 feather로 해결됐다고 주장0.

GROUND
- shadow: 기존 주민 grounding4 유지, 새 지형에서 실제접지 재인수0.
- contamination: 새 돌/재/뿌리 미세 재질은 증가, 원본 지형 정확 일치 없음.
- structure integration: 기존 south-root mask가 큰 흐린 삼각 조각으로 남아 FAIL.

PLAYABLE
- main arenas: 기존 값 유지, 신규 전투 시험0.
- travel space: nav1192 유지, 새 painted floor와 collision 일치 미인수.
- breathing space: 기존 공간 유지, 새화면 전체 연결 FAIL.
- threat space: 새심연 정합 불일치, 시각/충돌 인수0.
- combat readability: 주민 한camera 비교만, 실제전투/native 검수0.

LANDMARK
- primary: 기존 심연/상승로 값 유지; 새 이미지 심연위치 shift.
- secondary: 기존계단·잔불 유지, generated 위치보존 미인수.
- tertiary: 상세재질만 새후보, 새랜드마크 채택0.

CAMERA QA
- START: 새별도 시작camera 인수0.
- EARLY: 원본/후보 하란camera4660,6660/zoom1.2 직접비교; FAIL.
- ARENA: 신규검수0.
- SIDE L: 신규8camera검수0; overview seam 육안확인.
- SIDE R: 신규8camera검수0; overview seam 육안확인.
- LANDMARK: overview의새심연shift 확인, FAIL.
- LATE: 신규검수0.
- EXIT: 신규검수0.

TECH QA
- route: 데이터1192/navSHA exact, 기존route/종주재실행0.
- collision: 데이터불변, 새그림경계와일치 미인수.
- pageerror: root browser errors[]/2그룹PASS.
- 404: root HTTP errors0.
- seam: 새합성FAIL; 좌우/상하rectangle와south-root 전경 불일치.
- loading: root후보load/원본SHA/anchors4/grounding4PASS.
- performance: 신규성능 인수0.

FILES
- stage-owned: arrival-detail-v1.png/arrival-detail-v1.scene.json/이 문서만.
- concurrent touched: root 관련docs/외부QA; worker 덮어쓰기0.
- unrelated touched: prewrite72WIP/기존23/owner기록/세이브 보호.

GIT
- staged: worker0.
- commit: root가 실패후보 원자료와 관련docs 한정 수행.
- push: root소유, 정확원격SHA 외부receipt.
- deploy: 0.

VISUAL VERDICT:
FAIL — 신규 detail-v1 합성. 기존 전체맵 RETOUCH 유지.

NEXT PASS:
원본 지형/랜드마크/경계의 실제등록이 맞는 지역 source부터 확보한다.
base와 앞뒤 occluder가 같은 source로 정합돼야 하며 현재v1실패증거는 보존한다.
새 그림의 고해상도만으로 전체맵흐림 해결·A급·본편완료를 선언하지 않는다.
```
