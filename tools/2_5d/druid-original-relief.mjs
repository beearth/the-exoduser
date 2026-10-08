// Original boss_dark_druid_f0 artwork, authored as a shallow front-facing relief.
// The caller owns the decoded image; this module never fetches, edits or closes it.
const SOURCE_WIDTH=355,SOURCE_HEIGHT=541;
const DEPTH_SCALE=.4,DEPTH_CAP=.044; // Maximum relief depth is .044 * height.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const smooth=(min,max,value)=>{const t=clamp((value-min)/(max-min),0,1);return t*t*(3-2*t);};
const ellipse=(x,y,cx,cy,rx,ry)=>Math.exp(-2.5*(((x-cx)/rx)**2+((y-cy)/ry)**2));
const band=(value,a,b,c,d)=>smooth(a,b,value)*(1-smooth(c,d,value));
const SHAFT=[[.205,.30],[.222,.44],[.267,.70],[.320,.97]];
const CLOAK_FOLDS=[
  [[.590,.34],[.420,.47],[.250,.75],[.030,.92]],
  [[.580,.36],[.450,.59],[.380,.86],[.320,.97]],
  [[.620,.35],[.590,.58],[.640,.80],[.670,.94]],
  [[.680,.34],[.790,.48],[.880,.68],[.980,.91]],
];
function ribbon(x,y,points,width){
  let distance=Infinity;
  for(let i=1;i<points.length;i++){
    const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
    const t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);
    distance=Math.min(distance,Math.hypot(x-ax-dx*t,y-ay-dy*t));
  }
  return 1-smooth(width*.35,width,distance);
}
// These soft image-coordinate regions are conservative depth authoring, not
// extracted anatomy or independent parts. Only the original alpha defines art.
function depthAt(u,v,rgba,index){
  const alpha=rgba[index+3]/255;if(alpha===0)return 0;
  const red=rgba[index]/255,green=rgba[index+1]/255,blue=rgba[index+2]/255;
  const luminance=.2126*red+.7152*green+.0722*blue;
  const mantle=band(v,.25,.35,.96,1)*ellipse(u,v,.61,.62,.48,.64);
  let depth=.010+.023*mantle;
  const folds=CLOAK_FOLDS.map(points=>ribbon(u,v,points,.036));
  depth=Math.max(depth,.012+.032*folds[0],.018+.042*folds[1],.022+.044*folds[2],.012+.036*folds[3]);
  const collar=ellipse(u,v,.62,.355,.23,.09),face=ellipse(u,v,.628,.255,.051,.098),nose=ellipse(u,v,.626,.277,.014,.046);
  depth=Math.max(depth,.016+.050*collar,.018+.062*face+.013*nose);
  const antlers=band(v,-.02,0,.19,.255)*band(u,.25,.34,.98,1.03);
  depth=Math.max(depth,antlers*(.038+.018*luminance));
  const shaft=ribbon(u,v,SHAFT,.018),staffCrown=ellipse(u,v,.155,.195,.138,.176),grip=ellipse(u,v,.223,.433,.047,.053);
  depth=Math.max(depth,.014+.067*shaft,.014+.065*staffCrown,.020+.067*grip);
  const orb=ellipse(u,v,.158,.205,.060,.065)*smooth(.035,.22,green-Math.max(red,blue));
  depth=Math.max(depth,.025+.085*orb);
  const feet=Math.max(ellipse(u,v,.440,.958,.085,.050),ellipse(u,v,.835,.960,.092,.048));
  depth=Math.max(depth,.012+.042*feet);
  // Small source-driven grain stays subordinate to the authored drapery depths.
  depth+=mantle*(luminance-.35)*.002;
  return clamp(depth,0,.110)*(.25+.75*smooth(0,.50,alpha));
}

