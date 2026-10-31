/* Keep existing modal actions, gamepad polling, binding capture and audio ownership. */
(() => {
  'use strict';
  if(window.__webUiuxReady)return;
  window.__webUiuxReady=true;
  const panelIds = ['settings','invPanel','forge','statPanel','skillPanel','storagePanel'];
  const overlayIds = ['gcModal','crBagPop','skSlotPop','nextDiffPop','introKeys','parryLesson','tutorialBadgeCollection','demoEnd','death','lvUpScreen','stageClear','tutorial','introDiff'];
  const custom = '#tutorial,.panel-nav-tab,.inv-slot,.inv-eq-slot,.set-choice,.sf-btn,.fg-tab,.fg-i,.sf-orb,.sk-pop-tab,.sk-opt,.up-row,.stat-btn,.passive-row,.inv-item,.inv-cell,.inv-cr-item,.inv-dep-item,.inv-exp-btn,.set-key,.id-btn,[data-sk-id],[onclick]';
  const isCustom = node => node.matches(custom) && !node.matches('button,input,select,textarea,a,summary,.locked,.dis,[aria-disabled="true"]') && (typeof node.onclick==='function' || (node.matches('.sf-orb')&&node.tabIndex>=0));
  const focusable = 'button,input,select,textarea,summary,a[href],[tabindex]';
  const origins = new WeakMap();
  let active = null, pending = false, tipSource = null, tipTitle = null;
  const visible = node => {
    if (!node?.isConnected || node.closest('[hidden],[inert],[aria-hidden="true"]') || !node.getClientRects().length) return false;
    for (let current=node; current instanceof Element; current=current.parentElement) {
      const s=getComputedStyle(current);
      if (s.display==='none' || s.visibility==='hidden' || (Number(s.opacity)===0 && !current.matches('.panel.on'))) return false;
    }
    return true;
  };
  const controls = root => [root,...root.querySelectorAll(focusable)].filter(node => !node.matches(':disabled') && node.tabIndex>=0 && visible(node));
  function initialControl(root) {
    const items=controls(root),cancel=root.id==='gcModal'&&document.getElementById('gcCancel');
    return cancel&&items.includes(cancel)?cancel:items[0];
  }
  function topModal() {
    const nodes=[...panelIds,...overlayIds].map(id=>document.getElementById(id)).filter(node=>visible(node) && getComputedStyle(node).pointerEvents!=='none');
    return nodes.sort((a,b)=>(Number(getComputedStyle(a).zIndex)||0)-(Number(getComputedStyle(b).zIndex)||0)).at(-1) || null;
  }
  function prepare(root) {
    if(root.id==='tutorial' && typeof root.onclick==='function') {root.tabIndex=0;root.setAttribute('role','button');}
    root.querySelectorAll(custom).forEach(node=>{
      if(!isCustom(node))return;
      if (!node.hasAttribute('tabindex')) node.tabIndex=0;
      if (!node.hasAttribute('role')) node.setAttribute('role','button');
    });
    if (panelIds.includes(root.id) && !root.hasAttribute('role')) {
      root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
      const title=root.querySelector('.ptitle[id]');if(title)root.setAttribute('aria-labelledby',title.id);
    }
  }
  function sync() {
    pending=false;
    placeGuides();
    const next=topModal();
    if (next) prepare(next);
    if (next===active) {
      if(next && !next.contains(document.activeElement)) initialControl(next)?.focus({preventScroll:true});
      return;
    }
    hideTip();
    const previous=active;
    const previousOrigin=previous && origins.get(previous);
    if(previous && !visible(previous)) {
      if(previousOrigin && visible(previousOrigin) && (!next || next.contains(previousOrigin))) previousOrigin.focus({preventScroll:true});
      origins.delete(previous);
    }
    active=next;
    if(next) {
      if(!origins.has(next)) origins.set(next,visible(document.activeElement)?document.activeElement:previousOrigin);
      if(!next.contains(document.activeElement)) initialControl(next)?.focus({preventScroll:true});
    }
  }

  function placeGuides() {
    const status=document.getElementById('mmLvl');
    if(!status)return;
    const root=document.documentElement;
    const statusRect=status.getBoundingClientRect();
    const hudRects=['globeHP','globeMP','skBar'].map(id=>document.getElementById(id)).filter(node=>node&&getComputedStyle(node).display!=='none').flatMap(node=>[node,node.querySelector('.globe-glass')].filter(Boolean)).map(node=>node.getBoundingClientRect()).filter(rect=>rect.height>0);
    const top=Math.ceil(statusRect.bottom+16);
    const bottom=Math.ceil(Math.max(16,...hudRects.map(rect=>innerHeight-rect.top+16)));
    for(const [name,value] of [['--web-ui-guide-top',top],['--web-ui-guide-bottom',bottom]]){
      const next=value+'px';if(root.style.getPropertyValue(name)!==next)root.style.setProperty(name,next);
    }
  }

  function schedule() { if(!pending){pending=true;requestAnimationFrame(sync);} }
  const tip=document.createElement('div');tip.id='webUiuxTooltip';tip.hidden=true;tip.setAttribute('role','tooltip');
  function hideTip(){
    if(tipSource){if(tipSource.getAttribute('title')==='')tipSource.setAttribute('title',tipTitle);const ids=(tipSource.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==tip.id);if(ids.length)tipSource.setAttribute('aria-describedby',ids.join(' '));else tipSource.removeAttribute('aria-describedby');}
    tipSource=null;tipTitle=null;tip.hidden=true;
  }
  function showTip(source){
    const text=source?.title || (source===tipSource?tipTitle:'');
    if(!source || !visible(source) || !text?.trim()){hideTip();return;}
    // Existing item/skill preview cards own their richer content.
    if(source.closest('#invGrid,.inv-eq-slot,#qsRow,.sf-slot'))return;
    hideTip();tipSource=source;tipTitle=text;source.setAttribute('title','');tip.textContent=text;tip.hidden=false;
    const ids=new Set((source.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add(tip.id);source.setAttribute('aria-describedby',[...ids].join(' '));
    const r=source.getBoundingClientRect(),t=tip.getBoundingClientRect();
    const gutter=Math.max(0,(innerWidth-Math.min(innerWidth,innerHeight*16/9))/2);
    tip.style.left=Math.max(gutter+16,Math.min(r.left,innerWidth-gutter-t.width-16))+'px';
    tip.style.top=Math.max(8,r.bottom+t.height+12>innerHeight?r.top-t.height-8:r.bottom+8)+'px';
  }
  function init(){
    document.body.append(tip);
    // Observe modal roots, rather than the game canvas/HUD updates on every frame.
    const observer=new MutationObserver(schedule);
    const watch=node=>observer.observe(node,{attributes:true,attributeFilter:['class','style','hidden'],childList:true,subtree:true});
    [...panelIds,...overlayIds].forEach(id=>{const node=document.getElementById(id);if(node)watch(node);});
    new MutationObserver(changes=>{let changed=false;for(const change of changes)for(const node of change.addedNodes)if(node instanceof Element && [...panelIds,...overlayIds].includes(node.id)){watch(node);changed=true;}if(changed)schedule();}).observe(document.body,{childList:true});
    document.addEventListener('keydown',event=>{
      const modal=topModal();if(!modal || event.isComposing || event.keyCode===229)return;
      if(typeof listeningBind!=='undefined' && listeningBind)return;
      if(event.key==='Escape'){
        hideTip();
        const backId={demoEnd:'demoEndLobby',death:'toLobbyBtn',lvUpScreen:'lvUpClose'}[modal.id];
        const back=backId&&document.getElementById(backId);
        if(back && visible(back) && !back.disabled){event.preventDefault();event.stopPropagation();if(!event.repeat)back.click();}
        else if(modal.id==='tutorial' && typeof modal.onclick==='function'){event.preventDefault();event.stopPropagation();if(!event.repeat)modal.click();}
        return;
      }
      if(modal.id==='gcModal' && event.repeat && (event.key==='Enter'||event.key===' ') && event.target instanceof Element && event.target.closest('#gcOk,#gcCancel')){
        event.preventDefault();event.stopPropagation();return;
      }
      prepare(modal);
      if(event.key==='Tab'){
        const items=controls(modal);if(!items.length)return;
        const index=items.indexOf(document.activeElement),step=event.shiftKey?-1:1;
        const next=index<0?(event.shiftKey?items.length-1:0):(index+step+items.length)%items.length;
        event.preventDefault();event.stopPropagation();items[next].focus({preventScroll:true});return;
      }
      const target=event.target instanceof Element?event.target:null;
      if(!target || !modal.contains(target))return;
      if(isCustom(target) && (event.key==='Enter'||event.key===' ')){
        event.preventDefault();event.stopPropagation();if(!event.repeat)target.click();return;
      }
      // Native buttons/ranges/selects retain default activation and adjustment.
      // Bubbling stops before the game's window listener records combat keys.
      if(target.matches('button,input,select,textarea,summary,a[href]') && ['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))event.stopPropagation();
    });
    document.addEventListener('focusin',event=>showTip(event.target.closest?.('[title]')));
    document.addEventListener('focusout',hideTip);
    document.addEventListener('pointerover',event=>{const source=event.target.closest?.('[title]');if(source!==tipSource)showTip(source);});
    document.addEventListener('pointerout',event=>{if(tipSource&&!tipSource.contains(event.relatedTarget))hideTip();});
    document.addEventListener('pointerdown',hideTip);
    addEventListener('resize',()=>{hideTip();schedule();},{passive:true});
    document.addEventListener('scroll',hideTip,true);
    document.addEventListener('transitionend',schedule);
    document.addEventListener('animationend',schedule);
    const geometry=new ResizeObserver(schedule);
    ['mmLvl','globeHP','globeMP','skBar'].forEach(id=>{const node=document.getElementById(id);if(node)geometry.observe(node);});
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
