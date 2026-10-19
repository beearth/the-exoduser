import { createSourcePreviewFrontWallProfiles, sampleSourcePreviewDirectionalBrightness } from './source-preview-appearance.js?v=0.17.1';

function paintTriangle(context, image, command, alpha = 1, brightness = 1, saturation = 1) {
  context.save();
  try {
    context.beginPath(); context.moveTo(...command.points[0]);
    context.lineTo(...command.points[1]); context.lineTo(...command.points[2]); context.closePath(); context.clip();
    context.transform(...command.transform);
    const light = brightness * command.brightness;
    context.filter = light === 1 && saturation === 1 ? 'none' : `brightness(${light}) saturate(${saturation})`;
    context.globalAlpha = alpha * command.opacity;
    context.drawImage(image, ...command.source, ...command.destination);
  } finally { context.restore(); }
}

/** Owner-local Canvas cache of the original soil on an engine-projected source hill.
 * Floor pixels are cached; south faces join the projected-depth painter order.
 * Rendering tessellation never modifies source geometry/nav or creates an asset PNG. */
export class SourcePreviewHeightGround {
  constructor(scene, sample, canvasFactory) {
    this.sample = sample;
    this.mapping = { ...scene.heightPreview.heightMapping };
    const p = scene.heightPreview.sourceExecutionSnapshot.executionData.logicalHeight.nativeParams;
    this.params={...p};this.appearance=scene.appearancePreview?structuredClone(scene.appearancePreview):null;
    this.groundClip=structuredClone(scene.groundClip);
    const x0 = (Math.floor(Math.min(p.rampX0, p.cx - p.rx * p.outer)) - 1) * 40;
    const x1 = (Math.ceil(Math.max(p.rampX1, p.cx + p.rx * p.outer)) + 1) * 40;
    const y0 = (Math.floor(Math.min(p.rampY - p.rampHalf1, p.cy - p.ry * p.outer)) - 1) * 40;
    const y1 = (Math.ceil(Math.max(p.rampY + p.rampHalf1, p.cy + p.ry * p.outer)) + 1) * 40;
    this.bounds = { x: x0, y: y0, width: x1 - x0, depth: y1 - y0 };
    this.zMax = this.mapping.offsetPx + this.mapping.scalePx;
    this.factory = canvasFactory;
    this.canvas = null; this.image = null; this.triangles = 0; this.builds = 0;
    this.wallProfiles=0;this.wallTriangles=0;this.shadedTriangles=0;
    this._walls = [];
    this._terrainCoverage=[];this._terrainDepth=null;
    this.terrainMaskCanvas=null;this.scratchCanvas=null;this.terrainMaskBuilds=0;
    this._terrainClipRects=[];this._terrainClipPath=null;this._terrainOutsidePaths=new Map();this.terrainMaskReadbacks=0;
    this.disposed = false;
  }

  excludeFlatPatch(context, owner, left, top) {
    const b = this.bounds;
    context.beginPath(); context.rect(0, 0, owner.width, owner.height);
    context.rect(b.x - left, b.y - top - this.mapping.offsetPx, b.width, b.depth);
    context.clip('evenodd');
  }

