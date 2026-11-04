# GAME STUDY — Path of Exile 2 (맵·광원·안개·전투 가독성·동작)

- 작성: 2026-11-05 레인 P2(연구·문서만, 클라우드). 근거: [DIRECTION_RESET_20261105](../DIRECTION_RESET_20261105.md) 단계 2.
- 목적: PoE2가 **무엇을, 왜, 어떻게** 만들었는지 공부하고, **우리 Unity 6000.6.7f1 · URP 17.6.0** 에서 같은 결과를 내는 방법과 도구 결정안을 낸다. 복제가 아니다. PoE2의 에셋·코드·수치는 가져오지 않는다.
- 우리 게임 전제: 탑다운 원근 카메라(피치 34°, 먼 적이 보여야 함, 11-03 LOCK), 2.5D(3D 지형·소품 + 리깅 3D를 실시간 저해상도로 렌더한 픽셀풍 캐릭터), 톤 "실버 헬".
- 표기: **[사실]** = 서로 다른 공개 출처 2개 이상이 같은 내용을 말함. **[단일]** = 출처 1개(공식이어도 1개면 단일). **[추정]** = 출처를 바탕으로 한 우리의 해석. **[제안]** = 우리 게임용 수치·규칙(PoE2 값이 아님).

### 조사 방법과 한계 (먼저 읽기)

- 이 세션은 네트워크 정책 때문에 원문 페이지(pathofexile.com, YouTube, Steam, 80.lv, butwhytho.net 등)를 **직접 열 수 없었다**. 웹 검색 결과의 요약·발췌로만 확인했다. 그래서 ExileCon 2023 렌더링 발표 영상은 **보지 못했다**. 영상에서만 나오는 내용(안개·그림자 방식, 톤매핑)은 아래에서 모두 [추정] 또는 "미확인"으로 둔다.
- 게임 파일·프레임 캡처 분석은 하지 않았다(금지). 이미지 반입 0.
- 남은 확인은 §10에 있다. Mac에서 발표 영상(S02)을 1회 보고 §3·§4의 "미확인" 칸을 채우면 이 문서의 신뢰도가 크게 오른다.

---

## 0. 우리 게임에 바로 적용할 규칙 10개

수치는 모두 **[제안]**(우리 게임용 출발값)이다. 근거 칸은 그 규칙을 받치는 PoE2 쪽 사실·관찰이다. 매뉴얼 단계(DIRECTION_RESET 단계 3)에서 비교판으로 조정한다.

| # | 규칙 | 수치 (출발값) | 근거 |
|---|---|---|---|
| R1 | **광원 역할을 셋으로 나눈다:** ① 장면 키라이트(방향광 1개, 그림자 있음) ② 플레이어 빛 반경(점광원 1개, 그림자 없음, 캐릭터를 따라다님) ③ 장소 광원(횃불·화로·마법). 역할 없는 광원은 두지 않는다. | ② 반경 7~9m(화면 세로의 약 1/3), 강도는 키라이트로 밝힌 지면과 같은 밝기까지 | PoE2는 "빛 반경(Light radius)"을 캐릭터 스탯으로 두고 어두운 구역에서 캐릭터 주변을 밝힌다 [사실 S10·S11]. |
| R2 | **그림자 있는 광원 수를 화면당 제한한다.** 그림자는 키라이트와 "이야기가 있는" 장소 광원에만. | 그림자 있는 점·스폿 ≤ 4, 그림자 없는 점광원 ≤ 16(Forward+ 전제), 키라이트 그림자 거리 45m(현재 URP_PC_High 값 유지) | PoE2 0.1.1 패치가 "그림자를 많이 드리우는 아주 밝은 광원이 있는 구역의 성능"을 고쳤다 [사실 S14a·S14b] — 그림자 광원이 가장 비싼 항목. 설정 메뉴도 "그림자 + GI 품질"을 하나로 묶는다 [사실 S13a·S13b]. |
| R3 | **간접광(GI)은 반드시 있다.** 그늘이 검게 꺼지지 않게, 그늘 바닥에도 색 있는 반사광이 남게 한다. 우리는 실시간 화면 기반 GI 대신 **Adaptive Probe Volumes(APV) 굽기 + 기존 SSAO**로 낸다. | 그늘 지면 평균 밝기 ≥ 같은 화면 양지 지면의 30%, 순흑(sRGB 0~8) 면적 = 0% (UI 제외) | PoE2는 GI를 엔진 핵심 기능으로 새로 만들었다(Radiance Cascades) [사실 S01·S04·S05·S06]. 설정에서 "그림자만 / 그림자+GI"를 고를 수 있을 만큼 GI가 화면을 크게 바꾼다 [사실 S13a·S13b]. |
| R4 | **캐릭터·적은 배경보다 항상 한 단계 밝거나, 테두리 빛을 가진다.** 어두운 맵일수록 이 규칙이 우선이다. | 캐릭터 실루엣 평균 밝기 ÷ 주변 지면(반경 2m) 평균 밝기 ≥ 1.5. 못 미치면 림 라이트(셰이더) 세기 0.25~0.4 | "맵이 너무 어둡다", "빛 반경을 늘려 달라"는 불만이 공식 포럼과 기사에 반복된다 [사실 S12a·S12b]. 즉 어둠이 분위기를 넘어 가독성을 깎을 때 실패로 읽힌다. |
| R5 | **안개는 높이 안개를 기본으로 하고, 카메라 거리 안개는 약하게.** 먼 적이 지워지면 FAIL(11-03 LOCK). | 화면 위쪽 끝(가장 먼 적이 서는 거리)에서 안개 섞임 ≤ 25%. 적·캐릭터 셰이더는 안개 영향 50%만 받음 | 11-03 카메라 LOCK. PoE2 안개 방식은 영상 미확인 [추정]. 공통 관례(D4 연구와 대조)로 둔다. |
| R6 | **노출은 장면마다 고정한다(자동 노출 끔).** 톤매핑은 Neutral 또는 ACES 중 하나로 통일하고 색은 LUT 1장으로 맞춘다. | Post Exposure 장면별 고정값, Bloom 임계 ≥ 1.1(현재 값), 장면 간 평균 밝기 차 ≤ ±15% | "멈춰 있을 때와 움직일 때 밝기가 바뀐다"는 PoE2 포럼 보고 [단일 S26] — 밝기가 저절로 바뀌는 것은 플레이어가 결함으로 느낀다. 우리 L9 흰 원판(ACES+Bloom이 접점 코어를 원판으로 만든 사고)도 같은 교훈. |
| R7 | **적의 예고·위험 장판은 플레이어 이펙트 위에 그리고, 테두리로 그린다.** 적·아군·자기 장판은 색 계열을 나눈다. | 적 장판: 테두리 선 2~3px(1080p 기준) + 내부 채움 불투명도 ≤ 35%. 플레이어 스킬 이펙트가 적 예고를 덮는 불투명도 ≤ 60% | PoE2에서 "내 장판과 적 장판이 같아 보인다", "효과가 함정 예고를 덮는다", "투명도 슬라이더를 달라"는 불만이 패치마다 반복된다 [사실 S15a·S15b·S15c]. GGG도 0.1.1에서 "기술·효과를 잘 보이게 하려고 여러 구역의 시각 잡동사니를 줄였다" [사실 S14a·S14b]. |
| R8 | **소품은 가장자리에 두껍게, 길에는 얇게.** 같은 소품은 변형(온전·부서짐·무너짐)을 3종 이상 만든다. | 이동 가능 영역 화면 면적 중 가림(소품·잎) ≤ 15%. 키 1.2m 넘는 소품은 길 중심선에서 3m 밖 | PoE 환경은 "3D 퍼즐 조각" 같은 타일로 짜고, 같은 조각을 온전·부서짐·반파 변형으로 만들어 반복이 안 보이게 한다 [단일 S19a, PoE1 시기]. 0.1.1 잡동사니 축소 [사실 S14]. |
| R9 | **피격 반응은 덧입히는(additive) 동작 층으로 한다.** 가벼운 피격은 하던 동작을 끊지 않고 위에 얹고, 무거운 피격만 동작을 끊는다. (표현 층 규칙이다. 경직 판정·수치는 Core를 따른다.) | 가벼운 피격 additive 무게 0.3, 0.15~0.2초. 무거운 피격은 전용 동작 0.4~0.6초 | PoE2 개발진: 부드러운 느낌은 대부분 additive 애니메이션에서 오고, 이 덕분에 가벼운 경직과 무거운 경직을 구분한다 [단일 S17, 2024-04]. |
| R10 | **화면 흔들림은 "큰 일"에만, 그리고 끌 수 있게.** | 진폭 ≤ 0.15m(월드), 0.12~0.2초, 보스 큰 공격·처형·플레이어 강타만. 옵션 켜기/끄기 필수 | PoE2에는 화면 흔들림 체크박스가 시각 민감도 옵션에 있다는 플레이어 보고 [단일 S25]. 흔들림이 많으면 R7의 장판 판독이 무너진다 [추정]. |

