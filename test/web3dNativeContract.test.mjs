import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const acorn=require(require.resolve('acorn',{paths:[process.cwd(),'G:/exoduser']}));
const game=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const mapScript=fs.readFileSync(new URL('../web3d/bridge-map.js',import.meta.url),'utf8');
const main=html=>html.slice(html.indexOf('<script>\n// ┌')+9).split('</script>')[0];

test('all native combat/save/AI declarations retain their exact baseline source',()=>{
  const git=process.platform==='win32'?'C:/Program Files/Git/cmd/git.exe':'git';
  // R9 착수 때 정상 병합한 main. 승인된 보스/정예·방어 계산 수정도
  // 이 SHA의 실제 함수 byte로 보호하며 검사에서 제외하지 않는다.
  const baseline=execFileSync(git,['show','e0e6716c228f8ccfa5ad5834a2bce0a7d2aa3216:game.html'],{encoding:'utf8',maxBuffer:12e6,windowsHide:true});
  const functions=s=>new Map(acorn.parse(s,{ecmaVersion:'latest'}).body.filter(n=>n.type==='FunctionDeclaration').map(n=>[n.id.name,s.slice(n.start,n.end)]));
  const before=functions(main(baseline)),after=functions(main(game));
  let checked=0;
  for(const [name,source]of before){
    // Optional environment hooks: ground light, original-object relief, foliage.
    // Actor/VFX/input/save declarations and the rest of draw remain byte-exact.
    const normalise=value=>value
      .replace('window._Web3DLivingLayer?.snapshot().enabled?window._Web3DLivingLayer.cleanHill(tex):tex','tex')
      .replace(/^  const _web3dAmbient=G.stage===0&&!G._bossArena&&window\._Web3DLivingLayer\?\.snapshot\(\)\.enabled;\r?\n/m,'')
      .replace('if(_lightCvs&&!_web3dAmbient)','if(_lightCvs)')
      .replace('X.globalAlpha=_web3dAmbient?0:_vAlpha','X.globalAlpha=_vAlpha')
      .replace('if(_ATMDBG.vig&&!(G.stage===0&&!G._bossArena&&window._Web3DLivingLayer?.snapshot().enabled))','if(_ATMDBG.vig)')
      .replace(/^    if\(window\._Web3DLivingLayer\?\.deferObject\?\.\(mo\)\)continue;\r?\n/m,'')
      .replace(/^  window\._Web3DLivingLayer\?\.front\?\.\(X,.*\);\r?\n/m,'')
      .replace(/^    window\._Web3DLivingLayer\?\.heroRim\?\.\(X,P\._sa,SpriteAnimator,_pFlip,_pDk,_apDead,_gwA\);\r?\n/m,'');
    const stripDraw=value=>value
      .replace(/^  window\._Web3DLivingLayer\?\.(?:draw|surface|ground)(?:\?\.)?\(X,.*\);\r?\n/gm,'')
      .replace(/^    const _livingRelief=window\._Web3DLivingLayer\?\.beginObject\(X,mo,_OBJ_META\[mo.type\]\);\r?\n/m,'')
      .replace(/^    if\(_livingRelief\)X.restore\(\);\r?\n/m,'');
    const current=normalise(after.get(name)),expected=normalise(source);
    assert.equal(name==='draw'?stripDraw(current):current,name==='draw'?stripDraw(expected):expected,name+' changed');checked++;
  }
  assert.ok(checked>500);
});

test('retired comparison geometry additionally requires the explicit legacy flag',()=>{
  for(const search of ['', '?r3d=0&r3dScene=bridge','?r3d=1','?r3dScene=bridge','?r3d=1&r3dScene=bridge']){
    const window={};vm.runInNewContext(mapScript,{window,URLSearchParams,location:{search}});assert.equal(window._Web3DTrialMap,undefined);
  }
  const window={};vm.runInNewContext(mapScript,{window,URLSearchParams,location:{search:'?r3d=1&r3dScene=bridge&r3dLegacy=1'}});
  assert.equal(window._Web3DTrialMap.mw,200);
});

test('special magic projectiles retain the native rainbow and dark-sphere drawing paths',()=>{
  const adapter=game.slice(game.lastIndexOf('const read=()=>'));
  assert.match(adapter,/p\.blackBean\|\|p\.blueBean/);
  assert.match(adapter,/_drawClassicRainbow\(p,1,/);
  assert.match(adapter,/_drawDarkSphere\(p,1,/);
});

test('the repaired bridge has a continuous native floor between its banks',()=>{
  const {template,walkable}=JSON.parse(fs.readFileSync(new URL('../assets/web3d/bridge-map.json',import.meta.url),'utf8'));
  const grid=[];for(let i=0;i<template.tileRLE.length;i+=2)for(let j=0;j<template.tileRLE[i+1];j++)grid.push(template.tileRLE[i]);
  assert.equal(grid.length,template.mw*template.mh);
  assert.equal(grid.filter(c=>c===1).length,walkable);
  for(let y=132;y<=167;y++)assert.equal(grid[y*200+100],1,'bridge row '+y);
});
