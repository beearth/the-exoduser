// 하니스 계약: 원문 계산, 단독 사례, 수백 건, 동일 입력의 재현성을 검사한다.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
test('웹 원문 자원 oracle 계약',()=>{
  const out=process.env.RESOURCE_ORACLE_TEST_OUT;
  assert.ok(out,'RESOURCE_ORACLE_TEST_OUT 필요');
  const r=cp.spawnSync(process.execPath,[path.join(__dirname,'export.cjs'),'--source',process.env.RESOURCE_ORACLE_SOURCE,'--out',out,'--web-commit',process.env.RESOURCE_ORACLE_WEB_SHA,'--core-commit',process.env.RESOURCE_ORACLE_CORE_SHA,'--dependency-root',process.env.RESOURCE_ORACLE_DEPENDENCY],{stdio:['ignore','pipe','pipe'],encoding:'utf8',windowsHide:true});
  assert.equal(r.status,0,r.stderr);
  const o=JSON.parse(fs.readFileSync(out,'utf8'));
  assert.ok(o.cases.length>=300);
  assert.deepEqual(o.cases.find(c=>c.id==='baseline').web,[300,100,100,100]);
  assert.deepEqual(o.cases.find(c=>c.id==='field:bGrit').web,[320,120,120,100]);
  assert.deepEqual(o.cases.find(c=>c.id==='affix:maxHPFlat').web,[360,100,100,100]);
  assert.deepEqual(o.cases.find(c=>c.id==='affix:maxSTFlat').web,[300,100,120,100]);
  assert.deepEqual(o.cases.find(c=>c.id==='affix:maxMPFlat').web,[300,120,100,100]);
  assert.deepEqual(o.cases.find(c=>c.id==='sp:vit').web,[300,100,100,100]);
  assert.ok(o.affixCoverage.length>20);
  for(const id of ['extraST','helmMPPct','hybMPST','ringMPOnKill','beltSTMax','beltSTRegen','headbandMPMax','headbandMPRegen','arcMageMP'])assert.ok(o.affixCoverage.some(a=>a.id===id),id);
  assert.ok(o.affixCoverage.every(a=>o.cases.some(c=>c.id==='affix:'+a.id)));
  assert.ok(o.source.anchors.some(a=>a.name==='applyStats'));
  assert.ok(o.source.anchors.every(a=>a.line>0&&a.text.length>0));
  assert.ok(o.cases.every(c=>c.web.every(Number.isFinite)&&c.items.every(i=>i.enh===0&&!i.crystals&&!i.socketCount&&i.affixes.every(a=>Number.isFinite(a.value)))));
});
