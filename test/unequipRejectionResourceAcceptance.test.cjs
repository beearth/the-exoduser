'use strict';
// Historical source15 AST acceptance only; old48 evidence stays immutable.
// Requires --historical-source15 and --memory (exact source14) or --live (exact source15).
// Current production: test/equipmentAtomicResourceAcceptance.test.cjs --live --root /checkout.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const args=process.argv.slice(2),option=n=>{const i=args.indexOf(n);return i<0?args.find(a=>a.startsWith(n+'='))?.slice(n.length+1):args[i+1];};
function unsupportedHistoricalRun(reason){
  process.stderr.write(JSON.stringify({status:'UNSUPPORTED_ARCHIVED_SOURCE15_RUN',reason,executedCases:0,overallPass:null,currentProductionAccepted:false,currentReplacement:'test/equipmentAtomicResourceAcceptance.test.cjs',currentCommand:process.execPath+' test/equipmentAtomicResourceAcceptance.test.cjs --live --root <checkout>'})+'\n');
  process.exit(2);
}
if(!args.includes('--historical-source15')||args.includes('--memory')===args.includes('--live')||option('--plan'))unsupportedHistoricalRun('Use the source16 harness for current production; source15 requires explicit historical mode, exactly one --memory/--live, and no plan overwrite.');
const root=path.resolve(option('--root')||option('--repo')||path.resolve(__dirname,'..'));
const {parse}=require(require.resolve('acorn',{paths:[root]}));
const memory=args.includes('--memory'),files=['game.html','game-easy-test.html'];
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),plain=v=>JSON.parse(JSON.stringify(v));
const pins={'game.html':'00519cdf518a5a9eb6147c536c7f77886cc6d11e79ac5ad8f181280a8495150f','game-easy-test.html':'87f36138e07055fcaa5237a116bbddd5c62759983427cf5851cc00f1c0d44152'};
const historicalLivePins={'game.html':'4e528f8ccd65f222b6c0d108e89c1281022eb27e3c8de152c72fb7e659d7d614','game-easy-test.html':'fe3bca4e299b5aea9e08fdbd37cf3798d8085d923c013fc21d0ac74f81288a4e'};
const changes=[
  {id:'empty-slot-false',old:'function unequipItem(slot){\n  const item=INV.equipped[slot];\n  if(!item)return;',next:'function unequipItem(slot){\n  const item=INV.equipped[slot];\n  if(!item)return false;'},
  {id:'no-grid-space-false',old:"if(!pos){INV.bag.pop();notify(_T('가방에 공간이 없습니다!'));return}\n  item._gx=pos.x;item._gy=pos.y;\n  INV.equipped[slot]=null;",next:"if(!pos){INV.bag.pop();notify(_T('가방에 공간이 없습니다!'));return false}\n  item._gx=pos.x;item._gy=pos.y;\n  INV.equipped[slot]=null;"},
  {id:'committed-true',old:"  try{playFM(300,120,200,.04,.02,'sine',350);playNoise(.02,4000,.015,2000,.001,'bandpass')}catch(e){}\n  dbSaveForce();\n}",next:"  try{playFM(300,120,200,.04,.02,'sine',350);playNoise(.02,4000,.015,2000,.001,'bandpass')}catch(e){}\n  dbSaveForce();return true;\n}"},
  {id:'detail-success-guard',old:"onclick=\"unequipItem('${idx}');applyStats();renderInv()\"",next:"onclick=\"if(unequipItem('${idx}')){applyStats();renderInv()}\""},
  {id:'equipment-context-success-guard',old:'if(item){unequipItem(slot);applyStats();renderInv();return}',next:'if(item){if(unequipItem(slot)){applyStats();renderInv()}return}'},
  {id:'urn-context-success-guard',old:"if(!oss)return;unequipItem('ossuary');if(INV.equipped.ossuary)return;",next:"if(!oss)return;if(!unequipItem('ossuary'))return;"}
];
const fnNames=['unequipItem','_itemSz','_invRows','_invCategoryKey','_invGrid','_invFindSpace','applyStats','recalcSt','_lvB','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','pPredSpd'];
const declNames=['BAG_MAX','INV_COLS','ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','SLOT_NAMES','STATS','PASSIVE_DEF','PASSIVES','_grit','_eqStatCache','_eqAffixCache','_diffSigned','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CRYSTAL_DEFS','CRYSTAL_STAR'];
function walk(n,visit){if(!n||typeof n!=='object')return;if(n.type)visit(n);for(const v of Object.values(n)){if(Array.isArray(v))for(const c of v)walk(c,visit);else if(v&&typeof v==='object')walk(v,visit);}}
function parseHTML(html){const out=[];for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){if(/\bsrc\s*=/i.test(m[1]))continue;const type=m[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';if(type.includes('json')||type==='importmap'){JSON.parse(m[2]);out.push({type:'json'});continue;}if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;out.push({type:'js',text:m[2],offset:m.index+m[0].indexOf(m[2]),ast:parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'})});}return out;}
function oneReplace(text,old,next,label){assert.equal(text.split(old).length-1,1,label);return text.replace(old,next);}
function parts(html,file){
  const parsed=parseHTML(html),matches=parsed.filter(s=>s.type==='js'&&s.text.includes('function unequipItem('));assert.equal(matches.length,1);const script=matches[0],nodes=[];walk(script.ast,n=>nodes.push(n));
  const select=(label,pred)=>{const found=nodes.filter(pred);assert.equal(found.length,1,file+' '+label);return found[0];};
  const top=name=>{const found=script.ast.body.filter(n=>(n.type==='FunctionDeclaration'&&n.id?.name===name)||(n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name)));assert.equal(found.length,1,name);return found[0];};
  const text=n=>script.text.slice(n.start,n.end),line=n=>html.slice(0,script.offset+n.start).split('\n').length;
  const inner=select('detail inline registration',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='_actB'&&n.left.property?.name==='innerHTML'&&n.right.type==='TemplateLiteral'&&text(n).includes('unequipItem('));
  const context=select('equipment context registration',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='div'&&n.left.property?.name==='oncontextmenu'&&text(n.right).includes('unequipItem(slot)'));
  const urn=select('urn context registration',n=>n.type==='AssignmentExpression'&&n.left?.object?.name==='urn'&&n.left.property?.name==='oncontextmenu');
  const localFns=[...fnNames,file==='game.html'?'crystalEffects':'crystalVal'];
  const sharedNodes=[...new Set([...declNames,...localFns.filter(n=>n!=='unequipItem')].map(top))];
  const init=select('PASSIVES actual initialization',n=>n.type==='ExpressionStatement'&&text(n)==='PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);');sharedNodes.push(init);sharedNodes.sort((a,b)=>a.start-b.start);
  return {parsed,shared:sharedNodes.map(text).join('\n'),unequip:text(top('unequipItem')),detail:text(inner),context:text(context),urn:text(urn),
    metadata:{functions:Object.fromEntries(localFns.map(name=>{const n=top(name);return [name,{line:line(n),bytes:Buffer.byteLength(text(n)),sha256:sha(text(n))}];})),declarations:Object.fromEntries(declNames.map(name=>{const n=top(name);return [name,{line:line(n),bytes:Buffer.byteLength(text(n)),sha256:sha(text(n))}];})),registrations:{detail:{line:line(inner),sha256:sha(text(inner))},context:{line:line(context),sha256:sha(text(context))},urn:{line:line(urn),sha256:sha(text(urn))}}}};
}
function readSource(file){
  const bytes=fs.readFileSync(path.join(root,file)),html=bytes.toString('utf8'),expected=memory?pins[file]:historicalLivePins[file];
  const requested=option(file==='game.html'?'--expect-main-sha':'--expect-easy-sha');
  if((requested&&requested!==expected)||sha(bytes)!==expected)unsupportedHistoricalRun(file+' is outside the exact archived source14/source15 input contract');
  let oldHTML=html,finalHTML=html;
  if(memory)for(const c of changes)finalHTML=oneReplace(finalHTML,c.old,c.next,file+' '+c.id+' OLD unique');
  else for(const c of changes.slice().reverse())oldHTML=oneReplace(oldHTML,c.next,c.old,file+' '+c.id+' inverse NEW unique');
  let inverse=finalHTML;for(const c of changes.slice().reverse())inverse=oneReplace(inverse,c.next,c.old,'inverse '+c.id);assert.equal(inverse,oldHTML,'whole inverse byte exact');
  let forward=oldHTML;for(const c of changes)forward=oneReplace(forward,c.old,c.next,'forward '+c.id);assert.equal(forward,finalHTML,'whole forward byte exact');
  const original=parts(oldHTML,file),final=parts(finalHTML,file);
  assert.equal(final.shared,original.shared,'all stat/grid/data dependencies unchanged');
  for(const name of fnNames.filter(n=>n!=='unequipItem'))assert.equal(final.metadata.functions[name].sha256,original.metadata.functions[name].sha256,name+' unchanged');
  return {file,sourceBytes:bytes.length,sourceSHA256:sha(bytes),pinVerified:!!expected,original,final,originalWhole:{bytes:Buffer.byteLength(oldHTML),sha256:sha(oldHTML)},finalWhole:{bytes:Buffer.byteLength(finalHTML),sha256:sha(finalHTML)},changeBytes:Buffer.byteLength(finalHTML)-Buffer.byteLength(oldHTML),inverseExact:true,fullParse:{js:final.parsed.filter(s=>s.type==='js').length,json:final.parsed.filter(s=>s.type==='json').length,pass:true},patches:changes.map(c=>({id:c.id,OLD:c.old,NEW:c.next,oldCount:oldHTML.split(c.old).length-1,newCount:finalHTML.split(c.next).length-1}))};
}
const item=(slot,id)=>({slot,id,name:id,rarity:3,enh:7,affixes:[],crystals:[],_gx:null,_gy:null});
function bagFor(kind,slot){
  if(kind==='none')return [];
  const targetCategory=slot==='ossuary'?'ossuary':'armor',base=kind==='other-category'?(slot==='ossuary'?'armor':'ossuary'):targetCategory;
  const bag=[];for(let y=0;y<120;y+=2)for(let x=0;x<10;x+=2)bag.push({...item(base,'filler-'+bag.length),_gx:x,_gy:y});
  if(kind==='fragmented'){const filtered=bag.filter(it=>!(it._gx===8&&(it._gy===0||it._gy===2)));filtered.push({...item(base,'fragment-mid'),_gx:8,_gy:1});return filtered;}
  return bag;
}
function fixture(src,variant,c){
  const code=src[variant],events=[],calls={apply:0,recalc:0,render:0,save:0,sound:0,hover:0,notify:0,unequip:[]};
  const slot=c.slot||'boots',target=item(slot,'target-'+slot),crystalID=src.file==='game.html'?(slot==='ossuary'?'cr_deep_well':'cr_iron_vow'):(slot==='ossuary'?'cr_mp':'cr_hp');Object.assign(target,{bonusHp:70,bonusMp:25,bonusSt:14,bonusShield:35,bStr:2,bDex:3,bInt:4,bGrit:5,affixes:[{id:'maxHPFlat',value:17},{id:'maxSTFlat',value:9}],crystals:[{id:crystalID,star:2,enh:1}],socketCount:1});
  const bag=bagFor(c.bag||'none',slot),equipped={[slot]:c.empty?null:target},INV={equipped,bag,selected:'eq:'+slot,ossCollect:{marker:1}},P={lv:5,x:10,y:20,hp:0,mp:0,st:0,shield:0,skills:{}},G={on:true,stage:0,mats:431};
  const ctx=vm.createContext({P,INV,G,OPT:{diff:5},window:{},slot,idx:slot,item:c.empty&&!c.stale?null:target,oss:c.empty&&!c.stale?null:target,_invHover:37,
    _actB:{innerHTML:''},div:{},urn:{},_T:x=>x,notify:m=>{calls.notify++;events.push('notify');},playFM:()=>{calls.sound++;events.push('FM');},playNoise:()=>{calls.sound++;events.push('noise');},dbSaveForce:()=>{calls.save++;events.push('save');},renderInv:()=>{calls.render++;events.push('render');},_invClearHover:()=>{calls.hover++;events.push('hover-clear');}});
  vm.runInContext(code.shared+'\n'+code.unequip,ctx,{timeout:1500});
  vm.runInContext('PASSIVES.pFortify=2;PASSIVES.pVital=2;PASSIVES.pStamina=1;globalThis.__slotNames=SLOT_NAMES;globalThis.__invRows=_invRows();globalThis.__invCols=INV_COLS;globalThis.__bagMax=BAG_MAX;',ctx);
  const actualApply=ctx.applyStats,actualRecalc=ctx.recalcSt,actualUnequip=ctx.unequipItem;
  ctx.applyStats=()=>{calls.apply++;events.push('apply');return actualApply();};ctx.recalcSt=()=>{calls.recalc++;events.push('recalc');return actualRecalc();};
  ctx.unequipItem=s=>{const value=actualUnequip(s);calls.unequip.push({type:typeof value,value:value??null});events.push('unequip:'+String(value));return value;};
  ctx.applyStats();const resources=()=>[P.hp,P.mp,P.st,P.shield],maxima=()=>[P.mhp,P.mmp,P.mst,P.mshield];
  [P.hp,P.mp,P.st,P.shield]=c.low?[12,3,5,7]:maxima();
  calls.apply=calls.recalc=0;events.length=0;
  if(c.caller==='detail'){
    vm.runInContext(code.detail+';',ctx);const attr=ctx._actB.innerHTML.match(/\bonclick="([^"]+)"/);assert(attr,'actual template emitted inline handler');parse(attr[1],{ecmaVersion:'latest'});
    vm.runInContext('globalThis.__handler=function(event){'+attr[1]+'};',ctx);
  }else if(c.caller==='context'){vm.runInContext(code.context+';',ctx);ctx.__handler=ctx.div.oncontextmenu;}
  else if(c.caller==='urn'){vm.runInContext(code.urn+';',ctx);ctx.__handler=ctx.urn.oncontextmenu;}
  const caches=()=>vm.runInContext('({_eqAffixCache,_eqStatCache})',ctx);
  const state=()=>plain({P,INV,G,hover:ctx._invHover,caches:caches()});
  const before={state:state(),resources:resources(),maxima:maxima(),bagRefs:bag.slice(),bagRef:bag,eqRef:equipped,pRef:P,invRef:INV,targetRef:target,targetState:plain(target),crystalsRef:target.crystals,crystalRef:target.crystals[0],cacheRefs:caches(),effStats:P._effStats,crystalStats:P._crystalStats};
  const grid=ctx._invGrid(target),emptyCells=grid.reduce((s,row)=>s+row.filter(v=>v===-1).length,0);
  assert.equal(ctx.__invRows,120);assert.equal(ctx.__invCols,10);assert.equal(ctx.__bagMax,300);
  return {ctx,P,INV,G,slot,target,before,calls,events,resources,maxima,state,caches,emptyCells,variant,src,
    run(){const value=c.caller==='direct'?ctx.unequipItem(slot):ctx.__handler({preventDefault(){events.push('prevent-default');}});return value;},
    observation(){const now=caches();return {beforeResources:before.resources,afterResources:resources(),beforeMaxima:before.maxima,afterMaxima:maxima(),statePreserved:JSON.stringify(before.state)===JSON.stringify(state()),bagBefore:before.bagRefs.length,bagAfter:bag.length,equippedStillTarget:equipped[slot]===target,itemCoordinates:[target._gx,target._gy],cacheRefsPreserved:now._eqAffixCache===before.cacheRefs._eqAffixCache&&now._eqStatCache===before.cacheRefs._eqStatCache,emptyCells,calls:plain(calls),events:events.slice(),selected:INV.selected,hover:ctx._invHover,slotNames:ctx.__slotNames.length};}};
}
function failure(f,notify=1){
  assert.deepEqual(f.state(),f.before.state,'failed unequip preserves P/INV/G/grid/cache data');
  assert.equal(f.P,f.before.pRef);assert.equal(f.INV,f.before.invRef);assert.equal(f.INV.bag,f.before.bagRef);assert.equal(f.INV.equipped,f.before.eqRef);
  assert.equal(f.P._effStats,f.before.effStats);assert.equal(f.P._crystalStats,f.before.crystalStats);
  const caches=f.caches();assert.equal(caches._eqAffixCache,f.before.cacheRefs._eqAffixCache);assert.equal(caches._eqStatCache,f.before.cacheRefs._eqStatCache);
  assert.deepEqual(f.INV.bag,f.before.bagRefs);for(let i=0;i<f.INV.bag.length;i++)assert.equal(f.INV.bag[i],f.before.bagRefs[i]);
  assert.deepEqual(plain(f.target),f.before.targetState);assert.equal(f.target.crystals,f.before.crystalsRef);assert.equal(f.target.crystals[0],f.before.crystalRef);
  for(const k of ['apply','recalc','render','save','sound','hover'])assert.equal(f.calls[k],0,k+' on rejection');assert.equal(f.calls.notify,notify);
  assert.equal(f.calls.unequip.length,1);assert.deepEqual(f.calls.unequip[0],{type:'boolean',value:false});
}
function success(f,c){
  assert.equal(f.INV.equipped[f.slot],null);assert.equal(f.INV.bag.length,f.before.bagRefs.length+1);assert.equal(f.INV.bag.at(-1),f.target);assert.equal(f.INV.bag.filter(it=>it===f.target).length,1);
  assert.deepEqual([f.target._gx,f.target._gy],c.position||[0,0]);assert.equal(f.G.mats,431);assert.equal(f.target.enh,7);assert.equal(f.target.crystals,f.before.crystalsRef);assert.equal(f.target.crystals[0],f.before.crystalRef);
  assert.equal(f.calls.save,1);assert.equal(f.calls.sound,2);assert.equal(f.calls.notify,1);assert.equal(f.calls.unequip.length,1);
  assert.equal(f.calls.unequip[0].type,f.variant==='original'?'undefined':'boolean');assert.equal(f.calls.unequip[0].value,f.variant==='original'?null:true);
  const direct=c.caller==='direct';assert.equal(f.calls.apply,direct?0:1);assert.equal(f.calls.recalc,direct?1:2);assert.equal(f.calls.render,direct?0:1);
  assert(f.events.indexOf('recalc')<f.events.indexOf('notify'));assert(f.events.indexOf('notify')<f.events.indexOf('FM'));assert(f.events.indexOf('FM')<f.events.indexOf('noise'));assert(f.events.indexOf('noise')<f.events.indexOf('save'));
  if(!direct){assert(f.events.indexOf('save')<f.events.indexOf('apply'));assert(f.events.indexOf('apply')<f.events.indexOf('render'));}
  if(c.caller==='urn'){assert.equal(f.INV.selected,null);assert.equal(f.calls.hover,1);assert(f.events.indexOf('render')<f.events.indexOf('hover-clear'));}
  if(c.low)assert.deepEqual(f.resources(),f.before.resources,'no free heal at low current resources');
  else for(let i=0;i<4;i++)assert(f.resources()[i]<=f.before.resources[i],'no resource gain');
}
const cases=[
  {id:'detail-full-grid-rejection-high-passive-resources',caller:'detail',bag:'full',reject:true},
  {id:'context-full-grid-rejection-high-passive-resources',caller:'context',bag:'full',reject:true},
  {id:'direct-full-grid-returns-false',caller:'direct',bag:'full',reject:true},
  {id:'detail-fragmented-four-free-cells-no2x2',caller:'detail',bag:'fragmented',reject:true,fragmented:true},
  {id:'context-fragmented-four-free-cells-no2x2',caller:'context',bag:'fragmented',reject:true,fragmented:true},
  {id:'urn-own-category-full-grid-rejection',caller:'urn',slot:'ossuary',bag:'full',reject:true},
  {id:'empty-direct-returns-false',caller:'direct',empty:true,reject:true,notify:0},
  {id:'empty-stale-detail-does-not-recalculate',caller:'detail',empty:true,stale:true,reject:true,notify:0},
  {id:'empty-stale-context-does-not-recalculate',caller:'context',empty:true,stale:true,reject:true,notify:0},
  {id:'empty-stale-urn-does-not-clear-selection',caller:'urn',slot:'ossuary',empty:true,stale:true,reject:true,notify:0},
  {id:'empty-nonstale-context-no-op',caller:'context',empty:true,noAttempt:true},
  {id:'empty-nonstale-urn-no-op',caller:'urn',slot:'ossuary',empty:true,noAttempt:true},
  {id:'successful-direct-move-boolean-and-single-save',caller:'direct'},
  {id:'successful-detail-existing-high-resource-clamp',caller:'detail',successClamp:true},
  {id:'successful-context-existing-high-resource-clamp',caller:'context',successClamp:true},
  {id:'successful-detail-low-resource-no-free-heal',caller:'detail',low:true},
  {id:'successful-context-low-resource-no-free-heal',caller:'context',low:true},
  {id:'successful-urn-selection-hover-order',caller:'urn',slot:'ossuary',low:true},
  {id:'ossuary-grid-independent-of-full-equipment-category',caller:'urn',slot:'ossuary',bag:'other-category',low:true},
  {id:'equipment-grid-independent-of-full-ossuary-category',caller:'detail',bag:'other-category',low:true},
  {id:'successful-then-repeat-detail-empty-rejection',caller:'detail',low:true,repeat:true},
  {id:'successful-then-repeat-context-empty-rejection',caller:'context',low:true,repeat:true},
  {id:'successful-then-repeat-urn-empty-rejection',caller:'urn',slot:'ossuary',low:true,repeat:true},
  {id:'headband2-main-easy-declaration-difference-preserved',caller:'detail',slot:'headband2',low:true}
];
(async()=>{
  const sources=files.map(readSource),results=[],successBaseline=new Map();
  for(const src of sources)for(const variant of memory?['original','final']:['final'])for(const c of cases){
    const f=fixture(src,variant,c);let error=null;try{
      f.run();f.observed=f.observation();
      if(c.fragmented){assert.equal(f.emptyCells,4);assert.equal(f.before.bagRefs.length,299);}
      if(c.reject)failure(f,c.notify??1);
      else if(c.noAttempt){assert.deepEqual(f.state(),f.before.state);assert.equal(f.calls.unequip.length,0);for(const k of ['apply','recalc','render','save','sound','hover','notify'])assert.equal(f.calls[k],0);}
      else{
        success(f,c);
        if(c.successClamp){assert(f.P.hp<f.before.resources[0],'existing successful high-HP clamp remains unresolved');assert(f.P.mp<f.before.resources[1],'existing successful high-MP clamp remains unresolved');}
        if(c.bag==='other-category')assert.equal(f.INV.bag.length,301,'existing category grid, no new global item-count rejection');
        if(c.slot==='headband2')assert.equal(f.ctx.__slotNames.includes('headband2'),src.file==='game.html','source-specific SLOT_NAMES preserved');
        const comparable={resources:f.resources(),maxima:f.maxima(),state:f.state(),calls:{...plain(f.calls),unequip:[]},events:f.events.filter(e=>!e.startsWith('unequip:'))};
        const key=src.file+' '+c.id;if(variant==='original')successBaseline.set(key,comparable);else if(memory)assert.deepEqual(comparable,successBaseline.get(key),'successful state/effect order matches actual original');
        if(c.repeat){const stable=f.state(),refs=f.caches(),counts={...f.calls};f.run();assert.deepEqual(f.state(),stable,'repeat after success is a no-op');const now=f.caches();assert.equal(now._eqAffixCache,refs._eqAffixCache);assert.equal(now._eqStatCache,refs._eqStatCache);for(const k of ['apply','recalc','render','save','sound','hover','notify'])assert.equal(f.calls[k],counts[k]);assert.deepEqual(f.calls.unequip.at(-1),{type:'boolean',value:false});}
      }
    }catch(e){error=String(e.message);}results.push({file:src.file,variant,id:c.id,pass:!error,error,observed:f.observed||f.observation(),afterRepeat:c.repeat?f.observation():null});
  }
  const summary={};for(const variant of memory?['original','final']:['final']){const rows=results.filter(r=>r.variant===variant);summary[variant]={groups:rows.length,pass:rows.filter(r=>r.pass).length,fail:rows.filter(r=>!r.pass).length};}
  const after=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))])),unchanged=sources.every(s=>after[s.file]===s.sourceSHA256);
  const fullParse=sources.reduce((a,s)=>({js:a.js+s.fullParse.js,json:a.json+s.fullParse.json}),{js:0,json:0});assert.equal(fullParse.js,12);assert.equal(fullParse.json,2);
  const red=results.filter(r=>r.variant==='original'&&['detail-full-grid-rejection-high-passive-resources','context-full-grid-rejection-high-passive-resources'].includes(r.id));
  const genuineRed=!memory||red.length===4&&red.every(r=>r.observed.afterResources[0]<r.observed.beforeResources[0]&&r.observed.afterResources[1]<r.observed.beforeResources[1]&&r.observed.calls.apply===1&&r.observed.calls.render===1);
  const overall=unchanged&&summary.final.fail===0&&genuineRed;
  const plan={schemaVersion:1,purpose:'source15 six scoped exact OLD/NEW edits; memory candidate only',productionWritten:false,files:sources.map(s=>({file:s.file,source:s.originalWhole,final:s.finalWhole,changeBytes:s.changeBytes,inverseExact:s.inverseExact,patches:s.patches}))};
  const planPath=option('--plan');if(planPath){assert(memory,'patch-plan write requires memory mode');const resolved=path.resolve(planPath),allowed=path.join(root,'tmp/mac-migration-runtime/continued-review-20261003/root-unequip-rejection-source15')+path.sep;assert(resolved.startsWith(allowed),'plan remains within owned ignored scope');fs.writeFileSync(resolved,JSON.stringify(plan,null,2)+'\n');}
  const report={schemaVersion:1,at:new Date().toISOString(),mode:memory?'historical-source15-memory-red-green':'historical-source15-live-green-only',archiveOnly:true,currentProductionAccepted:false,repo:root,overallPass:overall,sourceUnchanged:unchanged,genuineFullGridResourceLossReproduced:memory?genuineRed:null,summary,fullFinalHTMLParse:{...fullParse,pass:true},
    sourceReceipts:sources.map(s=>({file:s.file,sourceBytes:s.sourceBytes,sourceSHA256:s.sourceSHA256,afterSHA256:after[s.file],pinVerified:s.pinVerified,originalWhole:s.originalWhole,finalWhole:s.finalWhole,changeBytes:s.changeBytes,inverseExact:s.inverseExact,originalMetadata:s.original.metadata,finalMetadata:s.final.metadata,dependenciesByteExact:s.original.shared===s.final.shared})),
    results,actualExtraction:'acorn actual unequip/grid/stat/crystal/passive dependencies, actual detail HTML assignment and emitted inline onclick parsed as JS, actual div/urn oncontextmenu registrations; no hand-copied callback implementation',
    successCurrentHPClamp:'Archived source15 behavior only: then-unresolved successful HP/MP clamp loss remains an historical assertion; source16 final-current-min supersedes it for current production.',
    fixtureBoundary:'Synthetic controlled inventory/resource state; UI renderer/hover, notify/FM/noise/SFX, DB save leaves are recorders. Real app/DOM rendering/audio/user save/native play are not accepted.',
    nativeAccepted:false,productionWritten:false,patchPlanPath:planPath||null};
  console.log(JSON.stringify(report,null,2));process.exitCode=overall?0:1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
