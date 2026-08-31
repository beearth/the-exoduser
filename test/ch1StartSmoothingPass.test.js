import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/,'$1')),'..');
const GAME=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const CAPTURE=fs.readFileSync(path.join(ROOT,'tmp','capture_ch1_start_smoothing.py'),'utf8');
const OUT=path.join(ROOT,'assets','map','ch1','baked_start_smoothing');
const MANIFEST=path.join(OUT,'composition.json');
const MASTER=path.join(OUT,'CH1_1_START_SMOOTHING_MASTER.png');
const IDS=Array.from({length:64},(_,i)=>`${i%8},${Math.floor(i/8)}`);

const readManifest=()=>JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
const rgbaAt=(data,width,tx,ty)=>data[(Math.round(ty*40)*width+Math.round(tx*40))*4+3];

test('CH1-1 smoothing manifest is a visual-only stage-0 phase over the outer master',()=>{
  assert.ok(fs.existsSync(MANIFEST),'smoothing composition manifest must exist');
  const m=readManifest();
  assert.equal(m.stage,0);
  assert.equal(m.map,'CH1-1');
  assert.equal(m.defaultPhase,'smoothing');
  assert.equal(m.defaultEnabled,true);
  assert.equal(m.baseMaster,'assets/map/ch1/baked_start_outer/CH1_1_START_OUTER_MASTER.png');
  assert.deepEqual(m.masterSize,[8192,8192]);
  assert.equal(m.chunkSize,1024);
  assert.equal(m.bleed,1);
  assert.deepEqual(m.layerRoles,['EDGE_SMOOTH','CORNER_VARIATION','TREE_BASIN','SIDE_CONNECTION','OPEN_FIELD']);
  assert.deepEqual(m.additions,{geometry:false,collision:false,route:false,authoredObjects:0,newStructures:0,newLandmarks:0,smallScatter:0,newVerticalSilhouettes:0});
  assert.equal(m.smallProps,0);
  assert.equal(m.newVerticalSilhouettes,0);
  assert.deepEqual([...m.chunks].sort(),[...IDS].sort());
});

test('CH1-1 smoothing protects exact routes, landmark anchors, and altar hill contract',()=>{
  const m=readManifest();
  assert.deepEqual(m.protected.START,[100.5,185.5]);
  assert.deepEqual(m.protected.EXIT,[100,18]);
  assert.deepEqual(m.protected.TREE,[102,90]);
  assert.deepEqual(m.protected.CAMP,[45,100]);
  assert.deepEqual(m.protected.ALTAR,[147,97]);
  assert.deepEqual(m.protected.COCOON,[47,50]);
  assert.deepEqual(m.protected.TOXIC_POOL,[174,50]);
  assert.deepEqual(m.protected.LOWER_PIT,[162,139]);
  assert.deepEqual(m.protected.ALTAR_HILL,{center:[147,98],rx:18,ry:9,westRamp:[125,135]});
});

