# 세계관 인트로 v8 — 마지막 호명 대사

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자 확정: “우리는 그들을 엑소듀서라 부른다.” 영어 음성은 “We call them Exoduser.”로 변경. 앞 대사 “Those who defy the fall.”는 보존한다.

| 항목 | 현행 값 |
|---|---|
| 적용 | index.html → video/world_intro_v8_we_call_en.mp4, 32,340,406바이트 |
| 규격 | H.264/AAC, 1280×720, 24fps, 2719프레임; 영상 113.291667초 / 음성 113.291000초 |
| 생성 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability 0.65 / similarity_boost 0.8 / style 0.15 / speaker boost true |
| 원음 | output/cinematic/world_intro_v8_final_line_en.mp3, 27,211바이트, MP3 44100Hz/128kbps/mono |
| 편집 | Higgsfield sandbox ffmpeg 오디오 편집; 영상 -c:v copy, AAC 192k/stereo/48000Hz |
| 기존 마지막 말 제거 | 105.000~108.791667초. 앞 문장 뒤 무음에서 절단; 기존 마지막 문장 발화는 약 105.304초부터 |
| 새 음성 | 105.332초 시작, 디코딩 길이 1.625416667초, gain 0.843911060862. 속도·피치 변경 없음, 입구 5ms/출구 10ms fade |
| 자막 | 통합 큐 31 / 원본 큐 38, 105.332~107.592초. 28언어 마지막 문장만 1인칭 복수로 개정 |
| 데이터 | world-intro-subtitles-data.js version v8; cache 20260907-v8-we-call |
| 납본 | video/subtitles/world_intro_v6_<code>.srt/.vtt 56개는 기존 호환 파일명 유지, 내용은 v8과 동일 |
| 보존 | 앞 30큐/대사, 모든 영상 프레임, 109.291667~113.291667초 EXODUSER 단독 로고, BGM 독립 재생, 자막 크기·위치 |
| 영상 비트스트림 SHA256 | e87846e184787f9e09f43381b1e8773003a4a48482933f753de9f1a3b77e0be3, v7/v8 동일 |
| 앞 음성 검증 | 0~104.9초 PCM 상관계수 0.999961066177. AAC 재인코딩으로 압축 바이트는 달라짐 |
| 출력 peak | 0.559440135956, 디지털 클리핑 없음 |
| 재현·검수 | output/cinematic/world_intro_v8_audio_recipe.py / world_intro_v8_audio_qa.json |
| 단위 검증 | 플레이어 10 + 자막 7 + 캐릭터 자막 2 = 19 PASS |
| 인게임 검증 | tmp/verify_world_intro_ingame.py PASS: 문→본편 BGM pause 0/seek 0, 28언어 마지막 활성 큐, 타이틀 자막 없음, pause/resume·컷 이동·종료·재진입·ESC 스킵, pageerror 0 |
| 화면 증빙 | output/cinematic/world_intro_v8_final_line_ingame.png / world_intro_v8_title_ingame.png. 한국어 마지막 문장 하단 중앙, EXODUSER 단독 로고 확인 |
| 범위 밖 | 새 그림·영상 생성, 다른 대사 변경, BGM 변경, 캐릭터 스토리 변경, 원어민 번역 감수, 배포·커밋 |

## 최종 문장 번역

| 코드 | 마지막 자막 |
|---|---|
| ko | 우리는 그들을 엑소듀서라 부른다. |
| en | We call them Exoduser. |
| zh | 我们称他们为 EXODUSER。 |
| zht | 我們稱他們為 EXODUSER。 |
| ja | 我々は彼らを、エクソデューサーと呼ぶ。 |
| es | Los llamamos EXODUSER. |
| fr | Nous les appelons EXODUSER. |
| de | Wir nennen sie EXODUSER. |
| ptbr | Nós os chamamos de EXODUSER. |
| it | Noi li chiamiamo EXODUSER. |
| ru | Мы называем их EXODUSER. |
| uk | Ми називаємо їх EXODUSER. |
| pl | Nazywamy ich EXODUSER. |
| cs | Říkáme jim EXODUSER. |
| hu | Mi EXODUSER-nek nevezzük őket. |
| ro | Noi îi numim EXODUSER. |
| bg | Ние ги наричаме EXODUSER. |
| el | Εμείς τους αποκαλούμε EXODUSER. |
| tr | Biz onlara EXODUSER deriz. |
| vi | Chúng ta gọi họ là EXODUSER. |
| th | เราเรียกพวกเขาว่า EXODUSER |
| id | Kami menyebut mereka EXODUSER. |
| ar | نحن نسمّيهم EXODUSER. |
| sv | Vi kallar dem EXODUSER. |
| da | Vi kalder dem EXODUSER. |
| no | Vi kaller dem EXODUSER. |
| fi | Me kutsumme heitä nimellä EXODUSER. |
| nl | Wij noemen hen EXODUSER. |
