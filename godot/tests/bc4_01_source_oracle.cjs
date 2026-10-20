// BC4-01 independent oracle: evaluate only exact original registration declarations.
// Never import the Godot catalog. All numbers carry integers or binary64 bits.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,targetPath]=process.argv.slice(2);assert(sourcePath&&targetPath,'explicit source/output paths required');
const raw=fs.readFileSync(sourcePath),source=raw.toString('utf8'),lines=source.split('\n');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(sha(raw),'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
const pins=[{"first": 9820, "last": 10011, "sha256": "bd4f7cfcf870711b9031268470775d592a9067efd1c03bbf479034bcb72c7ee1"}, {"first": 14333, "last": 14333, "sha256": "a0bb447f773a52c3c7a8dade348dccb9ff74c0823ab8ee5976618ddb0cee4340"}, {"first": 14338, "last": 14338, "sha256": "117540421830f822266f9f5c1361147f7a4744641ec03d8a95a36da137bc1f22"}, {"first": 16633, "last": 16712, "sha256": "a96f67cf2591f091f9a83a930ae73772c7048dbf5245b25341b899369ee2f6dd"}];
for(const p of pins)assert.equal(sha(lines.slice(p.first-1,p.last).join('\n')),p.sha256,`source range ${p.first}..${p.last}`);
for(const name of ['BOSS_MOVES','BOSS_COMBOS','BOSS_PHASES','HELL_BOSSES'])assert.equal((source.match(new RegExp('^const '+name+'[= ]','gm'))||[]).length,1,'unique declaration '+name);
const ctx=vm.createContext({location:{search:''},window:{EXODUSER_BUILD_TARGET:'full'}});
const extract=[pins[1],pins[2],pins[0],pins[3]].map(p=>lines.slice(p.first-1,p.last).join('\n')).join('\n');
vm.runInContext(extract,ctx,{filename:'original-registration.js',timeout:2000});
const data=vm.runInContext('({moves:BOSS_MOVES,combos:BOSS_COMBOS,phases:BOSS_PHASES,sets:_BOSS_MOVESET.map(x=>[...x]),stages:STG,colors:ELC})',ctx);
assert.equal(data.moves.length,59);assert.equal(data.combos.length,68);assert.equal(Object.keys(data.phases).length,5);
const ids=new Set(data.sets.slice(14,21).flat());assert.equal(ids.size,45);
const moves=data.moves.map((m,i)=>({...m,source_ordinal:i,source_line:9821+i})).filter(m=>ids.has(m.id));
const combos=data.combos.map((c,i)=>({...c,source_ordinal:i,source_line:9882+i})).filter(c=>c.seq.every(id=>ids.has(id)));
const stages=[14,15,16,17,18,19,20].map(si=>({supported:true,si,hell:data.stages[si].hell,name_ko:data.stages[si].bn,element_id:data.stages[si].be,element_color:data.colors[data.stages[si].be],ib:true,etype:0,move_ids:data.sets[si]}));
const stageCombos=stages.map(st=>[0,1,2,3,4].map(ph=>combos.filter(c=>c.phase.includes(ph)&&c.seq.every(id=>st.move_ids.includes(id)))));
const manifest=data.moves.map((m,i)=>({id:m.id,idx:m.idx,source_ordinal:i,source_line:9821+i}));
const ch2=new Set(data.sets.slice(4,10).flat()),ch3=new Set(data.sets.slice(10,14).flat());
const commonIds=[...ids].filter(id=>ch2.has(id)||ch3.has(id));
const sharedOrdinals=combos.filter(c=>c.seq.every(id=>ch3.has(id))||c.seq.every(id=>ch2.has(id))).map(c=>c.source_ordinal);
const newIds=Array.from(moves.filter(m=>!commonIds.includes(m.id)),m=>m.id);
const newOrdinals=Array.from(combos.filter(c=>!sharedOrdinals.includes(c.source_ordinal)),c=>c.source_ordinal);
const overlapIds=[...ch3].filter(id=>ch2.has(id));
const counts=stageCombos.map(row=>row.map(c=>c.length));
assert.deepEqual(stages.map(st=>st.move_ids.length),[39,40,41,42,43,44,45]);assert.equal(moves.length,45);assert.equal(combos.length,54);assert.equal(commonIds.length,39);assert.equal(sharedOrdinals.length,46);assert.equal(overlapIds.length,30);
assert.deepEqual(newIds,['meteor','radialLaser','swordWave','pillars','burstCounter','chainLightning']);
assert.deepEqual(newOrdinals,[13,14,30,31,32,35,49,56]);
assert.deepEqual(counts,[[16,32,43,46,46],[17,34,46,49,49],[17,35,47,50,50],[17,35,47,50,50],[17,35,48,51,51],[17,35,49,53,53],[17,36,50,54,54]]);
const result={source_game_sha256:sha(raw),source_ranges:pins,manifest,stages,moves,combos,phases:[0,1,2,3,4].map(ph=>data.phases[ph]),stage_combos:stageCombos,common_ids:commonIds,overlap_ids:overlapIds,common_combo_ordinals:sharedOrdinals,new_ids:newIds,new_combo_ordinals:newOrdinals,combo_counts:counts};
function encode(v){if(typeof v==='number'){assert(Number.isFinite(v));if(Number.isSafeInteger(v))return {integer:String(v)};const b=Buffer.alloc(8);b.writeDoubleLE(v);return {binary64:b.toString('hex')}}if(Array.isArray(v))return v.map(encode);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]));return v}
fs.writeFileSync(targetPath,JSON.stringify(encode(result)),'utf8');
console.log(JSON.stringify({source_only:true,moves:moves.length,combos:combos.length,sets:stages.map(st=>st.move_ids.length),common_moves:commonIds.length,common_combos:sharedOrdinals.length,new_ids:newIds,new_combo_ordinals:newOrdinals,combo_counts:counts}));
