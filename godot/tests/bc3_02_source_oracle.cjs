// BC3-02 independent oracle: reuse the adopted test harness scaffolding only.
// Actual functions/statements are still read unchanged from latest game.html.
// No product GDScript import and no postcomputed expected color/stage overwrite.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),path=require('node:path');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'explicit source/output required');
const raw=fs.readFileSync(sourcePath),lines=raw.toString('utf8').split('\n'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(sha(raw),'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
const helperPath=path.join(__dirname,'bc2_02_source_oracle.cjs'),helper=fs.readFileSync(helperPath,'utf8');
const pin='fffd043604767a7cb800ffb82dbd4bf06d00dce324cf3270fd39a3510f5e512d';assert.equal(sha(helper),pin,'unmodified adopted CH2 test scaffolding');
const stop=helper.indexOf('\nconst result={game_sha256:');assert(stop>0);
const sandbox={require,process:{argv:['node',helperPath,sourcePath,outputPath]}};
vm.runInNewContext(helper.slice(0,stop)+';globalThis.readOnlyHarnesses=harnesses',sandbox);
const declaration=[lines[14332],lines.slice(9819,10011).join('\n'),lines[14337],lines.slice(16632,16712).join('\n')].join('\n');
const registration=vm.createContext({location:{search:''},window:{EXODUSER_BUILD_TARGET:'full'}});
vm.runInContext(declaration,registration);const info=vm.runInContext('({moves:BOSS_MOVES,sets:_BOSS_MOVESET.map(s=>[...s]),stages:STG,colors:ELC})',registration);
const ch1=new Set(info.sets.slice(0,4).flat()),ch3=new Set(info.sets.slice(10,14).flat()),common=[...ch3].filter(id=>ch1.has(id));
assert.equal(common.length,21);assert.equal(ch3.size-common.length,16);
const stageCode=[lines[14332],lines.slice(16632,16643).join('\n'),lines.slice(16657,16666).join('\n'),lines.slice(16678,16712).join('\n')].join('\n');
const units={};
for(const [unit,inherited]of Object.entries(sandbox.readOnlyHarnesses)){
 let code=inherited.replaceAll('si=4;si<10;si++','si=10;si<14;si++');
 // Only fixture inputs change here: every CH3 actor is ice. Source statements
 // come from lines.slice() inside each inherited scaffold and remain untouched.
 code=code.replaceAll('el:0','el:2').replace(/col:'#[0-9a-f]+'/g,"col:'#3388ff'").replace('e.el=mi%9','e.el=2');
 if(unit==='bc02'){
  const old='const STG=Array.from({length:35},(_,si)=>({monLv:si<4?100:200}));const SI_TO_HELL=Array.from({length:35},(_,si)=>si<4?0:1);const _DEMO_MODE=true,_DEMO_LAST_STAGE=0;';
  assert(code.includes(old));
  // The scaffold stores its code in single-quoted JS, so encode the literal.
  if(code.includes(old))code=code.replace("'"+old+"'",JSON.stringify(stageCode+'\nconst _DEMO_MODE=true,_DEMO_LAST_STAGE=0;'));
  code=code.replace('0,true,0,request.room','0,true,STG[request.si].be,request.room');
  const marker='fs.writeFileSync(out+\'/source-oracle.json\'';const at=code.indexOf(marker);assert(at>0);
  code=code.slice(0,at)+"for(let si=10;si<14;si++){cases.push(run(req(si,100),'safe'));cases.push(run(req(si,100),'none'));}\n"+code.slice(at);
 }
 if(unit==='bc05'){
  assert(code.includes('if(si<4)si+=4;'));code=code.replace('if(si<4)si+=4;','');
  const at=code.indexOf('const receipt=');assert(at>0);
  const extra=`
const originalClockRows=cases.filter(r=>r.si<4&&r.method!=='phase');
for(let si=10;si<14;si++)for(const method of [...new Set(originalClockRows.map(r=>r.method))]){
 const group=originalClockRows.filter(r=>r.method===method);for(const i of [...new Set([0,Math.floor(group.length/2),group.length-1])]){const r=group[i];run('ch3-clock-'+r.name,r.method,si,r.enemy,r.sp,r.context,r.unit)}
}
const thresholdRows=cases.filter(r=>r.name==='phase-threshold'&&r.enemy._bossPhase===0&&r.enemy.mhp===1000);
for(let si=10;si<14;si++)for(const r of thresholdRows)run('ch3-threshold','phase',si,r.enemy,r.sp,r.context,r.unit);
`;
  code=code.slice(0,at)+extra+code.slice(at);
 }
 const files=new Map(),vfs={readFileSync(name){assert.equal(name,'game.html');return raw},writeFileSync(name,content){files.set(path.basename(name),String(content))}};
 vm.runInNewContext(code,{fs:vfs,vm,crypto,assert,structuredClone,console:{log(){}}},{timeout:60000,filename:unit+'-ch3-fixture.js'});
 const data=JSON.parse(files.get('source-oracle.json'));let rows=data.cases.filter(r=>{const si=Array.isArray(r)?r[0]:(r.request?.si??r.si);return si>=10&&si<=13});
 if(unit==='bc03')rows=rows.filter(r=>r[3]===(r[0]+r[1])%5||(['charge','laser','poisonTrail'].includes(data.moves[r[1]].id)));
 if(unit==='bc04'){
  const selected=[];for(let si=10;si<14;si++)for(const ph of [0,4]){
   const all=rows.filter(r=>r.si===si&&r.enemy._bossPhase===ph);
   for(const predicate of [r=>!r.expected.start_pattern,r=>r.expected.rng_ledger.some(x=>x.field==='roulette'),r=>r.expected.start_pattern&&!r.expected.rng_ledger.some(x=>x.field==='roulette')]){const row=all.find(predicate);assert(row,'selector path fixture');selected.push(row)}
  }rows=selected;
 }
 if(unit==='bc05')rows=rows.filter(r=>r.name.startsWith('ch3-')||(r.name==='phase-stats-normal'));
 if(unit==='bc06')rows=rows.filter(r=>common.includes(r.id)&&((r.name==='all24'&&r.phase===(r.si+common.indexOf(r.id))%5)||r.name==='tele-zero-fallback'));
 if(unit==='bc07'){
  const selected=[];for(let si=10;si<14;si++)for(const state of [...new Set(rows.map(r=>r.enemy.s))]){
   const group=rows.filter(r=>r.si===si&&r.enemy.s===state);
   for(const i of [...new Set([0,Math.floor(group.length/2),group.length-1])])selected.push(group[i]);
  }rows=selected;
 }
 assert(rows.length,unit+' actual CH3 rows');assert.deepEqual([...new Set(rows.map(r=>Array.isArray(r)?r[0]:(r.request?.si??r.si)))].sort((a,b)=>a-b),[10,11,12,13]);data.cases=rows;units[unit]=data;
}
assert.deepEqual([...new Set(units.bc05.cases.map(r=>r.method))].sort(),['phase','lesson_gate','telegraph','after_wall_push','after_knockback','attack_reset','after_aura','after_projectile_charge','dispatch_phase','after_ai_feint','recovery_switch'].sort());
function transport(v){if(typeof v==='number'){assert(Number.isFinite(v));if(Number.isSafeInteger(v))return {__int:String(v)};const b=Buffer.alloc(8);b.writeDoubleLE(v);return {__f64:b.toString('hex')}}if(Array.isArray(v))return v.map(transport);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,transport(x)]));return v}
const summary={cases:Object.fromEntries(Object.entries(units).map(([k,d])=>[k,d.cases.length])),common_start_ids:common,other_start_ids:[...ch3].filter(id=>!ch1.has(id))};
fs.writeFileSync(outputPath,JSON.stringify(transport({source_only:true,game_sha256:sha(raw),units,summary})),'utf8');console.log(JSON.stringify(summary));
