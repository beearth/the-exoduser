# 전쟁 복수 프롤로그 병렬 제작 — W12·W13·W16

> **현재 재생본 v20 · 엔딩 간격·속도 수정:** [제작·검사 기록](WARINTRO_ENDING_TIMING_V20_20260910.md). 질문 뒤1초→탈출 컷1.25배속→탈출 명령 뒤1.5초→마지막 대사 컷. 음성 속도 유지. 총97.4초5844f·22cue,기존 그림자1초46~47초와 후반 스윙 단축 유지. 아래 이전 수치는 제작 이력이다.

2026-09-09 사용자 승인: 남은 컷을 병렬 제작하고 한 번에 검수한다. 기존 원고와 영어 목소리, 한글 자막을 유지한 개별 검수본이다. 게임 런타임은 이 작업에서 변경하지 않았다. 아래 W16은 v1 이력이며, 통합 검수에서 확인한 얼굴 변화는 [W16 v2](WARINTRO_BATCH_W16_V2_20260909.md)의 6초 리타임본으로 보정했다. 합본에는 v2를 사용한다.

| 컷 | 원고 id | 원본 이미지 | 길이 | 영어 원고 | 한국어 원고 |
|---|---|---|---:|---|---|
| W12 | wa24 | cin_fallhell_custom.jpg | 5초 | And so he fell into hell. | 그리고 지옥에 떨어진다. |
| W13 | wa26 | emg1.jpg | 7초 | "...This is but one tale among countless avengers." | "...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐." |
| W16 | wa31·wa33 | cin_nemesia_hd.jpg → cin_nemesia_textfree.png | 8초 | "Why have you come to hell?" / "Escape from hell, sinner." | "너는 왜 지옥에 왔느냐?" / "지옥을 탈출하라, 죄인이여." |

원고는 `output/cinematic/warintro_remaster_20260909/source_manifest.json`에서 가져왔다. W12 원화는 추락 포즈가 아니라 지옥길 위 전사이므로, 몸을 변형하는 추락 대신 천천히 지옥 안으로 진입하는 연출을 선택했다. W13 원화는 화자 초상이 아닌 여러 복수자의 전투 원경이다. 인물 자세를 유지하고 카메라가 뒤로 물러나며 마법빛·연기를 움직인다. W16은 내장 imagegen으로 하단 영어 문구와 띠만 제거한 새 소스를 만들었으며 원본은 보존했다. 질문 뒤 명령으로 이어지는 한 컷이다.

| 설정 | 값 |
|---|---|
| 영상 모델 | cinematic_studio_video_v2 |
| 생성 설정 | std / sound off / suspense / linear / multi_shots false / cfg_scale 0.5 / count 1 |
| 생성 비용 사전 확인 | W12 5 / W13 7 / W16 8 credits |
| 영상 job | W12 `9b0ca0bd-48d6-4bd1-b631-88972003bb1f`; W13 `db065fbc-75e7-4fdf-9268-46fb5f2b9223`; W16 `217a7c0f-1bde-4a85-816c-56eda29961e0` |
| 음성 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 |
| 음성 설정 | stability 0.65 / similarity 0.8 / style 0.15 / speaker boost true |
| 합성 | native Higgsedit, 1280×720, 24fps, 음성 별도 트랙 1.0초 시작 |
| 자막 타이밍 | clean MP3 Whisper 단어시각 + 원고 정렬; W16 문장별 2cue |
| 자막 스타일 | Noto Serif CJK KR Medium / fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 |

| 컷 | MP3 길이 | 음성 배치 구간 | 자막 구간 | PCM 상관계수 | 샘플 화면 검수 |
|---|---:|---|---|---:|---|
| W12 | 1.750204초 | 1.0–2.750204 | 1.00–2.51 | 0.9999667011 | PASS: 전사·칼·손 안정, 지옥 진입, 한글 표시 |
| W13 | 4.728163초 | 1.0–5.728163 | 2.17–5.36 | 0.9999557122 | PASS: 다수 복수자 원경과 마법빛, 한글 표시 |
| W16 | 3.944490초 | 1.0–4.944490 | 질문 1.00–2.59 / 명령 3.04–4.63 | 0.9999533823 | RETOUCH 검토: 해골 웃음이 후반 닫힌 입의 엄한 표정으로 바뀌어 얼굴 연속성 확인 필요 |

모든 결과는 전체 디코딩, 영상·음성 길이 일치, 원고 정렬 완전일치, 동일 음성 PCM 비교를 통과했다. W12·W13 5장, W16 6장 샘플에서 한글·구도·손을 확인했다. 실시간 오디오 청취에 의한 사용자 승인은 아직 없으며 샘플 화면 검수가 전체 동작 검수를 대신하지 않는다. 원 생성 영상은 1176×784이며 16:9 master에 fit-cover로 합성했다. W16 원화의 영어 문구는 제거됐고 한국어 2cue로 대체했다. W16 얼굴 변화는 합본 검수에서 명시한다.

| 컷 | 자막 검수본 | clean master | package |
|---|---|---|---|
| W12 | [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/f6efd056-c05e-4ca2-9dc9-c900b8faeb31.mp4) | [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4b41822a-229a-4598-8b13-fd7af896e158.mp4) | [ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/e9ec729e-4505-45cd-bb9f-abdc9e8aedeb.zip) |
| W13 | [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1a7c96ae-0601-43b2-af37-b163f80bdce4.mp4) | [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9afeba9e-8859-4e48-a407-55a135fd6ce2.mp4) | [ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/18dd3dac-0aa1-4d59-8cb0-867206f01de5.zip) |
| W16 | [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/b1123f56-b50b-4ebf-b95d-4be430b835f6.mp4) | [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3ea586f9-9e72-476c-b5b2-2c3cf970da3b.mp4) | [ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1c08c293-570e-46fc-9d5c-e823233953e8.zip) |

로컬 결과는 `output/cinematic/warintro_remaster_20260909/batch/w12`, `w13`, `w16`의 `deliverable.json`, `qa.json`, `clean.mp4`, `final.mp4`, `voice.mp3`, `caps.srt`, `contact.jpg`, `package.zip`에 저장했다. 생성 프롬프트는 각 `generation_request.json`, W16 이미지 편집 프롬프트는 `image_prompt.txt`에 저장했다. 공용 문서 동기화와 합본 제작은 부모 에이전트가 담당한다. 이 분담에서는 git index·커밋을 조작하지 않았다.
