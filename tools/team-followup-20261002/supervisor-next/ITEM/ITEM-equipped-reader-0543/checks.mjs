import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equipped-reader-0543');
assert.equal(fs.realpathSync(process.cwd()),root);assert.equal(fs.realpathSync(owner),owner);
assert.equal(fs.lstatSync(owner).isSymbolicLink(),false);
const started=new Date().toISOString(),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=['AGENTS.md','game.html','game-easy-test.html','node-main.js',
 'tools/team-followup-20261002/continuous/COMMON.md',path.relative(root,path.join(owner,'TASK.md')),
 'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md',
 'docs/7아이템디자인/유니크_어픽스_리스트.md','docs/7아이템디자인/ITEM_TEAM_MASTER.md',
 'docs/15 세이브+데이터구조/15 세이브+데이터구조.md',
 'tools/team-followup-20261002/codex-half/ITEM/checks.mjs',
 'tools/team-followup-20261002/codex-half/ITEM/result.md','tools/team-followup-20261002/codex-half/ITEM/evidence.json',
 'tools/team-followup-20261002/continuous/ITEM/checks.mjs','tools/team-followup-20261002/continuous/ITEM/result.md','tools/team-followup-20261002/continuous/ITEM/evidence.json',
 'tools/team-followup-20261002/continuous/ITEM/lifecycle/result.md','tools/team-followup-20261002/continuous/ITEM/lifecycle/evidence.json',
 'unique-item-project/definitions.js','unique-item-project/roll-values.js'];
const reads=paths.map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')}));
const source=reads.find(r=>r.path==='game.html').text,refs=[];
function fn(text,name,file){const i=text.indexOf('function '+name+'(');assert(i>=0);const ast=parseExpressionAt(text,i,{ecmaVersion:'latest'});const body=text.slice(i,ast.end);refs.push({file,name,line:text.slice(0,i).split('\n').length,sha256:hash(body),bytes:Buffer.byteLength(body)});return body;}
const equip=fn(source,'equipItem','game.html'),uEq=fn(source,'_uEq','game.html');
const prior=reads.find(r=>r.path==='tools/team-followup-20261002/codex-half/ITEM/checks.mjs').text;
const begin=prior.indexOf('const owns=(value,key)=>'),end=prior.indexOf('function restore(item)',begin);
assert(begin>=0&&end>begin);
const reader=prior.slice(begin,end); // Only prior VM reader declarations; no fixtures/runner/writes.
refs.push({file:'tools/team-followup-20261002/codex-half/ITEM/checks.mjs',name:'own-data inspect fragment',line:prior.slice(0,begin).split('\n').length,sha256:hash(reader),bytes:Buffer.byteLength(reader)});
const defs=await import(pathToFileURL(path.join(root,'unique-item-project/definitions.js')));
const rolls=await import(pathToFileURL(path.join(root,'unique-item-project/roll-values.js')));
fn(reads.find(r=>r.path==='unique-item-project/roll-values.js').text,'fromStoredValue','unique-item-project/roll-values.js');

