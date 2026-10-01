# BALANCE-D10-BINDING 독립 왕복 검증기

## 최신: 실제 ITEM binding 직접 연결 검수 완료

2026-10-01T14:23:29Z 재개 지시 수신·실제 첫Read·의존인수: `binding-d10.mjs`/`binding-ports.mjs` 원문과 SHA256을 읽었다. 이전 waiting 종료. 첫 실제 연결Edit는 BALANCE 소유 `binding-item-adapter.mjs`이며 ITEM ports의 create/restore/read를 직접 import했다. ITEM이 실행한 로그를 대신 인수하지 않고 **BALANCE의 검증기·어댑터에서 실제 후보를 직접 실행**했다.

2026-10-01T14:24:16Z 완료: status=completed_actual_binding_review/runtimeReady=false. 아래 이전 대기 절은 당시 이력이며 현재 대기 상태가 아니다.

| 실행 검증 | 결과 |
|---|---|
| 실제 adapter 42행 | 두 HTML×3 저장위치×(신규1+legacy6). 신규6회/legacy36회 실제 코드 대조 PASS |
| RNG 호출 | 신규 create 명시 총6회, read/restore/legacy0회, 암묵 Math.random 차단. 저장 이후 재롤 없음 |
| 저장/복원 | 실제 inv 표현식/두 대입·공유창고 함수+JSON 왕복 후 전체 새/기존 인스턴스 동일. restore는 실제 ports의 **동일 JSON 객체 반환 no-op**이며 전체 dbRestore가 아님 |
| 부정 schema/version/unit | 15변이×2 HTML×3위치=90표본. null/array/누락 binding·version 누락/2/문자열1·unit percent·effect/stat 오류·stored15/.155/문자열/null·unknown ID/잘못된 슬롯 모두 read null 및 bound consumer begin null PASS |
| 중복 생성 | 실제 core와 ports에 이미 생성된 인스턴스 재생성을 요청하면 TypeError, 추가RNG0·기존객체 불변 PASS |
| 실제 소비 연결 | 새 저장복원객체를 실제 bound consumer와 독립검증기의 기존 consumer에서 소비. 기본 비활성 begin null, fixture enabled=true는 consume100→환급15, 인스턴스변이0 PASS |
| 불일치/실패 | 실제 후보 원자료 비교 반례0, 실행실패0. 부정입력 거부는 의도한 PASS |

실제 ports의 `createNewIdentifiedD10Instance`는 신규 요청의 UI-10 identity를 벗겨 core에 전달하고 core가 uniqueId와 제안 `uniqueRoll`을 생성한다. core의 레거시/기존 uniqueRoll 중복거부는 그대로 소비했다. adapter가 숫자 oracle을 후보 반환값으로 만들지 않는다. `readD10Binding`의 proposal만 stored로 반환하고 나머지는 null, restore는 실제 `restoreD10Instance`를 호출한다.

### 명령·원자료

- `node --test tools/team-followup-20261001/BALANCE/binding-independent.test.mjs tools/team-followup-20261001/BALANCE/binding-item-acceptance.test.mjs`: exit0, **6그룹PASS/0FAIL/0SKIP**, 약771ms. 기존2독립그룹+4실후보그룹. `binding-item-tests.txt`.
- `node tools/team-followup-20261001/BALANCE/binding-run.mjs tools/team-followup-20261001/BALANCE/binding-item-adapter.mjs`: exit0. `binding-item-raw.json`: actual_binding_checked,42행 실제 생성/복원객체·저장소수·행별 RNG 및 creationRngCalls6, 입력소스해시.
- adapter/전용test 각각 node --check exit0. docs 전체 rg 검색 exit0: `binding-item-doc-search.txt`.
- 직접 인수/검수후 최종 ITEM 해시 대조: 아래 두값 모두 처음과 동일, **작업중 모듈 변경0**. `binding-item-final-hashes.txt` 및 BALANCE 검사코드의 `binding-validation-hashes.txt` 보관.

| 실제 의존 | 첫Read 및 최종 SHA256 |
|---|---|
| `ITEM/binding-d10.mjs` | `1511e771a2f44e877a0b1ffd46dddc1a5c06d3d510340419982117b5033f4507` |
| `ITEM/binding-ports.mjs` | `0adc51835eba68b1cc693267cb08e616b81a4b78c55e8368260b545f91b80e0c` |

### 한계·다음 게이트

`uniqueRoll` version1/effectId U-D10/stat _uSlamEmberRage/unit fraction/storedValue는 **ITEM 후보 schema**이며 생산 저장 활성화가 아니다. 새 drop/legacy 변환/생산 등록은 없다. socketCount0 fixture와 저장식 일부만 실행했고 전체 dbRestore의 다른 마이그레이션·RNG, 실제서버/사용자저장/실UI/패키지를 검수했다고 보고하지 않는다.

root가 공유 docs와 체크포인트를 인수한다. ITEM/공유SSOT/생산/Git/게임/브라우저/빌드/새세션/하위에이전트 변경/실행0. 본 작업의 실제 binding 독립검수는 완료했으며 별도 배정 전 새 수정지원 범위를 시작하지 않는다.

## 수신·Read·Edit·검사·의존

- 2026-10-01T14:16:15Z 배정 수신·첫Read: BUILD continuation 계획, AGENTS, 최신 ITEM/BALANCE D10 결과, SSOT, 본편 dbSave/dbRestore 및 공유창고 저장식, 실제 D10 consumer. BALANCE binding 산출/동일 receipt 없음 확인.
- 첫Edit: 전용 receipt 생성 후 `binding-independent.mjs`, `binding-independent.test.mjs`, `binding-run.mjs` 실제 작성. 기존 D10 수치 검사를 반복하지 않고 저장 인스턴스/복원/콜백 호출계수 검증을 구현했다.
- 2026-10-01T14:17:52Z 검사 종료·짧은 의존1회 확인: ITEM binding 영수증만 존재, binding 코드/API/결과 없음. **waiting_for_item_binding**으로 인계. 실제 의존 코드 인수 시각은 null, 후보검수 완료 아님.

