# TOOL_MASTERY — 3D 자산 도구 숙련 조사·절차서 (2026-11-05, 클라우드 TM 레인)

브리프: [BRIEF_TOOL_MASTERY_20261105](../worklog/cloud-lanes/BRIEF_TOOL_MASTERY_20261105.md). 사용자 지적(11-05 09:40 KST) "툴들 쓰는 법을 좀 배워라. 스마트메시나 그런 것들 공부 좀 해."에 대한 1차 산출물이다.

## 0. 상태·범위·범례

- **이 문서의 상태:** §1(스마트메시 정체)·§1b(생성 도구 옵션 전수표, CTO 추가 지시)·§2(8단계 절차서 + 도구별 옵션 전수)는 클라우드 웹 조사로 채웠다. §3(손에 익히는 과제)은 Blender를 쓸 수 없는 세션이라 **"Mac 실습 대기"**로 비워 두었다. 전·후 비교 이미지는 0장이므로 브리프 §0 기준으로는 **미완(글만 있음)**이다. 합격 조건 중 "§1 확인 + §2 8단계 출처·설정값"만 채웠다.
- **생성 메시 폐기(11-05 09:30):** Tripo·Meshy의 메시 *생성*은 쓰지 않는다. 이 문서에서는 두 서비스를 **"업로드한 스캔·스컬프트 메시의 리토폴로지 기능 단독"** 관점으로만 본다.
- **출처 표기:** `[열림]` = 이 세션에서 URL을 직접 열어 본문을 확인. `[발췌]` = 검색 결과 발췌만 확인(본문 못 열음). `[미검증]` = 발췌조차 상충하거나 없음. 이 세션의 네트워크 정책에서 다음 호스트가 열리지 않았다: docs.blender.org, projects.blender.org, docs.unity3d.com, docs.unity.com, exoside.com, tripo3d.ai, docs.meshy.ai, superhivemarket.com, cgchannel.com, helpx.adobe.com, adobe.com, api.polyhaven.com. github.com(raw 포함)만 열렸다. Mac 실습 때 `[발췌]` 항목의 원문을 한 번 열어 설정 이름을 대조한다.
- **범위 조정(CTO 11-05 15:05, 사용자 "모든 자원 캐릭터 심화"):** 도구 매뉴얼은 `MANUAL/TOOLS/`에 도구별 8칸 파일(DIRECTION_RESET 09:50 틀)로 쓰며 **캐릭터 도구가 우선**이다 — ① [Rigify 리깅·본 표준·Humanoid/UE 호환](TOOLS/BLENDER_RIGIFY_RIG.md) ② [웨이트 전사](TOOLS/BLENDER_WEIGHT_TRANSFER.md) ③ [모듈러 파트·바디 마스크](TOOLS/BLENDER_MODULAR_PARTS_BODYMASK.md) ④ [소켓·무기 부착](TOOLS/SOCKET_WEAPON_ATTACH.md) ⑤ [Unity bones 재매핑·UE Leader Pose](TOOLS/UNITY_BONES_REMAP_UE_LEADERPOSE.md) ⑥ 그다음 이 문서의 §1b·§2(리토폴로지·UV·베이크·LOD·생성 옵션표)를 8칸 파일로 분리. 색인: [TOOLS/README.md](TOOLS/README.md). 이미 쓴 §1·§1b·§2는 유지한다.
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

## 1b. 생성 도구 옵션 전수표 (CTO 추가 지시 11-05 — "옵션을 다 쓰고 있나")

**전제:** 생성 메시를 최종 자산으로 쓰는 것은 폐기(11-05 09:30) 그대로다. 이 표는 ① 우리가 지금까지 어떤 옵션으로 돌렸는지 사실 확인, ② 옵션을 제대로 쓴 결과가 *리토폴로지 입력*으로 쓸 만한지 사용자가 다시 판단할 비교판(§3b)의 설정 근거다. **기본값으로 돌린 것은 "안 배운 것"으로 친다.**

**우리 상한(CTO 지시):** 큰 소품 6~12k△, 중 2~4k△, 소 0.5~1k△. 아래 "우리 값"은 이 상한에 맞춘 요청값이다(쿼드 1면 ≈ 2△로 환산).

**사실 확인 — 지금까지 보낸 옵션:** repo 루트 `meshy_generate.cjs`(커밋 10438df 기준)가 Meshy에 `mode: preview, ai_model: meshy-6, topology: quad, target_polycount: 30000, should_remesh: true, target_formats: [glb]` → `mode: refine`을 보낸다. 즉 기본값만은 아니지만 **target_polycount 30,000(쿼드)**을 고정으로 보냈고, 이것이 소품이 2만~4만△로 들어온 직접 원인이다. 소품 등급별 면 수·PBR·대칭·모델 버전·텍스처 해상도 지정은 없었다. Tripo 쪽 요청 기록은 repo에 없다(0건).

### 1b-1. Tripo (Tripo Studio / API)

