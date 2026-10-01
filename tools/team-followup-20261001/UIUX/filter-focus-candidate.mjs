export function sourceFactory(source) {
  const marker='const _inventoryFocus=(',start=source.indexOf(marker),end=source.indexOf(')({document,get:$,label:_L});',start);
  if(start<0||end<start)throw new Error('생산 factory 문맥 없음');
  return source.slice(start+marker.length,end);
}

export function connectFilter(source) {
  const changes=[
    ['    const active = document.activeElement;\n    const activeItem', "    const active = document.activeElement;\n    const filter = get('invFilters')?.contains(active) && active.dataset.inventoryFilterKey\n      ? {key:active.dataset.inventoryFilterKey,value:active.dataset.inventoryFilterValue} : null;\n    const activeItem"],
    ['    return {active,owned,item:activeItem || keyboardItem};','    return {active,owned,item:activeItem || keyboardItem,filter};'],
    ['  function afterRender(token) {\n    if (!token.owned', "  function afterRender(token) {\n    if (token.filter && inside()) {\n      const filters = get('invFilters')?.querySelectorAll('button') || [];\n      const target = [...filters].find(node => node.dataset.inventoryFilterKey === token.filter.key && node.dataset.inventoryFilterValue === token.filter.value);\n      if (!focus(target)) focus(get('invClose'));\n      return;\n    }\n    if (!token.owned"],
    ["    b.onclick=()=>{invFilter[key]=act?null:val;renderInv()};", "    b.dataset.inventoryFilterKey=key;\n    b.dataset.inventoryFilterValue=String(val);\n    b.onclick=()=>{invFilter[key]=act?null:val;renderInv()};"]
  ];
  for(const [before,after]of changes){if(source.split(before).length!==2)throw new Error('최소 후보 문맥 변경');source=source.replace(before,after);}
  return source;
}
