import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
  const start=html.indexOf(`function ${name}(`);
  assert.ok(start>=0,`${name} exists`);
  let depth=0;
  for(let i=html.indexOf('{',start);i<html.length;i++){
    if(html[i]==='{')depth++;
    else if(html[i]==='}'&&!--depth)return html.slice(start,i+1);
  }
  assert.fail(`${name} closes`);
}

test('ancestor launches one simple forward ki wave instead of a body swing',()=>{
  const update=source('_updateAncestors');
  assert.match(update,/_launchAncestorKiWave\(a,/);
  assert.doesNotMatch(update,/a\._atkT=1/);
  assert.match(html,/const _swingingSprite=false;/);
});

test('ki wave travels forward and damages each crossed enemy once',()=>{
  const launch=Function(`${source('_launchAncestorKiWave')};return _launchAncestorKiWave`)();
  const hit=[];
  const enemies=[{x:100,y:0,alive:true},{x:100,y:90,alive:true}];
  const advance=Function('shQuery','hurtE','EL',`${source('_updateAncestorKiWaves')};return _updateAncestorKiWaves`)(
    ()=>enemies,
    (e,dmg)=>hit.push([e.x,e.y,dmg]),{D:1});
  const a={x:0,y:0,big:1,_kiWaves:[]};
  launch(a,0,77,1);
  for(let i=0;i<15;i++)advance(a,1);
  assert.deepEqual(hit,[[100,0,77]]);
  assert.ok(a._kiWaves[0].x>100);
});

test('ki wave renderer is a compact tapered blade with no sprite dependency',()=>{
  const draw=Function(`${source('_drawAncestorKiWaves')};return _drawAncestorKiWaves`)();
  const calls=[];
  const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args])});
  draw(ctx,{big:1,_kiWaves:[{x:10,y:20,ang:0,travel:40,range:360}]},1);
  assert.ok(calls.some(c=>c[0]==='lineTo'));
  assert.ok(calls.some(c=>c[0]==='fill'));
  assert.ok(!calls.some(c=>c[0]==='drawImage'));
  assert.equal(calls[0][0],'save');
  assert.equal(calls.at(-1)[0],'restore');
});

test('recalled ancestor clears flying ki blades before sword planting',()=>{
  const recall=Function('G',`${source('_recallAncestor')};return _recallAncestor`)({});
  const a={x:0,y:0,hp:100,_kiWaves:[{x:50,y:0}]};
  assert.equal(recall(a),true);
  assert.deepEqual(a._kiWaves,[]);
});
