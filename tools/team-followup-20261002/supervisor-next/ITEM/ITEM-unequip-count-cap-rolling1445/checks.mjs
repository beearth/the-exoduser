import assert from 'node:assert/strict';

// Pure transform only; importing does not run fixtures or write files.
export function applyUnequipCountPatch(s){const old='function unequipItem(slot){\n  const item=INV.equipped[slot];\n  if(!item)return;';assert.equal(s.split(old).length,2);return s.replace(old,old+"\n  if(INV.bag.length>=BAG_MAX){notify(_T('가방에 공간이 없습니다!'));return}")}

