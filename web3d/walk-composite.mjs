export function compositeBounds(body,bodyBounds,walk,walkBounds){
 const sx=body.w/walk.w,sy=body.h/walk.h;
 const x=body.x+(walkBounds.x-walk.x)*sx,y=body.y+(walkBounds.y-walk.y)*sy;
 const left=Math.min(bodyBounds.x,x),top=Math.min(bodyBounds.y,y);
 return {x:left,y:top,w:Math.max(bodyBounds.x+bodyBounds.w,x+walkBounds.w*sx)-left,h:Math.max(bodyBounds.y+bodyBounds.h,y+walkBounds.h*sy)-top};
}
