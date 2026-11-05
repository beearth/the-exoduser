# TOOL_MASTERY — 3D 자산 도구 숙련 조사·절차서 (2026-11-05, 클라우드 TM 레인)

브리프: [BRIEF_TOOL_MASTERY_20261105](../worklog/cloud-lanes/BRIEF_TOOL_MASTERY_20261105.md). 사용자 지적(11-05 09:40 KST) "툴들 쓰는 법을 좀 배워라. 스마트메시나 그런 것들 공부 좀 해."에 대한 1차 산출물이다.

## 0. 상태·범위·범례

- **이 문서의 상태:** §1(스마트메시 정체)·§2(8단계 절차서)는 클라우드 웹 조사로 채웠다. §3(손에 익히는 과제)은 Blender를 쓸 수 없는 세션이라 **"Mac 실습 대기"**로 비워 두었다. 전·후 비교 이미지는 0장이므로 브리프 §0 기준으로는 **미완(글만 있음)**이다. 합격 조건 중 "§1 확인 + §2 8단계 출처·설정값"만 채웠다.
- **생성 메시 폐기(11-05 09:30):** Tripo·Meshy의 메시 *생성*은 쓰지 않는다. 이 문서에서는 두 서비스를 **"업로드한 스캔·스컬프트 메시의 리토폴로지 기능 단독"** 관점으로만 본다.
- **출처 표기:** `[열림]` = 이 세션에서 URL을 직접 열어 본문을 확인. `[발췌]` = 검색 결과 발췌만 확인(본문 못 열음). `[미검증]` = 발췌조차 상충하거나 없음. 이 세션의 네트워크 정책에서 다음 호스트가 열리지 않았다: docs.blender.org, projects.blender.org, docs.unity3d.com, docs.unity.com, exoside.com, tripo3d.ai, docs.meshy.ai, superhivemarket.com, cgchannel.com, helpx.adobe.com, adobe.com, api.polyhaven.com. github.com(raw 포함)만 열렸다. Mac 실습 때 `[발췌]` 항목의 원문을 한 번 열어 설정 이름을 대조한다.
- **우리 환경 사실(repo에서 확인):** Unity `6000.4.8f1`(`unity/ProjectSettings/ProjectVersion.txt`), URP `17.6.0`, ProBuilder `6.1.4`(`unity/Packages/manifest.json`). Polybrush·glTFast는 **미설치**. 브리프가 가리키는 "매뉴얼 01·15"는 아직 repo에 없다(`docs/0마스터플랜/MANUAL/`은 이 문서로 신설).
- **유료 지출 0 원칙:** 아래의 유료 도구(Quad Remesher·Substance·Marmoset·UVPackmaster·Smart Remesh)는 체험판·무료판 범위만 적었다. 구매는 사용자 승인 사안이다.

## 1. "스마트메시"가 무엇인가 — 후보 전부

