# D10 binding 통합 전 독립 감사

**판정: RETOUCH / 생성 진입 경계 보강 후 root 인수.** 실제 ITEM API를 import하여 독립 반례를 재현했다. 16개 assertion PASS는 반례검출 포함이며 binding 전체 합격이 아니다. 생산/타팀 변경·queue·새세션·게임/브라우저/서버/Git0.

## 실제 Read·validation

첫Read2026-10-01T14:24:02Z: ITEM/binding-d10.mjs, binding-ports.mjs 목록·내용. 이어 binding-save-harness/test, 현행 definitions/roll-values, UIUX/BALANCE 실제API, ART/SKILL/ENEMY 수정 지시와 소스를 읽었다. 사용자 인계한 root의 UIUX/BALANCE 실제API 과제 수신14:23:23Z를 존중해 재배정·메시지0. 이전readonly DB/EPERM 재시도0.

독립 실행 `node tools/team-followup-20261001/BUILD/continuation-binding-audit-check.mjs`:

| 단계 | 결과 | 의미 |
|---|---|---|
| 최초 | exit1,8PASS/6FAIL | 소켓필드 없는 armor가 현재 dbRestore `_fixCr`에서 RNG 호출. 실패 원자료 first-evidence.json 보존 |
| 두 번째 | exit1,12PASS/4FAIL | socketCount/crystals를 명시하니 bag/equipped에 기존 affixes=[] 마이그레이션 차이가 드러남. second-evidence.json 보존 |
| 최종14:25:48Z | exit0,16PASS/0FAIL,9반례기록 | canonical socket/affixes fixture의 양쪽3저장위치6회귀 통과, 별도로 기존 RNG 마이그레이션 검출2건 유지 |

기존 숫자10~20 재검사를 복제하지 않았다. bag/equipped/storage에서 legacy uniqueSpecial/알수없는 schema version/opaque extra/누락binding 보존 및 생성·restore 경계가 핵심이다. 실제 dbSave/dbRestore를 acorn 추출한 ITEM harness로 VM 실행했다. DB/localStorage는 메모리 대역; noop 및 canonical 자원설정 범위 밖 실제 계정/장비세이브 검수는 아니다. 기존 ITEM 테스트를 실행하지 않아 그 evidence 파일을 덮어쓰지 않았다.

## 독립 반례·영향

| ID | 재현 | 근본 계약·권고 |
|---|---|---|
| C1 | createNewIdentifiedD10Instance가 기존 id와 UI-10이 있고 binding없는 객체를 받아 동일id로 RNG1회/valid binding 생성 | 공개create port는 fresh와 loaded missing-instance를 구별하지 못함. restore는 그대로 반환하므로 자동 재롤 버그가 이미 연결됐다는 뜻은 아님. 생성전용 호출경계/고유인스턴스 identity 근거를 root가 확정; 단순 category uniqueId는 생성권한이 아님 |
| C2 | newItem의toJSON이 unique=true/uniqueSpecial/_uSlamEmberRage를 넣어도 guard 통과 후 RNG·binding 생성 | 직렬화 **후** snapshot에 동일 legacy/identity guard 재검사 필요. 지원 입력을 plain enumerable JSON data로 제한하고 setter/getter/toJSON 부작용 계약을 명시. JSON clone만으로 검증됐다고 선언하지 말 것 |
| C3 | schema 필드를 prototype에 가진 binding이valid; JSON왕복 뒤invalid | 필수필드는 own enumerable data라는 schema 또는 plain JSON 생성/읽기 경계 보장 필요 |
| C4 | own nonenumerable uniqueRoll은valid; 저장뒤missing | owns만으로 저장호환 보장 불가. 생성 결과는현재plain이지만 외부instance 소비 계약은 좁혀야 함 |
| C5 | uniqueRoll getter가throw하면 inspect의invalid 반환 대신예외 | getters/Proxy 등을 거부하거나 안전한외곽catch로fail-closed 결과 반환. JSON로드객체에는getter가없으므로 저장파일공격으로 확대해석하지 않음 |
| C6 | storedValue getter가반복실행됨 | 반환값의일관성/읽기부작용·외부RNG보장불가. 현재모듈이RNG를직접부른다는뜻아님. own data snapshot에서1회만읽기 |
| C7 | inherited uniqueId를가진base도create port가UI-10새생성으로인정 | port의explicit identity를own data필드로검증; category와instance freshness를분리 |
| C8×2 | 양쪽dbRestore가socketCount없는armor의소켓마이그레이션에서Math.random 호출 | 기존소스계약. D10 roll 재롤과기존 crystal migration RNG를구분. 전체restore RNG0은canonical socket필드범위에서만입증됨 |

