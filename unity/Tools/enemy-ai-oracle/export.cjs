// CX-03a enemy tick oracle exporter: runs the ORIGINAL enemy-loop head (L1) and updateE head (U1) from game.html in a Node VM and writes oracle.json.
//   node export.cjs [--source <game.html>] [--head <commit sha of the source>] [--expect-source-sha <sha256>] [--out oracle.json]
// Blocks are located by text anchors (the first line must start with the expected text and match exactly one line) and executed UNCHANGED.
// Wrappers (the only text added around original lines):
//   U1:  "function __U1(e,sp){" + original lines of updateE up to the line before the "D4식 DOT" comment + "}"
//        __U1T is __U1 plus ONE appended statement "return {tail:true,d:d};" used only to learn whether the function fell through to the DOT part and the
//        value of its local d; every U1 case also runs the exact __U1 wrapper and the exporter aborts if the state/log/random use differ.
//   L1:  "function __L1(sp){" + original lines from "if(G._bonfire&&G._bonfire.t>0)…" through the closing brace of the per-enemy "if(e.alive){…}" block
//        + "}" (closes the for) + "}" (closes the function).
// Everything the original calls but CX-03a does not port is a recording stub with a deterministic rule (see README).
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source','G:/exoduser/game.html'),outPath=arg('--out',path.join(__dirname,'oracle.json')),headSha=arg('--head','');
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
// ---- tables / helpers mkEn needs (same blocks as CX-02), used here only to create realistic enemy objects ----
add(stmt('EL','const EL={'));add(stmt('CHAPTER_STAGES','const CHAPTER_STAGES=['));add(stmt('TOTAL_STAGES','const TOTAL_STAGES='));
add(stmt('HELL_NAMES','const HELL_NAMES=['));add(stmt('HELL_THEMES','const HELL_THEMES=['));add(stmt('HELL_BOSSES','const HELL_BOSSES=['));
add(untilBrace('SI_TO_HELL+SI_TO_FLOOR loop','const SI_TO_HELL=new Uint8Array'));add(untilBrace('STG loop','const STG=[];'));
for(const n of ['ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_R','ETYPE_RANGE','ETYPE_POISE','ETYPE_SHIELD','ETYPE_COL','ETYPE_COLS','ETYPE_ERES','RARE_ETYPE','ELITE_TIERS','ELITE_PROB','MOD_DEFS'])add(stmt(n,'const '+n+'='));
add(single('DIFF_MUL','const DIFF_MUL='));add(single('DIFF_LV_OFF','const DIFF_LV_OFF='));
add(stmt('ETYPE_SPD','const ETYPE_SPD='));add(stmt('isRareEtype','function isRareEtype('));
add(single('ELC','const ELC='));add(single('T','const T=40;'));add(single('_MOB8','const _MOB8_TOTAL='));add(stmt('BOSS_MOVES','const BOSS_MOVES=['));
add(stmt('_CH1_OPENING_EXCLUDED_ET','const _CH1_OPENING_EXCLUDED_ET='));add(stmt('AURA_DEFS','const AURA_DEFS=['));
add(stmt('rollElite','function rollElite('));add(stmt('rollMods','function rollMods('));add(stmt('rollAura','function rollAura('));
add(single('_enemyHpPacing','function _enemyHpPacing('));add(stmt('_assignBossSkin','function _assignBossSkin('));add(stmt('_assignMobSkin','function _assignMobSkin('));
add(stmt('safePt','function safePt('));
// ---- functions the CX-03a code calls and that ARE ported (executed as written) ----
add(stmt('_isDruidFinale','function _isDruidFinale('));add(stmt('_druidFinaleHp','function _druidFinaleHp('));
add(single('_isNormalDruidBoss','function _isNormalDruidBoss('));add(stmt('_poiseReset','function _poiseReset('));
add(single('_spikeTrapSlowPct','function _spikeTrapSlowPct('));add(single('dst','function dst('));add(single('dst2','function dst2('));
add(stmt('_ETYPE_SFX','const _ETYPE_SFX={'));add(stmt('_ARCH_SFX','const _ARCH_SFX={'));
add(stmt('mkEn','function mkEn('));
// ===== C01-AI: enemy AI scenario trace oracle. The ORIGINAL updateE (whole function, unchanged) runs tick by tick in a Node VM against recording stubs. =====
add(stmt('_beanRoll','function _beanRoll('));add(single('_eMouthXY','function _eMouthXY('));
add(stmt('_tickProjCharge','function _tickProjCharge('));add(stmt('_fireChargedProj','function _fireChargedProj('));add(single('eProjAt','function eProjAt('));
add(stmt('atkTicketRequest','function atkTicketRequest('));add(stmt('atkTicketRelease','function atkTicketRelease('));add(single('_chgPathClear','function _chgPathClear('));
add(single('elMul','function elMul('));add(single('_tickEliteAttackLock','function _tickEliteAttackLock('));add(single('_claimEliteAttack','function _claimEliteAttack('));add(stmt('eModHitP','function eModHitP('));
const updateE=untilBrace('updateE (whole function)','function updateE(e,sp){');
const ctx=vm.createContext({});
const PRELUDE=fs.readFileSync(path.join(__dirname,'prelude.js'),'utf8');
vm.runInContext(PRELUDE,ctx);
for(const b of blocks)vm.runInContext(b,ctx);
vm.runInContext(updateE,ctx);
vm.runInContext("var __mkOrig=mkEn;mkEn=function(x,y,si,etype,ib,el,room){const o=__mkOrig(x,y,si,etype,ib,el,room);__log.push(['mk',x,y,si,etype,el===undefined?null:el,o?o.hp:null,o?o.atk:null]);return o;};",ctx);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seqFor=(seed,n)=>{const r=mulberry32(seed),a=[];while(a.length<n)a.push(r());return a;};
const SNAP=['x','y','hp','mhp','atk','baseAtk','speed','s','st2','facing','projT','projCd','_projChargeT','_projChargeBean','stunned','poise','alive','_alerted','reviveIframes','_hitStun','_telegraphT','_moveAng','_sepCd','echDx','echDy','_chgVisLen','_enraged','_cloaked','webT','swoopT','trapT','motherT','wombT','slamT','stealthT','reviveT','teleportT','summonT','shieldBashT','shieldAng','_tpWarnT','_tpWarnX','_tpWarnY','_stCloneT','_stTpCd','_iceChargeT','_iceSlimeT','_iceBlizzT','_iceSwoopT','_iceSlamT','_escorting','_swoopOx','_iceSwoopOx','eShield','bleed','bleedT','bleedStk','_bleedPool','poison','poisonT','poisonStk','_poisonPool','burnT','burnStk','_burnPool','_hrMark','_hrMarkT','_bbStk','_bbStkT','_iceDotT','_iceDotDmg','_iceSlowed','_mhDot','_mhDotDmg','spd','baseSpd','_eliteBoltWarn','_eliteBoltAim','modT.eliteBolt','modT.eliteMortar','modT.eliteBusy','modT.eliteCharge','modT.eliteRing','modT.regen'];
ctx.__SNAP=SNAP;
const RUN=`(function(){
 const c=__setup;P.x=1000;P.y=1000;P.r=10;P.facing=c.pfacing;P.iframes=c.piframes;P.s=c.ps;P.kb={x:0,y:0};P._freezeSlow=0;P.__pwin=!!c.pwin;P.__armEl=c.armEl===undefined?0:c.armEl;
 G.stage=c.si;ens=[];_deadPool=[];__log=[];
 const e=mkEn(1000,1000,c.si,c.etype,false,1,2);
 e.x=1000+Math.cos(c.ang)*c.dist;e.y=1000+Math.sin(c.ang)*c.dist;Object.assign(e,c.over);e._aAtkM=1;e._aSpdM=1;ens.push(e);
 for(const a of c.allies){const o=mkEn(1000,1000,c.si,a.etype,false,1,2);Object.assign(o,a.over);o._aAtkM=1;o._aSpdM=1;ens.push(o);}
 for(const a of c.corpses){const o=mkEn(1000,1000,c.si,a.etype,false,1,2);Object.assign(o,a.over,{alive:false,hp:0});_deadPool.push(o);ens.push(o);}
 const init=__SNAP.map(k=>e[k]===undefined?null:e[k]);const n0=__log.length;const mkLog=__log.slice();
 const snaps=[],logs=[],tr=[];
 for(let t=0;t<c.ticks;t++){_gameFrame++;__log=[];for(const q of ens){if(q.alive){q._aAtkM=1;q._aSpdM=1;}}
  const cnt=ens.length;for(let i=0;i<cnt;i++){if(ens[i].alive)updateE(ens[i],c.sp);}
  logs.push(__log.map(l=>l.slice()));tr.push([e.x,e.y,e.facing,e.s]);
  if(t%5===4||t===c.ticks-1){const q={};for(const k of __SNAP)if(k.indexOf('.')<0)q[k]=e[k]===undefined?null:e[k];q['kb.x']=e.kb.x;q['kb.y']=e.kb.y;q['modT.eliteBolt']=e.modT.eliteBolt;q['modT.eliteMortar']=e.modT.eliteMortar;q['modT.eliteBusy']=e.modT.eliteBusy;q['modT.eliteCharge']=e.modT.eliteCharge;q['modT.eliteRing']=e.modT.eliteRing;q['modT.regen']=e.modT.regen;q.n=ens.length;q.t=t;snaps.push(q);}}
 return {snaps:snaps,logs:logs,tr:tr,P:{kbx:P.kb.x,kby:P.kb.y,fz:P._freezeSlow,s:P.s,st2:P.st2===undefined?null:P.st2},rand:__i,ensN:ens.length};})()`;