### 0.5 최상위 기준 Downfall of Yellowsky와의 관계 (11-05 CTO 전달 사용자 확정)

분위기·광원·안개의 최상위 기준은 **Downfall of Yellowsky**다. 이 문서의 PoE2 분석은 그 기준을 대신하지 않는다. "Yellowsky 같은 분위기를 탑다운 ARPG에서 **성능과 가독성을 지키면서** 내는 방법"의 보조 근거로만 쓴다.
- 이 세션에서는 Yellowsky의 공개 자료를 찾지 못했다(웹 검색 결과 0건. DIRECTION_RESET에도 "제목 확인 중"). 그래서 아래 표의 "Yellowsky 대응" 칸은 Yellowsky 연구 문서가 나오면 채운다. Yellowsky의 특징을 짐작해서 적지 않았다.
- "기여" 칸: **분위기**는 공기·깊이·색 온도를 만드는 기법, **가독성**은 어두운 분위기 속에서도 전투가 읽히게 지키는 기법, **성능**은 그 분위기를 60fps 안에 담는 기법이다.

| PoE2 기법 (이 문서 §) | 기여 | 이 기법이 분위기에 하는 일 | Yellowsky 대응 (Yellowsky 연구 뒤 기입) |
|---|---|---|---|
| 실시간 GI로 그늘을 색 있게 채움 (§3, R3 → 우리는 APV) | 분위기 + 가독성 | 어둠을 "검은 구멍"이 아니라 색이 남은 그늘로 만들어 깊이를 준다 | (미기입) |
| 불·마법 광원이 주변 지면을 물들임 (§3, R1③ → 그림자 없는 점광원 + 색 번짐 데칼) | 분위기 | 따뜻한 빛 웅덩이와 차가운 주변의 대비로 장소마다 감정을 만든다 | (미기입) |
| 빛 반경(캐릭터 주변을 항상 밝힘) (§3, R1②·R4) | 가독성 | 분위기가 어두워도 플레이어 주변만은 읽히게 보장한다 | (미기입) |
| 그림자 광원 수 제한, 그림자+GI 품질 등급 (§3, R2·§8) | 성능 | 비싼 그림자를 이야기가 있는 광원에만 써서 분위기를 프레임 안에 담는다 | (미기입) |
| 높이 안개(공기층), 거리 안개 약하게 (§4, R5, F1) | 분위기 + 가독성 | 지면 가까이 깔린 공기로 깊이를 주되 먼 적은 지우지 않는다(11-03 LOCK) | (미기입) |
| 노출 고정·LUT 한 장 (§4, R6, P1) | 분위기 | 장면의 색 온도·밝기를 의도대로 고정해 분위기가 저절로 바뀌지 않게 한다 | (미기입) |
| 잡동사니 축소, 적 예고가 항상 위 (§5, R7·R8) | 가독성 | 분위기 연출(소품·입자)이 전투 판독을 덮지 않게 한다 | (미기입) |
| 어둠 과다 불만(PoE2의 실패) (§3, S12) | 가독성(경고) | 분위기를 위해 어둡게 하면 길·적이 안 보이는 선을 넘기 쉽다. Yellowsky 분위기를 따를 때 R4·R3 수치가 그 하한이다 | (미기입) |

---

## 1. 출처

날짜는 검색 결과에 나온 게시일이다. "(추정)"은 스레드 번호·기사 맥락으로 짐작한 연도다. "날짜 미확인"은 검색 요약에 날짜가 없었다는 뜻이다. 모두 2026-11-04~05에 검색으로 확인했다(원문 직접 열람 불가, 위 "한계").

