import {derivedFactory,deriveConnected} from './inventory-dom-candidate.mjs';

export function fixFactory(factory=derivedFactory()) {
  const changes=[
    ["    const owned = !!keyboardItem && (get('invRight')?.contains(active) || get('invActionBtns')?.contains(active));", "    const activeItem = [...currentCards].find(([,card]) => card === active)?.[0];\n    const owned = !!activeItem || (!!keyboardItem && (get('invRight')?.contains(active) || get('invActionBtns')?.contains(active)));"],
    ['    return {active,owned};','    return {active,owned,item:activeItem || keyboardItem};'],
    ['    if (document.activeElement === token.active && usable(token.active)) return;', '    if (currentCards.has(token.item) && document.activeElement === token.active && usable(token.active)) return;'],
    ['    const current = currentCards.get(keyboardItem);\n    if (!focus(current))', '    const current = currentCards.get(token.item);\n    if (!focus(current))']
  ];
  for(const [before,after] of changes){if(factory.split(before).length!==2)throw new Error('원 후보 문맥 변경');factory=factory.replace(before,after);}
  return factory;
}

export function connectRemoval(source) {
  const current=deriveConnected(source),before=derivedFactory();
  if(current.split(before).length!==2)throw new Error('factory 연결 문맥 변경');
  return current.replace(before,fixFactory(before));
}
