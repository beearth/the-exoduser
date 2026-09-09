# W16 v2 — 네메시아 얼굴 연속성 보정

> **최신 실행안 v7:** [컷별 기획·마지막 대사 분리](WARINTRO_REALISM_V7_PRODUCTION_20260909.md). 가족 장면 실사풍으로 후반을 재제작한다. 마지막 대사를 “지옥을 탈출하라.” → 약1.2초 쉼 → “죄인이여.”로 분리한 음성 초안과 원화14장 준비. 의미상21대사·자막22cue·101초, 질문 뒤3.7초 유지. 후반 영상16개와 검·갑옷 교정 영상2개 생성·다운로드 완료. 대사·22cue 자막 포함101초 합본 제작 및 전체 디코딩 완료. 수정 컷 표본 검수 완료, 전체 실시간 재생·청취 승인은 미완료. v5/v6 및 아래 파일/검사값은 불채택 제작 이력이다.

> v4 제작 이력: [101초·28컷 합본 v4](WARINTRO_FINAL_CUT_V4_20260909.md)는 첫1.8초→6초→10초 이중 감속에 따른 실동작 약4.32Hz 문제를 원생성 첫1.8초 기반60fps MCI로 보정하고96~101초 지옥 탈출 마무리를 추가한다. 마지막89.5~101초만1080p60 업스케일 완료, 질문 뒤3.7초와21cue 유지. v4 로컬 검수본 제작·기술/표본 검사 완료(PASS_FOR_REVIEW), 실시간 시청·청취 승인 및 게임 적용은 별도이며 아래 W16 v2·95초 합본은 이전 이력이다.

2026-09-09 통합 검수에서 W16 v1 후반부 해골 웃음이 입술 있는 인간형 얼굴로 변하는 현상을 확인했다. 새 영상을 생성하지 않고 원본 영상의 첫 1.8초만 3.3333333333배 느리게 펼쳐 6초로 합성했다. v1 영상·원화·음성은 보존한다. 합본에는 `batch/w16_v2`를 사용한다.

| 항목 | 값 |
|---|---|
| 원고 | wa31 / wa33 |
| 길이 | 6초 |
| 원영상 | W16 job 217a7c0f-1bde-4a85-816c-56eda29961e0 |
| 선택 구간 | 원영상 0–1.8초 |
| 리타임 | setpts 3.3333333333, 24fps, 6초 출력 |
| 합성 | 전처리 후 native Higgsedit 1280×720 24fps |
| 음성 | v1 MP3 동일 파일, 1.0–4.944490초 배치 |
| 질문 자막 | 1.00–2.59초: "너는 왜 지옥에 왔느냐?" |
| 명령 자막 | 3.04–4.63초: "지옥을 탈출하라, 죄인이여." |
| 자막 스타일 | Noto Serif CJK KR / fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 |
| 음성 SHA256 | 1067cd6e0e4895aab2041326e5daff374eae1008b141cc874337ee4ad339b0b6 |
| 자막 SHA256 | 452087661e8cd0878b428b5322a91a4288cf6b734550092729264dd44237132e |
| 검수 | 원고 완전일치, 두 cue 동일, 전체 디코딩, 영상·음성 각6초, 로컬 bytes 검증 통과 |
| 화면 | 6개 표본에서 마지막까지 해골 웃음·보라눈 유지, 손 안정, 한글 정상 |
| 한계 | 프레임 반복을 통한 느린 재생으로 24fps 출력. 전체 실시간 동작 및 음성 사용자 승인 대기 |

`output/cinematic/warintro_remaster_20260909/batch/w16_v2/prepare_source.sh`에 전처리, `render_w16_v2.py`에 합성, `source_manifest.json`에 출처·리타임 조건, `qa.json`과 `deliverable.json`에 검증 수치·호스팅 주소를 기록했다. 음성과 한국어 자막은 v1과 해시가 같다.

검수본 [final](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/13069b6d-28e3-4288-bfe4-e6fcdfae5c60.mp4), [clean](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/1e581a14-a2df-421c-967f-fcd592df7074.mp4), [package](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/4fb4a039-7c3b-4b0a-91ee-f80880c6eed5.zip)를 업로드한 후 HTTP 200 및 media_confirm을 확인했다.
