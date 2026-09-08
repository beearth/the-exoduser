# 세계관 프롤로그 영상 4컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 완료, 사용자 승인 대기, 게임 미적용.

## 사용자 확정 방향

앞 컷의 '단 하나의 지옥으로 흘러든다' 다음 장면. 사용자는 '하나의 길' 설명이 앞 대사와 겹친다고 지적했고, 지옥을 무의식적으로 아는 공간이자 파괴적인 힘이 아래로 흘러 쌓이는 공간으로 묘사했다. 아래 다듬은 대사를 승인하고 영상 제작을 요청했다.

새 영상 A04는 기존 콘티 A05(석문 외부)를 그대로 영상화한 컷이 아니다. 기존 p02 원화의 하강·수렴 구도를 참조한 새 대사 컷이다. 원래 게임 대사와 WORLD_CORE의 에너지 법칙은 이번 검수 제작에서 변경하지 않는다. '고임'은 축적의 비유이며 악의의 작동 중단을 뜻하지 않도록 계속 유입되는 영상으로 계획한다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 누구나 마음 깊은 곳에선 | Deep within us all, |
| 2 | 그 존재를 알고 있다. | we know it exists. |
| 3 | 강물이 낮은 곳으로 흐르듯, | As rivers flow to lower ground, |
| 4 | 끝없이 아래로만 향하는 힘. | a force descends without end. |
| 5 | 오직 파괴만을 갈망하는 그 힘이 | Craving only destruction, |
| 6 | 흐르고, 쌓이고, 끝내 고이는 곳… | it flows, gathers, and finally pools... |
| 7 | 지옥이라 불리는 곳이다. | in the place called Hell. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p02.jpg |
| 원화 관찰 | 여러 세계 사이의 거대한 깔때기형 심연, 하단의 진홍 균열 |
| 계획 연출 | 미세한 재·붉은 흐름이 계속 하강, 일부 잔해가 재로 분산, 깊은 검은 웅덩이에 유입·축적. 폭발·상향 분출·문·다리 없음 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 12, 16:9, std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, cfg_scale 0.5 |
| 프리셋 | IN THE DARK 자동 추천 미적용. 기존 콘티 중심 제작 방식 유지 |
| 비용 사전 조회 | 12크레딧 |
| 영상 job | 99373ff4-f2d0-4063-afc5-94fdb3b3e8af |
| 원화 media_id | 85f37066-d209-43e4-8912-328a9d652ef5 |
| 음성 도구 | 기존 tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a04_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·실측 길이 | 278,404바이트 / 17.371429초 |
| 음성 media_id | 8460e9a2-5b32-4b28-95a3-b73bf02b012b |
| 초기 자동 검수 | faster-whisper small, 단어별 시각, script similarity 1.0, 33단어 전체 일치 |
| 편집 계획 | 최종 18.5초. 음성 시작 0.45초, 속도·피치 유지. 영상만 느리게 리타이밍하고 blend 방식으로 24fps 보간 |
| 자막 | 앞 컷과 같은 clean 하단 중앙 흰색·검정 외곽선. Whisper 시각에 한국어 구절 매핑 |
| 오디오 구성 | 내레이션만, 음악·효과음 추가 없음 |
| 게임 적용 | 없음. 사용자 승인 후 다음 컷 진행 |

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 누구나 마음 깊은 곳에선 | 0.450초 | 1.910초 |
| 그 존재를 알고 있다. | 1.950초 | 3.230초 |
| 강물이 낮은 곳으로 흐르듯, | 3.730초 | 5.950초 |
| 끝없이 아래로만 향하는 힘. | 5.950초 | 8.130초 |
| 오직 파괴만을 갈망하는 그 힘이 | 8.790초 | 10.450초 |
| 흐르고, 쌓이고, 끝내 고이는 곳… | 10.790초 | 14.330초 |
| 지옥이라 불리는 곳이다. | 14.330초 | 17.570초 |

자동 인식은 발음·음색·연출에 대한 사용자 청취·영상 승인을 대체하지 않는다.

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 12.042초 |
| 합본 파일 길이 | 18.500초 |
| 영상 리타이밍 배율 | 1.5362896528815813 |
| 보간 | ffmpeg minterpolate, fps 24, mi_mode blend. 음성에는 속도·피치 처리 없음 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상 18.375초, 오디오 18.500초. 차이 0.125초로 0.2초 이내 |
| 음성 종료 보존 | 원본 17.371429초 + 시작 지연 0.450초 = 17.821429초로 영상 끝 이전에 전체 보존 |
| 로컬 합본 | output/cinematic/a04_v1_en_ko.mp4 |
| 로컬 자막 | output/cinematic/a04_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a04_v1_visual_check.jpg |
| 자막 렌더러 | Higgsfield subtitles bundled audio_to_captions.py + burn_caps_clean.sh |
| 최종 자동 인식 | faster-whisper small, script similarity 1.0, timed_words=33, caption_words=33, 영어 원고 전체 정규화 일치 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 앞 컷과 같은 하단 중앙 흰색·검정 외곽선 |
| 자막 유지 | Whisper 시각 + 시작 지연 0.450초. 발화 후 최대 0.300초, 다음 구절 시작을 넘지 않음 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS, clean/final 파일 길이 차이 0초 |
| 자막 화면 검수 | 1.1667 / 2.5833 / 4.8333 / 7.0417 / 9.6250 / 12.5417 / 15.9583초에서 일곱 구절 정상 표시·잘림 없음 |
| 검수표 주의 | 2×4 검수표의 8번째 빈 칸은 녹색으로 출력됨. 실제 영상 프레임이 아닌 타일의 빈 칸이며 영상 합본에 삽입되지 않음 |
| 실제 화면 관찰 | 원화의 하단 균열이 붉은 테두리를 가진 넓은 검은 심연으로 커짐. 주변 흐름이 중심으로 모이는 구도, 세계 구체 및 붉은 흐름의 변화 확인 |
| 연출 승인 | 검은 심연은 추상적인 축적 표현이다. 물처럼 고이는 느낌과 하강 움직임의 충분성은 사용자 영상 검수 대기 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스는 수정하지 않음. 새 검수 파일만 추가 |

[4컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/923157ab-65b6-40d2-b159-8a0422ffe48c.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ec9f96b3-1452-461f-ab80-a23629c94d1c.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_154218_99373ff4-f2d0-4063-afc5-94fdb3b3e8af.mp4)

[제작 자료 ZIP — 원본·음성·합본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/abd8302b-c8d2-4b5a-bd4d-c81c2ff3d0dd.zip)
