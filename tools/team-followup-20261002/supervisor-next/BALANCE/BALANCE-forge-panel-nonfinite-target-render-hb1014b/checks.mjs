import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {tokenizer,parse} from 'acorn';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const rel='tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-forge-panel-nonfinite-target-render-hb1014b';
const own=path.dirname(fileURLToPath(import.meta.url));assert.equal(own,path.join(root,rel));assert.equal(process.cwd(),root);
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),sha=x=>createHash('sha256').update(x).digest('hex');
const at=()=>{const d=new Date();return{UTC:d.toISOString(),KST:new Date(d.getTime()+32400000).toISOString().replace('Z','+09:00')};};
const encode=x=>JSON.parse(JSON.stringify(x,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
function extract(s,name){const start=s.indexOf('function '+name+'(');assert(start>=0,name);const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let depth=0,open=false;for(;;){const tok=t.getToken(),l=tok.type.label;if(l==='{'||l==='${'){depth++;open=true;}if(l==='}')depth--;if(open&&depth===0){const text=s.slice(start,start+tok.end);parse(text,{ecmaVersion:'latest'});return{text,sha256:sha(text),line:s.slice(0,start).split('\n').length};}assert(l!=='eof');}}
const files=['game.html','game-easy-test.html'];
const inputs=['AGENTS.md',rel+'/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md','docs/14밸런스+수치테이블/14밸런스+수치테이블.md','docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md',...files];
const e={taskId:'BALANCE-forge-panel-nonfinite-target-render-hb1014b',assignedUTC:'2026-10-02T11:02:19.288804+00:00',provider:'Codex BALANCE',chatId:'01a0faaf-a06a-79a2-9def-58eb8ad10d65',historicalParentPin:'d5c1b62d; no current HEAD observation',execution:{startedAt:at(),cwd:process.cwd(),node:process.version},inputs:Object.fromEntries(inputs.map(f=>[f,sha(read(f))])),sources:[],runs:[],errors:[],productionApplied:false,runtimeAccepted:false,previousTestsRerun:0,GitCommands:0,skillUsage:[],externalAPIUsage:[]};
assert.equal(e.inputs[rel+'/TASK.md'],'e43cc4c6382e69dcff3815cfe14cbdd6a8ff1fd7b76a53af0ed047f4b6042bca');
const names=['openPanel','renderForge','enhRate','enhCostRaw','enhCost','_malCost','_itemEconomyRarity','enhColor','enhRateColor','enhMul','enhMulAtk'];
const old="if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;";
const fixed="if(!Number.isFinite(G._aiTarget)||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;";
function run(functions,candidate,nonfinite){
  const nodes=new Map(),trace=[];
  class Element{
    constructor(tag,id=null){this.tag=tag;this.id=id;this.children=[];this.parent=null;this.className='';this._html='';this._text='';this.classes=new Set();this.style={setProperty:(k,v)=>{this.style[k]=v;}};this.classList={add:(...v)=>{v.forEach(x=>this.classes.add(x));trace.push({op:'classAdd',id,values:v});}};}
    set textContent(v){assert.equal(this.children.length,0,'leaf text assignment');this._text=String(v);}get textContent(){return this._text;}
    set innerHTML(v){this._html=String(v);this.children=[];}get innerHTML(){return this._html;}
    appendChild(c){c.parent=this;this.children.push(c);return c;}
    replaceChildren(...c){this.children=[];for(const x of c)this.appendChild(x);}
    insertBefore(c,ref){c.parent=this;const i=ref?this.children.indexOf(ref):-1;if(i<0)this.children.push(c);else this.children.splice(i,0,c);return c;}
    get nextSibling(){if(!this.parent)return null;return this.parent.children[this.parent.children.indexOf(this)+1]||null;}
    snapshot(){return{tag:this.tag,id:this.id,classes:[...this.classes],className:this.className,text:this._text,html:this._html,style:Object.fromEntries(Object.entries(this.style).filter(([k])=>k!=='setProperty')),children:this.children.map(x=>x.snapshot())};}
  }
  const $=id=>{if(!nodes.has(id))nodes.set(id,new Element('div',id));return nodes.get(id);};
  const item={id:93,slot:'weapon',name:'기존 무기',enh:0,rarity:2},before=structuredClone(item);
  const G={mats:50000,forgeTab:'upgrade',_aiEnhSlot:'weapon',_aiTarget:nonfinite?Infinity:2};
  const c={G,INV:{equipped:{weapon:item}},$: $,document:{createElement:t=>new Element(t)},_forgeSel:null,_salSel:new Set(),_rerollSel:null,_crForgeSel:-1,_T:x=>x,_L:ko=>ko,_earringSlot:()=>false,_slotName:()=>'',SLOT_NAMES:[],RARITY_C:['c0','c1','c2','c3','c4'],_ensureForgeAtlasLoad:()=>trace.push({op:'atlasLoadStub'}),BGM:{play:key=>trace.push({op:'BGMStub',key})},closeAllPanels:v=>trace.push({op:'closeAllPanelsStub',value:v}),_injectPanelNav:id=>trace.push({op:'injectNavStub',id}),setTimeout:(fn,ms)=>{trace.push({op:'timerScheduled',ms});return 1;},dbSaveNow:()=>{throw Error('unexpected save');}};
  const context=vm.createContext(c);
  vm.runInContext('const _MALICE_COST_MUL=0.5;\n'+names.map(n=>n==='renderForge'?candidate:functions[n].text).join('\n'),context);
  let error;try{vm.runInContext("openPanel('forge')",context,{timeout:80});}catch(x){error={name:x.name,code:x.code,message:x.message};}
  const panel=$('fgGrid').children.find(x=>x.innerHTML.includes('id="aiTargetInp"'));
  return{input:{target:nonfinite?'Infinity':2,item:before,mats:50000},after:{target:encode(G._aiTarget),item:encode(item),mats:G.mats,paused:G.paused,forgeOpen:G.forgeOpen},error,trace,panelHTML:panel?.innerHTML||null,DOM:[...nodes.values()].map(x=>x.snapshot()),itemIdentityPreserved:c.INV.equipped.weapon===item};
}
for(const file of files){
  const s=read(file),functions=Object.fromEntries(names.map(n=>[n,extract(s,n)]));assert(functions.renderForge.text.includes(old));
  const candidate=functions.renderForge.text.replace(old,fixed);
  e.sources.push({file,readAt:at(),wholeSha256:sha(s),functions,candidate:{sha256:sha(candidate),old,new:fixed},panelPolicyBasis:'existing undefined/at-or-below currentEnh fallback=currentEnh+100; extend invalid target fallback, no new cap'});
  for(const nonfinite of [true,false])for(const [policy,fragment] of [['current',functions.renderForge.text],['candidate',candidate]]){
    const r={file,policy,scenario:nonfinite?'nonfinite target panel open':'normal target2 panel open',...run(functions,fragment,nonfinite)};e.runs.push(r);
    assert.deepEqual(r.after.item,r.input.item);assert.equal(r.after.mats,50000);assert(r.itemIdentityPreserved);assert.equal(r.after.paused,true);assert.equal(r.after.forgeOpen,true);assert.equal(r.trace.filter(t=>t.op==='timerScheduled').length,0);
    if(nonfinite&&policy==='current'){assert.equal(r.error?.code,'ERR_SCRIPT_EXECUTION_TIMEOUT');assert.equal(r.panelHTML,null);assert.equal(r.after.target,'Infinity');}
    else{assert(!r.error);assert(r.panelHTML);assert(!r.panelHTML.includes('Infinity'));assert(!r.panelHTML.includes('NaN'));assert(r.panelHTML.includes('value="'+(nonfinite?100:2)+'"'));assert.equal(r.after.target,nonfinite?100:2);}
  }
  const controls=e.runs.filter(r=>r.file===file&&r.scenario==='normal target2 panel open');assert.deepEqual(controls[0].DOM,controls[1].DOM);assert.deepEqual(controls[0].trace,controls[1].trace);assert.deepEqual(controls[0].after,controls[1].after);
  // Independent display expectation from the actual unchanged cost helpers, not a replaced loop counter.
  const calculator=vm.createContext({});vm.runInContext('const _MALICE_COST_MUL=0.5;'+['enhRate','enhCostRaw','enhCost','_malCost','_itemEconomyRarity'].map(n=>functions[n].text).join('\n'),calculator);
  const displayed=vm.runInContext('Math.ceil(enhCost(0,2).cost/enhCost(0,2).rate+enhCost(1,2).cost/enhCost(1,2).rate)',calculator);assert(controls[0].panelHTML.includes(displayed.toLocaleString()));
  e.sources.at(-1).normalExpectedDisplay=displayed;
}
const query='renderForge|_aiTarget|自動|자동 강화|enhCost';
const search=spawnSync('rg',['-n',query,'docs/'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "'+query+'" docs/',exitCode:search.status,matchCount:lines.length,outputSha256:sha(search.stdout),documents:[...new Set(lines.map(l=>l.split(':')[0]))]};
e.anchorDrift=e.sources.map(x=>({file:x.file,changedFunctions:names.filter(n=>extract(read(x.file),n).sha256!==x.functions[n].sha256),wholeChanged:sha(read(x.file))!==x.wholeSha256}));assert(e.anchorDrift.every(x=>x.changedFunctions.length===0));
e.verification={status:'PASS_PANEL_DEFECT_FALLBACK_CONTROL_EQUIVALENT',failureEvent:1,normalControl:1,variants:2,policies:2,panelSourceRuns:8,costDisplayChecks:2,browserNumberInputVerified:false,visualAccepted:false};
e.execution.endedAt=at();e.checksSha256=sha(fs.readFileSync(fileURLToPath(import.meta.url)));
fs.appendFileSync(path.join(own,'result.md'),'\n## 실행 evidence JSON\n\n```json\n'+JSON.stringify(e,null,2)+'\n```\n');
console.log(JSON.stringify({verification:e.verification,time:e.execution,docs:{matches:lines.length,documents:e.docsSearch.documents.length},sources:e.sources.map(x=>({file:x.file,whole:x.wholeSha256,render:x.functions.renderForge.sha256,caller:x.functions.openPanel.sha256,display:x.normalExpectedDisplay})),checksSha256:e.checksSha256},null,2));
