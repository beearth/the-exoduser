// Presentation clocks only. Collision, damage, AI, inventory and saves remain in Core.
export function presentationActors(slots){return slots.filter(Boolean);}
export function renderFrame(adapter,native,advance){
  if(adapter?.render()===true){advance();return true;}
  native();return false;
}
export function advancePresentation(s){
  const dt=s.dt||0;
  for(const [list,frame,period,max]of [[s.vfx,'frame',null,null],[s.fire,'frame',null,null],[s.fx,'f',8,s.fxFrames]]){
    if(!list)continue;let w=0;
    for(const v of list){
      if(v.bornGameTime!==undefined)v[frame]=Math.floor(Math.max(0,(s.gameTime-v.bornGameTime)/s.step/v.frameTime));
      else{v.t=(v.t||0)+(frame==='f'?1:dt);if(v.t>=(period||v.frameTime)){v.t=0;v[frame]++;}}
      if(v[frame]<(max||v.maxFrames))list[w++]=v;
    }
    list.length=w;
  }
  if(s.tvfx2){let w=0;for(const v of s.tvfx2){if(v.delay>0){v.delay--;s.tvfx2[w++]=v;continue;}if(v.radial)continue;v.t++;v.timer++;if(v.timer>=v.spd){v.timer=0;v.frame++;}if(v.frame<v.total)s.tvfx2[w++]=v;}s.tvfx2.length=w;}
  if(s.tvfxActive){let w=0;for(const v of s.tvfxActive){v.t++;if(v.t<=v.maxT)s.tvfxActive[w++]=v;}s.tvfxActive.length=w;}
  if(s.flash)s.flash.a=Math.max(0,s.flash.a-.08*dt);
  if(s.speedLines)s.speedLines.active=Math.max(0,s.speedLines.active-dt);
  if(s.G){
    s.G._flashT=Math.max(0,(s.G._flashT||0)-dt);s.G._chromaT=Math.max(0,(s.G._chromaT||0)-dt);
    if(s.G._chainArcs){let w=0;for(const a of s.G._chainArcs){a.t+=dt;if(a.t<a.maxT)s.G._chainArcs[w++]=a;}s.G._chainArcs.length=w;}
  }
  if(s.player?._esAnim){const a=s.player._esAnim;a.tmr=(a.tmr||0)+1;if(a.tmr>=2){a.tmr=0;a.fr++;}if(a.fr>=s.esFrames)s.player._esAnim=null;}
}
