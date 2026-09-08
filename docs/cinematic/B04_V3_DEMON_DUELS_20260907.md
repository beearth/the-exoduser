# B04 v3 — 초능력자·대마법사 대 악마, 독립 2컷

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자: 한 화면의 두 능력자가 싸우는 장면 대신 각자 악마와 싸우는 두 장면으로 분리. 기존 B04 v2는 보존 이력. v9 제작 및 인게임 연결 후, 마법사는 v10으로 교체했다.

| 항목 | 값 / 의도 |
|---|---|
| 11A | 초능력을 지닌 자도, / Those with psychic powers. 초능력자가 빈손 염력으로 육중한 악마를 밀쳐냄. 마법진·지팡이 없음 |
| 11B | 마법의 극에 닿은 자도. / Those at the pinnacle of magic. 대마법사가 악마의 발톱을 황금색 마법진으로 막고 한 번 반격 |
| 화면 교체 계획 | 84.791667~90.791667초, 기존 총 6초 유지 |
| 컷 전환 계획 | 87.375초, 24fps 기준 전반 62프레임/2.583333초 + 후반 82프레임/3.416667초 |
| 자막 보존 | 큐25 84.972~87.252초 / 큐26 87.472~89.312초, 대사 사이 무자막 구간에 하드컷 |
| 생성 원본 계획 | Higgsfield cinematic_studio_video_v2, std, 16:9, action, sound off, speedramp linear, multi_shots false, cfg_scale 0.5; 3초 + 4초 별도 영상 |
| 원화 | 내장 imagegen 스킬로 2장 생성 완료. 기존 B04 v2는 혼합 지옥 건축·재질 참조만 사용 |
| 파일 | output/cinematic/b04_v3_psychic_demon_keyframe.png / b04_v3_mage_demon_keyframe.png |
| 프롬프트·참조·계획 | output/cinematic/b04_v3_demon_duels_plan.json |
| 보존 계약 | v8 전체 영어 AAC, 마지막 We call them Exoduser., 28언어 자막과 시각, BGM 독립 연속 재생, EXODUSER 단독 타이틀, 나머지 장면 |
| 상태 | 원화 2장·Higgsfield 영상 2개·v9 합본 제작 및 인게임 연결 완료 |
| 선택 확정 | 사용자 “해봐”: 추천한 원안 제작 승인. IN THE DARK 프리셋 없이 declined_preset_id=24bae836-2c4a-48e0-89b6-49fcc0b21612 지정 |
| 생성 job | 초능력자 18b182f0-ec30-45f7-9b85-2c433de0141d / 마법사 1b07f63e-295d-4b2c-a204-0836b42455ae |
| 사전 비용 | 3초 3크레딧 + 4초 4크레딧, 총 7크레딧 |
| 검수 기준 | 악마와 능력자의 분리된 실루엣, 힘의 방향·접촉 읽힘, 손·지팡이 유지, 파편 때문에 몸이 분해되지 않음, 자막 시점 전환, 기존 음성 비트스트림 보존, 컷 이동·BGM 회귀 검사 |

## v9 최종 납본·검수

| 항목 | 최종 값 |
|---|---|
| 런타임 | video/world_intro_v9_demon_duels_en.mp4, 32,194,852바이트 |
| 규격 | H.264/AAC, 1280×720, 24fps, 2719프레임; 영상 113.291667초 / 음성 113.291000초 |
| 생성 원본 실측 | 초능력자 3.041667초/73프레임, 마법사 4.041667초/97프레임, 둘 다 1280×720 무음 |
| 사용 구간 | 초능력자 원본 0~2.583333초(62프레임), 마법사 원본 0~3.416667초(82프레임), 영상 속도 변경 없음 |
| 동작 관찰 정정 | 초능력자 1.2초 부근 압력광과 함께 악마 몸통이 뒤로 밀리고 2.54초에 후퇴. 마법사는 원형 방패와 손 맞대기처럼 읽히며 뚜렷한 공격·반격으로 보기 어려워 사용자 거부 및 v10 재제작 |
| 시각 한계 | 초능력 압력파는 원안보다 흰 광량이 강하나 지속 레이저는 아님. 표본 검수는 모든 프레임의 손가락·연속 동작에 대한 사용자 최종 승인을 대신하지 않음 |
| 편집 | Higgsfield higgsedit project, output/cinematic/world_intro_v9_edit.jsx. 4개 cut: 기존 앞부분 / 초능력자 / 마법사 / 기존 뒷부분. Node 엔진 렌더 후 v8 AAC를 -c copy로 재결합 |
| 편집 방향 | 독립된 능력 소개 두 비트, 초점은 능력자와 악마의 접촉·반응. 짧은 충격 후 자세 유지, 대사 사이 하드컷, 마지막에는 기존 구덩이 컷으로 연결 |
| 오디오 SHA256 | 90fd96403e6f87aa3ee0b04f1acc7f2676707f133705a17e7eef8d4039cb271b, v8/v9 ADTS 비트스트림 완전 일치 |
| 기존 화면 보존 표본 | 4/14/78/111초의 320×180 RGB 평균 절대 차 1.043044/1.033721/1.069485/0.189138 (0~255). 컷 배치·내용은 동일, 재인코딩 손실은 존재 |
| 컷 조작 | WorldIntroPlayer.CUTS에 87.375 추가, 17개 시작점. Enter/클릭 next가 마법사 컷을 독립적으로 탐색 |
| 캐시 | world-intro-player.js?v=20260907-v9-demon-duels. 자막 데이터는 version v8 / cache 20260907-v8-we-call 그대로 |
| 회귀 단위 테스트 | 플레이어 11 + 자막 7 + 캐릭터 자막 2 = 20 PASS |
| 인게임 검사 | tmp/verify_world_intro_ingame.py PASS. 87.375초 컷 전환·각 한국어 자막 대응, BGM pause/seek 0, 28언어 마지막 큐·로고·종료·재진입·ESC 스킵, pageerror 0 |
| 인게임 증빙 | output/cinematic/world_intro_v9_psychic_ingame.png / world_intro_v9_mage_ingame.png, 두 컷과 하단 한국어 자막 직접 확인 |
| 화면 증거 | output/cinematic/b04_v3_duels_proof.jpg, 원본 10시점 + 실제 편집 타임라인 2시점 |
| 기술 검사 | output/cinematic/world_intro_v9_qa.json; 프레임 수·A/V 길이·오디오 해시·기존 구간 표본 차 검증 PASS |
| 미리보기 | output/cinematic/b04_v3_demon_duels_preview.mp4, 영어 음성을 포함한 해당 6초 구간; 인게임 28언어 자막은 별도 TextTrack |
| 편집 프로젝트 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/8b687978-2962-49d5-a41f-862282e66ae8.zip (edit.jsx / input / project 포함). fable_editor 도구가 제공되지 않아 MP4와 파일 기반 프로젝트로 납본 |
| 원본 보존 | v8 전체 영상, B04 v2 원본, 이번 두 원화·두 무음 생성 원본을 프로젝트에 유지. 배포·커밋 없음 |
