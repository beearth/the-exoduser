# 5차 웹·Unity UX 동기화 — 진행 중

기준 Unity9694e3451c, 웹029a157b743312f112c04d94af31832785414c21。사용자 최신 지시로 origin/unity/main fetch 성공. 바탕화면 직접 교체0, 기존 guard.baseline WIP 보존. 공식 예약 unity-parity-1102-fifth, 앞 담당 순번 보존.

| 항목 | 현재 계약·검수 |
|---|---|
| 세계관 홀드 | 웹과 동일5초·Space/ESC, 패드B/Start 추가. FrontendPadPhase.WorldIntro=3, 진입/포커스/언어창 뒤 모든패드키 해제 fence. A는 다음cue |
| 캐릭터 영상 홀드 | 웹과 동일1.2초. 키보드/검수주입을 LobbyKeys 공용 경로로 읽고, 기존패드/포인터의 독립held-source 보존. 원본warrior_story.controls29언어를 읽어13px·자간.06em·우하단3%·gap22·진행2px/#ccb789, 힌트3초뒤.4초숨김 |
| 링 | 웹120×100·오른쪽/아래30px·반경34/두께3, 진행색#e4e1db·B홀드중Ⓑ |
| 호버 | 일반호버 두 경계35ms, 확인80ms·마지막항목지연/이탈취소·결정중복억제 보존 |
| UX표 | main 문서용33화면×5구분165행 초안. 최종원격반영/Player판정은 아직 없음 |
| 테스트 | 실제패드정책6PASS/4FAIL→10/0, 실제NativeUiSounds35.1ms실패→17/0. 경계double·순수C#이며 Player/청음 완료가 아님 |
| Player검수 | CinematicInputCheck는 명시적CLI+공식sandbox에서만 실행. InputSystem 가상키보드/패드→실제Update, Space/ESC/B/Start·부분홀드/해제/정상홀드·전투틱정지·PNG/영상 기록. OS입력/자연플레이와 구분. 정식빌드/M1/캡처는 대기 |

세부 영수증: I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/fifth。2~3항목마다 빌드(-remodel-scenes1)→같은패키지M1→1920/3840캡처→직접1x→정상merge/비강제push/원격ref확인. 未검수 결과를 PASS로 올리지 않는다.

전환 후속 기준 정정: 브리프 말미23:40 R4/웹740722e1a는 갱신PNG(gamma.65·얇은뼈색윤곽),12vh·기존우하단위치·후광1.4배/.25~.4/2초,감소 본체1/균열·후광.3정지다. 이전9.5vh R3는 현행값이 아니다. 후보pure flow20/0는 I:준비본이며 아직 런타임미반영.

입력 검수의 성공 영상은 frames.jsonl의 실제 캡처 시각·단계·페이지·진행률로 조립한다. 검수 장치만 매Update current로 고정하며 사용자 OS 키/포인터를 주입하거나 바꾸지 않는다.

Player 어셈블리 증거는 실제 로드 경로를 우선 사용하고, Unity 스트림 로드로 Location이 비면 같은 실행 패키지 Data/Managed의 같은 이름 DLL을 SHA-256으로 읽는다. 파일이 없으면 검수를 실패시키며 예전 산출물로 대체하지 않는다.

홀드 영상은 다음 fixture 페이지를 준비하기 전에 실제 완료 목적지를 기록한다. 세계관은 로비0.65초, 이야기는 기존1.2초 게이트가 스스로 진행하도록1.5초를 녹화하며, 검수기의 ShowLobby 호출로 성공 목적지를 대신하지 않는다.


## 2026-11-03 패키지 어셈블리 식별 보강

| 범위 | 실행 계약 | 검증 상태 |
|---|---|---|
| CinematicInputCheck·UiSoundCapture·Lobby 캡처 | Assembly.Location이 비면 실제 Player의 Application.dataPath/Managed/{assemblyName}.dll에서 SHA-256 계산. 파일이 없으면 예외로 실패하며 과거 DLL/빈 해시를 쓰지 않음 | 정적 컴파일 후 같은 정식 패키지 Player 검수 예정 |
| 정식 빌드 | 첫 묶음은 FIFO 티켓 생성 전 대기 중. 공용 실행기를 사용하며 사용자 앱·타인 예약을 종료하지 않음 | 빌드/M1/입력 영상 미완료 |
