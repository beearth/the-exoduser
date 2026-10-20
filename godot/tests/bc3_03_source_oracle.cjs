// BC3-03 independent original-source oracle. Adapted from the adopted BC06 VM driver.
// Expected packets/events come only from game.html, never GDScript implementation.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and UTF-8 fixture path required');
const raw=fs.readFileSync(sourcePath),lines=raw.toString().split('\n');
const ranges=[[9820,9957],[9960,10011],[14333,14333],[14338,14338],[16631,16631],[16938,16938],[17248,17252],[31723,31723],[37701,38233]],src=Array(lines.length).fill('');for(const[a,b]of ranges)for(let n=a;n<=b;n++)src[n-1]=lines[n-1];
const hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
const pins=["34e512df32e3cf1356f3328e1117976811bca7e610d03fa370e4d08193d0cf80", "d679718e40296531c3711e7e9bda4a68291d139f3650f46abc86f170dc11a3f3", "a0bb447f773a52c3c7a8dade348dccb9ff74c0823ab8ee5976618ddb0cee4340", "117540421830f822266f9f5c1361147f7a4744641ec03d8a95a36da137bc1f22", "51b0c122d4b59b86d79dd16f19b5dfd139a78b8739bfd0e4bb84015c286a6eeb", "f52a6e7d7bffd9cb494bc389ee32df02000ed01fa3cff7190b1f5c9ef9afa57f", "5e4f126fbe44b5d9d82888cdac007399bdf892a6a18c48e9753c23a7d1237a87", "424ecda76b94d6843cbf78ff261ed8431fb7e3c5c08d15d1b7d30cf457adf062", "ea7e2f3a791db593a1291c56c730cea5b328e20914e391f7820d31275238f9cb"];ranges.forEach(([a,b],i)=>assert.equal(crypto.createHash('sha256').update(lines.slice(a-1,b).join('\n')).digest('hex'),pins[i]));
let events=[],cursor=0,units=[.5],nested=0,queueSeen=new Set(),target=null,eProxy=null,collision=true,safe=null,safeCounter=0;const siteCount={};
const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
const clone=x=>JSON.parse(JSON.stringify(x,(_,v)=>{if(v===eProxy)return {actor_ref:'boss'};assert(typeof v!=='number'||Number.isFinite(v),'non-finite oracle fixture');return v}));
function command(name,args,line=ln()){events.push({kind:'command',value:{command:name,source_line:line,args:clone(args),executed:false}})}
const ctx={Math:Object.create(Math),_isDruidFinale:()=>false,_FDG_DRUID_THORN_FIRST:false};
ctx.Math.random=()=>{const line=ln();const field=({37740:'tele_angle',37741:'tele_distance',37850:'delay_hold',38167:'safe_quadrant',38196:'tidal_direction'})[line];assert(field,'unowned RNG '+line);const unit=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:line,unit}});return unit};
for(const name of ['addTxt','addParts','shake'])ctx[name]=(...args)=>{command(name,args);cursor+=nested};
ctx.SFX={};for(const name of ['charge','swing','magic','detonate','block'])ctx.SFX[name]=(...args)=>{command('SFX.'+name,args);cursor+=nested};
ctx._T=x=>'translated:'+x;ctx._L=(ko,en)=>ctx.lang==='en'?en:ko;ctx._spawnBossProjectile=(_e,shot)=>{command('_spawnBossProjectile',[shot]);cursor+=nested};
ctx.canMv=(...args)=>{command('canMv',args);return collision};ctx.safePt=(...args)=>{command('safePt',args);return safe};
vm.createContext(ctx);vm.runInContext(src.join('\n'),ctx,{filename:'exoduser-game.html'});
const moves=JSON.parse(vm.runInContext('JSON.stringify(BOSS_MOVES)',ctx)),sets=JSON.parse(vm.runInContext('JSON.stringify(_BOSS_MOVESET.map(x=>Array.from(x)))',ctx));const union=[...new Set(sets.slice(0,4).flat())];assert.equal(union.length,24);const phases=JSON.parse(vm.runInContext('JSON.stringify(BOSS_PHASES)',ctx));
const queueNames=['_gravityWells','_safeCorners','_tidalWipes'];
function queue(name,arr){Object.defineProperty(arr,'push',{value:function(...values){for(const value of values)command('append_global_queue',[name,value]);return Array.prototype.push.apply(this,values)},enumerable:false});return arr}
function base(phase=0){return {ib:true,etype:0,_bossPhase:phase,x:10,y:20,r:44,atk:46,el:2,col:'#3388ff',facing:.25,s:'idle',st2:10,_feinting:true,_isTail:true,_druidFanWindMax:999,poise:321,reviveIframes:7,keep:{unowned:91}}}
const cases=[];
function run(name,si,id,phase,enemy=base(phase),d=100,extra=0,context={thorn_first:false,player_x:100,player_y:200,map_width:128,map_height:108},seq=[0,.5,.875,.125],opts={}){
 events=[];cursor=0;units=seq;nested=opts.nested||0;collision=opts.collision??true;safe=opts.safe??null;queueSeen=new Set();siteCount[38102]=0;
 target=structuredClone(enemy);eProxy=new Proxy(target,{set(t,k,v){t[k]=v;events.push({kind:'write',field:k,value:clone(v),source_line:ln()});return true}});
 const g={stage:si,mw:context.map_width,mh:context.map_height};const initialQueues={};for(const q of queueNames)if(opts.preexisting){g[q]=queue(q,[{keep:'old'}]);initialQueues[q]=[{keep:'old'}]}
 ctx.G=new Proxy(g,{get(t,k){if(queueNames.includes(k)&&!queueSeen.has(k)){queueSeen.add(k);command('ensure_global_queue',[k])}return t[k]},set(t,k,v){t[k]=queueNames.includes(k)?queue(k,v):v;return true}});
 ctx.P={x:context.player_x,y:context.player_y};ctx.lang=context.lang||'ko';ctx._FDG_DRUID_THORN_FIRST=context.thorn_first;ctx.e=eProxy;ctx.mv=moves.find(m=>m.id===id);ctx.d=d;ctx.phase=phase;ctx.extra=extra;
 vm.runInContext('_bossStartPattern(e,mv,d,phase,extra)',ctx);
 const finalQueues={};for(const q of queueNames)if(Object.hasOwn(g,q))finalQueues[q]=clone(g[q]);
 cases.push({name,si,id,phase,enemy,d,extra,context,units:seq,nested,collision,safe,initial_queues:initialQueues,expected:{enemy:clone(target),events:clone(events),queues:finalQueues,cursor}});
}


