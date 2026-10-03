'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const argv=process.argv.slice(2),option=n=>{const i=argv.indexOf(n);return i<0?argv.find(a=>a.startsWith(n+'='))?.slice(n.length+1):argv[i+1];};
const memory=argv.includes('--memory-source16'),live=argv.includes('--live');
function usage(reason){console.log(JSON.stringify({status:'EXPLICIT_MODE_AND_UNIQUE_OUTPUT_REQUIRED',reason,executedCases:0,overallPass:null}));process.exit(2);}
if(memory===live||!option('--output'))usage('select exactly one mode and provide --output');
const root=path.resolve(option('--root')||process.cwd()),output=path.resolve(option('--output'));
const allowedOutput=path.join(root,'tmp'),outputRelative=path.relative(allowedOutput,output);
if(!outputRelative||outputRelative==='..'||outputRelative.startsWith('..'+path.sep)||path.isAbsolute(outputRelative)||!output.endsWith('.json')||fs.existsSync(output))usage('output must be a new JSON file inside root/tmp');
function ensureOutputParent(){
 let current=root;assert(fs.statSync(current).isDirectory(),'root directory exists');
 for(const component of path.relative(root,path.dirname(output)).split(path.sep)){
  current=path.join(current,component);
  if(fs.existsSync(current)){const stat=fs.lstatSync(current);assert(stat.isDirectory()&&!stat.isSymbolicLink(),'output parent must be a real directory: '+current);}
  else fs.mkdirSync(current);
 }
}
const retainedReceipt=option('--baseline-receipt')?path.resolve(option('--baseline-receipt')):null,retainedReceiptSHA='ebb713e0a123b42dd2a92d8651619f73af9ccfb0c007662f2018893e88a1ffe6';
let retained=null;
if(retainedReceipt){const retainedBytes=fs.readFileSync(retainedReceipt);assert.equal(shaRetained(retainedBytes),retainedReceiptSHA,'optional frozen memory receipt exact');retained=JSON.parse(retainedBytes);}
function shaRetained(x){return crypto.createHash('sha256').update(x).digest('hex');}
const {parse}=require(require.resolve('acorn',{paths:[root]}));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const pins={'game.html':'399fd8b0b37b62ba9a95eb177e56693cba1b77827cde2146f3d2a3799f2ddc51','game-easy-test.html':'a88404ed79083753a1383ca6f7b82533bb3f198923cd63abcf34379f7b25afb9'};
const livePins={'game.html':'7ae190a940fe6983c6e8fe8c7463f8f77348ab398c354b7d8f66f0bea9d04b7c','game-easy-test.html':'db2b15bee93f7588064398af082ef25cdd498382f4f24ea01a00b3d261286249'};
const patches=[
 {id:'sky-impact-field-consumer',old:'      for(let _spi=0;_spi<28;_spi++){',next:'      _hurtFieldMobs(sc.x,sc.y,sc.r,sc.dmg);\n      for(let _spi=0;_spi<28;_spi++){'},
 {id:'sky-dot-field-consumer',old:'      for(let _sfi=0;_sfi<4;_sfi++){',next:'      _hurtFieldMobs(sc.x,sc.y,sc.fireRadius,~~(sc.dmg*sc.dotMul));\n      for(let _sfi=0;_sfi<4;_sfi++){'},
 {id:'sky-shard-field-consumer',old:'      for(let _spi=0;_spi<sc.shardCount;_spi++){',next:'      _hurtFieldMobs(sc.x,sc.y,sc.r,~~(sc.dmg*.35));\n      for(let _spi=0;_spi<sc.shardCount;_spi++){'}
];
const fnNames=['_dispatchSkillSlot','activateGiantSlam','_gSlamHit','_skyCrusherSpec','_skyCrusherChargeCount','_skyCrusherRechargeFrames','_tickSkyCrusherRecharge','_skyCrusherTarget','activateSkyCrusher','_fmXY','_fmCanHit','_fmApply','_hurtFieldMobs','_fbAliveCount','_fbMarkDead','_fdMarkDead','_eqAffixRebuild','_eqAffix','_eqStatRebuild','_eqStat','_eqImplicit','wp','hm','_uEq','_slotFlatAtk','enhMulAtk','_lvB','meleeRef','magicRef','statStr','statInt','_passDmgSum','pAtkMul','pMagicMul','_cdRed','_skMul','pAtkCost','pMeleeStCost','pBowCost','_skLv','_dpsCostMul','_stDisc','stCost','useStPct','_malCost','_isFused','_isAbsorbed','_getAbsorbed','_skById','_isAreaSkillId','_isRageBurstSkillId','_canAssignSkillSlot','elMul','_r'];
const declNames=['_COST_BASE','_COST_SK','_COST_DPS','_SK_MUL','_FUSE_PAIRS','SKILL_LIST','_MINI_STUN','_MALICE_COST_MUL','EL','SLOT_NAMES','BINDS','BINDS2'];
function walk(n,f){if(!n||typeof n!=='object')return;if(n.type)f(n);for(const v of Object.values(n)){if(Array.isArray(v))for(const e of v)walk(e,f);else if(v&&typeof v==='object')walk(v,f);}}
function extract(html,file){
 const parts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m=>!/\bsrc\s*=/.test(m[1])&&m[2].includes('function _gSlamHit('));assert.equal(parts.length,1);
 const m=parts[0],code=m[2],offset=m.index+m[0].indexOf(code),ast=parse(code,{ecmaVersion:'latest'}),nodes=[];walk(ast,n=>nodes.push(n));const txt=n=>code.slice(n.start,n.end);
 const one=(label,p)=>{const a=nodes.filter(p);assert.equal(a.length,1,file+' '+label);return a[0];};
 const top=name=>{const a=ast.body.filter(n=>n.type==='FunctionDeclaration'&&n.id.name===name||n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.equal(a.length,1,file+' '+name);return a[0];};
 const keyboard=one('actual full gameplay keyboard callback',n=>n.type==='CallExpression'&&n.callee?.name==='addEventListener'&&n.arguments[0]?.value==='keydown'&&txt(n.arguments[1]).includes("_dispatchSkillSlot(4,'Space')")).arguments[1];
 const tick=one('actual complete sky update branch',n=>n.type==='IfStatement'&&txt(n.test)==='G._skyCrushers');
 const registration=ast.body.find(n=>n.type==='ForOfStatement'&&txt(n).includes('_SK_MAP.set(_s.id,_s)'));assert(registration);
 const meta=n=>({line:html.slice(0,offset+n.start).split('\n').length,bytes:Buffer.byteLength(txt(n)),sha256:sha(txt(n))});
 return {code:declNames.map(n=>txt(top(n))).join('\n')+'\nconst _SK_MAP=new Map();'+txt(registration)+'\n'+fnNames.map(n=>txt(top(n))).join('\n')+'\nglobalThis.__keyboard='+txt(keyboard)+';\nfunction __skyTick(sp,_hdCdBonus){_tickSkyCrusherRecharge(sp+_hdCdBonus);'+txt(tick)+'}',metadata:{functions:Object.fromEntries(fnNames.map(n=>[n,meta(top(n))])),keyboard:meta(keyboard),skyTick:meta(tick)},giant:txt(top('_gSlamHit')),tick:txt(tick)};
}
function read(file){
 const raw=fs.readFileSync(path.join(root,file)),actual=raw.toString('utf8');assert.equal(sha(raw),(live?livePins:pins)[file],'exact selected source pin');
 let original=actual,candidate=actual;
 if(memory){for(const p of patches){assert.equal(candidate.split(p.old).length-1,1,file+' '+p.id);candidate=candidate.replace(p.old,p.next);}}
 else{for(const p of patches.slice().reverse()){assert.equal(original.split(p.next).length-1,1,file+' reverse '+p.id);original=original.replace(p.next,p.old);}assert.equal(sha(original),pins[file],'live inverse exact source16');}
 let inverse=candidate;for(const p of patches.slice().reverse()){assert.equal(inverse.split(p.next).length-1,1);inverse=inverse.replace(p.next,p.old);}assert.equal(inverse,original);
 const a=extract(original,file),b=extract(candidate,file);assert.equal(a.giant,b.giant,'existing giant field consumer byte unchanged');assert(a.giant.includes('_hurtFieldMobs(P.x,P.y,range,dmg);'));
 for(const name of fnNames)assert.equal(a.metadata.functions[name].sha256,b.metadata.functions[name].sha256,'existing producer/helper function bytes '+name);
 let restoredTick=b.tick;for(const p of patches.slice().reverse())restoredTick=restoredTick.replace(p.next,p.old);assert.equal(restoredTick,a.tick,'ordinary sky branch bytes outside three consumers preserved');
 return {file,original:a,candidate:b,live:b,receipt:{file,inputMode:live?'live-source17':'memory-source16',input:{bytes:raw.length,sha256:sha(raw)},before:{bytes:Buffer.byteLength(original),sha256:sha(original)},candidate:{bytes:Buffer.byteLength(candidate),sha256:sha(candidate)},delta:Buffer.byteLength(candidate)-Buffer.byteLength(original),inverseExact:true,ordinaryBranchBytesPreserved:true,giantExistingFieldConsumerPreserved:true,originalExtraction:a.metadata,candidateExtraction:b.metadata}};
}
function mob(kind,patch={}){return {id:kind,x:0,y:0,r:kind==='worm'?56:kind==='fd'?100:120,hp:10000,mhp:10000,alive:true,hid:0,tpT:0,emT:0,hitCd:0,_fmKind:kind==='fd'?'fd':undefined,phase:'peek',hideT:0,...patch};}
function fixture(source,variant,opts={}){
 const hits=[],fx=[],events=[],proficiency=[];let seed=0x5317;
 const M=Object.create(Math);M.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const fb=mob('fb',opts.fb),worm=mob('worm',opts.worm),fd=mob('fd',opts.fd);
 const near={id:'near',x:0,y:0,r:20,hp:10000,alive:true,el:0,kb:{x:0,y:0},poise:1,stunned:0};
 const far={id:'far',x:4000,y:0,r:20,hp:10000,alive:true,el:0,kb:{x:0,y:0},poise:1,stunned:0};
 const dead={id:'dead',x:0,y:0,r:20,hp:0,alive:false,el:0,kb:{x:0,y:0},poise:1,stunned:0};
 const P={x:0,y:0,r:16,lv:1,skills:{giantSlam:1,skyCrusher:1},s:'idle',st:200,mst:200,mp:200,mmp:200,rage:0,facing:0,baseAtk:10,_atkBon:0,_fused:{}};
 const G={on:true,paused:false,mats:1000,cam:{x:0,y:0},_fieldBosses:[fb],_fieldBoss:fb,_worms:[worm],_fireDevils:[fd],hitStop:0,slowMo:0,_flashT:0};
 class Element{closest(){return null}}
 const ctx={P,G,Math:M,console,Element,performance:{now:()=>1000},STATS:{str:0,int:0},INV:{equipped:{}},PASSIVES:{pAtk:0,pMagic:0,pBow:0,pMelee:0,pRage:0},OPT:{parts:0,shake:0},SKILL_SLOTS:[null,null,null,null,opts.skill||'skyCrusher',null],ULT_SLOT:null,
 _eqAffixCache:null,_eqStatCache:null,_lastCost:0,_gxFiring:false,_gpActive:false,_MAP_QA_MODE:false,_harpActive:false,_dashActive:false,_shBufI:0,window:{},VW:800,VH:600,mouse:{x:400,y:300},K:{},KH:{},listeningBind:null,
 ELC:Array(7).fill('#fff'),ELP:Array(7).fill('#fff'),
 $:()=>({classList:{contains:()=>false},style:{display:'none'}}),_T:x=>x,_L:(a,b)=>a,dst:(a,b,c,d)=>Math.hypot(a-c,b-d),shQuery:()=>[near,far,dead],
 hurtE:(e,...args)=>hits.push({id:e.id,args}),_fmDeathFx:(m,...args)=>fx.push({id:m.id,args}),
 showPH:(...args)=>events.push(['showPH',...args]),addTxt:(...args)=>events.push(['text',...args]),addParts:()=>{},poolPart:()=>{},shake:n=>events.push(['shake',n]),
 playSample:(...args)=>events.push(['sample',...args]),SFX:{slam:()=>events.push(['slam']),skyCrusherFall:()=>events.push(['sky-fall']),skyCrusherImpact:()=>events.push(['sky-impact'])},
 _addSkProf:x=>proficiency.push(x),_addLavaErupt:()=>{},_addBoom:(...args)=>events.push(['boom',...args]),_detonateAssaultFlames:()=>events.push(['detonate-empty']),
 _poiseHit:(...args)=>events.push(['poise',args[1]])};
 Object.assign(P,opts.P||{});Object.assign(G,opts.G||{});
 vm.createContext(ctx);vm.runInContext(source[variant].code,ctx,{timeout:3000});
 const key=()=>ctx.__keyboard({code:'Space',repeat:false,ctrlKey:false,metaKey:false,target:new Element(),preventDefault:()=>events.push(['preventDefault'])});
 const tick=(sp=1)=>ctx.__skyTick(sp,0);
 const snapshot=()=>JSON.parse(JSON.stringify({P,G,hits,fx,events,proficiency}));
 return {ctx,P,G,fb,worm,fd,hits,fx,events,proficiency,key,tick,snapshot,variant,file:source.file};
}
const groups=[];const record=(file,variant,id,fn)=>{try{const data=fn();groups.push({file,variant,id,pass:true,data});}catch(e){groups.push({file,variant,id,pass:false,error:e.message,fixtureError:['ReferenceError','SyntaxError','TypeError'].includes(e.name)});}};
function cast(f){f.key();assert.equal(f.G._skyCrushers.length,1);const sc=f.G._skyCrushers[0];assert.equal(f.P.mp,120);assert.equal(f.P._scCharges,2);assert.equal(f.P._scCd,900);assert.equal(sc.impactT,36);assert.equal(sc.r,260);assert.equal(sc.shardT,51);assert.equal(sc.maxT,216);assert.equal(sc.fireRadius,169);assert.equal(sc.dmg,840);return sc;}
function next(f,t){const sc=f.G._skyCrushers[0];f.tick(t-sc.t);}
const sources=Object.keys(pins).map(read);
for(const s of sources)for(const variant of (live?['live']:['original','candidate'])){
 record(s.file,variant,'normal-space-impact-shard-six-dot-living-field3',()=>{
  const f=fixture(s,variant);cast(f);const initial=[f.fb.hp,f.worm.hp,f.fd.hp];for(let frame=1;frame<=216;frame++){f.tick();for(const m of [f.fb,f.worm,f.fd])if(m.hitCd>0)m.hitCd--;}
  const damage=840+294+6*42;assert.deepEqual([f.fb.hp,f.worm.hp,f.fd.hp],initial.map(h=>h-damage));assert.equal(f.G._skyCrushers.length,0);assert.equal(f.hits.length,8);assert(f.hits.every(h=>h.id==='near'));return {fieldHp:[f.fb.hp,f.worm.hp,f.fd.hp],ordinarySinkHits:f.hits.length,damage};
 });
 record(s.file,variant,'impact-alone-eligible-and-radius-helper-boundaries',()=>{
  const f=fixture(s,variant,{worm:{x:316},fd:{x:1000}});cast(f);next(f,36);assert.equal(f.fb.hp,9160);assert.equal(f.worm.hp,10000,'strict exact boundary unchanged');assert.equal(f.fd.hp,10000);return {fbHp:f.fb.hp,wormHp:f.worm.hp,fdHp:f.fd.hp};
 });
 record(s.file,variant,'dead-hidden-and-ambush-wait-immune',()=>{
  const f=fixture(s,variant,{fb:{hp:0,alive:false},worm:{phase:'hide',hideT:55},fd:{hid:1}});cast(f);next(f,36);next(f,51);next(f,66);assert.deepEqual([f.fb.hp,f.worm.hp,f.fd.hp],[0,10000,10000]);assert.equal(f.G.mats,1000);return {hp:[f.fb.hp,f.worm.hp,f.fd.hp],mats:f.G.mats};
 });
 record(s.file,variant,'emergence-projected-coordinate-is-existing-helper-policy',()=>{
  const f=fixture(s,variant,{fb:{x:4000,hid:1,tpT:8,tpX:0,tpY:0},worm:{phase:'hide',hideT:54}});cast(f);next(f,36);assert.equal(f.fb.hp,9160);assert.equal(f.worm.hp,9160);return {projectedFbHp:f.fb.hp,peekWormHp:f.worm.hp};
 });
 record(s.file,variant,'same-phase-repeat-no-double-and-hit-cd-blocks-distinct-phase',()=>{
  const f=fixture(s,variant);cast(f);next(f,36);const hp=f.fb.hp;f.tick(0);assert.equal(f.fb.hp,hp);next(f,51);assert.equal(f.fb.hp,hp,'real helper hitCd8 preserved when world decrement not run');assert.equal(f.hits.length,2,'ordinary impact/shard exactly one each');return {hp,ordinaryCalls:f.hits.length};
 });
 record(s.file,variant,'lethal-field-boss-pays4-once-and-stale-dead-does-not-pay',()=>{
  const f=fixture(s,variant,{fb:{hp:500,mhp:500}});cast(f);next(f,36);assert(f.fb.hp<=0);assert.equal(f.G.mats,1004);assert.equal(f.G._fbDone,true);assert.equal(f.G._fieldBoss,null);f.fb.hitCd=0;f.ctx._fmApply(f.fb,840,1);assert.equal(f.G.mats,1004);assert.equal(f.fx.filter(x=>x.id==='fb').length,1);return {hp:f.fb.hp,mats:f.G.mats,deathFx:f.fx.length};
 });
 record(s.file,variant,'actual-giant-space-existing-field-hit-single-and-scalars',()=>{
  const f=fixture(s,variant,{skill:'giantSlam'});f.key();assert.equal(f.P.st,150);assert.equal(f.G.mats,990);assert.equal(f.P._gslCd,1800);assert.equal(f.P.s,'gSlamWindup');assert.equal(f.P.st2,10);assert.equal(f.fb.hp,9860);assert.equal(f.worm.hp,9860);assert.equal(f.fd.hp,9860);assert.equal(f.hits.length,1);return {fieldHp:f.fb.hp,st:f.P.st,mats:f.G.mats,cooldown:f.P._gslCd};
 });
 record(s.file,variant,live?'ordinary-only-eight-sink-and-byte-preserved-control':'ordinary-only-normal-trace-old-source-control',()=>{
  if(live){const f=fixture(s,'live',{fb:{x:4000},worm:{x:4000},fd:{x:4000}});cast(f);for(let i=1;i<=216;i++)f.tick();assert.equal(f.hits.length,8,'actual normal impact/shard/six DOT ordinary sink count');if(retained){const old=retained.groups.find(g=>g.file===s.file&&g.variant==='original'&&g.id==='ordinary-only-normal-trace-and-rng-old-source-control');assert(old&&old.pass);assert.equal(f.hits.length,old.data.ordinaryHits);}assert(f.hits.every(h=>h.id==='near'));assert.deepEqual([f.fb.hp,f.worm.hp,f.fd.hp],[10000,10000,10000]);return {ordinaryHits:f.hits.length,frozenSummaryCompared:retained?true:null,frozenSummaryMatched:retained?true:null,ordinaryBranchBytesPreserved:true,RNGFullStreamEqualityUnverified:true};}
  const a=fixture(s,'original',{fb:{x:4000},worm:{x:4000},fd:{x:4000}}),b=fixture(s,'candidate',{fb:{x:4000},worm:{x:4000},fd:{x:4000}});cast(a);cast(b);for(let i=1;i<=216;i++){a.tick();b.tick();}assert.deepEqual(a.snapshot(),b.snapshot());return {ordinaryHits:a.hits.length,recordedSnapshotEqual:true,RNGFullStreamEqualityUnverified:true};
 });
 record(s.file,variant,'keyboard-sky-mp79-and-no-charges-reject-without-new-cost',()=>{
  for(const P of [{mp:79},{_scCharges:0}]){const f=fixture(s,variant,{P});f.key();assert.equal(f.G._skyCrushers,undefined);assert.equal(f.P.mp,P.mp??200);assert.equal(f.G.mats,1000);assert.equal(f.fb.hp,10000);assert.equal(f.hits.length,0);}return {rejections:2};
 });
 record(s.file,variant,'keyboard-focus-paused-dead-repeat-do-not-cast',()=>{
  for(const G of [{on:false},{paused:true}]){const f=fixture(s,variant,{G});f.key();assert.equal(f.G._skyCrushers,undefined);}
  const f=fixture(s,variant,{P:{s:'dead'}});f.key();assert.equal(f.G._skyCrushers,undefined);f.P.s='idle';f.ctx.__keyboard({code:'Space',repeat:true,ctrlKey:false,metaKey:false,target:{},preventDefault:()=>{}});assert.equal(f.G._skyCrushers,undefined);return {controls:4};
 });
}
const summary={};for(const variant of (live?['live']:['original','candidate'])){const a=groups.filter(x=>x.variant===variant);summary[variant]={groups:a.length,pass:a.filter(x=>x.pass).length,fail:a.filter(x=>!x.pass).length,fixtureErrors:a.filter(x=>x.fixtureError).length};}
const receipt={at:new Date().toISOString(),mode:live?'live-source17-current-only':'historical-memory-source16-original-candidate',sourceWritten:false,nativeAccepted:false,testsRepeatedFromEarlierTasks:0,source16BaselineExecuted:memory,retainedReceipt:retained?{path:retainedReceipt,sha256:retainedReceiptSHA,comparisonScope:'ordinary-only frozen sink summary'}:null,summary,files:sources.map(s=>s.receipt),patches,groups,boundaries:['Full actual gameplay keyboard callback and full skill-slot dispatcher/giant/sky producers; actual scalar stats/cost/slot helpers.','Sky update is the actual complete IfStatement extracted from the larger update function; recharge wrapper uses the actual adjacent call. Full update not run.','DOM Element/target transport is a mock. UI/FX/SFX/proficiency and empty assault-flame detonation are recording leaves.','shQuery returns a synthetic ordinary enemy superset; hurtE is a recording sink, not full ordinary damage/resistance simulation.','FM helper/canHit/XY/apply/boss-death consumers are actual source. Synthetic hitCd decrements emulate isolated frame pacing only; world tick/AI is not run.','Synthetic player/items/field mobs only, no asset/GL/native/audio/save/server execution.','Existing giantSlam field connection is unchanged; original hypothesis is rejected for that skill.','Live executes current20 groups only. Reverse-derived source16 is extracted for static byte proof but its functions are not executed.','Actual ordinary8 sink hits and inverse ordinary branch byte preservation are checked; frozen summary is compared only if --baseline-receipt is supplied, otherwise null. RNG seed/full-stream equality is not observed. Added field damage may invoke real FX/global RNG in the full game; full native/RNG remains unverified.']};
ensureOutputParent();
fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
const textOutput={summary,failed:groups.filter(x=>!x.pass).map(x=>({file:x.file,variant:x.variant,id:x.id,error:x.error,fixtureError:x.fixtureError})),receiptPath:output,receiptSHA:sha(fs.readFileSync(output))};
console.log(JSON.stringify(textOutput));
process.exitCode=summary[live?'live':'candidate'].fail?1:0;
