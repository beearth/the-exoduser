(function (root) {
  'use strict';
  const FDG = root.FDG;
  if (!FDG || !FDG.Node || !FDG.DruidRootsNode) throw new Error('FDG EXODUSER roots module must load first');
  const states = new WeakMap();
  const STEP = 1 / 60, FRAME_TICKS = 7, END_TICKS = 70;

  // This clock belongs to the independent preview, not EXODUSER's render loop.
  class DruidRootsPreviewDriver extends FDG.Node {
    constructor(options = {}) {
      super(Object.assign({}, options, { type: 'DruidRootsPreviewDriver' }));
      states.set(this, { target: null, ticks: 0, running: false });
    }

    get running() { return states.get(this).running; }

    bind(target) {
      if (!(target instanceof FDG.DruidRootsNode)) throw new TypeError('Preview target must be DruidRootsNode');
      if (!this.tree || this.parent !== target || target.tree !== this.tree) throw new Error('Preview driver must be a child of its current target');
      if (this.tree.fixedStep !== STEP) throw new RangeError('Roots preview requires fixedStep 1/60');
      if (!target.legacyRequest) throw new Error('Roots request must exist before preview binding');
      const state = states.get(this);
      state.target = target; state.ticks = 0; state.running = true;
      this._sync();
      return this;
    }

    stop() {
      const state = states.get(this), wasRunning = state.running;
      state.target = null; state.running = false;
      return wasRunning;
    }

    _sync() {
      const state = states.get(this), ended = state.ticks >= END_TICKS;
      state.target.syncLegacy({ frame: Math.floor(state.ticks / FRAME_TICKS),
        fraction: (state.ticks % FRAME_TICKS) / FRAME_TICKS, maxFrames: 10,
        effectiveAlpha: 1, alive: !ended, drawAllowed: !ended });
      if (ended) this.stop();
    }

    _physicsProcess(dt) {
      const state = states.get(this);
      if (!state.running) return;
      if (!state.target || !state.target.alive || !state.target.drawAllowed || this.parent !== state.target || !this.tree || state.target.tree !== this.tree ||
          this.tree.fixedStep !== STEP || dt !== STEP) { this.stop(); return; }
      state.ticks = Math.min(END_TICKS, state.ticks + 1);
      this._sync();
    }

    _exitTree() { this.stop(); }

    snapshot() {
      const state = states.get(this);
      return Object.freeze({ running: state.running, ticks: state.ticks,
        targetId: state.target ? state.target.id : null, fixedStep: STEP,
        frameTicks: FRAME_TICKS, endTicks: END_TICKS });
    }
  }

  // Bindings are intentionally absent from scene JSON: import is a paused snapshot.
  FDG.DruidRootsPreviewDriver = DruidRootsPreviewDriver;
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
