import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('boot and stage art never uses cover and has a separate status footer',()=>{
 const image=html.match(/<img id="stRndImg"[^>]+>/)[0];
 assert.doesNotMatch(image,/object-fit:cover/);
 assert.match(html,/id="stLoadStatus"/);
 assert.doesNotMatch(html,/img\.style\.objectFit='cover'/);
});
test('chooses original, 21:9 and 32:9 with query strings, retaining existing panoramic sources',()=>{
 const scope={window:{innerWidth:1920,innerHeight:1080,addEventListener(){}}};
 vm.runInNewContext(readFileSync(new URL('../loading-art.js',import.meta.url),'utf8'),scope);
 for(const [w,h,part]of [[1920,1080,'2.png?v=old'],[2560,1080,'wide/2-21.webp'],[3840,1080,'wide/2-32.webp'],[2560,1600,'2.png?v=old']]){
  scope.window.innerWidth=w;scope.window.innerHeight=h;
  assert.ok(scope.window.LoadingArt.variant('img/lording/2.png?v=old').includes(part));
  assert.equal(scope.window.LoadingArt.variant('img/lording/19.png'),'img/lording/19.png');
  assert.equal(scope.window.LoadingArt.variant('img/lording/rd4.png'),'img/lording/rd4.png');
 }
});

test('desktop and web entry manifest includes the shared loading runtime',()=>{
 const build=readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');
 const entries=build.match(/const FILES = \[([\s\S]*?)\];/)[1];
 assert.ok(entries.includes("'loading-art.js'"));assert.ok(entries.includes("'loading-art.css'"));
});
