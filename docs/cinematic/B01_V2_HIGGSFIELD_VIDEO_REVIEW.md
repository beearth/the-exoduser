# 전체 콘티 8번 B01 v2 — 사이버펑크·판타지 혼재

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 합본 최신 변경: [인트로 합본 v2](WORLD_INTRO_V2_BRIDGE_20260907.md)는 이 영상의 처음 1.75초를 도시 화면으로 사용하고, 원래 영어 음성은 다음 B02 무기 화면까지 이어간다. 아래 4초는 보존된 개별 B01 v2 자산 규격이며 변경하지 않는다.

2026-09-06 사용자 피드백: "너무그냥 패허인데 사이버펑크든 판타지든 막 석어서보여줘야하는데". B01 v1은 일반적인 중세 폐허로 읽혀 교체 후보를 제작했다. 기존 원화 p12.jpg, v1 영상과 보이스는 보존한다. v2 검수본 완료, 사용자 승인 대기, 게임 미적용.

## 최신 연출 계약

| 항목 | 값 / 의도 |
|---|---|
| 전체 순서 / 내부 ID | 8 / B01 |
| 한국어 | 지옥은 시대를 묻지 않는다. |
| 영어 | Hell does not ask what age you came from. |
| 원화 생성 | 내장 imagegen, 신규 생성. CLI/API 대체 경로 사용 안 함 |
| 새 원화 | output/cinematic/b01_v2_mixed_worlds_keyframe.png |
| 원화 media | f1c9ec6f-67e2-40b9-9c1f-0a66053ffe90 |
| 전경 | 사이버네틱 기계 잔해·케이블과 장식된 기사 투구·대검 |
| 중·원경 | 네온 고층 건물, 판타지 성채·첨탑, 마법 수정 석조 아치, 고가 선로가 같은 공간에 교차 |
| 색 | 재·부식·흑갈색 기반에 식별 가능한 청록/자홍 네온과 보랏빛 마법 잔광 |
| 구안과 충돌 | 기존 콘티 §1-1의 네온·명시적 SF 금지는 이 B01 v2에 적용하지 않는다. 최신 사용자 요청을 우선한다. 다른 컷·게임 전체 설정을 일괄 개정한 것은 아님 |
| 보이스 | 기존 ElevenLabs WS6naCm8T4gbyzsLnOjK 원본 재사용, 재녹음 없음 |
| 보이스 원본 | output/cinematic/b01_v1_en_WS6naCm8T4gbyzsLnOjK.mp3, 2.742857초 |
| 보이스 media | 7d1231c9-0b47-48dc-b419-4b1b544fe110 |
| 영상 | Higgsfield cinematic_studio_video_v2, 4초, 16:9, std, sound off, suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 | 사전 조회 4크레딧 |
| job | 94b0cdea-970b-48cb-8f26-de599ef841f7 |
| 연출 | 짧고 느린 오른쪽 측면 이동, 재·얇은 안개만 움직임. 건축물·유물 변형, 붕괴, 전투 없음 |
| 최종 편집 계획 | 4.000초·24fps, 보이스 +0.450초, 끝 여백 0.807143초, 보이스 속도/피치 유지 |
| 자막 계획 | Whisper 원고 대조 후 KO 매핑, WenQuanYi Zen Hei / 13 / marginv 23 / outline 0.8 / shadow 0.4 / no-caps |
| 범위 | 8번만 재제작. B02~B06, 전체 합본, 게임 적용은 별도 |

## 신규 원화 프롬프트

Create one cinematic keyframe, landscape 16:9, for a dark mythic game opening: "Hell does not ask what age you came from." A single physically coherent immense hellscape where fallen CYBERPUNK and HIGH FANTASY civilizations are unmistakably intermingled, not a generic medieval ruin. Photoreal cinematic matte painting, tactile weathered detail, tragic solemn atmosphere.
Wide low camera at a ruined street. Foreground: a broken chrome-and-black cybernetic torso with luminous cyan circuits lies beside an ornate knight helmet and chipped enchanted greatsword; thick power cables snake through ancient carved stones. Midground hero composition: a monumental gothic fantasy fortress and towering rune-carved stone arch physically intersect with the wreckage of a cyberpunk skyscraper, exposed mechanical floors, fractured glass curtain walls, bright but damaged cyan and muted magenta neon bars; ruined stone battlements run between the futuristic towers. An enormous broken sci-fi elevated rail track cuts diagonally across the fantasy masonry. Further back, medieval spires and skeletal high-tech megatowers alternate and overlap at different depths. A shattered arcane crystal embedded in the stone arch glows faintly violet. Cyberpunk identifiers must remain CLEARLY VISIBLE at thumbnail size, with recognizable high-tech building silhouettes and colored neon strips; fantasy castle towers and magic rune arch equally legible. No split-screen and no left-half/right-half theme partition.
Everything shares the same ash, corrosion, accumulated destruction and low red-brown mist. Overcast charcoal sky, soft ash falling, distant ember horizon, somber bronze shadows, selective cyan and magenta light reflections. Not a lively city, not an active battle. Deep environmental storytelling, strong silhouettes, controlled detail and layered scale, no excessive opaque fog hiding architecture. Keep lower central 12 percent reasonably dark and uncluttered for later Korean subtitles.
No living characters, no gore, no text, no readable signs, no logos, no watermark, no border, no UI. This is a fresh composition, not an edit of a generic ruined castle.

