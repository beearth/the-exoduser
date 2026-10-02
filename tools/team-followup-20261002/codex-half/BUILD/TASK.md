# BUILD — 기존 앱 delta acceptance manifest 고정 1건

이 문서는 총괄의 후속 배정 초안이다. 작성과 담당 수신·Read·실행을 구분한다. 총괄1+전문11=12에서 Claude native6은 ART/MAP/SKILL/QA/ENEMY/ANIM, Codex는 총괄+UIUX/ITEM/BUILD/BALANCE/SOUND다. 기존 BUILD project chat에서 이 한 건만 인수한다. 새 채팅·세션·하위팀0이다.

최신 운영 보충(최초 수신 전): 위 총괄1+전문11=12/6대6 문맥은 초기 배치 이력이다. 현재는 신규 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 더한 **총괄1+전문15=16, Claude8/Codex8** 운영이다. 신규팀의 제공자/소유권 배정은 총괄이 관리하며 이 담당의 과제·허용범위는 늘어나지 않는다.

시작 전에 이 TASK의 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BUILD/TASK.md`와 checkout의 실제 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(끝20261001)을 확인한다. 경로가 다르거나 symlink 해석으로 소유 경계가 바뀌면 쓰지 말고 총괄에 보고한다. **파일/폴더 삭제 명령0, 소유폴더 밖 write0, 임의 cleanup0**이다. 자기 소유 파일도 삭제/이동/정리하지 않는다. 상대경로 오타를 고친다는 이유로 다른 checkout이나 외부 경로를 수정·삭제하지 않는다.

작업 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이다. 기존 사용자 변경23항목(한글 백업22항목·runtime-acquire-config-draft.json), 기존 앱·빌드 초안·원담당 TASK/근거·타인 변경을 보존한다. 이 TASK는 immutable이다.

## 선행 근거와 이번 산출

`AGENTS.md`, `docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md`, `INTEGRATION_BUILD_TEAM_MASTER.md`, `tools/team-followup-20261002/project-teams/BUILD_TEAM/result.md`와 `evidence.json`, 기존 `integrated-mac-build-config.json`/`integrated-mac-build-result.json`을 읽는다. core7/앱6의 기존22 source-delta 검사는 완료 근거로 인수하고 반복 실행하지 않는다.

이번 한 건은 기존 `08cac1ce` Mac 앱 archive의 차이를 **파일 byte SHA 기반 acceptance manifest**로 자기 evidence.json 안에 고정하는 것이다. manifest는 현재 재빌드 승인·전체7918입력 인수·실앱 품질 PASS가 아니다. 새 빌드/config/UUID/포트를 만들지 않는다.

## acceptance manifest 범위

- 원 archive/job/app 절대 경로와 기존 생성 입력 commit `6be3a06b4e8d03768a35f4c57d419f45c8efeb39`, config/result 및 선행 evidence의 전체 SHA를 기록한다. archive는 기존 `outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Resources/app.nw`다. 이동/복사/정리0이다.
- core7(`game.html`, `game-easy-test.html`, `server.cjs`, `node-main.js`, `ui-panels.js`, `package.json`, `index.html`)에 source SHA/bytes, archive SHA/bytes 또는 예상 비포함, expected relationship, 근거 경로/SHA, 검수 단계와 미검수 Gate를 한 행씩 넣는다. 기존 delta/hunk 근거를 재사용하고 전체 diff/대형 파일 복사/에셋 전수해시를 반복하지 않는다.
- 현행 파일 byte를 읽어 manifest 입력이 선행 근거와 같은지 확인하는 최소 pin 작업만 허용한다. 파일이 달라졌으면 실제 새 SHA와 `DRIFT_REQUIRES_ROOT_REVIEW`를 기록한다. 오래된 HEAD/SHA를 현재값으로 덮어 쓰거나 변화를 임의 분류하지 않는다. source/include/exclude/변환 규칙을 바꾸지 않는다.
- 본편/easy의 필터·유골 행동 초점 기능2종 미포함, index/ui-panels byte 동일, 개발 server.cjs 예상 비포함, node-main PORT3333→3383 및 job 저장경로2치환, package.json의 파생 필드/프로필 규칙은 **선행 검수 당시 계약**으로 구분한다. raw SHA 불일치가 예상 파생인지 기능 drift인지 manifest에 분리한다. 앱에 없는 server.cjs의 인수를 앱 품질로 전달하지 않는다.
- expected relationship과 drift 사유가 모두 근거를 가진다면 `acceptanceManifestReady=true`, `rebuildExecuted=false`, `runtimeAccepted=false`, `productionApplied=false`로 기록한다. 정당한 신규 fixture가 필요 없으므로 기본 fixture0/중복검사0이다. checks.mjs는 필요할 때만 작은 manifest 구조/참조 SHA 확인에 쓰며 이전22를 다시 돌리지 않는다.

## 소유·금지·보고

쓰기 소유는 `tools/team-followup-20261002/codex-half/BUILD/`의 **checks.mjs, result.md, evidence.json 최대3파일**이다. TASK와 기존 산출은 수정0. acceptance manifest를 evidence.json 내부에 넣고 별도 manifest/config/patch/로그/사본/폴더를 만들지 않는다. Node가 필요하면 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`를 쓴다. packager/서버/게임 코드 import·실행0이다.

생산·공유 docs·기존 앱/초안 변경0, Git 명령/인덱스/commit/push0, 원격 조회0, 다운로드/설치/빌드/복사/인코딩/서버/HTTP/실게임/앱/UI조작/새세션/하위팀0이다. 사용자 저장·프로필 내용 읽기0이다. 다른 채팅 메시지 전송·자동 다음 작업0이다. Changes와 원격 HEAD는 총괄의 실제 근거만 인용하며 원격 backup 완료를 새로 선언하지 않는다.

result.md에는 source ID·한글명·적용 파일·bytes/SHA·예상관계·실제 drift·상태/미검수 Gate 표를 넣는다. 기존22 인수와 이번 pin/문서화 건수를 분리하고 `source/manifest PASS ≠ runtime/visual PASS`를 명시한다. 코드 산출이 있다면 관련 docs 전체 키워드 검색의 목록·개수·출력SHA와 필요한 현재상태 정정안을 자기 evidence/result로 총괄에 인계한다. 공용 docs/보호2_3 수정0. 입력·기존 TASK 전후 SHA 보존과 최대3산출을 확인하고 결과만 총괄에 전달한다.
