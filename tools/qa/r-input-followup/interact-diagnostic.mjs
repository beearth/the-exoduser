// DIAGNOSTIC ONLY — not a CI regression contract. Assertions retain proposed expectations.
// Expected baseline: 16 satisfied / 10 unmet; exit 1 reports unmet assumptions, not a new regression.
// Run: node --test --test-reporter=tap tools/qa/r-input-followup/interact-diagnostic.mjs
// Browser evidence did not establish ordinary user-input failure; no production fix was adopted.
// Source-extracted input/interaction slice. No browser, rendering, combat or save I/O.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
const ROOT=new URL('../../../',import.meta.url);
const files=['game.html','game-easy-test.html'];

function expr(src,anchor){
  const i=src.indexOf(anchor);assert.ok(i>=0,`missing source anchor: ${anchor}`);
  assert.equal(src.indexOf(anchor,i+anchor.length),-1,`ambiguous source anchor: ${anchor}`);
  return parseExpressionAt(src,i,{ecmaVersion:'latest'});
}
function fn(src,name){return expr(src,`function ${name}(`);}
function slice(src,node){return src.slice(node.start,node.end);}
function declaration(src,name,kind){
  const anchor=`${kind} ${name}=`,i=src.indexOf(anchor);assert.ok(i>=0,`missing ${anchor}`);
  const node=parseExpressionAt(src,i+anchor.length,{ecmaVersion:'latest'});
  return `${kind} ${name}=${slice(src,node)};`;
}
function walk(node,visit){if(!node||typeof node!=='object')return;visit(node);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(n=>walk(n,visit));else if(value&&typeof value==='object')walk(value,visit);}
const extracted=new Map(files.map(file=>{
  const src=fs.readFileSync(new URL(file,ROOT),'utf8');
  const down=expr(src,"addEventListener('keydown',e=>{\n  // 컷씬").arguments[1];
  const up=expr(src,"addEventListener('keyup',e=>{\n  K[e.code]").arguments[1];
  const update=fn(src,'update'),body=update.body.body;
  const pause=body.findIndex(n=>n.type==='IfStatement'&&slice(src,n.test)==='G.paused');assert.ok(pause>=0);
  const tap=body.filter(n=>n.type==='IfStatement'&&slice(src,n.test).startsWith("isJust('interact')"));assert.equal(tap.length,1);
  const hold=body.filter(n=>n.type==='IfStatement'&&slice(src,n.test)==="!isJust('interact')&&isHeld('interact')");assert.equal(hold.length,1);
  const sp=body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='sp'));assert.equal(sp.length,1);
  const loops=[];walk(fn(src,'loop'),n=>{if(n.type==='WhileStatement'&&slice(src,n.test)==='_acc>=PHYS_STEP')loops.push(n);});assert.equal(loops.length,1);
  const functions=['_chkJust','isJust','_chkHeld','isHeld','_clearHeldInput','_chainAttackBindingConflict','_setInputBinding','togglePanel','closeAllPanels','closePanel','_panelBack'];
  const declarations=[['BINDS','let'],['BINDS2','let'],['K','const'],['KH','const'],['MB','const'],['PHYS_STEP','const']];
  return[file,{src,code:[...declarations.map(([name,kind])=>declaration(src,name,kind)),...functions.map(name=>slice(src,fn(src,name))),
    slice(src,expr(src,"addEventListener('blur',_clearHeldInput)"))+';',
    slice(src,expr(src,"document.addEventListener('visibilitychange',()=>{if(document.hidden)_clearHeldInput()})"))+';',
    `const _testDown=${slice(src,down)};const _testUp=${slice(src,up)};`,
    // Preserve the exact update entry/panel guard and complete two interaction blocks.
    // Unrelated combat/world processing between these source ranges is deliberately omitted.
    `function update(){${body.slice(0,pause+1).map(n=>slice(src,n)).join('\n')}\n${slice(src,sp[0])}\n${slice(src,tap[0])}\n${slice(src,hold[0])}}`,
    `function _testSteps(n){_acc=PHYS_STEP*n+1e-8;let _didUpdate=false;${slice(src,loops[0])}}`,
    'globalThis.input={K,KH,BINDS,BINDS2,down:_testDown,up:_testUp,update,steps:_testSteps,clear:_clearHeldInput};'].join('\n')}];
}));

