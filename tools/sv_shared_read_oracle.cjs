// Exact original readers/calculation branches; all LS access is fixture-only.
// Original setters/server helpers are never executed. Candidate calls are logged
// and each subsequent read has an independently supplied observation.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=process.argv[2],file=path.join(root,'game.html'),source=fs.readFileSync(file,'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),provenance=[];
function extract(begin,end){const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('missing anchor '+begin);const code=source.slice(a,b);provenance.push({file:'game.html',start_line:source.slice(0,a).split('\n').length,end_line:source.slice(0,b).split('\n').length,sha256:sha(code)});return code;}
function line(begin){return extract(begin,'\n');}
const keys=[line("const _SHARED_STORAGE_KEY="),line("const _SHARED_MATS_KEY="),line('const STORAGE_MAX=')].join('\n')+'\n';
const readers=[line('function _loadSharedStorage(){'),line('function _loadSharedMats(){')].join('\n')+'\n';
const getStore=extract('function _getStore(){','// 창고 변경 시 자동 저장 헬퍼');
const mats=extract('    const _savedMats=Math.max(', '    G._irisSz=');
const transfer=extract('  if(d.storage&&d.storage[0]&&d.storage[0].length>0){','  // 결정 주머니 복원 + 마이그레이션');
const normalize='Math.max(0,Math.min(Math.floor(+v||0),Number.MAX_SAFE_INTEGER))';
if(!line('function _saveSharedMats(v){').includes(normalize))throw Error('normalization source changed');
function context(mode,schedules={}){
 const counts={mats:0,storage:0},intents=[];let phase='legacy_transfer';
 function read(key){const which=key==='hellcave_sharedMats'?'mats':'storage',row=schedules[which]?.[counts[which]++];if(!row)throw Error('missing fixture observation');if(row.state==='error')throw Error('fixture getter error');return row.value;}
 const ctx=vm.createContext({window:{_FDGDruidQaStorage:{active:mode==='qa_fixture',getItem:read}},localStorage:{getItem:read,setItem:()=>{throw Error('FORBIDDEN real setter');}},
 _saveSharedMats:v=>intents.push({kind:'mats',argument:v,normalized:vm.runInNewContext('(v)=>'+normalize)(v),execute_authorized:false}),
 _saveSharedStorage:v=>intents.push({kind:'storage',reason:phase,value:structuredClone(v),execute_authorized:false}),
 _persistSharedStorage:()=>{throw Error('unexpected persist branch');}});
 vm.runInContext(keys+readers+getStore,ctx,{timeout:1000});
 const original=ctx._getStore;ctx._getStore=()=>{const prev=phase;phase='get_store';try{return original();}finally{phase=prev;}};
 return {ctx,counts,intents};
}
function invokeReader(kind,mode,observation){const c=context(mode,{[kind]:[observation]});try{return {status:'READY',value:vm.runInContext(kind==='mats'?'_loadSharedMats()':'_loadSharedStorage()',c.ctx,{timeout:1000})};}catch{return {status:'SOURCE_THROW'};}}
const rawStorage=[null,'','[]','[1,null,false,0,"0",{"id":7,"opaque":{"x":[1,2]}}]','null','{}','false','0','"abc"','{','[1,]','{"x":NaN}','[1] junk','["\uAC00\uD83D\uDE00"]','[{"id":9007199254740991,"larger":999999999999999999}]','[0.45,1.25,-0,1e3,1e-3,0.000125,-2.5]','[{"id":1,"id":2}]'];
const rawMats=[null,'','0','-0','-0x10','-1','12','12.9abc','12.9','1e3','0x10','0b11','.5','+17',' +17x','+ 17','\u00a0-17\ufeff','\ufeff0012tail','Infinity','-Infinity','NaN','bad','9007199254740990','9007199254740991','9007199254740992','999999999999999999','9'.repeat(400),'000'.repeat(150)+'12','1.5e2','1_000'];
rawStorage.push('[-0.0,-0e3,-1e-400,1e-300,0.000000000000001,0.100000000000000,1.23456789012345]');
const reads=[];
for(const mode of ['browser_origin','qa_fixture'])for(const kind of ['storage','mats'])for(const observation of [...(kind==='storage'?rawStorage:rawMats).map(value=>({state:'value',value})),{state:'error'}])reads.push({mode,kind,observation,expected:invokeReader(kind,mode,observation)});
const stores=[];
const item=i=>({id:i,opaque:{nested:[false,'0',i]}}),raw=v=>({state:'value',value:JSON.stringify(v)}),err={state:'error'};
const storeCases=[{storage:{_synced:false},observation:raw([])}, {storage:{_synced:false,'1':[item(1)],'2':[item(2)],'0':[item(99)]},observation:raw([item(0)])},
 {storage:{'0':[],_synced:true,'1':[item(1)]},observation:null}, {storage:{'0':Array.from({length:205},(_,i)=>item(i)),_synced:true},observation:null},
 {storage:{'10':[item(10)],'2':[item(2)],'1':[item(1)],_synced:false,items:[item(3)],opaque:{keep:1}},observation:raw([item(0)])},
 {storage:{_synced:false},observation:raw(Array.from({length:201},(_,i)=>item(i)))}, {storage:{_synced:false,'1':Array.from({length:200},(_,i)=>item(i))},observation:raw([item(900)])}];
