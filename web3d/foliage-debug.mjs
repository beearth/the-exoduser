export function drawFoliageDebug(ctx,data,view){
 ctx.save();ctx.lineWidth=2;ctx.font='12px sans-serif';
 for(const region of data.regions)for(const zone of region.zones){
  const xs=zone.polygon.map(p=>p[0]),ys=zone.polygon.map(p=>p[1]);
  if(Math.max(...xs)<view.x||Math.min(...xs)>view.x+view.w||Math.max(...ys)<view.y||Math.min(...ys)>view.y+view.h)continue;
  ctx.beginPath();zone.polygon.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();
  ctx.globalAlpha=.17;ctx.fillStyle=zone.aquatic?'#97c7cb':'#c2b876';ctx.fill();ctx.globalAlpha=.75;ctx.strokeStyle=zone.aquatic?'#a5c9cd':'#c9c193';ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle='#e0dcc9';ctx.fillText(region.id+'/'+zone.id,Math.min(...xs),Math.min(...ys));
 }
 for(const zone of data.exclusions){ctx.beginPath();zone.polygon.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();ctx.globalAlpha=.6;ctx.strokeStyle='#899ec7';ctx.stroke();}
 ctx.restore();
}
