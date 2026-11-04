# 브리프 AT — 실제 에셋을 손에 쥐고 분해한다 (합법 공개 자산, 2026-11-05)

사용자 지시(11-05 09:05 KST): "실제 에셋을 손에 쥐고 분해하는 것(합법), 이걸 해봐." / 09:20 "공개한 거나 데이터가 어딘가에는 있을 거 아니냐, AAA 에셋들." 배경: [DIRECTION_RESET_20261105](../../DIRECTION_RESET_20261105.md) — 레퍼런스 게임 파일 추출은 금지, 대신 같은 급의 공식 공개 자산을 분해해 제작 관례와 수치를 배운다. 결과는 매뉴얼 01(지형·소품)·15(성능 예산)와 첫 자산(1-1 거대 고목) 브리프의 합격 조건에 쓴다.

## 0. 금지·범위
- 상용 게임 파일 추출·언패킹·프레임 캡처(RenderDoc/PIX) 금지. 디아블로4·PoE2·황천 파일은 열지 않는다.
- **라이선스를 먼저 읽고 문서에 URL을 적는다.** 분해(열어서 측정)는 모든 공식 공개 자산에서 허용되지만, **게임 반입 가능 여부는 라이선스별로 다르다**(아래 표 "반입"). 로그인이 필요한 곳(Unity Asset Store, Fab/Quixel, Sketchfab)은 **사용자가 직접 로그인**해 내려받아 넘겨준 파일만 쓴다. 대리 로그인·계정 생성 금지.
- 내려받은 자산은 **연구용**이다. 반입은 별도 결정이고, 반입 가능 라이선스라도 "그대로 쓰기"가 아니라 관례를 배우는 것이 목적이다. 저장 위치는 Git 밖(`~/EXODUSER-Storage/asset-teardown/<출처>/<자산>/`), Git에는 측정표·이미지만 올린다.
- 무창·무음. Blender는 `--background` 스크립트로만. 결과 이미지·폴더를 사용자 화면에 자동으로 열지 않는다.
- 유료 지출 0.

## 1. 대상 — AAA급 공식 공개 자산 (1차, 우선순위 순)

| 순위 | 자산 | 왜 이것인가 | 받는 법 | 라이선스 / 반입 |
|---|---|---|---|---|
| **1** | **Unity "Book of the Dead: Environment"** (Unity Technologies, 포토그래메트리 어두운 숲, 거대 고목·쓰러진 나무·바위·이끼) | 우리 1-1(늪·고목 숲)과 장르·톤이 가장 가깝다. Unity 자체 데모라 HDRP 설정·LOD·텍셀 밀도·채널 패킹을 그대로 볼 수 있다 | Unity Asset Store(사용자 Unity 로그인 → 내려받아 전달) 또는 GitHub `Unity-Technologies` 공개 저장소 | Unity Asset Store EULA(Unity 프로젝트 사용 허용). 반입: **가능**(단 관례 학습이 목적) |
| **2** | **Unity "Fontainebleau Demo"** (포토그래메트리 숲, 나무·바위·낙엽 바닥, HDRP) | 숲 바닥·나무 밑동·접지 관례. GitHub라 로그인 없이 받을 수 있다 | `github.com/Unity-Technologies/FontainebleauDemo` (Git LFS, 수 GB) | 저장소 LICENSE 확인(Unity Companion License 계열). 반입: 라이선스 확인 뒤 |
| **3** | **Quixel Megascans** (Fab, 포토스캔 나무 줄기·바위·이끼·낙엽) — AAA 다수가 쓰는 그 소스 | 디아4·PoE2급 스튜디오가 실제로 쓰는 스캔 자산. 삼각형·LOD·텍셀 밀도의 업계 기준값 | Fab(Epic 로그인 → 사용자). 무료 항목과 월간 무료 자산 | Fab Standard License(엔진 무관 사용 허용 항목만). 반입: 항목별 확인 |
| 4 | **Unreal Engine 공식 샘플** — "Valley of the Ancient", "Electric Dreams", "City Sample", Megascans Trees 팩 | Nanite 전제 고폴리 자산이라 **상한 비교용**(우리 Unity 예산과 다름). 조명·안개 구성(UE 비교 실험 K1 재료) | Epic Games Launcher(사용자) | UE EULA(**UE 안에서만 사용**). 반입: **불가**, 분해 학습만 |
| 5 | Poly Haven 모델(nature: dead tree·tree trunk·rock·log) | 로그인 불필요, CC0, 품질 중상. 1~3이 늦어질 때 즉시 시작용 | polyhaven.com | CC0. 반입: 가능 |
| 6 | ambientCG Model / Sketchfab CC0(박물관 스캔) | 보조 | 웹 / Sketchfab 로그인(사용자) | CC0 |

- **시작 순서:** 로그인 없이 되는 2(Fontainebleau)·5(Poly Haven)부터 오늘 시작한다. 1(Book of the Dead)과 3(Megascans)은 사용자가 Mac에서 로그인해 내려받아 `~/EXODUSER-Storage/asset-teardown/incoming/`에 두면 이어서 분해한다. 4는 UE 비교 실험을 하기로 결정되면 그때.
- 우리 쪽 비교 대상(unity/main): 1-1 거대 고목(거목각 19,888△), Hollow(26,876△), 전경 로그(45,719△), 늪가 바위, 남→북 다리. 경로는 `unity/Assets`에서 `grep -ril "hollow\|log\|rock\|tree" --include=*.fbx --include=*.prefab`로 찾아 표에 적는다. 못 찾으면 "미확인".