const input=[
 {id:'old',slot:'belt',name:'기존 허리띠',rarity:0,enh:0,crystals:[],_gx:0,_gy:0,reqLv:0},
 {id:'d13',slot:'belt',name:'번지는 뿌리의 띠',rarity:5,enh:0,crystals:[],_gx:5,_gy:6,reqLv:0,uniqueId:'UI-13',uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:.30}},
 {id:'ordinary',slot:'belt',name:'일반 허리띠',rarity:0,enh:0,crystals:[],_gx:9,_gy:10,reqLv:0}
];
const rows=[],passed=[];
function check(label,fn){fn();passed.push(label);}
function run(withReader){
  const [old,bound,ordinary]=structuredClone(input),binding=bound.uniqueRoll;
  const bindingBefore=Object.getOwnPropertyDescriptors(binding),itemBefore=Object.getOwnPropertyDescriptor(bound,'uniqueRoll');
  const trace={rng:0,save:0,recalc:0,equipSfx:0,lesson:0,storedReader:0,creation:0},events=[],queries=[],states=[];
  let context;
  function query(point){
    const current=context.INV.equipped.belt,production=vm.runInContext("_uEq('_uTrapOffshoot')",context);
    const review=withReader?vm.runInContext('queryEquippedD13()',context):null;
    queries.push({point,id:current.id,production,classification:review?.status??null,value:review?.storedValue??null,active:false});
  }
  const math=Object.create(Math);math.random=()=>{trace.rng++;throw Error('unexpected RNG');};
  context=vm.createContext({Math:math,P:{lv:100},INV:{bag:[bound,ordinary],equipped:{belt:old}},G:{mats:0},SLOT_NAMES:['belt'],
    _earringEquipTarget:null,_earringSlot:()=>false,_equipSlot:i=>i.slot,_itemSz:()=>[1,1],
    _invFindSpace:()=>{throw Error('same-size grid should not request new space');},
    recalcSt:()=>{trace.recalc++;events.push('recalc');},playEquipSfx:i=>{trace.equipSfx++;events.push('sfx:'+i.id);},
    notify:s=>events.push('notify:'+s),_T:s=>s,_L:s=>s,
    window:{_systemLesson:{equipped:i=>{trace.lesson++;events.push('lesson:'+i.id);}}},
    dbSaveForce:()=>{trace.save++;events.push('save');query('save'+trace.save);},
    lookupItemProposal:defs.lookupItemProposal,
    fromStoredValue:(id,value)=>{trace.storedReader++;return rolls.fromStoredValue(id,value);}});
  vm.runInContext(equip+'\n'+uEq,context);
  if(withReader)vm.runInContext(reader+'\nfunction queryEquippedD13(){return inspect(INV.equipped.belt);}',context);
  const snapshot=()=>({equipped:context.INV.equipped.belt.id,bag:context.INV.bag.map(i=>i.id),items:[old,bound,ordinary].map(i=>({id:i.id,slot:i.slot,gx:i._gx,gy:i._gy,enh:i.enh,crystals:[...i.crystals]}))});
  query('initial');states.push(snapshot());
  context.next=bound;
  const first=vm.runInContext('equipItem(next)',context);
  assert.equal(context.INV.equipped.belt,bound);assert(context.INV.bag.includes(old));assert(!context.INV.bag.includes(bound));
  states.push(snapshot());
  context.next=ordinary;
  const second=vm.runInContext('equipItem(next)',context);
  assert.equal(context.INV.equipped.belt,ordinary);assert(context.INV.bag.includes(bound));assert(!context.INV.bag.includes(ordinary));
  assert.equal(context.INV.bag[0],old);assert.equal(context.INV.bag[1],bound);
  assert.equal(bound.uniqueRoll,binding);assert.deepEqual(Object.getOwnPropertyDescriptors(binding),bindingBefore);
  assert.deepEqual(Object.getOwnPropertyDescriptor(bound,'uniqueRoll'),itemBefore);
  for(const item of [old,bound,ordinary])assert(!Object.hasOwn(item,'_uTrapOffshoot'));
  states.push(snapshot());
  return {trace,events,queries,states,returns:[first,second],bindingUnchanged:true,itemIdentitiesPreserved:true};
}
const baseline=run(false),candidate=run(true);
check('production direct-stat reader remains disconnected across occupied chain',()=>assert.deepEqual(baseline.queries.map(q=>q.production),[0,0,0]));
check('current binding adapter follows old -> UI13 -> ordinary at actual save callsite',()=>{assert.deepEqual(candidate.queries.map(q=>q.classification),['legacy','valid','legacy']);assert.deepEqual(candidate.queries.map(q=>q.value),[null,.30,null]);assert.deepEqual(candidate.queries.map(q=>q.id),['old','d13','ordinary']);});
check('same actual equip return/state/grid/old-item identity as original',()=>{assert.deepEqual(candidate.returns,[undefined,undefined]);assert.deepEqual(candidate.states,baseline.states);assert.deepEqual(candidate.states.map(s=>s.bag),[['d13','ordinary'],['ordinary','old'],['old','d13']]);});
check('recalc/audio/lesson/save call order preserved and RNG zero',()=>{assert.deepEqual(candidate.events,baseline.events);assert.equal(candidate.trace.rng,0);assert.equal(baseline.trace.rng,0);for(const k of ['save','recalc','equipSfx','lesson'])assert.equal(candidate.trace[k],2);});
check('nested binding untouched; current query does not generate/cache/duplicate stats',()=>{assert(candidate.bindingUnchanged&&candidate.itemIdentitiesPreserved);assert.equal(candidate.trace.storedReader,1);assert.equal(candidate.trace.creation,0);});

