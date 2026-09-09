# 전쟁 복수 W05 — 아내가 사라진 방

2026-09-09. W04 v3의 양문 폐쇄·주저앉는 아내 이후 사용자 “다음컷” 요청으로 wa09 제작 완료. [가족 서사 추가 장면 검토](WARINTRO_FAMILY_INSERT_REVIEW_20260909.md)에 따라 빈 방과 남겨진 옷으로 상실을 전한다. 신규 원화·더빙·6초 영상 완료, 기술 검사·5개 표본 프레임 확인 완료, 사용자 검수 대기.

| 항목 | 값 |
|---|---|
| 대사 ID | game.html PROLOGUE_LINES wa09 |
| 한국어 | 끝내 못 이겨 스스로 목숨을 끊었다. |
| 영어 | until she could bear no more and took her own life. |
| 원본 시각 | 23.9초 시작, 자막 3.1초. 새 독립 검수본 시각과 구분 |
| 신규 원화 | output/cinematic/warintro_remaster_20260909/w05/cin_wife_empty_room.png |
| 원화 생성 | 기본 내장 image_gen 1회. 전체 프롬프트 image_prompt.txt, SHA-256·크기 source_manifest.json |
| 원화 관찰 | 거친 석조 작은 방, 빈 침대, 의자 위 갈색 숄·어두운 옷, 전경의 꺼진 촛불과 연기, 창의 차가운 빛. 인물 없음 |
| 연결 | W04 v3에서 아내의 자세가 무너진 뒤 W05의 빈 공간으로 전환. 옷 색·재질로 앞 컷과 연결하고 따뜻한 복도에서 차가운 방으로 분위기 전환 |
| 영상 요청 | 촛불 연기가 점차 옅어짐, 먼지·커튼 미세 움직임, 옷과 빈 침대로 느린 전진. 촛불 재점화·인물 출현 없음 |
| 원화 media_id | 11dbd011-dc70-49da-99cf-98d0785e83c8, PUT 200·confirm 완료 |
| 모델 | cinematic_studio_video_v2, 6초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용·제출 | 6크레딧 사전조회, 영상 1회 제출 |
| 영상 job | 50afced3-48ef-4fb7-a82a-53b5352adb42 |
| 더빙 | ElevenLabs WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2, stability 0.65 / similarity_boost 0.8 / style 0.15 / use_speaker_boost true / mp3_44100_128 |
| TTS | tools/elevenlabs_tts.mjs 성공 1회, voice.mp3 50,199바이트 |
| 음성 media_id | ec97472d-aea3-4a7e-b9f3-2d2f77c64892, PUT 200·confirm 완료 |
| 편집 | Higgsedit 별도 영상·음성 트랙. 1280×720 24fps, 144프레임, 6초. 더빙 1초 시작, 속도·피치 유지 |
| 자막 | 기존 한글, Whisper 원고 정렬. Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps |
| 검수 | 시작·자막 초반/후반·5.5초·마지막 프레임 표본. 소품 형태·방의 부재감·연기 변화·자막 가독성 확인. 전체 디코딩·음성 PCM·출력 크기 검사 |
| 범위 | wa09 독립 검수본. 게임 원화·대사·런타임 미변경, W06 이후·전체 합본 미완료 |
| docs 검색 | warintro, 전쟁 복수, W05, wa09로 docs 전체 검색 |

## 완성본·검수 결과

| 항목 | 실측·관찰 |
|---|---|
| 최종본 | 1,049,405바이트, H.264 1280×720 24fps. 영상·AAC 48kHz 음성 모두 6.000000초 |
| 무자막 더빙본 | 5,966,188바이트, 영상·음성 모두 6.000000초 |
| 생성 원본 | 6,901,900바이트, 영상 6.041667초. 최종 편집은 6초 사용 |
| 음성 | MP3 44.1kHz, 3.108571초, 1초 배치. 기존 영어 원고와 인식 정렬 일치 |
| 자막 | 1.000–3.830초, 기존 한국어 한 줄 |
| 시각 표본 | 0 / 1.2 / 3.63 / 5.5 / 5.958333초. 빈 침대·갈색 숄·접힌 옷 유지, 인물·불꽃 출현 없음. 촛불 연기가 후반에 옅어지며 사라짐, 느린 전진으로 빈 침대와 옷에 가까워짐. 자막 초반·후반 가독성과 종료 확인 |
| 기술 검사 | clean·final 전체 ffmpeg 디코딩 오류 없음. source·voice·clean·final 다운로드 크기 모두 원격 영수증과 일치 |
| 음성 보존 | 1초 지연을 제외한 원음과 최종 PCM 상관계수 0.999981097374555 |
| 검사 범위 | 5개 표본 시각 검사·자동 음성·디코딩 검사. 실시간 전체 재생 청취·사용자 승인 미완료. qa.json의 visual_review_pending=true는 후속 시각 검사 전 자동 영수증 보존값 |
| 납본 확인 | final·clean·contact·package PUT 200 및 media_confirm 완료 |
| 저장 | 원화·전체 프롬프트·생성 요청·원본 매니페스트·더빙·자막·편집 스크립트·QA·영상 모두 w05 폴더에 저장 |

- [W05 아내가 사라진 방 — 영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1c09d4b3-8186-4ecd-9ebc-f5f7c30f364c.mp4)
- [무자막 더빙본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/5bbe4b9a-0e40-4834-8cb6-b3c8c1985d4c.mp4)
- [표본 프레임](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/07f0809f-3901-439e-935c-72bd1fde0dc9.jpg)
- [원화·영상·편집 프로젝트·QA ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a331e36e-9206-45d8-a35c-dc65529467ab.zip)
