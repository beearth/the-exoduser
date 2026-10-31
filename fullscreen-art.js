/* Fullscreen painting plates. LoadingArt owns the separate 35 loading images. */
(function (scope) {
  'use strict';
  const cache = new Map(), backgrounds = new Map(), pictures = new Map(), videos = new Map();
  const layouts = new Map(), atmospheres = new Map(), fogTextures = new Map();
  const reducedMotion = scope.matchMedia?.('(prefers-reduced-motion: reduce)');
  function readStoredMotion() {
    try { return JSON.parse(scope.localStorage?.getItem('hellcave_settings') || 'null')?.opt?.atmos !== 0; }
    catch (_) { return true; }
  }
  let storedMotionAllowed = readStoredMotion(), motionPolicy = () => storedMotionAllowed;
  let atmosphereFrame = 0, lastAtmosphereTime = -Infinity, visibilityDirty = true;
  const clean = source => String(source || '').split(/[?#]/)[0].replace(/^\.\//, '');
  function select(source, width = scope.innerWidth, height = scope.innerHeight) {
    const entry = scope.EXODUSER_FULLSCREEN_ART?.[clean(source)];
    const ratio = width / height;
    if (!entry || ratio <= 2) return source;
    return (ratio <= 64 / 27 + .001 ? entry.wide21 : entry.wide32) || source;
  }
  function get(source, width, height) {
    const url = select(source, width, height);
    if (cache.has(url)) return cache.get(url);
    const img = new Image();
    cache.set(url, img);
    img.onerror = url === source ? null : function () {
      img.onerror = null; img.src = source;
    };
    img.src = url;
    return img;
  }
  function rect(iw, ih, width, height, focus = .5) {
    const scale = Math.max(width / iw, height / ih);
    const dw = iw * scale, dh = ih * scale;
    return [(width - dw) * focus, (height - dh) / 2, dw, dh];
  }
  function setManifest(manifest) {
    for (const entry of manifest.assets || []) layouts.set(clean(entry.source), entry);
    syncVideos();
  }
  // Use the authored insertion coordinate, including odd-width 21:9 output rounding.
  function originalRect(source, width, height, plateWidth, plateHeight) {
    const layout = layouts.get(clean(source));
    const output = layout?.outputs.find(item => clean(item.path) === clean(select(source, width, height)));
    const original = layout?.original || scope.EXODUSER_FULLSCREEN_META?.[clean(source)];
    if (!original || !plateWidth || !plateHeight) return null;
    const scale = Math.max(width / plateWidth, height / plateHeight);
    const centerX = output?.centerX ?? (plateWidth - original.width) / 2;
    return [(width - plateWidth * scale) / 2 + centerX * scale,
      (height - plateHeight * scale) / 2, original.width * scale, original.height * scale];
  }
  function syncVideos() {
    videos.forEach(({ plate, source: fixedSource }, el) => {
      const source = pictures.get(plate) || fixedSource;
      const parent = plate.parentElement;
      const width = parent?.clientWidth || scope.innerWidth, height = parent?.clientHeight || scope.innerHeight;
      const ready = !!source && (!fixedSource || clean(source) === clean(fixedSource)) &&
        width / height > 2 && plate.dataset.wideReady === 'true';
      const box = ready ? originalRect(source, width, height, plate.naturalWidth, plate.naturalHeight) : null;
      el.dataset.wideVideo = String(!!box);
      if (box) ['x', 'y', 'w', 'h'].forEach((axis, index) => el.style.setProperty('--wide-video-' + axis, box[index] + 'px'));
    });
  }
  function video(el, plate, options = {}) {
    if (!el || !plate) return;
    videos.set(el, { plate, source: options.source });
    syncVideos();
  }
  function background(el, source) {
    if (!el || !source) return;
    backgrounds.set(el, source);
    const url = select(source), ticket = {};
    el._fullscreenArtTicket = ticket;
    const img = get(source);
    const ready = () => {
      if (el._fullscreenArtTicket !== ticket || !img.naturalWidth) return;
      el.style.backgroundImage = 'url(' + JSON.stringify(img.src) + ')';
      el.dataset.wideArt = url === source ? 'original' : 'outpaint';
    };
    if (img.complete && img.naturalWidth) ready();
    else if (img.addEventListener) img.addEventListener('load', ready, { once: true });
    else img.onload = ready;
  }
  function picture(el, source) {
    if (!el || !source) return;
    pictures.set(el, source);
    const url = select(source);
    el.dataset.wideArt = url === source ? 'original' : 'outpaint';
    el.dataset.wideReady = 'false';
    el.onload = () => {
      el.dataset.wideReady = String(url !== source && el.getAttribute('src') === url && el.naturalWidth > 0);
      syncVideos();
    };
    el.onerror = url === source ? null : () => {
      el.onerror = null;
      el.dataset.wideArt = 'original'; el.dataset.wideReady = 'false';
      el.src = source;
      syncVideos();
    };
    if (el.getAttribute('src') !== url) el.src = url;
    else if (el.complete && el.naturalWidth) el.onload();
    syncVideos();
  }
  function motionAllowed() {
    return !scope.document?.hidden && !reducedMotion?.matches && motionPolicy();
  }
  function setMotionPolicy(policy) {
    motionPolicy = typeof policy === 'function' ? policy : () => !!policy;
    wakeAtmosphere();
  }
  function fogTexture(color) {
    if (fogTextures.has(color)) return fogTextures.get(color);
    if (!scope.document?.createElement) return null;
    const canvas = scope.document.createElement('canvas');canvas.width = canvas.height = 256;
    const cx = canvas.getContext('2d');if (!cx) return null;
    const gradient = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(' + color + ',1)');gradient.addColorStop(1, 'rgba(' + color + ',0)');
    cx.fillStyle = gradient;cx.fillRect(0, 0, 256, 256);fogTextures.set(color, canvas);
    return canvas;
  }
  // Time-based, renderer-independent atmosphere. It never moves or distorts the painting.
  function drawAtmosphere(cx, width, height, timeMs, tone = 'ash') {
    if (!motionAllowed() || !(width > 0 && height > 0)) return;
    const time = timeMs / 1000;
    const fog = tone === 'crypt' ? '104,117,128' : tone === 'blood' || tone === 'gate' ? '112,65,58' : '125,117,108';
    const texture = fogTexture(fog);
    cx.save();
    for (let layer = 0; layer < 3; layer++) {
      const x = width * (.12 + layer * .38 + Math.sin(time / (39 + layer * 11) + layer) * .08);
      const y = height * (layer === 1 ? .19 : .85);
      const radius = width * .3;
      const alpha = .038 + .008 * Math.sin(time / 7 + layer);
      if (texture) {
        cx.globalAlpha = alpha;cx.drawImage(texture, x - radius, y - height * .24, radius * 2, height * .48);
      } else {
        const gradient = cx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(' + fog + ',' + alpha + ')');gradient.addColorStop(1, 'rgba(' + fog + ',0)');
        cx.fillStyle = gradient;cx.beginPath();cx.ellipse(x, y, radius, height * .24, 0, 0, Math.PI * 2);cx.fill();
      }
    }
    cx.globalAlpha = 1;
    const count = Math.min(56, Math.max(18, Math.round(width / height * 13)));
    for (let index = 0; index < count; index++) {
      const seed = (index * .61803398875) % 1;
      const x = ((seed + time * (.0008 + index % 3 * .0003)) % 1) * width;
      const y = ((index * .381966 + .91 - time * (.004 + index % 4 * .001)) % 1 + 1) % 1 * height;
      cx.fillStyle = 'rgba(' + (tone === 'crypt' ? '154,163,167' : '168,113,83') + ',' +
        (.07 + .065 * (.5 + .5 * Math.sin(time * .3 + index))) + ')';
      cx.beginPath();cx.arc(x, y, height / 1080 * (.65 + index % 3 * .3), 0, Math.PI * 2);cx.fill();
    }
    cx.restore();
  }
  function visible(host) {
    if (!host.isConnected || !host.getClientRects().length) return false;
    if (host.checkVisibility) return host.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    for (let el = host; el; el = el.parentElement) {
      const style = scope.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    }
    return true;
  }
  function tickAtmosphere(now) {
    atmosphereFrame = 0;
    if (now - lastAtmosphereTime < 50) { atmosphereFrame = scope.requestAnimationFrame(tickAtmosphere);return; }
    let active = false;
    const allowed = motionAllowed();
    atmospheres.forEach((record, host) => {
      const { canvas, cx, tone, isActive } = record;
      if (visibilityDirty) record.visible = visible(host) && (!isActive || isActive());
      const show = allowed && record.visible;
      if (canvas.hidden === show) canvas.hidden = !show;
      if (!show) return;
      active = true;
      if (visibilityDirty) {
        const box = host.getBoundingClientRect();
        const width = Math.max(1, Math.round(Math.min(960, box.width))), height = Math.max(1, Math.round(width * box.height / box.width));
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width;canvas.height = height; }
      }
      const width = canvas.width, height = canvas.height;
      cx.clearRect(0, 0, width, height);
      drawAtmosphere(cx, width, height, now, tone);
    });
    visibilityDirty = false;lastAtmosphereTime = now;
    if (active) atmosphereFrame = scope.requestAnimationFrame(tickAtmosphere);
  }
  function wakeAtmosphere() {
    visibilityDirty = true;
    if (atmospheres.size && !atmosphereFrame && scope.requestAnimationFrame) atmosphereFrame = scope.requestAnimationFrame(tickAtmosphere);
  }
  function atmosphere(host, options = {}) {
    if (!host || atmospheres.has(host) || !scope.document?.createElement) return;
    const canvas = scope.document.createElement('canvas'), cx = canvas.getContext('2d');
    if (!cx) return;
    canvas.className = 'fullscreen-atmosphere';canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    atmospheres.set(host, { canvas, cx, tone: options.tone || 'ash', isActive: options.isActive, visible: false });
    // A class change may be sampled at opacity 0. Recheck once the CSS fade has
    // finished, including fades on a parent, without polling hidden screens.
    for (let parent = host; parent; parent = parent.parentElement) {
      for (const event of ['transitionend', 'transitioncancel', 'animationend', 'animationcancel']) {
        parent.addEventListener?.(event, wakeAtmosphere);
      }
    }
    // Hidden screens have no animation loop; their existing display/class changes wake it.
    if (scope.MutationObserver) {
      const observer = new scope.MutationObserver(wakeAtmosphere);
      for (let parent = host; parent; parent = parent.parentElement) observer.observe(parent, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    }
    if (scope.ResizeObserver) new scope.ResizeObserver(wakeAtmosphere).observe(host);
    wakeAtmosphere();
  }
  scope.FullscreenArt = { select, get, rect, background, picture, originalRect, setManifest, video,
    drawAtmosphere, atmosphere, motionAllowed, setMotionPolicy, refreshAtmosphere: wakeAtmosphere };
  if (scope.fetch) scope.FullscreenArt.ready = scope.fetch('assets/fullscreen-wide/20261031/manifest.json')
    .then(response => response.ok ? response.json() : null).then(manifest => { if (manifest) setManifest(manifest); })
    .catch(() => {}); // The already-loaded original dimensions remain a safe centered fallback.
  reducedMotion?.addEventListener?.('change', wakeAtmosphere);
  scope.document?.addEventListener?.('visibilitychange', wakeAtmosphere);
  if (scope.addEventListener) {
    scope.addEventListener('storage', event => {
      if (event.key === 'hellcave_settings' || event.key === null) {
        storedMotionAllowed = readStoredMotion();wakeAtmosphere();
      }
    });
    scope.addEventListener('resize', () => {
      backgrounds.forEach((source, el) => background(el, source));
      pictures.forEach((source, el) => picture(el, source));
      syncVideos();wakeAtmosphere();
    });
  }
})(globalThis);
