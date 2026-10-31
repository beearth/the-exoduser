// Presentation-only data. No native random numbers, map writes or collision changes.
export function seeded(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
export function foliageLayout(map,tile=40,seed=1){
  const random=seeded(seed),out=[],height=map.length,width=map[0]?.length||0;
  for(let y=2;y<height-2;y+=5)for(let x=2;x<width-2;x+=5){
    let open=false,wall=false;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const v=map[y+dy]?.[x+dx];if(v===0)open=true;if(v===1)wall=true;
    }
    if(!open||!wall)continue;
    out.push({x:(x+.5)*tile+(random()-.5)*tile,y:(y+.5)*tile+(random()-.5)*tile,scale:.72+random()*.5,phase:random()*Math.PI*2});
  }
  return out;
}
export function waterAt(x,y,h,tile=40){
  if(!h)return false;
  const rampT=Math.max(0,Math.min(1,(x/tile-h.rampX0)/(h.rampX1-h.rampX0)));
  if(x/tile>=h.rampX0&&x/tile<=h.rampX1&&Math.abs(y/tile-h.rampY)<h.rampHalf0+(h.rampHalf1-h.rampHalf0)*rampT+.12)return false;
  const px=(x/tile-h.cx)/h.rx,py=(y/tile-h.cy)/h.ry,a=Math.atan2(py,px),r=Math.hypot(px,py);
  const wob=.006*Math.sin(a*3+1.3)+.004*Math.sin(a*7-.4)+.002*Math.sin(a*13+2.1);
  return r>h.inner+.018+wob&&r<h.outer-.018+wob;
}
