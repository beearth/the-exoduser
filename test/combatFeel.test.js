import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function setup(query='',reduced=false){
 const start=source.indexOf('// [COMBAT-FEEL-BEGIN]'),end=source.indexOf('// [COMBAT-FEEL-END]');
 assert.ok(start>=0&&end>start,'전투 표현 설정 블록 필요');
 const c=vm.createContext({location:{search:query},URLSearchParams,matchMedia:()=>({matches:reduced}),OPT:{shake:80,reduceMotion:false},_gameTime:1000,G:{stage:0},Math});
 vm.runInContext(source.slice(start,end),c);return c;
}
test('OFF 경로는 접점·시간·대상에 부작용을 만들지 않는다',()=>{
 const c=setup('?feel=0');vm.runInContext('var e={x:10,y:20,r:20,hp:50};_feelContact(e,1);',c);
 assert.equal(vm.runInContext('_feelContacts.length',c),0);assert.equal(c.e.hp,50);assert.equal(c._gameTime,1000);
});
test('밀집 적중은 8개 이하, 같은 적은 갱신하고 RNG·판정 수치를 소비하지 않는다',()=>{
 const c=setup();vm.runInContext('var e={x:10,y:20,r:20,hp:50};for(let i=0;i<100;i++)_feelContact(e,1);',c);
 assert.equal(vm.runInContext('_feelContacts.length',c),1);
 vm.runInContext('for(let i=0;i<100;i++)_feelContact({x:i,y:0,r:20},0);',c);
 assert.equal(vm.runInContext('_feelContacts.length',c),8);assert.equal(c.e.hp,50);assert.equal(c._gameTime,1000);
});
test('접점 유지 2틱은 그림에만 적용되며 30/60/144Hz에서도 같은 프레임이다',()=>{
 const c=setup();assert.equal(vm.runInContext('_feelContactFrame(0)',c),0);assert.equal(vm.runInContext('_feelContactFrame(2)',c),0);
 assert.equal(vm.runInContext('_feelContactFrame(7)',c),3);assert.equal(vm.runInContext('_feelContactFrame(8)',c),-1);
 for(const hz of [30,60,144])assert.equal(vm.runInContext('_feelContactFrame('+((hz/10)/hz*60)+')',c),2);
});
test('움직임 줄이기는 시스템 설정과 게임 설정을 모두 존중하고 흔들림 0에서 추가 변위가 없다',()=>{
 const c=setup('',true);assert.equal(vm.runInContext('_feelReduced()',c),true);
 const d=setup();vm.runInContext('OPT.reduceMotion=true',d);assert.equal(vm.runInContext('_feelReduced()',d),true);
 vm.runInContext('OPT.shake=0',d);assert.equal(vm.runInContext('_feelShakeScale()',d),0);
});
test('새 접점은 적 탄막보다 먼저 그려지고 전역 히트스톱을 켜지 않는다',()=>{
 assert.ok(source.indexOf('_drawFeelContacts(X);')<source.indexOf('const _dd2=performance.now();'));
 assert.ok(source.includes('G.hitStop=0; // 히트스톱 완전 비활성'));
});

test('처치음 노드 제한 뒤에도 인수의 RNG는 OFF와 동일하게 소비한다',()=>{
 for(const query of ['?feel=0','?feel=1']){const c=setup(query);c.calls=[];c.rng=0;c._playSampleNow=(...args)=>c.calls.push(args);
 vm.runInContext('var _deathSfxFrameN=0;for(let i=0;i<6;i++){_deathSfxFrameN=i+1;_feelDeathSample("death",(++rng)/10,1);}',c);
 assert.equal(c.rng,6);assert.equal(c.calls.length,query.endsWith('0')?6:2);}
});
