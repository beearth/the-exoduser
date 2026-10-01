# Mac 에이전트 작업 상태판

조회 시각: **2026-10-01T17:19:00+09:00 (KST)**. 이 문서는 조회 시점 스냅샷이며 실시간 자동 갱신 화면이 아닙니다.

조회 당시 코드 HEAD: `389f5758d2f2510a10af3e2b7cf5880095191259`

조회 당시 원격: `389f5758d2f2510a10af3e2b7cf5880095191259	refs/heads/codex/mac-environment-20261001`

현재 실제 작업: **Codex 총괄이 첫 시체 캡처 준비 변경의 검수·문서·원격 백업을 마감 중**. 이번 게임4회(수정전1/미실행hook제외1/후보관측1/최종기능회귀1). 게임·관측기 종료, viewport 복구. [결과](mac-resume-20261001/Mac-시체캡처-첫사용-준비.md).

실행 중 1명(Codex 총괄), 산출 완료 14명(Claude 11 + Codex 지원 3). Claude 11팀은 모두 `idle/done`이며 마지막 응답 `end_turn`; 아래 후속 의존성 때문에 현재 추가 추론/도구를 실행 중이라고 세지 않습니다. 프로세스 존재와 실제 작업 실행은 다릅니다. 이번 CLI 재조회는 11개 background state=done을 확인했으며 아래 PID·모델·응답 시각은 이전 조회 이력입니다.

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
| EXODUSER-Mac-SOUND<br>claude-opus-4-8<br>ID `aa3ac0ed` · PID 34122 (ps 확인) | SOUND / 루프 A/B 초안 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:35.303Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/SOUND.md)<br>기본 UI 검수 완료, 파일 권한·재생·청취 대기 |
| EXODUSER-Mac-QA<br>claude-opus-4-8<br>ID `f63e19c0` · PID 34195 (ps 확인) | QA / 입력 타임라인·GL 판정 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:10:15.117Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/QA.md)<br>고주사율 검수 대기 |
| EXODUSER-Mac-ENEMY<br>claude-opus-4-8<br>ID `02420005` · PID 34266 (ps 확인) | ENEMY / type3 자연 발사 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:11:05.413Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/ENEMY.md)<br>전역 접근·발사 시점 수정 선행 |
| EXODUSER-Mac-BALANCE<br>claude-opus-4-8<br>ID `1fd751d8` · PID 34340 (ps 확인) | BALANCE / onHitFireball 훅 진단 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:40.897Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/BALANCE.md)<br>실제 효과 훅 부재, 구현 별도 |

## Codex — 실제 구현·검수

모델 세부 식별자는 현재 에이전트 목록에서 제공되지 않아 **미확인**입니다. 개별 PID도 제공되지 않으므로 Claude PID와 혼동하지 않습니다.

| 실제 에이전트·모델 | 팀/담당 | 현재 작업 | 상태·최근 활동 | 결과/다음 |
|---|---|---|---|---|
| /root<br>Codex / 모델 미확인 | 단일 게임 검수·생산 파일·Git 소유 | 단일 게임 검수·생산 파일·Git 소유 | 실행 중 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/검수.md)<br>첫 캡처 준비 구현·검수·백업 마감 |
| /root/build_backlog_review<br>Codex / 모델 미확인 | BUILD 도구 실행·후보5개 정적 검토 | BUILD 도구 실행·후보5개 정적 검토 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/candidates/검증결과.md)<br>후보 실행 전 결함 수정 필요 |
| /root/map_art_review<br>Codex / 모델 미확인 | BALANCE 하니스·SOUND HTML 구현 | BALANCE 하니스·SOUND HTML 구현 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/sound/페이지-인수.md)<br>기본 UI 인수 완료, 재생·청취 별도 |
| /root/qa_review<br>Codex / 모델 미확인 | 첫 캡처 후보·오류격리 독립 판정 | 첫 캡처 후보·오류격리 독립 판정 | 완료 · 조회 시점 목록 확인 | [결과](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/검수.md)<br>고주사율 조건 별도 |

[실제 목록·PID·모델 근거](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/handoff-audit.json) · [R/GL 종합 검수](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md)

