# BALANCE — 공유 악의 오류계약의 미검수 반례 1건

이 문서는 총괄 후속 배정 초안이다. 파일 작성은 담당 수신·Read·실행 근거가 아니다. 총괄1+전문11=12 운영에서 Claude native6은 ART/MAP/SKILL/QA/ENEMY/ANIM, Codex는 총괄+UIUX/ITEM/BUILD/BALANCE/SOUND다. 기존 BALANCE project chat에서 한 건만 수행한다. 새 세션·하위팀0이다.

최신 운영 보충(최초 수신 전): 위 총괄1+전문11=12/6대6 문맥은 초기 배치 이력이다. 현재는 신규 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 더한 **총괄1+전문15=16, Claude8/Codex8** 운영이다. 신규팀의 제공자/소유권 배정은 총괄이 관리하며 이 담당의 과제·허용범위는 늘어나지 않는다.

시작 전에 이 TASK의 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BALANCE/TASK.md`와 checkout의 실제 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(끝20261001)을 확인한다. 경로가 다르거나 symlink 해석으로 소유 경계가 바뀌면 쓰지 말고 총괄에 보고한다. **파일/폴더 삭제 명령0, 소유폴더 밖 write0, 임의 cleanup0**이다. 자기 소유 파일도 삭제/이동/정리하지 않는다. 상대경로 오타를 고친다는 이유로 다른 checkout이나 외부 경로를 수정·삭제하지 않는다.

checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 공유 작업 중인 타인 변경과 기존 사용자23항목(한글 백업22·BUILD 초안)을 보존한다. 이 TASK 및 project-teams/owner-dispatch/claude-provider 기존 TASK/후보/근거는 immutable이다.

## 중복을 먼저 제거

`AGENTS.md`, 저장 SSOT, `BALANCE_ECONOMY_TEAM_MASTER.md`, `project-teams/BALANCE/result.md`/`evidence.json`, `integration-review/shared-mats-file-independent.json`, `shared-mats-patch-evidence.json`, `pm-test-support/result.json`/`handler-regression.mjs`를 읽는다. actual-file14·전체handler18·오류응답계획 source19는 기존 완료로 인수하고 재실행·중복하니스 제작0이다.

기존18의 close 주입은 `inject(op)`의 한 번 실패 뒤 finally 재시도 성공이다. 기존19는 atomicSaveJSON 호출/예외 대역이며 내부 cleanup을 실행하지 않았다. **지속 close 실패와 cleanup unlink 실패가 겹치는 한 입력**이 기존 근거에 없는지 먼저 확인한다. 이미 있거나 새 검사의 정당성이 없으면 read-only adoption/report, fixture0/과검사0/중복0으로 완료한다.

## 허용하는 신규 최소 반례

빠져 있는 경우에만 source atomicSaveJSON/sequence와 `/api/mats` POST를 추출하여 checks.mjs 내부 메모리 fs/VM에서 실행한다. 실제 OS 파일·사용자 saves·새 fixture 디렉터리 접근0이다. 대상은 공유 mats만이며 캐릭터 route/경제식/다른 HTTP정책으로 확대하지 않는다.

입력은 기존 target JSON mats4567·독립 슬롯 보존, temp 생성/쓰기 성공 후 **첫 close와 finally close 모두 EIO**, 자기 temp unlink는 EACCES인 단일 합성 시나리오다. open/write/rename 단발 실패·정상clamp·충돌/ENOENT·실파일14를 다시 실행하지 않는다. 정확 source SHA·phase·예외·close 시도횟수·fd/temp map·이전 target/GET·응답/end/성공 ACK를 기록한다.

준비 atomic 후보와 project-teams/BALANCE의 미채택500 응답 fragment를 메모리에서만 비교한다. 이전 bytes 보존·성공 ACK0을 확인하고, 남은 fd/temp가 있다면 그대로 기록한다. `finally`가 예외를 삼키는 것을 cleanup 성공으로 쓰지 않는다. 기존 atomic handler의 Promise 거부/end0과 미채택 오류응답 후보의500 text/plain/end1은 다른 계약이며 어느 것도 HTTP/socket/프로세스생존 검수가 아니다. 실제 결과가 기대와 다르면 raw trace와 함께 보고한다. cleanup 재시도 정책·fsync·로깅·백그라운드 정리나 새 패치를 구현하지 않는다.

생산 적용 뒤 builder를 다시 적용하는 방식은 금지다. 시작 source가 선행 SHA와 달라졌다면 실제 변경을 root에 인계하고 기존 후보를 중복 적용하지 않는다. 소유 메모리 후보/fragment만 사용하며 생산 적용0을 유지한다.

## 소유·금지·결과

쓰기 소유는 `tools/team-followup-20261002/codex-half/BALANCE/`의 **checks.mjs, result.md, evidence.json 최대3파일**뿐이다. TASK/원후보 수정0, 추가 patch/후보/사본/로그/폴더0. 대역·후보·trace는 이3파일 안에 넣는다. 지정 Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`다. 생산 파일은 원문 추출만 하고 server/게임 부트 import0이다.

생산·영구test·공유 docs 쓰기0, Git 명령/인덱스/commit/push0, 서버/listen/HTTP/실게임/앱/UI/빌드/오디오/새세션/하위팀0이다. 다른 채팅 메시지 전송·자동 다음 일감0. Changes/HEAD/수신시각은 총괄 제공 근거만 인용하고 타 담당 WIP를 정리하지 않는다.

result.md에 id·한글명·입력/schema/clamp·실제 함수/SHA·오류 단계·bytes/ACK/end/fd/temp·대역·남은 Gate를 표로 적는다. 기존14/18/19 인수와 이번 신규 반례수를 분리한다. `productionApplied=false`, `responsePolicyAdopted=false`, `source fixture PASS ≠ runtime/visual PASS`를 명시한다. fsync/전원손실/crash/동시writer/Windows/앱재시작은 미검수다. 코드 산출 후 docs 전체 관련 키워드 검색 결과 목록·개수·출력SHA와 정확한 제한/현재상태 동기화안을 자기 evidence/result로 총괄에 인계한다. 공용 docs/보호2_3 수정0이다.
