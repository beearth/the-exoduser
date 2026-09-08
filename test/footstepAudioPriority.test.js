import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function setup(){
 const sources=[];
 const audio={currentTime:1,createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},start(){s.started=true},stop(){s.stopped=true}};sources.push(s);return s;},createGain(){return {gain:{value:1},connect(){},disconnect(){}}}};
 const ctx=vm.createContext({IS_MOBILE:false,_audioBuffers:{footstep:{duration:.3},footstep2:{duration:2},flat_hit:{duration:1}},_isSkillSfx:()=>false,actx:()=>audio,mbus:()=>({}),sfxVol:()=>1,performance:{now:()=>1000+sources.length},setTimeout(){},_silvertailVoiceKey:k=>k,_gxVolMul:1,_sfxLastT:{},_deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,SFX:{},_actx:null,_sfxCat:k=>k});
 vm.runInContext(html.slice(html.indexOf('let _sfxFrameT='),html.indexOf('const _SILVERTAIL_VOICE_MAP=')),ctx);
 vm.runInContext(html.slice(html.indexOf('function playSample('),html.indexOf('// 거리 기반 사운드:',html.indexOf('function playSample('))),ctx);
 return {ctx,sources,run:s=>vm.runInContext(s,ctx)};
}
test('footsteps remain playable with the HIT channel full',()=>{
 const {run}=setup();run("_playSampleNow('flat_hit',1,1);_playSampleNow('flat_hit',1,1);_playSampleNow('flat_hit',1,1)");
 assert.equal(run("!!_playSampleNow('footstep',.3,1)"),true);
 assert.equal(run("!!_playSampleNow('footstep2',.3,1)"),true);
 assert.equal(run("!!_playSampleNow('flat_hit',1,1)"),false);
});
test('overlapping footsteps replace their own oldest tail and remain capped at two',()=>{
 const {run,sources}=setup();for(let i=0;i<3;i++)run("_playSampleNow('footstep2',.3,1)");
 assert.equal(sources[0].stopped,true);assert.equal(run('_activeNodes.length'),2);
 sources[0].onended();assert.equal(run('_activeNodes.length'),2);
});
test('footsteps survive a crowded frame queue',()=>{
 const {run,sources}=setup();
 run("for(let i=0;i<8;i++){_audioBuffers['hit'+i]={duration:1};_sfxQueue.push({key:'hit'+i,vol:1,rate:1});}playSample('footstep',.3,1);_sfxFrameReset()");
 assert.ok(sources.some(s=>s.buffer.duration===.3&&s.started));
});
