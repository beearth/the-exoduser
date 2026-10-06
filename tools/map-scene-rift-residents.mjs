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

/** null on any unknown image/registration/body identity; no fallback scene guessing. */
export function residentPaintingProfile(scene) {
  try {
    const r=scene.residentLayerReview, p=RESIDENT_PREVIEW;
    if(r?.kind!==p.kind || r.notAdopted!==true || r.originalPaintingSha256!==p.originalPaintingSha256 ||
       scene.sourcePins?.painting!==p.originalPaintingSha256 || scene.sourcePins.cleanPlate!==p.cleanPlateSha256 || scene.sourcePins.residentAtlas!==p.atlasSha256) return null;
    for(const [k,src,pin] of [['cleanPlate',p.cleanPlate,p.cleanPlateSha256],['atlas',p.atlas,p.atlasSha256]]) {
      if(r[k]?.src!==src || r[k].sha256!==pin || r[k].width!==p.size || r[k].height!==p.size) return null;
    }
    const ratio=p.size/1920;
    for(const [id,layer,x,y,w,h] of CROPS) {
      const a=scene.assets.find(a=>a.id===id), l=scene.layers.find(l=>l.id===layer), o=l?.objects.find(o=>o.id==='obj-'+id);
      if(!a || a.src!==p.cleanPlate || a.width!==p.size || a.height!==p.size || !l.visible || !o || o.assetId!==id || o.pivotX!==0 || o.pivotY!==0 || o.rotation!==0 || o.flipX || o.opacity!==1 || o.mask!==undefined) return null;
      if(![near(a.crop?.x,x*ratio),near(a.crop?.y,y*ratio),near(a.crop?.w,w*ratio),near(a.crop?.h,h*ratio),near(o.x,x*25/6),near(o.y,y*25/6),near(o.width,w*25/6),near(o.height,h*25/6)].every(Boolean)) return null;
    }
    const foot=scene.layers.find(l=>l.id==='foot');
    if(!foot?.visible || foot.sort!=='foot' || foot.parallax!==1) return null;
    for(const [key,,x,y,w,h] of BODIES) {
      const a=scene.assets.find(a=>a.id==='resident-'+key), o=foot.objects.find(o=>o.id==='obj-resident-'+key);
      if(!a || a.src!==p.atlas || a.width!==p.size || a.height!==p.size || !o || o.assetId!==a.id || o.mask!==undefined || o.rotation!==0 || o.flipX || o.opacity!==1 || o.pivotX!==.5 || o.pivotY!==1) return null;
      if(a.crop?.x!==x || a.crop?.y!==y || a.crop?.w!==w || a.crop?.h!==h || !near(o.width/o.height,w/h) || !Number.isFinite(o.x) || !Number.isFinite(o.y) || o.x<0 || o.y<0 || o.x>=8000 || o.y>=8000 || o.height<1 || o.height>32000) return null;
    }
    return {src:p.cleanPlate,size:p.size,worldPerSourcePixel:8000/p.size};
  } catch (_) { return null; }
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
