# 프로필 인자 영구수정 완료 — root 검토 대기

- 수신/첫 Read: 2026-10-01T16:40:47Z. 동일 작업 완료 중복 없음. 첫 Edit: 16:41:13Z. fixture 명령 16:41:13Z~16:41:17Z; 최종 문법/hash 확인 16:41:30Z. 완료 UTC는 receipt 기록을 따른다.
- 실제 Read: task, root launch-profile-trial.json, 소유 packager.mjs/test.mjs. root 실관측은 16:39:44.855Z(profile 생성·3381 listen·로비), 제공 원격근거 시각은 파일의 remoteVerifiedAt 16:39:01.730Z다. BUILD 신규 원격 조회/앱 관측은 아니다. 원 alert 본문 UNKNOWN 유지.

## 최소 영구 변경
`mac-packager/packager.mjs`의 profile 토큰 생성에서 JSON.stringify를 제거했다. 공백 없는 절대 profile은 `--user-data-dir=/절대/고유job/user-state/profile`로 생성한다. 정상 JSON 직렬화는 그대로이며 인자 내부 literal quote만 생성하지 않는다.
profile 전체 경로의 공백(Unicode 포함)·단/쌍따옴표·제어문자(DEL 포함)는 `UNSUPPORTED_PROFILE_ARGUMENT_PATH`로 PLAN BLOCKED한다. unsupported 경로의 runtime 지원을 주장하지 않는다. 기존 절대경로/고유job/profile/save 격리, single flag 계약, port3333/3340 보호, 보안 flags 및 runtime/backup/SHA 규칙은 유지한다. mkdir 정책이나 기존 live앱을 변경하지 않았다.

## 실제 검증
명령 `node --test tools/team-followup-20261001/BUILD/mac-packager/test.mjs` 결과 **43PASS/0FAIL**(약3.87초): 기존34회귀 + 신규9(정상 무인용 token/나머지flag/고유save 보존1, space/double quote/single quote/tab/newline/control/DEL/Unicode space 거부8). 거부 조건별 plan BLOCKED, adapter 호출0·출력예약0 확인. 모든 copy/adapter는 기존 소형 fixture spy이며 실제 app/build/runtime 실행0.
최종 test명 한국어 정리 이후 `node --check` 두 파일 PASS; test명만 바뀌었으며 실행 본문은43PASS 당시와 동일하다. 로그는 profile-argument-fix-tests.txt. 소형 fixture는 소유 test 범위에서 생성/정리했고 root live output·사용자profile·세이브에는 접근하지 않았다.

현재 SHA256:
- packager.mjs: `1975f899fe62559b96674a811604fb24cee873cd1e1b6da170814a1ffa0e7f0c`
- test.mjs: `dacec58a37d417f7b6d12b23844f8ca2ce52ea0b4fdb83c20540053a7f4e0b82`
- root trial 증거: `db639f66eead2965a9616fd8d0a9f3d9e48d0ed7a63f2413cc5d8af2d0310403`

## docs 반영안·남은 게이트
docs 전체 `rg -n 'user-data-dir|chromium-args|Mac.*packag|프로필.*격리' docs` 검색28줄을 전용 docs-search.txt에 보존했다. 공유 docs 쓰기 금지이므로 반영안만 인계: INTEGRATION_BUILD_TEAM_MASTER의 Mac packager 프로필 계약에 **무공백 절대토큰·인자 literal quote 없음·미검수 경로 PLAN BLOCKED·43fixture PASS**를 추가한다. BUILD_BACKUP_POLICY의 정확 입력/고유출력/사용자세이브 보존 원칙은 변경없음. 이번 후보는 root 체크포인트에 아직 보존되지 않았으므로 기존97db3f1 원격이 새 수정까지 보장한다고 보고하지 않는다.
root의 소스검토/43회귀 재실행/새 정확 원격보존 및 다음 고유 패키지 인수는 남아 있다. 현재 root의 실제 로비→게임→설정→저장→재실행 인수를 BUILD가 대신하거나 완료 선언하지 않는다. 앱·프로세스·생산·타팀·공유docs·Git·queue·새세션/에이전트 변경0. root에 한 건 인계 후 대기한다.
