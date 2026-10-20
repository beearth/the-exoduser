import fs from 'node:fs';import vm from 'node:vm';import cp from 'node:child_process';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const ref='e556b617190c325ca39f5add04357f5dea5ca87e',cwd=new URL('../../',import.meta.url);
const html=cp.execFileSync('git',['show',ref+':game.html'],{cwd,maxBuffer:16*1024*1024}).toString();
const mix=html.slice(html.indexOf('let _mbus=null,'),html.indexOf('// ── Helpers ──',html.indexOf('let _mbus=null,')));
const synthesis=html.slice(html.indexOf('function _r(v,s)'),html.indexOf('let _beamOsc=null,'));
const cases=[],op=(kind,more={})=>({kind,...more}),call=(helper,args,more={})=>op('helper',{helper,args,...more});const add=(name,ops,more={})=>cases.push({name,ops,...more});
for(const gain of [0,0.6,1])add('mix-'+gain,[op('mbus'),op('gain',{value:1-gain}),op('mbus'),op('mbus')],{gain});
add('tone-default-and-end-zero',[call('tone',[1800,.03,'sine',.025,2400]),op('ended',{id:1}),op('timer',{id:1}),call('tone',[220,.1,'',.1,0,0]),op('timer',{id:2}),op('timer',{id:2})]);
add('tone-omitted-end',[call('tone',[400,.1,'triangle',.2])]);
add('noise-original-PCM',[call('noise',[.03,4000,.015,6000,.002,'bandpass']),op('ended',{id:1}),op('timer',{id:1})]);
add('noise-44100-float32',[call('noise',[.03,4000,.015,10,0,''])],{sample_rate:44100});
add('dist-curve-and-falsy',[call('dist',[55,.25,'',.08,12,0]),op('timer',{id:1}),call('dist',[100,.1,'square',.1,0,50]),op('ended',{id:14})]);
add('fm-mod-start-order',[call('fm',[500,100,300,.06,.05,'sine',7]),op('ended',{id:3}),op('timer',{id:1}),call('fm',[400,120,200,.1,.1,'',0])]);
add('sub-8Hz-no-random',[call('sub',[35,.3,.15,6]),op('ended',{id:1}),op('timer',{id:1}),call('sub',[70,.2,.1,0])]);
for(const helper of ['tone','noise','dist','fm','sub'])add('cap-before-'+helper,[call(helper,[])],{maximum:0});
for(const helper of ['tone','noise','dist','fm','sub']){
 const args={tone:[100,.1,'sine',.1,200],noise:[.01,1000,.1,20],dist:[100,.1,'square',.1,10,30],fm:[100,50,20,.1,.1,'sine',10],sub:[50,.1,.1,4]}[helper];
 for(const fail of ['start','stop'])add(helper+'-'+fail+'-failure',[call(helper,args,{fail})]);
}
add('shared-active-cap-and-recovery',[call('sub',[50,.1,.1]),call('tone',[100,.1,'sine',.1]),call('fm',[]),op('timer',{id:1}),call('fm',[500,100,300,.06,.05])],{maximum:2});
const rng=[0,.25,.5,.75,.999999];
function execute(c){let events=[],step,failed=false,rngIndex=0;const nodes=[],buffers=[],timers=[];let ctx;
 const normal=v=>ArrayBuffer.isView(v)?Array.from(v):v;
 class Node {constructor(kind){this.id=nodes.length+1;this.kind=kind;this.params={};this._ended=null;nodes.push(this);events.push(['create',kind,this.id]);for(const name of ['gain','frequency','Q','threshold','knee','ratio','attack','release'])Object.defineProperty(this,name,{value:{set value(v){this.node.params[this.name]=v;events.push(['set',this.node.id,this.name,normal(v)]);},get value(){return this.node.params[this.name]},node:this,name,setValueAtTime(v,t){events.push(['auto',this.node.id,this.name,'set',v,t]);},linearRampToValueAtTime(v,t){events.push(['auto',this.node.id,this.name,'linear',v,t]);},exponentialRampToValueAtTime(v,t){events.push(['auto',this.node.id,this.name,'exponential',v,t]);}}});for(const name of ['type','curve','oversample','buffer'])Object.defineProperty(this,name,{set(v){this.params[name]=name==='buffer'?v.id:normal(v);events.push(['set',this.id,name,this.params[name]]);},get(){return this.params[name]}});}
 connect(target){events.push(['connect',this.id,target.id??target.node.id,target.name??'']);}disconnect(){events.push(['disconnect',this.id]);}
 start(t){events.push(['start',this.id,t]);if(step.fail==='start'&&!failed){failed=true;throw Error('injected:start')}}
 stop(t){events.push(['stop',this.id,t??null]);if(step.fail==='stop'&&!failed){failed=true;throw Error('injected:stop')}}
 set onended(v){this._ended=v;events.push(['onended',this.id,!!v])}get onended(){return this._ended}
 }
 const context={destination:{id:0},currentTime:5.25,sampleRate:c.sample_rate??1000,createOscillator:()=>new Node('oscillator'),createGain:()=>new Node('gain'),createBiquadFilter:()=>new Node('filter'),createDynamicsCompressor:()=>new Node('compressor'),createWaveShaper:()=>new Node('waveshaper'),createBufferSource:()=>new Node('buffer_source'),createBuffer(ch,len,rate){assert.equal(ch,1);const b={id:buffers.length+1,rate,data:new Float32Array(len),getChannelData(){return this.data}};buffers.push(b);events.push(['buffer',b.id,len,rate]);return b;}};
 ctx=vm.createContext({actx:()=>context,sfxVol(){const v=ctx.__gain;events.push(['sfx',v]);return v;},setTimeout(callback,ms){const id=timers.length+1;timers.push({id,ms,callback,fired:false});events.push(['timeout',id,ms]);return id;},Math:Object.assign(Object.create(Math),{random(){const v=rng[rngIndex++%rng.length];events.push(['rng',v]);return v;}})});ctx.__gain=c.gain??0.6;vm.runInContext('let _activeNodeCnt=0;const _MAX_ACTIVE_NODES='+JSON.stringify(c.maximum??48)+';\n'+mix+'\n'+synthesis,ctx);
 c.expected=[];
 for(const s of c.ops){step=s;failed=false;events=[];let error=null;
 try{switch(s.kind){case'mbus':vm.runInContext('mbus()',ctx);break;case'gain':ctx.__gain=s.value;break;case'helper':ctx.__args=s.args;vm.runInContext(({tone:'playTone',noise:'playNoise',dist:'playDist',fm:'playFM',sub:'playSub'}[s.helper])+'(...__args)',ctx);break;case'ended':nodes[s.id-1]?.onended?.();break;case'timer':{const t=timers[s.id-1];assert(t,c.name+' timer missing');t.fired=true;events.push(['fire',s.id]);t.callback();break;}default:throw Error(s.kind);}}
 catch(e){error=e.message;}
 c.expected.push(JSON.parse(JSON.stringify({error,events,state:{active:vm.runInContext('_activeNodeCnt',ctx),nodes:nodes.map(n=>({id:n.id,kind:n.kind,params:n.params,onended:!!n.onended})),buffers:buffers.map(b=>({id:b.id,rate:b.rate,data:Array.from(b.data)})),timers:timers.map(({id,ms,fired})=>({id,ms,fired}))}})));
 }
}
for(const c of cases)execute(c);assert.equal(cases.find(c=>c.name==='tone-start-failure').expected[0].state.active,0);assert.equal(cases.find(c=>c.name==='noise-original-PCM').expected[2].state.active,0);
// 실제 _playSampleNow + mbus의 이중 sfxVol 경로를 따로 실행. 기존 backend 배선 완료의 증거는 아님.
const sample_gains=[];
const sampleBlock=html.slice(html.indexOf('let _sfxFrameT=0;'),html.indexOf('function _sfxFrameReset()'));
const skillBlock=html.slice(html.indexOf('const _SKILL_SFX_KEYS='),html.indexOf('const _sfxLastT='));
const sfxStart=html.indexOf('function sfxVol()'),sfxDefinition=html.slice(sfxStart,html.indexOf('\n',sfxStart));
for(const option of [0,0.6,1]){
 const gains=[];const node=()=>({gain:{value:1},frequency:{value:0},Q:{value:0},threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0},playbackRate:{value:1},connect(){},disconnect(){},start(){},stop(){}});
 const context={destination:{},createBufferSource:node,createGain(){const n=node();gains.push(n);return n;},createBiquadFilter:node,createDynamicsCompressor:node};
 const ctx=vm.createContext({IS_MOBILE:false,OPT:{sfxVol:option*100},actx:()=>context,_audioBuffers:{heavy_hit:{duration:2}},performance:{now:()=>100},setTimeout(){}});
 vm.runInContext(sfxDefinition+'\n'+sampleBlock+'\n'+skillBlock+'\n'+mix,ctx);const src=vm.runInContext("_playSampleNow('heavy_hit',0,0,0,0)",ctx),master=vm.runInContext('_mbus.gain.value',ctx),voice=gains[0].gain.value;
 sample_gains.push({option,voice,master,product:voice*master,rate:src.playbackRate.value});
}
assert.equal(sample_gains[1].product,0.36);
const result={source_ref:ref,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),sample_gains,cases};fs.mkdirSync(new URL('./fixtures/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./fixtures/sound_source_mix_oracle.json',import.meta.url),JSON.stringify(result)+'\n');if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({cases:cases.length,steps:cases.reduce((n,c)=>n+c.ops.length,0)}));
