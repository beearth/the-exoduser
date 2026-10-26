// CX-01 enemy tables oracle exporter: extracts the original table declarations from game.html by text anchors (first line must start with the
// expected declaration, the block ends where the source compiles / at the named closing line), executes them in a Node VM and writes oracle.json.
//   node export.cjs [--source G:/exoduser/game.html] [--expect-source-sha <sha256>] [--out oracle.json]
// Nothing is typed by hand: the tables come from the original text; gen-cs.cjs emits EnemyTables.cs from the same evaluated values.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source','G:/exoduser/game.html'),outPath=arg('--out',path.join(__dirname,'oracle.json'));
const text=fs.readFileSync(sourcePath,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),fileSha=sha(text);
if(arg('--expect-source-sha',null)&&arg('--expect-source-sha',null)!==fileSha)throw Error('game.html changed: '+fileSha);
const lines=text.split('\n');const anchors=[];
const compiles=src=>{try{new vm.Script(src);return true;}catch(e){return false;}};
function find(prefix){const hits=[];for(let i=0;i<lines.length;i++)if(lines[i].startsWith(prefix))hits.push(i);if(hits.length!==1)throw Error('anchor '+JSON.stringify(prefix)+' matched '+hits.length+' lines');return hits[0];}
function record(name,start,end){const body=lines.slice(start,end+1).join('\n');anchors.push({name,start:start+1,end:end+1,sha256:sha(body),first:lines[start].slice(0,90)});return body;}
// statement block: accumulate lines until the text compiles (comments inside are kept as they are in the source)
function stmt(name,prefix){const s=find(prefix);for(let e=s;e<Math.min(lines.length,s+400);e++){const body=lines.slice(s,e+1).join('\n');if(compiles(body))return record(name,s,e);}throw Error('no complete statement from '+prefix);}
// block that ends at the first column-0 "}" after the start (for loops)
function untilBrace(name,prefix){const s=find(prefix);for(let e=s+1;e<lines.length;e++)if(lines[e]==='}'||lines[e]==='}\r')return record(name,s,e);throw Error('no closing brace for '+prefix);}
const blocks=[];
const add=(b)=>blocks.push(b);
add(stmt('EL','const EL={'));
add(stmt('CHAPTER_STAGES','const CHAPTER_STAGES=['));
add(stmt('TOTAL_STAGES','const TOTAL_STAGES='));
add(stmt('HELL_NAMES','const HELL_NAMES=['));
add(stmt('HELL_THEMES','const HELL_THEMES=['));
add(stmt('HELL_BOSSES','const HELL_BOSSES=['));
add(untilBrace('SI_TO_HELL+SI_TO_FLOOR loop','const SI_TO_HELL=new Uint8Array'));
add(untilBrace('STG loop','const STG=[];'));
for(const n of ['ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_R','ETYPE_RANGE','ETYPE_POISE','ETYPE_SHIELD','ETYPE_COL','ETYPE_COLS','ETYPE_ERES','RARE_ETYPE','ELITE_TIERS','ELITE_PROB','MOD_DEFS','DIFF_MUL','DIFF_LV_OFF']){
  const s=find('const '+n+'=');if(n==='DIFF_MUL'||n==='DIFF_LV_OFF'){add(record(n,s,s));}else add(stmt(n,'const '+n+'='));}
add(stmt('ETYPE_SPD','const ETYPE_SPD='));
add(stmt('isRareEtype','function isRareEtype('));
const ctx=vm.createContext({});
for(const b of blocks)vm.runInContext(b,ctx);
const plain=o=>JSON.parse(JSON.stringify(o,(k,v)=>ArrayBuffer.isView(v)?Array.from(v):v));
const get=n=>plain(vm.runInContext(n,ctx));
const tables={};
for(const n of ['ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_SPD','ETYPE_R','ETYPE_RANGE','ETYPE_POISE','ETYPE_SHIELD','ETYPE_COL','ETYPE_COLS','ETYPE_ERES','RARE_ETYPE','ELITE_TIERS','ELITE_PROB','MOD_DEFS','DIFF_MUL','DIFF_LV_OFF','SI_TO_HELL','SI_TO_FLOOR','CHAPTER_STAGES','TOTAL_STAGES','HELL_NAMES','STG','EL'])tables[n]=get(n);
// isRareEtype over a range (function executed as written)
tables.isRareEtype=get('Array.from({length:130},(_,i)=>isRareEtype(i))');
let head='',dirty='';try{head=cp.execSync('git -C '+path.dirname(sourcePath)+' rev-parse HEAD').toString().trim();dirty=cp.execSync('git -C '+path.dirname(sourcePath)+' status --porcelain -- game.html').toString().trim();}catch(e){}
const lengths={};for(const [k,v] of Object.entries(tables))if(Array.isArray(v))lengths[k]=v.length;
lengths.RARE_ETYPE_keys=Object.keys(tables.RARE_ETYPE).length;
const out={schema:'exoduser.unity.enemy-tables-oracle.v1',source:{path:sourcePath,sha256:fileSha,lines:lines.length,head,gameHtmlWorkingTreeState:dirty||'clean',anchors,note:'blocks are located by text anchors and executed unchanged in one Node VM context (no stubs needed except the empty global scope)'},executed:blocks,lengths,tables};
fs.writeFileSync(outPath,JSON.stringify(out,null,1));
console.log(JSON.stringify({sha:fileSha,head,dirty:dirty||'clean',lengths,anchors:anchors.map(a=>a.name+':'+a.start+'-'+a.end)}));
