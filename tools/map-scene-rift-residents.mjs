/* Optional editor-only profile for the derived clean plate and resident atlas.
 * It never changes scene/nav/storage or promises pixel-exact extraction of the painting.
 * Source/crop/world registration is fixed; resident anchors follow editable body objects.
 */
export const RESIDENT_PREVIEW = Object.freeze({
  kind: 'independent-resident-preview-v1', size: 1254,
  cleanPlate: 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png',
  cleanPlateSha256: 'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673',
  atlas: 'assets/map/hell_rift/resident_layers_20261006/resident-atlas-v1.png',
  atlasSha256: 'ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38',
  originalPaintingSha256: 'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4'
});
const BODIES = Object.freeze([
  ['haran', 'rift-rest-haran', 169, 27, 350, 578, 4660, 6700],
  ['berin', 'rift-gift-berin', 748, 257, 363, 352, 5980, 5620],
  ['nessa', 'rift-request-nessa', 197, 660, 262, 547, 6220, 5020],
  ['dorik', 'rift-prepare-dorik', 813, 742, 240, 465, 5180, 2540]
]);
const CROPS = Object.freeze([
  ['west-0', 'west', 0, 0, 641, 961], ['west-1', 'west', 0, 959, 641, 961],
  ['east-0', 'east', 1279, 0, 641, 961], ['east-1', 'east', 1279, 959, 641, 961],
  ['centre-0', 'centre', 639, 0, 642, 961], ['centre-1', 'centre', 639, 959, 642, 961]
]);
const near = (a,b) => Number.isFinite(a) && Math.abs(a-b)<=1e-6;

const issueValue = (value,depth=0,seen=new Set()) => {
  if(value===undefined) return 'undefined';
  if(value===null || typeof value==='string' || typeof value==='boolean') return value;
  if(typeof value==='number') return Number.isFinite(value) ? value : String(value);
  if(typeof value==='bigint') return String(value)+'n';
  if(typeof value==='symbol') return String(value);
  if(typeof value==='function') return '[function]';
  if(depth>=4) return '[object]';
  if(seen.has(value)) return '[circular]';
  try {
    seen.add(value);
    const descriptors=Object.getOwnPropertyDescriptors(value), out=Array.isArray(value)?[]:{};
    for(const key of Object.keys(descriptors).filter(key=>key!=='length').slice(0,16)) {
      const d=descriptors[key], next='value' in d?issueValue(d.value,depth+1,seen):'[accessor]';
      Object.defineProperty(out,key,{value:next,enumerable:true,writable:true,configurable:true});
    }
    seen.delete(value);return out;
  } catch (_) { return '[읽기 실패]'; }
};

