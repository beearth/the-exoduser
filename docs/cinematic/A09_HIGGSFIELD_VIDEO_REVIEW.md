# 세계관 프롤로그 영상 9컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 최신 사용자 지시는 [A09 v3](A09_V3_HIGGSFIELD_VIDEO_REVIEW.md)의 '기존 껍질을 잡고 미세 압박만 가한 채 종료'이다. 찢김·전진·탈출 성공은 요구하지 않는다. v1/v2는 이력 보존용이다.

> 사용자 재제작 요청으로 [A09 v2](A09_V2_HIGGSFIELD_VIDEO_REVIEW.md)를 별도 제작한다. 아래는 4초 v1 이력이며 보존한다. v2는 5초, 기존 보이스 재사용, 손과 장벽 접촉·물리적 탈출 동작 강화. 두 버전 모두 게임 미적용.

2026-09-06. 상태: 검수본 제작 및 기술 검수 완료. 사용자 최종 영상 승인 대기, 게임 미적용.

## 승인 및 컷 연결

사용자는 '그대로 2컷다'로 탈출의 길과 찢고 나가는 두 컷을 함께 승인했다. 새 영상 A09는 기존 정지 콘티 A12/p11에 대응한다. 기존 게임·정지 콘티 순서는 변경하지 않는다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 찢고 나가는 것. | To tear it open. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p11.jpg |
| 원화 관찰 | 검은 벽에 반쯤 묻힌 인물이 양손으로 벽을 잡아 찢음. 양옆의 붉고 흰 균열, 재와 작은 파편. 사슬은 현재 원화에 없음 |
| 연출 계획 | 0~0.7초 양손 긴장 → 0.7~2초 기존 균열을 따라 한 번 강하게 찢음과 짧은 푸시 인 → 2~4초 벌어진 벽을 지탱, 먼지 가라앉음. 구멍이 다시 닫히지 않음. 사슬을 새로 넣지 않음 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 4, aspect_ratio 16:9, mode std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 사전 조회 | 4크레딧. 두 컷 합계 9크레딧 |
| 영상 job | 03802731-9c15-415e-9eff-dd2dd2b283a9 |
| 원화 media_id | 403f2e45-61b5-4b61-9ff4-23c838930094 |
| 음성 도구 | tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a09_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 21777바이트 / 1.332245초 |
| 음성 media_id | 4d24d7cd-bcb7-49c5-bf7d-62ac0016def8 |
| 초기 자동 검수 | faster-whisper small, script similarity 1.0, timed_words=4, caption_words=4 |
| 편집 계획 | 최종 4.000초, 음성 시작 지연 0.450초, 음성 속도·피치 유지. 영상만 길이에 맞게 리타이밍, 24fps |
| 자막 처리 | Higgsfield subtitles 번들 audio_to_captions.py + burn_caps_clean.sh. 영어 발화 시각에 승인 한국어 구절 매핑 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 하단 중앙 흰색·검은 외곽선 |
| 자막 여유 | Whisper 시각 + 0.450초, 발화 뒤 최대 0.300초. 다음 구절 시작을 넘지 않음 |
| 오디오 구성 | 내레이션만. 오디오 디자인 스킬의 명료도·마스킹 방지 기준에 따라 음악·효과음 추가 없음 |
| 적용 범위 | 버전이 구분된 검수 영상·음성·자막·제작 기록만 추가. 게임 코드·기존 원화·기존 보이스 수정 없음 |

## 제작 중 확인 사항

- 최초 업로드 네 파일이 HTTP 400으로 실패했다. 체계적 디버깅 스킬에 따라 응답의 Code/Message만 확인한 결과 S3 ExpiredToken이었다. 새 업로드 URL 발급 후 동일 파일 네 개 모두 HTTP 200, media_confirm 완료. 기존 음성을 재생성하거나 파일을 수정하지 않음.
- 두 컷은 generate_video_batch로 별도 생성한다. 자동 IN THE DARK 프리셋 제안은 사용자의 '그대로' 지시와 원화 기반 연출을 유지하기 위해 적용하지 않음.
- 기존 문서의 '사슬이 석재를 찢는' 묘사와 실제 p11 원화가 다름을 사용자에게 알렸다. 현재 원화의 양손으로 벽을 찢는 장면을 영상화한다.
- 자동 음성 인식은 사용자 청취·영상 승인을 대체하지 않는다. 요청한 두 컷 이후의 타이틀·다음 영상은 추가 제작하지 않는다.

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 찢고 나가는 것. | 0.450초 | 1.570초 |

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 4.042초 |
| 납본 파일 길이 | 4.000초 |
| 영상 리타이밍 배수 | 0.9896091044037606, fps 24. 음성 속도·피치 처리 없음 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상·오디오 4.000초, 차이 0초 |
| 음성 종료 보존 | 시작 지연 0.450초 포함 1.782245초에 전체 원본 음성 파일 종료. 뒤에 2.217755초 여백 |
| 로컬 납본 | output/cinematic/a09_v1_en_ko.mp4, 1364911바이트 |
| 로컬 자막 | output/cinematic/a09_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a09_v1_visual_check.jpg, 50336바이트 |
| 최종 자동 인식 | script similarity 1.0, timed_words=4, caption_words=4, 영어 원고 정규화 전체 일치 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS. clean/final 파일 길이 차이 0초 |
| 화면 검사 시각 | 0.750 / 1.291667 / 2.500 / 3.500초 |
| 자막 검수 | 승인 구절 정상 표시, 잘림 없음. 두 자막 노출 프레임과 두 후반 여백 프레임 확인 |
| 실제 화면 관찰 | 한 인물의 양손이 벌어지며 검은 벽의 찢어진 부분과 붉고 흰 빛이 후반에 커짐. 자막 있는 초반과 자막 없는 후반을 확인. 사슬 없음 |
| 연출 판정 범위 | 후반 균열의 발광이 계획의 '절제된 빛'보다 강하고 손이 벽에서 벌어지는 동작이 보임. 양손으로 계속 지탱하는 정지 동작까지 정확히 충족했다고 판정하지 않음. 최종 연출 승인 대기 |
| 업로드 검증 | clean/final/JPEG/ZIP PUT 모두 HTTP 200, 각 media_confirm 완료 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스 수정 없음. 요청한 두 컷 이외 제작 없음 |

합성 시 두 컷을 한 명령으로 처리하려던 요청은 sandbox_exec의 16,000자 상한으로 실행 전 거절됐다. 각 컷의 다운로드·자막·합성·검수·업로드를 포함하는 자체 완결 명령 두 개로 분리해 완료했다. 동시 폰트 준비 중 사용하지 않는 일부 폰트의 .part 이동 경고가 발생했으나, 실제 지정 폰트 WenQuanYi Zen Hei는 fc-match로 확인됐으며 최종 한글 글리프·자막 화면 검수도 통과했다. 최종 영상 기술 검수는 사람의 연출 승인을 대신하지 않는다.

[9컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4b055a13-9205-490e-8630-83f5ce87bc15.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4acdf019-5348-414b-a08d-b0c24d81189e.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_041947_03802731-9c15-415e-9eff-dd2dd2b283a9.mp4)

[제작 자료 ZIP — 원본·음성·납본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/7f45b51a-f7ef-4943-ad98-3e8f794728f2.zip)
