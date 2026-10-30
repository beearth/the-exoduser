// CX-04a enemy hurt-head oracle exporter: runs the ORIGINAL head of hurtE (function start .. the line before "// ═══ 데미지 → HP 직행 ═══") from game.html
// in a Node VM and writes oracle.json.
//   node export.cjs --source <committed game.html> --head <commit sha> [--expect-source-sha <sha256>] [--out oracle.json]
// Wrapper (the only text added around original lines):
//   "function __H1(e,dmg,ang,noSound,opts,atkEl=0){"  (original line 1 with the name changed)
//   + original lines 2 .. (anchor line - 1) unchanged
//   + "return {<top-level locals + the two reassigned parameters>};}finally{_shBufI--}}"
// A bare `return;` in the original leaves the function with `undefined` (early return); falling off the range returns the locals object.
// CX-04c1 adds H3a (the death head: `  if(e.hp<=0){` .. the line before "    // ═══ 지옥의 잔해 드롭 ═══"):
//   "function __H3a(e,ang,noSound,opts,__h){let {<the 22 CX-04b values>}=__h;" + original lines unchanged + "return {__cont:true,<block-level locals>};}return {__cont:false};}"
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
add(stmt('_HS','const _HS={'));add(single('_diffSigned','const _diffSigned='));add(single('_isSi0DruidSink','function _isSi0DruidSink('));add(stmt('_druidSinkStart','function _druidSinkStart('));
add(stmt('_druidFinaleReviveChance','function _druidFinaleReviveChance('));add(single('_r','function _r(v,s){'));add(single('_eMouthXY','function _eMouthXY('));
add(single('_TXT_BUDGET','const _TXT_BUDGET='));add(stmt('_poiseHit','function _poiseHit('));
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
// ---- the hurtE middle (CX-04b): from the anchor line itself to the line before the first `  if(e.hp<=0){` after it ----
const h2Start=hEnd;let h2End=-1;for(let i=h2Start+1;i<lines.length;i++)if(lines[i].startsWith('  if(e.hp<=0){')){h2End=i;break;}
if(h2End<0)throw Error('end anchor "  if(e.hp<=0){" not found after the start anchor');
const h2Lines=lines.slice(h2Start,h2End);
const braceDepth=ls=>{let depth=0,str=null;for(const l of ls){str=null;for(let i=0;i<l.length;i++){const c=l[i],n=l[i+1];if(str){if(c==='\\'){i++;continue;}if(c===str)str=null;continue;}if(c==='/'&&n==='/')break;if(c==="'"||c==='"'||c==='`'){str=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;}}return depth;};
if(braceDepth(h2Lines)!==0)throw Error('H2 range braces are not balanced: depth '+braceDepth(h2Lines));
const body2=record('H2 hurtE body (anchor line .. line before if(e.hp<=0){)',h2Start,h2End-1);
const locals2=[];{let depth=0,str=null;for(const l of h2Lines){const declHere=/^\s*(const|let)\s+([A-Za-z_]\w*)/.exec(l);if(depth===0&&declHere)locals2.push(declHere[2]);
  for(const m of l.matchAll(/\bvar\s+([A-Za-z_]\w*)/g))if(!locals2.includes(m[1]))locals2.push(m[1]);
  str=null;for(let i=0;i<l.length;i++){const c=l[i],n=l[i+1];if(str){if(c==='\\'){i++;continue;}if(c===str)str=null;continue;}if(c==='/'&&n==='/')break;if(c==="'"||c==='"'||c==='`'){str=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;}}}
const HEAD14=returned;// dmg,atkEl + the 12 head locals = the 14 values CX-04a hands over
const returned2=[...HEAD14,...locals2];
const H2='function __H2(e,ang,noSound,opts,__h){let {'+HEAD14.join(',')+'}=__h;\n'+body2+'\nreturn {'+returned2.join(',')+'};}';
if(!compiles(H2))throw Error('H2 wrapper does not compile');

// ---- the hurtE death head (CX-04c1): from the first `  if(e.hp<=0){` (= H2's end anchor) to the line before the drop section ----
const h3Start=h2End,h3End=find('    // ═══ 지옥의 잔해 드롭 ═══');
if(h3End<=h3Start)throw Error('H3a end anchor before start');
const h3Lines=lines.slice(h3Start,h3End);
if(braceDepth(h3Lines)!==1)throw Error('H3a range must leave the if-block open (depth 1), got '+braceDepth(h3Lines));
const body3=record('H3a hurtE death head ("  if(e.hp<=0){" .. line before the 잔해 드롭 anchor)',h3Start,h3End-1);
const locals3=[];{let depth=0,str=null;for(let li=0;li<h3Lines.length;li++){const l=h3Lines[li];const declHere=/^\s*(const|let)\s+([A-Za-z_]\w*)/.exec(l);if(depth===1&&declHere)locals3.push(declHere[2]);
  for(const m of l.matchAll(/\bvar\s+([A-Za-z_]\w*)/g))if(!locals3.includes(m[1]))locals3.push(m[1]);
  str=null;for(let i=0;i<l.length;i++){const c=l[i],n=l[i+1];if(str){if(c==='\\'){i++;continue;}if(c===str)str=null;continue;}if(c==='/'&&n==='/')break;if(c==="'"||c==='"'||c==='`'){str=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;}}}
const H3='function __H3a(e,ang,noSound,opts,__h){let {'+returned2.join(',')+'}=__h;\n'+body3+'\nreturn {__cont:true,'+locals3.join(',')+'};}return {__cont:false};}';
if(!compiles(H3))throw Error('H3a wrapper does not compile');
// ---- the hurtE death tail (CX-04c2): from the 잔해 드롭 anchor line to the line before the `  }` that closes `  if(e.hp<=0){` (the line before `  }finally{_shBufI--}`) ----
const h4Start=h3End;let h4Fin=-1;for(let i=h4Start+1;i<lines.length;i++)if(lines[i].startsWith('  }finally{_shBufI--}')){h4Fin=i;break;}
if(h4Fin<0)throw Error('H3b end anchor "  }finally{_shBufI--}" not found after the 잔해 드롭 anchor');
if(lines[h4Fin-1].trim()!=='}')throw Error('H3b: the line before the finally anchor must be the closing brace of if(e.hp<=0){');
const h4End=h4Fin-2,h4Lines=lines.slice(h4Start,h4End+1);
if(braceDepth(h4Lines)!==0)throw Error('H3b range braces are not balanced: depth '+braceDepth(h4Lines));
const body4=record('H3b hurtE death tail (잔해 드롭 anchor .. line before the brace closing if(e.hp<=0))',h4Start,h4End);
const H4='function __H3b(e,ang,noSound,opts,__h,__d){let {'+returned2.join(',')+'}=__h;let {'+locals3.join(',')+'}=__d;\n'+body4+'\n}';
if(!compiles(H4))throw Error('H3b wrapper does not compile');
add(stmt('SLOT_NAMES','const SLOT_NAMES='));add(stmt('POT','const POT={'));add(single('_maliceMul','function _maliceMul('));add(single('_SFX_PRI','const _SFX_PRI='));add(single('_playDruidSfx','function _playDruidSfx('));

// ---- VM ----
const ctx=vm.createContext({});
vm.runInContext(`var window=this;var _useGPU=false,_useGL=false,_ESPRITES=[];var P={},G={stage:0,_stageDiffOff:0},OPT={diff:5},_DEMO_MODE=false,_DEMO_LAST_STAGE=0,ens=[],PASSIVES={},INV={equipped:{}},_shBufI=0,_hitSfxCd=0,_now=0;
var __seq=[],__i=0,__log=[],__vals={},__aff={},__leq={},__ueq={};
Math.random=function(){if(__i>=__seq.length)throw new Error("random sequence exhausted");return __seq[__i++];};
function __ser(a){if(a===undefined||a===null)return null;if(typeof a==='object'){const i=ens.indexOf(a);if(i>=0)return {e:i};if(Array.isArray(a))throw new Error('array argument');
  return {o:Object.keys(a).sort().map(k=>[k,a[k]===undefined?null:(a[k]!==null&&typeof a[k]==='object'?__ser(a[k]):a[k])])};}return a;}
function __rec(name){const a=[];for(let i=1;i<arguments.length;i++)a.push(__ser(arguments[i]));__log.push([name].concat(a));}
var __canMv='open',__cmN=0;function canMv(x,y,r){__rec('canMv',x,y,r);__cmN++;if(__canMv==='blockAll')return false;if(__canMv.startsWith('first'))return __cmN>Number(__canMv.slice(5));if(__canMv.startsWith('only'))return __cmN!==Number(__canMv.slice(4));return true;}
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
function hurtE(e,d,a,ns,o,el){var r=['hurtE',e,d,a,ns,o];if(arguments.length>5)r.push(el);__rec.apply(null,r);}
function hurtP(d){__rec('hurtP',d);}
function _spawnBossProjectile(e,o){__rec('spawnBossProjectile',e,o);}
function addTxt(){__rec.apply(null,['addTxt'].concat(Array.prototype.slice.call(arguments)));}
function addParts(x,y,c,n){__rec('addParts',x,y,c,n);}
function shake(n){__rec('shake',n);}
function doHitFlash(c,a){__rec('doHitFlash',c,a);}
function playSample(k,v,p){__rec('playSample',k,v,p);}
function _hitSfxForEtype(et){__rec('hitSfxForEtype',et);return {key:'hit_'+et,pitch:1+et/1000};}
function _T(s){__rec('T',s);return s;}
function poolPart(){__rec.apply(null,['poolPart'].concat(Array.prototype.slice.call(arguments)));}
function _addImpact(x,y,el,a,t,ib,nf){__rec('addImpact',x,y,el,a,t,ib,nf);}
function _addBoom(x,y,r,d,c){__rec('addBoom',x,y,r,d,c);}
function _tickSkyCrusherRecharge(f){__rec('tickSkyCrusherRecharge',f);}
var _dpsDmg=0,_txtPerFrame=0,_impPerFrame=0,_uqScCtx,_uqS,VW=1600,VH=900;
var SFX={block:function(){__rec('sfxBlock');},groggy:function(){__rec('sfxGroggy');}};`,ctx);
vm.runInContext(`
var projs=[];function _recycleProj(){}
var pProjs=[],_shDirty=false,_harpGauge=0,_HARP_GAUGE_MAX=0,_uqHitCtx=null,_uqFzCtx=null,__w3=null;
function hurtP(){__rec.apply(null,['hurtP'].concat(Array.prototype.slice.call(arguments)));}
function atkTicketRelease(e){__rec('atkTicketRelease',e);}
function _regKill(e){__rec('regKill',e);}
function _petOnKill(e){__rec('petOnKill',e);}
function _reviveVFX(x,y,c,l,o){__rec('reviveVFX',x,y,c,l,o);}
function playVFXAng(k,x,y,sc,a,b,f){__rec('playVFXAng',k,x,y,sc,a,b,f);}
function _addBlastLight(x,y,r,t,cr,cg,cb){__rec('addBlastLight',x,y,r,t,cr,cg,cb);}
function _addTpBolt(a,b,c,d,w,col){__rec('addTpBolt',a,b,c,d,w,col);}
function deathFX(x,y,r,col,ib,burn,et,kind){__rec('deathFX',x,y,r,col,ib,burn,et,kind);}
function _spawnLargeMonsterDeathFx(e,a){__rec('spawnLargeDeathFx',e,a);}
function _addCorpse(e,a,p){__rec('addCorpse',e,a,p);}
function _addBurnCorpse(e){__rec('addBurnCorpse',e);}
function _addGorePiece(x,y,k){__rec('addGorePiece',x,y,k);}
function _addDeathImpact(x,y,r){__rec('addDeathImpact',x,y,r);}
function _getPProj(){__rec('getPProj');return {};}
function _L(ko,en){__rec('L',ko,en);return ko;}
function _rageMax(){__rec('rageMax');return __w3.rageMax;}
function buildMapCache(){__rec('buildMapCache');}
SFX.victory=function(){__rec('sfxVictory');};
var _critSfxCd=0,__w4=null,__itemN=0;function _bossLine(k){__rec('bossLine',k);}
function _wiPush(o){__rec('wiPush',o);}
function magicRef(){__rec('magicRef');return __w4.magicRef;}function statInt(){__rec('statInt');return __w4.statInt;}function pMagicMul(){__rec('pMagicMul');return __w4.pMagicMul;}function _skMul(id){__rec('skMul',id);return __w4.skMul;}
function eProjAt(e,a,s,m,el,l,c,z){__rec('eProjAt',e,a,s,m,el,l,c,z);}
function mkItem(s,t,el,r){__rec('mkItem',s,t,el,r);return {stubItem:++__itemN,slot:s,tier:t,el:el,rarity:r};}
function addPotion(t,n){__rec('addPotion',t,n);return __w4.addPotionOk;}
function rollDrop(e){__rec('rollDrop',e);}function addExp(){__rec.apply(null,['addExp'].concat(Array.prototype.slice.call(arguments)));}function checkRooms(){__rec('checkRooms');}function dbSaveNow(){__rec('dbSaveNow');}
SFX.explode=function(){__rec('sfxExplode');};SFX.magicHit=function(){__rec('sfxMagicHit');};SFX.pickup=function(){__rec('sfxPickup');};
`,ctx);
for(const b of blocks)vm.runInContext(b,ctx);
vm.runInContext('var __mkEnOrig=mkEn;mkEn=function(x,y,si,et,ib,el,room){__rec("mkEn",x,y,si,et,ib,el,room);return __mkEnOrig.apply(this,arguments);};',ctx);
vm.runInContext(H1,ctx);vm.runInContext(H2,ctx);vm.runInContext(H3,ctx);vm.runInContext(H4,ctx);
// numbers JSON cannot carry are recorded as tags so nothing is silently turned into null: {"$n":"NaN"} {"$n":"Infinity"} {"$n":"-Infinity"} {"$n":"-0"}
const numTag=v=>Number.isNaN(v)?{$n:'NaN'}:v===Infinity?{$n:'Infinity'}:v===-Infinity?{$n:'-Infinity'}:Object.is(v,-0)?{$n:'-0'}:v;
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?Array.from(v):typeof v==='number'?numTag(v):v));
const get=n=>plain(vm.runInContext(n,ctx));
const tables={POT:get('POT'),ELC:get('ELC'),ELP:get('ELP'),EL:get('EL'),UNDEAD_ET:get('Array.from(_UNDEAD_ET).sort((a,b)=>a-b)')};

// ---- PRNG + base enemies ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const seqFor=(seed,first)=>{const r=mulberry32(seed),a=[...(first||[])];while(a.length<400)a.push(r());return a;};
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
const defWorld=()=>({P:{x:1000,y:1000,hp:500,mhp:1000,mp:50,mmp:100,iframes:0,eShield:0,eShieldMax:0,st:30,mst:100,s:'idle'},sStats:{crits:0,dmgDealt:0,maxHit:0},playTime:1000,PASSIVES:{},equipped:{},hitSfxCd:0,shBufI:0,now:12345,btLog:null,lesson:false});
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
// ===== CX-04b: cases for the hurtE middle (H2: HP application .. poise) and chain cases (H1 real return -> H2) =====
const h1Snapshot=cases.slice();
const defW2=()=>({optParts:100,VW:1600,VH:900,dpsDmg:0,txtPerFrame:0,impPerFrame:0,cam:{x:1000,y:1000},hitStop:0,slowMo:0,noHitStopT:null,dmgPeak:null,dmgPeakShow:null,uqScCtx:null,uqS:{},canMv:'open'});
const W2=o=>({...defW2(),...o});
const H=o=>({dmg:100,atkEl:0,_shBlocked:false,kbM:1,psM:1,_isPure:false,_cbAf:0,_cbPas:0,_isRageSk:false,_isCrit:false,...o});
const e0=o=>({x:1050,y:1000,...o});
function h2(name,o){const a={ang:0.5,noSound:false,opts:null,...(o.args||{})};const rest={...o};delete rest.args;
  cases.push({kind:'H2',name:'H2 '+name,base:'etype0',over:e0({}),args:a,head:H({}),world:defWorld(),w2:defW2(),vals:defVals(),aff:{},leq:{},ueq:{},others:[],seed:cases.length+1,first:[0.9],...rest});}
const near=(n,x0,dx)=>Array.from({length:n},(_,i)=>other('etype0',{x:x0+i*(dx||5),y:1000}));
// --- HP application / stats / 5s peak ---
h2('dmg 0 (shield took everything)',{head:H({dmg:0})});h2('dmg 1',{head:H({dmg:1})});h2('dmg larger than hp (negative hp stays)',{over:e0({hp:50}),head:H({dmg:100})});
h2('no G._sStats',{world:W({sStats:null})});h2('stats accumulate',{world:W({sStats:{crits:2,dmgDealt:10,maxHit:50}})});h2('stats maxHit kept',{world:W({sStats:{crits:2,dmgDealt:10,maxHit:500}})});h2('stats maxHit equal',{world:W({sStats:{crits:0,dmgDealt:0,maxHit:100}})});
for(const [pk,t] of [[null,'none'],[{val:50,t:10},'lower'],[{val:100,t:10},'equal'],[{val:200,t:10},'higher']])h2('dmgPeak '+t,{w2:W2({dmgPeak:pk})});
h2('dpsDmg accumulates',{w2:W2({dpsDmg:5.5})});
// --- leech ---
for(const [k,v] of [['lifeLeech',0.1],['manaLeech',0.2],['stLeech',0.3],['lifeOnHit',7]])h2('leech '+k,{aff:{[k]:v}});
h2('lifeLeech capped by mhp',{aff:{lifeLeech:0.5},world:WP({hp:990,mhp:1000})});h2('manaLeech capped',{aff:{manaLeech:0.5},world:WP({mp:95,mmp:100})});h2('stLeech capped',{aff:{stLeech:0.5},world:WP({st:95,mst:100})});h2('lifeOnHit capped',{aff:{lifeOnHit:50},world:WP({hp:990,mhp:1000})});
for(const hp of [350,351,349.9])h2('injuredLeech hp '+hp,{aff:{injuredLeech:0.2,lifeLeech:0.05},world:WP({hp,mhp:1000})});
h2('leech skipped for dot',{head:H({isDot:true}),aff:{lifeLeech:0.5,manaLeech:0.5,stLeech:0.5,lifeOnHit:9}});
for(const [b,bt] of [[1,0],[0,5],[0,0]])h2('uAxeLeech bleed '+b+' bleedT '+bt,{over:e0({bleed:b,bleedT:bt}),ueq:{_uAxeLeech:0.3}});
h2('uAxeLeech value 0',{over:e0({bleed:1}),ueq:{}});
// --- onHit status ---
const OH=[['fireOnHit',{burnT:50,burnPool:5}],['iceOnHit',{_freezeGauge:20}],['lightOnHit',{_shockT:50,_shockMul:0.5}],['darkOnHit',{_cursed:50}],['poisonOnHit',{poisonT:50,poisonPool:5}],['onHitBleed',{bleedT:50,bleedPool:5}],['onHitStun',{stunned:100}],['onHitFreeze',{_freezeGauge:60}]];
for(const [k,ov] of OH)for(const r of [0.4999999,0.5,0.5000001])h2('onHit '+k+' roll '+r,{aff:{[k]:0.5},first:[r],over:e0(ov)});
for(const k of OH.map(x=>x[0]))h2('onHit '+k+' fresh target (fields undefined)',{aff:{[k]:1},first:[0.1]});
h2('iceOnHit reaches 100',{aff:{iceOnHit:1},first:[0.1],over:e0({_freezeGauge:75})});h2('iceOnHit reaches 100 but immune',{aff:{iceOnHit:1},first:[0.1],over:e0({_freezeGauge:75,_freezeImmune:true})});
h2('onHitFreeze reaches 100',{aff:{onHitFreeze:1},first:[0.1],over:e0({_freezeGauge:50})});h2('onHitFreeze below 100',{aff:{onHitFreeze:1},first:[0.1],over:e0({_freezeGauge:49})});
h2('onHitStun cap 180',{aff:{onHitStun:1},first:[0.1],over:e0({stunned:170})});h2('onHitStun keeps larger',{aff:{onHitStun:1},first:[0.1],over:e0({stunned:120})});
h2('onHit all eight (draw order)',{aff:{fireOnHit:1,iceOnHit:1,lightOnHit:1,darkOnHit:1,poisonOnHit:1,onHitBleed:1,onHitStun:1,onHitFreeze:1},first:[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8]});
h2('onHit skipped for dot',{head:H({isDot:true}),aff:{fireOnHit:1,iceOnHit:1,darkOnHit:1},first:[0.1]});
// --- alerted / counter switch ---
for(const [s,st2,ib,dot] of [['recover',9,false,false],['idle',9,false,false],['idle',3,false,false],['idle',5,false,false],['windup',9,false,false],['recover',9,true,false],['idle',9,true,false],['recover',9,false,true],['idle',9,false,true]])
  h2('counter switch '+s+' st2 '+st2+(ib?' boss':'')+(dot?' dot':''),{base:ib?'boss si0':'etype0',over:e0({s,st2}),head:H(dot?{isDot:true}:{})});
// --- damage text peak + quiet options ---
for(const q of ['bladeShard','maliceHunt','iceBlade','beam','dot','ltnChaser','lightning'])h2('quiet opt '+q,{args:{opts:{[q]:true}},head:H(q==='dot'?{isDot:true}:{})});
h2('dmgPeakShow none, crit',{head:H({_isCrit:true})});h2('dmgPeakShow lower',{w2:W2({dmgPeakShow:{x:1,y:2,dmg:50,crit:false}})});h2('dmgPeakShow higher kept',{w2:W2({dmgPeakShow:{x:1,y:2,dmg:500,crit:true}})});h2('dmgPeakShow equal kept',{w2:W2({dmgPeakShow:{x:1,y:2,dmg:100,crit:false}})});
h2('dmgPeakShow skipped during whirlwind',{world:WP({s:'whirlwind'})});
// --- whirlwind blood ---
for(const [parts,ang,dmg] of [[100,0.5,100],[100,0.5,1000],[100,0.5,1],[40,0.5,100],[39,0.5,100],[0,0.5,100],[100,undefined,100],[60,2.5,350]])h2('whirlwind blood parts '+parts+' ang '+ang+' dmg '+dmg,{world:WP({s:'whirlwind'}),w2:W2({optParts:parts}),args:{ang},head:H({dmg})});
h2('whirlwind detonate falls to normal path',{world:WP({s:'whirlwind'}),args:{opts:{detonate:true}}});
// --- normal blood splash / flash / stun / hit-stop / impact ---
for(const [parts,dmg,ang] of [[100,1,0.5],[100,30,0.5],[100,200,0.5],[100,1000,0.5],[50,100,0.5],[0,100,0.5],[100,100,undefined],[25,555,-1.2]])h2('blood splash parts '+parts+' dmg '+dmg+' ang '+ang,{w2:W2({optParts:parts}),args:{ang},head:H({dmg})});
for(const t of [10,11,12,13,20])h2('txtPerFrame '+t,{w2:W2({txtPerFrame:t})});
h2('hitStun idle normal',{over:e0({s:'idle'})});h2('hitStun idle elite',{over:e0({s:'idle',elite:2})});h2('hitStun idle boss none',{base:'boss si0',over:e0({s:'idle'})});h2('hitStun non-idle',{over:e0({s:'windup'})});
for(const [nh,nm] of [[null,'undefined'],[0,'0'],[30,'30']])h2('noHitStopT '+nm,{w2:W2({noHitStopT:nh,hitStop:2})});
h2('hitStop already higher',{w2:W2({hitStop:9})});
for(const ip of [0,3,4,12,13])h2('impPerFrame '+ip,{w2:W2({impPerFrame:ip})});
h2('impact skipped for magic',{head:H({_isMagicDmg:true})});h2('impact skipped noImpact',{args:{opts:{noImpact:true}}});h2('impact explosion',{args:{opts:{explode:true}}});h2('impact explosion impPerFrame 4 (no boom)',{args:{opts:{explode:true}},w2:W2({impPerFrame:4})});h2('impact explosion boss',{base:'boss si0',args:{opts:{explode:true}}});h2('impact ang undefined',{args:{ang:undefined}});
// --- onHit DoT affixes ---
for(const stk of [undefined,0,8,9,10])h2('poisonDot stk '+stk,{aff:{poisonDot:1},over:e0({poisonStk:stk,_poisonPool:3,poisonT:10}),vals:V({pDotPool:1.3})});
for(const stk of [undefined,0,9,10])h2('fireDot stk '+stk,{aff:{fireDot:1},over:e0({burnStk:stk,_burnPool:3,burnT:20}),vals:V({pDotPool:1.3})});
h2('iceDot',{aff:{iceDot:5}});h2('iceDot boss excluded',{base:'boss si0',aff:{iceDot:5}});h2('iceDot existing timer (no text)',{aff:{iceDot:5},over:e0({_iceDotT:30})});h2('iceDot timer keeps larger',{aff:{iceDot:1},over:e0({_iceDotT:500})});h2('iceDot text budget used up',{aff:{iceDot:5},w2:W2({txtPerFrame:12})});h2('iceDot text budget 10 (text allowed)',{aff:{iceDot:5},w2:W2({txtPerFrame:10})});
h2('onHit DoT skipped for dot',{head:H({isDot:true}),aff:{poisonDot:1,fireDot:1,iceDot:5,lightChain:50,darkCurse:1,chainTarget:2},others:near(2,1060),first:[0.1]});
for(const n of [0,1,2,3])h2('lightChain with '+n+' neighbours',{aff:{lightChain:50.7},others:near(n,1060)});
h2('lightChain skips dead and far',{aff:{lightChain:50},others:[other('etype0',{x:1060,y:1000,alive:false}),other('etype0',{x:1500,y:1000}),other('etype0',{x:1070,y:1000})]});h2('lightChain 0.9 truncates to 0',{aff:{lightChain:0.9},others:near(1,1060)});h2('lightChain radius edge 120/121',{aff:{lightChain:50},others:[other('etype0',{x:1170,y:1000}),other('etype0',{x:1171.5,y:1000})]});
for(const r of [0.2999999,0.3,0.3000001])h2('darkCurse roll '+r,{aff:{darkCurse:0.3},first:[r]});
for(const n of [1,2,3])h2('chainTarget '+n,{aff:{chainTarget:n+0.9},others:near(3,1060),head:H({atkEl:2})});
h2('chainTarget skips dead and far',{aff:{chainTarget:2},others:[other('etype0',{x:1060,y:1000,alive:false}),other('etype0',{x:1500,y:1000}),other('etype0',{x:1070,y:1000})],head:H({dmg:55})});
// --- freeze gauge ---
const FZ=(name,o)=>{o=o||{};const rest={...o};delete rest.head;h2('freeze '+name,{head:H({atkEl:2,...(o.head||{})}),...rest});};
FZ('basic',{});h2('freeze not for atkEl 1',{head:H({atkEl:1})});FZ('frozen already',{over:e0({_frozen:5})});FZ('frozen negative still accumulates',{over:e0({_frozen:-5})});FZ('frozen immune',{over:e0({_frozenImmune:5})});
FZ('boss max 500 and 30%',{base:'boss si0',head:{dmg:1000}});FZ('iceResDown x1.5',{over:e0({_iceResDown:10})});FZ('iceShardRes 0.3',{over:e0({_iceShardRes:0.3})});
FZ('reaches max exactly',{over:e0({_freezeMax:100,_freezeGauge:50}),head:{dmg:50}});FZ('just below max',{over:e0({_freezeMax:100,_freezeGauge:49.5}),head:{dmg:50}});FZ('existing max 200',{over:e0({_freezeMax:200,_freezeGauge:10})});
FZ('reach max, text budget used up',{over:e0({_freezeMax:100,_freezeGauge:90}),w2:W2({txtPerFrame:12})});FZ('freezeMax 0 treated as unset',{over:e0({_freezeMax:0})});FZ('gauge 0 reset',{over:e0({_freezeGauge:0})});
// --- knockback ---
h2('kb basic',{});h2('kb ang undefined',{args:{ang:undefined}});
for(const [n,o] of [['beam',{beam:true}],['maxDist 300',{maxDist:300}],['maxDist 0 (defined)',{maxDist:0}],['maxDist + magic (not ranged)',{maxDist:300,magic:true}],['bladeShard',{bladeShard:true}],['bladeOrb',{bladeOrb:true}],['normalBow',{normalBow:true}],['maliceHunt',{maliceHunt:true}],['mhBlade',{mhBlade:true}],['blueBean',{blueBean:true}],['noKB',{noKB:true}],['magic x0.2',{magic:true}]])h2('kb flag '+n,{args:{opts:o}});
h2('kb lightning element (ranged)',{head:H({atkEl:4})});h2('kb dot',{args:{opts:{dot:true}},head:H({isDot:true})});h2('kb boss 0.05',{base:'boss si0'});h2('kb cap 15',{head:H({dmg:1000})});h2('kb kbM 0',{head:H({kbM:0})});h2('kb kbM 2',{head:H({kbM:2})});
for(const [n,lv,opts,base,dmg,cm] of [['club wall hit',2,null,'etype0',100,'blockAll'],['club open',2,null,'etype0',100,'open'],['club wall but _lClubWall',2,{_lClubWall:true},'etype0',100,'blockAll'],['club boss',2,null,'boss si0',100,'blockAll'],['club tiny (amt<=2)',2,null,'etype0',4,'blockAll'],['club amt exactly 2',1,null,'etype0',8,'blockAll'],['club factor 0.5',0.5,null,'etype0',100,'open']])
  h2('kb '+n,{leq:{_lClubKB:lv},args:{opts},base,head:H({dmg}),w2:W2({canMv:cm})});
h2('kb far from camera, canMv open',{w2:W2({cam:{x:5000,y:5000}})});h2('kb far from camera, canMv blocked',{w2:W2({cam:{x:5000,y:5000},canMv:'blockAll'})});h2('kb far but hurt>0',{w2:W2({cam:{x:5000,y:5000}}),over:e0({hurt:3})});h2('kb far boss',{base:'boss si0',w2:W2({cam:{x:5000,y:5000}})});
for(const dx of [1099.5,1100,1100.5])h2('kb view edge dx '+dx,{over:e0({x:1000+dx}),w2:W2({cam:{x:1000,y:1000}}),args:{ang:0.3}});
// --- poise ---
const POI={poiseHit:true};
h2('poise: no poiseHit',{over:e0({poise:500,maxPoise:500})});
for(const p of [500,101,100,99.5,100.5])h2('poise: poise '+p+' amt 100',{args:{opts:POI},over:e0({poise:p,maxPoise:500,poiseR:30})});
h2('poise: dot excluded',{args:{opts:{poiseHit:true,dot:true}},head:H({isDot:true}),over:e0({poise:50,maxPoise:500})});
h2('poise: boss immune',{base:'boss si0',args:{opts:POI},over:e0({poise:50,maxPoise:500,_pImmune:10})});
h2('poise: boss atkEl 0 x0.5',{base:'boss si0',args:{opts:POI},over:e0({poise:30,maxPoise:500,_pImmune:0})});h2('poise: boss atkEl 1 x0.2',{base:'boss si0',args:{opts:POI},head:H({atkEl:1}),over:e0({poise:10,maxPoise:500})});h2('poise: boss collapse',{base:'boss si0',args:{opts:POI},over:e0({poise:50,maxPoise:500})});
h2('poise: staggerBns',{args:{opts:POI},aff:{staggerBns:7.9},over:e0({poise:107,maxPoise:500})});h2('poise: psM 2',{args:{opts:POI},head:H({psM:2}),over:e0({poise:150,maxPoise:500})});h2('poise: dmg 0',{args:{opts:POI},head:H({dmg:0}),over:e0({poise:50,maxPoise:500})});h2('poise: amt truncates to 0',{args:{opts:POI},head:H({dmg:1,psM:0.4}),over:e0({poise:50,maxPoise:500})});
const COL=o=>({args:{opts:POI},over:e0({poise:50,maxPoise:500}),...o});
h2('poise collapse: stunned larger kept',COL({over:e0({poise:50,maxPoise:500,stunned:250,_maxStunned:300})}));h2('poise collapse: noHitStopT active',COL({w2:W2({noHitStopT:20,slowMo:3})}));h2('poise collapse: slowMo set',COL({}));
for(const n of [0,1,2])h2('poise collapse: staggerExplosion with '+n+' neighbours',COL({aff:{staggerExplosion:0.5},others:near(n,1060)}));
h2('poise collapse: staggerExplosion skips dead/far',COL({aff:{staggerExplosion:0.5},others:[other('etype0',{x:1060,y:1000,alive:false}),other('etype0',{x:1500,y:1000}),other('etype0',{x:1080,y:1000})]}));
for(const [hm,mc,t] of [[1.2,0,'hammer'],[0,1.0,'mace'],[1.2,1.0,'both'],[0.5,1.5,'both mace bigger']])h2('poise collapse: '+t+' shockwave',COL({leq:{_lHammerShock:hm,_lMaceShock:mc},others:near(2,1070,10),vals:V({meleeRef:77.7,statStr:1.1,pAtkMul:1.2})}));
h2('poise collapse: shockwave no neighbours',COL({leq:{_lHammerShock:1},others:[]}));h2('poise collapse: shockwave floor 1',COL({leq:{_lHammerShock:0.001},others:near(1,1070),vals:V({meleeRef:0.5})}));
h2('poise collapse: sky crusher refund',COL({ueq:{_uSkyPoiseRefund:2},w2:W2({uqScCtx:{}})}));h2('poise collapse: sky crusher already refunded',COL({ueq:{_uSkyPoiseRefund:2},w2:W2({uqScCtx:{_uqRef:true}})}));h2('poise collapse: no sky crusher context',COL({ueq:{_uSkyPoiseRefund:2},w2:W2({uqScCtx:null})}));h2('poise collapse: refund value 0',COL({ueq:{},w2:W2({uqScCtx:{}})}));
h2('poise collapse: poise orb fracture',COL({ueq:{_uPoiseOrbFracture:1}}));
// --- H2 seeded fuzz ---
const fh=mulberry32(909);const ph=a=>a[Math.floor(fh()*a.length)];const rh=(a,b)=>a+fh()*(b-a);
const H2OPT=[['dot',true],['poiseHit',true],['noKB',true],['detonate',true],['noImpact',true],['blueBean',true],['maliceHunt',true],['mhBlade',true],['bladeShard',true],['bladeOrb',true],['normalBow',true],['iceBlade',true],['lightning',true],['ltnChaser',true],['beam',true],['explode',true],['magic',true],['maxDist',250],['_lClubWall',true]];
const AFF2=['lifeLeech','injuredLeech','manaLeech','stLeech','lifeOnHit','fireOnHit','iceOnHit','lightOnHit','darkOnHit','poisonOnHit','onHitBleed','onHitStun','onHitFreeze','poisonDot','fireDot','iceDot','lightChain','darkCurse','chainTarget','staggerBns','staggerExplosion'];
for(let i=0;i<500;i++){
  const base=ph(bases).name;const opts=fh()<0.2?null:Object.fromEntries(H2OPT.filter(()=>fh()<0.18));
  const over=e0({x:1000+rh(-300,300),y:1000+rh(-300,300),hp:ph([1000,200,50]),mhp:1000,poise:ph([10,100,500]),maxPoise:500,stunned:ph([0,0,40]),s:ph(['idle','recover','windup']),st2:ph([3,9]),elite:ph([0,0,2]),
    _freezeGauge:ph([undefined,0,60,95]),_freezeMax:ph([undefined,100,200]),_frozen:ph([undefined,0,5]),_frozenImmune:ph([undefined,0,5]),_iceResDown:ph([undefined,0,4]),_iceShardRes:ph([undefined,0,0.3]),_iceDotT:ph([undefined,0,30]),_pImmune:ph([undefined,0,10]),hurt:ph([undefined,0,2]),
    poisonStk:ph([0,9,10]),burnStk:ph([0,9,10]),_freezeImmune:ph([undefined,true]),bleed:ph([0,1]),bleedT:ph([0,50])});
  const aff={};for(const k of AFF2)if(fh()<0.25)aff[k]=ph([0.2,0.5,1,3,50]);
  const w=W({P:{x:1000,y:1000,hp:ph([100,300,990,1000]),mhp:1000,mp:ph([10,95]),mmp:100,iframes:0,eShield:0,eShieldMax:0,st:ph([10,95]),mst:100,s:ph(['idle','whirlwind'])},sStats:fh()<0.8?{crits:0,dmgDealt:ph([0,5]),maxHit:ph([0,500])}:null});
  const w2=W2({optParts:ph([0,39,40,100]),txtPerFrame:ph([0,10,11,12,13]),impPerFrame:ph([0,3,4,12]),cam:ph([{x:1000,y:1000},{x:5000,y:5000}]),hitStop:ph([0,9]),noHitStopT:ph([null,0,20]),dmgPeak:ph([null,{val:50,t:5},{val:5000,t:5}]),dmgPeakShow:ph([null,{x:1,y:1,dmg:50,crit:false},{x:1,y:1,dmg:5000,crit:true}]),uqScCtx:ph([null,{},{_uqRef:true}]),canMv:ph(['open','blockAll']),dpsDmg:ph([0,3.5])});
  const head=H({dmg:ph([0,1,5.5,100,777,4000]),atkEl:ph([0,0,1,2,3,4]),kbM:ph([1,1,0,2]),psM:ph([1,1,0.5,3]),_shBlocked:ph([false,false,true]),_isCrit:fh()<0.3,isDot:opts&&opts.dot?true:ph([undefined,undefined,false]),_isMagicDmg:ph([undefined,false,true])});
  const leq={};for(const k of ['_lClubKB','_lHammerShock','_lMaceShock'])if(fh()<0.25)leq[k]=ph([0.5,1,2]);
  const ueq={};if(fh()<0.2)ueq._uAxeLeech=0.3;if(fh()<0.2)ueq._uSkyPoiseRefund=2;if(fh()<0.2)ueq._uPoiseOrbFracture=1;
  const others=Array.from({length:Math.floor(fh()*4)},()=>other(ph(bases).name,{x:1000+rh(-150,150),y:1000+rh(-150,150),alive:fh()<0.9}));
  h2('fuzz #'+i,{base,over,args:{ang:ph([undefined,0,1.2,-2.5,7]),noSound:fh()<0.3,opts},head,world:w,w2,aff,leq,ueq,others,vals:V({pDotPool:ph([1,1.4]),meleeRef:ph([5,100.5]),statStr:ph([1,1.2]),pAtkMul:ph([1,1.3])}),seed:950000+i,first:[ph([0.01,0.3,0.5,0.9]),ph([0.01,0.5,0.99])]});
}
// --- targeted cases added after the first mutation pass (each kills a mutant the grid let survive) ---
h2('onHitStun above the 180 cap',{aff:{onHitStun:1},first:[0.1],over:e0({stunned:200})});
h2('kb club on a boss with a big factor (wall probe skipped for bosses)',{leq:{_lClubKB:10},base:'boss si0',head:H({dmg:500}),w2:W2({canMv:'blockAll'})});
h2('kb club wall hit on a dead target (no wall text)',{leq:{_lClubKB:2},over:e0({alive:false}),w2:W2({canMv:'blockAll'})});
h2('poise: amt truncates to 0 resets nothing but is a no-op (poiseR kept)',{args:{opts:POI},head:H({dmg:1,psM:0.4}),over:e0({poise:50,maxPoise:500,poiseR:30})});
h2('poise: dmg 0 keeps poiseR',{args:{opts:POI},head:H({dmg:0}),over:e0({poise:50,maxPoise:500,poiseR:30})});
h2('stLeech with undefined stamina (Math.min with NaN)',{aff:{stLeech:0.5},world:WP({st:undefined,mst:100})});
h2('stLeech with undefined max stamina (NaN)',{aff:{stLeech:0.5},world:WP({st:50,mst:undefined})});
h2('stLeech both defined (control)',{aff:{stLeech:0.5},world:WP({st:50,mst:100})});
// --- chain cases: every H1 case also runs H2 with its REAL return value (cases whose H1 returns early are dropped at run time) ---
const fc=mulberry32(31337);const pc=a=>a[Math.floor(fc()*a.length)];
h1Snapshot.forEach((c0)=>{const c=JSON.parse(JSON.stringify(c0));
  c.kind='CH';c.name='CH '+c0.name;c.seed=c0.seed;c.first=c0.first;
  c.w2=W2({optParts:pc([100,100,50,0]),txtPerFrame:pc([0,0,11,12]),impPerFrame:pc([0,3,4,12]),hitStop:pc([0,0,9]),noHitStopT:pc([null,null,20]),cam:pc([{x:1000,y:1000},{x:1000,y:1000},{x:5000,y:5000}]),canMv:pc(['open','blockAll']),uqScCtx:pc([null,{}]),dpsDmg:pc([0,2])});
  c.world.P={...c.world.P,s:pc(['idle','idle','whirlwind'])};
  for(const k of ['lifeLeech','manaLeech','stLeech','lifeOnHit','fireOnHit','poisonDot','fireDot','iceDot','lightChain','darkCurse','chainTarget','staggerBns','staggerExplosion'])if(fc()<0.12)c.aff[k]=pc([0.3,1,3]);
  if(fc()<0.4){const base=c.args.opts||{};c.args.opts={...base};for(const [k,v] of [['poiseHit',true],['noKB',true],['detonate',true],['noImpact',true],['blueBean',true],['maliceHunt',true],['bladeShard',true],['normalBow',true],['lightning',true]])if(fc()<0.15)c.args.opts[k]=v;}
  if(fc()<0.2)c.leq={...c.leq,_lClubKB:pc([1,2])};
  cases.push(c);});
// ===== CX-04c1: cases for the hurtE death head (H3a) and chain cases (H1 -> H2 -> H3a, "CH3") =====
const defW4=()=>({mats:100,chainCnt:0,chainT:0,rifts:[],critSfxCd:0,magicRef:200,statInt:1,pMagicMul:1.5,skMul:2,addPotionOk:true});const W4=o=>({...defW4(),...o});
const defW3=()=>({stage:0,demoMode:false,demoLast:0,diff:5,optHitStop:100,killedBosses:null,fireZones:null,spawnHoles:[{alive:3},{alive:1},{}],kills:10,stageKills:3,combo:5,comboTimer:100,comboMax:7,gateGuard:true,gateGuardKilled:false,bossGateOpen:false,chromaT:null,blDeathSndQ:null,uqZoneQ:null,shDirty:false,harpGauge:10,harpMax:100,uqHitCtx:null,uqFzCtx:null,rageMax:100});
const W3=o=>({...defW3(),...o});
const P3=o=>({x:1000,y:1000,hp:500,mhp:1000,mp:50,mmp:100,iframes:0,eShield:0,eShieldMax:0,st:30,mst:100,s:'idle',lv:100,facing:0.5,rage:10,shield:5,mshield:50,kb:{x:0,y:0},...o});
const WD=o=>({...defWorld(),P:P3(o||{})});               // death-head world: player with the extra fields
const B22=o=>({dmg:100,atkEl:0,_shBlocked:false,kbM:1,psM:1,_isPure:false,_cbAf:0,_cbPas:0,_isRageSk:false,_isCrit:false,isBoss:false,finalKbM:1,_isRanged:false,_kbScale:1,...o});
const ed=o=>({x:1050,y:1000,hp:-10,...o});               // a dead target
const R72=Array(72).fill(0.5);
// first-draw lists. Boss revive success: [revive roll, tp angle, pitch, 72 particle draws, companion roll, companion index, angle, distance]
const FREV=(rev,comp,idx)=>[rev,0.5,0.5,...R72,comp===undefined?0.9:comp,idx===undefined?0.1:idx,0.3,0.4];
const BOSS='boss si0',BOSS3='boss si3';
function h3(name,o){const a={ang:0.5,noSound:false,opts:null,...(o.args||{})};const rest={...o};delete rest.args;
  cases.push({kind:'H3',name:'H3 '+name,base:'etype0',over:ed({}),args:a,head3:B22({}),world:WD({}),w2:defW2(),w3:defW3(),vals:defVals(),aff:{},leq:{},ueq:{},others:[],seed:cases.length+1,first:[0.9],...rest});}
const bo=o=>ed({_revPts:100,_maxRevPts:150,...o});         // dead boss override
// --- gate ---
h3('hp 1 (not dead)',{over:ed({hp:1})});h3('hp 0 (dead)',{over:ed({hp:0})});h3('hp -0.5',{over:ed({hp:-0.5})});h3('hp 0.0001 (not dead)',{over:ed({hp:0.0001})});
// --- decoy ---
h3('decoy',{over:ed({_isDecoy:true})});h3('decoy with boss flag and etype 87',{base:BOSS,over:bo({_isDecoy:true,etype:87})});h3('decoy without stage kills',{over:ed({_isDecoy:true}),w3:W3({stageKills:null})});h3('decoy kills 0',{over:ed({_isDecoy:true}),w3:W3({kills:0,stageKills:0})});
// --- 87 doppelganger ---
for(const [mhp,rv] of [[1001,false],[1000,false],[1,false],[0.5,false],[1000,true]])h3('87 doppelganger mhp '+mhp+' revived '+rv,{over:ed({etype:87,mhp,_dgRevived:rv,eShield:50,eShieldMax:80,stunned:9,s:'windup',st2:5})});
h3('87 boss form skips doppelganger? (boss etype 87)',{base:BOSS,over:bo({etype:87}),first:FREV(0.01)});
// --- boss revive: success grid ---
for(const [stage,t] of [[0,'hell0'],[3,'finale stage 3 (demo off)'],[5,'hell1'],[10,'hell2'],[14,'hell3'],[21,'hell4'],[26,'hell5'],[31,'hell5 last'],[32,'hell6 first (H7)'],[34,'hell6 last']])
  for(const deaths of [0,1,2,5])h3('boss revive '+t+' deaths '+deaths,{base:BOSS,over:bo({deaths}),w3:W3({stage}),first:FREV(0.01),world:WD({facing:1.1})});
for(const [rp,t] of [[100,'plenty'],[11,'11 -> 1'],[10,'10 -> 0 (no revive)'],[9,'9 -> 0'],[20,'20 -> 10'],[0,'0 (already empty)'],[undefined,'undefined']])h3('boss revive points '+t,{base:BOSS,over:bo({_revPts:rp,deaths:1}),first:FREV(0.01)});
for(const [sup,t] of [[0,'none'],[0.1,'0.1 -> +3'],[0.29,'0.29 -> +4'],[0.3,'0.3 -> +5'],[0.5,'0.5 -> capped +5'],[1.5,'1.5 -> revCh 0.5']])
  for(const hp of [1000,999])h3('boss revive suppress '+t+' player hp '+hp,{base:BOSS,over:bo({deaths:1}),aff:{antiRevive:sup},world:WD({hp}),first:FREV(0.01)});
for(const r of [0.4999999,0.5,0.5000001])h3('boss revive roll '+r+' vs revCh 0.5',{base:BOSS,over:bo({deaths:0}),aff:{antiRevive:1.5},first:FREV(r)});
for(const r of [0.6499999,0.65,0.6500001])h3('boss revive roll '+r+' vs revCh 0.65 (deaths 10)',{base:BOSS,over:bo({deaths:9}),first:FREV(r)});
h3('boss revive roll fails (revCh 0)',{base:BOSS,over:bo({deaths:0}),aff:{antiRevive:3},first:[0.0001,0.9,0.5]});
for(const [zone,t] of [[{type:'holyPrison',x:1050,y:1000,r:50,lv:1},'in zone lv1'],[{type:'holyPrison',x:1050,y:1000,r:50,lv:10},'in zone lv10'],[{type:'holyPrison',x:1050,y:1000,r:50},'in zone lv undefined'],[{type:'holyPrison',x:1050,y:1000,r:0.5,lv:1},'zone too small'],[{type:'holyPrison',x:1100,y:1000,r:50,lv:1},'zone edge exactly 50 (not <)'],[{type:'fireWall',x:1050,y:1000,r:50,lv:1},'other zone type']])
  h3('boss revive holy prison '+t,{base:BOSS,over:bo({deaths:1}),w3:W3({fireZones:[zone]}),first:FREV(0.01)});
h3('boss revive two zones: first match breaks',{base:BOSS,over:bo({deaths:1}),w3:W3({fireZones:[{type:'holyPrison',x:1050,y:1000,r:50,lv:1},{type:'holyPrison',x:1050,y:1000,r:50,lv:10}]}),first:FREV(0.01)});
h3('boss revive fireZones empty array',{base:BOSS,over:bo({deaths:1}),w3:W3({fireZones:[]}),first:FREV(0.01)});
// revive state changes
h3('boss revive state: maxPoise 333 poise 7 speed cap 1.6',{base:BOSS,over:bo({deaths:1,maxPoise:333,poise:7,speed:1.4,atk:101,bossPatCd:80,_bossPhase:3,_comboIdx:2,_feinting:true,_delaying:4,eShield:9,eShieldMax:9,stunned:40}),first:FREV(0.01)});
h3('boss revive state: H7 speed cap 2.0 bossPatCd floor 20',{base:BOSS,over:bo({deaths:1,speed:1.9,bossPatCd:30,atk:101}),w3:W3({stage:32}),first:FREV(0.01)});
h3('boss revive state: bossPatCd 100 -> 70',{base:BOSS,over:bo({deaths:1,bossPatCd:100}),first:FREV(0.01)});
h3('boss revive state: bossPatCd 70 -> 60 floor',{base:BOSS,over:bo({deaths:1,bossPatCd:70}),first:FREV(0.01)});
h3('boss revive state: bossPatCd 40 -> 60 (floor raises)',{base:BOSS,over:bo({deaths:1,bossPatCd:40}),first:FREV(0.01)});
h3('boss revive state: speed low stays x1.25',{base:BOSS,over:bo({deaths:1,speed:1.0}),first:FREV(0.01)});
for(const [orig,rp,mrp,t] of [[undefined,100,150,'origR unset'],[40,100,150,'origR kept 40'],[0,100,150,'origR 0 -> reset'],[30,15,150,'scale floor 0.4'],[30,60,150,'scale 0.4'],[30,61,150,'scale just over 0.4'],[30,100,0,'maxRevPts 0 -> 150'],[30,160,150,'scale > 1'],[12,100,150,'radius floor 10 (r*scale<10)']])
  h3('boss revive shrink '+t,{base:BOSS,over:bo({deaths:1,_origR:orig,_revPts:rp+10,_maxRevPts:mrp,r:30}),first:FREV(0.01)});
h3('boss revive shrink no text when scale 1',{base:BOSS,over:bo({deaths:1,_origR:30,_revPts:260,_maxRevPts:150,r:30}),first:FREV(0.01)});
// teleport
for(const [rule,t] of [['open','free'],['first1','first spot blocked'],['first2','first two blocked'],['first3','three blocked'],['blockAll','all blocked']])h3('boss revive teleport '+t,{base:BOSS,over:bo({deaths:1}),w2:W2({canMv:rule}),first:FREV(0.01)});
for(const [dx,dy,t] of [[0,0,'on top of the player'],[50,0,'near'],[159,0,'just inside'],[160,0,'exactly at the wave radius'],[161,0,'just outside']])h3('boss revive shockwave '+t,{base:BOSS,over:bo({deaths:1,x:1000+dx,y:1000+dy,r:20}),w2:W2({canMv:'blockAll'}),first:FREV(0.01),world:WD({facing:3.14159})});
for(const [ifr,s,t] of [[0,'idle','hit'],[1,'idle','iframes'],[0,'charge','charging'],[-1,'idle','negative iframes']])h3('boss revive shockwave player '+t,{base:BOSS,over:bo({deaths:1,x:1020,y:1000}),world:WD({iframes:ifr,s,facing:3.14159}),w2:W2({canMv:'blockAll'}),first:FREV(0.01)});
h3('boss revive shockwave knockback accumulates',{base:BOSS,over:bo({deaths:1,x:1020,y:1000}),world:WD({kb:{x:3,y:-2},facing:3.14159}),w2:W2({canMv:'blockAll'}),first:FREV(0.01)});
h3('boss revive facing undefined (NaN position)',{base:BOSS,over:bo({deaths:1}),world:WD({facing:undefined}),first:FREV(0.01)});
// anger burst + companion
for(const deaths of [1,2,3,6])for(const el of [undefined,0,2])h3('boss revive anger burst deaths '+deaths+' el '+el,{base:BOSS,over:bo({deaths:deaths-1,el,atk:100.7,r:18,facing:1}),first:FREV(0.01)});
h3('boss revive anger burst: boss r 0 and facing 0 (mouth offset fallbacks)',{base:BOSS,over:bo({deaths:1,r:0,facing:0,atk:50}),first:FREV(0.01)});
for(const [kb,comp,idx,t] of [[[],0.05,0.1,'empty list'],[[3],0.05,0.1,'only itself (etype filtered)'],[[3,5],0.05,0.1,'one other'],[[5,6,7],0.05,0,'idx 0'],[[5,6,7],0.05,0.5,'idx 0.5 -> 1'],[[5,6,7],0.05,0.9999,'idx last'],[[5,6,7],0.1,0.1,'roll exactly 0.1 (no)'],[[5,6,7],0.0999999,0.1,'roll just under'],[[5,6,7],0.9,0.1,'roll over'],[null,0.01,0.1,'undefined list']])
  h3('boss revive companion '+t,{base:BOSS,over:bo({deaths:1,etype:3,x:1050,y:1000,mhp:777,atk:90}),w3:W3({killedBosses:kb}),first:FREV(0.01,comp,idx),w2:W2({canMv:'open'})});
for(const rule of ['first1','first2','first3','first4'])h3('boss revive companion with blocked spots '+rule,{base:BOSS,over:bo({deaths:1,etype:3,mhp:777,atk:90}),w3:W3({killedBosses:[5,6]}),first:FREV(0.01,0.05,0.3),w2:W2({canMv:rule})});
h3('boss revive companion stage 5',{base:BOSS,over:bo({deaths:1,etype:3,mhp:777,atk:91}),w3:W3({stage:5,killedBosses:[5,6]}),first:FREV(0.01,0.05,0.3)});
h3('boss revive companion odd mhp',{base:BOSS,over:bo({deaths:1,etype:3,mhp:1001,atk:91}),w3:W3({killedBosses:[9]}),first:FREV(0.01,0.05,0.3)});
// --- druid finale (demo last stage 3) ---
for(const [deaths,sup,rp,t] of [[0,0,100,'first death'],[0,0.4,100,'suppress 0.4'],[0,1.2,100,'suppress > 1'],[1,0,100,'second death (chance 0)'],[0,0,10,'points exhausted'],[0,0,11,'points left 1']])
  h3('druid finale '+t,{base:BOSS3,over:bo({deaths,_revPts:rp}),w3:W3({stage:3,demoMode:true,demoLast:3}),aff:{antiRevive:sup},first:[0.2,0.7,0.5]});
h3('druid finale: demo mode off at stage 3',{base:BOSS3,over:bo({deaths:0}),w3:W3({stage:3,demoMode:false,demoLast:3}),first:FREV(0.01)});
h3('druid finale: demo last stage differs',{base:BOSS3,over:bo({deaths:0}),w3:W3({stage:3,demoMode:true,demoLast:4}),first:FREV(0.01)});
h3('druid finale: stage 2 (not finale)',{base:BOSS3,over:bo({deaths:0}),w3:W3({stage:2,demoMode:true,demoLast:2}),first:FREV(0.01)});
h3('druid finale: non-boss',{over:ed({}),w3:W3({stage:3,demoMode:true,demoLast:3}),first:[0.5]});
h3('druid finale: judged already',{base:BOSS3,over:bo({deaths:0,_bossRevJudged:true,_bossRevived:true,_reviveTimer:100,_bossRevRoll:0.1,_bossRevChance:0.9}),w3:W3({stage:3,demoMode:true,demoLast:3})});
// --- si0 druid sink (STY-D9) ---
for(const [stage,fm,t] of [[0,undefined,'stage 0 plain boss'],[0,'fb','stage 0 with _fmKind'],[0,'','stage 0 empty _fmKind'],[1,undefined,'stage 1'],[2,undefined,'stage 2'],[3,undefined,'stage 3']])
  for(const sup of [0,3])h3('sink '+t+' suppress '+sup,{base:BOSS,over:bo({deaths:0,_fmKind:fm,_revPts:100}),w3:W3({stage}),aff:{antiRevive:sup},first:[0.9,0.5,0.5,0.5,0.5]});
for(const [rp,t] of [[10,'points exhausted'],[100,'points left']])
  h3('sink points '+t+' roll fails',{base:BOSS,over:bo({deaths:0,_revPts:rp}),aff:{antiRevive:3},first:[0.9,0.5,0.5,0.5,0.5]});
for(const [judged,timer,rev,roll,chance,t] of [[true,100,true,0.1,0.9,'timer, roll under chance -> not sink'],[true,100,true,0.9,0.1,'timer, roll over chance -> sink'],[true,100,true,0.5,0.5,'roll equals chance -> sink'],[true,0,true,0.1,0.9,'timer 0 -> sink'],[true,100,false,0.1,0.9,'not _bossRevived -> sink'],[true,100,true,undefined,0.9,'roll undefined -> 1 -> sink'],[true,100,true,0.1,undefined,'chance undefined -> 0 -> sink'],[true,undefined,true,0.1,0.9,'timer undefined -> sink'],[true,-5,true,0.1,0.9,'timer negative'],[true,100,true,0,0.0001,'roll 0 chance tiny -> not sink']])
  h3('sink resolved: '+t,{base:BOSS,over:bo({deaths:5,_bossRevJudged:judged,_reviveTimer:timer,_bossRevived:rev,_bossRevRoll:roll,_bossRevChance:chance,_revPts:0}),aff:{antiRevive:0},first:[0.9]});
h3('sink judge block draws roll under chance (timer 180) -> not sink',{base:BOSS,over:bo({deaths:0,_revPts:100}),aff:{antiRevive:1.5},first:[0.9,0.0001,0.5]});
h3('sink: boss blastKill sink',{base:BOSS,over:bo({deaths:0,_revPts:5}),args:{opts:{_blastKill:true}},w3:W3({blDeathSndQ:[]}),first:[0.5,0.5,0.5]});
h3('sink: whirlwind kill',{base:BOSS,over:bo({deaths:0,_revPts:5}),world:WD({s:'whirlwind'}),first:[0.5,0.5]});
h3('sink: burn death skipped',{base:BOSS,over:bo({deaths:0,_revPts:5}),head3:B22({atkEl:1}),first:[0.5,0.5]});
// --- boss death texts (non-revive) ---
for(const [rp,sup,t] of [[10,0,'points exhausted'],[100,0,'points left, no suppress'],[100,0.1,'suppress'],[100,3,'huge suppress']])
  for(const stage of [0,2])h3('boss death texts '+t+' stage '+stage,{base:BOSS,over:bo({deaths:0,_revPts:rp}),w3:W3({stage}),aff:{antiRevive:sup},first:[0.99,0.5,0.5,0.5]});
h3('boss death text: already judged and not sink (stage 2)',{base:BOSS,over:bo({deaths:0,_bossRevJudged:true}),w3:W3({stage:2}),aff:{antiRevive:3},first:[0.99,0.5,0.5]});
h3('boss death text: already judged, stage 0 sink hides text',{base:BOSS,over:bo({deaths:0,_bossRevJudged:true}),w3:W3({stage:0}),aff:{antiRevive:3},first:[0.99,0.5,0.5]});
h3('boss death text: exhausted and stage 0 hides',{base:BOSS,over:bo({deaths:0,_revPts:5}),first:[0.99,0.5,0.5]});
// --- normal-mob revive ---
for(const [elite,lv] of [[0,1],[0,99],[0,100],[0,199],[0,200],[0,0],[1,50],[2,50],[3,50],[2,350],[1,1000],[0,150.5]])
  for(const r of [0.1,0.99])h3('mob revive elite '+elite+' lv '+lv+' roll '+r,{over:ed({elite,lv}),first:[r,0.3,0.5,0.5]});
for(const [sup,elite] of [[0,0],[0.2,0],[0.5,0],[0.6,2],[0.7,2],[0.45,0],[0.49,0]])for(const r of [0.0001,0.5])h3('mob revive suppress '+sup+' elite '+elite+' roll '+r,{over:ed({elite}),aff:{antiRevive:sup},first:[r,0.3,0.5,0.5]});
for(const [pt,fr,t] of [[0.3,0.4999999,'ghoul roll just under 0.5'],[0.3,0.5,'ghoul roll 0.5'],[0.3,0.5000001,'ghoul roll over']])h3('mob revive '+t,{over:ed({}),first:[0.1,fr,0.5]});
for(const r of [0.4999999,0.5,0.5000001])h3('mob revive roll '+r+' vs 0.5',{over:ed({}),first:[r,0.3,0.5]});
h3('mob revive already revived',{over:ed({_revived:true}),first:[0.1,0.3,0.5]});h3('mob revive ghoul flag',{over:ed({_isGhoul:true}),first:[0.1,0.3,0.5]});h3('mob revive ghoul flag false',{over:ed({_isGhoul:false}),first:[0.1,0.3,0.5]});
for(const [zone,t] of [[{type:'holyPrison',x:1050,y:1000,r:50,lv:1},'zone lv1'],[{type:'holyPrison',x:1050,y:1000,r:50,lv:10},'zone lv10'],[{type:'holyPrison',x:1050,y:1000,r:50},'zone lv undefined']])
  for(const elite of [0,2])h3('mob revive holy prison '+t+' elite '+elite,{over:ed({elite}),w3:W3({fireZones:[zone]}),first:[0.3,0.3,0.5]});
h3('mob revive elite revive timer 120',{over:ed({elite:1}),first:[0.1,0.3,0.5]});h3('mob revive sets reviveX reviveY',{over:ed({x:1234.5,y:999.25}),first:[0.1,0.3,0.5]});
// --- killSlayer / On-Kill affixes ---
h3('killSlayer',{aff:{killSlayer:0.37}});h3('killSlayer zero',{aff:{killSlayer:0}});
for(const [k,v] of [['onKillHeal',30],['hpOnKill',40],['onKillMana',20],['onKillStam',25],['shieldOnKill',15],['onKillSpeed',0.3]])h3('on-kill '+k,{aff:{[k]:v}});
h3('on-kill heal both sources',{aff:{onKillHeal:30,hpOnKill:40}});h3('on-kill heal capped',{aff:{onKillHeal:500},world:WD({hp:900,mhp:1000})});h3('on-kill mana capped',{aff:{onKillMana:500},world:WD({mp:90,mmp:100})});h3('on-kill stamina capped',{aff:{onKillStam:500},world:WD({st:90,mst:100})});h3('on-kill shield capped',{aff:{shieldOnKill:500},world:WD({shield:40,mshield:50})});
h3('on-kill stamina undefined (NaN)',{aff:{onKillStam:20},world:WD({st:undefined})});h3('on-kill stamina max undefined (NaN)',{aff:{onKillStam:20},world:WD({mst:undefined})});h3('on-kill shield undefined (NaN)',{aff:{shieldOnKill:20},world:WD({shield:undefined})});h3('on-kill shield max undefined (NaN)',{aff:{shieldOnKill:20},world:WD({mshield:undefined})});
// --- unique on-kill ---
for(const [v,t] of [[0.3,'0.3'],[1,'1']])h3('mace explode '+t,{ueq:{_uMaceExplode:v},over:ed({mhp:1000}),others:[other('etype0',{x:1100,y:1000}),other('etype0',{x:1140,y:1000}),other('etype0',{x:1200,y:1000}),other('etype0',{x:1080,y:1000,alive:false})]});
h3('mace explode: none nearby',{ueq:{_uMaceExplode:0.3},over:ed({mhp:1000})});h3('mace explode: mhp fractional',{ueq:{_uMaceExplode:0.3},over:ed({mhp:333.7}),others:[other('etype0',{x:1100,y:1000})]});
h3('mace explode: edge 150',{ueq:{_uMaceExplode:0.3},over:ed({x:1000,y:1000}),others:[other('etype0',{x:1150,y:1000}),other('etype0',{x:1150.5,y:1000})]});
for(const [gw,pt,fuel,refund,hg,t] of [[1200,1000,1,0,10,'ok'],[1000,1000,1,0,10,'expired exactly now'],[999,1000,1,0,10,'expired'],[0,1000,1,0,10,'no mark'],[1200,1000,0,0,10,'fuel 0'],[1200,1000,1,27,10,'refund at cap'],[1200,1000,1,26.5,10,'refund 26.5'],[1200,1000,2,0,10,'fuel 2 caps at 27'],[1200,1000,1,0,95,'gauge capped'],[1200,undefined,1,0,10,'playTime undefined'],[1200,0,1,0,10,'playTime 0'],[undefined,1000,1,0,10,'mark undefined']])
  h3('ghost fuel '+t,{over:ed({_uqGwExp:gw}),world:{...WD({}),playTime:pt},ueq:{_uGhostFuel:fuel},w2:W2({uqS:{gwRefund:refund}}),w3:W3({harpGauge:hg,harpMax:100})});
h3('ghost fuel: gwRefund undefined',{over:ed({_uqGwExp:1200}),ueq:{_uGhostFuel:1},w2:W2({uqS:{}})});
for(const [ctx0,bleed,bleedT,used,v,t] of [['chainSlash',1,0,false,0.5,'bleed'],['chainSlash',0,5,false,0.5,'bleedT'],['chainSlash',0,0,false,0.5,'no bleed'],['chainSlash',1,0,true,0.5,'already used'],['chainSlash',1,0,false,0,'value 0'],['other',1,0,false,0.5,'other ctx'],[null,1,0,false,0.5,'no ctx'],['chainSlash',-1,0,false,0.5,'negative bleed'],['chainSlash',0,-1,false,0.5,'negative bleedT']])
  h3('chain echo '+t,{over:ed({bleed,bleedT}),w3:W3({uqHitCtx:ctx0}),w2:W2({uqS:{csEchoUsed:used?true:undefined}}),ueq:{_uChainBleedEcho:v},head3:B22({dmg:200.7}),others:[other('etype0',{x:1300,y:1000}),other('etype0',{x:1100,y:1000}),other('etype0',{x:1200,y:1000,alive:false})]});
h3('chain echo: no targets',{over:ed({bleed:1}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[]});
h3('chain echo: target edge 600 not included',{over:ed({bleed:1,x:1000,y:1000}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1600,y:1000}),other('etype0',{x:1599.5,y:1000})]});
h3('chain echo: tie keeps first',{over:ed({bleed:1,x:1000,y:1000}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1100,y:1000}),other('etype0',{x:900,y:1000})]});
h3('chain echo: dmg tiny -> min 1',{over:ed({bleed:1}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.001},head3:B22({dmg:3}),others:[other('etype0',{x:1100,y:1000})]});
h3('chain echo: another uniq projectile already queued',{over:ed({bleed:1}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1100,y:1000})]});
for(const [ft,ch,sp,off,dm,lv,t] of [['spikeTrap',undefined,undefined,undefined,100,3,'ok'],['spikeTrap',true,undefined,undefined,100,3,'child'],['spikeTrap',undefined,true,undefined,100,3,'pillar'],['spikeTrap',undefined,undefined,true,100,3,'already spawned'],['other',undefined,undefined,undefined,100,3,'other type'],['spikeTrap',undefined,undefined,undefined,100,undefined,'lv undefined'],['spikeTrap',undefined,undefined,undefined,undefined,3,'dmg undefined'],['spikeTrap',false,false,false,100,0,'flags false, lv 0'],['spikeTrap',undefined,undefined,undefined,0.3,3,'tiny dmg']])
  for(const q of [null,[{x:1,y:1,r:5,t:0,maxT:10,dmg:3,el:0,lv:1,type:'spikeTrap',_uqChild:false}]])h3('trap offshoot '+t+(q?' with queue':''),{over:ed({}),w3:W3({uqFzCtx:{type:ft,_uqChild:ch,_pillarSpike:sp,_uqSpawned:off,dmg:dm,lv},uqZoneQ:q}),ueq:{_uTrapOffshoot:0.5}});
