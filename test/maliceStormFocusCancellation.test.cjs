// Current HTML fragments execute in Node VM; event/DOM, pad, damage and SFX boundaries are doubles.
// No production writer, browser, actual gamepad, audio backend, save, server or real timer.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {parse,parseExpressionAt}=require('acorn');
const root=path.resolve(__dirname,'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const plain=x=>JSON.parse(JSON.stringify(x,(_,v)=>v instanceof Set?[...v]:v));
const flags=';P._msAiming=false;P._msCharging=false';
function extract(file){
  const bytes=fs.readFileSync(path.join(root,file)),source=bytes.toString('utf8');
  const part=(name,start,end)=>({name,code:source.slice(start,end),line:source.slice(0,start).split('\n').length});
  const unique=anchor=>{assert.equal(source.split(anchor).length-1,1,file+' '+anchor+' unique');return source.indexOf(anchor);};
  const functions=['_dispatchSkillSlot','_clearHeldInput','_isFused','_r','_gpInjectKey'].map(name=>{
    const start=unique('function '+name+'('),node=parseExpressionAt(source,start,{ecmaVersion:'latest'});
    return part(name,start,node.end);
  });
  const constant=name=>{const anchor='const '+name+'=',start=unique(anchor),node=parseExpressionAt(source,start+anchor.length,{ecmaVersion:'latest'});return part(name,start,node.end+1);};
  const event=(type,name,needle)=>{
    const matches=[...source.matchAll(new RegExp("^addEventListener\\('"+type+"'",'gm'))].map(match=>{
      const node=parseExpressionAt(source,match.index,{ecmaVersion:'latest'});return part(name,match.index,node.end+1);
    }).filter(p=>p.code.includes(needle));
    assert.equal(matches.length,1,file+' '+name+' exact listener');return matches[0];
  };
  const blur=event('blur','registeredBlur','_clearHeldInput');
  const keydown=event('keydown','registeredKeydown','K[e.code]=true;KH[e.code]=true;');
  const keyup=event('keyup','registeredKeyup','K[e.code]=false;KH[e.code]=false;');
  const hiddenStart=unique("document.addEventListener('visibilitychange',()=>{if(document.hidden)_clearHeldInput()})");
  const hidden=part('registeredHidden',hiddenStart,parseExpressionAt(source,hiddenStart,{ecmaVersion:'latest'}).end+1);
  const aimStart=unique('  if(P._msAiming){\n    // 포격식:'),aimEnd=source.indexOf('  // ═══ 악의기둥 — 순차 스폰 큐 처리',aimStart);
  assert.ok(aimEnd>aimStart);const aim=part('stormAimRelease',aimStart,aimEnd);
  const padStart=unique('  const _isAimMode=P&&'),padEnd=source.indexOf('  // 나머지 버튼 주입',padStart);
  assert.ok(padEnd>padStart);const pad=part('padLTModifierBoundary',padStart,padEnd);
  parse(aim.code,{ecmaVersion:'latest'});parse(pad.code,{ecmaVersion:'latest'});
  const parts=[...functions,constant('EL'),blur,keydown,keyup,hidden,aim,pad];
  const helper=functions.find(p=>p.name==='_clearHeldInput');
  const guarded=helper.code.includes(flags);
  assert.equal(helper.code.split("if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false").length-1,1);
  assert.equal(helper.code.split(flags).length-1,guarded?1:0);
  console.log('SOURCE_METADATA '+JSON.stringify({file,sha256:sha(bytes),guarded,fragments:parts.map(p=>({name:p.name,line:p.line,sha256:sha(p.code),bytes:Buffer.byteLength(p.code)})),transforms:['wrap extracted update if in frame(sp)','wrap extracted pad LT statements in padBoundary()','memory negative removes only two added storm assignments'],limits:['selected registered keydown/keyup listeners only','synthetic event bubbling and hidden property','GP LT+ABXY boundary, not navigator/poll/UI','damage/equipment/slot eligibility doubles','whole update/native/audio/visual/save unverified']}));
  return {file,parts,helper,aim,pad,guarded};
}
function fixture(parts,{control=false,mode='plain',device='keyboard',mp=100}={}){
  const events={window:{},document:{}},trace=[],rng=[];let context,phase='entry';
  const log=(type,...args)=>trace.push({phase,type,args:plain(args)});
  const register=(where,type,callback)=>(events[where][type]??=[]).push(callback);
  class Element{}
  class KeyboardEvent{constructor(type,opts){this.type=type;Object.assign(this,opts);this.repeat=false;this.ctrlKey=false;this.metaKey=false;this.target={};}preventDefault(){log('preventDefault',this.code);}stopPropagation(){log('stopPropagation',this.code);}}
  const document={hidden:false,addEventListener:(type,cb)=>register('document',type,cb),dispatchEvent(e){for(const cb of events.document[e.type]||[])cb(e);if(e.bubbles)for(const cb of events.window[e.type]||[])cb(e);return true;}};
  let seed=0x5EED;const math=Object.create(Math);math.random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;const value=((t^t>>>14)>>>0)/4294967296;rng.push({phase,value});return value;};
  const sandbox={Math:math,document,window:{},Element,KeyboardEvent,addEventListener:(type,cb)=>register('window',type,cb),mode,device,initialMP:mp,
    console:{log:(...a)=>log('console',...a)},setTimeout:()=>{throw Error('unexpected timer')},
    SFX:{magic:e=>log('SFX.magic',e)},playSample:(...a)=>log('playSample',...a),addTxt:(...a)=>log('addTxt',...a),shake:n=>log('shake',n),showPH:(...a)=>log('showPH',...a),_T:s=>s,_addSkProf:id=>log('proficiency',id),
    magicRef:()=>5,statInt:()=>3,pMagicMul:()=>1.2,meleeRef:()=>6,statStr:()=>2,pAtkMul:()=>1.1,pBeamMul:()=>1.3,_skMul:()=>1.4,_fuseMul:()=>1.2,dst:(x,y,a,b)=>Math.hypot(a-x,b-y),
    _canAssignSkillSlot:()=>true,_isAbsorbed:()=>false,_gpAutoAim:n=>log('autoAim',n),$:()=>({classList:{contains:()=>false}})};
  context=vm.createContext(sandbox);
  const declarations=`
    const K={},KH={},MB={0:false,1:false,2:false},MBjust={0:false,1:false,2:false};
    let _dashHold=true,_dashHoldF=30,_dashTier=2,_harpActive=false,_dashActive=false,_cutSkipHolding=true,_cutSkipHold=40;
    const _MAP_QA_MODE=false,_BOOTH_MODE=false,_gpActive=device==='gamepad';let listeningBind=null;
    const SKILL_SLOTS=['maliceStorm'],ULT_SLOT=null,BINDS={beam:'mouse2'},BINDS2={beam:''};
    const VW=1600,VH=900,mouse={x:2000,y:3000};
    const G={on:true,paused:false,frame:12,cam:{x:20,y:30},mats:30,_fireZones:[],_boneWalls:[]};
    let P={x:10,y:20,facing:.4,s:'idle',mp:initialMP,mmp:400,skills:{maliceStorm:1,boneWall:1,hellRay:1},_fused:mode==='plain'?null:{[mode]:true},
      _msAiming:false,_msCharging:false,_msAimKey:null,_msDist:150,_msCd:0,_bnsCd:0,_beamHold:false,_mmAiming:false,_mmCharging:false};
    const _gpInjHeld={},_gpBtnsPrev={},_gpBtns={0:false},_gpad={buttons:Array.from({length:7},()=>({value:0}))};
    function report(){return {P,G,K,KH,MB,MBjust,mouse,_gpInjHeld,_gpBtnsPrev,dash:[_dashHold,_dashHoldF,_dashTier],cut:[_cutSkipHolding,_cutSkipHold]};}
  `;
  const fragments=parts.parts.filter(p=>![parts.aim,parts.pad].includes(p)).map(p=>control&&p.name==='_clearHeldInput'?p.code.replace(flags,''):p.code);
  vm.runInContext(declarations+'\n'+fragments.join('\n')+'\nfunction frame(sp=1){'+parts.aim.code+'}\nfunction padBoundary(){'+parts.pad.code+'}',context,{timeout:1000});
  const run=s=>vm.runInContext(s,context,{timeout:1000});
  const emit=(where,type)=>{for(const cb of events[where][type]||[])cb();};
  const key=(pressed,repeat=false)=>{const e=new KeyboardEvent(pressed?'keydown':'keyup',{code:'Digit1',key:'1',bubbles:true});e.repeat=repeat;document.dispatchEvent(e);};
  const enter=()=>{phase='entry';if(device==='gamepad'){run('_gpad.buttons[6].value=1;_gpBtns[0]=true;padBoundary()');}else key(true);};
  const tick=()=>{phase='frame';context.frame();};
  const charge=()=>{enter();tick();tick();assert.equal(run('P._msCharging'),true);assert.equal(run('P._msDist'),198);};
  const release=()=>{phase='release';if(device==='gamepad')run('_gpBtns[0]=false;padBoundary()');else key(false);tick();};
  const cancel=kind=>{phase='cancel';if(kind==='hidden'){document.hidden=true;emit('document','visibilitychange');}else emit('window','blur');};
  const visible=()=>{phase='visible';document.hidden=false;emit('document','visibilitychange');};
  const report=()=>({state:plain(context.report()),trace:plain(trace),rng:plain(rng)});
  const effects=()=>plain({mp:run('P.mp'),mats:run('G.mats'),msCd:run('P._msCd'),bnsCd:run('P._bnsCd'),zones:run('G._fireZones'),walls:run('G._boneWalls'),trace:trace.filter(e=>['SFX.magic','playSample','addTxt','shake','proficiency'].includes(e.type)),rng});
  return {run,context,trace,rng,key,enter,tick,charge,release,cancel,visible,report,effects};
}
function assertFired(w,mode){
  const e=w.effects();assert.equal(e.mp,mode==='plain'?100:50);assert.equal(e.mats,mode==='plain'?30:18);
  assert.equal(e.msCd,mode==='plain'?1200:0);assert.equal(e.bnsCd,mode==='plain'?0:1500);
  assert.deepEqual(e.zones.map(z=>z.type),mode==='plain'?['storm']:mode==='boneStorm'?['boneStorm']:['boneStorm','hellRay']);
  assert.equal(e.walls.length,mode==='plain'?0:1);assert.ok(e.rng.length>0);assert.equal(w.run('P._msAiming||P._msCharging'),false);
}
const modes=['plain','boneStorm','elecRepent'],devices=['keyboard','gamepad'];
for(const file of ['game.html','game-easy-test.html']){
  const parts=extract(file);
  for(const mode of modes)for(const device of devices){
    for(const event of ['blur','hidden'])test(file+' '+mode+' '+device+' '+event+' cancels charged placement before first frame',()=>{
      const w=fixture(parts,{mode,device});w.charge();w.run('P._beamHold=true;P._mmAiming=true;P._mmCharging=true;');const prior=w.effects();w.cancel(event);w.tick();
      assert.equal(w.run('P._msAiming'),false);assert.equal(w.run('P._msCharging'),false);assert.deepEqual(w.effects(),prior);
      assert.equal(w.run('P._beamHold||P._mmAiming||P._mmCharging'),false);assert.ok(Object.values(w.report().state.KH).every(v=>v===false));
      w.cancel(event);w.tick();assert.deepEqual(w.effects(),prior);
    });
    test(file+' '+mode+' '+device+' normal first release complete trace equals storm-guard-removed memory source',()=>{
      const w=fixture(parts,{mode,device}),control=fixture(parts,{mode,device,control:true});
      for(const f of [w,control]){f.charge();f.release();assertFired(f,mode);f.tick();}
      assert.deepEqual(w.report(),control.report());
      console.log('NORMAL_TRACE '+JSON.stringify({file,mode,device,effects:w.effects(),traceSHA256:sha(JSON.stringify(w.report())),equal:true}));
    });
  }
  test(file+' negative memory removal recreates charged ghost placement for ordinary and both fused modes',()=>{
    for(const mode of modes)for(const event of ['blur','hidden']){
      const w=fixture(parts,{mode,control:true});w.charge();w.cancel(event);assert.equal(w.run('P._msAiming&&P._msCharging'),true);w.tick();assertFired(w,mode);
      console.log('NEGATIVE_GHOST '+JSON.stringify({file,mode,event,effects:w.effects()}));
    }
  });
  test(file+' blur/hidden cancels all four aim-charge combinations and clears pending click with state otherwise retained',()=>{
    for(const event of ['blur','hidden'])for(const aim of [false,true])for(const charging of [false,true]){
      const w=fixture(parts);w.run(`P._msAiming=${aim};P._msCharging=${charging};P._msAimKey='Digit1';P._msDist=731;MBjust[0]=true;KH.Digit1=true;`);
      const prior=w.effects();w.cancel(event);assert.equal(w.run('P._msAiming||P._msCharging'),false);assert.equal(w.run('P._msDist'),731);assert.equal(w.run('P._msAimKey'),'Digit1');w.tick();assert.deepEqual(w.effects(),prior);
    }
  });
  test(file+' P null and undefined safely clear held containers and preserve existing helper contract',()=>{
    for(const value of ['null','undefined'])for(const event of ['blur','hidden']){
      const w=fixture(parts);w.run('P='+value+';KH.KeyW=true;MBjust[0]=true;');assert.doesNotThrow(()=>w.cancel(event));
      const s=w.report().state;assert.equal(s.KH.KeyW,false);assert.equal(s.MBjust[0],false);assert.deepEqual(s.dash,[false,0,0]);assert.deepEqual(s.cut,[false,0]);
    }
  });
  test(file+' visible notification leaves held storm untouched; fresh input after cancellation rearms normally',()=>{
    const w=fixture(parts);w.charge();const before=w.report();w.visible();assert.deepEqual(w.report(),before);w.cancel('blur');w.visible();w.tick();assert.equal(w.effects().zones.length,0);
    w.enter();w.tick();w.release();assertFired(w,'plain');assert.equal(w.effects().zones.length,1);
  });
  test(file+' non-storm player state and existing beam/mortar/dash cleanup agree with old helper',()=>{
    const w=fixture(parts),control=fixture(parts,{control:true});
    for(const f of [w,control]){f.run("P._msAiming=false;P._msCharging=false;P._beamHold=true;P._mmAiming=true;P._mmCharging=true;P._hrAiming=true;P._bwAiming=true;P._ioActive=true;P.extra={keep:7};KH.KeyW=true;MB[2]=true;");f.cancel('blur');}
    assert.deepEqual(w.report(),control.report());assert.equal(w.run('P._hrAiming&&P._bwAiming&&P._ioActive'),true);
  });
  test(file+' fused MP rejection after ordinary release keeps original partial state and trace',()=>{
    for(const mode of ['boneStorm','elecRepent']){
      const w=fixture(parts,{mode,mp:49}),control=fixture(parts,{mode,mp:49,control:true});
      for(const f of [w,control]){f.charge();f.release();assert.equal(f.effects().zones.length,0);assert.equal(f.effects().walls.length,0);assert.equal(f.effects().mp,49);assert.equal(f.effects().mats,30);assert.equal(f.effects().rng.length,0);assert.equal(f.run('P._msAiming'),true);}
      assert.deepEqual(w.report(),control.report());
    }
  });
}
