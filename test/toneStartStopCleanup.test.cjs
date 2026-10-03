// Actual whole playTone against controlled Web Audio nodes/timers; no native audio.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baselineDir=process.env.EXODUSER_TEST_BASELINE_DIR;
function extract(s){const at=s.indexOf('function playTone(');assert(at>=0);return s.slice(at,acorn.parseExpressionAt(s,at,{ecmaVersion:'latest'}).end)}
function fixture(code,fail={}){
  const error=new Error('original start/stop failure'),events=[],timers=[];
  const state={playing:false,oscConnected:false,gainConnected:false,oscDisconnects:0,gainDisconnects:0,stopAttempts:0};
  const param=label=>({setValueAtTime:(...a)=>events.push([label,'set',...a]),linearRampToValueAtTime:(...a)=>events.push([label,'linear',...a]),exponentialRampToValueAtTime:(...a)=>events.push([label,'exp',...a])});
  const o={frequency:param('frequency'),connect:()=>{events.push(['o.connect']);state.oscConnected=true},
    start:t=>{events.push(['start',t]);if(fail.start)throw error;state.playing=true},
    stop:t=>{events.push(['stop',t]);state.stopAttempts++;if(t!==undefined&&fail.stop)throw error;
      if(t===undefined&&fail.cleanupStop)throw new Error('cleanup stop failure');if(t===undefined)state.playing=false},
    disconnect:()=>{events.push(['o.disconnect']);state.oscDisconnects++;if(fail.oscDisconnect)throw new Error('o disconnect failure');state.oscConnected=false}};
  const g={gain:param('gain'),connect:()=>{events.push(['g.connect']);state.gainConnected=true},
    disconnect:()=>{events.push(['g.disconnect']);state.gainDisconnects++;if(fail.gainDisconnect)throw new Error('g disconnect failure');state.gainConnected=false}};
  const c=vm.createContext({_activeNodeCnt:4,_MAX_ACTIVE_NODES:48,_r:x=>x,mbus:()=>({}),
    actx:()=>({currentTime:10,createOscillator:()=>{events.push(['createOscillator']);return o},createGain:()=>{events.push(['createGain']);return g}}),
    setTimeout:(f,ms)=>{timers.push({f,ms});events.push(['timer',ms])}});
  vm.runInContext(code,c);return {c,o,g,error,events,timers,state};
}
for(const file of ['game.html','game-easy-test.html']){
  const code=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const old=baselineDir?extract(fs.readFileSync(path.join(baselineDir,file),'utf8')):code;
  for(const args of [[200,.2,'triangle',.1,100,.01],[200,.2,undefined,.1]]){
    test(file+' normal envelope, start/stop times, counter and cleanup stay equivalent '+args.length,()=>{
      const c=fixture(code),b=fixture(old);c.c.playTone(...args);b.c.playTone(...args);
      assert.deepEqual(c.events,b.events);assert.equal(c.c._activeNodeCnt,5);assert.equal(c.timers.length,1);assert.equal(c.timers[0].ms,700);
      c.o.onended();b.o.onended();c.timers[0].f();b.timers[0].f();
      assert.deepEqual(c.events,b.events);assert.equal(c.c._activeNodeCnt,4);assert.equal(c.state.oscDisconnects,1);assert.equal(c.state.gainDisconnects,1);
    });
  }
  test(file+' cap skips creation and keeps existing counter',()=>{
    const f=fixture(code);f.c._activeNodeCnt=48;f.c.playTone(200,.2,'sine',.1);
    assert.equal(f.events.length,0);assert.equal(f.c._activeNodeCnt,48);
  });
  for(const [name,fail] of [['start',{start:true}],['scheduled stop',{stop:true}],
    ['cleanup stop fails',{stop:true,cleanupStop:true}],['oscillator disconnect fails',{stop:true,cleanupStop:true,oscDisconnect:true}],
    ['gain disconnect fails',{stop:true,cleanupStop:true,gainDisconnect:true}],['all cleanup fails',{stop:true,cleanupStop:true,oscDisconnect:true,gainDisconnect:true}]]){
    test(file+' '+name+' preserves original error, attempts independent cleanup, keeps other voices',()=>{
      const f=fixture(code,fail);assert.throws(()=>f.c.playTone(200,.2,'sine',.1),e=>e===f.error);
      assert.equal(f.c._activeNodeCnt,4);assert.equal(f.timers.length,0);assert.equal(f.o.onended,undefined);
      assert.equal(f.state.oscDisconnects,1);assert.equal(f.state.gainDisconnects,1);
      assert.equal(f.state.stopAttempts,fail.start?1:2);
      const audible=f.state.playing&&f.state.oscConnected&&f.state.gainConnected;
      assert.equal(audible,name==='all cleanup fails'); // Recovery cannot be guaranteed when every API fails.
    });
  }
}
