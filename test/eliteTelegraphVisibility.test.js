import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const start=html.indexOf('function _drawEliteAuraTelegraph(');
const end=html.indexOf('function _drawChargeTele(',start);
const source=start>=0&&end>start?html.slice(start,end):'';

function canvas(){
  const c=createCanvas(320,220),X=c.getContext('2d');
  X.fillStyle='#17131a';X.fillRect(0,0,c.width,c.height);
  return {X,image:()=>X.getImageData(0,0,c.width,c.height)};
}
function maxColor(image,cx,cy,half=2){
  let red=0,green=0,blue=0;
  for(let y=cy-half;y<=cy+half;y++)for(let x=cx-half;x<=cx+half;x++){
    const i=(y*image.width+x)*4;red=Math.max(red,image.data[i]);green=Math.max(green,image.data[i+1]);blue=Math.max(blue,image.data[i+2]);
  }
  return {red,green,blue};
}
function renderZone(zone){
  const {X,image}=canvas(),scope={X,_now:170,Math,zone};
  vm.runInNewContext(source+';_drawEliteZoneTelegraph(X,zone,_now)',scope);
  return {image:image(),X};
}

test('elite ground telegraph has a readable full-radius boundary and center-out wavefront',()=>{
  assert.ok(source,'elite ground telegraph renderer must exist');
  const z={x:110,y:110,t:30,dur:60,r:68,kind:'burst',col:'#ff2438'};
  const {image,X}=renderZone(z),front=maxColor(image,144,110),edge=maxColor(image,178,110);
  assert.ok(front.red>150&&front.red>front.green*1.15,'expanding impact front must read clearly halfway to the rim');
  assert.ok(edge.red>100&&edge.red>edge.green*1.15,'fixed outer rim must mark the actual damage radius');
  assert.equal(X.globalAlpha,1);assert.equal(X.globalCompositeOperation,'source-over');
});

test('mortar telegraph keeps its crosshair visible inside the marked radius',()=>{
  assert.ok(source,'elite ground telegraph renderer must exist');
  const {image}=renderZone({x:110,y:110,t:48,dur:96,r:68,kind:'mortar',col:'#ff3322'});
  assert.ok(maxColor(image,140,110).red>100,'mortar reticle must remain visible before impact');
});

test('elite lightning warning has a bright central bolt and readable side lanes',()=>{
  assert.ok(source.includes('function _drawEliteBoltTelegraph('),'elite lightning warning renderer must exist');
  const {X,image}=canvas(),e={x:20,y:110,_eliteBoltAim:0};
  vm.runInNewContext(source+';_drawEliteBoltTelegraph(X,e,_now)',{X,e,_now:170,Math});
  const core=maxColor(image(),120,110,8);
  assert.ok(core.red>150&&core.green>100,'lightning core must be bright enough to track');
  assert.equal(X.globalAlpha,1);assert.equal(X.globalCompositeOperation,'source-over');
});

test('champions show a brighter outer aura in both GPU-instanced and regular render paths',()=>{
  assert.ok(source.includes('function _drawEliteAuraTelegraph('),'elite aura renderer must exist');
  const {X,image}=canvas(),e={x:110,y:110,r:18,elite:3};
  vm.runInNewContext(source+';_drawEliteAuraTelegraph(X,e,1,_now)',{X,e,_now:170,Math});
  const ring=maxColor(image(),142,110,2);
  assert.ok(ring.red>120&&ring.red>ring.green*1.35,'champion outline must read as a distinct red threat tier');
  const renderCalls=(html.match(/_drawEliteAuraTelegraph\(X,e,sa,_now\)/g)||[]).length;
  assert.ok(renderCalls>=2,'both GPU-instanced and regular enemy paths must draw the aura');
});
