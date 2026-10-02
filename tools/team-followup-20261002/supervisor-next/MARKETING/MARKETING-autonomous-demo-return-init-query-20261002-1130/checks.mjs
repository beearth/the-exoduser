import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=process.cwd(),src=readFileSync('index.html','utf8'),sha=x=>createHash('sha256').update(x).digest('hex');
const query=src.slice(src.indexOf('const _qp=new URLSearchParams(window.location.search);'),src.indexOf('\nfunction _goLogin',src.indexOf('const _qp=new URLSearchParams(window.location.search);')));
const start=src.indexOf('(async()=>{',src.indexOf('// ═══ Init ═══'));
const end=src.indexOf('\n})();',start)+7;const caller=src.slice(start,end);new vm.Script(caller);
async function run(search,{nw=false,sbPresent=true,session=false,seen=false}={},querySource=query){
 const calls=[],offline={style:{}},user={id:'fixture-user'};
 const s={window:{location:{search}},location:{hostname:'localhost'},URLSearchParams,_LOBBY_BUILD:'demo',_TL:x=>x,currentUser:null,
 $:id=>id==='offlineBtn'?offline:null,showLoading:t=>calls.push(['loading',t]),_cinSeenChk:()=>seen,
 _goLogin:()=>calls.push(['login']),_goCinematic:()=>calls.push(['cinematic']),_enterOffline:()=>calls.push(['offline']),_goLobby:async()=>calls.push(['lobby']),
 sb:sbPresent?{auth:{getSession:async()=>{calls.push(['getSession']);return {data:{session:session?{user}:null}};},onAuthStateChange:()=>calls.push(['authListener'])}}:null};
 if(nw)s.nw={};const ctx=vm.createContext(s);vm.runInContext(querySource,ctx);await vm.runInContext(caller,ctx);
 return {search,nw,sbPresent,session,seen,calls,testMode:vm.runInContext('_testMode',ctx),fromGame:vm.runInContext('_fromGame',ctx),currentUser:s.currentUser};
}
const cases=[
 ['?demo=1&lobby=1',{nw:true},'login'],
 ['?lobby=1&demo=1',{nw:true},'login'],
 ['?demo=1&lobby=1&test=1',{},'login'],
 ['?demo=1',{nw:true},'cinematic'],
 ['?demo=1',{nw:true,seen:true},'login'],
 ['?demo=1&lobby=0',{nw:true},'cinematic'],
 ['?demo=1&lobby=1',{session:false},'lobby'],
 ['?demo=1&lobby=1',{session:true},'lobby'],
 ['?demo=1&lobby=1',{sbPresent:false},'offline'],
 ['?demo=1&lobby=1&cinematic=1',{nw:true},'cinematic']
];
const observations=[];for(const[q,opts,expected]of cases){const r=await run(q,opts);const sink=r.calls.find(x=>['login','cinematic','lobby','offline'].includes(x[0]))?.[0];assert.equal(sink,expected);observations.push({...r,expected});}
const broken=query.replace("_qp.get('lobby')==='1'","_qp.get('lobby')==='0'");assert.notEqual(broken,query);
const failure=await run('?demo=1&lobby=1',{nw:true},broken);assert.equal(failure.fromGame,false);assert(failure.calls.some(x=>x[0]==='cinematic'));
const candidate=broken.replace("_qp.get('lobby')==='0'","_qp.get('lobby')==='1'");assert.equal(candidate,query);
const repaired=await run('?demo=1&lobby=1',{nw:true},candidate);assert.equal(repaired.fromGame,true);assert(repaired.calls.some(x=>x[0]==='login'));
assert.equal(sha(readFileSync('index.html','utf8')),sha(src));
console.log(JSON.stringify({taskId:'MARKETING-autonomous-demo-return-init-query-20261002-1130',at:new Date().toISOString(),root,inputSha:sha(src),querySha:sha(query),callerSha:sha(caller),query,callerStartLine:src.slice(0,start).split('\n').length,observations,injectedFailure:failure,memoryCandidate:repaired,decision:'NO-FIX: current query/caller branch controls pass; injected parser defect detected and restored',boundary:'actual whole init async caller plus actual query declarations; screen/navigation/loading/auth endpoints are explicit in-memory stubs, no showCharGate/route function rerun, no live auth/browser/storage',filesWritten:0,productionApplied:false,runtimeAccepted:false},null,2));
