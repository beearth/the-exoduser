/* Shared loading artwork: preserve the complete source; extensions contain background only. */
(function () {
  const VERSION = '20261031-wide1';
  const extensions = new Set(['1.png', '2.png', '3.png']);
  const states = new Map();
  function variant(src) {
    const name = src.split('?')[0].split('/').pop();
    if (!extensions.has(name)) return src;
    const ratio = window.innerWidth / window.innerHeight;
    const size = ratio > 2.5 ? '32' : ratio > 1.8 ? '21' : null;
    return size ? 'img/lording/wide/' + name.replace('.png', '') + '-' + size + '.webp?v=' + VERSION : src;
  }
  function set(img, src) {
    if (!img) return;
    const state = { src, ticket: 0 };
    states.set(img, state);
    const parent = img.parentElement;
    let backdrop = parent.querySelector('.loading-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('img');
      backdrop.className = 'loading-backdrop';
      backdrop.alt = '';
      backdrop.setAttribute('aria-hidden', 'true');
      parent.insertBefore(backdrop, img);
    }
    backdrop.src = src;
    img.src = src;
    update(img, state);
  }
  function update(img, state) {
    const ticket = ++state.ticket;
    const target = variant(state.src);
    if (target === state.src) { img.src = state.src; return; }
    const candidate = new Image();
    candidate.onload = () => {
      if (states.get(img) === state && ticket === state.ticket) img.src = target;
    };
    // Keep original plus its dark blurred backdrop if an extension is unavailable.
    candidate.onerror = () => {
      if (states.get(img) === state && ticket === state.ticket) img.src = state.src;
    };
    candidate.src = target;
  }
  window.addEventListener('resize', () => states.forEach((state, img) => update(img, state)));
  window.LoadingArt = { set, variant };
})();
