# Claude Code QA — host-descriptor-observation-contract

사용자가 Claude Code 토큰도 활용하도록 직접 지시했다. 이번 과제는 설치된 Claude Code CLI의 비대화형 읽기 전용 후속 검토다. 기존 대화형 Claude 세션과 Codex 팀 채팅은 그대로 보존한다. 다른 담당도 공유 checkout을 사용하므로 타팀 변경을 되돌리지 말 것.

실제 cwd: /Users/fordeargamers/Projects/exoduser-migration-20261001. 이 TASK.md와 AGENTS.md를 읽고 tools/team-followup-20261002/project-teams/QA/task.md, result.md, evidence.json부터 Read한다. 관련 팀 SSOT/LOCK은 필요한 범위를 읽되 큰 마스터바이블 전체를 불필요하게 읽지 않는다. 기존 검사를 재실행하거나 결과를 본인 실행으로 합산하지 않는다.

완료한 host5단계의 port descriptor 보존 UNKNOWN을 해소할 다음 관측 계약을 설계한다. tools/team-followup-20261001/ITEM/browser-host/{host.js,binding-ports.js,persistence-integration-port.js}, browser-bootstrap-api.js, browser-bootstrap-ui.js 및 QA evidence 원자료를 Read하라. 정확경로는 Glob/Grep으로 찾는다. 설치전/후·닫기전/후 descriptor 필드와 value/get/set 정체의 관찰항목, 타주체 교체·중복close·늦은 비동기완료 반례의 기대결과와 읽기전용 관측 방법을 제시한다. CSP sourceFile 빈값은 주입자 식별 근거로 사용하지 않는다. 기존UI16검사 재실행0, 이번 Claude UI/게임/서버0. 실제 실행은 총괄이 release하는 QA 단독슬롯의 다음 과제로 인계한다. host에 새 상태를 쓰는 instrument 대신 기존 함수/객체의 수동관측으로 가능한 범위를 명확히 한다.

Read/Glob/Grep만 허용. Write/Edit/Bash/코드평가/네트워크/UI/게임/서버/빌드/Git쓰기/설정·권한변경/새세션·subagent 생성0. 제한을 우회하지 않는다. 결과파일은 총괄이 stdout을 받아 기록한다. 실제 읽은 파일·행·식별자·기존 evidence SHA를 명시하되 현행 SHA 재검증은 총괄 단계다.

한국어 최종 응답은 소스 근거 → 논리 반례 또는 불확실성 → 최소 후보/보류·정책 결정 → 검수 Gate 순서로 작성한다. 표에 id/한글명/조건/현재분기/영향/기대행동을 담고, 필요한 docs정정 문안을 제시한다. 실행하지 않은 반례는 '논리 반례 후보'로 명시한다. 생산 적용·실제 runtime·시각/청취 인수는 수행하지 않았다고 분명히 구분한다. 그대로 검토 가능한 구체적인 원문 위치와 문안을 남긴다.
