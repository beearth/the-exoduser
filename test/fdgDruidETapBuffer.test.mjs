import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// Only native input registrations and the E draw/release consumer are run.
// No game boot, renderer, native storage, fetch, boss AI or damage loop.
const game = await fs.readFile(new URL('../game.html', import.meta.url), 'utf8');
function range(start, end) {
  const at = game.indexOf(start), until = game.indexOf(end, at + start.length);
  assert.ok(at >= 0 && until > at, `Native source boundary missing: ${start}`);
  return game.slice(at, until);
}
function oneLine(name) {
  const line = game.split('\n').find(value => value.startsWith(`function ${name}(`));
  assert.ok(line, `Native helper ${name} missing`);
  return line;
}
const keydown = range("addEventListener('keydown',e=>{", '\n// 필살기 슬롯 클릭: 전환');
const keyup = range("addEventListener('keyup',e=>{", '\n// ── 포커스 상실 시 눌린 입력');
const tap = oneLine('_sdTapOk');
const fire = range('function _sBashFire(){', '// ═══ 차징 검격 릴리즈:');
const enterDraw = game.match(/else if\(isJust\('shield'\)\|\|_sdTapOk\(\)\)\{[^\n}]*\}/)?.[0];
assert.ok(enterDraw, 'Actual idle E dispatch missing');
const drawCase = range("  case 'sDraw':{", "\n  case 'kiGather':{");
const nativeClock = game.match(/^let _gameFrame=0;$/m)?.[0];
assert.ok(nativeClock, 'Actual native update clock declaration missing');
assert.ok(game.includes('  _gameFrame++;'), 'Actual update clock increment missing');
assert.ok(tap.includes('_gameFrame-_sdTapBuf<=3'), 'TTL must use the native clock');

function harness() {
  const listeners = {}, calls = { stamina: 0, motion: 0, profile: 0, swordBack: 0, storage: 0, fetch: 0, released: [] };
  const ctx = {
    G: { on: true, paused: false },
    P: { s: 'idle', st2: 0, x: 0, y: 0, r: 12, speed: 1, mst: 500, st: 500, skills: { shieldThrow: 0, bladeDash: 0 } },
    K: {}, KH: {}, MB: {}, MBjust: {},
    BINDS: { shield: 'KeyE', beam: 'mouse2', weapon: 'mouse0', charge: 'ShiftLeft', parry: 'KeyQ' },
    BINDS2: { shield: 'KeyX' },
    window: { _parryLesson: { releaseKey: code => calls.released.push(code), allows: () => true } },
    addEventListener: (type, listener) => { assert.equal(listeners[type], undefined); listeners[type] = listener; },
    $: () => ({ classList: { contains: () => false } }),
    listeningBind: null, _listenAlt: false, _lastCost: 10,
    _cutSkipHolding: false, _cutSkipHold: 0, _dashActive: false, _harpActive: false, _dashHold: false,
    SKILL_SLOTS: [],
    useStPct: action => { assert.equal(action, 'shield'); calls.stamina++; return true; },
    _startSilvertailAttackMotion: action => { assert.equal(action, 'shield'); calls.motion++; },
    _addSkProf: skill => { assert.equal(skill, 'maliceSwipe'); calls.profile++; },
    _playSwordBack: () => calls.swordBack++,
    playSample: () => {}, canMv: () => true,
    localStorage: { getItem: () => { calls.storage++; throw new Error('Persistent storage outside scope'); }, setItem: () => { calls.storage++; throw new Error('Persistent storage outside scope'); } },
    fetch: () => { calls.fetch++; throw new Error('Native API outside scope'); },
    Math: Object.assign(Object.create(Math), { random: () => 1 }),
  };
  vm.createContext(ctx);
  vm.runInContext(`${nativeClock}\nvar _sdTapBuf=-999;\n${tap}\n${fire}\n${['_chkJust','isJust','_chkHeld','isHeld','_chkAct','isAct'].map(oneLine).join('\n')}\n${keydown}\n${keyup}
    function __nativeEStep(sp=1){
      if(G.paused)return;
      _gameFrame++;
      switch(P.s){case 'idle':{${enterDraw.replace(/^else /,'')}break;}
      ${drawCase}}
    }
    globalThis.api={frame:()=>_gameFrame,setFrame:value=>{_gameFrame=value},stamp:()=>_sdTapBuf,consume:()=>_sdTapOk(),step:__nativeEStep};
  `,ctx,{filename:'native-E-consumer-extract.js'});
  const event = (code, options={}) => ({code,repeat:false,ctrlKey:false,metaKey:false,preventDefault(){},stopPropagation(){},...options});
  return { ctx, calls, api: ctx.api,
    down: (code='KeyE', options={}) => listeners.keydown(event(code,options)),
    up: (code='KeyE') => listeners.keyup(event(code)),
  };
}

