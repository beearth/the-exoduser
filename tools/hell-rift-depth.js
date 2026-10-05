/* Hell Rift isolated depth candidate. Original art, navigation and game saves unchanged. */
(() => {
  'use strict';
  const abyss=new Image(),sprites={},errors=[];
  abyss.src='../assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png';
  abyss.onerror=()=>errors.push('abyss');
  const dirs=['east','south-east','south','south-west','west','north-west','north','north-east'];
  for(const dir of dirs){const image=new Image();image.src='../img/exoduser_warrior/'+dir+'.png';image.onerror=()=>errors.push(dir);sprites[dir]=image;}
  // Interior of the visible fissure only; its painted vertical cliff faces stay on the terrain layer.
  const fissure=[[103,61],[106,69],[102,74],[110,81],[111,91],[115,101],[113,111],[111,120],[111,131],[106,143],[97,157],[91,163],[86,163],[83,157],[74,150],[77,141],[79,137],[76,130],[81,122],[79,116],[85,108],[82,104],[85,100],[88,91],[85,85],[90,80],[94,73],[102,65]];
  // Small exact painted silhouettes, not rectangular crops. Each footline controls front/back order.
  const fronts=[
    {id:'west-root',foot:134,poly:[[66,116],[65,121],[62,123],[63,127],[59,129],[57,132],[53,133],[56,134],[63,132],[66,128],[68,123],[69,121]]},
    {id:'east-horn',foot:108,poly:[[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]]},
    {id:'south-root',foot:173,poly:[[123,157],[124,162],[128,165],[131,169],[130,172],[126,173],[124,169],[121,167],[118,165],[119,161]]}
  ];
  // Runtime mask only, not a modified/exported source image. Fade completely to zero at every edge.
  const mask=document.createElement('canvas');mask.width=mask.height=200;
  const maskCtx=mask.getContext('2d'),maskPixels=maskCtx.createImageData(200,200);
  function inside(x,y,points=fissure){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
  }return hit;}
  for(let y=0;y<200;y++)for(let x=0;x<200;x++){
    const px=x+.5,py=y+.5;if(!inside(px,py))continue;let distance=Infinity;
    for(let i=0;i<fissure.length;i++){const a=fissure[i],b=fissure[(i+1)%fissure.length],dx=b[0]-a[0],dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy)));
      distance=Math.min(distance,Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy));}
    const v=Math.min(1,distance/3),i=(y*200+x)*4;maskPixels.data[i]=maskPixels.data[i+1]=maskPixels.data[i+2]=255;maskPixels.data[i+3]=Math.round(255*v*v*(3-2*v));
  }
  maskCtx.putImageData(maskPixels,0,0);
  const farPlane=document.createElement('canvas');farPlane.width=farPlane.height=1024;const farCtx=farPlane.getContext('2d');
  let enabled=true,moving=false,heading='north',last=null,lastOccluders=0,lastFaded=0,lastOffset={x:0,y:0};
  function polygon(ctx,points,view){ctx.beginPath();for(const [i,p] of points.entries()){const x=view.ox+p[0]*view.scale,y=view.oy+p[1]*view.scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}
  function observe(player){moving=!!last&&Math.hypot(player.x-last.x,player.y-last.y)>.0001;if(moving){const angle=Math.atan2(player.y-last.y,player.x-last.x);heading=dirs[(Math.round(angle/(Math.PI/4))+8)%8];}last={...player};}
  function ground(ctx,art,view,time,mode){
    const {ox,oy,scale}=view;ctx.drawImage(art,ox,oy,200*scale,200*scale);
    lastOffset={x:0,y:0};
    if(!enabled||!abyss.complete||!abyss.naturalWidth)return;
    // Ground/collision remain fixed. Only the far plane shifts relative to the camera.
    const cx=(ctx.canvas.width/2-ox)/scale,cy=(ctx.canvas.height/2-oy)/scale;
    lastOffset={x:mode==='walk'?(cx-100)*.035:0,y:mode==='walk'?(cy-100)*.035:0};
    farCtx.clearRect(0,0,1024,1024);farCtx.globalCompositeOperation='source-over';
    farCtx.drawImage(abyss,lastOffset.x*1024/200,lastOffset.y*1024/200,1024,1024);
    farCtx.globalCompositeOperation='destination-in';farCtx.drawImage(mask,0,0,1024,1024);farCtx.globalCompositeOperation='source-over';
    ctx.save();ctx.globalAlpha=.38;ctx.drawImage(farPlane,ox,oy,200*scale,200*scale);ctx.restore();
  }
  function actor(ctx,player,view,time){
    observe(player);const {scale,ox,oy}=view,x=ox+player.x*scale,y=oy+player.y*scale;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.46)';ctx.beginPath();ctx.ellipse(x,y-.1*scale,.8*scale,.3*scale,0,0,Math.PI*2);ctx.fill();
    const image=sprites[heading];
    if(image?.complete&&image.naturalWidth>=480&&image.naturalHeight>=48){
      const frame=moving?2+Math.floor(time/110)%8:Math.floor(time/850)%2;
      const size=7*scale;ctx.imageSmoothingEnabled=false;
      ctx.drawImage(image,frame*48,0,48,48,x-size/2,y-size*.88,size,size);
    }else{ctx.fillStyle='#c5d7d5';ctx.beginPath();ctx.arc(x,y-scale,Math.max(3,scale*.55),0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  function foreground(ctx,art,player,view,time){
    lastOccluders=0;lastFaded=0;if(!enabled)return;
    for(const item of fronts){if(player.y>=item.foot)continue;
      const overlap=[.8,2,3.5,5].some(dy=>inside(player.x,player.y-dy,item.poly));
      ctx.save();polygon(ctx,item.poly,view);ctx.clip();ctx.globalAlpha=overlap?.38:1;
      ctx.drawImage(art,view.ox,view.oy,200*view.scale,200*view.scale);ctx.restore();lastOccluders++;if(overlap)lastFaded++;
    }
    // Low-opacity haze is restricted to the abyss; it cannot blanket the walkable terraces.
    ctx.save();polygon(ctx,fissure,view);ctx.clip();
    for(let i=0;i<6;i++){const x=100+Math.sin(time/11000+i*1.7)*7,y=82+i*14+Math.sin(time/14000+i)*3;
      const gx=view.ox+x*view.scale,gy=view.oy+y*view.scale,r=(9+i*.8)*view.scale;
      const mist=ctx.createRadialGradient(gx,gy,0,gx,gy,r);mist.addColorStop(0,'rgba(156,188,206,.025)');mist.addColorStop(1,'rgba(156,188,206,0)');ctx.fillStyle=mist;ctx.fillRect(gx-r,gy-r,r*2,r*2);}
    ctx.restore();
  }
  window.HellRiftDepth=Object.freeze({ground,actor,foreground,setEnabled:value=>{enabled=!!value;},reset:()=>{last=null;moving=false;heading='north';lastOccluders=lastFaded=0;lastOffset={x:0,y:0};},snapshot:()=>({enabled,ready:abyss.complete&&abyss.naturalWidth>0&&Object.values(sprites).every(i=>i.complete&&i.naturalWidth>0),errors:[...errors],heading,moving,foregroundPasses:lastOccluders,fadedOverlaps:lastFaded,parallax:{...lastOffset},layerOrder:['painted-terrain','far-abyss-in-fissure','contact-shadow','existing-warrior','footline-foreground','fissure-mist'],heightPhysics:false})});
})();
