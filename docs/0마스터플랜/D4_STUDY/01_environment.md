# D4 조사 01 — 환경 아트·조명·색: 어떻게 만드는가 (2026-11-05)

- 배정: 클라우드 CTO, 레인 D4(조사·문서만). 사용자 지시: "디아블로4를 좀 배워 보자", "어떤 식으로 만드는지 배우라", "어떤 도구로 어떤 방식으로 만들지 정확하게 정하라."
- 범위(CTO 11-05 조정): **환경 아트·조명·색 + 한 화면 품질을 만드는 제작 순서**만. HUD·UI, 카메라·가림·전투 가독성, 보스·VFX·애니메이션은 다른 레인 3개(`D4_STUDY/02~04`)가 맡는다. 이 레인의 첫 초안(`0f05284`, 옛 이름 `D4_STUDY_20261105.md`)에 있던 가림·HUD·보스 절은 커밋 이력에서 그 레인들이 참고할 수 있다.
- 배경(사용자 평가 11-04): 맵이 "붕 뜨고, 안 맞고, 듬성듬성, 색이 구리다."
- 전제: 카메라 LOCK(1-1 원근, ForestA2 피치 34°, 먼 적이 보여야 함). 2.5D: 3D 지형·소품 + 리깅 3D 실시간 픽셀 렌더. 맵 시각 기준 [UNITY_MAP_ART_BIBLE](../../4.1맵디자인+설정/UNITY_MAP_ART_BIBLE_20261026.md)(팔레트·명도 V1~V6·재질표). UI 톤 [실버 헬](../../3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md)은 이 문서 범위가 아니다. Core 수치·판정은 건드리지 않는다.
- 이 문서는 조사·제안이다. 코드는 바꾸지 않았다.

## 읽는 법 — 확인 수준

| 표시 | 뜻 |
|---|---|
| **사실** | 서로 독립된 공개 출처 2개 이상이 같은 내용을 말한다 |
| **단일** | 1차 출처(Blizzard·개발자 본인·GDC 설명문) 1개만 있다. 사실로 쓰지 않고 근거로만 쓴다 |
| **추정** | 출처 없이 출시 화면 관찰이나 일반 원리에서 끌어낸 것 |

- 출처는 GDC 세션 설명문, Blizzard 공식 글, 개발자 본인의 ArtStation·인터뷰, 언론 보도만 썼다. 게임 파일 분석과 프레임 캡처 도구는 쓰지 않았다.
- **자료 한계:** 이 세션은 `news.blizzard.com`·`schedule.gdconf.com`·`purediablo.com` 접속이 막혀 원문을 직접 열지 못했다. 인용은 검색 엔진이 돌려준 원문 발췌로 확인했다. GDC Vault 영상(회원 전용)은 보지 못했다. Mac Chrome에서 원문을 대조하면 확인 수준을 올린다(§9).
- 표의 숫자 중 D4 출처가 붙지 않은 것은 **우리 제안값**이다.

---

## 0. 결론 — D4 환경은 이렇게 만든다, 우리는 이렇게 따라 한다

| 단계 | D4가 한 방법 | 확인 | 우리 Unity 6000.6 URP에서 같은 일 | 우선 |
|---|---|---|---|---|
| ① 필러 | 사전 제작 단계에서 필러를 정하고 "콘셉트·장소·구현"을 모두 필러로 걸렀다 | 사실 | 기존 결정 3개를 필러로 쓴다(§6) | P0 |
| ② 문화 키트·타일셋 | 장소마다 "culture kit"(문화별 건축·소품 묶음), 던전은 재사용 "tile set" + 테마 레이어(소품·상호작용물·조명 교체) | 사실 | 1-1 "썩은 숲 키트": 프리팹 묶음 + 테마 레이어 ScriptableObject | P1 |
| ③ 조각 | 건축 에셋 95%를 ZBrush로 조각, 조각 스타일을 좁게 강제하지 않음 | 단일 | Blender 조각(또는 Meshy·Tripo 기본형 → Blender 다듬기) → FBX | P1 |
| ④ 재질 | 재질은 Substance 3D Designer(지형 세트·반복 타일), 일부 Painter·Houdini | 사실 | 지형 타일 4종 + 소품 재질. 도구는 §8 | P1 |
| ⑤ 지형 블렌드 | 지형 셰이더가 여러 반복 텍스처를 섞고, 면 방향으로 섞고(눈 덮인 바위), 칠한 마스크로 노이즈 층을 더한다 | 단일(Blizzard 그래픽 글) | URP Terrain Lit의 높이 기반 블렌드 + Shader Graph 방향 블렌드 소품 재질 | P0 |
| ⑥ 식생 비중 | "다른 3D 에셋보다 식생에 훨씬 많이 기댄다"(Old Masters 영향) | 단일 | 1-1 숲: 덤불·풀·뿌리 카드 무리로 빈 바닥을 채운다 | P0 |
| ⑦ 데칼·물 | 물(기슭·고이는 웅덩이·눈 덮인 바위·강·얼음 동굴)은 셰이더 기법으로, 고정 카메라라 거슬리는 하이라이트를 피함. 재질 아티스트가 데칼·세트 드레싱도 맡음 | 단일+단일 | URP Decal Renderer Feature, 늪 기슭 젖음 띠는 지형 레이어 + 데칼 | P0 |
| ⑧ 레벨 아트 | 블록아웃 → 출시 품질까지 단계 과정(메네스타드 마을 한 곳을 예로) | 사실(세션 설명 + 발표자 게시글) | 1-1 키샷 구역 한 곳을 같은 단계로 끝까지 다듬는다(§6) | P0 |
| ⑨ 조명 | PBR, 실제 물리 기반 조명, 정적 지오메트리 그림자는 미리 계산 + 동적 물체는 위에 얹음, HDR로 "그림자 속 완전한 검정" | 사실(그림자 미리 계산: Blizzard 글 + PC Gamer "구운 조명") | Mixed 조명: 정적 부분 베이크 + APV, 동적은 실시간 그림자(§5) | P1 |
| ⑩ 대기 | 볼륨 렌더링: 공기 중 입자가 빛을 받고 카메라로 가며 산란·흡수. 지역마다 다른 안개 | 사실(Blizzard 글 + 분기 업데이트) | 기존 `HellFogFeature` + 빛줄기만 볼륨(§5.3) | P0 |
| ⑪ 색 | 조명 담당이 "조명·날씨·색 보정"을 함께 맡는 구조 | 단일(채용 공고) | URP Volume: Tonemapping → 색 보정 → LUT를 조명 담당 1명이 소유 | P1 |
| ⑫ 필러 기반 다듬기 | 초기 디자인 다수를 버리고 다시 함, 서로의 결과 위에 쌓는 "plussing" | 단일(Mueller) | 같은 키샷 위에서 "남길 것/더할 것" 기록 | P0 |

