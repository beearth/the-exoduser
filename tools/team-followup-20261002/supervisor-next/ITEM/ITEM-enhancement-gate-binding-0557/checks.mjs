import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {parseExpressionAt} from 'acorn';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557');
assert.equal(fs.realpathSync(process.cwd()),root);assert.equal(fs.realpathSync(owner),owner);assert(!fs.lstatSync(owner).isSymbolicLink());
const started=new Date().toISOString(),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=['AGENTS.md','game.html','game-easy-test.html','tools/team-followup-20261002/continuous/COMMON.md',path.relative(root,path.join(owner,'TASK.md')),
 'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md',
 'docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md','docs/14밸런스+수치테이블/자원소비량표.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md',
 'docs/7아이템디자인/유니크_어픽스_리스트.md','docs/7아이템디자인/ITEM_TEAM_MASTER.md',
 'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equipped-reader-0543/checks.mjs',
 'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equipped-reader-0543/result.md','tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equipped-reader-0543/evidence.json',
 'tools/team-followup-20261002/codex-half/ITEM/checks.mjs','unique-item-project/definitions.js','unique-item-project/roll-values.js'];
const read=paths.map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')})),refs=[];
const source=read.find(r=>r.path==='game.html').text;
function fn(name){const i=source.indexOf('function '+name+'(');assert(i>=0,name);const a=parseExpressionAt(source,i,{ecmaVersion:'latest'});const text=source.slice(i,a.end);refs.push({file:'game.html',name,line:source.slice(0,i).split('\n').length,sha256:hash(text)});return text;}
const functions=['equipItem','xferCost','_malCost','_itemEconomyRarity','enhColor'].map(fn).join('\n');
const constMatch=/const _MALICE_COST_MUL=([^;]+);/.exec(source);assert(constMatch);const malConstant=constMatch[0];
refs.push({file:'game.html',name:'_MALICE_COST_MUL',line:source.slice(0,constMatch.index).split('\n').length,sha256:hash(malConstant)});
const prior=read.find(r=>r.path==='tools/team-followup-20261002/codex-half/ITEM/checks.mjs').text;
const ri=prior.indexOf('const owns=(value,key)=>'),re=prior.indexOf('function restore(item)',ri);assert(ri>=0&&re>ri);
const reader=prior.slice(ri,re);refs.push({file:'tools/team-followup-20261002/codex-half/ITEM/checks.mjs',name:'own-data inspect only',line:prior.slice(0,ri).split('\n').length,sha256:hash(reader)});
const defs=await import(pathToFileURL(path.join(root,'unique-item-project/definitions.js'))),rolls=await import(pathToFileURL(path.join(root,'unique-item-project/roll-values.js')));
const costContext=vm.createContext({});vm.runInContext(malConstant,costContext);
vm.runInContext(fn('xferCost')+'\n'+fn('_malCost'),costContext);
const enh=1,cost=vm.runInContext('xferCost(1)',costContext);assert.equal(cost,500);
function run(mats){
  const old={id:'d13',slot:'belt',name:'번지는 뿌리의 띠',rarity:5,enh,reqLv:0,_enhRefund:7,crystals:[],_gx:0,_gy:0,uniqueId:'UI-13',uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:.30}};
  const next={id:'ordinary',slot:'belt',name:'일반 허리띠',rarity:0,enh:0,reqLv:0,_enhRefund:11,crystals:[],_gx:5,_gy:6};
  const binding=old.uniqueRoll,descriptors=Object.getOwnPropertyDescriptors(binding),bag=[next],equipped={belt:old};
  const trace={rng:0,storedRead:0,recalc:0,sfx:0,lesson:0,save:0,addTxt:0,notify:0},events=[];
  const math=Object.create(Math);math.random=()=>{trace.rng++;throw Error('RNG prohibited in selected equip gate');};
  const c=vm.createContext({Math:math,P:{lv:100,x:0,y:0},G:{mats},INV:{bag,equipped},next,
    _earringEquipTarget:null,_earringSlot:()=>false,_equipSlot:i=>i.slot,_itemSz:()=>[1,1],
    _invFindSpace:()=>{throw Error('same-size grid should remain placed');},_T:s=>s,_L:s=>s,
    notify:s=>{trace.notify++;events.push({type:'notify',text:s});},addTxt:()=>{trace.addTxt++;events.push({type:'addTxt'});},
    recalcSt:()=>{trace.recalc++;events.push({type:'recalc'});},playEquipSfx:()=>{trace.sfx++;events.push({type:'sfx'});},
    window:{_systemLesson:{equipped:()=>{trace.lesson++;events.push({type:'lesson'});}}},
    dbSaveForce:()=>{trace.save++;events.push({type:'save'});},
    lookupItemProposal:defs.lookupItemProposal,fromStoredValue:(id,value)=>{trace.storedRead++;return rolls.fromStoredValue(id,value);}});
  vm.runInContext(malConstant+'\n'+functions+'\n'+reader+'\nfunction query(){return inspect(INV.equipped.belt)}',c);
  const snapshot=()=>({mats:c.G.mats,equippedId:c.INV.equipped.belt.id,bag:c.INV.bag.map(i=>i.id),old:structuredClone(old),next:structuredClone(next)});
  const before=snapshot(),readBefore=vm.runInContext('query()',c);
  const ret=vm.runInContext('equipItem(next)',c),after=snapshot(),readAfter=vm.runInContext('query()',c);
  assert.equal(ret,undefined);assert.equal(old.uniqueRoll,binding);assert.deepEqual(Object.getOwnPropertyDescriptors(binding),descriptors);
  assert(!Object.hasOwn(old,'_uTrapOffshoot'));assert(!Object.hasOwn(next,'uniqueRoll'));assert(!Object.hasOwn(next,'uniqueId'));
  return {before,after,readBefore:{status:readBefore.status,value:readBefore.storedValue},readAfter:{status:readAfter.status,value:readAfter.storedValue},trace,events,
    returnType:typeof ret,bindingIdentity:true,bagIdentity:c.INV.bag===bag,equippedIdentity:c.INV.equipped===equipped,
    oldEquipped:c.INV.equipped.belt===old,newEquipped:c.INV.equipped.belt===next,oldReturned:c.INV.bag.includes(old),nextRemoved:!c.INV.bag.includes(next)};
}
const insufficient=run(cost-1),exact=run(cost),passed=[];
function check(s,f){f();passed.push(s);}
check('actual xferCost/_malCost matches 1-enhancement cost500; rarity5 uses existing tier4',()=>{assert.equal(cost,500);const c=vm.createContext({});vm.runInContext(fn('_itemEconomyRarity'),c);assert.equal(vm.runInContext('_itemEconomyRarity(5)',c),4);});
check('cost-1 rejects atomically preserving mats/items/binding/grid/inventory identity',()=>{assert.deepEqual(insufficient.before,insufficient.after);assert(insufficient.oldEquipped&&insufficient.bagIdentity&&insufficient.equippedIdentity);assert.deepEqual(insufficient.readBefore,insufficient.readAfter);assert.equal(insufficient.readAfter.value,.30);assert.equal(insufficient.returnType,'undefined');});
check('exact cost transfers only original enhancement/refund and moves same old item to bag',()=>{assert.equal(exact.after.mats,0);assert.equal(exact.after.old.enh,0);assert.equal(exact.after.old._enhRefund,2);assert.equal(exact.after.next.enh,1);assert.equal(exact.after.next._enhRefund,11);assert(exact.newEquipped&&exact.oldReturned&&exact.nextRemoved);assert.deepEqual(exact.after.bag,['d13']);assert.equal(exact.after.old._gx,5);assert.equal(exact.after.old._gy,6);});
check('current query remains valid on refusal and switches to legacy only on accepted equip',()=>{assert.deepEqual(exact.readBefore,{status:'valid',value:.30});assert.deepEqual(exact.readAfter,{status:'legacy',value:null});assert(insufficient.bindingIdentity&&exact.bindingIdentity);});
check('refusal only warns; success source postprocessing order; RNG/save guards preserved',()=>{assert.deepEqual(insufficient.events.map(e=>e.type),['notify']);for(const key of ['recalc','sfx','lesson','save','addTxt','rng'])assert.equal(insufficient.trace[key],0);assert.deepEqual(exact.events.map(e=>e.type),['notify','addTxt','recalc','sfx','notify','lesson','save']);for(const key of ['recalc','sfx','lesson','save','addTxt'])assert.equal(exact.trace[key],1);assert.equal(exact.trace.rng,0);});
// Deduplicate source references from repeat extraction calls, never run any old test.
const fragments=[...new Map(refs.map(r=>[r.file+':'+r.name,r])).values()];
const args=['-n','xferCost|_malCost|_MALICE_COST_MUL|_itemEconomyRarity|_enhRefund|강화 전승|강화 이전|UI-13|U-D13|uniqueRoll|fromStoredValue','docs/'];
const search=spawnSync('rg',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);
const matches=search.stdout.trim().split('\n'),docs=[...new Set(matches.map(s=>s.split(':')[0]))];
const preservation=read.map(r=>({path:r.path,sha256Before:hash(r.text),sha256After:hash(fs.readFileSync(path.join(root,r.path))),unchanged:hash(r.text)===hash(fs.readFileSync(path.join(root,r.path)))}));
const ended=new Date().toISOString(),flags={schemaAdopted:false,enabled:false,runtimeReady:false,productionApplied:false};
const e={taskId:'ITEM-enhancement-gate-binding-0557',verdict:'NO-FIX',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',currentChatId:null,provider:'existing Codex ITEM chat',providedCheckpoint:'6c2dadab0b3a81a600e8358f485518cfcb122199',headIndependentlyObserved:false,root,owner,realpath:fs.realpathSync(owner),symlink:false,time:{startedUTC:started,endedUTC:ended,endedKST:new Date(Date.parse(ended)+32400000).toISOString().replace('Z','+09:00')},sourceFragments:fragments,reads:preservation,flags,inputs:{enh,cost,below:cost-1,exact:cost,oldRarity:5,crystals:[],bindingValue:.30},insufficient,exact,
 validation:{newBoundaryInputs:2,actualEquipCalls:2,newGroups:passed.length,passed,failed:0,priorTestsRepeated:0},
 actual:['equipItem full function','xferCost full function','_malCost and actual _MALICE_COST_MUL constant','_itemEconomyRarity full function','enhColor full function','prior own-data inspect fragment/pure fromStoredValue'],
 stubs:['P.lv100 and positions','grid same1x1/equipSlot identity','recalc/audio/notify/addTxt/lesson/save counters','Math.random throw guard','synthetic D13 old item and ordinary replacement; no real generation'],
 unexecuted:['crystal transfer','level rejection','resize/no-space','DB/persistence','real economy gameplay','cast/hit/kill/parent/child policy'],errors:[{phase:'read-only helper location search',message:'optional js/ search path absent; located actual helper in game.html on next read',VMExecuted:false}],
 docsSearch:{command:['rg',...args],exit:search.status,lines:matches.length,files:docs,sha256:hash(search.stdout)},commands:[{command:'cat TASK/COMMON/AGENTS/current role table + bounded rg/sed SSOT/source/prior evidence',exit:0},{command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:0}],
 ownership:{writes:['checks.mjs','result.md','evidence.json'],production:0,sharedDocs:0,git:0,priorArtifacts:0,UIgameHTTPServerSaveBuild:0,deletion:0,newSessionsSubagentsMessages:0},toolsActuallyCalled:['functions.exec / exec_command','functions.exec / apply_patch'],skillsUsed:[],changesCount:null,changesReason:'supervisor monitors; no Git query'};
