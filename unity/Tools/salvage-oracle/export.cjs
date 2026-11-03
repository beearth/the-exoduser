// Salvage value oracle exporter: extracts _itemEconomyRarity + salvageVal from game.html by text anchor, runs them in a Node VM
// over a generated input grid and writes oracle.json. No hand-written expectation; JS runs only here, never in the native runtime.
//   node export.cjs [--source G:/exoduser/game.html] [--out oracle.json]
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const sourcePath=arg('--source','G:/exoduser/game.html'),outPath=arg('--out',path.join(__dirname,'oracle.json'));
const text=fs.readFileSync(sourcePath,'utf8'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const lines=text.split('\n'),anchors=[];
function block(prefix){
  const hits=[];lines.forEach((l,i)=>{if(l.trim().startsWith(prefix))hits.push(i);});
  if(hits.length!==1)throw Error('anchor must match once: '+prefix+' ('+hits.length+')');
  let depth=0,end=-1;for(let i=hits[0];i<lines.length&&end<0;i++)for(const ch of lines[i]){if(ch==='{')depth++;else if(ch==='}'&&--depth===0){end=i;break;}}
  const body=lines.slice(hits[0],end+1).join('\n');anchors.push({name:prefix,start:hits[0]+1,end:end+1,sha256:sha(body)});return body;
}
const code=block('function _itemEconomyRarity(')+'\n'+block('function salvageVal(')+'\n;salvageVal';
const salvageVal=vm.runInNewContext(code,{Math});
const cases=[];
const add=(it)=>cases.push({input:it,value:salvageVal(it)});
for(let r=0;r<=5;r++)for(const e of [0,1,5,20])for(let t=0;t<=7;t++)add({rarity:r,enh:e,tier:t});
// edges: missing fields, negative rarity, high enhance
add({rarity:-1,enh:3,tier:2});add({rarity:7,enh:2,tier:1});add({});add({rarity:2});
for(const e of [2,3,10,50,100,250])for(const r of [0,2,4])add({rarity:r,enh:e,tier:4});
fs.writeFileSync(outPath,JSON.stringify({source:{path:path.basename(sourcePath),sha256:sha(text),anchors},cases},null,1)+'\n');
console.log('oracle cases '+cases.length+' -> '+outPath);
