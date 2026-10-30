const rectPoly=r=>[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}];
const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
const area=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y;},0)/2;
const valid=p=>Array.isArray(p)&&p.length>=3&&p.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))&&Math.abs(area(p))>0;
const clean=p=>{const out=p.filter((v,i)=>i===0||v.x!==p[i-1].x||v.y!==p[i-1].y);if(out.length>1&&out[0].x===out.at(-1).x&&out[0].y===out.at(-1).y)out.pop();return out;};
const bounds=p=>{const x=Math.min(...p.map(v=>v.x)),y=Math.min(...p.map(v=>v.y));return {x,y,width:Math.max(...p.map(v=>v.x))-x,height:Math.max(...p.map(v=>v.y))-y};};
function half(p,a,b,sign,inside){
 const out=[];for(let i=0;i<p.length;i++){
  const s=p[i],e=p[(i+1)%p.length],ds=cross(a,b,s)*sign,de=cross(a,b,e)*sign,si=inside?ds>=0:ds<=0,ei=inside?de>=0:de<=0;
  if(si)out.push(s);if(si!==ei){const t=ds/(ds-de);out.push({x:s.x+(e.x-s.x)*t,y:s.y+(e.y-s.y)*t});}
 }return clean(out);
}
function intersect(a,b){if(!valid(a)||!valid(b))return [];let p=a;const sign=Math.sign(area(b));for(let i=0;i<b.length&&valid(p);i++)p=half(p,b[i],b[(i+1)%b.length],sign,true);return valid(p)?p:[];}
function subtract(a,b){if(!valid(a))return [];if(!valid(b))return [a];let remainder=a;const out=[],sign=Math.sign(area(b));for(let i=0;i<b.length&&valid(remainder);i++){
 const outside=half(remainder,b[i],b[(i+1)%b.length],sign,false);if(valid(outside))out.push(outside);
 remainder=half(remainder,b[i],b[(i+1)%b.length],sign,true);
 }return out;
}
module.exports={rectPoly,valid,bounds,area,intersect,subtract};
