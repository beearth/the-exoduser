# 후속 제출 root 검수 — 2026-10-01

검수 기준 HEAD `fb4c21ad83c225aeee3e0dcd581671b6a9691b2d`, game.html SHA256 `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115`. 생산 변경·게임 실행 없음. 제출자가 적은 30a204a7은 이번 root 검수 기준이 아니다. 팀이 당시 읽은 정확한 파일 바이트는 증명할 수 없다. 상태표의 파일해시는 root가 현재 읽은 바이트다.

| 팀 | root 재실행 | 인수 상태 |
|---|---|---|
| ART | 기존38검사 exit0 | base cover/시간축 후보. 최종 크롭 판정 반려 |
| SKILL | 기존66검사 exit0 | 리젠 판정·예외 정리 수정 필요 |
| MAP | 26검사 exit0 | 정적 판정기 검증. 실제 8뷰 시각 인수 미완료 |
| ANIMVFX | 내장11 fixture exit0 | 합성 경계 통과. 실제 고주사율 수명 UNKNOWN |

## ART: base cover와 최종 가시 범위

엔진은 콘텐츠 사각형 clip을 만든 뒤 중앙 translate → zoom scale → 역 translate → cover draw를 실행한다. cover의 상하 손실0은 최종 화면의 상하 손실0을 뜻하지 않는다. 실제 source 블록을 가짜 Canvas transform에 실행한 독립 재현에서 1920×1080·2560×1080·1920×1200·1024×768 모두 400/1200/2399ms에 상하가 잘렸다. 16:9 합산 세로 손실은 각각6.34755%/4.76190%/3.84615%이며 확대 후 이미지 높이에 대한 비율이다. 흔들림으로 위/아래 배분이 달라진다. fade0인 0ms는 가시성 근거로 사용하지 않았다.

ART-next-result의 ‘상하컷 구조적으로 불가’, ‘어떤 AR에서도 상단 눈·하단 발 보존’, 최종 화면 `OK_FULLFRAME` 결론은 인수하지 않는다. 기존 SSOT의 상하 손실 서술을 해당 제출대로 삭제하지 않는다. 특정 그림 요소의 가시성·자막 가독성은 픽셀 검수 전 UNKNOWN이다. 시간축 수정 후보는 별도로 유지한다.

## SKILL: 충전 증거와 예외 정리

한 update라는 합성 조건에서 rech100→99·stk0→1·조준취소를 주입하면 타이머가 만료되지 않았는데 rechargeTicks1/refund0/cancelSideEffect0로 분류한다. prev.rech>0만으로 만료 증거를 대신할 수 없다. 실제 rAF 관측 사이에는 여러 update가 있을 수 있으므로 타이머 리셋·update 수·최대스택 등 추가 증거가 없으면 UNKNOWN을 유지해야 한다.

install의 readRaw 예외가 리스너3개 등록 후 발생하여 API 반환 없이 리스너가 남는 것도 재현했다. 두 결함은 게임이 아닌 진단 후보의 결함이다.

원자료: [정적 경계 재현](ROOT_SUBMISSION_BOUNDARIES.json). 도구 `tools/team-followup-20261001/root-review/submission-boundaries.mjs`는 알려진 결함 재현용이며 exit0은 수정 완료가 아니다.

## 시각·기준 정정

실제 JSONL 기준 ART 수신11:56:40.550Z / 첫 Read11:56:49.754Z / 완료12:06:04.862Z. SKILL 수신11:58:04.859Z / 첫 Read11:58:13.031Z / 완료12:06:12.761Z. SKILL 제출의11:02~11:22Z는 이번 작업 시각으로 인정하지 않는다. MAP 완료12:08:25.715Z. ANIMVFX는 결과 파일과 검사를 확인했지만 이번 요청 이후 end_turn은 아직 확인되지 않아 완료 시각을 추정하지 않는다. 원 제출은 감사용으로 보존하고 이 기록과 TEAM_UTILIZATION으로 인수 상태를 정정한다.

## 후속 전달 상태

ART의 전체 transform/clip 크롭 계산·부정회귀·보고 정정, SKILL의 증거 부족 리젠 UNKNOWN·reader 예외 정리가 다음 항목이다. 기존 interactive 세션에 새 지시를 전달했다고 보고하지 않는다. ENEMY 후속도 수신 미확인이다. Mac 잠금 확인 이후 게임/UI를 반복 시도하지 않았다. MAP 8뷰·FIRE-02 정상처치·ITEM Chrome 비교·실제 고주사율은 실행 환경 준비 뒤 QA 단독 진행 대상이다.

## 미검수 산출물 원격 복구 지점

`codex/backup-review-wip-20261001-211521` / `62652a19db3a1ececeb721d202254abfd20c0971`에 135경로·4,863,707바이트를 캡처하고 push 후 원격 SHA를 대조했다. 기준은 fb4c21ad이다. 별도 인덱스를 사용했고 캡처 중 파일 재검사·공용 인덱스/HEAD 불변을 확인했다. 세이브·인증정보·캐시를 추가하지 않았다. 코드 후보와 기존 한글 정규화 변경도 복구 대상으로 보존했다. 일반 build 무시 규칙에 가려졌던 BUILD 소스/인수 증거 18파일을 명시적으로 포함했다.

UIUX-next-result·BALANCE-next-result·BUILD-next-result·ITEM/rgb-result의 백업 Git blob 해시도 manifest와 대조했다. 재현 도구는 이 백업의 `tools/team-followup-20261001/root-review/submission-boundaries.mjs`에 있다. 로컬 상세 manifest는 `tmp/github-backups/review-wip-20261001-211521/manifest.json`이다. 이것은 복구용 WIP이며 후보 통합·게임 빌드·시각 검수 완료를 뜻하지 않는다. 캡처 이후의 본 기록/상태표 정정은 별도 정상 체크포인트 범위다.

ANIMVFX final JSONL was subsequently verified at 2026-10-01T12:10:11.423Z; TEAM_UTILIZATION now records completion. Actual high-refresh acceptance remains UNKNOWN.
