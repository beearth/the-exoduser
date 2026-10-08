/* CH1-1 side ravines. New, authored 2.5D render depths, not physical elevation.
 * Uses the locked production boundary and borrowed CH1 root-cliff material.
 * Faces are textured triangles; the live wall mask keeps every floor tile clear.
 * No image loading, simulation, navigation, animation clock or save ownership. */
(function(root){
  'use strict';
  const T=40,RES=.5,STEP=48;
  const SECTIONS=Object.freeze([
    Object.freeze({id:'west-camp-gorge',side:-1,indices:Object.freeze([12,13,14,15,16]),width:420,depth:220,rise:86}),
    Object.freeze({id:'east-terrace-gorge',side:1,indices:Object.freeze([38,39,40,41,42]),width:500,depth:300,rise:128})
  ]);
  let mapRef=null,imageRef=null,layoutRef=null,records=[],freeTexture=null;
  const stats={builds:0,buildMs:0,lastDraws:0,lastWallRuns:0};
  function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
  function clear(){
    for(const r of records)if(r&&freeTexture)freeTexture(r.canvas);
    records=[];mapRef=imageRef=layoutRef=null;
  }
  function rails(section,layout,map){
    const points=section.indices.map(i=>layout.boundary[i].map(v=>v*T));
    const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    const total=lengths[lengths.length-1],count=Math.ceil(total/STEP),out=[];
    for(let k=0;k<=count;k++){
      const d=total*k/count;let i=1;while(i<lengths.length-1&&lengths[i]<d)i++;
      const f=(d-lengths[i-1])/(lengths[i]-lengths[i-1]),p=points[i-1],q=points[i];
      const x=p[0]+(q[0]-p[0])*f,y=p[1]+(q[1]-p[1])*f,t=k/count;
      const cap=smooth(t/.12)*smooth((1-t)/.12),w=section.width*cap*(.9+.1*Math.sin(t*9+.7));
      const depth=section.depth*(.9+.1*Math.sin(t*7+.4)),rise=section.rise*(.8+.2*Math.sin(t*11+1));
      // A face projects south from its top edge. Set the whole cross-section
      // beyond ALL floor rows it spans, so the live tile guard does not turn
      // the sculpted lip into a staircase at diagonal production boundaries.
      let edge=x;
      for(let row=Math.max(0,Math.floor((y-rise-40)/T));row<=Math.min(199,Math.ceil((y+depth+40)/T));row++){
        if(section.side<0){for(let col=0;col<200;col++)if(map[row]?.[col]!==1){edge=Math.min(edge,col*T);break;}}
        else{for(let col=199;col>=0;col--)if(map[row]?.[col]!==1){edge=Math.max(edge,(col+1)*T);break;}}
      }
      const lip=edge+section.side*160;
      out.push({top:[lip,y],toe:[lip+section.side*(24+w*.12),y+depth],
        farToe:[lip+section.side*w*.76,y+depth*.82],crest:[lip+section.side*w,y-rise]});
    }
    // Smooth the authored shoulder instead of exposing the 40px nav-grid steps.
    // A live run mask still protects floor if the map is edited after this bake.
    for(let pass=0;pass<3;pass++){
      const shift=out.map((r,i)=>{
        let sum=0,weight=0;for(let j=-3;j<=3;j++){const k=Math.max(0,Math.min(out.length-1,i+j)),w=4-Math.abs(j);sum+=out[k].top[0]*w;weight+=w;}
        return sum/weight-r.top[0];
      });
      out.forEach((r,i)=>{for(const p of Object.values(r))p[0]+=shift[i];});
    }
    return out;
  }
  function polygon(c,a,b){
    c.beginPath();for(let i=0;i<a.length;i++){const p=a[i];if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);}
    for(let i=b.length-1;i>=0;i--)c.lineTo(b[i][0],b[i][1]);c.closePath();
  }
  function triangle(c,image,src,dst){
    const [a,b,d]=src,[p,q,r]=dst,det=a[0]*(b[1]-d[1])+b[0]*(d[1]-a[1])+d[0]*(a[1]-b[1]);
    if(Math.abs(det)<1e-8)return;
    const solve=v=>[(v[0]*(b[1]-d[1])+v[1]*(d[1]-a[1])+v[2]*(a[1]-b[1]))/det,
      (v[0]*(d[0]-b[0])+v[1]*(a[0]-d[0])+v[2]*(b[0]-a[0]))/det,
      (v[0]*(b[0]*d[1]-d[0]*b[1])+v[1]*(d[0]*a[1]-a[0]*d[1])+v[2]*(a[0]*b[1]-b[0]*a[1]))/det];
    const x=solve([p[0],q[0],r[0]]),y=solve([p[1],q[1],r[1]]);
    c.save();c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.lineTo(r[0],r[1]);c.closePath();c.clip();
    c.transform(x[0],y[0],x[1],y[1],x[2],y[2]);c.drawImage(image,0,0);c.restore();
  }
  function face(c,image,a,b,far){
    polygon(c,a,b);c.fillStyle=far?'#30272c':'#3b2e32';c.fill();
    for(let i=0;i<a.length-1;i++){
      // Opaque root face inside prop_g_edge.png, excluding its alpha outline.
      const u=510+(i%7)*60,s=[[u,70],[u+90,70],[u+90,470],[u,470]];
      c.globalAlpha=far?.62:.90;
      triangle(c,image,[s[0],s[1],s[2]],[a[i],a[i+1],b[i+1]]);
      triangle(c,image,[s[0],s[2],s[3]],[a[i],b[i+1],b[i]]);
    }
    c.globalAlpha=1;
    // Cross-section darkness and broken strata follow each face's own depth.
    for(let j=0;j<12;j++){
      const f=j/12,g=(j+1)/12,at=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
      polygon(c,a.map((p,i)=>at(p,b[i],f)),a.map((p,i)=>at(p,b[i],g)));
      c.fillStyle='rgba(8,11,10,'+(.04+.46*f*f)+')';c.fill();
    }
  }
  function build(section,layout,image,map){
    const started=performance.now(),rs=rails(section,layout,map),all=rs.flatMap(r=>Object.values(r));
    const x=Math.floor((Math.min(...all.map(p=>p[0]))-56)/T)*T,y=Math.floor((Math.min(...all.map(p=>p[1]))-56)/T)*T;
    const w=Math.ceil((Math.max(...all.map(p=>p[0]))+56-x)/T)*T,h=Math.ceil((Math.max(...all.map(p=>p[1]))+56-y)/T)*T;
    const canvas=document.createElement('canvas');canvas.width=w*RES;canvas.height=h*RES;
    const c=canvas.getContext('2d');c.scale(RES,RES);c.translate(-x,-y);
    const top=rs.map(r=>r.top),toe=rs.map(r=>r.toe),farToe=rs.map(r=>r.farToe),crest=rs.map(r=>r.crest);
    polygon(c,top,crest);c.fillStyle='#18131b';c.fill();
    face(c,image,crest,farToe,true);
    c.save();polygon(c,toe,farToe);c.clip();
    // The bottom remains textured rock in shadow, rather than an empty polygon.
    const floor=document.createElement('canvas');floor.width=floor.height=320;
    const fc=floor.getContext('2d');fc.drawImage(image,520,70,400,400,0,0,320,320);
    c.fillStyle=c.createPattern(floor,'repeat');c.fillRect(x,y,w,h);
    c.fillStyle='rgba(7,10,15,.72)';c.fillRect(x,y,w,h);c.restore();
    face(c,image,top,toe,false);
    // Raised outer shoulder and broken inner lip; no tree sprite duplication.
    for(const line of [crest,top]){
      c.beginPath();line.forEach((p,i)=>{if(i)c.lineTo(...p);else c.moveTo(...p);});
      c.save();c.filter='blur(6px)';c.strokeStyle='rgba(5,4,7,.45)';c.lineWidth=20;c.stroke();
      c.filter='blur(3px)';c.strokeStyle='rgba(136,126,119,.12)';c.lineWidth=6;c.stroke();c.restore();
    }
    // Fade the closed ends and outside edges into the existing painted ground.
    c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='destination-in';
    const fade=c.createLinearGradient(0,0,0,canvas.height);fade.addColorStop(0,'transparent');fade.addColorStop(.07,'#000');fade.addColorStop(.93,'#000');fade.addColorStop(1,'transparent');
    c.fillStyle=fade;c.fillRect(0,0,canvas.width,canvas.height);
    stats.builds++;stats.buildMs+=performance.now()-started;
    return {id:section.id,canvas,x,y,w,h};
  }
  function draw(ctx,g,image,layout,VW,VH,zoom,releaseTexture){
    stats.lastDraws=stats.lastWallRuns=0;
    if(!g||g.stage!==0||g._bossArena||g.mw!==200||g.mh!==200||!Array.isArray(g.map)||g.map.length!==200||!g.cam||
      ![g.cam.x,g.cam.y,VW,VH,zoom].every(Number.isFinite)||VW<=0||VH<=0||zoom<=0||
      !layout||layout.version!=='20260916-finish-1'||layout.boundary?.length!==53||
      !image?.complete||image.naturalWidth<1000||image.naturalHeight<500)return;
    if(mapRef!==g.map||imageRef!==image||layoutRef!==layout){clear();mapRef=g.map;imageRef=image;layoutRef=layout;}
    freeTexture=typeof releaseTexture==='function'?releaseTexture:null;
    const left=g.cam.x-VW/(2*zoom),right=g.cam.x+VW/(2*zoom),top=g.cam.y-VH/(2*zoom),bottom=g.cam.y+VH/(2*zoom);
    for(let i=0;i<SECTIONS.length;i++){
      const section=SECTIONS[i],anchors=section.indices.map(j=>layout.boundary[j]);
      const minX=Math.min(...anchors.map(p=>p[0]))*T-section.width-400,maxX=Math.max(...anchors.map(p=>p[0]))*T+section.width+400;
      const minY=Math.min(...anchors.map(p=>p[1]))*T-section.rise-100,maxY=Math.max(...anchors.map(p=>p[1]))*T+section.depth+100;
      if(right<minX||left>maxX||bottom<minY||top>maxY)continue;
      const r=records[i]||(records[i]=build(section,layout,image,g.map));
      const x0=Math.max(1,Math.floor(Math.max(left,r.x)/T)),x1=Math.min(198,Math.ceil(Math.min(right,r.x+r.w)/T)-1);
      const y0=Math.max(1,Math.floor(Math.max(top,r.y)/T)),y1=Math.min(198,Math.ceil(Math.min(bottom,r.y+r.h)/T)-1);
      ctx.save();try{
        ctx.globalAlpha=1;let runs=0;
        // Live mask, inset 1 tile from any floor. Editing/replacing G.map cannot
        // leave a cached cliff over a newly walkable route, player or objective.
        for(let y=y0;y<=y1;y++){
          let start=-1;
          for(let x=x0;x<=x1+1;x++){
            let wall=x<=x1;
            for(let dy=-1;wall&&dy<=1;dy++)for(let dx=-1;wall&&dx<=1;dx++)wall=g.map[y+dy]?.[x+dx]===1;
            if(wall&&start<0)start=x;
            if(!wall&&start>=0){
              // The main GPU Canvas wrapper has no clip support. Publish only
              // allowed source crops, rather than relying on a parent clip().
              const width=(x-start)*T;
              ctx.drawImage(r.canvas,(start*T-r.x)*RES,(y*T-r.y)*RES,width*RES,T*RES,start*T,y*T,width,T);
              start=-1;runs++;
            }
          }
        }
        if(runs){stats.lastDraws++;stats.lastWallRuns+=runs;}
      }finally{ctx.restore();}
    }
  }
  function qa(){return Object.freeze({...stats,cacheCount:records.filter(Boolean).length,cachePixels:records.reduce((n,r)=>n+(r?r.canvas.width*r.canvas.height:0),0),
    sections:SECTIONS,renderDepthOnly:true,physicalElevation:false,ownsImages:false,ownsRAF:false,ownsSave:false});}
  root.Ch1SideRavines=Object.freeze({draw,clear,qa});
})(globalThis);
