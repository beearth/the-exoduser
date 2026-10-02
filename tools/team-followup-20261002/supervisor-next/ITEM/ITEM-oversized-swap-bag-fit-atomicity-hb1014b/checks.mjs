import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-oversized-swap-bag-fit-atomicity-hb1014b');
assert.equal(fs.realpathSync(process.cwd()),root);assert.equal(fs.realpathSync(owner),owner);assert(!fs.lstatSync(owner).isSymbolicLink());
const started=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=['game.html','game-easy-test.html','AGENTS.md','tools/team-followup-20261002/continuous/COMMON.md',path.relative(root,path.join(owner,'TASK.md')),'docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/7아이템디자인/ITEM_TEAM_MASTER.md','docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md','docs/14밸런스+수치테이블/자원소비량표.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md','tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014/result.md'];
const reads=paths.map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')})),anchors=[],rows=[],groups=[];
assert.equal(sha(reads.find(r=>r.path.endsWith('/TASK.md')).text),'e659c9355bf9946d70c339df7ede27eec77b49a935286a913d60fde66dc4c25f');
function anchor(file,name,s,i,end){assert(i>=0,name);const text=s.slice(i,end);anchors.push({file,name,line:s.slice(0,i).split('\n').length,sha256:sha(text)});return text;}
function func(file,s,name,optional=false){const i=s.indexOf('function '+name+'(');if(i<0&&optional)return '';assert(i>=0,name);const a=parseExpressionAt(s,i,{ecmaVersion:'latest'});return anchor(file,name,s,i,a.end);}
function constant(file,s,name,kind='const'){const prefix=kind+' '+name+'=';const i=s.indexOf(prefix);assert(i>=0,name);const a=parseExpressionAt(s,i+prefix.length,{ecmaVersion:'latest'});return anchor(file,name,s,i,a.end)+';';}
for(const file of ['game.html','game-easy-test.html']){
  const s=reads.find(r=>r.path===file).text;
  const names=['equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invCanPlace','xferCost','_malCost','_itemEconomyRarity','enhColor'];
  const funcs=names.map(n=>func(file,s,n)).join('\n')+'\n'+func(file,s,'_earringSlot',true)+'\n'+func(file,s,'_equipSlot',true);
  const constants=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>constant(file,s,n)).join('\n')+'\n'+constant(file,s,'BAG_MAX','let');
  function run(hole){
    const gem={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0};
    const old={id:'old',slot:'armor',name:'기존갑옷',rarity:5,enh:3,_enhRefund:13,reqLv:0,socketCount:1,crystals:[gem],_gx:null,_gy:null,uniqueId:'UI-10',uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:.15}};
    const next={id:'next',slot:'armor',name:'교체갑옷',rarity:0,enh:0,reqLv:0,socketCount:1,crystals:[null],_gx:0,_gy:0};
    const bag=[next];for(let y=0;y<120;y+=2)for(let x=0;x<10;x+=2)if(x||y)bag.push({id:'f'+x+'_'+y,slot:'armor',_gx:x,_gy:y});
    if(hole)bag.splice(1,1); // one valid 2x2 hole at (2,0); sizes/constants stay unmodified.
    const binding=old.uniqueRoll,crystals=old.crystals,events=[],trace={rng:0,save:0,recalc:0,sfx:0,lesson:0,apply:0,render:0};
    const math=Object.create(Math);math.random=()=>{trace.rng++;throw Error('unexpected RNG');};
    const note=n=>()=>{trace[n]++;events.push(n);};
    const c=vm.createContext({Math:math,P:{lv:100,x:0,y:0},G:{mats:10000},INV:{bag,equipped:{armor:old}},CRYSTAL_BAG:[],_earringEquipTarget:null,
      $:()=>({dataset:{inventoryPage:'inventory'}}),_T:s=>s,_L:s=>s,_crDefN:d=>d.ko,
      notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),recalcSt:note('recalc'),playEquipSfx:note('sfx'),dbSaveForce:note('save'),applyStats:note('apply'),renderInv:note('render'),window:{_systemLesson:{equipped:note('lesson')}}});
    vm.runInContext(constants+'\n'+funcs,c);
    const sizes=vm.runInContext('({items:ITEM_SIZE,weapons:WTYPE_SIZE,bows:BTYPE_SIZE,rows:_invRows(),cols:INV_COLS,capacity:BAG_MAX,old:_itemSz(INV.equipped.armor),next:_itemSz(INV.bag[0])})',c);
    for(const [slot,size] of Object.entries(sizes.items))assert.deepEqual(Array.from(size),slot==='bonePart'?[1,1]:[2,2]);
    for(const size of [...Object.values(sizes.weapons),...Object.values(sizes.bows)])assert.deepEqual(Array.from(size),[2,2]);
    assert.deepEqual(Array.from(sizes.old),[2,2]);assert.deepEqual(Array.from(sizes.next),[2,2]);
    assert.equal(sizes.rows,120);assert.equal(sizes.cols,10);assert.equal(sizes.capacity,300);
    const noSkip=vm.runInContext('_invFindSpace(2,2,-1,INV.equipped.armor)',c);
    const skipNext=vm.runInContext('_invFindSpace(2,2,0,INV.equipped.armor)',c);
    if(!hole)assert.equal(noSkip,null);else assert.deepEqual({...noSkip},{x:2,y:0});
    assert.deepEqual({...skipNext},{x:0,y:0});
    // Current source is the normal control; no unsupported oversized item is fabricated.
    const count=bag.length,ret=vm.runInContext('_invBagRightClick(0)',c);assert.equal(ret,undefined);
    assert.equal(c.INV.equipped.armor,next);assert.equal(c.INV.bag.length,count);assert(!c.INV.bag.includes(next));assert(c.INV.bag.includes(old));
    assert.equal(old._gx,0);assert.equal(old._gy,0);assert.equal(c.G.mats,8500);assert.equal(old.enh,0);assert.equal(next.enh,3);assert.equal(old._enhRefund,6);
    assert.equal(next.crystals[0],gem);assert.deepEqual(old.crystals,[null]);assert.equal(c.CRYSTAL_BAG.length,0);assert.equal(old.uniqueRoll,binding);assert.equal(old.crystals,crystals);
    // Verify every actual remaining bag item's footprint against actual grid/collision helpers.
    assert(vm.runInContext('INV.bag.every((it,i)=>_invCanPlace(i,it._gx,it._gy))',c));
    const occupied=vm.runInContext('_invGrid(INV.bag[0]).flat().filter(v=>v!==-1).length',c);assert.equal(occupied,count*4);
    assert.equal(trace.rng,0);assert.equal(trace.save,1);assert.equal(trace.recalc,1);
    return {file,hole,bagCount:count,grid:{cols:sizes.cols,rows:sizes.rows,capacity:sizes.capacity,occupied},sizes:{old:Array.from(sizes.old),next:Array.from(sizes.next)},noSkip:noSkip?{...noSkip}:null,skipNext:{...skipNext},after:{mats:c.G.mats,oldEnh:old.enh,newEnh:next.enh,refund:old._enhRefund,oldPosition:[old._gx,old._gy],oldInBag:true,allFootprintsValid:true,crystalTransferred:true,bindingIdentity:true},events,trace};
  }
  const full=run(false),fit=run(true);rows.push(full,fit);
  assert.deepEqual(full.events,fit.events);assert.deepEqual(full.trace,fit.trace);assert.deepEqual(full.after,fit.after);
  groups.push(file+': actual legal wearable size definitions all 2x2; no oversized legal pair');
  groups.push(file+': actual full grid null without skip, valid released replacement footprint');
  groups.push(file+': whole bag caller/equip full-grid and free-hole controls preserve legal placement and transfer');
  const i=s.indexOf("if(item&&item.slot==='bonePart'){registerBonePart(item);return}");anchor(file,'bonePart bypass',s,i,i+"if(item&&item.slot==='bonePart'){registerBonePart(item);return}".length);
}
const args=['-n','ITEM_SIZE|WTYPE_SIZE|BTYPE_SIZE|_itemSz|_invFindSpace|_invGrid|_invCanPlace|BAG_MAX|장착 교체|같은 분류|공간이 없습니다','docs/'];
const search=spawnSync('rg',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);
const matches=search.stdout.trim().split('\n'),files=[...new Set(matches.map(s=>s.split(':')[0]))];
const preservation=reads.map(r=>({path:r.path,before:sha(r.text),after:sha(fs.readFileSync(path.join(root,r.path))),same:sha(r.text)===sha(fs.readFileSync(path.join(root,r.path)))}));
const ended=new Date().toISOString();
const e={taskId:'ITEM-oversized-swap-bag-fit-atomicity-hb1014b',verdict:'NO-FIX / oversized trigger absent in current legal definitions',currentChatId:'01a0faaf-92a3-7eb1-842d-eb4baa1a2954',chatIdSource:'TASK provided existing assigned chat; no independent UI lookup',historicalProvidedPin:'d5c1b62d; no current HEAD query',startedUTC:started,endedUTC:ended,endedKST:new Date(Date.parse(ended)+32400000).toISOString().replace('Z','+09:00'),root,owner,realpath:fs.realpathSync(owner),reads:preservation,anchors,rows,validation:{groups,passed:groups.length,failed:0,actualWholeCallerEquipExecutions:4,priorTestsRepeated:0},memoryCandidate:null,candidateGate:'No current legal different-size parent/replacement pair. Do not change ITEM_SIZE or fabricate size helpers to declare reproduction.',productionApplied:false,runtimeAccepted:false,actual:['both full _itemSz/_invRows/_invCategoryKey/_invGrid/_invFindSpace/_invCanPlace/_invBagRightClick/equipItem','actual ITEM_SIZE/WTYPE_SIZE/BTYPE_SIZE/INV_COLS/BAG_MAX','cost/refund helpers and crystal constants'],stubs:['legal synthetic armor bag tiled at actual 10x120/300 limit','P.lv/coords','translation/notify/addTxt/recalc/audio/lesson/save/apply/render observers','Math.random throw guard'],unknown:['future variable-size wearable failure/rejection policy','actual grid/UI/DB/save/runtime acceptance','grid resize/unplaced/malformed/legacy items','earring target slots'],commands:[{command:'exact TASK first Read; bounded source/SSOT read commands',exit:0},{command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:0}],docsSearch:{command:['rg',...args],exit:0,lines:matches.length,files,outputSHA256:sha(search.stdout)},errors:[],toolsActuallyCalled:['functions.exec / exec_command','functions.exec / apply_patch'],skillsUsed:[],checksSHA256:sha(fs.readFileSync(path.join(owner,'checks.mjs'))),writes:['result.md','checks.mjs'],git:0,productionSharedDocsPriorWrites:0,newTeamsChatsMessages:0,deletion:0,gameServerHTTPSaveBuildInstallPublish:0};
const report=`# ITEM — 크기가 다른 장착 교체와 가방 fit 원자성\n\n**NO-FIX: 요청된 큰 기존장비/작은 새장비 조합은 현행 합법 장착 정의에 없다.** 실제 소스 검수기를 완성하고 양판의 grid-null 관측과 정상 fit 대조를 실행했다. 임의 크기/가짜 _itemSz/_invFindSpace로 실패를 만들지 않았으며 memoryCandidate=null, productionApplied=false/runtimeAccepted=false다.\n\n## 실패 전제와 실제 관측의 구분\n\n| 대상 | 실제 source/SSOT | 판정 |\n|---|---|---|\n| ITEM_SIZE | 일반 장착 장비 모두2×2; main headband2도2×2, easy는fallback 정책을확대하지않음 | 서로 다른 크기의 합법 장착쌍0 |\n| WTYPE_SIZE/BTYPE_SIZE | 현행 무기7타입/활3타입 모두2×2 | weapon/bow도크기차이없음 |\n| bonePart | 1×1이지만 equipItem은 registerBonePart로조기return | 작은 새 장비로장착할수없음 |\n| 가방 | cols10, BAG_MAX300, _invRows=max(10,ceil(300×4/10))=120 | 실제1200셀을2×2 장비300개로빈틈없이채움 |\n| full grid helper | _invFindSpace(2,2,-1,old)=null | 아직새장비가점유중이어서추가공간없음; 교체실패와동일하지않음 |\n| released replacement | _invFindSpace(2,2,0,old)={x:0,y:0} | 대상새장비의가방index0 점유를skip하면기존장비가동일footprint에fit |\n| free-hole control | 장비1개제외하여299개, noSkip={x:2,y:0}, skipNext={x:0,y:0} | 정상공간관측을full-grid null과분리 |\n\n양쪽 actual bag-right-click→equipItem은 full300 및hole299 대조 모두성공했다. 원문은 같은크기의old에새장비좌표0/0을재사용한다. 실제 _invCanPlace와 _invGrid로남은모든가방장비의배치/충돌과정확점유량(1200/1196셀)을검증했고겹침/삭제/강제확장0이다.\n\nold armor enh3/rarity5·합법소켓결정1개·D10 binding0.15, next armor enh0/empty socket, 악의10000의원문강화/결정전승도그대로실행했다. mats8500, 새enh3/oldenh0·legacy환수6, 동일결정새소켓전승/주머니0, old동일객체가가방반환되고binding참조불변이다. 비용/환수helper를실행했지만이는새 full-grid control의부수관측이며이전499/500·alias 검사를반복하지않았다.\n\n## memory 후보와 정책 Gate\n\n서로 다른크기를허용하는생산정의가없으므로preflight거부patch를생산결함수정으로제안하지않았다. 새size정의/legacy 예외가승인될때만old!=item의반환공간을경제/결정변경전에검사하는후속후보를검수할수있다. 그때새장비가가방에서나가는footprint를반드시반영해야한다. full-grid noSkip=null만으로교체를거부하면이번합법control을잘못막는다.\n\nSSOT는같은분류장비간겹침금지·10열/공통BAG_MAX300·가방좌표보존·강화부족교체차단을확정한다. 하지만본요청의oversized replacement 실패정책을승인한근거는없다. 미확정새size·거부/다른자리재배치정책을임의채택하지않았다. runtime gate를구현중단사유로삼은것이아니라actual taxonomy에서필수실패입력자체가없음을검증한결과다.\n\n## SHA·명령·실행 경계\n\nUTC ${started}→${ended}; 전체source시작/종료와모든함수/상수SHA는아래evidence JSON. TASK 제공hash를실제대조했다. historical d5c1b62d는현재HEAD가아니며Git0이다. 이전산출읽기만/이전검사반복0, _skUnclick 검사0.\n\n${groups.map(s=>'- '+s).join('\n')}\n\n새6그룹/실제caller+equip4회. actual grid/size/find/collision함수전체를실행했으며가짜grid-counter/수동nullhelper0. UI/음향/stat/DB후처리만명시대역이다. caller applyStats/renderInv각1회, save1회, RNG0은해당표본경계이며게임전체판정아님. 합법synthetic일반장비300/299개이며실게임/세이브를열지않았다.\n\n## docs old/new 인계\n\n전체docs rg1회: ${matches.length}행/${files.length}파일. 공유docs쓰기는root 소유다.\n\n| 정본 | old/기존 정보 | new 정확 추가문안 |\n|---|---|---|\n| 인벤토리 장착교체/그리드 | 크기차이시old좌표를null로만들고후처리에findSpace; 현행taxonomy설명분산 | “현재main/easy의합법일반장착장비·weapon/bow subtype는2×2, bonePart1×1은도감등록이다. 같은크기교체는새장비의기존가방footprint를old가재사용한다. full-grid findSpace(skip=-1)=null은새장비점유를해제한교체실패증거가아니다.” |\n| ITEM_TEAM_MASTER | oversized 교체원자성검수없음 | “ITEM-oversized-swap-bag-fit-atomicity-hb1014b: actual양판size/grid/caller/equip의full300/hole299 control6그룹PASS. 큰old/작은new합법정의0이라실패재현·메모리patch0/NO-FIX. 미래size정의와거부정책Gate 유지,생산0·실제품미검수.” |\n| 저장/경제 SSOT | BAG_MAX300·10열·좌표/강화환수/binding | 모두불변. “이번검토는새저장필드/좌표강제수리/가방확장/환수변경/결정삭제정책을채택하지않았다.” |\n\n소유result/checks2파일만작성했다. 제품Gate는실제아이템/가방UI·저장재실행·미배치/legacy자료와미래variable-size정책이다. 이한건을종료하고자체다음업무를만들지않는다.\n\n## evidence JSON\n\n\`\`\`json\n${JSON.stringify(e,null,2)}\n\`\`\`\n`;
fs.writeFileSync(path.join(owner,'result.md'),report);
console.log(JSON.stringify({task:e.taskId,verdict:e.verdict,groups:groups.length,actualEquipCalls:4,memoryCandidate:null,rows:rows.map(r=>({file:r.file,hole:r.hole,noSkip:r.noSkip,skipNext:r.skipNext,grid:r.grid})),productionApplied:false,runtimeAccepted:false,ended}));
