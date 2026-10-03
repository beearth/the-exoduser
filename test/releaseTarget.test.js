import test from 'node:test';
import assert from 'node:assert/strict';
import {createReleaseConfig, runtimeManifest, validateReleasePackage} from '../tools/release-target.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
test('full and demo have separate IDs, ports, saves and profiles',()=>{
 const full=createReleaseConfig('full','20261002-120000'),demo=createReleaseConfig('demo','20261002-120000');
 assert.equal(full.appId,4749590);assert.equal(full.depotId,4749591);assert.equal(demo.appId,5337590);
 for(const key of ['port','saveNamespace','profile','dist','out'])assert.notEqual(full[key],demo[key]);
 assert.throws(()=>createReleaseConfig('ea','20261002-120000'));
 assert.throws(()=>createReleaseConfig('full','../unsafe'));
});
test('actual nextStage continues full beyond demo boundary and retains demo end',()=>{
 const game=fs.readFileSync('game.html','utf8');
 const fn=game.split(/\r?\n/).find(line=>line.startsWith('function nextStage(){'));
 assert.ok(fn);
 for(const [target,stage,expected] of [['full',0,1],['full',4,5],['demo',0,0]]){
  const end={style:{}},noop=()=>{};
  const ctx={window:{EXODUSER_BUILD_TARGET:target},G:{stage},ens:[],_ensWarmDone:false,_hudT:0,_hudAlive:0,
   SFX:{beamStop:noop},BGM:{play:noop,stageKey:noop},$:id=>id==='demoEnd'?end:{style:{}},_T:v=>v,
   _cacheExitCenter:noop,SI_TO_HELL:Array.from({length:35},(_,i)=>Math.floor(i/5)),
   CHAPTER_STAGES:Array.from({length:7},(_,i)=>({startSi:i*5,stages:5})),TOTAL_STAGES:35,
   _DEMO_LAST_STAGE:0,initStage:noop,doWin:noop};
  vm.createContext(ctx);vm.runInContext("const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';"+fn+';nextStage();',ctx);
  assert.equal(ctx.G.stage,expected);assert.equal(ctx.G.on,target==='full');
  assert.equal(end.style.display,target==='demo'?'flex':undefined);
 }
});
test('release HTML inline scripts parse and load target before scope constants',()=>{
 for(const file of ['index.html','game.html']){
  const source=fs.readFileSync(file,'utf8');assert.ok(source.indexOf('src="build-target.js"')<source.indexOf(file==='index.html'?'const _LOBBY_BUILD':'const _DEMO_MODE'));
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/src=|application\/ld\+json|importmap/.test(match[1]))continue;
   parse(match[2],{ecmaVersion:'latest',sourceType:/type="module"/.test(match[1])?'module':'script'});
  }
 }
});
test('full manifest cannot start demo and QA profiles cannot leak into release',()=>{
 const cfg=createReleaseConfig('full','20261002-120000');
 const pkg=runtimeManifest(JSON.parse(fs.readFileSync('package.json','utf8')),cfg);
 assert.equal(new URL(pkg.main).searchParams.get('demo'),null);
 assert.equal(pkg.exoduser.target,'full');assert.equal(pkg.exoduser.appId,4749590);
 assert.ok(pkg['chromium-args'].includes(cfg.profile));
});
test('Steam validator rejects wrong app/depot, demo gates and altered artifacts',()=>{
 const cfg=createReleaseConfig('full','20261002-120000');
 const pkg=runtimeManifest(JSON.parse(fs.readFileSync('package.json','utf8')),cfg);
 const art={config:cfg,package:pkg,buildTarget:"window.EXODUSER_BUILD_TARGET='full';",lobby:"const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';",game:"const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';",exe:true};
 assert.equal(validateReleasePackage(art,4749590,4749591),true);
 assert.throws(()=>validateReleasePackage(art,5337590,5337591));
 assert.throws(()=>validateReleasePackage({...art,game:'const _DEMO_MODE=true;'},4749590,4749591));
 assert.throws(()=>validateReleasePackage({...art,buildTarget:"window.EXODUSER_BUILD_TARGET='demo';"},4749590,4749591));
 assert.throws(()=>validateReleasePackage({...art,package:{...pkg,main:pkg.main+'?demo=1'}},4749590,4749591));
 assert.throws(()=>validateReleasePackage({...art,exe:false},4749590,4749591));
});
