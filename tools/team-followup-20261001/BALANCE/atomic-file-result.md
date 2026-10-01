# BALANCE ATOMIC-FILE — 실제 파일 검수

완료·인계 UTC: 2026-10-01T18:15:12Z. acorn 8.16.0, 문법 검사 exit0.

수신/첫 Read UTC: 2026-10-01T18:14:13Z. AGENTS/팀 MD/저장 SSOT/실제 server.cjs를 읽고 동일 prefix가 task뿐임을 확인했다. 기존 초안·타팀 변경은 보존했다. 첫 코드 Edit UTC: 18:14:48Z.

## 결과: 실제 소유 파일 I/O 7 PASS

acorn AST에서 생산 `atomicSaveJSON` 함수 선언과 `atomicSaveSequence` 변수 선언만 추출해 vm에서 실행했다. 서버 전체 import/실행은 하지 않았다. 전용 `atomic-file-fixtures/run-0bH7Wj`에 합성 슬롯만 만들고 기존 bytes와 새 bytes를 실제 fs로 대조했다. 모든 원자료 파일은 보존했다.

| 검사 | 실행·판정 |
|---|---|
| 신규 생성 | 실제 fs open/write/close/rename, 정확한 JSON bytes |
| 기존 교체 | 실제 fs, 새 JSON bytes 일치 |
| 반복 저장 | 실제 fs, 후속 snapshot 정확히 교체 |
| 부분쓰기 EIO | write만 대역: 실제 fd에 17문자 쓴 뒤 주입 EIO. 원파일 bytes 보존, 소유 temp 정리 |
| rename EIO | rename만 주입 EIO. 나머지 실제 fs, 원파일 bytes 보존, 소유 temp 정리 |
| 없는 부모 | 실제 OS open ENOENT, 생성 없음 |
| 독점 wx 충돌 | 대역 open에서 충돌 파일을 wx로 선생성한 뒤 실제 open 수행: OS EEXIST. 기존 JSON/충돌 파일 보존 |

앞 6검사는 임시 파일 잔존0을 확인했다. 마지막 충돌 파일 `collision.json.tmp-57302-7`은 helper 소유가 아니므로 의도적으로 남겨 보존을 확인했다. 생성파일 6개 각각의 bytes/SHA와 실제·주입 오류는 `atomic-file-evidence.json`에 기록했다. 실패 주입을 실디스크 장애라고 부르지 않는다.

실행 UTC: 2026-10-01T18:14:48.107Z–18:14:48.110Z. 명령: `node tools/team-followup-20261001/BALANCE/atomic-file-test.mjs`. 로그: `atomic-file-tests.txt`. 환경: Node v24.15.0, darwin arm64. node --check도 exit0.

## 고정 입력·의존성

| 대상 | SHA-256 |
|---|---|
| server.cjs 전/후 동일 | 6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538 |
| atomicSaveJSON AST 원문 | ae903a49526f7607a4132772a44b75a6ce9960be8cfaa96bdb51c1b932cd27ea |
| sequence AST 원문 | a722c9ef4449068b807e3092eaab5e5b7e963efa216a049910670367336c1fd8 |
| 전용 검사 | 56d2890269c25aeb936970235da1ed0f916950d7803b6bdcc5c45c29732183bf |

imports: node:fs/path/vm/url/crypto/assert/strict, 설치된 acorn. 외부 설치0. 기준 checkpoint 8e4ed4e446329c863ed4d2d556d386c37f3ae310은 task의 전달값이며 Git으로 독립 조회하지 않았다. 실제 server SHA는 전달값과 일치했다.

## 한계·인계

이 검사는 해당 Mac에서 정상 파일 교체·일부 오류 경계만 검수했다. 전원손실/프로세스 크래시/fsync/디렉터리 sync/Windows/동시 여러 프로세스 저장은 미검수다. HTTP ACK·서버 종료/재기동·앱/실브라우저와 저장 복원은 검수하지 않았다. 이전 EPERM 디스크/HTTP 통합 gate는 여전히 미완료이며 이 파일 I/O 검사로 대체하지 않는다.

production·HTML·공유 docs·팀 MD·다른 담당 파일 수정0. docs 전체 키워드 검색은 `atomic-file-doc-search.txt`에 기록했다. docs 동기화 제안: root는 생산 반영된 원자 교체 상태와 이번 실제 파일 검수/미검수 경계를 저장 SSOT에 반영하고, 이전 미적용 후보 기록은 당시 이력으로 유지해야 한다. 최신 사용자 prefix 한정 지시에 따라 직접 공용 문서를 수정하지 않았다. 네트워크/listen/포트/API/실서버/사용자세이브/게임/빌드/Git/권한변경/새 세션/에이전트0. 이번 한 건 후 root 인계한다.
