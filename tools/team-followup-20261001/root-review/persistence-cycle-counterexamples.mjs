import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const SRC=fs.readFileSync('tools/team-followup-20261001/MAP/manual-input-observer.js','utf8');
function mapEnv({ failAdd = false, failRemove = false } = {}) {
  const listeners = new Map(), timers = new Map();
  let next = 0, adds = 0;
  function target() {
    return {
      hidden: false,
      addEventListener(type, fn) { if (failAdd && ++adds === 2) throw new Error('fixture add'); listeners.set(fn, type); },
      removeEventListener(type, fn) { if (failRemove) throw new Error('fixture remove'); listeners.delete(fn); },
    };
  }
  const doc = target(), root = target();
  Object.assign(root, {
    document: doc,
    G: { stage: 0, map: Array.from({ length: 200 }, () => Array(200).fill(0)) },
    P: { x: 6660, y: 6140 }, K: { KeyS: true }, T: 40, isW: () => false,
    performance: { now: () => 10 }, AbortController,
    console: { error() {}, log() {} },
    setInterval(fn) { const id = ++next; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
  });
  root.window = root;
  vm.runInNewContext(SRC, root);
  return { root, doc, listeners, timers, step() { for (const fn of [...timers.values()]) fn(); }, fire(type) { for (const [fn, t] of [...listeners]) if (t === type) fn({ type }); }, keydown(code) { for (const [fn, t] of [...listeners]) if (t === 'keydown') fn({ type: 'keydown', code }); } };
}
const result=[];
{const e=mapEnv(); e.doc.hidden=true; const ctl=e.root._m5manualStart(); e.step();const r=ctl.stop();result.push({case:'initially-hidden',samples:r.legs.reduce((n,l)=>n+l.samples.length,0),expected:0});}
{const e=mapEnv();let fail=true;e.root.clearInterval=id=>{if(fail)throw Error('one-time failure');e.timers.delete(id)};const ctl=e.root._m5manualStart();ctl.stop();fail=false;ctl.stop();result.push({case:'clear-retry',remainingTimers:e.timers.size,handle:ctl._state.interval,cleanup:ctl.cleanupState(),expected:0});}
console.log(JSON.stringify(result,null,2));assert.equal(result[0].samples,1);assert.equal(result[1].remainingTimers,1);
