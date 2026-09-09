import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../stat-panel-ui.js';
const ui=globalThis.ExoduserStatsPanel;

test('body layout includes each existing passive and all five investable attributes once',()=>{
  assert.ok(Array.isArray(ui.bodyNodes),'Body tree layout must be available');
  const html=fs.readFileSync('game.html','utf8');
  const passives=[...html.split('const PASSIVE_DEF=[')[1].split('\n];')[0].matchAll(/key:'([^']+)'/g)].map(m=>m[1]);
  assert.deepEqual(ui.bodyNodes.map(n=>n.key).sort(),[...passives,'str','dex','int','lck','grit'].sort());
  assert.equal(new Set(ui.bodyNodes.map(n=>n.key)).size,31);
  for(const node of ui.bodyNodes){
    assert.ok(node.x>=80&&node.x<=920&&node.y>=35&&node.y<=755,node.key);
    const route=ui.bodyRoute(node.key);
    assert.equal(route[0],'origin');
    assert.equal(route.at(-1),node.key);
    assert.equal(new Set(route).size,route.length,'No circular connections');
  }
});

test('body connections are presentation only and preserve independent SP/AP investment',()=>{
  assert.equal(typeof ui.bodyRoute,'function');
  const live={stats:{str:0,dex:0,int:0,lck:0,vit:2},grit:3,passives:{pMagic:0,pAtk:0},sp:10,ap:5};
  const plan=ui.createPlan(live);
  plan.stats.int=10;plan.passives.pMagic=1;
  const next=ui.evaluatePlan(plan,live,{str:500,dex:500,int:500,lck:500,vit:500},[{key:'pMagic',max:20},{key:'pAtk',max:20}]);
  assert.equal(next.sp,0);assert.equal(next.ap,4);
  assert.equal(next.stats.vit,2);assert.equal(next.grit,3);
  assert.equal(live.stats.int,0);assert.equal(live.passives.pMagic,0);
});
