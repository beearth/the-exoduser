// Current HTML dispatcher/helper fragments in Node VM; no full update, game, DOM,
// audio, real inventory layout or save. The specialist's tests are not imported.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {parse,parseExpressionAt}=require('acorn');
const root=path.resolve(__dirname,'..');
const sha=x=>createHash('sha256').update(x).digest('hex');
const plain=x=>JSON.parse(JSON.stringify(x));

function extract(file){
  const bytes=fs.readFileSync(path.join(root,file)),source=bytes.toString('utf8');
  const unique=s=>{assert.equal(source.split(s).length-1,1,file+' unique '+s);return source.indexOf(s);};
  const part=(name,start,end)=>({name,code:source.slice(start,end),line:source.slice(0,start).split('\n').length});
  const between=(name,a,b)=>{const start=unique(a),end=unique(b);assert.ok(end>start);return part(name,start,end);};
  const constant=name=>{const prefix='const '+name+'=',start=unique(prefix),node=parseExpressionAt(source,start+prefix.length,{ecmaVersion:'latest'});assert.equal(source[node.end],';');return part(name,start,node.end+1);};
  const funcs=['_petTierOf','_petSay','_petSayCD','_petBidCD','_petSayUrgent','_petFireBid','_updatePetBubble','_petBagNext','updatePet','pickupItem','dst2','_checkPetDialogue'].map(name=>{
    const start=unique('function '+name+'('),node=parseExpressionAt(source,start,{ecmaVersion:'latest'});return part(name,start,node.end);
  });
  const state=between('actualPetState','const _petBubble=','// 대사 발동 함수');
  const priority=between('actualPriorityState','const _PET_TIER_COOL=','// id → 티어 추론');
  const check=funcs.find(p=>p.name==='_checkPetDialogue');
  const targets=check.code.split('\n').filter(l=>l.includes('if(!_petTut.firstItem&&INV.bag.length>=1)'));
  assert.equal(targets.length,1);const line=targets[0];
  const ast=parse(check.code,{ecmaVersion:'latest'});
  const calls=[];
  function walk(x){if(!x||typeof x!=='object')return;if(x.type==='CallExpression'&&x.callee.name==='_petSayCD'&&x.arguments[0]?.value==='tut_firstItem')calls.push(x);for(const v of Object.values(x)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}}
  walk(ast);assert.equal(calls.length,1);
  const call=check.code.slice(calls[0].start,calls[0].end),head=line.slice(0,line.indexOf('{'));
  const oldLine=head+'{_petTut.firstItem=true;'+call+';return}';
  const newLine=head+'{if('+call+'){_petTut.firstItem=true;return}}';
  assert.ok(line===oldLine||line===newLine,file+' approved contact only');
  const stateNames=[...parse(state.code+priority.code,{ecmaVersion:'latest'}).body].filter(n=>n.type==='VariableDeclaration').flatMap(n=>n.declarations.map(d=>d.id.name));
  const parts=[state,priority,constant('_diffSigned'),constant('_PET_OP_MAX'),...funcs];
  console.log('SOURCE_METADATA '+JSON.stringify({file,sha256:sha(bytes),guarded:line===newLine,contactLine:check.line+check.code.slice(0,check.code.indexOf(line)).split('\n').length-1,oldContactSHA256:sha(oldLine),newContactSHA256:sha(newLine),contactBytes:[Buffer.byteLength(oldLine),Buffer.byteLength(newLine)],fragments:parts.map(p=>({name:p.name,line:p.line,bytes:Buffer.byteLength(p.code),sha256:sha(p.code)})),transforms:['actual-source old contact reconstructed from current call AST for memory negative/control','actual full updatePet invoked with movement no-op; whole update omitted','current source functions retain their original code'],limits:['synthetic stationary encounter and player resources','native VM clock advanced by explicit dispatcher calls','DOM/translation/SFX sinks and inventory-space/stat/save doubles','no actual game/AI/DOM/audio/save/native acceptance']}));
  return {file,parts,check,line,oldLine,newLine,stateNames};
}