| ID | 출처 | 날짜 | 종류 |
|---|---|---|---|
| S01 | GGG 공지 "Rendering Path of Exile 2" — https://www.pathofexile.com/forum/view-thread/3447463 | 2023-11 (ExileCon 2023 뒤) | 공식 |
| S02 | ExileCon 2023 "Rendering Path of Exile 2" 발표 영상(Alexander Sannikov) — https://www.youtube.com/watch?v=TrHHTQqmAaM | 2023-11 | 공식 발표 (**미시청**) |
| S03 | Steam 뉴스 같은 공지 — https://store.steampowered.com/news/app/238960/view/3802787074179045346 | 2023-11 | 공식 |
| S04 | Sannikov LinkedIn 글(발표 소개, "새 GI = Radiance Cascades, 별도 논문") — https://www.linkedin.com/posts/alexander-sannikov-9964aa188_exilecon-2023-rendering-path-of-exile-2-activity-7127539402737684481-M2h3 | 2023-11 | 개발자 본인 |
| S05 | Radiance Cascades 논문 사본 — https://www.scribd.com/document/718626784/RadianceCascades , 해설 위키 https://radiance.wiki/ | 2023~ | 기술 문서 |
| S06 | 80.lv "Radiance Cascades: New Approach to Calculating GI" — https://80.lv/articles/radiance-cascades-new-approach-to-calculating-global-illumination | 날짜 미확인(2024 추정) | 기술 기사 |
| S07 | Hacker News 토론(PoE2는 3D로, 깊이 버퍼를 레이마칭해 화면 정보에서 구성 / 카메라 원근 고정) — https://news.ycombinator.com/item?id=41958021 | 2024-10 (추정) | 커뮤니티(기술) |
| S08 | Chalmers 석사논문(화면 기반 RC는 화면 밖 광원을 못 잡음) — https://odr.chalmers.se/items/9e42007a-bb60-440f-ba28-04410822758f | 2025 | 학술 |
| S09 | Holographic Radiance Cascades(Freeman·Sannikov·Margel) — https://arxiv.org/abs/2505.02041 | 2025-05 | 학술 |
| S10 | PoE2 위키 "Light radius" — https://www.poe2wiki.net/wiki/Light_radius | 날짜 미확인 | 커뮤니티 위키 |
| S11 | Mobalytics "Light radius" — https://mobalytics.gg/poe-2/guides/light-radius | 날짜 미확인 | 공략 |
| S12a | 공식 포럼 "The Overwhelming Darkness in PoE2: A Need for Brighter Maps" — https://pathofexile.com/forum/view-thread/3727360 | 2025 (추정) | 플레이어 |
| S12b | Mein-MMO(빛 반경 기본값 상향 요구) — https://mein-mmo.de/en/players-of-path-of-exile-2-are-venting-about-a-familiar-problem-offering-the-developers-a-solution,1574162/ | 2025 (추정) | 기사 |
| S13a | PCGamesN 최적 설정 — https://www.pcgamesn.com/path-of-exile-2/best-settings-pc | 날짜 미확인 | 기사 |
| S13b | allthings.how 설정(그림자+GI Ultra→Low 1080p 약 117→135fps) — https://allthings.how/path-of-exile-2-best-settings-for-max-fps-on-pc/ | 날짜 미확인 | 기사 |
| S14a | DSOGaming 0.1.1 패치노트 — https://www.dsogaming.com/patches/path-of-exile-2-title-update-0-1-1-released-full-patch-notes/ | 2025-01 | 패치노트 전재 |
| S14b | PCGamesN 0.1.1 — https://www.pcgamesn.com/path-of-exile-2/patch-notes-jan-17 , PoE2 위키 https://www.poe2wiki.net/wiki/Version_0.1.1 | 2025-01 | 패치노트 전재 |
| S15a | 공식 포럼 "Ground Effects Visibility" — https://pathofexile.com/forum/view-thread/3626389 | 2025 (추정) | 플레이어 |
| S15b | 공식 포럼 "Patch 0.3 – Top 10 Feedback Points" — https://www.pathofexile.com/forum/view-thread/3853332 | 2025 (추정) | 플레이어 |
| S15c | 공식 포럼 "The VISUAL CLARITY Issue" — https://www.pathofexile.com/forum/view-thread/3906258 , "Skill Transparency Slider" https://web.poecdn.com/forum/view-thread/3927260 | 2026 (추정) | 플레이어 |
| S16 | Shacknews 인터뷰 "How this sequel is different from Diablo 4"(시각 피드백을 분명히, 탄·파티클을 줄이는 방향) — https://www.shacknews.com/article/136923/path-of-exile-2-interview-closed-beta-pc-ps5-xbox-series-x-s | 2023 (추정) | 인터뷰 |
| S17 | But Why Tho, Octavian 인터뷰(additive 애니메이션, 가벼운/무거운 경직) — https://butwhytho.net/2024/04/wasd-controls-to-path-of-exile-2-was-worth-it/ | 2024-04 | 인터뷰 |
| S18 | GGG "An Interview with our Animation Department"(PoE1, 공격 무게·프레임 간격, 낡은 리그) — https://www.pathofexile.com/forum/view-thread/1657701 | 2016 전후 (추정) | 공식(PoE1) |
| S19a | GGG "Developer Interview – Blake – Environment Artist"(타일 = 3D 퍼즐 조각, 변형) — https://www.pathofexile.com/forum/view-thread/1833323 | 2017 전후 (추정) | 공식(PoE1) |
| S19b | GGG "An Interview with our Level Design Department"(무작위 지형 생성으로 반복 플레이) — https://www.pathofexile.com/forum/view-thread/1654235 | 2016 전후 (추정) | 공식(PoE1) |
| S20 | PoEBuilds "Behind the Maps of PoE2: Lead Map Designer Steven"(배치는 절차 생성과 호환돼야 함, 환경아트와 형태 맞춘 뒤 생성 시스템에 맞게 재구성) — https://www.poebuilds.net/post/behind-the-maps-of-path-of-exile-2-interview-with-lead-map-designer-steven | 날짜 미확인 | 인터뷰(본문 일부 깨짐) |
| S21 | MassivelyOP ExileCon 2023(회피 구르기·무기 스킬 교체 도입) — https://massivelyop.com/2023/07/28/exilecon-2023-path-of-exile-2-introduces-dodge-rolling-and-instant-weapon-skill-swapping/ | 2023-07-28 | 기사 |
| S22a | Sportskeeda 회피 구르기(1초 조금 넘음) — https://sportskeeda.com/mmo/path-exile-2-poe2-dodge-roll-system-iframes | 날짜 미확인 | 기사 |
| S22b | Mobalytics 회피 구르기(작은 몬스터를 밀어내며 지나감) — https://mobalytics.gg/poe-2/guides/dodge-roll-mechanic | 날짜 미확인 | 공략 |
| S22c | Sportskeeda(통과형 구르기는 안 함, 몸막기는 덜 답답하게) — https://sportskeeda.com/mmo/path-exile-2-developers-say-phasing-dodge-rolls-will-make-easier-counter-body-blocks | 날짜 미확인 | 기사 |
| S23 | PC Gamer(드루이드 변신 형태 회피 구르기에 한 달) — https://www.pcgamer.com/games/rpg/path-of-exile-2-devs-had-so-much-negativity-around-druids-not-being-able-to-dodge-roll-in-animal-forms-that-they-spent-the-last-month-making-it-happen-man-it-was-tough-to-get-that-to-work-right | 2025 (추정) | 인터뷰 |
| S24a | Wccftech 2019 발표(PBR·물리 엔진 대개편) — https://wccftech.com/path-of-exile-2-announced-featuring-massive-engine-overhaul-path-of-exile-mobile-in-the-works-too/ | 2019-11 | 기사 |
| S24b | PC Gamer 2019 발표 — https://pcgamer.com/path-of-exile-2-announced-but-its-not-a-separate-game , PPE.pl(조명·이펙트·모델·텍스처 대변경) https://www.ppe.pl/news/139442/path-of-exile-2-zapowiedziane-pierwsze-konkrety.html | 2019-11 | 기사 |
| S25 | 공식 포럼(화면 흔들림 체크박스 위치) — https://www.pathofexile.com/forum/view-thread/3638092 | 2025 (추정) | 플레이어 |
| S26 | 공식 포럼 "Brightness changes when moving vs standing still" — https://www.pathofexile.com/forum/view-thread/3759359 | 2025 (추정) | 플레이어 |
| S27a | PC Gamer "Is Diablo 4 'dark' enough?" — https://pcgamer.com/is-diablo-4-dark-enough | 2023 (추정) | 기사 |
| S27b | Mein-MMO "PoE2가 D4보다 나은 3가지"(더 일관되고 어둡고 사나운 세계) — https://mein-mmo.de/en/i-played-path-of-exile-2-and-it-already-does-3-things-better-than-diablo-4,1025333 | 2023 (추정) | 기사 |
| S27c | PC Gamer(PoE 개발진, D4 대비 "엘든 링 쪽 방향") — https://pcgamer.com/path-of-exile-devs-feel-very-bad-for-their-diablo-4-counterparts-but-thats-live-service-for-you-and-why-theyre-going-more-in-the-elden-ring-sort-of-direction | 2023 (추정) | 인터뷰 |
| S27d | PCGamesN D4 시즌 4 카메라 거리 — https://www.pcgamesn.com/diablo-4/season-4-camera-distance | 2024 (추정) | 기사 |
| S28 | 공식 포럼 "PoE2 + original Camera Angle, Maximum Zoom Levels, Perspective" — https://www.pathofexile.com/forum/view-thread/3544195 | 2024 (추정) | 플레이어 |
| S29 | MassivelyOP·Shacknews WASD 발표(조준과 독립된 이동, Rogers) — https://www.shacknews.com/article/137929/path-of-exile-2-mercenary-wasd | 2023-11-30 | 기사 |

