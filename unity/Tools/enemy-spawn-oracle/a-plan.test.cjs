const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),test=require('node:test');
const file=path.join(__dirname,'a-plan.cjs');
const layer=fs.existsSync(file)?require(file):{};
test('A안 투사체 정책을 VM 실행 전에 주입한다',()=>{
 assert.equal(typeof layer.create,'function','A안 기대값 층이 필요하다');
 const p=layer.create('a-plan');
 for(const et of [0,4,5,6,9,11,19,20,24,29,50,59])assert.equal(p.interval(et),9999);
 for(const et of [1,7,8,13,16,17,25,26])assert.equal(p.interval(et),240);
 for(const et of [3,10,15,21,90,99])assert.equal(p.interval(et),480);
 assert.throws(()=>layer.create('unknown'),/mode/);
 const web=fs.readFileSync(process.env.A_PLAN_WEB||path.join(__dirname,'../../../game.html'),'utf8'),start=web.indexOf('function mkEn('),end=web.indexOf('\n}',start)+2,body=web.slice(start,end);
 const patched=p.inject(body,web.split('\n'));
 assert.notEqual(patched,body);assert.equal(p.metadata.injections.length,3);
 for(const row of p.metadata.injections){assert.ok(row.line>0);assert.ok(row.before);assert.ok(row.after);}
 const raw=layer.create('web');assert.equal(raw.inject(body,web.split('\n')),body);assert.equal(raw.prelude,'');assert.equal(raw.metadata.injections.length,0);
 assert.throws(()=>layer.create('a-plan').inject(body.replace('projCd:_projCd,','projCd:123,'),web.split('\n')),/anchor/);
});