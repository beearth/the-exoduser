# 정식 실행기 종료 정리 오류와 실패 영수증

상태: 도구 수정·합성 경계 검증 완료. 실제 브라우저 재검증과 게임 M1 정상종료는 별도 미완료다.

2026-10-30 21:37:40UTC 실행한 `web-management-current`는 실제 원문 스킬 관리 버튼11개 수치가 모두 일치했고 스크린샷8장을 보존했다. 참조 이미지1개404와 브라우저 종료 지연으로 실행 전체는 실패다. 21:41:41 정식240초 제한 뒤 `taskkill`의 자식38172 정리 오류가 `$ErrorActionPreference='Stop'`에서 `NativeCommandError`로 승격됐다. 이 예외가 핸들 반환·Close-HiddenDesktop·Finish-Guarded보다 먼저 발생해 공식 done JSON이 남지 않았다. 원래 예외와 로그를 보존하며 정상 반환으로 해석하지 않는다.

| 코드 경계 | 변경 후 계약 |
|---|---|
| 시간 제한 뒤 기존 taskkill | 같은 자기 프로세스 트리 정리 명령을1회 호출한다. 그 호출 안에서만 네이티브 stderr를 수집하고 원래 ErrorActionPreference를 finally로 복구한다 |
| 정리 종료값 | 0이 아니면 `cleanupErrors`에 종료값과 메시지를 보존한다. 권한 확대·대체 종료 API·동일 대상 추가 재시도는 하지 않는다 |
| 종료 대기·프로세스 핸들 | 예외를 `cleanupErrors`에 기록한다. 프로세스 핸들 반환 실패 뒤에도 finally에서 숨은 데스크톱 반환을 시도한다 |
| 최종 판정 | 정리 오류가 하나라도 있으면 `ok=false`. `expectedKill=true`로 승격하지 않는다. 기존 timeout/exit/창/세이브 조건을 유지한다 |
| JSON·로그 | `cleanupErrors` 배열과 `정리 오류` note를 남긴다. 정상 반환은 배열0이다. 이전 합성 검사 객체에 이 필드가 없으면 빈 배열로 처리한다 |
| 브라우저 가드 로그 | stdout/stderr의 EXO_REJECT 문구도 Read-RunLogShared로 읽는다. 공유 로그가 잠겼다는 이유로 공식 실패 판정을 누락하지 않는다 |

## 실제 RED와 후보 검증

실제 소스의 Invoke-Guarded와 Finish-Guarded를 그대로 추출하고, 실제 자식 CMD가 stderr와 종료128을 반환하게 했다. OS 프로세스·데스크톱 동작만 합성 더블이다. 실제 Unity/Player/GPU·사용자 장치는 실행하지 않았다.

| 사례 | 최종 판정 | 핸들·데스크톱 반환 |
|---|---|---|
| 수정 전 timeout+정리128 | 예외99, done 없음 | 둘 다 미호출: RED |
| 수정 후 timeout+정리128 | 실패·timeout 유지·exit−1·cleanupErrors1 | 둘 다 호출 |
| 정상 종료0 | 통과·cleanupErrors0 | 둘 다 호출 |
| timeout+정리0 | 실패·timeout 유지 | 둘 다 호출 |
| 예정 종료+정리0 | 기존 예정 종료 통과 계약 유지 | 둘 다 호출 |
| 예정 종료+정리128 | 실패·expectedKill=true라도 cleanupErrors1 | 둘 다 호출 |
| 프로세스 핸들 반환 예외 | 실패·원래 종료0이라도 cleanupErrors1 | 데스크톱 반환 호출 |

근거는 `I:/EXODUSER-Storage/demo-art/gameplay-parity/guarded-cleanup-*`의 영수증과 실행 로그다. 합성 통과는 네이티브 HID 문제 해결이나 게임용 정상종료를 증명하지 않는다.

## 당시 소유 경계 반환

21:42:41 읽기 전용 조회에서 자기 Chrome38172는 HasExited=true·창0·1스레드였고 Node60284는 이미 사라졌다. 정식 PowerShell도 종료됐지만 외부 Node44252가 상속 출력 파이프를 기다리고 있었다. 실행 경로·생성21:37:38.074784UTC·인수·현재 자식0을 확인한 뒤 21:44:07 자기 외부 래퍼44252만 종료했다. Chrome·다른 담당 프로세스·장치·권한은 변경하지 않았다. 공식 unreserve로 예약/잠금0을 확인하고 기존 A2 담당자에게 실패 경계를 전달했다. 당시 숨은 데스크톱의 정상 반환 영수증은 없으므로 반환 성공을 소급 주장하지 않는다.

앞으로 I: 외부 실행은 기존 `run-job.cjs`의 파일 stdout/stderr를 사용해 종료된 자손이 출력 파이프를 붙잡아도 결과를 회수하도록 한다. 실제 브라우저 스크립트는 컨텍스트와 연결도 명시적으로 닫고, 해당 수정은 새 실행에서 검증한다. 원본404 이미지는 origin/main blob `dcbeb13ecdd0090be94f3fa42eef88fa7921f6d2`와 byte 대조 후 I: 비교 묶음에만 보충했다.
