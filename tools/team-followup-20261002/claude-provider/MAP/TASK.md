# Claude Code MAP — main-easy-generation-policy

사용자가 Claude Code 토큰도 활용하도록 직접 지시했다. 이번 과제는 설치된 Claude Code CLI의 비대화형 읽기 전용 후속 검토다. 기존 대화형 Claude 세션과 Codex 팀 채팅은 그대로 보존한다. 다른 담당도 공유 checkout을 사용하므로 타팀 변경을 되돌리지 말 것.

실제 cwd: /Users/fordeargamers/Projects/exoduser-migration-20261001. 이 TASK.md와 AGENTS.md를 읽고 tools/team-followup-20261002/project-teams/MAP/task.md, result.md, evidence.json부터 Read한다. 관련 팀 SSOT/LOCK은 필요한 범위를 읽되 큰 마스터바이블 전체를 불필요하게 읽지 않는다. 기존 검사를 재실행하거나 결과를 본인 실행으로 합산하지 않는다.

작업 시작 전 docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md 처음부터 끝까지 전체 Read하고 _MAP_SSOT_INDEX.md의 우선순위를 적용하라. 새 MAP result의3FAIL이 쉬운판의 의도된 별도 생성인지 production hook 누락인지 SSOT와 실제 호출 경로로 판별한다. 양쪽 HTML script include·_buildCh1StartForestRLE/_cloneField11/genFromTemplate, assets/map/ch1/production/layout.js(정확 경로는 Glob), stage LOCK을 좁게 읽는다. 기존23검사/BFS 재실행0. 3FAIL 각각의 원인분기·영향·버전정책 근거를 표로 작성하고 동일맵이 확정계약일 경우에만 최소 미적용 변경 문안을 제안한다. 근거가 없으면 결정대기로 남겨 임의통합하지 않는다. geometry/collision/좌표/소스 변경0, M5 주머니 임의정의0. 가이드 §23 MAP PRODUCTION REPORT 항목을 포함하고 VISUAL VERDICT: RETOUCH, 실제8뷰0를 명시한다.

Read/Glob/Grep만 허용. Write/Edit/Bash/코드평가/네트워크/UI/게임/서버/빌드/Git쓰기/설정·권한변경/새세션·subagent 생성0. 제한을 우회하지 않는다. 결과파일은 총괄이 stdout을 받아 기록한다. 실제 읽은 파일·행·식별자·기존 evidence SHA를 명시하되 현행 SHA 재검증은 총괄 단계다.

한국어 최종 응답은 소스 근거 → 논리 반례 또는 불확실성 → 최소 후보/보류·정책 결정 → 검수 Gate 순서로 작성한다. 표에 id/한글명/조건/현재분기/영향/기대행동을 담고, 필요한 docs정정 문안을 제시한다. 실행하지 않은 반례는 '논리 반례 후보'로 명시한다. 생산 적용·실제 runtime·시각/청취 인수는 수행하지 않았다고 분명히 구분한다. 그대로 검토 가능한 구체적인 원문 위치와 문안을 남긴다.
