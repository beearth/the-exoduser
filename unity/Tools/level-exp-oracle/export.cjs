// D05 oracle exporter: runs the ORIGINAL game.html _calcMaxExp / addExp / _canTransLv and the kill XP statements of killE in a Node VM and writes oracle.json.
// Program.cs (.NET 8) compares Runtime/Core/LevelExp.cs with it. No expected value is typed by hand.  usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const SRC=path.resolve(arg('--source','G:/exoduser/game.html')),OUT=path.resolve(arg('--out',path.join(__dirname,'oracle.json')));
const text=fs.readFileSync(SRC,'utf8'),lines=text.split('\n'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),blocks=[];
function at(prefix,occ=0){let n=0;for(let i=0;i<lines.length;i++)if(lines[i].trimStart().startsWith(prefix)){if(n++===occ)return i+1;}throw new Error('source drift: no line starts with "'+prefix+'"');}
function rec(a,b,label){const body=lines.slice(a-1,b).join('\n');blocks.push({label,from:a,to:b,sha256:sha(body)});return body+'\n';}
function line(prefix,occ=0){const n=at(prefix,occ);return rec(n,n,prefix.slice(0,40));}
function fn(prefix,occ=0){const a=at(prefix,occ);let depth=0,started=false,str=null,esc=false;
 for(let i=a-1;i<lines.length;i++){const s=lines[i];for(let c=0;c<s.length;c++){const ch=s[c],nx=s[c+1];
  if(str){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch===str)str=null;continue;}
  if(ch==='/'&&nx==='/')break;if(ch==="'"||ch==='"'||ch==='`'){str=ch;continue;}
  if(ch==='{'){depth++;started=true;}else if(ch==='}')depth--;}
  if(started&&depth===0)return rec(a,i+1,prefix.slice(0,40));}throw new Error('unbalanced '+prefix);}
const SRC_ADDEXP=fn('function addExp('),SRC_CALC=fn('function _calcMaxExp('),SRC_CAN=fn('function _canTransLv(');
const SRC_ELITE=(()=>{const a=at('const ELITE_TIERS=[');let b=a;while(!lines[b-1].includes('];'))b++;return rec(a,b,'ELITE_TIERS');})();
const SRC_DIFF=line('const _diffSigned=');
const cpn=at('const _comboPct=~~(G.combo/100)*0.05');const SRC_COMBO=rec(cpn,cpn+2,'comboBonus lines');
const ke=at('const eLv=e.lv||10;const _expMul=');const SRC_KILL=rec(ke,ke+3,'kill xp lines');
if(!SRC_COMBO.includes('const _comboBonus=1+_comboPct+_diffPct;'))throw new Error('source drift: combo block');
if(!SRC_KILL.includes('addExp(~~((e.ib?Math.max(30,~~(eLv*2)):Math.max(5,~~(eLv*.4)))*_expMul))'))throw new Error('source drift: kill block');
const noop=()=>{};const noops=['showPH','addTxt','_T','_L','_levelUpVfx','dbSaveForce','_processPassiveQueue','SFX'];
function scopeFor(extra){return {Math,Date,window:{},_levelUpVfx:{trigger:noop},SFX:new Proxy({},{get:()=>noop}),PASSIVES:{},_T:a=>a,_L:a=>a,showPH:noop,addTxt:noop,dbSaveForce:noop,_processPassiveQueue:()=>0,...extra};}
const addFactory=new Function('scope','with(scope){'+SRC_CALC+SRC_CAN+SRC_ADDEXP+'return {addExp,_calcMaxExp};}');
const sections={};
sections.maxExp=[];{const {_calcMaxExp}=addFactory(scopeFor({}));for(let lv=1;lv<=1461;lv++)sections.maxExp.push({lv,out:_calcMaxExp(lv)});}
let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const TODAY='2026-10-27';
function addCase(c){
 const P={lv:c.lv,exp:c.exp,maxExp:c.maxExp,sp:0,ap:0,hp:50,mhp:100,st:50,mst:100,mp:50,mmp:100,x:0,y:0,skills:{},_transLvDate:c.date,_transLvCount:c.count};
 const sc=scopeFor({P,_DEMO_MODE:c.cap>0,_DEMO_LV_CAP:c.cap||100,_getTodayStr:()=>TODAY,nc:()=>({expBonus:c.nb}),_eqAffix:k=>k==='expBonus'?c.ab:0,G:{stage:0}});
 const {addExp}=addFactory(sc);const lv0=P.lv,ap0=P.ap;
 addExp(c.v,c.trans);
 return {...c,out:{lv:P.lv,exp:P.exp,maxExp:P.maxExp,sp:P.sp,ap:P.ap,count:P._transLvCount||0,date:P._transLvDate===undefined?null:P._transLvDate,levels:P.lv-lv0,apGain:P.ap-ap0}};
}
sections.add=[];{
 const calc=addFactory(scopeFor({}))._calcMaxExp;
 const lvs=[1,2,3,5,10,50,99,100,101,250,499,500,501,998,999,1000,1001,1002,1400];
 const vs=[0,1,2,3,5,10,30,100,999,10000,300000,5000000,20000000];
 const states=[{date:null,count:0},{date:TODAY,count:0},{date:TODAY,count:1},{date:'2026-10-26',count:1},{date:'2026-10-26',count:0}];
 for(const lv of lvs){const mx=calc(lv);for(const e of [0,Math.floor(mx/2),mx-1])for(const v of vs)for(const trans of [false,true])for(const nb of [0,.25])for(const ab of [0,.06,.4,.7])for(const cap of [0,100])for(const st of states)
  sections.add.push(addCase({lv,exp:e,maxExp:mx,v,trans,nb,ab,cap,date:st.date,count:st.count}));}
 for(let i=0;i<4000;i++){const lv=1+Math.floor(rnd()*1100);const mx=calc(lv);sections.add.push(addCase({lv,exp:Math.floor(rnd()*mx),maxExp:mx,v:Math.floor(rnd()*rnd()*3e6),trans:rnd()<.2,nb:rnd()<.3?+(rnd()*.5).toFixed(2):0,ab:rnd()<.5?+(rnd()*.7).toFixed(2):0,cap:rnd()<.2?100:0,date:rnd()<.5?TODAY:null,count:rnd()<.5?1:0}));}
}
sections.kill=[];{
 const f=new Function('scope','with(scope){'+SRC_ELITE+SRC_DIFF+'const _out=[];const addExp=(v,t)=>{_out.push([v,!!t])};'+SRC_COMBO+SRC_KILL+'return _out;}');
 const plv=[1,10,100,500,999,1000,1200],elv=[0,1,2,3,4,9,10,12,25,50,100,333,500,999,1500],combos=[0,1,99,100,101,250,999,1000,2500,4999],diffs=[-5,-1,0,1,2,5];
 for(const pl of plv)for(const el of elv)for(const ib of [0,1])for(const elite of [0,1,2,3])for(const combo of combos)for(const diff of diffs){
  const e={lv:el,ib:ib?true:undefined,elite};const P={lv:pl};
  const r=f(scopeFor({P,G:{combo},OPT:{diff:diff+5},e}));
  sections.kill.push({pl,lv:el,ib:!!ib,elite,combo,diff,out:{calls:r.length,v:r[0][0],trans:r[0][1]}});}
}
fs.writeFileSync(OUT,JSON.stringify({source:{path:SRC.replace(/\\/g,'/'),sha256:sha(text),lines:lines.length},blocks,wrapper:{noops,today:TODAY},sections}));
console.log(JSON.stringify({out:OUT,maxExp:sections.maxExp.length,add:sections.add.length,kill:sections.kill.length}));
