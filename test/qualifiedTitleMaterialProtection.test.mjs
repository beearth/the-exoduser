import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const git=(...args)=>execFileSync('git',['-c','safe.directory='+root,...args],{cwd:root,windowsHide:true,maxBuffer:8*1024*1024}).toString();
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const base=git('show','2546da602ef9efd98ea9afb72cde07e3614926b4:index.html');
const finalTitle=git('show','94e3a89eddf8339cb24192bf8ad97e4fed09bcf2:index.html');
function phase(source){const start=source.indexOf('} else if(phase===2){',source.indexOf('const _titleScene='));assert.ok(start>=0);const end=source.indexOf('titleLoop();return;',start);assert.ok(end>start);return source.slice(start,end+'titleLoop();return;'.length);}
const oldStill='  const _titleArt=_titleScene.still;\n  _titleArt.onerror=()=>{_titleScene.stats.stillError=true;};\n';
assert.equal(base.split(oldStill).length,2);
const expected=base.replace('title-signboard.js?v=20261102-C2-moon','title-signboard.js?v=20261102-C2-final-as-is').replace(oldStill,'').replace(phase(base),phase(finalTitle));
const validateIndex=source=>assert.equal(source,expected,'only reviewed title cache/still/phase hunks may change; startup/save/helpers remain exact');
test('title integration preserves every non-title index byte including completed Init and early-slot repairs',()=>validateIndex(read('index.html')));
test('material and title integration keeps combat, saves, rewards, and active lossless mapping bytes exact',()=>{for(const p of ['game.html','assets/web-derived/20261101/manifest.json'])assert.equal(read(p),git('show','2546da602ef9efd98ea9afb72cde07e3614926b4:'+p),p);});
for(const [id,mutate]of [
 ['slot initial state',s=>s.replace(/let _slotScrollIdx\s*=\s*0\s*;/,'let _slotScrollIdx=1;')],
 ['legacy save key',s=>s.replaceAll('hellsave_demo','hellsave_demo_broken')],
 ['non-title helper',s=>s.replace('function loadLocalCharacters','function loadLocalCharactersBroken')]
])test('protection rejects unrelated '+id+' mutation',()=>{const changed=mutate(expected);assert.notEqual(changed,expected,'negative fixture must change a real protected input');assert.throws(()=>validateIndex(changed));});
