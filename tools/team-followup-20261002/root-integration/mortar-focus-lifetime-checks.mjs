// Root verification: current HTML source extraction; read-only inputs and JSON stdout.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.join(root,'tools/team-followup-20261002/root-integration/mortar-focus-lifetime-checks.mjs');
const backup=path.join(root,'tmp/mac-migration-runtime/continued-review-20261002/mortar-focus-backup');
const oldGuard="if(typeof P!=='undefined'&&P)P._beamHold=false;";
const newGuard="if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false}";
const cancellations='P._mmAiming=false;P._mmCharging=false';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={taskId:'ROOT-MORTAR-FOCUS-LIFETIME-20261002',startedUTC:new Date().toISOString(),
  node:process.version,nodeExecutable:process.execPath,productionApplied:true,
  productionAccepted:false,productionAcceptedScope:'mortar focus guard source only',runtimeAccepted:false,
  roleExecutionsRerun:0,writes:0,files:[],syntax:[],
  realBoundary:'current source slot dispatch, registered keyup/blur/hidden listener, held-input helper, aim block, fire and MP cost chain',
  doubles:'event registry/document.hidden, P/G/input containers, slot eligibility, passive/equipment inputs, seeded RNG, SFX/voice/shake/proficiency/message recorders',
  limits:{player:'Lv1 MP100, no discount, no fusion',nativeInput:false,wholeUpdate:false,hiddenRaf:false,
    pause:false,deathRevive:false,stageCarry:false,gamepad:false,otherSkillCancellation:false,
    mpConfirmRecheck:false,activeIceMortar:false,otherRngBranches:false,audioBackend:false,audioPlayback:false,
    visual:false,game:false,storage:false,package:false}};

