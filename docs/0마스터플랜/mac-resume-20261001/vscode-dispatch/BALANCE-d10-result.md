# BALANCE-D10-INDEPENDENT-ACCEPTANCE

## 최신: 의존 도착 후 실제 ITEM 후보 독립 검수 완료

2026-10-01T14:07:33Z 사용자 인계 수신 후 ITEM 결과/API `begin/consume/finish` 및 source변환을 실제 읽었다. 기존 waiting은 종료했다. BALANCE 소유 `d10-item-adapter.mjs` 첫Edit로 실제 ITEM 모듈을 import하고 `createD10Consumer`를 VM에 바인딩했다. `candidateSlamSource`로 실제 원함수를 변환한 결과가 제출된 두 완성 후보함수와 정확히 동일한지 assert한 뒤 **그 원후보 함수를 실행**했다. 기대값을 후보 결과로 반환하지 않았다.

2026-10-01T14:08:19Z 최종 검사·원자료 생성 완료. status=completed_actual_candidate_review/runtimeReady=false. 아래 기존 waiting 절은 이전 시점 이력이며 현재 대기가 아니다.

| 실제 실행 검수 | 결과 |
|---|---|
| 독립148입력 | 원함수/실후보 동일입력 PASS. >=100·raw10~20·99/100/150/1000·소수·실패·비장착·다른슬롯·unknown·합체420f·피해/악의/래치/콜백 대조 |
| 연속 실제 시전 | 두 HTML 첫 복원 후 다음 독립시전은 <100이므로 환급0,원행동 동일 PASS |
| 실제 함수 동기 재진입 | `_gSlamHit` 통제 callback에서 실제 activateGiantSlam 재호출. 양쪽 원/후보 hits2·피해/쿨/악의/래치 동일, 외부토큰만20 환급 PASS |
| 비활성/부정롤 | 양쪽 disabled 및 undefined/20/문자열/.155/NaN/Infinity/.09/.21 저장 입력에서 원결과 동일 PASS |
| 실 consumer token | 중복consume/finish·위조·동시begin·99.5거부·실패닫힘/재개·장착객체교체·별도분노5·미소모 차단 PASS |
| 반례 | 이번 독립 검증 범위의 원/후보 불일치0. 의도한4개 부정 변이는 계속 검출되며 ITEM 결함으로 세지 않음 |

실행 명령 `node --test tools/team-followup-20261001/BALANCE/d10-independent.test.mjs tools/team-followup-20261001/BALANCE/d10-item-acceptance.test.mjs`: exit0, **8그룹PASS/0FAIL/0SKIP**, 약208ms. 3개 기존 독립 그룹+5개 실제 ITEM 검수 그룹이다. 원자료 `d10-item-tests.txt`.

실제 소비 CLI `node tools/team-followup-20261001/BALANCE/d10-run.mjs tools/team-followup-20261001/BALANCE/d10-item-adapter.mjs`: exit0. `d10-item-raw.json`에 candidate_checked·150행(148입력+두 연속시전) 및 입력/원결과/실후보결과/원소스해시를 저장했다. adapter node --check exit0. `d10-item-hashes.txt`에 ITEM consumer·양쪽 제출함수·공유 정의/롤 SHA256, `d10-item-doc-search.txt`에 docs 전체검색 exit0 근거를 보관했다. 기존 ITEM 파일/공유파일 변경0, 생산 활성0, 게임/브라우저/빌드/Git쓰기0. 신규 실패0.

검수 필드 fixtureStored는 **후보 어댑터 내부 명시 검수필드**이며 사용자 저장 포맷 확정이 아니다. enabled=true도 독립 후보 fixture에만 한정하고 defaults/definitions 비활성 정책은 바꾸지 않았다. U-N01 실구현 부재와 스킬/피해/VFX 통제대역 한계는 유지한다. 반례없음을 실전/전체합체/서버저장/성능 보장으로 확대하지 않는다.

root 후속: 저장 롤 binding 확정·공유 docs 인수·생산 연결 승인 여부 판단·실게임/저장/패키지 검수. 이번에는 ITEM 후보 독립 인수 게이트를 실제 실행으로 완료했다.

## 실제 수신·착수와 상태

2026-10-01T14:01:04Z 수신/첫Read. 배정·총괄§18최신·연속진행·백업정책·팀대장·D10 SSOT와 TOP8 훅·現 definitions.js/roll-values.js·양쪽 activateGiantSlam을 직접 읽었다. 이전 완료는 롤/환수이며 D10 독립 산출과 중복되지 않는다. 첫Edit는 전용 영수증, 다음Edit는 실제 `d10-independent.mjs`/전용 테스트다.

최종 짧은1회 ITEM 산출 확인: `ITEM-d10-receipt.json`만 있고 실행 가능한 ITEM d10 코드/결과는 없다. **status=waiting_for_item**. 독립 검증기 준비와 원함수 검사 완료이며 실제 ITEM 후보 검수 완료/진행중으로 세지 않는다. 추가 poll·ITEM 후보 대리 구현/수정은 하지 않았다.

## 실제 구현·소비 API

| 소유 산출 | 역할 |
|---|---|
| `tools/team-followup-20261001/BALANCE/d10-independent.mjs` | 실제 원함수 추출 VM·현행 정의/롤 소비·독립 기대 환급·148입력·후보 실행 비교 API |
| `d10-independent.test.mjs` | 실제 원함수/SSOT 검사 및 독립 검증기의 반례 검출능력 검사, ITEM 테스트 복제 아님 |
| `d10-run.mjs` | 원함수/기대치 원자료 출력 또는 root 명시 후보 어댑터 실제 import/소비 실행 |
| `d10-tests.txt`, `d10-original-raw.json`, `d10-doc-search.txt` | 실제 검사·해시·원결과·기대값·docs 전체 검색 원자료 |

