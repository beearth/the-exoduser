// Presentation-only data. No native random numbers, map writes or collision changes.
export function seeded(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
// The native GPU proxy has translate/rotate/scale, but no transform().
// Signed SVD composes an affine matrix with those supported operations.
export function applyAffine(ctx,a,b,c,d,e=0,f=0){
  const theta=.5*Math.atan2(2*(a*b+c*d),a*a+c*c-b*b-d*d),co=Math.cos(theta),si=Math.sin(theta);
  const x=co*a+si*b,y=co*c+si*d,sx=Math.hypot(x,y),sy=sx?(a*d-b*c)/sx:0;
  ctx.translate(e,f);ctx.rotate(theta);ctx.scale(sx,sy);ctx.rotate(Math.atan2(-y,x));
}
export function foliageLayout(map,tile=40,seed=1){
  const random=seeded(seed),out=[],height=map.length,width=map[0]?.length||0;
  for(let y=2;y<height-2;y+=5)for(let x=2;x<width-2;x+=5){
    let open=false,wall=false;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const v=map[y+dy]?.[x+dx];if(v===0)open=true;if(v===1)wall=true;
    }
    if(!open||!wall)continue;
    const cx=(x+.5)*tile,cy=(y+.5)*tile;
    for(let k=0;k<3;k++){
      const px=cx+(random()-.5)*tile*1.7,py=cy+(random()-.5)*tile*.9;
      out.push({x:px,y:py,scale:k===0?.86+random()*.32:.42+random()*.35,phase:random()*Math.PI*2,variant:Math.floor(random()*4)});
    }
  }
  return out;
}
// A terrestrial crown must not overhang the water even when its root is dry.
// Both banks and the west land crossing share the exact original water contract.
export function plantHabitat(x,y,h,tile=40){
  const wet=waterAt(x,y,h,tile),shore=wet||[-36,0,36].some(dx=>[-16,0,16].some(dy=>waterAt(x+dx,y+dy,h,tile)));
  return {wet,shore,variant:shore?0:null};
}
// Height-only oblique projection. The native ground plane, input ray and actors
// retain their projection; the root is invariant under this affine transform.
export function objectRelief(o,m,hero,time=0){
  if(!m||m.sheet||m.anim||m.touchAnim||m.trackEye||!(/tree|rock|bone|cliff|wall|stump/.test(o.type)||m.occ))return null;
  const size=(m.sz||32)*(o.scale||1);if(size<120)return null;
  const foot=o.y+size*(m.footYF??.28),tree=/tree/.test(o.type);
  const parallax=Math.max(-1,Math.min(1,(o.x-hero.x)/1400))*.018;
  return {foot,shear:parallax+(tree?Math.sin(time*.48+o.x*.003+o.y*.002)*.0035:0),lift:tree?1.045:1.025};
}
export function waterAt(x,y,h,tile=40){
  if(!h)return false;
  const rampT=Math.max(0,Math.min(1,(x/tile-h.rampX0)/(h.rampX1-h.rampX0)));
  if(x/tile>=h.rampX0&&x/tile<=h.rampX1&&Math.abs(y/tile-h.rampY)<h.rampHalf0+(h.rampHalf1-h.rampHalf0)*rampT+.12)return false;
  const px=(x/tile-h.cx)/h.rx,py=(y/tile-h.cy)/h.ry,a=Math.atan2(py,px),r=Math.hypot(px,py);
  const wob=.006*Math.sin(a*3+1.3)+.004*Math.sin(a*7-.4)+.002*Math.sin(a*13+2.1);
  return r>h.inner+.018+wob&&r<h.outer-.018+wob;
}
