# ITEM-PM009-DEFINITION-VALIDATION 완료

2026-10-01 기존 ITEM의 승인 PM-009 정의/조회/검증 구현. **실제22종 제안 데이터와 조회·검증계층 완료 / 생산소비 연결0 / 활성아이템0.** 완료된 저장이름수리·ring픽셀검사는 반복하지 않았다.

## 수신·Read·Edit·검증

13:31:32 UTC DEFINITION_TASK.md 읽기. definition-* 기존산출 없음, unique-save/rgb와 다른 과제 확인. 적용계약§3/4·최신이름수리인수, 카탈로그22행·D절22행·unique-item-project README/audit-art.mjs/review.html·기존후보 목록을 실제읽었다. 초기복합조회exit1은없는 definition-* glob이며 소스읽기는완료.

전용receipt를작성하고 `tools/team-followup-20261001/ITEM/definition-catalog.mjs`, `tools/team-followup-20261001/ITEM/definition-catalog.test.mjs`를실제편집했다. 첫 테스트 `node --test tools/team-followup-20261001/ITEM/definition-catalog.test.mjs`: **exit0 / 22PASS / 0FAIL·skip·cancelled·todo**, 약47ms. 증거 `tools/team-followup-20261001/ITEM/definition-evidence.json`에데이터·문서해시·검증결과보존.

## 실데이터 대응

| uniqueId | 카탈로그명 | 슬롯 / 타입 | effectId |
|---|---|---|---|
|UI-01|반향의 장막|cape|U-D01|
|UI-02|독심의 봉환|ring1/ring2|U-D02|
|UI-03|삼획의 맹세|weapon/sword|U-D03|
|UI-04|빙편을 거두는 손|gloves|U-D04|
|UI-05|귀환자의 잔보|boots|U-D05|
|UI-06|되감긴 고리|helmet|U-D06|
|UI-07|셋째 사슬의 고삐|belt|U-D07|
|UI-08|혈흔을 따르는 날|weapon/dagger|U-D08|
|UI-09|쌍극의 회로|bracelet|U-D09|
|UI-10|꺼지지 않는 심갑|armor|U-D10|
|UI-11|체간을 깨는 추|weapon/hammer|U-D11|
|UI-12|성역의 숨결|shield(견갑)|U-D12|
|UI-13|번지는 뿌리의 띠|belt|U-D13|
|UI-14|폭심의 씨앗|necklace|U-D14|
|UI-15|독을 기억하는 석궁|bow/crossbow|U-D15|
|UI-16|철거자의 명령|gloves|U-D16|
|UI-17|무중력의 왕관|helmet|U-D17|
|UI-18|흡성의 목걸이|necklace|U-D18|
|UI-19|증기 단조의 손|gloves|U-D19|
|UI-20|파열을 품은 견갑|shield(견갑)|U-D20|
|UI-21|돌아온 자의 흉갑|armor|U-D21|
|UI-22|균열을 보는 눈|helmet|U-D22|

UI↔U-D와D절proposalStat전종을실데이터로담았다. 문서행을테스트에서독립파싱하여이름/effect/stat전22종과슬롯/무기/활대응22종을대조했다. 롤수치·효과실행·중첩·새정의정책은추가하지 않았다.

## API·불변성·폴백

모듈은import없는브라우저 ES module이다. Node fs/DOM/window/storage/fetch/RNG를사용하지않는다. 브라우저실행은안했고acorn의module parse 및Node실제import/실행을확인했다.

