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

## ROOT-RIFT-CHILD-LIFETIME-20261007 — 로딩 중 페이지 종료와 늦은 자원 수명

현재 `tools/2_5d-world-lab.mjs`는 renderer 생성과 무거운 첫 top-level await 이전에 pagehide를 등록한다. 로딩 중 종료는 초기화를 폐기하고 늦은 소유 자원을 해제하며, 닫힌 페이지의 scene·DOM·ready·RAF를 다시 활성화하지 않는다. 독립 child lab의 수명 보강이며 parent input lease/main 훅, 맵 선명도, 원화, native 플레이 완료와는 별개다.

| id / 적용 위치 / API | 정확 현행 구현 | 경계·불변 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-20261007; `tools/2_5d-world-lab.mjs` **36039 B**, SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 조기 pagehide·dispose·async-init 수명·읽기 전용 진단만 변경. 원 PNG/scene/nav/renderer 수치·DPR 3줄 변경 0 |
| 선행 읽기 | AGENTS 26076 B/`fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4`; guide 18392 B/`607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b`; LOCK 39679 B/`94081b2aef08771384fb2032dab42f12c3cde57227558f8a11b772690e13451a` | 직전 전체 완독 핀과 동일함을 이번에 확인. SSOT 이전 전체 156633 B prefix도 동일, 추가 11017 B는 이번에 전부 읽음. 현재 SSOT 167650 B/`a588deb05dac1a8e57f6f235d95afce69fcfc2841ac137679a8872e2360fcfa0` |
| early pagehide | `window.addEventListener('pagehide',dispose,{once:true})` 1개를 renderer 생성·terrain await 전에 등록 | 모듈 평가가 시작된 이후의 수명. 아직 모듈을 실행하지 않은 의존 모듈 다운로드 구간에 리스너가 있다고 주장하지 않음 |
| epoch / ready | lifecycleEpoch=0 / initializationEpoch=0. 최초 dispose는 disposed=true·ready=false·epoch+1·anchorJob=null·keys.clear·attackQueued=false를 외부 cleanup보다 먼저 적용 | 반복 dispose는 즉시 반환. epoch·해제 시도 추가 0, 폐기한 페이지에서 초기화 재개 0 |
| `releaseResource(resource,release,kind)` | object/function identity를 해제 시도 전에 WeakSet에 기록. 같은 identity 시도 1회; 각 release는 독립 try/catch | 한 자원의 throw가 이후 다른 해제를 막지 않음. throw한 같은 자원 재시도 0. cleanupFailures는 잡힌 해제 예외 수이며 GPU-free 성공 수가 아님 |
| 해제 대상 | observer.disconnect, reduced-motion listener 제거, effects, helper geometry/material, wolf abort, wolf, rigs, specialMotion, contactUnderlay, terrain, shadow geometry/material, renderer, interactionCue, residents, dialogue.close('pagehide') | 존재하는 자원만 시도. factory 내부 세부 자원과 실제 GPU 해제는 factory/브라우저 검수 경계. 강제 context-loss API 추가 0 |
| `takeInitialized(resource,kind)` | epoch 일치·disposed=false일 때만 소유 변수에 대입. 늦은 resource는 lateResourceRejected+1, release 시도 1회 뒤 종료 오류 | terrain/contact/residents/각 rig/special/wolf await 결과에 적용. 늦은 결과를 scene에 추가하거나 ready로 승격 0 |
| 비자원 await guard | canonical fetch·arrayBuffer·assessRegistration, STORY fetch·arrayBuffer·SHA digest 뒤 `ensureInitialization()` | 뒤늦은 Promise 완료 후 다음 초기화 진행 0. 새 polling/타이머/RAF/파일·세이브 쓰기 0 |
| async scene attachment | resident/special factory에만 `initializationScene` add/remove 전달. add는 epoch·disposed 확인 후 종료 상태 거절; remove는 기존 scene.remove로 해제 허용 | factory 내부 늦은 scene.add도 차단. factory 자체 해제는 caller release count와 별도. source/world/geometry/nav 등록 변경 0 |
| fail / 최종 등록 | fail(error)는 disposed이면 UI·오류 상태를 다시 쓰지 않음. ready 승격 직전 epoch 검사. 폐기 상태에서는 후단 키 이벤트와 `__rift25Lab` 신규 노출도 수행하지 않음 | 살아 있는 페이지의 실패 UI 유지. child 폐기로 parent root job/epoch 권한 해제 0 |
| readonly 초기 진단 | 첫 await 이전 `window.__rift25Lifecycle=Object.freeze({snapshot})`. snapshot은 새 frozen record와 새 frozen counts 반환 | ready:boolean, disposed:boolean, frames:number, raf:boolean, epoch:number, cleanupFailures:number, rendererCreated:boolean, lateResourceRejected:number. mutable release 함수·renderer·자원 handle 노출 0 |
| `disposeAttemptCounts` | 시도한 kind별 nonnegative integer: observer, reduced-motion-listener, effects, helper-geometry, helper-material, wolf-abort, wolf, rigs, special-motion, contact-underlay, terrain, shadow-geometry, shadow-material, renderer, interaction-cue, residents, dialogue | 미시도 kind는 필드 없음. rendererCreated는 생성 여부라 disposed 뒤에도 true일 수 있음. count는 시도 횟수로 실제 GPU/native 인수가 아님 |
| 늦은 자원 진단 | lateResourceRejected는 종료 뒤 takeInitialized 또는 guarded scene.add에서 거절한 횟수 | canonical/STORY bytes는 소유 GPU 자원이 아니므로 이 counter로 세지 않음 |
| 기존 렌더·보행 | 대표 foot5480/3740, nav1192, angle50/scale400, DPR cap2·양의 분수·invalid fallback1 기존 3줄 그대로 | source1254²→world8000² 확대 흐림, 2D mask1024, contact 기본 OFF·실패 이력, 본편/native6·오디오·세이브 미인수 경계 유지 |

### 제한 검수 이력 — 하네스 실패·성공 이력·최종 핀 분리

