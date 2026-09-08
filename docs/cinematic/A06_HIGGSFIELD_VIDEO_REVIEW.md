# 세계관 프롤로그 영상 6컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 및 기술 검수 완료. 사용자 최종 영상 승인 대기, 게임 미적용.

## 사용자 승인 대사와 의미

> 시간은 의미를 잃고,
> 고통만이 육체에 스며들고,
> 그들은 제 안의 파괴적 에너지 그대로…
> 고통의 형상으로 잉태된다.

사용자는 '원래 파괴의 원죄로 지옥에 떨어짐'이라고 설명하고 '에너지 그대로'를 강조했다. 외부에서 새 힘을 주입받는 것이 아니라, 본래 품은 파괴적 에너지가 고통의 형상으로 드러나는 의미다. '스며들고,'를 그대로 유지한다. 새 영상 A06은 기존 정지 콘티 A08의 시간과 A09/p08의 육체 변형을 한 컷으로 합친다. 기존 게임·정지 콘티 순서는 변경하지 않는다.

| 승인 문장 | 영어 더빙 |
|---|---|
| 시간은 의미를 잃고, | Time loses all meaning, |
| 고통만이 육체에 스며들고, | and suffering alone seeps into the flesh. |
| 그들은 제 안의 파괴적 에너지 그대로… | The very destructive energy within them... |
| 고통의 형상으로 잉태된다. | gives them form as incarnations of agony. |

영어의 'the very … within them'은 그들 자신의 기존 에너지를 지칭한다. 한국어 자막은 승인 문구에서 단어를 바꾸거나 생략하지 않는다. 긴 셋째 문장만 자막 가독성을 위해 '그들은 제 안의 파괴적 에너지 / 그대로…' 두 구절로 나눈다. 각 자막은 5어절·32자 이하로 유지한다.

## 제작 계약

| 항목 | 값 |
|---|---|
| 원화 | assets/cutscene/prologue/p08.jpg |
| 원화 관찰 | 고개를 위로 든 성인 옆얼굴, 인간의 턱과 광물화된 뺨·목, 검은 재 같은 피부와 머리카락, 탁한 금빛 역광 |
| 연출 계획 | 느린 접근과 미세한 측면 이동, 한 인물의 윤곽 유지. 먼지 축적 → 기존 뺨·목의 미세 균열 안쪽 빛이 희미하게 맥동 → 검은 재·광물 섬유가 기존 육체 윤곽을 따라 두꺼워지고 굳어짐. 마지막에 움직임과 빛이 가라앉음 |
| 제외 | 외부 에너지 주입, 구원·영웅 각성, 폭발, 급격한 얼굴 용해, 새 팔다리·뿔, 비명·립싱크, 문자 그대로의 임신·출산 표현 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 12, aspect_ratio 16:9, mode std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 비용 사전 조회 | 12크레딧 |
| 영상 job | 00071d6b-e706-4247-8c47-84fde42e9e40 |
| 원화 media_id | 136eff78-0eb6-4520-b925-88b40a38d030 |
| 음성 도구 | 기존 tools/elevenlabs_tts.mjs를 통한 ElevenLabs API 직접 생성 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a06_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 188,125바이트 / 11.728980초 |
| 음성 media_id | 7b8940b3-c45f-458a-9b16-398c9d7291ee |
| 초기 자동 검수 | faster-whisper small, script similarity 1.0, timed_words=24, caption_words=24 |
| 편집 계획 | 최종 13.000초, 음성 시작 지연 0.450초, 음성 속도·피치 유지. 영상만 길이에 맞게 리타이밍, 24fps |
| 자막 처리 | Higgsfield subtitles 번들 audio_to_captions.py + burn_caps_clean.sh. 영어 음성 타이밍에 승인 한국어 구절 매핑 |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 하단 중앙 흰색·검은 외곽선 |
| 자막 여유 | Whisper 시각 + 0.450초, 발화 뒤 최대 0.300초. 다음 구절 시작을 넘지 않음 |
| 오디오 구성 | 내레이션만. 오디오 디자인 스킬의 명료도·마스킹 방지 기준에 따라 음악·효과음 추가 없음 |
| 적용 범위 | 버전이 구분된 검수 영상·음성·자막·제작 기록만 추가. 게임 코드·기존 에셋·기존 보이스 변경 없음 |