  _build(image, owner) {
    if (!this.canvas) this.canvas = this.factory?.() || owner.canvas?.ownerDocument?.createElement('canvas');
    if (!this.canvas) throw new TypeError('Height ground requires an owner-local Canvas cache.');
    const b = this.bounds, width = b.width, height = Math.ceil(b.depth + this.zMax);
    if (width > 2048 || height > 2048 || width * height > 4194304) throw new TypeError('Height ground cache exceeds2048/4MiPixels.');
    this.canvas.width = width; this.canvas.height = height;
    const context = this.canvas.getContext('2d');
    if (!context || ['save','restore','beginPath','moveTo','lineTo','closePath','clip','transform','drawImage'].some(key => typeof context[key] !== 'function')) {
      throw new TypeError('Height ground requires Canvas2D texture projection.');
    }
    const cuts = (start, end) => {
      const set = new Set([start, end]);
      for (let v = start + 40; v < end; v += 40) set.add(v);
      for (let v = (Math.floor(start / 1024) + 1) * 1024; v < end; v += 1024) set.add(v);
      return [...set].sort((a, z) => a - z);
    };
    const xs = cuts(b.x, b.x + width), ys = cuts(b.y, b.y + b.depth);
    const vertices = ys.map(y => xs.map(x => {
      const result = this.sample(x, y);
      if (!result.ok || !Number.isFinite(result.engineFootZ)) throw new TypeError('Exact height ground sample failed.');
      const lighting=this.appearance?sampleSourcePreviewDirectionalBrightness(this.sample,x,y,this.appearance,{validated:true}):null;
      if(lighting&&!lighting.ok)throw new TypeError('Authored ground lighting sample failed.');
      return {point:[x - b.x,y - b.y + this.zMax-result.engineFootZ],z:result.engineFootZ,brightness:lighting?.brightness||1};
    }));
    let count = 0,shaded=0;
    this._walls = [];
    this._terrainCoverage=[];this._terrainDepth=null;
    const expose=this.appearance?.terrainCutaway?.foregroundOpacity<1;
    const triangle = (points, a, slopeX, slopeY, w, h, sx, sy, sw, sh,brightness=1,opacity=1,commands=null) => {
      const command = { points, transform:[1,slopeX,0,slopeY,...a], source:[sx,sy,sw,sh], destination:[0,0,w,h], brightness, opacity };
      if (commands) commands.push(command);
      else paintTriangle(context,image,command);
      count++;if(Math.abs(brightness-1)>1e-9)shaded++;
    };
    for (let row = 0; row < ys.length - 1; row++) for (let col = 0; col < xs.length - 1; col++) {
      const w = xs[col + 1] - xs[col], h = ys[row + 1] - ys[row];
      const av=vertices[row][col],cv=vertices[row+1][col+1],dv=vertices[row+1][col],ev=vertices[row][col+1];
      const a=av.point,c=cv.point,d=dv.point,e=ev.point;
      const sx = ((xs[col] % 1024) + 1024) % 1024 * image.naturalWidth / 1024;
      const sy = ((ys[row] % 1024) + 1024) % 1024 * image.naturalHeight / 1024;
      const sw = w * image.naturalWidth / 1024, sh = h * image.naturalHeight / 1024;
      triangle([a,e,c], a, (e[1]-a[1])/w, (c[1]-e[1])/h, w,h,sx,sy,sw,sh,(av.brightness+ev.brightness+cv.brightness)/3);
      triangle([a,c,d], a, (c[1]-d[1])/w, (d[1]-a[1])/h, w,h,sx,sy,sw,sh,(av.brightness+cv.brightness+dv.brightness)/3);
      if(expose){
        if(Math.max(av.z,ev.z,cv.z)>this.mapping.offsetPx+1e-7)this._terrainCoverage.push([a,e,c]);
        if(Math.max(av.z,cv.z,dv.z)>this.mapping.offsetPx+1e-7)this._terrainCoverage.push([a,c,d]);
      }
    }
    const floorTriangles=count;let wallProfiles=0;
    if(this.appearance){
      const result=createSourcePreviewFrontWallProfiles(this.params,this.sample,this.appearance,{validated:true});
      if(!result.ok)throw new TypeError(result.errors.join('\n'));
      const mod=value=>((value%1024)+1024)%1024;
      const lerp=(a,z,t)=>a.map((v,i)=>v+(z[i]-v)*t);
      const project=point=>[point[0]-b.x,point[1]-b.y+this.zMax-point[2]];
      const uvCuts=(origin,length)=>{const values=[0,length];for(let v=1024-mod(origin);v<length;v+=1024)if(v>1e-9)values.push(v);return values.sort((a,z)=>a-z);};
      for(const profile of result.profiles){
        const reverse=profile.top[0][0]>profile.top[1][0],order=reverse?[1,0]:[0,1];
        const topA=profile.top[order[0]],topB=profile.top[order[1]],bottomA=profile.bottom[order[0]],bottomB=profile.bottom[order[1]];
        const w=topB[0]-topA[0],h=Math.max(topA[2]-bottomA[2],topB[2]-bottomB[2]);if(w<=1e-7||h<=.25)continue;
        wallProfiles++;
        const a=project(topA),e=project(topB),d=project(bottomA),c=project(bottomB),vOrigin=topA[1];
        const points=[a,e,d,c], minX=Math.min(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1]));
        const entry={depth:profile.depthY,id:profile.id,commands:[],localBounds:{x:minX,y:minY,
          width:Math.max(...points.map(p=>p[0]))-minX,height:Math.max(...points.map(p=>p[1]))-minY}};
        const point=(u,v)=>lerp(lerp(a,e,u/w),lerp(d,c,u/w),v/h),us=uvCuts(topA[0],w),vs=uvCuts(vOrigin,h);
        for(let i=0;i<us.length-1;i++)for(let j=0;j<vs.length-1;j++){
          const u=us[i],v=vs[j],cw=us[i+1]-u,ch=vs[j+1]-v;
          const qa=point(u,v),qe=point(u+cw,v),qc=point(u+cw,v+ch),qd=point(u,v+ch);
          const sx=mod(topA[0]+u)*image.naturalWidth/1024,sy=mod(vOrigin+v)*image.naturalHeight/1024,sw=cw*image.naturalWidth/1024,sh=ch*image.naturalHeight/1024;
          const wall=this.appearance.frontWalls;
          triangle([qa,qe,qc],qa,(qe[1]-qa[1])/cw,(qc[1]-qe[1])/ch,cw,ch,sx,sy,sw,sh,wall.brightness,wall.opacity,entry.commands);
          triangle([qa,qc,qd],qa,(qc[1]-qd[1])/cw,(qd[1]-qa[1])/ch,cw,ch,sx,sy,sw,sh,wall.brightness,wall.opacity,entry.commands);
        }
        this._walls.push(entry);
        if(expose)this._terrainCoverage.push([a,e,c,d]);
      }
    }
    this._walls.sort((a,b)=>a.depth-b.depth);
    if(this._terrainCoverage.length){
      this._terrainDepth=Math.max(...this._terrainCoverage.flat().map(point=>point[1]+b.y-this.zMax));
      this._buildTerrainMask(owner);
    }
    this.triangles = count;this.wallTriangles=count-floorTriangles;this.wallProfiles=wallProfiles;this.shadedTriangles=shaded;
    this.builds++; this.image = image;
  }

  _buildTerrainMask(owner) {
    const make=()=>this.factory?.()||owner.canvas?.ownerDocument?.createElement('canvas');
    this.terrainMaskCanvas ||= make();this.scratchCanvas ||= make();
    if(!this.terrainMaskCanvas||!this.scratchCanvas)throw new TypeError('Terrain cutaway requires two owner-local Canvas buffers.');
    for(const canvas of [this.terrainMaskCanvas,this.scratchCanvas]){canvas.width=this.canvas.width;canvas.height=this.canvas.height;}
    const hard=this.scratchCanvas.getContext('2d'),mask=this.terrainMaskCanvas.getContext('2d');
    if([hard,mask].some(ctx=>!ctx||['save','restore','clearRect','beginPath','moveTo','lineTo','closePath','clip','fill','drawImage','getImageData'].some(k=>typeof ctx[k]!=='function')))
      throw new TypeError('Terrain cutaway requires Canvas2D coverage compositing.');
    hard.save();
    try {
      hard.clearRect(0,0,this.scratchCanvas.width,this.scratchCanvas.height);
      hard.filter='none';hard.globalAlpha=1;hard.globalCompositeOperation='source-over';hard.fillStyle='#fff';
      hard.beginPath();
      const projected=this.groundClip.polygon.map(p=>{const x=p[0]*this.groundClip.tileSize,y=p[1]*this.groundClip.tileSize;
        return [x-this.bounds.x,y-this.bounds.y+this.zMax-this.sample(x,y).engineFootZ];});
      hard.moveTo(...projected[0]);for(let i=1;i<projected.length;i++)hard.lineTo(...projected[i]);hard.closePath();hard.clip();hard.beginPath();
      for(const polygon of this._terrainCoverage){
        const area=polygon.reduce((sum,p,i)=>{const q=polygon[(i+1)%polygon.length];return sum+p[0]*q[1]-q[0]*p[1];},0);
        const points=area<0?[...polygon].reverse():polygon;
        hard.moveTo(...points[0]);for(let i=1;i<points.length;i++)hard.lineTo(...points[i]);hard.closePath();
      }
      hard.fill();
    } finally {hard.restore();}
    // Read only the untainted, image-free hard mask once per cache build.
    // Disjoint pixel runs form a union even where projected floor/walls overlap.
    const pixels=hard.getImageData(0,0,this.scratchCanvas.width,this.scratchCanvas.height).data;
    this.terrainMaskReadbacks++;
    this._terrainClipRects=[];this._terrainClipPath=null;this._terrainOutsidePaths.clear();
    let previous=new Map();
    const width=this.scratchCanvas.width,height=this.scratchCanvas.height;
    for(let y=0;y<height;y++){
      const current=new Map();
      for(let x=0;x<width;){
        if(!pixels[(y*width+x)*4+3]){x++;continue;}
        const start=x;while(x<width&&pixels[(y*width+x)*4+3])x++;
        const key=start+':'+x,existing=previous.get(key);
        const rect=existing||[start,y,x-start,0];rect[3]++;
        if(!existing)this._terrainClipRects.push(rect);
        current.set(key,rect);
      }
      previous=current;
    }
    if(typeof Path2D==='function'){
      this._terrainClipPath=new Path2D();
      for(const rect of this._terrainClipRects)this._terrainClipPath.rect(...rect);
    }
    mask.save();
    try {
      mask.clearRect(0,0,this.terrainMaskCanvas.width,this.terrainMaskCanvas.height);
      mask.globalAlpha=1;mask.globalCompositeOperation='source-over';mask.filter=`blur(${this.appearance.terrainCutaway.featherPx}px)`;
      mask.drawImage(this.scratchCanvas,0,0);
      mask.filter='none';mask.globalCompositeOperation='destination-in';mask.drawImage(this.scratchCanvas,0,0);
    } finally {mask.restore();}
    this.terrainMaskBuilds++;
  }

  prepareExposedLayer(entry,image,owner) {
    const cut=this.appearance?.terrainCutaway,b=this.bounds;
    if(this.disposed||!this.terrainMaskCanvas||!cut||cut.foregroundOpacity>=1||entry.depth<=this._terrainDepth)return false;
    const [x,y,w,h]=entry.layer.worldRect,py=y-entry.z;
    if(x+w<=b.x||x>=b.x+b.width||py+h<=b.y-this.zMax||py>=b.y+b.depth)return false;
    const context=this.scratchCanvas.getContext('2d');
    context.save();
    try {
      context.clearRect(0,0,this.scratchCanvas.width,this.scratchCanvas.height);
      context.globalAlpha=1;context.globalCompositeOperation='source-over';
      context.filter=`brightness(${entry.layer.brightness}) saturate(${entry.layer.saturation})`;
      context.drawImage(image,...entry.layer.sourceRect,x-b.x,py-b.y+this.zMax,w,h);
      context.filter='none';context.globalCompositeOperation='destination-out';context.globalAlpha=1-cut.foregroundOpacity;
      context.drawImage(this.terrainMaskCanvas,0,0);
    } finally {context.restore();}
    return true;
  }

  _clipTerrainLayer(context,entry,outside) {
    const [wx,wy,w,h]=entry.layer.worldRect;
    // The exterior rectangle extends beyond the image to avoid clipping its
    // original anti-aliased edge. Only the hard mask union divides the passes.
    const exterior=[wx-this.bounds.x-2,wy-entry.z-this.bounds.y+this.zMax-2,w+4,h+4];
    if(this._terrainClipPath){
      let path=this._terrainClipPath;
      if(outside){
        path=this._terrainOutsidePaths.get(entry);
        if(!path){
          path=new Path2D(this._terrainClipPath);path.rect(...exterior);
          this._terrainOutsidePaths.set(entry,path);
        }
      }
      context.clip(path,outside?'evenodd':'nonzero');
    }else{
      context.beginPath();
      if(outside)context.rect(...exterior);
      for(const rect of this._terrainClipRects)context.rect(...rect);
      context.clip(outside?'evenodd':'nonzero');
    }
  }

  drawExposedLayer(context,owner,entry,image,left,top) {
    const b=this.bounds,x=b.x-left,y=b.y-top-this.zMax;
    const [wx,wy,w,lh]=entry.layer.worldRect;
    context.save();
    try {
      context.translate(x,y);this._clipTerrainLayer(context,entry,true);
      context.drawImage(image,...entry.layer.sourceRect,wx-b.x,wy-entry.z-b.y+this.zMax,w,lh);
    } finally {context.restore();}
    context.save();
    try {
      context.translate(x,y);this._clipTerrainLayer(context,entry,false);context.filter='none';
      context.drawImage(this.scratchCanvas,0,0);
    } finally {context.restore();}
    return 2;
  }

  draw(context, owner, image, left, top) {
    if (this.disposed) return 0;
    const b = this.bounds, x = b.x - left, y = b.y - top - this.zMax;
    if (x + b.width <= 0 || x >= owner.width || y + b.depth + this.zMax <= 0 || y >= owner.height) return 0;
    if (this.image !== image) this._build(image, owner);
    context.drawImage(this.canvas, x, y); return 1;
  }

  visibleWalls(owner, left, top) {
    if (this.disposed || !this.image) return [];
    const x=this.bounds.x-left,y=this.bounds.y-top-this.zMax;
    return this._walls.filter(({localBounds:b})=>x+b.x+b.width>0 && x+b.x<owner.width && y+b.y+b.height>0 && y+b.y<owner.height);
  }

  drawWall(context, entry, image, left, top, {alpha=1,brightness=1,saturation=1}={}) {
    if (this.disposed) return 0;
    context.save();
    try {
      context.translate(this.bounds.x-left,this.bounds.y-top-this.zMax);
      for (const command of entry.commands) paintTriangle(context,image,command,alpha,brightness,saturation);
      return entry.commands.length;
    } finally { context.restore(); }
  }

  snapshot() { return { groundHeightCacheBuilds: this.builds, groundHeightTriangles: this.triangles,
    groundHeightWallProfiles:this.wallProfiles,groundHeightWallTriangles:this.wallTriangles,groundHeightShadedTriangles:this.shadedTriangles,
    terrainCutawayMaskBuilds:this.terrainMaskBuilds,terrainCutawayMaskReadbacks:this.terrainMaskReadbacks,terrainCutawayClipRects:this._terrainClipRects.length,terrainCutawayCoveragePolygons:this._terrainCoverage.length,terrainCutawayProjectedDepth:this._terrainDepth,
    ownedTerrainCutawayCanvases:(this.terrainMaskCanvas?1:0)+(this.scratchCanvas?1:0),
    terrainCutawayCacheBytes:[this.terrainMaskCanvas,this.scratchCanvas].reduce((n,c)=>n+(c?c.width*c.height*4:0),0),
    ownedHeightCanvases: this.canvas ? 1 : 0, groundHeightCacheBytes: this.canvas ? this.canvas.width * this.canvas.height * 4 : 0 }; }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    if (this.canvas) { this.canvas.width = 0; this.canvas.height = 0; }
    this.canvas = null; this.image = null; this.sample = null; this.factory = null;this.appearance=null;this.params=null;
    this._walls.length = 0;
    for(const canvas of [this.terrainMaskCanvas,this.scratchCanvas])if(canvas){canvas.width=0;canvas.height=0;}
    this.terrainMaskCanvas=null;this.scratchCanvas=null;this._terrainCoverage.length=0;this._terrainDepth=null;
    this.groundClip=null;this._terrainClipRects.length=0;this._terrainClipPath=null;this._terrainOutsidePaths.clear();
  }
}
