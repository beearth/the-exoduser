# 퍼블리셔 공유 저장 공간 복구 — 2026-09-29

사용자는 최신 로컬 빌드 전달을 지시했고, 검증된 로컬 백업을 보존한 기존 공유 ZIP 한 개의 영구 삭제 제안에 `스토리지 정리좀해`라고 승인했다. 이번 정리는 해당 ZIP 한 개만 대상으로 했다.

| 항목 | 실제 확인 결과 |
|---|---|
| 삭제한 Drive ZIP | `02_EXODUSER_DEMO_WIN64_20260929.zip` |
| 삭제 파일 ID | `18n85EKH1guc2jJ_b9Z08luQ_Ez25Mfqd` |
| 확보한 용량 | 6,737,897,304바이트 |
| 삭제 확인 | 삭제 도구 success:true, 재조회 NOT_FOUND(404) |
| 보존한 로컬 백업 | `G:/exoduser/output/applications/publisher-20260929/02_EXODUSER_DEMO_WIN64_20260929.zip` |
| 백업 SHA256 | `29637c9889cd7d3e1b805bbfe360918b58abcd7e8a2bdcd0e717bdc4d6c54555` |
| 백업 검증 | 삭제 전 전체 파일 재해시와 6,737,897,304바이트 크기 일치 확인 |
| 정리 후 Drive 사용량 | 웹 화면에서 15GB 중 6.18GB 사용 확인 |
| 공유 폴더 | `1l2FNevWyd-jc116P_hUB38KbWAme2tAI`, 기존 링크 유지 |
| 폴더 복구 | 휴지통에 있던 기존 폴더를 복원. 기획서 PDF, 실행 안내, SHA256 안내의 기존 파일이 다시 보임 |
| 최신 ZIP | `latest-20260929-1005/02_EXODUSER_DEMO_WIN64_20260929_1005.zip` |
| 최신 ZIP 크기 | 6,840,136,829바이트, 6,600개 파일 |
| 최신 SHA256 | `2b3ee9a5cad3d07194dd3846a4057deb149e515e9cd34dfd9f268b92824737e4` |
| EXE 시작 | window.fullscreen:true. 실제 NW.js 0.111.2 실행의 fullscreen:true 기록 확인 |
| 현재 업로드 | 2026-09-29 10:34:39 KST, 웹에서 업로드 완료. Drive 크기 6,840,136,829바이트 일치 확인 |
| 최신 Drive 파일 ID | `1izf6QYvSqiFx_lrBFIFZZ4jwUQZYtmO5` |
| 수신자 권한 | 최신 ZIP과 폴더에 `doosshim@smilegate.com`, `lyra.01@kakaocorp.com`의 reader 확인 |
| 업로드 후 Drive 사용량 | 웹 화면에서 15GB 중 12.55GB 사용 확인 |
| 공유 SHA256 안내 | 기존 ID `1uYr_Pw6diz-2TwusVGx1NcfNrevI2yJ6` 유지, 108바이트로 갱신. 최신 SHA256과 파일명 재조회 일치 |
| 공유 실행 안내 | 기존 ID `1yPW9g0-QUFfAY06MJnzQvHIy4-CW16gD` 유지, 2,581바이트. 최신 파일명·용량·전체화면 시작 문구 갱신, 재조회 일치 |
| 실행 안내 백업 | 출력 폴더의 `03_데모_실행안내_이전공유본.txt` |
| 스마일게이트 후속 발송 | 2026-09-29 10:36:39 KST, `doosshim@smilegate.com`, Gmail `1a0eace8ba020485`, 기존 대화 `1a0c85059c62b22f`, SENT 재조회 확인 |
| 카카오게임즈 후속 발송 | 2026-09-29 10:36:56 KST, `lyra.01@kakaocorp.com`, Gmail `1a0eacecfa1e4ea8`, 기존 대화 `1a0c850439ccf8a2`, SENT 재조회 확인 |
| 중복 확인 | 발송 직전 두 수신자 SENT·예약 조회에서 09:00 메일만 존재. 후속 각 1건 발송 |
| 메일 본문 확인 | 수신자·발신자·기존 대화·최신 ZIP 파일명·전체화면 시작·기존 폴더 링크 일치 확인 |
| 단회 예약 | 원래 예약 작업에서 `automation` 삭제 완료. 완료된 삭제 도구 호출과 TOML 파일 부재 확인 |
| 배포 기록 | `output/applications/publisher-20260929/latest-20260929-1005/storage-recovery.json` |

최신 ZIP의 전체 CRC와 6,600개 파일의 SHA256 검증 결과는 같은 출력 폴더의 `archive-verification.json`, `validation.json`에 있다. 원격 ZIP은 업로드 완료 표시·정확한 바이트 수·폴더 포함·수신자 권한으로 확인했으며, 원격 전체 ZIP을 다시 다운로드해 재해시하지 않았다. 이 기록은 프레임 드랍 해결이나 전체 플레이 품질의 보증이 아니다.

최신 공유본: [퍼블리셔 자료 폴더](https://drive.google.com/drive/folders/1l2FNevWyd-jc116P_hUB38KbWAme2tAI). 이전 대기 상태는 이번 사용자 승인·정리·업로드·후속 발송 완료로 해소됐다.

이전 예약·업로드 실패 이력은 [최신 빌드 전달 기록](PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md)에 보존한다.
