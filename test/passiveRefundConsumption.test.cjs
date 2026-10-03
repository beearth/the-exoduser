// Whole actual dbRestore, refundTotals/evaluatePlan and both HTML growth
// adapters. Mount/render/applyStats/audio/network/storage are recording doubles.
// The actual mounted reset callback runs with render as a double. Child process
// deadlines contain original unbounded loops; no user saves, native game or full DOM run.
const test=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
function isolated(name,fn){
 test(name,()=>{
  if(process.env.EXODUSER_REFUND_WORKER==='1')return fn();
  const childEnv={...process.env,EXODUSER_REFUND_WORKER:'1',EXODUSER_REFUND_WORKER_FILE:name.startsWith('game.html ')?'game.html':'game-easy-test.html'};delete childEnv.NODE_TEST_CONTEXT;
  const result=spawnSync(process.execPath,['--test','--test-name-pattern','^'+name.replaceAll('.','[.]')+'$',__filename],{cwd:root,env:childEnv,timeout:3000,encoding:'utf8'});
  assert.equal(result.status,0,`isolated consumer status=${result.status} error=${result.error?.code||''} signal=${result.signal||''}\n${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout,/tests 1\b/,`child test must actually run: ${result.stdout}`);
 });
}
const deadline=process.env.EXODUSER_REFUND_WORKER==='1'?{}:{timeout:150};
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const before=process.env.EXODUSER_TEST_BASELINE_DIR;
assert(before,'Explicit original baseline is required');
const helper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8');
const h={require:n=>n==='node:vm'?{...vm,createContext:c=>vm.createContext(c,{microtaskMode:'afterEvaluate'})}:require(n),__dirname:path.join(root,'test'),process,console};
vm.createContext(h);vm.runInContext(helper.slice(0,helper.indexOf("for(const file of ['game.html'")),h);
const plain=x=>JSON.parse(JSON.stringify(x));
function source(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8');
 const src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>s.includes('function dbRestore('));
 const ast=acorn.parse(src,{ecmaVersion:'latest'}),code=name=>{
  const nodes=ast.body.filter(n=>n.type==='FunctionDeclaration'?n.id.name===name:n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));
  assert.equal(nodes.length,1,name);const n=nodes[0];return src.slice(n.start,n.end);
 };
 const a=src.indexOf("$('statResetBtn').onclick=async()=>{");assert(a>0);
 const handler=acorn.parseExpressionAt(src,a,{ecmaVersion:'latest'});
 return {all:h.extract(file,base),panel:fs.readFileSync(path.join(base,'stat-panel-ui.js'),'utf8'),
  decl:['PASSIVE_DEF','STAT_DEF','STAT_MAX'].map(code).join('\n'),render:code('renderStatPanel'),direct:src.slice(handler.start,handler.end),
  queue:file==='game.html'?code('_passiveQueueItems')+'\n'+code('_processPassiveQueue'):''};
}
const resetMarker="$('statResetBtn').onclick=()=>{";
function fixture(s,raw=10,{confirm=true,late=null}={}){
 const c=h.fixture(s.all);c.PASSIVES.pAtk=0;c.STATS.str=0;c.STATS.vit=0;
 c.data={player:{lv:1,hp:200,mp:60,st:60,shield:10,sp:2,ap:3,exp:0,maxExp:100000},
  stats:{str:5,vit:2},passives:{pAtk:raw,pHuman:0,pDemon:0},grit:3,gritCostModeV2:true};
 assert.equal(c.dbRestore(c.data),true);c.calls.length=0;
 c.nodes={};c.$=id=>c.nodes[id]||(c.nodes[id]={style:{display:'none'}});
 c.confirm=confirm;c.late=late;c.SFX.pickup=()=>c.calls.push(['pickup']);
 c.dbSaveNow=()=>c.calls.push(['saveNow']);c._stripIco=x=>x;c.toggleStatSummary=()=>{};
 vm.runInContext(s.panel+'\n'+s.decl+'\n'+s.queue+'\nvar _statPanelUI=null;\n'+s.render+'\n'+s.direct,c);
 vm.runInContext(`ExoduserStatsPanel.mount=api=>{globalThis.api=api;return {render:()=>calls.push(['render'])}};
 gameConfirm=async text=>{calls.push(['confirm']);if(late!==null)PASSIVES.pAtk=late;return confirm;};`,c);
 return c;
}
function state(c){return {P:plain(c.P),G:plain(c.G),stats:{...c.STATS},passives:{...c.PASSIVES},grit:vm.runInContext('_grit',c),calls:plain(c.calls)};}
function direct(c){vm.runInContext("$('statResetBtn').onclick().then(()=>globalThis.done=true)",c,deadline);assert.equal(c.done,true);return state(c);}
function planned(c){
 vm.runInContext('renderStatPanel();var plan=ExoduserStatsPanel.createPlan(api.state());',c);
 const at=fs.readFileSync(path.join(dir,'stat-panel-ui.js'),'utf8').indexOf(resetMarker);assert(at>0);
 const panel=fs.readFileSync(path.join(dir,'stat-panel-ui.js'),'utf8'),node=acorn.parseExpressionAt(panel,at,{ecmaVersion:'latest'});
 vm.runInContext('function render(){calls.push(["draftRender"])};'+panel.slice(node.start,node.end),c);
 vm.runInContext("$('statResetBtn').onclick();globalThis.applied=api.applyPlan(plan)",c,deadline);
 return {applied:c.applied,...state(c)};
}
for(const file of (process.env.EXODUSER_REFUND_WORKER_FILE?[process.env.EXODUSER_REFUND_WORKER_FILE]:['game.html','game-easy-test.html'])){
 const s=source(file,dir),original=source(file,before);
 test(file+' whole restore accepts Infinity string without changing the raw input',()=>{
  const c=fixture(s,'Infinity');assert.equal(c.PASSIVES.pAtk,Infinity);assert.equal(c.data.passives.pAtk,'Infinity');
 });
 for(const raw of [0,1,3,4,6,9,10,11,20,999,10000,.5,10.5,-5,'10','ab',null])test(file+' normal/legacy/fractional direct and planned compatibility '+JSON.stringify(raw),()=>{
  assert.deepEqual(direct(fixture(s,raw)),direct(fixture(original,raw)));
  assert.deepEqual(planned(fixture(s,raw)),planned(fixture(original,raw)));
 });
 test(file+' every actual passive cost level0..10 and legacy11/20 matches original',()=>{
  const c=fixture(s),o=fixture(original);vm.runInContext('globalThis.defs=PASSIVE_DEF',c);
  assert.equal(c.defs.length,26);for(const d of c.defs){assert.equal(d.max,10);
   for(const n of [0,1,2,3,4,5,6,7,8,9,10,11,20]){
    const a=c.ExoduserStatsPanel.refundTotals({str:5,vit:2},{[d.key]:n},3),b=o.ExoduserStatsPanel.refundTotals({str:5,vit:2},{[d.key]:n},3);
    assert.deepEqual(plain(a),plain(b));assert.equal(a.sp,10);
   }
  }
 });
 test(file+' cancel and latest allocation re-read preserve original behavior',()=>{
  assert.deepEqual(direct(fixture(s,10,{confirm:false})),direct(fixture(original,10,{confirm:false})));
  const c=fixture(s,3,{late:10}),r=direct(c);assert.equal(r.P.ap,26);assert.equal(r.P.sp,12);
  assert.equal(r.passives.pAtk,0);assert.equal(r.calls.filter(x=>x[0]==='saveNow').length,1);
  assert.deepEqual(r,direct(fixture(original,3,{late:10})));
 });
 for(const raw of ['Infinity',1e9,1e20])isolated(file+' bounded restored level direct/planned '+raw,()=>{
  const c=fixture(s,raw),prior=state(c),r=direct(c);
  if(raw===1e9){assert.equal(r.P.ap,4999999976);assert.equal(r.passives.pAtk,0)}
  else {assert.deepEqual(r.P,prior.P);assert.deepEqual(r.passives,prior.passives);assert.deepEqual(r.stats,prior.stats);assert.equal(r.grit,prior.grit);assert.deepEqual(r.calls.map(x=>x[0]),['notify']);}
  const p=fixture(s,raw),initial=state(p),z=planned(p);
  if(raw===1e9){assert.equal(z.applied,true);assert.equal(z.P.ap,4999999976)}
  else {assert.equal(z.applied,false);assert.deepEqual(z.P,initial.P);assert.deepEqual(z.passives,initial.passives);assert.deepEqual(z.stats,initial.stats);assert.equal(z.calls.filter(x=>x[0]==='saveNow').length,0)}
 });
 isolated(file+' invalid allocation arriving after confirmation never clears or credits',()=>{
  const c=fixture(s,10,{late:'Infinity'});c.late=Infinity;const prior=state(c),r=direct(c);
  assert.deepEqual(r.P,prior.P);assert.equal(r.passives.pAtk,Infinity);assert.deepEqual(r.stats,prior.stats);assert.equal(r.grit,prior.grit);
  assert.deepEqual(r.calls.map(x=>x[0]),['confirm','notify']);
 });
 isolated(file+' no arbitrary truncation for billion ranks and safe result no player mutation',()=>{
  const c=fixture(s,1e9),prior=state(c);vm.runInContext('globalThis.refund=ExoduserStatsPanel.refundTotals(STATS,PASSIVES,_grit)',c,deadline);
  assert.equal(c.refund.ap,4999999973);assert.deepEqual(state(c),prior);
 });
}
