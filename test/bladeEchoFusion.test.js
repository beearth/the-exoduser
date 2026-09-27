import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function extract(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,`${name} must exist`);
  const end=source.indexOf('\n}',start);
  assert.ok(end>start);
  return source.slice(start,end+2);
}

test('tracking blade path records distinct points and keeps its launch point',()=>{
  const ctx={};
  vm.runInNewContext(extract('_bladeEchoRecord'),ctx);
  const path=[{x:10,y:20}];
  ctx._bladeEchoRecord(path,15,20);
  ctx._bladeEchoRecord(path,30,20);
  assert.equal(path.length,2);
  assert.deepEqual(JSON.parse(JSON.stringify(path)),[{x:10,y:20},{x:30,y:20}]);
});

test('fused tracking blade can be retriggered during its finish window despite normal cooldown',()=>{
  assert.match(source,/case 'maliceHunt':\s*if\(_bladeEchoTryStart\(\)\)break/);
  assert.match(source,/bladeEcho:\['maliceHunt','bladeDash'\]/);
  assert.match(source,/if\(dead\)\{_bladeEchoFinish\(p\);continue\}/);
  assert.match(source,/if\(!hit\)pProjs\[w\+\+\]=p;else\{_bladeEchoFinish\(p\);_recyclePProj\(p\)\}/);
});

test('second press follows the blade path and damages each crossed enemy once',()=>{
  const enemy={x:30,y:0,r:12,alive:true};
  const hits=[];
  const P={x:100,y:100,r:12,hp:100,s:'idle',skills:{bladeDash:1},iframes:0,
    _bladeEchoReady:{path:[{x:0,y:0},{x:18,y:0},{x:36,y:0},{x:54,y:0}],damage:45,until:130}};
  const ctx={P,_gameFrame:110,_now:1000,EL:{L:3},Math,Set,
    _isFused:key=>key==='bladeEcho',canMv:()=>true,_L:ko=>ko,
    SFX:{charge(){}},playSample(){},_r:x=>x,shake(){},addTxt(){},
    poolPart(){},spawnElecBurst(){},_addBlastLight(){},doHitFlash(){},_addImpact(){},
    shQuery:()=>[enemy],dst:(x,y,ex,ey)=>Math.hypot(x-ex,y-ey),
    hurtE:(e,d)=>hits.push([e,d]),addParts(){}};
  vm.runInNewContext(extract('_bladeEchoTryStart')+'\n'+extract('_tickBladeEcho'),ctx);
  assert.equal(ctx._bladeEchoTryStart(),true);
  assert.equal(P.s,'bladeEcho');
  ctx._tickBladeEcho(1);
  assert.deepEqual([P.x,P.y,P.s],[54,0,'idle']);
  assert.equal(hits.length,1);
  assert.equal(hits[0][1],45);
  assert.equal(P._bladeEchoReady,null);
  assert.ok(P._bladeEchoAfterglow?.trail.length>=2,'trail should linger after the dash');
  assert.ok(P._bladeEchoAfterglow.until>ctx._now,'afterglow should remain visible');
});

test('expired finish window does not start the echo',()=>{
  const P={x:100,y:100,r:12,hp:100,s:'idle',skills:{bladeDash:1},
    _bladeEchoReady:{path:[{x:0,y:0},{x:18,y:0}],damage:45,until:30}};
  const ctx={P,_gameFrame:31,_isFused:()=>true,canMv:()=>true};
  vm.runInNewContext(extract('_bladeEchoTryStart'),ctx);
  assert.equal(ctx._bladeEchoTryStart(),false);
  assert.deepEqual([P.x,P.y,P.s],[100,100,'idle']);
});

test('the currently active demo build permits forging Blade Chase',()=>{
  const match=source.match(/const _DEMO_FUSE_ALLOWED=new Set\(\[([^\]]+)\]\)/);
  assert.ok(match);
  assert.ok(match[1].includes("'bladeEcho'"));
});

test('blade chase draws a bright layered flash trail through its recorded positions',()=>{
  const strokes=[];
  const ctx={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){strokes.push({width:this.lineWidth,color:this.strokeStyle,alpha:this.globalAlpha})},arc(){},ellipse(){throw Error('oval blobs are not supported by the GPU renderer')},fill(){}};
  const run={trail:[{x:0,y:0},{x:18,y:6},{x:36,y:12}],index:3};
  const vmContext={};
  vm.runInNewContext(extract('_drawBladeEchoVfx'),vmContext);
  vmContext._drawBladeEchoVfx(ctx,run,36,12,100);
  assert.ok(strokes.some(x=>x.width>=16&&x.color.includes('44')),'outer cyan glow');
  assert.ok(strokes.some(x=>x.width<=4&&x.color.includes('fff')),'white-hot core');
  assert.ok(strokes.length>4,'directional afterimage streaks');
});
