import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collect} from '../tools/localization-catalog.mjs';
test('system lesson fallback translations are discoverable for other languages',()=>{
  const {pairs}=collect('system-lesson.js');
  assert.equal(pairs.get('장비 획득'),'Pick up equipment');
  assert.equal(pairs.get('{done} / {total} 완료'),'{done} / {total} complete');
});
