import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const geometryPath=path.join(root,'assets/map/ch1/geometry/ch1_si1_geometry.js');
const gamePath=path.join(root,'game.html');

function loadGeometry(){
  if(!fs.existsSync(geometryPath))return null;
  const context={};context.globalThis=context;
  vm.runInNewContext(fs.readFileSync(geometryPath,'utf8'),context,{filename:geometryPath});
  return context.CH1_SI1_GEOMETRY||null;
}

function maskAt(mask,x,y){return mask[y*200+x]===1}

function rowSpan(mask,x,y){
  assert.equal(maskAt(mask,x,y),true,`sample (${x},${y}) must be walkable`);
  let left=x,right=x;
  while(left>0&&maskAt(mask,left-1,y))left--;
  while(right<199&&maskAt(mask,right+1,y))right++;
  return right-left+1;
}

function reachable(mask,start,goal,blocked){
  const seen=new Uint8Array(40000),q=new Int32Array(40000);let h=0,t=0;
  const s=start[1]*200+start[0];seen[s]=1;q[t++]=s;
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(h<t){
    const i=q[h++],x=i%200,y=Math.trunc(i/200);
    if(x===goal[0]&&y===goal[1])return true;
    for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy,ni=ny*200+nx;
      if(nx<0||ny<0||nx>=200||ny>=200||seen[ni]||!maskAt(mask,nx,ny))continue;
      if(blocked&&blocked(nx,ny))continue;
      seen[ni]=1;q[t++]=ni;
    }
  }
  return false;
}

test('CH1 si1 has a dedicated stage-local geometry source',()=>{
  const g=loadGeometry();
  assert.ok(g,'assets/map/ch1/geometry/ch1_si1_geometry.js must define CH1_SI1_GEOMETRY');
  assert.equal(g.stage,1);
  assert.deepEqual(Array.from(g.size),[200,200]);
});

test('geometry produces connected walkable/non-walkable map data',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask();
  assert.equal(mask.length,40000);
  assert.equal(maskAt(mask,100,185),true,'START');
  assert.equal(maskAt(mask,100,18),true,'boss approach');
  assert.equal(maskAt(mask,2,100),false,'west forest mass');
  assert.equal(maskAt(mask,197,100),false,'east forest mass');
  assert.equal(reachable(mask,[100,185],[100,18]),true,'START must reach boss approach');
});

test('seven required regions and every preserved landmark sit on real walkable geometry',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask();
  assert.deepEqual(Array.from(g.regions.map(r=>r.id)),['start','south','toxic','cocoon','central','tree','north']);
  for(const [id,p] of Object.entries(g.landmarks)){
    assert.equal(maskAt(mask,p[0],p[1]),true,`${id} must be on walkable geometry`);
  }
  assert.deepEqual(Array.from(g.landmarks.gate),[100,33],'gate landmark must match the runtime boss approach exit row');
});

test('main-route width has a deliberate narrow-wide-narrow-wide-narrow wave',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask();
  const actual=Object.fromEntries(g.widthSamples.map(s=>[s.id,rowSpan(mask,s.x,s.y)]));
  for(const s of g.widthSamples){
    assert.ok(actual[s.id]>=s.min&&actual[s.id]<=s.max,`${s.id} width ${actual[s.id]} outside ${s.min}..${s.max}`);
  }
  assert.ok(actual.south>=actual.start+25,'south arena must release after START');
  assert.ok(actual.south>=actual.central+20,'central must compress after south arena');
  assert.ok(actual.tree>=actual.central+15,'tree basin must release after compression');
  assert.ok(actual.tree>=actual.north+15,'north approach must compress after tree basin');
});

test('toxic and camp are actual side pockets connected to the main route',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask();
  assert.equal(reachable(mask,g.landmarks.toxic,g.routeAnchors.south),true);
  assert.equal(reachable(mask,g.landmarks.camp,g.routeAnchors.central),true);
  assert.ok(g.landmarks.toxic[0]<g.routeAnchors.south[0]-35,'toxic pocket must expand west of the spine');
  assert.ok(g.landmarks.camp[0]<g.routeAnchors.central[0]-25,'camp pocket must expand west of the spine');
});

test('corpse tree creates two unequal bypasses that rejoin north',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask(),tree=g.landmarks.tree;
  const block=(x,y)=>(x-tree[0])**2+(y-tree[1])**2<=g.treeBlockRadius**2;
  assert.equal(reachable(mask,g.routeAnchors.treeSouth,g.routeAnchors.treeNorth,block),true,'a bypass must remain with tree roots blocked');
  assert.ok(g.treeBypasses.left.width<g.treeBypasses.right.width,'left bypass must be shorter/narrower than right');
  assert.ok(g.treeBypasses.left.length<g.treeBypasses.right.length,'right bypass must be longer');
});

test('corpse tree exposes explicit left and right navigation lines inside the basin',()=>{
  const g=loadGeometry();assert.ok(g);
  const mask=g.buildMask();
  assert.deepEqual(Object.keys(g.bypassPaths),['left','right']);
  assert.ok(g.bypassPaths.left.some(p=>p[0]<g.landmarks.tree[0]),'left bypass must pass west of tree');
  assert.ok(g.bypassPaths.right.every(p=>p[0]>g.landmarks.tree[0]),'right bypass must stay east of tree');
  for(const [id,pts] of Object.entries(g.bypassPaths))for(const p of pts){
    assert.equal(maskAt(mask,p[0],p[1]),true,`${id} bypass point (${p}) must be walkable`);
  }
});

test('geometry RLE is complete and uses editor floor/wall values only',()=>{
  const g=loadGeometry();assert.ok(g);
  const rle=g.buildRLE();let total=0;
  for(let i=0;i<rle.length;i+=2){
    assert.ok(rle[i]===1||rle[i]===2,`unexpected RLE value ${rle[i]}`);
    total+=rle[i+1];
  }
  assert.equal(total,40000);
});

test('runtime loads and applies the geometry only to CH1 si1',()=>{
  const html=fs.readFileSync(gamePath,'utf8');
  assert.match(html,/assets\/map\/ch1\/geometry\/ch1_si1_geometry\.js/);
  assert.match(html,/si===1\s*&&\s*globalThis\.CH1_SI1_GEOMETRY/);
  assert.match(html,/CH1_SI1_GEOMETRY\.buildRLE\(\)/);
  assert.doesNotMatch(html,/si===0\s*&&\s*globalThis\.CH1_SI1_GEOMETRY/);
});

test('runtime keeps authored role and region metadata for geometry QA',()=>{
  const html=fs.readFileSync(gamePath,'utf8');
  assert.match(html,/_handObj\.role=H\.role/);
  assert.match(html,/_handObj\.region=H\.region/);
});
