# Unity MAP3D M1 준비 — Meshy 메시 임포트 경로 사전 구축 (2026-10-26, 단순작업3)

명세 `E:/exoduser-wt/_out/pc-map3d-m1prep/SPEC.md`, 기획서 `docs/4.1맵디자인+설정/UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md` §4.3·M1. 베이스 `23451c97a`. 커밋 없음. Meshy·이미지 API 호출 0회, `Packages/*`·`ProjectSettings/*` 변경 0.

## 1. 포맷 결정 (Meshy 공식 API 문서 확인: docs.meshy.ai/en/api/image-to-3d, /remesh)

| 형식 | Meshy 제공 | Unity 내장 임포트 | PBR 맵 연결 | 축·단위 | 장단점 | 권장 |
|---|---|---|---|---|---|---|
| **FBX** | `target_formats`에 `fbx` → `model_urls.fbx` | **가능**(내장 FBX 임포터) | 맵은 별도 PNG: `texture_urls`의 `base_color`, `metallic`, `normal`, `roughness`(+`emission`은 meshy-6 한정). `enable_pbr:true` 필요(metallic/normal/roughness). **AO 맵은 문서에 없음** | 문서에 명시 없음(미확인) | 이름·노드 보존, `bakeAxisConversion` 지원 | **1순위** |
| **OBJ** (+MTL) | `obj`, `mtl` | **가능**(내장 OBJ 임포터, 이미 슬라이스에서 검증) | 같은 PNG 세트, MTL은 쓰지 않음 | 문서 없음. 임포트 시 X가 뒤집힌다(실측) → 기본 yaw 오프셋 180 | 가장 단순, 단일 UV, 노드 구조 없음 | **폴백** |
| GLB | 기본·주력 | **불가**(패키지 필요: glTFast 등) | 임베드 PBR | glTF 규약(Y-up)이 자연스러움 | `Packages/manifest.json` 변경 = 공용 설정 → 이번에 하지 않음 | 보류(필요하면 Codex 협의: 장단점·라이선스·버전은 미조사) |
| USDZ / STL / 3MF / blend(Remesh) | 제공 | 불가 또는 UV·텍스처 없음 | — | — | — | 사용 안 함 |

**Meshy에 요청할 옵션(권장)**: `target_formats: ["fbx","obj"]`, `enable_pbr: true`, `origin_at: "bottom"`(문서: 기본값 bottom), `should_remesh: true` + `topology: "triangle"` + `target_polycount`(100~300000, 문서 기준), `ai_model: "meshy-7.1"/"latest"`, `texture_resolution: "2k"`. `auto_size`는 켜지 않는다(실제 크기는 매니페스트 목표 px로 정규화).
**LOD**: Meshy는 LOD를 따로 주지 않는다(문서에 LOD 언급 없음). LOD1/2는 같은 이미지로 `target_polycount`를 달리한 별도 태스크(또는 Remesh 태스크)로 만들고 매니페스트 `lods[]`에 넣는다. Remesh 크레딧 단가는 문서에 없음(미확인).
**보존**: 결과는 `expires_at` 이후 삭제(기획서 4.3: 3일 안에 저장) — 내려받는 즉시 저장한다.
**미확인 → 첫 실제 에셋에서 실측할 것**: Meshy FBX/OBJ의 축·단위·정면 방향. 코드는 단위를 가정하지 않는다(경계 상자로 정규화), 정면은 `yawOffsetDegrees`(기본 obj 180, fbx 0)로 맞춘다 — fbx 기본값 0은 검증 전.

## 2. 변경·신규 파일 (PC 소유)

