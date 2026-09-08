# 세계관 인트로 v7 — EXODUSER 단독 타이틀

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자 요청: 마지막 HELL ROAD는 부제이므로 제거하고 EXODUSER만 표시. 기존 원본 로고를 재사용하며 신규 이미지·보이스 생성은 하지 않는다.

| 항목 | 현행 값 |
|---|---|
| 인게임 파일 | `video/world_intro_v7_exoduser_centered_en.mp4`, 32,360,772바이트 |
| 원본 | `video/world_intro_v6_clean_en.mp4` 보존, 앞 109.291667초의 편집·컷 경계 유지 |
| 교체 | 2623~2718프레임, 109.291667~113.291667초, 4초 |
| 로고 | 기존 `img/logo_exoduser.png`, 835×348. 재생성·재디자인·부제·추가 장식 없음 |
| 배치 | 1280×720 검정 배경. width=1280, height=1280×348/835, x=0, y=(720-height)/2. 원본 종횡비 유지, 상하 중앙 |
| 연출 | opacity 단일 트랙, 0초 0 → 0.75초 1 → 3.6초 1 → 4초 0. 선형 등장·소멸 |
| 규격 | H.264 + AAC, 1280×720, 24fps, 2719프레임. 영상 113.291667초 / 음성 113.291000초 |
| 음성 | v6 AAC 전체 스트림 copy. ADTS SHA256 `12b05b3550c5bfecedf99314edd586c05c8ebc2ead1f7630dbe388ae65c99e71` 동일 |
| 자막·BGM | 기존 28언어 × 31큐·2배 글자·line=-3 유지, BGM 재생 코드 변경 없음 |
| 코드 | index.html 영상 src만 새 파일로 연결. 기존 player/subtitle 스크립트 캐시 키 유지 |
| 편집 소스 | `output/cinematic/world_intro_v7_exoduser_edit.jsx`, Higgsfield higgsedit native media composition / Node render |
| 기술 검사 | 전체 디코딩 PASS, 길이·프레임·코덱·음성 동일성 확인, 단위 테스트 16개 PASS |
| 인게임 검수 | `tmp/verify_world_intro_ingame.py` PASS: 문→본편 BGM pause/seek 0, 본편 1.325917초에 음악 9.435962초 유지. 일시정지·재개·믹스·컷 넘김·자연 종료·재진입·ESC 검사, pageerror 0 |
| 시각 증거 | `output/cinematic/world_intro_v7_title_ingame.png` 직접 확인: EXODUSER만 중앙 표시, HELL ROAD·겹친 자막 없음. `world_intro_v7_gate_ingame.png` 지옥문 표본 유지 |
| 이전 시안 | `video/world_intro_v7_exoduser_en.mp4`는 상단 정렬 검토본이며 런타임 미사용. 최종은 centered 파일 |
| 범위 밖 | 배포·커밋, 다른 로비/HUD의 게임명·부제, 게임 플레이 코드 |

영상 편집 워크플로로 기존 자산을 재배치했다. 최초 검토본의 contain 배치가 상단에 붙어 원본 종횡비로 높이·중앙 y를 명시했다. 테스트 주도 개발로 새 파일 연결 검사 실패를 먼저 확인하고 연결 후 16개 통과를 확인했다. 라이브 편집기 도구는 제공되지 않아 로컬 MP4와 JSX 편집 소스를 남긴다.

[EXODUSER 단독 최종 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/6ac6f44b-bad3-4d46-91e0-6fac6ddbe05f.mp4)
