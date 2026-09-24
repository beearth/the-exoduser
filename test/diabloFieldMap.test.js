import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') { depth++; opened = true; }
    else if (gameHtml[i] === '}') {
      depth--;
      if (opened && depth === 0) return gameHtml.slice(start, i + 1);
    }
  }
  assert.fail(`${name} must be complete`);
}

function diabloFieldBuilder() {
  return Function(`${extractFunction('_rleEncodeGrid')}; return ${extractFunction('_buildDiabloField')}`)();
}

function decodeRle(rle, size) {
  const cells = [];
  for (let i = 0; i < rle.length; i += 2) {
    for (let n = 0; n < rle[i + 1]; n++) cells.push(rle[i]);
  }
  assert.equal(cells.length, size);
  return cells;
}

test('CH1 rootworld central mass leaves independent west and east routes', () => {
  const a=diabloFieldBuilder()(0,200,200),cells=decodeRle(a.tileRLE,40000);
  assert.equal(cells[112*200+102],0,'central mass must shape navigation');
  const reach=(blocked)=>{
    const seen=new Set(),queue=[[100,181]];
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i],k=y*200+x;
      if(x<0||y<0||x>=200||y>=200||seen.has(k)||!cells[k]||blocked(x,y))continue;
      seen.add(k);for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);
    }return seen;
  };
  assert.ok(reach((x,y)=>y>=85&&y<=145&&x>115).has(24*200+100),'west route');
  assert.ok(reach((x,y)=>y>=85&&y<=145&&x<125).has(24*200+100),'east route');
  const all=reach(()=>false);
  assert.equal(all.size,cells.filter(Boolean).length,'no disconnected floor');
  for(const h of a.spawnHoles)assert.ok(all.has(h.y*200+h.x),'accessible spawn');
  for(const [cx,cy,r]of[[62,126,12],[148,112,9],[96,42,12]])
    for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)
      if((x-cx)**2+(y-cy)**2<=r*r)assert.equal(cells[y*200+x],1,`combat clearance ${x},${y}`);
});

test('QA and production both apply canonical north gate after template generation',()=>{
  const line=gameHtml.split('\n').find(s=>s.includes('const _ch1Gate=_applyCh1StartNorthGate'));
  const run=Function('_DIABLO_FIELD_QA',`${extractFunction('_applyCh1StartNorthGate')};const si=0,_MAP_COMPOSE=[{forestBoundary:1}],mw=200,mh=200,map=Array.from({length:mh},()=>Array(mw).fill(1));let bossCx=0,_gateY=0,_gateTiles=[];const exits=[];${line};return{map,exits,gate:_gateY};`);
  for(const qa of [true,false]){
    const result=run(qa);assert.equal(result.gate,5);assert.equal(result.map[7][100],2);assert.equal(result.map[35][100],0);assert.equal(result.exits.length,3);
  }
});

test('Diablo field is deterministic and uses broad field regions instead of room corridors', () => {
  const build = diabloFieldBuilder();
  const a = build(6, 200, 200);
  const b = build(6, 200, 200);
  assert.deepEqual(a.tileRLE, b.tileRLE);
  assert.deepEqual(a.regions, b.regions);

  assert.deepEqual(a.regions.map(region => region.role), ['start', 'combat', 'travel', 'combat', 'pocket', 'boss']);
  assert.ok(a.regions.filter(region => region.role === 'combat').every(region => region.rx >= 24 && region.ry >= 18));
  assert.equal(a.rooms.filter(room => room.type === 'boss').length, 1);
  assert.equal(a.rooms.find(room => room.type === 'start').cy, 181);

  const floor = decodeRle(a.tileRLE, 200 * 200).filter(Boolean).length;
  assert.ok(floor > 15000, `expected a substantial playable field, got ${floor} tiles`);
  assert.ok(floor < 30000, `outer terrain mass must remain, got ${floor} tiles`);
});
