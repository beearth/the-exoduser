// Stream pinned original; retain only G37077. VM G/P are private fixtures.
const fs=require('node:fs'),readline=require('node:readline'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const [sourcePath,outputPath]=process.argv.slice(2);assert(sourcePath&&outputPath,'source/output required');const hasher=crypto.createHash('sha256'),stream=fs.createReadStream(sourcePath);stream.on('data',b=>hasher.update(b));let lineNo=0,body='';
 for await(const line of readline.createInterface({input:stream,crlfDelay:Infinity})){lineNo++;if(lineNo===37077)body=line}
 const hash=hasher.digest('hex');assert.equal(hash,'4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4');assert(body.includes('wp2.dist+=wp2.spd*sp'));
 const clone=x=>JSON.parse(JSON.stringify(x)),ln=()=>+(new Error().stack.match(/exoduser-game.html:(\d+):/)||[])[1];
 let events=[],responses=[],cursor=0,nested=0,options={},targets={},playerTarget=null,current='',insideOwner=false,elementRead=null;
 function command(name,args){events.push({kind:'command',value:{command:name,source_line:ln(),args:clone(args),executed:false}})}
 const ctx={Math:Object.create(Math)};ctx.Math.random=()=>{throw new Error('unowned RNG draw')};ctx.isPWin=()=>{throw new Error('wallPush must not ask parry')};ctx.ar=()=>({el:3});ctx.elMul=(...args)=>{elementRead={args,multiplier:options.elementMul??.75};return elementRead.multiplier};
 ctx.hurtP=(...args)=>{command('resolve_wall_push_damage',[]);insideOwner=true;const e=targets[current];playerTarget.iframes=options.ownerIframes??60;
  if(options.mutate){e.ang=Math.PI/2;e.dist=e.maxDist;playerTarget.x+=7;playerTarget.y-=3;playerTarget.kb.x=-4;playerTarget.kb.y=9}
  cursor+=nested;responses.push({entry_after:clone(e),player_after:clone(playerTarget),resolved_damage:args,element_read:clone(elementRead),cursor_after:cursor});insideOwner=false;
 };
 ctx.SFX={block:(...a)=>{command('SFX.block',a);cursor+=nested}};ctx.shake=(...a)=>{command('shake',a);cursor+=nested};
 vm.createContext(ctx);vm.runInContext('\n'.repeat(37075)+'function tick(sp){\n'+body+'\n}',ctx,{filename:'exoduser-game.html'});
 const entry=(change={})=>({x:0,y:0,ang:0,t:0,maxT:60,dist:0,maxDist:2000,w:1300,spd:35,dmg:55,el:0,src:{actor_ref:'boss'},hit:false,keep:71,...change});
 const player=(x=35,y=0)=>({x,y,r:12,iframes:0,s:'idle',kb:{x:2,y:3},keep:29});const queue=e=>({ids:['a'],entries:{a:e}});
 const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('hex')};
 function numberBits(x,path=[],rows=[]){if(typeof x==='number')rows.push({path,bits:bits(x)});else if(x&&typeof x==='object')for(const k of Object.keys(x))numberBits(x[k],path.concat(k),rows);return rows}
 const cases=[];
 function run(name,q,p=player(),sp=1,opt={}){
  events=[];responses=[];cursor=0;nested=opt.nested||0;options=opt;targets=clone(q?.entries||{});current='';insideOwner=false;const proxies={},refIds=new Map();
  for(const [id,e]of Object.entries(targets)){const proxy=new Proxy(e,{set(t,k,v){t[k]=v;if(!insideOwner)events.push({kind:'entry_write',id,field:k,value:clone(v),source_line:ln()});return true}});proxies[id]=proxy;refIds.set(proxy,id)}
  playerTarget=clone(p);playerTarget.kb=new Proxy(playerTarget.kb,{set(t,k,v){t[k]=v;if(!insideOwner)events.push({kind:'player_write',field:'kb.'+k,value:v,source_line:ln()});return true}});
  const array=(q?.ids||[]).map(id=>proxies[id]);const arrayProxy=new Proxy(array,{get(t,k){if(/^\d+$/.test(String(k))&&t[k])current=refIds.get(t[k]);return t[k]},set(t,k,v){t[k]=v;events.push(k==='length'?{kind:'queue_length_write',value:v,source_line:ln()}:{kind:'queue_index_write',index:+k,id:refIds.get(v),source_line:ln()});return true}});
  ctx.G=q===null?(opt.absent?{}:{_wallPushes:null}):{_wallPushes:arrayProxy};ctx.P=playerTarget;ctx.sp=sp;vm.runInContext('tick(sp)',ctx);
  cases.push({name,si:opt.si??8,queue:q,player:p,sp,input_bits:numberBits({queue:q,player:p,sp}),nested,responses:clone(responses),expected:{queue:q===null?null:{...clone(q),ids:array.map(v=>refIds.get(v)),entries:clone(targets)},player:clone(playerTarget),events:clone(events),cursor}});
 }
 for(const si of [7,8,9])for(const state of ['idle','charge'])for(const iframes of [0,1])for(const hit of [false,true])for(const sp of [0,.5,1,2])run('movement-onehit-charge',queue(entry({hit})),{...player(35),s:state,iframes},sp,{si,nested:si%2});
 for(const dx of [-25.000000000000004,-25,-24.999999999999996,0,24.999999999999996,25,25.000000000000004])for(const dy of [-651,-650,-649.9999999999999,0,649.9999999999999,650,651])run('strict-strip-edges',queue(entry({spd:0})),player(dx,dy),0);
 for(const t of [58,59,60])for(const dist of [1964,1965,2000])for(const state of ['idle','charge'])run('hit-before-time-distance-trim',queue(entry({t,dist})),{...player(dist+35),s:state},1);
 for(const angle of [-Math.PI,-Math.PI/2,0,.7,Math.PI/2,Math.PI])for(const sp of [-1,0,.5,1,60])run('angle-sp',queue(entry({ang:angle})),player(Math.cos(angle)*35*sp,Math.sin(angle)*35*sp),sp,{nested:1});
 for(const dmg of [-3.25,55,4294967296+99])for(const multiplier of [0,.125,.75,1.5])for(const mutate of [false,true])run('protected-owner-readback',queue(entry({dmg,el:4})),player(),1,{elementMul:multiplier,mutate,nested:2});
 for(const ids of [['a','b','c'],['b','a','b','c']])for(const ownerIframes of [0,60])run('stable-alias-player-readback', {ids,entries:{a:entry({t:59}),b:entry(),c:entry({hit:true})}},player(),1,{ownerIframes});
 run('absent',null,player(),1,{absent:true});run('null',null);run('empty',{ids:[],entries:{}});
 run('onehit-first',queue(entry()),player(),1,{ownerIframes:0});const first=cases[cases.length-1];run('onehit-iframes-cleared-next',clone(first.expected.queue),{...clone(first.expected.player),iframes:0},0,{ownerIframes:0});
 const summary={cases:cases.length,events:cases.reduce((n,c)=>n+c.expected.events.length,0),contacts:cases.reduce((n,c)=>n+c.responses.length,0),charge_hits:cases.filter(c=>c.player.s==='charge'&&c.responses.length).length,hit_and_removed:cases.filter(c=>c.responses.length&&c.expected.queue.ids.length===0).length,no_contact_cases:cases.filter(c=>!c.responses.length).length};
 fs.writeFileSync(outputPath,JSON.stringify({source_only:true,game_sha256:hash,source_range:[37077,37077],summary,cases}),'utf8');fs.writeFileSync(outputPath+'.meta.json',JSON.stringify({source_only:true,game_sha256:hash,summary}),'utf8');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
