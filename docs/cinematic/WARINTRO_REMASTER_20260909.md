# 전쟁 복수 컷신 리마스터링 — 2026-09-09

> **최신 실행안 v7:** [컷별 기획·마지막 대사 분리](WARINTRO_REALISM_V7_PRODUCTION_20260909.md). 가족 장면 실사풍으로 후반을 재제작한다. 마지막 대사를 “지옥을 탈출하라.” → 약1.2초 쉼 → “죄인이여.”로 분리한 음성 초안과 원화4장 준비. 의미상21대사·자막22cue·101초, 질문 뒤3.7초 유지. 원화 업로드 성공 후 W09 영상1개 생성 요청이 접수되어 처리 중이며, 전체 영상은 미완료. v5/v6 및 아래 파일/검사값은 불채택 제작 이력이다.

> v4 제작 이력: [101초·28컷 합본 v4](WARINTRO_FINAL_CUT_V4_20260909.md)에 지옥 탈출 마무리 W16-D를96~101초로 추가하고 마지막89.5~101초의 움직임을 보정한다. 영어 원음·한국어21cue·질문 뒤3.7초 간격, W02 빈손·W04 문 폐쇄와 주저앉음·가족별 신규 장면은 유지한다. 전체1080p60 출력 완료이며 앞0~89.5초의 원래24fps 움직임은 유지한다. v4는 로컬 검수본 제작·기술/표본 검사 완료(PASS_FOR_REVIEW), 실시간 시청·청취 승인 및 게임 적용은 별도, 기존 [99초·27컷 v3](WARINTRO_RECUT_V3_20260909.md)는 이전 완성본이다.

상태: v4는101초·28편집컷·원본16서사·원문21cue로 로컬 검수본 제작·기술/표본 검사 완료(PASS_FOR_REVIEW), 실시간 시청·청취 승인 및 게임 적용은 별도. v3의99초·27편집컷 제작·전체 디코딩·음성/자막 검사·최종18개 중간 표본 시각 확인은 완료 이력으로 보존한다. 게임 런타임 미적용. 이전95초 합본과99초 v2·v3는 제작 이력으로 보존한다.

사용자 요청: 기존 “전쟁에서 살아 돌아온 한 남자.” 컷신 리마스터링. 최근 세계관 영상과 같은 목소리로 영어 대사 + 한글 자막. 기존 서사를 기준으로 작업한다.

| 항목 | 기준 |
|---|---|
| 원본 | game.html PROLOGUE_LINES, wa01~wa34 |
| 현행 길이 | 원본 게임104.5초; 별도 리마스터 v3 99초; 로컬 v4/v5 이력101초; 불채택 v6 이력101초·27편집컷; 후반 실사풍 재제작 목표101초(최종 컷 수 미정) |
| 현행 원화 | assets/cutscene/warintro/ JPG 12장; PNG 원본도 존재 |
| 현행 음성 | bgm/공통/intro_voice.mp3 |
| 현행 BGM | cutscene_warintro → bgm/1장_썩은숲/h0_explore.mp3 |
| 지정 음색 | ElevenLabs WS6naCm8T4gbyzsLnOjK |
| 기존 세계관 보이스 설정 | eleven_multilingual_v2, stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true, mp3_44100_128 |
| 첫 검수 컷 | cin_war.jpg, 기존 한영 wa02 대사; 호흡·망토·불씨·절제된 카메라 움직임 |
| 자막 계획 | 하단 중앙 명조체·얇은 외곽선; 실제 영어 발화에 한국어 자막 동기화 |
| 제작 순서 | 첫 컷 검수본 → 후속 컷 → 합본·기술/시각/음성 검수 |
| 적용 상태 | 기존 게임·음성·원화 유지. 검수본은 별도 파일 |

## 기존 한영 대사와 시간 (원본 참조, 새 더빙 타이밍 아님)