h3('trap offshoot: value 0',{w3:W3({uqFzCtx:{type:'spikeTrap',dmg:100,lv:3}}),ueq:{}});h3('trap offshoot: no ctx',{w3:W3({uqFzCtx:null}),ueq:{_uTrapOffshoot:0.5}});
// --- legendary on-kill ---
h3('legend dagger',{leq:{_lDaggerKill:1},world:WD({_okSpdBuff:300,_okSpdMul:0.7})});h3('legend dagger lower existing',{leq:{_lDaggerKill:1},world:WD({_okSpdBuff:10,_okSpdMul:0.1})});h3('legend dagger fresh',{leq:{_lDaggerKill:1},world:WD({_okSpdBuff:undefined,_okSpdMul:undefined})});
h3('legend dagger plus speed affix',{leq:{_lDaggerKill:1},aff:{onKillSpeed:0.9}});
for(const [rage,lv,rm,t] of [[10,0.05,100,'basic'],[99,0.05,100,'capped'],[10,0.0001,100,'min 1'],[10,0.5,333,'big max'],[undefined,0.05,100,'rage undefined (NaN)'],[10,0.05,undefined,'rageMax undefined (NaN)']])h3('legend ring '+t,{leq:{_lRingKill:lv},world:WD({rage}),w3:W3({rageMax:rm})});
// --- death effects ---
for(const atkEl of [0,1,2])for(const [o,t] of [[null,'no opts'],[{},'empty opts'],[{beam:true},'beam'],[{beam:false},'beam false'],[{explode:true},'explode'],[{beam:true,explode:true},'beam+explode'],[{explode:false,beam:true},'beam, explode false'],[{detonate:true},'detonate']])
  for(const wh of [false,true])h3('burn/whirl atkEl '+atkEl+' '+t+(wh?' whirlwind':''),{args:{opts:o},head3:B22({atkEl}),world:WD({s:wh?'whirlwind':'idle'}),first:[0.9,0.5,0.5,0.5,0.5,0.5]});
