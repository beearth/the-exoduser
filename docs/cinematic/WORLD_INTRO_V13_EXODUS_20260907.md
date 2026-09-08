# 세계관 인트로 v13 — Escape → Exodus

2026-09-07 사용자 요청: “이스케이프 라는 단어가 나오는데 탈출 이걸 엑소더스 로 바꿀수없나”. 단순 도주보다 집단적인 탈출을 연상시키는 Exodus로 영어 발화를 변경하고, 한국어 표시도 엑소더스로 맞췄다. 마지막 명칭 Exoduser는 별개의 단어이며 변경하지 않았다. 후속 요청 “해방이거나 적용시켜”에 따라 한국어 표시는 해방으로 정정했다. 영어 음성·자막은 Exodus 그대로 유지한다. 이후 “영어 뜻에 맞긴해야겠지 탈출로 하지머”라는 최종 요청에 따라 KO 큐29는 탈출.로 확정했다. 해방 표기는 이전 변경 이력이다.

## 현행 계약

| 항목 | 값 / 범위 |
|---|---|
| 게임 영상 | video/world_intro_v13_exodus_en.mp4, 32,381,760바이트 |
| 원본 | v12 전체 영상 복원·마지막 연속 음성 버전. 이전 파일 모두 보존 |
| 규격 | H.264/AAC 192k, 1280×720, 24fps, 2719프레임, 영상 113.291667초 / 컨테이너 113.292초 |
| 화면 | 원본 영상 스트림 그대로 복사, 프레임 삭제/변속/로고 재편집 없음. C14와 로고 109.291667~113.291667초 보존 |
| 변경 대사 | 원문36 / 표시 큐29: EN Exodus. 유지 / KO 탈출. (최종 사용자 확정, 이전 해방. 표기 교체) |
| 큐29 시각 | 100.322~101.682초 그대로 |
| 한국어 후속 정정 | KO 큐29만 탈출.으로 변경, video/subtitles/world_intro_v6_ko.srt/.vtt 동기화. EN Exodus.·다른 26언어·영상/음성 파일·스타일·시각 변경 없음. 새 음성 생성 요청 없음 |
| 후속 검증 | 한국어 기대값 탈출.으로 RED 1건 확인 후 26 PASS. 로컬 3333 서버의 실제 HTML 캐시 키와 자막 데이터에서 KO 탈출. / EN Exodus. / [100.322,101.682] 확인. 이 정정에서는 브라우저 스크린샷을 다시 촬영하지 않았으며 아래 기존 화면 증빙은 엑소더스 표기 시점 이력 |
| 다른 언어 | 나머지 26언어의 기존 탈출 의미 번역 유지. 이번 요청은 영어 단어 선택과 한국어 표기에 한정, 28언어 전체 재번역 아님 |
| 마지막 호명 | 큐31 106.020~109.292초 / 큐32 109.600~111.100초 및 v12 We call them … Exoduser 연속 테이크 보존 |
| 자막 파일 | world-intro-subtitles-data.js version v13. 한영 SRT/VTT 4개 문구 수정, 전체 56개와 런타임 일치. 원문38/표시32/28언어 유지 |
| 캐시 | 자막 데이터 20260907-v13-exodus-ko-escape. player 20260907-v12-fullscene-newvoice / subtitle controller 20260907-v6-cinema-size 유지 |
| 기타 보존 | 아이보리 명조체/투명 배경/얇은 윤곽 자막, 위치·크기, 문→본편 BGM 연속, 종료 후 로그인 로고 중복 숨김 |

## 음성 제작·검증

| 항목 | 값 / 검사 |
|---|---|
| 생성 | ElevenLabs 동일 voice_id WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2, 성공 생성 1회 |
| 설정 | stability .65 / similarity_boost .8 / style .15 / use_speaker_boost true / mp3_44100_128 |
| 원고 | output/cinematic/world_intro_v13_exodus_line.txt: Exodus. |
| 소스 | output/cinematic/world_intro_v13_exodus_en.mp3, 15,926바이트, PCM 0.9288125초 @48kHz stereo |
| 경계 확인 | 기존 앞 문장 발화 끝 약 100.02248초, Escape 발화 약 100.83915~101.27883초. 100.25~102초만 교체 |
| 삽입 | 새 완전한 단어 테이크 100.800초 시작~101.7288125초 끝. 마지막 약 .249초는 무음 꼬리. 내부 절단·속도·피치 변경 없음 |
| 음량 | 기존 Escape active RMS에 맞춘 gain 1.1827717877535022, 외곽 입구 1ms/출구 10ms 페이드. 앞뒤 원본 PCM 유지 후 AAC 재인코딩 |
| 영상 동일성 | source/final SHA-256 ca1a74ed610b092e8c230af28c9ce7e616b50dfd475ae4503395a371a2b648c9 동일 |
| 음성 QA | 새 단어 AAC 후 상관계수 0.9999603362395778 / 보존한 마지막 105~111초 0.9997673422811322 |
| 제작 위치 | Higgsfield 원격 sandbox. audio_recipe.py의 ffmpeg -c:v copy로 원본 영상 보존, 편집 프로젝트는 완성 MP4 전체를 단일 clip으로 참조 |
| 재현 | output/cinematic/world_intro_v13_audio_recipe.py / world_intro_v13_edit.jsx / world_intro_v13_project.zip |
| QA | output/cinematic/world_intro_v13_qa.json |
| 미리보기 | output/cinematic/world_intro_v13_exodus_preview.mp4, C13 95.791667초부터 7초. 무자막 영어 미리보기이며 인게임은 선택 자막과 별도 BGM 포함 |
| 테스트 | 버전·한영 단어·새 영상 경로로 기존 v12 실패 확인 후 수정. 플레이어12 + 자막10 + 캐릭터자막2 + 로그인전환2 = 26 PASS |
| 브라우저 | tmp/verify_world_intro_ingame.py PASS: 실제 v13 113.291667초 재생, 100.9초 한영 Exodus 자막, 마지막 28언어 큐32·로고, 문→본편 BGM pause/seek 0, 정지/재개·믹스·컷 넘김·종료·재진입·ESC, pageerror 0 |
| 화면 증빙 | output/cinematic/world_intro_v13_exodus_ko_ingame.png / world_intro_v13_exodus_en_ingame.png. 새 명조체 스타일·단어 표시 직접 확인 |
| 한계 | 파형·영상 동일성·재생 검증이며 실제 스피커 청취/최종 음색 승인 아님. fable_editor 도구가 없어 라이브 편집기 링크 대신 MP4/파일 기반 프로젝트 납본 |

[전체 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/b81e24e7-048b-461f-8d37-72c4f3733c1b.mp4) · [Exodus 구간 미리보기](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/7936fa5e-2787-49bc-bf70-facd0c37140f.mp4)
