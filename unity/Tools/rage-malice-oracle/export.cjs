// B10 oracle exporter: runs the ORIGINAL game.html rage / malice statements (_rageMax, _maliceMul, _malCost, the doParry rage add, the giant slam rage block,
// the unique rage adds, the mat pickup, the elite kill malice drop) in a Node VM and writes oracle.json. Program.cs (.NET 8) compares Runtime/Core/RageMalice.cs with it.
// No expected value is typed by hand.  usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json]
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
const need=(src,frag)=>{if(!src.includes(frag))throw new Error('source drift: missing '+frag);};
const SRC_RAGEMAX=fn('function _rageMax('),SRC_MALMUL=line('function _maliceMul('),SRC_MALC=line('const _MALICE_COST_MUL=')+fn('function _malCost(');
// giant slam rage block: from `const _rageDmgAf=` to the line before `const _gs1El=`
const sa=at("const _rageDmgAf=1+(_eqAffix('rageDmg')");let sb=sa;while(!lines[sb].trimStart().startsWith('const _gs1El='))sb++;
const SRC_SLAM=rec(sa,sb,'giantSlam rage block');need(SRC_SLAM,'P.rage=0;');need(SRC_SLAM,'~~(_rageP/20)');need(SRC_SLAM,'_uSlamEmberRage');
const SRC_ADD=line('P.rage=Math.min(_rageMax(),P.rage+_rageAdd);');
const SRC_SWORD=line("if(step===3&&_lEq('_lSwordCombo')>0)"),SRC_RING=line("if(_lEq('_lRingKill')>0)");need(SRC_RING,'_lRingKill');
const aa=at("if(_uEq('_uArmorRage')>0&&a>0&&Math.random()<_uEq('_uArmorRage'))");const SRC_ARMOR=rec(aa,aa+3,'armor rage');need(SRC_ARMOR,'P.rage=Math.min(_rMax,P.rage+10)');
const SRC_PICK=line("else if(it.type==='mat'){const mv=").replace(/^\s*else /,'');
const ea=at('if(e.ib||e.elite){const _db=e.elite?ELITE_TIERS[e.elite].dropBonus:0;');let eb=ea;while(!lines[eb-1].includes('SFX.pickup()}'))eb++;
const SRC_ELITE=rec(ea,eb,'elite instant malice drop');need(SRC_ELITE,'G.mats+=_matAmt');
const xa=at('G.mats+=4; // ');const SRC_EXTRA=rec(xa,xa+5,'kill base + elite extra malice');need(SRC_EXTRA,'const mCnt=~~((2+~~(Math.random()*2))*10*_comboBonus*2);');
const ELITE_TIERS_SRC=(()=>{const a=at('const ELITE_TIERS=[');let b=a;while(!lines[b-1].includes('];'))b++;return rec(a,b,'ELITE_TIERS');})();

const noop=()=>{};
function mkScope(c){
 const P={rage:c.rage||0,x:0,y:0};const G={stage:c.stage||0,mats:c.mats||0};
 const rnd=c.rnd===undefined?0:c.rnd;const M=Object.create(Math);M.random=()=>rnd;
 const texts=[],lava=[];
 return {P,G,Math:M,window:{_parryLesson:c.lesson?{active:true,rageCast:noop}:{rageCast:noop}},PASSIVES:{pRage:c.pRage||0,pMalice:c.pMal||0},
  _uEq:k=>k==='_uRageMax'?(c.uMax||0):k==='_uSlamEmberRage'?(c.ember||0):k==='_uArmorRage'?1:0,
  _lEq:k=>(k==='_lSwordCombo'||k==='_lRingKill')?(c.frac||0):0,
  _eqAffix:k=>k==='rageMaxFlat'?(c.flat||0):k==='rageDmg'?(c.rdmg||0):k==='goldBonus'?(c.gold||0):0,
  _T:a=>a,_L:a=>a,addTxt:(x,y,t)=>texts.push(t),_addLavaErupt:()=>lava.push(1),meleeRef:()=>1,statStr:()=>1,_skMul:()=>1,
  SFX:new Proxy({},{get:()=>noop}),poolPart:noop,step:3,a:c.a===undefined?5:c.a,_rageAdd:c.add||0,_comboBonus:c.combo||1,
  it:{type:'mat',matVal:c.matVal,picked:false},ok:false,e:{ib:!!c.ib,elite:c.elite||0,x:0,y:0},_texts:texts,_lava:lava};
}
const F=(body,ret)=>new Function('s','with(s){'+SRC_RAGEMAX+SRC_MALMUL+SRC_MALC+ELITE_TIERS_SRC+body+'return '+ret+';}');
const sections={};
// rageMax
sections.rageMax=[];{const f=F('', '{max:_rageMax()}');
 for(const lesson of [false,true])for(const uMax of [0,10,25])for(const flat of [0,10,20,35,55,80,100,145,200])for(const pRage of [0,1,2,3,5,7,10])
  sections.rageMax.push({lesson,uMax,flat,pRage,out:f(mkScope({lesson,uMax,flat,pRage})).max});}
