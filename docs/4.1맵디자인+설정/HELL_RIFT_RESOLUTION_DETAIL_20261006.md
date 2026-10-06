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


## 2026-10-07 ROOT-RIFT-SEAM-RAW54-PRESERVATION-20261007

| 항목 | 정확 값 / 상태 |
|---|---|
| TASK / 완료 ID | CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX / CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE |
| 소유 파일 | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-cliff-contact-underlay-2_5d.candidate.mjs |
| 원자료 exact pin | 10558 bytes / SHA256 42c881af73d0ad67461ea794e09e310901f98a2b7d2ef53e6319b310edcb6af0 |
| 공식 end | 4f7fc022-56ac-4a14-b411-c5eb26e96245 / 2026-10-06T18:16:42.744Z / end raw SHA256 49b17a8cec0a91f9cbfe895a35f07900e1172050b848b1c705f1d8d97d6b3299 |
| peer / 첫 유용 source | 5b055bf2-8b7b-4b7d-ab91-fc2f6fdd3033 18:12:15.933Z / Read toolu_016V4engfwSNt64qDjk6J4dX → 83b094c2-3dc8-470b-b7f3-422f2d517119 18:13:47.664Z |
| 전문 검증 | stdin 1회 13 PASS exit0. root의 의미·GPU·시각 채택 검증으로 승격하지 않는다. |
| 원자료 보존 / 채택 | 완료 raw54의 정확 bytes를 미채택 상태로 보존. public 직접 import0. 이전 raw53 보존과 별도이며 새로운 완료 raw는 1개이다. |
| 원자료 결함 | rowY 저장 + flipY=false + V=1-y 조합의 수직 반전; Linear alphaMap의 비보행 누출; 재prepare parent orphan; params 검증 부재(Infinity 루프 가능); Mesh/geometry 중간 throw 자원 누수. default 실제 center 최대alpha .14이며 명목strength .42와 다르다. |
| 현재 public 전경 계약 | 원본 terrain16689 bytes SHA256 c600aa524b5a664dc0c8d00fd296c972add38f7c97b066e3985966cc33e2e3b2 유지. source maskFeather0, footY4320/5360/6920, order30/31.3/33.25. 원자료 주석의 detail5/occluder10/shadow15는 현행 계약으로 사용하지 않는다. |
| feather6 실험 | GPU3 LINK_STATUS PASS에도 동일 카메라 비교의 실제 배경 개선 미확인. 외부 deferred-inward-feather6-rift-terrain.mjs로 보존하고 자기 변경만 exact 원본 bytes로 복원. public 채택 보류. 남쪽 픽셀차0, 동쪽30/북쪽8은 캐릭터 영역으로 경계 개선 근거가 아니다. |
| 보존 기준 | team NUL44 주장 대신 root 전체 rename-aware NUL 사용. 원 end→관측186.845372초를 3분 이내 보장으로 주장하지 않는다. 코드+docs 정상 commit/push 후 외부 receipt로 remote exact SHA 검증. |
| 다음 단위 | root derivative contact underlay에서 rowY UV·nearest hard nav gate·소유 수명·유효 입력을 수정하고 실제 shader link / 같은 카메라 비교. sourcePNG/scene/nav1192 및 본편/세이브 변경0. |
| 완료 경계 | 원자료 보존≠consumer 채택≠본편/native6/청취/실제 보상save/A급. 기존 editor 왕복18·NPC/wolf25는 과거 검수이며 새 검수에 합산하지 않는다. |

MAP PRODUCTION REPORT — STAGE: 지옥의 틈 절벽 접합 후보 보존/선별. MASTER: 기존 비대칭 실루엣·남→북 주경로·주민 곁 side space 유지. OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 원화 그대로. LARGE: 기존 sourcePNG·3전경 composites/crop·overlap·silhouette 그대로. MEDIUM: connections/remaining holes 변경0. GROUND: shadow 후보는 결함으로 미채택; contamination/structure integration 현행 유지. PLAYABLE: travel/breathing space nav1192 그대로, arenas/threat/combat 인수 PENDING. LANDMARK: primary 상승문·secondary 균열·tertiary 주민 유지. CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 동일 발 위치 비교; START/EARLY/ARENA/SIDE L/LATE 전체 및 EXIT 본편 인수 PENDING. TECH QA: route/collision 불변; 실험3카메라 pageerror0/4040; seam 개선 미확인; 원본 복원 후 실제 GPU link1 PASS; loading/performance 정량 인수 PENDING. FILES: 완료 raw 신규1, root 실험 원본 복원; concurrent/unrelated touched0. GIT: 완료 소유 raw+이 동기화 docs 한정 정상 보존; push/exact SHA는 외부 영수증에 기록; deploy0. VISUAL VERDICT: RETOUCH. NEXT PASS: corrected contact underlay actual WebGL와 visible seam 비교.


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.


