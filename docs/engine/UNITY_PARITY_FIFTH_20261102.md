# 5차 웹·Unity UX 동기화 — 진행 중

기준 Unity9694e3451c, 웹029a157b743312f112c04d94af31832785414c21。사용자 최신 지시로 origin/unity/main fetch 성공. 바탕화면 직접 교체0, 기존 guard.baseline WIP 보존. 공식 예약 unity-parity-1102-fifth, 앞 담당 순번 보존.

| 항목 | 현재 계약·검수 |
|---|---|
| 세계관 홀드 | 웹과 동일5초·Space/ESC, 패드B/Start 추가. FrontendPadPhase.WorldIntro=3, 진입/포커스/언어창 뒤 모든패드키 해제 fence. A는 다음cue |
| 캐릭터 영상 홀드 | 웹과 동일1.2초. 키보드/검수주입을 LobbyKeys 공용 경로로 읽고, 기존패드/포인터의 독립held-source 보존 |
| 링 | 웹120×100·오른쪽/아래30px·반경34/두께3, 진행색#e4e1db·B홀드중Ⓑ |
| 호버 | 일반호버 두 경계35ms, 확인80ms·마지막항목지연/이탈취소·결정중복억제 보존 |
| UX표 | main 문서용33화면×5구분165행 초안. 최종원격반영/Player판정은 아직 없음 |
| 테스트 | 실제패드정책6PASS/4FAIL→10/0, 실제NativeUiSounds35.1ms실패→17/0. 경계double·순수C#이며 Player/청음 완료가 아님 |
| Player검수 | CinematicInputCheck는 명시적CLI+공식sandbox에서만 실행. InputSystem 가상키보드/패드→실제Update, Space/ESC/B/Start·부분홀드/해제/정상홀드·전투틱정지·PNG/영상 기록. OS입력/자연플레이와 구분. 정식빌드/M1/캡처는 대기 |

세부 영수증: I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/fifth。2~3항목마다 빌드(-remodel-scenes1)→같은패키지M1→1920/3840캡처→직접1x→정상merge/비강제push/원격ref확인. 未검수 결과를 PASS로 올리지 않는다.
