# ITEM-D10-COMBAT-CANDIDATE 완료 / 생산 미적용

2026-10-01. 기존 ITEM 담당의 승인 D10 독립후보·실제함수소비·회귀 완료. **기본비활성, 생산22종활성0, 실제전투/브라우저/빌드0.** root QA 정상전투와 별개인 작은VM 검증이다.

## 실제Read/Edit/검사

14:00:59 UTC D10_TASK.md 읽기·소유파일목록 중복확인(d10-* 없음). 현재 definitions.js·roll-values.js 원문, TOP8_HOOK_REVIEW, D절D10·U-N01, 본편/easy activateGiantSlam·_uEq·rage소모/장착/합체/호출부·팀대장·총괄18.35/36·연속진행·백업정책을읽었다. 전용receipt를먼저작성하고 d10-consumer.mjs·d10-combat.test.mjs를편집했다.

첫회귀71PASS → 저장단위/장착교체반례추가73PASS. 최소context patch의재구성검사를추가한중간실행은2FAIL: source변환기에추가된빈줄과diff가한줄불일치했다. 계산/분노정책오류가아니며소유변환기의불필요빈줄만제거. 최종**75PASS/0FAIL/skip/todo/cancelled**, 실행exit0,약142ms. 실패로그(도구출력한도로부분보존) `tools/team-followup-20261001/ITEM/d10-validation.txt`, 최종전체stdout `tools/team-followup-20261001/ITEM/d10-validation-final.txt`.

## 산출·독립검수 API

| 산출 | 역할 |
|---|---|
| `tools/team-followup-20261001/ITEM/d10-consumer.mjs` | 순수후보consumer와실제함수source변환기. shared definitions.js/roll-values.js 직접import·재사용 |
| `tools/team-followup-20261001/ITEM/d10-combat.test.mjs` | 원본/후보동일입력의전체activateGiantSlam VM회귀·token/API반례·diff재구성검증 |
| `d10-game-function.js`, `d10-game-easy-test-function.js` | 각현행실제함수의미적용완성후보. 실행시 `_d10Candidate` 명시binding 필요 |
| `d10-game.patch`, `d10-game-easy-test.patch` | 세개context hunk의미적용diff. 메모리적용결과가정확히candidateSource와같음을검증; Git apply0 |
| `d10-evidence.json` | 본편/easy함수·후보·HTML·공유모듈해시와42개분노/롤교차비교원자료 |

BALANCE는 `createD10Consumer({enabled:false,readStoredRoll})`와 `candidateSlamSource(source)`를import하여독립검수할수있다. 실제소비함수는begin/consume/finish다. 테스트에서만 enabled=true로제안장착fixture를명시사용. 이옵션은생산승인이아니며현재lookupActiveItemDefinition/definitions 전종은그대로비활성이다.

### API 계약

1. `begin(player,equipped,srcId)`는giantSlam/giantSlam2, 실제equipped.armor의UI-10/slotarmor제안에한정한다. 비장착/unknown/슬롯불일치/disabled는null·원행동.
2. 저장필드명은**미확정**. `readStoredRoll(item,definition,lookupRoll('UI-10'))` callback의유한number 반환만사용하고 `fromStoredValue('UI-10',value)`로정규저장분수0.10~0.20의정수%롤을검증한다. 10/20레거시정수·문자열·.155·범위밖값·누락을추정변환하지않고폴백한다. 기존 `_uSlamEmberRage` 필드를자동읽지않는다. 신규저장필드/포맷을만들지않았다.
3. 실제원함수의 `P.rage=0` 직후 원스냅샷 `_rageP`를consume에전달한다. **유한 consumed>=100**에한번만기록한다. 피해 `_rageMul`과VFX는원스냅샷을사용해그대로다.
4. 원함수전체가정상끝나야success=true. finally의finish는현재rage0·동일갑옷장착·유효consume일때 `P.rage=min(30,consumed×stored)` 직접대입. 실패/예외/소모없음/교체/다른분노가이미생긴경우추가복원0.
5. WeakMap token은플레이어당동시1개,중복consume/finish·위조token을거부. 재귀호출은새token을얻지못하며외부정상시전한건만1회복원한다. 연속호출의잔여20은100미만이므로다음소모시복원0. 저장하지않는시전수명상태이며전역장착스택합산없음.

