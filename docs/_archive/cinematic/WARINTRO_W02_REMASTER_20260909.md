# 전쟁 복수 서사 W02 — 불타 사라진 집

> **후속 수정:** 사용자가 손에 단검처럼 보이는 물체와 손 자세를 지적했다. [W02 v2 빈손 수정본](WARINTRO_W02_V2_EMPTY_HANDS_20260909.md) 5초 제작·기술 검증·5개 프레임 확인 완료. 아래 v1의 검·손 유지와 시각 확인은 최초 제작 이력이며, 최신 연출 기준은 무기 제거·양손 각각 무릎 위 배치다.

2026-09-09. 사용자 “좋네 다음컷”으로 W01을 승인하고 다음 컷을 요청했다. W02 5초 검수본 제작·기술 검증·정지 프레임 확인 완료, 사용자 검수 전·게임 미적용. 전체 원고·원화 기준은 [리마스터 마스터](WARINTRO_REMASTER_20260909.md)를 따른다.

| 항목 | 계약 |
|---|---|
| 대상 | game.html PROLOGUE_LINES wa04, cin_ruins.jpg |
| 한국어 | 하지만 집은 모두 불타 사라졌다. |
| 영어 | But his home had burned to nothing. |
| 원본 시각 | wa04 5.5초 시작 / 자막 5초. 이번 독립 검수본의 발화 시각과 구분 |
| 원화 관찰 | 폐허에 앉아 고개를 숙인 검은 갑옷의 남성, 바닥에 세운 검, 무너진 아치·불타는 고딕 건축물·재와 연기 |
| 연출 | 넓은 폐허 구도 유지, 미세한 호흡·천 움직임, 불길·연기·재 움직임, 매우 느린 전진 카메라. 장면 전환 없이 5초 |
| 영상 설정 | cinematic_studio_video_v2, 5초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용 사전조회 | 5크레딧, 영상 생성 요청 1회 |
| 원화 media_id | 003d7e3e-5064-41f7-88f6-f115e1809b73, HTTP 200·confirm 완료 |
| 영상 job | 6ad0ae9d-3c8e-4f6d-8c9b-43fe6e28186b |
| 목소리 | W01과 동일: ElevenLabs WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2 |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true, mp3_44100_128 |
| 음성 생성 | tools/elevenlabs_tts.mjs, 성공 요청 1회, voice.mp3 37,660바이트 |
| 합성 | 1280×720, 24fps, 5초. 음성 1초 시작, 속도·피치 유지. 영어 내레이션만 |
| 자막 계약 | 실제 발화 Whisper 시각 + 1초 삽입 지연, 종료 여유 0.25초. Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps, 흰색·투명 배경·하단 중앙 |
| 편집 | W01의 검증된 render_w01.py를 별도 render_w02.py로 복사, SPEECH/KO만 wa04로 교체. Higgsedit 영상·음성 별도 트랙, 번들 clean 자막 도구 |
| 출력 폴더 | output/cinematic/warintro_remaster_20260909/w02/ |
| 범위 | W02 독립 검수본. W01·기존 게임 코드·원화·intro_voice.mp3 보존 |

## 검증 기록

| 항목 | 결과 |
|---|---|
| 최종 파일 | w02/final.mp4, 1,204,407바이트 |
| 무자막 마스터 | w02/clean.mp4, 4,855,132바이트 |
| 원본 영상 | 6,864,756바이트, 1280×720, 24fps, 5.041667초(컨테이너 5.042초). 마지막 1프레임을 제외한 앞 5초 사용 |
| 출력 스트림 | H.264 1280×720 24fps 120프레임 / AAC 48kHz, 영상·오디오 모두 5.000초 |
| 음성 길이 | 2.324898초, 영상 1.000초부터 3.324898초까지 원본 테이크 보존 |
| 자막 | 1.000~3.010초, 기존 한국어 wa04 문구 그대로 |
| 발화 시계 | faster-whisper small, 영어 원고 7단어/7단어, similarity 1.0. 발화 끝 1.760초 + 삽입 1초 + 종료 여유 0.25초 |
| 검증 | clean/final 전체 디코딩 오류 없음, 음성 PCM 상관계수 0.9999864360775097. 최종 음성 테일 보존 |
| 화면 확인 | 1.200 / 2.810 / 4.500초 접촉 시트 직접 확인. 앞 두 시점 한글 정상·잘림 없음, 후반 자막 종료. 앉은 인물·검·아치·원경 고딕 건축물 유지, 불길·연기와 프레이밍 변화 확인 |
| 시각 범위 | 정지 프레임의 구도·자막 확인이며 실제 재생의 움직임·스피커 청취·사용자 연출 승인은 미완료 |
| 원화 보존 | cin_ruins.jpg SHA-256이 W01 제작 때 기록한 원본 매니페스트와 일치 |
| 음성 업로드 | fa25043f-17dc-4d73-b3c0-6028d662c8da, HTTP 200·confirm 완료 |
| 최종 업로드 | final / clean / contact / package 모두 HTTP 200·confirm 완료. ZIP 로컬 다운로드 후 final/clean/source 크기를 원격 QA와 대조 |
| 재현 | w02/render_w02.py, source_manifest.json, qa.json, alignment.json, caps.srt, en.srt, edit.jsx, voice.mp3, source.mp4, clean.mp4, final.mp4, contact.jpg, package.zip |
| 합성 방식 | W01과 같은 Higgsedit 영상·음성 별도 트랙, H.264 8bit 목표 8Mbps, shards 1 / concurrency 1. 번들 clean 자막 도구 사용 |

docs 전체 검색 키워드: warintro, 전쟁 복수, intro_voice, PROLOGUE_LINES. 기존 게임 코드·W01 결과·원화·보이스 파일 변경 없음.

[W02 영어 더빙 + 한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/95eabdae-206e-46be-94e4-fa93e786990f.mp4) · [무자막 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c8ab12c1-9681-4cb0-8cf9-9ab10843bb58.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/31205f21-0531-4515-8557-b9da12e00f62.zip)