**바로 할 5가지(1~2일 크기):** ① 키샷 구역 고정(§6) ② 접지 3종 세트(§3.3) ③ 소품 군집 규칙(§3.2) ④ 안개 색 결정(§5.3, 충돌 보고) ⑤ 지형 높이 블렌드 켜기와 레이어 4종 정리(§2).

---

## 1. 필러와 레퍼런스 — 무엇을 거르는가

| 항목 | 내용 | 확인 |
|---|---|---|
| D4 필러 | "Return to Darkness"(어둡고 거친 고딕 중세), "Old Masters"(렘브란트 등 옛 거장의 명암·색), 보도에 따라 "Embrace the Legacy"까지 3개 | 사실(2022-03 분기 업데이트 + GDC 2024 Mueller 세션 보도 + 2019 아트북 유출 보도) |
| 레퍼런스 화가 | 렘브란트, 레핀(아트북), 카라바조(2023 인터뷰), 조명 담당 Sean Murphy: 렘브란트·레밍턴의 밤 그림, 토널리스트 조지 이네스("아주 회색조") | 렘브란트는 사실, 나머지는 단일 |
| 방향 | 사실감보다 "믿을 만함", 시리즈에서 가장 어둡고 땅에 붙은 세계 | 단일(2022-03) |
| 왜 | 어두운 바탕이 있어야 빛·피·위험 색이 의미를 가진다. 토널리스트처럼 회색조 바탕에 좁은 색역을 쓰면 화면이 통일된다 | 추정 |
| 우리 적용 | 1-1 레퍼런스 보드에 "옛 거장 명암" 한 칸을 둔다. 어두운 바탕 + 빛 웅덩이 2~4곳 + 그 사이 그늘(아트 바이블 L-5·V2와 같은 방향). 그림 반입 없이 명도 구조만 적는다(4.1 레퍼런스 에셋 반입 금지) | 제안 |

---

## 2. 지면 재질 — 만드는 방법

### 2.1 D4가 하는 것

- 지형 셰이더가 "여러 반복 텍스처를 복잡하게 섞어 자연스러운 바닥"을 만든다. 면 방향으로 섞는 셰이더(위를 향한 바위 면에만 눈)가 있고, 아티스트가 노이즈 층 마스크를 칠하고 시간에 따라 움직일 수 있다. — 단일(Blizzard "Peeling Back the Varnish", 2023-06)
- 재질은 Substance 3D Designer로 만든다. 지형 텍스처 세트와 지역별 반복 타일이 재질 아티스트의 주 업무다. 확장팩 재질은 Designer·Painter·Houdini를 쓰고, 지형·에셋 재질·데칼·세트 드레싱을 함께 맡았다. — 사실(Eric Wiley ArtStation + Rachel Bews 80.lv 보도. 둘 다 Designer)
- 물: 기슭, 고이는 웅덩이, 눈 덮인 바위, 강, 얼음 동굴을 픽셀·버텍스 셰이더 기법으로 만든다. 디퍼드 렌더 물의 장단점과 "고정 카메라 각도라 눈에 거슬리는 하이라이트 피하기"를 다룬다. — 단일(GDC 2024 TA Summit 설명문)

### 2.2 우리 현재

- Unity Terrain과 TerrainLayer를 쓴다(필드 조립 코드의 `ForestFloor`·`ForestSoil` 레이어, CHANGELOG 11-04 fix7).
- 아트 바이블 §6 재질표와 "재질 경계는 높이 기반 블렌딩, 직선 경계 금지" 규칙이 있다.
- 사용자 평가 "색이 구리다"는 바닥 레이어 수가 적고 명도 리듬이 약한 것과 관계가 있을 것이다(추정, 11-04 캡처로 실측 필요).

### 2.3 제작 단계 (우리판)

