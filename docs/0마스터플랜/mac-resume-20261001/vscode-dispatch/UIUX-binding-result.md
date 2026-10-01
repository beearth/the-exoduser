# UIUX-D10-BINDING 결과

## 수신·Read·Edit·의존

- 기존 공식 배정 수신 뒤 continuation-dispatch-plan·최신 D10 결과·현재 tooltip·SSOT를 읽었다. 첫 명령 완료 UTC 2026-10-01T14:16:13Z. 메시지 도착의 정확한 초는 UNKNOWN.
- 첫 실제 Edit는 영수증·독립 어댑터·fixture test를 만드는 apply_patch 성공. 14:16:19Z 이후~14:17:27Z 이전이며 시작 초를 추정하지 않았다.
- 처음에는 binding 중복 산출과 ITEM API가 없었다. 14:17:31Z 재조회에서 ITEM/BALANCE 수신·진행 영수증은 확인했지만 ITEM binding 실제 모듈/최종 읽기 API는 아직 없었다. 다른 팀 영수증 읽기는 실제 코드 의존 인수와 구분한다.
- root의 D10 188PASS/체크포인트는 사용자 인계로 확인한 별도 작업이다. 이 세션의 독립검사 수치와 합산하지 않는다.

## 실제 독립 코드

| 산출 | 계약 |
|---|---|
| binding-tooltip.mjs | 현재 definitions의 lookupItemProposal, roll-values의 fromStoredValue, d10-tooltip의 describeD10Tooltip 실제 재사용 |
| createStoredD10TooltipConsumer(readBinding) | 입력 instance를 불변·불투명 상태로 읽기 포트에 전달. ITEM 저장 필드·버전·이름을 새로 정하지 않음 |
| 읽기 포트 | `{kind,uniqueId,effectId,stored}`는 **UIUX 내부 정규화 포트 결과**다. JSON 저장 구조/ITEM API 계약이 아님. 실제 ITEM 결과는 확인 후 별도 연결로 정규화 |
| 성공 | 적격 UI-10 armor, proposal 정규화 결과, UI-10/U-D10 일치, 유효 canonical 저장 롤일 때만 기존 tooltip(raw,KO/EN)을 호출. 모든 결과 active=false |
| 실패 닫힘 | legacy/missing/invalid/dependency-pending은 tooltip=null이며 정상 복원 설명/10~20%/중간15 기본값을 표시하지 않음 |
| 저장 롤 | fromStoredValue로0.10~0.20 전정수를 정확히 복원. 잘못된 타입/NaN/Infinity/범위밖/비정규 소수/필드부재 거부. 없는 롤을 기본15로 만들지 않음 |
| 화면 소비 | mountStoredD10Tooltip은 빈 리프에만 설명·기존 주의문·미채택/비활성 안내를 작성. 부모교체 금지. 공유 review/tooltip에는 연결하지 않음 |
| 부작용 | 어댑터가 저장/RNG/드롭/효과/활성화를 호출하지 않음. 기존 인스턴스·레거시 uniqueSpecial·유골함 변환 없음 |

상태 메시지는 한·영 구분하며 기존 정상 tooltip의 문구를 복제하지 않는다. 다른 고유ID/잘못된 슬롯은 D10 정상효과로 취급하지 않는다. ITEM reader 예외·비동기 Promise·불명 상태도 invalid로 닫힌다. 독립 포트는 동기 읽기 계약이며 실제 API가 다르면 임의 추정하지 않고 연결 게이트로 남긴다.

## 독립 검수

`node --check tools/team-followup-20261001/UIUX/binding-tooltip.mjs` exit0, 독립 `binding-tooltip.test.mjs` **8PASS/0FAIL** exit0, 검사 종료 UTC14:17:27Z. 원자료 `binding-validation.txt`.

10~20 전정수 ×KO/EN22결과를 실제 기존 tooltip과 동일성 대조했다. legacy/missing/invalid/의존미도착이 정상효과로 표시되지 않음, 잘못된 저장값, 읽기예외, UI-10 외 아이템, 입력불변, 리프DOM·비활성주의문을 검증했다. WeakMap fixture의 JSON 왕복은 저장 **형식을 정하지 않고** loaded instance에 외부descriptor를 연결한 독립 준비 검사다. ITEM의 실제 저장binding JSON 왕복을 검증한 것으로 보고하지 않는다.

## 독립 준비 당시 의존 대기 이력

최종 의존 재조회 UTC14:18:31Z: ITEM binding 실제 모듈 없음. 독립 코드 준비 완료 상태이며 전체 연결 완료가 아니다. 현재4공유입력 tooltip/definitions/roll/review SHA는 시작값과 일치했다. 실제 의존 인수시각은 null로 유지한다.

당시 ITEM 실제 API 모듈/명시 저장 결과가 없으므로 연결을 보류했다. 아래 후속 실제 인수로 미도착 대기는 종료했다.

