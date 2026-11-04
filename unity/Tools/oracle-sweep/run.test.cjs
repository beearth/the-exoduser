const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runner = path.join(__dirname, 'run.cjs');
test('일괄 실행기가 제공된다', () => assert.ok(fs.existsSync(runner)));
const api = fs.existsSync(runner) ? require(runner) : {};
test('컴파일 오류를 실제 규칙 불일치와 구분한다', () => {
  assert.equal(typeof api.classifyResult, 'function');
  assert.equal(api.classifyResult({ code: 1, output: 'error CS0117: missing API' }), 'BUILD-BREAK');
});
test('입력 누락과 추출기 소스 드리프트는 규칙 FAIL이 아니다', () => {
  assert.equal(api.classifyResult({ code: 1, output: 'FileNotFoundException: map.json' }), 'NEEDS-INPUT');
  assert.equal(api.classifyResult({ code: 1, output: 'source pin changed', phase: 'export' }), 'NEEDS-INPUT');
});
test('성공 종료와 실패 검사 영수증이 충돌하면 FAIL이다', () => {
  assert.equal(api.classifyResult({ code: 0, output: '', metrics: { failed: 2 } }), 'FAIL');
  assert.equal(api.classifyResult({ code: 0, output: 'PASS 8' }), 'PASS');
});
test('타임아웃은 PASS가 되지 않는다', () => {
  assert.equal(api.classifyResult({ code: null, output: '', timedOut: true }), 'NEEDS-INPUT');
});
test('다양한 영수증의 검사 수와 실제 실패 값을 보존한다', () => {
  const m = api.extractMetrics({ checks: [{ name: 'x', passed: false, web: 4, unity: 3 }, { name: 'y', passed: true }], failed: 1 }, '');
  assert.equal(m.total, 2); assert.equal(m.failed, 1); assert.equal(m.details[0].web, 4);
  assert.deepEqual(api.extractMetrics({ checks: 150, failures: 2, first: ['a', 'b'] }, '').names, ['a', 'b']);
  assert.equal(api.extractMetrics(null, 'FAIL name x\nDIFF 2').failed, 2);
});
test('원격 입력 의존 항목도 목록에서 빠지지 않는다', () => {
  const inventory = api.discover(path.resolve(__dirname, '..'));
  assert.ok(inventory.projects.some(p => p.endsWith('defense-oracle/DefenseOracleTests.csproj')));
  assert.ok(inventory.scripts.includes('map-oracle.cjs'));
  assert.ok(inventory.scripts.includes('demo-text-tests/export.cjs'));
  assert.ok(!inventory.projects.some(p => p.startsWith('resource-oracle/')));
});
test('MSBuild의 세미콜론 경로 목록을 개별 파일로 해석한다', () => {
  assert.equal(typeof api.mapPaths, 'function');
  assert.equal(api.mapPaths('a.cs;b.cs', value => '/sources/'+value), '/sources/a.cs;/sources/b.cs');
});
test('실제 Unity 엔진 없이는 컴파일할 수 없는 GUI 검사는 SKIP이다', () => {
  assert.equal(api.classifyResult({code:1,output:"error CS0246: 'UnityEngine' could not be found"}), 'SKIP');
});
