# 세계관 프롤로그 A01 영상 검수 기록

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-05. 상태: 사용자 검수 대기, 게임 미적용.

## 제작 범위

- 대상: index.html 세계관 프롤로그 CIN_LINES 첫 컷. 원본은 assets/cutscene/prologue/p01.jpg.
- 대사: 우주에는 셀 수 없는 세계가 있다.
- 전쟁 복수 서사 및 네메시아 등장 컷신과 별개의 콘텐츠다.
- 사용자 지시: 세계관 프롤로그를 Higgsfield 영상과 보이스로 제작하되 한 컷씩 검수한다. 기존 콘티의 정지 이미지 제작 방침에서 영상 제작으로 변경하는 검토 단계이며, 런타임은 아직 변경하지 않았다.
- 2026-09-05 최신 음성 지시: ElevenLabs 사용. A01의 기존 Seed Audio 결과는 승인본이 아니다.

## A01 v2

| 항목 | 값 |
|---|---|
| 영상 | 기존 Higgsfield cinematic_studio_video_v2 결과 재사용 |
| 영상 job | 7b3dfc53-bfa1-46d1-ae26-b52d136accb9 |
| 음성 경로 | Higgsfield MCP text2speech_v2, variant=elevenlabs |
| 음성 | Grady, preset e2a2d2e6-9ed2-59cd-82af-feaa27f8a678 |
| 음성 job | 940c5c20-eb81-491c-b96d-3058bc82d527 |
| 음성 실측 길이 | 2.847347초 |
| 음성 시작 여백 | 0.35초 |
| 합본 실측 길이 | 4.042초 (기존 콘티 3.4초와 별개인 검수용 클립) |
| 합본 media_id | 1d3cd6a6-1377-4190-8b30-30fef027abfc |
| 합본 코덱 | H.264 영상 + AAC 음성 |
| 자동 검수 | faster-whisper small, 한국어 인식 결과: 우주에는 셀 수 없는 세계가 있다. |
| 청취 검수 | 사람의 청취 승인 미완료. 자동 인식 일치는 음색·억양 품질 승인이 아님 |

[A01 ElevenLabs 합본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1d3cd6a6-1377-4190-8b30-30fef027abfc.mp4)

[ElevenLabs 음성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_142140_940c5c20-eb81-491c-b96d-3058bc82d527.mp3)

## A01 v3 — 지정 보이스 영어 더빙 + 한국어 자막

2026-09-05 사용자 최신 지시: ElevenLabs voice ID `WS6naCm8T4gbyzsLnOjK` 사용, 영어 내레이션에 한국어 자막. v2는 이전 검수 이력이며 최신 후보는 v3다.

| 항목 | 값 |
|---|---|
| 영상 | 기존 Higgsfield A01 영상 재사용, 새 영상 생성 없음 |
| 음성 생성 | 프로젝트 기존 tools/elevenlabs_tts.mjs로 ElevenLabs API 직접 호출 성공 |
| voice_id | WS6naCm8T4gbyzsLnOjK |
| model_id | eleven_multilingual_v2 |
| 영어 대사 | There are countless worlds in the universe. |
| 한국어 자막 | 우주에는 셀 수 없는 세계가 있다. |
| 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 파일 | output/cinematic/a01_v3_en_WS6naCm8T4gbyzsLnOjK.mp3, 43,511바이트 |
| 음성 실측 길이 | 2.690612초 |
| 음성 시작 | 0.35초, 남은 구간 무음 패딩, 음성 잘림 없음 |
| 합본 파일 | output/cinematic/a01_v3_en_ko.mp4 |
| 합본 규격 | 1276×720, H.264 + AAC, 4.042초 |
| 자막 | 영상에 직접 삽입, 0.2초부터 끝까지, 하단 중앙, 32px 흰색 + 2px 검정 외곽선 |
| 자막 검수 | output/cinematic/a01_v3_subtitle_check.jpg, 1.5초 프레임 육안 확인: 한글 정상 표시 및 잘림 없음 |
| 음성 자동 검수 | faster-whisper small 영어 인식: There are countless worlds in the universe. (0.0~2.4초) |
| 승인 상태 | A01 전달 당시 사용자 청취·영상 승인 대기. 게임 런타임 미변경. 2026-09-06 사용자 지시로 A02 제작 착수(별도 검수 기록 참조) |

[A01 v3 영어 더빙 + 한국어 자막 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ca5b564a-9b47-4514-8d39-bde5e425aef7.mp4)

[지정 보이스 영어 음성 원본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c74654de-5e92-4f9f-b890-e00d62e0b289.mp3)

다음 단계: A01의 영상 움직임·영어 발음·음색·호흡·한국어 자막을 사용자에게 확인받은 뒤 다음 컷 진행. 자동 인식 일치는 청취 품질 승인을 대체하지 않는다.
