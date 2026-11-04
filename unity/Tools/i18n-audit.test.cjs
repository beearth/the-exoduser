const {test}=require('node:test'),assert=require('node:assert/strict');
const audit=require('./i18n-audit.cjs');
test('29언어 배열·중첩 레코드·맵을 같은 키로 검사하고 잘못된 치환을 찾는다',()=>{
 const codes=audit.codes;
 const entries=[{key:'체력 {0}',texts:codes.map(c=>c==='ko'?'체력 {0}':c==='ja'?'体力 {1}':c==='ar'?'':'Health {0}')}];
 const rows=audit.extract({codes,entries},'test.json');
 const issues=audit.validate(rows);
 assert(issues.some(x=>x.kind==='empty'&&x.code==='ar'));
 assert(issues.some(x=>x.kind==='placeholder'&&x.code==='ja'));
 const nested=audit.extract({entries:codes.map(code=>({code,labels:[{key:'시작',value:code==='ko'?'시작':'Start'}]}))},'nested.json');
 assert.equal(nested.length,1);assert.equal(nested[0].values.en,'Start');
 const map=audit.extract({label:{ko:'준비',en:'Ready'}},'map.json');
 assert.equal(audit.validate(map).filter(x=>x.kind==='missing').length,27);
 assert.deepEqual(audit.tokens('{{0}} {1:N0} {name}'),['{1}','{name}']);
 assert(audit.validate([{file:'x',path:'x',values:{ko:'준비',en:'준비'}}]).some(x=>x.kind==='korean-copy'));
});
test('새 localization 표는 원본 경로에 합쳐지고 누락된 언어를 숨기지 않는다',()=>{
 const data={entries:[{id:'hint',ko:'체력 {p0}',en:'Health {p0}'}],localization:{schema:'exoduser.localization.v1',codes:audit.codes,entries:[{path:'entries[0]',key:'체력 {p0}',no:4600,texts:audit.codes.map(c=>c==='ko'?'체력 {p0}':'Health {p0}')}]}};
 const rows=audit.extract(data,'first_practice.json');assert.equal(rows.length,1);assert.equal(rows[0].values.fr,'Health {p0}');assert.equal(audit.validate(rows).length,0);
 data.localization.entries[0].texts[audit.codes.indexOf('fr')]='';
 assert(audit.validate(audit.extract(data,'first_practice.json')).some(x=>x.kind==='empty'&&x.code==='fr'));
 data.localization.entries[0].key='다른 원문';assert.throws(()=>audit.extract(data,'first_practice.json'),/원문/);
});
