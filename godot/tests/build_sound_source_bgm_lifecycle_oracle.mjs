import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const ref='91e2774b769869e59f80953e148a5c95203b0fea';
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd:new URL('../../',import.meta.url),maxBuffer:16*1024*1024}).toString();
const start=html.indexOf('const BGM={'),bgm=html.slice(start,html.indexOf('\nconst C=',start));assert(start>0&&bgm.includes('},50);'));
const cases=[],op=(kind,more={})=>({kind,rng:[0.25,0.999999,0.5],...more});
const play=(key,more={})=>op('play',{key,...more}),track=src=>op('track',{src}),get=src=>op('get',{src}),fade=ms=>op('fade',{ms}),fire=id=>op('timer',{id}),end=id=>op('ended',{id}),error=id=>op('error',{id}),settle=(index,ok)=>op('settle',{index,ok,optional:false}),context=value=>op('context',{value});
const add=(name,ops,more={})=>cases.push({name,ops,...more});
const g={stage:1,cutscene_done:true,on:true};const normal={bgm_track:'auto',game:g};
const constants=vm.createContext({});vm.runInContext(bgm,constants);const tracks=JSON.parse(vm.runInContext('JSON.stringify(BGM.tracks)',constants));
for(const key of Object.keys(tracks))add('source-pool-play-'+key,[play(key),settle(0,true),end(1),...(['death','victory'].includes(key)?[]:[settle(1,false)]),op('stop')]);
for(let i=1;i<=7;i++)add('act-auto-cycle-reentry-'+i,[play('hell'+i),end(1),play('hell'+i),end(1),op('stop')]);
add('t-lock-including-event-keys',[...['hell1','death','victory','forge','cutscene_nemesis'].map(key=>play(key)),play('hell1',{force:true})],{context:{...normal,bgm_track:'t:chosen'}});
for(const key of ['boss','hell1','death','victory','forge','cutscene_nemesis'])add('fixed-option-'+key,[play(key),op('ended_direct'),play(key,{force:true})],{context:{...normal,bgm_track:'boss'}});
for(const key of ['hell1','boss','forge','death','victory','cutscene_nemesis'])add('all-random-event-'+key,[play(key),op('ended_direct')],{context:{...normal,bgm_track:'allRandom'}});
for(const [name,ctx] of Object.entries({state:{...normal,cutscene_state:'INTRO_CUTSCENE'},forced:{...normal,force_cutscene:true,game:{...g,cutscene_done:false}},stage0:{...normal,game:{stage:0,cutscene_done:false,on:false}},nullgame:{bgm_track:'auto',force_cutscene:true,game:null}}))add('intro-'+name,[play('hell1'),play('hell1',{force:true}),play('cutscene_nemesis',{force:true}),play('death',{force:true}),track('direct-ignores-gate')],{context:ctx});
for(const [name,ctx] of Object.entries({done:{...normal,force_cutscene:true},playing:{...normal,game:{stage:0,cutscene_done:false,on:true}},undefinedG:{bgm_track:'auto',force_cutscene:true},nullG:{bgm_track:'auto',game:null},undefinedAll:{bgm_track:'auto'}}))add('intro-allow-'+name,[play('hell1')],{context:ctx});
add('intro-precedes-stop',[track('kept'),fade(500),context({...normal,cutscene_state:'INTRO_CUTSCENE'}),play('hell1',{force:true}),fire(1)]);
add('track-loop-and-rejection',[track('one'),settle(0,false),op('interact'),settle(1,false),op('interact'),settle(2,true),op('stop')]);
add('stop-keeps-pending-and-listeners',[track('one'),settle(0,false),op('stop'),op('interact'),track('two'),op('interact'),settle(2,true)]);
add('late-rejection-after-stop',[track('one'),op('stop'),settle(0,false),op('interact')]);
add('late-reject-overwrites-new-current',[track('one'),play('hell2'),settle(1,false),settle(0,false),op('interact'),settle(2,true)]);
add('old-interact-success-clears-new-pending',[track('one'),settle(0,false),op('interact'),track('two'),settle(2,false),settle(1,true)]);
add('pending-extra-FIFO-even-without-current',[op('extra',{src:'extra1'}),op('extra',{src:'extra2'}),op('interact'),settle(0,false),settle(1,true),op('interact')]);
add('pending-extra-with-current',[track('main'),settle(0,false),op('extra',{src:'extra1'}),op('extra',{src:'extra2'}),op('interact'),settle(2,false),settle(3,false),settle(1,true)]);
add('listeners-five-once-remove-and-rebind',[track('a'),settle(0,false),track('b'),settle(1,false),op('listener',{event:'mousemove'}),settle(2,true),play('hell1'),settle(3,false),op('listener',{event:'touchstart'}),settle(4,true)]);
add('error-current-300ms-next',[play('hell1'),error(1),fire(1),settle(1,false)]);
add('error-noncurrent-cache-only',[track('a'),get('b'),error(2),get('b')]);
add('old-error-deletes-new-src-cache',[track('a'),error(1),get('a'),error(1),fire(1)]);
add('error-timer-reads-current-key-not-captured',[play('hell1'),error(1),play('hell2'),fire(1)]);
add('error-cur-null-stop-retains-key',[play('hell1'),error(1),op('stop'),fire(1)]);
add('error-then-new-track-null-selection',[track('a'),error(1),track('b'),fire(1)]);
add('all-bad-ended-no-fade-clear',[play('hell1'),fade(100),error(1),fire(2),fire(1),fire(2)],{tracks:{hell1:['a'],gameplay:[]}});
add('cache-LRU-preserve-current',[track('a'),...['b','c','d','e','f','g'].map(get),get('c'),get('h')]);
add('cache-hit-no-new-audio',[get('a'),get('b'),get('a'),track('a'),track('a')]);
add('cache-before-current-assignment',[track('a'),...['b','c','d','e','f'].map(get),track('b'),get('g')]);
add('evicted-audio-late-error',[track('a'),...['b','c','d','e','f','g'].map(get),error(2)]);
add('cache-error-is-bad-not-global-lock',[track('a'),error(1),track('a'),settle(1,true)]);
for(const ms of [50,100,125,300,500,800,1000])add('fade-50ms-duration-'+ms,[track('a'),fade(ms),...Array.from({length:Math.ceil(ms/50)+2},()=>fire(1)),op('stop')]);
add('fade-no-current',[fade(500),op('stop')]);
add('fade-same-cached-audio-old-handle-inert',[track('a'),fade(500),fire(1),track('a'),fire(1),fade(100),fire(1),fire(2),fire(2)]);
add('fade-replacement-old-handle-inert',[track('a'),fade(500),fade(100),fire(1),fire(2),fire(1),fire(2)]);
add('fade-stop-new-source-old-callback',[track('a'),fade(500),op('stop'),track('b'),fire(1)]);
add('fade-ended-clears-before-new-audio',[play('hell1'),fade(500),end(1),fire(1)]);
add('fade-identity-mismatch-after-error',[track('a'),fade(500),error(1),fire(1),fire(2)]);
add('fade-zero-volume-completes-first-tick',[op('volume',{value:0}),track('a'),fade(500),fire(1)]);
add('set-volume-current-and-two-legacy-gains',[op('gains',{value:[0.1,0.2]}),op('volume',{value:0}),track('a'),op('volume',{value:0.6}),fade(100),op('volume',{value:1}),fire(1),fire(1),fire(1),fire(1)]);
add('set-volume-one-gain-and-no-cur',[op('gains',{value:[null,0.2]}),op('volume',{value:0.37}),op('gains',{value:[0.1,null]}),op('volume',{value:0.12})]);
add('ended-retains-cached-track-loop-true',[track('a'),play('hell1'),end(2)],{tracks:{hell1:['b','a'],gameplay:[]}});
add('empty-source-does-not-clear-pending',[track('a'),settle(0,false),play('missing'),op('stop'),op('ended_direct'),op('interact')]);
add('act-first-null-falls-back-mixed',[play('hell1'),end(1)],{tracks:{gameplay:['a','b']}});
add('act-first-null-falls-back-all',[play('hell1'),op('bad',{src:'b'}),end(1)],{tracks:{hell1:['a','b'],gameplay:['c']}});
add('act-bad-fallback-and-reset',[op('bad',{src:'a'}),play('hell1'),end(1),play('hell1')],{tracks:{hell1:['a'],gameplay:['b','c']}});
add('ended-allrandom-ignores-event-exemption',[play('death'),op('ended_direct')],{context:{...normal,bgm_track:'allRandom'}});
add('ended-rejection-does-not-bind-pending',[play('hell1'),settle(0,true),end(1),settle(1,false)]);
add('empty-key-and-stop',[play(''),op('stop'),op('ended_direct')]);
// Native와 동일한 fake media contract. 원본 BGM 함수/조건/상수는 수정하지 않는다.
async function execute(c){
 let events=[],step,index=0;const audios=[],timers=[],promises=[],listeners=new Map();let ctx;
 class Audio {
  constructor(src){this.id=audios.length+1;this.src=src;this._preload='';this._volume=1;this._time=0;this._loop=false;this._ended=null;this._error=null;this.paused=true;audios.push(this);events.push(['create',this.id,src]);}
  get preload(){return this._preload}set preload(v){this._preload=v;events.push(['preload',this.id,v]);}
  get volume(){return this._volume}set volume(v){this._volume=v;events.push(['volume',this.id,v]);}
  get currentTime(){return this._time}set currentTime(v){this._time=v;events.push(['time',this.id,v]);}
  get loop(){return this._loop}set loop(v){this._loop=v;events.push(['loop',this.id,v]);}
  get onended(){return this._ended}set onended(v){this._ended=v;events.push(['onended',this.id,!!v]);}
  get onerror(){return this._error}set onerror(v){this._error=v;events.push(['onerror',this.id,!!v]);}
  play(){events.push(['play',this.id]);return new Promise((resolve,reject)=>promises.push({audio:this.id,resolve:()=>{this.paused=false;resolve()},reject,settled:false}));}
  pause(){this.paused=true;events.push(['pause',this.id]);}removeAttribute(s){assert.equal(s,'src');this.src='';events.push(['remove_src',this.id]);}load(){events.push(['load',this.id]);}
 }
 const timer=(kind,callback,ms)=>{const id=timers.length+1;timers.push({id,kind,callback,ms,active:true});events.push([kind,id,ms]);return id;};
 ctx=vm.createContext({Audio,Math:Object.assign(Object.create(Math),{random(){assert(index<step.rng.length,c.name+' unexpected RNG');const value=step.rng[index++];events.push(['rng',value]);return value;}}),OPT:{bgmTrack:'auto'},G:{stage:1,_cutsceneDone:true,on:true},_bgmGainA:null,_bgmGainB:null,
 setInterval:(cb,ms)=>timer('interval',cb,ms),clearInterval(id){timers[id-1].active=false;events.push(['clear',id]);},setTimeout:(cb,ms)=>timer('timeout',cb,ms),
 document:{addEventListener(event,callback,options){assert.equal(options.passive,true);listeners.set(event,callback);events.push(['listen',event,true]);},removeEventListener(event,callback){assert(!listeners.has(event)||listeners.get(event)===callback);listeners.delete(event);events.push(['unlisten',event]);}}});
 vm.runInContext(bgm,ctx);const b=vm.runInContext('BGM',ctx);if(c.tracks)b.tracks=c.tracks;
 const applyContext=value=>{ctx.OPT.bgmTrack=value.bgm_track;delete ctx._cutsceneState;delete ctx._forceCutscene;delete ctx.G;if('cutscene_state'in value)ctx._cutsceneState=value.cutscene_state;if('force_cutscene'in value)ctx._forceCutscene=value.force_cutscene;if('game'in value)ctx.G=value.game===null?null:{stage:value.game.stage,_cutsceneDone:value.game.cutscene_done,on:value.game.on};};
 applyContext(c.context||normal);c.expected=[];
 for(const s of c.ops){step=s;index=0;events=[];let value=null;
 switch(s.kind){case'play':b.play(s.key,!!s.force);break;case'track':b.playTrack(s.src);break;case'get':value=b._getAudio(s.src)?.id??null;break;case'stop':b.stop();break;case'fade':b.fadeOut(s.ms);break;case'volume':b.setVol(s.value);break;case'context':applyContext(s.value);break;case'bad':b._badSrcs[s.src]=1;break;
 case'extra':b._pendingExtra.push(new Audio(s.src));break;case'interact':b._onInteract();break;case'listener':listeners.get(s.event)?.();break;case'ended_direct':b._onEnded();break;case'ended':audios[s.id-1]._ended?.();break;case'error':audios[s.id-1]._error?.();break;
 case'timer':{const t=timers[s.id-1];assert(t,'timer missing '+c.name);if(t.kind==='timeout')t.active=false;events.push(['fire',s.id]);t.callback();break;}
 case'settle':{const p=promises[s.index];if(!p){assert(s.optional!==false,'missing optional promise');break;}assert(!p.settled);p.settled=true;events.push(['settle',s.index,s.ok]);s.ok?p.resolve():p.reject(Error('injected rejection'));await new Promise(setImmediate);break;}
 case'gains':for(let i=0;i<2;i++)ctx[i?'_bgmGainB':'_bgmGainA']=s.value[i]===null?null:{gain:{value:s.value[i]}};break;default:throw Error(s.kind);}
 const state={cur:b._cur?.id??null,cur_key:b._curKey,vol:b._vol,fade:b._fade,cache:Object.fromEntries(Object.entries(b._cache).map(([k,a])=>[k,a.id])),cache_lru:[...b._cacheLRU],pending:b._pending,bound:b._bound,pending_extra:b._pendingExtra.map(a=>a.id),selection:{last_src:b._lastSrc,bad_srcs:{...b._badSrcs},played_sets:Object.fromEntries(Object.entries(b._playedSets).map(([k,v])=>[k,[...v]])),act_done:{...b._actDone}}};
 const media={audios:audios.map(a=>({id:a.id,src:a.src,preload:a.preload,volume:a.volume,time:a.currentTime,loop:a.loop,onended:!!a.onended,onerror:!!a.onerror,paused:a.paused})),timers:timers.map(({id,kind,ms,active})=>({id,kind,ms,active})),promises:promises.map(({audio,settled})=>({audio,settled})),listeners:[...listeners.keys()],gains:[ctx._bgmGainA?.gain.value??null,ctx._bgmGainB?.gain.value??null]};
 c.expected.push({value,events,state,media});
 }
}
for(const c of cases)await execute(c);
const row=name=>cases.find(c=>c.name===name).expected;
assert.equal(row('t-lock-including-event-keys')[4].state.cur,null);
assert.equal(row('intro-state')[1].state.cur,null);
assert.equal(row('intro-state')[2].state.cur_key,'cutscene_nemesis');
assert.equal(row('stop-keeps-pending-and-listeners')[2].state.pending,'_track');assert.equal(row('stop-keeps-pending-and-listeners')[2].media.listeners.length,5);
assert.equal(row('cache-LRU-preserve-current')[7].state.cur,1);assert.equal(Object.keys(row('cache-LRU-preserve-current')[7].state.cache).length,6);
assert.deepEqual(row('error-current-300ms-next')[1].media.timers,[{id:1,kind:'timeout',ms:300,active:true}]);
assert.equal(row('fade-same-cached-audio-old-handle-inert')[4].media.audios[0].volume,0.3);
assert.equal(row('ended-retains-cached-track-loop-true')[2].media.audios[0].loop,true);assert.equal(row('ended-retains-cached-track-loop-true')[2].state.cur,1);
for(const key of ['death','victory'])assert.equal(row('source-pool-play-'+key)[0].media.audios[0].onended,false);
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),cases};
fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./fixtures/sound_source_bgm_lifecycle_oracle.json',import.meta.url),'{\n"source_ref":'+JSON.stringify(ref)+',\n"source_sha256":'+JSON.stringify(result.source_sha256)+',\n"cases":[\n'+cases.map(c=>JSON.stringify(c)).join(',\n')+'\n]}\n');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0),source_ref:ref,source_sha256:result.source_sha256}));
