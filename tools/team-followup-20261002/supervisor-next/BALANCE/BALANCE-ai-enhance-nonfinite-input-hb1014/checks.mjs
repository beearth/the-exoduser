import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {tokenizer,parse} from 'acorn';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const rel='tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-ai-enhance-nonfinite-input-hb1014';
const own=path.dirname(fileURLToPath(import.meta.url));assert.equal(own,path.join(root,rel));assert.equal(process.cwd(),root);
const sha=s=>createHash('sha256').update(s).digest('hex');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const at=()=>{const d=new Date();return{UTC:d.toISOString(),KST:new Date(d.getTime()+32400000).toISOString().replace('Z','+09:00')};};
const encode=x=>JSON.parse(JSON.stringify(x,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v));
const inputs=['AGENTS.md',rel+'/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md','docs/14밸런스+수치테이블/14밸런스+수치테이블.md','game.html','game-easy-test.html'];
const e={taskId:'BALANCE-ai-enhance-nonfinite-input-hb1014',chatId:'01a0faaf-a06a-79a2-9def-58eb8ad10d65',provider:'Codex BALANCE',assignedUTC:'2026-10-02T10:35:54.431195+00:00',providedParentPin:'6b865637 (historical only; no current HEAD claim)',execution:{startedAt:at(),cwd:process.cwd(),node:process.version},inputs:Object.fromEntries(inputs.map(f=>[f,sha(read(f))])),sources:[],runs:[],errors:[],productionApplied:false,runtimeAccepted:false,previousTestsRerun:0,GitCommands:0,skillUsage:[],externalAPIUsage:[]};
function extract(s,name){const start=s.indexOf('function '+name+'(');assert(start>=0,name);const t=tokenizer(s.slice(start),{ecmaVersion:'latest'});let depth=0,opened=false;for(;;){const k=t.getToken(),l=k.type.label;if(l==='{'||l==='${'){depth++;opened=true;}if(l==='}')depth--;if(opened&&depth===0){const text=s.slice(start,start+k.end);parse(text,{ecmaVersion:'latest'});return{text,sha256:sha(text),line:s.slice(0,start).split('\n').length};}assert(l!=='eof');}}
const names=['enhRate','_malCost','enhCostRaw','enhCost','_itemEconomyRarity','aiEnhance','_doAiEnhance'];
const msg='강화 입력 오류';
const helperGuard="\n  if(!Number.isFinite(targetEnh)||!Number.isFinite(budget)||!Number.isFinite(item.enh??0))return{ok:false,msg:'강화 입력 오류',used:0,tries:0};";
const callerGuard="\n  if(!Number.isFinite(target)||!Number.isFinite(_aiItem.enh??0)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}";
const budgetGuard="  if(!Number.isFinite(budget)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}\n";
const longDigits='9'.repeat(309);
for(const file of ['game.html','game-easy-test.html']){
  const s=read(file),functions=Object.fromEntries(names.map(n=>[n,extract(s,n)]));
  const panelLine=s.split('\n').find(l=>l.includes('id="aiTargetInp"'));assert(panelLine);
  const panelExpression="G._aiTarget=Math.max(1,parseInt(this.value)||1)";
  assert(panelLine.includes("oninput=\"G._aiTarget=Math.max('+(_curEnh+1)+',parseInt(this.value)||'+(_curEnh+1)+')\""));
  const panel={G:{},input:{value:longDigits}};vm.runInNewContext('(function(){'+panelExpression+'}).call(input)',panel);assert.equal(panel.G._aiTarget,Infinity);
  const aiCandidate=functions.aiEnhance.text.replace("if(!item)return{ok:false,msg:'아이템 없음'};","if(!item)return{ok:false,msg:'아이템 없음'};"+helperGuard);
  const doCandidate=functions._doAiEnhance.text.replace('  let _expBudget=0;',callerGuard+'\n  let _expBudget=0;').replace('  if(budget<=0)',budgetGuard+'  if(budget<=0)');
  assert.notEqual(aiCandidate,functions.aiEnhance.text);assert.notEqual(doCandidate,functions._doAiEnhance.text);
  const loadLines=s.split('\n').filter(l=>l.includes('INV.bag=d.inv.bag')||l.includes('INV.equipped=d.inv.equipped'));
  e.sources.push({file,readAt:at(),wholeSha256:sha(s),functions,panel:{line:s.split('\n').indexOf(panelLine)+1,source:panelLine,sha256:sha(panelLine),executedExpression:panelExpression,curEnh:0,inputLength:309,inputSha256:sha(longDigits),valueResult:'Infinity',browserValidated:false},load:{source:loadLines.join('\n'),sha256:sha(loadLines.join('\n')),executed:false},candidate:{aiEnhance:aiCandidate,_doAiEnhance:doCandidate,aiSha256:sha(aiCandidate),callerSha256:sha(doCandidate)}});
  const base=names.filter(n=>!['aiEnhance','_doAiEnhance'].includes(n)).map(n=>functions[n].text).join('\n')+'\nconst _MALICE_COST_MUL=0.5;';
  for(const scenario of ['nonfinite target','finite target budget','insufficient budget'])for(const entry of ['helper','caller'])for(const policy of ['current','candidate']){
    const item={id:91,enh:0,rarity:2,nested:{keep:'original'}},G={mats:scenario==='insufficient budget'?1000:50000,_aiEnhSlot:'weapon',_aiTarget:scenario==='nonfinite target'?Infinity:2};
    const before=structuredClone(item),trace=[];
    const math=Object.create(Math);math.random=()=>{trace.push({op:'RNG',value:0});return 0;};
    const c={item,G,INV:{equipped:{weapon:item}},P:{x:0,y:0},Math:math,addTxt:(...a)=>trace.push({op:'addTxt',args:a}),_T:x=>x,dbSaveNow:()=>trace.push({op:'dbSaveNow'}),applyStats:()=>trace.push({op:'applyStats'}),$:()=>null,renderForge:()=>trace.push({op:'renderForge'})};
    const context=vm.createContext(c);
    vm.runInContext(base+'\n'+(policy==='current'?functions.aiEnhance.text:aiCandidate)+'\n'+(policy==='current'?functions._doAiEnhance.text:doCandidate),context);
    let result,error;const target=G._aiTarget,budget=G.mats;
    try{context.target=target;context.budget=budget;result=vm.runInContext(entry==='helper'?'aiEnhance(item,target,budget)':'_doAiEnhance()',context,{timeout:80});}catch(x){error={name:x.name,code:x.code,message:x.message};}
    const r={file,scenario,entry,policy,input:{item:before,target:encode(target),budget},after:{item:encode(item),mats:G.mats},returned:result===undefined?'undefined':encode(result),error,trace};e.runs.push(r);
    assert(Number.isFinite(G.mats));assert.deepEqual(item.nested,before.nested);
    if(scenario==='nonfinite target'){
      if(policy==='current'&&entry==='caller'){assert.equal(error?.code,'ERR_SCRIPT_EXECUTION_TIMEOUT');assert.deepEqual(item,before);assert.equal(G.mats,50000);}
      else if(policy==='current'){assert(!error);assert.equal(result.target,Infinity);assert.equal(result.used,32625);assert.equal(item.enh,2);assert.equal(G.mats,17375);}
      else{assert(!error);assert.deepEqual(item,before);assert.equal(G.mats,50000);assert(!trace.some(x=>['RNG','dbSaveNow','applyStats','renderForge'].includes(x.op)));if(entry==='helper'){assert.equal(result.ok,false);assert.equal(result.used,0);assert.equal(result.tries,0);assert.equal(result.msg,msg);}else assert.equal(trace[0].args[2],msg);}
    }else{
      assert(!error);if(scenario==='finite target budget'){assert.equal(item.enh,2);assert.equal(G.mats,17375);assert.equal(trace.filter(x=>x.op==='RNG').length,2);}
      else{assert.deepEqual(item,before);assert.equal(G.mats,1000);assert.equal(trace.filter(x=>x.op==='RNG').length,0);}
    }
  }
}
for(const file of ['game.html','game-easy-test.html'])for(const scenario of ['finite target budget','insufficient budget'])for(const entry of ['helper','caller']){const pair=e.runs.filter(r=>r.file===file&&r.scenario===scenario&&r.entry===entry);assert.deepEqual(pair[0].after,pair[1].after);assert.deepEqual(pair[0].returned,pair[1].returned);assert.deepEqual(pair[0].trace,pair[1].trace);}
const query='aiEnhance|_doAiEnhance|_aiTarget|enhCost|자동 강화';
const search=spawnSync('rg',['-n',query,'docs/'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "'+query+'" docs/',exitCode:search.status,matchCount:lines.length,outputSha256:sha(search.stdout),documents:[...new Set(lines.map(l=>l.split(':')[0]))]};
e.anchorDrift=e.sources.map(x=>({file:x.file,changedFunctions:names.filter(n=>extract(read(x.file),n).sha256!==x.functions[n].sha256),wholeChanged:sha(read(x.file))!==x.wholeSha256}));assert(e.anchorDrift.every(x=>!x.changedFunctions.length));
e.verification={status:'PASS_DEFECT_REPRODUCED_MEMORY_GUARDS_CONTROLS_EQUAL',nonfiniteEvent:1,controls:2,variants:2,entries:2,policies:2,sourceExecutions:24,browserValidated:false,loadExecuted:false,NaNBudgetItemEnhCasesExecuted:false};
e.execution.endedAt=at();e.checksSha256=sha(fs.readFileSync(fileURLToPath(import.meta.url)));e.status='COMPLETED_CANDIDATE_UNAPPLIED';
const report=path.join(own,'result.md');assert(fs.existsSync(report),'pre-created owned report required');
fs.appendFileSync(report,'\n## 실행 evidence JSON\n\n```json\n'+JSON.stringify(e,null,2)+'\n```\n');
console.log(JSON.stringify({status:e.status,verification:e.verification,time:e.execution,docsMatches:lines.length,docsDocuments:e.docsSearch.documents.length,sha:e.sources.map(x=>({file:x.file,whole:x.wholeSha256,ai:x.functions.aiEnhance.sha256,caller:x.functions._doAiEnhance.sha256})),checksSha256:e.checksSha256},null,2));