출처: `[열림]` github.com/VAST-AI-Research/tripo-python-sdk/docs/API.md(raw), `[열림]` github.com/comfyanonymous/ComfyUI/comfy_api_nodes/nodes_tripo.py(raw, 공식 API 노드) / `[발췌]` developers.tripo3d.com(en/docs/generation-text-to-model/standard, en/models/p2, en/docs/models-convert), docs.tripo3d.ai/model-generation/text-to-model-v3-0-v3-1, help.aliyun.com/en/model-studio/tripo-3d-generation-api-reference, docs.comfy.org TripoTextToModelNodeV2. 공식 사이트 본문은 세션에서 못 열었다.

| 옵션 | 값·기본 | 무엇을 바꾸나 | 우리 값(리토폴로지 입력용) |
|---|---|---|---|
| `model_version` | H 계열 `v3.1-20260211`(기본)·`v3.0-20250812`·`v2.5-20250123`; P 계열 `P1-20260311`·`P2-20260801`(네이티브 저폴리) | 지오메트리 모델. v3.0 이후만 `texture_quality`·`geometry_quality`·`auto_size`·`quad`·`smart_low_poly`·`generate_parts`·`compress` 유효. P2는 `smart_low_poly`·`generate_parts`·`geometry_quality` 미지원 | 형태 충실도 비교 = H3.1 / 저폴리 비교 = P2 |
| `face_limit` | 기본 -1(적응). H3.1/3.2 500~1,500,000(`geometry_quality=detailed`면 2,000,000), v2.5 ≤500,000, quad ≤150,000(권장), **quad+미지정 = 10,000면**. `smart_low_poly`일 때 삼각 500~20,000·쿼드 500~10,000. P2 삼각 48~50,000·쿼드 48~25,000 | 출력 면 수 상한(삼각 기준) | 큰 12,000 / 중 4,000 / 소 1,000(삼각). 쿼드면 절반 |
| `quad` | false | 쿼드 토폴로지. **출력이 FBX로 강제**(GLB 비움) | 리토폴로지 입력이면 true(엣지 흐름 확인), 베이크 원본용이면 false |
| `smart_low_poly` | false | 생성 뒤 정돈된 저폴리(Smart Mesh 계열). 면 수 범위 고정(위). aliyun 문서: texture/pbr와 **비호환** | 비교판 B안: true + face_limit 4,000 |
| `geometry_quality` | `standard`(기본) / `detailed` | 형태 디테일(면 수↑) | 베이크 원본 = detailed, 저폴리 = standard |
| `texture` / `pbr` | true / true | 텍스처 생성 / PBR 맵(BaseColor·Metallic·Roughness·Normal). texture=false면 pbr 무시 | 리토폴로지 입력용은 **false/false**(우리가 다시 베이크·재질) |
| `texture_quality` | `standard`(기본) / `detailed`(HD) / `extreme`(8K) / `fast`(v3.2·텍스처 전용 v3.5) | 텍스처 해상도·품질 | 참고 텍스처만 필요하면 standard |
| `texture_alignment` | `original_image`(기본) / `geometry` | 이미지→3D에서 텍스처를 원본 이미지에 맞출지 지오메트리에 맞출지 | geometry(실루엣 우선) |
| `auto_size` | 텍스트/이미지 true, 멀티뷰 false | 실측 m 단위로 스케일(텍스처 있을 때만) | true(Unity 1unit=1m) |
| `orientation` | `default` / `align_image` | 이미지 방향 정렬 | default |
| `generate_parts` | false | 파트 분리 생성(v3.0+) | false |
| `compress` | false(`"geometry"`) | 지오메트리 압축 | false |
| `style`(legacy) | 무시됨 | — | 안 씀 |
| `negative_prompt`, `image_seed`·`model_seed`·`texture_seed` | 시드 기본 42(노드) | 재현성 | 비교판은 model_seed 고정 |
| 멀티뷰 | front 필수 + left/back/right | 4면 입력 | 고목·소품은 2~3면 |
| **convert**(`/v3/models/convert`) | `format` GLTF/USDZ/FBX/OBJ/STL/3MF, `quad`, `face_limit`(-1), `texture_size` 4096(128~8192), `texture_format` JPEG(PNG/WEBP…), `flatten_bottom`+`threshold 0.01`, `pivot_to_center_bottom`, `scale_factor 1`, `pack_uv`, `bake`(true), `force_symmetry`, `fbx_preset blender`, `export_orientation`, `export_vertex_colors` | **생성 뒤 후처리 = 리메시·감폴리·바닥 평탄화·피벗·UV 팩** | FBX, quad true, face_limit 등급값, flatten_bottom true(소품 접지), pivot_to_center_bottom true, texture_size 2048 |
| **smart_lowpoly**(후처리 태스크) | `model_version v1.0/v2.0/v3.0`, `face_limit` 500~20,000(쿼드 ≤10,000), `quad`, `smart_uv`(v3.0) | 기존 생성물에 저폴리 재구성 | 비교판 C안 |
| `mesh_uv` | 파라미터 없음, 20 크레딧, 입력 ≤80,000△ | Smart UV | 참고(우리는 Blender UV) |
| 리깅 | `rig_type auto/biped/quadruped/hexapod/octopod/avian/serpentine/aquatic`, `spec tripo/mixamo/actorcore/unity/unreal/vrm`(v2.5+), `retarget preset:*` ≤5 | 캐릭터용 | 소품 해당 없음 |

