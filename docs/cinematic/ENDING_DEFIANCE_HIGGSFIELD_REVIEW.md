# 세계관 인트로 — 저항의 엔딩 검수 v1

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 2026-09-07 재사용: 사용자 요청으로 이 영상의 15.5~19.5초 금속 EXODUSER / HELL ROAD 타이틀만 [전체 합본 v3](WORLD_INTRO_V3_TITLE_20260907.md) 마지막 4초에 재사용한다. E01/E02의 예전 대사·장면은 새 합본에 복원하지 않는다. 원본은 보존한다.

## 범위와 상태

2026-09-06 사용자 확정 결말. 신규 원화 2장, Higgsfield 영상 2컷, 영어 ElevenLabs 더빙, 한국어 자막, 암전 후 EXODUSER / HELL ROAD 타이틀 검수본 제작 완료.
기존 B블록 전체를 자동 제작하거나 기존 게임 인트로를 교체하지 않는다. 이 문서는 새 영상 후보이며 런타임 미적용, 사용자 검수 대기다.

| 구간 | 길이 계획 | 한국어 자막 | 영어 내레이션 |
|---|---:|---|---|
| E01 기억과 방향 | 8초 | 자신이 누구인지, / 어디로 가야 하는지 기억하는 자들은… / 싸울 기회를 가진다. | Those who remember who they are... and where they must go... are granted a chance to fight. |
| E02 선의와 저항 | 7초 | 일말의 선의라도 남은 자들. / 추락에 대항하는 자들. | Those with even a trace of goodness left. Those who defy the fall. |
| 암전 | 0.5초 | 없음 | 없음 |
| 타이틀 | 4초 | EXODUSER / HELL ROAD | 없음 |

## 제작 설정

| 항목 | 값 |
|---|---|
| 원화 생성 | 내장 image_gen, 신규 독립 원화 2장; Higgsfield 이미지 생성이라고 표기하지 않음 |
| 영상 | Higgsfield cinematic_studio_video_v2, std, 16:9, sound off, genre suspense, speedramp linear, multi_shots false, cfg_scale 0.5 |
| 영상 사전 비용 | E01 8 + E02 7 = 15크레딧 |
| E01 job | e57e230d-1f65-4659-bb45-ba94e28d1504 |
| E02 job | 3db5790d-a6bd-4024-b6f0-3b44f7ba5cf0 |
| 더빙 | ElevenLabs native voice WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2 |
| 더빙 파라미터 | stability 0.65, similarity_boost 0.8, style 0.15, speaker_boost true |
| 내레이션 선행 여백 | 각 컷 0.45초; 목소리 속도/피치 변경 없음 |
| 자막 | Whisper 단어 정렬; 두 구간 similarity 1.0, E01 17/17단어, E02 13/13단어 |
| 자막 스타일 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps; 기존 영상 컷과 동일 |
| 로고 | 기존 img/logo_exoduser.png 재사용, HELL ROAD 문구는 후반 합성으로 정확히 표기 |
| 게임 코드 | 수정 없음 |

## 로컬 원본

- output/cinematic/ending_e01_remember_v1.png
- output/cinematic/ending_e02_defy_v1.png
- output/cinematic/ending_e01_v1_en_WS6naCm8T4gbyzsLnOjK.mp3
- output/cinematic/ending_e02_v1_en_WS6naCm8T4gbyzsLnOjK.mp3

## 원화 프롬프트 (내장 image_gen)

### E01

Use case: stylized-concept. Asset type: original cinematic keyframe for a dark fantasy game ending, landscape 16:9 full bleed. Style: somber charcoal engraving and richly textured painterly realism, brutal ancient ruins, deep blacks with readable worn surfaces, restrained tarnished gold edge light and a few ember-red accents. Oppressive atmosphere, not glossy CGI, not anime, no cute proportions, no neon, no holy aura, no text, no watermark, no logo, no panels, no borders. Reserve the bottom 15 percent for later subtitles with low contrast detail. Human resolve is quiet, not triumphant. Scene: inside an immense ash-choked ruined underworld, one exhausted adult human survivor kneeling on one knee on a dark stone ledge, beginning to lift their head toward a distant narrow pale opening high beyond the frame. Medium-wide three-quarter view, face still recognizably human with soot, one bare hand pressed against their chest as if recalling who they are, the other hand braced on the ground. Short dark tangled hair, ragged charcoal cloak and heavily worn simple iron armor, no helmet or decorative crown. One eye catches a tiny natural glint, never glows. Their back is bent but gaze purposeful: they remember their identity and where they must go, and retain the chance to fight. Keep anatomy coherent, both hands visible and natural. Ash falling downward contrasts with the upward gaze. No other figures, no new magical object, no readable runes, no active violence.

### E02

Use case: stylized-concept. Asset type: original cinematic keyframe for a dark fantasy game ending, landscape 16:9 full bleed. Style: somber charcoal engraving and richly textured painterly realism, brutal ancient ruins, deep blacks with readable worn surfaces, restrained tarnished gold edge light and a few ember-red accents. Oppressive atmosphere, not glossy CGI, not anime, no cute proportions, no neon, no holy aura, no text, no watermark, no logo, no panels, no borders. Reserve the bottom 15 percent for later subtitles with low contrast detail. Human resolve is quiet, not triumphant. Scene: a wide desolate stone ledge in an immense ruined underworld with a steep broken path rising away through black mist. Exactly two adult survivors, small enough to feel the world is enormous yet their hands clearly readable. One standing but stooped adult with short dark tangled hair, ragged charcoal cloak and battered simple iron armor extends one bare hand downward to a second exhausted adult on one knee; their hands are about to clasp. The second wears deeply corroded iron armor fused with dark worn organic material, still clearly an adult person, no clean robot styling. This tiny act of assistance amid Hell embodies a last trace of goodness. Both figures face toward the same steep upward path and stand against ash and debris continually falling down. Quiet determination rather than superhero triumph. The rising path must not become a bright heavenly staircase; destination stays dark and difficult. Figures have equal dignity. No crowds, no children, no glowing eyes, no banners, no angel, no extra limbs, no active battle.

