# 레퍼런스 색인 — 배울 것·참고할 것 (2026-11-05, 레인 RS)

- 목적: [방향 전환 11-05](../DIRECTION_RESET_20261105.md) 2단계 "연구"의 출발 목록. 분위기 목표는 사용자 표현 "황천처럼 — 분위기·광원·안개".
- 우리 조건: 탑다운 원근(피치 34°, 먼 적이 보임 — CLAUDE.md 카메라 LOCK), 2.5D(3D 지형·소품 + 리깅 3D를 저해상도 실시간 렌더한 픽셀풍 캐릭터), 다크 판타지 핵앤슬래시, Unity 6000.6 URP, 소규모 팀 + AI 도구.
- **조사 방법과 한계(먼저 읽기):** 이 클라우드 세션은 웹 검색만 됐고 원문 페이지 열기(WebFetch)는 네트워크 정책으로 막혔다(store.steampowered.com·playfront.de·resetera.com 모두 DNS 차단). 아래 사실은 **검색 결과에 나온 출처 제목·발췌 기준**이며 원문을 직접 열어 보지 않았다. 링크는 검색 결과에 실제로 나온 URL만 적었다. 출처가 1개뿐인 주장은 "(단일 출처)"로 표시했다. 방향 전환 규칙(출처 2개 이상만 사실)에 따라 단일 출처 항목은 **미확정**이다.
- 적용 가능성: 상 = 우리 Unity URP·소규모에서 바로 따라 할 수 있는 방법이 공개돼 있음 / 중 = 원리는 배울 수 있으나 도구·규모 차이로 대체 방법이 필요 / 하 = 참고만.
- 금지 재확인: 레퍼런스의 에셋·코드 반입, 게임 파일 분석, 복제 금지. 영상·스크린샷은 공개 자료를 보고 판정 메모만 남긴다(반입하지 않음).

## 가장 먼저 공부할 5개와 이유

| 순서 | 대상 | 이유 |
|---|---|---|
| 1 | **Downfall of Yellow Sky(黄天逆途)** 공개 실기 영상 | 사용자가 정한 분위기 목표 자체다. 11인·무투자 팀이 탑다운에서 광원·이펙트로 화제가 됐다는 점이 우리 규모와 가장 가깝다. 기술 자료가 없으므로 공개 영상을 장면 단위로 보고 "광원 개수·안개 층·색 범위·이펙트 크기" 판정 메모를 만드는 것이 연구 방법이다. |
| 2 | **3D→픽셀 실시간 렌더(t3ssel8r 계열) + Unity URP 구현 사례** | 우리 캐릭터 방향(리깅 3D → 저해상도 픽셀 렌더)의 핵심 기술이다. 저해상도 렌더·픽셀 스냅(흔들림 방지)·외곽선 규칙이 공개돼 있고 Unity URP 구현 글이 여러 개 있다. |
| 3 | **Diablo IV 아트 방향(“old masters”·“return to darkness”)** | 다크 판타지 탑다운의 광원·명암 기준. 블리자드 공식 분기 업데이트와 GDC 2024 세션이 있다. 우리 "어둠이 먼 적을 지우면 FAIL" 규칙과 "Darkness does not mean bleakness"가 같은 문제를 다룬다. |
| 4 | **No Rest for the Wicked(Moon Studios, Unity)** | CLAUDE.md가 보스 동작 기준으로 지정한 게임이고 같은 엔진(Unity)이다. 80.lv 인터뷰에 Unity 수정·회화풍 제작 과정이 있다. 무게 있는 전투 동작 연구의 1차 자료. |
| 5 | **Dead Cells 3D→2D 애니메이션 파이프라인** | 3D 모델을 픽셀 애니메이션으로 바꾼 공개 사례 중 가장 자세하다. "키프레임을 2D처럼 먼저 설계하고, 적은 프레임으로 타이밍이 맞은 뒤에만 보간 추가" 원칙은 우리 실시간 픽셀 렌더 동작에도 그대로 쓸 수 있다. |

