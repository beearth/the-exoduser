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
// ---- U1 ----
const u1Start=find('function updateE(e,sp){'),u1End=find('  // ═══ D4식 DOT — 히트뎀%');
const u1Body=record('U1 updateE head (body lines)',u1Start+1,u1End-1);
const U1='function __U1(e,sp){\n'+u1Body+'\n}';
const U1T='function __U1T(e,sp){\n'+u1Body+'\nreturn {tail:true,d:d};}';
if(!compiles(U1)||!compiles(U1T))throw Error('U1 wrapper does not compile');
// ---- L1 ----
const l1Start=find('  if(G._bonfire&&G._bonfire.t>0)G._bonfire.t-=sp;');
const forLine=find('  const _eo=_gameFrame&1;')+1;if(!lines[forLine].startsWith('  for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];'))throw Error('loop line not where expected');
const reviveLine=(()=>{const hits=[];for(let i=forLine;i<forLine+200;i++)if(lines[i].startsWith('    else if(e._reviveTimer>0){'))hits.push(i);if(hits.length<1)throw Error('revive branch not found');return hits[0];})();
// brace check: the for body must be depth 1 right before the else-if (the alive block is closed on the previous line)
function depthAt(from,to){let d=0,str=null,i0=from;const src=lines.slice(from,to).join('\n');for(let i=0;i<src.length;i++){const c=src[i],n=src[i+1];
  if(str){if(c==='\\'){i++;continue;}if(c===str)str=null;continue;}
  if(c==='/'&&n==='/'){while(i<src.length&&src[i]!=='\n')i++;continue;}
  if(c==="'"||c==='"'||c==='`'){str=c;continue;}
  if(c==='{')d++;else if(c==='}')d--;}return d;}
if(depthAt(forLine,reviveLine)!==1)throw Error('L1 brace depth before else-if is '+depthAt(forLine,reviveLine)+', expected 1');
const l1Body=record('L1 enemy loop head (bonfire timer .. alive block)',l1Start,reviveLine-1);
const L1='function __L1(sp){\n'+l1Body+'\n}\n}';
if(!compiles(L1))throw Error('L1 wrapper does not compile');

// ---- VM ----
const ctx=vm.createContext({});
vm.runInContext(`var window=this;var _useGPU=false,_useGL=false,_ESPRITES=[];var P={x:0,y:0,lv:1},OPT={diff:5},G={stage:0,_stageDiffOff:0},_DEMO_MODE=false,_DEMO_LAST_STAGE=0,ens=[],IS_MOBILE=false,VW=1600,VH=900,_gameFrame=0,_mSfxPlaying=0;
var __seq=[],__i=0,__log=[],__rules={},__clock=[],__ci=0,__mk=false;
Math.random=function(){if(__i>=__seq.length)throw new Error("random sequence exhausted");return __seq[__i++];};
function __arg(a){if(a&&typeof a==='object'){const i=ens.indexOf(a);if(i>=0)return {e:i};if(G._bonfire&&a===G._bonfire)return {bf:[a.x,a.y,a.r,a.t]};throw new Error('unknown object argument');}return a;}
function __rec(name){const a=[];for(let i=1;i<arguments.length;i++)a.push(__arg(arguments[i]));__log.push([name].concat(a));}
function __reg(r,x,y,rad){const k=r||{kind:'open'};if(k.kind==='open')return true;if(k.kind==='blockAll')return false;
 if(k.kind==='blockDisc'){const dx=x-k.cx,dy=y-k.cy,rr=k.rad+rad;return dx*dx+dy*dy>=rr*rr;}
 if(k.kind==='blockXge')return !(x>=k.v);throw new Error('rule '+k.kind);}
function canMv(x,y,r){__rec('canMv',x,y,r);return __reg(__rules.canMv,x,y,r);}
function _canMvTile(x,y,r){__rec('canMvTile',x,y,r);return __reg(__rules.canMvTile,x,y,r);}
function isW(x,y,f){__rec('isW',x,y,f);const k=__rules.isW||{kind:'none'};if(k.kind==='none')return false;if(k.kind==='all')return true;if(k.kind==='xge')return x>=k.v;throw new Error('isW rule');}
function hasLOS(a,b,c,d){__rec('hasLOS',a,b,c,d);return !!(__rules.hasLOS);}
function _eWallStuck(x,y){__rec('wallStuck',x,y);const k=__rules.wallStuck||{kind:'none'};if(k.kind==='none')return false;if(k.kind==='all')return true;
 if(k.kind==='disc'){const dx=x-k.cx,dy=y-k.cy;return dx*dx+dy*dy<k.rad*k.rad;}throw new Error('wallStuck rule');}
function _ffMoveE(e,sp,mul){__rec('ffMove',e,sp,mul);e.x+=sp*mul;e.y+=sp*mul*0.5;}
function _pushOutWall(e){__rec('pushOutWall',e);e.x+=1.5;e.y-=0.5;}
function _pushOutsideBonfire(e,bf,c){__rec('pushOutsideBonfire',e,bf,c);e.x+=0.25;e.y+=0.125;}
function _bonfireEnemyClearance(e){__rec('bonfireClearance',e);return e.r*1.5+2;}
function hurtE(e,d){__rec('hurtE',e,d);e.hp=Math.max(0,e.hp-d);}
function _cancelProjCharge(e){__rec('cancelProjCharge',e);}
function rollDrop(e){__rec('rollDrop',e);}function addExp(n){__rec('addExp',n);}function _regKill(e){__rec('regKill',e);}
function _bossReviveGrandVFX(e,r){__rec('bossReviveGrandVFX',e,r);}
function updateE(e,sp){__rec('updateE',e,sp);}
function _T(s){__rec('T',s);return s;}
function addTxt(x,y,s,c,l){__rec('addTxt',x,y,s,c,l);}function addParts(x,y,c,n){__rec('addParts',x,y,c,n);}
var SFX={block:function(){__rec('sfxBlock');}};function shake(n){__rec('shake',n);}
function _playTell(){} // 예고음은 상태/수치 하니스의 음향 범위 밖이다.
function playSample(n,v,r){__rec('playSample',n,v,r);}function _r(a,b){__rec('r',a,b);return a+b*0.5;}
var performance={now:function(){__rec('now');if(__ci>=__clock.length)throw new Error('clock exhausted');return __clock[__ci++];}};`,ctx);
for(const b of blocks)vm.runInContext(b,ctx);
vm.runInContext(U1+'\n'+U1T+'\n'+L1,ctx);
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?Array.from(v):v));
const get=n=>plain(vm.runInContext(n,ctx));
const tables={T:get('T'),ETYPE_RANGE:get('ETYPE_RANGE'),_ETYPE_SFX:get('_ETYPE_SFX'),_ARCH_SFX:get('_ARCH_SFX')};

