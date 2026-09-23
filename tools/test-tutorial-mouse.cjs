const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');
for(const file of ['game.html','game-easy-test.html']){
 const html=fs.readFileSync(file,'utf8'),c=fixture();
 const create=c.document.createElement;
 c.document.createElement=tag=>{const el=create(tag);el.listeners={};el.addEventListener=(type,fn)=>{(el.listeners[type]??=[]).push(fn)};return el};
 const handlers={};Object.assign(c,{MBjust:{},_gpActive:false,_gpInjHeld:{},_BOOTH_MODE:false,_setMousePosition(){},_setMouseFacing(){},listeningBind:false,$:()=>null,addEventListener:(type,fn)=>{handlers[type]=fn}});
 const start=html.indexOf("addEventListener('mousedown',e=>{\n  // [sticky-keys]");
 const end=html.indexOf("addEventListener('auxclick'",start);
 assert.ok(start>=0&&end>start);vm.runInContext(html.slice(start,end),c);
 vm.runInContext(html.slice(html.indexOf('function _chkAct('),html.indexOf('// Q키 얼음보주 모드')),c);
 const l=c.window._parryLesson;assert.equal(l.tick(),true);assert.ok(c.document.body.children.includes(l.panel));
 function dispatch(type,button,onPanel=false){
  const target=onPanel?l.panel:l.backdrop.style.pointerEvents==='none'?{id:'game',closest:()=>null}:l.backdrop;
  let stopped=false;const e={button,target,preventDefault(){},stopPropagation(){stopped=true}};
  for(const fn of target.listeners?.[type]||[])fn(e);
  if(!stopped)handlers[type](e);
 }
 dispatch('mousedown',0);assert.equal(c.isAct('weapon'),false,'intro still pauses attacks');
 l.button.onclick();
 for(const [step,button,action] of [[-2,0,'weapon'],[-1,2,'beam']]){
  l.step=step;l.phase='practice';l.focusTicks=0;
  dispatch('mousedown',button);assert.equal(c.isHeld(action),true,'game click must reach actual mouse input gate');
  dispatch('mouseup',button);assert.equal(c.isHeld(action),false);
  dispatch('mousedown',button,true);assert.equal(c.isHeld(action),false,'panel click must not fire an attack');
 }
 l.skipAll();assert.equal(l.backdrop.removed,true);assert.equal(l.panel.removed,true);
 dispatch('mousedown',0);assert.equal(c.isAct('weapon'),true);
 dispatch('mousedown',2);assert.equal(c.isHeld('beam'),true);
}
console.log('PASS: actual game mouse handlers receive left/right practice clicks, release clears input, panel clicks stay isolated, intro pauses and skip restores attacks.');