다음 순위: Path of Exile 2 렌더링 강연(광원·GI·그림자, 6), Sea of Stars(Unity, 조명을 먼저 정하고 파이프라인을 맞춘 사례, 7), Octopath HD-2D(픽셀 위 광원·피사계심도, 8), Phantom Blade Zero(임팩트·흐름, 9), URP 볼류메트릭 안개 공백 해결안(10).

## 1. Downfall of Yellow Sky — Codex 조사 인용·교차 검증

정본 조사는 PC Codex CX3 문서다: `docs/0마스터플랜/GAME_STUDY/codex_yellowsky.md` (브랜치 `codex/unity-study-yellowsky-20261105` @ `2008f8a4d`). 이 절은 그 결과를 인용하고, 이 세션의 독립 검색(검색 요약 기준, 원문 미열람)과 맞는지 대조만 한다.

| 항목 | Codex CX3 | RS 독립 검색 | 판정 |
|---|---|---|---|
| 제목 | 黄天逆途 / Steam 영어 설명 "Downfall of Yellow Sky", 붙여 쓴 "Yellowsky"는 해외 매체·Reddit 표기 | 같음(Steam·Metacritic·X·PlayFront) | **일치 — 확정** |
| Steam | AppID 5024530, 미출시·출시일 발표 예정 | 같음 | **일치 — 확정** |
| 개발·배급 | 望虚社. 2025-01 GamerSky는 伽马聚集으로 표기, 관계 미확인 | 望虚社, 일부 기사 "伽马聚集工作室(望虚社)" | **일치.** 두 이름 관계는 미확인 유지 |
| 영문 스튜디오명 | HypoFront(Reddit 팬 번역)·Wangxu(커뮤니티), 공식 미확인 | Wangxu Studio(검색 요약) | 공식명 **미확인** |
| 장르 | ARPG 중심 + 로그라이트 요소, 선협 | 같음 | **일치** |
| 팀 규모 | 11명(2026-07-28·08-14 보도). PlayFront는 10명 | 약 11명(소후·3DM·시나) | **11명 확정(보도값).** PlayFront 10명은 차이로 기록 |
| 개발 기간 | 2026-07 공개 당시 **약 2년**(Bilibili 설명). PlayFront는 1년 이상 | "1년 이상"(X·PlayFront 계열)만 찾음 | **불일치를 기록.** "약 2년"은 Bilibili 단일 출처, "1년 이상"은 두 출처. 둘 다 착수일 미확정 |
| 남은 기간 | 완성까지 1년 이상(2026-07 Q&A 보도) | 같음(게이머스카이) | **일치** |
| 자금 | 외부 투자 0, 업무 시간 약 1/4을 외주로 운영비 마련, 摩点 모금 계획 | 투자 0, 摩点 계획, 07-31 기준 미개시 | **일치.** 외주 1/4은 Codex 쪽 17173 단일 출처. 모금 개시·금액 미확인 |
| 엔진 | 미확인 | 미확인 | **미확인(양쪽 모두)** |
| 3D 여부 | 언급 없음 | ResetEra 제목 "3D Hades-like"(단일 출처) | 미확정 |
| "황천" 표기 | 공식 한국어명 근거 없음, "황천역도" 검색 일치 0 | 黄天의 한국어 독음이 "황천" | **추정.** 黄泉(저승)도 "황천"으로 읽히므로 사용자 별칭이 어느 쪽에서 왔는지는 확인 못 함 |

RS 쪽에서 더한 것: 17173 기사(단일 출처)에 제작진이 "이펙트 과밀로 인한 시각 피로"를 조절 과제로 본다는 내용이 있다. 우리 이펙트 기준에 참고할 만하다. Codex 문서에는 없다.

배울 것: 분위기(광원·안개·색), 이펙트 밀도 관리, 소규모 팀의 범위 선택. 우리에 맞는 이유: 탑다운·소규모·사용자 지정 목표. 적용 가능성: **중**(기술 자료가 없어 결과물만 보고 배워야 함). 다음 할 일: Mac 브라우저에서 공개 실기 영상(Bilibili BV19C356bEhm·BV1Nkga6cE1g, YouTube AHCgx-Z0tBc)을 장면별로 보고 판정 메모만 남긴다(영상·캡처 반입 금지). 엔진은 Steam 시스템 요구 사항·개발자 Q&A로 다시 확인한다.

