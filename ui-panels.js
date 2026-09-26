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
  function settings() {
    const root = document.getElementById('settings');
    const box = root?.querySelector('.pbox');
    const old = root?.querySelector('.frame-inner-panel-split');
    if (!old || !box) return;
    const entries = [['game','게임','Game'],['display','화면','Display'],['audio','사운드','Audio'],['controls','조작','Controls'],['system','시스템','System']];
    const pages = new Map();
    const content = el('div', 'settings-pages frame-inner-panel');
    for (const [key, ko, en] of entries) {
      const page = el('section', 'settings-page');
      page.id = 'settings-page-' + key;
      page.setAttribute('role','tabpanel');
      page.setAttribute('aria-labelledby','settings-tab-' + key);
      const heading = label(el('h3', 'ui-section-heading'), ko, en);
      page.append(heading); pages.set(key, page); content.append(page);
    }
    const nav = tabBar(entries, key => {
      selected(nav, key);
      pages.forEach((page, name) => { page.hidden = name !== key; });
      content.scrollTop = 0;
    }, 'settings');
    const moveRow = (id, key) => {
      const node = document.getElementById(id);
      const row = node?.closest('.set-range-row');
      if (row) pages.get(key).append(row);
    };
    moveRow('optLang','system');
    ['optShake','optParts','optFps','optResScale','optIrisSz','optBrightness','optIrisGlow'].forEach(id => moveRow(id,'display'));
    ['optSfx','optBgm','optBgmTrack'].forEach(id => moveRow(id,'audio'));
    // Classify whole existing sections by a stable control ID, not translated text.
    const routes = [['keyBindList','controls'],['optScreenSection','display'],['charSelectGrid','system'],['cursorGrid','controls'],['gfxPresetRow','display'],['diagGpu','display'],['saveP1','system'],['toLobbyBtn2','system'],['resetBtn','system'],['quitBtn','system']];
    routes.forEach(([id,key]) => {
      const node = document.getElementById(id);
      const section = node?.classList.contains('set-section') ? node : node?.closest('.set-section');
      if (section) pages.get(key).append(section);
    });
    // Includes future controls added to the original game section.
    old.querySelectorAll('.set-section').forEach(section => pages.get('game').append(section));
    box.insertBefore(nav, old); box.insertBefore(content, old); old.remove();
    const footer = document.getElementById('setClose')?.parentElement;
    if (footer) {
      footer.classList.add('settings-footer');
      const saved = document.getElementById('settingsAutoSaveLabel');
      if (saved) footer.prepend(saved);
    }
    root.classList.add('ui-composed');
    nav.children[0].click();
  }
  function inventory() {
    const root = document.getElementById('invPanel');
    const body = root?.querySelector('.inv-wrap');
    if (!root || !body) return;
    const equip = root.querySelector('.inv-equip');
    if (equip) equip.id = 'inventory-page-equipment';
    const entries = [['equipment','장비','Equipment'],['ossuary','유골함','Ossuary'],['storage','보관함','Storage']];
    const targets = {equipment:equip,ossuary:document.getElementById('invOssuaryPanel'),storage:document.getElementById('invStorageCol')};
    const nav = tabBar(entries, key => {
      const changed = root.dataset.inventoryPage !== key;
      root.dataset.inventoryPage = key; selected(nav,key);
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
    root.classList.add('ui-composed'); nav.children[0].click();
  }
  function init() {
    settings(); inventory(); translate();
    document.getElementById('optLang')?.addEventListener('change', translate);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
