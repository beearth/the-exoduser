export function connectOssuary(source) {
  const changes=[
    ['  return Object.freeze({bind, missing, keepsDetail, beforeRender, afterRender, begin()', `  function releaseOssuaryAction(node, previousActive) {
    if (!inside() || previousActive !== node || usable(node)) return;
    if (document.activeElement !== node && document.activeElement !== document.body) return;
    if (!focus(get('invClose')) && document.activeElement === node) node.blur();
  }
  return Object.freeze({bind, missing, keepsDetail, beforeRender, afterRender, releaseOssuaryAction, begin()`],
    ["function renderOssPanel(){\n  const pn=$('invOssuaryPanel');if(!pn)return;", "function renderOssPanel(){\n  const pn=$('invOssuaryPanel');if(!pn)return;\n  const ossuaryFocusBefore=document.activeElement;"],
    ['  remove.onclick=urn.oncontextmenu;', '  remove.onclick=urn.oncontextmenu;\n  _inventoryFocus.releaseOssuaryAction(take,ossuaryFocusBefore);\n  _inventoryFocus.releaseOssuaryAction(remove,ossuaryFocusBefore);']
  ];
  for(const [before,after]of changes){if(source.split(before).length!==2)throw new Error('유골함 후보 문맥 변경');source=source.replace(before,after);}
  return source;
}