### 1b-2. Meshy (웹앱 / API)

출처: `[열림]` github.com/comfyanonymous/ComfyUI/comfy_api_nodes/nodes_meshy.py(raw, 공식 API 노드) / `[발췌]` docs.meshy.ai/en/api/text-to-3d, docs.meshy.ai/en/api/multi-image-to-3d, docs.meshy.ai/en/api/changelog, help.meshy.ai 9992029, runware.ai/docs/models/meshy-6.

| 옵션 | 값·기본 | 무엇을 바꾸나 | 우리 값 |
|---|---|---|---|
| `ai_model` | `meshy-7.1`·`meshy-7`·`meshy-6`·`latest`; Smart Topology는 `meshy-t2.5`(구 t2). `lowpoly`는 2026-10-30 퇴역 | 모델 버전. 우리 스크립트는 **meshy-6** | 7.1 |
| `mode` | `preview` → `refine`(텍스처) | 2단계 | 리토폴로지 입력이면 preview만 |
| `should_remesh` | 모델별 기본 다름(6-lite true, 그 외 false). **false면 topology·target_polycount 무시(원본 삼각 메시)** | 리메시 여부 | true |
| `topology` | `triangle`(기본) / `quad` | 토폴로지 | quad(흐름 확인) |
| `target_polycount` | 100~300,000, 노드 기본 300,000(일부 문서 30,000). Smart Topology는 100~30,000(기본 15,000) | 목표 면 수. **우리는 30,000 고정** | 큰 6,000 / 중 2,000 / 소 500(쿼드) |
| `decimation_mode` | 설정 시 `target_polycount` 무시 | 감폴리 방식 | 안 씀 |
| `symmetry_mode` | `auto`(기본)/`on`/`off`. 체인지로그: 2026-05 T2I·I2I·MI2I에서 **deprecated** | 대칭 강제 | 고목·소품 off |
| `pose_mode` | `""`/`A-pose`/`T-pose`(구 `is_a_t_pose` deprecated) | 캐릭터 포즈 | 해당 없음 |
| `ultra_mode` / `ultra_resolution`(=`geometry_resolution`) | false; `2k`(2048³)/`4k`(4096³, 7.1만) | 형태 정밀 패스 | 베이크 원본 비교 때 4k |
| `should_texture` | true | 텍스처 여부 | **false**(우리가 베이크) |
| `enable_pbr` | false | Metallic·Roughness·Normal 추가 | 참고용이면 true |
| `texture_prompt` / `texture_image(_urls)` | 600자(ST 800) / 이미지, 상호 배타. `texture_image_urls`는 7.1+ | 텍스처 지시 | 안 씀 |
| `texture_resolution` | `2k`/`4k`/`8k`(PBR 맵은 2K 고정 보도) | 텍스처 해상도 | 2k |
| `seed` | 0(ST 42), 비결정적 | — | 고정 |
| 멀티뷰 | 2~4장 | — | 2~3장 |
| **Remesh API**(별도 태스크) | `input_task_id`, `target_formats`, `topology`, `target_polycount`, `resize_height`, `origin_at`(`bottom` 예시) | **업로드/생성물 리메시·높이 리사이즈·원점** | 쿼드, 등급 면 수, origin_at bottom |
| 리깅·애니 | `height_meters` 0.1~15(기본 1.7), `action_id` 0~696 | 캐릭터용 | 해당 없음 |
| 텍스처 재생성 | `enable_original_uv`(true), `pbr`, `text_style_prompt`/`image_style`, 멀티뷰 1~4장 | 기존 UV 유지 재텍스처 | 안 씀 |

### 1b-3. Hunyuan3D (Tencent, 오픈소스 2.0/2.1 + 호스팅 API)

출처: `[열림]` github.com/Tencent-Hunyuan/Hunyuan3D-2(README, api_server.py raw), `[열림]` github.com/Tencent-Hunyuan/Hunyuan3D-2.1(README, API_DOCUMENTATION.md raw) / `[발췌]` fal.ai/models/fal-ai/hunyuan3d-v21/api, replicate.com ndreca/hunyuan3d-2.1.

