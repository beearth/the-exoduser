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
 const ctx=vm.createContext({$:id=>nodes[id],_selectedCharDisplay:null,_curBg:null,_TL:x=>x,_lobbyAncestorName:()=> '묘왕 바르칸',_lobbyAncestorCaption:()=> '전대 소환',CHAR_VISUALS:[{job:'전사',idleVid:'old-warrior.mp4'},{job:'블레이드 댄서',portrait:'old-silvertail.png'}]});
 vm.runInContext(update+swap,ctx);return{nodes,update:ctx._updateCharDisplay};
}
test('selecting any slot retains the named summoned ancestor with independent media',()=>{
 const {nodes:n,update}=setup();
 for(const [charIdx,job] of [[0,'전사'],[1,'블레이드 댄서']]){
  update({name:'테스트',charIdx});
  assert.match(n.lobbyBgImg.style.backgroundImage,/lobby_varkan_crypt_poster_v1\.webp/);
  assert.equal(n.lobbyBgImg.style.visibility,'');assert.equal(n.charDispTitle.textContent,'묘왕 바르칸');assert.equal(n.charDispSub.textContent,'전대 소환');assert.equal(n.enterGameBtn.disabled,false);
  assert.equal(n.lobbyCharPreview.src,undefined);assert.equal(n.lobbyCharPreview.onerror,null);assert.equal(n.lobbyCharPreview.paused,true);assert.equal(n.lobbyCharKeyart.src,undefined);
 }
});
test('clearing a slot leaves the ancestor visible and disables entry',()=>{
 const {nodes:n,update}=setup();update({name:'테스트',charIdx:0});update();
 assert.equal(n.enterGameBtn.disabled,true);assert.match(n.lobbyBgImg.style.backgroundImage,/lobby_varkan_crypt_poster_v1\.webp/);assert.equal(n.charDispTitle.textContent,'묘왕 바르칸');assert.equal(n.charDispSub.textContent,'전대 소환');
});
test('sprite pingpong stays within the atlas and returns without a pose jump',()=>{
 const ctx=vm.createContext({window:{},document:{readyState:'loading',addEventListener(){}}});
 vm.runInContext(readFileSync(new URL('../lobby-ancestor-sprite.js',import.meta.url),'utf8'),ctx);
 const {frameAt,placement,art}=ctx.window.LobbyAncestorSprite;
 assert.equal(frameAt(0),0);assert.equal(frameAt(23/12),23);assert.equal(frameAt(24/12),22);assert.equal(frameAt(46/12),0);
 for(let i=0;i<46;i++)assert.ok(frameAt((i+.001)/12)>=0&&frameAt((i+.001)/12)<24);
 for(const [w,h]of [[1920,1080],[2160,720],[960,540]]){
  const p=placement(w,h);assert.ok(p.left>=0);assert.ok(p.left+p.width<=w*(w<=1100?.55:.65));assert.ok(p.top>=0);assert.ok(p.top+p.height<h);assert.ok(Math.abs(p.top+p.height*art.baseline/art.height-p.footY)<.01);
 }
});
test('initial language refresh runs before the delayed DOM helper is initialized',()=>{
 const fn=html.slice(html.indexOf('function _refreshLobbyCardsLanguage()'),html.indexOf('function _lobbyCardLeaf'));
 const ctx=vm.createContext({document:{getElementById:()=>({querySelectorAll:()=>[]})}});
 assert.doesNotThrow(()=>vm.runInContext(fn+';_refreshLobbyCardsLanguage();const $=()=>{};',ctx));
});
