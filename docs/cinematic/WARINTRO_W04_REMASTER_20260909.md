# 전쟁 복수 서사 W04 — 아내의 비극

> 후속: 반복 구도에 대한 사용자 피드백으로 [W04 v2 복도 7초](WARINTRO_W04_V2_CORRIDOR_20260909.md)를 제작했다. 아래 왕좌 버전은 이력으로 보존하며 현재 교체 후보는 복도 버전이다. 기존 더빙·자막은 동일하다.

2026-09-09. W03 전달 후 사용자 “다음” 요청으로 wa08 독립 컷 제작 완료. 기술 검사·5개 표본 프레임 확인 완료, 사용자 검수 대기. [기존 한영 대사·원화 기준](WARINTRO_REMASTER_20260909.md)을 따른다.

| 항목 | 계약·제작 기록 |
|---|---|
| 대상 | game.html PROLOGUE_LINES wa08 |
| 한국어 | 아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, |
| 영어 | His wife was taken as a servant and suffered unspeakable horrors, |
| 원본 시각 | 시작 19.7초, 자막 길이 4.2초. 새 검수본 시간과 구분 |
| 원화 | assets/cutscene/warintro/cin_throne.jpg, SHA-256 24384a385c5e5401a7e5840bc4c69e5f8399fcc74a7ac5ab74ba7f779a842901 일치 |
| 입력 | W03에서 확인한 원화 media_id 99972f3a-fc6f-45e9-8922-3609ed4b63c6 재사용 |
| 연출 | 원본처럼 왕좌 위 킬루·양옆 인물 장면에 내레이션. 미세한 오른쪽 카메라 이동·전진, 불빛·연기·불씨, 손·잔·인물 자세 유지 |
| 영상 | cinematic_studio_video_v2, 7초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용·횟수 | 사전조회 7크레딧, 영상 제출 1회. 기존 연출 보존 기준에 따라 IN THE DARK 자동 추천 미적용 |
| 영상 job | 0111fd59-2a10-43e5-b2e0-4c4d562d1670 |
| 목소리 | ElevenLabs WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2, stability 0.65 / similarity_boost 0.8 / style 0.15 / use_speaker_boost true / mp3_44100_128 |
| 음성 생성 | tools/elevenlabs_tts.mjs 성공 1회, voice.mp3 74,440바이트 |
| 음성 media_id | 87999241-5bf1-4a21-8ce9-dbcf55cfc249, HTTP PUT 200·media_confirm 완료 |
| 편집 | W03 스크립트의 대사·길이·표본 시각을 W04로 조정. Higgsedit 별도 영상·음성 트랙, 1280×720 24fps, 168프레임, 7초 |
| 더빙 배치 | 1초 시작, 속도·피치 유지. 검수본은 영어 내레이션만 |
| 자막 | Whisper 영어 발화·원고 정렬 후 한국어 단일 cue. 1초 지연과 종료 여유 0.25초 |
| 스타일 | Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps, 하단 중앙 흰색 |
| QA | 0초 / 자막 시작+0.2초 / 종료−0.2초 / 6.5초 / 167/24초 표본, 전체 디코딩·스트림 길이·음성 PCM 비교 |
| 폴더 | output/cinematic/warintro_remaster_20260909/w04/ |
| 범위 | wa08만. wa09 이후·전체 합본·런타임 적용 미완료. 기존 게임 코드·원화·intro_voice.mp3 유지 |
| docs 검색 | docs 전체 warintro, 전쟁 복수, cin_throne, PROLOGUE_LINES 검색 |

## 완성본·검수 결과

| 항목 | 실측 결과 |
|---|---|
| 최종본 | H.264 1280×720 24fps, 168프레임, 영상·AAC 48kHz 음성 모두 7.000000초. 1,465,027바이트 |
| 무자막 더빙본 | 6,935,181바이트, 영상·음성 모두 7.000000초 |
| 생성 원본 | 10,439,276바이트, 영상 7.041667초. 최종 편집은 7초 사용 |
| 음성 | MP3 44.1kHz, 4.623673초, 영상 1.000초부터 배치 |
| 자막 | 1.000–5.430초. 영어 인식·원고 정렬 후 기존 한국어 한 줄 표시 |
| 음성 보존 | 1초 배치 지연을 제외한 원음 대비 최종 PCM 상관계수 0.9999705400760877 |
| 기술 검증 | clean·final 전체 ffmpeg 디코딩 오류 없음. 다운로드한 source·voice·clean·final 크기 모두 원격 영수증과 일치 |
| 시각 확인 | 0 / 1.2 / 5.23 / 6.5 / 6.958333초 표본: 킬루·양옆 인물·손·잔의 큰 변형 없이 유지, 미세한 프레이밍 이동과 횃불·불씨 변화. 자막 가독성·앞뒤 비표시 확인 |
| 검수 한계 | 5개 표본 이미지 시각 검사와 자동 음성·디코딩 검사. 실시간 재생 청취·사용자 승인 미완료. qa.json의 visual_review_pending=true는 시각 검토 전 자동 영수증으로 보존, 후속 검토 결과는 이 표에 기록 |
| 납본 확인 | final·clean·contact·package HTTP PUT 200 및 media_confirm 완료 |
| 동기화 | docs 전체 관련 키워드 검색 후 내러티브·사운드·전체 제작 기록·스토리보드 제작 상태 갱신 |

- [W04 영어 더빙·한글 자막 최종본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/03938dd9-304e-4cf9-bf8e-ac757c857c5b.mp4)
- [W04 무자막 더빙본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ffa61ed8-51f5-408f-8002-840221830e68.mp4)
- [W04 표본 프레임](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/0c686b53-833f-4066-aa60-376d872325b1.jpg)
- [W04 원본·편집 프로젝트·QA ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/550c1a46-7ba7-4bbe-9067-57c3c3283fbe.zip)
