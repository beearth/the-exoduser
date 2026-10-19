import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const section = (start, end) => {
  const a = game.indexOf(start), b = game.indexOf(end, a);
  assert.ok(a >= 0 && b > a, `Missing consumer boundary: ${start}`);
  return game.slice(a, b);
};

test('paused render fits the camera with dt0 without touching actors or advancing update', () => {
  const source = section('function draw(){', '  // 유니크 유골함 1회') + '\n}\ndraw();';
  const run = active => {
    const calls = [], G = {cam:{x:20,y:30},_camZoom:1,mw:100,mh:100};
    const actors = Object.freeze({s:'idle',st2:26,hp:487,_spawnT:20});
    const fit = {ok:true,x:2580,y:2217,zoom:.45};
    const context = {X:{},G,P:actors,VW:1280,VH:720,T:48,
      window:{_btFramePause:true,_FDGDruidQaStorage:{active},_FDGDruidEncounterQa:{frameCombatCamera:arg=>{calls.push(arg);return fit;}}},
      _syncDruidFinaleMouse:()=>calls.push('mouse')};
    vm.runInNewContext(source,context);
    assert.deepEqual(actors,{s:'idle',st2:26,hp:487,_spawnT:20});
    return {G,calls};
  };
  const active=run(true);assert.equal(active.calls[0].dt,0);
  assert.deepEqual(active.G.cam,{x:2580,y:2217});assert.equal(active.G._camZoom,.45);
  assert.equal(active.calls[1],'mouse');
  const inactive=run(false);assert.deepEqual(inactive.G.cam,{x:20,y:30});assert.deepEqual(inactive.calls,[]);
});

test('the actual spawn draw consumes preview alpha without changing the native spawn timer', () => {
  const source = section('    const _nativeSpawnAlpha=e._spawnT', '    const _ensGLQueued=');
  for (const preview of [true,false]) {
    const e=Object.freeze({_spawnT:20}), X={};
    const calls=[];
    vm.runInNewContext(source,{e,X,_isStealth:false,isReviving:false,isStunned:false,_now:0,
      window:{_FDGDruidEncounterQa:{frozenBossAlpha:(actor,alpha)=>{calls.push([actor,alpha]);return preview?1:alpha;}}}});
    assert.equal(X.globalAlpha,preview?1:0);assert.equal(calls[0][1],0);assert.equal(e._spawnT,20);
  }
});

test('common boom dispatch uses the new dark02 consumer and keeps legacy fallback and pool age intact', () => {
  const source = section('  for(let _bvi=0;_bvi<_BOOM_MAX;', '  // ═══ [DET-BLAST-VFX]');
  for (const handled of [true,false]) {
    const boom=Object.freeze({active:true,x:100,y:100,r:80,t:12,mt:72,col:'dark02'});
    const draws=[],requests=[];
    const X={globalAlpha:.7,drawImage:(...args)=>draws.push(args)};
    const nativeSheet={complete:true,naturalWidth:512,naturalHeight:512};
    vm.runInNewContext(source,{X,_BOOM_MAX:1,_booms:[boom],_vl:0,_vr:1280,_vt:0,_vb:720,_FDG_DRUID_THORN_FIRST:true,
      _tvfx2Imgs:{'Dark_MediumImpact.png':nativeSheet},_plagueBoomSpr:{ready:false},
      window:{_FDGDruidQaStorage:{active:true},_FDGDruidParryContact:{draw:(context,arg)=>{requests.push(arg);return handled;}}}});
    assert.equal(requests.length,1);assert.equal(requests[0].ageFrames,12);assert.equal(requests[0].kind,'dark02');
    assert.equal(draws.length,handled?0:1);assert.equal(X.globalAlpha,.7);
    assert.deepEqual(boom,{active:true,x:100,y:100,r:80,t:12,mt:72,col:'dark02'});
  }
});