| 단계 | 작업 | Unity URP에서 쓰는 기능 | 합격 기준 |
|---|---|---|---|
| G-1 레이어 설계 | 4층 정의: 기본 흙 / 이끼·낙엽 / 젖은 진흙(늪 기슭) / 뿌리·잔해 | 표로만 정한다 | 아트 바이블 §3 색 범위 안 |
| G-2 타일 제작 | 층마다 2048² 반복 타일 1장. 색(BaseColor)·노멀·마스크맵(R 금속 0, G AO, B 높이, A 매끄러움) | TerrainLayer 에셋(Diffuse·Normal·Mask Map) | 4×4 반복을 1x로 봤을 때 같은 무늬가 눈에 띄지 않음 |
| G-3 높이 블렌드 | 층 경계를 높이맵으로 섞는다(돌 사이로 흙이 스미는 모양) | Terrain Lit 머티리얼 "Enable Height-based Blend"(레이어 4개 이하일 때). 레이어별 Height Transition 값 | 1x 크롭에서 직선 경계 0 |
| G-4 마스크 칠하기 | 저주파(5~8u 덩어리)로 손 칠하고, 고주파는 타일 높이맵이 맡는다 | Terrain 도구 Paint Texture. 조립이 코드로 되는 부분은 알파맵 PNG를 반입해 `TerrainData.SetAlphamaps` | 한 화면 안에 층 4개가 모두 보이고, 한 층이 화면의 60%를 넘지 않음 |
| G-5 반복 깨기 | 같은 타일이 1화면에 3번 이상 같은 모양으로 보이지 않게 한다 | 지형 셰이더에 저주파 색 변조(월드 좌표 노이즈 ×0.92~1.08 밝기), 필요하면 Shader Graph 커스텀 지형 셰이더 | 3x 크롭에서 점·잡티 0(4.2-7) |
| G-6 젖음 띠 | 늪 기슭 1.5u: 매끄러움 0.15→0.6, 명도 −10% | 젖은 진흙 레이어 + 기슭 데칼(§3.3) | 34° 카메라에서 띠가 번쩍이지 않음(스페큘러 상한) — D4 물 세션의 하이라이트 회피와 같은 이유 |
| G-7 소품 면 방향 블렌드 | 바위·쓰러진 고목 윗면에만 이끼(법선 Y > 0.7) | Shader Graph: Normal Vector(World).y → Smoothstep → Lerp(기본 재질, 이끼 재질) | 이끼가 옆면으로 흘러내리지 않음 |

---

## 3. 소품·식생·접지 — 만드는 방법

### 3.1 D4가 하는 것

- **문화 키트**: "환경의 많은 부분이 우리가 culture kit라고 부르는 것에서 나온다"(조명 담당 Sean Murphy, BlizzCon 2019 패널, Gamasutra 보도). — 단일
- **타일셋 + 테마 레이어**: 던전은 재사용 타일셋을 서로 다른 소품·상호작용물·조명과 짝지어 만든다. "모두 타일셋으로 쪼갠다"(부아트디렉터 Brian Fletcher). 테마 레이어를 바꿔 같은 타일셋이 "악마로 가득한 드루이드 쉼터"도 되고 "빈 어두운 동굴"도 된다. 두 타일셋을 잇는 전환 장면이 있다. 손으로 만든 것과 절차 생성을 섞었다. — 사실(2022-03 분기 업데이트 + Gematsu·Niche Gamer 보도 + 프로듀서 Ash Sweetring 인터뷰)
- **식생 비중**: "다른 어떤 3D 에셋보다 식생에 훨씬 많이 기댄다"(Old Masters 영향). 건축 에셋 95%는 ZBrush 조각. — 단일(Sam Gao ArtStation, GDC 2024 발표 정리)
- **밀도**: "구운 조명 + 시각적으로 빽빽한 환경"이 D4의 기본 인상이다. — 단일(PC Gamer)
- 길은 비우고 길가를 소품 무리로 채운다. — 추정(출시 화면 관찰)

### 3.2 소품 군집 — 제작 단계

1-1은 웹 좌표 그대로 소품을 얹는 규칙(CLAUDE.md "맵")이라 **웹 소품의 좌표·종류는 바꾸지 않는다.** 바꾸는 것은 그 둘레의 "곁가지"(작은 잔해·풀·뿌리·데칼)다.

| 단계 | 작업 | Unity에서 | 합격 기준 |
|---|---|---|---|
| P-1 키트 목록 | 썩은 숲 키트: 큰 것(웹 원화 소품, 고목) / 중간(그루터기·바위·버섯 무리) / 작은 것(뿌리 조각·뼈·가지·낙엽 더미) / 카드(풀·덤불) | 프리팹 폴더 + `ForestKit` ScriptableObject(크기 등급·최소 간격·접지 데칼 지정) | 등급마다 변형 3개 이상 |
| P-2 무리 규칙 | 웹 소품 하나 = 무리의 "큰 것". 둘레 2~4u에 중간 2~3 + 작은 것 5~8 + 카드 6~12 | 에디터 전용 결정적 배치 스크립트(시드 고정, Poisson 원판 간격) → 결과를 씬 프리팹으로 굳힌다(런타임 무작위 아님) | 걷기 칸 덮임 0, NavMesh 차이 0(맵 보드 RM-1 기준 유지) |
| P-3 무리 잇기 | 무리 사이 빈 바닥을 낙엽·잔가지 데칼 띠로 잇는다 | URP 데칼 + Splines 패키지로 띠 경로 | 1080p 한 장에 무리 4~7개, 소품·데칼 0인 바닥 ≤ 35% |
| P-4 길 비우기 | 다리·통로는 비운다 | 배치 스크립트가 걷기 경로 마스크를 읽어 제외 | 영웅 길 위 소품 0 |
| P-5 테마 레이어 | 같은 키트에 1-1 / 1-2~1-4 테마(색·이끼량·조명)를 갈아 끼운다(D4 테마 레이어 방식) | ScriptableObject 테마: 재질 변형·데칼 세트·라이트 프리셋 | 1-1 판정 PASS 뒤에만 다른 구역으로 넓힌다 |

