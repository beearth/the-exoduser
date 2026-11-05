# CTO 역량 강화 프로젝트 (2026-11-05 시작)

사용자 원문(11-05 09:40~10:00): "가장 시급한 건 지금 니 역량이 별로라는 거야. 공부 좀 해야 해." / "뭐 하나 만들어도 니 역량이 높으면 뛰어나게 만들 텐데." / "그게 부족하니까 결과물이 안 좋잖아." / "니가 공부할 만한 사이트가 있냐 찾아봐라." / "CTO 역량 강화 프로젝트, md 만들고."

## 0. 인정하는 사실
- 우리 1-1 소품은 Poly Haven 자산을 decimate 한 번 걸어 넣은 것이다(전경 로그 45,719△, UV 사용률 6.7~9.9%, LOD 없음, 텍셀 밀도 1080p 미달 — AT 1차 `claude/unity-mac-asset-teardown-20261105` 1bc1d7248).
- 생성 도구(Tripo·Meshy)는 옵션을 기본값으로 돌렸다. 면 수 제한·쿼드·스마트 로우폴리·PBR 옵션을 쓴 기록이 없다.
- 셰이더·색 공간도 두 번 틀렸다(HUD sRGB 계약 불일치, static 없는 전역 const).
- 결론: 결과물이 나쁜 1차 원인은 도구가 아니라 **도구를 기본값·단일 조작으로 쓰고 다음 단계로 넘긴 CTO·구현 세션의 역량**이다.

## 1. 목표와 증거 기준
"배웠다"는 글이 아니라 실물로 증명한다.
| 역량 | 증거 | 판정 |
|---|---|---|
| 자산 파이프라인(스컬프트→리토폴로지→UV→베이크→재질→LOD→반입) | 입력 1개를 끝까지 돌린 전·후 이미지 8쌍 + 설정값 + 소요 시간 | Mac 캡처 → 독립 검수 → 사용자 |
| 도구별 옵션 숙련 | `MANUAL/TOOLS/<도구>.md` ③ 옵션 전수표 + ⑧ 실습 기록 | 기본값 사용 = 미숙련 |
| 조명·안개·색 | 같은 장면에서 프리셋 3안 비교판, 먼 적 가독성 M-FAR 수치 | 황천 기준 캡처 옆에서 판정 |
| 렌더 파이프라인 이해 | 색 공간·셰이더 상수·RT 포맷 계약을 코드 줄로 설명한 문서 | 같은 유형 사고 재발 0 |
| 판정 역량 | 레퍼런스와 같은 크기 비교판에서 결함을 사용자보다 먼저 짚은 횟수 | 사용자가 먼저 짚으면 FAIL 기록 |

## 2. 공부 출처 (검증 표시: ✅ 이번 세션 검색으로 확인 / ◻ 기억 기반, 열어서 확인 필요)
### 2.1 자산 제작 파이프라인
- ✅ Vertex School Environment Art Bootcamp — 텍셀 밀도 512px/m 고정, 모듈러, UE5 조립: https://www.vertexschool.com/pages/environment-art-bootcamp-september-2026 (유료 과정, 커리큘럼 구성만 참고)
- ✅ Pluralsight Game Environment Texturing Fundamentals — 리토폴로지·UV·베이크·페인팅 입문(2022): https://www.pluralsight.com/courses/game-environment-texturing-fundamentals
- ✅ Sketchfab "How to retopologize 3D scans into low poly game assets"(Instant Meshes 워크플로, UV 소실 → 재베이크): https://sketchfab.com/blogs/community/retopologise-3d-scans-low-poly-game-assets/
- ✅ Quad Remesher 안내(한국어, $79 영구, 소품 30~60k 쿼드 권장): https://superrendersfarm.com/ko/article/quad-remesher-blender-retopology
- ✅ 80.lv 텍셀 밀도 튜토리얼(Leonardo Iezzi 도표): https://80.lv/articles/textel-density-tutorial · Polycount 스레드(3인칭 5.12px/cm 관례): https://polycount.com/discussion/216821/texel-density
- ✅ Marmoset Toolbag 베이킹 핸드북(케이지·스큐·노멀 공간): https://marmoset.co/?p=103511 · 케이지 페인팅: https://80.lv/articles/painting-custom-cage-distances-in-marmoset-toolbag
- ✅ 3D Artists' Handbook 베이킹·텍스처 준비: https://sidney-eliot.github.io/3d-artists-handbook/texturing/baking-and-texturing-prep
- ◻ Blender 공식 매뉴얼(Remesh·Decimate·Shrinkwrap·UV·Bake): https://docs.blender.org/manual/en/latest/
- ◻ Adobe Substance 3D Painter 공식 문서(베이커·마스크 패킹): https://helpx.adobe.com/substance-3d-painter/
- ◻ Polycount Wiki(텍셀 밀도·노멀맵·하드 서피스 관례): http://wiki.polycount.com/
- ◻ Unity 매뉴얼 Model Import·Texture Import·LOD Group·Mesh LOD(Unity 6): https://docs.unity3d.com/Manual/

