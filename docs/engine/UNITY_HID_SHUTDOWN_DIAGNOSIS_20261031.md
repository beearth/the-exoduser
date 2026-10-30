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
| 21:27:12 | f9a11c6b 정상 빌드, errors0, 3,123,141,681바이트. 공통e86baafd 문서 병합 전후 Unity/Core/GameAssets 트리 동일 | 컴파일 통과. 이전 실행의 정상종료 증거를 재사용하지 않음 |
| 21:27:49–21:27:53 | 같은 빌드 M1 23단계ok·OnDestroy 완료 후 생존 자기PID28804/부모41952/생성21:27:14.470726UTC 확인. 메인57716→HIDInput4952·pendingIO 확인 뒤 취소1회도false1168 | 살아 있는 상태에서도 취소 실패. 자동 취소 코드를 제품에 추가하지 않음 |
| 21:28:33 | 소유 생존 Player만 MiniDumpWriteDump(0x1000)로 최소 덤프933,327바이트 보존, 정식 Unity PDB와 Microsoft 기호로 오프라인 분석 | HIDInputThreadState::OpenDevice→HidD_GetProductString→DeviceIoControl→NtDeviceIoControlFile 대기 확인. 메인은 InputShutdown→Thread::WaitForExit |
| 21:29:10 | 공식 M1 aed8cf8e:ok=false,exitCode=-1,timedOut=true,dur115662ms,USER_SAVE0. 외부 래퍼도exit1 | 게임23단계 통과와 별개로 전체 M1 불합격. 보조 취소가 개입한 진단이며 정상 무보조 증거로 사용하지 않음 |

독립 보스 후보와 A2 후보도 InputShutdown 뒤 같은 종료 지연을 보고했다. 이 사실만으로 모든 실행의 원인이 같거나 특정 스킬·GPU·특정 입력 장치가 원인이라고 단정하지 않는다. 읽기 전용 PnP 목록에는 VID_1B1C/PID_1B3F 등 여러 HID가 있으며 일련번호와 장치 전체 경로는 기록하지 않는다.

공식 [GetThreadDescription](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreaddescription)과 [GetThreadIOPendingFlag](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getthreadiopendingflag)로 자기 소유 스레드만 조회했다. [CancelSynchronousIo](https://learn.microsoft.com/en-us/windows/win32/fileio/cancelsynchronousio-func)는 특정 스레드의 동기 I/O 취소 요청이며 강제 프로세스 종료가 아니다. 요청 성공도 완료를 보장하지 않고, 드라이버 취소 지원도 보장하지 않는다. 이번 요청은1168로 실패했다.

Unity 공식 포럼의 [다른 사례 분석](https://discussions.unity.com/t/game-build-always-freezes-when-closing-the-applicaiton/1590057/15)은 제조사 문자열 조회를 설명한다. **우리 덤프의 실제 함수는 제품명 조회 `HidD_GetProductString`**으로 구분한다. 설치 패키지·실제 UnityPlayer 문자열·공식 API를 검토했지만 QA에만 HID를 제외한다고 보장하는 지원 경로는 찾지 못했다. `windowsGamepadBackendHint`는 XInput/GameInput 선택이며 HID 제외 보장이 없어 적용하지 않았다.

최소 덤프는 전체 메모리를 포함하지 않으며 OpenDevice 로컬 변수는 비공개 기호가 없어 열람하지 못했다. 덤프의 VID/PID 표본도0이다. 따라서 **대기 함수와 종료 경로는 확인, 해당 장치·펌웨어·드라이버 원인은 미확정**이다. 연결 목록의 Corsair 장치를 원인으로 확정하지 않는다. 장치 비활성화·핸들 강제 닫기·사용자 소프트웨어 종료·엔진 DLL 변경·권한 확장은 하지 않았다.

## 외부 래퍼 오판과 증거 보존

공식 실행기는 `ok=false`를 정상 기록했지만 I:의 진단 PowerShell 래퍼가 자식 스크립트 exit1을 바깥 프로세스에 전달하지 않아 외부 실행0으로 보였다. `management-instrumented/순차게이트-외부래퍼오판-보존.json`과 원래 로그를 남기고, `종료-최종판정.json`에 실제 불합격을 확정했다. I: 래퍼는 이제 `$LASTEXITCODE`를 명시적으로 전달한다. 공식 실패 JSON을 우선하며 외부의 “정상 반환” 메시지는 검증 증거로 쓰지 않는다.

`diagnostic-wrapper-exit/영수증.json`은 합성 자식 종료값0/1/7을 실제 프로세스로 검사했다. 수정 전1/7 두 사례의 잘못된0을 확인했고, 수정 후 세 값 모두 그대로 전달됐다. 최신 aed8cf8e 실제 실패도 외부exit1로 전달됐다. 합성 검사는 Player 정상종료 증거가 아니다.

과거02d 고정 EXE의 batch 실행은20:43:22 PowerShell4100 Start-Process 접근거부로 시작되지 않았다. 별도의 실패이며 해당 동작을 다른 API·경로·권한으로 재시도하지 않는다. 새51a/edf 코드 빌드와 표준 hidden M1 계측은 다른 입력의 정상 진단이며 접근거부 해소를 뜻하지 않는다.

근거 폴더: `I:/EXODUSER-Storage/demo-art/gameplay-parity/management-instrumented/`. 종료-경계.tsv, 생존-WCT.json, 생존-스레드이름.json, HID-대기-장치목록.json, 동일M1-공식실패.json, 종료-최종판정.json을 함께 읽는다. 현재 전수 게임동작·영상·공통/바탕화면은 미완료다.

최신 추가 근거는 `chain-hid-live/`의 동일M1-공식.json·최종판정.json·소유-최소덤프-영수증.json·최소덤프-네이티브스택.log·최소덤프-장치프레임.log·최소덤프-장치ID-표본.json이다. 전체 검수 경계는21:29:10UTC에 반환했고 추가 Player·GPU·인코딩 예약은0으로 인계했다. 정식 빌드가 만든519개 자동 임포트 변경은 원본 바이트를 I:에 보존·대조한 뒤 허용 경로만 HEAD로 복구했다.

이어 실행한 실제 웹 관리 캡처에서도 종료된 자기 Chrome38172의1스레드가 남았으나 네이티브 스택을 얻지 않아 같은 HID 원인으로 단정하지 않는다. 해당240초 정리 오류가 공식 실패 영수증 작성을 끊는 별도 결함은 [정리 오류 경계](UNITY_GUARDED_CLEANUP_FAILURE_20261031.md)에 기록했다. 이 도구 수정으로 HID 대기가 해결됐다고 보고하지 않는다.
