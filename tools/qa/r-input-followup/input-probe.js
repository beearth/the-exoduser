// Local QA only. Evaluate in the game's main realm; never included by production HTML.
(() => {
  if(window.__rInputProbe)throw Error('Probe already installed');
  const original={update,isJust,isHeld,pickupItem}, events=[],trials=[];
  let active=null,raf=0,disposed=false;
  const state=()=>({t:performance.now(),frame:G.frame,K:!!K[BINDS.interact],KH:!!KH[BINDS.interact],on:G.on,paused:G.paused,focus:document.hasFocus(),hidden:document.hidden,bag:INV.bag.length});
  const log=(kind,extra={})=>{if(active&&events.length<30000)events.push({trial:active.id,kind,...state(),...extra});};
  const key=e=>{if(e.code===BINDS.interact||e.code===BINDS2.interact)log(e.type,{code:e.code,key:e.key,trusted:e.isTrusted,repeat:e.repeat,composing:e.isComposing,target:e.target?.tagName,eventTimestamp:e.timeStamp});};
  window.addEventListener('keydown',key);window.addEventListener('keyup',key);
  update=function(...args){log('update-start');try{return original.update.apply(this,args);}finally{log('update-end');}};
  isJust=function(action){const before=action==='interact'?state():null;const value=original.isJust(action);if(before)log('edge',{value,before});return value;};
  isHeld=function(action){const value=original.isHeld(action);if(action==='interact')log('held',{value});return value;};
  pickupItem=function(item){const result=original.pickupItem(item);log('pickup',{name:item.name,result,own:!!item._rInputQA});return result;};
  const tick=ts=>{if(disposed)return;log('raf',{rafTimestamp:ts});raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
  const cleanupItems=()=>{for(let i=worldItems.length-1;i>=0;i--)if(worldItems[i].item?._rInputQA)worldItems.splice(i,1);for(let i=INV.bag.length-1;i>=0;i--)if(INV.bag[i]._rInputQA)INV.bag.splice(i,1);};
  const api={events,trials,
    arm(label,count=1){
      if(active)throw Error('Finish previous trial');cleanupItems();
      const id=trials.length+1;
      active={id,label,fpsCap:OPT.fpsCap,start:state(),count,bind:BINDS.interact,bind2:BINDS2.interact,filter:{rarity:OPT.minPickRar,level:OPT.minPickLvTier},position:{x:P.x,y:P.y},cam:{...G.cam},initialBag:INV.bag.length};
      for(let i=0;i<count;i++){const item=mkItem('ring1',1,0,3);item.name='R QA '+id+'-'+i;item._rInputQA=true;_wiPush({x:P.x+90+i*4,y:P.y-35,type:'item',item,picked:false});}
      log('arm',{count});return active;
    },
    async finish(){await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));log('finish');const t=active;active=null;t.end=state();t.picked=INV.bag.filter(i=>i._rInputQA).length;t.remaining=worldItems.filter(w=>w.item?._rInputQA&&!w.picked).length;trials.push(t);return t;},
    // Explicitly synthetic/untrusted DOM fixtures. They are not timed physical key input.
    async synthetic(duration,count=1){api.arm('synthetic-'+duration,count);document.dispatchEvent(new KeyboardEvent('keydown',{key:'r',code:BINDS.interact,bubbles:true}));if(duration>0)await new Promise(resolve=>setTimeout(resolve,duration));document.dispatchEvent(new KeyboardEvent('keyup',{key:'r',code:BINDS.interact,bubbles:true}));return await api.finish();},
    result(){return {kind:'actual-game-input-observation',trials,events,limits:['Timed fixtures use untrusted DOM events; native tool trials are separately labelled.','Only QA-tagged fixture drops/bag entries are cleaned. No natural drop probability measurement.']};},
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);update=original.update;isJust=original.isJust;isHeld=original.isHeld;pickupItem=original.pickupItem;cleanupItems();delete window.__rInputProbe;return {restored:true,events:events.length,trials:trials.length};}
  };
  window.__rInputProbe=api;return {installed:true,state:state()};
})();
