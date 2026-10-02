'use strict';
// Run from either ignored staging or tracked test/: --repo /absolute/checkout.
// --memory compares actual source12, reward-only, and guarded candidates.
// Default/--live tests only the actual guarded production implementation.
// No source, save, Git, or receipt writes. JSON evidence goes to stdout.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const args=process.argv.slice(2);
function option(name){const at=args.indexOf(name);return at>=0?args[at+1]:args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);}
const root=path.resolve(option('--repo')||path.resolve(__dirname,'..'));
const {parse}=require(require.resolve('acorn',{paths:[root]}));
const memory=args.includes('--memory'),files=['game.html','game-easy-test.html'];
const pins={
  'game.html':'0c48deabcff0cb6dd541e79d457148e3e7c8e0a6b5d91cf434620ecd15d06b8c',
  'game-easy-test.html':'421a490606e7d2eeae9c428b73a08c5b29e4e2221d7af7215b4a84582e7cef10'
};
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const plainAnchor="else if(isFb){showPH('필드보스 처치!','#ffcc44');";
const rewardAnchor=plainAnchor+'G.mats+=4;';
const oldGuard='if((m.hitCd||0)>0)return false;';
const finalGuard='if(m.hp<=0||(m.hitCd||0)>0)return false;';
const functions=['_fmXY','_fmCanHit','_fmDeathFx','_fmApply','_hurtFieldMobs',
  '_fbAliveCount','_fbMarkDead','_regionIdxAt','_regionInit','_regionFbAlive',
  '_regionRatio','_regionClearedCount','_regionAllCleared','_regKill','_regionCheckClears','_spawnHoleCount'];