## ROOT-RIFT-PUBLIC-BOUNDARY-RESOLUTION-20261007 — 현재 정본·lab/main·해상도 경계

public host/gate의 UI·수명 연결은 원본 해상도를 바꾸지 않았다. source 확대·2D mask buffer·lab DPR 수명·미채택 MAP 후보를 분리하여 현재 원인을 기록한다.

### 현재 정본과 읽기 연결

| 정본/책임 | 현재 링크·핀 | 현재 적용 범위 |
|---|---|---|
| 선행 기준 | [EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md), stage LOCK 및 이 인덱스의 기존 읽기 순서 | 기존 순서/QA gate 유지. 이번 문서로 geometry·높이·nav·배치 기준을 재정의하지 않음 |
| 독립 slice / 결과 | [HELL_RIFT_2_5D_SLICE_20261006.md](HELL_RIFT_2_5D_SLICE_20261006.md), [HELL_RIFT_EDITOR_RESULT_20261006.md](HELL_RIFT_EDITOR_RESULT_20261006.md) | source/nav/XY 등록과 host UI·전체맵 판정을 분리하여 읽음 |
| editor / runtime | [MAP_SCENE_EDITOR_20261005.md](MAP_SCENE_EDITOR_20261005.md), [THREE_LOCAL_SINGLE_RUNTIME_20260929.md](../12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md) | 기존 selected-NPC editor host와 main-context host는 별개. parent는 own DOM/timeout, child는 renderer/RAF 소유 |
| 해상도 원인 | [HELL_RIFT_RESOLUTION_DETAIL_20261006.md](HELL_RIFT_RESOLUTION_DETAIL_20261006.md) | 기존 arrival-detail 전체지형 후보 FAIL·별도 재질 crop 소비와 현재 source 확대 한계를 구분 |
| 완료 public host | [main-rift-host.mjs](../../tools/2_5d/main-rift-host.mjs), 17683B, SHA `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38`; 코드 ID ROOT-RIFT-MAIN-IFRAME-HOST-20261007 | public 구현 완료. 독립 iframe 표시/복귀 수명이며 actual main 채택0 |
| 완료 public gate | [rift-main-entry-gate.mjs](../../tools/2_5d/rift-main-entry-gate.mjs), 16280B, SHA `f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd`; ID ROOT-RIFT-MAIN-ENTRY-GATE-20261007 | public derivative 구현 완료. one-shot commit permission이며 nextStage/save/reward/DOM 호출0 |
| gate provenance | immutable raw V2 11268B/SHA `646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be`, 공식 end `be7786a7-6b57-4b97-a55e-e1e7cada25e1` | direct raw import0. raw 후보 완료·public 보정·main 채택은 다른 상태 |
| 저장/대화 계약 | [15 세이브+데이터구조.md](../15%20세이브+데이터구조/15%20세이브+데이터구조.md), [RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md](../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md) | checkpoint true는 durable dbSave/grant ACK가 아니며 대화는 독립 session-only. 실제 quest/reward/save 인수0 |

앞선 정식 end 대기/public 작성 중/interop PENDING 절은 당시 이력으로 보존한다. 현재는 위 최종 public host/gate 핀과 아래 신규 interop 근거를 읽는다. 코드 구현 완료가 본편 연결·선명도·A급 완료를 뜻하지 않는다.

### 독립 lab과 main의 실행 경계

