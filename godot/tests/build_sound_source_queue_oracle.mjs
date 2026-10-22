import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';
const ref='91e2774b769869e59f80953e148a5c95203b0fea';
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd:new URL('../../',import.meta.url),maxBuffer:16*1024*1024}).toString();
const en=(key,now=100,more={})=>({op:'enqueue',key,now,vol:1,rate:1,pri:false,gx:1,rng:0.5,...more});
const q=(key,pri=false,more={})=>({key,vol:1,rate:1,...(pri?{pri:1}:{}),...more});
const flush=(more={})=>({op:'flush',active:0,active_delta:0,audio_time:4.25,fail_at:0,...more});
const initial=(queue=[],more={})=>({queue,last_t:{},frame_t:0,frame_counts:{},death_cd:0,hit_cd:0,m_sfx_playing:0,sb_cd:0,...more});
const cases=[];function add(name,ops,init=initial(),mobile=false){cases.push({name,mobile,initial:init,ops});}
add('30ms-first-and-repeat-boundary',[en('flat_hit',0),en('flat_hit',29.999),en('flat_hit',30,{rng:0}),en('flat_hit',59.999),en('flat_hit',60,{rng:1}),flush()]);
add('priority-LIFO-normal-FIFO',[en('normal_a'),en('normal_b'),en('flat_hit',0,{pri:true,rng:0}),en('footstep',0,{rng:0.25}),en('sword_swing1',0,{rng:0.75}),en('sword_swing1',0,{rng:1}),flush()]);
add('gx-before-clock-rng-rate-default',[en('',0),en('flat_hit',100,{vol:0.019,gx:0.5}),en('flat_hit',100,{vol:0.02,gx:0.5,rate:0,rng:0}),en('other',100,{vol:0,gx:1,rate:0,rng:1}),en('over_one',100,{vol:0.2,gx:2,rate:-2}),flush()]);
for(const mobile of [false,true]){
 const suffix=mobile?'mobile':'desktop';
 add('frame-cap-'+suffix,[flush(),flush()],initial(Array.from({length:10},(_,i)=>q('normal_'+i))),mobile);
 add('category-cap-'+suffix,[flush()],initial([q('monster_hit1'),q('monster_hit_flesh1'),q('flat_hit'),q('other')]),mobile);
 add('priority-counts-in-category-'+suffix,[flush()],initial([q('flat_hit',true),q('monster_hit1',true),q('monster_hit_flesh1'),q('other')]),mobile);
 add('priority-bypasses-frame-category-node-'+suffix,[flush({active:mobile?16:48})],initial([...Array.from({length:12},()=>q('flat_hit',true)),q('normal')]),mobile);
 add('active-count-read-live-'+suffix,[flush({active:mobile?15:47,active_delta:1})],initial([q('normal_a'),q('normal_b'),q('priority',true),q('normal_c')]),mobile);
 add('node-cap-boundary-'+suffix,[flush({active:mobile?16:48})],initial([q('a'),q('b')]),mobile);
 for(const fail_at of [1,2,3])add('throw-prefix-'+fail_at+'-'+suffix,[flush({fail_at}),flush()],initial([q('a',true),q('b',true),q('c',true),q('d',true)],{frame_counts:{a:8,b:3},death_cd:2,hit_cd:1,m_sfx_playing:3,sb_cd:2}),mobile);
}
add('duplicates-decay-and-floor',[flush(),flush()],initial(Array.from({length:12},()=>q('flat_hit',true))));
add('duplicate-counters-reset-each-frame',[en('footstep',0),en('footstep',0),en('footstep',0),flush(),en('footstep',0),flush()]);
add('skip-retains-last-stamp',[en('normal'),flush({active:48}),en('normal',129.999),en('normal',130),flush()]);
add('voice-priority-does-not-imply-queue-bypass',[en('voice_a'),en('voice_b'),en('voice_c'),en('normal'),flush()]);
add('unknown-sample-is-not-rejected',[en('source_missing_key'),en('bow_shot',0),en('sword_swing99',0),flush()]);
add('empty-frame-cooldowns-and-existing-keys',[flush(),flush(),flush()],initial([],{frame_t:7,frame_counts:{a:4,b:-2},death_cd:2,hit_cd:1,m_sfx_playing:3,sb_cd:2}));
add('nonpositive-cooldowns-unchanged',[flush()],initial([],{death_cd:-1,hit_cd:0,sb_cd:-3,m_sfx_playing:2}));
add('dispatch-enqueues-same-frame',[flush({append:q('appended')})],initial([q('first')]));
add('throw-discards-reentrant-append',[flush({append:q('appended'),fail_at:1}),flush()],initial([q('first'),q('second')]));
add('pan-and-zero-volume-preserved',[flush()],initial([q('left',false,{pan:-0.6,vol:0}),q('right',true,{pan:0.7,rate:1.2}),q('center')]));
add('priority-consumes-normal-frame-budget',[flush()],initial([...Array.from({length:6},(_,i)=>q('pri_'+i,true)),q('normal_a'),q('normal_b')]));
const pre=html.slice(html.indexOf('let _sfxFrameT='),html.indexOf('const _SILVERTAIL_VOICE_MAP='));
const cat=html.slice(html.indexOf('function _sfxCat('),html.indexOf('const _sfxLastT='));
const play=html.slice(html.indexOf('const _sfxLastT='),html.indexOf('// 거리 기반 사운드:',html.indexOf('const _sfxLastT=')));
function execute(c){
 const events=[],calls=[],during=[];let config={},ctx;
 const math=Object.create(Math);math.random=()=>{events.push('rng');return config.rng;};
 const audio={get currentTime(){events.push('audio');return config.audio_time;}};
 ctx=vm.createContext({IS_MOBILE:c.mobile,Math:math,performance:{now(){events.push('now');return config.now;}},actx:()=>audio,_actx:null,_silvertailVoiceKey:k=>k,_gxVolMul:1,_deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,SFX:{_sbSndCd:0},__init:c.initial,__calls:calls,__events:events,__during:during});
 vm.runInContext(pre+'\n'+cat+'\n'+play,ctx);
 vm.runInContext(`_sfxQueue.push(...__init.queue.map(q=>({...q})));Object.assign(_sfxLastT,__init.last_t);_sfxFrameT=__init.frame_t;Object.assign(_sfxFrameCnt,__init.frame_counts);_deathSfxCd=__init.death_cd;_hitSfxCd=__init.hit_cd;_mSfxPlaying=__init.m_sfx_playing;SFX._sbSndCd=__init.sb_cd;`,ctx);
 const snapshot=()=>JSON.parse(vm.runInContext(`JSON.stringify({queue:_sfxQueue,last_t:_sfxLastT,frame_t:_sfxFrameT,frame_counts:_sfxFrameCnt,death_cd:_deathSfxCd,hit_cd:_hitSfxCd,m_sfx_playing:_mSfxPlaying,sb_cd:SFX._sbSndCd})`,ctx));
 ctx.__dispatch=(...args)=>{events.push('dispatch');calls.push(args);during.push(vm.runInContext('({queue_size:_sfxQueue.length,frame_t:_sfxFrameT,frame_counts:{..._sfxFrameCnt},death_cd:_deathSfxCd,hit_cd:_hitSfxCd,m_sfx_playing:_mSfxPlaying,sb_cd:SFX._sbSndCd})',ctx));if(config.append&&calls.length===1)vm.runInContext('_sfxQueue.push({...__append})',ctx);if(calls.length===config.fail_at)throw Error('injected_dispatch');vm.runInContext('_activeNodeCnt+=__delta',ctx);};
 vm.runInContext('_playSampleNow=__dispatch',ctx);
 c.expected=[];
 for(const op of c.ops){config=op;events.length=0;calls.length=0;during.length=0;ctx.__op=op;ctx._gxVolMul=op.gx;ctx.__delta=op.active_delta;ctx.__append=op.append;let failed=false;
 if(op.op==='enqueue')vm.runInContext('playSample(__op.key,__op.vol,__op.rate,__op.pri)',ctx);
 else{vm.runInContext('_activeNodeCnt=__op.active',ctx);try{vm.runInContext('_sfxFrameReset()',ctx);}catch(e){if(e.message!=='injected_dispatch')throw e;failed=true;}}
 c.expected.push({state:snapshot(),events:[...events],calls:structuredClone(calls),during:structuredClone(during),failed});
 }
}
for(const c of cases)execute(c);
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),cases};
const fixture=new URL('./fixtures/sound_source_queue_oracle.json',import.meta.url);
fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});
const serialized='{\n"source_ref":'+JSON.stringify(result.source_ref)+',\n"source_sha256":'+JSON.stringify(result.source_sha256)+',\n"cases":[\n'+cases.map(c=>JSON.stringify(c)).join(',\n')+'\n]}\n';
fs.writeFileSync(fixture,serialized);
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0),source:ref}));
