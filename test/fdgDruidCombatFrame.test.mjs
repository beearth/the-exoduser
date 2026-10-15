import test from 'node:test';
import assert from 'node:assert/strict';
import {fitDruidCombatFrame} from '../engine/fdg/druid-combat-frame.js';

const viewport = {width:1280, height:720};
const safeRect = {left:60, top:90, right:1050, bottom:570};
const mapBounds = {left:0, top:0, right:8000, bottom:8000};
const projected = (result, point) => ({x:(point.x - result.x) * result.zoom + viewport.width / 2,
  y:(point.y - result.y) * result.zoom + viewport.height / 2});
function assertContained(result) {
  assert.equal(result.ok, true);
  assert.equal(result.contained, true);
  assert.equal(result.reason, null);
  const a = projected(result, {x:result.bounds.left,y:result.bounds.top});
  const b = projected(result, {x:result.bounds.right,y:result.bounds.bottom});
  assert.ok(a.x >= safeRect.left - 1e-7 && a.y >= safeRect.top - 1e-7);
  assert.ok(b.x <= safeRect.right + 1e-7 && b.y <= safeRect.bottom + 1e-7);
}

test('r7 moving body, tall staff, player and nearby projectile remain inside the safe rectangle', () => {
  const bounds = [{left:2880,top:1460,right:3360,bottom:2240},
    {left:3280,top:2100,right:3480,bottom:2300}, {left:3500,top:2176,right:3548,bottom:2224}];
  let result = fitDruidCombatFrame({bounds,viewport,safeRect,dt:1,mapBounds});
  assertContained(result);
  assert.equal(result.zoom, 480 / 840);
  for (let tick=0;tick<12;tick++) {
    const moved = bounds.map(value=>({left:value.left+35*(tick+1),right:value.right+35*(tick+1),
      top:value.top,bottom:value.bottom}));
    const next = fitDruidCombatFrame({bounds:moved,viewport,safeRect,previous:result,dt:1,mapBounds});
    assertContained(next);
    assert.ok(next.x > result.x);
    result=next;
  }
});

test('r7 zoom-out is immediate and zoom-in follows native frame-step smoothing', () => {
  const large = [{left:2500,top:1300,right:3500,bottom:2500}];
  const out = fitDruidCombatFrame({bounds:large,viewport,safeRect,previous:{x:3000,y:2000,zoom:.8},dt:1,mapBounds});
  assertContained(out);
  assert.equal(out.zoom,.4);
  const small = [{left:2900,top:1900,right:3100,bottom:2100}];
  const still = fitDruidCombatFrame({bounds:small,viewport,safeRect,previous:out,dt:0,mapBounds});
  assert.equal(still.zoom,out.zoom);
  const inside = fitDruidCombatFrame({bounds:small,viewport,safeRect,previous:out,dt:1,mapBounds});
  assertContained(inside);
  assert.equal(inside.zoom,.4+(.8-.4)*(1-.94));
  assert.ok(inside.zoom < inside.targetZoom);
});

test('r7 map clamp and minimum zoom report impossible containment without a false success', () => {
  const conflict = fitDruidCombatFrame({bounds:[{left:0,top:1900,right:200,bottom:2100}],
    viewport,safeRect,dt:1,mapBounds});
  assert.equal(conflict.ok,true);
  assert.equal(conflict.contained,false);
  assert.equal(conflict.reason,'map-bounds-conflict');
  assert.equal(conflict.x,viewport.width/(2*conflict.zoom));
  const oversized = fitDruidCombatFrame({bounds:[{left:0,top:0,right:5000,bottom:5000}],viewport,safeRect,dt:1});
  assert.equal(oversized.zoom,.3);
  assert.equal(oversized.contained,false);
  assert.equal(oversized.reason,'bounds-exceed-safe-viewport');
  const smallMap = fitDruidCombatFrame({bounds:[{left:450,top:450,right:550,bottom:550}],
    viewport,safeRect,dt:1,mapBounds:{left:0,top:0,right:1000,bottom:1000}});
  assertContained(smallMap);
  assert.equal(smallMap.x,500);
});

test('r7 rejects invalid boundaries and preserves all caller inputs and returned metadata independence', () => {
  const input = {bounds:[{left:2880,top:1460,right:3360,bottom:2240}],viewport:{...viewport},safeRect:{...safeRect},
    previous:{x:3100,y:2100,zoom:.6},dt:1,mapBounds:{...mapBounds}};
  const before=structuredClone(input);
  const result=fitDruidCombatFrame(input);
  assertContained(result);
  assert.deepEqual(input,before);
  result.bounds.left=-1;result.safeRect.top=-1;
  assert.deepEqual(input,before);
  for (const patch of [{bounds:[]},{bounds:[{left:0,top:NaN,right:20,bottom:20}]},
    {bounds:[{left:20,top:0,right:10,bottom:20}]},{safeRect:{...safeRect,right:2000}},
    {viewport:{width:0,height:720}},{previous:{x:0,y:0,zoom:Infinity}},
    {mapBounds:{left:0,top:0,right:0,bottom:8000}},{dt:-1}]) {
    const rejected=fitDruidCombatFrame({...input,...patch});
    assert.equal(rejected.ok,false);
    assert.equal(rejected.contained,false);
    assert.equal(rejected.x,null);
    assert.equal(rejected.zoom,null);
  }
});
