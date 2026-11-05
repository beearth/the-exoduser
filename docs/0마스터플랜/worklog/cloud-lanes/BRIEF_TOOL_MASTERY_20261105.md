# 브리프 TM — 도구를 제대로 쓰는 법을 배운다 (2026-11-05)

사용자 원문(11-05 09:40 KST): "니가 잘 못 쓰는 거 같은데 툴들 쓰는 법을 좀 배워라. 스마트메시나 그런 것들 공부 좀 해." 사용자 지적의 요지: 인게임에서 거지같아 보이는 원인이 도구가 아니라 **우리가 도구를 못 쓰는 것**일 수 있다. 자산 파이프라인의 각 도구를 "쓸 줄 아는 수준"까지 배우고, 그 증거를 실물(같은 입력 → 전·후 비교)로 낸다.

## 0. 범위·금지
- 상용 게임 파일 추출 금지. 유료 지출 0(체험판·무료 티어만). 로그인은 사용자가 직접.
- 결과는 "도구 설명"이 아니라 **"우리 파이프라인에서 이 단계에 이 도구를 이렇게 쓴다"** 수준의 절차서 + 실물 비교 이미지다. 글만 있는 결과는 미완이다.
- 무창·무음(Blender `--background`, 화면 캡처는 오프스크린).

## 1. 먼저 확인: "스마트메시"가 무엇인가
사용자가 말한 "스마트메시"의 후보를 전부 확인해 첫 절에 적는다(이름·제작사·무엇을 하는지·무료 여부·우리 단계 중 어디에 쓰는지).
- Tripo "Smart Retopology"/"Smart Remesh"(생성 메시의 쿼드 리토폴로지·감폴리) — **생성 메시 자체는 폐기 결정(11-05 09:30)이지만, 리토폴로지 기능 단독은 스캔·스컬프트 메시에 쓸 수 있는지** 확인.
- Meshy "Remesh"/"Retopology" 기능 — 같은 질문.
- Blender 내장: Remesh(Voxel·Quadriflow), Decimate, Shrinkwrap, Smart UV Project, Data Transfer, Multires 베이크.
- 전용 리토폴로지: Quad Remesher(Exoside, 유료·체험판), Instant Meshes(무료·오픈소스), ZRemesher(ZBrush, 유료), RetopoFlow(Blender 애드온, 유료/무료판).
- Unity 쪽: Mesh LOD 생성(Unity 6 Mesh LOD, Simplygon 무료 티어, AutoLOD), Polybrush·ProBuilder.
- 그 밖에 "SmartMesh"라는 이름의 도구가 따로 있으면 그것도.

## 2. 배울 단계와 도구 (자산 파이프라인 순서)
각 단계마다: ① 공식 문서·강좌 2개 이상(출처 URL) ② 우리 용도의 설정값 ③ **같은 입력으로 전·후 실물 비교 1장** ④ 실패했을 때의 대안 도구.

| 단계 | 도구(1순위 / 대안) | 배울 것 | 실물 증거 |
|---|---|---|---|
| 스컬프트·블록아웃 | Blender Sculpt(Dyntopo·Voxel Remesh) / — | 브러시 순서, 디테일 레벨 단계, 대칭·마스크 | 고목 밑동 블록아웃 1개 |
| 리토폴로지(고→저폴리) | Quad Remesher 체험판 또는 Instant Meshes / Blender Quadriflow, Tripo·Meshy Retopo | 목표 면 수, 엣지 흐름(실루엣 따라), 하드 엣지 보존 | 스캔 고목 50만△ → 8k△ 전·후 와이어 |
| UV | Blender UV(Seam 수동 + Minimize Stretch) / Smart UV Project, UVPackmaster(유료) | 심 위치, 텍셀 밀도 균일화, 패킹 효율, 트림/타일 분리 | UV 레이아웃 + 텍셀 밀도 체커 1장 |
| 베이크(고→저) | Blender Cycles 베이크(Normal·AO·Curvature·Height) / Substance Painter 베이커(승인 시), Marmoset(유료) | 케이지·레이 거리, 노멀 공간(OpenGL/DirectX, Unity는 OpenGL), 아티팩트 제거 | 노멀맵 켜고/끄고 2장 |
| 텍스처·재질 | Substance Painter(승인 시) / Blender 텍스처 페인트 + 스캔 재질(Megascans) | PBR 값 범위(러프니스·메탈릭·알베도 휘도), 마스크 맵 패킹(Unity URP MetallicSmoothness·Mask) | 같은 메시 재질 전·후 |
| LOD·임포스터 | Blender Decimate(Planar/Collapse) / Unity Mesh LOD, Simplygon 무료 | LOD 단계 비율(100/50/25/10%), 전환 거리, 실루엣 유지 | LOD0~3 나란히 + 34° 거리별 |
| Unity 반입 | Unity FBX/glTF 임포트 설정 | 스케일 단위, 노멀·탄젠트 계산, 메시 압축, Read/Write, 텍스처 압축(BC7/ASTC)·sRGB·밉맵, LOD Group | 반입 전·후 1-1 장면 캡처 |
| 접지·배치 | Unity 지형 블렌드·데칼, PropClusterBrush(c-1) | 루트 플레어·이끼 전이·그림자 접지 | 접지 전·후 |

## 3. 손에 익히는 과제 (Mac, Blender 설치 승인 뒤)
입력 1개(AT 레인이 받은 Poly Haven 고목 또는 Book of the Dead 고목)로 위 표를 **끝까지 한 번** 돌린다: 스캔/원본 → 리토폴로지 8k△ → UV → 베이크 → 재질 → LOD 3단 → Unity 1-1 반입 → 34° 캡처. 각 단계 전·후 이미지와 설정값을 남긴다. 이것이 "도구를 쓸 줄 안다"의 증거다. 품질 판정은 Mac·독립 검수·사용자.

## 4. 산출물
- `docs/0마스터플랜/MANUAL/TOOL_MASTERY_20261105.md` — §1 스마트메시 확인, §2 단계별 절차서(설정값·출처·대안), §3 손에 익힌 과제 결과(이미지 경로·설정·소요 시간·실패 기록).
- `docs/0마스터플랜/MANUAL/img/tm-<단계>-{before,after}.png`.
- 브랜치: 조사(클라우드) `claude/unity-cloud-tool-mastery-20261105`, 실습(Mac) `claude/unity-mac-tool-mastery-20261105`. 매뉴얼 01·15의 도구 표는 이 결과로 갱신한다.

## 5. 합격·중단
- 합격: §1 확인 + §2 8단계 전부 출처·설정값 채움 + §3 과제 1개 끝까지 통과(전·후 이미지 8쌍).
- 중단: Blender 미설치(승인 대기), 체험판 로그인 필요(사용자), 같은 단계 2회 실패 → 대안 도구로 바꾸고 기록.
