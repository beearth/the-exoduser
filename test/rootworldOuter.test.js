import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('field QA selects its own outer art while both production backgrounds stay selectable',()=>{
  const expression=game.match(/const _CH1_START_ROOT=([^;]+);/)[1];
  const select=Function('_DIABLO_FIELD_QA','_CH1_START_PHASE',`return ${expression}`);
  assert.equal(select(true,'smoothing'),'assets/map/ch1/rootworld_outer');
  assert.equal(select(true,'outer'),'assets/map/ch1/rootworld_outer');
  assert.equal(select(false,'smoothing'),'assets/map/ch1/production_finish');
  assert.equal(select(false,'outer'),'assets/map/ch1/baked_start_outer');
});
