# 세계관 인트로 v6 — 전체 29언어 선택형 자막

> **2026-09-09 현행 언어 계약:** Steam 31개 항목은 지역 공통 번역을 포함한 내부 29개 언어(말레이어 ms 추가)로 처리한다. 세계관 29×32=928큐·SRT/VTT 총58개, 캐릭터 서사 28개 번역 언어에 KO 기준 21+18문장을 적용한다. UI779키 등록, MAIN13,300개·EXTRA1,782개·성장화면3,699개 번역 보완 및 29언어 화면 검증을 완료했다. [구현 상태·검증 기록](../16번역·로컬라이제이션/STEAM_LANGUAGE_SCOPE_20260909.md)이 과거 완료 기록보다 우선한다.

사용자 요청: “자막 국가별 올 번역작업들어가자”. 범위는 현재 index.html 세계관 인트로 전체 대사이며 영어 보이스·영상 연출·금속 타이틀·BGM은 유지한다. 국가 자동 추측이 아니라 사용자가 선택한 게임 언어를 따른다. 1차 번역·런타임 적용 완료, 출시용 원어민 감수는 미완료다.

## 파일·재생 계약

| 항목 | 현행 값 |
|---|---|
| 영상 | `video/world_intro_v13_exodus_en.mp4`, 32,381,760바이트 |
| 규격 | H.264/AAC, 1280×720, 24fps, 2719프레임, 영상 113.291667초 / 컨테이너 113.292초 |
| 원본 복원 | v10 전통 마법 합본의 전체 영상 비트스트림·2719프레임 보존. v11의 마지막 C14 73프레임 삭제를 취소하고 기존 로고 시점 109.291667초로 복원. B04 초능력/마법 각 3초 및 큐1~30 유지 |
| 지옥문 | 12.75~17.291667초, 원본 96프레임 → 109프레임, 영상만 109/96 배율 |
| 타이틀 | [v7 단독 로고](WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md), 109.291667~113.291667초. 기존 EXODUSER 원본만 중앙 표시, HELL ROAD 제거 |
| 음성 | v10 마법사 대사 이동·이전 내레이션 유지. 마지막 문장은 ElevenLabs 동일 보이스로 2.8초 SSML 쉼을 포함해 한 번에 생성, 105.927초에 연속 배치. 내부 분할·타임스트레치 없음. [v12 검수](WORLD_INTRO_V12_FULLSCENE_NEWVOICE_20260907.md) |
| 자막 데이터 | `world-intro-subtitles-data.js` → `WorldIntroSubtitleData`, version v13, languages/timings/sourceGroups |
| 자막 제어 | `world-intro-subtitles.js` → `WorldIntroSubtitles.attach/resolveLanguage/normalizeLanguage`. index.html `_worldIntroSubtitles`가 setLanguage/disable 호출, video.dataset.subtitleLanguage에 선택 코드 기록 |
| 표시 | 브라우저 네이티브 TextTrack + VTTCue. 선택 언어만 showing, 나머지는 disabled. 최초 선택 때 해당 트랙 생성, WeakMap으로 비디오별 재사용 |
| 타이밍 | 원문 38개를 32개 표시 큐로 구성. 원문38만 큐31(우리는 그들을…)과 큐32(엑소듀서라 부른다.)로 분할, 마지막 sourceGroups [38] 두 번 유지. v12는 마지막 두 큐 시각만 재녹음에 맞춤, 큐1~30 내용·시각 보존 |
| 자막 수 | 29언어 × 32큐 = 928개. 한국어 원문·영어 승인 녹음 원고 포함, 나머지 27언어 번역 |
| 스타일 | Noto Serif / Noto Serif KR / serif, weight 500, clamp(32px,5.4vh,50px), 아이보리 #eee5d5, background transparent. 4방향 1px 검정 윤곽 + 2중 부드러운 그림자. align center / size 84 / snapToLines true / line -3 / position 50 / positionAlign center 유지. 언어별 서체·그림자 수치는 아래 표 |
| RTL | 아랍어 트랙 언어 ar, 네이티브 WebVTT의 BiDi/글자 결합 사용. 게임 HUD·로비 전체 RTL 개편은 범위 밖 |
| 선택 UI | 영화 중 cinLang 표시. 마우스 및 기존 패드 좌우 언어 팝업으로 변경. 자막 변경은 영상·BGM의 play/pause/currentTime을 건드리지 않음 |
| 언어 코드 | pt 및 pt-* → ptbr; zh-TW/HK/MO/Hant → zht; zh-CN → zh; nb/nn → no; 지원 안 되는 코드 resolve=null, 자막 fallback=en |
| 선택 우선순위 | URL lang → 저장 hellLang → Steam → 브라우저 → en. 기존 pt 저장도 ptbr로 해석. Steam portuguese/brazilian/brazilianportuguese 모두 ptbr, malay는 ms |
| 코드 보정 | _I18N_SUPPORTED의 pt를 실제 드롭다운 코드 ptbr로 일치. setUserLanguage가 재생 중 자막만 변경 |
| 종료 | stopWorldIntro에서 모든 자막 트랙 disabled. 재진입 시 같은 트랙 재사용. 로고 위 큐32는 109.600~111.100초 표시하고 이후 끝까지 활성 큐 없음 |
| 별도 납본 | `video/subtitles/world_intro_v6_<code>.srt` 및 .vtt, 29개씩 총 58개. 런타임 JS와 내용·시각 동일 |
| 편집 소스 | output/cinematic/world_intro_v12_audio_recipe.py; v10 source.mp4 영상 스트림 복사 + 연속 신규 음성 합성. 기존 v11 편집 파일은 폐기 이력 |
| 백업 | `output/cinematic/index_before_world_intro_v6_subtitles_20260907.html`, v3/v4/v5 MP4 보존 |
| 캐시 | player: 20260907-v12-fullscene-newvoice, subtitle data: 20260907-v13-exodus-ko-escape, subtitle controller: 20260907-v6-cinema-size |
| 범위 밖 | game.html 전쟁 복수 서사, 국가별 보이스 재녹음, 계정 데이터 변경, 배포·커밋 |

