const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
// Exact source beanRain switch -> self-owned UTF-8 fixture; no Godot imports.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and UTF-8 output required');
const raw=SNAPSHOT.readBytes(),hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,SNAPSHOT.sha256);
const lines=raw.toString().split('\n');assert(lines[41208].includes("case'bossBeanRainWind'"));assert(lines[41212].includes("case'bossBeanRain'"));
const src='\n'.repeat(41207)+'function tick(e,sp){switch(e.s){\n'+lines.slice(41208,41233).join('\n')+'\n}}';
let events=[],cursor=0,units=[],nested=0,collision=true,siteIndex={},target=null,eProxy=null;
const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
const clone=x=>JSON.parse(JSON.stringify(x));
function command(name,args,line=ln(),metadata={}){events.push({kind:'command',value:{command:name,source_line:line,args:clone(args),executed:false,...metadata}})}
const ctx={Math:Object.create(Math)};
ctx.Math.random=()=>{const line=ln();const ordinal=siteIndex[line]||0;siteIndex[line]=ordinal+1;
 const field=line===41211?['bean_rain_wind_gate','bean_rain_wind_x','bean_rain_wind_y'][ordinal]:line===41223?['bean_rain_x','bean_rain_y'][ordinal%2]:({41220:'bean_rain_angle',41221:'bean_rain_speed',41222:'bean_rain_coin',41225:'bean_rain_puff_gate'})[line];
 assert(field,'unowned RNG '+line);const unit=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:line,unit}});return unit;
};
for(const name of ['poolPart','addParts'])ctx[name]=(...args)=>{command(name,args);cursor+=nested};
ctx.SFX={charge:(...args)=>{command('SFX.charge',args);cursor+=nested}};
ctx.canMv=(...args)=>{command('canMv',args);return collision};
ctx._spawnBossProjectile=(e,props)=>{assert.equal(e,eProxy);const undefinedFields=Object.keys(props).filter(k=>props[k]===undefined);command('_spawnBossProjectile',[props],ln(),{actor_ref:'boss',source_undefined_fields:undefinedFields});cursor+=nested};
vm.createContext(ctx);vm.runInContext(lines[14332],ctx);vm.runInContext(src,ctx,{filename:'exoduser-game.html'});
function enemy(state,t=0,phase=0,brT=0){return {s:state,st2:t,x:10,y:20,r:44,facing:.25,speed:1.25,atk:46,el:0,col:'#abcdef',_bossPhase:phase,_brT:brT,_brDur:137.5,ib:true,keep:{value:17}}}
function player(x=100,y=200){return {x,y,r:12,iframes:0,s:'idle',keep:71}}
const bits=value=>{const b=Buffer.alloc(8);b.writeDoubleLE(value);return b.toString('hex')};
const numericBits=obj=>Object.fromEntries(Object.entries(obj).filter(([k,v])=>typeof v==='number').map(([k,v])=>[k,bits(v)]));
const cases=[];
function run(name,si,e,p=player(),sp=1,opts={}){
 events=[];cursor=0;units=opts.units||[.875,.125,.5,0,.25,.75,.125];nested=opts.nested||0;collision=opts.collision??true;siteIndex={};
 target=clone(e);eProxy=new Proxy(target,{set(t,k,v){t[k]=v;events.push({kind:'write',field:k,value:clone(v),source_line:ln()});return true}});
 const globals={shake:71};ctx.G=new Proxy({stage:si,shake:71},{set(t,k,v){t[k]=v;globals[k]=v;events.push({kind:'global_write',field:k,value:v,source_line:ln()});return true}});
 const options={shake:opts.shake??125};ctx.OPT={shake:options.shake};ctx.P=clone(p);ctx.e=eProxy;ctx.sp=sp;
 vm.runInContext('tick(e,sp)',ctx);
 cases.push({name,si,enemy:e,player:p,sp,options,units:units.slice(),unit_bits:units.map(bits),input_bits:{enemy:numericBits(e),player:numericBits(p),sp:bits(sp),options:numericBits(options)},nested,collision,expected:{enemy:clone(target),player:clone(p),events:clone(events),globals,cursor}});
}
for(let si=4;si<10;si++)for(let phase=0;phase<5;phase++)for(const state of ['bossBeanRainWind','bossBeanRain']){
 const times=state==='bossBeanRainWind'?[2,.5,0,-.5]:[80,30,5,.5,0,-.5];
 for(let ti=0;ti<times.length;ti++)for(const sp of [.5,1,2])for(const collision of [true,false]){
  const e=enemy(state,times[ti],phase,[0,4.5,4,9.5,5,14][ti]);
  run('stage-state-matrix',si,e,player(100-ti*10,200+ti*5),sp,{collision,nested:collision?0:2});
 }
}
for(const brT of [0,.5,1,4,4.5,4.999999999,5,5.5,9.5,-.5,-1,-4.5,2147483646.5,2147483648.5,4294967295,4294967296.5])for(const sp of [.5,1,2,5,5.5,12.25])run('signed-int32-modulo',4,enemy('bossBeanRain',0,4,brT),player(),sp,{nested:1});
for(const phase of [0,1,2,3,3.333333333333333,3.3333333333333335,4])for(const nested of [0,1,3])run('count-phase-boundary',9,enemy('bossBeanRain',1,phase,4),player(),1,{nested});
for(const coin of [0,.49999999999999994,.5,.5000000000000001,.9999999999999999])run('black-red-boundary',9,enemy('bossBeanRain',0,4,4),player(),1,{units:[.125,.875,coin,.25,.75,.125,.875,coin,.75,.25,.5]});
for(const gate of [0,.39999999999999997,.4,.4000000000000001,.9999999999999999])for(const t of [1,0])run('wind-strict-gate',4,enemy('bossBeanRainWind',t),player(),1,{units:[gate,.125,.875]});
for(const puff of [0,.29999999999999993,.3,.30000000000000004,.9999999999999999])run('puff-strict-gate',4,enemy('bossBeanRain',1,0,4),player(),1,{units:[.5,.125,.875,.25,.75,puff]});
for(const dur of [0,.125,80,160,299.25,-.5])for(const phase of [0,4]){const e=enemy('bossBeanRainWind',0,phase);e._brDur=dur;run('duration-readback',8,e);}
for(const el of [0,1,4,8])for(const atk of [46,-3.75,4294967296+99]){const e=enemy('bossBeanRain',0,4,4);e.el=el;e.atk=atk;run('raw-projectile-fields',9,e,player(),1,{units:[.125,.875,.125,.25,.75,.875,.125,.875,.75,.25,0]});}
for(const shake of [0,100,125.5])for(const speed of [0,.3,4.75])for(const xy of [[10,20],[10,-100],[-25,20]]){const e=enemy('bossBeanRain',0,4,4);e.speed=speed;run('aim-sideways-shake',7,e,player(...xy),1,{shake,collision:shake!==100});}
const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),rng:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='rng').length,0),projectiles:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='command'&&e.value.command==='_spawnBossProjectile').length,0),collision_reads:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='command'&&e.value.command==='canMv').length,0)};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges:[[14333,14333],[41209,41233]],summary,cases}),'utf8');
