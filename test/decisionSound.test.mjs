import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=()=>{const p=new URL('../decision-sound.js',import.meta.url);assert.ok(fs.existsSync(p),'중요 결정 사운드 런타임이 필요하다');return fs.readFileSync(p,'utf8')};
function boot(search='?ddung=2',settings={opt:{sfxVol:60}}){
 let now=0;const timers=[],starts=[],gains=[];const eventListeners={};
 class Param{value=1;setValueAtTime(v){this.value=v}cancelScheduledValues(){}linearRampToValueAtTime(v){this.value=v}}
 class Node{gain=new Param();frequency=new Param();connect(){return this}disconnect(){}start(t){starts.push(t)}stop(){}addEventListener(){}}
 class Context{currentTime=0;state='running';destination=new Node();createGain(){const n=new Node();gains.push(n);return n}createBufferSource(){return new Node()}createOscillator(){return new Node()}createBiquadFilter(){return new Node()}createMediaElementSource(){return new Node()}decodeAudioData(){return Promise.resolve({duration:1.8})}resume(){return Promise.resolve()}}
 const win={AudioContext:Context,location:{search},localStorage:{getItem:()=>JSON.stringify(settings)},performance:{now:()=>now},URLSearchParams,fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}),setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout:()=>{},addEventListener:(n,fn)=>{eventListeners[n]=fn},console};win.window=win;win.globalThis=win;vm.runInNewContext(source(),win);return {api:win.DecisionSound,starts,gains,timers,advance(ms){now+=ms;for(const t of timers.splice(0))t.fn()}};
}
test('비교 후보는 1~3만 허용하고 기본값은 1이다',()=>{assert.equal(boot('?ddung=3').api.candidate,3);assert.equal(boot('?ddung=99').api.candidate,1);assert.equal(boot('').api.candidate,1)});
test('확정음은 활성 재생 중 연타를 버리고 끝난 뒤 다음 결정을 허용한다',async()=>{const h=boot();await h.api.ready;assert.equal(h.api.play('create'),true);assert.equal(h.api.play('create'),false);assert.equal(h.api.play('enter'),false);assert.equal(h.starts.length,1);h.advance(2100);assert.equal(h.api.play('delete'),true);assert.equal(h.starts.length,2)});
test('효과음 0 설정이면 출력과 덕킹을 시작하지 않는다',async()=>{const h=boot('',{opt:{sfxVol:0}});await h.api.ready;assert.equal(h.api.play('create'),false);assert.equal(h.starts.length,0);assert.equal(h.timers.length,0)});
test('BGM 덕킹은 별도 gain으로 -6dB 뒤 0.8초에 복구해 원본 음량을 보존한다',async()=>{const h=boot();await h.api.ready;const music={volume:.65};h.api.attachMusic(music);assert.equal(h.api.play('create'),true);assert.ok(h.gains.some(n=>Math.abs(n.gain.value-Math.pow(10,-6/20))<1e-6));music.volume=.3;const restore=h.timers.find(t=>t.ms===800);assert.ok(restore);restore.fn();assert.equal(music.volume,.3);assert.ok(h.gains.some(n=>n.gain.value===1))});