## 2. 분야별 표

### 2a. 3D를 픽셀풍으로 렌더하는 2.5D (캐릭터·월드 파이프라인)

| 대상 | 배울 것 | 왜 맞나 | 팀·기간·예산(공개분) | 적용 | 링크 |
|---|---|---|---|---|---|
| t3ssel8r 계열 3D 픽셀 렌더 기법 | 저해상도 렌더 후 정수배 확대, 카메라 픽셀 스냅으로 흔들림 제거, 볼록 모서리만 밝히는 외곽선 | 우리 캐릭터 방향 그대로. 원작자 셰이더는 비공개지만 재현 글이 많다 | 개인 개발자 | 상 | https://davidholland.netlify.app/articles/3d-pixel-art-rendering · https://www.fab.com/listings/816f34f2-1a2e-4910-b3dd-009b5da0873b |
| Unity URP 3D 픽셀 구현 글들 | URP 렌더 패스 구성(저해상도 RT·외곽선·스냅), 광원 반응 외곽선 | 같은 엔진·같은 파이프라인 | 개인 | 상 | https://smallnightlight.github.io/Pages/Page1/pixelart3d.html · https://otaviopeixoto1.github.io/portfolio/3DPixelArt · https://kyriota.github.io/2022/08/02/UnityPixelatedArtStyleInURP/ |
| Project Shadowglass | 360° 회전에도 저해상도 블록 느낌 유지, 픽셀 안정화 | 3D 픽셀 표현의 최신 공개 사례. 단 **Godot** | Starhelm Studios 소규모, 2028 예정(단일 출처) | 중 | https://80.lv/articles/interview-how-project-shadowglass-creates-its-impossible-fully-3d-pixel-art-look |
| Dead Cells | 3D 모델 → 픽셀 애니메이션, 키프레임 우선·최소 프레임, 장비 교체가 쉬움 | 리깅 3D 기반 픽셀 동작의 품질 규칙 | 아트 1인으로 1년(Thomas Vasseur), 이후 1명 합류 | 상(원칙) | https://www.jikguard.com/news/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-dead-cells (원문 Game Developer 2018-01 재게재) · https://80.lv/articles/case-study-dead-cells-character-art-pipeline/ |
| Octopath Traveler(HD-2D) | 3D 장면 위 픽셀 스프라이트, 동적 광원·그림자, 피사계심도·틸트시프트의 디오라마감 | CLAUDE.md의 "2.5D(HD-2D)" 표현 원류 | UE4, 최대 프로그래머 6명 | 중(UE→URP 대응 필요, 틸트시프트는 우리 먼 적 규칙과 충돌 주의) | https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true · https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style |
| Eastward | 2D 픽셀 위 3D 조명(노멀맵 비슷한 채널), Aseprite→엔진 파이프라인, 날씨·시간대 | 픽셀과 실제 광원을 섞는 방법 | 2015년 3인 시작, 자체 엔진(이름은 출처마다 다름) | 중 | https://www.gamedeveloper.com/disciplines/road-to-the-igf-pixpil-s-i-eastward-i- · https://80.lv/articles/eastward-charming-chinese-pixel-art-adventure |
| Children of Morta | 픽셀 애니메이션 + 고해상도 동적 광원·그림자·포스트, 탑다운 ARPG | 탑다운 픽셀 ARPG에서 광원 분위기 | Unity(단일 출처), 손그림 애니 2인 | 중 | https://techraptor.net/content/how-dead-mage-created-the-art-for-children-of-morta · https://www.co-optimus.com/Editorial/1448/indie-ana-co-op-and-the-children-of-morta-interview.html |
| Death's Door | 탑다운 3D, 고대비 광원 | Unity 소규모 탑다운 액션 | Acid Nerve 2인 + 외부 아티스트 여럿 | 중 | https://gameinformer.com/afterwords/2021/09/22/afterwords-deaths-door · https://blog.unity.com/es/games/creators-in-the-spotlight-a-summer-of-celebration |
| Tunic | 조명에서 출발한 개발, 아이소 시점 | Unity 소규모 | Andrew Shouldice 중심 | 하(렌더 강연은 찾지 못함, 디자인 강연만) | https://www.gamedeveloper.com/business/how-tunic-weaves-wondrous-unknowable-worlds-inspired-by-inscrutable-nes-manuals |
| Hades(Supergiant) | 3D 모델·리깅 → 2D 스프라이트로 미리 렌더(손으로 그린 선을 모델에 칠해 2D 원화와 맞춤), 공용 베이스 모델 2개로 NPC 다수 | 리깅 3D를 픽셀·2D처럼 보이게 하는 대표 사례. 우리는 실시간 렌더라 차이가 있다 | 자체 엔진. 프레임 수(예: 활 104프레임×32방향)와 미리 렌더 사실은 커뮤니티 출처뿐 | 중 | https://gonintendo.com/stories/371221-supergiant-games-shows-off-the-3d-modeling-rigging-process-for · https://gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life |
| Sea of Stars(Sabotage) | 픽셀 게임에 전면 동적 조명, 노멀맵 스프라이트·볼류메트릭 광원·픽셀 퍼펙트 렌더용 자체 렌더 파이프라인, 조명 담당 1인을 2018년부터 두고 제작 파이프라인을 그 요구에 맞춤 | Unity. "조명이 먼저, 나머지가 맞춘다"는 제작 순서가 우리 연구 방향과 같다 | Unity, 킥스타터 출발 | 상 | https://mobilesyrup.com/2023/09/11/sea-of-stars-level-design-sabotage-studio-thierry-boulanger-interview/ · https://nichegamer.com/2020/03/19/the-messenger-prequel-rpg-sea-of-stars-enters-kickstarter-launches-2020-for-pc/ |
| Songs of Conquest(Lavapotion) | 2D 픽셀에서 시작해 시제품을 거쳐 2.5D로 감. "3D 모델링이 픽셀보다 훨씬 빠르다"는 개발자 발언, Unity 에디터 도구(오토타일·픽셀 분할) 자체 제작 | Unity 2.5D 픽셀 + 소규모. 우리 "리깅 3D→픽셀" 결정의 비용 근거 | Unity | 중 | https://gamerant.com/songs-of-conquest-interview-carl-toftfelt-history-early-access-development/ · https://medium.com/@gofig.news/a-coffee-break-with-niklas-borglund-songs-of-conquest-243b2a3376e3 |
| Moonlighter(Digital Sun) | 동적 조명 없이 스프라이트 겹치기로 밤 조명 표현 | 반례: 동적 조명 없이 어디까지 되는지 | Unity | 하 | https://80.lv/articles/moonlighter-building-pixel-art-preparing-for-switch/ |

