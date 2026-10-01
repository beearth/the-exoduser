# ITEM-D10-BINDING 결과

2026-10-01. **새제안인스턴스 저장 binding·실제D10소비 adapter·실제저장식회귀 완료. 생산활성/드롭/레거시세이브변경0.**

## 수신·실제Read/Edit·의존인수

14:16:19 UTC BUILD continuation-dispatch-plan·AGENTS·최신ITEM D10결과·소유목록읽기. binding-* 기존산출없음 확인. 14:16:44 UTC까지 실제dbSave·적용계약·ITEM d10-consumer·공유definitions/roll-values·tooltip 및BALANCE D10결과를읽고전용receipt작성후binding코드/회귀를실제편집했다. root D10검수188PASS/체크포인트는사용자전달상태이며이번에Git조회/쓰기0.

첫binding검사21PASS → endpoint/detachment추가22PASS. 14:20:11 UTC에새로도착한UIUX `createStoredD10TooltipConsumer(readBinding)` 및BALANCE `verifyBinding({create,read,restore})`의실제코드를읽어의존인수했다. 초기예상포트와달라대기하지않고자기폴더에binding-ports.mjs를추가했다. 실제import연동까지최종24PASS. 상대팀의최종보고/독립승인완료를대신선언하지않는다.

최종명령 `node --test tools/team-followup-20261001/ITEM/binding-d10.test.mjs`: **exit0,24PASS/0FAIL/skip/cancelled/todo**,약514ms. 실행중assertion/문법실패0. 실제stdout `binding-validation.txt`.

## 저장필드 선택·버전·단위

실제dbSave는inv.bag/equipped를객체그대로data에전달하고dbRestore는그객체를복원한다. 공유창고도JSON전체객체를저장/load한다. uniqueId문자열+이미굴린값을보존하는적용계약에따라 **새인스턴스의독립 `uniqueRoll` 객체**를선택했다. 기존 `_uSlamEmberRage` 정수/uniqueSpecial.val의단위를추정하거나덮지않기위함이다. 코드/docs검색에서기존uniqueRoll생산소비는찾지못했으며root가채택하기전에는후보schema다.

```json
{"uniqueId":"UI-10","uniqueRoll":{"version":1,"effectId":"U-D10","stat":"_uSlamEmberRage","unit":"fraction","storedValue":0.15}}
```

| 필드 / 조건 | 후보계약 |
|---|---|
| uniqueId / slot | UI-10 / armor. 현definitions.lookupItemProposal 재사용 |
| uniqueRoll.version | 숫자1만허용. 누락/0/2/문자열1은invalid; 자동version이관0 |
| effectId/stat | U-D10 / 현재lookupRoll의_uSlamEmberRage와일치해야함 |
| unit/storedValue | fraction / 정규10~20%의0.10~0.20. `fromStoredValue`로11정수롤역검증; .155/10/20/문자열/NaN/Infinity거부 |
| raw값 | 별도중복저장하지않고조회때기존fromStoredValue로복원. 저장로드RNG0 |
| runtimeReady | schema/API반환에false. 인스턴스활성필드/효과등록/드롭정책생성0 |

## root/UIUX/BALANCE 소비 API

모든경로는 `tools/team-followup-20261001/ITEM/` 아래다.

| 모듈 / API | 사용·제한 |
|---|---|
| `binding-d10.mjs`: `createD10ProposalInstance({newItem,rng})` | **명시새제안생성만**. ID/binding/레거시stat/unique=true/기존uniqueSpecial있는입력거부. 새armor JSONsnapshot을복제해UI10+binding추가,기존이름/수치/affix보존. 정상RNG정확1회 |
| `inspectD10Binding(item)` | valid/legacy/missing/invalid상태·raw/storedValue. 읽기만;로드누락필드복구/롤생성0 |
| `readStoredRoll(item,definition,roll)` | 현D10소비signature에직접연결. valid만number,나머지null. definition/effect/stat대조 |
| `createBoundD10Consumer({enabled:false})` | 기존createD10Consumer에위reader주입. 기본비활성. 실제loadedbinding의소모100/20%→20복원·중복0검사 |
| `binding-ports.mjs`: `readD10Binding(item)` | UIUX포트용 kind=proposal/legacy/missing/invalid와stored/identity반환. UIUX가실제tooltip을재사용하며active=false |
| `createNewIdentifiedD10Instance(base,rng)` | BALANCE등의**명시신규생성포트**: 새base에이미UI10 identity가배정된fixture를받아분리복제후core생성. unknown/기존binding/레거시stat/uniqueSpecial거부 |
| `restoreD10Instance(item)` | 원객체를그대로반환하는read-only로드포트. RNG인수를사용하지않고clone/수리/마이그레이션도하지않음 |
| `createD10ValidationPorts()` | 위create/read/restore포트를묶어BALANCE verifyBinding에그대로주입 |