## Higgsfield 영상 프롬프트

Animate this exact image as one restrained four-second establishing shot of Hell where cyberpunk and fantasy worlds have accumulated together. Preserve all architecture and objects: clearly visible cyan and magenta neon skyscrapers interwoven with gothic castle towers, broken elevated rail and the violet crystal stone arch, cybernetic wreckage and ornate knight helmet and sword in the foreground. All structures and artifacts stay rigid, unchanged and motionless. The camera tracks very slowly a short distance to the right, gentle foreground/background parallax, no zoom, no orbit, no dramatic reveal. Only a few fine ash particles drift down and thin ground haze moves gently. Keep the neon and violet crystal visible with stable subdued brightness; no flickering or new light effects. Maintain the somber charcoal and bronze atmosphere with selective cyan and violet accents. No people, creatures, combat, moving machines, collapsing ruins, transformations, melting geometry, new objects, explosions, lightning, scene transitions, text, logo or speech. End still looking at the same intermingled cyberpunk and fantasy city ruins.

## 검수와 납본

| 항목 | 실측 / 관찰 |
|---|---|
| 원본 → 최종 | 4.042초 → 4.000초, 영상 리타이밍 0.9896091044037606 |
| 최종 포맷 | 1280×720, 24fps, H.264 + AAC |
| A/V 길이 | clean/final 모두 영상 4.000초·오디오 4.000초, 차이 0초 |
| 음성 | 기존 원본 2.742857초 전부 재사용, +0.450초, 원본 종료 3.192857초, 이후 0.807143초 여백 |
| STT | 원고 일치 similarity 1.0, timed_words 9 / caption_words 9 |
| 자막 | 지옥은 시대를 묻지 않는다. / 0.450~2.990초 |
| 전체 디코딩 | PASS |
| 화면 표본 | 1.083333 / 2.375 / 2.500 / 3.500초 |
| 실제 화면 | 네온 고층 구조와 고딕 첨탑·보라색 수정 아치가 같은 깊이 공간에 유지됨. 전경 기계 잔해·투구·대검도 식별 가능 |
| 자막 표본 | 첫 세 프레임에 정확한 한글, 마지막 프레임은 자막 종료. 하단 잘림 없음 |
| 연출 차이 | 시점 변화가 작고 후반에 우측 투구와 고층 건물 프레이밍이 조금 달라짐. 원화 대비 안개·광원 질감 차이는 있음 |
| 판정 한계 | 네 표본 프레임 검사와 전체 파일 디코딩 검증이며, 모든 프레임의 형태 불변 또는 전체 청취·사용자 최종 연출 승인을 대신하지 않음 |
| 업로드 | clean/final/JPEG/ZIP 모두 HTTP 200 후 media_confirm 완료 |
| 보존 | 기존 원화·v1·게임 코드 그대로. B02 이후 추가 생성 없음 |

### 출력

| 파일 | 바이트 |
|---|---:|
| output/cinematic/b01_v2_mixed_worlds_keyframe.png | 2816601 |
| output/cinematic/b01_v2_en_ko.mp4 | 1247328 |
| output/cinematic/b01_v2_visual_check.jpg | 106456 |
| output/cinematic/b01_v2_review.zip | 9965739 |

- 한국어 사이드카: output/cinematic/b01_v2_ko.srt
- [영어 더빙·한글 자막 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1fc2033e-9337-4ee2-a607-824095d1bb5c.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/dcd5018f-b465-4b4f-afb3-f34fa71dd031.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/87f68d77-0914-40ef-a65e-4017f6377cff.zip)
- [Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_141909_94b0cdea-970b-48cb-8f26-de599ef841f7.mp4)