### 2b. 다크 판타지 탑다운 ARPG — 분위기·광원·안개

| 대상 | 배울 것 | 왜 맞나 | 팀·기간·예산(공개분) | 적용 | 링크 |
|---|---|---|---|---|---|
| Diablo IV | 두 기둥 "old masters"(렘브란트식 명암·디테일 통제·색 범위)와 "return to darkness", PBR, 그림자 최대화, 타일셋 환경 | 다크 판타지 탑다운의 기준점. 어둠과 가독성의 균형 | 대형 스튜디오 | 중(원칙 상, 규모 하) | https://news.blizzard.com/en-us/article/23788294/diablo-iv-quarterly-updatemarch-2022 · https://schedule.gdconf.com/session/the-pillars-of-hell-achieving-the-artistic-vision-of-diablo-iv/902745 · https://gdcvault.com/play/1034353/Embracing-Art-Performance-on-Diablo |
| Path of Exile 2 | 화면공간 점광원 그림자, 화면공간 GI(Radiance Cascades), 탑다운 고정 시점에서 광원 다수 | 탑다운 광원 다수·불빛 분위기 | GGG, 강연자 Alexander Sannikov(ExileCon 2023) | 중(원리 상, URP 구현은 별도) | https://www.pathofexile.com/forum/view-thread/3447463 · https://80.lv/articles/radiance-cascades-new-approach-to-calculating-global-illumination · https://www.pathofexile.com/forum/view-thread/2198905 |
| No Rest for the Wicked | 회화풍 질감, Unity 수정, 애니메이션 주도 전투·무기 무게 | 같은 엔진, CLAUDE.md 보스 동작 기준 | Moon Studios | 상 | https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios · https://www.gamesradar.com/no-rest-for-the-wicked-preview-hands-on-march-2024 |
| V Rising | 시간대·구역별 Volume 프로필 혼합, 배경·캐릭터에 같은 조명 적용 | 탑다운 다크 분위기, Unity. Volume 혼합은 URP에도 있음 | Stunlock, HDRP·ECS 1,600 시스템 | 중(HDRP→URP 대응) | https://unity.com/case-study/v-rising · https://press.stunlock.com/v-rising-art-mood/ |
| Last Epoch | Unity 탑다운 ARPG 제작 규모 참고 | 같은 엔진·장르, 킥스타터 출발 | 2018 킥스타터 약 25만 달러, 당시 약 24~25명(출처마다 다름) | 하(분위기 자료 없음, 규모 참고) | https://en.wikipedia.org/wiki/Last_Epoch · https://wccftech.com/last-epoch-qa-on-runemaster-class-1-0-launch-and-advantages-over-diablo-iv/ |
| Grim Dawn | 소규모 다크 판타지 ARPG 범위·자금 | 소규모 장르 선례 | 타이탄 퀘스트 엔진 개량, 킥스타터 목표 28만 달러 달성 | 하 | https://www.pcgamer.com/grim-dawn-kickstarter-seeks-funding-for-ambitious-open-world-action-rpg · https://shacknews.com/article/73358/grim-dawn-turns-to-kickstarter-for-further-funding |

