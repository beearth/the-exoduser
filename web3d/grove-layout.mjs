function distanceToSegment(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);}
export function inTravelLane(x,y,lanes,padding=0){return lanes.some(l=>l.points.slice(1).some((p,i)=>distanceToSegment(x,y,l.points[i],p)<l.halfWidth+padding));}
// Fixed composition on authored shoulders. No random scatter and no map writes.
export function groveLayout(data){
 const out=[];let n=0;
 for(const r of data.regions)for(const band of r.bands){const [x0,y0,x1,y1]=band.rect;let row=0;
  for(let y=y0;y<=y1;y+=band.step[1],row++)for(let x=x0+(row%2)*band.step[0]*.46;x<=x1;x+=band.step[0]){
   const px=x+[0,-39,24,51,-28,15,-46][(row+Math.floor(x/170))%7],py=y+[0,37,-26,18,-41][Math.floor(x/170)%5];
   if(inTravelLane(px,py,data.lanes,28)||data.exclusions.some(e=>Math.hypot((px-e.x)/e.rx,(py-e.y)/e.ry)<1))continue;
   const i=n++;let kind=i%29===0?'bone':i%7===0?'root':i%4===0?'roots':'base'+(1+(i*7+row*3)%12);
   const scale=[1,.79,1.23,.91,1.08,.84,1.17][i%7]*(kind==='bone'?.30:kind==='root'?.95:1.48);
   // Composites interlock with unequal proportions; small bones stay subordinate.
   out.push({id:r.id+'_'+i,x:px,y:py,width:band.size[0]*scale,height:band.size[1]*scale*(kind.startsWith('base')?.52:.75)*[1,.88,1.12,.96][i%4],asset:kind,flip:(i%3)===0,phase:i*2.399,region:r.id,reason:band.reason,sway:kind.startsWith('base')?2:0});
  }
 }return out;
}
