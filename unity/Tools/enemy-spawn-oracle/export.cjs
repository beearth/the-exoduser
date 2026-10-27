// CX-02 enemy spawn oracle exporter: runs the ORIGINAL mkEn (and the helpers it calls) from game.html in a Node VM and writes oracle.json.
//   node export.cjs [--source G:/exoduser/game.html] [--expect-source-sha <sha256>] [--out oracle.json]
// Blocks are located by text anchors (first line must start with the expected declaration and match exactly one line) and executed UNCHANGED.
// The only things the VM gets from outside are the runtime globals the function reads (P.lv, OPT.diff, G.stage/_stageDiffOff, _DEMO_*, canMv, Math.random).
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source','G:/exoduser/game.html'),outPath=arg('--out',path.join(__dirname,'oracle.json'));
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
// ---- tables (same blocks CX-01 compares; here only as the inputs mkEn reads) ----
add(stmt('EL','const EL={'));add(stmt('CHAPTER_STAGES','const CHAPTER_STAGES=['));add(stmt('TOTAL_STAGES','const TOTAL_STAGES='));
add(stmt('HELL_NAMES','const HELL_NAMES=['));add(stmt('HELL_THEMES','const HELL_THEMES=['));add(stmt('HELL_BOSSES','const HELL_BOSSES=['));
add(untilBrace('SI_TO_HELL+SI_TO_FLOOR loop','const SI_TO_HELL=new Uint8Array'));add(untilBrace('STG loop','const STG=[];'));
for(const n of ['ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_R','ETYPE_RANGE','ETYPE_POISE','ETYPE_SHIELD','ETYPE_COL','ETYPE_COLS','ETYPE_ERES','RARE_ETYPE','ELITE_TIERS','ELITE_PROB','MOD_DEFS']){add(stmt(n,'const '+n+'='));}
add(single('DIFF_MUL','const DIFF_MUL='));add(single('DIFF_LV_OFF','const DIFF_LV_OFF='));
add(stmt('ETYPE_SPD','const ETYPE_SPD='));add(stmt('isRareEtype','function isRareEtype('));
add(single('ELC','const ELC='));add(single('T','const T=40;'));add(single('_MOB8','const _MOB8_TOTAL='));
add(stmt('BOSS_MOVES','const BOSS_MOVES=['));
// ---- spawn functions (executed as written) ----
add(stmt('_CH1_OPENING_EXCLUDED_ET','const _CH1_OPENING_EXCLUDED_ET='));
add(stmt('AURA_DEFS','const AURA_DEFS=['));
add(stmt('rollElite','function rollElite('));add(stmt('rollMods','function rollMods('));add(stmt('rollAura','function rollAura('));
add(single('_enemyHpPacing','function _enemyHpPacing('));
add(stmt('_isDruidFinale','function _isDruidFinale('));add(stmt('_druidFinaleHp','function _druidFinaleHp('));
add(stmt('_assignBossSkin','function _assignBossSkin('));add(stmt('_assignMobSkin','function _assignMobSkin('));
add(stmt('safePt','function safePt('));
const mkEnText=stmt('mkEn','function mkEn(');add(mkEnText);

// ---- the only external pieces: runtime globals, canMv rule, Math.random sequence ----
const ctx=vm.createContext({});
vm.runInContext('var window=this;var _useGPU=false,_useGL=false,_ESPRITES=[];var P={lv:1},OPT={diff:5},G={stage:0,_stageDiffOff:0},_DEMO_MODE=false,_DEMO_LAST_STAGE=0;var __seq=[],__i=0,__calls=[],__rule=null;'+
 'Math.random=function(){if(__i>=__seq.length)throw new Error("random sequence exhausted");return __seq[__i++];};'+
 'function canMv(x,y,r){__calls.push([x,y,r]);const k=__rule;if(!k||k.kind==="open")return true;if(k.kind==="blockAll")return false;'+
 'if(k.kind==="blockDisc"){const dx=x-k.cx,dy=y-k.cy,rr=k.rad+r;return dx*dx+dy*dy>=rr*rr;}throw new Error("unknown rule");}',ctx);
