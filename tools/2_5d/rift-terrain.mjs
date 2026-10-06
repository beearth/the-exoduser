/* Independent, camera-registered Hell Rift slice. Source height is UNKNOWN.
 * No source pixels, scene, navigation, editor history or gameplay saves are written.
 */
import '../map-scene-core.js';
import { residentPaintingProfile } from '../map-scene-rift-residents.mjs';

export const RIFT_TERRAIN = Object.freeze({
  scene: 'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json',
  sceneSha256: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a',
  cleanPlateSha256: 'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673',
  abyssSha256: 'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991',
  clip: Object.freeze({ left: 4300, top: 3200, right: 6560, bottom: 4600 }),
  centre: Object.freeze({ x: 5430, y: 3900 }),
  spawn: Object.freeze({ x: 5900, y: 3820 }),
  authoredDepth: 240, authoredInset: .9, physicalHeight: 'UNKNOWN'
});
const rootURL = new URL('../../', import.meta.url);
const finite = (n, label) => { if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(label + ' 유한수 오류'); return n; };
async function pinnedBytes(path, pin) {
  const response = await fetch(new URL(path, rootURL));
  if (!response.ok) throw new Error('지형 원자료 로딩 실패: ' + path + ' HTTP ' + response.status);
  const bytes = await response.arrayBuffer();
  if (!globalThis.crypto?.subtle) throw new Error('지형 SHA256 검증을 사용할 수 없습니다');
  const actual = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (actual !== pin) throw new Error('지형 원자료 SHA256 불일치: ' + path);
  return bytes;
}
async function texture(THREE, path, pin, size) {
  const bytes = await pinnedBytes(path, pin), url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  try {
    const image = new Image(); image.src = url; await image.decode();
    if (image.naturalWidth !== size || image.naturalHeight !== size) throw new Error('지형 원본 이미지 크기 불일치: ' + path);
    const t = new THREE.Texture(image); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; return t;
  } finally { URL.revokeObjectURL(url); }
}
function clipPolygon(points, b) {
  let p = points;
  for (const [axis, value, sign] of [[0,b.left,1],[0,b.right,-1],[1,b.top,1],[1,b.bottom,-1]]) {
    const next = [];
    for (let i=0;i<p.length;i++) {
      const a=p[i], c=p[(i+1)%p.length], ia=sign*(a[axis]-value)>=0, ic=sign*(c[axis]-value)>=0;
      if (ia) next.push(a);
      if (ia!==ic) { const f=(value-a[axis])/(c[axis]-a[axis]); next.push([a[0]+(c[0]-a[0])*f,a[1]+(c[1]-a[1])*f]); }
    }
    p=next; if (!p.length) break;
  }
  return p;
}

