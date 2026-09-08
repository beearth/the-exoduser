# 세계관 인트로 v5 — 금속 HELL ROAD 타이틀 적용

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자 승인: 새 금속 부제 시안에 대해 “적용해”. 선택한 합성 이미지 전체를 마지막 타이틀에 사용하며 추가 이미지 생성은 하지 않는다.

## 편집 계약

| 항목 | 값 |
|---|---|
| 기준 영상 | `video/world_intro_v4_gate_en_ko.mp4` 보존 |
| 새 게임 파일 | `video/world_intro_v5_title_en_ko.mp4` |
| 교체 구간 | 109.291667~113.291667초, 2623~2718프레임, 4초 |
| 적용 이미지 | `output/imagegen/exoduser-hell-road-metal-title-v1.png` 전체. EXODUSER / HELL ROAD |
| 배치 | 검정 1280×720 화면 전체에 원본 종횡비 유지 contain, 추가 문구·장식 없음 |
| 페이드 | 0~0.75초 등장, 0.75~3.6초 정지 유지, 3.6~4초 소멸, 선형 opacity 단일 트랙 |
| 규격 | 1280×720, 24fps, 2719프레임, H.264 + AAC |
| 유지 | 앞 109.291667초의 컷·영어 음성·한국어 자막. 12.75초 지옥문 시작, 전체 컷 경계 변경 없음 |
| 오디오 | v4의 AAC 전체 스트림을 재인코딩 없이 복사. BGM은 기존 독립 Audio 재생 그대로 |
| 코드 범위 | index.html의 영상 src와 플레이어 스크립트 캐시 키만 변경. game.html·world-intro-player.js 로직 변경 없음 |
| 캐시 키 | `20260907-title-v5` |
| 편집 소스 | `output/cinematic/world_intro_v5_title_edit.jsx`, higgsedit native media composition + Node 엔진 |
| 백업 | `output/cinematic/index_before_world_intro_v5_title_20260907.html` |
| 상태 | 영상 렌더·디코딩·오디오 동일성 검증·인게임 파일 연결·실제 브라우저 검사 완료 |

## 검수 결과

| 검사 | 결과 |
|---|---|
| 파일 크기 | 32,739,431바이트 |
| 영상/음성 길이 | 113.291667초 / 113.291000초 |
| 전체 디코딩 | PASS |
| AAC 보존 | 비트 동일. SHA256 `12b05b3550c5bfecedf99314edd586c05c8ebc2ead1f7630dbe388ae65c99e71` |
| 앞부분 화면 표본 | 0.75 / 14 / 77 / 95 / 108초 RGB 평균 절대 오차 1.128~1.389/255, 재인코딩 차이 수준 |
| 타이틀 시각 검수 | 인코딩 MP4의 2625/2632/2641/2671/2712/2718프레임 6표본. 등장·정지·소멸 확인, 이중 부제·클리핑 없음 |
| 단위 테스트 | `test/worldIntroPlayer.test.js` 10개 PASS. 새 v5 경로 및 기존 연속 BGM·종료·컷 경계 유지 |
| 실제 브라우저 | `tmp/verify_world_intro_ingame.py` PASS. 문 → 본편 같은 BGM, 자동 pause/seek 0회, 본편 1.324871초에 음악 9.434902초. 100% 음성/22% BGM, 정지·재개·믹스·컷 넘김·새 타이틀·자연 종료·재진입·ESC 종료 검증, pageerror 0 |
| 인게임 증거 | `output/cinematic/world_intro_v5_title_ingame.png`, `world_intro_v5_gate_ingame.png` |
| 검수 한계 | 별도 headless Chromium 실제 디코딩·재생 및 표본 시각 확인. 스피커 전 구간 청취·최종 음악 취향 승인은 아님 |
| 로컬 검수 이미지 | `output/cinematic/world_intro_v5_title_proof.png`, `world_intro_v5_title_check.jpg` |

[전체 영상 v5](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/6b721568-7565-45ec-90e7-e978b4cba8f0.mp4) · [편집 프로젝트·검수 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9b9e99aa-2ede-4e14-af5e-00b08ea0ea6b.zip)

콘셉트는 기존 메인 로고와 부제의 금속 레터링 통일이다. 시선은 EXODUSER → HELL ROAD 순서이며, 모션은 기존의 조용한 등장·정지·소멸 리듬을 유지한다. 종료 상태는 검정 화면이다. 선택한 시안의 메인 로고 세부 묘사는 기존 `img/logo_exoduser.png`와 픽셀 동일하지 않으며, 사용자 승인을 받은 새 합성 이미지 자체를 그대로 적용한다.

테스트 주도 개발 스킬에 따라 새 영상 경로 검사부터 변경하고 기존 v4 연결 상태에서 예상대로 1개 실패·9개 통과를 확인했다. 편집기 빌드 오류는 `animate` 객체 대신 배열을 요구하는 런타임 계약 불일치였으며, 오류 로그와 공식 예제의 배열 형태를 기준으로 해당 필드만 수정했다. 시각 검수용 111.291667초 프레임 생성 성공. 내장 브라우저 연결은 사용 가능 목록이 비어 있어 별도 headless Chromium 검사로 진행한다.

라이브 편집기 도구는 제공되지 않아 MP4 및 파일 기반 프로젝트 ZIP을 보존한다. 배포·커밋 없음.
