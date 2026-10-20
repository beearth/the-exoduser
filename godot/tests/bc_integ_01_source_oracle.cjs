// Independent VM of untouched game.html statements; no product-module imports.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath);
const raw=fs.readFileSync(sourcePath),lines=raw.toString().split('\n');
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
const state='\n'.repeat(40662)+'function stateTick(e,sp){switch(e.s){\n'+lines.slice(40663,40977).map((s,i)=>i+40664<=40708||i+40664>=40942?s:'').join('\n')+'\n}}';
const idle='\n'.repeat(38314)+lines.slice(38314,38356).join('\n')+'\n}';
const switchStart=lines.findIndex((s,i)=>i>40440&&s.includes("switch(e.s){case'idle'"));assert.equal(switchStart,40455);
const generic='\n'.repeat(switchStart-1)+'function idleTick(e,d,sp){\n'+lines.slice(switchStart,40518).join('\n')+'\n}}';

let events=[],cursor=0,units=[],responses=[],trace=[],active=null,target,player,mode,kind,checkpoint,collisionIndex=0,ctx;
const ranges={charge:[40681,40685],dash:[40959,40964],jump:[40706,40707],idle:[40501,40501]};
const clone=x=>JSON.parse(JSON.stringify(x,(_,v)=>{assert(typeof v!=='number'||Number.isFinite(v));return v}));
const line=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
function inside(n){return Object.values(ranges).some(([a,b])=>n>=a&&n<=b)}
function flush(n){if(active&&!inside(n)){responses.push({enemy_after:clone(target),player_after:clone(player),cursor_after:cursor,trace:clone(trace)});trace=[];active=null}}
function contact(f,ln){events.push({kind:'command',value:{command:'resolve_boss_movement_contact',source_line:ln,args:[descriptor(f,target)],executed:false}});active=f;}
function descriptor(f,e){return {family:f,source_lines:ranges[f],atk:e.atk,element:e.el,hurtP_multiplier:{charge:2,jump:1.8,dash:1.3,idle:.8}[f],elemental_provider:f==='idle'?'none':'elMul(e.el,ar().el)',rounding:f==='idle'?'ToInt32_after_atk_multiplier':'ToInt32_after_elemental',knockback:{charge:12,jump:15,dash:8,idle:0}[f],protected_parry_source:f==='charge'?[40681,40684]:f==='dash'?[40959,40960]:[],requires:['actual_hurtP_owner','actual_QE_and_boss_hurtE_owner_if_source_calls','complete_actor_player_readback'],combat_verified:false}}
function command(name,args,ln=line()){flush(ln);if(active)trace.push({command:name,args:clone(args)});else events.push({kind:'command',value:{command:name,source_line:ln,args:clone(args),executed:false}})}
ctx={Math:Object.create(Math),SFX:{},dst:(a,b,c,d)=>Math.sqrt((c-a)**2+(d-b)**2),_isDruidFinale:()=>false,_isNormalDruidBoss:e=>e.ib&&(ctx.G.stage===0||ctx.G.stage===3),EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},ELC:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ff88cc','#88aa44'],ETYPE_RANGE:[700]};
ctx.Math.random=()=>{const ln=line();flush(ln);let field;
 if(ln===38334)field='orbit_reverse';else if(ln===40502)field='idle_contact_cooldown';else if(ln===40687){field=['charge_particle_gate','charge_particle_x','charge_particle_y','charge_particle_size'][mode.chargeDraws++%4]}
 else if(ln===40944){field=['dash_wind_gate','dash_wind_vx','dash_wind_vy','dash_wind_color'][mode.windDraws++]}else if(ln===40970)field='dash_repeat_angle';else if(ln===40972)field='dash_repeat_timer';else throw Error('unexpected RNG '+ln);
 const u=units[cursor++%units.length];events.push({kind:'rng',value:{field,source_line:ln,unit:u}});return u};
