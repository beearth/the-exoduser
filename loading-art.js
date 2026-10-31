/* Shared loading artwork: preserve the complete source; extensions contain background only. */
(function () {
  const VERSION = '20261031-final35';
  const extensions = new Set(Array.from({ length: 19 }, (_, i) => (i + 1) + '.png').concat([
    'rd1.png','rd2.png','rd4.png','rd5.png','rd6.png','rd7.png','rd8.png','rd9.png',
    'rd10.png','rd11.jpg','rd12.png','rd13.png','rd14.png','rd15.png','rd16.png','rd17.png'
  ]));
  const states = new Map();
  function variant(src) {
    const name = src.split('?')[0].split('/').pop();
    if (!extensions.has(name)) return src;
    const ratio = window.innerWidth / window.innerHeight;
    const size = ratio > 2560 / 1080 ? '32' : ratio > 1920 / 1080 ? '21' : '16';
    return 'img/lording/wide/' + name.replace(/\.(png|jpg)$/, '') + '-' + size + '.webp?v=' + VERSION;
  }
  function set(img, src) {
    if (!img) return;
    const state = { src, ticket: 0 };
    states.set(img, state);
    const parent = img.parentElement;
    parent.classList.remove('loading-expanded');
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
    if (target === state.src) { img.src = state.src; img.parentElement.classList.remove('loading-expanded'); return; }
    const candidate = new Image();
    candidate.onload = () => {
      if (states.get(img) === state && ticket === state.ticket) {
        img.src = target;
        img.parentElement.classList.add('loading-expanded');
      }
    };
    // Keep original plus its dark blurred backdrop if an extension is unavailable.
    candidate.onerror = () => {
      if (states.get(img) === state && ticket === state.ticket) {
        img.src = state.src;
        img.parentElement.classList.remove('loading-expanded');
      }
    };
    candidate.src = target;
  }
  window.addEventListener('resize', () => states.forEach((state, img) => update(img, state)));
  window.LoadingArt = { set, variant };
})();
