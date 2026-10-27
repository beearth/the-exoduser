// CX-04a enemy hurt-head oracle exporter: runs the ORIGINAL head of hurtE (function start .. the line before "// ═══ 데미지 → HP 직행 ═══") from game.html
// in a Node VM and writes oracle.json.
//   node export.cjs --source <committed game.html> --head <commit sha> [--expect-source-sha <sha256>] [--out oracle.json]
// Wrapper (the only text added around original lines):
//   "function __H1(e,dmg,ang,noSound,opts,atkEl=0){"  (original line 1 with the name changed)
//   + original lines 2 .. (anchor line - 1) unchanged
//   + "return {<top-level locals + the two reassigned parameters>};}finally{_shBufI--}}"
// A bare `return;` in the original leaves the function with `undefined` (early return); falling off the range returns the locals object.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source'),outPath=arg('--out',path.join(__dirname,'oracle.json')),headSha=arg('--head','');
if(!sourcePath)throw Error('--source <committed game.html> is required');
const text=fs.readFileSync(sourcePath,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),fileSha=sha(text);
if(arg('--expect-source-sha',null)&&arg('--expect-source-sha',null)!==fileSha)throw Error('game.html changed: '+fileSha);
const lines=text.split('\n');const anchors=[];
const compiles=src=>{try{new vm.Script(src);return true;}catch(e){return false;}};
function find(prefix){const hits=[];for(let i=0;i<lines.length;i++)if(lines[i].startsWith(prefix))hits.push(i);if(hits.length!==1)throw Error('anchor '+JSON.stringify(prefix)+' matched '+hits.length+' lines');return hits[0];}
function record(name,start,end){const body=lines.slice(start,end+1).join('\n');anchors.push({name,start:start+1,end:end+1,sha256:sha(body),first:lines[start].slice(0,90)});return body;}
function stmt(name,prefix){const s=find(prefix);for(let e=s;e<Math.min(lines.length,s+400);e++){const body=lines.slice(s,e+1).join('\n');if(compiles(body))return record(name,s,e);}throw Error('no complete statement from '+prefix);}
function untilBrace(name,prefix){const s=find(prefix);for(let e=s+1;e<lines.length;e++)if(lines[e]==='}'||lines[e]==='}\r')return record(name,s,e);throw Error('no closing brace for '+prefix);}
function single(name,prefix){const s=find(prefix);return record(name,s,s);}
const blocks=[];const add=b=>blocks.push(b);
// ---- mkEn + tables (to create realistic enemy objects; same blocks as CX-02/03a) ----
add(stmt('EL','const EL={'));add(stmt('CHAPTER_STAGES','const CHAPTER_STAGES=['));add(stmt('TOTAL_STAGES','const TOTAL_STAGES='));
add(stmt('HELL_NAMES','const HELL_NAMES=['));add(stmt('HELL_THEMES','const HELL_THEMES=['));add(stmt('HELL_BOSSES','const HELL_BOSSES=['));
add(untilBrace('SI_TO_HELL+SI_TO_FLOOR loop','const SI_TO_HELL=new Uint8Array'));add(untilBrace('STG loop','const STG=[];'));
for(const n of ['ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_R','ETYPE_RANGE','ETYPE_POISE','ETYPE_SHIELD','ETYPE_COL','ETYPE_COLS','ETYPE_ERES','RARE_ETYPE','ELITE_TIERS','ELITE_PROB','MOD_DEFS'])add(stmt(n,'const '+n+'='));
add(single('DIFF_MUL','const DIFF_MUL='));add(single('DIFF_LV_OFF','const DIFF_LV_OFF='));
add(stmt('ETYPE_SPD','const ETYPE_SPD='));add(stmt('isRareEtype','function isRareEtype('));
add(single('ELC','const ELC='));add(single('T','const T=40;'));add(single('_MOB8','const _MOB8_TOTAL='));add(stmt('BOSS_MOVES','const BOSS_MOVES=['));
add(stmt('_CH1_OPENING_EXCLUDED_ET','const _CH1_OPENING_EXCLUDED_ET='));add(stmt('AURA_DEFS','const AURA_DEFS=['));
add(stmt('rollElite','function rollElite('));add(stmt('rollMods','function rollMods('));add(stmt('rollAura','function rollAura('));
add(single('_enemyHpPacing','function _enemyHpPacing('));add(stmt('_isDruidFinale','function _isDruidFinale('));add(stmt('_druidFinaleHp','function _druidFinaleHp('));
add(stmt('_assignBossSkin','function _assignBossSkin('));add(stmt('_assignMobSkin','function _assignMobSkin('));add(stmt('safePt','function safePt('));
add(stmt('mkEn','function mkEn('));
// ---- pure helpers the hurtE head calls, executed as written ----
add(single('ELP','const ELP='));add(single('_UNDEAD_ET','const _UNDEAD_ET='));add(single('elMul','function elMul('));
for(const n of ['ar','wp','nc','rg1','rg2'])add(single(n,'function '+n+'(){'));
add(single('dst','function dst('));
// ---- the hurtE head ----
const hStart=find('function hurtE(e,dmg,ang,noSound,opts,atkEl=0){'),hEnd=find('  // ═══ 데미지 → HP 직행 ═══');
if(hEnd<=hStart)throw Error('end anchor before start');
const bodyLines=lines.slice(hStart+1,hEnd);
const body=record('H1 hurtE head (lines after the declaration)',hStart+1,hEnd-1);
// top-level locals of the try block: const/let at brace depth 0 after the `try{` line, plus every `var`
const tryIdx=bodyLines.findIndex(l=>l.trim()==='try{');if(tryIdx<0)throw Error('try{ not found');
const locals=[];{let depth=0,str=null;for(let li=tryIdx+1;li<bodyLines.length;li++){const l=bodyLines[li];const declHere=/^\s*(const|let)\s+([A-Za-z_]\w*)/.exec(l);
  if(depth===0&&declHere)locals.push(declHere[2]);
  for(const m of l.matchAll(/\bvar\s+([A-Za-z_]\w*)/g))if(!locals.includes(m[1]))locals.push(m[1]);
  for(let i=0;i<l.length;i++){const c=l[i],n=l[i+1];
    if(str){if(c==='\\'){i++;continue;}if(c===str)str=null;continue;}
    if(c==='/'&&n==='/')break;
    if(c==="'"||c==='"'||c==='`'){str=c;continue;}
    if(c==='{')depth++;else if(c==='}')depth--;}
  str=null;}}
const returned=['dmg','atkEl',...locals];
const H1='function __H1(e,dmg,ang,noSound,opts,atkEl=0){\n'+body+'\nreturn {'+returned.join(',')+'};}finally{_shBufI--}}';
if(!compiles(H1))throw Error('H1 wrapper does not compile');

