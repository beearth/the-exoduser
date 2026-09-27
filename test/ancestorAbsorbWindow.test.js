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

test('ancestor draws bullet aggro only during the red 60-frame sword charge with capacity',()=>{
  const a={x:0,y:0,hp:100,_swordT:0,_swordAbsorbed:0};
  const G={_ancestors:[a]};
  const target=Function('G','dst',`${source('_ancestorCanAbsorb')};${source('_ancestorTargetForEnemy')};return _ancestorTargetForEnemy`)(
    G,(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1));
  assert.equal(target(20,0),null);
  a._recalling=true;a._swordT=61;
  assert.equal(target(20,0),null);
  a._swordT=60;
  assert.equal(target(20,0),a);
  a._swordAbsorbed=24;
  assert.equal(target(20,0),null);
  a._swordAbsorbed=0;a._swordT=0;
  assert.equal(target(20,0),null);
});

test('recall update absorbs projectiles only in the red charge and normal combat does not absorb',()=>{
  const update=source('_updateAncestors');
  assert.match(update,/if\(_ancestorCanAbsorb\(a\)\)_ancestorSwordAbsorbProjectiles\(a\)/);
  assert.doesNotMatch(update,/평소 자율 전투 중에도 최대 24발 저장/);
  assert.match(source('_ancestorCanAbsorb'),/a\._recalling/);
});
