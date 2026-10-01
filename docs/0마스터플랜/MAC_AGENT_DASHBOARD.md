# Mac 에이전트 작업 상태판

조회 시각: **2026-10-01T16:20:44+09:00 (KST)**. 이 문서는 조회 시점 스냅샷이며 실시간 자동 갱신 화면이 아닙니다.

조회 당시 코드 HEAD: `dd3bdc1888e506ec4c418d3679461f0491823728`

조회 당시 원격: `dd3bdc1888e506ec4c418d3679461f0491823728	refs/heads/codex/mac-environment-20261001`

현재 실제 작업: **Codex 총괄이 사운드 페이지 UI 검수·검수 문서 동기화·GitHub 체크포인트 진행**.

실행 중 1명(Codex 총괄), 산출 완료 14명(Claude 11 + Codex 지원 3). Claude 11팀은 모두 `idle/done`이며 마지막 응답 `end_turn`; 아래 후속 의존성 때문에 현재 추가 추론/도구를 실행 중이라고 세지 않습니다. 프로세스 존재와 실제 작업 실행은 다릅니다.

## Claude 11팀 — 검토·후보 작성

| 실제 에이전트·모델 | 팀/담당 | 현재 작업 | 상태·최근 활동 | 결과/다음 |
|---|---|---|---|---|
| EXODUSER-Mac-SKILL<br>claude-opus-4-8<br>ID `b9eeea10` · PID 32523 (ps 확인) | SKILL / iceStorm 취소 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:53.961Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/SKILL.md)<br>중복 설치·판정 조건 수정 선행 |
| EXODUSER-Mac-UIUX<br>claude-opus-4-8<br>ID `4b78d932` · PID 32536 (ps 확인) | UIUX / 포커스·키 설정 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:10:34.448Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/UIUX.md)<br>일반 길이 입력 결함 미입증 |
| EXODUSER-Mac-ANIMVFX<br>claude-opus-4-8<br>ID `720a6335` · PID 32596 (ps 확인) | ANIMVFX / GL 초기화·부활 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:10:36.124Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/ANIMVFX.md)<br>정규 GL 5건 인수, 고주사율 대기 |
| EXODUSER-Mac-MAP<br>claude-opus-4-8<br>ID `44508f89` · PID 32653 (ps 확인) | MAP / M5 경로 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:10:46.898Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/MAP.md)<br>상태 변경·정리 누락 수정 선행 |
| EXODUSER-Mac-ART<br>claude-opus-4-8<br>ID `92f20335` · PID 33470 (ps 확인) | ART / wa24 타임라인 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:17.148Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/ART.md)<br>타이머 정리·표본 판정 수정 선행 |
| EXODUSER-Mac-BUILD<br>claude-opus-4-8<br>ID `70f84406` · PID 33534 (ps 확인) | BUILD / 에셋 매니페스트·LFS 분류 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:12:26.213Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/BUILD.md)<br>제작 원본 포인터3건, 패키지 검수 대기 |
| EXODUSER-Mac-ITEM<br>claude-opus-4-8<br>ID `a1c26e3a` · PID 33596 (ps 확인) | ITEM / 획득 조건 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:47.107Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/ITEM.md)<br>R 입력 조사 인수 완료 |
| EXODUSER-Mac-SOUND<br>claude-opus-4-8<br>ID `aa3ac0ed` · PID 34122 (ps 확인) | SOUND / 루프 A/B 초안 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:35.303Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/SOUND.md)<br>실제 HTML 구현 완료, UI 검수 진행 |
| EXODUSER-Mac-QA<br>claude-opus-4-8<br>ID `f63e19c0` · PID 34195 (ps 확인) | QA / 입력 타임라인·GL 판정 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:10:15.117Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/QA.md)<br>고주사율 검수 대기 |
| EXODUSER-Mac-ENEMY<br>claude-opus-4-8<br>ID `02420005` · PID 34266 (ps 확인) | ENEMY / type3 자연 발사 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:11:05.413Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/ENEMY.md)<br>전역 접근·발사 시점 수정 선행 |
| EXODUSER-Mac-BALANCE<br>claude-opus-4-8<br>ID `1fd751d8` · PID 34340 (ps 확인) | BALANCE / onHitFireball 훅 진단 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:40.897Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/BALANCE.md)<br>실제 효과 훅 부재, 구현 별도 |

## Codex — 실제 구현·검수

모델 세부 식별자는 현재 에이전트 목록에서 제공되지 않아 **미확인**입니다. 개별 PID도 제공되지 않으므로 Claude PID와 혼동하지 않습니다.

| 실제 에이전트·모델 | 팀/담당 | 현재 작업 | 상태·최근 활동 | 결과/다음 |
|---|---|---|---|---|
| /root<br>Codex / 모델 미확인 | 단일 게임 검수·생산 파일·Git 소유 | 단일 게임 검수·생산 파일·Git 소유 | 실행 중 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/검수.md)<br>SOUND UI·문서·백업 |
| /root/build_backlog_review<br>Codex / 모델 미확인 | BUILD 도구 실행·후보5개 정적 검토 | BUILD 도구 실행·후보5개 정적 검토 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/candidates/검증결과.md)<br>후보 실행 전 결함 수정 필요 |
| /root/map_art_review<br>Codex / 모델 미확인 | BALANCE 하니스·SOUND HTML 구현 | BALANCE 하니스·SOUND HTML 구현 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/sound/페이지-인수.md)<br>총괄 UI 인수 |
| /root/qa_review<br>Codex / 모델 미확인 | R 진단·GL 원자료 독립 판정 | R 진단·GL 원자료 독립 판정 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/검수.md)<br>고주사율 조건 별도 |

[실제 목록·PID·모델 근거](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/dashboard-inventory.json) · [R/GL 종합 검수](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)

CLI 조회: `claude agents --json --all --cwd /Users/fordeargamers/Projects/exoduser-migration-20261001`. 기존 세션 열기는 `claude attach <위 표의 짧은 ID>`이며 새 팀을 생성하지 않습니다. 별도 대화형 Claude 1개는 idle이고 11팀 집계에서 제외했습니다.

## VS Code UI 후속 확인

별도 EXODUSER-11팀 (Workspace) 창에 EXODUSER Mac 탐색기와 상태판 미리보기를 실제 열었다. 기존 창과 초안 보존. 기존11팀 attach 작업은 준비했으나 VS Code의 Trust Workspace & Continue 승인 대기다. 현재 VS Code 연결0/11, 백그라운드 세션11/11 idle/done. 총괄은 독립적인 문서·백업을 진행한다. 승인 후 작업명은 EXODUSER · 기존 11팀 연결이며 새 에이전트/게임/빌드는 생성하지 않는다.