function harness(file){
  const panels=new Map(),picks=[],listeners=new Map();let time=0;
  const addEventListener=(type,callback)=>listeners.set(type,callback);
  const $=id=>{if(!panels.has(id)){const classes=new Set();panels.set(id,{style:{display:'none'},hidden:true,classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)}});}return panels.get(id);};
  const worldItems=Array.from({length:20},(_,i)=>({type:'item',x:i,y:0,picked:false,item:{id:i,rarity:1}}));
  const c={window:{},addEventListener,document:{hidden:false,querySelectorAll:()=>[],addEventListener},Element:class{},$,performance:{now:()=>time},
    G:{on:true,paused:false,frame:100,stage:0,cam:{x:0,y:0},mats:0,slowMo:0},P:{s:'idle',skills:{},x:0,y:0},
    MAP_OBJS:[],worldItems,VW:1000,VH:800,RARITY_C:['gray','blue'],deathDrop:null,
    pickupItem:item=>{picks.push({id:item.id,time});return true;},dst:(x,y,a,b)=>Math.hypot(x-a,y-b),
    _usePlayerPortal:()=>false,addParts(){},addTxt(){},_T:x=>x,_L:x=>x,
    renderSettings(){},renderInv(){},renderStatPanel(){},renderSkillPanel(){},_injectPanelNav(){},saveSettings(){},
    _EDITOR_MODE:false,_dtSp:1,MBjust:{},listeningBind:null,_listenAlt:false,
    _dashHold:false,_dashHoldF:0,_dashTier:0,_cutSkipHolding:false,_cutSkipHold:0,
    _skPopOwnsPause:false,_fuseSelId:null,_skExpandedId:null,_acc:0,_gameTime:0,_now:0};
  vm.createContext(c);vm.runInContext(extracted.get(file).code,c,{filename:file+'#interact-source-slice'});
  function event(type,code='KeyR',extra={}){const e={code,key:code,repeat:false,preventDefault(){},stopPropagation(){},...extra};c.input[type](e);}
  return{c,picks,worldItems,event,at(t){time=t;},step(n=1){c.input.steps(n);},focus(type,hidden=false){c.document.hidden=hidden;listeners.get(type)();}};
}

for(const file of files){
  for(const ms of [0,20,50,100])test(`${file}: ${ms}ms tap with NO intervening update survives until next step${ms===0?' (synthetic boundary)':' (controlled update gap)'}`,()=>{
    const h=harness(file);h.at(0);h.event('down');h.at(ms);h.event('up');h.step();
    assert.equal(h.picks.length,1,`${ms}ms keydown→keyup→update lost the press; this schedule is simulated, not browser evidence`);
    h.step(4);assert.equal(h.picks.length,1,'one physical tap cannot be consumed again by catch-up steps');
  });
  for(const ms of [20,50,100])test(`${file}: ${ms}ms tap WITH 60Hz steps picks once`,()=>{
    const h=harness(file);h.event('down');
    for(let t=1000/60;t<ms;t+=1000/60){h.at(t);h.step();}
    h.at(ms);h.event('up');h.step();assert.equal(h.picks.length,1);
  });
  test(`${file}: several fixed catch-up steps consume a held press once; 9 held ticks preserve repeat pickup`,()=>{
    const h=harness(file);h.event('down');h.step(4);assert.equal(h.picks.length,1);
    h.step(4);assert.equal(h.picks.length,1);h.step();assert.equal(h.picks.length,2,'existing 9-tick hold cadence');
    h.event('up');h.step(4);assert.equal(h.picks.length,2);assert.equal(h.c.P._pickHoldT,0);
  });
  test(`${file}: OS repeat must not create a second immediate tap before hold cadence (separate baseline concern)`,()=>{
    const h=harness(file);h.event('down');
    for(let tick=1;tick<=30;tick++){h.at(tick*1000/60);h.step();}
    assert.equal(h.picks.length,4,'initial press plus three ordinary 9-tick hold pickups');
    h.at(501);h.event('down','KeyR',{repeat:true});h.step();assert.equal(h.picks.length,4,'repeat should rely on existing hold cadence, not rearm tap');
  });
  test(`${file}: paused tap and gameplay press canceled by opening a panel do not leak after closing`,()=>{
    for(const before of [false,true]){
      const h=harness(file);if(before)h.event('down');
      h.event('down','Escape');assert.equal(h.c.G.paused,true);
      if(!before)h.event('down');h.event('up');h.step();assert.equal(h.picks.length,0);
      h.event('down','Escape');assert.equal(h.c.G.paused,false);h.step();assert.equal(h.picks.length,0);
    }
  });
  test(`${file}: actual blur/hidden listeners cancel input, visible notification preserves it`,()=>{
    for(const type of ['blur','visibilitychange']){
      const h=harness(file);h.event('down');h.focus(type,true);h.step(4);
      assert.equal(h.picks.length,0);assert.equal(h.c.input.KH.KeyR,false);
      h.focus('visibilitychange',false);h.event('down');h.step();assert.equal(h.picks.length,1);
    }
    const h=harness(file);h.event('down');h.focus('visibilitychange',false);h.step();assert.equal(h.picks.length,1);
  });
  test(`${file}: binding capture repeat/Escape cancellation and captured new key never emit pickup`,()=>{
    const h=harness(file);h.c.listeningBind='interact';
    h.event('down','KeyR',{repeat:true});assert.equal(h.c.listeningBind,'interact');
    h.event('down','Escape');assert.equal(h.c.listeningBind,null);h.step();assert.equal(h.picks.length,0);
    assert.equal(h.c.input.BINDS.interact,'KeyR');
    h.c.listeningBind='interact';h.event('down','KeyB');h.event('up','KeyB');h.step();
    assert.equal(h.c.input.BINDS.interact,'KeyB');assert.equal(h.picks.length,0);
    h.event('down','KeyB');h.step();h.event('up','KeyB');assert.equal(h.picks.length,1);
  });
  test(`${file}: alternate key respects the same interaction path`,()=>{
    const h=harness(file);h.c.input.BINDS2.interact='KeyB';h.event('down','KeyB');h.step();h.event('up','KeyB');h.step();assert.equal(h.picks.length,1);
  });
}