### 2c. 임팩트·전투

| 대상 | 배울 것 | 왜 맞나 | 팀·기간·예산(공개분) | 적용 | 링크 |
|---|---|---|---|---|---|
| Phantom Blade Zero | 개별 기술보다 전투 흐름, 공수 전환 | 사용자가 임팩트·전투 기준으로 지정 | S-GAME, UE5, 팀 규모 50명·150명으로 출처 불일치 | 중(3인칭 근접 → 탑다운으로 옮겨야 함) | https://www.vice.com/en/article/soulframe-ceo-of-s-game-and-the-creator-of-phantom-blade-zero-details-how-it-differs-from-any-other-action-game-on-the-market-exclusive-interview · https://gamesbeat.com/?p=234547 |
| Sekiro | 체간·튕겨내기, 실패한 튕겨내기가 막기로 이어짐, 소리로 성공 구분 | 우리 패링(Q) 피드백 설계 참고(설계 수치는 2_3 문서 고정, 표현만) | FromSoftware | 중 | https://www.superjumpmagazine.com/the-art-and-science-of-sekiros-combat/ · https://gamingbolt.com/sekiro-shadows-die-twice-dev-talks-about-how-combat-differs-from-dark-souls-and-the-challenges-of-developing-it |
| Hades | 가독성 우선 시각 위계(캐릭터·UI·VFX) | 탑다운 액션 가독성 | Supergiant 소규모 | 중 | https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/ · https://www.invenglobal.com/datalab/articles/14783/supergiant-games-how-indie-developers-made-goty-hades |
| 게임 필 고전 강연("Juice it or lose it" 2012, "The Art of Screenshake" Jan Willem Nijman) | 히트스톱·화면 흔들림·파티클·소리의 누적 효과와 과용 위험 | 임팩트의 기초 어휘 | 강연 장소는 출처마다 다름(GDC/Nordic Game Jam/INDIGO) | 상(원칙) | https://gamejuice.pages.dev/articles/juice-it-or-lose-it-lessons · https://www.gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design- |
| Diablo IV VFX 가독성 | 다수 몬스터·플레이어가 겹칠 때 VFX 명료성 원칙(Daniel Briggs) | 핵앤슬래시 화면 밀도 | 블리자드 | 중 | https://news.blizzard.com/ko-kr/article/23746639/iv-2021-12 |

### 2d. 기술 자료 (Unity URP)

