# 세계관 인트로 v12 — 전체 영상 복원·마지막 음성 재녹음

> **제작 이력:** 현행은 [v13 Exodus](WORLD_INTRO_V13_EXODUS_20260907.md). v12의 전체 화면·마지막 호명은 보존하고 Escape 한 단어와 한영 큐29만 교체했다. 아래 v12 파일·수치·검사 기록은 보존 이력이며 현행 마스터 경로는 인게임 SSOT를 따른다.

2026-09-07 사용자 정정: “마지막 영상은 다 놔두고 메시지만 나눠야지”, “음성을 자르는게 너무 티난다 다시 녹음”. v11은 원래 C14 후반 73프레임을 삭제하고 이름 음성 조각을 이동했던 잘못된 적용이다. v12는 마지막 장면을 모두 복원하고 새로운 한 테이크 음성을 사용한다. 사용자 기존 파일은 보존하며 커밋·배포하지 않는다.

## 현행 계약

| 항목 | 값 / 적용 |
|---|---|
| 마스터 | video/world_intro_v12_fullscene_newvoice_en.mp4, 32,385,701바이트 |
| 규격 | H.264/AAC 192k, 1280×720, 24fps, 2719프레임, 영상 113.291667초 / 컨테이너 113.292초 |
| 원본 화면 | video/world_intro_v10_traditional_magic_en.mp4 전체 영상 스트림을 재인코딩 없이 복사. 자르기·속도 변경·프레임 보간·로고 재디자인 없음 |
| 마지막 장면 | C14 102.791667~109.291667초, 6.5초 전부 유지. v11이 삭제한 73프레임/3.041667초 복원 |
| 로고 | 기존 EXODUSER 109.291667~113.291667초, 4초 그대로. HELL ROAD 없음. 기존 등장·퇴장 페이드 보존 |
| 이전 B04 | 초능력 84.791667~87.791667초 / 전통 판타지 마법 87.791667~90.791667초, 각 3초 보존 |
| 큐31 | 106.020~109.292초: 우리는 그들을… / We call them… |
| 큐32 | 109.600~111.100초: 엑소듀서라 부른다. / Exoduser. |
| 로고 단독 | 111.100초부터 끝까지 자막 없음 |
| 자막 | WorldIntroSubtitleData version v12; 28언어×32큐. 기존 문구·sourceGroups 유지, 마지막 두 큐 시간만 변경. 원문38의 [38] 그룹 두 번 유지 |
| 별도 자막 | video/subtitles/world_intro_v6_<code>.srt/.vtt 56개, 기존 파일명 호환 유지 |
| 컷 경계 | WorldIntroPlayer.CUTS 마지막 경계 109.291667초로 복원, 나머지 16개 경계 그대로 |
| 캐시 | player/subtitle data: 20260907-v12-fullscene-newvoice. subtitle controller: 20260907-v6-cinema-size 유지 |
| 범위 | index.html 세계관만. game.html 캐릭터 스토리·기존 BGM 재생 계약·자막 크기/위치·언어 선택 유지 |

## 재녹음·합성