// parry add + unique adds + armor
sections.add=[];{
 const fa=F(SRC_ADD,'{rage:P.rage}'),fs=F(SRC_SWORD,'{rage:P.rage}'),fr=F(SRC_RING,'{rage:P.rage}'),fm=F(SRC_ARMOR,'{rage:P.rage}');
 for(const rage of [0,1,10,50,99,100,101,150,199,200,300,600])for(const add of [1,5,10,20,30,60,100,1000])for(const flat of [0,35,100,145])for(const pRage of [0,3,10])for(const lesson of [false,true]){
  const c={rage,add,flat,pRage,lesson};sections.add.push({kind:'parry',...c,out:fa(mkScope(c)).rage});}
 for(const rage of [0,1,50,99,100,140,220])for(const frac of [0.005,0.01,0.02,0.05,0.1,0.25,1])for(const flat of [0,35,145])for(const pRage of [0,3,10]){
  const c={rage,frac,flat,pRage};sections.add.push({kind:'sword',...c,out:fs(mkScope(c)).rage});sections.add.push({kind:'ring',...c,out:fr(mkScope(c)).rage});}
 for(const rage of [0,50,95,100,150,600])for(const flat of [0,35,145])for(const pRage of [0,3]){
  const c={rage,flat,pRage,a:5};sections.add.push({kind:'armor',...c,out:fm(mkScope(c)).rage});}
}
// giant slam rage block
sections.slam=[];{
 const f=F('const _wrap=()=>{'+SRC_SLAM+'return {_rageMul}};','(()=>{const o=_wrap();return {rageMul:o._rageMul,rage:P.rage,texts:_texts,lava:_lava.length}})()');
 const rages=[0,1,2,5,10,19,20,39,40,50,99,100,101,150,199,200,333,500,600],prs=[0,1,3,5,10],rds=[0,.05,.3,1.2],embers=[0,.1,.15,.2];
 for(const rage of rages)for(const flat of [0,10,35,145,200])for(const pRage of prs)for(const rdmg of rds)for(const ember of embers){
  const c={rage,flat,pRage,rdmg,ember};const o=f(mkScope(c));sections.slam.push({...c,out:{rageMul:o.rageMul,rage:o.rage,texts:o.texts,lava:o.lava}});}
}
// malice cost
sections.malCost=[];{const f=F('','{v:_malCost(raw)}');const vals=[0,-1,-5,.4,.5,1,1.5,2,3,4,5,7,8,10,12,15,20,30,50,90,100,101,200,500,1000,50000,200000,200001,1e9];
 for(const v of vals){const s=mkScope({});s.raw=v;sections.malCost.push({v,out:f(s).v});}}
// pickup
sections.pickup=[];{const f=F(SRC_PICK,'{mv:it.picked?G.mats:-1}');
 for(const matVal of [0,1,2,3,5,10,25,100,999])for(const gold of [0,.05,.1,.25,.5,1])for(const pMal of [0,1,2,3,5,10]){const c={matVal,gold,pMal};sections.pickup.push({...c,out:f(mkScope(c)).mv});}}
// elite kill drop: instant + extra
sections.elite=[];{
 const fi=F(SRC_ELITE,'{mats:G.mats}'),fx=F(SRC_EXTRA,'{mats:G.mats}');
 for(const stage of [0,1,2,5,9,13,20,25,31,34])for(const elite of [0,1,2,3])for(const ib of [0,1])for(const gold of [0,.1,.5])for(const pMal of [0,2,5,10]){
  const c={stage,elite,ib,gold,pMal};sections.elite.push({kind:'instant',...c,out:(ib||elite)?fi(mkScope(c)).mats:0});}
 for(const ib of [0,1])for(const elite of [0,1,3])for(const combo of [1,1.05,1.5,2,2.5,6.25,10])for(const rnd of [0,.25,.49,.5,.75,.999]){
  const c={ib,elite,combo,rnd};sections.elite.push({kind:'extra',...c,out:fx(mkScope(c)).mats-4});}
}
fs.writeFileSync(OUT,JSON.stringify({wrapper:{generatedFrom:SRC,note:'values come from the original game.html statements; nothing typed by hand'},blocks,sections}));
let n=0;for(const k of Object.keys(sections))n+=sections[k].length;console.log('oracle cases',n,JSON.stringify(Object.fromEntries(Object.entries(sections).map(([k,v])=>[k,v.length]))));
