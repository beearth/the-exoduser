// Important decisions only. Ordinary navigation keeps the existing UI feedback.
(function(global){
  'use strict';
  const selected=new URLSearchParams(global.location.search).get('ddung');
  const candidate=/^[123]$/.test(selected||'')?Number(selected):1;
  let context=null,output=null,busyUntil=0,getVolume=null,duckBus=null;
  const buffers={},music=new Map();
  function audio(){
    if(context)return context;
    const Constructor=global.AudioContext||global.webkitAudioContext;
    if(!Constructor)return null;
    context=new Constructor();output=context.createGain();output.connect(context.destination);
    return context;
  }
  function volume(){
    try{
      const value=getVolume?getVolume():JSON.parse(global.localStorage.getItem('hellcave_settings')||'{}').opt?.sfxVol??60;
      return Number.isFinite(Number(value))?Math.max(0,Math.min(100,Number(value)))/100:.6;
    }catch{return .6;}
  }
  const ready=Promise.all(['normal','dark'].map(async kind=>{
    try{
      const c=audio();if(!c)return;
      const response=await global.fetch('sfx/ui/decision/ddung_'+candidate+(kind==='dark'?'_dark':'')+'.wav');
      if(!response.ok)return;
      buffers[kind]=await c.decodeAudioData(await response.arrayBuffer());
    }catch{/* A missing file falls back to two controlled low impacts. */}
  }));
  function attachMusic(element){
    try{
      const c=audio();if(!c||!element||music.has(element))return;
      const source=c.createMediaElementSource(element),gain=c.createGain();
      source.connect(gain);gain.connect(c.destination);music.set(element,gain);
    }catch{/* Existing music routing remains authoritative. */}
  }
  function detachMusic(element){
    const gain=music.get(element);if(gain){gain.disconnect();music.delete(element);}
  }
  function duck(){
    const amount=Math.pow(10,-6/20);
    for(const gain of music.values())gain.gain.setValueAtTime(amount,context.currentTime);
    if(duckBus)duckBus(amount);
    global.setTimeout(()=>{
      for(const gain of music.values())gain.gain.setValueAtTime(1,context.currentTime);
      if(duckBus)duckBus(1);
    },800);
  }
  function fallback(dark){
    const c=context,t=c.currentTime;
    for(const delay of [0,.42]){
      const source=c.createOscillator(),gain=c.createGain();source.type='sine';
      source.frequency.setValueAtTime(dark?78:105,t+delay);
      source.frequency.linearRampToValueAtTime(dark?42:52,t+delay+.2);
      gain.gain.setValueAtTime(0,t+delay);gain.gain.linearRampToValueAtTime(.35,t+delay+.008);
      gain.gain.linearRampToValueAtTime(0,t+delay+.3);source.connect(gain);gain.connect(output);
      source.start(t+delay);source.stop(t+delay+.32);
    }
  }
  function play(decision){
    if(!['hero','create','enter','new-game','difficulty','delete'].includes(decision))return false;
    const level=volume(),now=global.performance.now();
    if(level===0||now<busyUntil)return false;
    try{
      const c=audio();if(!c)return false;
      busyUntil=now+1850;output.gain.setValueAtTime(level*.8,c.currentTime);
      const start=()=>{
        try{
          duck();const buffer=buffers[decision==='delete'?'dark':'normal'];
          if(buffer){const source=c.createBufferSource();source.buffer=buffer;source.connect(output);source.start();}
          else fallback(decision==='delete');
        }catch{busyUntil=0;}
      };
      if(c.state==='suspended')c.resume().then(start).catch(()=>{busyUntil=0;});else start();
      return true;
    }catch{busyUntil=0;return false;}
  }
  global.addEventListener('pointerdown',()=>{try{const c=audio();if(c?.state==='suspended')c.resume().catch(()=>{});}catch{}},{capture:true,passive:true});
  global.addEventListener('keydown',()=>{try{const c=audio();if(c?.state==='suspended')c.resume().catch(()=>{});}catch{}},{capture:true});
  global.DecisionSound={candidate,ready,play,attachMusic,detachMusic,configure(options={}){getVolume=options.getVolume||null;duckBus=options.duck||null;}};
})(globalThis);
