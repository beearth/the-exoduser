// B08 oracle exporter: runs the ORIGINAL game.html code for the energy shield (hurtE / hurtP / regen tick), the enemy death revive block of hurtE,
// the dead-enemy revive timer branch of update(), _spawnGhoul, the druid finale revive, and the player die()/_fallenResolve revive judgement in a Node VM
// and writes oracle.json. Program.cs (.NET 8) compares Runtime/Core/EnergyShield.cs + ReviveRules.cs with it. No expected value is typed by hand.
// usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const SRC=path.resolve(arg('--source','G:/exoduser/game.html')),OUT=path.resolve(arg('--out',path.join(__dirname,'oracle.json')));
const text=fs.readFileSync(SRC,'utf8'),lines=text.split('\n'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),blocks=[];
function at(prefix,occ=0){let n=0;for(let i=0;i<lines.length;i++)if(lines[i].trimStart().startsWith(prefix)){if(n++===occ)return i+1;}throw new Error('source drift: no line starts with "'+prefix+'"');}
function rec(a,b,label){const body=lines.slice(a-1,b).join('\n');blocks.push({label,from:a,to:b,sha256:sha(body)});return body+'\n';}
function line(prefix,occ=0){const n=at(prefix,occ);return rec(n,n,prefix.slice(0,40));}
function fnFrom(a,label){let depth=0,started=false,str=null,esc=false;
 for(let i=a-1;i<lines.length;i++){const s=lines[i];for(let c=0;c<s.length;c++){const ch=s[c],nx=s[c+1];
  if(str){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===str)str=null;continue;}
  if(ch==='/'&&nx==='/')break;if(ch==="'"||ch==='"'||ch==='`'){str=ch;continue;}
  if(ch==='{'){depth++;started=true;}else if(ch==='}')depth--;}
  if(started&&depth===0)return rec(a,i+1,label);}throw new Error('unbalanced '+label);}
function fn(prefix,occ=0){return fnFrom(at(prefix,occ),prefix.slice(0,40));}
function between(startPrefix,endPrefix,label,occ=0){const a=at(startPrefix,occ);let b=a;while(!lines[b-1].trimStart().startsWith(endPrefix)){b++;if(b>lines.length)throw new Error('source drift: '+endPrefix);}return rec(a,b,label);}
function mustHave(src,s){if(!src.includes(s))throw new Error('source drift: missing "'+s+'"');}
const noPool=s=>s.replace(/\bpoolPart\(/g,'_NOP&&poolPart(');   // VFX particle args draw Math.random: the C# port has no particles, so the oracle skips them

// ---- original code ----
const SRC_REVIVE_GATE=between('if(e.reviveIframes>90)e.reviveIframes=90;','if(e.reviveIframes>0&&!isDot)','hurtE reviveIframes gate');
const SRC_ESHIELD=fnFrom(at('if((!isDot||(opts&&opts.shieldHit))&&e.eShieldMax>0&&e.eShield>0){'),'hurtE eShield absorb');
const SRC_PSHIELD=between('let _shFullBlock=false;','// 유니크: _uArmorRage','hurtP shield absorb');
const SRC_PREGEN_FULL=(()=>{let a=-1;for(let i=0;i<lines.length;i++)if(lines[i].trim()==='if(P.mshield>0){'&&lines[i+1].includes('P.shieldRegenT>0')){a=i+1;break;}
 if(a<0)throw new Error('source drift: shield regen block');return rec(a,a+3,'update shield regen block');})();
mustHave(SRC_PREGEN_FULL,'P.shield<P.mshield');
const SRC_DEATH=between('if(e.etype===87&&!e._dgRevived){','e._bossRevived=true; // 타이머 활성','hurtE death revive block');
const SRC_DEATH_END=(()=>{const a=at('e._bossRevived=true; // 타이머 활성');return lines[a].trim();})();
if(SRC_DEATH_END!=='}')throw new Error('source drift: death block end');
const SRC_DEATH_FULL=SRC_DEATH+'}\n';
const SRC_SINK=line('const _sinkDruid=_isSi0DruidSink(e)');
const SRC_FIN=fn('function _isDruidFinale('),SRC_SINK_FN=line('function _isSi0DruidSink('),SRC_FCH=fn('function _druidFinaleReviveChance('),SRC_RDF=fn('function _reviveDruidFinale(');
const SRC_CORPSE=fnFrom(at('else if(e._reviveTimer>0){'),'update corpse timer');
const SRC_GHOUL_DEFS=(()=>{const a=at('const GHOUL_DEFS={');return rec(a,a+4,'GHOUL_DEFS');})(),SRC_GHOUL_TYPE=fn('function _ghoulType('),SRC_GHOUL=fn('function _spawnGhoul(');
const SRC_DST=line('function dst(a,b,c,d)'),SRC_PMR=line('function pMRegenMul()'),SRC_PSC=line('function pShieldCdMul()'),SRC_LVB=line('function _lvB()');
const SRC_ONCE=line("if(_eqAffix('reviveOnce')>0&&!P._reviveOnceUsed)");
const SRC_FALL=between('// 부활 확률 미리 계산','P._fallenRevRoll=Math.random()*100;','die revive judgement');
const SRC_RESOLVE=fnFrom(at('if(P._fallenCanRevive&&P._fallenRevRoll<P._fallenRevChance){'),'_fallenResolve success');
mustHave(SRC_CORPSE,'if(Math.random()>.85)');mustHave(SRC_DEATH,'poolPart(');

// ---- seeded Math.random shared with Program.cs ----
function lcg(seed){let s=seed>>>0;const f=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;f.n++;return s/4294967296;};f.n=0;return f;}
const noop=()=>{};

