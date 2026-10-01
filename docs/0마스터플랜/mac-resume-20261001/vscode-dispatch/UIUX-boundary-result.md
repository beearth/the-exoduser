# UIUX-HOTPATH-BOUNDARY-FIX — 별도 bounded 후보

## 수신·착수·보존

BOUNDARY_TASK 첫 Read 종료 UTC2026-10-01T12:40:19Z, v2/v1 변환·geometry·bucket 및 중복 검색/해시 Read 종료 UTC12:40:25Z. 동일 과제 지시 외 진행 영수증/bounded 구현은 없었다. 기존 완료 결과도 읽어 당시 검사와 이번 검사를 구분했다. 메시지 도착/명령 시작의 정확한 초는 UNKNOWN이다.

사용자가 전달한 원본 원격 위치는 `codex/backup-uiux-v2-review-20261001-213938` / `b3ab5be7f0c7a57ec1892cca1d65825549f54d72`다. 이번에는 Git/원격 조회를 실행하지 않아 원격 대조 완료를 새로 주장하지 않는다. 로컬 원 제출 관련15파일의 SHA를 `boundary-input-manifest.json`에 기록하고 후보 생성 전후 불변을 확인했다. 기존 파일을 직접 고치지 않고 별도 bounded 파일·증거만 추가했다.

| 직접 읽은 입력 | SHA-256 |
|---|---|
| game.html | `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115` |
| 원 coordinate-hotpath-v2.mjs | `12431de4435ab27b8b5d5f5aae676464a6ce217f5af4a362d131cb32432e7fd8` |
| 원 hotpath-coefficients.json | `fdcf159247d04c346be4b2eb8337f936d139e871a620b42c54f38ee55758bb8d` |
| 수정 이후 | bounded module/후보 SHA는 boundary-input-manifest.json 및 boundary-bounded-source-evidence.json에 별도로 보관 |

## 재현과 실제 결함

기본1280×800/camera0/shake0·zoom2에서 charge bbox의y=1e308/h=1e308은 world→논리 변환 후 Infinity가 된다. 원 v1은 `TypeError('invalid reading')`, 원 v2는 accepted 등록에서 `band=Infinity; band++`가 진행되지 않아 끝나지 않는다.

원 v2 재현은 **VM timeout25ms를 지정한 검사에서만** 실행했고 `ERR_SCRIPT_EXECUTION_TIMEOUT`을 확인했다. 현행 생산파일·게임을 실행하지 않았으므로 “게임이 멈춘다”는 판정이 아니다.

## 최소 경계 수정과 계약

새 파일: `tools/team-followup-20261001/UIUX/coordinate-bounded-v2.mjs`. 기존 glyph/snapshot/pool/paint 함수는 원 v2를 읽기 import/re-export하고 planner의 경계만 별도로 보강했다.

| 수정 | 계약/근거 |
|---|---|
| 변환 뒤 검사 | logical x/y/w/h의 유한성 및양수 geometry를 배치·band 삽입 전에 확인. raw bbox만 확인하는 기존 누락 해소 |
| derived viewport/gap | 유효 frame 필드라도 나눗셈이 Infinity/0,비율×0이NaN이 되는 경우 검사. tx 산술 overflow는 실제 logical 결과를 기준으로 처리 |
| v1 오류 보존 | 잘못된 frame/geometry/obstacle/ID/kind/변환 결과는 원 v1 referencePlanReadings에 위임해 정확한 TypeError 이름·메시지·검사 우선순위를 보존. 오류를 정상 출력으로 숨기지 않음 |
| 유한 큰 값 | bbox 자체가 유한하더라도 y+h/gap 확장 endpoint가Infinity일 수 있음. 이를 invalid reading으로 새로 거절하지 않고 v1과 같은 출력/충돌 의미 유지 |
| band 반복 경계 | band start/end 모두 safe integer,순서 정상,총64band 이하인 경우만 버킷 처리. 등록/검색은 offset≤span으로 최대64회. 거대한 finite band의++ 정밀도 정체를 차단 |
| 큰 bbox 등록 | 버킷을 돌지 않고 wide accepted index 목록에 기록. 다른 정상 candidate의 버킷 조회 뒤 wide bbox도 같은 AABB 식으로 확인 |
| 큰 query 범위 | 기존 accepted를 선형 순회하는 충돌 경로로 fallback. 라벨 삭제·좌표 clamp·bbox 축소·품질/공격 제한 없음 |
| 빈 planner 계약 | 원 v2의`planReadingsV2([],null)`성공은 v1 오류 계약과 달랐다. 이번에는 v1과 같은TypeError 복구. valid frame의빈출력은그대로. 실제 runtime empty jobs는planner/rect를호출하지 않아rect0 유지 |
| 오류 후 재사용 | partial logical/ID 작업 이후 오류가 나도 다음 호출에서 ID·accepted·bins·wide 상태를 재설정.30개 오류/극단값 뒤같은workspace의정상출력을v1과대조 |

