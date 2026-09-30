/* CH1-1 baked forest motion. The tile map, combat floor and prop colliders never move. */
(function(root){
  'use strict';
  const SAMPLES=64,STRIPS=8,MAX_CACHED=12,CHUNK_PX=1024;
  const entries=new Map(),queue=[];
  let mapRef=null,scheduled=false,lastDraws=0,builds=0,drawSamples=0,totalDrawMs=0,maxDrawMs=0;
  const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  function canDraw(g,source){return g&&g.stage===0&&!g._bossArena&&!g._fieldRebuildQA&&source==='assets/map/ch1/production_finish'&&Array.isArray(g.map);}
  // Animate the forest 1–9 tiles behind the walkable edge. The immediate ground
  // contact and the deep backdrop are static, so roots and combat silhouettes hold.
  function maskAlpha(map,tx,ty,fx,fy){
    if(!map[ty]||map[ty][tx]!==1)return 0;
    let dist=10;
    for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){
      const yy=ty+dy,xx=tx+dx;
      if(yy<0||xx<0||yy>=map.length||xx>=map[yy].length)continue;
      if(map[yy][xx]===1)continue;
      const d=Math.hypot(dx+.5-fx,dy+.5-fy);
      if(d<dist)dist=d;
    }
    return smooth((dist-1.05)/1.55)*(1-smooth((dist-6.5)/2.5));
  }
  function* build(entry,map,cx,cy){
    const mask=root.document.createElement('canvas');mask.width=mask.height=SAMPLES;
    const m=mask.getContext('2d'),pixels=m.createImageData(SAMPLES,SAMPLES),data=pixels.data;
    let coverage=0;
    for(let y=0;y<SAMPLES;y++){
      for(let x=0;x<SAMPLES;x++){
        const wx=(cx+(x+.5)/SAMPLES)*1000,wy=(cy+(y+.5)/SAMPLES)*1000;
        const tx=Math.floor(wx/40),ty=Math.floor(wy/40),fx=wx/40-tx,fy=wy/40-ty;
        const alpha=maskAlpha(map,tx,ty,fx,fy),k=(y*SAMPLES+x)*4;
        data[k]=data[k+1]=data[k+2]=255;data[k+3]=Math.round(255*alpha);
        if(alpha>.1)coverage++;
      }
      if((y&7)===7)yield;
    }
    if(coverage<16)return null;
    m.putImageData(pixels,0,0);
    const layer=root.document.createElement('canvas');layer.width=layer.height=CHUNK_PX;
    const c=layer.getContext('2d');c.imageSmoothingEnabled=true;
    c.drawImage(entry.img,1,1,CHUNK_PX,CHUNK_PX,0,0,CHUNK_PX,CHUNK_PX);
    c.globalCompositeOperation='destination-in';
    c.drawImage(mask,0,0,CHUNK_PX,CHUNK_PX);
    return layer;
  }
  function schedule(){
    if(scheduled||!queue.length)return;
    scheduled=true;
    if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(pump,{timeout:200});
    else root.setTimeout(()=>pump(null),8);
  }
  function pump(deadline){
    scheduled=false;
    const start=root.performance.now();
    do{
      const entry=queue[0];if(!entry)break;
      try{
        const step=entry.job.next();
        if(step.done){entry.layer=step.value;entry.status=step.value?'ready':'empty';entry.job=null;queue.shift();builds++;}
      }catch(error){entry.status='error';entry.job=null;queue.shift();root.console?.warn('[CH1 forest sway] static background fallback',error);}
    }while(queue.length&&root.performance.now()-start<3&&(!deadline||deadline.timeRemaining()>1));
    if(queue.length)schedule();
  }
  function displacement(now,wx,wy){
    return 3.8*Math.sin(now*.00055+wy*.001+wx*.00025)
      +1.2*Math.sin(now*.00031-wy*.0007+wx*.00035);
  }
  function draw(c,g,now,chunkCache,visibleIds,chunkSize,source,width,height){
    lastDraws=0;
    if(!canDraw(g,source)||!chunkCache||!visibleIds||!visibleIds.length||!(chunkSize>0)||!(width>0)||!(height>0))return 0;
    const started=root.performance.now();
    if(mapRef!==g.map){mapRef=g.map;entries.clear();queue.length=0;}
    const zoom=Math.max(.3,g._edZoom||g._camZoom||1),left=g.cam.x-width/(2*zoom)-6,right=g.cam.x+width/(2*zoom)+6,top=g.cam.y-height/(2*zoom)-6,bottom=g.cam.y+height/(2*zoom)+6;
    c.save();c.imageSmoothingEnabled=true;
    for(const id of visibleIds){
      const [cx,cy]=id.split(',').map(Number),wx=cx*chunkSize,wy=cy*chunkSize;
      if(wx>right||wx+chunkSize<left||wy>bottom||wy+chunkSize<top)continue;
      const src=chunkCache[id];if(!src||src.status!=='ready'||!src.img?.complete||src.img.naturalWidth!==CHUNK_PX+2)continue;
      let entry=entries.get(id);
      if(entry&&entry.img!==src.img){entries.delete(id);entry=null;}
      if(!entry){
        entry={id,img:src.img,status:'pending',layer:null,job:null};
        entry.job=build(entry,g.map,cx,cy);entries.set(id,entry);queue.push(entry);schedule();
        while(entries.size>MAX_CACHED){
          const oldest=entries.keys().next().value,evicted=entries.get(oldest);
          entries.delete(oldest);const qi=queue.indexOf(evicted);if(qi>=0)queue.splice(qi,1);
        }
      }else{entries.delete(id);entries.set(id,entry);}
      if(entry.status!=='ready')continue;
      const band=CHUNK_PX/STRIPS;
      for(let i=0;i<STRIPS;i++){
        const y=wy+(i+.5)*chunkSize/STRIPS,dx=displacement(now,wx+chunkSize*.5,y);
        c.drawImage(entry.layer,0,i*band,CHUNK_PX,band,wx+dx,wy+i*chunkSize/STRIPS,chunkSize,chunkSize/STRIPS);
      }
      lastDraws++;
    }
    c.restore();
    const ms=root.performance.now()-started;drawSamples++;totalDrawMs+=ms;if(ms>maxDrawMs)maxDrawMs=ms;
    return lastDraws;
  }
  function qa(){return{cached:entries.size,pending:queue.length,builds,lastDraws,drawSamples,meanDrawMs:drawSamples?totalDrawMs/drawSamples:0,maxDrawMs,source:'production_finish',maxDisplacement:5};}
  root.Ch1ForestSway=Object.freeze({draw,qa});
})(globalThis);
