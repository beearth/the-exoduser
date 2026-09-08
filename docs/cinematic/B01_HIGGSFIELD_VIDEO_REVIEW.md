# 전체 콘티 8번 — B01 시대를 묻지 않는 지옥

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 최신 사용자 검수: v1은 일반 폐허로만 보여 시대·세계 혼재가 약하므로 교체 요청. 사이버펑크와 판타지를 명시적으로 섞은 [v2 제작 기록](B01_V2_HIGGSFIELD_VIDEO_REVIEW.md)을 우선한다. 아래는 v1의 보존 이력이며 현재 승인 상태가 아니다.

2026-09-06 사용자 "너무 긴가 일단만들어봐 8 부터" 요청. 최근 18구간 표의 8번이며, 기존 생성 파일 A08(탈출의 길)과 다른 컷이다. 내부 ID B01, 원화 p12. 한 컷씩 검수하는 진행 방식에 따라 이 컷만 제작했다. 상태: 검수본 완료, 사용자 승인 대기, 게임 미적용.

| 항목 | 계약 |
|---|---|
| 한국어 | 지옥은 시대를 묻지 않는다. |
| 영어 | Hell does not ask what age you came from. |
| 원화 | assets/cutscene/prologue/p12.jpg (기존 원화, 신규 이미지 생성 없음) |
| 원화 관찰 | 부식된 투구·갑주 조각이 쌓인 전경, 무너진 탑과 깊은 잿빛 평원, 먼 붉은 지평선. 인물 없음 |
| 영상 연출 | 오른쪽으로 아주 느린 짧은 측면 이동, 전경 유물과 원경 폐허의 작은 시차, 낮은 안개와 미세 재만 이동 |
| 제한 | 유물·건물 고정, 인물·전투·붕괴·폭발·발광 증가·신규 물체·새 장면 없음 |
| 모델 | Higgsfield cinematic_studio_video_v2 |
| 설정 | duration 4, aspect_ratio 16:9, std, sound off, genre suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용 | 사전 조회 4크레딧 |
| job | 1880ad60-ee9d-4ec9-9e5e-2d43340d19d0 |
| 원화 media | 52c28df2-889d-46a2-8b06-379ab2bacb60 |
| 보이스 media | 7d1231c9-0b47-48dc-b419-4b1b544fe110 |
| 영어 생성 | tools/elevenlabs_tts.mjs로 ElevenLabs 직접 생성 |
| voice ID | WS6naCm8T4gbyzsLnOjK |
| model ID | eleven_multilingual_v2 |
| voice settings | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 원본 | output/cinematic/b01_v1_en_WS6naCm8T4gbyzsLnOjK.mp3, 44347바이트, 2.742857초 |
| 최종 길이 계획 | 4.000초, 24fps. 옛 콘티 3.4초는 구안으로 보존 |
| 음성 합성 | 0.450초 지연, 원본 전체 종료 3.192857초, 이후 0.807143초 여백. 속도·피치 변경 없음 |
| 길이 판단 | 사용자 길이 우려에 따라 불필요한 추가 대사·긴 여백 없이 한 문장 호흡으로 제작 |
| 자막 | Whisper clock + authored manifest 대조 후 한국어 한 구절 매핑. 번들 burn_caps_clean.sh |
| 자막 스타일 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps |
| 오디오 디자인 | 기존 저음 보이스 통일·명료도 유지. 추가 음악·효과음 없음 |
| 프리셋 | 자동 IN THE DARK 추천 미적용, 원화 기반 기존 컷 스타일과 문자 그대로의 연출 유지 |
| 변경 범위 | 신규 버전별 검수 자산·제작 기록만. 게임 코드·기존 원화·기존 보이스 수정 없음 |

## 영상 프롬프트

Animate this exact ruined landscape as one quiet 4-second dark-fantasy establishing shot. Preserve the composition, foreground piles of corroded helmets and armor fragments, layered rubble, broken towers, distant ashen valley, and subdued red horizon. The ancient relics and all ruins remain completely immobile and unchanged. A very slow, slight lateral camera track to the right creates gentle parallax between the nearest buried armor and the distant towers; total displacement is small, no zoom or dramatic reveal. Only a thin low layer of ash mist moves slowly across the ground and a few fine particles fall. Show the indifferent accumulation of different ages in the same desolate place. No people, no creatures, no battle, no rising corpses, no moving artifacts, no collapsing buildings, no new weapons or architecture, no bright flames, no explosion, no lightning, no glowing symbols, no sunlight burst, no neon or clean science-fiction objects. Keep the dark charcoal and tarnished bronze painterly realism, deep shadows with readable surface detail, stable exposure and no increasing red glow. No scene transition, no text or logo, no speech. End on the same quiet ruined plain with motion settled.

## 검수

제작·기술 검수 완료. 사용자 최종 연출 승인 대기, 게임 미적용.

| 항목 | 실측 / 관찰 |
|---|---|
| 생성 원본 | 4.042초 |
| 납본 | 4.000초, 1276×720, 24fps, H.264 + AAC |
| 영상 리타이밍 | 0.9896091044037606 |
| A/V | clean/final 영상·오디오 모두 4.000초, 길이 차이 0초 |
| 음성 보존 | 원본 2.742857초 전부 사용, +0.450초, 끝 여백 0.807143초, 속도·피치 처리 없음 |
| STT 검수 | similarity 1.0, timed_words 9 / caption_words 9, 영어 원고 전체 일치 |
| 한국어 자막 | 지옥은 시대를 묻지 않는다. / 0.450~2.990초 |
| 전체 디코딩 | PASS |
| 화면 검사 시각 | 1.083333 / 2.375 / 2.500 / 3.500초 |
| 자막 검사 | 처음 세 검사 프레임에 정확한 한글, 하단 잘림 없음. 마지막 프레임은 자막 종료 후 여백 |
| 실제 화면 | 전경 투구·갑주 더미와 원경 폐허 탑 유지. 구도 이동은 작고 안개·구름의 흐름이 보임. 인물·대규모 붕괴·폭발은 표본에서 보이지 않음 |
| 연출 차이 | 원화보다 구름 덩어리와 대기층이 뚜렷함. 모든 유물이 픽셀 단위로 불변이라고 판정하지 않음 |
| 판정 한계 | 네 표본 프레임 시각 검사와 기술 검수는 전체 동작·청취의 사용자 최종 승인을 대신하지 않음 |
| 업로드 | clean/final/JPEG/ZIP 모두 성공, media_confirm 완료 |
| 다음 컷 | 전체 콘티 9번 B02/p13, 무대사 유물 근접. 아직 제작하지 않음 |
| 보존 | 기존 원화·기존 컷·게임 코드 변경 없음 |

## 납본

- output/cinematic/b01_v1_en_ko.mp4
- output/cinematic/b01_v1_visual_check.jpg
- output/cinematic/b01_v1_review.zip
- output/cinematic/b01_v1_ko.srt

[8번 최종 후보 — 영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/754e94e7-45c9-4d50-9399-d2d030243ab2.mp4) · [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/97dad9b4-0a9e-4452-b6b2-10b824d63f95.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1918c410-d8e7-4c78-b734-2fff97ccc0a3.zip)

[Higgsfield 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_135946_1880ad60-ee9d-4ec9-9e5e-2d43340d19d0.mp4)