for(const b of blocks)vm.runInContext(b,ctx);
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?Array.from(v):v));
const get=n=>plain(vm.runInContext(n,ctx));
const tables={};
for(const n of ['T','_MOB8_TOTAL','_MOB8_COLS','AURA_DEFS','SI_TO_HELL','ELITE_PROB','ELITE_TIERS','MOD_DEFS','DIFF_MUL','DIFF_LV_OFF','ELC','ETYPE_HP','ETYPE_ATK','ETYPE_SPD','ETYPE_R','ETYPE_POISE','ETYPE_COL','RARE_ETYPE','ETYPE_ERES'])tables[n]=get(n);
tables._CH1_OPENING_EXCLUDED_ET=get('Array.from(_CH1_OPENING_EXCLUDED_ET).sort((a,b)=>a-b)');
tables.BOSS_MOVES_length=get('BOSS_MOVES.length');
tables.opening_excluded_probe=get('Array.from({length:100},(_,i)=>_CH1_OPENING_EXCLUDED_ET.has(i))');

// ---- literal entries of "const _e={...}" (for gen-cs.cjs): comments stripped, split at top-level commas ----
function parseEntries(src){
  const a=src.indexOf('const _e={'),b=src.indexOf('\n  };\n',a);if(a<0||b<0)throw Error('const _e literal not found');
  const body=src.slice(a+'const _e={'.length,b+3);// up to and including the closing "}" line start
  // strip // comments outside strings
  let out='',inStr=null;for(let i=0;i<body.length;i++){const c=body[i];
    if(inStr){out+=c;if(c===inStr&&body[i-1]!=='\\')inStr=null;continue;}
    if(c==="'"||c==='"'){inStr=c;out+=c;continue;}
    if(c==='/'&&body[i+1]==='/'){while(i<body.length&&body[i]!=='\n')i++;out+='\n';continue;}
    out+=c;}
  let s=out.trim();if(s.endsWith('}'))s=s.slice(0,-1);
  const entries=[];let depth=0,cur='';inStr=null;
  for(let i=0;i<s.length;i++){const c=s[i];
    if(inStr){cur+=c;if(c===inStr&&s[i-1]!=='\\')inStr=null;continue;}
    if(c==="'"||c==='"'){inStr=c;cur+=c;continue;}
    if('([{'.includes(c))depth++;if(')]}'.includes(c))depth--;
    if(c===','&&depth===0){entries.push(cur);cur='';continue;}
    cur+=c;}
  if(cur.trim())entries.push(cur);
  return entries.map(e=>e.replace(/\s+/g,' ').trim()).filter(Boolean).map(e=>{
    let depth=0,inS=null,idx=-1;for(let i=0;i<e.length;i++){const c=e[i];if(inS){if(c===inS)inS=null;continue;}if(c==="'"||c==='"'){inS=c;continue;}if('([{'.includes(c))depth++;if(')]}'.includes(c))depth--;if(c===':'&&depth===0){idx=i;break;}}
    return idx<0?{key:e,expr:e,shorthand:true}:{key:e.slice(0,idx).trim(),expr:e.slice(idx+1).trim()};});
}
const entries=parseEntries(mkEnText);

// ---- case generation ----
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seqFor(seed,first){const r=mulberry32(seed),arr=[];for(const f of first||[])arr.push(f);while(arr.length<260)arr.push(r());return arr;}
const SI_BY_HELL=[0,4,10,14,21,26,32],BOSS_SI=[0,1,2,3,10,34];
// first random value that makes rollElite return the given tier for stage si (null if the tier has probability 0 there)
function firstForTier(si,tier){const hell=tables.SI_TO_HELL[si]||0;const row=tables.ELITE_PROB[Math.max(0,Math.min(tables.ELITE_PROB.length-1,hell))];const m=row[0]||0,r=row[1]||0,c=row[2]||0;
  if(tier===3)return c>0?c/2:null;if(tier===2)return r>0?c+r/2:null;if(tier===1)return m>0?c+r+m/2:null;return Math.min(0.999999,c+r+m+(1-(c+r+m))/2);}