원래스킬함수는쿨/ST gate를내부모두확인하지않으며호출부에서검사한다(본편12448/12451). 후보가원본gate를임의확대하거나실제성공을'적명중'으로새정의하지않았다. 원함수의악의부족return/예외는finish실패로복원없음; 소비자/외부호출gate통합은root가검수한다. _uEq는첫장착stat값을읽는현행이고후보는UI-10갑옷인스턴스의명시단위만사용해레거시stat중첩/다른슬롯효과이중지급을피한다.

## 검증표

| 검증 | 결과 |
|---|---|
| rage0/99/99.999, raw10/15/20 | 모두잔여0; >=100조건누락반례통과 |
| rage100, raw10/15/20 | 잔여10/15/20 |
| rage150/200/1000 | min30캡,원피해/VFX/악의/ST/랜덤호출수동일 |
| 정상원본대후보로그 | hit인자·원피해·VFX·합체부수효과같음. P/G는의도된최종분노만다름 |
| pillarSlam/infernoSlam giantSlam2 | 원쿨420f동일·부수스킬/장판동일 |
| slamStorm | 원parryBank/기폭호출/쿨동일 |
| mats0/controlled hit예외 | 원상태/로그와동일,환급0 |
| unknown/미장착/레거시/잘못된타입/disabled/invalidroll | 원행동동일 |
| 중복/재귀/장착교체/위조/미소모 | 추가분노생성차단 |
| 튜토리얼rageCast | 원콜백1회·같은소모값,후보추가콜백0 |
| U-N01/충만 | 현재game/easy에 `_uRageFullCd`/`_rageFullLatch` rg매칭0.후보는충만콜백/쿨회복을추가호출하지않음. fixture latch=true보존검사통과; **실제U-N01구현검수는아님** |

소비자자체RNG0; 원스킬의기존VFX/voice Math.random은동일시드대역에서동일횟수. source스택/합체쿨/분노소모를복제계산하지않고원함수전체를실행했다. VM외부meleeRef/statStr/_gSlamHit/VFX 등은통제대역이며실제 hurtE/적/프레임성능 검수가아니다.

## 입력해시·fail-closed

| 대상 | SHA256 |
|---|---|
| 본편activateGiantSlam | `2c2cb60f5af6a4759aa24efeea620673b621e7a0dad3658f0a480780f12c58fb` |
| easy activateGiantSlam | `9aa22aa9a97d75c9ee9908894f7cecad392c608350de3ef676ac13b029438fe7` |
| 본편후보함수 | `ad3b5e46c664c9f909e32676c8a891841cd060d578ce13aaddb1d0a157e35a3b` |
| easy후보함수 | `7bf3757a2b79c4a70ba8f5ad779da6da659a8edd516e45686b9018f02daaa33e` |
| definitions.js | `3f04bcc5ac90b039454f32dc9323e60bbe44dda27be7fd439a97633d1f25118a` |
| roll-values.js | `103d0460c738c117840586780eaaed7be7ebe0aba61fa50464db9d004b094975` |

검사기는두원함수source hash를잠그며소스변경시재인수한다. 후보변환기는rage청소지점누락/중복또는이미후보인소스를거부한다. HTML입력SHA는evidence.sources에있고본편44849/easy43561행은이번위치일뿐root는함수hash/원문으로대조한다. 원격f5292fa0은배정문서가제공한root대조상태이며이번에별도Git/네트워크대조하지않았다.

## docs·후속인수

docs전체 `rg -n 'U-D10|UI-10|_uSlamEmberRage|_uRageFullCd|_rageFullLatch|activateGiantSlam' docs --glob '*.md'` exit0; `d10-docs-related.txt` 보존. 본result에후보API·>=100/10~20%/30cap/실패·중복·필드미확정/실전미완료를정리했다. root가인수후TOP8·D10/PM009·팀대장에후보와생산상태를구분동기화한다. 공유docs원문·CHANGELOG수정0.

**다음게이트:** BALANCE독립검수 → root의저장롤필드/소비binding결정 → 후보를실제로연결할경우별도승인비활성gate와실게임명중·쿨·저장·패키지회귀. 실제전투성능은root QA 단독측정이며이번에새게임/브라우저/서버/빌드/새세션/하위에이전트/Git쓰기0. 자동생산적용0·전종활성0.
