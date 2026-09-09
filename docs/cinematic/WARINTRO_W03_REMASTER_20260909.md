# 전쟁 복수 서사 W03 — 킬루의 배신

2026-09-09. W02 v2 빈손 수정본 전달 후 사용자 “다음” 요청으로 wa06 킬루 소개 컷 제작 완료. 기술 검사·5개 표본 프레임 확인 완료, 사용자 검수 대기, 게임 미적용. [전체 대사·원화 기준](WARINTRO_REMASTER_20260909.md)을 따른다.

| 항목 | 계약 |
|---|---|
| 대상 | game.html PROLOGUE_LINES wa06, assets/cutscene/warintro/cin_throne.jpg |
| 한국어 | 이웃이자 친구였던 킬루가 그의 가문을 짓밟았다. |
| 영어 | Killu, once a neighbor and friend, had crushed his family. |
| 원본 시각 | wa06 13초 시작 / 자막 4.5초. 독립 검수본의 새 발화 시각과 구분 |
| 원화 관찰 | 중앙의 장식 왕좌·킬루·붉은 잔, 양옆 인물, 횃불·사슬·금화. 기존 얼굴·의상·소품·구도 사용 |
| 연출 | 차갑고 자만한 표정, 미세한 호흡·시선, 불길·연기·불빛, 느린 전진 카메라. 손·잔·주변 인물의 손동작은 고정, 잔 들기·마시기 동작 추가 없음 |
| 영상 설정 | cinematic_studio_video_v2, 6초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 길이 근거 | 앞선 5초 컷보다 긴 영어 대사에 여유를 주기 위해 6초. 기존 게임 시간 변경 없음 |
| 비용 사전조회 | 6크레딧, 영상 요청 1회 |
| 원화 media_id | 99972f3a-fc6f-45e9-8922-3609ed4b63c6, HTTP 200·confirm 완료 |
| 영상 job | bd58ded0-ecc1-460d-a297-d4c9a8d456c5 |
| 목소리 | 기존 ElevenLabs WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true, mp3_44100_128 |
| 음성 생성 | tools/elevenlabs_tts.mjs, 성공 생성 1회, voice.mp3 68,589바이트 |
| 음성 media_id | c36f656e-f054-46e3-8331-a5081d0ac538, HTTP 200·confirm 완료 |
| 합성 결과 | 1280×720, 24fps, 144프레임, 6초. 내레이션 1초 시작, 속도·피치 유지. 영어 내레이션만 |
| 자막 | Whisper 실제 발화 시각 + 삽입 지연 1초, 종료 여유 0.25초. 한국어 기존 문구 |
| 스타일 | Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps, 흰색·투명 배경·하단 중앙 |
| 편집 | 기존 render_w02.py에서 대사·6초 길이·QA 5프레임으로 조정한 render_w03.py. Higgsedit 영상·음성 별도 트랙과 번들 clean 자막 도구 사용 |
| QA 시점 | 0초, 자막 시작+0.2초, 자막 끝−0.2초, 5.5초, 마지막 143/24초. 960×2700 접촉 시트 |
| 폴더 | output/cinematic/warintro_remaster_20260909/w03/ |
| 범위 | wa06 독립 검수본만 제작. 같은 원화를 사용하는 wa08 이후 대사는 이번 범위 밖 |

## 완성본과 검수

| 항목 | 실측 결과 |
|---|---|
| 최종 영상 | H.264 1280×720 24fps, 영상·AAC 48kHz 음성 모두 6.000000초, 1,657,138바이트 |
| 자막 없는 더빙본 | 5,946,642바이트, 영상·음성 모두 6.000000초 |
| 생성 원본 | 9,254,743바이트, 영상 6.041667초. 최종 편집은 6초 사용 |
| 원본 음성 | MP3 44.1kHz, 4.257959초, 영상 1.000초부터 배치 |
| 자막 시각 | 1.000–5.030초, 기존 한국어 한 줄. 실제 영어 인식과 원고 정렬 확인 |
| 음성 보존 | 최종 AAC에서 1초 지연을 제외한 PCM 상관계수 0.9999747246428208 |
| 디코딩 | clean.mp4·final.mp4 전체 ffmpeg 디코딩 오류 없음, 다운로드한 4개 원본·출력 파일 크기 모두 렌더 영수증과 일치 |
| 표본 시각 확인 | 0 / 1.2 / 4.83 / 5.5 / 5.958333초: 킬루·양옆 인물 유지, 손과 잔의 큰 변형 없음. 전진 카메라·불빛 변화 확인. 자막 구간 가독성 및 앞뒤 비표시 확인 |
| 확인 범위 | 5개 표본 이미지 시각 검사와 자동 음성·디코딩 검사. 실시간 재생 청취·사용자 승인 미완료. qa.json은 시각 검사 전 자동 생성 영수증이므로 visual_review_pending=true를 보존하고, 후속 시각 결과는 이 표에 기록 |
| 수정 범위 | 게임 코드·원화 JPG·기존 음성 변경 없음. 독립 편집 스크립트와 검수 산출물만 추가 |
| docs 동기화 검색 | docs 전체 warintro, 전쟁 복수, cin_throne, PROLOGUE_LINES 검색 후 현재 제작 상태가 있는 내러티브·사운드·스토리보드·전체 제작 기록 갱신 |

- [W03 한글 자막·영어 더빙 최종본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/396f7514-86cd-4305-bd24-600559caa467.mp4)
- [W03 자막 없는 더빙본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/2f90a608-89f5-4c3b-b286-7aa423d6fe5d.mp4)
- [W03 표본 프레임](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/90187e27-9178-4223-b282-08755f6e3587.jpg)
- [W03 원본·편집 프로젝트·QA ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/076e393d-d37e-4666-bc2e-98dbd11dc36c.zip)

모든 납본 파일 HTTP PUT 200 및 media_confirm 완료. W04 이후·전체 합본·게임 적용은 미완료.