## 실제 저장식 기반 검증

| 위치 | 실행한 실제 코드 | 경계 |
|---|---|---|
| bag/equipped | dbSave의 `inv:{bag:INV.bag,equipped:INV.equipped,ossCollect:INV.ossCollect||{}}` 표현식 및 dbRestore의 bag/equipped 두 대입을 추출·VM 실행 | JSON 저장/복원fixture. 전체 dbSave/Supabase/dbRestore 후속 마이그레이션 실행 아님 |
| 공유창고 | 양쪽 `_saveSharedStorage`/`_loadSharedStorage` 함수 전체 추출·메모리 localStorage 대역 실행 | dbSave.storage={}는 공유창고가 아님. 실제 사용자 localStorage/서버 접촉0 |
| legacy fixture | 일반갑옷, 기존 uniqueSpecial/_uArmorRage, 유골함, unknown ID, UI10 레거시정수20, UI10 binding누락 | 전체객체·이름·ID·legacy값 그대로 보존. 자동 신형변환/추정복구0 |

2 HTML×6 fixture×3 저장위치=**36개 실제 저장식 왕복 보존** 확인. fixture의 socketCount0은 불필요 소켓마이그레이션 난수와 새 binding 재롤을 섞지 않기 위한 조건이며 전체 복원 RNG0을 주장하지 않는다. 실제 원식/소스 해시는 `binding-raw.json`에 보관했다.

## root 소비 API와 남은 실제 연결

`binding-independent.mjs`의 `verifyBinding(api)`는 후보가 아니라 독립 검사기다. root는 **실제 ITEM API를 읽고** 다음 세 함수를 export하는 얇은 어댑터를 BALANCE 소유에 연결한다:

| 어댑터 함수 | 검사 요구 |
|---|---|
| `create(item,rng)` | 실제 신규 ITEM binding 생성 실행. rng .5 명시1회, 기존 필드 보존, read=.15 |
| `read(item)` | 실제 ITEM 저장 binding reader의 동기반환. 정상은 저장소수, legacy/missing/unknown는 null로 정규화. 입력변이 없음 |
| `restore(item,rng)` | 실제 ITEM 검증/복원 API 실행. 이미 저장된 전체객체/롤 보존, legacy 그대로, 주입rng 호출0. ITEM에 별도 restore가 없다면 root가 실제 read/검증만 수행하고 실제 JSON로드 객체를 그대로 반환하는 어댑터라는 점을 명시해야 함 |

실행 명령: `node tools/team-followup-20261001/BALANCE/binding-run.mjs /절대경로/실제-ITEM-어댑터.mjs`.

ITEM이 정의할 binding 필드/버전명은 검사기가 결정하지 않는다. .15 기대값은 신규 RNG .5의 저장단위 검증 oracle이고 **이 값을 후보처럼 반환하는 함수는 없다**. 실제 create/read/restore를 import하여 결과를 대조해야 한다.

도착 후 예정 실제검사: 6개 신규 생성/저장/복원+36 legacy(총42행), 신규 총RNG6회·로드/legacy0회, read/restore 변이0. 정상 복원객체를 기존 실제 D10 consumer의 begin→consume100→finish로 직접 소비하여15 환급인지도 검사한다. 모듈 내부 Math.random은 임시 throw 대역으로 차단해 암묵 재롤을 검출하고 finally에서 복구한다. 서버/브라우저와 분리된 단일 검사프로세스에만 적용한다.

## 현재 실행 근거

| 명령 | 결과/원자료 |
|---|---|
| `node --test tools/team-followup-20261001/BALANCE/binding-independent.test.mjs` | exit0,2그룹PASS/0FAIL. 저장식36왕복 및 누락 API·RNG0 생성·암묵 Math.random의 부정 변이 검출. `binding-tests.txt` |
| `node tools/team-followup-20261001/BALANCE/binding-run.mjs` | exit0, candidateChecked=false/status=waiting_for_item_binding. `binding-raw.json` (원입력 및 3위치 원결과·소스해시) |
| `node --check tools/team-followup-20261001/BALANCE/binding-independent.mjs` | exit0 |
| `rg -n 'uniqueId|재롤|저장|U-D10' docs/` | exit0, docs 전체 검색 `binding-doc-search.txt` |

신규 검사 실패0. ITEM binding 파일 검색의 최초 exit1은 매칭 부재였고 실행 실패가 아니다. 최종조회는 ITEM-binding-receipt.json만 발견했다. 무한poll·중복배정·ITEM 파일 대신작성0.

## docs 인계/게이트

공유 SSOT와 대장에 ‘실제 저장식 독립36왕복 및 검증기 준비 완료, ITEM binding 소비검수 대기’를 구분 기록하는 후보를 root에 인계한다. 신규 binding 필드·버전·생성정책은 ITEM API 인수 후 동기화한다. 현재 생산/드롭/기존세이브/정의활성 변화0.

실제 ITEM binding roundtrip·부정 binding/버전 대응·로드때 reader 재롤0·consumer 바인딩·실게임/전체복원/사용자저장/패키지/번역UI는 미완료다. BUILD readonly DB·공유파일·Git·새세션·하위에이전트·게임·브라우저·빌드 접촉/쓰기0. 원격체크포인트는 root 담당이며 이번 원격대조를 따로 실행한 것으로 보고하지 않는다.