export function createDruidOriginalRelief({THREE,image,height=1}={}){
  if(!THREE||THREE.REVISION!=='160'||typeof THREE.BufferGeometry!=='function'||typeof THREE.Texture!=='function')throw new Error('Druid relief requires the local Three r160 runtime.');
  if(!Number.isFinite(height)||height<=0||height>20)throw new RangeError('Invalid Druid relief height.');
  if(!image)throw new TypeError('A decoded original Druid image is required.');
  const width=image.naturalWidth??image.width,sourceHeight=image.naturalHeight??image.height;
  if(width!==SOURCE_WIDTH||sourceHeight!==SOURCE_HEIGHT||image.complete===false)throw new Error('Druid relief requires the decoded 355 x 541 original.');
  let object3d=null,geometry=null,material=null,texture=null,disposed=false,cleanupFailures=0;
  const released=new Set();
  function retire(resource){
    if(!resource||released.has(resource))return;
    released.add(resource);try{resource.dispose();}catch(_){cleanupFailures++;}
  }
  function release(){retire(geometry);retire(material);retire(texture);}
  try{
    const samplingCanvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(width,sourceHeight):globalThis.document?.createElement('canvas');
    if(!samplingCanvas)throw new Error('Read-only canvas sampling is unavailable.');
    samplingCanvas.width=width;samplingCanvas.height=sourceHeight;
    const context=samplingCanvas.getContext('2d',{willReadFrequently:true});
    if(!context)throw new Error('Druid source sampling context is unavailable.');
    context.drawImage(image,0,0); // Native dimensions, no source resize/crop or edit.
    const rgba=context.getImageData(0,0,width,sourceHeight).data; // Exactly one readback.
    let opaquePixels=0,minPixelX=width,minPixelY=sourceHeight,maxPixelX=-1,maxPixelY=-1;
    for(let y=0;y<sourceHeight;y++)for(let x=0;x<width;x++)if(rgba[(y*width+x)*4+3]>0){
      opaquePixels++;minPixelX=Math.min(minPixelX,x);minPixelY=Math.min(minPixelY,y);maxPixelX=Math.max(maxPixelX,x);maxPixelY=Math.max(maxPixelY,y);
    }
    if(!opaquePixels)throw new Error('The original Druid image has no visible alpha.');
    // Texel centres plus image edges: if all four corners have alpha zero,
    // their bilinear texture cell is empty and no triangles are allocated.
    // A thin branch or a one-pixel alpha fringe therefore keeps its source texel.
    const columns=width+2,rows=sourceHeight+2,lookup=new Int32Array(columns*rows);lookup.fill(-1);
    const positions=[],uvs=[],indices=[];let depthMin=Infinity,depthMax=-Infinity,discardedCells=0;
    const pixelX=i=>clamp(i-1,0,width-1),pixelY=j=>clamp(j-1,0,sourceHeight-1);
    const coordX=i=>i===0?0:i===columns-1?width:i-.5,coordY=j=>j===0?0:j===rows-1?sourceHeight:j-.5;
    const alphaAt=(i,j)=>rgba[(pixelY(j)*width+pixelX(i))*4+3];
    function vertex(i,j){
      const key=j*columns+i;if(lookup[key]>=0)return lookup[key];
      const x=coordX(i),y=coordY(j),u=x/width,v=y/sourceHeight,index=(pixelY(j)*width+pixelX(i))*4;
      const z=depthAt(u,v,rgba,index)*height*DEPTH_SCALE,result=positions.length/3;
      positions.push((u-.5)*height*width/sourceHeight,(1-v)*height,z);uvs.push(u,1-v);
      depthMin=Math.min(depthMin,z);depthMax=Math.max(depthMax,z);lookup[key]=result;return result;
    }
    for(let j=0;j<rows-1;j++)for(let i=0;i<columns-1;i++){
      if(alphaAt(i,j)===0&&alphaAt(i+1,j)===0&&alphaAt(i,j+1)===0&&alphaAt(i+1,j+1)===0){discardedCells++;continue;}
      const a=vertex(i,j),b=vertex(i+1,j),c=vertex(i,j+1),d=vertex(i+1,j+1);
      indices.push(a,c,b,b,c,d); // +Z front, with source Y decreasing upward.
    }
    geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
    geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
    texture=new THREE.Texture(samplingCanvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
    texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;
    material=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.000001,side:THREE.DoubleSide,depthWrite:true,toneMapped:false});
    const surface=new THREE.Mesh(geometry,material);surface.name='druid-original-relief-surface';surface.frustumCulled=false;
    surface.userData.representation='original-textured-relief';
    object3d=new THREE.Group();object3d.name='dark-druid-original-relief';object3d.add(surface);
    const parts=Object.freeze(['layered-cloak','narrow-face','asymmetric-antlers','staff-and-green-orb','staff-hand','root-feet']);
    const alphaBounds=Object.freeze({left:minPixelX,top:minPixelY,right:maxPixelX+1,bottom:maxPixelY+1});
    function snapshot(){
      return Object.freeze({representation:'original-textured-relief',sourceWidth:width,sourceHeight,aspect:width/sourceHeight,height,width:height*width/sourceHeight,
        front:'+Z',up:'+Y',footAnchor:'image-bottom-centre',vertices:positions.length/3,triangles:indices.length/3,depthMin,depthMax,depth:depthMax-depthMin,depthScale:DEPTH_SCALE,depthLimit:DEPTH_CAP*height,
        parts,alphaBounds,visibleSourcePixels:opaquePixels,discardedAlphaCells:discardedCells,samplingReadbacks:1,geometryCount:1,materialCount:1,textureCount:1,
        sourceImageOwned:false,motion:false,disposed,cleanupFailures,
        limits:'Static shallow relief of the supplied original; conservative image-coordinate depth regions, not anatomical segmentation. Full-image aspect/UV and source colour/alpha are retained; side stretching and mirrored rear artwork are not a reconstructed 3D back. Caller must keep the decoded image unchanged. Native visual acceptance pending.'});
    }
    function dispose(){
      if(disposed)return false;disposed=true;object3d.visible=false;
      try{object3d.removeFromParent();}catch(_){cleanupFailures++;}
      release();return true;
    }
    return Object.freeze({object3d,dispose,snapshot});
  }catch(cause){
    disposed=true;if(object3d){try{object3d.removeFromParent();}catch(_){cleanupFailures++;}}
    release();throw cause;
  }
}