const report=`# ITEM — 강화 이전 비용 부족과 D13 binding 보존\n\n**NO-FIX. 실제 원문 강화 이전 게이트의 부족/충족 두 입력에서 새5그룹 PASS.** 원 equipItem/xferCost/_malCost/등급 helper를 실행했으며 비용을 대입한 가짜 helper는 사용하지 않았다. 생산 수정0·schemaAdopted/enabled/runtimeReady/productionApplied=false를 유지한다.\n\n## 현재 입력·원문\n\n읽기 UTC ${started}; 종료 ${ended}. game.html SHA ${preservation.find(r=>r.path==='game.html').sha256Before} → ${preservation.find(r=>r.path==='game.html').sha256After}. 전체 소스 동일=${preservation.find(r=>r.path==='game.html').unchanged}. 총괄 checkpoint6c2dadab0b3a81a600e8358f485518cfcb122199는 제공 이력으로만 보존하며 Git/현재HEAD 독립조회0. 과거 reader 검수 pin을 현재 소스로 복사하지 않았다.\n\n| 실행한 원문/상수 | 현재 행·SHA-256 |\n|---|---|\n${fragments.map(r=>`| ${r.file} / ${r.name} | ${r.line} / ${r.sha256} |`).join('\n')}\n\n기존 장착은 합성 UI-13/belt/번지는 뿌리의 띠, binding fraction0.30, enh1/rarity5, crystals[], _enhRefund7, grid0/0이다. 새 장비는 ordinary belt/enh0/_enhRefund11/crystals[]/grid5/6/reqLv0, P.lv100으로 레벨 제한을 통과한다. 이전 occupied enh0 chain과 다른 **강화 게이트 한 경계**이며 결정 전승은 제외했다.\n\n## 공식과 두 입력 결과\n\n| 항목 | 원 코드·SSOT | 이번 값/결과 |\n|---|---|---|\n| 이전 비용 | xferCost(n)=_malCost(ceil(n×1000)); _MALICE_COST_MUL=0.5, _malCost(v)=양수 max(1,ceil(v×0.5)), 비양수0 | actual xferCost(1)=500. 입력 G.mats499와500만 사용 |\n| 경제 등급 | _itemEconomyRarity(r)=0이상 정수 min(r,4), 나머지0 | old rarity5→4, 배율[.5,.7,1,1.3,1.8]의1.8 |\n| 환수 기록 | floor(Σ(i=0..enh−1) ceil(max(1,ceil((1+i×.15)×1.5))×배율)×.5) | enh1: ceil(2×1.8)=4, floor(4×.5)=2. 실제 강화지출의50%로 재정의하지 않음 |\n| 부족499 | warning notify→return | mats499, old enh1/refund7, next enh0/refund11, 장착old/가방next·grid·참조 모두 불변 |\n| 충족500 | 차감→next.enh=1→old._enhRefund=2→old.enh=0→강화 notify/addTxt→교체 | mats0, next장착, 동일old 가방반환·grid5/6. next 환수11은 원문대로 유지 |\n| binding query | 기존 own-data inspect→fromStoredValue, 매 조회 현재 belt | 부족: valid/.30→valid/.30; 충족: valid/.30→legacy/null. old binding참조·descriptor 불변, 새 장비에binding/uniqueId/directstat 주입0 |\n| 반환/후처리 | 원함수 반환 undefined | 부족 recalc/SFX/lesson/save/addTxt0(경고notify1은 발생). 충족 notify→addTxt→recalc→SFX→notify→lesson→save, 각 후처리1. 양쪽 RNG0 |\n\n새5그룹: ${passed.join('; ')}. 이전 occupied5·own-data12/JSON·공급·callback·parent/lifecycle 검사 반복/합산0.\n\n## 실행 범위와 한계\n\nactual equipItem 전체와 xferCost/_malCost/rarity/enhColor 원문을 VM 실행했고 inline 환수 누적식도 원문 그대로 실행했다. 기존 own-data reader는 이전 checks의 선언부만 추출했으며 runner/fixture/import 실행0. definitions/roll-values pure data만 import; generation/rollValue/repair API 호출0. query는 현재값 읽기이고 cache/합산/cast snapshot 없음.\n\n합성 의존은 _equipSlot/크기1×1, 레벨·좌표, notify/addTxt/recalc/SFX/lesson/save 관찰기다. real recalc·음향·DB·경제 플레이는 실행하지 않았다. 초고강화/환수overflow/슬롯/결정/레벨실패/세이브 migration은 새 검사 범위 밖이다. 보스전 사망/맵 reset 조사0, childfactory/cap/겹침/clear/snapshot 정책변경0.\n\n## canonical docs 인계\n\n검수기 작성 뒤 docs 전체 지정 rg ${matches.length}행/${docs.length}파일. 공유docs 쓰기0, 정확한 추가 문안은 다음과 같다.\n\n| 정본 | 추가 문안 |\n|---|---|\n| 인벤토리 장착 자동전승 § | “ITEM-enhancement-gate-binding-0557: actual equipItem/xferCost/_malCost의 1강 이전비500 경계에서 악의499는 경고notify만 실행하고 장착/가방/그리드/강화/환수/binding참조를 보존한다. 악의500은0으로 차감, 새enh1/oldenh0 및 rarity5→경제4 레거시환수2 기록 뒤 기존 후처리를1회 수행한다. 새5그룹 source PASS/NO-FIX, 결정전승·실경제·실저장미검수.” |\n| ITEM_TEAM_MASTER/저장 binding | “현재장착 own-data 조회 후보는 강화 비용부족으로 거절된 교체에서 기존D13 fraction0.30을 유지하고, 충족 교체 후 ordinary의legacy/null을 읽는다. 생성/보충/재롤/캐시/직접stat중복저장0, old binding참조 불변. schemaAdopted/enabled/runtimeReady/productionApplied=false.” |\n\n소유 산출3파일만 작성. 시작/종료 읽기${preservation.length}경로 중${preservation.filter(r=>r.unchanged).length}개 SHA 동일; 공유 변경은 관측값으로 구분한다. source VM PASS는 제품/실HTTP/GPU/시각/청취/DB PASS가 아니다. 새로운 작업이나 정책결정을 자체 시작하지 않고 감독 인수를 기다린다.\n`;
fs.writeFileSync(path.join(owner,'result.md'),report);
e.ownedHashes={checks:hash(fs.readFileSync(path.join(owner,'checks.mjs'))),result:hash(report)};
fs.writeFileSync(path.join(owner,'evidence.json'),JSON.stringify(e,null,2)+'\n');
console.log(JSON.stringify({task:e.taskId,verdict:'NO-FIX',newGroups:passed.length,inputs:e.inputs,below:{current:insufficient.readAfter,trace:insufficient.trace},exact:{current:exact.readAfter,trace:exact.trace,refund:exact.after.old._enhRefund},preserved:preservation.filter(r=>r.unchanged).length,reads:preservation.length,flags,ended}));