// ---- Math samples from the host V8 (same engine as the VM): JsMath.Atan2/Sin/Cos must equal them bit for bit ----
{const mr=(a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;})(99);
 const rs=()=>{const m=Math.pow(10,Math.floor(mr()*9)-4);return (mr()-.5)*2*m;};
 const ms={atan2:[],sin:[],cos:[]};const okv=v=>isFinite(v)&&!Object.is(v,-0);
 for(let i=0;i<8000;i++){const y=rs(),x=i%7===0?Math.abs(rs()):rs(),r=Math.atan2(y,x);if(okv(r)&&okv(x)&&okv(y))ms.atan2.push([y,x,r]);}
 for(const [y,x] of [[1,1],[-1,1],[1,-1],[-1,-1],[0,1],[1,0],[-1,0],[0,-1],[1e-310,1],[1e300,1e-300],[1e-300,1e300],[3,4],[-3,4],[0.5,0.25]]){const r=Math.atan2(y,x);if(okv(r))ms.atan2.push([y,x,r]);}
 for(let i=0;i<9000;i++){const x=(mr()-.5)*(i%3===0?20:i%3===1?2000:700000);if(okv(Math.sin(x)))ms.sin.push([x,Math.sin(x)]);if(okv(Math.cos(x)))ms.cos.push([x,Math.cos(x)]);}
 for(let a=-40;a<=40;a++){const x=a*Math.PI/4;for(const d of [0,1e-9,-1e-9]){const xx=x+d;if(okv(Math.sin(xx)))ms.sin.push([xx,Math.sin(xx)]);if(okv(Math.cos(xx)))ms.cos.push([xx,Math.cos(xx)]);}}
 for(let a=0;a<8;a++){const x=a*Math.PI/4*40;if(okv(Math.sin(x)))ms.sin.push([x,Math.sin(x)]);}
 // doubles whose high word sits exactly on the fdlibm branch thresholds (cos kernel 0x3FD33333, |x|~pi/4 0x3fe921fb, 3pi/4 0x4002d97c, 2^19*pi/2 0x413921fb) and the arguments around 0.3
 {const dv=new DataView(new ArrayBuffer(8));
  for(const hi of [0x3FD33333,0x3FD33332,0x3FD33334,0x3fe921fb,0x3fe921fc,0x4002d97c,0x4002d97b,0x3ff921fb,0x413921fa]){for(const lo of [0,1,0x33333333,0x7fffffff,0x80000000,0xffffffff]){for(const sg of [0,0x80000000]){
    dv.setUint32(0,(hi|sg)>>>0);dv.setUint32(4,lo);const x=dv.getFloat64(0);if(okv(Math.sin(x))&&okv(Math.cos(x))){ms.sin.push([x,Math.sin(x)]);ms.cos.push([x,Math.cos(x)]);}}}}
  for(const x of [0.3,0.2999999999,0.30000000001,-0.3,0.3000001,0.29999,0.299999999999999,0.3000000000000001]){ms.sin.push([x,Math.sin(x)]);ms.cos.push([x,Math.cos(x)]);}}
 tables.mathSamples=ms;}
// ---- PRNG + base enemies ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seqFor=(seed,first)=>{const r=mulberry32(seed),a=[...(first||[])];while(a.length<400)a.push(r());return a;};
function makeBase(etype,ib,si,seed){
  vm.runInContext('P={x:0,y:0,lv:100};OPT={diff:5};G={stage:'+si+',_stageDiffOff:0};_DEMO_MODE=false;_DEMO_LAST_STAGE=0;__log=[];__i=0;__rules={};',ctx);
  ctx.__seq=seqFor(seed,[0.9999]);// first draw 0.9999 -> no elite
  const o=vm.runInContext('mkEn(1000,1000,'+si+','+etype+','+ib+',1,2)',ctx);
  const j=JSON.parse(JSON.stringify(o));
  // a base has no per-case specifics: it stands at the world origin of the cases and is alive, idle, alerted off
  return j;
}
const R=tables.ETYPE_RANGE;
const etypeWithRange=v=>R.findIndex(x=>x===v);
const crawl=Object.keys(tables._ETYPE_SFX).map(Number).find(k=>tables._ETYPE_SFX[k]==='monster_crawl');
const baseSpecs=[
 {name:'etype0',etype:0,si:0,ib:false},{name:'range200',etype:etypeWithRange(200),si:4,ib:false},{name:'range400',etype:etypeWithRange(400),si:4,ib:false},
 {name:'range600',etype:etypeWithRange(600),si:4,ib:false},{name:'range800',etype:etypeWithRange(800),si:10,ib:false},{name:'range1000',etype:etypeWithRange(1000),si:10,ib:false},
 {name:'crawl',etype:crawl,si:14,ib:false},
 {name:'boss si0',etype:0,si:0,ib:true},{name:'boss si3',etype:0,si:3,ib:true},{name:'boss si10',etype:0,si:10,ib:true},
 {name:'rare93',etype:93,si:10,ib:false}];
for(const b of baseSpecs)if(b.etype<0||b.etype===undefined)throw Error('no etype for base '+b.name);
const bases=baseSpecs.map((b,i)=>({name:b.name,etype:b.etype,si:b.si,ib:b.ib,obj:makeBase(b.etype,b.ib,b.si,100+i)}));
const BI=Object.fromEntries(bases.map((b,i)=>[b.name,i]));