이 저장소의 앞선 PoE2 문서: [EXODUSER_ENGINE_DESIGN_FROM_POE2_20261012](../EXODUSER_ENGINE_DESIGN_FROM_POE2_20261012.md)·[POE2_REFERENCE_ANALYSIS_DOT_20261012](../POE2_REFERENCE_ANALYSIS_DOT_20261012.md)(웹판 FX·스프라이트 구조 학습). 이 문서는 그 위에 **3D 환경·광원·안개·동작**을 더한다.

---

## 2. 맵·환경

| 항목 | 무엇을 | 왜 | 어떻게 만들었나 | 판정 |
|---|---|---|---|---|
| 지역 구성 | 손으로 만든 조각(타일)을 규칙대로 이어 붙여 매번 다른 배치를 만든다 | 반복 플레이에서 같은 지도를 외우지 않게 하면서, 손 품질을 유지 | 레벨 디자이너가 형태를 잡고 환경 아티스트와 모양·테마를 맞춘 뒤, 절차 생성 시스템에 맞게 다시 짠다 (S20). PoE1 시기부터 "3D 퍼즐 조각" 타일 + 변형 (S19a·S19b) | 타일 방식 [사실 S19a·S19b·S20, 단 S19는 PoE1]. 손 배치 대 생성 비율 수치는 **공개 자료 없음** |
| 변형 | 같은 조각을 온전·무너짐·반파 등 여러 판으로 | 생성된 맵에서 반복이 눈에 띄지 않게 | 조각마다 변형 모델 (S19a) | [단일, PoE1] |
| 재질·렌더 기반 | PBR(물리 기반 렌더링)로 엔진 전면 개편 | 재질·조명이 서로 맞는 통일된 화면 | 2019 발표에서 PBR·물리 엔진 대개편, 조명·이펙트·모델·텍스처 대변경 발표 (S24a·S24b) | [사실] |
| 지형 재질 블렌딩·소품 군집 수치 | — | — | 공개 발표 범위에서 확인 못 함. 발표 영상(S02)에 있을 가능성 | **미확인** |
| 잡동사니 | 출시 뒤 여러 구역의 시각 잡동사니를 줄임 | 기술·효과를 잘 보이게 | 0.1.1 패치 (S14a·S14b) | [사실] |

**[추정] PoE2 환경의 핵심 원리:** ① 길은 넓고 깨끗하게, 높이감은 가장자리(벽·절벽·나무)로 ② 반복은 변형으로 숨김 ③ 출시 후에도 "보기 좋은 것"보다 "전투가 읽히는 것"을 우선해 소품을 뺐다.

