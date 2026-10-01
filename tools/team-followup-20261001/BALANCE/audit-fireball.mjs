import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root = new URL('../../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const rows = [];
for (const file of ['game.html', 'game-easy-test.html']) {
  const source = read(file);
  const extract = (start, end) => {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end, startIndex + start.length);
    assert(startIndex >= 0 && endIndex > startIndex);
    return source.slice(startIndex, endIndex);
  };
  const definition = source.match(/^\s*\{id:'onHitFireball',[^\n]+/m)[0].trim().replace(/,$/, '');
  const slotMap = source.match(/^const _AFSLOT=([^;]+);/m)[1];
  const banned = source.match(/const _DEMO_AFFIX_BANNED=new Set\(([^;]+)\);/)[1];
  const roll = extract('function rollAffixes(', 'const SLOT_NAMES=');
  const hurt = extract('function hurtE(', 'function _getTodayStr(');
  const aggregation = extract('let _eqAffixCache=null', '// ═══ 테스트용:');
  const context = vm.createContext({});
  vm.runInContext(`const AFFIX_POOL=[${definition}],_AFSLOT=${slotMap};
    const _DEMO_MODE=true,_DEMO_AFFIX_BANNED=new Set(${banned}),P={lv:400};
    Math.random=()=>0;${roll}
    globalThis.observed={definition:AFFIX_POOL[0],weapon:rollAffixes(4,'weapon'),bow:rollAffixes(4,'bow')};`, context, { timeout: 1000 });
  const observed = JSON.parse(JSON.stringify(context.observed));
  assert.deepEqual(observed.definition.tiers, [.04,.07,.11,.16,.22]);
  assert.deepEqual(observed.definition.tierW, [40,30,20,8,2]);
  assert.equal(observed.definition.weight, 25);
  assert.equal(observed.weapon.length, 1);
  assert.equal(observed.weapon[0].id, 'onHitFireball');
  assert.deepEqual(observed.bow, []);
  assert(!hurt.includes('onHitFireball'));
  assert(aggregation.includes('(_eqAffixCache[a.id]||0)+a.value'));
  assert(hurt.includes("Math.random()<_ohFire"));
  assert(hurt.includes('dmg*.3'));
  rows.push({file,sha256:createHash('sha256').update(source).digest('hex'),
    definition:observed.definition,isolatedPoolRoll:observed,
    verdict:'MISSING_HOOK',recursion:'NOT_REACHED',
    occurrences:source.split('\n').flatMap((line,index)=>line.includes('onHitFireball')?[{line:index+1,text:line.trim()}]:[])});
}
for (const path of ['docs/7아이템디자인/아이템_어픽스_시스템.md','docs/7아이템디자인/슬롯별_어픽스_풀.md']) {
  const document = read(path);
  const row = document.split('\n').find(line=>line.includes('| onHitFireball |'));
  assert(row && /0\.04.*0\.07.*0\.11.*0\.16.*0\.22/.test(row));
}
console.log(JSON.stringify({scope:'독립 정적 감사; 롤은 실제 함수/단일 어픽스 풀 fixture이며 정상 전체 풀 획득률 검증 아님',rows},null,2));