| 항목 | 정확 현재 계약 | 미인수·소유 경계 |
|---|---|---|
| host API·대기 | `createMainRiftHost({document,window,readContext,timeoutMs=30000,pollMs=100})` → enterRift/cancel/dispose/snapshot. timeout finite100..60000ms, poll finite20..1000ms | own iframe 최대1·timer 최대1·host RAF0; http/https 동일 origin3387·정확 tools/2_5d-world-lab.html |
| host admission | 동기 plain own-data player non-null object(배열 제외)/character 길이>0 string/stage integer≥0/context opaque identity/onfalse/stageClearedtrue. status dead/fallen/reviving/lastStand 거절 | 실제 lexical caller가 공급해야 함; player/context 참조 엄격 비교·child character 전송0. 부모 plain과 child native realm snapshot을 구분 |
| host 반환/종료 | enterRift Promise는 own restore()/dispose() handle 또는 null로 resolve; user Escape/돌아가기/onExit는 gate job 취소 | return≠continue job. 부모 blur 취소0; 실제 hidden 전환은 앞선 검수 SKIPPED |
| gate API·ports | `createRiftMainEntryGate({ports})` → enter/continue/cancel/dispose/snapshot; own-data readState/checkpoint/enterRift/resumeStage 함수 캡처 | same-realm native Promise만 해당 async port에 허용; 일반 thenable/foreign Promise/custom prototype/accessor 거절 |
| gate readState | own-data stage/stageCleared/status/difficultyOff/contextId. stage safe integer≥0, stageCleared boolean, difficultyOff finite Number, contextId non-null string/finiteNumber/bigint/symbol/boolean | enum clear-continue/dead/final/demo/unknown; 실제 admission은 stageClearedtrue+clear-continue만. gate primitive contextId와 host opaque context는 별도 입력 |
| checkpoint/host 재검사 | checkpoint 정확 true 또는 same-realm native Promise<true>; host handle은 own restore 함수와 optional own dispose 함수 | checkpoint 전후/host await 뒤 fresh 동일 admission+epoch 확인. checkpoint는 영구 저장 확인이 아님 |
| continue/commit | continue는 schedule만. commit은 scheduled/current epoch/fresh admission/cleanup 전후 재검사 후 최대1회 permission 발급 | caller가 commit과 root job 일치를 확인하여 실제 nextStage를 결정. gate nextStage 호출0·actualStageAcknowledgedfalse |
| stale·실패 | cancel/dispose/new job은 stale await·저장된 callback permission 거절; late handle은 자기 restore→dispose 정리 | 실패 fallthroughfalse. hostCancelRequired와 root job을 함께 확인해야 새 host를 닫지 않음; retained error dialog cleanup은 caller 소유 |
| main 잔여 접점 | DEMO1-1 nextBtn의 일반 접점 우회, 이미 held된 keys/gamepad polling/update, 5000ms 전환 callback/900ms curtain job guard | host/gate만으로 현재1-1→틈 main 완료0. game.html/P/G/user save/보스retry/SP10clear 변경0 |
| 인수 flags | host/gate mainAcceptedfalse/nativeAcceptedfalse; gate actualStageAcknowledgedfalse/fallthroughfalse/timers0/raf0/saveWritesfalse/rewardWritesfalse | 실제 nextStage/combat·durable reward ACK/save/native6/audio/실캐릭터 child 연동/A급 인수0 |

### 신규 interop 최종 근거와 검수 묶음

| 자료/관측 | 정확 결과 | 범위 |
|---|---|---|
| interop 영수증 | main-gate-host-interop/interop-result.json, 26382B/SHA `f4b1d75af1997e69327d1cb81cb1e38944b1843b10fefc18b6ccf894fac0a5c4`; NEW_INTEROP4_ONLY **4/4 PASS** | 시작/종료 gate16280/f9db…·host17683/008a… 핀 동일. 실제3387 iframe+모의 P/G context, actualMainGamefalse |
| interop1 | 실제 ready iframe, explicit continue는 schedule만, 저장된 지연 callback commit 최초true·재호출false | delayedAdvanceIsMocktrue; permission1은 실제 stage ACK 아님. actual nextStage 호출0·stageAcknowledgedfalse |
| interop2 | 실제 Escape로 gate job/owned iframe 정리, permission·모의 advance0 | 복귀를 자동 stage 진행으로 처리0 |
| interop3 | 예약 뒤 contextId/host context 교체 → 저장 callback 거절·모의 advance0 | 오래된 job/handle로 새 context 진행0 |
| interop4 | 실제 HTTP503 주입/null host → denial/fallthrough0·wrapper retained dialog cleanup | expectedLoadFailureInjections1; 미예상 page/HTTP/console0·foreign/nonGET0 |
| UI 화면 보고 | interop-screen-review.json: 별도 지원 담당이 interop-entry/interop-scheduled-return PNG 확인, owned modal·복귀 UI PASS | 문서 worker 신규 GUI/화면 관찰0. 전체맵 RETOUCH |
| 묶음 분리 | 최초 host realm FAIL0체크 / 이전6cd… GUI14 / 최종008a… formatter negative2+normalGUI2 / gate 순수24그룹222조건 / 이번 interop4 | 이전 검사 재실행·합산0. negative2는 음성 검사 아님 |
| 미인수 flags | actualMainGamefalse/native6Acceptedfalse/saveAcceptedfalse/audioAcceptedfalse/stageAcknowledgedfalse | fixture/lab/permission/own UI PASS를 native6·청취·저장·보상·A급 인수로 대체0 |