const args=['-n','UI-13|U-D13|_uTrapOffshoot|uniqueRoll|fromStoredValue|equipItem|_uEq|장착','docs/'];
const search=spawnSync('rg',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);
const matches=search.stdout.trim().split('\n'),docs=[...new Set(matches.map(s=>s.split(':')[0]))];
const preserved=reads.map(r=>({path:r.path,sha256Before:hash(r.text),sha256After:hash(fs.readFileSync(path.join(root,r.path))),unchanged:hash(r.text)===hash(fs.readFileSync(path.join(root,r.path)))}));
assert(preserved.every(r=>r.unchanged));
const ended=new Date().toISOString(),flags={schemaAdopted:false,enabled:false,runtimeReady:false,productionApplied:false};
const evidence={taskId:'ITEM-equipped-reader-0543',provider:'existing Codex ITEM chat',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',currentChatId:null,
 providedBaseline:{commit:'f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c',source:'supervisor TASK 05:42 UTC observation; not current HEAD independently queried'},
 root,owner,realpath:fs.realpathSync(owner),symlink:false,time:{startedUTC:started,endedUTC:ended,endedKST:new Date(Date.parse(ended)+32400000).toISOString().replace('Z','+09:00')},
 reads:preserved,sourceFragments:refs,flags,baseline,candidate,validation:{newDistinctChain:1,initialItems:3,chainRuns:2,actualEquipCalls:4,assertionGroups:passed.length,passed,failed:0,priorTestsRepeated:0},
 actual:['equipItem full source function','_uEq full source function','prior own-data inspect declarations only','pure definitions lookupItemProposal/fromStoredValue'],
 synthetic:['UI13 binding injected test item; not a drop or generation API','P.lv=100 / belt-only SLOT_NAMES / initial occupied belt','same-size grid helper 1x1, identity equip slot','recalcSt/audio/notify/lesson/save counters; no real effects/API'],
 unexecuted:['enhancement transfer/cost/refund','crystal transfer','grid resize/space failure','pickup/generation/save/restore','spikeTrap/child/cast/hit/kill policies'],
 commands:[{command:'cat TASK/COMMON; bounded sed/rg own reader/source/SSOT/current role table; cat AGENTS',exit:0},{command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:0}],
 docsSearch:{command:['rg',...args],exit:search.status,lines:matches.length,files:docs,outputSHA256:hash(search.stdout)},errors:[],
 ownership:{production:0,sharedDocs:0,priorArtifacts:0,git:0,UIgameServerBuildSave:0,deletion:0,newSessionsSubagentsMessages:0,writes:['checks.mjs','result.md','evidence.json']},toolsActuallyCalled:['functions.exec / exec_command','functions.exec / apply_patch'],skillsUsed:[],changesCount:null,changesReason:'supervisor owns monitoring; Git prohibited'};