| 옵션 | 값·기본 | 무엇을 바꾸나 | 우리 값 |
|---|---|---|---|
| 모델 | 2.0: DiT-v2-0 / Fast / Turbo, mini(0.6B), mv(멀티뷰); 2.1: Shape-v2-1(3.3B)+Paint-v2-1(PBR) | 품질·속도·멀티뷰 | 2.1 Shape |
| `octree_resolution` | 2.0 서버 128 / 2.1 서버 256(호스팅 1~1024) | 형태 해상도(복셀 격자) | 384(베이크 원본) / 256 |
| `num_inference_steps` | 서버 5 / fal 50(1~50) | 디퓨전 스텝 | 30~50 |
| `guidance_scale` | 5.0 / fal 7.5(0~20) | 프롬프트·이미지 충실도 | 5~7.5 |
| `num_chunks` | 8000 | 추론 분할(메모리) | 기본 |
| `face_count`(`max_facenum`) | 서버 40,000; replicate 20,000(10,000~200,000) | **FaceReducer 목표 면 수**(texture=true 때 FloaterRemover→DegenerateFaceRemover→FaceReducer 순) | 등급값(12k/4k/1k) |
| `texture` | false | 텍스처(2.1은 PBR) 생성, 3배 비용(fal) | false |
| `remove_background` | true | 배경 제거 | true |
| `seed` | 1234 | 재현 | 고정 |
| `mc_algo` | `mc` 고정(서버) | 마칭큐브 | — |
| Paint: `max_num_view` 6, `resolution` 512 | — | 텍스처 뷰 수·해상도 | 참고 |
| 토폴로지 | **쿼드 옵션 없음**(삼각 출력) | — | 리토폴로지 입력으로만 |
| 리깅 | 없음 | — | — |

### 1b-4. Rodin (Hyper3D / Deemos, Gen-2·Gen-2.5)

출처: `[열림]` github.com/comfyanonymous/ComfyUI/comfy_api_nodes/nodes_rodin.py(raw, 공식 API 노드) / `[발췌]` developer.hyper3d.ai/api-specification/rodin-generation-gen2, help.scenario.com Rodin Hyper3D Essentials, wavespeed.ai hyper3d-rodin-v2, modelrunner.ai hyper3d/rodin/gen-2.

| 옵션 | 값·기본 | 무엇을 바꾸나 | 우리 값 |
|---|---|---|---|
| `tier` | 레거시 Regular/Detail/Smooth/Sketch/Gen-2; Gen-2.5 Low/Medium/High(Regular 기본 High), Fast Extreme-Low~High, Extreme-High | 모델 등급 | Gen-2.5 Medium/High |
| `quality` → 면 수 | high/medium(기본)/low/extra-low = **Quad ≈50k/18k/8k/4k, Raw ≈500k/150k/20k/2k**; 노드 선택지 4K/8K/18K/50K-Quad, 2K/20K/150K/500K/1M-Triangle | 목표 면 수 | 큰 **8K-Quad**(≈16k△, 상한 초과 → 리토폴로지 전제) / 중·소 4K-Quad(≈8k△) + `quality_override` |
| `quality_override` / `mesh_faces` | Quad 1,000~200,000; Fast 1,000~20,000(기본 20,000); Extreme-High 20,000~2,000,000(Quad는 <200K) | 면 수 직접 지정 | 등급값 직접(6,000·2,000·500 쿼드) |
| `mesh_mode` | `Quad`(기본, Gen-2) / `Raw`(삼각). Gen-2.5 Extreme-High 기본 Raw(가이드 1건 상충) | 토폴로지 | Quad |
| `material` | `PBR`(기본)/`Shaded`/`All`/`None`(2.5) | 재질 맵 | None(우리가 베이크) |
| `geometry_file_format` | glb(기본)/fbx/obj/stl | 포맷 | fbx |
| `texture_mode` / `hd_texture` / `texture_delight` | Default·legacy·extreme-low~high / false / false | 텍스처 품질·조명 제거 | 참고용이면 delight true |
| `addons: HighPack` | false | **4K 텍스처 + Quad 면 수 ≈16배** | false(상한 위반) |
| `bbox_condition`(W·H·L 0~300) / `height_cm` 0~10,000 | 0 | 실측 크기 조건 | 소품 실측 입력 |
| `TAPose` | false | 캐릭터 포즈 | — |
| `condition_mode` | `fuse`/`concat`(멀티 이미지 1~5장) | 다중 이미지 결합 | concat(멀티뷰) |
| `use_original_alpha` | false | 투명 보존 | false |
| `creative` / `is_micro` | false | 창작 변형 / 미세 디테일 | false |
| `seed` | 0~65535 | — | 고정 |
| 리깅 | 없음 | — | — |

### 1b-5. 네 도구 공통 결론

- 네 도구 모두 **면 수 상한·토폴로지·PBR 여부·텍스처 해상도·대칭·모델 버전**을 노출한다. 우리는 Meshy 1개 도구에서 `target_polycount 30000`만 바꿔 썼다 → 소품 등급별 상한(12k/4k/1k△)으로 **요청값을 내리는 것부터가 "배움"**이다.
- 리토폴로지 *입력*으로 쓸 때의 공통 세팅: 텍스처 **끔**, 형태 품질 **최고**(Tripo geometry_quality detailed / Meshy ultra 4k / Hunyuan octree 384 / Rodin High), 면 수는 **상한 그대로 요청하지 않고 2~4배 높게 받아 Instant Meshes로 내린다**(생성기 감폴리보다 우리 리토폴로지가 엣지 흐름을 통제).
- 생성기 자체 저폴리(Tripo smart_low_poly / Meshy Smart Topology t2.5 / Rodin 4K-Quad)는 비교판 B·C안으로만 받고, 결과가 §2.2 판정(실루엣·엣지 흐름)을 통과하는지 사용자가 본다.

