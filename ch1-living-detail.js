/* CH1-1 local living tissue. Visual only; coordinates and collision stay owned by the map. */
(function(root){
  'use strict';
  const kinds={m_c1tree:2.1,m_c1cocoon:1.1,m_c1pool:1.25,m_c1spod:.65,m_c1sroot:.75,pit_poison:1.2,m_rotten_tree:1,tissue_bed:1.8};
  const ground=[[91,181,-.3],[114,177,.5],[87,155,.7],[122,148,-.5],[79,124,.2],[119,114,-.8],[85,96,.4],[126,81,-.6],[91,62,.5],[116,47,-.2],[97,27,.8]].map(([x,y,angle])=>({type:'tissue_bed',x:(x+.5)*40,y:(y+.5)*40,angle}));
  function isTree(type){return type==='m_c1tree'||type==='m_rotten_tree'||type==='m_vine_pillar'||/^m_ctree\d+$/.test(type);}
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
      const seed=o.x*.017+o.y*.011+(o.variant||0)*1.7,t=now*.001,phase=t*.95+seed;
      const wet=o.type==='m_c1pool'||o.type==='pit_poison';
      c.save();c.translate(o.x,o.y);c.scale(s,s);
      // Broad soft contact shadow: independent of the moving raised tissue.
      if(!surfaceOnly){
      c.save();c.translate(12,24);c.scale(1,.42);
      const shade=c.createRadialGradient(0,0,12,0,0,156);
      shade.addColorStop(0,'rgba(9,5,10,.48)');shade.addColorStop(.48,'rgba(12,7,12,.25)');shade.addColorStop(1,'rgba(12,7,12,0)');
      c.fillStyle=shade;c.fillRect(-156,-156,312,312);c.restore();
      // Matte, irregular wet contact patches stay below the raised veins.
      for(let j=0;j<7;j++){
        const x=Math.cos(j*2.399)*38,y=18+Math.sin(j*2.399)*17;
        c.save();c.translate(x,y);c.scale(1,.38);
        const stain=c.createRadialGradient(0,0,3,0,0,48);
        stain.addColorStop(0,wet?'rgba(52,53,29,.22)':'rgba(55,29,40,.22)');stain.addColorStop(1,'rgba(30,19,28,0)');
        c.fillStyle=stain;c.fillRect(-48,-48,96,96);c.restore();
      }
      // Uneven branching tendons, each pulse delayed along the length.
      for(let j=0;j<(wet?5:3+(o.variant||0));j++){
        const a=seed+j*2.399,len=100+42*Math.sin(seed+j*1.7),ex=Math.cos(a)*len,ey=Math.sin(a)*len*.55+24;
        const sx=Math.sin(j*1.3+seed)*22,sy=8+Math.cos(j*1.9+seed)*12;
        const bend=Math.sin(phase-j*.8)*22,pulse=.5+.5*Math.sin(phase-j*.8);
        const points=[];
        for(let k=0;k<=32;k++){
          const u=k/32,v=1-u,taper=Math.pow(v,.8),wrinkle=Math.sin(u*31+j)*u*v*2;
          const nx=v*v*v*sx+3*v*v*u*(ex*.24-18)+3*v*u*u*(ex*.64+22)+u*u*u*ex+wrinkle;
          const ny=v*v*v*sy+3*v*v*u*(ey*.1+bend)+3*v*u*u*(ey*.95-bend)+u*u*u*ey;
          // A localized pressure wave travels along the artery, rather than flashing it.
          const pressure=Math.pow(.5+.5*Math.sin(phase-u*Math.PI*2-j*.8),6);
          const emerge=Math.sin(Math.min(1,u/.14)*Math.PI/2);
          points.push({x:nx,y:ny-pressure*7*Math.sin(u*Math.PI),w:(((5.2+pulse*1.5)+pressure*9)*taper+.2)*emerge});
        }
        // Single filled ribbons remove the dark joins from overlapping short strokes.
        function ribbon(factor,extra,dx,dy,color){
          c.beginPath();
          for(let side=1;side>=-1;side-=2){
            for(let n=0;n<points.length;n++){
              const k=side===1?n:points.length-1-n,p=points[k];
              const prev=points[Math.max(0,k-1)],next=points[Math.min(points.length-1,k+1)];
              const vx=next.x-prev.x,vy=next.y-prev.y,len=Math.hypot(vx,vy)||1;
              const radius=p.w*factor+extra;
              const x=p.x-vy/len*radius*side+dx,y=p.y+vx/len*radius*side+dy;
              if(side===1&&n===0)c.moveTo(x,y);else c.lineTo(x,y);
            }
          }
          c.closePath();c.fillStyle=color;c.fill();
        }
        ribbon(.6,2.2,1.5,2.5,'rgba(13,7,12,.32)');
        ribbon(.5,0,0,0,wet?'rgba(63,61,35,.65)':'rgba(87,44,52,.78)');
        ribbon(.19,0,-.7,-1.3,'rgba(158,119,114,.3)');
        // A tapered smaller offshoot connects the tissue to the existing soil.
        c.beginPath();c.moveTo(ex*.58,ey*.6);c.quadraticCurveTo(ex*.74-14,ey*.56-12,ex*.85-23,ey*.7-23);
        c.strokeStyle='rgba(71,43,44,.3)';c.lineWidth=1.5;c.stroke();
      }
      }
      if(wet&&surfaceOnly){
        for(let j=0;j<5;j++){
          const p=((phase/(Math.PI*2)+j*.219)%1+1)%1;
          const x=Math.cos(j*2.399)*42,y=Math.sin(j*2.399)*19;
          const swell=Math.sin(Math.min(1,p/.72)*Math.PI/2),r=2+swell*5;
          if(p<.72){
            c.beginPath();c.ellipse(x,y-r*.45,r,r*.65,0,0,Math.PI*2);
            c.fillStyle='rgba(25,30,16,'+(Math.sin(p/.72*Math.PI)*.65)+')';c.fill();
            c.beginPath();c.ellipse(x-1,y-r*.45-1,r*.72,r*.43,-.2,3.4,5.7);
            c.strokeStyle='rgba(156,151,94,'+(Math.sin(p/.72*Math.PI)*.48)+')';c.lineWidth=1.2;c.stroke();
          }else{
            const q=(p-.72)/.28;
            c.beginPath();c.ellipse(x,y,7+q*15,3+q*6,0,.2,5.4);
            c.strokeStyle='rgba(143,140,83,'+((1-q)*.3)+')';c.lineWidth=1;c.stroke();
          }
        }
        // Broken ellipses read as slow surface movement, never a danger ring.
        for(let j=0;j<3;j++){
          const p=((t*.95/(Math.PI*2)+seed+j/3)%1+1)%1;
          c.beginPath();c.ellipse(-18+j*15,8+j*6,14+p*45,5+p*12,-.15,.3+j,3.9+j);
          c.strokeStyle='rgba(149,142,83,'+((1-p)*.16)+')';c.lineWidth=1;c.stroke();
        }
      }
      if(!wet&&surfaceOnly){
        for(let j=0;j<3;j++){
          const p=((phase/(Math.PI*2)+j/3)%1+1)%1,x=(j-1)*23;
          if(p<.65){
            const q=p/.65;
            c.beginPath();c.ellipse(x+Math.sin(phase+j)*2,-42+q*q*56,2.2,3+q*3,0,0,Math.PI*2);
            c.fillStyle='rgba(92,74,55,'+(Math.sin(q*Math.PI)*.65)+')';c.fill();
          }else{
            const q=(p-.65)/.35;
            c.beginPath();c.ellipse(x,14,3+q*14,1+q*4,0,.3,5.7);
            c.strokeStyle='rgba(115,88,71,'+((1-q)*.3)+')';c.lineWidth=1;c.stroke();
          }
        }
      }
      c.restore();
    }
    c.restore();
  }
  const atlases=[];
  function atlas(wet,surfaceOnly=false,variant=0){
    const id=surfaceOnly?(wet?2:3):wet?1:variant?3+variant:0;if(atlases[id])return atlases[id];
    const a=root.document.createElement('canvas');a.width=1280;a.height=1280;
    const c=a.getContext('2d'),type=wet?'m_c1pool':'m_rotten_tree';
    for(let f=0;f<16;f++){
      c.save();c.translate((f%4)*320+160,Math.floor(f/4)*320+160);
      c.beginPath();c.rect(-160,-160,320,320);c.clip();
      paint(c,{stage:0,cam:{x:0,y:0}},[{type,x:0,y:0,variant,scale:1/kinds[type]}],f/16*Math.PI*2/.00095,320,320,surfaceOnly);
      if(!surfaceOnly){
        // Feather each cell independently so distant vein tips sink into the soil.
        c.globalCompositeOperation='destination-in';
        const fade=c.createRadialGradient(0,12,82,0,12,155);
        fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle=fade;c.fillRect(-160,-160,320,320);
      }
      c.restore();
    }
    atlases[id]=a;return a;
  }
  function draw(c,g,objects,now,width,height,surfaceOnly=false){
    if(!enabled(g))return;
    const z=Math.max(.3,g._edZoom||g._camZoom||1),hw=width/(2*z),hh=height/(2*z);
    c.save();const alpha=c.globalAlpha;
    for(let i=0;i<objects.length+(surfaceOnly?0:ground.length);i++){
      const o=i<objects.length?objects[i]:ground[i-objects.length];
      const k=kinds[o.type];if(!k)continue;
      const wet=o.type==='m_c1pool'||o.type==='pit_poison';
      const secretion=o.type==='m_c1cocoon'||o.type==='m_c1spod';
      if(surfaceOnly&&!wet&&!secretion)continue;
      const s=k*Math.min(1.6,o.scale||1),pad=160*s;
      const y=o.y+((surfaceOnly&&wet)?0:(feet[o.type]||0)*(o.scale||1));
      if(Math.abs(o.x-g.cam.x)>hw+pad||Math.abs(y-g.cam.y)>hh+pad)continue;
      const variant=wet||surfaceOnly?0:Math.abs(Math.floor(o.x/40)*7+Math.floor(o.y/40)*11)%3;
      const a=atlas(wet,surfaceOnly,variant);
      const phase=((now*.00095+o.x*.017+o.y*.011)/(Math.PI*2)%1+1)%1*16;
      const f=Math.floor(phase),next=(f+1)%16,mix=phase-f;
      c.save();c.translate(o.x,y);if(o.angle)c.rotate(o.angle);
      c.globalAlpha=alpha*(1-mix);c.drawImage(a,(f%4)*320,Math.floor(f/4)*320,320,320,-pad,-pad,320*s,320*s);
      c.globalAlpha=alpha*mix;c.drawImage(a,(next%4)*320,Math.floor(next/4)*320,320,320,-pad,-pad,320*s,320*s);c.restore();
    }
    c.restore();
  }
  const shadowCache=new WeakMap();
  function shadows(c,g,objects,sprites,metas,now,width,height){
    if(!enabled(g))return;
    const z=Math.max(.3,g._edZoom||g._camZoom||1),hw=width/(2*z),hh=height/(2*z);
    c.save();const alpha=c.globalAlpha;
    for(const o of objects){
      if(!isTree(o.type))continue;
      const img=sprites[o.type],meta=metas[o.type];
      if(!img||!meta||img.complete===false||!(img.naturalWidth||img.width))continue;
      const size=(meta.sz||400)*(o.scale||1),scale=size*(o.type==='m_c1tree'?.72:1)/400;
      const foot=o.y+size*(o.type==='m_c1tree'?.2016:.45);
      if(Math.abs(o.x-g.cam.x)>hw+size||Math.abs(foot-g.cam.y)>hh+size)continue;
      let tex=shadowCache.get(img);
      if(!tex){
        tex=root.document.createElement('canvas');tex.width=640;tex.height=320;
        const x=tex.getContext('2d'),r=meta.srcRect||[0,0,img.naturalWidth||img.width,img.naturalHeight||img.height];
        x.save();x.translate(170,24);x.transform(1,0,-.55,-.52,0,0);x.filter='blur(4px)';
        x.drawImage(img,r[0],r[1],r[2],r[3],-145,-400,290,400);x.restore();
        x.globalCompositeOperation='source-in';const fade=x.createLinearGradient(0,24,0,260);
        fade.addColorStop(0,'rgba(8,5,12,.65)');fade.addColorStop(.65,'rgba(8,5,12,.36)');fade.addColorStop(1,'rgba(8,5,12,0)');
        x.fillStyle=fade;x.fillRect(0,0,640,320);shadowCache.set(img,tex);
      }
      const drift=Math.sin(now*.00072+o.x*.017+o.y*.011)*4*scale;
      c.globalAlpha=alpha*.6;c.drawImage(tex,o.x-170*scale+drift,foot-24*scale,640*scale,320*scale);
    }
    c.restore();
  }
  function deform(c,g,o,now,meta){
    if(!enabled(g))return false;
    if(isTree(o.type)){
      const size=(meta&&meta.sz||400)*(o.scale||1),foot=o.y+(o.type==='m_c1tree'?size*.2016:size*.45);
      const wave=Math.sin(now*.00072+o.x*.017+o.y*.011)+.3*Math.sin(now*.00131+o.y*.019);
      c.save();c.translate(o.x,foot);c.rotate(wave*(o.type==='m_c1tree'?.009:.018));c.translate(-o.x,-foot);return true;
    }
    if(!['m_c1cocoon','m_c1spod'].includes(o.type))return false;
    const wave=Math.sin(now*.00105+o.x*.017+o.y*.011);
    c.save();c.translate(o.x,o.y+32);c.scale(1+wave*.018,1-wave*.012);c.translate(-o.x,-o.y-32);
    return true;
  }
  root.Ch1LivingDetail=Object.freeze({draw,deform,shadows});
})(globalThis);
