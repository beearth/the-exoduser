const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
for(const file of ['game.html','game-easy-test.html']){
 const s=fs.readFileSync(file,'utf8');
 const a=s.indexOf('const HELL_SPAWN='),b=s.indexOf('function rollEl(si)',a);
 let seed=42;const math=Object.create(Math);math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const c=vm.createContext({Math:math,EL:{P:0,F:1,I:2,D:3},SI_TO_HELL:[0,0]});vm.runInContext(s.slice(a,b),c);
 const first=new Set(),later=new Set();for(let i=0;i<5000;i++){first.add(c.rollEtype(0));later.add(c.rollEtype(1));}
 for(const et of [2,22,30,43])assert.equal(first.has(et),false);
 assert.ok(first.has(0)&&first.has(1));assert.ok(later.has(2)&&later.has(22));
 const guard=s.slice(s.indexOf('function mkEn('),s.indexOf('  if(!isFinite(x)',s.indexOf('function mkEn(')));
 vm.runInContext(guard+'return etype;}',c);
 for(const et of [2,22,30,43]){assert.equal(c.mkEn(1,1,0,et,false),0);assert.equal(c.mkEn(1,1,1,et,false),et);assert.equal(c.mkEn(1,1,0,et,true),et);}
}
console.log('PASS: stage 1-1 excludes chargers across weighted spawns, summons and save restoration; later stages and bosses preserved.');
