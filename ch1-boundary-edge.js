/* CH1-1 boundary edge (MAP-020): the walkable edge against the baked forest read as
   plain dark soil from a distance, so the reason a wall stops the player was not
   visible. This adds the guideline's GROUND TRANSITION layer at runtime:
     A  contact shadow — the floor darkens toward the wall (AO) and the forest side
        falls into a deeper recess;
     B  A + root strips (cut from the approved prop_pool.png rim) laid along the edge.
   Visual only: tile map, collision, combat floor and baked chunks never change.
   Built once from G.map (wall = 1), so walkable pockets outside the painted border
   (e.g. south-east of mass M5) are treated as floor as well. */
(function(root){
  'use strict';
  const T=40,S=4; // mask pixels per tile
  const SRC_POOL='assets/map/ch1/collision/prop_pool.png';
  // A: floor AO reaches about 1.3 tiles; the forest side falls to .70 within about 2.5 tiles.
  const AO_MAX=.30,RECESS_MAX=.70,AO_BLUR=5,RECESS_BLUR=14;
  // B: one root strip per ~92px of edge, strips span ~185px.
  const ROOT_GAP=92,ROOT_SCALE=.42;
  let shade=null,roots=null,rim=null,pool=null,mapRef=null,buildMs=0,lastDraws=0,variant=null,pending=null;
  function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
  function smooth(t){t=t<0?0:t>1?1:t;return t*t*(3-2*t);}
  function mode(){
    if(variant!==null)return variant;
    const q=typeof location!=='undefined'?location.search:'';
    const m=/[?&]edgeShade=([0ab])/.exec(q);
    variant=m?m[1]:'b';
    return variant;
  }
  // Alpha of the shade layer from the two blurred wall fields (0 = floor .. 1 = wall).
  function shadeAlpha(near,far,isWall){
    if(!isWall)return AO_MAX*Math.pow(smooth(near/.5),1.5);
    return AO_MAX+(RECESS_MAX-AO_MAX)*smooth((far-.5)/.3);
  }
  function blurred(src,w,h,px){const c=cv(w,h),x=c.getContext('2d');x.filter='blur('+px+'px)';x.drawImage(src,0,0);x.filter='none';return x.getImageData(0,0,w,h).data;}
  function build(g){
    const t0=performance.now(),W=g.mw,H=g.mh,w=W*S,h=H*S;
    const m=cv(w,h),mc=m.getContext('2d');mc.fillStyle='#000';mc.fillRect(0,0,w,h);mc.fillStyle='#fff';
    for(let y=0;y<H;y++){const row=g.map[y];for(let x=0;x<W;x++)if(row[x]===1)mc.fillRect(x*S,y*S,S,S);}
    const near=blurred(m,w,h,AO_BLUR),far=blurred(m,w,h,RECESS_BLUR);
    const out=cv(w,h),oc=out.getContext('2d'),img=oc.createImageData(w,h),d=img.data;
    for(let py=0;py<h;py++){const ty=(py/S)|0,row=g.map[ty];
      for(let px=0;px<w;px++){const i=(py*w+px)*4,a=shadeAlpha(near[i]/255,far[i]/255,row[(px/S)|0]===1);
        d[i]=4;d[i+1]=3;d[i+2]=5;d[i+3]=Math.round(a*255);}}
    oc.putImageData(img,0,0);shade=out;
    // Root anchors: floor tiles touching a wall, spaced by a spatial hash, normal from the far field gradient.
    const R=rng(20261001),list=[],cell=ROOT_GAP,taken=new Set();
    const fv=function(x,y){x=Math.max(0,Math.min(w-1,x|0));y=Math.max(0,Math.min(h-1,y|0));return far[(y*w+x)*4]/255;};
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      if(g.map[y][x]===1)continue;
      if(!(g.map[y][x+1]===1||g.map[y][x-1]===1||g.map[y+1][x]===1||g.map[y-1][x]===1))continue;
      const wx=x*T+T/2,wy=y*T+T/2,k=Math.floor(wx/cell)+','+Math.floor(wy/cell);
      if(taken.has(k)||R()<.35)continue;taken.add(k);
      const sx=(x+.5)*S,sy=(y+.5)*S,gx=fv(sx+S,sy)-fv(sx-S,sy),gy=fv(sx,sy+S)-fv(sx,sy-S),gl=Math.hypot(gx,gy);
      if(gl<1e-3)continue;
      const nx=gx/gl,ny=gy/gl; // points into the wall
      list.push({x:wx+nx*14,y:wy+ny*14,rot:Math.atan2(ny,nx)-Math.PI/2,s:ROOT_SCALE*(.85+R()*.35),flip:R()<.5});
    }
    roots=list;mapRef=g.map;buildMs=performance.now()-t0;
  }
  function buildRim(){
    rim=cv(440,120);const rc=rim.getContext('2d');
    rc.drawImage(pool,200,530,440,120,0,0,440,120);
    rc.globalCompositeOperation='destination-in';
    const rh=rc.createLinearGradient(0,0,440,0);rh.addColorStop(0,'rgba(0,0,0,0)');rh.addColorStop(.16,'#000');rh.addColorStop(.84,'#000');rh.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rh;rc.fillRect(0,0,440,120);
    const rv=rc.createLinearGradient(0,0,0,120);rv.addColorStop(0,'rgba(0,0,0,0)');rv.addColorStop(.26,'#000');rv.addColorStop(.9,'#000');rv.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rv;rc.fillRect(0,0,440,120);
    // Darken toward the forest tone so strips sit in the edge shadow.
    rc.globalCompositeOperation='source-atop';rc.fillStyle='rgba(10,7,8,.12)';rc.fillRect(0,0,440,120);
  }
  function draw(ctx,g,now,VW,VH){
    lastDraws=0;
    const v=mode();
    if(v==='0'||!g||g.stage!==0||g._bossArena||!Array.isArray(g.map)||!g.cam)return;
    // One-time build (~20-45ms) runs in an idle callback so stage entry never stalls a frame; nothing is drawn until it is ready.
    if(!shade||mapRef!==g.map){
      if(pending!==g.map){pending=g.map;const map=g.map,run=function(){if(pending===map&&(!shade||mapRef!==map)&&g.map===map)build(g);};
        if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:1500});else setTimeout(run,0);}
      if(!shade||mapRef!==g.map)return;
    }
    const cam=g.cam,hw=(VW||1600)*.5+80,hh=(VH||900)*.5+80;
    const x0=Math.max(0,cam.x-hw),y0=Math.max(0,cam.y-hh),x1=Math.min(g.mw*T,cam.x+hw),y1=Math.min(g.mh*T,cam.y+hh);
    if(x1<=x0||y1<=y0)return;
    const k=S/T;
    ctx.drawImage(shade,x0*k,y0*k,(x1-x0)*k,(y1-y0)*k,x0,y0,x1-x0,y1-y0);lastDraws++;
    if(v!=='b')return;
    if(!pool){pool=new Image();pool.decoding='async';pool.src=SRC_POOL;}
    if(!rim){if(!(pool.complete&&pool.naturalWidth>1))return;buildRim();}
    for(let i=0;i<roots.length;i++){
      const r=roots[i];if(r.x<x0-90||r.x>x1+90||r.y<y0-90||r.y>y1+90)continue;
      ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.rot);ctx.scale(r.flip?-r.s:r.s,r.s);ctx.drawImage(rim,-220,-46);ctx.restore();lastDraws++;
    }
  }
  function qa(){return{mode:mode(),built:!!shade,buildMs:Math.round(buildMs*10)/10,roots:roots?roots.length:0,lastDraws:lastDraws,texPx:shade?shade.width*shade.height:0};}
  root.Ch1BoundaryEdge=Object.freeze({draw:draw,qa:qa,_shadeAlpha:shadeAlpha,_setMode:function(m){variant=m;},
    _consts:{S:S,AO_MAX:AO_MAX,RECESS_MAX:RECESS_MAX,AO_BLUR:AO_BLUR,RECESS_BLUR:RECESS_BLUR,ROOT_GAP:ROOT_GAP,ROOT_SCALE:ROOT_SCALE}});
})(globalThis);