외부 근거 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/`이다. host의 실제 context admission과 gate의 지연 permission API는 완료됐지만 main 게임의 전환 caller/input/update/DEMO 경로는 아직 연결·인수되지 않았다.

### 해상도 원인별 현행 source 관측

| 경로/source | 현재 규격·계산 | 상태·안전 경계 |
|---|---|---|
| 원화 밀도 | clean-plate-v1.png 1254×1254, 2417849B/SHA `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673` → world8000×8000 | 8000/1254=6.379585326953748 worldpx/sourcepx. host/gate는 source 세부·픽셀·geometry를 바꾸지 않아 확대 한계 유지 |
| 현행 canonical | hell-rift-residents-v2.scene.json 90767B/SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`; grid200²/tile40/nav1192; navSHA `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` | source/nav/start/exit/feet/world/XY 등록 변경0. 실제 authored physical height는 원자료 UNKNOWN |
| Three texture | rift-terrain.mjs:30–35 SHA/1254 크기 확인 후 SRGBColorSpace·mag LinearFilter/min LinearMipmapLinearFilter | 확대 보간/축소용 mipmap이 원픽셀 세부를 만드는 것은 아님. 필터 자체의 신규 A/B 선명도 PASS0 |
| Three mask/UV | terrain ground/foreground는 source Texture·crop/global UV로 등록하며 Canvas2D maskedPicture의1024 버퍼를 사용하지 않음 | Three의1254→8000 확대 한계와2D 중간 buffer 문제는 별도 |
| 2D maskedPicture | map-scene-editor.js:37–67, mask 있는 object만 ratio=1024/max(object.width,object.height), 장축1024 buffer, cache 최대8 | crop 장축>1024이면 추가 축소, 작은 crop은 확대. 1254 sheet 전체가 항상1024로 축소된다는 표현 금지 |
| 현재 masked source | obj-rift-depth는1920² full crop→1024². 세 foot crop 장축: west112.85999999999999/east156.75/south100.32 | foot3의 native crop은1024보다 작아 source 확대 경로. 원본을 고해상도로 교체했다고 계산0 |
| feather alpha | maskFeather가 있을 때 장축256 alpha sample→1024 buffer, abyss 현재 feather120world | RGB source 해상도와 alpha edge sample 구분; physical 절벽 높이/접지 인수 아님 |
| 2D 배율 | editor zoom1.2의 CSS/source=8000/1254×1.2=7.655502392344498; 실제 raster는 canvas.width/CSSwidth 추가 적용 | editor 계산에만 적용. Three camera zoom1.2를 같은 world→CSS 배율로 대입하지 않고 실제 projected 크기를 읽음 |
| lab DPR 초기화 | 2_5d-world-lab.mjs:273–274 antialiastrue/powerPreference low-power, 초기 setPixelRatio는 devicePixelRatio가 falsy면1로 대체한 뒤 cap2; outputSRGB | cap2는 최대 raster 배율. DPR>2 장치의 낮은 raster 밀도 가능성을 source 확대흐림과 구분 |
| lab resize DPR | 2_5d-world-lab.mjs:45–52 resize는 setSize·정사영 높이3.5·zoom update만, setPixelRatio 재호출0 | 초기화 뒤 monitor/browser DPR 변화 재평가 미구현이라는 source 관측. 새 DPR 전환 GUI/A-B0·수정 완료0 |
| editor resize DPR | map-scene-editor.js:361 resize 함수는 devicePixelRatio를 다시 읽고 cap2로 canvas dimensions 설정 | lab과 다른 계약. 모든 renderer가 DPR 재평가0이라고 일반화하지 않음; 실제 DPR 전환 이벤트 수명 인수는 이번 범위 아님 |
| MAP raw62 | CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP-CANDIDATE; rift-editor-mask-resolution.candidate.mjs 7258B/SHA `603b8a6b8e792747f51e93b9e230a4dd868d99a8a7d724bf22b4a289d572cdb9`; 공식 end `093ac892-bf81-460a-a7be-c8848884270e` | 이번 TASK guide/SSOT 선행 Read prerequisite FAIL, 소급 PASS0·public editor 미채택. 존재/보존을 buffer 개선 적용·시각 PASS로 승격0 |
| 실패 이력·잔여 | arrival-detail 전체지형 등록 FAIL·contact ON 실화면 FAIL/defaultOFF, 원plate1254² 확대흐림·절벽 접합/physical height 미해결 | host/gate·interop4 성공으로 해상도/접합 해결 선언0. 원source/nav/UV/foot 등록 보존 |