for(const r of [0,0.3333,0.3334,0.6666,0.6667,0.99999])h3('beam fire death pick roll '+r,{args:{opts:{beam:true}},over:ed({_revived:true}),first:[r,0.5,0.5,0.5,0.5,0.5]});
h3('burn death fire_hit (atkEl 1)',{head3:B22({atkEl:1}),first:[0.5,0.5,0.5,0.5]});
for(const [er,t] of [[10,'r 10'],[18,'r 18'],[17.99,'r 17.99'],[0,'r 0'],[100,'r 100']])h3('burn death vfx scale '+t,{head3:B22({atkEl:1}),over:ed({r:er})});
for(const [kd,ib,et,t] of [[true,false,5,'mob slime'],[true,false,10,'mob demon etype 10'],[true,true,5,'boss'],[true,false,9.5,'etype 9.5']])
  for(const q of [[],null])h3('blastKill '+t+(q?' queue':' no queue'),{args:{opts:{_blastKill:kd}},base:ib?BOSS:'etype0',over:ed({etype:et,_revPts:5,deaths:0}),w3:W3({blDeathSndQ:q}),first:[0.99,0.5,0.5,0.5,0.5,0.5]});
h3('blastKill false',{args:{opts:{_blastKill:false}},w3:W3({blDeathSndQ:[]})});h3('blastKill with burn',{args:{opts:{_blastKill:true,beam:true}},w3:W3({blDeathSndQ:[]}),head3:B22({atkEl:1})});
for(const [nh,hs,t] of [[null,100,'no timer'],[0,100,'timer 0'],[1,100,'timer 1'],[-1,100,'timer negative']])h3('hit stop '+t,{w2:W2({noHitStopT:nh,hitStop:7}),w3:W3({optHitStop:hs})});
for(const hs of [0,25,100,137,250,9999])h3('hit stop OPT.hitStop '+hs,{w3:W3({optHitStop:hs})});
for(const [combo,timer,max,ib,t] of [[5,100,7,false,'basic'],[5,1190,7,false,'timer cap'],[5,1140,7,false,'timer 1140 -> 1200'],[5,1139,7,false,'timer 1139'],[5,100,3,false,'new max'],[5,100,6,false,'combo equals max after ++'],[5,100,5,false,'combo below max'],[5,0,7,true,'boss'],[5,500,7,true,'boss timer 500'],[5,100,7,true,'boss cap'],[998,100,7,false,'998'],[999,100,7,false,'999 -> 1000 text'],[1999,100,7,false,'1999 -> 2000'],[2998,100,7,false,'2998 -> 2999 none'],[999,100,7,true,'boss 999 -> 1000'],[9999,100,7,false,'9999 -> 10000']])
  h3('combo '+t,{base:ib?BOSS:'etype0',over:ed({_revPts:5,deaths:0}),w3:W3({combo,comboTimer:timer,comboMax:max}),first:[0.99,0.5,0.5,0.5,0.5]});
