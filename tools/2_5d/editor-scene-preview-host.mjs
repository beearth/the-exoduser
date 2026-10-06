/* Detached editor scene -> separately owned, same-origin WebGL preview.
 * This host never writes the editor scene, history, selection, or save state.
 */
export const EDITOR_SCENE_PREVIEW_HOST = Object.freeze({
  completionId:'ROOT-EDITOR-EDITED-SCENE-HOST-20261007',
  labPath:'tools/editor-scene-preview-lab.html',
  timeoutMs:30000, pollMs:100, maxSceneBytes:32000000,
  registration:'EDITOR_SNAPSHOT', mainAccepted:false, nativeAccepted:false
});
const M = Object.freeze({
  idle:'현재 편집 씬을 별도 2.5D 화면에서 확인합니다.',
  admission:'편집 씬이 준비되지 않았거나 지원하는 씬 형식·크기와 다릅니다.',
  busy:'다른 미리보기 또는 보행 시험을 먼저 닫아 주세요.',
  waiting:'편집 씬의 별도 2.5D 화면을 준비 중입니다.',
  active:'현재 편집 씬 · 2.5D 미리보기 · 게임에는 저장되지 않습니다.',
  iframe:'편집 씬 미리보기 화면의 연결을 확인할 수 없습니다.',
  loading:'편집 씬의 2.5D 화면을 준비하지 못했습니다.',
  acknowledgement:'편집 씬 미리보기의 준비 결과를 확인할 수 없습니다.',
  timeout:'편집 씬 미리보기 준비 시간이 초과되었습니다.',
  closed:'편집 씬 미리보기 닫힘 · 편집 데이터는 유지됩니다.',
  replaced:'이전 편집 씬 미리보기 요청을 취소했습니다.',
  disposed:'편집 씬 미리보기 호스트가 종료되었습니다.'
});
function own(value,key) {
  if (!value || (typeof value!=='object' && typeof value!=='function')) throw new Error('미리보기 데이터 계약 오류');
  const descriptor=Object.getOwnPropertyDescriptor(value,key);
  if (!descriptor) return undefined;
  if (!Object.prototype.hasOwnProperty.call(descriptor,'value')) throw new Error('미리보기 접근자 계약 오류');
  return descriptor.value;
}
function jsonCopy(value,seen=new Set(),depth=0) {
  if (value===null || typeof value==='string' || typeof value==='boolean') return value;
  if (typeof value==='number' && Number.isFinite(value)) return value;
  if (!value || typeof value!=='object' || depth>64 || seen.has(value)) throw new Error('미리보기 JSON 데이터 오류');
  const prototype=Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype!==null && Object.getPrototypeOf(prototype)!==null) throw new Error('미리보기 JSON 객체 오류');
  if (own(value,'then')!==undefined || Object.getOwnPropertySymbols(value).length) throw new Error('미리보기 JSON 계약 오류');
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      const result=[];
      for (let i=0;i<value.length;i++) result.push(jsonCopy(own(value,String(i)),seen,depth+1));
      return result;
    }
    const result=Object.create(null);
    for (const key of Object.keys(value)) Object.defineProperty(result,key,{value:jsonCopy(own(value,key),seen,depth+1),enumerable:true,writable:true,configurable:true});
    return result;
  } finally { seen.delete(value); }
}

