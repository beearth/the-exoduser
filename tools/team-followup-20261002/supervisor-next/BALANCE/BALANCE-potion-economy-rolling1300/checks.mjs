import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const rows=[],sources=[];
for(const file of ['game.html','game-easy-test.html']){
const s=fs.readFileSync(file,'utf8'),names=['renderForge','_fgSelect','_fgCraft','potHeal','_malCost'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
const old="()=>{POT_LV[item.type]++;G.mats-=cost;addTxt";
const newer="()=>{const current=POT_LV[item.type],nextCost=_malCost((current+1)*5);if(!Number.isFinite(current)||current>=10||P.lv<(current+1)*100||G.mats<nextCost)return false;POT_LV[item.type]++;G.mats-=nextCost;addTxt";
const render=f.renderForge.replace(old,newer),craft=f._fgCraft.replace('s.fn();_done++;','if(s.fn()===false)break;_done++;');
assert.notEqual(render,f.renderForge);assert.notEqual(craft,f._fgCraft);
sources.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),patch:{renderOld:old,renderNew:newer,craftOld:'s.fn();_done++;',craftNew:'if(s.fn()===false)break;_done++;'},candidateSHA:{render:sha(render),craft:sha(craft)}});
for(const scenario of [
 {id:'single-normal',level:100,initial:0,mats:500,evt:{},expectedLevel:1,expectedMats:497},
 {id:'shift-level-requirement',level:100,initial:0,mats:500,evt:{shiftKey:true},expectedLevel:1,expectedMats:497},
 {id:'ctrl-cap',level:1000,initial:9,mats:500,evt:{ctrlKey:true},expectedLevel:10,expectedMats:475},
 {id:'shift-current-cost',level:1000,initial:0,mats:500,evt:{shiftKey:true},expectedLevel:10,expectedMats:360},
 {id:'shift-insufficient-next-cost',level:1000,initial:0,mats:7,evt:{shiftKey:true},expectedLevel:1,expectedMats:4}
]){
for(const policy of ['current','candidate']){
const nodes=new Map(),trace=[];
class E{constructor(){this.children=[];this.style={setProperty:(k,v)=>this.style[k]=v};this.classList={add:()=>{}};}set textContent(v){assert.equal(this.children.length,0);this._text=String(v)}set innerHTML(v){this._html=String(v)}get innerHTML(){return this._html||''}appendChild(x){this.children.push(x);return x}replaceChildren(...x){this.children=x}}
const $=id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id)};
const c={G:{mats:scenario.mats,forgeTab:'potion'},P:{lv:scenario.level,x:0,y:0},POT_LV:{hp:scenario.initial},_forgeSel:null,_salSel:new Set(),_rerollSel:null,_crForgeSel:-1,$,document:{createElement:()=>new E()},_ensureForgeAtlasLoad:()=>{},_forgeTabFallbackData:()=>'',BGM:{play:()=>trace.push(['BGM'])},_T:x=>x,_L:x=>x,addTxt:(...a)=>trace.push(['text',...a]),notify:x=>trace.push(['notify',x]),dbSaveNow:()=>trace.push(['save']),SLOT_NAMES:[],_MALICE_COST_MUL:.5,Math:Object.assign(Object.create(Math),{random:()=>{throw Error('unexpected RNG')}})};
const ctx=vm.createContext(c);
vm.runInContext(names.map(n=>n==='renderForge'?(policy==='current'?f[n]:render):n==='_fgCraft'?(policy==='current'?f[n]:craft):f[n]).join('\n'),ctx);
vm.runInContext('renderForge()',ctx);
const card=$('fgGrid').children.find(x=>x.onclick);assert(card);card.onclick();assert(c._forgeSel);
assert.equal(typeof $('fgCraftBtn').onclick,'function');$('fgCraftBtn').onclick(scenario.evt);
const outcome={potLv:c.POT_LV.hp,mats:c.G.mats,selectionCleared:c._forgeSel===null,saveCalls:trace.filter(x=>x[0]==='save').length,upgradeMessages:trace.filter(x=>x[0]==='text').length};
if(policy==='candidate'||scenario.id==='single-normal'){assert.equal(outcome.potLv,scenario.expectedLevel);assert.equal(outcome.mats,scenario.expectedMats);}
else if(scenario.id==='shift-level-requirement'){assert.equal(outcome.potLv,10);assert.equal(outcome.mats,470);}
else if(scenario.id==='ctrl-cap'){assert.equal(outcome.potLv,19);assert.equal(outcome.mats,250);}
else if(scenario.id==='shift-current-cost'){assert.equal(outcome.potLv,10);assert.equal(outcome.mats,470);}
else if(scenario.id==='shift-insufficient-next-cost'){assert.equal(outcome.potLv,2);assert.equal(outcome.mats,1);}
assert.equal(outcome.saveCalls,1);assert(outcome.selectionCleared);
rows.push({file,scenario:scenario.id,policy,input:scenario,outcome,trace});
}
}
const normal=rows.filter(x=>x.file===file&&x.scenario==='single-normal');assert.deepEqual(normal[0].trace,normal[1].trace);assert.deepEqual(normal[0].outcome,normal[1].outcome);
}
const q='_fgCraft|_fgSelect|POT_LV|物약|물약 강화|강화 비용|악의 소비.*50',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({task:'BALANCE-forge-potion-bulk-revalidation-1308',at:new Date().toISOString(),sources,rows,sourceRuns:20,docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Full renderForge→actual card.onclick→_fgSelect→actual fgCraftBtn.onclick→_fgCraft source executed; DOM/media/save stubbed','Single normal display/cost/trace preserved; invalid bulk results intentionally differ to obey existing formula and level/cap requirements','No chance/RNG used in fixture; random access throws','New generic callback false means abort before done count; other forge callbacks regression/integration root gate pending','No native modifier-key/default event or actual game/save validation'],productionApplied:false,newFiles:0},null,2));

