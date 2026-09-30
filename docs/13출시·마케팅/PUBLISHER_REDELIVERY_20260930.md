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
| 실행 검수 | 수정 전 입장 실패 확인. 수정 후 실제 패키지 재검수 대기 |

## 전달 상태

| 항목 | 상태 |
|---|---|
| 원본 Drive 파일 | `1izf6QYvSqiFx_lrBFIFZZ4jwUQZYtmO5` 복원 완료. 기존 URL과 세 수신자의 reader 권한 유지 |
| 최초 최신 ZIP | 6,920,795,209 bytes, SHA256 `35393f655a59f9e82a1e0064526675243cd9df9aaff559c98a7108e0bb2ea15d`. 진입 오류 때문에 발송 대상에서 제외 |
| GitHub 푸시 | a8d2755 → main 거부. 미전송 커밋에 `assets/map/ch1/production_finish/outer90_sources/outer90_patch.png` 113.18MB/115.50MB blob이 있어 GitHub 100MB 한도 초과. 로컬 이력 변경 및 강제 푸시하지 않음 |
| 이메일 | 컴투스에 오류·재전달 예정 사과 안내만 발송. 수정 빌드의 3명 재전달 메일은 아직 미발송 |
| 남은 순서 | 수정 패키지 생성·실행 검수 → Git 푸시/발송 순서 확정 → 기존 Drive ID의 새 버전 업로드 → 해시·안내문 갱신 → 세 수신자별 기존 스레드 발송 및 SENT 확인 |
