# B04 v4 / 인트로 v10 — 초능력 3초 + 전통 판타지 마법 3초

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자 최신 지시: “초능력 3초만 짤라서 쓰고 나머지는 다시만들면돼겠네”.
원형 마법진·손 방패·슈퍼히어로식 손 밀기를 사용한 이전 마법사 컷은 거부/교체 이력이다. 기존 초능력 원본은 재생성하지 않고 3초 사용하며 마법사만 새 원화·Higgsfield 영상으로 교체했다. 나머지 인트로 컷과 총길이는 유지한다.

## 현행 계약

| 항목 | 값 / 적용 위치 |
|---|---|
| 마스터 | video/world_intro_v10_traditional_magic_en.mp4, 32,322,295바이트 |
| 규격 | H.264/AAC, 1280×720, 24fps, 2719프레임; 영상 113.291667초 / 음성 113.291000초 |
| 11A 초능력 | 84.791667~87.791667초, 3초 / 72프레임. output/cinematic/b04_v3_psychic_demon.mp4 재사용, speed 1 |
| 11B 마법사 | 87.791667~90.791667초, 3초 / 72프레임. output/cinematic/b04_v4_traditional_mage.mp4 앞부분 사용, speed 1 |
| 뒤 컷 | C12는 기존 90.791667초 유지. 다른 CUTS도 동일, 총 17개 시작점 |
| 마법 연출 | 양손으로 목제 지팡이를 내리침 → 자연 균열 → 악마 발밑에서 실제 불이 분출, 악마가 뒤로 젖혀짐. 원형 마법진/방패/포털/기하 문양 없음 |
| 실제 동작 표본 | 원본 0.6초 지팡이 착지·먼지, 1.2~1.8초 균열과 악마 접근, 2.4초 화염 기둥·상체 젖힘, 2.958초 낮아진 자세와 잔불·연기. 생성 동작은 프롬프트보다 늦으나 사용 3초 안에 분출·반응이 보임 |
| 새 원화 | output/cinematic/b04_v4_traditional_mage_keyframe.png. imagegen 스킬로 새 전통 판타지 구도 생성; 기존 초능력 원화는 공간·재질 참고만 사용 |
| 참조 media | 3b175d2b-52bf-4481-b132-2266a1ed062c |
| 영상 생성 | Higgsfield cinematic_studio_video_v2, job 10f15ba5-c91c-44e6-9367-21ee573c7a26 |
| 생성 설정 | 4초, 16:9, count 1, mode std, sound off, genre action, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 사전 비용 | 4크레딧, 영상 1회 제출. 초능력/음성 재생성 없음 |
| 프롬프트·계획 | output/cinematic/b04_v4_traditional_magic_plan.json, image_prompt / video_prompt 보존 |
| 편집 | output/cinematic/world_intro_v10_edit.jsx, Higgsfield higgsedit 파일 기반 프로젝트. 기존 앞 2035/24초 → 초능력 3초 → 마법사 3초 → 기존 2179/24초부터 540/24초 |
| 샘플링 한계 | Higgsedit의 분수 시작점에서 원본 대비 +1프레임 샘플링이 관찰됨. 초능력 7표본은 원본 ±1프레임 이내, RGB MAD 0.98~1.21. 최종 구간은 정확히 72프레임이며 속도·내용 재생성 없음 |
| 보존 | 기존 원본·v9 마스터 보존. EXODUSER 단독 로고, 마지막 We call them Exoduser., 다른 대사·컷·BGM 시계 유지 |
| 런타임 | index.html 새 MP4 연결, world-intro-player.js CUTS에 87.791667 사용 |
| 캐시 | player 20260907-v10-traditional-magic; subtitle data 20260907-v10-mage-timing; subtitle controller 20260907-v6-cinema-size |
| 범위 밖 | 다른 인트로 컷 재제작, 효과음 추가, 캐릭터 스토리·게임플레이, 커밋·배포 |

## 음성 / 28언어 자막

