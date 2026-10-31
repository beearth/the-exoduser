import {seeded,plantHabitat,waterAt} from './living-layout.mjs';
export function pointInPolygon(x,y,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside;}
export function authoredFoliageLayout(data,hill,tile=40){
 const out=[],used=new Set();
 for(const region of data.regions)for(const zone of region.zones){
  const random=seeded([...zone.id].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,20261031));
  const xs=zone.polygon.map(p=>p[0]),ys=zone.polygon.map(p=>p[1]),spacing=Math.sqrt(10000/zone.density);
  for(let y=Math.min(...ys)+spacing*.35;y<Math.max(...ys);y+=spacing)for(let x=Math.min(...xs)+spacing*.35;x<Math.max(...xs);x+=spacing){
   const px=x+(random()-.5)*spacing*.55,py=y+(random()-.5)*spacing*.55;
   if(!pointInPolygon(px,py,zone.polygon)||data.exclusions.some(z=>pointInPolygon(px,py,z.polygon)))continue;
   const key=Math.floor(px/34)+','+Math.floor(py/28);if(used.has(key))continue;
   const habitat=plantHabitat(px,py,hill,tile);let variant=zone.variants[Math.floor(random()*zone.variants.length)];
   if(habitat.shore)variant=0;
   if(habitat.wet){const dx=(px/tile-hill.cx)/hill.rx,dy=(py/tile-hill.cy)/hill.ry,r=Math.hypot(dx,dy),depth=Math.min(r-hill.inner,hill.outer-r)*Math.min(hill.rx,hill.ry)*tile;if(depth>24)continue;variant=0;}
   used.add(key);out.push({x:px,y:py,scale:zone.size[0]+random()*(zone.size[1]-zone.size[0]),phase:random()*Math.PI*2,variant,wet:habitat.wet,region:region.id,zone:zone.id});
  }
 }return out;
}

export function puddleHabitat(x,y,w){
 const at=(px,py)=>{let u=(px-w.x)/w.w+.5,v=(py-w.y)/w.h+.5;if(w.flip<0)u=1-u;if(u<0||u>=1||v<0||v>=1)return false;const i=(Math.floor(v*64)*64+Math.floor(u*64))*4,d=w.mask;return d[i+1]-d[i]>4&&Math.max(d[i],d[i+1],d[i+2])<87&&d[i+3]>50;};
 const wet=at(x,y),shore=wet||[-36,0,36].some(dx=>[-16,0,16].some(dy=>at(x+dx,y+dy)));
 return {wet,shore,deep:wet&&[[-24,0],[24,0],[0,-24],[0,24]].every(([dx,dy])=>at(x+dx,y+dy))};
}
