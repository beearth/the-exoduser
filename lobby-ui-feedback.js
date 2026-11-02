/* Existing UI samples shared with Unity. Entry retains its authored loop and confirm. */
(() => {
  'use strict';
  const samples={hover:'sfx/ui/button_hover.mp3',confirm:'sfx/ui/button_confirm.mp3'};
  const pool=new Map(),buffers=new Map();
  let hovered=null,hoverAt=-Infinity,hoverLate=0,confirmAt=-Infinity,ac=null;
  const ownSound=b=>['visualCreateBtn','createBtn','enterGameBtn','steamWishBtn','lobbySteamLink','lobbyWishlistBtn'].includes(b.id)||(b.id==='delConfirmYes'&&b.closest('#delConfirmModal')?.dataset?.decisionSound==='delete')||b.dataset?.uiOwnSound==='true'||b.matches('.cin-enter-btn');
  // 디코딩한 버퍼를 매번 새 소스로 재생한다. <audio> 한 개를 되감아 쓰면 빠르게 옮길 때 소리가 씹힌다(2026-11-02).
  // 입력 전에 만든 컨텍스트는 멈춰 있으므로 재생·입력 때 resume한다.
  function audio(){
    if(!ac){
      const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return null;
      try{ac=new AC();}catch{return null;}
      for(const [kind,src] of Object.entries(samples))fetch(src).then(r=>r.arrayBuffer()).then(ab=>ac.decodeAudioData(ab)).then(b=>buffers.set(kind,b)).catch(()=>{});
    }
    if(ac.state==='suspended')ac.resume().catch(()=>{});
    return ac;
  }
  function control(target){
    const b=target?.closest?.('button,[role="menuitem"],.cs-ico');
    return b&&!b.disabled&&!b.classList.contains('disabled')&&b.getClientRects().length?b:null;
  }
  function play(kind,gain){
    if(document.hidden)return;
    let volume=60;
    try{const saved=JSON.parse(localStorage.getItem('hellcave_settings'));if(Number.isFinite(saved?.opt?.sfxVol))volume=saved.opt.sfxVol;}catch{}
    volume=Math.max(0,Math.min(100,volume))/100;
    if(!volume)return;
    const ctx=audio(),buffer=buffers.get(kind);
    if(ctx&&buffer){
      try{const source=ctx.createBufferSource(),level=ctx.createGain();source.buffer=buffer;level.gain.value=gain*volume;source.connect(level);level.connect(ctx.destination);source.start();}catch{}
      return;
    }
    try{let sound=pool.get(kind);if(!sound){sound=new Audio(samples[kind]);sound.preload='auto';pool.set(kind,sound);}sound.volume=Math.min(1,gain*volume);sound.currentTime=0;sound.play()?.catch(()=>{});}catch{}
  }
  // 쿨다운 안에 들어온 항목도 버리지 않는다: 쿨다운이 끝났을 때 아직 그 위에 있으면 소리를 낸다.
  function hover(e){
    if(e.pointerType==='touch')return;
    const b=control(e.target);if(b===hovered)return;hovered=b;clearTimeout(hoverLate);
    if(!b||b.id==='enterGameBtn'||b.matches('.cin-enter-btn'))return;
    const wait=hoverAt+35-performance.now();
    if(wait>0){hoverLate=setTimeout(()=>{if(hovered!==b)return;hoverAt=performance.now();play('hover',.6);},wait);return;}
    hoverAt=performance.now();play('hover',.6);
  }
  audio();
  document.addEventListener('pointerdown',()=>audio(),true);
  document.addEventListener('keydown',()=>audio(),true);
  document.addEventListener('pointerover',hover);
  document.addEventListener('focusin',hover);
  document.addEventListener('click',e=>{
    const b=control(e.target);if(!b||ownSound(b))return;
    const now=performance.now();if(now-confirmAt<80)return;confirmAt=now;play('confirm',.35);
  },true);
})();
