# BALANCE-PM009-ROLL-UNITS 결과

## 수신·실제 착수·완료

2026-10-01T13:44:06Z 수신. 배정·팀 최신 MD·definitions·적용 계약·D절 수치/저장 계약과22행을 읽었다. 모듈/전용 테스트/영수증·동일 roll 증거가 없어 중복이 아님을 확인했다. 첫 Edit는 전용 영수증, 다음 Edit는 실제 `unique-item-project/roll-values.mjs`와 `test/uniqueRollValues.test.js`다. 완료는 **독립 모듈 구현·검수**이며 게임 등록/저장 활성화 완료가 아니다.

## 명시 데이터

UI-XX는 U-DXX와 대응한다. `%`는 정수 raw÷100 저장, frame/count/rage는 정수 그대로 저장한다. stat는 definitions의 효과 레지스트리를 import하여 대응한다. 각 구간은 문서 그대로이며 계산으로 재등분하지 않는다.

| UI/U-D 번호 | 단위 | 전체 | 하 | 중 | 상 |
|---|---|---|---|---|---|
| 01 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 02 | percent | 30~50 | 30~36 | 37~43 | 44~50 |
| 03 | frame | 20~40 | 20~26 | 27~33 | 34~40 |
| 04 | frame | 60~180 | 60~100 | 101~140 | 141~180 |
| 05 | percent | 10~30 | 10~16 | 17~23 | 24~30 |
| 06 | percent | 10~30 | 10~16 | 17~23 | 24~30 |
| 07 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 08 | percent | 25~45 | 25~31 | 32~38 | 39~45 |
| 09 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 10 | percent | 10~20 | 10~13 | 14~16 | 17~20 |
| 11 | frame | 120~300 | 120~180 | 181~240 | 241~300 |
| 12 | frame | 60~120 | 60~80 | 81~100 | 101~120 |
| 13 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 14 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 15 | percent | 25~45 | 25~31 | 32~38 | 39~45 |
| 16 | count | 2~4 | 2 | 3 | 4 |
| 17 | count | 1~3 | 1 | 2 | 3 |
| 18 | percent | 1~3 | 1 | 2 | 3 |
| 19 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 20 | percent | 20~40 | 20~26 | 27~33 | 34~40 |
| 21 | rage | 20~40 | 20~26 | 27~33 | 34~40 |
| 22 | percent | 20~40 | 20~26 | 27~33 | 34~40 |

## root 소비 API

| API | 계약 |
|---|---|
| `ROLL_PROPOSALS` | 동결된22개 제안/단위/전체 및 명시 bands/stat. 각 status=proposal/runtimeReady=false |
| `lookupRoll(id)` | UI-XX 또는 U-DXX 엄격 조회; 오타/미등록 ID RangeError |
| `rollValue(id,rng)` | RNG 함수 필수, 유한 number `[0,1)` 정확히1회. 동일폭 정수 bin 선택 후 describeRoll 반환. 잘못된 ID는 RNG0회 |
| `toStoredValue(id,raw)` | 정수/범위 확인 후 percent÷100, 나머지 그대로 |
| `fromStoredValue(id,stored)` | 유한 숫자·정규 단위·범위 엄격 확인. %는 가장 가까운 raw를 찾되 재인코딩한 `raw/100===stored`가 아니면 거부. 반올림으로 손상 저장을 수리하지 않음 |
| `describeRoll(id,raw)` | raw/stored/stat/unit/band/displayValue/displayUnit/text/exactDisplay/status/runtimeReady 반환. RNG 호출 없음 |

프레임 표시는 `Number((raw/60).toFixed(2))`로 소수2자리 반올림 후 끝0을 생략한다. JS 이진부동소수 반올림임을 결과 displayRule에 명시했다. 20f→0.33초 표시지만 exactDisplay={numerator:20,denominator:60}와 raw20을 함께 제공해 손실없이 검수 가능하다. %는 정수 % 표시, D16은 발/D17은 개/D21은 분노다. `text`는 수치만이며 효과 설명·번역 완성 툴팁이 아니다.

RNG 선택은 `index/count` 경계 비교 이진탐색으로 bin을 정한다. 단순 `floor(sample*count)`가 이진표현 경계에서 직전 bin으로 떨어지는 오류를 피한다. 가중치·구간별 재롤·통계 분포 변경은 없다. RNG 공급자가 균등일 때 각 정수 bin은 균등 선택이며 RNG 자체의 품질/게임 드롭 빈도는 검사하지 않는다.

## 검사·원자료

| 실행 | 결과 |
|---|---|
| `node --test test/uniqueRollValues.test.js` | exit0, **69PASS/0FAIL/0SKIP**. 22ID 각 문서 대조/모든 raw JSON왕복/모든 균등 bin 경계 직전·동일·직후/부정 입력. 전체698개 정수 값 |
| `node --check unique-item-project/roll-values.mjs` | exit0 |
| `node tools/team-followup-20261001/BALANCE/roll-evidence.mjs` | exit0. 22행과 하/중/상 양끝 표시·저장값, 입력문서/정의/모듈/테스트 SHA256 포함 |
| `rg -n 'U-D[0-9]{2}|롤|저장 단위|roll-values' docs/` | exit0, docs 전체 검색 완료 |
| 기존 `uniqueDefinitions` 및 `uniqueDefinitionAudit` 테스트 | exit1,22PASS/1FAIL. 기존 테스트가 review.html 내부 리터럴 이름을 기대하는 assert 실패. review는 UIUX 소유이므로 수정하지 않았다. 새 롤 모듈 검사 통과와 구분 |

원자료: 소유 폴더 `roll-tests.txt`, `roll-raw.json`, `roll-doc-search.txt`, `roll-adjacent-tests.txt`. 최초 새 검사68PASS/1FAIL은 D01의 **각 20~40%** 표현에 대해 테스트가 숫자 앞에 즉시 bold를 기대한 파서 오류였다. 실제 문서 강조 안의 범위를 확인하도록 수정하고69개 전부 재실행했다. 문서 숫자는 변경하지 않았다.

## docs 인계·남은 게이트

D절의 롤/저장 제안과 실제 모듈값은22행 일치한다. root가 적용 계약·팀 대장에 ‘22종 독립 롤/단위/표시 모듈 구현69PASS, audit 소비 연결·게임/저장/효과 활성 미완료’를 추가하는 후보로 인계한다. D절의 효과 미구현 상태/A~C 현행 설명은 유지한다. 이번 소유 전용 결과에 API·숫자·단위·표시 규칙을 기록했고 공유 docs는 직접 수정하지 않았다.

audit-definitions 소비 연결은 root 담당이다. UIUX review.html/해당 테스트·definitions·생산 두 게임·기존 A~C·원화·사용자저장 편집0. 새세션/하위에이전트/Git쓰기/게임/서버 실행0. 효과/드롭·툴팁 번역·실UI·실제 가방/장착/창고 저장·패키지는 미검증이며 이 모듈은 이를 활성화하지 않는다. 기존 잘못 저장된 % 정수값을 자동 변환하거나 재롤하지 않는다.
