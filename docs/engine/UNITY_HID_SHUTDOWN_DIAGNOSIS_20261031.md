# Player 종료 지연 — HID 입력 경계 조사

상태: **원인 경로를 좁혔으나 해결 미완료**. 게임 검사 단계 통과와 정상 프로세스 종료를 구분한다. 사용자 장치·드라이버·전역 입력 설정·권한은 변경하지 않는다.

| 확인 시각 UTC | 실제 근거 | 판정 |
|---|---|---|
| 20:57:02–20:58:17 | 새 소스 edf12c419, 정식 빌드 d0ade204, Unity6000.6.7f1 Win64, build.json 오류0 | 컴파일 통과 |
| 20:58:34–20:58:54 | 같은 빌드 M1 549945c8의23단계 전부ok, 실제 D3D11 RX9070XT·GUI1178 | 게임 검사 단계 통과 |
| 20:58:54 | 명시적 격리 종료 계측: wantsToQuit→OnApplicationQuit 완료→quitting→기검/석궁/피격/스킬/효과음/HUD 정리→OnDestroy 완료 | 해당 관리 코드 정리는 끝남. 네이티브 종료 완료는 아님 |
| 20:59:46 | 살아 있는 자기PID13208,111스레드. WCT: 메인23564→ThreadWait→48560, 순환false | 주 스레드가 다른 스레드 종료를 기다림. 순환false만으로 교착 부재를 증명하지 않음 |
| 21:00:02 | 제한 조회 GetThreadDescription:23564=`Unity Main Thread`,48560=`HIDInput` | 기다리는 대상은 HID 입력 스레드 |
| 21:00:43 | 공식 done/549945c8.json:ok=false,exitCode=-1,timedOut=true,dur135706ms,USER_SAVE0 | **M1 실행 전체 불합격**. 추가 Player 중단·예약/잠금 반환 |
| 21:01:39 | 종료신호 뒤 잔존 자기13208의 유일48560은 `HIDInput`, GetThreadIOPendingFlag=True | I/O대기 잔존. 장치·네이티브 함수·드라이버 원인은 아직 미식별 |
| 소유 취소1회 | 생성20:58:27.563733UTC·EXE/부모27260/로그/종료신호/창0/유일스레드/스레드 소유·이름·I/O를 검증하고 CancelSynchronousIo 요청1회. false/1168(ERROR_NOT_FOUND) | 취소 대상 요청을 찾지 못함, 정리 성공 아님. 반복·권한확장·대체API 우회0 |

독립 보스 후보와 A2 후보도 InputShutdown 뒤 같은 종료 지연을 보고했다. 이 사실만으로 모든 실행의 원인이 같거나 특정 스킬·GPU·특정 입력 장치가 원인이라고 단정하지 않는다. 읽기 전용 PnP 목록에는 VID_1B1C/PID_1B3F 등 여러 HID가 있으며 일련번호와 장치 전체 경로는 기록하지 않는다.

공식 [GetThreadDescription](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreaddescription)과 [GetThreadIOPendingFlag](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreadiopendingflag)로 자기 소유 스레드만 조회했다. [CancelSynchronousIo](https://learn.microsoft.com/en-us/windows/win32/fileio/cancelsynchronousio-func)는 특정 스레드의 동기 I/O 취소 요청이며 강제 프로세스 종료가 아니다. 요청 성공도 완료를 보장하지 않고, 드라이버 취소 지원도 보장하지 않는다. 이번 요청은1168로 실패했다.

Unity 공식 포럼의 [다른 사례 분석](https://discussions.unity.com/t/game-build-always-freezes-when-closing-the-applicaiton/1590057/15)은 HID 드라이버 문자열 조회에서 멈춘 덤프를 설명한다. 우리 스레드의 정확한 네이티브 호출을 확인하지 못했으므로 같은 함수 문제라는 결론은 **추정도 확정하지 않는다**. 설치 패키지·실제 UnityPlayer 문자열·공식 API를 검토했지만 QA에만 HID를 제외한다고 보장하는 지원 경로는 찾지 못했다. `windowsGamepadBackendHint`는 XInput/GameInput 선택이며 HID 제외 보장이 없어 적용하지 않았다.

## 외부 래퍼 오판과 증거 보존

공식 실행기는 `ok=false`를 정상 기록했지만 I:의 진단 PowerShell 래퍼가 자식 스크립트 exit1을 바깥 프로세스에 전달하지 않아 외부 실행0으로 보였다. `management-instrumented/순차게이트-외부래퍼오판-보존.json`과 원래 로그를 남기고, `종료-최종판정.json`에 실제 불합격을 확정했다. I: 래퍼는 이제 `$LASTEXITCODE`를 명시적으로 전달한다. 공식 실패 JSON을 우선하며 외부의 “정상 반환” 메시지는 검증 증거로 쓰지 않는다.

과거02d 고정 EXE의 batch 실행은20:43:22 PowerShell4100 Start-Process 접근거부로 시작되지 않았다. 별도의 실패이며 해당 동작을 다른 API·경로·권한으로 재시도하지 않는다. 새51a/edf 코드 빌드와 표준 hidden M1 계측은 다른 입력의 정상 진단이며 접근거부 해소를 뜻하지 않는다.

근거 폴더: `I:/EXODUSER-Storage/demo-art/gameplay-parity/management-instrumented/`. 종료-경계.tsv, 생존-WCT.json, 생존-스레드이름.json, HID-대기-장치목록.json, 동일M1-공식실패.json, 종료-최종판정.json을 함께 읽는다. 현재 전수 게임동작·영상·공통/바탕화면은 미완료다.
