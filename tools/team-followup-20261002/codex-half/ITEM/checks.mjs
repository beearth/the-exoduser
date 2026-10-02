import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owned=`${root}/tools/team-followup-20261002/codex-half/ITEM`;
assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(owned),owned);
assert.equal(fs.realpathSync(`${owned}/TASK.md`),`${owned}/TASK.md`);
for(const name of ['checks.mjs','result.md','evidence.json'])if(fs.existsSync(`${owned}/${name}`))assert.equal(fs.lstatSync(`${owned}/${name}`).isSymbolicLink(),false,name);
const startedAt=new Date().toISOString();
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');
const read=p=>fs.readFileSync(`${root}/${p}`,'utf8');
const paths=['unique-item-project/definitions.js','unique-item-project/roll-values.js','tools/team-followup-20261001/ITEM/binding-d10.mjs','tools/team-followup-20261001/ITEM/d13-deferred-contract-candidate.mjs','tools/team-followup-20261002/project-teams/ITEM/result.md','tools/team-followup-20261002/project-teams/ITEM/evidence.json','tools/team-followup-20261002/codex-half/ITEM/TASK.md','game.html','game-easy-test.html','server.cjs','node-main.js','index.html'];
const before=paths.map(path=>({path,sha256:sha(read(path))}));
// 허용된 pure data 모듈 둘만 import. D10/전투/저장/생산 모듈은 읽기만 한다.
const definitions=await import(`${root}/unique-item-project/definitions.js`);
const rolls=await import(`${root}/unique-item-project/roll-values.js`);
const definition=definitions.lookupDefinition('UI-13'),roll=rolls.lookupRoll('UI-13');
assert.equal(definition.catalogName,'번지는 뿌리의 띠');assert.deepEqual(definition.slots,['belt']);
assert.equal(definition.effectId,'U-D13');assert.equal(definition.enabled,false);
assert.equal(roll.stat,'_uTrapOffshoot');assert.equal(roll.min,20);assert.equal(roll.max,40);
assert.equal(roll.unit,'percent');assert.equal(roll.runtimeReady,false);
const trace={rngCalls:0,getterCalls:0,storedReaderCalls:0,creationApiCalls:0};
const controlledMath=Object.create(Math);controlledMath.random=()=>{trace.rngCalls++;throw Error('검토 데이터에서 RNG 금지');};
const context=vm.createContext({
  Math:controlledMath,
  lookupItemProposal:definitions.lookupItemProposal,
  fromStoredValue:(id,value)=>{trace.storedReaderCalls++;return rolls.fromStoredValue(id,value);},
  noteGetter:()=>{trace.getterCalls++;return .20;}
});
// 검토 shape/API는 이 VM 안에만 존재한다. 저장/생성/소비 API로 export하지 않는다.
const candidateSource=String.raw`
const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const invalidData=Symbol('invalid data');
function plainRecord(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const prototype=Object.getPrototypeOf(value);
  if(prototype===null||prototype===Object.prototype)return true;
  const constructor=Object.getOwnPropertyDescriptor(prototype,'constructor')?.value;
  return Object.getPrototypeOf(prototype)===null&&typeof constructor==='function'
    &&Object.getOwnPropertyDescriptor(constructor,'prototype')?.value===prototype
    &&Function.prototype.toString.call(constructor)===Function.prototype.toString.call(Object);
}
function ownData(value,key){
  const descriptor=Object.getOwnPropertyDescriptor(value,key);
  return descriptor&&descriptor.enumerable&&owns(descriptor,'value')?descriptor.value:invalidData;
}
function inspect(item){
  const fail=(status,reason)=>Object.freeze({status,reason,storedValue:null,raw:null});
  try{
    if(!plainRecord(item)||owns(item,'toJSON'))return fail('invalid','invalid_item');
    if(!owns(item,'uniqueId'))return fail('legacy','no_unique_id');
    const definition=lookupItemProposal({uniqueId:ownData(item,'uniqueId'),slot:ownData(item,'slot')});
    if(definition?.uniqueId!=='UI-13')return fail('invalid','wrong_definition_or_slot');
    if(!owns(item,'uniqueRoll'))return fail('missing','missing_binding');
    const binding=ownData(item,'uniqueRoll');
    if(!plainRecord(binding)||owns(binding,'toJSON')||ownData(binding,'version')!==1
      ||ownData(binding,'effectId')!==definition.effectId||ownData(binding,'stat')!=='_uTrapOffshoot'
      ||ownData(binding,'unit')!=='fraction')return fail('invalid','schema_mismatch');
    const storedValue=ownData(binding,'storedValue');
    let raw;try{raw=fromStoredValue('UI-13',storedValue);}catch{return fail('invalid','invalid_stored_value');}
    return Object.freeze({status:'valid',reason:null,uniqueId:'UI-13',effectId:'U-D13',storedValue,raw,version:1,runtimeReady:false});
  }catch{return fail('invalid','invalid_data_properties');}
}
function restore(item){return item;}
function item(value=.20){return {uniqueId:'UI-13',slot:'belt',uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:value}};}
const wrongSlot=item();wrongSlot.slot='armor';
const wrongEffect=item();wrongEffect.uniqueRoll.effectId='U-D10';
const wrongStat=item();wrongStat.uniqueRoll.stat='_uSlamEmberRage';
const wrongUnit=item();wrongUnit.uniqueRoll.unit='percent';
const wrongVersion=item();wrongVersion.uniqueRoll.version=2;
const accessor=item();Object.defineProperty(accessor.uniqueRoll,'storedValue',{enumerable:true,configurable:true,get:noteGetter});
const fixtures=[
  {id:'minimum',label:'하한0.20',input:item(.20),expected:'valid',raw:20},
  {id:'maximum',label:'상한0.40',input:item(.40),expected:'valid',raw:40},
  {id:'missing',label:'UI-13 binding 누락',input:{uniqueId:'UI-13',slot:'belt'},expected:'missing'},
  {id:'legacy',label:'uniqueId 없는 legacy',input:{slot:'belt'},expected:'legacy'},
  {id:'wrong-slot',label:'잘못된 armor 슬롯',input:wrongSlot,expected:'invalid'},
  {id:'wrong-effect',label:'잘못된 effectId',input:wrongEffect,expected:'invalid'},
  {id:'wrong-stat',label:'잘못된 stat',input:wrongStat,expected:'invalid'},
  {id:'wrong-unit',label:'잘못된 percent 단위',input:wrongUnit,expected:'invalid'},
  {id:'wrong-version',label:'잘못된 version2',input:wrongVersion,expected:'invalid'},
  {id:'noncanonical',label:'비정규0.205',input:item(.205),expected:'invalid'},
  {id:'nonnumeric',label:'문자열0.20',input:item('0.20'),expected:'invalid'},
  {id:'accessor',label:'own enumerable getter1개',input:accessor,expected:'invalid'}
];
({inspect,restore,fixtures,flags:Object.freeze({status:'proposal',runtimeReady:false,enabled:false,schemaAdopted:false,productionApplied:false})});
`;
const api=vm.runInContext(candidateSource,context,{timeout:1000}),rows=[];
for(const fixture of api.fixtures){
  const input=fixture.input,binding=Object.getOwnPropertyDescriptor(input,'uniqueRoll')?.value;
  const outer=Object.getOwnPropertyDescriptors(input),nested=binding?Object.getOwnPropertyDescriptors(binding):null;
  const snapshot={...trace};
  const result=api.inspect(input),restored=api.restore(input);
  assert.equal(result.status,fixture.expected,fixture.id);
  if(fixture.expected==='valid'){assert.equal(result.raw,fixture.raw);assert.equal(result.storedValue,fixture.raw/100);}
  else{assert.equal(result.raw,null);assert.equal(result.storedValue,null);}
  assert.equal(restored,input);assert.equal(Object.getOwnPropertyDescriptor(input,'uniqueRoll')?.value,binding);
  assert.deepEqual(Object.getOwnPropertyDescriptors(input),outer);
  if(binding)assert.deepEqual(Object.getOwnPropertyDescriptors(binding),nested);
  assert.equal(trace.getterCalls,snapshot.getterCalls);assert.equal(trace.rngCalls,snapshot.rngCalls);
  rows.push({id:fixture.id,label:fixture.label,status:'PASS',classification:result.status,reason:result.reason,storedValue:result.storedValue,rawReadOnly:result.raw,restoreSameIdentity:true,nestedSameIdentity:true,inputDescriptorChanges:0,nestedDescriptorChanges:0,repairs:0,rngCalls:trace.rngCalls-snapshot.rngCalls,getterCalls:trace.getterCalls-snapshot.getterCalls});
}
// 유효 plain JSON만1회 왕복한다. getter fixture는 직렬화하지 않는다.
const valid=api.fixtures[0].input;
const serialized=JSON.stringify(valid),roundTrip=JSON.parse(serialized);
assert.equal(JSON.stringify(roundTrip),serialized);
assert.equal(roundTrip.uniqueId,'UI-13');assert.equal(roundTrip.slot,'belt');assert.equal(roundTrip.uniqueRoll.storedValue,.20);
assert.equal(api.restore(roundTrip),roundTrip);assert.equal(api.inspect(roundTrip).status,'valid');
assert.equal(Object.prototype.hasOwnProperty.call(roundTrip.uniqueRoll,'raw'),false);
assert.equal(trace.getterCalls,0);assert.equal(trace.rngCalls,0);
const query='U-D13|_uTrapOffshoot|UI-13|uniqueRoll|fromStoredValue|재롤';
const search=spawnSync('rg',['-n','--',query,'docs/'],{cwd:root,encoding:'utf8'});
assert.equal(search.status,0,search.stderr);
const matches=search.stdout.trim().split('\n').filter(Boolean),files=[...new Set(matches.map(row=>row.split(':')[0]))].sort();
const preservation=before.map(row=>{const after=sha(read(row.path));assert.equal(after,row.sha256,row.path);return {...row,afterSha256:after,unchanged:true};});
const completedAt=new Date().toISOString();
const evidence={task:'d13-binding-data-review',status:'data-only VM 후보 검수 완료 / 생산 미채택',flags:api.flags,preparationFailures:[{phase:'첫 Node 명령의 module parse',exitCode:1,error:"SyntaxError: Unexpected identifier rawReadOnly",cause:'보고서 template literal 안의 미이스케이프 backtick',vmExecuted:false,repair:'본인 checks.mjs의 보고서 문자열만 수정',productionChanged:false}],
  events:[{phase:'TASK 전체 Read 및 수신 관찰',at:'2026-10-02T04:30:52Z',limit:'도구 완료 뒤 실제 clock 관찰, 정확한 메시지 도착시각 아님'},{phase:'VM 실행 시작',at:startedAt},{phase:'VM/JSON/보존/docs 검수 완료',at:completedAt}],
  head:null,changes:null,headChangesSource:'TASK의 Git 명령 금지 확인 이후 재조회0. 최종 HEAD/Changes는 총괄 인수 대상',
  protocolException:{phase:'TASK Read와 병렬 초기 상태 조회',readOnlyGitCommands:['GIT_OPTIONAL_LOCKS=0 git status --short --untracked-files=all | wc -l','git rev-parse HEAD'],observedChanges:63,observedHead:'8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82',time:'2026-10-02T04:30:52Z',gitWrites:0,afterTaskReadGitCommands:0,reportedInCommentary:true},
  pathBoundary:{root,owned,rootRealpath:fs.realpathSync(root),ownedRealpath:fs.realpathSync(owned),symlink:false,outputs:['checks.mjs','result.md','evidence.json']},
  inheritedCompleted:{callback32:'인수만, 재실행0',callerLifecycle22:'project-teams/ITEM/result.md 및 evidence 인수만, 재실행0',d10AndRollAudit:'기존 D10 검사/698롤 감사 재실행0'},
  reads:['AGENTS.md','docs/7아이템디자인/유니크_어픽스_리스트.md D절/D13','docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md 컬렉션/주의/D10binding','tools/team-followup-20261002/project-teams/ITEM/result.md','tools/team-followup-20261002/project-teams/ITEM/evidence.json','unique-item-project/definitions.js','unique-item-project/roll-values.js','tools/team-followup-20261001/ITEM/binding-d10.mjs'],
  lookup:{definition,slotLookup:definitions.lookupItemProposal({uniqueId:'UI-13',slot:'belt'}),activeLookup:definitions.lookupActiveItemDefinition({uniqueId:'UI-13',slot:'belt'}),roll},
  vm:{candidateSha256:sha(candidateSource),inputs:rows.length,passed:rows.length,failed:0,rows,trace,jsonRoundTrip:{count:1,status:'PASS',serialized,identityInformationPreserved:true,restoreSameObject:true,realm:'VM 생성→host JSON parse→VM inspect/restore. native plain Object prototype을 허용하는 D10 방식 참고. 임의 realm/Proxy 감사0'}},
  preservation,docsSearch:{command:['rg','-n','--',query,'docs/'],lines:matches.length,files:files.length,paths:files,outputSha256:sha(search.stdout)},
  limitations:['검토 shape 미채택. same/native Object prototype 또는 null prototype의 plain record만 허용.','plainRecord/descriptor는 Proxy trap을 실행할 수 있으므로 실행 격리 경계가 아님.','own toJSON 정적 거부가 임의 직렬화 hook/Proxy 실행 격리를 입증하지 않으며 해당 감사0.','JSON 왕복은 valid plain1입력만. getter 입력은 JSON화하지 않음.','rawReadOnly는 조회 결과만이며 저장 필드가 아님.','RNG0은 이 데이터 VM과 pure stored reader 범위이며 게임 전체의 RNG 판정이 아님.','실제 생산 생성/장착/저장라우터/브라우저/전투/child payload/runtime/visual 미검수.'],
  counters:{schemaAdopted:false,productionApplied:false,repairs:0,inputMutations:0,rawStoredCopies:0,newGenerationApiCalls:0,rngCalls:0,getterCalls:0,productionImports:0,combatCalls:0,gitWrites:0,afterTaskReadGitCommands:0,server:0,ui:0,game:0,build:0,deletes:0,outsideWrites:0,newSessions:0,subteams:0}};
