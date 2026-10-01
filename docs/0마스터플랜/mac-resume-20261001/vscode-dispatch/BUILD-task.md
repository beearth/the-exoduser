# Mac VS Code 기존 터미널 작업 배정 — 2026-10-01

사용자가 열어둔 기존 터미널에서 수행하는 승인 후속이다. 한국어로 응답한다. 먼저 AGENTS.md, docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md, PROJECT_MANAGEMENT_MASTER.md §18 최신 및 담당 팀 문서를 읽는다. 과거 신뢰 대기/이전 중지는 최신 재개 지시보다 우선하지 않는다. 실제 보안/로그인 승인이 나타나면 우회하지 말고 정확히 기록한다.

현재 기준 HEAD 30a204a7aa348a88b90bdc922862c610a7da938f. 작업 폴더 /Users/fordeargamers/Projects/exoduser-migration-20261001. 원격 백업 대조 완료. 기존 docs_backup_before_normalize_20260726/ 22경로와 모든 타인 WIP, 세이브는 보존한다. game.html·game-easy-test.html·공유 마스터/상태판은 총괄 소유: 직접 편집하지 않는다. Git add/commit/push, checkout/reset, 새 에이전트/세션 생성 금지. 담당 산출만 작성하면 총괄이 통합·검수·원격 체크포인트한다. PC/3333/사용자 세이브 변경 금지. 이미지 생성·유료 서비스·인코딩·패키지 빌드·SOUND 병합/삭제/배포 금지.

각 팀 쓰기 소유권은 tools/team-followup-20261001/BUILD/ 및 이 배정 디렉터리의 BUILD-result.md, BUILD-receipt.json으로 제한한다(BUILD은 자신의 팀명). 기존 도구는 읽고 복사한 뒤 담당 디렉터리에서 보강한다. 코드 변경 관련 키워드는 docs 전체에서 rg로 검색하고 결과와 필요한 문서 정정을 result에 기록한다. 다른 팀 소유 파일 수정 필요는 정확한 diff 후보만 본인 폴더에 보관한다. 작은 정적 검사만 허용. 게임/브라우저/서버 추가 실행은 QA 단독, MAP/ART/UIUX/ANIMVFX는 QA 종료 인계 전 보류한다.

수신 즉시 BUILD-receipt.json에 taskId, terminal, cli, 확인 가능한 실제 model/sessionId(모르면 null), receivedAt, startedAt, status, ownedPaths, nextAction, blocker를 기록한다. 파일을 쓰기만 했다고 완료하지 말고 곧바로 첫 소스 읽기/실행을 시작한다. 완료 기준 충족 시 결과·명령/exit·원자료·실행하지 않은 항목·남은 게이트를 한국어 result에 기록하고 receipt 상태를 갱신한다. 소유권 밖의 다음 작업은 실행하지 말고 인계한다.

## 담당 BUILD / 터미널 10

작업 ID: BUILD-RECOVERY-CONTRACT
제목: 저장·포트·입력 복구 계약 검증
담당 문서: `docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md`

server.cjs, node-main.js, 기존 격리 저장/3340개발/3347패키지 도구와 저장·입력 복구 관련 test를 읽는다. 기존 사용자 save를 쓰지 않는 임시 fixture 경로에서 가능한 단위 검사를 선택해 수행하고 포트 충돌/잘못된 저장경로/중단 후 입력정리 계약의 근거와 누락을 기록한다. 새로운 실제 서버/게임/패키지 빌드·LFS 대량다운로드 금지. 결함은 독립 도구/테스트 사본으로만 보강하며 source SHA와 패키지 미검수 구분.

완료 기준: 위 구체 산출물과 수행 가능한 작은 검증을 완료하고 증거를 result에 남길 것. 필수 실화면/미결정 사항은 미완료로 구분한다. 결과를 한국어로 터미널에 보고한다.
