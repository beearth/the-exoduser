import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {parseExpressionAt} from 'acorn';
const arg=k=>process.argv.find(x=>x.startsWith(k+'='))?.slice(k.length+1);
const src=fs.readFileSync(arg('--source-game'),'utf8');
const tables=JSON.parse(fs.readFileSync(new URL('../data/item_generation_tables.json',import.meta.url),'utf8'));
const fn=name=>{const a=src.indexOf('function '+name+'(');if(a<0)throw Error('source function absent '+name);const ast=parseExpressionAt(src,a,{ecmaVersion:'latest'});return src.slice(a,ast.end)};
const arrow=marker=>{const start=src.indexOf(marker);assert(start>=0,marker);const a=src.indexOf('=',start)+1;return src.slice(a,parseExpressionAt(src,a,{ecmaVersion:'latest'}).end)};
const functions=['attachCrystal','detachCrystal','stoneUnseal','stoneUpgrade','crystalEnhCost','_crFuseQ','_qGradeOf','_qGradeName','_qRoll','_qGemMul','_qTier','rollAffixes','mkItem','_equipSlot','_earringSlot','_malCost'];
const extra=[];
function collect(name){if(["_T","_L","notify","applyStats","recalcSt","renderInvCrystals","renderForge","dbSaveNow","addTxt","playEquipSfx","playSample"].includes(name)||functions.includes(name)||extra.includes(name))return;const a=src.indexOf('function '+name+'(');if(a>=0)extra.push(name)}
for(let pass=0;pass<4;pass++)for(const name of [...functions,...extra]){const code=fn(name);for(const m of code.matchAll(/(?<![.\w])([A-Za-z_$][\w$]*)\s*\(/g))collect(m[1])}
const code=[...functions,...extra].map(fn).join('\n');
const names={gem_enhance:'btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;',gem_fuse:'btn.onclick=()=>{\n          const _fq=_crFuseQ(g.idxs',gem_decompose:'row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;',gem_craft:'btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;',gem_buy:'b.onclick=()=>{if(G.mats<_crMatsCost)'};
const actions=Object.fromEntries(Object.entries(names).map(([k,m])=>[k,arrow(m)]));
const cases=JSON.parse(fs.readFileSync(arg('--cases-file'),'utf8'));let checks=0;
const outcomes=[];
for(const c of cases){
 let ri=0;const math=Object.create(Math);math.random=()=>{if(ri>=c.rng.length)throw Error('RNG overread '+c.op);return c.rng[ri++]};
 const context=vm.createContext({...tables,Math:math,Date:{now:()=>0},P:{lv:c.lv,x:0,y:0},G:{mats:c.mats},INV:c.inv,CRYSTAL_BAG:c.gems,STONE_BAG:c.stones,CRYSTAL_DUST:c.dust,_invStoneSelQ:c.a.q,CRYSTAL_BAG_MAX:9999,_MALICE_COST_MUL:.5,_DEMO_MODE:true,_DEMO_AFFIX_BANNED:new Set(['sharpAtk','brutalAtk','ruinAtk','overkilDmg','staggerExplosion','parryExplosion','elemConvert']),EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},Q_GRADES:[{id:'bronze',ko:'동',en:'Bronze',min:1},{id:'silver',ko:'은',en:'Silver',min:41},{id:'gold',ko:'금',en:'Gold',min:81}],CRYSTAL_STAR_COST_MUL:[1,1.5,2.5,4,7],CRYSTAL_DUST_COST:[50,200,500,1500,5000],SFX:{forge(){},crystalEquip(){}},_T:s=>s,_L:(a,b,args)=>a,notify(){},applyStats(){},recalcSt(){},renderInvCrystals(){},renderForge(){},dbSaveNow(){},addTxt(){},_crForgeSel:c.a.gem_index??-1,_crCraftType:c.a.id,_crCraftStar:c.a.star,_crStarN:()=>'',_crDefN:()=>'',_crForgeFilter:'all',_crMatsCost:25,_crForgeTab:'enhance'});
 vm.runInContext(code,context);
 context.item=context.INV.equipped[c.a.slot];context.cr=context.CRYSTAL_BAG[c.a.gem_index];context.i=c.a.gem_index;
 if(c.op==='attach')vm.runInContext('attachCrystal(item,'+c.a.socket_index+',cr,i)',context);
 if(c.op==='detach')vm.runInContext('detachCrystal(item,'+c.a.socket_index+')',context);
 if(c.op==='unseal')vm.runInContext('stoneUnseal('+JSON.stringify(c.a.slot)+')',context);
 if(c.op==='upgrade')vm.runInContext('stoneUpgrade('+JSON.stringify(c.a.slot)+','+c.a.socket_index+')',context);
 if(c.op==='reroll')vm.runInContext('G.mats-=100;item.affixes=rollAffixes(item.rarity,item.slot)',context);
 if(actions[c.op]){
  if(c.op==='gem_enhance'){context.cost=vm.runInContext('crystalEnhCost(cr)',context);context.hasFeed=true;context.d=tables.CRYSTAL_DEFS[context.cr.id]}
  if(c.op==='gem_fuse'){const g=context.CRYSTAL_BAG;context.g={id:context.cr.id,star:context.cr.star,idxs:g.map((x,i)=>x.id===context.cr.id&&x.star===context.cr.star?i:-1).filter(i=>i>=0)};context.s={};context.ns={color:'#fff'};context.d=tables.CRYSTAL_DEFS[context.cr.id]}
  if(c.op==='gem_decompose')context.dustGet=Math.trunc([50,200,500,1500,5000][context.cr.star]*.5);
  if(c.op==='gem_craft'){context.ok=true;context.dustCost=[50,200,500,1500,5000][c.a.star];context.s={color:'#fff'};context.cd=tables.CRYSTAL_DEFS[c.a.id]}
  if(c.op==='gem_buy'){context.id=c.a.id;context.d=tables.CRYSTAL_DEFS[c.a.id];context.CRYSTAL_STAR=tables.CRYSTAL_STAR}
  vm.runInContext('('+actions[c.op]+')()',context);
 }
 if(c.op==='equipment_craft'){
  context.slot=c.a.slot;context.WTYPE_KEYS=Object.keys(tables.WTYPES);context.BTYPE_KEYS=Object.keys(tables.BOWTYPES);
  vm.runInContext(`G.mats-=100000;const el=~~(Math.random()*6),rar=Math.random()<.90?3:4;const sl=slot==='ring'?(!INV.equipped.ring1?'ring1':!INV.equipped.ring2?'ring2':'ring1'):slot==='headband'?_equipSlot({slot:'headband'}):slot;const wt=sl==='weapon'?WTYPE_KEYS[~~(Math.random()*WTYPE_KEYS.length)]:sl==='bow'?BTYPE_KEYS[~~(Math.random()*BTYPE_KEYS.length)]:undefined;globalThis.created=mkItem(sl,0,el,rar,wt);`,context);
  const clean=x=>{const n=JSON.parse(JSON.stringify(x));delete n._gx;delete n._gy;delete n._pickT;return n};assert.deepEqual(clean(c.after.created),clean(context.created),'craft original full item');checks++;assert.equal(c.after.mats,context.G.mats,'source crafting payment is retained independently of pickup result');checks++;
 }else{
  const actual=JSON.parse(JSON.stringify({inv:context.INV,gems:context.CRYSTAL_BAG,stones:context.STONE_BAG,dust:context.CRYSTAL_DUST,mats:context.G.mats}));
  assert.deepEqual(actual,c.after,'original mutation '+c.op);checks++;
 }
 assert.equal(ri,c.rng.length,'RNG exact consumption '+c.op);checks++;
 outcomes.push({op:c.op,checks:2,rng:ri});
}
assert(fn('renderForge').includes('pickupItem(item);'),'source craft ignores pickup return; no refund branch');checks++;
assert(!fn('renderForge').includes('_DEMO_MODE'),'forge has no demo-specific tab gate');checks++;
fs.writeFileSync(arg('--output'),JSON.stringify({checks,failures:0,cases:cases.length,outcomes,forge_demo_gate:false}),'utf8');
