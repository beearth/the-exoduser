# 전쟁 복수 프롤로그 W09–W11 병렬 리마스터 (2026-09-09)

> **최신 실행안 v7:** [컷별 기획·마지막 대사 분리](WARINTRO_REALISM_V7_PRODUCTION_20260909.md). 가족 장면 실사풍으로 후반을 재제작한다. 마지막 대사를 “지옥을 탈출하라.” → 약1.2초 쉼 → “죄인이여.”로 분리한 음성 초안과 원화2장 준비. 의미상21대사·자막22cue·101초, 질문 뒤3.7초 유지. 실제 영상은 원화 업로드 권한 문제로 생성 미완료. v5/v6 및 아래 파일/검사값은 불채택 제작 이력이다.

사용자 지시: 남은 컷을 병렬로 제작하고 한 번에 검수. 기존 원화의 구도와 묘사 범위를 유지하는 변환 작업이며 게임 런타임은 변경하지 않는다.

| 컷 | 원고 id | 원화 | 길이 | 영어 음성 길이 | 음성 배치 | 한국어 자막 |
|---|---|---|---:|---:|---|---|
| W09 | wa17 | cin_bloodbath.jpg | 5초 | 2.742857초 | 1.0–3.742857초 | 그날 밤, 킬루 가문을 모두 죽였다. |
| W10 | wa19, wa20, wa21 | cin_torture.jpg | 10초 | 8.385306초 | 1.0–9.385306초 | 칼로 킬루의 팔다리를 자르고 / 불로 지혈까지 해주며 / 오래오래 살려두었다. |
| W11 | wa22, wa23 | cin_remember.jpg | 6초 | 3.239184초 | 1.0–4.239184초 | "기억하라." / "그리고 지옥에서도 후회하라." |

## 제작 계약

| 항목 | 값 |
|---|---|
| 원고 | `output/cinematic/warintro_remaster_20260909/source_manifest.json` 원문 그대로 |
| 음성 | ElevenLabs `WS6naCm8T4gbyzsLnOjK`, `eleven_multilingual_v2` |
| 음성 설정 | stability 0.65, similarity_boost 0.8, style 0.15, speaker boost 사용 |
| 영상 | `cinematic_studio_video_v2`, std, 16:9, sound off, suspense, linear, cfg_scale 0.5, count 1 |
| 편집 | native Higgsedit `f39e3bc5882b`, 1280×720, 24fps, 영상과 음성 별도 트랙 |
| 자막 시각 | 최종 더빙 MP3를 Whisper 단어별 정렬 후 원문 문장 경계에 묶음, 음성 오프셋 1초 적용 |
| 자막 스타일 | Noto Serif CJK KR, ASS fontsize 13, marginv 32, outline 0.6, shadow 0.4, no-caps |
| QA | 원고 일치, 음성 PCM 상관계수 >0.95, 전체 디코드, 영상·음성 길이 차이 <0.2초, 문장별 중간 프레임·첫/마지막 프레임 육안 확인 |
| 출력 | `output/cinematic/warintro_remaster_20260909/batch/w09`, `w10`, `w11` |

W09는 동작 후 정적 구도를 유지하며 망토 가장자리·불빛·연기만 절제해서 움직인다. W10은 기존 원화의 인물·손·도구·사슬을 정지시켜 기존 장면의 동작을 진행시키지 않고 배경 연기와 조명만 변화시킨다. W11은 가족 기억과 무릎 꿇은 인물을 고정하며 달빛·연기·불씨를 움직인다. 추가 상해나 새로운 폭력 동작을 생성하지 않는다.

현재 상태: W09·W10·W11 제작 완료, 합본 사용자 검수 대기. W11의 최초 제출은 동시 생성 6개 제한으로 미제출되었고 슬롯이 생긴 뒤 1회 제출하여 완료했다.

## 완료 검수

| 컷 | 한국어 cue 시각 | 최종 크기 | PCM 상관계수 | 샘플 검수 |
|---|---|---:|---:|---|
| W09 | 1.00–3.55초 | 1280×720 / 24fps / 5초 | 0.999973 | 5프레임, 손·검 유지, 망토·카메라 전진, 자막 정상 |
| W10 | wa19 1.00–3.41초 / wa20 3.48–5.69초 / wa21 6.02–9.03초 | 1280×720 / 24fps / 10초 | 0.999967 | 7프레임, 원화 인물 구도 유지, 문장별 자막 정상 |
| W11 | wa22 1.00–1.48초 / wa23 1.48–3.93초 | 1280×720 / 24fps / 6초 | 0.999987 | 6프레임, 가족 실루엣·철창·무릎 꿇은 인물 유지, 자막 정상 |

세 컷 모두 전체 디코드, 영어 원고 정확 일치, 영상·음성 각각 최종 길이 일치, 업로드 HTTP 200 및 media_confirm을 통과했다. PCM으로 디코딩한 최종 오디오와 원본 MP3 음성을 비교하여 1초 배치와 보존 여부를 검증했다. 실시간 청취나 모든 프레임의 수동 검수는 수행하지 않았으며, 사용자 합본 검수로 최종 승인한다.

W09의 전진은 요청보다 강하여 끝부분에서 하반신이 프레임 밖으로 나간다. 손·검 연결은 표본 프레임에서 유지된다. W10은 원래 정지 요청에서 미세한 자세 변화가 발생했으나 표본 프레임에서 새로운 상해 묘사는 확인되지 않았다. W11의 첫 자막은 짧은 단어에 맞춘 0.48초이며 이후 두 번째 문장으로 바로 이어진다.

| 컷 | 자막본 | 더빙 clean | 패키지 |
|---|---|---|---|
| W09 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/fcdbf540-8174-4cf3-9774-4136cfc87fe5.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/e5c7199b-f874-4f4a-a8d4-ab23e625f5f1.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/9fab0cfe-e9bb-47c1-bb4a-15d45e8c8885.zip |
| W10 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/6f549969-3471-4e47-9365-82e2f097b841.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/3c7d0f92-5655-419b-88fc-3b2267df233b.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ebdbb134-3745-4627-8d81-93802fcea39f.zip |
| W11 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/da0af7b2-10b3-4ff5-bfb2-8a4c8d0b9663.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/76fcc7d8-126e-4827-b95e-25d2b43d5033.mp4 | https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/e2adaee3-51d8-43bb-9516-b0cd40d763fc.zip |

각 폴더의 `deliverable.json`이 합본용 URL·길이·음성 위치·표본 검수 판정의 구조화 기록이다. `clean.mp4`, `final.mp4`, `voice.mp3`, `caps.srt`, `qa.json`, `contact.jpg`, `package.zip`은 로컬에 모두 보관했다. 공용 문서 동기화와 커밋은 부모 작업에서 처리하며 본 작업은 git index를 변경하지 않았다.
