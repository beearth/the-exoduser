import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  function collection(){
    const start=html.indexOf('// 부위 포인트 =');
    const end=html.indexOf('// ═══ 소환 스탯',start);
    const ctx=vm.createContext({INV:{equipped:{ossuary:{tier:4}},ossCollect:{}},
      ANC_ROSTER:[{id:'iron_warlord'}],_BONE_PARTS:['skull','torso','arms','legs']});
    vm.runInContext(html.slice(start,end),ctx);
    return ctx;
  }
  test(file+': an equipped urn cannot unlock missing bones',()=>{
    const c=collection();
    assert.equal(c._ossSetComplete(0),false);
    assert.equal(c._ancPartPts('iron_warlord','skull'),-1);
    assert.equal(c._ossUnlockedList().length,0);
  });
  test(file+': four mixed-rarity parts unlock only after the last part',()=>{
    const c=collection();
    for(const [i,part] of ['skull','torso','arms','legs'].entries()){
      c.INV.ossCollect['iron_warlord_'+part]={r:i,t:0};
      assert.equal(c._ancPartPts('iron_warlord',part),i);
      assert.equal(c._ossSetComplete(0),i===3);
    }
    assert.equal(c._ossUnlockedList().length,1);
    assert.equal(c._ossSetComplete(99),false);
  });
  test(file+': saved part rarity and tier survive collection checks',()=>{
    const c=collection();
    c.INV.ossCollect=JSON.parse('{"iron_warlord_skull":{"r":5,"t":4}}');
    const before=JSON.stringify(c.INV.ossCollect);
    assert.equal(c._ancPartPts('iron_warlord','skull'),9);
    assert.equal(c._ossSetComplete(0),false);
    assert.equal(JSON.stringify(c.INV.ossCollect),before);
  });
}