/** The same registration gate used by consumers, with its first failed field. */
export function inspectResidentPaintingRegistration(scene) {
  let supported=false;
  const fail=(target,field,actual,expected)=>({supported,valid:false,profile:null,issue:{target,field,actual:issueValue(actual),expected:expected===undefined?'undefined':expected}});
  try {
    const r=scene.residentLayerReview, p=RESIDENT_PREVIEW;
    if(r?.kind!==p.kind) return fail('scene','residentLayerReview.kind',r?.kind,p.kind);
    supported=true;
    if(r.notAdopted!==true) return fail('scene','residentLayerReview.notAdopted',r.notAdopted,true);
    if(r.originalPaintingSha256!==p.originalPaintingSha256) return fail('scene','residentLayerReview.originalPaintingSha256',r.originalPaintingSha256,p.originalPaintingSha256);
    if(scene.sourcePins?.painting!==p.originalPaintingSha256) return fail('scene','sourcePins.painting',scene.sourcePins?.painting,p.originalPaintingSha256);
    if(scene.sourcePins.cleanPlate!==p.cleanPlateSha256) return fail('scene','sourcePins.cleanPlate',scene.sourcePins.cleanPlate,p.cleanPlateSha256);
    if(scene.sourcePins.residentAtlas!==p.atlasSha256) return fail('scene','sourcePins.residentAtlas',scene.sourcePins.residentAtlas,p.atlasSha256);
    for(const [k,src,pin] of [['cleanPlate',p.cleanPlate,p.cleanPlateSha256],['atlas',p.atlas,p.atlasSha256]]) {
      if(r[k]?.src!==src) return fail('scene','residentLayerReview.'+k+'.src',r[k]?.src,src);
      if(r[k].sha256!==pin) return fail('scene','residentLayerReview.'+k+'.sha256',r[k].sha256,pin);
      if(r[k].width!==p.size) return fail('scene','residentLayerReview.'+k+'.width',r[k].width,p.size);
      if(r[k].height!==p.size) return fail('scene','residentLayerReview.'+k+'.height',r[k].height,p.size);
    }
    const ratio=p.size/1920;
    for(const [id,layer,x,y,w,h] of CROPS) {
      const a=scene.assets.find(a=>a.id===id), l=scene.layers.find(l=>l.id===layer), o=l?.objects.find(o=>o.id==='obj-'+id);
      if(!a) return fail('asset:'+id,'present',false,true);
      if(a.src!==p.cleanPlate) return fail('asset:'+id,'src',a.src,p.cleanPlate);
      if(a.width!==p.size) return fail('asset:'+id,'width',a.width,p.size);
      if(a.height!==p.size) return fail('asset:'+id,'height',a.height,p.size);
      if(!l.visible) return fail('layer:'+layer,'visible',l.visible,true);
      if(!o) return fail('object:obj-'+id,'present',false,true);
      if(o.assetId!==id) return fail('object:'+o.id,'assetId',o.assetId,id);
      if(o.pivotX!==0) return fail('object:'+o.id,'pivotX',o.pivotX,0);
      if(o.pivotY!==0) return fail('object:'+o.id,'pivotY',o.pivotY,0);
      if(o.rotation!==0) return fail('object:'+o.id,'rotation',o.rotation,0);
      if(o.flipX) return fail('object:'+o.id,'flipX',o.flipX,false);
      if(o.opacity!==1) return fail('object:'+o.id,'opacity',o.opacity,1);
      if(o.mask!==undefined) return fail('object:'+o.id,'mask',o.mask,undefined);
      const values=[a.crop?.x,a.crop?.y,a.crop?.w,a.crop?.h,o.x,o.y,o.width,o.height];
      const expected=[x*ratio,y*ratio,w*ratio,h*ratio,x*25/6,y*25/6,w*25/6,h*25/6];
      const checks=values.map((value,i)=>near(value,expected[i])), bad=checks.indexOf(false);
      if(bad!==-1) return fail(bad<4?'asset:'+id:'object:'+o.id,['crop.x','crop.y','crop.w','crop.h','x','y','width','height'][bad],values[bad],{value:expected[bad],tolerance:1e-6});
    }
    const foot=scene.layers.find(l=>l.id==='foot');
    if(!foot?.visible) return fail('layer:foot','visible',foot?.visible,true);
    if(foot.sort!=='foot') return fail('layer:foot','sort',foot.sort,'foot');
    if(foot.parallax!==1) return fail('layer:foot','parallax',foot.parallax,1);
    for(const [key,,x,y,w,h] of BODIES) {
      const a=scene.assets.find(a=>a.id==='resident-'+key), o=foot.objects.find(o=>o.id==='obj-resident-'+key);
      if(!a) return fail('asset:resident-'+key,'present',false,true);
      if(a.src!==p.atlas) return fail('asset:'+a.id,'src',a.src,p.atlas);
      if(a.width!==p.size) return fail('asset:'+a.id,'width',a.width,p.size);
      if(a.height!==p.size) return fail('asset:'+a.id,'height',a.height,p.size);
      if(!o) return fail('object:obj-resident-'+key,'present',false,true);
      if(o.assetId!==a.id) return fail('object:'+o.id,'assetId',o.assetId,a.id);
      if(o.mask!==undefined) return fail('object:'+o.id,'mask',o.mask,undefined);
      if(o.rotation!==0) return fail('object:'+o.id,'rotation',o.rotation,0);
      if(o.flipX) return fail('object:'+o.id,'flipX',o.flipX,false);
      if(o.opacity!==1) return fail('object:'+o.id,'opacity',o.opacity,1);
      if(o.pivotX!==.5) return fail('object:'+o.id,'pivotX',o.pivotX,.5);
      if(o.pivotY!==1) return fail('object:'+o.id,'pivotY',o.pivotY,1);
      if(a.crop?.x!==x) return fail('asset:'+a.id,'crop.x',a.crop?.x,x);
      if(a.crop?.y!==y) return fail('asset:'+a.id,'crop.y',a.crop?.y,y);
      if(a.crop?.w!==w) return fail('asset:'+a.id,'crop.w',a.crop?.w,w);
      if(a.crop?.h!==h) return fail('asset:'+a.id,'crop.h',a.crop?.h,h);
      if(!near(o.width/o.height,w/h)) return fail('object:'+o.id,'width/height',o.width/o.height,{value:w/h,tolerance:1e-6});
      if(!Number.isFinite(o.x)) return fail('object:'+o.id,'x',o.x,{min:0,maxExclusive:8000,finite:true});
      if(!Number.isFinite(o.y)) return fail('object:'+o.id,'y',o.y,{min:0,maxExclusive:8000,finite:true});
      if(o.x<0) return fail('object:'+o.id,'x',o.x,{min:0,maxExclusive:8000,finite:true});
      if(o.y<0) return fail('object:'+o.id,'y',o.y,{min:0,maxExclusive:8000,finite:true});
      if(o.x>=8000) return fail('object:'+o.id,'x',o.x,{min:0,maxExclusive:8000,finite:true});
      if(o.y>=8000) return fail('object:'+o.id,'y',o.y,{min:0,maxExclusive:8000,finite:true});
      if(o.height<1) return fail('object:'+o.id,'height',o.height,{min:1,max:32000});
      if(o.height>32000) return fail('object:'+o.id,'height',o.height,{min:1,max:32000});
    }
    return {supported,valid:true,profile:{src:p.cleanPlate,size:p.size,worldPerSourcePixel:8000/p.size},issue:null};
  } catch (_) { return fail('scene','read','읽기 실패','검사 가능한 주민 등록'); }
}

