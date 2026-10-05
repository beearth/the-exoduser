/* Existing EXODUSER warrior for the image-scene editor. Coordinates are world pixels. */
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('workspace') === 'tiles') return;

  const DIRECTIONS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
  const CELL = 48, BODY_HEIGHT = 80, SOURCE_BODY_HEIGHT = 29, SOURCE_FOOT = 43;
  const WALK_MS = 110, IDLE_MS = 850, MOVE_EPSILON = .0001;
  // Idle-cell body centers (alpha > 100). Keep them fixed throughout each walk cycle:
  // sword/arm motion changes the full-frame bounds and must not recenter or rescale the body.
  const CENTERS = [22.5, 22.5, 22, 25.5, 25, 23.5, 23.5, 21.5];
  const SCALE = BODY_HEIGHT / SOURCE_BODY_HEIGHT;
  const scriptSrc = document.currentScript && document.currentScript.src;
  const sourceRoot = scriptSrc ? new URL('../img/exoduser_warrior/', scriptSrc).href : 'img/exoduser_warrior/';
  const sprites = new Map(), errors = [];
  let heading = 'south', moving = false, frame = 0, revision = 0, seenRevision = -1;

  function fail(direction, reason) {
    errors.push(direction + ': ' + reason);
    revision++;
  }

  function tick(time, dx, dy) {
    const previousHeading = heading, previousFrame = frame, previousMoving = moving;
    dx = Number.isFinite(dx) ? dx : 0;
    dy = Number.isFinite(dy) ? dy : 0;
    moving = Math.hypot(dx, dy) > MOVE_EPSILON;
    if (moving) heading = DIRECTIONS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
    const clock = Number.isFinite(time) ? Math.max(0, time) : 0;
    frame = moving ? 2 + Math.floor(clock / WALK_MS) % 8 : Math.floor(clock / IDLE_MS) % 2;
    const changed = previousHeading !== heading || previousFrame !== frame || previousMoving !== moving || seenRevision !== revision;
    seenRevision = revision;
    return changed;
  }

  function availableSprite() {
    const requested = sprites.get(heading);
    if (requested && requested.ready) return requested;
    const south = sprites.get('south');
    if (south && south.ready) return south;
    for (const sprite of sprites.values()) if (sprite.ready) return sprite;
    return null;
  }

  function draw(ctx, player) {
    if (!ctx || !player || !Number.isFinite(player.x) || !Number.isFinite(player.y)) return false;
    ctx.save();
    try {
      ctx.fillStyle = 'rgba(7,12,9,.67)';
      ctx.beginPath(); ctx.ellipse(player.x, player.y, 25, 11, 0, 0, Math.PI * 2); ctx.fill();
      const sprite = availableSprite();
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite.image, frame * CELL, 0, CELL, CELL,
          player.x - sprite.center * SCALE, player.y - SOURCE_FOOT * SCALE, CELL * SCALE, CELL * SCALE);
      } else {
        // Local loading/error marker, grounded at the same footline; no new character asset.
        ctx.fillStyle = '#bdb5a5';
        ctx.beginPath(); ctx.arc(player.x, player.y - 70, 9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(player.x - 12, player.y - 57); ctx.lineTo(player.x + 12, player.y - 57);
        ctx.lineTo(player.x + 17, player.y - 20); ctx.lineTo(player.x + 8, player.y - 20);
        ctx.lineTo(player.x + 8, player.y); ctx.lineTo(player.x + 1, player.y);
        ctx.lineTo(player.x, player.y - 22); ctx.lineTo(player.x - 1, player.y);
        ctx.lineTo(player.x - 8, player.y); ctx.lineTo(player.x - 8, player.y - 20);
        ctx.lineTo(player.x - 17, player.y - 20); ctx.closePath(); ctx.fill();
      }
      return !!sprite;
    } finally {
      ctx.restore();
    }
  }

  function snapshot() {
    return Object.freeze({
      loaded: sprites.size === DIRECTIONS.length && [...sprites.values()].every(sprite => sprite.ready),
      moving, heading, frame, errors: Object.freeze(errors.slice())
    });
  }

  window.MapSceneActor = Object.freeze({ tick, draw, snapshot });
  DIRECTIONS.forEach((direction, index) => {
    const image = new Image(), sprite = { image, center: CENTERS[index], ready: false };
    sprites.set(direction, sprite);
    image.onload = () => {
      // Existing files are 1008×48; only the first ten 48px cells are used here.
      if (image.naturalWidth < CELL * 10 || image.naturalHeight < CELL) return fail(direction, '48px idle/walk cells unavailable');
      sprite.ready = true; revision++;
    };
    image.onerror = () => fail(direction, 'image load failed');
    image.src = sourceRoot + direction + '.png';
  });
})();