ctx.canMv=(...args)=>{command('canMv',args);return mode.collision[collisionIndex++%mode.collision.length]};ctx._ffDir=(...args)=>{command('_ffDir',args);return mode.flow};ctx._T=(text)=>{command('_T',[text]);return 'translated:'+text};
for(const name of ['poolPart','playVFXAng','addTxt','addParts','deathFX'])ctx[name]=(...args)=>{if(name==='addParts'&&active==='idle')flush(-1);command(name,args);cursor+=mode.nested};
for(const name of ['charge','slam','groggy'])ctx.SFX[name]=(...args)=>{command('SFX.'+name,args);cursor+=mode.nested};
ctx.isPWin=()=>{const f=kind==='bossCharge'?'charge':'dash';contact(f,line());return mode.parry};ctx.wp=()=>({atk:7,enh:2});ctx.enhMulAtk=x=>x*2;ctx.pParryDmg=()=>1.5;ctx.ar=()=>({el:2});ctx.elMul=()=>1.25;
ctx.hurtP=(...args)=>{if(!active){const ln=line();contact(ln===40501?'idle':'jump',ln)}trace.push({command:'hurtP',args});cursor+=mode.nested;if(mode.iframeWrite)player.iframes=60;if(mode.mutate){target.st2=0;target.x+=3;player.x+=1}};
ctx.hurtE=(_e,...args)=>{trace.push({command:'hurtE',args});cursor+=mode.nested;if(mode.mutate){target.st2=0;target.x+=3;player.x+=1}};ctx.doParry=(...args)=>{trace.push({command:'doParry',args});cursor+=mode.nested};ctx._poiseHit=(_e,...args)=>{trace.push({command:'_poiseHit',args});cursor+=mode.nested};
vm.createContext(ctx);vm.runInContext(lines[16937],ctx);for(const code of [state,idle,generic])vm.runInContext(code,ctx,{filename:'exoduser-game.html'});
ctx.BOSS_PHASES=vm.runInNewContext(lines.slice(9950,9957).join('\n')+';BOSS_PHASES');
for(const[f,[a,b]]of Object.entries(ranges)){const s=lines.slice(a-1,b).join('\n');assert(s.includes('e.atk*'+descriptor(f,{atk:46,el:0}).hurtP_multiplier));if(['charge','dash'].includes(f))assert(s.includes(')*'+(f==='charge'?5:4)+'*pParryDmg()'))}
function enemy(s,phase=0){return {s,ib:true,alive:true,etype:0,x:0,y:0,r:44,col:'#abcdef',facing:.37,st2:0,atk:46,el:0,stunned:0,_bossPhase:phase,speed:.5,_aSpdM:1,_bossOrbitAng:.1,_bossStrafeCd:0,_strafeDir:1,_sepCd:2,echDx:Math.cos(.37),echDy:Math.sin(.37),jumpOx:0,jumpOy:0,jumpX:250,jumpY:80,_dashIdx:0,_dashCnt:4+Math.trunc(phase*1.5),projCd:50,projT:0,_projChargeT:0,kb:{x:0,y:0},keep:{unowned:91}}}
function playerAt(d=100,a=.37){return {x:Math.cos(a)*d,y:Math.sin(a)*d,r:12,iframes:0,s:'idle',baseAtk:11,parryBank:0,skills:{detonate:false},kb:{x:2,y:3},keep:92}}
const cases=[];
function run(name,si,e,p,sp=1,cp='state',c={},cfg={}){
 events=[];responses=[];trace=[];active=null;cursor=0;collisionIndex=0;units=cfg.units||[.875,.125,.5,0];kind=e.s;checkpoint=cp;
 mode={collision:cfg.collision||[true],flow:cfg.flow??null,nested:cfg.nested||0,parry:cfg.parry||false,iframeWrite:cfg.iframeWrite??true,mutate:cfg.mutate||false,windDraws:0,chargeDraws:0};
 target=structuredClone(e);player=structuredClone(p);ctx.P=player;const globals={shake:71,_flashT:99,_flashCol:'keep'};const context={distance:200,frame:6,vfx_available:true,shake:125,etype_range:400,element_color:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ff88cc','#88aa44'][e.el],...c};
 ctx.ETYPE_RANGE=[context.etype_range];ctx.ELC[e.el]=context.element_color;ctx.G=new Proxy({stage:si,frame:context.frame,...globals},{set(t,k,v){const ln=line();flush(ln);t[k]=v;if(!active)events.push({kind:'global_write',field:k,value:v,source_line:ln});return true}});ctx.OPT={shake:context.shake};
 ctx.playVFXAng=context.vfx_available?((...args)=>{command('playVFXAng',args);cursor+=mode.nested}):undefined;
 ctx.e=new Proxy(target,{set(t,k,v){const ln=line();if(Number.isFinite(ln))flush(ln);t[k]=v;if(!active)events.push({kind:'write',field:k,value:clone(v),source_line:ln});return true}});ctx.sp=sp;ctx.d=context.distance;
 vm.runInContext(cp==='state'?'stateTick(e,sp)':cp==='idle_move'?'_bossIdleMove(e,d,sp)':'idleTick(e,d,sp)',ctx);flush(-1);
 cases.push({name,si,checkpoint:cp,enemy:e,player:p,sp,context,units,collision:mode.collision,flow:mode.flow,nested:mode.nested,responses,expected:{enemy:clone(target),player:clone(player),events:clone(events),cursor,globals:{shake:ctx.G.shake,_flashT:ctx.G._flashT,_flashCol:ctx.G._flashCol}}});return clone(target);
}
const times={bossChargeWind:[18.00001,18,17.99999,0,-.5],bossCharge:[50,1,.5,0,-.5],bossJumpWind:[1,.5,0,-.5],bossJump:[40,20.00001,20,19.99999,.5,0,-.5],bossMultiDashWind:[1,0,-.5],bossMultiDash:[12,1,0,-.5]};
for(let si=0;si<14;si++)for(const[s,ts]of Object.entries(times))for(let i=0;i<ts.length;i++)for(const branch of ['outside','near','parry','charge','iframe']){
 const e=enemy(s,(si+i)%5);e.st2=ts[i];const p=playerAt(branch==='outside'?1500:65);if(branch==='charge')p.s='charge';if(branch==='iframe')p.iframes=1;if(branch==='parry'&&i%2)p.skills.detonate=true;
 run('matrix-'+branch,si,e,p,[.5,1,2][i%3],'state',{frame:i%2?6:7,vfx_available:s==='bossCharge'?true:i%3!==0},{parry:branch==='parry',collision:[[true],[false,true],[false,false,true],[false,false,false]][i%4],nested:i%3===0?2:0});
}
for(let si=0;si<14;si++)for(const d of [0,50,50.00001,200,200.00001,1000])for(const sp of [.5,1,2])for(const col of [[true],[false,true],[false,false,true],[false,false,false]]){
 const e=enemy('idle',si%5);e._bossStrafeCd=si%2?0:.1;e._strafeDir=si%2?-1:0;
 run('idle-move-collision',si,e,playerAt(d),sp,'idle_move',{distance:d},{collision:col,flow:si%2?{x:.25,y:-.75}:null,units:si%2?[.004999,.125]:[.005,.875]});
}
for(const phase of [0,4])for(const cd of [0,.5,1])for(const u of [0,.004999,.005,.875]){const e=enemy('idle',phase);e._bossStrafeCd=cd;run('orbit-rng-gate',0,e,playerAt(),1,'idle_move',{distance:100},{units:[u]})}
for(const el of [0,1,2,3,4,5,6])for(const d of [63.9999,64,64.0001,399.999,400,400.001,699.999,700,700.001])for(const t of [1,0,-1]){
 const e=enemy('idle',el%5);e.el=el;e.st2=t;e.projT=t;
 run('idle-switch-contact-charge',0,e,playerAt(1000),.5,'idle_switch',{distance:d},{nested:2,collision:[true],units:[.999999]});
}
for(const projCd of [50,9000,9999])for(const charge of [0,.1,60])for(const iframe of [0,1])for(const ps of ['idle','charge']){const e=enemy('idle');e.projCd=projCd;e._projChargeT=charge;const p=playerAt(60);p.iframes=iframe;p.s=ps;run('idle-branches',3,e,p,2,'idle_switch',{distance:60,etype_range:0,element_color:''},{collision:[false],units:[0]})}
for(const s of ['bossCharge','bossMultiDash','bossJump'])for(const sp of [.3,1/3,1.25]){const e=enemy(s,4);e.st2=s==='bossJump'?19.7:0;run('fractional-order',0,e,playerAt(1500),sp,'state',{}, {collision:[false,false,true],units:[.3,.6,.875]})}
for(const s of ['bossCharge','bossMultiDash','bossJump'])for(const parry of [false,true]){const e=enemy(s,4);e.st2=s==='bossJump'?0:1;run('contact-readback-mutation',0,e,playerAt(60),1,'state',{}, {parry,mutate:true,nested:2})}
for(const s of ['bossCharge','bossMultiDash','bossJump'])for(const delta of [-.000001,0,.000001]){const e=enemy(s);e.st2=s==='bossJump'?0:5;e.echDx=0;e.echDy=0;run('strict-contact-distance',1,e,playerAt((s==='bossCharge'?136:s==='bossJump'?300:66)+delta,0),1,'state',{}, {collision:[false,false,false],units:[.3]})}
for(const s of ['bossCharge','bossMultiDash'])for(const u of [0,.3,.6,.6000001,.875]){const e=enemy(s);e.st2=5;run('active-rng-boundary',0,e,playerAt(1500),1,'state',{}, {units:[u]})}
for(let si=0;si<14;si++)for(const u of [.6,.6000001]){const e=enemy('bossMultiDashWind');e.st2=0;run('wind-rng-boundary',si,e,playerAt(),1,'state',{}, {units:[u,.125,.875,.499999]})}
for(const phase of [0,4]){let e=enemy('bossMultiDash',phase);for(let i=0;i<4+Math.trunc(phase*1.5);i++){e.st2=0;e=run('dash-chain',0,e,playerAt(1500),1,'state',{}, {units:[.875,.999999]})}}
for(const sp of [.5,1,2]){let e=enemy('bossCharge');e.st2=50;for(let n=0;n<Math.ceil(50/sp);n++){e.st2-=sp;e=run('charge-50-native-clock',0,e,playerAt(10000),sp,'state',{frame:7},{units:[.3]})}assert.equal(e.s,'recover')}
for(const sp of [.5,1,2]){let e=enemy('bossJump');e.st2=40;for(let n=0;n<Math.ceil(40/sp);n++){e.st2-=sp;e=run('jump-once-native-clock',2,e,playerAt(1500),sp,'state',{frame:7});}assert.equal(e.s,'bossShock')}
for(const sp of [.5,1,2]){let e=enemy('idle',4);e=run('idle-overlap-first',0,e,playerAt(500),sp,'idle_move',{distance:500},{flow:{x:1,y:0}});run('idle-overlap-generic-after-owner',0,e,playerAt(500),sp,'idle_switch',{distance:500});}
for(const stun of [.5,1,90]){const e=enemy('idle');e.stunned=stun;run('idle-stun-return',0,e,playerAt(),1,'idle_move',{distance:300});}
const total={cases:cases.length,events:cases.reduce((s,c)=>s+c.expected.events.length,0),contacts:cases.reduce((s,c)=>s+c.responses.length,0),rng:cases.reduce((s,c)=>s+c.expected.events.filter(e=>e.kind==='rng').length,0)};

assert(lines[16937].includes('e.ib&&(G.stage===0||G.stage===3)'));

// Preserve pre-JSON discrete masks and every numeric bit, including values
// Godot JSON would round to a nearby integer. Assertions never use those rounds.
const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('hex')};
function transport(v){if(typeof v==='number')return {__f64:bits(v)};if(Array.isArray(v))return v.map(transport);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,transport(x)]));return v}
for(const row of cases){row.integer_paths={};function mask(v,p=''){if(typeof v==='number'&&Number.isInteger(v))row.integer_paths[p]=true;else if(v&&typeof v==='object')for(const[k,x]of Object.entries(v))mask(x,p+'/'+k)}mask(row.expected)}
const spawnCode=[lines[14332],lines[14335],lines[14337],lines.slice(16632,16643).join('\n'),lines.slice(16657,16666).join('\n'),lines.slice(16678,16712).join('\n'),lines[9271],lines[9275],lines.slice(9819,9880).join('\n'),lines.slice(31032,31037).join('\n'),lines.slice(31118,31363).join('\n')].join('\n');
const spawns=[];for(let si=0;si<35;si++){
 const context={G:{stage:si,_stageDiffOff:0},P:{lv:100},OPT:{diff:5},window:{},_useGPU:false,_useGL:false,isRareEtype:()=>false,canMv:()=>true,rollElite:()=>{throw Error('boss elite roll')},_isDruidFinale:()=>false,_assignMobSkin:()=>{},Math:Object.create(Math)};
 context.Math.random=()=>.5;vm.createContext(context);vm.runInContext(spawnCode,context);context.si=si;
 const row=JSON.parse(vm.runInContext('JSON.stringify({si,hell:STG[si].hell,element:STG[si].be,col:mkEn(12.5,20.25,si,0,true,STG[si].be,0).col})',context));spawns.push(row);
}
fs.writeFileSync(outputPath,JSON.stringify(transport({cases,total,spawns})), 'utf8');console.log(JSON.stringify({total,spawn_stages:spawns.length}));
