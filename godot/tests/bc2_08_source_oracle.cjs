// Exact original G37057 VM -> fresh caller-owned UTF-8 fixture; never reads Godot.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source and output required');
const raw=fs.readFileSync(sourcePath),hash=crypto.createHash('sha256').update(raw).digest('hex');assert.equal(hash,'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
const lines=raw.toString().split('\n');assert(lines[37056].includes('const sb=G._spiralBullets[si],windup=sb.windup||0'));
const src='\n'.repeat(37055)+'function tick(sp){\n'+lines[37056]+'\n}';
const clone=x=>JSON.parse(JSON.stringify(x));const ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
let events=[],cursor=0,nested=0,draws=0;const ctx={Math:Object.create(Math)};
ctx.Math.random=()=>{draws++;throw new Error('consumer must not draw RNG')};
ctx.spawnProj=(props)=>{events.push({kind:'command',value:{command:'spawnProj',source_line:ln(),args:[clone(props)],executed:false}});cursor+=nested};
vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'exoduser-game.html'});
const entry=(t=0,nextShot=60,arms=3)=>({x:10,y:20,t,windup:60,maxT:240,arms,dir:1,baseAng:.25,dmg:55,el:0,col:'#bbbbbb',src:{actor_ref:'boss'},interval:6,nextShot,keep:{value:71}});
const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('hex')};
function numericBits(x,path=[],rows=[]){if(typeof x==='number')rows.push({path,bits:bits(x)});else if(x&&typeof x==='object')for(const k of Object.keys(x))numericBits(x[k],path.concat(k),rows);return rows}
const cases=[];
function run(name,si,snapshot,sp=1,options={}){
 events=[];cursor=0;draws=0;nested=options.nested||0;const entries=clone(snapshot?.entries||{}),proxies={},ids=new Map();
 for(const [id,sb]of Object.entries(entries)){const p=new Proxy(sb,{set(t,k,v){t[k]=v;events.push({kind:'entry_write',id,field:k,value:clone(v),source_line:ln()});return true}});proxies[id]=p;ids.set(p,id)}
 const array=(snapshot?.ids||[]).map(id=>proxies[id]);const q=new Proxy(array,{set(t,k,v){t[k]=v;if(k==='length')events.push({kind:'queue_length_write',value:v,source_line:ln()});else events.push({kind:'queue_index_write',index:+k,id:ids.get(v),source_line:ln()});return true}});
 const global=snapshot===null?(options.absent?{}:{_spiralBullets:null}):{_spiralBullets:q};let globalWrites=0;
 ctx.G=new Proxy(global,{set(t,k,v){globalWrites++;t[k]=v;return true}});ctx.sp=sp;vm.runInContext('tick(sp)',ctx);assert.equal(draws,0);assert.equal(globalWrites,0);
 const queue=snapshot===null?null:{...clone(snapshot),ids:array.map(p=>ids.get(p)),entries:clone(entries)};
 cases.push({name,si,queue:snapshot,sp,input_bits:numericBits({queue:snapshot,sp}),nested,expected:{queue,events:clone(events),cursor,draws,global_writes:globalWrites}});
}
const q=sb=>({ids:['a'],entries:{a:sb}});
for(let si=4;si<10;si++)for(const t of [0,58.5,59,59.5,60,61,117,118,119,120,238,239,240])for(const nextShot of [60,6,1,0])for(const sp of [.5,1,2])run('physical-clock-matrix',si,q(entry(t,nextShot,3+Math.min(si%5,2))),sp,{nested:si%3});
for(const t of [59.99999999999999,60,60.00000000000001,239.99999999999997,240,240.00000000000003])for(const next of [-1,0,1,6,60])run('zero-sp-strict-boundaries',9,q(entry(t,next,5)),0,{nested:2});
for(const windup of [undefined,null,0,60])for(const arms of [-1,0,.25,1,3,3.5,5])for(const sp of [0,1,7,60,120,300,-1]){const e=entry(0,0,arms);if(windup===undefined)delete e.windup;else e.windup=windup;run('windup-fallback-arms-single-check',9,q(e),sp,{nested:1});}
for(const dir of [-1,0,1])for(const angle of [-Math.PI,0,Math.PI/2,Math.PI*4])for(const dmg of [-3.25,55,4294967296+99]){const e=entry(119,1,5);e.dir=dir;e.baseAng=angle;e.dmg=dmg;e.el=4;e.col='#abcdef';run('raw-props-rotation',9,q(e),1,{nested:3});}
run('absent-no-allocation',9,null,1,{absent:true});run('null-no-allocation',9,null);run('empty-no-length-write',9,{ids:[],entries:{kept:entry()}},1);
for(const order of [['a','b','c'],['c','a','b'],['a','b','a','c','b']])for(const sp of [0,1,6,60,300]){const a=entry(239,0,3),b=entry(119,1,5),c=entry(59,60,4);run('stable-compaction-and-alias',9,{ids:order,entries:{a,b,c}},sp,{nested:2});}
const initializers=[];
vm.runInContext(lines[14332]+"\n"+lines[14337],ctx);
vm.runInContext('function init(e){switch("spiralBullet"){'+lines.slice(37831,37845).join('\n')+'}}',ctx,{filename:'initializer-game.html'});
ctx._T=s=>s;ctx.addTxt=()=>{};ctx.SFX={magic:()=>{}};
for(const phase of [0,1,2,3,4])for(const unit of [0,.5,.5000000000000001,.9999999999999999]){
 const enemy={x:10,y:20,atk:46,el:0,col:'#abcdef',_bossPhase:phase,ib:true};const context={player_x:100,player_y:200};let initDraws=0;
 ctx.Math.random=()=>{initDraws++;return unit};ctx.G={};ctx.P={x:100,y:200};ctx.e=clone(enemy);vm.runInContext('init(e)',ctx);
 assert.equal(initDraws,1);const payload=clone(ctx.G._spiralBullets[0]);payload.src={actor_ref:'boss'};initializers.push({si:9,phase,enemy,context,unit_bits:bits(unit),queue_entry:payload});
}
ctx.Math.random=()=>{draws++;throw new Error('consumer must not draw RNG')};
const timelines=[];
for(const sp of [.5,1,2,60])for(const arms of [3,5]){
 let snapshot=q(entry(0,60,arms)),ticks=0,firstFire=null,requests=0;
 while(snapshot.ids.length&&ticks<500){run('physical-contiguous-timeline',9,snapshot,sp,{nested:2});const row=cases[cases.length-1];const n=row.expected.events.filter(e=>e.kind==='command').length;ticks++;if(n&&firstFire===null)firstFire=row.expected.queue.entries.a.t;requests+=n;snapshot=clone(row.expected.queue)}
 assert(!snapshot.ids.length);timelines.push({sp,arms,ticks,first_fire_time:firstFire,requests});
}
let drawCommands=[],labelReads=0,locale='ko';
ctx._drawShootCharge=(...args)=>drawCommands.push({command:'_drawShootCharge',source_line:ln(),args:clone(args),executed:false});
ctx._drawProjectileChargeLabel=(...args)=>drawCommands.push({command:'_drawProjectileChargeLabel',source_line:ln(),args:clone(args),executed:false});
ctx._L=(ko,en)=>{labelReads++;return locale==='en'?en:ko};
vm.runInContext('\n'.repeat(20105)+'function draw(){\n'+lines[20106]+'\n}',ctx,{filename:'exoduser-game.html'});
function draw(snapshot,language='ko'){
 locale=language;drawCommands=[];labelReads=0;ctx.G={_spiralBullets:snapshot===null?null:snapshot.ids.map(id=>snapshot.entries[id])};const before=clone(ctx.G);const priorDraws=draws;
 vm.runInContext('draw()',ctx);assert.deepEqual(clone(ctx.G),before);assert.equal(draws,priorDraws);
 return {commands:clone(drawCommands),label:drawCommands.length?drawCommands[1].args[3]:'unused',label_reads:labelReads};
}
for(const row of cases){row.draw_before=draw(row.queue);row.draw_after=draw(row.expected.queue)}
const draw_cases=[];
for(const time of [0,59.99999999999999,60,60.00000000000001])for(const radius of [undefined,null,0,12,44,-3])for(const element of [0,4]){
 const e=entry(time);e.el=element;e.src=radius===undefined?null:{r:radius};const snapshot=q(e);draw_cases.push({queue:snapshot,input_bits:numericBits({queue:snapshot}),expected:draw(snapshot,'en')});
}
const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),requests:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='command').length,0),no_request_cases:cases.filter(c=>!c.expected.events.some(e=>e.kind==='command')).length,no_event_cases:cases.filter(c=>!c.expected.events.length).length,direct_rng_draws:0,global_queue_writes:0};
fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,ranges:[[37057,37057]],summary,initializers,timelines,draw_cases,cases}),'utf8');
