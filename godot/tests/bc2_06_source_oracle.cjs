const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
// Executes exact original switch bytes. Writes only the caller-owned UTF-8 fixture.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and output required');
const raw=SNAPSHOT.readBytes(),hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,SNAPSHOT.sha256);
const lines=raw.toString().split('\n');assert(lines[40570].includes("case'bossFanWaveAim'"));assert(lines[40603].includes("e.s='bossRec';e.st2=40"));
const src='\n'.repeat(40569)+'function tick(e){switch(e.s){\n'+lines.slice(40570,40605).join('\n')+'\n}}';
const clone=x=>JSON.parse(JSON.stringify(x));const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
let events=[],cursor=0,units=[],nested=0,ordinal={},protectedRegion=false,contact=null,responses=[],opts={},ep=null,et=null,pt=null,queryResult=[],entities={};
function command(name,args,line=ln()){events.push({kind:'command',value:{command:name,source_line:line,args:clone(args),executed:false}})}
function trace(name,args,value){contact.trace.push({command:name,args:clone(args),...(value===undefined?{}:{value})});return value}
function mutateOwner(){if(opts.mutate){Object.assign(et,{x:17,y:-11,facing:1.2,_fwAng:-.25,_fwR:25,atk:99,st2:81,s:'ownerChanged'});Object.assign(pt,{x:31,y:-4,iframes:73});pt.kb.x=-3;pt.kb.y=8;}}
const ctx={Math:Object.create(Math)};
ctx.Math.random=()=>{const line=ln(),n=ordinal[line]||0;ordinal[line]=n+1;
 const field=line===40573?['fan_wave_wind_gate','fan_wave_wind_vx','fan_wave_wind_vy'][n]:line===40602?'fan_wave_speed':line===40603?['fan_wave_size','fan_wave_life'][n%2]:null;assert(field,'unknown RNG '+line);
 const unit=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:line,unit}});return unit};
