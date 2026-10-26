// B11 auto potion oracle exporter: extracts the original functions / statement blocks from game.html by their text anchors,
// executes them in a Node VM (stub globals only, Math.random replaced by a caller supplied sequence) over generated input grids and
// writes oracle.json. Nothing here is a hand-written expectation. JS runs only in this export; the native runtime never executes it.
//   node export.cjs [--source G:/exoduser/game.html] [--expect-source-sha <sha256>] [--out oracle.json]
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source','G:/exoduser/game.html'),outPath=arg('--out',path.join(__dirname,'oracle.json'));
const text=fs.readFileSync(sourcePath,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),fileSha=sha(text);
if(arg('--expect-source-sha',null)&&arg('--expect-source-sha',null)!==fileSha)throw Error('game.html changed: '+fileSha);
const lines=text.split('\n');
const anchors=[];
function findLine(prefix,{contains=false,nth=1,from=0}={}){const hits=[];for(let i=from;i<lines.length;i++){const t=lines[i].trim();if(contains?t.includes(prefix):t.startsWith(prefix))hits.push(i);}
  if(hits.length<nth)throw Error('anchor not found: '+prefix);return hits[nth-1];}
function take(name,start,end){const body=lines.slice(start,end+1).join('\n');anchors.push({name,start:start+1,end:end+1,sha256:sha(body),first:lines[start].trim().slice(0,100)});return body;}
function untilClose(start){for(let i=start+1;i<lines.length;i++)if(lines[i]==='}'||lines[i]==='};')return i;throw Error('no close after '+start);}
// ---- anchors (content based; line numbers are recorded, not trusted) ----
const potStart=findLine('const POT={');const POT=take('POT',potStart,untilClose(potStart));
const potHeal=take('potHeal',findLine('function potHeal('),findLine('function potHeal('));
const malStart=findLine('const _MALICE_COST_MUL=');const malice=take('_MALICE_COST_MUL+_malCost',malStart,untilClose(malStart+1));
const addStart=findLine('function addPotion(');const addPotion=take('addPotion',addStart,untilClose(addStart));
const autoStart=findLine('if(autoPotCd>0)autoPotCd-=sp;');const autoEnd=findLine('if(G._pStats)G._pStats._hC++;if(G._sStats)G._sStats.potions++;',{contains:true,from:autoStart})+1;
if(lines[autoEnd].trim()!=='}')throw Error('auto block end changed');const autoBlock=take('auto block',autoStart,autoEnd);
const killStart=findLine('if(Math.random()<(e.ib?1:1)){');const killEnd=findLine("if(e.ib&&Math.random()<.5){if(addPotion('hp',1))",{contains:true});const killBlock=take('kill drop',killStart,killEnd);
const chestStart=findLine('const matBonus=5+~~(G.stage*2);G.mats+=matBonus;');const chest=take('boss chest',chestStart,chestStart+1);
const medStart=findLine("if(_dt>=1&&Math.random()<.4){if(addPotion('hp',1))");const medium=take('medium chest',medStart,medStart);
const brkStart=findLine("else if(mo.loot==='potion'){if(addPotion('hp',1))");const breakable=take('breakable potion',brkStart,brkStart);
const cardStart=findLine('const lv=POT_LV[item.type],maxed=lv>=10;');const cardEnd=findLine('const _savLv=POT_LV[item.type];POT_LV[item.type]=lv+1;');const card=take('forge potion card',cardStart,cardEnd);
const craftStart=findLine('function _fgCraft(e){');const craft=take('_fgCraft',craftStart,untilClose(craftStart));
const clickLine=lines[findLine("if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+_L(' 강화 Lv.'")];
const gate=/if\((.+?)\)d\.onclick=/.exec(clickLine)[1];const fnText=/(\(\)=>\{POT_LV\[item\.type\]\+\+;G\.mats-=cost;[^}]*\})/.exec(clickLine)[1];
anchors.push({name:'forge click gate',start:findLine("if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+_L(' 강화 Lv.'")+1,end:0,sha256:sha(gate+fnText),first:gate});
// ---- VM helpers ----
function makeMath(seq){let i=0;const m=Object.create(null);for(const k of Object.getOwnPropertyNames(Math))m[k]=Math[k];m.random=()=>{if(i>=seq.length)throw Error('random sequence exhausted');return seq[i++];};m.__draws=()=>i;return m;}
const plain=o=>JSON.parse(JSON.stringify(o));
function autoContext(c,texts,counter){
  return vm.createContext({Math,P:{x:100,y:200,hp:c.hp,mhp:c.mhp,_lBeltT:0},G:{mats:c.mats,_pStats:{_hC:0},_sStats:{potions:0}},PASSIVES:{pRegen:c.regen},POT_LV:{hp:c.potLv},
    gl:()=>({potCd:c.glove}),blt:()=>({potCd:c.belt}),_eqAffix:id=>id==='potionPower'?c.power:0,_lEq:id=>id==='_lBeltBuff'?(c.legend?.15:0):0,
    window:{_parryLesson:c.parry?{active:true}:undefined,_systemLesson:undefined},SFX:{potion(){counter.sfx++;}},addTxt:(x,y,t,col,ttl)=>texts.push([x,y-200,t,col,ttl]),_T:s=>s});
}
function autoState(ctx,texts,counter){return plain({hp:ctx.P.hp,mats:ctx.G.mats,cd:vm.runInContext('autoPotCd',ctx),beltT:ctx.P._lBeltT,potions:ctx.G._sStats.potions,hC:ctx.G._pStats._hC,sfx:counter.sfx,texts});}
function runAuto(c){const texts=[],counter={sfx:0};const ctx=autoContext(c,texts,counter);
  vm.runInContext(potHeal+'\nvar autoPotCd='+c.cd+';function __auto(sp){\n'+autoBlock+'\n}',ctx);vm.runInContext('__auto('+c.sp+')',ctx);return autoState(ctx,texts,counter);}
