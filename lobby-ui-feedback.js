/* Existing UI samples shared with Unity. Entry retains its authored loop and confirm. */
(() => {
  'use strict';
  const samples={hover:'sfx/ui/button_hover.mp3',confirm:'sfx/ui/button_confirm.mp3'};
  const pool=new Map();
  let hovered=null,hoverAt=-Infinity,confirmAt=-Infinity;
  const ownSound=b=>['visualCreateBtn','createBtn','enterGameBtn','steamWishBtn','lobbySteamLink','lobbyWishlistBtn'].includes(b.id)||(b.id==='delConfirmYes'&&b.closest('#delConfirmModal')?.dataset?.decisionSound==='delete')||b.dataset?.uiOwnSound==='true'||b.matches('.cin-enter-btn');
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
    try{let sound=pool.get(kind);if(!sound){sound=new Audio(samples[kind]);sound.preload='auto';pool.set(kind,sound);}sound.volume=gain*volume;sound.currentTime=0;sound.play()?.catch(()=>{});}catch{}
  }
  function hover(e){
    if(e.pointerType==='touch')return;
    const b=control(e.target);if(b===hovered)return;hovered=b;
    if(!b||b.id==='enterGameBtn'||b.matches('.cin-enter-btn'))return;
    const now=performance.now();if(now-hoverAt<60)return;hoverAt=now;play('hover',.25);
  }
  document.addEventListener('pointerover',hover);
  document.addEventListener('focusin',hover);
  document.addEventListener('click',e=>{
    const b=control(e.target);if(!b||ownSound(b))return;
    const now=performance.now();if(now-confirmAt<80)return;confirmAt=now;play('confirm',.35);
  },true);
})();