### 3.3 접지 — 제작 단계

D4 쪽 근거는 정적 그림자 미리 계산(§5.1)과 지형 블렌드(§2.1)다. 접촉 그늘 데칼을 쓴다는 D4 공개 자료는 찾지 못했다(추정: 업계 공통 관례). DF 분석은 "카메라가 멀고 화면이 자주 어두워 SSAO 효과가 잘 안 보인다"고 했다 → SSAO만으로는 접지가 되지 않는다(단일).

| 단계 | 작업 | Unity에서 | 합격 기준 |
|---|---|---|---|
| A-1 접촉 그늘 | 세로 소품마다 밑동 아래 그늘 데칼(지름 = 밑동 ×1.6, 중심 알파 .55 → 가장자리 0) | URP Decal Renderer Feature(DBuffer 기법), Decal Projector를 키트 프리팹에 포함 | 1x에서 소품이 뜨지 않음 |
| A-2 쌓임 | 밑동 한쪽 120° 범위에 흙·낙엽이 쌓인 데칼 | 같은 기능, 데칼 아틀라스 1장(2048², 8칸) | 가장자리 알파 페이드(아트 바이블 금지 5) |
| A-3 하단 블렌드 | 메시 하단 20%를 바닥 재질과 섞는다(아트 바이블 §6 기존 규칙) | Shader Graph: 오브젝트 공간 높이 → 지형 재질 쪽으로 Lerp. 지형 색을 쓰려면 같은 타일 텍스처를 월드 좌표로 샘플 | 경계선 0 |
| A-4 AO | 기존 `HellSsaoFeature`(URP SSAO 상속)는 보조로 둔다 | 기존 | A-1~A-3 없이 SSAO만으로 PASS 주지 않음 |

---

## 4. 색 — 만드는 방법

| 항목 | 내용 | 확인 |
|---|---|---|
| D4 | HDR로 어두운 던전 조명을 충실히 내고, 그림자 안에 완전한 검정 영역을 둔다. 색 보정은 조명 담당 업무 | HDR·검정: 단일(Blizzard 그래픽 글). 색 보정 소유: 단일(채용 공고) |
| D4 | 토널리스트(회색조)·밤 그림 레퍼런스 → 좁은 색역 위에 빛만 색을 가진다 | 단일(Murphy) + 추정 |
| 우리 현재 | 맵 팔레트 = 아트 바이블 §3(저채도 적갈, R>G>B, R−B 8~20), 명도 V1~V6. 3D 경로에 ACES 톤매핑 + Bloom(임계 1.1)이 있다(CHANGELOG 11-04 L9) |
| 적용 | ① 바탕 채도는 아트 바이블 C1. ② **명도 리듬**: 빛 웅덩이 2~4곳, 웅덩이 중앙과 그 사이 그늘의 바닥 명도 차 ΔL ≥ 18(Rec.709 0~255). ③ 완전한 검정은 화면 가장자리·나무 그늘에만, 걷는 바닥 p5 ≥ 16(V3) — 먼 적이 사라지면 FAIL(카메라 LOCK). ④ 고채도(발광·피·위험)는 화면의 0.5% 이하(V6) | 제안 |

---

## 5. 조명·대기·후처리 — 만드는 방법

### 5.1 조명

| 항목 | 내용 | 확인 |
|---|---|---|
| D4 | PBR, 실제 물리 기반 조명. 재질마다 빛 반응 데이터를 새로 작성. 정적 지오메트리(바닥·벽) 그림자는 미리 계산하고 동적 물체(플레이어)를 그 위에 얹는다. 2024-03 레이 트레이싱 그림자·반사 추가 | 사실(Blizzard 그래픽 글 + PC Gamer) |
| D4 | 지역별 조명 성격: 해안은 안개 낀 추운 대기, 밤 마을은 안개·부드러운 그림자·반사광 | 사실(2022-03 업데이트 + GamingTrend·CBR 보도) |
| 우리 현재 | 필드 일부는 씬(`RM1_Slice`)으로 불러오고 나머지는 코드가 런타임에 조립한다(CHANGELOG 11-04 필드 조립 대기) → 런타임 조립분은 라이트맵으로 구울 수 없다 |
| 적용 | ① `RM1_Slice`의 정적 지형·큰 소품: Directional Light = Mixed, Lighting Mode = Shadowmask, Progressive GPU Lightmapper로 굽는다. ② 동적 물체·런타임 조립 소품의 간접광: Adaptive Probe Volumes(Unity 6 URP). ③ 런타임 조립분은 실시간 그림자 + 접지 3종(§3.3)으로 보충. ④ 빛 웅덩이(붉은 지옥광)는 Spot/Point 소수 광원, 한 화면 4개 이하(아트 바이블 V6과 함께). ⑤ 금속 하이라이트 중성(L-8) 유지. **확인 필요:** 런타임 조립과 베이크를 함께 쓸 수 있는 범위는 Mac에서 1회 시험 뒤 정한다 | 제안 |

### 5.2 대기 원근

| 항목 | 내용 | 확인 |
|---|---|---|
| D4 | 빛과 물체 사이의 먼지·입자를 모델링하는 볼륨 렌더링. 공기 중 입자가 빛을 받고, 빛이 카메라로 가며 산란·흡수. VFX도 환경 조명을 받는 lit 방식 | 사실(Blizzard 그래픽 글 + 2021-12 분기 업데이트) |
| D4 | 회색 안개가 짙다는 플레이어 불만이 있었다 → 안개가 너무 짙으면 반발이 온다 | 단일(포럼, 플레이어) |

