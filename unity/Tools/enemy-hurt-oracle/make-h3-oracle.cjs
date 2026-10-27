// Writes a smaller oracle containing only the death-head cases (H3 + CH3) so that mutation runs of EnemyHurt.Death.cs are fast.
//   node make-h3-oracle.cjs [--in oracle.json] [--out <file>]
const fs=require('node:fs'),path=require('node:path');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const o=JSON.parse(fs.readFileSync(path.resolve(__dirname,arg('--in','oracle.json')),'utf8'));
o.cases=o.cases.filter(c=>c.kind==='H3'||c.kind==='CH3');
const s=o.summary;s.cases=o.cases.length;s.h1=0;s.h2=0;s.chain=0;s.h3=o.cases.filter(c=>c.kind==='H3').length;s.chain3=o.cases.filter(c=>c.kind==='CH3').length;s.earlyReturns=0;
s.addedEnemies=o.cases.reduce((n,c)=>n+c.expected.added.length,0);
const ex={};for(const c of o.cases)ex[c.expected.exit]=(ex[c.expected.exit]||0)+1;s.h3Exits=ex;
fs.writeFileSync(path.resolve(__dirname,arg('--out','oracle-h3.json')),JSON.stringify(o));
console.log(JSON.stringify({cases:s.cases,h3:s.h3,chain3:s.chain3,exits:ex}));
