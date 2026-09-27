import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const start=html.indexOf('const _RARE_MOB_NAMES=[');
const end=html.indexOf('function _drawEliteAuraTelegraph(',start);
const source=start>=0&&end>start?html.slice(start,end):'';

test('all ten rare enemy types have distinct localized named identities',()=>{
  assert.ok(source,'rare mob name resolver must exist');
  const names=vm.runInNewContext(source+';Array.from({length:10},(_,i)=>_rareMobName(90+i))',{_L:(ko)=>ko});
  assert.deepEqual(Array.from(names),['방랑 기사','보물 악마','거울의 사도','상인 악마','사슬의 죄수','시간의 사도','탐욕의 사도','저주받은 쌍둥이','차원 균열체','죽음 그 자체']);
  const english=vm.runInNewContext(source+';Array.from({length:10},(_,i)=>_rareMobName(90+i))',{_L:(ko,en)=>en});
  assert.deepEqual(Array.from(english),['Wandering Knight','Treasure Demon','Mirror Apostle','Merchant Demon','Chained Prisoner','Time Apostle','Greed Apostle','Cursed Twins','Dimensional Rift','Death Itself']);
  assert.equal(vm.runInNewContext(source+';_rareMobName(89)',{_L:(ko)=>ko}),'네임드');
});

test('rare mobs receive a persistent gold nameplate above their sprite',()=>{
  assert.match(html,/else if\(e\.elite>0\|\|e\.etype>=90\)/);
  assert.match(html,/const _rare=e\.etype>=90,ec=_rare\?'#ffd24a':ELITE_TIERS\[e\.elite\]\.col/);
  assert.match(html,/e\.etype>=90\?_rareMobName\(e\.etype\)/);
});
