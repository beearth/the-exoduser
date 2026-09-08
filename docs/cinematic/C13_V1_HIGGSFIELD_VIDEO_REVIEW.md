# C13 v1 — 전체 13컷 제작 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-07 자동 완성 요청. [현재 전체 흐름](AUTO_FINAL_20260907.md). 원본 보존, 게임 미적용.

| 항목 | 값 |
|---|---|
| 한국어 | 서로를 겨누는 그들이 원하는 것은… / 단 하나. / 탈출. |
| 영어 | Those who turn their weapons on one another desire only one thing. Escape. |
| 길이 | 7.000초 / 1280×720 / 24fps / H.264 + AAC |
| 생성 | Higgsfield cinematic_studio_video_v2 std / sound off / suspense / speedramp linear / count 1 / multi_shots false / multi_shot_mode custom / cfg_scale 0.5 |
| job | 534cd382-1fd7-497e-9fdb-765c73b32173 |
| 보이스 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability 0.65 / similarity_boost 0.8 / style 0.15 / speaker boost true |
| 음성 처리 | 원본 전체 사용, 시작 +0.450초, 피치·속도 유지. BGM/SFX 추가 없음 |
| 자막 | Whisper small clock / 원고 일치 similarity 1.0 / 한국어 구절 매핑 / clean WenQuanYi Zen Hei 13 marginv 23 outline 0.8 shadow 0.4 no-caps |
| 자막 시각 | 00:00:00,450~00:00:03,170 서로를 겨누는 그들이 원하는 것은… / 00:00:03,170~00:00:04,450 단 하나. / 00:00:04,890~00:00:05,630 탈출. |
| 기술 검수 | 전체 디코딩 PASS, clean/final 영상·오디오 길이 모두 7초, 누락 단어 없음 |
| 로컬 납본 | output/cinematic/c13_v1_en_ko.mp4 / c13_v1_review.zip / c13_v1_check.jpg / c13_v1_ko.srt |
| 상태 | 개별 검수본 완료. 자동/표본 검사는 사용자 연속 재생·청취 승인을 대체하지 않음 |

## 화면 관찰

8개 표본(0, 1, 1.791667, 2, 2.5, 3.791667, 5.25, 6.958333초)에서 대치 인물→위쪽 개구부로 시야 전환. 후반에는 개구부가 원화보다 크게 보이므로 순수한 제자리 틸트보다는 접근·재구도가 섞인 결과다. 탈출 통과·비행·신성 광선은 보이지 않음. 세 한국어 구절 모두 표시.

## 처리 이력

첫 PUT에서 HTTP 400, XML ExpiredToken 확인. 영상 생성 재시도 없이 새 업로드 주소와 동일 원본으로 후처리를 재실행하여 네 파일 모두 HTTP 200.

## 프롬프트

내장 imagegen 원화:

Use case: stylized-concept. NEW cinematic photoreal dark fantasy/cyberpunk keyframe, 16:9. Shot 13 of Hell Road, the desire for escape. Reference image only supplies ash-gray Gothic cyberpunk pit architecture, robes, psychic and corroded technology visual language.
Camera is LOW inside a vast single cylindrical pit, looking obliquely upward. At the bottom third of the frame on a broad battered stone terrace, two grim full-body opponents remain facing each other with weapons raised but paused: a weathered armored knight holds a clear steel sword low, a cybernetic humanoid has empty metal hands ready to block. Smaller robed and armored combatants stand on distant terraces below. All are dwarfed by steep continuous concave walls and countless broken ascending ledges of fused Gothic masonry and derelict cyberpunk infrastructure. The upper two thirds show immense height: the walls converge in perspective toward ONE very distant thin irregular opening far above, a small sliver of cold gray daylight, not a sun, portal or magical beam. The opening is visible but unreachable, sealed by distance rather than bars. No other exit or duplicate opening. This is a longing, NOT successful escape.
Composition leads the eye from mutually opposing fighters in lower frame to the tiny high opening, leaving room for a slow upward camera tilt. Moody charcoal/bronze, restrained cyan city remnants, ash haze creating atmospheric depth. Readable dark midtones, realistic materials. No god, no wings, no miracle, no flying people, no ascending energy beam, no lava, no gore, no title or subtitles, no watermark. Foreground safe bottom strip dark uncluttered stone. Do not copy the previous two-person magic duel or show an outdoor city.

Higgsfield 영상:

Animate this exact low-angle shot inside ONE immense hell pit. First two seconds: the knight and cybernetic opponent hold their facing combat stances with tiny weight shifts and breathing, weapons and bodies unchanged. Over the following four seconds the camera smoothly TILTS UP along the fixed towering concave Gothic/cyberpunk walls toward the existing tiny distant opening overhead. The two fighters remain grounded, sliding down toward the lower frame only because of the upward tilt; do not turn them into flying people. Finish with a one-second steady hold emphasizing how unimaginably far away the one small cold-gray opening remains. It does NOT widen, brighten dramatically, move closer or become a portal. Fine ash gently drifts down, faint cyan fixtures remain static. Perspective and parallax from camera tilt only, walls must never morph or grow. Slow sober cinematic movement, readable dark midtones. No attack explosion, no scene cut, no new exit, no beam, no miracle, no ascension, no actual escape, no text, no subtitles, no audio.

## 전달 링크

- [영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9ab8fc80-d35a-41dc-a951-339bd37865ac.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/611888c4-4b0e-4c00-9f20-6587eddafd44.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/5efdda26-b535-4b19-9d44-f21a82b73f07.zip)
- [Higgsfield 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_164840_534cd382-1fd7-497e-9fdb-765c73b32173.mp4)
