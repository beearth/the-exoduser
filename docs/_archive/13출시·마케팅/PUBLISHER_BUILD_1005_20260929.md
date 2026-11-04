# EXODUSER 최신 퍼블리셔 빌드 — 2026-09-29 10시 작업 기록

## 현재 상태

새 로컬 빌드 검증 완료. Drive 웹 업로드는 저장 공간 부족으로 실패. 최신 공유본이 없으므로 이번 후속 메일은 0건이다. 오전 9시 SENT는 이번 최신 빌드 전달 완료가 아니다. 기존 PDF와 공유 SHA256 안내를 교체하지 않았다.

| 구분 | 확인된 결과 |
|---|---|
| 소스 스냅샷 | 2026-09-29T01:04:54.264Z 시작 / 2026-09-29T01:05:37.108Z 완료. 당시 현재 작업 트리 및 미커밋 변경 포함 |
| 기준 HEAD | 6bf60d40739150a1c05baf4ad9735c761b5dd23d |
| 독립 출력 | G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005 |
| ZIP | G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005/02_EXODUSER_DEMO_WIN64_20260929_1005.zip |
| 파일 / 크기 | 6600개 / 6840136829바이트 |
| SHA256 | 2b3ee9a5cad3d07194dd3846a4057deb149e515e9cd34dfd9f268b92824737e4 |
| 원본 / 사본 무결성 | 각 파일 SHA256 일치. 복사 중 소스 변경 없음, 10:09 재조회 일치. ZIP 전체 CRC PASS |
| 회귀 검사 | 로딩·맵 시작 준비·렌더 설정 복원·전투 GPU 워밍업·높이 변경 후 효과층 등 13파일 100 PASS / 0 FAIL |
| inline 구문 | 메인 / 이지 각각 6개 Acorn PASS |
| 내장 서버 | 3337 / HTML·Three 로컬 의존성 HTTP200 및 SHA 일치 / 지도·영상 Range206 / 격리 save-load·mats 왕복 PASS |
| 실행 설정 | package.nw/package.json: fullscreen:true, demo=1, 1600×900 창 모드 기준, 퍼블리셔 프로필·세이브 분리 |
| 실제 NW.js | 0.111.2 normal / isFullscreen:true / 5120×1440 / 데모 Lv.1, DB 준비, G.on:true, paused:false, 적 5개 / 기록된 오류 0 |
| 실제 검수 범위 | 배포와 같은 실행 엔진 및 소스를 격리 QA 사본으로 실행. 시작 전체화면·인트로 스킵·전투 진입 화면 확인. 전체 스킬·FPS·장시간 전투 품질 검수 완료로 간주하지 않음 |
| 게임 코드 / Git | 게임 소스 수정 0. 다른 작업 스테이징 비교 동일. 원본·기존 배포본·공유 dist/out 보존 |

## Drive 실패와 필요한 사용자 결정

지정된 공유 폴더에서 공식 파일 선택기 경로로 최신 ZIP을 한 번 업로드했다. Drive가 “스토리지가 가득 찼습니다”, “파일을 업로드하려면 스토리지가 더 필요합니다”를 표시했고 업로드 창은 실패 1건이다. 화면의 사용량은 15GB 중 12.46GB여서 6.84GB 새 ZIP을 담을 수 없다. 이번 오류 원인은 확인됐으나 이전 두 번의 오류 원인을 소급해 확정하지 않는다.

기존 ZIP 18n85EKH1guc2jJ_b9Z08luQ_Ez25Mfqd는 최초 조회 시점부터 휴지통에 있었다. 이번 작업에서 휴지통 이동·영구 삭제·복원하지 않았다. 메타데이터는 이전 크기 6,737,897,304바이트, 수정 시각 2026-09-28T20:44:57.880Z, reader 두 담당자 그대로다. revisions 조회는 이전 keepForever:true 1개만 반환했다.

동일한 이전 ZIP 로컬 사본 G:/exoduser/output/applications/publisher-20260929/02_EXODUSER_DEMO_WIN64_20260929.zip을 재해시했고 SHA256 29637c9889cd7d3e1b805bbfe360918b58abcd7e8a2bdcd0e717bdc4d6c54555로 이전 공유본 기록과 일치한다. 휴지통의 이 기존 ZIP만 영구 삭제해 공간을 확보할지, 사용자가 직접 여유 공간을 마련할지 승인 질문을 남겼다. 답변 전 삭제·유료 구매·공개 권한 변경은 실행하지 않는다.

폴더와 PDF의 두 담당자 reader 권한을 재조회했다. PDF는 7,168,010바이트 공유본 유지. 신규 ZIP 업로드 성공 및 크기·버전·reader 검증 후에만 공유 SHA256 안내 갱신과 두 대화의 후속 메일 발송을 진행한다.

## 메일 및 예약

Gmail의 오늘 수신자 SENT/예약 검색에서 기존 오전 9시 두 SENT 메일만 확인했다. 이번 빌드 갱신 메일 작성·발송·예약 없음. 승인 후 재개 시 발송 직전 동일 빌드 중복 여부를 다시 확인한다.

이번 한 번의 자동 예약은 실패 결과와 사용자 결정 대기를 알린 뒤 삭제한다. 같은 공간 부족 상태를 주기적으로 반복 통지하지 않는다.

## 증거

- G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005/delivery-result.json
- G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005/build-manifest.json, archive-verification.json, validation.json, completion-checks.json
- G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005/qa-lobby-startup.json, qa-native-gameplay.json, nw-lobby.png, nw-gameplay.png
- G:/exoduser/output/applications/publisher-20260929/latest-20260929-1005/drive-storage-blocked.jpg

단회 자동화 automation 삭제 완료. 삭제 도구가 deleteStatus:deleted를 반환했다. 이후 같은 실패 상태의 자동 반복 통지는 없다.