const declarations=['SPAWN_HOLE','_REG_CH1_KO','_REG_CH1_EN','_REG_DIRS_KO','_REG_DIRS_EN','_REG_FB_TO_REG','_REG_CLEAR_RATIO'];
const normalize=v=>JSON.parse(JSON.stringify(v));
function oneReplace(text,old,next,label){assert.equal(text.split(old).length-1,1,label);return text.replace(old,next);}
function parseHTML(html){
  const scripts=[];
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/\bsrc\s*=/i.test(m[1]))continue;
    const type=m[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';
    if(type.includes('json')||type==='importmap'){
      JSON.parse(m[2]);scripts.push({type:'json',text:m[2],offset:m.index+m[0].indexOf(m[2])});
    }else if(!type||type==='module'||type==='text/javascript'||type==='application/javascript'){
      const ast=parse(m[2],{ecmaVersion:'latest',sourceType:type==='module'?'module':'script'});
      scripts.push({type:'js',text:m[2],ast,offset:m.index+m[0].indexOf(m[2])});
    }
  }
  return scripts;
}
function readSource(file){
  const bytes=fs.readFileSync(path.join(root,file)),html=bytes.toString('utf8');
  const expected=memory?pins[file]:option(file==='game.html'?'--expect-main-sha':'--expect-easy-sha');
  if(expected)assert.equal(sha(bytes),expected,file+' exact source pin');
  const scripts=parseHTML(html),matches=scripts.filter(s=>s.type==='js'&&s.text.includes('function _fmApply('));
  assert.equal(matches.length,1,file+' unique actual script');const script=matches[0];
  const find=name=>{
    const nodes=script.ast.body.filter(n=>(n.type==='FunctionDeclaration'&&n.id?.name===name)||
      (n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name)));
    assert.equal(nodes.length,1,name+' unique AST declaration');return nodes[0];
  };
  const extracted=Object.fromEntries(functions.map(name=>{const n=find(name);return[name,script.text.slice(n.start,n.end)];}));
  const actual=extracted._fmApply;
  // Preserve the existing source-specific alive behavior; hp/ref cleanup is common.
  const existingAliveAfterDeath=file==='game.html'?false:true;
  assert.equal(extracted._fbMarkDead.includes('fb.alive=false'),!existingAliveAfterDeath,
    file+' original _fbMarkDead alive assignment contract');
  let original,plain,final;
  if(memory){
    assert.equal(actual.includes('G.mats+=4;'),false,'source12 has no kill reward');
    assert.equal(actual.includes(finalGuard),false,'source12 has no dead-entry guard');
    original=actual;plain=oneReplace(original,plainAnchor,rewardAnchor,'reward insertion');
    final=oneReplace(plain,oldGuard,finalGuard,'dead-entry guard');
  }else{
    assert.equal(actual.split(rewardAnchor).length-1,1,'actual live reward anchor');
    assert.equal(actual.split(finalGuard).length-1,1,'actual live guard');
    final=actual;plain=oneReplace(final,finalGuard,oldGuard,'live guard inverse');
    original=oneReplace(plain,rewardAnchor,plainAnchor,'live reward inverse');
  }
  const applyNode=find('_fmApply'),absoluteStart=script.offset+applyNode.start,absoluteEnd=script.offset+applyNode.end;
  const finalHTML=html.slice(0,absoluteStart)+final+html.slice(absoluteEnd);
  const originalHTML=html.slice(0,absoluteStart)+original+html.slice(absoluteEnd);
  assert.equal(oneReplace(finalHTML,final,original,'whole-source inverse'),originalHTML);
  if(memory)assert.equal(originalHTML,html,'memory candidate only changes _fmApply');
  const parsedFinal=memory?parseHTML(finalHTML):scripts;
  const sharedNodes=[...new Set([...functions.filter(n=>n!=='_fmApply'),...declarations].map(find))].sort((a,b)=>a.start-b.start);
  const shared=sharedNodes.map(n=>script.text.slice(n.start,n.end)).join('\n');
  const line=n=>html.slice(0,script.offset+n.start).split('\n').length;
  const functionReceipts=Object.fromEntries(functions.map(name=>[name,{line:line(find(name)),bytes:Buffer.byteLength(extracted[name]),sha256:sha(extracted[name]),unchangedByCandidate:name!=='_fmApply'}]));
  return {file,sourceBytes:bytes.length,sourceSHA256:sha(bytes),pinVerified:!!expected,shared,existingAliveAfterDeath,
    variants:{original,plain,final},functions:functionReceipts,
    originalWhole:{bytes:Buffer.byteLength(originalHTML),sha256:sha(originalHTML)},
    finalWhole:{bytes:Buffer.byteLength(finalHTML),sha256:sha(finalHTML)},
    changeBytes:Buffer.byteLength(finalHTML)-Buffer.byteLength(originalHTML),inverseExact:true,
    fullParse:{js:parsedFinal.filter(s=>s.type==='js').length,json:parsedFinal.filter(s=>s.type==='json').length,pass:true}};
}
function fixture(src,variant){
  const effects=[],stateCalls={xp:0,drop:0,fdMark:0};
  const G={stage:0,on:true,mats:1200,kills:17,_stageKills:9,combo:6,comboTimer:240,
    _totalSpawned:60,_fbSpawned:true,_fbDone:false,_fieldBosses:[],_fieldBoss:null,
    _worms:[],_fireDevils:[],mw:200,mh:200,map:[[0]],spawnHoles:[],_gateGuardKilled:false,_bossUnlocked:false};
  const P={x:0,y:0,lv:4,exp:77,hp:201,mp:82,st:63,shield:121};
  const ens=[{alive:true,hp:51,_homeX:21,_homeY:22}],ensRef=ens,quotaRef=G.spawnHoles;
  const record=name=>(...values)=>effects.push({name,values});
  const sandbox={G,P,T:40,ens,_mmDirty:0,effects,Math:Object.create(Math),
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),_L:(ko)=>ko,
    addTxt:record('text'),addParts:record('parts'),deathFX:record('deathFX'),
    _spawnLargeMonsterDeathFx:record('largeDeath'),_addCorpse:record('corpse'),
    _addGorePiece:record('gore'),_addDeathImpact:record('deathImpact'),shake:record('shake'),
    showPH:record('banner'),_regionBannerShow:record('regionBanner'),_petSayCD:record('pet'),
    _parryMagicHitFx:record('parryFx'),SFX:{magic:record('magic')},
    addExp(){stateCalls.xp++;throw Error('unexpected XP mutation');},
    rollDrop(){stateCalls.drop++;throw Error('unexpected equipment drop');},
    _fdMarkDead(m){stateCalls.fdMark++;m.alive=false;const at=G._fireDevils.indexOf(m);if(at>=0)G._fireDevils[at]=null;}};
  sandbox.Math.random=()=>0;
  const ctx=vm.createContext(sandbox);
  vm.runInContext(src.shared+'\n'+src.variants[variant],ctx,{timeout:1500});
  const fb=(x=100,y=100)=>({x,y,homeX:x,homeY:y,r:120,hp:10,mhp:10,alive:true,hid:0,tpT:0,emT:0,hitCd:0,frame:0,face:0});
  const attach=m=>{G._fieldBosses=[m];G._fieldBoss=m;return m;};
  const protectedState=()=>normalize({P,kills:G.kills,stageKills:G._stageKills,combo:G.combo,comboTimer:G.comboTimer,total:G._totalSpawned,spawnHoles:G.spawnHoles,ens});
  const preserved=before=>{assert.deepEqual(protectedState(),before);assert.equal(ens,ensRef);assert.equal(G.spawnHoles,quotaRef);assert.equal(stateCalls.xp,0);assert.equal(stateCalls.drop,0);};
  return {ctx,G,P,fb,attach,effects,stateCalls,protectedState,preserved,existingAliveAfterDeath:src.existingAliveAfterDeath,
    hit(m,dmg=10,set,parry){return ctx._hurtFieldMobs(m.x,m.y,1,dmg,set,parry);}};
}
const checks=[
  ['nonlethal-no-reward',f=>{const m=f.attach(f.fb());assert.equal(f.hit(m,3),1);assert.equal(m.hp,7);assert.equal(f.G.mats,1200);assert.equal(f.G._fbDone,false);assert.equal(f.effects.filter(e=>e.name==='deathFX').length,0);} ],
  ['first-lethal-four-malice',f=>{const m=f.attach(f.fb());assert.equal(f.hit(m),1);assert.equal(f.G._fieldBosses[0],null);assert.equal(f.G._fieldBoss,null);assert.equal(m.alive,f.existingAliveAfterDeath);assert.equal(f.G._fbDone,true);assert.equal(f.G.mats,1204);} ],
  ['same-frame-hitCd-blocks-direct-repeat',f=>{const m=f.attach(f.fb());f.ctx._fmApply(m,10,1);const after=f.G.mats;assert.equal(f.ctx._fmApply(m,10,1),false);assert.equal(f.G.mats,after);assert.equal(f.effects.filter(e=>e.name==='deathFX').length,1);} ],
  ['stale-dead-hitCd-zero-no-second-reward',f=>{const m=f.attach(f.fb());f.ctx._fmApply(m,10,1);m.hitCd=0;const hp=m.hp;const applied=f.ctx._fmApply(m,10,1);f.observation={mats:f.G.mats,applied,hp:m.hp,deathFxCalls:f.effects.filter(e=>e.name==='deathFX').length};assert.equal(f.G.mats,1204);assert.equal(applied,false);assert.equal(m.hp,hp);assert.equal(f.observation.deathFxCalls,1);} ],
  ['four-anglers-sixteen-and-last-fbDone',f=>{const sites=[[58,158],[148,150],[52,42],[148,42]];const list=sites.map(([x,y])=>f.fb((x+.5)*40,(y+.5)*40));f.G._fieldBosses=list;f.G._fieldBoss=list[0];for(let i=0;i<4;i++){assert.equal(f.hit(list[i]),1);assert.equal(f.G._fbDone,i===3);assert.equal(f.ctx._fbAliveCount(),3-i);}assert.equal(list.length,4);assert(list.every(x=>x===null));assert.equal(f.G._fbSpawned,true);assert.equal(f.G.mats,1216);} ],
  ['region-exact-eighty-and-assigned-angler-death',f=>{const sites=[[58,158],[148,150],[52,42],[148,42]],list=sites.map(([x,y])=>f.fb((x+.5)*40,(y+.5)*40));f.G._fieldBosses=list;f.G._fieldBoss=list[0];f.G.spawnHoles=sites.map(([x,y])=>({x:(x+.5)*40,y:(y+.5)*40,size:.4}));f.ctx._regionInit(0);for(const r of f.G._regions){assert.equal(r.total,15);r.kills=12;}f.ctx._regionCheckClears();assert.equal(f.ctx._regionClearedCount(),0);for(let i=0;i<4;i++){f.hit(list[i]);f.ctx._regionCheckClears();assert.equal(f.ctx._regionClearedCount(),i+1);}assert.equal(f.ctx._regionAllCleared(),true);assert.equal(f.G._fbDone,true);assert.equal(f.G.mats,1216);assert.equal(f.effects.filter(e=>e.name==='regionBanner').length,3);} ],
  ['below-eighty-remains-uncleared-after-death',f=>{const m=f.attach(f.fb());f.G._regions=Array.from({length:4},(_,id)=>({id,total:100,kills:id?100:79,cleared:!!id,fbIdx:id?-1:0}));f.hit(m);f.ctx._regionCheckClears();assert.equal(f.G._regions[0].cleared,false);} ],
  ['cleared-region-latch-survives-later-check',f=>{f.G._regions=Array.from({length:4},(_,id)=>({id,total:10,kills:8,cleared:!!id,fbIdx:id?-1:0}));f.G._fbDone=true;f.ctx._regionCheckClears();const r=f.G._regions[0];assert.equal(r.cleared,true);r.kills=0;f.G._fbDone=false;f.attach(f.fb());f.ctx._regionCheckClears();assert.equal(r.cleared,true);} ],
  ['hidden-without-emergence-is-invulnerable',f=>{const m=f.attach(f.fb());m.hid=1;assert.equal(f.ctx._fmCanHit(m,1),false);assert.equal(f.hit(m),0);assert.equal(m.hp,10);assert.equal(f.G.mats,1200);} ],
  ['teleport-emergence-targets-arrival-position',f=>{const m=f.attach(f.fb());Object.assign(m,{hid:1,tpT:54,tpX:600,tpY:600});assert.equal(f.ctx._fmCanHit(m,1),true);assert.deepEqual(normalize(f.ctx._fmXY(m,1)),{x:600,y:600});assert.equal(f.hit(m),0);assert.equal(f.ctx._hurtFieldMobs(600,600,1,10),1);assert.equal(f.G.mats,1204);} ],
  ['smoke-emergence-can-be-hit',f=>{const m=f.attach(f.fb());Object.assign(m,{hid:1,emT:20});assert.equal(f.hit(m),1);assert.equal(f.G.mats,1204);} ],
  ['hitSet-duplicate-does-not-apply-again',f=>{const m=f.attach(f.fb()),set=new Set();assert.equal(f.hit(m,3,set),1);assert(set.has(m));m.hitCd=0;assert.equal(f.hit(m,3,set),0);assert.equal(m.hp,7);assert.equal(f.G.mats,1200);} ],
  ['parry-shot-on-hitCooldown-is-consumed-without-damage',f=>{const m=f.attach(f.fb()),set=new Set();m.hitCd=6;assert.equal(f.hit(m,10,set,{el:2}),1);assert.equal(m.hp,10);assert.equal(m.hitCd,6);assert.equal(f.G.mats,1200);assert(set.has(m));assert.equal(f.effects.filter(e=>e.name==='parryFx').length,1);} ],
  ['ordinary-hit-on-hitCooldown-is-not-consumed',f=>{const m=f.attach(f.fb());m.hitCd=6;assert.equal(f.hit(m),0);assert.equal(m.hp,10);assert.equal(f.G.mats,1200);assert.equal(f.effects.filter(e=>e.name==='parryFx').length,0);} ],
  ['worm-kill-does-not-receive-angler-reward',f=>{const m=f.fb();m._fmKind='wm';f.G._worms=[m];assert.equal(f.hit(m),1);assert.equal(f.G._worms[0],null);assert.equal(f.G.mats,1200);assert.equal(f.G._fbDone,false);} ],
  ['flame-devil-kill-does-not-receive-angler-reward',f=>{const m=f.fb();m._fmKind='fd';f.G._fireDevils=[m];assert.equal(f.hit(m),1);assert.equal(f.G._fireDevils[0],null);assert.equal(f.stateCalls.fdMark,1);assert.equal(f.G.mats,1200);assert.equal(f.G._fbDone,false);} ],
  ['xp-kills-combo-ens-quota-and-P-preserved',f=>{const m=f.attach(f.fb()),before=f.protectedState();f.hit(m);f.preserved(before);assert.equal(f.G.mats,1204);} ],
  ['already-dead-zeroCooldown-cannot-start-new-death',f=>{const m=f.attach(f.fb());m.hp=0;m.alive=false;const before={hp:m.hp,mats:f.G.mats};assert.equal(f.ctx._fmApply(m,10,1),false);assert.equal(m.hp,before.hp);assert.equal(f.G.mats,before.mats);assert.equal(f.effects.filter(e=>e.name==='deathFX').length,0);} ],
  ['already-dead-positiveCooldown-is-blocked',f=>{const m=f.attach(f.fb());m.hp=0;m.alive=false;m.hitCd=6;assert.equal(f.ctx._fmApply(m,10,1),false);assert.equal(f.G.mats,1200);assert.equal(f.effects.filter(e=>e.name==='deathFX').length,0);} ],
  ['legacy-single-fieldBoss-fallback-commits-once',f=>{const m=f.fb();f.G._fieldBosses=null;f.G._fieldBoss=m;assert.equal(f.hit(m),1);assert.equal(f.G._fieldBoss,null);assert.equal(f.G._fbDone,true);assert.equal(f.G.mats,1204);} ]
];
const sources=files.map(readSource),results=[];
for(const src of sources){
  for(const variant of memory?['original','plain','final']:['final']){
    for(const [id,run]of checks){const f=fixture(src,variant);let error=null;try{run(f);}catch(e){error=String(e.message);}results.push({file:src.file,variant,id,pass:!error,error,observation:f.observation||null});}
  }
}
const summary={};for(const variant of memory?['original','plain','final']:['final']){const rows=results.filter(r=>r.variant===variant);summary[variant]={groups:rows.length,pass:rows.filter(r=>r.pass).length,fail:rows.filter(r=>!r.pass).length};}
const after=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
const unchanged=sources.every(s=>after[s.file]===s.sourceSHA256);
const counterexamples=results.filter(r=>r.id==='stale-dead-hitCd-zero-no-second-reward');
let overall=unchanged&&summary.final.fail===0;
if(memory){
  overall=overall&&summary.original.fail>0&&summary.plain.fail>0;
  overall=overall&&counterexamples.filter(r=>r.variant==='plain').every(r=>r.observation?.mats===1208&&r.observation.deathFxCalls===1);
  overall=overall&&counterexamples.filter(r=>r.variant==='final').every(r=>r.observation?.mats===1204&&r.observation.applied===false);
}
const parseTotals=sources.reduce((a,s)=>({js:a.js+s.fullParse.js,json:a.json+s.fullParse.json}),{js:0,json:0});
assert.equal(parseTotals.js,12,'two HTML full inline JS count');assert.equal(parseTotals.json,2,'two HTML full JSON count');
const report={schemaVersion:1,at:new Date().toISOString(),mode:memory?'memory-red-plain-green':'live-green-only',repo:root,
  actualSourceExtraction:'acorn top-level declarations; no modeled replacements for gameplay functions',nativeAccepted:false,
  productionWritten:false,originalAndPlainFailuresAreExpectedRed:memory,overallPass:overall,sourceUnchanged:unchanged,summary,
  fixtureCorrection:'First memory run incorrectly required easy _fbMarkDead to assign alive=false. Existing main does; easy preserves alive while hp=0 and refs=null. Both original bodies remain unchanged. First failure preserved separately in unit/memory-first-fixture-failure.json.',
  fullFinalHTMLParse:{...parseTotals,pass:true},
  sourceReceipts:sources.map(({shared,variants,...receipt})=>({...receipt,variantFunctionSHA256:Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,sha(v)])),afterSHA256:after[receipt.file]})),
  staleDeadCounterexamples:counterexamples,results,
  boundary:'VM synthetic inputs and recording FX leaves; no native game, visual/audio acceptance, save writes, or observed player fixture claimed. _fmDeathFx actual body; fdMarkDead is the sole gameplay-handler stub.'};
console.log(JSON.stringify(report,null,2));
process.exitCode=overall?0:1;
