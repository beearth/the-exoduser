# A09 v2 — 찢고 나가는 것 재제작

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06 사용자 재제작 요청. 기존 v1 파일·게임 구현은 보존한다. 신규 영상만 생성하고 기존 영어 보이스를 재사용한다. 상태: v2 후보 생성 완료, 연출 RETOUCH, 게임 미적용.

## 변경 이유와 계획

v1 검사 프레임에서 후반 양손이 벽에서 떨어지고 균열의 붉고 흰 빛이 크게 번진다. v2는 손과 장벽의 접촉, 물리적인 찢김, 몸을 앞으로 밀어 내는 동작에 집중한다. 원화 p11은 인물과 벽이 융합된 형태로 보이므로 영상 모델이 외부 장벽과 몸을 구분하지 못할 위험이 있으며, 결과 검사에서 실제 구현 정도를 별도 기록한다.

| 항목 | v2 |
|---|---|
| 대사 | To tear it open. / 찢고 나가는 것. |
| 원화 | assets/cutscene/prologue/p11.jpg, 기존 확정 media 403f2e45-61b5-4b61-9ff4-23c838930094 |
| 영상 | cinematic_studio_video_v2, 5초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.65 |
| 비용 | 사전 조회 5크레딧 |
| job | 924bdaf3-92f3-4459-a9fd-4f00bb880253 |
| 0~0.6초 | 양손으로 기존 두 가장자리를 단단히 잡고 버팀 |
| 0.6~2.4초 | 손과 가장자리의 접촉 유지, 한 번의 연속 동작으로 좌우로 찢음 |
| 2.4~4.2초 | 어깨보다 넓어진 틈으로 머리와 상체를 앞으로 밀어 냄 |
| 4.2~5초 | 찢어진 장벽을 잡은 채 전진한 자세 유지 |
| 카메라 | 양손과 틈을 보여주는 고정 중근경, 손을 자르는 줌 금지 |
| 효과 제한 | 발광 증가·폭발·마법·흉부 찢김·손 놓기 금지 |
| 음성 | 기존 a09_v1_en_WS6naCm8T4gbyzsLnOjK.mp3, 원본 1.332245초, media 4d24d7cd-bcb7-49c5-bf7d-62ac0016def8 재사용 |
| 보이스 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability 0.65 / similarity_boost 0.8 / style 0.15 / speaker_boost true |
| 합성 | 음성 +0.450초, 음성 속도·피치 유지, 최종 5.000초 / 24fps |
| 자막 | 기존 clean, WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps; Whisper 재검증 후 번들 burn |
| 오디오 디자인 | 기존 내레이션만 사용, 명료도를 위해 음악·효과음 추가 없음 |
| 적용 | 기존 파일 덮어쓰기·게임 코드 변경 없음, 신규 검수본 |

## 영상 프롬프트

One continuous 5-second dark-fantasy shot animated from this exact reference. Keep the same single adult figure, face, armor, two hands and framing. The black sheet surrounding him is an EXTERNAL wall-like membrane, separate from his intact body and armor. Show unmistakable physical escape by tearing this barrier, not a spell. 0.0-0.6s: both hands tightly clutch the existing two jagged edges, fingers curled, shoulders braced. 0.6-2.4s: he forcefully pulls those edges outward in one continuous effort; the gripped material moves WITH each fist and splits progressively along the existing cracks. Show real resistance, stretching, snapping dark fibers and falling small stone fragments. Each fist stays closed around its own edge throughout. 2.4-4.2s: with the opening now wider than his shoulders, he drives his head and upper torso FORWARD through it, remaining intact; the torn wall is displaced outward away from his chest. 4.2-5s: hold the newly opened passage and forward position, still gripping both edges. Fixed camera, medium close shot showing both hands and the widening gap at all times. No zoom that crops hands. Preserve gritty charcoal painterly realism and dim light. Existing red fissures stay thin and faint, interior remains dark, no white flare, explosion, fire, energy burst, magic, glowing body, dissolving barrier, floating hands, extra limbs, released grip, chest ripping, gore, scene cuts, text, speech or logo. The tearing and forward escape, not increasing light, must be the visible change.

## 검수 결과

생성·기술 검수 완료. 연출 판정 **RETOUCH**. 사용자 검수 대기, 게임 미적용.

| 항목 | 실측 / 관찰 |
|---|---|
| 원본 길이 | 5.042초 |
| 최종 길이·규격 | 5.000초, 1276×720, 24fps, H.264 + AAC |
| 영상 리타이밍 | 0.9916699722332408 |
| A/V 정합 | clean/final 영상·오디오 모두 5.000초, 차이 0초 |
| 음성 | 기존 1.332245초 전체 보존, +0.450초 시작으로 1.782245초까지 포함; 속도·피치 변경 없음 |
| 자동 인식 | similarity 1.0, timed_words 4 / caption_words 4, authored 영어 4단어 전체 일치 |
| 한글 타이밍 | 0.450~1.570초, 찢고 나가는 것. |
| 전체 디코딩 | PASS |
| 화면 검사 | 0.750 / 1.291667 / 2.000 / 3.000 / 4.000 / 4.750초 |
| 자막 | 초반 두 검사 프레임 정상 표시, 글리프 깨짐·잘림 없음 |
| 개선 | 후반 틈이 더 크게 벌어지고 머리·상체가 앞으로 드러남. 원본보다 탈출 진행 변화가 큼 |
| 남은 문제 | 약 3초 검사 프레임에서 손이 열리고 벽과의 접촉이 끊김. 붉고 흰 균열의 발광이 계속 강함. 머리 위 막과 얼굴/몸의 구분도 어색함 |
| 미달 기준 | 끝까지 손을 놓지 않는 동작과 절제된 발광 조건 미달. 기술 PASS를 연출 PASS로 대체하지 않음 |
| 원인 가설 | p11 정지 원화가 몸과 막을 하나의 재질·형태로 연결하고 있어 모델이 외부 장벽을 분리해 표현하기 어려울 수 있음. 추론이며 확정된 모델 내부 원인 아님 |
| 다음 수정안 | 몸과 외부 장벽이 분리된 신규 시작 원화와 찢긴 후 구도를 마련한 뒤 영상화. 이번 요청에서는 추가 유료 재생성 없이 v2 후보를 전달 |
| 업로드 | clean/final/JPEG/ZIP 4개 성공, media_confirm 완료 |
| 보존 | v1·기존 원화·기존 보이스·게임 코드 모두 변경 없음 |

### 파일

- output/cinematic/a09_v2_en_ko.mp4
- output/cinematic/a09_v2_visual_check.jpg
- output/cinematic/a09_v2_review.zip
- output/cinematic/a09_v2_ko.srt

[자막·더빙 포함 v2 후보](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/47c71022-f189-408b-9992-7ebf76f8f1ad.mp4) · [무자막 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/2f8a31fa-534f-4b95-b302-07cb2573156e.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ae0a47cf-fa44-4344-97ec-642543c46a1f.zip)

[Higgsfield 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_060944_924bdaf3-92f3-4459-a9fd-4f00bb880253.mp4)
