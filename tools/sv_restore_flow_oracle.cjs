// QA only: exact source slices on detached fixture graphs. No game boot or IO helpers.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const file=path.join(process.argv[2],'game.html'),source=fs.readFileSync(file,'utf8'),provenance=[];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function extract(begin,end){const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('missing source anchor '+begin);const code=source.slice(a,b);provenance.push({start_line:source.slice(0,a).split('\n').length,end_line:source.slice(0,b).split('\n').length,sha256:sha(code)});return code+'\n';}
const definitions=[extract('const SKILL_LIST=[','// ═══ SKILL_LIST id→객체 Map 캐시'),extract('const SKILL_SLOT_DEFS={','// ── 스킬 슬롯 info'),extract('const _FUSE_GEM_GROUPS={','const _FUSE_GEMS='),extract('const _FUSE_PAIRS={','// 스킬 고유 성급')];
// Only source declarations and pure helpers are loaded; no boot/writers.
const helpers=[extract('function _getAbsorbed(key){','// ═══ 흡수 스킬 판정'),extract('function _getAllAbsorbed(){','function _isAbsorbed('),extract('function _syncActiveSkAfterReset(resetIds){','let _fuseSelId='),extract('function _ensureBaseWingStrike(p){','function _wingStrikeLevel(')];
const stages=[
 ['skills',extract('  // Skills\n','  // 합체 상태 복원')],
 ['fused',extract('  if(d.fused){P._fused=d.fused}','  P._skProf=')],
 ['mastery',extract('  P._skProf=d.skProf||{};','  // 마이그레이션: 기검참 기본 보유')],
 ['fusion_repair',extract('  // 마이그레이션: 기검참 기본 보유','  // 스킬 슬롯 복원\n')],
 ['active',extract('  // 스킬 슬롯 복원\n','  if(d.activeRMBSk)P.activeRMBSk=d.activeRMBSk;')],
 ['protected_qe',extract('  if(d.activeRMBSk)P.activeRMBSk=d.activeRMBSk;','  if(d.activeCtSk)P.activeCtSk=d.activeCtSk;')],
 ['active_ct',extract('  if(d.activeCtSk)P.activeCtSk=d.activeCtSk;','  // 로드 후 흡수 스킬 활성슬롯 동기화')],
 ['protected_active_sync',extract('  _syncActiveSkAfterReset(_getAllAbsorbed());','  // 숫자 스킬 슬롯 복원')],
 ['slots',extract('  // 숫자 스킬 슬롯 복원','  _sanitizeCoreState();\n  return true;')],
 ['sanitize_numbers',extract('  const _toInt=(v,d=0)=>','  _ensureBaseWingStrike(P);')],
 ['protected_wing',extract('  _ensureBaseWingStrike(P);',"  if(P._fused&&typeof P._fused==='object'){")],
 ['sanitize_fused',extract('  if(P._fused&&typeof P._fused===\'object\'){','\n}\n\n// ─── [S01c]')]
];
const slotHelpers=extract('const _SK_MAP=','// ═══ 스킬 슬롯 시스템');
const init=definitions.join('\n')+helpers.join('\n')+slotHelpers+'\nfunction _isFused(k){return !!(P._fused&&P._fused[k])}\n'+extract('function _skProfCap(skId){','\n');
const c=vm.createContext({});vm.runInContext(init,c,{timeout:1000});
const tables=vm.runInContext(`({skills:SKILL_LIST.map(s=>({id:s.id,cat:s.cat,act:!!s.act,ult:!!s.ult,fixed:!!s.fixed})),pairs:_FUSE_PAIRS,groups:Object.fromEntries(Object.entries(_FUSE_GEM_GROUPS).map(([k,v])=>[k,v.skills])),slot_defs:Object.fromEntries(Object.entries(SKILL_SLOT_DEFS).map(([k,v])=>[k,v.skills])),absorbed:Object.fromEntries(Object.keys(_FUSE_PAIRS).map(k=>[k,_getAbsorbed(k)])),prof_cap:_skProfCap('any')})`,c);
function current(){return {player:{lv:1,sp:0,ap:0,skills:{},_fused:{},_skProf:{},_fuseProfSec:{},_cardProf:{},_catProf:{},activeLMBSk:'kiSlash',activeChargeSk:'charge',activeBowSk:'normal',activeTechSk:'giantSlam',activeMagicSk:'fireball',activeCtSk:'ghostWalk',activeQSk:'parry',activeRMBSk:'maliceSwipe',opaque:{keep:[1,false]}},game:{mats:0,opaque:'keep'},skill_slots:[null,null,null,null,null,null],ult_slot:null};}
function snapshot(ctx){return structuredClone({player:ctx.P,game:ctx.G,skill_slots:ctx.SKILL_SLOTS,ult_slot:ctx.ULT_SLOT});}
function restore(payload,cur){const all=structuredClone({payload,current:cur}),ctx=vm.createContext({d:all.payload,P:all.current.player,G:all.current.game,SKILL_SLOTS:all.current.skill_slots,ULT_SLOT:all.current.ult_slot});vm.runInContext(init,ctx,{timeout:1000});const observations={},trace=[];let status='READY',failed='';for(const [stage,code]of stages){const before=snapshot(ctx);try{vm.runInContext(code,ctx,{timeout:1000});}catch(e){status='SOURCE_THROW';failed=stage;trace.push({stage,state:snapshot(ctx)});break;}const after=snapshot(ctx);if(stage.startsWith('protected_'))observations[stage]={state:'returned',before,after};trace.push({stage,state:after});}return {observations,expected:{status,failed,trace,state:snapshot(ctx),serialized:ctx.d}};}
const rows=[];
function add(id,payload={},cur=current()){payload={player:{},...payload};const first=restore(payload,cur);if(first.expected.status!=='READY')throw Error(id+' unexpected source failure '+first.expected.failed);const second=restore(first.expected.serialized,first.expected.state);rows.push({id,payload,current:cur,...first,second});}
add('empty-player');add('opaque-full-save',{skills:{kiSlash:4,opaqueUnknown:999},opaque:{unchanged:[1,'0',false]}});
for(const key of Object.keys(tables.pairs))for(const v of [true,0,'0'])add('fuse-'+key+'-'+String(v),{fused:{[key]:v}});
for(const lv of [0,299,300,699,700,1000]){const cur=current();cur.player.lv=lv;add('level-'+lv,{},cur);}
for(const value of [0,1,-2,1.5,'0','2','-1','bad',null,false,true,[],[2]])add('skill-coercion-'+rows.length,{skills:{kiSlash:value,whirlwind:value,chainAssault:value,giantSlam:value},skProf:{kiSlash:value,chainStun:value}});
for(const v of [9998,9999,10000,-3,1.5,'10000','9999','bad',null,false,true,[],[10001]])add('mastery-'+rows.length,{skProf:{kiSlash:v,chainStun:v,chainAssault:17},fuseProfSec:{opaque:v},cardProf:{opaque:v},catProf:{opaque:v}});
add('holy-one-pass',{fused:{holyWeak4:true}});add('deleted-and-unknown-fusions',{fused:{dimHalf:true,holyFlame:true,holyRevive:true,holyApex:true,weakFuse2:true,weakFuse3:true,weakFuse4:true,unknown:true,holyIce:false},skills:{galeSlash:2}});
for(const range of [0,1,-1,'4','bad',false,[3]])add('old-charge-'+rows.length,{skills:{chargeStock:2,chargeRange:range}});
const activeFields=['activeChargeSk','activeBowSk','activeTechSk','activeMagicSk','activeLMBSk','activeCtSk','activeQSk','activeRMBSk'];
for(const field of activeFields)for(const value of [null,'','unknown','fanShot','quakeStride','galeSlash','iceOrb','omniBeam','timeWarp','whirlwind'])add('active-'+field+'-'+String(value),{[field]:value,skills:{fanShot:3,whirlwind:2,timeWarp:4},fused:{elemFuse:true,timeStep:true}});
for(const slots of [[],['unknown'],['giantSlam','holyDome','detonate','whirlwind','spikeTrap','chainAssault'],['holyDome','holyDome','giantSlam','giantSlam','whirlwind','detonate'],['bladeShot','fanShot','omniBeam','bladeDash','ghostWalk','iceOrb'],[false,0,'0',null,'timeWarp','chainStun'],['whirlwind','whirlwind',null,null,null,null]])add('slots-'+rows.length,{skills:{giantSlam:4,holyDome:3,detonate:2,whirlwind:7,spikeTrap:2,chainStun:3,bladeShot:1,fanShot:1,omniBeam:1,bladeDash:1,ghostWalk:1,iceOrb:1,timeWarp:1},skillSlots:slots,ultSlot:'unknown'});
for(const id of tables.skills.filter(s=>s.act).map(s=>s.id))add('auto-'+id,{skills:{[id]:3},skillSlots:[null,null,null,null,null,null],ultSlot:id});
for(const v of [-3,2.75,'4.5','bad',false,null,[],[3]]){const cur=current();cur.player.sp=v;cur.player.ap=v;cur.game.mats=v;add('sanitize-'+rows.length,{},cur);}
for(let i=0;i<40;i++){const cur=current();cur.player.lv=(i%4)*300;const skills=Object.fromEntries(tables.skills.filter((_,j)=>(j+i)%5===0).map((s,j)=>[s.id,(j+i)%7]));const fused=Object.fromEntries(Object.keys(tables.pairs).filter((_,j)=>(j+i)%11===0).map(k=>[k,true]));add('mixed-'+i,{skills,fused,skProf:{chainStun:10000,chainAssault:4},skillSlots:tables.skills.slice(i%10,i%10+6).map(s=>s.id),activeMagicSk:'omniBeam',activeBowSk:'fanShot'},cur);}
for(const v of [0,false,2]){const cur=current();cur.player.skills={galeSlash:v,unknown:v,kiSlash:4};cur.player._fused={stormBeam:true};cur.skill_slots=['whirlwind',null,null,null,null,null,'spikeTrap'];add('current-only-'+String(v),{fused:{dimHalf:v,unknown:v},skills:{chainStun:9,chainAssault:3},skProf:{chainStun:7,chainAssault:99}},cur);}
for(const id of [0,1,true,false])add('active-non-string-'+String(id),{activeLMBSk:id,activeBowSk:id,activeMagicSk:id,activeChargeSk:id});
for(const v of [-0,NaN,Infinity,-Infinity,9007199254740991,'-0','Infinity','NaN']){const cur=current();cur.player.sp=v;cur.player.ap=v;cur.game.mats=v;add('number-boundary-'+rows.length,{skills:{kiSlash:v,chargeBoost:v},skProf:{kiSlash:v}},cur);}
function wire(v){if(typeof v==='number'&&!Number.isFinite(v))return {'@number':String(v)};if(typeof v==='number'&&(!Number.isInteger(v)||Math.abs(v)>=1e12||Object.is(v,-0))){const b=Buffer.alloc(8);b.writeDoubleLE(v);return {'@f64':b.toString('hex')};}if(Array.isArray(v))return v.map(wire);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,wire(x)]));return v;}
if(sha(fs.readFileSync(file,'utf8'))!==sha(source))throw Error('source changed');
console.log(JSON.stringify(wire({tables,rows,provenance,source_hash:sha(source),source_unchanged:true,storage_calls:0,server_calls:0,live_writes:0,protected_source_fixture_only:true})));
