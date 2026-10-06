/* Manual editor diagnostics only. No scene/nav/story mutation or runtime cache. */
import {residentPaintingProfile, residentDialogueAnchors} from './map-scene-rift-residents.mjs';

export const RESIDENT_ACCESS = Object.freeze({radius:12, range:140, step:20, minApproachDistance:40, maxCells:40000});
const OBJECT_IDS = new Map([
  ['rift-rest-haran','obj-resident-haran'], ['rift-gift-berin','obj-resident-berin'],
  ['rift-request-nessa','obj-resident-nessa'], ['rift-prepare-dorik','obj-resident-dorik']
]);

/** A fresh bounded query of the currently registered independent resident bodies. */
export function inspectResidentAccess(scene, canWalk) {
  if(typeof canWalk!=='function') return {mode:'invalid-query',rows:[]};
  if(!residentPaintingProfile(scene)) {
    return {mode:scene && typeof scene==='object' && 'residentLayerReview' in scene ? 'invalid-profile':'unsupported',rows:[]};
  }
  const w=scene.world, c=RESIDENT_ACCESS, size=w?.cols*w?.rows;
  if(scene.format!=='exoduser-map-scene' || scene.version!==1 || !w ||
     !Number.isInteger(w.cols) || !Number.isInteger(w.rows) || w.cols<1 || w.rows<1 || size>c.maxCells ||
     !Number.isFinite(w.tileSize) || w.tileSize<8 || w.tileSize>128 ||
     !Array.isArray(scene.walkable) || scene.walkable.length!==size || !scene.walkable.every(v=>v===0 || v===1) ||
     !scene.start || !Number.isFinite(scene.start.x) || !Number.isFinite(scene.start.y) ||
     scene.start.x<0 || scene.start.y<0 || scene.start.x>=w.cols*w.tileSize || scene.start.y>=w.rows*w.tileSize) {
    return {mode:'invalid-profile',rows:[]};
  }
  const anchors=residentDialogueAnchors(scene);
  if(!anchors || anchors.length!==4 || anchors.some(a=>!OBJECT_IDS.has(a.npcId))) return {mode:'invalid-profile',rows:[]};
  const t=w.tileSize, connected=new Uint8Array(size), walkable=new Uint8Array(size);
  const centre=id=>({x:(id%w.cols+.5)*t,y:(Math.floor(id/w.cols)+.5)*t});
  const cell=(x,y)=>Math.floor(y/t)*w.cols+Math.floor(x/t);
  function query(x,y) {
    if(!Number.isFinite(x) || !Number.isFinite(y) || x-c.radius<0 || y-c.radius<0 ||
       x+c.radius>=w.cols*t || y+c.radius>=w.rows*t) return false;
    try { return canWalk(scene,x,y,c.radius)===true; } catch (_) { return false; }
  }
  function line(a,b) {
    const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/c.step));
    for(let i=0;i<=steps;i++) if(!query(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps)) return false;
    return true;
  }
  function walkCell(id) {
    if(!walkable[id]) {
      const p=centre(id);
      walkable[id]=scene.walkable[id]===1 && query(p.x,p.y) ? 2:1;
    }
    return walkable[id]===2;
  }
  const seed=cell(scene.start.x,scene.start.y), seedPoint=centre(seed);
  const startReady=query(scene.start.x,scene.start.y) && walkCell(seed) && line(scene.start,seedPoint);
  if(startReady) {
    const queue=new Int32Array(size);let head=0,tail=1;queue[0]=seed;connected[seed]=1;
    while(head<tail) {
      const id=queue[head++], x=id%w.cols, y=Math.floor(id/w.cols), from=centre(id);
      for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
        const nx=x+dx,ny=y+dy;
        if(nx<0 || ny<0 || nx>=w.cols || ny>=w.rows) continue;
        const next=ny*w.cols+nx;
        if(connected[next] || !walkCell(next) || !line(from,centre(next))) continue;
        connected[next]=1;queue[tail++]=next;
      }
    }
  }
  const rows=anchors.map(a=>{
    const foot={x:a.x,y:a.y}, footWalkable=query(foot.x,foot.y);
    const id=cell(foot.x,foot.y), startConnected=footWalkable && !!connected[id] && line(centre(id),foot);
    const row={objectId:OBJECT_IDS.get(a.npcId),npcId:a.npcId,foot,footWalkable,startConnected,approach:null,status:'ready'};
    if(!footWalkable) {row.status='foot-blocked';return row;}
    if(!startReady) {row.status='start-blocked';return row;}
    if(!startConnected) {row.status='no-route';return row;}
    const candidates=[];
    for(let y=Math.max(0,Math.floor((foot.y-c.range)/t));y<=Math.min(w.rows-1,Math.floor((foot.y+c.range)/t));y++) {
      for(let x=Math.max(0,Math.floor((foot.x-c.range)/t));x<=Math.min(w.cols-1,Math.floor((foot.x+c.range)/t));x++) {
        if(!connected[y*w.cols+x]) continue;
        const point=centre(y*w.cols+x), distance=Math.hypot(point.x-foot.x,point.y-foot.y);
        if(distance>=c.minApproachDistance && distance<=c.range) candidates.push({...point,distance});
      }
    }
    candidates.sort((a,b)=>a.distance-b.distance || a.y-b.y || a.x-b.x);
    row.approach=candidates.find(p=>line(p,foot)) || null;
    if(!row.approach) row.status='no-approach';
    return row;
  });
  return {mode:'independent',rows};
}
