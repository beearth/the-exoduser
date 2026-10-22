import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';
const ref='91e2774b769869e59f80953e148a5c95203b0fea';
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd:new URL('../../',import.meta.url),maxBuffer:16*1024*1024}).toString();
const start=html.indexOf('const BGM={');const bgm=html.slice(start,html.indexOf('\nconst C=',start));
const chapters=html.slice(html.indexOf('const CHAPTER_STAGES='),html.indexOf('// ── 데모 잠금',html.indexOf('const CHAPTER_STAGES=')));
const si=html.slice(html.indexOf('const SI_TO_HELL='),html.indexOf('// 대표맵=',html.indexOf('const SI_TO_HELL=')));
const legacy=html.slice(html.indexOf('const BGM_MAP='),html.indexOf('\nlet _bgmCtx=',html.indexOf('const BGM_MAP=')));
function context(random){const c=vm.createContext({Math:Object.assign(Object.create(Math),{random}),OPT:{bgmTrack:'auto'},G:{stage:1,on:true,_cutsceneDone:true},clearInterval(){}});vm.runInContext(chapters+'\n'+si+'\n'+bgm+'\n'+legacy,c);return c;}
const base=context(()=>0);
const catalog=JSON.parse(vm.runInContext('JSON.stringify({tracks:BGM.tracks,legacy_bgm_map:BGM_MAP,si_to_hell:Array.from(SI_TO_HELL)})',base));
const allKeys=['hell1','hell2','hell3','hell4','hell5','hell6','hell7','gameplay'];const all=allKeys.flatMap(k=>catalog.tracks[k]||[]);
if(Object.keys(catalog.tracks).length!==19||catalog.tracks.gameplay.length!==50||all.length!==57||catalog.si_to_hell.length!==35)throw Error('source catalog counts');
fs.mkdirSync(new URL('../data/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../data/sound_source_bgm.json',import.meta.url),JSON.stringify(catalog,null,2)+'\n');
const op=(kind,key,more={})=>({kind,...(key===undefined?{}:{key}),rng:[0.25],...more});const cases=[];const add=(name,ops,more={})=>cases.push({name,ops,...more});
for(const key of Object.keys(catalog.tracks))add('pool-'+key,[op('random',key),op('random',key)]);
add('all-57-weighted-entries',Array.from({length:57},(_,i)=>op('all',undefined,{rng:[(i+0.25)/57]})));
add('all-35-stage-keys',Array.from({length:35},(_,i)=>op('stage',undefined,{si:i})));
add('act-key-exact',['hell1','hell2','hell3','hell4','hell5','hell6','hell7','hell0','hell8','hell01','hell10','Hell1','hell1x','hell1\n','hell1\r','hell1\u2028','gameplay','','__proto__'].map(k=>op('is_act',k)));
for(let i=1;i<=7;i++){const key='hell'+i;add('act-first-reentry-'+key,[op('enter',key),op('act',key),op('all',undefined,{rng:[0.25,0.999999]}),op('enter',key)]);}
add('act-switch-keeps-other-set',[op('enter','hell1'),op('enter','hell2'),op('enter','hell1')]);
add('unknown-and-empty',[op('random','missing'),op('act','missing'),op('mixed','missing'),op('random','empty'),op('act','empty')],{tracks:{empty:[],gameplay:['fallback']}});
add('all-bad-return-null',[op('random','gameplay'),op('all'),op('act','hell1'),op('mixed','hell1'),op('enter','hell2')],{bad:[...new Set(all)]});
const sole=catalog.tracks.hell7[0];add('all-single-still-RNG',[op('last',undefined,{src:sole}),op('all')],{bad:[...new Set(all)].filter(x=>x!==sole)});
const victory=catalog.tracks.victory;add('random-single-skips-RNG',[op('last',undefined,{src:victory[1]}),op('random','victory')],{bad:[victory[0]]});
add('random-retry-prefix',[op('last',undefined,{src:catalog.tracks.forge[0]}),op('random','forge',{rng:[0,0,0.999999]})]);
add('long-retry-no-attempt-cap',[op('last',undefined,{src:catalog.tracks.forge[0]}),op('random','forge',{rng:[...Array(257).fill(0),0.999999]})]);
add('all-last-retry',[op('last',undefined,{src:all[0]}),op('all',undefined,{rng:[0,0.999999]})]);
const mixed=[...catalog.tracks.hell1,...catalog.tracks.gameplay];const second=mixed.indexOf(mixed[0],1);
add('mixed-duplicate-weight-and-retry',[op('last',undefined,{src:mixed[0]}),op('mixed','hell1',{rng:[0,(second+0.25)/mixed.length,0.999999]})]);
add('mixed-single-still-RNG',[op('last',undefined,{src:'only'}),op('mixed','hell1')],{tracks:{hell1:['only'],gameplay:[]}});
add('act-single-still-RNG',[op('last',undefined,{src:catalog.tracks.hell1[0]}),op('act','hell1')]);
add('act-set-counts-unique-paths',[op('act','hell1'),op('act','hell1'),op('reset','hell1'),op('act','hell1')],{tracks:{hell1:['dup','dup'],gameplay:[]}});
add('act-last-retry-and-no-last-write',[op('last',undefined,{src:'a'}),op('act','hell1',{rng:[0,0.75]}),op('act','hell1',{rng:[0]}),op('act','hell1')],{tracks:{hell1:['a','b'],gameplay:[]}});
add('played-bad-path-remains-in-set',[op('act','hell1',{rng:[0]}),op('bad',undefined,{src:'a'}),op('act','hell1')],{tracks:{hell1:['a','b'],gameplay:[]}});
add('missing-act-falls-back-mixed',[op('enter','hell1')],{tracks:{gameplay:['fallback']}});
add('bad-filter-retains-order',[op('random','forge'),op('mixed','hell2'),op('all')],{bad:[catalog.tracks.forge[0],catalog.tracks.gameplay[0],catalog.tracks.hell1[0]]});
add('helpers-do-not-write-last',[op('random','forge'),op('all'),op('mixed','hell2'),op('act','hell3')]);
function execute(c){let step,index;const events=[];const ctx=context(()=>{if(index>=step.rng.length)throw Error(c.name+' '+step.kind+': unexpected RNG call');const r=step.rng[index++];events.push(r);return r;});ctx.__case=c;vm.runInContext("if(__case.tracks)BGM.tracks=__case.tracks;for(const src of (__case.bad||[]))BGM._badSrcs[src]=1;BGM._getAudio=function(src){__selected=src;return {volume:0,currentTime:0,loop:false,onended:null,pause(){},play(){return {catch(){}}}};};",ctx);
 c.expected=[];
 for(const s of c.ops){step=s;index=0;events.length=0;ctx.__step=s;ctx.__selected=null;let value=null;
  switch(s.kind){case'random':value=vm.runInContext('BGM._pickRandom(__step.key)',ctx);break;case'all':value=vm.runInContext('BGM._pickAllRandom()',ctx);break;case'act':value=vm.runInContext('BGM._pickActFirst(__step.key)',ctx);break;case'mixed':value=vm.runInContext('BGM._pickMixed(__step.key)',ctx);break;case'last':vm.runInContext('BGM._lastSrc=__step.src',ctx);break;case'bad':vm.runInContext('BGM._badSrcs[__step.src]=1',ctx);break;case'reset':vm.runInContext('BGM._playedSets[__step.key]=new Set();BGM._actDone[__step.key]=false',ctx);break;case'enter':vm.runInContext('BGM.play(__step.key)',ctx);value=ctx.__selected;break;case'is_act':value=vm.runInContext('BGM._isActKey(__step.key)',ctx);break;case'stage':value=vm.runInContext('BGM.stageKey(__step.si)',ctx);break;default:throw Error(s.kind);}
  const state=JSON.parse(vm.runInContext('JSON.stringify({last_src:BGM._lastSrc,bad_srcs:BGM._badSrcs,played_sets:Object.fromEntries(Object.entries(BGM._playedSets).map(([k,s])=>[k,[...s]])),act_done:BGM._actDone})',ctx));c.expected.push({value,events:[...events],state});
 }
}
for(const c of cases)execute(c);
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),catalog,all_random_entries:all,cases};
fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./fixtures/sound_source_bgm_oracle.json',import.meta.url),'{\n"source_ref":'+JSON.stringify(ref)+',\n"source_sha256":'+JSON.stringify(result.source_sha256)+',\n"catalog":'+JSON.stringify(catalog)+',\n"all_random_entries":'+JSON.stringify(all)+',\n"cases":[\n'+cases.map(c=>JSON.stringify(c)).join(',\n')+'\n]}\n');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0),pools:19,gameplay:50,all:57,stages:35}));
