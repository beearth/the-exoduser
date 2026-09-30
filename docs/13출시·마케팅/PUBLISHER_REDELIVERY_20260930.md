# 2026-09-30 퍼블리셔 최신 데모 재전달

## 배포 전 발견한 데모 진입 오류

| 항목 | 확인 내용 |
|---|---|
| 재현 기준 | a8d2755074a0954d439319a62c3ca239bb69786c 소스의 Windows 검토용 패키지, 내장 서버 3337, index.html?demo=1 |
| 실제 재현 | 데모 입장 → 새 전사 생성 → 스토리 종료 후 `알 수 없는 오류`. 서버에 새 슬롯이 저장되고 브라우저 `hellsave_demo_0`~`hellsave_demo_4`는 비어 있어 입장 실패 |
| 원인 | `_enterOffline`이 생성 버튼을 override하면서 데모에서도 `/api/load`와 `/api/save`를 호출. `showCharGate`는 `_demoActivateSlot`을 통해 브라우저 슬롯만 확인 |
| 수정 | `_enterOffline` 생성 콜백의 API 분기 시작 전에 `_LOBBY_BUILD==='demo'`이면 기존 localStorage 폴백으로 이동. `doCreateChar`와 동일한 저장 정책 |
| 유지 | full 오프라인 API 저장, 최대 5슬롯, 이름 2~8자, 중복 이름 보호, 스토리 후 입장, 기존 사용자 저장 유지 |
| 회귀 | 신규 `test/demoOfflineCreation.test.js`: 수정 전 2실패/1통과 → 수정 후 3통과. 생성·스토리·화면 이탈 관련 4개 파일 합계 79통과 |
| 기존 실패 | `developerCharacterSlots.test.js`와 `demoSaveRoute.test.js`의 9실패는 수정 전 백업에서도 동일 재현. 오래된 단일 데모 슬롯 가정 및 `_demoSyncActiveSave`/`_demoActivateSlot` 미주입으로 인한 테스트 fixture 문제. 이 최소 수정에서 변경하지 않음 |
| 실행 검수 | 수정 전 입장 실패 확인. 수정 후 `b2aee74bf6cbac94f78cb3351afed7d24196442c` 패키지의 내장 서버를 IAB 1280×720에서 실행하여 새 전사 생성 → 스토리 → CH1-1 진입 → 설정 패널 열기/닫기 → 튜토리얼 건너뛰기 확인. 네이티브 NW.js 실행 검수와 FPS 측정은 미실시 |

## 전달 상태

| 항목 | 상태 |
|---|---|
| 원본 Drive 파일 | `1izf6QYvSqiFx_lrBFIFZZ4jwUQZYtmO5` 복원 완료. 기존 URL과 세 수신자의 reader 권한 유지 |
| 최초 최신 ZIP | 6,920,795,209 bytes, SHA256 `35393f655a59f9e82a1e0064526675243cd9df9aaff559c98a7108e0bb2ea15d`. 진입 오류 때문에 발송 대상에서 제외 |
| 진입 수정 커밋 | `f9b4cdfa0` — `fix(demo): keep offline character creation in browser slots` |
| 검수 패키지 커밋 | `b2aee74bf6cbac94f78cb3351afed7d24196442c`. 이후 작업 중인 변경은 포함하지 않은 확정 스냅샷이며, 다음 날의 최신 배포본으로 자동 간주하지 않음 |
| GitHub 푸시 | `b2aee74bf6cbac94f78cb3351afed7d24196442c:refs/heads/main` 푸시 성공. 초기 a8d2755 푸시는 대용량 blob으로 거부됐으나 이후 병행 작업의 이력 정리 후 해소됨. 이 재전달 작업에서는 이력 재작성·강제 푸시하지 않음 |
| 검수 ZIP | `output/applications/publisher-redelivery-20260930-entryfixed2/02_EXODUSER_DEMO_WIN64_20260930.zip`, 6,890,789,362 bytes, SHA256 `3f5805a8d4f0f8833148fa31f4a86b971bdba4dfd1186b2d792829e84382b041` |
| 무결성 검수 | 6,618파일, 압축 전 7,373,836,163 bytes. 전체 파일 SHA256·ZIP CRC 검증, 내장 서버 정적 파일·범위 요청·격리 저장/불러오기 검증 통과 |
| Drive 최신 상태 | 기존 파일 6,840,136,829 bytes, 수정 시각 `2026-09-29T04:16:18.054Z` 유지 확인. 수정본 업로드 완료로 간주하지 않음 |
| 이메일 | 컴투스에 오류·재전달 예정 사과 안내만 발송. 수정 빌드의 3명 재전달 메일은 아직 미발송 |
| 사용자 발송 보류 | 2026-09-30 사용자가 “내일 아침에 보내야하니까 그때까지 빌드 수정해서 보내자”로 지시. 2026-10-01 아침 최종 수정본을 재검수한 뒤 발송하는 것으로 보류 |
| 자동 실행 예약 | 2026-10-01 09:00 KST 스레드 자동 실행 등록 시도는 도구의 `approval policy is never`로 거부되어 등록되지 않음. 자동 발송·자동 재개를 보장하지 않음 |
| 남은 순서 | 재개 시 최신 커밋·작업 상태 확인 → 최종 패키지 생성·실행 검수 → 해당 커밋 푸시 확인 → 기존 Drive ID의 새 버전 업로드 → 크기·해시·권한·안내문 검증 → 세 수신자별 기존 스레드 발송 및 SENT 확인 |