const md=`# ITEM — D13 저장 데이터 VM 경계 검토\n\n검토 우선순위는 **신뢰된 새 생성/저장/장착 소비 → source lifecycle/payload → runtime**이다. 이번 검토 shape는 VM 안의 미채택 제안이며 생산 연결0이다. proposal, runtimeReady=false, enabled=false, schemaAdopted=false, productionApplied=false를 유지한다. **source/data fixture PASS ≠ runtime/visual PASS.**\n\n## 실제 정의와 검토 schema\n\n| id·한글명/필드 | 현행 정의·검토 계약 | 적용/한계 |\n|---|---|---|\n| UI-13 / U-D13 | 번지는 뿌리의 띠, belt, _uTrapOffshoot | 실제 lookup 확인; enabled=false·effectStatus=unimplemented·active lookup=null |\n| uniqueRoll | {version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue} | checks 내부 VM에서만 정의, schema 채택0 |\n| 롤/단위 | 정수20~40%, 하20~26/중27~33/상34~40; 정규 저장0.20~0.40 | fromStoredValue('UI-13',stored) 재사용. raw/100 === stored 확인. raw 중복 저장0·기본값 보충0 |\n| 입력·읽기 | own enumerable data 필드, plain record | D10 plainRecord/ownData 방식 참고; get 함수 실행0 |\n| restore | 전달 객체 그대로 반환 | 생성/수리/재롤0; missing/legacy/invalid를 구분하며 변환0 |\n\nlookup 전 실제 source SHA를 확보했다. definitions.js ${before[0].sha256}; roll-values.js ${before[1].sha256}; binding-d10.mjs ${before[2].sha256}. 상세 lookup 객체와 모두의 최종 동일 SHA는 evidence에 있다.\n\n## 최소 입력별 결과\n\n| 입력 | 판정 | 저장값/읽기 raw | identity·중첩 보존 | 수리/RNG/getter/변이 |\n|---|---|---|---|---|\n${rows.map(r=>`| ${r.label} | ${r.classification} PASS | ${r.storedValue??'null'} / ${r.rawReadOnly??'null'} | 같은 객체/descriptor 유지 | 0/0/0/0 |`).join('\n')}\n\n12입력 모두 PASS. 원 입력/uniqueRoll 참조·각 property descriptor 전후 동일이다. getter1개는 enumerable own이지만 value descriptor가 없어 invalid이며 실행0이다. valid plain JSON1개를 VM에서 host로 딱1회 왕복했고 uniqueId/slot/version/effect/stat/unit/0.20 내용 동일, raw 저장 없음, host 객체를 VM restore에 전달한 뒤 같은 객체 반환을 확인했다. JSON parse 결과가 원 입력과 같은 객체라는 뜻은 아니다.\n\nD10의 cross-realm native Object prototype 판정 방식을 VM 안에 참고했다. same/native Object prototype 또는 null prototype의 plain record만 허용하며 이번 host→VM plain JSON 사례만 확인했다. 임의realm/Proxy/직렬화hook 실행 격리 보장이나 보안감사로 확대하지 않는다. getter fixture는 JSON.stringify하지 않았다. 생성/굴림/전투/저장함수와 기존 D13 callback은 호출하지 않았다.\n\n## 범위·결함·후속 Gate\n\n| 구분 | 결과/근거 | 미검수·다음 인수 |\n|---|---|---|\n| 실제 source 소비 | 허용한 definitions.js/roll-values.js pure data 모듈만 import; fromStoredValue는 정규 저장 검증 | 신규 item 생성의 출처 보장, 실제 장착/세이브 소비 |\n| 후보 VM | 지정12입력＋JSON왕복1 PASS; RNG/getter/수리/변이0 | schema 미채택·productionApplied=false. missing/legacy 자동 보충 없음 |\n| 보존 | 생산5파일·기존 후보/완료산출/데이터·immutable TASK 포함 ${preservation.length}경로 SHA 동일 | 타팀 WIP 전체를 검수했다는 주장은 하지 않음 |\n| 기존 완료 | callback32·caller 지도22·D10·698롤 감사 반복0 | child payload·cap·겹침·비동기 clear/source 연결은 별도 |\n| 실제 제품 | 서버/HTTP/게임/앱/UI/빌드/실저장0 | 브라우저/전환·연쇄·보스/실전성능/visual·패키지 Gate |\n\n첫 Node 명령은 보고서 template literal의 backtick 때문에 module parse에서 실패했고 VM 실행0이었다. 본인 검수기 문자열만 수정한 뒤 VM 입력12/JSON1을 통과했다. VM 데이터 결함0이며 준비 단계 문법 실패1을 evidence에 보존했다. 검토 shape와 모듈 자체의 전체 보안·완전한 schema 검사를 입증한 것은 아니다. rawReadOnly는 인수 결과에만 기록하며 아이템/uniqueRoll에 넣지 않는다.\n\n## docs 동기화 인계안\n\n코드 산출 후 docs 전체 관련 키워드 rg: ${matches.length}행/${files.length}파일. 경로 목록/명령/출력 SHA는 evidence.docsSearch에 보존했다. 공유 docs 수정0이며 총괄에게 다음 문장을 인계한다.\n\n| 대상 | 정확한 추가 기록안 | 유지사항 |\n|---|---|---|\n| ITEM_TEAM_MASTER D13 말미 | “D13 data-only binding VM 검토: UI-13/belt·fraction0.20~0.40, 최소12입력＋JSON1왕복 PASS. getter/RNG/수리/변이0, schema 미채택·생산연결0. 상세 codex-half/ITEM/result.md.” | 기존callback32/지도22와 별도, 구현완료로 변경0 |\n| 저장SSOT D13 검토 구역 | “uniqueRoll version1/effectId U-D13/stat _uTrapOffshoot/unit fraction은 VM 검토 shape. restore 동일 객체 유지; missing/legacy/invalid 보충/재롤0. 생산 저장 schema 채택 아님.” | 기존 INV 통짜 저장·구세이브 migration 불변 |\n| TOP8/D절 | “D13 저장 데이터 최소 경계 검토 인수, 실제 생성/저장/장착 공급→source lifecycle/payload→runtime Gate 유지.” | 20~40%·150px·180f·시전당1·미결cap/겹침 그대로 |\n\n## 실행/운영 기록\n\n실행 ${startedAt}→${completedAt}. Node 절대경로는 /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node. 경로 realpath가 지정 체크아웃/소유 폴더와 같고 symlink=false를 확인했다. 산출은 checks.mjs/result.md/evidence.json 3개만, TASK·소유밖 쓰기/삭제/cleanup0이다.\n\n**운영 예외:** TASK 전체 Read와 병렬인 초기 명령에서 읽기 전용 Git 상태/HEAD 조회 각1회를 실행했다. TASK의 Git 명령0 지시 확인 후 추가 조회0·Git쓰기0이며 당시 관찰은 evidence.protocolException에 격리 기록한다. HEAD/Changes를 이후 추정하지 않고 최종 인수는 총괄에게 남긴다. 기존 완수/원후보는 보존하고 다른 채팅 메시지·자동 다음 일감·새세션/하위팀0이다.\n`;
for(const name of ['checks.mjs','result.md','evidence.json'])assert.equal(`${owned}/${name}`.startsWith(`${owned}/`),true);
fs.writeFileSync(`${owned}/result.md`,md);
evidence.outputs=['checks.mjs','result.md'].map(name=>({path:`tools/team-followup-20261002/codex-half/ITEM/${name}`,sha256:sha(fs.readFileSync(`${owned}/${name}`)),bytes:fs.statSync(`${owned}/${name}`).size}));
fs.writeFileSync(`${owned}/evidence.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({task:evidence.task,inputs:12,passed:12,jsonRoundTrip:1,trace,readonlyFiles:preservation.length,docsLines:matches.length,docsFiles:files.length,flags:api.flags,completedAt,outputs:evidence.outputs},null,2));
