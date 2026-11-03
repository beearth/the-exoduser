# 전체 콘티 11번 — B04 v2 초능력자와 대마법사

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-07 사용자 "해보자". [후반 개정](ENDING_EXODUSER_BATTLE_REVISION_20260907.md)에 따라 기존 낙하 B04 v1을 새 교전 장면으로 교체하는 별도 검수본. 원본 보존, 게임 미적용.

| 항목 | 값 / 제작 기준 |
|---|---|
| 한국어 | 초능력을 지닌 자도, / 마법의 극에 닿은 자도. |
| 영어 | Those with psychic powers. Those at the pinnacle of magic. |
| 원화 | output/cinematic/b04_v2_psychic_archmage_keyframe.png |
| 이미지 생성 | 내장 imagegen / stylized-concept. B03 v2는 혼합 문명 재질·색 참고만 사용. 새로운 인물·구도 |
| 화면 | 한 구덩이의 같은 테라스에서 초능력자가 염력으로 돌 3개를 날리고 대마법사가 마법진으로 받아냄. 두 인물이 계속 읽히는 한 차례 공방 |
| 소품 | 초능력자의 내민 손은 빈손. 대마법사 지팡이는 의도된 마법사 식별 소품으로 명확히 쥠. B03 기계형의 불명확한 막대와 다름 |
| 원화 media | 06853ec0-d13e-4ef4-9e02-cf990289720c |
| 보이스 | ElevenLabs 직접 API, WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 |
| 음성 설정 | stability 0.65 / similarity_boost 0.8 / style 0.15 / use_speaker_boost true |
| 음성 파일 | output/cinematic/b04_v2_en_WS6naCm8T4gbyzsLnOjK.mp3 / 67335바이트 / 4.179592초 |
| 음성 media | 61b52123-dd99-4ac4-b418-6c74952e166a |
| 생성 | Higgsfield cinematic_studio_video_v2 / 6초 / 16:9 / std / sound off / suspense / speedramp linear / count 1 / multi_shots false / multi_shot_mode custom / cfg_scale 0.5 |
| 사전 비용 | 6크레딧, 1개 job만 제출 |
| job | dc6b3eb5-2bb4-49c7-a77f-7701eab72d9c |
| 최종 길이 계획 | 6.000초 / 24fps / 음성 +0.450초 / 원본 보이스 전체 종료 4.629592초, 이후 1.370408초 여백 |
| 자막 계획 | Whisper 영어 원고 대조 후 한국어 두 구절. clean / WenQuanYi Zen Hei / 13 / marginv 23 / outline 0.8 / shadow 0.4 / no-caps |
| 오디오 디자인 | 앞 컷과 지정 보이스·톤·명료도 유지. 추가 BGM/SFX 없음. 보이스 피치·속도 유지 |
| 현 상태 | 원화·Higgsfield 영상·영어 더빙·한글 자막 검수본 완료. 전체 디코딩·A/V·원고 일치·8개 화면 표본 검사 완료. 사용자 재생 검수 대기 |
| 범위 | 이번 11컷만. 뒤의 구덩이·탈출·타이틀 신규 제작은 사용자 확인 후 |

## 원화 프롬프트

Use case: stylized-concept. NEW 16:9 cinematic photoreal dark fantasy / cyberpunk keyframe for Hell Road world intro. Reference image is ONLY a reference for ashen Gothic architecture interwoven with ruined cyberpunk buildings, material texture and somber lighting; replace its characters and composition completely.
Inside ONE immense hell pit, on a wide broken stone-and-metal terrace, TWO clearly readable full-body opponents face each other in combat. Medium-wide ground-level side view, both fill about half frame height, silhouettes separated by open fighting space. One is a psychic in battered futuristic dark tactical clothing, uncovered head, one EMPTY outstretched hand telekinetically suspending three fist-to-head-sized angular stones near his body, subtle cold cyan distortions around stones, no weapon or magic staff. Opposite is an elderly formidable archmage in worn layered robes, gripping a visibly intentional carved staff in one hand while the free hand projects ONE restrained amber circular arcane shield facing the psychic. Both firmly grounded with believable limbs, braced combat stances and visible faces in three-quarter profile, focused on each other not the camera. Capture the moment just before the psychic thrusts debris against the mage's shield. Their different kinds of power must be unambiguous.
Behind both figures, the SAME towering concave pit wall contains ancient buttresses, collapsed Gothic towers and cyberpunk infrastructure with scattered dim cyan and violet lights, heavy ash fog and immense oppressive depth. No open blue sky, no generic flat wasteland. Charcoal, weathered bronze, cold gray fog, selective cyan and amber spell light, realistic fabric, soot, scars and chipped surfaces. Restrained film lighting with enough midtone visibility to read both figures. Clear central action, no giant explosion, no laser beam connecting the two, no superhero logo, no divine halos or wings, no guns, no extra foreground characters, no gore, no text, no subtitles, no watermark. Lower subtitle-safe strip mostly dark ground. Single coherent frame, not split screen.

