// BC3-04: streaming source hash + selected lines only; original laser switch VM.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),readline=require('node:readline'),assert=require('node:assert/strict');
const [sourcePath,outputPath]=process.argv.slice(2);
async function main(){
 assert(sourcePath&&outputPath,'explicit source and UTF-8 output required');
 const digest=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(sourcePath))digest.update(chunk);
 const hash=digest.digest('hex');assert.equal(hash,'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');
 const selected=new Map(),input=readline.createInterface({input:fs.createReadStream(sourcePath),crlfDelay:Infinity});let n=0;
 for await(const line of input){n++;if(n===12463||(n>=40710&&n<=40747))selected.set(n,line);if(n===40747){input.close();break}}
 const fragment=(a,b)=>Array.from({length:b-a+1},(_,i)=>selected.get(a+i)).join('\n');
 const pins={"12463-12463": "c25172b1b2691a02a5cdd36e68291ec91fd88ac5fa1a65432d16b8acf77b2a48", "40710-40747": "b074695108b8fe7a95e3bb0b2a9d4a2db7e1161e546271ad90699ec5fc04139c"};for(const [key,pin] of Object.entries(pins)){const[a,b]=key.split('-').map(Number);assert.equal(crypto.createHash('sha256').update(fragment(a,b)).digest('hex'),pin)}
 let events=[],responses=[],helpers=[],cursor=0,units=[],nested=0,contactNested=0,wallReads=0,wallAt=0,parry=false,mode='none',active=true,pitchOwner=false,sites={};
 let targetE,targetP,eProxy,pProxy;
 const line=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
 const clone=x=>JSON.parse(JSON.stringify(x,(_,v)=>v===eProxy?{actor_ref:'boss'}:v));
 function command(name,args,ln=line()){events.push({kind:'command',value:{command:name,source_line:ln,args:clone(args),executed:false}})}
 function kb(value){return new Proxy(value,{set(t,k,v){t[k]=v;if(active)events.push({kind:'player_write',field:'kb.'+k,value:v,source_line:line()});return true}})}
 const ctx={Math:Object.create(Math),OPT:{shake:100}};
 ctx.Math.random=()=>{
  const ln=line(),unit=units[cursor++%units.length];if(pitchOwner)return unit;
  const i=sites[ln]||0;sites[ln]=i+1;
  const field=ln===40716?'laser_direction':ln===40738?'laser_death_sample':ln===40745?['laser_particle_gate','laser_particle_distance'][i]:ln===40746?['laser_particle_x','laser_particle_y','laser_particle_vx','laser_particle_vy','laser_particle_size'][i]:null;
  assert(field,'unknown laser RNG site '+ln);events.push({kind:'rng',value:{field,source_line:ln,unit}});return unit;
 };
 for(const name of ['addParts','poolPart','playSample','addTxt'])ctx[name]=(...args)=>{command(name,args);cursor+=nested};
 ctx.SFX={charge:(...args)=>{command('SFX.charge',args);cursor+=nested},beamStop:(...args)=>{command('SFX.beamStop',args);cursor+=nested}};
 ctx.isW=(...args)=>{command('isW',args);wallReads++;return wallAt>0&&wallReads===wallAt};
 ctx.isPWin=()=>{command('isPWin',[]);return parry};ctx._T=x=>'translated:'+x;
 function contact(name,args){
  command(name,args);const request=clone(events.at(-1).value);active=false;
  if(mode==='shift'){targetP.x+=80;targetP.y-=35;targetP.kb=kb({x:17,y:-9});targetP.iframes=3;targetE.x+=7;targetE.y-=5;targetE.laserAng+=.4;targetE.atk+=3;}
  if(mode==='timer'){targetE.st2=7;targetP.s='charge';}
  if(mode==='iframe'){targetP.iframes=120;targetP.mhp+=7;}
  if(mode==='parry'){targetP.x+=3;targetP.y-=2;targetE.poise-=20;targetE.st2=0;}
  cursor+=contactNested;active=true;responses.push({command:request,enemy_after:clone(targetE),player_after:clone(targetP),cursor_after:cursor});
 }
 ctx.hurtP=(...args)=>contact('hurtP',args);ctx.doParry=(...args)=>contact('doParry',args);ctx._poiseHit=(...args)=>contact('_poiseHit',args);
 vm.createContext(ctx);vm.runInContext('\n'.repeat(12462)+fragment(12463,12463),ctx,{filename:'exoduser-game.html'});const nativePitch=ctx._r;
 ctx._r=(...args)=>{command('_r',args);pitchOwner=true;const value=nativePitch(...args);pitchOwner=false;helpers.push({value,cursor_after:cursor});return value};
 vm.runInContext('\n'.repeat(40708)+'function tick(e,sp){switch(e.s){\n'+fragment(40710,40747)+'\n}}',ctx,{filename:'exoduser-game.html'});
 const cases=[];
 function enemy(s='bossLaser',st2=1){return {s,st2,x:10,y:20,r:44,facing:.3,atk:46,el:2,col:'#3388ff',laserAng:0,laserLen:35,_laserLockAng:0,_laserSweepDir:1,_laserSweepT:0,poise:100,keep:{unowned:19}}}
 function player(x=20,y=20){return {x,y,r:12,iframes:0,s:'idle',mhp:999,kb:{x:1.25,y:-2.5},keep:71}}
 function run(name,si,e,p,sp=0,opt={}){
  events=[];responses=[];helpers=[];cursor=0;wallReads=0;sites={};units=opt.units||[.75,.125,.875,.5,0,.9];nested=opt.nested||0;contactNested=opt.contact_nested||0;wallAt=opt.wall_at||0;parry=!!opt.parry;mode=opt.mode||'none';active=true;
  targetE=structuredClone(e);targetP=structuredClone(p);targetP.kb=kb(targetP.kb);
  eProxy=new Proxy(targetE,{set(t,k,v){t[k]=v;if(active)events.push({kind:'write',field:k,value:clone(v),source_line:line()});return true}});
  pProxy=new Proxy(targetP,{set(t,k,v){t[k]=k==='kb'?kb(v):v;if(active)events.push({kind:'player_write',field:k,value:clone(v),source_line:line()});return true}});
  const options={flash_t:opt.flash_t??2,global_shake:opt.global_shake??7,shake:opt.shake??125};if(opt.null_globals){options.flash_t=null;options.global_shake=null}
  const globals={_flashT:options.flash_t,shake:options.global_shake,_flashCol:'old'};
  ctx.G=new Proxy({stage:si,...globals},{set(t,k,v){t[k]=v;globals[k]=v;events.push({kind:'global_write',field:k,value:clone(v),source_line:line()});return true}});ctx.P=pProxy;ctx.OPT.shake=options.shake;ctx.e=eProxy;ctx.sp=sp;
  vm.runInContext('tick(e,sp)',ctx);
  cases.push({name,si,enemy:e,player:p,sp,options,units,nested,contact_nested:contactNested,wall_at:wallAt,parry,mode,responses:clone(responses),helpers:clone(helpers),expected:{enemy:clone(targetE),player:clone(targetP),events:clone(events),globals,cursor,wall_reads:wallReads}});
 }
 for(let si=10;si<=13;si++)for(const t of [1,0]){const e=enemy('bossLaserWind',t);e.laserAng=2.8;e.laserLen=0;run('stage-wind-lock',si,e,player(-100,-80),.5,{units:si%2?[.5]:[.49999999999999994],nested:1,flash_t:si%2?9:0,global_shake:si%2?30:0});}
 for(const a of [-Math.PI-.001,-Math.PI,Math.PI,Math.PI+.001]){const e=enemy('bossLaserWind',-.5);e.laserAng=a;e.col='';run('wrapped-wind-angle',10,e,player(-100,20),2,{null_globals:true});}
 for(let si=10;si<=13;si++){const e=enemy();e.laserLen=1400+si*60;run('canonical-length-first-wall',si,e,player(10,-200),1,{wall_at:1});}
 {const e=enemy();e.laserLen=2180;run('full-length-no-wall',13,e,player(10,-200),1);}
 for(const len of [0,10,10.5,20,20.5,35]){const e=enemy();e.laserLen=len;run('strict-wall-loop',10,e,player(-10,20),0,{wall_at:2});}
 for(const [x,y] of [[10,20],[10.000001,20],[29.999999,20],[30,20],[30.000001,20],[20,111.999999],[20,112],[20,112.000001],[20,-72],[20,-71.999999]]){const e=enemy();e.laserLen=20;run('strict-projection-perpendicular',12,e,player(x,y),0,{units:[.5]});}
 for(const flag of ['charge','iframe','parry-charge','negative-iframe']){const p=player();if(flag.includes('charge'))p.s='charge';if(flag==='iframe')p.iframes=1;if(flag==='negative-iframe')p.iframes=-1;run('protected-'+flag,11,enemy('bossLaser',0),p,.5,{parry:flag==='parry-charge'});}
 for(const mode of ['shift','timer','iframe','parry'])run('contact-owner-readback-'+mode,13,enemy('bossLaser',0),player(),0,{mode,parry:mode==='parry',nested:2,contact_nested:3});
 for(const unit of [.49999999999999994,.5,.5000000000000001,.9999999999999999])run('particle-gate-boundary',10,enemy('bossLaser',0),player(-10,20),.5,{units:[unit,.125,.75,.25,.9,.4,.6],nested:1});
 for(const mhp of [99,100,999,429496729600+100]){const p=player();p.mhp=mhp;run('HP-percent-ToInt32',10,enemy(),p,0,{units:[1/3,.5,0]});}
 for(const [lock,dir,t] of [[null,0,null],[null,null,0],[.75,-1,2],[.75,.5,-2]]){const e=enemy();e.laserAng=.4;e._laserLockAng=lock;e._laserSweepDir=dir;e._laserSweepT=t;run('legacy-null-zero-fallback',12,e,player(-10,20),.5);}
 const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),rng:cases.reduce((n,c)=>n+c.expected.events.filter(e=>e.kind==='rng').length,0),wall_reads:cases.reduce((n,c)=>n+c.expected.wall_reads,0),contacts:cases.reduce((n,c)=>n+c.responses.length,0),pitch_readbacks:cases.reduce((n,c)=>n+c.helpers.length,0)};
 function encode(v){if(typeof v==='number'){assert(Number.isFinite(v));if(Number.isSafeInteger(v))return {integer:String(v)};const b=Buffer.alloc(8);b.writeDoubleLE(v);return {binary64:b.toString('hex')}}if(Array.isArray(v))return v.map(encode);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)]));return v}
 fs.writeFileSync(outputPath,JSON.stringify(encode({source_only:true,game_sha256:hash,pins,summary,cases})),'utf8');console.log(JSON.stringify(summary));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