test('CH1-1 smoothing master/chunks are complete and preserve exact 1px seam bleed',async()=>{
  assert.ok(fs.existsSync(MASTER),'smoothing master must exist');
  const masterMeta=await sharp(MASTER).metadata();
  assert.deepEqual([masterMeta.width,masterMeta.height],[8192,8192]);
  const chunks=new Map();
  for(const id of IDS){
    const [x,y]=id.split(',');
    const file=path.join(OUT,`chunk_${x}_${y}.png`),meta=await sharp(file).metadata();
    assert.deepEqual([meta.width,meta.height],[1026,1026],id);
    chunks.set(id,await sharp(file).ensureAlpha().raw().toBuffer());
    const masterCore=await sharp(MASTER).extract({left:Number(x)*1024,top:Number(y)*1024,width:1024,height:1024}).ensureAlpha().raw().toBuffer();
    const chunk=chunks.get(id);
    for(let row=0;row<1024;row++)assert.ok(chunk.subarray(((row+1)*1026+1)*4,((row+1)*1026+1025)*4).equals(masterCore.subarray(row*4096,(row+1)*4096)),`${id} core row ${row}`);
  }
  const px=(buf,x,y)=>buf.subarray((y*1026+x)*4,(y*1026+x)*4+4);
  for(let y=0;y<8;y++)for(let x=0;x<7;x++){
    const A=chunks.get(`${x},${y}`),B=chunks.get(`${x+1},${y}`);
    for(let i=0;i<1026;i++){assert.ok(px(A,1025,i).equals(px(B,1,i)),`H ${x},${y}→${x+1},${y} outer`);assert.ok(px(A,1024,i).equals(px(B,0,i)),`H ${x},${y}→${x+1},${y} inner`)}
  }
  for(let y=0;y<7;y++)for(let x=0;x<8;x++){
    const A=chunks.get(`${x},${y}`),B=chunks.get(`${x},${y+1}`);
    for(let i=0;i<1026;i++){assert.ok(px(A,i,1025).equals(px(B,i,1)),`V ${x},${y}→${x},${y+1} outer`);assert.ok(px(A,i,1024).equals(px(B,i,0)),`V ${x},${y}→${x},${y+1} inner`)}
  }
  for(let i=0;i<8;i++)for(let p=0;p<1026;p++){
    assert.ok(px(chunks.get(`0,${i}`),0,p).equals(px(chunks.get(`0,${i}`),1,p)),`left boundary ${i}`);
    assert.ok(px(chunks.get(`7,${i}`),1025,p).equals(px(chunks.get(`7,${i}`),1024,p)),`right boundary ${i}`);
    assert.ok(px(chunks.get(`${i},0`),p,0).equals(px(chunks.get(`${i},0`),p,1)),`top boundary ${i}`);
    assert.ok(px(chunks.get(`${i},7`),p,1025).equals(px(chunks.get(`${i},7`),p,1024)),`bottom boundary ${i}`);
  }
});

test('smoothing master materially differs at edge, tree, and POIs while combat cutouts stay quiet',async()=>{
  const base=path.join(ROOT,'assets','map','ch1','baked_start_outer','CH1_1_START_OUTER_MASTER.png');
  const meanDelta=async rect=>{
    const [a,b]=await Promise.all([sharp(MASTER).extract(rect).ensureAlpha().raw().toBuffer(),sharp(base).extract(rect).ensureAlpha().raw().toBuffer()]);
    let total=0;for(let i=0;i<a.length;i++)total+=Math.abs(a[i]-b[i]);return total/a.length;
  };
  const influenced=await Promise.all([
    meanDelta({left:400,top:900,width:1500,height:900}),
    meanDelta({left:2800,top:2800,width:2400,height:1700}),
    meanDelta({left:5900,top:1400,width:1800,height:1900})
  ]);
  influenced.forEach((n,i)=>assert.ok(n>.25,`influence region ${i} delta ${n} must prevent a no-op copy`));
  const quiet=await Promise.all([[79,90],[125,90],[100,116],[100,66]].map(([tx,ty])=>meanDelta({left:tx*40-24,top:ty*40-24,width:48,height:48})));
  assert.ok(quiet.reduce((a,b)=>a+b,0)/quiet.length<Math.min(...influenced)*.45,'combat cutout delta must stay materially below EDGE/TREE/POI influence');
});

test('central combat bypasses stay quieter than tree basin and POI ground connections',async()=>{
  const {data,info}=await sharp(MASTER).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const alpha=(tx,ty)=>rgbaAt(data,info.width,tx,ty);
  const combat={treeWest:[79,90],treeEast:[125,90],centerSouth:[100,116],centerNorth:[100,66]};
  const influenced={treeBasin:[102,100],campAsh:[45,106],altarSkirt:[147,105],cocoonVein:[54,55],toxicChain:[169,59],lowerPitWet:[156,134]};
  const combatValues=Object.entries(combat).map(([id,p])=>{const a=alpha(...p);assert.ok(a<=24,`${id} alpha ${a} must stay low`);return a});
  const influenceValues=Object.entries(influenced).map(([id,p])=>{const a=alpha(...p);assert.ok(a>=28,`${id} alpha ${a} must show ground influence`);return a});
  const mean=a=>a.reduce((s,n)=>s+n,0)/a.length;
  assert.ok(mean(combatValues)<mean(influenceValues)*.55,'protected combat samples must remain materially quieter');
});