등록 band≤64×(readings+obstacles),query band≤64×candidateAttempts를 실제 계수로 검사했다. 선형 fallback은accepted 수만큼 순회하므로 geometry 크기에 비례한 무제한 loop는 없어졌지만 **전체 최악 O(n²)** 및 메모리/CPU 실측 미완료는 남는다.64는 버킷 사용 경계일 뿐 라벨/적/공격 개수 제한이 아니다.

## 이번 새 검증

| 실행/원자료 | 실제 결과 |
|---|---|
| `node …/boundary.test.mjs` | exit0.원v2 timeout25ms 재현1회,새경계30개·각오류/극단값후workspace재사용30회 PASS.모든 bounded 호출VM timeout250ms 보호 |
| 오류/출력 대조 | overflow,큰finite y/h/y+h,band 정밀도 정체,큰finite gap,queryendpointoverflow,wide obstacle,negativehuge obstacle,NaN/Infinity,zero/negativegeometry,duplicateID,invalidkind/obstacle,viewport나눗셈overflow/underflow,gap비율overflow,0×Infinity,cam산술overflow,mapped폭overflow/높이underflow,invalidframe/empty/nullbox/ID누락 |
| 실제 hunk helper | 생성한 boundary-bounded-runtime-fixture.js에 같은30fixture를VM timeout250ms로대조.정확한오류명/메시지 또는전체출력이v1과동일 |
| `node …/build-boundary-bounded.mjs` | exit0,표준context5hunk 메모리재구성PASS,실행inline4개구문PASS.원 제출관련15파일해시불변.원생산파일변경0 |
| `node …/boundary-regression.mjs` | exit0,기존15그룹·6 VM 순차실행을새bounded module/fixture에연결해재실행.이전로그를이번검사로재사용하지않음 |
| 기존빈입력검사 정정 | 기존15그룹내null-frame성공assert만validframe빈출력+null-frameTypeError로수정한전용runner.원hotpath-equivalence.test.mjs는불변.최신v1오류보존지시를따름 |
| 기존계수8쌍 | spread/dense×0/1/30/120의출력·unresolved 및warm교차검사/binVisits/candidateAttempts/sort/Map/풀성장계수를원제출JSON과대조해동일.정상경로validation/linear/wide fallback0 |
| docs검색 | 관련drawNumStr/_tzoom/UI-03/_chargeLabelMetrics/유한/Infinity를docs전체rg검색 exit0,`boundary-doc-matches.txt`보관 |

| 정상120개 구조적 계수 | 원v2 → bounded |
|---|---|
| spread AABB | 1251 → 1251 |
| dense AABB | 653 → 653 |
| spread/dense candidate | 222/429 → 222/429 |
| spread/dense unresolved | 30/114 → 30/114 |
| sort / 매paint Map / warm pool성장 | 0/0/0 → 0/0/0 |

계수는 소스 실행의 구조적 계수다. 이번에도 heap프로파일·전체숨은할당·실게임 FPS 개선으로 해석하지 않는다. 경계 검사를 추가한 실제 CPU비용은 UNKNOWN이다.

최종검증UTC2026-10-01T12:45:17Z:전용4파일node --check/새후보재생성/30경계·30embedded/15그룹·6VM·8계수쌍대조모두exit0.원본15파일및본편해시불변,수정후module은37e5abc5…로구분했다.이번실행에실패없음;원v2의25ms timeout은기대된음성재현결과다.

## 산출·인계

- `boundary-bounded.with-context.diff`: 현재 본편 기준 표준context5hunk,생산미적용.원v2/P1과중복적용금지.
- `boundary-validation.json`/`boundary-validation.txt`: 원재현·30fixture·30embedded·오류후재사용근거.
- `boundary-coefficients.json`/`boundary-regression.txt`/`boundary-runtime-validation.json`: 이번15그룹·6VM·정상계수대조원자료.
- `boundary-input-manifest.json`/`boundary-bounded-source-evidence.json`: 원입력·수정후해시/본문·원본15파일보존·구문/재구성근거.

**후보 경계 수정/정적 회귀 PASS,실제 시각·FPS·밀집성능 UNKNOWN.** 문구·표시개수·수명·alpha·전투·저장·기존v1·원v2·타팀파일은변경하지않았다.게임/브라우저/서버/Git/새세션/PC/대형빌드는0.다음은root의bounded후보인수·원격체크포인트와기존QA게이트다.

docs동기화제안: UIUX작업대장의v2후보상태에이번유한성/반복경계결함과수정근거를추가하고,최적화SSOT에는변환후검사·v1오류동등성·safe integer/64band→선형fallback·추가CPU UNKNOWN을기록한다.원검사15그룹PASS는당시이력으로보존하고경계전체검수로확대하지않는다.공유문서통합은root담당이다.
