/* Read-only active-layer queries; source images and scene-wide validation stay with the caller. */
export const OBJECT_LIST_PAGE_SIZE = 50;
const record = (v,label) => {
  if(!v || typeof v!=='object' || Array.isArray(v)) throw new Error(label+' 오류');
  return v;
};
const text = (v,label) => {
  if(typeof v!=='string' || !v.trim() || v.length>160) throw new Error(label+' 오류');
  return v;
};
const number = (v,min,max,label) => {
  if(typeof v!=='number' || !Number.isFinite(v) || v<min || v>max) throw new Error(label+' 범위 오류');
  return v;
};

function activeLayer(scene,layerId) {
  record(scene,'씬'); text(layerId,'레이어 ID');
  if(scene.format!=='exoduser-map-scene' || scene.version!==1 || !Array.isArray(scene.layers) || scene.layers.length<1 || scene.layers.length>24) throw new Error('씬 레이어 목록 오류');
  let layer;
  const layerIds=new Set();
  for(const l of scene.layers) {
    record(l,'레이어'); text(l.id,'레이어 ID');
    if(layerIds.has(l.id)) throw new Error('중복 레이어 ID');
    layerIds.add(l.id); if(l.id===layerId) layer=l;
  }
  if(!layer) throw new Error('레이어를 찾을 수 없습니다');
  text(layer.name,'레이어 이름');
  if(typeof layer.visible!=='boolean' || typeof layer.locked!=='boolean' || !['flat','foot'].includes(layer.sort)) throw new Error('레이어 설정 오류');
  number(layer.parallax,0,1,'레이어 시차');
  if(!Array.isArray(layer.objects) || layer.objects.length>2000) throw new Error('레이어 객체 목록 오류');
  const ids=new Set();
  for(const o of layer.objects) {
    record(o,'객체'); text(o.id,'객체 ID'); text(o.assetId,'에셋 ID'); text(o.name,'객체 이름');
    if(ids.has(o.id)) throw new Error('중복 객체 ID');
    ids.add(o.id);
    number(o.x,-40000,40000,'객체 x'); number(o.y,-40000,40000,'객체 y');
    number(o.width,1,32000,'객체 너비'); number(o.height,1,32000,'객체 높이');
  }
  return layer;
}

/** Front-to-back rows from the active layer, matching stable renderer ordering. */
export function inspectLayerObjects(scene,layerId,query='',page=0) {
  if(typeof query!=='string' || query.length>160) throw new Error('객체 검색어 오류');
  number(page,0,1000000,'객체 목록 페이지');
  if(!Number.isInteger(page)) throw new Error('객체 목록 페이지는 정수여야 합니다');
  const l=activeLayer(scene,layerId), needle=query.trim().toLowerCase();
  const ordered=l.objects.map((o,index)=>({o,index}));
  if(l.sort==='foot') ordered.sort((a,b)=>a.o.y-b.o.y || a.index-b.index);
  ordered.reverse();
  const matched=ordered.filter(({o})=>!needle || [o.name,o.id,o.assetId].some(v=>v.toLowerCase().includes(needle)));
  const pages=Math.ceil(matched.length/OBJECT_LIST_PAGE_SIZE), selectedPage=pages?Math.min(page,pages-1):0;
  const rows=matched.slice(selectedPage*OBJECT_LIST_PAGE_SIZE,(selectedPage+1)*OBJECT_LIST_PAGE_SIZE).map(({o})=>({
    objectId:o.id,assetId:o.assetId,name:o.name,x:o.x,y:o.y,width:o.width,height:o.height
  }));
  return {layerId:l.id,layerName:l.name,locked:l.locked,visible:l.visible,total:l.objects.length,matched:matched.length,page:selectedPage,pages,rows};
}

/** Camera centre that puts the object's foot anchor at screen centre before caller clamping. */
export function focusObjectFoot(scene,layerId,objectId) {
  text(objectId,'객체 ID');
  const l=activeLayer(scene,layerId), o=l.objects.find(o=>o.id===objectId);
  if(!o) throw new Error('객체를 찾을 수 없습니다');
  const w=record(scene.world,'월드');
  number(w.cols,10,300,'월드 가로 타일'); number(w.rows,10,300,'월드 세로 타일'); number(w.tileSize,8,128,'월드 타일 크기');
  if(!Number.isInteger(w.cols) || !Number.isInteger(w.rows)) throw new Error('월드 타일 수는 정수여야 합니다');
  const p=l.parallax;
  if(p===0) return null;
  const x=(o.x-(1-p)*w.cols*w.tileSize/2)/p, y=(o.y-(1-p)*w.rows*w.tileSize/2)/p;
  if(!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('객체 보기 카메라 좌표 오류');
  return {x,y};
}

/** Fit transformed selected image rectangles without changing scene or selection. */
export function frameLayerObjects(scene,layerId,objectIds,screenWidth,screenHeight) {
  if(!Array.isArray(objectIds) || !objectIds.length || objectIds.length>2000 || new Set(objectIds).size!==objectIds.length) throw new Error('선택 객체 목록 오류');
  objectIds.forEach(id=>text(id,'객체 ID'));
  number(screenWidth,1,100000,'화면 너비'); number(screenHeight,1,100000,'화면 높이');
  const l=activeLayer(scene,layerId), p=l.parallax;
  if(!l.visible || p===0) return null;
  const w=record(scene.world,'월드');
  number(w.cols,10,300,'월드 가로 타일'); number(w.rows,10,300,'월드 세로 타일'); number(w.tileSize,8,128,'월드 타일 크기');
  if(!Number.isInteger(w.cols) || !Number.isInteger(w.rows)) throw new Error('월드 타일 수는 정수여야 합니다');
  const byId=new Map(l.objects.map(o=>[o.id,o]));
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const id of objectIds) {
    const o=byId.get(id);if(!o) throw new Error('선택 객체를 찾을 수 없습니다');
    number(o.pivotX,0,1,'기준점 x'); number(o.pivotY,0,1,'기준점 y'); number(o.rotation,-360,360,'회전');
    if(typeof o.flipX!=='boolean') throw new Error('반전 설정 오류');
    const a=o.rotation*Math.PI/180,c=Math.cos(a),s=Math.sin(a),sign=o.flipX?-1:1;
    for(const u of [0,o.width]) for(const v of [0,o.height]) {
      const dx=(u-o.width*o.pivotX)*sign,dy=v-o.height*o.pivotY;
      const x=o.x+dx*c-dy*s,y=o.y+dx*s+dy*c;
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    }
  }
  const padX=Math.min(40,screenWidth*.1),padY=Math.min(40,screenHeight*.1);
  const zoom=Math.min(3,(screenWidth-padX*2)/(maxX-minX),(screenHeight-padY*2)/(maxY-minY));
  const x=((minX+maxX)/2-(1-p)*w.cols*w.tileSize/2)/p,y=((minY+maxY)/2-(1-p)*w.rows*w.tileSize/2)/p;
  if(![x,y,zoom].every(Number.isFinite) || zoom<=0) throw new Error('선택 맞춤 카메라 오류');
  return {x,y,zoom};
}