`createNewIdentifiedD10Instance`는호출자가**새객체**임을보장하는생성전용포트다. JSON데이터만으로아이템이방금생성됐는지증명할수없으므로savedUI10의binding누락을이API로보충하면안된다. restore/read/UIUX포트는그렇게호출하지않는다. 기존미등록ID·구형슬롯유니크·유골함·missingbinding은null/상태폴백이며자동생성/레거시변환0.

## 검증과원자료

- 새11롤전구간및RNG0/1직전endpoint:정확1회,입력무변경·중첩snapshot분리. invalid새입력은RNG0,invalid RNG표본은1회호출후실패·입력변경0.
- 본편/easy의**전체실제 dbSave/dbRestore**와sanitize·공유저장함수를추출한메모리fakeDB/localStorage에서bag/equipped/storage 각각3회JSON저장로드. 생성1회/로드게임RNG0·binding/기존소수값/legacy객체동등.
- 정상fixture는socketCount가명시돼기존소켓마이그레이션RNG가없다. socket누락구세이브의기존RNG정책이없어졌다고보고하지않으며이과제에서기존수리를변경하지않았다.
- 실제ITEM D10 consumer에loadedbinding reader를연결해100소모→20복원,duplicate0/defaultdisabled확인. d10원전투75회귀를반복하지않았다.
- 실제UIUX모듈import:proposal tooltip.stored=.15/active=false,legacy/missing/invalid폴백. UI실화면/DOM/브라우저검수는아님.
- 실제BALANCE독립verifyBindingimport:본편/easy×bag/equipped/storage의신규6행+legacy36행 **42행** 검증,신규RNG6회(각1),restore/read0회. 원자료 `binding-independent-evidence.json`. 이42행을24개node:test와합산해66독립테스트라보고하지않는다.

`binding-evidence.json`에schema·11롤결과·실제저장경로·dbSave/dbRestore·현definitions/roll/tooltip/consumer/타팀binding모듈SHA를보존했다. `binding-save-harness.mjs`는이전자기저장하니스를읽고별도복사·축소한것으로현재이름수리코드를재패치하지않는다. DB/서버/사용자세이브는실행하지않으며스킬/atlas등무관한의존성은통제대역이다.

| 실제dbRestore입력 | SHA256 |
|---|---|
| 본편 | `63385633575b51647ab02b9e27f6d840e036dc35f9cd595b1cc65063e1133c35` |
| easy | `2785fd6138a7325f64bbf2c27cde281e270caa85f517b7a7c52801ad9726d274` |

## docs·한계·후속

docs전체 `rg -n 'uniqueId|uniqueRoll|U-D10|_uSlamEmberRage|직렬화|재롤' docs --glob '*.md'` 실행exit0, `binding-docs-related.txt`보존. 후보필드·버전·정규단위·생성/로드분리·legacy정책을본전용result에기록했다. root가채택하면적용계약§1/4·저장SSOT·D10/팀대장에bindingVersion1후보와실제생산상태를구분반영한다. 공유docs/소스쓰기0.

**남은게이트:** root의필드/adapter독립인수·UIUX/BALANCE최종승인·소비경로정식연결/JS MIME검토·실게임스킬/저장/패키지회귀. `.mjs`는자기후보경로이며현3340MIME을검증하지않았다. productionrollfield는아직root미채택;defaultdisabled/전체22종inactive는그대로다. 새드롭/생산활성/레거시세이브변경/공유파일쓰기/Git/게임/브라우저/빌드/새세션/하위에이전트0. 타팀API는실제인수해서검사했으므로추상API대기를blocker로남기지않는다.