for(const [diff,t] of [[5,'diff 5'],[9,'diff 9'],[10,'diff 10'],[2,'diff 2 (negative signed)'],[0,'diff 0'],[null,'diff undefined'],[5.5,'diff 5.5'],[7.3,'diff 7.3']])for(const combo of [999,4999,29999])h3('combo bonus text '+t+' combo '+combo,{w3:W3({combo,diff})});
for(const [ang,t] of [[undefined,'no angle (atan2 from player)'],[0,'angle 0'],[1.234,'angle 1.234'],[-3,'angle -3']])h3('kill angle '+t,{args:{ang},over:ed({x:1050,y:1030})});
h3('kill angle on top of the player',{args:{ang:undefined},over:ed({x:1000,y:1000})});
for(const [dmg,mhp] of [[100,1000],[100,0.5],[100,0],[1e9,10],[0,10],[250,100]])h3('corpse power dmg '+dmg+' mhp '+mhp,{head3:B22({dmg}),over:ed({mhp})});
for(const [r,pk,rare,second,t] of [[10,0.7999999,0,0,'common'],[10,0.8,0.5,0,'rare roll 0.8'],[10,0.8000001,0.99999,0,'rare last'],[18,0.1,0.1,0.4999999,'big (r 18) intestine'],[18,0.1,0.1,0.5,'big organ'],[17.99,0.1,0.1,0.1,'small'],[10,0.1,0.9999,0.1,'common last']])
  h3('gore '+t,{over:ed({r,_revived:true}),first:[pk,rare,second,0.5,0.5]});