function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const value of Object.values(node)){
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
function extract(source,file){
  const nodes=[];let js=0,maps=0;
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    const attributes=match[1],text=match[2];
    if(/\bsrc\s*=/i.test(attributes))continue;
    const type=(/\btype\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1]||'').toLowerCase();
    if(type==='importmap'){JSON.parse(text);maps++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    const offset=match.index+match[0].indexOf('>')+1;
    const ast=parse(text,{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});js++;
    walk(ast,node=>nodes.push({node,text,offset}));
  }
  const one=(label,predicate)=>{
    const matches=nodes.filter(({node,text})=>predicate(node,text));
    assert.equal(matches.length,1,file+' '+label+' exact source count');
    const {node,text,offset}=matches[0];
    return {name:label,text:text.slice(node.start,node.end),line:source.slice(0,offset+node.start).split('\n').length};
  };
  const funcs=['_dispatchSkillSlot','_clearHeldInput','fireMaliceMortar','_skLv','_dpsCostMul','pMagicCost','mpCost','useMp','_isFused','_r']
    .map(name=>one(name,node=>node.type==='FunctionDeclaration'&&node.id?.name===name));
  const declarations=['_lastCost','_COST_BASE','_COST_SK','_COST_DPS','EL'].map(name=>
    one(name,node=>node.type==='VariableDeclaration'&&node.declarations.length===1&&node.declarations[0].id?.name===name));
  const aim=one('mortarAim',node=>node.type==='IfStatement'&&node.test.type==='MemberExpression'&&
    node.test.object.name==='P'&&node.test.property.name==='_mmAiming'&&
    node.consequent.body?.some(statement=>statement.type==='VariableDeclaration'&&statement.declarations.some(d=>d.id?.name==='_mmK')));
  const event=(name,label,predicate)=>one(label,(node,text)=>node.type==='ExpressionStatement'&&
    node.expression.type==='CallExpression'&&node.expression.arguments[0]?.value===name&&predicate(node.expression,text));
  const blur=event('blur','registeredBlur',call=>call.callee.type==='Identifier'&&call.callee.name==='addEventListener'&&call.arguments[1]?.name==='_clearHeldInput');
  const hidden=event('visibilitychange','registeredHidden',(call,text)=>call.callee.type==='MemberExpression'&&
    call.callee.object.name==='document'&&call.callee.property.name==='addEventListener'&&
    text.slice(call.arguments[1].start,call.arguments[1].end).includes('if(document.hidden)_clearHeldInput()'));
  const keyup=event('keyup','registeredKeyup',(call,text)=>call.callee.type==='Identifier'&&call.callee.name==='addEventListener'&&
    text.slice(call.arguments[1].start,call.arguments[1].end).includes('K[e.code]=false;KH[e.code]=false;'));
  const helper=funcs.find(part=>part.name==='_clearHeldInput');
  assert.equal(helper.text.split(newGuard).length-1,1,file+' production focus guard');
  assert.equal(helper.text.split(cancellations).length-1,1,file+' cancellation count');
  report.syntax.push({file,inlineJavaScript:js,importMapJSON:maps,status:'PASS'});
  return {funcs,declarations,aim,blur,hidden,keyup,helper};
}
function seededRandom(seed){
  return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
function world(parts,variant){
  const registry={window:new Map(),document:new Map()};
  const register=(target,name,callback)=>{
    assert.equal(typeof callback,'function');
    const entries=registry[target].get(name)||[];entries.push(callback);registry[target].set(name,entries);
  };
  const rngState={count:0},random=seededRandom(0x5EED),math=Object.create(Math);
  math.random=()=>{rngState.count++;return random();};
  const document={hidden:false,addEventListener:(name,callback)=>register('document',name,callback)};
  const sandbox={Math:math,rngState,document,window:{},addEventListener:(name,callback)=>register('window',name,callback)};
  const context=vm.createContext(sandbox);
  const definitions=parts.funcs.map(part=>part.name==='_clearHeldInput'&&variant==='cancelRemovedMemory'
    ?part.text.replace(cancellations,''):part.text);
  new vm.Script(`
    const K={Digit1:true,KeyW:true},KH={Digit1:true,KeyW:true};
    const MB={0:false,1:false,2:false},MBjust={0:false,1:false,2:false};
    let _dashHold=true,_dashHoldF=80,_dashTier=2,_harpActive=false,_dashActive=false;
    let _cutSkipHolding=true,_cutSkipHold=10;
    const sp=1,_MAP_QA_MODE=false,_gpActive=false;
    const SKILL_SLOTS=['maliceMortar'],ULT_SLOT=null;
    const BINDS={beam:'mouse2'},BINDS2={beam:''};
    const PASSIVES={pMagic:0},_eqAffix=()=>0,_uEq=()=>0;
    const _canAssignSkillSlot=()=>true,_isAbsorbed=()=>false;
    const logs=[];
    const record=(kind,args)=>logs.push({kind,args:[...args]});
    const SFX={magic:(...args)=>record('SFX.magic',args)};
    const playSample=(...args)=>record('playSample',args),shake=(...args)=>record('shake',args);
    const _addSkProf=(...args)=>record('proficiency',args),showPH=(...args)=>record('showPH',args),_T=s=>s;
    let P={x:100,y:200,facing:.42,mp:100,skills:{maliceMortar:1,iceOrb:0},_fused:null,s:'idle',
      _mmAiming:false,_mmCharging:false,_mmAimKey:null,_mmDist:150,_mmCd:0,_beamHold:true};
    const G={on:true,paused:false,cam:{x:0,y:0},_mmBomb:null};
    ${parts.declarations.map(part=>part.text).join('\n')}
    ${definitions.join('\n')}
    function __mortarAimFrame(){${parts.aim.text}}
    ${[parts.keyup,parts.blur,parts.hidden].map(part=>part.text).join('\n')}
    function __snapshot(){return JSON.stringify({P,G,K,KH,MB,MBjust,_lastCost,
      dash:{_dashHold,_dashHoldF,_dashTier,_harpActive,_dashActive},
      cut:{_cutSkipHolding,_cutSkipHold},logs,rngCount:rngState.count})}
  `,{filename:'actual-source-'+variant}).runInContext(context,{timeout:1000});
  assert.equal(registry.window.get('keyup')?.length,1);
  assert.equal(registry.window.get('blur')?.length,1);
  assert.equal(registry.document.get('visibilitychange')?.length,1);
  const run=code=>new vm.Script(code).runInContext(context,{timeout:1000});
  const snapshot=()=>JSON.parse(run('__snapshot()'));
  const emit=(target,name,event={})=>{for(const callback of registry[target].get(name)||[])callback(event);};
  const enter=(charge=true)=>{
    run("K.Digit1=true;KH.Digit1=true;_dispatchSkillSlot(0,'Digit1');");
    if(charge)run('__mortarAimFrame()');
    const state=snapshot();assert.equal(state.P._mmAiming,true);assert.equal(state.P._mmCharging,charge);
    assert.equal(state.P.mp,100);assert.equal(state.G._mmBomb,null);assert.equal(state.rngCount,0);
  };
  const frame=()=>run('__mortarAimFrame()');
  const keyup=()=>emit('window','keyup',{code:'Digit1'});
  const focus=kind=>{if(kind==='blur')emit('window','blur');else{document.hidden=true;emit('document','visibilitychange');}};
  return {run,snapshot,emit,enter,frame,keyup,focus,document};
}
function normal(parts,variant){
  const w=world(parts,variant);w.enter();w.keyup();w.frame();return w.snapshot();
}
function focusRun(parts,variant,kind){
  const w=world(parts,variant);w.enter();const before=w.snapshot();w.focus(kind);const event=w.snapshot();w.frame();
  return {before,event,after:w.snapshot()};
}
function noFire(trace){
  return trace.after.P.mp===trace.before.P.mp&&trace.after._lastCost===trace.before._lastCost&&
    trace.after.P._mmCd===trace.before.P._mmCd&&trace.after.G._mmBomb===null&&
    trace.after.rngCount===trace.before.rngCount&&JSON.stringify(trace.after.logs)===JSON.stringify(trace.before.logs)&&
    trace.after.P._mmAiming===false&&trace.after.P._mmCharging===false;
}
function fired(state){
  assert.equal(state.P.mp,50);assert.equal(state._lastCost,50);assert.equal(state.P._mmCd,660);
  assert.equal(state.G._mmBomb?.r,400);assert.equal(state.G._mmBomb?.phase,'throw');
  assert.equal(state.P._mmAiming,false);assert.equal(state.P._mmCharging,false);assert.equal(state.rngCount,3);
  assert.deepEqual(state.logs.map(entry=>entry.kind),['proficiency','SFX.magic','playSample','shake']);
}
function supplemental(parts,normalReference){
  const checks=[];
  {
    const w=world(parts,'production');w.enter();const before=w.snapshot();
    w.document.hidden=false;w.emit('document','visibilitychange');assert.deepEqual(w.snapshot(),before);
    w.keyup();w.frame();assert.deepEqual(w.snapshot(),normalReference);
    checks.push({boundary:'visible visibilitychange preserves held aim and normal release',status:'PASS'});
  }
  {
    const w=world(parts,'production');w.run('P=null');w.focus('blur');w.focus('hidden');
    const state=w.snapshot();assert.equal(state.P,null);assert.equal(state.rngCount,0);assert.equal(state.logs.length,0);
    assert(Object.values(state.K).every(value=>value===false));assert(Object.values(state.KH).every(value=>value===false));
    assert.equal(state.dash._dashHold,false);assert.equal(state.cut._cutSkipHolding,false);
    checks.push({boundary:'P=null registered blur and hidden are safe',status:'PASS'});
  }
  {
    const w=world(parts,'production');w.enter();w.focus('blur');w.frame();const first=w.snapshot();
    w.focus('blur');w.focus('hidden');w.frame();assert.deepEqual(w.snapshot(),first);
    checks.push({boundary:'repeated blur/hidden cancellation is idempotent',status:'PASS'});
  }
  {
    const w=world(parts,'production');w.enter();w.focus('blur');w.frame();w.keyup();w.enter();w.keyup();w.frame();
    const state=w.snapshot();fired({...state,logs:state.logs.slice(1)});
    assert.deepEqual(state.G._mmBomb,normalReference.G._mmBomb);
    checks.push({boundary:'fresh slot input rearms after cancelled focus hold',status:'PASS'});
  }
  {
    const w=world(parts,'production');w.enter();w.run("G._mmBomb={phase:'throw',t:5,maxT:40,sentinel:'existing'}");
    const before=w.snapshot();w.focus('blur');w.frame();const after=w.snapshot();
    assert.deepEqual(after.G,before.G);assert.equal(after.P.mp,before.P.mp);assert.equal(after._lastCost,before._lastCost);
    assert.equal(after.P._mmCd,before.P._mmCd);assert.deepEqual(after.logs,before.logs);assert.equal(after.rngCount,0);
    checks.push({boundary:'focus cancellation preserves an existing bomb and resource state',status:'PASS'});
  }
  {
    const w=world(parts,'production');w.enter(false);const before=w.snapshot();w.focus('blur');const event=w.snapshot();w.frame();
    assert(noFire({before,event,after:w.snapshot()}));
    checks.push({boundary:'focus before the first charging update cancels aim',status:'PASS'});
  }
  return checks;
}

try{
  assert.equal(fs.realpathSync(root),root);assert.equal(fileURLToPath(import.meta.url),own);
  const before=JSON.parse(fs.readFileSync(path.join(backup,'before.json'),'utf8'));
  for(const row of before.html){
    const original=fs.readFileSync(row.backup),current=fs.readFileSync(path.join(root,row.file));
    assert.equal(sha(original),row.beforeSHA256);assert.equal(sha(current),row.expectedAfterSHA256);
    const old=Buffer.from(oldGuard),at=original.indexOf(old);assert(at>=0);assert.equal(original.indexOf(old,at+old.length),-1);
    const expected=Buffer.concat([original.subarray(0,at),Buffer.from(newGuard),original.subarray(at+old.length)]);
    assert(current.equals(expected),row.file+' bytes outside single P guard changed');
    const parts=extract(current.toString('utf8'),row.file);
    const productionNormal=normal(parts,'production'),negativeNormal=normal(parts,'cancelRemovedMemory');
    fired(productionNormal);fired(negativeNormal);assert.deepEqual(productionNormal,negativeNormal,'normal first release complete fixture effects');
    const focus=['blur','hidden'].map(kind=>{
      const production=focusRun(parts,'production',kind),negative=focusRun(parts,'cancelRemovedMemory',kind);
      assert(noFire(production),row.file+' '+kind+' production must cancel');
      assert(!noFire(negative),row.file+' '+kind+' negative must reproduce ghost fire');fired(negative.after);
      assert.deepEqual(production.before,negative.before);
      assert.equal(production.event.P._mmAimKey,production.before.P._mmAimKey);
      assert.equal(production.event.P._mmDist,production.before.P._mmDist);
      assert.equal(production.event.P._beamHold,false);
      assert(Object.values(production.event.K).every(value=>value===false));
      assert(Object.values(production.event.KH).every(value=>value===false));
      assert(Object.values(production.event.MB).every(value=>value===false));
      assert(Object.values(production.event.MBjust).every(value=>value===false));
      assert.deepEqual(production.event.dash,{_dashHold:false,_dashHoldF:0,_dashTier:0,_harpActive:false,_dashActive:false});
      assert.deepEqual(production.event.cut,{_cutSkipHolding:false,_cutSkipHold:0});
      return {kind,productionVerdict:'GREEN',cancelRemovedMemoryVerdict:'RED',production,negative};
    });
    report.files.push({file:row.file,beforeSHA256:row.beforeSHA256,currentSHA256:sha(current),
      changedBytes:Buffer.byteLength(newGuard)-Buffer.byteLength(oldGuard),outsideGuardBytesUnchanged:true,
      extraction:[...parts.funcs,...parts.declarations,parts.aim,parts.keyup,parts.blur,parts.hidden].map(part=>
        ({name:part.name,line:part.line,sha256:sha(part.text)})),
      productionVerdict:'GREEN',cancelRemovedMemoryVerdict:'RED',normalCompleteEquivalence:'PASS',
      normalCompleteFixtureState:productionNormal,focus,supplemental:supplemental(parts,productionNormal)});
    assert.equal(sha(fs.readFileSync(path.join(root,row.file))),sha(current),row.file+' changed during verification');
  }
  const inlineJavaScript=report.syntax.reduce((n,row)=>n+row.inlineJavaScript,0),importMapJSON=report.syntax.reduce((n,row)=>n+row.importMapJSON,0);
  assert.equal(inlineJavaScript,12);assert.equal(importMapJSON,2);
  report.rolePreservation=before.roleInputs.map(row=>({path:row.path,sha256:row.sha256,unchanged:sha(fs.readFileSync(row.path))===row.sha256}));
  assert(report.rolePreservation.every(row=>row.unchanged));
  report.counts={productionGREEN:2,cancelRemovedMemoryRED:2,registeredFocusEventsPerVariantPerHTML:2,
    normalCompleteEquivalence:2,supplementalBoundaryTypes:6,supplementalPASS:12,
    scenarioKinds:9,isolatedWorldExecutions:24,inlineJavaScript,importMapJSON,previousChecksRerun:0};
  report.productionAccepted=true;report.status='PASS';
}catch(error){report.status='FAIL';report.error={name:error.name,message:error.message};process.exitCode=1;}
report.finishedUTC=new Date().toISOString();
console.log(JSON.stringify(report,null,2));