## 영화 자막 크기·위치 조정 (2026-09-07)

사용자 요청: 자막을 위로 올리고 약 2배 확대. 영상·영어 보이스·BGM·번역 문장·표시 시각은 변경하지 않는다. 별도 SRT/VTT는 텍스트·시각 납본 그대로이며 아래 스타일은 인게임 네이티브 자막에 적용된다.

| 항목 | 현행 값·의도 |
|---|---|
| 폰트 배율 | 기존 대비 정확히 2배: 최소 32px / 5.4vh / 최대 50px |
| 해상도 표본 | 800×450: 32px, 1280×720: 38.88px, 1920×1080: 50px |
| 수직 앵커 | snapToLines=true, line=-3. 기존 line=-2보다 한 줄 위로 이동. 확대된 글자의 줄 높이에 맞춰 브라우저가 배치하며 하단 여백은 줄 수·해상도에 따라 달라짐 |
| 수평 앵커 | position=50, positionAlign=center, align=center. size=84% 안에서 가운데 정렬·자동 줄바꿈 |
| 검증 스크립트 | `tmp/verify_world_intro_subtitle_size.py`: 3해상도 × 한국어·영어·독일어·아랍어·태국어 5표본, 실제 VTTCue 위치 속성·페이지 오류 검사 |
| 화면 증빙 | `output/cinematic/subtitles_v6_cinema_<width>_<code>.png` 15개 |
| 최종 검수 | 크기·위치 브라우저 검사 15표본 PASS, pageerror 0. 1280 한국어·아랍어 중앙 정렬과 800 영어 2줄 전체 문장 직접 확인. 전 언어 전 문장 시각 검수는 아님 |
| 배치 검토 | 퍼센트 위치 후보는 폐기. 실제 Chromium 내부에서 white-space:pre 및 translate(-8%,-88%)가 생겨 긴 영어 문장 잘림·왼쪽 치우침 확인. 줄 단위 배치는 transform 없이 left 8% / width 84%, 800×450 영어 긴 문장 2줄로 정상 표시 |

## 언어별 상태

### 다크 판타지 영화 자막 스타일 (2026-09-07)

사용자 요청 “자막스타일좀 못주나”. frontend-design 스킬의 절제된 타이포그래피 방향을 적용해 네이티브 자막의 검은 사각 배경을 제거하고 아이보리 명조/세리프로 변경했다. 영상·음성·번역·32큐 시각·글자 크기·줄 단위 위치 앵커는 그대로다. 폰트별 실제 줄 높이/픽셀 위치는 브라우저 글꼴 메트릭을 따른다.

