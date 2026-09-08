# C14 v1 — 전체 14컷 제작 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-07 자동 완성 요청. [현재 전체 흐름](AUTO_FINAL_20260907.md). 원본 보존, 게임 미적용.

| 항목 | 값 |
|---|---|
| 한국어 | 추락에 맞서는 자들. / 그들을 엑소듀서라 부른다. |
| 영어 | Those who defy the fall. They are called Exoduser. |
| 길이 | 6.000초 / 1280×720 / 24fps / H.264 + AAC |
| 생성 | Higgsfield cinematic_studio_video_v2 std / sound off / suspense / speedramp linear / count 1 / multi_shots false / multi_shot_mode custom / cfg_scale 0.5 |
| job | 5c9e6acc-81ec-468d-9496-7b711facd75e |
| 보이스 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability 0.65 / similarity_boost 0.8 / style 0.15 / speaker boost true |
| 음성 처리 | 원본 전체 사용, 시작 +0.450초, 피치·속도 유지. BGM/SFX 추가 없음 |
| 자막 | Whisper medium clock / 원고 일치 similarity 1.0 / 한국어 구절 매핑 / clean WenQuanYi Zen Hei 13 marginv 23 outline 0.8 shadow 0.4 no-caps |
| 자막 시각 | 00:00:00,450~00:00:02,330 추락에 맞서는 자들. / 00:00:02,590~00:00:04,730 그들을 엑소듀서라 부른다. |
| 기술 검수 | 전체 디코딩 PASS, clean/final 영상·오디오 길이 모두 6초, 누락 단어 없음 |
| 로컬 납본 | output/cinematic/c14_v1_en_ko.mp4 / c14_v1_review.zip / c14_v1_check.jpg / c14_v1_ko.srt |
| 상태 | 개별 검수본 완료. 자동/표본 검사는 사용자 연속 재생·청취 승인을 대체하지 않음 |

## 화면 관찰

7개 표본(0, 1, 1.375, 1.875, 2, 3.666667, 5.958333초)에서 손을 잡은 상태로 무릎 꿇은 인물이 일어나고 마지막엔 두 인물이 서서 위쪽 길을 향함. 원경 인물·계단·구덩이 유지. 한글 두 구절 표시. 검사 시트 마지막 검정 칸은 빈칸이다. 매 프레임 손가락 동일성 보장은 아님.

## 처리 이력

small STT similarity 0.8421052631578947에서 하드 게이트로 중단. medium 재실행 후 similarity 1.0, 9/9단어 일치 확인 뒤 합성. 동시 폰트 fetch에서 사용하지 않는 폰트 경고가 있었지만 실제 지정 한글 폰트 출력은 확인했다.

## 프롬프트

내장 imagegen 원화:

Use case: stylized-concept. New photoreal cinematic 16:9 Hell Road closing shot, "Those who defy the fall. They are called Exoduser." Image 1 is a composition/action reference: one weary person helping another rise before a long upward path. Image 2 is the palette and mixed Gothic/cyberpunk architectural reference. Neither is an edit target.
On the first few steps of a steep broken staircase carved into the inside wall of the SAME enormous hell pit, a weary dark-armored human with a ragged cloak has already firmly clasped the FOREARM of a kneeling cybernetic humanoid. The human leans back slightly to help the mechanical person stand. Their existing forearm grip is unambiguous, hands not hovering, no interpenetration. Two distinct full bodies, human on a higher step and cyborg one step below, credible grounded anatomy. Weapons stowed, hands used only for this action. They are NOT the specific previous opponents: anonymous representatives of survivors whose different origins do not prevent helping.
Behind them the broken stair rises into immense gray darkness, ancient Gothic stone fused with worn industrial braces, exposed cable trunks, faint cyan lights and a distant ruined arch, always within the pit. A tiny far figure in weathered robes is already climbing, giving a collective sense of resistance. They have not escaped. Ash and a few loose particles fall DOWN, their deliberate effort goes UP against that flow. Somber charcoal, blackened bronze, dim gray side light, subtle desaturated cyan mechanical seams. No divine light, magic gift, sunrise or heroic glow. Close-medium wide, characters lower center occupying about half frame height with readable silhouette and the upward path receding. Textured dark realistic film image, not illustration/cartoon. Dark lower subtitle-safe strip. No text, no logo, no watermark, no gore, no large floating rocks or winged flight.

Higgsfield 영상:

Animate this exact image in ONE six-second quiet closing shot. The standing weary human maintains the ALREADY CLASPED forearm grip and gently helps the kneeling cybernetic companion rise to a low standing crouch. One slow continuous effort, credible weight transfer, feet stay on the existing stone steps. Keep the connected hands anatomically stable, no extra arms, no letting go or regripping. After rising they pause facing the upward stairs, still inside the pit; they do not reach the exit. The tiny distant robed figure takes one restrained upward step. Ash and fine debris drift downward while their effort is upward. Subtle forward camera drift, cloth stirring, fixed mixed Gothic/industrial architecture and dim cyan details. No heroic light bloom, no supernatural force lifting them, no giant floating rocks, no new characters, no morphing limbs, no teleport, no collapse, no scene cuts. End with both figures holding themselves upright and the difficult ascent still ahead. No title, no captions, no audio.

## 전달 링크

- [영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/38313f87-de0a-4c3f-8aa2-ae71fef2c490.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/11c1dc15-5d11-4680-94d1-ca4b861672ad.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c1f67109-b2a6-4a0a-89cf-f38045084558.zip)
- [Higgsfield 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_164840_5c9e6acc-81ec-468d-9496-7b711facd75e.mp4)