// ---- VM ----
const ctx=vm.createContext({});
vm.runInContext(`var window=this;var _useGPU=false,_useGL=false,_ESPRITES=[];var P={},G={stage:0,_stageDiffOff:0},OPT={diff:5},_DEMO_MODE=false,_DEMO_LAST_STAGE=0,ens=[],PASSIVES={},INV={equipped:{}},_shBufI=0,_hitSfxCd=0,_now=0;
var __seq=[],__i=0,__log=[],__vals={},__aff={},__leq={},__ueq={};
Math.random=function(){if(__i>=__seq.length)throw new Error("random sequence exhausted");return __seq[__i++];};
function __ser(a){if(a===undefined||a===null)return null;if(typeof a==='object'){const i=ens.indexOf(a);if(i>=0)return {e:i};if(Array.isArray(a))throw new Error('array argument');
  return {o:Object.keys(a).sort().map(k=>[k,a[k]===undefined?null:a[k]])};}return a;}
function __rec(name){const a=[];for(let i=1;i<arguments.length;i++)a.push(__ser(arguments[i]));__log.push([name].concat(a));}
function canMv(x,y,r){return true;}
function _eqAffix(k){__rec('eqAffix',k);return __aff[k]||0;}
function _lEq(k){__rec('lEq',k);return __leq[k]||0;}
function _uEq(k){__rec('uEq',k);return __ueq[k]||0;}
function statStr(){__rec('statStr');return __vals.statStr;}
function statCrit(){__rec('statCrit');return __vals.statCrit;}
function statCritDmg(){__rec('statCritDmg');return __vals.statCritDmg;}
function pAtkMul(){__rec('pAtkMul');return __vals.pAtkMul;}
function meleeRef(){__rec('meleeRef');return __vals.meleeRef;}
function pDotPool(){__rec('pDotPool');return __vals.pDotPool;}
function _predBonus(e){__rec('predBonus',e);return __vals.predBonus;}
function _hunterMul(e){__rec('hunterMul',e);return __vals.hunterMul;}
function _petOnAtk(){__rec('petOnAtk',_shBufI);}
function shQuery(x,y,r){__rec('shQuery',x,y,r,_shBufI);return ens.filter(o=>Math.sqrt((o.x-x)**2+(o.y-y)**2)<=r);}
function hurtE(e,d,a,ns,o){__rec('hurtE',e,d,a,ns,o);}
function hurtP(d){__rec('hurtP',d);}
function _spawnBossProjectile(e,o){__rec('spawnBossProjectile',e,o);}
function addTxt(){__rec.apply(null,['addTxt'].concat(Array.prototype.slice.call(arguments)));}
function addParts(x,y,c,n){__rec('addParts',x,y,c,n);}
function shake(n){__rec('shake',n);}
function doHitFlash(c,a){__rec('doHitFlash',c,a);}
function playSample(k,v,p){__rec('playSample',k,v,p);}
function _hitSfxForEtype(et){__rec('hitSfxForEtype',et);return {key:'hit_'+et,pitch:1+et/1000};}
function _T(s){__rec('T',s);return s;}
var SFX={block:function(){__rec('sfxBlock');}};`,ctx);
for(const b of blocks)vm.runInContext(b,ctx);
vm.runInContext(H1,ctx);
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?Array.from(v):v));
const get=n=>plain(vm.runInContext(n,ctx));
const tables={ELC:get('ELC'),ELP:get('ELP'),EL:get('EL'),UNDEAD_ET:get('Array.from(_UNDEAD_ET).sort((a,b)=>a-b)')};

// ---- PRNG + base enemies ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seqFor=(seed,first)=>{const r=mulberry32(seed),a=[...(first||[])];while(a.length<60)a.push(r());return a;};
function makeBase(etype,ib,si,seed,el){
  vm.runInContext('P={x:0,y:0,lv:100};OPT={diff:5};G={stage:'+si+',_stageDiffOff:0};_DEMO_MODE=false;_DEMO_LAST_STAGE=0;__log=[];__i=0;',ctx);
  ctx.__seq=seqFor(seed,[0.9999]);
  return JSON.parse(JSON.stringify(vm.runInContext('mkEn(1000,1000,'+si+','+etype+','+ib+','+el+',2)',ctx)));
}
const baseSpecs=[['etype0',0,0,false,0],['etype6',6,4,false,2],['etype40',40,14,false,3],['etype41',41,14,false,3],['etype57',57,26,false,1],['etype63',63,32,false,2],['etype74',74,26,false,1],['etype85',85,32,false,4],
 ['etype91',91,10,false,0],['etype92',92,10,false,2],['etype93',93,10,false,0],['etype99',99,10,false,0],['undead4',4,4,false,3],['boss si0',0,0,true,3],['boss si3',0,3,true,1],['etype7',7,4,false,4]];
const bases=baseSpecs.map(([name,et,si,ib,el],i)=>({name,etype:et,si,ib,obj:makeBase(et,ib,si,100+i,el)}));
const BI=Object.fromEntries(bases.map((b,i)=>[b.name,i]));