## 2. 측정 항목 (자산마다 같은 표)
Blender 4.x `--background --python teardown.py -- <파일>`로 자동 측정하고, 사람이 보는 이미지 4장을 뽑는다.

| # | 항목 | 어떻게 | 왜 |
|---|---|---|---|
| M1 | 삼각형 수(LOD별), 정점 수, 오브젝트·머티리얼 수 | bpy 통계 | 우리 상한(큰 소품 6~12k) 검증 |
| M2 | 바운딩 크기(m), 원점(피벗) 위치(바닥 중앙인지) | bpy | 접지·배치 관례 |
| M3 | 폴리곤 밀도 분포 | 면적당 삼각형, 상/중/하 1/3 구간별 비율 | 어디에 폴리곤을 쓰는지(실루엣 vs 평면) |
| M4 | UV: 아일랜드 수, 겹침 유무, 타일링/트림 여부, 0~1 사용률 | bpy UV 통계 + UV 레이아웃 이미지 | 텍스처 효율 관례 |
| M5 | 텍셀 밀도(px/m) | 텍스처 해상도 ÷ UV 월드 면적 | 우리 2.4GB 텍스처 문제의 기준 |
| M6 | 텍스처 채널 구성·해상도·포맷 | 파일 목록(albedo/normal/rough/AO/disp/opacity/mask map) | 채널 패킹 관례 |
| M7 | 노멀맵이 담당하는 디테일 vs 지오메트리 디테일 | 노멀맵 끄고/켜고 2장 | 어디까지 조형, 어디부터 맵인지 |
| M8 | 실루엣 | 우리 카메라 각(피치 34°, 거리 16.5u 상당)에서 단색 렌더 1장 | 1-1 카메라에서 읽히는 형태 |
| M9 | 가장자리·접지 처리 | 바닥 접점 확대 1장(루트 플레어, 데칼, 이끼 전이), LOD 전환 거리·임포스터 유무 | 접지·LOD 관례 |
| M10 | 우리 자산 같은 항목 | M1~M9를 우리 소품에 동일 적용 | **차이표**가 결과물 |

Unity 데모(1·2)는 추가로: HDRP/URP 머티리얼 설정, LOD Group 거리, 텍스처 임포트 설정(압축·밉맵·sRGB), Mesh 임포트(Read/Write·압축), 라이트 베이크·프로브 배치, 안개·볼륨 설정을 **그대로 표로 옮긴다**. 이것이 "제작 방식"의 실물이다.

이미지 4장(자산당): ① 와이어프레임 34° ② UV 레이아웃 ③ 채널 시트(albedo/normal/rough/AO 나란히) ④ 실루엣 34°. 전부 1x PNG, 점·블러 보정 없음.

## 3. 산출물
- `docs/0마스터플랜/ASSET_TEARDOWN/TEARDOWN_20261105.md` — 자산별 측정표 + **우리 자산 대비 차이표** + Unity 데모 설정표 + "그래서 우리 상한·절차를 이렇게 고친다" 5줄 이내 + 라이선스·출처 URL.
- `docs/0마스터플랜/ASSET_TEARDOWN/img/<자산>-{wire,uv,channels,silhouette}.png` 와 우리 자산 같은 세트.
- `tools/teardown/teardown.py`(Blender 스크립트, 재사용 가능) — 입력 파일 → JSON 측정값.
- 브랜치 `claude/unity-mac-asset-teardown-20261105`, 비강제 push, 끝나면 SHA·자산 수·차이표 핵심 3줄을 CTO 세션에 회신.

## 4. 합격·중단
- 합격: 공개 자산 3개 이상(그중 Unity 데모 1개 이상) + 우리 자산 2개 이상에 M1~M9가 전부 채워지고, 차이표에서 우리 상한(삼각형·텍셀 밀도·채널·LOD 거리)을 숫자로 수정 제안할 수 있을 때.
- 중단: Blender가 Mac에 없고 설치를 사용자가 승인하지 않을 때(설치는 blender.org 또는 `brew install --cask blender`, 사용자 승인 필요) / 1~6 중 하나도 못 받을 때 → 보고하고 멈춘다. 같은 측정이 두 번 실패하면 방법을 바꾸고 보고. 디스크: Fontainebleau·Book of the Dead는 수 GB이므로 Git 밖 저장소 여유를 먼저 확인한다.

## 5. 이 레인이 답해야 하는 질문
1. 같은 급 고목은 삼각형 몇 개로, 어디에 폴리곤을 쓰고, 무엇을 노멀맵에 맡기나.
2. 텍셀 밀도와 채널 구성은 얼마이고, 우리 자산은 그 몇 배인가.
3. 피벗·접지·LOD 거리·임포트 설정 관례는 무엇이고, 우리 자산은 무엇이 다른가.
4. Unity 데모의 조명·안개·프로브 구성은 어떻게 돼 있고, 우리 1-1과 무엇이 다른가.
5. 그래서 매뉴얼 01·02·15의 상한과 첫 고목 브리프의 합격 조건에 어떤 숫자를 쓰나.

## 6. 사용자가 해 줄 것 (로그인 필요 자산)
- Unity Asset Store에서 "Book of the Dead: Environment" 내려받기(무료, Unity 계정).
- Fab에서 Megascans 무료 나무 줄기·바위 2~3개 내려받기(Epic 계정).
- 받은 파일을 Mac `~/EXODUSER-Storage/asset-teardown/incoming/`에 두고 "넣었다" 한 줄. 그 전까지 레인은 Fontainebleau·Poly Haven으로 진행한다.
