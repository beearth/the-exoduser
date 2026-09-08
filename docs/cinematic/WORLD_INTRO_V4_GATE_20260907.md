# 세계관 인트로 v4 — “잔혹하게도” 지옥문 컷

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

사용자 요청: “잔혹하게도, 지옥은 단 하나뿐이다” 대사에 맞는 짧은 컷. 두 문장 사이의 무대사 삽입이 아니라 **해당 대사가 나오는 화면 교체**다. 기존 힉스필드 이미지 두 장을 지정했고, 갤러리 스크린샷으로 원본 선택을 확인했다.

## 원본·생성

| 항목 | 값 |
|---|---|
| 사용 원화 | `54731a6a-1145-40d8-904e-c7c6eb46f107` — 거대한 닫힌 문·사슬·봉인 |
| 함께 확인한 후보 | `e7ce0887-b5de-49c9-9079-737af4f73e68` — 좁은 다리 끝 문. 이번 단일 숏의 입력에는 넣지 않음 |
| 원본 확인 | `show_generation_by_ids`로 두 job 모두 image / completed 및 원본 URL 확인. 사용자 재업로드 불필요 |
| 생성 모델 | Higgsfield `cinematic_studio_video_v2`, 4초, 16:9, std, sound off, horror, linear, multi_shots false, cfg_scale 0.5, count 1 |
| 생성 job | `2f0093df-6383-4a29-a7a0-ac174605f43d`, completed |
| 비용 | 사전 조회 4크레딧, 1개만 생성, 추가 이미지/보이스 생성 없음 |
| 연출 | 닫힌 단 하나의 문으로 느린 접근. 사슬·석조·봉인 유지, 낮은 안개·재·중앙 틈의 미약한 붉은빛. 문 열림·탈출·폭발·여러 포털 없음 |

콘셉트는 피할 수 없는 유일한 지옥, 위계는 거대한 봉인문 → 사슬 → 붉은 틈, 동작은 느린 전진과 안개, 리듬은 단일 숏, 끝은 닫힌 문 유지다.

## 편집·런타임 계약

| 항목 | 값 |
|---|---|
| 입력 합본 | v3 `world_intro_auto_v3_en_ko.mp4` 원본 보존 |
| 교체 구간 | 12.750000~17.291667초, 24fps 프레임 306~414, 길이 109/24 = 4.541667초 |
| 짧은 생성물 처리 | 영상만 기존 대사 창 길이로 리타이밍. 음성 속도·피치·음량 변경 없음 |
| 한국어 자막 | “잔혹하게도, 지옥은 단 하나뿐이다.” 기존 합본의 Whisper 검증 cue 12.762~16.402초 유지. 개별 컷 0.012~3.652초 |
| 자막 검증 | 새로 추출한 해당 구간 원음 + authored English script를 faster-whisper medium으로 검증, similarity 1.0. report timed_words/caption_words 각 7토큰, 정규화 문장 8단어 전체 일치 |
| 자막 모양 | 기존 clean burner, WenQuanYi Zen Hei / fontsize 13 / marginv 23 / outline 0.8 / shadow 0.4 / no-caps |
| 편집 프로젝트 | `output/cinematic/world_intro_v4_gate_edit.jsx`, Higgsfield higgsedit 3구간 컷 편집·Node 엔진 렌더 |
| 원음 보존 | 최종 MP4는 v3의 AAC 스트림을 그대로 재결합. 양쪽 AAC SHA-256 `12b05b3550c5bfecedf99314edd586c05c8ebc2ead1f7630dbe388ae65c99e71` 동일 |
| 최종 규격 | 1280×720 / 24fps / 2719프레임 / H.264 + AAC / 비디오 113.291667초 / 오디오 113.291000초 |
| 게임 파일 | `video/world_intro_v4_gate_en_ko.mp4`, 32,377,354바이트 |
| 런타임 | index.html의 `worldIntroVideo.src`를 새 파일로 연결. `WorldIntroPlayer.CUTS`에 12.75초 추가. 스크립트 캐시 키 `20260907-gate-v4` |
| BGM | 앞서 고친 문 열림부터 연속 재생 그대로. 음악 정지/되감기/재시작을 추가하지 않음 |
| 유지 | 총길이, 기존 나머지 대사·컷, 한글 자막, 마지막 금속 EXODUSER / HELL ROAD. 기존 v3 파일·전쟁 복수 서사 불변 |

## 검수·납본

단일 컷의 0.125/0.5/1.5/3.0/4.5초 및 완성 합본 전환 전후 12.70/12.875/14.5/16.25/17.25/17.375초 표본을 확인했다. 문·사슬·봉인·자막이 읽히고 끝까지 닫힌 문 유지. 우주 장면 → 지옥문 → 다음 협곡으로 연결되며, 표본에 중복 자막/글자 잘림 없음. 전체 디코딩 PASS, 음성 bit-identical, 길이·프레임 수 유지. 최종 연출 감상·실시간 청취 승인은 사용자 확인 단계다.

단위 회귀 `test/worldIntroPlayer.test.js` 10개 PASS. `tmp/verify_world_intro_ingame.py` 실제 브라우저 검증 PASS: 새 파일 로드·14초 지옥문 표본·BGM 연속성, pause 0회/seek 0회(사용자 일시정지 이전), 명시적 정지/재개·컷 넘김·자연 종료·재진입·ESC 종료 확인. pageerror 0. `output/cinematic/world_intro_v4_gate_ingame.png`에서 지옥문과 해당 한국어 자막을 확인했다.

라이브 편집기 `fable_editor` 도구가 제공되지 않아 MP4와 파일 기반 편집 프로젝트 ZIP으로 납본한다. 최초 전환 이미지 업로드의 잘못된 응답 경로(`uploads[0]` 누락)는 수정하여 정상 URL에 HTTP 200 업로드 후 확인했다. 재생성·추가 과금은 없었다. 커밋·배포 없음.

- [대사 포함 짧은 지옥문 컷](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/ff30b2de-d72a-4798-bfd6-bac9261d1391.mp4)
- [전체 합본 v4](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/792cff1d-e510-4bae-a827-7a688a572680.mp4)
- [프로젝트·원본·검수 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/edf2aa90-46ac-4090-8228-c19784438aed.zip)
- [인게임 확인](http://127.0.0.1:3333/?cinematic=1)
