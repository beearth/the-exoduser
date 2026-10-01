import {sources} from './source-data.js';
import {createHost} from './harness.js';
const get=id=>document.getElementById(id);
let ui;
let blockedActions=0;
let cssState='미연결';
function report() {
  if(!ui)return;
  const active=document.activeElement;
  get('status').textContent=JSON.stringify({scope:'DOM-only, 게임/레이아웃/패드 PASS 아님',source:get('source').value,sha256:sources[get('source').value].sourceSha256,version:get('version').value,language:get('language').value,css:cssState,active:active?.id||active?.className||active?.tagName,activeConnected:active?.isConnected,inlineVisibility:ui.nodes.invRight.style.visibility,computedVisibility:getComputedStyle(ui.nodes.invRight).visibility,blockedActions},null,2);
}
function reset() {
  ui=createHost(document,get('mount'),sources[get('source').value],get('version').value,get('language').value);
  report();
}
function toggleCss() {
  const link=get('production-css');
  if(get('css-toggle').checked) {
    cssState='로딩 중';
    if(!link.getAttribute('href'))link.href=new URL('../../../../../inventory-space.css',import.meta.url).href;
    link.disabled=false;
    if(link.sheet)cssState='연결';
  } else {link.disabled=true;cssState='미연결';}
  report();
}
get('production-css').onload=()=>{cssState=get('css-toggle').checked?'연결':'미연결';report();};
get('production-css').onerror=()=>{cssState='로딩 실패';report();};
get('css-toggle').onchange=toggleCss;
get('reset').onclick=reset;
get('hover').onclick=()=>{ui.api._invClearHover();report();};
get('rerender').onclick=()=>{ui.render();report();};
get('remove').onclick=()=>{ui.env.INV.bag=[];ui.render();report();};
for(const id of ['hover','rerender','remove'])get(id).onmousedown=event=>event.preventDefault();
get('mount').addEventListener('click',event=>{
  if(!event.target.closest('[onclick]'))return;
  event.preventDefault();event.stopImmediatePropagation();blockedActions++;report();
},true);
get('mount').addEventListener('contextmenu',event=>{event.preventDefault();event.stopImmediatePropagation();blockedActions++;report();},true);
document.addEventListener('focusin',()=>queueMicrotask(report));
document.addEventListener('keyup',()=>queueMicrotask(report));
window.nativeFocusHost=Object.freeze({get current(){return ui;},report,hover(){ui.api._invClearHover();report();},rerender(){ui.render();report();},remove(){ui.env.INV.bag=[];ui.render();report();},toggleCss});
reset();
