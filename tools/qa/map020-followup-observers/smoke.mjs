import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
const src = fs.readFileSync(process.argv[2] || new URL('./observer.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../../../game.html', import.meta.url), 'utf8');
const begin = html.indexOf('const _worldItemSkinCache=new Map();');
const end = html.indexOf('const STAT_SVG=', begin);
assert(begin > 0 && end > begin, 'actual game drop section exists');
const fixture = `
let clock=0, timerId=0;const timers=new Map(),rafs=new Map();
const performance={now:()=>clock};
function setTimeout(f){timers.set(++timerId,f);return timerId}function clearTimeout(id){timers.delete(id)}
function requestAnimationFrame(f){rafs.set(++timerId,f);return timerId}function cancelAnimationFrame(id){rafs.delete(id)}
function page(){const a=[...rafs.values()];rafs.clear();clock+=4;for(const f of a)f(clock)}
class CanvasRenderingContext2D {
 constructor(c){this.canvas=c}drawImage(){clock+=2}getImageData(){clock+=19;return {data:new Uint8ClampedArray([48,24,12,255])}}putImageData(){clock+=1}
}
class Canvas {constructor(){this.width=1;this.height=1;this.ctx=new CanvasRenderingContext2D(this)}getContext(){return this.ctx}}
const document={visibilityState:'visible',hidden:false,createElement:()=>new Canvas()};
class Image{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=2560;this.src=''}}
const _ITEM_CUTOUT_BASES=new Set(['ring']),_ELKEY=['phys','fire'];function _itemSkinSrc(b,e){return b+'_'+e+'.png'}
const ens=[{alive:true,_hitFlash:0,etype:1,_ensGLMode:1}];
let _bootLoadActive=false,_ensWarmDone=true,_useGL=true,_dbgEns8GL=1,_ens8GLTotal=1,_gameTime=0;
const PHYS_STEP=1000/60,OPT={fpsCap:60},G={on:true,paused:false},GL={isContextLost:()=>false};
let action=null;
function update(){_gameTime+=PHYS_STEP;if(action){const f=action;action=null;f()}else if(ens[0]._hitFlash)ens[0]._hitFlash--;return 17}
function draw(){_dbgEns8GL=1;for(const e of ens){if(!e.alive)e._hitFlash=0;e._ensGLMode=e.alive?1:0}return 23}
const originalUpdate=update,originalDraw=draw,originalRead=CanvasRenderingContext2D.prototype.getImageData;
`;
const c = vm.createContext({});
vm.runInContext(fixture + html.slice(begin, end), c);
const run = code => vm.runInContext(code, c);
const plain = code => JSON.parse(JSON.stringify(run(code)));
const checks = [];
function test(name, f) { f(); checks.push(name); }
test('classic-script actual game function bindings install and duplicate evaluation', () => {
  vm.runInContext(src, c); const a = run('__map020Observers'); vm.runInContext(src,c); assert.equal(a,run('__map020Observers'));
  run('__map020Observers.installDrop()'); assert.throws(()=>run('__map020Observers.installDrop()'),/already installed/);
});
test('actual fx miss -> mask -> read hierarchy and exclusive partition', () => {
  run('_worldDropFxTile(0,0);_worldDropFxTile(0,0)');
  const r=plain('__map020Observers.report("drop")');
  assert.equal(r.byLabel.fxTile.calls,2);assert.equal(r.byLabel.mask.calls,1);
  assert.equal(r.byLabel.mask.inclusiveMs,20);assert.equal(r.byLabel['2d.getImageData'].selfMs,19);
  assert.equal(Object.values(r.byLabel).reduce((a,b)=>a+b.selfMs,0),22);
  assert.equal(r.records.find(x=>x.label==='mask').parentId,r.records.find(x=>x.label==='fxTile').id);
  assert.deepEqual(r.records.filter(x=>x.label==='fxTile').map(x=>x.cache),['miss','hit']);
});
test('actual item mask reuse, transparent cutout bypass, asset cache', () => {
  run('_worldItemSkin({slot:"sword"});_worldItemSkin({slot:"sword"});_worldItemSkin({slot:"ring1"});_worldItemSkin({slot:"ring1"})');
  const a=plain('__map020Observers.report("drop").records').filter(r=>r.label==='itemSkin');
  assert.deepEqual(a.map(r=>r.assetCache),['miss','hit','miss','hit']);
  assert.equal(a[0].cache,'miss');assert.equal(a[1].cache,'hit');assert.equal(a[3].cache,'cutout-bypass');
  assert.equal(plain('__map020Observers.report("drop").byLabel.mask.calls'),2);
});
test('notready/oob, bounded capture, restore native and game identities',()=>{
  run('_worldDropFx[1].complete=false;_worldDropFxTile(1,0);_worldDropFxTile(0,100)');
  const rows=plain('__map020Observers.report("drop").records');assert(rows.some(r=>r.cache==='notready'));assert(rows.some(r=>r.cache==='oob'));
  run('__map020Observers.stop("drop")');assert.equal(run('CanvasRenderingContext2D.prototype.getImageData===originalRead'),true);
  run('__map020Observers.installDrop({limit:100});for(let i=0;i<150;i++)_worldDropFxTile(0,0)');
  assert.equal(run('__map020Observers.report("drop").dropped'),50);run('__map020Observers.stop("drop")');
});
test('vfx counts real fixed-update calls separately from page raf and draw',()=>{
  run('__map020Observers.installVfx({regularBootAttested:true});action=()=>{ens[0]._hitFlash=6};update();draw();page();page();update();draw();page()');
  const r=plain('__map020Observers.report("vfx")');assert.equal(r.updates,2);assert.equal(r.draws,2);assert.equal(r.pageRafs,3);assert.equal(r.samplingErrors,0);
  assert(r.records.some(x=>x.glDrawEvidence));assert(r.records.some(x=>x.events.includes('flash-start-observed')));
});
test('death and same-object revival first draw recorded before and after rendering',()=>{
  run('action=()=>{ens[0].alive=false};update();draw();action=()=>{ens[0].alive=true};update();draw()');
  const r=plain('__map020Observers.report("vfx")');
  const first=r.records.filter(x=>x.events.includes('first-draw-after-revive'));
  assert.deepEqual(first.map(x=>x.phase),['before-draw','after-draw']);assert(first.every(x=>x.hf===0));
  assert(r.records.some(x=>x.events.includes('death-observed')&&x.phase==='after-update'));
});
test('hidden/fullboot gate cannot claim GL, newly observed object not a revival',()=>{
  run('document.hidden=true;document.visibilityState="hidden";ens.push({alive:true,_hitFlash:0});draw()');
  const r=plain('__map020Observers.report("vfx")');const last=r.records.at(-1);assert.equal(last.runtimeGate,false);
  assert(!last.events.includes('revive-observed'));
});
test('automatic dispose retains results; cancels raf, restores update/draw; reinstall resets ids',()=>{
  run('for(const f of [...timers.values()])f()');assert.equal(run('rafs.size'),0);assert.equal(run('update===originalUpdate&&draw===originalDraw'),true);
  assert.equal(run('__map020Observers.report("vfx").running'),false);
  run('__map020Observers.installVfx()');assert.equal(run('__map020Observers.report("vfx").records[0].id'),1);
  run('__map020Observers.dispose()');assert.equal(run('typeof __map020Observers'),'undefined');assert.equal(run('timers.size+rafs.size'),0);
});
test('dispose preserves newer third-party replacement and reports conflict',()=>{
  vm.runInContext(src,c);run('__map020Observers.installVfx();draw=function later(){return 99}');
  const r=plain('__map020Observers.stop("vfx")');assert(r.cleanup.conflicts.includes('draw'));assert.equal(run('draw()'),99);
  run('__map020Observers.dispose()');
});
test('partial install failure restores earlier binding and removes pending timer',()=>{
  vm.runInContext(src,c);run('draw=null');assert.throws(()=>run('__map020Observers.installVfx()'),/Missing callable/);
  assert.equal(run('update===originalUpdate'),true);assert.equal(run('timers.size'),0);run('__map020Observers.dispose()');
});
test('loaded phys fallback is mask miss/hit even when base has a cutout; old raw bug is explicit',()=>{
  const section=html.slice(begin,end);
  const oldSection=section.replace(/img\._worldDropCutoutSrc\s*=\s*cutoutSrc\s*\?\s*img\.src\s*:\s*['"]['"]\s*;/g,'')
    .replace(/if\(cutoutSrc\s*&&\s*img\.src\s*===\s*img\._worldDropCutoutSrc\)return img;/,'if(cutoutSrc)return img;');
  assert(oldSection.includes('if(cutoutSrc)return img;'));
  const fixed=oldSection.replace('img.src=renderSrc;','img.src=renderSrc;img._worldDropCutoutSrc=cutoutSrc?img.src:"";')
    .replace('if(cutoutSrc)return img;','if(cutoutSrc&&img.src===img._worldDropCutoutSrc)return img;');
  for(const [body,expected] of [[fixed,['miss','hit']],[oldSection,['raw-fallback-unmasked','raw-fallback-unmasked']]]) {
    const x=vm.createContext({URL});vm.runInContext(fixture+body,x);vm.runInContext(src,x);
    vm.runInContext('__map020Observers.installDrop();_worldItemSkin({slot:"ring1"});const im=_worldItemSkinCache.get("img/ui/item-cutouts/ring_phys_cutout.png");im.onerror();im.onload();_worldItemSkin({slot:"ring1"});_worldItemSkin({slot:"ring1"})',x);
    const rows=vm.runInContext('__map020Observers.report("drop").records.filter(r=>r.label==="itemSkin")',x);
    assert.deepEqual(Array.from(rows.slice(-2),r=>r.cache),expected);
    assert(rows.slice(-2).every(r=>r.actualSrc==='ring_phys.png'&&r.loadedCutout===false));
    vm.runInContext('__map020Observers.dispose()',x);
  }
});
test('absolute loaded URL and same Image source changes preserve cutout/mask distinction',()=>{
  const section=html.slice(begin,end)
    .replace(/img\._worldDropCutoutSrc\s*=\s*cutoutSrc\s*\?\s*img\.src\s*:\s*['"]['"]\s*;/g,'')
    .replace(/if\(cutoutSrc\s*&&\s*img\.src\s*===\s*img\._worldDropCutoutSrc\)return img;/,'if(cutoutSrc)return img;');
  const fixed=section.replace('img.src=renderSrc;','img.src=renderSrc;img._worldDropCutoutSrc=cutoutSrc?img.src:"";')
    .replace('if(cutoutSrc)return img;','if(cutoutSrc&&img.src===img._worldDropCutoutSrc)return img;');
  const x=vm.createContext({URL});
  const absoluteFixture=fixture.replace("class Image{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=2560;this.src=''}}",
    'document.baseURI="http://localhost:3340/game.html";class Image{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=2560;this._src=""}set src(v){this._src=new URL(v,document.baseURI).href}get src(){return this._src}get currentSrc(){return this._src}}');
  vm.runInContext(absoluteFixture+fixed,x);vm.runInContext(src,x);
  vm.runInContext('__map020Observers.installDrop();_worldItemSkin({slot:"ring1"});const im=_worldItemSkinCache.get("img/ui/item-cutouts/ring_phys_cutout.png");im.onerror();im.onload();_worldItemSkin({slot:"ring1"});_worldItemSkin({slot:"ring1"});im.src=im._worldDropCutoutSrc;im.onload();_worldItemSkin({slot:"ring1"});im.src="ring_phys.png";im.onload();_worldItemSkin({slot:"ring1"})',x);
  const rows=vm.runInContext('__map020Observers.report("drop").records.filter(r=>r.label==="itemSkin")',x);
  assert.deepEqual(Array.from(rows,r=>r.cache),['cutout-bypass','miss','hit','cutout-bypass','miss']);
  assert.deepEqual(Array.from(rows,r=>r.loadedCutout),[true,false,false,true,false]);
  assert(rows.every(r=>r.actualSrc.startsWith('http://localhost:3340/')));
  assert.equal(vm.runInContext('__map020Observers.report("drop").byLabel.mask.calls',x),2);
  // Old functions have no marker: normalize the request URL instead of guessing
  // from base membership. This is read-only observer fallback, not a game fix.
  vm.runInContext('im.src="img/ui/item-cutouts/ring_phys_cutout.png";im.onload();delete im._worldDropCutoutSrc;_worldItemSkin({slot:"ring1"})',x);
  const last=vm.runInContext('__map020Observers.report("drop").records.filter(r=>r.label==="itemSkin").at(-1)',x);
  assert.equal(last.loadedCutout,true);assert.equal(last.cache,'miss'); // fixed game masks without its required marker
  vm.runInContext('__map020Observers.dispose()',x);
});
test('easy source without cutout policy reports actual asset and mask reuse',()=>{
  const easy=fs.readFileSync(new URL('../../../game-easy-test.html',import.meta.url),'utf8');
  const a=easy.indexOf('const _worldItemSkinCache=new Map();'),b=easy.indexOf('const STAT_SVG=',a);assert(a>0&&b>a);
  const x=vm.createContext({URL});vm.runInContext(fixture.replace("const _ITEM_CUTOUT_BASES=new Set(['ring']),_ELKEY=","const _ELKEY=")+easy.slice(a,b),x);vm.runInContext(src,x);
  vm.runInContext('__map020Observers.installDrop();_worldItemSkin({slot:"ring1",el:1});const im=_worldItemSkinCache.get("ring_fire.png");im.onerror();im.onload();_worldItemSkin({slot:"ring1",el:1});_worldItemSkin({slot:"ring1",el:1})',x);
  const rows=vm.runInContext('__map020Observers.report("drop").records.filter(r=>r.label==="itemSkin")',x);
  assert.deepEqual(Array.from(rows.slice(-2),r=>r.cache),['miss','hit']);
  assert(rows.every(r=>r.assetKey==='ring_fire.png'&&r.loadedCutout===false));
  assert(rows.slice(-2).every(r=>r.actualSrc==='ring_phys.png'));
  vm.runInContext('__map020Observers.dispose()',x);
});
test('missing/null GL reports unavailable and unknown loss; refuses GL gate',()=>{
  for(const declaration of ['',',GL=null',',GL={}']) {
    const isolated=vm.createContext({});
    vm.runInContext(fixture.replace(',GL={isContextLost:()=>false}',declaration),isolated);
    vm.runInContext(src,isolated);
    const result=vm.runInContext('__map020Observers.installVfx();draw();__map020Observers.report("vfx")',isolated);
    assert(result.records.length>0);
    for(const row of result.records){assert.equal(row.glAvailable,false);assert.equal(row.contextLost,null);assert.equal(row.runtimeGate,false);assert.equal(row.glDrawEvidence,false);}
    vm.runInContext('__map020Observers.dispose()',isolated);
  }
});
test('GL query failure is unknown; genuine true/false loss distinguished strictly',()=>{
  for(const [body,lost,gate] of [['throw Error("query failed")',null,false],['return true',true,false],['return false',false,true],['return undefined',null,false]]) {
    const isolated=vm.createContext({});
    vm.runInContext(fixture.replace('GL={isContextLost:()=>false}','GL={isContextLost(){'+body+'}}'),isolated);
    vm.runInContext(src,isolated);
    const result=vm.runInContext('__map020Observers.installVfx();ens[0]._hitFlash=6;draw();__map020Observers.report("vfx")',isolated);
    const row=result.records.findLast(r=>r.phase==='after-draw');
    assert.equal(row.glAvailable,true);assert.equal(row.contextLost,lost);assert.equal(row.runtimeGate,gate);assert.equal(row.glDrawEvidence,gate);
    vm.runInContext('__map020Observers.dispose()',isolated);
  }
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,names:checks,
  observerSHA256:createHash('sha256').update(src).digest('hex'),
  gameSHA256:createHash('sha256').update(html).digest('hex'),
  scope:'Node vm: actual extracted game drop functions with mock canvas; synthetic update/draw. No browser/GPU/gameplay performance or visual validation.'},null,2));
