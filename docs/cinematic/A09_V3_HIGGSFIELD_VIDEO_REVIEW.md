# A09 v3 — 껍질에 미세 압박만 가하는 컷

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06 사용자 최신 지시: "조금만 그냥 저 껍질을 압박만하면서 끝나도 돼".
v1/v2의 파열·전진·탈출 성공 연출, 직전의 새 원화·사슬 장벽 제안은 이번 컷에 적용하지 않는다. 기존 p11을 그대로 사용한다. 상태: v3 검수본 생성 완료, 사용자 승인 대기, 게임 미적용.

| 항목 | 계약 |
|---|---|
| 대사 | To tear it open. / 찢고 나가는 것. |
| 원화 | assets/cutscene/prologue/p11.jpg; confirmed media 403f2e45-61b5-4b61-9ff4-23c838930094 |
| 동작 | 손 위치 유지, 손가락에 힘·팔의 미세 떨림·어깨 긴장·작은 호흡·껍질의 미세 주름만 |
| 끝 상태 | 시작 구도와 거의 동일. 껍질은 버티며 인물은 계속 갇혀 있음. 힘을 가하는 상태에서 종료 |
| 금지 | 파열, 틈 확대, 탈피, 전진, 새 얼굴, 손 놓기, 과한 발광·폭발, 카메라 줌 |
| 영상 | Higgsfield cinematic_studio_video_v2, duration 4, 16:9, std, sound off, genre suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.7 |
| job | 8cb702a2-52a1-4526-9ed0-d89f97e1782c |
| 비용 | 사전 조회 4크레딧 |
| 자동 추천 | IN THE DARK 프리셋 적용 안 함. 사용자 지정 미세 압박 연출 유지 |
| 음성 | 기존 ElevenLabs a09_v1_en_WS6naCm8T4gbyzsLnOjK.mp3, 1.332245초, media 4d24d7cd-bcb7-49c5-bf7d-62ac0016def8 재사용. 재녹음 없음 |
| 합성 | 4.000초, 24fps, 원본 음성 +0.450초, 목소리 속도·피치 유지 |
| 자막 | 기존 clean WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. Whisper clock 및 원고 일치 검증 후 번들 burner |
| 보존 | v1/v2·기존 원화·음성·게임 코드 유지, v3 별도 파일 |

## 프롬프트

A nearly still dark-fantasy portrait, 4 seconds, based exactly on the supplied reference. The single figure remains trapped inside the same black shell throughout. BOTH HANDS stay in their ORIGINAL positions on the shell, fingers continuously curled around the material. Only a tiny sustained exertion: the fingers tighten slightly, forearms tremble subtly, shoulders brace and the shell wrinkles under his grip by a few millimeters. This is static isometric pressure against a resisting shell, not an escape action. One slow restrained breath. Final pose is almost identical to the first frame, still gripping, still enclosed, pressure unresolved. Shell stays WHOLE. Existing cracks keep the exact same narrow width and the same dim brightness from beginning to end. Head, chest and face stay in the same place. Camera completely locked, preserve composition and anatomy. Only sparse fine ash drifts down. Somber charcoal painterly realism, stable dark exposure. No pulling arms apart, no opening hands, no releasing grip, no rupture, no tearing, no growing opening, no peeling, no emergence, no forward movement, no transformation, no new face, no extra limbs, no explosion, no fire, no flares, no increasing light, no dramatic climax, no zoom, no cuts, no text, no speech. End while the shell is still resisting the slight pressure.

## 검수

기술 검수 완료. 여섯 표본 프레임에서 사용자 핵심 조건(껍질 미파열·갇힌 상태 유지·압박 자세로 종료)을 확인했다. 사용자 최종 동작·감상 승인 대기.

| 항목 | 결과 |
|---|---|
| 원본 길이 | 4.042초 |
| 최종 | 4.000초, 1276×720, 24fps, H.264 + AAC |
| 리타이밍 | 영상만 0.9896091044037606; 음성 속도·피치 변경 없음 |
| A/V 정합 | clean/final 모두 영상·오디오 4.000초. 차이 0초 |
| 음성 종료 | 0.450 + 1.332245 = 1.782245초. 원본 전체 포함 |
| STT | similarity 1.0, timed_words=4, caption_words=4, 원고 4단어 전체 일치 |
| 자막 | 찢고 나가는 것. / 0.450~1.570초, 초반 두 프레임 정상 표시 |
| 디코딩 | 전체 ffmpeg 디코딩 PASS |
| 화면 검사 시각 | 0.750 / 1.291667 / 2.000 / 2.500 / 3.000 / 3.750초 |
| 실제 동작 | 손과 어깨·머리 위치가 소폭 움직이고 검은 껍질을 계속 붙잡고 있음. 갇힌 형체와 좁은 균열이 유지됨 |
| 끝 상태 | 마지막 검사 프레임에서도 껍질 파열·탈피·전진 탈출 없음. 압박하는 자세에서 종료 |
| 이전 후보 대비 | v1/v2의 큰 벌어짐·폭발적 발광·손을 크게 놓는 장면이 검사 프레임에 없음 |
| 남은 차이 | 안개 유동은 '희박한 재만'이라는 프롬프트보다 큼. 자세도 완전 정지하지 않고 소폭 변함. 핵심 조건을 벗어나는 대동작으로는 관찰되지 않음 |
| 판정 범위 | 표본 화면 기준 핵심 연출 조건 통과. 전체 동작을 사람이 연속 재생한 최종 승인과 동일하지 않음 |
| 업로드 | clean/final/JPEG/ZIP 모두 성공 및 media_confirm 완료 |
| 보존 | v1/v2 및 게임 코드 변경 없음 |

## 납본

- output/cinematic/a09_v3_en_ko.mp4
- output/cinematic/a09_v3_visual_check.jpg
- output/cinematic/a09_v3_review.zip
- output/cinematic/a09_v3_ko.srt

[영어 더빙·한글 자막 v3](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3b5e1e48-9839-4825-b5bb-eb3a779dc90f.mp4) · [무자막 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/95eb1592-d416-4c11-b32c-1b214408e525.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/53de767a-2113-49e7-bc86-e44d19c2bfae.zip)

[Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_133431_8cb702a2-52a1-4526-9ed0-d89f97e1782c.mp4)