### 5.3 안개 — 충돌 보고

- Unity 현재: 안개를 켜면 Exponential² 청록 `(.035,.065,.085)`, 다른 조건에서는 Linear 19→62 청록 `(.105,.145,.17)`이다(`NativeGame.HellLighting.cs` 86·91행). 그래픽 옵션에서 끌 수 있고 "안개는 적을 숨기지 않는다" 주석이 있다(`NativeGraphicsOptions.cs` 88행). `HellFogFeature` 렌더 패스가 이 안개 값을 읽는다.
- 아트 바이블 C7: 안개는 "바닥보다 약간 붉은 탁한 갈색(`#2a1a16` 근처), 파란 안개·회색 안개 금지."
- → **둘이 충돌한다. CTO 결정 대상이다.** 결정 전까지 수치는 그대로 둔다. 어느 쪽으로 정하든 같은 날 다른 쪽 문서나 코드를 맞춘다.
- 어느 쪽이든 적용할 규칙(제안): 거리 안개는 화면 위쪽 20%에서만 느껴지게 한다. 판정은 먼 적(화면 위쪽 25%)의 몸통–바닥 ΔL이 화면 아래 적 ΔL의 70% 이상일 때 PASS. 숲 지붕 틈 붉은 빛줄기(맵 보드 10-27 결정)는 1~2줄기만 볼륨으로 그린다.

### 5.4 후처리 색 보정 순서

| 순서 | URP Volume 항목 | 할 일 | 합격 기준 |
|---|---|---|---|
| 1 | Tonemapping | 현재 ACES 유지(Neutral과 비교 캡처 1회) | 검정이 뭉개져 먼 적이 사라지지 않음 |
| 2 | Color Adjustments | 노출 보정만(±0.3 안), 채도는 건드리지 않는다(채도는 재질·조명에서) | — |
| 3 | Shadows Midtones Highlights / Lift Gamma Gain | 그늘을 약한 적갈 쪽으로(C1과 같은 방향) | 바닥 p5 ≥ 16 유지 |
| 4 | Color Lookup(LUT) | 키샷 1장을 DaVinci Resolve(무료)로 보정 → 32 LUT 스트립(1024×32 PNG) → URP Color Lookup에 연결 | 키샷과 실제 게임 화면의 색이 같다 |
| 5 | Bloom | 현재 임계 1.1 유지, 강도는 발광 0.5% 규칙(V6) 안 | 흰 섬광·원판 0(L9 결함 재발 금지) |
| 6 | Vignette | 쓰지 않거나 아주 약하게 | 화면 위쪽 먼 적이 어두워지면 FAIL(카메라 LOCK) |

참고: URP는 색 보정 항목을 내부 고정 순서로 합쳐 LUT 하나로 굽는다. 위 표의 "순서"는 작업자가 손대는 순서다.

---

## 6. 한 화면 품질을 만드는 제작 순서

| 항목 | 내용 | 확인 |
|---|---|---|
| D4 | 사전 제작에서 필러·핵심 시각 언어를 정했다. 두 필러가 "콘셉트·장소·구현을 거르는 기초"였다 | 사실(2022-03 업데이트 + GDC 2024 보도) |
| D4 | 레벨 아트는 블록아웃 → 출시 품질 단계로 진행하고, 마을 한 구역을 끝까지 예로 보였다 | 사실(GDC 2024 설명문 + Fatima ArtStation) |
| D4 | 초기 갑옷·괴물 디자인 다수를 버리고 다시 했다. 서로의 디자인 위에 좋은 점을 남기고 더하는 "plussing" | 단일(Mueller) |
| D4 | UI는 시스템·흐름 먼저, 시각 마감은 뒤(2020) | 단일 |
| 우리 현재 | v4 관문 G0~G5, 데모 v0 ① 키샷. "안 맞는다"는 맵·HUD·보스를 따로 만들어 한 화면에서 처음 만난 결과일 것이다(추정) |

**우리 순서(제안):**

1. **필러 3개로 거른다**(새 결정이 아니라 기존 결정의 요약): ① 은빛 강철과 지옥의 눈(실버 헬, UI) ② 썩은 숲의 그늘과 빛 웅덩이(아트 바이블) ③ 먼 적이 보이는 원근(카메라 LOCK). 하나라도 어기는 요소는 넣지 않는다.
2. **키샷 구역 1곳 고정:** 1-1 숲길, 영웅이 고목 옆을 지나는 위치, 먼 적 3마리 이상, HUD 켬, 드루이드 아레나 입구가 화면 위쪽. 1920×1080·3840×1080.
3. **블록아웃(형태·명도만)** → 회색 재질 + 최종 조명 방향으로 명도 리듬(ΔL ≥ 18)부터 맞춘다.
4. **재질**(§2) → **소품 무리·접지**(§3) → **조명·안개**(§5.1~5.3) → **색 보정 LUT**(§5.4)를 같은 키샷에서 차례로 올린다. 단계마다 같은 위치에서 캡처한다.
5. **요소별 따로 PASS를 주지 않는다.** HUD·VFX 레인 결과를 이 키샷에 얹어 "같은 게임인가"를 본다.
6. **plussing 기록:** 다음 레인은 앞 레인 결과를 덮어쓰지 않고, 같은 키샷 위에 "남길 것/더할 것"을 적는다.
7. 키샷 구역 PASS 뒤에만 1-1 나머지 구역 → 1-2~1-4로 넓힌다(D4 테마 레이어처럼 키트는 그대로, 테마만 교체).

