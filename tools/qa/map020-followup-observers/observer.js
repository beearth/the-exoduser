/* Diagnostic only. Evaluate as a classic script in game.html's main world.
 * Does not boot, drive, spawn, or modify game state. Timings include observer overhead.
 * Direct identifier bindings are restored only when still owned by this observer. */
(() => {
  'use strict';
  const root = globalThis, key = '__map020Observers';
  if (root[key]?.version === 1 && !root[key].disposed) return root[key].status();
  const safe = (f, fallback = null) => { try { return f(); } catch { return fallback; } };
  const active = new Map(), finished = new Map();
  function session(name, options) {
    if (active.has(name)) throw Error(name + ' already installed; dispose first');
    const limit = Math.max(100, Math.min(100000, options.limit || 20000));
    const records = [], undo = [], conflicts = [];
    let dropped = 0, running = true, timer = null;
    const s = { name, records, undo, conflicts, options,
      push(r) { if (records.length < limit) records.push(r); else dropped++; },
      snapshot() { return { name, running, dropped, limit, options, records: records.slice(), conflicts: conflicts.slice() }; },
      dispose() {
        if (running) { running = false; clearTimeout(timer); for (const f of undo.reverse()) f(); active.delete(name); finished.set(name, s); }
        return s.snapshot();
      },
      get running() { return running; }
    };
    finished.delete(name); active.set(name, s);
    timer = setTimeout(() => s.dispose(), Math.max(100, Math.min(120000, options.durationMs || 20000)));
    return s;
  }
  function patch(s, label, get, set, decorate) {
    const original = get();
    if (typeof original !== 'function') throw Error('Missing callable: ' + label);
    const wrapped = decorate(original);
    set(wrapped);
    if (get() !== wrapped) throw Error('Binding write not observed: ' + label);
    s.undo.push(() => { if (get() === wrapped) set(original); else s.conflicts.push(label); });
  }
  function installDrop(options = {}) {
    const s = session('drop', options), stack = [];
    let callId = 0;
    function timed(label, original, before, after) {
      return function (...args) {
        const meta = safe(() => before?.(args), {}), parent = stack.at(-1);
        const e = { id: ++callId, parentId: parent?.id || null, label, start: performance.now(), childMs: 0, ...meta };
        stack.push(e); let result, threw = false;
        try { result = original.apply(this, args); return result; }
        catch (error) { threw = true; throw error; }
        finally {
          const end = performance.now(); stack.pop();
          e.inclusiveMs = end - e.start; e.selfMs = Math.max(0, e.inclusiveMs - e.childMs);
          e.threw = threw; Object.assign(e, safe(() => after?.(args, result, meta), {}));
          if (parent) parent.childMs += e.inclusiveMs;
          s.push(e);
        }
      };
    }
    function itemMeta(args) {
      const it = args[0]; if (!it) return { cache: 'no-item' };
      let base = it.wtype || it.btype || it.slot || '';
      if (it.slot === 'bonePart') base = 'bone_' + (it.part || 'skull');
      base = ({ ring1: 'ring', ring2: 'ring', headband: 'earring', headband2: 'earring' })[base] || base;
      const cutout = _ITEM_CUTOUT_BASES.has(base);
      const assetKey = cutout ? 'img/ui/item-cutouts/' + base + '_phys_cutout.png' : _itemSkinSrc(base, _ELKEY[it.el || 0] || 'phys');
      const img = _worldItemSkinCache.get(assetKey);
      return { assetKey, actualSrc: img?.currentSrc || img?.src || null, assetCache: img ? 'hit' : 'miss', cutout, maskCachedBefore: !!img?._worldDropMasked,
        cache: !img || !img.complete || !img.naturalWidth ? 'notready' : cutout ? 'cutout-bypass' : img._worldDropMasked ? 'hit' : 'miss' };
    }
    try {
      patch(s, '_maskWorldDropBlack', () => _maskWorldDropBlack, v => { _maskWorldDropBlack = v; },
        f => timed('mask', f, a => ({ width: a[0].width, height: a[0].height })));
      patch(s, '_worldDropFxTile', () => _worldDropFxTile, v => { _worldDropFxTile = v; }, f => timed('fxTile', f, a => {
        const [frame, tile] = a, img = _worldDropFx[frame];
        const ready = !!(img?.complete && img.naturalWidth);
        const cached = _worldDropFxTiles[frame]?.[tile];
        const rows = ready ? Math.floor(img.naturalHeight / Math.floor(img.naturalWidth / _WORLD_DROP_FX_COLS)) : 0;
        return { frame, tile, assetKey: img?.src || null, cache: !ready ? 'notready' : cached ? 'hit' : Math.trunc(tile / _WORLD_DROP_FX_COLS) >= rows ? 'oob' : 'miss' };
      }));
      patch(s, '_worldItemSkin', () => _worldItemSkin, v => { _worldItemSkin = v; }, f => timed('itemSkin', f, itemMeta,
        (a, result, meta) => ({ returned: !!result, cacheBefore: meta.cache,
          cache: !result ? 'notready-or-null' : meta.cutout ? 'cutout-bypass' : meta.maskCachedBefore ? 'hit' : 'miss',
          actualSrc: safe(() => { const img = _worldItemSkinCache.get(meta.assetKey); return img?.currentSrc || img?.src || null; }) })));
      for (const method of ['drawImage', 'getImageData', 'putImageData']) {
        const p = CanvasRenderingContext2D.prototype;
        patch(s, '2d.' + method, () => p[method], v => { p[method] = v; }, original => {
          const measured = timed('2d.' + method, original, a => ({ source: a[0]?.src || null }));
          return function (...args) { return stack.length ? measured.apply(this, args) : original.apply(this, args); };
        });
      }
      s.summary = () => {
        const byLabel = {}, reuse = {};
        for (const r of s.records) {
          const a = byLabel[r.label] ||= { calls: 0, inclusiveMs: 0, selfMs: 0 };
          a.calls++; a.inclusiveMs += r.inclusiveMs; a.selfMs += r.selfMs;
          if (r.label === 'fxTile' || r.label === 'itemSkin') {
            const k = r.label + ':' + r.assetKey + (r.label === 'fxTile' ? ':' + r.frame + ':' + r.tile : '');
            const b = reuse[k] ||= {}; b[r.cache] = (b[r.cache] || 0) + 1;
            if (r.assetCache) b['asset-' + r.assetCache] = (b['asset-' + r.assetCache] || 0) + 1;
          }
        }
        return { ...s.snapshot(), byLabel, reuse,
          note: 'inclusive columns are nested; never add them. selfMs partitions synchronous wrapped calls only. mask self includes pixel loop, getContext and JS bookkeeping; it is not pure loop time. getImageData wall time is not GPU duration. dropped>0 invalidates complete totals.' };
      };
      return { installed: true, name: s.name, bindingVerification: 'direct identifier read/write identity checked', durationMs: options.durationMs || 20000 };
    } catch (e) { s.dispose(); throw e; }
  }
  function installVfx(options = {}) {
    const s = session('vfx', options), seen = new WeakMap();
    let nextId = 0, pageRafs = 0, updates = 0, draws = 0, raf = 0, samplingErrors = 0;
    const state = () => {
      const gl = safe(() => GL), glAvailable = Boolean(gl && typeof gl.isContextLost === 'function');
      const lost = glAvailable ? safe(() => gl.isContextLost()) : null;
      return { visibility: document.visibilityState, hidden: document.hidden,
      bootActive: safe(() => _bootLoadActive), warmDone: safe(() => _ensWarmDone), useGL: safe(() => _useGL),
      glAvailable, contextLost: typeof lost === 'boolean' ? lost : null,
      ensDrawn: safe(() => _dbgEns8GL), ensQueued: safe(() => _ens8GLTotal),
      gameTime: safe(() => _gameTime), physStep: safe(() => PHYS_STEP), cap: safe(() => OPT.fpsCap),
      gameOn: safe(() => G.on), paused: safe(() => G.paused) };
    };
    function sample(phase) {
      const g = state(), now = performance.now(), arr = safe(() => ens, []);
      const gate = g.visibility === 'visible' && g.hidden === false && g.bootActive === false && g.warmDone === true && g.useGL === true && g.glAvailable === true && g.contextLost === false && g.gameOn === true;
      for (const e of arr) {
        if (!e || typeof e !== 'object') continue;
        let prev = seen.get(e); const hf = e._hitFlash || 0, alive = e.alive === true, rev = e._reviveTimer || 0;
        const events = [];
        if (!prev) { prev = { id: ++nextId, hf, alive, rev, awaitingDraw: false }; seen.set(e, prev); events.push('first-observed-object'); }
        else {
          if (prev.alive && !alive) events.push('death-observed');
          if (!prev.alive && alive) { events.push('revive-observed'); prev.awaitingDraw = true; }
          if (hf > prev.hf) events.push(prev.hf > 0 ? 'flash-increase' : 'flash-start-observed');
          if (hf < prev.hf) events.push(hf ? 'flash-decrease' : 'flash-zero-observed');
        }
        const firstDraw = prev.awaitingDraw && (phase === 'before-draw' || phase === 'after-draw');
        if (firstDraw) events.push('first-draw-after-revive');
        if (events.length || hf || prev.hf || rev || prev.rev || firstDraw) s.push({ phase, now, pageRafs, updates, draws, id: prev.id,
          etype: e.etype, ib: !!e.ib, hf, alive, reviveTimer: rev, glMode: e._ensGLMode ?? null, events, ...g,
          runtimeGate: gate, regularBootAttested: options.regularBootAttested === true,
          glDrawEvidence: phase === 'after-draw' && gate && e._ensGLMode === 1 && g.ensDrawn > 0 });
        if (phase === 'after-draw' && firstDraw) prev.awaitingDraw = false;
        prev.hf = hf; prev.alive = alive; prev.rev = rev;
      }
    }
    function observe(phase) { try { sample(phase); } catch { samplingErrors++; } }
    try {
      patch(s, 'update', () => update, v => { update = v; }, original => function (...args) {
        observe('before-update'); let result;
        try { result = original.apply(this, args); return result; }
        finally { updates++; observe('after-update'); }
      });
      patch(s, 'draw', () => draw, v => { draw = v; }, original => function (...args) {
        observe('before-draw');
        try { return original.apply(this, args); }
        finally { draws++; observe('after-draw'); }
      });
      function pageFrame() { if (!s.running) return; pageRafs++; raf = requestAnimationFrame(pageFrame); }
      raf = requestAnimationFrame(pageFrame); s.undo.push(() => cancelAnimationFrame(raf));
      observe('install');
      s.summary = () => ({ ...s.snapshot(), pageRafs, updates, draws, samplingErrors,
        transitionRows: s.records.filter(r => r.events.some(e => /death|revive/.test(e))),
        note: 'update/draw are actual wrapped calls; pageRafs is an independent display callback. after-update is not a displayed frame. First draw rows are same-object revivals only. New objects are not automatically identified as ghoul revivals. No lifetime PASS or visual PASS is inferred. Boot flags cannot prove absence of prior forced boot; operator attestation and boot evidence required.' });
      return { installed: true, name: s.name, state: state(), regularBootAttested: options.regularBootAttested === true };
    } catch (e) { s.dispose(); throw e; }
  }
  const api = { version: 1, disposed: false, installDrop, installVfx,
    status: () => ({ installed: [...active.keys()], disposed: api.disposed }),
    report: name => { const s = active.get(name) || finished.get(name); if (!s) throw Error('Not installed: ' + name); return s.summary(); },
    stop: name => { const s = active.get(name); if (!s) return null; const report = s.summary(); report.cleanup = s.dispose(); return report; },
    dispose() { const reports = [...active.keys()].map(n => api.stop(n)); api.disposed = true; if (root[key] === api) delete root[key]; return reports; }
  };
  root[key] = api;
  return api.status();
})();
