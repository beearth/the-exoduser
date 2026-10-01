# BUILD 후속 — NW.js 공유 상태 검증 준비

기존 BUILD 세션 유지. failure-entry 후보19/19는 root가 코드 대조와 재검사 완료했지만 실제 NW.js 인수는 아니다. 다음 독립 한 건은 node-main과 로컬 페이지의 process 객체 공유 가정을 검증할 최소 재현 패키지를 준비하는 것이다. 설치된 NW.js 버전/실행 파일 경로는 읽기 조회만 한다. 공식 NW.js 문서의 node-main/Node context 연결 근거를 확인해 URL과 적용 버전을 남기고, 같은 process 객체인지·상태 선후·오류 차단을 화면과 로그로 확인할 작은 격리 하니스를 작성한다. 실행 지시문과 예상 통과/실패도 적는다.

지금은 QA 단독 측정이므로 하니스/패키지/소켓/게임/빌드/인코딩을 실제 실행하지 않는다. 다운로드·설치·외부권한·보안설정 변경0, 사용자세이브 접근0, Git0. 실제실행은 root가 별도 게이트에서 한다. 모의로 실제process 동일성을 입증했다고 주장하지 않는다. 공유되지 않을 때의 fail-closed 유지와 pending을 실패로 보고하는 진단만 설계하고 생산 정책을 임의확장하지 않는다.

소유범위 tools/team-followup-20261001/BUILD/context-probe/ 신규경로와 BUILD-context-receipt.json/BUILD-context-result.md만. 기존 후보/생산/공용문서 불변. 수신·착수·완료 시각과 한계 기록. 새 세션/다음 자율작업 생성 금지.