---

## 7. 우리 규칙과의 충돌·주의

| 항목 | 내용 | 처리 |
|---|---|---|
| 안개 색 | 코드 청록 vs 아트 바이블 C7 갈색 | CTO 결정. 결정 전 수치 변경 없음 |
| 웹 좌표 | D4식 자유 배치를 하면 "웹 좌표 그대로" 규칙과 충돌 | 웹 소품 좌표는 고정, 곁가지만 추가 |
| 런타임 조립 | 라이트맵 베이크는 런타임 조립분에 쓸 수 없음 | 베이크는 `RM1_Slice` 정적 부분만, 나머지는 APV·실시간 |
| 점 금지 | 노이즈 마스크·디더 블렌드가 잔점을 만들 수 있음 | 3x 크롭 점 0 검수 필수(4.2-7) |
| 유료 도구 | Substance·Houdini·에셋 팩 | 사용자 승인 전에는 무료 경로로 진행(§8) |

---

## 8. 도구·방식 결정안

우리 환경: Unity 6000.6 URP(Mac M5 Pro에서 작업·판정, PC는 컴파일), Blender, 승인된 생성 도구(3D Meshy·Tripo, 영상 Kling, 이미지 생성은 작업별 선택), 유료 에셋 팩은 사용자 승인 뒤에만. 비용은 공개 가격 기준 **추정**이며, 결제는 사용자가 직접 한다. 유료 항목은 승인 전에 진행하지 않는다.

| 단계 | (a) D4가 쓴 도구·방식 | (b) 우리 후보(≤2) → **추천** | (c) 절차: 입력 → 작업 → 출력 형식 → Unity 반입 | (d) 합격 기준 |
|---|---|---|---|---|
| T1 키트 큰 형태(고목·바위·그루터기) | ZBrush 조각(건축 95%, 단일), 문화 키트 | Blender 조각 / Meshy·Tripo 기본형 → Blender 다듬기 → **추천: Meshy·Tripo 기본형 + Blender**(아트 바이블 E·F 형태 → Meshy 변환 흐름과 같음, 생성 비용만 듦: API 가이드 예산 안) | 콘셉트(형태 기준 이미지) → Meshy/Tripo 생성 → Blender: 리토폴로지(큰 것 6~12k 삼각형), UV, 하이→로 노멀 베이크 → FBX(Y-up, 스케일 1=1m, Apply Transform) → Unity: Scale Factor 1, Read/Write 끔, Generate Lightmap UVs(베이크 대상만), Mesh Compression 끔 | 1x에서 바위·짐승으로 안 읽힘(아트 바이블 K6), 34° 실루엣 한 장 PASS |
| T2 반복 지형 타일 4종 | Substance 3D Designer(사실) | Substance 3D Designer(유료, 구독 또는 Steam판 — 가격 확인 필요) / Blender 절차 재질 + 굽기(무료) → **추천: 우선 Blender(무료)**, 반복 티가 두 번 FAIL이면 Substance 구매 요청 | 레퍼런스 명도표 → Blender: 지오메트리 노드로 높이장(흙·돌 박힘·뿌리) 생성 → 2048² 굽기(BaseColor·Normal·Height·AO·Roughness) → 마스크맵 합성(R0·G AO·B Height·A 1−Roughness) PNG/TGA → Unity TerrainLayer: Diffuse sRGB, Normal 타입 Normal map, Mask 선형(sRGB 끔), Tile Size 4~6u, Max Size 2048, Mipmap 켬 | 4×4 반복 1x에서 무늬 반복 안 보임, 3x 점 0, `value_check` 명도가 아트 바이블 §4 범위 |
| T3 지형 블렌드 | 여러 타일 블렌드 + 방향 블렌드 + 칠한 노이즈 마스크(단일) | URP Terrain Lit 높이 블렌드 / Shader Graph 커스텀 지형 셰이더 → **추천: Terrain Lit 높이 블렌드(무료, 내장)**. 레이어 5개 이상이 필요해지면 커스텀 | 레이어 4개 연결 → Terrain 머티리얼 "Enable Height-based Blend" 켬 → Paint Texture로 저주파 칠 → 코드 조립분은 알파맵 PNG(512², 채널당 1층) 반입 | 직선 경계 0, 한 층 ≤ 60% |
| T4 데칼(그늘·쌓임·피·낙엽 띠) | 재질 아티스트가 데칼·세트 드레싱 담당(단일) | URP Decal Renderer Feature / 메시 데칼(평면 메시 + 알파) → **추천: URP Decal(DBuffer)**, 성능이 모자라면 메시 데칼 | Blender 또는 이미지 생성으로 데칼 원화 → 알파 가장자리 페이드 손 보정(점 금지 검수) → 2048² 아틀라스 PNG(sRGB, 알파 포함) → Unity: Decal 셰이더 그래프 머티리얼, Projector 깊이 0.5u, 키트 프리팹에 포함 | 가장자리 경계선 0, 3x 점 0 |
| T5 소품 군집 배치 | 타일셋 + 테마 레이어, 손 제작 + 절차 혼합(사실) | 자체 에디터 배치 스크립트(무료) / Houdini Engine for Unity(유료) → **추천: 자체 에디터 스크립트** — 규칙이 단순(무리 크기·간격·걷기 마스크)하고 결과를 씬에 굳히면 런타임 비용 0 | 입력: 웹 소품 좌표 + 걷기 경로 마스크 + `ForestKit` SO → 시드 고정 Poisson 배치 → 출력: 씬 안 프리팹 인스턴스(정적 플래그 켬) → MapLint로 걷기 칸·NavMesh 확인 | 걷기 칸 덮임 0, NavMesh 차이 0, 빈 바닥 ≤ 35%, 무리 4~7개/화면 |
| T6 식생 카드(풀·덤불·뿌리) | 식생에 크게 기댐(단일) | Blender로 카드 메시 + 이미지 생성 알파 텍스처 / 유료 식생 팩(승인 필요) → **추천: Blender 카드 + 작업별 이미지 생성** | 원화(색은 아트 바이블 §3) → 알파 정리 → Blender 카드 묶음(교차 평면 2~3장) → FBX + PNG(알파) → Unity: URP Lit Alpha Clipping 0.4, 그림자 켬, GPU Instancing 켬 | 1x에서 카드 가장자리 번쩍임 0, 3x 점 0 |
| T7 정적 조명 베이크 | 정적 그림자 미리 계산 + 동적 얹기(사실) | Progressive GPU Lightmapper + APV / 실시간만 → **추천: `RM1_Slice` 정적 부분 베이크 + APV**(무료, 내장) | Directional Mixed + Shadowmask → 정적 지형·큰 소품 Contribute GI → Lightmap 해상도 8~12 texel/u → 굽기(Mac) → APV 볼륨을 걷기 영역에 → 런타임 조립분은 APV 샘플 | 빛 웅덩이 ΔL ≥ 18, 굽기 이음매 0 |
| T8 대기·빛줄기 | 볼륨 렌더링, lit 입자(사실) | 기존 `HellFogFeature` + 빛줄기 메시(가산 알파 그라데이션) / 유료 볼륨 안개 에셋(승인 필요) → **추천: 기존 패스 + 빛줄기 메시(무료)**. 전 화면 볼륨 안개는 먼 적 가림 위험이 커서 보류 | 안개 색 결정(§5.3) → 거리 안개 시작·끝을 화면 위쪽 20%에 맞춤 → 빛줄기 1~2개, 내부에 lit 입자(VFX 레인과 조율) | 먼 적 ΔL 70% 이상 유지 |
| T9 색 보정 | 조명 담당이 조명·날씨·색 보정을 함께 맡음(단일) | URP Volume + LUT(DaVinci Resolve 무료) / Volume 항목만 → **추천: Volume + LUT**, 소유자 1명(조명 담당) | 키샷 PNG(톤매핑 전 비교용, 같은 장면) → Resolve에서 보정 → 32 LUT 스트립 PNG → Unity: Texture Import sRGB 끔, Compression 없음, Color Lookup 연결 | 키샷과 실제 화면 같은 색, 먼 적 유지 |
| T10 판정 | 블록아웃→출시 품질 단계, 한 구역 끝까지(사실) | 공용 실행기 Mac 캡처 + `value_check` 명도 측정 → **추천: 같음**(무료) | 키샷 고정 카메라 위치 → 단계마다 1920·3840 캡처 + 1x·3x 크롭 → 아트 바이블 K1~K6 + 이 문서 §2~§5 기준표 대조 | 4.2 화면 기준 전부 + "같은 게임인가" |

