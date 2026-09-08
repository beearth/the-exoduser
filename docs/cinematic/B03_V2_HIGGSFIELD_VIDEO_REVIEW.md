# B03 v2 — 10번 기계형 인물 빈손 수정

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-07 사용자 스크린샷 지적 및 "그렇게해" 승인. v1의 기계형 인물 오른손에 의미 불명의 긴 막대가 원화부터 존재했고 영상에도 남았다. v1 시각 검수 누락을 인정하고 해당 소품을 제거했다. v2 검수본 완료, 기존 파일 보존, 사용자 확인 대기, 게임 미적용.

| 항목 | 계약 |
|---|---|
| 수정 | 오른쪽 기계형 인물 양손 빈손. 손에서 바닥으로 내려가는 막대·무기·늘어진 손가락 제거 |
| 보존 | 왼쪽 기사 대검, 두 인물 구도·크기·기계 몸·배경·색 |
| 이미지 | 내장 imagegen precise-object-edit, v1 원화 편집 |
| 새 원화 | output/cinematic/b03_v2_empty_hands_keyframe.png |
| 원화 media | 99fdb1c5-2f7a-479c-b0d4-1bc8d6c22050 |
| 영상 | Higgsfield cinematic_studio_video_v2, 5초 생성→4.5초 납본 |
| 설정 | 16:9, std, sound off, suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 / job | 5크레딧 / 40fd3ee9-2ae3-4b0c-a0bb-1a25b98c0f99 |
| 보이스 | 기존 b03_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 재사용, 재녹음 없음 |
| voice media | dff1f2c7-6140-4acf-b625-36f4194fa267 |
| 영어 | Those who held a blade. Those born of steel. |
| 한국어 | 검을 쥔 자도, / 강철의 몸을 가진 자도. |
| 음성 | 원본 3.291429초, +0.450초, 종료 3.741429초, 끝 여백 0.758571초. 피치·속도 그대로 |
| 자막 | 기존 clean 스타일 유지. Whisper 원고 대조 후 두 구절 타이밍 재확인 |
| 추가 시각 검사 | 무자막 마스터에서 양손~발 영역 x640/y340/w330/h370, 0~4초 0.5초 간격 및 마지막 107/24초의 10프레임 확대 검사 |
| 범위 | 10번만 수정. 11번·다음 컷·게임 코드 변경 없음 |

## 이미지 편집 프롬프트

Use case: precise-object-edit. Edit this exact cinematic keyframe. ONLY remove the long thin rod/staff/weapon held by the RIGHT cybernetic figure's outer right hand, including ALL parallel narrow rods running from that hand down to the ground. Reconstruct the small background areas revealed by their removal. Make that mechanical hand relaxed and clearly EMPTY, with normal short articulated fingers ending just below the palm; no elongated fingers reaching the ground. Both hands of the right cybernetic humanoid hold NOTHING. Preserve its attached anatomical limbs and body cables, but no loose long cable hanging from either hand. Do NOT remove or change the LEFT knight's large lowered greatsword. Preserve the two characters' positions, full-body silhouettes, scale, stance, heads, armor and mechanical design, the ruined cyberpunk/gothic background, all lighting, colors, exposure, framing and 16:9 ratio. No new weapons, props or effects, no text. This is a local object removal, not a new composition.

## 영상 프롬프트

Animate this exact corrected image as one quiet five-second cinematic shot. CRITICAL: the cybernetic humanoid on the RIGHT has TWO EMPTY HANDS throughout every frame. Its fingers are short, relaxed and stationary; nothing extends from either palm. No staff, rod, cane, sword, gun, loose hanging hand cable, elongated fingers or newly appearing object beside its hands or legs. The LEFT knight alone holds the existing lowered greatsword; preserve that sword. Both figures remain planted side by side, backs to camera, with identical scale, body design, stance and spacing as the image. No walking or head turning. A very slight slow camera push forward, retaining both figures' feet, and barely moving torn cloth and thin drifting ash mist. Preserve the mixed gothic and cyberpunk city and constant subdued lights. No new objects, extra limbs, transformations, battle, glow pulses or scene cuts. Maintain the original readable exposure and colors; no darkening fade. No text, no subtitles, no sound.

## 검수 / 납본

| 항목 | 실측 / 관찰 |
|---|---|
| 원화 | 오른손 아래의 긴 막대 제거, 양손 빈손, 기사 대검 보존 |
| 생성→최종 | 5.042초→4.500초, 영상 리타이밍 0.8925029750099167 |
| 포맷 | 1280×720, 24fps, H.264 + AAC |
| A/V | clean/final 영상·음성 모두 4.500초, 길이 차이 0초 |
| 디코딩 | 전체 파일 PASS |
| 영어 대조 | similarity 1.0, timed_words 9 / caption_words 9 |
| 자막 1 | 검을 쥔 자도, / 0.450~1.910초 |
| 자막 2 | 강철의 몸을 가진 자도. / 2.190~3.510초 |
| 전체 화면 표본 | 0 / 1.166667 / 2.833333 / 4초. 두 자막 표시·기사 대검·구도 확인 |
| 손 확대 표본 | 0 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3 / 3.5 / 4 / 4.458333초 |
| 확대 판정 | 10개 시점 모두 긴 막대·손에서 바닥으로 이어지는 물체 없음. 양손 빈손으로 보임 |
| 연출 차이 | 손가락이 약간 펴지는 자세 변화가 있음. 완전 정지 지시와 차이, 하지만 긴 막대 재등장 없음. 몸통·다리에 붙은 기존 배선은 보존 |
| 한계 | 10개 표본 검사이며 108프레임 전부의 수동 검수는 아님 |
| 업로드 | clean/final/전체 JPEG/손 JPEG/ZIP 모두 HTTP 200 후 확인 완료 |
| 보존 | v1·기존 더빙·11번 영상·게임 코드 그대로. 전체 길이 변화 없음 |

| 출력 | 바이트 |
|---|---:|
| output/cinematic/b03_v2_empty_hands_keyframe.png | 2310443 |
| output/cinematic/b03_v2_en_ko.mp4 | 896008 |
| output/cinematic/b03_v2_visual_check.jpg | 71177 |
| output/cinematic/b03_v2_hand_check.jpg | 93086 |
| output/cinematic/b03_v2_review.zip | 10641883 |

- [10번 빈손 수정 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/65687d06-2097-4989-a06d-2e4551eb7641.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/b6d7c2b1-14bd-4017-9651-a1e2a147b872.mp4)
- [손 확대 검사](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9f72aa21-83db-424f-835f-6826e65225a0.jpg)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/309da027-56a9-47b5-be63-045e9e52fcd3.zip)
- 자막 사이드카: output/cinematic/b03_v2_ko.srt
