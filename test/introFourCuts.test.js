import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  function boot(){
    const els=new Map(), listeners=new Map(), frames=new Map(), timers=[];
    let now=1000, id=0, opened=0;
    const el=()=>({style:{},children:[],textContent:'',appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]},focus(){}});
    const $=key=>{if(!els.has(key))els.set(key,el());return els.get(key)};
    const c={$,OPT:{lang:'ko'},G:{},P:{},BINDS:{},keyName:x=>x,_T:x=>x,
      document:{createElement:el,createTextNode:t=>({textContent:t})},
      window:{addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:(k)=>listeners.delete(k)},
      navigator:{getGamepads:()=>[]},performance:{now:()=>now},
      requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:i=>frames.delete(i),
      setTimeout:f=>timers.push(f),clearTimeout:()=>{},saveSettings(){},
      _audioBuffers:{voice_wakeup:{}},_sampleFiles:{},playSample(){},
      _openIntroCurtain(){opened++},_isPad:()=>false};
    vm.createContext(c);
    const lines=src.match(/const _INTRO_LINES=\[[\s\S]*?\];/)[0];
    const start=src.indexOf('const _INTRO_KEY_STEPS=');
    const end=src.indexOf('// ── 커튼 상하 열림',start);
    vm.runInContext(lines+'\n'+src.slice(start,end),c);
    return {c,$,frames,timers,listeners,get opened(){return opened},run:s=>vm.runInContext(s,c),tick:()=>{now+=300},key:(code,repeat=false)=>listeners.get('keydown')?.({code,repeat,preventDefault(){},stopImmediatePropagation(){}})};
  }
  test(file+': wake-up and controls form exactly four user-paced cuts',()=>{
    const b=boot();b.run('_startIntroGuide()');
    assert.equal(b.run('_INTRO_KEY_STEPS.length'),4);
    for(let i=0;i<4;i++){
      assert.equal(b.$('ikProgress').textContent,`${i+1} / 4`);
      assert.equal(b.$('introTextKr').textContent,b.run(`_INTRO_LINES[${i}].ko`));
      assert.ok(b.$('ikBody').children.length);
      assert.equal(b.opened,0);b.tick();b.key('Enter');
    }
    assert.equal(b.opened,1);assert.equal(b.frames.size,0);
  });
  test(file+': skip any cut opens once and releases input after the curtain',()=>{
    for(let cut=0;cut<4;cut++){
      const b=boot();b.run('_startIntroGuide()');
      for(let i=0;i<cut;i++){b.tick();b.key('Space')}
      b.key('Escape');b.key('Escape');b.$('ikSkip').onclick?.({stopPropagation(){}});
      assert.equal(b.opened,1);assert.equal(b.$('introKeys').style.pointerEvents,'none');
      assert.equal(b.frames.size,0);for(const t of b.timers)t();
      assert.equal(b.listeners.size,0);assert.equal(b.opened,1);
    }
  });
  test(file+': repeated and unrelated keys cannot advance or leak into gameplay',()=>{
    const b=boot();b.run('_startIntroGuide()');b.tick();
    b.key('Enter',true);b.key('KeyE');assert.equal(b.$('ikProgress').textContent,'1 / 4');
    b.key('Enter');b.key('Enter');assert.equal(b.$('ikProgress').textContent,'2 / 4');
  });
  test(file+': Space hold skips all remaining cuts and release cancels the timer',()=>{
    const b=boot();b.run('_startIntroGuide()');b.tick();b.key('Space');
    const frame=()=>{const [id,fn]=b.frames.entries().next().value;b.frames.delete(id);fn()};
    b.tick();frame();
    b.listeners.get('keyup')?.({code:'Space',preventDefault(){},stopImmediatePropagation(){}});
    for(let i=0;i<8;i++){b.tick();frame()}
    assert.equal(b.opened,0);
    b.key('Space');b.key('Space',true);
    for(let i=0;i<7&&!b.opened;i++){b.tick();frame()}
    assert.equal(b.opened,1);assert.equal(b.frames.size,0);
    for(const t of b.timers)t();assert.equal(b.listeners.size,0);
  });
  test(file+': held gamepad A advances once and Start skips without leaving a poll',()=>{
    const b=boot(),buttons=Array.from({length:16},()=>({pressed:false}));
    b.c.navigator.getGamepads=()=>[{connected:true,buttons}];
    const frame=()=>{const [id,fn]=b.frames.entries().next().value;b.frames.delete(id);fn()};
    buttons[0].pressed=true;b.run('_startIntroGuide()');b.tick();frame();
    assert.equal(b.$('ikProgress').textContent,'1 / 4');
    buttons[0].pressed=false;frame();buttons[0].pressed=true;frame();b.tick();frame();
    assert.equal(b.$('ikProgress').textContent,'2 / 4');
    buttons[9].pressed=true;frame();assert.equal(b.opened,1);assert.equal(b.frames.size,0);
  });
  test(file+': a voice buffer loaded after skip never starts playing',async()=>{
    const b=boot();let resolveFetch,played=0;
    b.c._audioBuffers={};b.c._sampleFiles={voice_wakeup:'voice.mp3'};
    b.c.fetch=()=>new Promise(r=>{resolveFetch=r});
    b.c.actx=()=>({decodeAudioData:async()=>({})});b.c.playSample=()=>played++;
    b.run('_startIntroGuide()');b.key('Escape');
    resolveFetch({arrayBuffer:async()=>new ArrayBuffer(1)});
    await new Promise(r=>setImmediate(r));assert.equal(played,0);
  });
}