const cases=[];
function mk(name,o){
  const input={x:400.5,y:300.25,si:0,etype:0,ib:false,el:0,room:0,playerLevel:100,diff:5,stageDiffOff:0,stage:0,demoMode:false,demoLastStage:0,canMove:{kind:'open'},seed:1,first:[],...o};
  cases.push({name,input});
}
const ETYPES_ALL=Array.from({length:100},(_,i)=>i);
const chapterSi=e=>e>=90?10:SI_BY_HELL[Math.min(6,Math.floor(e/10))>6?6:Math.min(6,Math.floor(e/10))];
// A. every etype 0..99 (all etype-specific branches), plain roll
for(const e of ETYPES_ALL)mk('A etype '+e,{etype:e,si:chapterSi(e),x:400+e*3.1,y:300+e*1.7,el:e%7,room:e%5,seed:1000+e});
// A2. every etype 0..89 with a forced elite tier (magic/rare/champion rotate; falls back when the stage has 0 probability)
for(const e of ETYPES_ALL.filter(e=>e<90)){const si=chapterSi(e);let tier=1+(e%3);let f=firstForTier(si,tier);while(f===null){tier=tier-1||3;f=firstForTier(si,tier);}
  mk('A2 elite tier '+tier+' etype '+e,{etype:e,si,x:410+e*2.3,y:310+e*1.1,el:(e+3)%7,room:-1,seed:2000+e,first:[f]});}
// B. spec grid: etype x ib x playerLevel x difficulty x stage offset (rotating cover of the 15 x 6 x 3 x 2 product, every value pair appears)
const G15=[0,2,6,7,22,29,49,59,69,79,89,90,93,94,99],LV=[1,10,100,500,501,1000],DF=[0,5,10],OFF=[0,37];
let combo=0;
for(const lv of LV)for(const df of DF)for(const off of OFF){
  for(let k=0;k<4;k++){const e=G15[(combo*4+k)%15];mk('B lv'+lv+' diff'+df+' off'+off+' etype'+e,{etype:e,si:[0,3,10,14,21,34][(combo+k)%6],playerLevel:lv,diff:df,stageDiffOff:off,el:(combo+k)%7,room:k,x:500+combo*7.3+k,y:200+combo*3.7+k*2,seed:3000+combo*10+k});}
  for(let k=0;k<2;k++){const si=BOSS_SI[(combo*2+k)%6];mk('B boss si'+si+' lv'+lv+' diff'+df+' off'+off,{etype:G15[(combo+k*7)%15],ib:true,si,playerLevel:lv,diff:df,stageDiffOff:off,el:si%7,room:0,x:640+combo,y:480+k,seed:4000+combo*2+k,stage:si});}
  combo++;}
// B2. odd runtime values: difficulty index outside the tables, player level 0 (|| 1), huge negative stage offset
mk('B diff index 11 (|| fallback)',{etype:2,si:3,diff:11,seed:51});mk('B diff index -1',{etype:2,si:3,diff:-1,seed:52});mk('B playerLevel 0 (P.lv||1)',{etype:6,si:2,playerLevel:0,seed:53});
mk('B stage offset -900 clamps monLv to 1',{etype:7,si:2,stageDiffOff:-900,seed:54});mk('B playerLevel 1000 + diff 10 boss si34',{etype:0,ib:true,si:34,playerLevel:1000,diff:10,stage:34,seed:55});
mk('B playerLevel 5000 diff10 rare etype 92 (~~ wraps modulo 2^32)',{etype:92,si:10,playerLevel:5000,diff:10,seed:56});mk('B playerLevel 5000 diff10 boss si34',{etype:0,ib:true,si:34,stage:34,playerLevel:5000,diff:10,seed:57});
// C. elite tiers per hell: every tier with probability>0 for each hell, plus explicit tier 0
SI_BY_HELL.forEach((si,h)=>{for(const tier of [0,1,2,3]){const f=firstForTier(si,tier);if(f===null)continue;mk('C hell'+h+' tier'+tier,{etype:[0,2,6,7,22,29,49][h],si,seed:5000+h*10+tier,first:[f]});}});
// C2. rollMods/rollAura stress: tier 2/3 at every hell over several seeds + the first M02 (speed/projCd) cases found by running the original function
let m02=0;
SI_BY_HELL.forEach((si,h)=>{for(const tier of [2,3,1]){const f=firstForTier(si,tier);if(f===null)continue;for(let sd=0;sd<4;sd++){
  const c={etype:[0,2,6,7,22,29,49][h],si,seed:6000+h*100+tier*10+sd,first:[f]};mk('C2 hell'+h+' tier'+tier+' seed'+sd,c);}}});