**우리 Unity URP에서:**
- 우리는 1-1 한 장면(남→북 다리·양쪽 늪·고목 전경)을 손으로 만든다. 절차 생성은 데모 v0 범위 밖이다. 다만 PoE2처럼 **조각 단위(프리팹 모듈)** 로 만들어 두면 1-2 이후에 재사용·재조합이 된다. → §9 결정 E1.
- 변형 3종 규칙(R8)을 소품 제작 기준에 넣는다.
- 길 위 가림 ≤ 15%(R8)는 1-1 판정 캡처에서 잰다.

---

## 3. 광원

| 항목 | 무엇을 | 왜 | 어떻게 만들었나 | 판정 |
|---|---|---|---|---|
| 전역 조명(GI) | 새 실시간 GI "Radiance Cascades" | 수많은 동적 광원(스킬·불·마법)이 서로를 비추는 간접광을 실시간으로 내려고. 광원·폴리곤 수와 상관없이 비용이 일정하다고 주장 | 복사장(radiance field)을 거리 범위별 "캐스케이드"로 나눠 저장. PoE2 구현은 **화면 정보 기반**: 깊이 버퍼를 레이마칭해 3D 프로브 계층을 채움 (S05·S06·S07·S08). 그래서 **화면 밖 광원은 기여하지 못함** (S08) | 기법 존재·발명자·PoE2 사용 [사실 S01·S04·S05·S06]. 화면 기반 3D 구현 [사실 S07·S08]. "약 3ms" 같은 성능 수치는 **공식 근거 없음** |
| 카메라 전제 | 원근이 고정된 위에서 보는 카메라 | 화면 기반 GI가 성립하려면 카메라가 장면 대부분을 늘 보고 있어야 함 | — (S07 댓글) | [단일] + [추정]: 고정 탑다운 카메라라서 화면 기반 GI가 실용적이었다 |
| 설정 구조 | 조명: "그림자만" / "그림자 + GI", "그림자 + GI 품질" 등급 | 저사양 대응 | 옵션 (S13a·S13b) | [사실] 그림자와 GI가 가장 큰 성능 항목 |
| 많은 그림자 광원 | 그림자를 많이 드리우는 밝은 광원 구역이 무거웠음 | — | 0.1.1에서 성능 개선 (S14a·S14b) | [사실] |
| 빛 반경 | 캐릭터 주변을 밝히는 반경이 스탯. 어두운 구역에서 밝히는 거리, 미니맵 안개 걷힘 범위까지 결정. 밝기 설정과 무관. 실명 상태면 최소로 | 어둠을 게임 규칙(위험)으로 쓰면서도, 캐릭터 주변은 항상 읽히게 | 스탯 (S10·S11) | [사실] |
| 어두움 불만 | "맵이 너무 어둡다", 빛 반경 기본값 상향 요구 | — | (S12a·S12b) | [사실] 어둠은 PoE2의 약점으로도 꼽힌다 |
| 횃불·마법 광원 개수·색 규칙 | — | — | 공개 자료로 확인 못 함 | **미확인** |

**[추정] PoE2 광원의 핵심 원리:**
1. 직접광은 적게, 간접광(GI)으로 공간을 채운다. 그래서 어두운 맵에서도 형태가 "검은 구멍"이 아니라 색 있는 그늘로 남는다.
2. 마법·불 광원이 주변 지면·벽을 실제로 물들여, 스킬이 "세계 안에서" 빛난다.
3. 캐릭터 주변 빛은 규칙(빛 반경)으로 보장한다. 분위기와 가독성의 경계를 시스템으로 둔다.
4. 그래도 플레이어 불만이 남은 지점(너무 어두움)은 우리가 피할 것이다 → R4.

**우리 Unity URP에서:**
- 실시간 화면 기반 GI(PoE2 방식)를 URP에서 직접 만드는 것은 엔진 개발이다. 우리 팀 규모·기간에 맞지 않는다 [제안]. URP 17에는 기본 SSGI가 없다. → **APV(Adaptive Probe Volumes) 굽기**로 정적 간접광을 내고, 동적 광원(스킬·불)은 "그림자 없는 점광원 + 지면 색 번짐 데칼"로 흉내 낸다. → §9 결정 L2.
- 현재 렌더러는 Forward(`m_RenderingMode: 0`), 오브젝트당 추가 광원 8개 제한이다. 횃불·스킬 광원이 늘면 끊긴다 → **Forward+로 전환** 후보. → §9 결정 L1.
- 키라이트 1 + 플레이어 빛 1 + 장소 광원(R1·R2). 플레이어 빛은 그림자 없음, 캐릭터 머리 위 2~3m.

---

## 4. 안개·대기·색

| 항목 | 판정 |
|---|---|
| PoE2 높이 안개·볼류메트릭 방식 | **미확인.** 발표 영상(S02) 요약에 "볼류메트릭 레이마칭은 단계마다 조명을 계산해야 해서 매우 비싸다"는 대목이 있다는 검색 요약이 1건 있다 [단일, 2차 요약]. PoE2가 그 비용을 어떻게 줄였는지는 영상에서 확인 필요. |
| 톤매핑·색 보정 방식 | **미확인.** |
| 밝기가 저절로 바뀜 | 멈출 때와 움직일 때 밝기가 다르다는 포럼 보고 [단일 S26]. 원인은 모름(자동 노출·빛 반경·GI 갱신 중 하나일 수 있음) [추정]. |
| 전체 톤 | D4보다 "더 어둡고 기괴하다", "더 일관되고 어둡고 사납다"는 평 [사실 S27b + 비교 기사들]. |

**[추정] 원리:** 안개는 "먼 곳을 지우는 장치"가 아니라 "공기층을 보여 주는 장치"로 쓴다. 탑다운 카메라에서는 카메라와 지면 사이 거리가 화면 위·아래로 크게 다르지 않으므로, 거리 안개보다 **지면 가까이 깔리는 높이 안개**가 공기감을 낸다. 이 원리는 PoE2 확인 사실이 아니라 우리 LOCK(먼 적 보임)과 탑다운 기하에서 나온 결론이다.

**우리 Unity URP에서:**
- 이미 `HellFogFeature`("지옥 필드 높이 광산란", URP_PC_High_Renderer, injection 550)가 있다. 새로 사지 말고 이 기능을 매뉴얼 수치로 맞춘다 → §9 결정 F1.
- R5: 화면 위쪽 끝 안개 섞임 ≤ 25%, 적·캐릭터 셰이더 안개 영향 50%.
- R6: 자동 노출 끔, LUT 1장, 장면 간 밝기 차 ≤ ±15%.
- "실버 헬" 톤: 안개 색은 은회색~차가운 청회색, 불빛만 따뜻한 색. 안개에 채도를 넣지 않는다 [제안].