다음 해상도 A/B는 같은 source pin·camera XY/angle/zoom·CSS viewport·실제 raster dimensions·devicePixelRatio·contact OFF·actor pose를 고정한 별도 승인 단위다. DPR 갱신/2D buffer 후보의 코드·fixture PASS만으로 source 세부 개선을 선언하지 않는다. 실제 세부가 개선되고 경계·가림·발 등록과 오류/메모리 수명이 보존되어야 하며, 픽셀 밀도만 증가하거나 원화/길/주민 foot가 달라지면 RETOUCH/FAIL로 남긴다. 이번 문서 작업에서 새 A/B/GPU/browser/원PNG 편집0이다.

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·판정 | 새 실행/변경 |
|---|---|---|
| STAGE | public host/gate 정본 링크·독립 lab/main 경계·해상도 source 원인 동기화 | 기존 docs2 append |
| MASTER | 기존 silhouette/regions/main route/side spaces 유지 | 새 계획/geometry0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major opening 원본 유지 | 변경0 |
| LARGE | source1254 plate/composite/crop/overlap/repeated silhouette 유지 | 변경0 |
| MEDIUM | connections/remaining holes·절벽 접합 유지 | 변경0 |
| GROUND | nav1192·접지/오염/structure integration 유지; contact FAIL/defaultOFF | source 확대흐림 미해결 |
| PLAYABLE | 독립 iframe+모의 P/G interop4; main arena/travel/breathing/threat/combat 인수 PENDING | 실제 nextStage/save/native6 인수0 |
| LANDMARK | primary 상승문/secondary 균열/tertiary 주민 배치·feet 유지 | 변경0 |
| CAMERA QA | 기존 interop entry/return 화면 보고만 참조 | worker 신규 START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT·A/B0 |
| TECH QA | 최종 host/gate pin·신규interop4 영수증 읽기 대조; editor1024/lab DPR 미구현 source 관측 | route/collision/seam/loading/performance 신규 실행0·해결 완료0 |
| FILES | owned 기존 docs2, 원문 전체bytes prefix100%+추가LF만 | concurrent/unrelated/code/asset/PNG/game/editor/STATE/LOG 변경0 |
| GIT | worker stage/commit/push/deploy0, root가 완료docs2 checkpoint | 이 절만으로 원격SHA/push 성공 주장0 |
| VISUAL VERDICT | **RETOUCH** — modal/복귀 UI PASS, 전체맵 확대흐림·접합·본편 미인수 | contact ON의 이전 FAIL/defaultOFF 유지 |
| NEXT PASS | guide/SSOT 선행을 갖춘2D buffer/DPR source 보정·동일화면 A/B와 main lexical/DEMO/heldgamepad/update/realstage/save/reward/native6/audio | 별도 승인·실검수 |

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 — resize 시 현재 DPR 재평가

이 절은 독립3387 lab의 DPR 갱신 구현 상태다. 직전 해상도 원인 표의 “lab resize DPR 재평가 미구현”은 수정 전 source 관측으로 보존하며 현재 상태는 아래 표를 따른다. 원판1254² 확대 흐림·2D maskedPicture1024 버퍼·contact ON 시각 FAIL/defaultOFF는 별개의 경계로 유지한다.

### 선행 문서·수정·수명 계약

| 항목 | 실제 현재 계약 | 보호·미인수 경계 |
|---|---|---|
| 이번 TASK 선행 | _MAP_SSOT_INDEX 전체1…961행, EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 처음부터끝, AGENTS 전체, CH1_1_BLOCKOUT_MASTER의 LOCK 전체를 이번 구현 전 실제 다시 읽음. 출력 잘림 구간은 재독하여 누락을 보완 | 이전 TASK 읽기를 이번 선행 Read로 소급하지 않음. 독립 틈의 현재 정본·원본핀 우선, CH1 원본 LOCK·보호2_3/Q전용·어택티켓금지 유지 |
| 소유 코드 | tools/2_5d-world-lab.mjs의 resize()에3줄 추가, 현재33105B/SHA 2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12 | init·shader·terrain·nav·원화·child키·host/gate·기존 JSON·main/game/save 쓰기0 |
| DPR 입력 | resize마다 globalThis.devicePixelRatio를 현재값으로 읽음. typeof number·Number.isFinite·값>0인 경우 Math.min(값,2), 나머지1 | 유효 양수 소수는 반올림/최소1 강제0. undefined·문자·NaN·Infinity·0·음수는 fallback1. 새 옵션·저장값0 |
| 적용 | renderer.getPixelRatio()가 새 pixelRatio와 다를 때만 renderer.setPixelRatio(pixelRatio). 그 뒤 기존 setSize(width,height,false) 유지 | 같은 DPR에서 pixelRatio setter 재호출0. 새 renderer/RAF/timer/ResizeObserver·DPR watcher 추가0 |
| 기존 초기화 | 초기 devicePixelRatio가 falsy면1로 대체한 뒤 cap2인 기존 초기 setter 유지. 최초 startup resize가 현재값에 위 엄격 검증을 적용 | 정상 browser DPR에서 초기화·resize의 cap2 정책 동일. 초기 setter 줄 자체를 변경하지 않았으며 비정상 전역값의 초기 WebGL 생성 인수는 없음 |
| 크기·카메라 | parent bounding rect를 기존대로 Math.round하고 각 width/height 최소1. 기존 setSize(...,false), 정사영 기본 높이3.5·half1.75·50°/scale400·zoom100% 그대로 | scene/world8000²/nav1192/UV/sourcecrop/주민발/start/exit·화면비율/등록 변경0 |
| 갱신 진입점 | 기존 ResizeObserver 또는 확대 range input이 resize를 호출할 때 DPR 갱신 | CSS 크기가 그대로인 모니터 이동/DPR만의 변화가 기존 observer를 자동 깨우는지 미인수. 별도 window resize/matchMedia listener·polling 추가0 |

