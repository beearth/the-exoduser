'use strict';
// Actual disk fragments, isolated VM and synthetic inputs only. No game, DOM,
// device/audio/storage/server evaluation; no previous test/ignored-file dependency.
// The selected LT/ABXY boundary omits the rest of _pollGamepad. Damage/stat,
// proficiency, presentation and sound sinks are doubles, not native acceptance.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

function balanced(source, start) {
  assert.equal(source[start], '{');
  let depth = 0, quote = '', line = false, block = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (line) { if (c === '\n') line = false; continue; }
    if (block) { if (c === '*' && next === '/') { block = false; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && next === '/') { line = true; i++; continue; }
    if (c === '/' && next === '*') { block = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  throw new Error('Unclosed actual-source brace');
}
function span(source, anchor) {
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `Missing actual anchor: ${anchor}`);
  return {start, end: balanced(source, source.indexOf('{', start))};
}
function load(file) {
  const bytes = fs.readFileSync(path.join(root, file)), source = bytes.toString('utf8');
  const fragments = {}, metadata = [];
  function take(name, start, end) {
    const text = source.slice(start, end); fragments[name] = text;
    metadata.push({name, line: source.slice(0, start).split('\n').length,
      endLine: source.slice(0, end).split('\n').length, bytes: Buffer.byteLength(text), sha256: sha(text)});
    return text;
  }
  function fn(name) { const s = span(source, `function ${name}(`); return take(name, s.start, s.end); }
  for (const name of ['_clearHeldInput', '_dispatchSkillSlot', 'fireBoneWall',
    '_gpInjectKey', '_gpAutoAim', '_malCost', '_r', '_isFused', '_getAbsorbed',
    '_isAbsorbed', '_skById', '_isAreaSkillId', '_isRageBurstSkillId', '_canAssignSkillSlot']) fn(name);
  const aim = span(source, 'if(P._bwAiming){'); take('aim', aim.start, aim.end);
  const kd = span(source, "addEventListener('keydown',e=>{\n  // 컷씬 진행");
  take('keydownRegistration', kd.start, source.indexOf(');', kd.end) + 2);
  const start = source.indexOf("addEventListener('blur',_clearHeldInput);");
  assert.ok(start >= 0);
  const visible = source.indexOf("document.addEventListener('visibilitychange',", start);
  take('focusRegistrations', start, source.indexOf('\n', visible));
  const gp = source.indexOf('  const _isAimMode=P&&');
  assert.ok(gp >= 0);
  const gpEnd = "  _gpBtnsPrev['kLT_held']=_ltHeld;";
  take('gpLTBoundary', gp, source.indexOf(gpEnd, gp) + gpEnd.length);
  const fuse = span(source, 'const _FUSE_PAIRS={'); take('fusePairs', fuse.start, fuse.end + 1);
  const mal = source.indexOf('const _MALICE_COST_MUL=');
  take('maliceMultiplier', mal, source.indexOf(';', mal) + 1);
  const skill = source.indexOf("{id:'boneWall',"); assert.ok(skill >= 0);
  take('boneWallMetadata', skill, balanced(source, skill));
  const el = source.match(/^const EL=.*$/m); assert.ok(el); take('elements', el.index, el.index + el[0].length);
  return {file, bytes: bytes.length, sha256: sha(bytes), fragments, metadata};
}
function world(loaded, oldControl = false) {
  const trace = [], globalListeners = {}, documentListeners = {};
  const math = Object.create(Math); let rng = 0;
  math.random = () => { rng++; return .25; };
  const P = {x:100,y:200,facing:0,hp:100,mp:0,st:90,s:'idle',skills:{boneWall:1},
    _bwAiming:false,_bwStk:2,_bwRech:0,_fused:null};
  const G = {on:true,paused:false,cam:{x:0,y:0},mats:100,_boneWalls:[]};
  const panel = {classList:{contains:()=>false},style:{display:'none'}};
  const context = {P,G,Math:math,Set,Number,Map,Object,console:{log:()=>{},error:(...a)=>trace.push(['error',...a])},
    K:{},KH:{},MB:[false,false,false],MBjust:[false,false,false],mouse:{x:900,y:650},VW:1600,VH:900,
    _MAP_QA_MODE:false,_gpActive:true,ens:[],_gpInjHeld:{},_gpBtns:{},_gpBtnsPrev:{},
    _gpad:{buttons:Array.from({length:8},()=>({value:0}))},
    _dashHold:false,_dashHoldF:0,_dashTier:0,_cutSkipHolding:false,_cutSkipHold:0,
    SKILL_SLOTS:['boneWall',null,null,null,null,null],ULT_SLOT:null,SKILL_LIST:[],
    _cutsceneState:'GAME',listeningBind:null,_listenAlt:false,BINDS:{shield:'KeyE'},BINDS2:{},
    window:{},Element:class Element{},$:()=>panel,
    KeyboardEvent:class KeyboardEvent { constructor(type,opts){this.type=type;Object.assign(this,opts)}
      preventDefault(){} stopPropagation(){} },
    document:{hidden:false,addEventListener:(type,fn)=>(documentListeners[type]??=[]).push(fn),
      dispatchEvent:e=>(globalListeners[e.type]||[]).forEach(fn=>fn(e))},
    addEventListener:(type,fn)=>(globalListeners[type]??=[]).push(fn),
    setTimeout:()=>{throw new Error('Unexpected timer branch in selected pad boundary')},
    dst:(a,b,c,d)=>Math.hypot(c-a,d-b),meleeRef:()=>1,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
    _T:s=>s,showPH:(...a)=>trace.push(['showPH',...a]),_addSkProf:id=>trace.push(['proficiency',id]),
    SFX:{magic:(...a)=>trace.push(['SFX.magic',...a])},playSample:(...a)=>trace.push(['playSample',...a]),
    shake:(...a)=>trace.push(['shake',...a]),addTxt:(...a)=>trace.push(['addTxt',...a])};
  vm.createContext(context);
  const f = loaded.fragments;
  // Final normal controls remove just the newly approved cancellation statement.
  // Baseline has no such statement, so no candidate code is executed.
  const clear = oldControl ? f._clearHeldInput.replace(';P._bwAiming=false','') : f._clearHeldInput;
  const functions = ['_dispatchSkillSlot','fireBoneWall','_gpInjectKey','_gpAutoAim','_malCost','_r',
    '_isFused','_getAbsorbed','_isAbsorbed','_skById','_isAreaSkillId','_isRageBurstSkillId','_canAssignSkillSlot'];
  const code = `${f.elements}\n${f.maliceMultiplier}\n${f.fusePairs}\n`+
    `SKILL_LIST=[${f.boneWallMetadata}];const _SK_MAP=new Map(SKILL_LIST.map(s=>[s.id,s]));\n`+
    clear+'\n'+functions.map(n=>f[n]).join('\n')+'\n'+f.keydownRegistration+'\n'+f.focusRegistrations+'\n'+
    `function boneWallFrame(){${f.aim}}\nfunction padLTBoundary(){${f.gpLTBoundary}}`;
  new vm.Script(code,{filename:loaded.file+' selected actual boneWall chain'}).runInContext(context);
  const call = (code) => vm.runInContext(code,context,{timeout:100});
  function snapshot() {
    return JSON.parse(JSON.stringify({P:context.P,G:context.G,K:context.K,KH:context.KH,
      MB:context.MB,MBjust:context.MBjust,mouse:context.mouse,trace,rng}));
  }
  function enterPad() {
    context._gpad.buttons[6].value=1;context._gpBtns[0]=true;call('padLTBoundary()');
    assert.equal(context.P._bwAiming,true,'actual pad→Digit1→dispatcher must enter aim');
    assert.equal(context.G._boneWalls.length,0);assert.equal(context.G.mats,100);
    context.mouse.x=1000;context.mouse.y=700;
  }
  function releasePad() {context._gpBtns[0]=false;call('padLTBoundary();boneWallFrame()');}
  function focus(kind) {
    if(kind==='blur') globalListeners.blur.forEach(fn=>fn());
    else {context.document.hidden=kind==='hidden';documentListeners.visibilitychange.forEach(fn=>fn());}
  }
  return {context,trace,call,snapshot,enterPad,releasePad,focus};
}
const groups = [], loads = []; let fixtureFailures = 0;
function group(loaded,name,run) {
  try { const detail=run();groups.push({file:loaded.file,name,status:'PASS',detail}); }
  catch(e) { const assertion=e instanceof assert.AssertionError;
    if(!assertion)fixtureFailures++;
    groups.push({file:loaded.file,name,status:'FAIL',classification:assertion?'assertion':'fixture',error:e.message}); }
}
function normal(loaded,kind,oldControl=false) {
  const w=world(loaded,oldControl);
  if(kind==='pad'){w.enterPad();w.releasePad();}
  else {w.context._gpActive=false;w.context.mouse.x=5000;w.context.mouse.y=650;w.call("_gpInjectKey('Digit1',true)");}
  const s=w.snapshot();assert.equal(s.G.mats,94);assert.equal(s.P.mp,0);
  assert.equal(s.P._bwStk,1);assert.equal(s.P._bwRech,1500);assert.equal(s.P._bwAiming,false);
  assert.equal(s.G._boneWalls.length,1);assert.equal(s.rng,1);
  assert.equal(s.trace.filter(x=>x[0]==='proficiency').length,2);
  assert.equal(s.G._boneWalls[0].x,kind==='pad'?200:1100);
  assert.equal(s.G._boneWalls[0].y,kind==='pad'?250:200);
  return s;
}
for (const file of ['game.html','game-easy-test.html']) {
  let l;try {l=load(file);loads.push(l);} catch(e){fixtureFailures++;groups.push({file,name:'extract',status:'FAIL',classification:'fixture',error:e.message});continue;}
  for (const kind of ['pad','kbm']) group(l,'normal-'+kind+'-actual-entry-and-confirm',()=>{
    const current=normal(l,kind);const old=normal(l,kind,true);assert.deepEqual(current,old);
    return {normalOldControlEqual:true,matsCost:6,mpCost:0,stockCost:1,recharge:1500,
      walls:current.G._boneWalls,rng:current.rng,trace:current.trace};
  });
  for (const event of ['blur','hidden']) group(l,event+'-then-fresh-confirm-cancels',()=>{
    const w=world(l);w.enterPad();const entered=w.snapshot();w.focus(event);
    const afterFocus=w.snapshot();w.call("_gpInjectKey('mouse0',true);boneWallFrame()");const next=w.snapshot();
    // Keep the baseline witness on assertion failure without pretending it passed.
    const witness={entered,afterFocus,next};
    try {assert.equal(afterFocus.P._bwAiming,false);assert.equal(next.G.mats,entered.G.mats);
      assert.equal(next.P._bwStk,entered.P._bwStk);assert.equal(next.P._bwRech,entered.P._bwRech);
      assert.deepEqual(next.G._boneWalls,entered.G._boneWalls);assert.deepEqual(next.trace,entered.trace);
      assert.equal(next.rng,entered.rng);assert.equal(next.MBjust[0],true);}
    catch(e){e.message+=' WITNESS='+JSON.stringify(witness);throw e;}
    return witness;
  });
  group(l,'visible-no-clear-normal-release',()=>{
    const w=world(l);w.enterPad();const before=w.snapshot();w.focus('visible');assert.deepEqual(w.snapshot(),before);
    w.releasePad();const s=w.snapshot();assert.equal(s.G.mats,94);assert.equal(s.G._boneWalls.length,1);return s;
  });
  group(l,'right-click-priority-cancel',()=>{
    const w=world(l);w.enterPad();const before=w.snapshot();w.context.MBjust[0]=true;w.context.MBjust[2]=true;
    w.call('boneWallFrame()');const s=w.snapshot();assert.equal(s.P._bwAiming,false);
    assert.equal(s.G.mats,before.G.mats);assert.equal(s.MBjust[0],true);assert.equal(s.MBjust[2],false);
    assert.deepEqual(s.trace,before.trace);assert.equal(s.rng,0);return s;
  });
  group(l,'confirm-resource-and-stock-recheck',()=>{
    const results=[];
    for(const [field,value] of [['mats',5],['_bwStk',0]]){
      const w=world(l);w.enterPad();if(field==='mats')w.context.G.mats=value;else w.context.P[field]=value;
      const before=w.snapshot();w.releasePad();const s=w.snapshot();assert.equal(s.P._bwAiming,false);
      assert.equal(s.G.mats,before.G.mats);assert.equal(s.P._bwStk,before.P._bwStk);
      assert.equal(s.P._bwRech,0);assert.equal(s.G._boneWalls.length,0);assert.equal(s.rng,0);results.push(s);
    }return results;
  });
  group(l,'null-player-focus-and-repeat-clear',()=>{
    const w=world(l);w.context.P=null;w.context.K.Digit1=true;w.context.KH.Digit1=true;
    w.focus('blur');w.focus('hidden');assert.equal(w.context.K.Digit1,false);assert.equal(w.context.KH.Digit1,false);
    return w.snapshot();
  });
  group(l,'other-aim-sentinels-preserved-thunderstake-cancelled',()=>{
    const w=world(l);Object.assign(w.context.P,{_hrAiming:true,_isAiming:true,_tsAiming:true,_ebAiming:true});
    w.focus('blur');const once=w.snapshot();w.focus('blur');assert.deepEqual(w.snapshot(),once);
    for(const key of ['_hrAiming','_isAiming','_ebAiming'])assert.equal(w.context.P[key],true);
    assert.equal(w.context.P._tsAiming,false);
    assert.equal(w.context.G.mats,100);assert.equal(w.context.G._boneWalls.length,0);return once;
  });
  group(l,'repeat-digit-and-repeat-confirm-no-extra-effects',()=>{
    const w=world(l);w.enterPad();const before=w.snapshot();
    w.context.document.dispatchEvent({type:'keydown',code:'Digit1',repeat:true,preventDefault(){}});
    assert.deepEqual(w.snapshot(),before);w.releasePad();const first=w.snapshot();
    w.call("_gpInjectKey('mouse0',true);boneWallFrame()");const next=w.snapshot();
    assert.deepEqual(next.G,first.G);assert.deepEqual(next.P,first.P);assert.deepEqual(next.trace,first.trace);
    assert.equal(next.rng,first.rng);return {first,next};
  });
}
const failed=groups.filter(g=>g.status==='FAIL');
console.log(JSON.stringify({at:new Date().toISOString(),test:__filename,
  source:loads.map(l=>({file:l.file,bytes:l.bytes,sha256:l.sha256,fragments:l.metadata})),
  groups,summary:{groups:groups.length,pass:groups.length-failed.length,fail:failed.length,fixtureFailures,
    normalOldControls:groups.filter(g=>g.status==='PASS'&&g.detail?.normalOldControlEqual).length},
  sourceTransforms:['Actual blocks wrapped as boneWallFrame/padLTBoundary; exact callbacks retained.',
    'Only normal control can remove ;P._bwAiming=false from extracted clear; baseline is unchanged.'],
  limitations:['Synthetic pad button states and events; no full _pollGamepad/update/DOM/game loop/native input.',
    'One actual SKILL_LIST row/actual slot and absorption helpers; plain boneWall only.',
    'Damage/stat/proficiency/presentation/audio sinks doubled. No real damage, audio, storage or recharge progression.',
    'Other aim-family sentinel preservation is state inspection, not their firing acceptance.'],
  productionAccepted:false,runtimeAccepted:false},null,2));
process.exitCode=failed.length||fixtureFailures?1:0;
