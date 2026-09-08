# 전체 콘티 9번 — B02 시대가 뒤섞인 유물

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 합본 최신 변경: 사용자가 긴 침묵을 거부하여 [인트로 합본 v2](WORLD_INTRO_V2_BRIDGE_20260907.md)에서는 이 영상의 처음 2.25초를 사용하고 앞 컷의 “지옥은 시대를 묻지 않는다” 영어 음성과 한글 자막을 이어받는다. 아래 4초·무대사·무음은 보존된 개별 B02 자산 제작 이력이며 최신 합본의 음향 계약이 아니다.

2026-09-06 사용자 "9컷가자" 요청. 8번 B01 v2의 사이버펑크·판타지 혼재에서 이어지는 4초 무대사 근접 컷. 기존 p13.jpg는 보존한다. 검수본 완료, 사용자 연출 확인 대기, 게임 미적용.

| 항목 | 계약 |
|---|---|
| 전체 순서 / ID | 9 / B02 (p13 대응) |
| 대사·자막 | 없음. 4초 침묵 |
| 원화 판단 | 기존 p13은 기계 팔이 중세 건틀릿처럼 읽힘. 8번의 최신 혼합 문명 방향에 맞춰 신규 원화 제작 |
| 신규 원화 | output/cinematic/b02_v1_relics_keyframe.png |
| 이미지 생성 | 내장 imagegen, stylized-concept, 신규 생성. B01 v2를 색·재질 연속성 참고로만 사용 |
| 이미지 참고 | output/cinematic/b01_v2_mixed_worlds_keyframe.png |
| 원화 media | 7821585c-ba94-4c61-900d-0a375e7d007f |
| 물체 | 청동빛 녹이 슨 장식 검, 중세 대검, 목재 총상을 가진 고식 총기, 관절·배선·청록 회로가 노출된 기계 팔 |
| 원화 관찰 | 검 두 자루·총기·기계 팔이 각각 식별됨. 총기의 정확한 역사적 작동방식은 보증하지 않음; 구안 화승총 의도는 생성 프롬프트에 포함 |
| 연출 | 느리고 작은 오른쪽 측면 이동, 얇은 재 안개. 유물·손가락은 고정. 발사·부활·회수·작동 연출 없음 |
| 최신 방향 | 8번의 사이버펑크 혼합 표현을 9번 유물 근접에 연속 적용. 구안의 기계 요소 식별 억제보다 최신 사용자 방향 우선 |
| 영상 모델 | Higgsfield cinematic_studio_video_v2 |
| 설정 | duration 4, 16:9, std, sound off, suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 사전 비용 | 4크레딧 |
| job | bb9bcc0a-a811-4091-aa56-26e02a4c258a |
| 최종 포맷 계획 | 4.000초, 1280×720, 24fps, H.264 + 무음 AAC |
| 음향 계획 | 생성 음향 미사용. 합본 호환용 48kHz 스테레오 디지털 무음만 추가. TTS·음악·효과음·자막 생성 없음 |
| 검수 계획 | 전체 디코딩, A/V 길이, 무음 PCM 확인, 0/1/2/3.5초 표본 검사 |
| 변경 범위 | 이 컷 자산·제작 문서만. 원본·게임 코드·10번 이후 그대로 |

## 이미지 프롬프트

