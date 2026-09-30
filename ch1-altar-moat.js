/* CH1-1 altar moat: the blocked elliptical band around the right-centre altar
   (game.html _CH1_HILL, isW -> _ch1HillBandBlocks) was invisible. This draws that
   same band as a sunken toxic-bile channel with root banks, a land bridge on the
   west ramp, a slow glow pulse and gas bubbles. Visual only: the collision band,
   ramp, tile map and baked chunks never change. Art is composited once from the
   existing CH1 asset prop_pool.png (its liquid for the channel, its root rim for the banks). */
(function(root){
  'use strict';
  const W=1900,H=960,CX=950,CY=480,SEG=180,TAU=Math.PI*2;
  const SRC_POOL='assets/map/ch1/collision/prop_pool.png';
  let pool=null,tex=null,glow=null,bubble=null,vents=null,lastDraws=0,buildMs=0;
  function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
  function ready(img){return !!img&&img.complete&&img.naturalWidth>1;}
  function load(src){const i=new Image();i.decoding='async';i.src=src;return i;}
  // Liquid edge as a fraction of the hill ellipse. The liquid is a few px wider than
  // the collision band so the player's body never overlaps open liquid.
  function edgeD(h,a,outer){
    const wob=.006*Math.sin(a*3+1.3)+.004*Math.sin(a*7-.4)+.002*Math.sin(a*13+2.1); // |wob| <= .012
    return outer?h.outer+.012+wob:h.inner-.012+wob; // always covers the collision band, at most .024 wider
  }
  function geom(h,T){
    const rx=h.rx*T,ry=h.ry*T;
    return{rx:rx,ry:ry,mid:(h.inner+h.outer)/2,
      x0:CX+(h.rampX0-h.cx)*T,x1:CX+(h.rampX1-h.cx)*T,by:CY+(h.rampY-h.cy)*T,hw0:h.rampHalf0*T,hw1:h.rampHalf1*T,
      dIn:function(a){return edgeD(h,a,false);},dOut:function(a){return edgeD(h,a,true);}};
  }
  function edge(c,g,df,ox,oy,grow){
    c.beginPath();
    for(let i=0;i<=SEG;i++){const a=i/SEG*TAU,d=df(a)+(grow||0),x=CX+g.rx*d*Math.cos(a)+ox,y=CY+g.ry*d*Math.sin(a)+oy;if(i)c.lineTo(x,y);else c.moveTo(x,y);}
    c.closePath();
  }
  function ring(c,g,growIn,growOut){
    c.beginPath();
    for(let i=0;i<=SEG;i++){const a=i/SEG*TAU,d=g.dOut(a)+growOut,x=CX+g.rx*d*Math.cos(a),y=CY+g.ry*d*Math.sin(a);if(i)c.lineTo(x,y);else c.moveTo(x,y);}
    c.closePath();
    for(let i=0;i<=SEG;i++){const a=i/SEG*TAU,d=g.dIn(a)-growIn,x=CX+g.rx*d*Math.cos(a),y=CY+g.ry*d*Math.sin(a);if(i)c.lineTo(x,y);else c.moveTo(x,y);}
    c.closePath();
  }
  // West ramp corridor = the only walkable crossing (same trapezoid as _ch1HillRampAt).
  function bridge(c,g,grow){
    c.beginPath();c.moveTo(g.x0,g.by-g.hw0-grow);c.lineTo(g.x1,g.by-g.hw1-grow);c.lineTo(g.x1,g.by+g.hw1+grow);c.lineTo(g.x0,g.by+g.hw0+grow);c.closePath();
  }
  function bridgeHalfAt(g,x){const t=Math.max(0,Math.min(1,(x-g.x0)/(g.x1-g.x0)));return g.hw0+(g.hw1-g.hw0)*t;}
  function onBridge(g,x,y,pad){return x>=g.x0-pad&&x<=g.x1+pad&&Math.abs(y-g.by)<=bridgeHalfAt(g,x)+pad;}
  function build(h,T){
    const t0=performance.now(),g=geom(h,T),out=cv(W,H),c=out.getContext('2d');
    // ── liquid ──
    const L=cv(W,H),l=L.getContext('2d');
    ring(l,g,0,0);l.fillStyle='#0a1309';l.fill('evenodd');
    l.globalCompositeOperation='source-atop';
    const st=cv(320,230),s=st.getContext('2d');
    s.drawImage(pool,270,215,320,230,0,0,320,230);
    s.globalCompositeOperation='destination-in';
    const sg=s.createRadialGradient(160,115,18,160,115,160);sg.addColorStop(0,'#000');sg.addColorStop(.55,'rgba(0,0,0,.92)');sg.addColorStop(1,'rgba(0,0,0,0)');
    s.save();s.translate(160,115);s.scale(1,115/160);s.translate(-160,-115);s.fillStyle=sg;s.fillRect(0,-110,320,450);s.restore();
    const R=rng(9731);
    for(let a=0;a<TAU;){
      const x=CX+g.rx*g.mid*Math.cos(a),y=CY+g.ry*g.mid*Math.sin(a),tx=-g.rx*Math.sin(a),ty=g.ry*Math.cos(a),tl=Math.hypot(tx,ty)*g.mid,sc=.6+R()*.2;
      l.save();l.translate(x+(R()-.5)*10,y+(R()-.5)*8);l.rotate(Math.atan2(ty,tx)+(R()-.5)*.5+(R()<.5?Math.PI:0));l.scale(sc,sc*.8);l.globalAlpha=.88;l.drawImage(st,-160,-115);l.restore();
      a+=50/tl;
    }
    l.globalAlpha=1;l.fillStyle='rgba(7,18,8,.18)';l.fillRect(0,0,W,H);
    // Sunken read: both banks darken the liquid edge, and the NW key light throws
    // the north/west bank shadow (and the island's) south-east onto the liquid.
    l.lineJoin='round';
    l.filter='blur(7px)';l.strokeStyle='rgba(0,0,0,.62)';l.lineWidth=26;edge(l,g,g.dOut,0,0);l.stroke();edge(l,g,g.dIn,0,0);l.stroke();
    l.filter='blur(4px)';l.strokeStyle='rgba(0,0,0,.5)';l.lineWidth=16;edge(l,g,g.dOut,6,9);l.stroke();edge(l,g,g.dIn,6,9);l.stroke();
    l.filter='none';l.globalCompositeOperation='destination-out';bridge(l,g,3);l.fillStyle='#000';l.fill();
    // ── trench rim under the liquid ──
    c.save();c.filter='blur(6px)';ring(c,g,.034,.034);c.fillStyle='rgba(8,6,5,.8)';c.fill('evenodd');
    c.globalCompositeOperation='destination-out';c.filter='blur(5px)';bridge(c,g,-4);c.fillStyle='#000';c.fill();c.restore();
    c.drawImage(L,0,0);
    // ── braided root bank: rim strips cut from the pool art, laid along both edges ──
    const rim=cv(440,120),rc=rim.getContext('2d');
    rc.drawImage(pool,200,530,440,120,0,0,440,120);
    rc.globalCompositeOperation='destination-in';
    const rh=rc.createLinearGradient(0,0,440,0);rh.addColorStop(0,'rgba(0,0,0,0)');rh.addColorStop(.16,'#000');rh.addColorStop(.84,'#000');rh.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rh;rc.fillRect(0,0,440,120);
    const rv=rc.createLinearGradient(0,0,0,120);rv.addColorStop(0,'rgba(0,0,0,0)');rv.addColorStop(.26,'#000');rv.addColorStop(.9,'#000');rv.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rv;rc.fillRect(0,0,440,120);
    const B=rng(5531);
    const strip=function(x,y,rot,sc){
      c.save();c.translate(x,y);c.rotate(rot);c.scale(B()<.5?-sc:sc,sc);c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=8;c.shadowOffsetX=4;c.shadowOffsetY=6;c.filter='brightness(.86) saturate(.8)';
      c.drawImage(rim,-220,-46);c.restore();
    };
    const lay=function(df,off,flip,stepPx){
      for(let a=B()*.1;a<TAU;){
        const d=df(a)+off,x=CX+g.rx*d*Math.cos(a),y=CY+g.ry*d*Math.sin(a),tx=-g.rx*Math.sin(a),ty=g.ry*Math.cos(a),tl=Math.hypot(tx,ty)*d;
        if(!onBridge(g,x,y,58))strip(x+(B()-.5)*6,y+(B()-.5)*5,Math.atan2(ty,tx)+(flip?Math.PI:0)+(B()-.5)*.16,.36+B()*.1);
        a+=(stepPx+B()*26)/tl;
      }
    };
    lay(g.dOut,.022,true,108);lay(g.dIn,-.026,false,112);
    // Bridge sides: the same bank runs along both edges of the land crossing.
    (function(){
      const xa=CX-g.rx*(h.outer+.04),xb=CX-g.rx*(h.inner-.04),xm=(xa+xb)/2,ang=Math.atan2(-(g.hw1-g.hw0),g.x1-g.x0),half=bridgeHalfAt(g,xm);
      strip(xm,g.by-half-4,ang,.5);strip(xm,g.by+half+4,-ang+Math.PI,.5);
    })();
    // ── glow (half res) ──
    const gl=cv(W/2,H/2),q=gl.getContext('2d');
    q.scale(.5,.5);q.filter='blur(10px)';ring(q,g,-.004,-.004);q.fillStyle='rgb(126,255,96)';q.fill('evenodd');
    q.filter='blur(6px)';q.globalCompositeOperation='destination-out';bridge(q,g,10);q.fillStyle='#000';q.fill();
    // ── bubble sprite + vents ──
    const b=cv(32,32),bc=b.getContext('2d'),bg=bc.createRadialGradient(16,16,4,16,16,15);
    bg.addColorStop(0,'rgba(170,255,140,.22)');bg.addColorStop(.62,'rgba(176,255,146,.30)');bg.addColorStop(.8,'rgba(206,255,176,.62)');bg.addColorStop(1,'rgba(206,255,176,0)');
    bc.fillStyle=bg;bc.beginPath();bc.arc(16,16,15,0,TAU);bc.fill();
    bc.fillStyle='rgba(240,255,225,.85)';bc.beginPath();bc.ellipse(11,10,3.2,2,-.6,0,TAU);bc.fill();
    const V=rng(77123),list=[];
    for(let i=0;i<22;i++){
      const a=(i+V()*.8)/22*TAU,d=g.mid+(V()-.5)*.07,x=CX+g.rx*d*Math.cos(a),y=CY+g.ry*d*Math.sin(a);
      if(onBridge(g,x,y,26))continue;
      list.push({x:x,y:y,period:2300+V()*2600,phase:V(),size:6+V()*7});
    }
    tex=out;glow=gl;bubble=b;vents=list;buildMs=performance.now()-t0;
  }
  function draw(ctx,g,now,h,T,VW,VH){
    lastDraws=0;
    if(!g||g.stage!==0||g._bossArena||!h)return;
    if(!pool)pool=load(SRC_POOL);
    const ox=h.cx*T-CX,oy=h.cy*T-CY,cam=g.cam;
    if(cam&&VW&&VH){const mx=VW*.75+120,my=VH*.75+120;if(ox>cam.x+mx||ox+W<cam.x-mx||oy>cam.y+my||oy+H<cam.y-my)return;}
    if(!tex){if(!ready(pool))return;build(h,T);}
    ctx.drawImage(tex,ox,oy);lastDraws++;
    const prev=ctx.globalAlpha;
    ctx.globalAlpha=.07+.03*Math.sin(now*.0017)+.015*Math.sin(now*.0041+1.7);
    ctx.drawImage(glow,ox,oy,W,H);lastDraws++;
    for(let i=0;i<vents.length;i++){
      const v=vents[i],t=((now/v.period)+v.phase)%1;
      if(t>.7)continue; // quiet gap between bubbles
      const k=t/.7,pop=k>.86?(k-.86)/.14:0,sz=v.size*(.35+.65*Math.min(1,k/.6))*(1+pop*.9),al=Math.min(1,k/.18)*(1-pop);
      if(al<=.02)continue;
      ctx.globalAlpha=al*.8;ctx.drawImage(bubble,ox+v.x-sz/2,oy+v.y-sz/2-k*3,sz,sz);lastDraws++;
    }
    ctx.globalAlpha=prev;
  }
  // Static light sources so the channel reads through the CH1 darkness overlay.
  function lights(arr,h,T){
    if(!arr||!h)return;
    const n=10,mid=(h.inner+h.outer)/2;
    for(let i=0;i<n;i++){
      const a=(i+.5)/n*TAU;
      arr.push({x:(h.cx+h.rx*mid*Math.cos(a))*T,y:(h.cy+h.ry*mid*Math.sin(a))*T,r:210,a:.30,cr:126,cg:236,cb:98,f:.7});
    }
  }
  function qa(){return{built:!!tex,buildMs:Math.round(buildMs*10)/10,lastDraws:lastDraws,vents:vents?vents.length:0,poolReady:ready(pool)};}
  root.Ch1AltarMoat=Object.freeze({draw:draw,lights:lights,qa:qa,_edgeD:edgeD,_texture:function(){return tex;}});
})(globalThis);
