import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function setup(axis){
 const els={};let calls=0;
 const document={activeElement:null,querySelector:()=>null};
 for(const id of ['delConfirmModal','delConfirmMsg','delConfirmYes','delConfirmNo'])els[id]={style:{},isConnected:true,handlers:{},addEventListener(type,handler){this.handlers[type]=handler;},focus(){document.activeElement=this;},click(){return this.onclick?.();}};
 const ctx=vm.createContext({document,$:id=>els[id],_TL:s=>s,setStatus(){},_GP:{axes:[axis,0],prev:{}}});
 const code=html.slice(html.indexOf('let _delConfirmCb=null;'),html.indexOf('// ── 가상 키보드'));
 const branch=html.slice(html.indexOf("  const delM = $('delConfirmModal');"),html.indexOf('  // 생성 모달이 열려있으면'));
 vm.runInContext(code+';function step(just){'+branch+'}',ctx);
 ctx._showDelConfirm('',()=>{calls++;},'Quit the game?');
 return {ctx,els,document,calls:()=>calls};
}
test('held left stick cannot arm quit confirmation on opening',()=>{
 const h=setup(-1);h.ctx.step({});assert.equal(h.document.activeElement,h.els.delConfirmNo);
 h.ctx.step({0:true});assert.equal(h.calls(),0);assert.equal(h.els.delConfirmModal.style.display,'none');
});
test('neutral then fresh left input can deliberately confirm',async()=>{
 const h=setup(-1);h.ctx._GP.axes[0]=0;h.ctx.step({});h.ctx._GP.axes[0]=-1;h.ctx.step({});
 assert.equal(h.document.activeElement,h.els.delConfirmYes);h.ctx.step({0:true});await Promise.resolve();assert.equal(h.calls(),1);
});

for(const key of ['Enter',' '])test('confirmation ignores held '+JSON.stringify(key),()=>{
 const h=setup(0);let prevented=false,stopped=false;
 h.els.delConfirmModal.handlers.keydown({key,repeat:true,preventDefault(){prevented=true},stopPropagation(){stopped=true}});
 assert.equal(prevented,true);assert.equal(stopped,true);assert.equal(h.calls(),0);
 let freshPrevented=false;h.els.delConfirmModal.handlers.keydown({key,repeat:false,preventDefault(){freshPrevented=true},stopPropagation(){}});assert.equal(freshPrevented,false);
});

test('quit dialog returns focus to power control after gamepad activation',()=>{
 const h=setup(0);h.ctx._hideDelConfirm();
 const power={isConnected:true,focus(){h.document.activeElement=this;}};h.els.lobbyQuitBtn=power;
 const previous={isConnected:true,focus(){h.document.activeElement=this;}};previous.focus();
 h.ctx._lobbyLang=()=> 'ko';
 vm.runInContext(html.slice(html.indexOf('function _showLobbyQuit(){'),html.indexOf('// ── 커스텀 삭제 확인 모달')),h.ctx);
 h.ctx._showLobbyQuit();h.ctx._hideDelConfirm();assert.equal(h.document.activeElement,power);
});

for(const [index,mode] of ['online','local'].entries())test(mode+' delete cancel restores the programmatically clicked control',()=>{
 const h=setup(0);h.ctx._hideDelConfirm();
 const trigger={isConnected:true,focus(){h.document.activeElement=this;}};
 const old={isConnected:true,focus(){h.document.activeElement=this;}};old.focus();
 h.ctx.e={currentTarget:trigger,stopPropagation(){}};
 const needle="div.querySelector('.char-del').addEventListener('click',e=>{";
 let start=-1;for(let i=0;i<=index;i++)start=html.indexOf(needle,start+1);
 const prefix=html.slice(start+needle.length,html.indexOf('_showDelConfirm(',start));
 vm.runInContext(prefix+'_showDelConfirm("sample",()=>{});',h.ctx);h.ctx._hideDelConfirm();
 assert.equal(h.document.activeElement,trigger);
});