---

## 5. 전투 가독성·피격

| 항목 | 무엇을 | 판정 |
|---|---|---|
| 방향 | PoE1의 "화면 가득한 탄·파티클"에서 벗어나 **시각 피드백을 분명히** 하는 쪽으로. 더 느리고 무게 있는 전투, 회피 구르기 중심 | 인터뷰 질문 형태로 확인 [단일 S16], 회피 중심 설계는 [사실 S21·S22a·S16] |
| 출시 후 수정 | 0.1.1에서 잡동사니 축소, 원소 폭발 효과·컬티스트 궁수 기술의 가시성 향상 | [사실 S14a·S14b] |
| 남은 약점 | 내/적 장판 구분 불가, 처치 시 효과·장판이 스킬에 가려짐, 투명도 슬라이더 요구 | [사실 S15a·S15b·S15c] (플레이어 의견) |
| 화면 흔들림 | 옵션 체크박스 존재 | [단일 S25] |
| 적 밀도 수치·피격 정지(hit stop) 프레임 | 공개 자료 없음 | **미확인** |

**교훈 [추정]:** PoE2는 "분명한 피드백"을 목표로 했지만 출시 뒤에도 장판 판독 불만이 가장 컸다. 그러니 우리는 처음부터 **적 예고가 항상 이긴다**는 그리기 순서 규칙(R7)을 넣는다. 공통 관례(LoL식 판정 테두리, 투명도 슬라이더)는 사용자가 짚기 전에 넣는다(CLAUDE.md 4.1).

**우리 Unity URP에서:** 적 예고 장판은 URP Decal(이미 `DecalRendererFeature` 있음) + 테두리 셰이더, 렌더 큐를 플레이어 VFX보다 뒤로. 플레이어 VFX 투명도 옵션(0~100%, 기본 80%) [제안]. 판정 모양은 Core 판정과 같아야 한다(CLAUDE.md 1).

---

## 6. 캐릭터·몬스터 동작

| 항목 | 무엇을 | 왜 | 어떻게 | 판정 |
|---|---|---|---|---|
| additive 애니메이션 | 피격·반응 동작을 기본 동작 위에 덧입힘 | 부드러운 느낌, 가벼운/무거운 경직 구분 (PoE1은 경직되면 하던 동작이 끝났음) | 동작 블렌딩 시스템 | [단일 S17]. MassivelyOP는 "애니메이션 변경은 PoE2 전용"이라 보도 [단일] |
| 공격 속도 변형 | 공격 속도가 높을 때도 어색하지 않게 같은 동작의 변형을 만듦 | 속도 스탯이 동작을 망치지 않게 | 속도 구간별 변형 | [단일, ExileCon 보도 요약] |
| WASD 이동 | 조준과 독립된 이동 | "슈터 같은 플레이" | 2023-11 발표 (S29) | [사실 S29 + But Why Tho S17] |
| 회피 구르기 | 1초 조금 넘는 구르기, 작은 몬스터는 밀어냄, 통과형은 안 함 | 회피 중심의 느린 전투 | — | [사실 S21·S22a·S22b·S22c] |
| 변신 형태 구르기 | 드루이드 동물 형태도 구르기 가능하게 한 달 작업 | 플레이어 반발 | — | [단일 S23] |
| 모션캡처 | — | — | 공개 자료로 **확인 못 함**. 3D 애니메이터 채용 공고는 Maya 사용·게임플레이와 시네마틱 담당 [단일]. PoE1 애니메이션 팀 인터뷰는 공격 무게·프레임 간격, 낡은 리그 문제를 말함 [단일 S18] | **미확인** |

**[추정] 원리:** ① 동작을 끊지 않는다(덧입힘) ② 속도가 바뀌어도 동작 형태를 지킨다(변형) ③ 이동과 공격을 분리해 "몸이 무게를 싣는" 시간을 확보한다.

**우리 Unity URP에서:** Animator에 Additive 레이어(피격용, 상체 마스크) 1개 + 기본 레이어. 리깅 3D → 저해상도 렌더 → 픽셀 화면이므로, 덧입힘 동작은 **픽셀 단위로 2px 이상 움직여야 보인다**(작은 흔들림은 픽셀 렌더에서 사라짐) [제안]. 보스는 CLAUDE.md의 No Rest for the Wicked 감각(무게 있는 예비동작·끝까지 가는 공격·빈틈)을 따른다. 회피 구르기 수치는 Core 값을 쓴다(표현 작업에서 바꾸지 않음).

---

## 7. D4와 다른 선택

| 주제 | PoE2 | D4 | 이유 [추정, 근거] |
|---|---|---|---|
| 맵 | 손 조각 + 절차 조립의 구획형 지역 | 이어진 오픈 월드 + 던전 | PoE는 반복 플레이(리그·맵)가 사업 핵심 (S19b·S27c) |
| 조명 | 자체 실시간 GI(Radiance Cascades), 많은 동적 광원 | (D4_STUDY 01 참조) | GGG는 자체 엔진이라 렌더 기술에 직접 투자 (S01·S04) |
| 톤 | 더 어둡고 기괴, 일관됨 | 탁한 안개, 상대적으로 더 밝다는 평 | (S27a·S27b) |
| 전투 | 회피 구르기 중심, 느리고 무게 있게, 쿨다운보다 행동 | 쿨다운 중심 | Rogers: 쿨다운보다 행동, 엘든 링이 기준점 (S27c 및 검색 요약) |
| 카메라 | 고정 원근, 줌 한계 불만 | 가까운 시점 불만 → 시즌 4에 거리 조정 계획 보도 | 두 게임 모두 "답답한 카메라"가 불만 (S27d·S28) |
| 개발 운영 | D4에서 "배울 게 많지 않았다", 엘든 링 방향 | — | (S27c, Mein-MMO 보도) |

**우리에게:** 우리 카메라는 피치 34° 원근 LOCK이고 먼 적이 보이는 것이 핵심이다. 두 게임 모두 "카메라가 가깝다" 불만이 있으므로, 이 LOCK은 레퍼런스 공통 약점을 피하는 선택이다 [추정]. 바꾸지 않는다.