| # | 이름 | 제작사 | 무엇을 하나 | 무료 여부 | 우리 단계 | 출처(접속) |
|---|---|---|---|---|---|---|
| 1 | **Smart Mesh** (P1.0 → "Smart low-poly" 애드온) | Tripo AI | 이미지/텍스트→3D *생성* 시 저폴리·정돈된 토폴로지로 바로 뽑는 생성 모드. 업로드 메시용 독립 리토폴로지가 아니다. 별도 "Retopology" 모듈은 Triangle/Quad·목표 면 수 지정 | 크레딧 과금(발췌 30~35 크레딧/회, 상충). 무료 티어 크레딧 소량 | **해당 없음**(생성 모드 = 폐기). 리토폴로지 모듈은 업로드 가능 여부 상충 → §4 미검증 | tripo3d.ai/features/smart-mesh `[못 열음]`; developers.tripo3d.com/en/models/v3-1 `[발췌]`; tripo3d.ai/blog/how-to-create-clean-meshes `[발췌]`("Upload 3D Model 기능 출시 예정"); tripo3d.ai/blog/retopo-an-ai-character-model-for-animation `[발췌]`(FBX/OBJ/GLB 업로드 가능 서술); docs.comfy.org TripoRetopologyNode `[발췌]` |
| 2 | **Smart Remesh** (v3) | Milad Kambari(Blender 애드온, Superhive) | Blender 안에서 메시를 쿼드로 재구성. Hard Surface 모드(진짜 엣지 찾고 평면을 n-gon 하나로), **Organic 모드 = Instant Meshes 엔진(BSD-3)**으로 지정 면 수의 균일 쿼드 그리드. 입력: CAD·스캔·불리언 결과·구매 모델 | 유료 **$12~15**(발췌 상충) | 리토폴로지(스캔·스컬프트 고목) | superhivemarket.com/products/smart-remesh/docs `[발췌]`; cgchannel.com/2026/08/check-out-promising-new-blender-retopology-tool-smart-remesh `[발췌]`(2026-08-25); 80.lv/articles/quad-remesher-for-hard-surface-organic-blender-models `[발췌]`; artstation.com/marketplace/p/yRp58 `[발췌]` |
| 3 | **Smart Mesh Toolkit** | (Blender 애드온, Superhive) | 모델링 유틸 모음(Maya Target Weld 유사 기능 등). 리토폴로지 도구가 아니다 | 유료 | 해당 없음 | blendernation.com/2025/08/16/…smart-mesh-toolkit `[발췌]` |
| 4 | **Meshy Remesh** | Meshy | 워크스페이스에 **업로드(.fbx/.obj/.stl/.gltf/.glb, 100MB)**한 모델을 Quad/Triangle, 목표 폴리 Fixed/Adaptive로 리메시. 업로드 시 자동 삼각화. 세부 디테일 손실 있음 | 웹앱 Remesh 0 크레딧(발췌), API 5 크레딧. **무료 플랜에서 Remesh 가능 여부 상충** | 리토폴로지 대안(체험) | help.meshy.ai/en/articles/9992029 `[발췌]`; docs.meshy.ai/en/webapp/guides/3d-model/remesh `[못 열음]`; docs.meshy.ai/en/webapp/pricing `[발췌]`; meshy.ai/tutorials/ai-retopology-guide `[발췌]` |
| 5 | **Blender Remesh (Voxel·Quadriflow)** | Blender Foundation | Voxel: 균일 복셀로 재구성(스컬프트 중간). Quadriflow: 쿼드 리메시(Faces/Ratio/Edge Length, Preserve Sharp 등) | 무료(GPL) | 스컬프트·리토폴로지 1차 | docs.blender.org/manual/en/dev/sculpt_paint/sculpting/tool_settings/remesh.html `[발췌]`; …/modeling/meshes/retopology.html `[발췌]` |
| 6 | **Blender Decimate / Shrinkwrap / Smart UV Project / Data Transfer / Multires** | Blender Foundation | §2 각 단계에서 쓰는 내장 도구 | 무료 | LOD·리토폴로지 보조·UV·노멀 전사·베이크 | docs.blender.org 각 페이지 `[발췌]` |
| 7 | **Quad Remesher** | Exoside(ZRemesher 원작자) | 자동 쿼드 리토폴로지(Quad Count, Adaptive Size, Detect Hard Edges, Use Vertex Colors 밀도 페인팅, Symmetry). Blender·Maya·3ds Max·C4D·Houdini 등 | 유료: 단일 호스트 $109.90, 전체 $139.90(영구) / 3개월 $22.99. **체험판 있음(온라인 필요, 기간·제한 미확인)** | 리토폴로지 1순위 후보(체험판) | exoside.com/quadremesher/quadremesher-buy `[발췌]`; exoside.com/quadremesherdata/QuadRemesher_1.3_UserDoc.pdf `[발췌]`; blenderartists.org/t/quad-remesher-auto-retopologizer/1170913 `[발췌]` |
| 8 | **Instant Meshes** | Wenzel Jakob 외(ETH, SIGGRAPH Asia 2015) | 필드 정렬 리메시(쿼드/삼각·dominant). GUI + CLI(`-f` 면 수, `-r 4 -p 4` 쿼드, `-c` 크리즈 각, `-S` 스무딩, `-d` 결정론, `-D` dominant). 바이너리 Win/mac/Linux. 마지막 push 2022-01 | 무료·오픈소스(BSD-3) | 리토폴로지 1순위(무료) | github.com/wjakob/instant-meshes **[열림]**; raw …/src/main.cpp **[열림]**(CLI 도움말 원문) |
| 9 | **ZRemesher** | Maxon(ZBrush) | ZBrush 내장 자동 리토폴로지 | ZBrush 구독(iPad 무료 플랜은 ZRemesher 제한) | 보류(유료) | apps.apple.com/us/app/id6612028716 `[발췌]`; maxon.net 가을 릴리스 기사 `[발췌]` |
| 10 | **RetopoFlow** | CG Cookie / Orange Turbine | 수동 리토폴로지 도구 모음(Contours·PolyStrips·PolyPen 등). RF4는 Blender 4.2+. 소스 GPL-3, GitHub 구버전(3.4.0, Blender 3.6+) 무료 | 유료 $85.99(Superhive) / GitHub 빌드 무료(구버전) | 수동 리토폴로지(루트 플레어·실루엣 보정) | github.com/CGCookie/retopoflow **[열림]**; cgchannel.com/2026/04/…retopoflow-4 `[발췌]` |
| 11 | **Unity Mesh LOD** | Unity(6.2+, 우리 6000.4.8f1 포함) | 모델 임포트 시 "Generate mesh LODs"로 자동 LOD. 삼각 토폴로지만, LOD Group 병용 비권장, Skinned는 LOD0 변형 | 무료(엔진 내장) | LOD 대안 | docs.unity3d.com/Manual/lod/mesh-lod-generate-lods.html `[발췌]`; …/mesh-lod-quality.html `[발췌]`; …/mesh-lod-introduction.html `[발췌]` |
| 12 | **Simplygon** | Microsoft | 상용 LOD/감폴리 SDK·Unity 플러그인. **무료 티어 2024-03-31 종료 보도** | 유료(30일 평가판 보도) | 보류 | techraptor.net …simplygon-free-tier-abolished `[발췌]`; documentation.simplygon.com/…/unity `[발췌]` |
| 13 | **AutoLOD** | Unity Technologies(실험) | 임포트 시 LOD 생성 프레임워크. 기본 심플리파이어 + UnityMeshSimplifier·Simplygon·InstaLOD 연결. Unity 2018.4+, Companion License, 공식 지원 없음 | 무료 | LOD 대안(실험) | github.com/Unity-Technologies/AutoLOD **[열림]** |
| 14 | **UnityMeshSimplifier** | Whinarn | Fast Quadric Mesh Simplification C# 포팅, LODGeneratorHelper 컴포넌트. MIT. 유지보수자 인수 희망 상태 | 무료(MIT) | LOD 대안 | github.com/Whinarn/UnityMeshSimplifier **[열림]** |
| 15 | **Polybrush / ProBuilder** | Unity | Polybrush: Sculpt·Smooth·Color·Texture·Scatter 브러시(Terrain 비호환). ProBuilder: 인에디터 지오메트리·UV. ProBuilder 6.1.4는 설치됨, Polybrush 미설치 | 무료(패키지) | 접지·배치 | docs.unity3d.com/Packages/com.unity.polybrush@1.1/manual `[발췌]`; docs.unity3d.com/Packages/com.unity.probuilder@4.0/manual `[발췌]` |
| 16 | 그 밖의 "SmartMesh" 이름 | — | 별도 독립 제품은 검색에서 나오지 않았다. 유사 이름: Quadify, QuadForge, Mutamesh(Instant Meshes·Quadwild 묶음), Smart Topology Pro(모두 Blender 유료 애드온) | 유료 | 참고만 | superhivemarket.com 각 상품 `[발췌]` |