// ---- cases ----
const cases=[];
const worldDefault=()=>({P:{x:1000,y:1000},cam:{x:1000,y:1000},VW:1600,VH:900,IS_MOBILE:false,mw:60,mh:60,walls:[],rifts:[],kills:0,stageKills:null,eTierFrame:null,bonfire:null,mSfx:0,lesson:false,stage:0,demoMode:false,demoLast:0});
const rulesDefault=()=>({canMv:{kind:'open'},canMvTile:{kind:'open'},isW:{kind:'none'},hasLOS:false,wallStuck:{kind:'none'}});
function mk(kind,name,o){cases.push({name,kind,sp:1,seed:cases.length+1,first:[],clock:[0],world:worldDefault(),rules:rulesDefault(),enemies:[],...o});}
// enemy spec: base name + overrides (undefined values are dropped)
const en=(base,over)=>({base:BI[base],over:Object.fromEntries(Object.entries(over||{}).filter(([k,v])=>v!==undefined))});
const W=(o)=>({...worldDefault(),...o});
const Rl=(o)=>({...rulesDefault(),...o});
// enemy at distance d (to the east) of the player at (1000,1000)
const at=(d,over)=>({x:1000+d,y:1000,...(over||{})});
const SPS=[1,2,4,8,0.5,1.37];
let spi=0;const nextSp=()=>SPS[(spi++)%SPS.length];
function u1(name,base,over,o){const sp=(o&&o.sp)||nextSp();mk('U1',name,{sp,enemies:[en(base,{...at(200),...over})],...o,sp});}
// --- U1 grid ---
u1('lesson skip: lessonEnemy + active','etype0',{_lessonEnemy:true,_telegraphT:5},{world:W({lesson:true})});
u1('lesson enemy but lesson inactive','etype0',{_lessonEnemy:true,_telegraphT:5});
for(const t of [5,0,-3,0.5])u1('telegraph '+t,'etype0',{_telegraphT:t,r:12});
u1('wall push canMvTile false','etype0',{},{rules:Rl({canMvTile:{kind:'blockAll'}})});
u1('wall push canMvTile true','etype0',{});
for(const r of [0,6,0.5,2])u1('reviveIframes '+r,'etype0',{reviveIframes:r});
for(const [n,v] of [['cursed 1',{_cursed:1}],['cursed 5',{_cursed:5}],['cursed 0',{_cursed:0}],['shockT 1 (clears)',{_shockT:1,_shockStk:4}],['shockT 3',{_shockT:3,_shockStk:4}],['shockT 0.5',{_shockT:0.5,_shockStk:2}]])u1(n,'etype0',v);
// knockback
u1('kb none (<=.1)','etype0',{kb:{x:0.1,y:-0.1}});
u1('kb moves','etype0',{kb:{x:5,y:-3}});
u1('kb moves with spikeSlow lv2','etype0',{kb:{x:5,y:-3},_spikeSlow:30,_spikeSlowLv:2});
u1('kb moves with spikeSlow no lv','etype0',{kb:{x:5,y:-3},_spikeSlow:30});
u1('kb moves with spikeSlow lv 40 (cap .95)','etype0',{kb:{x:5,y:-3},_spikeSlow:30,_spikeSlowLv:40});
u1('kb real wall, speed<=2','etype0',{kb:{x:1.5,y:0.5},x:1000,y:1000},{world:W({walls:[[25,25]]}),rules:Rl({canMv:{kind:'blockAll'}}),sp:1});
for(const [n,kb,mhp,wall] of [['kb real wall speed>2 fixed dmg bigger',{x:6,y:8},100,true],['kb real wall percent dmg bigger',{x:4,y:3},6000,true],['kb real wall speed 20 (cap .08)',{x:12,y:16},50000,true],['kb MAP_OBJS wall (no dmg)',{x:6,y:8},100,false]]){
  u1(n,'etype0',{kb,mhp,x:1010,y:1010},{sp:1,rules:Rl({canMv:{kind:'blockAll'}}),world:W({walls:wall?[[25,25],[26,26],[25,26],[26,25]]:[]})});}
u1('kb out of map bounds is wall','etype0',{kb:{x:-6,y:-8},x:2,y:2},{sp:1,rules:Rl({canMv:{kind:'blockAll'}})});
for(const [n,kbx,kby] of [['rift overlap kb>2',6,0],['rift overlap kb<=2',1.5,0.5]])u1(n,'etype0',{kb:{x:kbx,y:kby},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1006,y:1100,t:10,maxT:20}]})});
u1('rift far','etype0',{kb:{x:6,y:0},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1500,y:1500,t:10,maxT:20}]})});
u1('rift full grown (t>=maxT)','etype0',{kb:{x:6,y:0},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1030,y:1100,t:30,maxT:20}]})});
u1('rift maxT 0 (NaN radius)','etype0',{kb:{x:6,y:0},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1006,y:1100,t:0,maxT:0}]})});
u1('two rifts, first hit breaks loop','etype0',{kb:{x:6,y:0},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1006,y:1100,t:10,maxT:20},{x:1006,y:1100,t:10,maxT:20}]})});
u1('bluHitCD','etype0',{_bluHitCD:10});
// hit stun / stun / freeze
u1('hitStun>0 returns (after cursed etc)','etype0',{_hitStun:3,_cursed:2,_frozen:5});
u1('stunned normal 50','etype0',{stunned:50});u1('stunned 400 capped to 180','etype0',{stunned:400});u1('stunned boss 400','boss si0',{stunned:400,x:1100,y:1000});
u1('stunned with maxStunned larger','etype0',{stunned:20,_maxStunned:90});u1('stunned with maxStunned smaller','etype0',{stunned:90,_maxStunned:20});
u1('stunned tiny','etype0',{stunned:0.001});
u1('frozen 5','etype0',{_frozen:5});u1('frozen ends normal','etype0',{_frozen:1,_freezeGauge:50},{sp:1});u1('frozen ends boss','boss si0',{_frozen:1,_freezeGauge:50},{sp:2});
u1('frozen sp 8 ends','etype0',{_frozen:3},{sp:8});
// movement detect
u1('moved >0.5px since prev','etype0',{_prevX:100,_prevY:100});
u1('not moved, hold>0','etype0',{_prevX:1200,_prevY:1000,_moveHold:3,_isMoving:true});
u1('not moved, no hold','etype0',{_prevX:1200,_prevY:1000,_moveHold:0,_isMoving:true});
u1('prevX falsy (0) falls back to x','etype0',{_prevX:0,_prevY:0});
u1('no prev at all','etype0',{});
u1('moved exactly threshold','etype0',{_prevX:1199.5,_prevY:1000});
u1('moved just over threshold','etype0',{_prevX:1199.4999,_prevY:1000});
// debuff timers (boundary: one tick left)
for(const [k,extra] of [['_webSlow',{}],['_frozenImmune',{}],['_iceResDown',{}],['_weakT',{_weakPhys:5,_weakMag:6,_weakPj:7}],['_shockDRT',{_shockDR:9}],['_blinkWeakT',{_blinkWeak:3}]]){
  for(const v of [1,0.5,10])u1('debuff '+k+'='+v,'etype0',{[k]:v,...extra},{sp:1});}
