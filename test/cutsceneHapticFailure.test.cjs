// Whole production _renderIntroCutscene; canvas/audio/clock/gamepad are doubles.
// Rejection observation runs in a child process so the baseline unhandled Promise
// does not contaminate node:test. No native input, haptics, saves or rendering QA.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),acorn=require('acorn'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir;
function source(file,folder){const html=fs.readFileSync(path.join(folder,file),'utf8');const at=html.indexOf('function _renderIntroCutscene(');assert(at>=0);const n=acorn.parseExpressionAt(html,at,{ecmaVersion:'latest'});return html.slice(at,n.end)}
function run(fn,mode){
 const worker=String.raw`
 const vm=require('node:vm');const input=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
 const effects=[],draw=[],local=[],unhandled=[],error=new Error('actuator rejected');
 process.on('unhandledRejection',e=>unhandled.push(e===error?'same-error':'other-error'));
 const ctx={};for(const name of ['fillRect','save','beginPath','rect','clip','translate','restore','fillText'])ctx[name]=(...args)=>draw.push([name,...args]);
 const mode=input.mode;const line={dur:2000,vfx:{shake:2}};
 const actuator=()=>({playEffect(type,options){effects.push([type,options]);if(mode==='sync-throw')throw error;
  const p=mode==='reject'||mode==='multiple-reject'?Promise.reject(error):Promise.resolve('complete');
  p.catch=function(handler){local.push('catch-attached');return Promise.prototype.catch.call(this,handler)};return p;}});
 const pads=mode==='no-pad'?[]:mode==='no-actuator'?[null,{}]:[{vibrationActuator:actuator()}];
 if(mode==='multiple-reject')pads.push(null,{vibrationActuator:actuator()});
 const c={OPT:{lang:'ko'},C:{width:1280,height:720},_cutC:{width:1280,height:720,style:{}},_cutX:ctx,
  _cutsceneState:mode==='inactive'?null:'INTRO_CUTSCENE',_cutSkipHolding:false,_cutSkipHold:0,_cutSkipLastT:0,_CUT_SKIP_DUR:1000,
  _cutLineIdx:0,_cutLineStartMs:0,_cutsceneIdx:-1,_cutVibDone:mode==='already-done',_cutSeq:'INTRO',
  _cutsceneGetLines:()=>[line],_cutsceneEnd:()=>draw.push(['end']),performance:{now:()=>10},_T:x=>x,
  navigator:{getGamepads(){if(mode==='getpads-throw')throw error;return pads;}}};
 if(mode==='no-shake')line.vfx.shake=0;
 if(mode==='expired')line.dur=5;
 if(mode==='already-done')c._cutsceneIdx=0;
 vm.createContext(c);vm.runInContext(input.fn,c);c._renderIntroCutscene();
 if(mode==='repeat')c._renderIntroCutscene();
 if(mode==='next-line'){c._cutsceneIdx=-1;c._renderIntroCutscene();}
 setImmediate(()=>setImmediate(()=>process.stdout.write(JSON.stringify({effects,draw,local,unhandled,state:{idx:c._cutLineIdx,sceneIdx:c._cutsceneIdx,done:c._cutVibDone,display:c._cutC.style.display}}))));
 `;
 const out=spawnSync(process.execPath,['-e',worker],{input:JSON.stringify({fn,mode}),encoding:'utf8',timeout:10000});assert.equal(out.status,0,out.stderr);return JSON.parse(out.stdout);
}
for(const file of ['game.html','game-easy-test.html']){
 const fn=source(file,dir),before=source(file,baseline);
 for(const mode of ['fulfilled','reject','multiple-reject','sync-throw','getpads-throw','no-pad','no-actuator','inactive','already-done','no-shake','expired','repeat','next-line']){
  test(file+' '+mode+' local rejection handling preserves render/timeline',()=>{
   const actual=run(fn,mode),old=run(before,mode);
   assert.deepEqual(actual.effects,old.effects);assert.deepEqual(actual.draw,old.draw);assert.deepEqual(actual.state,old.state);
   assert.deepEqual(actual.unhandled,[]);
   const expected=mode==='multiple-reject'?2:mode==='repeat'?1:mode==='next-line'?2:['fulfilled','reject','sync-throw'].includes(mode)?1:0;
   assert.equal(actual.effects.length,expected);
   for(const [type,options]of actual.effects){assert.equal(type,'dual-rumble');assert.deepEqual(options,{startDelay:0,duration:1200,weakMagnitude:2/3,strongMagnitude:2/3})}
   if(['reject','multiple-reject'].includes(mode)&&fn!==before)assert.equal(old.unhandled.length,expected);
   if(!['sync-throw','getpads-throw'].includes(mode))assert.equal(actual.local.length,expected);
  });
 }
}
