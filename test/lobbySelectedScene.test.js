import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const fn=html.slice(html.indexOf('function _updateCharDisplay(s)'),html.indexOf('// 로비 배경 preload'));
function setup(){
  const nodes={};
  for(const id of ['lobby','enterGameBtn','charDispEmpty','charDispTitle','charDispSub','charDispDetail','lobbyCharPreview','lobbyCharKeyart','lobbyBgImg']){
    const classes=new Set();nodes[id]={style:{},src:'',loads:0,pauses:0,
      classList:{add:(...a)=>a.forEach(x=>classes.add(x)),remove:(...a)=>a.forEach(x=>classes.delete(x)),contains:x=>classes.has(x)},
      getAttribute(k){return this[k]},removeAttribute(k){this[k]=''},pause(){this.pauses++;this.paused=true},load(){this.loads++},play(){this.paused=false;return Promise.resolve()}};
  }
  const ctx=vm.createContext({$:id=>nodes[id],_selectedCharDisplay:null,_TL:x=>x,_lobbyAncestorName:()=>'묘왕 바르칸',_lobbyAncestorCaption:()=>'선대 소환체',_lobbyAncestorDetail:()=>'플레이어가 소환하는 선대의 영체',_lobbyDemoCharacterName:()=>'대검전사',_swapLobbyBg(){},CHAR_VISUALS:[{idleVid:'warrior.mp4?v=1',poster:'warrior.jpg',portrait:'warrior.png',job:'전사',idleRate:.75},{portrait:'silvertail.png',job:'블레이드 댄서'}]});
  vm.runInContext(fn,ctx);return{nodes,ctx,update:ctx._updateCharDisplay};
}
test('unselected lobby displays the ancestor and disables entry',()=>{
  const {nodes:n,update}=setup();update();
  assert.equal(n.charDispTitle.textContent,'묘왕 바르칸');assert.equal(n.charDispSub.textContent,'선대 소환체');assert.equal(n.charDispDetail.textContent,'플레이어가 소환하는 선대의 영체');assert.equal(n.enterGameBtn.disabled,true);assert.ok(!n.lobby.classList.contains('has-selected-character'));
});
test('selecting a saved character displays its own image, name, and job',()=>{
  const {nodes:n,update}=setup();update({name:'실버',charIdx:1});
  assert.equal(n.lobbyCharKeyart.src,'silvertail.png');assert.ok(n.lobbyCharKeyart.classList.contains('show'));assert.equal(n.charDispTitle.textContent,'실버');assert.equal(n.charDispSub.textContent,'블레이드 댄서');assert.equal(n.charDispDetail.textContent,'');assert.ok(n.lobby.classList.contains('has-selected-character'));assert.equal(n.enterGameBtn.disabled,false);
});
test('selected warrior uses its existing idle video with a matching poster',()=>{
  const {nodes:n,update}=setup();update({name:'DEMO CHARACTER',charIdx:0});
  assert.equal(n.charDispTitle.textContent,'대검전사');assert.equal(n.lobbyCharPreview.src,'warrior.mp4?v=1');assert.equal(n.lobbyCharPreview.poster,'warrior.jpg');assert.equal(n.lobbyCharPreview.playbackRate,.75);assert.ok(n.lobbyCharPreview.classList.contains('show'));assert.equal(n.lobbyCharKeyart.src,'warrior.jpg');
});
test('failed video falls back to the same character image',()=>{
  const {nodes:n,update}=setup();update({name:'전사',charIdx:0});n.lobbyCharPreview.onerror();
  assert.ok(!n.lobbyCharPreview.classList.contains('show'));assert.ok(n.lobbyCharKeyart.classList.contains('show'));assert.equal(n.lobbyCharKeyart.src,'warrior.jpg');assert.equal(n.charDispTitle.textContent,'전사');assert.ok(n.lobby.classList.contains('has-selected-character'));
});
test('failed poster falls back to the selected character portrait',()=>{
  const {nodes:n,update}=setup();update({name:'전사',charIdx:0});n.lobbyCharKeyart.onerror();assert.equal(n.lobbyCharKeyart.src,'warrior.png');
});
test('late failure from a previous selection cannot replace the new character',()=>{
  const {nodes:n,update}=setup();update({name:'전사',charIdx:0});const old=n.lobbyCharPreview.onerror;update({name:'실버',charIdx:1});old();
  assert.equal(n.lobbyCharPreview.src,'');assert.equal(n.lobbyCharKeyart.src,'silvertail.png');assert.equal(n.charDispTitle.textContent,'실버');
});
test('refreshing selected labels preserves video playback',()=>{
  const {nodes:n,ctx,update}=setup();const slot={name:'전사',charIdx:0};update(slot);n.lobbyCharPreview.currentTime=2.5;const loads=n.lobbyCharPreview.loads;ctx._TL=()=> 'Warrior';update(slot);
  assert.equal(n.charDispSub.textContent,'Warrior');assert.equal(n.lobbyCharPreview.currentTime,2.5);assert.equal(n.lobbyCharPreview.loads,loads);
});
test('clearing selection unloads character media and restores the ancestor',()=>{
  const {nodes:n,update}=setup();update({name:'전사',charIdx:0});const old=n.lobbyCharPreview.onerror;update();old();
  assert.equal(n.lobbyCharPreview.src,'');assert.equal(n.lobbyCharPreview.poster,'');assert.equal(n.lobbyCharPreview.onerror,null);assert.equal(n.lobbyCharKeyart.src,'');assert.ok(!n.lobby.classList.contains('has-selected-character'));assert.equal(n.charDispTitle.textContent,'묘왕 바르칸');assert.equal(n.enterGameBtn.disabled,true);
});
