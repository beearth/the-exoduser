import {createInventoryFocus, connectCandidate} from './inventory-focus-candidate.mjs';

export function derivedFactory() {
  let factory = createInventoryFocus.toString();
  function replaceOnce(before, after) {
    if (factory.split(before).length !== 2) throw new Error('원 후보 문맥 불일치');
    factory = factory.replace(before, after);
  }
  replaceOnce('  let anchor = null;', '  let anchor = null;\n  let keyboardItem = null;\n  const currentCards = new Map();\n  const currentResolvers = new WeakMap();');
  replaceOnce("    return !!node?.isConnected && !node.disabled && !node.closest('[hidden],[aria-hidden=\"true\"]');", "    const computed = node && document.defaultView?.getComputedStyle(node);\n    return !!node?.isConnected && !node.disabled && !node.closest('[hidden],[aria-hidden=\"true\"]') && computed?.visibility !== 'hidden' && computed?.display !== 'none';");
  replaceOnce("    if (!focus(anchor)) focus(get('invClose'));\n    anchor = null;", "    const current = currentCards.get(keyboardItem);\n    if (!focus(current && currentResolvers.get(current)?.() === keyboardItem ? current : null)) focus(get('invClose'));\n    anchor = null;\n    keyboardItem = null;");
  replaceOnce('    let spaceHeld = false;', '    const boundItem = resolve();\n    if (boundItem) currentCards.set(boundItem,node);\n    currentResolvers.set(node,resolve);\n    let spaceHeld = false;');
  replaceOnce('      if (!resolve()) { missing(); return; }', '      keyboardItem = resolve();\n      if (!keyboardItem) { missing(); return; }');
  replaceOnce('  return Object.freeze({bind, missing, begin()', `  function keepsDetail() {
    const current = currentCards.get(keyboardItem);
    return !!keyboardItem && inside() && usable(current) && currentResolvers.get(current)?.() === keyboardItem &&
      (get('invRight')?.contains(document.activeElement) || get('invActionBtns')?.contains(document.activeElement));
  }
  function beforeRender() {
    const active = document.activeElement;
    const owned = !!keyboardItem && (get('invRight')?.contains(active) || get('invActionBtns')?.contains(active));
    currentCards.clear();
    return {active,owned};
  }
  function afterRender(token) {
    if (!token.owned || !inside()) return;
    if (document.activeElement === token.active && usable(token.active)) return;
    const current = currentCards.get(keyboardItem);
    if (!focus(current)) { focus(get('invClose')); keyboardItem = null; }
    anchor = current || null;
  }
  return Object.freeze({bind, missing, keepsDetail, beforeRender, afterRender, begin()`);
  replaceOnce('    anchor = null;\n  }, close() {\n    anchor = null;', '    anchor = null;\n    keyboardItem = null;\n  }, close() {\n    anchor = null;\n    keyboardItem = null;\n    currentCards.clear();');
  return factory;
}

export function deriveConnected(source) {
  let candidate = connectCandidate(source);
  function replaceOnce(before, after) {
    if (candidate.split(before).length !== 2) throw new Error('실제 호출 연결 문맥 불일치');
    candidate = candidate.replace(before,after);
  }
  replaceOnce(createInventoryFocus.toString(), derivedFactory());
  replaceOnce('function _invClearHover(){\n  _invRestoreSelectedActions();', 'function _invClearHover(){\n  if(_inventoryFocus.keepsDetail())return;\n  _invRestoreSelectedActions();');
  replaceOnce('function renderInv(){\n  _invPlaceDetail();', 'function renderInv(){\n  const inventoryFocusToken=_inventoryFocus.beforeRender();\n  _invPlaceDetail();');
  replaceOnce("if(_placementMoved)_invClearHover();\n}\n$('invClose')", "if(_placementMoved)_invClearHover();\n  _inventoryFocus.afterRender(inventoryFocusToken);\n}\n$('invClose')");
  const crystalReturn = 'if(_placementMoved)_invClearHover();return;}';
  if (candidate.includes(crystalReturn)) replaceOnce(crystalReturn,'if(_placementMoved)_invClearHover();_inventoryFocus.afterRender(inventoryFocusToken);return;}');
  return candidate;
}

export function extractFunction(source,name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error('실제 함수 없음: '+name);
  const boundaries = ['\nfunction ',"\n$('invClose')",'\nconst _inventoryFocus='].map(marker=>source.indexOf(marker,start+1)).filter(index=>index>=0);
  return source.slice(start,Math.min(...boundaries)).trim();
}
