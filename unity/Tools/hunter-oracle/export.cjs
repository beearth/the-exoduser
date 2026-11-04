// D-U1: runs the ORIGINAL web _hunterMul(e) of a pinned main game.html over a boss / elite / rare / plain x pHunter rank matrix.
// usage: node export.cjs --source <game.html> --out <oracle.json>
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function arg(k){const i=process.argv.indexOf(k);if(i<0||!process.argv[i+1])throw Error('Pass '+k);return process.argv[i+1];}
const source=fs.readFileSync(arg('--source'),'utf8'),m=/^function _hunterMul\(e\)\{.*\}\s*$/m.exec(source);
if(!m)throw Error('_hunterMul not found');
const ctx=vm.createContext({PASSIVES:{}});vm.runInContext(m[0],ctx);
const cases=[];
for(const ib of [false,true])for(const elite of [0,1,2,3,null])for(const etype of [0,5,19,89,90,95,99])for(const rank of [0,1,3,10]){
  ctx.PASSIVES.pHunter=rank;const e={ib,etype};if(elite!==null)e.elite=elite;
  cases.push({ib,elite:elite===null?0:elite,eliteMissing:elite===null,etype,rank,web:vm.runInContext('_hunterMul(__e)',Object.assign(ctx,{__e:e}))});
}
fs.writeFileSync(arg('--out'),JSON.stringify({sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),line:source.slice(0,m.index).split('\n').length,function:m[0].trim(),cases}));
console.log('HUNTER_ORACLE '+cases.length+' cases from line '+source.slice(0,m.index).split('\n').length);