## Higgsfield 영상 프롬프트

### E01

Animate the supplied image as one restrained dark-fantasy cinematic shot. Preserve this exact exhausted adult man's face, worn armor, cloak, kneeling pose, ruins and composition. A very slow subtle camera push toward him. He takes one heavy breath, gradually lifts his chin and steadies his gaze toward the dim path above; his hand remains at his chest and his other hand stays firmly braced on stone. His expression moves from exhaustion to quiet resolve, never smiling. Only faint ash drifts DOWN, and a little cloth moves in cold wind. Nearly still physical acting, credible anatomy. No lip movement, speech, extra people, new weapons, magical effects, bright glow, camera shake, scene transitions, text or logos. Bleak charcoal stone, desaturated bronze, faint natural pale rim light. Keep bottom subtitle area visually quiet. End holding the determined look.

### E02

Animate the supplied image as one restrained dark-fantasy cinematic shot. Preserve these exact two adult survivors, worn armor and cloaks, broken ascending stair, gigantic ruins, and subtle muted golden reflections. Slow gentle camera push. The standing survivor's extended hand moves a few centimeters to take the kneeling companion's offered hand; they form one natural firm clasp and hold it. The kneeling survivor shifts weight slightly forward to begin rising, but does NOT fully stand or take a step. Keep bodies and hands anatomically stable, only two people and their original limbs. Their small act of help conveys a trace of goodness and resistance to the downward pull. Fine ash and debris fall DOWN around them, against the uphill direction of the stone path. Cloth stirs softly. No combat, no falling humans, no additional characters, no morphing, no lip movement or speaking, no magic or excessive glow, no cuts, no text or logos. Maintain dim desaturated dark-fantasy realism, preserve original framing and leave lower area readable for subtitles. Settle into a still clasp at the end.

## 검수

제작 및 기술 검수 완료. 사용자 최종 연출 승인 대기. 게임 미적용.

| 항목 | 실측 결과 |
|---|---|
| 최종 길이·규격 | 19.500초, 1280×720, 24fps, H.264 + AAC |
| A/V 정합 | 영상 19.500초 / 오디오 19.500초, 차이 0초; 무자막/자막본 길이 동일 |
| 음성 원본 | E01 6.217143초 / E02 5.433469초 |
| 음성 보존 | 컷별 0.450초 뒤 시작, 원본 전부 포함, 속도·피치 변경 없음 |
| 전환 | E02 마지막 0.5초 페이드아웃, 15.0~15.5초 암전, 15.5~19.5초 타이틀 (0.75초 등장·마지막 0.4초 소멸) |
| 디코딩 | 전체 ffmpeg 디코딩 PASS |
| 확인 화면 | 1.291667 / 3.041667 / 5.208333 / 9.833333 / 12.791667 / 17.500초 |
| 자막·타이틀 | 승인 한국어 5구절 모두 글리프 정상, 하단 잘림 없음. 기존 EXODUSER 로고와 HELL ROAD 표시 확인 |
| 실제 연출 | E01 무릎 꿇은 인물이 위를 바라보며 고개를 점차 듦. E02 두 사람이 손을 잡고 무릎 꿇은 동료가 몸을 앞으로 일으키기 시작함. 검사 프레임에서 인물 수·손 연결 유지 |
| 판정 한계 | 샘플 프레임 시각 검수와 기술 검수는 전체 동작의 사용자 감상·연출 승인을 대신하지 않음 |
| 오디오 디자인 | 내레이션 명료도 유지, 추가 음악·효과음 없음 |
| 업로드 | 무자막 마스터·편집 소스 ZIP·최종 영상·JPEG·검수 ZIP 모두 업로드 성공 및 media_confirm 완료 |
| 적용 범위 | 검수 자산과 제작 문서만 추가. 기존 게임 코드·원화·보이스 변경 없음 |

### 최종 자막 타이밍

| 구절 | 시작 | 종료 |
|---|---:|---:|
| 자신이 누구인지, | 0.450 | 2.150 |
| 어디로 가야 하는지 기억하는 자들은… | 2.150 | 3.970 |
| 싸울 기회를 가진다. | 3.970 | 6.470 |
| 일말의 선의라도 남은 자들. | 8.450 | 11.250 |
| 추락에 대항하는 자들. | 11.870 | 13.710 |

### 납본

- 로컬 최종 영상: output/cinematic/ending_defiance_v1_en_ko.mp4
- 로컬 자막: output/cinematic/ending_defiance_v1_ko.srt
- 로컬 검수 이미지: output/cinematic/ending_defiance_v1_contact.jpg
- 로컬 제작 자료: output/cinematic/ending_defiance_v1_review.zip
- ZIP에는 최종 영상, 무자막 마스터, SRT, 편집/QA JSON, 타이틀 PNG, 편집 소스 ZIP이 포함된다. 내부 편집 소스에는 힉스필드 원본 두 영상 및 음성·단어 정렬 자료가 있다. 신규 원화 두 장은 위 로컬 원본 경로에 별도 저장했다.

[최종 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/d49b62e2-5873-4773-bd7c-89390764b216.mp4) · [무자막 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/713a44ea-d652-438b-9a4d-abbb9155ed75.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/77624438-eac8-48af-a320-041881a5f328.zip)
