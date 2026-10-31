// Presentation coordinates only. Positive distance is OUTSIDE the authored boundary.
export function boundaryFrame(anchors,i,t=.5){
 const a=anchors.boundary[i],b=anchors.boundary[(i+1)%anchors.boundary.length],s=anchors.tile_size;
 const dx=(b[0]-a[0])*s,dy=(b[1]-a[1])*s,len=Math.hypot(dx,dy);
 return {x:(a[0]+(b[0]-a[0])*t)*s,y:(a[1]+(b[1]-a[1])*t)*s,nx:-dy/len,ny:dx/len,dx:dx/len,dy:dy/len,len};
}
export function signedBoundaryDistance(x,y,anchors){
 let inside=false,d=Infinity;const pts=anchors.boundary,s=anchors.tile_size;
 for(let i=0,j=pts.length-1;i<pts.length;j=i++){
  const [ax,ay]=pts[j].map(v=>v*s),[bx,by]=pts[i].map(v=>v*s);
  if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
  d=Math.min(d,Math.hypot(x-ax-dx*t,y-ay-dy*t));
 }return inside?-d:d;
}
export function forestLayout(data,anchors){
 const low=data.lowMass.map(p=>({...p}));
 const trees=data.groves.filter(p=>signedBoundaryDistance(p.x,p.y,anchors)>40).map(p=>({...p}));
 return {low,trees};
}