| ID | 원본 시작(초) | 원본 자막 길이(초) | 한국어 | 영어 | 원화 |
|---|---:|---:|---|---|---|
| wa02 | 2.5 | 2.5 | 전쟁에서 살아 돌아온 한 남자. | A man who returned alive from war. | warintro/cin_war.jpg |
| wa04 | 5.5 | 5 | 하지만 집은 모두 불타 사라졌다. | But his home had burned to nothing. | warintro/cin_ruins.jpg |
| wa06 | 13 | 4.5 | 이웃이자 친구였던 킬루가 그의 가문을 짓밟았다. | Killu, once a neighbor and friend, had crushed his family. | warintro/cin_throne.jpg |
| wa08 | 19.7 | 4.2 | 아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, | His wife was taken as a servant and suffered unspeakable horrors, | warintro/cin_throne.jpg |
| wa09 | 23.9 | 3.1 | 끝내 못 이겨 스스로 목숨을 끊었다. | until she could bear no more and took her own life. | warintro/cin_throne.jpg |
| wa11 | 28.6 | 4.4 | 아이들은 노예로 팔려가 어디에 있는지조차 알 수 없다. | His children were sold into slavery — their fate unknown. | warintro/cin_throne.jpg |
| wa12 | 33 | 4 | 늙은 부모는 감옥에 갇혀 굶어 죽었다. | His elderly parents were imprisoned and starved to death. | warintro/cin_throne.jpg |
| wa14 | 38.8 | 4.5 | 킬루 가문의 모두가 알고 있었다. | Everyone in the Killu household knew. | warintro/cin_bystanders.jpg |
| wa15 | 43.3 | 2.7 | 31명이 보고도 못 본 척했다. | Thirty-one of them saw everything and looked away. | warintro/cin_bystanders.jpg |
| wa17 | 47.9 | 3.1 | 그날 밤, 킬루 가문을 모두 죽였다. | That night, he killed every last one of them. | warintro/cin_bloodbath.jpg |
| wa19 | 53.6 | 3 | 칼로 킬루의 팔다리를 자르고 | He cut off Killu's limbs with a blade, | warintro/cin_torture.jpg |
| wa20 | 56.6 | 2.6 | 불로 지혈까지 해주며 | cauterized the wounds with fire, | warintro/cin_torture.jpg |
| wa21 | 59.2 | 6 | 오래오래 살려두었다. | and kept him alive for a long, long time. | warintro/cin_torture.jpg |
| wa22 | 65.2 | 3 | "기억하라." | "Remember." | warintro/cin_remember.jpg |
| wa23 | 68.2 | 5.4 | "그리고 지옥에서도 후회하라." | "And regret it even in hell." | warintro/cin_remember.jpg |
| wa24 | 73.6 | 2.4 | 그리고 지옥에 떨어진다. | And so he fell into hell. | warintro/cin_fallhell_custom.jpg |
| wa26 | 78.9 | 3.6 | "...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐." | "...This is but one tale among countless avengers." | warintro/emg1.jpg |
| wa28 | 84.8 | 4.1 | "지옥의 미로에는 매일 새로운 영혼이 떨어진다." | "Every day, new souls fall into hell's labyrinth." | warintro/cin_demonbattle.jpg |
| wa29 | 88.9 | 5.1 | "분노로 가득 찬 자, 억울함에 미친 자, 사랑을 잃은 자..." | "Those consumed by rage, driven mad by injustice, those who lost love..." | warintro/cin_demonfight.jpg |
| wa31 | 94.8 | 2.2 | "너는 왜 지옥에 왔느냐?" | "Why have you come to hell?" | warintro/cin_nemesia_hd.jpg |
| wa33 | 99 | 4 | "지옥을 탈출하라, 죄인이여." | "Escape from hell, sinner." | warintro/cin_nemesia_hd.jpg |

## 첫 컷 제작 기록

| 항목 | 값 |
|---|---|
| 원화 확인 | cin_war.jpg: 검은 갑옷·검·망토의 남성, 불타는 전장. 기존 원화 직접 확인 |
| 원화 media_id | 98ca39de-24ec-49eb-9ceb-391d16e678ab, HTTP 200·confirm 완료 |
| 영상 job | 2815ab42-2bdc-45e8-8698-614612c00ce8 |
| 영상 설정 | cinematic_studio_video_v2, 5초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 비용 사전조회 | 5크레딧; 영상 요청 1회 |
| 영어 음성 | w01_en.mp3, 38,914바이트, tools/elevenlabs_tts.mjs로 성공 생성 1회 |
| 음성 media_id | 7643345f-32b3-4068-aefd-e0d3690c5f47, HTTP 200·confirm 완료 |
| 제작 이슈 | 최초 ElevenLabs 요청은 샌드박스 네트워크에서 fetch failed. 사용자 승인 후 재실행 성공. 자동 IN THE DARK 추천은 기존 원화·연출 기준으로 적용하지 않음 |

