// ANIMVFX foot-shadow-anchor: readonly actual-source slices; no browser/GPU/pixels.
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = path => fs.readFileSync(root + '/' + path, 'utf8');
const executionStartedAt=new Date().toISOString();
const protectedPaths=['game.html','game-easy-test.html','server.cjs','node-main.js','index.html',
  'img/atlas_ch1_8dir.json','img/atlas_ch1_8dir_walk.json','img/ch1_8dir/manifest.json',
  'tools/team-followup-20261002/project-teams/ANIMVFX/task.md'];
const inputHashes=Object.fromEntries(protectedPaths.map(p=>[p,sha(fs.readFileSync(root+'/'+p))]));
function gitSnapshot(){
  const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
  const status=spawnSync('git',['status','--porcelain=v1','-z'],{cwd:root,encoding:'utf8'});
  expect(head.status===0&&status.status===0,'readonly Git snapshot');
  return {observedAt:new Date().toISOString(),head:head.stdout.trim(),changes:status.stdout.split('\0').filter(Boolean).length};
}
const startSnapshot=gitSnapshot();
const idle = JSON.parse(read('img/atlas_ch1_8dir.json'));
const walk = JSON.parse(read('img/atlas_ch1_8dir_walk.json'));
const inventory = JSON.parse(read('img/ch1_8dir/manifest.json'));
const rows = [], slices = {}, cases = [], assets = [], patches = [];
function check(id, action) {
  try { action(); rows.push({ id, status: 'PASS' }); }
  catch (e) { rows.push({ id, status: 'FAIL', reason: e.message }); }
}
function expect(value, reason) { if (!value) throw new Error(reason); }
function close(a, b, tolerance = 1e-4) { expect(Math.abs(a - b) <= tolerance, `${a} != ${b}`); }
function bounded(source, start, end) {
  const at = source.indexOf(start);
  expect(at >= 0 && source.indexOf(start, at + 1) < 0, `nonunique start: ${start}`);
  const stop = source.indexOf(end, at + start.length);
  expect(stop > at, `missing end: ${end}`);
  return { at, text: source.slice(at, stop) };
}
function fn(source, name) {
  const start = source.indexOf('function ' + name + '(');
  expect(start >= 0, `function missing: ${name}`);
  const end = source.indexOf('\n}', start);
  return source.slice(start, end + 2);
}
function hunk(source, oldText, newText, lineDelta = 0) {
  const at = source.indexOf(oldText);
  expect(at >= 0 && source.indexOf(oldText, at + 1) < 0, 'patch context nonunique');
  const line = source.slice(0, at).split('\n').length;
  const oldLines = oldText.split('\n'), newLines = newText.split('\n');
  const dp=Array.from({length:oldLines.length+1},()=>Array(newLines.length+1).fill(0));
  for(let i=oldLines.length-1;i>=0;i--)for(let j=newLines.length-1;j>=0;j--)
    dp[i][j]=oldLines[i]===newLines[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0;const diff=[];
  while(i<oldLines.length||j<newLines.length){
    if(i<oldLines.length&&j<newLines.length&&oldLines[i]===newLines[j]){diff.push(' '+oldLines[i++]);j++;}
    else if(i<oldLines.length&&(j===newLines.length||dp[i+1][j]>=dp[i][j+1]))diff.push('-'+oldLines[i++]);
    else diff.push('+'+newLines[j++]);
  }
  return `@@ -${line},${oldLines.length} +${line+lineDelta},${newLines.length} @@\n`+diff.join('\n')+'\n';
}
function remember(file, id, source, text) {
  slices[file + ':' + id] = { sha256: sha(text), line: source.slice(0, source.indexOf(text)).split('\n').length, bytes: Buffer.byteLength(text) };
}
function correctedQueue(queue) {
  return queue.replace('  _ens8GLCpu[_o]=x;_ens8GLCpu[_o+1]=y;',
    '  const _m8=_mat();if(_m8[1]!==0||_m8[2]!==0)return false;\n' +
    '  const _wx8=x-VW*.5+G.cam.x,_wy8=y-VH*.5+G.cam.y,_ss8=1/_ssaa;\n' +
    '  _ens8GLCpu[_o]=(_m8[0]*_wx8+_m8[4])*_ss8;_ens8GLCpu[_o+1]=(_m8[3]*_wy8+_m8[5])*_ss8;'
  ).replace('  _ens8GLCpu[_o+7]=dw;_ens8GLCpu[_o+8]=dh;',
    '  _ens8GLCpu[_o+7]=dw*_m8[0]*_ss8;_ens8GLCpu[_o+8]=dh*_m8[3]*_ss8;');
}
check('metadata-idle-grid40', () => {
  expect(idle.cell === 256 && idle.cols === 8 && idle.rows === 5 && idle.total === 40, 'idle dimensions');
  expect(Object.keys(idle.mobs).length === 40, 'idle count');
  for (const m of Object.values(idle.mobs)) expect(m.col === m.idx % 8 && m.row === Math.floor(m.idx / 8), 'idle slot');
});
check('metadata-walk39-four-frames', () => {
  expect(walk.cell === 256 && walk.cols === 8 && walk.rows === 5 && walk.framesPerMob === 4, 'walk layout');
  expect(Object.keys(walk.mobs).length === 39 && !walk.mobs.skinless_hound, 'hound idle fallback');
  for (const [key, m] of Object.entries(walk.mobs)) expect(JSON.stringify(m) === JSON.stringify(idle.mobs[key]), 'walk slot differs');
});
check('metadata-no-anatomical-anchor', () => {
  const keys = obj => Object.entries(obj).flatMap(([k, v]) => [k, ...(v && typeof v === 'object' ? keys(v) : [])]);
  expect(!keys({ idle, walk }).some(k => /foot|feet|pivot|anchor|offset/i.test(k)), 'unexpected foot contract');
});
for (const direction of idle.directions) for (const moving of [false, true]) {
  const path = `img/atlas_ch1_8dir_${moving ? 'walk_' : ''}${direction.replaceAll('-', '_')}.png`;
  const fd = fs.openSync(root + '/' + path, 'r'), header = Buffer.alloc(33);
  try { fs.readSync(fd, header, 0, header.length, 0); } finally { fs.closeSync(fd); }
  const width = header.readUInt32BE(16), height = header.readUInt32BE(20);
  assets.push({ path, width, height, headerBytes: 33, headerSha256: sha(header), pixelDecode: false });
  check('png-header:' + path, () => {
    expect(header.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'not PNG');
    expect(width === (moving ? 8192 : 2048) && height === 1280, 'PNG dimensions');
  });
}

const configs = [
  { id: 'base', cam: { x: 100, y: 200 }, zoom: 1, ssaa: 1, sx: 0, sy: 0 },
  { id: 'fractional-camera', cam: { x: 100.25, y: 200.75 }, zoom: 1, ssaa: 1, sx: 0, sy: 0 },
  { id: 'zoom062', cam: { x: 100, y: 200 }, zoom: .62, ssaa: 1, sx: 0, sy: 0 },
  { id: 'ssaa15', cam: { x: 100, y: 200 }, zoom: 1, ssaa: 1.5, sx: 0, sy: 0 },
  { id: 'ssaa2', cam: { x: 100, y: 200 }, zoom: 1, ssaa: 2, sx: 0, sy: 0 },
  { id: 'shake', cam: { x: 100, y: 200 }, zoom: 1, ssaa: 1, sx: 4, sy: -3 },
  { id: 'combined', cam: { x: 100.25, y: 200.75 }, zoom: .62, ssaa: 1.5, sx: 4, sy: -3 }
];

function execute(source, corrected, cfg, options = {}) {
  const queueOriginal = fn(source, '_queueEnemy8DirInstanced');
  const queue = corrected ? correctedQueue(queueOriginal) : queueOriginal;
  const bodyStart = '      let _eDrew=!!_ensGLQueued;';
  let body = bounded(source, bodyStart, '\n    }\n    // ═══ 근접 공격').text;
  if (corrected) body = body.replace('        if(_a8){', '        if(_a8&&!_ensGLQueued){');
  const shadow = bounded(source, '    if(!_ensGLQueued&&e.alive&&sa>0.1) {', '\n    // ═══ 몬스터 오라').text;
  const matrix = bounded(source, 'let _mats=[[1,0,0,1,0,0]];', '\n// ── 공통: 텍스트 아틀라스').text;
  const worldStart = source.indexOf('  const _ez=(_EDITOR_MODE&&G._edZoom)?G._edZoom:1;');
  const worldEnd = source.indexOf('\n', source.indexOf('  X.translate(Math.round(VW/2-G.cam.x+sx)', worldStart));
  const world = source.slice(worldStart, worldEnd);
  const e = { alive: true, ib: false, etype: 2, x: 340, y: 420, r: options.radius || 20,
    _mob8dir: true, _mobCh: 1, _mob8Col: options.col ?? 7, _mob8Row: options.row ?? 4,
    facing: Math.PI / 2, _walkDist: options.walkDist ?? 384, _isMoving: options.moving !== false,
    _hitFlash: options.hitFlash || 0, stunned: 0, reviveIframes: 0, _spawnT: 0, s: 'idle' };
  const dirs = {}, walkDirs = {};
  for (const d of idle.directions) {
    dirs[d] = { ready: true, img: { kind: 'idle', key: d, width: 2048, height: 1280 } };
    walkDirs[d] = { ready: true, img: { kind: 'walk', key: d, width: 8192, height: 1280 } };
  }
  const context = { config: cfg, inputEnemy: e, options,
    _ch8Atlas: { 1: { meta: idle, dirs, walkDirs, walkMeta: { ...walk, _idxSet: new Set(Object.values(walk.mobs).map(m => m.idx)) } } },
    performance: { now: () => 0 } };
  // The fixture records calls/corners; it never creates Canvas, WebGL, DOM or images.
  const driver = `
    const _ENS_GL_MAX=512,_ENS_GL_STRIDE=9,_ENS8_GL_GROUPS=16,_ENS8_GL_MAX=options.capacity??1024;
    const _ENS8_GL_DIRS=${JSON.stringify(idle.directions)},_MOB8_TOTAL=40,_MOB8_COLS=8,_PI2=Math.PI*2;
    const _ens8GLCpu=new Float32Array(16*512*9),_ens8GLCounts=new Uint16Array(16),_ens8GLImgs=new Array(16);
    let _ens8GLTotal=0,_ensGLCount=0,_dbgEnsGL=0,_dbgEns8GL=0,_dbgEns8GLDraws=0;
    const ens=[inputEnemy],G={cam:config.cam,_camZoom:config.zoom,stage:0},VW=1280,VH=800,P={hp:0};
    const uniforms=[],drawCalls=[];
    const GL={enable(){},blendFunc(){},useProgram(){},bindVertexArray(){},bindBuffer(){},uniform1i(){},
      uniform2f(name,x,y){uniforms.push({name,value:[x,y]})},bufferSubData(){},activeTexture(){},bindTexture(){},
      drawArraysInstanced(mode,start,count,instances){drawCalls.push(instances)}};
    const _useGL=options.gl!==false,_ensGLProg={},_atlasEReady=false,_atlasE=null,_dsEnsOrder=[];
    const _ensGLVao={},_ensGLInstVBO={},_ensGLUTex='uAtlas',_ensGLURes='uRes',_glMainProg=null,_DCP={on:false};
    const C={width:VW*config.ssaa,height:VH*config.ssaa};
    const _ssaa=config.ssaa,_EDITOR_MODE=false,sx=config.sx,sy=config.sy,sa=1,_now=0;
    const captures=[];let stage='prep',_usedSpr=false;
    ${matrix}
    const X={globalAlpha:1,save:_pushMat,restore:_popMat,translate:_translateMat,scale:_scaleMat,
      beginPath(){},fill(){},ellipse(x,y,rx,ry){captures.push({stage,kind:'ellipse',center:[..._tp(x,y)],radius:[rx*_mat()[0],ry*_mat()[3]]})},
      drawImage(img,...a){const b=a.length===8?a.slice(4):a;const q=[..._tQuad(...b)];captures.push({stage,kind:img.kind||'shadow',alpha:X.globalAlpha,source:a.length===8?a.slice(0,4):null,quad:q,center:[(q[0]+q[4])/2,(q[1]+q[5])/2],size:[q[2]-q[0],q[5]-q[3]]})}};
    function _dsEnabled(){return !!options.depth;}function _dsCmpY(a,b){return a.y-b.y;}
    function _dsBlobStamp(){return {kind:'shadow'};}
    function _drawEliteAuraTelegraph(){} function _drawChargeTele(){} function _setBlend(){}
    function _flush(){} function _getTex(img){return img;} function _drawEnemyInstanced(){}
    function dst2(x,y,a,b){return (x-a)**2+(y-b)**2;}
    function _drawCh1StartMediumEyeMass(){throw new Error('out-of-scope medium path');}
    ${fn(source, '_mobFacingDir8')}
    ${fn(source, '_dsBlob')}
    ${queue}
    ${fn(source, '_drawEnemy8DirInstanced')}
    ${fn(source, '_prepEnemyInstanced')}
    ${world}
    if(options.rotate)_rotateMat(options.rotate);
    _prepEnemyInstanced(-10000,10000,-10000,10000,0,45);
    const expectedCenter=[..._tp(inputEnemy.x,inputEnemy.y)],baseSize=Math.max(inputEnemy.r*7,80),m=[..._mat()];
    const instances=[];for(let bucket=0;bucket<16;bucket++)for(let i=0;i<_ens8GLCounts[bucket];i++){
      const off=(bucket*512+i)*9,v=[..._ens8GLCpu.slice(off,off+9)];
      const resolution=uniforms.find(u=>u.name==='uRes').value;
      instances.push({bucket,kind:_ens8GLImgs[bucket].kind,center:v.slice(0,2),uv:v.slice(2,6),size:v.slice(7),packedAlpha:v[6],
        deviceCenter:[v[0]*C.width/resolution[0],v[1]*C.height/resolution[1]],
        deviceSize:[v[7]*C.width/resolution[0],v[8]*C.height/resolution[1]]});}
    const e=inputEnemy,_ensGLQueued=e._ensGLMode||0,_dsOn=!!options.depth;
    stage='fallback-shadow';${shadow}
    stage='body';${body}
    globalThis.output={instances,captures,expectedCenter,expectedSize:[baseSize*m[0],baseSize*m[3]],mode:e._ensGLMode,matrix:m,uniforms,drawCalls};
  `;
  vm.runInNewContext(driver, context, { timeout: 1000 });
  return context.output;
}

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = read(file);
  const queue = fn(source, '_queueEnemy8DirInstanced');
  const body = bounded(source, '      let _eDrew=!!_ensGLQueued;', '\n    }\n    // ═══ 근접 공격').text;
  for (const [id, text] of Object.entries({ queue, prep: fn(source, '_prepEnemyInstanced'), body,
    shadow: bounded(source, '    if(!_ensGLQueued&&e.alive&&sa>0.1) {', '\n    // ═══ 몬스터 오라').text,
    blob: fn(source, '_dsBlob'), draw: fn(source, '_drawEnemy8DirInstanced'),
    matrix: bounded(source, 'let _mats=[[1,0,0,1,0,0]];', '\n// ── 공통: 텍스트 아틀라스').text,
    shader: fn(source, '_initEnemyInstancing') })) remember(file, id, source, text);
  check(file+':resolution-and-viewport-contract',()=>{
    const shader=fn(source,'_initEnemyInstancing');
    expect(shader.includes('vec2 ndc=sp/uRes*2.0-1.0;'), 'shader resolution changed');
    expect(source.includes('GL.viewport(0,0,C.width,C.height)'), 'viewport contract');
    expect(source.includes('GL.uniform2f(_uR,C.width,C.height)'), 'proxy resolution');
    expect(source.includes(file==='game.html'?'  _ssaa=1;':'  _ssaa=_MAP_QA_HIDPI?Math.min(Math.max(devicePixelRatio||1,1),2):1;'), 'current SSAA contract');
  });
  const queueAfter = correctedQueue(queue);
  const bodyOld = '        // 8dir 아틀라스 렌더\n        const _a8=_ch8Atlas[1];\n        if(_a8){\n' +
    '          if(P){const _fdM2=dst2(P.x,P.y,e.x,e.y);if(_fdM2<640000&&P.hp>0)e.facing=Math.atan2(P.y-e.y,P.x-e.x)}\n' +
    '          const _baseSz=Math.max(e.r*7,80);\n          const _dk8=_mobFacingDir8(e.facing);';
  const bodyNew = bodyOld.replace('if(_a8){', 'if(_a8&&!_ensGLQueued){');
  patches.push(`diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n` + hunk(source, queue, queueAfter) + hunk(source, bodyOld, bodyNew, 2));
  for (const cfg of configs) check(file + ':' + cfg.id, () => {
    const before = execute(source, false, cfg), after = execute(source, true, cfg);
    const beforeBody = before.captures.filter(c => c.stage === 'body'), afterBody = after.captures.filter(c => c.stage === 'body');
    expect(before.instances.length === 2 && beforeBody.length === 2, 'RED duplicate not reproduced');
    expect(after.instances.length === 2 && afterBody.length === 0, 'candidate duplicate guard');
    for (const instance of after.instances) {
      instance.deviceCenter.forEach((n,i) => close(n, after.expectedCenter[i]));
      instance.deviceSize.forEach((n,i) => close(n, after.expectedSize[i]));
    }
    beforeBody[0].center.forEach((n,i) => close(n, before.expectedCenter[i], .5));
    const mismatch = before.instances[0].deviceCenter.some((n,i) => Math.abs(n-before.expectedCenter[i]) > .001) ||
      before.instances[0].deviceSize.some((n,i) => Math.abs(n-before.expectedSize[i]) > .001);
    expect(mismatch === !['base','ssaa15','ssaa2'].includes(cfg.id), 'RED world-transform boundary');
    expect(JSON.stringify(before.instances.map(i=>i.uv)) === JSON.stringify(after.instances.map(i=>i.uv)), 'UV changed');
    cases.push({ file, scenario: cfg.id, beforeGL: before.instances[0], worldCenter: before.expectedCenter,
      expectedSize: before.expectedSize, afterGL: after.instances[0], beforeBodyCalls: beforeBody.length,
      afterBodyCalls: afterBody.length, originalTransformMismatch: mismatch,uniforms:after.uniforms,drawCalls:after.drawCalls });
  });
  for (const [id, options] of Object.entries({ 'gl-off': {gl:false}, 'capacity-full': {capacity:0},
    'hound-no-walk': {col:1,row:3}, 'idle-only': {moving:false}, 'minimum-size': {radius:5}, 'depth-shadow': {depth:true} }))
    check(file + ':' + id, () => {
      const before=execute(source,false,configs[0],options),after=execute(source,true,configs[0],options);
      if (options.gl===false || options.capacity===0) {
        expect(after.instances.length===0 && after.mode===0, 'fallback gate');
        expect(JSON.stringify(before.captures)===JSON.stringify(after.captures), 'fallback altered');
      } else {
        expect(after.captures.every(c=>c.stage!=='body'), 'queued body duplicated');
        expect(before.instances.length===after.instances.length, 'instance count changed');
        const a=before.captures.filter(c=>c.stage==='prep'),b=after.captures.filter(c=>c.stage==='prep');
        expect(JSON.stringify(a)===JSON.stringify(b), 'shadow policy changed');
      }
    });
  check(file+':nonaxis-fallback',()=>{
    const after=execute(source,true,configs[0],{rotate:.1});
    expect(after.instances.length===0&&after.mode===0, 'matrix guard failed');
    expect(after.captures.filter(c=>c.stage==='body').length===2,'fallback body missing');
    expect(after.captures.filter(c=>c.stage==='fallback-shadow').length===1,'fallback shadow missing');
  });
  check(file+':existing-hitflash-source-contract-preserved',()=>{
    for(const hitFlash of [.5,3,6,12]){
      const before=execute(source,false,configs[0],{hitFlash}),after=execute(source,true,configs[0],{hitFlash});
      const a=before.captures.filter(c=>c.stage==='prep'),b=after.captures.filter(c=>c.stage==='prep');
      expect(JSON.stringify(a)===JSON.stringify(b),'hitflash or shadow changed');
      const flash=b.find(c=>c.kind==='idle'),t=Math.min(1,hitFlash/6);
      if(file==='game.html'){
        expect(flash,'main GL flash missing');close(flash.alpha,t*.8);close(flash.size[0],140*(1+.05*t),1);
      }else{
        expect(!flash&&!fn(source,'_prepEnemyInstanced').includes('_hitFlash'),'easy GL flash contract changed');
      }
    }
  });
  check(file + ':frame-boundaries', () => {
    for (const distance of [0,127,128,255,256,383,384,511,512]) {
      const result=execute(source,true,configs[0],{walkDist:distance});
      const expected=(7*4+Math.trunc(distance/128)%4)*256/8192;
      close(result.instances.find(i=>i.kind==='walk').uv[0],expected);
    }
  });
  check(file + ':metadata-loader-authority', () => {
    const loader=fn(source,'_load8DirAtlas');
    expect(loader.includes("'_8dir.json?v=1'") && loader.includes("'_8dir_walk.json?v=1'"), 'live JSON paths');
    expect(!loader.includes('manifest.json'), 'inventory unexpectedly live');
  });
}
const patch=patches.join('');
const dry=spawnSync('git',['apply','--check','-'],{cwd:root,input:patch,encoding:'utf8'});
check('candidate-readonly-apply-check',()=>expect(dry.status===0, dry.stderr || 'git apply check failed'));
check('readonly-input-hashes-unchanged-during-check',()=>{
  for(const p of protectedPaths)expect(sha(fs.readFileSync(root+'/'+p))===inputHashes[p],'concurrent input change: '+p);
});
const failures=rows.filter(r=>r.status==='FAIL');
console.log(JSON.stringify({checkedAt:new Date().toISOString(),pass:failures.length===0,
  executionStartedAt,runtime:process.execPath,workdir:root,inputHashes,startSnapshot,endSnapshot:gitSnapshot(),
  checks:rows.length,failures,results:rows,sourceSlices:slices,scenarios:cases,assetHeaders:assets,
  metadata:{idle:{cell:idle.cell,cols:idle.cols,rows:idle.rows,total:idle.total},walk:{frames:walk.framesPerMob,mobs:Object.keys(walk.mobs).length},
    sourceInventoryCols:inventory.cols,sourceInventoryLoadedByRuntime:false,footAnchor:'UNKNOWN: no anatomical foot metadata'},
  patch,patchSha256:sha(patch),dryRun:{exitCode:dry.status,stdout:dry.stdout,stderr:dry.stderr},
  limits:['Verbatim queue/prep/draw/body/shadow/matrix source slices; state, textures, frame driver and draw recorder are fixtures.',
    'No pixels decoded/rendered, shader compiled/executed, browser, whole update, performance or natural encounter.',
    'Candidate numerical placement normalizes proxy backing-pixel matrix by SSAA for the actual logical uRes uniform; nonzero matrix shear/rotation rejects queue and retains fallback.',
    'game.html locks SSAA to 1; game-easy-test.html supports MAP_QA_HIDPI up to 2. Configurations here are injected source-harness cases, not actual encounters.',
    'GPU Float32 and shader rotation quantization, pixel rounding and final composition still require QA. Corpse fade remains deferred.']},null,2));
process.exitCode=failures.length?1:0;
