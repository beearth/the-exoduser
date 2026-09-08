# 전체 콘티 10번 — B03 검과 강철의 몸

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 2026-09-07 사용자 검수에서 기계형 인물 오른손의 불명확한 막대 소품을 지적했다. 원화부터 존재한 오류이며 v1 검수 누락이다. [빈손 수정 v2](B03_V2_HIGGSFIELD_VIDEO_REVIEW.md)를 최신 후보로 제작하며 아래 v1 기록은 이력으로 보존한다.

2026-09-06 사용자 "10컷" 요청. 8·9번의 사이버펑크·판타지 혼재를 이어가는 두 형체의 동등한 뒷모습. 원화·영어 보이스·Higgsfield 영상·한글 자막 검수본 완료. 사용자 확인 대기, 게임 미적용.

| 항목 | 계약 |
|---|---|
| 순서 / ID | 10 / B03 (p14 대응) |
| 한국어 | 검을 쥔 자도, / 강철의 몸을 가진 자도. |
| 영어 | Those who held a blade. Those born of steel. |
| 원화 | output/cinematic/b03_v1_two_figures_keyframe.png |
| 이미지 생성 | 내장 imagegen, stylized-concept. p14.jpg 구도와 B01 v2 색·재질 참고, 기존 원화 보존 |
| 두 형체 | 대검을 내린 판금 기사 / 노출된 관절·배선·청록 회로의 부식된 사이버네틱 몸. 동일 높이·지면·방향, 얼굴 미노출 |
| 배경 | 고딕 석조 유적과 네온 고층 구조. 8·9번 최신 혼합 문명 방향 연속 적용 |
| 인물 해석 | 시대·형태의 동등함. 특정 주인공·승자·패자·대결·탈출 성공 설정 아님 |
| 움직임 | 발 고정, 미세 천 흔들림과 재·얇은 안개, 매우 작은 카메라 전진 |
| 이미지 media | d9241637-6fda-410d-965c-3bbd023e11e4 |
| 음성 생성 | 기존 tools/elevenlabs_tts.mjs를 통한 ElevenLabs 직접 생성 |
| voice / model | WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 |
| settings | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/b03_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 실측 | 53124바이트, 3.291429초 |
| 음성 media | dff1f2c7-6140-4acf-b625-36f4194fa267 |
| 최종 길이 계획 | 4.500초, voice +0.450초, 원본 음성 종료 3.741429초, 이후 0.758571초. 음성 속도·피치 변경 없음 |
| 길이 변경 | 구안 3.6초는 실제 더빙과 여백에 부족. 최종 4.5초로 +0.9초, 전체 잠정 합계 128.892초 |
| 영상 모델 | Higgsfield cinematic_studio_video_v2 |
| 생성 설정 | duration 5, 16:9, std, sound off, suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 | 사전 조회 5크레딧 |
| job | 1a4a4e0a-943f-4b39-af46-86d6d61a51dd |
| 자막 | Whisper clock + 영어 원고 일치 검증 후 KO 두 구절. WenQuanYi Zen Hei / 13 / marginv 23 / outline 0.8 / shadow 0.4 / no-caps |
| 오디오 디자인 | 기존 저음 내레이터·명료도 유지. 추가 음악/효과음 없음, 음성 끝 보존 |
| 범위 | 10번만 신규 제작. 기존 에셋·게임 코드·다음 컷 변경 없음 |

## 원화 프롬프트

Use case: stylized-concept. Create a new photoreal cinematic 16:9 keyframe for a solemn Hell game opening, shot 10: "Those who held a blade. Those born of steel." Image 1 is a composition reference: two anonymous full-body figures of equal height standing side by side with backs facing camera, same plane, looking into the same Hell. Image 2 is the latest palette and world-design reference: cyberpunk towers physically mixed with gothic fantasy ruins. Neither is a pixel-preservation edit target.
The left figure is a battered medieval fantasy knight in engraved blackened plate armor with torn dark cloth, holding a worn greatsword lowered toward the ground. The right figure has an unmistakably futuristic humanoid steel body: exposed spine actuators, segmented black alloy shoulder plates, robotic joints, intricate bundled wires and faint cyan circuit seams, with small desiccated organic remnants fused to its corroded framework. The head is a faceless mechanical shell seen from behind. Not a second medieval knight, not a clean shiny robot, no gore. Both same human scale, same weary still stance, neither dominant or triumphant, no confrontation, not facing one another. Full bodies including grounded feet visible; readable distinct silhouette gap.
Beyond them through thin ash mist: decayed gothic stone buttresses intermixed with broken high-tech concrete and metal towers with a few dim cyan/magenta neon fragments. Strong dark silhouettes in subdued backlight, enough fill to read plate armor versus mechanical anatomy. Match image 2's charcoal, bronze corrosion and restrained cyan/violet palette. Weathered tactile detail, mournful scale, no orange inferno overwhelming the cyan details. Lower center keep dark for later captions. No living crowd, no extra limbs, no weapon firing, no spell effects, no hero poster pose, no text, no logo, no watermark.

