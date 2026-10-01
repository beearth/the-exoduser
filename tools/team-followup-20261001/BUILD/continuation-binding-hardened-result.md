# binding 보강 독립 인수

**C2~C7 수정 확인. 전체 소스호환 인수는 보류: 20 PASS / 2 FAIL, exit1.** 실패를 숨기기 위해 VM 복원객체를 외부 JSON clone으로 바꾸지 않았다. 원 audit 로그·root source·타팀파일은 그대로 보존했다.

## 수신·Read·검수

수신/첫Read2026-10-01T14:27:57Z: 실제보강 binding-d10/ports를 읽었다. 현재 실제 모듈을 import하고 기존 ITEM 저장harness로 양쪽현행 dbSave/dbRestore를 실행했다. 외부 저장/계정/브라우저/서버는없다. root의통합60PASS는인계사항이고이번검사의수치를합산하지않았다. ITEM/UIUX/BALANCE의지원수정과제에재배정하지않았다.

전용실행: `node tools/team-followup-20261001/BUILD/continuation-binding-hardened-check.mjs` 최종exit1,20PASS/2FAIL. 최초자기AST walker의구문오류1회는전용파일만수정했다. 다음실행부터두storage realm실패가확인됐으며최종evidence에정확한객체상태를기록했다. 이것은binding소스를수정해통과시킨것이아니다.

## 원 반례별 결과

| 원ID | 실제수정후관측 | 판정 |
|---|---|---|
| C2 | toJSON있는생성입력은TypeError,hook0/RNG0 | 수정확인 |
| C3 | inherited schema는invalid,stored null | 수정확인 |
| C4 | nonenumerable uniqueRoll은invalid | 수정확인 |
| C5 | uniqueRoll accessor는invalid,getter0,예외누출0 | 수정확인 |
| C6 | storedValue accessor는invalid,getter0 | 수정확인 |
| C7 | inherited identity 생성port TypeError,RNG0 | 수정확인 |
| C1 | read/restore는missing유지·입력불변;명시create는여전히생성/RNG1 | 호출자계약. JSON으로fresh이력증명가능하다고하지않음 |
| C8 | socketCount누락시양쪽원본_fixCr RNG1 재현 | 기존소켓마이그레이션이며D10 roll재생성과구분 |

추가회귀: required schema5필드 nonenumerable거부, identity/slot getter거부, 재귀생성 sparse/cycle/nested toJSON/Date/undefined 거부, null-prototype JSON record 복사 통과. AST로inspect/readStoredRoll/readD10Binding/restore의직접call목록을수집하고create/rollValue호출없음을확인했다. 실제dbSave/dbRestore에도create/rollValue호출은없다. ports.read와restore는누락binding을보충하지않는다.

## 새 독립 관측

### N1 — 조건부 nested hook 경계 (exotic runtime input)

정확한형태:
```javascript
const item = {
  slot: 'armor', uniqueId: 'UI-10',
  extra: { toJSON() { item.uniqueRoll.storedValue = .2; return 'changed'; } },
  uniqueRoll: { ...validBindingWithStored15Percent }
};
```
inspect는valid/.15를반환하고JSON저장중extra.toJSON이1회실행돼저장uniqueRoll이.2가된다. **생성copyPlainItem은이입력을거부하며JSON로드에는hook이없다.** 생성guard수정의재발이라고하지않는다. inspect의valid가필수schema만보장하는지deep plain persistence까지보장하는지문서로범위를확정하거나저장경계에서깊은검증이필요하다. 생산저장파일공격/실게임발생을주장하지않는다.

### N2 — 실제 공유창고 복원 VM 객체의 realm 불일치

양쪽 source의_loadSharedStorage는VM에서JSON.parse한plain record를반환한다. 필드값/descriptor는canonical이고JSON왕복내용은정확히동일하지만Node모듈의plainRecord는`Object.getPrototypeOf(value)===Object.prototype`의**객체identity**를검사한다.

실제결과: 외부canonical good→valid; 실제storage 복원동일내용→invalid/invalid_item; missing-binding도missing이아닌invalid; 외부JSON clone으로재파싱하면valid. evidence에는sameObjectPrototype=false와각상태를기록했다. 그결과양쪽storage검사2건FAIL. bag/equipped는이harness에서외부JSON객체를대입하므로4건PASS이며다른realm까지보장한것이아니다.

이는현재독립Node/VM source-compatibility 반례다. 실제브라우저연결을실행하지않았고`.mjs` Node후보이므로브라우저게임고장으로단정하지않는다. 단일realm Node전용계약이면명시하고storage VM모델의realm제약을검수에표시해야한다. 여러realm소비를지원하려면prototype identity 대신안전한데이터descriptor/realm호환경계를검토하고원hook/prototype거부회귀를유지해야한다. root만수정권한을가진다.

## source SHA·범위

- binding-d10.mjs: `2f24f057a1fbffb6534e60f4dcc31c80c7fb9e6ee56c010bf2327a3fbc0e7cb4`
- binding-ports.mjs: `2b6bf07a42edc0336d976105015d2886fd4ef342aa6766131c29fdaf561a49a4`
- 실제game/easy/harness SHA와검사중입력불변검사결과는전용evidence.json. 기존audit source SHA와다르며old反례를보강소스에그대로성공이라고붙이지않았다.

docs 전체uniqueRoll/uniqueId/U-D10 검색원자료는전용docs.txt. root 동기화제안: 생성전용caller·required own-data/serialized hook거부·검사realm지원범위·C8 migration RNG분리. 공유docs/원반례로그/root source/타팀쓰기0. 게임/브라우저/서버/Git/queue/권한/새세션/하위에이전트0.

최종: 원보강C2~C7 인수가능. 새로운경계N1/N2는root범위결정/후속수정게이트. 실제게임효과/브라우저연결/저장활성완료로세지않는다.
