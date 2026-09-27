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

test('ancestor stomp becomes ready after 600 active frames and impacts once after windup',()=>{
  let impacts=0;
  const tick=Function('_ancestorStompImpact',`${source('_updateAncestorStomp')};return _updateAncestorStomp`)(()=>impacts++);
  const a={big:1,_stompCd:600,_stompT:0};
  assert.equal(tick(a,599,100),false);
  assert.equal(impacts,0);
  assert.equal(tick(a,1,100),true);
  assert.equal(a._stompT,36);
  assert.equal(a._stompCd,600);
  assert.equal(tick(a,24,100),true);
  assert.equal(impacts,1);
  assert.equal(tick(a,12,100),true);
  assert.equal(impacts,1);
  assert.equal(tick(a,563,100),false);
  assert.equal(impacts,1);
  assert.equal(tick(a,1,100),true);
  assert.equal(a._stompT,36);
});

test('stomp holds its ready state until an enemy enters the area',()=>{
  const tick=Function('_ancestorStompImpact',`${source('_updateAncestorStomp')};return _updateAncestorStomp`)(()=>{});
  const a={big:1,_stompCd:1,_stompT:0};
  assert.equal(tick(a,1,400),false);
  assert.equal(a._stompCd,0);
  assert.equal(tick(a,1,180),true);
});

test('stomp stuns nearby ordinary enemies and eligible bosses without touching distant targets',()=>{
  const enemies=[
    {x:100,y:0,r:12,alive:true,stunned:0},
    {x:190,y:0,r:12,alive:true,ib:true,stunned:0,_pImmune:0},
    {x:260,y:0,r:12,alive:true,stunned:0},
    {x:80,y:0,r:12,alive:true,ib:true,stunned:0,_pImmune:60},
    {x:80,y:0,r:12,alive:true,stunned:0,s:'eCharge'},
  ];
  const impact=Function('shQuery','dst','addTxt','_L','shake','playSample',`${source('_ancestorStompImpact')};return _ancestorStompImpact`)(
    ()=>enemies,(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1),()=>{},x=>x,()=>{},()=>{});
  const a={x:0,y:0,big:1};
  impact(a);
  assert.equal(enemies[0].stunned,90);
  assert.equal(enemies[1].stunned,30);
  assert.equal(enemies[2].stunned,0);
  assert.equal(enemies[3].stunned,0);
  assert.equal(enemies[4].stunned,0);
  assert.equal(a._stompRingT,30);
});

test('stomp pose uses the walk sheet only during the authored foot lift and landing',()=>{
  assert.match(html,/const _stompingSprite=.*a\._stompT>0/);
  assert.match(html,/const _stompFrame=a\._stompT>12\?1:2/);
  assert.match(source('_updateAncestors'),/_updateAncestorStomp\(a,sp,bd\)/);
});
