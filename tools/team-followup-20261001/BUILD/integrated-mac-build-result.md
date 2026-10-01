# 최신 통합 Mac 앱 생성 — runtime 인수 전

수신/첫 Read 2026-10-01T17:12:56Z. 동일 task만 존재하여 중복 없음, 기존 사용자 초안/앱/결과 보존. AGENTS·BUILD 대장/백업정책·packager·root-review/rebuild-profile-fixed.mjs·기존 config/result를 읽었다. root-review는 BUILD 하위가 아니라 tools/team-followup-20261001/root-review 실제 경로에서 읽었다.

## 실제 사전검사
- HEAD/종료 HEAD `6be3a06b4e8d03768a35f4c57d419f45c8efeb39`. 직접 ls-remote는 github.com DNS 실패로 재시도0. **root 제공** production-integration/remote-checkpoint-final.json의 실제17:09:31.515Z ref/remote exactMatch를 근거로 로컬 해당 Git 트리의 각 실제 blob을 대조했다. 직접 원격조회 성공으로 표시하지 않는다.
- 승인7918 파일 전체 streaming SHA/bytes/blob 확인, 미백업0. 이전 config에서 두 HTML만 SHA가 바뀌었으며 새 config에 현재 값으로 갱신. 입력 추가/제외0. 입력총6,645,481,527바이트.
- 가용812,581,031,936바이트; stage+package 예상13,689,270,325바이트(+1GiB 안전여유) 통과. 공식0.111.2 arm64 runtime/cache/release/보호규칙 재사용, plan/execute가 전체 입력/runtime SHA를 다시 대조했다.
- 3383 lsof LISTEN 조회 exit1·stdout/stderr 없음으로 순간 미점유 확인. 실행하지 않았으므로 실제 서버 포트 인수는 별도. UUID08cac1ce-21fb-4874-b4df-c136df5ac269, 고유job/profile/save.
- TEAM_UTILIZATION snapshot17:08:49.148844Z의 QA 완료16:35:16.612Z/다음 전달 잠금 차단과 task의 새실측없음 지시를 읽었다. 실측 비중첩은 해당 시점/명시 승인 근거이며 지속 감시 증명은 아니다. GUI/게임/성능실측0.

## 실제 실행·산출
명령 `node tools/team-followup-20261001/BUILD/integrated-mac-build-driver.mjs`. plan READY_PLAN_ONLY 후 execute(config,{approved:true}) 실제1회. build17:14:19.752Z~17:15:36.564Z, PACKAGED_NOT_RUNTIME_ACCEPTED. 무거운 빌드 재실행/기존43회귀 재실행0.
새 앱:
`outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app`
앱 manifest8258항목, 일반파일총7,043,792,984바이트. outputManifest에 경로/크기/링크target을 기록하고 execute 내부에서 파생package/server 및 일반입력 전체 패키지SHA, main/helper 이름/plist를 검증했다. 핵심SHA:
- package.json `f76006616e9c2c99b728327baf9440a01f4ef9f95d6760b64a342600e2ff9f8c`
- node-main.js `f0f922cf4e62dd9f30282ebd37b6ef0c258f2864416e89ab125a6631fd8654c1`
- game.html `c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a`
- game-easy-test.html `11b4e97b15903b9699b296362bdd068ffed6d3a1a505d9f6eeec5482b7c085ca`
기존59376/abf57 앱의 plist/main/package/server/index/game/easy14파일은 전후 SHA/bytes/blob 동일. 프로필/세이브 내용은 읽지 않았다. core 불변은 전체 기존앱 모든파일 불변 증명과 구분한다.

## 인계·한계
새앱 실행0·로비/설정/저장/재실행/미디어/서명/OS보안/배포 인수 미완료. profile/save 절대job 경로의 이동계약도 별도. 소스 백업과 실행산출 원격보존을 구분: 앱은 로컬 생성일 뿐 원격 업로드0. 정확 입력/config/preflight/plan/result.json 및 command.log를 전용prefix로 인계한다. docs 전체 관련검색 기록 및 BUILD 대장에 생성/runtime미인수를 분리 반영했다.
변경파일: integrated-mac-build-* 새 driver/config/receipt/evidence/log/결과, 새 고유job(owner/stage/package), BUILD 대장 추가 단락. 생산HTML/packager/공용총괄/CHANGELOG/타팀/기존앱/세이브/Git쓰기/queue/새세션/에이전트 변경0. user 초안 보존. root 검토 대기.
