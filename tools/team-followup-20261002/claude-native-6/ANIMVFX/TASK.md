# VS Code Claude ANIMVFX — native-partial-walk-queue-fixture

사용자 최신 지시: VS Code에 직접 연6개 Claude에게 업무를 배정하고, 총괄1+전문11을 Claude6/Codex6으로 나눈다. ANIMVFX은 Claude 전문팀이다. 실제 workdir는 /Users/fordeargamers/Projects/exoduser-migration-20261001. 다른 팀도 같은 checkout에서 작업 중이므로 타팀 변경을 되돌리지 말 것.

먼저 이 TASK.md, AGENTS.md, docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md 최신 운영부와 담당 시스템 SSOT를 읽는다. 완료된 tools/team-followup-20261002/project-teams/ANIMVFX/result.md 및 evidence.json과 별도 Claude-provider 결과를 구분하여 인수한다. 이전 완료 검사를 재실행·본인 실행으로 합산하지 않는다.

별도 일회 Claude의 partial-gl-queue-fallback-review 결과가 존재하면 Claude-provider/ANIMVFX/result.md를 인수하고 없으면 이미 알려진 source 경계를 직접 읽어라. 실제 _prepEnemyInstanced/_queueEnemy8DirInstanced/_drawEnemy8DirInstanced와2D guard를 추출하여 idle성공후 walk실패를 최소 fixture로 재현한다. capacity 잔여1/walk버킷포화/walk미준비/draw실패를 구분한다. rollback 또는 사전확인의 최소 후보를 메모리에서 대조하고 동일 객체를 GL+2D로 이중 렌더하거나 보행 몸체를 누락하지 않는 불변조건을 검수한다. 기존57의capacity0검사 반복0, 발anchor UNKNOWN/corpse fade보류/에셋변경0. 실제GPU/시각 Gate는 별도다.

소유 신규 파일은 이 폴더의 checks.mjs/result.md/evidence.json 최대3개다. TASK.md는 총괄 소유이므로 수정0. 실제 source 함수·최소 fixture만 복사하고 전체 게임 사본을 새로 만들지 않는다. 생산 HTML/서버/기존test/에셋/공유docs/타팀prefix는 읽기전용. Git쓰기/rollback/새세션/새subagent/설정·권한변경/새게임·서버·빌드0. 사용자게임/세이브/기존3333/백업/초안을 보존한다. Node는 /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node를 사용한다. source fixture는 실제 게임 인수와 구분한다.

시작/중간/완료 Changes 개수를 읽기전용으로 기록한다.80개부터 총괄 checkpoint 필요·100개 전 완료, 직접 stage/commit/push0. 검사 실행 후 결과에 실제 source SHA·입력/예상/관찰·PASS/FAIL/UNKNOWN·미적용 후보·필요 docs 정정표·다음 Gate를 한국어로 적는다. 관련키워드를 docs 전체에서 rg로 검색하고 발견사항을 담당 result에 빠짐없이 보고한다. 공용 docs 반영과 생산 통합은 총괄의 순차 인수다. 실제TASK Read→명령→작성→검수→완료 시각을 evidence에 기록하고 한 건 완료시 인계한다.