// ---- cases ----
const cases=[];
const defWorld=()=>({P:{x:1000,y:1000,hp:500,mhp:1000,mp:50,mmp:100,iframes:0,eShield:0,eShieldMax:0},sStats:{crits:0},playTime:1000,PASSIVES:{},equipped:{},hitSfxCd:0,shBufI:0,now:12345,btLog:null,lesson:false});
const defVals=()=>({statStr:1,statCrit:0,statCritDmg:1.5,pAtkMul:1,meleeRef:100,pDotPool:1,predBonus:0,hunterMul:1});
function mk(name,o){cases.push({name,base:'etype0',over:{x:1050,y:1000},args:{dmg:100,ang:0.5,noSound:false,opts:null,atkEl:0},world:defWorld(),vals:defVals(),aff:{},leq:{},ueq:{},others:[],seed:cases.length+1,first:[0.9],...o});}
const W=(o)=>({...defWorld(),...o});const WP=(o)=>({...defWorld(),P:{...defWorld().P,...o}});
const V=(o)=>({...defVals(),...o});
const args=(o)=>({dmg:100,ang:0.5,noSound:false,opts:null,atkEl:0,...o});
const other=(base,over)=>({base,over:over||{}});
// first random 0.9 -> no crit (crit chance 0), no dodge, etc.
// --- gates ---
mk('gate: parry lesson active',{world:W({lesson:true}),args:args({opts:{dot:true}})});
mk('gate: e not alive',{over:{x:1050,y:1000,alive:false}});mk('gate: hp 0',{over:{x:1050,y:1000,hp:0}});mk('gate: hp negative',{over:{x:1050,y:1000,hp:-5}});
mk('gate: btDmgLog present',{world:W({btLog:[]})});mk('gate: btDmgLog present, early return keeps log (dead)',{world:W({btLog:[]}),over:{x:1050,y:1000,alive:false}});
mk('gate: shBufI start 3',{world:W({shBufI:3})});mk('gate: shBufI balanced on early return (iframes)',{world:W({shBufI:2}),over:{x:1050,y:1000,reviveIframes:5}});
for(const [ri,dot] of [[91,false],[91,true],[90,false],[2,false],[1,false],[0,false],[2,true],[1,true]])mk('revive iframes '+ri+(dot?' dot':''),{over:{x:1050,y:1000,reviveIframes:ri},args:args({opts:dot?{dot:true}:null})});
// --- counters ---
mk('mirror guard active',{base:'boss si0',over:{x:1050,y:1000,_mgActive:true,s:'bossMirrorGuard',atk:200,el:2},world:W({equipped:{armor:{el:1}}})});
mk('mirror guard active but wrong state',{base:'boss si0',over:{x:1050,y:1000,_mgActive:true,s:'idle'}});
mk('mirror guard inactive',{base:'boss si0',over:{x:1050,y:1000,_mgActive:false,s:'bossMirrorGuard'}});
mk('burst counter active',{base:'boss si0',over:{x:1050,y:1000,_bcActive:true,s:'bossBurstCounter',atk:333,el:3},world:W({equipped:{armor:{el:3}}})});
mk('burst counter wrong state',{base:'boss si0',over:{x:1050,y:1000,_bcActive:true,s:'idle'}});
mk('mirror guard on non-boss',{over:{x:1050,y:1000,_mgActive:true,s:'bossMirrorGuard'}});
// --- rare specials ---
mk('etype99 caps at 1% mhp',{base:'etype99',over:{x:1050,y:1000,mhp:5000},args:args({dmg:9999})});mk('etype99 cap below 1 -> 1',{base:'etype99',over:{x:1050,y:1000,mhp:50},args:args({dmg:9999})});mk('etype99 small dmg stays',{base:'etype99',over:{x:1050,y:1000,mhp:5000},args:args({dmg:10})});
for(const [absorb,max,dmg,el] of [[0,100,30,1],[80,100,30,1],[70,100,30,1],[0,100,30,0],[0,100,500,2]])mk('etype92 absorb '+absorb+'/'+max+' dmg '+dmg+' atkEl '+el,{base:'etype92',over:{x:1050,y:1000,_mrAbsorb:absorb,_mrAbsorbMax:max,facing:1.2},args:args({dmg,atkEl:el})});
mk('etype92 dot is ignored',{base:'etype92',over:{x:1050,y:1000,_mrAbsorb:90,_mrAbsorbMax:100},args:args({dmg:30,atkEl:1,opts:{dot:true}})});
mk('etype91 hit count undefined->1',{base:'etype91',over:{x:1050,y:1000,_tmHitCnt:undefined}});mk('etype91 hit count 5',{base:'etype91',over:{x:1050,y:1000,_tmHitCnt:5}});
mk('etype93 first hit curses',{base:'etype93',over:{x:1050,y:1000}});mk('etype93 curse stacks',{base:'etype93',over:{x:1050,y:1000},world:WP({_greedCurse:100})});mk('etype93 already fleeing',{base:'etype93',over:{x:1050,y:1000,_mcFleeing:true}});
mk('etype40 phasing returns',{base:'etype40',over:{x:1050,y:1000,_wraithPhasing:true}});mk('etype40 not phasing',{base:'etype40',over:{x:1050,y:1000,_wraithPhasing:false}});
mk('etype41 guarding halves',{base:'etype41',over:{x:1050,y:1000,_dkGuarding:true},args:args({dmg:101})});mk('etype41 not guarding',{base:'etype41',over:{x:1050,y:1000,_dkGuarding:false}});
mk('etype57 curled returns',{base:'etype57',over:{x:1050,y:1000,_curled:true}});mk('etype57 not curled',{base:'etype57',over:{x:1050,y:1000,_curled:false}});
// --- parry blue bean, bleed, poison ---
mk('parryBlueBean raises to 10% mhp',{over:{x:1050,y:1000,mhp:1000},args:args({dmg:5,opts:{parryBlueBean:true}})});mk('parryBlueBean keeps larger dmg',{over:{x:1050,y:1000,mhp:1000},args:args({dmg:500,opts:{parryBlueBean:true}})});
mk('parryBlueBean boss -> exactly 10% mhp',{base:'boss si0',over:{x:1050,y:1000,mhp:12345},args:args({dmg:5,opts:{parryBlueBean:true}})});
for(const [stk,pool] of [[undefined,undefined],[8,50],[9,50],[10,50]])mk('bleed stk '+stk,{over:{x:1050,y:1000,bleedStk:stk,_bleedPool:pool,bleedT:100},args:args({opts:{bleed:true}}),vals:V({pDotPool:1.5})});
mk('bleed on dot is ignored',{over:{x:1050,y:1000},args:args({opts:{bleed:true,dot:true}}),vals:V({pDotPool:1.5})});
for(const stk of [0,9,10])mk('poison stk '+stk,{over:{x:1050,y:1000,poisonStk:stk,_poisonPool:7},args:args({opts:{poison:true}}),vals:V({pDotPool:1.2})});
// --- etype6 shield ---
for(const [ang,sh,ns,name] of [[0,Math.PI,false,'ang exactly opposite'],[0,Math.PI+Math.PI/3-0.001,false,'just inside pi/3'],[0,Math.PI+Math.PI/3+0.001,false,'just outside pi/3'],[0,Math.PI-1.0471975511965976,false,'edge'],[3,0.1,true,'noSound'],[undefined,0.1,false,'ang undefined'],[-3,6,false,'wrap negative'],[9,0.2,false,'wrap multiple turns']])mk('etype6 shield '+name,{base:'etype6',over:{x:1050,y:1000,shieldAng:sh},args:args({ang,noSound:ns,dmg:101})});
// --- element resistance ---
for(const el of [0,1,2,3,4])mk('eRes atkEl '+el,{over:{x:1050,y:1000,eRes:[0.1,0.2,0.3,0.4,0.5,0.6,0.7]},args:args({atkEl:el,dmg:200})});
mk('eRes zero',{over:{x:1050,y:1000,eRes:[0,0,0,0,0,0,0]},args:args({atkEl:1})});mk('eRes atkEl 5',{over:{x:1050,y:1000,eRes:[0,0,0,0,0,0.5,0]},args:args({atkEl:5})});mk('eRes atkEl 6',{over:{x:1050,y:1000,eRes:[0,0,0,0,0,0,0.5]},args:args({atkEl:6})});mk('eRes atkEl 7 (out of table)',{over:{x:1050,y:1000},args:args({atkEl:7})});
// --- 63 / 74 / 85 ---
mk('etype63 crab guard',{base:'etype63',over:{x:1050,y:1000,_crabGuard:true},args:args({dmg:101})});mk('etype63 crab guard dot',{base:'etype63',over:{x:1050,y:1000,_crabGuard:true},args:args({dmg:101,opts:{dot:true}})});
mk('etype74 obsidian guard',{base:'etype74',over:{x:1050,y:1000,_obsGuarding:true},args:args({dmg:101})});mk('etype74 obsidian guard dot',{base:'etype74',over:{x:1050,y:1000,_obsGuarding:true},args:args({dmg:101,opts:{dot:true}})});
for(const r of [0.2499999,0.25,0.2500001,0.9])mk('etype85 dodge roll '+r,{base:'etype85',over:{x:1050,y:1000},first:[r]});
mk('etype85 dodge ignored for dot',{base:'etype85',over:{x:1050,y:1000},args:args({opts:{dot:true}}),first:[0.1]});
// --- modifiers / aura / M22 ---
mk('M14 halves',{over:{x:1050,y:1000,mods:['M14']},args:args({dmg:101})});mk('aura guardian .75',{over:{x:1050,y:1000,_aDefM:0.75},args:args({dmg:101})});mk('aura _aDefM 1 (no effect)',{over:{x:1050,y:1000,_aDefM:1}});mk('aura _aDefM 0 falsy',{over:{x:1050,y:1000,_aDefM:0}});
mk('M22 ally nearby',{over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1100,y:1000,mods:['M22']})],args:args({dmg:101})});
mk('M22 ally too far (>120)',{over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1171,y:1000,mods:['M22']})]});
mk('M22 ally exactly 120',{over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1170,y:1000,mods:['M22']})],args:args({dmg:101})});
mk('M22 other without M22',{over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1100,y:1000,mods:['M03']})]});
mk('M22 boss is excluded',{base:'boss si0',over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1100,y:1000,mods:['M22']})]});
mk('M22 first match breaks (two allies)',{over:{x:1050,y:1000,mods:['M05']},others:[other('etype0',{x:1100,y:1000,mods:['M22']}),other('etype0',{x:1080,y:1000,mods:['M22']})],args:args({dmg:101})});
mk('mods empty array (no M14, M22 search runs)',{over:{x:1050,y:1000,mods:[]},others:[other('etype0',{x:1100,y:1000,mods:['M22']})]});
// --- hit sound cooldown ---
for(const cd of [0,-1,5,0.5])mk('hit sfx cd '+cd,{world:W({hitSfxCd:cd})});mk('hit sfx on dot skipped',{args:args({opts:{dot:true}})});
// --- shock ---
for(const stk of [undefined,0,1,2,9,10])mk('shock stk '+stk,{over:{x:1050,y:1000,_shockStk:stk},args:args({dmg:101})});
for(const [stk,stun,ib,noStun,t] of [[1,0,false,false,'lightning stk 1->2'],[2,0,false,false,'lightning 2->3 stuns'],[2,5,false,false,'lightning 2->3 already stunned'],[2,0,true,false,'boss no stun'],[2,0,false,true,'noStun'],[9,0,false,false,'stk 9->10'],[10,0,false,false,'stk 10 stays']])
  mk('shock '+t,{base:ib?'boss si0':'etype0',over:{x:1050,y:1000,_shockStk:stk,stunned:stun,_shockT:undefined},args:args({atkEl:4,opts:noStun?{noStun:true}:null,dmg:101})});