for(const v of [0.001,0.5,0.002,1])u1('iceShardRes '+v,'etype0',{_iceShardRes:v},{sp:1});
u1('iceShardRes negative clamp sp8','etype0',{_iceShardRes:0.01},{sp:8});
for(const v of [0.1,1,50])u1('freezeGauge '+v,'etype0',{_freezeGauge:v},{sp:1});
u1('freezeGauge sp 8','etype0',{_freezeGauge:1},{sp:8});
// poise
u1('poise regen 199->200 boundary','etype0',{poise:50,maxPoise:100,poiseR:199},{sp:1});
u1('poise regen 198->199 (no)','etype0',{poise:50,maxPoise:100,poiseR:198},{sp:1});
u1('poise regen cap at max','etype0',{poise:95,maxPoise:100,poiseR:200},{sp:1});
u1('poise full (no tick)','etype0',{poise:100,maxPoise:100,poiseR:50},{sp:1});
u1('boss poise untouched','boss si0',{poise:10,maxPoise:100,poiseR:199},{sp:1,});
u1('poise regen sp 8','etype0',{poise:10,maxPoise:100000,poiseR:195},{sp:8});
// move sound
for(const dist of [999.99,1000,500,30])u1('sfx dist '+dist,'etype0',{x:1000+dist},{sp:1,seed:5000+dist});
for(const m of [0,1,2,3,4])u1('sfx playing '+m,'etype0',{x:1500,_mSfxCd:0},{world:W({mSfx:m})});
u1('sfx cd >0 counts down','etype0',{x:1500,_mSfxCd:30});u1('sfx cd undefined -> 0 -> plays','etype0',{x:1500});
u1('sfx crawl random<.5','crawl',{x:1500,_mSfxCd:0},{first:[0.2,0.5]});u1('sfx crawl random>=.5','crawl',{x:1500,_mSfxCd:0},{first:[0.7,0.5]});
u1('sfx crawl random exactly .5','crawl',{x:1500,_mSfxCd:0},{first:[0.5,0.5]});
u1('sfx no table entry (etype 120 -> null, range falls back to 600)','etype0',{etype:120,x:1500,_mSfxCd:0,_alerted:true,s:'idle'});
u1('sfx suppressed: stunned<0 truthy','etype0',{x:1500,_mSfxCd:0,stunned:-3});
u1('sfx suppressed: frozen negative truthy','etype0',{x:1500,_mSfxCd:0,_frozen:-1});
// aggro
for(const [d,s] of [[199,'idle'],[200,'idle'],[201,'idle'],[300,'recover'],[300,'windup'],[600,'idle']])u1('reviveChase d'+d+' '+s,'etype0',{x:1000+d,_reviveChase:true,s});
for(const d of [799.9,800,100])for(const los of [true,false])u1('sight d'+d+' los '+los,'etype0',{x:1000+d},{rules:Rl({hasLOS:los})});
u1('sight busy state (no check)','etype0',{x:1500,s:'windup'},{rules:Rl({hasLOS:true})});
u1('sight already alerted (no LOS call)','etype0',{x:1500,_alerted:true},{rules:Rl({hasLOS:false})});
// facing / druid lock
u1('facing alerted near','etype0',{x:1500,_alerted:true,facing:0.1});
u1('facing alerted far (>=800)','etype0',{x:1900,_alerted:true,facing:0.1});
u1('facing not alerted','etype0',{x:1500,_alerted:false,facing:0.1});
for(const [stage,demo,last,s,st2,ib,name] of [[0,false,0,'bossCharge',50,'boss si0','normal druid stage0 bossCharge'],[3,false,0,'bossChargeWind',18,'boss si3','normal druid stage3 wind st2=18'],[3,false,0,'bossChargeWind',19,'boss si3','normal druid wind st2=19 (<=18+sp for sp .. )'],[0,false,0,'bossChargeWind',19.5,'boss si0','normal druid wind st2 19.5'],[3,true,3,'bossCharge',50,'boss si3','finale bossCharge'],[1,false,0,'bossCharge',50,'boss si0','stage1 boss bossCharge (not locked)'],[0,false,0,'idle',50,'boss si0','druid idle (not locked)']])
  for(const sp of [1,2]){u1('druid lock '+name+' sp'+sp,ib,{x:1300,_alerted:true,s,st2,facing:0.1},{sp,world:W({stage,demoMode:demo,demoLast:last})});}
// range chase
const RB=[['range200','range200'],['range400','range400'],['range600','range600'],['range800','range800'],['range1000','range1000']];
for(const [bn,_] of RB){const rg=R[bases[BI[bn]].etype]||600;
  for(const dist of [20,30,31,rg*.65-1,rg*.65,rg*.65+1,rg*.85,rg*.85+1,rg*.85+50]){for(const [wallRule,tag] of [[{kind:'none'},'free'],[{kind:'all'},'blocked']]){
    if(tag==='blocked'&&!(dist<rg*.65+2))continue;
    u1('chase '+bn+' d'+dist+' '+tag,bn,{x:1000+dist,_alerted:true,s:'idle',speed:0.9},{rules:Rl({isW:wallRule})});}}}
