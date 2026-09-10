# 전쟁 복수 리마스터 W06·W14·W15

> **현재 재생본 v12 · 그림자 연출 수정:** [W09 수정·검사 기록](WARINTRO_SHADOW_V12_20260910.md).46~50.5초를 검과 사람들의 그림자 동작으로 교체.103.5초/22cue/음성은 v11 유지. 킬루 구간과 복수자 가독성 등 나머지 보완 사항은 남아 있다. 아래 이전 버전 값은 이력으로 보존.

2026-09-09 사용자 요청에 따라 남은 컷을 병렬 제작하고 전체 합본으로 검수한다. 이 문서는 부모 작업자가 담당한 세 컷의 완료 기록이다. 원본 한영 원고는 `output/cinematic/warintro_remaster_20260909/source_manifest.json`을 따른다.

| 컷 | 원고 ID | 연출 | 길이 | 음성 길이 | 단독 자막 시각 | 표본 화면 |
|---|---|---|---:|---:|---|---|
| W06 | wa11 | 닫힌 수송 마차가 성문 밖 안개 속으로 멀어진다. 내부·탑승자는 보이지 않는다 | 6초 | 4.493061초 | 1.000~5.050초 | 5장 확인, 마차 이동·원근·한글 정상 |
| W14 | wa28 | 원본 인간·악마의 대치 자세 유지, 카메라가 물러나며 지옥 공간을 드러낸다 | 6초 | 3.422041초 | 1.000~4.450초 | 5장 확인, 손 접촉·구도·한글 정상 |
| W15 | wa29 | 원본 양손 대검 자세에서 얼굴 쪽으로 접근, 망토·불씨 움직임 | 8초 | 6.217143초 | 1.000~6.910초 | 5장 확인, 무기·손·한글 정상 |

| 계약 | 값 |
|---|---|
| 음성 | ElevenLabs `WS6naCm8T4gbyzsLnOjK`, `eleven_multilingual_v2`, stability 0.65, similarity 0.8, style 0.15, speaker boost true, mp3_44100_128 |
| 배치 | 단독 컷 음성 시작 1초, 속도·피치 유지 |
| 영상 | cinematic_studio_video_v2, std, 16:9, sound off, suspense, linear, cfg_scale 0.5, 단일 샷 |
| 편집 | native Higgsedit, 1280×720, 24fps, H.264/AAC 48kHz |
| 자막 | Noto Serif CJK KR Medium, fontsize 13, marginv 32, outline 0.6, shadow 0.4, no-caps |
| 기술 검사 | clean/final 전체 디코딩, 음성 테일, Whisper 원고 일치 확인 |
| PCM 상관 | W06 0.9999389022 / W14 0.9999855554 / W15 0.9999551175 |
| 청취 범위 | 스피커를 통한 직접 청취 미실시. 원고 정렬·PCM 비교와 표본 화면 검수 완료 |
| 납본 | W06 `output/cinematic/warintro_remaster_20260909/w06`, W14·W15 `batch/w14`, `batch/w15`; 각 deliverable.json에 확인된 URL 기록 |
| 비용 | 영상 생성 W06 6 + W14 6 + W15 8 = 20크레딧 사전조회, 각 성공 요청 1회 |
| W06 제작 이슈 | 최초 인물 포함 원화 요청이 생성 서비스 필터에서 차단됨. 요청 ID 0499db32-b604-49d4-bfcf-0df6e14e6bf2. 인물 없이 닫힌 마차·먼 풍경으로 장면을 실질적으로 변경해 새 원화 생성 |

게임 코드·기존 원화·원래 `intro_voice.mp3`는 변경하지 않는다. 전체 편집의 시각·자막 시계는 합본 매니페스트가 우선한다. docs 전체 검색: `warintro`, `전쟁 복수`, `PROLOGUE_LINES`, `intro_voice`.
