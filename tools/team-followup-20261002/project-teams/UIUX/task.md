# UIUX — cross-panel-focus-source

기존 백로그 1건의 실제 작업 배정이다. 먼저 `tools/team-followup-20261002/owner-dispatch/UIUX-task.md`의 시스템 계약과 근거를 읽되 소유 경로와 현재 전달 규칙은 이 최신 지시를 따른다.

## 이번 한 건

현행 renderInv/renderOssPanel 실제 source의 filter rerender→ossuary disable→bag navigation 혼합 순서에서 공유 keyboard handler/activeElement 소유권을 새 작은 fixture로 검수하세요. 기존15 단순 반복0. 재현된 결함만 별도 최소 미적용 patch로 남기고 실제 source·DOM 대역·미지원 native/패드/레이아웃을 명시하세요.

## 공통 소유권·실행 계약

- 실제 workdir는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 저장된 fdg 기본 main 체크아웃을 편집하지 않는다.
- 사용자 2026-10-02 최신 지시 “확인했어 각각 시키면돼 업무”로 새 팀 관리 채팅에 기존 미전달 백로그 한 건을 배정한다. 초기 읽기 전용 인수를 마친 후 이 한 건을 수행한다. 과거 과제문서의 “원세션에서만/새 채팅0”은 당시 전달 규칙이며 이번에는 사용자 요청으로 만든 팀 채팅이 아래 새 소유 경로에서 수행한다.
- 소유 폴더는 `tools/team-followup-20261002/project-teams/UIUX/`만이다. 이 폴더의 `task.md`는 총괄 소유이므로 수정하지 않는다. 보고서 `result.md`, 수신/Read/실행/검수/완료 시각·HEAD·SHA·실행 결과를 묶은 `evidence.json`, 필요한 경우 작은 `checks.mjs` 또는 미적용 `candidate.patch`만 추가한다. 총 새 산출은 task.md 외 최대3개로 제한하고 큰 source 사본/캐시/재생성 fixture를 늘리지 않는다.
- 생산 game.html/game-easy-test.html/server.cjs/node-main.js/index.html·기존 test·에셋·원담당 prefix·총괄 docs/JSON·Git 인덱스는 읽기 전용이다. 타 담당과 함께 작업 중이므로 기존 변경을 되돌리거나 덮어쓰지 않고 동일 과제 실행을 중복하지 않는다. 원래 CLI가 같은 과제를 새로 수행하는 증거가 보이면 중복 실행하지 말고 그 근거를 보고한다.
- Git쓰기/commit/push/설치/새 세션/하위에이전트/자동화/권한 변경0. 본인 산출 검수 후 총괄이 순서대로 code+docs 체크포인트와 정확한 원격 SHA를 인수한다.
- Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` 전체 경로를 사용한다. QA 지정 외 팀은 UI·서버·게임·성능 측정·빌드·인코딩0이다. 공유 코드 인수와 실제 실행·시각·청취는 별도 Gate다.
- AGENTS와 해당 시스템 SSOT를 먼저 읽고 코드 산출 후 docs 전체 관련 키워드를 rg로 검색한다. 결과 MD에는 source ID/한글명/수치/적용위치/공식/검수/한계를 필요한 범위의 표로 기록한다. 상세 SSOT 수정이 필요하면 정확한 변경안을 보고서에 제시하고 생산 반영과 함께 총괄이 동기화한다. 보호 문서2_3은 수정0.
- Changes 시작/중간/완료를 관찰한다.80개부터 총괄 체크포인트 필요를 보고하고100개가 되기 전 새 산출을 멈춰 소유 파일 목록을 인계한다. 진행 중 파일/사용자 초안을 임의 커밋하지 않는다.
- 한국어로 수신·실제 Read·실행·산출·검수 완료를 구분한다. 완료 시 소유 파일·검사 수·결함·남은 Gate를 이 채팅 최종 답변으로 보고한다. 이후 후속 일감을 중복 생성하지 않는다.
