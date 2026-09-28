import test from 'node:test';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('only the post-cinematic login hides the redundant brand, preserving normal login',()=>{
 assert.match(html,/#mainWrap\.cinematic-handoff #loginSection \.login-brand\{display:none\}/);
 assert.match(html,/<div class="login-brand" style="text-align:center">/);
 assert.match(html,/function _goLogin\(\{fromCinematic=false\}=\{\}\)/);
 assert.ok(html.includes("$('mainWrap').classList.toggle('cinematic-handoff',fromCinematic)"));
});
test('movie completion marks the login handoff while replay clears it',()=>{
 const finish=html.slice(html.indexOf('function finishCin(){'),html.indexOf('// 인트로 비디오:'));
 assert.equal((finish.match(/_goLogin\(\{fromCinematic:true\}\)/g)||[]).length,2);
 const replay=html.slice(html.indexOf('function _goCinematic(){'),html.indexOf('async function _goLobby('));
 assert.ok(replay.includes("$('mainWrap').classList.remove('show','cinematic-handoff')"));
});

const stopCode=html.slice(html.indexOf('function _stopHover(){'),html.indexOf('// 입장 버튼',html.indexOf('function _stopHover(){')));
function hoverContext(){
 const timers=[];const audio=()=>({stops:0,disconnects:0,stop(){this.stops++},disconnect(){this.disconnects++}});const first=audio(),gain={...audio(),gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}};
 const ctx=vm.createContext({_hoverSrc:first,_hoverGain:gain,_hoverCtx:{currentTime:0},setTimeout:fn=>timers.push(fn)});vm.runInContext(stopCode,ctx);return{ctx,first,gain,timers,audio};
}
test('hover stop completes on the old audio nodes after references are cleared',()=>{
 const s=hoverContext();s.ctx._stopHover();assert.equal(s.ctx._hoverSrc,null);s.timers[0]();assert.equal(s.first.stops,1);assert.equal(s.first.disconnects,1);assert.equal(s.gain.disconnects,1);
});
test('an old hover fade cannot stop a newly started hover source',()=>{
 const s=hoverContext();s.ctx._stopHover();const next=s.audio();s.ctx._hoverSrc=next;s.timers[0]();assert.equal(s.first.stops,1);assert.equal(next.stops,0);assert.equal(s.ctx._hoverSrc,next);
});
for(const route of ['_goLogin','_goCinematic'])test(route+' stops hover audio and repeated gamepad vibration',()=>{
 const s=hoverContext(),nodes={};const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},querySelector:()=>null});s.ctx.$=id=>id==='_langPop'?null:(nodes[id]||(nodes[id]=element()));s.ctx.document={querySelector:element};s.ctx.window={};s.ctx._LOBBY_BUILD='full';s.ctx._cinPreview=false;s.ctx._emberIv=null;s.ctx._characterLoadSeq=0;s.ctx._GP={loop:true,vibLoopStop(){this.loop=false}};
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading','_clearVidTimers','stopLobbyBgm','playCinematic','_updateCharDisplay'])s.ctx[name]=()=>{};
 vm.runInContext(html.slice(html.indexOf('function _goLogin('),html.indexOf('async function _goLobby(')),s.ctx);s.ctx[route]();assert.equal(s.ctx._GP.loop,false);assert.equal(s.ctx._hoverSrc,null);s.timers[0]();assert.equal(s.first.stops,1);
});
for(const route of ['_goLogin','_goCinematic'])test(route+' is safe before hover audio initialization',()=>{
 const nodes={};const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},querySelector:()=>null});const ctx=vm.createContext({$:id=>id==='_langPop'?null:(nodes[id]||(nodes[id]=element())),document:{querySelector:element},window:{},_LOBBY_BUILD:'full',_cinPreview:false,_emberIv:null,_characterLoadSeq:0,_GP:{vibLoopStop(){}}});
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading','_clearVidTimers','stopLobbyBgm','playCinematic','_updateCharDisplay'])ctx[name]=()=>{};
 assert.doesNotThrow(()=>vm.runInContext(stopCode+html.slice(html.indexOf('function _goLogin('),html.indexOf('async function _goLobby('))+';'+route+'();let _hoverSrc=null,_hoverGain=null,_hoverCtx=null;',ctx));
});