function deathScope(c,rng){
 const texts=[],hurt=[],spawned=[],burst=[0],calls=[];let cmq=0;
 const G={stage:c.stage,_fireZones:c.zone==null?[]:[{type:'holyPrison',x:c.e.x,y:c.e.y,r:100,lv:c.zone}],_killedBosses:c.killed,bossAlive:false};
 const STG=[];for(let i=0;i<=40;i++)STG.push({hell:i===c.stage?c.hell:0});
 const e=JSON.parse(JSON.stringify(c.e));e.kb={x:0,y:0};
 const P={x:c.px,y:c.py,facing:c.pf,hp:c.phpFull?100:50,mhp:100,iframes:c.piframes,s:c.ps,kb:{x:0,y:0}};
 const scope={Math:Object.assign(Object.create(Math),{random:rng}),_NOP:0,e,G,STG,P,_DEMO_MODE:c.demo,_DEMO_LAST_STAGE:c.lastStage,
  _eqAffix:k=>k==='antiRevive'?c.anti:0,_T:a=>a,_L:(a,b)=>a,addTxt:(x,y,t,col,l)=>texts.push([x,y,String(t),col,l]),
  canMv:(x,y,r)=>{const v=c.canQ[cmq++%c.canQ.length];calls.push(['canMv',x,y,r,v]);return v;},
  safePt:(x,y,r)=>{calls.push(['safePt',x,y,r]);return c.safe?{x:c.safe[0],y:c.safe[1]}:null;},
  hurtP:(d,o)=>hurt.push([d,o&&o.dtype]),mkEn:(x,y,s,a,b,et,z)=>({x,y,mhp:0,hp:0,atk:0,deaths:0,_spawnArgs:[x,y,s,et]}),
  ens:spawned,_spawnBossProjectile:()=>{burst[0]++},_eMouthXY:()=>({x:0,y:0}),
  _reviveVFX:(x,y,col,label)=>texts.push([x,y-20,String(label),col,50]),playVFXAng:noop,_addBlastLight:noop,_addTpBolt:noop,playSample:noop,_r:()=>1,poolPart:noop,addParts:noop,shake:noop,safeNoop:noop,
  dst:(a,b,cc,d)=>Math.sqrt((cc-a)**2+(d-b)**2),_druidSinkStart:noop};
 return {scope,e,texts,hurt,spawned,burst,calls,P,G};
}
const FACT_DEATH=new Function('scope','with(scope){'+SRC_FIN+SRC_SINK_FN+SRC_FCH+'return function(){'+noPool(SRC_DEATH_FULL)+'return "kill";};}');
const FACT_SINK=new Function('scope','with(scope){'+SRC_FIN+SRC_SINK_FN+'return function(){'+SRC_SINK+'return _sinkDruid;};}');
const FIELDS=['hp','mhp','alive','s','st2','stunned','deaths','_revPts','_maxRevPts','_revived','_reviveTimer','_reviveX','_reviveY','_reviveAsGhoul','_bossRevJudged','_bossRevived','_bossRevChance','_bossRevRoll','_dgRevived','_bossPhase','maxPoise','poise','reviveIframes','atk','speed','bossPatCd','_origR','r','x','y','_spawnT','_bossReviveVFXPending','eShield','eShieldMax'];
function snap(e){const o={};for(const k of FIELDS)o[k]=e[k]===undefined?null:(typeof e[k]==='number'&&!Number.isFinite(e[k])?String(e[k]):e[k]);return o;}
function runDeath(c){
 const rng=lcg(c.seed),{scope,e,texts,hurt,spawned,burst,calls}=deathScope(c,rng);
 const ret=FACT_DEATH(scope)();
 const sinkScope=deathScope(c,lcg(1)).scope;sinkScope.e=e;sinkScope.G=scope.G;const sink=FACT_SINK(sinkScope)();
 return {...c,out:{ret:ret==='kill'?'kill':'return',e:snap(e),texts,hurt,burst:burst[0],companion:spawned.length?spawned[0]._spawnArgs:null,draws:rng.n,calls,sink}};
}
function baseEnemy(r){
 const ib=r()<.45;
 return {x:Math.round(r()*2000),y:Math.round(r()*2000),r:[14,20,24,26,40,60][Math.floor(r()*6)],hp:0,mhp:[100,875,12345,1e6][Math.floor(r()*4)],atk:[30,90,333][Math.floor(r()*3)],speed:+(.4+r()*1.8).toFixed(3),
  maxPoise:[100,400,1000][Math.floor(r()*3)],poise:50,bossPatCd:[10,40,90,200][Math.floor(r()*4)],ib:ib||undefined,etype:r()<.08?87:(ib?[0,3,8][Math.floor(r()*3)]:Math.floor(r()*12)),
  elite:Math.floor(r()*4),lv:[0,1,50,99,100,250,420,999][Math.floor(r()*8)],deaths:ib?Math.floor(r()*4):0,_revPts:ib?[0,5,10,12,40,150,201][Math.floor(r()*7)]:0,_maxRevPts:ib?[0,150,200,201][Math.floor(r()*4)]:0,
  _revived:r()<.15,_isGhoul:r()<.08,_bossRevJudged:r()<.25,_origR:r()<.3?[0,40]:0,_dgRevived:r()<.3,_fmKind:r()<.1?'x':undefined,alive:false,s:'idle',st2:0,stunned:0,eShield:5,eShieldMax:9,reviveIframes:0};
}
function deathCase(i,r){
 const e=baseEnemy(r);e._origR=Array.isArray(e._origR)?e._origR[1]:e._origR;if(e._origR===0)delete e._origR;
 const stage=r()<.5?0:Math.floor(r()*8),demo=r()<.5,lastStage=r()<.3?3:0;
 return {id:i,e,stage:r()<.2?3:stage,hell:Math.floor(r()*7),demo,lastStage:demo&&r()<.5?3:lastStage,anti:[0,0,.04,.08,.12,.2,.35,.9][Math.floor(r()*8)],zone:r()<.25?Math.floor(r()*10)+1:null,
  px:Math.round(r()*2000),py:Math.round(r()*2000),pf:+(r()*6.28).toFixed(3),phpFull:r()<.4,piframes:r()<.3?0:Math.floor(r()*60)-10,ps:r()<.15?'charge':'idle',
  canQ:[[true],[false],[false,true],[true,false],[false,false]][Math.floor(r()*5)],safe:r()<.5?[Math.round(r()*2000),Math.round(r()*2000)]:null,killed:r()<.5?[3,8,13,20].slice(0,Math.floor(r()*5)):[],seed:Math.floor(r()*4294967295)};
}
const sections={};
// ---------- shield: enemy ----------
sections.enemyShield=[];{
 for(const shield of [0,1,7,50,100,875,1e6,12.5])for(const max of [0,1,875,1e6])for(const dmg of [0,1,3,7,50,100,876,5e6])for(const isDot of [false,true])for(const sh of [false,true]){
  const texts=[];const scope={addTxt:(x,y,t,c,l,sz,s)=>texts.push([String(t),c,l]),String};
  const e={x:0,y:0,eShield:shield,eShieldMax:max};let d=dmg;
  // the block mutates the local `dmg`, so the wrapper passes it back through a closure-free copy
  const f=new Function('scope','e','dmg','isDot','opts','with(scope){let _shBlocked=false;'+SRC_ESHIELD+'return {shield:e.eShield,dmg,blocked:_shBlocked};}');
  const r=f(scope,e,dmg,isDot,sh?{shieldHit:true}:{});
  sections.enemyShield.push({shield,max,dmg,isDot,shieldHit:sh,out:{shield:r.shield,dmg:r.dmg,blocked:r.blocked,number:texts.length?texts[0][0]:null,numberCalls:texts.length}});
 }
}
// ---------- shield: enemy reviveIframes gate ----------
sections.reviveGate=[];{
 const f=new Function('e','isDot','{'+SRC_REVIVE_GATE.split('\n').map(l=>l.replace('return}','return "swallowed"}')).join('\n')+'return "pass";}');
 for(const ri of [-5,0,.5,1,2,89,90,91,500])for(const isDot of [false,true]){const e={reviveIframes:ri};const r=f(e,isDot);sections.reviveGate.push({ri,isDot,out:{r,ri:e.reviveIframes}});}
}
// ---------- shield: player ----------
const FACT_PSH=new Function('scope','with(scope){return function(P,a){'+SRC_PSHIELD+'return {a,full:_shFullBlock};};}');
sections.playerShield=[];{
 for(const shield of [0,1,10,100,285.5])for(const ms of [0,100,285.5])for(const regenT of [0,17.5])for(const a of [0,1,9,10,99.5,100,285,500]){
  const texts=[];const P={shield,mshield:ms,shieldRegenT:regenT,x:0,y:0};
  const scope={_uEq:()=>0,_uqS:{shieldBankCd:0},addTxt:(x,y,t)=>texts.push(String(t)),_T:s=>s,poolPart:noop,_NOP:0,Math};
  const r=FACT_PSH(scope)(P,a);
  sections.playerShield.push({shield,ms,regenT,a,out:{shield:P.shield,regenT:P.shieldRegenT,a:r.a,full:r.full,texts}});
 }
}
// ---------- shield: player regen ----------
sections.playerRegen=[];{
 const f=new Function('scope','with(scope){'+SRC_PMR+'\n'+SRC_PSC+'\n'+SRC_LVB+'\nreturn function(sp){'+SRC_PREGEN_FULL+'};}');
 let seed=7;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const cases=[];
 for(const shield of [0,40,284.9,285])for(const ms of [0,285])for(const regenT of [0,.4,180])for(const pm of [0,1,5,10])for(const lv of [1,50,499])for(const si of [0,10,300])for(const sp of [1,.5,2])cases.push({shield,ms,regenT,pm,lv,si,sp});
 for(let i=0;i<1500;i++)cases.push({shield:+(r()*300).toFixed(3),ms:r()<.2?0:+(r()*400).toFixed(2),regenT:r()<.5?0:+(r()*200).toFixed(2),pm:Math.floor(r()*11),lv:1+Math.floor(r()*900),si:Math.floor(r()*500),sp:[1,1,1,.5,2,3][Math.floor(r()*6)]});
 for(const c of cases){const P={shield:c.shield,mshield:c.ms,shieldRegenT:c.regenT,lv:c.lv};const scope={P,PASSIVES:{pMRegen:c.pm},STATS:{int:c.si},Math};f(scope)(c.sp);sections.playerRegen.push({...c,out:{shield:P.shield,regenT:P.shieldRegenT}});}
}
// ---------- enemy death revive block ----------
sections.death=[];{
 let seed=20261027;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<6000;i++)sections.death.push(runDeath(deathCase(i,r)));
 // grid: every boss death with each guard flag, so all text branches are hit
 for(const stage of [0,3])for(const demo of [false,true])for(const lastStage of [0,3])for(const rp of [0,5,12,150])for(const deaths of [0,1,2,3])for(const judged of [false,true])for(const anti of [0,.12])for(const zone of [null,3])for(const phpFull of [false,true]){
  const id=100000+sections.death.length;const e={x:300,y:400,r:50,hp:0,mhp:20000,atk:200,speed:1.2,maxPoise:400,poise:10,bossPatCd:100,ib:true,etype:3,elite:0,lv:100,deaths,_revPts:rp,_maxRevPts:150,_revived:false,_isGhoul:false,_bossRevJudged:judged,alive:false,s:'idle',st2:0,stunned:0,eShield:5,eShieldMax:9,reviveIframes:0};
  sections.death.push(runDeath({id,e,stage,hell:6,demo,lastStage,anti,zone,px:320,py:420,pf:1,phpFull,piframes:0,ps:'idle',canQ:[true],safe:null,killed:[3,8],seed:id*7919}));
 }
 // ordinary mobs at the revive boundary: lv x elite x suppression
 for(const lv of [0,1,99,100,199,200,500])for(const elite of [0,1,2,3])for(const anti of [0,.04,.2,.5,.6,.65])for(const zone of [null,1,10])for(const seed of [11,99,12345,777777])
  sections.death.push(runDeath({id:200000+sections.death.length,e:{x:10,y:20,r:25,hp:0,mhp:500,atk:40,speed:.5,maxPoise:100,poise:10,etype:0,elite,lv,alive:false,s:'idle',st2:0,stunned:0,eShield:5,eShieldMax:9,reviveIframes:0,deaths:0},stage:0,hell:0,demo:false,lastStage:0,anti,zone,px:0,py:0,pf:0,phpFull:false,piframes:0,ps:'idle',canQ:[true],safe:null,killed:[],seed}));
}
// ---------- corpse timer branch (+ _spawnGhoul + druid finale) ----------
const FACT_CORPSE=new Function('scope','with(scope){'+SRC_FIN+SRC_SINK_FN+SRC_FCH+SRC_RDF+SRC_GHOUL_DEFS+SRC_GHOUL_TYPE+SRC_GHOUL+'return function(sp){if(0){}\n'+noPool(SRC_CORPSE).replace('if(Math.random()>.85)','if(0)')+'};}');
sections.corpse=[];{
 let seed=1027;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<4000;i++){
  const ib=r()<.55,fin=r()<.2;const stage=fin?3:(r()<.5?0:Math.floor(r()*8));
  const e={x:5,y:6,r:[14,20,24,25,26,39,40,60][Math.floor(r()*8)],hp:0,mhp:[100,875,20000][Math.floor(r()*3)],atk:[30,90,300][Math.floor(r()*3)],baseAtk:[20,60,200][Math.floor(r()*3)],_druidBaseAtk:r()<.5?150:undefined,speed:1,maxPoise:300,poise:10,ib:ib||undefined,etype:ib?3:0,elite:Math.floor(r()*4),lv:r()<.3?0:Math.floor(r()*600),
   deaths:ib?Math.floor(r()*4):0,_revPts:ib?[0,5,40,150][Math.floor(r()*4)]:0,_maxRevPts:ib?[0,150,200][Math.floor(r()*3)]:0,alive:false,s:'idle',st2:0,stunned:0,eShield:5,eShieldMax:9,reviveIframes:0,kb:{x:0,y:0},
   _reviveTimer:Math.floor(r()*5)+(r()<.3?0:1),_reviveX:[100,200,300][Math.floor(r()*3)],_reviveY:[40,80,120][Math.floor(r()*3)],_reviveAsGhoul:r()<.5,_bossRevived:r()<.7,_bossRevChance:[0,.3,.6,1,1.5][Math.floor(r()*5)],_bossRevRoll:r()<.2?undefined:r(),_bossRevJudged:true,_sinkDruid:r()<.25,_origR:r()<.5?40:0,col:'#aa5533',room:0,exp:3,matDrop:2,dropTier:1,_revived:true};
  if(e._origR===0)delete e._origR;if(e._bossRevRoll===undefined)delete e._bossRevRoll;if(e._druidBaseAtk===undefined)delete e._druidBaseAtk;
  const c={id:i,e,stage,demo:fin||r()<.3,lastStage:fin?3:0,px:r()<.5?0:700,py:300,seed:Math.floor(r()*4294967295),sp:1};
  const rng=lcg(c.seed),ee=JSON.parse(JSON.stringify(e));const texts=[],ens=[];
  const G={stage:c.stage,bossAlive:false,_lavaPools:[],_druidOrbs:[],_reviveTutDone:true,curRoom:0};
  const scope={Math:Object.assign(Object.create(Math),{random:rng}),_NOP:0,e:ee,G,P:{x:c.px,y:c.py},ens,projs:[],EL:{D:3},_DEMO_MODE:c.demo,_DEMO_LAST_STAGE:c.lastStage,_T:a=>a,_L:(a,b)=>a,
   addTxt:(x,y,t,col,l)=>texts.push([x,y,String(t),col,l]),_reviveVFX:(x,y,col,label)=>texts.push([x,y-20,String(label),col,50]),playVFXAng:noop,playSample:noop,_r:()=>1,poolPart:noop,shake:noop,_recycleProj:noop,
   _petSayCD:noop,_druidActCue:null,console,_spawnT:0,_FALSE:false,dst:()=>0};
  let steps=0,ghouls=[];const f=FACT_CORPSE(scope);
  while(ee._reviveTimer>0&&steps<8){f(c.sp);steps++;}
  const ghoul=ens.length?snap(ens[0]):null;const gh=ens.length?ens[0]:null;
  sections.corpse.push({...c,out:{steps,e:snap(ee),texts,draws:rng.n,druidLast:!!ee._druidLastStand,ghoul:gh?{etype:gh.etype,x:gh.x,y:gh.y,r:gh.r,hp:gh.hp,mhp:gh.mhp,atk:gh.atk,baseAtk:gh.baseAtk,speed:gh.speed,poise:gh.poise,maxPoise:gh.maxPoise,lv:gh.lv,st2:gh.st2,facing:gh.facing,elite:gh.elite,eShield:gh.eShield,eShieldMax:gh.eShieldMax,ib:!!gh.ib,_isGhoul:gh._isGhoul,_revived:gh._revived,_reviveChase:gh._reviveChase,_alerted:gh._alerted,col:gh.col,s:gh.s,alive:gh.alive}:null}});
 }
}
// ---------- _ghoulType / GHOUL_DEFS ----------
sections.ghoulType=[];{
 const f=new Function('scope','with(scope){'+SRC_GHOUL_DEFS+SRC_GHOUL_TYPE+'return {_ghoulType,GHOUL_DEFS};}')({});
 for(const r of [1,10,16,23,24,24.1,25,30,39,39.9,40,41,60,90])for(const el of [0,1,2,3])sections.ghoulType.push({r,el,out:f._ghoulType(r,el)});
 sections.ghoulDefs=f.GHOUL_DEFS;
}
// ---------- sink ----------
sections.sink=[];{
 for(const stage of [0,1,3])for(const demo of [false,true])for(const last of [0,3])for(const ib of [false,true])for(const fm of [false,true])for(const timer of [0,90])for(const revd of [false,true])for(const roll of [undefined,.2,.9])for(const ch of [undefined,0,.5]){
  const e={ib:ib||undefined,_fmKind:fm||undefined,_reviveTimer:timer,_bossRevived:revd,_bossRevRoll:roll,_bossRevChance:ch};
  const scope={G:{stage},_DEMO_MODE:demo,_DEMO_LAST_STAGE:last,e};const r=FACT_SINK(scope)();
  sections.sink.push({stage,demo,last,ib,fm,timer,revd,roll:roll===undefined?null:roll,ch:ch===undefined?null:ch,out:r});
 }
}
// ---------- player die() revive judgement ----------
sections.fall=[];{
 const FACT_FALL=new Function('scope','with(scope){return function(){'+SRC_ONCE.replace('return}','return "once"}')+'\n'+SRC_FALL+'return "fall";};}');
 const FACT_RES=new Function('scope','with(scope){return function(){'+SRC_RESOLVE+'return "dead";};}');
 let seed=555;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const cases=[];
 for(const lv of [1,33,34,100,500,1000,5000])for(const dm of [0,3,10])for(const hu of [0,1,5,10])for(const rp of [0,.06,.4])for(const cd of [0,-.18,-.4])for(const once of [0,.2])for(const used of [false,true])for(const dcd of [0,500])for(const zone of [0,.1])cases.push({lv,dm,hu,rp,cd,once,used,dcd,zone,seed:cases.length*31+7});
 for(let i=0;i<1500;i++)cases.push({lv:1+Math.floor(r()*3000),dm:Math.floor(r()*11),hu:Math.floor(r()*11),rp:+(r()*.5).toFixed(2),cd:-+(r()*.4).toFixed(2),once:r()<.2?.35:0,used:r()<.3,dcd:r()<.5?0:Math.floor(r()*30000),zone:r()<.3?+(.1+Math.floor(r()*10)*.01).toFixed(2):0,seed:Math.floor(r()*4294967295)});
 for(const c of cases){
  const rng=lcg(c.seed),texts=[];const P={lv:c.lv,hp:50,mhp:100,mp:5,mmp:9,st:3,mst:4,x:11,y:22,iframes:0,_reviveOnceUsed:c.used,_demonRevCd:c.dcd,rage:0,facing:0};
  const G={_fireZones:c.zone>0?[{type:'weakRev',x:11,y:22,r:50,lv:Math.round((c.zone-.1)/.01)+1}]:[],_flashT:0,shake:0,slowMo:0};
  const scope={Math:Object.assign(Object.create(Math),{random:rng}),P,G,PASSIVES:{pDemon:c.dm,pHuman:c.hu},_eqAffix:k=>k==='reviveOnce'?c.once:k==='revivePow'?c.rp:k==='reviveCd'?c.cd:0,_eqImplicit:()=>0,dst:(a,b,cc,d)=>Math.sqrt((cc-a)**2+(d-b)**2),
   playSample:noop,addTxt:(x,y,t)=>texts.push(String(t)),_T:s=>s,_uEq:()=>0,_rageMax:()=>100,_petSayCD:noop,_petOnDeath:noop,poolPart:noop,_NOP:0,SFX:{levelup:noop},_r:()=>1,OPT:{shake:100},_FALSE:false};
  const ret=FACT_FALL(scope)();
  const o={ret,once:P._reviveOnceUsed,hp:P.hp,chance:P._fallenRevChance===undefined?null:P._fallenRevChance,cd:P._fallenRevCdFrames===undefined?null:P._fallenRevCdFrames,can:P._fallenCanRevive===undefined?null:P._fallenCanRevive,roll:P._fallenRevRoll===undefined?null:P._fallenRevRoll,draws:rng.n,texts};
  let res=null;if(ret==='fall'){const P2=P;const t2=[];const sc2={...scope,addTxt:(x,y,t)=>t2.push(String(t))};const rr=FACT_RES(sc2)();res={ret:rr,demonCd:P2._demonRevCd,hp:P2.hp,iframes:P2.iframes,texts:t2};}
  sections.fall.push({...c,out:o,resolve:res});
 }
}
fs.writeFileSync(OUT,JSON.stringify({source:{path:SRC.replace(/\\/g,'/'),sha256:sha(text),lines:lines.length},blocks,sections}));
const counts={};for(const k of Object.keys(sections))counts[k]=Array.isArray(sections[k])?sections[k].length:1;
console.log(JSON.stringify({out:OUT,counts}));
