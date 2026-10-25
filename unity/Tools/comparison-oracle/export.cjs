const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(process.argv[2],'utf8');
const keys=vm.runInNewContext(source.match(/const cmpKeys=(\[\[.*?\]\]);/)[1]);
const seed=JSON.parse(fs.readFileSync('../inventory-oracle/oracle.json')).starting;
const slots=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'];
const cases=seed.bag.map((item,index)=>{const eq=seed.equipped[slots.indexOf(item.slot)];const rows=[];if(eq){for(const [key,label,invert] of keys){const delta=(item[key]||0)-(eq[key]||0);if(Math.abs(delta)>.0001)rows.push({key,delta,better:invert?delta<0:delta>0});}const n={},o={};for(const a of item.affixes||[])n[a.id]=(n[a.id]||0)+a.value;for(const a of eq.affixes||[])o[a.id]=(o[a.id]||0)+a.value;for(const key of new Set([...Object.keys(n),...Object.keys(o)])){const delta=(n[key]||0)-(o[key]||0);if(Math.abs(delta)>.0001)rows.push({key,delta,better:delta>0});}}return {index,rows};});
fs.writeFileSync('oracle.json',JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),seed,cases},null,2)+'\n');
