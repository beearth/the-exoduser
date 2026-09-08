# 세계관 프롤로그 영상 8컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 및 기술 검수 완료. 사용자 최종 영상 승인 대기, 게임 미적용.

## 승인 및 컷 연결

사용자는 '그대로 2컷다'로 탈출의 길과 찢고 나가는 두 컷을 함께 승인했다. 새 영상 A08는 기존 정지 콘티 A11/p10에 대응한다. 기존 게임·정지 콘티 순서는 변경하지 않는다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 이 지옥을 벗어날 길은… | There is but one way... |
| 2 | 단 하나뿐이다. | out of this Hell. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p10.jpg |
| 원화 관찰 | 거대한 검은 석조 천장과 상단의 단 하나의 가느다란 흰 균열. 창백한 빛, 풍화된 부조, 낙하하는 재 |
| 연출 계획 | 느린 크레인 업. 균열은 좁고 아득한 상태를 유지하며 출구·태양처럼 크게 열리지 않음. 단 하나의 빛에 시선을 고정 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 5, aspect_ratio 16:9, mode std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 사전 조회 | 5크레딧. 두 컷 합계 9크레딧 |
| 영상 job | b00a986d-dfe6-47d2-a122-ddcd6846f25d |
| 원화 media_id | 24f83902-9262-48d3-bbb3-a8b3570f1477 |
| 음성 도구 | tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a08_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 45601바이트 / 2.821224초 |
| 음성 media_id | 8af527ff-325a-4e44-b0b1-d1c3448e9fb2 |
| 초기 자동 검수 | faster-whisper small, script similarity 1.0, timed_words=9, caption_words=9 |
| 편집 계획 | 최종 5.000초, 음성 시작 지연 0.450초, 음성 속도·피치 유지. 영상만 길이에 맞게 리타이밍, 24fps |
| 자막 처리 | Higgsfield subtitles 번들 audio_to_captions.py + burn_caps_clean.sh. 영어 발화 시각에 승인 한국어 구절 매핑 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 하단 중앙 흰색·검은 외곽선 |
| 자막 여유 | Whisper 시각 + 0.450초, 발화 뒤 최대 0.300초. 다음 구절 시작을 넘지 않음 |
| 오디오 구성 | 내레이션만. 오디오 디자인 스킬의 명료도·마스킹 방지 기준에 따라 음악·효과음 추가 없음 |
| 적용 범위 | 버전이 구분된 검수 영상·음성·자막·제작 기록만 추가. 게임 코드·기존 원화·기존 보이스 수정 없음 |

## 제작 중 확인 사항

- 최초 업로드 네 파일이 HTTP 400으로 실패했다. 체계적 디버깅 스킬에 따라 응답의 Code/Message만 확인한 결과 S3 ExpiredToken이었다. 새 업로드 URL 발급 후 동일 파일 네 개 모두 HTTP 200, media_confirm 완료. 기존 음성을 재생성하거나 파일을 수정하지 않음.
- 두 컷은 generate_video_batch로 별도 생성한다. 자동 IN THE DARK 프리셋 제안은 사용자의 '그대로' 지시와 원화 기반 연출을 유지하기 위해 적용하지 않음.
- 영어 문장과 한국어는 어순이 다르지만 승인한 전체 문장의 의미와 문구를 보존한다.
- 자동 음성 인식은 사용자 청취·영상 승인을 대체하지 않는다. 요청한 두 컷 이후의 타이틀·다음 영상은 추가 제작하지 않는다.

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 이 지옥을 벗어날 길은… | 0.450초 | 1.570초 |
| 단 하나뿐이다. | 1.570초 | 3.090초 |

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 5.042초 |
| 납본 파일 길이 | 5.000초 |
| 영상 리타이밍 배수 | 0.9916699722332408, fps 24. 음성 속도·피치 처리 없음 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상·오디오 5.000초, 차이 0초 |
| 음성 종료 보존 | 시작 지연 0.450초 포함 3.271224초에 전체 원본 음성 파일 종료. 뒤에 1.728776초 여백 |
| 로컬 납본 | output/cinematic/a08_v1_en_ko.mp4, 882242바이트 |
| 로컬 자막 | output/cinematic/a08_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a08_v1_visual_check.jpg, 57202바이트 |
| 최종 자동 인식 | script similarity 1.0, timed_words=9, caption_words=9, 영어 원고 정규화 전체 일치 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS. clean/final 파일 길이 차이 0초 |
| 화면 검사 시각 | 1.000 / 2.333333 / 3.500 / 4.500초 |
| 자막 검수 | 승인 구절 정상 표시, 잘림 없음. 두 자막 노출 프레임과 두 후반 여백 프레임 확인 |
| 실제 화면 관찰 | 상단 단 하나의 좁은 균열과 빛이 유지됨. 천장의 석조 층과 안개 구도가 미세하게 이동하며 광원이 출입문이나 태양처럼 커지지 않음 |
| 연출 판정 범위 | 카메라 변화는 절제되어 있다. 아득한 천장의 규모감과 상승 느낌이 충분한지는 사용자 영상 검수 대기 |
| 업로드 검증 | clean/final/JPEG/ZIP PUT 모두 HTTP 200, 각 media_confirm 완료 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스 수정 없음. 요청한 두 컷 이외 제작 없음 |

합성 시 두 컷을 한 명령으로 처리하려던 요청은 sandbox_exec의 16,000자 상한으로 실행 전 거절됐다. 각 컷의 다운로드·자막·합성·검수·업로드를 포함하는 자체 완결 명령 두 개로 분리해 완료했다. 동시 폰트 준비 중 사용하지 않는 일부 폰트의 .part 이동 경고가 발생했으나, 실제 지정 폰트 WenQuanYi Zen Hei는 fc-match로 확인됐으며 최종 한글 글리프·자막 화면 검수도 통과했다. 최종 영상 기술 검수는 사람의 연출 승인을 대신하지 않는다.

[8컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/18e45395-565e-4ed9-a1c1-c121eb73fc4a.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/272ec9fa-dcfd-4251-a9ae-daf0c976ebe0.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_041947_b00a986d-dfe6-47d2-a122-ddcd6846f25d.mp4)

[제작 자료 ZIP — 원본·음성·납본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/47e06d0d-1a32-4bcf-9eb2-16f181827bf2.zip)
