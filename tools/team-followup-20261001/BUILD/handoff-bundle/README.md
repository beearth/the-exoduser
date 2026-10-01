# 자기완결 NW 진입 인수묶음

원본 failure-entry 불변. inputs는 읽기 소스 사본이며 production이 아니다. 이 폴더만 옮겨도 정적 검사와 작은 fixture 준비가 가능하다. NW 런타임은 포함하지 않는다.

## 바로 수행 가능한 작은 검사

이 폴더에서 `node check.cjs` (19개 모의), `node check-bundle.cjs` (6개 파일 계약). 준비 과정은 작은 파일5개/manifest만 작성하며 NW.js·빌더·소켓을 실행하지 않는다. 테스트는 자기 임시 출력만 제거한다. 입력 SHA는 evidence.json, 준비 fixture 계약은 bundle-evidence.json을 참조한다.

## root 실제 실행 게이트 (지금 금지)

1. QA 종료 및 기존 NW 경로·버전 조회. 미발견이면 다운로드하지 말고 대기한다. 실제 공유context는 기존 context-probe6시나리오로 별도 확인한다.
2. `node prepare.cjs root-YYYYMMDD-HHMMSS`로 고유 fixture 생성. 기존 출력은 EEXIST로 거부한다. 전체 게임 빌드가 아니다. root가 출력 manifest의 로컬 main/절대 profile/fixture-saves/3347 및 입력 해시를 재검사한다.
3. root 승인 후에만 기존 NW 실행 파일에 출력 폴더 경로를 넘긴다. 예: `"$NW_BIN" "$PREPARED_DIR"`. 이 단계는 실제 소켓 listen을 만들므로 이번 작업에서 실행하지 않는다. APPDATA 사용자 세이브는 참조하지 않고 출력 내 fixture-saves만 사용한다. URL의 데모 파라미터는 유지하지만 index는 작은 텍스트 fixture이며 게임이 없다.
4. 정상: 해당 사본의 listen ready 이후 fixture 표지만 표시. 실패: 기존3347 점유 상태는 root가 안전하게 별도 확보하고 재실행; EADDRINUSE 실패 메시지 유지, 이전 서버 화면 탐색0, 기존 서버 보존. 본 묶음은 포트 점유 서버를 만들거나 자동 재시도하지 않는다. EACCES 재현을 위해 권한/보안 설정을 바꾸지 않는다.
5. 화면·node-main oauth-debug.log·manifest SHA·실행 경로/버전·종료 증거를 별도 수집한다. 정상/실패 모두 NW GUI 강제 종료 없이 root가 정상 닫는다. 실제 shared process 동일성·bind 오류·HTTP 응답 정체는 현재 미검증이다.

## 생산 적용 순서 (총괄만)

1. 현재 생산 입력 SHA와 snapshot 차이/타팀diff 확인.
2. package-entry.html/package-entry-state.cjs를 승인된 입력 위치로 인수.
3. node-main.js.diff 적용: 이전 port-error hunk와 중복 적용하지 않는다. 저장 계약은 생산 적용에서 그대로 보존한다. prepare의 fixture-saves 치환은 **검수 사본 전용**이므로 생산에 적용하지 않는다.
4. build-nwjs.mjs.diff의 FILES와 출력 manifest 로컬 main 적용. 기존 package.json main3333 사전조건을 먼저 변경하지 않는다. 개발3340 불변, 통합 사본3347/기존 고유 저장·프로필 계약 유지.
5. 생산 정적 회귀/docs 동기화 및 root 복구 체크포인트. 실제 패키지 빌드/실행은 추가 승인 게이트이며 이번 작업의 PASS가 대신하지 않는다.

pending은 생산에서 자동 ready로 만들지 않는다. 준비 하니스의 timeout은 진단 전용이다. 신규 창/다른 context/ready 이후 오류까지 완전 차단한다는 보장 없음. 조회 범위 밖 NW 미설치 단정 금지.