### 이번 신규 실제 Chrome 실험1회

설치된 Google Chrome을 headless로 launch1/context1/top editor page1/lab iframe1 실행했다. origin은 127.0.0.1:3387이며 기존 서버를 사용했다. fresh editor 위 QA iframe에서 실제 lab module을 로드하고 대기 pose를 정지한 뒤 CDP Emulation.setDeviceMetricsOverride의 실제 deviceScaleFactor를 바꿨다. DPR 전환 뒤 기존 zoom range의 input 경로를 호출해 resize를 실행했다. 이는 실물 모니터 이동이나 브라우저 UI 줌 자동 이벤트 인수가 아니다.

| 관측 | 현재 window DPR | renderer 기대 배율 | canvas·GL drawing buffer | CSS·안전 조건 |
|---|---|---|---|---|
| CDP1 | 1 | 1 | 1036×714 | 실제 canvas CSS1034×712.46875, parent1036×714.46875·logical1036×714 |
| CDP2 | 2 | 2 | 2072×1428 | CSS·원pose·source 등록 동일 |
| CDP3 | 3 | cap2 | 2072×1428 | DPR>2에서 최대2 유지, 신규 GPU resource 추가 선언0 |
| CDP 소수 | 1.25 | 1.25 | 1295×892 | Three backing 차원 floor 때문에 Y실측892/714=1.2492997198879552; 소수 DPR을1로 자르지 않음 |
| WebGL | 위4관측 각각 현재13개 program | 모두 actual gl.LINK_STATUS=true | GLerror0/contextLostfalse/readytrue | shader snapshot 등록 플래그만으로 LINK PASS 대체0 |
| 오류·요청 | pageerror0/consoleerror0/HTTP400이상0 | 외부요청0·nonGET0 | 새 API/save 호출0 | 사용자게임3333/3340·앱3381/3383/Windows·새 서버/빌드0 |
| 불변 | 전사5480/3740·idle·방향0·pausedtrue·zoom100, contactOFF | terrain snapshot exact동일 | editor scene JSON exact동일 | 원source/scene/nav/발·기존camera/source 보존 |
| fallback 별도 | 같은 launch에서 window DPR 값을 NaN/Infinity/0/−1/string/undefined로 임시 주입한6조건 | 모두 fallback1 | 1036×714 및 GLerror0 | synthetic invalid-value 관측이며 실제 장치 DPR6개로 계산0. 원 descriptor 복원 |
| 검수 묶음 | 새로운 DPR launch1에 CDP4단계+synthetic6조건, 제품 source 수정 뒤 syntax actual1 PASS | 실패0·이전 성공 suite/Chrome/native6 반복0 | DPR와 아래 parent lease 검사 합산0 | 새 repository 테스트·PNG source·asset 생성0 |

parent rect는 기존 border 포함 값이고 canvas CSS는 border를 제외한 실제 표시 크기다. ratio는 logical rounded dimensions와 실제 CSS denominator를 구분하며 정수 DPR에서 backing/logical 각1·2·2, 소수 Y는 floor 오차다. 새로운 정사영/world→CSS 배율 공식이나 Three zoom1.2를 editor zoom1.2와 같은 배율이라고 정의하지 않는다.

### 실제 화면·해상도·채택 경계