| 구분 | 실제 실행·결과 | 의미 |
|---|---|---|
| ANIM 메모리 선행 근거 | 공식 end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`, 2026-10-06T19:33:53.039Z. `animParentChildLifetime20261007LatestReceipt-root-observed.json`의 평탄 해제 체인 모델 3/3 PASS | 전문 memory 이력이며 새 public 제품 검사가 아님. 재실행 0, 실제 iframe/pagehide/GPU 미관측 |
| 제품 syntax | 초기 lifetime patch에서 node --check 1회 exit0 | 이후 add/remove guard·readonly 진단 추가. 최종 소스 parse/evaluate는 제한 VM 후속에서 검증; 최초 syntax를 최종 전체 런타임 인수로 승격 0 |
| 최초 actual-source VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`; 신규 의미 실행 1회, 10그룹 중 PASS5/FAIL5/110도달조건, exit1 | 5 FAIL은 mock STORY bytes가 빈 JSON이라 resident/rig/special/wolf 단계에 미도달한 하네스 결함. 제품 늦은 자원 실패를 관측한 것이 아님. 성공5 재실행 0 |
| 두 번째 Node 시도 | 외부 stdin 하네스 객체의 닫는 중괄호 누락으로 SyntaxError, 제품 도달0/검사그룹0/exit1 | tooling 실패 이력 별도 보존. 제품FAIL·제품 의미 실행으로 섞지 않음 |
| 제한 후속 준비 | 외부 `limited-followup.mjs` syntax-only 1회 exit0 | repo 새 검사 파일 0. 최초 성공5·DPR·memory3·host·interop·Chrome 재검사 0 |
| 최종 핀 제한 후속 | 36039 B 최종핀 actual-source VM 의미 실행 1회, 앞선 미도달5만 **PASS5/FAIL0/100조건/exit0** | 실제 immutable STORY 25940 B/SHA `be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc`. GPU·DOM·factory는 mock, 신규 readonly snapshot도 같은 후속에 검증 |
| 후속 확인 내용 | resident/special 내부 add 차단, warrior/silvertail/dark-druid 각 rig 경계, 늦은 wolf 해제, terrain/renderer/cue dispose 3개 throw에도 후속 해제, identity 1회·재폐기0·snapshot detached/frozen | 초기5+최종5를 같은 핀 전체10 PASS로 합산하지 않음. 110+100도 최종 단일조건 수로 합산 0 |
| 실행 총계 | 제품 소스를 실행한 의미 검수 2회. 하네스 parse 실패 포함 해당 Node 실행 3회. 제품 syntax1·외부 harness syntax1은 별도 | 실제 about:blank/pagehide·GPU 해제·WebGL은 root 단일 Chrome QA까지 PENDING. 이 담당 Chrome0/native0 |
| docs 전체 검색 | pagehide/dispose/async.init/수명/2_5d-world-lab/late terrain·rig·wolf 및 신규 epoch/adopt/scene/release 이름으로 **239파일·2649매치** | child-lifetime/docs-keyword-search.txt 원문과 docs-search-disposition.json 보존. own3 정확 추가, 다른 시스템·owner 역사·관리 정본은 root 소유로 역편집 0 |

