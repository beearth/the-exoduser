import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const update=html.slice(html.indexOf('function _updateCharDisplay(s)'),html.indexOf('// 로비 배경 preload'));
const swap=html.slice(html.indexOf('function _swapLobbyBg(stage)'),html.indexOf('// ── 로비 mid-',html.indexOf('function _swapLobbyBg(stage)')));
function setup(){
 const nodes={};
 for(const id of ['enterGameBtn','charDispEmpty','charDispTitle','charDispSub','lobbyCharPreview','lobbyCharKeyart','lobbyBgImg']){
  const classes=new Set();
  nodes[id]={style:{},src:'old-art.png',onerror:()=>{},classList:{add:(...a)=>a.forEach(x=>classes.add(x)),remove:(...a)=>a.forEach(x=>classes.delete(x)),contains:x=>classes.has(x)},removeAttribute(k){delete this[k]},pause(){this.paused=true},load(){}};
 }
 const ctx=vm.createContext({$:id=>nodes[id],_selectedCharDisplay:null,_curBg:null,_TL:x=>x,CHAR_VISUALS:[{job:'전사',idleVid:'old-warrior.mp4'},{job:'블레이드 댄서',portrait:'old-silvertail.png'}]});
 vm.runInContext(update+swap,ctx);return{nodes,update:ctx._updateCharDisplay};
}
test('selecting any slot retains the new ancestor and the selected name/job',()=>{
 const {nodes:n,update}=setup();
 for(const [charIdx,job] of [[0,'전사'],[1,'블레이드 댄서']]){
  update({name:'테스트',charIdx});
  assert.match(n.lobbyBgImg.style.backgroundImage,/lobby_ancestor_shoulder_v4\.png/);
  assert.equal(n.lobbyBgImg.style.visibility,'');assert.equal(n.charDispTitle.textContent,'테스트');assert.equal(n.charDispSub.textContent,job);assert.equal(n.enterGameBtn.disabled,false);
  assert.equal(n.lobbyCharPreview.src,undefined);assert.equal(n.lobbyCharPreview.onerror,null);assert.equal(n.lobbyCharPreview.paused,true);assert.equal(n.lobbyCharKeyart.src,undefined);
 }
});
test('clearing a slot leaves the ancestor visible and disables entry',()=>{
 const {nodes:n,update}=setup();update({name:'테스트',charIdx:0});update();
 assert.equal(n.enterGameBtn.disabled,true);assert.match(n.lobbyBgImg.style.backgroundImage,/lobby_ancestor_shoulder_v4\.png/);assert.equal(n.charDispTitle.textContent,'당신은 누구인가');assert.equal(n.charDispSub.textContent,'');
});
