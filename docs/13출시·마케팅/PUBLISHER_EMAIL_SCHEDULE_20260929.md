# EXODUSER 제출 메일 예약 — 2026-09-29

사용자 지시: 오늘 오전 9시에 스마일게이트와 카카오로 제출 자료를 보내고, Steam 검토가 길어져 우선 Drive로 전달한다는 설명을 추가한다.

## 실제 예약 상태

두 기존 Gmail 답장 대화에서 네이티브 예약 발송을 설정했다. 날짜는 2026-09-29, 시간은 오전 9시, 시간대는 한국 표준시다. 각 예약 성공 안내와 대화의 `오전 9:00에 전송 예약됨`, 두 번째 예약 후 예약 메일 수 2를 확인했다. 실제 발송 완료 확인 전이며 예약 날짜 헤더를 SENT 상태로 간주하지 않는다.

| 대상 | 수신자 | 대화 ID | 예약 메일 ID |
|---|---|---|---|
| 스마일게이트 | doosshim@smilegate.com | `1a0c85059c62b22f` | `1a0ea760d7c1bb29` |
| 카카오 | lyra.01@kakaocorp.com | `1a0c850439ccf8a2` | `1a0ea760c03d7934` |

두 메일의 수신자, Drive 폴더 링크, 추가 설명과 `Tue, 29 Sep 2026 09:00:00 +0900` 헤더를 Gmail API로 확인했다. 본문 설명:

> Steam 빌드 링크로 전달드리고자 했으나 Steam 측 검토가 길어져, 우선 Google Drive를 통해 실행 빌드와 기획서를 전달드립니다.

자료 링크: https://drive.google.com/drive/folders/1l2FNevWyd-jc116P_hUB38KbWAme2tAI

## 현재 배포 기획서

일반 우클릭 홀딩 소개 페이지를 제외한 수정본에 기동게이지·패링의 빠른 액션 설명이 추가된 최신 17페이지 기획서를 같은 Drive 파일 ID에 업로드했다. 기검참, 신규 캐릭터 및 개발자 소개를 유지한다. 16페이지 사본 동기화는 이전 중간 단계의 이력이다.

| 항목 | 현재 검증값 |
|---|---|
| PDF Drive ID | `1HeY12nAQzbJ8jOQraOq09WWRgNWp7_PZ` |
| PDF | 17페이지, 7,168,010바이트 |
| PDF SHA256 | `11756858177511087ef68188cec6b12b4e7e78215d96cb9d779d37fe86267399` |
| 바탕화면 | `C:/Users/심도진/Desktop/EXODUSER_게임기획서_신캐릭터포함_20260929.pdf`, 같은 SHA256 확인 |
| 고정 배포 사본 | `G:/exoduser/tmp/publisher-20260929/final-delivery-proposal.pdf` |
| 변경 페이지 검수 | 기동게이지·패링 설명 4페이지를 PNG로 렌더링하여 한글·배치·잘림 확인 |
| ZIP Drive ID | `18n85EKH1guc2jJ_b9Z08luQ_Ez25Mfqd` |
| ZIP | 기존 검증본 6,737,897,304바이트, 이번 예약 준비에서 변경하지 않음 |
| 공유 | 두 담당자 reader 권한, 일반 공개하지 않음 |

최신 PDF 업로드 후 Drive 서버 크기와 두 담당자 reader 권한을 재확인했다. 바탕화면 PDF도 같은 고정 배포 사본으로 교체했다. 16페이지 당시 기존 파일은 `tmp/publisher-20260929/desktop-before-16page-sync.pdf`에 백업했다. 자료 폴더 URL과 두 예약 메일은 유지했다.

## 발송 전후 확인

현재 작업에는 heartbeat 하나만 연결할 수 있으므로 기존 `automation`을 두 단계로 운용한다. 첫 실행은 오늘 오전 8시 50분이며, 기획서 추가 확정 수정·배포 사본·공유 권한·예약 메일을 확인한다. 수정본이 있으면 PDF 변경 페이지를 실제 렌더링한 뒤 같은 Drive 파일 ID와 바탕화면 사본을 동기화한다. 제작 중인 파일을 검수 완료본으로 간주하지 않는다.

준비 점검 후 같은 자동화를 오늘 오전 9시 5분 단회 실행으로 갱신하여 이번 메일의 실제 SENT 상태를 확인한다. 이전 날짜의 SENT 메일을 이번 발송으로 오인하지 않는다. 새 메일 작성·재발송·예약 취소를 하지 않는다. 준비 상태가 정상이고 변경이 없으면 별도 통지하지 않으며, 자료 수정 완료·문제·실제 발송 결과만 알린다. 발송 결과 확인 후 자동화를 비활성화한다.

로컬 식별 정보: `output/applications/publisher-20260929/gmail-draft-manifest.json`. 배포 메타데이터: 같은 폴더의 `drive-upload-manifest.json`. UI/API 예약 근거: `tmp/publisher-20260929/email-schedule-verification.json`. 게임 소스와 ZIP, 타 작업의 staged 파일은 이 기록 작업에서 수정하지 않았다.