| 파일 | 내용 |
|---|---|
| `Editor/Map3DMeshImport.cs` (신규) | `AssetPostprocessor`. `Assets/Exoduser/Resources/Art/map3d/meshy/` 아래 `.fbx/.obj`에만 적용: 머티리얼 임포트 끔, 콜라이더 끔, 읽기·쓰기 끔, 애니메이션·카메라·라이트·블렌드셰이프·가시성 끔, 노멀 Import, 탄젠트 Mikktspace, 메시 압축 끔, 폴리/버텍스 최적화, 용접, 2차 UV 끔, `bakeAxisConversion`. 기존 `Art/map3d/mesh` OBJ 설정은 불변 |
| `Runtime/NativePerspectiveWorld.Assets.cs` (신규) | 매니페스트 로더·검증·정규화·LODGroup 인스턴스, 슬롯 해석 |
| `Resources/Data/map3d_assets.json` (신규) | 매니페스트(기본 빈 `assets`·`slots`) |
| `Resources/Shaders/Look3DProp.shader` (신규) | Meshy PBR + 지면 블렌드 + 접촉 어둡기 + 그림자 caster/receiver |
| `Runtime/NativePerspectiveWorld.Slice.cs` (수정, diff +26/−11) | `MeshSpec.slot`·`SlicePlacement.slot/assetId` 추가, `BuildSliceMeshes`에 "슬롯에 에셋이 있으면 에셋, 없으면 기존 OBJ" 분기, 영수증에 매니페스트 결과 필드 |

## 3. 매니페스트 스키마 `exoduser.unity.map3d-assets.v1`

최상위: `schema`(필수, 위 값과 같아야 로드), `assets[]`, `slots[]`. `--unity-world3d-assets=<파일>` 실행 인자로 다른 매니페스트를 대신 로드(시험·스탠드인; 추적 파일은 건드리지 않음).

| 필드(assets[]) | 필수 | 설명·기본값 |
|---|---|---|
| `id` | ● | 고유 id |
| `tag` | ● | `mass` / `root` / `prop` / `landmark` |
| `format` | ● | `obj` / `fbx` (기본 yaw 오프셋 결정) |
| `model` | ● | Resources 경로(확장자 제외), 예 `Art/map3d/meshy/<id>/<id>` |
| `lods[]` | – | `{model, screenHeight}` LOD1, LOD2(최대 LOD2). `screenHeight`>0이면 그 LOD가 시작되는 화면 높이비를 덮어씀 |
| `targetHeightPx` / `targetWidthPx` | ● 중 하나 | 균일 스케일: 높이 우선, 없으면 가로·깊이 중 큰 쪽. 1 unit = 1 px |
| `pivot` | – | `bottom-center`(기본: 경계 상자 바닥 중심을 원점으로) / `none` |
| `hasYawOffset`·`yawOffsetDegrees` | – | 지정 안 하면 obj 180°, fbx 0° |
| `groundBlendHeightPx` | – | 0이면 목표 높이의 20% |
| `noShadow` | – | 그림자 caster 끔 |
| `baseColor`·`normal`·`roughness`·`metallic`·`ao` | – | PBR 맵 Resources 경로. 없는 맵은 중립값(roughness 1, metallic 0, ao 1, normal 평면) |
| `provenance.source`·`date`·`approvedBy` | ● | 모든 에셋 필수. **하나라도 비면 로드 거부** |
| `provenance.taskId`·`prompt`·`model`·`credits` | ● (source가 `meshy…`) | Meshy task id·프롬프트·모델·크레딧 |

`slots[]`: `{slot, assetId}`. 슬롯 id는 §6 표. 없는 에셋·거부된 에셋을 가리키는 슬롯은 **기존 절차 OBJ로 폴백**하고 사유를 `AssetRejections`/`slice.json`에 남긴다.

예(Meshy 에셋):
```json
{ "id": "wall_B_01", "tag": "mass", "format": "fbx", "model": "Art/map3d/meshy/wall_B_01/wall_B_01",
  "lods": [ { "model": "Art/map3d/meshy/wall_B_01/wall_B_01_lod1", "screenHeight": 0 } ],
  "targetHeightPx": 320, "baseColor": "Art/map3d/meshy/wall_B_01/base_color", "normal": "Art/map3d/meshy/wall_B_01/normal",
  "roughness": "Art/map3d/meshy/wall_B_01/roughness", "metallic": "Art/map3d/meshy/wall_B_01/metallic",
  "provenance": { "source": "meshy", "taskId": "<id>", "prompt": "<text>", "model": "meshy-7.1", "credits": "30", "date": "2026-10-27", "approvedBy": "<name>" } }
```

