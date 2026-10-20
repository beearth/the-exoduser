// Test-only: evaluate exact source read branches with in-memory transports.
// No server module is required, no user data is opened, no listener or fetch runs.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=process.argv[2];
const sources=Object.fromEntries(['server.cjs','node-main.js','index.html','game.html'].map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')]));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const provenance=[];
function extract(file,begin,end){const s=sources[file],a=s.indexOf(begin),b=s.indexOf(end,a+begin.length);if(a<0||b<0)throw Error('missing source '+file);const code=s.slice(a,b);provenance.push({file,start_line:s.slice(0,a).split('\n').length,end_line:s.slice(0,b).split('\n').length,sha256:sha(code)});return code;}
const routeCodes=Object.fromEntries([['dev_server','server.cjs'],['nw_native','node-main.js']].map(([target,file])=>[target,extract(file,"if (pathname === '/api/slots'", "if (pathname === '/api/save'")]));
const lobbyCode=extract('index.html','async function loadLocalCharacters(){','// 슬롯 스크롤 상태');
const guard='if(j.ok&&j.data){_foundSave=true;_loaded=dbRestore(j.data);}';
if(!sources['game.html'].includes(guard)||!sources['index.html'].includes('if(d.player)'))throw Error('load admission changed');
provenance.push({file:'game.html',start_line:sources['game.html'].slice(0,sources['game.html'].indexOf(guard)).split('\n').length,sha256:sha(guard)});
const fileCases=[
 {id:'empty',files:[]},
 {id:'filters_order_and_first_replace',files:[
  {name:'z.json',raw:JSON.stringify({ts:1700000000123,player:{lv:12},game:{stage:2,kills:8},charIdx:3})},
  {name:'_hidden.json',raw:'{'},{name:'upper.JSON',raw:'{}'},{name:'metadata.json',raw:'{"name":"new","charIdx":false}'},
  {name:'a.json.b.json',raw:'{}'},{name:'bad.json',raw:'{"x":1,}'},{name:'null.json',raw:'null'}]},
 {id:'falsy',files:[{name:'zero.json',raw:'{"ts":0,"player":{"lv":0},"game":{"stage":0,"kills":0},"charIdx":false}'},{name:'empty.json',raw:'{"ts":"","player":{"lv":false},"game":{"stage":null,"kills":""},"charIdx":""}'}]},
 {id:'truthy_carriers',files:[{name:'truth.json',raw:'{"ts":[],"player":{"lv":{}},"game":{"stage":[],"kills":{}},"charIdx":[]}'},{name:'strings.json',raw:'{"ts":"12","player":{"lv":"7"},"game":{"stage":"0","kills":"3"},"charIdx":null}'}]},
 {id:'primitive_roots',files:['false','0','[]','"text"','null'].map((raw,i)=>({name:'p'+i+'.json',raw}))},
 {id:'malformed_and_duplicate',files:['{"x":1,}','[1,]','{"lv":01}','{"x":NaN}','{"x":"a\nb"}','{"x":1} junk','{"player":{"lv":2},"player":{"lv":9}}'].map((raw,i)=>({name:'bad'+i+'.json',raw}))}
];
const server=[];
for(const [target,code] of Object.entries(routeCodes))for(const fixture of fileCases){
 const input=JSON.stringify(fixture.files);let result;
 const ctx=vm.createContext({pathname:'/api/slots',req:{method:'GET'},res:{},SAVE_DIR:'fixture-only',
 fs:{readdirSync:()=>fixture.files.map(f=>f.name),readFileSync:name=>fixture.files.find(f=>f.name===name).raw},
 path:{join:(_,name)=>name},sendJSON:(_,status,payload)=>{if(status!==200)throw Error('unexpected status');result=payload;}});
 vm.runInContext('(function(){'+code+'})()',ctx,{timeout:1000});
 server.push({target,id:fixture.id,files:fixture.files,expected:JSON.parse(JSON.stringify(result)),unchanged:input===JSON.stringify(fixture.files)});
}
const valid=['{}','[]','null','true','false','0','-0','1.25e+2',' \t\r\n{"a":-2.5E-2} ','{"x":"\\uAC00\\uD83D\\uDE00"}','{"x":"\\\"\\\\\\/\\b\\f\\n\\r\\t"}','{"a":1,"a":2}',JSON.stringify({deep:[{x:[0,false,null,'']}]})];
const invalid=['',' ', '{','[', '{x:1}', '{"x":1,}','[1,]','{"x":01}','+1','.1','1.','1e','--1','NaN','Infinity','undefined','null false','truex','\uFEFF{}','\u00a0{}','"a\nb"','"\\x20"','"\\uZZZZ"','"unterminated'];
const jsonCases=[...valid,...invalid].map(raw=>{try{return{raw,ok:true,expected:JSON.parse(raw)}}catch{return{raw,ok:false}}});
const fallback=[JSON.stringify({name:'fresh',charIdx:false}),JSON.stringify({name:'saved',player:{lv:8},game:{stage:3},charIdx:2}),'null','false','{"bad":1,}'];
const responses=[{id:'ok',status:200,body:'{"ok":true,"slots":[{"name":"remote","lv":7}],"development":true}'},
 {id:'no_marker',status:200,body:'{"ok":true,"slots":[]}'},
 {id:'marker_number',status:200,body:'{"ok":true,"slots":[],"development":1}'},
 {id:'marker_string',status:200,body:'{"ok":true,"slots":[],"development":"true"}'},
 {id:'falsy_ok',status:200,body:'{"ok":false,"slots":[1],"development":true}'},
 {id:'falsy_slots',status:200,body:'{"ok":true,"slots":null,"development":true}'},
 {id:'bad_slots',status:200,body:'{"ok":true,"slots":{},"development":true}'},
 {id:'null',status:200,body:'null'}, {id:'primitive',status:200,body:'false'},
 {id:'404',status:404,body:'{"ok":false,"error":"Not found"}'}, {id:'500',status:500,body:'Internal Server Error'},
 {id:'bad_json',status:200,body:'{"ok":true,}'},{id:'transport',transport_error:true}];
const lobby=[];
(async()=>{
 for(const build of ['full','demo'])for(const test_mode of [true,false])for(const response of responses){
  const contexts=[false,...(build==='full'?[true]:[])];
  for(const stale of contexts){
   let renders=0,syncs=0;
   const ctx=vm.createContext({_LOBBY_BUILD:build,_testMode:test_mode,_characterLoadSeq:9,_developerSlots:false,_localSlots:[{sentinel:'unchanged'}],_selectedSlot:null,_selectedSlotName:null,
    $:()=>null,_updateCharDisplay:()=>{},_renderSlotList:()=>{renders++},_demoSyncActiveSave:()=>{syncs++},
    localStorage:{getItem:key=>fallback[Number(key.slice('hellsave_demo_'.length))]},
    fetch:async()=>{if(stale)ctx._characterLoadSeq=11;if(response.transport_error)throw Error('fixture failure');return{ok:response.status>=200&&response.status<300,json:async()=>JSON.parse(response.body)}}});
   vm.runInContext(lobbyCode,ctx,{timeout:1000});await ctx.loadLocalCharacters();
   lobby.push({target:'dev_server',response,lobby:{build,test_mode,request:10,current_request:stale?11:10},fallback,expected:JSON.parse(JSON.stringify({slots:ctx._localSlots,development:ctx._developerSlots})),stale,renders,syncs});
  }
 }
 const load=[];
 for(const data of [{name:'fresh',ts:1,charIdx:0},{player:{lv:9,hp:123},inv:{bag:[{opaque:{x:1}}],equipped:{}},stats:{str:1},passives:{pAtk:0},game:{stage:2},skills:{kiSlash:1}},{player:{}},{player:null},{player:false},[],"text",0,false,null]){
  const response={status:200,body:JSON.stringify({ok:true,data})};let consumed=null,calls=0;
  const ctx=vm.createContext({j:JSON.parse(response.body),_foundSave:false,_loaded:false,dbRestore:value=>{calls++;consumed=value;return false;}});
  vm.runInContext(guard,ctx,{timeout:1000});
  load.push({response,found:ctx._foundSave,restore_stub_calls:calls,payload:consumed});
 }
 for(const response of [{status:404,body:'{}'},{status:500,body:'bad'},{status:200,body:'{'},{status:200,body:'null'},{status:200,body:'{"ok":false,"data":{"player":{}}}'},{transport_error:true}])load.push({response,expected_status:response.transport_error?'TRANSPORT_ERROR':response.status===404?'NOT_FOUND':response.status===500?'HTTP_ERROR':response.body==='{'||response.body==='null'?'PARSE_ERROR':'REJECTED'});
 for(const [file,bytes]of Object.entries(sources))if(sha(fs.readFileSync(path.join(root,file),'utf8'))!==sha(bytes))throw Error('source changed');
 console.log(JSON.stringify({server,jsonCases,lobby,load,provenance,source_hashes:Object.fromEntries(Object.entries(sources).map(([p,s])=>[p,sha(s)])),source_unchanged:true,actual_server_calls:0,actual_save_writes:0,actual_restore_calls:0}));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
