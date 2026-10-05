/* Assemble editable image sections with a reviewed painted-floor route. Source art/layout stay intact. */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), sourceDir = 'assets/map/hell_rift/interspace_20261005';
const context = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(__dirname,'map-scene-core.js'),'utf8'),context);const K=context.MapSceneCore;
vm.runInNewContext(fs.readFileSync(path.join(root, sourceDir, 'layout.js'), 'utf8'), context);
const source = context.window.HELL_RIFT_INTERSPACE, r = source.variants.interspace, scale = 8000 / 1920;
const painting = sourceDir + '/hell-rift-painterly-v2.png', abyss = sourceDir + '/hell-rift-abyss-v3.png';
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
// Tile-space centreline follows the painted eastern ledge; the original candidate crosses empty air.
const centreline = [[100.5,193.5],[102,184],[111,176],[119,167],[123,161],[131,154],[140,148],[145,143],[149,138],[152,133],[155,128],[156,123],[160,119],[161,114],[160,110],[159,106],[156,102],[152,100],[146,97],[140,94],[134,92],[129,89],[129,85],[130,81],[130,77],[131,73],[133,69],[132,65],[126,62],[119,59],[111,57],[103,56],[102,50],[100.5,43.5]];
const halfWidth = 2.75;
function distanceToSegment(x,y,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
const walkable = Array.from({length:40000},(_,i)=>{
  const x=i%200+.5,y=Math.floor(i/200)+.5;
  return centreline.slice(1).some((b,j)=>distanceToSegment(x,y,centreline[j],b)<=halfWidth)?1:0;
});
const navSHA = crypto.createHash('sha256').update(Buffer.from(walkable)).digest('hex');
const layer = (id,name,sort='flat') => ({id,name,sort,parallax:1,visible:true,locked:false,objects:[]});
const p = {format:'exoduser-map-scene',version:1,name:'지옥의 틈 · 잔류자의 계곡',world:{cols:200,rows:200,tileSize:40},assets:[],layers:[
  layer('west','01 · 서측 절벽과 망자의 턱'),layer('east','02 · 동측 생체 절벽'),layer('centre','03 · 도착지와 상승로'),
  layer('abyss','04 · 고정 균열 속 심연'),layer('foot','05 · 앞쪽 뿌리와 뿔','foot'),layer('front','06 · 추가 전경 작업')
],walkable,start:{x:(r.start.x+.5)*40,y:(r.start.y+.5)*40},exit:{x:(r.exit.x+.5)*40,y:(r.exit.y+.5)*40},
 cameras:source.cameraAnchors.map(([x,y],i)=>({id:'cam-'+i,name:['하층 진입','남쪽 잔불','멈춘 망자의 턱','서쪽 우회로','부탁을 품은 턱','심연의 빛','상승 준비','북쪽 상승로'][i],x:(x+.5)*40,y:(y+.5)*40})),
 productionStatus:'ISOLATED_EDITOR_RESULT_NOT_ADOPTED',sourcePins:{painting:sha(painting),abyss:sha(abyss),originalNav:r.navSha256,nav:navSHA,walkableCount:walkable.filter(Boolean).length},
 navigationReview:{basis:'painted-eastern-ledge',halfWidthTiles:halfWidth,centreline},
 notes:'원화는 원본 그대로, 6개의 crop 조각으로 조립. 균열 source만 시차 이동, 마스크는 월드 고정. 인물은 원화에 포함된 표현이며 대화/NPC 런타임/높이 물리 미연결.'};
function part(id,name,crop,at,layerId,mask) {
  const a={id,name,src:painting,width:1920,height:1920,crop,internal:true};p.assets.push(a);
  const o={id:'obj-'+id,assetId:id,name,x:at.x,y:at.y,width:crop.w*scale,height:crop.h*scale,pivotX:0,pivotY:0,rotation:0,opacity:1,flipX:false};
  if(mask)o.mask=mask;p.layers.find(l=>l.id===layerId).objects.push(o);return o;
}
// One source-pixel overlap at internal edges prevents filtering cracks. World scale stays exactly 25/6.
for(let col=0;col<3;col++)for(let row=0;row<2;row++) {
  const x=Math.max(0,col*640-1),y=Math.max(0,row*960-1),right=Math.min(1920,(col+1)*640+1),bottom=Math.min(1920,(row+1)*960+1);
  const id=['west','centre','east'][col],name=['서쪽 돌 절벽','중앙 진입·상승 지면','동쪽 생체 절벽'][col]+(row?' · 하단':' · 상단');
  part(id+'-'+row,name,{x,y,w:right-x,h:bottom-y},{x:x*scale,y:y*scale},id);
}
const fissure=[[103,61],[106,69],[102,74],[110,81],[111,91],[115,101],[113,111],[111,120],[111,131],[106,143],[97,157],[91,163],[86,163],[83,157],[74,150],[77,141],[79,137],[76,130],[81,122],[79,116],[85,108],[82,104],[85,100],[88,91],[85,85],[90,80],[94,73],[102,65]];
p.assets.push({id:'rift-depth',name:'심연 · 별도 후경 이미지',src:abyss,width:1920,height:1920,crop:{x:0,y:0,w:1920,h:1920},internal:true});
p.layers.find(l=>l.id==='abyss').objects.push({id:'obj-rift-depth',assetId:'rift-depth',name:'고정 균열 · 깊은 청회색 심연',x:0,y:0,width:8000,height:8000,pivotX:0,pivotY:0,rotation:0,opacity:.38,flipX:false,mask:fissure.map(([x,y])=>[x/200,y/200]),maskFeather:120,sourceParallax:.965});
const fronts=[
 {id:'west-root',name:'서측 · 앞으로 뻗은 뿌리',foot:134,poly:[[66,116],[65,121],[62,123],[63,127],[59,129],[57,132],[53,133],[56,134],[63,132],[66,128],[68,123],[69,121]]},
 {id:'east-horn',name:'동측 · 길 앞의 뿔',foot:108,poly:[[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]]},
 {id:'south-root',name:'남측 · 도착지 전경 뿌리',foot:173,poly:[[123,157],[124,162],[128,165],[131,169],[130,172],[126,173],[124,169],[121,167],[118,165],[119,161]]}
];
for(const f of fronts) {
 const x0=Math.min(...f.poly.map(v=>v[0])),y0=Math.min(...f.poly.map(v=>v[1])),w=Math.max(...f.poly.map(v=>v[0]))-x0,h=Math.max(...f.poly.map(v=>v[1]))-y0;
 const o=part(f.id,f.name,{x:x0*9.6,y:y0*9.6,w:w*9.6,h:h*9.6},{x:x0*40,y:f.foot*40},'foot',f.poly.map(([x,y])=>[(x-x0)/w,(y-y0)/h]));o.pivotY=(f.foot-y0)/h;o.width=w*40;o.height=h*40;
}
const valid=K.validate(p),route=K.route(valid);if(!route.pass)throw new Error(route.reason);
const destination=path.join(root,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json');fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,JSON.stringify(valid));
console.log(JSON.stringify({destination,assets:p.assets.length,layers:p.layers.length,objects:p.layers.reduce((sum,l)=>sum+l.objects.length,0),walkable:p.walkable.filter(Boolean).length,route,sceneSha256:sha(path.relative(root,destination)),sourcePins:p.sourcePins},null,2));
