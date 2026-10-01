# BUILD-20261002-MAC-PACKAGE-PREFLIGHT

physical-load-live 독립23/회귀22 완료를 확인했다. 다음 한 건은 Mac 실행 패키지의 안전한 사전검사 도구 구현이다. AGENTS, BUILD 팀 MD, BUILD_BACKUP_POLICY, package.json/build-nwjs.mjs/node-main.js/server.cjs 및 기존 mac-executable-inventory를 먼저 읽는다. 소유는 `tools/team-followup-20261001/BUILD/mac-package-preflight-*`뿐이다.

- 현재 패키징이 Windows 전용인지, Mac arm64/x64에 필요한 기존 지원/파일/런타임 경로를 실제 소스로 판단한다. 알려진 앱·로컬 캐시 경로를 제한적으로 읽기 검사하고 검색범위를 기록한다. 전체 디스크 스캔·다운로드·설치 금지. 없는 NW.js/runtime은 명시적 BLOCKED로 보고한다.
- 입력 소스 SHA/원격 복구 SHA 일치, 기존 출력 덮어쓰기 방지용 고유 경로, symlink/경로탈출/기존 실행본·사용자 save 포함 금지 조건을 확인하는 작은 preflight CLI를 만든다. 기본 dry-run/read-only; 실제 압축/복사/패키징/실행을 하지 않는다.
- 임시 소형 fixture에서 정상·출력충돌·입력SHA불일치·저장포함·symlink/경로탈출 거부를 검수한다. 실제 사용자 저장 내용은 읽거나 복사하지 않는다. 이미 검수된 코드 재검사 반복으로 대체하지 않는다.
- source backup과 실행 .app 보유/검수는 구분한다. 부족한 runtime과 후속 절차를 정확히 적는다. Mac .app이 실제 생성된 것처럼 보고하지 않는다.

현재 사용자가 보는 Chrome 게임을 그대로 유지한다. 입력/리로드/닫기/계측/새 게임/서버/다운로드/설치/빌드0. production·공유 docs·타팀 수정0, Git변경/queue/새세션/새에이전트0. 공유 docs 반영안은 결과 파일로 제출한다. 수신·중복 확인 후 receipt를 먼저 쓰고 실제 Read/첫 코드 Edit/검수/완료 시각을 남긴다. 이번 한 건 후 root 인계.