h3('gore boss big piece',{base:BOSS,over:bo({r:10,_revPts:5}),first:[0.99,0.5,0.8,0.2,0.2]});
// --- spawn holes ---
for(const [fh,t] of [[0,'hole 0'],[1,'hole 1'],[2,'hole without alive field'],[3,'hole out of range'],[1.5,'hole fractional'],[undefined,'no hole'],[-1,'hole negative']])h3('spawn '+t,{over:ed({_fromHole:fh})});
h3('spawn hole list empty',{over:ed({_fromHole:0}),w3:W3({spawnHoles:[]})});
// --- gate guard ---
h3('gate guard',{over:ed({_isGateGuard:true,r:30}),first:[0.5,0.5,0.5,0.5,0.5,...Array(60).fill(0.4)]});h3('gate guard boss',{base:BOSS,over:bo({_isGateGuard:true,deaths:0,_revPts:5}),first:[0.99,0.5,0.5,0.5,0.5,...Array(60).fill(0.4)]});h3('gate guard false',{over:ed({_isGateGuard:false})});
h3('gate guard flags already set',{over:ed({_isGateGuard:true}),w3:W3({gateGuard:false,gateGuardKilled:true,bossGateOpen:true,shDirty:true})});
// --- lethal revive combinations ---
h3('boss revive then nothing else (return keeps kills)',{base:BOSS,over:bo({deaths:1}),w3:W3({kills:77,combo:9}),first:FREV(0.01),aff:{killSlayer:0.5,onKillHeal:50},leq:{_lDaggerKill:1}});
h3('doppelganger revive keeps kills',{over:ed({etype:87}),w3:W3({kills:77,combo:9}),aff:{killSlayer:0.5,onKillHeal:50}});
h3('decoy ignores kill rewards',{over:ed({_isDecoy:true}),w3:W3({kills:77,combo:9}),aff:{killSlayer:0.5,onKillHeal:50},leq:{_lDaggerKill:1}});
// --- boundary cases added after the first mutation pass (each kills a mutant the grid let survive) ---
for(const st of [32.5,-1,35,100,1.5])h3('stage '+st+' (no STG entry or fractional)',{base:BOSS,over:bo({deaths:1}),w3:W3({stage:st}),first:FREV(0.01)});
h3('decoy flag false (normal death continues)',{over:ed({_isDecoy:false})});
h3('boss revive roll vs revCh 0.8 (suppress 1.2) pct 80',{base:BOSS,over:bo({deaths:0}),aff:{antiRevive:1.2},first:FREV(0.01)});
h3('boss revive pct 50 exactly (suppress 1.5)',{base:BOSS,over:bo({deaths:0}),aff:{antiRevive:1.5},first:FREV(0.01)});
h3('boss revive maxRevPts 0.5',{base:BOSS,over:bo({deaths:1,_maxRevPts:0.5,_revPts:80}),first:FREV(0.01)});
h3('boss revive maxRevPts 1.5',{base:BOSS,over:bo({deaths:1,_maxRevPts:1.5,_revPts:80}),first:FREV(0.01)});
h3('on-kill with player hp above max (no affix)',{world:WD({hp:1200,mhp:1000,mp:150,mmp:100,st:150,mst:100,shield:70,mshield:50})});
h3('on-kill with player hp above max (with affixes)',{aff:{onKillHeal:5,onKillMana:5,onKillStam:5,shieldOnKill:5,onKillSpeed:0.2},world:WD({hp:1200,mhp:1000,mp:150,mmp:100,st:150,mst:100,shield:70,mshield:50})});
h3('boss revive player at full hp above max',{base:BOSS,over:bo({deaths:1}),world:WD({hp:1200,mhp:1000}),first:FREV(0.01)});
h3('boss revive with elite/lv fields on the boss',{base:BOSS,over:bo({deaths:1,elite:2,lv:900}),first:FREV(0.01)});
h3('boss death with druid finale chance and suppress above 1',{base:BOSS3,over:bo({deaths:0,_revPts:100}),w3:W3({stage:3,demoMode:true,demoLast:3}),aff:{antiRevive:1.0},first:[0.3,0.5]});
h3('boss death with druid finale and suppress exactly 1 (chance 0)',{base:BOSS3,over:bo({deaths:0,_revPts:100}),w3:W3({stage:3,demoMode:true,demoLast:3}),aff:{antiRevive:1.0},first:[0.3,0.5]});
h3('boss death druid finale deaths already 1 (second death)',{base:BOSS3,over:bo({deaths:1,_revPts:100}),w3:W3({stage:3,demoMode:true,demoLast:3}),first:[0.3,0.5]});
h3('boss death druid finale deaths 1 revPts exhausted',{base:BOSS3,over:bo({deaths:1,_revPts:10}),w3:W3({stage:3,demoMode:true,demoLast:3}),first:[0.3,0.5]});
h3('doppelganger on a boss (etype 87) already revived',{base:BOSS,over:bo({etype:87,_dgRevived:true,deaths:1}),first:FREV(0.01)});
h3('mob revive: elite exactly 1 lv 100',{over:ed({elite:1,lv:100}),first:[0.55,0.3,0.5]});
h3('mob revive: elite 2 lv 100 revPow 0.7',{over:ed({elite:2,lv:100}),first:[0.69,0.3,0.5]});
h3('mob revive: roll equals finalRev (0.5 - 0)',{over:ed({}),first:[0.5,0.3,0.5]});
h3('mob revive: roll equals finalRev 0.2 (suppress 0.3)',{over:ed({}),aff:{antiRevive:0.3},first:[0.2,0.3,0.5]});
h3('mob revive: suppress equals revPow (finalRev 0)',{over:ed({}),aff:{antiRevive:0.5},first:[0.0001,0.3,0.5]});
h3('hp exactly 0 with decoy',{over:ed({hp:0,_isDecoy:true})});
h3('boss judge block: revPts 1 -> chance uses roll',{base:BOSS,over:bo({deaths:0,_revPts:11}),aff:{antiRevive:3},first:[0.99,0.123,0.5,0.5]});
h3('boss judge block: chance positive stage 2',{base:BOSS,over:bo({deaths:2,_revPts:100}),w3:W3({stage:2}),aff:{antiRevive:3},first:[0.99,0.321,0.5,0.5]});
h3('boss judge block: chance floor 0 (deaths 9)',{base:BOSS,over:bo({deaths:9,_revPts:100}),aff:{antiRevive:3},first:[0.99,0.321,0.5,0.5]});
h3('boss judge block: chance with zone suppress',{base:BOSS,over:bo({deaths:0,_revPts:100}),w3:W3({fireZones:[{type:'holyPrison',x:1050,y:1000,r:50,lv:4}]}),aff:{antiRevive:3},first:[0.99,0.321,0.5,0.5]});
h3('boss judge block: chance without suppress (stage 6)',{base:BOSS,over:bo({deaths:0,_revPts:100}),w3:W3({stage:6}),aff:{antiRevive:3},first:[0.99,0.321,0.5,0.5]});
h3('mob judged flag keeps killers: ghoul true',{over:ed({_isGhoul:true,elite:3,lv:500}),first:[0.1,0.3,0.5]});
h3('kill angle zero is a given angle',{args:{ang:0},over:ed({x:1010,y:1050})});
h3('ghost fuel: refund 20 adds up to cap 27',{over:ed({_uqGwExp:1200}),ueq:{_uGhostFuel:1},w2:W2({uqS:{gwRefund:20}})});
h3('ghost fuel: refund 0 gauge exactly at cap',{over:ed({_uqGwExp:1200}),ueq:{_uGhostFuel:1},w2:W2({uqS:{gwRefund:0}}),w3:W3({harpGauge:55,harpMax:100})});
h3('ghost fuel: gauge cap below add',{over:ed({_uqGwExp:1200}),ueq:{_uGhostFuel:0.2},w2:W2({uqS:{gwRefund:0}}),w3:W3({harpGauge:99,harpMax:100})});
h3('chain echo: bleed exactly 0.5',{over:ed({bleed:0.5}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1100,y:1000})]});
h3('chain echo: only bleedT',{over:ed({bleed:0,bleedT:0.5}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1100,y:1000})]});
h3('chain echo: nearer target found later',{over:ed({bleed:1,x:1000,y:1000}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1500,y:1000}),other('etype0',{x:1200,y:1000}),other('etype0',{x:1300,y:1000})]});
h3('chain echo: boss-sized target skipped when dead, other alive farther',{over:ed({bleed:1,x:1000,y:1000}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1050,y:1000,alive:false}),other('etype0',{x:1400,y:1000})]});
h3('mace explode: dead neighbour and a far one',{ueq:{_uMaceExplode:0.3},over:ed({mhp:1000}),others:[other('etype0',{x:1100,y:1000,alive:false}),other('etype0',{x:1100,y:1100})]});
h3('combo exactly at 1000 by boss',{base:BOSS,over:bo({_revPts:5,deaths:0}),w3:W3({combo:999,diff:9}),first:[0.99,0.5,0.5,0.5]});
h3('combo bonus pct zero (diff below 5, combo 1000)',{w3:W3({combo:999,diff:5})});
h3('combo 1000 diff 5.5',{w3:W3({combo:999,diff:5.5})});
h3('combo comboMax equal',{w3:W3({combo:7,comboMax:8})});
h3('hit stop not applied when noHitStopT is exactly 0.5',{w2:W2({noHitStopT:0.5,hitStop:7})});
h3('sink: stage 0 boss blastKill queue absent',{base:BOSS,over:bo({deaths:0,_revPts:5}),args:{opts:{_blastKill:true}},first:[0.5,0.5,0.5]});
h3('burn death: atkEl 1 with explode true skips burn',{head3:B22({atkEl:1}),args:{opts:{explode:true}},first:[0.5,0.5,0.5,0.5]});
h3('burn death pick with beam and atkEl 0 index 2',{args:{opts:{beam:true}},over:ed({_revived:true}),first:[0.7,0.5,0.5,0.5,0.5]});
h3('spawn hole: alive undefined hole decremented',{over:ed({_fromHole:2})});
h3('spawn hole index equals count',{over:ed({_fromHole:3}),w3:W3({spawnHoles:[{alive:3},{alive:1},{alive:5}]})});
h3('gate guard: boss with revive pending (return before gate)',{base:BOSS,over:bo({_isGateGuard:true,deaths:1}),first:FREV(0.01)});
h3('gate guard: sink druid',{base:BOSS,over:bo({_isGateGuard:true,deaths:0,_revPts:5}),first:[0.99,0.5,0.5,0.5,...Array(60).fill(0.4)]});
// --- cases added after the full mutation pass ---
for(const r of [0.7999999,0.8,0.8000001])h3('gore common/rare roll exactly '+r+' (mob not revivable)',{over:ed({_revived:true}),first:[r,0.5,0.5,0.5,0.5]});
for(const r of [0,0.3333,0.3334,0.6666,0.6667,0.99999])h3('beam pick '+r+' (mob not revivable)',{args:{opts:{beam:true}},over:ed({_revived:true}),first:[r,0.5,0.5,0.5,0.5]});
h3('finale chance with a negative suppress affix',{base:BOSS3,over:bo({deaths:0,_revPts:100}),w3:W3({stage:3,demoMode:true,demoLast:3}),aff:{antiRevive:-0.5},first:[0.3,0.5]});
for(const [d,sup] of [[20,0],[20,0.1]])for(const [judged,stage] of [[false,0],[true,0],[false,2],[true,2]])h3('boss death text with chance floor deaths '+d+' sup '+sup+' judged '+judged+' stage '+stage,{base:BOSS,over:bo({deaths:d,_revPts:100,_bossRevJudged:judged}),w3:W3({stage}),aff:{antiRevive:sup},first:[0.99,0.5,0.5,0.5]});
h3('revive scale exactly 1 (no shrink text)',{base:BOSS,over:bo({deaths:1,_origR:30,_revPts:160,_maxRevPts:150,r:30}),first:FREV(0.01)});
h3('revive tp warn fields cleared',{base:BOSS,over:bo({deaths:1,_tpWarnT:9,_tpWarnX:5,_tpWarnY:7}),first:FREV(0.01)});
for(const [st,sup,d,zone,roll] of [[0,1.1,0,null,0.95],[5,1.4,0,null,0.95],[0,0.95,1,null,0.95],[0,0.9,0,{type:'holyPrison',x:1050,y:1000,r:50,lv:4},0.95],[2,1.2,0,null,0.95]])
  h3('judge block positive chance stage '+st+' sup '+sup+' deaths '+d+(zone?' zone':''),{base:BOSS,over:bo({deaths:d,_revPts:100}),w3:W3({stage:st,fireZones:zone?[zone]:null}),aff:{antiRevive:sup},first:[roll,0.321,0.5,0.5]});
