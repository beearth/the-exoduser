// E03 oracle exporter: runs the ORIGINAL game.html save literal (dbSave `saveData`) and restore statements (dbRestore player/game/bagMax/potLv, _restoreExpProgress) in a Node VM.
// Program.cs (.NET 8) compares Runtime/Core/CombatSave.cs with the result. No expected value is typed by hand.  usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const SRC=path.resolve(arg('--source','G:/exoduser/game.html')),OUT=path.resolve(arg('--out',path.join(__dirname,'oracle.json')));
const DATA=path.resolve(__dirname,'../../Assets/Exoduser/Runtime/Core/InventoryData.cs');
const text=fs.readFileSync(SRC,'utf8'),lines=text.split('\n'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),blocks=[];
function atFrom(prefix,from=1,occ=0){let n=0;for(let i=from-1;i<lines.length;i++)if(lines[i].trimStart().startsWith(prefix)){if(n++===occ)return i+1;}throw new Error('source drift: no line starts with "'+prefix+'"');}
function rec(a,b,label){const body=lines.slice(a-1,b).join('\n');blocks.push({label,from:a,to:b,sha256:sha(body)});return body+'\n';}
function line(prefix,from){const n=atFrom(prefix,from);return rec(n,n,prefix.slice(0,40));}
function fn(prefix){const a=atFrom(prefix);let depth=0,started=false,str=null,esc=false;
 for(let i=a-1;i<lines.length;i++){const s=lines[i];for(let c=0;c<s.length;c++){const ch=s[c],nx=s[c+1];
  if(str){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===str)str=null;continue;}
  if(ch==='/'&&nx==='/')break;if(ch==="'"||ch==='"'||ch==='`'){str=ch;continue;}
  if(ch==='{'){depth++;started=true;}else if(ch==='}')depth--;}
  if(started&&depth===0)return rec(a,i+1,prefix.slice(0,40));}throw new Error('unbalanced '+prefix);}
function until(prefix,from,endTrim){const a=atFrom(prefix,from);let b=a;while(lines[b-1].replace(/\r$/,'')!==endTrim)b++;return rec(a,b,prefix.slice(0,40));}

// ---- original source blocks ----
const dbSaveAt=atFrom('async function dbSave(');
const SRC_SAVE=until('const saveData={',dbSaveAt,'    };');
const SRC_CALC=fn('function _calcMaxExp(');
const SRC_REXP=fn('function _restoreExpProgress(');
const dbRestoreAt=atFrom('function dbRestore(');
const a1=atFrom('const pd=d.player;',dbRestoreAt),a2=atFrom('P.maskOn=pd.maskOn',dbRestoreAt);
const SRC_PLAYER=rec(a1,a2,'restore player');
const SRC_BAGMAX=line('BAG_MAX=Number.isNaN(+d.bagMax)',dbRestoreAt);
const SRC_POT=line('if(d.potLv)for(const k in d.potLv)',dbRestoreAt);
const SRC_GAME=until('if(d.game){',dbRestoreAt,'  }');
if(!SRC_GAME.includes('_saveSharedMats(Math.max(_sharedMats,_savedMats))'))throw new Error('source drift: game block');
if(!SRC_SAVE.includes('mats:0'))throw new Error('source drift: save literal');

// ---- InventoryItem field list, read from the C# class itself ----
const cs=fs.readFileSync(DATA,'utf8');
const itemText=cs.slice(cs.indexOf('class InventoryItem'),cs.indexOf('class InventorySeedData'));
const NUM=[],INT=[],STR=[],BOOL=[];
for(const m of itemText.matchAll(/public\s+(double|int|string|bool)\s+([A-Za-z_0-9,=\-\s]+?);/g)){
 const names=m[2].split(',').map(s=>s.replace(/=-?\d+/,'').trim()).filter(Boolean);
 (m[1]==='string'?STR:m[1]==='bool'?BOOL:m[1]==='int'?INT:NUM).push(...names);
}
const SLOTS=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'];

