# 현행 계약 — PARITY-INTRO-01 (2026-10-22)

[웹 인트로 복원 계약](PARITY_INTRO_01_20261022.md)이 우선한다. 아래는 2026-10-21 합본 슬라이드의 보존 이력이며 현행 제품 설명이 아니다. 현행은 로비/생성 직후/첫 진입 분리, 원본 29언어, INTRO 화자 입력대기와 전체화면이다. 영상은 원본 추출 still이며 움직임/음성 HOLD다.

---

# DEMO11-08 세계관·전사·INTRO 수명 경계

기준은 gap `61ab71be`의 DEMO11-08/D06, 기존 P2-001i/P2-007a(D07)와 분리한다. Main에는 VideoStreamPlayer/네이티브 MP4 재생 경로가 없으므로 원본의 정지 이미지·자막 분기를 재사용했다. 새 영상·이미지 생성/변환은 없다.

`native_story_intro.gd`가 세계관 → 전사 → 네메시아 INTRO를 소유한다. 종료 또는 Space/버튼 2초 홀드(원본 game.html:62868, 세계관의 index.html:2644 5초 대신 게임 INTRO의 2초로 통일하는 표시 판단)가 동일한 단발 handoff를 거쳐 기존 `IntroCurtainSequence.install_native_boot`를 딱 한 번 호출한다. 그 이후 기상 4컷·voice_wakeup·커튼·레슨은 기존 P2 owner 책임이다. 삭제/취소는 인계하지 않고 이전 tree pause를 복원한다. 이미지 오류는 정지하고 retry/skip을 제공한다. hidden 상태는 이야기 시계·hold를 멈춘다.

원본 근거는 `index.html:2323 CIN_LINES` 19 cue/68,800ms, `game.html:62598 PROLOGUE_LINES` 34 cue/104,500ms, `game.html:62746 INTRO_CUTSCENE_LINES` 27 cue/84,000ms다. 배포된 warrior v23 영화의 22 cue/96.4초 및 world 영화의 별도 자막 timeline과 다르다. 이번 네이티브는 **정지 이미지 원본 분기**이며 영화와 시간/음성 동등성을 주장하지 않는다. 영화 mux 음성·원본 sfx/vfx/카메라 애니메이션은 미이식. 기존 SND selection/lifecycle의 정확한 intro key를 사용하며 신규 임의 음원은 없다.

이미지는 원본 상대 경로를 읽기 전용으로 로드한다. 전체 clone 기본 root=`res://../`, sparse 검증은 Main meta `native_story_source_root`/`native_audio_source_root`를 명시한다. 런타임 meta는 외부 사용자 입력 경로 UI가 아니다. 에셋 재복사/커밋0. 독립 export에는 기존 외부 이미지/BGM의 패키징 계약이 추가로 필요하다(HOLD). JSON cue/catalog와 표시만 변경하고 G.cutsceneDone/저장/전투 판정은 쓰지 않는다.

Main 자동 부팅만 이야기를 시작한다. 기존 custom SceneTree 하니스는 이전 부팅을 그대로 유지하며 테스트용 `native_story_boot=true`로만 명시 진입한다. 언어는 현 OPT.lang의 KO/EN, 그 외 영어 폴백이다. 번역 목록에 신규 표시 문자열을 추가했다. 본문 hell/제목 cinzel_hell 폰트, 흑철·뼈색 #dfd6c2·금빛 선·붉은 hover를 적용했다.

재생 동안 tree를 pause하되 DEMO11-41의 intro BGM은 pause하지 않는다(창 hidden은 기존대로 suspend). 종료에서 guide stop → 기존 기상 음성 → opening field BGM 순서를 그대로 유지한다. 목록 생성 reflection API는 새 owner 및 변경 tick 경로에 없다. 보고서와 캡처는 `orders/reports/demo11-08_REPORT.md`, `_out/demo11-08/captures/`를 참조한다.


2026-10-21 DEMO11-07 후속: 로비의 생성 성공/active readback 뒤 이 owner를 호출하고 S10의 실제 선택 언어를 전달한다. 완료/skip 때 기존 State `_cutsceneDone`을 기록하는 좁은 접점은 Main/State에 추가했으며 이 문서의 기존 “쓰기0” 설명은 DEMO11-08 단독 범위다. 이미 본 metadata의 영화는 생략하고 기존 기상 owner에 인계한다. Player 저장 복원은 별도 DEMO11-06 책임이다. [DEMO11-07 계약](DEMO11_LOBBY_ENTRY_20261021.md).