| 항목 | 현행 값 |
|---|---|
| 기본 서체 | 'Noto Serif','Noto Serif KR',serif; font-weight 500 |
| 언어별 우선 서체 | ja=Noto Serif JP / zh=Noto Serif SC / zht=Noto Serif TC / ar=Noto Naskh Arabic / th=Noto Serif Thai. 뒤에 Noto Serif, serif 폴백 |
| CSS 적용 | #worldIntroVideo::cue 및 #worldIntroVideo[data-subtitle-language="코드"]::cue. 기존 data-subtitle-language 사용, 새 트랙/DOM 오버레이 없음 |
| 색·배경 | color #eee5d5 / background transparent |
| 얇은 윤곽 | text-shadow 1px 0 0, -1px 0 0, 0 1px 0, 0 -1px 0; 각각 rgba(0,0,0,.95) |
| 부드러운 그림자 | 0 2px 4px rgba(0,0,0,.85), 0 0 12px rgba(0,0,0,.65) |
| 유지 | clamp(32px,5.4vh,50px), line -3 / snapToLines true / position 50 / positionAlign center / align center / size 84. 번역·타임코드·56개 SRT/VTT 변경 없음 |
| 폰트 공급 | index.html에 이미 있던 Google Fonts import 재사용. 새 다운로드/추가 외부 의존성 없음, 네트워크 미사용 환경은 serif 폴백 |
| 회귀 | 스타일 변경 당시 검사 RED 1건 확인 후 GREEN. 자막9 + 플레이어12 + 캐릭터자막2 + 로그인전환2 = 25 PASS |
| 브라우저 | tmp/verify_world_intro_subtitle_size.py: 1280×720 / 1920×1080 / 800×450 × ko/en/de/ar/th 15표본 PASS, pageerror 0, 32큐·위치 속성 유지 |
| 증빙 | output/cinematic/subtitles_serif_<width>_<lang>.png 15개. 1280 한국어/아랍어, 800 영어 2줄을 직접 확인. 전체 28언어·전 문장 시각 검수는 아님 |

## 언어별 번역 상태

| 코드 | 언어 | 큐 | 상태 |
|---|---|---:|---|
| ko | 한국어 | 32 | 원문 보존 / 런타임 확인 |
| en | 영어 | 32 | 승인 영어 원고 보존 / 런타임 확인 |
| zh | 중국어 간체 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| zht | 중국어 번체 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| ja | 일본어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| es | 스페인어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| fr | 프랑스어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| de | 독일어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| ptbr | 브라질 포르투갈어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| it | 이탈리아어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| ru | 러시아어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| uk | 우크라이나어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| pl | 폴란드어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| cs | 체코어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| hu | 헝가리어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| ro | 루마니아어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| bg | 불가리아어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| el | 그리스어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| tr | 튀르키예어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| vi | 베트남어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| th | 태국어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| id | 인도네시아어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| ms | 말레이어 | 32 | 2026-09-09 1차 번역·추가, 원어민 감수 전 |
| ar | 아랍어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| sv | 스웨덴어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| da | 덴마크어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| no | 노르웨이어 보크몰 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| fi | 핀란드어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |
| nl | 네덜란드어 | 32 | 1차 번역, 원어민 감수 전 / 런타임 확인 |

## 원문·타이밍 SSOT