외부 영수증·원 fullbytes 백업·최초 실패와 제한 후속 raw는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime/`에 있다. 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md), 전체 운영과 root 관측은 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 정본을 따른다. 예약 root job의 owned/epoch와 child 폐기는 별개이며 child dispose로 부모작업 재개를 허가하지 않는다.

### MAP PRODUCTION REPORT — §23 / child lifetime

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-20261007 독립 child lab async-init·teardown 보강. guide/SSOT/LOCK 선행, 최하층→상승 목표 유지 |
| OUTER MASS / LARGE | 원화·실루엣·opening·랜드마크·crop·UV·source 등록 변경 0 |
| MEDIUM / GROUND | 절벽 접합·고도·geometry·보행1192·주민 발·start/exit 변경 0 |
| PLAYABLE / COMBAT | 독립 lab 자원 수명만 보강. 본편 입력·전투·보스·Q 전용 magic 패링/E 불가·어택티켓 금지·보상·세이브 변경 0 |
| LANDMARK / SMALL DETAIL | 원 PNG·atlas·리깅·주민 스케일·모션 수치·조명·detail 변경 0 |
| CAMERA QA | 새 브라우저·8카메라·실 GPU·DPR A/B 실행 0. root 새 Chrome 관측 전 PENDING |
| TECH QA | 초기 의미1 PASS5/하네스미도달5 보존; 두 번째 tooling parse 실패 제품도달0; 최종 제한 의미1 PASS5/100조건/exit0. 성공 이력·memory·DPR·host·interop 합산/반복 0 |
| FILES | tools/2_5d-world-lab.mjs 지정 수명 구역과 own docs3만. 기존 docs fullbytes prefix100%+LF append/EOF LF1. 타인 WIP·전문 raw·game·STATE 쓰기 0 |
| GIT | worker add/commit/push/reset 0. root가 완료 code1+docs3 한정 checkpoint. 여기서 원격 보존 성공 추정 0 |
| VISUAL VERDICT | **RETOUCH** — 기존 전체맵 확대 흐림·경계 미해결. 이번 수명 실화면은 root 관측 전 NOT ASSESSED. pure PASS를 visual PASS로 대체 0 |
| NEXT PASS | root 단일 실제 Chrome에서 초기 await 중 about:blank/pagehide·ready/RAF 미부활·해제 시도 관측. 실제 GPU 해제·native 플레이·오디오·durable save 별도 |

## ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007 — 실제 child 수명 인수 / 최종 소스 동결

직전 ROOT-RIFT-CHILD-LIFETIME-20261007의 실제 브라우저 수명 QA PENDING은 아래 **한정 실제 Chrome 실험**에서 확인한 범위만 완료로 갱신한다. 최종 public 소스는 36039 B/SHA `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`로 동결되어 검수 중 제품 변경 0이다. 미완료 HTTP 응답 중 취소, OS/드라이버 물리 GPU 메모리 반환, 본편/native6·청취·저장 인수는 이 실험의 완료로 계산하지 않는다.

| 항목 / API·증거 | 실제 새 관측 | 인수 범위·제한 |
|---|---|---|
| 실행 / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007; 신규 Chrome 실험1/launch1/context1/parent page1/직렬 child document6 | 기존 DPR·VM·memory3·host·interop 검사 재실행 0. screenshot2, 새 harness 실행1, process exit0 |
| 고유 검수 | 신규 **6그룹 PASS6/FAIL0**, 관측 subcheck **21/21 PASS**, partialUnknown0 | 아래 수명 범위의 검사 상태. 물리 GPU 메모리 UNKNOWN을 전체게임 PASS로 승격하지 않음 |
| 정상 actual GPU 해제 | ready child를 실제 host.cancel 경로로 닫고 native pagehide 관측. cancellation frames13→late 후13, ready=false/disposed=true/epoch1/RAF=false/actual RAF pending0 | 이미 ready였던 lab port는 존재하지만 ready·draw·RAF·DOM은 부활하지 않음 |
| terrain 늦은 반환 | 실제 factory 생성완료 결과를 return gate에서 보류→실제 취소→gate 해제. lateResourceRejected1, actual dispose completion1, frames0→0 | source fetch 지연 요청100ms/관측103ms 뒤 반환 gate가 취소 지점. 미완료 응답 취소 실험이 아님 |
| residents 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | atlas fetch 지연100ms/관측102ms. 실제 주민 factory 사용, mock/source-regex 대체 0 |
| 첫 rig 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | 첫 rig 이미지는 browser cache를 재사용해 새 matching fetch 없음. 실제 factory 결과 반환 경계는 관측 |
| special-motion 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | dive 원화 fetch 지연100ms/관측102ms. renderer 업로드·렌더 전 결과 보류의 범위 |
| cleanup 예외 격리 | 실제 terrain.dispose를 먼저 실행한 다음 예상 예외1 주입. cleanupFailures1, 나머지 renderer/residents/dialogue 등 release 지속, frames6→6 | factory/GPU를 mock으로 교체한 예외 검사가 아님. 이미 실제 release를 호출한 뒤 주입한 throw임 |
| native 종료 / 비부활 | trusted native pagehide **6/6**; 각 child에서 종료 뒤 draw0/DOM mutation0/actual RAF pending0, ready=false/disposed=true/epoch1 | synthetic pagehide0. 여기서 native는 브라우저 DOM 이벤트이며 게임 milestone native6가 아님 |
| 실제 native GL delete | 정상 ready 해제와 예외 주입 해제 **각각** deleteProgram13/deleteTexture13/deleteBuffer38 | 두 그룹 수를 전체6의 단일 총량으로 합산하지 않음. GL delete 호출·JS dispose는 물리 GPU memory-free 증거가 아님 |
| 늦은 반환 GL 경계 | terrain deleteProgram0/texture0/buffer0; residents·rig·special는 각각 program5/texture0/buffer0 | 늦은 실제 자원은 gate 반환 전에 렌더/업로드하지 않았음. texture/buffer delete0을 driver allocation 부재·메모리 반환 인수로 해석하지 않음 |
| 오류 / 외부 쓰기 | pageerror0/consoleError0/HTTP error0/foreign request0/mutation request0/download0, native GL error 종료 전후 child6 각각0 | source18 전후 exact, editor scene·격리 storage 불변, productCodeChangesDuringQA0. 실험 worker repo/Git 쓰기0 |
| old realm 관측 | QA parent가 제거된 child의 readonly snapshot과 gate resolver를 의도적으로 보존하여 실제 pagehide 뒤 late return 관측 | 일반 discarded realm이 다시 실행된다는 주장 0. 생산용 mutable resource handle·추가타이머·RAF·scene/nav/source 변경 0 |
| readonly 진단 | 실제 `__rift25Lifecycle.snapshot()`의 ready/disposed/frames/raf/epoch/cleanupFailures/rendererCreated/disposeAttemptCounts/lateResourceRejected와 native draw/delete/pagehide 관측 | disposal count는 실제 시도 횟수. 강제 context loss·OS GPU 메모리 계측 추가 0 |
| 시각 관측 | actual ready canvas와 normal parent return의 실제 screenshot2 직접 검수. 한정 ready/return UI PASS | 전체맵 **VISUAL RETOUCH** 유지. source1254²→world8000² 확대 흐림·작은 raster 캐릭터 미해결, A급·맵 선명도·본편 완료 주장 0 |
| 실제 물리 GPU | physicalGpuMemoryFreeAccepted=false / **UNKNOWN** | native delete13/13/38이나 renderer.dispose1을 드라이버 메모리 반환으로 승격 0 |
| 본편 / 저장 / 청취 | actualMainGame=false, native6Accepted=false, audioAccepted=false, saveAccepted=false | main 연결·전투/획득/보스 사망·부활·재도전·durable save·청취 인수는 별도 |

정상 ready와 예외 주입 child에서 readonly releaseAttemptCounts는 observer1/reduced-motion-listener1/effects3/helper-geometry3/helper-material3/wolf-abort1/wolf1/rigs3/special-motion1/contact-underlay1/terrain1/shadow-geometry1/shadow-material1/renderer1/interaction-cue1/residents1/dialogue1을 관측했다. loading gate child는 당시 이미 생성한 자원과 늦은 해당 자원만 각각 시도1이며, 미생성 자원의 count를 만들어 채우지 않는다. loading 4개 child에서 lab port 신규 노출은 false, 정상·예외 ready child는 기존 port가 true인 채 disposed/ready=false를 유지했다.

### 독립 증거·이력 핀

| 증거 | 정확 bytes / SHA256 | 구분 |
|---|---|---|
| public source | 36039 B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 브라우저 actual6/21과 최종 VM5/100은 같은 소스라도 **서로 다른 검사**로 유지 |
| acceptance-summary.json | 11120 B / `d7d5b4df81b6c70c8bacee8ec0828bb8470e170a16b8ae5f4278f5701e275bb4` | 신규 actual Chrome6/21 요약 |
| raw-result.json | 84980 B / `9a6b60b96fe30a81fc6672bfc7734f82cf16171a9b6619c7fcf92b28c23a0da5` | 실제 native event·GL·source18·gate 원 관측 |
| map-production-report.txt | 2601 B / `82a591ad9eb945e3c3f4b9baa9f1e5ad4e229ab01010ff3f2f656cc3067eebb3` | §23 실제 수명 QA, VISUAL RETOUCH |
| actual-ready-gpu.png | 913111 B / `2e094e4b27c005382b17a13ae0d001730d762de55068266fcc8fbacb6f7baf14` | 실제 ready UI 화면 |
| parent-after-cleanup.png | 1242952 B / `ba81df0e7e7e99de9be6ea2b39311d51ad2da552fccc8798dccf5c875522b7e3` | 실제 parent return 화면 |
| 초기 prototype VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`: PASS5/하네스미도달 FAIL5/110조건 | 원 핀 이력 보존. 제품FAIL/현재 전체PASS로 바꾸지 않음, 재실행0 |
| 하네스 parse 실패 | 두 번째 Node 시도 제품도달0/그룹0/exit1 | tooling 이력 보존; actual Chrome 실패나 제품 의미검사로 합산0 |
| 최종 VM 한정 후속 | 최종36039핀에서 PASS5/FAIL0/100조건/exit0 | 최초 성공5 재실행0. 이 5/100과 actual6/21을 11그룹·121조건의 같은 검사로 합산0 |
| 전문 memory | end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`의 모델3PASS | 전문 이력과 이번 실제 소스/GPU 관측 분리, 재실행0 |

실제 QA 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime-browser/acceptance-summary.json`, `final-receipt.json`, `map-production-report.txt`다. 문서 담당은 이 결과만 읽어 own3에 원 fullbytes prefix100%+LF append/EOF LF1로 동기화했으며 코드·검사·브라우저·Git 실행0이다. 전체 docs 관련키워드검색은 ROOT-RIFT-CHILD-LIFETIME/__rift25Lifecycle/pagehide/deleteProgram/deleteTexture/deleteBuffer/physical GPU·GPU 메모리/2_5d-world-lab로 **69파일·535매치**, 원문과 파일별 disposition를 `child-lifetime-browser/docs-sync/`에 보존했다. 다른 root 관리·메인 문서와 owner 이력은 역편집0이다.

