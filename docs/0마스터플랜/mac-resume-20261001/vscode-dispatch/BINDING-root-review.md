# D10 저장 binding 후보 통합 인수 — 2026-10-01

기준 원격 `10de7cd50ff540b55536a748a4283c2f653c37bf`. 새 제안 인스턴스의 저장값/읽기/툴팁/효과 소비를 Node 후보에서 연결했다. **게임의 생성·드롭·저장 라우터·실제 화면에는 아직 연결하지 않았다.** 실제 사용자 세이브와 원래 서버/PC는 변경하지 않았다.

## 현행 후보 계약

| 대상 | 계약 |
|---|---|
| identity | `uniqueId:'UI-10'`, `slot:'armor'` |
| 저장 필드 | `uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:0.15}` |
| 값 | 10~20 정수%의 정규 소수 .10~.20만 허용. raw는 중복 저장하지 않고 기존 fromStoredValue로 읽는다 |
| 생성 | 명시 신규 생성 호출에만 주입 RNG 정확1회. plain JSON 데이터 snapshot이며 입력/중첩 객체 보존 |
| 읽기 | 필수 identity/slot/binding/schema/value는 own enumerable data 필드. 접근자·직렬화 훅·잘못된 prototype/schema/version/unit/value를 유효 binding으로 인정하지 않음 |
| 복원 | restoreD10Instance는 전달된 로드 객체를 그대로 반환. 신규 생성·수리·재롤·legacy 자동변환 없음 |
| 소비 | readStoredRoll→기존 createD10Consumer; 기본 enabled=false. UIUX는 실제 readD10Binding→기존 tooltip, 항상 active=false |
| 잘못된 값 | legacy/missing/invalid는 툴팁 없음과 상태 설명. 누락 값을 15%로 채우지 않음 |
| 한계 | 임의 Proxy를 실행 격리하는 보안 경계가 아님. 생성 API는 호출자가 새 아이템임을 보장해야 하며 저장된 missing UI10을 보충하는 API가 아님 |

`createNewIdentifiedD10Instance`는 명시 새 생성 fixture/호출자용 포트다. plain JSON 내용만으로 객체의 생성 이력을 증명할 수는 없다. 실제 생산 연결 때에는 fresh mkItem 생성 경로에서만 호출해야 한다. 현재 read/restore/tooltip이 이 생성 API를 호출하지 않는 회귀를 확인했다. 이 제약을 이유로 사용자가 일상 필드명을 선택하도록 반복 질문하지 않는다.

## 실제 검수와 보강

| 단계 | 결과와 의미 |
|---|---|
| ITEM | 24검사. 양쪽 실제 전체 dbSave/dbRestore와 공유저장 함수를 메모리 DB/localStorage에서 가방·장착·창고 각3왕복. 명시 socket/affixes fixture 범위 |
| UIUX | 독립8+실제 ITEM 생성/JSON/read 연결15=23검사. 한영11정수와 부정/누락/legacy 표시 거부 |
| BALANCE | 6그룹. 실제 후보42행(신규6+legacy36), 신규 RNG6/로드0, 부정 schema90표본, 중복생성 거부 |
| BUILD 원 감사 | 16 assertion/9반례 기록. assertion PASS는 결함 재현 포함이며 합격이 아님 |
| root 보강 | toJSON/접근자 실행, 직렬화되지 않는 inherited/nonenumerable 필드, 생성포트의 inherited identity를 거부. 원 제출2파일은 root-review/binding-before에 원문 보존 |
| root 최종 | 위 후보/소비/독립 검사와 신규8경계 포함 **61 PASS**. BUILD 추가 보강 검수는 별도 최종 영수증 참조 |

BUILD C2~C7을 근거로 생성 입력을 부작용 없는 plain JSON 데이터로 제한하고, 조회 시 필수 필드를 descriptor에서 읽어 getter를 호출하지 않게 했다. 저장값은 한 번만 읽는다. 생성의 비정규 입력은 RNG 호출 전 실패한다. 소유 코드 보강은 root가 맡았고 기존 ITEM/UIUX/BALANCE는 다음 지원 작업으로 전환했으므로 binding 파일 충돌은 없다.

BUILD C1은 신규 생성 API를 loaded missing 객체에 잘못 호출할 수 있다는 호출자 경계다. 자동 복원 재롤이 실제 연결됐다는 뜻은 아니다. C8은 기존 dbRestore의 소켓 마이그레이션 RNG이며, 이 후보가 없앤다고 주장하지 않는다. 기존 affixes=[] 보충도 유지된다. 전체 구세이브의 모든 필드/전체 RNG가 항상 불변이라는 주장 대신 D10 저장롤 재추첨0과 canonical fixture 왕복을 입증한다.

