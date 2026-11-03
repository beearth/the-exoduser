/* Transparent ancestor frames and ambient video are independent lobby layers. */
(() => {
  const art={width:384,height:624,columns:8,frames:96,fps:24,baseline:603.682092555332,heartX:182.43863179074447,
    // 선 자리 = 두 발 중점(x 207: 뒷발 115~173·앞발 249~299)과 두 발바닥 높이의 중간(y 596: 뒷발 589·앞발 603). 단 중심에 이 점을 맞춘다.
    standX:207,standY:596};
  function frameAt(seconds){return Math.floor(Math.max(0,seconds)*art.fps)%art.frames;}
  // 발 = 배경 원본(1920×1088) 원형 단 동심원 중심(660,850). box는 배경 원본이 실제로 놓인 사각형
  // (와이드 확장판이면 그 안에 끼운 원본 영상 영역). 없으면 영상의 object-fit:cover·object-position:center 75%로 계산한다.
  const dais={x:660/1920,y:850/1088};
  function placement(width,height,bgWidth=1920,bgHeight=1088,box=null){
    const scale=Math.max(width/bgWidth,height/bgHeight);
    const bg=box||{x:(width-bgWidth*scale)*.5,y:(height-bgHeight*scale)*.75,w:bgWidth*scale,h:bgHeight*scale};
    const leftWidth=width*(width<=1100?.55:.65);
    const footY=Math.min(height*.92,bg.y+bg.h*dais.y);
    const displayHeight=Math.min(bg.h*864/1088,height*.8,footY-28);
    const displayWidth=displayHeight*art.width/art.height;
    const footX=Math.max(displayWidth*.52+12,Math.min(leftWidth-displayWidth*.48-12,bg.x+bg.w*dais.x));
    return{width:displayWidth,height:displayHeight,left:footX-art.standX/art.width*displayWidth,top:footY-art.standY/art.height*displayHeight,footX,footY};
  }
  // fullscreen-art.js가 와이드 확장판 위에 원본 영상을 옮겨 놓은 상자(--wide-video-x/y/w/h)
  function wideBox(video){
    if(video.dataset.wideVideo!=='true')return null;
    const v=k=>parseFloat(video.style.getPropertyValue('--wide-video-'+k));
    const b={x:v('x'),y:v('y'),w:v('w'),h:v('h')};
    return b.w>0&&b.h>0?b:null;
  }
  function boot(){
    const lobby=document.getElementById('lobby'),canvas=document.getElementById('lobbyAncestorSprite'),video=document.getElementById('lobbyAmbientVideo');
    if(!lobby||!canvas||!video)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const image=new Image();let loaded=false,raf=0,lastFrame=-1,start=performance.now(),active=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const frozen=()=>reduced.matches||(globalThis.LivingScenes&&!LivingScenes.motionAllowed());
    function layout(){
      const p=placement(lobby.clientWidth,lobby.clientHeight,video.videoWidth||1920,video.videoHeight||1088,wideBox(video));
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
      raf=0;if(!active||!loaded||frozen())return;
      const frame=frameAt((now-start)/1000);if(frame!==lastFrame)paint(frame);
      raf=requestAnimationFrame(tick);
    }
    function sync(){
      const visible=!document.hidden&&getComputedStyle(lobby).display!=='none'&&lobby.getClientRects().length>0;
      const selected=lobby.classList.contains('has-selected-character');
      const preview=document.getElementById('lobbyCharPreview'),keyart=document.getElementById('lobbyCharKeyart');
      active=visible&&!selected;
      if(raf){cancelAnimationFrame(raf);raf=0;}
      if(!visible||frozen()){
        video.pause();if(preview)preview.pause();
        if(selected&&frozen()){if(preview)preview.classList.remove('show');if(keyart&&keyart.getAttribute('src'))keyart.classList.add('show');}
        if(frozen())paint(0);return;
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
    // 와이드 확장판 상자는 fullscreen-art.js가 나중에(확장판 로드 뒤) 써 넣는다.
    new MutationObserver(layout).observe(video,{attributes:true,attributeFilter:['style','data-wide-video']});
    video.addEventListener('error',()=>{video.style.display='none';});
    new MutationObserver(sync).observe(lobby,{attributes:true,attributeFilter:['class','style']});
    new ResizeObserver(layout).observe(lobby);
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',sync);
    document.addEventListener('living-motion-policy',sync);
    sync();
  }
  window.LobbyAncestorSprite={frameAt,placement,art};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
