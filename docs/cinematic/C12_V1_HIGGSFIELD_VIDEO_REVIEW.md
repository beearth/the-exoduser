# C12 v1 — 전체 12컷 제작 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-07 자동 완성 요청. [현재 전체 흐름](AUTO_FINAL_20260907.md). 원본 보존, 게임 미적용.

| 항목 | 값 |
|---|---|
| 한국어 | 모두가 뒤엉킨 단 하나의 구덩이. |
| 영어 | All intertwined within a single pit. |
| 길이 | 5.000초 / 1280×720 / 24fps / H.264 + AAC |
| 생성 | Higgsfield cinematic_studio_video_v2 std / sound off / suspense / speedramp linear / count 1 / multi_shots false / multi_shot_mode custom / cfg_scale 0.5 |
| job | adeb79fe-965c-4c46-9bf5-42386b6d5938 |
| 보이스 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability 0.65 / similarity_boost 0.8 / style 0.15 / speaker boost true |
| 음성 처리 | 원본 전체 사용, 시작 +0.450초, 피치·속도 유지. BGM/SFX 추가 없음 |
| 자막 | Whisper small clock / 원고 일치 similarity 1.0 / 한국어 구절 매핑 / clean WenQuanYi Zen Hei 13 marginv 23 outline 0.8 shadow 0.4 no-caps |
| 자막 시각 | 00:00:00,450~00:00:02,690 모두가 뒤엉킨 단 하나의 구덩이. |
| 기술 검수 | 전체 디코딩 PASS, clean/final 영상·오디오 길이 모두 5초, 누락 단어 없음 |
| 로컬 납본 | output/cinematic/c12_v1_en_ko.mp4 / c12_v1_review.zip / c12_v1_check.jpg / c12_v1_ko.srt |
| 상태 | 개별 검수본 완료. 자동/표본 검사는 사용자 연속 재생·청취 승인을 대체하지 않음 |

## 화면 관찰

6개 표본(0, 1, 1.583333, 2, 2.125, 4.958333초)에서 여러 전투자가 한 원형 구덩이 안에 있고, 카메라가 후퇴하며 전장이 작아지는 흐름 확인. 검 충돌에 금빛 섬광이 더해짐. 원화의 쌍검은 유지. 검사 시트 아래 두 검정 칸은 빈칸이며 영상의 검정 프레임이 아님.

## 처리 이력

첫 출력 슬롯 4개는 예약만 하고 사용하지 않았으며, 아래 실제 납본 슬롯을 사용했다.

## 프롬프트

내장 imagegen 원화:

Use case: stylized-concept. NEW cinematic photoreal dark fantasy / cyberpunk image, 16:9 landscape. World-intro shot 12, "All intertwined within a single pit." Reference image is a material, architectural and restrained spell-light reference ONLY, not a composition to copy.
An elevated oblique WIDE view into ONE immense circular hell sinkhole city. Its continuous concave walls and nested broken terraces visibly wrap around a single deep black center. The circular enclosure must be legible, not a straight street, two separate canyons, or a flat wasteland. Gothic cathedral buttresses, ancient fortress masonry, exposed cables and broken cyberpunk high-rises with faint cyan and violet lights are physically woven together on all levels.
In the lower middle foreground a broad connected fighting terrace holds three separated small skirmishes, NOT a marching army. Nearest pair clearly readable at about one fifth of image height: a battered plate-armored knight with ONE steel sword braced against an angular cybernetic fighter blocking with a thick metallic forearm. Further along the SAME terrace an unarmed psychic in dark futuristic clothes suspends stones while an old robed archmage with one staff braces behind a small amber rune shield. On another connected side ledge, two small opposing armored silhouettes clash. About eight principal combatants, natural varied believable poses, no repeated identical crowds. Sparse additional tiny silhouettes in distant terraces establish scale, not a packed crowd.
The eye travels from the visible different fighters to the huge circular enclosure and bottomless center behind them. Ground beneath every fighter, no falling people, no airborne heroes. Charcoal and corroded bronze, ashen gray haze, subtle cyan/purple city light and very restrained amber magic. Realistically weathered tactile armor, fabric, stone and machinery. Oppressive grim solemnity, no bright heroic look. Atmospheric layers make the bowl shape readable even in darkness. Lower central strip quiet dark ground for later subtitles. No text, no logos, no watermarks, no splitscreen, no lava eruption, no planet, no giant glowing portal, no graphic injury. Keep action silhouettes separated and full-body, no fused limbs. Cinematic crane-shot starting frame with space for a slow pull-back to reveal the single enclosing pit.

Higgsfield 영상:

ONE continuous five-second cinematic crane pull-back from this exact image. The camera smoothly retreats backward and rises a little, revealing more of the ONE circular enclosing hell pit, continuous concentric ruined terraces and Gothic/cyberpunk walls. Keep the single central depth, architecture fixed, no new pit or portal. Foreground knight and cybernetic fighter exchange one restrained sword attack and metal-forearm block, then reset their stances. The psychic's existing stones slowly orbit and the old mage's small amber shield pulses once, with two side-ledged fighters taking short opposing steps. All remain grounded and battling each other, never marching together or falling. As the camera retreats, figures naturally shrink modestly while more connected terraces enter the frame, making the many civilizations and combatants visibly share ONE place. Fine ash drifts, dim neon remains stable. Somber gray readable exposure. No fast zoom, no scene cuts, no huge explosion, no extra limbs, no disappearing fighters, no morphing buildings, no text, no captions, no audio. End with the pit dominating the frame, ongoing small conflicts still visible.

## 전달 링크

- [영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c82fc6ad-88f1-4891-b2d9-7d8c87724d41.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/88a56fc3-7819-47af-b652-8cd7f5988166.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ebb6ae6b-5543-4674-bd26-f84a3399282b.zip)
- [Higgsfield 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_164026_adeb79fe-965c-4c46-9bf5-42386b6d5938.mp4)
