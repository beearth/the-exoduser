/* Shared panel composition. Move existing controls; keep their IDs and listeners. */
(() => {
  'use strict';
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };
  const labels = [];
  const label = (node, ko, en) => { labels.push({node, ko, en}); return node; };
  function translate() {
    const korean = document.getElementById('optLang')?.value === 'ko';
    labels.forEach(({node, ko, en}) => {
      if (!node.children.length) node.textContent = korean ? ko : en;
    });
  }
  function tabBar(entries, activate, prefix) {
    const nav = el('div', 'ui-section-tabs');
    nav.setAttribute('role', 'tablist');
    entries.forEach(([key, ko, en], i) => {
      const button = label(el('button', 'ui-section-tab'), ko, en);
      button.type = 'button'; button.id = prefix + '-tab-' + key;
      button.dataset.page = key; button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', prefix + '-page-' + key);
      button.addEventListener('click', () => activate(key));
      button.addEventListener('keydown', event => {
        let next = i;
        if (event.key === 'ArrowRight') next = (i + 1) % entries.length;
        else if (event.key === 'ArrowLeft') next = (i + entries.length - 1) % entries.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = entries.length - 1;
        else return;
        event.preventDefault(); event.stopPropagation();
        nav.children[next].click(); nav.children[next].focus();
      });
      nav.append(button);
    });
    return nav;
  }
  function selected(nav, key) {
    for (const button of nav.children) {
      const active = button.dataset.page === key;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    }
  }
  function describeSettingsControls(root) {
    root.querySelectorAll('.set-range-row input[type="range"],.set-range-row select').forEach(control => {
      const row = control.closest('.set-range-row');
      const name = row.querySelector('.set-name');
      if (!control.id || !name || name.children.length) return;
      if (!name.id) name.id = 'settings-label-' + control.id;
      if (!control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
        control.setAttribute('aria-labelledby', name.id);
      }
      const value = row.querySelector('.set-range-val,#cursorSizeVal');
      if (value && !value.children.length && !control.hasAttribute('aria-describedby')) {
        if (!value.id) value.id = 'settings-value-' + control.id;
        control.setAttribute('aria-describedby', value.id);
      }
    });
    const message = root.querySelector('#saveMsg');
    if (message) {
      message.setAttribute('role', 'status');
      message.setAttribute('aria-live', 'polite');
      message.setAttribute('aria-atomic', 'true');
    }
    root.querySelector('#settingsPresetLabel')?.classList.add('set-label');
  }
  function settings() {
    const root = document.getElementById('settings');
    const box = root?.querySelector('.pbox');
    const old = root?.querySelector('.frame-inner-panel-split');
    if (!old || !box) return;
    const entries = [['game','게임','Game'],['display','화면','Display'],['audio','사운드','Audio'],['controls','조작','Controls']];
    const pages = new Map();
    const content = el('div', 'settings-pages frame-inner-panel');
    for (const [key, ko, en] of entries) {
      const page = el('section', 'settings-page');
      page.id = 'settings-page-' + key;
      page.setAttribute('role','tabpanel');
      page.setAttribute('aria-labelledby','settings-tab-' + key);
      const heading = el('h3', 'ui-section-heading');
      if (key === 'game') {
        const title = label(el('span'), '게임 · 시스템', 'Game · System');
        title.id = 'settings-game-heading-text';
        heading.setAttribute('aria-labelledby', title.id);
        heading.append(title);
      }
      else label(heading, ko, en);
      page.append(heading); pages.set(key, page); content.append(page);
    }
    const nav = tabBar(entries, key => {
      selected(nav, key);
      pages.forEach((page, name) => { page.hidden = name !== key; });
      content.scrollTop = 0;
    }, 'settings');
    const systemGroup = el('div', 'settings-system-group');
    systemGroup.append(label(el('h4', 'settings-group-heading'), '시스템', 'System'));
    pages.get('game').append(systemGroup);
    const displayTuning = el('div', 'set-section');
    displayTuning.append(label(el('div', 'set-label'), '화면 효과', 'Screen effects'));
    pages.get('display').append(displayTuning);
    const moveRow = (id, key, target = pages.get(key)) => {
      const node = document.getElementById(id);
      const row = node?.closest('.set-range-row');
      if (row) target.append(row);
    };
    moveRow('optLang','game',systemGroup);
    ['optShake','optParts','optFps','optResScale','optIrisSz','optBrightness','optIrisGlow'].forEach(id => moveRow(id,'display',displayTuning));
    ['optSfx','optBgm','optBgmTrack'].forEach(id => moveRow(id,'audio'));
    // Classify whole existing sections by a stable control ID, not translated text.
    const routes = [['cursorGrid','controls'],['keyBindList','controls'],['optScreenSection','display'],['charSelectGrid','game'],['gfxPresetRow','display'],['diagGpu','display'],['saveP1','game'],['toLobbyBtn2','game'],['resetBtn','game'],['quitBtn','game']];
    routes.forEach(([id,key]) => {
      const node = document.getElementById(id);
      const section = node?.classList.contains('set-section') ? node : node?.closest('.set-section');
      if (section) (['charSelectGrid','saveP1','toLobbyBtn2','resetBtn','quitBtn'].includes(id) ? systemGroup : pages.get(key)).append(section);
    });
    // Includes future controls added to the original game section.
    const gameSection = document.getElementById('optDiff')?.closest('.set-section');
    old.querySelectorAll('.set-section').forEach(section => pages.get('game').append(section));
    if (gameSection) {
      systemGroup.id = 'settings-system-options';
      gameSection.id = 'settings-game-options';
      const pageHeading = pages.get('game').querySelector('.ui-section-heading');
      const jumpNav = el('span', 'settings-jump-nav');
      const jumpTo = (section, heading) => {
        const top = section.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop - pageHeading.getBoundingClientRect().height - 12;
        content.scrollTop = Math.max(0, Math.round(top));
        heading.focus({preventScroll:true});
      };
      [[systemGroup, systemGroup.querySelector('h4'), '시스템', 'System'],
       [gameSection, gameSection.querySelector('.set-label'), '게임 설정', 'Game options']].forEach(([section, heading, ko, en]) => {
        if (!heading) return;
        heading.tabIndex = -1;
        if (section === gameSection) {
          heading.setAttribute('role', 'heading');
          heading.setAttribute('aria-level', '4');
        }
        const button = label(el('button', 'settings-jump-button'), ko, en);
        button.type = 'button';
        button.setAttribute('aria-controls', section.id);
        button.addEventListener('click', () => jumpTo(section, heading));
        jumpNav.append(button);
      });
      pageHeading.append(jumpNav);
    }
    box.insertBefore(nav, old); box.insertBefore(content, old); old.remove();
    const footer = document.getElementById('setClose')?.parentElement;
    if (footer) {
      footer.classList.add('settings-footer');
      const saved = document.getElementById('settingsAutoSaveLabel');
      if (saved) footer.prepend(saved);
    }
    describeSettingsControls(root);
    root.classList.add('ui-composed');
    new MutationObserver(changes => {
      if (root.classList.contains('on') && changes.some(change => !/(^|\s)on(\s|$)/.test(change.oldValue || ''))) {
        content.scrollTop = 0;
      }
    }).observe(root, {attributes:true, attributeOldValue:true, attributeFilter:['class']});
    nav.children[0].click();
  }
  function inventory() {
    const root = document.getElementById('invPanel');
    const body = root?.querySelector('.inv-wrap');
    if (!root || !body) return;
    const equip = root.querySelector('.inv-equip');
    if (equip) equip.id = 'inventory-page-equipment';
    const entries = [['equipment','장비','Equipment'],['ossuary','유골함','Ossuary'],['crystals','보석','Gems'],['storage','보관함','Storage']];
    const targets = {equipment:equip,ossuary:document.getElementById('invOssuaryPanel'),crystals:document.getElementById('invCrystalsPanel'),storage:document.getElementById('invStorageCol')};
    const nav = tabBar(entries, key => {
      // Initial composition precedes player creation; only refresh on later switches.
      const changed = root.dataset.inventoryPage !== undefined && root.dataset.inventoryPage !== key;
      root.dataset.inventoryPage = key; selected(nav,key);
      const deposit = document.getElementById('invStBagSection');
      const depositParent = document.getElementById(key === 'storage' ? 'invCenter' : 'invStorageCol');
      if(deposit && depositParent && deposit.parentElement !== depositParent) depositParent.append(deposit);
      if(changed && typeof _invChangeCategory === 'function') _invChangeCategory();
      Object.entries(targets).forEach(([name,node]) => { if(node) node.setAttribute('aria-hidden', String(name !== key)); });
    }, 'inventory');
    for(const button of nav.children) {
      const target = targets[button.dataset.page];
      if(target) button.setAttribute('aria-controls',target.id);
    }
    body.before(nav);
    const filters = document.getElementById('invFilters');
    if(filters) {
      const details = el('details','inventory-filters');
      details.append(label(el('summary'), '아이템 필터', 'Item filters'));
      filters.before(details); details.append(filters);
    }
    // Hover previews ignore pointer events; scroll them from the source item.
    root.addEventListener('wheel', event => {
      if(event.ctrlKey || event.metaKey || event.shiftKey || !event.deltaY) return;
      if(!event.target.closest('#invGrid,.inv-eq-slot,.oss-center')) return;
      const preview = document.getElementById('invRight');
      if(!preview || getComputedStyle(preview).visibility !== 'visible' || preview.clientHeight === 0) return;
      const comparing = preview.classList.contains('inv-side-compare');
      if(!comparing && !preview.classList.contains('inv-hover-preview')) return;
      const compareCards = comparing
        ? [...preview.querySelectorAll('.inv-compare-card')]
        : [];
      const scrollTargets = compareCards.length ? compareCards : [preview];
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? preview.clientHeight : 1;
      for(const node of scrollTargets) node.scrollTop += event.deltaY * unit;
      event.preventDefault();
    }, {passive:false});
    root.addEventListener('focusin', event => {
      const button=event.target.closest('.inv-actions button');
      if(!button) return;
      const rail=button.closest('.inv-actions');
      const bounds=rail.getBoundingClientRect(),item=button.getBoundingClientRect();
      if(item.right>bounds.right) rail.scrollLeft+=item.right-bounds.right;
      else if(item.left<bounds.left) rail.scrollLeft-=bounds.left-item.left;
    });
    root.classList.add('ui-composed'); nav.children[0].click();
  }
  // Keep decorative title plates sized to translated text without changing title DOM.
  function titleFrames() {
    const titles = ['settings','skillPanel','forge','storagePanel','statPanel'].flatMap(id => {
      const panel = document.getElementById(id);
      const title = panel?.querySelector('.ptitle');
      return title && !title.children.length ? [{panel, title}] : [];
    });
    const context = document.createElement('canvas').getContext('2d');
    if (!context || !titles.length) return;
    const sizes = [['s',360],['m',520],['l',680]];
    let pending = false;
    const put = (title, name, value) => {
      if (title.style.getPropertyValue(name) !== value) title.style.setProperty(name,value);
    };
    function fit() {
      pending = false;
      for (const {title} of titles) {
        if (!title.getClientRects().length || !title.getBoundingClientRect().width) continue;
        const style = getComputedStyle(title);
        const base = innerWidth <= 560 || innerHeight <= 650 ? 18 : innerHeight <= 800 ? 20 : 24;
        let text = title.textContent.trim();
        if (style.textTransform === 'uppercase') text = text.toLocaleUpperCase();
        context.font = `${style.fontStyle} ${style.fontWeight} ${base}px ${style.fontFamily}`;
        const measured = context.measureText(text).width + Math.max(0,[...text].length-1)*base*.02;
        const [size,width] = sizes.find(([,width]) => measured+96 <= width) || sizes[2];
        if (title.dataset.titleSize !== size) title.dataset.titleSize = size;
        put(title,'--title-frame-width',width+'px');
        const parent = title.parentElement;
        const parentStyle = getComputedStyle(parent);
        const available = parent.clientWidth-parseFloat(parentStyle.paddingLeft)-parseFloat(parentStyle.paddingRight);
        const padding = innerWidth <= 560 ? 56 : 96;
        const room = Math.max(1,Math.min(width,available)-padding);
        const font = Math.max(16,Math.min(base,measured ? base*room/measured : base));
        put(title,'--title-font-size',font.toFixed(2)+'px');
        const range = document.createRange();
        range.selectNodeContents(title);
        const height = Math.max(64,Math.ceil(range.getBoundingClientRect().height)+24);
        put(title,'--title-plate-height',height+'px');
      }
    }
    const schedule = () => {
      if (!pending) { pending = true; requestAnimationFrame(fit); }
    };
    const textChanges = new MutationObserver(schedule);
    const panelChanges = new MutationObserver(schedule);
    const resized = new ResizeObserver(schedule);
    for (const {panel,title} of titles) {
      textChanges.observe(title,{childList:true,characterData:true,subtree:true});
      panelChanges.observe(panel,{attributes:true,attributeFilter:['class']});
      resized.observe(title.parentElement);
    }
    addEventListener('resize',schedule,{passive:true});
    document.fonts?.ready.then(schedule);
    document.fonts?.addEventListener('loadingdone',schedule);
    schedule();
  }
  function init() {
    settings(); inventory(); translate();
    titleFrames();
    document.getElementById('optLang')?.addEventListener('change', translate);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