let seed=20261027;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)],chance=p=>rnd()<p;
const num=()=>chance(.15)?0:chance(.5)?ri(0,500):chance(.5)?+(rnd()*100).toFixed(2):ri(1,1e6);
const WORDS=['낡은 검','Iron Blade','흑요석 팔찌','Ａ','"quoted"','back\\slash','tab\there','검\n개행','🗡','x'];
function mkItem(slot){
 const it={};
 for(const f of NUM)if(chance(.25))it[f]=num();
 for(const f of INT)if(chance(.25)){if(f==='_gx'||f==='_gy')it[f]=ri(0,9);else it[f]=ri(0,60);}
 for(const f of STR)if(chance(.3))it[f]=pick(WORDS);
 for(const f of BOOL)if(chance(.2))it[f]=true;
 it.id=chance(.5)?ri(1,2e9)*1000+ri(0,999):ri(1,1e9)+rnd();it.slot=slot||pick(SLOTS);it.name=pick(WORDS);it.rarity=ri(0,5);it.tier=ri(0,10);it.itemLv=ri(0,100);it.reqLv=ri(0,100);it.enh=ri(0,20);it.socketCount=ri(0,5);
 it.affixes=Array.from({length:ri(0,4)},()=>({id:pick(['ancHP','defFlat','dropRate','potionPower','maxHPPct']),tier:ri(0,5),value:+(rnd()*50).toFixed(2)}));
 it.crystals=Array.from({length:ri(0,3)},()=>({id:pick(['cr_a','cr_b']),star:ri(1,5),enh:ri(0,5),q:ri(1,100)}));
 if(chance(.5))it.socketQ=Array.from({length:it.crystals.length},()=>ri(1,100));
 if(chance(.3))it.elements=Array.from({length:ri(1,3)},()=>({el:ri(0,4),dmg:+(rnd()*40).toFixed(1)}));
 if(chance(.3)){it.webOnlyField=ri(1,9);it._nameMig=1;it.prefix={name:'x',val:2};}   // fields Unity does not model
 return it;
}
// ---- web scope ----
function buildState(rich){
 const P={lv:ri(1,1500),exp:chance(.4)?ri(0,1e6):+(rnd()*1e5).toFixed(2),maxExp:(rich||chance(.9))?ri(15,5e6):0,sp:ri(0,500),ap:ri(0,200),_transLvDate:chance(.5)?null:pick(['2026-10-27','2026-10-26']),_transLvCount:ri(0,1),
  baseAtk:ri(8,900),baseDef:ri(2,500),mpR:0,stR:.28,hp:chance(.1)?0:ri(1,9e4),mhp:ri(100,9e4),mp:chance(.1)?0:ri(1,3000),mmp:ri(80,3000),st:chance(.1)?0:ri(1,900),mst:ri(100,900),speed:+(2.6+rnd()).toFixed(3),
  shield:chance(.5)?0:ri(1,500),mshield:chance(.5)?0:ri(1,900),maskOn:true,skills:{},_fused:undefined,_skProf:undefined};
 if(!rich&&chance(.15))P.lv=0;if(chance(.1))P.exp=0;
 const bag=Array.from({length:chance(.02)?ri(40,300):ri(0,10)},()=>mkItem());
 const equipped={};for(const s of SLOTS)equipped[s]=chance(.5)?mkItem(s):null;
 const INV={bag,equipped,ossCollect:{}};
 const G={stage:ri(0,34),kills:ri(0,99999),mats:0,_irisSz:undefined,_taRecords:undefined,_clearRecords:undefined,comboMax:0,playTime:0,_cutsceneDone:false,hellCleared:undefined};
 const S={P,INV,G,STATS:{str:0,dex:0,int:0,vit:0,lck:0},PASSIVES:{},_grit:0,QSLOTS:[{type:'hp',count:1},{type:null,count:0},{type:null,count:0},{type:null,count:0}],BAG_MAX:chance(.8)?300:ri(100,400),CRYSTAL_BAG:[],CRYSTAL_DUST:0,STONE_BAG:[],UPGRADES:{hp:0,atk:0,def:0,mp:0,st:0,spd:0},POT_LV:{hp:ri(0,10)},SKILL_SLOTS:[null,null,null,null,null,null],ULT_SLOT:null,_charIdx:ri(0,4),_passiveQueue:[]};
 if(rich){
  P.mpR=ri(0,5);P.stR=+(rnd()).toFixed(2);P.maskOn=chance(.5);P._transLvDate=pick(['2026-10-27',null]);P._apBossCleared=[1,3,'x'];P._goddessGift=[{a:1}];P._lvStatMigrated=true;S._passiveQueue=[{key:'pAtk',n:2}];
  P.skills={kiSlash:ri(1,10),whirlwind:ri(0,10),spikeTrap:1};P._fused={whirlDet:true};P._skProf={kiSlash:ri(0,999)};P._fuseProfSec={};P._cardProf={a:1};P._catProf={b:2};
  P.activeChargeSk=pick(['charge','quakeStride']);P.activeBowSk='normal';P.activeTechSk='giantSlam';P.activeMagicSk='fireball';P.activeLMBSk='kiSlash';P.activeRMBSk='shieldBlock';P.activeQSk='parry';P.activeCtSk='ghostWalk';
  S.STATS={str:ri(0,50),dex:ri(0,50),int:ri(0,50),vit:ri(0,50),lck:ri(0,50)};for(const k of ['pAtk','pDef','pRegen'])S.PASSIVES[k]=ri(0,10);S._grit=ri(0,9);
  S.QSLOTS[1]={type:'hp',count:ri(1,9)};S.CRYSTAL_BAG=[{id:'cr_a',q:50,n:3}];S.CRYSTAL_DUST=ri(0,999);S.STONE_BAG=[{q:10},{q:99}];S.UPGRADES.hp=ri(0,5);S.SKILL_SLOTS=['kiSlash',null,'whirlwind',null,null,null];S.ULT_SLOT=pick([null,'stormBurst']);
  INV.ossCollect={ancient:ri(1,5)};G._irisSz=ri(10,40);G._taRecords={s1:{t:12.5}};G._clearRecords={s1:3};G.comboMax=ri(0,999);G.playTime=ri(0,99999);G._cutsceneDone=true;G.hellCleared=[1,2];
 }
 return S;
}
function evalSave(S){
 const f=new Function('scope','with(scope){'+SRC_SAVE+'return saveData;}');
 const sc={P:S.P,INV:S.INV,G:S.G,STATS:S.STATS,PASSIVES:S.PASSIVES,_grit:S._grit,QSLOTS:S.QSLOTS,BAG_MAX:S.BAG_MAX,CRYSTAL_BAG:S.CRYSTAL_BAG,CRYSTAL_DUST:S.CRYSTAL_DUST,STONE_BAG:S.STONE_BAG,UPGRADES:S.UPGRADES,POT_LV:S.POT_LV,SKILL_SLOTS:S.SKILL_SLOTS,ULT_SLOT:S.ULT_SLOT,_charIdx:S._charIdx,_passiveQueueItems:()=>S._passiveQueue};
 return JSON.parse(JSON.stringify(f(sc)));
}
const sections={};
// 1) encode: modeled keys only, Raw=null
sections.encode=[];sections.roundtrip=[];
for(let i=0;i<500;i++){
 const S=buildState(false),saved=evalSave(S),P=S.P;
 sections.encode.push({input:{lv:P.lv,exp:P.exp,maxExp:P.maxExp,sp:P.sp,ap:P.ap,transDate:P._transLvDate||null,transCount:P._transLvCount||0,baseAtk:P.baseAtk,baseDef:P.baseDef,hp:P.hp,mhp:P.mhp,mp:P.mp,mmp:P.mmp,st:P.st,mst:P.mst,speed:P.speed,shield:P.shield,mshield:P.mshield,
  stage:S.G.stage,kills:S.G.kills,potLvHp:S.POT_LV.hp,bagMax:S.BAG_MAX,equipped:SLOTS.map(s=>S.INV.equipped[s]),bag:S.INV.bag},saved});
}
// 2) roundtrip: a full web save (all sections) decoded and re-encoded must come back unchanged except modeled-item normalisation
for(let i=0;i<200;i++){const S=buildState(true);sections.roundtrip.push({saved:evalSave(S)});}
// 3) decode: original restore statements applied to a saved object
sections.decode=[];
for(let i=0;i<800;i++){
 const S=buildState(chance(.4)),saved=evalSave(S);
 // damage variations that real old saves have
 if(chance(.15))delete saved.player.hp;if(chance(.1))delete saved.game;if(chance(.1))saved.bagMax=pick([null,0,'x',250,NaN]);if(chance(.1))saved.player.maxExp=pick([0,-5,null]);
 if(chance(.1))saved.player.lv=pick([0,999,1000,1001,1300]);if(chance(.2))saved.game&&(saved.game.mats=pick([0,5,500,7.9]));if(chance(.1))saved.potLv=pick([{},{hp:3},{hp:0}]);if(chance(.05))delete saved.inv;
 const sharedStart=chance(.5)?0:ri(0,2000);
 // evaluate with the chosen starting shared value
 const savedCopy=JSON.parse(JSON.stringify(saved));
 const d=JSON.parse(JSON.stringify(saved));
 const shared={v:sharedStart,writes:[]};
 const initP={lv:1,exp:0,maxExp:15,mhp:ri(100,900),mmp:ri(50,500),mst:ri(50,300)};
 const P={...initP};const G={};const POT_LV={hp:0};
 const scope={d,P,G,POT:{hp:{}},POT_LV,BAG_MAX:300,_calcMaxExp:null,_restoreExpProgress:null,_loadSharedMats:()=>shared.v,_saveSharedMats:v=>{shared.v=v;shared.writes.push(v);}};
 const f=new Function('scope','with(scope){'+SRC_CALC+SRC_REXP+'scope._calcMaxExp=_calcMaxExp;scope._restoreExpProgress=_restoreExpProgress;'+SRC_PLAYER+SRC_BAGMAX+SRC_POT+SRC_GAME+'}');
 f(scope);
 const jsonSafe=v=>v===undefined?null:v;
 sections.decode.push({saved:savedCopy,before:{mhp:initP.mhp,mmp:initP.mmp,mst:initP.mst,shared:sharedStart},
  out:{lv:P.lv,exp:P.exp,maxExp:P.maxExp,sp:P.sp,ap:P.ap,transDate:jsonSafe(P._transLvDate),transCount:P._transLvCount,baseAtk:P.baseAtk,baseDef:P.baseDef,hp:P.hp,mhp:P.mhp,mp:P.mp,mmp:P.mmp,st:P.st,mst:P.mst,speed:P.speed,shield:P.shield,mshield:P.mshield,
   stage:jsonSafe(G.stage),kills:jsonSafe(G.kills),mats:jsonSafe(G.mats),bagMax:scope.BAG_MAX,potLvHp:POT_LV.hp,sharedAfter:shared.v,hasGame:!!saved.game,
   bagLen:Array.isArray(saved.inv&&saved.inv.bag)?saved.inv.bag.length:0}});
}
fs.writeFileSync(OUT,JSON.stringify({source:{path:SRC.replace(/\\/g,'/'),sha256:sha(text),lines:lines.length},blocks,fields:{num:NUM,int:INT,str:STR,bool:BOOL},slots:SLOTS,sections}));
console.log(JSON.stringify({out:OUT,encode:sections.encode.length,roundtrip:sections.roundtrip.length,decode:sections.decode.length,numFields:NUM.length,strFields:STR.length,boolFields:BOOL.length}));