## 4. 변환식
- 스케일 `s = targetHeightPx / bounds.size.y` (높이 없으면 `targetWidthPx / max(bounds.size.x, bounds.size.z)`). 슬라이스 배치 스케일 `p.scale = spec.scale × jitter(0.92~1.08) × s`.
- 피벗 오프셋(LOD 자식 로컬) `(-center.x, -min.y, -center.z)` (LOD0 경계 상자 기준, 부모 스케일 적용 전).
- 위치 `Unity(x, 0, y)` = `(px_x, h, −px_y)`(S1 매핑), 회전 `y = 접선각θ + yawOffset`(절차 OBJ는 θ+180), 충돌 없음.
- 배치 발자국 타원은 LOD0 경계 상자 × 배치 스케일(기존 FindPlacement 그대로) → 충돌·배치 규칙 불변(발자국 샘플 `CanMove` 위반 0 검사 유지).
- 높이 늘림(heightStretch)은 절차 OBJ에만 적용, 키트 에셋은 매니페스트 크기 그대로.

## 5. LOD·재질
- LODGroup 전환(화면 높이비): LOD1은 12% 아래에서 시작, LOD2는 5% 아래, 마지막 LOD는 1% 아래에서 컬. 슬라이스 mass 150~400px/1080 = 14~37% → START에서는 LOD0 유지. LOD가 하나여도 LODGroup을 만들어 1%에서 컬한다.
- `Look3DProp`: base albedo(sRGB 디코드) × (1−metal), 노멀맵(메시 탄젠트), roughness→ 기존 `L3D_Spec`(키 하이라이트), AO 맵(0.9 혼합), **지면 블렌드**: 월드 높이 < `_BlendHeight`에서 지면 albedo(floor_v01b 확률적 타일링+지면 워프+지면 톤 곱)와 roughness를 85%까지 섞고 노멀을 위쪽으로 50% 완화, 접촉 어둡기(0.45→1, 높이 90px), 그림자 수신·캐스트(TwoSided), 안개·헤이즈 공용. 접촉 AO 블롭은 슬라이스의 기존 타원 2장이 그대로 깔림.
- 텍스처 샘플: 맵 5 + 지면 4(블렌드 구간에서만).

## 6. 교체 지점(슬롯 → 에셋) — 슬라이스 외곽 mass/뿌리 배치 8개
| 슬롯 id | 현재 폴백 OBJ | 스케일 | 비고 |
|---|---|---|---|
| `mass_01` | `mesh/mass_01.obj` | 1.0 | |
| `mass_02` | `mesh/mass_02.obj` | 1.0 | |
| `mass_03` | `mesh/mass_03.obj` | 1.1 | |
| `mass_04` | `mesh/mass_04.obj` | 1.0 | |
| `mass_03_small` | `mesh/mass_03.obj` | 0.8 | |
| `root_01` / `root_02` / `root_03` | `mesh/root_01~03.obj` | 1.0 / 1.0 / 1.1 | 뿌리는 높이 늘림 없음, 보행 가능 경계 +25px까지 허용 |
배치 좌표·회전 규칙·충돌(발자국 위반 0)은 불변. 슬롯 외 추가 슬롯(랜드마크 등)은 M2 이후 이 표에 확장.

