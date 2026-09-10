# 전쟁 복수 리마스터 병렬 제작 — W07·W08

> **현재 재생본 v13 · Remember 회상 편집:** [제작·검사 기록](WARINTRO_MEMORY_V13_20260910.md).60.5초에 아내→부모→아이들 수송 마차를 각0.15초씩 삽입,60.95초 전사 복귀. v12 그림자는 사용자 불채택으로 제외.103.5초/22cue/음성 보존. 학살·킬루 등 나머지 연출 보완은 남아 있다. 아래 이전 버전 값은 이력으로 보존.

2026-09-09 사용자 남은 컷 병렬 제작·일괄 검수 승인에 따른 작업. 게임 런타임·원본 JPG는 수정하지 않는다.

| 컷 | 원본 ID | 한국어 원고 | 영어 원고 | 길이 | 연출 |
|---|---|---|---|---|---|
| W07 | wa12 | 늙은 부모는 감옥에 갇혀 굶어 죽었다. | His elderly parents were imprisoned and starved to death. | 6초 | 새 청회색 감방 원화. 노부부 원경·빈 그릇 2개, 고정된 철창 밖으로 느린 후퇴 |
| W08 | wa14·wa15 | 킬루 가문의 모두가 알고 있었다. / 31명이 보고도 못 본 척했다. | Everyone in the Killu household knew. Thirty-one of them saw everything and looked away. | 8초 | 기존 cin_bystanders.jpg의 꿰맨 가면들, 한 연속 컷에 한국어 2개 cue |

| 공통 계약 | 값 |
|---|---|
| 출력 | 1280×720, 24fps, clean.mp4 영어 음성 / final.mp4 한국어 burn |
| 목소리 | ElevenLabs WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 / stability .65, similarity .8, style .15, speaker boost |
| 발화 원본 길이 | W07 3.657143초 / W08 6.269388초 |
| 발화 배치 | 각 영상 1.0초에서 시작 |
| 자막 | clean MP3 Whisper 단어 시계, authored English 검증, 한국어 원문 cue |
| 자막 외형 | Noto Serif CJK KR Medium, ASS fontsize 13 / marginv 32 / outline .6 / shadow .4 |
| 영상 생성 | cinematic_studio_video_v2, std, sound off, suspense, linear, cfg .5, single shot |
| 신규 원화 | W07 내장 image_gen, batch/w07/cin_parents_cell.png; image_prompt.txt 보존 |

W07은 노부부의 고통이나 죽는 행위를 확대하지 않고 정적인 거리와 빈 그릇으로 상실을 전달한다. W08은 움직이지 않는 가면과 배경 불빛·연기만 사용한다. 손·건축 왜곡 지적을 반영해 손과 철창, 그릇을 고정한다.

W07 생성 job fc4429f3-5391-4b9d-bb65-73fa1b7a9230, W08 job 6bdec6e7-5829-4c10-86c7-d0a317458502. W08 최초 요청은 동시 6 job 제한으로 미제출되었으며 비용을 쓴 재생성이 아니다. 각 영상 1회 생성, 업로드 각 4개 모두 HTTP 200 확인 후 confirm 완료.

## 완료·검수 기록

| 항목 | W07 | W08 |
|---|---|---|
| 상태 | 생성·합성·표본 검수 완료 | 생성·합성·표본 검수 완료 |
| voice.mp3 | 58,976bytes / 3.657143초 | 100,772bytes / 6.269388초 |
| 음성 배치 끝 | 4.657143초 | 7.269388초 |
| 한국어 cue | 1.000~4.350초 | wa14 1.000~3.510초 / wa15 4.240~7.150초 |
| final.mp4 | 1,544,276bytes / 6초 | 3,738,297bytes / 8초 |
| clean.mp4 | 5,989,045bytes / 6초 | 7,977,843bytes / 8초 |
| PCM 상관 | .9999604259 | .9999722345 |
| STT 검증 | small similarity 1.0 / 9단어 완전 일치 | small .827586 → medium .857143; Kilu/Killu, 31/Thirty-one 두 표기 차이만 확인. 명시 alias 정규화 후 raw 14단어 완전 일치 |
| 영상·오디오 스트림 | 1280×720 H.264 24fps / AAC 48kHz, 양쪽6초 | 1280×720 H.264 24fps / AAC 48kHz, 양쪽8초 |
| 표본 | 시작·cue내2장·끝부2장 = 5장 | 시작·각cue중간·끝부2장 = 5장 |

W07 표본에서는 노부부 2명, 빈 그릇 2개, 곧은 철창이 유지된다. 후퇴 이동량은 프롬프트의 몇 인치보다 크지만 고립감과 공간 원근은 읽힌다. W08은 가면 사이로 이동하며 입의 꿰맨 형상과 속이 빈 눈을 유지한다. 두 한국어 cue는 읽을 수 있고 주 피사체를 가리지 않는다. 전 프레임 디코드와 오디오 길이, 원음 PCM 보존 검증 통과. 사람의 실제 청취 승인을 받았다는 의미는 아니며 전체 합본의 리듬은 부모 작업에서 별도로 검수한다. qa.json의 visual_review_pending은 생성 당시 자동 receipt이며 이 문서·deliverable.json에 이후 표본검수 결과를 기록한다.

W08의 medium STT는 Kilu와 숫자31로 받아써 단순문자 유사도만 .857143이다. 원고는 그대로 보존하고 해당 두 표기 alias 외 모든 raw단어의 순서·개수·내용을 검사한다. 각 raw단어 Whisper 시각을 사용하여 원문 문장 두 개로 묶는다. 텍스트 길이로 시간을 추정하지 않는다. alignment.json에 raw_words와 verified_spelling_aliases, alias_normalized_exact_match를 보존했다.

| 컷 | 한국어 완성본 | 영어 clean | 편집 패키지 |
|---|---|---|---|
| W07 | [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/c5f6e000-0bcb-41d4-b8a4-6b87c8b6d4aa.mp4) | [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/14476ca4-ebe0-48b3-b621-7b1ff2ea146e.mp4) | [ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/2a6bd6e3-4e20-4a56-8163-58d05becd5d1.zip) |
| W08 | [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/d3ce5386-0c59-4004-94e3-162dc62dff94.mp4) | [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a953230d-3398-4582-981c-1b9a5ee3f6dc.mp4) | [ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/0d0a892a-2eba-49a3-a22d-e907d5471fc2.zip) |

로컬 출력: output/cinematic/warintro_remaster_20260909/batch/w07 및 w08. 각 폴더에 render 스크립트, generation_request.json, source_manifest.json, 영어원고, voice.mp3, source/clean/final.mp4, caps.srt, en.srt, alignment.json, qa.json, contact.jpg, package.zip, deliverable.json을 보존한다. W07 원화는 내장 image_gen 생성이며 최종 프롬프트 image_prompt.txt도 같은 폴더에 있다. 원본 런타임·대사·원화는 변경하지 않았으며 공용문서·git index는 부모 에이전트 소유다.
