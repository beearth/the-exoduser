# Mac VS Code 기존 터미널 작업 배정 — 2026-10-01

사용자가 열어둔 기존 터미널에서 수행하는 승인 후속이다. 한국어로 응답한다. 먼저 AGENTS.md, docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md, PROJECT_MANAGEMENT_MASTER.md §18 최신 및 담당 팀 문서를 읽는다. 과거 신뢰 대기/이전 중지는 최신 재개 지시보다 우선하지 않는다. 실제 보안/로그인 승인이 나타나면 우회하지 말고 정확히 기록한다.

현재 기준 HEAD 30a204a7aa348a88b90bdc922862c610a7da938f. 작업 폴더 /Users/fordeargamers/Projects/exoduser-migration-20261001. 원격 백업 대조 완료. 기존 docs_backup_before_normalize_20260726/ 22경로와 모든 타인 WIP, 세이브는 보존한다. game.html·game-easy-test.html·공유 마스터/상태판은 총괄 소유: 직접 편집하지 않는다. Git add/commit/push, checkout/reset, 새 에이전트/세션 생성 금지. 담당 산출만 작성하면 총괄이 통합·검수·원격 체크포인트한다. PC/3333/사용자 세이브 변경 금지. 이미지 생성·유료 서비스·인코딩·패키지 빌드·SOUND 병합/삭제/배포 금지.

각 팀 쓰기 소유권은 tools/team-followup-20261001/BALANCE/ 및 이 배정 디렉터리의 BALANCE-result.md, BALANCE-receipt.json으로 제한한다(BALANCE은 자신의 팀명). 기존 도구는 읽고 복사한 뒤 담당 디렉터리에서 보강한다. 코드 변경 관련 키워드는 docs 전체에서 rg로 검색하고 결과와 필요한 문서 정정을 result에 기록한다. 다른 팀 소유 파일 수정 필요는 정확한 diff 후보만 본인 폴더에 보관한다. 작은 정적 검사만 허용. 게임/브라우저/서버 추가 실행은 QA 단독, MAP/ART/UIUX/ANIMVFX는 QA 종료 인계 전 보류한다.

수신 즉시 BALANCE-receipt.json에 taskId, terminal, cli, 확인 가능한 실제 model/sessionId(모르면 null), receivedAt, startedAt, status, ownedPaths, nextAction, blocker를 기록한다. 파일을 쓰기만 했다고 완료하지 말고 곧바로 첫 소스 읽기/실행을 시작한다. 완료 기준 충족 시 결과·명령/exit·원자료·실행하지 않은 항목·남은 게이트를 한국어 result에 기록하고 receipt 상태를 갱신한다. 소유권 밖의 다음 작업은 실행하지 말고 인계한다.

## 담당 BALANCE / 터미널 11

작업 ID: BALANCE-FIREBALL-HOOK-AUDIT
제목: onHitFireball 미연결 효과 계약 확인
담당 문서: `docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md`

test/onHitFireballStack.test.js와 현재 _eqAffix/hurtE/fireOnHit, ITEM 어픽스 SSOT를 대조한다. 기존 8PASS2SKIP/MISSING_HOOK를 효과 구현 완료로 쓰지 말고 4/7/11/16/22% 데이터, 정상 롤과 강제장착, 재귀 방지·피해원·중첩 계약의 근거를 독립 감사 도구/결과로 작성한다. 효과 구현에 필요한 미결정 항목과 최소 후보 설계를 분리한다. 경제/확률/피해/생산 코드 변경 금지.

완료 기준: 위 구체 산출물과 수행 가능한 작은 검증을 완료하고 증거를 result에 남길 것. 필수 실화면/미결정 사항은 미완료로 구분한다. 결과를 한국어로 터미널에 보고한다.
