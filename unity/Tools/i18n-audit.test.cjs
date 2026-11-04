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
