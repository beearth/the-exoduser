홀드 스킵 수정 Mac 검수 — 병합 보류. 코드 수정·커밋·push 0. 시간 판정은 직전 검수의 3.0±0.2초 내 Lobby 페이지 도달 기준을 유지하며, 홀드 100% 도달은 별도로 기록했다. 미검증은 병합 게이트 FAIL로 처리했다.


PASS — 1. 컴파일·빌드 오류 0 — 지정 원격 fetch 후 044c82d7605f2549a8a5677e6f44c981878253cc detach, 부모 34ce305eb. 전체 checkout·기존 Library·Unity 6000.6.7f1 ARM64, -remodel-scenes 1 포함 정식 빌드 1회 Succeeded/errors=0 — 캡처 없음; target.json·build-receipt.json·build.log

FAIL — 2. 입장 인장에서 Space 연속 홀드→약 3초 내 Lobby — 미검증: 배경 CUA Space 요청 4.065초 동안 Title 유지, 충전 진행·키 수신 영수증 없음. 실제 홀드 시작~Lobby=N/A, 전환 경계 진행률 표본=0개. 이후 second25의 fixture Return으로만 second27 WorldIntro 진입. 이 관측으로 제품 홀드 결함을 확정하지 않음 — pick/04-entry-background-space.png; native-input-attempt.json·entry/entry-flow.json

FAIL — 3. 입장 인장 1초 홀드 게이지 — 요청 약 1.38초 뒤 저장된 PNG에서 빈 회색 원·SPACE / ESC·HOLD TO SKIP는 보이나 충전 호는 없음. Space 수신 미확인이라 ‘실제 1초 홀드’ 캡처 요건 미충족. 원본1920×1080, ROI(1760,940,140,120)→420×360 3배 — pick/04-entry-background-space.png·05-entry-gauge-roi-x3.png

FAIL — 4. 세계관 중간 홀드 3초 완료·Lobby 도달 — 홀드 임계값은 PASS: 2.950초/98.342%→3.043초/100%, Lobby 페이지=3.559초로 기존 상한3.2초 초과. 100%~Lobby 약0.516초. fixture 주입 시작 기준이며 첫 deviceHeld=true는 +0.008초(장치 수신 기준 각각 약3.034/3.551초). 1.492초/49.733% 게이지와 전환 후 실제 로비를 눈검수 — pick/01-world-hold-mid.png·02-world-gauge-x3.png·03-world-lobby.png; measurement.json·input/cinematic-input.json·input/frames.jsonl

FAIL — 5. 약 1초 누른 뒤 해제 — 정확한 요청 길이는 미검증. 기존 fixture는 0.35초 고정이고 길이 인자 없음. Space 실측 진행14.45%(누적 홀드 약0.4335초)에서 해제→0, WorldIntro 유지는 PASS. 이 짧은 결과를 약1초 검사로 대체하지 않음 — 캡처 없음; measurement.json·input/Player.log

FAIL — 6. 네메시스 2초 홀드의 자동 컷 경계 연속성 — 미검증: 경계 전후 실제 홀드 진행률=N/A/N/A, 해당 입력 표본=0개. 기존 CinematicInputCheck는 world/character만 고정 실행하며 Nemesis 홀드·시작 시점 인자가 없다. NextLine의 HoldProgress 초기화 삭제는 diff에서 확인했으나 실제 Player 경계 검증을 대신하지 않음 — 해당 캡처 없음; target-change.diff·fixture-capability.log


PASS — 실행·기존 fixture — --unity-cinematic-input-check의 가상 Keyboard InputSystem.QueueStateEvent→실제 NativeLobby.Update, AutomatedInput=false. 132/132 통과·904프레임·누락0 후 자연 종료. 이 fixture는 이번 6개 항목의 시간/시나리오 전체를 검사하지 않는다. 두 Player 모두 open -g, 창 모드1920×1080, -screen-fullscreen 0 -popupwindow -nosound/--unity-mute. Player batchmode·실패 재실행0 — 위 pick/; launch-receipt.json·entry/launch-receipt.json

FAIL — sandbox 바인딩 로그 — 두 실행 모두 작업 폴더 sandbox 하위 명시 경로이며 실제 생성 파일도 해당 위치에서 확인. 그러나 해당 SHA의 NativeQaSandbox는 바인딩 경로를 출력하지 않아 ‘로그에서 바인딩 확인’ 요건은 미충족 — 캡처 없음; sandbox-binding.json·두 Player.log

PASS — 증거·정리 — 판정 PNG5장 전부 직접 눈검수. Player2회·잔여 Player/Editor0, build-current·PlayerDataCache·sandbox·반복 PNG994장 삭제(du 합계 14.62GiB, 공유 블록 포함; 실제 df +8.50GiB). Unity 자동 tracked857개 복원·신규meta56개 제거, 최초 untracked2개·나머지 Library 보존. tracked 수정0 — pick/; cleanup-receipt.json·final-state.log

남은 문제: 입장 인장 Space 홀드·약1초 해제·네메시스 자동 컷 경계를 실행하는 기존 fixture 인자가 없어 이번 무수정 검수로 필수 증거를 확보하지 못했다. 배경 CUA 입력도 수신을 증명하지 못했다. 추가 정적 주의점: Title 게이지 조건은 홀드 경과가 아닌 since>=1이며 입장 대기 분기는 since 갱신 전에 return한다(NativeLobby.cs:66·128). 입장 인장 표시 직후 즉시 누르는 경우의 1초 게이지는 별도 실행 확인이 필요하다. FDG·타이틀 메뉴 자체는 판정 범위에서 제외했다.

SHA 044c82d7605f2549a8a5677e6f44c981878253cc | 소요 342초(빌드 착수~검수·정리·보고) | df 남은 용량 685Gi
MERGE-GATE: FAIL 044c82d76