### MAP PRODUCTION REPORT — §23 / 실제 child 수명 QA 문서 인수

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007의 한정 실제 child 수명 인수. 기존 맵 SSOT·guide·LOCK·최하층 상승 목표 유지 |
| OUTER MASS / LARGE | silhouette·regions·main route·source18·원PNG/composite/crop·UV·opening 변경0 |
| MEDIUM / GROUND | 연결부·낭떠러지·shadow·contamination·geometry·nav1192·등록·foot·start/exit 변경0 |
| PLAYABLE / COMBAT | 실제본편/native6 인수0, arena/travel/threat/combat readability 새 검수0, 보상·저장·보스·보호2_3·Q-only/E 불가·어택티켓 금지 변경0 |
| LANDMARK / SMALL DETAIL | 기존 랜드마크·상승문·주민·소스·모션·detail 변경0 |
| CAMERA QA | 기존8카메라 반복0. 신규 ready/return 실제2화면을 QA가 관찰, camera 수치 변경0 |
| TECH QA | actual Chrome launch1/context1/parent1/child6, 새6그룹 PASS/관측21 subcheck PASS, trusted pagehide6/6/GLerror0, 늦은4 실제 자원 각 dispose1, 정상·예외 각각 native delete13/13/38, 비부활0 |
| FILES | 문서 담당 own docs3만 원문 prefix100% LF append/EOF LF1. 실제QA는 외부 계획/runner/raw/요약/화면만, code source36039/8388 동결 |
| GIT | 담당 stage/commit/push/reset0. root 완료소유 checkpoint 담당, 여기서 remote 성공 추정0 |
| VISUAL VERDICT | **RETOUCH** — 한정 ready/return UI PASS와 전체맵 판정 분리. 물리 GPU 메모리 UNKNOWN/본편·native6·audio·save false |
| NEXT PASS | root 실제 본편 연결·게임6단계·오디오 청취·save/reward 인수. 신규 수명6/21 또는 옛 성공검사 재실행0 |


## 2026-10-07 ROOT-RIFT-MAIN-SEAM: 정상 전환 소스 연결과 신규 소비자 화면

| id·적용 위치 | 현재 값·구현·인수 경계 |
|---|---|
| ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 | game.html 4050426B / SHA256 ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230; tools/2_5d/main-rift-runtime.mjs 7519B / SHA256 b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69. 初期 game4039085B/4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd bytebackup 및 최종15접점 역변환 원문 exact |
| 실행 범위·원 DEMO | location.origin === http://127.0.0.1:3387일 때만 lexical root 소비자 활성. 정상 _proceedNextStage clear-route에 소스 hook 구현, 사용자3333/3340/file 경로 동작과 기존 demo terminal nextBtn은 유지. _DEMO_MODE=true/_DEMO_LAST_STAGE=0 기본 CH1-1은 terminal branch를 우회하지 않아 허브 진입 PENDING |
| 실제 capture·admission | _rootRiftBegin 이전의 P/G/player/context/stage/_charId/_charIdx/difficultyOff=(G._stageDiffOff??0)/difficultyIndex=(OPT.diff??5)/save=dbSave/saveReady=_dbReady/status=P.s/previousOn=G.on을 root job에 보존. stage safe integer>=0, hp finite>0, stageCleared===true/bossAlive===false·charIdx범위·MAX_SAFE_INTEGER epoch 경계·dead/fallen/reviving/lastStand 차단. 정상 clear의 G.on=true 및 _bossArena=true 자체를 오인 차단하지 않음. G.on=false 전환 뒤 held clear, 기존 dbSave 호출1 await 및 import·enter 뒤 동일 capture 검사 |
| input·epoch | _rootRiftEpoch/job이 권한 정본. _clearHeldInput 이후 _gpClearAll, _gpSynced=false·axes0·G._gpAiming=false. held restore0. update 맨앞(systemLesson/panelkey 이전), gamepad poll/inject/direct WASD/facing/autoAim, autoNext·nextStage에 lease guard. parent capture quarantine은 legacy gameplay 이벤트를 차단하고 host native modal 컨트롤 및 자기 Continue를 허용. init-stage/boot-loading/retry/char/lobby/hidden/pagehide에서 matching-job 무효화; advancing 중 자기 init-stage/boot-loading은 예외 |
| runtime API | createMainRiftRuntime({window,document,ports}); ports own functions readOwned/clearHeld/isCurrent/readHostContext/readGateState/schedule/release. enter(captured), continueStage(), parentEvent(event), block(channel), finished(captured), cancel(reason), dispose(), snapshot(). foundation publichost17683/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38·gate16280/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd·lease12294/d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1은 변경0 |
| Continue·5000ms·900ms | 자기 leaf button '위로 올라가기 · 다음 구역', click·Enter/NumpadEnter/Space 명시동작만 continue. gate.restore()/dispose()로 hostUI만 닫고 gate.cancel0; rootowned는 예약5000ms 동안 유지. 현재job 검사→gate one-shot commit1→현재job 재검사→기존 nextStage1. 성공한 fade900ms는 별도 curtain epoch와 boot epoch로 보호. parent Escape 등 advanced 이외 matching-job release는 자기 curtain RAF/wait/hide를 즉시 cancel; queued old callback이 새job/새curtain을 취소하지 않음 |
| 상태·캐릭터 | readHostContext {player:P,character,stage:G.stage,context:G,on:G.on,stageCleared,status:P.s}; readGateState {stage,stageCleared,status:'clear-continue',difficultyOff,contextId:epoch}. character는 _charIdx===1이면 silvertail, 그 외 warrior인 host admission 문자열이며 child P/char 연동 인수가 아님. runtime snapshot.mainSeamConnected=true는 소스 연결 상태; actualStageAdvanceAccepted/childCharacterLinked/saveAckAccepted=false, save/reward/RAF/timer0는 runtime 자신 범위. classicgame curtain timer는 위 별도소유. __riftMainIntegration.snapshot()의 durableSaveAccepted/demoHubAccepted/childCharacterLinked=false |
| source 검수 이력 | 구 game4050167B/f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3에서 신규 source9그룹133조건 PASS9/FAIL0/exit0. final ece8에서 matching-job Escape 취소 보정 신규 제한2그룹20조건 PASS2/FAIL0/exit0. 원9/133 재실행0/최종전체suite로합산0. 최초 syntax checker는 importmap JSON 오분류로 변경 main/module 도달 전 실패; 보정 checker의 main+module syntax PASS와 final 제한section parse를 별도 보존 |
| 신규 소비자 실제 DOM | ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007: 고유3그룹/15subchecks PASS/exit0, 실제 Chrome launch1/context1/QA부모page1/child3직렬. runtime의 실제 자기 Continue click·Enter 각각 hostUI/polltimer0·예약 rootowned/leaseblock 유지·지연 permissiontrue1/duplicatefalse1·모의advance1. 예약 중 trusted W downstream0, Escape release(parent-escape)1→oldcallback2false·모의advance0. publiccode5+원자료6 핀11 exact/gamefinal핀 전후 exact; pageerror/console/HTTP/외부·변경요청0 |
| DOM fixture의 한계 | QA 부모는 detached P/G/stage1 ports로 실제 runtime과 host iframe을 연결한 fixture. 실제 game.html·nextStage·5000ms/900ms·save·본편 held/gamepad/update·mobile 인수0. 이 신규3/15는 이전 host-gate interop4·source9/133·final2/20·child수명6/21과 합산·반복하지 않음 |
| 문서·외부 영수증 | API·save/input/editor 계약은 키바인딩/세이브/RIFT_DIALOGUE_PUBLIC_CONSUMER/HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/_MAP_SSOT_INDEX 정본6 및 lifecycle3·rootops6에 정확 동기화. 외부 main-seam-integration/rig-motion-implementation/final-receipt.json·handoff.md와 runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·runtime-owned-continue-ready.png·runtime-click-scheduled.png·runtime-escape-cancelled.png를 구분. 앞선 child 수명 code1+docs9 정상 보존 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f |
| 다음 승인 미완료 | 기본 demo1-1 종료→허브 정책/실제캐릭터 전달, NPC 유품·부탁의 명시선택과 동일save ledger의 async durable ACK, 맵 확대 흐림/절벽·전경 재질접합, 실제 editor/main/native6·청취·보상save 검수. 기존 tools/map-scene-rift-dialogue.mjs session choose(actualGrant:false) 또는 async void dbSave의 resolve를 durable 승인으로 간주0. 24시간 제작은 완료핀·보존 후 다음 미완료를 이어가며 기존 owner 송신독점/거절경계/타인WIP·user save·원PNG·scene/nav/보호2_3/Q전용/어택티켓금지 유지 |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL 순서에서 지형·원PNG·scene/nav 수정0, 기존 2.5D 보행화면을 normal parent consumer에 연결; CAMERA 신규 desktop Continue/예약/취소 UI PASS, 맵 RETOUCH; TECH source 핀·prototype/final/신규DOM fixture 분리, 실제 main(native6)·audio·durable save 미인수. 관련 docs 전체검색·fullprefix backup·새 append EOF LF1·완료소유 code+docs 정상 commit/push/remote exact은 외부보존 영수증으로 확인. VISUAL VERDICT: RETOUCH. 소스 구현과 실제 CH1-1 플레이 인수를 구분하며 A급완성 선언0.


