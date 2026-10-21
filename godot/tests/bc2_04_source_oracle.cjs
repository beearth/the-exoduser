const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
// BC2-04 independent source VM: exact vortex switch body, UTF-8 file only.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and UTF-8 output path required');
const raw=SNAPSHOT.readBytes(),hash=crypto.createHash('sha256').update(raw).digest('hex');
assert.equal(hash,SNAPSHOT.sha256);
const lines=raw.toString().split('\n');assert(lines[40904].includes("case'bossVortexWind'"));assert(lines[40907].includes("case'bossVortex'"));
const source='\n'.repeat(40903)+'function tick(e,sp){switch(e.s){\n'+lines.slice(40904,40940).join('\n')+'\n}}';
let events=[],responses=[],cursor=0,units=[],nested=0,damageNested=0,collisionIndex=0,collisions=[],active=true,windIndex=0;
let targetE,targetP,eProxy,pProxy,mode='none',factors=[1.25,.4];
const line=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
const clone=value=>JSON.parse(JSON.stringify(value));
function command(name,args,ln=line()){events.push({kind:'command',value:{command:name,source_line:ln,args:clone(args),executed:false}})}
function kbProxy(value){return new Proxy(value,{set(t,k,v){t[k]=v;if(active)events.push({kind:'player_write',field:'kb.'+k,value:clone(v),source_line:line()});return true}})}
const ctx={Math:Object.create(Math),OPT:{shake:100}};
ctx.Math.random=()=>{const ln=line();let field;if(ln===40906)field=['vortex_wind_gate','vortex_wind_x','vortex_wind_y','vortex_wind_vx','vortex_wind_vy'][windIndex++];else if(ln===40930)field='vortex_active_size';assert(field,'unknown RNG site '+ln);const unit=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:ln,unit}});return unit};
for(const name of ['poolPart','addTxt','addParts'])ctx[name]=(...args)=>{command(name,args);cursor+=nested};
ctx.SFX={};for(const name of ['charge','groggy'])ctx.SFX[name]=(...args)=>{command('SFX.'+name,args);cursor+=nested};
ctx.canMv=(...args)=>{command('canMv',args);assert(collisionIndex<collisions.length);return collisions[collisionIndex++]};
ctx.ar=()=>({el:2});ctx.elMul=(element,armor)=>{assert.equal(armor,2);return factors[responses.length%factors.length]};
ctx.hurtP=function(damage,options){
 const ln=line(),tick=ln===40925;assert(tick||ln===40935);const family=tick?'vortex_tick':'vortex_explosion';
 const descriptor={family,actor_ref:'boss',hurtP_formula:{atk:targetE.atk,multiplier:tick?.6:2,element:targetE.el,elemental_provider:'elMul(e.el,ar().el)',rounding:'ToInt32_after_elemental'},options_omitted:arguments.length===1,requires:['elMul','ar','hurtP','complete_enemy_player_readback'],combat_verified:false};
 if(arguments.length===2)descriptor.options=options;
 command('resolve_vortex_damage',[descriptor],ln);active=false;
 if(mode==='iframe'){pProxy.iframes=3;pProxy.kb.x+=7;pProxy.kb.y-=2}
 if(mode==='shift'){pProxy.x+=80;pProxy.y-=5;eProxy.x-=3;eProxy.y+=4;eProxy.atk+=9;eProxy.el=2;pProxy.kb={x:50,y:-20};pProxy.iframes=0}
 if(mode==='timer'){eProxy.st2=8;eProxy._bossPhase=4;pProxy.s='charge'}
 if(mode==='explosion-shift'&&!tick){eProxy.x+=55;eProxy.y-=25;pProxy.x-=80;pProxy.y+=40;pProxy.kb={x:-17,y:4}}
 cursor+=damageNested;active=true;
 responses.push({enemy_after:clone(targetE),player_after:clone(targetP),cursor_after:cursor,resolved_damage:damage,element_multiplier:factors[responses.length%factors.length],command:clone(events.at(-1).value)});
};
vm.createContext(ctx);vm.runInContext(lines[31722],ctx);vm.runInContext(source,ctx,{filename:'exoduser-game.html'});
function enemy(state,t=0,phase=0){return {s:state,st2:t,x:10,y:20,r:44,facing:.25,speed:1.25,atk:46,el:0,_bossPhase:phase,ib:true,keep:{value:17}}}
function player(distance=20,angle=.3){return {x:10+Math.cos(angle)*distance,y:20+Math.sin(angle)*distance,r:12,iframes:0,s:'idle',kb:{x:1.25,y:-2.5},keep:71}}
const cases=[];
function run(name,si,e,p,sp=1,opts={}){
 events=[];responses=[];cursor=0;windIndex=0;collisionIndex=0;units=opts.units||[.875,.125,.5,0];nested=opts.nested||0;damageNested=opts.damage_nested||0;collisions=opts.collisions||[true];mode=opts.mode||'none';factors=opts.factors||[1.25,.4];active=true;
 targetE=clone(e);targetP=clone(p);targetP.kb=kbProxy(targetP.kb);
 eProxy=new Proxy(targetE,{set(t,k,v){t[k]=v;if(active)events.push({kind:'write',field:k,value:clone(v),source_line:line()});return true}});
 pProxy=new Proxy(targetP,{set(t,k,v){t[k]=k==='kb'?kbProxy(v):v;if(active)events.push({kind:'player_write',field:k,value:clone(v),source_line:line()});return true}});
 const options={shake:opts.shake??125,now_msec:opts.now_msec??12345.5},globals={shake:71};
 ctx.G=new Proxy({stage:si,shake:71},{set(t,k,v){t[k]=v;globals[k]=v;events.push({kind:'global_write',field:k,value:v,source_line:line()});return true}});
 ctx.P=pProxy;ctx.OPT.shake=options.shake;ctx._now=options.now_msec;ctx.e=eProxy;ctx.sp=sp;
 vm.runInContext('tick(e,sp)',ctx);
 const bits=value=>{const b=Buffer.alloc(8);b.writeDoubleLE(value);return b.toString('hex')};
 cases.push({name,si,enemy:e,player:p,sp,options,units:units.slice(),unit_bits:units.map(bits),nested,damage_nested:damageNested,collisions:collisions.slice(),mode,responses:clone(responses),expected:{enemy:clone(targetE),player:clone(targetP),events:clone(events),globals,cursor,collision_reads:collisionIndex}});
}
const paths=[[true],[false,true],[false,false,true],[false,false,false]];
for(let si=4;si<10;si++)for(const state of ['bossVortexWind','bossVortex']){
 const times=state==='bossVortexWind'?[2,.5,0,-.5]:[61,60.5,60,30,29.5,.5,0,-.5];
 for(let ti=0;ti<times.length;ti++)for(const sp of [.5,1,2])for(let path=0;path<paths.length;path++){
  const e=enemy(state,times[ti],(si+ti)%5),p=player([10,20,39.5,100,240][ti%5],.7);p.iframes=ti%4===0?2:0;p.s=ti%5===0?'charge':'idle';
  run('stage-state-matrix',si,e,p,sp,{collisions:paths[path],nested:path%2,damage_nested:2,mode:path===1?'iframe':'none'});
 }
}
for(let si=4;si<10;si++)for(const d of [0,15-1e-6,15,15+1e-6,40-1e-6,40,40+1e-6,180+si*5-1e-6,180+si*5,180+si*5+1e-6,100+si*5-1e-6,100+si*5,100+si*5+1e-6])for(const t of [30,30.5,0]){
 const e=enemy('bossVortex',t,4);e.speed=0;run('strict-distance',si,e,player(d,0),.5);
}
for(const t of [-30.5,-30,-.5,0,.5,29.5,30,30.5,60])for(const sp of [.5,1,2])for(const flag of ['normal','charge','iframe','negative-iframe']){
 const e=enemy('bossVortex',t,2);e.speed=0;const p=player(20,0);if(flag==='charge')p.s='charge';if(flag==='iframe')p.iframes=1;if(flag==='negative-iframe')p.iframes=-1;run('tick-modulo-'+flag,4,e,p,sp);
}
for(let si=4;si<10;si++)for(const mode of ['iframe','shift','timer','explosion-shift'])for(const t of [30,0]){const e=enemy('bossVortex',t,1);e.speed=0;run('owner-readback-'+mode,si,e,player(20),1,{mode,nested:2,damage_nested:3});}
for(const u of [0,.49999999999999994,.5,.5000000000000001,.9999999999999999])for(const t of [1,0])run('strict-wind-RNG',4,enemy('bossVortexWind',t),player(),1,{units:[u,.125,.875,.5,0]});
for(const el of [0,1,4,8])for(const atk of [46,4294967296+99]){const e=enemy('bossVortex',0,4);e.el=el;e.atk=atk;e.speed=0;run('raw-rounding',9,e,player(),1,{factors:[.37,1.7]});}
for(const xy of [[10,20],[1e12,-1e12]]){const e=enemy('bossVortexWind',0);[e.x,e.y]=xy;run('particle-subtraction-order',4,e,player(),1,{units:[.875,.125,.875,.125,.875]});}
for(const now_msec of [0,.125,199.5,200,1e6])for(const shake of [0,100,125.5])for(const t of [0,60.5]){const e=enemy('bossVortex',t,4);e.speed=0;run('time-and-shake-readers',9,e,player(20),.5,{now_msec,shake,nested:1});}
const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),rng:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='rng').length,0),damage_requests:cases.reduce((n,c)=>n+c.responses.length,0),collision_reads:cases.reduce((n,c)=>n+c.expected.collision_reads,0)};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges:[[31723,31723],[40905,40940]],summary,cases}),'utf8');
