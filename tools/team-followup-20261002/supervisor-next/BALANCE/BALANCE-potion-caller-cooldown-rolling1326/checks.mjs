import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {tokenizer,parse} from 'acorn';import {spawnSync} from 'node:child_process';
const sha=x=>createHash('sha256').update(x).digest('hex');
function extract(s,n){const start=s.indexOf('function '+n+'(');assert(start>=0,n);return balanced(s,start);}
function balanced(s,start){const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let d=0,o=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='$'+'{'){d++;o=true;}if(l==='}')d--;if(o&&d===0)return s.slice(start,start+k.end);if(l==='eof')throw Error('extract eof');}}

const sources=[],rows=[];
for(const file of ['game.html','game-easy-test.html']){
const s=fs.readFileSync(file,'utf8'),names=['rollAffixes','_eqAffix','_eqAffixRebuild','useQuickslot','potHeal'],f=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
const object=balanced(s,s.indexOf("{id:'potionCdRed'"));parse('const affix='+object,{ecmaVersion:'latest'});
const old="Math.min(_eqAffix('potionCdRed'),.2)",newer="Math.min(Math.max(0,-_eqAffix('potionCdRed')),.2)";
const patched=f.useQuickslot.replace(old,newer);assert.notEqual(patched,f.useQuickslot);
const qsStart=s.indexOf('  let _qsAnyCD=false;'),qsEnd=s.indexOf('  const _msMax2=',qsStart);const tick=s.slice(qsStart,qsEnd);
sources.push({file,wholeSHA:sha(s),anchors:Object.fromEntries(names.map(n=>[n,sha(f[n])])),affixDefinitionSHA:sha(object),qsTickSHA:sha(tick),patch:{old,newer},candidateSHA:sha(patched)});
for(const input of [{id:'no-affix',rng:0,value:0,currentCD:420,candidateCD:420},{id:'generated-low-tier',rng:0,value:-.04,currentCD:436,candidateCD:403},{id:'generated-high-tier',rng:.999999,value:-.22,currentCD:512,candidateCD:336}])for(const policy of ['current','candidate']){
const trace=[],P={lv:1000,hp:150,mhp:350,x:0,y:0},G={on:true,paused:false,mats:5},INV={equipped:{belt:{affixes:[]}}};
const c={P,G,INV,SLOT_NAMES:['belt'],_eqAffixCache:null,_AFSLOT:{belt:'belt'},_DEMO_MODE:false,QSLOTS:[{type:'hp',count:1},{type:null},{type:null},{type:null}],qsCooldown:[0,0,0,0],POT:{hp:{col:'#33cc66'}},POT_LV:{hp:0},PASSIVES:{pRegen:0},Math:Object.assign(Object.create(Math),{random:()=>{trace.push('RNG');return input.rng}}),gl:()=>({}),blt:()=>({}),SFX:{potion:()=>trace.push('potion')},_T:x=>x,showPH:()=>trace.push('showPH'),addTxt:()=>trace.push('text'),addParts:()=>trace.push('parts'),updateQS:()=>trace.push('updateQS'),$:()=>null,sp:1};
const ctx=vm.createContext(c);vm.runInContext('const AFFIX_POOL=['+object+'];'+names.map(n=>n==='useQuickslot'?(policy==='current'?f[n]:patched):f[n]).join('\n')+'function tick(){'+tick+'}',ctx);
if(input.id!=='no-affix'){const a=vm.runInContext("rollAffixes(5,'belt')",ctx);assert.equal(a.length,1);assert.equal(a[0].value,input.value);INV.equipped.belt.affixes=a;}
assert.equal(vm.runInContext("_eqAffix('potionCdRed')",ctx),input.value);
vm.runInContext('useQuickslot(0)',ctx);const after={hp:P.hp,mats:G.mats,cd:c.qsCooldown[0]};assert.equal(after.cd,policy==='current'?input.currentCD:input.candidateCD);assert.equal(after.hp,250);assert.equal(after.mats,4);
vm.runInContext('tick()',ctx);assert.equal(c.qsCooldown[0],after.cd-1);
rows.push({file,input:input.id,policy,affixValue:input.value,after,afterFrameCD:c.qsCooldown[0],trace});
}
for(const input of ['no-affix','generated-low-tier','generated-high-tier']){const r=rows.filter(x=>x.file===file&&x.input===input);assert.deepEqual(r[0].trace,r[1].trace);assert.equal(r[0].after.hp,r[1].after.hp);assert.equal(r[0].after.mats,r[1].after.mats);}
}
const q='potionCdRed|물약쿨감|물약.*쿨다운|useQuickslot',d=spawnSync('rg',['-n',q,'docs'],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(d.status,0);
console.log(JSON.stringify({task:'BALANCE-potion-affix-sign-cooldown-1328',at:new Date().toISOString(),sources,rows,sourceRuns:12,docs:{query:q,exitCode:d.status,matches:d.stdout.trim().split('\n').length,sha:sha(d.stdout)},limits:['Actual rollAffixes executed with restricted pool containing dynamically extracted potionCdRed definition; whole loot distribution not simulated','Actual _eqAffix aggregation and full useQuickslot body, following quickslot cooldown block executed; no native gameplay/frame','Candidate corrects negative reduction sign to nonnegative reduction; existing cap20%,base420,min6 unchanged. Auto-path does not use potionCdRed and is untouched','No affix control HP/cost/cooldown/trace unchanged; affixed controls intentionally correct cooldown, RNG/effects/HP/cost traces unchanged','Audio/DOM/save/game not verified; root production/docs adoption needed'],productionApplied:false,newFiles:0},null,2));
