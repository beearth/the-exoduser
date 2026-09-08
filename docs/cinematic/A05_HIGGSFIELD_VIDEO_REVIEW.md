# 세계관 프롤로그 영상 5컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 및 기술 검수 완료. 사용자 최종 영상 승인 대기, 게임 미적용.

## 승인 대사와 컷 연결

사용자는 '다음컷은 그대로가자'로 아래 대사를 승인했다. 앞 컷의 파괴적 힘이 모이는 지옥에서, 그곳에 가라앉은 영혼의 귀환·환생 불가로 이어진다. 새 영상 A05는 기존 정지 콘티 A07/p06에 대응한다. 중복된 문 설명을 다시 넣지 않으며 기존 게임·정지 콘티 순서는 변경하지 않는다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 그 깊은 곳에 가라앉은 영혼은 | The souls that sink into those depths |
| 2 | 돌아갈 길을 잃고… | lose their way back... |
| 3 | 다시 태어날 기회마저 빼앗긴다. | and are robbed of even the chance to be reborn. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p06.jpg |
| 원화 관찰 | 영혼들이 새겨진 원형 석조 부조, 오른쪽 결손부, 떠 있는 돌 파편, 벗겨진 금박, 검은 벽과 낮은 붉은 잔불 |
| 계획 연출 | 10초 단일 쇼트. 약 15도 얕은 궤도 이동과 느린 접근. 희미한 금빛이 부조 홈을 따라 끊어진 부분에 도달한 뒤 희미해져 재로 떨어진다. 고리 복구·완주 없음. 조각상은 살아 움직이지 않는 돌로 유지 |
| 마지막 여백 | 마지막 말 뒤 침묵. 기존 p06의 1.5초 무음 의도를 유지하며 음악·효과음 추가 없음 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 10, aspect_ratio 16:9, mode std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, cfg_scale 0.5 |
| 비용 사전 조회 | 10크레딧 |
| 영상 job | 57a68855-2b7b-442b-9473-961a540407df |
| 원화 media_id | 5bd3dc4e-f3b8-4a75-88e2-7824e1ed8031 |
| 음성 도구 | tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a05_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 122,924바이트 / 7.653878초 |
| 음성 media_id | 6b79bf1e-92a3-4867-a4ed-d76b33539f35 |
| 초기 자동 검수 | faster-whisper, script similarity 1.0, timed_words=21, caption_words=21, 원고 정규화 일치 |
| 편집 계획 | 최종 10.000초. 음성 시작 지연 0.450초, 음성 속도·피치 유지. 영상만 원본 길이에 따라 리타이밍, 24fps |
| 자막 처리 | Higgsfield subtitles 번들 audio_to_captions.py + burn_caps_clean.sh. 영어 발화 시각에 승인된 한국어 구절 매핑 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 하단 중앙 흰색·검은 외곽선 |
| 자막 여유 | Whisper 시각 + 0.450초. 발화 뒤 최대 0.300초 유지하되 다음 구절 시작을 넘지 않음 |
| 적용 범위 | 버전이 구분된 검수 영상·음성·자막·제작 기록만 추가. 게임 코드·기존 에셋·기존 보이스 변경 없음 |

자동 음성 인식은 발음·음색·연출에 대한 사용자 청취와 영상 승인을 대체하지 않는다. 오디오 디자인 스킬의 침묵·여백 원칙을 적용하되 요청 범위 밖의 음악이나 효과음을 추가하지 않는다.

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 그 깊은 곳에 가라앉은 영혼은 | 0.450초 | 2.630초 |
| 돌아갈 길을 잃고… | 2.630초 | 4.130초 |
| 다시 태어날 기회마저 빼앗긴다. | 4.130초 | 7.730초 |

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 10.042초 |
| 납본 파일 길이 | 10.000초 |
| 영상 리타이밍 배수 | 0.9958175662218681, fps 24 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상 10.000초, 오디오 10.000초, 차이 0초 |
| 음성 종료 보존 | 원본 7.653878초 + 시작 지연 0.450초 = 8.103878초. 전체 음성 파일 뒤 1.896122초 무음 확보 |
| 로컬 납본 | output/cinematic/a05_v1_en_ko.mp4, 2,926,663바이트 |
| 로컬 자막 | output/cinematic/a05_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a05_v1_visual_check.jpg, 73,146바이트 |
| 최종 자동 인식 | script similarity 1.0, timed_words=21, caption_words=21, 영어 원고 전체 정규화 일치 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS, clean/final 파일 길이 차이 0초 |
| 화면 검사 시각 | 1.541667 / 3.375 / 5.916667 / 9.250초. 3개 자막 구절과 자막 없는 마지막 여백 확인 |
| 실제 화면 관찰 | 석조 부조·오른쪽 결손부 유지. 금빛이 원형 홈을 따라 길어지고 카메라 구도가 회전·접근한다. 한국어 3구절 표시, 잘림 없음 |
| 계획 대비 차이 | 마지막 9.250초 검사 프레임에도 금빛이 남는다. '금빛 완전 소멸'은 충족했다고 판정하지 않는다. 완성본 연출은 사용자 확인 대기이며 추가 유료 재생성은 하지 않음 |
| 업로드 검증 | clean/final/JPEG/ZIP PUT 모두 HTTP 200, 각 media_confirm 완료 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스 변경 없음. 다음 컷으로 진행하지 않음 |

[5컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/8db254ea-4a05-4b38-8767-bc3ab9040601.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/be053782-b7b3-443e-8f3d-d8c11892dd30.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_155906_57a68855-2b7b-442b-9473-961a540407df.mp4)

[제작 자료 ZIP — 원본·음성·납본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1ab8410c-5473-4f7f-8ca1-325d620d6064.zip)