/** null on any unknown image/registration/body identity; no fallback scene guessing. */
export function residentPaintingProfile(scene) {
  return inspectResidentPaintingRegistration(scene).profile;
}

/** Positions are the current body's foot, never a painted-camera POI. */
export function residentDialogueAnchors(scene) {
  if(!residentPaintingProfile(scene)) return null;
  const foot=scene.layers.find(l=>l.id==='foot');
  return BODIES.map(([key,npcId,,,,,ax,ay])=>{
    const o=foot.objects.find(o=>o.id==='obj-resident-'+key);
    return {npcId,x:o.x,y:o.y,visualX:o.x,visualY:o.y,labelHeight:o.height,approach:{x:ax,y:ay}};
  });
}

export const RESIDENT_GROUNDING = Object.freeze({
  radius:12, widthRatio:.42, heightRatio:.08,
  minRadiusX:2, maxRadiusX:32, minRadiusY:1, maxRadiusY:8,
  centreAlpha:.34, middleStop:.55, middleAlpha:.15
});

/** Static editor contact shadows. Body/nav edits remain live, including an open drag. */
export function createResidentGrounding(scene, canWalk) {
  if(!residentPaintingProfile(scene) || typeof canWalk!=='function') return null;
  const c=RESIDENT_GROUNDING;
  function snapshot() {
    if(!residentPaintingProfile(scene)) return [];
    const foot=scene.layers.find(l=>l.id==='foot'), w=scene.world;
    if(!w || !Number.isFinite(w.tileSize) || w.tileSize<=0 || !Number.isInteger(w.cols) || !Number.isInteger(w.rows)) return [];
    const shadows=[];
    for(const [key,npcId] of BODIES) {
      const o=foot.objects.find(o=>o.id==='obj-resident-'+key);
      try {
        if(canWalk(scene,o.x,o.y,c.radius)!==true) continue;
        const rx=Math.max(c.minRadiusX,Math.min(c.maxRadiusX,o.width*c.widthRatio));
        const ry=Math.max(c.minRadiusY,Math.min(c.maxRadiusY,o.height*c.heightRatio));
        const cells=[];
        for(let y=Math.max(0,Math.floor((o.y-ry)/w.tileSize));y<=Math.min(w.rows-1,Math.floor((o.y+ry)/w.tileSize));y++) {
          for(let x=Math.max(0,Math.floor((o.x-rx)/w.tileSize));x<=Math.min(w.cols-1,Math.floor((o.x+rx)/w.tileSize));x++) {
            if(canWalk(scene,(x+.5)*w.tileSize,(y+.5)*w.tileSize,0)===true) cells.push({x:x*w.tileSize,y:y*w.tileSize,width:w.tileSize,height:w.tileSize});
          }
        }
        if(cells.length) shadows.push({key,npcId,x:o.x,y:o.y,rx,ry,cells});
      } catch (_) { /* An unsupported/failed walk query adds no guessed ground. */ }
    }
    return shadows;
  }
  function draw(target) {
    if(!target || !['save','restore','beginPath','rect','clip','translate','scale','createRadialGradient','fillRect'].every(k=>typeof target[k]==='function')) return 0;
    const shadows=snapshot();
    for(const s of shadows) {
      target.save();
      try {
        target.beginPath();for(const cell of s.cells) target.rect(cell.x,cell.y,cell.width,cell.height);target.clip();
        target.translate(s.x,s.y);target.scale(s.rx,s.ry);
        const gradient=target.createRadialGradient(0,0,0,0,0,1);
        gradient.addColorStop(0,'rgba(8,9,6,'+c.centreAlpha+')');
        gradient.addColorStop(c.middleStop,'rgba(8,9,6,'+c.middleAlpha+')');
        gradient.addColorStop(1,'rgba(8,9,6,0)');
        target.fillStyle=gradient;target.fillRect(-1,-1,2,2);
      } finally { target.restore(); }
    }
    return shadows.length;
  }
  return Object.freeze({draw,snapshot});
}