## 영상 프롬프트

Animate the exact two figures in this image as one quiet five-second cinematic shot. A battered medieval knight with a lowered greatsword and a corroded cybernetic humanoid stand side by side at equal height, backs to camera, facing the same mixed gothic and neon city of Hell. Keep their feet planted and their distance, body proportions, armor, exposed mechanical joints, hands and weapons unchanged. No walking, no turning heads, no raising weapons, no interaction or battle. Only the knight's torn cloth shifts almost imperceptibly in the wind, and fine ash and a thin low mist drift slowly through the scene. The camera makes a very gentle tiny push forward, retaining both complete silhouettes and their feet. Keep the cyan and violet lights subdued and constant, and preserve detail in dark armor and machinery. Do not turn the mechanical body into medieval armor or new flesh. No additional limbs or people, no dramatic reveal, no glow pulse, no explosions, no collapsing city, no text, no subtitles, no sound. End with both figures still looking into the same Hell.

## 검수 / 납본

원화에서는 판금 갑주와 기계 골격이 구별되며, 유기 잔재는 뚜렷하지 않고 기계 몸의 표현이 우세하다.

| 항목 | 실측 / 관찰 |
|---|---|
| 원본 → 납본 | 5.042초 → 4.500초, 영상 리타이밍 0.8925029750099167 |
| 최종 | 1280×720, 24fps, H.264 + AAC |
| A/V | clean/final 모두 영상·오디오 4.500초, 차이 0초 |
| 음성 보존 | 원본 3.291429초 전체, +0.450초. 속도·피치 변경 없음, 이후 여백 0.758571초 |
| STT | similarity 1.0, timed_words 9 / caption_words 9, 원고 전체 일치 |
| 자막 1 | 검을 쥔 자도, / 0.450~1.910초 |
| 자막 2 | 강철의 몸을 가진 자도. / 2.190~3.510초 |
| 전체 디코딩 | PASS |
| 화면 표본 | 0 / 1.166667 / 2.833333 / 4.000초 |
| 실제 화면 | 기사와 기계 골격이 같은 방향으로 서 있는 구도, 낮춘 검과 배경의 청록·보라 잔광 유지. 표본에서 걷기·대결·무기 들기 없음 |
| 자막 화면 | 두 중간 표본에 각 구절 정확히 표시, 잘림 없음. 처음·마지막은 무자막 여백 |
| 원화 차이 | 원화보다 어두운 결과, 작은 구도·천 변화. 미세 형체 불변을 보증하지 않음 |
| 검수 한계 | 네 표본의 시각 검사와 전체 디코딩·STT 검증이며 전체 연출/청취의 최종 사용자 승인을 대신하지 않음 |
| 업로드 | clean/final/JPEG/ZIP 모두 HTTP 200 후 media_confirm 완료 |
| 다음 컷 | 당시 구안 B04 v1은 이후 제작했으나 사용자 거절. 2026-09-07 최신 [B04 v2](B04_V2_HIGGSFIELD_VIDEO_REVIEW.md)는 "초능력을 지닌 자도, 마법의 극에 닿은 자도." 교전 장면으로 개정 |

| 저장 경로 | 바이트 |
|---|---:|
| output/cinematic/b03_v1_two_figures_keyframe.png | 2380405 |
| output/cinematic/b03_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 | 53124 |
| output/cinematic/b03_v1_en_ko.mp4 | 853393 |
| output/cinematic/b03_v1_visual_check.jpg | 70222 |
| output/cinematic/b03_v1_review.zip | 10345007 |

- 자막 사이드카: output/cinematic/b03_v1_ko.srt
- [10번 영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/fce8a835-d099-4e1c-886d-35bc7f75df4f.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/2613781c-ef4e-4f77-a6c3-121b6ed10ebf.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4b1ff8ce-b4e0-4b16-bbbf-16e3bb17fb34.zip)
- [Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_144955_1a4a4e0a-943f-4b39-af46-86d6d61a51dd.mp4)