Use case: stylized-concept. Create a NEW 16:9 cinematic close-up keyframe for shot 9 of a somber dark-fantasy and cyberpunk Hell opening. Input image 1 is ONLY a mood/material/palette continuity reference from the previous wide establishing shot, not an edit target. Now look down obliquely at the abandoned relics on that ash-covered stone street, not another city panorama.
Four clearly distinct objects lie naturally tangled and half-buried in the same ash: an ancient bronze sword with green patina, a chipped ornate medieval steel greatsword, a weathered wood-stock matchlock musket with recognizable barrel/trigger/lock, and a broken futuristic cybernetic forearm with a relaxed five-finger mechanical hand. Show exposed precision actuators, blackened alloy plates, wire bundles and a faint cyan circuit seam so the arm cannot be mistaken for a medieval gauntlet. No flesh, no person, no blood. Mechanical fingers rest loosely on the ground, grasp nothing. All artifacts inert and abandoned. Sword guards, gun lock and robotic wrist must each remain legible, no hybrid melted objects. Objects casually overlap at different diagonals with asymmetric believable scale, not a museum lineup or four-panel comparison.
Photoreal cinematic still, tactile ash, pitted metal, crumbling stone, frayed leather, shared corrosion; low charcoal and tarnished bronze palette with very restrained cyan reflected light from the unseen cyberpunk city and a faint violet reflection on old steel. Shallow atmospheric background but sufficient focus across the four relics. Solemn, indifferent accumulation of civilizations, dark yet clearly readable. Tight ground-level insert composition, relics fill frame, no skyline, no active battle, no hovering items, no magic activation, no sparks, no text, no subtitles, no logos, no borders, no watermark.

## 영상 프롬프트

One silent four-second cinematic close-up of the exact abandoned relics in the reference image. Preserve both ornate swords, the old wood-stock firearm, and the exposed mechanical forearm and relaxed hand lying across ash-covered stone. They are separate solid objects, completely inert and rigid for the entire shot. The camera makes a very slow tiny sideways track to the right, keeping all four relics visible and their relative placement unchanged. Fine ash drifts gently across the ground in a thin barely visible layer. Preserve the subdued cyan circuit seam and faint violet reflections at constant intensity. Keep the dark charcoal, tarnished bronze and pitted steel material detail readable. No hand or finger movement, no gripping, no weapon motion, no firing, no sparks, no glow pulse, no new objects, no flesh or people, no reassembly, no melting or morphing, no dramatic zoom or focus shift, no scene transition, no text or subtitles, no sound. End with the artifacts resting exactly as they began.

## 검수 / 출력

| 항목 | 실측 / 관찰 |
|---|---|
| 생성 원본 | 1280×720, 24fps, 컨테이너 4.042초 / 영상 스트림 4.041667초, 오디오 없음 |
| 최종 | 1280×720, 24fps, H.264 + AAC, 영상·오디오·컨테이너 모두 4.000초 |
| 영상 리타이밍 | 0.9896091044037606 |
| 디코딩 | 전체 파일 PASS |
| 무음 | 최종 AAC를 s16le PCM으로 디코딩한 모든 바이트가 0임을 확인 |
| 화면 표본 | 0 / 1 / 2 / 3.5초 |
| 실제 화면 | 두 검·목재 총상 총기·기계 팔과 청록 회로가 유지됨. 작은 시점 이동, 손이 새로 쥐거나 무기가 작동하는 모습은 표본에서 보이지 않음 |
| 원화 차이 | 생성 영상이 원화보다 어둡게 보임. 유물 식별은 가능하지만 밝기는 사용자 화면 검수 대상 |
| 판정 한계 | 표본 시각 검사이므로 모든 프레임의 미세 변형 부재를 보증하지 않음. 전체 연출 최종 승인은 별도 |
| 업로드 | MP4/JPEG/ZIP 모두 HTTP 200 후 media_confirm 완료 |
| 다음 | 전체 10번 B03, "검을 쥔 자도, 강철의 몸을 가진 자도." 아직 생성하지 않음 |

| 저장 경로 | 바이트 |
|---|---:|
| output/cinematic/b02_v1_relics_keyframe.png | 2748702 |
| output/cinematic/b02_v1_silent.mp4 | 1892927 |
| output/cinematic/b02_v1_visual_check.jpg | 114204 |
| output/cinematic/b02_v1_review.zip | 11689942 |

- [9번 무음 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/21fd9c3e-547c-45f1-b32c-523f018e531b.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/29a1fe7a-da44-4b93-ab09-fdae1cb615bd.zip)
- [Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_143745_bb9bcc0a-a811-4091-aa56-26e02a4c258a.mp4)