u1('chase recover state','range600',{x:1200,_alerted:true,s:'recover'});u1('chase windup no chase','range600',{x:1700,_alerted:true,s:'windup'});
u1('chase boss x2 far','boss si0',{x:1900,_alerted:true,s:'idle'});u1('chase boss retreat double speed','boss si3',{x:1100,_alerted:true,s:'idle',speed:0.8},{rules:Rl({isW:{kind:'none'}})});
// stacks
u1('wwStk with wwStkT','etype0',{_wwStk:9,_wwStkT:30});u1('wwStk decays (T=0)','etype0',{_wwStk:9,_wwStkT:0},{sp:60});u1('wwStk decays sp 1','etype0',{_wwStk:9,_wwStkT:0},{sp:1});u1('wwStk small','etype0',{_wwStk:2,_wwStkT:-1},{sp:60});
u1('wwStk T just ends','etype0',{_wwStk:9,_wwStkT:0.5},{sp:1});
for(const [h,decay,stk] of [[0,0,10],[58,0,10],[59,0,10],[60,0,10],[299,0,10],[299.5,0,10],[300,0,10],[100,59.5,10],[100,59,10],[100,0,3],[100,59.5,1],[100,59.5,100]])u1('combo hitT '+h+' decay '+decay+' stk '+stk,'etype0',{_comboStk:stk,_comboHitT:h,_comboDecayT:decay},{sp:1});
u1('combo stk 0 not run','etype0',{_comboStk:0,_comboHitT:100});
u1('combo hitT undefined','etype0',{_comboStk:5});
u1('combo sp 8 jump over 300','etype0',{_comboStk:5,_comboHitT:295},{sp:8});
// --- U1 seeded fuzz ---
const fz=mulberry32(777);const pick=a=>a[Math.floor(fz()*a.length)];const rn=(a,b)=>a+fz()*(b-a);
const NUMV=[undefined,undefined,0,0.5,1,2,3,10,60,199,200,300,-1];
const STATES=['idle','recover','windup','bossCharge','bossChargeWind','eCharge','stagger'];
for(let i=0;i<650;i++){
  const base=pick(bases).name;const over={x:1000+rn(-1300,1300),y:1000+rn(-900,900),s:pick(STATES),st2:pick([10,18,19,25,50]),stunned:pick([0,0,0,0,5,200,-2]),kb:fz()<0.5?{x:rn(-8,8),y:rn(-8,8)}:{x:0,y:0},speed:rn(0.3,1.2),facing:rn(-3,3),
    mhp:pick([100,5000,100000]),reviveIframes:pick([0,0,3]),poise:pick([10,50,100]),maxPoise:100,poiseR:pick([0,150,198,199,200,250])};
  for(const k of ['_hitStun','_frozen','_cursed','_shockT','_telegraphT','_bluHitCD','_spikeSlow','_webSlow','_frozenImmune','_iceResDown','_iceShardRes','_weakT','_shockDRT','_blinkWeakT','_freezeGauge','_wwStk','_wwStkT','_comboStk','_comboHitT','_comboDecayT','_mSfxCd','_moveHold','_maxStunned','_pImmune'])if(fz()<0.18)over[k]=pick(NUMV);
  if(fz()<0.3)over._alerted=fz()<0.5;if(fz()<0.15)over._reviveChase=true;if(fz()<0.1)over._lessonEnemy=true;if(fz()<0.3){over._prevX=over.x+rn(-2,2);over._prevY=over.y+rn(-2,2);}if(fz()<0.2)over._spikeSlowLv=pick([undefined,1,2,10,50]);
  const w=W({walls:fz()<0.5?[[25,25],[26,25],[25,26],[24,25]]:[],rifts:fz()<0.3?[{x:1000+rn(-300,300),y:1000+rn(-300,300),t:rn(0,30),maxT:pick([0,20,30])}]:[],mSfx:pick([0,1,2,3]),lesson:fz()<0.1,stage:pick([0,1,3,10]),demoMode:fz()<0.3,demoLast:pick([0,3])});
  const rl=Rl({canMv:pick([{kind:'open'},{kind:'blockAll'},{kind:'blockXge',v:1000+rn(-200,200)}]),canMvTile:pick([{kind:'open'},{kind:'open'},{kind:'blockAll'}]),isW:pick([{kind:'none'},{kind:'all'},{kind:'xge',v:1000+rn(-300,300)}]),hasLOS:fz()<0.5});
  mk('U1','fuzz U1 #'+i,{sp:pick(SPS),seed:900000+i,world:w,rules:rl,enemies:[en(base,over)]});
}
// --- L1 grid (world: player (1000,1000), camera on the player: view half 800+300 = 1100px) ---
const ensLine=(items)=>items.map(([b,o])=>en(b,o));
function l1(name,items,o){mk('L1',name,{enemies:ensLine(items),sp:(o&&o.sp)||nextSp(),clock:(o&&o.clock)||[0],...o});}
for(const sp of [1,2,4,8,0.5,1.37]){
  // tier boundaries: d 149.9/150 -> T1/T2, 349.9/350, 699.9/700 ; 30px view, with _alerted off/on
  const ds=[0,29.9,30,149.9,150,150.1,349.9,350,350.1,699.9,700,700.1,900,1099,1101];
  const items=ds.map(d=>['etype0',at(d,{})]);l1('tiers sp'+sp+' frame start null',items,{sp,clock:[0,0,0,0]});
  const items2=ds.map(d=>['etype0',at(d,{_alerted:true})]);l1('tiers alerted sp'+sp+' frame 7',items2,{sp,world:W({eTierFrame:7}),clock:[0,0,0]});
  l1('tiers boss+hurt+commit sp'+sp,[['boss si0',at(900,{})],['etype0',at(900,{hurt:3})],['etype0',at(900,{s:'eChargeWind'})],['etype0',at(900,{s:'eCharge'})],['etype0',at(900,{s:'eCharge',_alerted:true})]],{sp,world:W({eTierFrame:3})});
}
for(const tf of [null,0,1,2,3,4,5,6,7,8,15,16,255])l1('tier frame '+tf+' with 20 enemies at mixed distance',Array.from({length:20},(_,i)=>['etype0',{x:1000+[100,250,500,800,1200][i%5]*(i%2?1:-1),y:1000+i*3,_alerted:i%3===0}]),{world:W({eTierFrame:tf}),clock:[0],sp:nextSp()});
// culling (+300 px): camera away from the player
for(const [cx,name] of [[1000,'cam on player'],[3000,'cam far east'],[-500,'cam far west']])l1('cull '+name,[['etype0',{x:1000,y:1000}],['etype0',{x:cx+1099,y:1000}],['etype0',{x:cx+1101,y:1000}],['etype0',{x:cx-1099,y:1000}],['etype0',{x:cx-1101,y:1000}],['etype0',{x:cx,y:1000+1049}],['etype0',{x:cx,y:1000+1051}],['etype0',{x:cx,y:1000-1051}],['etype0',{x:cx,y:1000-1049}],['boss si0',{x:cx+1500,y:1000}],['etype0',{x:cx+1500,y:1000,hurt:2}]],{world:W({cam:{x:cx,y:1000},eTierFrame:7})});
// leash teleport
for(const [dist,al,canm,t] of [[2500,true,true,'2500 (exactly, not >)'],[2501,true,true,'2501'],[2600,true,false,'blocked'],[3000,false,true,'not alerted'],[3000,true,true,'alerted']]){
  const rules=Rl({canMv:canm?{kind:'open'}:{kind:'blockAll'}});
  l1('leash '+t,[['etype0',{x:1000+dist,y:1000,_alerted:al}],['boss si0',{x:1000+dist+100,y:1000,_alerted:true}],['etype0',{x:1000+dist,y:1000,_alerted:true,stunned:5}],['etype0',{x:1000+dist,y:1000,_alerted:true,_frozen:3}]],{world:W({cam:{x:-4000,y:-4000},eTierFrame:7}),rules,seed:300+dist});
}
l1('leash not on frame (tierFrame&7 !=0) then T4','etype0'?[['etype0',{x:4000,y:1000,_alerted:true}]]:[],{world:W({cam:{x:-4000,y:-4000},eTierFrame:2})});
l1('offscreen alerted ffMove ranged vs short',[['range200',{x:3000,y:1000,_alerted:true}],['range800',{x:3000,y:1000,_alerted:true}],['range800',{x:1500,y:1000,_alerted:true}]],{world:W({cam:{x:-4000,y:-4000},eTierFrame:7})});
// T4 far: not alerted -> updateE(sp*8), alerted -> ffMove by range
for(const f of [0,7,8,15])l1('T4 far frame '+f,[['etype0',{x:1900,y:1000}],['etype0',{x:1000,y:1900,_alerted:true}],['range800',{x:1900,y:1000,_alerted:true}],['range800',{x:1100+800*0.86,y:1000,_alerted:true}],['range200',{x:1900,y:1000,_alerted:true}]],{world:W({eTierFrame:f})});
// wall stuck rescue
l1('wall stuck: rescue at 1 tile',[['etype0',{x:1000,y:1000,r:12}]],{rules:Rl({wallStuck:{kind:'disc',cx:1000,cy:1000,rad:3}}),world:W({eTierFrame:7})});
l1('wall stuck: rescue skips wall tiles (east wall)',[['etype0',{x:1000,y:1000,r:12}]],{rules:Rl({wallStuck:{kind:'disc',cx:1000,cy:1000,rad:3}}),world:W({walls:[[26,25],[26,26],[25,26],[24,26],[24,25],[24,24],[25,24],[26,24]],eTierFrame:7})});
const allWalls=[];for(let y=0;y<60;y++)for(let x=0;x<60;x++)allWalls.push([x,y]);
l1('wall stuck: all walls, normal enemy dies',[['etype0',{x:1000,y:1000,exp:7}],['etype0',{x:1100,y:1000}]],{rules:Rl({wallStuck:{kind:'all'}}),world:W({walls:allWalls,eTierFrame:7,stageKills:4,kills:10})});
l1('wall stuck: all walls, dead enemy exp undefined -> 1',[['etype0',{x:1000,y:1000}]],{rules:Rl({wallStuck:{kind:'all'}}),world:W({walls:allWalls,eTierFrame:7})});
l1('wall stuck: all walls, exp 0 -> 1',[['etype0',{x:1000,y:1000,exp:0}]],{rules:Rl({wallStuck:{kind:'all'}}),world:W({walls:allWalls,eTierFrame:7})});
l1('wall stuck: boss wide ring (6..12)',[['boss si0',{x:1000,y:1000}]],{rules:Rl({wallStuck:{kind:'disc',cx:1000,cy:1000,rad:3}}),world:W({walls:allWalls.filter(([x,y])=>Math.max(Math.abs(x-25),Math.abs(y-25))<=5),eTierFrame:7})});
l1('wall stuck: boss all blocked -> player position (canMv open)',[['boss si0',{x:1000,y:1000}]],{rules:Rl({wallStuck:{kind:'all'}}),world:W({walls:allWalls,eTierFrame:7,P:{x:1200,y:1000},cam:{x:1200,y:1000}})});
l1('wall stuck: boss all blocked, player position blocked -> stays',[['boss si0',{x:1000,y:1000}]],{rules:Rl({wallStuck:{kind:'all'},canMv:{kind:'blockAll'}}),world:W({walls:allWalls,eTierFrame:7,P:{x:1200,y:1000},cam:{x:1200,y:1000}})});
l1('wall stuck: corner only (4 corners checked in order)',[['etype0',{x:1000,y:1000,r:20}]],{rules:Rl({wallStuck:{kind:'disc',cx:1020,cy:1020,rad:3}}),world:W({eTierFrame:7})});
l1('wall stuck: near map edge (bounds)',[['etype0',{x:30,y:30,r:12}]],{rules:Rl({wallStuck:{kind:'disc',cx:30,cy:30,rad:3}}),world:W({eTierFrame:7,P:{x:60,y:60},cam:{x:60,y:60}})});
// timers
l1('timers: spawnT, reviveVFX, stun, hitStun, flash, immunes',[['etype0',{_spawnT:5,_bossReviveVFXPending:3,stunned:5,_hitStun:4,_hitFlash:2,_stunImmune:3,_pImmune:9,reviveIframes:4}],['etype0',{_spawnT:0,_bossReviveVFXPending:0.5,stunned:0.5,_hitStun:0.5,_hitFlash:0.1,_stunImmune:0.5,_pImmune:0.5,reviveIframes:0.5,_origR:30}]],{world:W({eTierFrame:7}),sp:1});
l1('timers: revive VFX with origR 0 falls back to r',[['etype0',{_bossReviveVFXPending:1,_origR:0}]],{world:W({eTierFrame:7}),sp:1});
l1('timers with sp 8',[['etype0',{_spawnT:5,_bossReviveVFXPending:3,stunned:5,_hitStun:4,_hitFlash:2,_stunImmune:3,_pImmune:9,reviveIframes:4}]],{world:W({eTierFrame:7}),sp:8});
for(const ib of ['boss si0','etype0'])for(const p of [undefined,50])l1('stun end '+ib+' pImmune '+p,[[ib,{stunned:0.5,_maxStunned:90,_pImmune:p,poise:5,maxPoise:100,poiseR:30,s:'stagger',st2:5,_teleDropY:9}]],{world:W({eTierFrame:7}),sp:1});
l1('stun ends: maxStunned 0 nothing',[['boss si0',{stunned:0,_maxStunned:0}]],{world:W({eTierFrame:7}),sp:1});
// bonfire
for(const bt of [null,0,5,0.5])l1('bonfire t='+bt,[['etype0',{x:1100,y:1000}],['boss si0',{x:1100,y:1000}],['etype0',{x:1100,y:1000,hurt:1}]],{world:W({bonfire:bt===null?null:{x:1000,y:1000,r:300,t:bt},eTierFrame:7}),sp:1});
l1('bonfire push also after culled continue',[['etype0',{x:5000,y:5000}]],{world:W({bonfire:{x:1000,y:1000,r:300,t:5},eTierFrame:7,cam:{x:0,y:0}}),sp:1});
l1('walkDist accumulates (ffMove via updateE stub moves nothing, bonfire pushes)',[['etype0',{x:1100,y:1000,_walkDist:5}],['etype0',{x:1100,y:1000}]],{world:W({bonfire:{x:1000,y:1000,r:300,t:5},eTierFrame:7}),sp:1});
l1('walkDist: T4 flow move moves e (no updateE)',[['range800',{x:1900,y:1000,_alerted:true,_walkDist:2}]],{world:W({eTierFrame:7}),sp:1});
// dead enemies are skipped
l1('dead enemy skipped',[['etype0',{alive:false,x:1050,y:1000,_reviveTimer:30}],['etype0',{x:1050,y:1000}]],{world:W({eTierFrame:7}),sp:1});
// time budget
function budget(name,mobile,n,clock,bossAt){const items=[];for(let i=0;i<n;i++)items.push([i===bossAt?'boss si0':'etype0',{x:1000+((i*37)%900)+40,y:1000+((i*13)%600)}]);
  l1(name,items,{world:W({IS_MOBILE:mobile,eTierFrame:7}),clock,sp:1});}
