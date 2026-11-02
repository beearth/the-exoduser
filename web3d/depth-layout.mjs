// Native sprite coordinates, never collision geometry or actor state.
export function objectVolume(o,m,image){
 if(!m||!Number.isFinite(o.x)||!Number.isFinite(o.y))return null;
 const tall=m.occ||/tree|rock|cliff|wall|altar|totem|arch/.test(o.type);
 const size=(m.sz||32)*(o.scale||1);if(!tall||size<120)return null;
 const ar=m.keepAR&&!m.squareDraw?(m.sourceSize?.[0]||image?.naturalWidth||1)/(m.sourceSize?.[1]||image?.naturalHeight||1):1;
 let w=size*Math.min(1,ar),h=size/Math.max(1,ar),px=m.pivotX??.5,py=m.pivotY??.5;
 if(o.type==='m_c1tree'&&o._hand){w*=.72;h*=.72;py=.72;}
 const foot=o.y+size*(m.footYF??(m.anchorBottom?0:.28));
 const pad=Math.max(24,size*.075);
 return {object:o,foot,left:o.x-w*px-pad,right:o.x+w*(1-px)+pad,top:o.y-h*py-pad,bottom:o.y+h*(1-py)+pad};
}
export function actorBounds(a){
 const w=a._web3dHero?80:Math.max(96,(a.r||20)*5),h=a._web3dHero?124:Math.max(160,(a.r||20)*7);
 return {left:a.x-w/2,right:a.x+w/2,top:a.y-h*.8,bottom:a.y+h*.3};
}
export function occlusion(v,actors){
 let hidden=false;const front=[];
 for(const a of actors){if(!a||a.alive===false||a.hp<=0)continue;const b=actorBounds(a);
  if(b.right<=v.left||b.left>=v.right||b.bottom<=v.top||b.top>=v.bottom)continue;
  if(a.y<v.foot)hidden=true;else front.push(b);
 }
 return {alpha:hidden?.35:1,front};
}
export const compareDepth=(a,b)=>a.foot-b.foot||a.left-b.left;
export function shadowVector(position,light){
 const dx=light?position[0]-light[0]:1,dy=light?position[1]-light[1]:1,d=Math.hypot(dx,dy)||1;
 return [dx/d,dy/d];
}
export const shadowAffine=([dx,dy])=>[dy,-dx,-dx*.88,-dy*.6];
