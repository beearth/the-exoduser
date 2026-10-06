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