## 2026-10-07 ROOT-ACTOR-OWNED-DISPOSE-20261007: 효과 소유 자원 해제의 예외 격리

`tools/2_5d/actor-effect-lifetime.mjs`의 private `dispose()`만 보강했다. 한 mesh/material/shared geometry 해제의 예외가 나머지 자원 해제를 중단하지 않으며, 모든 시도 후 기존 lab의 `cleanupFailures` 소비자가 알아볼 수 있는 고정 메시지 Error를 던진다. 새 raw69 모듈을 producer에 대체하거나 직접 import하지 않는다. 이 절의 CPU 검수는 실제 브라우저·GPU 해제 또는 본편 인수가 아니다.

| id·적용 위치 | 정확 계약·현재 값 |
|---|---|
| source 이전 핀 | actor-effect-lifetime.mjs 11238 bytes / SHA256 c4fd8fdce92b61d086f480a0466e1dfa37fac9b49b4f1bfc20368318d545a3ab. 변경 전 fullbytes 외부 백업 보존 |
| source 완료 핀 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. dispose L182–216만 변경; 새 구역을 원 dispose로 역변환하면 원본 전체 bytes와 일치 |
| API·provenance | createActorEffectLifetime({THREE,scene,camera,terrain,options}) → frozen {update,onActorChange,onSceneChange,dispose,snapshot}; default export와 ACTOR_EFFECT_DEFAULTS/ACTOR_EFFECT_PROVENANCE 변경0. ROOT-ADOPTED 원출처 9201 bytes / SHA256 1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400 유지 |
| 종료·capture | 반복 호출이면 즉시 0. 첫 호출은 disposed=true로 generation을 닫은 뒤 그 시점의 all.slice()를 capture한다. 생성 시점 빈 목록을 복사해 놓는 방식0 |
| mesh·material | capture된 각 entry의 mesh/material 조회를 독립 시도. 같은 mesh는 identity Set에 먼저 기록하고 visible=false 및 scene.remove(mesh)를 각각 독립 시도. material은 별도 resource identity Set에 먼저 기록하고 dispose가 함수인 경우 호출 |
| shared geometry | dustGeo/attackGeo는 풀 전체가 공유하는 factory 소유 geometry이며 entry마다 해제0. 모든 material 후 같은 resource Set을 통해 해제한다. 동일 handle은 종류가 겹쳐도 dispose 최대1회. borrowed scene/camera/terrain 자체 dispose0 |
| 실패·finally | entry 조회·hide·remove·resource.dispose에서 잡힌 예외마다 failures+=1. caught error의 message 조회0. finally에서 live/free length=0, stats.active=false/reason='disposed'/live=0/pool=0. 전 시도 뒤 failures>0이면 Error('actor effects 소유 자원 해제 실패: N')를 throw |
| return·재호출 | 성공 첫 dispose는 기존 all.length 숫자를 반환한다. 빈 풀은 0, duplicate entry는 역사적 entry 수 그대로 반환. 실패 첫 dispose도 종료 상태를 유지하며 다음 dispose는 0, 재시도·중복 해제0. snapshot.meshes=all.length 유지 |
| 진단의 의미 | active=false/reason='disposed'는 수명 닫힘이다. 실패한 resource의 물리적 GPU 반환 성공을 뜻하지 않는다. lab releaseResource가 controlled Error 1개를 catch하면 cleanupFailures는 1 증가; 메시지 N은 내부 예외 수이며 둘을 혼동0 |
| 고정값·렌더 | maxLive24, dustLifeMs520, attackLifeMs240, stepMinIntervalMs110, footBand4320, dustColor0x1a140f/opacity0.5/size0.14, attackColor0xc8623a/opacity0.8/size0.17, groundLift0.003, reducedMotion=false/depthTest=true defaults 유지. lab 공급 size 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145 및 depthTest=false 변경0 |
| 범위 제외 | update/clear/spawn/onActorChange/onSceneChange/snapshot, reduced-motion 재생성 및 factory 생성 예외·재진입 조사 변경0. 추가 helper/import/RAF/timer0. worldlab·main code2·원raw69·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0 |

