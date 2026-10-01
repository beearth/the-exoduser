# U-D17 실제 소스 어댑터 인계

기존 후보 재작성0, 생산 HTML 수정0. 기본 enabled=false/reviewOnly=false, proposal/runtimeReady=false. Node 실제 원함수·literal fixture **13그룹 PASS** (2026-10-01T16:56:20.382Z). 게임/UI/서버/빌드/인코딩/Git/queue/신규 세션 실행0.

## 구현과 미적용 연결

`d17-source-adapter-callsite.mjs`의 createD17ReviewCalls는 원 fireBlackStar/activateSpikeTrap 함수와 player/getZones/readStoredRoll을 받으며 검토용 새 호출 집합만 반환한다. window나 생산 함수를 자동 교체하지 않는다. 활성 검토는 enabled:true AND reviewOnly:true 필요.

- 반환 activateSpikeTrap은 실제 원함수 실행 전후 새 객체만 출처 등록한다. 원함수 성공/비용/쿨/합체 거부를 그대로 소비한다. 설치 실패·기존 객체는 등록하지 않는다.
- 반환 fireBlackStar는 실제 casting 가드 통과 전 중심 좌표를 캡처하고 원함수 정상 반환 및 true→false 종료 확인 뒤에만 저장롤을 읽는다. 원함수 예외 시 어댑터 종료 호출0. 별도 합성 종료나 lavaSummon 사건으로 추론하지 않는다.
- 고정 infernoSlam/fireAura 생성 literal 직후 반환 onInfernoSlamFixedCreated(zone)를 호출하는 연결안을 제공한다. update의 실제 storm literal 두 지점 직후 각각 onHellRayStormCreated(zone)/onMaliceStormOriginalCreated(zone)를 호출한다. 추적형/보스/자식 경로에는 호출하지 않는다. 해당 연결은 **미적용**이며 전체 update/강타 함수를 복제 실행하지 않는다.
- clear는 맵 전환·로드·사망/취소 등 caller 경계에서 호출해야 한다. 기존 객체 출처와 활성 token은 폐기한다. serial은 유지해 오래된 token과 새 cast를 구분한다. 종료 후 새 casting은 새 token; 동일 종료 중복은 거부.

zone 소유 태그를 추가하지 않고 private WeakMap에 실제 허용 생성 지점의 객체 참조만 등록한다. 출처 등록 API는 신뢰된 검토 호출부용이며 임의 코드가 site 문자열을 위조하는 것을 차단하는 보안 경계는 아니다. U-D13 자식 및 출처 불명/보스는 등록 경로 자체 없음. caller가 거짓 출처를 전달하면 보스임을 독립 검증할 수 없다.

## 보존 및 검수

기존 순수 후보를 재사용하여600px 포함/정수롤1..3/최근접·배열 동률 순으로 선택한다. 최근접/tie는 **검토 정책**, 채택 설계 아님. 선택된 원 객체의 own writable data x/y만 바꾼다. 모든 선택 객체 선검사 후 변경하여 일반 plain object의 frozen 좌표에서 부분변경0. Proxy/악성 접근자/원함수 재진입은 보장 범위 밖이다.

actual fireBlackStar 및 activateSpikeTrap 원문은 AST 추출 실행, 원시적인 시각/SFX 외부 의존만 noop fixture. 실제 storm2/fixed aura literal은 원문 추출+합성 의존 수치로 실행. identity 동일, 비좌표 필드/중첩 참조/t/maxT/dmg/el/틱 상태 보존. 실제 원함수의 기존 VFX RNG는 그대로 실행되며 후보 자체 RNG 추가0. 비활성에서는 저장롤 getter 호출0, 원함수 원동작만 실행.

검사 포함: 종료1회/중복, 재사용/새 cast, clear 오래된 token·출처 폐기/새등록, 활성 이중 opt-in, 불명·보스·자식 경로 거부, follow 불확실 거부, 등록 이후 타입 변경 거부, 실제 fixed/storm literal, 무효 저장롤 재시도 거부,600경계/상한,쓰기불가 사전검사.

원함수/literal 행번호·SHA 및 전체 HTML SHA는 evidence.json에 기록. 작업 중 전체 HTML SHA는 `7631f5a...99993`에서 `a17a1cc...38ed7`로 변했으나 대상 원함수2개·literal SHA는 동일했다. 타팀 동시 생산 변경은 되돌리지 않았다. root는 적용 직전 함수별 SHA 재대조해야 한다.

## 변경 파일·의존성과 팀 문서 전달

소유 신규 파일: receipt.json, candidate.mjs, callsite.mjs, check.mjs, evidence.json, result.md (모두 d17-source-adapter- prefix). 이전 후보/증거 쓰기0.

실행 의존: candidate→기존 d17-zone-selection-candidate.mjs; callsite→candidate. 검사→candidate 및 기존 binding-save-harness.mjs의 extract, acorn, node fs/vm/crypto/assert. 실제 브라우저 import/MIME 확인 미실행 UNKNOWN.

재검사: `node tools/team-followup-20261001/ITEM/d17-source-adapter-check.mjs`.

docs 전체 U-D17/_uBlackZoneGather 검색 및 D절/관련 밸런스 SSOT 확인. 소유 범위 밖 팀 MD/공유docs는 수정하지 않았다. **ITEM_TEAM_MASTER 동기화 제안**: “D17 실제 출처/종료 어댑터13그룹 PASS, 기본 비활성·생산 미연결, private provenance/identity 보존, nearest/tie 검토 정책. 실전 중첩/브라우저/아이템 소비 게이트 미완료.” root 총괄/CHANGELOG 및 팀 문서 반영 담당.

남은 게이트: 검토 호출집합에 실제 caller를 연결하는 UIUX/root 순차 패치, 생성별 source SHA 확인, clear 생명주기 호출부, 검증된 D17 저장롤 공급, 적별 중첩 피해 실전검수. 사용자 세이브/경제/드롭/장착/효과 채택 변경0. 보고서를 제품 적용이나 G5 통과로 해석하지 않는다.