ctx.poolPart=(...args)=>{command('poolPart',args);cursor+=nested};ctx.SFX={detonate:(...a)=>{command('SFX.detonate',a);cursor+=nested}};ctx.shake=(...a)=>{command('shake',a);cursor+=nested};
ctx.isPWin=()=>{command('resolve_fan_wave_contact',[],ln());protectedRegion=true;contact={enemy_before:clone(et),player_before:clone(pt),trace:[],parry:!!opts.parry};return !!opts.parry};
ctx.wp=()=>{const value={atk:opts.weaponAtk??7.25,enh:opts.enh??2};trace('wp',[],value);return value};
ctx.enhMulAtk=x=>trace('enhMulAtk',[x],opts.enhAtk??4.5);ctx.pParryDmg=()=>trace('pParryDmg',[],opts.parryMul??1.25);
ctx.elMul=(...args)=>trace('elMul',args,opts.elementMul??.75);ctx.ar=()=>({el:3});
ctx.hurtP=(...args)=>{trace('hurtP',args);cursor+=nested;mutateOwner();pt.iframes=60;contact.hurtP_after={enemy:clone(et),player:clone(pt)}};
ctx.hurtE=(e,...args)=>{assert.equal(e,ep);contact.stunned_at_hurtE=et.stunned;trace('hurtE',args);cursor+=nested;mutateOwner()};
ctx.doParry=(...args)=>{contact.bank_at_doParry=pt.parryBank;trace('doParry',args);cursor+=nested};ctx._poiseHit=(e,...args)=>{assert.equal(e,ep);trace('_poiseHit',args);cursor+=nested};
ctx.shQuery=(...args)=>{if(protectedRegion){protectedRegion=false;Object.assign(contact,{enemy_after:clone(et),player_after:clone(pt),cursor_after:cursor});responses.push(contact)}command('shQuery',args);return queryResult};
vm.createContext(ctx);assert(lines[31722].startsWith('function dst('));vm.runInContext(lines[31722],ctx);vm.runInContext(src,ctx,{filename:'exoduser-game.html'});
const enemy=(st2=0,angle=0)=>({s:'bossFanWaveAim',st2,x:0,y:0,r:44,facing:1.75,atk:46,el:0,_fwAng:angle,_fwR:500,ib:true,keep:{other:71}});
const player=(x=100,y=0)=>({x,y,r:12,iframes:0,s:'idle',baseAtk:11.5,parryBank:5,kb:{x:2,y:3},keep:29});
const q=(x,y,alive=true,ib=false)=>({x,y,alive,ib,kb:{x:2,y:-3},keep:71});
function query(){return {ids:['front','dead','boss','outside','edge','back','front'],entities:{front:q(100,0),dead:q(70,0,false),boss:q(80,0,true,true),outside:q(500,0),edge:q(100,100),back:q(-50,0)}}}
const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('hex')};
function numericBits(x,path=[],rows=[]){if(typeof x==='number')rows.push({path,bits:bits(x)});else if(x&&typeof x==='object')for(const k of Object.keys(x))numericBits(x[k],path.concat(k),rows);return rows}
const cases=[];
function run(name,si,e,p=player(),settings={}){
 opts=settings;events=[];cursor=0;units=settings.units||[.875,.125,.5,0,.25,.75,.125];nested=settings.nested||0;ordinal={};protectedRegion=false;contact=null;responses=[];
 const input={enemy:e,player:p,query:settings.query||query()};et=clone(e);pt=clone(p);
 ep=new Proxy(et,{set(t,k,v){t[k]=v;if(!protectedRegion)events.push({kind:'write',field:k,value:clone(v),source_line:ln()});return true}});ctx.P=pt;ctx.e=ep;
 entities=clone(input.query.entities);
 const proxies={};for(const [id,fe]of Object.entries(entities)){const kb=fe.kb;fe.kb=new Proxy(kb,{set(t,k,v){t[k]=v;events.push({kind:'query_write',id,field:'kb.'+k,value:v,source_line:ln()});return true}});proxies[id]=fe}
 queryResult=input.query.ids.map(id=>proxies[id]);vm.runInContext('tick(e)',ctx);
 assert(!protectedRegion,'boundary did not finish');
 cases.push({name,si,...input,input_bits:numericBits(input),unit_bits:units.map(bits),nested,owner:settings,sp:settings.sp??1,responses:clone(responses),expected:{enemy:clone(et),player:clone(pt),query_entities:responses.length||e.st2<=0?clone(entities):{},events:clone(events),cursor}});
}
for(let si=4;si<10;si++)for(const t of [1,.125,0,-.5])for(const angle of [0,Math.PI,-Math.PI,.7])for(const kind of ['normal','parry','iframe','charge','outside']){
 const e=enemy(t,angle),p=player(Math.cos(angle)*100,Math.sin(angle)*100);if(kind==='iframe')p.iframes=1;if(kind==='charge')p.s='charge';if(kind==='outside')p.x+=1000;
 run('stage-state-gates',si,e,p,{parry:kind==='parry',nested:si%3,sp:si%2?2:.5});
}
for(const radius of [undefined,null,0,-1,.25,50,500,700])for(const dist of [0,49.99999999999999,50,50.00000000000001,499.99999999999994,500,500.00000000000006]){const e=enemy();if(radius===undefined)delete e._fwR;else e._fwR=radius;run('strict-radius-and-fallback',6,e,player(dist,0));}
for(const lock of [0,Math.PI,-Math.PI,2*Math.PI,-4*Math.PI,Math.PI*32])for(const angle of [-Math.PI/4-1e-15,-Math.PI/4,-Math.PI/4+1e-15,Math.PI/4-1e-15,Math.PI/4,Math.PI/4+1e-15,0]){
 const e=enemy(0,lock),p=player(Math.cos(lock+angle)*100,Math.sin(lock+angle)*100);run('strict-sector-wrap',9,e,p,{query:{ids:['a','a'],entities:{a:q(p.x,p.y)}},parry:angle===0});
}
for(const gate of [0,.6999999999999998,.7,.7000000000000001,.9999999999999999])for(const t of [1,0])run('strict-wind-gate',6,enemy(t),player(),{units:[gate,.125,.875],nested:1});
for(const parry of [false,true])for(const atk of [46,-3.75,4294967296+99])for(const elementMul of [0,.125,.75,1.5])for(const mutate of [false,true]){const e=enemy();e.atk=atk;e.el=4;run('protected-owner-readback',8,e,player(),{parry,elementMul,mutate,nested:2,weaponAtk:0,enh:0,enhAtk:3.75,parryMul:.875});}
for(const iframes of [-1,0,.001])for(const s of ['idle','charge','parry']){const p=player();p.iframes=iframes;p.s=s;run('player-gates',7,enemy(),p)}
run('empty-query',6,enemy(),player(),{query:{ids:[],entities:{}}});
run('long-ordered-alias-query',9,enemy(),player(),{query:{ids:Array.from({length:25},(_,i)=>i%2?'a':'b'),entities:{a:q(100,0),b:q(200,20)}}});
const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),rng:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='rng').length,0),contacts:cases.reduce((n,c)=>n+c.responses.length,0),parries:cases.reduce((n,c)=>n+c.responses.filter(r=>r.parry).length,0),query_writes:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='query_write').length,0),particles:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='command'&&e.value.command==='poolPart').length,0)};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges:[[31723,31723],[40571,40605]],summary,cases}),'utf8');
