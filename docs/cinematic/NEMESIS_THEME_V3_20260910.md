# 네메시스 인트로 — 사용자 확정 V3

사용자가 직접 들은 뒤 지정한 파일: `G:\exoduser\bgm\공통\네메시아의 강림 V3.mp3`.

| 항목 | 현재 연결 |
|---|---|
| BGM 키 |cutscene_nemesis |
| 트랙 |bgm/공통/네메시아의 강림 V3.mp3, 1곡 고정 |
| 원본 |145초,3,557,632bytes, 메타데이터 title=네메시아의 강림, Instrumental |
| 일반 신규 입장 |네메시스 INTRO 시작 시 BGM.fadeOut(300),400ms 후 BGM.play('cutscene_nemesis',true) |
| 명시적 구 PRO 미리보기 |전쟁 PRO는 cutscene_prologue 유지, PRO→INTRO 전환 시 cutscene_nemesis로 교체 |
| 조기 종료 |400ms 콜백 시 컷씬 상태가 INTRO_CUTSCENE일 때만 재생 |
| 재생 위치·볼륨 |0초 시작, 기존 BGM._vol 사용(초깃값0.3), force=true로 일반 곡 선택과 무관하게 컷씬 곡 적용 |
| 부분 스킵 |네메시스 대사를 넘겨도 음악 재시작 없이 이어짐 |
| 전체 종료 |기존 fadeOut500ms,600ms 후 스테이지 BGM으로 전환 |
| 전사 영상 |v22의 심연의 탈주 합성 BGM 유지, 네메시스 INTRO에서 V3 시작 |
| 검증 |관련 Node28개 PASS. tools/verify_nemesis_theme.py에서 실제 V3 URL·재생시간 증가·유음·부분 스킵 유지·종료 해제 확인 |
| 증거 |output/cinematic/nemesis_theme_20260910/qa.json. 저장 API는 격리 대역, 실제 사용자 저장 없음 |

기존 네메시아 강림V5 및 구 cutscene_goddess 곡들은 이번 확정 트랙이 아니다. 기존 파일과 공통 재생 목록은 보존한다.
