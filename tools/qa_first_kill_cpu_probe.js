// QA only: --inject=tools/qa_first_kill_cpu_probe.js. Install after normal boot.
// Includes child time; selfMs excludes instrumented children, not unwrapped work.
(() => {
  const records = [], stack = [], restore = [];
  const api = window.__qaFirstKill = { records, missing: [], stop() {
    for (const undo of restore.reverse()) undo();
    return records;
  }};
  function wrap(owner, key, label) {
    const original = owner[key];
    if (typeof original !== 'function') { api.missing.push(label); return; }
    const wrapped = function (...args) {
      const start = performance.now(), entry = { label, start, childMs: 0 };
      stack.push(entry);
      try { return original.apply(this, args); }
      finally {
        stack.pop(); const ms = performance.now() - start;
        if (stack.length) stack[stack.length - 1].childMs += ms;
        if (records.length < 20000) records.push({ label, start, ms,
          selfMs: Math.max(0, ms - entry.childMs), parent: stack.at(-1)?.label || null,
          canvas: this?.canvas ? [this.canvas.width, this.canvas.height] : null,
          source: args.at(-1)?.src || null });
      }
    };
    owner[key] = wrapped;
    restore.push(() => { if (owner[key] === wrapped) owner[key] = original; });
  }
  for (const key of ['_fmDeathFx', '_addCorpse', '_addHeadGib', '_addFloorTrace',
    '_worldDropFxTile', '_maskWorldDropBlack', '_worldItemSkin', '_worldDropSkin',
    '_captureEtypeSprite', '_fmDrawSpriteTo']) wrap(window, key, key);
  for (const key of ['getImageData', 'putImageData', 'drawImage', 'clearRect'])
    wrap(CanvasRenderingContext2D.prototype, key, '2d.' + key);
  for (const key of ['texImage2D', 'texSubImage2D'])
    wrap(WebGL2RenderingContext.prototype, key, 'gl.' + key);
  return { installed: true, missing: api.missing };
})();
