import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('boot keeps uncropped original fallback and an independent status overlay',()=>{
 const image=html.match(/<img id="stRndImg"[^>]+>/)[0];
 assert.doesNotMatch(image,/object-fit:cover/);
 assert.match(html,/id="stLoadStatus"/);
 assert.doesNotMatch(html,/img\.style\.objectFit='cover'/);
});
test('all 35 loading sources select complete generated canvases at the four target sizes',()=>{
 const scope={window:{innerWidth:1920,innerHeight:1080,addEventListener(){}}};
 vm.runInNewContext(readFileSync(new URL('../loading-art.js',import.meta.url),'utf8'),scope);
 const names=Array.from({length:19},(_,i)=>(i+1)+'.png').concat(['rd1.png','rd2.png','rd4.png','rd5.png','rd6.png','rd7.png','rd8.png','rd9.png','rd10.png','rd11.jpg','rd12.png','rd13.png','rd14.png','rd15.png','rd16.png','rd17.png']);
 for(const [w,h,part]of [[1920,1080,'16'],[2560,1080,'21'],[3840,1080,'32'],[2560,1600,'16']]){
  scope.window.innerWidth=w;scope.window.innerHeight=h;
  for(const name of names) assert.ok(scope.window.LoadingArt.variant('img/lording/'+name+'?v=old').includes('wide/'+name.replace(/\.(png|jpg)$/,'')+'-'+part+'.webp'),name+' '+w+'x'+h);
 }
 assert.equal(scope.window.LoadingArt.variant('img/logo_exoduser.png'),'img/logo_exoduser.png');
});

test('desktop and web entry manifest includes the shared loading runtime',()=>{
 const build=readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');
 const entries=build.match(/const FILES = \[([\s\S]*?)\];/)[1];
 assert.ok(entries.includes("'loading-art.js'"));assert.ok(entries.includes("'loading-art.css'"));
});