CLI 조회: `claude agents --json --all --cwd /Users/fordeargamers/Projects/exoduser-migration-20261001`. 기존 세션 열기는 `claude attach <위 표의 짧은 ID>`이며 새 팀을 생성하지 않습니다. 별도 대화형 Claude 1개는 idle이고 11팀 집계에서 제외했습니다.

## VS Code UI 후속 확인

마지막 UI 근거는 2026-10-01 16:29 KST의 [창·폴더·미리보기 영수증](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/vscode-ui-receipt.json)과 화면이다. 이후 창 재개설·새 attach·승인 대행은 하지 않았다. Finder의 exoduser-migration-20261001 폴더와 VS Code의 EXODUSER-11팀 (Workspace) → EXODUSER Mac 탐색기·상태판 미리보기를 확인했다.

| 구분 | 확인 수 | 의미 |
|---|---:|---|
| VS Code에 개설된 이번 팀 터미널 | 0/11 | attach 태스크 실행 전 신뢰 확인에서 중단 |
| VS Code에서 연결 완료한 기존 팀 | 0/11 | 프로세스11개와 별개 |
| VS Code 연결 승인 대기 | 11/11 | 기존 승인 질문 유지, 중복 요청 없음 |
| Claude 백그라운드 세션·PID | 11/11 | 최신 CLI idle/done·end_turn 및 ps 존재 확인; 현재 추론0 |
| Codex 지원 | 완료3 | 기존 qa_review 재사용 검토 후 완료; 총괄이 백업 마감 |

작업공간 헬퍼는 [EXODUSER-11팀.code-workspace](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/EXODUSER-11팀.code-workspace)다. 신뢰 승인 후 실행할 작업명은 EXODUSER · 기존 11팀 연결이다. 새 에이전트/게임/빌드를 만드는 작업이 아니다. 앞선 신뢰 창은 승인하지 않고 닫아 탐색기를 보이게 했으며 제한 모드를 유지한다.

## 완료된 검수의 의미와 보호 범위

| 항목 | 인수 근거와 한계 |
|---|---|
| R 수동 진단 | diagnostic.tap의16만족/10미충족·exit1 유지. 8개는 update 없는0/20/50/100ms 가정,2개는 repeat 가정. 일반 CI GREEN이나 사용자 결함 해결을 뜻하지 않음 |
| R 실제 기록 | 28시행·3317이벤트. native 도구12회 중9누락은0.6–0.9ms·update0, DOM20/50/100ms12/12획득. trusted도 사람 물리 입력이 아니며 일반 사용자 결함 미입증 |
| GL | 실제 hurtE/update/draw를 쓰되 mkEn type0·방어막0·HP/피해·플레이어무적을 통제한 fixture. 자연조우/사용자 공격 검수와 구분 |
| GL 인수 범위 | 피격6update감쇠8/8·사망소거8/8·동일객체부활 첫 draw hf0 5/5, 새 구울3건 제외. 실제draw30~31Hz로 고주사율 미충족. GL 관측 플래그는 객체별 GPU 제출/픽셀 readback 검사가 아님 |
| 소스·백업 | 위 조회 시점 HEAD와 원격이 일치. 이전23파일 체크포인트 완료. 본편/easy 생산코드 보존, 기존22경로 상태·빈 인덱스 확인. 정상 첫 처치 관측 후 종료, 빌드/PC 조작 없음 |

[체크포인트](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/checkpoint.json) · [R 진단 인수](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/진단-최종인수.md) · [GL 독립 검수](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/qa/검수.md).

## 최신 정상 첫 처치 관측

[정상 WebGL 기준점](mac-resume-20261001/Mac-정상-WebGL-첫처치-관측.md): native 이동·좌클릭 후 자연 kill0→1, 채택4.658초 rAF p95/p99 41.70/43.30ms, draw 최대76.70ms. 사망 시체11.50ms 안에 drawImage10.80ms가 포함된다. 실행2회 중 선행 자동공격 시도는 별도 제외. 막타 피해원·고주사율·PC329ms 해결은 미확인, 품질 옵션 자동변화·계측 오버헤드 한계 포함. 생산 변경0·정리 확인. 터미널 신뢰 승인 질문은 그대로 대기하며 재요청하지 않았다.
