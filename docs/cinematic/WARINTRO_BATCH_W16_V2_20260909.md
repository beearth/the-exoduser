# W16 v2 — 네메시아 얼굴 연속성 보정

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