/** Camera must retain yaw/roll 0 and this elevation; following the mapped foot is safe. */
export async function createRiftTerrain({ THREE, angle=50, scale=400 }={}) {
  if (!THREE?.Group || !THREE.ShapeUtils?.triangulateShape) throw new Error('지형 Three 런타임이 없습니다');
  finite(angle,'카메라 각도'); finite(scale,'지형 배율');
  if (angle<10 || angle>85 || scale<=0 || scale>32000) throw new Error('지형 카메라/배율 범위 오류');
  const K=globalThis.MapSceneCore, cfg=RIFT_TERRAIN, theta=angle*Math.PI/180, sin=Math.sin(theta), cos=Math.cos(theta), resources=[];
  if (!K?.validate || !K?.canWalk) throw new Error('정본 보행 코어가 없습니다');
  const bytes=await pinnedBytes(cfg.scene,cfg.sceneSha256), source=K.validate(JSON.parse(new TextDecoder().decode(bytes)));
  if (!residentPaintingProfile(source) || source.walkable.filter(Boolean).length!==1192) throw new Error('지형 독립 주민/보행 등록이 일치하지 않습니다');
  const worldToScene=(x,y,h=0)=>new THREE.Vector3((finite(x,'world x')-cfg.centre.x)/scale,finite(h,'높이')/scale,((finite(y,'world y')-cfg.centre.y)+h*cos)/(scale*sin));
  const sceneToWorld=(v,y,z)=>{
    const x=typeof v==='object'?v.x:v, yy=typeof v==='object'?v.y:y, zz=typeof v==='object'?v.z:z;
    finite(x,'scene x');finite(yy,'scene y');finite(zz,'scene z');
    return {x:cfg.centre.x+x*scale,y:cfg.centre.y+(zz*sin-yy*cos)*scale,h:yy*scale};
  };
  const object3d=new THREE.Group();object3d.name='Hell Rift · independent registered 2.5D slice';
  const geometry=(points,triangles,h=0,uv=true)=>{
    const pos=[],tex=[];
    for(const triangle of triangles) for(const i of triangle){const q=points[i],v=worldToScene(q[0],q[1],h);pos.push(v.x,v.y,v.z);tex.push(q[0]/8000,1-q[1]/8000);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));g.computeVertexNormals();resources.push(g);return g;
  };
  const triangulate=p=>THREE.ShapeUtils.triangulateShape(p.map(q=>new THREE.Vector2(...q)),[]);
  const mesh=(g,m,name,order=0)=>{resources.push(m);const o=new THREE.Mesh(g,m);o.name=name;o.renderOrder=order;object3d.add(o);return o;};
  let disposed=false, plate, abyss;
  try {
    const plateAsset=source.assets.find(a=>a.id==='centre-0'), abyssObject=source.layers.find(l=>l.id==='abyss').objects.find(o=>o.id==='obj-rift-depth'), abyssAsset=source.assets.find(a=>a.id===abyssObject.assetId);
    // Sequential loading gives error cleanup ownership even if the second image rejects.
    plate=await texture(THREE,plateAsset.src,cfg.cleanPlateSha256,1254);resources.push(plate);
    abyss=await texture(THREE,abyssAsset.src,cfg.abyssSha256,1920);resources.push(abyss);
    const opening=abyssObject.mask.map(([x,y])=>[x*8000,y*8000]), outer=[[0,0],[8000,0],[8000,8000],[0,8000]], all=[...outer,...opening];
    const floorPoints=[],floorTriangles=[];
    for(const tri of THREE.ShapeUtils.triangulateShape(outer.map(p=>new THREE.Vector2(...p)),[opening.map(p=>new THREE.Vector2(...p))])) {
      const p=clipPolygon(tri.map(i=>all[i]),cfg.clip), base=floorPoints.length;floorPoints.push(...p);
      for(let i=1;i<p.length-1;i++)floorTriangles.push([base,base+i,base+i+1]);
    }
    mesh(geometry(floorPoints,floorTriangles),new THREE.MeshBasicMaterial({map:plate,side:THREE.DoubleSide}),'Registered clean-plate ground · exact global UV');
    // This inset/depth is new preview geometry, not a measured cliff footprint or height.
    const centroid=opening.reduce((p,q)=>[p[0]+q[0]/opening.length,p[1]+q[1]/opening.length],[0,0]);
    const inner=opening.map(q=>[centroid[0]+(q[0]-centroid[0])*cfg.authoredInset,centroid[1]+(q[1]-centroid[1])*cfg.authoredInset]);
    const back=clipPolygon(inner,cfg.clip);
    if(back.length>=3) {
      const bm=mesh(geometry(back,triangulate(back),-cfg.authoredDepth),new THREE.MeshBasicMaterial({map:abyss,color:0x8396a7,side:THREE.DoubleSide}),'Authored abyss backplane · source height UNKNOWN');
      const direction=new THREE.Vector3(),position=new THREE.Vector3();
      bm.onBeforeRender=(_renderer,_scene,camera)=>{
        camera.getWorldDirection(direction);camera.getWorldPosition(position);
        if(Math.abs(direction.y)<1e-6)return;
        position.addScaledVector(direction,-position.y/direction.y);
        const view=sceneToWorld(position),factor=1-abyssObject.sourceParallax;
        abyss.offset.set(-(view.x-4000)*factor/8000,(view.y-4000)*factor/8000);
      };
    }
    const wallPos=[],wallColors=[];
    for(let i=0;i<opening.length;i++) {
      const j=(i+1)%opening.length, corners=[opening[i],opening[j],inner[j],inner[i]], clipped=clipPolygon(corners,cfg.clip);
      for(let k=1;k<clipped.length-1;k++)for(const q of [clipped[0],clipped[k],clipped[k+1]]) {
        // Distance to the outer edge determines height without altering the projected mask.
        const a=opening[i],b=opening[j],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
        const distance=Math.abs(dx*(q[1]-a[1])-dy*(q[0]-a[0]))/len;
        const maxDistance=Math.max(1,Math.abs(dx*(inner[i][1]-a[1])-dy*(inner[i][0]-a[0]))/len),f=Math.min(1,distance/maxDistance),v=worldToScene(q[0],q[1],-cfg.authoredDepth*f);
        wallPos.push(v.x,v.y,v.z);const c=new THREE.Color().setRGB(.15-f*.11,.19-f*.13,.22-f*.14);wallColors.push(c.r,c.g,c.b);
      }
    }
    const walls=new THREE.BufferGeometry();walls.setAttribute('position',new THREE.Float32BufferAttribute(wallPos,3));walls.setAttribute('color',new THREE.Float32BufferAttribute(wallColors,3));walls.computeVertexNormals();resources.push(walls);
    mesh(walls,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}),'Authored single chasm skirt · depth240 world');
    const foot=source.layers.find(l=>l.id==='foot'), horn=foot.objects.find(o=>o.id==='obj-east-horn'), asset=source.assets.find(a=>a.id===horn.assetId), points=horn.mask.map(([x,y])=>[horn.x+x*horn.width,horn.y-horn.height+y*horn.height]);
    // A foot-anchored camera-facing cutout: no camera quaternion update is necessary at fixed angle.
    const positions=[],uvs=[];
    for(const tri of triangulate(points))for(const i of tri){const p=points[i];positions.push((p[0]-horn.x)/scale,(horn.y-p[1])/scale,0);uvs.push((asset.crop.x+(p[0]-horn.x)/horn.width*asset.crop.w)/1254,1-(asset.crop.y+(p[1]-(horn.y-horn.height))/horn.height*asset.crop.h)/1254);}
    const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));hg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));resources.push(hg);
    const hm=new THREE.MeshBasicMaterial({map:plate,side:THREE.DoubleSide,alphaTest:.01});resources.push(hm);const ho=new THREE.Mesh(hg,hm);ho.name=horn.id;ho.position.copy(worldToScene(horn.x,horn.y));ho.rotation.x=-theta;ho.renderOrder=10;object3d.add(ho);
    const occluders=[{objectId:horn.id,footY:horn.y,object3d:ho,polygon:points.map(p=>({x:p[0],y:p[1]}))}];
    const bounds={...cfg.clip,centre:{...cfg.centre},width:cfg.clip.right-cfg.clip.left,height:cfg.clip.bottom-cfg.clip.top};
    const canWalk=(x,y,r=12)=>!disposed&&Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(r)&&r>=0&&K.canWalk(source,x,y,r);
    if(!canWalk(cfg.spawn.x,cfg.spawn.y))throw new Error('2.5D 대표 보행 시작점이 막혀 있습니다');
    return {object3d,worldToScene,sceneToWorld,canWalk,spawn:{...cfg.spawn},bounds,occluders,
      snapshot:()=>({disposed,angle,scale,sourceSceneSha256:cfg.sceneSha256,navSha256:source.sourcePins.nav,walkableCount:1192,clip:{...cfg.clip},physicalHeight:'UNKNOWN',authoredDepth:cfg.authoredDepth,authoredInset:cfg.authoredInset,groundTriangles:floorTriangles.length,occluderFootY:horn.y,sourceParallaxApplied:true,maskFeatherApplied:false,nativeAccepted:false}),
      dispose(){if(disposed)return;disposed=true;object3d.clear();for(const r of new Set(resources))r.dispose();resources.length=0;}
    };
  } catch(error) {object3d.clear();for(const r of new Set(resources))r.dispose();throw error;}
}