| 항목 | 값 / 공식 |
|---|---|
| 음성 처리 | v9 영어 AAC를 48kHz stereo float PCM으로 디코드. 원본 87.1~89.5초 마법사 구간을 +20000샘플 = 10/24초 이동 |
| 편집 범위 | 출력 87.1~90.0초만 비우고 87.516667~89.916667초에 위 구간 삽입. 음절이 없는 경계에서 240샘플/5ms 페이드. 범위 밖 디코드 PCM은 완전 동일 |
| 내보내기 | AAC 192k 재인코딩. v8/v9 오디오 비트스트림 해시는 v10에 적용되지 않음 |
| 신호 검사 | peak 0.5594401; 원본 대비 PCM 상관계수: 앞 0.99997263 / 뒤 0.99998090 / 이동 마법사 0.99982949 |
| 큐25 유지 | 84.972~87.252초, 초능력을 지닌 자도, / Those with psychic powers. |
| 큐26 변경 | 87.889~89.729초, 마법의 극에 닿은 자도. / Those at the pinnacle of magic. 기존 87.472~89.312초에 10/24초 더한 뒤 ms 반올림 |
| 큐27 유지 | 90.902~93.622초. 다른 30큐·번역 문장은 변경 없음 |
| 데이터 | WorldIntroSubtitleData.version = v10, 28언어 × 31큐, sourceGroups 유지 |
| 파일 납본 | video/subtitles/world_intro_v6_<code>.srt / .vtt, 56개 큐26 시각 동기화. v6 파일명은 호환성 유지 |
| 스타일 | clamp(32px,5.4vh,50px), snapToLines true / line -3 / position 50 / positionAlign center / align center / size 84, 변경 없음 |
| BGM | 기존 별도 Audio 그대로. 문 열림 gain 0.6 → 본편 0.22/1000ms(50ms 간격). 컷 이동·로딩에 pause/seek 없음 |

오디오 디자인 스킬에 따라 기존 내레이션 리듬과 BGM 연속성을 보존하고, 새 효과음이나 별도 음악을 추가하지 않았다. 실제 스피커 전 구간 청취·예술적 최종 승인은 사용자가 확인한다.

## 검수 / 납본

| 항목 | 결과 |
|---|---|
| TDD | v10 파일·3초 경계·큐26 타이밍 기대값으로 기존 구현 실패 확인 → 구현 후 플레이어 11 + 자막 8 + 캐릭터 자막 2 = 21 PASS |
| 실재생 | tmp/verify_world_intro_ingame.py PASS. 새 마스터 1280×720 / 113.291667초, 초능력→마법사 87.791667초 전환, 한국어 큐 대응, 문/컷 전환 BGM pause/seek 0 |
| 기타 회귀 | 믹서·정지/재개·28언어 마지막 큐·로고 무자막·자연 종료·재진입·ESC 스킵 PASS, pageerror 0, 시청 플래그 변경 없음 |
| 기술 증거 | output/cinematic/world_intro_v10_qa.json: 프레임 수·A/V 길이·음성 상관계수·초능력 원본 일치·기존 화면 4/14/111초 표본 MAD 1.0398 / 0.9784 / 0.1638 |
| 원본 시각 | output/cinematic/b04_v4_traditional_magic_proof.jpg, 원본 6시점. 원형 마법진 없이 지팡이→균열→분출·악마 반응 확인 |
| 인게임 증거 | output/cinematic/world_intro_v10_psychic_ingame.png / world_intro_v10_mage_ingame.png / world_intro_v10_mage_fire_ingame.png |
| 6초 미리보기 | output/cinematic/b04_v4_traditional_magic_preview.mp4, 영어 음성 포함, 자막은 인게임 TextTrack |
| 최종 승인 | 제작/기술/표본 시각 확인 완료. 사용자의 실제 연출 감상·최종 승인 전이며 모든 프레임 해부학 검수는 아님 |

[6초 미리보기](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1dd0c43e-a1f1-46e8-998e-4c2020278db3.mp4) · [전체 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/5ab4bcd0-269f-4763-ab88-12f248a861dc.mp4) · [편집 프로젝트 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/fce54a58-964a-4179-a11b-1be5ada73639.zip)

라이브 fable_editor 도구가 제공되지 않아 MP4 + 파일 기반 프로젝트로 납본. ZIP의 edit.jsx는 그림 편집용이며 최종 음성 이동은 위 표의 별도 PCM 처리 계약을 따른다.
