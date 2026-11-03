# 세계관 인트로 v11 — 로고와 마지막 호명 동시 표시

> **폐기된 편집 이력:** 사용자가 마지막 영상 잘림과 음성 절단을 지적하여 v11을 교체했다. 현행은 [v13 Exodus](WORLD_INTRO_V13_EXODUS_20260907.md). v10 원본 2719프레임·113.291667초를 모두 유지하고 메시지만 분리한다. 아래 수치와 PASS 기록은 v11 당시 기술 검사이며 사용자 승인 또는 현행 계약이 아니다.

사용자: “위 콜뎀 까지 끈고 나머지는 엑소듀서 로고 나오면 말하는걸로” → “로고랑 엑소듀서라 부른다 같이”.
앞 장면에는 “우리는 그들을…”만 표시하고, EXODUSER 로고가 나타난 뒤 이름 음성과 “엑소듀서라 부른다.” 자막이 함께 나온다. 새로 승인한 B04 초능력 3초·전통 판타지 마법 3초는 유지한다.

## 현행 타이밍 / 구현

| id / 항목 | 값 / 적용 위치 |
|---|---|
| 마스터 | video/world_intro_v11_logo_call_en.mp4, 31,639,407바이트 |
| 규격 | 1280×720, H.264/AAC 192k, 24fps, 2646프레임, 영상·음성 각각 110.25초 |
| 전체 길이 | v10 113.291667초 → v11 110.25초. 마지막 C14 후반 73프레임/3.041667초 제거, 다른 컷 시작점 유지 |
| C14 끝 / 로고 시작 | 106.25초, WorldIntroPlayer.CUTS 마지막 경계. 총 17개 경계 유지 |
| 로고 | 기존 v10의 109.291667~113.291667초 4초 로고를 106.25~110.25초로 앞당김. 디자인·비율·0.75초 등장·3.6초부터 0.4초 퇴장 유지. HELL ROAD 없음 |
| 큐31 | 105.332~106.25초: 우리는 그들을… / We call them… |
| 큐32 | 106.65~107.75초: 엑소듀서라 부른다. / Exoduser. 로고 등장 0.4초 뒤부터 로고와 함께 표시 |
| 로고 단독 유지 | 107.75~110.25초, 자막 종료 후 로고만 남음 |
| 원문 그룹 | sourceGroups 마지막 [38]을 큐31·32 두 번 참조. 원문38 하나를 분할한 것, 새로운 대사 추가 아님. 다른 sourceGroups는 보존 |
| 언어 | 28언어 × 32큐 = 896개, 첫 30큐 문장·시각 보존 |
| 파일 | world-intro-subtitles-data.js version v11; video/subtitles/world_intro_v6_<code>.srt/.vtt 56개 내용·시각 동기화, v6 파일명 호환 유지 |
| 캐시 | world-intro-player.js 및 subtitle data 모두 20260907-v11-logo-call. 자막 controller 20260907-v6-cinema-size 유지 |
| 자막 스타일 | 기존 영화 크기 clamp(32px,5.4vh,50px), line -3 / snapToLines true / position 50 / positionAlign center / align center / size 84 유지 |
| BGM | 문부터 같은 Audio로 연속 재생, 본편 gain 0.22. 마지막 컷 seek에도 음악 pause/seek 없음. 곡·볼륨·믹서 구현 변경 없음 |
| 보존 | v10 마스터·B04 원본·이전 영어 원음·로고 원본 유지. 새 AI 영상·보이스 생성 없음, 배포·커밋 없음 |

## 음성 절단 / 재현