function runAutoSequence(c,damage){const texts=[],counter={sfx:0};const ctx=autoContext(c,texts,counter);
  vm.runInContext(potHeal+'\nvar autoPotCd='+c.cd+';function __auto(sp){\n'+autoBlock+'\n}',ctx);const ticks=[];
  for(const d of damage){ctx.P.hp=Math.max(0,ctx.P.hp-d);texts.length=0;counter.sfx=0;vm.runInContext('__auto('+c.sp+')',ctx);ticks.push({damage:d,out:autoState(ctx,texts.slice(),counter)});}return ticks;}
function dropContext(seq,extra){const texts=[];const rnd=makeMath(seq);const ctx=vm.createContext(Object.assign({Math:rnd,P:{x:1000,y:2000},G:{mats:0,stage:0},e:{ib:false,x:30,y:40},QSLOTS:[{type:'hp',count:1},{type:null,count:0},{type:null,count:0},{type:null,count:0}],
    SFX:{pickup(){}},addTxt:(x,y,t,col,ttl)=>texts.push([x,y,t,col,ttl]),notify(){},_requestQSRefresh(){},_T:s=>s},extra||{}));
  vm.runInContext(POT+'\n'+addPotion,ctx);return {ctx,rnd,texts};}
const out={schema:'exoduser.unity.auto-potion-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,anchors,note:'blocks are located by text anchors and executed unchanged; the VM stubs only the globals listed in export.cjs'},executed:{potHeal,malice,addPotion,autoBlock,killBlock,chest,medium,breakable,card,craft,gate,fnText}};
// ---- auto block grids ----
const base={potLv:0,hp:100,mhp:500,mats:5,cd:0,sp:1,power:0,glove:0,belt:0,regen:0,parry:false,legend:false};
const powers=[0,.12,.2,.35,.55,.75],auto=[];
for(const potLv of [0,1,2,3,4,5,6,7,8,9,10])for(const power of powers){
  const need=Math.trunc(vm.runInContext('(function(){'+potHeal+'\n;return potHeal})()',vm.createContext({POT_LV:{hp:potLv}}))('hp')*(1+power));
  for(const off of [-1,-.5,0,.5,1,200])for(const mats of [0,1])for(const parry of [false,true]){const mhp=500;const hp=Math.max(-5,mhp-need-off);if(off===200&&!(hp>=0))continue;
    const c={...base,potLv,power,hp,mhp,mats,parry};auto.push({in:c,out:runAuto(c)});}}
// full / dead / negative hp, high threshold
for(const hp of [0,-3,.0001,499.9,500])for(const mats of [0,3])auto.push({in:{...base,hp,mats},out:runAuto({...base,hp,mats})});
// cooldown composition (the hp is low enough to always trigger)
for(const glove of [0,.05,.1,.2,.3,-.1])for(const belt of [0,.03,.15,.2,.22,.5])for(const regen of [0,1,5,10,11,15])for(const legend of [false,true]){const c={...base,potLv:2,hp:100,glove,belt,regen,legend};auto.push({in:c,out:runAuto(c)});}
// countdown by sp
for(const cd of [0,.5,1,1.5,5,6,419.9,420,1000])for(const sp of [.5,1,2.5,4])for(const mats of [1])auto.push({in:{...base,cd,sp,mats},out:runAuto({...base,cd,sp,mats})});
out.auto=auto;
// multi frame cycles
const seqCases=[],damagePatterns={steady:Array(240).fill(0).map((_,i)=>i%7===0?60:3),spike:Array(240).fill(0).map((_,i)=>i===10?480:i===130?250:0)};
for(const potLv of [0,3,10])for(const [name,dmg] of Object.entries(damagePatterns))for(const legend of [false,true]){const c={...base,potLv,hp:500,mats:12,legend,glove:.1,belt:.15,regen:4,sp:1};seqCases.push({name,in:c,ticks:runAutoSequence(c,dmg)});}
out.sequences=seqCases;
// ---- drops ----
const kill=[];const r1s=[0,.5,.99999],r2s=[0,.3,.3333333333333333,.33333333333333337,.34,.6666666666666666,.67,.99999],r3s=[0,.49999,.5,.99999];
for(const ib of [false,true])for(const r1 of r1s)for(const r2 of r2s)for(const r3 of r3s){const seq=ib?[r1,r2,r3]:[r1,r2];const {ctx,rnd,texts}=dropContext(seq,{e:{ib,x:30,y:40}});
  vm.runInContext('function __kill(){\n'+killBlock+'\n}__kill()',ctx);kill.push({ib,seq,out:plain({mats:ctx.G.mats,draws:rnd.__draws(),texts})});}
out.kill=kill;
const chests=[];for(let stage=0;stage<=40;stage++){const {ctx,texts}=dropContext([],{G:{mats:0,stage},it:{x:30,y:40}});vm.runInContext('function __c(){\n'+chest+'\n}__c()',ctx);chests.push({stage,out:plain({mats:ctx.G.mats,texts})});}out.chest=chests;
const mediums=[];for(const dt of [-1,0,1,2,5])for(const r of [0,.39999,.4,.99999]){const {ctx,rnd,texts}=dropContext([r],{G:{mats:0,stage:0},it:{x:30,y:40},_dt:dt});vm.runInContext('function __m(){\n'+medium+'\n}__m()',ctx);mediums.push({tier:dt,r,out:plain({mats:ctx.G.mats,draws:rnd.__draws(),texts})});}out.medium=mediums;
{const {ctx,texts}=dropContext([],{mo:{loot:'potion',x:30,y:40}});vm.runInContext('function __b(){if(mo.loot===\'mat\'){}\n'+breakable+'\n}__b()',ctx);out.breakable={out:plain({mats:ctx.G.mats,texts})};}
// ---- forge potion tab ----
const cards=[];for(const lv of [0,1,2,3,4,5,6,7,8,9,10,11])for(const plv of [1,50,99,100,101,199,200,500,900,999,1000,1500]){
  const ctx=vm.createContext({POT_LV:{hp:lv},P:{lv:plv},item:{type:'hp'}});vm.runInContext(potHeal+'\n'+malice+'\nfunction __card(){\n'+card+'\nreturn {lv,maxed,cost,reqLv,lvOk,nxt,cur,canSelect:!!('+gate+')}}',ctx);cards.push({lv,playerLevel:plv,out:vm.runInContext('__card()',ctx)});}
out.forgeCards=cards;
const crafts=[];for(const lv of [0,3,9,10,11])for(const mats of [0,2,3,4,10,30,100,1000])for(const cost of [3,25])for(const repeat of [false,true]){
  const ctx=vm.createContext({POT_LV:{hp:lv},G:{mats},P:{x:0,y:0},item:{type:'hp',n:'HP 물약'},cost,addTxt(){},renderForge(){},notify(){},dbSaveNow(){},_T:s=>s});
  vm.runInContext('var _forgeSel={cost:cost,fn:'+fnText+'};'+craft,ctx);vm.runInContext('_fgCraft({shiftKey:'+repeat+'})',ctx);crafts.push({potLv:lv,materials:mats,cost,repeat,out:plain({potLv:ctx.POT_LV.hp,materials:ctx.G.mats})});}
out.forgeCrafts=crafts;
fs.writeFileSync(outPath,JSON.stringify(out,null,1));
console.log(JSON.stringify({auto:auto.length,sequences:seqCases.length,kill:kill.length,chest:chests.length,medium:mediums.length,forgeCards:cards.length,forgeCrafts:crafts.length,sha:fileSha,anchors:anchors.map(a=>a.name+':'+a.start+'-'+a.end)}));
