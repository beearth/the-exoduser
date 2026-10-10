(function (root) {
  'use strict';
  const FDG = root.FDG || (root.FDG = {});
  if (!FDG.SpriteNode || !FDG.SpriteFrames) throw new Error('FDG animation must be loaded before exoduser.js');

  const ROOTS_CLIP = new FDG.SpriteFrames({
    imageUrl: '../assets/vfx/boss/druid_roots_48_20261010.png',
    frameWidth: 448, frameHeight: 448, columns: 8, rows: 6,
    frames: 48, fps: 288 / 7, loop: false
  });

  function record(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
      throw new TypeError(label + ' must be a plain object');
    }
    return value;
  }
  function finite(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(label + ' must be finite');
    return value;
  }
  function acceptedRequest(args) {
    if (!Array.isArray(args) || args.length !== 7 || args[0] !== 'druid_roots') throw new TypeError('Expected the seven-argument druid_roots request');
    const copy = args.slice();
    finite(copy[1], 'x'); finite(copy[2], 'y'); finite(copy[3], 'scale'); finite(copy[5], 'angle');
    if (copy[3] <= 0 || !Number.isFinite(256 * copy[3])) throw new RangeError('scale must give a finite positive display size');
    if (copy[4] !== 7 || copy[6] !== false) throw new TypeError('Druid roots requires frameTime 7 and isSkill false');
    return Object.freeze(copy);
  }
  function legacyState(value) {
    const s = record(value, 'legacy snapshot');
    if (!Number.isSafeInteger(s.frame) || s.frame < 0 || s.frame > 10 || s.maxFrames !== 10) throw new RangeError('Expected legacy frame 0..10 and maxFrames 10');
    finite(s.fraction, 'fraction'); finite(s.effectiveAlpha, 'effectiveAlpha');
    if (s.fraction < 0 || s.fraction >= 1 || (s.frame === 10 && s.fraction !== 0)) throw new RangeError('fraction must be in [0,1), with zero at the end');
    if (s.effectiveAlpha < 0 || s.effectiveAlpha > 1) throw new RangeError('effectiveAlpha must be in [0,1]');
    if (typeof s.alive !== 'boolean' || typeof s.drawAllowed !== 'boolean') throw new TypeError('alive and drawAllowed must be boolean');
    return Object.freeze({ frame: s.frame, fraction: s.fraction, maxFrames: 10,
      effectiveAlpha: s.effectiveAlpha, alive: s.alive, drawAllowed: s.drawAllowed });
  }

  // The host owns legacy advancement, expiration, culling and its draw budget.
  // Reference clip seconds are only a sampling unit; SceneTree time never advances this effect.
  class DruidRootsNode extends FDG.SpriteNode {
    constructor(options = {}) {
      const o = record(options, 'DruidRootsNode options');
      super({ id: o.id, name: o.name, clip: ROOTS_CLIP, autoplay: false,
        width: 1, height: 1, pivot: { x: 0.5, y: 0.5 }, blend: 'lighter' });
      this.type = 'DruidRoots';
      this._legacyRequest = null;
      this._legacySnapshot = null;
    }

    request(id, x, y, scale, frameTime, angle, isSkill) {
      const request = acceptedRequest([id, x, y, scale, frameTime, angle, isSkill]);
      this._legacyRequest = request;
      this._legacySnapshot = legacyState({ frame: 0, fraction: 0, maxFrames: 10,
        effectiveAlpha: 1, alive: true, drawAllowed: false });
      this.position.x = x; this.position.y = y; this.position.z = 0;
      this.rotation = angle;
      this.width = this.height = 256 * scale;
      this.properties.opacity = 1;
      return this;
    }

    syncLegacy(snapshot) {
      if (!this._legacyRequest) throw new Error('Accept a druid_roots request before its snapshot');
      const next = legacyState(snapshot);
      this._legacySnapshot = next;
      this.properties.opacity = next.effectiveAlpha;
      return this;
    }

    get legacyRequest() { return this._legacyRequest; }
    get legacySnapshot() { return this._legacySnapshot; }
    get legacyProgress() { return this._legacySnapshot ? Math.min(1, (this._legacySnapshot.frame + this._legacySnapshot.fraction) / 10) : 0; }
    get alive() { return !!(this._legacySnapshot && this._legacySnapshot.alive); }
    get drawAllowed() { return !!(this._legacySnapshot && this._legacySnapshot.drawAllowed); }

    currentFrame() { return ROOTS_CLIP.sample(this.legacyProgress * ROOTS_CLIP.durationSeconds); }
    _physicsProcess() {}
    _process() {}

    getDrawState() {
      const frame = this.currentFrame();
      const active = !!this._legacyRequest && this.alive;
      const rect = active ? ROOTS_CLIP.frameRect(frame) : null;
      return { imageUrl: active ? ROOTS_CLIP.imageUrl : '',
        rect: rect ? { x: rect.x + 1, y: rect.y + 1, width: rect.width - 2, height: rect.height - 2 } : null,
        width: this.width, height: this.height, pivot: { x: 0.5, y: 0.5 }, blend: 'lighter', frame,
        drawAllowed: active && this.drawAllowed };
    }

    _serializeProperties() {
      return { request: this._legacyRequest, snapshot: this._legacySnapshot,
        user: FDG.Node.prototype._serializeProperties.call(this) };
    }
    _deserializeProperties(value) {
      const data = record(value, 'Druid roots properties');
      const request = data.request === null ? null : acceptedRequest(data.request);
      const snapshot = data.snapshot === null ? null : legacyState(data.snapshot);
      if (!!request !== !!snapshot) throw new TypeError('Request and snapshot must be restored together');
      // Core has already restored common transforms/visibility; do not replay request().
      FDG.Node.prototype._deserializeProperties.call(this, record(data.user, 'Druid roots user properties'));
      this._legacyRequest = request; this._legacySnapshot = snapshot;
      this.width = this.height = request ? 256 * request[3] : 1;
      if (snapshot) this.properties.opacity = snapshot.effectiveAlpha;
      return this;
    }
  }

  FDG.DruidRootsNode = DruidRootsNode;
  FDG.ExoduserFactories = Object.freeze({
    DruidRoots: payload => new DruidRootsNode({ id: payload.id, name: payload.name })
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
