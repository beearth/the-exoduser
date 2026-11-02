// The native GPU proxy sends CanvasPattern/gradient fallbacks to its separate
// text canvas. At this environment-only boundary those pixels must enter the
// same lighting/forest composition as the map, before native actors and HUD.
export function consumeEnvironmentOverlay(ctx,overlay,view,flush){
 if(!overlay||!overlay.width||!overlay.height)return false;
 const paint=overlay.getContext('2d');if(!paint)return false;
 overlay._glVer=(overlay._glVer||0)+1;
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.drawImage(overlay,view.x,view.y,view.w,view.h);ctx.restore();
 flush?.();
 paint.save();paint.setTransform(1,0,0,1,0,0);paint.clearRect(0,0,overlay.width,overlay.height);paint.restore();
 return true;
}