| API | 계약 |
|---|---|
| `UNIQUE_DEFINITIONS` | 중첩객체/슬롯배열까지freeze한22종 제안. status=proposal, enabled=false |
| `EFFECT_PROPOSALS` | 문서effectId/proposalStat, documented=true, implemented=false. 문서존재와런타임구현분리 |
| `lookupDefinition(id)` | 정확한등록ID의제안metadata조회. unknown/빈/공백/invalid/null은null. 활성효과조회로사용금지 |
| `lookupItemProposal(item)` | 위조회+실제slot/wtype/btype계약일치시에만제안반환. 원인스턴스/name/uniqueId/소수롤/uniqueSpecial무변경 |
| `lookupActiveItemDefinition(item)` | 현전종null. freeze된비활성/제안데이터만소비하므로주입데이터로활성화불가 |
| `validateDefinitions(definitions, context)` | 주입데이터검사. issues는제안구조오류, blockers는생산활성미충족. 입력무변경, canActivate항상false |

uniqueId없는기존슬롯유니크와유골함은null→소비자의기존경로유지. 미등록문자열아이템삭제/재롤/자동변환0. effect실행기가없고instance특수효과를추가하지않아이중지급0. 이미통합된이름수리코드는읽기만하고수정/재검사하지 않았다.

## 검사결과와 정확한미완료상태

| 검사 | 결과 |
|---|---|
| 실제22개이름/effect/stat,계약슬롯타입 | PASS |
| UI06/17/22 helmet, ring1/2, sword/dagger/hammer/crossbow | PASS / headband·오타타입반례차단 |
| 중복uniqueId/effectId/효과registryID | issues검출 |
| 없는/undocumented effect·stat오류·unknown/누락정의 | issues검출 |
| 활성화시도·아트채택임의변경·번역키invent·null행 | issues검출, canActivate=false |
| 원화실제존재 |44경로존재,파일감사/이미지시각검수는반복하지않음 |
| missing/unaccepted art | source누락·runtime누락·미채택을각각blockers검출 |
| 불변성/순수조회 | freeze변경throw·원instancedeepEqual·Node의존성/RNG없음검사PASS |

실제44source파일목록을주입한검증: **valid=true(제안구조만), issues0, canActivate=false, blockers110**. 각22종당효과미구현·번역미등록·runtime아트누락·아트미채택·제안활성금지5가지다. 환경입력없이검증하면source아트존재를확인할수없으므로source누락blocker도추가된다. 누락환경을실파일없음으로단정하지 않는다.

전종nameKey=null·translationStatus=unregistered. 카탈로그한글명은catalogName일뿐번역키/번역정의로승격하지않았다. 본편/easy에최초3종카탈로그명·uniqueId/UI연결조회rg결과0이지만전번역정책검수가아니며기존적용계약의미등록상태를유지한다. 원화경로는비교용 original/candidate뿐, runtimePath=null·accepted=false. 이미지44장존재를채택완료로보고하지않는다.

## root 소비 인수조건

독립검수후기존review.html의names/read-only행조회등에import해 `lookupDefinition`/`UNIQUE_DEFINITIONS`를검수자료로표시할수있다. **review통합도이번에는미실행.** 기존fallback/모든게임효과는 `lookupActiveItemDefinition`가null이면그대로유지해야한다. proposal조회반환을활성효과·전용PNG경로선택·새드롭허용으로사용하지 않는다. 활성화를위한후속은아트채택/투명파생/효과/번역등별도승인·코드계약검수이며현validator는이를자동통과시키지않는다.

생산소비경로선정은root독립검수후이므로공용패치없음. 연결완료·22종게임아이템완성·실화면·패키지검수는미완료. 현재scope의lookup/validation만완료.

docs전체 `rg -n 'uniqueId|effectId|UI-06|UI-17|UI-22|U-D22|nameKey' docs --glob '*.md'` 검색(exit0), `tools/team-followup-20261001/ITEM/definition-docs-related.txt`보존. 코드/숫자/API상태는본전용result에정리했다. root소비통합후적용계약§4정의계층상태와ITEM대장에 **제안조회22종구현/생산비활성22종/효과·아트·번역미완료**를동기화하도록인계한다. 공용game/easy/index/build/test/docs원문·Git쓰기·새세션·하위에이전트·게임/서버변경0.
