# 전쟁 복수 W04 v2 — 아내의 복도 장면

> 후속 사용자 검수: 문짝 좌우 균형·회전 구조 오류와 대사에 비해 부족한 감정 표현이 지적되어 v2는 최종 채택하지 않는다. [W04 v3 양문 폐쇄·절망 동작](WARINTRO_W04_V3_DESPAIR_20260909.md)으로 수정한다. 아래 시각 검사 기록은 당시 관찰 이력이며 문 구조와 감정 연출의 통과 판정이 아니다.

2026-09-09. 사용자 “진행해봐”에 따라 [가족 서사 추가 장면 검토](WARINTRO_FAMILY_INSERT_REVIEW_20260909.md)의 첫 교체 컷 제작 완료. 반복되던 W04 왕좌를 새로운 복도로 교체하며 기존 더빙을 재사용했다. 기술 검사·5개 표본 프레임 확인 완료, 사용자 검수 대기, 게임 미적용.

| 항목 | 값 |
|---|---|
| 대상 | PROLOGUE_LINES wa08 |
| 한국어 | 아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, |
| 영어 | His wife was taken as a servant and suffered unspeakable horrors, |
| 신규 원화 | output/cinematic/warintro_remaster_20260909/w04_v2/cin_wife_corridor.png, 2,267,858바이트 |
| 원화 생성 | 기본 내장 image_gen, 1회. image_prompt.txt에 전체 프롬프트 보존 |
| 원화 SHA-256 | 4a7c47f2bd7fbbcdf6dfc509fc9808a8f11a95a3b4880ba1be014420fc0ebc60 |
| 원화 관찰 | 돌 아치·횃불·짙은 붉은 천·철제 문, 수수한 드레스와 숄을 입은 성인 여성의 뒷모습, 문 오른쪽의 무장 경비. 두 인물이 떨어져 서 있음 |
| 입력 media_id | bba27755-95b9-48c8-9c45-8c3638a7da50, PUT 200·confirm 완료 |
| 연출 요청 | 인물 제자리·미세한 호흡, 손과 경비 무기 고정. 문이 경비와 겹치지 않는 범위에서 조금 닫힘. 느린 카메라 후퇴, 횃불·연기·먼지 |
| 영상 모델 | cinematic_studio_video_v2, 7초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용·생성 | 사전조회 7크레딧, 영상 1회 제출 |
| 영상 job | 9266d2b1-8191-4cd0-a0c0-20448eec3ad5 |
| 음성 | 기존 w04/voice.mp3 74,440바이트·4.623673초 재사용. ElevenLabs WS6naCm8T4gbyzsLnOjK, eleven_multilingual_v2, stability 0.65 / similarity_boost 0.8 / style 0.15 / use_speaker_boost true |
| 음성 SHA-256 | c8e9a03fbdf80720445bafa787f609b6ca54a5306872f6f22af181e18995e84b |
| 음성 URL | 기존 media_id 87999241-5bf1-4a21-8ce9-dbcf55cfc249 사용, 새 TTS 요청 없음 |
| 편집 | render_w04_v2.py는 검증된 W04 스크립트와 같은 7초·1초 음성 배치. Higgsedit 별도 영상·음성 트랙, 1280×720 24fps, 168프레임 |
| 자막 | 기존 문구, Whisper 원고 정렬. Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps |
| 범위 | W04 장면 교체 검수본. W05 빈 방·W06 마차·W07 감방은 후속. 원본 게임·원화·기존 납본 보존 |
| docs 검색 | warintro, 전쟁 복수, W04, cin_throne로 docs 전체 검색 |

## 완성본 검수

| 항목 | 결과 |
|---|---|
| 최종본 | 1,274,958바이트, H.264 1280×720 24fps, 168프레임. 영상·AAC 48kHz 음성 모두 7.000000초 |
| 무자막 더빙본 | 6,945,129바이트, 영상·음성 모두 7.000000초 |
| 생성 원본 | 8,800,018바이트, 영상 7.041667초. 최종 편집은 7초 사용 |
| 자막 | 1.000–5.430초, 기존 한국어 한 줄 |
| 보존 검증 | voice.mp3·caps.srt·en.srt·alignment.json 모두 기존 W04와 바이트 단위 동일. 새 더빙 요청 없음 |
| 음성 PCM | 최종 영상에서 1초 배치 지연을 제외한 원음 대비 상관계수 0.9999705400760877 |
| 기술 검사 | clean·final 전체 ffmpeg 디코딩 오류 없음. source·voice·clean·final 다운로드 크기와 원격 영수증 일치 |
| 시각 검사 | 0 / 1.2 / 5.23 / 6.5 / 6.958333초 표본: 여성·경비·문·손의 큰 변형과 겹침 없음. 카메라 후퇴로 복도 공간이 넓어짐, 횃불·먼지 변화. 문은 열린 틈을 남긴 상태로 유지되며 완전 폐쇄 장면은 아님. 한국어 가독성·앞뒤 비표시 확인 |
| 검사 범위 | 표본 이미지와 자동 음성·디코딩 검사. 실시간 재생 청취·사용자 승인 미완료. qa.json의 visual_review_pending=true는 시각 검사 전 자동 영수증을 보존한 값이며 후속 결과는 이 표에 기록 |
| 납본 | final·clean·contact·package 모두 PUT 200 및 media_confirm 완료 |
| 저장·추적 | 신규 원화와 프롬프트, 렌더 스크립트, 생성 요청·원본 매니페스트, QA·자막, 최종본을 w04_v2 폴더에 저장. 기존 원화·왕좌 납본 보존 |

- [W04 v2 복도 — 영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/489d1bec-9a5c-4340-bd03-4bcb16b8534f.mp4)
- [무자막 더빙본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3d925fd9-3afd-4310-8ed9-ab7040d84112.mp4)
- [표본 프레임](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9e727ccb-5bcc-43ca-96a2-3a275680a371.jpg)
- [원화·영상·편집 프로젝트·QA ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ffbdf3e2-de06-4a2a-915f-72be0cb16ec8.zip)