| 신규 제한 검수 그룹 | 조건 수 | 결과·근거 |
|---|---:|---|
| 현재 생성된 소유 풀·성공 숫자 | 8 | PASS; 나중에 생성된 실제 Three Mesh 2개를 해제하고 첫 return2, borrowed 해제0 |
| remove 예외와 기존 lab 실패 집계 | 9 | PASS; 첫 remove throw 후 나머지 remove/material/shared 해제 지속. 현행 releaseResource 소스를 VM에서 소비해 cleanupFailures1 및 시도1 확인 |
| 동일 소유·shared identity | 7 | PASS; 두 entry가 같은 실제 Mesh/material/geometry를 가리켜도 각 handle1회, return2/다음0 |
| geometry entry별 해제 금지 | 5 | PASS; factory shared geometry2만 해제하고 원 mesh.geometry 관계 유지 |
| material 예외·고정 메시지·종료 상태 | 7 | PASS; throwing message getter를 가진 예외의 message를 읽지 않고 fixed Error 실패1, 후속 자원 도달·재호출0 |
| 빈 풀·종료 후 spawn 차단 | 5 | PASS; 빈 풀 숫자0, factory geometry2 해제, 이후 update 새 mesh0 |
| 공개 계약·dispose 밖 bytes | 6 | PASS; API/defaults/provenance 동일, dispose 역변환 전체 원문 exact |
| 실행 단위 | 47 | 신규 Node stdin 1회, 고유7그룹 PASS7/FAIL0/exit0. 저장소 Three r160 CPU 객체와 자원 method 예외 주입. 기존 팀14·child6/21·DPR·runtime DOM 검사 재실행·합산0 |

전체 docs 관련키워드 검색은 코드 변경 후 제외 경로 없이 수행했다. `actor-effect-lifetime`, `actor-effect-release`, `createActorEffectLifetime`, `dustGeo`, `attackGeo`, `cleanupFailures`, owned/dispose 관계는 22개 파일·336개 매칭 줄이며 원출력은 외부에 보존했다. 이 소유 문서3에는 현재 해제 계약을 동기화한다. API·수명·렌더 값이 그대로인 기존 캐릭터/애니메이션 참조는 유지하고, root 소유 운영문서 및 raw69 완료 이력은 root가 새 완료 단위와 구분해 동기화한다. 원raw69 productionAdopted=false 및 팀14 PASS 이력을 이 구현 인수로 승격0.