**정체 결론(1줄):** "스마트메시"는 단일 제품이 아니라 ① Tripo *Smart Mesh*(AI 생성 모드, 폐기 대상이며 리토폴로지 단독 도구가 아님) ② Blender 애드온 *Smart Remesh*(Organic 모드 엔진이 무료 Instant Meshes와 같음) 둘 중 하나로 보이고, 우리 리토폴로지 단계에서 뜻이 있는 것은 ②이며 그 핵심은 **무료 Instant Meshes/Quadriflow로 그대로 대체된다.**

**배정 판단:** 리토폴로지 1순위 = Instant Meshes(CLI, 무료) → Blender Quadriflow(대안) → Quad Remesher 체험판(품질 비교용). Smart Remesh($12~15)·Meshy 업로드 리메시는 위 셋이 같은 결함으로 2회 FAIL일 때만 검토(유료·계정은 사용자 승인).

## 2. 단계별 절차서 (자산 파이프라인 순서)

각 단계: ① 도구 1순위/대안 ② 출처 2개 이상(URL·접속) ③ 우리 용도 설정값(실습 전 제안값, 실습에서 측정해 고친다) ④ 실패 시 대안 ⑤ 실습 칸.

### 2.1 스컬프트·블록아웃 — 고목 밑동

- **도구:** Blender Sculpt(Voxel Remesh + Dyntopo) / 대안: 없음(Blender만)
- **출처:**
  - docs.blender.org/manual/en/dev/sculpt_paint/sculpting/tool_settings/remesh.html `[발췌]` — Voxel Size(작을수록 디테일↑·밀도↑), Adaptivity(불필요 구역 면 수 감소, >0이면 Fix Poles 꺼짐).
  - docs.blender.org/manual/en/dev/sculpt_paint/sculpting/tool_settings/dyntopo.html `[발췌]` — Detailing: Relative(화면 픽셀 기준)·Constant(단위 기준)·Brush(브러시 반경)·Manual(Flood Fill 때만). Constant/Manual에서 Detail Flood Fill(Ctrl-R).
  - gooseberry.blender.org/tree-sculpting_timelapse `[발췌]` — Blender Studio 나무 스컬프트: 1패스 Clay Strips로 수피 덩어리, 2패스 Crease로 골 깊이기. "스타일 모델은 수피 텍스처를 그대로 못 쓴다".
  - Packt *Sculpting the Blender Way* ch.2 `[발췌]` — 4 워크플로(기본·Dyntopo·Voxel·Multires) 전환 순서, Voxel Size 과소 시 크래시 경고.
- **우리 설정값(제안):** 단위 m, 고목 밑동 높이 ~2.5m 기준. ① 블록아웃: Voxel Size 0.05 → 큰 형태(Grab·Snake Hook·Inflate), 대칭 **끔**(고목은 비대칭). ② 1차 디테일: Voxel Size 0.02 후 Clay Strips(Strength 0.5)로 수피 판·루트 플레어. ③ 2차: Dyntopo Constant Detail(Resolution 40~60/m 상당), Crease·Draw Sharp로 골, Mask로 뿌리 사이 보호. ④ 마지막 Smooth 약하게. 저장은 단계별 .blend(실습 폴더). 최종 하이폴리 50만△ 안팎.
- **실패 시 대안:** 스컬프트가 거칠면 Multires 워크플로(저폴리 베이스 → Subdivide 3~4)로 바꿔 베이크 호환 유지. 손 조형 품질이 안 나오면 DIRECTION_RESET 11-05대로 사용자 손 조형/외주를 올린다.
- **실습:** Mac 실습 대기. (예정 산출: `img/tm-sculpt-{before,after}.png`, 전 = 프리미티브 블록아웃, 후 = 디테일 스컬프트)

### 2.2 리토폴로지(고→저폴리) — 스캔 고목 50만△ → 8k△

