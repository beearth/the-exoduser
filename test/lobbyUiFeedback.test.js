import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../lobby-ui-feedback.js',import.meta.url),'utf8');
function setup(volume=60){const events={},played=[];let time=1000;const doc={hidden:false,addEventListener(t,f){events[t]=f}};const ctx={document:doc,localStorage:{getItem(){return JSON.stringify({opt:{sfxVol:volume}})}},Audio:class{constructor(src){this.src=src}play(){played.push({src:this.src,volume:this.volume});return Promise.resolve()}},performance:{now:()=>time},setTimeout:f=>f()};vm.runInNewContext(source,ctx);return {events,played,advance(){time+=100}};}
function button(extra={}){const b={disabled:false,id:'visualCancelBtn',isConnected:true,matches(){return false},classList:{contains(){return false}},getClientRects(){return[{}]},closest(){return this},...extra};return b;}
test('lobby pointer hover uses the existing Unity-mapped sample once per control',()=>{const x=setup();assert.equal(typeof x.events.pointerover,'function');const b=button();x.events.pointerover({target:b});x.advance();x.events.pointerover({target:b});assert.equal(x.played.length,1);assert.equal(x.played[0].src,'sfx/ui/button_hover.mp3');assert.equal(x.played[0].volume,.15);});
test('lobby confirm honors effect volume and never sounds for disabled or own-sound controls',()=>{const x=setup();assert.equal(typeof x.events.click,'function');x.events.click({target:button({disabled:true})});x.events.click({target:button({id:'enterGameBtn'})});assert.equal(x.played.length,0);x.events.click({target:button()});assert.equal(x.played[0].src,'sfx/ui/button_confirm.mp3');assert.equal(x.played[0].volume,.21);});
test('muted lobby stays silent and touch hover does not make a sound',()=>{const x=setup(0);assert.equal(typeof x.events.click,'function');x.events.click({target:button()});assert.equal(x.played.length,0);const y=setup();y.events.pointerover({target:button(),pointerType:'touch'});assert.equal(y.played.length,0);});

test('authored Steam and title entry confirms never double play, while title hover still sounds',()=>{const x=setup();const b=button({dataset:{uiOwnSound:'true'}});x.events.click({target:b});assert.equal(x.played.length,0);x.events.pointerover({target:b});assert.equal(x.played[0].src,'sfx/ui/button_hover.mp3');});

test('공유 확인창에서 삭제 두둥만 일반 클릭을 생략하고 종료 확인 클릭은 보존한다',()=>{const x=setup();const modal={dataset:{decisionSound:'delete'}};const b=button({id:'delConfirmYes',closest(selector){return selector==='#delConfirmModal'?modal:this}});x.events.click({target:b});assert.equal(x.played.length,0);x.advance();modal.dataset.decisionSound='';x.events.click({target:b});assert.equal(x.played.length,1);assert.equal(x.played[0].src,'sfx/ui/button_confirm.mp3');});