증거·fullbyte backup 위치: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-20261007/`의 preflight.json, before/1.before–4.before, dispose-replacement.json, limited-check-result.json, docs-keyword-search.txt, docs-search-summary.json, docs-search-disposition.json, source.diff, final-receipt.json. 문서3은 root 최신 main append를 포함한 원 fullprefix를 100% 보존하고 새 append EOF LF1을 유지한다. 코드+docs 완료소유 commit/push·원격 exact SHA는 root가 수행할 다음 보존 단계이며 이 지원 작업에서 Git mutation0.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원 지형·원화·nav·접지·전투 변경0; CAMERA 신규 화면 검수0; TECH 소유 효과 dispose 신규 CPU7그룹47조건 PASS, 기존 시각/GPU 이력 재실행0·새 핀 GPU 미인수. 맵 확대 흐림·재질 접합 개선을 주장하지 않는다. VISUAL VERDICT: RETOUCH. actual main/native6/audio/durable save 미인수 유지, A급완성 선언0.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.


## 2026-10-07 ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007: 종료·중첩 요청을 보호하는 효과 재생성

현재 `tools/2_5d-world-lab.mjs`는 OS reduced-motion 변경의 효과 재생성 consumer를 보강했다. 정상 변경은 기존처럼 동기로 반영하며, cleanup/factory/cue 콜백이 종료나 새 요청을 일으킨 경우 오래된 루프가 효과를 다시 등록하지 않는다. 이 절은 앞선 계획의 구현0 상태를 갱신한다. producer의 부분 할당·등록 전 재진입 문제는 여전히 별도 미해결이다.

| id·적용 위치 | 정확 현재 계약·수치 |
|---|---|
| 완료 코드 | worldlab 39715 bytes / SHA256 050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8. 이전36039 bytes / SHA256 8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93 fullbytes 백업. 소유9접점 역변환 전체 원문 exact |
| producer 불변 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. raw69 직접import/전체producer 대체0. 이전 dispose CPU7/47·Chrome 오류 이력을 이 소비자 검사로 교체0 |
| createEffects L276 | createEffects(id,reducedMotion=reducedQuery.matches). ensureInitialization()을 먼저 호출하고 actor factory에 raw scene 대신 initializationScene add/remove facade를 공급. geometry/color/opacity/defaults/DPR 값 변경0 |
| 초기 등록 L428 | local effect=createEffects(id) → takeInitialized(effect,'effects') → effects[id]=effect. 초기 ready=false를 이유로 생성 자체를 막지 않으며, 생성 콜백 중 종료한 뒤 반환된 완성 handle은 epoch 확인 뒤 해제하고 등록0 |
| 실행 가드 L280 | 재생성은 state.ready 및 !disposed/!error/!contextLost, lifecycleEpoch===initializationEpoch일 때만 허용. cue·old cleanup·factory 각각 반환 후 captured epoch와 current request identity 및 소유 slot identity 재검사 |
| 요청·phase L282·L289 | private effectRebuildGeneration은 0 시작, 요청마다 증가하며 Number.MAX_SAFE_INTEGER=9007199254740991에서 진단 숫자 포화. 요청마다 fresh frozen identity를 생성하므로 숫자 포화에서도 stale publication 차단. owner phase는 cue/retiring/creating/publishing, 종료 후 idle |
| 중첩 latest pending | owner가 있으면 새 요청 identity와 pending=true만 보존하고 즉시 반환. cue/cleanup/factory를 재귀 실행0, finally에서 즉시 재실행0. 한 pending boolean·한 latest request만 보존하며 actor id 목록·reducedMotion boolean은 accepted job 시작에 capture |
| retire·해제 | effects[id]=INERT_EFFECT를 old cleanup보다 먼저 설정. 실제 old controller는 기존 releaseResource를 소비해 identity를 callback 전에 WeakSet 기록하고 controlled cleanup Error를 cleanupFailures에 집계. 한 actor 해제 실패가 다른 actor 재생성을 막지 않음 |
| 생성 실패·새 참조 | factory 예외는 effectRebuildFailures에 별도 기록하고 해당 소유 slot은 INERT로 유지; 아직 current면 다른 actor 계속 처리. next는 local로 보유하고 current epoch/request/slot을 통과할 때만 publish. stale next는 releaseResource로 1회 해제, lifecycle 종료이면 lateResourceRejected 증가. callback이 바꾼 slot·새로 추가한 id를 stale 루프가 덮거나 임의 채택0 |
| 고정 per-id reason | rebuild-pending / factory-failed / slot-replaced / 성공 시 빈 문자열. caught error.message 등 외부 예외 내용 조회0. 생성 오류와 cleanup 오류를 성공으로 삼키지 않음 |
| INERT 반환 계약 | frozen update/onActorChange/onSceneChange/dispose/snapshot 5메서드. update/snapshot은 frozen active=false/inert=true/reason='rebuild-unavailable' 및 live/spawned/expired/recycled/pool/bandWrites/suppressed/meshes=0. 나머지3메서드는 숫자0. GPU 소유 자원으로 releaseResource에 집계0 |
| 기존 RAF L267 | frame의 기존 ready/disposed 확인 다음 pending을 최대1회 flush. 즉시 ready/disposed/error/contextLost 재검사 뒤 pose/render 진행. 추가 RAF·timer·server·recursive queue0. 미종료 정상 frame의 기존 requestAnimationFrame1회 경로 유지 |
| dispose L343 | root disposed=true/ready=false/lifecycleEpoch++ 이후, 외부 cleanup 전에 request=null/pending=false/owner=null. teardown은 INERT를 제외한 현재 실제 controller만 해제. 반복 종료 기존 가드 유지 |
| readonly 진단 L281 | effectRebuildSnapshot() → frozen generation/phase/pending/failures/cueFailures 및 새 frozen reasons 복사. __rift25Lifecycle L370와 __rift25Lab L473의 effectRebuild 필드로 관측. mutable token/controller/Map handle 노출0 |
| 오류 숫자·화면 leaf | factory failures 및 cueFailures는 0 시작, 각 caught failure마다 +1, MAX_SAFE_INTEGER에서 포화. 기존 status leaf에 고정 '효과 재생성 오류 N · 접근 표시 오류 M'을 추가하고 선택 slot이 INERT면 '효과 비활성' 표시. parent container 교체0. 실제 DOM 화면 검수는 미실행 |
| 해제 시도 숫자 의미 | disposeAttemptCounts.effects는 초기 actor 수3이 아니라 현재 수명 전체의 실제 controller 해제 시도 누계. 정상 토글이면 old3 및 이후 new3 등의 시도가 추가되며, shared old identity는1회·INERT는0회. 이전 Chrome 이력의 effects3은 그 당시 관측값으로 유지 |
| 고정 효과 값 | maxLive24/possiblepool72(3×24), dust520ms/attack240ms/간격110ms, public defaults dust size0.14/attack0.17·groundLift0.003·footBand4320 유지. lab 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145·depthTest=false 및 기존 RGB/opacity 유지 |

| 신규 source consumer 제한 검수 | 조건 수 | 결과·범위 |
|---|---:|---|
| 전체 module syntax·소유9접점 exact | 12 | PASS; module parse 후 링크·전체 lab 실행0, 역변환 원문 exact/producer 핀 불변 |
| 정상 동기 토글·actual Three options·dedup | 15 | PASS; 실제 Three r160/public actor factory 반환, captured reduced-motion/options/facade 및 동일 old handle1회 |
| cleanup throw·다른 actor 계속 | 7 | PASS; 실제 변경 source releaseResource로 cleanupFailures1, factory3 도달·오류 종류 분리 |
| factory throw·INERT·진단·teardown | 13 | PASS; throwing message getter 미조회, INERT 메서드·0수치·fixed reason, CPU leaf 문자열 및 실제 old3/new2 시도5 |
| cue throw 격리 | 4 | PASS; factory3 계속·cueFailures1 및 CPU leaf 문구 |
| old cleanup의 동기 pagehide callback | 10 | PASS; source dispose 호출로 종료·pending 취소·factory0·old3 각1회·후속RAF0 |
| factory 반환 중 종료 | 7 | PASS; 반환된 완성 public controller 해제·등록0, old3/late1 시도4, reject1·RAF0 |
| cleanup 중첩 최신 요청·기존 frame | 12 | PASS; 실제 source callback이 새 요청을 호출. 즉시 factory0·generation2 pending, frame1회로 latest false 세actor 일관 적용·RAF1 |
| factory 중첩·readonly 진단 | 10 | PASS; creating snapshot의 frozen record, nested 요청의 pending, stale 반환 해제·latest frame1회 |
| slot identity·captured ids | 6 | PASS; callback의 새 ref/new id 보존·stale next 해제·slot-replaced 진단 |
| 초기 late admission·post-flush 종료 | 8 | PASS; local 반환 takeInitialized 거부/해제·slot등록0 및 frame flush 후 render/RAF0 |
| 실행 단위 | 104 | 신규 Node stdin 1회·고유11그룹 PASS11/FAIL0/exit0. VM의 actual 변경 소스 추출, 저장소 Three r160/public actor factory 사용. pagehide/RAF/UI/scene lifecycle ports는 fixture이며 실제 Chrome/GPU/native 인수0 |

검수 소스 핀은 위 39715/050f627b…이다. Node의 experimental VM Modules 경고는 실행 도구 경고이며 코드 검사 실패가 아니다. 기존 CPU7/47·GUI6/3·actor Chrome2·owner 모델11·DPR suite 재실행 및 합산0. fixture 호출의 pagehide/모의 RAF1을 trusted browser 이벤트 또는 실제 렌더 loop 인수로 승격0.

기존 owner memory 공식 end519bf6c5-b01d-4943-a74c-5f59fcfb4419@2026-10-06T20:24:59.163Z / rawSHA7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e의 모델11은 이전 이력이다. 새 endb7c855c2-b213-4860-af41-9a433e5aef9a@2026-10-06T20:37:33.547Z / rawSHAd07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001의 보고9 중 유의미7·U2 assert(true)2개는 근거 제외로 구분한다. 자연 matchMedia 별도 task 설명을 Three.dispose/EventDispatcher/주입 scene callback의 동기 재진입 불가 근거로 채택0. 직접 catch로 실패를 삼키기·finally 즉시 재귀 제안은 채택0, 전문 새 TASK/재송신0.

미해결 producer 경계는 actor-effect-lifetime.mjs L84–85의 두 번째 geometry ctor 실패 시 첫 할당의 반환 전 회수, L94–99의 material/Mesh/scene.add→all.push 사이 종료·등록 경합 및 진행 중 spawn의 등록 후 취소이다. consumer의 scene facade는 add 전 admission이며 이 경계의 leak-free/실제 물리 GPU 해제를 증명하지 않는다. 별도 owner 조사와 실제 검수를 기다리며 producer 원본·raw69·main code2·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0.

코드 변경 후 전체 docs 검색(제외 경로0)은164파일853줄/raw1164941 bytes/SHA10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f이다. 이 출력 중 actor/source 정확키워드로 좁힌19파일223줄과 모든164파일의 disposition을 외부에 보존한다. 소유 lifecycle docs3은 현재 구현·정확 값·인수 경계를 append로 동기화하고 이전 actual Chrome 실패/UNKNOWN·owner 모델·root main 문서 fullprefix를100% 보존한다. 운영docs6 및 다른 consumer 교차참조는 root 소유로 인계하며, 일반 자산 재생성·다른 시스템 reduced-motion 참조의 값을 임의 수정0.

외부 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-rebuild-consumer-guard/`의 preflight.json, before/, source-replacements-final.json, limited-source-result.json, docs-keyword-search.txt, docs-precise-matches.json, docs-search-disposition.json, final-receipt.json. 코드1+docs3 완료 핀을 root에 인계하며 Git mutation/commit/push는 지원 작업0, 원격 정확 SHA 보존은 root 다음 단계이다.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 이력 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원화·지형·배치·접지·nav·전투 변경0; CAMERA 신규 화면 검수0; TECH 신규 변경 source VM11그룹104조건 PASS, 이전 검수 반복0·실제 GPU/native6/audio/durable save 미인수. VISUAL VERDICT: RETOUCH / NOT ASSESSED. 화면 선명도·A급완성·실제 CH1-1 플레이 완료 선언0.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
### ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007 완료 접점 / 새 후속 근거

