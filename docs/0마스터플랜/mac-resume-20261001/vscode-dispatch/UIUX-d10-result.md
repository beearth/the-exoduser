# UIUX-D10-TOOLTIP-CANDIDATE 결과

## 수신·실제 착수·소유

지시문 실제 Read 완료 UTC 2026-10-01T14:00:58Z, 첫 definitions/roll/review/기존 소비자/SSOT Read는 14:01:09Z 이전 완료. 첫 실제 Edit는 전용 영수증·새 모듈·review 연결 apply_patch 성공으로, 14:01:19Z 이후~14:02:06Z 이전이다. 정확한 메시지 도착 및 Edit 시작 초는 UNKNOWN이며 추정하지 않는다.

중복 확인: 전용 d10 산출/영수증 없음. affix 공방의 문서 기반 D10 설명·롤은 존재하나 현재 roll-values.js를 이용하는 동일 한/영 툴팁 소비자는 없다. 기존 화면은 정의 기반 원화 비교만 제공했다. 이전 완료 원화/롤 소비를 다시 구현하지 않았다.

소유 `review.html`, `d10-tooltip.js`, `test/uniqueD10Tooltip.test.js`, 전용 d10 증거/결과/영수증만 작업. definitions/roll/audit/ITEM·BALANCE 후보/공유 테스트/팀 대장/CHANGELOG 수정0. Git 쓰기·새 세션·하위 에이전트·게임·브라우저·서버·빌드 실행0. root QA 정상전투 단독 측정을 방해하지 않았다. 백업은 지시문의 f5292fa0 원격 대조 인계를 근거로 삼았으며 본 세션이 재확인했다고 보고하지 않는다.

## 실제 후보·소비

| 항목 | 구현 계약 |
|---|---|
| 모듈 | `d10-tooltip.js`가 현재 `definitions.js`의 lookupDefinition, `roll-values.js`의 lookupRoll/describeRoll/toStoredValue를 실제 import하여 사용 |
| 대상 | UI-10 / U-D10 / 꺼지지 않는 심갑 단일아이템. 다른21종 카드·게임효과/드롭/저장 활성0 |
| API | describeD10Tooltip(raw=15, language='ko'): 검증된 % 표시와 내부 저장값을 가진 불변 후보. mountD10Tooltip(card, document): UI-10만 허용하고 리프 DOM을 생성·갱신 |
| 선택 | 정의 롤 최소10/산술중간15/최대20. “중간”은 범위의 중간값이며 새로운 롤 등급/분포를 정의하지 않음 |
| 플레이어 표시 | 범위10~20%, 선택10/15/20%, 한국어와 영어 설명을 동시에 표시. 내부0.10/0.15/0.20은 모델 API에만 존재하며 화면 설명/버튼에 노출하지 않음 |
| 의미 | 분노100이상을 **실제로 소모한 성공 지옥강타 직후**, 소비분노의 선택%를 잔여 분노로 복원, 최대30. 단순 시도/실패/미소비 또는 피해 증가로 설명하지 않음 |
| 보존 의미 | 피해는 소모 전 분노 기준 유지, 최대치 도달 효과 재발동 없음. 실제 전투 구현/환급 계산기 추가 아님 |
| 번역 방식 | 게임 `_L(ko,en)`의 명시 한/영 문구 선택 방식과 평서형 문체 재사용. 기존 Hell Slam/Rage 명칭 사용. 게임 전역 OPT/번역 객체에 의존하거나 공유 번역 키를 등록하지 않음 |
| 비활성 안내 | 양 언어로 단일아이템 개발 검토용 후보·미채택·비활성·게임 효과 아님 명시. definitions 상태 변경0 |
| 소비 연결 | 기존22카드를 만든 뒤 실제 .js 모듈 import, UI-10 카드에만 mount. 원본/Seedream44이미지·lazy·64/160CSS·native 버튼·ARIA 유지 |
| 실패 안내 | D10 모듈 실패는 UI-10의 새 리프 role=alert로 안내. 기존 원화 비교와 크기 버튼은 유지. 정의 로딩 실패 경로는 기존 그대로 |

SSOT `유니크_어픽스_리스트.md:155`의10~20%, 저장0.10~0.20, 잔여최대30 및 소모전분노/래치 계약을 확인했다. 새 수치나 효과 정책은 정하지 않았다.

## 독립 검사

| 검사 | 실제 결과 |
|---|---|
| 새 모듈 node --check | exit0 |
| D10 독립6검사 | 6PASS/0FAIL, exit0 |
| D10+기존 롤+정의+감사 | 98PASS/0FAIL, exit0 |
| 기존 review 회귀 원본 | 5PASS/1FAIL, exit1. import 총1개라는 고정 가정이 새 소비 import 추가로2개가 됨 |

독립 테스트는 HTML 실제 스크립트의 import를 Node VM 기본 모듈 로더로 실행하여 현재 정의/롤/툴팁을 소비한다. 성공 경로에서 설명 문자열/모듈을 복제하지 않는다. 실패 경로만 D10 import를 주입 실패로 바꾼다. 부모 textContent/innerHTML 교체는 fixture가 실패시킨다.

10~20 전정수 ×KO/EN22설명을 현재 롤 API와 대조하고 경계밖9/21·소수·문자열·NaN/Infinity·내부저장값0.15 입력을 거부한다. 실제UI-10의10/15/20 선택·양언어 갱신·ARIA, 다른21카드/44경로/실제이미지파일·lazy 보존, 크기선택 독립성과 로딩실패 안내를 검증했다. native 버튼의 실제Tab/Enter/Space·픽셀크기·레이아웃/스크린리더·브라우저HTTP/MIME는 검증하지 않았다. JS 확장자 계약은 확인했으나 새 모듈의 실제HTTP응답을 측정하지 않았다. VM experimental warning은 기록된 도구 경고다.

**VISUAL VERDICT: UNKNOWN. 게임/전투/성능/효과 구현 PASS 아님.**

## root 인계·공유 회귀 정정 후보

기존 review 검사는 root 소유라 직접 편집하지 않았다. `d10-review-test.candidate.diff`에 최소 미적용 정정을 제출했다: import 경로 목록을 definitions.js와 d10-tooltip.js로 정확 검증하고, 실패안내에 포함된 roll-values 문자열까지 금지하던 regex만 완화한다. 이름·이미지 하드코딩/innerHTML 금지와 기존 원화·슬롯·상태 검사 유지. 이 정정은 root 적용/실행 전이므로 공유 전체회귀 PASS로 보고하지 않는다.

docs 전체에서 U-D10/_uSlamEmberRage/지옥강타/Hell Slam/roll-values.js/definitions.js/review.html을 검색해 `d10-doc-matches.txt`에 보존했다. 공유 SSOT·UIUX대장은 수정하지 않으며 root가 “개발 검토용 D10 한영 툴팁 후보 실제소비·게임효과미구현·실시각대기”를 반영한다.

증거: `d10-validation.txt`, `d10-combined-validation.txt`, `d10-existing-review-validation.txt`. 입력·출력해시는 영수증에 기록한다. definitions와 roll SHA는 작업 전후 불변이었다.