h3('echo target exactly 600 away is not chosen',{over:ed({bleed:1,x:1000,y:1000}),w3:W3({uqHitCtx:'chainSlash'}),ueq:{_uChainBleedEcho:0.5},others:[other('etype0',{x:1600,y:1000})]});
h3('boss combo timer negative',{base:BOSS,over:bo({_revPts:5,deaths:0}),w3:W3({comboTimer:-5}),first:[0.99,0.5,0.5,0.5]});
h3('corpse power dmg 0 mhp 0 (0/0)',{head3:B22({dmg:0}),over:ed({mhp:0,_revived:true})});
h3('corpse power small dmg mhp 0.5',{head3:B22({dmg:0.01}),over:ed({mhp:0.5,_revived:true})});
for(const dx of [1,2])for(const rule of ['only2'])h3('companion fallback probe blocked once ('+rule+') '+dx,{base:BOSS,over:bo({deaths:1,etype:3,mhp:777,atk:90}),w3:W3({killedBosses:[5,6]}),first:FREV(0.01,0.05,dx===1?0.3:0.9),w2:W2({canMv:rule})});
h3('companion fallback probe blocked once, player far away',{base:BOSS,over:bo({deaths:1,etype:3,mhp:777,atk:90,x:1300,y:1200}),w3:W3({killedBosses:[5,6]}),first:FREV(0.01,0.05,0.3),w2:W2({canMv:'only2'})});
// --- H3 seeded fuzz ---
const f3=mulberry32(4242);const p3=a=>a[Math.floor(f3()*a.length)];const r3=(a,b)=>a+f3()*(b-a);
const OPT3=[['_blastKill',true],['beam',true],['explode',true],['detonate',true],['dot',true]];
for(let i=0;i<500;i++){
  const base=p3([BOSS,BOSS,BOSS3,'etype0','etype0','etype6','etype40','etype92','etype99','undead4']);const ib=base===BOSS||base===BOSS3;
  const opts=f3()<0.3?null:Object.fromEntries(OPT3.filter(()=>f3()<0.25));
  const stage=p3([0,0,0,1,2,3,3,5,14,26,32,34]);const demoMode=stage===3&&f3()<0.5;
  const over=ed({x:1000+r3(-200,200),y:1000+r3(-200,200),hp:p3([-10,0,-0.5]),mhp:p3([1000,777,1001]),etype:p3([5,9.5,10,87,3,40]),deaths:p3([0,0,1,2,5]),_revPts:p3([5,10,11,100,150]),_maxRevPts:p3([150,0]),elite:p3([0,0,1,2,3]),lv:p3([1,100,250,0]),
    _bossRevJudged:p3([undefined,undefined,true]),_bossRevived:p3([undefined,true,false]),_reviveTimer:p3([undefined,0,100]),_bossRevRoll:p3([undefined,0.1,0.9]),_bossRevChance:p3([undefined,0.5]),_isDecoy:p3([undefined,undefined,undefined,undefined,true]),_dgRevived:p3([false,false,true]),_revived:p3([undefined,undefined,true]),_isGhoul:p3([undefined,undefined,true]),_fmKind:p3([undefined,undefined,undefined,'fb']),
    _fromHole:p3([undefined,undefined,0,1,2,5]),_isGateGuard:p3([undefined,undefined,undefined,true]),bleed:p3([0,1]),bleedT:p3([0,4]),_uqGwExp:p3([undefined,undefined,1200,900]),_origR:p3([undefined,30]),r:p3([10,18,30]),el:p3([undefined,0,2]),atk:p3([100,100.7,333]),maxPoise:p3([100,333]),poise:p3([5,50]),speed:p3([1,1.5,1.9]),bossPatCd:p3([20,80]),facing:p3([0,1,2]),eShield:p3([0,30]),eShieldMax:p3([0,60])});
  const aff={};for(const k of ['antiRevive','killSlayer','onKillHeal','hpOnKill','onKillMana','onKillStam','shieldOnKill','onKillSpeed'])if(f3()<0.25)aff[k]=p3(k==='antiRevive'?[0,0.1,0.3,0.6,1.5,3]:[0.2,30,500]);
  const leq={};for(const k of ['_lDaggerKill','_lRingKill'])if(f3()<0.25)leq[k]=p3([0.05,1]);
  const ueq={};for(const k of ['_uMaceExplode','_uGhostFuel','_uChainBleedEcho','_uTrapOffshoot'])if(f3()<0.25)ueq[k]=p3([0.3,1,2]);
  const w3=W3({stage,demoMode,demoLast:demoMode?3:p3([0,3]),diff:p3([5,9,2,6]),optHitStop:p3([0,100,200]),killedBosses:p3([null,[],[3],[5,6],[5,6,7]]),fireZones:p3([null,[],[{type:'holyPrison',x:1000,y:1000,r:400,lv:p3([1,10,undefined])}]]),spawnHoles:[{alive:3},{alive:1},{}],kills:p3([0,10]),stageKills:p3([null,3]),combo:p3([0,5,998,999,1999]),comboTimer:p3([0,100,1190,1790]),comboMax:p3([0,7,2000]),gateGuard:f3()<0.5,gateGuardKilled:false,bossGateOpen:false,chromaT:p3([null,0]),blDeathSndQ:p3([null,[]]),uqZoneQ:p3([null,[]]),shDirty:false,harpGauge:p3([10,95]),harpMax:100,uqHitCtx:p3([null,'chainSlash','x']),uqFzCtx:p3([null,{type:'spikeTrap',dmg:100,lv:p3([1,undefined])}]),rageMax:p3([100,undefined])});
  const w2=W2({canMv:p3(['open','open','first1','first2','first3']),noHitStopT:p3([null,null,0,20]),uqS:p3([{},{gwRefund:0},{gwRefund:26.5},{csEchoUsed:true}])});
  const world=WD({hp:p3([100,1000]),mhp:1000,mp:p3([10,95]),mmp:100,st:p3([10,95,undefined]),mst:100,shield:p3([5,45,undefined]),mshield:50,s:p3(['idle','idle','whirlwind','charge']),iframes:p3([0,0,1]),facing:p3([0,1.1,3.14,2]),rage:p3([10,99,undefined]),_okSpdBuff:p3([undefined,50,300]),_okSpdMul:p3([undefined,0.1,0.7]),kb:{x:p3([0,5]),y:0}});
  world.playTime=p3([0,1000,5000]);
  const head3=B22({dmg:p3([0,1,100,5000,3e9]),atkEl:p3([0,0,1,2,3])});
  const others=Array.from({length:Math.floor(f3()*4)},()=>other(p3([BOSS,'etype0','etype0']),{x:1000+r3(-300,300),y:1000+r3(-300,300),alive:f3()<0.9}));
  const first=ib&&f3()<0.5?FREV(p3([0.01,0.3,0.7,0.99]),p3([0.05,0.5]),p3([0.1,0.8])):[p3([0.01,0.3,0.5,0.7,0.99]),p3([0.01,0.5,0.99]),p3([0.01,0.5,0.99])];
  h3('fuzz #'+i,{base,over,args:{ang:p3([undefined,0,1.2,-2.5,7]),noSound:f3()<0.3,opts},head3,world,w2,w3,aff,leq,ueq,others,vals:defVals(),seed:1200000+i,first});
}
// ===== CX-04c2: cases for the hurtE death tail (H4 = __H3b with given values) and full chains (CH4 = H1 -> H2 -> H3a -> H3b, made from CH3 cases that continue) =====
const D4=o=>({_isBurnDeath:false,_isWhirlKill:false,_sinkDruid:false,_killAng:0.5,...o});
const MT=o=>({...bases[BI['etype0']].obj.modT,...o});
function h4(name,o){const a={ang:0.5,noSound:false,opts:null,...(o.args||{})};const rest={...o};delete rest.args;
  cases.push({kind:'H4',name:'H4 '+name,base:'etype0',over:ed({}),args:a,head3:B22({}),d4:D4({}),world:WD({}),w2:defW2(),w3:defW3(),w4:defW4(),vals:defVals(),aff:{},leq:{},ueq:{},others:[],seed:cases.length+1,first:[0.9,0.5,0.5],...rest});}
