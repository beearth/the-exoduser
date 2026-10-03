const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {parseExpressionAt}=require('acorn');

function production(file){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  function fn(name){
    let start=html.indexOf('function '+name+'(');
    assert.ok(start>=0,'Production function '+name+' must exist');
    if(html.slice(start-6,start)==='async ')start-=6;
    const node=parseExpressionAt(html,start,{ecmaVersion:'latest'});
    return {node,source:html.slice(start,node.end)};
  }
  const mk=fn('mkItem');
  const fixed=mk.node.body.body.find(n=>n.type==='IfStatement'&&n.test.type==='BinaryExpression'&&n.test.left.name==='slot'&&n.test.right.value==='ossuary');
  assert.ok(fixed,'Production fixed unique ossuary branch must exist');
  const demo=fn('_startDemoNew');
  const save=demo.node.body.body.find(n=>n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression'&&n.expression.left.name==='dbSave').expression.right;
  return {functions:['_grantOssuaryIfNeeded','applyStats','recalcSt','_eqAffixRebuild','_eqAffix','_eqImplicit'].map(n=>fn(n).source).join('\n'),fixed:html.slice(fixed.start,fixed.end),save:html.slice(save.start,save.end)};
}
function session(code){
  const store=new Map();
  const context=vm.createContext({
    P:{lv:1,exp:0,maxExp:15,sp:0,ap:0,hp:350,mhp:350,mp:37,mmp:154,st:90,mst:136,shield:10,mshield:140,skills:{iceOrb:1},activeCtSk:'iceOrb',x:100,y:200},
    G:{on:true,stage:0,kills:0,mats:1000,hellCleared:[],_cutsceneDone:true},
    INV:{equipped:{necklace:{id:'kept-necklace',slot:'necklace',bonusMp:40,bonusShield:5,affixes:[],crystals:[]},boots:{id:'kept-boots',slot:'boots',bonusSt:30,bonusHp:50,affixes:[],crystals:[]}},bag:[{id:'kept-bag',slot:'weapon'}],ossCollect:{}},
    SLOT_NAMES:['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'],
    STATS:{str:0,dex:3,int:7,vit:0,lck:0},PASSIVES:{},OPT:{diff:5,diffV2:1},EL:{P:0},IMPLICIT_TABLE:{},
    _eqAffixCache:null,_eqStatCache:null,_lvB:()=>0,_diffSigned:()=>0,_gritTotal:()=>0,_gritHpFlat:()=>0,_gritMpFlat:()=>0,_gritStFlat:()=>0,pPredSpd:()=>0,crystalEffects:()=>[],
    _rarName:n=>String(n),_T:s=>s,notify(){},addTxt(){},
    _DEMO_LS_KEY:'hellsave_demo',_grit:0,_passiveQueueItems:()=>[],QSLOTS:[],BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,_charIdx:0,_lastSaveTime:0,
    localStorage:{setItem(k,v){store.set(k,String(v));}},console
  });
  // Run the exact production fixed-item branch; unrelated random item rolls are
  // represented by a deterministic seed object, not by a fake MP calculation.
  vm.runInContext('function mkItem(slot,tier,el,rarity){const item={id:"new-ossuary",slot,tier,el,rarity,affixes:[]};\n'+code.fixed+'\nreturn item;}\n'+code.functions+'\ndbSave='+code.save+';',context);
  context.applyStats();
  return {context,store};
}
const plain=value=>JSON.parse(JSON.stringify(value));
for(const file of ['game.html','game-easy-test.html']){
  const code=production(file);
  test(file+': automatic ossuary equip immediately adds its 150 maxMP without refilling current resources',()=>{
    const {context:c}=session(code),before=plain(c.P);
    c._grantOssuaryIfNeeded();
    assert.equal(c.INV.equipped.ossuary.bonusMp,150);
    assert.equal(c.P.mmp,before.mmp+150,'Auto-equipped ossuary must affect maxMP before the next save or restart');
    assert.equal(c.P.mp,before.mp,'Grant must not add an unsolicited MP refill');
    for(const key of ['hp','mhp','st','mst','shield','mshield','baseAtk','baseDef','speed'])assert.equal(c.P[key],before[key],key+' must retain its existing value');
  });
  test(file+': repeated automatic grant is a no-op for an already equipped ossuary',()=>{
    const {context:c}=session(code);c._grantOssuaryIfNeeded();const before=plain({P:c.P,INV:c.INV});
    c._grantOssuaryIfNeeded();
    assert.deepEqual(plain({P:c.P,INV:c.INV}),before);
  });
  test(file+': an ossuary already in the bag is neither replaced nor auto-equipped',()=>{
    const {context:c}=session(code);c.INV.bag.push({id:'existing-bag-ossuary',slot:'ossuary',bonusMp:150});const before=plain({P:c.P,INV:c.INV});
    c._grantOssuaryIfNeeded();assert.deepEqual(plain({P:c.P,INV:c.INV}),before);
  });
  test(file+': automatic grant preserves every other equipped item and bag item',()=>{
    const {context:c}=session(code);const necklace=c.INV.equipped.necklace,boots=c.INV.equipped.boots,before=plain(c.INV);
    c._grantOssuaryIfNeeded();assert.equal(c.INV.equipped.necklace,necklace);assert.equal(c.INV.equipped.boots,boots);
    const after=plain(c.INV);delete after.equipped.ossuary;assert.deepEqual(after,before);
  });
  test(file+': the actual demo save records maxMP consistent with its newly equipped ossuary',async()=>{
    const {context:c,store}=session(code);const oldMax=c.P.mmp,currentMp=c.P.mp;
    c._grantOssuaryIfNeeded();await c.dbSave();const saved=JSON.parse(store.get('hellsave_demo'));
    assert.equal(saved.inv.equipped.ossuary.bonusMp,150);
    assert.equal(saved.player.mmp,oldMax+150,'Saved maxMP must include the equipped unique item bonus immediately');
    assert.equal(saved.player.mp,currentMp);assert.equal(saved.player.mmp,c.P.mmp);
    assert.equal(saved.inv.equipped.necklace.id,'kept-necklace');assert.equal(saved.inv.bag[0].id,'kept-bag');
  });
  test(file+': recalculating the saved equipment keeps maxMP while existing demo boot may refill current MP',async()=>{
    const {context:c,store}=session(code);c._grantOssuaryIfNeeded();await c.dbSave();const saved=JSON.parse(store.get('hellsave_demo'));
    c.P=plain(saved.player);c.INV.equipped=plain(saved.inv.equipped);c.applyStats();
    assert.equal(c.P.mmp,saved.player.mmp,'Repeated equipment stat calculation must not increase maxMP after a correct save');
    assert.equal(c.P.mp,saved.player.mp,'applyStats itself clamps, rather than refills, current MP');
  });
}
