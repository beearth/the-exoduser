import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';
const ref='284d7faf49295b2f5061937a47ce96038032ed3c';
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd:new URL('../../',import.meta.url),maxBuffer:16*1024*1024}).toString();
const helpers=html.slice(html.indexOf('const _SILVERTAIL_VOICE_MAP='),html.indexOf('function _sfxCat('));
const prefix=html.slice(html.indexOf('let _sfxFrameT='),html.indexOf('const _SILVERTAIL_VOICE_MAP='));
const cat=html.slice(html.indexOf('function _sfxCat('),html.indexOf('const _sfxLastT='));
const sample=html.slice(html.indexOf('const _sfxLastT='),html.indexOf('// 거리 기반 사운드:',html.indexOf('const _sfxLastT=')));
const direct=html.slice(html.indexOf('function playVoiceDirect('),html.indexOf('// ── Sample-based audio',html.indexOf('function playVoiceDirect(')));
const tableContext=vm.createContext({});vm.runInContext(helpers,tableContext);
const mapping=JSON.parse(vm.runInContext('JSON.stringify(_SILVERTAIL_VOICE_MAP)',tableContext));
const groups=Object.fromEntries([...helpers.matchAll(/if\(mapped==='([^']+)'\)return _silvertailVariantKey\('[^']+',(\d+)\);/g)].map(x=>[x[1],Number(x[2])]));
if(Object.keys(mapping).length!==42||Object.keys(groups).length!==7)throw Error('source map/variant count mismatch');
const cases=[];const op=(key,now=1000,more={})=>({key,now,char:1,path:'select',rng:[0,0.75],advance_on_rng:0,gx:1,vol:1,rate:1,pri:false,...more});
const add=(name,ops)=>cases.push({name,ops});
for(const [key,mapped] of Object.entries(mapping)){const count=groups[mapped]||1;add('map42-'+key,[...Array.from({length:count},()=>op(key)),op(key,10999),op(key,11000)]);}
for(const char of [0,2,-1])add('other-character-'+char,Object.keys(mapping).map(key=>op(key,1000,{char})));
add('unmapped-exact-keys',['','voice_wakeup','silvertail_wakeup','silvertail_grunt','silvertail_grunt1','silvertail_attack','VOICE_ATTACK','voice_attack ','unknown','__proto__','toString','constructor'].flatMap(key=>[op(key),op(key,1001)]));
for(const [base,count] of Object.entries(groups)){const key=Object.keys(mapping).find(k=>mapping[k]===base);add('eligible-random-'+base,[op(key,0,{rng:[0.999999]}),...Array.from({length:count-1},()=>op(key,0,{rng:[0.5]})),op(key,9999),op(key,10000,{rng:[0.999999]})]);}
for(const [base,keys] of Object.entries(Object.groupBy(Object.keys(mapping),k=>mapping[k]))){if(keys.length>1)add('alias-shared-'+base,keys.map(k=>op(k)));}
add('zero-stamp-nullish-boundary',[op('voice_attack',0),op('voice_bladefuse',9999),op('voice_attack',10000)]);
add('independent-variant-expiries',[op('male_grunt',0,{rng:[0.999999]}),op('male_grunt',100),op('male_grunt',200),op('male_grunt',9999),op('male_grunt',10000),op('male_grunt',10099),op('male_grunt',10100),op('male_grunt',10200)]);
add('stamp-uses-clock-before-rng',[op('male_grunt',1000,{advance_on_rng:500}),op('voice_grunt',10999,{rng:[0.999999]}),op('male_grunt',11000)]);
add('clock-rollback',[op('voice_attack',1000),op('voice_attack',-1),op('voice_attack',10999),op('voice_attack',11000)]);
add('character-switch-retains-state',[op('voice_attack'),op('voice_attack',1001,{char:0}),op('voice_bladefuse',1002),op('silvertail_attack',1003),op('voice_attack',11000)]);
add('sample-gx-drop-still-stamps',[op('voice_attack',1000,{path:'sample',gx:0}),op('voice_bladefuse',1001,{path:'direct'}),op('voice_attack',11000)]);
add('direct-missing-buffer-still-stamps',[op('voice_attack',1000,{path:'direct'}),op('voice_bladefuse',1001,{path:'sample'}),op('voice_attack',11000,{path:'sample'})]);
add('direct-and-sample-share-variants',[op('voice_grunt',1000,{path:'direct'}),op('male_grunt',1001,{path:'sample'}),op('voice_grunt',1002),op('male_grunt',1003,{path:'direct'}),op('voice_grunt',11000,{path:'sample'})]);
add('sample-first-30ms-drop-still-stamps',[op('voice_attack',0,{path:'sample'}),op('voice_attack',30,{path:'sample'}),op('voice_attack',10000,{path:'sample'})]);
add('sample-rng-order-after-selector',[op('male_grunt',1000,{path:'sample',rng:[0.5,0.25],advance_on_rng:5}),op('voice_grunt',1001,{path:'sample',rng:[0.999999,0.75]}),op('male_grunt',1002,{path:'sample'})]);
function execute(c){let current,now,ri;const events=[],selected=[];const math=Object.create(Math);math.random=()=>{if(ri>=current.rng.length)throw Error('unexpected RNG call');const value=current.rng[ri++];events.push(['rng',value]);now+=current.advance_on_rng;return value;};
 const ctx=vm.createContext({Math:math,IS_MOBILE:false,performance:{now(){events.push(['clock',now]);return now;}},_charIdx:1,_gxVolMul:1,_audioBuffers:{},__selected:selected});
 vm.runInContext(prefix+'\n'+helpers+'\n'+cat+'\n'+sample+'\n'+direct,ctx);
 vm.runInContext("const __sourceSelector=_silvertailVoiceKey;_silvertailVoiceKey=function(key){const result=__sourceSelector(key);__selected.push(result);return result;};",ctx);
 c.expected=[];
 for(const step of c.ops){current=step;now=step.now;ri=0;events.length=0;selected.length=0;ctx.__step=step;ctx._charIdx=step.char;ctx._gxVolMul=step.gx;
  if(step.path==='sample')vm.runInContext('playSample(__step.key,__step.vol,__step.rate,__step.pri)',ctx);
  else if(step.path==='direct')vm.runInContext('playVoiceDirect(__step.key,__step.vol,__step.rate)',ctx);
  else vm.runInContext('_silvertailVoiceKey(__step.key)',ctx);
  if(selected.length!==1)throw Error('selector not called exactly once');
  c.expected.push({key:selected[0],events:structuredClone(events),last_at:JSON.parse(vm.runInContext('JSON.stringify(Object.fromEntries(_silvertailVoiceLastAt))',ctx)),queue:JSON.parse(vm.runInContext('JSON.stringify(_sfxQueue)',ctx)),queue_last_t:JSON.parse(vm.runInContext('JSON.stringify(_sfxLastT)',ctx))});
 }
}
for(const c of cases)execute(c);
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),mapping_count:Object.keys(mapping).length,variant_counts:groups,cases};
fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./fixtures/sound_source_voice_selector_oracle.json',import.meta.url),'{\n"source_ref":'+JSON.stringify(result.source_ref)+',\n"source_sha256":'+JSON.stringify(result.source_sha256)+',\n"mapping_count":42,\n"variant_counts":'+JSON.stringify(groups)+',\n"cases":[\n'+cases.map(c=>JSON.stringify(c)).join(',\n')+'\n]}\n');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0),source:ref}));