// D. opening replacement (si0, non-boss, etype 2/22/30/43 -> 0), and the places it must NOT fire
for(const e of [2,22,30,43,5])mk('D si0 etype '+e,{etype:e,si:0,seed:7000+e});
mk('D si1 etype 2 (not replaced)',{etype:2,si:1,seed:7100});mk('D si0 boss etype 2 (not replaced)',{etype:2,si:0,ib:true,seed:7101,stage:0});
// E. druid finale
mk('E finale demo stage3 last3 boss si3 lv100',{etype:0,ib:true,si:3,stage:3,demoMode:true,demoLastStage:3,playerLevel:100,seed:8000});
mk('E finale demo stage3 last3 boss si3 lv1',{etype:0,ib:true,si:3,stage:3,demoMode:true,demoLastStage:3,playerLevel:1,seed:8001});
mk('E finale demo stage3 last3 boss si3 lv1000 diff10 off37',{etype:0,ib:true,si:3,stage:3,demoMode:true,demoLastStage:3,playerLevel:1000,diff:10,stageDiffOff:37,seed:8002});
mk('E finale off: demoMode false',{etype:0,ib:true,si:3,stage:3,demoMode:false,demoLastStage:3,seed:8003});
mk('E finale off: last stage 2',{etype:0,ib:true,si:3,stage:3,demoMode:true,demoLastStage:2,seed:8004});
mk('E finale off: stage 2',{etype:0,ib:true,si:3,stage:2,demoMode:true,demoLastStage:2,seed:8005});
mk('E finale off: non-boss si3',{etype:2,ib:false,si:3,stage:3,demoMode:true,demoLastStage:3,seed:8006});
mk('E finale off: boss si2 even with stage3 flags',{etype:0,ib:true,si:2,stage:3,demoMode:true,demoLastStage:3,seed:8007});
// F. spawn point handling: blocked -> safePt ring (success / failure), non-finite coordinates
mk('F blockDisc non-boss ring search',{etype:2,si:3,canMove:{kind:'blockDisc',cx:400.5,cy:300.25,rad:100},seed:9000});
mk('F blockDisc boss (radius 22) ring search',{etype:0,ib:true,si:1,stage:1,canMove:{kind:'blockDisc',cx:400.5,cy:300.25,rad:120},seed:9001});
mk('F blockDisc wide: ring exhausted at d=T*5 -> null',{etype:2,si:3,canMove:{kind:'blockDisc',cx:400.5,cy:300.25,rad:400},seed:9002});
mk('F blockAll -> null',{etype:2,si:3,canMove:{kind:'blockAll'},seed:9003});mk('F blockAll boss -> null',{etype:0,ib:true,si:1,stage:1,canMove:{kind:'blockAll'},seed:9004});
mk('F blockDisc rad 70 (moves on 3rd ring step)',{etype:6,si:2,canMove:{kind:'blockDisc',cx:400.5,cy:300.25,rad:70},seed:9005});
mk('F x NaN -> null',{x:'NaN',seed:9006});mk('F y Infinity -> null',{y:'Infinity',seed:9007});mk('F y -Infinity -> null',{y:'-Infinity',seed:9008});mk('F x NaN but blocked disc (finite check first)',{x:'NaN',canMove:{kind:'blockAll'},seed:9009});
// G. optional arguments: el / room undefined
mk('G el undefined, room undefined (non-boss)',{etype:2,si:3,el:null,room:null,seed:9100});mk('G el undefined boss',{etype:0,ib:true,si:3,stage:3,el:null,room:null,seed:9101});
mk('G el 6 room 99 rare 93',{etype:93,si:10,el:6,room:99,seed:9102});