| 항목 | 확인한 값·판정 |
|---|---|
| 화면 근거 | dpr-resize/dpr-1-canvas.png·dpr-2-canvas.png·dpr-3-canvas.png를 작업자가 실제 열람. CSS 기준 screenshot1034×713 각1장. DPR2/3 캡처는759209B/SHA231773da6f5fb9f6b0b25731a757af97db6ee11731560a55353bdef843a258fe exact동일 |
| 화면 판정 | 전사·늑대·바닥·전경 배치 유지와 DPR buffer/cap 동작 확인. 원화 지면·뿌리의 확대 softness는 남음. VISUAL VERDICT: RETOUCH |
| 원화 밀도 | cleanplate1254²→world8000², 8000/1254=6.379585326953748worldpx/sourcepx. source PNG·UV·crop·정적 재질/절벽 depth 추가 수정0 |
| 별도2D 문제 | map-scene-editor.js maskedPicture 장축1024 임시 buffer와 alpha256 sample은 변경0. MAPraw62 prerequisiteFAIL·public 미채택 상태 유지 |
| 별도 실패 | arrival-detail 전체지형 등록 FAIL·contact ON 실화면 FAIL/defaultOFF 유지. 이번 DPR 통과로 접합/ground registration/physical height 개선 완료 선언0 |
| 미인수 | 실물 모니터 transfer·브라우저 UI zoom 자동전환·native6 여정/청취/실보상·영구save·본편 main 연결·장시간FPS·A급 인수0 |
| 전체 docs 검색 | 코드 수정 뒤 docs 전체 확장자 포함 DPR/devicePixelRatio/pixelRatio/2_5d-world-lab 및 해상도 키워드 검색141files/1035matches. own3 current appendix, 관련 root7문서 후속 인계, 타시스템/ownerSTATELOG/과거 영수증은 보존 |
| 외부 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/dpr-resize/receipt.json, browser-result.json, screen-review.json, syntax-result.json, docs-keyword-search.txt, docs-search-disposition.json. 코드·문서 수정전 exactbytes backup 및 prefix 대조 |

### 별도 public parent 입력 lease의 현재 경계

