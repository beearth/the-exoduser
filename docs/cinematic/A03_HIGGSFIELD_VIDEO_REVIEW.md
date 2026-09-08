# 세계관 프롤로그 영상 3컷 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 완료, 사용자 승인 대기, 게임 미적용.

## 사용자 확정 대사

이번 A03은 새 영상의 세 번째 검수 컷이다. 기존 정지 이미지 콘티의 A04 / p03에 대응한다. 기존 A03(하나의 지옥)은 새 영상 A02의 마지막 문장에 이미 포함됐으므로 중복 제작하지 않는다.

| 순서 | 한국어 자막(사용자 승인) | 영어 더빙 |
|---|---|---|
| 1 | 누가 정한 섭리인지, | Who ordained this law, none can say. |
| 2 | 죄를 지은 모든 생명은 | All who have sinned, |
| 3 | 제 안의 악의와 함께… | with the malice they bear... |
| 4 | 단 하나의 지옥으로 흘러든다. | are drawn into a single Hell. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 참조 원화 | assets/cutscene/prologue/p03.jpg |
| 원화 관찰 | 거대한 석조 협곡, 검붉은 흐름, 표면에 반쯤 형성된 얼굴 |
| 영상 연출 | 낮은 카메라의 느린 전진, 카메라 반대 방향인 협곡 안쪽으로 흐름이 수렴. 양측 영혼 같은 안개가 합류, 마지막 먼 붉은 빛 |
| 영상 도구 | Higgsfield cinematic_studio_video_v2 |
| 영상 설정 | duration 10, 16:9, std, sound off, genre suspense, speedramp linear, count 1, multi_shots false, cfg_scale 0.5 |
| 프리셋 | ELEVATE 자동 추천은 적용하지 않음. 앞 컷과 같은 원화·콘티 중심 제작 방향 유지 |
| 영상 비용 조회 | 10크레딧 |
| 영상 job | 227bd142-82d0-47c8-893c-dd6ba60c49c5 |
| 참조 media_id | cd36753b-87c5-433a-a5ac-c9172f174838 |
| 음성 생성 | 기존 tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 호출 |
| 보이스 | WS6naCm8T4gbyzsLnOjK |
| 음성 모델 | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a03_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·길이 | 148,837바이트 / 9.273469초 |
| 음성 media_id | c566a06c-0d0e-479b-879b-61302d4c3e23 |
| 초기 자동 검수 | faster-whisper small, script similarity 1.0, timed_words 22, caption_words 22 |
| 편집 계획 | 최종 10.5초, 음성 시작 0.45초, 음성 속도·피치 유지. 필요 시 영상만 소폭 리타이밍 |
| 자막 방식 | Whisper 발화 시각을 사용한 한국어 번역 자막, 앞 컷과 동일한 하단 중앙 clean 스타일 |
| 사운드 구성 | 내레이션만, BGM/SFX 미추가 |
| 적용 범위 | 검수 영상만 제작. 게임 코드·기존 원화·기존 음성 수정 없음 |

후속 컷은 사용자 검수 후 진행한다. 자동 인식 일치는 음색·억양의 청취 승인을 대신하지 않는다.

## 완성본

| 항목 | 결과 |
|---|---|
| 영상 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 10.042초 |
| 최종 길이 | 10.500초 |
| 영상 리타이밍 배율 | 1.0456084445329616, 24fps 출력 |
| 음성 배치 | 0.450초 시작, 속도·피치 변경 없음, 끝 무음 패딩 |
| 규격 | 1276×720, H.264 + AAC |
| 스트림 길이 | clean/final 각각 비디오 10.500초, 오디오 10.500초 |
| 로컬 합본 | output/cinematic/a03_v1_en_ko.mp4 |
| 로컬 자막 | output/cinematic/a03_v1_ko.srt |
| 로컬 검수 이미지 | output/cinematic/a03_v1_visual_check.jpg |
| 최종 자동 인식 | faster-whisper small, 단어별 시각 추출 후 원고와 정렬. 유사도 1.0, 22단어 모두 일치 |
| 자막 렌더러 | Higgsfield subtitles bundled audio_to_captions.py + burn_caps_clean.sh |
| 자막 설정 | WenQuanYi Zen Hei, fontsize 13, marginv 23, outline 0.8, shadow 0.4, no-caps. 흰색·검정 외곽선, 하단 중앙 |
| 자막 유지 | 발화 시각 + 0.450초, 끝 여유 최대 0.300초. 다음 구절과 겹치면 다음 시작 시각까지로 제한 |
| 기술 검수 | 전체 디코딩 PASS, clean/final 길이 차이 0초, 영상/음성 길이 차이 0초 |
| 화면 검수 | 1.7917 / 4.5417 / 6.2083 / 8.4583초 구절 중간 프레임에서 한글 정상 표시·잘림 없음 |
| 연출 관찰 | 검붉은 채널의 얼굴 형상, 안개, 협곡 끝 붉은빛의 변화 확인. 물살의 정확한 진행 방향은 정지 프레임만으로 확정하지 않으며 사용자 영상 검수 필요 |
| 승인 범위 | 대사·제작 진행은 사용자 승인. 완성 영상·청취 품질 최종 승인은 대기 |

| 한국어 자막 | 시작 | 종료 |
|---|---|---|
| 누가 정한 섭리인지, | 0.450초 | 3.170초 |
| 죄를 지은 모든 생명은 | 3.750초 | 5.370초 |
| 제 안의 악의와 함께… | 5.370초 | 7.070초 |
| 단 하나의 지옥으로 흘러든다. | 7.410초 | 9.510초 |

[3컷 최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9bdc1a8f-74c1-4cb9-a444-1cd1d5b0728e.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/91c9b336-bbd9-466b-8041-721314d64f6f.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_152621_227bd142-82d0-47c8-893c-dd6ba60c49c5.mp4)

[제작 자료 ZIP — 원본·음성·합본·자막·검수 기록](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/63a0c4af-8a59-470d-941c-e9506f9b1636.zip)