| 항목 | 값 / 처리 |
|---|---|
| 생성 | ElevenLabs API tools/elevenlabs_tts.mjs, 성공 요청 1회. voice_id WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2 |
| 설정 | stability 0.65 / similarity_boost 0.8 / style 0.15 / use_speaker_boost true / mp3_44100_128 |
| 원고 | `We call them <break time="2.8s" /> Exoduser.` |
| 원고·소스 | output/cinematic/world_intro_v12_final_line.txt / world_intro_v12_final_line_en.mp3, 75,276바이트 |
| 실제 소스 | MP3 4.675918초, 디코딩 4.644초. 첫 발화 약 0.092948초, 이름 시작 3.67288초, 마지막 발화 끝 4.36163초 |
| 생성된 쉼 | 0.756009~3.67288초. 생성기 자체 쉼을 그대로 사용. 새 테이크 내부 분할·중간 무음 삽입·이름 조각 이동·속도/피치 변경 없음 |
| 배치 | 전체 테이크 시작 105.927초. 첫 발화 약 106.020초, 이름 약 109.59988초, 테이크 끝 110.571초. 로고 등장 약 0.308초 후 호명 |
| 원래 음성 교체 | 기존 v10 PCM의 105.000초 전 구간 보존, 이후 기존 마지막 음성만 지우고 새 연속 테이크 배치. BGM은 원래 별도 Audio로 연속 재생 |
| 레벨 | 기존 마지막 대사 active RMS에 맞춘 gain 0.954011146236429. 소스 바깥 입구 5ms/출구 10ms만 페이드, 내부 쉼·호흡은 보존 |
| 작업 위치 | Higgsfield 원격 sandbox에서 ffmpeg 영상 스트림 복사 + PCM 합성 + AAC 192k 출력 |
| 재현 | output/cinematic/world_intro_v12_audio_recipe.py; source.mp4=v10 마스터, voice.mp3=위 새 테이크. ZIP은 레시피·QA·음성 포함 |

Multilingual v2의 SSML 쉼 지원은 [ElevenLabs 공식 문서](https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses)를 확인했다. 짧은 마지막 한 문장 재녹음이며 새로운 화자나 한국어 더빙 생성은 아니다.

## 검증·산출물

| 검사 | 결과 / 파일 |
|---|---|
| 회귀 RED | v12 파일·109.291667초 로고·v12 자막 계약을 먼저 검사하여 v11에서 4건 실패 확인 |
| 미디어 QA | output/cinematic/world_intro_v12_qa.json: 2719프레임, 113.291667초, 원본 영상 비트스트림 동일 |
| 영상 SHA-256 | 원본·출력 모두 ca1a74ed610b092e8c230af28c9ce7e616b50dfd475ae4503395a371a2b648c9 |
| 새 음성 연속성 | 삽입 PCM이 새 테이크 전체와 동일함을 assert. AAC 변환 후 상관계수 0.9998203690786608 |
| 미리보기 | output/cinematic/world_intro_v12_ending_preview.mp4: C14 시작부터 끝까지 10.5초, 무자막/영어 음성. 인게임은 네이티브 선택 자막·별도 BGM 포함 |
| 자동 검사 | 후속 자막 스타일·로그인 로고 전환 수정 포함: 플레이어12 + 자막9 + 캐릭터자막2 + 로그인전환2 = 25 PASS. 56개 SRT/VTT와 런타임 데이터 일치. v12 영상·음성 파일은 그대로 |
| 브라우저 | tmp/verify_world_intro_ingame.py PASS: 실제 duration 113.291667초, 108.5초 복원 장면, 110초 로고·28언어 큐32, 112초 로고 단독, 정지/재개·믹스·넘김·자연 종료·재진입·ESC·pageerror 0 |
| BGM | 문→본편 같은 Audio 유지, pause 0 / seek 0. 본편 1.327481초일 때 음악 9.427483초, gain 0.6→0.22 부드러운 인계 확인 |
| 화면 확인 | world_intro_v12_restored_scene_ingame.png / world_intro_v12_final_line_ingame.png / world_intro_v12_title_ingame.png 직접 확인. 영상 잘림 없이 마지막 장면→로고/끝말→로고 단독 |
| 한계 | 음성 파형·시각·연속성 기술 검사이며 실제 스피커 전 구간 청취나 사용자의 최종 음색/발음 승인은 아님 |

[전체 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/fa002f6b-d185-4c58-9b47-4eafb603d494.mp4) · [마지막 장면 미리보기](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3aef9a24-13bc-41a2-a654-63e3812fe2fc.mp4) · [재현 패키지](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3edc5583-11bd-4c9d-937f-95c819045fa2.zip)