- output/cinematic/warintro_remaster_20260909/source_manifest.json: 기존 한영 대사와 JPG SHA-256.
- output/cinematic/warintro_remaster_20260909/w01_en.txt: 첫 컷 기존 영어 원고.
- docs 검색: 전쟁에서, 전쟁 복수, warintro, intro_voice, PROLOGUE_LINES.

## 첫 컷 완성본·검증

| 항목 | 결과 |
|---|---|
| 납본 | output/cinematic/warintro_remaster_20260909/final.mp4, 1,671,944바이트 |
| 규격 | 1280×720, 24fps, 120프레임, H.264/AAC 48kHz, 영상·음성 모두 5.000초 |
| 더빙 | 영어 wa02 원고 그대로, 원본 MP3 길이 2.403265초, 영상 1.000초에서 시작. 속도·피치 변경 없음 |
| 자막 시간 | 1.000~3.210초, 전쟁에서 살아 돌아온 한 남자. |
| 자막 시계 | faster-whisper small: 7단어/7단어, 원고 일치도 1.0. 발화 0.000~1.960초에 삽입 지연 1초와 종료 여유 0.25초를 적용 |
| 자막 스타일 | Noto Serif CJK KR Medium, 하단 중앙, 흰색·투명 배경, libass fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps |
| 믹스 | 첫 컷 검수본은 영어 내레이션만. 원본 BGM 계약은 게임에서 유지, 별도 검수본에는 음악·SFX 미삽입 |
| 편집 | Higgsedit native f39e3bc5882b, 영상 0초부터 5초, 음성은 CLI place로 별도 트랙에 1초 배치. H.264 8bit 목표 8Mbps, shards 1 / concurrency 1로 clean 마스터 생성 후 번들 clean 자막 도구 사용 |
| 실제 출력 검증 | clean/final 전체 디코딩 오류 없음. 음성 PCM 상관계수 0.9999958869799376, 출력 오디오 5초·테일 보존 |
| 화면 확인 | 1.200초 / 3.010초 / 4.500초 접촉 시트 직접 확인. 앞 두 프레임 한글 정상·잘림 없음, 후반 자막 종료. 얼굴·갑옷·검·불타는 전장 유지, 망토·불씨·시선·프레이밍 변화 확인 |
| 판정 범위 | 제작 당시 정지 프레임의 구성·자막 확인 완료, 별도 스피커 청취 검수는 미실시. 이후 사용자 “좋네 다음컷”으로 첫 컷 승인·후속 컷 제작 요청 |
| 원본 보존 | 원화 12장 SHA-256 일치, 기존 대사 21개가 문서·매니페스트와 일치. 게임 코드·기존 음성 미변경 |
| 납본 확인 | final/clean/contact/package 업로드 HTTP 200 및 media_confirm 완료. ZIP 다운로드 후 final/clean/source 바이트 수를 원격 검수 기록과 대조 |
| 재현 자료 | render_w01.py, edit.jsx, source_manifest.json, qa.json, alignment.json, caps.srt, en.srt, source.mp4, w01_en.mp3, clean.mp4, final.mp4, contact.jpg, package.zip |
| 수정 기록 | p.cut의 audio/visual track 0 충돌을 CLI place의 자동 별도 트랙으로 수정. CLI render의 --out은 프로젝트 상대 경로라 renders/clean.mp4로 지정. 생성 영상·더빙 재요청 없이 합성만 수정 |

[첫 컷 영어 더빙 + 한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9c707007-b2e2-42ca-9c9f-9b6de551c294.mp4) · [무자막 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/d6063c30-9338-4300-995a-73e9fe7b61a3.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a155779b-c7dc-46c5-b0de-fc75eb23ba7a.zip)
