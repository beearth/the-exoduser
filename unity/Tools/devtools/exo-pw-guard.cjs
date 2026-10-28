// exo-pw-guard.cjs - 공용 실행기(exo-unity.ps1 browser)가 node --require 로 미리 불러오는 Playwright 가드.
// headless 를 강제하고(headless:false/--headed 는 거부), 크로미움에 --mute-audio 를 덧붙인다.
'use strict';
const Module = require('module');
const origLoad = Module._load;
const PATCHED = Symbol.for('exo.pw.patched');
const BAD_ARG = /^--(headed|headless=false)$/i;

function reject(why) {
  const msg = 'EXO_REJECT ' + why;
  console.error(msg);
  const e = new Error(msg);
  e.exoReject = true;
  throw e;
}

function patchType(bt, name) {
  if (!bt || bt[PATCHED]) return;
  bt[PATCHED] = true;
  for (const fn of ['launch', 'launchPersistentContext']) {
    const orig = bt[fn];
    if (typeof orig !== 'function') continue;
    const idx = fn === 'launch' ? 0 : 1;
    bt[fn] = function (...a) {
      const o = Object.assign({}, a[idx] || {});
      if (o.headless === false) reject('headless:false 는 허용되지 않음 (' + name + '.' + fn + ')');
      if ((o.args || []).some((x) => BAD_ARG.test(String(x)))) reject('--headed 계열 인자는 허용되지 않음');
      o.headless = true;
      if (name === 'chromium') o.args = Array.from(new Set([...(o.args || []), '--mute-audio']));
      else if (name === 'firefox') o.firefoxUserPrefs = Object.assign({ 'media.volume_scale': '0.0' }, o.firefoxUserPrefs || {});
      a[idx] = o;
      return orig.apply(this, a);
    };
  }
}

function patchExports(ex) {
  if (!ex || typeof ex !== 'object') return ex;
  for (const n of ['chromium', 'firefox', 'webkit']) if (ex[n] && typeof ex[n].launch === 'function') patchType(ex[n], n);
  return ex;
}

Module._load = function (request, parent, isMain) {
  const ex = origLoad.apply(this, arguments);
  if (/^(playwright|playwright-core|@playwright\/test)$/.test(request)) patchExports(ex);
  return ex;
};

// 스크립트가 다른 경로의 playwright 를 쓰더라도 EXO_NODE_MODULES 쪽 복사본도 미리 패치해 둔다.
try {
  const nm = process.env.EXO_NODE_MODULES;
  if (nm) patchExports(require(require('path').join(nm, 'playwright')));
} catch (_) { /* playwright 가 없으면 스크립트가 알아서 실패 */ }
