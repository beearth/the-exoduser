import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script, runInNewContext} from 'node:vm';
import {createCapture, instrumentSource} from './membrane-prewarm-capture.mjs';
import {analyze} from './membrane-prewarm-analyze.mjs';
const source = readFileSync(new URL('../../../ch1-living-detail.js', import.meta.url), 'utf8');
test('원자료 99ms와 가능한 세 키 대조', () => {
  const result = analyze();
  assert.equal(result.span.duration,99);
  assert.deepEqual(result.dryCandidates.map(row=>row.atlasKey),[0,4,5]);
  assert.equal(result.hashes['ch1-living-detail.js'],'e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640');
});
test('미적용 변환 문맥·구문 및 중복 거부', () => {
  const candidate = instrumentSource(source);
  new Script(candidate);
  assert.throws(()=>instrumentSource(candidate));
  assert.throws(()=>instrumentSource('다른 소스'));
  assert.equal(candidate.replace(/    observeMembrane[^\n]*\n/g,'' ).includes('let seed=781+variant*357+(wet?91:0);'),true);
});
test('상한64·복사·닫힌 캡처 취소', () => {
  let time=0;
  const capture=createCapture({now:()=>time++,runId:'독립-fixture'});
  for(let index=0;index<70;index++) capture.observe('membrane','miss',false,false,2,2);
  assert.equal(capture.snapshot().rows.length,64);
  assert.equal(capture.snapshot().dropped,6);
  const snapshot=capture.snapshot();snapshot.rows[0].key=9;
  assert.equal(capture.snapshot().rows[0].key,2);
  capture.close();capture.observe('atlas','miss',false,false,1,4);
  assert.equal(capture.snapshot().dropped,6);
});
test('관측 오류 격리: 게임 대신 추출한 작은 훅만 실행', () => {
  const candidate=instrumentSource(source);
  const helper=candidate.slice(candidate.indexOf('  function observeMembrane'),candidate.indexOf('  const kinds='));
  const context={root:{__uiuxMembraneCapture:{observe(){throw new Error('fixture');}}}};
  assert.doesNotThrow(()=>runInNewContext(helper+"observeMembrane('atlas','miss',false,false,2,5);",context));
});
test('동일 캐시키 원식과 lazy 순서 유지', () => {
  const candidate=instrumentSource(source);
  const removed=candidate.replace(/  function observeMembrane[^]*?\n  }\n/,'').replace(/^.*observeMembrane\('(?:membrane|atlas)','init'.*\n/gm,'').replace(/\n    observeMembrane\('(?:membrane|atlas)','miss'.*;/g,'').replace(/\n    observeMembrane\('(?:membrane|atlas)','commit'.*?;return a;/g,'return a;');
  assert.equal(removed,source);
});
test('메모리 참조·잘못된 관측 거부, 초기화 기록', () => {
  const capture=createCapture({now:()=>10,runId:'단일실행'});
  capture.observe('atlas','init',null,null,null,null);
  assert.throws(()=>capture.observe('atlas','miss',false,false,{},4));
  assert.throws(()=>createCapture({now:()=>0,runId:'표본',limit:65}));
  assert.equal(capture.snapshot().rows.length,1);
});