budget('budget desktop: no break (all 0ms)',false,70,[0,0,0,0,0]);
budget('budget desktop: break at i=32 (13ms)',false,70,[0,13,13,13]);
budget('budget desktop: exactly 12ms not exceeded',false,70,[0,12,12,12,12]);
budget('budget desktop: i=32 ok, i=64 over',false,70,[0,5,20,20]);
budget('budget mobile: break at i=8 (9ms)',true,30,[0,9,9,9,9]);
budget('budget mobile: exactly 8ms',true,30,[0,8,8,8,8,8]);
budget('budget mobile: i=8 ok i=16 over',true,30,[0,3,9,9]);
budget('budget boss at the check index is not cut',false,70,[0,50,50,50],32);
budget('budget mobile boss at 8',true,30,[0,50,50,50],8);
budget('budget index 0 never checks (1 enemy)',false,1,[0]);
budget('budget desktop exact 32 enemies (idx 0..31, no check)',false,32,[0]);
// --- L1 seeded fuzz ---
const fl=mulberry32(4242);const pickL=a=>a[Math.floor(fl()*a.length)];const rnl=(a,b)=>a+fl()*(b-a);
for(let i=0;i<260;i++){
  const n=Math.floor(rnl(1,42));const items=[];
  for(let k=0;k<n;k++){const base=pickL(bases).name;const ang=rnl(0,6.283),dist=pickL([rnl(0,160),rnl(0,400),rnl(0,800),rnl(0,1400),rnl(0,3500)]);
    const o={x:1000+Math.cos(ang)*dist,y:1000+Math.sin(ang)*dist,s:pickL(['idle','idle','recover','windup','eCharge','eChargeWind']),stunned:pickL([0,0,0,3,-1]),r:pickL([10,12,20]),alive:fl()<0.93};
    for(const f of ['hurt','_hitStun','_hitFlash','_stunImmune','_pImmune','_spawnT','_bossReviveVFXPending','reviveIframes','_maxStunned','exp','_origR','_walkDist'])if(fl()<0.12)o[f]=pickL([0,0.5,1,3,9]);
    if(fl()<0.45)o._alerted=true;if(fl()<0.08)o._frozen=pickL([0,2]);
    items.push([base,o]);}
  const cx=pickL([1000,1000,1000,-1500,3000]);
  l1('fuzz L1 #'+i,items,{sp:pickL(SPS),seed:700000+i,clock:Array.from({length:200},(_, j)=>j===0?0:pickL([0,0,0,5,9,13])),world:W({IS_MOBILE:fl()<0.4,eTierFrame:pickL([null,0,1,2,3,6,7,8,9]),cam:{x:cx,y:1000},mw:60,mh:60,walls:fl()<0.4?[[25,25],[26,25],[25,26],[24,25],[24,24]]:[],bonfire:fl()<0.3?{x:1000+rnl(-200,200),y:1000,r:pickL([100,300]),t:pickL([0,5])}:null,kills:pickL([0,3]),stageKills:pickL([null,2]),stage:pickL([0,3])}),
    rules:Rl({wallStuck:pickL([{kind:'none'},{kind:'none'},{kind:'disc',cx:1000+rnl(-200,200),cy:1000+rnl(-100,100),rad:pickL([30,200])},{kind:'all'}]),canMv:pickL([{kind:'open'},{kind:'open'},{kind:'blockAll'}])})});
}