## 2. 단계별 절차서 (자산 파이프라인 순서)

각 단계: ① 도구 1순위/대안 ② 출처 2개 이상(URL·접속) ③ 우리 용도 설정값(실습 전 제안값, 실습에서 측정해 고친다) ④ 실패 시 대안 ⑤ 실습 칸.

### 2.1 스컬프트·블록아웃 — 고목 밑동

- **도구:** Blender Sculpt(Voxel Remesh + Dyntopo) / 대안: 없음(Blender만)
- **출처:**
  - docs.blender.org/manual/en/dev/sculpt_paint/sculpting/tool_settings/remesh.html `[발췌]` — Voxel Size(작을수록 디테일↑·밀도↑), Adaptivity(불필요 구역 면 수 감소, >0이면 Fix Poles 꺼짐).
  - docs.blender.org/manual/en/dev/sculpt_paint/sculpting/tool_settings/dyntopo.html `[발췌]` — Detailing: Relative(화면 픽셀 기준)·Constant(단위 기준)·Brush(브러시 반경)·Manual(Flood Fill 때만). Constant/Manual에서 Detail Flood Fill(Ctrl-R).
  - gooseberry.blender.org/tree-sculpting_timelapse `[발췌]` — Blender Studio 나무 스컬프트: 1패스 Clay Strips로 수피 덩어리, 2패스 Crease로 골 깊이기. "스타일 모델은 수피 텍스처를 그대로 못 쓴다".
  - Packt *Sculpting the Blender Way* ch.2 `[발췌]` — 4 워크플로(기본·Dyntopo·Voxel·Multires) 전환 순서, Voxel Size 과소 시 크래시 경고.
- **옵션 전수(1순위 도구) — Blender Voxel Remesh / Dyntopo** `[발췌]`(docs.blender.org dev 매뉴얼):

| 옵션 | 뜻 | 우리 값 |
|---|---|---|
| Voxel Size (R로 표면에서 샘플) | 복셀 한 변. 작을수록 디테일·면 수↑ | 0.05 → 0.02 (고목 밑동) |
| Adaptivity | 평탄부 면 수 감소(삼각 섞임), >0이면 Fix Poles 꺼짐 | 0 (스컬프트 중) |
| Fix Poles | 극점 정리 | 켬 |
| Preserve Volume | 리메시 뒤 부피 유지 | 켬 |
| Preserve Paint Mask / Face Sets / Color Attributes | 마스크·면 집합·정점색 재투영 | 마스크 켬 |
| Remesh (Ctrl-R) | 실행 | 단계마다 |
| Dyntopo Refine Method | Subdivide Edges / Collapse Edges / Subdivide Collapse | Subdivide Collapse |
| Dyntopo Detailing | Relative(화면 px) / Constant(단위) / Brush(반경) / Manual(Flood Fill만) | Constant |
| Detail Size / Resolution / Percentage | 모드별 수치 | Resolution 40~60 |
| Detail Flood Fill (Ctrl-R) | 전체를 균일 디테일로 | 2차 디테일 전 1회 |
| 주의 | Dyntopo는 UV·정점색을 잃고 Multires와 비호환 | UV는 리토폴로지 뒤 |
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
- **옵션 전수 — Instant Meshes CLI** **[열림]**(src/main.cpp 도움말 원문):

| 플래그 | 뜻 | 우리 값 |
|---|---|---|
| `-o, --output` | PLY/OBJ 출력(배치 모드) | retopo.obj |
| `-f, --faces` / `-v, --vertices` / `-s, --scale` | 목표 면 수 / 정점 수 / 월드 엣지 길이(셋 중 하나) | `-f 4000`(쿼드) |
| `-r, --rosy 2|4|6` / `-p, --posy 4|6` | 방향 대칭 / 위치 대칭 → 4·4 = 쿼드, 6·6 = 삼각 | 4 / 4 |
| `-c, --crease <deg>` | 크리즈(하드 엣지) 각 임계 | 30(유기체) / 15(하드 서피스) |
| `-S, --smooth <iter>` | 스무딩·레이트레이스 재투영 반복(기본 2) | 2 |
| `-D, --dominant` | 순수 쿼드/삼각 대신 dominant 메시 | 끔 |
| `-i, --intrinsic` | intrinsic 모드(기본 extrinsic) | 끔 |
| `-b, --boundaries` | 열린 메시 경계 정렬 | 절단면 있으면 켬 |
| `-d, --deterministic` | 결정론(느림) | 켬(재현) |
| `-t, --threads` | 스레드 수 | 기본 |
| `-k, --knn` | 포인트클라우드 모드 인접 수 | 해당 없음 |
| `-C, --compat` | 구버전 스냅샷 호환 | — |