---

## 8. 성능 예산 [제안]

PC(High)·Mac(Balanced) 둘 다 1080p 60fps 목표, 1-1 한 판 기준.

| 항목 | 예산 |
|---|---|
| 그림자 있는 광원(키라이트 제외) | 화면당 ≤ 4 (PC), ≤ 2 (Mac) |
| 그림자 없는 점광원 | 화면당 ≤ 16 (Forward+), ≤ 8 (Forward 유지 시) |
| 안개 패스 | ≤ 1.0ms GPU (PC), ≤ 1.5ms (Mac) |
| SSAO | ≤ 1.0ms |
| APV | 메모리 ≤ 256MB(현재 예산 1024MB 설정, 실제 사용 측정 후 낮춤) |
| 후처리 전체(톤매핑·LUT·Bloom·비네트) | ≤ 1.0ms |

---

## 9. 도구·방식 결정안

사용자 요구: "어떤 도구로 어떤 방식으로 만들지 정확하게 정하라." 각 단계마다 (a) PoE2 방식(공개 근거) (b) 우리 후보 2개 이하 + **추천 1개** (c) 절차와 조정 수치 (d) 합격 기준·성능 예산, 이유·비용. **확정은 사용자 승인 뒤**(DIRECTION_RESET 단계 3). 비용은 새 유료 지출 기준이다.

### E1. 지형(바닥 형태)
- (a) PoE2: 손 조각 타일 + 절차 조립 [사실 S19·S20]. 지형 기술 세부는 미확인.
- (b) 후보: ① **Unity Terrain**(하이트맵 + Terrain Layers) ② 메시 지형(Blender에서 조각 모델링 → 프리팹).
  **추천 ②메시 지형 + 조각 프리팹.** 이유: 탑다운 한 화면은 작고(다리·늪·둑), 늪 가장자리·둑 경사·다리 접합처럼 손으로 다듬을 곳이 많다. Terrain은 넓은 들판에는 좋지만 가파른 둑·물가 경계가 계단처럼 보이고, 재질 레이어 4개 넘으면 패스가 늘어난다. 메시 조각은 PoE2식 모듈 재사용(1-2 이후)도 된다. 비용 0(Blender 무료).
- (c) 절차: 웹 1-1 좌표 배치도 → Blender에서 1m 격자 조각(바닥·둑·늪가) → 정점 색 채널 R/G/B = 흙/이끼/진흙 블렌드 마스크 → FBX → Unity 프리팹. 조각 크기 8×8m, 정점 간격 0.25m.
- (d) 합격: 34° 게임 시점 1920×1080에서 각진 실루엣·이음매 0, 3x 크롭에서 계단 0. 삼각형 ≤ 300k/화면.

### E2. 지형 재질 블렌딩
- (a) PoE2: PBR [사실 S24]. 블렌딩 방식 미확인.
- (b) 후보: ① **정점 색 마스크 + 높이 기반 블렌드 셰이더(Shader Graph)** ② Terrain Layers.
  **추천 ①.** 높이 블렌드(돌 틈에 흙이 먼저 차는 경계)가 "접지"를 가장 크게 바꾼다. Shader Graph로 재질 3장(흙·이끼·진흙) + 높이맵 블렌드. 비용 0.
- (c) 수치: 블렌드 대비(sharpness) 0.15~0.3, 텍스처 타일링 2~3m 반복, 매크로 변화(큰 얼룩) 텍스처 20~30m 1장 덧곱.
- (d) 합격: 1x에서 반복 무늬가 화면에 3번 이상 같은 모양으로 안 보임. 점·그레인 0(CLAUDE.md 4.2-7).

### E3. 소품·군집
- (a) PoE2: 변형 있는 조각, 출시 후 잡동사니 축소 [S19a·S14].
- (b) 후보: ① **Blender 직접 모델링 + Meshy/Tripo로 초안 → Blender 정리** ② 유료 환경 팩.
  **추천 ①.** 유료 팩은 톤(실버 헬)과 맞추는 재작업이 크고 다른 게임과 같은 얼굴이 된다. Meshy·Tripo는 API연결_가이드 예산 안에서만(유료 생성 승인 필요). 군집 배치는 Unity 기본 프리팹 브러시나 우리 커스텀 툴 "PropScatter"(입력: 배치도 영역 + 밀도 표, 출력: 프리팹 배치, 5m 간격 규칙·길 중심선 3m 금지 자동) 중 택1 — 1-1 한 장면은 손 배치로 충분하므로 **커스텀 툴은 1-2 착수 때** 만든다.
- (c) 수치: R8(가림 ≤ 15%, 1.2m 이상 소품 중심선 3m 밖), 변형 3종 이상, 군집은 큰 것 1 + 중간 2~3 + 작은 것 5~8.
- (d) 합격: 판정 캡처에서 길 가림 측정 ≤ 15%, 먼 적 가림 0.

### E4. 접지(소품·캐릭터가 땅에 붙어 보이게)
- (a) PoE2: 미확인(GI가 접촉 그늘을 일부 냄 [추정]).
- (b) 후보: ① **기존 HellSsaoFeature + 소품 밑 접지 데칼(URP Decal)** ② APV만.
  **추천 ①.** 이미 렌더러에 SSAO·Decal 기능이 있다. 소품마다 바닥 이끼·흙 쌓임 데칼 1장.
- (c) 수치: SSAO 반경 0.5~0.8m, 세기 0.6~0.9, 데칼 불투명도 0.5~0.8.
- (d) 합격: 3x 크롭에서 소품 밑 떠 보이는 틈 0. SSAO ≤ 1.0ms.

### L1. 직접광·그림자
- (a) PoE2: 많은 동적 광원·그림자, 그림자 광원이 가장 비쌈 [사실 S13·S14].
- (b) 후보: ① **URP Forward+** ② Forward 유지(오브젝트당 8개).
  **추천 ① Forward+.** 횃불·스킬·플레이어 빛이 겹치는 1-1 늪 장면에서 오브젝트당 8개 한계를 넘는다. Mac(Metal) 지원. 비용 0. 전환은 렌더러 에셋 한 키(`m_RenderingMode`) 변경 + Mac 실측.