## 영상 프롬프트

Animate this exact frame as ONE readable six-second combat exchange. Keep the same psychic on the LEFT and the same elderly archmage on the RIGHT, both standing on the same terrace inside the immense mixed Gothic/cyberpunk pit. First the psychic's three suspended stones tremble and slowly rotate. He then makes ONE short decisive forward push with his empty hand, launching the stones LEFT TO RIGHT across the visible gap. The archmage braces and raises his existing amber circular shield slightly; stones visibly STRIKE its front, producing a brief contained ripple and small sparks, then stone fragments drop onto the floor. The archmage recoils only a half step and holds his ground with the same staff clearly gripped, both opponents remain alive and facing each other. Finish in tense opposing stances, not a victory pose. Restrained heavy action at readable natural speed, subtle cloth movement and ash, modest sideways camera drift only. Maintain the foreground characters' sizes, faces, anatomy, empty psychic hand, single staff and matching dark exposure; rigid background architecture and muted neon. Keep the collision small enough to see both combatants throughout. No giant explosion, no fireball, no connecting laser beam, no new weapon, no teleporting, no morphing, no extra limbs, no camera orbit, no cuts, no falling people, no title, no subtitles, no generated audio.

## 실측·검수·납본

| 항목 | 실측 / 관찰 |
|---|---|
| 생성 원본 → 최종 | 6.042초 → 6.000초, 영상 리타이밍 계수 0.9930486593843099 |
| 포맷 | 1280×720, 24fps, H.264 / AAC |
| A/V | clean/final 영상·오디오 모두 6.000초. 스트림 길이 차이 0초 |
| 보이스 | 4.179592초 원본 전체 사용, +0.450초. 원본 파일 끝은 4.629592초, 이후 1.370408초 여백. 속도·피치 변경 없음 |
| STT | faster-whisper / similarity 1.0 / timed_words 10 = caption_words 10 / 원고 정규화 토큰 모두 일치 |
| KO 1 | 초능력을 지닌 자도, / 0.450~2.130초 |
| KO 2 | 마법의 극에 닿은 자도. / 2.250~4.330초 |
| 전체 디코딩 | PASS |
| 화면 표본 | 0 / 1 / 1.291667 / 2 / 3 / 3.291667 / 5 / 5.958333초 |
| 표본 관찰 | 초반 염력으로 뜬 돌, 3초 부근 오른쪽 방어막에 도달하는 돌, 3.291667초 방어막의 국소 충격광, 5초 이후 바닥의 돌과 대치 자세가 확인됨. 두 인물은 같은 화면에 유지 |
| 손·소품 | 표본에서 초능력자의 빈손·대마법사가 쥔 단일 지팡이 유지. 신규 총기·불명확한 막대 없음. 전 프레임 손가락 무변형까지 보장하는 검사는 아님 |
| 자막 표본 | 두 구절 각각 중간 시점에서 정확한 한글, 하단 안전 여백·비잘림 확인 |
| 의도 대비 | 돌이 방어막에 맞는 공방이 읽힘. 3초 부근 짧은 청색 발사 잔광은 있으나 두 인물을 계속 연결하는 레이저로 이어지지 않음. 충격광이 마법진 근처를 잠시 가림 |
| 한계 | 8개 표본과 기술 검사는 전 구간 운동감·표정·음색을 연속 재생/청취한 최종 사용자 승인을 대신하지 않는다 |
| 저장·확인 | clean/final/JPEG/ZIP 모두 HTTP 200 후 media_confirm 완료. 로컬에는 최종 MP4·검수 JPEG·제작 ZIP·KO SRT·원화·원본 보이스 보존 |
| 판정 | 기술 PASS, 표본 화면에서 핵심 공방 확인. 사용자 확인 대기. 후속 컷·합본·게임 미작업 |

- [11컷 영어 더빙·한글 자막 검수본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/709c4ff5-e52f-42da-a600-edc996652b4e.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/66f691b0-1caf-47b9-aa19-2c66fc5fe70f.mp4)
- [검수 이미지](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3642240f-01f0-4399-a897-7d4c567d91bc.jpg)
- [원본·보이스·자막·검사 기록 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/873ef639-a118-4b4e-9ded-3c6b44d67c3c.zip)
- [Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_160404_dc6b3eb5-2bb4-49c7-a77f-7701eab72d9c.mp4)

로컬 최종: output/cinematic/b04_v2_en_ko.mp4. 이미지 생성은 내장 imagegen 스킬로 두 능력의 구분을 명확히 하고, audio-design 기준으로 기존 내레이션의 명료도를 유지하도록 BGM/SFX를 추가하지 않았다. 실제 영상 생성 제공자는 Higgsfield다.