자동 인식은 발음·음색·연출에 대한 사용자 청취·영상 승인을 대체하지 않는다. 다음 컷 진행은 사용자 확인 뒤에 한다.

## 한국어 자막 실측 타이밍

| 구절 | 시작 | 종료 |
|---|---|---|
| 시간은 의미를 잃고, | 0.450초 | 1.830초 |
| 고통만이 육체에 스며들고, | 1.830초 | 5.030초 |
| 그들은 제 안의 파괴적 에너지 | 5.650초 | 7.210초 |
| 그대로… | 7.210초 | 8.050초 |
| 고통의 형상으로 잉태된다. | 8.050초 | 11.970초 |

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 12.042초 |
| 납본 파일 길이 | 13.000초 |
| 영상 리타이밍 배수 | 1.079554891214084, fps 24. 음성 속도·피치 처리 없음 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 모두 영상 13.000초, 오디오 13.000초. 차이 0초 |
| 음성 종료 보존 | 원본 11.728980초 + 시작 지연 0.450초 = 12.178980초. 전체 음성 파일 뒤 0.821020초 여백 |
| 음성 무음 보조 검사 | 원본 -42dB, 최소 0.15초 기준. 4.39472~5.30338초, 7.59635~8.38676초의 문장 사이 여백 확인. 이 값으로 Whisper 자막 시각을 대체하지 않음 |
| 로컬 납본 | output/cinematic/a06_v1_en_ko.mp4, 4,173,973바이트 |
| 로컬 자막 | output/cinematic/a06_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a06_v1_visual_check.jpg, 104,305바이트 |
| 최종 자동 인식 | faster-whisper small, script similarity 1.0, timed_words=24, caption_words=24, 영어 원고 정규화 전체 일치 |
| 디코딩 검수 | 전체 ffmpeg 디코딩 PASS, clean/final 파일 길이 차이 0초 |
| 화면 검사 시각 | 1.125 / 3.416667 / 6.416667 / 7.625 / 10.000 / 12.583333초 |
| 자막 화면 검수 | 5개 자막 구절 표시·잘림 없음. 마지막 프레임 자막 없는 여백 확인. 승인 한국어 문구를 변경·생략하지 않고 셋째 문장만 두 구절로 분리 |
| 실제 화면 관찰 | 한 인물의 턱과 옆얼굴 유지. 뺨·목의 금빛 균열이 줄어들면서 표면이 검고 조밀하게 굳어지는 변화가 보임. 원화보다 어두운 육체로 수렴 |
| 연출 판정 범위 | 표본 프레임으로 형체 유지와 표면 변화 확인. '고통의 형상으로 잉태됨'이 충분히 전달되는지는 사용자 영상 검수 대기. 인간 얼굴 전체가 사라지는 대변형이나 별도 괴물 등장으로 과장하지 않음 |
| 업로드 검증 | clean/final/JPEG/ZIP PUT 모두 HTTP 200, 각 media_confirm 완료 |
| 적용 상태 | 게임 코드·기존 원화·기존 보이스 수정 없음. 다음 컷 진행 없음 |

[6컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/013d9826-61c2-426a-976c-f77dec95f085.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/38f4049f-78b5-46a3-8b1f-6b76f593de66.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_161410_00071d6b-e706-4247-8c47-84fde42e9e40.mp4)

[제작 자료 ZIP — 원본·음성·납본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/5a847d57-02dc-4c4d-9e5d-0595b3dd324d.zip)