const ids=['laser','teleStrike','delaySlash','perilThrust','safeCorner','tidalWipe','gravityWell'];
for(let si=10;si<14;si++)for(let phase=0;phase<5;phase++)for(let i=0;i<ids.length;i++){
 const mode=(si+phase+i)%2,e=base((phase+si)%5);e.el=2;
 run('four-stage-five-phase',si,ids[i],phase,e,mode?119:120,mode?7:0,
 {player_x:100,player_y:200,map_width:128,map_height:108,lang:mode?'en':'ko'},[0,.5,.875,.125],
 {preexisting:mode===1,nested:mode===1?2:0,collision:(si+phase)%3===0,safe:(si+phase)%3===1?{x:56.25,y:98.5}:null});
}
for(const id of ids)for(let phase=0;phase<5;phase++){
 const zero=-Math.trunc(moves.find(m=>m.id===id).tele*phases[phase].teleM);
 for(const extra of [zero,zero-.25,zero+.25])run('tele-fallback-fraction',10,id,phase,base(4),100,extra);
}
for(const id of ['safeCorner','tidalWipe'])for(const u of [0,.24999999999999997,.25,.25000000000000006,.49999999999999994,.5,.5000000000000001,.7499999999999999,.75,.7500000000000001,.9999999999999999]){
 run('quadrant-boundary',13,id,2,base(1.25),100,0,{player_x:-10,player_y:20,map_width:0,map_height:null,lang:'en'},[u],{preexisting:true,nested:1});
}
for(const u of [0,1/90,.49999999999999994,.5,.5000000000000001,.9999999999999999])run('hold-draw-boundary',11,'delaySlash',4,base(0),100,99,undefined,[u]);
for(const collisionMode of [0,1,2])for(const seq of [[0,0],[.5,.5],[.9999999999999999,.9999999999999999]]){
 run('tele-collision-fallback',12,'teleStrike',0,base(4),100,0,undefined,seq,{collision:collisionMode===0,safe:collisionMode===1?{x:88.5,y:-13.25}:null,nested:1});
}
for(const id of ['safeCorner','tidalWipe'])for(const dims of [[],[0,0],[null,null],[12.25,8.5],[-3,7]]){
 const e=base(1.25);e.atk=4294967296+99;
 const c={player_x:-10,player_y:20};if(dims.length)[c.map_width,c.map_height]=dims;
 run('map-and-int32',10,id,4,e,100,-1.5,c,[.9999999999999999,0,.5],{preexisting:true,nested:1});
}
for(const id of ['teleStrike','gravityWell','perilThrust'])for(const xy of [[10,20],[100,20],[10,200],[-50,20],[10,-20]]){
 run('aim-and-zero-distance',13,id,1,base(null),100,0,{player_x:xy[0],player_y:xy[1]},[.125,.875]);
}
const parry=JSON.parse(vm.runInContext('JSON.stringify(Array.from(_PARRYABLE_ATK))',ctx));
const summary={cases:cases.length,ids:ids.length,events:cases.reduce((s,c)=>s+c.expected.events.length,0),rng:cases.reduce((s,c)=>s+c.expected.events.filter(e=>e.kind==='rng').length,0)};
function encode(v){if(typeof v==='number'){assert(Number.isFinite(v));if(Number.isSafeInteger(v))return {integer:String(v)};const b=Buffer.alloc(8);b.writeDoubleLE(v);return {binary64:b.toString('hex')}}if(Array.isArray(v))return v.map(encode);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]));return v}
fs.writeFileSync(outputPath,JSON.stringify(encode({source_only:true,game_sha256:hash,ranges,pins,ids,parry,cases,summary})),'utf8');
console.log(JSON.stringify(summary));
