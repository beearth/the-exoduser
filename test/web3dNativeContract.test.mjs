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
  // 검수된 전투 표현 후보를 기준으로 3D 병합이 새 feel 함수까지 보존하는지 검사한다.
  const baseline=execFileSync(git,['show','0206fb14df311c1b911ae76ee2921082f7787a10:game.html'],{encoding:'utf8',maxBuffer:12e6,windowsHide:true});
  const functions=s=>new Map(acorn.parse(s,{ecmaVersion:'latest'}).body.filter(n=>n.type==='FunctionDeclaration').map(n=>[n.id.name,s.slice(n.start,n.end)]));
  const before=functions(main(baseline)),after=functions(main(game));
  const adapterHooks=new Set(['genFromTemplate','initStage','_syncDruidFinaleMouse','loop']);
  let checked=0;
  for(const [name,source]of before)if(!adapterHooks.has(name)){
    // Optional environment hooks: ground light, original-object relief, foliage.
    // Actor/VFX/input/save declarations and the rest of draw remain byte-exact.
    const current=name==='draw'?after.get(name)
      .replace(/^  window\._Web3DLivingLayer\?\.(?:draw|surface)\(X,.*\);\r?\n/gm,'')
      .replace(/^    const _livingRelief=window\._Web3DLivingLayer\?\.beginObject\(X,mo,_OBJ_META\[mo.type\]\);\r?\n/m,'')
      .replace(/^    if\(_livingRelief\)X.restore\(\);\r?\n/m,''):after.get(name);
    assert.ok(current===source,name+' changed');checked++;
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