## 7. 시험 결과 (각 1회)
| 시험 | 결과 |
|---|---|
| Win64 빌드(build16 = 빈 매니페스트, build17 = 스탠드인 포함 리소스) | errors 0, 컴파일/셰이더 에러 0, Exoduser 스크립트 `warning CS` 0 |
| **회귀: 빈 매니페스트 vs capture14** | 평균 절대 픽셀 차 **0.0000**, 최대 0, 8 이상 차이 픽셀 0(전부 동일). 배치 8개·발자국 위반 0·체크 5/5 PASS |
| 스탠드인(`mass_01.obj` 복사 + LOD1 `mass_04.obj` 복사, 출처 "standin, gen_mass.py seed 1101") | 매니페스트 1개 로드·인스턴스 1개, 슬롯 `mass_01`이 Look3DProp 경로로 렌더(LODGroup 2단, 높이 386px = 목표 380×지터). 지면 블렌드·접촉 AO·그림자 확인(`pc-map3d-m1prep/standin_capture.png`, `crop_standin_base_before_after_1x.png`) |
| 출처 거부 | `approvedBy` 비운 Meshy 항목 → `bad_no_provenance: provenance.approvedBy empty`로 거부, 슬롯 `mass_02`는 OBJ 폴백 |
| 없는 에셋 슬롯 | `mass_04 → does_not_exist` 거부·폴백 기록 |
| FPS 30초(빈 매니페스트, capture16) | 평균 119.659 / 최저 1초 109.93 / 최저 순간 12.1 / 최장 82.7ms |
| FPS 30초(스탠드인, capture17s) | 평균 119.379 / 최저 1초 108.999 / 최저 순간 16.2 / 최장 61.8ms |
| 스탠드인 제거 | `Resources/Art/map3d/meshy/`(스탠드인 폴더와 폴더 .meta)를 `_out/pc-map3d-m1prep/standin_removed/`로 이동, 작업 트리에 `meshy`·`standin` 경로 없음(`git status`·`find` 확인). 스탠드인 매니페스트는 저장소 밖 `_out/pc-map3d-m1prep/standin_manifest.json` |

솔직한 기록: 두 FPS 측정에 단발 지연 프레임(60~80ms)이 있다(이전 빌드에서 9ms였던 같은 장면). 원인 미확인, 분리·재측정은 하지 않았다. 평균 FPS는 119 이상이다. 스탠드인은 박스 투영 UV(512px=1타일)이고 PBR 맵은 mass_v01 albedo+기존 normal이므로 외관 판정이 아니라 경로 시험이다.

## 8. 실제 Meshy 에셋이 오면 할 일
1. 결과 파일을 즉시 저장(3일 보존) — 모델 FBX(또는 OBJ), `texture_urls` PNG 4종, LOD용 별도 태스크 결과.
2. `Resources/Art/map3d/meshy/<assetId>/`에 모델·텍스처 배치(텍스처는 normal 맵 임포트 설정 확인: Normal map 타입, 나머지 sRGB 여부: base_color만 sRGB).
3. 첫 에셋: 단위·축·정면 확인 → 필요 시 `yawOffsetDegrees` 지정(fbx 기본 0은 미검증), `bakeAxisConversion` 결과 확인.
4. `map3d_assets.json`에 항목(출처 전부 기입) + `slots` 연결.
5. 슬라이스 캡처(30초 FPS 포함) → 1x 크롭(지면 블렌드·접촉 AO·그림자·실루엣) → 충돌 오버레이 컷(발자국 위반 0).
6. 맥북 총괄 검수 → 커밋(모델·텍스처·매니페스트 한 단위, 기존 .meta 재직렬화 노이즈 제외).

## 9. Codex 협의가 필요한 것
- GLB 직접 임포트가 필요하면 glTFast 등 패키지 추가(`Packages/manifest.json` 변경). 이번 경로는 FBX/OBJ만으로 동작하므로 필수 아님.
- Linear 색공간 전환(기획서 §1: PBR 에셋 도입 시점 재판단): `Look3DProp`은 현재 Gamma 프로젝트 기준(sRGB 디코드/인코드 매크로)이며 Linear 전환 시 `L3D_DECODE/ENCODE` 분기가 이미 대응한다.
