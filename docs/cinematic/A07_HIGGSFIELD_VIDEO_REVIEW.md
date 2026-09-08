# 세계관 프롤로그 영상 7컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 및 기술 검수 완료. 사용자 최종 영상 승인 대기, 게임 미적용.

## 승인 대사와 컷 연결

사용자는 '그대로 가도 됄듯'으로 대사와 낡은 장난감을 쥔 손의 연출을 승인했다. 앞 컷의 육체 변형에서 그 괴물의 이전 삶을 암시하는 장면으로 이어진다. 새 영상 A07은 기존 정지 콘티 A10/p09에 대응하며, 기존 게임·정지 콘티 순서는 변경하지 않는다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 지옥의 모든 괴물은… | Every monster in Hell... |
| 2 | 한때, 어딘가의 누군가였다. | was once someone, somewhere. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p09.jpg |
| 원화 관찰 | 거대한 검은 인간형 괴물이 고개를 숙이고 손바닥의 작은 낡은 토끼 인형을 바라봄. 폐허와 잿빛 하늘. 얼굴 대부분은 그림자 |
| 원화와 콘티 차이 | 기존 텍스트의 '녹슨 아이 장난감'은 현재 원화에서 낡은 토끼 인형으로 표현됨. 새로 교체하지 않고 이 원화의 인형을 유지 |
| 연출 계획 | 느린 접근·하향 재구도로 얼굴보다 손·토끼 인형을 강조. 기존 손가락 하나가 수 mm만 인형을 감싸고 멈춤. 인형을 부수거나 가리지 않음. 마지막 2초 정착 |
| 제외 | 괴물 공격·포효, 인형 자체 움직임·변형, 새 손가락, 새 인물·어린이, 회상 컷, 눈물·미소, 마법광·폭발 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 7, aspect_ratio 16:9, mode std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 사전 조회 | 7크레딧 |
| 영상 job | 42347160-9416-4747-844b-8c19661eb2ab |
| 원화 media_id | e704f83a-b950-4570-8640-ac2befa0313d |
| 음성 도구 | tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a07_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 73,186바이트 / 4.545306초 |
| 음성 media_id | 7b3578a8-f5ef-456f-80d9-a7b86de8edd4 |
| 초기 자동 검수 | faster-whisper small, script similarity 1.0, timed_words=8, caption_words=8 |
| 편집 계획 | 최종 7.000초, 음성 시작 지연 0.450초, 음성 속도·피치 유지. 영상만 길이에 맞게 리타이밍, 24fps |
| 오디오 구성 | 내레이션만. 오디오 디자인 스킬의 명료도·마스킹 방지 기준에 따라 음악·효과음 추가 없음 |
| 자막 처리 | Higgsfield subtitles 번들 audio_to_captions.py + burn_caps_clean.sh. 영어 발화 시각에 승인 한국어 구절 매핑 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 하단 중앙 흰색·검은 외곽선 |
| 자막 여유 | Whisper 시각 + 0.450초, 발화 뒤 최대 0.300초. 다음 구절 시작을 넘지 않음 |
| 적용 범위 | 버전이 구분된 검수 영상·음성·자막·제작 기록만 추가. 게임 코드·기존 원화·기존 보이스 수정 없음 |

자동 음성 인식은 발음·음색·연출에 대한 사용자 청취·영상 승인을 대체하지 않는다. 다음 컷은 사용자 확인 뒤에 진행한다.

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 지옥의 모든 괴물은… | 0.450초 | 1.750초 |
| 한때, 어딘가의 누군가였다. | 1.750초 | 4.670초 |

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 7.042초 |
| 납본 파일 길이 | 7.000초 |
| 영상 리타이밍 배수 | 0.9940357852882704, fps 24. 음성 속도·피치 처리 없음 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상 7.000초, 오디오 7.000초. 차이 0초 |
| 음성 종료 보존 | 원본 4.545306초 + 시작 지연 0.450초 = 4.995306초. 전체 음성 파일 뒤 2.004694초 여백 |
| 로컬 납본 | output/cinematic/a07_v1_en_ko.mp4, 1,640,055바이트 |
| 로컬 자막 | output/cinematic/a07_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a07_v1_visual_check.jpg, 68,526바이트 |
| 최종 자동 인식 | faster-whisper small, script similarity 1.0, timed_words=8, caption_words=8, 영어 원고 정규화 전체 일치 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS, clean/final 파일 길이 차이 0초 |
| 화면 검사 시각 | 1.083333 / 3.208333 / 5.500 / 6.500초 |
| 자막 화면 검수 | 2개 승인 구절 정상 표시, 잘림 없음. 후반 두 프레임은 자막 없는 여백 |
| 실제 화면 관찰 | 초반 괴물과 손을 함께 보여주다가 후반 손바닥과 토끼 인형이 커지고 얼굴이 프레임 밖으로 빠짐. 인형은 손바닥 위에서 유지되며 괴물의 손·팔이 낮아지는 변화가 보임 |
| 계획 대비 판정 | '손가락만 수 mm 움직임'보다 손·팔 전체의 이동이 크게 나타남. 정지 표본만으로 손가락의 미세 오므림이나 인형의 완전한 무동작을 확정하지 않음. 손과 인형 중심의 구도는 확인, 움직임 강도는 사용자 영상 승인 대기 |
| 업로드 검증 | clean/final/JPEG/ZIP PUT 모두 HTTP 200, 각 media_confirm 완료 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스 수정 없음. 다음 컷 진행 없음 |

[7컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ce5a4b42-049f-4134-90b0-1270b8172798.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/0eb583d0-72eb-4073-8733-364b8b7e9aa1.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_162750_42347160-9416-4747-844b-8c19661eb2ab.mp4)

[제작 자료 ZIP — 원본·음성·납본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/12efcc21-eece-4d0d-9d68-5251f57a1c31.zip)