for(const mode of ['browser_origin','qa_fixture'])for(const [index,f]of storeCases.entries()){
 const c=context(mode,{storage:[f.observation]});c.ctx.STORAGE=structuredClone(f.storage);const returned=c.ctx._getStore();stores.push({id:mode+'-'+index,mode,...f,expected:{plan:{storage:c.ctx.STORAGE,store:returned},intents:c.intents,read_count:c.counts.storage,store_alias:returned===c.ctx.STORAGE[0]}});
}
for(const observation of [err,{state:'value',value:'{'},{state:'value',value:'{}'}]){const f={storage:{_synced:false,'1':[item(1)]},observation},c=context('browser_origin',{storage:[observation]});c.ctx.STORAGE=structuredClone(f.storage);const returned=c.ctx._getStore();stores.push({id:'normal-fallback-'+stores.length,mode:'browser_origin',...f,expected:{plan:{storage:c.ctx.STORAGE,store:returned},intents:c.intents,read_count:c.counts.storage,store_alias:true}});}
function restore(payload,current,observations){const c=context(observations.mode,{mats:observations.mats_reads,storage:observations.storage_reads});c.ctx.d=structuredClone(payload);c.ctx.G={mats:structuredClone(current.mats)};if(c.ctx.d.game)vm.runInContext(mats,c.ctx,{timeout:1000});vm.runInContext(transfer,c.ctx,{timeout:1000});return{plan:{serialized:c.ctx.d,mats:c.ctx.G.mats,storage:c.ctx.STORAGE},intents:c.intents,reads:c.counts};}
const restores=[];
function addRestore(id,mode,payload,matReads,storageReads){const current={mats:777},observations={mode,mats_reads:matReads,storage_reads:storageReads};const expected=restore(payload,current,observations);const nextMats=matReads.at(-1)??raw(0),nextStore=storageReads.at(-1);const second_observations={mode,mats_reads:[nextMats,nextMats],storage_reads:[nextStore,nextStore]};const second=restore(expected.plan.serialized,{mats:expected.plan.mats},second_observations);restores.push({id,payload,current,observations,expected,second_observations,second});}
for(const mode of ['browser_origin','qa_fixture']){
 for(const saved of [0,5,50,100,'12.9','0x10','bad',-1,'Infinity',9007199254740991,'9007199254740990','9007199254740991','9007199254740992'])for(const shared of [0,50,100,Number.MAX_SAFE_INTEGER]){
  const n=Math.max(0,Math.floor(+saved||0));
  const next=Math.min(Math.max(shared,n),Number.MAX_SAFE_INTEGER);
  addRestore('mats-max-'+restores.length,mode,{player:{},game:{mats:saved},storage:{}},[{state:'value',value:String(shared)},{state:'value',value:String(next)}],[raw([item(1)])]);
 }
 addRestore('metadata-current-'+mode,mode,{player:{},storage:{}},[],[raw([])]);
 for(const count of [1,199,200,201]){
  const legacy=Array.from({length:count},(_,i)=>item(i));addRestore('legacy-empty-'+mode+'-'+count,mode,{player:{},game:{mats:5},storage:{'0':legacy}},[raw(50),raw(50)],[raw([]),raw(legacy.slice(0,200))]);
  addRestore('legacy-existing-'+mode+'-'+count,mode,{player:{},storage:{'0':legacy}},[],[raw([item(900)]),raw([item(900)])]);
 }
 addRestore('legacy-array-root-'+mode,mode,{player:{},storage:[[item(1)]]},[],[raw([]),raw([item(1)])]);
 addRestore('legacy-empty-array-'+mode,mode,{player:{},storage:{'0':[]}},[],[raw([item(2)])]);
}
addRestore('normal-mats-post-write-get-error','browser_origin',{player:{},game:{mats:100}},[raw(0),err],[raw([])]);
addRestore('normal-mats-write-not-reflected','browser_origin',{player:{},game:{mats:100}},[raw(0),raw(0)],[raw([])]);
addRestore('normal-transfer-write-not-reflected','browser_origin',{player:{},storage:{'0':[item(1)]}},[],[raw([]),raw([])]);
addRestore('normal-transfer-getter-faults','browser_origin',{player:{},storage:{'0':[item(1)]}},[],[err,err]);
addRestore('normal-existing-corrupted-post-read','browser_origin',{player:{},storage:{'0':[item(1)]}},[],[raw([item(2)]),{state:'value',value:'{'}]);
// QA transport tags preserve numbers exactly; no tags enter a game save.
function wire(v){if(typeof v==='number'&&!Number.isFinite(v))return {'@number':String(v)};if(typeof v==='number'&&(!Number.isInteger(v)||Math.abs(v)>=1e12||Object.is(v,-0))){const b=Buffer.alloc(8);b.writeDoubleLE(v);return {'@f64':b.toString('hex')};}if(Array.isArray(v))return v.map(wire);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,wire(x)]));return v;}
if(sha(fs.readFileSync(file,'utf8'))!==sha(source))throw Error('source changed');
require('./oracle_json_output.cjs')(wire({reads,stores,restores,provenance,source_hash:sha(source),source_unchanged:true,actual_storage_reads:0,actual_storage_writes:0,actual_server_calls:0,source_writer_helpers_executed:0}));