| 항목 | 값 / 근거 |
|---|---|
| 기존 문장 | ElevenLabs 원음 “We call them Exoduser.” 재사용, 피치/속도/목소리 변경 없음 |
| 절단점 | v10 소스 106.09초. 106.066167~106.114271초 저레벨 구간 안에서 절단 |
| 앞절 | 기존 음성을 106.09초까지 유지. 끝 240샘플/5ms fade; 이 직전까지 PCM 완전 동일 |
| 이름 원본 | 106.09~106.95초, 0.86초 (잔향/무음 포함) |
| 이름 배치 | 106.65~107.51초, 지연 0.56초 = 26880샘플 @48kHz |
| 경계 | 이름 입구/출구 각 240샘플/5ms fade. 106.09~106.65초 출력 PCM 무음, BGM은 별도 연속 |
| 내보내기 | AAC 192k stereo 48000Hz 재인코딩. 앞 105.9초 PCM 상관계수 0.99997031 / 이동 이름 0.99995990 / peak 0.55869770 |
| 단어 검사 | faster-whisper base word timestamps와 파형 비교. 전체 문장을 initial_prompt로 주면 절단된 앞절 뒤 이름을 환각 보완하는 현상 확인. 힌트 없는 앞절 인식은 “we call them”, 분리된 이름은 “Exoduser.”. ASR은 청취/발음 최종 승인을 대체하지 않음 |
| 편집 소스 | output/cinematic/world_intro_v11_edit.jsx, Higgsfield higgsedit: source 0~106.25초 + 기존 로고 4초. audio_recipe.py에서 위 이름 이동 후 mux |
| 오디오 레시피 | output/cinematic/world_intro_v11_audio_recipe.py, 원격 Higgsfield sandbox에서 실행. final PCM→AAC 출력 |
| 기술 검수 | output/cinematic/world_intro_v11_qa.json, duration·2646프레임·규격·상관계수·peak |
| 시각 검수 | world_intro_v11_we_call_ingame.png: 앞절만 표시; world_intro_v11_final_line_ingame.png: EXODUSER 로고와 “엑소듀서라 부른다.” 동시 표시; world_intro_v11_title_ingame.png: 이후 자막 없음 |
| 회귀 | TDD: 새 마스터·로고106.25초·32큐 기대값으로 기존 구현 실패 확인 후 구현. 플레이어12 + 자막8 + 캐릭터자막2 = 22 PASS |
| 실제 브라우저 | tmp/verify_world_intro_ingame.py PASS: 110.25초, 앞절→로고/끝말 자막, 28언어 큐32, B04 전환, 문·컷 BGM pause/seek 0, 정지/재개·믹스·종료·재진입·ESC, pageerror 0 |
| 한계 | 별도 headless Chromium 검증. 사용자 스피커로 실제 음색·호흡/음절을 감상한 최종 승인은 아직 없음 |

오디오 디자인 스킬은 기존 목소리와 BGM의 균형을 보존하는 데 적용했고, 체계적 디버깅 스킬에 따라 자막/단어 경계 의심은 파형과 힌트 없는 인식으로 다시 확인했다.

## 마지막 2큐 / 전체 28언어

| 언어 | 로고 전 큐31 | 로고 위 큐32 |
|---|---|---|
| ko | 우리는 그들을… | 엑소듀서라 부른다. |
| en | We call them… | Exoduser. |
| zh | 我们称他们为…… | EXODUSER。 |
| zht | 我們稱他們為…… | EXODUSER。 |
| ja | 我々は彼らを…… | エクソデューサーと呼ぶ。 |
| es | Los llamamos… | EXODUSER. |
| fr | Nous les appelons… | EXODUSER. |
| de | Wir nennen sie… | EXODUSER. |
| ptbr | Nós os chamamos de… | EXODUSER. |
| it | Noi li chiamiamo… | EXODUSER. |
| ru | Мы называем их… | EXODUSER. |
| uk | Ми називаємо їх… | EXODUSER. |
| pl | Nazywamy ich… | EXODUSER. |
| cs | Říkáme jim… | EXODUSER. |
| hu | Mi így nevezzük őket… | EXODUSER. |
| ro | Noi îi numim… | EXODUSER. |
| bg | Ние ги наричаме… | EXODUSER. |
| el | Εμείς τους αποκαλούμε… | EXODUSER. |
| tr | Biz onlara… | EXODUSER deriz. |
| vi | Chúng ta gọi họ là… | EXODUSER. |
| th | เราเรียกพวกเขาว่า… | EXODUSER |
| id | Kami menyebut mereka… | EXODUSER. |
| ar | نحن نسمّيهم… | EXODUSER. |
| sv | Vi kallar dem… | EXODUSER. |
| da | Vi kalder dem… | EXODUSER. |
| no | Vi kaller dem… | EXODUSER. |
| fi | Me kutsumme heitä nimellä… | EXODUSER. |
| nl | Wij noemen hen… | EXODUSER. |

[엔딩 8초 미리보기](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/21fb7c28-42ce-4f3a-9657-b36c599ec781.mp4) · [전체 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/7642b6d6-09a7-4400-b6b8-862130b798c1.mp4) · [편집 프로젝트 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/d5109e1b-35b1-4a0c-bea6-e26c7226cf32.zip)

라이브 fable_editor 도구가 제공되지 않아 MP4와 편집 프로젝트로 납본한다. ZIP의 edit.jsx와 audio_recipe.py를 함께 사용해야 최종 그림/음성 편집이 재현된다.
