export function heightRay(origin,direction,height,minHeight,maxHeight){
 if(direction.y>=-1e-7)return null;
 let near=Math.max(0,(maxHeight-origin.y)/direction.y),far=(minHeight-origin.y)/direction.y;
 if(far<near)return null;
 for(let i=0;i<24;i++){
  const t=(near+far)/2,x=origin.x+direction.x*t,z=origin.z+direction.z*t,y=origin.y+direction.y*t;
  if(y>height(x,z))near=t;else far=t;
 }
 const t=(near+far)/2;return {x:origin.x+direction.x*t,y:origin.y+direction.y*t,z:origin.z+direction.z*t};
}
