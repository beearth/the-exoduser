import fs from 'node:fs';import crypto from 'node:crypto';
const arg=n=>process.argv.slice(2).find(x=>x.startsWith(n+'='))?.slice(n.length+1);
const game=arg('--source-game'),catalog=arg('--catalog'),out=arg('--out-file');if(!game||!catalog||!out)throw Error('explicit source/catalog/out required');
const s=fs.readFileSync(game,'utf8'),packet=JSON.parse(fs.readFileSync(catalog,'utf8'));
if(crypto.createHash('sha256').update(s).digest('hex')!==packet.source_sha256)throw Error('source/catalog drift');
const lines=s.split('\n'),hits=new Map();
for(let i=0;i<lines.length;i++){if(lines[i].trim().startsWith('//'))continue;for(const m of lines[i].matchAll(/_eqAffix\(['"]([^'"]+)['"]\)/g)){if(!hits.has(m[1]))hits.set(m[1],[]);hits.get(m[1]).push(i+1);}}
// Resolve the original indexed hurtE lookup as well as literal calls.
for(const name of ['_elAx','_elBn']){const m=new RegExp('const '+name+'=(\\[[^\\]]+\\])').exec(s);if(!m)throw Error('dynamic element lookup drift');for(const id of [...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1])){if(!hits.has(id))hits.set(id,[]);hits.get(id).push(s.slice(0,s.indexOf('_eqAffix(_elAx')).split('\n').length);}}
const system=new Set(['lckFlatR','mpCostRed','dropRate','stCostRed','skillCdRed','potionPower','lckFlatN','expBonus','lifeHealPow','cooldownRed','helmCooldown','endCooldownAll','goldBonus','potionCdRed','skillBoost']);
const selected=[...system].filter(x=>!['goldBonus','potionCdRed'].includes(x));
const rows=packet.rows.filter(r=>r.route==='owner_unverified').map(r=>{const all=hits.get(r.id)??[],runtime=all.filter(n=>!(n>=14364&&n<=15130)&&!(n>=49000&&n<=52000));const zero=Object.values(r.counts).every(x=>x===0);if(zero)throw Error('zero Monte Carlo observations do not prove zero probability');
return {id:r.id,normal:r.counts.normal,definition_lines:r.variants.map(v=>v.source_line),literal_consumer_lines:all,runtime_literal_lines:runtime,classification:system.has(r.id)?'1_system':runtime.length?'2_PC_protected':'UNCONFIRMED_SOURCE_CONSUMER',selected:selected.includes(r.id),status:selected.includes(r.id)?'VERIFICATION_PENDING':'NOT_READY',reason:selected.includes(r.id)?'existing_owner_cache_handoff':system.has(r.id)?'native_consumer_owner_missing':runtime.length?'pc_iface_pack':'no_verified_runtime_consumer_not_zero_drop'};});
const result={source_sha256:packet.source_sha256,base:'5a3af4106b3fc944177f94563d7fc4988a33ebf3',total:rows.length,selected_ids:rows.filter(r=>r.selected).map(r=>r.id),summary:Object.fromEntries(['1_system','2_PC_protected','3_zero_drop','UNCONFIRMED_SOURCE_CONSUMER'].map(k=>[k,rows.filter(r=>r.classification===k).length])),rows};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({summary:result.summary,selected:result.selected_ids}));