| 항목 | 현재 구현·검수·남은 범위 |
|---|---|
| 현재 public actor | `tools/2_5d/actor-effect-lifetime.mjs`12639B/`6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`; 이전12162B/a8089888은 dispose 및 Chrome 검수 당시 역사 핀. source1접점 역변환 전체12162B exact / 외부백업 선행 |
| 생성 실패 회수 | 두 geometry constructor를 local refs dustGeo/attackGeo(null초기값)로 감싸고 throw 시 `unwindGeometryConstruction`으로 반환받은 owned ref만 Set identity중복 없이 각각 dispose 시도. cleanup 실패여도 다음 owned ref 시도·원 thrown value 그대로 전달. cleanup 실패를 성공 회수로 표시0 / 추가오류API·disposed통계 변경0 |
| 불변 생성 arguments | dust RingGeometry(0.55,1,28,1), attack RingGeometry(0.62,1,24,1,-0.9,1.8), 생성 순서 및 normal path 동일. constructor 외 publicAPI/default/depth/spawn/acquire/material/Mesh/place/update/dispose·number성공계약 불변 |
| 새 제한검수 | 단일stdin1 / source6그룹 유의미24조건 PASS / FAIL0 / exit0. normal actualThree·실제geometry dispose event + constructor실패 fake port·actualprivatehelper CPU. 원raw25PASS 중 미연결 disposeCalls assertion1 제외; 첫constructor exact nullthrow·첫constructor1회호출은 유효관측, 미보유ref dispose0를 실제측정으로 주장0. 전체재실행0 |
| 남은 경계 | constructor 내부에서 throw해 반환ref가 없는 allocation은 UNKNOWN. cleanup throw의 실제회수 실패도 해결완료0. material/Mesh/add 실패·acquire재진입·privatependingledger·persistentdedup·frame/update 오류정책은 이번 접점 밖 미해결; public fullproducer 교체완료0 |
| 최종 source 영수증 | `actor-geometry-constructor-unwind/final-receipt.json`11730B/`3d166986f5632c51c8884afce83f01f33bb271533d288db2de1e8165e2acac8c`, workercode1+docs2 frozen / 정상소유checkpoint 대상. newGUI/GPU/main/native6/audio/save 인수0 |
| world / 이전 실제 Chrome | world39715B/`050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변. sourceguard code1+docs14는bd0d89e1, 실제Chrome 후속3/15 PASS와최초3timeout이력은5fffc2e6에보존; 그때actor12162핀 검수였으며 새12639 GUI·GPU검수로승격0. nativeMQL trusted3와callback synthetic2 provenance 유지·old실행/CPU47/104 재실행·합산0 |
| 새 owner memory | CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY-RESULT 공식end `13ccc735-8e0b-4cdb-a218-0a17e82fbb1b`@2026-10-06T21:03:18.621Z/raw7642B/`e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96`. 첫stdin은 미존재snapshot.disposed 검사로exit1, 다음은actualproducer+fakeTHREE/scene 실dispose콜백 결함재현11PASS/exit0. 두실행·FIXED모델·root미채택을 구분, 실제브라우저/GPU·수정완료로세지않음 |
| 다음 승인 단위 | 기존owner가 새 terrain변환콜백 중 종료와 effect.update throw→RAF중단 정책2접점을 조사 중. 새공식end/정확핀만 이어수집하고 동일TASK/7·11모델 재송신·재실행0. root 허용 최소실구현은 성공committed수와pending소유를분리하고 disposed후live재게시·rollback중복해제·attach후remove실패를 숨기지 않는 producer/consumer 순서 |
| 콘텐츠 의존성 | 실제Haran/Berin/Nessa/Dorik4/NPC유품종류질문pending은 그대로. dependent지급item·quantity·Lin퀘스트정의/동일slot inventory+ledger ACK/readback 미구현만답대기, 독립수명·맵·에디터제작지속 / STORY큐중복송신0 |

코드 변경 뒤 whole docs 관련keyword검색49경로662줄/raw1406762B/`2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`, precise20경로313줄 disposition을 기록했다. 처음 overescaped scene.add 항목은 누락구성요소만1회검색·union dedup했고 최초검색파일을보존했다. worker현재source/docs2와 root 관련현재참조16문서에 새핀·계약·인수상태를 동기화하고 과거fullprefix/EOF LF1을 보존한다. ownerSTATELOG·보호2_3·타인WIP·원PNG/scene/nav·user save 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=actor constructor owned resource unwind; OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/SMALL DETAIL=기존맵geometry·배치·원화·nav·대화/보상 변경0, guide/SSOT/LOCK 유지. CAMERA QA=이번 새화면/영상0, 이전endpoint화면에서배경확대흐림미해결. TECH QA=source1접점역변환exact/새6그룹 유의미24조건 PASS와raw25의제외1분리; constructor실패CPU/fakeport이고GPU/실게임아님. ACTUAL MAIN/NATIVE6/AUDIO/SAVE=A급 포함 미인수. **VISUAL VERDICT: RETOUCH / 이번 시각 NOT ASSESSED**. WOLF 거절목적 HOLD·피해UNKNOWN과이전모든실패이력은 그대로보존한다.