h4('plain mob',{});
for(const k of [9,20,0,11])h4('kills '+k,{w3:W3({kills:k})});
for(const el of [undefined,0,1,2,3,4,5])for(const elite of [0,1,2])for(const r of [0.1,0.2,0.3])h4('death zone el '+el+' elite '+elite+' roll '+r,{over:ed({el,elite}),first:[r,r,0.5,0.5,0.5,0.5]});
h4('death zone decoy',{over:ed({el:3,_isDecoy:true})});h4('death zone boss',{base:BOSS,over:bo({el:3})});
for(const elite of [0,1,2,3])for(const r of [0.01,0.08,0.1,0.15,0.2,0.25,0.3])h4('debris elite '+elite+' roll '+r,{over:ed({elite,el:0}),first:[r,0.3,0.7,0.5,0.5,0.5]});
h4('debris skipped for rare etype',{base:'etype91',over:ed({elite:3})});h4('debris skipped for boss',{base:BOSS,over:bo({elite:3})});
for(const [cc,ib] of [[0,false],[3,false],[4,false],[4,true],[7,false]])h4('kill chain '+cc+(ib?' boss':''),{base:ib?BOSS:'etype0',over:ib?bo({}):ed({}),w4:W4({chainCnt:cc,chainT:33})});
h4('M26 avenger near and far',{others:[other('etype0',{x:1100,y:1000,mods:['M26'],baseAtk:31,atk:31,speed:1.9,r:28}),other('etype0',{x:1300,y:1000,mods:['M26']}),other('etype0',{x:1060,y:1000,mods:['M07']})]});
h4('M26 exactly 200 away',{others:[other('etype0',{x:1250,y:1000,mods:['M26']})]});
h4('M26 on the dead enemy itself',{over:ed({mods:['M26']})});
for(const lv of [undefined,1,3])h4('plague lv '+lv,{over:ed({_plagued:true,_plagueLv:lv}),others:[other('etype0',{x:1100,y:1000,hp:50}),other('etype0',{x:1090,y:1000,hp:1}),other('etype0',{x:1080,y:1000,alive:false}),other('etype0',{x:1500,y:1000})],w4:W4({magicRef:333.3,skMul:2.7})});
for(const [px,ifr,s] of [[1060,0,'idle'],[1060,5,'idle'],[1060,0,'charge'],[1200,0,'idle']])h4('etype8 player '+px+' '+ifr+' '+s,{over:ed({etype:8,atk:77.7}),world:WD({x:px,y:1000,iframes:ifr,s}),others:[other('etype0',{x:1080,y:1000}),other('etype0',{x:1099.9,y:1000}),other('etype0',{x:1080,y:1000,alive:false})]});
for(const rule of ['open','first1','first2','blockAll'])h4('etype15 split '+rule,{over:ed({etype:15,r:20,el:3,room:2}),w2:W2({canMv:rule})});
h4('etype15 already split',{over:ed({etype:15,_splitDone:true})});
h4('etype25 ice zone',{over:ed({etype:25})});
for(const [px,fs] of [[1060,undefined],[1060,50],[1060,200],[1200,undefined]])h4('etype28 freeze '+px+' '+fs,{over:ed({etype:28}),world:WD({x:px,y:1000,_freezeSlow:fs})});
h4('etype28 player iframes',{over:ed({etype:28}),world:WD({x:1060,y:1000,iframes:3})});
for(const rs of [[0.3,0.7,0.5,0.49,0.51,0.1,0.9,0.6],[0.6,0.6,0.6,0.6,0.6,0.6,0.6,0.6],[0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1]])for(const px of [1060,1300])h4('etype29 beans '+rs[0]+' player '+px,{over:ed({etype:29,atk:101.3,el:2}),world:WD({x:px,y:1000,_freezeSlow:20}),w2:W2({noHitStopT:null,hitStop:3}),first:rs});
h4('etype29 player freeze undefined',{over:ed({etype:29}),world:WD({x:1060,y:1000})});
h4('etype29 hitstop suppressed',{over:ed({etype:29}),w2:W2({noHitStopT:5,hitStop:3}),w3:W3({optHitStop:150})});
h4('etype29 gate guard elite 3',{over:ed({etype:29,elite:3,_isGateGuard:true,atk:62,el:2}),w3:W3({stage:0})});
h4('etype51 split',{over:ed({etype:51,r:21,el:1}),w3:W3({stage:14})});h4('etype51 already split',{over:ed({etype:51,_amalgSplit:true})});
for(const bd of [true,false])h4('etype55 bone death '+bd,{over:ed({etype:55,_boneDeath:bd,atk:55.5})});
for(const [px,ifr] of [[1060,0],[1060,2],[1200,0]])h4('etype57 shock '+px+' '+ifr,{over:ed({etype:57,atk:99}),world:WD({x:px,y:1000,iframes:ifr})});
for(const el of [undefined,3])h4('etype59 beans el '+el,{over:ed({etype:59,el,atk:88})});
h4('lava pool death',{over:ed({_lavaPoolDeath:true,atk:70.7})});
for(const px of [1060,1200])h4('etype72 burst '+px,{over:ed({etype:72,_lavaPoolDeath:true,atk:40}),world:WD({x:px,y:1000})});
h4('etype79 lava rain',{over:ed({etype:79,atk:120})});
for(const [px,pr] of [[1090,undefined],[1090,15],[1110,15],[1200,15]])h4('etype80 burst '+px+' r '+pr,{over:ed({etype:80,atk:60}),world:WD({x:px,y:1000,r:pr})});
for(const [px,fs] of [[1100,undefined],[1100,200],[1300,undefined]])h4('etype84 scream '+px+' '+fs,{over:ed({etype:84}),world:WD({x:px,y:1000,_freezeSlow:fs})});
for(const et of [85,88,89,60,66,68,69])h4('etype'+et+' death effect',{over:ed({etype:et,atk:50})});
for(const [et,r] of [[60,0.29],[60,0.3],[65,0.1],[69,0.5],[70,0.1],[59,0.1]])h4('o2bubble etype '+et+' roll '+r,{over:ed({etype:et,el:0}),first:[r,0.2,0.8,0.9,0.5]});
const RB='etype91';
for(const et of [90,91,92,93,94,95,96,97,98,99])for(const rs of [[0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1],[0.9,0.9,0.9,0.9,0.9,0.9,0.9,0.9],[0.5,0.3,0.6,0.2,0.45,0.99,0.01,0.7],[0.14,0.39,0.19,0.49,0.24,0.29,0.5,0.5]])
  h4('rare '+et+' rolls '+rs.join('/'),{base:RB,over:ed({etype:et,dropTier:2,_grGold:et===96?33.3:0}),first:rs,w3:W3({stage:5})});
h4('rare 91 dropTier 0 stage 34',{base:RB,over:ed({etype:91,dropTier:0}),w3:W3({stage:34})});
h4('rare 98 stage out of range',{base:RB,over:ed({etype:98}),w3:W3({stage:40})});h4('rare 99 stage 0',{base:RB,over:ed({etype:99}),w3:W3({stage:0})});
h4('rare 96 greed curse',{base:RB,over:ed({etype:96,_grGold:10}),world:WD({_greedCurse:300})});h4('rare 96 no gold',{base:RB,over:ed({etype:96,_grGold:0})});
h4('rare 97 twin same room',{base:RB,over:ed({etype:97,room:2}),others:[other(RB,{etype:97,room:2,x:1200,y:1000,atk:30.3,speed:0.5}),other(RB,{etype:97,room:2,x:1300,y:1000})]});
h4('rare 97 twin other room / dead',{base:RB,over:ed({etype:97,room:2}),others:[other(RB,{etype:97,room:3}),other(RB,{etype:97,room:2,alive:false})]});
h4('rare 97 twin room undefined both',{base:RB,over:ed({etype:97,room:undefined}),others:[other(RB,{etype:97,room:undefined})]});
h4('rare label for unknown etype 9.5',{base:RB,over:ed({etype:9.5})});
h4('M07 heal',{over:ed({mods:['M07'],elite:1}),others:[other('etype0',{x:1100,y:1000,hp:100,mhp:777}),other('etype0',{x:1100,y:1000,hp:770,mhp:777}),other('etype0',{x:1171,y:1000,hp:1,mhp:100})]});
for(const sp of [false,true])h4('M08 split '+sp,{over:ed({mods:['M08','M26'],elite:2,r:25,el:4,room:1,modT:MT({split:sp})}),first:[0.9,0.5,0.3,0.7,0.2,0.8,0.6,0.4,0.5,0.5]});
for(const [px,s,ifr] of [[1060,'idle',0],[1060,'charge',0],[1060,'idle',1],[1200,'idle',0]])h4('M10 blast '+px+' '+s+' '+ifr,{over:ed({mods:['M10'],elite:1,atk:41.1}),world:WD({x:px,y:1000,s,iframes:ifr})});
h4('M20 empower',{over:ed({mods:['M20'],elite:3}),others:[other('etype0',{x:1100,y:1000,baseAtk:33,atk:12}),other('etype0',{x:1199,y:1000})]});
for(const elite of [1,2,3])h4('elite notice '+elite,{over:ed({mods:['M01'],elite})});
h4('mods present but elite 0',{over:ed({mods:['M01'],elite:0})});h4('elite with empty mods',{over:ed({mods:[],elite:2})});
h4('slime matDrop',{over:ed({_isSlime:true,matDrop:12.6})});h4('slime matDrop 0',{over:ed({_isSlime:true,matDrop:0})});
h4('slime eaten items',{over:ed({_isSlime:true,matDrop:3,_eatenItems:[{id:1,slot:'ring1'},{id:2,slot:'boots'}]})});
h4('not slime but eaten items',{over:ed({_eatenItems:[{id:3}]})});h4('slime empty eaten',{over:ed({_isSlime:true,_eatenItems:[]})});
for(const [ib,elite] of [[false,0],[false,1],[false,2],[false,3],[true,0]])for(const gold of [0,0.35])for(const pm of [0,3])
  h4('malice drop ib '+ib+' elite '+elite+' gold '+gold+' pMalice '+pm,{base:ib?BOSS:'etype0',over:ib?bo({}):ed({elite}),aff:{goldBonus:gold},world:{...WD({}),PASSIVES:pm?{pMalice:pm}:{}},w3:W3({stage:7})});
for(const ok of [true,false])for(const t of [0.1,0.5,0.9])for(const ib of [false,true])h4('potion type roll '+t+' ok '+ok+(ib?' boss':''),{base:ib?BOSS:'etype0',over:ib?bo({}):ed({}),w4:W4({addPotionOk:ok}),first:ib?[0.5,0.5,0.5,0.5,0.99,t,0.4,0.6]:[0.99,t,0.5,0.5]});
for(const r of [0.49,0.5])h4('boss bonus hp potion roll '+r,{base:BOSS,over:bo({}),first:[0.5,0.5,0.5,0.5,0.99,0.1,r,0.6]});
for(const combo of [0,99,100,250,1000])for(const diff of [null,3,5,7])h4('combo '+combo+' diff '+diff,{over:ed({elite:1}),w3:W3({combo,diff})});
for(const [plv,elv,ib,elite] of [[100,0,false,0],[100,1,false,0],[100,50,false,0],[100,333.3,false,2],[100,50,true,0],[100,7,true,0],[999,50,false,0],[1000,50,false,0],[1000,50,false,1],[1000,50,true,0],[undefined,50,false,0]])
  h4('exp player lv '+plv+' enemy lv '+elv+(ib?' boss':'')+' elite '+elite,{base:ib?BOSS:'etype0',over:ib?bo({lv:elv}):ed({lv:elv,elite}),world:WD({lv:plv})});
