# Claude Code ENEMY — death-shot-reachability-review

사용자가 Claude Code 토큰도 활용하도록 직접 지시했다. 이번 과제는 설치된 Claude Code CLI의 비대화형 읽기 전용 후속 검토다. 기존 대화형 Claude 세션과 Codex 팀 채팅은 그대로 보존한다. 다른 담당도 공유 checkout을 사용하므로 타팀 변경을 되돌리지 말 것.

실제 cwd: /Users/fordeargamers/Projects/exoduser-migration-20261001. 이 TASK.md와 AGENTS.md를 읽고 tools/team-followup-20261002/project-teams/ENEMY/task.md, result.md, evidence.json부터 Read한다. 관련 팀 SSOT/LOCK은 필요한 범위를 읽되 큰 마스터바이블 전체를 불필요하게 읽지 않는다. 기존 검사를 재실행하거나 결과를 본인 실행으로 합산하지 않는다.

새 ENEMY76검사의 TCB03/04 합성 상태가 실제 hurtE 사망 경로에서 도달가능한지 호출순서로 논증한다. 양쪽 HTML 전체 hurtE 사망구간·_spawnBossProjectile/_emitEnemyShot/_tickEnemyShotWarnings/updateE, 기존76 하니스 추출경계, 공격·AI SSOT를 Read한다. 생전예약→동일frame사망탄·스턴과빙결 해제·정상 eShootWind 완료를 연결해 기존12라인 후보의 필요성과 부작용을 독립 검토한다. 실제caller/etype/alive변경시점/frame/world/el/blackBean/parryClass 표를 작성하고 도달경로와 합성전용 상태를 구분한다. 후보 채택/축소/보류 근거를 제안하고 실행하지 않은 반례는 논리 반례 후보로 표시한다. 사망탄·돌진commit·Q전용magic패링·공격수치 보존, 티켓0. 보호2_3문서는 읽기만 한다.

Read/Glob/Grep만 허용. Write/Edit/Bash/코드평가/네트워크/UI/게임/서버/빌드/Git쓰기/설정·권한변경/새세션·subagent 생성0. 제한을 우회하지 않는다. 결과파일은 총괄이 stdout을 받아 기록한다. 실제 읽은 파일·행·식별자·기존 evidence SHA를 명시하되 현행 SHA 재검증은 총괄 단계다.

한국어 최종 응답은 소스 근거 → 논리 반례 또는 불확실성 → 최소 후보/보류·정책 결정 → 검수 Gate 순서로 작성한다. 표에 id/한글명/조건/현재분기/영향/기대행동을 담고, 필요한 docs정정 문안을 제시한다. 실행하지 않은 반례는 '논리 반례 후보'로 명시한다. 생산 적용·실제 runtime·시각/청취 인수는 수행하지 않았다고 분명히 구분한다. 그대로 검토 가능한 구체적인 원문 위치와 문안을 남긴다.
