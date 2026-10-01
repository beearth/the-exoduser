import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createD10Consumer,candidateSlamSource} from '../ITEM/d10-consumer.mjs';
import {runSource} from './d10-independent.mjs';

export function runD10Scenario(scenario) {
  const consumer=createD10Consumer({enabled:scenario.disabled!==true,
    readStoredRoll:item=>item.fixtureStored});
  return runSource(scenario,{consumer,transform:(source,file)=>{
    const transformed=candidateSlamSource(source);
    const name=file==='game.html'?'d10-game-function.js':'d10-game-easy-test-function.js';
    const submitted=readFileSync(new URL(`../ITEM/${name}`,import.meta.url),'utf8').trim();
    assert.equal(transformed,submitted,'실제 제출 함수와 source변환 일치 필수');
    return transformed;
  }});
}