| id | 원본 큐 | 시작 | 종료 | 한국어 | 영어 녹음 원고 |
|---|---|---:|---:|---|---|
| 1 | 1+2 | 0.080 | 2.940 | 우주에는 셀 수 없는 세계가 있다. | There are countless worlds in the universe. |
| 2 | 3 | 4.122 | 7.042 | 어딘가에선 우주가 태어나고, | Somewhere, a universe is born. |
| 3 | 4 | 7.042 | 9.922 | 어딘가에선 또 하나의 우주가 스러진다. | Elsewhere, another fades away. |
| 4 | 5 | 9.922 | 12.762 | 탄생과 소멸에는 끝이 없건만… | Birth and death know no end... |
| 5 | 6 | 12.762 | 16.402 | 잔혹하게도, 지옥은 단 하나뿐이다. | Yet, cruelly, there is but one Hell. |
| 6 | 7 | 17.402 | 20.622 | 누가 정한 섭리인지, | Who ordained this law, none can say. |
| 7 | 8+9 | 21.262 | 24.182 | 죄를 지은 모든 생명은 제 안의 악의와 함께… | All who have sinned, with the malice they bear... |
| 8 | 10 | 24.182 | 26.962 | 단 하나의 지옥으로 흘러든다. | are drawn into a single Hell. |
| 9 | 11+12 | 27.932 | 30.832 | 누구나 마음 깊은 곳에선 그 존재를 알고 있다. | Deep within us all, we know it exists. |
| 10 | 13 | 30.832 | 33.632 | 강물이 낮은 곳으로 흐르듯, | As rivers flow to lower ground, |
| 11 | 14 | 33.632 | 36.072 | 끝없이 아래로만 향하는 힘. | a force descends without end. |
| 12 | 15 | 36.452 | 38.132 | 오직 파괴만을 갈망하는 그 힘이 | Craving only destruction, |
| 13 | 16 | 38.132 | 42.352 | 흐르고, 쌓이고, 끝내 고이는 곳… | it flows, gathers, and finally pools... |
| 14 | 17 | 42.352 | 45.452 | 지옥이라 불리는 곳이다. | in the place called Hell. |
| 15 | 18+19 | 46.472 | 50.632 | 그 깊은 곳에 가라앉은 영혼은 돌아갈 길을 잃고… | The souls that sink into those depths lose their way back... |
| 16 | 20 | 50.632 | 54.252 | 다시 태어날 기회마저 빼앗긴다. | and are robbed of even the chance to be reborn. |
| 17 | 21 | 56.632 | 58.632 | 시간은 의미를 잃고, | Time loses all meaning, |
| 18 | 22 | 58.832 | 61.512 | 고통만이 육체에 스며들고, | and suffering alone seeps into the flesh. |
| 19 | 23+24 | 62.112 | 64.512 | 그들은 제 안의 파괴적 에너지 그대로… | The very destructive energy within them... |
| 20 | 25 | 64.512 | 68.452 | 고통의 형상으로 잉태된다. | gives them form as incarnations of agony. |
| 21 | 26+27 | 69.502 | 74.142 | 지옥의 모든 괴물은… 한때, 어딘가의 누군가였다. | Every monster in Hell... was once someone, somewhere. |
| 22 | 28 | 76.532 | 79.432 | 지옥은 시대를 묻지 않는다. | Hell does not ask what age you came from. |
| 23 | 29 | 80.472 | 82.472 | 검을 쥔 자도, | Those who held a blade. |
| 24 | 30 | 82.652 | 83.972 | 강철의 몸을 가진 자도. | Those born of steel. |
| 25 | 31 | 84.972 | 87.252 | 초능력을 지닌 자도, | Those with psychic powers. |
| 26 | 32 | 87.889 | 89.729 | 마법의 극에 닿은 자도. | Those at the pinnacle of magic. |
| 27 | 33 | 90.902 | 93.622 | 모두가 뒤엉킨 단 하나의 구덩이. | All intertwined within a single pit. |
| 28 | 34+35 | 95.902 | 100.322 | 서로를 겨누는 그들이 원하는 것은… 단 하나. | Those who turn their weapons on one another desire only one thing. |
| 29 | 36 | 100.322 | 101.682 | 탈출. | Exodus. |
| 30 | 37 | 102.972 | 105.232 | 추락에 맞서는 자들. | Those who defy the fall. |
| 31 | 38 앞절 | 106.020 | 109.292 | 우리는 그들을… | We call them… |
| 32 | 38 이름 | 109.600 | 111.100 | 엑소듀서라 부른다. | Exoduser. |

## 검수

| 항목 | 결과 |
|---|---|
| 테스트 주도 개발 | 데이터 부재·clean 소스 미연결 테스트 실패를 먼저 확인 후 구현 |
| 단위 검사 | 플레이어12 + 자막10 + 캐릭터자막2 + 로그인전환2 = 26 PASS. 28언어/32큐/원문38개 보존/시간 경계/폴백/지역 코드/영상 경로/56개 자막 파일 데이터 일치 및 영화 자막 스타일·크기·위치 검사 |
| 무자막 영상 | 2719프레임/113.291667초, H.264/AAC. v10과 영상 비트스트림 SHA-256 동일, 새 연속 테이크 AAC 변환 후 상관계수 0.999820369. 자막은 별도 TextTrack |
| 실제 브라우저 | tmp/verify_world_intro_ingame.py로 v12 전체 길이, 복원된 마지막 장면 108.5초, 110초 28언어 큐32·로고 동시 표시, 112초 자막 비표시, BGM 연속성 및 종료를 확인. v6 당시 전체 큐 검수는 보존 이력 |
| 전체 재생 회귀 | `tmp/verify_world_intro_ingame.py` v12 PASS. 문→영화 같은 BGM pause/seek 0, 본편 1.327481초에 음악 9.427483초 유지. 믹스·정지/재개·컷 넘김·자연 종료·재진입·ESC 스킵·시청 플래그 비기록 확인, pageerror 0 |
| 시각 검사 | `output/cinematic/subtitles_v6_<code>.png` 28개 표본. 영어·태국어·아랍어 대표 화면 직접 확인, 글리프·RTL 결합·한글 이중 자막 없음 |
| 한계 | 1차 AI 번역이며 원어민 감수·전 문장/전 해상도 시각 검수는 아님. 별도 headless Chromium 사용, 사용자 실제 스피커 감상 아님 |

영상 편집 워크플로로 승인된 원본을 복원했고, 테스트 주도 개발·웹 테스트 스킬로 자막 누락과 재생 위치 보존을 확인했다. v6 당시 별도 폰트 구매·다운로드나 새 AI 영상/음성 생성은 하지 않았다. v10은 마법사 영상만 새로 생성했으며 음성은 재생성하지 않았다. 라이브 편집기 도구는 제공되지 않아 로컬 MP4와 편집 스크립트를 유지한다.

[현행 무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/b81e24e7-048b-461f-8d37-72c4f3733c1b.mp4)