원 감사 첫 실행은 소켓 필드 누락으로6FAIL, 다음은 기존 affixes 보충으로4FAIL이었다. BUILD가 기존 마이그레이션과 후보 결함을 구분해 canonical fixture로 검증했고 최초/두번째 원자료도 보존했다. root 보강 전 ITEM 두 모듈 SHA는 `before-hardening.json`, 최종 raw검사는 `root-final-tests.txt`에 있다. 과거 팀 제출 SHA/영수증은 당시 증거로 유지하고 root 보강 후 최종 SHA를 별도 기록한다.

실제 DB 서버/계정/사용자 저장·브라우저/MIME·실전 명중·패키지 검수는 하지 않았다. `.mjs`는 Node 후보이며 실행 중3340 서버에 직접 브라우저 import하지 않았다. 정의22종 enabled=false, 아트 채택0, runtimeReady=false는 유지된다.

## 후속 지원 배정과 11팀 상태

이번 주기 native getApp은 다시 Mac locked를 반환했다. Claude agents 조회의 기존7팀은 idle이다. 기존 초안·대기열은 잠금 때문에 UNKNOWN이며 미수신 영수증과 구분한다. 원 ART/SKILL/ENEMY 폴더와 세션은 보존하고 지원자가 별도 소유 경로에서만 수정한다. 원담당 새 수신이 확인되면 충돌 없이 멈추도록 명시했다.

| 원 작업 | 지원 담당·소유 | 전송과 실제 착수 |
|---|---|---|
| ENEMY-TICK-UNKNOWN-FIX | ITEM/enemy-support-* | 14:25:02Z 기존 ITEM queue 성공, 원 probe/검사 실제 Read 확인 |
| ART-FINAL-CROP-FIX | UIUX/art-support-* | 14:25:37Z 기존 UIUX queue 성공, 실제 source Read/후보 fileChange 확인 |
| SKILL-RECHARGE-EXCEPTION-FIX | BALANCE/skill-support-* | 14:25:37Z 기존 BALANCE queue 성공, 실제 원 probe Read/영수증 fileChange 확인 |
| binding 독립 인수 | BUILD/continuation-binding-* | 원 감사 실제 반례 제공, root 보강 뒤14:27:53Z 후속 검수 queue |

BUILD는 검수·배정안 준비, root는 기존 승인된 공식 전달·단일 실게임 QA·최종 Git 인수를 맡는다. BUILD readonly DB queue 실패는 재시도하거나 권한을 바꾸지 않았다. 기존 4 Codex 세션을 사용했고 새 세션/팀/하위 에이전트0이다. UIUX/BALANCE의 예전 ITEM 미도착 대기는14:23:28Z/29Z 실제 API Read와 새 연결 코드로 해소했다.

QA 첫처치/밀집 회귀는 앞 주기 INCONCLUSIVE, MAP 실제8뷰·ANIMVFX90Hz·SOUND 실청취·BUILD NW 패키지는 미검수 상태를 유지한다. 게임 측정은 현재 종료 상태. 앱의 interrupted 표시만으로 외부CLI 종료를 단정하지 않으며 실제 Read/Edit·완료 영수증을 구분한다. 정확한 전체 스냅샷은 TEAM_UTILIZATION_20261001.json과 outputs/team-utilization-20261001.json에 기록한다.

BUILD 후속에서 VM의 다른 realm JSON을 root의 동일 prototype 검사로 거부하는 storage2FAIL을 재현했다. root는 native Object constructor/prototype descriptor를 대조해 cross-realm JSON을 허용하고 inherited schema 거부를 유지했다. 새 회귀 포함61PASS. 원 실패는 보존하며 최종BUILD재검수는 전용 결과로 구분한다. N1: inspector의 valid는 필수 binding schema 판정이며 임의 nested metadata 전체의 직렬화 안전 보장이 아니다. 생성은 깊은 plain JSON을 강제하고, 생산 연결 전 persistence 경계 계약을 확인해야 한다.

BUILD가 최종소스를 실제import하여24검사 PASS/0FAIL을 확인했다. 저장VM객체를 외부clone으로 바꾸지 않고 cross-realm 원객체의 valid/missing 및 C2~C7 거부회귀를 통과했다. 최종 evidence의 소스SHA와 현재디스크가일치한다. N1의필수schema/전체메타데이터경계·생산연결게이트는유지한다.