- **옵션 전수 — Blender Quadriflow Remesh** `[발췌]`: Mode Ratio/Edge Length/**Faces**(기본), Target Faces, Use Mesh Symmetry(끔), Preserve Sharp(유기체 끔·하드 켬), Preserve Mesh Boundary(절단면 켬), Preserve Paint Mask(끔), Smooth Normals(켬), Seed(고정).
- **옵션 전수 — Quad Remesher(Blender 패널)** `[발췌]`(UserDoc 1.3·BlenderArtists): Quad Count(기본 ~5000 → 4000), Adaptive Size 0~100(기본 50, 0=균일), Adapt Quad Count(끄면 목표에 근접), Use Vertex Colors(밀도 페인트: 빨강↑), Detect Hard Edges by angle(유기체 끔), Use Normals Splitting(하드 서피스 대안), Use Materials(재질 경계 유지, Hard Edges와 동시 사용 비권장), Symmetry X/Y/Z(끔). 체험판은 온라인 필수.
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
- **옵션 전수 — Blender UV 연산자** `[발췌]`(docs.blender.org uv.html·Pack Islands PR 104469):

| 연산자 | 옵션 | 우리 값 |
|---|---|---|
| Mark Seam | 수동 | 골 안쪽·뒷면 |
| Unwrap | Method Angle Based / Conformal / Minimum Stretch(SLIM, 4.3+); Fill Holes; Correct Aspect; Use Subdivision Surface; Margin Method; Margin | Angle Based(또는 Minimum Stretch), Correct Aspect 켬 |
| Smart UV Project | Angle Limit(낮으면 섬 多·왜곡↓); Margin Method; Rotation Method; Island Margin(UV 분수, 1/1024=1px@1024); Area Weight; Correct Aspect; Scale to Bounds | 1차 임시용만: Angle 66, Margin 0.004 |
| Average Islands Scale | Scale UV / Shear | 팩 전 1회 |
| Minimize Stretch | Blend, Iterations | 왜곡 섬에만 |
| Pack Islands | Shape Method Exact(Concave)/Boundary(Convex)/Bounding Box; Scale; Rotate; Rotation Method; Margin Method Scaled(기본)/Add/Fraction; Margin; Pin/Lock Pinned; Merge Overlapping; Pack to | Exact, Rotate 켬, Fraction 0.004 |
| Seams from Islands | 섬 경계를 심으로 | 검수용 |
| Texel Density Checker(애드온, GPL) | Calculate/Set/Copy TD, 텍스처 크기 프리셋, 체커 재질, 섬별 색 | 2048, 512 px/m 목표 |
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
- **옵션 전수 — Blender Cycles Bake** `[발췌]`(2.91 매뉴얼 원문 + 현행 BakeSettings API):

| 옵션 | 뜻 | 우리 값 |
|---|---|---|
| Bake Type | Combined / AO / Shadow / Position / Normal / UV / Roughness / Emit / Environment / Diffuse / Glossy / Transmission | Normal, AO, Emit(Pointiness→Curvature) |
| Influence(Combined·Diffuse 등) | Direct/Indirect/Color | AO·Normal에 해당 없음 |
| Normal Space | Object / **Tangent**(기본) | Tangent |
| Swizzle R/G/B | +X +Y +Z(기본, OpenGL) | 기본(Unity Flip Green 끔) |
| Selected to Active | 고→저 투영 | 켬 |
| Cage / Cage Object / Cage Extrusion | 팽창 케이지(동일 토폴로지) / 거리 | 켬 / 0.03m |
| Max Ray Distance | 케이지 미사용 때 레이 상한(0=무제한) | 0 |
| Output Target | Image Textures / Active Color Attribute | Image Textures |
| Margin Type / Size | Adjacent Faces(기본, 심 너머 픽셀) / Extend; px | Adjacent Faces / 16px@2048 |
| Clear Image | 베이크 전 비움 | 켬 |
| 주의 | 레이는 로폴리에서 안쪽; Edge Split 하드 분할 피함 | Shade Smooth |
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
- **옵션 전수 — URP Lit Surface Inputs(URP 17.6)** `[발췌]`: Workflow Mode Metallic/Specular(Metallic), Base Map, Metallic Map(R 메탈릭), Smoothness 0~1 슬라이더(맵과 곱), Source **Metallic Alpha**(기본)/Albedo Alpha, Normal Map(+Scale), Height Map(패럴랙스), Occlusion Map(G), Emission, Tiling/Offset, Detail Inputs(Mask·Base·Normal). PBR 수치 범위(Substance PBR Guide 2부 `[발췌]`): 비금속 알베도 sRGB ≈30~240, 금속 반사 180~250, 메탈릭 0/1, 러프니스 재질별.
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
- **옵션 전수 — Blender Decimate / Unity LOD Group / Unity Mesh LOD** `[발췌]`:

| 도구 | 옵션 | 우리 값 |
|---|---|---|
| Decimate Collapse | Ratio(1=무변), Symmetry(축), Triangulate, Vertex Group + Factor, Face Count 표시 | LOD1 0.5·LOD2 0.25·LOD3 0.1, Triangulate 켬, 보호 VG |
| Decimate Un-Subdivide | Iterations(짝수) | 그리드 메시만 |
| Decimate Planar | Angle Limit, Delimit(Normal/Material/Seam/Sharp/UVs), All Boundaries | 하드 소품만 |
| LOD Group | Fade Mode None/Cross Fade/SpeedTree; Animate Cross-fading; Fade Transition Width 0~1; 레벨 screen-relative height; Cull; LOD Bias(Quality) 경고 | Cross Fade, Animate 끔, Width 0.1, 0.35/0.15/0.06/Cull 0.02 |
| Mesh LOD(6.2+) | 모델 Inspector LODs → Generate mesh LODs(임포트 시간↑); Mesh Inspector LOD 슬라이더; Quality > Mesh LOD Threshold; Renderer Force Mesh LOD(-1 기본)·LOD Selection Bias; 제한: 삼각만·LOD Group 병용 비권장·Skinned LOD0 | Group 없이 단독 비교용 |
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
- **옵션 전수 — Blender FBX 내보내기** `[발췌]`(bpy.ops.export_scene.fbx API·매뉴얼): Limit to Selected Objects; Object Types; Scale; Apply Scalings All Local/FBX All/**FBX Units Scale**/FBX Custom; Forward/Up(**-Z / Y**); Apply Unit; Use Space Transform; Apply Transform(실험); Apply Modifiers(셰이프키 불가); Export Subdivision Surface; Smoothing Off/**Normals Only**(split normals 이해 임포터 권장)/Face/Edge; Smoothing Groups; Loose Edges; Tangent Space; Triangulate Faces; Custom Properties; Bake Animation(NLA·All Actions·Force Start/End·Sampling Rate·Simplify).
- **옵션 전수 — Unity Model Import(Model 탭)** `[발췌]`(FBXImporter-Model 2022.3/6.x): Scene: Scale Factor, **Convert Units**, Bake Axis Conversion, Import BlendShapes, Import DeformPercent, Import Visibility, Import Cameras, Import Lights, Preserve Hierarchy, Sort Hierarchy By Name. Meshes: Mesh Compression Off/Low/Medium/High, Read/Write, Optimize Mesh(Polygon/Vertex Order), Generate Colliders. Geometry: Keep Quads, Weld Vertices, Index Format Auto/16/32, Legacy Blend Shape Normals, Normals Import/Calculate/None, Blend Shape Normals, Normals Mode, Smoothness Source, Smoothing Angle, Tangents Import/Calculate Legacy/Calculate Mikktspace/None, Swap UVs, Generate Lightmap UVs(+Lightmap UV 설정), Strict Vertex Data Checks.
- **옵션 전수 — Unity Texture Import** `[발췌]`(TextureTypes·class-TextureImporter): Texture Type Default/Normal map/Sprite/Cursor/Cookie/Lightmap/Single Channel; Texture Shape 2D/Cube/2D Array/3D; sRGB (Color Texture); Alpha Source; Alpha Is Transparency; Flip Green Channel(노멀)·Swizzle; Filtering Smooth/Sharp(노멀 생성 시); Non-Power of 2; Read/Write; Virtual Texture Only; Generate Mipmap(기본 켬); Mipmap Limits; Stream Mipmap Levels(+Priority); Mipmap Filtering Box/Kaiser; Preserve Coverage; Replicate Border; Fadeout to Gray; Ignore PNG Gamma; Wrap Mode; Filter Mode; Aniso Level; 플랫폼별 Max Size/Resize Algorithm/Format(BC7 고품질 기본·DXT5·BC5)/Compression/Use Crunch/Compressor Quality.
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
- **옵션 전수 — URP Terrain Lit / Decal Projector / Polybrush** `[발췌]`:

| 도구 | 옵션 | 우리 값 |
|---|---|---|
| Terrain Lit | Enable Height-based Blend(Mask Map **B=높이**), Height Transition(월드 단위), Enable Per-pixel Normal, Mask Map R 메탈릭·G AO·B 높이·A 스무스니스, 레이어 >4면 블렌드 무시 | 켬, 0.15, 레이어 ≤4 |
| Decal Renderer Feature | Technique Automatic/DBuffer/Screen Space(노멀 블렌드만), Surface Data, Max Draw Distance, Use Rendering Layers; **Terrain·파티클 불가** | DBuffer |
| Decal Projector | Scale Mode(Inherit from Hierarchy 주의), Width/Height/Depth, Pivot, UV Tiling/Offset, Opacity, Draw Distance, Start Fade, Angle Fade, Material | 지형 위 Quad에 Decal Material, Opacity 0.6 |
| Polybrush(미설치 1.1) | Sculpt / Smooth / Color(정점색) / Texture(Standard·TriPlanar·Unlit Blend) / Scatter(프리팹), 미러, **Terrain 비호환** | 설치 승인 뒤 Texture Blend |
| ProBuilder 6.1.4 | 지오메트리 편집·UV·정점색 | 스커트 메시 보정 |
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

### 3b. 생성 도구 옵션 비교판 (CTO 추가 11-05, Mac·무료 티어·사용자 로그인 뒤)

같은 입력 1개(소품 사진 1장 또는 1-1 소품 콘셉트)로 도구별·옵션별 결과를 한 판에 놓는다. 생성 메시 최종 사용은 폐기 그대로이고, **"옵션을 제대로 쓴 결과가 리토폴로지 입력으로 쓸 만한가"**를 사용자가 판단하는 자료다.

| 열 | 설정 | 산출 |
|---|---|---|
| A0 기준(지금까지) | Meshy meshy-6, quad, target_polycount 30000, remesh true(= `meshy_generate.cjs`) | 와이어+실루엣 |
| A1 Meshy 상한 | meshy-7.1, quad, target_polycount 등급값(6k/2k/500 쿼드), texture false, symmetry off | 와이어+실루엣+면 수 |
| A2 Meshy Smart Topology | meshy-t2.5, target_polycount 등급값 | 〃 |
| B1 Tripo H3.1 | geometry_quality detailed, texture false, face_limit 등급×2 → Instant Meshes로 등급값 | 〃 |
| B2 Tripo smart_low_poly | smart_low_poly true, quad true, face_limit 등급값 | 〃 |
| B3 Tripo P2 | quad true, face_limit 등급값 | 〃 |
| C1 Hunyuan3D 2.1 | octree 384, steps 50, face_count 등급×2 → Instant Meshes | 〃 |
| D1 Rodin Gen-2.5 | High, 4K-Quad 또는 quality_override 등급값, material None | 〃 |
| 판정 | 각 열을 §2.2 기준(실루엣 1x 동일·엣지 흐름·하드 엣지)으로 PASS/RETOUCH/FAIL | 비교판 1장 `img/tm-gen-options-board.png` + 요청 JSON 원문 |

무료 티어 크레딧 안에서만(유료 지출 0). 각 열의 요청 JSON·크레딧 차감·소요 시간을 함께 기록한다.

## 4. 미검증 목록 (17건) — Mac·사용자 확인 필요

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
| 14 | Tripo `face_limit` **버전별 상·하한 원문**(H3.1 500~1.5M, P2 48~50k, smart_low_poly 500~20k) | developers.tripo3d.com 못 열음, SDK·노드·aliyun 발췌가 수치 상충 | 공식 docs 열기 + Studio UI 대조 |
| 15 | Meshy Remesh API `resize_height`·`origin_at` **정의**, Smart Topology t2.5 면 수 상한 | docs.meshy.ai 못 열음, 리셀러 예시만 | docs.meshy.ai/en/api/remesh 열기 |
| 16 | Rodin Gen-2.5 **mesh_mode 기본값**(Quad vs Raw), quality_override 상한 | 공식 spec(Gen-2)과 2026-10 가이드 상충 | developer.hyper3d.ai 열기 |
| 17 | Hunyuan3D **호스팅 API(Tencent Cloud) 파라미터명**과 텍스처 해상도 옵션 | 오픈소스 서버·fal·replicate만 확인 | Tencent Cloud 문서 |

## 5. 다음 일·갱신

- Mac 세션: §3 실습 8쌍 + §3b 옵션 비교판 1장 + §4 1~17 확인 → 이 문서의 `[발췌]`를 `[열림]`으로, 제안 설정값을 실측값으로 바꾼다.
- 결과로 "매뉴얼 01(지형·소품)·15(성능 예산)" 도구 표를 갱신한다(두 매뉴얼은 아직 없음 → AT 레인 결과와 함께 신설).
- 유료 항목(Quad Remesher·Substance·UVPackmaster·Smart Remesh·Polybrush 외 패키지 설치는 무료)은 사용자 승인 뒤에만 진행하고 SPEND_LOG에 적는다.

## 6. 변경 이력

- 2026-11-05 클라우드 TM 레인(브랜치 `claude/unity-cloud-tool-mastery-20261105`): 초판. §1 후보 16종 확인, §2 8단계 출처·설정값·대안 채움(직접 열린 URL 6개는 github.com 계열, 그 외 공식 문서는 검색 발췌), §3 Mac 실습 대기, §4 미검증 13건.
- 2026-11-05 2차(CTO 추가 지시 "옵션들을 다 쓰고 있나"): §1b 생성 도구(Tripo·Meshy·Hunyuan3D·Rodin) 옵션 전수표 + 사실 확인(`meshy_generate.cjs`가 meshy-6·quad·target_polycount 30000 고정 전송 → 2~4만△ 유입 원인), §2 각 단계에 "옵션 전수 + 우리 값" 표, §3b 옵션 비교판 과제(Mac·무료 티어), §4 미검증 13→17건.
- 2026-11-05 3차(CTO 범위 조정 15:05, 캐릭터 도구 우선): `MANUAL/TOOLS/` 신설 — README 색인 + 캐릭터 도구 5장(Rigify 리깅·웨이트 전사·모듈러 파트/바디 마스크·소켓 부착·Unity bones 재매핑/UE Leader Pose)을 8칸 틀로 작성(클라우드 조사, 실습 칸 Mac 대기). 소품 파이프라인 8칸 분리는 그다음.