아래는 root가 별도 구현·검수한 입력 소유권 도구다. DPR 코드가 이 모듈을 import하거나 main 입력·simulation을 정지시킨 것이 아니다. 상세 정본은 [키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md) 및 [총괄 마스터](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 ROOT-RIFT-PARENT-INPUT-LEASE-20261007 계약을 따른다.

| 항목 | 정확 현재 public 계약·미인수 |
|---|---|
| 파일·출처 | tools/2_5d/rift-parent-input-lease.mjs12058B/SHA01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676. raw SKILL63/ENEMY64 semanticFAIL 원문보존·direct raw importfalse |
| factory·입력 | createRiftParentInputLease({ports:{readOwned,clearHeld}}). readOwned는 동기 own-data plain {owned:boolean,epoch:safe integer≥0}; authoritative root job epoch, host token/G.revision으로 추정0. readPolicy·suppression 함수는 fresh 소유권 재검사 |
| 해제·실패 | 명시적 현재 inactive만 parent passthrough. owned/unknown/stale/disposed는 input/update/gamepad/facing/자동전환 차단 판정. 최초 owned epoch마다 clearHeld 동기1회·undefined/true만 성공. callback의 this=ports 보존; Promise/throw/truthy는 성공0 |
| 수명·의도 | host 닫힘/dispose만으로 root lease 해제0. classifyProjectedEvent는 advisory only·DOM dispatch/preventDefault/focus를 직접 조작0. root caller의 actual main hook/held release/gamepad 재동기화는 미연결 |
| 검수·인수 | root의 새 stdin1회16groups/288conditions PASS16·FAIL0·exit0. 문서 worker 재실행0, 이번 DPR launch와 합산0. timers0/RAF0/parentState·save·reward 쓰기0/nextStage 호출0/mainAcceptedfalse/nativeAcceptedfalse |

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·판정 |
|---|---|
| STAGE | ROOT-RIFT-LAB-DPR-RESIZE-20261007. 기존 lab resize DPR 업데이트+docs3, parent lease는 별도 완료 경계 인용 |
| MASTER | silhouette/regions/main route/side spaces 기존 유지·설계 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major opening 원화 유지·새 질량 배치0 |
| LARGE | source1254 plate/3전경 composites/crop/overlap/repeated silhouette 유지 |
| MEDIUM | connections/remaining holes·절벽 접합 변경0 |
| GROUND | shadow/contamination/structure integration 기존 유지, 원source 확대흐림 잔여·contact ON FAIL/defaultOFF |
| PLAYABLE | 기존 nav1192 travel/breathing 유지. arenas/threat/combat readability 본편 인수 PENDING·새 native 여정0 |
| LANDMARK | primary 상승문/secondary 균열/tertiary 주민·발 불변 |
| CAMERA QA | 동측 전사5480/3740·zoom100%·CSS고정 DPR1/2/3 화면 실제열람. START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 전체8camera 신규검수0 |
| TECH QA | actual CDP4+synthetic6, GPU13link/error0, syntax1; route/collision/원pin보존. seam 개선·loading 전체회귀·장시간performance 신규인수0 |
| FILES | 소유 lab.mjs resize3줄+기존docs3 append만. concurrent/unrelated 원본source/assets/editor/terrain/game/save/STATELOG 쓰기0 |
| GIT | worker stage/commit/push/deploy0. root가 검수완료code1+docs3 범위 checkpoint·원격exactSHA 기록; 이 절로 push 성공 추정0 |
| VISUAL VERDICT | **RETOUCH**. DPR buffer 갱신 PASS와 원plate1254² 흐림/절벽 접합·본편 미인수 분리 |
| NEXT PASS | 원등록 보존한 고해상도 source 상세·2D buffer 별도 A/B, 실물 DPR 이벤트 수명 및 main input lease 실제caller/update/gamepad Gate·native6/save/audio |

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 부록 — parent lease 최종 핀과 제한 보정 이력

직전 절의 parent lease **12058 B / `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676` 및 16그룹·288조건 PASS는 초기 버전의 검증 이력**이다. 아래가 현재 public 최종 핀과 그 버전에 대한 제한 보정 근거다. 초기 16그룹을 최종 버전에서 다시 실행한 것으로 취급하거나 DPR Chrome 실험과 합산하지 않는다.

| 구분 | 정확한 근거와 결과 | 현재 해석 |
|---|---|---|
| 최종 public 파일 | `tools/2_5d/rift-parent-input-lease.mjs` **12294 B**, SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | root의 최종 구현 핀. 이 문서 보정 담당은 코드 수정·검사 재실행 0 |
| 초기 전체 검사 | 초기 12058 B 핀에서 신규 stdin 1회, 16그룹·288조건 PASS16/FAIL0/exit0 | 기존 검증 이력 그대로 보존; 최종 버전의 전체 검사로 승격 0 |
| 새 제한 검사 최초 실패 | 별도 제한 stdin 1회의 첫 단계 PASS0/FAIL1, 도달 조건 3, unhandled rejection **1** | `readOwned`가 거절된 native Promise를 반환할 때의 실패를 보존. 첫 단계만의 별도 프로세스 exit는 없음 |
| 백업과 최소 보정 | 외부 `parent-input-lease/before-rejected-read-owned.mjs`에 초기 소스 보존 후 제품 코드 보정 **1회** | 원자료 후보·gate·다른 작업자의 파일 변경 0 |
| 같은 제한 stdin의 후속 | 6개 고유그룹·33조건 PASS6/FAIL0/미도달0, **새 unhandled rejection 0**, 전체 프로세스 exit0 | 최초 실패를 지우거나 무상 PASS로 합산하지 않음. 초기 전체 suite 재실행 0 |
| 실제 stdin 실행 수 | 초기 전체 1회 + 새 제한 1회 = 총 **2회** | 새 제한 프로세스 안의 최초 실패/보정/후속 단계를 별도 stdin 실행으로 세지 않음 |
| Promise 처리 경계 | 캡처한 same-realm native Promise prototype, own `constructor` 없음, native prototype constructor 및 캡처한 species getter가 유지된 경우만 거절 관찰 | 동기 ownership은 계속 UNKNOWN. own `then` getter를 실행하거나 비동기 결과를 소유권으로 채택하지 않음 |
| foreign/비정상 Promise | foreign Promise/일반 thenable은 raw `then`을 실행하거나 채택하지 않음. 해당 foreign 검사는 fulfilled Promise와 getter 실행 0을 확인 | hostile foreign 또는 constructor-accessor의 **rejected** Promise를 안전하게 관찰했다는 주장 0 |
| 본편 경계 | parent main hook 0, 실제 gamepad·native·main game·save·reward 인수 0 | root job/epoch의 권한 계약과 동기 `undefined`/`true`만 허용하는 held-clear 계약 유지 |
| 독립 DPR 결과 | DPR code **33105 B / `2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12`**, syntax 1회/실제 Chrome 실험 1회 | parent lease 제한 검사와 별도. source 1254²→world 8000² 확대 흐림과 실물 모니터 전환 미인수 유지 |

근거는 외부 `parent-input-lease/final-receipt.json`과 `parent-input-lease/rejected-read-owned-limited-result.json`이다. root의 관련 키워드 전체 검색은 `rift-parent-input-lease`, `readOwned`, `observeNativeRejection`, `nativeThen`, `unhandled`, `rejection`, `RIFT-MAIN-GATE-PUBLIC`로 **41파일·210매치**를 보존했다. 다른 시스템·owner 이력은 역편집하지 않는다. 정확한 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md)과 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 root 정본을 따른다.

**MAP PRODUCTION REPORT 부록:** 변경 단계는 위 DPR/parent lease 검증 이력의 문서 동기화뿐이며, master·outer mass·medium/ground connection·playable/combat·landmark·small detail·카메라·geometry·nav·원화·주민 발·소스 등록의 새 변경은 0이다. 새 화면/단위검사/실게임/오디오/저장 인수 0, worker Git 변경 0. 직전 §23의 DPR 실제 화면 관찰과 전체맵 판정을 그대로 유지한다. **VISUAL VERDICT: RETOUCH** — parent lease의 실제 화면은 NOT ASSESSED, 전체맵 원본 확대 흐림은 미해결이다.