**우선순위:** C1/C2의생성경계는연결전필수. C3~C7은exotic runtime input 방어/지원범위명시이며plain JSON저장객체에서모두재현되는결함이라고하지않는다. 프로덕션기능은아직비활성이므로게임피해/저장손상발생으로보고하지않는다.

원본legacy의모든필드무변을일괄보장하지않는다. dbRestore 기존affixes보충·socket RNG migration은원코드동작이다. 이번6회귀는그기본schema를명시한뒤D10관련필드와unknown payload 보존을확인했다. D10 read/restore에는명시rollValue호출이없고restoreD10Instance는identity반환한다. load가create port를호출하지않도록호출자회귀가필요하다.

## 소스 호환·해시

현재 game/easy 전체와 실제추출 dbSave/dbRestore 및 ITEM3모듈/definitions/roll-values/지원3소스 SHA는 continuation-binding-audit-evidence.json에있다. 이는현재읽은디스크관측이며remote SHA나원담당의헤더에적힌과거hash가아니다. production diff 적용/무조건복사0. 함수추출은acorn/유일anchor검사이며실제현재양쪽저장함수가컴파일·canonical 왕복된다. 원본harness가계산했지만사용하지않는root/owned/hash변수는무관한정리대상으로수정하지않았다.

관련 docs 키워드 uniqueRoll/uniqueId/U-D10/OK_FULLFRAME/FAIL_NO_FIRE/legitRecharge 전체검색은 continuation-binding-audit-docs.txt에보존. root 동기화제안: 저장schema의생성전용경계·missing/legacy불변·canonical소켓필드와D10 RNG의범위·prototype/getter지원범위를정확히기록. 공유SSOT는수정하지않았다.

## 별도 지원경로 권고 (배정/실행 아님)

Mac locked/7Claude idle은root 최신확인 인계. drafts/pending queue는UNKNOWN이므로원담당폴더는읽기전용으로유지한다. 기존UIUX/BALANCE binding과제에추가메시지하지않았다. root가담당을지정한뒤다음 **별도 신규 support 경로**를쓸것을권고한다.

| 수정지시·읽은소스 | 추천지원소유경로 | 구체인수조건 |
|---|---|---|
| ART-FINAL-CROP-FIX / ART/wa24-delta-probe.cjs | 별도승인 support/finalcrop-20261001/ | 원본hash고정→clip/center translate/zoom/inverse/cover/shake 전체행렬로4해상도×400/1200/2399ms계산. 기존0손실반례→16:9세로합산6.34755/4.76190/3.84615%대조. 시간축회귀유지, fade0로가시성PASS금지; 눈/발/자막은픽셀없으면UNKNOWN |
| SKILL-RECHARGE-EXCEPTION-FIX / SKILL/ice-cancel-probe.safe.js | 별도승인 support/recharge-exception-20261001/ | rech100→99/stk0→1/조준취소를리젠확정하지않고update근거부족UNKNOWN. 초기readRaw throw/rAF throw/각remove 실패주입에도나머지정리·예약회수·오류기록. 원본66회귀유지,실제충전단위소스대조 |
| ENEMY-TICK-UNKNOWN-FIX / ENEMY/et3-probe.fixed.js | 별도승인 support/tick-unknown-20261001/ | getTick null/NaN/Infinity/stalled/backward +451rAF를INCONCLUSIVE,수치tick과rAF분리. 정상단조tick PASS대조·첫commit후판정·wrapper소유권/타wrapper불변·cleanup 회귀유지 |

해당 support/*는권고만이며이번BUILD허용쓰기범위가아니다. 파일생성/수정·지원담당배정은하지않았다. root 승인시절대경로·담당·원담당대기와원본hash를명시하고clone만사용한다. 기존과제의실수신/진행이바뀌면중복지원금지.

최종: 독립감사와반례제출완료;binding생산인수는수정/계약결정후. outbound queue0,readonly DB권한변경0,새세션0,원담당폴더쓰기0. root는본전용결과파일로인수한다.
