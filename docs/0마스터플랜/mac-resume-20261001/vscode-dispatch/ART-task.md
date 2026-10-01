# Mac VS Code 기존 터미널 작업 배정 — 2026-10-01

사용자가 열어둔 기존 터미널에서 수행하는 승인 후속이다. 한국어로 응답한다. 먼저 AGENTS.md, docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md, PROJECT_MANAGEMENT_MASTER.md §18 최신 및 담당 팀 문서를 읽는다. 과거 신뢰 대기/이전 중지는 최신 재개 지시보다 우선하지 않는다. 실제 보안/로그인 승인이 나타나면 우회하지 말고 정확히 기록한다.

현재 기준 HEAD 30a204a7aa348a88b90bdc922862c610a7da938f. 작업 폴더 /Users/fordeargamers/Projects/exoduser-migration-20261001. 원격 백업 대조 완료. 기존 docs_backup_before_normalize_20260726/ 22경로와 모든 타인 WIP, 세이브는 보존한다. game.html·game-easy-test.html·공유 마스터/상태판은 총괄 소유: 직접 편집하지 않는다. Git add/commit/push, checkout/reset, 새 에이전트/세션 생성 금지. 담당 산출만 작성하면 총괄이 통합·검수·원격 체크포인트한다. PC/3333/사용자 세이브 변경 금지. 이미지 생성·유료 서비스·인코딩·패키지 빌드·SOUND 병합/삭제/배포 금지.

각 팀 쓰기 소유권은 tools/team-followup-20261001/ART/ 및 이 배정 디렉터리의 ART-result.md, ART-receipt.json으로 제한한다(ART은 자신의 팀명). 기존 도구는 읽고 복사한 뒤 담당 디렉터리에서 보강한다. 코드 변경 관련 키워드는 docs 전체에서 rg로 검색하고 결과와 필요한 문서 정정을 result에 기록한다. 다른 팀 소유 파일 수정 필요는 정확한 diff 후보만 본인 폴더에 보관한다. 작은 정적 검사만 허용. 게임/브라우저/서버 추가 실행은 QA 단독, MAP/ART/UIUX/ANIMVFX는 QA 종료 인계 전 보류한다.

수신 즉시 ART-receipt.json에 taskId, terminal, cli, 확인 가능한 실제 model/sessionId(모르면 null), receivedAt, startedAt, status, ownedPaths, nextAction, blocker를 기록한다. 파일을 쓰기만 했다고 완료하지 말고 곧바로 첫 소스 읽기/실행을 시작한다. 완료 기준 충족 시 결과·명령/exit·원자료·실행하지 않은 항목·남은 게이트를 한국어 result에 기록하고 receipt 상태를 갱신한다. 소유권 밖의 다음 작업은 실행하지 말고 인계한다.

## 담당 ART / 터미널 2

작업 ID: ART-WA24-PROBE-FIX
제목: 컷신 타임라인 관측 후보 결함 수정
담당 문서: `docs/17게임아트팀/ART_TEAM_MASTER.md`

/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/candidates/ART.js와 검증결과.md를 읽고 wa24 표본0이 PASS되지 않게 수정한 독립 관측기를 본인 폴더에 구현한다. rAF/timeout/namespace 전체 정리와 중복 설치를 보강하고 mock 환경에서 정상표본·0표본·재설치·취소 검수. 게임 원화/로더 불변, 실제 컷신 인수는 QA 종료 뒤 별도.

완료 기준: 위 구체 산출물과 수행 가능한 작은 검증을 완료하고 증거를 result에 남길 것. 필수 실화면/미결정 사항은 미완료로 구분한다. 결과를 한국어로 터미널에 보고한다.