- **도구:** Instant Meshes(무료, CLI) / 대안: Blender Quadriflow → Quad Remesher 체험판 → Meshy 업로드 Remesh(유료·계정, 보류) · Tripo Retopology(업로드 가능 여부 미검증)
- **출처:**
  - github.com/wjakob/instant-meshes **[열림]** — GUI 순서: Open mesh → Orientation field → Position field → Export. 바이너리 Win/mac/Linux(Intel 64). `raw …/src/main.cpp` **[열림]**: `-o 출력`, `-f 목표 면 수`, `-v 목표 정점 수`, `-s 엣지 길이`, `-r 2|4|6 방향 대칭`, `-p 4|6 위치 대칭`, `-c 크리즈 각`, `-S 스무딩 반복(기본 2)`, `-D 트라이/쿼드 dominant`, `-d 결정론`, `-b 경계 정렬`, `-t 스레드`.
  - docs.blender.org/manual/en/dev/modeling/meshes/retopology.html `[발췌]` — Quadriflow: Edge Length/Faces 모드(기본 면 수, 커밋 rB3052229), 느리지만 품질↑. Shrinkwrap·스냅·Poly Build 수동 리토폴로지.
  - exoside.com QuadRemesher_1.3_UserDoc.pdf `[발췌]` — Adaptive Size 기본 50%(0이면 균일 쿼드), Quad Count는 근사 목표, Adaptive Quad Count. blenderartists.org/t/quad-remesher-auto-retopologizer/1170913 `[발췌]` — Detect Hard Edges는 불리언 뒤에만, Use Materials와 같이 쓰면 끄는 편.
  - help.meshy.ai/en/articles/9992029 `[발췌]` — 업로드 모델 Remesh→Topology Quad, FBX로 내려야 쿼드 유지, 세부 디테일 감소 명시.
- **우리 설정값(제안):** 목표 LOD0 **8,000△ = 4,000 쿼드**. Instant Meshes CLI: `InstantMeshes scan.obj -o retopo.obj -f 4000 -r 4 -p 4 -c 30 -S 2 -d`(쿼드, 크리즈 30°, 결정론). 결과를 Blender로 가져와 Shrinkwrap(Nearest Surface Point, Offset 0)으로 원본에 재접착 → 루트 플레어·실루엣 엣지 흐름을 RetopoFlow(GitHub 무료판) 또는 Poly Build로 손질. Quadriflow 대안: Faces 4000, Preserve Sharp 끔(유기체), Use Mesh Symmetry 끔, Smooth Normals 켬. Quad Remesher 대안: Quad Count 4000, Adaptive Size 50, Detect Hard Edges 끔, Use Vertex Colors 켜고 뿌리 플레어를 빨강(밀도↑)으로 페인트.
- **판정:** 와이어 전·후 2장(50만△ / 8k△), 실루엣 차 1x에서 0, 34° 카메라 거리에서 루트 플레어 윤곽 유지.
- **실패 시 대안:** 2회 같은 결함(엣지 흐름이 수피 골을 가로지름)이면 수동 리토폴로지(RetopoFlow Contours+PolyStrips)로 전환. 자동 도구 교체는 Instant Meshes → Quadriflow → Quad Remesher 체험판 순.
- **실습:** Mac 실습 대기. (`img/tm-retopo-{before,after}.png`)

### 2.3 UV

- **도구:** Blender UV(Seam 수동 + Unwrap + Minimize Stretch) / 대안: Smart UV Project(빠른 1차), UVPackmaster 3($44, 보류), Texel Density Checker(무료, GPL)
- **출처:**
  - docs.blender.org/manual/en/dev/modeling/meshes/editing/uv.html `[발췌]` — Smart UV Project: Angle Limit(낮으면 작은 섬 多·왜곡↓, 높으면 큰 섬·왜곡↑), Island Margin은 UV 단위 분수(1024에서 1/1024 = 1px). Pack Islands로 경계 밖·중첩 해결.
  - projects.blender.org/blender/blender-manual/pulls/104469 `[발췌]` — Pack Islands: Shape Method Exact(Concave)/Boundary(Convex)/Bounding Box, Margin Method Scaled(3.3+ 기본)/Add/Fraction, Rotate 켬이 효율↑.
  - github.com/mrven/Blender-Texel-Density-Checker **[열림]** — GPL-3, Blender 3.0+~5.0(2026.1.1)·4.2+ Extensions판. Calculate/Set/Copy TD, 체커 재질, 섬별 색.
  - learn.foundry.com/modo/12.0/…/texel_density.html `[발췌]` + polycount.com/discussion/comment/1740645 `[발췌]` — 512 px/m(=5.12 px/cm)을 타일 텍스처 표준으로 쓰는 스튜디오 사례. 밀도는 카메라 거리·플랫폼에 따라 정함.
- **우리 설정값(제안):** 심은 수피 골 안쪽·뒷면(카메라 34° 피치에서 안 보이는 북쪽 뒷면)에 수동 Mark Seam. Unwrap Angle Based(4.3+이면 Minimum Stretch) → Average Islands Scale → Pack Islands(Shape Exact, Rotate 켬, Margin Method Fraction, Margin 0.004 ≈ 8px@2048). 텍셀 밀도 목표 **512 px/m**(2048² 기준)로 Texel Density Checker에서 Set TD 후 체커 확인. 트림(수피 타일)과 고유(루트 플레어·절단면) UV를 UV 채널로 분리할지는 재질 단계에서 결정.
- **실패 시 대안:** 팩 효율 <70%면 UVPackmaster 체험 검토(유료 승인 필요). 왜곡이 남으면 심 추가 후 Minimize Stretch 반복.
- **실습:** Mac 실습 대기. (`img/tm-uv-{before,after}.png` = Smart UV 자동 vs 수동 심 + 밀도 체커)

