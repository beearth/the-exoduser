import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const ref='e556b617190c325ca39f5add04357f5dea5ca87e',cwd=new URL('../../',import.meta.url);
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd,maxBuffer:16*1024*1024}).toString();
const body=html.slice(html.indexOf('let _sfxFrameT=0;'),html.indexOf('// ── 칼등치기 전용 사운드'));
const cases=[],op=(kind,more={})=>({kind,...more}),play=(key,more={})=>op('play',{key,vol:0.5,rate:1,pan:0,start:0,duration:2,now:100,...more}),finish=id=>op('finish',{id});
const add=(name,ops,more={})=>cases.push({name,type:'admission',ops,...more});
for(const mobile of [false,true]){
 const cap=mobile?16:48,p=mobile?2:5,h=mobile?2:3;
 add('PROJ-'+mobile,Array.from({length:p+2},()=>play('chain_fly',{pri:1})),{mobile});
 add('HIT-includes-PROJ-'+mobile,[...Array.from({length:h},()=>play('bullet_hit')),play('monster_hit1'),play('footstep'),play('voice_attack')],{mobile});
 add('same-VOICE-refused-'+mobile,[...Array.from({length:cap},(_,i)=>play('voice_attack',{now:100+i})),play('voice_attack')],{mobile});
 add('same-SKILL-oldest-'+mobile,[...Array.from({length:cap},(_,i)=>play('chain_fly',{now:cap-i})),play('heavy_hit',{now:999})],{mobile});
 add('higher-priority-replaces-oldest-lowest-'+mobile,[play('death_monster1',{now:5}),play('death_monster2',{now:1}),...Array.from({length:cap-2},(_,i)=>play('voice_attack',{now:i})),play('heavy_hit')],{mobile});
 add('skill-cannot-evict-greater-override-'+mobile,[...Array.from({length:cap},()=>play('x',{pri:11})),play('heavy_hit')],{mobile});
}
add('STEP-self-oldest-swap-pop',[play('footstep',{now:200}),play('footstep2',{now:100}),play('footstep',{now:300}),play('footstep2',{now:400}),finish(1),finish(2),finish(3),finish(4),finish(4)]);
add('STEP-after-hit-cap',[play('monster_hit1'),play('monster_hit2'),play('flat_hit'),play('footstep'),play('footstep2'),play('footstep')]);
add('STEP-evicted-before-override-cap-drop',[play('footstep'),play('footstep2'),...Array.from({length:5},()=>play('bullet_hit')),play('footstep',{pri:1})]);
add('missing-buffer-before-step-and-caps',[play('footstep'),play('footstep2'),play('footstep',{buffer:false})]);
add('cleanup-once-swap-pop',[play('voice_attack'),play('heavy_hit'),play('footstep'),finish(1),finish(1),finish(2),finish(3),finish(2)]);
add('equal-stamp-preserves-array-order',[...Array.from({length:48},()=>play('voice_attack',{now:0})),play('heavy_hit'),finish(2),play('heavy_hit')]);
add('priority-zero-override-not-null',[...Array.from({length:6},()=>play('chain_fly',{pri:0})),play('voice_attack')]);
add('evict-empty',[op('evict',{pri:10})]);
for(const sfx of [0,0.6,1])add('gain-rate-pan-duration-'+sfx,[...[-2,-1,-0.050001,-0.05,0,0.05,0.050001,0.7,2].map(pan=>play('voice_attack',{pan})),play('heavy_hit',{vol:0,rate:0,duration:0}),play('heavy_hit',{vol:3,rate:2,duration:4,start:3})],{sfx});
const spatial=(key,x,y=0,more={})=>op('at',{key,vol:1,rate:1,x,y,now:100,random:0.25,listener:{x:0,y:0},gx:1,pri:null,...more});
const space=(name,ops)=>cases.push({name,type:'spatial',ops});
space('spatial-distance-and-pan',[-2000,-1999,-1992,-1920,-1600,-1200,-600,-30,-29,0,29,30,31,600,1200,1600,1920,1992,1999,2000].map(x=>spatial('heavy_hit',x)));
space('spatial-radial-distance',[spatial('heavy_hit',0,1200),spatial('heavy_hit',960,1280),spatial('heavy_hit',1200,1600)]);
space('spatial-dedup-stamp-before-distance',[spatial('footstep',2000,0,{now:100}),spatial('footstep',0,0,{now:129}),spatial('footstep',0,0,{now:130}),spatial('footstep2',0,0,{now:0}),spatial('footstep2',0,0,{now:30})]);
space('spatial-gates-no-clock-rng',[spatial('',0),spatial('footstep',0,0,{listener:null}),spatial('footstep',0,0,{now:29}),spatial('footstep',0,0,{now:30,vol:0})]);
space('spatial-gx-and-volume',[0,0.009,0.01,0.5,1,2].flatMap(gx=>[spatial('heavy_hit',0,0,{gx}),spatial('heavy_hit',1600,0,{gx})]));
space('spatial-rate-zero-not-wrapper-default',[spatial('heavy_hit',0,0,{rate:0}),spatial('heavy_hit',0,0,{rate:2,random:0.999999,pri:1})]);
function execute(c){let step,serial=0,events=[];const records=new Map(),buffers={},pending={};
 const context={IS_MOBILE:!!c.mobile,_audioBuffers:buffers,_sampleFiles:{},_audioLoadPending:pending,_charIdx:0,_gxVolMul:1,P:{x:0,y:0},performance:{now:()=>step.now??100},Math:Object.assign(Object.create(Math),{random:()=>{events.push(['rng',step.random]);return step.random;}}),sfxVol:()=>c.sfx??0.6,mbus:()=>({}),setTimeout(cb,ms){const r=records.get(serial);r.timeout=ms;r.cleanup=cb;},actx(){return{createBufferSource(){const r={id:++serial,src:null,gain:null,pan:null,timeout:null,start:null};const src={buffer:null,playbackRate:{value:1},onended:null,connect(){},disconnect(){events.push(['cleanup',r.id]);},stop(){events.push(['stop',r.id]);},start(t){r.start=t;}};r.src=src;records.set(serial,r);return src;},createGain(){const gain={gain:{value:1},connect(){},disconnect(){}};records.get(serial).gain=gain;return gain;},createStereoPanner(){const node={pan:{value:0},connect(){},disconnect(){}};records.get(serial).pan=node;return node;}};}};
 const ctx=vm.createContext(context);vm.runInContext(body,ctx);if(c.type==='spatial')vm.runInContext('_playSampleNow=(...args)=>__calls.push(args)',ctx);
 c.expected=[];
 for(const s of c.ops){step=s;events=[];ctx.__step=s;let value=null;
 if(s.kind==='play'){if(s.buffer===false)delete buffers[s.key];else buffers[s.key]={duration:s.duration};const a=vm.runInContext('_playSampleNow(__step.key,__step.vol,__step.rate,__step.start,__step.pan,__step.pri)',ctx);value=a?.buffer?a===records.get(serial)?.src?serial:null:null;}
 else if(s.kind==='finish'){records.get(s.id)?.cleanup();}
 else if(s.kind==='evict'){value=vm.runInContext('_evictLowest(__step.pri)',ctx);}
 else if(s.kind==='at'){ctx.P=s.listener;ctx._gxVolMul=s.gx;ctx.__calls=[];vm.runInContext('playSampleAt(__step.key,__step.vol,__step.rate,__step.x,__step.y,__step.pri)',ctx);}
 else throw Error(s.kind);
 if(c.type==='spatial')c.expected.push({events,calls:ctx.__calls,last:JSON.parse(vm.runInContext('JSON.stringify(_sfxLastT)',ctx))});
 else {const active=vm.runInContext('_activeNodes',ctx).map(n=>{const r=[...records.values()].find(x=>x.src===n.src);return{id:r.id,key:n.key,pri:n.pri,st:n._st,parameters:{gain:r.gain.gain.value,rate:r.src.playbackRate.value,pan:r.pan?.pan.value??null,timeout_ms:r.timeout},start:r.start};});c.expected.push({value,events,active,count:vm.runInContext('_activeNodeCnt',ctx)});}
 }
}
for(const c of cases)execute(c);
const last=name=>cases.find(c=>c.name===name).expected.at(-1);
assert.equal(last('same-VOICE-refused-false').count,48);assert.equal(last('same-VOICE-refused-false').value,null);assert.equal(last('same-SKILL-oldest-false').active.some(n=>n.id===48),false);assert.equal(last('STEP-self-oldest-swap-pop').count,0);assert.equal(last('PROJ-false').count,5);assert.equal(last('PROJ-true').count,2);
const catalog=JSON.parse(fs.readFileSync(new URL('../data/sound_source_samples.json',import.meta.url)));const original=catalog.samples.sword_swing1.split('?')[0];const bytes=cp.execFileSync('git',['show',ref+':'+original],{cwd,maxBuffer:8*1024*1024});const asset={key:'sword_swing1',original_path:catalog.samples.sword_swing1,native_path:'res://assets/sfx/attack_source/sword_swing1.mp3',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),asset,cases};fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./fixtures/sound_source_backend_oracle.json',import.meta.url),JSON.stringify(result,null,0)+'\n');if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0),asset}));
