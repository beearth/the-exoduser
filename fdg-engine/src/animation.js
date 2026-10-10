(function (root) {
  'use strict';

  const FDG = root.FDG || (root.FDG = {});
  if (typeof FDG.Node !== 'function') {
    throw new Error('Load FDG core before animation.js');
  }

  function record(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError(label + ' must be an object');
    }
    return value;
  }

  function positiveInteger(value, label) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new RangeError(label + ' must be a positive safe integer');
    }
    return value;
  }

  function finite(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(label + ' must be finite');
    }
    return value;
  }

  function positive(value, label) {
    finite(value, label);
    if (value <= 0) throw new RangeError(label + ' must be positive');
    return value;
  }

  function bool(value, label) {
    if (typeof value !== 'boolean') throw new TypeError(label + ' must be boolean');
    return value;
  }

  function text(value, label, emptyAllowed) {
    if (typeof value !== 'string' || (!emptyAllowed && !value.trim())) {
      throw new TypeError(label + ' must be a string');
    }
    return value;
  }

  function sampleFrame(clip, seconds, loop) {
    finite(seconds, 'seconds');
    if (!loop) {
      if (seconds <= 0) return 0;
      return Math.min(clip.frames - 1, Math.floor(seconds * clip.fps));
    }
    const duration = clip.durationSeconds;
    if (!Number.isFinite(duration)) {
      return seconds < 0 ? clip.frames - 1 : Math.min(clip.frames - 1, Math.floor(seconds * clip.fps));
    }
    let wrapped = seconds % duration;
    if (wrapped < 0) wrapped += duration;
    return Math.min(clip.frames - 1, Math.floor(wrapped * clip.fps));
  }

  class SpriteFrames {
    constructor(options) {
      const o = record(options, 'SpriteFrames options');
      this.imageUrl = text(o.imageUrl === undefined ? '' : o.imageUrl, 'imageUrl', true);
      this.frameWidth = positiveInteger(o.frameWidth, 'frameWidth');
      this.frameHeight = positiveInteger(o.frameHeight, 'frameHeight');
      this.columns = positiveInteger(o.columns, 'columns');
      this.rows = positiveInteger(o.rows, 'rows');
      const capacity = this.columns * this.rows;
      if (!Number.isSafeInteger(capacity)) throw new RangeError('grid capacity exceeds safe integer precision');
      this.frames = positiveInteger(o.frames === undefined ? capacity : o.frames, 'frames');
      if (this.frames > capacity) throw new RangeError('frames exceed grid capacity');
      this.fps = positive(o.fps === undefined ? 24 : o.fps, 'fps');
      this.loop = bool(o.loop === undefined ? true : o.loop, 'loop');
      if (!Number.isSafeInteger(this.frameWidth * this.columns) ||
          !Number.isSafeInteger(this.frameHeight * this.rows)) {
        throw new RangeError('atlas dimensions exceed safe integer precision');
      }
      Object.freeze(this);
    }

    get durationSeconds() { return this.frames / this.fps; }

    sample(seconds) { return sampleFrame(this, seconds, this.loop); }

    frameRect(frame) {
      if (!Number.isSafeInteger(frame) || frame < 0 || frame >= this.frames) {
        throw new RangeError('frame is outside this clip');
      }
      return {
        x: (frame % this.columns) * this.frameWidth,
        y: Math.floor(frame / this.columns) * this.frameHeight,
        width: this.frameWidth,
        height: this.frameHeight
      };
    }

    bindImage(image) {
      record(image, 'image');
      const width = positiveInteger('naturalWidth' in image ? image.naturalWidth : image.width, 'image width');
      const height = positiveInteger('naturalHeight' in image ? image.naturalHeight : image.height, 'image height');
      const actualCapacity = Math.floor(width / this.frameWidth) * Math.floor(height / this.frameHeight);
      if (width < this.frameWidth * this.columns || height < this.frameHeight * this.rows ||
          actualCapacity < this.frames) {
        throw new RangeError('image dimensions do not contain the declared atlas grid');
      }
      return this;
    }

    toJSON() {
      return {
        imageUrl: this.imageUrl, frameWidth: this.frameWidth, frameHeight: this.frameHeight,
        columns: this.columns, rows: this.rows, frames: this.frames, fps: this.fps, loop: this.loop
      };
    }

    static fromJSON(data) { return new SpriteFrames(record(data, 'SpriteFrames JSON')); }
  }

  class Animator {
    constructor() {
      this.clips = new Map();
      this.name = null;
      this.clip = null;
      this.elapsed = 0;
      this._elapsedCompensation = 0;
      this.frame = 0;
      this.finished = false;
      this.playing = false;
      this.paused = false;
      this.loop = false;
    }

    setClip(name, clip) {
      text(name, 'clip name', false);
      if (!(clip instanceof SpriteFrames)) throw new TypeError('clip must be SpriteFrames');
      this.clips.set(name, clip);
      if (this.name === name) this.play(name);
      return this;
    }

    play(name, options) {
      text(name, 'clip name', false);
      const clip = this.clips.get(name);
      if (!clip) throw new RangeError('Unknown clip: ' + name);
      const o = options === undefined ? {} : record(options, 'play options');
      const restart = bool(o.restart === undefined ? true : o.restart, 'restart');
      const loop = bool(o.loop === undefined ? clip.loop : o.loop, 'loop');
      if (restart || this.name !== name || this.clip !== clip) {
        this.elapsed = 0;
        this._elapsedCompensation = 0;
      }
      this.name = name;
      this.clip = clip;
      this.loop = loop;
      this.paused = false;
      this.finished = !loop && this.elapsed >= clip.durationSeconds;
      this.playing = !this.finished;
      this.frame = sampleFrame(clip, this.elapsed, loop);
      return this;
    }

    stop() {
      this.playing = false;
      return this;
    }

    pause() { this.paused = true; return this; }
    resume() { this.paused = false; return this; }

    advance(seconds) {
      finite(seconds, 'seconds');
      if (seconds < 0) throw new RangeError('advance seconds must not be negative');
      if (!this.clip || !this.playing || this.paused) return this;
      // Compensated summation keeps repeated fixed ticks on their time boundary.
      const increment = seconds - this._elapsedCompensation;
      const elapsed = this.elapsed + increment;
      const compensation = (elapsed - this.elapsed) - increment;
      if (!Number.isFinite(elapsed)) throw new RangeError('elapsed time exceeds finite precision');
      this.elapsed = this.loop ? elapsed : Math.min(elapsed, this.clip.durationSeconds);
      this._elapsedCompensation = this.elapsed === elapsed ? compensation : 0;
      this.finished = !this.loop && this.elapsed >= this.clip.durationSeconds;
      if (this.finished) this.playing = false;
      this.frame = sampleFrame(this.clip, this.elapsed, this.loop);
      return this;
    }
  }

  class SpriteNode extends FDG.Node {
    constructor(options) {
      const o = options === undefined ? {} : record(options, 'SpriteNode options');
      super({ id: o.id, name: o.name, type: 'Sprite' });
      this.imageUrl = text(o.imageUrl === undefined ? '' : o.imageUrl, 'imageUrl', true);
      this.width = positive(o.width === undefined ? 1 : o.width, 'width');
      this.height = positive(o.height === undefined ? 1 : o.height, 'height');
      this.pivot = SpriteNode._pivot(o.pivot);
      this.blend = text(o.blend === undefined ? 'source-over' : o.blend, 'blend', false);
      this.animator = new Animator();
      if (o.clip !== undefined && o.clip !== null) {
        const clip = o.clip instanceof SpriteFrames ? o.clip : SpriteFrames.fromJSON(o.clip);
        this.setClip(clip);
        if (o.width === undefined) this.width = clip.frameWidth;
        if (o.height === undefined) this.height = clip.frameHeight;
        if (o.autoplay === false) this.animator.stop();
      }
    }

    static _pivot(value) {
      if (value === undefined) return { x: 0.5, y: 0.5 };
      const p = record(value, 'pivot');
      return { x: finite(p.x, 'pivot.x'), y: finite(p.y, 'pivot.y') };
    }

    get clip() { return this.animator.clip; }
    set clip(value) { this.setClip(value); }

    setClip(clip, name) {
      if (!(clip instanceof SpriteFrames)) throw new TypeError('clip must be SpriteFrames');
      const key = name === undefined ? 'default' : text(name, 'clip name', false);
      this.animator.setClip(key, clip).play(key);
      this.imageUrl = clip.imageUrl;
      return this;
    }

    _physicsProcess(dt) { this.animator.advance(dt); }

    currentFrame() { return this.animator.frame; }

    getDrawState() {
      const clip = this.clip;
      return {
        imageUrl: clip ? clip.imageUrl : this.imageUrl,
        rect: clip ? clip.frameRect(this.currentFrame()) : null,
        width: this.width, height: this.height,
        pivot: { x: this.pivot.x, y: this.pivot.y }, blend: this.blend,
        frame: this.currentFrame()
      };
    }

    _serializeProperties() {
      return Object.assign({}, this.properties, {
        imageUrl: this.clip ? this.clip.imageUrl : this.imageUrl,
        clip: this.clip ? this.clip.toJSON() : null,
        width: this.width, height: this.height,
        pivot: { x: this.pivot.x, y: this.pivot.y }, blend: this.blend,
        animation: {
          name: this.animator.name, elapsed: this.animator.elapsed, playing: this.animator.playing,
          paused: this.animator.paused, loop: this.animator.loop
        }
      });
    }

    _deserializeProperties(data) {
      const p = record(data, 'Sprite properties');
      this.imageUrl = text(p.imageUrl === undefined ? '' : p.imageUrl, 'imageUrl', true);
      this.width = positive(p.width === undefined ? 1 : p.width, 'width');
      this.height = positive(p.height === undefined ? 1 : p.height, 'height');
      this.pivot = SpriteNode._pivot(p.pivot);
      this.blend = text(p.blend === undefined ? 'source-over' : p.blend, 'blend', false);
      this.animator = new Animator();
      const extras = Object.assign({}, p);
      ['imageUrl', 'clip', 'width', 'height', 'pivot', 'blend', 'animation'].forEach(key => delete extras[key]);
      this.properties = extras;
      if (p.clip !== undefined && p.clip !== null) {
        const clip = SpriteFrames.fromJSON(p.clip);
        const a = p.animation === undefined ? {} : record(p.animation, 'animation state');
        const name = a.name === undefined || a.name === null ? 'default' : text(a.name, 'clip name', false);
        this.animator.setClip(name, clip).play(name, { loop: a.loop === undefined ? clip.loop : bool(a.loop, 'loop') });
        this.animator.advance(a.elapsed === undefined ? 0 : a.elapsed);
        if (a.playing === false) this.animator.stop();
        if (a.paused !== undefined) this.animator.paused = bool(a.paused, 'paused');
      }
      return this;
    }
  }

  FDG.SpriteFrames = SpriteFrames;
  FDG.Animator = Animator;
  FDG.SpriteNode = SpriteNode;
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