공유파일 쓰기·Git·게임·브라우저·빌드·새세션·하위에이전트0. 생산활성/드롭/레거시세이브변경0. 브라우저/키보드/실시각/게임 전투와 실제 저장UI는 미검수. **VISUAL VERDICT: UNKNOWN**.

docs 전체 U-D10/_uSlamEmberRage/uniqueId/재롤/binding 검색 결과는 `binding-doc-matches.txt`. 공유 SSOT/팀대장은 root가 반영한다. 입력 tooltip/definitions/roll/review 해시는 전용 영수증에 보존한다.

## 실제 ITEM 도착·연결 인수

후속 배정에 따라 2026-10-01T14:23:28Z에 ITEM의 실제 `binding-ports.mjs`와 `binding-d10.mjs`를 읽고 해시를 기록했다. 연결 산출 중복 없음. 정확한 메시지 도착 초는 UNKNOWN. 첫 연결 Edit는14:23:36Z 이후~14:24:23Z 이전 apply_patch 성공이다. 독립 준비 당시 미도착과 실제 코드 인수를 구분한다.

| 실제 API | 확인·연결 |
|---|---|
| readD10Binding(item) | inspect의 valid만 `{kind:'proposal',uniqueId,effectId,stored,version,runtimeReady:false}`로 전달. 나머지는 legacy/missing/invalid 판별 결과 |
| binding-item-tooltip.mjs | readD10Binding을 직접 import하여 기존 createStoredD10TooltipConsumer의 읽기 포트에 전달. schema/status 추정·변환·저장 필드 추가 없음 |
| createNewIdentifiedD10Instance(base,rng) | 새 명시 UI-10 identity를 실제 ITEM 생성 API에 전달. 생성 RNG만1회 |
| 저장 스키마 | 실제 ITEM D10_BINDING_SCHEMA의 uniqueRoll/version1/U-D10/fraction 계약을 읽기 확인. 어댑터는 해당 필드를 직접 읽거나 다시 정의하지 않음 |
| restoreD10Instance | JSON.parse된 instance를 그대로 반환하는 실제 restore 포트 재사용 |

### 실제 연결 검사

`binding-item-tooltip.test.mjs` 15검사 + 기존 독립8검사 = **23PASS/0FAIL**, exit0, 종료UTC14:24:23Z. 새 어댑터 node --check exit0. 원자료 `binding-connected-validation.txt`.

실제 ITEM 생성→JSON.stringify/parse→restore→readD10Binding→UIUX 어댑터→현재 d10-tooltip→리프 소비를 실행했다. 10~20 전정수11개 모두KO/EN, 각3회 반복 소비를 대조했다. 생성RNG1회 유지·로드/읽기/툴팁 재롤0, 입력/저장JSON불변, 화면%표시·비활성주의문을 검증했다. legacy/유골함/missing/invalid/잘못된version·unit·effect/stat·저장값·ID/슬롯은 정상효과표시를 거부했다. ITEM API가 검증하지 않는 가상의 status 필드를 만들어 채택 여부를 추정하지 않았다.

실제 ITEM dbSave/dbRestore VM 검사24PASS는 ITEM 인수 자료이며 이번 UIUX 실행 수치에 합산하지 않는다. 이 세션은 실제 ITEM 생성/JSON/읽기/툴팁 경로를 검증했고 실제 사용자DB·게임저장UI·브라우저는 실행하지 않았다.

### 최종 바이트 대조·남은 게이트

| 모듈 | 최초/최종 SHA256 |
|---|---|
| ITEM/binding-ports.mjs | 0adc51835eba68b1cc693267cb08e616b81a4b78c55e8368260b545f91b80e0c |
| ITEM/binding-d10.mjs | 1511e771a2f44e877a0b1ffd46dddc1a5c06d3d510340419982117b5033f4507 |
| UIUX/binding-item-tooltip.mjs | 2fc6d83648d26710f71933f08251691b8b60ff612232235999845a0b24e417fc |
| UIUX/binding-item-tooltip.test.mjs | 536e9f3443168d5c7c07306efe6ae06a84a693981858833a012aeb9a8028d5bc |

14:24:37Z에 ITEM 최종 완료 영수증을 읽고 두 실제 모듈 바이트를 한 번 더 대조했다. 최초 인수 해시와 모두 같으며 관찰된 작업중변화0. 공유 tooltip/definitions/roll/review4파일도 시작해시 불변. 입력이 이후 변경되면 이 검수는 해당 변경본을 포함하지 않는다.

docs 전체 검색은 실제 연결 후 readD10Binding/uniqueRoll을 포함하여 다시 수행했다(exit0). root가 공유SSOT·통합문서를 반영한다. 남은 게이트는 root 인수/체크포인트·생산 연결 승인·실제UI/시각 검수이며 **ITEM API 미도착은 더 이상 게이트가 아니다**. 공유tooltip/review/ITEM파일/생산/레거시세이브 변경0, Git·게임·브라우저·새세션·하위에이전트0. 다른 새 승인수정지원 범위는 시작하지 않았다.
