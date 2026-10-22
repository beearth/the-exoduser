const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
// BC2-03 independent original-source oracle. Adapted from the adopted BC06 VM driver.
// Expected packets/events come only from game.html, never GDScript implementation.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and UTF-8 fixture path required');
const raw=SNAPSHOT.readBytes(),lines=raw.toString().split('\n');
const ranges=[[9820,9957],[9960,10011],[14333,14333],[14338,14338],[16633,16633],[16940,16940],[17250,17254],[31725,31725],[37703,38235]],src=Array(lines.length).fill('');for(const[a,b]of ranges)for(let n=a;n<=b;n++)src[n-1]=lines[n-1];
let events=[],cursor=0,units=[.5],nested=0,queueSeen=new Set(),target=null,eProxy=null,collision=true,safe=null,safeCounter=0;const siteCount={};
const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
const clone=x=>JSON.parse(JSON.stringify(x,(_,v)=>{if(v===eProxy)return {actor_ref:'boss'};assert(typeof v!=='number'||Number.isFinite(v),'non-finite oracle fixture');return v}));
function command(name,args,line=ln()){events.push({kind:'command',value:{command:name,source_line:line,args:clone(args),executed:false}})}
const ctx={Math:Object.create(Math),_isDruidFinale:()=>false,_FDG_DRUID_THORN_FIRST:false};
ctx.Math.random=()=>{const line=ln();const field=({37839:'spiral_direction',38128:'fire_rain_x',38129:'fire_rain_y',38130:'fire_rain_radius'})[line];assert(field,'unowned RNG '+line);const unit=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:line,unit}});return unit};
for(const name of ['addTxt','addParts','shake'])ctx[name]=(...args)=>{command(name,args);cursor+=nested};
ctx.SFX={};for(const name of ['charge','swing','magic','detonate','block'])ctx.SFX[name]=(...args)=>{command('SFX.'+name,args);cursor+=nested};
ctx._T=x=>'translated:'+x;ctx._spawnBossProjectile=(_e,shot)=>{command('_spawnBossProjectile',[shot]);cursor+=nested};
ctx.canMv=(...args)=>{command('canMv',args);return collision};ctx.safePt=(...args)=>{command('safePt',args);return safe};
vm.createContext(ctx);vm.runInContext(src.join('\n'),ctx,{filename:'exoduser-game.html'});
const moves=JSON.parse(vm.runInContext('JSON.stringify(BOSS_MOVES)',ctx)),sets=JSON.parse(vm.runInContext('JSON.stringify(_BOSS_MOVESET.map(x=>Array.from(x)))',ctx));const union=[...new Set(sets.slice(0,4).flat())];assert.equal(union.length,24);const phases=JSON.parse(vm.runInContext('JSON.stringify(BOSS_PHASES)',ctx));
const queueNames=['_spiralBullets','_wallPushes','_fireRains','_shockGrids','_donutSlams','_crossWipes'];
function queue(name,arr){Object.defineProperty(arr,'push',{value:function(...values){for(const value of values)command('append_global_queue',[name,value]);return Array.prototype.push.apply(this,values)},enumerable:false});return arr}
function base(phase=0){return {ib:true,etype:0,_bossPhase:phase,x:10,y:20,r:44,atk:46,el:0,col:'#abcdef',facing:.25,s:'idle',st2:10,_feinting:true,_isTail:true,_druidFanWindMax:999,poise:321,reviveIframes:7,keep:{unowned:91}}}
const cases=[];
function run(name,si,id,phase,enemy=base(phase),d=100,extra=0,context={thorn_first:false,player_x:100,player_y:200,map_width:128,map_height:108},seq=[0,.5,.875,.125],opts={}){
 events=[];cursor=0;units=seq;nested=opts.nested||0;collision=opts.collision??true;safe=opts.safe??null;queueSeen=new Set();siteCount[38104]=0;
 target=structuredClone(enemy);eProxy=new Proxy(target,{set(t,k,v){t[k]=v;events.push({kind:'write',field:k,value:clone(v),source_line:ln()});return true}});
 const g={stage:si,mw:context.map_width,mh:context.map_height};const initialQueues={};for(const q of queueNames)if(opts.preexisting){g[q]=queue(q,[{keep:'old'}]);initialQueues[q]=[{keep:'old'}]}
 ctx.G=new Proxy(g,{get(t,k){if(queueNames.includes(k)&&!queueSeen.has(k)){queueSeen.add(k);command('ensure_global_queue',[k])}return t[k]},set(t,k,v){t[k]=queueNames.includes(k)?queue(k,v):v;return true}});
 ctx.P={x:context.player_x,y:context.player_y};ctx._FDG_DRUID_THORN_FIRST=context.thorn_first;ctx.e=eProxy;ctx.mv=moves.find(m=>m.id===id);ctx.d=d;ctx.phase=phase;ctx.extra=extra;
 vm.runInContext('_bossStartPattern(e,mv,d,phase,extra)',ctx);
 const finalQueues={};for(const q of queueNames)if(Object.hasOwn(g,q))finalQueues[q]=clone(g[q]);
 cases.push({name,si,id,phase,enemy,d,extra,context,units:seq,nested,collision,safe,initial_queues:initialQueues,expected:{enemy:clone(target),events:clone(events),queues:finalQueues,cursor}});
}

const hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,SNAPSHOT.sha256);
const ids=['vortex','beanRain','fanWave','spiralBullet','wallPush','shieldBash2','fireRain','shockGrid','donutSlam','crossWipe'];
for(let si=4;si<10;si++)for(let phase=0;phase<5;phase++)for(let mi=0;mi<ids.length;mi++)for(const mode of [0,1]){
 const e=base((phase+si+mode)%5);e.el=0;
 run('six-stage-matrix',si,ids[mi],phase,e,mode?119:120,mode?7:0,
 {player_x:100,player_y:200,map_width:128,map_height:108},[0,.5,.875,.125],{preexisting:mode===1,nested:mode===1?2:0});
}
for(const id of ids)for(let phase=0;phase<5;phase++){
 const zero=-Math.trunc(moves.find(m=>m.id===id).tele*phases[phase].teleM);
 for(const extra of [zero,zero-.25,zero+.25])run('tele-zero-and-fraction',4,id,phase,base(4),100,extra);
}
for(const u of [0,.49999999999999994,.5,.5000000000000001,.9999999999999999])run('spiral-strict-direction',9,'spiralBullet',4,base(4),100,0,undefined,[u]);
for(const el of [0,1,4,8]){const e=base(4);e.el=el;run('spiral-element-read',9,'spiralBullet',4,e)}
for(const id of ['fireRain','shockGrid','donutSlam','crossWipe'])for(const dims of [[],[0,0],[null,null],[12.25,8.5],[-3,7]]){
 const e=base(4);e.atk=4294967296+99;e.r=61.5;
 const c={player_x:-10,player_y:20};if(dims.length)[c.map_width,c.map_height]=dims;
 run('map-and-int32',4,id,1,e,100,0,c,[.9999999999999999,0,.5],{preexisting:true,nested:1});
}
for(const id of ids)for(const actorPhase of [0,1.25,2,4,null]){const e=base(actorPhase);run('separate-actor-phase',8,id,4,e,100,-1.5,{player_x:10,player_y:20,map_width:1,map_height:1},[.125,.875,0]);}
for(const id of ['fanWave','wallPush','shieldBash2','spiralBullet'])for(const xy of [[10,20],[10,-20],[-50,20],[10,-0.000001]])run('aim-lock',7,id,0,base(),100,999,{player_x:xy[0],player_y:xy[1]},[.5]);
const bits=value=>{const b=Buffer.alloc(8);b.writeDoubleLE(value);return b.toString('hex')};for(const row of cases)row.unit_bits=row.units.map(bits);
const parry=JSON.parse(vm.runInContext('JSON.stringify(Array.from(_PARRYABLE_ATK))',ctx));
const counts={};for(const c of cases)counts[c.id]=(counts[c.id]||0)+1;
const summary={cases:cases.length,ids:ids.length,events:cases.reduce((s,c)=>s+c.expected.events.length,0),rng:cases.reduce((s,c)=>s+c.expected.events.filter(e=>e.kind==='rng').length,0),counts};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges,ids,parry,cases,summary}),'utf8');
