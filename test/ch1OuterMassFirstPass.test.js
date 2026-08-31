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
const GEOMETRY=path.join(ROOT,'assets','map','ch1','geometry','ch1_si1_geometry.js');
const GEOMETRY_SHA256='5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f';
const IDS=Array.from({length:64},(_,i)=>`${i%8},${Math.floor(i/8)}`);

test('outer mass pass leaves the canonical geometry source byte-identical',()=>{
  const hash=crypto.createHash('sha256').update(fs.readFileSync(GEOMETRY)).digest('hex');
  assert.equal(hash,GEOMETRY_SHA256);
});

test('outer mass manifest defines LARGE then LARGE+MEDIUM without small props',()=>{
  assert.ok(fs.existsSync(MANIFEST),'outer mass composition manifest must exist');
  const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  assert.equal(manifest.stage,1);
  assert.deepEqual(manifest.masterSize,[8192,8192]);
  assert.equal(manifest.chunkSize,1024);
  assert.equal(manifest.bleed,1);
  assert.deepEqual([...manifest.chunks].sort(),[...IDS].sort());
  assert.deepEqual(manifest.phaseOrder,['LARGE','LARGE_MEDIUM']);
  assert.deepEqual(manifest.phases.LARGE.layers,['BACK','LARGE']);
  assert.deepEqual(manifest.phases.LARGE_MEDIUM.layers,['BACK','LARGE','MEDIUM','GROUND_CONNECTION']);
  assert.deepEqual(manifest.smallProps,[]);
  assert.equal(manifest.centerTouched,false);
  assert.equal(manifest.geometryChanged,false);
  assert.equal(manifest.collisionChanged,false);
  assert.equal(manifest.routeChanged,false);
  const allAssets=JSON.stringify(manifest.phases);
  assert.doesNotMatch(allAssets,/prop_s_|bone|pod|tiny/i);
});

test('runtime selects an opt-in CH1 outer phase while preserving the existing baked loader path',()=>{
  const block=GAME.match(/\/\/ CH1 PAINTED START SPIKE BEGIN([\s\S]*?)\/\/ CH1 PAINTED START SPIKE END/)?.[1]||'';
  assert.match(block,/function _ch1OuterMassPhase\(\)/);
  assert.match(block,/get\('ch1OuterMass'\)/);
  assert.match(block,/large_medium/);
  assert.match(block,/outer_mass\/\$\{_outerPhase\}\/chunk_\$\{x\}_\$\{y\}\.png/);
  assert.match(block,/stage:\s*1/);
  assert.match(block,/get\('ch1BakedSpike'\)\s*===\s*'1'/);
  assert.match(block,/phase:_ch1OuterMassPhase\(\)/);
});

test('both phase masters are full-map, preserve walkable transparency, and cover every outer side',async()=>{
  const phases=[
    ['large','CH1_OUTER_LARGE_MASTER.png'],
    ['large_medium','CH1_OUTER_LARGE_MEDIUM_MASTER.png'],
  ];
  for(const [dir,file] of phases){
    const masterPath=path.join(OUT,dir,file);
    assert.ok(fs.existsSync(masterPath),`${dir} master must exist`);
    const image=sharp(masterPath).ensureAlpha();
    const {data,info}=await image.raw().toBuffer({resolveWithObject:true});
    assert.deepEqual([info.width,info.height],[8192,8192]);
    const alpha=(tx,ty)=>data[(Math.round(ty*40)*info.width+Math.round(tx*40))*4+3];
    for(const [id,p] of Object.entries({start:[100,185],south:[115,158],central:[86,110],tree:[83,80],north:[110,38]}))
      assert.ok(alpha(...p)<=10,`${dir} ${id} center must remain open`);
    for(const [id,p] of Object.entries({left:[4,100],right:[196,100],top:[35,4],south:[35,196]}))
      assert.ok(alpha(...p)>=220,`${dir} ${id} outer mass must be opaque`);
  }
});

test('both phase chunk sets are complete and keep 1px seam bleed',async()=>{
  for(const phase of ['large','large_medium']){
    for(const id of IDS){
      const [x,y]=id.split(',');
      const meta=await sharp(path.join(OUT,phase,`chunk_${x}_${y}.png`)).metadata();
      assert.deepEqual([meta.width,meta.height],[1026,1026],`${phase} ${id}`);
    }
    for(const [a,b,axis] of [['3,3','4,3','x'],['3,4','4,4','x'],['2,5','2,6','y'],['5,1','5,2','y']]){
      const load=async id=>sharp(path.join(OUT,phase,`chunk_${id.replace(',','_')}.png`)).ensureAlpha().raw().toBuffer();
      const A=await load(a),B=await load(b),px=(buf,x,y)=>buf.subarray((y*1026+x)*4,(y*1026+x)*4+4);
      if(axis==='x')for(let i=0;i<1026;i++){assert.deepEqual(px(A,1025,i),px(B,1,i));assert.deepEqual(px(A,1024,i),px(B,0,i))}
      else for(let i=0;i<1026;i++){assert.deepEqual(px(A,i,1025),px(B,i,1));assert.deepEqual(px(A,i,1024),px(B,i,0))}
    }
  }
});