**비용 정리:** 추천안은 Meshy·Tripo 생성 비용(API 가이드 예산·SPEND_LOG 기록)을 빼면 모두 무료다. 유료 후보(Substance 3D Designer, Houdini Engine, 식생·볼륨 안개 에셋)는 무료안이 두 번 FAIL한 경우에만 비용표를 붙여 사용자에게 요청한다(4.2-8: 두 번 반려된 방법은 반복하지 않음).

---

## 9. 출처

| # | 자료 | 날짜 | URL | 확인 수준 |
|---|---|---|---|---|
| E1 | Gamasutra/Game Developer — BlizzCon 2019 패널(David Kim·Sean Murphy), "culture kits" | 2019-11 | https://www.gamedeveloper.com/design/designing-the-gameplay-and-aesthetic-of-i-diablo-iv-i- | 검색 발췌 |
| E2 | 2019 아트북 유출 보도 — 필러 "Old Masters"(렘브란트·레핀) | 2019 | https://www.pcgamesn.com/diablo-4/art-book-details · https://wccftech.com/diablo-4-art-book-pages-leaked/amp/ | 검색 발췌(2차) |
| E3 | Sean Murphy — 렘브란트·레밍턴·이네스 레퍼런스(Gamasutra 인터뷰 사본) | 2019 | https://dogroar.pages.dev/posts/-diablo-iv-art-style-inspired-by-some-surprising-painters-including-american-landscape-masters | 검색 발췌(사본, 원문 대조 필요) |
| E4 | Diablo IV 분기 업데이트 2021-12 (VFX lit·발광) | 2021-12 | https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021 | 검색 발췌 |
| E5 | Diablo IV 분기 업데이트 2022-03 (환경 필러·타일셋·테마 레이어·지역 조명) | 2022-03-29 | https://news.blizzard.com/en-us/article/23788294/diablo-iv-quarterly-updatemarch-2022 | 검색 발췌 + Gematsu·CBR·GamingTrend·Niche Gamer 보도 |
| E6 | Gematsu — 2022-03 업데이트 보도 | 2022-03 | https://www.gematsu.com/2022/03/diablo-iv-quarterly-update-details-environmental-art | 검색 발췌 |
| E7 | Niche Gamer — 150개 던전, 손 제작 + 절차 | 2022-03 | https://nichegamer.com/diablo-iv-has-over-150-dungeons-handcrafted-procedural/ | 검색 발췌 |
| E8 | Blizzard "Peeling Back the Varnish: The Graphics of Diablo IV" | 2023-06 | https://news.blizzard.com/en-gb/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv | 검색 발췌(원문 문장) + Wowhead·Graphics Programming Weekly 소개 |
| E9 | Digital Foundry PC 리뷰(SSAO·카메라 거리) | 2023-06 | https://www.eurogamer.net/digitalfoundry-2023-diablo-4-is-a-great-pc-port-except-you-need-a-16gb-graphics-card-to-match-ps5-quality | 검색 발췌(미러) |
| E10 | PC Gamer — 레이 트레이싱 성능, "구운 조명 + 빽빽한 환경" | 2024-03 | https://pcgamer.com/hardware/graphics-cards/diablo-4-ray-tracing-performance-test | 검색 발췌 |
| E11 | Blizzard "Hell's Beauty Burns Anew with Ray Tracing" | 2024-03 | https://news.blizzard.com/en-us/article/24077218/hells-beauty-burns-anew-with-ray-tracing | 제목만 |
| E12 | Eric Wiley — Diablo 4 Material Dump(Designer, 지형 세트·반복 타일) | 2023-07 | https://wiley3d.artstation.com/projects/rJD4RG | 검색 발췌(본인) |
| E13 | ArtStation Magazine — Diablo IV Environment Art Blast(팀 명단) | 2023-07 | https://magazine.artstation.com/2023/07/blizzard-entertainment-diablo-iv-environment-art-blast/ | 검색 발췌 |
| E14 | GDC 2024 "The Pillars of Hell"(John Mueller) | 2024-03-20 | https://schedule.gdconf.com/session/the-pillars-of-hell-achieving-the-artistic-vision-of-diablo-iv/902745 | 세션 설명 발췌 |
| E15 | GDC 2024 "The Art of Open World Sanctuary"(Fatima·Gao·Whitehead) | 2024-03-21 | https://schedule.gdconf.com/session/diablo-iv-the-art-of-open-world-sanctuary/899417 · https://gdcvault.com/play/1034222/-Diablo-IV-The-Art | 세션 설명 발췌 |
| E16 | Mahreen Fatima — GDC 2024 레벨 아트 정리(블록아웃 → 출시 품질, 메네스타드) | 2024 | https://mahreenfatima.artstation.com/projects/wred8Y | 검색 발췌(본인) |
| E17 | Sam Gao — 에셋·스타일 정리(ZBrush 95%, 식생 비중) | 2024 | https://fallbrumby.artstation.com/projects/1NQRL2 | 검색 발췌(본인) |
| E18 | GDC 2024 TA Summit "H2O in H3LL"(Aaron Aikman) | 2024-03 | https://gdcvault.com/play/1034490/Technical-Artist-Summit-H2O-in | 세션 설명 발췌 |
| E19 | 80.lv — Lord of Hatred 재질(Rachel Bews: Designer·Painter·Houdini) | 2026 | https://80.lv/articles/take-a-closer-look-at-how-materials-for-diablo-iv-lord-of-hatred-were-made | 검색 발췌(2차) |
| E20 | Blizzard 조명 인턴 채용 공고(조명·날씨·색 보정) | 미상 | https://gamejobs.co/Lighting-Artist-Intern-at-Blizzard-Entertainment | 검색 발췌 |
| E21 | Blizzard 포럼 — 회색 안개 불만 | 2023 | https://us.forums.blizzard.com/en/d4/t/any-way-to-remove-the-thick-grey-haze/6438 | 검색 발췌(플레이어) |
| E22 | Newshub — 카라바조·렘브란트 인터뷰 | 2023-06 | https://www.newshub.co.nz/home/entertainment/2023/06/from-kubrick-to-caravaggio-diablo-4-s-developers-reveal-the-secrets-of-its-jaw-dropping-art-design.html | 검색 결과 제목·발췌 |

