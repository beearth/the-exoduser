// Live-source regression: place in tracked test/ before running. No writes/receipt output.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{parse}=require('acorn');
const root=path.resolve(__dirname,'..'),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const files=['game.html','game-easy-test.html'];
const old='            it.enh=(it.enh||0)+1;';
const preserve='const _fgHP=P.hp,_fgMP=P.mp,_fgST=P.st,_fgShield=P.shield;applyStats();P.hp=Math.min(P.mhp,_fgHP);P.mp=Math.min(P.mmp,_fgMP);P.st=Math.min(P.mst,_fgST);P.shield=Math.min(P.mshield,_fgShield);';
const suffix='\n            '+preserve;
const replacement=old+suffix;
const functions=['applyStats','recalcSt','calcCP','_lvB','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat','_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','pPredSpd','statStr','pDefAdd','enhCost','enhCostRaw','enhRate','_malCost','_itemEconomyRarity','enhColor','enhMulAtk','_slotFlatAtk','wp','meleeRef'];
const declarations=['SLOT_NAMES','PASSIVE_DEF','PASSIVES','STATS','_grit','_eqStatCache','_eqAffixCache','_diffSigned','_MALICE_COST_MUL'];
function walk(node,fn){if(!node||typeof node!=='object')return;fn(node);for(const [k,v]of Object.entries(node)){if(k==='start'||k==='end')continue;if(Array.isArray(v))for(const n of v)walk(n,fn);else if(v&&typeof v==='object')walk(v,fn);}}
function source(file){
  const bytes=fs.readFileSync(path.join(root,file)),html=bytes.toString('utf8');
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].filter(m=>m[1].includes('function applyStats('));assert.equal(scripts.length,1);
  const script=scripts[0][1],ast=parse(script,{ecmaVersion:'latest'});
  function nodeFor(name){const m=ast.body.filter(n=>(n.type==='FunctionDeclaration'&&n.id.name===name)||(n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name)));assert.equal(m.length,1,name);return m[0];}
  const names=[...declarations,...functions],nodes=[...new Set(names.map(nodeFor))];
  const init=ast.body.filter(n=>n.type==='ExpressionStatement'&&script.slice(n.start,n.end)==='PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);');assert.equal(init.length,1);nodes.push(init[0]);nodes.sort((a,b)=>a.start-b.start);
  const forge=nodeFor('renderForge'),callbacks=[];
  walk(forge,n=>{if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.object.name==='d'&&n.left.property.name==='onclick'&&script.slice(n.right.start,n.right.end).includes('it.enh=(it.enh||0)+1;'))callbacks.push(n.right);});assert.equal(callbacks.length,1);
  const callback=script.slice(callbacks[0].start,callbacks[0].end),forgeText=script.slice(forge.start,forge.end);assert.equal(callback.split(old).length-1,1);assert.equal(forgeText.split(old).length-1,1);
  assert.equal(callback.split(suffix).length-1,1,'live callback already contains exactly one resource-preserving suffix');
  assert.equal(forgeText.split(suffix).length-1,1);
  assert.equal(html.split(suffix).length-1,1);
  const variants={original:callback.replace(suffix,''),plain:callback.replace(suffix,'\n            applyStats();'),candidate:callback};
  const candidateHTML=html,oldHTML=html.replace(suffix,'');
  assert.equal(oldHTML.split(old).length-1,1);assert.equal(oldHTML.replace(old,replacement),candidateHTML);
  const line=n=>html.slice(0,scripts[0].index+scripts[0][0].indexOf(script)+n).split('\n').length;
  return {file,bytes:bytes.length,sha256:sha(bytes),code:nodes.map(n=>script.slice(n.start,n.end)).join('\n'),variants,callbackLine:line(callbacks[0].start),anchorLine:html.slice(0,html.indexOf(old)).split('\n').length,
    functions:Object.fromEntries(functions.map(name=>{const n=nodeFor(name);return [name,{sha256:sha(script.slice(n.start,n.end)),line:line(n.start)}];})),
    forge:{oldSHA:sha(forgeText.replace(suffix,'')),candidateSHA:sha(forgeText),oldBytes:Buffer.byteLength(forgeText.replace(suffix,'')),candidateBytes:Buffer.byteLength(forgeText)},
    candidateWhole:{sha256:sha(candidateHTML),bytes:Buffer.byteLength(candidateHTML),inverseExact:true},oldWhole:{sha256:sha(oldHTML),bytes:Buffer.byteLength(oldHTML)}};
}
function fixture(src,variant,settings){
  const effects=[],calls={apply:0,recalc:0,rng:0},P={lv:5,hp:0,mp:0,st:0,shield:0,x:100,y:200,skills:{}},equipped=structuredClone(settings.equipped),it=equipped[settings.target];assert(it);
  const sandbox={P,INV:{equipped},G:{on:true,stage:0,mats:1e9},OPT:{diff:5},Math:Object.create(Math),effects,calls,it,
    _T:x=>x,_L:(ko)=>ko,SFX:{forge(){effects.push(['forge'])},hurt(){effects.push(['hurt'])}},notify:(...a)=>effects.push(['notify',...a]),addTxt:(...a)=>effects.push(['text',...a]),poolPart:(...a)=>effects.push(['part',...a]),
    _petOnEnhSuccess:()=>effects.push(['petSuccess']),_petOnEnh100:()=>effects.push(['pet100']),_petOnEnhFail:()=>effects.push(['petFail']),renderForge:()=>effects.push(['render']),dbSaveNow:()=>effects.push(['save'])};
  sandbox.Math.random=()=>{calls.rng++;return settings.fail?.999999:0;};
  const ctx=vm.createContext(sandbox);vm.runInContext(src.code,ctx);
  vm.runInContext('PASSIVES.pFortify=1;PASSIVES.pVital=1;{const actualApply=applyStats,actualRecalc=recalcSt;applyStats=function(){calls.apply++;return actualApply();};recalcSt=function(){calls.recalc++;return actualRecalc();};}',ctx);
  ctx.applyStats();const max=()=>[P.mhp,P.mmp,P.mst,P.mshield],resources=()=>[P.hp,P.mp,P.st,P.shield];
  [P.hp,P.mp,P.st,P.shield]=settings.current||max();calls.apply=calls.recalc=calls.rng=0;
  const cost=ctx.enhCost(it.enh,it.rarity).cost;sandbox.G.mats=settings.poor?cost-1:cost+777;
  const before={max:max(),resources:resources(),cp:ctx.calcCP().total,ref:ctx.meleeRef(),mats:sandbox.G.mats,enh:it.enh,identity:it};
  vm.runInContext('globalThis.click='+src.variants[variant]+';',ctx);
  return {ctx,P,it,calls,effects,before,cost,max,resources,run(){ctx.click();return {max:max(),resources:resources(),cp:ctx.calcCP().total,ref:ctx.meleeRef(),mats:sandbox.G.mats,enh:it.enh,identity:equipped[settings.target]===it,calls:{...calls},effects:structuredClone(effects)};}};
}
const item=(slot,enh=5)=>({slot,enh,rarity:0,affixes:[],crystals:[],name:slot,...(slot==='weapon'?{atk:20}:{})});
const cases=[
  {id:'boots-5-to6-full-fortify-vital',target:'boots',equipped:{boots:item('boots')},delta:[1,0,0,0]},
  {id:'boots-damaged-no-free-heal',target:'boots',equipped:{boots:item('boots')},current:[111,23,17,9],delta:[1,0,0,0]},
  {id:'boots-zero-resources',target:'boots',equipped:{boots:item('boots')},current:[0,0,0,0],delta:[1,0,0,0]},
  {id:'bracelet-4-to5-MP-floor',target:'bracelet',equipped:{bracelet:item('bracelet',4)},delta:[0,1,0,0]},
  {id:'bracelet2-necklace2-aggregate-MP-floor',target:'bracelet',equipped:{bracelet:item('bracelet',2),necklace:item('necklace',2)},delta:[0,1,0,0]},
  {id:'bracelet-5-to6-no-MP-floor-cross',target:'bracelet',equipped:{bracelet:item('bracelet')},delta:[0,0,0,0]},
  {id:'ring-4-to5-ST-floor',target:'ring1',equipped:{ring1:item('ring1',4)},delta:[0,0,1,0]},
  {id:'ring1-2-ring2-2-aggregate-ST-floor',target:'ring1',equipped:{ring1:item('ring1',2),ring2:item('ring2',2)},delta:[0,0,1,0]},
  {id:'headband2-existing-main-easy-difference',target:'headband2',equipped:{headband2:item('headband2',4)},deltaMain:[0,1,0,0],deltaEasy:[0,0,0,0]},
  {id:'weapon-direct-ref-unchanged',target:'weapon',equipped:{weapon:item('weapon')},delta:[0,0,0,0],refDelta:.25},
  {id:'failure-material-once-no-recalculation',target:'boots',equipped:{boots:item('boots')},fail:true},
  {id:'insufficient-material-no-RNG-no-recalculation',target:'boots',equipped:{boots:item('boots')},poor:true},
  {id:'enh99-to100-pet-order',target:'boots',equipped:{boots:item('boots',99)},delta:[1,0,0,0],pet100:true}
];
const results=[];
for(const file of files){
  const src=source(file),rows=[];
  for(const c of cases){
    const runs={};for(const v of['original','plain','candidate']){const f=fixture(src,v,c),r=f.run();runs[v]={before:{...f.before,identity:undefined},cost:f.cost,...r};assert(r.identity);}
    const base=runs.original,plain=runs.plain,final=runs.candidate,before=final.before;
    assert.deepEqual(final.effects,base.effects);assert.equal(final.calls.rng,base.calls.rng);
    if(c.poor){for(const r of Object.values(runs)){assert.equal(r.calls.apply,0);assert.equal(r.calls.recalc,0);assert.equal(r.calls.rng,0);assert.equal(r.mats,r.before.mats);assert.equal(r.enh,r.before.enh);assert.deepEqual(r.resources,r.before.resources);assert.deepEqual(r.max,r.before.max);assert.deepEqual(r.effects,[['notify','악의가 부족합니다!']]);}}
    else if(c.fail){for(const r of Object.values(runs)){assert.equal(r.calls.apply,0);assert.equal(r.calls.recalc,0);assert.equal(r.mats,r.before.mats-r.cost);assert.equal(r.enh,r.before.enh);assert.deepEqual(r.resources,r.before.resources);assert.deepEqual(r.max,r.before.max);assert.equal(r.effects[0][0],'hurt');assert.deepEqual(r.effects.slice(-3).map(e=>e[0]),['petFail','render','save']);assert.equal(r.effects.filter(e=>e[0]==='part').length,6);}}
    else{
      const delta=c.delta||(file==='game.html'?c.deltaMain:c.deltaEasy),expectedMax=before.max.map((m,i)=>m+delta[i]);
      assert.deepEqual(final.max,expectedMax,c.id);assert.deepEqual(final.resources,before.resources.map((r,i)=>Math.min(expectedMax[i],r)),c.id);
      assert.equal(final.calls.apply,1);assert.equal(final.calls.recalc,1);assert.equal(final.mats,before.mats-final.cost);assert.equal(final.enh,before.enh+1);
      assert.equal(final.effects[0][0],'forge');assert.equal(final.effects.filter(e=>e[0]==='part').length,12);
      assert.deepEqual(final.effects.slice(c.pet100?-4:-3).map(e=>e[0]),c.pet100?['petSuccess','pet100','render','save']:['petSuccess','render','save']);
      if(c.refDelta){for(const r of Object.values(runs))assert.equal(r.ref-r.before.ref,c.refDelta);}
      if(c.id==='boots-5-to6-full-fortify-vital'){assert.equal(final.cp,before.cp+1);assert.equal(base.cp,before.cp);assert(plain.resources[0]<before.resources[0]);assert(plain.resources[1]<before.resources[1]);}
    }
    const valid=r=>{if(c.fail||c.poor)return r.calls.apply===0;return JSON.stringify(r.max)===JSON.stringify(final.max)&&JSON.stringify(r.resources)===JSON.stringify(final.resources)&&r.cp===final.cp;};
    rows.push({id:c.id,originalValid:valid(base),plainValid:valid(plain),candidateValid:valid(final),observed:{before:final.before,original:base,plain,final}});
  }
  assert.equal(sha(fs.readFileSync(path.join(root,file))),src.sha256,'source must remain stable during this run');
  results.push({file,sourceSHA:src.sha256,bytes:src.bytes,anchorLine:src.anchorLine,callbackLine:src.callbackLine,forge:src.forge,candidateWhole:src.candidateWhole,functions:src.functions,rows,
    totals:{groups:rows.length,originalPass:rows.filter(r=>r.originalValid).length,originalFail:rows.filter(r=>!r.originalValid).length,plainPass:rows.filter(r=>r.plainValid).length,plainFail:rows.filter(r=>!r.plainValid).length,candidatePass:rows.filter(r=>r.candidateValid).length}});
}
const totals=results.reduce((a,r)=>{for(const [k,v]of Object.entries(r.totals))a[k]=(a[k]||0)+v;return a;},{});
process.stdout.write(JSON.stringify({status:'PASS',groups:totals.groups,candidatePass:totals.candidatePass,sources:results.map(r=>({file:r.file,sha256:r.sourceSHA})),boundary:'Actual extracted live callback/stat/cost/ref helpers; original/plain memory controls; synthetic state, recording UI/FX/pet/save leaves. No native/whole-game/storage.'})+'\n');
