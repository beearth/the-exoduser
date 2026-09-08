# 세계관 프롤로그 A02 영상 검수 기록

> **후속 화면 수정:** A02 마지막 대사 “잔혹하게도, 지옥은 단 하나뿐이다”는 [v4 지옥문 컷](WORLD_INTRO_V4_GATE_20260907.md)으로 교체. 합본 12.75~17.291667초, 대사·원음 불변. 아래 13.25초 우주 단일 숏은 원본 이력이다.

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

2026-09-06. 상태: 검수본 제작 완료, 사용자 승인 대기, 게임 미적용.

## 사용자 확정 방향

첫 컷 다음에 이어지는 검수용 한 컷. 사용자가 승인한 새 도입부 문장 전체를 담는다. 기존 콘티 A02의 메타우주 표현을 사용하지 않으며, 기존 A03의 '지옥은 하나다' 역할까지 이번 검수 컷에 포함한다. 전체 편집 승인 전에는 기존 A03을 삭제하거나 게임 대사를 변경하지 않는다.

| 순서 | 한국어 자막 | 영어 내레이션 |
|---|---|---|
| 1 | 어딘가에선 우주가 태어나고, | Somewhere, a universe is born. |
| 2 | 어딘가에선 또 하나의 우주가 스러진다. | Elsewhere, another fades away. |
| 3 | 탄생과 소멸에는 끝이 없건만… | Birth and death know no end... |
| 4 | 잔혹하게도, 지옥은 단 하나뿐이다. | Yet, cruelly, there is but one Hell. |

## 제작 계약

| 항목 | 값 |
|---|---|
| 영상 서비스 | Higgsfield, Cinema Studio Video (cinematic_studio_video_v2) |
| 참조 | assets/cutscene/prologue/p01b.jpg: 시대별 폐허를 두른 세계들 |
| 영상 계획 | 12초 단일 연속 숏. 저속 전진, 먼 곳의 우주 탄생과 소멸, 마지막에 아래쪽 단 하나의 진홍 균열 암시 |
| 영상 설정 | 16:9, std, sound off, genre horror, speedramp linear, count 1 |
| 음성 | ElevenLabs API 직접 생성, voice_id WS6naCm8T4gbyzsLnOjK |
| 음성 모델 | eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, speaker boost true |
| 음성 파일 | output/cinematic/a02_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 |
| 음성 크기·실측 길이 | 190,633바이트 / 11.885714초 |
| 편집 원칙 | 음성 속도 유지. 앞뒤 여백을 확보하고 필요 시 영상만 소폭 느리게 재생 |
| 자막 | 영어 음성 실측 타이밍에 맞춘 한국어 번역, 하단 중앙 흰색·검정 외곽선 |
| 사운드 구성 | 영어 내레이션만. 이번 검수에 BGM/SFX 추가 없음 |
| 검수 범위 | 한 컷만 제작. 사용자 승인 전에 다음 컷이나 게임 적용 진행하지 않음 |

## 초기 음성 검수

faster-whisper small 영어 인식에서 전체 내용과 마지막 Hell까지 확인했다. 첫 문장의 관사를 입력 a 대신 the로 인식했으므로 자동 인식만으로 정확한 발음을 보증하지 않는다. 첫 문장 0.00~2.02초, 두 번째 2.60~5.06초, 세 번째 5.82~7.72초, 마지막 8.58~11.38초(원본 음성 기준).

Higgsfield가 IN THE DARK 프리셋을 추천했으나 사용자 승인 콘티를 유지하는 기본 방향으로 진행했다. 별도 프리셋 효과는 사용하지 않는다. 비동기 선택 질문의 답변은 제출 전까지 없었으며, 이를 사용자 명시적 거절로 기록하지 않는다.

영상 job: `e5ba95fb-4561-4bf2-a978-475d0157692c`, 제출 당시 pending. 비용 사전 조회: 12크레딧. 참조 media_id: `d6b3b383-8945-48ca-b0fd-09a18a558fd4`. 음성 media_id: `4ba12813-1a3e-41e7-861a-bee30a80459d`.

## 완성본 및 검수

| 항목 | 결과 |
|---|---|
| 영상 생성 job 최종 상태 | completed |
| 힉스필드 원본 실측 길이 | 12.042초 |
| 최종 실측 길이 | 13.250초 |
| 편집 | 영상 타임스탬프 배율 1.1003155621989702, 출력 24fps. 음성 속도·피치 변경 없음 |
| 음성 배치 | 시작 0.450초, 패딩 포함 AAC 스트림 13.250초 |
| 최종 규격 | 1276×720, H.264 영상 + AAC 음성, 양쪽 스트림 13.250초 |
| 로컬 영상 | output/cinematic/a02_v1_en_ko.mp4 |
| 로컬 검수 이미지 | output/cinematic/a02_v1_visual_check.jpg |
| 자막 처리 | Higgsfield subtitles bundled audio_to_captions.py + burn_caps_clean.sh. 영어 원고 정렬 후 문장별 한국어 번역 매핑 |
| 자동 인식 검수 | 원고 유사도 0.9545454545454546, timed_words=22, caption_words=22. 정규화한 영어 원고 전체 일치 확인 |
| 자막 모양 | WenQuanYi Zen Hei, 하단 중앙, 흰색·검정 외곽선. libass 기준 fontsize 13 / marginv 23 / outline 0.8 / shadow 0.4, no-caps |
| 자막 시간 | 원본 Whisper 시각 + 음성 시작 0.450초, 발화 종료 후 0.300초 유지 |
| 재생 검수 | 전체 ffmpeg 디코딩 성공, clean/final 길이 차이 0초, 최종 오디오/비디오 길이 차이 0초 |
| 화면 검수 | 1.00 / 4.00 / 7.50 / 11.25초 프레임에서 각 문장 정상 표시·잘림 없음 확인 |
| 연출 관찰 | 왼쪽 먼 세계의 금빛 발광, 오른쪽 작은 세계의 균열·소멸, 마지막 하단 붉은 균열 확인. 탄생은 추상적인 발광 표현이며 정확한 의미 전달은 사용자 영상 검수 필요 |
| 청취 승인 | 자동 인식 검수만 완료. 음색·억양 및 작품 톤에 대한 사용자 청취 승인 미완료 |

| 한국어 자막 | 시작 | 종료 |
|---|---|---|
| 어딘가에선 우주가 태어나고, | 0.450초 | 2.770초 |
| 어딘가에선 또 하나의 우주가 스러진다. | 3.050초 | 5.810초 |
| 탄생과 소멸에는 끝이 없건만… | 6.270초 | 8.470초 |
| 잔혹하게도, 지옥은 단 하나뿐이다. | 9.030초 | 12.130초 |

[최종 영상 — 영어 더빙 + 한국어 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ab938d9d-a29d-4e3d-9f43-2da25cf53e12.mp4)

[자막 없는 영어 더빙 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3f791f30-5706-4b8b-b0a6-29bff736eea0.mp4)

[힉스필드 원본 영상](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260905_150514_e5ba95fb-4561-4bf2-a978-475d0157692c.mp4)

[제작 자료 ZIP — 원본 영상·음성·합본·SRT·검수 JSON](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4e180238-f7e2-42ad-8359-605d16350f52.zip)

후속 컷과 게임 적용은 사용자 검수 후 진행한다. 기존 영상·음성·게임 파일은 덮어쓰지 않았다.