### 2.4 베이크(고→저) — Normal·AO·Curvature·Height

- **도구:** Blender Cycles 베이크(Selected to Active) / 대안: Substance 3D Painter 베이커(승인 시), Marmoset Toolbag 5(30일 체험)
- **출처:**
  - docs.blender.org/manual/en/2.91/render/cycles/baking.html `[발췌]`(구버전 원문) + docs.blender.org/api/latest/bpy.types.BakeSettings.html `[발췌]`(현행 API) — 레이는 로폴리에서 안쪽으로; Max Ray Distance는 케이지 미사용 때만; Cage Extrusion은 케이지 사용 시 팽창 거리(수동 Cage Object는 동일 토폴로지); Normal Space Tangent 기본; Edge Split 하드 분할 피함; Margin Type Adjacent Faces(기본)/Extend.
  - lists.blender.org/pipermail/bf-committers/2017-April/048312.html `[발췌]` + cgaxis.com/which-normal-map-should-i-use-opengl-or-directx `[발췌]` + renderhub normal-map-channel-inverter `[발췌]` — Blender·Unity 모두 Y+(OpenGL) 기본, Unreal은 Y-(DirectX). 반대 서술 1건(strayspark) 있음 → §4 미검증.
  - docs.unity.com …/textureimportersettings/flipgreenchannel `[발췌]` — 관례가 다를 때만 Flip Green Channel, 더 복잡하면 swizzle.
  - discussions.unity.com/t/baked-normal-map-issue/591016 `[발췌]` — Blender 베이크 무수정으로 Unity 정상 사례; 오류 시 원인은 탄젠트(Blender Tangent Space 내보내기 + Unity Tangents Import).
  - helpx.adobe.com/substance-3d-painter/baking/mesh-map-settings.html `[발췌]` — 공통 설정(출력 크기·Dilation·케이지 거리 기반, 교차 시 빨간 표시=아티팩트).
- **우리 설정값(제안):** Cycles, Selected to Active, **Cage 켬 + Cage Extrusion 0.03m**(고목 2.5m의 ~1%), Max Ray Distance 0(케이지 사용 시 무시), Normal Space Tangent, swizzle R+X G+Y B+Z(기본·OpenGL → **Unity에서 Flip Green 끔**), Margin Adjacent Faces 16px@2048, 2048² 16-bit PNG. AO: Samples 128, Only Local. Curvature·Height는 Blender 기본 베이크 타입에 없음 → Geometry Pointiness→Emit 베이크(Curvature), Multires 있으면 Displacement 베이크(Height), 아니면 Substance 베이커(승인 시). 노멀 베이크 전 로폴리 Shade Smooth + Auto Smooth/Weighted Normal, 하드 엣지 분할 금지.
- **판정:** 같은 각도 노멀맵 켜고/끄고 2장. 3x 크롭에서 심 줄·웨이브(케이지 교차)·반전 홈 0.
- **실패 시 대안:** 케이지 교차 아티팩트 2회면 수동 Cage Object(복제 후 Inflate) 사용. 그래도 실패면 Marmoset 체험(30일, 로그인은 사용자) 또는 Substance(승인).
- **실습:** Mac 실습 대기. (`img/tm-bake-{before,after}.png`)

### 2.5 텍스처·재질

- **도구:** Substance 3D Painter(승인 시; Steam 영구 $199.99 / Indie 월 $24.99) / 대안: Blender 텍스처 페인트 + 스캔 재질(Megascans Fab 무료 1,500+, Fab Standard License)
- **출처:**
  - adobe.com/learn/substance-3d-designer/web/the-pbr-guide-part-2 `[발췌]` — 금속 반사율 0.5~0.98(180~250 sRGB), 비금속 알베도 가장 어두운 ~0.04(탄소)·가장 밝은 ~0.8(눈·흰 페인트), 메탈릭은 0/1 이진이 원칙, "Resolution and Texel Density" 절 존재(본문 못 열음).
  - experienceleague.adobe.com/…/substance-3d-sampler/…/pbr-validate `[발췌]` — 검증 필터: 어두운 색+러프니스 0+메탈릭 1 조합을 비물리로 표시.
  - docs.unity3d.com/Manual/urp/lit-shader `[발췌]`(URP 17 계열) — Metallic Map 채널 패킹: Smoothness Source 기본 **Metallic Alpha**(메탈릭 맵 A), Albedo Alpha 선택; R=Metallic, G=Occlusion 예시; Smoothness 슬라이더와 곱.
  - forums.unrealengine.com/t/megascans-update-march-2025/2419561 `[발췌]` + 80.lv …free-megascans-downloads-in-fab `[발췌]` — 2025-01-01부터 Fab 무료 1,500+ Megascans, Fab Standard License; 타 엔진 사용은 EULA 원문 확인 필요(§4).
  - gg.deals/application/substance-3d-painter-2026 `[발췌]` + store.steampowered.com/app/4329260 `[발췌]` — Painter 2026 Steam 영구 $199.99(2027-03까지 업데이트), Indie 월 $24.99.