- (c) 수치: R1·R2. 키라이트 방향광 그림자 거리 45m, 캐스케이드 3(현재값), 그림자 해상도 2048(PC)/1024(Mac). 장소 광원 그림자는 1024 티어.
- (d) 합격: 그림자 계단·깜박임 0, 그림자 광원 ≤ 4/화면, 프레임 60 유지.

### L2. 간접광(GI)
- (a) PoE2: 실시간 화면 기반 Radiance Cascades [사실].
- (b) 후보: ① **Adaptive Probe Volumes(APV) 굽기** ② 라이트맵 굽기(Progressive GPU).
  **추천 ① APV.** 이유: 픽셀풍 동적 캐릭터도 같은 간접광을 받는다(라이트맵은 정적 메시만), UV2 펼치기 불필요, URP 17 지원, 이미 URP 에셋에 APV 메모리 예산 키가 있다(`m_LightProbeSystem: 0`이라 지금은 꺼져 있음 → 1로). 실시간 GI 자체 개발은 하지 않는다(엔진 개발 규모).
- (c) 절차: 장면에 Adaptive Probe Volume 1개(장면 전체), 최소 프로브 간격 1m, 최대 9m, SH 밴드 L1(현재). 동적 불·스킬은 "그림자 없는 점광원 + 지면 색 번짐 데칼"(가짜 GI).
- (d) 합격: R3(그늘 지면 ≥ 양지 30%, 순흑 0%), 빛샘(벽 너머 빛) 0, 굽기 시간 ≤ 10분(Mac).

### L3. 캐릭터 가독성 광원
- (a) PoE2: 빛 반경 스탯 [사실 S10·S11], 그러나 너무 어둡다는 불만 [사실 S12].
- (b) 후보: ① **플레이어 빛(점광원, 그림자 없음) + 픽셀 캐릭터 림 라이트(셰이더)** ② 플레이어 빛만.
  **추천 ①.** 픽셀풍 저해상도 렌더에서는 조명만으로 윤곽이 쉽게 뭉개진다. 림은 픽셀 렌더 단계에서 1px 밝은 테두리로 넣는다.
- (c) 수치: R1·R4. 플레이어 빛 반경 8m, 높이 2.5m. 림 세기 0.25~0.4, 색은 실버 헬 은색.
- (d) 합격: R4 밝기비 ≥ 1.5, 가장 어두운 늪 구역에서 1x로 캐릭터·적 윤곽 판독.

### F1. 안개·대기
- (a) PoE2: 미확인(발표 영상 확인 필요).
- (b) 후보: ① **기존 HellFogFeature(높이 광산란) 조정** ② URP 기본 거리 안개(RenderSettings.fog) 병용. (Unity 에셋 스토어 볼류메트릭 팩은 후보에서 뺀다 — 이미 자체 기능이 있고 유료.)
  **추천 ①만 사용, 거리 안개는 끔.** 거리 안개는 탑다운에서 먼 적을 먼저 지운다(LOCK 위반 위험).
- (c) 수치: 안개 높이 0~2.5m(지면 기준), 높이 감쇠 지수 0.6~1.0, 화면 위쪽 끝 섞임 ≤ 25%(R5), 적·캐릭터 안개 영향 50%. 빛줄기(갓레이)는 연출 장면만.
- (d) 합격: 먼 적 비교판(안개 끔/켬)에서 먼 적 밝기 대비 손실 ≤ 25%. 패스 ≤ 1.0ms(PC)/1.5ms(Mac).

### P1. 후처리·색
- (a) PoE2: 미확인. 밝기가 저절로 바뀌는 문제 보고 [단일 S26].
- (b) 후보: ① **URP Volume(GlobalVolume_Hell) + Neutral 톤매핑 + LUT 1장** ② ACES 유지.
  **추천 ① Neutral.** L9 흰 원판 사고가 ACES+Bloom에서 났다. Neutral은 색상이 덜 틀어져 실버 헬 은색을 지키기 쉽다. LUT는 DaVinci Resolve(무료) 또는 Photoshop으로 1장 제작.
- (c) 수치: R6. 자동 노출 없음, Bloom 임계 ≥ 1.1·세기 ≤ 0.3, 비네트 ≤ 0.2(먼 적 구역인 화면 위쪽을 어둡게 하지 않음 — 비네트 중심을 화면 중앙보다 0.05 위로), 필름 그레인 0(CLAUDE.md 점 금지).
- (d) 합격: 같은 장면 3회 이동·정지에서 평균 밝기 차 ≤ 2%, 장면 간 ≤ ±15%. 후처리 ≤ 1.0ms.

### 결정 요약

| 단계 | 추천 | 새 비용 |
|---|---|---|
| E1 지형 | Blender 메시 조각 프리팹 | 0 |
| E2 재질 | Shader Graph 정점색 + 높이 블렌드 | 0 |
| E3 소품 | Blender (+ 승인 시 Meshy/Tripo 초안), 손 배치, PropScatter 툴은 1-2 때 | 생성 시 API 예산 안 |
| E4 접지 | 기존 SSAO + Decal | 0 |
| L1 직접광 | Forward+ 전환 | 0 |
| L2 GI | APV 굽기 + 가짜 GI 데칼 | 0 |
| L3 가독성 | 플레이어 빛 + 픽셀 림 | 0 |
| F1 안개 | 기존 HellFogFeature, 거리 안개 끔 | 0 |
| P1 후처리 | Neutral + LUT 1장, 자동 노출 끔 | 0 |

---

## 10. 남은 확인 (다음 담당)

1. **ExileCon 2023 렌더링 발표 영상(S02) 시청**(Mac, 약 1시간): 안개·볼류메트릭 방식, 그림자 방식, 톤매핑, 물·머리카락 처리 여부를 적어 §3·§4의 "미확인"을 채운다. 이 세션에서는 YouTube·pathofexile.com이 네트워크 정책에서 막혀 있었다.
2. Radiance Cascades 원문(S05) 읽고 "화면 밖 광원" 대응 방식 확인(우리 결정에는 영향 작음 — 우리는 APV).
3. 손 배치 대 생성 비율·소품 밀도 수치: 공개 자료 없음. PoE2 레벨 디자인 인터뷰(S20) 원문 확인.
4. 모션캡처 사용 여부: 공개 자료 없음. ExileCon 2023 다른 발표(애니메이션·전투) 목록 확인.
5. §0 규칙 수치는 매뉴얼 단계에서 D4_STUDY·Phantom Blade Zero 연구와 대조해 확정한다.
