export function createInventoryFocus({document, get, label}) {
  let anchor = null;
  let opener = null;
  const inside = () => get('invPanel')?.classList.contains('on');
  function usable(node) {
    return !!node?.isConnected && !node.disabled && !node.closest('[hidden],[aria-hidden="true"]');
  }
  function focus(node) {
    if (!usable(node)) return false;
    node.focus({preventScroll:true});
    return document.activeElement === node;
  }
  function restore() {
    if (!inside()) return;
    if (!focus(anchor)) focus(get('invClose'));
    anchor = null;
  }
  function missing() {
    const detail = get('invRight');
    const actions = get('invActionBtns');
    const ownsFocus = detail?.contains(document.activeElement) || actions?.contains(document.activeElement);
    if (detail) {
      detail._detailItem = null;
      detail._detailSource = null;
      detail.classList.remove('inv-side-compare','inv-hover-preview');
      const hint = document.createElement('p');
      hint.textContent = label('선택한 아이템이 없습니다.','Selected item is unavailable.');
      hint.setAttribute('role','status');
      detail.replaceChildren(hint);
    }
    actions?.replaceChildren();
    get('invOssInfo')?.classList.remove('has-detail','has-bone');
    const floating = get('invCompareFloat');
    if (floating) floating.style.display = 'none';
    if (ownsFocus || anchor) restore();
  }
  function bind(node, resolve, activate, name) {
    node.tabIndex = 0;
    node.dataset.inventoryDetailTrigger = '1';
    node.setAttribute('role','button');
    node.setAttribute('aria-label',name);
    let spaceHeld = false;
    function enter() {
      if (!inside()) return;
      anchor = node;
      if (!resolve()) { missing(); return; }
      activate();
      const detail = get('invRight');
      if (detail && inside()) { detail.tabIndex = -1; focus(detail); }
    }
    node.onkeydown = event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target !== node) return;
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        if (!event.repeat) enter();
      } else if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) spaceHeld = true;
      }
    };
    node.onkeyup = event => {
      if (event.code !== 'Space' || event.target !== node) return;
      event.preventDefault();
      const activateSpace = spaceHeld && !event.ctrlKey && !event.metaKey && !event.altKey;
      spaceHeld = false;
      if (activateSpace) enter();
    };
    node.onblur = () => { spaceHeld = false; };
  }
  return Object.freeze({bind, missing, begin() {
    if (!get('invPanel')?.contains(document.activeElement) && usable(document.activeElement)) opener = document.activeElement;
    anchor = null;
  }, close() {
    anchor = null;
    if (!inside()) {
      if (!focus(opener) && get('invPanel')?.contains(document.activeElement)) document.activeElement?.blur();
      opener = null;
    }
  }});
}

export function connectCandidate(source) {
  function replaceOnce(before, after) {
    if (source.split(before).length !== 2) throw new Error('호출부 문맥 불일치');
    source = source.replace(before, after);
  }
  replaceOnce('function _invRenderDetail(idx,source,preview=false){', `const _inventoryFocus=(${createInventoryFocus.toString()})({document,get:$,label:_L});\nfunction _invRenderDetail(idx,source,preview=false){`);
  replaceOnce("  if(!it)return;\n  const rp=$('invRight');if(!rp)return;", "  if(!it){_inventoryFocus.missing();return;}\n  const rp=$('invRight');if(!rp)return;");
  replaceOnce("const _eqS=INV.selected.slice(3);if(INV.equipped[_eqS])_invRenderDetail(_eqS,'eq');return;", "const _eqS=INV.selected.slice(3);_invRenderDetail(_eqS,'eq');return;");
  replaceOnce('    grid.appendChild(div);\n  }\n\n    //', "    _inventoryFocus.bind(div,()=>INV.bag.includes(item)?item:null,()=>{const current=INV.bag.indexOf(item);INV.selected=current;renderInv();_invRenderDetail(current,'bag');},_T(item.name));\n    grid.appendChild(div);\n  }\n\n    //");
  replaceOnce('    eqGrid.appendChild(div);', "    if(item)_inventoryFocus.bind(div,()=>INV.equipped[slot]===item?item:null,()=>{INV.selected='eq:'+slot;renderInv();_invRenderDetail(slot,'eq');},_T(item.name));\n    eqGrid.appendChild(div);");
  replaceOnce("function openPanel(id){closeAllPanels();", "function openPanel(id){if(id==='invPanel')_inventoryFocus.begin();closeAllPanels(id==='invPanel');");
  replaceOnce("function togglePanel(id){const el=$(id);", "function togglePanel(id){if(id==='invPanel'&&!$('invPanel').classList.contains('on'))_inventoryFocus.begin();const el=$(id);");
  replaceOnce("const isOn=el.classList.contains('on');closeAllPanels();", "const isOn=el.classList.contains('on');closeAllPanels(id==='invPanel'&&!isOn);");
  replaceOnce("function closePanel(id){$(id).classList.remove('on');G.paused=false}", "function closePanel(id){$(id).classList.remove('on');G.paused=false;if(id==='invPanel')_inventoryFocus.close();}");
  replaceOnce("function closeAllPanels(){$('resetConfirm')", "function closeAllPanels(preserveInventoryFocus=false){const inventoryWasOpen=$('invPanel')?.classList.contains('on');$('resetConfirm')");
  replaceOnce("/* 패드 UI 잔류 정리 */", "if(inventoryWasOpen&&!preserveInventoryFocus)_inventoryFocus.close();/* 패드 UI 잔류 정리 */");
  replaceOnce("#invPanel.on button,#crBagPop button", "#invPanel.on button,#invPanel.on [data-inventory-detail-trigger],#crBagPop button");
  return source;
}