mk('lightning on dot no shock',{over:{x:1050,y:1000,_shockStk:2},args:args({atkEl:4,opts:{dot:true}})});
mk('lightning shockT keeps larger',{over:{x:1050,y:1000,_shockStk:0,_shockT:900},args:args({atkEl:4})});
// --- darkCurse / STR / undead ---
mk('cursed x1.25',{over:{x:1050,y:1000,_cursed:5},args:args({dmg:101})});mk('cursed zero',{over:{x:1050,y:1000,_cursed:0}});
mk('statStr 1.37',{vals:V({statStr:1.37}),args:args({dmg:101})});
mk('undead antiRevive',{base:'undead4',over:{x:1050,y:1000},aff:{antiRevive:0.5},args:args({dmg:101})});mk('undead boss excluded',{base:'boss si0',over:{x:1050,y:1000,etype:4},aff:{antiRevive:0.5}});mk('non-undead',{aff:{antiRevive:0.5}});mk('ghoul flag',{over:{x:1050,y:1000,_isGhoul:true},aff:{antiRevive:0.5},args:args({dmg:101})});mk('undead affix zero',{base:'undead4',over:{x:1050,y:1000},aff:{antiRevive:0}});
// --- element affixes ---
mk('elemConvert roll under',{aff:{elemConvert:0.5},world:W({equipped:{weapon:{el:2}}}),first:[0.3,0.9],args:args({dmg:101})});
mk('elemConvert roll over',{aff:{elemConvert:0.5},world:W({equipped:{weapon:{el:2}}}),first:[0.7,0.9]});
mk('elemConvert weapon el 0',{aff:{elemConvert:0.5},world:W({equipped:{weapon:{el:0}}}),first:[0.3,0.9]});
mk('elemConvert weapon missing el',{aff:{elemConvert:0.5},world:W({equipped:{}}),first:[0.3,0.9]});
mk('elemConvert not for atkEl>0',{aff:{elemConvert:0.5},args:args({atkEl:1}),world:W({equipped:{weapon:{el:2}}}),first:[0.3,0.9]});
mk('elemFocus atkEl>0',{aff:{elemFocus:0.2},args:args({atkEl:1,dmg:101})});mk('elemFocus atkEl 0',{aff:{elemFocus:0.2}});
for(const [el,k] of [[1,'fireDmgPct'],[2,'iceDmgPct'],[3,'darkDmgPct'],[4,'lightDmgPct']]){mk('phase2 '+k,{aff:{[k]:0.1},args:args({atkEl:el,dmg:101})});mk('phase2 bonus '+el,{aff:{[k.replace('Pct','Bns')]:0.05},args:args({atkEl:el,dmg:101})});}
mk('phase2 atkEl 5 (no table)',{aff:{fireDmgPct:0.1},args:args({atkEl:5,dmg:101})});
mk('poisonDmgPct with poison',{aff:{poisonDmgPct:0.1,poisonDmgBns:0.05},args:args({opts:{poison:true},dmg:101})});mk('poisonDmgPct without poison',{aff:{poisonDmgPct:0.1}});
// --- crisis / killSlayer / legendary ---
for(const [hp,t] of [[299.99,'just under 30%'],[300,'exactly 30%'],[301,'over']])mk('crisisBoost '+t,{world:WP({hp,mhp:1000}),aff:{crisisBoost:0.4},args:args({dmg:101})});
mk('crisisBoost zero affix',{world:WP({hp:10}),aff:{crisisBoost:0}});
mk('killSlayer buff',{world:WP({_killBuff:30,_killMul:0.5}),args:args({dmg:101})});mk('killSlayer buff expired',{world:WP({_killBuff:0,_killMul:0.5})});
mk('legend belt',{world:WP({_lBeltT:100}),leq:{_lBeltBuff:0.15},args:args({dmg:101})});mk('legend belt no value',{world:WP({_lBeltT:100}),leq:{}});
mk('legend boots consumed',{world:WP({_lBootsT:50}),leq:{_lBootsEvade:0.8},args:args({dmg:101})});mk('legend boots on dot not consumed',{world:WP({_lBootsT:50}),leq:{_lBootsEvade:0.8},args:args({opts:{dot:true}})});
mk('legend spear stacks',{world:WP({_lSpearT:50,_lSpearStk:3}),leq:{_lSpearStack:0.2},args:args({dmg:101})});mk('legend spear no stacks',{world:WP({_lSpearT:50,_lSpearStk:0}),leq:{_lSpearStack:0.2}});mk('legend spear stk undefined',{world:WP({_lSpearT:50}),leq:{_lSpearStack:0.2}});
// --- accessories / passives / hunter ---
mk('accessory dmgBonus all slots',{world:W({equipped:{necklace:{dmgBonus:5},ring1:{dmgBonus:4},ring2:{dmgBonus:3},belt:{dmgBonus:2},bracelet:{dmgBonus:1},headband:{dmgBonus:6},headband2:{dmgBonus:7}}}),args:args({dmg:101})});
mk('accessory dmgBonus none',{world:W({equipped:{necklace:{},ring1:{dmgBonus:0}}})});
mk('predBonus',{vals:V({predBonus:0.2}),args:args({dmg:101})});mk('hunterMul 1.5',{vals:V({hunterMul:1.5}),args:args({dmg:101})});mk('hunterMul exactly 1',{vals:V({hunterMul:1})});
// --- conditional affix sum ---
for(const [ehp,t] of [[700,'abund exactly 70%'],[699,'abund under'],[1000,'full']])mk('abundDmg '+t,{over:{x:1050,y:1000,hp:ehp,mhp:1000},aff:{abundDmg:0.1},world:W({PASSIVES:{pAbund:2}}),args:args({dmg:101})});
mk('abundDmg passive only',{world:W({PASSIVES:{pAbund:3}}),args:args({dmg:101})});
for(const [php,t] of [[700,'healthyAtk 70% exact'],[699,'healthyAtk under'],[1000,'fullLife'],[350,'lowLife 35% exact'],[351,'lowLife over']])mk('player hp '+t,{world:WP({hp:php,mhp:1000}),aff:{healthyAtk:0.1,fullLifeDmg:0.2,lowLifeDmg:0.3,injuredDmg:0.05},args:args({dmg:101})});
for(const [ehp,t] of [[300,'predDmg 30% exact'],[301,'predDmg over'],[200,'overkil 20% exact'],[950,'firstStrike 95% exact'],[949,'firstStrike under']])mk('enemy hp '+t,{over:{x:1050,y:1000,hp:ehp,mhp:1000},aff:{predDmg:0.1,overkilDmg:0.2,firstStrike:0.3},args:args({dmg:101})});
mk('firstStrike on dot excluded',{over:{x:1050,y:1000,hp:1000,mhp:1000},aff:{firstStrike:0.3},args:args({opts:{dot:true}})});
for(const [dx,t] of [[120,'close exact 120'],[121,'close over (neither)'],[300,'far exact 300 (not far)'],[301,'far 301']])mk('distance '+t,{over:{x:1000+dx,y:1000},aff:{closeDmg:0.1,farDmg:0.2},args:args({dmg:101})});
mk('distance manhattan',{over:{x:1090,y:1030},aff:{closeDmg:0.1,farDmg:0.2}});
mk('stunned affix + club',{over:{x:1050,y:1000,stunned:10},aff:{stunDmgUp:0.2},ueq:{_uClubStun:3},args:args({dmg:101})});mk('club stun 1 (no add)',{over:{x:1050,y:1000,stunned:10},aff:{stunDmgUp:0.2},ueq:{_uClubStun:1}});
mk('state affixes',{over:{x:1050,y:1000,_frozen:5,_burning:3,burnT:0,_poisoned:0,poison:1,_cursed:2,_slowed:0,_webSlow:4,_freezeSlow:0},aff:{frozenDmgUp:0.1,burnDmgUp:0.1,poisonDmgUp:0.1,curseDmgUp:0.1,slowDmgUp:0.1},args:args({dmg:101})});
mk('state affixes via alt fields',{over:{x:1050,y:1000,burnT:5,poison:0,_poisoned:2,_slowed:1,_freezeSlow:3},aff:{burnDmgUp:0.1,poisonDmgUp:0.1,slowDmgUp:0.1},args:args({dmg:101})});
mk('boss slayer',{base:'boss si0',over:{x:1050,y:1000},aff:{bossSlayer:0.1,vsBossDmg:0.2,mobSlayer:1},args:args({dmg:101})});
mk('elite slayer',{over:{x:1050,y:1000,mods:['M05']},aff:{eliteSlayer:0.1,vsEliteDmg:0.2,mobSlayer:1},args:args({dmg:101})});
mk('mob slayer (mods undefined)',{over:{x:1050,y:1000,mods:undefined},aff:{mobSlayer:0.3,eliteSlayer:1},args:args({dmg:101})});mk('mob slayer (mods empty)',{over:{x:1050,y:1000,mods:[]},aff:{mobSlayer:0.3,eliteSlayer:1},args:args({dmg:101})});
// --- minimum 1 ---
mk('min 1: dmg 0.4 stays then raised',{args:args({dmg:0.4})});mk('min 1: 0.4 with M14',{over:{x:1050,y:1000,mods:['M14']},args:args({dmg:1.9})});mk('min 1: dmg 0',{args:args({dmg:0})});mk('min 1: dmg negative',{args:args({dmg:-5})});
// --- kb / poise multipliers ---
mk('kbMult 0 and poiseMult 2',{args:args({opts:{kbMult:0,poiseMult:2}})});mk('kbMult only',{args:args({opts:{kbMult:1.7}})});
// --- binary flags ---
for(const [o,el,t] of [[{pure:true},0,'pure'],[{pure:true,maxDist:300},0,'pure+arrow'],[{maxDist:300},0,'arrow'],[{maxDist:300,magic:true},0,'arrow+magic'],[{maxDist:0},0,'arrow maxDist 0'],[{explode:true},0,'explode'],[{explode:true,magic:true},0,'explode+magic'],[{beam:true},0,'beam'],[{magic:true},0,'magic'],[null,1,'atkEl 1'],[{beam:true},2,'beam+atkEl'],[{explode:true},1,'explode+atkEl'],[{proj:true},0,'proj'],[{proj:true,maxDist:200},0,'proj+arrow'],[{dot:true},0,'dot'],[{dot:true,shieldHit:true},0,'dot+shieldHit']])
  mk('flags '+t,{aff:{meleeDmgPct:0.1,rangedDmgPct:0.2,projDmgPct:0.3,spellDmgPct:0.4,beamDmgPct:0.5,dotDmgPct:0.6},world:W({PASSIVES:{pBow:2}}),args:args({opts:o,atkEl:el,dmg:101})});
