/* CH1-1 local living tissue. Visual only; coordinates and collision stay owned by the map. */
(function(root){
  'use strict';
  const kinds={m_c1tree:2.1,m_c1cocoon:1.1,m_c1pool:1.25,m_c1spod:.65,m_c1sroot:.75,pit_poison:1.2,m_rotten_tree:1};
  const feet={m_c1tree:230,m_c1cocoon:100,m_c1spod:40,m_rotten_tree:50};
  function enabled(g){return g.stage===0&&!g._bossArena&&!g._fieldRebuildQA;}
  function paint(c,g,objects,now,width,height,surfaceOnly=false){
    if(!enabled(g))return;
    const zoom=Math.max(.3,g._edZoom||g._camZoom||1),hw=width/(2*zoom),hh=height/(2*zoom);
    c.save();c.globalCompositeOperation='source-over';c.lineCap='round';c.lineJoin='round';
    for(const o of objects){
      const size=kinds[o.type];if(!size)continue;
      const s=size*Math.min(1.6,o.scale||1),pad=250*s;
      if(Math.abs(o.x-g.cam.x)>hw+pad||Math.abs(o.y-g.cam.y)>hh+pad)continue;
      const seed=o.x*.017+o.y*.011,t=now*.001,phase=t*.95+seed;
      const wet=o.type==='m_c1pool'||o.type==='pit_poison';
      c.save();c.translate(o.x,o.y);c.scale(s,s);
      // Broad soft contact shadow: independent of the moving raised tissue.
      if(!surfaceOnly){
      c.save();c.translate(12,24);c.scale(1,.42);
      const shade=c.createRadialGradient(0,0,12,0,0,156);
      shade.addColorStop(0,'rgba(9,5,10,.48)');shade.addColorStop(.48,'rgba(12,7,12,.25)');shade.addColorStop(1,'rgba(12,7,12,0)');
      c.fillStyle=shade;c.fillRect(-156,-156,312,312);c.restore();
      // Uneven branching tendons, each pulse delayed along the length.
      for(let j=0;j<5;j++){
        const a=seed+j*2.399,len=100+42*Math.sin(seed+j*1.7),ex=Math.cos(a)*len,ey=Math.sin(a)*len*.55+24;
        const bend=Math.sin(phase-j*.8)*3.2,pulse=.5+.5*Math.sin(phase-j*.8);
        c.beginPath();c.moveTo(0,8);c.bezierCurveTo(ex*.24-18,ey*.1+bend,ex*.64+22,ey*.95-bend,ex,ey);
        c.strokeStyle='rgba(13,7,12,.38)';c.lineWidth=11;c.stroke();
        c.strokeStyle=wet?'rgba(63,61,35,.55)':'rgba(69,39,43,.58)';c.lineWidth=5.2+pulse*1.5;c.stroke();
        c.save();c.translate(-.8,-1.6);c.strokeStyle='rgba(139,112,100,.19)';c.lineWidth=1.25;c.stroke();c.restore();
        // A tapered smaller offshoot connects the tissue to the existing soil.
        c.beginPath();c.moveTo(ex*.58,ey*.6);c.quadraticCurveTo(ex*.74-14,ey*.56-12,ex*.85-23,ey*.7-23);
        c.strokeStyle='rgba(71,43,44,.3)';c.lineWidth=1.5;c.stroke();
      }
      }
      if(wet&&surfaceOnly){
        // Broken ellipses read as slow surface movement, never a danger ring.
        for(let j=0;j<3;j++){
          const p=((t*.95/(Math.PI*2)+seed+j/3)%1+1)%1;
          c.beginPath();c.ellipse(-18+j*15,8+j*6,14+p*45,5+p*12,-.15,.3+j,3.9+j);
          c.strokeStyle='rgba(149,142,83,'+((1-p)*.16)+')';c.lineWidth=1;c.stroke();
        }
      }
      c.restore();
    }
    c.restore();
  }
  const atlases=[];
  function atlas(wet,surfaceOnly=false){
    const id=surfaceOnly?2:wet?1:0;if(atlases[id])return atlases[id];
    const a=root.document.createElement('canvas');a.width=1280;a.height=1280;
    const c=a.getContext('2d'),type=wet?'m_c1pool':'m_rotten_tree';
    for(let f=0;f<16;f++){
      c.save();c.translate((f%4)*320+160,Math.floor(f/4)*320+160);
      paint(c,{stage:0,cam:{x:0,y:0}},[{type,x:0,y:0,scale:1/kinds[type]}],f/16*Math.PI*2/.00095,320,320,surfaceOnly);c.restore();
    }
    atlases[id]=a;return a;
  }
  function draw(c,g,objects,now,width,height,surfaceOnly=false){
    if(!enabled(g))return;
    const z=Math.max(.3,g._edZoom||g._camZoom||1),hw=width/(2*z),hh=height/(2*z);
    c.save();const alpha=c.globalAlpha;
    for(const o of objects){
      const k=kinds[o.type];if(!k)continue;
      const wet=o.type==='m_c1pool'||o.type==='pit_poison';if(surfaceOnly&&!wet)continue;
      const s=k*Math.min(1.6,o.scale||1),pad=160*s;
      const y=o.y+(surfaceOnly?0:(feet[o.type]||0)*(o.scale||1));
      if(Math.abs(o.x-g.cam.x)>hw+pad||Math.abs(y-g.cam.y)>hh+pad)continue;
      const a=atlas(wet,surfaceOnly);
      const phase=((now*.00095+o.x*.017+o.y*.011)/(Math.PI*2)%1+1)%1*16;
      const f=Math.floor(phase),next=(f+1)%16,mix=phase-f;
      c.globalAlpha=alpha*(1-mix);c.drawImage(a,(f%4)*320,Math.floor(f/4)*320,320,320,o.x-pad,y-pad,320*s,320*s);
      c.globalAlpha=alpha*mix;c.drawImage(a,(next%4)*320,Math.floor(next/4)*320,320,320,o.x-pad,y-pad,320*s,320*s);
    }
    c.restore();
  }
  function deform(c,g,o,now){
    if(!enabled(g)||!['m_c1cocoon','m_c1spod'].includes(o.type))return false;
    const wave=Math.sin(now*.00105+o.x*.017+o.y*.011);
    c.save();c.translate(o.x,o.y+32);c.scale(1+wave*.018,1-wave*.012);c.translate(-o.x,-o.y-32);
    return true;
  }
  root.Ch1LivingDetail=Object.freeze({draw,deform});
})(globalThis);