function fixture(p,{control=false}={}){
  const trace=[];let tick=0;
  const log=(op,...args)=>trace.push({tick,op,args:plain(args)});
  const NativeDate=Date;class ClockDate extends NativeDate{static now(){return 1700000000000;}}
  const math=Object.create(Math);math.random=()=>{throw Error('unexpected random branch in this scoped fixture');};
  const subtitle={style:{opacity:'0'}};
  const sandbox={Date:ClockDate,Math:math,trace,clock:()=>++tick,
    _T:s=>s,$:id=>id==='petSubtitle'?subtitle:null,
    _petBubbleShow:(...a)=>log('show',...a),_petSfx:(...a)=>log('sfx',...a),
    _updateOnePet:()=>{},_updateGhostXbow:()=>{},_updateGhostIris:()=>{},
    _itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0}),notify:s=>log('notify',s),_rarName:r=>'R'+r,
    playItemPickupSfx:i=>log('pickupSfx',i.id),playEquipSfx:i=>log('equipSfx',i.id),
    recalcSt:()=>log('recalcSt'),applyStats:()=>log('applyStats'),dbSaveForce:()=>log('save'),
    _grantOssuaryIfNeeded:()=>{throw Error('bone path outside scope');},_boneRegister:()=>{throw Error('bone path outside scope');},
    window:{_systemLesson:{pickedUp:i=>log('guidePickup',i.id)}},
  };
  const context=vm.createContext(sandbox);
  vm.runInContext(`
    var G={on:true,paused:false,stage:0,frame:1,bossAlive:true,mats:20,pets:{crow:{},cat:{},xbow:{},iris:{}}};
    var P={lv:1,hp:100,mhp:100,mp:100,mmp:100,st:100,mst:100,s:'idle',skills:{},x:0,y:0,sp:0,ap:0,rage:0};
    var INV={bag:[],equipped:{}},STATS={str:0,dex:0,int:0,lck:0},ens=[],projs=[],ULT_SLOT=null,SI_TO_HELL={0:0,1:0},OPT={diff:5};
    G._bossRef={alive:true,hp:100,mhp:100,el:0,stunned:0,s:'idle',x:500,y:500,atk:1};ens.push(G._bossRef);
    var _dtSp=1,_MAP_QA_MODE=false,_DEMO_MODE=false,_DEMO_LAST_STAGE=3;
  `,context);
  const code=p.parts.map(part=>part===p.check&&control?part.code.replace(p.line,p.oldLine):part.code).join('\n');
  vm.runInContext(code,context,{timeout:1000});
  vm.runInContext(`
    for(const name of ['_petSay','_petSayCD','_petBidCD','_petSayUrgent','_petFireBid']){
      const original=eval(name);
      const wrapped=function(...args){const result=original(...args);trace.push({tick:__tick,op:name,args:args.map(a=>a===undefined?null:a),returned:result===undefined?'undefined':result});return result;};
      eval(name+'=wrapped');
    }
    var __tick=0;
  `,context);
  const run=code=>vm.runInContext(code,context,{timeout:1000});
  const step=(n=1)=>run('for(let i=0;i<'+n+';i++){__tick=clock();G.frame++;updatePet();}');
  const pickup=()=>{for(const id of ['ordinary-a','ordinary-b'])assert.equal(run("pickupItem({id:'"+id+"',slot:'headband',rarity:1,name:'ordinary source fixture'})"),true);};
  const stateCode='{'+p.stateNames.map(n=>n+':'+n).join(',')+'}';
  const snap=()=>plain(run('('+stateCode+')'));
  const effects=()=>({state:snap(),G:plain(run('G')),P:plain(run('P')),INV:plain(run('INV')),trace:plain(trace),subtitle:plain(subtitle)});
  const rows=(op,id)=>trace.filter(e=>e.op===op&&(!id||e.args[0]===id));
  const nearBoss=()=>run('G._bossCx=10;G._bossCy=10;G._bossRef.x=160;G._bossRef.y=160;'); // actual predicate: 0<sqrt(160²+160²)<300; no map/spawn assertion
  return {run,step,pickup,snap,effects,trace,rows,nearBoss,get tick(){return tick;}};
}

