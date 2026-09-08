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
  const calls=[],rotations=[];
  const context=vm.createContext({
    Image:class {naturalWidth=width;naturalHeight=height;},
    _makeGreenChromaCutout:img=>img,
    _charIdx:1,_now:0,fa:1,p:{x:0,y:0,r:12},Math,
    X:{save(){},restore(){},translate(){},rotate(angle){rotations.push(angle);},drawImage(...args){calls.push(args);}},
  });
  vm.runInContext(loader+'\n_silvMaliceOrbImg.onload();',context);
  return {context,calls,rotations,draw(now,x=0){calls.length=0;rotations.length=0;context._now=now;context.p.x=x;vm.runInContext(render,context);return calls;}};
}

test('Malice Orb plays six cropped frames forward without reversing',()=>{
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
  assert.deepEqual(rects.slice(6),rects.slice(0,5));
});

test('Malice Orb spins clockwise at one turn per 600ms independently of movement',()=>{
  const {draw,rotations}=setup();
  draw(0);const start=rotations[0];
  draw(40);assert.ok(Math.abs(rotations[0]-start-Math.PI*2*40/600)<1e-9);
  draw(480);assert.ok(Math.abs(rotations[0]-start-Math.PI*2*480/600)<1e-9,'same frame next cycle preserves continuous rotation');
  const angle=rotations[0];
  draw(480,-1000);assert.equal(rotations[0],angle);
  draw(480,1000);assert.equal(rotations[0],angle);
});

test('Malice Orb compensates the measured blade pose angles at frame transitions',()=>{
  const {draw,rotations}=setup();
  for(const [frame,degrees] of [0,9,13,27,31,38].entries()){
    draw(frame*80);
    assert.ok(Math.abs(rotations[0]+degrees*Math.PI/180-frame*80*Math.PI*2/600)<1e-9);
  }
});

test('Malice Orb keeps a fixed visual diameter for a fixed gameplay radius',()=>{
  const {draw}=setup();
  const size=draw(0)[0].slice(7,9);
  assert.deepEqual(draw(160,1000)[0].slice(7,9),size);
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