root 실행: `node tools/team-followup-20261001/BALANCE/d10-run.mjs /절대경로/후보-검수어댑터.mjs`.

명시 어댑터는 `runD10Scenario(scenario)`를 export하고 **실제 ITEM 후보 코드를 실행**한 `{rage,cooldown,mats,hits,rageCast,latch,fullEvents}`를 반환해야 한다. hits는 `_gSlamHit` 실제 인자 배열 기록이며 rageCast는 교육 콜백의 실제 소모량 기록이다. 동기/비동기 함수 모두 지원. root가 실제 ITEM API를 읽고 이 얇은 어댑터를 연결한다. 기대 oracle을 후보처럼 반환하는 어댑터는 승인 근거가 아니다.

`verifyCandidate`는 148개 원/후보 동일 입력에 환급 필드 외 모든 반환값을 엄격 대조하고 두 HTML에서 두 독립 시전 순서도 추가 검사한다. 차이는 assertion에 입력/원결과/후보결과/기대값을 JSON으로 남긴다. 후보가 오류이면 성공 결과를 출력하지 않는다. 기본 CLI(인자없음)는 candidateChecked=false/status=waiting_for_item이며 exit0은 원자료 생성 성공일 뿐 후보 PASS가 아니다.

## 독립 검증 범위

| 범위 | 실제 확인/기대 계약 |
|---|---|
| 11개 UI10 raw10~20 | 現 roll-values.js의 저장 .10~.20 소비, 역변환 엄격 검사; 직접 raw정수 저장20은 거부 |
| 분노99/100/150/1000/99.5/100.5 | 원함수는 양수 모두 소모. D10 후보는 **실제 성공 소모>=100**만 min(30,소모×stored) 기대; 99/99.5 환급0,100.5 소수 보존 |
| 실제 원피해 | meleeRef5/STR1/skill1/분노패시브0/어픽스0 fixture에서 trunc(5×(1+소모前rage×.19)); 후보 피해 변경 금지 |
| 실패 시전 | 악의0으로 원함수 early return, rage 그대로·hits0·cooldown null·환급0 |
| 비장착/레거시/다른슬롯/unknown/다른 고유 | 現 lookupItemProposal 소비하여 D10 아닌 경우 원함수 동일 |
| 合체쿨 | giantSlam2+pillarSlam/infernoSlam 두 원경로 cooldown420 확인; 합체 후속 스킬은 fixture에서 미보유로 실행 안 함 |
| 반복 | 성공 첫시전 복원 최대30 다음 독립시전은 분노<100이므로 환급0 기대. 같은 사건 토큰 중복/재진입 검수는 ITEM API 도착 후 별도 연결 필요 |
| U-N01 래치 | 명시 fixture `_rageFullLatch` 불변/fullEvents0 비교 계약. 현재 원함수에 실제 U-N01 발동 구현이 없으므로 실게임 래치 통합 보장이 아님 |

148개=양쪽×(11롤×6분노+비장착5+실패1+합체2). 분노1000은 허용 범위 밖일 수 있는 **상한검증 fixture**이며 정상 자연 달성을 주장하지 않는다. 소수분노·래치도 의미 분리 fixture다. VM은 스킬/렌더/오디오/피격 실행부를 stub하여 actual activateGiantSlam 자체를 실행한다. 실제 피해 적용·전투/프레임·스킬라우터 진입 보장은 별도다.

## 실행·실패 기록

| 명령 | 결과 |
|---|---|
| `node --test tools/team-followup-20261001/BALANCE/d10-independent.test.mjs` | exit0,3그룹PASS:148실제원입력·원식/소모/실패/쿨/래치 검사, 기대경계, 4개 부정 변이 검출 |
| `node tools/team-followup-20261001/BALANCE/d10-run.mjs` | exit0, 후보未검사인 원자료 생성 |
| `node --check tools/team-followup-20261001/BALANCE/d10-independent.mjs` 및 `d10-run.mjs` | exit0 |
| `rg -n 'U-D10|_uSlamEmberRage|_rageFullLatch|U-N01' docs/` | exit0, 전체 검색 저장 |

검사 assertion 실패0. 첫 파일조회 셸의 ITEM 결과 glob는 아직 파일이 없어 zsh no matches/exit1이었다. 후속 조회는 rg --files로 확인했고 재시도 poll은 하지 않았다. 부정 변이는 의도한 검출이며 후보 실행 실패로 세지 않는다. 생성탄/충만 정책·생산 숫자 수정0.

## 인수 게이트

ITEM 실제 코드/API/해시 도착→원코드 Read→명시 어댑터→실행 비교/중복·재진입/충만 사건 연동→root docs 및 검수 인수 순서다. 새 인스턴스 저장 롤 필드는 아직 미확정이라 검수 scenario의 stored를 명시 주입하며 레거시를 추정 변환하지 않는다. docs 인계 후보: ‘独立 원함수148입력 및 검증기3그룹PASS, ITEM검수待기, 효과未활성’을 팀대장/PM009에 추가. 공유 docs·definitions·roll·audit·생산 변경0. 게임·브라우저·서버·빌드·새세션·하위에이전트·Git쓰기0. QA root 단독 측정과 별개인 짧은 정적 실행만 수행했다.