- **우리 설정값(제안):** 수피 알베도 sRGB 45~140(어두운 한계 ≥30), 러프니스 0.75~0.9 → **Unity Smoothness 0.10~0.25**(smoothness = 1 − roughness), 메탈릭 0, 이끼 알베도 sRGB 60~120. 패킹 맵 1장: R Metallic, G AO, B(비움 또는 Height), **A Smoothness**(URP Lit "Metallic Alpha"). 실버 헬 톤(은빛 강철)은 UI 톤이지 수피 재질이 아니므로 재질에 금속성을 넣지 않는다. 점·그레인 금지(CLAUDE.md 4.2-7): 스캔 재질은 3x 크롭에서 노이즈 0 확인.
- **실패 시 대안:** Substance 미승인이면 Blender 텍스처 페인트 + Megascans 수피 타일(Fab 무료) + 베이크 AO 곱. 두 방법이 같은 결함(플라스틱 같음)이면 러프니스 맵 대비를 올리고 Height 기반 디테일 노멀 추가.
- **실습:** Mac 실습 대기. (`img/tm-material-{before,after}.png`)

### 2.6 LOD·임포스터

- **도구:** Blender Decimate(Collapse) / 대안: Unity Mesh LOD(6.2+, 우리 6000.4.8f1), UnityMeshSimplifier(MIT), AutoLOD(실험)
- **출처:**
  - docs.blender.org/manual/en/…/modeling/modifiers/generate/decimate.html `[발췌]` — Collapse: Ratio(1.0 무변·0.0 전부 삭제, 삼각 기준이라 쿼드는 더 남음), Symmetry, Vertex Group+Factor; Planar: Angle Limit; Un-Subdivide: Iterations(짝수).
  - docs.unity3d.com/Manual/lod/mesh-lod-generate-lods.html `[발췌]` — 모델 Inspector LODs → Generate mesh LODs → Apply(임포트 시간↑). 제한: 삼각 토폴로지만, **LOD Group 병용 비권장**, Skinned는 LOD0만 변형, Entities Graphics는 LOD0. Quality > Mesh LOD Threshold, Renderer.forceMeshLod(-1 기본)·meshLodSelectionBias(API `[발췌]`).
  - docs.unity3d.com/Manual/class-LODGroup.html `[발췌]` — Fade Mode Cross Fade(디더/투명), Animate Cross-fading 기본(시간 기반), 끄면 Fade Transition Width(0~1 비율), LOD Bias≠1이면 경고.
  - simplygon.com/posts/fd30ea69-… `[발췌]` + …/6e848b24-… `[발췌]` — 삼각 비율 목표 대신 **screen size / max deviation(≈1px 오차)** 권장; 비율은 결과(예 39%/23%)일 뿐.
  - github.com/Whinarn/UnityMeshSimplifier **[열림]** — MIT, LODGeneratorHelper, Unity 2018.1+, 유지보수자 모집 상태. github.com/Unity-Technologies/AutoLOD **[열림]** — 실험, 2018.4+, Companion License.
- **우리 설정값(제안):** 브리프 비율을 시작값으로: LOD0 8k△(100%) / LOD1 Ratio 0.5 / LOD2 0.25 / LOD3 0.1, 모두 Triangulate 켬, Vertex Group으로 루트 플레어·절단면 보호(Factor 1). Unity LOD Group: Cross Fade, Animate 끔, Fade Transition Width 0.1, 전환 screen-relative height LOD1 0.35 / LOD2 0.15 / LOD3 0.06 / Cull 0.02 — **34° 카메라에서 "먼 적이 보이는" 거리에서 실루엣이 깨지지 않는지 눈으로 확정**(카메라 LOCK 11-03). Unity Mesh LOD는 LOD Group과 함께 쓰지 않으므로, 쓰면 Group 없이 단독.
- **실패 시 대안:** Decimate 실루엣 붕괴 2회면 Simplygon 권고대로 오차 기준 도구(UnityMeshSimplifier LODGeneratorHelper → Mesh LOD) 비교. 임포스터(빌보드)는 1-1 고목 거리에서 필요 없으면 보류.
- **실습:** Mac 실습 대기. (`img/tm-lod-{before,after}.png` = LOD0~3 나란히 + 34° 거리별)

### 2.7 Unity 반입(FBX/glTF)

- **도구:** Unity FBX 임포트(내장) / 대안: glTF → **glTFast 패키지 설치 필요(현재 미설치)**
- **출처:**
  - docs.unity3d.com/Manual/FBXImporter-Model.html `[발췌]` — Scale Factor(1 unit = 1m), Convert Units, Mesh Compression Off/Low/Medium/High(보이지 않을 만큼만 올림), Read/Write(런타임 접근 필요 때만), Tangents Calculate(블렌드셰이프).
  - docs.unity3d.com/Manual/texture-type-default.html `[발췌]`(6000.4) — sRGB (Color Texture): 알베도만 켬; Generate Mipmap; Stream Mipmap Levels(Mipmap 켠 때만).
  - docs-alpha.unity3d.com/2023.2/…/texture-compression-formats.html `[발췌]` — 데스크톱 RGB(A) 고품질 기본 **BC7**, 노멀·저품질 DXT5, HDR BC6H; iOS/Android ASTC.
  - docs.unity.com …/flipgreenchannel `[발췌]` — 노멀맵 Flip Green은 관례 불일치 때만.
  - elixrsim.notion.site Exporting From Blender To Unity `[발췌]` + app.cinevva.com blender-to-unity-export-checklist `[발췌]` — Blender FBX: Up Y, Apply Scalings FBX Units Scale(또는 FBX All), Scale 1, Apply Unit; Unity Scale Factor 1 + Convert Units.
  - docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.2/manual/ImportEditor.html `[발췌]` — glTFast가 .gltf/.glb 기본 임포터, .bin·이미지 상대 경로 유지.
