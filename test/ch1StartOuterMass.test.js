import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const GAME=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const OUT=path.join(ROOT,'assets','map','ch1','baked_start_outer');
const MANIFEST=path.join(OUT,'composition.json');
const MASTER=path.join(OUT,'CH1_1_START_OUTER_MASTER.png');
const IDS=Array.from({length:64},(_,i)=>`${i%8},${Math.floor(i/8)}`);

test('CH1-1 start map owns a default-on stage-0 baked outer manifest',()=>{
  assert.ok(fs.existsSync(MANIFEST),'si0 outer manifest must exist');
  const manifest=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  assert.equal(manifest.stage,0);
  assert.equal(manifest.map,'CH1-1');
  assert.equal(manifest.defaultEnabled,true);
  assert.deepEqual(manifest.masterSize,[8192,8192]);
  assert.deepEqual([...manifest.chunks].sort(),[...IDS].sort());
  assert.deepEqual(manifest.layers,['BACK','LARGE','MEDIUM','GROUND_CONNECTION']);
  assert.equal(manifest.smallProps,0);
  assert.equal(manifest.geometryChanged,false);
  assert.equal(manifest.collisionChanged,false);
  assert.equal(manifest.routeChanged,false);
  assert.equal(manifest.authoredObjectsChanged,false);
});

test('CH1-1 default gameplay loads the start outer, with an explicit QA opt-out only',()=>{
  assert.match(GAME,/const _CH1_START_OUTER=\{stage:0,chunkSize:1024,bleed:1/);
  assert.match(GAME,/function _ch1StartOuterEnabled\(\)/);
  assert.match(GAME,/G\.stage===_CH1_START_OUTER\.stage/);
  assert.match(GAME,/get\('ch1StartOuter'\)!=='0'/);
  assert.match(GAME,/assets\/map\/ch1\/baked_start_outer\/chunk_\$\{x\}_\$\{y\}\.png/);
  assert.match(GAME,/function _drawCh1StartOuter\(ctx\)/);
  assert.match(GAME,/function _ch1StartOuterPropAlpha\(mo\)/);
  assert.match(GAME,/function _drawCh1BakedSpike\(ctx\)\{\s*_drawCh1StartOuter\(ctx\);/);
  assert.match(GAME,/globalThis\.__ch1StartOuterQA/);
});

test('CH1-1 master is a continuous outer ring while START, EXIT, and HERO remain open',async()=>{
  assert.ok(fs.existsSync(MASTER),'si0 outer master must exist');
  const {data,info}=await sharp(MASTER).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual([info.width,info.height],[8192,8192]);
  const alpha=(tx,ty)=>data[(Math.round(ty*40)*info.width+Math.round(tx*40))*4+3];
  for(const [id,p] of Object.entries({left:[3,100],right:[197,100],top:[30,3],bottom:[30,197]}))
    assert.ok(alpha(...p)>=220,`${id} screen edge must be a continuous opaque mass`);
  for(const [id,p] of Object.entries({leftFront:[18,100],rightFront:[182,100],topFront:[30,18],bottomFront:[30,182]}))
    assert.ok(alpha(...p)>=40,`${id} needs a readable FRONT edge`);
  for(const [id,p] of Object.entries({start:[100,185],exit:[100,7],hero:[102,90],camp:[45,100],altar:[147,97]}))
    assert.ok(alpha(...p)<=8,`${id} playable/landmark center must remain open`);
});

test('CH1-1 outer chunks are complete and preserve 1px seam bleed',async()=>{
  for(const id of IDS){
    const [x,y]=id.split(',');
    const meta=await sharp(path.join(OUT,`chunk_${x}_${y}.png`)).metadata();
    assert.deepEqual([meta.width,meta.height],[1026,1026],id);
  }
  for(const [a,b,axis] of [['3,3','4,3','x'],['3,6','4,6','x'],['1,2','1,3','y'],['6,4','6,5','y']]){
    const load=async id=>sharp(path.join(OUT,`chunk_${id.replace(',','_')}.png`)).ensureAlpha().raw().toBuffer();
    const A=await load(a),B=await load(b),px=(buf,x,y)=>buf.subarray((y*1026+x)*4,(y*1026+x)*4+4);
    if(axis==='x')for(let i=0;i<1026;i++){assert.deepEqual(px(A,1025,i),px(B,1,i));assert.deepEqual(px(A,1024,i),px(B,0,i));}
    else for(let i=0;i<1026;i++){assert.deepEqual(px(A,i,1025),px(B,i,1));assert.deepEqual(px(A,i,1024),px(B,i,0));}
  }
});