## 10. 남은 일

| 할 일 | 담당 후보 |
|---|---|
| E1·E5·E8·E14~E18 원문을 Mac Chrome에서 열어 발췌 대조, 확인 수준 갱신 | 클라우드(원격 브라우저 Mac) |
| §5.3 안개 색 충돌 결정 → 아트 바이블 또는 코드 정정 | CTO |
| §6 키샷 구역 명세(카메라 위치·적 배치·캡처 이름) 파일 브리프 | 클라우드 설계 |
| §3.2·§3.3 키트 SO·배치 스크립트·접지 데칼 구현 | Mac 구현(Sonnet 서브에이전트 브리프) |
| §5.1 `RM1_Slice` 베이크 + APV 1회 시험(런타임 조립과 공존 범위) | Mac |
| 11-04 사용자 평가 캡처로 "명도 리듬 부족·빈 바닥 35%" 추정 실측 | Mac |

## 변경 이력

| 날짜 | 내용 | 작성 |
|---|---|---|
| 2026-11-05 | 첫 초안 `D4_STUDY_20261105.md`(6분야, `0f05284`) | 레인 D4 |
| 2026-11-05 | CTO 범위 조정: `D4_STUDY/01_environment.md`로 옮기고 환경·조명·색 + 제작 순서만 남김. 제작 방법 단계, Unity URP 대응, 사실/단일/추정 구분(사실은 출처 2개 이상), 도구·방식 결정안(§8) 추가 | 레인 D4 |