function firstAccepted(w){
  const s=w.snap();assert.equal(s._petTut.firstItem,true);
  assert.equal(s._petDlgCD.tut_firstItem,599940);assert.equal(s._petTierCD[1],720);
  assert.equal(s._petBubble.who,'crow');assert.equal(s._petBubble.t,300);
  assert.equal(s._petBubble.pair.who,'cat');assert.equal(s._petBubble.pair.mt,240);
  assert.equal(w.rows('_petSayCD','tut_firstItem').filter(e=>e.returned===true).length,1);
}
function boundary(p,name,w,extra={}){
  const s=w.snap();console.log('BOUNDARY '+JSON.stringify({file:p.file,name,tick:w.tick,firstItem:s._petTut.firstItem,firstItemCD:s._petDlgCD.tut_firstItem??null,tierCD:s._petTierCD,bubble:{who:s._petBubble.who,t:s._petBubble.t,pairWho:s._petBubble.pair?.who||null,uid:s._petBubble._uid||null},firstItemReturns:w.rows('_petSayCD','tut_firstItem').map(e=>e.returned),bidCount:w.rows('_petBidCD').length,fireReturnValues:[...new Set(w.rows('_petFireBid').map(e=>e.returned))],traceSHA256:sha(JSON.stringify(w.trace)),...extra}));
}

