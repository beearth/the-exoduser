/* Transparent ancestor frames and ambient video are independent lobby layers. */
(() => {
  const art={width:384,height:624,columns:8,frames:96,fps:24,baseline:603.682092555332,heartX:182.43863179074447};
  function frameAt(seconds){return Math.floor(Math.max(0,seconds)*art.fps)%art.frames;}
  function placement(width,height,bgWidth=1920,bgHeight=1088){
    const scale=Math.max(width/bgWidth,height/bgHeight);
    const leftWidth=width*(width<=1100?.55:.65);
    const footY=Math.min(height*.89,Math.max(height*.76,bgHeight*scale*.84+(height-bgHeight*scale)*.75));
    const displayHeight=Math.min(height*.8,footY-28);
    const displayWidth=displayHeight*art.width/art.height;
    const footX=Math.max(displayWidth*.52+12,Math.min(leftWidth-displayWidth*.48-12,bgWidth*scale*.33+(width-bgWidth*scale)*.5));
    return{width:displayWidth,height:displayHeight,left:footX-art.heartX/art.width*displayWidth,top:footY-art.baseline/art.height*displayHeight,footX,footY};
  }
  function boot(){
    const lobby=document.getElementById('lobby'),canvas=document.getElementById('lobbyAncestorSprite'),video=document.getElementById('lobbyAmbientVideo');
    if(!lobby||!canvas||!video)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const image=new Image();let loaded=false,raf=0,lastFrame=-1,start=performance.now(),active=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function layout(){
      const p=placement(lobby.clientWidth,lobby.clientHeight,video.videoWidth||1920,video.videoHeight||1088);
      Object.assign(canvas.style,{width:p.width+'px',height:p.height+'px',left:p.left+'px',top:p.top+'px'});
      const shadow=document.getElementById('lobbyAncestorShadow');
      if(shadow)Object.assign(shadow.style,{left:p.footX+'px',top:p.footY+'px',width:p.width*.42+'px',height:p.height*.045+'px'});
      const caption=document.getElementById('charDispEmpty');if(caption&&!lobby.classList.contains('has-selected-character'))caption.style.left=p.footX+'px';
    }
    function paint(frame){
      if(!loaded)return;
      ctx.clearRect(0,0,art.width,art.height);
      ctx.drawImage(image,(frame%art.columns)*art.width,Math.floor(frame/art.columns)*art.height,art.width,art.height,0,0,art.width,art.height);
      canvas.dataset.frame=String(frame);lastFrame=frame;
    }
    function tick(now){
      raf=0;if(!active||!loaded||reduced.matches)return;
      const frame=frameAt((now-start)/1000);if(frame!==lastFrame)paint(frame);
      raf=requestAnimationFrame(tick);
    }
    function sync(){
      const visible=!document.hidden&&getComputedStyle(lobby).display!=='none'&&lobby.getClientRects().length>0;
      const selected=lobby.classList.contains('has-selected-character');
      const preview=document.getElementById('lobbyCharPreview'),keyart=document.getElementById('lobbyCharKeyart');
      active=visible&&!selected;
      if(raf){cancelAnimationFrame(raf);raf=0;}
      if(!visible||reduced.matches){
        video.pause();if(preview)preview.pause();
        if(selected&&reduced.matches){if(preview)preview.classList.remove('show');if(keyart&&keyart.getAttribute('src'))keyart.classList.add('show');}
        if(reduced.matches)paint(0);return;
      }
      if(selected){
        video.pause();
        if(preview&&preview.getAttribute('src')){
          preview.classList.add('show');const fallback=preview.onerror;
          preview.play().catch(()=>{if(preview.onerror===fallback&&typeof fallback==='function')fallback();});
        }
        return;
      }
      layout();video.play().catch(()=>{});
      if(loaded)raf=requestAnimationFrame(tick);
    }
    image.onload=()=>{loaded=true;canvas.classList.add('sprite-loaded');start=performance.now();paint(0);layout();sync();};
    image.onerror=()=>{canvas.dataset.fallback='first-frame';};
    image.src='assets/lobby/varkan_idle_v3.png?v=20260928-idle3';
    video.addEventListener('loadedmetadata',layout);
    video.addEventListener('error',()=>{video.style.display='none';});
    new MutationObserver(sync).observe(lobby,{attributes:true,attributeFilter:['class','style']});
    new ResizeObserver(layout).observe(lobby);
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',sync);
    sync();
  }
  window.LobbyAncestorSprite={frameAt,placement,art};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