const table=refs.map(r=>`| ${r.file}:${r.line} / ${r.name} | ${r.sha256} |`).join('\n');
const result=`# ITEM — occupied belt 교체와 D13 현재 장착 조회\n\n**미연결 관측→검토 reader 접점 비교 완료: 단일 occupied 교체 chain, 새5검증그룹 PASS.** 생산 _uEq를 수정하지 않고 기존 미채택 own-data inspect를 현재 INV.equipped.belt 조회에 연결했다. 4플래그false/생산0이며 효과 활성·신규 생성·저장 schema 채택이 아니다.\n\n## 실제 source와 대역\n\n| 추출/읽기 원문 | SHA-256 |\n|---|---|\n${table}\n\n실제 game.html 읽기 UTC ${started}, SHA ${preserved.find(r=>r.path==='game.html').sha256Before}; 종료 ${ended}에 같은 SHA. 기준 f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c는 감독 제공 원격 관측이며 Git 독립조회0이다. 이전7e694950/6c77 입력과 구분한다.\n\nactual equipItem 전체함수와 _uEq 전체함수를 VM에서 실행했다. 기존 codex-half 검수기의 const owns부터 inspect 종료까지 **reader 선언만 원문 추출**하여 실행했고 이전 runner/fixtures/write 코드를 import/실행하지 않았다. definitions.js/roll-values.js pure data 모듈만 import하여 기존 lookupItemProposal/fromStoredValue를 사용했다. 새 queryEquippedD13()는 inspect(INV.equipped.belt) 한 줄의 메모리 접점이다. cache·직접 stat 필드·합산·생성 API 없음.\n\n대역은 P.lv100·belt-only 슬롯 순회·동일1×1 크기·equipSlot identity·recalc/audio/notify/lesson/save counter다. old는 enh0/crystals[]이고 두 신규 장비도 같아 강화비용/결정전승은 실행하지 않았다. 실제 equipItem의 old 반환·그리드 이전·bag filter·장착·후처리·save 호출은 원문 실행이다. 합성 UI13 binding값0.30은 기존 정수20~40%/fraction0.20~0.40 계약의 한 대표값이며 실제 드롭/신뢰된 생산 생성 증거가 아니다.\n\n## 한 chain의 전후 비교\n\n| 호출 시점 | 현재 belt | 원문 _uEq(_uTrapOffshoot) | 후보 inspect 분류/값 | 가방 순서 |\n|---|---|---|---|---|\n| initial query | old | 0 | legacy / null | d13,ordinary |\n| equipItem(d13) 내부 dbSaveForce 대역 시점 | d13 | 0 | valid / 0.30 | ordinary,old |\n| equipItem(ordinary) 내부 dbSaveForce 대역 시점 | ordinary | 0 | legacy / null | old,d13 |\n\n두 원함수 반환값 모두 undefined. 같은 chain을 원문/후보 각1회 실행(총 실제equip4회), 원문0→0→0와 후보null→0.30→null을 비교했다. 상태/가방 순서/아이템 identity/그리드 이전이 동일하고 old 및 교체된 d13가 각각 동일 객체로 가방에 돌아왔다. bound.uniqueRoll 참조와 중첩 descriptor는 그대로이며 direct _uTrapOffshoot 저장0이다.\n\n두 run의 recalc→equipSfx→notify→lesson→save 호출 순서는 같고 각 recalc/equipSfx/lesson/save2회, RNG0이다. 후보 fromStoredValue는 현재 d13에서1회만 호출됐다. reader 생성/수리/재롤0이며 ordinary로 교체된 뒤 이전 d13값을 반환하지 않는다. query 시점 현재 장비 읽기 검수이며 cast/hit/kill snapshot 시점 선택이 아니다. getter fixture/legacy schema matrix/JSON roundtrip/empty-slot 검사는 재실행하지 않았다.\n\n${passed.map(s=>'- '+s).join('\n')}\n\n## docs canonical 인계\n\n코드 작성 후 docs 전체 관련 rg: ${matches.length}행/${docs.length}파일. 공유docs 쓰기0이며 아래 문안을 원총괄에 인계한다.\n\n| 정본 | 정확한 추가 문안 |\n|---|---|\n| ITEM_TEAM_MASTER D13 | “ITEM-equipped-reader-0543: actual equipItem의 occupied belt old→합성UI-13→ordinary 단일 교체 chain을 원문/후보 각1회 비교했다. 기존 own-data inspect와 fromStoredValue로 현재 INV.equipped.belt를 조회하면 legacy/null→valid/0.30→legacy/null이며 원문 _uEq는 직접stat 미공급으로0→0→0이다. 새5그룹 PASS, 기존검사 반복0·생산0·4플래그false.” |\n| 저장 SSOT binding 검토 | “D13 장착 조회 후보는 query 시점 현재 belt만 기존 own-data inspect로 읽는다. 장착 교체 후 이전 binding값 cache/snapshot 없음, 생성/누락보충/재롤/직접stat 중복저장0. occupied 교체의 old 반환·가방/그리드/반환값·save대역 순서는 원문과 동일. schema미채택·실저장미검수이며 cast/hit/kill snapshot 결정과 별개다.” |\n\n## 범위·다음 Gate\n\nUTC ${started}→${ended}; KST evidence 기록. ${preserved.length} 읽기경로 시작/종료 SHA 동일. 이전 공급3입력/5그룹·own-data12+JSON1·callback32·caller22·parent 조사 반복/합산0. 독립 새검수5그룹만 보고한다. checks/result/evidence3파일 소유이며 TASK·기존 산출/타인WIP 보존, Git/UI/실게임/서버/실저장/빌드/삭제/메시지/새세션0.\n\nsource VM PASS는 강화/결정/실제 stat 재계산·효과·DB·브라우저·성능·시각·제품 PASS가 아니다. schemaAdopted=false, enabled=false, runtimeReady=false, productionApplied=false. 데이터 공급·생산 reader 인수와 lifecycle/child factory/cap/겹침/clear/롤snapshot 시점 Gate는 여전히 원총괄/감독 결정 대상이며 새 정책을 확정하지 않았다.\n`;
fs.writeFileSync(path.join(owner,'result.md'),result);
evidence.ownedHashes={checks:hash(fs.readFileSync(path.join(owner,'checks.mjs'))),result:hash(result)};
fs.writeFileSync(path.join(owner,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({task:evidence.taskId,assertionGroups:passed.length,chainRuns:2,actualEquipCalls:4,reader:candidate.queries,trace:candidate.trace,preserved:preserved.length,docsLines:matches.length,docsFiles:docs.length,flags,ended}));
