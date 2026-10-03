// Actual complete notification functions and registered gamepad callbacks.
// Controlled clock, DOM leaves and gamepad/storage sinks; no native input or pixels.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR;
function extract(html){
  const expressionAt=anchor=>{const at=html.indexOf(anchor);assert(at>=0,anchor);assert.equal(html.indexOf(anchor,at+1),-1);return html.slice(at,acorn.parseExpressionAt(html,at,{ecmaVersion:'latest'}).end)};
  assert.match(html,/<div class="notif" id="notif"><\/div>/);
  let scripts=0,maps=0;
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=/\btype\s*=\s*["']([^"']+)["']/i.exec(m[1])?.[1]||'';
    if(type==='importmap'){JSON.parse(m[2]);maps++;continue;}
    if(type&&!['module','text/javascript','application/javascript'].includes(type))continue;
    acorn.parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});scripts++;
  }
  assert.equal(scripts,6);assert.equal(maps,1);
  return ['function notify(','function showPH(',"addEventListener('gamepadconnected'", "addEventListener('gamepaddisconnected'"].map(expressionAt).join('\n');
}
function fixture(code,{locale='ko'}={}){
  let now=0,id=0;const timers=new Map(),handlers={},calls=[],storage=[],els=new Map();
  const el=name=>{if(!els.has(name)){const classes=new Set();els.set(name,{textContent:'',children:[],style:{},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)}})}return els.get(name)};
  const c={$:el,_T:t=>locale==='ko'?t:'[en] '+t,_charIdx:0,playSample:(...a)=>calls.push(['sample',...a]),
    _gpConnected:false,_gpActive:false,_gpVibRef:null,_gpad:null,G:{on:true,paused:false},C:{style:{}},document:{body:{style:{}}},
    console:{log:(...a)=>calls.push(['log',...a])},localStorage:{setItem:(...a)=>storage.push(a)},_gpClearAll:()=>calls.push(['clearKeys']),_applyCursor:()=>calls.push(['cursor']),
    addEventListener:(name,fn)=>{assert.equal(handlers[name],undefined);handlers[name]=fn},
    setTimeout:(fn,ms)=>{const n=++id;timers.set(n,{fn,due:now+ms,ms});return n},clearTimeout:n=>timers.delete(n)};
  vm.createContext(c);vm.runInContext(code,c);
  const advance=to=>{assert(to>=now);while(true){const next=[...timers].filter(([,t])=>t.due<=to).sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];if(!next)break;const [n,t]=next;timers.delete(n);now=t.due;t.fn()}now=to};
  const state=()=>({text:el('notif').textContent,on:el('notif').classList.contains('on'),bottom:el('notif').style.bottom,pending:[...timers.values()].map(t=>({due:t.due,ms:t.ms}))});
  return {c,timers,handlers,calls,storage,el,advance,state};
}
for(const file of ['game.html','game-easy-test.html']){
  const code=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const old=baseline?extract(fs.readFileSync(path.join(baseline,file),'utf8')):code;
  for(const locale of ['ko','en'])test(file+' single notification keeps translation, bottom and exact1500ms lifetime '+locale,()=>{
    const a=fixture(code,{locale}),b=fixture(old,{locale});a.c.notify('A');b.c.notify('A');assert.deepEqual(a.state(),b.state());assert.equal(a.state().pending[0].ms,1500);
    a.advance(1499);b.advance(1499);assert.deepEqual(a.state(),b.state());assert.equal(a.state().on,true);
    a.advance(1500);b.advance(1500);assert.deepEqual(a.state(),b.state());assert.equal(a.state().on,false);assert.equal(a.state().bottom,'270px');
  });
  for(const at of [0,200,800,1499])test(file+' later message gets full1500ms when replaced at '+at,()=>{
    const w=fixture(code);w.c.notify('A');w.advance(at);w.c.notify('B');assert.equal(w.timers.size,1);
    w.advance(at+1499);assert.equal(w.state().on,true);assert.equal(w.state().text,'B');assert.equal(w.state().bottom,'260px');
    w.advance(at+1500);assert.equal(w.state().on,false);assert.equal(w.state().bottom,'270px');assert.equal(w.timers.size,0);
  });
  test(file+' expired handle is harmless, repeated bursts keep only final timer',()=>{
    const w=fixture(code);w.c.notify('expired');w.advance(1500);assert.equal(w.timers.size,0);
    for(let i=0;i<12;i++){w.c.notify('burst'+i);assert.equal(w.timers.size,1);w.advance(1500+i*10)}
    const due=w.state().pending[0].due;w.advance(due-1);assert.equal(w.state().text,'burst11');assert.equal(w.state().on,true);w.advance(due);assert.equal(w.state().on,false);
  });
  test(file+' notify, showPH and unrelated timers do not cancel each other',()=>{
    const w=fixture(code);let unrelated=0;w.c.setTimeout(()=>unrelated++,1000);w.c.notify('A');w.c.showPH('PH','#ff8844');
    w.advance(200);w.c.notify('B');assert.equal(w.timers.size,3);w.advance(500);assert.equal(w.el('ph').classList.contains('on'),false);assert.equal(w.state().on,true);
    w.advance(1000);assert.equal(unrelated,1);w.advance(1500);assert.equal(w.state().on,true);w.advance(1700);assert.equal(w.state().on,false);
  });
  test(file+' whole connect/disconnect callbacks replace toast without altering input-mode sinks',()=>{
    const a=fixture(code),b=fixture(old),event={gamepad:{id:'synthetic controller',vibrationActuator:{}}};
    for(const w of [a,b]){w.handlers.gamepadconnected(event);w.advance(800);w.handlers.gamepaddisconnected(event)}
    assert.deepEqual(a.calls,b.calls);assert.deepEqual(a.storage,b.storage);assert.deepEqual(a.storage,[['inputMode','pad'],['inputMode','kbm']]);
    for(const key of ['_gpConnected','_gpActive','_gpVibRef','_gpad'])assert.equal(a.c[key],b.c[key]);
    assert.equal(a.state().text,'🎮 패드 연결 끊김');a.advance(1500);assert.equal(a.state().on,true);a.advance(2299);assert.equal(a.state().on,true);a.advance(2300);assert.equal(a.state().on,false);
  });
  test(file+' clock lifetime is independent of game pause and G.on',()=>{
    const w=fixture(code);w.c.G.on=false;w.c.G.paused=true;w.c.notify('A');w.advance(800);w.c.notify('B');w.advance(1500);assert.equal(w.state().on,true);w.advance(2300);assert.equal(w.state().on,false);
    assert.equal(w.c.G.on,false);assert.equal(w.c.G.paused,true);
  });
}