| 대상 | 배울 것 | 왜 맞나 | 적용 | 링크 |
|---|---|---|---|---|
| Unity URP 3D Sample(Terminal·Garden·Oasis·Cockpit) | URP 조명·Forward+·Deferred, 장면별 화풍, 성능 최적화 | 우리 렌더 파이프라인 공식 예제 | 상 | https://unity.com/demos/urp-3d-sample · https://Blogs.Unity3D.com/engine-platform/dive-into-the-urp-3d-sample · https://80.lv/articles/unity-shares-a-detailed-tutorial-on-its-new-urp-3d-sample |
| kode80 PixelRenderUnity3D | Unity 실시간 3D→픽셀 시스템 공개 코드 | 원리 학습용(코드 반입 금지, 읽고 우리 방식으로 다시 짬) | 중 | https://awesome.ecosyste.ms/projects/github.com%2Fkode80%2FPixelRenderUnity3D |
| 외곽선 기법 정리 | 외곽선 5가지 방식 비교 | 픽셀 캐릭터 실루엣 | 중 | https://80.lv/articles/guide-5-ways-to-set-up-outlines-in-games/ |
| Unity 6 Adaptive Probe Volumes(APV) | 지오메트리 밀도에 따라 자동 배치되는 간접광 프로브(브릭 하나에 4×4×4=64개), URP 지원 | 3D 지형·소품 위 간접광. 픽셀 캐릭터를 월드 조명에 붙이는 기반 | 상 | https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/changedensity · https://unity.com/blog/engine-platform/new-ways-of-applying-global-illumination-in-unity-6 · https://learn.unity.com/tutorial/adaptive-probe-volumes |
| URP 볼류메트릭 안개·광선 | **공식 URP 내장 볼류메트릭 안개와 그 로드맵은 이번 검색에서 찾지 못했다**(Unity 6 GI 블로그의 볼류메트릭 안개 연동은 HDRP 기준). 오픈소스 CristianQiu Unity-URP-Volumetric-Light(메인·스폿·점광원, Unity 6 Render Graph 지원)와 유료 에셋이 대안 | "안개" 목표의 핵심 기술 공백. 도입 여부·라이선스는 매뉴얼 단계에서 총괄이 판단 | 중 | https://github.com/CristianQiu/Unity-URP-Volumetric-Light |
| Fontainebleau·Spaceship 데모(Unity 공식) | Fontainebleau: 포토그래메트리 에셋, 바람 Shader Graph, 접촉 그림자, 볼류메트릭 안개. Spaceship: VFX Graph로 AAA급 인터랙티브 이펙트 | **둘 다 HDRP**이고 Fontainebleau는 2020.1부터 업데이트 중단. URP에 그대로 못 옮기므로 기법만 참고 | 하~중 | https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@16.0/manual/HDRP-Sample-Projects.html |

찾지 못한 것(지어내지 않음): Hades·Tunic·Sekiro의 렌더·임팩트 전용 GDC 강연, D4 VFX 전용 GDC 강연(GDC 2024 "Embracing Art Performance on Diablo IV"는 제목만 확인), Blasphemous 2 광원 제작 자료, Hyper Light Drifter 제작 자료, t3ssel8r 본인 영상의 정확한 URL, URP 공식 볼류메트릭 안개 로드맵.

## 3. 다음 할 일 (총괄 배정용)

1. Mac 브라우저(원문 열람 가능)에서 위 링크 원문을 열어 단일 출처 항목을 2출처로 확정하거나 지운다. 특히 Yellow Sky 엔진(Steam 시스템 요구·개발자 Q&A), PoE2 강연 영상, NRftW 80.lv 원문.
2. 1~5순위를 방향 전환 문서의 연구 형식("무엇을 → 왜 → 어떻게 만들었나 → 우리 Unity에서 같은 결과 → 도구·방식 결정안")으로 개별 문서화한다. D4·PoE2·팬텀블레이드는 이미 배정된 파일(`D4_STUDY/`, `GAME_STUDY/poe2.md`, `GAME_STUDY/phantom_blade_zero.md`)에 넣고, Yellow Sky는 `GAME_STUDY/downfall_of_yellow_sky.md`로 새로 만든다.
3. 클라우드 세션에서 원문을 열려면 사용자가 환경 네트워크 설정에서 해당 도메인을 허용해야 한다(이번에는 허용 요청 없이 검색 요약만 사용).
