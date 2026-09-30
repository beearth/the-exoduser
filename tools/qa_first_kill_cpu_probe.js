// QA only: --inject=tools/qa_first_kill_cpu_probe.js. Install after normal boot.
// Includes child time; selfMs excludes instrumented children, not unwrapped work.
(() => {
  // Reinstallation must not nest diagnostic wrappers.
  window.__qaFirstKill?.stop?.();
  const LIMIT = 20000, SLOW_2D_MS = 2;
  const buffer = [], stack = [], restore = [];
  let next = 0, targetDepth = 0;
  const ordered = () => buffer.length < LIMIT || next === 0
    ? buffer.slice() : buffer.slice(next).concat(buffer.slice(0, next));
  const api = window.__qaFirstKill = {
    get records() { return ordered(); },
    missing: [], startedAt: performance.now(), endedAt: null,
    totalCalls: 0, skippedFast2d: 0, droppedCount: 0, truncated: false,
    firstDeathCandidateAt: null, stopped: false,
    stop() {
      if (!api.stopped) {
        for (const undo of restore.splice(0).reverse()) undo();
        api.stopped = true; api.endedAt = performance.now();
      }
      return ordered();
    }
  };
  function wrap(owner, key, label, target = false) {
    const original = owner?.[key];
    if (typeof original !== 'function') { api.missing.push(label); return; }
    const wrapped = function (...args) {
      const start = performance.now(), entry = { label, start, childMs: 0 };
      if (target) targetDepth++;
      if (api.firstDeathCandidateAt === null && ['_fmDeathFx', '_addCorpse', '_addHeadGib'].includes(label))
        api.firstDeathCandidateAt = start; // A call candidate, not proof of a kill/reward.
      stack.push(entry);
      try { return original.apply(this, args); }
      finally {
        stack.pop(); const ms = performance.now() - start;
        if (stack.length) stack[stack.length - 1].childMs += ms;
        api.totalCalls++;
        // Routine canvas rendering must not consume the entire buffer before a kill.
        // Keep target descendants, slow 2D calls, and every GL upload (including next draw).
        if (label.startsWith('2d.') && !targetDepth && ms < SLOW_2D_MS) api.skippedFast2d++;
        else {
          const source = label === '2d.drawImage' ? args[0] : label.startsWith('gl.') ? args.at(-1) : null;
          const record = { label, start, ms,
            selfMs: Math.max(0, ms - entry.childMs), parent: stack.at(-1)?.label || null,
            canvas: this?.canvas ? [this.canvas.width, this.canvas.height] : null,
            source: source?.currentSrc || source?.src || null };
          if (buffer.length < LIMIT) buffer.push(record);
          else { buffer[next] = record; api.droppedCount++; api.truncated = true; }
          next = (next + 1) % LIMIT;
        }
        if (target) targetDepth--;
      }
    };
    owner[key] = wrapped;
    restore.push(() => { if (owner[key] === wrapped) owner[key] = original; });
  }
  for (const key of ['_fmDeathFx', '_addCorpse', '_addHeadGib', '_addFloorTrace',
    '_worldDropFxTile', '_maskWorldDropBlack', '_worldItemSkin', '_worldDropSkin',
    '_captureEtypeSprite', '_fmDrawSpriteTo']) wrap(window, key, key, true);
  for (const key of ['getImageData', 'putImageData', 'drawImage', 'clearRect'])
    wrap(globalThis.CanvasRenderingContext2D?.prototype, key, '2d.' + key);
  for (const key of ['texImage2D', 'texSubImage2D'])
    wrap(globalThis.WebGL2RenderingContext?.prototype, key, 'gl.' + key);
  return { installed: true, missing: api.missing, maxRecords: LIMIT, slow2dMs: SLOW_2D_MS };
})();