### 2.2 포토그래메트리 숲·Unity 환경 (우리 1-1과 같은 장르)
- ✅ 80.lv Mossy Cedrus Forest(Unity, 스캔 식생): https://80.lv/articles/learn-how-to-make-ultra-realistic-3d-scanned-environments-with-unity
- ✅ Unity Book of the Dead 환경 제작 기법(Unite Berlin 슬라이드: RealityCapture→리토폴로지→UV→베이크, 3ds Max 가지): https://de.slideshare.net/unity3d/book-of-the-dead-environmental-design-tools-and-techniques-for-photoreal-worldbuilding · 80.lv 요약: https://origin.80.lv/articles/unity-environmental-design-techniques-for-photo-real-worldbuilding/
- ✅ Unity 블로그 포토그래메트리 가이드: https://blog.unity.com/es/engine-platform/photogrammetry-real-world-objects-into-digital-assets
- ✅ Megascans로 3~4일 HDRP 숲 제작기(볼류메트릭·안개·포스트): https://farrukh.artstation.com/blog/rmAw/environment-production-with-unity-3d-and-megascans
- ✅ Unity Fontainebleau Demo(LayeredLit 스캔 재질, 저장소 LICENSE 미확인 → 측정만): https://github.com/Unity-Technologies/FontainebleauDemo

### 2.3 레퍼런스 게임 제작 강연 (무료)
- ✅ GDC 2024 "The Pillars of Hell: Achieving the Artistic Vision of Diablo IV"(John Mueller, 무료 태그): https://www.gdcvault.com/play/1034608/The-Pillars-of-Hell-Achieving
- ✅ GDC "Diablo IV: The Art of Open World Sanctuary"(Justin Whitehead, 환경 아트 기둥·레벨 아트·재질, 무료 태그): https://gdcvault.com/play/1034222/-Diablo-IV-The-Art
- ✅ Blizzard "Peeling Back the Varnish: The Graphics of Diablo IV"(물리 기반 조명): https://news.blizzard.com/en-us/article/23964183/iv
- ✅ 80.lv No Rest for the Wicked(Unity 개조, 페인팅 룩, 타임라인 시스템): https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios
- ◻ GDC Vault 무료 섹션(최근 2년 30%): https://www.gdcvault.com/free
- ◻ Dead Cells 3D→2D 파이프라인(Gamasutra/Game Developer 글), t3ssel8r 3D 픽셀 렌더(YouTube) — Mac에서 열어 확인

### 2.4 조명·안개·색 (Unity)
- ✅ Unity HDRP Volumetric Lighting 공식 문서(원리·한계): https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.5/manual/Volumetric-Lighting.html
- ✅ URP 볼류메트릭 안개 오픈소스 2종(비교용, 반입은 별도 결정): https://github.com/sinnwrig/urp-fog-volumes · https://github.com/CristianQiu/Unity-URP-Volumetric-Light
- ◻ Unity Learn 조명·포스트 프로세싱 과정: https://learn.unity.com/ · URP Render Graph 문서(우리 HellFogFeature 확장용)
- ◻ 색 공간·톤매핑 기초: Unity Linear/Gamma 문서, ACES vs Neutral

### 2.5 VFX·임팩트·동작
- ◻ Real Time VFX 커뮤니티: https://realtimevfx.com/ · Simon Schreibt 블로그(게임 아트 트릭): https://simonschreibt.de/
- ◻ Unity Shuriken·Shader Graph 공식 문서
- ◻ 동작: Blender 애니메이션 매뉴얼, 12원칙(공개 강의), 레퍼런스 영상 프레임 세기

## 3. 과정 (주차는 목표이지 마감이 아님)
| 주 | 할 것 | 산출물 |
|---|---|---|
| 1 | §2.1 전부 읽고 `MANUAL/TOOLS/` 도구별 ①~⑦ 채우기(TM 레인). 생성 도구 옵션 전수표. 디아4 GDC 2편 시청(사람 또는 Mac 자막) 요약 | TOOLS/*.md 초안, 옵션표 |
| 2 | 과제 1: Poly Haven 고목 → 리토폴로지 8k → UV → 베이크 → 재질 → LOD 3단 → 1-1 반입 → 34° 캡처(Mac). 전·후 8쌍 | ⑧ 실습 기록 채움 |
| 3 | 과제 2: Book of the Dead 고목을 우리 장면에 넣어 "자산 문제인가 렌더 문제인가" 판정. 조명·안개 프리셋 3안 실제 장면 비교판 | 원인 판정 1장 |
| 4 | 과제 3: 첫 자산(1-1 거대 고목) 관문 6개 통과 시도. 두 번 FAIL이면 방법 변경 보고 | 비교판 + SHA |

## 4. 규칙
- 도구는 매뉴얼(`MANUAL/TOOLS/`) 없이는 제작에 쓰지 않는다(DIRECTION_RESET 09:50).
- 공부 출처는 열어서 확인한 것만 ✅로 올리고, 못 연 것은 ◻로 둔다. 유료 과정은 커리큘럼만 참고하고 구매는 사용자 승인.
- 이 문서는 주 1회 갱신한다: 읽은 것, 실습한 것, FAIL 기록, 사용자가 먼저 짚은 결함 수.
