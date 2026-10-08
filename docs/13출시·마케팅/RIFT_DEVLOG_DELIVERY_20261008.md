# 지옥의 틈 개발 기록 01 — 제작·납품

2026-10-08 제작 시작. 실제 2026-10-06 개발 녹화와 10-05 콘셉트 원화를 재편집한다. 이번 신규 촬영·최신 Oct8 게임 화면으로 소개하지 않는다. 게임 코드·서버·사용자 게임·세이브는 수정하거나 실행하지 않는다.

| 항목 | 제작 계약 |
|---|---|
| 가로 | 34초, 1920×1080, 30fps. 실제 보행 hook4초 → 콘셉트6초 → 보행9초 → 근거리 이동2초 → 보행9초 → CTA4초 |
| 세로 | 20초, 1080×1920, 30fps. 실제 보행6+6+4초 → CTA4초 |
| 소재 | [원본·출처·SHA256](../../marketing/captures/rift-20261008/provenance.json). 주민 대화창은 녹화에 없으므로 대화·보상·퀘스트 시연으로 표현하지 않음 |
| 음악 | 녹화2개는 오디오 스트림 없음. 기존 사용자 채택 Suno 주제가 prologue_theme.mp3를 편집 BGM으로 추가. 실제 Rift 녹음 원음과 구분. 출처 정본: migration repo docs/6사운드디자인/주제가_SUNO_프롬프트.md:70 |
| 공개 문구 | 개발 중 화면·공개 데모와 다름. Steam 데모 무료 CTA와 개발 프리뷰를 분명히 구분. 사전 제작 아트·음악의 AI 보조 사용 공개 |
| 편집 | [native JSX](../../tools/marketing_rift_edit_20261008.jsx). 정확 컷 CFR30 H264 입력, native trim0/single-window. Noto Sans KR font asset shaping + DM Sans 등록 |
| 현재 상태 | 원본 보존·편집 코드 작성. native 렌더·육안·기술 검수·완성본 원격보존은 진행 중. 플랫폼 신규 게시 미완료 |

자료 사용은 기존 개발 녹화의 홍보 편집이다. 맵 제작·맵 품질 인수·최신 플레이 버전 acceptance를 수행한 것으로 계산하지 않는다. Rift 현재 구현/미완료 근거는 [운영 정본](YOUTUBE_CHANNEL_OPERATIONS_20261008.md)의 별도 migration SSOT 링크를 따른다.