// --- targeted boundary cases added after the first mutation pass (each kills a mutant that the grid let survive) ---
{const wallsAround=[[25,25],[26,26],[25,26],[26,25]];
u1('kb 0.15 (above .1, below .2)','etype0',{kb:{x:0.15,y:0}},{sp:1});
u1('kb real wall speed 30 (percent cap .08 binding)','etype0',{kb:{x:24,y:18},mhp:50000,x:1010,y:1010},{sp:1,rules:Rl({canMv:{kind:'blockAll'}}),world:W({walls:wallsAround})});
u1('kb real wall speed 2.5 (between 2 and 3)','etype0',{kb:{x:2.4,y:0.7},mhp:100,x:1010,y:1010},{sp:1,rules:Rl({canMv:{kind:'blockAll'}}),world:W({walls:wallsAround})});
u1('rift hit at speed 2.5','etype0',{kb:{x:2.4,y:0.7},x:1000,y:1100},{sp:1,world:W({rifts:[{x:1002,y:1101,t:10,maxT:20}]})});
u1('rift radius edge: full rift, distance 49, r 12','etype0',{kb:{x:6,y:0},x:1000,y:1100,r:12},{sp:1,world:W({rifts:[{x:1055,y:1100,t:20,maxT:20}]})});
u1('rift radius edge: full rift, distance 45, r 12','etype0',{kb:{x:6,y:0},x:1000,y:1100,r:12},{sp:1,world:W({rifts:[{x:1051,y:1100,t:20,maxT:20}]})});
u1('facing at d=800.5 alerted','etype0',{x:1800.5,_alerted:true,facing:0.1});
l1('tier boundary d=700 exactly (ei 0, frame 8)',[['etype0',{x:1700,y:1000}]],{world:W({eTierFrame:7}),sp:1});
l1('tier boundary d=700 exactly alerted',[['range800',{x:1700,y:1000,_alerted:true}]],{world:W({eTierFrame:7}),sp:1});
l1('cull margin: x just outside cam+1100',[['etype0',{x:2100.5,y:1000}]],{world:W({eTierFrame:7}),sp:1});
l1('cull margin: y just outside cam+1050',[['etype0',{x:1000,y:2050.5}]],{world:W({eTierFrame:7}),sp:1});
l1('cull near-player exemption edge: d^2=900.3, camera far',[['etype0',{x:1030.005,y:1000}]],{world:W({cam:{x:-4000,y:-4000},eTierFrame:7}),sp:1});
l1('wall stuck rescue clears a non-zero knockback',[['etype0',{x:1000,y:1000,r:12,kb:{x:3,y:4}}]],{rules:Rl({wallStuck:{kind:'disc',cx:1000,cy:1000,rad:3}}),world:W({eTierFrame:7})});
l1('wall stuck boss ring clears a non-zero knockback',[['boss si0',{x:1000,y:1000,kb:{x:3,y:4}}]],{rules:Rl({wallStuck:{kind:'disc',cx:1000,cy:1000,rad:3}}),world:W({walls:allWalls.filter(([x,y])=>Math.max(Math.abs(x-25),Math.abs(y-25))<=5),eTierFrame:7})});
}
// ---- run every case in the VM ----
const bad=[];function safe(v,p){if(typeof v==='number'&&(!isFinite(v)||Object.is(v,-0)))bad.push(p+'='+(Object.is(v,-0)?'-0':v));else if(v&&typeof v==='object')for(const k of Object.keys(v))safe(v[k],p+'.'+k);}
function setup(c){
  const w=c.world;
  vm.runInContext('P={x:'+w.P.x+',y:'+w.P.y+',lv:1};OPT={diff:5};IS_MOBILE='+w.IS_MOBILE+';VW='+w.VW+';VH='+w.VH+';_mSfxPlaying='+w.mSfx+';_DEMO_MODE='+w.demoMode+';_DEMO_LAST_STAGE='+w.demoLast+';__log=[];__i=0;__ci=0;',ctx);
  ctx.__w=w;
  vm.runInContext(`G={stage:__w.stage,_stageDiffOff:0,cam:{x:__w.cam.x,y:__w.cam.y},mw:__w.mw,mh:__w.mh,rifts:JSON.parse(JSON.stringify(__w.rifts)),kills:__w.kills,map:[]};
   for(let y=0;y<__w.mh;y++){const row=new Array(__w.mw).fill(0);G.map.push(row);}for(const [x,y] of __w.walls)G.map[y][x]=1;
   if(__w.stageKills!==null)G._stageKills=__w.stageKills;if(__w.eTierFrame!==null)G._eTierFrame=__w.eTierFrame;if(__w.bonfire)G._bonfire=JSON.parse(JSON.stringify(__w.bonfire));
   window._parryLesson=__w.lesson?{active:true}:undefined;`,ctx);
  ctx.__seq=seqFor(c.seed,c.first);ctx.__rules=c.rules;ctx.__clock=c.clock;
  ctx.__ens=c.enemies.map(s=>{const o=JSON.parse(JSON.stringify(bases[s.base].obj));for(const [k,v] of Object.entries(s.over))o[k]=JSON.parse(JSON.stringify(v));return o;});
  vm.runInContext('ens=__ens;',ctx);
}
function snapshot(){return {ens:plain(vm.runInContext('ens',ctx)),world:plain(vm.runInContext('({kills:G.kills,stageKills:G._stageKills,eTierFrame:G._eTierFrame,bonfireT:G._bonfire?G._bonfire.t:undefined,mSfx:_mSfxPlaying})',ctx)),log:plain(vm.runInContext('__log',ctx)),consumed:vm.runInContext('__i',ctx),clockUsed:vm.runInContext('__ci',ctx)};}
function exec(c,variant){
  setup(c);const initial=plain(vm.runInContext('ens',ctx));let ret;
  if(c.kind==='U1'){ctx.__sp=c.sp;ret=plain(vm.runInContext(variant==='T'?'(function(){const r=__U1T(ens[0],__sp);return r===undefined?null:r;})()':'(function(){__U1(ens[0],__sp);return null;})()',ctx));}
  else{ctx.__sp=c.sp;vm.runInContext('__L1(__sp);',ctx);}
  return {initial,ret,...snapshot()};
}
for(const c of cases){
  const a=exec(c,'T');
  if(c.kind==='U1'){const b=exec(c,'plain');const j=x=>JSON.stringify({ens:x.ens,world:x.world,log:x.log,consumed:x.consumed,clockUsed:x.clockUsed});if(j(a)!==j(b))throw Error('U1 tail-marker variant changed behaviour in case '+c.name);}
  const diffs=a.ens.map((fin,i)=>{const ini=a.initial[i],d={};for(const k of new Set([...Object.keys(fin),...Object.keys(ini)])){if(JSON.stringify(fin[k])!==JSON.stringify(ini[k])){if(!(k in fin))throw Error('field deleted: '+k);d[k]=fin[k];}}return d;});
  safe(a.log,'log');safe(diffs,'diff');safe(a.world,'world');if(bad.length)throw Error('case '+c.name+': non-JSON-safe numbers '+bad.splice(0).join(','));
  c.expected={diffs,world:a.world,log:a.log,consumed:a.consumed,clockUsed:a.clockUsed};
  if(c.kind==='U1')c.expected.tail=a.ret===null?null:{d:a.ret.d};
  c.seq=ctx.__seq.slice(0,a.consumed+6);delete c.seed;delete c.first;
}
const sum={cases:cases.length,u1:cases.filter(c=>c.kind==='U1').length,l1:cases.filter(c=>c.kind==='L1').length,u1Early:cases.filter(c=>c.kind==='U1'&&c.expected.tail===null).length,u1Tail:cases.filter(c=>c.kind==='U1'&&c.expected.tail!==null).length,
  logEntries:cases.reduce((s,c)=>s+c.expected.log.length,0),randomDraws:cases.reduce((s,c)=>s+c.expected.consumed,0),enemies:cases.reduce((s,c)=>s+c.enemies.length,0)};
const callNames={};for(const c of cases)for(const l of c.expected.log)callNames[l[0]]=(callNames[l[0]]||0)+1;sum.injectedCalls=callNames;
const out={schema:'exoduser.unity.enemy-tick-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,head:headSha,anchors,
  wrappers:{U1,L1,U1T_extra:'return {tail:true,d:d};'},note:'blocks located by text anchors and executed unchanged in one Node VM; external pieces = recording stubs with deterministic rules, P/G/world values, Math.random sequence, performance.now clock'},
  tables,bases,summary:sum,cases};
fs.writeFileSync(outPath,JSON.stringify(out));
console.log(JSON.stringify({sha:fileSha,summary:sum,anchors:anchors.slice(-8).map(a=>a.name+':'+a.start+'-'+a.end)}));
