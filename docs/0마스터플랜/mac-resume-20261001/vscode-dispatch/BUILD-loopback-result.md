# BUILD-NODE-LOOPBACK-CONTRACT — 실행 시도 및 권한 게이트

**실통합 검증 미완료. 실제 Node loopback listen이 EPERM으로 거부됨.** 모의 PASS로 대체하거나 권한 제한을 우회하지 않았다. 새 세션·권한 변경·포트 변경 재시도 없음.

## 수신·착수 구분

- 수신/첫 Read: 2026-10-01T12:23:22Z. LOOPBACK_TASK, 이전 control 완료 영수증·폴더 목록 확인. 같은 실loopback 과제 산출은 없었다.
- 후속 첫 준비 명령: 기존 BUILD-next 결과/최신팀MD/handoff listen-error diff·상태·진입 HTML 읽기, `lsof -nP -iTCP -sTCP:LISTEN`. 3333 PID12319, 3340 PID40609 점유 확인. 해당 프로세스·포트에 요청하지 않았다.
- 실제 검증 명령: `node tools/team-followup-20261001/BUILD/loopback/check.cjs` → **exit1, 0 PASS / 1 FAIL**. 시작/종료의 정밀 UTC는 loopback/evidence.json 참조. 명령 반환2026-10-01T12:24:21Z.

## 구현한 작은 실통합 하니스

현재 `node-main.js`에서 저장 helpers/routes를 추출하고 현재 handoff 누적 diff를 메모리 적용한 listen/error/ready 꼬리를 사용한다. 전체 node-main이나 게임 서버를 실행하지 않는다. HTTP fixture는 identity 및 추출한 저장 API만 제공한다. 소스 절대 기준은 현재 checkout이며 각 입력 SHA-256은 evidence에 있다.

| 허용 치환 | 검증 의도 |
|---|---|
| 첫 PORT=0 / HOST=127.0.0.1 | OS가 고유 임시 포트를 할당. 생산3333/3340/통합3347 접근 없음 |
| SAVE_DIR=BUILD/loopback/fixture-고유ID/saves | 실제 사용자 세이브가 아닌 작은 fixture. fs proxy로 모든 추출 API 파일 접근/쓰기를 해당 saves로 제한 |
| 두 번째 서버=첫 본인 서버가 배정받은 포트 | 실제 EADDRINUSE·실패상태·기존 본인 서버 보존 검사. 기존 사용자 프로세스 대상으로 충돌시키지 않음 |
| VM 진입 허용 포트=임시 포트 | 상태에 따른 탐색0 관측용. 실제 NW/브라우저 없음; production 고정포트 계약 검수와 구분 |

준비된 정상 경로는 ready→HTTP marker 확인→save/load/mats/slots→본인 서버 충돌→late ready 차단→원서버 marker 유지→삭제→close→연결 종료 검사다. 잘못된 rival identity를 정상으로 인정하지 않는 대조와 VM entry 탐색0 검사가 포함돼 있다. 이 검사들은 초기 listen 실패로 **실행되지 않았으며 PASS가 아니다**.

## 실제 실패·정리 근거

```text
Error: listen EPERM: operation not permitted 127.0.0.1
```

OS 임시포트0 바인딩 단계에서 거부돼 유효 port가 할당되지 않았다. 사용자 코드의 EADDRINUSE 결함이나 포트 점유로 바꿔 설명하지 않는다. 샌드박스/환경 권한 게이트이며 사용자 작업 승인과 실행환경 허용은 별개다. 기록의 writes=[]이며 저장 HTTP 요청0. finally에서 본인 서버만 정리하고 고유 fixture 디렉터리를 제거했으며 cleaned=true다. 종료 후 실제 listen이 없는 서버에 close 강제 호출이나 다른 프로세스 kill은 하지 않았다.

후속 `node --check .../loopback/check.cjs` exit0. `lsof`로 기존3333/3340의 동일PID listener를 재조회했다. 생산 보존 근거이며 세이브 내용 읽기 검증은 하지 않았다. 관련 docs 키워드 `INT-002|EADDRINUSE|EXODUSER_SAVE_DIR|3347` 전체 검색 원자료는 loopback/docs-search.txt에 보존했다. 공유문서 수정 없이 총괄 인계 제안: INT-002에 “실Node 통합 하니스 준비, 실제 listen EPERM으로 미완료; NW 게이트 별도” 기록.

## 잔여 게이트

root가 허용된 실행환경에서 같은 작은 명령을 별도 수행해 실HTTP·EADDRINUSE·파일쓰기 격리·자원 종료를 검수해야 한다. 이번 세션은 approval never이므로 권한 상승을 요청하거나 다른 도구/프로세스로 listen 제한을 우회하지 않는다. 동일 거부 경로 반복실행도 하지 않는다. 미실행 assertion 목록은 하니스 소스에 있고 최초 실패 원자료는 evidence.json에 유지했다.

NW 공유객체/컨텍스트·실제 화면/패키지 전체·실제EACCES·저장중 강제종료 내구성은 여전히 미검증이다. 전체 게임/NW/브라우저/대형빌드/공유파일편집/Git쓰기/새세션0. 사용자세이브 접근0. 실행 시도와 완료를 구분해 권한 게이트 상태로 인계한다.
