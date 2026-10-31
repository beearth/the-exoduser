/* Fullscreen painting plates. LoadingArt owns the separate 35 loading images. */
(function (scope) {
  'use strict';
  const cache = new Map(), backgrounds = new Map(), pictures = new Map();
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
    el.onload = () => { el.dataset.wideReady = String(url !== source && el.getAttribute('src') === url && el.naturalWidth > 0); };
    el.onerror = url === source ? null : () => {
      el.onerror = null;
      el.dataset.wideArt = 'original'; el.dataset.wideReady = 'false';
      el.src = source;
    };
    if (el.getAttribute('src') !== url) el.src = url;
    else if (el.complete && el.naturalWidth) el.onload();
  }
  scope.FullscreenArt = { select, get, rect, background, picture };
  if (scope.addEventListener) {
    scope.addEventListener('resize', () => {
      backgrounds.forEach((source, el) => background(el, source));
      pictures.forEach((source, el) => picture(el, source));
    });
  }
})(globalThis);
