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

// fbfff89: 검토한 상자 비행/수거 연결만 되돌려 나머지 함수 원문을 비교한다.
const reviewedChestAdapters={
  "update": [
    [
      "  _tickChestDrops(_dtSp/60);\n",
      ""
    ],
    [
      "        const landings=_chestLootPositions(it.x,it.y,cnt,(x,y)=>canMv(x,y,18),worldItems.filter(w=>w.type==='item'&&!w.picked));\n",
      ""
    ],
    [
      "          const jumpHeight=Math.random(),jumpTime=Math.random(); // Preserve the original two position RNG calls.\n          _wiPush({x:landings[ci].x,y:landings[ci].y,type:'item',item,picked:false,_chestDrop:{fromX:it.x,fromY:it.y-35,age:0,delay:.55+ci*.06,duration:.42+jumpTime*.08,height:38+jumpHeight*14}});",
      "          _wiPush({x:it.x+(Math.random()-.5)*50,y:it.y+(Math.random()-.5)*50,type:'item',item,picked:false});"
    ],
    [
      "if(it.type!=='item'||it.picked||it._chestDrop)continue;",
      "if(it.type!=='item'||it.picked)continue;"
    ]
  ],
  "draw": [
    [
      "      const flightPose=_chestDropPose(it);if(!flightPose.visible)continue;\n      X.save();X.translate(flightPose.x-it.x,flightPose.y-it.y);\n",
      ""
    ],
    [
      "if(_beamTier>0&&!it._chestDrop){",
      "if(_beamTier>0){"
    ],
    [
      "      X.restore();\n    }\n    else if(it.type==='chest'){",
      "    }\n    else if(it.type==='chest'){"
    ]
  ]
};
function restoreReviewedChestAdapters(source,name){
  for(const [from,to] of reviewedChestAdapters[name]||[]){
    const count=source.split(from).length-1;
    assert.equal(count,name==='update'&&from.includes('it.picked||it._chestDrop')?2:1,'reviewed chest adapter drift: '+name);
    source=source.split(from).join(to);
  }
  return source;
}

// 767762: 승인된 상자 몸통/선분 연결만 검증·복원한다. 함수 전체를 검사에서 제외하지 않는다.
const reviewedChestCollisionFunctions={
  "canMv": {
    "current": "function canMv(x,y,r,fromX=x,fromY=y,ignoreChest=null){return!isW(x-r,y-r)&&!isW(x+r,y-r)&&!isW(x-r,y+r)&&!isW(x+r,y+r)&&!_chestBlocks(x,y,r,fromX,fromY,ignoreChest)}",
    "previous": "function canMv(x,y,r){return!isW(x-r,y-r)&&!isW(x+r,y-r)&&!isW(x-r,y+r)&&!isW(x+r,y+r)}"
  },
  "canMvBlink": {
    "current": "function canMvBlink(x,y,r,fromX=x,fromY=y){return!isW(x-r,y-r,1)&&!isW(x+r,y-r,1)&&!isW(x-r,y+r,1)&&!isW(x+r,y+r,1)&&!_chestBlocks(x,y,r,fromX,fromY)}",
    "previous": "function canMvBlink(x,y,r){return!isW(x-r,y-r,1)&&!isW(x+r,y-r,1)&&!isW(x-r,y+r,1)&&!isW(x+r,y+r,1)}"
  }
};
const reviewedChestMovementCalls=[
  [
    "canMvBlink(_nx,_ny,P.r,P.x,P.y)",
    "canMvBlink(_nx,_ny,P.r)",
    1
  ],
  [
    "canMv(nx,ny,P.r,P.x,P.y)",
    "canMv(nx,ny,P.r)",
    2
  ],
  [
    "if(canMv(nx,P.y,P.r,P.x,P.y))P.x=nx;if(canMv(P.x,ny,P.r,P.x,P.y))P.y=ny;",
    "if(canMv(nx,P.y,P.r))P.x=nx;if(canMv(P.x,ny,P.r))P.y=ny;",
    4
  ],
  [
    "canMv(x,y,18,x,y,it)",
    "canMv(x,y,18)",
    1
  ]
];
function restoreReviewedChestCollision(source,name){
  const collision=reviewedChestCollisionFunctions[name];
  if(collision){assert.equal(source,collision.current,'reviewed chest collision drift: '+name);return collision.previous;}
  if(name==='update')for(const [from,to,count]of reviewedChestMovementCalls){
    assert.equal(source.split(from).length-1,count,'reviewed chest movement drift');
    source=source.split(from).join(to);
  }
  return source;
}

