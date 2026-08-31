import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const GAME=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const OUT=path.join(ROOT,'assets','map','ch1','baked_spike','outer_mass');
const MANIFEST=path.join(OUT,'composition.json');
const MASTER=path.join(OUT,'landmark_center','CH1_LANDMARK_CENTER_MASTER.png');
const GEOMETRY=path.join(ROOT,'assets','map','ch1','geometry','ch1_si1_geometry.js');
const GEOMETRY_SHA256='5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f';
const IDS=Array.from({length:64},(_,i)=>`${i%8},${Math.floor(i/8)}`);

test('landmark/center pass leaves canonical geometry byte-identical',()=>{
  const hash=crypto.createHash('sha256').update(fs.readFileSync(GEOMETRY)).digest('hex');
  assert.equal(hash,GEOMETRY_SHA256);
});

test('GATE 6 contract fixes hierarchy, protected negative space, and zero gameplay changes',()=>{
  const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const gate=manifest.landmarkCenter;
  assert.ok(gate,'landmarkCenter contract must exist');
  assert.equal(gate.directory,'landmark_center');
  assert.equal(gate.gate,6);
  assert.deepEqual(gate.layers,['GROUND_LANDMARK','GROUND_TRANSITION']);
  assert.deepEqual(gate.primary,{id:'m_c1tree',tile:[83,80],role:'asymmetric-corpse-tree-basin'});
  assert.deepEqual(gate.secondary,[
    {id:'m_c1camp',tile:[49,122],role:'ash-warm-decay'},
    {id:'m_c1altar',tile:[151,91],role:'ritual-scar'},
  ]);
  assert.deepEqual(gate.tertiary,[
    {id:'m_c1pool',tile:[49,151],role:'toxic-spread'},
    {id:'m_c1cocoon',tile:[151,136],role:'organic-growth'},
  ]);
  assert.deepEqual(gate.protectedNegativeSpace.sort(),[
    'boss-approach','central-compression','south-combat-void','tree-left-bypass','tree-right-bypass'
  ].sort());
  assert.equal(gate.newVerticalProps,0);
  assert.equal(gate.geometryChanged,false);
  assert.equal(gate.collisionChanged,false);
  assert.equal(gate.routeChanged,false);
});

test('runtime loader exposes landmark_center only through the existing opt-in outer-mass path',()=>{
  const block=GAME.match(/\/\/ CH1 PAINTED START SPIKE BEGIN([\s\S]*?)\/\/ CH1 PAINTED START SPIKE END/)?.[1]||'';
  assert.match(block,/phase==='landmark_center'/);
  assert.match(block,/outer_mass\/\$\{_outerPhase\}\/chunk_\$\{x\}_\$\{y\}\.png/);
});

test('landmark master adds ground identity while preserving combat and travel voids',async()=>{
  assert.ok(fs.existsSync(MASTER),'landmark center master must exist');
  const {data,info}=await sharp(MASTER).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual([info.width,info.height],[8192,8192]);
  const alpha=(tx,ty)=>data[(Math.round(ty*40)*info.width+Math.round(tx*40))*4+3];

  for(const [id,p] of Object.entries({tree:[83,80],camp:[49,122],altar:[151,91],toxic:[49,151],cocoon:[151,136]}))
    assert.ok(alpha(...p)>=24,`${id} needs visible ground integration`);

  for(const [id,p] of Object.entries({south:[115,158],central:[86,110],boss:[110,38],treeLeft:[75,80],treeRight:[104,82]}))
    assert.ok(alpha(...p)<=12,`${id} protected movement/combat space must stay visually open`);

  for(const [id,p] of Object.entries({left:[4,100],right:[196,100],top:[35,4],southOuter:[35,196]}))
    assert.ok(alpha(...p)>=220,`${id} outer mass must remain opaque`);
});

test('landmark_center chunks are complete with 1px seam bleed',async()=>{
  for(const id of IDS){
    const [x,y]=id.split(',');
    const meta=await sharp(path.join(OUT,'landmark_center',`chunk_${x}_${y}.png`)).metadata();
    assert.deepEqual([meta.width,meta.height],[1026,1026],id);
  }
  for(const [a,b,axis] of [['3,3','4,3','x'],['3,4','4,4','x'],['2,5','2,6','y'],['5,1','5,2','y']]){
    const load=async id=>sharp(path.join(OUT,'landmark_center',`chunk_${id.replace(',','_')}.png`)).ensureAlpha().raw().toBuffer();
    const A=await load(a),B=await load(b),px=(buf,x,y)=>buf.subarray((y*1026+x)*4,(y*1026+x)*4+4);
    if(axis==='x')for(let i=0;i<1026;i++){assert.deepEqual(px(A,1025,i),px(B,1,i));assert.deepEqual(px(A,1024,i),px(B,0,i));}
    else for(let i=0;i<1026;i++){assert.deepEqual(px(A,i,1025),px(B,i,1));assert.deepEqual(px(A,i,1024),px(B,i,0));}
  }
});