// --- H4 seeded fuzz ---
const f4=mulberry32(7777);const p4=a=>a[Math.floor(f4()*a.length)];const r4=(a,b)=>a+f4()*(b-a);
for(let i=0;i<600;i++){
  const base=p4(['etype0','etype0','etype0',BOSS,'etype91','etype6']);const ib=base===BOSS;
  const et=base==='etype91'?p4([90,91,93,94,95,96,97,98,99]):p4([0,0,3,8,15,25,28,29,29,47,51,55,57,59,60,66,68,69,72,79,80,84,85,88,89]);
  const mods=p4([[],[],['M07'],['M08'],['M10'],['M20'],['M26'],['M07','M10','M20']]);
  const over={x:1000+r4(-100,100),y:1000+r4(-100,100),hp:p4([-10,0]),etype:ib?0:et,el:p4([undefined,0,1,2,3,4]),elite:ib?0:p4([0,0,0,1,2,3]),lv:p4([0,1,30,100,250.5]),atk:p4([31,77.7,500]),r:p4([10,20,30]),
    _plagued:p4([undefined,undefined,true]),_plagueLv:p4([undefined,2]),_lavaPoolDeath:f4()<0.1,_boneDeath:f4()<0.5,_splitDone:f4()<0.3,_amalgSplit:f4()<0.3,_isSlime:p4([undefined,undefined,true]),matDrop:p4([undefined,0,5.5]),
    mods,_isDecoy:p4([undefined,undefined,undefined,true]),room:p4([1,2]),dropTier:p4([0,2,4]),_grGold:p4([0,20])};
  if(ib)Object.assign(over,{_revPts:100,_maxRevPts:150});
  const splits=mods.includes('M08')||over.etype===51;
  const others=Array.from({length:Math.floor(f4()*4)},()=>other(p4(['etype0','etype0',base==='etype91'?'etype91':'etype0']),{x:1000+r4(-250,250),y:1000+r4(-250,250),alive:f4()<0.85,mods:p4([[],['M26']]),etype:p4([0,97]),room:p4([1,2])}));
  h4('fuzz #'+i,{base,over:ed(over),others,world:WD({x:1000+r4(-150,150),y:1000+r4(-150,150),iframes:p4([0,0,2]),s:p4(['idle','charge']),lv:p4([100,1000,undefined]),r:p4([undefined,15]),_freezeSlow:p4([undefined,30]),_greedCurse:p4([undefined,100])}),
    w2:W2({canMv:splits?'open':p4(['open','open','first1']),noHitStopT:p4([null,null,9]),hitStop:p4([0,5])}),w3:W3({stage:p4([0,0,3,5,14,26,34]),kills:p4([9,10,20,33]),combo:p4([0,150,999]),diff:p4([null,5,8])}),
    w4:W4({chainCnt:p4([0,4,4,2]),addPotionOk:f4()<0.7,magicRef:p4([100,250.5])}),aff:f4()<0.3?{goldBonus:p4([0.1,0.5])}:{},seed:2200000+i,first:[]});
}
// normalise: every case has kind/w2/w3, and sStats always carries the counters H2 touches
for(const c of cases){c.kind=c.kind||'H1';c.w2=c.w2||defW2();c.w3=c.w3||defW3();c.w4=c.w4||defW4();if(c.world.sStats){c.world.sStats={dmgDealt:0,maxHit:0,...c.world.sStats};}}
// keys given as undefined in an override mean 'delete the key' (JS undefined); JSON drops them, so record them explicitly as 'del'
for(const c of cases){c.del=Object.keys(c.over||{}).filter(k=>c.over[k]===undefined);for(const o of c.others)o.del=Object.keys(o.over||{}).filter(k=>o.over[k]===undefined);}
// ---- run ----
const tagTotals={NaN:0,Infinity:0,'-Infinity':0,'-0':0};function countTags(v){if(v&&typeof v==='object'){if(Array.isArray(v)){for(const x of v)countTags(x);}else if(Object.keys(v).length===1&&typeof v.$n==='string'){tagTotals[v.$n]++;}else for(const k of Object.keys(v))countTags(v[k]);}}
const bad=[];function safe(v,p){if(typeof v==='number'&&(!isFinite(v)||Object.is(v,-0)))bad.push(p+'='+(Object.is(v,-0)?'-0':v));else if(v&&typeof v==='object')for(const k of Object.keys(v))safe(v[k],p+'.'+k);}
function setup(c){
  const w=c.world;ctx.__w3=c.w3;ctx.__w=w;ctx.__vals=c.vals;ctx.__aff=c.aff;ctx.__leq=c.leq;ctx.__ueq=c.ueq;
  vm.runInContext('P=JSON.parse(JSON.stringify(__w.P));PASSIVES=JSON.parse(JSON.stringify(__w.PASSIVES));INV={equipped:JSON.parse(JSON.stringify(__w.equipped))};_shBufI=__w.shBufI;_hitSfxCd=__w.hitSfxCd;_now=__w.now;__log=[];__i=0;'+
   'G={stage:__w3.stage,playTime:__w.playTime,_stageDiffOff:0,kills:__w3.kills,combo:__w3.combo,comboTimer:__w3.comboTimer,comboMax:__w3.comboMax,spawnHoles:JSON.parse(JSON.stringify(__w3.spawnHoles)),_gateGuard:__w3.gateGuard?{}:null,_gateGuardKilled:__w3.gateGuardKilled,bossGateOpen:__w3.bossGateOpen};'+
   'if(__w3.stageKills!==null)G._stageKills=__w3.stageKills;if(__w3.killedBosses)G._killedBosses=__w3.killedBosses.slice();if(__w3.fireZones)G._fireZones=JSON.parse(JSON.stringify(__w3.fireZones));if(__w3.chromaT!==null)G._chromaT=__w3.chromaT;if(__w3.blDeathSndQ!==null)G._blDeathSndQ=[];if(__w3.uqZoneQ!==null)G._uqZoneQ=JSON.parse(JSON.stringify(__w3.uqZoneQ));'+
   '_DEMO_MODE=__w3.demoMode;_DEMO_LAST_STAGE=__w3.demoLast;_shDirty=__w3.shDirty;_harpGauge=__w3.harpGauge;_HARP_GAUGE_MAX=__w3.harpMax;_uqHitCtx=__w3.uqHitCtx;_uqFzCtx=__w3.uqFzCtx?JSON.parse(JSON.stringify(__w3.uqFzCtx)):null;pProjs=[];'+
   'if(__w.sStats)G._sStats=JSON.parse(JSON.stringify(__w.sStats));window._btDmgLog=__w.btLog?JSON.parse(JSON.stringify(__w.btLog)):undefined;'+
   'window._parryLesson=__w.lesson?{active:true,hurtEnemy:function(e,d,a,o){__rec("parryLessonHurt",e,d,a,o);}}:undefined;',ctx);
  ctx.__w2=c.w2;
  vm.runInContext('OPT={diff:__w3.diff,parts:__w2.optParts,hitStop:__w3.optHitStop};__cmN=0;VW=__w2.VW;VH=__w2.VH;_dpsDmg=__w2.dpsDmg;_txtPerFrame=__w2.txtPerFrame;_impPerFrame=__w2.impPerFrame;G.cam={x:__w2.cam.x,y:__w2.cam.y};G.hitStop=__w2.hitStop;G.slowMo=__w2.slowMo;if(__w2.noHitStopT!==null)G._noHitStopT=__w2.noHitStopT;if(__w2.dmgPeak)G._dmgPeak=JSON.parse(JSON.stringify(__w2.dmgPeak));if(__w2.dmgPeakShow)G._dmgPeakShow=JSON.parse(JSON.stringify(__w2.dmgPeakShow));_uqScCtx=__w2.uqScCtx?JSON.parse(JSON.stringify(__w2.uqScCtx)):undefined;_uqS=__w2.uqS?JSON.parse(JSON.stringify(__w2.uqS)):undefined;__canMv=__w2.canMv;',ctx);
  ctx.__w4=c.w4;vm.runInContext('G.mats=__w4.mats;G._chainCnt=__w4.chainCnt;G._chainT=__w4.chainT;G.rifts=JSON.parse(JSON.stringify(__w4.rifts));_critSfxCd=__w4.critSfxCd;__itemN=0;',ctx);
  ctx.__seq=seqFor(c.seed,c.first);
  const mkObj=s=>{const o=JSON.parse(JSON.stringify(bases[BI[s.base]].obj));for(const [k,v] of Object.entries(s.over||{}))if(v!==undefined)o[k]=JSON.parse(JSON.stringify(v));else delete o[k];return o;};
  ctx.__ens=[mkObj({base:c.base,over:c.over}),...c.others.map(mkObj)];vm.runInContext('ens=__ens;',ctx);
}
function snapshot(){return plain(vm.runInContext('({ens:ens,P:P,G:{sStats:G._sStats,playTime:G.playTime,dmgPeak:G._dmgPeak,dmgPeakShow:G._dmgPeakShow,flashCol:G._flashCol,flashT:G._flashT,hitStop:G.hitStop,slowMo:G.slowMo,noHitStopT:G._noHitStopT,dpsDmg:_dpsDmg,txtPerFrame:_txtPerFrame,uqScCtx:_uqScCtx,uqS:_uqS},G4:{druidFled:G._druidFled,mats:G.mats,chainCnt:G._chainCnt,chainT:G._chainT,rifts:G.rifts,critSfxCd:_critSfxCd},G3:{kills:G.kills,stageKills:G._stageKills,combo:G.combo,comboTimer:G.comboTimer,comboMax:G.comboMax,druidSink:G._druidSink,druidFinaleBoss:ens.indexOf(G._druidFinaleBoss),gateGuardSet:!!G._gateGuard,gateGuardKilled:G._gateGuardKilled,bossGateOpen:G.bossGateOpen,chromaT:G._chromaT,blDeathSndQ:G._blDeathSndQ,uqZoneQ:G._uqZoneQ,spawnHoles:G.spawnHoles,shDirty:_shDirty,harpGauge:_harpGauge,uqFzCtx:_uqFzCtx,pProjs:pProjs},shBufI:_shBufI,hitSfxCd:_hitSfxCd,btLog:window._btDmgLog,log:__log,consumed:__i})',ctx));}
const dropped=[];let cur='';const ch3Added={natural:0,forced:0};let ch4Added=0;let chSeq=0;
const exitOf=(r3,log)=>r3===null?(log.some(l=>l[0]==='T'&&l[1]==='환영 소멸!')?'Decoy':log.some(l=>l[0]==='reviveVFX')?'Doppelganger':'BossRevive'):(r3.__cont?'Continue':'NotDead');process.on('uncaughtException',e=>{console.error('CASE:',cur);console.error(e.message);process.exit(1);});
for(const c of cases){
  cur=c.name;setup(c);const initial=plain(vm.runInContext('ens',ctx)),initP=plain(vm.runInContext('P',ctx));
  ctx.__args=c.args;let ret=null,ret2=null;
  const callH1=()=>vm.runInContext('(function(){const a=__args;const r=a.atkEl===undefined||a.atkEl===null?__H1(ens[0],a.dmg,a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts):__H1(ens[0],a.dmg,a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts,a.atkEl);return r===undefined?null:r;})()',ctx);
  const callH2=()=>vm.runInContext('(function(){const a=__args;return __H2(ens[0],a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts,__h);})()',ctx);
  const callH3=()=>vm.runInContext('(function(){const a=__args;const r=__H3a(ens[0],a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts,__h3);return r===undefined?null:r;})()',ctx);
  const callH4=()=>vm.runInContext('(function(){const a=__args;__H3b(ens[0],a.ang===null?undefined:a.ang,a.noSound,a.opts===null?undefined:a.opts,__h4,__d4);})()',ctx);
  let ret3=null;const pristine=(c.kind==='CH'||c.kind==='CH3')?JSON.stringify(c):null;
  if(c.kind==='H2'){ctx.__h=c.head;ret2=plain(callH2());}
  else if(c.kind==='H3'){ctx.__h3=c.head3;ret3=plain(callH3());}
  else if(c.kind==='H4'){ctx.__h4=c.head3;ctx.__d4=c.d4;callH4();}
  else{const r1=callH1();if(r1===null){ret=null;}else{ret=plain(r1);if(c.kind==='CH'||c.kind==='CH3'||c.kind==='CH4'){ctx.__h=r1;const r2=callH2();ret2=plain(r2);if(c.kind==='CH3'||c.kind==='CH4'){ctx.__h3=r2;const r3=callH3();ret3=plain(r3);if(c.kind==='CH4'&&r3&&r3.__cont){ctx.__h4=r2;ctx.__d4=r3;callH4();}}}}}
  if((c.kind==='CH'||c.kind==='CH3'||c.kind==='CH4')&&ret===null){dropped.push(c.name);c.drop=true;continue;}
  const snap=snapshot();
  const diffs=snap.ens.slice(0,initial.length).map((fin,i)=>{const ini=initial[i],d={};for(const k of new Set([...Object.keys(fin),...Object.keys(ini)])){if(JSON.stringify(fin[k])!==JSON.stringify(ini[k])){if(!(k in fin))throw Error('field deleted: '+k);d[k]=fin[k];}}return d;});
  const pdiff={};for(const k of new Set([...Object.keys(snap.P),...Object.keys(initP)]))if(JSON.stringify(snap.P[k])!==JSON.stringify(initP[k])){if(!(k in snap.P))throw Error('P field deleted');pdiff[k]=snap.P[k];}
  const added=snap.ens.slice(initial.length);
  for(const v of [ret,ret2,ret3,diffs,added,pdiff,snap.log,snap.G,snap.G3,snap.G4,snap.btLog])countTags(v);if(bad.length)throw Error('case '+c.name+': non-JSON-safe numbers '+bad.splice(0).join(','));
  const is3=c.kind==='H3'||c.kind==='CH3'||c.kind==='CH4';
  c.expected={ret,ret2,ret3,exit:is3?exitOf(ret3,snap.log):null,added,G3:snap.G3,G4:snap.G4,diffs,pdiff,G:snap.G,shBufI:snap.shBufI,hitSfxCd:snap.hitSfxCd,btLog:snap.btLog===undefined?null:snap.btLog,log:snap.log,consumed:snap.consumed};
  c.seq=ctx.__seq.slice(0,snap.consumed+4);
  if(c.kind==='CH'){chSeq++;const dead=snap.ens[0].hp<=0;if(dead||chSeq%2===0){const k=JSON.parse(pristine);k.kind='CH3';k.name='CH3 '+c.name.slice(3)+(dead?' [natural death]':' [HP forced low]');if(!dead){k.over={...k.over,hp:[1,3,20][chSeq%3]};k.del=Object.keys(k.over).filter(x=>k.over[x]===undefined);}
    k.world.P={...k.world.P,lv:100,facing:0.5,rage:10,shield:5,mshield:50,kb:{x:0,y:0}};k.w3=defW3();cases.push(k);if(dead)ch3Added.natural++;else ch3Added.forced++;}}
  if(c.kind==='CH3'&&c.expected.exit==='Continue'){const k=JSON.parse(pristine);k.kind='CH4';k.name='CH4 '+c.name.slice(4);k.w4=defW4();cases.push(k);ch4Added++;}
  delete c.seed;delete c.first;
}
for(let i=cases.length-1;i>=0;i--)if(cases[i].drop)cases.splice(i,1);
const K=k=>cases.filter(c=>c.kind===k);
const exitCounts={};for(const c of cases)if(c.expected.exit)exitCounts[c.expected.exit]=(exitCounts[c.expected.exit]||0)+1;
const sum={nonFiniteTags:tagTotals,cases:cases.length,h1:K('H1').length,h2:K('H2').length,chain:K('CH').length,h3:K('H3').length,chain3:K('CH3').length,h4:K('H4').length,chain4:K('CH4').length,chain3Natural:ch3Added.natural,chain3Forced:ch3Added.forced,h3Exits:exitCounts,addedEnemies:cases.reduce((n,c)=>n+c.expected.added.length,0),chainDropped:dropped.length,earlyReturns:K('H1').filter(c=>c.expected.ret===null).length,fallThrough:K('H1').filter(c=>c.expected.ret!==null).length,crits:cases.filter(c=>(c.expected.ret&&c.expected.ret._isCrit)).length,
  shielded:cases.filter(c=>c.expected.ret&&c.expected.ret._shBlocked).length,logEntries:cases.reduce((s,c)=>s+c.expected.log.length,0),randomDraws:cases.reduce((s,c)=>s+c.expected.consumed,0),enemies:cases.reduce((s,c)=>s+1+c.others.length,0),
  h2Killed:cases.filter(c=>c.expected.ret2&&c.expected.ret2&&c.kind!=='H1').length};
const callNames={};for(const c of cases)for(const l of c.expected.log)callNames[l[0]]=(callNames[l[0]]||0)+1;sum.injectedCalls=callNames;
const out={schema:'exoduser.unity.enemy-hurt-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,head:headSha,anchors,wrapper:{header:'function __H1(e,dmg,ang,noSound,opts,atkEl=0){',footer:'return {'+returned.join(',')+'};}finally{_shBufI--}}',locals:returned,h2:{header:'function __H2(e,ang,noSound,opts,__h){let {'+HEAD14.join(',')+'}=__h;',footer:'return {'+returned2.join(',')+'};}',locals:locals2,returned:returned2},
    h3:{header:'function __H3a(e,ang,noSound,opts,__h){let {'+returned2.join(',')+'}=__h;',footer:'return {__cont:true,'+locals3.join(',')+'};}return {__cont:false};}',locals:locals3},h3b:{header:'function __H3b(e,ang,noSound,opts,__h,__d){let {'+returned2.join(',')+'}=__h;let {'+locals3.join(',')+'}=__d;',footer:'}'}},
  note:'blocks located by text anchors and executed unchanged in one Node VM; external pieces = recording stubs with case-defined values, P/G/PASSIVES/INV values, Math.random sequence'},
  tables,bases,summary:sum,cases};
fs.writeFileSync(outPath,JSON.stringify(out));
console.log(JSON.stringify({sha:fileSha,summary:sum,locals:returned,anchors:anchors.slice(-14).map(a=>a.name+':'+a.start+'-'+a.end)}));
