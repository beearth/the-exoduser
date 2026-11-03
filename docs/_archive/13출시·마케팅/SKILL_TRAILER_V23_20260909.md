# V2 파생 스킬 트레일러 V23 — 보스 삭제·새 로고

> **2026-09-10 파생본:** [V25 설명 자막·데미지 텍스트 버전](SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md)은 58초 구성과 설명 문구를 유지한 별도 재촬영본이다. V23 원본 파일은 그대로 보존한다.

사용자 지정 원본 `EXODUSER_GAMEPLAY_TRAILER_V2_70S_1080P60.mp4`에서 다크드루이드 파트를 제거하고 엔딩 로고를 새로 디자인한다. V22 몽타주와 별개의 **설명 자막 있는 V2 파생본**이다.

| 항목 | 구현 계약 |
|---|---|
| 출력 | `captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V23_NO_BOSS_NEW_LOGO_58S_1080P60.mp4` |
| 원본 보존 | V2 파일을 덮어쓰지 않으며 빌드 전후 SHA256 일치 확인 |
| 길이 | 58초, 3480프레임, 1920×1080, 60fps |
| 0–54초 | 지정 V2의 기존 스킬 영상·설명 자막·환경 컷 유지 |
| 제거 | 원본 54–66초 `druid_boss_c` 12초와 보스 자막·보스 구간 전투음 |
| 54–58초 | 새 `skill_title_crimson_rift_v3.png` 로고 4초. 기존 66–70초 로고 대체 |
| 영상 형식 | H.264 High, CRF18 slow, yuv420p, BT.709 limited, AAC stereo48kHz 320kbps, faststart |
| 새 로고 | `output/imagegen/trailer/skill_title_crimson_rift_v3.png`. 내장 imagegen 사용. EXODUSER / HELL LORD 정확한 문구 유지, 은빛 금속·붉은 균열·중앙 수직 문양, 장식 테두리 제거 |
| 로고 연출 | 2560×1440 중간 확대, 1920×1080 출력. 240프레임 동안 zoom=1+0.025×on/239, 중앙 고정, 0.2초 인/3.5초부터0.5초 아웃 |
| 레터박스 | 위/아래 각38px, 아래 y1042 |
| SFX | 기존 V2 편집 원본 `tmp/trailer_v2/edit/picture.mp4` 음원 중0–54초. volume1.8/highpass35Hz, 53.85초부터0.15초 페이드 후58초까지 무음 패딩 |
| BGM | Bloodsteel Ascension 원본18–76초 연속58초, volume0.48, 인0.35초/56초부터2초 아웃 |
| 마스터 | amix normalize0, loudnorm I−16/TP−1.5/LRA9, 48kHz stereo |
| 도구 | `tools/build_skill_trailer_v23_20260909.py`, `tools/verify_skill_trailer_v23_20260909.py` |
| 범위 | 기존 영상 편집·신규 엔딩 이미지. 게임 코드/맵 제작/새 촬영 없음. V2 원본의 음성·전투 상태는 기존 V2 제작 기록을 따른다 |

## 이미지 생성 프롬프트

내장 imagegen, 기존 `steam_title_card_api_v2.png`를 편집 참조로 전달. 프로젝트 자산으로 복사하여 저장했으며 기존 이미지는 보존한다.

> Redesign this existing game trailer end-card into a distinctly new premium dark fantasy logo. Use case: logo-brand. Deliver one widescreen 16:9 1920x1080 or higher finished cinematic title card, not a mockup. Preserve ONLY the exact brand wording EXODUSER and the smaller subtitle HELL LORD, correctly spelled in English. Replace the entire ornate framing and lettering design. New design: monumental custom uppercase sharply cut serif lettering, pale worn silver / carved ash-white metal, restrained fine molten crimson fissures across select letters; wide yet readable kerning. A single vertical crimson eclipse-like slit / fractured seal subtly integrated behind the central D, with its upper and lower tips visible, extremely simple iconic silhouette. The word EXODUSER occupies about 72 percent of image width, centered around y=49%; subtitle HELL LORD below around y=65%, finely spaced smaller pale silver letters with slight crimson glint. Deep near-black charcoal atmospheric backdrop, very subtle ash haze and sparse red embers in the lower quarter, elegant cinematic negative space. Strong clear typography and craft, not crowded. Crisp high contrast readable on video. No thorn frame, no large decorative crest, no red diamonds, no skulls, no character, no extra text, no watermark, no UI. Whole logo comfortably inside 10 percent horizontal and 20 percent vertical safe margins. A finished new design, not a recolor of the reference.

## 검수

원본 보존 SHA256, 전체 디코드, 58초/3480프레임/영상·음원 포맷, 기존0–54초 중7개 프레임의 평균 픽셀 차이3/255 미만, 로고 구간 Chrome 실제 재생, 마지막 연결·철자·페이드 육안 검수를 수행한다. 실측 결과는 `tmp/trailer_v23/verification.json`, 11개 프레임 연락판은 `tmp/trailer_v23/CONTACT.jpg`에 기록한다.

| 최종 검사 | 결과 |
|---|---|
| 파일 | 108,667,308 bytes, 58.000초, 3480프레임, 1920×1080/60fps |
| 원본 | SHA256 보존 PASS, 지정 V2 변경 없음 |
| 디코드 | 영상·오디오 전체 FFmpeg 디코드 PASS |
| 앞부분 비교 | 13/23/33/36/42/49/53.8초, 원본 대비 평균 픽셀 차이0.6244–1.1865/255. 재인코딩 손실 범위이며 컷/설명 유지 |
| 보스 제거·로고 | 53.8초 마지막 스킬 →54.4/55.5/57초 새 로고 →57.8초 아웃 확인. 보스 컷/보스 설명 없음 |
| 소리 | mean_volume −18.7dB, max_volume −1.5dB |
| Chrome | 로고54.5초 seek 후55.465605초 전진, 58초/1920×1080, media error 없음 |
| 코드 | 두 Python 도구 py_compile PASS |
| 시각 판정 | PASS — 최종 11개 프레임의 설명 보존·새 로고 철자·프레임 여백·연결·페이드 확인 |
