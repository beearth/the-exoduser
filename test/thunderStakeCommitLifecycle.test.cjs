'use strict';
// Actual dispatcher, focus registrations, execution input and placement blocks.
// Selected update blocks are wrapped in functions; stat/audio/render/geometry
// and eligibility are fixtures. Four scene reset lanes are source fragments,
// not complete initStage/death callbacks. No native input or save I/O.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const input=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const plain=v=>JSON.parse(JSON.stringify(v));
function load(file){
  const bytes=fs.readFileSync(path.join(input,file)),source=bytes.toString(),nodes=[];
  function walk(n,script){if(!n||typeof n!=='object')return;if(n.type)nodes.push({n,script});
    for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(x=>walk(x,script));else if(v&&typeof v==='object')walk(v,script);}}
  let js=0,json=0;
  for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]||'';
    if(type==='importmap'){JSON.parse(m[2]);json++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    walk(parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'}),m[2]);js++;
  }
  const take=(label,p)=>{const a=nodes.filter(({n,script})=>p(n,script));assert.equal(a.length,1,label);
    return a[0].script.slice(a[0].n.start,a[0].n.end);};
  const fn=name=>take(name,n=>n.type==='FunctionDeclaration'&&n.id?.name===name);
  const aim=take('actual stake placement', (n,s)=>n.type==='IfStatement'&&s.slice(n.start,n.end).startsWith('if(P._tsAiming){')&&s.slice(n.start,n.end).includes('MBjust[0]'));
  const execution=take('actual execution input', (n,s)=>n.type==='IfStatement'&&s.slice(n.start,n.end).startsWith("if(_chkJust('KeyX')&&P.skills.execution>=1"));
  const focus=source.match(/addEventListener\('blur',_clearHeldInput\);\r?\ndocument\.addEventListener\('visibilitychange',[^\r\n]+/)[0];
  const scenes=[...source.matchAll(/G\._boneWalls=\[\];G\._fireZones=\[\];(?:G\._thunderStakes=null;P\._tsAiming=false;)?G\._stProjs=\[\]/g)].map(m=>m[0]);
  assert.equal(scenes.length,4);assert.equal(js,6);assert.equal(json,1);
  const el=take('EL',n=>n.type==='VariableDeclaration'&&n.declarations.length===1&&n.declarations[0].id.name==='EL');
  return {file,sourceSHA256:sha(bytes),js,json,clear:fn('_clearHeldInput'),dispatch:fn('_dispatchSkillSlot'),aim,execution,focus,scenes,el};
}
function world(l){
  const trace=[],listeners={},docListeners={};let rng=0;
  const math=Object.create(Math);math.random=()=>{rng++;return .75;};
  const c={P:{x:100,y:200,r:10,facing:0,lv:20,hp:100,mhp:100,mp:55,mmp:200,st:100,mst:100,iframes:0,s:'idle',skills:{thunderStake:1,execution:1},_tsStk:5,_tsRech:0},
    G:{on:true,paused:false,cam:{x:0,y:0},_thunderStakes:null,_bossRef:{x:250,y:200,hp:1000,mhp:1000,alive:true,stunned:30}},
    K:{},KH:{},MB:[false,false,false],MBjust:[false,false,false],mouse:{x:1000,y:700},VW:1600,VH:900,
    Math:math,SKILL_SLOTS:['thunderStake'],ULT_SLOT:null,_MAP_QA_MODE:false,_gpActive:false,
    _dashHold:false,_dashHoldF:0,_dashTier:0,_cutSkipHolding:false,_cutSkipHold:0,_execVfx:null,
    _canAssignSkillSlot:()=>true,_isAbsorbed:()=>false,_chkJust:k=>k==='KeyX',_T:s=>s,
    magicRef:()=>10,statInt:()=>2,pMagicMul:()=>1,_skMul:()=>1.2,_fuseMul:()=>1,
    meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,canMv:()=>false,_r:x=>x,
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),
    showPH:(...a)=>trace.push(['showPH',...a]),_addSkProf:(...a)=>trace.push(['proficiency',...a]),
    SFX:{magic:(...a)=>trace.push(['magic',...a])},addTxt:(...a)=>trace.push(['text',...a]),
    shake:(...a)=>trace.push(['shake',...a]),playSample:(...a)=>trace.push(['sample',...a]),
    addEventListener:(k,f)=>(listeners[k]??=[]).push(f),
    document:{hidden:false,addEventListener:(k,f)=>(docListeners[k]??=[]).push(f)}};
  vm.createContext(c);vm.runInContext(l.el+'\n'+l.clear+'\n'+l.dispatch+'\n'+l.focus+
    '\nfunction placementFrame(){'+l.aim+'}\nfunction executionFrame(){'+l.execution+'}',c);
  const run=s=>vm.runInContext(s,c,{timeout:200});
  const enter=()=>{run('_dispatchSkillSlot(0,"Digit1")');assert.equal(c.P._tsAiming,true);};
  const click=()=>{c.MBjust[0]=true;run('placementFrame()');};
  const focus=kind=>{if(kind==='blur')listeners.blur.forEach(f=>f());else{c.document.hidden=kind==='hidden';docListeners.visibilitychange.forEach(f=>f());}};
  const snapshot=()=>plain({P:c.P,G:c.G,trace,rng,mouse:c.mouse,MBjust:c.MBjust});
  return {c,trace,run,enter,click,focus,snapshot};
}
const results=[],sources=[];
function check(l,name,fn){try{results.push({file:l.file,name,status:'PASS',detail:fn()});}catch(e){results.push({file:l.file,name,status:'FAIL',classification:e instanceof assert.AssertionError?'assertion':'fixture',error:e.message});}}
for(const file of ['game.html','game-easy-test.html']){
  const l=load(file);sources.push({file,sha256:l.sourceSHA256,js:l.js,json:l.json});
  check(l,'normal-levels-clamp-and-cost',()=>{
    const out=[];for(const lv of [1,10,20]){const w=world(l);w.c.P.skills.thunderStake=lv;w.c.P._tsStk=lv>=10?6:5;w.c.P.mp=50;
      w.enter();w.c.mouse={x:5800,y:650};w.click();const s=w.snapshot(),t=s.G._thunderStakes[0];
      assert.equal(s.P.mp,0);assert.equal(s.P._tsStk,lv>=10?5:4);assert.equal(s.P._tsRech,720);assert.equal(s.P._tsAiming,false);
      assert.equal(t.maxT,900+(lv-1)*30);assert.ok(Math.abs(Math.hypot(t.x-100,t.y-200)-1000)<1e-8);assert.equal(t.dmg,24);
      out.push({lv,mp:s.P.mp,stock:s.P._tsStk,maxT:t.maxT,snapshot:s});}return out;});
  check(l,'actual-execution-between-entry-and-click',()=>{
    const w=world(l);w.enter();w.run('executionFrame()');assert.equal(w.c.P.mp,35);assert.equal(w.c.P._tsAiming,true);
    const before=w.snapshot();w.click();const after=w.snapshot();assert.equal(after.P.mp,35);assert.equal(after.P._tsStk,5);
    assert.equal(after.P._tsRech,0);assert.equal(after.G._thunderStakes,null);assert.equal(after.P._tsAiming,false);
    assert.equal(after.rng,before.rng);assert.deepEqual(after.trace.slice(0,-1),before.trace);
    assert.equal(after.trace.at(-1)[0],'showPH');assert.equal(after.MBjust[0],false);return {before,after};});
  check(l,'commit-under-50-is-atomic',()=>{
    const out=[];for(const mp of [0,35,49,49.999]){const w=world(l);w.enter();w.c.P.mp=mp;const before=w.snapshot();w.click();const s=w.snapshot();
      assert.equal(s.P.mp,mp);assert.equal(s.P._tsStk,5);assert.equal(s.P._tsRech,0);assert.equal(s.G._thunderStakes,null);
      assert.equal(s.P._tsAiming,false);assert.equal(s.rng,before.rng);out.push(mp);}return out;});
  check(l,'registered-blur-hidden-cancel-only-pending-aim',()=>{
    for(const event of ['blur','hidden']){const w=world(l);w.enter();const deployed=[{x:30,y:40,t:2,maxT:900,dmg:12}];w.c.G._thunderStakes=deployed;
      const before=w.snapshot();w.focus(event);assert.equal(w.c.P._tsAiming,false);assert.equal(w.c.G._thunderStakes,deployed);
      w.click();const after=w.snapshot();assert.deepEqual(after.G,before.G);assert.equal(after.P.mp,before.P.mp);
      assert.equal(after.P._tsStk,5);assert.deepEqual(after.trace,before.trace);assert.equal(after.rng,before.rng);
      w.c.P=null;w.focus(event);}return {registeredEvents:2,existingStakesPreserved:true};});
  check(l,'visible-and-explicit-cancel-preserve-contract',()=>{
    const visible=world(l);visible.enter();const before=visible.snapshot();visible.focus('visible');assert.deepEqual(visible.snapshot(),before);visible.click();assert.equal(visible.c.G._thunderStakes.length,1);
    for(const kind of ['escape','right','skill']){const w=world(l);w.enter();const before=w.snapshot();
      if(kind==='skill')w.run('_dispatchSkillSlot(0,"Digit1")');else{w.c.MBjust[0]=true;if(kind==='escape')w.c.K.Escape=true;else w.c.MBjust[2]=true;w.run('placementFrame()');}
      assert.equal(w.c.P._tsAiming,false);assert.equal(w.c.P.mp,before.P.mp);assert.equal(w.c.P._tsStk,5);assert.equal(w.c.G._thunderStakes,null);}return {normalVisible:true,cancelPaths:3};});
  check(l,'four-actual-scene-reset-lanes-clear-effects-and-aim',()=>{
    const out=[];for(const lane of l.scenes){const w=world(l);w.enter();w.c.G._thunderStakes=[{x:9,y:9,t:0,maxT:900}];
      const oldP=w.c.P,oldG=w.c.G,mp=w.c.P.mp;w.run(lane);
      assert.equal(w.c.G._thunderStakes,null);assert.equal(w.c.P._tsAiming,false);assert.equal(w.c.P,oldP);assert.equal(w.c.G,oldG);assert.equal(w.c.P.mp,mp);assert.equal(w.c.P._tsStk,5);
      w.click();assert.equal(w.c.G._thunderStakes,null);assert.equal(w.c.P.mp,mp);
      // A new explicit entry may create stakes after a scene cleanup.
      w.enter();w.click();assert.equal(w.c.G._thunderStakes.length,1);assert.equal(w.c.P.mp,5);out.push(sha(lane));}return {lanes:4,hashes:out};});
}
const failed=results.filter(r=>r.status==='FAIL');
console.log(JSON.stringify({at:new Date().toISOString(),sources,results,summary:{groups:results.length,pass:results.length-failed.length,fail:failed.length,fixtureErrors:failed.filter(r=>r.classification==='fixture').length},limitations:['Actual selected blocks, not full update/scene lifecycle. Eligibility/stat/geometry/audio/presentation fixtures.','Full boss retry/capture preservation covered separately by bossRespawnFieldState tests.','No real keyboard/pad/native/visual/audio/save acceptance.']},null,2));
process.exitCode=failed.length?1:0;