test('the existing CH1-1 loader defaults to smoothing, can compare outer, and still disables safely',()=>{
  assert.match(GAME,/get\('ch1StartPhase'\)/);
  assert.match(GAME,/phase==='outer'/);
  assert.match(GAME,/assets\/map\/ch1\/baked_start_smoothing\/chunk_\$\{x\}_\$\{y\}\.png/);
  assert.match(GAME,/assets\/map\/ch1\/baked_start_outer\/chunk_\$\{x\}_\$\{y\}\.png/);
  assert.match(GAME,/get\('ch1StartOuter'\)!=='0'/);
  assert.match(GAME,/G\._bossArena/);
  assert.equal((GAME.match(/function _drawCh1StartOuter\(ctx\)/g)||[]).length,1,'reuse the single renderer');
  assert.equal((GAME.match(/const _ch1StartOuterCache=/g)||[]).length,1,'reuse the single cache');
  assert.match(GAME,/globalThis\.__ch1StartOuterQA=.*phase:/s);
});

test('smoothing phase integrates interior structural rows without fading landmark sprites',()=>{
  assert.match(GAME,/function _ch1StartInteriorStructuralAlpha\(mo\)/);
  assert.match(GAME,/_CH1_START_PHASE!=='smoothing'/);
  assert.match(GAME,/\/\^m_c1\(\?:b\|c\[nsew\]\)\//);
  assert.match(GAME,/return \[\.6,\.68,\.76\]/);
  assert.match(GAME,/return _ch1StartInteriorStructuralAlpha\(mo\)/);
  assert.match(GAME,/if\(!\/\^m_c1\(\?:b\|c\[nsew\]\)\//,'non-structural landmarks must return full alpha before staggering');
});

test('stage-0 smoothing uses an organic hill visual while collision and height math stay locked',()=>{
  assert.match(GAME,/const _CH1_HILL=\{cx:147,cy:98,rx:18,ry:9,inner:\.84,outer:1\.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1\.8,rampHalf1:3\}/);
  assert.match(GAME,/return d>=h\.inner&&d<=h\.outer/);
  assert.match(GAME,/if\(r>=0\)return r\*r\*\(3-2\*r\)/);
  assert.match(GAME,/function _buildCh1HillSmoothingTex\(edge\)/);
  assert.match(GAME,/_CH1_START_PHASE==='smoothing'.*_buildCh1HillSmoothingTex/s);
  const start=GAME.indexOf('function _buildCh1HillSmoothingTex');
  const end=GAME.indexOf('function _drawCh1Hill',start);
  assert.ok(start>=0&&end>start,'organic smoothing hill helper must be a separate visual-only block');
  const block=GAME.slice(start,end);
  assert.match(block,/organicSkirt/);
  assert.match(block,/\.ellipse\(/);
  assert.match(block,/rampPath/);
  assert.doesNotMatch(block,/fillRect|strokeRect|purple|#8[048][0-9a-f]{3}/i,'smoothing hill must not use rectangular or purple-rim treatment');
  assert.match(GAME,/const smoothing=_CH1_START_PHASE==='smoothing'&&_ch1StartOuterEnabled\(\)/,'organic hill must obey stage0 outer opt-out and boss-arena guards');
});

test('capture waits for first visible chunks and probes opt-out, boss, and stage1 isolation',()=>{
  const start=CAPTURE.indexOf('def capture_mode');
  const end=CAPTURE.indexOf('def make_comparisons',start);
  const block=CAPTURE.slice(start,end);
  assert.ok(block.indexOf('wait_chunks(page)')>=0&&block.indexOf('wait_chunks(page)')<block.indexOf('runtime_facts(page)'),'first visible+neighbor chunks must be ready before runtime facts');
  assert.match(CAPTURE,/OPT_OUT/);
  assert.match(CAPTURE,/BOSS_ARENA/);
  assert.match(CAPTURE,/STAGE1_ISOLATION/);
  assert.match(CAPTURE,/isWDifferential/);
  assert.match(CAPTURE,/firstVisible/);
  assert.match(CAPTURE,/\{obj:v,d\}/,'landmark reducer must capture the candidate object without a temporal-dead-zone reference');
  assert.doesNotMatch(CAPTURE,/\?\{o,d\}:best/,'landmark reducer must not shorthand-reference its uninitialized result binding');
  assert.match(CAPTURE,/_MAP_COMPOSE\[0\]\.handProps\.reduce/,'exact landmark anchors must be checked against raw authored coordinates');
  assert.match(CAPTURE,/tile:\[nearest\.obj\.x,nearest\.obj\.y\]/);
});

test('manifest budgets a camera-readable basin, macro contrast, and enlarged POI footprints',()=>{
  const m=readManifest(),v=m.visualContract;
  assert.deepEqual(v.treeBasinFootprintPx,[3100,2200]);
  assert.deepEqual(v.treeBasinSoilOpacityRange,[.28,.38]);
  assert.deepEqual(v.macroOpacityRange,[.16,.28]);
  assert.deepEqual(v.poiFootprintScaleRange,[1.5,2.2]);
  assert.equal(v.innerEdgeTonguesPerSideMin,3);
  assert.equal(v.landmarkSpriteAlpha,1);
});

test('smoothing breaks repeated interior L rows into asymmetric visibility bands',()=>{
  const start=GAME.indexOf('function _ch1StartInteriorStructuralAlpha');
  const end=GAME.indexOf('function _pumpCh1StartOuterWarmup',start);
  const block=GAME.slice(start,end);
  assert.match(block,/const quadrant=/);
  assert.match(block,/return \[\.6,\.68,\.76\]/,'one row must include a readable recessed 0.60–0.76 segment band');
  assert.match(block,/return \[\.68,\.76,\.84\]/,'another row must occupy the 0.68–0.84 band');
  assert.match(block,/return \[\.72,\.8,\.88\]/,'a third row must remain in the 0.72–0.88 band');
  assert.match(block,/tx<100.*ty<100|ty<100.*tx<100/s,'row visibility must be quadrant and coordinate aware');
  assert.match(GAME,/if\(tx<45\|\|tx>155\|\|ty<35\|\|ty>165\)return _CH1_START_PHASE==='smoothing'\?\.7:\.42/,'smoothing perimeter is 0.70 while locked outer stays 0.42');
});

test('toxic integration is broken into low-saturation wet masses and short fragments',()=>{
  const v=readManifest().visualContract;
  assert.equal(v.toxicContinuousChain,false);
  assert.equal(v.toxicWetSoilMasses,3);
  assert.equal(v.toxicShortFragments,5);
  assert.equal(v.toxicSaturationMax,.5);
  assert.equal(v.toxicBase,'brown-black-wet-soil');
});

test('smoothing structural sprites retain readable color separation from the dark ground',()=>{
  const start=GAME.indexOf('function _ch1StartInteriorStructuralAlpha');
  const end=GAME.indexOf('function _pumpCh1StartOuterWarmup',start);
  const block=GAME.slice(start,end);
  const bands=[...block.matchAll(/return \[([^\]]+)\]\[segment\]/g)]
    .flatMap(([,values])=>values.split(',').map(Number));
  assert.equal(bands.length,12,'four asymmetric three-step visibility bands must remain');
  assert.ok(Math.min(...bands)>=.6,`minimum structural alpha ${Math.min(...bands)} must survive dark dialogue/game lighting`);
  assert.ok(Math.max(...bands)<.9,`maximum structural alpha ${Math.max(...bands)} must stay integrated instead of restoring a hard room wall`);
  assert.ok(new Set(bands).size>=7,'visibility bands must retain enough asymmetry to avoid repeated rows');
  assert.match(GAME,/if\(tx<45\|\|tx>155\|\|ty<35\|\|ty>165\)return _CH1_START_PHASE==='smoothing'\?\.7:\.42/,'smoothing perimeter needs a readable 0.70 contribution without changing locked outer');
});

test('stage-0 smoothing applies a guarded RGB lift to structures and corpse tree only',()=>{
  assert.match(GAME,/function _ch1StartStructureTone\(mo\)/);
  const start=GAME.indexOf('function _ch1StartStructureTone');
  const end=GAME.indexOf('function _pumpCh1StartOuterWarmup',start);
  const block=GAME.slice(start,end);
  assert.match(block,/_CH1_START_PHASE!=='smoothing'\|\|!_ch1StartOuterEnabled\(\)/,'tone lift must obey smoothing, stage0, opt-out, and boss guards');
  assert.match(block,/mo\.type==='m_c1tree'/,'corpse tree needs a landmark-specific midtone lift');
  assert.match(block,/\/\^m_c1\(\?:b\|c\[nsew\]\)\//,'only CH1 structural rows may receive the general lift');
  assert.match(block,/brightness\(1\.24\) contrast\(1\.1\) saturate\(1\.06\)/,'corpse tree lift must remain mild and color-preserving');
  assert.match(block,/brightness\(1\.18\) contrast\(1\.08\) saturate\(1\.08\)/,'structural lift must restore source color without global grading');
  assert.match(GAME,/const _ch1Tone=_ch1StartStructureTone\(mo\)/,'object draw path must consume the guarded tone');
  assert.match(GAME,/if\(_drawFilter\)X\.filter=_drawFilter/,'tone lift must use the existing sprite save\/restore path');
});

test('structure helpers execute with locked outer and isolated opt-out contracts',()=>{
  const start=GAME.indexOf('function _ch1StartOuterPropAlpha');
  const end=GAME.indexOf('function _pumpCh1StartOuterWarmup',start);
  const block=GAME.slice(start,end);
  const compile=(phase,enabled)=>new Function('T','_CH1_START_PHASE','_ch1StartOuterEnabled',`${block}\nreturn {alpha:_ch1StartOuterPropAlpha,tone:_ch1StartStructureTone};`)(40,phase,()=>enabled);
  const perimeter={type:'m_c1bn',_hand:true,x:10*40,y:50*40};
  const interior={type:'m_c1bn',_hand:true,x:60*40,y:60*40};
  const tree={type:'m_c1tree',_hand:true,x:102*40,y:90*40};
  const outer=compile('outer',true),smoothing=compile('smoothing',true),disabled=compile('smoothing',false);
  assert.equal(outer.alpha(perimeter),.42,'locked outer perimeter must retain its approved 0.42 alpha');
  assert.equal(outer.alpha(interior),1,'locked outer interior rows remain authored sprites');
  assert.equal(outer.tone(tree),'','locked outer must not receive the smoothing RGB lift');
  assert.equal(smoothing.alpha(perimeter),.7,'smoothing perimeter receives the readability lift');
  assert.ok(smoothing.alpha(interior)>=.6&&smoothing.alpha(interior)<.9,'smoothing interior stays inside the readable asymmetric band');
  assert.match(smoothing.tone(tree),/brightness\(1\.24\)/);
  assert.equal(disabled.alpha(perimeter),1,'opt-out\/boss\/non-stage0 guard returns authored alpha');
  assert.equal(disabled.tone(tree),'','opt-out\/boss\/non-stage0 guard disables tone lift');
});

test('CH1 tone composes with metadata filters inside one balanced save/restore path',()=>{
  assert.match(GAME,/const _metaFilter=_meta&&_meta\.filter&&!_meta\._filterBaked\?_meta\.filter:''/);
  assert.match(GAME,/const _drawFilter=_ch1Tone&&_metaFilter\?_metaFilter\+' '\+_ch1Tone:_ch1Tone\|\|_metaFilter/);
  assert.match(GAME,/if\(_drawFilter\)X\.filter=_drawFilter/);
  assert.match(GAME,/if\(_spriteFx\)X\.restore\(\)/,'sprite effects must restore canvas state after drawing');
});
