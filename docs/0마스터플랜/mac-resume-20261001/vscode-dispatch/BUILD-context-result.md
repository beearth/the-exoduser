# BUILD NW.js 공유 상태 검증 준비

기존 세션 유지, 지정 경로만 작성. **검증 준비 완료 / 실제 NW.js 실행0 / 공유 process 동일성 미검증**. 다음 지시를 기다린다.

## 수신·착수·완료

수신/착수2026-10-01T11:10:12Z. 지시서를 직접 읽고 receipt를 먼저 작성한 뒤 설치 경로와 빌더 버전을 읽기 조회했다. 완료2026-10-01T11:11:26Z 이후 구문/JSON 정적 검사를 마쳤다. 실제 모델은 미확인, 세션 ID는 이전 총괄 배정 기준이다. 새 세션/에이전트0.

## 공식 근거 및 설치 조회

- [Manifest Format](https://docs.nwjs.io/References/Manifest%20Format/): node-main은 최초 DOM 이전 Node context에서 실행한다는 근거.
- [JavaScript Contexts](https://docs.nwjs.io/For%20Users/Advanced/JavaScript%20Contexts%20in%20NW.js/): 기본 separate context 및 require/node-main 공유 문맥 설명. 같은 process 객체 사용 가능성의 문서상 근거이며 현재 환경 실제 관측은 아니다.
- [Changes to Node](https://docs.nwjs.io/References/Changes%20to%20Node/): process 버전 필드·node-main 사용 시 mainModule 계약.
- [문서 범위](https://docs.nwjs.io/): 0.13 이상. 조회2026-10-01. 초기 `/en/latest/` 주소2개는404였으며 공식 루트 주소로 전환했다. 목표 빌더 `build-nwjs.mjs:169`는0.111.2/Windows x64/normal. 문서가0.111.2 고정 스냅샷은 아니다.

Applications/사용자 Applications/node_modules 깊이4와 사용자 Library/Caches/out/vendor 깊이5에서 기존 nwjs.app/nw/nw.exe를 읽기 조회했다. 실행 경로 미발견이며 설치 버전 미확인. vendor/nwjs-ffmpeg 코덱 폴더만 관측했다. 이 제한 검색으로 전체 머신 미설치를 단정하지 않는다. 바이너리 실행·다운로드·설치0.

## 산출·검수

| `tools/team-followup-20261001/BUILD/context-probe/` 산출 | 내용 |
|---|---|
| package.json | 로컬 진입·별도 이름/프로필, node-main CJS. 보안 완화 옵션 없음 |
| probe-node.cjs | 캡처 process 객체와 페이지 객체를 `===` 비교하는 함수; 실행 버전/경로·순서 로그; 소켓 없는 모의 준비/실패 상태 |
| probe.html | 화면·콘솔·공유 recorder 로그, ready 선후/오류 차단/상태 부재 판정. 실제 navigations0 |
| README.md | root 실행 게이트·고유run/시나리오별 프로필/예상결과·공식URL·버전·설치 조회 범위 |
| docs-search.txt | docs 전체 관련 키워드 검색 원자료 |

`node --check .../probe-node.cjs` exit0. JSON.parse(manifest) 및 new vm.Script(inline) 정적 파서만 실행, exit0. **하니스 코드는 실제 평가/실행하지 않았다.** 모의 테스트도 수행하지 않았다. 준비 파일이 실제 NW.js 패키지 생성/실행 완료를 뜻하지 않는다.

`rg -n 'node-main|process 객체|INT-002|3347' docs/` exit0. 관련 공용 대장은 보존하고 이번 준비·미검증 상태를 본 result에만 기록한다. root의 공용 기록 후보는 “문서상 separate context 근거 확인, 소켓 없는6시나리오 하니스 준비; 현재 바이너리/동일객체/실환경 미검증”이다.

## 다음 게이트

QA 종료 뒤 root가 기존 NW.js 실행 경로·실제 버전을 확인하고 고유run 사본에서6시나리오를 한 앱씩 수행한다. ready-before/after, error-before/after, pending, missing. process 식별은 pid 일치가 아닌 node-main closure의 엄격 객체 비교다. 공유되지 않으면 FAIL_CONTEXT_MISSING, entry 부재는 fail-closed. pending2초 후 FAIL_PENDING_TIMEOUT은 진단 실패이며 생산 timeout 정책 추가가 아니다. 실제 오류는 모의 상태라 OS bind 실패 재현으로 세지 않는다.

파일/화면/로그·NW 버전·실행 파일 SHA·시나리오 순서·프로필 격리 근거를 root가 수집해야 한다. 다른 버전 성공을0.111.2 Windows 인수로 바꾸지 않는다. 실제 소켓 오류·패키지 HTTP 진입·성공 응답 정체 검수는 별도다.

사용자세이브 접근0, 실제 NW.js/소켓/게임/빌드/인코딩 실행0, Git0, 설치/외부권한/보안설정 변경0. 기존 후보/생산/공용docs 변경0. 미검증을 PASS로 보고하지 않는다.
