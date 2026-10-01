# BALANCE 공유 악의 후보 실제 파일 회귀

수신/첫 Read UTC 2026-10-01T18:39:27Z. AGENTS/팀 MD/공유 악의 SSOT/실제 양쪽 소스/기존 candidate 및 root 독립 memory16 결과를 읽었다. 동일 prefix에는 task만 존재해 중복 없음, 기존 초안 보존. 첫 코드 Edit·실행 UTC 18:40:14Z, 실행 종료 18:40:14.416Z. 완료/root 인계 UTC 18:40:14Z.

## 실제 파일 14 PASS

기존 `shared-mats-atomic-candidate.mjs`를 읽기 전용 import하여 server.cjs/node-main.js의 실제 GET/POST/helper를 추출하고 vm에서 실행했다. 새 전용 `shared-mats-file-fixtures/run-H3VR4I`의 양쪽 합성 디렉터리만 사용했다. 전체 서버 import/실행이나 HTTP는 없다.

| 각 런타임 경로 7검사 | 실제 결과 |
|---|---|
| 신규 저장 | 실제 JSON bytes/schema와 GET100, 성공 콜백200 확인 |
| 기존 교체 | 실제 파일의 GET4567 확인 |
| 반복/clamp 10입력 | 음수·0·소수·문자·잘못된값·null·undefined·±Infinity·MAX 초과, mats/ts 불변 |
| 부분write 주입 EIO | 실제 fd에 8문자 기록 뒤 오류. 이전 bytes/GET4567 유지, temp0·성공 콜백0 |
| rename 주입 EIO | 나머지 실제 fs, 이전 bytes/GET4567 유지, temp0·성공 콜백0 |
| 없는 부모 실제ENOENT | 실제 OS open 실패; POST 거부, GET200 `{ok:true,mats:0}` |
| 원문 RED | 별도 합성 파일 직접 부분쓰기 뒤 `{"mats":` 손상, 원 GET0 재현 |

고정 ts123456은 fixture 시계이며 생산 Date.now 변경0. 성공 콜백 결과는 HTTP ACK가 아니다. 부분쓰기·rename EIO는 주입 오류이며 실디스크 장애로 주장하지 않는다. 실제 OS 오류는 없는 부모의 ENOENT뿐이다. 모든 합성 파일 4개와 파일별 bytes/SHA를 보존했고 helper 소유 temp는 정리0잔존 확인했다. 정상 성공·반복/오류 후 JSON/GET 검수는 두 경로 모두 실제 실행한 결과다.

명령: `node tools/team-followup-20261001/BALANCE/shared-mats-file-test.mjs`, node --check exit0. Node v24.15.0/darwin arm64. 새 검사 SHA-256 `dd7a7ffbe54b3505095f6fca6a223e7f437bd8a788c6507d780291a4a90dfd46`.

## 입력 보존과 남은 게이트

- server SHA 전후 `441bacbd8a5e0f7ae883e5c9a0a2e0368bf5190f50d2cb0246b89a4e6771bb6d`, node-main SHA 전후 `01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce`.
- 기존 후보 builder SHA `75cb158df4a54569603a4a9855369e72a45d7b135ca0bf07d071141e2b19da1b`; 전용 atomic 기존 산출 전체 전후 SHA 비교 동일. 각 GET/POST/helper SHA와 원 RED/후보 결과, 생성 파일 목록은 `shared-mats-file-evidence.json`에 기록했다. 이전 atomic-file 합성자료는 접근/수정하지 않았다.
- imports: node:fs/path/vm/assert/strict/url/crypto, 기존 전용 candidate(의존 acorn). 설치0. 읽기 전용 Git status 파일 수52로 80/100 경계 미도달; stage/commit/Git쓰기0, 타팀 변경 되돌림0.
- docs 전체 검색은 `shared-mats-file-doc-search.txt`. 공용 docs 수정0. root 동기화 제안: 기존 memory16과 이번 실제 파일14를 구분하고, 생산 미적용 상태 및 아래 미검수 경계를 SSOT에 기록한다.
- fsync/전원손실/크래시/Windows/동시writer/HTTP/앱/실브라우저는 미검수다. 이전 EPERM 서버·재기동 gate는 여전히 미완료이며 이 검사로 대체하지 않는다. production/사용자세이브/네트워크/listen/포트/서버/게임/빌드/권한변경/새 팀·세션·에이전트0.

실제 파일 후보 회귀 한 건 완료 후 root에 인계한다. 생산 반영은 하지 않았으며 다음 범위를 시작하지 않는다.
