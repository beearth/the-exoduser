// View-only dock state. Project data and editor history never enter this controller.
export class WorkspaceLayout {
  constructor() {
    this.media = matchMedia('(max-width: 1100px)');
    this.desktop = { library: true, inspector: true };
    this.drawer = null;
    this.listeners = [];
    this.shell = document.querySelector('.viewport-shell');
    this.backdrop = document.getElementById('dock-backdrop');
    this.panels = Object.fromEntries(['library', 'inspector'].map(name => [name, document.getElementById(`${name}-panel`)]));
    this.toggles = Object.fromEntries(['library', 'inspector'].map(name => [name, document.getElementById(`toggle-${name}`)]));
    this.resizeObserver = new ResizeObserver(() => this.fitCanvases());
    for (const name of ['library', 'inspector']) this.listen(this.toggles[name], 'click', () => this.toggle(name));
    for (const button of document.querySelectorAll('[data-close-dock]')) this.listen(button, 'click', () => this.close(button.dataset.closeDock));
    this.listen(this.backdrop, 'click', () => this.close(this.drawer));
    this.listen(this.media, 'change', () => { this.drawer = null; this.sync(); });
    this.listen(document.getElementById('resource-tree'), 'click', event => {
      if (this.media.matches && event.target.closest('.resource-row')) this.close('library');
    });
    this.listen(window, 'keydown', event => this.keydown(event));
    this.resume();
  }

  listen(target, type, handler) {
    target.addEventListener(type, handler);
    this.listeners.push({ target, type, handler });
  }

  toggle(name) {
    if (this.media.matches) this.drawer = this.drawer === name ? null : name;
    else this.desktop[name] = !this.desktop[name];
    this.sync();
    if (this.media.matches && this.drawer) this.panels[name].querySelector('input, button, select')?.focus();
  }

  close(name) {
    if (!name) return;
    if (this.media.matches) this.drawer = null;
    else this.desktop[name] = false;
    this.sync();
    this.toggles[name].focus();
  }

  sync() {
    const compact = this.media.matches;
    document.body.classList.toggle('compact-workspace', compact);
    for (const name of ['library', 'inspector']) {
      const open = compact ? this.drawer === name : this.desktop[name];
      document.body.classList.toggle(`${name}-open`, compact && open);
      document.body.classList.toggle(`${name}-collapsed`, !compact && !open);
      this.panels[name].hidden = !open;
      this.toggles[name].setAttribute('aria-expanded', String(open));
      if (compact && open) {
        this.panels[name].setAttribute('role', 'dialog');
        this.panels[name].setAttribute('aria-modal', 'true');
      } else {
        this.panels[name].removeAttribute('role');
        this.panels[name].removeAttribute('aria-modal');
      }
    }
    this.backdrop.hidden = !compact || !this.drawer;
    this.fitCanvases();
  }

  fitCanvases() {
    const availableWidth = Math.max(1, this.shell.clientWidth - 32);
    const availableHeight = Math.max(1, this.shell.clientHeight - 48);
    for (const [id, ratio] of [['map-canvas', 1], ['character-canvas', 960 / 600]]) {
      const canvas = document.getElementById(id);
      if (canvas.hidden) continue;
      const width = Math.min(availableWidth, availableHeight * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${width / ratio}px`;
    }
  }

  keydown(event) {
    if (!this.media.matches || !this.drawer) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); this.close(this.drawer); return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...this.panels[this.drawer].querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
      .filter(node => !node.disabled && node.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  suspend() { this.resizeObserver.disconnect(); }
  resume() { this.resizeObserver.observe(this.shell); this.sync(); }
  dispose() {
    this.suspend();
    for (const { target, type, handler } of this.listeners) target.removeEventListener(type, handler);
    this.listeners.length = 0;
  }
}