// --- debuffs ---
mk('weakPhys melee',{over:{x:1050,y:1000,_weakPhys:0.3},args:args({dmg:101})});mk('weakPhys not for magic',{over:{x:1050,y:1000,_weakPhys:0.3},args:args({atkEl:1,dmg:101})});mk('weakPhys not for arrow',{over:{x:1050,y:1000,_weakPhys:0.3},args:args({opts:{maxDist:5},dmg:101})});
mk('weakMag magic',{over:{x:1050,y:1000,_weakMag:0.3},args:args({atkEl:1,dmg:101})});mk('weakMag melee',{over:{x:1050,y:1000,_weakMag:0.3}});
mk('weakPj arrow',{over:{x:1050,y:1000,_weakPj:0.3},args:args({opts:{maxDist:5},dmg:101})});mk('weakPj pure ignored',{over:{x:1050,y:1000,_weakPj:0.3,_weakPhys:0.3,_shockDR:0.3,_blinkWeak:0.3,_blinkWeakT:5},args:args({opts:{pure:true,maxDist:5},dmg:101})});
mk('shockDR',{over:{x:1050,y:1000,_shockDR:0.25},args:args({dmg:101})});mk('blinkWeak with timer',{over:{x:1050,y:1000,_blinkWeak:0.4,_blinkWeakT:5},args:args({dmg:101})});mk('blinkWeak without timer',{over:{x:1050,y:1000,_blinkWeak:0.4,_blinkWeakT:0}});
// --- combo boost ---
mk('comboBoost affix first hit',{aff:{comboBoost:1},args:args({dmg:101})});mk('comboBoost passive',{world:W({PASSIVES:{pCombo:3}}),over:{x:1050,y:1000,_comboStk:4,_comboHitT:50,_comboDecayT:20},args:args({dmg:101})});
mk('comboBoost cap by passive',{world:W({PASSIVES:{pCombo:1}}),over:{x:1050,y:1000,_comboStk:5},args:args({dmg:101})});mk('comboBoost affix+passive cap',{aff:{comboBoost:1},world:W({PASSIVES:{pCombo:2}}),over:{x:1050,y:1000,_comboStk:19},args:args({dmg:101})});
mk('comboBoost dot no stack',{aff:{comboBoost:1},over:{x:1050,y:1000,_comboStk:3},args:args({opts:{dot:true},dmg:101})});
for(const bm of [undefined,0,1,2,3])mk('comboBoost beam counter '+bm,{aff:{comboBoost:1},over:{x:1050,y:1000,_comboBmT:bm,_comboStk:2},args:args({opts:{beam:true},dmg:101})});
// --- rage skill ---
mk('rageSkill dmg',{world:WP({_rageSkCtx:true}),aff:{rageSkDmg:0.3},args:args({dmg:101})});mk('rageSkill ctx false',{world:WP({_rageSkCtx:false}),aff:{rageSkDmg:0.3}});mk('rageSkill crit bonus',{world:WP({_rageSkCtx:true}),aff:{rageSkCrit:0.5},vals:V({statCrit:10}),first:[0.55]});
// --- crit ---
for(const [r,sc,t] of [[0.0999999,10,'just under 10%'],[0.1,10,'exactly 10%'],[0.1000001,10,'just over']])mk('crit roll '+t,{vals:V({statCrit:sc,statCritDmg:1.73}),first:[r],args:args({dmg:101})});
mk('crit sub-types melee',{aff:{critRateMelee:0.5},vals:V({statCrit:0}),first:[0.4],args:args({dmg:101})});mk('crit sub-types spell',{aff:{critRateSpell:0.5},args:args({atkEl:1,dmg:101}),first:[0.4]});mk('crit sub-types spell beam',{aff:{critRateSpell:0.5},args:args({opts:{beam:true},dmg:101}),first:[0.4]});mk('crit sub-types bow',{aff:{critRateBow:0.5},args:args({opts:{maxDist:9},dmg:101}),first:[0.4]});
mk('crit stats counter undefined',{world:W({sStats:null}),vals:V({statCrit:100}),first:[0.1]});mk('crit stats counter',{world:W({sStats:{crits:7}}),vals:V({statCrit:100}),first:[0.1]});
mk('dagger forced crit',{world:WP({_lNextCrit:1}),leq:{_lDaggerKill:1},vals:V({statCrit:0}),first:[0.99],args:args({dmg:101})});mk('dagger forced crit on dot not',{world:WP({_lNextCrit:1}),leq:{_lDaggerKill:1},first:[0.99],args:args({opts:{dot:true}})});mk('dagger without leq',{world:WP({_lNextCrit:1}),leq:{},first:[0.99]});
mk('kiSlash full crit',{aff:{kiSlashFullCrit:0.5},args:args({opts:{_kiFull:true},dmg:101}),vals:V({statCritDmg:1.5}),first:[0.99]});mk('kiSlash full crit cap 1',{aff:{kiSlashFullCrit:3},args:args({opts:{_kiFull:true},dmg:101}),first:[0.99]});mk('kiSlash full crit dot excluded',{aff:{kiSlashFullCrit:0.5},args:args({opts:{_kiFull:true,dot:true},dmg:101}),first:[0.99]});
mk('axe bleed explosion',{leq:{_lAxeBleed:3},over:{x:1050,y:1000,bleedT:10,bleedPool:50,bleed:1},vals:V({statCrit:100}),first:[0.1],args:args({dmg:101})});mk('axe bleed no pool',{leq:{_lAxeBleed:3},over:{x:1050,y:1000,bleedT:10,bleedPool:0,bleed:1},vals:V({statCrit:100}),first:[0.1]});mk('axe bleed small pool min 1',{leq:{_lAxeBleed:0.01},over:{x:1050,y:1000,bleedT:10,bleedPool:5,bleed:0},vals:V({statCrit:100}),first:[0.1]});
mk('onCritExplode',{aff:{onCritExplode:0.5},others:[other('etype0',{x:1100,y:1000}),other('etype0',{x:1129,y:1000}),other('etype0',{x:1131,y:1000}),other('etype0',{x:1100,y:1000,alive:false})],vals:V({statCrit:100}),first:[0.1],args:args({dmg:101})});
mk('onCritChain nearest',{aff:{onCritChain:0.5},others:[other('etype0',{x:1200,y:1000}),other('etype0',{x:1150,y:1000}),other('etype0',{x:1400,y:1000})],vals:V({statCrit:100}),first:[0.1],args:args({dmg:101})});mk('onCritChain none within 250',{aff:{onCritChain:0.5},others:[other('etype0',{x:1500,y:1000})],vals:V({statCrit:100}),first:[0.1]});
mk('onCritFreeze reaches 100',{aff:{onCritFreeze:0.6},over:{x:1050,y:1000,_freezeGauge:50},vals:V({statCrit:100}),first:[0.1]});mk('onCritFreeze immune',{aff:{onCritFreeze:0.6},over:{x:1050,y:1000,_freezeGauge:50,_freezeImmune:true},vals:V({statCrit:100}),first:[0.1]});mk('onCritFreeze below 100',{aff:{onCritFreeze:0.2},over:{x:1050,y:1000},vals:V({statCrit:100}),first:[0.1]});
mk('onCritHeal/Mana cap',{aff:{onCritHeal:50,onCritMana:60},world:WP({hp:990,mp:60,mmp:100}),vals:V({statCrit:100}),first:[0.1]});mk('onCritHeal/Mana below cap',{aff:{onCritHeal:5,onCritMana:6},world:WP({hp:500,mp:10}),vals:V({statCrit:100}),first:[0.1]});
mk('onCritShield no max',{aff:{onCritShield:30},world:WP({eShieldMax:0,eShield:0}),vals:V({statCrit:100}),first:[0.1]});mk('onCritShield with max',{aff:{onCritShield:30},world:WP({eShieldMax:100,eShield:80}),vals:V({statCrit:100}),first:[0.1]});
// --- ring reaction ---
for(const [pt,lr,t] of [[1200,1000,'1 cd 200 ok'],[1119,1000,'cd 119 not ready'],[1120,1000,'cd 120 ready'],[1000,undefined,'never fired'],[1000,0,'lReactF 0 falsy']])mk('ring explode '+t,{over:{x:1050,y:1000,el:2,_lReactF:lr},leq:{_lRingElem:2},world:W({equipped:{},playTime:pt}),args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1100,y:1000}),other('etype0',{x:1300,y:1000})],vals:V({meleeRef:55.5,statStr:1.2,pAtkMul:1.1})});
mk('ring explode weak element only',{over:{x:1050,y:1000,el:2},leq:{_lRingElem:2},args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring explode atkEl 5 colour table',{over:{x:1050,y:1000,el:3},leq:{_lRingElem:2},args:args({atkEl:5,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring explode atkEl 6 particle colour fallback',{over:{x:1050,y:1000,el:4},leq:{_lRingElem:2},args:args({atkEl:6,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring explode dot excluded',{over:{x:1050,y:1000,el:2},leq:{_lRingElem:2},args:args({atkEl:1,opts:{dot:true},dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
// --- stun / freeze x1.5, blue bean ---
mk('stunned x1.5',{over:{x:1050,y:1000,stunned:10},args:args({dmg:101})});mk('frozen x1.5',{over:{x:1050,y:1000,_frozen:10},args:args({dmg:101})});mk('stunned+frozen',{over:{x:1050,y:1000,stunned:10,_frozen:10},args:args({dmg:101})});mk('stunned dot no x1.5',{over:{x:1050,y:1000,stunned:10,_frozen:10},args:args({dmg:101,opts:{dot:true}})});
// --- energy shield ---
for(const [esm,es,dmg,opts,t] of [[0,0,100,null,'max 0'],[100,0,100,null,'shield 0'],[100,500,100,null,'shield > dmg'],[100,100,100,null,'shield = dmg'],[100,40,100,null,'shield < dmg overflow'],[100,40,100,{dot:true},'dot without shieldHit'],[100,40,100,{dot:true,shieldHit:true},'dot with shieldHit (partial)'],[100,500,100,{dot:true,shieldHit:true},'dot shieldHit absorbs all'],[100,99.5,100,null,'fractional shield'],[0,50,100,null,'max 0 but shield positive'],[100,0.5,100,null,'tiny shield']])
  mk('eshield '+t,{over:{x:1050,y:1000,eShieldMax:esm,eShield:es},args:args({dmg,opts})});
mk('eshield absorbs min 1 case',{over:{x:1050,y:1000,eShieldMax:100,eShield:500},args:args({dmg:0.4})});
mk('eshield absorb pure still absorbs (pure only skips multipliers)',{over:{x:1050,y:1000,eShieldMax:100,eShield:30},args:args({dmg:100,opts:{pure:true}})});
mk('eshield sequence after multipliers',{over:{x:1050,y:1000,eShieldMax:1000,eShield:150,stunned:10},args:args({dmg:100})});
// --- integer conversion ---
for(const d of [100.9,100.1,1.999999,7.5,2147483647,2147483647.5,2147483648,4294967296.7,3e9,-3e9,1e12])mk('int conversion dmg '+d,{args:args({dmg:d,opts:{}}),world:W({PASSIVES:{}}),aff:{meleeDmgPct:0.5}});
mk('int conversion overflow with shield',{over:{x:1050,y:1000,eShieldMax:100,eShield:50},args:args({dmg:3e9}),aff:{meleeDmgPct:0.5}});
mk('default atkEl omitted',{args:{dmg:100,ang:0.5,noSound:false,opts:null,atkEl:null}});
// --- seeded fuzz ---
const fz=mulberry32(2026);const pick=a=>a[Math.floor(fz()*a.length)];const rn=(a,b)=>a+fz()*(b-a);
const AFFK=['antiRevive','elemConvert','elemFocus','poisonDmgPct','poisonDmgBns','crisisBoost','abundDmg','healthyAtk','fullLifeDmg','lowLifeDmg','injuredDmg','predDmg','overkilDmg','firstStrike','closeDmg','farDmg','stunDmgUp','frozenDmgUp','burnDmgUp','poisonDmgUp','curseDmgUp','slowDmgUp','bossSlayer','vsBossDmg','eliteSlayer','vsEliteDmg','mobSlayer','meleeDmgPct','rangedDmgPct','projDmgPct','spellDmgPct','beamDmgPct','dotDmgPct','comboBoost','rageSkDmg','rageSkCrit','critRateMelee','critRateSpell','critRateBow','kiSlashFullCrit','onCritExplode','onCritChain','onCritFreeze','onCritHeal','onCritMana','onCritShield','fireDmgPct','iceDmgPct','darkDmgPct','lightDmgPct','fireDmgBns','iceDmgBns','darkDmgBns','lightDmgBns'];
const LEQK=['_lBeltBuff','_lBootsEvade','_lSpearStack','_lDaggerKill','_lAxeBleed','_lRingElem'];
const OPTK=[['dot',true],['shieldHit',true],['bleed',true],['poison',true],['parryBlueBean',true],['noStun',true],['pure',true],['maxDist',250],['magic',true],['explode',true],['beam',true],['proj',true],['_kiFull',true],['kbMult',0.5],['poiseMult',2]];
for(let i=0;i<650;i++){
  const base=pick(bases).name;const over={x:1000+rn(-300,300),y:1000+rn(-300,300),hp:pick([1000,700,300,200,50,-1]),mhp:1000,stunned:pick([0,0,5]),eShieldMax:pick([0,0,200]),eShield:pick([0,30,150,500]),_frozen:pick([undefined,0,5]),_shockStk:pick([undefined,0,2,9,10]),_cursed:pick([undefined,0,3]),mods:pick([undefined,[],['M14'],['M05'],['M22']]),el:pick([0,1,2,3,4,5,6])};
  for(const k of ['_weakPhys','_weakMag','_weakPj','_shockDR','_blinkWeak','_blinkWeakT','_comboStk','_comboHitT','_comboBmT','_aDefM','_lReactF','reviveIframes','_mrAbsorb','bleedStk','poisonStk','_burning','_slowed','_webSlow'])if(fz()<0.12)over[k]=pick([0,0.2,0.5,1,5,95]);
  if(fz()<0.1)over.reviveIframes=pick([0,1,2,95]);
  if(fz()<0.15)over._crabGuard=fz()<0.5;if(fz()<0.15)over._obsGuarding=fz()<0.5;
  const opts=fz()<0.25?null:Object.fromEntries(OPTK.filter(()=>fz()<0.2));
  const aff={};for(const k of AFFK)if(fz()<0.2)aff[k]=pick([0,0.05,0.25,0.5,1,2,50]);
  const leq={};for(const k of LEQK)if(fz()<0.3)leq[k]=pick([0,0.3,1,2]);
  const ueq=fz()<0.2?{_uClubStun:pick([1,2,3])}:{};
  const w=W({P:{x:1000,y:1000,hp:pick([1,299,300,350,700,1000]),mhp:1000,mp:pick([0,50]),mmp:100,iframes:0,eShield:pick([0,10]),eShieldMax:pick([0,100]),_greedCurse:pick([undefined,5]),_killBuff:pick([undefined,0,20]),_killMul:pick([undefined,0.3]),_lBeltT:pick([undefined,0,30]),_lBootsT:pick([undefined,0,30]),_lNextCrit:pick([undefined,0,1]),_lSpearStk:pick([undefined,0,3]),_lSpearT:pick([undefined,0,30]),_rageSkCtx:pick([undefined,true,false])},
    sStats:fz()<0.7?{crits:0}:null,playTime:pick([0,1000,5000]),PASSIVES:{pAbund:pick([undefined,0,2]),pBow:pick([undefined,0,3]),pCombo:pick([undefined,0,2])},
    equipped:{armor:fz()<0.7?{el:pick([0,1,2,3,4,5,6])}:undefined,weapon:fz()<0.7?{el:pick([0,1,2,3,4])}:undefined,necklace:fz()<0.5?{dmgBonus:pick([0,3,7])}:undefined,ring1:fz()<0.4?{dmgBonus:pick([0,2])}:undefined,belt:fz()<0.3?{dmgBonus:4}:undefined},
    hitSfxCd:pick([0,0,5]),shBufI:pick([0,2]),btLog:fz()<0.3?[]:null,lesson:fz()<0.04});
  const vals={statStr:pick([1,1,1.2]),statCrit:pick([0,5,50,100]),statCritDmg:pick([1.5,2.2]),pAtkMul:pick([1,1.3]),meleeRef:pick([10,100.5]),pDotPool:pick([1,1.4]),predBonus:pick([0,0.1,0.3]),hunterMul:pick([1,1,1.5])};
  const others=Array.from({length:Math.floor(fz()*4)},()=>other(pick(bases).name,{x:1000+rn(-250,250),y:1000+rn(-250,250),mods:pick([undefined,['M22'],['M05']]),alive:fz()<0.9}));
  mk('fuzz hurt #'+i,{base,over,aff,leq,ueq,world:w,vals,others,seed:800000+i,first:[pick([0.01,0.2,0.5,0.9,0.999]),pick([0.01,0.5,0.99])],args:{dmg:pick([0,0.7,1,5,99.9,100,1234.56,50000,3e9]),ang:pick([undefined,0,1.2,-2.5,7]),noSound:fz()<0.3,opts,atkEl:pick([0,0,0,1,2,3,4,5,6,7])}});
}

// --- targeted boundary cases added after the first mutation pass (each kills a mutant the grid let survive) ---
mk('aura _aDefM exactly 1 with fractional dmg (skip ~~)',{over:{x:1050,y:1000,_aDefM:1},args:args({dmg:100.9})});
mk('full life: player hp above max',{world:WP({hp:1001,mhp:1000}),aff:{fullLifeDmg:0.2},args:args({dmg:101})});
mk('overkill window: enemy hp 205 of 1000',{over:{x:1050,y:1000,hp:205,mhp:1000},aff:{overkilDmg:0.2},args:args({dmg:101})});
mk('slow state: only _freezeSlow',{over:{x:1050,y:1000,_freezeSlow:3},aff:{slowDmgUp:0.3},args:args({dmg:101})});
mk('onCritChain target at 250.5 (out of range)',{aff:{onCritChain:0.5},others:[other('etype0',{x:1300.5,y:1000})],vals:V({statCrit:100}),first:[0.1],args:args({dmg:101})});
mk('onCritChain target at 249.5 (in range)',{aff:{onCritChain:0.5},others:[other('etype0',{x:1299.5,y:1000})],vals:V({statCrit:100}),first:[0.1],args:args({dmg:101})});
for(const [pt,lr,t] of [[1120,1000,'cooldown exactly 120'],[1119.5,1000,'cooldown 119.5'],[-9879,undefined,'never fired, playTime -9879 (sentinel edge)'],[-9880,undefined,'never fired, playTime -9880']])mk('ring weak element '+t,{over:{x:1050,y:1000,el:2,_lReactF:lr},leq:{_lRingElem:2},world:W({playTime:pt}),args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring damage floor: meleeRef tiny',{over:{x:1050,y:1000,el:2},leq:{_lRingElem:2},args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1100,y:1000})],vals:V({meleeRef:0.2})});
mk('ring explode atkEl 6 weak vs light',{over:{x:1050,y:1000,el:4},leq:{_lRingElem:2},args:args({atkEl:6,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring explode atkEl 5 weak vs dark',{over:{x:1050,y:1000,el:3},leq:{_lRingElem:2},args:args({atkEl:5,dmg:101}),others:[other('etype0',{x:1100,y:1000})]});
mk('ring radius edge: other at 100.5',{over:{x:1050,y:1000,el:2},leq:{_lRingElem:2},args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1150.5,y:1000})]});
mk('ring radius edge: other at 99.5',{over:{x:1050,y:1000,el:2},leq:{_lRingElem:2},args:args({atkEl:1,dmg:101}),others:[other('etype0',{x:1149.5,y:1000})]});
// keys given as undefined in an override mean 'delete the key' (JS undefined); JSON drops them, so record them explicitly as 'del'
for(const c of cases){c.del=Object.keys(c.over||{}).filter(k=>c.over[k]===undefined);for(const o of c.others)o.del=Object.keys(o.over||{}).filter(k=>o.over[k]===undefined);}
// ---- run ----
const bad=[];function safe(v,p){if(typeof v==='number'&&(!isFinite(v)||Object.is(v,-0)))bad.push(p+'='+(Object.is(v,-0)?'-0':v));else if(v&&typeof v==='object')for(const k of Object.keys(v))safe(v[k],p+'.'+k);}
function setup(c){
  const w=c.world;ctx.__w=w;ctx.__vals=c.vals;ctx.__aff=c.aff;ctx.__leq=c.leq;ctx.__ueq=c.ueq;
  vm.runInContext('P=JSON.parse(JSON.stringify(__w.P));PASSIVES=JSON.parse(JSON.stringify(__w.PASSIVES));INV={equipped:JSON.parse(JSON.stringify(__w.equipped))};_shBufI=__w.shBufI;_hitSfxCd=__w.hitSfxCd;_now=__w.now;__log=[];__i=0;'+
   'G={stage:0,playTime:__w.playTime};if(__w.sStats)G._sStats=JSON.parse(JSON.stringify(__w.sStats));window._btDmgLog=__w.btLog?JSON.parse(JSON.stringify(__w.btLog)):undefined;'+
   'window._parryLesson=__w.lesson?{active:true,hurtEnemy:function(e,d,a,o){__rec("parryLessonHurt",e,d,a,o);}}:undefined;',ctx);
  ctx.__seq=seqFor(c.seed,c.first);
  const mkObj=s=>{const o=JSON.parse(JSON.stringify(bases[BI[s.base]].obj));for(const [k,v] of Object.entries(s.over||{}))if(v!==undefined)o[k]=JSON.parse(JSON.stringify(v));else delete o[k];return o;};
  ctx.__ens=[mkObj({base:c.base,over:c.over}),...c.others.map(mkObj)];vm.runInContext('ens=__ens;',ctx);
}
function snapshot(){return plain(vm.runInContext('({ens:ens,P:P,G:{sStats:G._sStats,playTime:G.playTime},shBufI:_shBufI,hitSfxCd:_hitSfxCd,btLog:window._btDmgLog,log:__log,consumed:__i})',ctx));}
for(const c of cases){
  setup(c);const initial=plain(vm.runInContext('ens',ctx)),initP=plain(vm.runInContext('P',ctx));
  ctx.__args=c.args;
  const retRaw=vm.runInContext('(function(){const a=__args;const r=a.atkEl===null?__H1(ens[0],a.dmg,a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts):__H1(ens[0],a.dmg,a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts,a.atkEl);return r===undefined?null:r;})()',ctx);
  const snap=snapshot();const ret=retRaw===null?null:plain(retRaw);
  const diffs=snap.ens.map((fin,i)=>{const ini=initial[i],d={};for(const k of new Set([...Object.keys(fin),...Object.keys(ini)])){if(JSON.stringify(fin[k])!==JSON.stringify(ini[k])){if(!(k in fin))throw Error('field deleted: '+k);d[k]=fin[k];}}return d;});
  const pdiff={};for(const k of new Set([...Object.keys(snap.P),...Object.keys(initP)]))if(JSON.stringify(snap.P[k])!==JSON.stringify(initP[k])){if(!(k in snap.P))throw Error('P field deleted');pdiff[k]=snap.P[k];}
  safe(ret,'ret');safe(diffs,'diff');safe(pdiff,'P');safe(snap.log,'log');safe(snap.G,'G');safe(snap.btLog,'btLog');if(bad.length)throw Error('case '+c.name+': non-JSON-safe numbers '+bad.splice(0).join(','));
  c.expected={ret,diffs,pdiff,G:snap.G,shBufI:snap.shBufI,hitSfxCd:snap.hitSfxCd,btLog:snap.btLog===undefined?null:snap.btLog,log:snap.log,consumed:snap.consumed};
  c.seq=ctx.__seq.slice(0,snap.consumed+4);delete c.seed;delete c.first;
}
const sum={cases:cases.length,earlyReturns:cases.filter(c=>c.expected.ret===null).length,fallThrough:cases.filter(c=>c.expected.ret!==null).length,crits:cases.filter(c=>c.expected.ret&&c.expected.ret._isCrit).length,
  shielded:cases.filter(c=>c.expected.ret&&c.expected.ret._shBlocked).length,logEntries:cases.reduce((s,c)=>s+c.expected.log.length,0),randomDraws:cases.reduce((s,c)=>s+c.expected.consumed,0),enemies:cases.reduce((s,c)=>s+1+c.others.length,0)};
const callNames={};for(const c of cases)for(const l of c.expected.log)callNames[l[0]]=(callNames[l[0]]||0)+1;sum.injectedCalls=callNames;
const out={schema:'exoduser.unity.enemy-hurt-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,head:headSha,anchors,wrapper:{header:'function __H1(e,dmg,ang,noSound,opts,atkEl=0){',footer:'return {'+returned.join(',')+'};}finally{_shBufI--}}',locals:returned},
  note:'blocks located by text anchors and executed unchanged in one Node VM; external pieces = recording stubs with case-defined values, P/G/PASSIVES/INV values, Math.random sequence'},
  tables,bases,summary:sum,cases};
fs.writeFileSync(outPath,JSON.stringify(out));
console.log(JSON.stringify({sha:fileSha,summary:sum,locals:returned,anchors:anchors.slice(-14).map(a=>a.name+':'+a.start+'-'+a.end)}));
