import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const game=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const loaderStart=game.indexOf('const _silvMaliceOrbImg=new Image()');
const loader=game.slice(loaderStart,game.indexOf('// ═══ 어둠 폭발',loaderStart));
const renderStart=game.indexOf('if(_charIdx===1&&_silvMaliceOrbReady){');
const render=game.slice(renderStart,game.indexOf('}else if(_moReady)',renderStart))+'}';

function setup(width=1536,height=1024){
  const calls=[];
  const context=vm.createContext({
    Image:class {naturalWidth=width;naturalHeight=height;},
    _makeGreenChromaCutout:img=>img,
    _charIdx:1,_now:0,fa:1,p:{x:0,y:0,r:12},Math,
    X:{save(){},restore(){},translate(){},rotate(){},drawImage(...args){calls.push(args);}},
  });
  vm.runInContext(loader+'\n_silvMaliceOrbImg.onload();',context);
  return {context,calls,draw(now,x=0){calls.length=0;context._now=now;context.p.x=x;vm.runInContext(render,context);return calls;}};
}

test('Malice Orb selects six cropped frames and returns smoothly through the loop',()=>{
  const {draw}=setup(),rects=[];
  for(let step=0;step<=10;step++){
    const calls=draw(step*80);
    assert.equal(calls.length,2,'body and glow only');
    assert.equal(calls[0].length,9,'draw a source frame, never the entire sheet');
    assert.deepEqual(calls[0].slice(1,5),calls[1].slice(1,5),'body and glow use the same frame');
    const [sx,sy,sw,sh]=calls[0].slice(1,5);
    assert.equal(sw,432);assert.equal(sh,432);
    assert.ok(sx>=0&&sy>=0&&sx+sw<=1536&&sy+sh<=1024);
    rects.push(`${sx},${sy}`);
  }
  assert.equal(new Set(rects.slice(0,6)).size,6);
  assert.deepEqual(rects.slice(6),[rects[4],rects[3],rects[2],rects[1],rects[0]]);
});

test('Malice Orb frame timing stays stable while the projectile moves',()=>{
  const {draw}=setup();
  const frame=draw(160,0)[0].slice(1,5);
  assert.deepEqual(draw(160,1000)[0].slice(1,5),frame);
});

test('Malformed Malice Orb sheets remain unready for the existing fallback',()=>{
  const {context,draw}=setup(1254,1254);
  assert.equal(vm.runInContext('_silvMaliceOrbReady',context),false);
  assert.equal(draw(0).length,0);
});
