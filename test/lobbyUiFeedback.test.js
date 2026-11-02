import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../lobby-ui-feedback.js',import.meta.url),'utf8');
function setup(volume=60){const events={},played=[];let time=1000;const doc={hidden:false,addEventListener(t,f){events[t]=f}};const ctx={clearTimeout(){},document:doc,localStorage:{getItem(){return JSON.stringify({opt:{sfxVol:volume}})}},Audio:class{constructor(src){this.src=src}play(){played.push({src:this.src,volume:this.volume});return Promise.resolve()}},performance:{now:()=>time},setTimeout:f=>f()};vm.runInNewContext(source,ctx);return {events,played,advance(){time+=100}};}
function button(extra={}){const b={disabled:false,id:'visualCancelBtn',isConnected:true,matches(){return false},classList:{contains(){return false}},getClientRects(){return[{}]},closest(){return this},...extra};return b;}
test('lobby pointer hover uses the existing Unity-mapped sample once per control',()=>{const x=setup();assert.equal(typeof x.events.pointerover,'function');const b=button();x.events.pointerover({target:b});x.advance();x.events.pointerover({target:b});assert.equal(x.played.length,1);assert.equal(x.played[0].src,'sfx/ui/button_hover.mp3');assert.equal(x.played[0].volume,.36);});
test('lobby confirm honors effect volume and never sounds for disabled or own-sound controls',()=>{const x=setup();assert.equal(typeof x.events.click,'function');x.events.click({target:button({disabled:true})});x.events.click({target:button({id:'enterGameBtn'})});assert.equal(x.played.length,0);x.events.click({target:button()});assert.equal(x.played[0].src,'sfx/ui/button_confirm.mp3');assert.equal(x.played[0].volume,.21);});
test('muted lobby stays silent and touch hover does not make a sound',()=>{const x=setup(0);assert.equal(typeof x.events.click,'function');x.events.click({target:button()});assert.equal(x.played.length,0);const y=setup();y.events.pointerover({target:button(),pointerType:'touch'});assert.equal(y.played.length,0);});

test('authored Steam and title entry confirms never double play, while title hover still sounds',()=>{const x=setup();const b=button({dataset:{uiOwnSound:'true'}});x.events.click({target:b});assert.equal(x.played.length,0);x.events.pointerover({target:b});assert.equal(x.played[0].src,'sfx/ui/button_hover.mp3');});

test('공유 확인창에서 삭제 두둥만 일반 클릭을 생략하고 종료 확인 클릭은 보존한다',()=>{const x=setup();const modal={dataset:{decisionSound:'delete'}};const b=button({id:'delConfirmYes',closest(selector){return selector==='#delConfirmModal'?modal:this}});x.events.click({target:b});assert.equal(x.played.length,0);x.advance();modal.dataset.decisionSound='';x.events.click({target:b});assert.equal(x.played.length,1);assert.equal(x.played[0].src,'sfx/ui/button_confirm.mp3');});

test('Web Audio가 있으면 매 호버마다 새 버퍼 소스로 겹쳐 재생하고 멈춘 컨텍스트를 깨운다',async()=>{
  const events={},started=[];let time=1000,resumed=0;
  class Ctx{constructor(){this.state='suspended';this.destination={};}resume(){resumed++;return Promise.resolve();}decodeAudioData(){return Promise.resolve({decoded:true});}
    createBufferSource(){const s={connect(){},start(){started.push(s)}};return s;}createGain(){return {gain:{value:0},connect(){}};}}
  const ctx={document:{hidden:false,addEventListener(t,f){events[t]=f}},localStorage:{getItem(){return JSON.stringify({opt:{sfxVol:60}})}},AudioContext:Ctx,
    setTimeout,clearTimeout,fetch:()=>Promise.resolve({arrayBuffer:()=>Promise.resolve(new ArrayBuffer(1))}),Audio:class{play(){throw new Error('HTMLAudio 경로 사용 금지')}},performance:{now:()=>time}};
  vm.runInNewContext(source,ctx);await new Promise(r=>setTimeout(r,0));
  const a=button({id:'a'}),b=button({id:'b'});
  events.pointerover({target:a});time+=40;events.pointerover({target:b});time+=40;events.pointerover({target:a});
  assert.equal(started.length,3);assert.ok(resumed>=1);
});

test('쿨다운 안에 옮겨 간 항목도 그 위에 머물면 쿨다운 뒤 소리가 난다',()=>{
  const x=setup();const a=button({id:'a'}),b=button({id:'b'});
  x.events.pointerover({target:a});x.events.pointerover({target:b});
  assert.equal(x.played.length,2);
});