- **우리 설정값(제안):** Blender FBX 내보내기: Selected Objects, Mesh만, Forward -Z, Up Y, Apply Scalings **FBX Units Scale**, Scale 1.0, Apply Unit 켬, Smoothing **Face**, Tangent Space 켬, Apply Modifiers 켬. Unity 모델: Scale Factor 1, Convert Units 켬, Mesh Compression **Off**(LOD0)/Low(LOD1~3), Read/Write 끔, Normals Import, Tangents Import(실패 시 Calculate Mikktspace), Generate Lightmap UVs 끔(실시간 조명). 텍스처: 알베도 sRGB 켬·BC7·Mipmap 켬; 노멀 Texture Type Normal map·Flip Green **끔**·BC7(또는 BC5); 패킹 마스크 sRGB **끔**·BC7. Max Size 2048(고목 LOD0). glTF 경로는 glTFast 설치 승인 뒤.
- **판정:** 반입 전(Blender 뷰포트)·후(1-1 장면 34°) 캡처 2장. 스케일 1:1(2.5m 밑동이 캐릭터 대비 맞음), 노멀 방향(홈이 홈으로), 밉맵 모아레 없음.
- **실패 시 대안:** 스케일 100배 오류면 Apply Scalings를 FBX All로 교체. 노멀 반전이면 그때만 Flip Green. 탄젠트 심 줄이면 Tangents Calculate.
- **실습:** Mac 실습 대기. (`img/tm-import-{before,after}.png`)

### 2.8 접지·배치

- **도구:** Unity Terrain Lit 높이 블렌드 + 바닥 쿼드 데칼 / 대안: Polybrush(미설치, 패키지 1.1), ProBuilder 6.1.4(설치됨), 커스텀 접지 셰이더(Shader Graph), repo의 RootRelief 메시(A2Field, 11-04 CHANGELOG)
- **출처:**
  - docs.unity3d.com/Manual/urp/shader-terrain-lit.html `[발췌]` — Enable Height-based Blend: Mask Map **B 채널 높이**, Height Transition(월드 단위 전이 폭), Terrain Layer 4개 초과 시 무시. discussions.unity.com/t/urp-terrain-lit-enable-height-based-blend…/948543 `[발췌]` — 레이어 마스크 B에 높이 맵을 넣어야 동작.
  - docs.unity3d.com/Manual/urp/renderer-feature-decal-reference.html `[발췌]`(6.3) + …universal@16.0/manual/renderer-feature-decal.html `[발췌]` — **데칼은 Terrain·파티클에 안 그려짐**; 대안 = Quad에 Decal Material, mesh bias로 z-fighting 방지; Screen Space는 노멀 블렌드만; Start Fade·Scale Mode 주의.
  - docs.unity3d.com/Packages/com.unity.polybrush@1.1/manual `[발췌]` — Sculpt·Smooth·Color·Texture(Standard/TriPlanar Texture Blend)·Scatter 모드, **Terrain 비호환**.
  - assetstore.unity.com/packages/package/196455 (InTerra) `[발췌]` — 오브젝트-지형 교차 블렌드 상용 에셋(참고만, 구매 보류).
- **우리 설정값(제안):** ① 루트 플레어: 고목 메시 자체에 바닥까지 내려오는 스커트(폴리 300△ 이내)를 두고 정점 색 A로 지면 알파 페이드. ② 이끼 전이: Terrain Layer 4개 이내(흙·낙엽·이끼·돌)에서 Height-based Blend 켬, Height Transition 0.15, 이끼 레이어 Mask B 높이 맵. ③ 그림자 접지: Quad(1.2× 밑동 지름) + Decal Material(AO 어둠, Opacity 0.6, Angle Fade 켬, 쿼드 mesh bias 0.01)로 지형 위에 올림(데칼은 지형 직접 투사 불가). ④ 배치: 웹 1-1 좌표 그대로(CLAUDE.md 1절 맵 규칙), 새 구도 금지. Polybrush는 설치 승인 뒤 Texture Blend로 밑동 주변 메시 지면만.
- **실패 시 대안:** 스커트 페이드가 2회 어색하면 Shader Graph로 지형 높이 샘플 블렌드(미검증, Mac에서 실험) 또는 RootRelief 메시 확장. 유료 InTerra는 보류.
- **실습:** Mac 실습 대기. (`img/tm-ground-{before,after}.png`)

### 2.9 채움 집계

| 단계 | 1순위/대안 | 출처 ≥2 | 설정값 | 실패 대안 | 실물 |
|---|---|---|---|---|---|
| 스컬프트 | ○ | ○(4) | ○ | ○ | 대기 |
| 리토폴로지 | ○ | ○(4) | ○ | ○ | 대기 |
| UV | ○ | ○(4) | ○ | ○ | 대기 |
| 베이크 | ○ | ○(5) | ○ | ○ | 대기 |
| 텍스처·재질 | ○ | ○(5) | ○ | ○ | 대기 |
| LOD | ○ | ○(5) | ○ | ○ | 대기 |
| Unity 반입 | ○ | ○(6) | ○ | ○ | 대기 |
| 접지·배치 | ○ | ○(4) | ○ | ○ | 대기 |

**8/8 단계 출처·설정값 채움. 실물 0/8.**

## 3. 손에 익히는 과제 — Mac 실습 대기

