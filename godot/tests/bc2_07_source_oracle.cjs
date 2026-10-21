const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
// Exact original shieldBash2 switch -> caller-owned UTF-8 fixture, no Godot reads.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and output required');
const raw=SNAPSHOT.readBytes(),hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,SNAPSHOT.sha256);
const lines=raw.toString().split('\n');assert(lines[41336].includes("case'bossSBashWind'"));assert(lines[41349].includes("e.st2=25"));
const src='\n'.repeat(41335)+'function tick(e,sp){switch(e.s){\n'+lines.slice(41336,41351).join('\n')+'\n}}';
const clone=x=>JSON.parse(JSON.stringify(x));const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
let events=[],cursor=0,nested=0,protectedRegion=false,contact=null,responses=[],opts={},ep=null,et=null,pt=null;
function command(name,args,line=ln()){events.push({kind:'command',value:{command:name,source_line:line,args:clone(args),executed:false}})}
function trace(name,args,value){contact.trace.push({command:name,args:clone(args),...(value===undefined?{}:{value:clone(value)})});return value}
function flush(){protectedRegion=false;Object.assign(contact,{enemy_after:clone(et),player_after:clone(pt),cursor_after:cursor});responses.push(contact)}
function mutateOwner(){if(opts.mutate){Object.assign(et,{x:17,y:-11,facing:1.2,_sbAng:-.25,atk:99,st2:81,s:'ownerChanged'});Object.assign(pt,{x:31,y:-4,iframes:73});pt.kb.x=-3;pt.kb.y=8;}}
const ctx={Math};
ctx.canMv=(...a)=>{command('canMv',a);return opts.collision??true};ctx.SFX={block:(...a)=>{command('SFX.block',a);cursor+=nested}};
ctx.isPWin=()=>{command('resolve_shield_bash_contact',[],ln());protectedRegion=true;contact={enemy_before:clone(et),player_before:clone(pt),trace:[],parry:!!opts.parry};return !!opts.parry};
ctx.wp=()=>{const value={atk:opts.weaponAtk??7.25,enh:opts.enh??2};trace('wp',[],value);return value};
ctx.enhMulAtk=x=>trace('enhMulAtk',[x],opts.enhAtk??4.5);ctx.pParryDmg=()=>trace('pParryDmg',[],opts.parryMul??1.25);
ctx.elMul=(...args)=>trace('elMul',args,opts.elementMul??.75);ctx.ar=()=>({el:3});ctx._eqAffix=(...args)=>trace('_eqAffix',args,opts.stunRes??0);
ctx.hurtP=(...args)=>{trace('hurtP',args);cursor+=nested;mutateOwner();pt.iframes=60;contact.hurtP_after={enemy:clone(et),player:clone(pt)}};
ctx.hurtE=(e,...args)=>{assert.equal(e,ep);contact.stunned_at_hurtE=et.stunned;trace('hurtE',args);cursor+=nested;mutateOwner()};
ctx.doParry=(...args)=>{contact.bank_at_doParry=pt.parryBank;contact.doParry_enemy=clone(et);trace('doParry',args);cursor+=nested};ctx._poiseHit=(e,...args)=>{assert.equal(e,ep);trace('_poiseHit',args);cursor+=nested};
vm.createContext(ctx);assert(lines[31722].startsWith('function dst('));vm.runInContext(lines[31722],ctx);vm.runInContext(src,ctx,{filename:'exoduser-game.html'});
const enemy=(s='bossSBash',st2=0,angle=0)=>({s,st2,x:0,y:0,r:44,facing:1.75,atk:46,el:0,_sbAng:angle,ib:true,keep:{other:71}});
const player=(x=50,y=0)=>({x,y,r:12,iframes:0,s:'idle',baseAtk:11.5,parryBank:5,kb:{x:2,y:3},keep:29});
const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('hex')};
function numericBits(x,path=[],rows=[]){if(typeof x==='number')rows.push({path,bits:bits(x)});else if(x&&typeof x==='object')for(const k of Object.keys(x))numericBits(x[k],path.concat(k),rows);return rows}
const cases=[];
function run(name,si,e,p=player(),sp=1,settings={}){
 opts=settings;events=[];cursor=0;nested=settings.nested||0;protectedRegion=false;contact=null;responses=[];et=clone(e);pt=clone(p);
 ep=new Proxy(et,{set(t,k,v){if(protectedRegion&&k==='s'&&v==='recover')flush();t[k]=v;if(!protectedRegion)events.push({kind:'write',field:k,value:clone(v),source_line:ln()});return true}});ctx.P=pt;ctx.e=ep;ctx.sp=sp;
 vm.runInContext('tick(e,sp)',ctx);assert(!protectedRegion,'contact did not finish');
 cases.push({name,si,enemy:e,player:p,sp,input_bits:numericBits({enemy:e,player:p,sp}),nested,owner:settings,responses:clone(responses),expected:{enemy:clone(et),player:clone(pt),events:clone(events),cursor}});
}
for(let si=4;si<10;si++)for(const state of ['bossSBashWind','bossSBash'])for(const t of [1,.125,0,-.5])for(const sp of [.5,1,2])for(const collision of [true,false])for(const mode of ['normal','parry','charge','iframe']){
 const e=enemy(state,t,[0,Math.PI/2,-Math.PI,1.3][si%4]),p=player();if(mode==='charge')p.s='charge';if(mode==='iframe')p.iframes=1;
 run('stage-state-clock-collision',si,e,p,sp,{collision,parry:mode==='parry',nested:si%3});
}
for(const distance of [0,75.99999999999999,76,76.00000000000001,77,200])for(const t of [1,0,-1])for(const iframes of [-1,0,.001])run('strict-contact-distance',8,enemy('bossSBash',t),Object.assign(player(distance),{iframes}),1,{collision:false});
for(const angle of [0,Math.PI/2,-Math.PI/2,Math.PI,-Math.PI,.75,Math.PI*4])for(const sp of [0,.5,1,2,-.5])for(const collision of [false,true])run('locked-dash-angle',9,enemy('bossSBash',0,angle),player(-50,70),sp,{collision});
for(const parry of [true,false])for(const state of ['idle','charge'])for(const atk of [46,-3.75,4294967296+99])for(const elementMul of [0,.125,.75,1.5])for(const mutate of [false,true]){
 const e=enemy();e.atk=atk;e.el=4;run('protected-owner-readback',8,e,Object.assign(player(),{s:state}),1,{parry,elementMul,mutate,nested:2,weaponAtk:0,enh:0,enhAtk:3.75,parryMul:.875});
}
for(const stunRes of [-1,-.25,0,.1,.49999999999999994,.5,.5000000000000001,1,2,-1000000000])for(const stunned of [undefined,null,0,10,23,45,100,-7]){
 const p=player();if(stunned!==undefined)p.stunned=stunned;run('stun-res-cap-truncation-max',8,enemy(),p,1,{stunRes,elementMul:.6,mutate:stunned===10});
}
for(const radius of [0,12,40])for(const bossR of [0,44,60])for(const delta of [-1e-12,0,1e-12]){const e=enemy();e.r=bossR;const p=player(radius+bossR+20+delta);p.r=radius;run('radius-sum-margin20',7,e,p,1,{collision:false});}
for(const parryBank of [undefined,null,0,-5,100])for(const baseAtk of [-3.25,11.5,4294967296+91]){const p=player();if(parryBank===undefined)delete p.parryBank;else p.parryBank=parryBank;p.baseAtk=baseAtk;run('parry-bank-fallback',9,enemy(),p,1,{parry:true});}
const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),contacts:cases.reduce((n,c)=>n+c.responses.length,0),parries:cases.reduce((n,c)=>n+c.responses.filter(r=>r.parry).length,0),charge_contacts:cases.reduce((n,c)=>n+c.responses.filter(r=>!r.parry&&r.player_before.s==='charge').length,0),collisions:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='command'&&e.value.command==='canMv').length,0),stun_reads:cases.reduce((n,c)=>n+c.responses.reduce((m,r)=>m+r.trace.filter(t=>t.command==='_eqAffix').length,0),0)};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges:[[31723,31723],[41337,41351]],summary,cases}),'utf8');
