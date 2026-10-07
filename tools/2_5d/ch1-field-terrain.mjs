/* Same-game CH1-1 ground consumer. Borrows decoded production chunks and the
 * authoritative map/player/camera; owns no simulation, navigation, images or RAF.
 * This baseline has ground height zero. Authored relief/3D actors remain pending.
 */
import * as THREE from '../../assets/vendor/three-r160/build/three.module.js';

export const CH1_FIELD_TERRAIN = Object.freeze({
  completionId:'ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007', stage:0,
  angle:50, scale:400, maxChunks:25, sourceSize:1026, coreSize:1024,
  bleed:1, height:0, ownsSimulation:false, ownsRAF:false, mainPlayableAccepted:false
});

export function createCh1FieldTerrain(){
  if(THREE.REVISION!=='160')throw new Error('CH1-1 requires local Three r160');
  const canvas=document.createElement('canvas'), scene=new THREE.Scene();
  const theta=CH1_FIELD_TERRAIN.angle*Math.PI/180, sin=Math.sin(theta), cos=Math.cos(theta), scale=400;
  const records=new Map(), stats={frames:0,cacheHits:0,textureCreates:0,textureDisposes:0,fallbacks:0,drawMs:0,maxDrawMs:0};
  let renderer=null,camera=null,disposed=false,lost=false,failed=false,lastSignature='',lastMap=null,frame=null;
  let reason='awaiting-main-frame',shaderFailed=false;
  function drop(record){
    scene.remove(record.mesh);
    record.geometry.dispose();record.material.dispose();record.texture.dispose();stats.textureDisposes++;
  }
  function clear(){for(const r of records.values())drop(r);records.clear();lastSignature='';frame=null;}
  function onLost(){lost=true;reason='context-lost';}
  canvas.addEventListener('webglcontextlost',onLost);
  const project=(x,y)=>new THREE.Vector3((x-4000)/scale,0,(y-4000)/(scale*sin));
  function valid(input){
    if(!input||input.stage!==0||input.mw!==200||input.mh!==200||input.tileSize!==40||!Array.isArray(input.map)||input.map.length!==200)return false;
    if(!input.player||!Number.isFinite(input.player.x)||!Number.isFinite(input.player.y)||!input.cam||!Number.isFinite(input.cam.x)||!Number.isFinite(input.cam.y))return false;
    if(![input.width,input.height,input.zoom,input.backingScale].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)||input.zoom<.3||input.zoom>4||input.backingScale>4)return false;
    if(input.width>4096||input.height>4096||input.root!=='assets/map/ch1/production_finish'||input.chunkSize!==1024||input.bleed!==1)return false;
    return !!input.cache&&!!input.chunks;
  }
  function reject(why){stats.fallbacks++;reason=why;return null;}
  function make(id,image,x,y){
    const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;
    texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;
    texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;
    const geometry=new THREE.BufferGeometry(), a=project(x*1000,y*1000),b=project((x+1)*1000,(y+1)*1000);
    geometry.setAttribute('position',new THREE.Float32BufferAttribute([a.x,0,a.z,b.x,0,a.z,b.x,0,b.z,a.x,0,b.z],3));
    const lo=1/1026,hi=1025/1026;
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute([lo,hi,hi,hi,hi,lo,lo,lo],2));
    geometry.setIndex([0,2,1,0,3,2]);geometry.computeBoundingSphere();
    const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
    const mesh=new THREE.Mesh(geometry,material);mesh.name='CH1-1 production '+id;scene.add(mesh);
    stats.textureCreates++;return {mesh,texture,geometry,material,image};
  }
  function render(input){
    if(disposed||lost||failed)return reject(disposed?'disposed':lost?'context-lost':'renderer-failed');
    if(!valid(input))return reject('unsupported-main-frame');
    const {cam,width,height,zoom}=input, left=cam.x-width/(2*zoom),top=cam.y-height/(2*zoom),worldWidth=width/zoom,worldHeight=height/zoom;
    // Exact opaque replacement only. Edges/cold/failed chunks use the existing renderer.
    if(left<0||top<0||left+worldWidth>8000||top+worldHeight>8000)return reject('view-outside-production');
    const x0=Math.floor(left/1000),x1=Math.floor((left+worldWidth-1e-6)/1000),y0=Math.floor(top/1000),y1=Math.floor((top+worldHeight-1e-6)/1000);
    const desired=[];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const id=x+','+y,entry=input.cache[id],image=entry?.img;
      if(typeof input.chunks[id]!=='string'||entry?.status!=='ready'||!image?.complete||image.naturalWidth!==1026||image.naturalHeight!==1026)return reject('chunk-not-ready');
      desired.push({id,image,x,y});
    }
    if(desired.length>25)return reject('chunk-budget');
    const pixelWidth=Math.round(width*Math.min(2,input.backingScale)),pixelHeight=Math.round(height*Math.min(2,input.backingScale));
    if(pixelWidth<1||pixelHeight<1||pixelWidth>4096||pixelHeight>4096)return reject('backing-budget');
    try{
      if(lastMap!==input.map){clear();lastMap=input.map;}
      if(!renderer){
        renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'default'});
        renderer.debug.checkShaderErrors=true;renderer.debug.onShaderError=()=>{shaderFailed=true;};
        renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,1);
        camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,1000);
      }
      const keep=new Set(desired.map(r=>r.id));
      for(const [id,r]of records)if(!keep.has(id)){drop(r);records.delete(id);}
      for(const item of desired){
        const old=records.get(item.id);
        if(old?.image===item.image)continue;
        if(old){drop(old);records.delete(item.id);}
        records.set(item.id,make(item.id,item.image,item.x,item.y));lastSignature='';
      }
      const signature=[cam.x,cam.y,width,height,zoom,pixelWidth,pixelHeight,...desired.map(r=>r.id)].join('|');
      if(signature!==lastSignature){
        const started=performance.now();
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight)renderer.setSize(pixelWidth,pixelHeight,false);
        camera.left=-worldWidth/(2*scale);camera.right=worldWidth/(2*scale);
        camera.top=worldHeight/(2*scale);camera.bottom=-worldHeight/(2*scale);
        const target=project(cam.x,cam.y);
        camera.position.set(target.x,100*sin,target.z+100*cos);camera.up.set(0,1,0);camera.lookAt(target);camera.updateProjectionMatrix();
        renderer.render(scene,camera);
        const gl=renderer.getContext();if(shaderFailed||lost||gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('CH1-1 terrain WebGL failure');
        canvas._glVer=(canvas._glVer||0)+1;lastSignature=signature;stats.frames++;
        stats.drawMs=performance.now()-started;stats.maxDrawMs=Math.max(stats.maxDrawMs,stats.drawMs);
      }else stats.cacheHits++;
      reason='ready';
      frame=Object.freeze({canvas,left,top,width:worldWidth,height:worldHeight,ids:Object.freeze(desired.map(r=>r.id))});
      return frame;
    }catch(_){failed=true;reason='renderer-failed';clear();return reject(reason);}
  }
  function suspend(){if(disposed)return;clear();lastMap=null;reason='inactive-stage';}
  function snapshot(){return Object.freeze({...stats,ready:reason==='ready',reason,disposed,lost,failed,loadedChunks:records.size,visibleIds:frame?.ids||Object.freeze([]),mapSource:'G.map',playerSource:'P',cameraSource:'G.cam',groundHeight:0,actualReliefAccepted:false,actors3DAccepted:false,mainPlayableAccepted:false,ownsRAF:false,ownsImages:false});}
  function dispose(){if(disposed)return false;disposed=true;reason='disposed';canvas.removeEventListener('webglcontextlost',onLost);clear();lastMap=null;renderer?.dispose();renderer=null;camera=null;return true;}
  return Object.freeze({canvas,render,suspend,snapshot,dispose});
}