export function createEditorScenePreviewHost({document:doc=globalThis.document,
  window:win=globalThis.window,core=win?.MapSceneCore,
  timeoutMs=EDITOR_SCENE_PREVIEW_HOST.timeoutMs,pollMs=EDITOR_SCENE_PREVIEW_HOST.pollMs}={}) {
  if (!doc || !win || typeof own(core,'validate')!=='function') throw new Error('편집 씬 호스트 의존성 오류');
  if (!Number.isFinite(timeoutMs)||timeoutMs<100||timeoutMs>60000||!Number.isFinite(pollMs)||pollMs<20||pollMs>1000) throw new Error('편집 씬 대기 범위 오류');
  const url=new URL(EDITOR_SCENE_PREVIEW_HOST.labPath,win.location.href);
  if (url.origin!==win.location.origin || !['http:','https:'].includes(url.protocol)) throw new Error('편집 씬 동일 origin 계약 오류');
  if (new URL(win.location.href).searchParams.get('workspace')==='tiles') return null;
  const previousButton=doc.getElementById('scene-preview-25d');
  if (!previousButton?.parentElement || doc.getElementById('scene-edited-preview-25d')) throw new Error('편집 씬 호스트 UI 충돌');
  const make=(tag,id,text)=>{const el=doc.createElement(tag);if(id)el.id=id;if(text!==undefined)el.textContent=text;return el;};
  const button=make('button','scene-edited-preview-25d','편집 씬 · 2.5D');button.type='button';
  button.title='현재 편집한 이미지 레이어와 보행 길을 별도 화면에서 확인';
  previousButton.parentElement.insertBefore(button,previousButton.nextSibling);
  const status=make('span','scene-edited-preview-status',M.idle);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  Object.assign(status.style,{maxWidth:'45%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'});
  (doc.querySelector('.scene-status')||button.parentElement).appendChild(status);
  let disposed=false,epoch=0,current=null,reason=M.idle,lastCause=null,
    failures=0,cleanupFailures=0,childDisposeAttempts=0;
  const remember=(cause,cleanup=false)=>{lastCause=cause;if(cleanup)cleanupFailures++;else failures++;};
  const setStatus=text=>{reason=text;if(status.children.length===0)status.textContent=text;};
  const currentRecord=r=>!disposed && current===r && !r.retired && !doc.hidden;
  function releaseHeld() {
    // The existing keyup handler clears held input without blur's endDrag/history work.
    for (const key of ['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ']) {
      try {win.dispatchEvent(new win.KeyboardEvent('keyup',{key,bubbles:true}));}
      catch(cause){remember(cause,true);}
    }
  }
  function listen(r,target,type,handler,capture=false) {
    target.addEventListener(type,handler,capture);
    r.cleanups.push(()=>target.removeEventListener(type,handler,capture));
  }
  function later(r,fn,ms) {
    const id=win.setTimeout(()=>{r.timers.delete(id);fn();},ms);r.timers.add(id);return id;
  }
  function frameOwned(r) {
    if (!r.frame || r.frame.contentWindow!==r.child || r.frame.getAttribute('src')!==url.href) return false;
    const location=r.child?.location;
    return !!location && location.origin===url.origin && location.pathname===url.pathname && location.href===url.href;
  }
  function port(r) {
    if (!frameOwned(r)) throw new Error('편집 씬 iframe 소유권 오류');
    const api=own(r.child,'__editorScene25d');
    if (api===undefined) return null;
    if (own(api,'then')!==undefined || own(api,'ready')!==true) throw new Error('편집 씬 API 준비 계약 오류');
    const load=own(api,'loadScene'),snapshot=own(api,'snapshot'),dispose=own(api,'dispose');
    if ([load,snapshot,dispose].some(fn=>typeof fn!=='function')) throw new Error('편집 씬 API 함수 계약 오류');
    return {api,load,snapshot,dispose};
  }
  function disposeChild(r) {
    if (r.childDisposed) return;
    try {
      if (!frameOwned(r)) return;
      const methods=r.port||port(r);
      if (!methods || own(r.child,'__editorScene25d')!==methods.api) return;
      r.childDisposed=true;childDisposeAttempts++;
      const result=methods.dispose.call(methods.api);
      Promise.resolve(result).catch(cause=>remember(cause,true));
    } catch(cause){remember(cause,true);}
  }
  function retire(r,code) {
    if (!r || r.retired) return false;
    r.retired=true;r.pending=false;r.active=false;r.code=code;
    for (const id of r.timers) win.clearTimeout(id);r.timers.clear();
    r.stop({cancelled:true});
    for (const cleanup of r.cleanups.splice(0)) {try{cleanup();}catch(cause){remember(cause,true);}}
    disposeChild(r);
    try{if(r.panel?.open)r.panel.close();}catch(cause){remember(cause,true);}
    try{if(r.frame)r.frame.src='about:blank';r.panel?.remove();}catch(cause){remember(cause,true);}
    releaseHeld();
    if(current===r){current=null;button.disabled=disposed;setStatus(M[code]||M.closed);}
    return true;
  }
  async function managed(r,promise) {
    const result=await Promise.race([Promise.resolve(promise).then(value=>({value}),cause=>{lastCause=cause;return {failed:true,cause};}),r.stopped]);
    if (result.cancelled) throw new Error('편집 씬 요청 취소');
    if (result.failed) throw result.cause;
    return result.value;
  }
  function admit() {
    if (doc.hidden || doc.getElementById('scene-preview-25d-panel')?.open || doc.getElementById('scene-workspace')?.inert) throw new Error('편집 씬 중복/준비 상태');
    const api=own(win,'EXODUSER_SCENE_EDITOR');
    const snapshot=own(api,'snapshot'),player=own(api,'player');
    if (own(api,'ready')!==true || typeof snapshot!=='function' || typeof player!=='function' || player.call(api)!==null) throw new Error('편집 씬 API 준비 상태');
    const source=jsonCopy(snapshot.call(api)),body=JSON.stringify(source);
    const bytes=new TextEncoder().encode(body).byteLength;
    if (bytes===0 || bytes>EDITOR_SCENE_PREVIEW_HOST.maxSceneBytes) throw new Error('편집 씬 UTF8 크기');
    return {scene:core.validate(source),bytes};
  }
  function createFrame(r) {
    const panel=make('dialog','scene-edited-preview-panel'),head=make('header'),title=make('h2','scene-edited-preview-title','현재 편집 씬 · 2.5D'),closeButton=make('button','scene-edited-preview-close','편집기로 돌아가기'),frame=make('iframe','scene-edited-preview-frame');
    r.panel=panel;r.frame=frame;closeButton.type='button';panel.setAttribute('aria-labelledby',title.id);frame.title='현재 편집 씬 2.5D 미리보기';
    Object.assign(panel.style,{width:'min(1600px,96vw)',height:'92vh',maxHeight:'92vh',boxSizing:'border-box',padding:'0',border:'1px solid #9c865b',borderRadius:'12px',background:'#090e10',color:'#e8dcc3'});
    Object.assign(head.style,{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',padding:'12px 18px'});Object.assign(title.style,{margin:'0',font:'600 16px/1.5 sans-serif'});
    Object.assign(closeButton.style,{minHeight:'44px',padding:'5px 16px'});Object.assign(frame.style,{display:'block',width:'100%',height:'calc(100% - 68px)',border:'0',background:'#090e10'});
    head.append(title,closeButton);panel.append(head,frame);doc.body.appendChild(panel);r.child=frame.contentWindow;
    const cancel=()=>retire(r,'closed');
    listen(r,closeButton,'click',cancel);listen(r,panel,'close',cancel);listen(r,panel,'cancel',event=>{event.preventDefault();cancel();});
    const key=event=>{if(currentRecord(r)){event.stopImmediatePropagation();if(event.type==='keydown'&&event.key==='Escape'){event.preventDefault();cancel();}}};
    listen(r,win,'keydown',key,true);listen(r,win,'keyup',key,true);
    listen(r,doc,'visibilitychange',()=>{if(doc.hidden)cancel();});
    listen(r,frame,'error',()=>{remember(new Error('편집 씬 iframe 로드 실패'));retire(r,'iframe');});
    listen(r,frame,'load',()=>{if(!currentRecord(r))return;try{if(!r.loaded&&r.child?.location.href==='about:blank')return;if(!frameOwned(r))throw new Error('편집 씬 iframe 경로 변경');r.loaded=true;}catch(cause){remember(cause);retire(r,'iframe');}});
    panel.showModal();frame.src=url.href;
  }
  function readyPort(r) {
    return new Promise((resolve,reject)=>{
      const poll=()=>{
        if(!currentRecord(r))return resolve(null);
        try {if(r.loaded){const methods=port(r);if(methods)return resolve(methods);}}
        catch(cause){return reject(cause);}
        later(r,poll,pollMs);
      };
      later(r,poll,0);
    });
  }
  function open() {
    if(disposed)return Promise.resolve({entered:false,reason:M.disposed});
    if(doc.getElementById('scene-preview-25d-panel')?.open){setStatus(M.busy);return Promise.resolve({entered:false,reason:M.busy});}
    retire(current,'replaced');
    const r={id:'editor-scene-'+(++epoch),pending:true,active:false,retired:false,code:'admission',timers:new Set(),cleanups:[],loaded:false,childDisposed:false,bytes:0};
    r.stopped=new Promise(resolve=>{r.stop=resolve;});current=r;button.disabled=true;
    const job=(async()=>{
      await Promise.resolve();
      try {
        if(!currentRecord(r))throw new Error('편집 씬 요청 취소');
        const admitted=admit();r.bytes=admitted.bytes;
        releaseHeld();r.code='iframe';setStatus(M.waiting);
        later(r,()=>retire(r,'timeout'),timeoutMs);createFrame(r);
        r.port=await managed(r,readyPort(r));
        if(!currentRecord(r)||!r.port||!frameOwned(r))throw new Error('편집 씬 API 요청 취소');
        r.code='loading';
        await managed(r,r.port.load.call(r.port.api,admitted.scene,{entryId:r.id}));
        if(!currentRecord(r)||!frameOwned(r)||own(r.child,'__editorScene25d')!==r.port.api)throw new Error('편집 씬 준비 뒤 소유권 변경');
        r.code='acknowledgement';
        const state=r.port.snapshot.call(r.port.api),error=own(state,'error');
        if(own(state,'ready')!==true||own(state,'loading')!==false||own(state,'disposed')!==false||own(state,'entryId')!==r.id||(error!==null&&error!==''))throw new Error('편집 씬 준비 ACK 불일치');
        if(!currentRecord(r))throw new Error('편집 씬 ACK 요청 취소');
        for(const id of r.timers)win.clearTimeout(id);r.timers.clear();r.pending=false;r.active=true;setStatus(M.active);
        try{r.child.focus();}catch(cause){remember(cause,true);}
        return {entered:true,entryId:r.id,sceneBytes:r.bytes};
      } catch(cause) {
        remember(cause);const code=r.code;
        if(!r.retired)retire(r,code);
        return {entered:false,reason:M[r.code]||M.loading};
      }
    })();
    r.job=job;return job;
  }
  const onClick=()=>{open().catch(cause=>{remember(cause);if(current)retire(current,'loading');});};
  const onButtonKey=event=>{if(['Enter',' '].includes(event.key))event.stopPropagation();};
  const onPageHide=()=>dispose();
  button.addEventListener('click',onClick);button.addEventListener('keydown',onButtonKey);button.addEventListener('keyup',onButtonKey);win.addEventListener('pagehide',onPageHide);
  function close(){return retire(current,'closed');}
  function dispose(){if(disposed)return false;disposed=true;epoch++;retire(current,'disposed');button.removeEventListener('click',onClick);button.removeEventListener('keydown',onButtonKey);button.removeEventListener('keyup',onButtonKey);win.removeEventListener('pagehide',onPageHide);button.remove();status.remove();return true;}
  return Object.freeze({open,close,dispose,snapshot:()=>Object.freeze({disposed,entryId:current?.id??null,active:current?.active===true,pending:current?.pending===true,ownedTimers:current?.timers.size??0,sceneBytes:current?.bytes??0,childDisposeAttempts,failures,cleanupFailures,reason,timeoutMs,pollMs,registration:EDITOR_SCENE_PREVIEW_HOST.registration,mainAccepted:false,nativeAccepted:false})});
}
