/* CH1-1 local living tissue. Visual only; coordinates and collision stay owned by the map. */
(function(root){
  'use strict';
  const kinds={m_c1tree:2.1,m_c1cocoon:1.1,m_c1pool:1.25,m_c1spod:.65,m_c1sroot:.75,pit_poison:1.2,_atlasDry:1,tissue_bed:1.8};
  const ground=[[91,181,-.3],[114,177,.5],[87,155,.7],[122,148,-.5],[79,124,.2],[119,114,-.8],[85,96,.4],[126,81,-.6],[91,62,.5],[116,47,-.2],[97,27,.8]].map(([x,y,angle])=>({type:'tissue_bed',x:(x+.5)*40,y:(y+.5)*40,angle}));
  function isTree(type){return type==='m_c1tree'||/^m_ctree\d+$/.test(type);}
  const feet={m_c1tree:230,m_c1cocoon:100,m_c1spod:40};
  function enabled(g){return g.stage===0&&!g._bossArena&&!g._fieldRebuildQA;}
  // Authored material transitions, not new props: preserve the open combat floor.
  const skinRegions=[
    {tx:49,ty:151,w:1440,h:880,variant:0},
    {tx:151,ty:136,w:1440,h:800,variant:1},
    {tx:100,ty:120,w:1360,h:820,variant:2},
    {tx:46,ty:107,w:960,h:640,variant:3},
    {tx:167,ty:47,w:900,h:680,variant:4}
  ];
  const regionSkins=[];
  function regionalSkin(variant){
    if(regionSkins[variant])return regionSkins[variant];
    const a=root.document.createElement('canvas');a.width=768;a.height=512;
    const c=a.getContext('2d');
    const palette=variant===4?['#353c2a','#413c36','#342e31']:variant===3?['#302d2c','#47403c','#3a3035']:variant===1?['#343034','#49443c','#303829']:variant===2?['#343034','#494042','#343034']:['#342e31','#4c403e','#342e2f'];
    const base=variant>=3?c.createLinearGradient(384,0,384,512):variant===1?c.createLinearGradient(0,256,768,256):c.createLinearGradient(0,0,180,512);
    base.addColorStop(0,palette[0]);base.addColorStop(.45,palette[1]);base.addColorStop(1,palette[2]);
    c.fillStyle=base;c.fillRect(0,0,768,512);
    let seed=1397+variant*971;
    function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
    // Broad bruising joins dead wood, skin and damp soil before the fine wrinkles.
    for(let j=0;j<28;j++){
      const x=rand()*768,y=rand()*512,r=35+rand()*100;
      const stain=c.createRadialGradient(x,y,0,x,y,r);
      stain.addColorStop(0,j%3?'rgba(27,22,26,.23)':'rgba(118,101,84,.14)');
      stain.addColorStop(1,'rgba(40,29,34,0)');c.fillStyle=stain;c.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let j=0;j<9500;j++){
      const x=rand()*768,y=rand()*512,r=.4+rand()*1.6;
      c.fillStyle=j%3?'rgba(23,18,21,.09)':'rgba(170,150,126,.08)';c.fillRect(x,y,r*1.8,r);
    }
    // Unequal, shallow folds: avoid stripes and high-contrast combat-warning shapes.
    for(let j=0;j<23;j++){
      const x=40+rand()*510,y=48+rand()*400,len=35+rand()*90,bend=6+rand()*12;
      c.save();c.translate(x,y);c.rotate((rand()-.5)*1.4);
      c.beginPath();c.moveTo(0,0);c.bezierCurveTo(len*.3,-bend,len*.7,bend*.4,len,-bend*.3);
      c.strokeStyle='rgba(29,22,27,.22)';c.lineWidth=1.2+rand()*1.6;c.stroke();
      c.save();c.translate(0,-1.4);c.strokeStyle='rgba(156,134,116,.14)';c.lineWidth=.8;c.stroke();c.restore();
      c.restore();
    }
    if(variant===0){
      // Broad matte tissue folds replace leaf-pattern contrast without raised obstacles.
      for(const [sx,sy,cx,cy,ex,ey] of [[110,246,166,340,324,374],[270,170,346,220,394,298],[512,182,468,288,588,340],[264,395,358,408,430,350],[556,425,600,350,668,280]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy-22,cx,cy,ex,ey);
        c.strokeStyle='rgba(32,23,29,.16)';c.lineWidth=5;c.stroke();
        c.save();c.translate(0,-1.5);c.strokeStyle='rgba(148,121,111,.14)';c.lineWidth=1.5;c.stroke();c.restore();
      }
      // Worn red-brown soil connects the western arch foot to the existing skin ground.
      for(const [sx,sy,cx,cy,ex,ey,width] of [[105,318,164,342,290,365,6],[124,285,218,312,348,322,4],[142,346,206,382,268,401,5]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy,cx,cy,ex,ey);
        c.strokeStyle='rgba(43,24,27,.2)';c.lineWidth=width;c.stroke();
        c.save();c.translate(0,-1);c.strokeStyle='rgba(131,106,91,.12)';c.lineWidth=1;c.stroke();c.restore();
      }
    }
    if(variant===1){
      // Broad, shallow tissue folds converge into the contaminated bank, not a new obstacle.
      for(const [sx,sy,cx,cy,ex,ey,width] of [[245,192,455,215,691,273,12],[330,358,495,307,715,319,9],[432,120,556,161,678,230,7]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy,cx,cy,ex,ey);
        c.strokeStyle='rgba(24,26,19,.16)';c.lineWidth=width;c.stroke();
        c.save();c.translate(0,-2);c.strokeStyle='rgba(120,112,84,.12)';c.lineWidth=1.1;c.stroke();c.restore();
      }
    }
    if(variant===2){
      // Sparse, unequal folds keep the central fighting floor flat and quiet.
      for(const [sx,sy,cx,cy,ex,ey] of [[190,160,255,235,310,330],[410,120,360,215,470,285],[550,260,520,352,620,390],[280,395,380,360,432,420]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy-18,cx,cy,ex,ey);
        c.strokeStyle='rgba(31,24,30,.14)';c.lineWidth=4;c.stroke();
        c.save();c.translate(-1,-1);c.strokeStyle='rgba(145,123,117,.12)';c.lineWidth=1;c.stroke();c.restore();
      }
    }
    if(variant===2){
      // Short seams join the northern soil and the southern approach to the membrane.
      for(const [sx,sy,cx,cy,ex,ey] of [[270,98,304,128,330,202],[410,72,388,127,438,179],[338,358,302,410,354,466],[482,348,510,409,456,454]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy+18,cx,cy,ex,ey);
        c.strokeStyle='rgba(35,26,30,.16)';c.lineWidth=3;c.stroke();
        c.save();c.translate(-1,-1);c.strokeStyle='rgba(133,117,106,.1)';c.lineWidth=1;c.stroke();c.restore();
      }
    }
    if(variant===3){
      // Shallow creases carry the camp's ash into the dead tissue in front of its roots.
      for(const [sx,sy,cx,cy,ex,ey] of [[185,178,280,245,370,386],[310,168,385,246,558,320],[456,204,517,293,490,416]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy,cx,cy,ex,ey);
        c.strokeStyle='rgba(26,22,25,.2)';c.lineWidth=5;c.stroke();
        c.save();c.translate(-1,-1);c.strokeStyle='rgba(133,117,105,.16)';c.lineWidth=1;c.stroke();c.restore();
      }
    }
    if(variant===4){
      // Shallow seams carry damp soil away from the pool into the southern approach.
      for(const [sx,sy,cx,cy,ex,ey] of [[330,145,260,275,235,405],[410,170,455,280,520,370],[370,230,350,340,390,450]]){
        c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(cx,sy,cx,cy,ex,ey);
        c.strokeStyle='rgba(24,27,21,.18)';c.lineWidth=4;c.stroke();
        c.save();c.translate(-1,-1);c.strokeStyle='rgba(119,117,92,.12)';c.lineWidth=1;c.stroke();c.restore();
      }
    }
    // A continuous feathered, asymmetric edge, with no visible rectangular bounds.
    const mask=root.document.createElement('canvas');mask.width=768;mask.height=512;
    const m=mask.getContext('2d');
    const lobes=variant===4?[[384,190,240,160],[295,310,220,145],[520,340,170,120]]:variant===3?[[300,220,280,180],[500,290,190,145],[340,365,200,120]]:[[300,255,288,210],[500,225,232,172],[440,332,220,152]];
    if(variant===0)lobes.push([108,308,86,95]);
    if(variant===1)lobes.push([670,270,94,142],[155,282,146,140]);
    if(variant===2)lobes.push([325,113,205,106],[400,405,182,99]);
    for(const [x,y,rx,ry] of lobes){
      m.save();m.translate(x+(variant>=3?0:(variant-1)*18),y);m.scale(rx,ry);
      const fade=m.createRadialGradient(0,0,.12,0,0,1);
      fade.addColorStop(0,'rgba(0,0,0,.88)');fade.addColorStop(.48,'rgba(0,0,0,.75)');fade.addColorStop(1,'rgba(0,0,0,0)');
      m.fillStyle=fade;m.fillRect(-1,-1,2,2);m.restore();
    }
    c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);
    regionSkins[variant]=a;return a;
  }
  const membranes=[];
  function membrane(wet,variant){
    const id=wet?3:variant;if(membranes[id])return membranes[id];
    const a=root.document.createElement('canvas');a.width=a.height=320;
    const c=a.getContext('2d');c.translate(160,160);c.save();c.beginPath();
    for(let j=0;j<=72;j++){
      const angle=j/72*Math.PI*2,r=102+18*Math.sin(angle*3+variant)+11*Math.cos(angle*5-variant);
      const x=Math.cos(angle)*r*1.12,y=12+Math.sin(angle)*r*.62;
      if(j)c.lineTo(x,y);else c.moveTo(x,y);
    }
    c.closePath();c.clip();
    const skin=c.createLinearGradient(0,-70,0,85);
    skin.addColorStop(0,'rgba(34,25,31,.12)');
    skin.addColorStop(.43,wet?'rgba(74,72,48,.54)':'rgba(102,79,82,.54)');
    skin.addColorStop(1,'rgba(26,18,25,.12)');c.fillStyle=skin;c.fillRect(-160,-160,320,320);
    // Stable fine mottling belongs to the material; it does not flicker with the animation.
    let seed=781+variant*357+(wet?91:0);
    function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
    for(let j=0;j<1600;j++){
      const x=rand()*290-145,y=rand()*180-90,r=.35+rand()*1.3;
      c.fillStyle=j%3?'rgba(33,20,28,.08)':'rgba(169,144,130,.1)';
      c.fillRect(x,y,r*1.8,r);
    }
    for(let j=0;j<9;j++){
      const y=-42+j*12,x=-104+Math.sin(j*2.1+variant)*16;
      c.beginPath();c.moveTo(x,y);c.bezierCurveTo(-42,y-16,32,y+13,104-Math.cos(j)*18,y-5);
      c.strokeStyle='rgba(29,18,27,.18)';c.lineWidth=1.7;c.stroke();
      c.save();c.translate(0,-1.2);c.strokeStyle='rgba(171,143,132,.12)';c.lineWidth=.8;c.stroke();c.restore();
    }
    c.restore();c.globalCompositeOperation='destination-in';
    const fade=c.createRadialGradient(0,12,28,0,12,143);
    fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=fade;c.fillRect(-160,-160,320,320);
    if(!wet){
      // Fade inside the actual lobed outline, rather than clipping an opaque oval.
      // Native pixels are processed once per cached material, never during draw.
      const image=c.getImageData(0,0,320,320),data=image.data;
      for(let y=0;y<320;y++)for(let x=0;x<320;x++){
        const dx=(x+.5-160)/1.12,dy=(y+.5-172)/.62,angle=Math.atan2(dy,dx);
        const radius=102+18*Math.sin(angle*3+variant)+11*Math.cos(angle*5-variant);
        const depth=radius-Math.hypot(dx,dy),t=Math.max(0,Math.min(1,depth/28));
        data[(y*320+x)*4+3]*=t*t*(3-2*t);
      }
      c.putImageData(image,0,0);
    }
    membranes[id]=a;return a;
  }
  // A planted root, reaching tip, then delayed body pull; one seamless crawl cycle.
  function tendonCrawl(u,phase,branch){
    const q=((phase-branch*.8-(1-u)*.85)/(Math.PI*2)%1+1)%1;
    const smooth=t=>t*t*(3-2*t);
    const reach=q<.32?smooth(q/.32):q<.52?1:q<.86?1-smooth((q-.52)/.34):0;
    return {along:18*reach*Math.pow(u,1.7),side:9*Math.sin(phase-u*5-branch*.8)*Math.sin(Math.PI*u)+3*Math.sin(phase-branch*.8)*u*u};
  }
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
      c.drawImage(membrane(wet,o.variant||0),-160,-160);
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
        // Every branch grows from one fixed attachment, not separate free-moving worms.
        const sx=0,sy=14;
        const bend=Math.sin(phase-j*.8)*7,pulse=.5+.5*Math.sin(phase-j*.8);
        const points=[];
        for(let k=0;k<=32;k++){
          const u=k/32,v=1-u,taper=Math.pow(v,.8),wrinkle=Math.sin(u*31+j)*u*v*2;
          const nx=v*v*v*sx+3*v*v*u*(ex*.24-18)+3*v*u*u*(ex*.64+22)+u*u*u*ex+wrinkle;
          const ny=v*v*v*sy+3*v*v*u*(ey*.1)+3*v*u*u*(ey*.95)+u*u*u*ey+bend*Math.pow(Math.sin(u*Math.PI),2);
          // A localized pressure wave travels along the artery, rather than flashing it.
          const pressure=Math.pow(.5+.5*Math.sin(phase-u*Math.PI*2-j*.8),6);
          const emerge=.7+.3*Math.sin(Math.min(1,u/.14)*Math.PI/2);
          const crawl=wet?{along:0,side:0}:tendonCrawl(u,phase,j);
          const axisLength=Math.hypot(ex,ey-sy)||1,ax=ex/axisLength,ay=(ey-sy)/axisLength;
          points.push({x:nx+ax*crawl.along-ay*crawl.side,y:ny+ay*crawl.along+ax*crawl.side-pressure*7*Math.sin(u*Math.PI),w:(((5.2+pulse*1.5)+pressure*9)*taper+.2)*emerge});
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
        const joint=points[19];
        c.beginPath();c.moveTo(joint.x,joint.y);if(wet)c.quadraticCurveTo(ex*.74-14,ey*.56-12,ex*.85-23,ey*.7-23);
        else c.quadraticCurveTo(joint.x-12,joint.y-9,joint.x-23,joint.y-23);
        c.strokeStyle='rgba(71,43,44,.3)';c.lineWidth=1.5;c.stroke();
      }
      // A stationary broad tissue seam covers the joins and anchors them into the skin.
      c.save();c.translate(0,14);c.scale(1,.42);
      const attachment=c.createRadialGradient(0,0,2,0,0,23);
      attachment.addColorStop(0,wet?'rgba(64,60,37,.95)':'rgba(83,47,53,.95)');
      attachment.addColorStop(.55,wet?'rgba(66,59,40,.75)':'rgba(81,50,57,.75)');
      attachment.addColorStop(1,'rgba(63,40,46,0)');
      c.fillStyle=attachment;c.fillRect(-23,-23,46,46);c.restore();
      }
      if(wet&&surfaceOnly){
        // Thin rising pockets of damp vapor; opacity vanishes at both loop ends.
        for(let j=0;j<3;j++){
          const p=((phase/(Math.PI*2)+j/3)%1+1)%1;
          const opacity=Math.pow(Math.sin(p*Math.PI),1.4)*.24;
          const x=(j-1)*35+Math.sin(p*Math.PI*2+j)*14,y=6-p*105;
          const radius=13+p*17;
          c.save();c.translate(x,y);c.scale(.72,1.4);
          const mist=c.createRadialGradient(0,0,0,0,0,radius);
          mist.addColorStop(0,'rgba(157,150,105,'+opacity+')');
          mist.addColorStop(.45,'rgba(105,111,74,'+(opacity*.65)+')');
          mist.addColorStop(1,'rgba(74,83,55,0)');
          c.fillStyle=mist;c.fillRect(-radius,-radius,radius*2,radius*2);c.restore();
        }
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
            // A sticky neck stretches, thins, then detaches before the droplet lands.
            if(q<.82){
              const endY=-42+q*q*56,drift=Math.sin(phase+j)*2;
              c.beginPath();c.moveTo(x,-44);c.quadraticCurveTo(x-3+drift,-40+(endY+42)*.45,x+drift,endY);
              c.strokeStyle='rgba(112,91,66,'+((1-q/.82)*.55)+')';
              c.lineWidth=2.2*(1-q/.82)+.35;c.stroke();
              c.save();c.translate(-.65,0);c.strokeStyle='rgba(176,151,108,'+((1-q/.82)*.24)+')';c.lineWidth=.65;c.stroke();c.restore();
            }
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
    const c=a.getContext('2d'),type=wet?'m_c1pool':'_atlasDry';
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
    if(!surfaceOnly)for(const region of skinRegions){
      const x=(region.tx+.5)*40,y=(region.ty+.5)*40;
      if(Math.abs(x-g.cam.x)>hw+region.w/2||Math.abs(y-g.cam.y)>hh+region.h/2)continue;
      c.globalAlpha=alpha*(region.variant===0?.82:region.variant===1||region.variant===2?.76:.6);c.drawImage(regionalSkin(region.variant),x-region.w/2,y-region.h/2,region.w,region.h);c.globalAlpha=alpha;
    }
    for(let i=0;i<objects.length+(surfaceOnly?0:ground.length);i++){
      const o=i<objects.length?objects[i]:ground[i-objects.length];
      const k=kinds[o.type];if(!k)continue;
      const wet=o.type==='m_c1pool'||o.type==='pit_poison';
      const secretion=o.type==='m_c1cocoon'||o.type==='m_c1spod';
      if(surfaceOnly&&!wet&&!secretion)continue;
      const s=k*Math.min(1.6,o.scale||1),pad=160*s;
      const y=o.y+((surfaceOnly&&wet)?0:(feet[o.type]||0)*(o.scale||1));
      if(Math.abs(o.x-g.cam.x)>hw+pad||Math.abs(y-g.cam.y)>hh+pad)continue;
      if(surfaceOnly&&o.type==='m_c1pool'&&o.x===6700&&o.y===1740){poolSurface(c,o,now);continue;}
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
  const rootContactCache=new WeakMap();
  const raisedShadowCache=new WeakMap();
  const debrisContactCache=new WeakMap();
  function debrisContact(img){
    const cache=debrisContactCache;
    if(cache.has(img))return cache.get(img);
    const a=root.document.createElement('canvas');a.width=a.height=256;
    const c=a.getContext('2d');c.drawImage(img,32,32,192,192);
    const pixels=c.getImageData(0,0,256,256),p=pixels.data,d=new Uint8Array(256*256);
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const i=y*256+x;d[i]=p[i*4+3]>80?0:12;
      if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-256]+1);
    }
    for(let y=255;y>=0;y--)for(let x=255;x>=0;x--){
      const i=y*256+x;if(x<255)d[i]=Math.min(d[i],d[i+1]+1);if(y<255)d[i]=Math.min(d[i],d[i+256]+1);
      const e=1-d[i]/12,t=Math.max(0,Math.min(1,(y-128)/64)),grain=.82+.18*Math.sin(x*.37+Math.cos(y*.21)*2),k=i*4;
      p[k]=29;p[k+1]=24;p[k+2]=24;p[k+3]=Math.round(255*.56*e*e*(3-2*e)*t*t*(3-2*t)*grain);
      if(!p[k+3])p[k]=p[k+1]=p[k+2]=0;
    }
    c.putImageData(pixels,0,0);cache.set(img,a);return a;
  }
  const poolContactCache=new WeakMap();
  function poolContact(img){
    if(poolContactCache.has(img))return poolContactCache.get(img);
    const a=root.document.createElement('canvas');a.width=a.height=512;
    const c=a.getContext('2d');c.drawImage(img,48,48,416,416);
    const pixels=c.getImageData(0,0,512,512),p=pixels.data,d=new Uint8Array(512*512);
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const i=y*512+x;d[i]=p[i*4+3]>80?0:44;
      if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-512]+1);
    }
    for(let y=511;y>=0;y--)for(let x=511;x>=0;x--){
      const i=y*512+x;if(x<511)d[i]=Math.min(d[i],d[i+1]+1);if(y<511)d[i]=Math.min(d[i],d[i+512]+1);
      const left=Math.exp(-(((x-170)/110)**2+((y-350)/105)**2)),right=Math.exp(-(((x-365)/95)**2+((y-260)/115)**2));
      const reach=18+26*Math.max(left,right),e=Math.max(0,1-d[i]/reach),grain=.88+.12*Math.sin(x*.17+Math.cos(y*.13)*2),k=i*4;
      p[k]=24;p[k+1]=27;p[k+2]=19;p[k+3]=Math.round(255*.48*e*e*(3-2*e)*grain);
      if(!p[k+3])p[k]=p[k+1]=p[k+2]=0;
    }
    c.putImageData(pixels,0,0);poolContactCache.set(img,a);return a;
  }
  function shadows(c,g,objects,sprites,metas,now,width,height){
    if(!enabled(g))return;
    const z=Math.max(.3,g._edZoom||g._camZoom||1),hw=width/(2*z),hh=height/(2*z);
    c.save();const alpha=c.globalAlpha;
    for(const o of objects){
      if(o.type==='m_c1pool'&&o.x===6700&&o.y===1740){
        const img=sprites[o.type],meta=metas[o.type];
        if(!img||img.complete===false||!(img.naturalWidth||img.width)||!meta||meta.srcRect||meta.sheet||meta.rot||o.rot||meta.anchorBottom||meta.pivotX!==undefined||meta.pivotY!==undefined)continue;
        const size=(meta.sz||300)*(o.scale||1),source=meta.sourceSize||[img.naturalWidth||img.width,img.naturalHeight||img.height],ar=source[0]/source[1];
        const dw=meta.keepAR&&!meta.squareDraw?size*Math.min(1,ar):size,dh=meta.keepAR&&!meta.squareDraw?size*Math.min(1,1/ar):size;
        if(Math.abs(o.x-g.cam.x)>hw+dw||Math.abs(o.y-g.cam.y)>hh+dh)continue;
        c.save();c.translate(o.x,o.y);if(meta.flip)c.scale(-1,1);c.globalAlpha=alpha;
        c.drawImage(poolContact(img),-dw/2-48*dw/416,-dh/2-48*dh/416,512*dw/416,512*dh/416);c.restore();continue;
      }
      const debris=(o.type==='m_c1sbone'&&o.x===1940&&o.y===4340)||(o.type==='m_sword_pile'&&o.x===1580&&o.y===4180)||(o.type==='m_bone_arch'&&o.x===1420&&o.y===6020);
      if(debris){
        const img=sprites[o.type],meta=metas[o.type];
        if(!img||img.complete===false||!(img.naturalWidth||img.width)||!meta||meta.srcRect||meta.sheet||meta.rot||o.rot||meta.anchorBottom||meta.pivotX!==undefined||meta.pivotY!==undefined)continue;
        const size=(meta.sz||200)*(o.scale||1),source=meta.sourceSize||[img.naturalWidth||img.width,img.naturalHeight||img.height],ar=source[0]/source[1];
        const dw=meta.keepAR&&!meta.squareDraw?size*Math.min(1,ar):size,dh=meta.keepAR&&!meta.squareDraw?size*Math.min(1,1/ar):size;
        if(Math.abs(o.x-g.cam.x)>hw+dw||Math.abs(o.y-g.cam.y)>hh+dh)continue;
        c.save();c.translate(o.x,o.y);if(meta.flip)c.scale(-1,1);c.globalAlpha=alpha;
        c.drawImage(debrisContact(img),-dw/2-32*dw/192,-dh/2-32*dh/192,256*dw/192,256*dh/192);c.restore();
        continue;
      }
      const raised=o.type==='m_c1cocoon'||o.type==='m_c1spod';
      if(!isTree(o.type)&&!raised)continue;
      const img=sprites[o.type],meta=metas[o.type];
      if(!img||!meta||img.complete===false||!(img.naturalWidth||img.width))continue;
      if(raised){
        const size=(meta.sz||280)*(o.scale||1),scale=size/320,foot=o.y+(feet[o.type]||0)*(o.scale||1);
        if(Math.abs(o.x-g.cam.x)>hw+size||Math.abs(foot-g.cam.y)>hh+size)continue;
        let tex=raisedShadowCache.get(img);
        if(!tex){
          tex=root.document.createElement('canvas');tex.width=640;tex.height=320;
          const x=tex.getContext('2d'),r=meta.srcRect||[0,0,img.naturalWidth||img.width,img.naturalHeight||img.height];
          x.save();x.translate(260,32);x.transform(1,0,-.65,-.32,0,0);x.filter='blur(5px)';
          x.drawImage(img,r[0],r[1],r[2],r[3],-160,-320,320,320);x.restore();
          x.globalCompositeOperation='source-in';
          const fade=x.createLinearGradient(0,32,0,175);
          fade.addColorStop(0,'rgba(9,7,13,.58)');fade.addColorStop(.6,'rgba(9,7,13,.26)');fade.addColorStop(1,'rgba(9,7,13,0)');
          x.fillStyle=fade;x.fillRect(0,0,640,320);
          x.globalCompositeOperation='source-over';x.save();x.translate(260,32);x.scale(1,.22);
          const contact=x.createRadialGradient(0,0,8,0,0,135);
          contact.addColorStop(0,'rgba(9,6,12,.42)');contact.addColorStop(1,'rgba(9,6,12,0)');
          x.fillStyle=contact;x.fillRect(-135,-135,270,270);x.restore();raisedShadowCache.set(img,tex);
        }
        const wave=Math.sin(now*.00105+o.x*.017+o.y*.011);
        c.save();c.translate(o.x,foot);c.scale(1+wave*.018,1-wave*.012);
        c.globalAlpha=alpha*.85;c.drawImage(tex,-260*scale,-32*scale,640*scale,320*scale);c.restore();
        continue;
      }
      const size=(meta.sz||400)*(o.scale||1),scale=size*(o.type==='m_c1tree'?.72:1)/400;
      const foot=o.y+size*(o.type==='m_c1tree'?.2016:.45);
      if(Math.abs(o.x-g.cam.x)>hw+size||Math.abs(foot-g.cam.y)>hh+size)continue;
      if(o.type==='m_c1tree'){
        // The existing root alpha supplies the contact silhouette; no new ground prop.
        let contact=rootContactCache.get(img);
        const r=meta.srcRect||[0,0,img.naturalWidth||img.width,img.naturalHeight||img.height];
        if(!contact){
          contact=root.document.createElement('canvas');contact.width=512;contact.height=192;
          const b=contact.getContext('2d');b.filter='blur(6px)';
          b.drawImage(img,r[0],r[1]+r[3]*.72,r[2],r[3]*.28,16,16,480,160);
          b.filter='none';b.globalCompositeOperation='source-in';
          const fade=b.createLinearGradient(0,0,0,192);
          fade.addColorStop(0,'rgba(18,12,17,0)');fade.addColorStop(.25,'rgba(18,12,17,.3)');
          fade.addColorStop(.7,'rgba(18,12,17,.65)');fade.addColorStop(1,'rgba(18,12,17,0)');
          b.fillStyle=fade;b.fillRect(0,0,512,192);rootContactCache.set(img,contact);
        }
        const factor=o._hand?.72:1,ar=r[2]/r[3],dw=size*Math.min(1,ar)*factor,dh=size*Math.min(1,1/ar)*factor;
        const sx=dw/480,sy=dh*.28*.55/160;
        const base=o.y+dh*(o._hand?.28:.5);
        c.globalAlpha=alpha;c.drawImage(contact,o.x-dw/2-16*sx,base-dh*.28*.55-16*sy+dh*.012,512*sx,192*sy);
      }
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
    if(o.type==='m_c1pool'){
      const wave=Math.sin(now*.00095+o.x*.017+o.y*.011);
      c.save();c.translate(o.x,o.y);c.scale(1+wave*.012,1-wave*.018);c.translate(-o.x,-o.y);return true;
    }
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
  function hideDuplicate(g,o,sprites){
    const pool=sprites&&sprites.m_c1pool;
    return enabled(g)&&o.type==='m_c1gtoxic'&&o.x===6740&&o.y===1620&&!!(pool&&pool.complete&&pool.naturalWidth>1);
  }
  const toxicRimCache=new WeakMap();
  function groundSprite(g,o,meta,img){
    if(!enabled(g)||o.type!=='m_c1gtoxicf'||o.x!==6500||o.y!==5460||!meta||meta.srcRect||!img||img.complete===false||!(img.naturalWidth||img.width))return img;
    if(toxicRimCache.has(img))return toxicRimCache.get(img);
    const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
    const a=root.document.createElement('canvas');a.width=w;a.height=h;
    const c=a.getContext('2d');c.drawImage(img,0,0);
    const pixels=c.getImageData(0,0,w,h),p=pixels.data,d=new Float32Array(w*h);
    // Distance from the existing transparent silhouette, including irregular notches.
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;d[i]=p[i*4+3]<=8?0:Math.min(64,x+1,y+1,w-x,h-y);
      if(x)d[i]=Math.min(d[i],d[i-1]+1);
      if(y)d[i]=Math.min(d[i],d[i-w]+1);
    }
    for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){
      const i=y*w+x;if(x+1<w)d[i]=Math.min(d[i],d[i+1]+1);
      if(y+1<h)d[i]=Math.min(d[i],d[i+w]+1);
    }
    for(let i=0;i<d.length;i++){
      const k=i*4,r=p[k],green=p[k+1],b=p[k+2];
      const spill=Math.max(0,Math.min(r,b)-green-6);
      const mix=Math.min(1,spill/10)*Math.min(1,Math.max(0,(64-d[i])/24));
      const l=r*.299+green*.587+b*.114;
      p[k]=r+(l*.96-r)*mix;p[k+1]=green+(l*.9-green)*mix;p[k+2]=b+(l*.76-b)*mix;
      // Dry white glints on the outer rock fade into the damp soil, not the liquid interior.
      const glare=Math.max(0,Math.min(1,(l-105)/110))*Math.max(0,1-d[i]/64)*.38;
      p[k]*=1-glare;p[k+1]*=1-glare;p[k+2]*=1-glare;
      // Dark contaminated soil settles into the floor; bright rock ridges keep a shorter edge.
      const rock=Math.max(0,Math.min(1,(l-35)/100)),edgeSpan=24+32*(1-rock);
      const fade=Math.min(1,d[i]/edgeSpan);p[k+3]*=fade*fade*(3-2*fade);
    }
    c.putImageData(pixels,0,0);
    // Keep the original sprite dimensions and the existing keepAR/flip/crop draw path.
    a.complete=true;a.naturalWidth=w;a.naturalHeight=h;toxicRimCache.set(img,a);return a;
  }
  // Four authored liquid pockets in prop_g_toxic.png (881 x 900 source space).
  const swampPockets=[
    [[225,145],[345,130],[434,142],[460,213],[494,269],[453,342],[390,370],[307,361],[268,310],[305,296],[250,253],[213,226]],
    [[532,295],[584,316],[658,322],[693,365],[687,417],[638,445],[600,478],[541,477],[476,489],[423,470],[421,421],[464,388],[488,339]],
    [[186,397],[228,403],[302,416],[347,444],[362,503],[328,548],[266,548],[233,513],[188,510],[153,493],[165,444]],
    [[416,537],[475,524],[539,547],[574,582],[591,628],[557,660],[474,658],[421,635],[385,611]]
  ];
  function paintSwampGas(c,bx,by,q,seed){
    if(q<=.6||q>=1)return;
    const p=(q-.6)/.4,opacity=Math.pow(Math.sin(p*Math.PI),1.4)*.5;
    for(let j=0;j<3;j++){
      const x=bx+Math.sin(p*4+seed+j)*(5+10*p)+(j-1)*7*p,y=by-8-p*78+j*6,r=12+20*p+j*2;
      c.save();c.translate(x,y);c.scale(.85,1.3);
      const mist=c.createRadialGradient(0,0,0,0,0,r),alpha=opacity*[.9,.65,.45][j];
      mist.addColorStop(0,'rgba(133,145,81,'+alpha+')');mist.addColorStop(.5,'rgba(89,104,56,'+(alpha*.5)+')');mist.addColorStop(1,'rgba(46,59,35,0)');
      c.fillStyle=mist;c.fillRect(-r,-r,r*2,r*2);c.restore();
    }
  }
  function paintSwampBubble(x,bx,by,q){
    if(q<.6){
      const tension=q>.54?Math.sin((q-.54)/.06*Math.PI):0;
      x.save();x.translate(bx,by);x.scale(1+.2*tension,1-.3*tension);x.translate(-bx,-by);

      const swell=Math.min(1,q/.46),r=3+13*swell*swell*(3-2*swell),appear=Math.min(1,q/.08),cy=by-r*.32;
      x.beginPath();x.ellipse(bx,by+r*.2,r*1.12,r*.42,0,0,Math.PI*2);x.fillStyle='rgba(9,15,8,'+(appear*.55)+')';x.fill();
      const skin=x.createRadialGradient(bx-r*.3,cy-r*.35,1,bx,cy,r*1.05);
      skin.addColorStop(0,'rgba(167,177,99,'+(appear*.95)+')');skin.addColorStop(.38,'rgba(93,116,51,'+(appear*.95)+')');
      skin.addColorStop(.8,'rgba(47,65,27,'+(appear*.94)+')');skin.addColorStop(1,'rgba(19,29,14,'+(appear*.9)+')');
      x.beginPath();x.ellipse(bx,cy,r,r*.85,0,0,Math.PI*2);x.fillStyle=skin;x.fill();
      x.strokeStyle='rgba(136,153,72,'+(appear*.7)+')';x.lineWidth=1;x.stroke();
      x.beginPath();x.ellipse(bx-r*.08,cy-r*.08,r*.78,r*.62,-.2,3.4,5.7);x.strokeStyle='rgba(208,210,137,'+(appear*.9)+')';x.lineWidth=1.8;x.stroke();
      x.beginPath();x.ellipse(bx-r*.25,cy-r*.32,r*.24,r*.13,-.35,0,Math.PI*2);x.fillStyle='rgba(218,220,154,'+(appear*.55)+')';x.fill();

      if(q>.57){
        const crack=Math.min(1,(q-.57)/.03);
        for(let n=0;n<3;n++){const angle=n/3*Math.PI*2-.8;x.beginPath();x.moveTo(bx,cy);x.lineTo(bx+Math.cos(angle+.25)*r*.38,cy+Math.sin(angle+.25)*r*.3);x.lineTo(bx+Math.cos(angle)*r*.78,cy+Math.sin(angle)*r*.65);x.strokeStyle='rgba(14,24,10,'+(crack*.9)+')';x.lineWidth=1.8;x.stroke();}
      }
      x.restore();return;
    }
    if(q>=.78)return;
    const ripple=(q-.6)/.18;
    x.beginPath();x.ellipse(bx,by,16+26*ripple,8+12*ripple,0,.2,6);x.strokeStyle='rgba(185,184,107,'+((1-ripple)*.75)+')';x.lineWidth=1.8;x.stroke();
    if(q<.66){
      const tear=(q-.6)/.06,outer=16+18*Math.sqrt(tear),inner=13+8*tear,lift=Math.sin(tear*Math.PI)*12;
      x.beginPath();x.ellipse(bx,by,11*(1-tear),5*(1-tear),0,0,Math.PI*2);x.fillStyle='rgba(7,16,7,'+((1-tear)*.7)+')';x.fill();
      for(let n=0;n<8;n++){
        const angle=n/8*Math.PI*2+.2;
        const p=(a,r)=>[bx+Math.cos(a)*r,by+Math.sin(a)*r*.65-lift];
        x.beginPath();x.moveTo(...p(angle-.15,inner));x.quadraticCurveTo(...p(angle-.08,outer*.9),...p(angle,outer));x.quadraticCurveTo(...p(angle+.08,outer*.9),...p(angle+.15,inner));x.closePath();
        x.fillStyle='rgba(129,151,64,'+((1-tear)*.9)+')';x.fill();x.strokeStyle='rgba(211,214,133,'+((1-tear)*.9)+')';x.lineWidth=1.6;x.stroke();
      }
    }
    if(q<.72){const flight=(q-.6)/.12;for(let n=0;n<8;n++){
      const angle=n/8*Math.PI*2+.25,distance=14+25*flight,px=bx+Math.cos(angle)*distance,py=by+Math.sin(angle)*distance*.5-Math.sin(flight*Math.PI)*18;
      x.beginPath();x.ellipse(px,py,2.6*(1-.6*flight),3.4*(1-.6*flight),angle,0,Math.PI*2);x.fillStyle='rgba(179,189,98,'+((1-flight)*.95)+')';x.fill();
    }}
  }
  const swampVents=swampPockets.flatMap((p,j)=>{const cx=p.reduce((n,v)=>n+v[0],0)/p.length*440/881,cy=p.reduce((n,v)=>n+v[1],0)/p.length*.5;return [0,1].map(k=>({x:cx+(k?15:-12),y:cy+(k?7:-8),offset:j*.23+k*.47}));});
  let swampBubbleAtlas;
  function bubbleAtlas(){
    if(swampBubbleAtlas)return swampBubbleAtlas;
    const a=root.document.createElement('canvas');a.width=a.height=768;const x=a.getContext('2d');
    for(let f=0;f<64;f++){x.save();x.beginPath();x.rect(f%8*96,Math.floor(f/8)*96,96,96);x.clip();paintSwampBubble(x,f%8*96+48,Math.floor(f/8)*96+64,f/64);x.restore();}
    swampBubbleAtlas=a;return a;
  }
  let poolGasAtlas;
  function poolSurface(c,o,now){
    if(!poolGasAtlas){
      const a=root.document.createElement('canvas');a.width=a.height=512;const x=a.getContext('2d');
      for(let f=0;f<16;f++){x.save();x.translate(f%4*128,Math.floor(f/4)*128);x.beginPath();x.rect(0,0,128,128);x.clip();paintSwampGas(x,64,112,f/16,1.3);x.restore();}
      poolGasAtlas=a;
    }
    const bubbles=bubbleAtlas(),scale=Math.min(1.6,o.scale||1),s=scale*.65,alpha=c.globalAlpha;
    const wave=Math.sin(now*.00095+o.x*.017+o.y*.011);
    c.save();c.translate(o.x,o.y);c.scale(1+wave*.012,1-wave*.018);
    for(const [vx,vy,offset] of [[-48,-24,0],[38,-6,.31],[-3,35,.67]]){
      const q=((now/6400+offset)%1+1)%1,b=q*64,bf=Math.floor(b),bn=(bf+1)%64,bmix=b-bf,g=q*16,gf=Math.floor(g),gn=(gf+1)%16,gmix=g-gf;
      const x=vx*scale,y=vy*scale;
      c.globalAlpha=alpha*(1-bmix);c.drawImage(bubbles,bf%8*96,Math.floor(bf/8)*96,96,96,x-48*s,y-64*s,96*s,96*s);
      c.globalAlpha=alpha*bmix;c.drawImage(bubbles,bn%8*96,Math.floor(bn/8)*96,96,96,x-48*s,y-64*s,96*s,96*s);
      c.globalAlpha=alpha*(1-gmix);c.drawImage(poolGasAtlas,gf%4*128,Math.floor(gf/4)*128,128,128,x-64*s,y-112*s,128*s,128*s);
      c.globalAlpha=alpha*gmix;c.drawImage(poolGasAtlas,gn%4*128,Math.floor(gn/4)*128,128,128,x-64*s,y-112*s,128*s,128*s);
    }
    c.restore();
  }
  function swampApron(img){
    const a=root.document.createElement('canvas');a.width=a.height=512;
    const c=a.getContext('2d');c.drawImage(img,36,31,440,450);
    const pixels=c.getImageData(0,0,512,512),p=pixels.data,d=new Uint8Array(512*512);
    // Distance outward from the actual alpha silhouette, never an oval shadow stamp.
    for(let y=0;y<512;y++)for(let x=0;x<512;x++){
      const i=y*512+x;d[i]=p[i*4+3]>80?0:30;
      if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-512]+1);
    }
    for(let y=511;y>=0;y--)for(let x=511;x>=0;x--){
      const i=y*512+x;if(x<511)d[i]=Math.min(d[i],d[i+1]+1);if(y<511)d[i]=Math.min(d[i],d[i+512]+1);
      const left=Math.exp(-(((x-140)/120)**2+((y-340)/145)**2));
      const lower=Math.exp(-(((x-340)/135)**2+((y-410)/95)**2));
      const reach=18+12*Math.max(left,lower),edge=Math.max(0,1-d[i]/reach),fade=edge*edge*(3-2*edge);
      const grain=.76+.14*Math.sin(x*.19+Math.sin(y*.11)*2)+.1*Math.sin(y*.31-x*.09);
      const damp=.5+.5*Math.sin(x*.043+Math.sin(y*.027)*2);
      const k=i*4;p[k]=27+10*damp;p[k+1]=28+10*damp;p[k+2]=19+4*damp;
      p[k+3]=Math.round(255*.58*fade*grain);
      if(!p[k+3])p[k]=p[k+1]=p[k+2]=0;
    }
    c.putImageData(pixels,0,0);return a;
  }
  const swampCache=new WeakMap();
  function swamp(c,g,o,now,meta,img){
    if(!enabled(g)||o.type!=='m_c1gtoxicf'||o.x!==6500||o.y!==5460||!meta||meta.srcRect||meta.sheet||meta.rot||o.rot||meta.anchorBottom||meta.pivotX!==undefined||meta.pivotY!==undefined||!img||img.complete===false||!(img.naturalWidth||img.width)||!(img.naturalHeight||img.height))return false;
    let cached=swampCache.get(img);
    if(!cached){
      const w=440,h=450,mask=root.document.createElement('canvas');mask.width=w;mask.height=h;
      const m=mask.getContext('2d');m.fillStyle='#fff';
      for(const pocket of swampPockets){m.beginPath();pocket.forEach(([x,y],i)=>{if(i)m.lineTo(x*w/881,y*h/900);else m.moveTo(x*w/881,y*h/900);});m.closePath();m.fill();}
      const pixels=m.getImageData(0,0,w,h),p=pixels.data,d=new Uint8Array(w*h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;d[i]=p[i*4+3]<128?0:Math.min(6,x+1,y+1,w-x,h-y);if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-w]+1);}
      for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(x+1<w)d[i]=Math.min(d[i],d[i+1]+1);if(y+1<h)d[i]=Math.min(d[i],d[i+w]+1);const f=d[i]/6;p[i*4+3]*=f*f*(3-2*f);}
      m.putImageData(pixels,0,0);
      const atlas=root.document.createElement('canvas');atlas.width=w*4;atlas.height=h*4;const a=atlas.getContext('2d');
      const frame=root.document.createElement('canvas');frame.width=w;frame.height=h;const x=frame.getContext('2d');
      for(let f=0;f<16;f++){
        const phase=f/16*Math.PI*2;x.clearRect(0,0,w,h);
        // Refract only the water overlay, with no moving rock or perimeter pixels.
        for(let y=0;y<h;y+=4){
          const dx=4*Math.sin(phase-y*.065)+2*Math.sin(phase*2+y*.035),dy=2*Math.cos(phase+y*.04);
          x.save();x.beginPath();x.rect(0,y,w,4);x.clip();x.drawImage(img,dx,dy,w,h);x.restore();
        }
        x.globalCompositeOperation='destination-in';x.drawImage(mask,0,0);x.globalCompositeOperation='source-over';
        // Gas escapes above the shoreline after the water-only mask is applied.
        for(const [j,pocket] of swampPockets.entries()){
          const cx=pocket.reduce((n,p)=>n+p[0],0)/pocket.length*w/881,cy=pocket.reduce((n,p)=>n+p[1],0)/pocket.length*h/900;
          for(let k=0;k<2;k++)paintSwampGas(x,cx+(k?15:-12),cy+(k?7:-8),(f/16+j*.23+k*.47)%1,j*1.7+k);
        }
        a.drawImage(frame,f%4*w,Math.floor(f/4)*h);
      }
      cached={atlas,w,h,apron:swampApron(img)};swampCache.set(img,cached);
    }
    const size=(meta.sz||450)*(o.scale||1),source=meta.sourceSize||[img.naturalWidth||img.width,img.naturalHeight||img.height],ar=source[0]/source[1];
    const dw=meta.keepAR&&!meta.squareDraw?size*Math.min(1,ar):size,dh=meta.keepAR&&!meta.squareDraw?size*Math.min(1,1/ar):size;
    const phase=((now/6400)%1+1)%1*16,f=Math.floor(phase),next=(f+1)%16,mix=phase-f,{atlas,w,h}=cached;
    c.save();c.translate(o.x,o.y);if(meta.flip)c.scale(-1,1);const alpha=c.globalAlpha;
    c.drawImage(cached.apron,-dw/2-36*dw/440,-dh/2-31*dh/450,512*dw/440,512*dh/450);
    c.drawImage(img,-dw/2,-dh/2,dw,dh);
    c.globalAlpha=alpha*(1-mix);c.drawImage(atlas,f%4*w,Math.floor(f/4)*h,w,h,-dw/2,-dh/2,dw,dh);
    c.globalAlpha=alpha*mix;c.drawImage(atlas,next%4*w,Math.floor(next/4)*h,w,h,-dw/2,-dh/2,dw,dh);
    // Fast bubble poses are independent of the slow 400ms water/gas samples.
    const bubbles=bubbleAtlas(),sx=dw/440,sy=dh/450;
    for(const vent of swampVents){
      const pose=(((now/6400+vent.offset)%1+1)%1)*64,b=Math.floor(pose),bn=(b+1)%64,blend=pose-b,dx=-dw/2+(vent.x-48)*sx,dy=-dh/2+(vent.y-64)*sy;
      c.globalAlpha=alpha*(1-blend);c.drawImage(bubbles,b%8*96,Math.floor(b/8)*96,96,96,dx,dy,96*sx,96*sy);
      c.globalAlpha=alpha*blend;c.drawImage(bubbles,bn%8*96,Math.floor(bn/8)*96,96,96,dx,dy,96*sx,96*sy);
    }
    c.restore();return true;
  }
  let pitAtlas,pitAtlasSource;
  function pit(c,g,o,now,meta,img){
    // Only the existing eastern CH1 pit. Keep its original collision and footprint.
    if(!enabled(g)||o.type!=='pit_poison'||o.x!==6500||o.y!==5580)return false;
    const material=img&&img.complete!==false&&(img.naturalWidth||img.width)>1&&(img.naturalHeight||img.height)>1?img:null;
    if(!pitAtlas||pitAtlasSource!==material){
      const a=root.document.createElement('canvas');a.width=a.height=1024;
      const x=a.getContext('2d');
      for(let f=0;f<16;f++){
        const phase=f/16*Math.PI*2;
        x.save();x.translate(f%4*256+128,Math.floor(f/4)*256+128);
        x.beginPath();x.rect(-128,-128,256,256);x.clip();
        function contour(rx,ry,cy,inset=0){
          x.beginPath();
          for(let n=0;n<=96;n++){
            const t=n/96*Math.PI*2,r=1+.06*Math.sin(t*5)+.035*Math.cos(t*9);
            const squeeze=Math.sin(phase-t*2)*inset;
            const px=Math.cos(t)*(rx*r+squeeze),py=cy+Math.sin(t)*(ry*r+squeeze*.6);
            if(n)x.lineTo(px,py);else x.moveTo(px,py);
          }x.closePath();
        }
        // Soil contact, torn lip, then a dark inner wall above the sunken liquid.
        x.save();x.scale(1,.7);
        const shadow=x.createRadialGradient(0,15,65,0,15,124);
        shadow.addColorStop(0,'rgba(12,10,11,.7)');shadow.addColorStop(1,'rgba(12,10,11,0)');
        x.fillStyle=shadow;x.fillRect(-128,-128,256,256);x.restore();
        // Broken damp soil shoulders tie the hole into the larger contaminated ground.
        for(let j=0;j<9;j++){
          const t=j/9*Math.PI*2,px=Math.cos(t)*99,py=9+Math.sin(t)*73;
          x.save();x.translate(px,py);x.rotate(t);x.scale(1,.55);
          const stain=x.createRadialGradient(0,0,3,0,0,24);
          stain.addColorStop(0,'rgba(36,36,24,.58)');stain.addColorStop(1,'rgba(36,36,24,0)');
          x.fillStyle=stain;x.fillRect(-24,-24,48,48);x.restore();
        }
        contour(106,80,9,1.6);x.fillStyle='#38372c';x.fill();
        if(material){
          const iw=material.naturalWidth||material.width,ih=material.naturalHeight||material.height;
          x.save();x.clip();x.drawImage(material,iw*.67,ih*.16,iw*.24,ih*.36,-114,-78,228,172);
          x.fillStyle='rgba(20,19,16,.38)';x.fillRect(-128,-128,256,256);x.restore();
        }
        x.strokeStyle='rgba(148,128,96,.18)';x.lineWidth=2;x.stroke();
        contour(97,71,9,1.6);
        const wall=x.createLinearGradient(0,-65,0,78);
        wall.addColorStop(0,'#100f11');wall.addColorStop(.55,'#26231d');wall.addColorStop(1,'#69604a');
        x.fillStyle=wall;x.fill();
        x.save();x.clip();
        if(material){
          const iw=material.naturalWidth||material.width,ih=material.naturalHeight||material.height;
          x.drawImage(material,iw*.67,ih*.16,iw*.24,ih*.36,-110,-75,220,160);
          const depth=x.createLinearGradient(0,-65,0,78);
          depth.addColorStop(0,'rgba(8,9,8,.76)');depth.addColorStop(.55,'rgba(14,14,11,.48)');depth.addColorStop(1,'rgba(24,23,18,.22)');
          x.fillStyle=depth;x.fillRect(-128,-128,256,256);
        }
        for(let j=0;!material&&j<280;j++){
          x.fillStyle=j%2?'rgba(120,109,82,.2)':'rgba(8,10,8,.3)';
          x.fillRect(Math.sin(j*12.989)*103,9+Math.cos(j*7.31)*76,2,1+j%4);
        }
        for(let j=0;!material&&j<19;j++){
          const t=j/19*Math.PI*2,px=Math.cos(t)*98,py=9+Math.sin(t)*72;
          x.beginPath();x.moveTo(px,py);x.lineTo(px*.88,py+19);
          x.strokeStyle='rgba(10,9,10,.5)';x.lineWidth=2+j%3;x.stroke();
        }
        contour(86,48,23,2);
        const water=x.createLinearGradient(0,-25,0,73);
        water.addColorStop(0,'#1b2416');water.addColorStop(.5,'#45522a');water.addColorStop(1,'#788052');
        x.fillStyle=water;x.fill();x.save();x.clip();
        if(material){
          const iw=material.naturalWidth||material.width,ih=material.naturalHeight||material.height;
          x.drawImage(material,iw*.16,ih*.15,iw*.34,ih*.4,-92,-31,184,108);
          x.fillStyle='rgba(9,15,8,.3)';x.fillRect(-128,-128,256,256);
        }
        for(let j=0;!material&&j<32;j++){
          const px=Math.sin(j*12.989)*81,py=23+Math.cos(j*7.31)*43;
          x.beginPath();x.ellipse(px,py,3+j%5,1+j%3,.2,0,Math.PI*2);
          x.fillStyle=j%2?'rgba(16,24,14,.24)':'rgba(147,151,90,.19)';x.fill();
        }
        for(let j=0;j<3;j++){
          const p=(f/16+j/3)%1;
          x.beginPath();x.ellipse((j-1)*24,22+Math.sin(j)*14,8+p*28,3+p*10,-.1,.4,5.3);
          x.strokeStyle='rgba(176,173,110,'+((1-p)*(material?.14:.24))+')';x.lineWidth=1.3;x.stroke();
        }
        x.restore();x.restore();
        // Two fixed channels cross the back lip; only their damp highlight pulses.
        for(let j=0;j<2;j++){
          const sx=j?34:-27,sy=j?-57:-69,ex=j?22:-17,ey=j?2:-6;
          x.beginPath();x.moveTo(sx,sy);x.bezierCurveTo(sx-9,sy+19,ex+8,ey-23,ex,ey);
          x.strokeStyle='rgba(14,20,14,.82)';x.lineWidth=8-j*2;x.stroke();
          x.strokeStyle='rgba(95,108,58,.48)';x.lineWidth=3-j*.5;x.stroke();
          x.save();x.translate(-1,0);
          x.strokeStyle='rgba(161,159,99,'+(.14+.07*Math.sin(phase-j))+')';x.lineWidth=1;x.stroke();x.restore();
        }
        // Front lip occludes the liquid edge and catches a narrow damp highlight.
        x.beginPath();
        for(let j=0;j<=48;j++){
          const t=j/48*Math.PI,squeeze=Math.sin(phase-t*2)*1.6;
          const rough=material?1+.06*Math.sin(t*5)+.035*Math.cos(t*9):1;
          const px=Math.cos(t)*(99*rough+squeeze),py=9+Math.sin(t)*(73*rough+(material?squeeze*.6:0));
          if(j)x.lineTo(px,py);else x.moveTo(px,py);
        }
        // Broken contact follows the torn wall instead of drawing a second smooth oval.
        x.save();if(material)x.setLineDash([13,7,5,11]);
        x.strokeStyle=material?'rgba(36,28,26,.42)':'rgba(36,28,26,.9)';x.lineWidth=material?2:4;x.stroke();
        x.translate(0,-2);x.strokeStyle=material?'rgba(143,125,91,.12)':'rgba(143,125,91,.3)';x.lineWidth=material?1:1.6;x.stroke();x.restore();
        x.restore();
      }
      pitAtlas=a;pitAtlasSource=material;
    }
    const phase=((now*.00095+o.x*.017+o.y*.011)/(Math.PI*2)%1+1)%1*16;
    const f=Math.floor(phase),next=(f+1)%16,mix=phase-f,sz=(meta&&meta.sz||200)*(o.scale||1);
    c.save();const alpha=c.globalAlpha;
    c.globalAlpha=alpha*(1-mix);c.drawImage(pitAtlas,f%4*256,Math.floor(f/4)*256,256,256,o.x-sz/2,o.y-sz/2,sz,sz);
    c.globalAlpha=alpha*mix;c.drawImage(pitAtlas,next%4*256,Math.floor(next/4)*256,256,256,o.x-sz/2,o.y-sz/2,sz,sz);
    c.restore();return true;
  }
  const organicCache={m_c1tree:new WeakMap(),m_c1camp:new WeakMap()};
  // One queue for both organic props; no expensive mesh work inside a game draw.
  const organicPending={m_c1tree:new WeakSet(),m_c1camp:new WeakSet()};
  const organicFailed={m_c1tree:new WeakSet(),m_c1camp:new WeakSet()};
  const organicJobs=[];
  function finishBuild(job){let step;do{step=job.next();}while(!step.done);return step.value;}
  function scheduleOrganicBuild(){
    if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(tickOrganicBuild,{timeout:120});
    else root.setTimeout(tickOrganicBuild,8);
  }
  function tickOrganicBuild(deadline){
    const start=root.performance.now();
    do{
      const task=organicJobs[0];if(!task)break;
      try{
        const step=task.job.next();
        if(step.done){organicCache[task.type].set(task.img,step.value);organicPending[task.type].delete(task.img);organicJobs.shift();}
      }catch(error){
        organicPending[task.type].delete(task.img);organicFailed[task.type].add(task.img);organicJobs.shift();
        if(root.console)root.console.warn('[CH1 organic cache] using source sprite',error);
      }
    }while(organicJobs.length&&root.performance.now()-start<3&&(!deadline||deadline.timeRemaining()>0));
    if(organicJobs.length)scheduleOrganicBuild();
  }
  function organicReady(type,img,build){
    const cached=organicCache[type].get(img);if(cached)return cached;
    if(organicPending[type].has(img)||organicFailed[type].has(img))return null;
    const job=build(img);
    if(typeof root.requestIdleCallback!=='function'&&typeof root.setTimeout!=='function'){
      const result=finishBuild(job);organicCache[type].set(img,result);return result;
    }
    organicPending[type].add(img);organicJobs.push({type,img,job});
    if(organicJobs.length===1)scheduleOrganicBuild();return null;
  }
  // Authored hand silhouettes, in the existing 880 x 663 camp image.
  // Only these three hands articulate; the forearms, stones and spikes stay rigid.
  const campHandRigs=[
    {wrist:[452,504],axis:[-19,12],sign:-1,outline:[[458,495],[461,509],[448,515],[440,532],[428,541],[413,540],[410,526],[414,513],[427,504],[442,501]]},
    {wrist:[591,541],axis:[8,18],sign:1,outline:[[581,536],[600,535],[608,545],[622,557],[626,574],[616,587],[596,588],[578,575],[576,556]]},
    {wrist:[580,420],axis:[12,-17],sign:-1,outline:[[569,422],[575,403],[578,383],[601,378],[622,385],[620,405],[617,424],[589,431],[579,427]]}
  ];
  function campGround(img){return finishBuild(buildCampGround(img));}
  function* buildCampGround(img){
    const a=root.document.createElement('canvas');a.width=512;a.height=400;
    const c=a.getContext('2d');c.drawImage(img,36,32,440,331.5);
    const pixels=c.getImageData(0,0,512,400),p=pixels.data,d=new Uint8Array(512*400);
    for(let y=0;y<400;y++)for(let x=0;x<512;x++){
      const i=y*512+x;d[i]=p[i*4+3]>80?0:22;
      if(x)d[i]=Math.min(d[i],d[i-1]+1);if(y)d[i]=Math.min(d[i],d[i-512]+1);
      if(x===511&&y%8===7)yield;
    }
    for(let y=399;y>=0;y--)for(let x=511;x>=0;x--){
      const i=y*512+x;if(x<511)d[i]=Math.min(d[i],d[i+1]+1);if(y<399)d[i]=Math.min(d[i],d[i+512]+1);
      const edge=1-d[i]/22,fade=edge*edge*(3-2*edge),lower=Math.max(0,Math.min(1,(y-140)/120));
      const grain=.72+.18*Math.sin(x*.31+Math.sin(y*.13)*2)+.1*Math.cos(y*.47-x*.17);
      const ash=.5+.5*Math.sin(x*.073+Math.cos(y*.041)*3),k=i*4;
      p[k]=30+25*ash;p[k+1]=27+23*ash;p[k+2]=26+18*ash;
      p[k+3]=Math.round(255*.46*fade*lower*lower*(3-2*lower)*grain);
      if(!p[k+3])p[k]=p[k+1]=p[k+2]=0;
      if(x===511&&y%8===0)yield;
    }
    c.putImageData(pixels,0,0);return a;
  }
  function* buildCamp(img){
      const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,ratio=Math.min(1,880/Math.max(iw,ih));
      const w=Math.round(iw*ratio),h=Math.round(ih*ratio),sx=w/880,sy=h/663;
      const body=root.document.createElement('canvas');body.width=w;body.height=h;
      const b=body.getContext('2d');b.drawImage(img,0,0,w,h);
      const hands=[];
      for(let index=0;index<campHandRigs.length;index++){
        const rig=campHandRigs[index];
        const minX=Math.min(...rig.outline.map(p=>p[0]))-18,minY=Math.min(...rig.outline.map(p=>p[1]))-18;
        const pw=Math.ceil(Math.max(...rig.outline.map(p=>p[0]))-minX+18),ph=Math.ceil(Math.max(...rig.outline.map(p=>p[1]))-minY+18);
        const source=root.document.createElement('canvas');source.width=pw;source.height=ph;
        const s=source.getContext('2d');
        function mask(ctx,dx,dy,scaleX=1,scaleY=1){
          ctx.beginPath();rig.outline.forEach(([x,y],i)=>{if(i)ctx.lineTo((x+dx)*scaleX,(y+dy)*scaleY);else ctx.moveTo((x+dx)*scaleX,(y+dy)*scaleY);});ctx.closePath();
        }
        s.save();mask(s,-minX,-minY);s.clip();s.drawImage(img,0,0,iw,ih,-minX,-minY,880,663);s.restore();
        b.save();b.globalCompositeOperation='destination-out';mask(b,0,0,sx,sy);b.fill();b.restore();
        const atlas=root.document.createElement('canvas');atlas.width=pw*6;atlas.height=ph*4;
        const a=atlas.getContext('2d'),len=Math.hypot(...rig.axis),ux=rig.axis[0]/len,uy=rig.axis[1]/len;
        function pose(x,y,grip){
          const dx=x+minX-rig.wrist[0],dy=y+minY-rig.wrist[1],u=dx*ux+dy*uy,v=-dx*uy+dy*ux;
          // Knuckles close before the fingertips; outer fingers follow the central fingers.
          // Smooth skin weights across each hinge avoid a jump at u=14 or u=25.
          const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
          const delay=Math.min(.28,Math.abs(v)*.012),finger=smooth((grip-delay)/(1-delay)),tip=smooth((finger-.15)/.85);
          const angle=rig.sign*finger*(.65+v*.006),distal=rig.sign*tip*.5;
          const joint=angle*smooth((u-10)/8),end=distal*smooth((u-22)/6);
          const jx=14+11*Math.cos(joint),jy=11*Math.sin(joint);
          let pu=14+(u-14)*Math.cos(joint)-v*Math.sin(joint),pv=(u-14)*Math.sin(joint)+v*Math.cos(joint);
          const ex=pu-jx,ey=pv-jy;
          pu=jx+ex*Math.cos(end)-ey*Math.sin(end);pv=jy+ex*Math.sin(end)+ey*Math.cos(end);
          const wristAngle=rig.sign*grip*.18*Math.max(0,Math.min(1,u/10));
          const ru=pu*Math.cos(wristAngle)-pv*Math.sin(wristAngle),rv=pu*Math.sin(wristAngle)+pv*Math.cos(wristAngle);
          return [rig.wrist[0]+ru*ux-rv*uy-minX,rig.wrist[1]+ru*uy+rv*ux-minY];
        }
        function triangle(src,dst){
          const [p,q,r]=src,[d,e,f]=dst,ax=q[0]-p[0],ay=q[1]-p[1],bx=r[0]-p[0],by=r[1]-p[1],det=ax*by-ay*bx;
          const A=((e[0]-d[0])*by-(f[0]-d[0])*ay)/det,B=((e[1]-d[1])*by-(f[1]-d[1])*ay)/det;
          const C=((f[0]-d[0])*ax-(e[0]-d[0])*bx)/det,D=((f[1]-d[1])*ax-(e[1]-d[1])*bx)/det;
          const cx=(d[0]+e[0]+f[0])/3,cy=(d[1]+e[1]+f[1])/3;
          const edge=dst.map(([x,y])=>{const length=Math.hypot(x-cx,y-cy)||1;return [x+(x-cx)/length*.35,y+(y-cy)/length*.35];});
          a.save();a.beginPath();a.moveTo(...edge[0]);a.lineTo(...edge[1]);a.lineTo(...edge[2]);a.closePath();a.clip();
          a.transform(A,B,C,D,d[0]-A*p[0]-C*p[1],d[1]-B*p[0]-D*p[1]);a.drawImage(source,0,0);a.restore();
        }
        // Build geometry once, excluding transparent cells (with a 1px sampling margin).
        const pixels=s.getImageData(0,0,pw,ph).data,mesh=[];
        let work=0;
        for(let y=0;y<ph;y+=6)for(let x=0;x<pw;x+=6){
          let occupied=false;
          for(let py=Math.max(0,y-1);py<Math.min(ph,y+7)&&!occupied;py++)
            for(let px=Math.max(0,x-1);px<Math.min(pw,x+7);px++)if(pixels[(py*pw+px)*4+3]){occupied=true;break;}
          if(occupied)mesh.push([[x,y],[Math.min(pw,x+6),y],[Math.min(pw,x+6),Math.min(ph,y+6)],[x,Math.min(ph,y+6)]]);
          if(++work%32===0)yield;
        }
        for(let frame=0;frame<24;frame++){
          const grip=frame/23;
          a.save();a.translate(frame%6*pw,Math.floor(frame/6)*ph);
          for(const vertices of mesh){
            const moved=vertices.map(p=>pose(...p,grip));
            for(const ids of [[0,1,2],[0,2,3]])triangle(ids.map(i=>vertices[i]),ids.map(i=>moved[i]));
            if(++work%32===0)yield;
          }
          a.restore();
        }
        const blended=root.document.createElement('canvas');blended.width=pw;blended.height=ph;
        hands.push({atlas,blended,pw,ph,minX,minY,index,key:-1});
      }
      const ground=yield* buildCampGround(img);
      return {body,hands,w,h,ground};
  }
  function campHands(c,o,now,meta,img){
    const cached=organicReady('m_c1camp',img,buildCamp);if(!cached)return false;
    const size=(meta.sz||400)*(o.scale||1),ar=cached.w/cached.h,dw=size*Math.min(1,ar),dh=size*Math.min(1,1/ar),dx=o.x-dw/2,dy=o.y-dh/2;
    if(o.x===1820&&o.y===4020){
      c.drawImage(cached.ground,dx-36*dw/440,dy-32*dh/331.5,512*dw/440,400*dh/331.5);
    }
    c.drawImage(cached.body,dx,dy,dw,dh);
    for(const hand of cached.hands){
      const p=((now/5200+hand.index*.27)%1+1)%1,ease=t=>t*t*(3-2*t);
      const grip=p<.18?0:p<.4?ease((p-.18)/.22):p<.57?1:p<.84?1-ease((p-.57)/.27):0;
      const key=Math.round(grip*92),sample=key/4,frame=Math.floor(sample),next=Math.min(23,frame+1),mix=sample-frame;
      const {pw,ph,atlas,blended}=hand;
      if(hand.key!==key){
        const b=blended.getContext('2d');b.clearRect(0,0,pw,ph);b.globalCompositeOperation='source-over';b.globalAlpha=1-mix;
        b.drawImage(atlas,frame%6*pw,Math.floor(frame/6)*ph,pw,ph,0,0,pw,ph);
        b.globalCompositeOperation='lighter';b.globalAlpha=mix;b.drawImage(atlas,next%6*pw,Math.floor(next/6)*ph,pw,ph,0,0,pw,ph);
        b.globalAlpha=1;b.globalCompositeOperation='source-over';hand.key=key;blended._glVer=(blended._glVer||0)+1;
      }
      c.drawImage(blended,dx+hand.minX/880*dw,dy+hand.minY/663*dh,pw/880*dw,ph/663*dh);
    }
    return true;
  }
  function treeHangers(source){
    const sx=source.width/1143,sy=source.height/1400,b=source.getContext('2d');
    const rigs=[
      {anchor:[928,415],amp:.065,speed:.0012,phase:2.4,points:[[924,415],[933,415],[934,435],[947,433],[958,444],[960,461],[949,481],[948,510],[945,548],[947,579],[936,600],[940,623],[938,640],[926,633],[919,604],[916,622],[921,642],[912,651],[902,640],[907,612],[907,591],[901,603],[897,582],[897,546],[899,509],[899,484],[905,469],[922,454],[926,437]]},
      {anchor:[222,424],amp:.10,speed:.00135,phase:0,points:[[217,424],[227,424],[239,455],[263,485],[268,532],[250,562],[224,572],[192,546],[188,510],[202,470],[214,447]]},
      {anchor:[303,608],amp:.13,speed:.00165,phase:1.8,points:[[298,608],[308,608],[314,641],[340,673],[340,726],[325,766],[311,790],[295,766],[277,718],[273,681],[292,640]]},
      {anchor:[140,609],amp:.085,speed:.0011,phase:3.1,points:[[134,609],[146,609],[150,624],[170,642],[183,685],[185,758],[174,824],[156,862],[139,876],[126,834],[106,803],[103,698],[106,654],[120,627]]},
      {anchor:[1005,430],amp:.11,speed:.00145,phase:4.4,points:[[998,430],[1010,430],[1015,470],[1036,494],[1053,518],[1063,564],[1059,650],[1043,680],[1038,706],[1025,728],[1001,740],[987,727],[982,691],[971,666],[960,633],[953,568],[958,523],[979,486],[990,453]]}
    ];
    return rigs.map(rig=>{
      const x0=Math.max(0,Math.floor(Math.min(...rig.points.map(p=>p[0]))*sx)-2),y0=Math.max(0,Math.floor(Math.min(...rig.points.map(p=>p[1]))*sy)-2);
      const x1=Math.min(source.width,Math.ceil(Math.max(...rig.points.map(p=>p[0]))*sx)+2),y1=Math.min(source.height,Math.ceil(Math.max(...rig.points.map(p=>p[1]))*sy)+2);
      const tex=root.document.createElement('canvas');tex.width=x1-x0;tex.height=y1-y0;const t=tex.getContext('2d');
      function outline(ctx,dx,dy){ctx.beginPath();rig.points.forEach(([px,py],i)=>{if(i)ctx.lineTo(px*sx+dx,py*sy+dy);else ctx.moveTo(px*sx+dx,py*sy+dy);});ctx.closePath();}
      t.save();outline(t,-x0,-y0);t.clip();t.drawImage(source,-x0,-y0);t.restore();
      b.save();b.globalCompositeOperation='destination-out';outline(b,0,0);b.fill();b.restore();
      return {tex,x0,y0,ax:rig.anchor[0]*sx,ay:rig.anchor[1]*sy,amp:rig.amp,speed:rig.speed,phase:rig.phase};
    });
  }
  function* buildTree(img){
      const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,max=1024;
      const ratio=Math.min(1,max/Math.max(iw,ih)),w=Math.round(iw*ratio),h=Math.round(ih*ratio);
      const source=root.document.createElement('canvas');source.width=w;source.height=h;source.getContext('2d').drawImage(img,0,0,w,h);
      const hanging=treeHangers(source);
      const a=root.document.createElement('canvas');a.width=w*4;a.height=h*2;const x=a.getContext('2d');
      // Two authored root axes: attachment stays fixed, distal wood lifts as a branch.
      const roots=[[.38,.67,.09,.795,.047,.085,0],[.65,.70,.91,.81,.045,-.075,2.1]];
      const x0=0,y0=Math.floor(.60*h),x1=w,y1=Math.min(h,Math.ceil(.90*h)+16);
      function pose(px,py,phase){
        let dx=0,dy=0;
        const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
        for(const [ax,ay,tx,ty,radius,angle,offset] of roots){
          const vx=tx-ax,vy=ty-ay,length2=vx*vx+vy*vy,rx=px/w-ax,ry=py/h-ay;
          const u=(rx*vx+ry*vy)/length2,d=Math.abs(rx*vy-ry*vx)/Math.sqrt(length2)/radius;
          if(u<=.15||u>=1.25||d>=1)continue;
          const weight=smooth((u-.15)/.85)*(1-d*d)**2*(1-smooth((u-1.05)/.2));
          const lift=(.5+.5*Math.sin(phase-u*.75+offset))**2,theta=angle*lift*weight;
          const bx=px-ax*w,by=py-ay*h;
          dx+=bx*(Math.cos(theta)-1)-by*Math.sin(theta);dy+=bx*Math.sin(theta)+by*(Math.cos(theta)-1);
        }
        return [px+dx,py+dy];
      }
      function triangle(src,dst){
        const [p,q,r]=src,[d,e,f]=dst,ax=q[0]-p[0],ay=q[1]-p[1],bx=r[0]-p[0],by=r[1]-p[1],det=ax*by-ay*bx;
        const A=((e[0]-d[0])*by-(f[0]-d[0])*ay)/det,B=((e[1]-d[1])*by-(f[1]-d[1])*ay)/det;
        const C=((f[0]-d[0])*ax-(e[0]-d[0])*bx)/det,D=((f[1]-d[1])*ax-(e[1]-d[1])*bx)/det;
        const cx=(d[0]+e[0]+f[0])/3,cy=(d[1]+e[1]+f[1])/3;
        const edge=dst.map(([px,py])=>{const length=Math.hypot(px-cx,py-cy)||1;return [px+(px-cx)/length*.35,py+(py-cy)/length*.35];});
        x.save();x.beginPath();x.moveTo(...edge[0]);x.lineTo(...edge[1]);x.lineTo(...edge[2]);x.closePath();x.clip();
        x.transform(A,B,C,D,d[0]-A*p[0]-C*p[1],d[1]-B*p[0]-D*p[1]);x.drawImage(source,0,0);x.restore();
      }
      let work=0;
      for(let f=0;f<8;f++){
        x.save();x.translate(f%4*w,Math.floor(f/4)*h);x.beginPath();x.rect(0,0,w,h);x.clip();x.drawImage(source,0,0);
        const phase=f/8*Math.PI*2;
        x.clearRect(x0,y0,x1-x0,y1-y0);
        for(let y=y0;y<y1;y+=16)for(let px=x0;px<x1;px+=16){
          const right=Math.min(x1,px+16),bottom=Math.min(y1,y+16),vertices=[[px,y],[right,y],[right,bottom],[px,bottom]];
          const moved=vertices.map(p=>pose(...p,phase));
          if(vertices.every((p,i)=>p[0]===moved[i][0]&&p[1]===moved[i][1])){x.drawImage(source,px,y,right-px,bottom-y,px,y,right-px,bottom-y);if(++work%32===0)yield;continue;}
          for(const ids of [[0,1,2],[0,2,3]])triangle(ids.map(i=>vertices[i]),ids.map(i=>moved[i]));
          if(++work%32===0)yield;
        }
        x.restore();
      }
      const pw=x1-x0,ph=y1-y0,patch=root.document.createElement('canvas');patch.width=pw*4;patch.height=ph*2;
      const p=patch.getContext('2d');
      for(let f=0;f<8;f++)p.drawImage(a,f%4*w+x0,Math.floor(f/4)*h+y0,pw,ph,f%4*pw,Math.floor(f/4)*ph,pw,ph);
      source.getContext('2d').clearRect(x0,y0,pw,ph);
      const blended=root.document.createElement('canvas');blended.width=pw;blended.height=ph;
      return {a:patch,w:pw,h:ph,fullW:w,fullH:h,x0,y0,staticBody:source,blended,blendKey:-1,hanging};
  }
  function organic(c,g,o,now,meta,img){
    const tree=o.type==='m_c1tree',camp=o.type==='m_c1camp';
    if(!enabled(g)||(!tree&&!camp)||!img||img.complete===false||!(img.naturalWidth||img.width)||!meta||meta.srcRect)return false;
    if(camp)return campHands(c,o,now,meta,img);
    const cached=organicReady(o.type,img,buildTree);if(!cached)return false;
    const {a,w,h}=cached,phase=((now*.0008+o.x*.017+o.y*.011)/(Math.PI*2)%1+1)%1*8;
    const blendKey=Math.floor(phase*16),sample=blendKey/16,frame=Math.floor(sample),next=(frame+1)%8,mix=sample-frame;
    const sz=(meta.sz||400)*(o.scale||1),ar=cached.fullW/cached.fullH;
    const factor=tree&&o._hand?.72:1,dw=sz*Math.min(1,ar)*factor,dh=sz*Math.min(1,1/ar)*factor,py=tree&&o._hand?.72:.5;
    if(cached.blendKey!==blendKey){
      const b=cached.blended.getContext('2d');b.clearRect(0,0,w,h);b.globalCompositeOperation='source-over';b.globalAlpha=1-mix;
      b.drawImage(a,frame%4*w,Math.floor(frame/4)*h,w,h,0,0,w,h);
      b.globalCompositeOperation='lighter';b.globalAlpha=mix;b.drawImage(a,next%4*w,Math.floor(next/4)*h,w,h,0,0,w,h);
      b.globalAlpha=1;b.globalCompositeOperation='source-over';cached.blendKey=blendKey;
      cached.blended._glVer=(cached.blended._glVer||0)+1;
    }
    const dx=o.x-dw*.5,dy=o.y-dh*py;
    c.drawImage(cached.staticBody,dx,dy,dw,dh);
    c.drawImage(cached.blended,dx+cached.x0/cached.fullW*dw,dy+cached.y0/cached.fullH*dh,w/cached.fullW*dw,h/cached.fullH*dh);
    for(const part of cached.hanging){
      c.save();c.translate(dx+part.ax/cached.fullW*dw,dy+part.ay/cached.fullH*dh);
      c.rotate(Math.sin(now*part.speed+part.phase)*part.amp);
      c.drawImage(part.tex,(part.x0-part.ax)/cached.fullW*dw,(part.y0-part.ay)/cached.fullH*dh,part.tex.width/cached.fullW*dw,part.tex.height/cached.fullH*dh);c.restore();
    }
    return true;
  }
  root.Ch1LivingDetail=Object.freeze({draw,deform,shadows,hideDuplicate,groundSprite,swamp,pit,organic});
})(globalThis);