for(const p of ['game.html','game-easy-test.html'].map(extract)){
  test(p.file+' busy firstItem stays pending, then actual timer expiry permits one acceptance',()=>{
    const w=fixture(p),negative=fixture(p,{control:true});
    for(const x of [w,negative]){x.step();x.pickup();x.step();}
    assert.equal(negative.snap()._petTut.firstItem,true);assert.equal(negative.snap()._petDlgCD.tut_firstItem,undefined);
    assert.equal(negative.rows('_petSayCD','tut_firstItem')[0].returned,false);
    assert.equal(w.rows('_petSayCD','tut_firstItem')[0].returned,false);
    assert.equal(w.snap()._petTut.firstItem,false,'refused speech must not consume firstItem');
    assert.equal(w.rows('_petFireBid').filter(e=>e.tick===2).length,2,'refused firstItem reaches existing final fire');
    w.step(719);firstAccepted(w);
    const acceptedCalls=w.rows('_petSayCD','tut_firstItem').length;w.step();
    assert.equal(w.rows('_petSayCD','tut_firstItem').length,acceptedCalls,'accepted flag prevents a second request');
    boundary(p,'busy rejection -> natural retry acceptance',w,{memoryNegative:'old source consumes on false; no firstItem CD',inventoryMode:p.file==='game.html'?'both ordinary items bag':'first auto-equipped, second bag'});
  });
  test(p.file+' fresh pickup during T1 cooldown reaches a different existing near_boss T4 tail',()=>{
    const w=fixture(p),negative=fixture(p,{control:true});
    for(const x of [w,negative]){x.step(620);x.pickup();x.nearBoss();x.step();}
    assert.equal(negative.snap()._petTut.firstItem,true);assert.equal(negative.rows('_petBidCD','near_boss').length,0);
    assert.equal(w.snap()._petTut.firstItem,false);
    assert.equal(w.rows('_petSayCD','tut_firstItem').at(-1).returned,false);
    assert.equal(w.rows('_petBidCD','near_boss').length,1);
    assert.equal(w.rows('_petSay','near_boss').filter(e=>e.returned===true).length,1);
    const s=w.snap();assert.equal(s._petDlgCD.near_boss,1800);assert.equal(s._petTierCD[4],240);assert.equal(s._petTierCD[1],100);
    assert.equal(s._petBubble.t,240);assert.equal(s._petBubble.pair.mt,240);assert.equal(s._petDlgCD.tut_firstItem,undefined);
    assert.equal(s._PB.tier,-1);assert.equal(s._PB.weight,0);
    boundary(p,'near_boss T4 after T1 rejection',w,{legality:'G.bossAlive=true, nonzero synthetic gate coordinates10/10, distance226.274<300; no boss AI or native/map arrival proof',oldTailBidCount:0});
  });
  test(p.file+' normal acceptance preserves complete extracted state and sink/call ordering',()=>{
    const w=fixture(p),old=fixture(p,{control:true});
    for(const x of [w,old]){x.step(720);x.pickup();x.nearBoss();x.step();}
    firstAccepted(w);firstAccepted(old);
    assert.deepEqual(w.effects(),old.effects());
    assert.equal(w.rows('_petBidCD','near_boss').length,0,'successful firstItem still returns before T4');
    boundary(p,'normal full snapshot and trace equal',w,{normalTraceEqual:true,normalStateSHA256:sha(JSON.stringify(w.effects())),scope:'post-call flags, actual callback order/arguments and source state; no sink assertion about the flag during its changed acceptance timing'});
  });
  test(p.file+' hp_critical T5 still interrupts first, then refused firstItem stays pending',()=>{
    const w=fixture(p),old=fixture(p,{control:true});
    for(const x of [w,old]){x.step();x.pickup();x.nearBoss();x.run('P.hp=8;');x.step();}
    const s=w.snap(),before=old.snap();
    assert.equal(w.rows('_petSay','hp_critical').filter(e=>e.returned===true).length,1);
    assert.equal(s._petBubble._uid,'hp_critical');assert.equal(s._petBubble.t,180);assert.equal(s._petBubble.pair.mt,180);
    assert.equal(s._petDlgCD.hp_critical,1800);assert.equal(s._petTierCD[1],719);
    for(const tier of [0,2,3,4])assert.equal(s._petTierCD[tier],300);
    assert.deepEqual(s._petBubble,before._petBubble);assert.deepEqual(s._petDlgCD,before._petDlgCD);assert.deepEqual(s._petTierCD,before._petTierCD);
    const urgent=w.trace.findIndex(e=>e.op==='_petSay'&&e.args[0]==='hp_critical');
    const first=w.trace.findIndex(e=>e.op==='_petSayCD'&&e.args[0]==='tut_firstItem');assert.ok(urgent>=0&&urgent<first);
    assert.equal(w.rows('_petSayCD','tut_firstItem').at(-1).returned,false);
    assert.equal(s._petTut.firstItem,false);assert.equal(before._petTut.firstItem,true);
    assert.equal(w.rows('_petSay','near_boss').length,0,'active T5 bubble and tier gate keep later T4 from firing');
    boundary(p,'T5 mid-fire precedence and pending firstItem',w,{urgentStateEquivalent:true,legality:'synthetic hp8/mhp100, alive source player, no lethal damage/death/full update; critical weight100 wins actual mid-fire',unchangedPolicy:'T5 still ignores _petSay return internally; no new acceptance guard'});
  });
  test(p.file+' ineligible firstItem gates preserve original extracted behavior',()=>{
    for(const input of ['no-bag','stage1','level201','off']){
      const w=fixture(p),old=fixture(p,{control:true});
      for(const x of [w,old]){x.step();if(input!=='no-bag')x.pickup();if(input==='stage1')x.run('G.stage=1;');if(input==='level201')x.run('P.lv=201;');if(input==='off')x.run('G.on=false;');x.step();}
      assert.equal(w.rows('_petSayCD','tut_firstItem').length,0,input);assert.deepEqual(w.effects(),old.effects(),input);
    }
    console.log('BOUNDARY '+JSON.stringify({file:p.file,name:'ineligible unchanged',cases:['no-bag','stage1','level201','off'],equivalent:true,fullUpdateExecuted:false}));
  });
}
