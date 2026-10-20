// Exact source primitive/ACK branches, with memory-only FS/SDK/storage fixtures.
// Reads source text only. No server, host write, user storage or game boot.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const root=process.argv[2],texts=Object.fromEntries(['game.html','server.cjs','node-main.js'].map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')])),provenance=[];
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function extract(file,begin,end,from=0){const s=texts[file],a=s.indexOf(begin,from),b=s.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('anchor '+begin);const code=s.slice(a,b);provenance.push({file,start_line:s.slice(0,a).split('\n').length,end_line:s.slice(0,b).split('\n').length,sha256:sha(code)});return code+'\n';}
const atomic=extract('server.cjs','let atomicSaveSequence = 0;','function sanitizeSlot(');
const nw=extract('node-main.js',"  if (pathname === '/api/save' && req.method === 'POST') {","  if (pathname.startsWith('/api/load/')");
const cloudTail=extract('game.html',"    if(error){if(!IS_ELECTRON)console.error('[DB] Save error:'",'// ═══ Load game state from DB');
const localFrom=texts['game.html'].indexOf('const _SLOT=');
const webTail=extract('game.html',"      localStorage.setItem(_LS_KEY,JSON.stringify(saveData));",'  showBootLoading(',texts['game.html'].indexOf("const _LS_KEY='hellsave_web'"));
const localTail=extract('game.html','      if(_serverOk===false){','  if(_DROP_PREVIEW)dbSave=async()=>{};',localFrom);
class MemoryFS {
 constructor(initial={},faults=[]){this.files=new Map(Object.entries(initial).map(([k,v])=>[k,Buffer.from(v)]));this.fds=new Map();this.next=20;this.faults=faults;this.counts={};this.calls=[];this.after=null;}
 event(op,args){this.calls.push({op,args});this.counts[op]=(this.counts[op]||0)+1;return this.faults.find(f=>f.op===op&&f.nth===this.counts[op])??{};}
 fail(op){const e=Error(op);e.op=op;throw e;}
 hook(op){if(this.after)this.after(op);}
 openSync(key,flags){const f=this.event('open',[key,flags]);if(f.effect||this.files.has(key))this.fail('open');const fd=this.next++;this.files.set(key,Buffer.alloc(0));this.fds.set(fd,key);this.hook('open');return fd;}
 writeFileSync(target,text,enc){const bytes=Buffer.from(text,enc),f=this.event('write',[target,[...bytes],enc]);if(f.effect==='before')this.fail('write');const key=typeof target==='number'?this.fds.get(target):target;if(!key)this.fail('write');this.files.set(key,f.effect==='partial'?bytes.subarray(0,f.bytes):bytes);if(f.effect)this.fail('write');this.hook('write');}
 closeSync(fd){const f=this.event('close',[fd]);if(f.effect==='before')this.fail('close');const had=this.fds.delete(fd);if(!had||f.effect)this.fail('close');this.hook('close');}
 renameSync(a,b){const f=this.event('rename',[a,b]);if(f.effect==='before')this.fail('rename');if(!this.files.has(a))this.fail('rename');this.files.set(b,this.files.get(a));this.files.delete(a);if(f.effect)this.fail('rename');this.hook('rename');}
 unlinkSync(key){const f=this.event('unlink',[key]);if(f.effect==='before')this.fail('unlink');const had=this.files.delete(key);if(!had||f.effect)this.fail('unlink');this.hook('unlink');}
 snapshot(){return {files:Object.fromEntries([...this.files].map(([k,v])=>[k,[...v]])),descriptors:Object.fromEntries(this.fds),calls:this.calls};}
}
function atomicOwner(){const c=vm.createContext({});vm.runInContext(atomic,c);return c.atomicSaveJSON;}
const payloads=[{player:{lv:1},opaque:{dynamic:[false,null,'한글😀',3.25]}},[1,null,{id:'opaque'}],{unknown:0},'fixture',17,true];
const cases=[];
async function writeCase(mode,data,faults=[],initial={slotA:[111,108,100]}){const fs=new MemoryFS(initial,faults);let ok=true,error='';if(mode==='dev_atomic'){try{atomicOwner()(fs,'slotA',structuredClone(data),11);}catch(e){ok=false;error=e.op;}}else{let response;const c=vm.createContext({fs,path:{join:()=> 'slotA'},SAVE_DIR:'MEMORY_ONLY',pathname:'/api/save',req:{method:'POST'},readBody:async()=>({slot:'slotA',data:structuredClone(data)}),sanitizeSlot:x=>x,sendJSON:(res,status,body)=>{response={status,body}},res:{}});await vm.runInContext('(async()=>{'+nw+'})()',c);ok=response.status===200;error=ok?'':'write';}cases.push({mode,data,bytes:[...Buffer.from(JSON.stringify(data,null,2))],faults,initial,expected:{ok,error,snapshot:fs.snapshot()}});}
(async()=>{
for(const mode of ['dev_atomic','nw_direct'])for(const data of payloads)await writeCase(mode,data);
for(const op of ['open','write','close','rename'])await writeCase('dev_atomic',payloads[0],[{op,nth:1,effect:'before'}]);
for(const [op,effect]of [['write','partial'],['write','after'],['close','after'],['rename','after']])await writeCase('dev_atomic',payloads[0],[{op,nth:1,effect,bytes:7}]);
for(const faults of [[{op:'write',nth:1,effect:'before'},{op:'close',nth:1,effect:'before'}],[{op:'close',nth:1,effect:'before'},{op:'close',nth:2,effect:'before'}],[{op:'rename',nth:1,effect:'before'},{op:'unlink',nth:1,effect:'before'}],[{op:'rename',nth:1,effect:'before'},{op:'unlink',nth:1,effect:'after'}]])await writeCase('dev_atomic',payloads[0],faults);
await writeCase('dev_atomic',payloads[0],[],{slotA:[111,108,100],'slotA.tmp-11-1':[111,116,104,101,114]});
for(const [effect,bytes]of [['before',0],['partial',0],['partial',7],['after',0]])await writeCase('nw_direct',payloads[0],[{op:'write',nth:1,effect,bytes}]);
const interleavings=[];
for(const [hook,steps]of [['open',1],['write',2],['close',3],['rename',4]]){const fs=new MemoryFS({slotA:[111,108,100]}),a=atomicOwner(),b=atomicOwner();let fired=false;fs.after=op=>{if(!fired&&op===hook){fired=true;fs.after=null;b(fs,'slotA',{generation:'B'},22);}};a(fs,'slotA',{generation:'A'},11);interleavings.push({hook,steps,a_bytes:[...Buffer.from(JSON.stringify({generation:'A'},null,2))],b_bytes:[...Buffer.from(JSON.stringify({generation:'B'},null,2))],expected:fs.snapshot()});}
const sequentialFS=new MemoryFS(),owner=atomicOwner();owner(sequentialFS,'slotA',{generation:'A'},11);owner(sequentialFS,'slotA',{generation:'B'},11);
const cloud=[];
for(const request_id of ['A'])for(const current_id of ['A','B'])for(const value of [{data:[{id:'A'}],error:null},{data:[{id:'B'}],error:null},{data:[],error:null},{data:[{id:'A'},{id:'A'}],error:null},{data:[{}],error:null},{data:[null],error:null},{data:null,error:null},{data:false,error:null},{data:[{id:'A'}],error:{message:'denied'}},null]){
 const response={state:'returned',value},expected=await cloudCase(request_id,current_id,response);cloud.push({request_id,current_id,response,expected});}
cloud.push({request_id:'A',current_id:'B',response:{state:'throw'},expected:await cloudCase('A','B',{state:'throw'})});
async function cloudCase(request_id,current_id,response){const errors=[];const c=vm.createContext({_charId:current_id,_saving:true,_lastSaveTime:17,_pendingForce:false,_drainPendingSaveNow:()=>{},IS_ELECTRON:false,console:{error:(...a)=>errors.push(a[0])},Date:{now:()=>1000},completion:response});await vm.runInContext('dbSave=async function(){try{const{data:updated,error}=await (completion.state===\'throw\'?Promise.reject(Error(\'fixture\')):Promise.resolve(completion.value));\n'+cloudTail,c);await c.dbSave();return {last_save_ms:c._lastSaveTime,acknowledged:c._lastSaveTime===1000,caught:errors.some(e=>e.includes('exception')),identity_changed:request_id!==current_id,current_id_comparison:true};}
const local=[];
for(const current_slot of ['slotA','slotB'])for(const server_before of [null,true,false])for(const observation of (server_before===false?[{kind:'offline',write:'succeeded'},{kind:'offline',write:'failed'}]:[{kind:'http_error',write:'succeeded'},{kind:'http_error',write:'failed'},{kind:'transport_error'},{kind:'parse_error'},...([{ok:true,slot:'wrong'},{ok:false,error:'denied'},{ok:1},{ok:'0'},{ok:0},{},null].map(value=>({kind:'json',value})))])){
 const events=[];const c=vm.createContext({fixturePayload:{opaque:'bytes unchanged'},_serverOk:server_before,_SLOT:'slotA',_saving:true,_lastSaveTime:17,_pendingForce:false,_drainPendingSaveNow:()=>{},IS_ELECTRON:false,console:{error:()=>{}},Date:{now:()=>1000},localStorage:{setItem:(k,v)=>{events.push([k,v]);if(observation.write==='failed')throw Error('fixture write');}},fetch:async()=>{if(observation.kind==='transport_error')throw Error('fixture transport');return {ok:observation.kind!=='http_error',json:async()=>{if(observation.kind==='parse_error')throw Error('fixture parse');return observation.value;}}}});
 await vm.runInContext('dbSave=async function(){try{const saveData=fixturePayload;\n'+localTail,c);await c.dbSave();
 const thrown=observation.kind==='transport_error'||observation.kind==='parse_error'||(observation.kind==='offline'&&observation.write==='failed')||(observation.kind==='json'&&observation.value===null);
 local.push({request_slot:'slotA',current_slot,server_before,observation,expected:{last_save_ms:c._lastSaveTime,acknowledged:c._lastSaveTime===1000,caught:thrown,server_ok:c._serverOk,fallback_calls:events.length,catch_reference_error:thrown,identity_changed:current_slot!=='slotA',ack_slot_checked:false}});
}
const web=[];
for(const state of ['succeeded','throw']){let writes=0;const c=vm.createContext({fixturePayload:{opaque:'web fixture'},_LS_KEY:'MEMORY_ONLY',_saving:true,_lastSaveTime:17,_pendingForce:false,_drainPendingSaveNow:()=>{},console:{warn:()=>{}},Date:{now:()=>1000},localStorage:{setItem:()=>{writes++;if(state==='throw')throw Error('fixture write');}}});vm.runInContext('dbSave=async function(){try{const saveData=fixturePayload;\n'+webTail,c);await c.dbSave();web.push({observation:{state},setter_fixture_calls:writes,expected:{last_save_ms:c._lastSaveTime,acknowledged:c._lastSaveTime===1000,caught:c._lastSaveTime!==1000}});}
for(const [file,text]of Object.entries(texts))if(sha(fs.readFileSync(path.join(root,file),'utf8'))!==sha(text))throw Error('source changed');
console.log(JSON.stringify({cases,web,interleavings,sequential:sequentialFS.snapshot(),cloud,local,provenance,source_hashes:Object.fromEntries(Object.entries(texts).map(([k,v])=>[k,sha(v)])),source_unchanged:true,host_storage_writes:0,server_calls:0,fixture_only:true,local_lexical_catch_source_reproduced:true,catch_error_type_static_inference:true}));
})().catch(e=>{console.error(e);process.exitCode=1});
