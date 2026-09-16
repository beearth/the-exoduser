import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const layoutPath = new URL('../assets/map/ch1/production_finish/layout.js', import.meta.url);
function layout() {
  assert.ok(fs.existsSync(layoutPath), 'CH1-1 needs its fixed authored production layout');
  const context = {};
  vm.runInNewContext(fs.readFileSync(layoutPath, 'utf8'), context);
  return context.CH1_1_PRODUCTION;
}
function decode(data) {
  const grid = [];
  for (let i=0; i<data.length; i+=2) for(let n=0;n<data[i+1];n++) grid.push(data[i]);
  assert.equal(grid.length, 40000);
  return grid;
}
test('the complete authored forest preserves entrance, exit, both tree bypasses and every existing POI', () => {
  const l=layout(), g=decode(l.buildRLE(200,200));
  const targets=[[100,185],[100,190],[100,18],[100,150],[84,90],[122,90],[45,100],[47,50],[147,97],[162,139],[167,43],[35,150]];
  const q=[185*200+100],seen=new Set(q);
  for(let k=0;k<q.length;k++) {const p=q[k],x=p%200,y=p/200|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*200+nx;if(nx>=0&&nx<200&&ny>=0&&ny<200&&g[n]===1&&!seen.has(n)){seen.add(n);q.push(n);}}}
  for(const [x,y] of targets) assert.ok(seen.has(y*200+x), `protected point ${x},${y} must be reachable`);
  assert.equal(seen.size,g.filter(v=>v===1).length,'no unreachable authored floor');
});
test('forest shoulders create a real transition without narrowing the map dimensions', () => {
  const l=layout(),g=decode(l.buildRLE(200,200));
  assert.deepEqual(Array.from(l.size),[200,200]);
  for(const [x,y] of [[58,126],[145,121],[30,185],[175,185]])assert.equal(g[y*200+x],0,`${x},${y} is forest mass`);
  for(const y of [40,70,90,125,150,180])assert.equal(g[y*200+100],1,`northward travel stays open at ${y}`);
  assert.ok(l.regions.some(r=>r.id==='north_exit'));
  assert.ok(l.regions.some(r=>r.id==='south_entry'));
});
test('production art and geometry are selected only for the real stage zero', () => {
  const source=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
  assert.match(source, /assets\/map\/ch1\/production_finish\/layout\.js/);
  assert.match(source, /assets\/map\/ch1\/production_finish/);
  assert.match(source, /CH1_1_PRODUCTION\.buildRLE\(mw,mh\)/);
  assert.match(source, /G\.stage===_CH1_START_OUTER\.stage/);
});