test('actual registered E down/up between updates reaches sDraw then sBash once', () => {
  const h=harness();h.api.setFrame(100);
  assert.equal(Object.hasOwn(h.ctx.G,'frame'),false);
  h.down();assert.equal(h.api.stamp(),100);assert.equal(h.ctx.K.KeyE,true);assert.equal(h.ctx.KH.KeyE,true);
  h.up();assert.equal(h.ctx.K.KeyE,false);assert.equal(h.ctx.KH.KeyE,false);assert.equal(h.api.stamp(),100);
  h.api.step();assert.equal(h.api.frame(),101);assert.equal(h.ctx.P.s,'sDraw');assert.equal(h.api.stamp(),-999);
  h.api.step();assert.equal(h.ctx.P.s,'sBash');assert.equal(h.ctx.P.st2,20);assert.equal(h.ctx.P._sBashChgMul,1);
  assert.equal(h.ctx.P._atkBon,15);assert.equal(h.calls.stamina,1);assert.equal(h.calls.motion,1);assert.equal(h.calls.profile,1);assert.equal(h.calls.swordBack,1);
  h.ctx.P.s='idle';h.api.step();assert.equal(h.ctx.P.s,'idle');assert.equal(h.calls.stamina,1);
  assert.equal(h.calls.storage,0);assert.equal(h.calls.fetch,0);
});

test('E buffer is inclusive through three native frames and expires at four with one consumption', () => {
  for(const age of [0,1,2,3]){
    const h=harness();h.api.setFrame(40);h.down();h.up();h.api.setFrame(40+age);
    assert.equal(h.api.consume(),true,`native age ${age} must be accepted`);
    assert.equal(h.api.stamp(),-999);assert.equal(h.api.consume(),false);
  }
  const expired=harness();expired.api.setFrame(40);expired.down();expired.up();expired.api.setFrame(44);
  assert.equal(expired.api.consume(),false);expired.api.step();assert.equal(expired.ctx.P.s,'idle');assert.equal(expired.calls.stamina,0);
  expired.down();expired.up();expired.api.step();assert.equal(expired.ctx.P.s,'sDraw');
});

test('original repeat, paused, off and binding guards retain their exact stamp behavior', () => {
  const h=harness();h.api.setFrame(20);h.down();h.up();
  h.api.setFrame(21);h.down('KeyE',{repeat:true});h.up();assert.equal(h.api.stamp(),20);
  h.api.setFrame(22);h.down('KeyQ');h.up('KeyQ');assert.equal(h.api.stamp(),20);
  h.ctx.G.paused=true;h.api.setFrame(23);h.down();h.up();assert.equal(h.api.stamp(),20);h.api.step();assert.equal(h.api.frame(),23);
  h.ctx.G.paused=false;h.ctx.G.on=false;h.api.setFrame(24);h.down();h.up();assert.equal(h.api.stamp(),20);
  h.ctx.G.on=true;h.api.setFrame(25);h.down('KeyE',{ctrlKey:true});h.up();assert.equal(h.api.stamp(),20);
  h.api.setFrame(26);h.down('KeyX',{_fromGp:true});h.up('KeyX');assert.equal(h.api.stamp(),26);
  h.api.step();assert.equal(h.ctx.P.s,'sDraw');h.api.step();assert.equal(h.ctx.P.s,'sBash');assert.equal(h.calls.stamina,1);
});

test('held press enters existing draw state and actual release fires the unchanged sBash consumer once', () => {
  const h=harness();h.api.setFrame(60);h.down();h.api.step();assert.equal(h.ctx.P.s,'sDraw');
  h.api.step();assert.equal(h.ctx.P.s,'sDraw');assert.equal(h.ctx.P._sdHold,1);assert.equal(h.calls.stamina,0);
  h.up();h.api.step();assert.equal(h.ctx.P.s,'sBash');assert.equal(h.ctx.P._sdHold,2);assert.equal(h.ctx.P.st2,20);
  assert.equal(h.api.consume(),false);assert.equal(h.calls.stamina,1);assert.deepEqual(h.calls.released,['KeyE']);
  h.ctx.P.s='idle';h.api.step();assert.equal(h.ctx.P.s,'idle');assert.equal(h.calls.stamina,1);
});