// ---- run every case in the VM ----
const num=v=>typeof v==='string'?Number(v):v;
function run(c){
  const i=c.input;const seq=seqFor(i.seed,i.first);
  vm.runInContext('P.lv='+JSON.stringify(i.playerLevel)+';OPT.diff='+JSON.stringify(i.diff)+';G.stage='+i.stage+';G._stageDiffOff='+i.stageDiffOff+';_DEMO_MODE='+i.demoMode+';_DEMO_LAST_STAGE='+i.demoLastStage+';__calls=[];__i=0;',ctx);
  ctx.__seq=seq;ctx.__rule=i.canMove;
  ctx.__args=[num(i.x),num(i.y),i.si,i.etype,i.ib,i.el===null?undefined:i.el,i.room===null?undefined:i.room];
  const raw=vm.runInContext('(function(){const a=__args;return mkEn(a[0],a[1],a[2],a[3],a[4],a[5],a[6]);})()',ctx);
  const consumed=vm.runInContext('__i',ctx);
  const calls=plain(vm.runInContext('__calls',ctx));
  let result=null;
  if(raw!==null){
    const bad=[];const walk=(v,p)=>{if(typeof v==='number'&&(!isFinite(v)||Object.is(v,-0)))bad.push(p+'='+(Object.is(v,-0)?'-0':v));else if(v&&typeof v==='object')for(const k of Object.keys(v))walk(v[k],p+'.'+k);};walk(raw,'');
    if(bad.length)throw Error('case '+c.name+': non-JSON-safe numbers '+bad.join(','));
    result=JSON.parse(JSON.stringify(raw));}
  c.seq=seq.slice(0,consumed+8);c.expected={isNull:raw===null,consumed,canMoveCalls:calls,result};
}
for(const c of cases)run(c);
// M02 coverage check: at least one case with M02 in mods
const m02Cases=cases.filter(c=>c.expected.result&&c.expected.result.mods&&c.expected.result.mods.includes('M02')).length;
if(m02Cases===0)throw Error('no M02 case produced by the sweep; add seeds');
const tierCount={0:0,1:0,2:0,3:0};for(const c of cases)if(c.expected.result)tierCount[c.expected.result.elite]++;
let head='',dirty='';try{head=cp.execSync('"C:/Program Files/Git/cmd/git.exe" -C '+path.dirname(sourcePath)+' rev-parse HEAD').toString().trim();dirty=cp.execSync('"C:/Program Files/Git/cmd/git.exe" -C '+path.dirname(sourcePath)+' status --porcelain -- game.html').toString().trim();}catch(e){}
const out={schema:'exoduser.unity.enemy-spawn-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,head,gameHtmlWorkingTreeState:dirty||'clean',anchors,
  note:'blocks located by text anchors and executed unchanged in one Node VM; external pieces = P/OPT/G/_DEMO_* values, canMv rule, Math.random sequence'},
  tables,entries,summary:{cases:cases.length,nullResults:cases.filter(c=>c.expected.isNull).length,eliteTierCounts:tierCount,m02Cases,maxConsumed:Math.max(...cases.map(c=>c.expected.consumed))},cases};
fs.writeFileSync(outPath,JSON.stringify(out));
console.log(JSON.stringify({sha:fileSha,head,dirty:dirty||'clean',summary:out.summary,entries:entries.length,anchors:anchors.map(a=>a.name+':'+a.start+'-'+a.end)}));
