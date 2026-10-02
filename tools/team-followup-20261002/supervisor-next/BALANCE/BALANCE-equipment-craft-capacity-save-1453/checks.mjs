import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const rows=[],sources=[];
class E{constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.textContent=''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}set innerHTML(x){this.markup=x;this.children=[]}get innerHTML(){return this.markup||''}}
for(const file of ['game.html','game-easy-test.html']){
const s=fs.readFileSync(file,'utf8'),names=['renderForge','pickupItem','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_malCost'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
const old='          pickupItem(item);',newer='          if(pickupItem(item)===false){G.mats+=CRAFT_COST;renderForge();return;}';assert.equal(f.renderForge.split(old).length,2);const candidate=f.renderForge.replace(old,newer);
sources.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),candidateSHA:sha(candidate),patch:{old,newer}});
for(const scenario of ['normal-room','full-bag','one-space-shift','full-bag-empty-equip']){
for(const policy of ['current','candidate']){
const nodes=new Map(),trace=[],bag=[];if(scenario!=='normal-room')for(let y=0;y<120;y+=2)for(let x=0;x<10;x+=2)bag.push({slot:'armor',_gx:x,_gy:y});if(scenario==='one-space-shift')bag.pop();
const beforeCount=bag.length,$=id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)};
const c=vm.createContext({G:{mats:200000,forgeTab:'armor',stage:0},P:{x:0,y:0},INV:{bag,equipped:scenario==='full-bag-empty-equip'?{}:{armor:{slot:'armor',name:'old',rarity:3,el:0}}},BAG_MAX:300,INV_COLS:10,ITEM_SIZE:{armor:[2,2]},WTYPE_SIZE:{},BTYPE_SIZE:{},_MALICE_COST_MUL:.5,$,document:{createElement:()=>new E()},_forgeSel:null,_salSel:new Set(),_rerollSel:null,_crForgeSel:-1,_ensureForgeAtlasLoad(){},BGM:{play(){}},_T:x=>x,_L:x=>x,_rarName:x=>x,_itemIco:()=>'',RARITY_C:['','','','#hero','#legend'],ELN:{0:'physical'},EL:{P:0,F:1,I:2,D:3,L:4,H:5},SI_TO_HELL:[0],SFX:{pickup:()=>trace.push(['pickupSfx'])},playEquipSfx:()=>trace.push(['equipSfx']),playItemPickupSfx:()=>trace.push(['itemSfx']),_petSayCD:()=>{},notify:x=>trace.push(['notify',x]),recalcSt:()=>trace.push(['recalc']),applyStats:()=>trace.push(['stats']),dbSaveForce:()=>trace.push(['saveForce']),mkItem:(...a)=>{trace.push(['mkItem',...a]);return {slot:a[0],name:'crafted',rarity:a[3],el:a[2]}},window:{_systemLesson:{pickedUp:()=>trace.push(['lesson'])}},Math:Object.assign(Object.create(Math),{random:()=>{trace.push(['RNG',.25]);return .25}}),Date:{now:()=>123456}});
vm.runInContext(names.map(n=>n==='renderForge'?(policy==='current'?f[n]:candidate):f[n]).join('\n')+'\nconst CRAFT_COST=_malCost(200000);renderForge();',c);
const button=$('fgGrid').children.find(e=>e.onclick&&String(e.onclick).includes('CRAFT_COST'));assert(button);button.onclick(scenario==='one-space-shift'?{shiftKey:true}:{});
const created=bag.filter(x=>x.name==='crafted').length,equipped=c.INV.equipped.armor?.name==='crafted';
const out={mats:c.G.mats,beforeCount,afterCount:bag.length,created,equipped,hud:$('forgeMats').textContent,trace};
if(scenario==='full-bag'){assert.equal(out.mats,policy==='current'?100000:200000);assert.equal(created,0);assert.equal(bag.length,300);}
else if(scenario==='one-space-shift'){assert.equal(out.mats,policy==='current'?0:100000);assert.equal(created,1);assert.equal(bag.length,300);}
else {assert.equal(out.mats,100000);assert.equal(created,scenario==='normal-room'?1:0);assert.equal(equipped,scenario==='full-bag-empty-equip');}
rows.push({file,scenario,policy,out});
}
}
for(const scenario of ['normal-room','full-bag-empty-equip']){const r=rows.filter(x=>x.file===file&&x.scenario===scenario);assert.deepEqual(r[0].out,r[1].out);}
}
const query='pickupItem|가방.*공간|제작.*빈|CRAFT_COST|제작 비용|가방.*제작';const d=spawnSync('rg',['-n',query,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({completionId:'BALANCE-equipment-craft-full-bag-charge-memory',sourceRuns:rows.length,sources,rows,docs:{query,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Actual full renderForge→actual equipment button→actual pickupItem→actual item size/category/grid/findSpace; 300placed2x2 items fill120rows10cols','No detached callback replay; one ordinary button input or Shift input','Item generator/RNG/DOM/audio/stats/save/Date fixtures; native game input/save UNKNOWN','Candidate restores only failed attempt debit and returns after actual pickup false; full-bag failure refund intent needs root economic-policy acceptance, not applied','Normal room purchase and empty-equipment autoequip outputs/traces unchanged','No production shared docs Git files edits'],newFiles:0},null,2));