test('native combat/save/AI source is exact outside reviewed environment and chest adapters',()=>{
  const git=process.platform==='win32'?'C:/Program Files/Git/cmd/git.exe':'git';
  // 검수된 전투 표현 후보를 기준으로 3D 병합이 새 feel 함수까지 보존하는지 검사한다.
  const baseline=execFileSync(git,['show','0206fb14df311c1b911ae76ee2921082f7787a10:game.html'],{encoding:'utf8',maxBuffer:12e6,windowsHide:true});
  const functions=s=>new Map(acorn.parse(s,{ecmaVersion:'latest'}).body.filter(n=>n.type==='FunctionDeclaration').map(n=>[n.id.name,s.slice(n.start,n.end)]));
  const before=functions(main(baseline)),after=functions(main(game));
  // 최신 main의 와이드 원화 두 callback은 검토한 upstream byte에 고정한다.
  const upstream=functions(main(execFileSync(git,['show','7ba04c4f5757cf86b6289abef4206dff62d841c8:game.html'],{encoding:'utf8',maxBuffer:12e6,windowsHide:true})));
  const approvedPresentation=new Set(['_getCutsceneImg','_renderIntroCutscene','_showNextDiffPop']);
  const adapterHooks=new Set(['genFromTemplate','initStage','_syncDruidFinaleMouse','loop']);
  let checked=0;
  for(const [name,source]of before)if(!adapterHooks.has(name)){
    // Optional environment hooks: ground light, original-object relief, foliage.
    // Actor/VFX/input/save declarations and the rest of draw remain byte-exact.
    const restored=restoreReviewedChestAdapters(restoreReviewedChestCollision(after.get(name),name),name)
      .replace(/^  const _web3dAmbient=G.stage===0&&!G._bossArena&&window\._Web3DLivingLayer\?\.snapshot\(\)\.enabled;\r?\n/m,'')
      .replace('if(_lightCvs&&!_web3dAmbient)','if(_lightCvs)')
      .replace('X.globalAlpha=_web3dAmbient?0:_vAlpha','X.globalAlpha=_vAlpha')
      .replace('if(_ATMDBG.vig&&!(G.stage===0&&!G._bossArena&&window._Web3DLivingLayer?.snapshot().enabled))','if(_ATMDBG.vig)');
    // 상자 표시 소비자만 승인: 전체 draw/전투/저장 함수는 계속 원문 대조한다.
    if(name==='draw')assert.equal(restored.split('if(window._chest3d?.isShowing?.(it)){').length-1,1);
    const current=name==='draw'?restored
      .replace('if(window._chest3d?.isShowing?.(it)){','if(window._chest3d?.active){')
      .replace(/^  window\._Web3DLivingLayer\?\.(?:draw|surface|ground)(?:\?\.)?\(X,.*\);\r?\n/gm,'')
      .replace(/^    const _livingRelief=window\._Web3DLivingLayer\?\.beginObject\(X,mo,_OBJ_META\[mo.type\]\);\r?\n/m,'')
      .replace(/^    if\(_livingRelief\)X.restore\(\);\r?\n/m,''):restored;
    assert.ok(current===(approvedPresentation.has(name)?upstream.get(name):source),name+' changed');checked++;
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