const pf=a=>a;
function runCase(c){
  ctx.__seq=[0.9999,...seqFor(c.seed,1500)];ctx.__i=0;ctx.__ci=0;ctx.__clock=Array.from({length:6000},()=>0);ctx.__setup=c;
  vm.runInContext('_gameFrame=0;_mSfxPlaying=0;G={stage:'+c.si+',_stageDiffOff:0,rifts:[],atkTickets:0,maxAtkTickets:3,kills:0};',ctx);
  const out=vm.runInContext(RUN,ctx);return JSON.parse(JSON.stringify(out));
}
// ---- scenarios ----
const SCOPE=[0,1,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,47];
const TIMERS=['webT','swoopT','trapT','motherT','wombT','slamT','stealthT','reviveT','teleportT','summonT','shieldBashT','_iceChargeT','_iceSlimeT','_iceBlizzT','_iceSwoopT','_iceSlamT','_stCloneT','_stTpCd','projT'];
const fz=mulberry32(4242);const pick=a=>a[Math.floor(fz()*a.length)];const rn=(a,b)=>a+fz()*(b-a);
let seed=1000;
function mk(name,etype,o){cases.push({name,etype,si:0,seed:seed++,ang:0,dist:300,sp:1,ticks:90,pfacing:0,piframes:0,ps:'idle',pwin:false,over:{_alerted:true},allies:[],corpses:[],...o});}
const cases=[];
for(const et of SCOPE){
  mk('approach far '+et,et,{dist:700,ang:1.1});
  mk('approach mid '+et,et,{dist:350,ang:3.5});
  mk('near '+et,et,{dist:60,ang:0.4});
  mk('contact '+et,et,{dist:22,ang:2.2,over:{_alerted:true,st2:0}});
  mk('unalerted far '+et,et,{dist:900,ang:5,over:{}});
  mk('unalerted near '+et,et,{dist:380,ang:5,over:{}});
  mk('player iframes '+et,et,{dist:40,ang:0.2,piframes:50});
  mk('sp2 '+et,et,{dist:260,ang:1,sp:2,ticks:70});
  for(let k=0;k<4;k++){const over={_alerted:true};for(const t of TIMERS)if(fz()<.7)over[t]=Math.floor(rn(0,25));over.st2=pick([0,5,20]);
    mk('primed '+k+' '+et,et,{dist:pick([30,70,110,180,260,420,700]),ang:rn(0,6.28),over,sp:pick([1,1,2]),pfacing:rn(-3,3),ticks:120});}
}
// states that start mid-flight
for(const [st,et] of [['eChargeWind',22],['eCharge',22],['eSwoop',14],['eSwoop',27],['eSlamWind',19],['eSlamWind',28],['eShieldBash',6],['eSummon',7],['eSummon',11],['windup',5],['windup',10],['attack',0],['recover',0],['eShootWind',1]]){
  for(const dist of [20,120]) for(const pw of [false,true]) mk('state '+st+' '+et+' d'+dist+(pw?' parry':''),et,{dist,ang:0.7,pwin:pw,over:{_alerted:true,s:st,st2:pick([1,8,25,60]),echDx:1,echDy:0,_chgSpd:32,_chgDur:18,_chgAimMax:60,_chgLen:640}});
}
// allies / corpses / elite mods
mk('escort 6 with archer',6,{dist:300,allies:[{etype:1,over:{x:1200,y:1000,_alerted:true}}],ticks:60});
mk('escort 6 shield down',6,{dist:100,over:{_alerted:true,eShield:0,shieldBashT:0},ticks:60});
mk('shaman revive corpse',9,{dist:400,over:{_alerted:true,reviveT:0},corpses:[{etype:0,over:{x:1330,y:1000}}],ticks:30});
mk('lich summon alone',7,{dist:500,over:{_alerted:true,summonT:0,teleportT:900},ticks:80});
mk('lich teleport close',7,{dist:80,over:{_alerted:true,teleportT:0,summonT:900},ticks:200});
mk('womb summon crowd',11,{dist:300,over:{_alerted:true,wombT:0},allies:[{etype:3,over:{x:1330,y:1010}},{etype:3,over:{x:1340,y:1000}}],ticks:80});
mk('mother spawns',17,{dist:300,over:{_alerted:true,motherT:0},ticks:80});
mk('shadow twin clone+tp',47,{dist:500,over:{_alerted:true,_stCloneT:0,_stTpCd:0},ticks:260});
mk('enraged 12',12,{dist:100,over:{_alerted:true,hp:1},ticks:40});
mk('separation crowd',0,{dist:200,over:{_alerted:true},allies:[{etype:0,over:{x:1205,y:1002}},{etype:0,over:{x:1198,y:998}},{etype:0,over:{x:1202,y:1006}}],ticks:50});
for(const m of ['M04','M29','M30','M31','M32']){
  for(const et of [0,4]) mk('elite '+m+' '+et,et,{dist:m==='M29'?300:200,over:{_alerted:true,mods:[m],elite:1},ticks:700});
}
for(const combo of [['M31','M32'],['M30','M31'],['M29','M32'],['M04','M31','M32'],['M30','M32','M31']]){
  for(const et of [0,4,1,8]) mk('elite combo '+combo.join('+')+' '+et,et,{dist:pick([150,260,420]),ang:rn(0,6.28),over:{_alerted:true,mods:combo,elite:3},ticks:900,pfacing:rn(-3,3)});
}
for(const m of ['M31','M32']) for(const [dist,piframes,ps] of [[1000,0,'idle'],[840,0,'idle'],[300,100,'idle'],[300,0,'charge'],[60,0,'idle'],[1090,0,'idle'],[1110,0,'idle']]) mk('elite '+m+' edge d'+dist+' pi'+piframes+' '+ps,4,{dist,piframes,ps,over:{_alerted:true,mods:[m],elite:2},ticks:760});
// ---- C01-FX: D4 DOT block (bleed / poison / burn pools, ice DOT, malice-hunt DOT, mark timers) ----
for(const et of [0,3,4,13,16,25]){
  for(let k=0;k<3;k++){
    const over={_alerted:true};
    if(k===0){over.bleedT=300;over._bleedPool=pick([0,40,900,5000,123456]);over.bleedStk=pick([0,1,3,10]);over.bleed=1;}
    if(k===1){over.poisonT=pick([60,300,330]);over._poisonPool=pick([0,10,777,4000]);over.poisonStk=pick([0,2,7]);over.poison=1;over.burnT=pick([0,180]);over._burnPool=pick([0,500,3100]);over.burnStk=pick([0,1,4]);}
    if(k===2){over.bleedT=pick([61,119,180]);over._bleedPool=2000;over.bleedStk=4;over.poisonT=250;over._poisonPool=1500;over.burnT=180;over._burnPool=2500;over.burnStk=10;over._hrMarkT=pick([5,200]);over._hrMark=1;over._bbStkT=pick([3,90]);over._bbStk=4;}
    mk('dot '+k+' '+et,et,{dist:pick([60,250,600]),ang:rn(0,6.28),over,sp:pick([1,1,2]),ticks:420});
  }
  mk('dot ice '+et,et,{dist:300,over:{_alerted:true,_iceDotT:200,_iceDotDmg:pick([0,33]),baseSpd:pick([0,2.5])},ticks:260});
  mk('dot ice end '+et,et,{dist:300,over:{_alerted:true,_iceDotT:7,_iceSlowed:true},ticks:30,sp:2});
  mk('dot mh '+et,et,{dist:300,over:{_alerted:true,_mhDot:260,_mhDotDmg:pick([0,45])},ticks:300});
  mk('dot mh sp2 '+et,et,{dist:300,over:{_alerted:true,_mhDot:150},ticks:120,sp:2});
  mk('dot all '+et,et,{dist:140,over:{_alerted:true,bleedT:400,_bleedPool:3000,bleedStk:6,poisonT:400,_poisonPool:2000,poisonStk:3,burnT:400,_burnPool:1000,burnStk:2,_iceDotT:300,_mhDot:300,_hrMarkT:50,_bbStkT:50},ticks:520});
}
// ---- C01-FX: elMul with the armor element (contact, charges, shots, zones) ----
for(const et of SCOPE){
  for(let k=0;k<3;k++){const armEl=1+Math.floor(fz()*6),el=Math.floor(fz()*7);
    mk('armor el '+et+' k'+k+' a'+armEl+' e'+el,et,{dist:pick([22,40,90,200]),ang:rn(0,6.28),armEl,over:{_alerted:true,el},ticks:200,piframes:0,pfacing:rn(-3,3)});}
}
for(const [st,et] of [['eChargeWind',22],['eSwoop',14],['eSlamWind',19],['eShieldBash',6],['windup',5],['attack',0],['eSlamWind',28]]) for(const armEl of [1,2,3,4,5,6]) mk('armor state '+st+' '+et+' a'+armEl,et,{dist:25,armEl,ang:0.7,over:{_alerted:true,el:armEl===1?2:armEl===2?1:armEl===3?4:armEl===4?3:armEl===5?3:4,s:st,st2:pick([1,8,25]),echDx:1,echDy:0,_chgSpd:32,_chgDur:18,_chgAimMax:60,_chgLen:640}});
mk('iceOnHit melee charge',22,{dist:200,over:{_alerted:true,_iceChargeT:0,_iceOnHit:true},ticks:200});
mk('stage 1 pool etype 4 shooter',4,{dist:250,over:{_alerted:true,projCd:240,projT:2},ticks:200});
for(let k=0;k<4;k++)for(const et of [1,8,13,16,21,23,25,26,0,3]) mk('shooter fuzz '+k+' '+et,et,{dist:pick([100,250,500]),ang:rn(0,6.28),over:{_alerted:true,projT:pick([1,10,40])},ticks:260,sp:1});
const results=[];
for(const c of cases){let r;try{r=runCase(c);}catch(err){throw new Error('case '+c.name+': '+err.message);}results.push({case:c,out:r});}
const tables={ETYPE_RANGE:JSON.parse(JSON.stringify(vm.runInContext('ETYPE_RANGE',ctx)))};
fs.writeFileSync(outPath,JSON.stringify({source:{file:sourcePath,sha256:fileSha,head:headSha,anchors},snap:SNAP,cases:results},null,0));
console.log('wrote '+outPath+' cases='+results.length);