입력 1개(AT 레인이 받은 Poly Haven 고목 또는 Book of the Dead 고목; 둘 다 이 세션에서 존재·공개 여부 미확인 → §4)로 §2를 끝까지 한 번 돌린다. 브랜치 `claude/unity-mac-tool-mastery-20261105`.

| 단계 | 이미지(전/후) | 설정값(실측) | 소요 | 실패 기록 |
|---|---|---|---|---|
| 스컬프트 | `img/tm-sculpt-before.png` / `-after.png` | Mac 실습 대기 | — | — |
| 리토폴로지 | `img/tm-retopo-…` | Mac 실습 대기 | — | — |
| UV | `img/tm-uv-…` | Mac 실습 대기 | — | — |
| 베이크 | `img/tm-bake-…` | Mac 실습 대기 | — | — |
| 재질 | `img/tm-material-…` | Mac 실습 대기 | — | — |
| LOD | `img/tm-lod-…` | Mac 실습 대기 | — | — |
| Unity 반입 | `img/tm-import-…` | Mac 실습 대기 | — | — |
| 접지 | `img/tm-ground-…` | Mac 실습 대기 | — | — |

실습 전제: Blender 설치 승인(미완이면 중단 조건), 공용 실행기·무창·무음(`blender --background`, 오프스크린 렌더), 체험판 로그인은 사용자. 같은 단계 2회 실패 시 §2 "실패 시 대안"으로 바꾸고 여기에 기록한다.

## 4. 미검증 목록 (13건) — Mac·사용자 확인 필요

| # | 항목 | 왜 미검증 | 확인 방법 |
|---|---|---|---|
| 1 | Tripo Retopology이 **업로드한 외부 메시**를 단독 처리하나 | Tripo 블로그 두 글이 상충("출시 예정" vs "FBX/OBJ/GLB 업로드") | Tripo Studio 화면 확인(로그인은 사용자) |
| 2 | Meshy **무료 플랜**에서 Remesh 가능 여부 | 문서 "0 크레딧" vs 비교표 "유료 전용" 상충 | Meshy 웹앱 비용 표시 확인 |
| 3 | Quad Remesher 체험판 **기간·제한** | exoside.com 못 열음, 발췌는 "온라인 필요"만 | exoside.com/quadremesher/quadremesher-buy 열기 |
| 4 | Smart Remesh 3 현재 **가격·대칭·가이드 옵션** | superhivemarket 못 열음, $12 vs $15 상충 | 상품 페이지·docs 열기 |
| 5 | Unity 노멀맵 관례 **Y+(OpenGL) 공식 문구** | 2차 출처 다수 일치, 반대 서술 1건, Unity 매뉴얼 못 열음 | 테스트 메시 1개 반입해 홈/돌출 방향 확인 |
| 6 | Unity Mesh LOD **Inspector 라벨·6000.4 동작** | 매뉴얼 못 열음(API 발췌만) | 6000.4.8f1에서 모델 Inspector 확인 |
| 7 | Simplygon 무료 티어 **현재 상태** | 2024-03 종료 보도, 이후 공식 문구 없음 | simplygon.com 가격 페이지 |
| 8 | Poly Haven에 **고목·밑동 CC0 모델** 존재 | api.polyhaven.com 못 열음, 검색 미출현 | polyhaven.com/models 검색("stump","log","tree") |
| 9 | Book of the Dead: Environment **에셋스토어 현재 공개** | 2023 v1.1 무료·중단/복귀 반복 보도 | 에셋스토어 페이지 확인(라이선스는 Asset Store EULA, CC0 아님) |
| 10 | Substance 3D Painter **체험판·Indie 매출 한도** | 검색에 체험판 언급 없음, 한도 $100K는 포럼 발언 | adobe.com Substance 가격 페이지 |
| 11 | Blender 매뉴얼 **현행(4.5/5.x) 설정 이름** | docs.blender.org 못 열음(2.91 원문·API·번역판 발췌) | Mac Blender 설치판에서 패널 이름 대조 |
| 12 | Megascans Fab Standard License의 **Unity 사용 조건** | 포럼 인용만, EULA 원문 미확인 | fab.com EULA 읽기(상업 사용 전 필수) |
| 13 | Marmoset Toolbag 5 **개인 영구 가격** | Studio $1,299만 확인, 개인가 미출현 | marmoset.co/shop |

## 5. 다음 일·갱신

- Mac 세션: §3 실습 8쌍 + §4 1~13 확인 → 이 문서의 `[발췌]`를 `[열림]`으로, 제안 설정값을 실측값으로 바꾼다.
- 결과로 "매뉴얼 01(지형·소품)·15(성능 예산)" 도구 표를 갱신한다(두 매뉴얼은 아직 없음 → AT 레인 결과와 함께 신설).
- 유료 항목(Quad Remesher·Substance·UVPackmaster·Smart Remesh·Polybrush 외 패키지 설치는 무료)은 사용자 승인 뒤에만 진행하고 SPEND_LOG에 적는다.

## 6. 변경 이력

- 2026-11-05 클라우드 TM 레인(브랜치 `claude/unity-cloud-tool-mastery-20261105`): 초판. §1 후보 16종 확인, §2 8단계 출처·설정값·대안 채움(직접 열린 URL 6개는 github.com 계열, 그 외 공식 문서는 검색 발췌), §3 Mac 실습 대기, §4 미검증 13건.
